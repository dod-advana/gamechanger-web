const assert = require('assert');
const { AdminController } = require('../../node_app/controllers/adminController');
const { constructorOptionsMock, reqMock } = require('../resources/testUtility');

describe('AdminController', function () {

	describe('#getGCAdminData', () => {
		it('it should return the admin list', async () => {
			const adminList = [{
				id: 1, username: 'Test'
			}];
			const opts = {
				...constructorOptionsMock,
				dataApi: {},
				gcAdmins: {
					findAll(data) {
						return Promise.resolve(adminList);
					}
				}
			};
			const target = new AdminController(opts);

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
				await target.getGCAdminData(req, res);
			} catch (e) {
				assert.fail(e);
			}
			assert.deepStrictEqual(resMsg.admins, adminList);
		});
	});

	describe('#deleteGCAdminData', () => {
		it('it should delete a user admin', async () => {
			const adminList = [{
				id: 1, username: 'Test'
			}];
			const opts = {
				...constructorOptionsMock,
				dataApi: {},
				gcAdmins: {
					findOne(data) {
						let clone;
						adminList.forEach(tmpAdmin => {
							if (data.where.username === tmpAdmin.username) {
								clone = tmpAdmin;
							}
						});
						const rtnClone = {
							...clone,
							destroy: () => {
								adminList.splice(0, 1);
							}
						};
						return Promise.resolve(rtnClone);
					}
				}
			};
			const target = new AdminController(opts);

			const req = {
				...reqMock,
				body: {
					username: 'Test'
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
				await target.deleteGCAdminData(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = { deleted: true };
			assert.deepStrictEqual(resMsg, expected);
			assert.deepStrictEqual(adminList, []);
		});
	});

	describe('#storeGCAdminData', () => {
		let admins = [];
		let expectedAdmin;
		const opts = {
			...constructorOptionsMock,
			dataApi: {},
			gcAdmins: {
				findOrCreate(data) {
					let admin;

					admins.forEach(tmpAdmin => {
						if (tmpAdmin.username === data.where.username) {
							admin = tmpAdmin;
						}
					});

					if (admin) {
						const rtnAdmin = {
							...admin,
							save() {
								expectedAdmin = admin;
							}
						};
						return Promise.resolve([rtnAdmin, false]);
					} else {
						admin = {
							username: data.defaults.username
						};
						admins.push(admin);
						const rtnAdmin = {
							...admin,
							save() {
								expectedAdmin = admin;
							}
						};
						return Promise.resolve([rtnAdmin, true]);
					}
				}
			}
		};

		it('should create a clone', async () => {
			admins = [];
			const target = new AdminController(opts);

			const req = {
				...reqMock,
				body: {
					adminData: {
						username: 'Test'
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
				await target.storeGCAdminData(req, res);
			} catch (e) {
				assert.fail(e);
			}
			let expected = {created: true, updated: false};
			assert.deepStrictEqual(resMsg, expected);
			expected = [{username: 'Test'}];
			assert.deepStrictEqual(admins, expected);
		});

		it('should update a admin', async () => {
			admins = [{
				id: 1, username: 'Test'
			}];
			const target = new AdminController(opts);

			const req = {
				...reqMock,
				body: {
					adminData: {
						username: 'Test'
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
				await target.storeGCAdminData(req, res);
			} catch (e) {
				assert.fail(e);
			}
			let expected = {created: false, updated: true};
			assert.deepStrictEqual(resMsg, expected);
			expected = [{id: 1, username: 'Test'}];
			assert.deepStrictEqual(admins, expected);
		});
	});

	describe('#getHomepageEditorData', () => {
		it('should return editor data', async () => {
			const editorData = [{
				id: 1, key: 'homepage_topics', value: '[test1,test2]'
			}];
			const opts = {
				...constructorOptionsMock,
				dataApi: {},
				appSettings: {
					findAll(data) {
						return Promise.resolve(editorData);
					}
				}
			};
			const target = new AdminController(opts);

			const req = { ...reqMock,
				body: { favorite_documents : [{filename:'Title 10.pdf'}]}};

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
			let actual = [{"id": 1, "key": "homepage_topics", "value": "[test1,test2]"}, {"key": "popular_docs", "value": []}, {"key": "rec_docs", "value": []}]
			try {
				await target.getHomepageEditorData(req, res);
			} catch (e) {
				assert.fail(e);
			}
			assert.deepStrictEqual(resMsg, actual);
		});
	})
	describe('#getHomepageUserData', () => {
		it('should return homepage user data', async () => {
			const editorData = [{
				id: 1, key: 'homepage_topics', value: '[test1,test2]'
			}];
			const opts = {
				...constructorOptionsMock,
				dataApi: {},
				appSettings: {
					findAll(data) {
						return Promise.resolve(editorData);
					}
				}
			};
			const req = { ...reqMock,
				body: { favorite_documents : [{filename:'Title 10.pdf'}]}};
			const esIndex = 'gamechanger';
			const userId = 'test';

			const target = new AdminController(opts);

			let resCode;
			let resMsg;
			console.log(req)

			let results =  [{"key": "popular_docs", "value": []}, {"key": "rec_docs", "value": []}]
			let actual =  [{"key": "popular_docs", "value": []}, {"key": "rec_docs", "value": []}]

			try {
				results = await target.getHomepageUserData(req, esIndex, userId);
			} catch (e) {
				assert.fail(e);
			}
			assert.deepStrictEqual(results, actual);
		});
	});

	describe('#setHomepageEditorData', () => {
		it('should update homepage_topics key with new data', async () => {
			const editorData = [{
				id: 1, key: 'homepage_topics', value: ['test1','test2']
			}];
			const opts = {
				...constructorOptionsMock,
				dataApi: {},
				appSettings: {
					update({value},{where}) {
						editorData.forEach((obj,idx) => {
							if(obj.key === where.key){
								editorData[idx].value = value;
							}
						});
						return Promise.resolve(editorData);
					}
				}
			};
			const target = new AdminController(opts);

			const req = {
				...reqMock,
				body: {
					key: 'topics',
					tableData: ['test3','test4']
				}
			};

			const ans = [{ ...editorData[0] }]
			ans[0].value = JSON.stringify(req.body.tableData);
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
				await target.setHomepageEditorData(req, res);
			} catch (e) {
				assert.fail(e);
			}
			assert.deepStrictEqual(ans, editorData);
		})
	})
});
