const assert = require('assert');
const { DataTrackerController } = require('../../node_app/controllers/dataTrackerController');
const { constructorOptionsMock, reqMock } = require('../resources/testUtility');

describe('DataTrackerController', function () {
	describe('#getTrackedData', () => {

		it('should get the first page of the document corpus history', async (done) => {

			const constants = {
				GAME_CHANGER_OPTS: {
					version: 'version'
				}
			};

			const fakeDocumentCorpusResponse = [{a: 12}, {b: 13}];
			let passedCountParams = null;
			let passedFindAllParams = null;
			const documentCorpus = {
				count: async (countParams) => { passedCountParams = countParams; return 2; },
				findAll: async (findAllParams) => { passedFindAllParams = findAllParams; return fakeDocumentCorpusResponse; }
			};

			const opts = {
				...constructorOptionsMock,
				constants,
				documentCorpus
			};
			const target = new DataTrackerController(opts);

			const req = {
				headers: {
					SSL_CLIENT_S_DN_CN: 'john',
					query_text: 'technology',
					doc_title: 'doc'
				},
				body: {
					username: 'john',
					where: []
				},
				get(key) {
					return this.headers[key];
				}
			};

			let resData;
			let status;
			const res = {
				send: (data) => {
					resData = data;
					return data;
				},
				status: (data) => {
					status = data;
					return res;
				},
			};

			await target.getTrackedData(req, res);

			assert.equal(status, 200);
			assert.equal(resData.totalCount, 2);
			assert.deepEqual(resData.docs, fakeDocumentCorpusResponse);
			assert.deepEqual(passedCountParams.where, {});
			assert.deepEqual(passedFindAllParams.offset, 0);
			assert.deepEqual(passedFindAllParams.limit, 10);
			assert.deepEqual(passedFindAllParams.order, []);
			done();
		});

		it('should get a different page of the document corpus history', async (done) => {

			const constants = {
				GAME_CHANGER_OPTS: {
					version: 'version'
				}
			};

			const fakeDocumentCorpusResponse = [{a: 12}, {b: 13}];
			let passedCountParams = null;
			let passedFindAllParams = null;
			const documentCorpus = {
				count: async (countParams) => { passedCountParams = countParams; return 2; },
				findAll: async (findAllParams) => { passedFindAllParams = findAllParams; return fakeDocumentCorpusResponse; }
			};

			const opts = {
				...constructorOptionsMock,
				constants,
				documentCorpus
			};
			const target = new DataTrackerController(opts);

			const req = {
				headers: {
					SSL_CLIENT_S_DN_CN: 'john',
					query_text: 'technology',
					doc_title: 'doc'
				},
				body: {
					username: 'john',
					offset: 10,
					limit: 20,
					where: []
				},
				get(key) {
					return this.headers[key];
				}
			};

			let resData;
			let status;
			const res = {
				send: (data) => {
					resData = data;
					return data;
				},
				status: (data) => {
					status = data;
					return res;
				},
			};

			await target.getTrackedData(req, res);

			assert.equal(status, 200);
			assert.equal(resData.totalCount, 2);
			assert.deepEqual(resData.docs, fakeDocumentCorpusResponse);
			assert.deepEqual(passedCountParams.where, {});
			assert.deepEqual(passedFindAllParams.offset, 10);
			assert.deepEqual(passedFindAllParams.limit, 20);
			assert.deepEqual(passedFindAllParams.order, []);
			done();
		});

		it('should handle the database throwing an error', async (done) => {

			const constants = {
				GAME_CHANGER_OPTS: {
					version: 'version'
				}
			};

			const fakeDocumentCorpusResponse = [{a: 12}, {b: 13}];
			let passedCountParams = null;
			let passedFindAllParams = null;
			const documentCorpus = {
				count: async (countParams) => { passedCountParams = countParams; throw 'My fake error'; },
				findAll: async (findAllParams) => { passedFindAllParams = findAllParams; return fakeDocumentCorpusResponse; }
			};

			const opts = {
				...constructorOptionsMock,
				constants,
				documentCorpus
			};
			const target = new DataTrackerController(opts);

			const req = {
				headers: {
					SSL_CLIENT_S_DN_CN: 'john',
					query_text: 'technology',
					doc_title: 'doc'
				},
				body: {
					username: 'john',
					where: []
				},
				get(key) {
					return this.headers[key];
				}
			};

			let resData;
			let status;
			const res = {
				send: (data) => {
					resData = data;
					return data;
				},
				status: (data) => {
					status = data;
					return res;
				},
			};
			
			await target.getTrackedData(req, res);

			assert.equal(status, 500);
			assert.equal(resData, 'My fake error');
			done();
		});
	});

	describe('#crawlerMetadata', () => {
		it('should get data from gc-orchestration.crawler_metadata', async (done) => {
			const apiResMock = {count: 2, rows: [{crawler_name: 'test', status: 'Ingest Complete', datetime: new Date('2021-02-19T21:12:56.119Z')}, {crawler_name: 'test2', status: 'In Progress', datetime: new Date('2021-02-20T00:57:27.774Z')}]};
			const crawlerStatus = {
				findAndCountAll() {
					return Promise.resolve(apiResMock);
				}
			};
			const opts = {
				...constructorOptionsMock,
				crawlerStatus
			};
			const target = new DataTrackerController(opts);

			const req = {
				...reqMock,
				body: {limit: 10, offset: 0, order: [], where: []}
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
				const expected = {totalCount: 2, docs: [{crawler_name: 'test', status: 'Ingest Complete', datetime: new Date('2021-02-19T21:12:56.119Z')}, {crawler_name: 'test2', status: 'In Progress', datetime: new Date('2021-02-20T00:57:27.774Z')}]};
				await target.getCrawlerMetadata(req, res);
				assert.strictEqual(resCode, 200);
				assert.deepStrictEqual(resMsg, expected);
				done();
			} catch (e) {
				assert.fail(e);
			}

		});
	});

	describe('#getOrgSealData', () => {
		it('should get organization seal data', async (done) => {			
			const constants = {
				GAME_CHANGER_OPTS: {
					index: 'version'
				}
			};

			const organizationInfo = {
				findAll() {
					return Promise.resolve(
						[{
							'org_name': 'Organization Test',
							'org_acronym': 'TEST',
							'image_link': 'testURL'
						}]
					);
				}
			};

			const opts = {
				...constructorOptionsMock,
				constants,
				organizationInfo
			};

			const target = new DataTrackerController(opts);

			const req = {
				...reqMock,
				body: {}
			};

			let resData;
			const res = {
				status(code) {
					resCode = code;
					return this;
				},
				send(data) {
					resData = data;
					return data;
				}
			};

			await target.getOrgSealData(req, res);

			const expected = [{'org_name': 'Organization Test', 'org_acronym': 'TEST', 'image_link': 'testURL'}];
			assert.deepStrictEqual(resData, expected);

			done();
		});
	});
});
