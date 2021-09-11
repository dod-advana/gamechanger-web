const PDOC = require('../../models').pdoc;
const RDOC = require('../../models').rdoc;
const ACCOMP = require('../../models').accomp;
const REVIEW = require('../../models').review;
const { Sequelize } = require('sequelize');

const DataHandler = require('../base/dataHandler');

class BudgetSearchDataHandler extends DataHandler {
	constructor(opts = {}) {
		const {
            pdoc = PDOC,
            rdoc = RDOC,
            accomp = ACCOMP,
            review = REVIEW,
		} = opts;

		super({ ...opts}); 

		this.pdocs = pdoc;
		this.rdocs = rdoc;
		this.accomp = accomp;
        this.rev = review;


	}

    async getProjectData(req, userId) {
        const {peNum, projectNum, type} = req.body;
		console.log(req.body);
		try {

            const accomplishments = await this.accomp.findAll({
				where: {
					Program_Element: peNum,
                    Project_Number: projectNum
                }
			});

            if (type === 'Procurement') {
                const data = await this.pdocs.findOne({
                    where: {
                        Program_Element: peNum,
                        Budget_Line_Item: projectNum
                    }
                })
				
				if (data) {
					return data;
				}				
            }
            else {
                const data = this.rdocs.findOne({
                    where: {
                        Program_Element: peNum,
                        Project: projectNum
                    }
                })
				
				if (data) {
					data.accomplishments = accomplishments;
					return data;
				}
			}


		} catch (err) {
			this.logger.error(err, 'N49863Q', userId);
            return [];
		}
    }

    async getBudgetDropdownData(req, userId) {
		try {

            const reviewers = await this.pdocs.findAll({
                attributes: [Sequelize.fn('DISTINCT', Sequelize.col('reviewer')), 'reviewer']
            });

            const coreAILabel = await this.pdocs.findAll({
                attributes: [Sequelize.fn('DISTINCT', Sequelize.col('core_ai_label')), 'core_ai_label']
            });

            const serviceReviewer = await this.pdocs.findAll({
                attributes: [Sequelize.fn('DISTINCT', Sequelize.col('service_review')), 'service_review']
            });

            const reviewStat = await this.pdocs.findAll({
                attributes: [Sequelize.fn('DISTINCT', Sequelize.col('jaic_review_stat')), 'jaic_review_stat']
            });

            const transitionPartner = await this.pdocs.findAll({
                attributes: [Sequelize.fn('DISTINCT', Sequelize.col('planned_trans_part')), 'planned_trans_part']
            });

            const missionPartners = await this.pdocs.findAll({
                attributes: [Sequelize.fn('DISTINCT', Sequelize.col('current_msn_part')), 'current_msn_part']
            });

            const data = {
                reviewers,
                coreAILabel,
                serviceReviewer,
                reviewStat,
                transitionPartner,
                missionPartners
            };

            return data;

		} catch (err) {
			this.logger.error(err, 'XMCNRAU', userId);
			return [];
		}
    }

    async getBudgetReview(req, userId) {
		const {btype, penum, bli} = req.body;
		try {
			this.rev.findAll({
				where: {
					budget_type: btype,
					program_element: penum,
					budget_line_item: bli
				}
			}).then(results => {
				return { review: results, timeStamp: new Date().toISOString() };
			});

		} catch (err) {
			this.logger.error(err, '9BN7UGJ', userId);
			return {};
		}
	}

    async storeBudgetReview(req, userId) {
		try {
			const { reviewData } = req.body;

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

			return { created: created, updated: !created };

		} catch (err) {
			this.logger.error(err, 'GZ3D0DR', userId);
			return {}
		}
	}

	async callFunctionHelper(req, userId) {
		const {functionName} = req.body;

		try {
            switch (functionName) {
                case 'getProjectData':
                    return await this.getProjectData(req, userId);
                case 'getBudgetDropdownData': 
                    return await this.getBudgetDropdownData(req, userId);
                case 'getBudgetReview':
                    return await this.getBudgetReview(req, userId);
                case 'storeBudgetReview':
                    return await this.storeBudgetReview(req, userId);
                default:
                    this.logger.error(
                        `There is no function called ${functionName} defined in the budgetSearchSearchHandler`,
                        '71739D8',
                        userId
                    );
                    return {};
            }
		} catch (err) {
			console.log(e);
			const { message } = e;
			this.logger.error(message, 'D03Z7K6', userId);
			throw e;
		}
	}

}

module.exports = BudgetSearchDataHandler;
