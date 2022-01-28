const LOGGER = require('../../lib/logger');
const SearchUtility = require('../../utils/searchUtility');
const constantsFile = require('../../config/constants');
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
const { performance } = require('perf_hooks');

class PolicySearchHandler extends SearchHandler {
	constructor(opts = {}) {
		const {
			dataTracker = new DataTrackerController(opts),
			searchUtility = new SearchUtility(opts),
			dataLibrary = new DataLibrary(opts),
			mlApi = new MLApiClient(opts),
			app_settings = APP_SETTINGS,
			constants = constantsFile,
			favorite_search = FAVORITE_SEARCH
		} = opts;
		super({redisClientDB: redisAsyncClientDB, ...opts});

		this.dataTracker = dataTracker;
		this.searchUtility = searchUtility;
		this.dataLibrary = dataLibrary;
		this.mlApi = mlApi;
		this.app_settings = app_settings;
		this.constants = constants;
		this.error = {};
		this.favorite_Search = favorite_search;
	}

	async searchHelper(req, userId, storeHistory) {
		const {
			offset,
			useGCCache,
			forCacheReload = false,
			searchText
		} = req.body;
		let { historyRec, cloneSpecificObject, clientObj } = await this.createRecObject(req.body, userId, storeHistory);
		// if using cache
		// if (!forCacheReload && useGCCache && offset === 0) {
		// 	console.log('something');
		// 	return this.getCachedResults(req, historyRec, cloneSpecificObject, userId, storeHistory);
		// }

		// cleaning incomplete double quote issue
		const doubleQuoteCount = (searchText.match(/["]/g) || []).length;
		if(doubleQuoteCount % 2 === 1){
			req.body.searchText = searchText.replace(/["]+/g,'');
		}
		req.body.questionFlag = this.searchUtility.isQuestion(searchText);
		var startTime = performance.now()
		let expansionDict = await this.gatherExpansionTerms(req.body, userId);
		let searchResults = await this.doSearch(req, expansionDict, clientObj, userId);
		var startTimeInt = performance.now()
		let enrichedResults = await this.enrichSearchResults(req, searchResults, clientObj, userId);
		var endTimeInt = performance.now()
		var endTime = performance.now()
		this.logger.info(`Total search time: ${endTime - startTime} milliseconds --- Enriched search took: ${endTimeInt - startTimeInt}`)
		if (storeHistory) {
			await this.storeHistoryRecords(req, historyRec, enrichedResults, cloneSpecificObject);
		}
		return enrichedResults;
	}

	async callFunctionHelper(req, userId) {
		const {functionName, searchText = ''} = req.body;
		// cleaning incomplete double quote issue
		const doubleQuoteCount = (searchText.match(/["]/g) || []).length;
		if(doubleQuoteCount % 2 === 1){
			req.body.searchText = searchText.replace(/["]+/g,'');
		}
		
		switch (functionName) {
			case 'getSingleDocumentFromES':
				return await this.getSingleDocumentFromESHelper(req, userId);
			case 'getDocumentsBySourceFromESHelper':
				return await this.getDocumentsBySourceFromESHelper(req, userId);
			case 'documentSearchPagination':
				let { clientObj } = await this.createRecObject(req.body, userId);
				let expansionDict = await this.gatherExpansionTerms(req.body, userId);
				req.body.questionFlag = this.searchUtility.isQuestion(searchText);
				let searchResults = await this.doSearch(req, expansionDict, clientObj, userId);
				return searchResults;
			case 'entityPagination':
				return await this.entitySearch(req.body.searchText, req.body.offset, req.body.limit, userId);
			case 'topicPagination':
				return await this.topicSearch(req.body.searchText, req.body.offset, req.body.limit, userId);
			case 'getPresearchData':
				return await this.getPresearchData(userId);
			default:
				this.logger.error(
					`There is no function called ${functionName} defined in the policySearchHandler`,
					'4BC876D',
					userId
				);
		}
	}

	// searchHelper function breakouts
	async createRecObject(body, userId, storeHistory) {
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
		
		const clientObj = {
			esClientName: 'gamechanger',
			esIndex: body.archivedCongressSelected ?
				[this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.index, this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.legislation_index, this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.assist_index] :
				[this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.index, this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.assist_index]
		};

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
			
			await this.redisDB.select(redisAsyncClientDB);

			// log query to ES
			if (storeHistory) {
				await this.storeEsRecord(clientObj.esClientName, offset, cloneName, userId, searchText);
			}
			return {historyRec, cloneSpecificObject, clientObj};
		} catch (e) {
			this.logger.error(e.message, 'AC3CP8H');
		}
		// if fail, return empty objects
		return {historyRec, cloneSpecificObject: { orgFilterString, searchFields: Object.values(searchFields), includeRevoked }, };
	}
	
	async gatherExpansionTerms(body, userId) {
		const {
			searchText,
			forCacheReload = false,
			cloneName,
		} = body;
		try {

			// try to get search expansion
			const [parsedQuery, termsArray] = this.searchUtility.getEsSearchTerms({searchText});
			let expansionDict = await this.mlApiExpansion(termsArray, forCacheReload, userId);
			let [synonyms, text] = this.thesaurusExpansion(searchText, termsArray);
			const cleanedAbbreviations = await this.abbreviationCleaner(termsArray);
			let relatedSearches = await this.searchUtility.getRelatedSearches(searchText, expansionDict, cloneName, userId)
			expansionDict = this.searchUtility.combineExpansionTerms(expansionDict, synonyms, relatedSearches, termsArray[0], cleanedAbbreviations, userId);
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
			this.error.category = 'ML API';
			this.error.code = '93SQB38';
			this.logger.error('DETECTED ERROR: Cannot get expanded search terms, continuing with search', '93SQB38', userId);
		}
		return expansionDict;
	}

	thesaurusExpansion(searchText, termsArray){
		let lookUpTerm = searchText.replace(/\"/g, '');
		let useText = true;
		let synList = []
		if (termsArray && termsArray.length && termsArray[0]) {
			useText = false;
			for(var term in termsArray){
				lookUpTerm = termsArray[term].replace(/\"/g, '');
				const synonyms = thesaurus.lookUp(lookUpTerm);
				if (synonyms && synonyms.length > 1){
					synList = synList.concat(synonyms.slice(0,2))
				}
			}
		}
		//const synonyms = thesaurus.lookUp(lookUpTerm);
		let text = searchText;
		if (!useText && termsArray && termsArray.length && termsArray[0]) {
			text = termsArray[0];
		}
		return [synList, text];
	}

	async abbreviationCleaner(termsArray){
		// get expanded abbreviations
		await this.redisDB.select(abbreviationRedisAsyncClientDB);
		let abbreviationExpansions = [];
		let i = 0;
		for (i = 0; i < termsArray.length; i++) {
			let term = termsArray[i];
			let upperTerm = term.toUpperCase().replace(/['"]+/g, '');
			let expandedTerm = await this.redisDB.get(upperTerm);
			let lowerTerm = term.toLowerCase().replace(/['"]+/g, '');
			let compressedTerm = await this.redisDB.get(lowerTerm);
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
		try {
			// caching db
			await this.redisDB.select(redisAsyncClientDB);

			let searchResults;
			const operator = 'and';
			searchResults = await this.searchUtility.documentSearch(req, {...req.body, expansionDict, operator}, clientObj, userId);
			// insert crawler dates into search results
			searchResults = await this.dataTracker.crawlerDateHelper(searchResults, userId);
			return searchResults;
		} catch (e) {
			this.logger.error(e.message, 'ML8P7GO');
		}
	}

	async enrichSearchResults(req, searchResults, clientObj,  userId) {
		const {
			searchText,
			offset,
		} = req.body;
		try {
			let sentenceResults = {}

			let enrichedResults = searchResults;
			//set empty values
			enrichedResults.qaResults = {question: '', answers: [], qaContext: [], params: {}},
			enrichedResults.intelligentSearch = {};
			enrichedResults.entities = [];
			enrichedResults.totalEntities = 0;
			enrichedResults.topics = [];
			enrichedResults.totalTopics = 0;
			enrichedResults.sentenceResults = [];

			// intelligent search data
			let intelligentSearchOn = await this.app_settings.findOrCreate({where: { key: 'combined_search'}, defaults: {value: 'true'} });
			intelligentSearchOn = intelligentSearchOn.length > 0 ? intelligentSearchOn[0].dataValues.value === 'true' : false;
			if (intelligentSearchOn){
				sentenceResults = await this.searchUtility.getSentResults(req.body.searchText, userId)
				enrichedResults.sentenceResults = sentenceResults;

			}

			if(intelligentSearchOn && _.isEqual(enrichedResults.qaResults.answers, [])){ // add intelligent search result if QA empty
				const intelligentSearchResult = await this.intelligentSearch(req, sentenceResults, clientObj, userId);
				enrichedResults.intelligentSearch = intelligentSearchResult;
			}
			// QA data
			let intelligentAnswersOn = await this.app_settings.findOrCreate({where: { key: 'intelligent_answers'}, defaults: {value: 'true'} });
			let qaParams = {maxLength: 1500, maxDocContext: 3, maxParaContext: 2, minLength: 200, scoreThreshold: 100, entityLimit: 10};
			intelligentAnswersOn = intelligentAnswersOn.length > 0 ? intelligentAnswersOn[0].dataValues.value === 'true' : false;
			if(intelligentAnswersOn && intelligentSearchOn){
				const QA = await this.qaEnrichment(req, sentenceResults, qaParams, userId);
				enrichedResults.qaResults = QA
			}

			// add entities
			let entitySearchOn = await this.app_settings.findOrCreate({where: { key: 'entity_search'}, defaults: {value: 'true'} });
			entitySearchOn = entitySearchOn.length > 0 ? entitySearchOn[0].dataValues.value === 'true' : false;
			if (entitySearchOn) {
				const entities = await this.entitySearch(searchText, offset, 6, userId);
				enrichedResults.entities = entities.entities;
				enrichedResults.totalEntities = entities.totalEntities;
			}

			//add topics
			let topicSearchOn = await this.app_settings.findOrCreate({where: { key: 'topic_search'}, defaults: {value: 'true'} });
			topicSearchOn = topicSearchOn.length > 0 ? topicSearchOn[0].dataValues.value === 'true' : false;
			if (topicSearchOn) { // make a topicSearch switch
				const topics = await this.topicSearch(searchText, offset, 6, userId);
				enrichedResults.topics = topics.topics;
				enrichedResults.totalTopics = topics.totalTopics;
			}

			// add results to search report
			if (testing === true) {
				let saveResults = {};
				saveResults.regular = searchResults.docs.slice(0, 10);
				saveResults.entities = enrichedResults.entities;
				saveResults.topics = enrichedResults.topics;
				saveResults.qaResponses = enrichedResults.qaResults;
				this.searchUtility.addSearchReport(searchText, enrichedResults.qaResults.params, saveResults, userId);
			}
			return enrichedResults;
		} catch (e) {
			this.logger.error(e.message, 'I9D42WM');
		}
		return searchResults;
	}

	async intelligentSearch(req, sentenceResults, clientObj, userId){
		const {
			searchText,
			orgFilterString = [],
			typeFilterString = [],
			forCacheReload = false,
			searchFields = {},
			sort = 'Relevance',
			order = 'desc'
		} = req.body;
		let intelligentSearchResult = {};

		// combined search: run if not clone + sort === 'relevance' + flag enabled
		const verbatimSearch = searchText.startsWith('"') && searchText.endsWith('"');
		const noFilters = _.isEqual(searchFields, { initial: { field: null, input: '' } });
		const noSourceSpecified = _.isEqual([], orgFilterString);
		const noPubDateSpecified = req.body.publicationDateAllTime;
		const noTypeSpecified = _.isEqual([], typeFilterString);
		let combinedSearch = await this.app_settings.findOrCreate({where: { key: 'combined_search'}, defaults: {value: 'true'} });
		combinedSearch = combinedSearch.length > 0 ? combinedSearch[0].dataValues.value === 'true' : false;
		if (sort === 'Relevance' && order === 'desc' && noFilters && noSourceSpecified && noPubDateSpecified && noTypeSpecified && combinedSearch && !verbatimSearch){
			try {
				// get intelligent search result
				intelligentSearchResult = await this.searchUtility.intelligentSearchHandler(sentenceResults, userId, req, clientObj);
				return intelligentSearchResult;
			} catch (e) {
				if (forCacheReload) {
					throw Error('Cannot transform document search terms in cache reload');
				}
				this.logger.error(`Error sentence transforming document search results ${e.message}`, 'L6SPJU9', userId);
				const { message } = e;
				this.logger.error(message, 'H6XFEIW', userId);
				return intelligentSearchResult;
			}
		}
		return intelligentSearchResult;
	}

	async qaEnrichment(req, sentenceResults, qaParams, userId){
		const {
			searchText,
		} = req.body;

		let QA = { question: '', answers: [], params: qaParams, qaContext: []};
		
		let esClientName = 'gamechanger';
		let esIndex = this.constants.GAME_CHANGER_OPTS.index;
		let entitiesIndex = this.constants.GAME_CHANGER_OPTS.entityIndex;
		let intelligentQuestions = await this.app_settings.findOrCreate({where: { key: 'intelligent_answers'}, defaults: {value: 'true'} });
		if (intelligentQuestions.length > 0) {
			intelligentQuestions = intelligentQuestions[0].dataValues.value === 'true';
		}
		if (intelligentQuestions && req.body.questionFlag){
			try {
				let queryType = 'documents';
				let entities = {QAResults: {}, allResults: {}};
				let qaQueries = await this.searchUtility.formatQAquery(searchText, qaParams.entityLimit, esClientName, entitiesIndex, userId);
				QA.question = qaQueries.display;
				let bigramQueries = this.searchUtility.makeBigramQueries(qaQueries.list, qaQueries.alias);
				try {
					entities = await this.searchUtility.getQAEntities(entities, qaQueries, bigramQueries, qaParams, esClientName, entitiesIndex, userId);
				} catch (e) {
					this.logger.error(e.message, 'FLPQX67M');
				}
				let qaDocQuery = this.searchUtility.phraseQAQuery(bigramQueries, queryType, qaParams.entityLimit, qaParams.maxLength, userId);
				let docQAResults = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, qaDocQuery, userId);
				let context = await this.searchUtility.getQAContext(docQAResults, entities.QAResults, sentenceResults, esClientName, esIndex, userId, qaParams);
				if (testing === true) {
					this.searchUtility.addSearchReport(qaSearchText, qaParams, {results: context}, userId);
				}
				if (context.length > 0) { // if context results, query QA model
					QA.qaContext = context;
					let shortenedResults = await this.mlApi.getIntelAnswer(qaQueries.text, context.map(item => item.text), userId);
					QA= this.searchUtility.cleanQAResults(QA, shortenedResults, context);
				}
				
			} catch (e) {
				this.error.category = 'ML API'
				this.error.code = 'KBBIOYCJ';
				this.logger.error('DETECTED ERROR:', e.message, 'KBBIOYCJ', userId);
			}
		}
		return QA;
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

			const esQuery = this.searchUtility.getElasticsearchDocDataFromId(req.body, userId);
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
			return { totalCount: 0, docs: [] };
		}
	}
	


	async getDocumentsBySourceFromESHelper(req, userId) {
		let esQuery = '';
		try {
			const permissions = req.permissions ? req.permissions : [];
			const { searchText, offset = 0, limit = 18, cloneName } = req.body;

			esQuery = this.searchUtility.getSourceQuery(searchText, offset, limit);

			const clientObj = this.searchUtility.getESClient(cloneName, permissions)
			const esResults = await this.dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery);
			if (esResults && esResults.body && esResults.body.hits && esResults.body.hits.total && esResults.body.hits.total.value && esResults.body.hits.total.value > 0) {
				let searchResults = this.searchUtility.cleanUpEsResults(esResults, '', userId, null, null, clientObj.esIndex, esQuery);

				searchResults = await this.dataTracker.crawlerDateHelper(searchResults, userId);
				// insert crawler dates into search results
				return {...searchResults, esQuery};
			} else {
				this.logger.error('Error with Elasticsearch results', '54TP85I', userId);
				if (this.searchUtility.checkESResultsEmpty(esResults)) { this.logger.warn("Search has no hits") }

				return { totalCount: 0, docs: [], esQuery };
			}

		} catch (err) {
			const msg = (err && err.message) ? `${err.message}` : `${err}`;
			this.logger.error(msg, 'GODULEB', userId);
			throw msg;
		}
	}


	// uses searchtext to get entity + parent, return entitySearch object
	async entitySearch(searchText, offset, limit = 6, userId) {
		try {
			let esIndex = this.constants.GAME_CHANGER_OPTS.entityIndex;
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
			let esIndex = this.constants.GAME_CHANGER_OPTS.entityIndex;
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

	async getPresearchData(userId) {
		try {
			let esIndex = this.constants.GAME_CHANGER_OPTS.index;
			let esClientName = 'gamechanger';
			const orgQuery = this.searchUtility.getOrgQuery(userId);
			const typeQuery = this.searchUtility.getTypeQuery(userId);

			const orgResults = this.dataLibrary.queryElasticSearch(esClientName, esIndex, orgQuery, userId);
			const typeResults = this.dataLibrary.queryElasticSearch(esClientName, esIndex, typeQuery, userId);
			const results = await Promise.all([orgResults, typeResults]);

			const orgsCleaned = results[0].body.aggregations.display_org.buckets.map(item => item.key.type);
			const typesCleaned = results[1].body.aggregations.display_type.buckets.map(item => item.key.type);
			return {orgs: orgsCleaned, types: typesCleaned};
		} catch (e) {
			this.logger.error(e.message, 'OICE7JS');
			return {orgs: [], types: []}
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

	getError() {
		return this.error;
	}
}

// const policySearchHandler = new PolicySearchHandler();

module.exports = PolicySearchHandler;
