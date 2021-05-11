const assert = require('assert');
const { ModularGameChangerController } = require('../../node_app/controllers/modularGameChangerController');
const { constructorOptionsMock, reqMock } = require('../resources/testUtility');

describe('ModularGameChangerController', function () {

	describe('#getCloneMeta', () => {
		it('it should return a specified clone', async () => {
			const cloneList = [{
				id: 1,
				clone_name: 'gamechanger',
				search_module: 'policy/policySearchHandler',
				export_module: 'simple/simpleExportHandler',
				title_bar_module: 'policy/policyTitleBarHandler',
				navigation_module: 'policy/policyNavigationHandler',
				card_module: 'policy/policyCardHandler',
				display_name: 'GAMECHANGER',
				is_live: true,
				url: 'gamechanger',
				permissions_required: false,
				clone_to_advana: true,
				clone_to_gamchanger: true,
				clone_to_jupiter: true,
				clone_to_sipr: false,
				show_tutorial: true,
				show_graph: true,
				show_crowd_source: true,
				show_feedback: true,
				config: {esIndex: 'gamechanger'}
			}];
			const opts = {
				...constructorOptionsMock,
				clone_meta: {
					findAll(data) {
						return Promise.resolve(cloneList);
					},
					findOne(data) {
						return Promise.resolve(cloneList[0]);
					}
				}
			};
			const target = new ModularGameChangerController(opts);

			const req = {
				...reqMock,
				body: {
					cloneName: 'gamechanger'
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
				await target.getCloneMeta(req, res);
			} catch (e) {
				assert.fail(e);
			}
			assert.deepStrictEqual(resMsg, cloneList[0]);
		});
	});

	describe('#getAllCloneMeta', () => {
		it('it should return a list of clones', async () => {
			const cloneList = [{
				id: 1,
				clone_name: 'gamechanger',
				search_module: 'policy/policySearchHandler',
				export_module: 'simple/simpleExportHandler',
				title_bar_module: 'policy/policyTitleBarHandler',
				navigation_module: 'policy/policyNavigationHandler',
				card_module: 'policy/policyCardHandler',
				display_name: 'GAMECHANGER',
				is_live: true,
				url: 'gamechanger',
				permissions_required: false,
				clone_to_advana: true,
				clone_to_gamchanger: true,
				clone_to_jupiter: true,
				clone_to_sipr: false,
				show_tutorial: true,
				show_graph: true,
				show_crowd_source: true,
				show_feedback: true,
				config: {esIndex: 'gamechanger'}
			}];
			const opts = {
				...constructorOptionsMock,
				clone_meta: {
					findAll(data) {
						return Promise.resolve(cloneList);
					}
				}
			};
			const target = new ModularGameChangerController(opts);

			const req = {
				...reqMock,
				body: {
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
				await target.getAllCloneMeta(req, res);
			} catch (e) {
				assert.fail(e);
			}
			assert.deepStrictEqual(resMsg, cloneList);
		});
	});

	describe('#search', () => {
		it('should create a dummy handler and make a dummy search', async () => {
			const opts = {
				...constructorOptionsMock,
				handler_factory: {
					createHandler(handlerType, cloneName) {
						return {
							search() {
								return {msg: 'I am a dummy search. Check out the test for specific modules.', handlerType, cloneName};
							}
						};
					}
				}
			};
			const target = new ModularGameChangerController(opts);

			const req = {
				...reqMock,
				body: {
					cloneName: 'gamechanger',
					searchText: 'test',
					offset: 0,
					limit: 20
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
				await target.search(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {msg: 'I am a dummy search. Check out the test for specific modules.', handlerType: 'search', cloneName: 'gamechanger'};
			assert.deepStrictEqual(resMsg, expected);
		});
	});

	describe('#export', () => {
		it('should create a dummy handler and make a dummy export', async () => {
			const opts = {
				...constructorOptionsMock,
				handler_factory: {
					createHandler(handlerType, cloneName) {
						return {
							export() {
								return {msg: 'I am a dummy export. Check out the test for specific modules.', handlerType, cloneName};
							}
						};
					}
				}
			};
			const target = new ModularGameChangerController(opts);

			const req = {
				...reqMock,
				body: {
					cloneName: 'gamechanger',
					searchText: 'test',
					offset: 0,
					limit: 20
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
				await target.export(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {msg: 'I am a dummy export. Check out the test for specific modules.', handlerType: 'export', cloneName: 'gamechanger'};
			assert.deepStrictEqual(resMsg, expected);
		});
	});
});
