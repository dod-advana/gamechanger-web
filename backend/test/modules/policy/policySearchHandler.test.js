const assert = require('assert');
const PolicySearchHandler = require('../../../node_app/modules/policy/policySearchHandler');
const { constructorOptionsMock, reqMock } = require('../../resources/testUtility');
const {
	createRecObjectExpected,
	enrichSearchResultsExpected,
	elasticSearchDocDataExpected,
} = require('./utils/policySearchHandlerJSON');
// all test cases used 'shark' as the searchtext. req ripped from a sample network call.
describe('PolicySearchHandler', function () {
	describe('#searchHelper', () => {
		it('should return single document from ES search', async (done) => {
			const req = {
				body: {
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
						searchFields: { initial: { field: null, input: '' } },
						accessDateFilter: [null, null],
						publicationDateFilter: [null, null],
						publicationDateAllTime: true,
						includeRevoked: false,
						limit: 6,
						searchVersion: 1,
					},
				},
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test' },
				},
				dataLibrary: {},
				dataTracker: {},
				mlApi: {},
				searchUtility: {
					isQuestion: () => {
						return false;
					},
				},
				redisDB: {
					select: () => 'OK',
				},
			};
			const target = new PolicySearchHandler(opts);

			target.gatherExpansionTerms = () => Promise.resolve({ expansionTerms: [] });
			target.doSearch = () => Promise.resolve({ docs: ['test'], totalCount: 1 });
			target.enrichSearchResults = () => Promise.resolve(enrichSearchResultsExpected);
			target.storeRecordOfSearchInPg = jest.fn(() => Promise.resolve());
			target.storeEsRecord = jest.fn(() => Promise.resolve());

			const actual = await target.searchHelper(req, 'test', true);
			const expected = enrichSearchResultsExpected;
			assert.deepStrictEqual(actual, expected);
			expect(target.storeRecordOfSearchInPg).toHaveBeenCalled();
			expect(target.storeEsRecord).toHaveBeenCalled();
			done();
		});

		it('should not store history when requested', async (done) => {
			const req = {
				body: {
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
						forCacheReload: true,
						tiny_url: 'gamechanger?tiny=282',
						searchFields: { initial: { field: null, input: '' } },
						accessDateFilter: [null, null],
						publicationDateFilter: [null, null],
						publicationDateAllTime: true,
						includeRevoked: false,
						limit: 6,
						searchVersion: 1,
					},
				},
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test' },
				},
				dataLibrary: {},
				dataTracker: {},
				mlApi: {},
				searchUtility: {
					isQuestion: () => {
						return false;
					},
				},
				redisDB: {
					select: () => 'OK',
				},
			};
			const target = new PolicySearchHandler(opts);

			target.gatherExpansionTerms = () => Promise.resolve({ expansionTerms: [] });
			target.doSearch = () => Promise.resolve({ docs: ['test'], totalCount: 1 });
			target.enrichSearchResults = () => Promise.resolve(enrichSearchResultsExpected);
			target.storeRecordOfSearchInPg = jest.fn(() => Promise.resolve());
			target.storeEsRecord = jest.fn(() => Promise.resolve());

			const actual = await target.searchHelper(req, 'test', false);
			const expected = enrichSearchResultsExpected;
			assert.deepStrictEqual(actual, expected);
			expect(target.storeRecordOfSearchInPg).not.toHaveBeenCalled();
			expect(target.storeEsRecord).not.toHaveBeenCalled();
			done();
		});
	});

	describe('#createRecObject', () => {
		it('it should return rec objects for search', async (done) => {
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
					searchFields: { initial: { field: null, input: '' } },
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1,
				},
			};

			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				},
				dataLibrary: {
					putDocument: () => Promise.resolve(),
				},
				dataTracker: {},
				mlApi: {},
				searchUtility: {},
			};
			const target = new PolicySearchHandler(opts);
			const actual = await target.createRecObject(req, 'test', true, 'test');
			actual.historyRec.startTime = null;
			const expected = {
				clientObj: { esClientName: 'gamechanger', esIndex: ['Test', 'Test'] },
				cloneSpecificObject: { includeRevoked: undefined, orgFilterString: [], searchFields: [] },
				historyRec: {
					cachedResult: false,
					clone_name: 'gamechanger',
					endTime: null,
					hadError: false,
					numResults: -1,
					orgFilters: '[]',
					request_body: {
						cloneName: 'gamechanger',
						offset: 0,
						options: {
							accessDateFilter: [null, null],
							charsPadding: 90,
							includeRevoked: false,
							limit: 6,
							orgFilterString: [],
							publicationDateAllTime: true,
							publicationDateFilter: [null, null],
							searchFields: { initial: { field: null, input: '' } },
							searchType: 'Keyword',
							searchVersion: 1,
							showTutorial: false,
							tiny_url: 'gamechanger?tiny=282',
							transformResults: false,
							typeFilterString: [],
							useGCCache: false,
						},
						searchText: 'shark',
					},
					search: '',
					searchText: 'shark',
					searchType: undefined,
					search_version: undefined,
					showTutorial: false,
					startTime: null,
					tiny_url: undefined,
					user_id: 'test',
				},
			};
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});

	describe('#mlApiExpansion', () => {
		it('it should give expansion', async (done) => {
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
					searchFields: { initial: { field: null, input: '' } },
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1,
				},
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test' },
				},
				dataLibrary: {},
				mlApi: {
					getExpandedSearchTerms: (termsArray, userId) => {
						return Promise.resolve({ shark: ['"killer whale"', '"whale boat"'] });
					},
				},
			};
			const target = new PolicySearchHandler(opts);
			const [parsedQuery, termsArray] = target.searchUtility.getEsSearchTerms({ searchText: req.searchText });
			const actual = await target.mlApiExpansion(termsArray, false, 'test');
			const expected = { shark: ['"killer whale"', '"whale boat"'] };
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});

	describe('#thesaurusExpansion', () => {
		it('should return synonyms and text', async (done) => {
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
					searchFields: { initial: { field: null, input: '' } },
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1,
				},
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test' },
				},
				dataLibrary: {},
				mlApi: {
					getExpandedSearchTerms: (termsArray, userId) => {
						return Promise.resolve({
							qexp: { shark: ['"killer whale"', '"whale boat"'] },
							wordsim: ['fish'],
						});
					},
				},
				thesaurus: {
					lookup: () => {},
				},
			};
			const target = new PolicySearchHandler(opts);

			const [parsedQuery, termsArray] = target.searchUtility.getEsSearchTerms({ searchText: req.searchText });
			const actual = await target.thesaurusExpansion(req.searchText, termsArray);
			const expected = [[], 'shark'];
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});
	describe('#abbreviationCleaner', () => {
		it('should return abbreviation expansions/aliases', async (done) => {
			const req = {
				cloneName: 'gamechanger',
				searchText: 'jaic',
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
					searchFields: { initial: { field: null, input: '' } },
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1,
				},
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test' },
				},
				dataLibrary: {},
				mlApi: {},
				dataTracker: {},
				searchUtility: {
					findAliases: (termsArray, esClientName, entitiesIndex, user) => {
						return Promise.resolve({
							_index: 'entities_20211122',
							_type: '_doc',
							_id: 'PKInSX0By_0abNhzabvx',
							_score: 5.113524,
							_source: {
								name: 'Joint Artificial Intelligence Center',
								website: 'https://www.ai.mil',
								address: '',
								government_branch: 'Executive Department Sub-Office/Agency/Bureau',
								parent_agency: 'Office of the Secretary of Defense',
								related_agency: '',
								entity_type: 'org',
								crawlers: '',
								num_mentions: '',
								aliases: [
									{ name: 'JAIC' },
									{ name: 'Joint AI Center' },
									{ name: 'artificial intelligence' },
									{ name: 'dod ai center' },
								],
								information:
									"The Joint Artificial Intelligence Center (JAIC) (pronounced 'jake') is an American organization on exploring the usage of Artificial Intelligence (AI) (particularly Edge computing), Network of Networks and AI-enhanced communication for use in actual combat.It is a subdivision of the United States Armed Forces and was created in June 2018. The organization's stated objective is to 'transform the US Department of Defense by accelerating the delivery and adoption of AI to achieve mission impact at scale. The goal is to use AI to solve large and complex problem sets that span multiple combat systems; then, ensure the combat Systems and Components have real-time access to ever-improving libraries of data sets and tools.'",
								information_source: 'Wikipedia',
								information_retrieved: '2021-10-19',
							},
							match: 'JAIC',
						});
					},
				},
			};
			const userId = '';
			const target = new PolicySearchHandler(opts);
			const termsArray = ['jaic'];
			const actual = await target.abbreviationCleaner(termsArray, userId);
			const expected = [
				'"joint artificial intelligence center"',
				'"joint ai center"',
				'"artificial intelligence"',
				'"dod ai center"',
			];
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});

	// searchHelper parts
	describe('#doSearch', () => {
		it('should do the search and return SearchResults', async (done) => {
			const req = {
				body: {
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
						searchFields: { initial: { field: null, input: '' } },
						accessDateFilter: [null, null],
						publicationDateFilter: [null, null],
						publicationDateAllTime: true,
						includeRevoked: false,
						limit: 6,
						searchVersion: 1,
					},
				},
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test' },
				},
				dataLibrary: {},
				dataTracker: {
					crawlerDateHelper: (input, userId) => Promise.resolve(input),
				},
				mlApi: {},
				searchUtility: {
					// combinedSearchHandler: () => Promise.resolve({docs: ['test doc'], totalCount: 1}),
					documentSearch: () => Promise.resolve({ docs: ['test doc'], totalCount: 1 }),
				},
				async_redis: { select() {} },
				app_settings: {
					findOrCreate() {
						return Promise.resolve([]);
					},
				},
			};
			const target = new PolicySearchHandler(opts);
			const actual = await target.doSearch(req, { expansionDict: [] }, { clientObj: 'client' }, 'test');
			const expected = { docs: ['test doc'], totalCount: 1 };
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});

	describe('#enrichSearchResults', () => {
		it('should return enriched SearchResults', async (done) => {
			const req = {
				body: {
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
						searchFields: { initial: { field: null, input: '' } },
						accessDateFilter: [null, null],
						publicationDateFilter: [null, null],
						publicationDateAllTime: true,
						includeRevoked: false,
						limit: 6,
						searchVersion: 1,
					},
				},
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test' },
				},
				dataLibrary: {},
				mlApi: {},
				searchUtility: {
					intelligentSearchHandler: () => {
						return Promise.resolve([]);
					},
					getSentResults() {
						return Promise.resolve([]);
					},
				},
				dataTracker: {},
				async_redis: {},
				app_settings: {
					findOrCreate() {
						return Promise.resolve([]);
					},
				},
			};
			const target = new PolicySearchHandler(opts);
			const actual = await target.enrichSearchResults(req, {}, 'test', 'test');
			const expected = {
				entities: [],
				intelligentSearch: {},
				qaResults: { answers: [], params: {}, qaContext: [], question: '' },
				topics: [],
				totalEntities: 0,
				totalTopics: 0,
				sentenceResults: [],
			};
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});

	describe('#qaEnrichment', () => {
		it('should return QA results', async (done) => {
			const req = {
				body: {
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
						searchFields: { initial: { field: null, input: '' } },
						accessDateFilter: [null, null],
						publicationDateFilter: [null, null],
						publicationDateAllTime: true,
						includeRevoked: false,
						limit: 6,
						searchVersion: 1,
					},
				},
				permissions: ['Gamechanger Admin', 'Webapp Super Admin'],
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test' },
				},
				dataLibrary: {
					queryElasticSearch: () => Promise.resolve(),
				},
				dataTracker: {
					crawlerDateHelper: (input, userId) => Promise.resolve(input),
				},
				mlApi: {
					getIntelAnswer: () => Promise.resolve({ answers: ['this is a test'] }),
				},
				searchUtility: {
					phraseQAQuery() {
						return Promise.resolve();
					},
					phraseQAEntityQuery() {
						return Promise.resolve();
					},
					getQAContext() {
						return Promise.resolve([{ name: 'test object' }]);
					},
					filterQAResults() {
						return Promise.resolve({ question: 'what is this', answers: ['this is a test'] });
					},
				},
				app_settings: {
					findOrCreate() {
						return Promise.resolve([]);
					},
				},
			};
			const target = new PolicySearchHandler(opts);
			const actual = await target.qaEnrichment(req, {}, 'test');
			const expected = { answers: [], params: 'test', qaContext: [], question: '' };
			assert.deepStrictEqual(actual, expected);
			done();
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
					searchFields: { initial: { field: null, input: '' } },
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					limit: 6,
					searchVersion: 1,
				},
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test' },
				},
				dataLibrary: {
					queryElasticSearch: () => {
						return Promise.resolve({
							body: { hits: { hits: [{ _source: { name: 'test' } }], total: { value: 1 } } },
						});
					},
					queryGraph: () => {
						return Promise.resolve({ result: {} });
					},
				},
				mlApi: {},
				searchUtility: {
					getEntityQuery: () => {
						return Promise.resolve();
					},
					cleanNeo4jData: () => {
						return { graph_metadata: 'data' };
					},
				},
			};
			const target = new PolicySearchHandler(opts);
			const actual = await target.entitySearch('shark', 0, 6, 'test');
			const expected = { entities: [{ name: 'test', type: 'organization' }], totalEntities: 1 };
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});
	describe('#topicSearch', () => {
		it('should return topic search results', async (done) => {
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test' },
				},
				dataLibrary: {
					queryElasticSearch: () => {
						return Promise.resolve({
							body: { hits: { hits: [{ _source: { name: 'test' } }], total: { value: 1 } } },
						});
					},
					queryGraph: () => {
						return Promise.resolve({ result: {} });
					},
				},
				mlApi: {},
				searchUtility: {
					getTopicQuery: () => {
						return Promise.resolve();
					},
					cleanNeo4jData: () => {
						return { graph_metadata: 'data' };
					},
				},
			};
			const target = new PolicySearchHandler(opts);
			const actual = await target.topicSearch('shark', 0, 6, 'test');
			const expected = {
				topics: [{ documentCount: 'data', name: 'test', relatedTopics: 'data', type: 'topic' }],
				totalTopics: 1,
			};
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});

	// ES helper stuff
	describe('#getSingleDocumentFromESHelper', () => {
		it('should return single document from ES search', async (done) => {
			const req = {
				body: {
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
						searchFields: { initial: { field: null, input: '' } },
						accessDateFilter: [null, null],
						publicationDateFilter: [null, null],
						publicationDateAllTime: true,
						includeRevoked: false,
						limit: 6,
						searchVersion: 1,
					},
				},
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				},
				dataLibrary: {
					queryElasticSearch: () =>
						Promise.resolve({
							body: {
								hits: {
									name: 'test-obj',
									total: { value: 1 },
								},
							},
						}),
				},
				dataTracker: {
					crawlerDateHelper: (input, userId) => Promise.resolve(input),
				},
				mlApi: {},
				searchUtility: {
					getESClient: () => ({ esClientName: 'test-client', esIndex: 'test-index' }),
					cleanUpEsResults: () => ({ totalCount: 1, docs: [{ name: 'testdoc' }] }),
					getElasticsearchDocDataFromId: () => ({}),
				},
			};
			const target = new PolicySearchHandler(opts);

			const actual = await target.getSingleDocumentFromESHelper(req, 'test');
			const expected = { totalCount: 1, docs: [{ name: 'testdoc' }] };
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});
});
