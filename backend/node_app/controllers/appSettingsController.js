const APP_SETTINGS = require('../models').app_settings;
const LOGGER = require('../lib/logger');
/**
 * A contoller for app wide mode settings. Each setting has 
 * an id, key, and value. The values are 'true' or 'false'
 * This class gets, sets and toggles these values.
 * @class AppSettingsController
 */
class AppSettingsController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			appSettings = APP_SETTINGS,
		} = opts;

		this.logger = logger;
		this.appSettings = appSettings;

		// Keys to query the app_settings table
		this.keys = {
			userFeedback:'request_user_feedback',
			intelligentAnswers:'intelligent_answers',
			entitySearch:'entity_search',
			combinedSearch:'combined_search',
			topicSearch:'topic_search',
			jiraFeedback:'jira_feedback',
			ltr: 'ltr'
		}
		
		// Binding the key for combined search mode to get and set
		this.getCombinedSearchMode = this.getMode.bind(this, this.keys.combinedSearch);
		this.setCombinedSearchMode = this.setMode.bind(this, this.keys.combinedSearch);

		// Binding the key for intelligent answers mode to get and set
		this.getIntelligentAnswersMode = this.getMode.bind(this, this.keys.intelligentAnswers);
		this.setIntelligentAnswersMode = this.setMode.bind(this, this.keys.intelligentAnswers);

		// Binding the key for entity search mode to get and set
		this.getEntitySearchMode = this.getMode.bind(this, this.keys.entitySearch);
		this.setEntitySearchMode = this.setMode.bind(this, this.keys.entitySearch);

		// Binding the key for combined search mode to get and toggle
		this.getUserFeedbackMode = this.getMode.bind(this, this.keys.userFeedback);
		this.toggleUserFeedbackMode = this.toggleMode.bind(this, this.keys.userFeedback);

		this.getJiraFeedbackMode = this.getMode.bind(this, this.keys.jiraFeedback);
		this.toggleJiraFeedbackMode = this.toggleMode.bind(this, this.keys.jiraFeedback);

		// Binding the key for topic search mode to get and set
		this.getTopicSearchMode = this.getMode.bind(this, this.keys.topicSearch);
		this.setTopicSearchMode = this.setMode.bind(this, this.keys.topicSearch);

		this.getLTRMode = this.getMode.bind(this, this.keys.ltr);
		this.toggleLTRMode = this.toggleMode.bind(this, this.keys.ltr);

		this.logFrontendError = this.logFrontendError.bind(this);
	}
	/**
	 * A generic get method to grab a key's value
	 * @method getMode
	 * @param {string} key - this is bound in the constructor
	 * @param {*} req - no parameters
	 * @param {*} res 
	 */
	async getMode(key, req, res){
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		try {
			const mode = await this.appSettings.findOrCreate({ attributes: ['value'], where: { key: key}, defaults: {value: 'true'} });
			res.status(200).send(mode[0]);
		} catch (err) {
			this.logger.error(err, 'DF90FR3', userId);
			res.status(500).send(err);
		}
	}
	/**
	 * A generic set method to update a key's value
	 * @method setMode
	 * @param {string} key - this is bound in the constructor
	 * @param {*} req - expects a value parameter
	 * @param {*} res 
	 */
	async setMode(key, req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		const { value } = req.body;
		try {
			let updateValues = { value };
			if (updateValues.value === 'true' || updateValues.value === 'false'){
				const updatedResult = await this.appSettings.update(updateValues, { where: {key: key} });
				res.status(200).send({ updatedResult });
			} else {
				res.status(500).send('value can only be \'true\' or \'false\'');
			}
		} catch (err) {
			this.logger.error(err, 'PQNAF35', userId);
			res.status(500).send(err);
		}
	}
	/**
	 * A generic toggle method to switch a key's value to the opposite
	 * @method toggleMode
	 * @param {string} key - this is bound in the constructor
	 * @param {*} req - no parameters
	 * @param {*} res 
	 */
	async toggleMode(key, req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		try {
			let { dataValues } = await this.appSettings.findOne({ attributes: ['value'], where: { key: key} });
			if (dataValues.value === 'true'){
				dataValues.value = 'false'
			}
			else{
				dataValues.value = 'true'
			}
			const updatedResult = await this.appSettings.update(dataValues, { where: {key: key} });
			res.status(200).send({ updatedResult });
		} catch (err) {
			this.logger.error(err, 'PQNAF36', userId);
			res.status(500).send(err);
		}
	}

	async logFrontendError(req) {
		this.logger.error(`[FRONTEND] ${JSON.stringify(req.body)}`);
	}
}

module.exports.AppSettingsController = AppSettingsController;
