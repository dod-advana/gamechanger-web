const FAQ = require('../models').faq;
const LOGGER = require('../lib/logger');

class AboutGcController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			faq = FAQ,
		} = opts;

		this.logger = logger;
		this.faq = faq;

		this.getFAQ = this.getFAQ.bind(this)
	}


	async getFAQ(req,res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const questions = await this.faq.findAll()
			res.status(200).send(questions);
		} catch(e) {
			this.logger.error(e, 'MQYVZD9', userId);
			res.status(500).send(e);
		}
	}

}

module.exports.AboutGcController = AboutGcController;