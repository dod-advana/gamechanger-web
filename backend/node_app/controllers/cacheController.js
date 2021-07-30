const GC_HISTORY = require('../models').gc_history;
const LOGGER = require('../lib/logger');
const sparkMD5Lib = require('spark-md5');
const asyncRedisLib = require('async-redis');
const { SearchController } = require('./searchController');
const Sequelize = require('sequelize');
const abbreviations = require('./abbcounts.json');

const CACHE_RELOAD_KEY = 'gcCacheReloadingStatus';
const ABB_RELOAD_KEY = 'gcAbbreviationsReloadingStatus';
const ABB_ACTIVE_STATUS_KEY = 'gcAbbreviationsStatus';
const CACHE_IS_RELOADING = 'is-reloading';
const CACHE_IS_NOT_RELOADING = 'not-reloading';
const MAX_RELOAD_TIME_MINS = 6 * 60;
const CACHE_ACTIVE_STATUS_KEY = 'gcCacheStatus';
const CACHE_GRAPH_ACTIVE_STATUS_KEY = 'gcGraphCacheStatus';
const CACHE_GRAPH_RELOAD_KEY = 'gcCacheGraphReloadingStatus';
const CACHE_GRAPH_IS_RELOADING = 'graph-is-reloading';
const CACHE_GRAPH_IS_NOT_RELOADING = 'graph-not-reloading';

const redisAsyncClientDB = 7;
const abbreviationRedisAsyncClientDB = 9;
const separatedRedisAsyncClientDB = 4;
const graphRedisAsyncClientDB = 8;


class CacheController {

	constructor(opts = {}) {
		const {
			logger = LOGGER,
			sparkMD5 = sparkMD5Lib,
			gcHistory = GC_HISTORY,
			search = new SearchController(opts),
			async_redis,
		} = opts;

		this.logger = logger;
		this.sparkMD5 = sparkMD5;
		this.gcHistory = gcHistory;
		this.search = search;

		if (!async_redis){
			this.redisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
			this.separatedRedisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
		} else {
			this.redisAsyncClient = async_redis.createClient(process.env.REDIS_URL || 'redis://localhost');
			this.separatedRedisAsyncClient = async_redis.createClient(process.env.REDIS_URL || 'redis://localhost');
		}

		this.redisAsyncClient.select(redisAsyncClientDB);
		this.separatedRedisAsyncClient.select(separatedRedisAsyncClientDB);

		this.createSearchHistoryCache = this.createSearchHistoryCache.bind(this);
		this.createSearchHistoryCacheHelper = this.createSearchHistoryCacheHelper.bind(this);
		this.clearSearchHistoryCache = this.clearSearchHistoryCache.bind(this);
		this.clearSearchHistoryCacheHelper = this.clearSearchHistoryCacheHelper.bind(this);
		this.createAbbreviationsCache = this.createAbbreviationsCache.bind(this);
		this.createAbbreviationsCacheHelper = this.createAbbreviationsCacheHelper.bind(this);
		this.clearAbbreviationsCache = this.clearAbbreviationsCache.bind(this);
		this.clearAbbreviationsCacheHelper = this.clearAbbreviationsCacheHelper.bind(this);
		this.getGCCacheStatus = this.getGCCacheStatus.bind(this);
		this.toggleGCCacheStatus = this.toggleGCCacheStatus.bind(this);
		this.clearGraphDataCache = this.clearGraphDataCache.bind(this);
		this.clearGraphDataCacheHelper = this.clearGraphDataCacheHelper.bind(this);
		this.createGraphDataCache = this.createGraphDataCache.bind(this);
		this.createGraphDataCacheHelper = this.createGraphDataCacheHelper.bind(this);
	}

	async setStartupSearchHistoryCacheKeys(){
		this.redisAsyncClient.set(CACHE_RELOAD_KEY, CACHE_IS_NOT_RELOADING);
	}

	async createSearchHistoryCache(req, res) {
		// this will be cut in prod it limits to 10 mins top in network
		req.setTimeout(72000000); // 20 hours

		const userId = req.get('SSL_CLIENT_S_DN_CN');

		try {
			await this.createSearchHistoryCacheHelper(userId);
			res.status(200).send('Search history cache created');
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'IXUE4IV', userId);
			this.logger.error(err);
			res.status(500).send(err);
		}
	}

	async createSearchHistoryCacheHelper(userId) {
		try {
			this.redisAsyncClient.select(redisAsyncClientDB);
			const isReloading = await this.redisAsyncClient.get(CACHE_RELOAD_KEY);
			if (isReloading === CACHE_IS_RELOADING) {
				throw new Error('Will not create search history cache - cache is already reloading');
			}

			this.logger.info('CREATING search history cache');
			await this.redisAsyncClient.set(CACHE_RELOAD_KEY, CACHE_IS_RELOADING);
			const start = Date.now();
			const twoWeeksAgo = new Date();
			twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

			const params = await this.gcHistory.findAll({
				raw: true,
				attributes: [
					[Sequelize.fn('DISTINCT', Sequelize.col('clone_name')), 'names'],
					[Sequelize.fn('MAX', Sequelize.col('search_version')), 'latest_version'],
				],
				where: {
					run_at: {
						$gt: twoWeeksAgo
					},
				},
				group: [
					'clone_name'
				]
			});

			// map names that exist into flat array
			const projects = params.filter(({ names }) => names).map(({ names }) => names);
			const { latest_version } = params[0];

			if (!latest_version) {
				throw new Error(`Error creating search cache: Trying for search_version ${latest_version}, for projects ${projects}`);
			}

			// limit to 1000 total cached
			// search clones first
			// clone_name: null is default gamechanger
			// fill remaining limit with gamechanger

			const searches = [];
			const cloneLimit = Math.floor((projects.length + 1) / 2);

			// check clone histories
			if (projects.length > 0){
				// get distinct clone searches for each clone
				for (const name of projects) {
					const data = await this.gcHistory.findAll({
						raw: true,
						attributes: [
							Sequelize.fn('DISTINCT', Sequelize.col('request_body'))
						],
						where: {
							is_tutorial_search: false,
							search_version: latest_version,
							clone_name: name,
							run_at: {
								$gt: twoWeeksAgo
							}
						},
						limit: cloneLimit
					});

					const bodies = data.map(({ request_body }) => request_body);
					searches.push(...bodies);
				}
			};

			// fill remaining searches with default gamechanger history
			const mainLimit = 1000 - searches.length;
			const data = await this.gcHistory.findAll({
				raw: true,
				attributes: [
					Sequelize.fn('DISTINCT', Sequelize.col('request_body'))
				],
				where: {
					is_tutorial_search: false,
					search_version: latest_version,
					clone_name: null,
					run_at: {
						$gt: twoWeeksAgo
					}
				},
				limit: mainLimit
			});

			const bodies = data.map(({ request_body }) => request_body);
			searches.push(...bodies);

			let hadError = false;
			let end = Date.now();
			let diffMins = ((end - start) / (1000 * 60));
			let stoppedEarly = false;
			for (const body of searches) {
				end = Date.now();
				diffMins = ((end - start) / (1000 * 60));
				if (diffMins > MAX_RELOAD_TIME_MINS){
					stoppedEarly = true;
					break;
				}
				try {
					body.forCacheReload = true;
					//await this.search.documentSearchHelper({body}, userId);
				} catch (e) {
					hadError = true;
					this.logger.error(`Error re-creating a search for cache reload: ${e.message}`, 'P93QCCD', userId);
				}
			}

			this.logger.metrics('END SEARCH HISTORY CACHE RELOAD', {
				time: `${diffMins.toFixed(2)} minutes elapsed reloading cache`,
				hadError,
				stoppedEarly
			});

		} catch (e) {
			const { message } = e;
			this.logger.error(message, 'GPPFDQ9', userId);

		} finally {
			await this.redisAsyncClient.set(CACHE_RELOAD_KEY, CACHE_IS_NOT_RELOADING);
		}
	}

	async clearSearchHistoryCache(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');

		try {
			await this.clearSearchHistoryCacheHelper(userId);
			res.status(200).send('search history cache cleared');
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'JK3MHI5', userId);
			res.status(500).send(err);
		}

	}

	async clearSearchHistoryCacheHelper(userId, forCacheReload = false){
		try {
			this.redisAsyncClient.select(redisAsyncClientDB);
			this.logger.info('CLEAR search history cache');
			const isReloading = await this.redisAsyncClient.get(CACHE_RELOAD_KEY);
			if (forCacheReload){
				if (isReloading === CACHE_IS_RELOADING) {
					throw new Error('Will not clear cache - Search history cache is currently reloading');
				}
				this.logger.metrics('START SEARCH HISTORY CACHE RELOAD');
			}
			const status = await this.redisAsyncClient.get(CACHE_ACTIVE_STATUS_KEY);
			await Promise.all([this.redisAsyncClient.flushdb(), this.separatedRedisAsyncClient.flushdb()]);

			await this.redisAsyncClient.set(CACHE_RELOAD_KEY, isReloading);
			await this.redisAsyncClient.set(CACHE_ACTIVE_STATUS_KEY, Boolean(status));

		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'R4S7E0T', userId);
		}
	}

	async createAbbreviationsCache(req, res) {
		// this will be cut in prod it limits to 10 mins top in network
		req.setTimeout(72000000); // 20 hours

		const userId = req.get('SSL_CLIENT_S_DN_CN');

		try {
			await this.createAbbreviationsCacheHelper(userId);
			res.status(200).send('Search abbreviations created');
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'IXUE4IV', userId);
			this.logger.error(err);
			res.status(500).send(err);
		}
	}

	async createAbbreviationsCacheHelper(userId) {
		try {
			await this.redisAsyncClient.select(abbreviationRedisAsyncClientDB);
			const isReloading = await this.redisAsyncClient.get(ABB_RELOAD_KEY);
			if (isReloading === CACHE_IS_RELOADING) {
				throw new Error('Will not create abbreviations cache - cache is already reloading');
			}

			this.logger.info('CREATING abbreviations cache');
			await this.redisAsyncClient.set(ABB_RELOAD_KEY, CACHE_IS_RELOADING);
			const twoWeeksAgo = new Date();
			twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

			let k;
			for (k in abbreviations) {
				let top = '';
				let topCount = 0;
				let k2;
				for (k2 in abbreviations[k]) {
					top = topCount < abbreviations[k][k2] ? k2 : top;
					topCount = topCount < abbreviations[k][k2] ? abbreviations[k][k2] : topCount;
				}

				top = top.toLowerCase();
				await this.redisAsyncClient.set(k, top.trim());
				await this.redisAsyncClient.set(top.trim(), k);
				this.logger.info(k + ', ' + top.trim());
				this.logger.info(top.trim() + ', ' + k);
			}

		} catch (e) {
			const { message } = e;
			this.logger.error(message, 'GPPFDQ9', userId);

		} finally {
			await this.redisAsyncClient.set(ABB_RELOAD_KEY, CACHE_IS_NOT_RELOADING);
		}
	}

	async clearAbbreviationsCache(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');

		try {
			await this.clearAbbreviationsCacheHelper(userId);
			res.status(200).send('abbreviation cache cleared');
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'JK3MHI5', userId);
			res.status(500).send(err);
		}

	}

	async clearAbbreviationsCacheHelper(userId, forCacheReload = false){
		try {
			await this.redisAsyncClient.select(abbreviationRedisAsyncClientDB);
			this.logger.info('CLEAR abbreviation cache');
			const isReloading = await this.redisAsyncClient.get(ABB_RELOAD_KEY);
			if (forCacheReload){
				if (isReloading === CACHE_IS_RELOADING) {
					throw new Error('Will not clear cache - Abbreviation cache is currently reloading');
				}
				this.logger.metrics('START ABBREVIATION CACHE RELOAD');
			}
			const status = await this.redisAsyncClient.get(CACHE_ACTIVE_STATUS_KEY);
			await Promise.all([this.redisAsyncClient.flushdb()]);

			await this.redisAsyncClient.set(ABB_RELOAD_KEY, isReloading);
			await this.redisAsyncClient.set(ABB_ACTIVE_STATUS_KEY, Boolean(status));

		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'R4S7E0T', userId);
		}
	}

	async getGCCacheStatus(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			let useGCCache = await this.redisAsyncClient.get(CACHE_ACTIVE_STATUS_KEY);
			useGCCache = false;

			if (useGCCache === null) {
				await this.redisAsyncClient.set(CACHE_ACTIVE_STATUS_KEY, true);
				useGCCache = true;
			}
			res.status(200).send(useGCCache);

		} catch (err) {
			this.logger.error(err.message, 'HMJND55', userId);
			res.status(500).send(err);
		}
	}

	async toggleGCCacheStatus(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const useGCCache = await this.redisAsyncClient.get(CACHE_ACTIVE_STATUS_KEY);
			const toggle = useGCCache === 'false';
			await this.redisAsyncClient.set(CACHE_ACTIVE_STATUS_KEY, toggle);

			res.status(200).send(toggle);

		} catch (err) {
			this.logger.error(err.message, 'HMJND55', userId);
			res.status(500).send(err);
		}
	}

	async clearGraphDataCache(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			await this.clearGraphDataCacheHelper(userId);
			res.status(200).send('Graph data cache cleared');
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'MHI5EDC', userId);
			res.status(500).send(err);
		}

	}

	async clearGraphDataCacheHelper(userId, forCacheReload) {
		try {
			this.redisAsyncClient.select(graphRedisAsyncClientDB);
			this.logger.info('CLEAR graph data cache');
			const isReloading = await this.redisAsyncClient.get(CACHE_GRAPH_RELOAD_KEY);
			if (forCacheReload){
				if (isReloading === CACHE_GRAPH_IS_RELOADING) {
					throw new Error('Will not clear cache - Graph data cache is currently reloading');
				}
				this.logger.metrics('START GRAPH DATA CACHE RELOAD');
			}
			const status = await this.redisAsyncClient.get(CACHE_GRAPH_ACTIVE_STATUS_KEY);
			await this.redisAsyncClient.flushdb();

			await this.redisAsyncClient.set(CACHE_GRAPH_RELOAD_KEY, isReloading || false);
			await this.redisAsyncClient.set(CACHE_GRAPH_ACTIVE_STATUS_KEY, Boolean(status));

		} catch (err) {
			const { message } = err;
			this.logger.error(message, '7E0TEDF', userId);
			return message;
		}
	}

	async createGraphDataCache(req, res) {
		// this will be cut in prod it limits to 10 mins top in network
		req.setTimeout(72000000); // 20 hours

		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			await this.createGraphDataCacheHelper(userId);
			res.status(200).send('Graph data cache created');
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'E4IVEDC', userId);
			this.logger.error(err);
			res.status(500).send(err);
		}
	}

	async createGraphDataCacheHelper(userId) {
		try {
			this.redisAsyncClient.select(graphRedisAsyncClientDB);
			const isReloading = await this.redisAsyncClient.get(CACHE_GRAPH_RELOAD_KEY);
			if (isReloading === CACHE_GRAPH_IS_RELOADING) {
				throw new Error('Will not create graph data cache - cache is already reloading');
			}

			this.logger.info('CREATING graph data cache');
			await this.redisAsyncClient.set(CACHE_GRAPH_RELOAD_KEY, CACHE_GRAPH_IS_RELOADING);
			const start = Date.now();
			const twoWeeksAgo = new Date();
			twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

			const params = await this.gcHistory.findAll({
				raw: true,
				attributes: [
					[Sequelize.fn('DISTINCT', Sequelize.col('clone_name')), 'names'],
					[Sequelize.fn('MAX', Sequelize.col('search_version')), 'latest_version'],
				],
				where: {
					run_at: {
						$gt: twoWeeksAgo
					},
				},
				group: [
					'clone_name'
				]
			});

			// map names that exist into flat array
			const projects = params.filter(({ names }) => names).map(({ names }) => names);
			const { latest_version } = params[0];

			if (!latest_version) {
				throw new Error(`Error creating graph data cache: Trying for search_version ${latest_version}, for projects ${projects}`);
			}

			// limit to 1000 total cached
			// search clones first
			// clone_name: null is default gamechanger
			// fill remaining limit with gamechanger

			const searches = [];
			const cloneLimit = Math.floor((projects.length + 1) / 2);

			// check clone histories
			if (projects.length > 0){
				// get distinct clone searches for each clone
				for (const name of projects) {
					const data = await this.gcHistory.findAll({
						raw: true,
						attributes: [
							Sequelize.fn('DISTINCT', Sequelize.col('request_body'))
						],
						where: {
							is_tutorial_search: false,
							search_version: latest_version,
							clone_name: name,
							run_at: {
								$gt: twoWeeksAgo
							}
						},
						limit: cloneLimit
					});

					const bodies = data.map(({ request_body }) => request_body);
					searches.push(...bodies);
				}
			}

			// fill remaining searches with default gamechanger history
			const mainLimit = 1000 - searches.length;
			const data = await this.gcHistory.findAll({
				raw: true,
				attributes: [
					Sequelize.fn('DISTINCT', Sequelize.col('request_body'))
				],
				where: {
					is_tutorial_search: false,
					search_version: latest_version,
					clone_name: null,
					run_at: {
						$gt: twoWeeksAgo
					}
				},
				limit: mainLimit
			});

			const bodies = data.map(({ request_body }) => request_body);
			searches.push(...bodies);

			let hadError = false;
			let end = Date.now();
			let diffMins = ((end - start) / (1000 * 60));
			let stoppedEarly = false;
			for (const body of searches) {
				end = Date.now();
				diffMins = ((end - start) / (1000 * 60));
				if (diffMins > MAX_RELOAD_TIME_MINS){
					stoppedEarly = true;
					break;
				}
				try {
					body.forCacheReload = true;
					// await this.graph.graphFilterHelper({body}, userId);
				} catch (e) {
					hadError = true;
					this.logger.error(`Error re-creating a search for cache reload: ${e.message}`, 'QCCDEDC', userId);
				}
			}

			this.logger.metrics('END GRAPH DATA CACHE RELOAD', {
				time: `${diffMins.toFixed(2)} minutes elapsed reloading cache`,
				hadError,
				stoppedEarly
			});

		} catch (e) {
			const { message } = e;
			this.logger.error(message, 'FDQ9EDC', userId);

		} finally {
			await this.redisAsyncClient.set(CACHE_GRAPH_RELOAD_KEY, CACHE_GRAPH_IS_NOT_RELOADING);
		}
	}
}

module.exports.CacheController = CacheController;
