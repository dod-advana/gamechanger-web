const { MLApiClient } = require('../../lib/mlApiClient');
const ExportHandler = require('../base/exportHandler');
const { getUserIdFromSAMLUserId } = require('../../utils/userUtility');
const REVIEW = require('../../models').review;
const USER = require('../../models').user;

class SimpleExportHandler extends ExportHandler {
	constructor(opts = {}) {
		const { mlApi = new MLApiClient(opts), review = REVIEW, user = USER } = opts;
		super();
		this.mlApi = mlApi;
		this.review = review;
		this.user = user;
	}

	async exportHelper(req, res, userId) {
		try {
			const { index, format, historyId, expansionDict = {}, orgFilter, ...rest } = req.body;

			const clientObj = { esClientName: 'gamechanger', esIndex: 'gamechanger' };
			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms(req.body, userId);
			req.body.searchTerms = searchTerms;
			req.body.parsedQuery = parsedQuery;
			let searchResults;
			try {
				searchResults = await this.searchUtility.documentSearch(
					req,
					{ ...req.body, expansionDict, operator: 'and' },
					clientObj,
					userId
				);
				searchResults.classificationMarking = req.body.classificationMarking;
			} catch (e) {
				this.logger.error(
					`Error sentence transforming document search results ${e.message}`,
					'GPLMHKA',
					userId
				);
				throw e;
			}

			try {
				const { docs } = searchResults;
				if (historyId) {
					await this.exportHistory.updateExportHistoryDate(res, historyId, getUserIdFromSAMLUserId(req));
				} else {
					await this.exportHistory.storeExportHistory(
						res,
						req.body,
						{
							totalCount: docs.length,
							searchTerms,
						},
						getUserIdFromSAMLUserId(req)
					);
				}

				if (format === 'pdf') {
					const sendDataCallback = (buffer) => {
						const pdfBase64String = buffer.toString('base64');
						res.contentType('application/pdf');
						res.status(200);
						res.send(pdfBase64String);
					};
					rest.index = index;
					rest.orgFilter = orgFilter;
					this.reports.createPdfBuffer(searchResults, userId, rest, sendDataCallback);
				} else if (format === 'csv') {
					const csvStream = this.reports.createCsvStream(searchResults, userId);
					res.status(200);
					csvStream.pipe(res);
				} else {
					res.end(JSON.stringify(searchResults));
					res.status(200);
				}
			} catch (err) {
				this.logger.error(err.message, '9HQ0878', userId);
				res.status(500).send(err);
			}
		} catch (err) {
			this.logger.error(err.message, '61ODZD4', userId);
			res.status(500).send(err);
		}
	}

	async exportReviewHelper(req, res, userId) {
		try {
			const reviews = await this.review.findAll();
			const reviewData = { docs: reviews };
			const csvStream = await this.reports.createCsvStream(reviewData, userId);
			csvStream.pipe(res);
		} catch (e) {
			this.logger.error(e.message, '2ZO73KD', userId);
		}
	}

	async exportUsersHelper(req, res, userId) {
		try {
			const users = await this.user.findAll({
				attributes: [
					'id',
					'first_name',
					'last_name',
					'email',
					'organization',
					'is_primary_reviewer',
					'is_service_reviewer',
					'is_poc_reviewer',
					'is_admin',
				],
				raw: true,
			});
			const userData = { docs: users };
			const csvStream = await this.reports.createCsvStream(userData, userId);
			csvStream.pipe(res);
		} catch (e) {
			this.logger.error(e.message, '2ZO73XD', userId);
		}
	}

	async exportChecklistHelper(req, res, userId) {
		try {
			const { data } = req.body;
			const checklistData = { docs: data };
			const csvStream = await this.reports.createCsvStream(checklistData, userId);
			csvStream.pipe(res);
		} catch (e) {
			this.logger.error(e.message, '2ZO73K3', userId);
		}
	}

	async exportProfilePageHelper(req, res, userId) {
		try {
			const { data } = req.body;

			if (
				req.permissions.includes('jbook Admin') ||
				req.permissions.includes('Webapp Super Admin') ||
				req.permissions.includes('Gamechanger Super Admin')
			) {
				const sendDataCallback = (buffer) => {
					const pdfBase64String = buffer.toString('base64');
					res.contentType('application/pdf');
					res.status(200);
					res.send(pdfBase64String);
				};

				this.reports.createProfilePagePDFBuffer(data, userId, sendDataCallback);
			} else {
				this.logger.error('403 Need Admin Permissions', '2ZO73KB', userId);
				res.status(403).send({ message: '403 Need Admin Permissions to export' });
			}
		} catch (e) {
			this.logger.error(e.message, '2ZO73KA', userId);
			res.status(500).send(e);
		}
	}
}

module.exports = SimpleExportHandler;
