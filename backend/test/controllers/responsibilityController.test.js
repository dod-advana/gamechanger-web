const assert = require('assert');
const { ResponsibilityController } = require('../../node_app/controllers/responsibilityController');
const { constructorOptionsMock, reqMock } = require('../resources/testUtility');

const esRawResults= {
	body: {
		took: 4, timed_out: false, _shards: {},
		hits: { 
			total: { value: 1, relation: 'eq' }, 
			max_score: 50.01322, 
			hits: [{
				_index: 'gamechanger_sans_abbreviations',
				_type: '_doc',
				_id: 'test',
				_score: 29.58102,
				_source: {
					id: 'test',
					doc_num: 'test',
					paragraphs: [{
						type: 'paragraph',
						filename: 'test',
						par_inc_count: 99,
						id: 'test',
						par_count_i: 9,
						page_num_i: 6,
						par_raw_text_t: 'test',
						entities: {}
					}]
				},
				fields: {},
				inner_hits: { 
					paragraphs: {
						hits: { 
							total: [Object], 
							max_score: 194.13794, 
							hits: [{
								_index: 'gamechanger_sans_abbreviations',
								_type: '_doc',
								_id: 'test',
								_nested: {},
								_score: 194.13794,
								fields: {
								'paragraphs.par_inc_count': [ 65 ],
								'paragraphs.filename': [ 'test.pdf' ],
								'paragraphs.par_raw_text_t': ['test']
								}
							}] 
						}
					}
				}
			}] 
		}
	},
	statusCode: 200,
	headers: {},
	meta: {}
};

describe('ResponsibilityController', function () {
	describe('#getOtherEntResponsibilityFilterList', () => {
		let responsibilities =  [
			{otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency|Defense Intelligence Agency'},
			{otherOrganizationPersonnel: null},
			{otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency|Defense Intelligence Agency'},
			{otherOrganizationPersonnel: null},
			{otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency|Defense Intelligence Agency'},
		];
		const opts = {
			...constructorOptionsMock,
			responsibilities: {
				findAndCountAll(data) {
					return Promise.resolve(responsibilities);
				},
				findAll(data) {
					return Promise.resolve(responsibilities);
				}
			}
		};

		it('should get the other ent responsibilities filter list', async () => {
			const target = new ResponsibilityController(opts);

			const req = {
				...reqMock,
				body: {}
			};

			let resCode;
			let resMsg;

			const res = {
				status(code) {
					resCode = code;
					return this;
				},
				send(msg) {
					resMsg = msg;
					return this;
				}
			};

			try {
				await target.getOtherEntResponsibilityFilterList(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = ['Defense Intelligence Agency', 'National Geospatial-Intelligence Agency', 'null'];
			assert.deepStrictEqual(resMsg, expected);

		});
	});
	
	describe('#getResponsibilityData', () => {
		let responsibilities = [];
		const opts = {
			...constructorOptionsMock,
			responsibilities: {
				findAndCountAll(data) {
					return Promise.resolve(responsibilities);
				}
			}
		};

		it('should get the responsibilities', async () => {
			responsibilities = {count: 84, rows: [
				{id: 0, filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  responsibilityText: 'All-Source Intelligence Analysis', organizationPersonnel: 'The Director, DIA,', otherOrganizationPersonnel: '', documentsReferenced: []}, 
				{id: 1, filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  responsibilityText: 'All-Source Intelligence Analysis. Promulgate and manage a program to establish community management of Defense Intelligence analytic resources, including the intelligence production centers of the Military Departments, toward a unified production framework that is consistent with National Intelligence policies and priorities.', organizationPersonnel: 'The Director, DIA,', otherOrganizationPersonnel: '', documentsReferenced: []}, 
				{id: 2, filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  responsibilityText: 'All-Source Intelligence Analysis. Manage, organize, train, and develop the expertise of the DIA analytic and Defense Intelligence workforce; provide and evaluate timely all-source intelligence products to meet customer needs that conform to standards on analytic integrity and sourcing.', organizationPersonnel: 'The Director, DIA,', otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', documentsReferenced: []}, 
				{id: 3, filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  responsibilityText: 'All-Source Intelligence Analysis. Collect and evaluate Open-Source Intelligence (OSINT) and make it fully available for use in Defense Intelligence products.  Serve as the DoD Lead Component for OSINT and develop policies and procedures to fully leverage OSINT within Defense Intelligence.', organizationPersonnel: 'The Director, DIA,', otherOrganizationPersonnel: '', documentsReferenced: []}, 
				{id: 4, filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  responsibilityText: 'All-Source Intelligence Analysis. Maximize resources by assigning defined all-source intelligence analytical responsibilities within DIA and to each COCOM and Military Service Intelligence Center based on capabilities, workforce characteristics, and mission requirements, and manage capabilities to maintain a surge capability.', organizationPersonnel: 'The Director, DIA,', otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', documentsReferenced: []}, 
				{id: 5, filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  responsibilityText: 'All-Source Intelligence Analysis. Provide Defense Intelligence support for the policies and planning activities of the Heads of the DoD Components and, as appropriate, for similar activities of non-DoD national authorities to identify foreign emerging challenges to national security and homeland defense.', organizationPersonnel: 'The Director, DIA,', otherOrganizationPersonnel: '', documentsReferenced: []}, 
				{id: 6, filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  responsibilityText: 'All-Source Intelligence Analysis. Prepare intelligence assessments and estimates concerning transfers of technology, goods, services, munitions, and associated transfer mechanisms and participate in interagency, national, and international fora on such transfer matters pursuant to DoD Directives 5105.72 and', organizationPersonnel: 'The Director, DIA,', otherOrganizationPersonnel: '', references: 'DoDD 5105.72'}, 
				{id: 7, filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  responsibilityText: 'All-Source Intelligence Analysis. Support the DoD weapons system acquisition process by producing threat assessments within DIA or validating assessments produced by other Defense Intelligence   Components for all major DoD acquisition programs pursuant to DoD Directive 5000.1 (Reference (n)).', organizationPersonnel: 'The Director, DIA,', otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', references: 'DoDD 5000.1'}, 
				{id: 8, filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  responsibilityText: 'All-Source Intelligence Analysis. Provide Defense Intelligence support to disrupt Weapons of Mass Destruction (WMD) proliferation networks.', organizationPersonnel: 'The Director, DIA,', otherOrganizationPersonnel: '', documentsReferenced: []}, 
				{id: 9, filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  responsibilityText: 'All-Source Intelligence Analysis. Operate the Joint Intelligence Task Force for Combating Terrorism to provide prompt analysis and dissemination of intelligence on terrorist threats; set DoD terrorist threat levels; and provide all-source intelligence analysis in support of counterterrorism plans and operations pursuant to E.O. 13388 (Reference (o)) and DoD Directive 2000.12 (Reference (p)).', organizationPersonnel: 'The Director, DIA,', otherOrganizationPersonnel: '', references: 'Executive Order 13388, DoDD 2000.12'}
			]};
			const target = new ResponsibilityController(opts);

			const req = {
				...reqMock,
				body: {}
			};

			let resCode;
			let resMsg;

			const res = {
				status(code) {
					resCode = code;
					return this;
				},
				send(msg) {
					resMsg = msg;
					return this;
				}
			};

			try {
				await target.getResponsibilityData(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {count: 84, rows: [{otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 0, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 1, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Promulgate and manage a program to establish community management of Defense Intelligence analytic resources, including the intelligence production centers of the Military Departments, toward a unified production framework that is consistent with National Intelligence policies and priorities.'}, {otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 2, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Manage, organize, train, and develop the expertise of the DIA analytic and Defense Intelligence workforce; provide and evaluate timely all-source intelligence products to meet customer needs that conform to standards on analytic integrity and sourcing.'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 3, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Collect and evaluate Open-Source Intelligence (OSINT) and make it fully available for use in Defense Intelligence products.  Serve as the DoD Lead Component for OSINT and develop policies and procedures to fully leverage OSINT within Defense Intelligence.'}, {otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 4, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Maximize resources by assigning defined all-source intelligence analytical responsibilities within DIA and to each COCOM and Military Service Intelligence Center based on capabilities, workforce characteristics, and mission requirements, and manage capabilities to maintain a surge capability.'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 5, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Provide Defense Intelligence support for the policies and planning activities of the Heads of the DoD Components and, as appropriate, for similar activities of non-DoD national authorities to identify foreign emerging challenges to national security and homeland defense.'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 6, organizationPersonnel: 'The Director, DIA,', references: 'DoDD 5105.72', responsibilityText: 'All-Source Intelligence Analysis. Prepare intelligence assessments and estimates concerning transfers of technology, goods, services, munitions, and associated transfer mechanisms and participate in interagency, national, and international fora on such transfer matters pursuant to DoD Directives 5105.72 and'}, {otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 7, organizationPersonnel: 'The Director, DIA,', references: 'DoDD 5000.1', responsibilityText: 'All-Source Intelligence Analysis. Support the DoD weapons system acquisition process by producing threat assessments within DIA or validating assessments produced by other Defense Intelligence   Components for all major DoD acquisition programs pursuant to DoD Directive 5000.1 (Reference (n)).'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 8, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Provide Defense Intelligence support to disrupt Weapons of Mass Destruction (WMD) proliferation networks.'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 9, organizationPersonnel: 'The Director, DIA,', references: 'Executive Order 13388, DoDD 2000.12', responsibilityText: 'All-Source Intelligence Analysis. Operate the Joint Intelligence Task Force for Combating Terrorism to provide prompt analysis and dissemination of intelligence on terrorist threats; set DoD terrorist threat levels; and provide all-source intelligence analysis in support of counterterrorism plans and operations pursuant to E.O. 13388 (Reference (o)) and DoD Directive 2000.12 (Reference (p)).'}]};
			assert.deepStrictEqual(responsibilities, expected);

		});
	});

	describe('#storeResponsibilityReports', () => {
		let responsibility_reports = [];
		const opts = {
			...constructorOptionsMock,
			responsibility_reports: {
				findOrCreate(data) {
					const report = {id: 1, ...data.defaults};
					responsibility_reports.push(report);
					return Promise.resolve([report]);
				}
			}
		};

		it('should create a report successfully', async () => {
			const target = new ResponsibilityController(opts);

			const req = {
				...reqMock,
				body: {id: 1, issue_description: 'Test'}
			};

			let resCode;
			let resMsg;

			const res = {
				status(code) {
					resCode = code;
					return this;
				},
				send(msg) {
					resMsg = msg;
					return this;
				}
			};

			try {
				await target.storeResponsibilityReports(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = [{id: 1, issue_description: 'Test', reporter_hashed_username: '27d1ca9e10b731476b7641eae2710ac0', responsibility_id: 1}];
			const expectedReport = {id: 1, issue_description: 'Test', reporter_hashed_username: '27d1ca9e10b731476b7641eae2710ac0', responsibility_id: 1};
			assert.deepStrictEqual(responsibility_reports, expected);
			assert.deepStrictEqual(resMsg, expectedReport);
			assert.strictEqual(resCode, 200);

		});

		it('should return 400 since a var is missing', async () => {
			const target = new ResponsibilityController(opts);

			const req = {
				...reqMock,
				body: {id: 1}
			};

			let resCode;
			let resMsg;

			const res = {
				status(code) {
					resCode = code;
					return this;
				},
				send(msg) {
					resMsg = msg;
					return this;
				}
			};

			try {
				await target.storeResponsibilityReports(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expectedReport = 'Responsibility id not included or the description of the issue not included.';
			assert.deepStrictEqual(resMsg, expectedReport);
			assert.strictEqual(resCode, 400);

		});
	});

	describe('#queryOneDocES', () => {
		const dataApi = {
			queryElasticSearch: async (esClientName, esIndex, esQuery, userId) => {
				return Promise.resolve(esRawResults);
			}
		}

		const constants = {
			GAME_CHANGER_OPTS: {
				index: 'gamechanger'
			}
		}

		const opts = {
			...constructorOptionsMock,
			dataApi,
			constants
		};

		it('should get back a list of paragraphs for a document and the paragraph number for the string', async () => {
			const target = new ResponsibilityController(opts);

			let resCode;
			let resMsg;

			const res = {
				status(code) {
					resCode = code;
					return this;
				},
				send(msg) {
					resMsg = msg;
					return this;
				}
			};

			const req = {
				...reqMock,
				permissions: 'Gamechanger Admin',
				body: { 
					cloneData: { clone_name: 'gamechanger' }, 
					filename: "test", 
					text: "test" 
				},
			};

			try {
				await target.queryOneDocES(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {
				doc_id: "test",
				doc_num: "test",
				par_num: 65,
				paragraphs: [{
					type: 'paragraph',
					filename: 'test',
					par_inc_count: 99,
					id: 'test',
					par_count_i: 9,
					page_num_i: 6,
					par_raw_text_t: 'test',
					entities: {},
				}],
			};
			assert.deepStrictEqual(resMsg, expected);

		});
	});

	describe('#getParagraphNum', () => {
		const opts = {
			...constructorOptionsMock,
		};

		it('should return the paragraph number', async () => {
			const target = new ResponsibilityController(opts);

			const user = 'john';
			const raw= esRawResults;

			const paragraphNum = await target.getParagraphNum(raw, user);
			const expected = 65;
			assert.strictEqual(paragraphNum, expected);
		});
	});

	describe('#cleanUpEsResults', () => {
		const opts = {
			...constructorOptionsMock,
		};

		it('should return cleaned results', async () => {
			const target = new ResponsibilityController(opts);

			const user = 'john';
			const raw = esRawResults;

			const expected = {
				totalCount: 1,
				docs: [{
					id: 'test',
					doc_num: 'test',
					paragraphs: [{
						type: 'paragraph',
						filename: 'test',
						par_inc_count: 99,
						id: 'test',
						par_count_i: 9,
						page_num_i: 6,
						par_raw_text_t: 'test',
						entities: {}
					}]
				}]
			};

			const results = await target.cleanUpEsResults(raw, user);
			assert.deepStrictEqual(results, expected);

		});
	});

	describe('#rejectResponsibility', () => {

		const responsibilitiesList = [{
			id: 0, filename: 'test', documentTitle: 'test', organizationPersonnel: 'test', responsibilityText: 'test', otherOrganizationPersonnel: 'test', documentsReferenced: {}, status: 'active'
		}]
		const responsibilities = {
			update: async (data, where) => {
				let updates = 0;
				const responsibilityToUpdate = responsibilitiesList.find(responsibility => responsibility.id === where.where.id);
				responsibilityToUpdate.status = data.status;
				if(responsibilityToUpdate.status === 'rejected') updates++;
				return Promise.resolve([updates]);
			}
		}

		const opts = {
			...constructorOptionsMock,
			responsibilities
		};

		it('should update a resposibilities status to "rejected" and return a 200 status code', async () => {
			const target = new ResponsibilityController(opts);

			let resCode;
			let resMsg;

			const res = {
				status(code) {
					resCode = code;
					return this;
				},
				send(msg) {
					resMsg = msg;
					return this;
				}
			};

			const req = {
				...reqMock,
				body: { id: 0 },
			};

			try {
				await target.rejectResponsibility(req, res);
			} catch (e) {
				assert.fail(e);
			}
			assert.strictEqual(resCode, 200);

		});
	});

	describe('#updateResponsibility', () => {

		const responsibilitiesList = [{
			id: 0, filename: 'test', documentTitle: 'test', organizationPersonnel: 'test', responsibilityText: 'test', otherOrganizationPersonnel: 'test', documentsReferenced: {}, status: 'active'
		}]
		const responsibilities = {
			update: async (data, where) => {
				let updates = 0;
				const responsibilityToUpdate = responsibilitiesList.find(responsibility => responsibility.id === where.where.id);
				responsibilityToUpdate.status = 'revised';
				responsibilityToUpdate.organizationPersonnel = data.annotatedEntity;
				responsibilityToUpdate.responsibilityText = data.annotatedResponsibilityText;
				if(responsibilityToUpdate.status === 'revised') updates++;
				return Promise.resolve([updates]);
			}
		}

		const opts = {
			...constructorOptionsMock,
			responsibilities
		};

		it('should update a resposibility and return a 200 status code', async () => {
			const target = new ResponsibilityController(opts);

			let resCode;
			let resMsg;

			const res = {
				status(code) {
					resCode = code;
					return this;
				},
				send(msg) {
					resMsg = msg;
					return this;
				}
			};

			const req = {
				...reqMock,
				body: { 
					id: 0, 
					annotatedEntity: "updated entity", 
					annotatedResponsibilityText: "updated text"},
			};

			try {
				await target.updateResponsibility(req, res);
			} catch (e) {
				assert.fail(e);
			}
			assert.strictEqual(resCode, 200);

		});
	});

});

// {
// 	body: {
// 		took: 4,
// 		timed_out: false,
// 		_shards: { total: 3, successful: 3, skipped: 0, failed: 0 },
// 		hits: { total: { value: 1, relation: 'eq' }, max_score: 50.01322, 
// 			hits: [{
// 				_index: 'gamechanger_sans_abbreviations',
// 				_type: '_doc',
// 				_id: 'e22123744a375e3b65f19de9aa3bd208e57402c92b9eca4cd5f7ceaf43f8f305',
// 				_score: 29.58102,
// 				_source: [Object],
// 				fields: {
// 					'paragraphs.par_inc_count': [ 65 ],
// 					'paragraphs.par_raw_text_t': [
// 					'a . Develop policy and procedures to implement and manage the RD and FRD security program for access , dissemination , classification , declassification , and handling of RD and FRD information within the Do D in accordance with the Atomic Energy Act of 1954 , as amended .'
// 					],
// 					'paragraphs.filename': [ 'DoDI 5210.02 CH 2.pdf' ]
// 				},
// 				inner_hits: [Object]
// 			}] 
// 		}
// 	},
// 	statusCode: 200,
// 	headers: {
// 	  date: 'Fri, 17 Sep 2021 14:58:51 GMT',
// 	  'content-type': 'application/json; charset=UTF-8',
// 	  'content-length': '1210',
// 	  connection: 'keep-alive',
// 	  'access-control-allow-origin': '*'
// 	},
// 	meta: {
// 	  context: null,
// 	  request: { params: [Object], options: {}, id: 1 },
// 	  name: 'elasticsearch-js',
// 	  connection: {
// 		url: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
// 		id: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
// 		headers: {},
// 		deadCount: 0,
// 		resurrectTimeout: 0,
// 		_openRequests: 0,
// 		status: 'alive',
// 		roles: [Object]
// 	  },
// 	  attempts: 0,
// 	  aborted: false
// 	}
// }