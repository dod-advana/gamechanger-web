const SearchUtility = require('../../utils/searchUtility');
const EDASearchUtility = require('./edaSearchUtility');
const CONSTANTS = require('../../config/constants');
const asyncRedisLib = require('async-redis');
const redisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
const separatedRedisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
const { MLApiClient } = require('../../lib/mlApiClient');
const sparkMD5 = require('spark-md5');
const { DataLibrary} = require('../../lib/dataLibrary');
const {Thesaurus} = require('../../lib/thesaurus');

const redisAsyncClientDB = 4;
const abbreviationRedisAsyncClientDB = 9;

const SearchHandler = require('../base/searchHandler');

class EdaSearchHandler extends SearchHandler {
	constructor(opts = {}) {
		const {
			dataLibrary = new DataLibrary(opts),
			edaSearchUtility = new EDASearchUtility(opts),
			constants = CONSTANTS,
			mlApi = new MLApiClient(opts),
			searchUtility = new SearchUtility(opts),
			thesaurus = new Thesaurus(),
			sep_async_redis = separatedRedisAsyncClient,
			async_redis = redisAsyncClient
		} = opts;
		super({redisClientDB: redisAsyncClientDB, ...opts});
		this.dataLibrary = dataLibrary;
		this.edaSearchUtility = edaSearchUtility;
		this.constants = constants;
		this.mlApi = mlApi;
		this.searchUtility = searchUtility;
		this.thesaurus = thesaurus;
		this.async_redis = async_redis;
		this.sep_async_redis = sep_async_redis;
	}

	async searchHelper(req, userId) {
		const historyRec = {
			user_id: userId,
			clone_name: undefined,
			search: '',
			startTime: new Date().toISOString(),
			numResults: -1,
			endTime: null,
			hadError: false,
			tiny_url: '',
			cachedResult: false,
			search_version: 1,
			request_body: {},
		};

		const {
			searchText,
			searchVersion,
			cloneName,
			offset,
			useGCCache,
			showTutorial = false,
			tiny_url,
			forCacheReload = false
		} = req.body;

		try {
			historyRec.search = searchText;
			historyRec.searchText = searchText;
			historyRec.tiny_url = tiny_url;
			historyRec.clone_name = cloneName;
			historyRec.search_version = searchVersion;
			historyRec.request_body = req.body;
			historyRec.showTutorial = showTutorial;

			const cloneSpecificObject = { };

			const operator = 'and';

			const redisDB = this.sep_async_redis;
			redisDB.select(redisAsyncClientDB);

			const clientObj = {esClientName: 'eda', esIndex: this.constants.EDA_ELASTIC_SEARCH_OPTS.index};

			// log query to ES
			this.storeEsRecord(clientObj.esClientName, offset, cloneName, userId, searchText);

			// try to get search expansion
			const [parsedQuery, termsArray] = this.searchUtility.getEsSearchTerms({searchText});
			let expansionDict = {};
			try {
				expansionDict = await this.mlApi.getExpandedSearchTerms(termsArray, userId);
			} catch (e) {
			// log error and move on, expansions are not required
				if (forCacheReload){
					throw Error('Cannot get expanded search terms in cache reload');
				}
				this.logger.error('Cannot get expanded search terms, continuing with search', '93SQB38', userId);
			}

			let lookUpTerm = searchText.replace(/\"/g, '');
			let useText = true;
			if (termsArray && termsArray.length && termsArray[0]) {
				useText = false;
				lookUpTerm = termsArray[0].replace(/\"/g, '');
			}
			const synonyms = this.thesaurus.lookUp(lookUpTerm);
			let text = searchText;
			if (!useText && termsArray && termsArray.length && termsArray[0]) {
				text = termsArray[0];
			}

			// get expanded abbreviations
			await this.async_redis.select(abbreviationRedisAsyncClientDB);
			let abbreviationExpansions = [];
			let i = 0;
			for (i = 0; i < termsArray.length; i++) {
				let term = termsArray[i];
				let upperTerm = term.toUpperCase().replace(/['"]+/g, '');
				let expandedTerm = await this.async_redis.get(upperTerm);
				let lowerTerm = term.toLowerCase().replace(/['"]+/g, '');
				let compressedTerm = await this.async_redis.get(lowerTerm);
				if (expandedTerm) {
					if (!abbreviationExpansions.includes('"' + expandedTerm.toLowerCase() + '"')) {
						abbreviationExpansions.push('"' + expandedTerm.toLowerCase() + '"');
					}
				}
				if (compressedTerm) {
					if (!abbreviationExpansions.includes('"' + compressedTerm.toLowerCase() + '"')) {
						abbreviationExpansions.push('"' + compressedTerm.toLowerCase() + '"');
					}
				}
			}

			// removing abbreviations of expanded terms (so if someone has "dod" AND "department of defense" in the search, it won't show either in expanded terms)
			let cleanedAbbreviations = [];

			expansionDict = this.searchUtility.combineExpansionTerms(expansionDict, synonyms, text, cleanedAbbreviations, userId);
			// this.logger.info('exp: ' + expansionDict);
			await this.async_redis.select(redisAsyncClientDB);

			let searchResults;
			searchResults = await this.documentSearch(req, {...req.body, expansionDict, operator}, clientObj, userId);
			// try storing results record
			if (!forCacheReload) {
				try {
					const { totalCount } = searchResults;
					historyRec.endTime = new Date().toISOString();
					historyRec.numResults = totalCount;
					await this.storeRecordOfSearchInPg(historyRec, userId);
				} catch (e) {
					this.logger.error(e.message, 'ZMVI2TO', userId);
				}
			}

			return searchResults;

		} catch (err) {
			if (!forCacheReload){
				const { message } = err;
				this.logger.error(message, '3VOOUHO', userId);
				historyRec.endTime = new Date().toISOString();
				historyRec.hadError = true;
				await this.storeRecordOfSearchInPg(historyRec, showTutorial);
			}
			throw err;
		}
	}

	async storeEsRecord(esClient, offset, clone_name, userId, searchText){
		try {
			// log search query to elasticsearch
			if (offset === 0){
				let clone_log = clone_name || 'policy';
				const searchLog = {
					user_id: sparkMD5.hash(userId),
					search_query: searchText,
					run_time: new Date().getTime(),
					clone_name: clone_log
	
				};
				let search_history_index = this.constants.GAME_CHANGER_OPTS.historyIndex;
	
				this.dataLibrary.putDocument(esClient, search_history_index, searchLog);
			}
		} catch (e) {
			this.logger.error(e.message, 'UA0YDAL');
		}
	}

	async documentSearch(req, body, clientObj, userId) {
		try {
			const permissions = req.permissions ? req.permissions : [];
			const {
				getIdList,
				selectedDocuments,
				expansionDict = {},
				forGraphCache = false,
				forStats = false
			} = body;
			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms(body);
			body.searchTerms = searchTerms;
			body.parsedQuery = parsedQuery;
	
			const { esClientName, esIndex } = clientObj;
			let esQuery = '';
			if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')) {
				const {extSearchFields = [], extRetrieveFields = [] } = this.constants.EDA_ELASTIC_SEARCH_OPTS;
	
				body.extSearchFields = extSearchFields.map((field) => field.toLowerCase());
				body.extStoredFields = extRetrieveFields.map((field) => field.toLowerCase());
				if (forStats) {
					esQuery = this.edaSearchUtility.getElasticsearchStatsQuery(body, userId);
				}
				else {
					esQuery = this.edaSearchUtility.getElasticsearchPagesQuery(body, userId);
				}
	
			} else {
				throw 'Unauthorized';
			}
	
			const results = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			console.log(JSON.stringify(esQuery));
			console.log(results.body.hits.hits.length)
			if (results && results.body && results.body.hits && results.body.hits.total && results.body.hits.total.value && results.body.hits.total.value > 0) {
	
				if (getIdList) {
					return this.searchUtility.cleanUpIdEsResults(results, searchTerms, userId, expansionDict);
				}
	
				if (forGraphCache){
					return this.searchUtility.cleanUpIdEsResultsForGraphCache(results, userId);
				} else {
					return this.edaSearchUtility.cleanUpEsResults(results, searchTerms, userId, selectedDocuments, expansionDict, esIndex, esQuery);
				}
			} else {
				this.logger.error('Error with Elasticsearch results', 'JY3IIJ3', userId);
				return { totalCount: 0, docs: [] };
			}
		} catch (e) {
			console.log(e);
			const { message } = e;
			this.logger.error(message, 'YNR8ZIT', userId);
			throw e;
		}
	}

}

module.exports = EdaSearchHandler;
