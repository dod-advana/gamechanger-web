const LOGGER = require('@dod-advana/advana-logger');
const SearchUtility = require('../utils/searchUtility');
const { DataLibrary} = require('../lib/dataLibrary');
const { MLApiClient } = require('../lib/mlApiClient');

class AnalystToolsController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			searchUtility = new SearchUtility(opts),
			dataLibrary = new DataLibrary(opts),
			mlApi = new MLApiClient(opts),
		} = opts;

		this.logger = logger;
		this.searchUtility = searchUtility;
		this.dataLibrary = dataLibrary;
		this.mlApi = mlApi;

		this.compareDocument = this.compareDocument.bind(this)
	}


	async compareDocument(req,res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			
			const { cloneName, paragraphs = [] } = req.body;
			const permissions = req.permissions ? req.permissions : [];
			
			// ML API Call Goes Here
			const paragraphSearches = paragraphs.map((paragraph, id) => this.mlApi.getSentenceTransformerResultsForCompare(paragraph, userId, id));
			const paragraphResults = await Promise.all(paragraphSearches);
			
			const resultsObject = {};
			
			paragraphResults.forEach(result => {
				Object.keys(result).forEach(id => {
					resultsObject[result[id].id] = {
						score: result[id].score,
						text: result[id].text,
						paragraphIdBeingMatched: result.paragraphIdBeingMatched
					};
				});
			});
			
			const ids = Object.keys(resultsObject);
			
			// Query ES
			const esQuery = this.searchUtility.getDocumentParagraphsByParIDs(ids);
			let clientObj = this.searchUtility.getESClient(cloneName, permissions);
			let esResults = await this.dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery, userId);
			
			// Aggregate Data
			const returnData = this.searchUtility.cleanUpEsResults(esResults, [], userId, [], {}, null, esQuery, true, resultsObject);
			
			res.status(200).send(returnData);
		} catch(e) {
			this.logger.error(e, '60OOE62', userId);
			res.status(500).send(e);
		}
	}
}

module.exports.AnalystToolsController = AnalystToolsController;
