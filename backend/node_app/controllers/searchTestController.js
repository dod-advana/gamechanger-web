const policySearchHandler = require('../modules/policy/policySearchHandler');
const SearchUtility = require('../utils/searchUtility');
const constants = require('../config/constants');

const opts = {
	GAMECHANGER_ELASTIC_SEARCH_OPTS: constants.GAMECHANGER_ELASTIC_SEARCH_OPTS,
	GLOBAL_SEARCH_OPTIONS: constants.GLOBAL_SEARCH_OPTIONS,
};

class SearchTestController {
	constructor() {
		this.policySearchHandler = new policySearchHandler(opts);
		this.searchUtility = new SearchUtility();

		this.testSearch = this.testSearch.bind(this);
		this.resultsWrapper = this.resultsWrapper.bind(this);
	}

	async testSearch(req, res) {
		let userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
		let documents = req.body;
		let docMetrics = {};
		let results = [];
		const METADATASOURCE = ['title', 'display_title_s', 'doc_num', 'filename'];
		try {
			for (const source in documents) {
				let positionSum = 0;
				let sourceData = {
					source: 'source',
					number_of_documents_tested: 0,
					number_of_documents_not_found: 0,
					number_of_documents_found: 0,
					average_position: 0,
				};
				for (const element of documents[source]) {
					for (const dataSource of METADATASOURCE) {
						let searchText = element.metaData[dataSource];
						if (searchText === 'N/A') continue;
						searchText = element.metaData[dataSource].replace(/[():]/g, (matched) => `\\${matched}`);
						let term = {
							titleOfSearchTestDoc: element.metaData.title,
							searchText: searchText,
							index: 'gamechanger',
							cloneName: 'gamechanger',
							searchTestString: element.metaData[dataSource],
							searchMetaType: dataSource,
						};
						req.body = term;
						let data = await this.policySearchHandler.searchHelper(req, userId, false);
						positionSum += this.resultsWrapper(data, source, term, sourceData, docMetrics);
					}
				}
				sourceData.average_position = sourceData.number_of_documents_found
					? positionSum / sourceData.number_of_documents_found
					: 0;
				results.push(sourceData);
			}
			res.send({ results: results, docMetrics: docMetrics });
		} catch (e) {
			console.log(e);
		}
	}

	resultsWrapper(data, source, term, sourceData, docMetrics) {
		let position = 0;
		console.log(`Searching ${source}`);
		sourceData.source = source;
		sourceData.number_of_documents_tested++;
		if (!data || data === '' || data.docs.length < 1) {
			sourceData.number_of_documents_not_found++;
		} else {
			position = data.docs.findIndex((el) => el.title === term.titleOfSearchTestDoc);
			position = position >= 0 ? position + 1 : 0;
			if (position === 0) {
				sourceData.number_of_documents_not_found++;
			} else {
				sourceData.number_of_documents_found++;
			}
		}
		if (Array.isArray(docMetrics[term.titleOfSearchTestDoc])) {
			docMetrics[term.titleOfSearchTestDoc].push({ [term.searchMetaType]: position });
		} else {
			docMetrics[term.titleOfSearchTestDoc] = [{ [term.searchMetaType]: position }];
		}
		return position;
	}
}

module.exports.SearchTestController = SearchTestController;
