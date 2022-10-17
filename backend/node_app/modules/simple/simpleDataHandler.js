const DataHandler = require('../base/dataHandler');

class SimpleDataHandler extends DataHandler {
	constructor(opts = {}) {
		const {} = opts;

		super({ ...opts });
	}

	async callFunctionHelper(req, userId) {
		const { functionName } = req.body;

		try {
			switch (functionName) {
				default:
					this.logger.error(
						`There is no function called ${functionName} defined in the simpleDataHandler`,
						'MPKCB2K',
						userId
					);
					return {};
			}
		} catch (e) {
			console.log(e);
			const { message } = e;
			this.logger.error(message, '90C713Z', userId);
			throw e;
		}
	}
}

module.exports = SimpleDataHandler;
