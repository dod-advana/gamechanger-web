const assert = require('assert');
const { AppStatsController } = require('../../node_app/controllers/appStatsController');
const { reqMock, resMock } = require('../resources/testUtility');

describe('AppStatsController', function () {

	describe('#getAppStats', () => {

		it('should get application stats', async (done) => {

			let constants = {
				env: {
					MATOMO_DB_CONFIG: {
						host: 'fakeHost',
						user: 'fakeUser',
						password: 'fakePassword',
						database: 'fakeDatabase'
					}
				}
			};
			let mysqlParams = null;
			let connectCalled = false;
			let endCalled = false;
			let queries = [];
			let counter = 0;
			let expectedResponses = [
				[{avg_search_count: 13}],
				[
					{
						search: 'fakeSearch1',
						count: 32
					},
					{
						search: 'fakeSearch2',
						count: 16
					}
				]
			];
			const mySqlConnection = {
				connect: () => {
					connectCalled = true;
				},
				end: () => {
					endCalled = true;
				},
				query: (query, callback) => {
					queries.push(query);
					let response = expectedResponses[counter];
					counter++;
					callback(null, response, []);
				}
			};
			const mysql_lib = {
				createConnection: (params) => {
					mysqlParams = params;
					return mySqlConnection;
				}
			};
			const opts = {mysql_lib, constants};
			const req = {body: {isClone: false, cloneData: {clone_name: 'gamechanger'}, internalUsers: [], daysAgo: 7}};
			let passedCode = null;
			let sentData = null;
			const res = {
				status: (code) => {
					passedCode = code;
					return {
						send: (data) => {
							sentData = data;
						}
					};
				}
			};

			const expectedData = {daysBack: 7, data: {avgSearchesPerSession: 13, blacklist: [], cloneData: {clone_name: 'gamechanger'}, excluding: [], topSearches: {topN: 10, data: [{search: 'fakeSearch1', count: 32}, {search: 'fakeSearch2', count: 16}]}}};

			const target = new AppStatsController(opts);
			await target.getAppStats(req, res);
			assert.equal(passedCode, 200);
			assert.deepEqual(sentData, expectedData);
			done();
		});


		it('should get application stats with clone data', async (done) => {

			let constants = {
				env: {
					MATOMO_DB_CONFIG: {
						host: 'fakeHost',
						user: 'fakeUser',
						password: 'fakePassword',
						database: 'fakeDatabase'
					}
				}
			};
			let mysqlParams = null;
			let connectCalled = false;
			let endCalled = false;
			let queries = [];
			let counter = 0;
			let expectedResponses = [
				[{avg_search_count: 13}],
				[
					{
						search: 'fakeSearch1',
						count: 32
					},
					{
						search: 'fakeSearch2',
						count: 16
					}
				]
			];
			const mySqlConnection = {
				connect: () => {
					connectCalled = true;
				},
				end: () => {
					endCalled = true;
				},
				query: (query, callback) => {
					queries.push(query);
					let response = expectedResponses[counter];
					counter++;
					callback(null, response, []);
				}
			};
			const mysql_lib = {
				createConnection: (params) => {
					mysqlParams = params;
					return mySqlConnection;
				}
			};
			const opts = {mysql_lib, constants};
			const req = {body: {isClone: true, cloneData: {clone_name: 'test'}, internalUsers: [], daysAgo: 7}};
			let passedCode = null;
			let sentData = null;
			const res = {
				status: (code) => {
					passedCode = code;
					return {
						send: (data) => {
							sentData = data;
						}
					};
				}
			};

			const expectedData = {data: {avgSearchesPerSession: 13, blacklist: [], cloneData: {clone_name: 'test'}, excluding: [], topSearches: {data: [{count: 32, search: 'fakeSearch1'}, {count: 16, search: 'fakeSearch2'}], topN: 10}}, daysBack: 7};
			const target = new AppStatsController(opts);
			await target.getAppStats(req, res);
			assert.equal(passedCode, 200);
			assert.deepEqual(sentData, expectedData);
			done();
		});

		it('should get application stats with internal users to exclude', async (done) => {

			let constants = {
				env: {
					MATOMO_DB_CONFIG: {
						host: 'fakeHost',
						user: 'fakeUser',
						password: 'fakePassword',
						database: 'fakeDatabase'
					}
				}
			};
			let mysqlParams = null;
			let connectCalled = false;
			let endCalled = false;
			let queries = [];
			let counter = 0;
			let expectedResponses = [
				[{avg_search_count: 13}],
				[
					{
						search: 'fakeSearch1',
						count: 32
					},
					{
						search: 'fakeSearch2',
						count: 16
					}
				]
			];
			const mySqlConnection = {
				connect: () => {
					connectCalled = true;
				},
				end: () => {
					endCalled = true;
				},
				query: (query, callback) => {
					queries.push(query);
					let response = expectedResponses[counter];
					counter++;
					callback(null, response, []);
				}
			};
			const mysql_lib = {
				createConnection: (params) => {
					mysqlParams = params;
					return mySqlConnection;
				}
			};
			const opts = {mysql_lib, constants};
			const req = {body: {isClone: false, cloneData: {clone_name: 'game_changer'}, internalUsers: ['testUser'], daysAgo: 7}};
			let passedCode = null;
			let sentData = null;
			const res = {
				status: (code) => {
					passedCode = code;
					return {
						send: (data) => {
							sentData = data;
						}
					};
				}
			};

			const expectedData = {data: {avgSearchesPerSession: 13, blacklist: [], cloneData: {clone_name: 'game_changer'}, excluding: ['testUser'], topSearches: {data: [{count: 32, search: 'fakeSearch1'}, {count: 16, search: 'fakeSearch2'}], topN: 10}}, daysBack: 7};
			const target = new AppStatsController(opts);
			await target.getAppStats(req, res);
			assert.equal(passedCode, 200);
			assert.deepEqual(sentData, expectedData);
			done();
		});

		it('should get application stats with queries to exclude for top queries', async (done) => {

			let constants = {
				env: {
					MATOMO_DB_CONFIG: {
						host: 'fakeHost',
						user: 'fakeUser',
						password: 'fakePassword',
						database: 'fakeDatabase'
					}
				}
			};
			let mysqlParams = null;
			let connectCalled = false;
			let endCalled = false;
			let queries = [];
			let counter = 0;
			let expectedResponses = [
				[{avg_search_count: 13}],
				[
					{
						search: 'fakeSearch1',
						count: 32
					},
					{
						search: 'fakeSearch2',
						count: 16
					}
				]
			];
			let blacklist = ['testQuery'];
			const mySqlConnection = {
				connect: () => {
					connectCalled = true;
				},
				end: () => {
					endCalled = true;
				},
				query: (query, callback) => {
					queries.push(query);
					let response = expectedResponses[counter];
					counter++;
					callback(null, response, []);
				}
			};
			const mysql_lib = {
				createConnection: (params) => {
					mysqlParams = params;
					return mySqlConnection;
				}
			};
			const opts = {mysql_lib, constants};
			const req = {body: {isClone: false, cloneData: {clone_name: 'gamechanger'}, internalUsers: ['testUser'], daysAgo: 7, blacklist: blacklist}};
			let passedCode = null;
			let sentData = null;
			const res = {
				status: (code) => {
					passedCode = code;
					return {
						send: (data) => {
							sentData = data;
						}
					};
				}
			};

			const expectedData = {daysBack: 7, data: {avgSearchesPerSession: 13, blacklist: ['testQuery'], cloneData: {clone_name: 'gamechanger'}, excluding: ['testUser'], topSearches: {topN: 10, data: [{search: 'fakeSearch1', count: 32}, {search: 'fakeSearch2', count: 16}]}}};

			const target = new AppStatsController(opts);
			await target.getAppStats(req, res);
			assert.equal(passedCode, 200);
			assert.deepEqual(sentData, expectedData);
			done();
		});

	});
});
