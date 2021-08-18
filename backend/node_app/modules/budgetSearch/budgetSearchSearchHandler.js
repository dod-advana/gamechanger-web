const SearchUtility = require('../../utils/searchUtility');
const CONSTANTS = require('../../config/constants');
const { MLApiClient } = require('../../lib/mlApiClient');
const sparkMD5 = require('spark-md5');
const { DataLibrary} = require('../../lib/dataLibrary');
const BudgetSearchSearchUtility = require('./budgetSearchSearchUtility');

const SearchHandler = require('../base/searchHandler');

class BudgetSearchSearchHandler extends SearchHandler {
	constructor(opts = {}) {
		const {
			dataLibrary = new DataLibrary(opts),
			constants = CONSTANTS,
			mlApi = new MLApiClient(opts),
			searchUtility = new SearchUtility(opts),
			budgetSearchSearchUtility = new BudgetSearchSearchUtility(opts),
		} = opts;
		super({ ...opts}); 
		this.dataLibrary = dataLibrary;
		this.constants = constants;
		this.mlApi = mlApi;
		this.searchUtility = searchUtility;
		this.budgetSearchSearchUtility = budgetSearchSearchUtility;
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
			showTutorial = false,
			tiny_url,
			forCacheReload = false
		} = req.body;

		try {
			const permissions = req.permissions ? req.permissions : [];
			historyRec.search = searchText;
			historyRec.searchText = searchText;
			historyRec.tiny_url = tiny_url;
			historyRec.clone_name = cloneName;
			historyRec.search_version = searchVersion;
			historyRec.request_body = req.body;
			historyRec.showTutorial = showTutorial;

			const operator = 'and';
			let clientObj = this.searchUtility.getESClient(cloneName, permissions);
			// log query to ES
			await this.storeEsRecord(clientObj.esClientName, offset, cloneName, userId, searchText);

			let searchResults;
			searchResults = await this.documentSearch(req, {...req.body, expansionDict: {}, operator}, clientObj, userId);
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
	
				await this.dataLibrary.putDocument(esClient, search_history_index, searchLog);
			}
		} catch (e) {
			this.logger.error(e.message, 'UA0YDAL');
		}
	}

	async documentSearch(req, body, clientObj, userId) {
		try {
			const {
				getIdList,
				selectedDocuments,
				expansionDict = {},
				forGraphCache = false,
			} = body;
			body.searchText += " OR AI-Enabled OR AI-Enabling OR Core-AI";

			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms(body);
			body.searchTerms = searchTerms;
			body.parsedQuery = parsedQuery;
	
			const { esClientName, esIndex } = clientObj;

			const esQuery = this.budgetSearchSearchUtility.getElasticsearchQuery(body, userId)
	
			const results = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);

			if (results && results.body && results.body.hits && results.body.hits.total && results.body.hits.total.value && results.body.hits.total.value > 0) {
	
				if (getIdList) {
					return this.searchUtility.cleanUpIdEsResults(results, searchTerms, userId, expansionDict);
				}
	
				if (forGraphCache){
					return this.searchUtility.cleanUpIdEsResultsForGraphCache(results, userId);
				} else {
					return this.searchUtility.cleanUpEsResults(results, searchTerms, userId, selectedDocuments, expansionDict, esIndex, esQuery);
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

	async callFunctionHelper(req, userId) {
		const {functionName} = req.body;

		try {
            switch (functionName) {
                default:
                    this.logger.error(
                        `There is no function called ${functionName} defined in the budgetSearchSearchHandler`,
                        'W8A5BE0',
                        userId
                    );
                    return {};
            }
		} catch (err) {
			console.log(e);
			const { message } = e;
			this.logger.error(message, 'V2L9KW5', userId);
			throw e;
		}
		

	}

}

module.exports = BudgetSearchSearchHandler;
