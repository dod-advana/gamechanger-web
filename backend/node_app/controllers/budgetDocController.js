const PDOC = require('../models').pdoc;
const RDOC = require('../models').rdoc;

const LOGGER = require('../lib/logger');

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
    
        this.getBudgetDocs = this.getBudgetDocs.bind(this);
	}

    // retrieve all docs from both tables rdoc/pdoc
	async getBudgetDocs(req, res) {
		let userId = 'webapp_unknown';
        const {offset} = req.query;
		try {

            userId = req.get('SSL_CLIENT_S_DN_CN');

            // let docs = [];
			let pdocuments = await this.pdocs.findAndCountAll({
                limit: 10,
                offset
            });

            pdocuments.rows.map(data => {
                data.dataValues.type = 'Procurement';
            });

            let rdocuments = await this.rdocs.findAndCountAll(
                {
                    limit: 10,
                    offset
            });

            rdocuments.rows.map(data => {
                data.dataValues.type = 'RDT&E';
            });

            res.status(200).send({
                totalCount: pdocuments.count + rdocuments.count,
                docs: rdocuments.rows.concat(pdocuments.rows)
            });

		} catch (err) {
			this.logger.error(err, '9BN7UGJ', userId);
			res.status(500).send(err);
		}
	}

	
}

module.exports.BudgetDocController = BudgetDocController;
