const asyncRedisLib = require('async-redis');
const redisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
const LOGGER = require('../../lib/logger');
const SearchUtility = require('../../utils/searchUtility');
const GC_HISTORY = require('../../models').gc_history;
const { DataLibrary } = require('../../lib/dataLibrary');
const neo4jLib = require('neo4j-driver');
const d3Force = require('d3-force-3d');

class GraphHandler {
	constructor(opts = {}) {
		const {
			redisClientDB = 8,
			redisDB = redisAsyncClient,
			gc_history = GC_HISTORY,
			dataLibrary = new DataLibrary(opts),
			logger = LOGGER,
			searchUtility = new SearchUtility(opts)
		} = opts;
		this.redisClientDB = redisClientDB;
		this.redisDB = redisDB;
		this.gc_history = gc_history;
		this.dataLibrary = dataLibrary;
		this.logger = logger;
		this.searchUtility = searchUtility;
	}

	async search(searchText, options, cloneName, permissions, userId) {
		// Setup the request
		console.log(`${userId} is doing a ${cloneName} graph search for ${searchText} with options ${options}`);
		const proxyBody = options;
		proxyBody.searchText = searchText;
		proxyBody.cloneName = cloneName;

		return await this.searchHelper({body: proxyBody, permissions}, userId);
	}

	async query(query, code, options, cloneName, permissions, userId) {
		// Setup the request
		console.log(`${userId} is doing a ${cloneName} graph query with options ${options}`);
		const proxyBody = options;
		proxyBody.query = query;
		proxyBody.cloneName = cloneName;

		return await this.queryHelper({body: proxyBody, permissions}, userId, code);
	}

	async callFunction(functionName, options, cloneName, permissions, userId) {
		// Setup the request
		console.log(`${userId} is calling ${functionName} in the ${cloneName} graph module with options ${options}`);
		const proxyBody = options;
		proxyBody.functionName = functionName;
		proxyBody.cloneName = cloneName;

		return await this.callFunctionHelper({body: proxyBody, permissions}, userId);
	}

	async searchHelper(req, userId) {
		return req.body;
	}

	async queryHelper(req, userId, code) {
		return req.body;
	}

	async callFunctionHelper(req, userId) {
		return req.body;
	}

	async getGraphData(query, parameters = {}, isTest, userId) {
		try {
			const resp = await this.dataLibrary.queryGraph(query, parameters, userId);

			return [this.cleanNeo4jData(resp.result, isTest, userId), query, parameters];
		} catch (err) {
			console.error(err);
			const { message } = err;
			this.logger.error(message, '11A4T3L', userId);
			return { nodes: [], edges: [], labels: [], relationships: [], nodeProperties: [], relProperties: [] };
		}
	}

	async getCachedResults(req, cloneSpecificObject, userId) {
		try {

			this.redisDB.select(this.redisClientDB);

			// ## try to get cached results
			const redisKey = this.searchUtility.createCacheKeyFromOptions({...req.body, cloneSpecificObject});

			// check cache for search (first page only)
			const cachedResults = JSON.parse(await this.redisDB.get(redisKey));
			if (cachedResults) {
				return { ...cachedResults, isCached: true };
			}

		} catch (e) {
			// don't reject if cache errors just log
			this.logger.error(e.message, 'MHLY46W', userId);
		}
	}

	async storeCachedResults(req, graphData, cloneSpecificObject, userId) {
		this.redisDB.select(this.redisClientDB);

		// ## try to get cached results
		const redisKey = this.searchUtility.createCacheKeyFromOptions({...req.body, cloneSpecificObject});

		try {
			this.logger.info(`Storing new graph cache entry: ${redisKey}`);
			await this.redisDB.set(redisKey, JSON.stringify(graphData));
		} catch (e) {
			this.logger.error(e.message, '2JLNQVH', userId);
		}
	}

	cleanNeo4jData(result, isTest, user) {
		const nodes = {};
		const nodeIds = [];
		const edgeIds = [];
		const edges = {};
		const labels = [];
		const nodeProperties = {};
		const relationships = [];
		const relProperties = {};
		const docIds = [];
		const graphMetaData = [];
		
		try {
			const addNode = (node) => {
				nodes[node.id] = node;
				if (nodeIds.indexOf(node.id) === -1) {
					nodeIds.push(node.id);
					if (labels.indexOf(node.label) === -1) {
						labels.push(node.label);
						nodeProperties[node.label] = node.properties;
					}
				}
			};

			const addEdge = (edge) => {
				try {
					edges[edge.id] = edge;
					if (edgeIds.indexOf(edge.id) === -1) {
						edgeIds.push(edge.id);
						if (relationships.indexOf(edge.label) === -1) {
							relationships.push(edge.label);
							relProperties[edge.label] = edge.properties;
						}
					}

					const tmpEdges = edgeIds.filter(edgeId => {
						if (edges[edgeId].source === edge.source && edges[edgeId].target === edge.target){
							return edgeId;
						}
					});

					const edgeCount = tmpEdges.length;
					const oddEdges = (edgeCount % 2 !== 0);
					tmpEdges.forEach((edgeId, index) => {
						if (oddEdges && index === 0){
							edges[edgeId].rotation = 0;
							edges[edgeId].curvature = 0;
						} else {
							edges[edgeId].rotation = Math.PI * (index / 6);
							edges[edgeId].curvature = (edgeCount / 10) * ((index % 2 !== 0) ? -1 : 1);
						}
					});
				} catch (err) {
					console.log(edge);
				}
			};

			result.records.forEach(record => {
				const recObj = record.toObject();

				if (recObj.hasOwnProperty('entityScore')) {
					const node = this.buildNodeVisObject(recObj.node, isTest, user);
					node.entityScore = recObj.entityScore;
					node.mentions = recObj.mentions.low;
					addNode(node);
				} else if (recObj.hasOwnProperty('topicScore')) {
					const node = this.buildNodeVisObject(recObj.node, isTest, user);
					node.topicScore = recObj.topicScore;
					addNode(node);
				} else if (recObj.hasOwnProperty('doc_id')) {
					docIds.push({doc_id: recObj.doc_id, mentions: recObj.mentions.low});
				} else if (recObj.hasOwnProperty('primary_key')) {
					graphMetaData.push({
						label: recObj.label,
						property: recObj.property,
						type: recObj.type,
						primary_key: recObj.primary_key
					});
				} else if (recObj.hasOwnProperty('relTypesCount')) {
					graphMetaData.push({
						relationship_counts: recObj.relTypesCount,
						node_counts: recObj.labels
					});
				} else if (recObj.hasOwnProperty('topic')) {
					addNode(this.buildNodeVisObject(recObj.topic, isTest, user));
					nodeProperties.documentCountsForTopic = recObj.documentCountsForTopic;
				} else {
					Object.values(recObj).map(async (v) => {
						const recType = this.getNeo4jType(v, isTest);
						if (recType === 'Node') {
							addNode(this.buildNodeVisObject(v, isTest, user));
						} else if (recType === 'Relationship') {
							addEdge(this.buildEdgeVisObject(v, isTest, user));
						} else if (recType === 'Path') {
							addNode(this.buildNodeVisObject(v.start, isTest, user));
							addNode(this.buildNodeVisObject(v.end, isTest, user));

							for (let obj of v.segments) {
								addNode(this.buildNodeVisObject(obj.start, isTest, user));
								addNode(this.buildNodeVisObject(obj.end, isTest, user));
								addEdge(this.buildEdgeVisObject(obj.relationship, isTest, user));
							}
						} else if (recType === 'Array') {
							for (let obj of v) {
								const recType = this.getNeo4jType(obj, isTest);
								if (recType === 'Node') {
									addNode(this.buildNodeVisObject(obj, isTest, user));
								} else if (recType === 'Relationship') {
									addEdge(this.buildEdgeVisObject(obj, isTest, user));
								}
							}
						} else {
							if (v !== null) {
								console.log(v);
							}
						}
					});
				}
			});

			if (docIds.length > 0) {
				return { doc_ids: docIds };
			} else if (graphMetaData.length > 0) {
				return { graph_metadata: graphMetaData };
			} else if (Object.keys(nodes).length <= 0 && result.records[0]){
				const record = result.records[0].toObject();
				Object.keys(record).forEach(key => {
					if (record[key].hasOwnProperty('low')) {
						record[key] = record[key].low;
					}
				});
				return {...record};
			}

			return { nodes: Object.values(nodes), edges: Object.values(edges), labels, relationships, nodeProperties, relProperties };

		} catch (err) {
			this.logger.error(err, '193UPTH', user);
			return { nodes: Object.values(nodes), edges: Object.values(edges), labels, relationships, nodeProperties, relProperties };
		}
	}

	buildNodeVisObject(neo4jNode, isTest, user) {
		let node = {};
		try {

			let label = neo4jNode.labels[0];

			node.id = !isTest ? neo4jNode.identity.toInt() : neo4jNode.identity.low;
			node.label = label;

			const title_properties = Object.keys(neo4jNode.properties);
			node.properties = [];

			for (const key of title_properties) {
				if (neo4jNode.properties.hasOwnProperty(key)) {
					if (!isTest && neo4jLib.isInt(neo4jNode.properties[key])){
						node[key] = neo4jNode.properties[key].toNumber();
					} else if (isTest && neo4jNode.properties[key] && neo4jNode.properties[key].hasOwnProperty('low')) {
						node[key] = neo4jNode.properties[key].low;
					} else {
						node[key] = neo4jNode.properties[key];
					}
					node.properties.push(key);
				}
			}

			if (!node.hasOwnProperty('value')) node.value = 1;

		} catch (err) {
			this.logger.error(err, 'BSCU681', user);
		}

		return node;
	}

	buildEdgeVisObject(neo4jRel, isTest, user) {
		let edge = {};

		try {
			edge.id = !isTest ? neo4jRel.identity.toInt() : neo4jRel.identity.low;
			edge.source = !isTest ? neo4jRel.start.toInt() : neo4jRel.start.low;
			edge.target = !isTest ? neo4jRel.end.toInt() : neo4jRel.end.low;
			edge.label = neo4jRel.type;

			const title_properties = Object.keys(neo4jRel.properties);
			edge.properties = [];

			for (const key of title_properties) {
				if (neo4jRel.properties.hasOwnProperty(key)) {
					if (!isTest && neo4jLib.isInt(neo4jRel.properties[key])){
						edge[key] = neo4jRel.properties[key].toNumber();
					} else if (isTest && neo4jRel.properties[key] && neo4jRel.properties[key].hasOwnProperty('low')) {
						edge[key] = neo4jRel.properties[key].low;
					} else {
						edge[key] = neo4jRel.properties[key];
					}
					edge.properties.push(key);
				}
			}

			if (!edge.hasOwnProperty('value')) edge.value = 1;
		} catch (err) {
			this.logger.error(err, 'UPKARU0', user);
		}

		return edge;
	}

	getNeo4jType(v, isTest) {

		if (v === null) return false;

		if (isTest) {
			const keys = Object.keys(v);
			if (keys.includes('identity') && keys.includes('labels') && keys.includes('properties')) return 'Node';
			else if (keys.includes('identity') && keys.includes('start') && keys.includes('end') && keys.includes('type') && keys.includes('properties')) return 'Relationship';
			else if (keys.includes('start') && keys.includes('end') && keys.includes('segments')) return 'Path';
			else if (v instanceof Array) return 'Array';
			else return false;
		} else {
			if (v instanceof neo4jLib.types.Node) return 'Node';
			else if (v instanceof neo4jLib.types.Relationship) return 'Relationship';
			else if (v instanceof neo4jLib.types.Path) return 'Path';
			else if (v instanceof Array) return 'Array';
			else return false;
		}
	}

	async render2dNodeLocations(nodes, edges, user) {
		try {
			const renderEdges = JSON.parse(JSON.stringify(edges));
			const charge = d3Force.forceManyBody();
			const forceLink = d3Force.forceLink().distance((nodes.length / 50 + 1) * 50);
			const forceCollide = d3Force.forceCollide(10);
			const forceCenter = d3Force.forceCenter(0, 0, 0);
			const radialForce = d3Force.forceRadial(10, 0, 0);
			charge.strength(-5);
			charge.distanceMin(100);
			charge.distanceMax(200);
			const simulation = d3Force.forceSimulation(nodes, 2)
				.force('link', forceLink)
				.force('charge', charge)
				.force('collision', forceCollide)
				.force('center', forceCenter)
				.force('radial', radialForce)
				.stop();

			const linkForce = simulation.force('link');

			if (linkForce) {
				linkForce
					.id(d => d['id'])
					.links(renderEdges);
			}

			for (let i = 0; i < 500; ++i) {
				simulation.tick();
			}

		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'FA2PCCZ', user);
		}
	}

	async render3dNodeLocations(nodes, edges, user) {
		try {
			const renderEdges = JSON.parse(JSON.stringify(edges));
			const simulation = d3Force.forceSimulation(nodes, 3)
				.force('link', d3Force.forceLink())
				.force('charge', d3Force.forceManyBody())
				.force('center', d3Force.forceCenter())
				.stop();

			const linkForce = simulation.force('link');

			if (linkForce) {
				linkForce
					.id(d => d['id'])
					.links(renderEdges);
			}

			for (let i = 0; i < 500; ++i) {
				simulation.tick();
			}

		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'PCCZEDC', user);
		}
	}
}

module.exports = GraphHandler;
