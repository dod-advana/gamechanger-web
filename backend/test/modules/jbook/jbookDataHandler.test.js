const assert = require('assert');
const JBookDataHandler = require('../../../node_app/modules/jbook/jbookDataHandler');
const { constructorOptionsMock } = require('../../resources/testUtility');

const {
	profileData,
	keywordData,
	reviewData,
	esData,
	portfolioData,
} = require('../../resources/mockResponses/jbookMockData');

describe('JBookDataHandler', function () {
	describe('#getProjectData', () => {
		const docs = profileData;
		let keywords = keywordData['pdoc'];
		let review = reviewData['pdoc'];
		let esReturn = esData['pdoc'];
		let portfolios = portfolioData;

		const findOneFromDocs = (id, type) => {
			return docs[type][id];
		};

		const opts = {
			...constructorOptionsMock,
			constants: {
				GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
				GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
			},
			pdoc: {
				findOne(where) {
					return Promise.resolve({ dataValues: findOneFromDocs(where.where.id, 'pdoc') });
				},
			},
			rdoc: {
				findOne(where) {
					return Promise.resolve({ dataValues: findOneFromDocs(where.where.id, 'rdoc') });
				},
			},
			om: {
				findOne(where) {
					return Promise.resolve({ dataValues: findOneFromDocs(where.where.id, 'odoc') });
				},
			},
			gl_contracts: {
				findAll() {
					return Promise.resolve([]);
				},
			},
			obligations: {
				findAll() {
					return Promise.resolve([]);
				},
			},
			accomp: {
				findAll() {
					return Promise.resolve([]);
				},
			},
			db: {
				jbook: {
					query() {
						return Promise.resolve(keywords);
					},
				},
			},
			review: {
				findOne() {
					return Promise.resolve({ dataValues: review });
				},
				findAll() {
					return Promise.resolve({ dataValues: review });
				},
			},
			reviewer: {
				findOne() {
					return Promise.resolve([]);
				},
			},
			vendors: {
				findAll() {
					return Promise.resolve([]);
				},
			},
			keyword: {
				findAll() {
					return Promise.resolve([]);
				},
			},
			dataLibrary: {
				queryElasticSearch(name, index, query, userId) {
					return Promise.resolve(esReturn);
				},
			},
			portfolio: {
				findOne() {
					return Promise.resolve(portfolios[0]);
				},
				findAll() {
					return Promise.resolve(portfolios);
				},
				update() {
					return Promise.resolve([1]);
				},
			},
		};

		it('should get the pdoc project data for ES', async (done) => {
			review = reviewData['pdoc'];

			const req = {
				body: {
					useElasticSearch: true,
					type: 'Procurement',
					id: 'pdoc#000075#2022#3010#07#Air%20Force%20(AF)',
				},
			};

			const target = new JBookDataHandler(opts);

			const expected = {
				budgetType: 'pdoc',
				key_s: 'pdoc#2022#PB#07#000075#57#N/A#3010',
				currentYearAmount: '979.388',
				priorYearAmount: '1372.337',
				'P40-77_TOA_PY': '1173.314',
				by1BaseYear: '979.388',
				budgetYear: '2022',
				appropriationNumber: '3010',
				appropriationTitle: 'Aircraft Procurement, Air Force',
				budgetActivityNumber: '07',
				budgetActivityTitle: 'Aircraft Supt Equipment & Facilities',
				budgetLineItem: '000075',
				projectTitle: 'Other Production Charges',
				p1LineNumber: '85',
				projectMissionDescription:
					'The Miscellaneous Production Charges program provides for items which are not directly related to other procurement line items in this appropriation, cannot be reasonably allocated and charged to other procurement line items in this appropriation, can be managed as separate end items, may contain certain classified programs, and may be alternate mission equipment, not considered a modification, for out of production systems.\n\nThe major efforts supported in FY 2022 include funding for Electronic Attack pods, towed decoys and associated test equipment; B-2, F-15E, F-15 EPAWSS and F-22 Depot Core Activation, Aerial Targets, Maintenance Support Vehicles or Equipment and the required U.S. contribution for projects defined by the NATO Airborne Early Warning and Control (NAEWC) Board of Directors and approved by the U.S. government.  \n\nThe program has associated Research Development Test and Evaluation funding in PEs 0101113F, 0101127F, 0207040F, 0207171F, 0207134F, 0207138F, 0205219F, 0207249F, 0305116F, 0305220F, 0401119F, 0604735F, 0701212F and 1203001F.',
				'P40-15_Justification':
					'This program, Other Production Charges P-40A Category Uncategorized Item Bomber Armament Tester (BAT), is a new start.\n\nThe major efforts supported in FY 2022 include funding for Electronic Attack pods, towed decoys and associated test equipment; B-2, F-15E and F-22 Depot Core Activation; RQ-4, and Aerial Targets.',
				serviceAgency: 'Air Force (AF)',
				uot_department_s: '57',
				uot_agency_s: 'N/A',
				budgetSubActivity: 'Other Production Charges',
				org_jbook_desc_s: 'Air Force (AF)',
				org_code_s: 'AF',
				id: 'pdoc#000075#2022#3010#07#Air Force (AF)',
				p40a_aggregated_items_n: [
					{ 'P40a-16_Title_t': 'F-22A' },
					{ 'P40a-16_Title_t': 'F-15E Squadrons' },
					{ 'P40a-16_Title_t': 'RQ-4 UAV' },
					{ 'P40a-16_Title_t': 'Maintenance Support Vehicles or Equipment' },
					{ 'P40a-16_Title_t': 'F-15A/B/C/D Squadrons' },
					{ 'P40a-16_Title_t': 'Supply Depot Operations (Non-IF)' },
					{ 'P40a-16_Title_t': 'PRECISION ATTACK SYSTEMS PROCUREMENT' },
					{ 'P40a-16_Title_t': 'EWIR' },
					{ 'P40a-16_Title_t': 'TRGT' },
					{ 'P40a-16_Title_t': 'MQ-9' },
					{ 'P40a-16_Title_t': 'EW POD' },
					{ 'P40a-16_Title_t': 'CTRE' },
					{ 'P40a-16_Title_t': 'F-15 EPAWSS' },
					{ 'P40a-16_Title_t': 'Service Support to NATO AEWC Program' },
					{ 'P40a-16_Title_t': 'Classified Mods' },
					{ 'P40a-16_Title_t': 'B-2' },
					{ 'P40a-16_Title_t': 'FBLOST' },
					{ 'P40a-16_Title_t': 'C-5 Airlift Squadrons (IF)' },
				],
				keywords: [],
				hasKeywords: false,
				pageHits: [],
				review: {
					id: 233170,
					revBudgetLineItems: '000073',
					serviceAgreeLabel: 'Yes',
					primaryClassLabel: 'Not AI',
					primaryPlannedTransitionPartner: 'Air Force',
					servicePTPAgreeLabel: 'Yes',
					serviceAdditionalMissionPartners: 'Unknown',
					reviewStatus: 'Partial Review (POC)',
					servicePOCTitle: 'Superwoman',
					servicePOCName: 'Elizabeth',
					servicePOCEmail: 'hedrick_elizabeth@bah.com',
					primaryReviewNotes: 'Test Automation Primary Reviewer Notes',
					budgetYear: '2022',
					budgetType: 'pdoc',
					primaryReviewStatus: 'Finished Review',
					serviceReviewStatus: 'Partial Review',
					pocReviewStatus: 'Partial Review',
					primaryReviewer: 'Allen, Gregory',
					serviceReviewer: 'Chapa, Joseph (Air Force)',
					servicePOCOrg: 'Advana',
					servicePOCPhoneNumber: '867-5309',
					createdAt: '2021-11-10T13:59:27.983Z',
					updatedAt: '2022-03-08T03:33:44.950Z',
					budgetActivityNumber: '07',
					pocAgreeLabel: 'No',
					pocClassLabel: 'Not AI',
					pocPTPAgreeLabel: 'Yes',
					pocMPAgreeLabel: 'Yes',
					pocMissionPartnersChecklist: '{}',
					serviceMissionPartnersChecklist: '{}',
					appropriationNumber: '3010F',
					serviceAgency: 'Air Force (AF)',
					totalBudget: 0,
					primaryReviewerEmail: null,
					serviceReviewerEmail: null,
					serviceSecondaryReviewerEmail: null,
				},
			};
			const actual = await target.getESProjectData(req, 'Test');
			assert.deepStrictEqual(actual, expected);
			done();
		});

		it('should get the rdoc project data for ES', async (done) => {
			review = reviewData['rdoc'];

			const req = {
				body: {
					useElasticSearch: true,
					type: 'RDT&E',
					id: 'rdoc#0101122F#674797#2022#3600#07#Air%20Force%20(AF)',
				},
			};

			const target = new JBookDataHandler(opts);

			const expected = {
				budgetType: 'pdoc',
				key_s: 'pdoc#2022#PB#07#000075#57#N/A#3010',
				currentYearAmount: '979.388',
				priorYearAmount: '1372.337',
				'P40-77_TOA_PY': '1173.314',
				by1BaseYear: '979.388',
				budgetYear: '2022',
				appropriationNumber: '3010',
				appropriationTitle: 'Aircraft Procurement, Air Force',
				budgetActivityNumber: '07',
				budgetActivityTitle: 'Aircraft Supt Equipment & Facilities',
				budgetLineItem: '000075',
				projectTitle: 'Other Production Charges',
				p1LineNumber: '85',
				projectMissionDescription:
					'The Miscellaneous Production Charges program provides for items which are not directly related to other procurement line items in this appropriation, cannot be reasonably allocated and charged to other procurement line items in this appropriation, can be managed as separate end items, may contain certain classified programs, and may be alternate mission equipment, not considered a modification, for out of production systems.\n\nThe major efforts supported in FY 2022 include funding for Electronic Attack pods, towed decoys and associated test equipment; B-2, F-15E, F-15 EPAWSS and F-22 Depot Core Activation, Aerial Targets, Maintenance Support Vehicles or Equipment and the required U.S. contribution for projects defined by the NATO Airborne Early Warning and Control (NAEWC) Board of Directors and approved by the U.S. government.  \n\nThe program has associated Research Development Test and Evaluation funding in PEs 0101113F, 0101127F, 0207040F, 0207171F, 0207134F, 0207138F, 0205219F, 0207249F, 0305116F, 0305220F, 0401119F, 0604735F, 0701212F and 1203001F.',
				'P40-15_Justification':
					'This program, Other Production Charges P-40A Category Uncategorized Item Bomber Armament Tester (BAT), is a new start.\n\nThe major efforts supported in FY 2022 include funding for Electronic Attack pods, towed decoys and associated test equipment; B-2, F-15E and F-22 Depot Core Activation; RQ-4, and Aerial Targets.',
				serviceAgency: 'Air Force (AF)',
				uot_department_s: '57',
				uot_agency_s: 'N/A',
				budgetSubActivity: 'Other Production Charges',
				org_jbook_desc_s: 'Air Force (AF)',
				org_code_s: 'AF',
				id: 'pdoc#000075#2022#3010#07#Air Force (AF)',
				p40a_aggregated_items_n: [
					{ 'P40a-16_Title_t': 'F-22A' },
					{ 'P40a-16_Title_t': 'F-15E Squadrons' },
					{ 'P40a-16_Title_t': 'RQ-4 UAV' },
					{ 'P40a-16_Title_t': 'Maintenance Support Vehicles or Equipment' },
					{ 'P40a-16_Title_t': 'F-15A/B/C/D Squadrons' },
					{ 'P40a-16_Title_t': 'Supply Depot Operations (Non-IF)' },
					{ 'P40a-16_Title_t': 'PRECISION ATTACK SYSTEMS PROCUREMENT' },
					{ 'P40a-16_Title_t': 'EWIR' },
					{ 'P40a-16_Title_t': 'TRGT' },
					{ 'P40a-16_Title_t': 'MQ-9' },
					{ 'P40a-16_Title_t': 'EW POD' },
					{ 'P40a-16_Title_t': 'CTRE' },
					{ 'P40a-16_Title_t': 'F-15 EPAWSS' },
					{ 'P40a-16_Title_t': 'Service Support to NATO AEWC Program' },
					{ 'P40a-16_Title_t': 'Classified Mods' },
					{ 'P40a-16_Title_t': 'B-2' },
					{ 'P40a-16_Title_t': 'FBLOST' },
					{ 'P40a-16_Title_t': 'C-5 Airlift Squadrons (IF)' },
				],
				keywords: [],
				hasKeywords: false,
				pageHits: [],
				review: {
					id: 239868,
					revProgramElement: '0101122F',
					revBudgetLineItems: '674797',
					serviceAgreeLabel: 'No',
					primaryClassLabel: 'Core AI',
					primaryPlannedTransitionPartner: 'Army',
					servicePTPAgreeLabel: 'Yes',
					reviewStatus: 'Partial Review (Service)',
					servicePOCTitle: 'John',
					servicePOCName: 'Doe',
					servicePOCEmail: 'jdoe@yahoo.com',
					budgetYear: '2022',
					budgetType: 'rdoc',
					primaryReviewStatus: 'Finished Review',
					serviceReviewStatus: 'Partial Review',
					primaryReviewer: 'Allen, Gregory',
					serviceReviewer: 'Chapa, Joseph (Air Force)',
					pocDollarsAttributed: '0.54',
					servicePOCOrg: 'TIAA',
					servicePOCPhoneNumber: '8888675309',
					serviceClassLabel: 'AI Enabled',
					createdAt: '2021-11-10T13:59:28.506Z',
					updatedAt: '2021-12-22T15:45:08.507Z',
					budgetActivityNumber: '07',
					pocAgreeLabel: 'Yes',
					pocPTPAgreeLabel: 'Yes',
					pocMPAgreeLabel: 'Yes',
					appropriationNumber: '3600',
					serviceAgency: 'Air Force (AF)',
					totalBudget: 0,
					primaryReviewerEmail: null,
					serviceReviewerEmail: null,
					serviceSecondaryReviewerEmail: null,
				},
			};
			const actual = await target.getESProjectData(req, 'Test');
			assert.deepStrictEqual(actual, expected);
			done();
		});

		it('should get the odoc project data for ES', async (done) => {
			review = reviewData['odoc'];

			const req = {
				body: {
					useElasticSearch: true,
					type: 'O&M',
					id: 'odoc#120#132#2022#2020A#01Army',
				},
			};

			const target = new JBookDataHandler(opts);

			const expected = {
				budgetType: 'pdoc',
				key_s: 'pdoc#2022#PB#07#000075#57#N/A#3010',
				currentYearAmount: '979.388',
				priorYearAmount: '1372.337',
				'P40-77_TOA_PY': '1173.314',
				by1BaseYear: '979.388',
				budgetYear: '2022',
				appropriationNumber: '3010',
				appropriationTitle: 'Aircraft Procurement, Air Force',
				budgetActivityNumber: '07',
				budgetActivityTitle: 'Aircraft Supt Equipment & Facilities',
				budgetLineItem: '000075',
				projectTitle: 'Other Production Charges',
				p1LineNumber: '85',
				projectMissionDescription:
					'The Miscellaneous Production Charges program provides for items which are not directly related to other procurement line items in this appropriation, cannot be reasonably allocated and charged to other procurement line items in this appropriation, can be managed as separate end items, may contain certain classified programs, and may be alternate mission equipment, not considered a modification, for out of production systems.\n\nThe major efforts supported in FY 2022 include funding for Electronic Attack pods, towed decoys and associated test equipment; B-2, F-15E, F-15 EPAWSS and F-22 Depot Core Activation, Aerial Targets, Maintenance Support Vehicles or Equipment and the required U.S. contribution for projects defined by the NATO Airborne Early Warning and Control (NAEWC) Board of Directors and approved by the U.S. government.  \n\nThe program has associated Research Development Test and Evaluation funding in PEs 0101113F, 0101127F, 0207040F, 0207171F, 0207134F, 0207138F, 0205219F, 0207249F, 0305116F, 0305220F, 0401119F, 0604735F, 0701212F and 1203001F.',
				'P40-15_Justification':
					'This program, Other Production Charges P-40A Category Uncategorized Item Bomber Armament Tester (BAT), is a new start.\n\nThe major efforts supported in FY 2022 include funding for Electronic Attack pods, towed decoys and associated test equipment; B-2, F-15E and F-22 Depot Core Activation; RQ-4, and Aerial Targets.',
				serviceAgency: 'Air Force (AF)',
				uot_department_s: '57',
				uot_agency_s: 'N/A',
				budgetSubActivity: 'Other Production Charges',
				org_jbook_desc_s: 'Air Force (AF)',
				org_code_s: 'AF',
				id: 'pdoc#000075#2022#3010#07#Air Force (AF)',
				p40a_aggregated_items_n: [
					{ 'P40a-16_Title_t': 'F-22A' },
					{ 'P40a-16_Title_t': 'F-15E Squadrons' },
					{ 'P40a-16_Title_t': 'RQ-4 UAV' },
					{ 'P40a-16_Title_t': 'Maintenance Support Vehicles or Equipment' },
					{ 'P40a-16_Title_t': 'F-15A/B/C/D Squadrons' },
					{ 'P40a-16_Title_t': 'Supply Depot Operations (Non-IF)' },
					{ 'P40a-16_Title_t': 'PRECISION ATTACK SYSTEMS PROCUREMENT' },
					{ 'P40a-16_Title_t': 'EWIR' },
					{ 'P40a-16_Title_t': 'TRGT' },
					{ 'P40a-16_Title_t': 'MQ-9' },
					{ 'P40a-16_Title_t': 'EW POD' },
					{ 'P40a-16_Title_t': 'CTRE' },
					{ 'P40a-16_Title_t': 'F-15 EPAWSS' },
					{ 'P40a-16_Title_t': 'Service Support to NATO AEWC Program' },
					{ 'P40a-16_Title_t': 'Classified Mods' },
					{ 'P40a-16_Title_t': 'B-2' },
					{ 'P40a-16_Title_t': 'FBLOST' },
					{ 'P40a-16_Title_t': 'C-5 Airlift Squadrons (IF)' },
				],
				keywords: [],
				hasKeywords: false,
				pageHits: [],
				review: {
					id: 259162,
					revProgramElement: '011A',
					revBudgetLineItems: '010',
					primaryClassLabel: 'Unknown',
					primaryPlannedTransitionPartner: 'Unknown',
					serviceAdditionalMissionPartners: 'Unknown',
					reviewStatus: 'Partial Review (Service)',
					budgetYear: '2022',
					budgetType: 'odoc',
					primaryReviewStatus: 'Finished Review',
					serviceReviewStatus: 'Partial Review',
					primaryReviewer: 'Srinivasan, Sridhar',
					serviceReviewer: 'Chapa, Joseph (Air Force)',
					createdAt: '2021-11-10T13:59:29.065Z',
					updatedAt: '2021-11-10T13:59:29.065Z',
					budgetActivityNumber: '01',
					appropriationNumber: '3400F',
					serviceAgency: 'Air Force (AF)',
					totalBudget: 0,
					primaryReviewerEmail: null,
					serviceReviewerEmail: null,
					serviceSecondaryReviewerEmail: null,
				},
			};
			const actual = await target.getESProjectData(req, 'Test');
			assert.deepStrictEqual(actual, expected);
			done();
		});

		it('should utilize the portfolio APIs (create, delete, get all, get one, restore', async (done) => {
			const req = {
				body: {
					name: 'AI',
					id: 1,
				},
			};

			const target = new JBookDataHandler(opts);

			const expectedGetOne = {
				id: 1,
				name: 'AI Inventory',
				description: 'AI Inventory portfolio description',
				user_ids: [],
				tags: [],
				deleted: false,
			};

			const expectedGetAll = [
				{
					id: 1,
					name: 'AI Inventory',
					description: 'AI Inventory portfolio description',
					user_ids: [],
					tags: [],
					deleted: false,
				},
			];

			const expectedDelete = {
				deleted: true,
			};

			const expectedRestored = {
				deleted: false,
			};

			const expectedEdit = {
				name: 'AI',
				description: undefined,
				user_ids: undefined,
				tags: undefined,
			};

			const actualGetOne = await target.getPortfolio(req, 'Test');
			const actualGetAll = await target.getPortfolios(req, 'Test');
			const actualDelete = await target.deletePortfolio(req, 'Test');
			const actualRestored = await target.restorePortfolio(req, 'Test');
			const actualEdit = await target.editPortfolio(req, 'Test');

			assert.deepStrictEqual(actualGetOne, expectedGetOne);
			assert.deepStrictEqual(actualGetAll, expectedGetAll);
			assert.deepStrictEqual(actualDelete, expectedDelete);
			assert.deepStrictEqual(actualRestored, expectedRestored);
			assert.deepStrictEqual(actualEdit, expectedEdit);

			done();
		});
	});

	describe('#getPortfolios', () => {
		it('should get all portfolios', async (done) => {
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
					EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				},
				dataLibrary: {
					queryElasticSearch(name, index, query, userId) {
						return Promise.resolve(esReturn);
					},
					getESRequestConfig() {
						return Promise.resolve({});
					},
				},
				portfolio: {
					findAll: () => {
						return Promise.resolve({
							data: [
								{
									name: 'testPortfolio',
									description: 'testPortfolio description',
									tags: [],
									user_ids: [],
								},
							],
						});
					},
				},
			};
			const req = {};
			const target = new JBookDataHandler(opts);
			const expected = {
				data: [
					{
						name: 'testPortfolio',
						description: 'testPortfolio description',
						tags: [],
						user_ids: [],
					},
				],
			};
			const actual = await target.getPortfolios(req, 'Test');
			assert.deepStrictEqual(expected, actual);
			done();
		});
	});
});
