const assert = require('assert');
const { ExternalSearchController } = require('../../../node_app/controllers/externalAPI/externalSearchController');
const { ORGFILTER } = require('../../../node_app/utils/routeUtility');
const { constructorOptionsMock, resMock } = require('../../resources/testUtility');

describe('ExternalSearchController', function () {

	describe('#createOrgFilter()', () => {
		const opts = {
			...constructorOptionsMock,
			search: {}
		}
		const target = new ExternalSearchController(opts);

		it('should have the same object pair orgFilter, orgFilterQuery', () => {
			const inA = 'Dept. of Defense_Dept. of the Air Force_Executive Branch';
			const outA = {
				orgFilter: Object.assign({}, ORGFILTER),
				orgFilterQuery: ['DoD', 'DoDM', 'DoDI', 'DoDD', 'DEP', 'SEC', 'AI', 'DTM', 'EO',
					'AFI',
					'AFMAN',
					'CFETP',
					'QTP',
					'AFPD',
					'AFTTP',
					'AFH',
					'HAFMD',
					'AFPAM',
					'AFMD',
					'HOI',
					'AFVA',
					'AFJQS',
					'AFJI',
					'AFGM',
					'DAFI',
					'AFJMAN',
					'DAFPD',
					'AFM',
					'AFPM',
					'(AF MISC)'].join(' OR ')

			};

			outA.orgFilter['Dept. of Defense'] = true;
			outA.orgFilter['Dept. of the Air Force'] = true;
			outA.orgFilter['Executive Branch'] = true;


			const a = target.createOrgFilter(inA);
			assert.deepStrictEqual(a, outA);
		});
	});

	describe('#externalSearch()', () => {
		
		it('should run a keyword search', (done) => {
			let resMsg;
			let resCode;
			const res = {
				status(code){
					resCode = code;
					return this;
				},
				send(msg){
					resMsg = msg;
				}
			};
			
			const apiResMock = {
				docs: [
					{
						doc_num: '6055.18',
						doc_type: 'DoDM',
						filename: 'DoDM 6055.18, 5 11 2010, Ch 2, 7 16 2019 OCR.pdf',
						filepath: 'undefinedDoDM 6055.18, 5 11 2010, Ch 2, 7 16 2019 OCR.pdf',
						id: 'DoDM 6055.18, 5 11 2010, Ch 2, 7 16 2019 OCR.pdf_0',
						keyw_5: 'NA',
						pageHitCount: 1,
						pageHits: [
							{
								pageNumber: 53,
								snippet: 'DoDM 6055.18 May 11 2010 Change 2 07162019 ENCLOSURE 10 53 ENCLOS'
							}
						],
						page_count: 67,
						ref_list: ['DoDD 5134.01', 'DoDD 4715.1E', 'DoDD 5105.02', 'DoDI 6055.1', 'DoDI 6055.05', 'DoDI 5200.08', 'DoDI 6055.07', 'DoDI 6050.05', 'DoDI 6055.17', 'Title 49'],
						summary_30: 'NA',
						type: 'document'
					}
				],
				expansionDict: {},
				isCached: false,
				totalCount: 1
			};

			const constants = {
				GAME_CHANGER_OPTS: {
					version: 'version'
				},
				DATA_API_BASE_URL: 'http://10.194.9.109:9346/v2/data'
			};

			let gcCreateCalled = false;
			let gcHistoryPassed = {};
			const gcHistory = {
				create: async (createPassed) => {
					gcCreateCalled = true;
					gcHistoryPassed = createPassed;
				}
			};

			const search = {
				search(req, res) {
					return res.send(apiResMock);
				},
			};

			const mlApi = {
				getExpandedSearchTerms() {
					return Promise.resolve([]);
				}
			};

			const opts = {
				...constructorOptionsMock,
				constants,
				gcHistory,
				search,
				mlApi
			};
			const target = new ExternalSearchController(opts);

			const req = {
				headers: {
					SSL_CLIENT_S_DN_CN: 'john'
				},
				query: {
					search: 'fakeSearchString',
					cloneName: 'Test',
				},
				get(key) {
					return this.headers[key];
				}
			};

			target.externalSearch(req, res).then(() => {
				assert.deepStrictEqual(resMsg, apiResMock);
				done();
			});
		});
	});
});
