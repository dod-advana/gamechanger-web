const assert = require('assert');
const { includes } = require('lodash');
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

			await target.getOtherEntResponsibilityFilterList(req, res);

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
					if(data.group){
						const parsedResults = responsiblities.map(resp => {return {dataValues:{...resp, documentCount: 10} }})
						const docOffsets = {rows: parsedResults};
						return Promise.resolve(docOffsets);
					}
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
				body: { where: [{id: 'id', value:'test'}, {id: 'otherOrganizationPersonnel', value: 'test'}, {id: 'otherOrganizationPersonnel', value: [null]}, {id: 'test', value: 'test'}] }
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

			await target.getResponsibilityData(req, res);
			
			const expected = {count: 84, rows: [{otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 0, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 1, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Promulgate and manage a program to establish community management of Defense Intelligence analytic resources, including the intelligence production centers of the Military Departments, toward a unified production framework that is consistent with National Intelligence policies and priorities.'}, {otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 2, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Manage, organize, train, and develop the expertise of the DIA analytic and Defense Intelligence workforce; provide and evaluate timely all-source intelligence products to meet customer needs that conform to standards on analytic integrity and sourcing.'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 3, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Collect and evaluate Open-Source Intelligence (OSINT) and make it fully available for use in Defense Intelligence products.  Serve as the DoD Lead Component for OSINT and develop policies and procedures to fully leverage OSINT within Defense Intelligence.'}, {otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 4, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Maximize resources by assigning defined all-source intelligence analytical responsibilities within DIA and to each COCOM and Military Service Intelligence Center based on capabilities, workforce characteristics, and mission requirements, and manage capabilities to maintain a surge capability.'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 5, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Provide Defense Intelligence support for the policies and planning activities of the Heads of the DoD Components and, as appropriate, for similar activities of non-DoD national authorities to identify foreign emerging challenges to national security and homeland defense.'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 6, organizationPersonnel: 'The Director, DIA,', references: 'DoDD 5105.72', responsibilityText: 'All-Source Intelligence Analysis. Prepare intelligence assessments and estimates concerning transfers of technology, goods, services, munitions, and associated transfer mechanisms and participate in interagency, national, and international fora on such transfer matters pursuant to DoD Directives 5105.72 and'}, {otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 7, organizationPersonnel: 'The Director, DIA,', references: 'DoDD 5000.1', responsibilityText: 'All-Source Intelligence Analysis. Support the DoD weapons system acquisition process by producing threat assessments within DIA or validating assessments produced by other Defense Intelligence   Components for all major DoD acquisition programs pursuant to DoD Directive 5000.1 (Reference (n)).'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 8, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Provide Defense Intelligence support to disrupt Weapons of Mass Destruction (WMD) proliferation networks.'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 9, organizationPersonnel: 'The Director, DIA,', references: 'Executive Order 13388, DoDD 2000.12', responsibilityText: 'All-Source Intelligence Analysis. Operate the Joint Intelligence Task Force for Combating Terrorism to provide prompt analysis and dissemination of intelligence on terrorist threats; set DoD terrorist threat levels; and provide all-source intelligence analysis in support of counterterrorism plans and operations pursuant to E.O. 13388 (Reference (o)) and DoD Directive 2000.12 (Reference (p)).'}]};
			assert.deepStrictEqual(responsibilities, expected);

		});

		it('should get the responsibilities with offsets and limits set for document view', async () => {
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
				body: { docView: true, where: [{id: 'id', value:'test'}, {id: 'otherOrganizationPersonnel', value: [null]}], page: 1 }
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

			await target.getResponsibilityData(req, res);
			
			const expected = {count: 84, rows: [{otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 0, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 1, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Promulgate and manage a program to establish community management of Defense Intelligence analytic resources, including the intelligence production centers of the Military Departments, toward a unified production framework that is consistent with National Intelligence policies and priorities.'}, {otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 2, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Manage, organize, train, and develop the expertise of the DIA analytic and Defense Intelligence workforce; provide and evaluate timely all-source intelligence products to meet customer needs that conform to standards on analytic integrity and sourcing.'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 3, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Collect and evaluate Open-Source Intelligence (OSINT) and make it fully available for use in Defense Intelligence products.  Serve as the DoD Lead Component for OSINT and develop policies and procedures to fully leverage OSINT within Defense Intelligence.'}, {otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 4, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Maximize resources by assigning defined all-source intelligence analytical responsibilities within DIA and to each COCOM and Military Service Intelligence Center based on capabilities, workforce characteristics, and mission requirements, and manage capabilities to maintain a surge capability.'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 5, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Provide Defense Intelligence support for the policies and planning activities of the Heads of the DoD Components and, as appropriate, for similar activities of non-DoD national authorities to identify foreign emerging challenges to national security and homeland defense.'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 6, organizationPersonnel: 'The Director, DIA,', references: 'DoDD 5105.72', responsibilityText: 'All-Source Intelligence Analysis. Prepare intelligence assessments and estimates concerning transfers of technology, goods, services, munitions, and associated transfer mechanisms and participate in interagency, national, and international fora on such transfer matters pursuant to DoD Directives 5105.72 and'}, {otherOrganizationPersonnel: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 7, organizationPersonnel: 'The Director, DIA,', references: 'DoDD 5000.1', responsibilityText: 'All-Source Intelligence Analysis. Support the DoD weapons system acquisition process by producing threat assessments within DIA or validating assessments produced by other Defense Intelligence   Components for all major DoD acquisition programs pursuant to DoD Directive 5000.1 (Reference (n)).'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 8, organizationPersonnel: 'The Director, DIA,', documentsReferenced: [], responsibilityText: 'All-Source Intelligence Analysis. Provide Defense Intelligence support to disrupt Weapons of Mass Destruction (WMD) proliferation networks.'}, {otherOrganizationPersonnel: '', filename: 'DoDD 1000.20.pdf', documentTitle: 'Active Duty Service Determinations for Civilian or Contractual Groups',  id: 9, organizationPersonnel: 'The Director, DIA,', references: 'Executive Order 13388, DoDD 2000.12', responsibilityText: 'All-Source Intelligence Analysis. Operate the Joint Intelligence Task Force for Combating Terrorism to provide prompt analysis and dissemination of intelligence on terrorist threats; set DoD terrorist threat levels; and provide all-source intelligence analysis in support of counterterrorism plans and operations pursuant to E.O. 13388 (Reference (o)) and DoD Directive 2000.12 (Reference (p)).'}]};
			assert.deepStrictEqual(responsibilities, expected);

		});
	});

	describe('#storeResponsibilityReports', () => {
		let responsibility_reports = [{id: 2, responsibility_id: 2, reporter_hashed_username: '27d1ca9e10b731476b7641eae2710ac0', issue_description:'test'}];
		const opts = {
			...constructorOptionsMock,
			responsibility_reports: {
				create(data) {
					return Promise.resolve({responsibility_report: 'dummy report'});
				}
			},
			responsibilities: {
				update(data){
					return Promise.resolve([1]);
				}
			}
		};

		it('should create a report successfully', async () => {
			const target = new ResponsibilityController(opts);

			const req = {
				...reqMock,
				body: {
					id: 0, 
					issue_description: 'review', 
					updatedColumn: 'responsibilityText', 
					updatedText: 'this is a test', 
					textPosition: { boundingRect: {}, rects: [], pageNumber: 1 }
				}
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

			await target.storeResponsibilityReports(req, res);
			
			const expected = {responsibility_report: 'dummy report'}
			assert.deepStrictEqual(resMsg, expected);
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

			await target.storeResponsibilityReports(req, res);
				
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
					filename: 'test', 
					text: 'test' 
				},
			};

			await target.queryOneDocES(req, res);
			
			const expected = {
				doc_id: 'test',
				doc_num: 'test',
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

			await target.rejectResponsibility(req, res);
				
			assert.strictEqual(resCode, 200);

		});
	});

	describe('#updateResponsibility', () => {

		const reportList = [{
			id: 7, updatedColumn: 'responsibilityText', updatedText: 'Test update', issue_description: 'review'
		}]
		const responsibilitiesList = [{
			id: 0, filename: 'test', documentTitle: 'test', organizationPersonnel: 'test', responsibilityText: 'test', otherOrganizationPersonnel: 'test', documentsReferenced: {}, status: 'active', responsibility_reports: [reportList[0]]
		}]
		const responsibilities = {
			update: async (data, where) => {
				let updates = 0;
				const responsibilityToUpdate = responsibilitiesList.find(responsibility => responsibility.id === where.where.id);
				responsibilityToUpdate.status = data.status;
				if(Object.keys(data).includes('responsibilityText')) responsibilityToUpdate.responsibilityText = data.updatedText;
				if(Object.keys(data).includes('organizationPersonnel')) responsibilityToUpdate.organizationPersonnel = data.updatedText;
				updates++;
				return Promise.resolve([updates]);
			},
			findOne : async (data) => {
				const responsibilityToUpdate = responsibilitiesList.find(responsibility => responsibility.id === data.where.id);
				return Promise.resolve({
					dataValues: {
						responsibility_reports: responsibilityToUpdate.responsibility_reports
					}
				})
			}
		}
		const responsibility_reports = {
			update: async (data, where) => {
				let updates = 0;
				const reportToUpdate = reportList.find(report => report.id === where.where.id);
				if(data.updatedText) reportToUpdate.updatedText = data.updatedText;
				reportToUpdate.issue_description = data.issue_description;
				updates++;
				return Promise.resolve([updates]);
			},
			destroy: async (data) => {
				let deleteCount = 0;
				const index = reportList.findIndex(report => report.id === data.where.id);
				reportList.splice(index, 1);
				deleteCount++;
				return Promise.resolve([deleteCount]);
			}
		}

		const opts = {
			...constructorOptionsMock,
			responsibilities,
			responsibility_reports
		};

		it('should update a resposibility and return a 200 status code given an accepted update status', async () => {
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
					update: {
						  id: 7,
						  updatedColumn: 'responsibilityText',
						  updatedText: 'Test update',
					},
					responsibility: {
						  id: 0,
						  organizationPersonnel: 'Test Org',
						  responsibilityText: 'Test text',
					},
					status: 'accepted'
				},
			};

			await target.updateResponsibility(req, res);
				
			assert.strictEqual(resCode, 200);
		});

		it('should update a resposibility and return a 200 status code given a Reject updateCollumn', async () => {
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
					update: {
						  id: 7,
						  updatedColumn: 'Reject',
						  updatedText: '',
					},
					responsibility: {
						  id: 0,
						  organizationPersonnel: 'Test Org',
						  responsibilityText: 'Test text',
					},
					status: 'accepted'
				},
			};

			await target.updateResponsibility(req, res);
				
			assert.strictEqual(resCode, 200);
		});

		it('should remove a report and return a 200 status code given a rejected update status', async () => {
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
					update: {
						  id: 7,
						  updatedColumn: 'responsibilityText',
						  updatedText: 'Test update',
					},
					responsibility: {
						  id: 0,
						  organizationPersonnel: 'Test Org',
						  responsibilityText: 'Test text',
					},
					status: 'rejected'
				},
			};

			await target.updateResponsibility(req, res);

			assert.strictEqual(resCode, 200);
		});

	});

	describe('#getFileLink', () => {
		const dataApi = {
			queryElasticSearch: async (esClientName, esIndex, esQuery, userId) => {
				return Promise.resolve({
					body:{
						hits:{
							hits:[{
								inner_hits:{
									paragraphs:{
										hits: {
											hits: [{
												fields: {
													'paragraphs.page_num_i': [15]
												}
											}]
										}
									}
								},
								_source: {download_url_s: 'test URL'}
							}]
						}
					}
				});
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

		it('should return source URL and the page number the text is found on', async () => {
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
					cloneData: {clone_name: 'gamechanger'}, 
					filename: 'test.pdf', 
					text: 'test text'
				},
			};

			await target.getFileLink(req, res);
				
			const expected = {fileLink: 'test URL', pageNumber: 15}
			assert.deepStrictEqual(resMsg, expected);
			assert.strictEqual(resCode, 200);
		});

	});

	describe('#getResponsibilityDocTitles', () => {
		const documentList = ['Doc1', 'Doc2', 'Doc3']
		const responsibilities = {
			findAll: async (data) => {
				return Promise.resolve(documentList);
			}
		}

		const opts = {
			...constructorOptionsMock,
			responsibilities,
		};

		it('should return a list of all responsibility document titles', async () => {
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
			};

			await target.getResponsibilityDocTitles(req, res);
				
			const expected = {results: ['Doc1', 'Doc2', 'Doc3']}
			assert.deepStrictEqual(resMsg, expected);
			assert.strictEqual(resCode, 200);
		});

	});

	describe('#updateResponsibilityReport', () => {
		const reportList = [{
			id: 0, updatedColumn: 'responsibilityText', updatedText: 'Test update', issue_description: 'review'
		}]
		const responsibility_reports = {
			update: async (data, where) => {
				let updates = 0;
				const reportToUpdate = reportList.find(report => report.id === where.where.id);
				reportToUpdate.updatedText = data.updatedText;
				reportToUpdate.textPosition = data.textPosition;
				updates++;
				return Promise.resolve([updates]);
			}
		}

		const opts = {
			...constructorOptionsMock,
			responsibility_reports,
		};

		it('should update a responsiblity report and return a status code 200', async () => {
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
					updatedText: 'test', 
					textPosition: { boundingRect: {}, rects: [], pageNumber: 1 }
				}
			};

			await target.updateResponsibilityReport(req, res);
				
			const expected = [1]
			assert.deepStrictEqual(resMsg, expected);
			assert.strictEqual(resCode, 200);
		});
	});

	describe('#getResponsibilityUpdates', () => {
		const responsibilitiesList = [
			{id: 0, filename: 'test', documentTitle: 'test', organizationPersonnel: 'test', responsibilityText: 'test', otherOrganizationPersonnel: 'test', documentsReferenced: {}, status: 'active'},
			{id: 0, filename: 'test', documentTitle: 'test', organizationPersonnel: 'test', responsibilityText: 'test', otherOrganizationPersonnel: 'test', documentsReferenced: {}, status: 'review'}
		]
		const responsibilities = {
			findAndCountAll: async (data) => {
				if(data.group) {
					const results = responsibilitiesList.filter(resp => resp.status === 'review');
					const parsedResults = results.map(resp => {return {dataValues:{...resp, filenameCount: 1} }})
					const docOffsets = {rows: parsedResults};
					return Promise.resolve(docOffsets);
				}else {
					const rows = responsibilitiesList.filter(resp => resp.status === 'review');
					const count = rows.length;
					const results = {count, rows}
					return Promise.resolve(results);
				}
			}
		}

		const opts = {
			...constructorOptionsMock,
			responsibilities,
		};

		it('should return all responsibility updates', async () => {
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
					offset: 0, 
					page: 0
				}
			};

			await target.getResponsibilityUpdates(req, res);

			const expected = {'offsets': [1], 'results': [{'documentTitle': 'test', 'documentsReferenced': {}, 'filename': 'test', 'id': 0, 'organizationPersonnel': 'test', 'otherOrganizationPersonnel': 'test', 'responsibilityText': 'test', 'status': 'review'}], 'totalCount': 1}
			assert.deepStrictEqual(resMsg, expected);
			assert.strictEqual(resCode, 200);
		});
	});
});
