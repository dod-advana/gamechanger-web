const GraphHandler = require('../base/graphHandler');
const redisAsyncClientDB = 8;

class SimpleGraphHandler extends GraphHandler {
	constructor(opts = {}) {
		super({ redisClientDB: redisAsyncClientDB, ...opts });
	}

	async searchHelper(req, _userId) {
		return req.body;
	}

	async queryHelper(req, _userId, _code) {
		return req.body;
	}

	async callFunctionHelper(req, _userId) {
		return req.body;
	}
}

const simpleGraphHandler = new SimpleGraphHandler();

module.exports = simpleGraphHandler;
