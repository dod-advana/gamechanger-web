const assert = require('assert');
const {constructorOptionsMock} = require('../resources/testUtility');
const { AnalystToolsController } = require('../../node_app/controllers/analystToolsController');
const { reqMock, resMock } = require('../resources/testUtility');

describe('AnalystToolsController', function () {
	const opts = {
		...constructorOptionsMock,
	};
	const controller = new AnalystToolsController(opts)


	describe('#compareDocument', () => {
		it('should compare documents', async (done) => {
			const req = {
				...reqMock,
				body: {
					documentText: 'Blah'
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

			await controller.compareDocument(req, res);

			assert.deepStrictEqual(resMsg, []);
			done();
		});

	});
});
