const LOGGER = require('../../lib/logger');
const SearchUtility = require('../../utils/searchUtility');
const constantsFile = require('../../config/constants');
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
const testing = false;

class PolicySearchHandler extends SearchHandler {
	constructor(opts = {}) {
		const {
			dataTracker = new DataTrackerController(opts),
			logger = LOGGER,
			searchUtility = new SearchUtility(opts),
			dataLibrary = new DataLibrary(opts),
			mlApi = new MLApiClient(opts),
			async_redis = redisAsyncClient,
			app_settings = APP_SETTINGS,
			constants = constantsFile
		} = opts;
		super({redisClientDB: redisAsyncClientDB, ...opts});

		this.dataTracker = dataTracker;
		this.logger = logger;
		this.searchUtility = searchUtility;
		this.dataLibrary = dataLibrary;
		this.mlApi = mlApi;
		this.async_redis = async_redis;
		this.app_settings = app_settings;
		this.constants = constants;
	}

	async searchHelper(req, userId) {
		const {
			offset,
			useGCCache,
			forCacheReload = false,
			searchText
		} = req.body;
		let { historyRec, cloneSpecificObject, clientObj } = await this.createRecObject(req.body, userId);
		// if using cache
		// if (!forCacheReload && useGCCache && offset === 0) {
		// 	console.log('something');
		// 	return this.getCachedResults(req, historyRec, cloneSpecificObject, userId);
		// }

		// cleaning incomplete double quote issue
		const doubleQuoteCount = (searchText.match(/["]/g) || []).length;
		if(doubleQuoteCount % 2 === 1){
			req.body.searchText = searchText.replace(/["]+/g,"");
		}
		let expansionDict = await this.gatherExpansionTerms(req.body, userId);
		let searchResults = await this.doSearch(req, expansionDict, clientObj, userId);
		let enrichedResults = await this.enrichSearchResults(req, searchResults, userId);
		this.storeHistoryRecords(req, historyRec, enrichedResults, cloneSpecificObject);
		return enrichedResults;
	}

	async callFunctionHelper(req, userId) {
		const {functionName, searchText} = req.body;
		// cleaning incomplete double quote issue
		const doubleQuoteCount = (searchText.match(/["]/g) || []).length;
		if(doubleQuoteCount % 2 === 1){
			req.body.searchText = searchText.replace(/["]+/g,"");
		}
		
		switch (functionName) {
			case 'getSingleDocumentFromES':
				return this.getSingleDocumentFromESHelper(req, userId);
			case 'getDocumentsForDetailsPageFromES':
				return this.getDocumentsForDetailsPageFromESHelper(req, userId);
			case 'documentSearchPagination':
				let { clientObj } = await this.createRecObject(req.body, userId);
				let expansionDict = await this.gatherExpansionTerms(req.body, userId);
				let searchResults = await this.doSearch(req, expansionDict, clientObj, userId);
				return searchResults;
			case 'entityPagination':
				return this.entitySearch(req.body.searchText, req.body.offset, req.body.limit, userId);
			case 'topicPagination':
				return this.topicSearch(req.body.searchText, req.body.offset, req.body.limit, userId);
			default:
				this.logger.error(
					`There is no function called ${functionName} defined in the policySearchHandler`,
					'4BC876D',
					userId
				);
		}
	}

	// searchHelper function breakouts
	async createRecObject(body, userId){
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
			orgFilterString = [],
			typeFilterString = [],
			useGCCache,
			showTutorial = false,
			tiny_url,
			forCacheReload = false,
			searchFields = {},
			includeRevoked
		} = body;
		const clientObj = {esClientName: 'gamechanger', esIndex: this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.index};

		try {
			historyRec.searchText = searchText;
			historyRec.orgFilters = JSON.stringify(orgFilterString);
			historyRec.tiny_url = tiny_url;
			historyRec.clone_name = cloneName;
			historyRec.searchType = searchType;
			historyRec.search_version = searchVersion;
			historyRec.request_body = body;
			historyRec.showTutorial = showTutorial;

			const cloneSpecificObject = { orgFilterString, searchFields: Object.values(searchFields), includeRevoked };

			const redisDB = this.async_redis;
			redisDB.select(redisAsyncClientDB);

			// log query to ES
			this.storeEsRecord(clientObj.esClientName, offset, cloneName, userId, searchText);
			return {historyRec, cloneSpecificObject, clientObj};
		} catch (e) {
			this.logger.error(e.message, 'AC3CP8H');
		}
		// if fail, return empty objects
		return {historyRec, cloneSpecificObject: { orgFilter, searchFields: Object.values(searchFields), includeRevoked }, };
	}


	async gatherExpansionTerms(body, userId) {
		const {
			searchText,
			forCacheReload = false,
		} = body;
		try {
			// try to get search expansion
			const [parsedQuery, termsArray] = this.searchUtility.getEsSearchTerms({searchText});
			let expansionDict = await this.mlApiExpansion(termsArray, forCacheReload, userId);
			const {synonyms, text} = await this.thesaurusExpansion(searchText, termsArray);
			const cleanedAbbreviations = await this.abbreviationCleaner(termsArray);
			expansionDict = this.searchUtility.combineExpansionTerms(expansionDict, synonyms, text, cleanedAbbreviations, userId);
			return expansionDict;
		} catch (e) {
			this.logger.error(e.message, 'B6X9EPJ');
		}
	}

	async mlApiExpansion(termsArray, forCacheReload, userId){
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
		return expansionDict;
	}

	async thesaurusExpansion(searchText, termsArray){
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
		return {synonyms, text};
	}

	async abbreviationCleaner(termsArray){
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
		return cleanedAbbreviations;
	}

	async doSearch(req, expansionDict, clientObj, userId) {
		const {
			searchText,
			searchType,
			searchVersion,
			cloneName,
			offset,
			orgFilter = 'Department of Defense_Joint Chiefs of Staff_Intelligence Community_United States Code',
			orgFilterString = [],
			typeFilterString = [],
			typeFilter,
			useGCCache,
			showTutorial = false,
			tiny_url,
			forCacheReload = false,
			searchFields = {},
			includeRevoked, 
			sort = 'Relevance',
			order = 'desc'
		} = req.body;

		try {
			// this.logger.info('exp: ' + expansionDict);
			// caching db
			await this.async_redis.select(redisAsyncClientDB);

			let searchResults;
			// combined search: run if not clone + sort === 'relevance' + flag enabled
			const noFilters = _.isEqual(searchFields, { initial: { field: null, input: '' } });
			const noSourceSpecified = _.isEqual([], orgFilterString);
			const noPubDateSpecified = req.body.publicationDateAllTime;
			const noTypeSpecified = _.isEqual([], typeFilterString);
			let combinedSearch = await this.app_settings.findOrCreate({where: { key: 'combined_search'}, defaults: {value: 'true'} });
			combinedSearch = combinedSearch.length > 0 ? combinedSearch[0].dataValues.value === 'true' : false;
			const verbatimSearch = searchText.startsWith('"') && searchText.endsWith('"');

			const operator = 'and';
			if (sort === 'Relevance' && order === 'desc' &&noFilters && noSourceSpecified && noPubDateSpecified && noTypeSpecified && combinedSearch && !verbatimSearch){
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
			//console.log(JSON.stringify(searchResults, null, 4));
			// insert crawler dates into search results
			searchResults = await this.dataTracker.crawlerDateHelper(searchResults, userId);
			return searchResults;
		} catch (e) {
			this.logger.error(e.message, 'ML8P7GO');
		}
	}

	async enrichSearchResults(req, searchResults, userId) {
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
			let enrichedResults = await this.qaEnrichment(req, searchResults, userId);

			// add entities
			let entitySearchOn = await this.app_settings.findOrCreate({where: { key: 'entity_search'}, defaults: {value: 'true'} });
			if (entitySearchOn.length > 0){
				entitySearchOn = entitySearchOn[0].dataValues.value === 'true';
			}
			if (entitySearchOn) {
				const entities = await this.entitySearch(searchText, offset, 6, userId);
				enrichedResults.entities = entities.entities;
				enrichedResults.totalEntities = entities.totalEntities;
			} else {
				enrichedResults.entities = [];
				enrichedResults.totalEntities = 0;
			}

			//add topics
			let topicSearchOn = await APP_SETTINGS.findOrCreate({where: { key: 'topic_search'}, defaults: {value: 'true'} });
			if (topicSearchOn.length > 0){
				topicSearchOn = topicSearchOn[0].dataValues.value === 'true';
			}
			if (topicSearchOn) { // make a topicSearch switch
				const topics = await this.topicSearch(searchText, offset, 6, userId);
				enrichedResults.topics = topics.topics;
				enrichedResults.totalTopics = topics.totalTopics;
			} else {
				enrichedResults.topics = [];
				enrichedResults.totalTopics = 0;
			}

			// add results to search report
			if (testing === true) {
				let saveResults = {}
				saveResults.regular = searchResults.docs.slice(0, 10);
				saveResults.context = enrichedResults.qaContext.context;
				saveResults.entities = enrichedResults.entities;
				saveResults.topics = enrichedResults.topics;
				saveResults.qaResponses = enrichedResults.qaResults;
				this.searchUtility.addSearchReport(searchText, enrichedResults.qaContext.params, saveResults, userId);
			};

			return enrichedResults;
		} catch (e) {
			this.logger.error(e.message, 'I9D42WM');
		}
		return searchResults;
	}

	async qaEnrichment(req, searchResults, userId){
		const {
			searchText,
		} = req.body;
		
		searchResults.qaResults = {question: '', answers: [], filenames: [], docIds: []};
		searchResults.qaContext = {params: {}, context: []};
		const permissions = req.permissions ? req.permissions : [];
		let qaParams = {maxLength: 3000, maxDocContext: 3, maxParaContext: 3, minLength: 350, scoreThreshold: 100, entitylimit: 4};
		searchResults.qaContext.params = qaParams;
		if (permissions) {
		// if (permissions.includes('Gamechanger Admin') || permissions.includes('Webapp Super Admin')){
			// check if search is a question
			let intelligentQuestions = await this.app_settings.findOrCreate({where: { key: 'intelligent_answers'}, defaults: {value: 'true'} });
			if (intelligentQuestions.length > 0){
				intelligentQuestions = intelligentQuestions[0].dataValues.value === 'true';
			}
			const questionWords = ['who', 'what', 'where', 'when', 'how', 'why', 'can', 'may', 'will', 'won\'t', 'does', 'doesn\'t'];
			const searchTextList = searchText.toLowerCase().trim().split(/\s|\b/);
			const isQuestion = questionWords.find(item => item === searchTextList[0]) !== undefined || searchTextList[searchTextList.length - 1] === '?';
			if (intelligentQuestions && isQuestion){
				try {
					let qaSearchText = searchText.toLowerCase().replace('?', ''); // lowercase/ remove ? from query
					let qaSearchTextList = qaSearchText.split(/\s+/); // get list of query terms
					let qaQuery = this.searchUtility.phraseQAQuery(qaSearchText, qaSearchTextList, qaParams.maxLength, userId);
					let qaEntityQuery = this.searchUtility.phraseQAEntityQuery(qaSearchTextList, qaParams.entityLimit, userId);
					let esClientName = 'gamechanger';
					let esIndex = 'gamechanger';
					let entitiesIndex = 'entities-new';
					let contextResults = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, qaQuery, userId);
					let entityQAResults = await this.dataLibrary.queryElasticSearch(esClientName, entitiesIndex, qaEntityQuery, userId);
					let context = await this.searchUtility.getQAContext(contextResults, entityQAResults, searchResults.sentResults, userId, qaParams);
					searchResults.qaContext.context = context;
					if (testing === true) {
						this.searchUtility.addSearchReport(qaSearchText, qaParams, {results: context}, userId);
					}
					let qaContext = context.map(item => item.text);
					if (context.length > 0) { // if context results, query QA model
						let shortenedResults = await this.mlApi.getIntelAnswer(qaSearchText, qaContext, userId);
						searchResults.qaResults.question = qaSearchText + '?';
						if (shortenedResults.answers.length > 0 && shortenedResults.answers[0].status) {
							shortenedResults.answers = shortenedResults.answers.filter(function(i) {
								return i['status'] == 'passed' && i['text'] !== '';
							});
						} else {
							shortenedResults.answers = shortenedResults.answers.filter(function(i) {
								return i['text'] !== '';
							});
						}
						let contextIds = shortenedResults.answers.map(item => 'Source: ' + context[item.context].filename.toUpperCase() + ' (' + context[item.context].resultType.toUpperCase() + ')');
						let cleanedResults = shortenedResults.answers.map(item => item.text);
						searchResults.qaResults.answers = cleanedResults;
						searchResults.qaResults.filenames = contextIds;
						searchResults.qaResults.docIds = shortenedResults.answers.map(item => context[item.context].docId);
						searchResults.qaResults.resultTypes = shortenedResults.answers.map(item => context[item.context].resultType);
					}
				} catch (e) {
					this.logger.error(e.message, 'KBBIOYCJ', userId);
				}
			}
		}
		return searchResults;
	}

	async storeHistoryRecords(req, historyRec, enrichedResults, cloneSpecificObject, userId){
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
			// try to store to cache
			if (useGCCache && enrichedResults) {
				await this.storeCachedResults(req, historyRec, enrichedResults, cloneSpecificObject, userId);
			}

			// try storing results record
			if (!forCacheReload) {
				try {
					const { totalCount } = enrichedResults;
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

	async getDocumentsForDetailsPageFromESHelper(req, userId) {
		let esQuery = '';
		try {
			const permissions = req.permissions ? req.permissions : [];

			const { cloneName } = req.body;

			esQuery = this.getElasticsearchDocDataFromId(req.body, userId);

			let clientObj = this.searchUtility.getESClient(cloneName, permissions);

			const esResults = await this.dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery);

			if (esResults && esResults.body && esResults.body.hits && esResults.body.hits.total && esResults.body.hits.total.value && esResults.body.hits.total.value > 0) {

				let searchResults = this.searchUtility.cleanUpEsResults(esResults, '', userId, null, null, clientObj.esIndex, esQuery);
				searchResults = await this.dataTracker.crawlerDateHelper(searchResults, userId);
				// insert crawler dates into search results
				return {...searchResults, esQuery};
			} else {
				this.logger.error('Error with Elasticsearch results', 'IH0JGPR', userId);
				return { totalCount: 0, docs: [], esQuery };
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
					'display_doc_type_s',
					'access_timestamp_dt',
					'publication_date_dt',
					'crawler_used_s',
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

	// uses searchtext to get entity + parent, return entitySearch object
	async entitySearch(searchText, offset, limit = 6, userId) {
		try {
			let esIndex = 'entities';
			let esClientName = 'gamechanger';
			const esQuery = this.searchUtility.getEntityQuery(searchText, offset, limit);
			const entityResults = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			if (entityResults.body.hits.hits.length > 0){
				const entityList = entityResults.body.hits.hits.map(async obj => {
					let returnEntity = {};
					let ent = obj;
					returnEntity = ent._source;
					returnEntity.type = 'organization';
					// get img_link
					const ent_ids = [returnEntity.name];
					const graphQueryString = `WITH ${JSON.stringify(ent_ids)} AS ids MATCH (e:Entity) WHERE e.name in ids return e;`;
					const docData = await this.dataLibrary.queryGraph(graphQueryString, {params: {ids: ent_ids}}, userId);
					const docDataCleaned = this.searchUtility.cleanNeo4jData(docData.result, false, userId);
					try{ // if parsing and adding stuff fails, log docDataCleaned
						if(docDataCleaned && docDataCleaned.nodes && docDataCleaned.nodes.length > 0){
							for(const key of Object.keys(docDataCleaned.nodes[0]) ) { // take highest hit, add key value pairs into return object
								if(key !== 'properties' && key !== 'nodeVec' && key !== 'pageHits' && key !== 'pageRank'){
									returnEntity[key] = docDataCleaned.nodes[0][key];
								}
							}
						}
					} catch(err) {
						const { message } = err;
						this.logger.error(message, '9WJGAKB', userId);
						this.logger.error('docDataCleaned: ' + JSON.stringify(docDataCleaned), '9WJGAKB', userId);
					}
					return returnEntity;
				});

				let entities = [];
				if (entityList.length > 0){
					entities = await Promise.all(entityList);
				}
				return {entities, totalEntities: entityResults.body.hits.total.value};
			} else {
				return {entities: [], totalEntities: 0};
			}
		} catch (e) {
			this.logger.error(e.message, 'VLPOJJJ');
			return {entities: [], totalEntities: 0};
		}
	}

	async topicSearch(searchText, offset, limit = 6, userId){
		try {
			let esIndex = 'entities';
			let esClientName = 'gamechanger';
			const esQuery = this.searchUtility.getTopicQuery(searchText, offset, limit);
			const topicResults = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			if (topicResults.body.hits.hits.length > 0) {
				let topics = topicResults.body.hits.hits.map(async obj => {
					let returnObject = obj._source;
					returnObject.type = 'topic';
					const topicDocumentCount =
						`MATCH (t:Topic) where t.name = "${obj._source.name.toLowerCase()}"
						OPTIONAL MATCH (t) <-[:CONTAINS]-(d:Document)-[:CONTAINS]->(t2:Topic)
						RETURN t2.name as topic_name, count(d) as doc_count
						ORDER BY doc_count DESC LIMIT 5`;
					const documentCount =
						`MATCH (t:Topic) where t.name = "${obj._source.name.toLowerCase()}"
						OPTIONAL MATCH (t) <-[:CONTAINS]-(d:Document)
						RETURN count(d) as doc_count`;
					try {
						const topicData = await this.dataLibrary.queryGraph(topicDocumentCount, {params: {}}, userId);
						const docData = await this.dataLibrary.queryGraph(documentCount, {params: {}}, userId);
						const topicDataCleaned = this.searchUtility.cleanNeo4jData(topicData.result, false, userId);
						const docDataCleaned = this.searchUtility.cleanNeo4jData(docData.result, false, userId);
						returnObject.relatedTopics = topicDataCleaned.graph_metadata;
						returnObject.documentCount = docDataCleaned.graph_metadata;
					} catch (err) { // log errors if neo4j stuff fails
						this.logger.error(err.message, 'OICE7JS');
						this.logger.error(JSON.stringify(topicDataCleaned), 'OICE7JS');
						this.logger.error(JSON.stringify(docDataCleaned), 'OICE7JS');
					}
					return returnObject;
				});

				if (topics.length > 0){
					topics = await Promise.all(topics);
				}

				return {topics, totalTopics: topicResults.body.hits.total.value};
			}
			return {topics: [], totalTopics: 0};
		} catch (e) {
			this.logger.error(e.message, 'OICE7JS');
			return {topics: [], totalTopics: 0};
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

}

// const policySearchHandler = new PolicySearchHandler();

module.exports = PolicySearchHandler;
