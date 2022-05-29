const cron = require('node-cron');
const { CacheController } = require('../controllers/cacheController');
const { ElasticSearchController } = require('../controllers/elasticSearchController');
const { FavoritesController } = require('../controllers/favoritesController');
const { UserController } = require('../controllers/userController');
const constantsFile = require('../config/constants');
const LOGGER = require('@dod-advana/advana-logger');
const { distributedPoll } = require('../utils/pollUtility');

class CronJobs {
	constructor(opts = {}) {
		const {
			constants = constantsFile,
			cacheController = new CacheController(),
			elasticSearchController = new ElasticSearchController(opts),
			favoritesController = new FavoritesController(),
			userController = new UserController(),
			logger = LOGGER,
		} = opts;

		this.constants = constants;
		this.cacheController = cacheController;
		this.elasticSearchController = elasticSearchController;
		this.favoritesController = favoritesController;
		this.userController = userController;
		this.logger = logger;
		this.cacheReload = this.getReloadJob.bind(this);

		this.init();
	}

	init() {
		this.cacheController.setStartupSearchHistoryCacheKeys();
		this.cacheController.setStartupQlikFullAppCacheKeys();
		this.cacheController.setStartupCollibraCacheKeys();
	}

	getReloadJob() {
		const userId = this.constants.GAME_CHANGER_OPTS.cacheReloadUserId;
		// https://www.npmjs.com/package/node-cron
		const timingPattern = this.constants.GAME_CHANGER_OPTS.cacheReloadCronTimingPattern;

		return cron.schedule(
			timingPattern,
			async () => {
				let offset = 0;
				let pid;
				if (process.env.pm_id) {
					pid = parseInt(process.env.pm_id) + 1;
				} else {
					// not in pm2 just pick some random
					pid = Math.floor(Math.random() * 50);
				}

				offset = (parseInt(pid) + 1) * 2000;

				setTimeout(async () => {
					// try {
					// 	await this.cacheController.clearSearchHistoryCacheHelper(userId, true);
					// 	await this.cacheController.createSearchHistoryCacheHelper(userId);
					// } catch (e) {
					// 	this.logger.error(`Cron job error in search history cache reload: ${e.message}`, 'ZFH252A', userId);
					// }
					// try {
					// 	await this.cacheController.clearGraphDataCacheHelper(userId, true);
					// 	await this.cacheController.createGraphDataCacheHelper(userId);
					// } catch (e) {
					// 	this.logger.error(`Cron job error in search history cache reload: ${e.message}`, '252AJHF', userId);
					// }
				}, offset);
			},
			{
				// requires start to be called
				scheduled: false,
			}
		);
	}

	resetAPIRequestLimitJob() {
		return cron.schedule(
			'0 0 1 * *',
			async () => {
				try {
					await this.userController.resetAPIRequestLimit();
				} catch (e) {
					this.logger.error(
						`Cron job error in setting API Request Limit: ${e.message}`,
						'NHVT7HI',
						'api-request-reset-cron'
					);
				}
			},
			{
				scheduled: false,
			}
		);
	}

	getUpdateFavoritedSearchesJob() {
		return {
			start: () => {
				const favoriteSearchPollInterval = parseInt(
					this.constants.GAME_CHANGER_OPTS.favoriteSearchPollInterval,
					10
				);
				if (favoriteSearchPollInterval >= 0) {
					this.logger.info(
						`Polling for favorite search updates enabled every ${favoriteSearchPollInterval}ms.`
					);
					distributedPoll(
						this.favoritesController.checkLeastRecentFavoritedSearch,
						favoriteSearchPollInterval,
						'locks:checkLeastRecentFavoritedSearch'
					);
				} else {
					this.logger.info('Polling for favorite search updates disabled.');
				}
			},
		};
	}

	getQlikAppsFullListJob() {
		return {
			start: () => {
				const qlikAppsFullPollInterval = parseInt(
					this.constants.GLOBAL_SEARCH_OPTS.FULL_APPS_POLL_INTERVAL,
					10
				);
				if (!this.constants.GAME_CHANGER_OPTS.isDecoupled && qlikAppsFullPollInterval > 0) {
					this.logger.info(`Polling for qlik app full list updates every ${qlikAppsFullPollInterval}ms.`);
					this.elasticSearchController.cacheStoreQlikApps();
					distributedPoll(
						this.elasticSearchController.cacheStoreQlikApps,
						qlikAppsFullPollInterval,
						'locks.qlikFullAppsPollList'
					);
				} else {
					this.logger.info('Polling for full apps list updates disabled.');
				}
			},
		};
	}

	cacheCollibraInfoJob() {
		return {
			start: () => {
				const collibraCachePollInterval = parseInt(
					this.constants.GLOBAL_SEARCH_OPTS.COLLIBRA_CACHE_POLL_INTERVAL,
					10
				);
				if (!this.constants.GAME_CHANGER_OPTS.isDecoupled && collibraCachePollInterval > 0) {
					this.logger.info(`Polling for collibra cache updates every ${collibraCachePollInterval}ms.`);
					this.cacheController.cacheCollibraData();
					distributedPoll(
						this.cacheController.cacheCollibraData,
						collibraCachePollInterval,
						'locks.collibraCachePollList'
					);
				} else {
					this.logger.info('Polling for collibra cache updates disabled.');
				}
			},
		};
	}
}

exports.CronJobs = CronJobs;
