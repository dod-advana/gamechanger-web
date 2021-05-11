const assert = require('assert');
const { ExternalGraphController } = require('../../../node_app/controllers/externalAPI/externalGraphController');
const { constructorOptionsMock, resMock } = require('../../resources/testUtility');

describe('ExternalGraphController', function () {

	describe('queryGraph()', function () {

		const opts = {
			...constructorOptionsMock,
			dataApi: {}
		};

		const target = new ExternalGraphController(opts);

		let resData;
		const res = {
			...resMock,
			send: (data) => {
				resData = data;
				return data;
			}
		};

		const req = {
			headers: {
				SSL_CLIENT_S_DN_CN: 'john'
			},
			get(key) {
				return this.headers[key];
			}
		};

		it('should return todo as its not fully built out yet', (done) => {
			target.queryGraph(req, res).then(() => {
				assert.deepStrictEqual(resData, {msg: 'TODO'});
				done();
			});
		});

	});

});
