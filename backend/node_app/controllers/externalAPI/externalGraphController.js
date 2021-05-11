const LOGGER = require('../../lib/logger');

/**
 * @class ExternalGraphController
 */
class ExternalGraphController {
	constructor(opts = {}) {
		const {
			gcController,
			logger = LOGGER,
		} = opts;

		this.gcController = gcController;
		this.logger = logger;
	}

	async queryGraph(req, res) {
		const userId = 'API';
		try {
			res.status(200).send({msg: 'TODO'});
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'DWVK5IV', userId);
			res.status(500).send();
		}
	}
}

module.exports.ExternalGraphController = ExternalGraphController;
