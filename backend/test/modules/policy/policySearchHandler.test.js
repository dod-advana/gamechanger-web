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
		it('should return single document from ES search', async (done) => {
			try {
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
						env: {
							GAME_CHANGER_OPTS: {downloadLimit: 1000},
							GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
						}
					},
					dataLibrary: {},
					dataTracker: {},
					mlApi: {},
					searchUtility: {}
				};
				const target = new PolicySearchHandler(opts);

				target.createRecObject = () => Promise.resolve({historyRec: [], cloneSpecificObject: [], clientObj: [] });
				target.gatherExpansionTerms = () => Promise.resolve({expansionTerms: []});
				target.doSearch = () => Promise.resolve({docs: ['test'], totalCount: 1});
				target.enrichSearchResults = () => Promise.resolve(enrichSearchResultsExpected);
				target.storeHistoryRecords = () => Promise.resolve();

				const actual = await target.searchHelper(req, 'test');
				const expected = enrichSearchResultsExpected;
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e){
				console.log(e);
			}
		});
	});
	// describe('#callFunctionHelper', () => {	});

	describe('#createRecObject', () => {
		it('it should return rec objects for search', async (done) => {
			done();

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
					env: {
						GAME_CHANGER_OPTS: {downloadLimit: 1000},
						GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
					}
				},
				dataLibrary: {
					putDocument: () => Promise.resolve()
				}
			};
			const target = new PolicySearchHandler(opts);
			try {
				const actual = await target.createRecObject(req, 'test');
				actual.historyRec.startTime = null;
				const expected = createRecObjectExpected;
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e) {
				console.log(e);
			}
		});
	});

	// expansion part of the search

	// not tested because it's just a combination of a bunch of sub-functions
	describe('#gatherExpansionTerms', () => {
		it('should combine all expansion terms correctly', async (done) => {
			try {
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
						env: {
							GAME_CHANGER_OPTS: {downloadLimit: 1000},
							GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
						}
					},
					dataLibrary: {},
					mlApi: {
						getExpandedSearchTerms: (termsArray, userId) => { return Promise.resolve({ shark: [ '"killer whale"', '"whale boat"' ] }); }
					},
					searchUtility: {
						getEsSearchTerms: () => ['parsedQuery', ['terms', 'array']],
						combineExpansionTerms: () => ({ shark: [ '"killer whale"', '"whale boat"' ] })
					}
				};
				const target = new PolicySearchHandler(opts);
				target.mlApiExpansion = () => Promise.resolve({});
				target.thesaurusExpansion = () => Promise.resolve({synonyms: undefined, text: 'shark'});
				target.abbreviationCleaner = () => Promise.resolve({synonyms: undefined, text: 'shark'});

				const actual = await target.gatherExpansionTerms(req, 'test');
				const expected = { shark: [ '"killer whale"', '"whale boat"' ] };
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e) {
				console.log(e);
			}
		});
	});

	describe('#mlApiExpansion', () => {
		it('it should give expansion', async (done) => {
			try {
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
						env: {
							GAME_CHANGER_OPTS: {downloadLimit: 1000},
							GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
						}
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
				done();
			} catch (e) {
				console.log(e);
			}

		});
	});

	describe('#thesaurusExpansion', () => {
		it('should return synonyms and text', async (done) => {
			try {
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
						env: {
							GAME_CHANGER_OPTS: {downloadLimit: 1000},
							GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
						}
					},
					dataLibrary: {},
					mlApi: {
						getExpandedSearchTerms: (termsArray, userId) => { return Promise.resolve({ shark: [ '"killer whale"', '"whale boat"' ] }); }
					},
					thesaurus: {
						lookup: () => {}
					}
				};
				const target = new PolicySearchHandler(opts);

				const [parsedQuery, termsArray] = target.searchUtility.getEsSearchTerms({searchText: req.searchText});
				const actual = await target.thesaurusExpansion(req.searchText, termsArray);
				const expected = {synonyms: undefined, text: 'shark'};
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e) {
				console.log(e);
			}
		});
	});
	describe('#abbreviationCleaner', () => {
		it('should return abbreviations', async (done) => {
			try {
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
						env: {
							GAME_CHANGER_OPTS: {downloadLimit: 1000},
							GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
						}
					},
					dataLibrary: {},
					mlApi: {},
				};
				const target = new PolicySearchHandler(opts);
				const [parsedQuery, termsArray] = target.searchUtility.getEsSearchTerms({searchText: req.searchText});
				const actual = await target.abbreviationCleaner(termsArray);
				const expected = []; // maybe need a better test case for abbreviationCleaner; but also unsure because redisAsyncClient
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e) {
				console.log(e);
			}
			done();
		});
	});

	// searchHelper parts
	describe('#doSearch', () => {
		it('should do the search and return SearchResults', async (done) => {
			try {
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
						env: {
							GAME_CHANGER_OPTS: {downloadLimit: 1000},
							GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
						}
					},
					dataLibrary: {},
					dataTracker: {
						crawlerDateHelper: (input, userId) => Promise.resolve(input)
					},
					mlApi: {},
					searchUtility: {
						combinedSearchHandler: () => Promise.resolve({docs: ['test doc'], totalCount: 1}),
						documentSearch: () => Promise.resolve({docs: ['test doc'], totalCount: 1}),
					}
				};
				const target = new PolicySearchHandler(opts);
				const actual = await target.doSearch(req, {expansionDict: []}, {clientObj: 'client'}, 'test');
				const expected = {docs: ['test doc'], totalCount: 1};
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e){
				console.log(e);
				done();
			}
		});
	});

	describe('#enrichSearchResults', () => {
		it('should return enriched SearchResults', async (done) => {
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
					env: {
						GAME_CHANGER_OPTS: {downloadLimit: 1000},
						GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
					}
				},
				dataLibrary: {},
				mlApi: {},
				searchUtility: {}
			};
			const target = new PolicySearchHandler(opts);
			target.qaEnrichment = async (input) => Promise.resolve({...input, qaResults: {question: '', answers: []} });
			target.entitySearch = async (input) => Promise.resolve({entities: [], totalEntities: 0});
			target.topicSearch = async (input) => Promise.resolve({topics: [], totalTopics: 0});
			const actual = await target.enrichSearchResults(req, {}, 'test');
			const expected = enrichSearchResultsExpected;
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});

	describe('#qaEnrichment', () => {
		it('should return QA results', async (done) => {
			try {
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
						env: {
							GAME_CHANGER_OPTS: {downloadLimit: 1000},
							GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
						}
					},
					dataLibrary: {
						queryElasticSearch: () => Promise.resolve()
					},
					dataTracker: {
						crawlerDateHelper: (input, userId) => Promise.resolve(input)
					},
					mlApi: {
						getIntelAnswer: () => Promise.resolve()
					},
					searchUtility: {
						phraseQAQuery: () => Promise.resolve(),
						getQAContext: () => Promise.resolve([{name: 'test object'}]),
						filterQAResults: () => Promise.resolve({question: 'what is this', answers: ['this is a test']})
					}
				};
				const target = new PolicySearchHandler(opts);
				const actual = await target.qaEnrichment(req, {}, 'test');
				const expected = { qaResults: {question: 'what is this', answers: ['this is a test']}};
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e){
				console.log(e);
			}
		});
	});
	describe('#entitySearch', () => {
		it('should return entity search results', async (done) => {
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
					env: {
						GAME_CHANGER_OPTS: {downloadLimit: 1000},
						GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
					}
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
			const expected = {topics: [{name: 'test', relatedTopics: 'data', type: 'topic', documentCount: 'data'}], totalTopics: 1};
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});
	describe('#topicSearch', () => {
		it('should return topic search results', async (done) => {
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
					env: {
						GAME_CHANGER_OPTS: {downloadLimit: 1000},
						GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
					}
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
			const expected = {topics: [{name: 'test', relatedTopics: 'data', type: 'topic', documentCount: 'data'}], totalTopics: 1};
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});

	// ES helper stuff
	describe('#getSingleDocumentFromESHelper', () => {
		it('should return single document from ES search', async (done) => {
			try {
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
						env: {
							GAME_CHANGER_OPTS: {downloadLimit: 1000},
							GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
						}
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

				const actual = await target.getSingleDocumentFromESHelper(req, 'test');
				const expected = { totalCount: 1, docs: [{name: 'testdoc'}] };
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e){
				console.log(e);
			}
		});
	});
	describe('#getElasticsearchDocDataFromId', () => {
		it('should return the right ES query', async (done) => {
			try {
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
						env: {
							GAME_CHANGER_OPTS: {downloadLimit: 1000},
							GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
						}
					},
					dataLibrary: {},
					mlApi: {
						getExpandedSearchTerms: (termsArray, userId) => { return Promise.resolve({ shark: [ '"killer whale"', '"whale boat"' ] }); }
					}
				};
				const target = new PolicySearchHandler(opts);
				const actual = target.getElasticsearchDocDataFromId({docIds: 'test_ID'}, 'test');
				const expected = elasticSearchDocDataExpected;
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e) {
				console.log(e);
			}
		});
	});
});
