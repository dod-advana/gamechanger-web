const assert = require('assert');
const JBookSearchHandler = require('../../../node_app/modules/jbook/jbookSearchHandler');
const { constructorOptionsMock } = require('../../resources/testUtility');

describe('JBookSearchHandler', function () {

	describe('#searchHelper', () => {
		it('should return data for an ES search', 
			async () => {

				const esSearchTermsMock = ['elephant', ['elephant']];

				const esQueryForJbookMock = {};
				const expansionTermsMock = {
					elephant: [
						{ phrase: 'pachyderm', source: 'ML-QE' },
						{ phrase: 'hippo', source: 'ML-QE' },
						{ phrase: 'african', source: 'ML-QE' }
					]
				};

				console.log('start test');

				const elasticSearchResultsMock = {
					body: {
						_shards: {
							total: 3
						},
						hits: {
							total: {
								value: 1,
								relation: 'eq',
								hits: [

								]
							}
						}
					},
				};
				
				const mockCleanESResults = {
					totalCount: 1,
					docs: [
						{}
					],
					expansionDict: {
						elephant: [
							{ phrase: 'pachyderm', source: 'ML-QE' },
							{ phrase: 'hippo', source: 'ML-QE' },
							{ phrase: 'african', source: 'ML-QE' }
						]
					}
				};

				const req = { useElasticSearch: true, body:
						{
							searchVersion:1,
							jbookSearchSettings:
								{
									sort:
									[
										{
											id: 'budgetYear', desc: false
										}
									],
									budgetTypeAllSelected: true,
									budgetYearAllSelected: true, 
									serviceAgencyAllSelected: true, 
									primaryReviewerAllSelected: true,
									serviceReviewerAllSelected:true, 
									hasKeywordsAllSelected: true,
									primaryClassLabelAllSelected: true,
									sourceTagAllSelected: true, 
									reviewStatusAllSelected: true, 
									useElasticSearch: true, 
									searchText: 'elephant', 
									offset: 0, 
									limit: 18,
									cloneName: 'jbook'
								},
							permissions: ['View gamechanger','Gamechanger Super Admin','eda Admin','jbook Admin','gamechanger Admin','Gamechanger Admin Lite'],
							user:{
								id: '1234567890@mil',
								perms: [],
								cn: 'test.test.1234567890', 
								firstName: 'test',
								lastName: 'ching'
							}
						}
				};
				

				const opts = {
					...constructorOptionsMock,
					searchUtility: {
						getEsSearchTerms() { 
							return Promise.resolve(esSearchTermsMock);
						},
						getElasticSearchQueryForJBook() {
							return Promise.resolve(esQueryForJbookMock);
						}
					},
					jbookSearchUtility: {
						gatherExpansionTerms() {
							return Promise.resolve(expansionTermsMock);
						},
						cleanESResults() {
							return Promise.resolve(mockCleanESResults);
						}
					},
					dataLibrary: {
						queryElasticSearch() {
							return Promise.resolve(elasticSearchResultsMock);
						}
					},
					db: {},
					pdoc: {},
					rdoc: {},
					om: {},
					accomp: {},
					review: {},
					constants: {
						GAME_CHANGER_OPTS: {downloadLimit: 1000, allow_daterange: true},
						GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test', assist_index: 'Test'},
						EDA_ELASTIC_SEARCH_OPTS: {index: 'Test', assist_index: 'Test'},
					},
					gl_contracts: {},
					reports: {}
				};

				const target = new JBookSearchHandler(opts);

				console.log('created the target');

				try {
					const actual = await target.searchHelper(req, 'test', true);
					const expected = {
						totalCount: 1,
						docs: [
							{}
						],
						expansionDict: {
							elephant: [
								{ phrase: 'pachyderm', source: 'ML-QE' },
								{ phrase: 'hippo', source: 'ML-QE' },
								{ phrase: 'african', source: 'ML-QE' }
							]
						}
					};
					assert.deepStrictEqual(actual, expected);
					expect(target.documentSearch).toHaveBeenCalled();
					expect(target.elasticSearchDocumentSearch).toHaveBeenCalled();

				} catch (e) {
					assert.fail(e);
				}
				done();
			});
	});
});