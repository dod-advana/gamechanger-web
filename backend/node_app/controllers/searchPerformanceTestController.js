const policy_search_performance_tests = require('../models').policy_search_performance_tests;

class SearchPerformanceTestController {
	constructor() {
		this.policy_search_performance_tests = policy_search_performance_tests;

		this.getTests = this.getTests.bind(this);
		this.postTests = this.postTests.bind(this);
		this.resetTestTable = this.resetTestTable.bind(this);
	}

	async resetTestTable() {
		await policy_search_performance_tests.destroy({
			truncate: true,
		});
	}

	async getTests(req, res) {
		try {
			let results = await this.policy_search_performance_tests.findAll();
			res.send(results);
		} catch (e) {
			console.log(e);
		}
	}

	async postTests(req, res) {
		let body = req.body;

		try {
			let insert = await this.policy_search_performance_tests.create(body);
			res.send(insert);
		} catch (e) {
			console.log(e);
		}
	}
}

module.exports.SearchPerformanceTestController = SearchPerformanceTestController;
