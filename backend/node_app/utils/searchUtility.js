const LOGGER = require('@dod-advana/advana-logger');
const _ = require('lodash');
const sparkMD5Lib = require('spark-md5');
const constantsFile = require('../config/constants');
const { MLApiClient } = require('../lib/mlApiClient');
const { DataLibrary } = require('../lib/dataLibrary');
const neo4jLib = require('neo4j-driver');

class SearchUtility {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			sparkMD5 = sparkMD5Lib,
			constants = constantsFile,
			mlApi = new MLApiClient(opts),
			dataApi = new DataLibrary(opts),
		} = opts;

		this.logger = logger;
		this.sparkMD5 = sparkMD5;
		this.constants = constants;
		this.mlApi = mlApi;
		this.dataLibrary = dataApi;

		this.combineExpansionTerms = this.combineExpansionTerms.bind(this);
		// helpers for combineExpansionTerms
		this.getWordsList = this.getWordsList.bind(this);
		this.expandRelatedSearches = this.expandRelatedSearches.bind(this);
		this.combineExpansionTermsLoopHelper = this.combineExpansionTermsLoopHelper.bind(this);

		this.getEsSearchTerms = this.getEsSearchTerms.bind(this);
		this.getElasticsearchQueryForGraphCache = this.getElasticsearchQueryForGraphCache.bind(this);
		this.getElasticsearchQuery = this.getElasticsearchQuery.bind(this);
		//  helpers for getElasticsearchQuery
		this.getSearchFieldsWildcardQueries = this.getSearchFieldsWildcardQueries.bind(this);
		this.setQuerySort = this.setQuerySort.bind(this);
		this.setQueryMainSearchText = this.setQueryMainSearchText.bind(this);
		this.setQueryExtSearchFields = this.setQueryExtSearchFields.bind(this);
		this.setQueryPubDate = this.setQueryPubDate.bind(this);
		this.setQueryCancelledDocs = this.setQueryCancelledDocs.bind(this);
		this.setQueryOrgFilter = this.setQueryOrgFilter.bind(this);
		this.setQueryTypeFilter = this.setQueryTypeFilter.bind(this);
		this.setQueryRescore = this.setQueryRescore.bind(this);
		this.setQuerySearchAfter = this.setQuerySearchAfter.bind(this);

		this.getESHighlightContent = this.getESHighlightContent.bind(this);
		this.cleanUpIdEsResults = this.cleanUpIdEsResults.bind(this);
		this.cleanUpEsResults = this.cleanUpEsResults.bind(this);
		this.cleanUpIdEsResultsForGraphCache = this.cleanUpIdEsResultsForGraphCache.bind(this);
		this.documentSearchOneID = this.documentSearchOneID.bind(this);
		this.documentSearch = this.documentSearch.bind(this);
		this.makeAliasesQuery = this.makeAliasesQuery.bind(this);
		this.findAliases = this.findAliases.bind(this);
		this.getOrgQuery = this.getOrgQuery.bind(this);
		this.getTypeQuery = this.getTypeQuery.bind(this);
		this.getTitle = this.getTitle.bind(this);
		this.getElasticsearchDocDataFromId = this.getElasticsearchDocDataFromId.bind(this);
		this.getSearchCount = this.getSearchCount.bind(this);
		this.autocorrect = this.autocorrect.bind(this);
		this.getJBookPGQueryAndSearchTerms = this.getJBookPGQueryAndSearchTerms.bind(this);
	}

	createCacheKeyFromOptions({ searchText, cloneName = 'gamechangerDefault', index, cloneSpecificObject = {} }) {
		// order matters for json stringify, adjusting this order will make a different cache key
		const options = JSON.stringify({ searchText, index, cloneSpecificObject });
		const hashed = this.sparkMD5.hash(options);
		return `${cloneName}_${hashed}`;
	}

	/********** RELATED SEARCH AND EXPANSION FUNCTIONS **********/

	// helper for combineExpansionTerms
	getWordsList(similarWords, expandedWords) {
		let wordsList = [];
		for (let word in similarWords) {
			wordsList = wordsList.concat(similarWords[word]);
		}
		for (let word in expandedWords) {
			wordsList = wordsList.concat(expandedWords[word]);
		}
		return wordsList;
	}

	// helper for combineExpansionTerms
	expandRelatedSearches(relatedSearches, result, key) {
		if (relatedSearches && relatedSearches.length > 0) {
			relatedSearches.forEach((term) => {
				result[key].push({ phrase: term, source: 'related' });
			});
		}
		return relatedSearches;
	}

	// helper for combineExpansionTerms
	combineExpansionTermsLoopHelper(
		checkSyns,
		checkAbbs,
		checkWordList,
		phraseSets,
		indexes,
		timesSinceLastAdd,
		results
	) {
		let { nextSynIndex, nextAbbIndex, nextMlIndex } = indexes;
		let { synonyms, abbreviationExpansions, wordsList } = phraseSets;
		if (checkSyns) {
			let syn = synonyms[nextSynIndex];
			if (!_.find(results, { phrase: syn })) {
				results.push({ phrase: syn, source: 'thesaurus' });
			}
			nextSynIndex++;
		} else if (checkAbbs) {
			let abb = abbreviationExpansions[nextAbbIndex];
			if (!_.find(results, { phrase: abb })) {
				results.unshift({ phrase: abb, source: 'abbreviations' });
			}
			nextAbbIndex++;
		} else if (checkWordList) {
			let phrase = wordsList[nextMlIndex];
			if (phrase && phrase !== '' && !_.find(results, { phrase })) {
				results.push({ phrase: phrase, source: 'ML-QE' });
			}
			nextMlIndex++;
		} else {
			timesSinceLastAdd++;
		}
		return { results, timesSinceLastAdd, nextSynIndex, nextAbbIndex, nextMlIndex };
	}

	combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbreviationExpansions, userId) {
		try {
			let result = {};
			result[key] = [];

			let nextSynIndex = 0;
			let nextAbbIndex = 0;
			let nextMlIndex = 0;
			let nextIsSyn = false;
			let nextIsAbb = true;
			let timesSinceLastAdd = 0;

			let expandedWords = {};
			let similarWords = {};
			if (expansionDict) {
				expandedWords = expansionDict['qexp'];
				similarWords = expansionDict['wordsim'];
			}

			const wordsList = this.getWordsList(similarWords, expandedWords);
			this.expandRelatedSearches(relatedSearches, result, key);

			while (result[key].length < 12 && timesSinceLastAdd < 18) {
				const checkSynonyms = nextIsSyn && synonyms && synonyms[nextSynIndex];
				const checkAbbreviations = nextIsAbb && abbreviationExpansions && abbreviationExpansions[nextAbbIndex];
				const checkWordList = !nextIsAbb && !nextIsSyn && expandedWords && wordsList && wordsList[nextMlIndex];
				const helperResult = this.combineExpansionTermsLoopHelper(
					checkSynonyms,
					checkAbbreviations,
					checkWordList,
					{ synonyms, abbreviationExpansions, wordsList },
					{ nextSynIndex, nextAbbIndex, nextMlIndex },
					timesSinceLastAdd,
					result[key]
				);
				result[key] = helperResult.results;
				timesSinceLastAdd = helperResult.timesSinceLastAdd;
				nextSynIndex = helperResult.nextSynIndex;
				nextAbbIndex = helperResult.nextAbbIndex;
				nextMlIndex = helperResult.nextMlIndex;

				if (nextIsSyn) {
					nextIsSyn = false;
				} else if (nextIsAbb) {
					nextIsAbb = false;
					nextIsSyn = true;
				} else {
					nextIsAbb = true;
				}
			}

			return this.cleanExpansions(key, result);
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'NOIROJE', userId);
		}
	}

	cleanExpansions(key, toReturn) {
		const cleaned = {};
		cleaned[key] = [];
		if (toReturn && toReturn[key] && toReturn[key].length) {
			const ordered = [];
			const currList = [];
			const orig = key.replace(/[^\w\s]|_/g, '').trim();
			currList.push(orig);
			toReturn[key].forEach((y) => {
				y.phrase = y.phrase.replace(/[^\w\s]|_/g, '').trim();
				if (y.phrase && y.phrase !== '' && y.phrase !== key && !currList.includes(y.phrase.toLowerCase())) {
					ordered.push(y);
					currList.push(y.phrase.toLowerCase());
				}
			});
			cleaned[key] = ordered;
		}

		return cleaned;
	}

	removeOriginalTermFromExpansion(key, phrase) {
		let cleanKey = key.toLowerCase();
		let cleanPhrase = phrase.replace(/\"/g, '');
		cleanPhrase = cleanPhrase.toLowerCase();
		cleanPhrase = cleanPhrase.replace(cleanKey, '');
		cleanPhrase = cleanPhrase.trim();
		if (cleanPhrase.includes(' ')) {
			cleanPhrase = `"${cleanPhrase}"`;
		}
		return cleanPhrase;
	}

	/********** RELATED SEARCH AND EXPANSION FUNCTIONS END **********/

	getQueryVariable(name, url) {
		name = name.replace(/[[\]]/g, '\\$&');
		const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
		const results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}

	remove_stopwords(str) {
		const stopwords = this.constants.STOP_WORDS;
		let res = [];
		const words = str.toLowerCase().split(' ');
		for (let word of words) {
			const word_clean = word.split('.').join('');
			if (!stopwords.includes(word_clean)) {
				res.push(word_clean);
			}
		}
		return res.join(' ');
	}

	getEsSearchTerms({ searchText, questionFlag }) {
		try {
			let terms = searchText;
			if (questionFlag) {
				const stopwordsRemoved = this.remove_stopwords(searchText);
				const cleanedText = stopwordsRemoved.replace(/\?/g, '');
				terms = cleanedText;
			}
			return this.getQueryAndSearchTerms(terms);
		} catch (e) {
			console.log('Error getting es search terms');
			this.logger.error(e.message, 'D2O1YIB');
			return [];
		}
	}

	getQueryAndSearchTerms(searchText) {
		// change all text to lower case, need upper case AND/OR for search so easier if everything is lower
		const searchTextLower = searchText.toLowerCase();

		//replace forward slashes will break ES query
		let cleanSearch = searchTextLower.replace(/[\/{}]/g, '');
		// finds quoted phrases separated by and/or and allows nested quotes of another kind eg "there's an apostrophe"
		const rawSequences = this.findQuoted(cleanSearch);

		let searchTextWithPlaceholders = cleanSearch;
		// replace phrases with __#__ placeholder
		rawSequences.forEach((phrase, index) => {
			searchTextWithPlaceholders = searchTextWithPlaceholders.replace(phrase, `__${index}__`);
		});

		// replace and/or with ' AND ' ' OR ' as required for search, one space is required
		searchTextWithPlaceholders = searchTextWithPlaceholders.replace(/(\s+)and(\s+)/g, ` AND `);
		searchTextWithPlaceholders = searchTextWithPlaceholders.replace(/(\s+)or(\s+)/g, ` OR `);

		// find unquoted words after replacing and/or
		// combine all terms to return for snippet highlighting
		const termsArray = this.findLowerCaseWordsOrAcronyms(searchTextWithPlaceholders);

		// fill back in double quoted phrases for  search
		rawSequences.forEach((phrase, index) => {
			const replacementSequence = this.convertPhraseToSequence(phrase);
			termsArray.push(replacementSequence);
			searchTextWithPlaceholders = searchTextWithPlaceholders.replace(`__${index}__`, `${replacementSequence}`);
		});

		const modSearchText = searchTextWithPlaceholders;
		// return  query and list of search terms after parsing
		return [modSearchText, termsArray];
	}

	getJBookPGQueryAndSearchTerms(searchText) {
		// change all text to lower case, need upper case AND/OR for solr search so easier if everything is lower
		const searchTextLower = searchText.toLowerCase();

		// finds quoted phrases separated by and/or and allows nested quotes of another kind eg "there's an apostrophe"
		let rawSequences = this.findQuoted(searchTextLower);

		let searchTextWithPlaceholders = searchTextLower;
		// replace phrases with __#__ placeholder
		rawSequences.forEach((phrase, index) => {
			searchTextWithPlaceholders = searchTextWithPlaceholders.replace(phrase, `__${index}__`);
		});

		// replace and/or with ' AND ' ' OR ' as required for solr search, one space is required
		searchTextWithPlaceholders = searchTextWithPlaceholders.replace(/(\s+)and(\s+)/g, ` AND `);
		searchTextWithPlaceholders = searchTextWithPlaceholders.replace(/(\s+)or(\s+)/g, ` OR `);

		// find unquoted words after replacing and/or
		// combine all terms to return for snippet highlighting
		const termsArray = this.findLowerCaseWordsOrAcronyms(searchTextWithPlaceholders);

		let queryText = '';
		rawSequences = rawSequences
			.map((phrase) => '(' + phrase.replace(/\"/g, '').split(' ').join(' & ') + ')')
			.join(' | ');

		queryText = [rawSequences].concat(termsArray).filter((term) => term !== '');
		queryText = queryText.join(' | ');

		return queryText;
	}

	findQuoted(searchText) {
		// finds quoted phrases separated by and/or and allows nested quotes of another kind eg "there's an apostrophe"
		return searchText.match(/(?!\s*(and|or))(?<words>(?<quote>['"]).*?\k<quote>)/g) || [];
	}

	findLowerCaseWordsOrAcronyms(searchText) {
		// finds lower case words, acronyms with . and with digits eg c2 or a.i.
		return searchText.match(/\b([a-z\d\.])+(\b|)/g) || [];
	}

	convertPhraseToSequence(phrase) {
		// force double quotes then
		// let json parser escape nested quotes
		// and then read back
		return JSON.parse(JSON.stringify(`"${phrase.slice(1, -1)}"`));
	}

	getElasticsearchQueryForGraphCache({ limit = 1000, _offset = 0, searchAfter = null }, user) {
		try {
			const query = {
				_source: false,
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
				],
				track_total_hits: true,
				size: limit,
				query: {
					match_all: {},
				},
				sort: [{ id: 'asc' }],
			};

			if (searchAfter) {
				query.search_after = searchAfter;
			}

			return query;
		} catch (err) {
			this.logger.error(err, '2OQQD7Ddd', user);
		}
	}

	// helper for getElasticsearchQuery
	getSearchFieldsWildcardQueries(searchFields) {
		const mustQueries = [];
		for (const key in searchFields) {
			const searchField = searchFields[key];
			if (searchField.field && searchField.field.name && searchField.input && searchField.input.length !== 0) {
				const wildcard = { query_string: { query: `${searchField.field.name}:*${searchField.input}*` } };

				mustQueries.push(wildcard);
			}
		}
		return mustQueries;
	}

	// helper for getElasticsearchQuery
	setQuerySort(sort, order, query) {
		switch (sort) {
			case 'Relevance':
				query.sort = [{ _score: { order: order } }];
				break;
			case 'Publishing Date':
				query.sort = [{ publication_date_dt: { order: order } }];
				break;
			case 'Alphabetical':
				query.sort = [{ display_title_s: { order: order } }];
				break;
			case 'Popular':
				query.sort = [{ pop_score: { order: order } }];
				break;
			case 'References':
				query.sort = [
					{
						_script: {
							type: 'number',
							script: 'doc.ref_list.size()',
							order: order,
						},
					},
				];
				break;
			default:
				break;
		}
	}

	// helper for getElasticsearchQuery
	setQueryMainSearchText(searchText, mainKeywords, query, analyzer) {
		if (!this.isVerbatim(searchText) && mainKeywords.length > 2) {
			const titleMainSearch = {
				query_string: {
					fields: ['display_title_s.search'],
					query: `*${mainKeywords}*`,
					type: 'best_fields',
					boost: 10,
					analyzer,
				},
			};
			query.query.bool.should = query.query.bool.should.concat(titleMainSearch);
		}
	}

	// helper for getElasticsearchQuery
	setQueryExtSearchFields(extSearchFields, searchText, query) {
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
	}

	// helper for getElasticsearchQuery
	setQueryPubDate(publicationDateAllTime, publicationDateFilter, query) {
		if (
			this.constants.GAME_CHANGER_OPTS.allow_daterange &&
			!publicationDateAllTime &&
			publicationDateFilter[0] &&
			publicationDateFilter[1]
		) {
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

	// helper for getElasticsearchQuery
	setQueryCancelledDocs(includeRevoked, query) {
		if (!includeRevoked) {
			// if includeRevoked, get return cancelled docs
			query.query.bool.filter.push({
				term: {
					is_revoked_b: 'false',
				},
			});
		}
	}

	// helper for getElasticsearchQuery
	setQuerySelectedDocs(selectedDocuments, query) {
		if (selectedDocuments?.length > 0) {
			// filter selected documents
			query.query.bool.filter.push({
				terms: {
					filename: selectedDocuments,
				},
			});
		}
	}

	// helper for getElasticsearchQuery
	setQueryOrgFilter(orgFilterString, query) {
		if (orgFilterString.length > 0) {
			query.query.bool.filter.push({
				terms: {
					display_org_s: orgFilterString,
				},
			});
		}
	}

	// helper for getElasticsearchQuery
	setQueryTypeFilter(typeFilterString, query) {
		if (typeFilterString.length > 0) {
			query.query.bool.filter.push({
				terms: {
					display_doc_type_s: typeFilterString,
				},
			});
		}
	}

	// helper for getElasticsearchQuery
	setQueryRescore(parsedQuery, query) {
		query.rescore = [
			{
				window_size: 50,
				query: {
					rescore_query: {
						sltr: {
							params: { keywords: `${parsedQuery}` },
							model: 'ltr_model',
						},
					},
				},
			},
			{
				window_size: 500,
				query: {
					rescore_query: {
						bool: {
							must: [
								{
									rank_feature: {
										field: 'pagerank_r',
										boost: 10,
									},
								},
							],
						},
					},
					query_weight: 0.7,
					rescore_query_weight: 2,
				},
			},
		];
	}

	// helper for getElasticsearchQuery
	setQuerySearchAfter(search_before, search_after, order, query) {
		if (search_before.length > 0) {
			order = order === 'desc' ? 'asc' : 'desc';
		}
		if (query.sort[0]) {
			query.sort[0][Object.keys(query.sort[0])[0]].order = order;
		}
		query.sort.push({ _id: order });
		// add search_after
		if (search_before.length > 0) {
			query.search_after = search_before;
		} else if (search_after.length > 0) {
			query.search_after = search_after;
		}
	}

	getElasticsearchQuery(
		{
			searchText,
			_searchTerms,
			parsedQuery,
			orgFilterString = '',
			typeFilterString = '',
			_index,
			offset = 0,
			limit = 20,
			_format = 'json',
			_getIdList = false,
			_expandTerms = false,
			isClone = false,
			_cloneData = {},
			charsPadding = 90,
			operator = 'and',
			searchFields = {},
			mainMaxkeywords = 3,
			_accessDateFilter = [],
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
				'download_url_s',
				'source_page_url_s',
				'source_fqdn_s',
				'topics_s',
				'top_entities_t',
			],
			extStoredFields = [],
			extSearchFields = [],
			includeRevoked = false,
			sort = 'Relevance',
			order = 'desc',
			includeHighlights = true,
			docIds = {},
			selectedDocuments,
			ltr = false,
			paragraphLimit = 100,
			hasHighlights = true,
			search_after = [],
			search_before = [],
		},
		user
	) {
		try {
			// add additional search fields to the query
			const mustQueries = this.getSearchFieldsWildcardQueries(searchFields);

			storedFields = [...storedFields, ...extStoredFields];
			const default_field = this.isVerbatim(searchText)
				? 'paragraphs.par_raw_text_t'
				: 'paragraphs.par_raw_text_t.gc_english';
			const analyzer = this.isVerbatim(searchText) ? 'standard' : 'gc_english';
			const plainQuery = this.isVerbatim(searchText) ? parsedQuery.replace(/["']/g, '') : parsedQuery;
			let mainKeywords = this.remove_stopwords(plainQuery)
				.replace(/["']/gi, '')
				.replace(/ OR | AND /gi, ' ')
				.split(' ')
				.slice(0, mainMaxkeywords)
				.join('* AND *');
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
							field: 'display_doc_type_s',
							size: 10000,
						},
					},
					doc_org_aggs: {
						terms: {
							field: 'display_org_s',
							size: 10000,
						},
					},
				},
				track_total_hits: true,
				query: {
					bool: {
						must: [],
						should: [
							{
								nested: {
									path: 'paragraphs',
									inner_hits: {
										_source: false,
										stored_fields: ['paragraphs.page_num_i', 'paragraphs.par_raw_text_t'],
										from: 0,
										size: paragraphLimit,
										highlight: hasHighlights
											? {
													fields: {
														'paragraphs.par_raw_text_t': {
															fragment_size: 3 * charsPadding,
															number_of_fragments: 1,
															type: 'plain',
														},
														'paragraphs.par_raw_text_t.gc_english': {
															fragment_size: 3 * charsPadding,
															number_of_fragments: 1,
															type: 'plain',
														},
													},
													fragmenter: 'span',
											  }
											: {},
									},
									query: {
										bool: {
											should: [
												{
													query_string: {
														query: `${parsedQuery}`,
														default_field,
														default_operator: `${operator}`,
														fuzzy_max_expansions: 100,
														fuzziness: 'AUTO',
														analyzer,
														boost: 0.5,
													},
												},
											],
										},
									},
									score_mode: 'sum',
								},
							},
							{
								wildcard: {
									keyw_5: {
										value: `*${plainQuery}*`,
										boost: 5,
									},
								},
							},
							{
								wildcard: {
									'display_title_s.search': {
										value: `*${plainQuery}*`,
										boost: 15,
										case_insensitive: true,
									},
								},
							},
							{
								wildcard: {
									'filename.search': {
										value: `*${plainQuery}*`,
										boost: 10,
										case_insensitive: true,
									},
								},
							},
							{
								wildcard: {
									'display_source_s.search': {
										value: `*${plainQuery}*`,
										boost: 4,
									},
								},
							},
							{
								wildcard: {
									'top_entities_t.search': {
										value: `*${plainQuery}*`,
										boost: 5,
									},
								},
							},
							{
								match_phrase: {
									'display_title_s.search': plainQuery,
								},
							},
						],
						minimum_should_match: 1,

						filter: [],
					},
				},
				highlight: hasHighlights
					? {
							require_field_match: false,
							fields: {
								'display_title_s.search': {},
								keyw_5: {},
								'filename.search': {},
								'display_source_s.search': {},
								top_entities_t: {},
								topics_s: {},
							},
							fragment_size: 10,
							fragmenter: 'simple',
							type: 'unified',
							boundary_scanner: 'word',
					  }
					: {},
			};

			this.setQuerySort(sort, order, query);
			this.setQueryMainSearchText(searchText, mainKeywords, query, analyzer);
			this.setQueryExtSearchFields(extSearchFields, searchText, query);
			this.setQueryPubDate(publicationDateAllTime, publicationDateFilter, query);

			if (!isClone) {
				this.setQueryCancelledDocs(includeRevoked, query);
				this.setQuerySelectedDocs(selectedDocuments, query);
				this.setQueryOrgFilter(orgFilterString, query);
				this.setQueryTypeFilter(typeFilterString, query);
			}

			if (mustQueries.length > 0) {
				query.query.bool.must = query.query.bool.must.concat(mustQueries);
			}

			if (!includeHighlights) {
				delete query.query.bool.should[0].nested.inner_hits;
				delete query.highlight;
			}

			if (Object.keys(docIds).length !== 0) {
				query.query.bool.filter.push({ terms: { id: docIds } });
			}

			if (ltr && sort === 'Relevance') {
				this.setQueryRescore(parsedQuery, query);
			} else {
				this.setQuerySearchAfter(search_before, search_after, order, query);
			}

			return query;
		} catch (err) {
			this.logger.error(err, '2OQQD7D', user);
		}
	}

	isVerbatim(searchText, suggest = false) {
		let verbatim = false;
		if (!suggest) {
			if (
				(searchText.startsWith('"') && searchText.endsWith('"')) ||
				(searchText.startsWith(`'`) && searchText.endsWith(`'`))
			) {
				verbatim = true;
			}
		} else {
			if (searchText.startsWith('"') || searchText.startsWith(`'`)) {
				verbatim = true;
			}
		}

		return verbatim;
	}

	async getTitle(parsedQuery, clientObj, userId) {
		// get contents of single document searching by doc display title
		try {
			let results = {};
			let { esClientName, esIndex } = clientObj;
			let titleQuery = {
				size: 1,
				query: {
					bool: {
						must: [
							{
								match_phrase: {
									display_title_s: `${parsedQuery}`,
								},
							},
						],
					},
				},
			};
			results = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, titleQuery, userId);
			return results;
		} catch (err) {
			this.logger.error(err, 'TJKBNOF', userId);
		}
	}

	getESQueryUsingOneID(id, user, limit = 100, maxLength = 200) {
		try {
			return {
				_source: {
					includes: ['pagerank_r', 'kw_doc_score_r', 'pagerank', 'topics_s'],
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
					'topics_s',
				],
				track_total_hits: true,
				size: limit,
				query: {
					bool: {
						should: {
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
												fragment_size: maxLength,
												number_of_fragments: 1,
											},
										},
										fragmenter: 'span',
									},
								},
								query: {
									bool: {
										must: [
											{
												terms: {
													'paragraphs.id': [id],
												},
											},
										],
										should: [
											{
												wildcard: {
													'paragraphs.filename.search': {
														value: id + '*',
														boost: 15,
													},
												},
											},
										],
									},
								},
							},
						},
					},
				},
			};
		} catch (err) {
			this.logger.error(err, 'TA9GH5F', user);
		}
	}

	getESQueryOneDoc(id, userId) {
		// get contents of single document searching by doc id
		try {
			return {
				size: 1,
				query: {
					match: {
						id: id,
					},
				},
			};
		} catch (err) {
			this.logger.error(err, 'TJKFH5F', userId);
		}
	}

	makeAliasesQuery(searchTextList, entityLimit) {
		try {
			// make alias queries for each word
			const mustQueries = [];

			for (const word of searchTextList) {
				const alias = {
					match: { 'aliases.name': word },
				};
				mustQueries.push(alias);
			}

			const aliasQuery = {
				nested: {
					path: 'aliases',
					query: {
						bool: {
							should: mustQueries,
						},
					},
				},
			};
			return {
				from: 0,
				size: entityLimit,
				query: {
					bool: {
						should: aliasQuery,
					},
				},
			};
		} catch (e) {
			this.logger.error(e, 'LQPRYTUOF', '');
		}
	}

	async findAliases(searchTextList, esClientName, entitiesIndex, user) {
		let matchingAlias = {};
		try {
			let entityLimit = 5;
			let aliasQuery = this.makeAliasesQuery(searchTextList, entityLimit);
			let aliasResults = await this.dataLibrary.queryElasticSearch(esClientName, entitiesIndex, aliasQuery, user);
			if (aliasResults.body.hits.hits[0]) {
				let aliases = aliasResults.body.hits.hits[0]._source.aliases.map((item) => item.name);
				for (let alias of aliases) {
					if (alias.split(/\s+/).length === 1 && alias === alias.toUpperCase()) {
						matchingAlias = aliasResults.body.hits.hits[0];
						matchingAlias.match = alias;
						break;
					}
				}
			}
			return matchingAlias;
		} catch (e) {
			this.logger.error(e, 'MBWYH5F', user);
		}
	}

	getESSuggesterQuery({
		searchText,
		field = 'paragraphs.par_raw_text_t',
		sort = 'frequency',
		suggest_mode = 'popular',
	}) {
		// multi search in ES
		const plainQuery = this.isVerbatim(searchText, true) ? searchText.replace(/["']/g, '') : searchText;

		return {
			suggest: {
				suggester: {
					text: plainQuery,
					term: {
						field: field,
						sort: sort,
						suggest_mode: suggest_mode,
					},
				},
			},
		};
	}
	getSearchCountQuery(daysBack, filterWords) {
		return {
			size: 1,
			query: {
				bool: {
					must_not: [
						{
							terms: {
								search_query: filterWords,
							},
						},
					],
					must: [
						{
							range: {
								run_time: {
									gte: `now-${daysBack}d/d`,
									lt: 'now/d',
								},
							},
						},
					],
				},
			},
			aggs: {
				searchTerms: {
					terms: {
						field: 'search_query',
						size: 1000,
					},
					aggs: {
						user: {
							terms: {
								field: 'user_id',
								size: 2,
							},
						},
					},
				},
			},
		};
	}

	async getSearchCount(daysBack, filterWords, userId, esClientName = 'gamechanger', maxSearches = 10) {
		// need to caps all search text for ID and Title since it's stored like that in ES
		const searchHistoryIndex = this.constants.GAME_CHANGER_OPTS.historyIndex;
		let searchCounts = [];
		let searches = [];
		try {
			const query = this.getSearchCountQuery(daysBack, filterWords);
			let results = await this.dataLibrary.queryElasticSearch(esClientName, searchHistoryIndex, query, userId);
			let aggs = results.body.aggregations.searchTerms.buckets;
			let maxCount = 0;
			if (aggs.length > 0) {
				aggs.forEach((term) => {
					let searchCount = {};
					let word = term.key.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
					searchCount['search'] = word;
					searchCount['count'] = term.doc_count;
					if (term.user.buckets.length > 1) {
						word = word.replace(/\s{2,}/g, ' ');
						if (!searches.includes(word) && maxCount < maxSearches) {
							searchCounts.push(searchCount);
							searches.push(word);
							maxCount += 1;
						}
					}
				});
			}
			return searchCounts;
		} catch (err) {
			this.logger.error(err.message, 'LAO1TT', userId);
		}

		return searchCounts;
	}
	getESpresearchMultiQuery({
		searchText,
		index,
		title = 'display_title_s',
		name = 'name',
		aliases = 'aliases',
		queryTypes = ['title', 'searchhistory', 'entities'],
	}) {
		const plainQuery = this.isVerbatim(searchText, true) ? searchText.replace(/["']/g, '') : searchText;
		// multi search in ES if text is more than 3
		if (searchText.length >= 3) {
			let query = [];
			let titleQuery = [
				{
					index: index,
				},
				{
					size: 4,
					_source: [title],
					query: {
						bool: {
							must: [
								{
									wildcard: {
										'display_title_s.search': {
											value: `*${plainQuery}*`,
											boost: 1.0,
											rewrite: 'constant_score',
										},
									},
								},
							],
							filter: [
								{
									term: {
										is_revoked_b: false,
									},
								},
							],
						},
					},
				},
			];
			if (title !== 'display_title_s') {
				delete titleQuery[1]['query']['bool']['must'][0]['wildcard']['display_title_s.search'];
				titleQuery[1]['query']['bool']['must'][0]['wildcard'][title] = {
					value: `*${plainQuery}*`,
					boost: 1.0,
					rewrite: 'constant_score',
				};
			}

			let searchHistoryQuery = [
				{
					index: this.constants.GAME_CHANGER_OPTS.historyIndex,
				},
				{
					size: 1,
					query: {
						prefix: {
							search_query: {
								value: `${plainQuery}`,
							},
						},
					},
					aggs: {
						search_query: {
							terms: {
								field: 'search_query',
								min_doc_count: 5,
							},
							aggs: {
								user: {
									terms: { field: 'user_id', size: 3 },
								},
							},
						},
					},
				},
			];
			let entitiesQuery = [
				{
					index: this.constants.GAME_CHANGER_OPTS.entityIndex,
				},
				{
					size: 2,
					_source: {
						includes: [name, aliases, 'entity_type'],
					},
					query: {
						prefix: {
							name: {
								value: `${plainQuery}`,
							},
						},
					},
				},
			];
			if (queryTypes.includes('title')) {
				query = query.concat(titleQuery);
			}
			if (queryTypes.includes('searchhistory')) {
				query = query.concat(searchHistoryQuery);
			}
			if (queryTypes.includes('entities')) {
				query = query.concat(entitiesQuery);
			}
			return query;
		} else {
			throw new Error('searchText required to construct query or not long enough');
		}
	}

	getESpresearchMultiQueryEDA({ searchText }) {
		const plainQuery = this.isVerbatim(searchText, true) ? searchText.replace(/["']/g, '') : searchText;
		// search in ES if text is more than 2
		if (searchText.length >= 2) {
			let query = [];
			let searchHistoryQuery = [
				{
					index: this.constants.GAME_CHANGER_OPTS.historyIndex,
				},
				{
					size: 8,
					query: {
						multi_match: {
							query: `${plainQuery}`,
							type: 'bool_prefix',
							fields: ['search_query', 'search_query._2gram', 'search_query._3gram'],
						},
					},
				},
			];
			query = query.concat(searchHistoryQuery);
			return query;
		} else {
			throw new Error('searchText required to construct query or not long enough');
		}
	}

	async autocorrect(text, index, userId) {
		try {
			const esQuery = this.getESSuggesterQuery({ searchText: text, index: index });
			let esClientName = 'gamechanger';

			const results = await this.dataLibrary.queryElasticSearch(
				esClientName,
				this.constants.GAME_CHANGER_OPTS.textSuggestIndex,
				esQuery,
				userId
			);
			let suggesterArray = results.body.suggest.suggester;
			const corrected = [];
			let hasCorrection = false;
			suggesterArray.forEach((suggestion) => {
				if (
					suggestion.options.length > 0 &&
					suggestion.options[0].score >= 0.7 &&
					suggestion.options[0].freq >= 100
				) {
					corrected.push(suggestion.options[0].text);
					hasCorrection = true;
				} else {
					corrected.push(suggestion.text);
				}
			});

			if (!hasCorrection) {
				return '';
			} else {
				return corrected.join(' ');
			}
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'PL2LLV', userId);
		}
	}

	cleanUpIdEsResultsForGraphCache(raw, user) {
		try {
			let results = {
				totalCount: raw.body.hits.total.value,
				docs: [],
			};
			raw.body.hits.hits.forEach((r) => {
				let result = this.transformEsFields(r.fields);

				result.pageHits = [];
				const pageSet = new Set();

				result.pageHits.sort((a, b) => a.pageNumber - b.pageNumber);
				result.pageHitCount = pageSet.size;
				if (Array.isArray(result['keyw_5'])) {
					result['keyw_5'] = result['keyw_5'].join(', ');
				} else {
					result['keyw_5'] = '';
				}
				if (!result.ref_list) {
					result.ref_list = [];
				}
				results.docs.push(result);
			});
			return results;
		} catch (err) {
			this.logger.error(err.message, 'VW8QE1Z', user);
		}
	}

	cleanUpEsResultsAddOneHitPerPage(pageSet, hits, user, result) {
		hits.forEach((parahit) => {
			const pageIndex = parahit.fields['paragraphs.page_num_i'][0];
			let pageNumber = pageIndex + 1;
			// one hit per page max
			if (!pageSet.has(pageNumber)) {
				const [snippet, usePageZero] = this.getESHighlightContent(parahit, user);
				// use page 0 for title matches or errors
				// but only allow 1
				if (usePageZero) {
					if (pageSet.has(0)) {
						return;
					} else {
						pageNumber = 0;
						pageSet.add(0);
					}
				}

				pageSet.add(pageNumber);
				result.pageHits.push({ snippet, pageNumber });
			}
		});
	}

	cleanUpEsResultsHandleHighlights(rawHit, result) {
		if (rawHit.highlight) {
			if (rawHit.highlight['display_title_s.search']) {
				result.pageHits.push({
					title: 'Title',
					snippet: rawHit.highlight['display_title_s.search'][0],
				});
			}
			if (rawHit.highlight.keyw_5) {
				result.pageHits.push({
					title: 'Keywords',
					snippet: this.highlight_keywords(result.keyw_5, rawHit.highlight.keyw_5),
				});
			}
			if (rawHit.highlight['filename.search']) {
				result.pageHits.push({
					title: 'Filename',
					snippet: rawHit.highlight['filename.search'][0],
				});
			}
			if (rawHit.highlight['display_source_s.search']) {
				result.pageHits.push({
					title: 'Source',
					snippet: rawHit.highlight['display_source_s.search'][0],
				});
			}
			if (rawHit.highlight.top_entities_t) {
				result.pageHits.push({
					title: 'Entities',
					snippet: this.highlight_keywords(result.top_entities_t, rawHit.highlight.top_entities_t),
				});
			}
			if (rawHit.highlight.topics_s) {
				result.pageHits.push({
					title: 'Topics',
					snippet: this.highlight_keywords(result.topics_s, rawHit.highlight.topics_s),
				});
			}
		}
	}

	cleanUpEsResultsHandleParagraphsScore(rawHit, result, paragraphResults) {
		rawHit.inner_hits.paragraphs.hits.hits.forEach((paragraph) => {
			let entities = [];
			Object.keys(paragraph._source.entities).forEach((entKey) => {
				entities = entities.concat(paragraph._source.entities[entKey]);
			});
			result.score += paragraphResults[paragraph._source.id].score;
			result.paragraphs.push({
				id: paragraph._source.id,
				par_raw_text_t: paragraph._source.par_raw_text_t,
				page_num_i: paragraph._source.page_num_i,
				entities: entities,
				score: paragraphResults[paragraph._source.id].score,
				transformTextMatch: paragraphResults[paragraph._source.id].text,
				paragraphIdBeingMatched: paragraphResults[paragraph._source.id].paragraphIdBeingMatched,
				score_display: paragraphResults[paragraph._source.id].score_display,
			});
		});
	}

	cleanUpEsResultsHandleInnerHits(rawHit, isCompareReturn, pageSet, user, result, paragraphResults) {
		if (rawHit.inner_hits) {
			if (rawHit.inner_hits.paragraphs && !isCompareReturn) {
				this.cleanUpEsResultsAddOneHitPerPage(pageSet, rawHit.inner_hits.paragraphs.hits.hits, user, result);
				result.pageHits.sort((a, b) => a.pageNumber - b.pageNumber);
				this.cleanUpEsResultsHandleHighlights(rawHit, result);
				result.pageHitCount = pageSet.size;
				result.matchCount = rawHit.inner_hits?.paragraphs?.hits?.total?.value;
			} else if (rawHit.inner_hits.paragraphs && isCompareReturn) {
				result.paragraphs = [];
				result.score = 0;
				this.cleanUpEsResultsHandleParagraphsScore(rawHit, result, paragraphResults);
				result.paragraphs.sort((a, b) => b.score - a.score);
				result.score /= result.paragraphs.length;
			} else {
				this.cleanUpEsResultsAddOneHitPerPage(pageSet, rawHit.inner_hits.pages.hits.hits, user, result);

				result.pageHits.sort((a, b) => a.pageNumber - b.pageNumber);
				this.cleanUpEsResultsHandleHighlights(rawHit, result);
				result.pageHitCount = pageSet.size;
			}
		}
	}

	cleanUpEsResultsHandleKeyW5(result) {
		if (Array.isArray(result['keyw_5'])) {
			result['keyw_5'] = result['keyw_5'].join(', ');
		} else {
			result['keyw_5'] = '';
		}
	}

	cleanUpEsResultsHandleEmptyRefList(result) {
		if (!result.ref_list) {
			result.ref_list = [];
		}
	}

	cleanUpEsResultsHandleSort(rawHit, result) {
		if (rawHit.sort) {
			result.sort = rawHit.sort;
		}
	}

	cleanUpEsResults({
		raw,
		searchTerms,
		user,
		selectedDocuments,
		expansionDict,
		index,
		query,
		isCompareReturn = false,
		paragraphResults = [],
	}) {
		if (!selectedDocuments) selectedDocuments = [];
		try {
			let results = {
				query,
				totalCount:
					selectedDocuments && selectedDocuments.length > 0
						? selectedDocuments.length
						: raw.body.hits.total.value,
				docs: [],
			};

			const { body = {} } = raw;
			const { aggregations = {} } = body;
			const { doc_type_aggs = {}, doc_org_aggs = {} } = aggregations;
			results.doc_types = doc_type_aggs.buckets || [];
			results.doc_orgs = doc_org_aggs.buckets || [];

			raw.body.hits.hits.forEach((r) => {
				let result = this.transformEsFields(r.fields);

				if (
					!selectedDocuments ||
					selectedDocuments.length === 0 ||
					selectedDocuments.indexOf(result.filename) !== -1
				) {
					result.pageHits = [];
					const pageSet = new Set();

					// handle r.inner_hits
					this.cleanUpEsResultsHandleInnerHits(r, isCompareReturn, pageSet, user, result, paragraphResults);

					result.esIndex = index;

					this.cleanUpEsResultsHandleKeyW5(result);
					this.cleanUpEsResultsHandleEmptyRefList(result);
					this.cleanUpEsResultsHandleSort(r, result);

					results.docs.push(result);
				}
			});

			results.searchTerms = searchTerms;
			results.expansionDict = expansionDict;

			if (isCompareReturn) {
				results.docs.sort((a, b) => b.score - a.score);
			}
			return results;
		} catch (err) {
			this.logger.error(err.message, 'GL7EDI3', user);
		}
	}

	highlight_keywords(all_words, highlights) {
		// purpose is to highlight words from the entire list.
		const resultHighlights = highlights.map(function (x) {
			return x.replace(/<em>/g, '').replace(`</em>`, '');
		});
		let all_words_str;
		if (all_words instanceof Array) {
			all_words_str = all_words.join(', ');
		} else {
			all_words_str = all_words;
		}
		for (let ind in resultHighlights) {
			const word = resultHighlights[ind];
			all_words_str = all_words_str.replace(word, `<em>` + word + `</em>`);
		}
		return all_words_str.split(', ');
	}

	cleanUpIdEsResults(raw, searchTerms, user, expansionDict) {
		try {
			if (
				!raw.body ||
				!raw.body.hits ||
				!raw.body.hits.total ||
				!raw.body.hits.total.value ||
				raw.body.hits.total.value === 0
			) {
				return { totalCount: 0, docIds: [], pubIds: [] };
			}

			let results = {};

			results.totalCount = raw.body.hits.total.value;
			results.docs = [];
			results.docIds = [];
			results.pubIds = [];

			raw.body.hits.hits.forEach((r) => {
				let result = this.transformEsFields(r.fields);
				results.docIds.push(result.id);
				if (results.pubIds.indexOf(`${result.doc_type} ${result.doc_num}`) === -1) {
					results.pubIds.push(`${result.doc_type} ${result.doc_num}`);
				}
				results.docs.push(result);
			});

			results.searchTerms = searchTerms;
			results.expansionDict = expansionDict;

			return results;
		} catch (err) {
			this.logger.error(err, 'BG9peM4', user);
		}
	}

	getESHighlightContentFieldTextFieldFilename(fieldTextArray, fieldFilenameArray2) {
		if (fieldTextArray.length > 0 && fieldTextArray[0]) {
			return [fieldTextArray[0], false];
		} else if (fieldFilenameArray2.length > 0 && fieldFilenameArray2[0]) {
			return [fieldFilenameArray2[0].replace(/.pdf/g, ''), true];
		} else {
			throw new Error('failed to highlight');
		}
	}

	getESHighlightContent(parahit, user) {
		try {
			const { highlight = {} } = parahit;
			const {
				'paragraphs.par_raw_text_t': highlightTextArray = [],
				'paragraphs.filename.search': fieldFilenameArray = [],
			} = highlight;
			const {
				'paragraphs.par_raw_text_t.gc_english': verbatimHighlightTextArray = [],
				'paragraphs.filename.search': verbatimFieldFilenameArray = [],
			} = highlight;

			// If not paragraphs then look at nested pages.
			const {
				'pages.p_raw_text': pageHighlightTextArray = [],
				'pages.filename.search': pageFieldFilenameArray = [],
			} = highlight;

			// if neither of these exist (sentence mode search), pull from fields
			const { fields = {} } = parahit;
			const {
				'paragraphs.par_raw_text_t': fieldTextArray = [],
				'paragraphs.filename': fieldFilenameArray2 = [],
			} = fields;

			if (highlightTextArray.length > 0 && highlightTextArray[0]) {
				return [highlightTextArray[0], false];
			} else if (fieldFilenameArray.length > 0 && fieldFilenameArray[0]) {
				return [fieldFilenameArray[0].replace(/.pdf/g, ''), true];
			} else if (verbatimHighlightTextArray.length > 0 && verbatimHighlightTextArray[0]) {
				return [verbatimHighlightTextArray[0], false];
			} else if (verbatimFieldFilenameArray.length > 0 && verbatimFieldFilenameArray[0]) {
				return [verbatimFieldFilenameArray[0].replace(/.pdf/g, ''), true];
			} else if (pageHighlightTextArray.length > 0 && pageHighlightTextArray[0]) {
				return [pageHighlightTextArray[0], false];
			} else if (pageFieldFilenameArray.length > 0 && pageFieldFilenameArray[0]) {
				return [pageFieldFilenameArray[0].replace(/.pdf/g, ''), true];
			}
			return this.getESHighlightContentFieldTextFieldFilename(fieldTextArray, fieldFilenameArray2);
		} catch (e) {
			this.logger.error(e, 'x983Nsiw', user);
			return ['Error highlighting', true];
		}
	}

	transformEsFields(raw) {
		let result = {};
		const arrayFields = [
			'keyw_5',
			'topics_s',
			'top_entities_t',
			'ref_list',
			'paragraphs',
			'entities',
			'abbreviations_n',
		];
		const edaArrayFields = [
			'pds_header_items_eda_ext_n',
			'pds_line_items_eda_ext_n',
			'syn_header_items_eda_ext_n',
			'syn_line_items_eda_ext_n',
		];
		for (let key in raw) {
			if (
				(raw[key] && raw[key][0]) ||
				Number.isInteger(raw[key]) ||
				(typeof raw[key] === 'object' && raw[key] !== null)
			) {
				if (arrayFields.includes(key) || edaArrayFields.includes(key)) {
					result[key] = raw[key];
				} else if (Array.isArray(raw[key])) {
					result[key] = raw[key][0];
				} else {
					result[key] = raw[key];
				}
			} else {
				result[key] = null;
			}
		}
		return result;
	}

	getSearchWikiQuery(searchTerm) {
		try {
			return {
				size: 5,
				query: {
					query_string: {
						query: searchTerm,
					},
				},
			};
		} catch (e) {
			this.logger.error(e, '17I8XO8');
		}
	}

	async documentSearchOneID(_req, body, clientObj, userId) {
		try {
			const { id = '', searchTerms = [], expansionDict = {}, limit = 20, maxLength = 200 } = body;

			const esQuery = this.getESQueryUsingOneID(id, userId, limit, maxLength);
			const { esClientName, esIndex } = clientObj;

			const esResults = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);

			if (this.checkValidResults(esResults)) {
				return this.cleanUpEsResults({
					raw: esResults,
					searchTerms,
					user: userId,
					selectedDocuments: null,
					expansionDict,
					index: esIndex,
					query: null,
				});
			} else {
				this.logger.error('Error with Elasticsearch results', 'RLNTXAR', userId);
				if (this.checkESResultsEmpty(esResults)) {
					this.logger.warn('Search has no hits');
				}
				return { totalCount: 0, docs: [] };
			}
		} catch (err) {
			const msg = err && err.message ? `${err.message}` : `${err}`;
			this.logger.error(msg, 'U1EIAR2', userId);
			throw msg;
		}
	}

	documentSearchHandleValidResults({
		titleResults,
		results,
		getIdList,
		searchTerms,
		userId,
		expansionDict,
		forGraphCache,
		selectedDocuments,
		esIndex,
		esQuery,
	}) {
		if (this.checkValidResults(titleResults)) {
			results = this.reorderFirst(results, titleResults);
		}
		if (getIdList) {
			return this.cleanUpIdEsResults(results, searchTerms, userId, expansionDict);
		}

		if (forGraphCache) {
			return this.cleanUpIdEsResultsForGraphCache(results, userId);
		} else {
			return this.cleanUpEsResults({
				raw: results,
				searchTerms,
				user: userId,
				selectedDocuments,
				expansionDict,
				index: esIndex,
				query: esQuery,
			});
		}
	}

	async documentSearch(_req, body, clientObj, userId) {
		try {
			const { getIdList, selectedDocuments, expansionDict = {}, forGraphCache = false } = body;
			const [parsedQuery, searchTerms] = this.getEsSearchTerms(body);
			body.searchTerms = searchTerms;
			body.parsedQuery = parsedQuery;
			let { esClientName, esIndex } = clientObj;
			let esQuery = '';
			if (esQuery === '') {
				if (forGraphCache) {
					esQuery = this.getElasticsearchQueryForGraphCache(body, userId);
				} else {
					esQuery = this.getElasticsearchQuery(body, userId);
				}
			}
			const titleResults = await this.getTitle(body.searchText, clientObj, userId);

			let results;

			results = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, JSON.stringify(esQuery), userId);
			if (this.checkValidResults(results)) {
				return this.documentSearchHandleValidResults({
					titleResults,
					results,
					getIdList,
					searchTerms,
					userId,
					expansionDict,
					forGraphCache,
					selectedDocuments,
					esIndex,
					esQuery,
				});
			} else {
				this.logger.error('Error with Elasticsearch results', 'MKZMJXD', userId);
				if (this.checkESResultsEmpty(results)) {
					this.logger.warn('Search has no hits');
				}

				return { totalCount: 0, docs: [], expansionDict: expansionDict ? expansionDict : {} };
			}
		} catch (e) {
			const { message } = e;
			this.logger.error(message, 'WBJNDK3', userId);
			throw e;
		}
	}

	checkValidResults(results) {
		return (
			results &&
			results.body &&
			results.body.hits &&
			results.body.hits.total &&
			results.body.hits.total.value &&
			results.body.hits.total.value > 0
		);
	}

	reorderFirst(results, titleResults) {
		// reorders a matching title result to the top of the results
		let reorderedHits = [];
		let firstResult = titleResults.body.hits.hits[0];
		let firstTitle = firstResult._source.display_title_s;
		let inResults = false;
		try {
			results.body.hits.hits.forEach((r) => {
				if (r.fields.display_title_s[0] !== firstTitle) {
					reorderedHits.push(r);
				} else {
					inResults = true;
					reorderedHits.unshift(r);
				}
			});
			if (inResults === true) {
				results.body.hits.hits = reorderedHits;
			}
			return results;
		} catch (e) {
			this.logger.error(e, 'JKJDFPOF', '');
		}
	}

	getEntityQuery(searchText, offset = 0, limit = 6) {
		try {
			return {
				from: offset,
				size: limit,
				query: {
					bool: {
						should: [
							{
								match_phrase: {
									name: {
										query: searchText,
										slop: 2,
										boost: 0.5,
									},
								},
							},
							{
								match_phrase: {
									'aliases.name': {
										query: searchText,
										slop: 2,
										boost: 0.5,
									},
								},
							},
							{
								multi_match: {
									fields: ['name', 'aliases.name'],
									query: searchText,
									type: 'phrase_prefix',
								},
							},
						],
						must_not: [{ term: { 'entity_type.keyword': 'topic' } }],
					},
				},
			};
		} catch (err) {
			this.logger.error(err, 'JAEIWMF', '');
		}
	}

	getTopicQuery(searchText, offset = 0, limit = 6) {
		try {
			return {
				from: offset,
				size: limit,
				query: {
					bool: {
						must: [{ match_phrase: { name: searchText } }],
						filter: [{ term: { 'entity_type.keyword': 'topic' } }],
					},
				},
			};
		} catch (err) {
			this.logger.error(err, 'YTP3YF0', '');
		}
	}

	getPopularDocsQuery(offset = 0, limit = 10) {
		try {
			return {
				_source: ['title', 'filename', 'pop_score', 'id'],
				from: offset,
				size: limit,
				query: {
					range: {
						pop_score: {
							gte: 10,
						},
					},
				},
				sort: [
					{
						pop_score: {
							order: 'desc',
						},
					},
				],
			};
		} catch (err) {
			this.logger.error(err, 'PTF390A', '');
		}
	}
	async getPopularDocs(userId, esIndex) {
		let popDocs = [];

		try {
			let popDocsQuery = this.getPopularDocsQuery();
			let esResults = await this.dataLibrary.queryElasticSearch('gamechanger', esIndex, popDocsQuery, userId);
			if (esResults) {
				esResults.body.hits.hits.forEach((r) => {
					let doc = {};
					doc.doc_filename = r['_source'].filename;
					doc.name = r['_source'].title;
					const path = require('path');
					doc.img_filename = path.parse(doc.doc_filename).name + '.png';
					doc.id = r['_source'].id;
					popDocs.push(doc);
				});
			}

			return popDocs;
		} catch (e) {
			this.logger.error(e.message, 'I9XQQA1F');
			return popDocs;
		}
	}

	getSourceQuery(searchText, _offset, _limit) {
		try {
			return {
				_source: {
					includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs'],
				},
				stored_fields: [
					'filename',
					'title',
					'page_count',
					'doc_type',
					'doc_num',
					'topics_s',
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
					'download_url_s',
					'source_page_url_s',
					'source_fqdn_s',
				],
				from: 0,
				size: 18,
				track_total_hits: true,
				query: {
					bool: {
						must: [],
						should: [
							{
								query_string: {
									query: searchText,
									default_field: 'crawler_used_s',
								},
							},
						],
						minimum_should_match: 1,
					},
				},
				highlight: {
					require_field_match: false,
					fields: {
						'title.search': {},
						keyw_5: {},
						id: {},
						'filename.search': {},
					},
					fragment_size: 10,
					fragmenter: 'simple',
					type: 'unified',
					boundary_scanner: 'word',
				},
				sort: [
					{
						_score: {
							order: 'desc',
						},
					},
				],
			};
		} catch (err) {
			this.logger.error(err, 'G3WEJ64', '');
		}
	}

	getOrgQuery() {
		return {
			_source: 'false',
			aggs: {
				display_org: {
					composite: {
						size: 100,
						sources: [
							{
								type: {
									terms: {
										field: 'display_org_s',
									},
								},
							},
						],
					},
					aggs: {
						revoke_filter: {
							filters: {
								filters: {
									query: {
										term: {
											is_revoked_b: 'false',
										},
									},
								},
							},
						},
					},
				},
			},
		};
	}

	getTypeQuery() {
		return {
			size: 0,
			aggs: {
				display_type: {
					composite: {
						size: 100,
						sources: [
							{
								type: {
									terms: {
										field: 'display_doc_type_s',
									},
								},
							},
						],
					},
				},
			},
		};
	}

	getDocMetadataQuery(meta, filenames) {
		let source = [];
		switch (meta) {
			case 'filenames':
				source = ['filename', 'display_title_s'];
				break;
			case 'all':
				source = [
					'filename',
					'display_title_s',
					'doc_type',
					'display_org_s',
					'display_doc_type_s',
					'topics_rs',
					'keyw_5',
				];
				break;
			default:
				source = [];
		}
		return {
			_source: source,
			size: filenames.length,
			query: {
				bool: {
					must: [
						{
							terms: {
								'filename.search': filenames,
							},
						},
					],
				},
			},
		};
	}

	getESClient(cloneName, permissions) {
		let esClientName = '';
		let esIndex = '';
		try {
			esIndex = [
				this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.index,
				this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.assist_index,
			];
		} catch (err) {
			this.logger.error(err, 'GE2ALRF', '');
			esIndex = 'gamechanger';
		}

		if (cloneName === 'eda') {
			if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')) {
				esClientName = 'eda';
				esIndex = this.constants.EDA_ELASTIC_SEARCH_OPTS.index;
			} else {
				throw new Error('Unauthorized');
			}
		} else {
			esClientName = 'gamechanger';
		}

		return { esClientName, esIndex };
	}

	checkESResultsEmpty(results) {
		return results && results.body && results.body.hits && results.body.hits.total.value == 0;
	}

	addNode(nodes, node, nodeIds, nodeProperties, labels) {
		nodes[node.id] = node;
		if (nodeIds.indexOf(node.id) === -1) {
			nodeIds.push(node.id);
			if (labels.indexOf(node.label) === -1) {
				labels.push(node.label);
				nodeProperties[node.label] = node.properties;
			}
		}
	}

	addEdge(edges, edge, edgeIds, relationships, relProperties) {
		try {
			edges[edge.id] = edge;
			if (edgeIds.indexOf(edge.id) === -1) {
				edgeIds.push(edge.id);
				if (relationships.indexOf(edge.label) === -1) {
					relationships.push(edge.label);
					relProperties[edge.label] = edge.properties;
				}
			}

			const tmpEdges = edgeIds.filter((edgeId) => {
				if (edges[edgeId].source === edge.source && edges[edgeId].target === edge.target) {
					return edgeId;
				}
			});

			const edgeCount = tmpEdges.length;
			const oddEdges = edgeCount % 2 !== 0;
			tmpEdges.forEach((edgeId, index) => {
				if (oddEdges && index === 0) {
					edges[edgeId].rotation = 0;
					edges[edgeId].curvature = 0;
				} else {
					edges[edgeId].rotation = Math.PI * (index / 6);
					edges[edgeId].curvature = (edgeCount / 10) * (index % 2 !== 0 ? -1 : 1);
				}
			});
		} catch (err) {
			console.log(edge);
		}
	}

	cleanNeo4jDataHandlePathRecType({
		nodes,
		v,
		isTest,
		user,
		nodeIds,
		nodeProperties,
		labels,
		edges,
		edgeIds,
		relationships,
		relProperties,
	}) {
		this.addNode(nodes, this.buildNodeVisObject(v.start, isTest, user), nodeIds, nodeProperties, labels);
		this.addNode(nodes, this.buildNodeVisObject(v.end, isTest, user), nodeIds, nodeProperties, labels);

		for (let obj of v.segments) {
			this.addNode(nodes, this.buildNodeVisObject(obj.start, isTest, user), nodeIds, nodeProperties, labels);
			this.addNode(nodes, this.buildNodeVisObject(obj.end, isTest, user), nodeIds, nodeProperties, labels);
			this.addEdge(
				edges,
				this.buildEdgeVisObject(obj.relationship, isTest, user),
				edgeIds,
				relationships,
				relProperties
			);
		}
	}

	cleanNeo4jDataHandleArrayRecType({
		v,
		isTest,
		nodes,
		user,
		nodeIds,
		nodeProperties,
		labels,
		edges,
		edgeIds,
		relationships,
		relProperties,
	}) {
		for (let obj of v) {
			const recTypeV = this.getNeo4jType(obj, isTest);
			if (recTypeV === 'Node') {
				this.addNode(nodes, this.buildNodeVisObject(obj, isTest, user), nodeIds, nodeProperties, labels);
			} else if (recTypeV === 'Relationship') {
				this.addEdge(edges, this.buildEdgeVisObject(obj, isTest, user), edgeIds, relationships, relProperties);
			}
		}
	}

	cleanNeo4jDataHandleRecType({
		recType,
		v,
		isTest,
		nodes,
		user,
		nodeIds,
		nodeProperties,
		labels,
		edges,
		edgeIds,
		relationships,
		relProperties,
	}) {
		if (recType === 'Node') {
			this.addNode(nodes, this.buildNodeVisObject(v, isTest, user), nodeIds, nodeProperties, labels);
		} else if (recType === 'Relationship') {
			this.addEdge(edges, this.buildEdgeVisObject(v, isTest, user), edgeIds, relationships, relProperties);
		} else if (recType === 'Path') {
			this.cleanNeo4jDataHandlePathRecType({
				nodes,
				v,
				isTest,
				user,
				nodeIds,
				nodeProperties,
				labels,
				edges,
				edgeIds,
				relationships,
				relProperties,
			});
		} else if (recType === 'Array') {
			this.cleanNeo4jDataHandleArrayRecType({
				v,
				isTest,
				nodes,
				user,
				nodeIds,
				nodeProperties,
				labels,
				edges,
				edgeIds,
				relationships,
				relProperties,
			});
		} else if (v !== null) {
			console.log(v);
		}
	}

	cleanNeo4jDataHandleRecords({
		result,
		isTest,
		user,
		nodes,
		nodeIds,
		nodeProperties,
		labels,
		graphMetaData,
		edges,
		edgeIds,
		relationships,
		relProperties,
		docIds,
	}) {
		result.records.forEach((record) => {
			const recObj = record.toObject();

			if (recObj.hasOwnProperty('entityScore')) {
				const node = this.buildNodeVisObject(recObj.node, isTest, user);
				node.entityScore = recObj.entityScore;
				node.mentions = recObj.mentions.low;
				this.addNode(nodes, node, nodeIds, nodeProperties, labels);
			} else if (recObj.hasOwnProperty('topicScore')) {
				const node = this.buildNodeVisObject(recObj.node, isTest, user);
				node.topicScore = recObj.topicScore;
				this.addNode(nodes, node, nodeIds, nodeProperties, labels);
			} else if (recObj.hasOwnProperty('doc_id')) {
				docIds.push({ doc_id: recObj.doc_id, mentions: recObj.mentions?.low });
			} else if (recObj.hasOwnProperty('primary_key')) {
				graphMetaData.push({
					label: recObj.label,
					property: recObj.property,
					type: recObj.type,
					primary_key: recObj.primary_key,
				});
			} else if (recObj.hasOwnProperty('relTypesCount')) {
				graphMetaData.push({
					relationship_counts: recObj.relTypesCount,
					node_counts: recObj.labels,
				});
			} else if (recObj.hasOwnProperty('topic')) {
				this.addNode(
					nodes,
					this.buildNodeVisObject(recObj.topic, isTest, user),
					nodeIds,
					nodeProperties,
					labels
				);
				nodeProperties.documentCountsForTopic = recObj.documentCountsForTopic;
			} else if (recObj.hasOwnProperty('topic_name')) {
				recObj.doc_count = recObj.doc_count.low;
				graphMetaData.push(recObj);
			} else if (recObj.hasOwnProperty('doc_count')) {
				graphMetaData.push({
					documents: recObj.doc_count.low,
				});
			} else {
				Object.values(recObj).map(async (v) => {
					const recType = this.getNeo4jType(v, isTest);
					this.cleanNeo4jDataHandleRecType({
						recType,
						v,
						isTest,
						nodes,
						user,
						nodeIds,
						nodeProperties,
						labels,
						edges,
						edgeIds,
						relationships,
						relProperties,
					});
				});
			}
		});
	}

	cleanNeo4jData(result, isTest, user) {
		const nodes = {};
		const nodeIds = [];
		const edgeIds = [];
		const edges = {};
		const labels = [];
		const nodeProperties = {};
		const relationships = [];
		const relProperties = {};
		const docIds = [];
		const graphMetaData = [];

		try {
			this.cleanNeo4jDataHandleRecords({
				result,
				isTest,
				user,
				nodes,
				nodeIds,
				nodeProperties,
				labels,
				graphMetaData,
				edges,
				edgeIds,
				relationships,
				relProperties,
				docIds,
			});

			if (docIds.length > 0) {
				return { doc_ids: docIds };
			} else if (graphMetaData.length > 0) {
				return { graph_metadata: graphMetaData };
			} else if (Object.keys(nodes).length <= 0 && result.records[0]) {
				const record = result.records[0].toObject();
				Object.keys(record).forEach((key) => {
					if (record[key].hasOwnProperty('low')) {
						record[key] = record[key].low;
					}
				});
				return { ...record };
			}

			const pr = require('pagerank.js');
			const rtnEdges = Object.values(edges);
			const rtnNodes = Object.values(nodes);
			const idToPRMap = {};

			pr.reset();

			rtnEdges.forEach((edge) => {
				pr.link(edge.source, edge.target, 1.0);
			});

			pr.rank(0.85, 0.000001, function (node, rank) {
				idToPRMap[node] = rank;
			});

			rtnNodes.forEach((node) => {
				node.pageRank = idToPRMap[node.id] || 0;
			});

			return {
				nodes: Object.values(nodes),
				edges: Object.values(edges),
				labels,
				relationships,
				nodeProperties,
				relProperties,
			};
		} catch (err) {
			this.logger.error(err, '193UPTH', user);
			return {
				nodes: Object.values(nodes),
				edges: Object.values(edges),
				labels,
				relationships,
				nodeProperties,
				relProperties,
			};
		}
	}

	buildNodeVisObject(neo4jNode, isTest, user) {
		let node = {};
		try {
			let label = neo4jNode.labels[0];

			node.id = !isTest ? neo4jNode.identity.toInt() : neo4jNode.identity.low;
			node.label = label;

			const title_properties = Object.keys(neo4jNode.properties);
			node.properties = [];

			for (const key of title_properties) {
				if (neo4jNode.properties.hasOwnProperty(key)) {
					if (!isTest && neo4jLib.isInt(neo4jNode.properties[key])) {
						node[key] = neo4jNode.properties[key].toNumber();
					} else if (isTest && neo4jNode.properties[key] && neo4jNode.properties[key].hasOwnProperty('low')) {
						node[key] = neo4jNode.properties[key].low;
					} else {
						node[key] = neo4jNode.properties[key];
					}
					node.properties.push(key);
				}
			}

			if (!node.hasOwnProperty('value')) node.value = 1;
		} catch (err) {
			this.logger.error(err, 'BSCU681', user);
		}

		return node;
	}

	buildEdgeVisObject(neo4jRel, isTest, user) {
		let edge = {};

		try {
			edge.id = !isTest ? neo4jRel.identity.toInt() : neo4jRel.identity.low;
			edge.source = !isTest ? neo4jRel.start.toInt() : neo4jRel.start.low;
			edge.target = !isTest ? neo4jRel.end.toInt() : neo4jRel.end.low;
			edge.label = neo4jRel.type;

			const title_properties = Object.keys(neo4jRel.properties);
			edge.properties = [];

			for (const key of title_properties) {
				if (neo4jRel.properties.hasOwnProperty(key)) {
					if (!isTest && neo4jLib.isInt(neo4jRel.properties[key])) {
						edge[key] = neo4jRel.properties[key].toNumber();
					} else if (isTest && neo4jRel.properties[key] && neo4jRel.properties[key].hasOwnProperty('low')) {
						edge[key] = neo4jRel.properties[key].low;
					} else {
						edge[key] = neo4jRel.properties[key];
					}
					edge.properties.push(key);
				}
			}

			if (!edge.hasOwnProperty('value')) edge.value = 1;
		} catch (err) {
			this.logger.error(err, 'UPKARU0', user);
		}

		return edge;
	}

	getNeo4jTypeIsTest(v) {
		const keys = Object.keys(v);
		if (keys.includes('identity') && keys.includes('labels') && keys.includes('properties')) return 'Node';
		else if (
			keys.includes('identity') &&
			keys.includes('start') &&
			keys.includes('end') &&
			keys.includes('type') &&
			keys.includes('properties')
		)
			return 'Relationship';
		else if (keys.includes('start') && keys.includes('end') && keys.includes('segments')) return 'Path';
		else if (v instanceof Array) return 'Array';
		else return '';
	}

	getNeo4jType(v, isTest) {
		if (v === null) return '';

		if (isTest) {
			return this.getNeo4jTypeIsTest(v);
		} else {
			if (v instanceof neo4jLib.types.Node) return 'Node';
			else if (v instanceof neo4jLib.types.Relationship) return 'Relationship';
			else if (v instanceof neo4jLib.types.Path) return 'Path';
			else if (v instanceof Array) return 'Array';
			else return '';
		}
	}

	getElasticsearchDocDataFromId({ docIds }, user) {
		try {
			return {
				_source: {
					includes: ['pagerank_r', 'kw_doc_score_r', 'pagerank'],
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
					'topics_s',
					'top_entities_t',
					'download_url_s',
					'source_page_url_s',
					'source_fqdn_s',
				],
				track_total_hits: true,
				size: 100,
				query: {
					bool: {
						must: {
							terms: { id: docIds },
						},
					},
				},
			};
		} catch (err) {
			this.logger.error(err, 'MEJL7W8', user);
		}
	}

	getDocumentParagraphsByParIDs(ids = [], filters = {}, offset = 0) {
		const query = {
			from: offset,
			size: 100,
			_source: {
				includes: ['pagerank_r', 'kw_doc_score_r'],
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
				'topics_s',
			],
			query: {
				bool: {
					must: [],
					filter: [],
					should: [
						{
							nested: {
								path: 'paragraphs',
								inner_hits: {
									_source: true,
									highlight: {
										fields: {
											'paragraphs.filename.search': {
												number_of_fragments: 0,
											},
											'paragraphs.par_raw_text_t': {
												fragment_size: 200,
												number_of_fragments: 1,
											},
										},
										fragmenter: 'span',
									},
								},
								query: {
									bool: {
										must: [
											{
												terms: {
													'paragraphs.id': ids,
												},
											},
										],
									},
								},
							},
						},
					],
				},
			},
		};

		if (filters?.orgFilters?.length > 0) {
			query.query.bool.filter.push({
				terms: {
					display_org_s: filters.orgFilters,
				},
			});
		}
		if (filters?.typeFilters?.length > 0) {
			query.query.bool.filter.push({
				terms: {
					display_doc_type_s: filters.typeFilters,
				},
			});
		}
		if (this.constants.GAME_CHANGER_OPTS.allow_daterange && filters?.dateFilter?.[0] && filters?.dateFilter?.[1]) {
			if (filters.dateFilter[0] && filters.dateFilter[1]) {
				query.query.bool.must.push({
					range: {
						publication_date_dt: {
							gte: filters.dateFilter[0].split('.')[0],
							lte: filters.dateFilter[1].split('.')[0],
						},
					},
				});
			}
		}
		if (!filters?.canceledDocs) {
			query.query.bool.filter.push({
				term: {
					is_revoked_b: 'false',
				},
			});
		}

		return query;
	}
}

module.exports = SearchUtility;
