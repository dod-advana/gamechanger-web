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


		this.getJbookReview = this.getJbookReview.bind(this);
		this.storeJbookReview = this.storeJbookReview.bind(this);
		
	}

	async getJbookReview(req, res) {
		let userId = 'webapp_unknown';
		const {btype, penum, bli} = req.query;
		try {
			// const { searchQuery, docTitle } = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');

			console.log("REQQQQQ\t",btype,penum, bli)
			console.log("REDQQQQQ!",req)

			this.rev.findAll({
				// attributes: ['Program_Element', 'Budget_Line_Item'] 
				where: {
					budget_type: btype,
					program_element: penum,
					budget_line_item: bli
				}
			}).then(results => {
				res.status(200).send({ review: results, timeStamp: new Date().toISOString() });
			});

		} catch (err) {
			this.logger.error(err, '9BN7UGJ', userId);
			res.status(500).send(err);
		}
	}

	async storeJbookReview(req, res) {
		let userId = 'webapp_unknown';
		try {
			// const { reviewData, btype,penum, bli } = req.body;
			const { reviewData } = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const [review, created] = await this.rev.findOrCreate(
				{
					where: { 
						// reviewer: reviewData.username,
						budget_type: reviewData.budget_type,
						program_element: reviewData.program_element,
						budget_line_item: reviewData.budget_line_item 
					},
					defaults: {
						rev_agree_label: reviewData.rev_agree_label,
						rev_core_ai_label: reviewData.rev_core_ai_label,
						rev_trans_known: reviewData.rev_trans_known,
						rev_trans_type: reviewData.rev_trans_type,
						rev_ptp: reviewData.rev_ptp,
						rev_mp_list: reviewData.rev_mp_list,
						rev_mp_add: reviewData.rev_mp_add,
						rev_review_stat: reviewData.rev_review_stat,
						secrev_agree_label: reviewData.secrev_agree_label,
						secrev_notes: reviewData.secrev_notes,
						secrev_review_stat:reviewData.secrev_review_stat,
						poc_title: reviewData.poc_title,
						poc_name: reviewData.poc_name,
						poc_email: reviewData.poc_email,
						review_notes: reviewData.review_notes,
						budget_year: reviewData.budget_year
					}
					
					
				}
			);

			if (!created) {
				// review.reviewer = reviewData.username;
				review.rev_trans_known = "No";
				review.rev_trans_type = "Service";
				review.rev_review_stat = "Needs Review";
				review.secrev_review_stat = "Needs Review";
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
