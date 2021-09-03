const ACCOMP = require('../models').accomp;
const LOGGER = require('../lib/logger');

class AccomplishmentsController {

	constructor(opts = {}) {
		const {
			logger = LOGGER,
			accomp = ACCOMP,
		} = opts;

		this.logger = logger;
		this.accomp = accomp;

        this.getAccomplishments = this.getAccomplishments.bind(this);
	}

	async getAccomplishments(req, res) {
		let userId = 'webapp_unknown';
		const { peNum, projNum } = req.query;
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			this.accomp.findAll({
				where: {
					Program_Element: peNum,
                    Project_Number: projNum
                }
			}).then(results => {
				res.status(200).send(results);
			});

		} catch (err) {
			this.logger.error(err, 'GEEMI0Z', userId);
			res.status(500).send(err);
		}
	}

	
}

module.exports.AccomplishmentsController = AccomplishmentsController;
