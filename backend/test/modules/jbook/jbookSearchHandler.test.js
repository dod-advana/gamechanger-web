const assert = require('assert');
const JBookSearchHandler = require('../../../node_app/modules/jbook/jbookSearchHandler');
const { constructorOptionsMock } = require('../../resources/testUtility');

describe('JBookSearchHandler', function () {
	describe('#searchHelper', () => {
		it('should return data for an ES search', async (done) => {
			const esSearchTermsMock = ['elephant', ['elephant']];

			const esQueryForJbookMock = {};
			const expansionTermsMock = {
				elephant: [
					{ phrase: 'pachyderm', source: 'ML-QE' },
					{ phrase: 'hippo', source: 'ML-QE' },
					{ phrase: 'african', source: 'ML-QE' },
				],
			};

			const elasticSearchResultsMock = {
				body: {
					_shards: {
						total: 3,
					},
					hits: {
						total: {
							value: 1,
							relation: 'eq',
							hits: [],
						},
					},
				},
			};

			const mockCleanESResults = {
				totalCount: 1,
				docs: [{}],
				expansionDict: {
					elephant: [
						{ phrase: 'pachyderm', source: 'ML-QE' },
						{ phrase: 'hippo', source: 'ML-QE' },
						{ phrase: 'african', source: 'ML-QE' },
					],
				},
			};

			const req = {
				body: {
					searchText: 'test',
					useElasticSearch: true,
					searchVersion: 1,
					jbookSearchSettings: {
						sort: [
							{
								id: 'budgetYear',
								desc: false,
							},
						],
						budgetTypeAllSelected: true,
						budgetYearAllSelected: true,
						serviceAgencyAllSelected: true,
						primaryReviewerAllSelected: true,
						serviceReviewerAllSelected: true,
						hasKeywordsAllSelected: true,
						primaryClassLabelAllSelected: true,
						sourceTagAllSelected: true,
						reviewStatusAllSelected: true,
						useElasticSearch: true,
						searchText: 'elephant',
						offset: 0,
						limit: 18,
						cloneName: 'jbook',
					},
					permissions: [
						'View gamechanger',
						'Gamechanger Super Admin',
						'eda Admin',
						'jbook Admin',
						'gamechanger Admin',
						'Gamechanger Admin Lite',
					],
					user: {
						id: '1234567890@mil',
						perms: [],
						cn: 'test.test.1234567890',
						firstName: 'test',
						lastName: 'ching',
					},
				},
			};

			const opts = {
				...constructorOptionsMock,
				searchUtility: {
					getEsSearchTerms() {
						return esSearchTermsMock;
					},
				},
				jbookSearchUtility: {
					gatherExpansionTerms() {
						return expansionTermsMock;
					},
					cleanESResults() {
						return mockCleanESResults;
					},
					getMapping() {},
					getElasticSearchQueryForJBook() {
						return esQueryForJbookMock;
					},
				},
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(elasticSearchResultsMock);
					},
				},
				db: {},
				pdoc: {},
				rdoc: {},
				om: {},
				accomp: {},
				review: {},
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
					EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				},
				gl_contracts: {},
				reports: {},
				redisDB: {},
			};

			const target = new JBookSearchHandler(opts);

			try {
				const actual = await target.searchHelper(req, 'test', true);
				const expected = {
					totalCount: 1,
					docs: [{}],
					expansionDict: {
						elephant: [
							{ phrase: 'pachyderm', source: 'ML-QE' },
							{ phrase: 'hippo', source: 'ML-QE' },
							{ phrase: 'african', source: 'ML-QE' },
						],
					},
				};
				assert.deepStrictEqual(actual, expected);
			} catch (e) {
				console.log(e);
				assert.fail(e);
			}
			done();
		});

		it('should return data for a PG search', async (done) => {
			const expansionTermsMock = {
				elephant: [
					{ phrase: 'pachyderm', source: 'ML-QE' },
					{ phrase: 'hippo', source: 'ML-QE' },
					{ phrase: 'african', source: 'ML-QE' },
				],
			};

			const mockPGTotalCount = [[{ count: '0' }], {}];

			const mockPGResults = {};

			const req = {
				body: {
					searchText: 'test',
					useElasticSearch: false,
					searchVersion: 1,
					jbookSearchSettings: {
						sort: [
							{
								id: 'budgetYear',
								desc: false,
							},
						],
						budgetTypeAllSelected: true,
						budgetYearAllSelected: true,
						serviceAgencyAllSelected: true,
						primaryReviewerAllSelected: true,
						serviceReviewerAllSelected: true,
						hasKeywordsAllSelected: true,
						primaryClassLabelAllSelected: true,
						sourceTagAllSelected: true,
						reviewStatusAllSelected: true,
						useElasticSearch: true,
						searchText: 'elephant',
						offset: 0,
						limit: 18,
						cloneName: 'jbook',
					},
					permissions: [
						'View gamechanger',
						'Gamechanger Super Admin',
						'eda Admin',
						'jbook Admin',
						'gamechanger Admin',
						'Gamechanger Admin Lite',
					],
					user: {
						id: '1234567890@mil',
						perms: [],
						cn: 'test.test.1234567890',
						firstName: 'test',
						lastName: 'ching',
					},
				},
			};

			const opts = {
				...constructorOptionsMock,
				searchUtility: {
					getJBookPGQueryAndSearchTerms() {
						return 'structured search text';
					},
				},
				jbookSearchUtility: {
					gatherExpansionTerms() {
						return expansionTermsMock;
					},
					getMapping() {},
					buildSelectQuery() {
						return ['pSelect', 'rSelect', 'oSelect'];
					},
					buildWhereQuery() {
						return ['pQuery', 'rQuery', 'oQuery'];
					},
					buildEndQuery() {
						return 'giant query end';
					},
				},
				dataLibrary: {},
				db: {
					jbook: {
						query() {
							return mockPGTotalCount;
						},
					},
				},
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
					EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				},
				keyword_assoc: {
					sequelize: {
						query() {
							return Promise.resolve('keywordIds');
						},
					},
				},
				redisDB: {},
			};

			const target = new JBookSearchHandler(opts);

			try {
				const actual = await target.searchHelper(req, 'test', true);
				const expected = {
					totalCount: '0',
					docs: [
						{
							budgetType: undefined,
							count: '0',
							hasKeywords: true,
						},
					],
					expansionDict: expansionTermsMock,
				};
				assert.deepStrictEqual(actual, expected);
			} catch (e) {
				console.log(e);
				assert.fail(e);
			}
			done();
		});

		// it('should return data for PDF Export',
		// 	async (done) => {
		// 		const req = {
		// 			body: {
		//
		// 			}
		// 		};
		//
		// 		const mockQueryForPDF = ['pSelect', 'rSelect', 'oSelect'];
		// 		const mockWhereQuery = ['pWhere', 'rWhere', 'oWhere'];
		// 		const keywordAssocMock = [[{pdoc_ids: [1, 2, 3]}]];
		// 		// const mockEndQuery = {};
		//
		// 		// update when we add jbook profile page export to gc
		// 		const mockPGResults = [[{
		// 			type:'Procurement',
		// 			id: 1
		// 		}]];
		//
		// 		const opts = {
		// 			keyword_assoc: {
		// 				sequelize: {
		// 					query() {
		// 						return Promise.resolve(keywordAssocMock);
		// 					}
		// 				}
		// 			},
		// 			jbookSearchUtility: {
		// 				buildSelectQueryForFullPDF() {
		// 					return mockQueryForPDF;
		// 				},
		// 				buildWhereQuery() {
		// 					return mockWhereQuery;
		// 				},
		// 				// buildEndQuery() {
		// 				// 	return mockEndQuery;
		// 				// }
		// 			},
		// 			db: {
		// 				jbook: {
		// 					query () {
		// 						return Promise.resolve(mockPGResults);
		// 					}
		// 				}
		// 			}
		// 		};
		//
		// 		const target = new JBookSearchHandler(opts);
		//
		// 		try {
		// 			const actual = await target.getDataForFullPDFExport(req, true);
		// 			const expected = [
		// 				{
		// 					hasKeywords: true,
		// 					id: 1,
		// 					type: 'Procurement'
		// 				}
		// 			];
		// 			assert.deepStrictEqual(actual, expected);
		//
		// 		} catch (e) {
		// 			console.log(e);
		// 			assert.fail(e);
		// 		}
		// 		done();
		// 	});

		it('should return data for filters', async (done) => {
			const req = {};

			const mockPGResults = [
				[
					{
						servicereviewer: ['service reviewer'],
						serviceagency: 'service agency',
						servicesecondaryreviewer: ['service secondary reviewer'],
						reviewstatus: [],
					},
				],
			];

			const mockAgencyYearData = [
				[
					{
						budgetyear: ['2020', '2021', '2022'],
						serviceagency: ['Army', 'Air Force'],
					},
					{
						budgetyear: ['2015', '2016'],
						serviceagency: ['Navy', 'Marine Corp'],
					},
				],
			];

			const mockESBudgetYear = {
				body: {
					aggregations: {
						values: {
							buckets: [
								{
									key: {
										budgetYear_s: '2020',
									},
								},
								{
									key: {
										budgetYear_s: '2021',
									},
								},
								{
									key: {
										budgetYear_s: '2022',
									},
								},
							],
						},
					},
				},
			};

			const mockESServiceAgency = {
				body: {
					aggregations: {
						values: {
							buckets: [
								{
									key: {
										serviceAgency_s: 'AF',
									},
								},
								{
									key: {
										serviceAgency_s: 'DCMA',
									},
								},
								{
									key: {
										serviceAgency_s: 'CAAF',
									},
								},
							],
						},
					},
				},
			};

			let esQueryCalled = false;
			const opts = {
				db: {
					jbook: {
						query(query) {
							if (query.indexOf('primary_reviewer') !== -1) {
								return mockPGResults;
							}
							return mockAgencyYearData;
						},
					},
				},
				redisDB: {},
				dataLibrary: {
					queryElasticSearch() {
						if (esQueryCalled) {
							return Promise.resolve(mockESServiceAgency);
						} else {
							esQueryCalled = true;
							return Promise.resolve(mockESBudgetYear);
						}
					},
				},
			};

			const target = new JBookSearchHandler(opts);

			try {
				const actual = await target.getDataForFilters(req, 'test');
				const expected = {
					budgetYearES: ['2020', '2021', '2022'],
					serviceAgencyES: [
						'Air Force (AF)',
						'Defense Contract Management Agency (DCMA)',
						'Court of Appeals for the Armed Forces (CAAF)',
					],
					budgetYear: ['2015', '2016', '2020', '2021', '2022'],
					reviewstatus: [null],
					serviceAgency: ['Air Force', 'Army', 'Navy', null],
					serviceagency: 'service agency',
					servicereviewer: ['service reviewer'],
					servicesecondaryreviewer: ['service secondary reviewer'],
				};
				assert.deepStrictEqual(actual, expected);
			} catch (e) {
				console.log(e);
				assert.fail(e);
			}
			done();
		});

		it('should return excel data for review status', async (done) => {
			let resStatus = false;
			let setHeader = 0;
			let resEnd = false;

			const req = { test: true };
			const res = {
				status() {
					resStatus = true;
				},
				setHeader() {
					setHeader += 1;
				},
				end() {
					resEnd = true;
				},
			};

			const expansionTermsMock = {
				test: [],
			};

			const keywordAssocMock = [[{ rdoc_ids: [1, 2, 3] }]];

			const totalCountMock = [[{ count: 1 }]];

			const giantQueryMock = [
				[
					{
						type: 'RDT&E',
						id: 1,
						keywords: 'ID,WORD;',
						contracts: '"titles", "piids", "fys"',
						accomplishments: '"accomp titles"',
					},
				],
			];

			const opts = {
				jbookSearchUtility: {
					gatherExpansionTerms() {
						return Promise.resolve(expansionTermsMock);
					},
					buildSelectQuery() {
						return '';
					},
					buildWhereQuery() {
						return '';
					},
					buildEndQuery() {
						return '';
					},
				},
				keyword_assoc: {
					sequelize: {
						query() {
							return Promise.resolve(keywordAssocMock);
						},
					},
				},
				searchUtility: {
					getJBookPGQueryAndSearchTerms() {
						return 'structured search text';
					},
				},
				db: {
					jbook: {
						query(query) {
							if (query.indexOf('COUNT') !== -1) {
								return Promise.resolve(totalCountMock);
							}
							return Promise.resolve(giantQueryMock);
						},
					},
				},
				redisDB: {},
			};

			const target = new JBookSearchHandler(opts);

			try {
				const actual = await target.getExcelDataForReviewStatus(req, 'test', res);
				const expected = {
					results: {
						totalCount: 1,
						docs: [
							{
								type: 'RDT&E',
								id: 1,
								keywords: ['WORD;'],
								contracts: ['titles  piids  fys'],
								accomplishments: ['accomp titles'],
								budgetType: 'rdoc',
								hasKeywords: true,
							},
						],
						expansionDict: {},
					},
					counts: {
						fy22: {
							hasKeywords: {
								army: { total: 0, service: 0, poc: 0, finished: 0 },
								af: { total: 0, service: 0, poc: 0, finished: 0 },
								navy: { total: 0, service: 0, poc: 0, finished: 0 },
								usmc: { total: 0, service: 0, poc: 0, finished: 0 },
								socom: { total: 0, service: 0, poc: 0, finished: 0 },
								osd: { total: 0, service: 0, poc: 0, finished: 0 },
								js: { total: 0, service: 0, poc: 0, finished: 0 },
								other: { total: 0, service: 0, poc: 0, finished: 0 },
								total: 0,
								service: 0,
								poc: 0,
								finished: 0,
							},
							noKeywords: {
								army: { total: 0, service: 0, poc: 0, finished: 0 },
								af: { total: 0, service: 0, poc: 0, finished: 0 },
								navy: { total: 0, service: 0, poc: 0, finished: 0 },
								usmc: { total: 0, service: 0, poc: 0, finished: 0 },
								socom: { total: 0, service: 0, poc: 0, finished: 0 },
								osd: { total: 0, service: 0, poc: 0, finished: 0 },
								js: { total: 0, service: 0, poc: 0, finished: 0 },
								other: { total: 0, service: 0, poc: 0, finished: 0 },
								total: 0,
								service: 0,
								poc: 0,
								finished: 0,
							},
						},
						fy21: {
							hasKeywords: {
								army: { total: 0, service: 0, poc: 0, finished: 0 },
								af: { total: 0, service: 0, poc: 0, finished: 0 },
								navy: { total: 0, service: 0, poc: 0, finished: 0 },
								usmc: { total: 0, service: 0, poc: 0, finished: 0 },
								socom: { total: 0, service: 0, poc: 0, finished: 0 },
								osd: { total: 0, service: 0, poc: 0, finished: 0 },
								js: { total: 0, service: 0, poc: 0, finished: 0 },
								other: { total: 1, service: 1, poc: 0, finished: 0 },
								total: 1,
								service: 1,
								poc: 0,
								finished: 0,
							},
							noKeywords: {
								army: { total: 0, service: 0, poc: 0, finished: 0 },
								af: { total: 0, service: 0, poc: 0, finished: 0 },
								navy: { total: 0, service: 0, poc: 0, finished: 0 },
								usmc: { total: 0, service: 0, poc: 0, finished: 0 },
								socom: { total: 0, service: 0, poc: 0, finished: 0 },
								osd: { total: 0, service: 0, poc: 0, finished: 0 },
								js: { total: 0, service: 0, poc: 0, finished: 0 },
								other: { total: 0, service: 0, poc: 0, finished: 0 },
								total: 0,
								service: 0,
								poc: 0,
								finished: 0,
							},
						},
					},
				};
				assert.deepStrictEqual(actual, expected);
				assert.equal(resStatus, true);
				assert.equal(setHeader, 2);
			} catch (e) {
				console.log(e);
				assert.fail(e);
			}
			done();
		});
	});
});
