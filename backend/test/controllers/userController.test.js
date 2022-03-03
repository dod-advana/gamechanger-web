const assert = require('assert');
const { UserController } = require('../../node_app/controllers/userController');
const { constructorOptionsMock, reqMock } = require('../resources/testUtility');

describe('UserController', function () {

	describe('#addInternalUser', () => {
		const opts = {
			...constructorOptionsMock,
			dataApi: {}
		};

		it('should fail if neither username or trackByRequest options are passed in the body', async () => {

			let usedUsername;
			const internalUserTracking = {
				findAll({where: { username }}) {
					usedUsername = username;
					return {
						id: 1,
						username
					};
				},
				findOne({where: { username }}) {
					usedUsername = username;
					return {
						id: 1,
						username
					};
				}
			};
			
			const newOpts = {
				...opts,
				internalUserTracking
			};
			
			const target = new UserController(newOpts);

			const req = {
				...reqMock,
				body: {}
			};

			let resCode;
			let resMsg;

			const res = {
				status(code){
					resCode = code;
					return this;
				},
				send(msg){
					resMsg = msg;
				}
			};

			const expectedCode = 500;
			const expectedMsg = 'This user is already being tracked. Table ID # 1 - hash: d41d8cd98f00b204e9800998ecf8427e';

			await target.addInternalUser(req, res);

			assert.equal(resCode, expectedCode);
			assert.equal(resMsg, expectedMsg);

		});

		it('should use the request header if trackByRequest is true in the request body', async () => {

			let usedUsername;
			const internalUserTracking = {
				findAll({where: { username }}) {
					usedUsername = username;
					return {
						id: 1,
						username
					};
				},
				findOne({where: { username }}) {
					usedUsername = username;
					return {
						id: 1,
						username
					};
				}
			};

			const newOpts = {
				...opts,
				internalUserTracking
			};

			const target = new UserController(newOpts);

			const req = {
				...reqMock,
				body: {
					trackByRequest: true,
					username: 'wrongIfUsedWithTrackByRequest'
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
				}
			};

			const expectedUsername = '27d1ca9e10b731476b7641eae2710ac0';
			try {
				await target.addInternalUser(req, res);
			} catch (e) {
				assert.fail(e);
			}
			assert.equal(usedUsername, expectedUsername);

		});

		it('should use the username if trackByRequest not in the request body', async () => {

			let usedUsername;
			const internalUserTracking = {
				findAll({ where: { username } }) {
					usedUsername = username;
					return {
						id: 1,
						username
					};
				},
				findOne({where: { username }}) {
					usedUsername = username;
					return {
						id: 1,
						username
					};
				}
			};

			const newOpts = {
				...opts,
				internalUserTracking
			};

			const target = new UserController(newOpts);

			const req = {
				...reqMock,
				body: {
					username: 'hashMe'
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
				}
			};

			const expectedUsername = 'ae2b850d2b6b3db1a9eb1ff0afe7289c';
			try {
				await target.addInternalUser(req, res);
			} catch (e) {
				assert.fail(e);
			}
			assert.equal(usedUsername, expectedUsername);

		});
	});

	describe('#getInternalUsers', () => {
		const opts = {
			...constructorOptionsMock,
			dataApi: {}
		};

		it('return all internal users', async () => {
			const internalUsers = [{id: 1, username: 'Test'}];
			const internalUserTracking = {
				findAll() {
					return Promise.resolve(internalUsers);
				}
			};

			const newOpts = {
				...opts,
				internalUserTracking
			};

			const target = new UserController(newOpts);

			const req = {
				...reqMock,
				body: {
					username: 'hashMe'
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
				}
			};

			const expected = [{id: 1, username: 'Test'}];
			try {
				await target.getInternalUsers(req, res);
			} catch (e) {
				assert.fail(e);
			}
			assert.deepStrictEqual(resMsg, expected);

		});
	});

	describe('#deleteInternalUser', () => {
		const opts = {
			...constructorOptionsMock,
			dataApi: {}
		};

		it('return all internal users', async () => {
			const internalUsers = [{id: 1, username: 'Test'}];
			const internalUserTracking = {
				destroy(data) {
					let index = -1;
					internalUsers.forEach((user, index) => {
						if (user.id === data.where.id) {
							index = index;
						}
					});
					internalUsers.splice(index, 1);
					Promise.resolve(index !== -1);
				}
			};

			const newOpts = {
				...opts,
				internalUserTracking
			};

			const target = new UserController(newOpts);

			const req = {
				...reqMock,
				body: {
					username: 'hashMe'
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
				}
			};

			const expected = [];
			try {
				await target.deleteInternalUser(req, res);
			} catch (e) {
				assert.fail(e);
			}
			assert.deepStrictEqual(internalUsers, expected);

		});
	});

	describe('#getUserData', () => {
		let users = [];
		const opts = {
			...constructorOptionsMock,
			dataApi: {},
			gcUser: {
				findOrCreate(data) {
					let user;

					users.forEach(tmpUser => {
						if (tmpUser.user_id === data.where.user_id) {
							user = tmpUser;
						}
					});

					if (user) {
						return Promise.resolve([user, false]);
					} else {
						user = {
							user_id: data.defaults.user_id,
							notifications: {}
						};
						users.push(user);

						return Promise.resolve([user, true]);
					}
				}
			},
			constants: { GAME_CHANGER_OPTS: {index: 'gamechanger'}}
		};

		it('should return fake user data for a new user', async () => {
			users = [];
			const target = new UserController(opts);

			const req = {
				...reqMock,
				body: {
					username: 'hashMe'
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
				await target.getUserData(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {'api_key': '', 'export_history': [], 'favorite_documents': [], 'favorite_searches': [], 'notifications': {}, 'search_history': [], 'user_id': '27d1ca9e10b731476b7641eae2710ac0'};
			assert.deepStrictEqual(resMsg, expected);
		});

		it('should return fake user data for a user', async () => {
			users.push({ user_id: '27d1ca9e10b731476b7641eae2710ac0', notifications: { gamechanger: { total: 0, favorites: 0, history: 0 }}});

			const favorite_documents = [{
				id: 1,
				user_id: '27d1ca9e10b731476b7641eae2710ac0',
				filename: 'Test',
				favorite_name: 'Test',
				favorite_summary: 'Test',
				search_text: 'Test',
				is_clone: false,
				clone_index: 'Test'
			}];

			const favorite_searches = [{
				id: 1,
				user_id: '27d1ca9e10b731476b7641eae2710ac0',
				search_name: 'Test',
				search_summary: 'Test',
				search_text: 'Test',
				tiny_url: 'gamechanger?tiny=24',
				document_count: 5,
				updated_results: false,
				run_by_cache: false
			}];

			const favorite_topics = [{
				id: 1,
				user_id: '27d1ca9e10b731476b7641eae2710ac0',
				topic_name: 'Test',
				topic_summary: 'Test',
				is_clone: false,
				clone_index: 'Test'
			}];

			const favorite_organizations = [{
				id: 1,
				user_id: '27d1ca9e10b731476b7641eae2710ac0',
				organization_name: 'Test',
				organization_summary: 'Test',
				is_clone: false,
				clone_index: 'Test'
			}];

			const favorite_groups = [{
				id: 1,
				user_id: '27d1ca9e10b731476b7641eae2710ac0',
				group_type: 'document',
				group_name: 'Test',
				group_description: 'Test',
				is_clone: true,
				clone_index: 'Test',
			}]

			const favorite_documents_groups = [{
				user_id: '27d1ca9e10b731476b7641eae2710ac0',
				favorite_group_id: 1,
				favorite_document_id: 1,
			}]

			const search_hisotry = [{
				id: 1,
				user_id: '27d1ca9e10b731476b7641eae2710ac0',
				clone_name: 'Test',
				search: 'Test',
				num_results: 20,
				had_error: false,
				run_at: 'Test',
				completion_time: 'Test',
				search_type: 'Test',
				cached_result: false,
				is_tutorial_search: false,
				tiny_url: 'gamechanger?tiny=24',
				request_body: {},
				search_version: 1
			}];

			const export_history = [{
				id: 1,
				user_id: '27d1ca9e10b731476b7641eae2710ac0',
				download_request_body: {},
				search_response_metadata: {}
			}];

			const api_key = 'testAPIKey';

			let returnFavoriteDocuments = [];
			let returnFavoriteSearches = [];
			let returnFavoriteTopics = [];
			let returnGCHistory = [];
			let returnExportHistory = [];
			const new_opts = {
				...opts,
				constants: {GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test', legislation_index: 'Test', assist_index: 'Test'}},
				externalAPI : {
					getAPIKey(user) {
						return api_key;
					}
				},
				dataApi: {
					queryElasticSearch(data) {
						return Promise.resolve({
							body: {
								hits: {
									hits: [
										{
											_source: {download_url_s: 'Test'},
											fields: {
												filename: ['Test'],
												summary_30: ['Test'],
												title: ['Test'],
												doc_type: ['Test'],
												doc_num: ['Test'],
												id: ['Test'],
											}
										}
									]
								}
							}
						});
					}
				},
				search: {
					convertTiny(data) {
						return Promise.resolve({url: 'Test'});
					}
				},
				favoriteDocument: {
					sequelize: {
						fn(data) {},
						col(data) {}
					},
					findAll(data) {
						if (data.hasOwnProperty('attributes')) {
							let count = 0;
							favorite_documents.forEach(favorite => {
								if (data.where.filename === favorite.filename) {
									count += 1;
								}
							});
							return Promise.resolve([{favorited_count: count}]);
						} else {
							returnFavoriteDocuments = [];
							favorite_documents.forEach(favorite => {
								if (data.where.user_id === favorite.user_id) {
									returnFavoriteDocuments.push(favorite);
								}
							});
							return Promise.resolve(returnFavoriteDocuments);
						}

					}
				},
				favoriteSearch: {
					sequelize: {
						fn(data) {},
						col(data) {}
					},
					findAll(data) {
						if (data.hasOwnProperty('attributes')) {
							let count = 0;
							favorite_searches.forEach(search => {
								if (data.where.tiny_url === search.tiny_url) {
									count += 1;
								}
							});
							return Promise.resolve([{favorited_count: count}]);
						} else {
							returnFavoriteSearches = [];
							favorite_searches.forEach(search => {
								if (data.where.user_id === search.user_id) {
									favorite_searches.push(search);
								}
							});
							return Promise.resolve(returnFavoriteSearches);
						}
					}
				},
				favoriteTopic: {
					sequelize: {
						fn(data) {},
						col(data) {}
					},
					findAll(data) {
						if (data.hasOwnProperty('attributes')) {
							let count = 0;
							favorite_topics.forEach(topic => {
								if (data.where.topic_name === topic.topic_name) {
									count += 1;
								}
							});
							return Promise.resolve([{favorited_count: count}]);
						} else {
							returnFavoriteTopics = [];
							favorite_topics.forEach(topic => {
								if (data.where.user_id === topic.user_id) {
									returnFavoriteTopics.push(topic);
								}
							});
							return Promise.resolve(returnFavoriteTopics);
						}
					}
				},
				favoriteOrganization: {
					sequelize: {
						fn(data) {},
						col(data) {}
					},
					findAll(data) {
						if (data.hasOwnProperty('attributes')) {
							let count = 0;
							favorite_organizations.forEach(org => {
								if (data.where.organization_name === org.organization_name) {
									count += 1;
								}
							});
							return Promise.resolve([{favorited_count: count}]);
						} else {
							returnFavoriteOrganizations = [];
							favorite_organizations.forEach(org => {
								if (data.where.user_id === org.user_id) {
									returnFavoriteOrganizations.push(org);
								}
							});
							return Promise.resolve(returnFavoriteOrganizations);
						}
					}
				},
				favoriteGroup: {
					sequelize: {
						fn(data) {},
						col(data) {}
					},
					findAll(data) {
						returnFavoriteGroups = [];
						favorite_groups.forEach(group => {
							if (data.where.user_id === group.user_id) {
								returnFavoriteGroups.push(group);
							}
						});
						return Promise.resolve(returnFavoriteGroups);
					}
				},
				favoriteDocumentsGroup: {
					sequelize: {
						fn(data) {},
						col(data) {}
					},
					findAll(data) {
						returnFavoriteDocumentsGroup = [];
						favorite_documents_groups.forEach(docGroup => {
							if (data.where.favorite_group_id === docGroup.favorite_group_id) {
								returnFavoriteDocumentsGroup.push(docGroup);
							}
						});
						return Promise.resolve(returnFavoriteDocumentsGroup);
					}
				},
				gcHistory: {
					findAll(data) {
						returnGCHistory = [];
						search_hisotry.forEach(search => {
							if (data.where.user_id === search.user_id) {
								returnGCHistory.push(search);
							}
						});
						return Promise.resolve(returnGCHistory);
					}
				},
				exportHistory: {
					findAll(data) {
						returnExportHistory = [];
						export_history.forEach(history => {
							if (data.where.user_id === history.user_id) {
								returnExportHistory.push(history);
							}
						});
						return Promise.resolve(returnExportHistory);
					}
				},
			};

			const target = new UserController(new_opts);

			const req = {
				...reqMock,
				body: {
					username: 'hashMe'
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
				}
			};

			try {
				await target.getUserData(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {'api_key': 'testAPIKey', 'export_history': [{'download_request_body': {}, 'id': 1, 'search_response_metadata': {}, 'user_id': '27d1ca9e10b731476b7641eae2710ac0'}], 'favorite_documents': [{'clone_index': 'Test', 'doc_num': 'Test', 'doc_type': 'Test', 'download_url_s': 'Test', 'favorite_id': 1, 'favorite_name': 'Test', 'favorite_summary': 'Test', 'favorited': 1, 'filename': 'Test', 'id': 'Test', 'is_clone': false, 'search_text': 'Test', 'summary': 'Test', 'title': 'Test Test Test', 'user_id': '27d1ca9e10b731476b7641eae2710ac0'}],'favorite_groups': [{'clone_index': 'Test', 'favorites': [1], 'group_description': 'Test', 'group_name': 'Test', 'group_type': 'document', 'id': 1, 'is_clone': true, 'user_id': '27d1ca9e10b731476b7641eae2710ac0'}], 'favorite_searches': [], 'favorite_topics': [{'clone_index': 'Test', 'favorited': 1, 'id': 1, 'is_clone': false, 'topic_name': 'Test', 'topic_summary': 'Test', 'user_id': '27d1ca9e10b731476b7641eae2710ac0'}], 'favorite_organizations': [{'clone_index': 'Test', 'favorited': 1, 'id': 1, 'is_clone': false, 'organization_name': 'Test', 'organization_summary': 'Test', 'user_id': '27d1ca9e10b731476b7641eae2710ac0'}], 'notifications': { 'gamechanger': {'favorites': 0, 'history': 0, 'total': 0} }, 'search_history': [{'cached_result': false, 'clone_name': 'Test', 'completion_time': 'Test', 'favorite': false, 'had_error': false, 'id': 1, 'is_tutorial_search': false, 'num_results': 20, 'request_body': {}, 'run_at': 'Test', 'search': 'Test', 'search_type': 'Test', 'search_version': 1, 'tiny_url': 'gamechanger?tiny=24', 'url': 'Test', 'user_id': '27d1ca9e10b731476b7641eae2710ac0'}], 'user_id': '27d1ca9e10b731476b7641eae2710ac0'};
			assert.deepStrictEqual(resMsg, expected);

		});
	});

	describe('#getUserSettings', () => {
		let users = [];
		const opts = {
			...constructorOptionsMock,
			dataApi: {},
			gcUser: {
				findOrCreate(data) {
					let user;

					users.forEach(tmpUser => {
						if (tmpUser.user_id === data.where.user_id) {
							user = tmpUser;
						}
					});

					if (user) {
						return Promise.resolve([user, false]);
					} else {
						user = {
							user_id: data.defaults.user_id,
							is_beta: false,
							search_settings: {},
							notifications: { gamechanger: { total: 0, favorites: 0, history: 0 } }
						};
						users.push(user);

						return Promise.resolve([user, true]);
					}
				}
			}
		};

		it('creates or returns a user settings', async () => {
			const target = new UserController(opts);

			const req = {
				...reqMock,
				body: {
					username: 'hashMe'
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
				await target.getUserSettings(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {'is_beta': false, 'notifications': { 'gamechanger': {'favorites': 0, 'history': 0, 'total': 0} }, 'search_settings': {}, 'submitted_info': true, 'user_id': '27d1ca9e10b731476b7641eae2710ac0'};
			assert.deepStrictEqual(resMsg, expected);
		});
	});

	describe('#setUserBetaStatus', () => {
		let users = [{user_id: '27d1ca9e10b731476b7641eae2710ac0', notifications: { gamechanger: { total: 0, favorites: 0, history: 0 } }, is_beta: false}];
		const opts = {
			...constructorOptionsMock,
			dataApi: {},
			gcUser: {
				update(data, where) {
					let user;

					users.forEach(tmpUser => {
						if (tmpUser.user_id === where.where.user_id) {
							user = tmpUser;
						}
					});

					if (user) {
						user.is_beta = data.is_beta;
						return Promise.resolve(data.is_beta);
					} else {
						return Promise.resolve('Fail');
					}
				}
			}
		};

		it('updates a users beta settings', async () => {
			const target = new UserController(opts);

			const req = {
				...reqMock,
				body: {
					status: true
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
				await target.setUserBetaStatus(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {is_beta: true, notifications: { gamechanger: {favorites: 0, history: 0, total: 0} }, user_id: '27d1ca9e10b731476b7641eae2710ac0'};
			assert.deepStrictEqual(users[0], expected);
		});
	});

	describe('#clearDashboardNotification', () => {
		let users = [
			{ user_id: '27d1ca9e10b731476b7641eae2710ac0', notifications: { gamechanger: { total: 0, favorites: 5, history: 0 } }, search_settings: {} },
			{ user_id: '0bd353b670d1d110d89797153f99edf3', notifications: {}, search_settings: {} },
		];
		const sequelize = {
			transaction: jest.fn(async function(fn) {
				const transactionObj = { LOCK: { UPDATE: 'UPDATE' } };
				await fn(transactionObj);
			}),
		};
		const opts = {
			...constructorOptionsMock,
			dataApi: {},
			sequelize,
			gcUser: {
				findOne(data) {
					const user = users.find(user => user.user_id === data.where.user_id);
					return Promise.resolve(user);
				},
				update(data, where) {
					let user = users.find(user => user.user_id === where.user_id);
					if (user) {
						user.notifications = data.notifications;
						return Promise.resolve();
					} else {
						return Promise.reject('Fail');
					}
				}
			}
		};

		const res = {
			status(_code) {
				return this;
			},
			send(_msg) {
				return this;
			}
		};

		it('clear dashboard notifications', async () => {
			const target = new UserController(opts);

			const req = {
				...reqMock,
				body: {
					type: 'favorites',
					cloneName: 'gamechanger'
				}
			};

			await target.clearDashboardNotification(req, res);
			const expected = { notifications: { gamechanger: { favorites: 0, history: 0, total: 0 } }, search_settings: {}, user_id: '27d1ca9e10b731476b7641eae2710ac0' };
			assert.deepStrictEqual(users[0], expected);
		});

		it('clear dashboard notifications is a no-op on empty notifications', async () => {
			const logger = {
				...constructorOptionsMock.logger,
				error: jest.fn(),
			};
			const target = new UserController({...opts, logger});

			const req = {
				...reqMock,
				headers: {
					SSL_CLIENT_S_DN_CN: 'testsuite2'
				},
				body: {
					type: 'favorites',
					cloneName: 'gamechanger'
				}
			};

			await target.clearDashboardNotification(req, res);
			const expected = { notifications: {}, search_settings: {}, user_id: '0bd353b670d1d110d89797153f99edf3' };
			assert.deepStrictEqual(users[1], expected);
			expect(logger.error).not.toHaveBeenCalled();
		});
	});

	describe('#updateUserAPIRequestLimit', () => {
		let users = []
		const opts = {
			...constructorOptionsMock,
			sequelize: {
				literal(exp) {
					return
				}
			},
			gcUser: {
				update(data, where) {
					let user;

					users.forEach(tmpUser => {
						if (tmpUser.user_id === where.where.user_id) {
							user = tmpUser;
						}
					});

					if (user) {
						user.api_requests = user.api_requests-1;
						return Promise.resolve();
					} else {
						return Promise.resolve('Fail');
					}
				}
			}
		}
		
		it('should decrement the users API request limit by one', async () => {
			users.push({user_id: '27d1ca9e10b731476b7641eae2710ac0', notifications: { gamechanger: { total: 0, favorites: 0, history: 0 }}});
			const target = new UserController(opts);

			let resCode;
			let resMsg;

			const req = {
				...reqMock,
				body: {
					username: 'hashMe'
				}
			}

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
				await target.updateUserAPIRequestLimit(req, res);
			} catch (e) {
				assert.fail(e);
			}
			assert.equal(resCode, 200);
		})
	})

	describe('#submitUserInfo', () => {
		let users = [{user_id: '27d1ca9e10b731476b7641eae2710ac0', user_info: null, submitted_info: null}];
		const opts = {
			...constructorOptionsMock,
			dataApi: {},
			gcUser: {
				update(data, where) {
					let user;

					users.forEach(tmpUser => {
						if (tmpUser.user_id === where.where.user_id) {
							user = tmpUser;
						}
					});

					if (user) {
						user.user_info = data.user_info;
						user.submitted_info = data.submitted_info;
						return Promise.resolve(data);
					} else {
						return Promise.resolve('Fail');
					}
				}
			}
		};

		it('saves a users response to user info form', async () => {
			const target = new UserController(opts);

			const req = {
				...reqMock,
				body: {
					email: 'test@example.com',
					org: 'org',
					q1: 'a1',
					q2: 'a2'
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
				await target.submitUserInfo(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {user_info:{ email: 'test@example.com', org: 'org', q1: 'a1', q2: 'a2'}, submitted_info: true, user_id: '27d1ca9e10b731476b7641eae2710ac0'};
			assert.deepStrictEqual(users[0], expected);
			assert.equal(resCode, 200);
		});
	});

	describe('#resetAPIRequestLimit', () => {
		it('should reset all API request limits to 3', async () => {
			const id = {
				getDataValue() { return 1; }
			};

			const gcUser = {
				findAll() {
					return [id];
				},
				update(data, where) {
					if (data.api_requests === 3 && where.where.id.length > 0) {
						return Promise.resolve([1, 1]);
					} else {
						return Promise.resolve('Fail');
					}
				}
			};

			const opts = {
				...constructorOptionsMock,
				gcUser
			};
			
			const target = new UserController(opts);
			const actual = await target.resetAPIRequestLimit();
			const expected = 1;

			assert.equal(actual, expected);
		});
	});

	describe('#populateNewUserId', () => {
		it('should update user ids in the tables', async () => {
			const user = {
				dataValues: {
					user_id: 1,
					new_user_id: 2
				}
			};

			const gcHistoryTable = {
				findAll() {
					return [user];
				},
				update(data, where) {
					if (data.new_user_id === 2 && where.where.user_id === 1) {
						return Promise.resolve();
					} else {
						return Promise.resolve('Fail');
					}
				}
			};

			const table = {
				findAll() {
					return [];
				}
			};

			const opts = {
				...constructorOptionsMock,
				gcHistory: gcHistoryTable,
				exportHistory: table,
				favoriteDocument: table,
				favoriteSearch: table,
				favoriteTopic: table
			};
			
			const target = new UserController(opts);

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
				await target.populateNewUserId(req, res);
			} catch (e) {
				assert.fail();
			}

			assert.equal(resCode, 200);
		});
	});

	describe('#getRecentSearches', () => {
		it('should get recent searches', async () => {
			const ids = [{ id: 1 }];

			const searches = [{
				request_body: { test: 'test' },
				run_at: 1
			}];

			const gcHistory = {
				findAll(data) {
					if (data.group){
						return Promise.resolve(ids);
					} else {
						return Promise.resolve(searches);
					}
				}
			};

			const opts = {
				...constructorOptionsMock,
				gcHistory
			};
			
			const target = new UserController(opts);

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
				await target.getRecentSearches(req, res);
			} catch (e) {
				assert.fail();
			}

			const expected = [{
				run_at: 1,
				test: 'test'
			}];

			assert.equal(resCode, 200);
			assert.deepStrictEqual(resMsg, expected);
		});
	});
});
