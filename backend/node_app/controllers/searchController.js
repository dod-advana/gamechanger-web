const LOGGER = require('@dod-advana/advana-logger');
const constantsFile = require('../config/constants');
const SearchUtility = require('../utils/searchUtility');
const { ExportHistoryController } = require('./exportHistoryController');
const GC_HISTORY = require('../models').gc_history;
const FAVORITE_SEARCH = require('../models').favorite_searches;
const GC_SEARCH_URLS = require('../models').gc_search_urls;
const APP_SETTINGS = require('../models').app_settings;
const { MLApiClient } = require('../lib/mlApiClient');
const { Thesaurus } = require('../lib/thesaurus');
const asyncRedisLib = require('async-redis');
const sparkMD5Lib = require('spark-md5');
const _ = require('lodash');
const { DataLibrary } = require('../lib/dataLibrary');
const { Reports } = require('../lib/reports');
const { DataTrackerController } = require('../controllers/dataTrackerController');
const { getTenDigitUserId } = require('../utils/userUtility');

const redisAsyncClientDB = 7;
const abbreviationRedisAsyncClientDB = 9;
const separatedRedisAsyncClientDB = 4;

const TRANSFORM_ERRORED = 'TRANSFORM_ERRORED';

class SearchController {
	constructor(opts = {}) {
		const {
			constants = constantsFile,
			logger = LOGGER,
			searchUtility = new SearchUtility(opts),
			gcHistory = GC_HISTORY,
			mlApi = new MLApiClient(opts),
			thesaurus = new Thesaurus(opts),
			async_redis,
			favoriteSearch = FAVORITE_SEARCH,
			sparkMD5 = sparkMD5Lib,
			dataApi = new DataLibrary(opts),
			exportHistoryController = new ExportHistoryController(opts),
			reports = new Reports(opts),
			gcSearchURLs = GC_SEARCH_URLS,
			appSettings = APP_SETTINGS,
			dataTracker = new DataTrackerController(opts),
		} = opts;

		this.logger = logger;
		this.searchUtility = searchUtility;
		this.gcHistory = gcHistory;
		this.mlApi = mlApi;
		this.thesaurus = thesaurus;
		this.favoriteSearch = favoriteSearch;
		this.sparkMD5 = sparkMD5;
		this.constants = constants;
		this.dataApi = dataApi;
		this.exportHistory = exportHistoryController;
		this.reports = reports;
		this.gcSearchURLs = gcSearchURLs;
		this.dataTracker = dataTracker;
		this.appSettings = appSettings;

		if (!async_redis) {
			this.redisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
			this.separatedRedisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
		} else {
			this.redisAsyncClient = async_redis.createClient(process.env.REDIS_URL || 'redis://localhost');
			this.separatedRedisAsyncClient = async_redis.createClient(process.env.REDIS_URL || 'redis://localhost');
		}

		this.redisAsyncClient.select(redisAsyncClientDB);
		this.separatedRedisAsyncClient.select(separatedRedisAsyncClientDB);

		this.storeRecordOfSearchInPg = this.storeRecordOfSearchInPg.bind(this);
		this.transformDocumentSearchResults = this.transformDocumentSearchResults.bind(this);
		this.convertTinyURL = this.convertTinyURL.bind(this);
		this.shortenSearchURL = this.shortenSearchURL.bind(this);
		this.getElasticSearchIndex = this.getElasticSearchIndex.bind(this);
		this.setElasticSearchIndex = this.setElasticSearchIndex.bind(this);
		this.documentSearchOneID = this.documentSearchOneID.bind(this);
		this.combinedSearch = this.combinedSearch.bind(this);
		this.queryEs = this.queryEs.bind(this);
		this.expandTerms = this.expandTerms.bind(this);
	}

	async combinedSearch(searchText, userId, req, expansionDict, index, operator, offset) {
		let filename;
		let sentenceResults = this.mlApi.getSentenceTransformerResults(searchText, userId);
		let searchResults = this.documentSearch(req, { ...req.body, expansionDict, index, operator }, userId);
		const resultArray = await Promise.all([sentenceResults, searchResults]);
		sentenceResults = resultArray[0];
		searchResults = resultArray[1];

		if (sentenceResults[0] !== undefined && sentenceResults[0].score >= 0.95) {
			filename = sentenceResults[0].id;
			searchResults.totalCount += 1;
		}
		const topSentenceFind = searchResults.docs.find((item) => item.id === filename);
		if (sentenceResults === TRANSFORM_ERRORED) {
			searchResults.transformFailed = true;
		} else if (topSentenceFind && offset === 0) {
			// if the +95% result exists within the documentSearch results, reorder them
			topSentenceFind.search_mode = 'Intelligent Search';
			searchResults.docs.unshift(topSentenceFind);
		} else if (offset === 0 && filename) {
			// if sentenceSearch is not found in the documentSearch results, and we're on the first page, find and add
			const sentenceSearchRes = await this.documentSearchOneID(req, { ...req.body, id: filename }, userId);
			sentenceSearchRes.docs[0].search_mode = 'Intelligent Search';
			searchResults.docs.unshift(sentenceSearchRes.docs[0]);
		}
		return searchResults;
	}

	async documentSearch(req, body, userId) {
		try {
			const permissions = req.permissions ? req.permissions : [];
			const {
				getIdList,
				selectedDocuments,
				expansionDict = {},
				forGraphCache = false,
				cloneData = {},
				searchType,
				index = '',
			} = body;
			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms(body);
			body.searchTerms = searchTerms;
			body.parsedQuery = parsedQuery;

			let esClientName = 'gamechanger';
			let esIndex = index;
			let esQuery = '';

			if (cloneData.clone_data) {
				switch (cloneData.clone_data.esCluster) {
					case 'eda':
						if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')) {
							const { extSearchFields = [], extRetrieveFields = [] } =
								this.constants.EDA_ELASTIC_SEARCH_OPTS;

							body.extSearchFields = extSearchFields.map((field) => field.toLowerCase());
							body.extStoredFields = extRetrieveFields.map((field) => field.toLowerCase());
							esQuery = this.searchUtility.getElasticsearchPagesQuery(body, userId);

							esClientName = 'eda';
						} else {
							throw 'Unauthorized';
						}
						break;
					default:
						esClientName = 'gamechanger';
				}
			}

			if (esQuery === '') {
				if (forGraphCache) {
					esQuery = this.searchUtility.getElasticsearchQueryForGraphCache(body, userId);
				} else if (searchType === 'Simple') {
					esQuery = this.searchUtility.getSimpleSyntaxElasticsearchQuery(body, userId);
					esIndex = this.constants.GAME_CHANGER_OPTS.simpleIndex;
				} else {
					esQuery = this.searchUtility.getElasticsearchQuery(body, userId);
				}
			}

			const results = await this.dataApi.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			if (
				results &&
				results.body &&
				results.body.hits &&
				results.body.hits.total &&
				results.body.hits.total.value &&
				results.body.hits.total.value > 0
			) {
				if (getIdList) {
					return this.searchUtility.cleanUpIdEsResults(results, searchTerms, userId, expansionDict);
				}

				if (forGraphCache) {
					return this.searchUtility.cleanUpIdEsResultsForGraphCache(results, userId);
				} else {
					return this.searchUtility.cleanUpEsResults({
						raw: results,
						searchTerms,
						user: userId,
						selectedDocuments,
						expansionDict,
						index: esIndex,
						query: esQuery,
					});
				}
			} else {
				this.logger.error('Error with Elasticsearch results', 'M91NVGW', userId);
				return { totalCount: 0, docs: [] };
			}
		} catch (e) {
			const { message } = e;
			this.logger.error(message, 'KCYH5Z5', userId);
			throw e;
		}
	}

	async documentSearchOneID(req, body, userId) {
		try {
			const permissions = req.permissions ? req.permissions : [];

			const { cloneData = {}, id = '', searchTerms = [], expansionDict = {}, limit = 20 } = body;

			const { index } = this.constants.EDA_ELASTIC_SEARCH_OPTS;
			const esQuery = this.searchUtility.getESQueryUsingOneID(id, userId, limit);

			let esClientName = 'gamechanger';
			let esIndex = 'gamechanger';

			const esResults = await this.dataApi.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			if (
				esResults &&
				esResults.body &&
				esResults.body.hits &&
				esResults.body.hits.total &&
				esResults.body.hits.total.value &&
				esResults.body.hits.total.value > 0
			) {
				return this.searchUtility.cleanUpEsResults({
					raw: esResults,
					searchTerms,
					user: userId,
					selectedDocuments: null,
					expansionDict,
					index: esIndex,
					query: esQuery,
				});
			} else {
				this.logger.error('Error with Elasticsearch results', 'RLNTXAR', userId);
				return { totalCount: 0, docs: [] };
			}
		} catch (err) {
			const msg = err && err.message ? `${err.message}` : `${err}`;
			this.logger.error(msg, 'U1EIAR2', userId);
			throw msg;
		}
	}

	async documentSearchUsingParaId(req, body, userId) {
		try {
			const permissions = req.permissions ? req.permissions : [];

			const { cloneData = {}, filenames = [], expansionDict = {} } = body;

			const [parsedQuery, searchTerms] = await this.searchUtility.getEsSearchTerms(body);
			body.searchTerms = searchTerms;
			body.parsedQuery = parsedQuery;
			body.paraIds = filenames;

			const { index } = this.constants.EDA_ELASTIC_SEARCH_OPTS;

			const esQuery = this.searchUtility.getElasticsearchQueryUsingParagraphId(body, userId);

			let clientObj = this.getESClient(cloneData, permissions, index);

			const esResults = await this.dataApi.queryElasticSearch(
				clientObj.esClientName,
				clientObj.esIndex,
				esQuery,
				userId
			);
			if (
				esResults &&
				esResults.body &&
				esResults.body.hits &&
				esResults.body.hits.total &&
				esResults.body.hits.total.value &&
				esResults.body.hits.total.value > 0
			) {
				return this.searchUtility.cleanUpEsResults({
					raw: esResults,
					searchTerms,
					user: esResults,
					selectedDocuments: null,
					expansionDict,
					index: clientObj.esIndex,
					query: esQuery,
				});
			} else {
				this.logger.error('Error with Elasticsearch results', 'JBVXMP6', userId);
				return { totalCount: 0, docs: [] };
			}
		} catch (err) {
			const msg = err && err.message ? `${err.message}` : `${err}`;
			this.logger.error(msg, 'A5TS6ST', userId);
			throw msg;
		}
	}

	async storeSearchES(historyRec) {
		const {
			user_id,
			searchText,
			startTime,
			endTime,
			hadError,
			numResults,
			searchType,
			cachedResult,
			orgFilters,
			tiny_url,
			request_body,
			search_version,
			clone_name,
		} = historyRec;
	}

	async storeRecordOfSearchInPg(historyRec, cloneData = {}, showTutorial) {
		let userId = 'Unknown';
		try {
			const {
				user_id,
				searchText,
				startTime,
				endTime,
				hadError,
				numResults,
				searchType,
				cachedResult,
				orgFilters,
				tiny_url,
				request_body,
				search_version,
				clone_name,
			} = historyRec;

			if (user_id) userId = user_id;

			const obj = {
				user_id: user_id,
				new_user_id: user_id,
				search: searchText,
				run_at: startTime,
				completion_time: endTime,
				had_error: hadError,
				num_results: numResults,
				search_type: searchType,
				cached_result: cachedResult,
				org_filters: orgFilters,
				is_tutorial_search: showTutorial,
				tiny_url: tiny_url,
				clone_name,
				request_body,
				search_version,
			};

			this.gcHistory.create(obj);
		} catch (err) {
			this.logger.error(err, 'UQ5B8CP', userId);
		}
	}

	async transformDocumentSearchResults(docs, searchText, userId) {
		try {
			let flatHits = [];
			let rankedDocs = [];

			// removing the highlighting that comes from elasticsearch and adds pagenumber to the id
			docs.forEach((doc) => {
				const updatedHits = doc.pageHits.map((hit) => {
					return { id: `${doc.id}+${hit.pageNumber}`, text: hit.snippet.replace(/<em>(.*?)<\/em>/g, '$1') };
				});
				flatHits = flatHits.concat(updatedHits);
			});
			const transformedResults = await this.mlApi.transformResults(searchText, flatHits, userId);

			const aggregated = new Map();

			// highlights context and aggregates the flattened pageHits to their respective docIds
			transformedResults.answers.forEach((r) => {
				const { text, answer, id } = r;
				const [docId, parNum] = id.split('+');
				const highlightedText = text.replace(answer, `<em>${answer}</em>`);
				if (!aggregated.get(docId)) {
					aggregated.set(docId, [{ pageNumber: parNum, snippet: highlightedText }]);
				} else {
					const arr = aggregated.get(docId);
					arr.push({ pageNumber: parNum, snippet: highlightedText });
					aggregated.set(docId, arr);
				}
			});

			// pushes newly aggregated docs to an array in new ranked order
			for (let [docId, hits] of aggregated) {
				const d = docs.filter((doc) => doc.id === docId);
				const updatedDoc = { ...d[0], pageHits: hits };
				rankedDocs.push(updatedDoc);
			}

			return rankedDocs;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, '3NF4CE8', userId);
			return TRANSFORM_ERRORED;
		}
	}

	async convertTinyURL(req, res) {
		const userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
		const { url } = req.body;

		try {
			const tinyUrl = await this.convertTiny(url);

			if (tinyUrl && tinyUrl.url) {
				res.status(200).send({ url: tinyUrl.url });
			} else {
				res.status(200).send({ url: null });
			}
		} catch (err) {
			this.logger.error(err.message, 'X3R6DI5', userId);
			res.status(500).send(err);
		}
	}

	async convertTiny(url) {
		const id = parseInt(url, 10);
		if (isNaN(id)) {
			return null;
		}
		const tinyUrl = await this.gcSearchURLs.findOne({
			where: {
				id,
			},
			raw: true,
		});

		return tinyUrl;
	}

	async shortenSearchURL(req, res) {
		let userId = 'webapp_unknown';
		try {
			const { url } = req.body;
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
			const [tiny] = await this.gcSearchURLs.findOrCreate({
				where: { url: url },
				defaults: {
					url: url,
				},
				raw: true,
			});

			const tinyURL = tiny ? tiny.id : '';

			res.status(200).send({ tinyURL });
		} catch (err) {
			this.logger.error(err.message, '8NA29ET', userId);
			res.status(500).send(err);
		}
	}

	async getElasticSearchIndex(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
			const index = await this.redisAsyncClient.get('esIndex');
			res.status(200).send(index);
		} catch (err) {
			this.logger.error(err.message, 'US6Q4ON', userId);
			res.status(500).send(err);
		}
	}

	async queryEs(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
			const { query, esClient } = req.body;
			let safeEsClient = esClient;
			let index = this.constants.GAME_CHANGER_OPTS.index;
			if (req.permissions.includes('View EDA') || req.permissions.includes('Webapp Super Admin')) {
				safeEsClient = esClient;
				if (safeEsClient === 'eda') {
					index = this.constants.EDA_ELASTIC_SEARCH_OPTS.index;
				}
			} else {
				safeEsClient = 'gamechanger';
			}
			console.log(`Querying ${esClient} with index ${index}`);
			const esResults = await this.dataApi.queryElasticSearch(esClient, index, query, userId);
			res.status(200).send(esResults);
		} catch (err) {
			this.logger.error(err.message, 'XLG7Z0K', userId);
			res.status(500).send(err);
		}
	}

	async setElasticSearchIndex(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
			const { index } = req.body;
			await this.redisAsyncClient.del('esIndex');
			await this.redisAsyncClient.set('esIndex', index);
			res.status(200).send('Set Elasticsearch Index');
		} catch (err) {
			this.logger.error(err.message, 'XLG7Z0K', userId);
			res.status(500).send(err);
		}
	}
	getESClient(cloneData, permissions, index) {
		let esClientName = 'gamechanger';
		let esIndex = 'gamechanger';
		switch (cloneData.clone_name) {
			case 'eda':
				if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')) {
					esClientName = 'eda';
					esIndex = this.constants.EDA_ELASTIC_SEARCH_OPTS.index;
					return { esClientName, esIndex };
				} else {
					throw 'Unauthorized';
				}
			default:
				esClientName = 'gamechanger';
		}

		if (index) {
			esIndex = index;
		} else if (this.constants.GAME_CHANGER_OPTS.index) {
			esIndex = this.constants.GAME_CHANGER_OPTS.index;
		}

		return { esClientName, esIndex };
	}

	async expandTerms(req, res) {
		const { searchText } = req.body;
		let expansionDict = {};
		try {
			expansionDict = await this.mlApi.queryExpansion(searchText);
		} catch (e) {
			// log error and move on, expansions are not required
			this.logger.error('Cannot get expanded search terms, continuing with search', '93SQB38');
		}
		res.status(200).send(expansionDict);
	}
}

module.exports.SearchController = SearchController;
