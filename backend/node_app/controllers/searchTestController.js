const policySearchHandler = require('../modules/policy/policySearchHandler');

class SearchTestController {
	constructor() {
		this.policySearchHandler = new policySearchHandler();

		this.testSearch = this.testSearch.bind(this);
	}

	async testSearch(req, res) {
		console.log('controller', req.body);
		try {
			let results = await this.policySearchHandler.searchHelper(req, '979832340@mil', false);
			res.send(results);
		} catch (e) {
			console.log(e);
		}
	}
}

module.exports.SearchTestController = SearchTestController;
