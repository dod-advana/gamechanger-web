const SearchUtility = require('../../utils/searchUtility');
const EDASearchUtility = require('./edaSearchUtility');
const CONSTANTS = require('../../config/constants');
// const asyncRedisLib = require('async-redis');
// const redisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
// const separatedRedisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
const { MLApiClient } = require('../../lib/mlApiClient');
const sparkMD5 = require('spark-md5');
const { DataLibrary} = require('../../lib/dataLibrary');
// const {Thesaurus} = require('../../lib/thesaurus');

// const redisAsyncClientDB = 4;
// const abbreviationRedisAsyncClientDB = 9;

const SearchHandler = require('../base/searchHandler');

class EdaSearchHandler extends SearchHandler {
	constructor(opts = {}) {
		const {
			dataLibrary = new DataLibrary(opts),
			edaSearchUtility = new EDASearchUtility(opts),
			constants = CONSTANTS,
			mlApi = new MLApiClient(opts),
			searchUtility = new SearchUtility(opts),
			// thesaurus = new Thesaurus(),
			// sep_async_redis = separatedRedisAsyncClient,
			// async_redis = redisAsyncClient
		} = opts;
		super({ ...opts}); //redisClientDB: redisAsyncClientDB,
		this.dataLibrary = dataLibrary;
		this.edaSearchUtility = edaSearchUtility;
		this.constants = constants;
		this.mlApi = mlApi;
		this.searchUtility = searchUtility;
		// this.thesaurus = thesaurus;
		// this.async_redis = async_redis;
		// this.sep_async_redis = sep_async_redis;
	}

	async searchHelper(req, userId, storeHistory) {
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

			const operator = 'and';
			const clientObj = {esClientName: 'eda', esIndex: this.constants.EDA_ELASTIC_SEARCH_OPTS.index};
			// log query to ES
			if (storeHistory) {
				await this.storeEsRecord(clientObj.esClientName, offset, cloneName, userId, searchText);
			}

			let searchResults;
			searchResults = await this.documentSearch(req, {...req.body, expansionDict: {}, operator}, clientObj, userId);
			// try storing results record
			if (storeHistory && !forCacheReload) {
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
			if (storeHistory && !forCacheReload){
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
	
				await this.dataLibrary.putDocument(esClient, search_history_index, searchLog);
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

	async queryContractMods(req, userId) {
		try {
			const clientObj = {esClientName: 'eda', esIndex: this.constants.EDA_ELASTIC_SEARCH_OPTS.index};
			const permissions = req.permissions ? req.permissions : [];
			const { esClientName, esIndex } = clientObj;
			const { awardID, isSearch } = req.body;
			const {id, idv} = this.edaSearchUtility.splitAwardID(awardID);

			let esQuery = '';
			if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')) {
				esQuery = this.edaSearchUtility.getEDAContractQuery(id, idv, false, isSearch, userId);
			} else {
				throw 'Unauthorized';
			}

			// use the award ID to get the related mod numbers
			const results = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			if (results && results.body && results.body.hits && results.body.hits.total && results.body.hits.total.value && results.body.hits.total.value > 0) {
				const hits = results.body.hits.hits;

				if (isSearch) {
					return this.edaSearchUtility.cleanUpEsResults(results, [], userId, [], [], esIndex, esQuery);
				} else {
					const contractMods = [];
					// grab the contract modification number
					for (let hit of hits) {
						contractMods.push(
							{
								modNumber: hit._source.extracted_data_eda_n.modification_number_eda_ext ?? null,
								signatureDate: hit._source.extracted_data_eda_n.signature_date_eda_ext_dt ?? null,
								effectiveDate: hit._source.extracted_data_eda_n.effective_date_eda_ext_dt ?? null
							}
						);
					}
					contractMods.sort((a, b) => { 
						if (!a.modNumber) {
							return 1;
						}
						if (!b.modNumber) {
							return -1;
						}

						if (a.modNumber < b.modNumber) {
							return -1;
						}
						else {
							return 1;
						}
					});

					return contractMods;
				}

			} else {
				this.logger.error('Error with contract mods Elasticsearch results', '3ZCEAYJ', userId);
				return [];
			}
		} catch(err) {
			const { message } = err;
			this.logger.error(message, 'S00CLT7', userId);
			throw err;
		}
	}

	async queryBaseAwardContract(req, userId) {
		try {
			const clientObj = {esClientName: 'eda', esIndex: this.constants.EDA_ELASTIC_SEARCH_OPTS.index};
			const permissions = req.permissions ? req.permissions : [];
			const { esClientName, esIndex } = clientObj;
			const { awardID } = req.body;

			const {id, idv} = this.edaSearchUtility.splitAwardID(awardID);

			let esQuery = '';
			if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')) {
				esQuery = this.edaSearchUtility.getEDAContractQuery(id, idv, true, false, userId);
			} else {
				throw 'Unauthorized';
			}

			// use the award ID to get the base award data only
			const results = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			if (results && results.body && results.body.hits && results.body.hits.total && results.body.hits.total.value && results.body.hits.total.value > 0) {
				const hits = results.body.hits.hits;
				if (hits && hits.length > 0) {
					const data = hits[0];
					const metadata = data._source && data._source.extracted_data_eda_n ? this.edaSearchUtility.getExtractedFields(data._source, data) : {}
					return { ...data._source, ...data.fields, ...metadata };
				}
				else { 
					return {}
				}
			} else {
				this.logger.error('Error with contract base award Elasticsearch results', '3ZCEAYJ', userId);
				return [];
			}
		} catch(err) {
			const { message } = err;
			this.logger.error(message, 'MKNUZQR', userId);
			throw err;
		}

	}

	async querySimilarDocs(req, userId) {
		try {
			const clientObj = {esClientName: 'eda', esIndex: this.constants.EDA_ELASTIC_SEARCH_OPTS.index};
			const permissions = req.permissions ? req.permissions : [];
			const { esClientName, esIndex } = clientObj;
			const { body } = req;
			const { issueOfficeDoDAAC, issueOfficeName } = body;


			let esQuery = '';
			if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')) {
				esQuery = this.edaSearchUtility.getElasticsearchPagesQuery({...body, limit: 5, edaSearchSettings: { issueOfficeDoDAAC, issueOfficeName }}, userId);
			} else {
				throw 'Unauthorized';
			}


			// use the award ID to get the base award data only
			const results = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);

			if (results && results.body && results.body.hits && results.body.hits.total && results.body.hits.total.value && results.body.hits.total.value > 0) {
				const hits = results.body.hits.hits;
				if (hits && hits.length > 0) {
					let data = this.edaSearchUtility.cleanUpEsResults(results, [], userId, [], {}, esIndex, esQuery);
					return data;
				}
				else { 
					return {}
				}
			} else {
				this.logger.error('Error with similar docs Elasticsearch results', 'P1TFZKQ', userId);
				return [];
			}
		} catch(err) {
			const { message } = err;
			this.logger.error(message, 'T5VRV7K', userId);
			throw err;
		}

	}

	async callFunctionHelper(req, userId) {
		const {functionName} = req.body;

		try {
			const permissions = req.permissions ? req.permissions : [];
			if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')) {
				switch (functionName) {
					case 'queryContractMods':
						return await this.queryContractMods(req, userId);
					case 'queryBaseAwardContract':
						return await this.queryBaseAwardContract(req, userId);
					case 'querySimilarDocs':
						return await this.querySimilarDocs(req, userId);
					default:
						this.logger.error(
							`There is no function called ${functionName} defined in the edaSearchHandler`,
							'W8A5BE0',
							userId
						);
						return {};
				}
			}
		} catch (err) {
			console.log(err);
			const { message } = err;
			this.logger.error(message, 'V2L9KW5', userId);
			throw err;
		}
		

	}

}

module.exports = EdaSearchHandler;
