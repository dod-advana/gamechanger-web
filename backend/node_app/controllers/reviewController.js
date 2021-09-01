const REVIEW = require('../models').review;
// const RDOC_REVIEW = require('../models').rdoc_review;
const LOGGER = require('../lib/logger');
// const sparkMD5Lib = require('spark-md5');

class ReviewController {

	constructor(opts = {}) {
		const {
			logger = LOGGER,
			review = REVIEW,
			// rdocReview = RDOC_REVIEW,
			// sparkMD5 = sparkMD5Lib,
		
		} = opts;

		this.logger = logger;
		this.rev = review;
		// this.rdocRev = rdocReview;
		// this.sparkMD5 = sparkMD5;


		this.getProjReview = this.getProjReview.bind(this);
		
	}

	async getProjReview(req, res) {
		let userId = 'webapp_unknown';
		const {btype, penum, bli} = req.query;
		try {
			// const { searchQuery, docTitle } = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');

			console.log("REQQQQQ\t",btype,penum, bli)

			this.rev.findAll({
				// attributes: ['Program_Element', 'Budget_Line_Item'] 
				where: {
					Program_Element: penum,
					Budget_Line_Item: bli
				}
			}).then(results => {
				res.status(200).send({ review: results, timeStamp: new Date().toISOString() });
			});

		} catch (err) {
			this.logger.error(err, '9BN7UGJ', userId);
			res.status(500).send(err);
		}
	}

	async storeReviewData(req, res) {
		let userId = 'webapp_unknown';
		try {
			const { reviewData, btype,penum, bli } = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const [review, created] = await this.rev.findOrCreate(
				{
					where: { 
						// reviewer: reviewData.username,
						budget_type: btype,
						Program_Element: penum,
						Budget_Line_Item: bli 
					},
					defaults: {
						reviewer: reviewData.username 
					}
				}
			);

			if (!created) {
				review.reviewer = reviewData.username;
				await review.save();
			}

			res.status(200).send({ created: created, updated: !created });

		} catch (err) {
			this.logger.error(err, 'GZ3D0DR', userId);
			res.status(500).send(err);
		}
	}

	
}

module.exports.ReviewController = ReviewController;
