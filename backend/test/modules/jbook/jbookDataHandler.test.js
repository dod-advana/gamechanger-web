const assert = require('assert');
const JBookDataHandler = require('../../../node_app/modules/jbook/jbookDataHandler');
const { constructorOptionsMock } = require('../../resources/testUtility');

const {
	keywordData,
	esData,
	portfolioData,
	reviewData,
	userReviews,
	commentData,
	budgetDropdownData,
} = require('../../resources/mockResponses/jbookMockData');

describe('JBookDataHandler', function () {
	describe('#getProjectData', () => {
		let review = reviewData['pdoc'];
		let keywords = keywordData['pdoc'];
		let esReturn = esData['pdoc'];
		let portfolios = portfolioData;

		const opts = {
			...constructorOptionsMock,
			constants: {
				GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
				GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
			},
			pdoc: {
				findAll() {
					return Promise.resolve();
				},
			},
			rdoc: {
				findAll() {
					return Promise.resolve();
				},
			},
			om: {
				findAll() {
					return Promise.resolve();
				},
			},
			db: {
				jbook: {
					query() {
						return Promise.resolve(keywords);
					},
				},
			},
			reviewer: {
				findOne() {
					return Promise.resolve([]);
				},
			},
			dataLibrary: {
				queryElasticSearch() {
					return Promise.resolve(esReturn);
				},
				updateDocument() {
					return Promise.resolve(true);
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
			review: {
				findAll() {
					return Promise.resolve(review);
				},
			},
			gl: {},
			userRequest: {},
			feedback: {},
		};

		it('should get the pdoc project data for ES', async (done) => {
			const req = {
				body: {
					id: 'pdoc#000075#2022#3010#07#Air%20Force%20(AF)',
					portfolioName: 'AI Inventory',
				},
			};

			const target = new JBookDataHandler(opts);

			const expected = {
				budgetType: 'pdoc',
				id: 'pdoc#2022#PB#07#000075#57#N/A#3010',
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
				budgetSubActivityTitle: 'Other Production Charges',
				org_jbook_desc_s: 'Air Force (AF)',
				org_code_s: 'AF',
				key_review_s: 'pdoc#000075#2022#3010#07#Air Force (AF)',
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
				reviews: {
					'Test AI Inventory': {
						portfolioName: 'Test AI Inventory',
						primaryReviewerEmail: null,
						serviceReviewerEmail: null,
						serviceSecondaryReviewerEmail: null,
					},
					'AI Inventory': {
						portfolioName: 'AI Inventory',
						id: 233170,
						budgetLineItem: '000073',
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
						poc_mp_checklist_S: '{}',
						service_mp_checklist_S: '{}',
						appropriationNumber: '3010F',
						serviceAgency: 'Air Force (AF)',
						primaryReviewerEmail: null,
						serviceReviewerEmail: null,
						serviceSecondaryReviewerEmail: null,
					},
				},
				sort: undefined,
			};

			const actual = await target.getESProjectData(req, 'Test');
			assert.deepEqual(actual, expected);
			done();
		});

		it('should get the rdoc project data for ES', async (done) => {
			const req = {
				body: {
					useElasticSearch: true,
					type: 'RDT&E',
					id: 'rdoc#0101122F#674797#2022#3600#07#Air%20Force%20(AF)',
					portfolioName: 'TesAI Inventoryt',
				},
			};

			const target = new JBookDataHandler(opts);

			const expected = {
				budgetType: 'pdoc',
				id: 'pdoc#2022#PB#07#000075#57#N/A#3010',
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
				budgetSubActivityTitle: 'Other Production Charges',
				org_jbook_desc_s: 'Air Force (AF)',
				org_code_s: 'AF',
				key_review_s: 'pdoc#000075#2022#3010#07#Air Force (AF)',
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
				reviews: {
					'AI Inventory': {
						portfolioName: 'AI Inventory',
						id: 233170,
						budgetLineItem: '000073',
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
						poc_mp_checklist_S: '{}',
						service_mp_checklist_S: '{}',
						appropriationNumber: '3010F',
						serviceAgency: 'Air Force (AF)',
						primaryReviewerEmail: null,
						serviceReviewerEmail: null,
						serviceSecondaryReviewerEmail: null,
					},
					'Test AI Inventory': {
						portfolioName: 'Test AI Inventory',
						primaryReviewerEmail: null,
						serviceReviewerEmail: null,
						serviceSecondaryReviewerEmail: null,
					},
				},
				sort: undefined,
			};
			const actual = await target.getESProjectData(req, 'Test');
			assert.deepStrictEqual(actual, expected);
			done();
		});

		it('should get the odoc project data for ES', async (done) => {
			const req = {
				body: {
					useElasticSearch: true,
					type: 'O&M',
					id: 'odoc#120#132#2022#2020A#01Army',
					portfolioName: 'AI Inventory',
				},
			};

			const target = new JBookDataHandler(opts);

			const expected = {
				budgetType: 'pdoc',
				id: 'pdoc#2022#PB#07#000075#57#N/A#3010',
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
				budgetSubActivityTitle: 'Other Production Charges',
				org_jbook_desc_s: 'Air Force (AF)',
				org_code_s: 'AF',
				key_review_s: 'pdoc#000075#2022#3010#07#Air Force (AF)',
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
				reviews: {
					'AI Inventory': {
						portfolioName: 'AI Inventory',
						id: 233170,
						budgetLineItem: '000073',
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
						poc_mp_checklist_S: '{}',
						service_mp_checklist_S: '{}',
						appropriationNumber: '3010F',
						serviceAgency: 'Air Force (AF)',
						primaryReviewerEmail: null,
						serviceReviewerEmail: null,
						serviceSecondaryReviewerEmail: null,
					},
					'Test AI Inventory': {
						portfolioName: 'Test AI Inventory',
						primaryReviewerEmail: null,
						serviceReviewerEmail: null,
						serviceSecondaryReviewerEmail: null,
					},
				},
				sort: undefined,
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

			const expectedGetAll = {
				privatePortfolios: [
					{
						deleted: false,
						description: 'AI Inventory portfolio description',
						id: 1,
						name: 'AI Inventory',
						tags: [],
						user_ids: [],
					},
				],
				publicPortfolios: [
					{
						deleted: false,
						description: 'AI Inventory portfolio description',
						id: 1,
						name: 'AI Inventory',
						tags: [],
						user_ids: [],
					},
				],
			};

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

	describe('#portfolios', () => {
		it('should get all portfolios', async (done) => {
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
					EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				},
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(esReturn);
					},
					getESRequestConfig() {
						return Promise.resolve({});
					},
				},
				portfolio: {
					findAll: () => {
						return Promise.resolve([
							{
								name: 'testPortfolio',
								description: 'testPortfolio description',
								isPrivate: false,
								tags: [],
								user_ids: [],
								creator: 1,
								admins: [],
								deleted: false,
							},
						]);
					},
				},
			};
			const req = {
				body: {
					id: 1,
				},
			};
			const target = new JBookDataHandler(opts);
			const expected = {
				privatePortfolios: [
					{
						name: 'testPortfolio',
						description: 'testPortfolio description',
						isPrivate: false,
						tags: [],
						user_ids: [],
						creator: 1,
						admins: [],
						deleted: false,
					},
				],
				publicPortfolios: [
					{
						name: 'testPortfolio',
						description: 'testPortfolio description',
						isPrivate: false,
						tags: [],
						user_ids: [],
						creator: 1,
						admins: [],
						deleted: false,
					},
				],
			};

			const actual = await target.getPortfolios(req, 'Test');
			assert.deepStrictEqual(expected, actual);
			done();
		});
	});

	// just for cog complexity..
	const updateForVote = ({ upvotes, downvotes }, { where }) => {
		if (upvotes && upvotes[0] === 'test' && downvotes && downvotes.length === 0 && where.id) {
			return [1];
		}
		return [0];
	};

	describe('#comments', () => {
		it('should get all comments of a specific thread', async (done) => {
			let opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
					EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				},
				comments: {
					findAll: ({ where: { docID, portfolioName } }) => {
						if (docID && portfolioName) {
							return Promise.resolve({
								data: commentData,
							});
						}
						return Promise.resolve('missing a field to get comment thread');
					},
				},
			};
			const req = { body: { docID: 3, portfolioName: 'AI Inventory' } };

			const target = new JBookDataHandler(opts);
			const expected = { data: commentData };
			const actual = await target.getCommentThread(req, 'test');
			assert.deepStrictEqual(actual, expected);
			done();
		});

		it('should get create a comment with docID, portfolioName, and message', async (done) => {
			let opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
					EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				},
				comments: {
					create: ({ docID, portfolioName, message, deleted }) => {
						return docID && portfolioName && message && deleted === false;
					},
				},
			};
			const req = { body: { docID: 3, portfolioName: 'AI Inventory', message: 'test message' } };

			const target = new JBookDataHandler(opts);
			const expected = true;
			const actual = await target.createComment(req, 'test');
			assert.deepStrictEqual(actual, expected);
			done();
		});

		it('should get delete a comment (set deleted to true) using comment ID', async (done) => {
			let opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
					EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				},
				comments: {
					update: ({ deleted }, { where }) => {
						if (deleted === true && where.id) {
							return [1];
						}
						return [0];
					},
				},
			};
			const req = { body: { id: 3 } };

			const target = new JBookDataHandler(opts);
			const expected = { deleted: true };
			const actual = await target.deleteComment(req, 'test');
			assert.deepStrictEqual(actual, expected);
			done();
		});

		it('should vote on a comment depending on comment ID and field (upvotes or downvotes)', async (done) => {
			let opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
					EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				},
				comments: {
					findOne: ({ where }) => {
						if (where.id) {
							return commentData[0];
						}
					},
					update: updateForVote,
				},
			};
			const req = { body: { id: 3, field: 'upvotes', author: 'test' } };
			const target = new JBookDataHandler(opts);
			const expected = { updated: true };
			const actual = await target.voteComment(req, 'test');
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});

	describe('#getUserSpecificReviews', () => {
		it('should get all reviews for user', async (done) => {
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
					EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				},
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(userReviews);
					},
				},
			};
			const req = {
				body: {
					email: 'test@test.com',
				},
			};
			const target = new JBookDataHandler(opts);
			const expected = {
				docs: [
					{
						appropriationNumber: '2040',
						budgetActivityNumber: '03',
						budgetLineItem: 'MO2',
						budgetType: 'rdoc',
						budgetYear: '2023',
						createdAt: '2022-07-29T15:35:42.958Z',
						hasKeywords: false,
						id: 'rdoc#2023#PB#03#0603002A#21#N/A#2040#MO2',
						keywords: [],
						portfolioName: 'AI Inventory',
						programElement: '0603002A',
						projectNum: 'MO2',
						projectTitle: 'Traumatic Brain Injury (TBI) Treatment Adv Tech',
						reviewStatus: 'Needs Review',
						serviceAgency: 'Army',
						serviceReviewStatus: 'Partial Review',
						serviceSecondaryReviewer: 'Test',
						serviceSecondaryReviewerEmail: 'test@test.com',
						updatedAt: '2022-07-29T15:35:42.958Z',
					},
				],
			};
			const actual = await target.getUserSpecificReviews(req, 'Test');
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});

	describe('#getBudgetDropdownData', () => {
		it('get all options for review dropdowns', async (done) => {
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
					EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				},
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve({
							body: {
								aggregations: {
									transitionPartners: {
										buckets: [
											{
												key: 'Army',
												doc_count: 10018,
											},
											{
												key: 'Navy',
												doc_count: 9447,
											},
											{
												key: 'Air Force (AF)',
												doc_count: 6754,
											},
										],
									},
								},
							},
						});
					},
				},
				reviewer: {
					findAll: ({ where }) => {
						let name = 'Test Testerson';
						switch (where.type) {
							case 'service':
								name = 'Test Testerman';
								break;
							case 'secondary':
								name = 'Test Testeroni';
								break;
							default:
								break;
						}
						return Promise.resolve([
							{
								name,
							},
						]);
					},
				},
				user: {
					findAll: () => {
						return Promise.resolve([
							{
								id: 88,
								first_name: 'Test',
								last_name: 'Testo',
								organization: 'Booz Allen Hamilton',
								job_title: 'Software Engineer',
								email: 'test@test.com',
								phone_number: '5555555555',
							},
						]);
					},
				},
			};
			const req = {};
			const target = new JBookDataHandler(opts);
			const actual = await target.getBudgetDropdownData(req, 'Test');
			assert.deepStrictEqual(actual, budgetDropdownData);
			done();
		});
	});

	describe('bulk upload', () => {
		// create excel file in test/resources/bulkUpload/excelfile.xlsx

		let mockReview = [
			{
				dataValues: {
					// fix these when we have a real excl
					id: 1,
					primary_reviewer: 'tester mctestfaace',
					primary_class_label: 'amazing test',
					service_reviewer: 'tester mctestface jr',
					primary_ptp: 'Army',
					service_mp_add: 'Academia',
					primary_review_notes: 'amazing job you will be handsomely rewarded in the near future',
					latest_class_label: 'amazing test',
					primary_review_status: 'Partial Review',
					review_status: 'Partial Review (Service)',
				},
			},
			{
				dataValues: {
					// fix these when we have a real excl
					id: 2,
					primary_reviewer: 'tester mctestfaace',
					primary_class_label: 'amazing test',
					service_reviewer: 'tester mctestface jr',
					primary_ptp: 'Army',
					service_mp_add: 'Academia',
					primary_review_notes: 'amazing job you will be handsomely rewarded in the near future',
					latest_class_label: 'amazing test',
					primary_review_status: 'Partial Review',
					review_status: 'Partial Review (Service)',
				},
			},
		];
		let mockES = {
			took: 2,
			timed_out: false,
			_shards: {
				total: 3,
				successful: 3,
				skipped: 0,
				failed: 0,
			},
			hits: {
				total: {
					value: 1,
					relation: 'eq',
				},
				max_score: 8.7481985,
				hits: [
					{
						_index: 'jbook_nov16',
						_type: '_doc',
						_id: 'rdoc#2023#PB#08#0308609V#97#DEFENSE COUNTERINTELLIGENCE AND SECURITY AGENCY#0400#0000',
						_score: 8.7481985,
						_source: {
							type_s: 'rdte',
							key_s: 'rdoc#2023#PB#08#0308609V#97#DEFENSE COUNTERINTELLIGENCE AND SECURITY AGENCY#0400#0000',
							priorYearAmount_d: '0.0',
							currentYearAmount_d: '0.0',
							continuing_b: true,
							projectMissionDescription_t:
								'This program is in Budget Activity 8, Software and Digital Technology Pilot Program.  This budget activity includes funding provided for expenses necessary for agile development, test and evaluation, production and modification, and the operation and maintenance of these programs.',
							projectNum_s: '0000',
							projectNum_t: '0000',
							projectTitle_s: 'National Industrial Security System',
							projectTitle_t: 'National Industrial Security System',
							programElementTitle_t: 'Software and Digital Technology Pilot Program',
							serviceAgency_s: 'DEPARTMENT OF THE DEFENSE',
							budgetCycle_s: 'PB',
							budgetYear_s: '2023',
							appropriationNumber_s: '0400',
							appropriationTitle_t: 'Research, Development, Test & Evaluation, Defense-Wide',
							budgetActivityNumber_s: '08',
							budgetActivityTitle_t: 'Software and Digital Technology Pilot Programs',
							programElement_s: '0308609V',
							programElement_t: '0308609V',
							missionDescBudgetJustification_t:
								'Program management office with programmatic oversight of all industrial security current capabilities to include the system of record for facilities clearance information and industrial security oversight, the official system that allows DCSA to improve assessment and mitigation of risks related to contractors under Foreign Ownership, Control, or Influence (FOCI), and the newly developed system repository for DD-254 forms. PM National Industrial Security System (NISS) will manage all industrial security emerging capabilities to include technical modernization onto a Common Operating System (COS) Cloud Environment and the integration of operational and other data sources to include government, public, and paid.',
							by1_request_d: '14.749',
							proj_fund_by2_d: '58.508',
							proj_fund_by3_d: '56.063',
							proj_fund_by4_d: '49.823',
							proj_fund_by5_d: '58.844',
							proj_fund_ctc_s: 'Continuing',
							dtic_pdf_location_s: 'U_0308609V_8_PB_2023.pdf',
							dtic_pdf_page_s: 1,
							org_jbook_desc_s: 'Defense Counterintelligence and Security Agency (DCSA)',
							org_code_s: 'DCSA',
							totalCost_d: 237.987,
							pdf_location_s: 'bronze/jbook/pdfs/rdte/2023/dod/RDTE_MJB_DW_Vol5_PB_2023.pdf',
							key_review_s:
								'rdoc#0308609V#0000#2023#0400#08#Defense Counterintelligence and Security Agency (DCSA)',
							r2_adjustments_n: [
								{
									Adj_OtherAdj_Title_t: 'Adjustment to budget',
									Adj_Total_PY_d: '0.0',
								},
							],
							r_2a_accomp_pp_n: [
								{
									Accomp_Fund_PY_d: '0.0',
									PlanPrgrm_Fund_BY1Base_d: '4.949',
									PlanPrgrm_Fund_BY1Base_Text_t: 'test',
									PlanPrgrm_Fund_BY1_d: '4.949',
									Accomp_Title_text_t:
										'National Industrial Security System Software Pilot Program (NISS) â€“ Sustainment',
									Accomp_Desc_text_t:
										'Plan and execute sustainment strategies for the National Industrial Security System (NISS) for Facility Clearances (FCL), National Industrial Security Program (NISP) Contract Classification System (NCCS 2.0) and the 847 Application in support of Public Law 116-92, Sect. 847.  Ensure the continuous Authority to Operate (ATO) for NISS FCL and continued delivery of secure, automated, end-to-end IT architecture for the DCSA Critical Technology Protection (CTP) Directorate to enable continuity of operation for entity vetting, risk identification and mitigation for cleared industry.',
								},
								{
									Accomp_Fund_PY_d: '0.0',
									PlanPrgrm_Fund_BY1Base_d: '9.8',
									PlanPrgrm_Fund_BY1Base_Text_t: 'test',
									PlanPrgrm_Fund_BY1_d: '9.8',
									Accomp_Title_text_t: 'NISS â€“ Development',
									Accomp_Desc_text_t:
										'Provide development activities for NISS, NCCS 2.0, and 847 Application to include multiple data source integrations and enhanced workflow for risk assessment and analytic capabilities. Support the continuous delivery of secure, automated, IT capabilities for the DCSA Critical Technology Protection (CTP) Directorate to enable entity vetting, risk identification and mitigation for cleared industry.',
								},
							],
							keyword_n: [],
							ai_predictions: {
								'AI Inventory': {
									confidence: 0.7870790250235937,
									top_class: 'Core AI',
								},
							},
						},
					},
				],
			},
		};

		const opts = {
			...constructorOptionsMock,
			constants: {
				GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
				GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
			},
			pdoc: {
				findAll() {
					return Promise.resolve();
				},
			},
			rdoc: {
				findAll() {
					return Promise.resolve();
				},
			},
			om: {
				findAll() {
					return Promise.resolve();
				},
			},
			db: {
				jbook: {
					query() {
						return Promise.resolve();
					},
				},
			},
			reviewer: {
				findOne() {
					return Promise.resolve([]);
				},
			},
			dataLibrary: {
				queryElasticSearch(clientName = 'test', esIndex = 'testIndex', esQuery, userId = 'test') {
					let search = esQuery.query.bool.must.find((item) => item.term.budgetLineItem_s !== undefined);
					if (search === undefined) {
						search = esQuery.query.bool.must.find((item) => item.term.projectNum_s !== undefined);
					}
					if (search.term.budgetLineItem_s) {
						search = search.term.budgetLineItem_s;
					} else {
						search = search.term.projectNum_s;
					}
					let results;
					switch (search) {
						case '1':
							results = { ...mockES };
							mockES.projectNum_s = '1';
							break;

						case '2':
							results = { ...mockES };
							mockES.budgetLineItem_s = '2';
							break;

						default:
							results = [];
							break;
					}
					return Promise.resolve({ body: results });
				},
				updateDocument() {
					return Promise.resolve(true);
				},
			},
			portfolio: {
				findOne() {
					return Promise.resolve();
				},
				findAll() {
					return Promise.resolve();
				},
				update() {
					return Promise.resolve([1]);
				},
			},
			review: {
				findAll({ where }) {
					let search = where.budget_line_item;
					let results;
					switch (search) {
						case '1':
							results = [mockReview[0]];
							break;

						case '2':
							results = [mockReview[1]];
							break;

						default:
							results = [];
							break;
					}
					return Promise.resolve(results);
				},
				update: async (updateValues, whereObj) => {
					const { where } = whereObj;
					const search = where.id;
					let results;
					switch (search) {
						case '1':
							results = [{ ...mockReview[0], ...updateValues }];
							break;
						case '2':
							results = [{ ...mockReview[1], ...updateValues }];
							break;
						default:
							results = [];
							break;
					}
					return Promise.resolve(results);
				},
				create: async (reviewData) => {
					return { ...reviewData, id: 3, jbook_ref_id: 'jbook_test_3' };
				},
			},
			gl: {},
			userRequest: {},
			feedback: {},
		};

		it('parses exccel file correctly', async () => {
			const target = new JBookDataHandler(opts);
			console.log('welcome to the excel parsing experience');
			const actual = await target.parseExcel('test/resources/bulkUpload/test-excel.xlsx', {
				name: 'testPortfolio',
			});
			const expected = [
				{
					primary_reviewer: 'Brooks, Andrew',
					primary_class_label: 'Not AI',
					service_reviewer: 'Blowers, Misty (USMC US Marine Corp)',
					primary_ptp: 'Air Force',
					service_mp_add: null,
					primary_review_notes: "hello it's demo time",
					budget_year: '2023',
					budget_type: 'pdoc',
					appn_num: '3080',
					budget_activity: '04',
					program_element: null,
					budget_line_item: '1',
					agency: 'Air Force (AF)',
					jbook_ref_id: 'pdoc#1#2023#3080#04#Air Force (AF)',
					portfolio_name: 'testPortfolio',
					latest_class_label: 'Not AI',
					primary_review_status: 'Finished Review',
					review_status: 'Partial Review (Service)',
				},
				{
					primary_reviewer: 'Brooks, Andrew',
					primary_class_label: 'Not AI',
					service_reviewer: 'Blowers, Misty (USMC US Marine Corp)',
					primary_ptp: 'Air Force',
					service_mp_add: null,
					primary_review_notes: "hello it's demo time",
					budget_year: '2023',
					budget_type: 'rdoc',
					appn_num: '3620',
					budget_activity: '08',
					program_element: '2',
					budget_line_item: '2',
					agency: 'Air Force (AF)',
					jbook_ref_id: 'rdoc#2#2#2023#3620#08#Air Force (AF)',
					portfolio_name: 'testPortfolio',
					latest_class_label: 'Not AI',
					primary_review_status: 'Finished Review',
					review_status: 'Partial Review (Service)',
				},
			];
			console.log(actual);
			assert.deepStrictEqual(actual, expected);
		});

		it('parses and uploads each row', async () => {
			console.log('welcome to the bulk upload testing ');
			const target = new JBookDataHandler(opts);
			const req = {
				body: {
					portfolio: 'AI Inventory',
					file: { path: 'test/resources/bulkUpload/test-excel.xlsx' },
				},
			};
			const expected = {
				dupes: [],
				failedRows: [],
				written: 2,
			};
			const actual = await target.bulkUpload(req, 'testID');
			delete actual.time;
			assert.deepStrictEqual(actual, expected);
		});
	});
});
