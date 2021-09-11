const LOGGER = require('../../lib/logger');
const constantsFile = require('../../config/constants');
const SearchUtility = require('../../utils/searchUtility');

class BudgetSearchSearchUtility {
	constructor(opts = {}) {

        const {
            logger = LOGGER,
            constants = constantsFile,
			searchUtility = new SearchUtility(opts)
        } = opts;

		this.logger = logger;
		this.constants = constants;
		this.searchUtility = searchUtility;

	}

}

module.exports = BudgetSearchSearchUtility;
