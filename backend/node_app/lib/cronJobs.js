const cron = require('node-cron');
const redis = require('redis');
const Redlock = require('redlock');
const { CacheController } = require('../controllers/cacheController');
const { FavoritesController } = require('../controllers/favoritesController');
const { UserController } = require('../controllers/userController');
const constantsFile = require('../config/constants');
const LOGGER = require('../lib/logger');
const { poll } = require('../utils/pollUtility');

class CronJobs {
	constructor(opts = {}){
		const {
			constants = constantsFile,
			cacheController = new CacheController(),
			favoritesController = new FavoritesController(),
			userController = new UserController(),
			logger = LOGGER,
			redisClient,
		} = opts;

		if (!redisClient){
			this.redisClient = redis.createClient(process.env.REDIS_URL || 'redis://localhost');
		}
		
		this.redlock = new Redlock([this.redisClient], {
			// we're polling so no reason to retry
			retryCount: 1,
		});

		this.constants = constants;
		this.cacheController = cacheController;
		this.favoritesController = favoritesController;
		this.userController = userController;
		this.logger = logger;
		this.cacheReload = this.getReloadJob.bind(this);

		this.init();
	}

	init(){
		this.cacheController.setStartupSearchHistoryCacheKeys();

		const favoriteSearchPollInterval = this.constants.GAME_CHANGER_OPTS.favoriteSearchPollInterval;
		if (favoriteSearchPollInterval >= 0) {
			this.logger.info(`Polling for favorite search updates enabled every ${favoriteSearchPollInterval}ms.`);
			poll(async () => {
				let lock;
				try {
					const resource = 'locks:checkLeastRecentFavoritedSearch';
					const ttl = Math.max(favoriteSearchPollInterval, 60000); // timeout lock after at least 60s
					lock = await this.redlock.lock(resource, ttl);
					await this.favoritesController.checkLeastRecentFavoritedSearch();
				} catch (err) {
					// XXX: this error is expected when the lock hasn't expired -- can we differentiate?
					this.logger.error(err, 'M8HFXEH', 'this probably is not an issue');
				} finally {
					if (lock) {
						try {
							// reduce the lock timeout to the poll interval
							await lock.extend(favoriteSearchPollInterval);
						} catch (err) {
							this.logger.error(err, 'N7FGETF');
						}
					}
				}
			}, 1000); // we check every second if we can process the next item
		} else {
			this.logger.info('Polling for favorite search updates disabled.');
		}
	}

	getReloadJob() {
		const userId = this.constants.GAME_CHANGER_OPTS.cacheReloadUserId;
		// https://www.npmjs.com/package/node-cron
		const timingPattern = this.constants.GAME_CHANGER_OPTS.cacheReloadCronTimingPattern;

		return cron.schedule(timingPattern, async () => {
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

				// try {
				// 	await this.favoritesController.checkFavoritedSearchesHelper(userId);
				// } catch (e) {
				// 	this.logger.error(`Cron job error in check favorited searches: ${e.message}`, 'FVW4J2H', userId);
				// }

			}, offset);

		}, {
			// requires start to be called
			scheduled: false
		});
	}

	resetAPIRequestLimitJob() {
		return cron.schedule('0 0 1 * *', async () => {
			try {
				await this.userController.resetAPIRequestLimit();
			} catch (e) {
				this.logger.error(`Cron job error in setting API Request Limit: ${e.message}`, 'NHVT7HI', 'api-request-reset-cron');
			}
		}, {
			scheduled: false
		})

	}
}

exports.CronJobs = CronJobs;
