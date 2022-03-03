const assert = require('assert');
const { TransformerController } = require('../../node_app/controllers/transformerController');
const { constructorOptionsMock, reqMock } = require('../resources/testUtility');

describe('DocumentController', function () {
	describe('#getModelsList', () => {
		it('should return a model list', async (done) => {

			const opts = {
				...constructorOptionsMock,
				mlApi: {
					getModelsList(userId) {
						return Promise.resolve('Test');
					}
				}
			};

			const req = {
				...reqMock,
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

			const target = new TransformerController(opts);

			await target.getModelsList(req, res);

			assert.strictEqual(resMsg, 'Test');
			done();

		});
	});

	describe('#getLoadedModels', () => {
		it('should return a fake transformer', async (done) => {

			const opts = {
				...constructorOptionsMock,
				mlApi: {
					getLoadedModels() {
						return Promise.resolve('Test');
					}
				}
			};

			const req = {
				...reqMock,
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

			const target = new TransformerController(opts);

			await target.getLoadedModels(req, res);

			assert.strictEqual(resMsg, 'Test');
			done();

		});
	});

	describe('#getS3List', () => {
		it('should get a fake list of models in s3', async (done) => {

			const opts = {
				...constructorOptionsMock,
				mlApi: {
					getS3List() {
						return Promise.resolve(['test']);
					}
				}
			};

			const req = {
				...reqMock,
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

			const target = new TransformerController(opts);

			await target.getS3List(req, res);

			assert.strictEqual(JSON.stringify(resMsg), JSON.stringify(['test']));
			done();

		});
	});

	describe('#getAPIInformation', () => {
		it('should have fake information on the API', async (done) => {

			const opts = {
				...constructorOptionsMock,
				mlApi: {
					getAPIInformation() {
						return Promise.resolve({
							'API': 'FOR TRANSFORMERS',
							'API_Name':'GAMECHANGER ML API',
							'Version': 2
						});
					}
				}
			};

			const req = {
				...reqMock,
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

			const target = new TransformerController(opts);

			await target.getAPIInformation(req, res);

			assert.strictEqual(JSON.stringify(resMsg), JSON.stringify({
				'API': 'FOR TRANSFORMERS',
				'API_Name':'GAMECHANGER ML API',
				'Version': 2
			}));
			done();
		});
	});

	describe('#getData', () => {
		it('should query the ML API', async () => {
			const mlApi = {
				getAPIInformation() {
					return Promise.resolve('test');
				}
			};

			const opts = {
				...constructorOptionsMock,
				mlApi
			};
			
			const target = new TransformerController(opts);

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

			await target.getData('getAPIInformation', req, res);

			assert.deepStrictEqual(resMsg, 'test');
		});

		it('should throw an error', async () => {
			const opts = {
				...constructorOptionsMock
			};
			
			const target = new TransformerController(opts);

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

			await target.getData('getAPIInformation', req, res);

			assert.equal(resCode, 500);
		});
	});

	describe('#postData', () => {
		it('should post to the ML API', async () => {
			const mlApi = {
				getAPIInformation() {
					return Promise.resolve('test');
				}
			};

			const opts = {
				...constructorOptionsMock,
				mlApi
			};
			
			const target = new TransformerController(opts);

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

			await target.postData('getAPIInformation', req, res);

			assert.deepStrictEqual(resMsg, 'test');
		});

		it('should throw an error', async () => {
			const opts = {
				...constructorOptionsMock
			};
			
			const target = new TransformerController(opts);

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

			await target.postData('getAPIInformation', req, res);

			assert.equal(resCode, 500);
		});
	});
});
