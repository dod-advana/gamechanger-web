const SearchUtility = require('../../utils/searchUtility');
const CONSTANTS = require('../../config/constants');
const { DataLibrary} = require('../../lib/dataLibrary');
const GraphHandler = require('../base/graphHandler');
const redisAsyncClientDB = 8;
const { DataTrackerController } = require('../../controllers/dataTrackerController');

class PolicyGraphHandler extends GraphHandler {
	constructor(opts = {}) {
		const {
			searchUtility = new SearchUtility(opts),
			constants = CONSTANTS,
			dataLibrary = new DataLibrary(opts),
			dataTracker = new DataTrackerController(opts)
		} = opts;
		super({redisClientDB: redisAsyncClientDB, ...opts});

		this.searchUtility = searchUtility;
		this.constants = constants;
		this.dataLibrary = dataLibrary;
		this.dataTracker = dataTracker;
		this.error = {};
	}

	async searchHelper(req, userId) {
		const {
			cloneData = {},
			forCacheReload = false,
			useGCCache,
			includeRevoked,
			searchFields,
			orgFilter,
			loadAll
		} = req.body;

		const permissions = req.permissions ? req.permissions : [];

		try {
			const cloneSpecificObject = { orgFilter, searchFields: Object.values(searchFields), includeRevoked };

			if (!forCacheReload && useGCCache) {
				return await this.getCachedResults(req, cloneSpecificObject, userId);
			}

			// get results
			const { isTest = false, expandTerms = false, searchText } = req.body;

			const gT0 = new Date().getTime();
			req.body.questionFlag = this.searchUtility.isQuestion(searchText)
			const [parsedQuery, parsedTerms] = this.searchUtility.getEsSearchTerms(req.body);
			req.body.searchTerms = parsedTerms;
			req.body.parsedQuery = parsedQuery;
			req.body.limit = 10000;
			req.body.storedFields = [
				'id',
				'doc_type',
				'doc_num',
				'display_doc_type_s',
				'display_org_s',
				'display_title_s',
				'ref_list',
				'pagerank_r'
			]
			req.body.includeHighlights = false;

			//const esQuery = this.getElasticsearchQueryForGraph(req.body, userId);
			const esQuery = this.searchUtility.getElasticsearchQuery(req.body, userId);
			let clientObj = this.searchUtility.getESClient(cloneData.clone_name, permissions);

			let esResults = await this.dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery, userId);
		
			// const searchResults = this.searchUtility.cleanUpIdEsResults(esResults, parsedTerms, userId, expandTerms);
			const searchResults = this.cleanUpEsResultsForGraph(esResults, parsedTerms, userId, expandTerms);

			// const gT1 = new Date().getTime();

			// const { docIds, pubIds, searchTerms } = searchResults;
			const { docs, searchTerms, totalCount } = searchResults;

			let results = {};
			let query = '';
			let params = [];
			let limit;

			if (totalCount <= this.constants.GRAPH_CONFIG.PULL_NODES_FROM_NEO4J_MAX_LIMIT) {
				// pull nodes from neo4j (this is slow, hence the limit)
				const docIds = searchResults.docs.map((doc) => doc.doc_id);
				[results, query, params] = await this.getGraphData(
					`MATCH (d:Document) WHERE d.doc_id in $ids
					OPTIONAL MATCH pt=(d)-[ref:REFERENCES]->(d2:Document)
					WHERE NOT d = d2 AND d2.doc_id in $ids
					RETURN d, pt;`,
					{ids: docIds}, isTest, userId
				);
			} else {
				// mock nodes from elastic results
				if (totalCount > this.constants.GRAPH_CONFIG.GRAPH_VIEW_NODES_DISPLAYED_WARNING_LIMIT) {
					// return only the top GRAPH_VIEW_NODES_DISPLAYED_WARNING_LIMIT results, sorted by page rank
					const docIDsSortedByPageRank = this.createMockGraphReturnFromEsResults(docs, userId)
						.nodes.sort((a, b) => b.pageRank - a.pageRank)
						.map(node => node.doc_id)
						.slice(0, loadAll ? this.constants.GRAPH_CONFIG.MAX_GRAPH_VIEW_NODES_DISPLAYED : this.constants.GRAPH_CONFIG.GRAPH_VIEW_NODES_DISPLAYED_WARNING_LIMIT);
					results = this.createMockGraphReturnFromEsResults(docs.filter(doc => docIDsSortedByPageRank.includes(doc.doc_id)), userId);
					limit = loadAll ?
						{ maxLimit: this.constants.GRAPH_CONFIG.MAX_GRAPH_VIEW_NODES_DISPLAYED } :
						{ warningLimit: this.constants.GRAPH_CONFIG.GRAPH_VIEW_NODES_DISPLAYED_WARNING_LIMIT }
				} else {
					results = this.createMockGraphReturnFromEsResults(docs, userId);
				}
				query = 'Mocked from ES';
				params = [];
			}

			// const [results, query, params] = await this.getGraphData(
			// 	`MATCH (d:Document) WHERE d.doc_id in $ids
			// 	OPTIONAL MATCH pt=(d)-[ref:REFERENCES]->(d2:Document)
			// 	WHERE NOT d = d2 AND d2.doc_id in $ids
			// 	RETURN d, pt;`,
			// 	{ids: docIds, pub_ids: pubIds}, isTest, userId
			// );

			// console.log(`Time for ES Search = ${(gT1 - gT0) / 1000}`);
			// const gT2 = new Date().getTime();
			// console.log(`Time for Graph Query = ${(gT2 - gT1) / 1000}`);

			const graphData = { graphData: results, searchTerms };

			this.addDocIdsToPubs(graphData.graphData, userId);

			// await this.render2dNodeLocations(graphData.graphData.nodes, graphData.graphData.edges, userId);
			// graphData.graphData.nodes.forEach(node => {
			// 	node.coords2d = { fx: node.x, fy: node.y };
			// 	// node.x = 0;
			// 	// node.vx = 0;
			// 	// node.y = 0;
			// 	// node.vy = 0;
			// });

			// const gT3 = new Date().getTime();
			// console.log(`Time for Overall = ${(gT3 - gT0) / 1000}`);

			// try to store to cache
			if (useGCCache && graphData) {
				await this.storeCachedResults(req, graphData, cloneSpecificObject, userId);
			}

			graphData.query = {query, params, limit};

			return graphData;

		} catch (err) {
			if (!forCacheReload){
				const { message } = err;
				this.logger.error(message, 'E08YH0S', userId);
				return { graphData: {}, searchTerms: [] };
			}
			throw err;
		}
	}

	async queryHelper(req, userId, code) {
		let tmpCode = 'V7IUJNL';
		let graphData = { nodes: [], edges: [], labels: [], relationships: [], nodeProperties: [], relProperties: [] };

		try {
			const { code, query, params, isTest = false } = req.body;
			tmpCode = code || tmpCode;

			const [graphData] = await this.getGraphData(query, params, isTest, userId);
			graphData.query = {query, params};
			return graphData;
		} catch (err) {
			const { message } = err;
			this.logger.error('DETECTED ERROR:', message, tmpCode, userId);
			this.error.category = 'Neo4j';
			this.error.code = tmpCode;
			return graphData;
		}
	}

	async callFunctionHelper(req, userId) {
		const {functionName} = req.body;

		switch (functionName) {
			case 'getDataForSearch':
				return await this.getDataForSearchHelper(req, userId);
			case 'getDocumentsForEntity':
				return await this.getDocumentsForEntityHelper(req, userId);
			case 'getDocumentsForTopic':
				return await this.getDocumentsForTopicHelper(req, userId);
			case 'getSingleDocument':
				return await this.getSingleDocumentHelper(req, userId);
			case 'getDocumentDetailsPageDataFull':
				return await this.getDocumentDetailsPageDataFullHelper(req, userId);
			case 'getEntityDataDetailsPage':
				return await this.getEntityDataDetailsPageHelper(req, userId);
			case 'getTopicDataDetailsPage':
				return await this.getTopicDataDetailsPageHelper(req, userId);
			case 'getTopicDataPolicyGraph':
				return await this.getTopicDataPolicyGraphHelper(req, userId);
			case 'getReferencesPolicyGraph':
				return await this.getReferencesPolicyGraphHelper(req, userId);
			case 'getEntitiesForNode':
				return await this.getEntitiesForNodeHelper(req, userId);
			case 'getTopicsForNode':
				return await this.getTopicsForNodeHelper(req, userId);
			case 'getGraphSchema':
				return await this.getGraphSchemaHelper(req, userId);
			case 'getTopicCardData':
				return await this.getTopicCardDataHelper(req, userId);
			default:
				this.logger.error(
					`There is no function called ${functionName} defined in the policyGraphHandler`,
					'8ZLENZO',
					userId
				);
		}
	}
	
	async getReferencesPolicyGraphHelper(req, userId) {
		try {
			const { ref_name, isUnknown, isTest = false } = req.body;
			
			const [refData] = await this.getGraphData(
				`MATCH ref = (d:Document)<-[:${isUnknown ? 'REFERENCES_UKN' : 'REFERENCES'}]-(d2:${isUnknown ? 'UKN_Document' : 'Document'})
				WHERE d2.ref_name = $ref_name AND NOT d = d2
				RETURN ref;`, {ref_name: ref_name}, isTest, userId
			);
			
			return refData;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, '9F2QSP6', userId);
			return message;
		}
	}
	
	async getTopicCardDataHelper(req, userId) {
		try {
			const { topicName, isTest = false } = req.body;
			
			const data = {};

			const [topicData] = await this.getGraphData(
				`MATCH (n:Topic)-[:IS_IN]->(d:Document)
				WHERE n.name = $name
				WITH COUNT(d) as docs, collect(d.doc_id) as doc_ids
				return sum(docs) as doc_count, doc_ids;`, {name: topicName}, isTest, userId
			);
			
			const { doc_count, doc_ids } = topicData;
		
			const convertedIds = doc_ids.map(docId => {
				return docId.replace(/'/g, '');
			});
			
			const [entityData] = await this.getGraphData(
				`MATCH (d:Document)-[m:MENTIONS]->(e:Entity)
				WHERE d.doc_id in $ids AND EXISTS(e.aliases)
				WITH e
				MATCH (e)<-[:MENTIONS]-(d:Document)
				WHERE d.doc_id in $ids
				RETURN e as node, count(d) as entityScore, count(e) as mentions
				ORDER BY mentions DESC LIMIT 10;`, {ids: convertedIds}, isTest, userId
			);
			
			data.doc_count = doc_count;
			data.entityData = entityData;
			
			return data;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, '25QQM71', userId);
			return message;
		}
	}
	
	async getGraphSchemaHelper(req, userId) {
		try {
			const { isTest = false } = req.body;
			
			const data = {};

			const [schemaData] = await this.getGraphData(
				'CALL apoc.meta.schema() YIELD value as schemaMap ' +
					'UNWIND keys(schemaMap) as label ' +
					'WITH label, schemaMap[label] as data ' +
					'WHERE data.type = "node" OR data.type = "relationship" ' +
					'UNWIND keys(data.properties) as property ' +
					'WITH label, property, data.properties[property] as propData ' +
					'RETURN label, ' +
					'property, ' +
					'propData.type as type, ' +
					'propData.indexed as primary_key;', {}, isTest, userId
			);
			
			const [graphData] = await this.getGraphData(
				'call apoc.meta.graph', {}, isTest, userId
			);
			
			const [statData] = await this.getGraphData(
				'CALL apoc.meta.stats() YIELD labels, relTypesCount', {}, isTest, userId
			);
			
			data.schema = schemaData;
			data.graph = graphData;
			data.stats = statData;
			
			return data;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, '25QQM71', userId);
			return message;
		}
	}
	
	async getEntitiesForNodeHelper(req, userId) {
		try {
			const { doc_id, isTest = false } = req.body;

			const [graphData] = await this.getGraphData(
				'MATCH pt=(d:Document)-[m:MENTIONS]->(e:Entity) ' +
				'WHERE d.doc_id = $doc_id ' +
				'RETURN pt;', {doc_id: doc_id}, isTest, userId
			);
			
			return graphData;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, '5T6H86X', userId);
			return message;
		}
	}
	
	async getTopicsForNodeHelper(req, userId) {
		try {
			const { doc_id, isTest = false } = req.body;

			const [graphData] = await this.getGraphData(
				'MATCH mt = (d:Document)-[c:CONTAINS]->(:Topic) ' +
				'WHERE d.doc_id = $doc_id RETURN mt;', {doc_id: doc_id}, isTest, userId
			);
			
			return graphData;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, '5YPYYUX', userId);
			return message;
		}
	}
	
	async getTopicDataPolicyGraphHelper(req, userId) {
		try {
			const { topicName, isTest = false } = req.body;
			
			const data = {};

			const topicDocumentCount = this.getGraphData(
				`MATCH (t:Topic) where t.name = $name
				OPTIONAL MATCH (t) <-[:CONTAINS]-(d:Document)-[:CONTAINS]->(t2:Topic)
				RETURN t2.name as topic_name, count(distinct d) as doc_count
				ORDER BY doc_count DESC LIMIT 5;`, {name: topicName}, isTest, userId
			);
			
			const documentCount = this.getGraphData(
				`MATCH (t:Topic) where t.name = $name
				OPTIONAL MATCH (t) <-[:CONTAINS]-(d:Document)
				RETURN count(distinct d) as doc_count`, {name: topicName}, isTest, userId
			);
			
			const results = await Promise.all([topicDocumentCount, documentCount]);
			
			data.relatedTopics = results[0][0];
			data.documentCountData = results[1][0];
			
			return data;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, '7GWYH85', userId);
			return message;
		}
	}
	
	async getTopicDataDetailsPageHelper(req, userId) {
		try {
			const { topicName, isTest = false } = req.body;
			
			const data = {};

			const [topicData] = await this.getGraphData(
				'MATCH (t:Topic) WHERE t.name = $name ' +
				'WITH t MATCH (d:Document)-[:CONTAINS]->(t) ' +
				'RETURN t as topic, count(distinct d) as documentCountsForTopic;', {name: topicName}, isTest, userId
			);
			
			data.topicData = topicData;
			
			const [graphData] = await this.getGraphData(
				'OPTIONAL MATCH pt=(d:Document)-[c:CONTAINS]->(t:Topic) ' +
			'WHERE t.name = $name ' +
			'RETURN distinct pt LIMIT 1000;', {name: topicName}, isTest, userId
			);
			
			data.graph = graphData
			
			return data;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'XAXUO60', userId);
			return message;
		}
	}
	
	async getEntityDataDetailsPageHelper(req, userId) {
		try {
			const { entityName, isTest = false } = req.body;
			
			const data = {};

			const [entData, entQuery, entParams] = await this.getGraphData(
				`MATCH (e:Entity) WHERE e.name = $name RETURN e;`, {name: entityName}, isTest, userId
			);
			
			data.nodes = entData.nodes;
			
			const [graphData] = await this.getGraphData(
				'OPTIONAL MATCH pc=(c:Entity)-[:CHILD_OF]-(:Entity) ' +
				'WHERE c.name = $name ' +
				'RETURN distinct pc limit 1000;', {name: entityName}, isTest, userId
			);
			
			data.graph = graphData
			
			return data;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'SLYZBZ5', userId);
			return message;
		}
	}
	
	async getDocumentDetailsPageDataFullHelper(req, userId) {
		try {
			const { doc_id, isTest = false } = req.body;
			
			const resps = await Promise.all([
				this.getGraphData(
					'MATCH (d:Document) ' +
					'WHERE d.doc_id = $doc_id ' +
					'OPTIONAL MATCH pt=(d)-[:SIMILAR_TO]->(d2:Document) ' +
					'WHERE d2.is_revoked_b = false ' +
					'RETURN distinct pt;', {doc_id}, isTest, userId
				),
				this.getGraphData(
					'MATCH (d:Document) ' +
					'WHERE d.doc_id = $doc_id ' +
					'OPTIONAL MATCH pt=(d)-[:REFERENCES]-(d2:Document) ' +
					'WHERE NOT d = d2 AND d2.is_revoked_b = false ' +
					'RETURN distinct pt;', {doc_id}, isTest, userId
				),
				this.getGraphData(
					'MATCH (d:Document) ' +
					'WHERE d.doc_id = $doc_id ' +
					'OPTIONAL MATCH pt=(d)-[:REFERENCES_UKN]-(d2:UKN_Document) ' +
					'WHERE NOT d = d2 ' +
					'RETURN distinct pt;', {doc_id}, isTest, userId
				),
				this.getGraphData(
					'MATCH (d:Document) ' +
					'WHERE d.doc_id = $doc_id ' +
					'MATCH pt=(d)-[:CONTAINS]->(t:Topic) ' +
					'RETURN distinct pt;', {doc_id}, isTest, userId
				),
				this.getGraphData(
					'MATCH (d:Document) ' +
					'WHERE d.doc_id = $doc_id ' +
					'MATCH pt=(d)-[:MENTIONS]->(e:Entity) ' +
					'RETURN distinct pt;', {doc_id}, isTest, userId
				)
			]);
			
			const graph = {nodes: [], edges: [], labels: []};
			const nodeIds = [];
			const edgeIds = [];
			resps.forEach(resp => {
				resp[0].labels.forEach(label => {
					if (!graph.labels.includes(label)) {
						graph.labels.push(label);
					}
				})
				resp[0].nodes.forEach(node => {
					if (!nodeIds.includes(node.id)) {
						graph.nodes.push(node);
						nodeIds.push(node.id);
					}
				});
				resp[0].edges.forEach(edge => {
					if (!edgeIds.includes(edge.id)) {
						// let source = edge.source;
						// let target = edge.target;
						// if (typeof source !== {}) {
						// 	source = graph.nodes.filter(node => {
						// 		return node.id === source;
						// 	})[0];
						// }
						// if (typeof target !== {}) {
						// 	target = graph.nodes.filter(node => {
						// 		return node.id === target;
						// 	})[0];
						// }
						// edge.source = source;
						// edge.target = target;
						graph.edges.push(edge);
						edgeIds.push(edge.id)
					}
				});
			});
			return {graph};
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'OHS2VPT', userId);
			return message;
		}
	}

	async getDataForSearchHelper(req, userId) {
		try {
			const permissions = req.permissions ? req.permissions : [];

			const {
				searchText,
				isTest = false,
				expandTerms = false,
				orgFilterQuery,
				orgFilterString,
				typeFilterString,
				index,
				searchFields,
				accessDateFilter,
				publicationDateFilter,
				cloneData = {},
				orgFilter,
				includeRevoked
			} = req.body;

			const searchBody = {
				searchText: searchText,
				limit: 200,
				index: index || this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.index,
				getIdList: true,
				expandTerms,
				orgFilterQuery,
				orgFilterString,
				typeFilterString,
				searchFields,
				accessDateFilter,
				publicationDateFilter,
				storedFields: ['id'],
				orgFilter,
				includeRevoked,
				paragraphLimit: 1,
				hasHighlights: false
			};

			// const gT0 = new Date().getTime();
			searchBody.questionFlag = this.searchUtility.isQuestion(searchText)
			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms(searchBody);
			searchBody.searchTerms = searchTerms;
			searchBody.parsedQuery = parsedQuery;
			
			const esQuery = this.searchUtility.getElasticsearchQuery(searchBody, userId);

			let clientObj = this.searchUtility.getESClient(cloneData.clone_name, permissions);

			const esResults = await this.dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery);

			if (esResults?.body?.hits?.total?.value > 0) {

				const {docIds} = this.searchUtility.cleanUpIdEsResults(esResults, searchTerms, userId, []);

				const convertedIds = docIds.map(docId => {
					return docId.replace(/'/g, '');
				});

				// const gT1 = new Date().getTime();

				try {

					const [entityResp, entityQuery, entityParams] = await this.getGraphData(`
						MATCH (d:Document)-[m:MENTIONS]->(e:Entity)
						WHERE d.doc_id in $ids AND EXISTS(e.aliases)
						WITH e
						MATCH (e)<-[:MENTIONS]-(d:Document)
						WHERE d.doc_id in $ids
						RETURN e as node, count(d) as entityScore, count(e) as mentions
						ORDER BY mentions DESC LIMIT 10;`, {ids: convertedIds}, isTest, userId
					);

					const entities = entityResp.nodes;

					const [topicResp, topicQuery, topicParams] = await this.getGraphData(`
						MATCH (d:Document)-[m:CONTAINS]->(t:Topic)
						WHERE d.doc_id in $ids
						WITH t
						MATCH (t)<-[:CONTAINS]-(d:Document)
						WHERE d.doc_id in $ids
						RETURN t as node, count(d) as topicScore
						ORDER BY topicScore DESC LIMIT 10;`, {ids: convertedIds}, isTest, userId
					);

					// const gT2 = new Date().getTime();

					// console.log(`Time for ES Search = ${(gT1 - gT0) / 1000}`);
					// console.log(`Time for Graph Query = ${(gT2 - gT1) / 1000}`);
					// console.log(`Time for Overall = ${(gT2 - gT0) / 1000}`);

					const topics = topicResp.nodes;
					return { entities: entities, topics: topics, entityQuery: {query: entityQuery, params: entityParams}, topicQuery: {query: topicQuery, params: topicParams} };
				} catch (err) {
					this.logger.error(`DETECTED ERROR: Error with Neo4j results: ${err}`, 'PUTA0E1', userId);
					this.error.category = 'Neo4j';
					this.error.code = 'PUTA0E1';
					return { entities: [], topics: [] };
				}
			} else {
				this.logger.error(`Error with Elasticsearch results`, 'V053I6O', userId);
				if (this.searchUtility.checkESResultsEmpty(esResults)) { this.logger.warn('Search has no hits') }
				return { entities: [], topics: [] };
			}
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'OAUHAL4', userId);
			return { entities: [], topics: [] };
		}
	}

	async getDocumentsForEntityHelper(req, userId) {
		try {
			const { entityName, isTest = false } = req.body;

			const [{ doc_ids }, query, params] = await this.getGraphData(
				`OPTIONAL MATCH (d:Document)-[m:MENTIONS]->(e:Entity) WHERE e.name = $entityName
					RETURN d.doc_id as doc_id, m.count as mentions
					ORDER BY mentions DESC LIMIT 100;`, {entityName: entityName}, isTest, userId
			);

			if (doc_ids[0].doc_id === null) {
				return {
					totalCount: 0,
					docs: []
				};
			}

			const docIds = doc_ids.map(docId => {
				return docId.doc_id;
			});

			req.body.docIds = docIds;

			// Get the full doc data from ES
			const docResp = await this.documentSearchUsingDocId(req, userId);

			docResp.docs.forEach(doc => {
				doc.mentions = doc_ids.filter(docId => {
					return docId.doc_id === doc.id;
				})[0].mentions;
			});

			docResp.docs.sort((a, b) => b.mentions - a.mentions);
			docResp.graphQuery = {query, params};

			return docResp;
		} catch (err) {
			const { message } = err;
			this.logger.error('DETECTED ERROR:', message, '594CVDD', userId);
			this.error.category = 'Neo4j';
			this.error.code = '594CVDD';
			return message;
		}
	}

	async getDocumentsForTopicHelper(req, userId) {
		try {
			// Get the full doc data from ES
			return await this.documentSearchUsingDocId(req, userId);
		} catch (err) {
			const { message } = err;
			this.logger.error(message, '21YDNTE', userId);
			return message;
		}
	}

	async getSingleDocumentHelper(req, userId) {
		try {
			// Get the full doc data from ES
			return await this.documentSearchUsingDocId(req, userId);
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'DA0JLHZ', userId);
			return message;
		}
	}

	async documentSearchUsingDocId(req, userId) {
		try {
			const permissions = req.permissions ? req.permissions : [];

			const { cloneName } = req.body;
			
			const [parsedQuery, searchTerms] = await this.searchUtility.getEsSearchTerms(req.body);
			req.body.searchTerms = searchTerms;
			req.body.parsedQuery = parsedQuery;

			const esQuery = this.searchUtility.getElasticsearchQuery(req.body, userId);

			let clientObj = this.searchUtility.getESClient(cloneName, permissions);

			const esResults = await this.dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery);

			if (esResults && esResults.body && esResults.body.hits && esResults.body.hits.total && esResults.body.hits.total.value && esResults.body.hits.total.value > 0) {

				const searchResults = this.searchUtility.cleanUpEsResults(esResults, searchTerms, userId, null, null, clientObj.esIndex, esQuery);
				// insert crawler dates into search results
				return await this.dataTracker.crawlerDateHelper(searchResults, userId);
			} else {
				this.logger.error('Error with Elasticsearch results', 'KN1XREP', userId);
				return { totalCount: 0, docs: [] };
			}

		} catch (err) {
			const msg = (err && err.message) ? `${err.message}` : `${err}`;
			this.logger.error(msg, 'STWEJSK', userId);
			throw msg;
		}
	}


	addDocIdsToPubs(graphData, user) {
		try {
			const pubDocs = {};
			const pubsIdx = [];
			graphData.nodes.forEach((node, idx) => {
				if (node.label === 'Publication' && !pubDocs.hasOwnProperty(node.name)) {
					pubDocs[node.name] = [];
					pubsIdx.push(idx);
				}

				if (node.label === 'Document') {
					const pubName = `${node.doc_type} ${node.doc_num}`;

					if (!pubDocs.hasOwnProperty(pubName)) {
						pubDocs[pubName] = [node.name];
					} else {
						pubDocs[pubName].push(node.name);
					}
				}
			});

			pubsIdx.forEach(idx => {
				graphData.nodes[idx].doc_ids = pubDocs[graphData.nodes[idx].name];
			});
		} catch (err) {
			this.logger.error(err, 'EZ6JDQS', user);
		}
	}

	cleanUpEsResultsForGraph(raw, searchTerms, user, expansionDict) {
		try {
			if (!raw.body || !raw.body.hits || !raw.body.hits.total || !raw.body.hits.total.value || raw.body.hits.total.value === 0) {
				return { totalCount: 0, docs: [] };
			}

			let results = {};

			results.totalCount = raw.body.hits.total.value;
			results.docs = [];

			raw.body.hits.hits.forEach((r) => {
				let result = this.searchUtility.transformEsFields(r.fields);
				results.docs.push({
					doc_id: result.id,
					doc_type: result.doc_type,
					doc_num: result.doc_num,
					display_title_s: result.display_title_s,
					display_org_s: result.display_org_s,
					display_doc_type_s: result.display_doc_type_s,
					ref_list: result.ref_list,
					pagerank_r: result.pagerank_r,
					ref_name: `${result.doc_type} ${result.doc_num}`
				});
			});

			results.searchTerms = searchTerms;
			results.expansionDict = expansionDict;

			return results;
		} catch (err) {
			this.logger.error(err, 'BG9peM4', user);
		}
	}

	createMockGraphReturnFromEsResults(docs, userId) {
		try {
			const result = {records: []};

			const documentsRecords = [];
			const referencesRecords = [];

			// Find and create unique pub nodes
			let nodeIndex = 0;

			// Create document nodes link to pubsIndex and make references
			let linkIndex = 0;
			const docsRefDict = {};

			docs.forEach(doc => {
				const pubName = `${doc.doc_type} ${doc.doc_num}`;
				const docIndex = nodeIndex++;

				if (docsRefDict.hasOwnProperty(pubName)) {
					docsRefDict[pubName].push(docIndex);
				} else {
					docsRefDict[pubName] = [docIndex];
				}

				doc.index = docIndex;

				// Doc
				documentsRecords.push(new Record(['document'], [
					{
						identity: { low: doc.index, high: 0 },
						labels: ['Document'],
						properties: {
							doc_id: doc.doc_id,
							doc_type: doc.doc_type,
							doc_num: doc.doc_num,
							display_title_s: doc.display_title_s,
							display_org_s: doc.display_org_s,
							display_doc_type_s: doc.display_doc_type_s,
							pagerank_r: doc.pagerank_r,
							ref_name: doc.ref_name
						}
					}
				], { document: 0 }));

			});

			docs.forEach(doc => {
				const pubName = `${doc.doc_type} ${doc.doc_num}`;
				if (!doc.ref_list) doc.ref_list = [];

				// Ensure refs are good with spaces between type and num
				doc.ref_list.forEach(ref => {
					const refArr = ref.split(' ');
					let newRef = '';
					if (refArr.length < 2) {
						if (refArr[0].slice(0, 5) === 'Title') {
							newRef = refArr[0].slice(0, 5) + ' ' + refArr[0].slice(5, refArr[0].length);
						} else {
							console.log(ref);
							return;
						}
					} else {
						newRef = ref;
					}

					if (docsRefDict.hasOwnProperty(newRef) && newRef !== pubName) {
						docsRefDict[newRef].forEach(ref => {
							referencesRecords.push(new Record(['references'], [
								{
									end: { low: ref, high: 0 },
									identity: { low: linkIndex++, high: 0 },
									properties: {},
									start: { low: doc.index, high: 0 },
									type: 'REFERENCES'
								}
							], { references: 0 }));
						});
					}
				});


			});

			result.records = [...documentsRecords, ...referencesRecords];
			return this.searchUtility.cleanNeo4jData(result, true, userId);

		} catch (err) {
			this.logger.error(err, '8TP5S8L', userId);
			return {nodes: [], edges: []};
		}
	}

	getError() {
		return this.error;
	}
}

function generateFieldLookup (keys) {
	const lookup = {};
	keys.forEach((name, idx) => {
		lookup[name] = idx;
	});
	return lookup;
}

class Record {
	constructor (keys, fields, fieldLookup = null) {
		this.keys = keys;
		this.length = keys.length;
		this._fields = fields;
		this._fieldLookup = fieldLookup || generateFieldLookup(keys);
	}

	forEach (visitor) {
		for (const [key, value] of this.entries()) {
			visitor(value, key, this);
		}
	}

	toObject () {
		const object = {};

		for (const [key, value] of this.entries()) {
			object[key] = value;
		}

		return object;
	}

	* entries () {
		for (let i = 0; i < this.keys.length; i++) {
			yield [this.keys[i], this._fields[i]];
		}
	}

	* values () {
		for (let i = 0; i < this.keys.length; i++) {
			yield this._fields[i];
		}
	}
}


// const policyGraphHandler = new PolicyGraphHandler();

module.exports = PolicyGraphHandler;
