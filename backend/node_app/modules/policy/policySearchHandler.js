const LOGGER = require('../../lib/logger');
const SearchUtility = require('../../utils/searchUtility');
const constants = require('../../config/constants');
const asyncRedisLib = require('async-redis');
const redisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
const { MLApiClient } = require('../../lib/mlApiClient');
const { DataTrackerController } = require('../../controllers/dataTrackerController');
const sparkMD5 = require('spark-md5');
const { DataLibrary} = require('../../lib/dataLibrary');
const {Thesaurus} = require('../../lib/thesaurus');
const thesaurus = new Thesaurus();
const FAVORITE_SEARCH = require('../../models').favorite_searches;
const _ = require('lodash');
const SearchHandler = require('../base/searchHandler');
const APP_SETTINGS = require('../../models').app_settings;
const redisAsyncClientDB = 7;
const abbreviationRedisAsyncClientDB = 9;

class PolicySearchHandler extends SearchHandler {
	constructor(opts = {}) {
		const {
			dataTracker = new DataTrackerController(opts),
			logger = LOGGER,
			searchUtility = new SearchUtility(opts),
			dataLibrary = new DataLibrary(opts),
			mlApi = new MLApiClient(opts)
		} = opts;
		super({redisClientDB: redisAsyncClientDB, ...opts});

		this.dataTracker = dataTracker;
		this.logger = logger;
		this.searchUtility = searchUtility;
		this.dataLibrary = dataLibrary;
		this.mlApi = mlApi;
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
			searchType,
			searchVersion,
			cloneName,
			offset,
			orgFilter = 'Department of Defense_Joint Chiefs of Staff_Intelligence Community_United States Code',
			typeFilter,
			useGCCache,
			showTutorial = false,
			tiny_url,
			forCacheReload = false,
			searchFields = {},
			includeRevoked
		} = req.body;

		try {
			historyRec.searchText = searchText;
			historyRec.orgFilters = JSON.stringify(orgFilter);
			historyRec.tiny_url = tiny_url;
			historyRec.clone_name = cloneName;
			historyRec.searchType = searchType;
			historyRec.search_version = searchVersion;
			historyRec.request_body = req.body;
			historyRec.showTutorial = showTutorial;

			const cloneSpecificObject = { orgFilter, searchFields: Object.values(searchFields), includeRevoked };

			const operator = 'and';

			const redisDB = redisAsyncClient;
			redisDB.select(redisAsyncClientDB);

			const clientObj = {esClientName: 'gamechanger', esIndex: constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.index};

			// log query to ES
			this.storeEsRecord(clientObj.esClientName, offset, cloneName, userId, searchText);

			if (!forCacheReload && useGCCache && offset === 0) {
				return this.getCachedResults(req, historyRec, cloneSpecificObject, userId);
			}
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
			const synonyms = thesaurus.lookUp(lookUpTerm);
			let text = searchText;
			if (!useText && termsArray && termsArray.length && termsArray[0]) {
				text = termsArray[0];
			}

			// get expanded abbreviations
			await redisAsyncClient.select(abbreviationRedisAsyncClientDB);
			let abbreviationExpansions = [];
			let i = 0;
			for (i = 0; i < termsArray.length; i++) {
				let term = termsArray[i];
				let upperTerm = term.toUpperCase().replace(/['"]+/g, '');
				let expandedTerm = await redisAsyncClient.get(upperTerm);
				let lowerTerm = term.toLowerCase().replace(/['"]+/g, '');
				let compressedTerm = await redisAsyncClient.get(lowerTerm);
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
			abbreviationExpansions.forEach(abb => {
				let cleaned = abb.toLowerCase().replace(/['"]+/g, '');
				let found = false;
				termsArray.forEach((term) => {
					if (term.toLowerCase().replace(/['"]+/g, '') === cleaned) {
						found = true;
					}
				});
				if (!found) {
					cleanedAbbreviations.push(abb);
				}
			});

			// this.logger.info(cleanedAbbreviations);

			expansionDict = this.searchUtility.combineExpansionTerms(expansionDict, synonyms, text, cleanedAbbreviations, userId);
			// this.logger.info('exp: ' + expansionDict);
			await redisAsyncClient.select(redisAsyncClientDB);

			let searchResults;
			// combined search: run if not clone + flag enabled
			const noFilters = _.isEqual(searchFields, { initial: { field: null, input: '' } });
			const noSourceSpecified = _.isEqual({}, orgFilter);
			const noPubDateSpecified = req.body.publicationDateAllTime;
			const noTypeSpecified = _.isEqual({}, typeFilter);
			let combinedSearch = await APP_SETTINGS.findOrCreate({where: { key: 'combined_search'}, defaults: {value: 'true'} });
			if (combinedSearch.length > 0){
				combinedSearch = combinedSearch[0].dataValues.value === 'true';
			}

			if (noFilters && noSourceSpecified && noPubDateSpecified && noTypeSpecified && combinedSearch){
				try {
					searchResults = await this.searchUtility.combinedSearchHandler(searchText, userId, req, expansionDict, clientObj, operator, offset);
				} catch (e) {
					if (forCacheReload) {
						throw Error('Cannot transform document search terms in cache reload');
					}
					this.logger.error(`Error sentence transforming document search results ${e.message}`, 'L6SPJU9', userId);

					const { message } = e;
					this.logger.error(message, 'H6XFEIW', userId);
					throw e;
				}
			} else {
				searchResults = await this.searchUtility.documentSearch(req, {...req.body, expansionDict, operator}, clientObj, userId);
			}

			let wikiResults;
			searchResults.wikiResults = {question: '', answers: []};

			const permissions = req.permissions ? req.permissions : [];

			if (permissions.includes('Gamechanger Admin') || permissions.includes('Webapp Super Admin')){
				// check if search is a question
				let intelligentQuestions = await APP_SETTINGS.findOrCreate({where: { key: 'intelligent_answers'}, defaults: {value: 'true'} });
				if (intelligentQuestions.length > 0){
					intelligentQuestions = intelligentQuestions[0].dataValues.value === 'true';
				}
				const questionWords = ['who', 'what', 'where', 'when', 'how', 'why', 'can', 'may', 'will', 'won\'t', 'does', 'doesn\'t'];
				const searchTextList = searchText.trim().split(/\s|\b/);
				const isQuestion = questionWords.find(item => item === searchTextList[0]) !== undefined || searchTextList[searchTextList.length - 1] === '?';

				if (intelligentQuestions && isQuestion){
					console.log('\nQUESTION ANSWER');
					try {
						let firstDoc = searchResults.docs[0].filename;
						let esClientName = 'gamechanger';
						let esIndex = 'gamechanger';
						let newQuery = this.searchUtility.getESQueryOneDoc(firstDoc, userId);
						const singleResult = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, newQuery, userId);
						wikiResults = singleResult.body.hits.hits[0]._source.paragraphs;
						const wikiTextList = wikiResults.map(item => item.par_raw_text_t);
						// const wikiTextList = wikiResults.map(item => item._source.text);
						// if (wikiTextList.length > 0){
						//	const shortenedResults = await this.mlApi.getIntelAnswer(searchText, wikiTextList, userId);
						//	searchResults.wikiResults = shortenedResults;
						// }
						if (wikiTextList.length > 0) {
							const shortenedResults = await this.mlApi.getIntelAnswer(searchText, wikiTextList, userId);
							// const shortenedResults = await this.mlApi.getIntelAnswer(searchText, wikiResults, userId);
							console.log('\nRESULTS');
							searchResults.wikiResults = shortenedResults;
							console.log(searchResults.wikiResults);
						}
					} catch (e) {
						LOGGER.error(e.message, 'CPQ46JN', userId);
					}
				}
			}

			// insert crawler dates into search results
			searchResults = await this.dataTracker.crawlerDateHelper(searchResults, userId);

			let entitySearchOn = await APP_SETTINGS.findOrCreate({where: { key: 'entity_search'}, defaults: {value: 'true'} });
			if (entitySearchOn.length > 0){
				entitySearchOn = entitySearchOn[0].dataValues.value === 'true';
			}
			if (entitySearchOn) {
				// add entity into searchResults.docs
				searchResults = await this.entitySearch(searchText, searchResults, offset, userId);
			}


			// try to store to cache
			if (useGCCache && searchResults) {
				await this.storeCachedResults(req, historyRec, searchResults, cloneSpecificObject, userId);
			}

			// try storing results record
			if (!forCacheReload) {
				try {
					const { totalCount } = searchResults;
					historyRec.endTime = new Date().toISOString();
					historyRec.numResults = totalCount;
					await this.storeRecordOfSearchInPg(historyRec, userId);
				} catch (e) {
					this.logger.error(e.message, 'MPK1GGN', userId);
				}
			} else {

				try {

					// if doing a cache reload, check favorite search stats
					const hashed_user = sparkMD5.hash(userId);

					// check if this search is a favorite
					const favoriteSearch = await FAVORITE_SEARCH.findOne({
						where: {
							user_id: hashed_user,
							tiny_url: tiny_url
						}
					});

					if (favoriteSearch !== null) {

						let updated = false;
						let count = favoriteSearch.document_count;

						// favorite search is updated
						if (searchResults.totalCount > favoriteSearch.document_count) {
							updated = true;
							count = searchResults.totalCount;
						}

						// update the favorite search info
						FAVORITE_SEARCH.update({
							run_by_cache: true,
							updated_results: updated,
							document_count: count
						}, {
							where: {
								id: favoriteSearch.id
							}
						});
					}

				} catch (err) {
					this.logger.error(err.message, 'K361YCJ', userId);
				}
			}
			return searchResults;

		} catch (err) {
			if (!forCacheReload){
				const { message } = err;
				this.logger.error(message, 'VKSB5GQ', userId);
				historyRec.endTime = new Date().toISOString();
				historyRec.hadError = true;
				await this.storeRecordOfSearchInPg(historyRec, showTutorial);
			}
			throw err;
		}
	}

	async callFunctionHelper(req, userId) {
		const {functionName} = req.body;

		switch (functionName) {
			case 'getSingleDocumentFromES':
				return this.getSingleDocumentFromESHelper(req, userId);
			default:
				this.logger.error(
					`There is no function called ${functionName} defined in the policySearchHandler`,
					'4BC876D',
					userId
				);
		}
	}

	async getSingleDocumentFromESHelper(req, userId) {
		try {
			const permissions = req.permissions ? req.permissions : [];

			const { cloneName } = req.body;

			const esQuery = this.getElasticsearchDocDataFromId(req.body, userId);

			let clientObj = this.searchUtility.getESClient(cloneName, permissions);

			const esResults = await this.dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery);

			if (esResults && esResults.body && esResults.body.hits && esResults.body.hits.total && esResults.body.hits.total.value && esResults.body.hits.total.value > 0) {

				const searchResults = this.searchUtility.cleanUpEsResults(esResults, '', userId, null, null, clientObj.esIndex, esQuery);
				// insert crawler dates into search results
				return await this.dataTracker.crawlerDateHelper(searchResults, userId);
			} else {
				this.logger.error('Error with Elasticsearch results', 'D458925', userId);
				return { totalCount: 0, docs: [] };
			}

		} catch (err) {
			const msg = (err && err.message) ? `${err.message}` : `${err}`;
			this.logger.error(msg, 'Z9DWH7K', userId);
			throw msg;
		}
	}

	getElasticsearchDocDataFromId({ docIds }, user) {
		try {
			return {
				_source: {
					includes: ['pagerank_r', 'kw_doc_score_r', 'pagerank', 'topics_rs']
				},
				stored_fields: [
					'filename',
					'title',
					'page_count',
					'doc_type',
					'doc_num',
					'ref_list',
					'id',
					'summary_30',
					'keyw_5',
					'type',
					'pagerank_r',
					'display_title_s',
					'display_org_s',
					'display_doc_type_s'
				],
				track_total_hits: true,
				size: 100,
				query: {
					bool: {
						must: {
							terms: {id: docIds}
						}
					}
				}
			};
		} catch (err) {
			this.logger.error(err, 'MEJL7W8', user);
		}
	}

	async getWikiQuery(searchText, userId) {
		const esClientName = 'gamechanger';
		const esIndex = 'simple-wiki';
		const esQuery = this.searchUtility.getSearchWikiQuery(searchText);
		const esResults = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);

		return esResults.body.hits.hits;
	}

	// uses searchtext to get entity + parent, add into searchResults.docs array
	async entitySearch(searchText, searchResults, offset, userId) {
		try {
			let esIndex = 'entities';
			let esClientName = 'gamechanger';
			const esQuery = this.searchUtility.getEntityQuery(searchText);
			const entityResults = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			let returnEntity = {};
			if (entityResults.body.hits.hits.length > 0 && entityResults.body.hits.hits[0]._score > 0.8){
				let ent = entityResults.body.hits.hits[0]; // take highest hit
				returnEntity = ent._source;
				returnEntity.type = 'organization';
				returnEntity.pageHits = [];
				// get img_link
				const ent_ids = [returnEntity.name];
				const graphQueryString = `WITH ${JSON.stringify(ent_ids)} AS ids MATCH (e:Entity) WHERE e.name in ids return e;`;
				const docData = await this.dataLibrary.queryGraph(graphQueryString, {params: {ids: ent_ids}}, userId);
				try {
					const tempEntity = docData.result.records[0]._fields[0].properties;
					Object.keys(tempEntity).forEach(key => {
						if (key !== 'aliases'){
							returnEntity[key] = tempEntity[key];
						}
					});
				} catch (err) {
					const { message } = err;
					this.logger.error(message, '9WJGAKB', userId);
				}
			} else {
				return searchResults;
			}
			if (!_.isEmpty(returnEntity)){
				searchResults.totalCount += 1;
				if (searchResults.docs.length > 0 && offset === 0){
					const first = searchResults.docs[0];
					if (first.search_mode === 'Intelligent Search'){ // if first is intelligent search, add second
						searchResults.docs.splice(1, 0, returnEntity);
					} else { // if no intelligentSearch, add first
						searchResults.docs.unshift(returnEntity);
					}
				}
			}
			return searchResults;
		} catch (e) {
			this.logger.error(e.message, 'VLPOJJJ');
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
				let search_history_index = constants.GAME_CHANGER_OPTS.historyIndex;

				this.dataLibrary.putDocument(esClient, search_history_index, searchLog);
			}
		} catch (e) {
			this.logger.error(e.message, 'UA0YDAL');
		}
	}
}

// const policySearchHandler = new PolicySearchHandler();

module.exports = PolicySearchHandler;
