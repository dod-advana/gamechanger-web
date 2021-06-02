const APP_SETTINGS = require('../models').app_settings;
const LOGGER = require('../lib/logger');
class AppSettingsController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			appSettings = APP_SETTINGS,
		} = opts;

		this.logger = logger;
		this.appSettings = appSettings;

		this.getCombinedSearchMode = this.getCombinedSearchMode.bind(this);
		this.setCombinedSearchMode = this.setCombinedSearchMode.bind(this);
		this.getIntelligentAnswersMode = this.getIntelligentAnswersMode.bind(this);
		this.setIntelligentAnswersMode = this.setIntelligentAnswersMode.bind(this);
		this.getEntitySearchMode = this.getEntitySearchMode.bind(this);
		this.setEntitySearchMode = this.setEntitySearchMode.bind(this);
		this.getTopicSearchMode = this.getTopicSearchMode.bind(this);
		this.setTopicSearchMode = this.setTopicSearchMode.bind(this);
	}

	async getCombinedSearchMode(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		try {
			const combinedSearch = await this.appSettings.findAll({ attributes: ['value'], where: { key: 'combined_search'} });

			res.status(200).send(combinedSearch);
		} catch (err) {
			this.logger.error(err, 'DF90FR3', userId);
			res.status(500).send(err);
		}
	}

	async setCombinedSearchMode(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		const { value } = req.body;
		console.log(req.body);
		try {
			let updateValues = { value };
			if (updateValues.value === 'true' || updateValues.value === 'false'){
				const updatedResult = await this.appSettings.update(updateValues, { where: {key: 'combined_search'} });
				res.status(200).send({ updatedResult });
			}
			res.status(500).send('value can only be \'true\' or \'false\'');
		} catch (err) {
			this.logger.error(err, 'PQNAF35', userId);
			res.status(500).send(err);
		}
	}

	async getIntelligentAnswersMode(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		try {
			const intelligentAnswers = await this.appSettings.findAll({ attributes: ['value'], where: { key: 'intelligent_answers'} });

			res.status(200).send(intelligentAnswers);
		} catch (err) {
			this.logger.error(err, 'DF90FR3', userId);
			res.status(500).send(err);
		}
	}

	async setIntelligentAnswersMode(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		const { value } = req.body;
		console.log(req.body);
		try {
			let updateValues = { value };
			if (updateValues.value === 'true' || updateValues.value === 'false'){
				const updatedResult = await this.appSettings.update(updateValues, { where: {key: 'intelligent_answers'} });
				res.status(200).send({ updatedResult });
			}
			res.status(500).send('value can only be \'true\' or \'false\'');
		} catch (err) {
			this.logger.error(err, 'PQNAF35', userId);
			res.status(500).send(err);
		}
	}

	async getEntitySearchMode(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		try {
			const entitySearch = await this.appSettings.findAll({ attributes: ['value'],  where: { key: 'entity_search'} });

			res.status(200).send( entitySearch );
		} catch (err) {
			this.logger.error(err, 'DF90FR3', userId);
			res.status(500).send(err);
		}
	}

  async setEntitySearchMode(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		const { value } = req.body;
    console.log(req.body);
		try {
      let updateValues = { value };
      if(updateValues.value === 'true' || updateValues.value === 'false'){
        const updatedResult = await this.appSettings.update(updateValues, { where: {key: 'entity_search'} });
			  res.status(200).send({ updatedResult });
      }
      res.status(500).send("value can only be 'true' or 'false'");
		} catch (err) {
			this.logger.error(err, 'PQNAF35', userId);
			res.status(500).send(err);
		}
	}

	async getTopicSearchMode(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		try {
			const topicSearch = await this.appSettings.findAll({ attributes: ['value'],  where: { key: 'topic_search'} });

			res.status(200).send( topicSearch );
		} catch (err) {
			this.logger.error(err, 'TDCMP9B', userId);
			res.status(500).send(err);
		}
	}

	async setTopicSearchMode(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		const { value } = req.body;
		console.log(req.body);
		try {
			let updateValues = { value };
			if(updateValues.value === 'true' || updateValues.value === 'false'){
				const updatedResult = await this.appSettings.update(updateValues, { where: {key: 'topic_search'} });
				res.status(200).send({ updatedResult });
			}
			res.status(500).send("value can only be 'true' or 'false'");
		} catch (err) {
			this.logger.error(err, 'W4MM15X', userId);
			res.status(500).send(err);
		}
	}
}

module.exports.AppSettingsController = AppSettingsController;
