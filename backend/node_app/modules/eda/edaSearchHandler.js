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

const redisAsyncClientDB = 4;
const abbreviationRedisAsyncClientDB = 9;

const SearchHandler = require('../base/searchHandler');

class EdaSearchHandler extends SearchHandler {
	constructor(opts = {}) {
		super({redisClientDB: redisAsyncClientDB, ...opts});
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

			const redisDB = separatedRedisAsyncClient;
			redisDB.select(redisAsyncClientDB);

			const clientObj = {esClientName: 'eda', esIndex: constants.EDA_ELASTIC_SEARCH_OPTS.index};

			// log query to ES
			storeEsRecord(clientObj.esClientName, offset, cloneName, userId, searchText);

			if (!forCacheReload && useGCCache && offset === 0) {
				return this.getCachedResults(req, historyRec, cloneSpecificObject, userId);
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

			expansionDict = searchUtility.combineExpansionTerms(expansionDict, synonyms, text, cleanedAbbreviations, userId);
			// this.logger.info('exp: ' + expansionDict);
			await redisAsyncClient.select(redisAsyncClientDB);

			let searchResults;
			searchResults = await documentSearch(req, {...req.body, expansionDict, operator}, clientObj, userId);

			// insert crawler dates into search results
			searchResults = await dataTracker.crawlerDateHelper(searchResults, userId);

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
					this.logger.error(e.message, 'ZMVI2TO', userId);
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
					this.logger.error(err.message, 'AZXG5J3', userId);
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
}

async function storeEsRecord(esClient, offset, clone_name, userId, searchText){
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

			dataLibrary.putDocument(esClient, search_history_index, searchLog);
		}
	} catch (e) {
		this.logger.error(e.message, 'UA0YDAL');
	}
}

async function documentSearch(req, body, clientObj, userId) {
	try {
		const permissions = req.permissions ? req.permissions : [];
		const {
			getIdList,
			selectedDocuments,
			expansionDict = {},
			forGraphCache = false
		} = body;
		const [parsedQuery, searchTerms] = searchUtility.getEsSearchTerms(body);
		body.searchTerms = searchTerms;
		body.parsedQuery = parsedQuery;

		const { esClientName, esIndex } = clientObj;
		let esQuery = '';

		if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')) {

			const {extSearchFields = [], extRetrieveFields = [] } = constants.EDA_ELASTIC_SEARCH_OPTS;

			body.extSearchFields = extSearchFields.map((field) => field.toLowerCase());
			body.extStoredFields = extRetrieveFields.map((field) => field.toLowerCase());
			esQuery = getElasticsearchPagesQuery(body, userId);

		} else {
			throw 'Unauthorized';
		}

		const results = await dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);

		if (results && results.body && results.body.hits && results.body.hits.total && results.body.hits.total.value && results.body.hits.total.value > 0) {

			if (getIdList) {
				return searchUtility.cleanUpIdEsResults(results, searchTerms, userId, expansionDict);
			}

			if (forGraphCache){
				return searchUtility.cleanUpIdEsResultsForGraphCache(results, userId);
			} else {
				return searchUtility.cleanUpEsResults(results, searchTerms, userId, selectedDocuments, expansionDict, esIndex, esQuery);
			}
		} else {
			this.logger.error('Error with Elasticsearch results', 'JY3IIJ3', userId);
			return { totalCount: 0, docs: [] };
		}
	} catch (e) {
		const { message } = e;
		this.logger.error(message, 'YNR8ZIT', userId);
		throw e;
	}
}

function getElasticsearchPagesQuery(
	{
		searchText,
		searchTerms,
		parsedQuery,
		offset = 0,
		limit = 20,
		format = 'json',
		getIdList = false,
		expandTerms = false,
		charsPadding = 90,
		operator = 'and',
		searchFields = {},
		accessDateFilter = [],
		publicationDateFilter = [],
		publicationDateAllTime = true,
		storedFields = [
			'filename',
			'title',
			'page_count',
			'doc_type',
			'doc_num',
			'ref_list',
			'id',
			'summary_30',
			'keyw_5',
			'p_text',
			'type',
			'p_page',
			'display_title_s',
			'display_org_s',
			'display_doc_type_s'
		],
		extStoredFields = [],
		extSearchFields = [],
		edaSearchSettings = {}
	}, user) {

	try {
		// add additional search fields to the query
		const mustQueries = [];

		for (const key in searchFields) {
			const searchField = searchFields[key];
			if (searchField.field && searchField.field.name && searchField.input && searchField.input.length !== 0) {
				const wildcard = { wildcard: {} };
				wildcard.wildcard[`${searchField.field.name}${searchField.field.searchField ? '.search' : ''}`] = { value: `*${searchField.input}*` };

				mustQueries.push(wildcard);
			}
		}

		if (edaSearchSettings.issueAgency) {
			const matchAgency = {
				"nested": {
					"path": "address_eda_ext_n",
					"query": {
						"bool": {
							"must": [
								{ "match" : { "address_eda_ext_n.org_name_eda_ext": edaSearchSettings.issueAgency}}
							]
						}
					}
				}
			};
			mustQueries.push(matchAgency);
		}

		
		if (edaSearchSettings.startDate || edaSearchSettings.endDate) {
			const rangeQuery = {
				"nested": {
					"path": "metadata_eda_ext_n",
					"query": {
						"range": {
							"metadata_eda_ext_n.effectivedate_eda_ext_dt": {}
						}
					}
				}

			};

			let push = false;

			if (edaSearchSettings.startDate) {
				const start = new Date(edaSearchSettings.startDate);

				if (!isNaN(start.getTime())) {
					rangeQuery.nested.query.range["metadata_eda_ext_n.effectivedate_eda_ext_dt"] = {
						gte: Math.round(start.getTime() / 1000)
					}
					push = true;
				}
			}
			
			if (edaSearchSettings.endDate) {
				const end = new Date(edaSearchSettings.endDate);
				
				if (!isNaN(end.getTime())) {
					rangeQuery.nested.query.range["metadata_eda_ext_n.effectivedate_eda_ext_dt"] = {
						lte: Math.round(end.getTime() / 1000)
					}
					push = true;	
				}
			}

			if (push) {
				mustQueries.push(rangeQuery);
			}
		}

		storedFields = [...storedFields, ...extStoredFields];

		let query = {
			_source: {
				includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_ext_n*']
			},
			stored_fields: storedFields,
			from: offset,
			size: limit,
			aggregations: {
				doc_type_aggs: {
					terms: {
						field: 'doc_type',
						size: 10000
					}
				}
			},
			track_total_hits: true,
			query: {
				bool: {
					must: [
						{
							bool: {
								should: [
									{
										nested: {
											path: 'pages',
											inner_hits: {
												_source: false,
												stored_fields: [
													'pages.filename',
													'pages.p_raw_text'
												],
												from: 0,
												size: 5,
												highlight: {
													fields: {
														'pages.filename.search': {
															number_of_fragments: 0
														},
														'pages.p_raw_text': {
															fragment_size: 2 * charsPadding,
															number_of_fragments: 1
														}
													},
													fragmenter: 'span'
												}
											},
											query: {
												bool: {
													should: [
														{
															wildcard: {
																'pages.filename.search': {
																	value: `${parsedQuery}*`,
																	boost: 15
																}
															}
														},
														{
															query_string: {
																query: `${parsedQuery}`,
																default_field: 'pages.p_raw_text',
																default_operator: `${operator}`,
																fuzzy_max_expansions: 100,
																fuzziness: 'AUTO'
															}
														}
													]
												}
											}
										}
									}
								]
							}
						}
					],
					should: [
						{
							multi_match: {
								query: `${parsedQuery}`,
								fields: [
									'keyw_5^2',
									'id^2',
									'summary_30',
									'pages.p_raw_text'
								],
								operator: 'or'
							}
						},
						{
							rank_feature: {
								field: 'pagerank_r',
								boost: 0.5
							}
						},
						{
							rank_feature: {
								field: 'kw_doc_score_r',
								boost: 0.1
							}
						}
					]
				}
			}
		};

		if (extSearchFields.length > 0){
			const extQuery = {
				multi_match: {
					query: searchText,
					fields: [],
					operator: 'or'
				}
			};
			extQuery.multi_match.fields = extSearchFields.map((field) => field.toLowerCase());
			// query.query.bool.should = query.query.bool.should.concat(extQuery);
			query.query.bool.must[0].bool.should = query.query.bool.must[0].bool.should.concat(extQuery);
		}

		if (constants.GAME_CHANGER_OPTS.allow_daterange && !publicationDateAllTime && publicationDateFilter[0] && publicationDateFilter[1]){
			query.query.bool.must = query.query.bool.must.concat([
				{
					range: {
						publication_date: {
							gte: publicationDateFilter[0],
							lte: publicationDateFilter[1]
						}
					}
				}
			]);
		}

		if (mustQueries.length > 0) {
			query.query.bool.must = query.query.bool.must.concat(mustQueries);
		}
		// console.log(JSON.stringify(query))
		return query;
	} catch (err) {
		this.logger.error(err, 'M6THI27', user);
	}
}

// const edaSearchHandler = new EdaSearchHandler();

module.exports = EdaSearchHandler;
