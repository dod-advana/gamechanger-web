
const SearchUtility = require('../../utils/searchUtility');
const searchUtility = new SearchUtility();
const { DataLibrary} = require('../../lib/dataLibrary');
const dataLibrary = new DataLibrary();
const constants = require('../../config/constants');
const SearchHandler = require('../base/searchHandler');
const FAVORITE_SEARCH = require('../../models').favorite_searches;
const sparkMD5 = require('spark-md5');

const redisAsyncClientDB = 7;

class HermesSearchHandler extends SearchHandler {
	constructor(opts = {}) {
		super({redisClientDB: redisAsyncClientDB, ...opts});
	}

	async searchHelper(req, userId) {
		const historyRec = {
			user_id: userId,
			searchText: '',
			startTime: new Date().toISOString(),
			numResults: -1,
			endTime: null,
			hadError: false,
			isSemanticSearch: false,
			tiny_url: '',
			cachedResult: false
		};

		const {
			offset,
			useGCCache,
			forCacheReload = false,
			showTutorial,
			searchVersion,
			cloneName,
			searchText,
			tiny_url
		} = req.body;

		try {
			historyRec.searchText = searchText;
			historyRec.clone_name = cloneName;
			historyRec.tiny_url = tiny_url;
			historyRec.showTutorial = showTutorial;
			historyRec.request_body = req.body;
			historyRec.search_version = searchVersion;

			const cloneSpecificObject = {};

			if (!forCacheReload && useGCCache && offset === 0) {
				return this.getCachedResults(req, historyRec, cloneSpecificObject, userId);
			}

			const clientObj = {esClientName: 'gamechanger', esIndex: constants.HERMES_ELASTIC_SEARCH_OPTS.index};

			// get results
			let searchResults = {totalCount: 0, docs: []};
			try {
				const { offset = 0, limit = 20 } = req.body;
				const [parsedQuery, searchTerms] = searchUtility.getEsSearchTerms(req.body);
				req.body.searchTerms = searchTerms;
				req.body.parsedQuery = parsedQuery;
				const auxSearchFields = constants.HERMES_ELASTIC_SEARCH_OPTS.auxSearchFields;
				const auxRetrieveFields = constants.HERMES_ELASTIC_SEARCH_OPTS.auxRetrieveFields;

				let esQuery = {
					from: offset,
					size: limit,
					query: {
						query_string: {
							query: searchText
						}
					}
				};

				if (auxSearchFields.length > 0 && !(auxSearchFields.length === 1 && auxSearchFields[0] === '')) {
					esQuery = {
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
						query: {
							multi_match: {
								query: searchText,
								fields: []
							}
						}
					};
					esQuery.query.multi_match.fields = auxSearchFields.map((field) => field.toLowerCase());
					esQuery.stored_fields = auxRetrieveFields.map((field) => field.toLowerCase());

				}

				esQuery.highlight = {
					fragment_size: 200,
					fields: {
						Subject: {},
						Body: {},
						originator: {},
						receiver: {}
					}
				};

				const esResults = await dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery, userId);
				const { body = {} } = esResults;
				const { hits: esHits = {} } = body;
				const { hits = [], total: { value } } = esHits;

				searchResults.totalCount = value;

				hits.forEach((hit) => {
					let result = {};
					for (let key in hit.fields) {
						result[key] = hit.fields[key][0];
					}
					for (let key in hit._source) {
						result[key] = hit._source[key];
					}
					result.esIndex = clientObj.esIndex;
					result.is_aux_gc_result = true;
					result.highlight = hit.highlight;
					searchResults.docs.push(result);
				});
			} catch (e) {
				const { message } = e;
				this.logger.error(message, 'QMKINJ6', userId);
				throw message;
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
					this.logger.error(e.message, 'CWDCQLF', userId);
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
					this.logger.error(err.message, '6Z82DDP', userId);
				}
			}

			return searchResults;

		} catch (err) {
			const { message } = err;
			this.logger.error(message, '43EFJQJ', userId);
			historyRec.endTime = new Date().toISOString();
			historyRec.hadError = true;
			throw message;
		}
	}
}


// const hermesSearchHandler = new HermesSearchHandler();

module.exports = HermesSearchHandler;
