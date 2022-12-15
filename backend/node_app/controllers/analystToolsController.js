const LOGGER = require('@dod-advana/advana-logger');
const COMPARE_FEEDBACK = require('../models').compare_feedback;
const SearchUtility = require('../utils/searchUtility');
const EDASearchUtility = require('../modules/eda/edaSearchUtility');
const { DataLibrary } = require('../lib/dataLibrary');
const { MLApiClient } = require('../lib/mlApiClient');
const sparkMD5Lib = require('spark-md5');
const { getUserIdFromSAMLUserId } = require('../utils/userUtility');

const edaCompareDocumentHelper = async (paragraphs, filters, clientObj, userId, edaSearchUtility, dataLibrary) => {
	const esQuery = edaSearchUtility.getESSimilarityQuery(paragraphs, filters);

	const esResults = await dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery, userId);

	let returnData = edaSearchUtility.cleanUpEsResults(esResults, [], userId, [], {}, clientObj.esIndex, esQuery);

	if (returnData?.docs) {
		returnData.docs.forEach((doc) => {
			doc.pageHits.forEach((hit) => {
				hit.id = `${doc.title}_${hit.pageNumber}`;
			});
		});
	}

	return returnData;
};

const policyCompareDocumentHelper = async (
	paragraphs,
	filters,
	clientObj,
	userId,
	mlApi,
	searchUtility,
	dataLibrary
) => {
	// ML API Call Goes Here
	const paragraphSearches = paragraphs.map((paragraph) =>
		mlApi.getSentenceTransformerResultsForCompare(paragraph.text, paragraph.id, userId)
	);
	const paragraphResults = await Promise.all(paragraphSearches);

	let resultsObject = {};
	paragraphResults.forEach((para) => {
		Object.keys(para).forEach((id) => {
			resultsObject[para[id].id] = {
				score: para[id].score,
				text: para[id].text,
				paragraphIdBeingMatched: para.paragraphIdBeingMatched,
				score_display: para[id].score_display,
			};
		});
	});

	const ids = Object.keys(resultsObject);
	// Query ES
	const esQuery = searchUtility.getDocumentParagraphsByParIDs(ids, filters);

	const esResults = await dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery, userId);

	// Aggregate Data
	let returnData = searchUtility.cleanUpEsResults({
		raw: esResults,
		searchTerms: [],
		user: userId,
		selectedDocuments: [],
		expansionDict: {},
		index: null,
		query: esQuery,
		isCompareReturn: true,
		paragraphResults: resultsObject,
	});

	const cleanedDocs = returnData.docs.filter((doc) => doc?.paragraphs?.length > 0);
	returnData.docs = cleanedDocs;

	return returnData;
};
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
		this.getFilterCounts = this.getFilterCounts.bind(this);
		this.compareFeedback = this.compareFeedback.bind(this);
	}

	async compareDocument(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');

			const { cloneName, paragraphs = [], filters } = req.body;
			const permissions = req.permissions ? req.permissions : [];

			const clientObj = this.searchUtility.getESClient(cloneName, permissions);
			let returnData = {};

			if (cloneName === 'eda') {
				returnData = await edaCompareDocumentHelper(
					paragraphs,
					filters,
					clientObj,
					userId,
					this.edaSearchUtility
				);
			} else {
				returnData = await policyCompareDocumentHelper(
					paragraphs,
					filters,
					clientObj,
					userId,
					this.mlApi,
					this.searchUtility,
					this.dataLibrary
				);
			}
			return res.status(200).send(returnData);
		} catch (e) {
			this.logger.error(e, '60OOE62', userId);
			res.status(500).send(e);
		}
	}

	async getFilterCounts(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');

			const { cloneName, paragraphs = [], filters } = req.body;
			const permissions = req.permissions ? req.permissions : [];

			const clientObj = this.searchUtility.getESClient(cloneName, permissions);
			let orgCount = {};
			let typeCount = {};

			if (cloneName !== 'eda') {
				const resultsForOrgCount = await policyCompareDocumentHelper(
					paragraphs,
					{ ...filters, orgFilters: [] },
					clientObj,
					userId,
					this.mlApi,
					this.searchUtility,
					this.dataLibrary
				);
				resultsForOrgCount.docs.forEach((doc) => {
					if (orgCount[doc.display_org_s]) {
						orgCount[doc.display_org_s]++;
					} else {
						orgCount[doc.display_org_s] = 1;
					}
				});

				const resultsForTypeCount = await policyCompareDocumentHelper(
					paragraphs,
					{ ...filters, typeFilters: [] },
					clientObj,
					userId,
					this.mlApi,
					this.searchUtility,
					this.dataLibrary
				);
				resultsForTypeCount.docs.forEach((doc) => {
					if (typeCount[doc.display_doc_type_s]) {
						typeCount[doc.display_doc_type_s]++;
					} else {
						typeCount[doc.display_doc_type_s] = 1;
					}
				});
			}
			return res.status(200).send({
				orgCount,
				typeCount,
			});
		} catch (e) {
			this.logger.error(e, 'DUUUUDE', userId);
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
