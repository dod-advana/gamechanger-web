const REVIEWER = require('../models').reviewer;
const LOGGER = require('@dod-advana/advana-logger');
const sparkMD5Lib = require('spark-md5');
const constantsFile = require('../config/constants');

class ReviewerController {
	constructor(opts = {}) {
		const { constants = constantsFile, logger = LOGGER, sparkMD5 = sparkMD5Lib, reviewer = REVIEWER } = opts;

		this.logger = logger;
		this.sparkMD5 = sparkMD5;
		this.constants = constants;
		this.reviewer = reviewer;

		this.getReviewerData = this.getReviewerData.bind(this);
		this.deleteReviewerData = this.deleteReviewerData.bind(this);
		this.updateOrCreateReviewer = this.updateOrCreateReviewer.bind(this);
		this.updateOrCreateReviewerHelper = this.updateOrCreateReviewerHelper.bind(this);
	}

	async getReviewerData(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
			this.reviewer.findAll().then((results) => {
				console.log(results);
				res.status(200).send(results);
			});
		} catch (err) {
			this.logger.error(err, 'Y20XUB3', userId);
			res.status(500).send(`Error getting reviewers: ${err.message}`);
		}
	}

	async deleteReviewerData(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
			const { reviewerRowId } = req.body;
			const reviewer = await this.reviewer.findOne({ where: { id: reviewerRowId } });
			await reviewer.destroy();

			res.status(200).send({ deleted: true });
		} catch (err) {
			this.logger.error(err, '285XM5X', userId);
			res.status(500).send(`Error delete reviewer: ${err.message}`);
		}
	}

	async updateOrCreateReviewer(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
			const { reviewerData, fromApp } = req.body;
			res.status(200).send(await this.updateOrCreateReviewerHelper(reviewerData, userId, fromApp));
		} catch (err) {
			this.logger.error(err, 'PF9R4TP', userId);
			res.status(500).send(`Error adding or updating reviewer: ${err.message}`);
		}
	}

	async updateOrCreateReviewerHelper(reviewerData, userId) {
		try {
			const foundItem = await this.reviewer.findOne({ where: { id: reviewerData.id || 0 } });

			if (!foundItem) {
				await this.reviewer.create(reviewerData);
				return true;
			} else {
				foundItem.id = reviewerData.id;
				foundItem.name = reviewerData.name;
				foundItem.type = reviewerData.type;
				foundItem.title = reviewerData.title;
				foundItem.organization = reviewerData.organization;
				foundItem.email = reviewerData.email;
				foundItem.phone_number = reviewerData.phone_number;
				await foundItem.save();
			}

			return true;
		} catch (err) {
			this.logger.error(err, 'UP0C46O', userId);
			return false;
		}
	}
}

module.exports.ReviewerController = ReviewerController;
