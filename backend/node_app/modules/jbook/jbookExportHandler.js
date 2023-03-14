const { MLApiClient } = require('../../lib/mlApiClient');
const ExportHandler = require('../base/exportHandler');
const { getUserIdFromSAMLUserId } = require('../../utils/userUtility');
const REVIEW = require('../../models').review;
const USER = require('../../models').user;
const JBookSearchUtility = require('./jbookSearchUtility');
const JBookSearchHandler = require('./jbookSearchHandler');

class JBookExportHandler extends ExportHandler {
	constructor(opts = {}) {
		const {
			mlApi = new MLApiClient(opts),
			review = REVIEW,
			user = USER,
			searchUtility = new JBookSearchUtility(opts),
			jbookSearchHandler = new JBookSearchHandler(opts),
		} = opts;
		super();

		this.mlApi = mlApi;
		this.review = review;
		this.user = user;
		this.jbookSearchUtility = searchUtility;
		this.jbookSearchHandler = jbookSearchHandler;
	}

	generateCSVList(searchResults, portfolio) {
		let reviews = [];
		searchResults.docs.forEach((doc) => {
			if (doc.review_n) {
				doc.review_n.forEach((rev) => {
					if (rev.portfolio_name_s === portfolio) {
						let combined = { ...doc, ...rev };
						reviews.push(combined);
					}
				});
			} else {
				reviews.push({ ...doc });
			}
		});
		return reviews;
	}

	generateCSVReviewList(searchResults) {
		let reviews = [];
		searchResults.docs.forEach((doc) => {
			if (doc.review_n) {
				doc.review_n.forEach((rev) => {
					let combined = { ...doc, ...rev };
					reviews.push(combined);
				});
			}
		});
		return reviews;
	}

	async exportHelper(req, res, userId) {
		try {
			const { index, format, historyId, orgFilter, portfolio, ...rest } = req.body;
			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms(req.body, userId);
			req.body.searchTerms = searchTerms;
			req.body.parsedQuery = parsedQuery;
			let searchResults;
			try {
				searchResults = await this.jbookSearchHandler.documentSearch(req, userId, res);
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
				for (let i = 0; i < docs.length; i++) {
					let doc = docs[i];
					if (doc.review_n !== undefined) {
						let findReview = doc.review_n.find((item) => item.portfolio_name_s === portfolio);
						let cleanedReview = {};
						if (findReview) {
							cleanedReview = this.jbookSearchUtility.parseFields(findReview, false, 'reviewES');
						}
						docs[i] = { ...doc, ...cleanedReview };
					}
				}

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

				const sendDataCallback = (buffer, error = false) => {
					if (error) {
						res.status(500).send('an error has occurred');
					} else {
						const pdfBase64String = buffer.toString('base64');
						res.contentType('application/pdf');
						res.status(200);
						res.send(pdfBase64String);
					}
				};

				switch (format) {
					case 'pdf':
						rest.index = index;
						rest.orgFilter = orgFilter;
						this.reports.createProfilePagePDFBuffer(docs, userId, sendDataCallback);
						break;
					case 'csv':
						const csvList = this.generateCSVList(searchResults, portfolio);
						const csvStream = await this.reports.jbookCreateCsvStream({ docs: csvList }, userId);
						res.status(200);
						csvStream.pipe(res);
						break;
					case 'csv-reviews':
						const reviews = this.generateCSVReviewList(searchResults);
						let csvReviewStream = await this.reports.jbookCreateCsvStream({ docs: reviews }, userId, true);
						res.status(200);
						csvReviewStream.pipe(res);
						break;
					case 'xlsx':
						const xlsxList = await this.reports.prepareXlsxJson(searchResults.docs, portfolio);
						res.end(JSON.stringify(xlsxList));
						res.status(200);
						break;
					default:
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
				attributes: ['id', 'first_name', 'last_name', 'email', 'organization', 'extra_fields'],
				raw: true,
			});

			const tmpUsers = [];

			if (users !== null) {
				users.forEach((user) => {
					if (user.extra_fields.clones_visited) {
						if (user.extra_fields.clones_visited.includes('jbook')) {
							tmpUsers.push({
								first_name: user.first_name,
								last_name: user.last_name,
								email: user.email,
								organization: user.organization,
								is_admin: user.extra_fields?.jbook?.is_admin || false,
								is_primary_reviewer: user.extra_fields?.jbook?.is_primary_reviewer || false,
								is_service_reviewer: user.extra_fields?.jbook?.is_service_reviewer || false,
								is_poc_reviewer: user.extra_fields?.jbook?.is_poc_reviewer || false,
							});
						}
					}
				});
			}

			const userData = { docs: tmpUsers };
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

module.exports = JBookExportHandler;
