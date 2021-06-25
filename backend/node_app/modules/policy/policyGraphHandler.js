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
	}

	async searchHelper(req, userId) {
		const {
			cloneData = {},
			forCacheReload = false,
			useGCCache,
			includeRevoked,
			searchFields,
			orgFilter
		} = req.body;

		const permissions = req.permissions ? req.permissions : [];

		try {
			const cloneSpecificObject = { orgFilter, searchFields: Object.values(searchFields), includeRevoked };

			if (!forCacheReload && useGCCache) {
				return this.getCachedResults(req, cloneSpecificObject, userId);
			}

			// get results
			const { isTest = false, expandTerms = false, searchText } = req.body;

			const gT0 = new Date().getTime();
			req.body.questionFlag = this.searchUtility.isQuestion(searchText)
			const [parsedQuery, parsedTerms] = await this.searchUtility.getEsSearchTerms(req.body);
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
			const { docs, searchTerms } = searchResults;

			// const [results, query, params] = await this.getGraphData(
			// 	`MATCH (d:Document) WHERE d.doc_id in $ids
			// 	OPTIONAL MATCH pt=(d)-[ref:REFERENCES]->(d2:Document)
			// 	WHERE NOT d = d2 AND d2.doc_id in $ids
			// 	RETURN d, pt;`,
			// 	{ids: docIds, pub_ids: pubIds}, isTest, userId
			// );

			const results = this.createMockGraphReturnFromEsResults(docs, userId);
			const query = 'Mocked from ES';
			const params = [];

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

			graphData.query = {query, params};

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
			tmpCode = code;

			const [graphData] = await this.getGraphData(query, params, isTest, userId);
			graphData.query = {query, params};
			return graphData;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, tmpCode, userId);
			return graphData;
		}
	}

	async callFunctionHelper(req, userId) {
		const {functionName} = req.body;

		switch (functionName) {
			case 'getDataForSearch':
				return this.getDataForSearchHelper(req, userId);
			case 'getDocumentsForEntity':
				return this.getDocumentsForEntityHelper(req, userId);
			case 'getDocumentsForTopic':
				return this.getDocumentsForTopicHelper(req, userId);
			case 'getSingleDocument':
				return this.getSingleDocumentHelper(req, userId);
			default:
				this.logger.error(
					`There is no function called ${functionName} defined in the policyGraphHandler`,
					'8ZLENZO',
					userId
				);
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
				limit: this.constants.GAME_CHANGER_OPTS.downloadLimit,
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
				includeRevoked
			};

			// const gT0 = new Date().getTime();
			searchBody.questionFlag = this.searchUtility.isQuestion(searchText)
			const [parsedQuery, searchTerms] = await this.searchUtility.getEsSearchTerms(searchBody);
			searchBody.searchTerms = searchTerms;
			searchBody.parsedQuery = parsedQuery;
			
			const esQuery = this.searchUtility.getElasticsearchQuery(searchBody, userId);

			let clientObj = this.searchUtility.getESClient(cloneData.clone_name, permissions);

			const esResults = await this.dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery);

			if (esResults && esResults.body && esResults.body.hits && esResults.body.hits.total && esResults.body.hits.total.value && esResults.body.hits.total.value > 0) {

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
					this.logger.error(`Error with Neo4j results: ${err}`, 'PUTA0E1', userId);
					return { entities: [], topics: [] };
				}
			} else {
				this.logger.error(`Error with Elasticsearch results`, 'V053I6O', userId);
				if (this.searchUtility.checkESResultsEmpty(esResults)) { this.logger.warn("Search has no hits") }
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
			this.logger.error(message, '594CVDD', userId);
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
