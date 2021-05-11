const assert = require('assert');
const { ResponsibilityController } = require('../../node_app/controllers/responsibilityController');
const { constructorOptionsMock, reqMock } = require('../resources/testUtility');

describe('ResponsibilityController', function () {
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
			responsibilities = {count: 84, rows: [{id: 0, filename: 'DoDD 5105.21.json', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: '', responsibilityLevel3: '', primaryEntity: 'The Director, DIA,', entitiesFound: '', references: ''}, {id: 1, filename: 'DoDD 5105.21.json', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Promulgate and manage a program to establish community management of Defense Intelligence analytic resources, including the intelligence production centers of the Military Departments, toward a unified production framework that is consistent with National Intelligence policies and priorities.', responsibilityLevel3: '', primaryEntity: 'The Director, DIA,', entitiesFound: '', references: ''}, {id: 2, filename: 'DoDD 5105.21.json', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Manage, organize, train, and develop the expertise of the DIA analytic and Defense Intelligence workforce; provide and evaluate timely all-source intelligence products to meet customer needs that conform to standards on analytic integrity and sourcing.', responsibilityLevel3: '', primaryEntity: 'The Director, DIA,', entitiesFound: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', references: ''}, {id: 3, filename: 'DoDD 5105.21.json', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Collect and evaluate Open-Source Intelligence (OSINT) and make it fully available for use in Defense Intelligence products.  Serve as the DoD Lead Component for OSINT and develop policies and procedures to fully leverage OSINT within Defense Intelligence.', responsibilityLevel3: '', primaryEntity: 'The Director, DIA,', entitiesFound: '', references: ''}, {id: 4, filename: 'DoDD 5105.21.json', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Maximize resources by assigning defined all-source intelligence analytical responsibilities within DIA and to each COCOM and Military Service Intelligence Center based on capabilities, workforce characteristics, and mission requirements, and manage capabilities to maintain a surge capability.', responsibilityLevel3: '', primaryEntity: 'The Director, DIA,', entitiesFound: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', references: ''}, {id: 5, filename: 'DoDD 5105.21.json', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Provide Defense Intelligence support for the policies and planning activities of the Heads of the DoD Components and, as appropriate, for similar activities of non-DoD national authorities to identify foreign emerging challenges to national security and homeland defense.', responsibilityLevel3: '', primaryEntity: 'The Director, DIA,', entitiesFound: '', references: ''}, {id: 6, filename: 'DoDD 5105.21.json', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Prepare intelligence assessments and estimates concerning transfers of technology, goods, services, munitions, and associated transfer mechanisms and participate in interagency, national, and international fora on such transfer matters pursuant to DoD Directives 5105.72 and', responsibilityLevel3: '', primaryEntity: 'The Director, DIA,', entitiesFound: '', references: 'DoDD 5105.72'}, {id: 7, filename: 'DoDD 5105.21.json', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Support the DoD weapons system acquisition process by producing threat assessments within DIA or validating assessments produced by other Defense Intelligence   Components for all major DoD acquisition programs pursuant to DoD Directive 5000.1 (Reference (n)).', responsibilityLevel3: '', primaryEntity: 'The Director, DIA,', entitiesFound: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', references: 'DoDD 5000.1'}, {id: 8, filename: 'DoDD 5105.21.json', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Provide Defense Intelligence support to disrupt Weapons of Mass Destruction (WMD) proliferation networks.', responsibilityLevel3: '', primaryEntity: 'The Director, DIA,', entitiesFound: '', references: ''}, {id: 9, filename: 'DoDD 5105.21.json', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Operate the Joint Intelligence Task Force for Combating Terrorism to provide prompt analysis and dissemination of intelligence on terrorist threats; set DoD terrorist threat levels; and provide all-source intelligence analysis in support of counterterrorism plans and operations pursuant to E.O. 13388 (Reference (o)) and DoD Directive 2000.12 (Reference (p)).', responsibilityLevel3: '', primaryEntity: 'The Director, DIA,', entitiesFound: '', references: 'Executive Order 13388, DoDD 2000.12'}]};
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
			const expected = {count: 84, rows: [{entitiesFound: '', filename: 'DoDD 5105.21.json', id: 0, primaryEntity: 'The Director, DIA,', references: '', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: '', responsibilityLevel3: ''}, {entitiesFound: '', filename: 'DoDD 5105.21.json', id: 1, primaryEntity: 'The Director, DIA,', references: '', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Promulgate and manage a program to establish community management of Defense Intelligence analytic resources, including the intelligence production centers of the Military Departments, toward a unified production framework that is consistent with National Intelligence policies and priorities.', responsibilityLevel3: ''}, {entitiesFound: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', filename: 'DoDD 5105.21.json', id: 2, primaryEntity: 'The Director, DIA,', references: '', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Manage, organize, train, and develop the expertise of the DIA analytic and Defense Intelligence workforce; provide and evaluate timely all-source intelligence products to meet customer needs that conform to standards on analytic integrity and sourcing.', responsibilityLevel3: ''}, {entitiesFound: '', filename: 'DoDD 5105.21.json', id: 3, primaryEntity: 'The Director, DIA,', references: '', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Collect and evaluate Open-Source Intelligence (OSINT) and make it fully available for use in Defense Intelligence products.  Serve as the DoD Lead Component for OSINT and develop policies and procedures to fully leverage OSINT within Defense Intelligence.', responsibilityLevel3: ''}, {entitiesFound: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', filename: 'DoDD 5105.21.json', id: 4, primaryEntity: 'The Director, DIA,', references: '', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Maximize resources by assigning defined all-source intelligence analytical responsibilities within DIA and to each COCOM and Military Service Intelligence Center based on capabilities, workforce characteristics, and mission requirements, and manage capabilities to maintain a surge capability.', responsibilityLevel3: ''}, {entitiesFound: '', filename: 'DoDD 5105.21.json', id: 5, primaryEntity: 'The Director, DIA,', references: '', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Provide Defense Intelligence support for the policies and planning activities of the Heads of the DoD Components and, as appropriate, for similar activities of non-DoD national authorities to identify foreign emerging challenges to national security and homeland defense.', responsibilityLevel3: ''}, {entitiesFound: '', filename: 'DoDD 5105.21.json', id: 6, primaryEntity: 'The Director, DIA,', references: 'DoDD 5105.72', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Prepare intelligence assessments and estimates concerning transfers of technology, goods, services, munitions, and associated transfer mechanisms and participate in interagency, national, and international fora on such transfer matters pursuant to DoD Directives 5105.72 and', responsibilityLevel3: ''}, {entitiesFound: 'National Geospatial-Intelligence Agency, Defense Intelligence Agency', filename: 'DoDD 5105.21.json', id: 7, primaryEntity: 'The Director, DIA,', references: 'DoDD 5000.1', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Support the DoD weapons system acquisition process by producing threat assessments within DIA or validating assessments produced by other Defense Intelligence   Components for all major DoD acquisition programs pursuant to DoD Directive 5000.1 (Reference (n)).', responsibilityLevel3: ''}, {entitiesFound: '', filename: 'DoDD 5105.21.json', id: 8, primaryEntity: 'The Director, DIA,', references: '', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Provide Defense Intelligence support to disrupt Weapons of Mass Destruction (WMD) proliferation networks.', responsibilityLevel3: ''}, {entitiesFound: '', filename: 'DoDD 5105.21.json', id: 9, primaryEntity: 'The Director, DIA,', references: 'Executive Order 13388, DoDD 2000.12', responsibilityLevel1: 'All-Source Intelligence Analysis', responsibilityLevel2: 'Operate the Joint Intelligence Task Force for Combating Terrorism to provide prompt analysis and dissemination of intelligence on terrorist threats; set DoD terrorist threat levels; and provide all-source intelligence analysis in support of counterterrorism plans and operations pursuant to E.O. 13388 (Reference (o)) and DoD Directive 2000.12 (Reference (p)).', responsibilityLevel3: ''}]};
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
});
