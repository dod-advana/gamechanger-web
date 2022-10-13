const LOGGER = require('@dod-advana/advana-logger');
const constantsFile = require('../config/constants');
const { ESSearchLib } = require('../lib/ESSearchLib');
const asyncRedisLib = require('async-redis');
const https = require('https');
const { getQlikApps } = require('../modules/globalSearch/globalSearchUtils');

const CACHE_QLIK_RELOAD_KEY = 'qlikCacheReloadingStatus';
const CACHE_IS_RELOADING = 'is-reloading';
const CACHE_IS_NOT_RELOADING = 'not-reloading';

class ElasticSearchController {
	constructor(opts = {}) {
		const {
			constants = constantsFile,
			logger = LOGGER,
			esSearchLib,
			redisDB = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost'),
		} = opts;

		this.redisDB = redisDB;
		this.logger = logger;
		this.constants = constants;
		this.esSearchLib = esSearchLib;

		if (!esSearchLib) {
			try {
				const gamechangerConfig = this.getESClientConfig(this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS);
				const edaConfig = this.getESClientConfig(this.constants.EDA_ELASTIC_SEARCH_OPTS);

				this.esSearchLib = new ESSearchLib();

				this.esSearchLib.addClient('gamechanger', gamechangerConfig, 'DataLibrary constructor');
				this.esSearchLib.addClient('eda', edaConfig, 'DataLibrary constructor');
			} catch (e) {
				this.logger.error(`CONSTRUCTOR ERROR: ${e.message}`, 'SEAFUUV', 'DataLibrary');
			}
		}
	}

	getESClientConfig({ user, password, ca, protocol, host, port, requestTimeout }) {
		let config = {
			node: {},
		};
		if (port === '443') {
			config.node.agent = () => {
				return new https.Agent({
					rejectUnauthorized: false,
					keepAlive: true,
					ca,
				});
			};
			config.auth = {
				username: user,
				password,
			};
		}
		if (user) {
			config.auth = {
				username: user,
				password,
			};
		}
		config.node.url = new URL(`${protocol}://${host}:${port}`);
		config.requestTimeout = requestTimeout;

		return config;
	}

	async cacheStoreQlikApps() {
		try {
			await this.redisDB.select(this.constants.REDIS_CONFIG.GLOBAL_SEARCH_CACHE_DB);
			const isReloading = await this.redisDB.get(CACHE_QLIK_RELOAD_KEY);
			if (isReloading === CACHE_IS_RELOADING) {
				throw new Error('Will not create qlik data cache - cache is already reloading');
			}
			this.logger.info('START qlik full app cache and ES storage');

			const data = await getQlikApps(undefined, this.logger, false, undefined);

			await Promise.all([this.storeUpdateQlikAppsInES(data), this.cacheQlikApps(data)]);

			await this.redisDB.set(CACHE_QLIK_RELOAD_KEY, CACHE_IS_NOT_RELOADING);
			this.logger.info('FINISHED qlik full app cache and ES storage');
		} catch (e) {
			this.logger.error(e, 'P48NGIG', 'Qlik Cache and ES Store Function');
			await this.redisDB.set(CACHE_QLIK_RELOAD_KEY, CACHE_IS_NOT_RELOADING);
		}
	}

	async storeUpdateQlikAppsInES(qlikApps) {
		try {
			this.logger.info('Storing Full Qlik Apps in ES');

			const clientObj = {
				esClientName: 'gamechanger',
				esIndex: this.constants.GLOBAL_SEARCH_OPTS.ES_INDEX,
			};

			await this.esSearchLib.deleteIndex(clientObj.esClientName, clientObj.esIndex, 'QlikAppCaching');

			// Create index for qlik apps in case it is not there
			await this.esSearchLib.createIndex(
				clientObj.esClientName,
				clientObj.esIndex,
				this.constants.GLOBAL_SEARCH_OPTS.ES_MAPPING,
				{},
				'QlikAppCaching'
			);

			// Convert qlik apps into documents
			const dataset = qlikApps.map((app) => {
				return {
					id: app['id'],
					created_dt: app['createdDate'],
					modified_dt: app['modifiedDate'],
					//modifiedByUserName_s: app['modifiedByUserName'],
					//ownerName_s: app['owner']['name'],
					name_t: app['name'],
					publishTime_dt: app['publishTime'],
					published_b: app['published'],
					tags_n: { items: app['tags'] },
					description_t: app['description'],
					streamId_t: app['stream']['id'],
					streamName_t: app['stream']['name'],
					streamCustomProperties_n: { items: app['stream']['customProperties'] },
					fileSize_i: Number.parseInt(app['fileSize']),
					lastReloadTime_dt: app['lastReloadTime'],
					thumbnail_t: app['thumbnail'],
					dynamicColor_t: app['dynamicColor'],
					appCustomProperties_n: { items: app['customProperties'] },
					businessDomains_n: { items: app['businessDomains'] },
					owner_t: app['owner']['name'],
				};
			});

			// Insert / Update Qlik Documents
			await this.esSearchLib.bulkInsert(clientObj.esClientName, clientObj.esIndex, dataset, 'QlikAppCaching');

			this.logger.info('Finished Storing Full Qlik Apps in ES');
		} catch (e) {
			this.logger.error(e, 'GTT7PKO', 'Qlik ES Store Function');
		}
	}

	async cacheQlikApps(qlikApps) {
		try {
			this.logger.info('Caching Full Qlik Apps');
			const respData = JSON.stringify(qlikApps);
			await this.redisDB.select(this.constants.REDIS_CONFIG.GLOBAL_SEARCH_CACHE_DB);
			await this.redisDB.set('qlik-full-app-list', respData);
			this.logger.info('Finished Caching Full Qlik Apps');
		} catch (e) {
			this.logger.error(e, 'YQJ8T22', 'Qlik Cache Function');
		}
	}
}

module.exports.ElasticSearchController = ElasticSearchController;
