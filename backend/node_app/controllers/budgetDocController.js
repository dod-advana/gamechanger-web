const PDOC = require('../models').pdoc;
const RDOC = require('../models').rdoc;

const LOGGER = require('../lib/logger');
const { Op } = require('sequelize');

class BudgetDocController {

	constructor(opts = {}) {
		const {
			logger = LOGGER,
			pdoc = PDOC,
            rdoc = RDOC
		} = opts;

		this.logger = logger;
		this.pdocs = pdoc;
        this.rdocs = rdoc;
    
        this.budgetDocSearch = this.budgetDocSearch.bind(this);
        this.getDocQuery = this.getDocQuery.bind(this);
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
        // const {offset, searchText, budgetSearchSettings} = req.body;
		try {

            userId = req.get('SSL_CLIENT_S_DN_CN');

            const {pdocQuery, rdocQuery} = this.getDocQuery(req.body);

			let pdocuments = await this.pdocs.findAndCountAll(pdocQuery);

            pdocuments.rows.map(data => {
                data.dataValues.type = 'Procurement';
            });

            let rdocuments = await this.rdocs.findAndCountAll(rdocQuery);

            rdocuments.rows.map(data => {
                data.dataValues.type = 'RDT&E';
            });

            res.status(200).send({
                totalCount: pdocuments.count + rdocuments.count,
                docs: rdocuments.rows.concat(pdocuments.rows)
            });

		} catch (err) {
			this.logger.error(err, 'N49863Q', userId);
			res.status(500).send(err);
		}
	}
	
}

module.exports.BudgetDocController = BudgetDocController;
