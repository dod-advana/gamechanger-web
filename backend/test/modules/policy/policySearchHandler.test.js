const assert = require('assert');
const PolicySearchHandler = require('../../../node_app/modules/policy/policySearchHandler');
const { constructorOptionsMock, reqMock } = require('../../resources/testUtility');
const {
	createRecObjectExpected,
	enrichSearchResultsExpected,
	elasticSearchDocDataExpected } = require('./utils/policySearchHandlerJSON');
// all test cases used 'shark' as the searchtext. req ripped from a sample network call.
describe('PolicySearchHandler', function () {
	describe('#searchHelper', () => {
		it('should return single document from ES search', () => {
			const req = {body: {
				cloneName: 'gamechanger',
				searchText: 'shark',
				offset: 0,
				options: {
					searchType: 'Keyword',
					orgFilterString: [],
					transformResults: false,
					charsPadding: 90,
					typeFilterString: [],
					showTutorial: false,
					useGCCache: false,
					tiny_url: 'gamechanger?tiny=282',
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1}
			}};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {},
				dataTracker: {},
				mlApi: {},
				searchUtility: {
					isQuestion: () => {
						return false;
					}
				},
				redisDB: {
					select: () => 'OK'
				}
			};
			const target = new PolicySearchHandler(opts);

			target.gatherExpansionTerms = () => Promise.resolve({expansionTerms: []});
			target.doSearch = () => Promise.resolve({docs: ['test'], totalCount: 1});
			target.enrichSearchResults = () => Promise.resolve(enrichSearchResultsExpected);
			target.storeRecordOfSearchInPg = jest.fn(() => Promise.resolve());
			target.storeEsRecord = jest.fn(() => Promise.resolve());

			target.searchHelper(req, 'test', true).then(actual => {
				const expected = enrichSearchResultsExpected;
				assert.deepStrictEqual(actual, expected);
				expect(target.storeRecordOfSearchInPg).toHaveBeenCalled();
				expect(target.storeEsRecord).toHaveBeenCalled();				
			});
		});

		it('should not store history when requested', () => {
			const req = {body: {
				cloneName: 'gamechanger',
				searchText: 'shark',
				offset: 0,
				options: {
					searchType: 'Keyword',
					orgFilterString: [],
					transformResults: false,
					charsPadding: 90,
					typeFilterString: [],
					showTutorial: false,
					useGCCache: false,
					tiny_url: 'gamechanger?tiny=282',
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1}
			}};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {},
				dataTracker: {},
				mlApi: {},
				searchUtility: {
					isQuestion: () => {
						return false;
					}
				},
				redisDB: {
					select: () => 'OK'
				}
			};
			const target = new PolicySearchHandler(opts);

			target.gatherExpansionTerms = () => Promise.resolve({expansionTerms: []});
			target.doSearch = () => Promise.resolve({docs: ['test'], totalCount: 1});
			target.enrichSearchResults = () => Promise.resolve(enrichSearchResultsExpected);
			target.storeRecordOfSearchInPg = jest.fn(() => Promise.resolve());
			target.storeEsRecord = jest.fn(() => Promise.resolve());

			target.searchHelper(req, 'test', false).then(actual => {
				const expected = enrichSearchResultsExpected;
				assert.deepStrictEqual(actual, expected);
				expect(target.storeRecordOfSearchInPg).not.toHaveBeenCalled();
				expect(target.storeEsRecord).not.toHaveBeenCalled();
			});
		});
	});

	describe('#createRecObject', () => {
		it('it should return rec objects for search', () => {
			const req = {
				cloneName: 'gamechanger',
				searchText: 'shark',
				offset: 0,
				options: {
					searchType: 'Keyword',
					orgFilterString: [],
					transformResults: false,
					charsPadding: 90,
					typeFilterString: [],
					showTutorial: false,
					useGCCache: false,
					tiny_url: 'gamechanger?tiny=282',
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1}
			};

			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {
					putDocument: () => Promise.resolve()
				},
				dataTracker: {},
				mlApi: {},
				searchUtility: {}
			};
			const target = new PolicySearchHandler(opts);
			target.createRecObject(req, 'test', true).then(actual => {
				actual.historyRec.startTime = null;
				const expected = {'clientObj': {'esClientName': 'gamechanger', 'esIndex': 'Test'}, 'cloneSpecificObject': {'includeRevoked': undefined, 'orgFilterString': [], 'searchFields': []}, 'historyRec': {'cachedResult': false, 'clone_name': 'gamechanger', 'endTime': null, 'hadError': false, 'numResults': -1, 'orgFilters': '[]', 'request_body': {'cloneName': 'gamechanger', 'offset': 0, 'options': {'accessDateFilter': [null, null], 'charsPadding': 90, 'includeRevoked': false, 'limit': 6, 'orgFilterString': [], 'publicationDateAllTime': true, 'publicationDateFilter': [null, null], 'searchFields': {'initial': {'field': null, 'input': ''}}, 'searchType': 'Keyword', 'searchVersion': 1, 'showTutorial': false, 'tiny_url': 'gamechanger?tiny=282', 'transformResults': false, 'typeFilterString': [], 'useGCCache': false}, 'searchText': 'shark'}, 'search': '', 'searchText': 'shark', 'searchType': undefined, 'search_version': undefined, 'showTutorial': false, 'startTime': null, 'tiny_url': undefined, 'user_id': 'test'}};
				assert.deepStrictEqual(actual, expected);
			});
		});
	});

	// expansion part of the search

	// not tested because it's just a combination of a bunch of sub-functions
	// describe('#gatherExpansionTerms', () => {
	// 	it('should combine all expansion terms correctly', async () => {
	// 		const req = {
	// 			cloneName: 'gamechanger',
	// 			searchText: 'shark',
	// 			offset: 0,
	// 			options: {
	// 				searchType: 'Keyword',
	// 				orgFilterString: [],
	// 				transformResults: false,
	// 				charsPadding: 90,
	// 				typeFilterString: [],
	// 				showTutorial: false,
	// 				useGCCache: false,
	// 				tiny_url: 'gamechanger?tiny=282',
	// 				searchFields: {initial: {field: null, input: ''}},
	// 				accessDateFilter: [null, null],
	// 				publicationDateFilter: [null, null],
	// 				publicationDateAllTime: true,
	// 				includeRevoked: false,
	// 				limit: 6,
	// 				searchVersion: 1}
	// 		};
	// 		const opts = {
	// 			...constructorOptionsMock,
	// 			constants: {
	// 				GAME_CHANGER_OPTS: {downloadLimit: 1000},
	// 				GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
	// 			},
	// 			dataLibrary: {},
	// 			mlApi: {
	// 				getExpandedSearchTerms: (termsArray, userId) => { return Promise.resolve({ qexp: {shark: [ '"killer whale"', '"whale boat"' ] }, wordsim: ["fish"]}); }
	// 			},
	// 			searchUtility: {
	// 				getEsSearchTerms: () => ['parsedQuery', ['terms', 'array']],
	// 				combineExpansionTerms: () => ({ qexp: {shark: [ '"killer whale"', '"whale boat"' ] }, wordsim: ["fish"] })
	// 			}
	// 		};
	// 		const target = new PolicySearchHandler(opts);
	// 		target.mlApiExpansion = () => Promise.resolve({});
	// 		target.thesaurusExpansion = () => {return {synonyms: undefined, text: 'shark'}};
	// 		target.abbreviationCleaner = () => Promise.resolve({synonyms: undefined, text: 'shark'});

	// 		const actual = await target.gatherExpansionTerms(req, 'test');
	// 		const expected = { qexp: {shark: [ '"killer whale"', '"whale boat"' ] }, wordsim: ["fish"]};
	// 		assert.deepStrictEqual(actual, expected);
	// 	});
	// });

	describe('#mlApiExpansion', () => {
		it('it should give expansion', async () => {
			const req = {
				cloneName: 'gamechanger',
				searchText: 'shark',
				offset: 0,
				options: {
					searchType: 'Keyword',
					orgFilterString: [],
					transformResults: false,
					charsPadding: 90,
					typeFilterString: [],
					showTutorial: false,
					useGCCache: false,
					tiny_url: 'gamechanger?tiny=282',
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1}
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {},
				mlApi: {
					getExpandedSearchTerms: (termsArray, userId) => { return Promise.resolve({ shark: [ '"killer whale"', '"whale boat"' ] }); }
				}
			};
			const target = new PolicySearchHandler(opts);
			const [parsedQuery, termsArray] = target.searchUtility.getEsSearchTerms({searchText: req.searchText});
			const actual = await target.mlApiExpansion(termsArray, false, 'test');
			const expected = { shark: [ '"killer whale"', '"whale boat"' ] };
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#thesaurusExpansion', () => {
		it('should return synonyms and text', async () => {
			const req = {
				cloneName: 'gamechanger',
				searchText: 'shark',
				offset: 0,
				options: {
					searchType: 'Keyword',
					orgFilterString: [],
					transformResults: false,
					charsPadding: 90,
					typeFilterString: [],
					showTutorial: false,
					useGCCache: false,
					tiny_url: 'gamechanger?tiny=282',
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1}
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {},
				mlApi: {
					getExpandedSearchTerms: (termsArray, userId) => { return Promise.resolve({ qexp: {shark: [ '"killer whale"', '"whale boat"' ] }, wordsim: ["fish"]}); }
				},
				thesaurus: {
					lookup: () => {}
				}
			};
			const target = new PolicySearchHandler(opts);

			const [parsedQuery, termsArray] = target.searchUtility.getEsSearchTerms({searchText: req.searchText});
			const actual = target.thesaurusExpansion(req.searchText, termsArray);
			const expected = [[], 'shark'];
			assert.deepStrictEqual(actual, expected);
		});
	});
	describe('#abbreviationCleaner', () => {
		it('should return abbreviations', async () => {
			const req = {
				cloneName: 'gamechanger',
				searchText: 'shark',
				offset: 0,
				options: {
					searchType: 'Keyword',
					orgFilterString: [],
					transformResults: false,
					charsPadding: 90,
					typeFilterString: [],
					showTutorial: false,
					useGCCache: false,
					tiny_url: 'gamechanger?tiny=282',
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1}
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {},
				mlApi: {},
				dataTracker: {},
			};
			const target = new PolicySearchHandler(opts);
			const [parsedQuery, termsArray] = target.searchUtility.getEsSearchTerms({searchText: req.searchText});
			const actual = await target.abbreviationCleaner(termsArray);
			const expected = []; // maybe need a better test case for abbreviationCleaner; but also unsure because redisAsyncClient
			assert.deepStrictEqual(actual, expected);
		});
	});

	// searchHelper parts
	describe('#doSearch', () => {
		it('should do the search and return SearchResults', async () => {
			const req = {body: {
				cloneName: 'gamechanger',
				searchText: 'shark',
				offset: 0,
				options: {
					searchType: 'Keyword',
					orgFilterString: [],
					transformResults: false,
					charsPadding: 90,
					typeFilterString: [],
					showTutorial: false,
					useGCCache: false,
					tiny_url: 'gamechanger?tiny=282',
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1}
			}};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {},
				dataTracker: {
					crawlerDateHelper: (input, userId) => Promise.resolve(input)
				},
				mlApi: {},
				searchUtility: {
					// combinedSearchHandler: () => Promise.resolve({docs: ['test doc'], totalCount: 1}),
					documentSearch: () => Promise.resolve({docs: ['test doc'], totalCount: 1}),
				},
				async_redis: {select() {}},
				app_settings: {findOrCreate() {return Promise.resolve([])}}
			};
			const target = new PolicySearchHandler(opts);
			const actual = await target.doSearch(req, {expansionDict: []}, {clientObj: 'client'}, 'test');
			const expected = {docs: ['test doc'], totalCount: 1};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#enrichSearchResults', () => {
		it('should return enriched SearchResults', async () => {
			const req = {body: {
				cloneName: 'gamechanger',
				searchText: 'shark',
				offset: 0,
				options: {
					searchType: 'Keyword',
					orgFilterString: [],
					transformResults: false,
					charsPadding: 90,
					typeFilterString: [],
					showTutorial: false,
					useGCCache: false,
					tiny_url: 'gamechanger?tiny=282',
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1}
			}};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {},
				mlApi: {},
				searchUtility: {
					intelligentSearchHandler: () => {
						return Promise.resolve([]);
					},
					getSentResults() {
						return Promise.resolve([]);
					}
				},
				dataTracker: {},
				async_redis: {},
				app_settings: {
					findOrCreate() {
						return Promise.resolve([]);
					}
				}
			};
			const target = new PolicySearchHandler(opts);
			const actual = await target.enrichSearchResults(req, {}, 'test', 'test');
			const expected = {'entities': [], 'intelligentSearch': {}, 'qaResults': {'answers': [], 'params': {}, 'qaContext': [], 'question': ''}, 'topics': [], 'totalEntities': 0, 'totalTopics': 0, 'sentenceResults': []};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#qaEnrichment', () => {
		it('should return QA results', async () => {
			const req = {body: {
				cloneName: 'gamechanger',
				searchText: 'what is this',
				offset: 0,
				options: {
					searchType: 'Keyword',
					orgFilterString: [],
					transformResults: false,
					charsPadding: 90,
					typeFilterString: [],
					showTutorial: false,
					useGCCache: false,
					tiny_url: 'gamechanger?tiny=282',
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1}
			},
			permissions: ['Gamechanger Admin', 'Webapp Super Admin']
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {
					queryElasticSearch: () => Promise.resolve()
				},
				dataTracker: {
					crawlerDateHelper: (input, userId) => Promise.resolve(input)
				},
				mlApi: {
					getIntelAnswer: () => Promise.resolve({answers: ['this is a test']})
				},
				searchUtility: {
					phraseQAQuery() {
						return Promise.resolve();
					},
					phraseQAEntityQuery() {
						return Promise.resolve();
					},
					getQAContext() {
						return Promise.resolve([{name: 'test object'}]);
					},
					filterQAResults() {
						return Promise.resolve({question: 'what is this', answers: ['this is a test']});
					}
				},
				app_settings: {
					findOrCreate() {
						return Promise.resolve([]);
					}
				}
			};
			const target = new PolicySearchHandler(opts);
			const actual = await target.qaEnrichment(req, {}, 'test');
			const expected = {'answers': [], 'params': 'test', 'qaContext': [], 'question': ''};
			assert.deepStrictEqual(actual, expected);
		});
	});
	describe('#entitySearch', () => {
		it('should return entity search results', () => {
			const req = {
				cloneName: 'gamechanger',
				searchText: 'shark',
				offset: 0,
				options: {
					searchType: 'Keyword',
					orgFilterString: [],
					transformResults: false,
					charsPadding: 90,
					typeFilterString: [],
					showTutorial: false,
					useGCCache: false,
					tiny_url: 'gamechanger?tiny=282',
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1}
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {
					queryElasticSearch: () => { return Promise.resolve({body: {hits: {hits: [{_source: {name: 'test'}}], total: {value: 1}}}}); },
					queryGraph: () => { return Promise.resolve({result: {}}); },
				},
				mlApi: {},
				searchUtility: {
					getEntityQuery: () => { return Promise.resolve(); },
					cleanNeo4jData: () => { return {graph_metadata: 'data'}; }
				}
			};
			const target = new PolicySearchHandler(opts);
			target.entitySearch('shark', 0, 6, 'test').then(actual => {
				const expected = {'entities': [{'name': 'test', 'type': 'organization'}], 'totalEntities': 1};
				assert.deepStrictEqual(actual, expected);
			});
		});
	});
	describe('#topicSearch', () => {
		it('should return topic search results', async () => {
			const req = {
				cloneName: 'gamechanger',
				searchText: 'shark',
				offset: 0,
				options: {
					searchType: 'Keyword',
					orgFilterString: [],
					transformResults: false,
					charsPadding: 90,
					typeFilterString: [],
					showTutorial: false,
					useGCCache: false,
					tiny_url: 'gamechanger?tiny=282',
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1}
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {
					queryElasticSearch: () => { return Promise.resolve({body: {hits: {hits: [{_source: {name: 'test'}}], total: {value: 1}}}}); },
					queryGraph: () => { return Promise.resolve({result: {}}); },
				},
				mlApi: {},
				searchUtility: {
					getTopicQuery: () => { return Promise.resolve(); },
					cleanNeo4jData: () => { return {graph_metadata: 'data'}; }
				}
			};
			const target = new PolicySearchHandler(opts);
			const actual = await target.topicSearch('shark', 0, 6, 'test');
			const expected = {'topics': [{'documentCount': 'data', 'name': 'test', 'relatedTopics': 'data', 'type': 'topic'}], 'totalTopics': 1};
			assert.deepStrictEqual(actual, expected);
		});
	});

	// ES helper stuff
	describe('#getSingleDocumentFromESHelper', () => {
		it('should return single document from ES search', () => {
			const req = {body: {
				cloneName: 'gamechanger',
				searchText: 'shark',
				offset: 0,
				options: {
					searchType: 'Keyword',
					orgFilterString: [],
					transformResults: false,
					charsPadding: 90,
					typeFilterString: [],
					showTutorial: false,
					useGCCache: false,
					tiny_url: 'gamechanger?tiny=282',
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1}
			}};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {
					queryElasticSearch: () => Promise.resolve(
						{
							body:
              {
              	hits: {
              		name: 'test-obj',
              		total: {value: 1}
              	},
              }
						})
				},
				dataTracker: {
					crawlerDateHelper: (input, userId) => Promise.resolve(input)
				},
				mlApi: {},
				searchUtility: {
					getESClient: () => ({esClientName: 'test-client', esIndex: 'test-index'}),
					cleanUpEsResults: () => ({ totalCount: 1, docs: [{name: 'testdoc'}] })
				}
			};
			const target = new PolicySearchHandler(opts);
			target.getElasticsearchDocDataFromId = () => ({});

			target.getSingleDocumentFromESHelper(req, 'test').then(actual => {
				const expected = { totalCount: 1, docs: [{name: 'testdoc'}] };
				assert.deepStrictEqual(actual, expected);
			});
		});
	});
});
