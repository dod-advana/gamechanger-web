const assert = require('assert');
const { TransformerController } = require('../../node_app/controllers/transformerController');
const { constructorOptionsMock, reqMock } = require('../resources/testUtility');

describe('DocumentController', function () {
	describe('#getTransformerList', () => {
		it('should return a fake transformer list', async (done) => {

			const opts = {
				...constructorOptionsMock,
				mlApi: {
					getTransfomerModelList(userId) {
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

			await target.getTransformerList(req, res);

			assert.strictEqual(resMsg, 'Test');
			done();

		});
	});

	describe('#getCurrentTransformer', () => {
		it('should return a fake transformer', async (done) => {

			const opts = {
				...constructorOptionsMock,
				mlApi: {
					getCurrentTransformer() {
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

			await target.getCurrentTransformer(req, res);

			assert.strictEqual(resMsg, 'Test');
			done();

		});
	});

	describe('#setTransformerModel', () => {
		it('should set a fake transformer', async (done) => {

			const opts = {
				...constructorOptionsMock,
				mlApi: {
					setTransformerModel(model_name) {
						return Promise.resolve(model_name);
					}
				}
			};

			const req = {
				...reqMock,
				body: {
					model_name: 'Test'
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

			const target = new TransformerController(opts);

			await target.setTransformerModel(req, res);

			assert.strictEqual(resMsg, 'Test');
			done();

		});
	});
});
