const GraphHandler = require('../base/graphHandler');
const redisAsyncClientDB = 8;


class SimpleGraphHandler extends GraphHandler {
	constructor(opts = {}) {
		super({redisClientDB: redisAsyncClientDB, ...opts});
	}

	async searchHelper(req, userId) {
		return req.body;
	}

	async queryHelper(req, userId, code) {
		return req.body;
	}

	async callFunctionHelper(req, userId) {
		return req.body;
	}
}

const simpleGraphHandler = new SimpleGraphHandler();

module.exports = simpleGraphHandler;
