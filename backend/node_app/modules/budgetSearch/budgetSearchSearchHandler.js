const SearchUtility = require('../../utils/searchUtility');
const CONSTANTS = require('../../config/constants');
const { MLApiClient } = require('../../lib/mlApiClient');
const sparkMD5 = require('spark-md5');
const { DataLibrary} = require('../../lib/dataLibrary');
const BudgetSearchSearchUtility = require('./budgetSearchSearchUtility');

const SearchHandler = require('../base/searchHandler');

const PDOC = require('../../models').pdoc;
const RDOC = require('../../models').rdoc;
const ACCOMP = require('../../models').accomp;


class BudgetSearchSearchHandler extends SearchHandler {
	constructor(opts = {}) {
		const {
			dataLibrary = new DataLibrary(opts),
			constants = CONSTANTS,
			mlApi = new MLApiClient(opts),
			searchUtility = new SearchUtility(opts),
			budgetSearchSearchUtility = new BudgetSearchSearchUtility(opts),
			pdoc = PDOC,
			rdoc = RDOC,
			accomp = ACCOMP
		} = opts;

		super({ ...opts}); 
		this.dataLibrary = dataLibrary;
		this.constants = constants;
		this.mlApi = mlApi;
		this.searchUtility = searchUtility;
		this.budgetSearchSearchUtility = budgetSearchSearchUtility;

		this.pdocs = pdoc;
		this.rdocs = rdoc;
		this.accomp = accomp;
	}

	async searchHelper(req, userId) {
		const historyRec = {
			user_id: userId,
			clone_name: undefined,
			search: '',
			startTime: new Date().toISOString(),
			numResults: -1,
			endTime: null,
			hadError: false,
			tiny_url: '',
			cachedResult: false,
			search_version: 1,
			request_body: {},
		};

		const {
			searchText,
			searchVersion,
			cloneName,
			offset,
			showTutorial = false,
			tiny_url,
			budgetSearchSettings = {}
		} = req.body;

		try {
			historyRec.search = searchText;
			historyRec.searchText = searchText;
			historyRec.tiny_url = tiny_url;
			historyRec.clone_name = cloneName;
			historyRec.search_version = searchVersion;
			historyRec.request_body = req.body;
			historyRec.showTutorial = showTutorial;

			let searchResults;

			try {
				// log query to ES
				this.storeEsRecord('gamechanger', offset, cloneName, userId, searchText);
			} catch (e) {
				console.log(e);
			}

			// search postgres
			searchResults = await this.documentSearch(req, userId);

			// store record in history
			try {
				const { totalCount } = searchResults;
				historyRec.endTime = new Date().toISOString();
				historyRec.numResults = totalCount;
				await this.storeRecordOfSearchInPg(historyRec, userId);
			} catch (e) {
				this.logger.error(e.message, 'ZMVI2TO', userId);
			}

			return searchResults;

		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'WHMU1G2', userId);
			historyRec.endTime = new Date().toISOString();
			historyRec.hadError = true;
			await this.storeRecordOfSearchInPg(historyRec, showTutorial);
			
			throw err;
		}
	}

	async storeEsRecord(clientName, offset, clone_name, userId, searchText){
		try {
			// log search query to elasticsearch
			if (offset === 0){
				let clone_log = clone_name || 'policy';
				const searchLog = {
					user_id: sparkMD5.hash(userId),
					search_query: searchText,
					run_time: new Date().getTime(),
					clone_name: clone_log
				};
	
				await this.dataLibrary.putDocument(clientName, 'none', searchLog);
			}
		} catch (e) {
			this.logger.error(e.message, 'KVRECAF');
		}
	}

	async documentSearch(req, userId) {

		try {
			const {
				offset, 
				searchText, 
				budgetSearchSettings
			} = req.body;

            let limit = 9;

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

			return {
                totalCount,
                docs: rdocuments.concat(pdocuments)
            }
		} catch (e) {
			console.log(e);
			const { message } = e;
			this.logger.error(message, 'IDD6Y19', userId);
			throw e;
		}
	}

	async callFunctionHelper(req, userId) {
		const {functionName} = req.body;

		try {
            switch (functionName) {
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

module.exports = BudgetSearchSearchHandler;
