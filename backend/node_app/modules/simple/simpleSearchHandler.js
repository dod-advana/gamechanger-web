const SearchUtility = require('../../utils/searchUtility');
const searchUtility = new SearchUtility();
const constants = require('../../config/constants');
const asyncRedisLib = require('async-redis');
const redisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
const { MLApiClient } = require('../../lib/mlApiClient');
const { DataTrackerController } = require('../../controllers/dataTrackerController');
const { DataLibrary } = require('../../lib/dataLibrary');
const { Thesaurus } = require('../../lib/thesaurus');
const thesaurus = new Thesaurus();
const LOGGER = require('@dod-advana/advana-logger');
const redisAsyncClientDB = 7;
const abbreviationRedisAsyncClientDB = 9;
const SearchHandler = require('../base/searchHandler');
const { getUserIdFromSAMLUserId } = require('../../utils/userUtility');

class SimpleSearchHandler extends SearchHandler {
	constructor(opts = {}) {
		const {
			dataTracker = new DataTrackerController(opts),
			logger = LOGGER,
			searchUtility = new SearchUtility(opts),
			dataLibrary = new DataLibrary(opts),
			mlApi = new MLApiClient(opts),
		} = opts;
		super({ redisClientDB: redisAsyncClientDB, ...opts });

		this.dataTracker = dataTracker;
		this.logger = logger;
		this.searchUtility = searchUtility;
		this.dataLibrary = dataLibrary;
		this.mlApi = mlApi;
	}

	async searchHelper(req, userId, storeHistory) {
		const historyRec = {
			user_id: getUserIdFromSAMLUserId(req),
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
			useGCCache,
			showTutorial = false,
			tiny_url,
			forCacheReload = false,
			esIndex,
		} = req.body;

		try {
			historyRec.search = searchText;
			historyRec.searchText = searchText;
			historyRec.tiny_url = tiny_url;
			historyRec.clone_name = cloneName;
			historyRec.searchType = searchType;
			historyRec.search_version = searchVersion;
			historyRec.request_body = req.body;
			historyRec.showTutorial = showTutorial;

			const cloneSpecificObject = {};

			const operator = 'and';

			const redisDB = redisAsyncClient;
			redisDB.select(redisAsyncClientDB);

			const clientObj = { esClientName: 'gamechanger', esIndex };

			// log query to ES
			if (storeHistory) {
				this.storeEsRecord(clientObj.esClientName, offset, cloneName, historyRec.user_id, searchText);
			}

			// if (!forCacheReload && useGCCache && offset === 0) {
			// 	return this.getCachedResults(req, historyRec, cloneSpecificObject, userId, storeHistory);
			// }
			// try to get search expansion
			const [parsedQuery, termsArray] = searchUtility.getEsSearchTerms({ searchText });
			let expansionDict = {};
			try {
				expansionDict = await this.mlApi.getExpandedSearchTerms(termsArray, userId);
			} catch (e) {
				// log error and move on, expansions are not required
				if (forCacheReload) {
					throw Error('Cannot get expanded search terms in cache reload');
				}
				this.logger.error('Cannot get expanded search terms, continuing with search', '5HAV6D2', userId);
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
			abbreviationExpansions.forEach((abb) => {
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

			expansionDict = searchUtility.combineExpansionTerms(
				expansionDict,
				synonyms,
				text,
				cleanedAbbreviations,
				userId
			);
			// this.logger.info('exp: ' + expansionDict);
			await redisAsyncClient.select(redisAsyncClientDB);

			let searchResults = await this.documentSearch(
				req,
				{ ...req.body, expansionDict, operator },
				clientObj,
				userId
			);

			// insert crawler dates into search results
			searchResults = await this.dataTracker.crawlerDateHelper(searchResults, userId);

			// try to store to cache
			if (storeHistory && useGCCache && searchResults) {
				await this.storeCachedResults(req, historyRec, searchResults, cloneSpecificObject, userId);
			}

			// try storing results record
			if (storeHistory && !forCacheReload) {
				try {
					const { totalCount } = searchResults;
					historyRec.endTime = new Date().toISOString();
					historyRec.numResults = totalCount;
					await this.storeRecordOfSearchInPg(historyRec, userId);
				} catch (e) {
					this.logger.error(e.message, 'SHW1IT9', userId);
				}
			}

			return searchResults;
		} catch (err) {
			if (storeHistory && !forCacheReload) {
				const { message } = err;
				this.logger.error(message, 'W28XNE0', userId);
				historyRec.endTime = new Date().toISOString();
				historyRec.hadError = true;
				await this.storeRecordOfSearchInPg(historyRec, showTutorial);
			}
			throw err;
		}
	}

	async documentSearch(req, body, clientObj, userId) {
		try {
			const { getIdList, selectedDocuments, expansionDict = {}, forGraphCache = false } = body;
			const [parsedQuery, searchTerms] = searchUtility.getEsSearchTerms(body);
			body.searchTerms = searchTerms;
			body.parsedQuery = parsedQuery;

			let { esClientName, esIndex } = clientObj;
			let esQuery = '';

			if (esQuery === '') {
				if (forGraphCache) {
					esQuery = searchUtility.getElasticsearchQueryForGraphCache(body, userId);
				} else {
					esQuery = getElasticsearchQuery(body, userId);
				}
			}

			const results = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			if (
				results &&
				results.body &&
				results.body.hits &&
				results.body.hits.total &&
				results.body.hits.total.value &&
				results.body.hits.total.value > 0
			) {
				if (getIdList) {
					return searchUtility.cleanUpIdEsResults(results, searchTerms, userId, expansionDict);
				}

				if (forGraphCache) {
					return searchUtility.cleanUpIdEsResultsForGraphCache(results, userId);
				} else {
					return searchUtility.cleanUpEsResults({
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
				this.logger.error('Error with Elasticsearch results', '0F31BB1', userId);
				return { totalCount: 0, docs: [] };
			}
		} catch (e) {
			this.logger.error(e.message, 'V3EVTG5', userId);
		}
	}

	async storeEsRecord(esClient, offset, clone_name, userId, searchText) {
		try {
			// log search query to elasticsearch
			if (offset === 0) {
				let clone_log = clone_name || 'policy';
				const searchLog = {
					user_id: userId,
					search_query: searchText,
					run_time: new Date().getTime(),
					clone_name: clone_log,
				};
				let search_history_index = constants.GAME_CHANGER_OPTS.historyIndex;

				this.dataLibrary.putDocument(esClient, search_history_index, searchLog);
			}
		} catch (e) {
			this.logger.error(e.message, 'WFHI0RW');
		}
	}
}

function getElasticsearchQuery(
	{
		searchText,
		searchTerms,
		parsedQuery,
		index,
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
			'display_doc_type_s',
			'is_revoked_b',
			'access_timestamp_dt',
			'publication_date_dt',
			'crawler_used_s',
		],
		extStoredFields = [],
		extSearchFields = [],
		includeRevoked = false,
	},
	user
) {
	try {
		// add additional search fields to the query
		const mustQueries = [];
		for (const key in searchFields) {
			const searchField = searchFields[key];
			if (searchField.field && searchField.field.name && searchField.input && searchField.input.length !== 0) {
				const wildcard = { query_string: { query: `${searchField.field.name}:*${searchField.input}*` } };
				// wildcard.wildcard[`${searchField.field.name}${searchField.field.searchField ? '.search' : ''}`] = { value: `*${searchField.input}*` };

				mustQueries.push(wildcard);
			}
		}

		storedFields = [...storedFields, ...extStoredFields];

		let query = {
			_source: {
				includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', 'topics_s'],
			},
			stored_fields: storedFields,
			from: offset,
			size: limit,
			aggregations: {
				doc_type_aggs: {
					terms: {
						field: 'doc_type',
						size: 10000,
					},
				},
			},
			track_total_hits: true,
			query: {
				bool: {
					must: [
						{
							nested: {
								path: 'paragraphs',
								inner_hits: {
									_source: false,
									stored_fields: [
										'paragraphs.page_num_i',
										'paragraphs.filename',
										'paragraphs.par_raw_text_t',
									],
									from: 0,
									size: 5,
									highlight: {
										fields: {
											'paragraphs.filename.search': {
												number_of_fragments: 0,
											},
											'paragraphs.par_raw_text_t': {
												fragment_size: 2 * charsPadding,
												number_of_fragments: 1,
											},
										},
										fragmenter: 'span',
									},
								},
								query: {
									bool: {
										should: [
											{
												wildcard: {
													'paragraphs.filename.search': {
														value: `${parsedQuery}*`,
														boost: 15,
													},
												},
											},
											{
												query_string: {
													query: `${parsedQuery}`,
													default_field: 'paragraphs.par_raw_text_t',
													default_operator: `${operator}`,
													fuzzy_max_expansions: 100,
													fuzziness: 'AUTO',
												},
											},
										],
									},
								},
							},
						},
					],
					should: [
						{
							multi_match: {
								query: `${parsedQuery}`,
								fields: ['keyw_5^2', 'id^2', 'summary_30', 'paragraphs.par_raw_text_t'],
								operator: 'or',
							},
						},
						{
							rank_feature: {
								field: 'pagerank_r',
								boost: 0.5,
							},
						},
						{
							rank_feature: {
								field: 'kw_doc_score_r',
								boost: 0.1,
							},
						},
					],
				},
			},
		};

		if (extSearchFields.length > 0) {
			const extQuery = {
				multi_match: {
					query: searchText,
					fields: [],
					operator: 'or',
				},
			};
			extQuery.multi_match.fields = extSearchFields.map((field) => field.toLowerCase());
			query.query.bool.should = query.query.bool.should.concat(extQuery);
		}

		if (
			constants.GAME_CHANGER_OPTS.allow_daterange &&
			!publicationDateAllTime &&
			publicationDateFilter[0] &&
			publicationDateFilter[1]
		) {
			if (!publicationDateAllTime && publicationDateFilter[0] && publicationDateFilter[1]) {
				query.query.bool.must.push({
					range: {
						publication_date_dt: {
							gte: publicationDateFilter[0].split('.')[0],
							lte: publicationDateFilter[1].split('.')[0],
						},
					},
				});
			}
		}

		if (mustQueries.length > 0) {
			query.query.bool.must = query.query.bool.must.concat(mustQueries);
		}

		return query;
	} catch (err) {
		this.logger.error(err, 'O5ODGS6', user);
	}
}

// const simpleSearchHandler = new SimpleSearchHandler();

module.exports = SimpleSearchHandler;
