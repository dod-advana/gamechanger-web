const assert = require('assert');
const { CloneController } = require('../../node_app/controllers/cloneController');
const { constructorOptionsMock, reqMock } = require('../resources/testUtility');

describe('CloneController', function () {

	describe('#storeGCCloneData', () => {
		let clones = [];
		let expectedClone;
		const opts = {
			...constructorOptionsMock,
			dataApi: {},
			gcClones: {
				findOrCreate(data) {
					let clone;

					clones.forEach(tmpClone => {
						if (tmpClone.clone_name === data.where.clone_name) {
							clone = tmpClone;
						}
					});

					if (clone) {
						const rtnClone = {
							...clone,
							save() {
								expectedClone = clone;
							}
						};
						return Promise.resolve([rtnClone, false]);
					} else {
						clone = {
							clone_name: data.defaults.name,
							is_live: false,
							clone_data: {
								project_name: data.defaults.clone_data.project_name,
								url: data.defaults.clone_data.url,
								edl_service: data.defaults.clone_data.edl_service,
								model_version: data.defaults.clone_data.model_version,
								intelligentSearch: data.defaults.clone_data.intelligentSearch,
								tutorial: data.defaults.clone_data.tutorial,
								crowdSource: data.defaults.clone_data.crowdSource,
								userFeedback: data.defaults.clone_data.userFeedback,
								graphView: data.defaults.clone_data.graphView,
								cloneToGamechanger: data.defaults.clone_data.cloneToGamechanger,
								cloneToAdvana: data.defaults.clone_data.cloneToAdvana,
								cloneToSipr: data.defaults.clone_data.cloneToSipr,
								esCluster: data.defaults.clone_data.esCluster,
								s3Bucket: data.defaults.clone_data.s3Bucket,
								permissionsRequired: data.defaults.clone_data.permissionsRequired,
								gcIndex: data.defaults.clone_data.gcIndex,
								extSearchFields: data.defaults.clone_data.extSearchFields,
								extRetrieveFields: data.defaults.clone_data.extRetrieveFields,
								auxDisplayBackFields: data.defaults.clone_data.auxDisplayBackFields,
								auxDisplayFrontFields: data.defaults.clone_data.auxDisplayFrontFields,
								auxDisplayTitleField: data.defaults.clone_data.auxDisplayTitleField,
								auxDisplayLeftSubtitleText: data.defaults.clone_data.auxDisplayLeftSubtitleText,
								auxDisplayRightSubtitleField: data.defaults.clone_data.auxDisplayRightSubtitleField,
								auxIndex: data.defaults.clone_data.auxIndex,
								auxRetrieveFields: data.defaults.clone_data.auxRetrieveFields,
								auxSearchFields: data.defaults.clone_data.auxSearchFields,
								auxDisplayFieldJSONMap: data.defaults.clone_data.auxDisplayFieldJSONMap
							}
						};
						clones.push(clone);
						const rtnClone = {
							...clone,
							save() {
								expectedClone = clone;
							}
						};
						return Promise.resolve([rtnClone, true]);
					}
				}
			}
		};

		it('should create a clone', async () => {
			clones = [];
			const target = new CloneController(opts);

			const req = {
				...reqMock,
				body: {
					cloneData: {
						name: 'Test',
						project_name: 'Test',
						url: '/test',
						edl_service: 'Test',
						model_version: 1,
						intelligentSearch: false,
						tutorial: false,
						crowdSource: false,
						userFeedback: false,
						graphView: false,
						cloneToGamechanger: false,
						cloneToAdvana: false,
						cloneToSipr: false,
						esCluster: 'Test',
						s3Bucket: 'Test',
						permissionsRequired: false,
						gcIndex: 'Test',
						extSearchFields: {},
						extRetrieveFields: {},
						auxDisplayBackFields: {},
						auxDisplayFrontFields: {},
						auxDisplayTitleField: {},
						auxDisplayLeftSubtitleText: {},
						auxDisplayRightSubtitleField: {},
						auxIndex: {},
						auxRetrieveFields: {},
						auxSearchFields: {},
						auxDisplayFieldJSONMap: {}
					}
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

			try {
				await target.storeGCCloneData(req, res);
			} catch (e) {
				assert.fail(e);
			}
			let expected = {created: true, updated: false};
			assert.deepStrictEqual(resMsg, expected);
			expected = [{clone_data: {auxDisplayBackFields: {}, auxDisplayFieldJSONMap: {}, auxDisplayFrontFields: {}, auxDisplayLeftSubtitleText: {}, auxDisplayRightSubtitleField: {}, auxDisplayTitleField: {}, auxIndex: {}, auxRetrieveFields: {}, auxSearchFields: {}, cloneToAdvana: false, cloneToGamechanger: false, cloneToSipr: false, crowdSource: false, edl_service: 'Test', esCluster: 'Test', extRetrieveFields: {}, extSearchFields: {}, gcIndex: 'Test', graphView: false, intelligentSearch: false, model_version: 1, permissionsRequired: false, project_name: 'Test', s3Bucket: 'Test', tutorial: false, url: '/test', userFeedback: false}, clone_name: undefined, is_live: false}];
			assert.deepStrictEqual(clones, expected);
		});

		it('should update a clone', async () => {
			clones = [{clone_data: {auxDisplayBackFields: {}, auxDisplayFieldJSONMap: {}, auxDisplayFrontFields: {}, auxDisplayLeftSubtitleText: {}, auxDisplayRightSubtitleField: {}, auxDisplayTitleField: {}, auxIndex: {}, auxRetrieveFields: {}, auxSearchFields: {}, cloneToAdvana: false, cloneToGamechanger: false, cloneToSipr: false, crowdSource: false, edl_service: 'Test', esCluster: 'Test', extRetrieveFields: {}, extSearchFields: {}, gcIndex: 'Test', graphView: false, intelligentSearch: false, model_version: 1, permissionsRequired: false, project_name: 'Test', s3Bucket: 'Test', tutorial: false, url: '/test', userFeedback: false}, clone_name: 'Test', is_live: false}];

			const target = new CloneController(opts);

			const req = {
				...reqMock,
				body: {
					cloneData: {
						name: 'Test',
						project_name: 'Test',
						url: '/test',
						edl_service: 'Test',
						model_version: 1,
						intelligentSearch: true,
						tutorial: true,
						crowdSource: true,
						userFeedback: true,
						graphView: true,
						cloneToGamechanger: true,
						cloneToAdvana: true,
						cloneToSipr: true,
						esCluster: 'Test',
						s3Bucket: 'Test',
						permissionsRequired: true,
						gcIndex: 'Test',
						extSearchFields: {},
						extRetrieveFields: {},
						auxDisplayBackFields: {},
						auxDisplayFrontFields: {},
						auxDisplayTitleField: {},
						auxDisplayLeftSubtitleText: {},
						auxDisplayRightSubtitleField: {},
						auxIndex: {},
						auxRetrieveFields: {},
						auxSearchFields: {},
						auxDisplayFieldJSONMap: {}
					}
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

			try {
				await target.storeGCCloneData(req, res);
			} catch (e) {
				assert.fail(e);
			}
			let expected = {created: false, updated: true};
			assert.deepStrictEqual(resMsg, expected);
			expected = [{clone_data: {auxDisplayBackFields: {}, auxDisplayFieldJSONMap: {}, auxDisplayFrontFields: {}, auxDisplayLeftSubtitleText: {}, auxDisplayRightSubtitleField: {}, auxDisplayTitleField: {}, auxIndex: {}, auxRetrieveFields: {}, auxSearchFields: {}, cloneToAdvana: false, cloneToGamechanger: false, cloneToSipr: false, crowdSource: false, edl_service: 'Test', esCluster: 'Test', extRetrieveFields: {}, extSearchFields: {}, gcIndex: 'Test', graphView: false, intelligentSearch: false, model_version: 1, permissionsRequired: false, project_name: 'Test', s3Bucket: 'Test', tutorial: false, url: '/test', userFeedback: false}, clone_name: 'Test', is_live: false}];
			assert.deepStrictEqual(clones, expected);
		});
	});

	describe('#getGCCloneData', () => {
		let clones = [];
		const opts = {
			...constructorOptionsMock,
			dataApi: {},
			gcClones: {
				findAll(data) {
					return Promise.resolve(clones);
				}
			}
		};

		it('should get the clones', async () => {
			clones = [{clone_data: {auxDisplayBackFields: {}, auxDisplayFieldJSONMap: {}, auxDisplayFrontFields: {}, auxDisplayLeftSubtitleText: {}, auxDisplayRightSubtitleField: {}, auxDisplayTitleField: {}, auxIndex: {}, auxRetrieveFields: {}, auxSearchFields: {}, cloneToAdvana: false, cloneToGamechanger: false, cloneToSipr: false, crowdSource: false, edl_service: 'Test', esCluster: 'Test', extRetrieveFields: {}, extSearchFields: {}, gcIndex: 'Test', graphView: false, intelligentSearch: false, model_version: 1, permissionsRequired: false, project_name: 'Test', s3Bucket: 'Test', tutorial: false, url: '/test', userFeedback: false}, clone_name: 'Test', is_live: false}];

			const target = new CloneController(opts);

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
				await target.getGCCloneData(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = [{clone_data: {auxDisplayBackFields: {}, auxDisplayFieldJSONMap: {}, auxDisplayFrontFields: {}, auxDisplayLeftSubtitleText: {}, auxDisplayRightSubtitleField: {}, auxDisplayTitleField: {}, auxIndex: {}, auxRetrieveFields: {}, auxSearchFields: {}, cloneToAdvana: false, cloneToGamechanger: false, cloneToSipr: false, crowdSource: false, edl_service: 'Test', esCluster: 'Test', extRetrieveFields: {}, extSearchFields: {}, gcIndex: 'Test', graphView: false, intelligentSearch: false, model_version: 1, permissionsRequired: false, project_name: 'Test', s3Bucket: 'Test', tutorial: false, url: '/test', userFeedback: false}, clone_name: 'Test', is_live: false}, {can_edit: false, clone_data: {cloneToAdvana: true, cloneToGamechanger: true, cloneToJupiter: true, cloneToSipr: false, crowdSource: true, esCluster: 'gamechanger', gcIndex: 'gamechanger', graphView: true, intelligentSearch: true, model_version: '', permissionsRequired: false, project_name: 'policy', s3Bucket: 'advana-raw-zone', tutorial: true, url: 'gamechanger', userFeedback: true}, clone_name: 'GAMECHANGER', is_live: true}];
			assert.deepStrictEqual(resMsg.clones, expected);

		});
	});

	describe('#deleteGCCloneData', () => {
		let clones = [];
		const opts = {
			...constructorOptionsMock,
			dataApi: {},
			gcClones: {
				findOne(data) {
					let clone;
					clones.forEach(tmpClone => {
						if (data.where.id === tmpClone.id) {
							clone = tmpClone;
						}
					});
					const rtnClone = {
						...clone,
						destroy: () => {
							clones.splice(0, 1);
						}
					};
					return Promise.resolve(rtnClone);
				}
			}
		};

		it('should get the clones', async () => {
			clones = [{id: 1, clone_data: {auxDisplayBackFields: {}, auxDisplayFieldJSONMap: {}, auxDisplayFrontFields: {}, auxDisplayLeftSubtitleText: {}, auxDisplayRightSubtitleField: {}, auxDisplayTitleField: {}, auxIndex: {}, auxRetrieveFields: {}, auxSearchFields: {}, cloneToAdvana: false, cloneToGamechanger: false, cloneToSipr: false, crowdSource: false, edl_service: 'Test', esCluster: 'Test', extRetrieveFields: {}, extSearchFields: {}, gcIndex: 'Test', graphView: false, intelligentSearch: false, model_version: 1, permissionsRequired: false, project_name: 'Test', s3Bucket: 'Test', tutorial: false, url: '/test', userFeedback: false}, clone_name: 'Test', is_live: false}];

			const target = new CloneController(opts);

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
				await target.deleteGCCloneData(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = [];
			assert.deepStrictEqual(clones, expected);

		});
	});
});
