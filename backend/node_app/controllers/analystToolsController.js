const LOGGER = require('@dod-advana/advana-logger');
const COMPARE_FEEDBACK = require('../models').compare_feedback;
const SearchUtility = require('../utils/searchUtility');
const EDASearchUtility = require('../modules/eda/edaSearchUtility');
const { DataLibrary } = require('../lib/dataLibrary');
const { MLApiClient } = require('../lib/mlApiClient');
const sparkMD5Lib = require('spark-md5');
const { result } = require('underscore');
const { getUserIdFromSAMLUserId } = require('../utils/userUtility');

class AnalystToolsController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			compareFeedbackModel = COMPARE_FEEDBACK,
			searchUtility = new SearchUtility(opts),
			edaSearchUtility = new EDASearchUtility(opts),
			dataLibrary = new DataLibrary(opts),
			mlApi = new MLApiClient(opts),
			sparkMD5 = sparkMD5Lib,
		} = opts;

		this.logger = logger;
		this.compareFeedbackModel = compareFeedbackModel;
		this.searchUtility = searchUtility;
		this.edaSearchUtility = edaSearchUtility;
		this.dataLibrary = dataLibrary;
		this.mlApi = mlApi;
		this.sparkMD5 = sparkMD5;

		this.compareDocument = this.compareDocument.bind(this);
		this.compareFeedback = this.compareFeedback.bind(this);
	}

	async compareDocument(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');

			const { cloneName, paragraphs = [], filters } = req.body;
			const permissions = req.permissions ? req.permissions : [];

			let esQuery = {};
			const resultsObject = {};
			const clientObj = this.searchUtility.getESClient(cloneName, permissions);
			let esResults = {};

			if (cloneName === 'eda') {
				const pageESQuery = this.edaSearchUtility.getESSimilarityQuery(paragraphs, filters);

				const pageResults = await this.dataLibrary.queryElasticSearch(
					clientObj.esClientName,
					clientObj.esIndex,
					pageESQuery,
					userId
				);

				const paragraphResults = this.edaSearchUtility.getParagraphResults(pageResults);

				paragraphResults.forEach((result) => {
					Object.keys(result).forEach((id) => {
						if (result[id].id && result[id]?.score >= 0.65) {
							resultsObject[result[id].id] = {
								score: result[id].score,
								text: result[id].text,
								paragraphIdBeingMatched: result.paragraphIdBeingMatched,
							};
						}
					});
				});

				const ids = Object.keys(resultsObject);
				esQuery = this.edaSearchUtility.getDocumentParagraphsByPageIDs(ids, filters);

				esResults = await this.dataLibrary.queryElasticSearch(
					clientObj.esClientName,
					clientObj.esIndex,
					esQuery,
					userId
				);
			} else {
				// ML API Call Goes Here
				const paragraphSearches = paragraphs.map((paragraph) =>
					this.mlApi.getSentenceTransformerResultsForCompare(paragraph.text, userId, paragraph.id)
				);
				const paragraphResults = await Promise.all(paragraphSearches);

				paragraphResults.forEach((result) => {
					Object.keys(result).forEach((id) => {
						if (result[id].id && result[id]?.score >= 0.65) {
							resultsObject[result[id].id] = {
								score: result[id].score,
								text: result[id].text,
								paragraphIdBeingMatched: result.paragraphIdBeingMatched,
							};
						}
					});
				});

				const ids = Object.keys(resultsObject);
				// Query ES
				esQuery = this.searchUtility.getDocumentParagraphsByParIDs(ids, filters);

				esResults = await this.dataLibrary.queryElasticSearch(
					clientObj.esClientName,
					clientObj.esIndex,
					esQuery,
					userId
				);
			}

			// Aggregate Data
			const returnData = this.searchUtility.cleanUpEsResults(
				esResults,
				[],
				userId,
				[],
				{},
				null,
				esQuery,
				true,
				resultsObject
			);

			const cleanedDocs = returnData.docs.filter((doc) => doc?.paragraphs?.length > 0);

			// Temporarily return first 12 results for testing eda
			returnData.docs = cleanedDocs.length > 0 ? cleanedDocs : returnData.docs.slice(0, 12);

			res.status(200).send(returnData);
		} catch (e) {
			this.logger.error(e, '60OOE62', userId);
			res.status(500).send(e);
		}
	}

	async compareFeedback(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
			const { searchedParagraph, matchedParagraphId, docId, positiveFeedback, undo = false } = req.body;

			if (undo) {
				await this.compareFeedbackModel.destroy({
					where: { searchedParagraph, matchedParagraphId, userId: getUserIdFromSAMLUserId(req) },
				});
				return res.status(200).send();
			}

			const [record, created] = await this.compareFeedbackModel.findOrCreate({
				where: { searchedParagraph, matchedParagraphId, userId: getUserIdFromSAMLUserId(req) },
				defaults: {
					searchedParagraph,
					matchedParagraphId,
					docId,
					positiveFeedback,
					userId,
				},
			});

			if (!created && record.positiveFeedback !== positiveFeedback) {
				record.set({ positiveFeedback });
				await record.save();
			}

			res.status(200).send();
		} catch (e) {
			this.logger.error(e, '60OOE63', userId);
			res.status(500).send(e);
		}
	}
}

module.exports.AnalystToolsController = AnalystToolsController;
