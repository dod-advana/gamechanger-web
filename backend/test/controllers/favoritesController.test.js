const assert = require('assert');
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
});
