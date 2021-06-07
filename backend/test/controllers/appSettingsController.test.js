const assert = require('assert');
const { AppSettingsController } = require('../../node_app/controllers/appSettingsController');
const { reqMock, resMock } = require('../resources/testUtility');

describe('AppSettingsController', function () {
	const opts = {
		appSettings: {
			findOrCreate(data) {
				return Promise.resolve([{value:'true'}]);
			},
			findOne(data) {
				return Promise.resolve({dataValues:{value:'true'}});
			},
			update(data) {
				return Promise.resolve({value:data.value});
			}
		}
	};
	const controller = new AppSettingsController(opts)


	describe('#getMode', () => {
		it('should get application setting', async (done) => {
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

			await controller.getMode('test_key', req, res);

			assert.strictEqual(resMsg.value, 'true');
			done();
		});

	});
	describe('#setMode', () => {
		it('should set an application setting to false', async (done) => {
			const req = {
				...reqMock,
				body: {value:'false'}
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

			await controller.setMode('test_key', req, res);

			assert.strictEqual(resMsg.updatedResult.value, 'false');
			done();
		});

	});
	describe('#toggleMode', () => {
		it('should toggle an application setting from true to false', async (done) => {
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

			await controller.toggleMode('test_key', req, res);

			assert.strictEqual(resMsg.updatedResult.value, 'false');
			done();
		});

	});
});
