const PDOC = require('../models').pdoc;
const RDOC = require('../models').rdoc;
const ACCOMP = require('../models').accomp;

const LOGGER = require('../lib/logger');
const { Op, Sequelize } = require('sequelize');

class BudgetDocController {

	constructor(opts = {}) {
		const {
			logger = LOGGER,
			pdoc = PDOC,
            rdoc = RDOC,
            accomp = ACCOMP
		} = opts;

		this.logger = logger;
		this.pdocs = pdoc;
        this.rdocs = rdoc;
        this.accomp = accomp;
    
        this.budgetDocSearch = this.budgetDocSearch.bind(this);
        this.getDocQuery = this.getDocQuery.bind(this);
        this.getProjectData = this.getProjectData.bind(this);
        this.getBudgetDropdownData = this.getBudgetDropdownData.bind(this);
	}

    getDocQuery({offset, searchText, budgetSearchSettings}) {
        const baseQuery = {
            limit: 10,
            offset, 
        }

        // const {
        //     dataSources
        // } = budgetSearchSettings;

        let pdocQuery = baseQuery;
        let rdocQuery = baseQuery;

        // if (dataSources && dataSources.length > 0) {

        // }

        if (searchText && searchText !== '') {
            pdocQuery = {
                ...baseQuery,
                where: {
                    [Op.or]: [
                        {
                            Program_Description: {
                                [Op.iLike]: `%${searchText}%`
                            }
                        },
                        {
                            Budget_Activity_Title: {
                                [Op.iLike]: `%${searchText}%`
                            }
                        },
                        {
                            Budget_Line_Item_Title: {
                                [Op.iLike]: `%${searchText}%`
                            }
                        },
                        {
                            Budget_Justification: {
                                [Op.iLike]: `%${searchText}%`
                            }
                        }
                    ]
                }
            }

            rdocQuery = {
                ...baseQuery,
                where: {
                    [Op.or]: [
                        {
                            Budget_Activity_Title: {
                                [Op.iLike]: `%${searchText}%`
                            }
                        },
                        {
                            Program_Element_Title: {
                                [Op.iLike]: `%${searchText}%`
                            }
                        },
                        {
                            Program_Element_Notes: {
                                [Op.iLike]: `%${searchText}%`
                            }
                        },
                        {
                            PE_Mission_Description_and_Budget_Justification: {
                                [Op.iLike]: `%${searchText}%`
                            }
                        },
                        {
                            Project_Mission_Description: {
                                [Op.iLike]: `%${searchText}%`
                            }
                        }
                    ]
                }
            }
        }

        return {pdocQuery, rdocQuery}
    }

    // retrieve all docs from both tables rdoc/pdoc
	async budgetDocSearch(req, res) {
		let userId = 'webapp_unknown';
        const {offset, searchText, budgetSearchSettings} = req.body;
		try {

            userId = req.get('SSL_CLIENT_S_DN_CN');
            let limit = 10;

            let pQuery = `SELECT COUNT(*) OVER (), * FROM pdoc where _search @@ to_tsquery('english', :searchText) LIMIT :limit OFFSET :offset;`
            let rQuery = `SELECT COUNT(*) OVER (), * FROM rdoc where _search @@ to_tsquery('english', :searchText) LIMIT :limit OFFSET :offset;`
            let totalCount = 0;

            if (!searchText || searchText === '') {
                pQuery = `SELECT COUNT(*) OVER (), * FROM pdoc LIMIT :limit`;
                rQuery = `SELECT COUNT(*) OVER (), * FROM rdoc LIMIT :limit`;
            }
            const presults = await this.pdocs.sequelize.query(pQuery, { replacements: { searchText, offset, limit }});

            const pdocuments = presults && presults[0] ? presults[0] : [];
            if (pdocuments.length && pdocuments.length > 0) {
                pdocuments.map(data => {
                    data.type = 'Procurement';
                });
                totalCount += parseInt(pdocuments[0].count);
            }

            const rresults = await this.rdocs.sequelize.query(rQuery, { replacements: { searchText, offset, limit }});

            const rdocuments = rresults && rresults[0] ? rresults[0] : [];

            if (rdocuments.length && rdocuments.length > 0) {
                rdocuments.map(data => {
                    data.type = 'RDT&E';
                });
                totalCount += parseInt(rdocuments[0].count);
            }


            res.status(200).send({
                totalCount,
                docs: rdocuments.concat(pdocuments)
            });

		} catch (err) {
			this.logger.error(err, 'N49863Q', userId);
			res.status(500).send(err);
		}
	}

    async getProjectData(req, res) {
        let userId = 'webapp_unknown';
        const {peNum, projNum, type} = req.query;
		try {

            userId = req.get('SSL_CLIENT_S_DN_CN');
            const accomplishments = await this.accomp.findAll({
				where: {
					Program_Element: peNum,
                    Project_Number: projNum
                }
			});

            if (type === 'Procurement') {
                this.pdocs.findOne({
                    where: {
                        Program_Element: peNum,
                        Budget_Line_Item: projNum
                    }
                }).then(data => {
                    if (data) {
                        res.status(200).send(data);
                    }
                });
            }
            else {
                this.rdocs.findOne({
                    where: {
                        Program_Element: peNum,
                        Project: projNum
                    }
                }).then(data => {
                    if (data) {
                        data.dataValues.accomplishments = accomplishments;
                        res.status(200).send(data);
                    }
                });
            }



		} catch (err) {
			this.logger.error(err, 'N49863Q', userId);
			res.status(500).send(err);
		}
    }

    async getBudgetDropdownData(req, res) {
        let userId = 'webapp_unknown';
        // const {peNum, projNum, type} = req.query;
		try {

            userId = req.get('SSL_CLIENT_S_DN_CN');

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

            res.status(200).send(data);


		} catch (err) {
			this.logger.error(err, 'XMCNRAU', userId);
			res.status(500).send(err);
		}
    }
	
}

module.exports.BudgetDocController = BudgetDocController;
