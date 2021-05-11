const assert = require('assert');
const { CacheController } = require('../../node_app/controllers/cacheController');
const { constructorOptionsMock, reqMock, resMock } = require('../resources/testUtility');

describe('CacheController', function () {
	const target = new CacheController(constructorOptionsMock);

	describe('#clearGraphDataCache', () => {

		it('should not throw an error and clear out redis store', (done) => {
			const expected = 'Graph data cache cleared';
			let resData;
			const res = {
				...resMock,
				send: (data) => {
					resData = data;
					return data;
				}
			};
			target.clearGraphDataCache(reqMock, res).then(data => {
				assert.equal(resData, expected);
				done();
			});
		});

	});
});
