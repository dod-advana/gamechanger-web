const assert = require('assert');
const { TrendingSearchesController } = require('../../node_app/controllers/trendingSearchesController');
const { constructorOptionsMock, reqMock } = require('../resources/testUtility');

describe('TrendingSearchesController', function () {
	describe('#trendingSearchesPOST', () => {
		it('should return trending searches with clone name undefined if not a clone', (done) => {
			const mockTrending = {
				request_body: {
					search: [
						{search: 'artificial intelligence',
							count: 100,
							clone_name: undefined},
						{search: 'cyber',
							count: 80,
							clone_name: undefined},
						{search: 'jaic',
							count: 40,
							clone_name: undefined},
						{search: 'air force',
							count: 38,
							clone_name: 'test_clone'},
						{search: 'Germany',
							count: 35,
							clone_name: 'test_clone'},
					]
				}
			};

			const mockRes = [];

			const gcHistory = {
				findAll: async (data) => {
					clone_name = data.where.clone_name;
					let ret = [];
					for (let elt in mockTrending.request_body.search) {
						if (mockTrending.request_body.search[elt].clone_name == clone_name) {
							ret.push(mockTrending.request_body.search[elt].search);
						}
					}

					return ret;
				}
			};

			const opts = {
				...constructorOptionsMock,
				gcHistory
			};
			const target = new TrendingSearchesController(opts);

			const req = {
				...reqMock,
				body: {
					isClone: 'false',
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
				target.trendingSearchesPOST(req, res).then(() => {
					assert.equal(JSON.stringify(resMsg), JSON.stringify(mockRes));
					done();
				});
			} catch (e) {
				assert.fail(e);
			}
		});

		it('should return trending searches with clone name specified if clone', (done) => {
			const mockTrending = {
				request_body: {
					search: [
						{search: 'artificial intelligence',
							count: 100,
							clone_name: undefined},
						{search: 'cyber',
							count: 80,
							clone_name: undefined},
						{search: 'jaic',
							count: 40,
							clone_name: undefined},
						{search: 'air force',
							count: 38,
							clone_name: 'test_clone'},
						{search: 'Germany',
							count: 35,
							clone_name: 'test_clone'},
					]
				}
			};

			const mockRes = [];

			const gcHistory = {
				findAll: async (data) => {
					clone_name = data.where.clone_name;
					let ret = [];
					for (let elt in mockTrending.request_body.search) {
						if (mockTrending.request_body.search[elt].clone_name == clone_name) {
							ret.push(mockTrending.request_body.search[elt].search);
						}
					}

					return ret;
				}
			};

			const opts = {
				...constructorOptionsMock,
				gcHistory
			};
			const target = new TrendingSearchesController(opts);

			const req = {
				...reqMock,
				body: {
					isClone: 'true',
					cloneData: {
						clone_name: 'test_clone'
					}
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
				target.trendingSearchesPOST(req, res).then(() => {
					assert.equal(JSON.stringify(resMsg), JSON.stringify(mockRes));
					done();
				});
			} catch (e) {
				assert.fail(e);
			}
		});
	});

	describe('#getTrendingBlacklist', () => {
		it('should get the trending blacklist', async () => {
			const gcTrendingBlacklist = {
				findAll() {
					return Promise.resolve([{ test: 'test' }]);
				}
			};

			const opts = {
				...constructorOptionsMock,
				gcTrendingBlacklist
			};
			
			const target = new TrendingSearchesController(opts);

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
				await target.getTrendingBlacklist(req, res);
			} catch (e) {
				assert.fail();
			}

			const expected = [{
				test: 'test'
			}];

			assert.equal(resCode, 200);
			assert.deepStrictEqual(resMsg, expected);
		});

		it('should throw an error', async () => {
			const opts = {
				...constructorOptionsMock
			};
			
			const target = new TrendingSearchesController(opts);

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
				await target.getTrendingBlacklist(req, res);
			} catch (e) {
				assert.fail();
			}

			assert.equal(resCode, 500);
		});
	});

	describe('#setTrendingBlacklist', () => {
		it('should set the trending blacklist', async () => {
			const gcTrendingBlacklist = {
				findOrCreate() {
					return Promise.resolve('test');
				}
			};

			const opts = {
				...constructorOptionsMock,
				gcTrendingBlacklist
			};
			
			const target = new TrendingSearchesController(opts);

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
				await target.setTrendingBlacklist(req, res);
			} catch (e) {
				assert.fail();
			}

			const expected = 'test';

			assert.equal(resCode, 200);
			assert.deepStrictEqual(resMsg, expected);
		});

		it('should return an error', async () => {
			const opts = {
				...constructorOptionsMock
			};
			
			const target = new TrendingSearchesController(opts);

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
				await target.setTrendingBlacklist(req, res);
			} catch (e) {
				assert.fail();
			}

			assert.equal(resCode, 500);
		});
	});

	describe('#deleteTrendingBlacklist', () => {
		it('should delete the trending blacklist', async () => {
			const gcTrendingBlacklist = {
				destroy() {
					return 'test';
				}
			};

			const opts = {
				...constructorOptionsMock,
				gcTrendingBlacklist
			};
			
			const target = new TrendingSearchesController(opts);

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
				await target.deleteTrendingBlacklist(req, res);
			} catch (e) {
				assert.fail();
			}

			const expected = 'test';

			assert.equal(resCode, 200);
			assert.deepStrictEqual(resMsg, expected);
		});

		it('should return an error', async () => {
			const gcTrendingBlacklist = {
				destroy() {
					throw 'error';
				}
			};

			const opts = {
				...constructorOptionsMock,
				gcTrendingBlacklist
			};
			
			const target = new TrendingSearchesController(opts);

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
				await target.deleteTrendingBlacklist(req, res);
			} catch (e) {
				assert.fail();
			}

			assert.equal(resCode, 500);
		});
	});

	describe('#getWeeklySearchCount', () => {
		it('should get the weekly search count', async () => {
			const gcHistory = {
				count() {
					return Promise.resolve(1);
				}
			};

			const opts = {
				...constructorOptionsMock,
				gcHistory
			};
			
			const target = new TrendingSearchesController(opts);

			const req = {
				...reqMock,
				body: {
					trendingLinks: [{search: 'link'}]
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
				await target.getWeeklySearchCount(req, res);
			} catch (e) {
				assert.fail();
			}

			const expected = [];

			//assert.equal(resCode, 200);
			assert.deepStrictEqual(resMsg, expected);
		});
	});

	it('should return an error', async () => {
		const opts = {
			...constructorOptionsMock
		};
		
		const target = new TrendingSearchesController(opts);

		const req = {
			...reqMock,
			body: {
				trendingLinks: [{search: 'link'}]
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
			await target.getWeeklySearchCount(req, res);
		} catch (e) {
			assert.fail();
		}

		const expected = [{
			count: 1,
			search: 'link'
		}];

		assert.equal(resCode, 500);
	});
});
