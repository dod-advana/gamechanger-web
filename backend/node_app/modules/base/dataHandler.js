const LOGGER = require('@dod-advana/advana-logger');

class DataHandler {
	constructor(opts = {}) {
		const {
			logger = LOGGER
		} = opts;

		this.logger = logger;
	}

	async callFunction(functionName, options, cloneName, permissions, userId, res) {
		// Setup the request
		this.logger.info(`${userId} is calling ${functionName} in the ${cloneName} search module with options ${JSON.stringify(options)}`);
		const proxyBody = options;
		proxyBody.functionName = functionName;
		proxyBody.cloneName = cloneName;

		return await this.callFunctionHelper({ body: proxyBody, permissions }, userId, res);
	}


	async callFunctionHelper(req, userId, res) {
		return req.body;
	}

}

module.exports = DataHandler;
