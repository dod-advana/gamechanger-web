const LOGGER = require('../../lib/logger');
const SearchUtility = require('../../utils/searchUtility');
const searchUtility = new SearchUtility();
const constants = require('../../config/constants');
const asyncRedisLib = require('async-redis');
const redisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
const separatedRedisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
const { MLApiClient } = require('../../lib/mlApiClient');
const mlApi = new MLApiClient();
const { DataTrackerController } = require('../../controllers/dataTrackerController');
const dataTracker = new DataTrackerController();
const sparkMD5 = require('spark-md5');
const { DataLibrary} = require('../../lib/dataLibrary');
const dataLibrary = new DataLibrary();
const {Thesaurus} = require('../../lib/thesaurus');
const thesaurus = new Thesaurus();
const FAVORITE_SEARCH = require('../../models').favorite_searches;
const GC_HISTORY = require('../../models').gc_history;
const modularEsSearchUtil = require('../../utils/modularEsSearchUtil');

const redisAsyncClientDB = 7;
const abbreviationRedisAsyncClientDB = 9;

const TRANSFORM_ERRORED = 'TRANSFORM_ERRORED';

const SimplePdfSearchHandler = function SimplePdfSearchHandler() {}
SimplePdfSearchHandler.prototype.search = async function(searchText, offset, limit, options, userId, storeHistory) {
	console.log(`${userId} is doing a covid19 search for ${searchText} with offset ${offset}, limit ${limit}, options ${options}`);
	const proxyBody = options;
	proxyBody.searchText = searchText;
	proxyBody.offset = offset;
	proxyBody.limit = limit;
	return documentSearchHelper({body: proxyBody, permissions: []}, userId, storeHistory);
}

async function documentSearchHelper(req, userId, storeHistory) {
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
		isClone = false,
		cloneData = {},
		offset,
		orgFilter = 'Department of Defense_Joint Chiefs of Staff_Intelligence Community_United States Code',
		useGCCache,
		showTutorial = false,
		tiny_url,
		forCacheReload = false,
		searchFields = {},
		includeRevoked = false
	} = req.body;

	const { clone_name } = cloneData;

	try {
		historyRec.search = searchText;
		historyRec.searchText = searchText;
		historyRec.orgFilters = JSON.stringify(orgFilter);
		historyRec.tiny_url = tiny_url;
		historyRec.clone_name = clone_name;
		historyRec.searchType = searchType;
		historyRec.search_version = searchVersion;
		historyRec.request_body = req.body;
		let index = isClone ? cloneData.clone_data.project_name : (req.body.index ? req.body.index : constants.GAME_CHANGER_OPTS.index);

		if (isClone && cloneData && cloneData.clone_data) {
			if (cloneData.clone_data.gcIndex) {
				index = cloneData.clone_data.gcIndex;
			} else if (cloneData.clone_data.project_name) {
				index = cloneData.clone_data.project_name;
			}
		}
		const permissions = req.permissions ? req.permissions : [];
		const operator = 'and';

		// ## try to get cached results
		const options = { searchType, searchText, orgFilter, clone_name, searchFields: Object.values(searchFields), index, includeRevoked };
		const redisKey = searchUtility.createCacheKeyFromOptions(options);
		const separatedClones = ['EDA', 'eda'];

		const redisDB = separatedClones.includes(clone_name) ? separatedRedisAsyncClient : redisAsyncClient;

		let clientObj = getESClient(isClone, cloneData, permissions, index);

		// log query to ES
		if (storeHistory) {
			await storeEsRecord(clientObj.esClientName, offset, clone_name, userId, searchText);
		}

		if (!forCacheReload && useGCCache && offset === 0) {
			try {
				// check cache for search (first page only)
				const cachedResults = JSON.parse(await redisDB.get(redisKey));
				const timestamp = await redisDB.get(redisKey + ':time');
				const timeDiffHours = Math.floor((new Date().getTime() - timestamp) / (1000 * 60 * 60));
				if (cachedResults) {
					const { totalCount } = cachedResults;
					historyRec.endTime = new Date().toISOString();
					historyRec.numResults = totalCount;
					historyRec.cachedResult = true;
					await storeRecordOfSearchInPg(historyRec, isClone, cloneData, showTutorial);
					return { ...cachedResults, isCached: true, timeSinceCache: timeDiffHours };
				}

			} catch (e) {
				// don't reject if cache errors just log
				LOGGER.error(e.message, 'UA0YFKY', userId);
			}
		}
		// try to get search expansion
		const [parsedQuery, termsArray] = searchUtility.getEsSearchTerms({searchText});
		let expansionDict = {};
		try {
			expansionDict = await mlApi.getExpandedSearchTerms(termsArray, userId);
		} catch (e) {
			// log error and move on, expansions are not required
			if (forCacheReload){
				throw Error('Cannot get expanded search terms in cache reload');
			}
			LOGGER.error('Cannot get expanded search terms, continuing with search', '93SQB38', userId);
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

		// LOGGER.info(cleanedAbbreviations);

		expansionDict = searchUtility.combineExpansionTerms(expansionDict, synonyms, text, cleanedAbbreviations, userId);
		// LOGGER.info('exp: ' + expansionDict);
		await redisAsyncClient.select(redisAsyncClientDB);
		let searchResults;
		if (searchType === 'Sentence'){

			try {
				const sentenceResults = await mlApi.getSentenceTransformerResults(searchText, userId);
				const filenames = sentenceResults.map(({ id }) => id);

				const docSearchRes = await documentSearchUsingParaId(req, {...req.body, expansionDict, index, filenames}, userId);

				if (sentenceResults === TRANSFORM_ERRORED) {
					searchResults.transformFailed = true;
				} else {
					searchResults = docSearchRes;
				}
			} catch (e) {
				if (forCacheReload) {
					throw Error('Cannot transform document search terms in cache reload');
				}
				LOGGER.error(`Error sentence transforming document search results ${e.message}`, '7EYPXX7', userId);
			}


		} else {
			// get results
			try {
				searchResults = await documentSearch(req, {...req.body, expansionDict, index, operator}, userId);
			} catch (e) {
				const { message } = e;
				LOGGER.error(message, 'GRXU38P', userId);
				throw e;
			}
		}

		// insert crawler dates into search results
		searchResults = await dataTracker.crawlerDateHelper(searchResults, userId);

		// use transformer on results
		if (searchType === 'Intelligent') {
			try {
				const { docs } = searchResults;
				const transformed = await transformDocumentSearchResults(docs, searchText, userId);
				if (transformed === TRANSFORM_ERRORED) {
					searchResults.transformFailed = true;
				} else {
					searchResults.docs = transformed;
				}
			} catch (e) {
				if (forCacheReload) {
					throw Error('Cannot transform document search terms in cache reload');
				}
				LOGGER.error(`Error transforming document search results ${e.message}`, 'U64MDOA', userId);
			}
		}

		// try to store to cache
		if (useGCCache && searchResults && redisKey) {
			try {
				const timestamp = new Date().getTime();
				LOGGER.info(`Storing new keyword cache entry: ${redisKey}`);
				await redisDB.set(redisKey, JSON.stringify(searchResults));
				await redisDB.set(redisKey + ':time', timestamp);
				historyRec.cachedResult = false;
			} catch (e) {
				if (forCacheReload) {
					throw Error('Storing to cache failed in cache reload');
				}

				LOGGER.error(e.message, 'WVVCLPX', userId);
			}
		}

		// try storing results record
		if (!forCacheReload) {
			try {
				const { totalCount } = searchResults;
				historyRec.endTime = new Date().toISOString();
				historyRec.numResults = totalCount;
				await storeRecordOfSearchInPg(historyRec, isClone, cloneData, showTutorial);
			} catch (e) {
				LOGGER.error(e.message, 'MPK1GGN', userId);
			}
		}

		return searchResults;

	} catch (err) {
		if (!forCacheReload){
			const { message } = err;
			LOGGER.error(message, 'T74FU1I', userId);
			historyRec.endTime = new Date().toISOString();
			historyRec.hadError = true;
			await storeRecordOfSearchInPg(historyRec, isClone, cloneData, showTutorial);
		}
		throw err;
	}
}

async function storeRecordOfSearchInPg(historyRec, isClone, cloneData = {}, showTutorial) {
	let userId = 'Unknown';
	try {
		const { user_id, searchText, startTime, endTime, hadError, numResults, searchType, cachedResult, orgFilters, tiny_url, request_body, search_version, clone_name } = historyRec;
		const hashed_user = sparkMD5.hash(user_id);

		if (user_id) userId = user_id;

		const obj = {
			user_id: hashed_user,
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
			search_version
		};

		GC_HISTORY.create(obj);

	} catch (err) {
		LOGGER.error(err, 'UQ5B8CP', userId);
	}
}

function getESClient(isClone, cloneData, permissions, index){
	let esClientName = 'gamechanger';
	let esIndex = 'gamechanger';
	if (isClone) {
		switch (cloneData.clone_data.esCluster) {
			case 'eda':
				if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')){
					esClientName = 'eda';
					esIndex = constants.EDA_ELASTIC_SEARCH_OPTS.index;
				} else {
					throw 'Unauthorized';
				}
				break;
			default:
				esClientName = 'gamechanger';
		}

		if (index) {
			esIndex = index;
		}
		else if (constants.GAME_CHANGER_OPTS.index) {
			esIndex = constants.GAME_CHANGER_OPTS.index;
		}
	}
	return { esClientName, esIndex };
}

async function storeEsRecord(esClient, offset, clone_name, userId, searchText){
	try {
		// log search query to elasticsearch 
		if (offset === 0){
			let clone_log = clone_name ? clone_name : 'policy';
			const searchLog = {
				user_id: sparkMD5.hash(userId),
				search_query: searchText,
				run_time: new Date().getTime(),
				clone_name: clone_log

			};
			let search_history_index = constants.GAME_CHANGER_OPTS.historyIndex;

			dataLibrary.putDocument(esClient, search_history_index, searchLog)
		}
	} catch (e) {
		LOGGER.error(e.message, 'UA0YDAL');
	}
}

async function transformDocumentSearchResults(docs, searchText, userId) {
	try {
		let flatHits = [];
		let rankedDocs = [];

		// removing the highlighting that comes from elasticsearch and adds pagenumber to the id
		docs.forEach(doc => {
			const updatedHits = doc.pageHits.map(hit => {
				return { id: `${doc.id}+${hit.pageNumber}`, text: hit.snippet.replace(/<em>(.*?)<\/em>/g, '$1')};
			});
			flatHits = flatHits.concat(updatedHits);
		});
		const transformedResults = await mlApi.transformResults(searchText, flatHits, userId);

		const aggregated = new Map();

		// highlights context and aggregates the flattened pageHits to their respective docIds
		transformedResults.answers.forEach(r => {
			const {text, answer, id} = r;
			const [docId, parNum] = id.split('+');
			const highlightedText = text.replace(answer, `<em>${answer}</em>`);
			if (!aggregated.get(docId)){
				aggregated.set(docId, [{pageNumber: parNum, snippet: highlightedText}]);
			} else {
				const arr = aggregated.get(docId);
				arr.push({pageNumber: parNum, snippet: highlightedText});
				aggregated.set(docId, arr);
			}
		});

		// pushes newly aggregated docs to an array in new ranked order
		for (let [docId, hits] of aggregated) {
			const d = docs.filter(doc => doc.id === docId);
			const updatedDoc = {...d[0], pageHits: hits};
			rankedDocs.push(updatedDoc);
		}

		return rankedDocs;
	} catch (err) {
		const { message } = err;
		LOGGER.error(message, '3NF4CE8', userId);
		return TRANSFORM_ERRORED;
	}
}

async function documentSearch(req, body, userId) {
	try {
		const permissions = req.permissions ? req.permissions : [];
		const {
			getIdList,
			selectedDocuments,
			expansionDict = {},
			forGraphCache = false,
			isClone = false,
			cloneData = {},
			searchType,
			index = 'gamechanger'
		} = body;
		const [parsedQuery, searchTerms] = searchUtility.getEsSearchTerms(body);
		body.searchTerms = searchTerms;
		body.parsedQuery = parsedQuery;

		let esClientName = 'gamechanger';
		let esIndex = index;
		let esQuery = '';

		if (isClone) {
			switch (cloneData.clone_data.esCluster) {
				case 'eda':
					if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')) {

						const {extSearchFields = [], extRetrieveFields = [] } = constants.EDA_ELASTIC_SEARCH_OPTS;

						body.extSearchFields = extSearchFields.map((field) => field.toLowerCase());
						body.extStoredFields = extRetrieveFields.map((field) => field.toLowerCase());
						esQuery = searchUtility.getElasticsearchPagesQuery(body, userId);

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
				esQuery = searchUtility.getElasticsearchQueryForGraphCache(body, userId);
			} else if (searchType === 'Simple') {
				esQuery = searchUtility.getSimpleSyntaxElasticsearchQuery(body, userId);
				esIndex = constants.GAME_CHANGER_OPTS.simpleIndex;
			} else {
				esQuery = searchUtility.getElasticsearchQuery(body, userId);
			}
		}

		const results = await dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);
		if (results && results.body && results.body.hits && results.body.hits.total && results.body.hits.total.value && results.body.hits.total.value > 0) {

			if (getIdList) {
				return searchUtility.cleanUpIdEsResults(results, searchTerms, userId, expansionDict);
			}

			if (forGraphCache){
				return searchUtility.cleanUpIdEsResultsForGraphCache(results, userId);
			} else {
				return searchUtility.cleanUpEsResults(results, searchTerms, userId, selectedDocuments, expansionDict, esIndex);
			}
		} else {
			LOGGER.error('Error with Elasticsearch results', '8JQKR3N', userId);
			return { totalCount: 0, docs: [] };
		}
	} catch (e) {
		const { message } = e;
		LOGGER.error(message, 'B0L5DCA', userId);
		throw e;
	}
}

async function documentSearchUsingParaId(req, body, userId) {
	try {
		const permissions = req.permissions ? req.permissions : [];

		const { isClone = false, cloneData = {}, filenames = [], expansionDict = {} } = body;

		const [parsedQuery, searchTerms] = await searchUtility.getEsSearchTerms(body);
		body.searchTerms = searchTerms;
		body.parsedQuery = parsedQuery;
		body.paraIds = filenames;

		const {index} = constants.EDA_ELASTIC_SEARCH_OPTS;

		const esQuery = searchUtility.getElasticsearchQueryUsingParagraphId(body, userId);

		let clientObj = getESClient(isClone, cloneData, permissions, index);

		const esResults = await dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery, userId);
		if (esResults && esResults.body && esResults.body.hits && esResults.body.hits.total && esResults.body.hits.total.value && esResults.body.hits.total.value > 0) {

			return searchUtility.cleanUpEsResults(esResults, searchTerms, userId, null, expansionDict, clientObj.esIndex, esQuery);

		} else {
			LOGGER.error('Error with Elasticsearch results', 'JBVXMP6', userId);
			return { totalCount: 0, docs: [] };
		}

	} catch (err) {
		const msg = (err && err.message) ? `${err.message}` : `${err}`;
		LOGGER.error(msg, 'A5TS6ST', userId);
		throw msg;
	}
}

// const simplePdfSearchHandler = new SimplePdfSearchHandler();

module.exports = SimplePdfSearchHandler;
