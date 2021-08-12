const asyncRedisLib = require('async-redis');
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
			redisDB = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost'),
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
		this.logger.info(`${userId} is doing a ${cloneName} graph search for ${searchText} with options ${options}`);
		const proxyBody = options;
		proxyBody.searchText = searchText;
		proxyBody.cloneName = cloneName;

		return await this.searchHelper({body: proxyBody, permissions}, userId);
	}

	async query(query, code, options, cloneName, permissions, userId) {
		// Setup the request
		this.logger.info(`${userId} is doing a ${cloneName} graph query with options ${options}`);
		const proxyBody = options;
		proxyBody.query = query;
		proxyBody.cloneName = cloneName;

		return await this.queryHelper({body: proxyBody, permissions}, userId, code);
	}

	async callFunction(functionName, options, cloneName, permissions, userId) {
		// Setup the request
		this.logger.info(`${userId} is calling ${functionName} in the ${cloneName} graph module with options ${options}`);
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

			return [this.searchUtility.cleanNeo4jData(resp.result, isTest, userId), query, parameters];
		} catch (err) {
			console.error(err);
			const { message } = err;
			this.logger.error(message, '11A4T3L', userId);
			return { nodes: [], edges: [], labels: [], relationships: [], nodeProperties: [], relProperties: [] };
		}
	}

	async getCachedResults(req, cloneSpecificObject, userId) {
		try {

			await this.redisDB.select(this.redisClientDB);

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
		await this.redisDB.select(this.redisClientDB);

		// ## try to get cached results
		const redisKey = this.searchUtility.createCacheKeyFromOptions({...req.body, cloneSpecificObject});

		try {
			this.logger.info(`Storing new graph cache entry: ${redisKey}`);
			await this.redisDB.set(redisKey, JSON.stringify(graphData));
		} catch (e) {
			this.logger.error(e.message, '2JLNQVH', userId);
		}
	}

	render2dNodeLocations(nodes, edges, user) {
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

	render3dNodeLocations(nodes, edges, user) {
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

	getError() {
		return {};
	}
}

module.exports = GraphHandler;
