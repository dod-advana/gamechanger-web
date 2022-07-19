const FEEDBACK = require('../models').feedback;
const DOC_INGEST_REQUEST = require('../models').doc_ingest_requests;
const LOGGER = require('@dod-advana/advana-logger');
const Sequelize = require('sequelize');
const constants = require('../config/constants');
const https = require('https');
const fs = require('fs');
const { getUserIdFromSAMLUserId } = require('../utils/userUtility');
const axios = require('axios').default;

class FeedbackController {
	constructor(opts = {}) {
		const { logger = LOGGER, feedback = FEEDBACK, doc_ingest_request = DOC_INGEST_REQUEST } = opts;

		this.logger = logger;
		this.feedback = feedback;
		this.doc_ingest_request = doc_ingest_request;

		this.sendIntelligentSearchFeedback = this.sendIntelligentSearchFeedback.bind(this);
		this.sendQAFeedback = this.sendQAFeedback.bind(this);
		this.getFeedbackData = this.getFeedbackData.bind(this);
		this.requestDocIngest = this.requestDocIngest.bind(this);
	}

	async sendIntelligentSearchFeedback(req, res) {
		let userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
		const { eventName, intelligentSearchTitle, searchText, sentenceResults } = req.body;
		try {
			const feedback = await this.feedback.create({
				event_name: eventName,
				user_id: getUserIdFromSAMLUserId(req),
				value_1: 'search_text: ' + searchText,
				value_2: 'title_returned: ' + intelligentSearchTitle,
				value_5: 'sentence_results ' + JSON.stringify(sentenceResults),
			});
			res.status(200).send(eventName + ' feedback sent.');
		} catch (err) {
			this.logger.error(err, '9YVI7BH', userId);
			res.status(500).send(err);
		}
	}

	async sendQAFeedback(req, res) {
		let userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
		const { eventName, question, answer, qaContext, params } = req.body;
		try {
			const feedback = await this.feedback.create({
				event_name: eventName,
				user_id: getUserIdFromSAMLUserId(req),
				value_1: 'question: ' + question,
				value_2: 'QA answer: ' + answer.answer,
				value_3: 'QA filename: ' + answer.filename,
				value_4: 'QA params: ' + JSON.stringify(params),
				value_5: 'QA context: ' + JSON.stringify(qaContext),
				value_7: 'cac_only: ' + answer.cac_only,
			});
			res.status(200).send(eventName + ' feedback sent.');
		} catch (err) {
			this.logger.error(err, 'QO32DTK', userId);
			res.status(500).send(err);
		}
	}

	async getFeedbackData(req, res) {
		let userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
		try {
			const { limit = 100, offset = 0, order = ['createdAt'], where = {} } = req.body;
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
				],
			});
			res.status(200).send({ totalCount: results.count, results: results.rows });
		} catch (err) {
			this.logger.error(err, '9FCQYV2', userId);
			res.status(500).send(err);
		}
	}

	async requestDocIngest(req, res) {
		let userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
		try {
			const { docId } = req.body;

			await this.doc_ingest_request.findOrCreate({
				where: {
					doc_id: docId,
					user_id: getUserIdFromSAMLUserId(req),
				},
			});

			res.status(200).send();
		} catch (err) {
			this.logger.error(err, '0UYXM1Z', userId);
			res.status(500).send({ error: true });
		}
	}
}

module.exports.FeedbackController = FeedbackController;
