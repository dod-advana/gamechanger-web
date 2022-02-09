const LOGGER = require('../lib/logger');
const COMPARE_FEEDBACK = require('../models').compare_feedback;
const SearchUtility = require('../utils/searchUtility');
const { DataLibrary} = require('../lib/dataLibrary');
const { MLApiClient } = require('../lib/mlApiClient');
const { result } = require('underscore');

class AnalystToolsController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			compareFeedbackModel = COMPARE_FEEDBACK,
			searchUtility = new SearchUtility(opts),
			dataLibrary = new DataLibrary(opts),
			mlApi = new MLApiClient(opts),
		} = opts;

		this.logger = logger;
		this.compareFeedbackModel = compareFeedbackModel;
		this.searchUtility = searchUtility;
		this.dataLibrary = dataLibrary;
		this.mlApi = mlApi;

		this.compareDocument = this.compareDocument.bind(this)
		this.compareFeedback = this.compareFeedback.bind(this)
	}


	async compareDocument(req,res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			
			const { cloneName, paragraphs = [], filters } = req.body;
			const permissions = req.permissions ? req.permissions : [];
			
			// ML API Call Goes Here
			const paragraphSearches = paragraphs.map((paragraph) => this.mlApi.getSentenceTransformerResultsForCompare(paragraph.text, userId, paragraph.id));
			const paragraphResults = await Promise.all(paragraphSearches);

			const resultsObject = {};
			
			paragraphResults.forEach(result => {
				Object.keys(result).forEach(id => {
					if (result[id].id && result[id]?.score >= 0.65){
						resultsObject[result[id].id] = {
							score: result[id].score,
							text: result[id].text,
							paragraphIdBeingMatched: result.paragraphIdBeingMatched
						};
					}
				});
			});

			const ids = Object.keys(resultsObject);
			// Query ES
			const esQuery = this.searchUtility.getDocumentParagraphsByParIDs(ids, filters);
			let clientObj = this.searchUtility.getESClient(cloneName, permissions);			

			let esResults = await this.dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery, userId);

			// Aggregate Data
			const returnData = this.searchUtility.cleanUpEsResults(esResults, [], userId, [], {}, null, esQuery, true, resultsObject);

			const cleanedDocs = returnData.docs.filter(doc => doc?.paragraphs?.length > 0)
			returnData.docs = cleanedDocs;

			res.status(200).send(returnData);
		} catch(e) {
			this.logger.error(e, '60OOE62', userId);
			res.status(500).send(e);
		}
	}

	async compareFeedback(req,res) {
		let userId = 'webapp_unknown';
		try{
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const { 
				searchedParagraph,
				matchedParagraphId,
				docId,
				positiveFeedback 
			} = req.body;

			await this.compareFeedbackModel.findOrCreate({
				where: { searchedParagraph, matchedParagraphId },
				defaults: {
					searchedParagraph,
					matchedParagraphId,
					docId,
					positiveFeedback 
				}
			})
			
			res.status(200);
		}catch(e){
			this.logger.error(e, '60OOE63', userId);
			res.status(500).send(e);
		}
	}
}

module.exports.AnalystToolsController = AnalystToolsController;
