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
			showTutorial,
			tiny_url,
			cloneName,
			searchType,
			searchVersion,
			searchText,
			limit,
			offset,
			category,
			favoriteApps,
			isForFavorites,
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

			const searchResults = { totalCount: 0 };
			searchResults[category] = {};

			switch (category) {
				case 'applications':
					searchResults[category] = await this.getApplicationResults(
						searchText,
						offset,
						limit,
						favoriteApps,
						isForFavorites,
						userId
					);
					break;
				case 'dashboards':
					searchResults[category] = await this.getDashboardResults(
						searchText,
						offset,
						limit,
						favoriteApps,
						isForFavorites,
						userId
					);
					break;
				case 'dataSources':
					searchResults[category] = await this.getDataCatalogResults(
						searchText,
						offset,
						limit,
						favoriteApps,
						isForFavorites,
						userId,
						'Data Source'
					);
					break;
				case 'databases':
					searchResults[category] = await this.getDataCatalogResults(
						searchText,
						offset,
						limit,
						favoriteApps,
						isForFavorites,
						userId,
						'Database'
					);
					break;
				case 'models':
					searchResults[category] = await this.getDataCatalogResults(
						searchText,
						offset,
						limit,
						favoriteApps,
						isForFavorites,
						userId,
						'AI/ML Model'
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

	async callFunctionHelper(req, userId) {
		const { functionName } = req.body;

		this.logger.error(
			`There is no function called ${functionName} defined in the policySearchHandler`,
			'4BC876D',
			userId
		);
	}

	async getApplicationResults(searchText, offset, limit, favoriteApps, isForFavorites, userId) {
		try {
			const t0 = new Date().getTime();
			let hitQuery = `select description, permission, href, link_label, id
				from megamenu_links
				where (section = 'Applications' and link_label not like '%Overview%' and href is not null)
				or (href like 'https://covid-status.data.mil%' and section = 'Analytics')`;
			if (isForFavorites) {
				const tmpFavorites = favoriteApps.filter((app) => !isNaN(app));
				hitQuery = `select description, permission, href, link_label, id
          from megamenu_links
          where id in (${tmpFavorites.join(',')})`;
			}
			let results = await this.database.uot.query(hitQuery, { type: Sequelize.QueryTypes.SELECT, raw: true });
			let tmpReturn;
			if (isForFavorites) {
				tmpReturn = {
					totalCount: results.length,
					count: results.length,
					results,
				};
			} else {
				const [apps, appResults] = this.performApplicationSearch(results, lunrSearchUtils.parse(searchText));
				tmpReturn = this.generateRespData(apps, appResults, offset, limit);
			}

			const t1 = new Date().getTime();
			this.logger.info(`Get Application Results Time: ${((t1 - t0) / 1000).toFixed(2)}`, 'MJ2D6VGTime', userId);
			return tmpReturn;
		} catch (err) {
			this.logger.error(err, 'MJ2D6VG', userId);
			return { hits: [], totalCount: 0, count: 0 };
		}
	}

	async getDashboardResults(searchText, offset, limit, favoriteApps, isForFavorites, userId) {
		try {
			const t0 = new Date().getTime();
			const clientObj = { esClientName: 'gamechanger', esIndex: this.constants.GLOBAL_SEARCH_OPTS.ES_INDEX };
			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms({ searchText });
			const isVerbatimSearch = this.searchUtility.isVerbatim(searchText);
			const plainQuery = isVerbatimSearch ? parsedQuery.replace(/["']/g, '') : parsedQuery;
			const body = {
				searchText,
				parsedQuery,
				searchTerms,
				plainQuery,
				limit,
				offset,
				favoriteApps,
				isForFavorites,
			};
			const esQuery = getElasticSearchQueryForQlikApps(body, userId, this.logger);

			const esResults = await this.dataLibrary.queryElasticSearch(
				clientObj.esClientName,
				clientObj.esIndex,
				esQuery,
				userId
			);

			const returnData = cleanQlikESResults(esResults, userId, this.logger);

			const userApps = await getQlikApps(userId.substring(0, userId.length - 4), this.logger, false, false, {});

			returnData.results = this.mergeUserApps(returnData.hits, userApps.data || []);

			const t1 = new Date().getTime();
			this.logger.info(`Get Dashboard Results Time: ${((t1 - t0) / 1000).toFixed(2)}`, 'WS18EKRTime', userId);
			return returnData;
		} catch (err) {
			this.logger.error(err, 'WS18EKR', userId);
			return { hits: [], totalCount: 0, count: 0 };
		}
	}

	async getDataCatalogResults(searchText, offset, limit, favoriteApps, isForFavorites, userId, searchType = 'all') {
		const t0 = new Date().getTime();

		try {
			let cleanedData;

			if (isForFavorites) {
				cleanedData = this.getDataCatalogResultsForFavorites(favoriteApps, userId, searchType);
			} else {
				cleanedData = this.getDataCatalogResultsSearch(searchText, offset, limit, userId, searchType);
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

	async getDataCatalogResultsForFavorites(favoriteApps, userId, searchType) {
		try {
			let tempUrl;
			const userIds = new Set();
			const searchTypeIds = await this.dcUtils.getSearchTypeId(searchType);

			// Get all assets
			const assetCalls = favoriteApps.map((app) => {
				tempUrl = this.dcUtils.getCollibraUrl() + '/assets/' + app;
				return axios.get(tempUrl, this.dcUtils.getAuthConfig());
			});

			const assetsResults = await Promise.allSettled(assetCalls);
			const combinedAssetResults = {};
			const results = [];

			assetsResults.forEach((assetResult) => {
				if (assetResult.status === 'fulfilled') {
					const asset = assetResult.value.data;
					if (searchTypeIds.includes(asset.type.id)) {
						combinedAssetResults[asset.id] = asset;
						userIds.add(asset['lastModifiedBy']);
						results.push({ id: asset.id, resource: asset });
					}
				}
			});

			// Get Attributes
			const assetAttributeCalls = results.map((result) => {
				tempUrl = this.dcUtils.getCollibraUrl() + '/attributes?assetId=' + result.resource.id;
				return axios.get(tempUrl, this.dcUtils.getAuthConfig());
			});

			const assetAttributesResults = await Promise.allSettled(assetAttributeCalls);
			const { combinedAttributeResults, attributeIdMap } = this.handleAttributeResults(assetAttributesResults);

			// Get Users Info
			tempUrl = this.dcUtils.getCollibraUrl() + '/users?offset=0';
			userIds.forEach((usrId) => (tempUrl += '&userId=' + usrId));
			const { data: userData } = await axios.get(tempUrl, this.dcUtils.getAuthConfig());
			const combinedUserData = {};
			userData.results.forEach((data) => {
				combinedUserData[data.id] = data;
			});

			return await this.cleanDataCatalogResults(
				{ results },
				combinedAssetResults,
				combinedAttributeResults,
				attributeIdMap,
				combinedUserData,
				userId
			);
		} catch (err) {
			this.logger.error(err, 'KL86OV6', userId);
			return { total: 0, results: [] };
		}
	}

	async getDataCatalogResultsSearch(searchText, offset, limit, userId, searchType) {
		try {
			const searchTypeIds = await this.dcUtils.getSearchTypeId(searchType);
			const qStatus = await this.dcUtils.getQueryableStatuses();

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

			const url = this.dcUtils.getCollibraUrl() + '/search';
			const fullSearch = { ...defaultSearchOptions, limit, offset, searchText, searchType };
			const response = await axios.post(url, fullSearch, this.dcUtils.getAuthConfig());

			let cleanedData = { total: 0, results: [] };

			if (response.data.results) {
				// Get all the user ids
				const userIds = new Set(response.data.results.map((result) => result.resource.createdBy));
				let tempUrl;

				// Get all assets
				const assetCalls = response.data.results.map((result) => {
					tempUrl = this.dcUtils.getCollibraUrl() + '/assets/' + result.resource.id;
					return axios.get(tempUrl, this.dcUtils.getAuthConfig());
				});
				const assetsResults = await Promise.allSettled(assetCalls);
				const combinedAssetResults = {};
				assetsResults.forEach((assetResult) => {
					if (assetResult.status === 'fulfilled') {
						const data = assetResult.value.data;
						combinedAssetResults[data.id] = data;
						userIds.add(data['lastModifiedBy']);
					}
				});

				// Get Attributes
				const assetAttributeCalls = response.data.results.map((result) => {
					tempUrl = this.dcUtils.getCollibraUrl() + '/attributes?assetId=' + result.resource.id;
					return axios.get(tempUrl, this.dcUtils.getAuthConfig());
				});
				const assetAttributesResults = await Promise.allSettled(assetAttributeCalls);
				const { combinedAttributeResults, attributeIdMap } =
					this.handleAttributeResults(assetAttributesResults);

				// Get Users Info
				tempUrl = this.dcUtils.getCollibraUrl() + '/users?offset=0';
				userIds.forEach((usrId) => (tempUrl += '&userId=' + usrId));
				const { data: userData } = await axios.get(tempUrl, this.dcUtils.getAuthConfig());
				const combinedUserData = {};
				userData.results.forEach((data) => {
					combinedUserData[data.id] = data;
				});
				cleanedData = await this.cleanDataCatalogResults(
					response.data,
					combinedAssetResults,
					combinedAttributeResults,
					attributeIdMap,
					combinedUserData,
					userId
				);
			}

			return cleanedData;
		} catch (err) {
			this.logger.error(err, 'HEDFA5A', userId);
			return { total: 0, results: [] };
		}
	}

	handleAttributeResults(assetAttributesResults) {
		const combinedAttributeResults = {};
		const attributeIdMap = {};
		assetAttributesResults.forEach((attributeResult) => {
			if (attributeResult.status === 'fulfilled') {
				const attributeData = attributeResult.value.data;
				if (attributeData.results.length > 0) {
					combinedAttributeResults[attributeData.results[0].asset.id] = attributeData.results.map(
						(attrResult) => {
							attributeIdMap[attrResult.id] = attrResult.type.name;
							return {
								field: attrResult.type.name,
								value: attrResult.value,
							};
						}
					);
				}
			}
		});

		return { combinedAttributeResults, attributeIdMap };
	}

	async cleanDataCatalogResults(
		data,
		fullAssetDetails,
		combinedAttributeResults,
		attributeIdMap,
		fullUserData,
		userId
	) {
		const attributeTypes = attributeIdMap;

		try {
			data.results.forEach((result) => {
				result.resource['domain'] = fullAssetDetails[result.resource.id]['domain'];
				result.resource['lastModifiedBy'] = fullAssetDetails[result.resource.id]['lastModifiedBy'];
				result.attributes = combinedAttributeResults[result.resource.id];

				Object.keys(result.resource).forEach((resourceKey) => {
					switch (resourceKey) {
						case 'createdOn':
						case 'lastModifiedOn':
							const newDate = new Date(result.resource[resourceKey]);
							result.resource[resourceKey] = newDate.toLocaleString();
							break;
						case 'status':
						case 'type':
						case 'domain':
							result.resource[resourceKey] = result.resource[resourceKey]['name'];
							break;
						case 'createdBy':
						case 'lastModifiedBy':
							const tempUser = fullUserData[result.resource[resourceKey]];
							result.resource[resourceKey] = {
								firstName: tempUser?.['firstName'],
								lastName: tempUser?.['lastName'],
								emailAddress: tempUser?.['emailAddress'],
							};
							break;
						default:
							break;
					}
				});

				if (result.highlights) {
					result.highlights.forEach((highlight) => {
						if (highlight.id) {
							highlight.field = attributeTypes[highlight.id];
						} else if (highlight.field.indexOf('attribute') !== -1) {
							const attId = highlight.field.split(':')[1];
							highlight.field = attributeTypes[attId];
						}
					});
				}
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

			return { results: ret, totalCount: searchResults.length, count: ret.length };
		} catch (e) {
			this.logger.error(e, 'QW8UGJM');
			return { results: [], totalCount: 0, count: 0 };
		}
	}

	mergeUserApps(apps, userApps) {
		for (let app of apps) {
			app.restricted = !_.find(userApps, (userApp) => userApp.id === app.id);
		}
		return apps;
	}
}

module.exports = GlobalSearchHandler;
