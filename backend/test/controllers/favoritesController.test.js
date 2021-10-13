const assert = require('assert');
const Sequelize = require('sequelize');
const { FavoritesController } = require('../../node_app/controllers/favoritesController');
const { constructorOptionsMock, reqMock } = require('../resources/testUtility');

describe('FavoritesController', function () {

	describe('#favoriteTopicPOST', () => {
		it('should create a favorite topic', (done) => {
			const apiResMock = [{}, true];
			const expectedReturn = {};
			const statusMock = 200;
			const constants = {
				env: {
					GAME_CHANGER_OPTS: {
						version: 'version'
					}
				}
			};

			const favoriteTopic = {
				findOrCreate() {
					return Promise.resolve(apiResMock);
				}
			};

			const opts = {
				...constructorOptionsMock,
				constants,
				favoriteTopic,
				handler_factory: {}
			};
			const target = new FavoritesController(opts);

			const req = {
				...reqMock,
				body: {
					is_favorite: true,
					topic: 'national security'
				}
			};

			let resMsg;
			let resCode;
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
				target.favoriteTopicPOST(req, res).then(() => {
					assert.equal(resCode, statusMock);
					assert.deepEqual(resMsg, expectedReturn);
					done();
				});
			} catch (e) {
				assert.fail(e);
			}
		});
	});

	describe('#favoriteOrganizationPOST', () => {
		it('should create a favorite organization', (done) => {
			const apiResMock = [{}, true];
			const expectedReturn = {};
			const statusMock = 200;
			const constants = {
				env: {
					GAME_CHANGER_OPTS: {
						version: 'version'
					}
				}
			};

			const favoriteOrganization = {
				findOrCreate() {
					return Promise.resolve(apiResMock);
				}
			};

			const opts = {
				...constructorOptionsMock,
				constants,
				favoriteOrganization,
				handler_factory: {}
			};
			const target = new FavoritesController(opts);

			const req = {
				...reqMock,
				body: {
					is_favorite: true,
					organization: 'United States Navy'
				}
			};

			let resMsg;
			let resCode;
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
				target.favoriteOrganizationPOST(req, res).then(() => {
					assert.equal(resCode, statusMock);
					assert.deepEqual(resMsg, expectedReturn);
					done();
				});
			} catch (e) {
				assert.fail(e);
			}
		});
	});

	describe('#favoriteDocumentPOST', () => {
		it('should create a favorite document', (done) => {
			const apiResMock = [{}, true];
			const expectedReturn = {};
			const statusMock = 200;
			const constants = {
				env: {
					GAME_CHANGER_OPTS: {
						version: 'version'
					}
				}
			};

			const favoriteDocument = {
				findOrCreate() {
					return Promise.resolve(apiResMock);
				}
			};

			const opts = {
				...constructorOptionsMock,
				constants,
				favoriteDocument,
				handler_factory: {}
			};
			const target = new FavoritesController(opts);

			const req = {
				...reqMock,
				body: {
					is_favorite: true,
					topic: 'national security'
				}
			};

			let resMsg;
			let resCode;
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
				target.favoriteDocumentPOST(req, res).then(() => {
					assert.equal(resCode, statusMock);
					assert.deepEqual(resMsg, expectedReturn);
					done();
				});
			} catch (e) {
				assert.fail(e);
			}
		});
	});

	describe('#favoriteGroupPOST', () => {
		it('should create a new group for favorites', (done) => {
			const apiResMock = [{}, true];
			const expectedReturn = {};
			const statusMock = 200;
			const constants = {
				env: {
					GAME_CHANGER_OPTS: {
						version: 'version'
					}
				}
			};

			const favoriteGroup = {
				findOrCreate() {
					return Promise.resolve(apiResMock);
				}
			};

			const opts = {
				...constructorOptionsMock,
				constants,
				favoriteGroup,
				handler_factory: {}
			};
			const target = new FavoritesController(opts);

			const req = {
				...reqMock,
				body: {
					group_type: "document", 
					group_name: "Test", 
					group_description: "Test",
					create: true
				}
			};

			let resMsg;
			let resCode;
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
				target.favoriteGroupPOST(req, res).then(() => {
					assert.equal(resCode, statusMock);
					assert.deepEqual(resMsg, expectedReturn);
					done();
				});
			} catch (e) {
				assert.fail(e);
			}
		});
	});

	describe('#addToFavoriteGroupPOST', () => {
		it('should add a favorite to a group', (done) => {
			const apiResMock = [{}];
			const expectedReturn = {};
			const statusMock = 200;
			const constants = {
				env: {
					GAME_CHANGER_OPTS: {
						version: 'version'
					}
				}
			};

			const favoriteDocumentsGroup = {
				findAll() {
					return Promise.resolve([]);
				},
				bulkCreate() {
					return Promise.resolve(apiResMock);
				}
			}

			const opts = {
				...constructorOptionsMock,
				constants,
				favoriteDocumentsGroup,
				handler_factory: {}
			};
			const target = new FavoritesController(opts);

			const req = {
				...reqMock,
				body: {
					groupId: 1, 
					documentIds: [1]
				}
			};

			let resMsg;
			let resCode;
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
				target.addToFavoriteGroupPOST(req, res).then(() => {
					assert.equal(resCode, statusMock);
					assert.deepEqual(resMsg, expectedReturn);
					done();
				});
			} catch (e) {
				assert.fail(e);
			}
		});
	});

	describe('#deleteFavoriteFromGroupPOST', () => {
		it('should delete a favorite from a group', (done) => {
			const expectedReturn = {"removed": 1};
			const statusMock = 200;
			const constants = {
				env: {
					GAME_CHANGER_OPTS: {
						version: 'version'
					}
				}
			};

			const favoriteDocumentsGroup = {
				destroy() {
					return Promise.resolve(1);
				}
			}

			const opts = {
				...constructorOptionsMock,
				constants,
				favoriteDocumentsGroup,
				handler_factory: {}
			};
			const target = new FavoritesController(opts);

			const req = {
				...reqMock,
				body: {
					groupId: 1, 
					documentId: 1
				}
			};

			let resMsg;
			let resCode;
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
				target.deleteFavoriteFromGroupPOST(req, res).then(() => {
					assert.equal(resCode, statusMock);
					assert.deepEqual(resMsg, expectedReturn);
					done();
				});
			} catch (e) {
				assert.fail(e);
			}
		});
	});

	describe('#clearFavoriteSearchUpdate', () => {
		it('should clear a favorite search update flag', (done) => {
			const expectedReturn = [
				{
					user_id: '27d1ca9e10b731476b7641eae2710ac0',
					tiny_url: 'Test',
					updated_results: false
				}
			];
			const statusMock = 200;
			const constants = {
				env: {
					GAME_CHANGER_OPTS: {
						version: 'version'
					}
				}
			};

			const favorites = [
				{
					user_id: '27d1ca9e10b731476b7641eae2710ac0',
					tiny_url: 'Test',
					updated_results: true
				}
			];
			const favoriteSearch = {
				update(data, where) {
					favorites.forEach(favorite => {
						if (favorite.user_id === where.where.user_id && favorite.tiny_url === where.where.tiny_url) {
							favorite.updated_results = data.updated_results;
						}
					});
					return Promise.resolve(true);
				}
			};

			const opts = {
				...constructorOptionsMock,
				constants,
				favoriteSearch,
				handler_factory: {}
			};
			const target = new FavoritesController(opts);

			const req = {
				...reqMock,
				body: {
					tinyurl: 'Test',
				}
			};

			let resMsg;
			let resCode;
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
				target.clearFavoriteSearchUpdate(req, res).then(() => {
					assert.equal(resCode, statusMock);
					assert.deepEqual(favorites, expectedReturn);
					done();
				});
			} catch (e) {
				assert.fail(e);
			}
		});
	});

	describe('#checkLeastRecentFavoritedSearch', () => {
		it('should check the least recent favorited search and increment existing notifications', async () => {
			const favoriteSaves = [];
			const initFavorite = {
				user_id: '54baea34480635caea8437904697bd9c',
				tiny_url: 'gamechanger?tiny=77',
				document_count: 100,
				updated_results: false,
				last_checked: new Date(0),
				save: jest.fn(async function() {
					favoriteSaves.push({...this});
				}),
			};
			const favorite = {...initFavorite};
			const favoriteSearch = {
				findOne: jest.fn(async () => favorite),
			};
			const searchHistory = {
				request_body: {
					cloneName: 'gamechanger',
					searchText: 'pizza',
					offset: 0,
					limit: 10,
					searchVersion: 1,
				},
			};
			const gcHistory = {
				findOne: jest.fn(async() => searchHistory),
			};
			const searchResult = {
				totalCount: 101,
			};
			const searchHandler = {
				search: jest.fn(async () => searchResult),
			};
			const handler_factory = {
				createHandler: jest.fn(() => searchHandler),
			};
			const userSaves = [];
			const initUser = {
				notifications: { gamechanger: { favorites: 1, history: 1, total: 1 } },
				save: jest.fn(async function() {
					userSaves.push({...this});
				}),
			};
			const user = initUser;
			const gcUser = {
				findOne: jest.fn(async () => user),
			};
			const transactionObj = { LOCK: { UPDATE: 'UPDATE' } };
			const sequelize = {
				transaction: jest.fn(async function(fn) {
					await fn(transactionObj);
				}),
			};
			const logger = {
				...constructorOptionsMock.logger,
				error: jest.fn(),
			};

			const opts = {
				...constructorOptionsMock,
				favoriteSearch,
				gcHistory,
				gcUser,
				handler_factory,
				sequelize,
				logger,
			};

			const target = new FavoritesController(opts);
			await target.checkLeastRecentFavoritedSearch();
			
			expect(favoriteSearch.findOne).toHaveBeenCalledTimes(1);
			expect(favoriteSearch.findOne).toHaveBeenCalledTimes(1);
			expect(favoriteSearch.findOne).toHaveBeenCalledWith({
				order: [['last_checked', 'ASC'], ['id', 'ASC']],
			});

			expect(favorite.save).toHaveBeenCalledTimes(2);
			expect(favorite.save).toHaveBeenCalledWith();
			expect(favorite.save).toHaveBeenCalledWith({ transaction: transactionObj });
			assert.deepStrictEqual(favoriteSaves[0], {...initFavorite, last_checked: Sequelize.fn('NOW')});
			assert.deepStrictEqual(favoriteSaves[1], {
				...initFavorite, 
				last_checked: Sequelize.fn('NOW'),
				document_count: 101,
				updated_results: true,
			});

			expect(gcHistory.findOne).toHaveBeenCalledTimes(1);
			expect(gcHistory.findOne).toHaveBeenCalledWith({
				where: {
					user_id: '54baea34480635caea8437904697bd9c',
					tiny_url: 'gamechanger?tiny=77',
				},
				order: [['run_at', 'DESC']]
			});

			expect(handler_factory.createHandler).toHaveBeenCalledTimes(1);
			expect(handler_factory.createHandler).toHaveBeenCalledWith('search', 'gamechanger');

			expect(searchHandler.search).toHaveBeenCalledTimes(1);
			expect(searchHandler.search).toHaveBeenCalledWith('pizza', 0, 10, {
				cloneName: 'gamechanger',
				searchText: 'pizza',
				offset: 0,
				limit: 10,
				searchVersion: 1,
			}, 'gamechanger', ['Webapp Super Admin', 'Tier 3 Support'], null, false);

			expect(gcUser.findOne).toHaveBeenCalledTimes(1);
			expect(gcUser.findOne).toHaveBeenCalledWith({ 
				where: { user_id: '54baea34480635caea8437904697bd9c' },
				lock: transactionObj.LOCK.UPDATE,
				transaction: transactionObj,
			});

			expect(user.save).toHaveBeenCalledTimes(1);
			expect(user.save).toHaveBeenCalledWith({ transaction: transactionObj });
			assert.deepStrictEqual(userSaves[0], {
				...initUser, 
				notifications: { gamechanger: { favorites: 2, history: 1, total: 2 } },
			});

			expect(logger.error).not.toHaveBeenCalled();
		});

		it('should check the least recent favorited search and create new notifications if none exist', async () => {
			const favoriteSaves = [];
			const initFavorite = {
				user_id: '54baea34480635caea8437904697bd9c',
				tiny_url: 'covid19?tiny=77',
				document_count: 100,
				updated_results: false,
				last_checked: new Date(0),
				save: jest.fn(async function() {
					favoriteSaves.push({...this});
				}),
			};
			const favorite = {...initFavorite};
			const favoriteSearch = {
				findOne: jest.fn(async () => favorite),
			};
			const searchHistory = {
				request_body: {
					cloneName: 'covid19',
					searchText: 'pizza',
					offset: 0,
					limit: 10,
					searchVersion: 1,
				},
			};
			const gcHistory = {
				findOne: jest.fn(async() => searchHistory),
			};
			const searchResult = {
				totalCount: 101,
			};
			const searchHandler = {
				search: jest.fn(async () => searchResult),
			};
			const handler_factory = {
				createHandler: jest.fn(() => searchHandler),
			};
			const userSaves = [];
			const initUser = {
				notifications: { gamechanger: { favorites: 1, history: 1, total: 1 } },
				save: jest.fn(async function() {
					userSaves.push({...this});
				}),
			};
			const user = initUser;
			const gcUser = {
				findOne: jest.fn(async () => user),
			};
			const transactionObj = { LOCK: { UPDATE: 'UPDATE' } };
			const sequelize = {
				transaction: jest.fn(async function(fn) {
					await fn(transactionObj);
				}),
			};
			const logger = {
				...constructorOptionsMock.logger,
				error: jest.fn(),
			};

			const opts = {
				...constructorOptionsMock,
				favoriteSearch,
				gcHistory,
				gcUser,
				handler_factory,
				sequelize,
				logger,
			};

			const target = new FavoritesController(opts);
			await target.checkLeastRecentFavoritedSearch();
			
			expect(favoriteSearch.findOne).toHaveBeenCalledTimes(1);
			expect(favoriteSearch.findOne).toHaveBeenCalledTimes(1);
			expect(favoriteSearch.findOne).toHaveBeenCalledWith({
				order: [['last_checked', 'ASC'], ['id', 'ASC']],
			});

			expect(favorite.save).toHaveBeenCalledTimes(2);
			expect(favorite.save).toHaveBeenCalledWith();
			expect(favorite.save).toHaveBeenCalledWith({ transaction: transactionObj });
			assert.deepStrictEqual(favoriteSaves[0], {...initFavorite, last_checked: Sequelize.fn('NOW')});
			assert.deepStrictEqual(favoriteSaves[1], {
				...initFavorite, 
				last_checked: Sequelize.fn('NOW'),
				document_count: 101,
				updated_results: true,
			});

			expect(gcHistory.findOne).toHaveBeenCalledTimes(1);
			expect(gcHistory.findOne).toHaveBeenCalledWith({
				where: {
					user_id: '54baea34480635caea8437904697bd9c',
					tiny_url: 'covid19?tiny=77',
				},
				order: [['run_at', 'DESC']]
			});

			expect(handler_factory.createHandler).toHaveBeenCalledTimes(1);
			expect(handler_factory.createHandler).toHaveBeenCalledWith('search', 'covid19');

			expect(searchHandler.search).toHaveBeenCalledTimes(1);
			expect(searchHandler.search).toHaveBeenCalledWith('pizza', 0, 10, {
				cloneName: 'covid19',
				searchText: 'pizza',
				offset: 0,
				limit: 10,
				searchVersion: 1,
			}, 'covid19', ['Webapp Super Admin', 'Tier 3 Support'], null, false);

			expect(gcUser.findOne).toHaveBeenCalledTimes(1);
			expect(gcUser.findOne).toHaveBeenCalledWith({ 
				where: { user_id: '54baea34480635caea8437904697bd9c' },
				lock: transactionObj.LOCK.UPDATE,
				transaction: transactionObj,
			});

			expect(user.save).toHaveBeenCalledTimes(1);
			expect(user.save).toHaveBeenCalledWith({ transaction: transactionObj });
			assert.deepStrictEqual(userSaves[0], {
				...initUser, 
				notifications: { 
					covid19: { favorites: 1, history: 0, total: 1 },
					gamechanger: { favorites: 1, history: 1, total: 1 }
				},
			});

			expect(logger.error).not.toHaveBeenCalled();
		});

		it('should only update the last checked timestamp if the number of search results has not changed', async () => {
			const favoriteSaves = [];
			const initFavorite = {
				user_id: '54baea34480635caea8437904697bd9c',
				tiny_url: 'gamechanger?tiny=77',
				document_count: 100,
				updated_results: false,
				last_checked: new Date(0),
				save: jest.fn(async function() {
					favoriteSaves.push({...this});
				}),
			};
			const favorite = {...initFavorite};
			const favoriteSearch = {
				findOne: jest.fn(async () => favorite),
			};
			const searchHistory = {
				request_body: {
					cloneName: 'gamechanger',
					searchText: 'pizza',
					offset: 0,
					limit: 10,
					searchVersion: 1,
				},
			};
			const gcHistory = {
				findOne: jest.fn(async() => searchHistory),
			};
			const searchResult = {
				totalCount: 100,
			};
			const searchHandler = {
				search: jest.fn(async () => searchResult),
			};
			const handler_factory = {
				createHandler: jest.fn(() => searchHandler),
			};
			const userSaves = [];
			const initUser = {
				notifications: { gamechanger: { favorites: 0, history: 0, total: 0 } },
				save: jest.fn(async function() {
					userSaves.push({...this});
				}),
			};
			const user = initUser;
			const gcUser = {
				findOne: jest.fn(async () => user),
			};
			const transactionObj = { LOCK: { UPDATE: 'UPDATE' } };
			const sequelize = {
				transaction: jest.fn(async function(fn) {
					await fn(transactionObj);
				}),
			};
			const logger = {
				...constructorOptionsMock.logger,
				error: jest.fn(),
			};

			const opts = {
				...constructorOptionsMock,
				favoriteSearch,
				gcHistory,
				gcUser,
				handler_factory,
				sequelize,
				logger,
			};

			const target = new FavoritesController(opts);
			await target.checkLeastRecentFavoritedSearch();

			expect(favorite.save).toHaveBeenCalledTimes(1);
			expect(favorite.save).toHaveBeenCalledWith();
			assert.deepStrictEqual(favoriteSaves[0], {...initFavorite, last_checked: Sequelize.fn('NOW')});

			expect(user.save).not.toHaveBeenCalled();

			expect(logger.error).not.toHaveBeenCalled();
		});

		it('should not update user notifications if the favorite update is already flagged', async () => {
			const favoriteSaves = [];
			const initFavorite = {
				user_id: '54baea34480635caea8437904697bd9c',
				tiny_url: 'gamechanger?tiny=77',
				document_count: 100,
				updated_results: true,
				last_checked: new Date(0),
				save: jest.fn(async function() {
					favoriteSaves.push({...this});
				}),
			};
			const favorite = {...initFavorite};
			const favoriteSearch = {
				findOne: jest.fn(async () => favorite),
			};
			const searchHistory = {
				request_body: {
					cloneName: 'gamechanger',
					searchText: 'pizza',
					offset: 0,
					limit: 10,
					searchVersion: 1,
				},
			};
			const gcHistory = {
				findOne: jest.fn(async() => searchHistory),
			};
			const searchResult = {
				totalCount: 101,
			};
			const searchHandler = {
				search: jest.fn(async () => searchResult),
			};
			const handler_factory = {
				createHandler: jest.fn(() => searchHandler),
			};
			const userSaves = [];
			const initUser = {
				notifications: { gamechanger: { favorites: 0, history: 0, total: 0 } },
				save: jest.fn(async function() {
					userSaves.push({...this});
				}),
			};
			const user = initUser;
			const gcUser = {
				findOne: jest.fn(async () => user),
			};
			const transactionObj = { LOCK: { UPDATE: 'UPDATE' } };
			const sequelize = {
				transaction: jest.fn(async function(fn) {
					await fn(transactionObj);
				}),
			};
			const logger = {
				...constructorOptionsMock.logger,
				error: jest.fn(),
			};

			const opts = {
				...constructorOptionsMock,
				favoriteSearch,
				gcHistory,
				gcUser,
				handler_factory,
				sequelize,
				logger,
			};

			const target = new FavoritesController(opts);
			await target.checkLeastRecentFavoritedSearch();

			expect(favorite.save).toHaveBeenCalledTimes(2);
			expect(favorite.save).toHaveBeenCalledWith();
			expect(favorite.save).toHaveBeenCalledWith();
			assert.deepStrictEqual(favoriteSaves[0], {...initFavorite, last_checked: Sequelize.fn('NOW')});
			assert.deepStrictEqual(favoriteSaves[1], {
				...initFavorite, 
				last_checked: Sequelize.fn('NOW'),
				document_count: 101,
				updated_results: true,
			});

			expect(gcUser.findOne).not.toHaveBeenCalled();

			expect(user.save).not.toHaveBeenCalled();

			expect(logger.error).not.toHaveBeenCalled();
		});

		it('should not update user notifications if the document count decreases', async () => {
			const favoriteSaves = [];
			const initFavorite = {
				user_id: '54baea34480635caea8437904697bd9c',
				tiny_url: 'gamechanger?tiny=77',
				document_count: 100,
				updated_results: false,
				last_checked: new Date(0),
				save: jest.fn(async function() {
					favoriteSaves.push({...this});
				}),
			};
			const favorite = {...initFavorite};
			const favoriteSearch = {
				findOne: jest.fn(async () => favorite),
			};
			const searchHistory = {
				request_body: {
					cloneName: 'gamechanger',
					searchText: 'pizza',
					offset: 0,
					limit: 10,
					searchVersion: 1,
				},
			};
			const gcHistory = {
				findOne: jest.fn(async() => searchHistory),
			};
			const searchResult = {
				totalCount: 99,
			};
			const searchHandler = {
				search: jest.fn(async () => searchResult),
			};
			const handler_factory = {
				createHandler: jest.fn(() => searchHandler),
			};
			const userSaves = [];
			const initUser = {
				notifications: { gamechanger: { favorites: 0, history: 0, total: 0 } },
				save: jest.fn(async function() {
					userSaves.push({...this});
				}),
			};
			const user = initUser;
			const gcUser = {
				findOne: jest.fn(async () => user),
			};
			const transactionObj = { LOCK: { UPDATE: 'UPDATE' } };
			const sequelize = {
				transaction: jest.fn(async function(fn) {
					await fn(transactionObj);
				}),
			};
			const logger = {
				...constructorOptionsMock.logger,
				error: jest.fn(),
			};

			const opts = {
				...constructorOptionsMock,
				favoriteSearch,
				gcHistory,
				gcUser,
				handler_factory,
				sequelize,
				logger,
			};

			const target = new FavoritesController(opts);
			await target.checkLeastRecentFavoritedSearch();

			expect(favorite.save).toHaveBeenCalledTimes(2);
			expect(favorite.save).toHaveBeenCalledWith();
			expect(favorite.save).toHaveBeenCalledWith();
			assert.deepStrictEqual(favoriteSaves[0], {...initFavorite, last_checked: Sequelize.fn('NOW')});
			assert.deepStrictEqual(favoriteSaves[1], {
				...initFavorite, 
				last_checked: Sequelize.fn('NOW'),
				document_count: 99,
				updated_results: false,
			});

			expect(gcUser.findOne).not.toHaveBeenCalled();

			expect(user.save).not.toHaveBeenCalled();

			expect(logger.error).not.toHaveBeenCalled();
		});

		it('should do nothing if there are no favorite searches to check', async () => {
			const favorite = null;
			const favoriteSearch = {
				findOne: jest.fn(async () => favorite),
			};
			const searchHistory = null;
			const gcHistory = {
				findOne: jest.fn(async() => searchHistory),
			};
			const searchResult = null;
			const searchHandler = {
				search: jest.fn(async () => searchResult),
			};
			const handler_factory = {
				createHandler: jest.fn(() => searchHandler),
			};
			const user = null;
			const gcUser = {
				findOne: jest.fn(async () => user),
			};
			const transactionObj = { LOCK: { UPDATE: 'UPDATE' } };
			const sequelize = {
				transaction: jest.fn(async function(fn) {
					await fn(transactionObj);
				}),
			};
			const logger = {
				...constructorOptionsMock.logger,
				error: jest.fn(),
			};

			const opts = {
				...constructorOptionsMock,
				favoriteSearch,
				gcHistory,
				gcUser,
				handler_factory,
				sequelize,
				logger,
			};

			const target = new FavoritesController(opts);
			await target.checkLeastRecentFavoritedSearch();
			
			expect(favoriteSearch.findOne).toHaveBeenCalledTimes(1);

			expect(gcHistory.findOne).not.toHaveBeenCalled();

			expect(handler_factory.createHandler).not.toHaveBeenCalled();

			expect(searchHandler.search).not.toHaveBeenCalled();

			expect(gcUser.findOne).not.toHaveBeenCalled();

			expect(logger.error).not.toHaveBeenCalled();
		});
	});
});
