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
});
