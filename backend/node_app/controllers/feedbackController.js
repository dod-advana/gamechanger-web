const FEEDBACK = require('../models').feedback;
const LOGGER = require('../lib/logger');
const Sequelize = require('sequelize');
const constants = require('../config/constants');
const https = require('https');
const fs = require('fs');
const { JIRA_CONFIG } = constants;
const axios = require('axios').default;

class FeedbackController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			feedback = FEEDBACK,
		} = opts;

		this.logger = logger;
		this.feedback = feedback;

		this.sendIntelligentSearchFeedback = this.sendIntelligentSearchFeedback.bind(this);
		this.sendQAFeedback = this.sendQAFeedback.bind(this);
		this.getFeedbackData = this.getFeedbackData.bind(this);
		this.sendJiraFeedback = this.sendJiraFeedback.bind(this);
	}

	async sendIntelligentSearchFeedback(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		const { eventName, intelligentSearchTitle, searchText, sentenceResults } = req.body;
		try {
			const feedback = await this.feedback.create({ 
				event_name: eventName, 
				user_id: userId, 
				value_1: 'search_text: ' + searchText,
				value_2: 'title_returned: ' + intelligentSearchTitle,
				value_5: 'sentence_results ' + JSON.stringify(sentenceResults)
			 });
			res.status(200).send( eventName + ' feedback sent.' );
		} catch (err) {
			this.logger.error(err, '9YVI7BH', userId);
			res.status(500).send(err);
		}
	}

	async sendQAFeedback(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
    	const { eventName, question, answer, qaContext, params } = req.body;
		try {
			const feedback = await this.feedback.create({ 
				event_name: eventName, 
				user_id: userId, 
				value_1: 'question: ' + question, 
				value_2: 'QA answer: ' + answer.answer,
				value_3: 'QA filename: ' + answer.filename,
				value_4: 'QA params: ' + JSON.stringify(params),
				value_5: 'QA context: ' + JSON.stringify(qaContext),
				value_7: 'cac_only: ' + answer.cac_only,
			});
			res.status(200).send( eventName + ' feedback sent.' );
		} catch (err) {
			this.logger.error(err, 'QO32DTK', userId);
			res.status(500).send(err);
		}
	}

	async getFeedbackData(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		try {
			const {limit = 100, offset = 0, order = [], where = {}} = req.body;
			const results = await this.feedback.findAndCountAll({
				limit,
				offset,
				order,
				where,
				attributes: [
					'event_name',
					'user_id',
					'createdAt',
					'value_1',
					'value_2',
					'value_3',
					'value_4',
					'value_5',
					'value_7',
				]
			});
			res.status(200).send({totalCount: results.count, results: results.rows});
		} catch (err) {
			this.logger.error(err, '9FCQYV2', userId);
			res.status(500).send(err);
		}
	}

	async sendJiraFeedback(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		try{
			const {name, email, feedback, rating} = req.body;
			console.log('(JIRA FEEDBACK) req.body: ', req.body);
			const authConfig = {
				httpsAgent: new https.Agent({ rejectUnauthorized: false }),
				auth: {
					username: JIRA_CONFIG.username,
					password: JIRA_CONFIG.password
				}
			};

			const url = `https://${JIRA_CONFIG.domain}/rest/api/2/issue/`;
			console.log('(JIRA FEEDBACK) url: ', url);

			const data = {
				'fields': {
					'project': {
						'key': JIRA_CONFIG.project_key
					},
					'summary': 'User Submitted Feedback',
					'description': `${feedback}. \n *Reporter*: ${name} \n *E-mail*: [mailto:${email}]`,
					[JIRA_CONFIG.rating_id]: {
						'value': rating + ''
					},
					[JIRA_CONFIG.advana_product]: {
						'value': 'GAMECHANGER'
					},
					'issuetype': {
						'name': JIRA_CONFIG.feedbackType
					}
				}
			};
			console.log('(JIRA FEEDBACK) data: ', data);
			
			const result = await axios.post(url, data, authConfig);
			console.log('(JIRA FEEDBACK) result.data: ', result.data);
	
			res.status(201).send(result.data);
		} catch(err) {
			console.log('(JIRA FEEDBACK) error response ', err.response);
			this.logger.error(err, '0KYXA1V', userId);
			res.status(500).send({error: true});
		}
	}
}

module.exports.FeedbackController = FeedbackController;
