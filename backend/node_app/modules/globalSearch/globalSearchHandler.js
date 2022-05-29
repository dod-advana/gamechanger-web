const LOGGER = require('@dod-advana/advana-logger');
const SearchHandler = require('../base/searchHandler');
const lunr = require('lunr');
const __ = require('lodash');
const lunrSearchUtils = require('../../utils/lunrSearchUtils');
const constantsFile = require('../../config/constants');
const axios = require('axios');
const _ = require('lodash');
const dataCatalogUtils = require('../../utils/DataCatalogUtils');
const Sequelize = require('sequelize');
const databaseFile = require('../../models/game_changer');
const { getUserIdFromSAMLUserId } = require('../../utils/userUtility');
const { getQlikApps, getElasticSearchQueryForQlikApps, cleanQlikESResults } = require('./globalSearchUtils');
const { DataLibrary } = require('../../lib/dataLibrary');

const redisAsyncClientDB = 7;

class GlobalSearchHandler extends SearchHandler {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			constants = constantsFile,
			database = databaseFile,
			dcUtils = dataCatalogUtils,
			dataLibrary = new DataLibrary(opts),
		} = opts;
		super({ redisClientDB: redisAsyncClientDB, ...opts });

		this.logger = logger;
		this.constants = constants;
		this.database = database;
		this.dcUtils = dcUtils;
		this.dataLibrary = dataLibrary;
	}

	async searchHelper(req, userId, storeHistory) {
		const historyRec = {
			user_id: getUserIdFromSAMLUserId(req),
			searchText: '',
			startTime: new Date().toISOString(),
			numResults: -1,
			endTime: null,
			hadError: false,
			isSemanticSearch: false,
			tiny_url: '',
			cachedResult: false,
		};

		const {
			useGCCache,
			forCacheReload = false,
			showTutorial,
			tiny_url,
			cloneName,
			searchType,
			searchVersion,
			searchText,
			limit,
			offset,
			category,
		} = req.body;

		try {
			historyRec.searchText = searchText;
			historyRec.showTutorial = showTutorial;
			historyRec.tiny_url = tiny_url;
			historyRec.clone_name = cloneName;
			historyRec.searchType = searchType;
			historyRec.search_version = searchVersion;
			historyRec.request_body = req.body;

			const cloneSpecificObject = {};

			// if (!forCacheReload && useGCCache && offset === 0) {
			// 	return this.getCachedResults(req, historyRec, cloneSpecificObject, userId, storeHistory);
			// }
			const searchResults = { totalCount: 0 };
			searchResults[category] = {};

			let results = [];
			switch (category) {
				case 'applications':
					searchResults[category] = await this.getApplicationResults(searchText, offset, limit, userId);
					break;
				case 'dashboards':
					searchResults[category] = await this.getDashboardResults(searchText, offset, limit, userId);
					break;
				case 'dataSources':
					searchResults[category] = await this.getDataCatalogResults(
						searchText,
						offset,
						limit,
						'Data Source',
						userId
					);
					break;
				case 'databases':
					searchResults[category] = await this.getDataCatalogResults(
						searchText,
						offset,
						limit,
						'Database',
						userId
					);
					break;
				case 'models':
					searchResults[category] = await this.getDataCatalogResults(
						searchText,
						offset,
						limit,
						'AI/ML Model',
						userId
					);
					break;
				default:
					break;
			}

			// try to store to cache
			if (useGCCache && searchResults) {
				await this.storeCachedResults(req, historyRec, searchResults, cloneSpecificObject, userId);
			}

			// try storing results record
			if (storeHistory) {
				try {
					const { totalCount } = searchResults;
					historyRec.endTime = new Date().toISOString();
					historyRec.numResults = totalCount;
					await this.storeRecordOfSearchInPg(historyRec, userId);
				} catch (e) {
					this.logger.error(e.message, 'BG3V9N8', userId);
				}
			}

			return searchResults;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'VU2YLNH', userId);
			historyRec.endTime = new Date().toISOString();
			historyRec.hadError = true;
			throw message;
		}
	}

	async callFunctionHelper(req, userId, res) {
		const { functionName } = req.body;

		switch (functionName) {
			default:
				this.logger.error(
					`There is no function called ${functionName} defined in the policySearchHandler`,
					'4BC876D',
					userId
				);
		}
	}

	async getApplicationResults(searchText, offset, limit, userId) {
		try {
			const t0 = new Date().getTime();
			const hitQuery = `select description, permission, href, link_label, id
							  from megamenu_links
							  where (section = 'Applications' and link_label not like '%Overview%' and href is not null)
								 or (href like 'https://covid-status.data.mil%' and section = 'Analytics')`;
			const results = await this.database.uot.query(hitQuery, { type: Sequelize.QueryTypes.SELECT, raw: true });
			const [apps, appResults] = this.performApplicationSearch(results, lunrSearchUtils.parse(searchText));
			const tmpReturn = this.generateRespData(apps, appResults, offset, limit);
			const t1 = new Date().getTime();
			this.logger.info(`Get Application Results Time: ${((t1 - t0) / 1000).toFixed(2)}`, 'MJ2D6VGTime', userId);
			return tmpReturn;
		} catch (err) {
			this.logger.error(err, 'MJ2D6VG', userId);
			return { hits: [], totalCount: 0, count: 0 };
		}
	}

	async getDashboardResults(searchText, offset, limit, userId) {
		try {
			const t0 = new Date().getTime();
			const clientObj = { esClientName: 'gamechanger', esIndex: this.constants.GLOBAL_SEARCH_OPTS.ES_INDEX };
			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms({ searchText });
			const isVerbatimSearch = this.searchUtility.isVerbatim(searchText);
			const plainQuery = isVerbatimSearch ? parsedQuery.replace(/["']/g, '') : parsedQuery;
			const body = { searchText, parsedQuery, searchTerms, plainQuery, limit, offset };
			const esQuery = getElasticSearchQueryForQlikApps(body, userId, this.logger);

			const esResults = await this.dataLibrary.queryElasticSearch(
				clientObj.esClientName,
				clientObj.esIndex,
				esQuery,
				userId
			);

			const returnData = cleanQlikESResults(esResults, userId, this.logger);

			const userApps = await getQlikApps({}, userId.substring(0, userId.length - 4), this.logger, false, false);

			returnData.hits = this.mergeUserApps(returnData.hits, userApps.data || []);

			const t1 = new Date().getTime();
			this.logger.info(`Get Dashboard Results Time: ${((t1 - t0) / 1000).toFixed(2)}`, 'WS18EKRTime', userId);
			return returnData;
		} catch (err) {
			this.logger.error(err, 'WS18EKR', userId);
			return { hits: [], totalCount: 0, count: 0 };
		}
	}

	async getDataCatalogResults(searchText, offset, limit, searchType = 'all', userId) {
		const t0 = new Date().getTime();
		const searchTypeIds = await this.dcUtils.getSearchTypeId(searchType);
		const qStatus = await this.dcUtils.getQueryableStatuses();

		try {
			const defaultSearchOptions = {
				keywords: this.dcUtils.cleanSearchText(searchText),
				filters: [
					{
						field: 'assetType',
						values: searchTypeIds,
					},
					{
						field: 'status',
						values: qStatus,
					},
				],
				highlights: {
					preTag: '<em>',
					postTag: '</em>',
				},
				limit,
				offset,
			};

			console.log(JSON.stringify(defaultSearchOptions));

			if (!searchText) throw new Error('keywords is required in the request body');

			const url = this.dcUtils.getCollibraUrl() + '/search';
			const fullSearch = { ...defaultSearchOptions, limit, offset, searchText, searchType };
			const response = await axios.post(url, fullSearch, this.dcUtils.getAuthConfig());

			let cleanedData = { total: 0, results: [] };

			if (response.data.results) {
				// Get all the user ids
				const userIds = new Set(response.data.results.map((result) => result.resource.createdBy));

				// Get all assets
				const assetCalls = response.data.results.map((result) => {
					const tempUrl = this.dcUtils.getCollibraUrl() + '/assets/' + result.resource.id;
					return axios.get(tempUrl, this.dcUtils.getAuthConfig());
				});

				const assetsResults = await Promise.all(assetCalls);
				const combinedAssetResults = {};
				assetsResults.forEach((assetResult) => {
					const data = assetResult.data;
					combinedAssetResults[data.id] = data;
					userIds.add(data['lastModifiedBy']);
				});

				let tempUrl = this.dcUtils.getCollibraUrl() + '/users?offset=0';
				userIds.forEach((userId) => (tempUrl += '&userId=' + userId));
				const { data: userData } = await axios.get(tempUrl, this.dcUtils.getAuthConfig());
				const combinedUserData = {};
				userData.results.forEach((data) => {
					combinedUserData[data.id] = data;
				});
				cleanedData = await this.cleanDataCatalogResults(
					response.data,
					combinedAssetResults,
					combinedUserData,
					userId
				);
			}

			const t1 = new Date().getTime();
			this.logger.info(
				`Get Data Catalog Results Time for ${searchType}: ${((t1 - t0) / 1000).toFixed(2)}`,
				'FE656U9Time',
				userId
			);

			return cleanedData;
		} catch (err) {
			this.logger.error(err, 'FE656U9', userId);
			return { total: 0, results: [] };
		}
	}

	async cleanDataCatalogResults(data, fullAssetDetails, fullUserData, userId) {
		const attributeTypes = await this.dcUtils.getAttributeTypes();

		try {
			data.results.forEach((result) => {
				result.resource['domain'] = fullAssetDetails[result.resource.id]['domain'];
				result.resource['lastModifiedBy'] = fullAssetDetails[result.resource.id]['lastModifiedBy'];

				Object.keys(result.resource).forEach((resourceKey) => {
					if (resourceKey === 'createdOn' || resourceKey === 'lastModifiedOn') {
						const newDate = new Date(result.resource[resourceKey]);
						result.resource[resourceKey] = newDate.toLocaleString();
					}

					if (resourceKey === 'status' || resourceKey === 'type' || resourceKey === 'domain') {
						result.resource[resourceKey] = result.resource[resourceKey]['name'];
					}

					if (resourceKey === 'createdBy' || resourceKey === 'lastModifiedBy') {
						const tempUser = fullUserData[result.resource[resourceKey]];
						result.resource[resourceKey] = {
							firstName: tempUser['firstName'],
							lastName: tempUser['lastName'],
							emailAddress: tempUser['emailAddress'],
						};
					}
				});

				result.highlights.forEach((highlight) => {
					if (highlight.field.includes('attribute:')) {
						const attributeID = highlight.field.split(':')[1];
						highlight.field = attributeTypes[attributeID];
					}
				});
			});
		} catch (e) {
			this.logger.error(e, 'YCD2HPY', userId);
		}

		return data;
	}

	performApplicationSearch(allApps, searchText) {
		// create a map of apps keyed by id field so that we can reference them from the search results
		let apps = __.keyBy(allApps, 'id');

		// create lunr search index
		let idx = lunr(function () {
			// key field in our data that search results will be keyed by
			this.ref('id');
			// fields to search
			this.field('link_label');
			this.field('description');
			// data to search
			allApps.forEach(function (app) {
				this.add(app);
			}, this);
		});

		// perform search
		let searchResults = idx.search(searchText);

		return [apps, searchResults];
	}

	generateRespData(apps, searchResults, offset, limit) {
		try {
			let ret = [];

			let pagedResult = searchResults.slice(offset, offset + limit);

			for (let res of pagedResult) {
				ret.push({ ...apps[res.ref], score: res.score });
			}

			return { hits: ret, totalCount: searchResults.length, count: ret.length };
		} catch (e) {
			this.logger.error(e, 'QW8UGJM');
			return { hits: [], totalCount: 0, count: 0 };
		}
	}

	performSearch(allApps, searchText) {
		// create a map of apps keyed by id field so that we can reference them from the search results
		let apps = _.keyBy(allApps, 'id');

		// create lunr search index
		let idx = lunr(function () {
			// key field in our data that search results will be keyed by
			this.ref('id');
			// fields to search
			this.field('name');
			this.field('description');
			this.field('stream', { extractor: ({ stream: { name } }) => name });

			this.field('customProperties', {
				extractor: ({ customProperties }) =>
					customProperties.reduce((prev, curr) => {
						return prev.concat([curr?.value, curr?.schemaPath, curr?.definition?.name]);
					}, []),
			});

			this.field('tags', { extractor: ({ tags: { name } }) => name });

			// data to search
			allApps.forEach(function (app) {
				this.add(app);
			}, this);
		});

		// perform search
		let searchResults = idx.search(searchText);

		return [apps, searchResults];
	}

	mergeUserApps(apps, userApps) {
		for (let app of apps) {
			app.restricted = !_.find(userApps, (userApp) => userApp.id === app.id);
		}
		return apps;
	}
}

module.exports = GlobalSearchHandler;
