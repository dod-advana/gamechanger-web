const constants = require('../config/constants');
const loggerLib = require('@dod-advana/advana-logger');
const axiosLib = require('axios');

const mlBaseUrl = constants.GAMECHANGER_ML_API_BASE_URL;
const transformerBaseUrl = constants.GAMECHANGER_ML_API_BASE_URL;
const mlTrainBaseUrl = constants.GAMECHANGER_ML_API_TRAIN_BASE_URL;

const MLRoutes = {
	getLoadedModels: `${transformerBaseUrl}/getLoadedModels`,
	getS3List: `${transformerBaseUrl}/s3?function=models`,
	getS3DataList: `${transformerBaseUrl}/s3?function=data`,
	downloadS3File: `${transformerBaseUrl}/downloadS3File`,
	deleteLocalModel: `${transformerBaseUrl}/deleteLocalModel`,
	downloadDependencies: `${transformerBaseUrl}/download`,
	getAPIInformation: `${transformerBaseUrl}/`,
	getAPIInformationTrain: `${mlTrainBaseUrl}/`,
	getModelsList: `${transformerBaseUrl}/getModelsList`,
	getDataList: `${transformerBaseUrl}/getDataList`,
	getFilesInCorpus: `${transformerBaseUrl}/getFilesInCorpus`,
	getProcessStatus: `${transformerBaseUrl}/getProcessStatus`,
	getCache: `${transformerBaseUrl}/getCache`,

	expandTerms: `${mlBaseUrl}/expandTerms`,
	questionAnswer: `${mlBaseUrl}/questionAnswer`,
	transSentenceSearch: `${transformerBaseUrl}/transSentenceSearch`,
	textExtractions: `${transformerBaseUrl}/textExtractions`,
	documentCompare: `${transformerBaseUrl}/documentCompare`,
	transformResults: `${transformerBaseUrl}/transformerSearch`,
	reloadModels: `${transformerBaseUrl}/reloadModels`,
	downloadCorpus: `${transformerBaseUrl}/downloadCorpus`,
	trainModel: `${mlTrainBaseUrl}/trainModel`,
	initializeLTR: `${transformerBaseUrl}/LTR/initLTR`,
	createModelLTR: `${mlTrainBaseUrl}/LTR/createModel`,
	recommender: `${transformerBaseUrl}/recommender`,
	stopProcess: `${transformerBaseUrl}/stopProcess`,
	sendUserAggregations: `${mlTrainBaseUrl}/sendUserAggregations`,
	clearCache: `${transformerBaseUrl}/clearCache`,
};
/**
 * @class MLApiClient
 */
class MLApiClient {
	constructor(opts = {}) {
		const { logger = loggerLib, axios = axiosLib } = opts;

		this.logger = logger;
		this.axios = axios;

		this.getExpandedSearchTerms = this.getExpandedSearchTerms.bind(this);
		this.transformResults = this.transformResults.bind(this);
		this.getSentenceTransformerResults = this.getSentenceTransformerResults.bind(this);
		this.getSentenceTransformerResultsForCompare = this.getSentenceTransformerResultsForCompare.bind(this);
		this.recommender = this.recommender.bind(this);
		this.queryExpansion = this.queryExpansion.bind(this);

		// Get methods
		this.getModelsList = this.getData.bind(this, 'getModelsList');
		this.getDataList = this.getData.bind(this, 'getDataList');
		this.getAPIInformation = this.getData.bind(this, 'getAPIInformation');
		this.getAPIInformationTrain = this.getData.bind(this, 'getAPIInformationTrain');
		this.getS3List = this.getData.bind(this, 'getS3List');
		this.getS3DataList = this.getData.bind(this, 'getS3DataList');
		this.getLoadedModels = this.getData.bind(this, 'getLoadedModels');
		this.downloadDependencies = this.getData.bind(this, 'downloadDependencies');
		this.getFilesInCorpus = this.getData.bind(this, 'getFilesInCorpus');
		this.getProcessStatus = this.getData.bind(this, 'getProcessStatus');
		this.initializeLTR = this.getData.bind(this, 'initializeLTR');
		this.createModelLTR = this.getData.bind(this, 'createModelLTR');
		this.getCache = this.getData.bind(this, 'getCache');
		// Post methods
		this.downloadCorpus = this.postData.bind(this, 'downloadCorpus');
		this.trainModel = this.postData.bind(this, 'trainModel');
		this.reloadModels = this.postData.bind(this, 'reloadModels');
		this.downloadS3File = this.postData.bind(this, 'downloadS3File');
		this.deleteLocalModel = this.postData.bind(this, 'deleteLocalModel');
		this.stopProcess = this.postData.bind(this, 'stopProcess');
		this.sendUserAggregations = this.postData.bind(this, 'sendUserAggregations');
		this.clearCache = this.postData.bind(this, 'clearCache');
	}

	async getExpandedSearchTerms(termsList, userId = 'unknown', qe_model = undefined) {
		const data = { termsList, docIdsOnly: true };
		if (qe_model) data['qe_model'] = qe_model;
		return this.postData('expandTerms', userId, data);
	}

	async queryExpansion(searchText, userId = 'unknown') {
		const data = { termsList: [searchText], qe_model: 'jbook' };
		return this.postData('expandTerms', userId, data);
	}

	async getIntelAnswer(searchQuery, searchContext, userId = 'unknown') {
		const data = { query: searchQuery, search_context: searchContext };
		return this.postData('questionAnswer', userId, data);
	}

	async getTextExtractions(text, extractType, userId = 'unknown') {
		const data = { text: text };
		return this.postData('textExtractions', userId, data, `?extractType=${extractType}`);
	}

	async getSentenceTransformerResults(searchText, userId = 'unknown') {
		const data = { text: searchText };
		return this.postData('transSentenceSearch', userId, data);
	}

	async getSentenceTransformerResultsForCompare(searchText, paragraphIdBeingMatched, userId = 'unknown') {
		const data = { text: searchText };
		const returnData = await this.postData('documentCompare', userId, data, '?num_results=15');

		return { ...returnData, paragraphIdBeingMatched };
	}

	async transformResults(searchText, docs, userId = 'unknown') {
		const data = { query: searchText, documents: docs };
		return this.postData('transformResults', userId, data);
	}

	async recommender(doc, userId = 'unknown') {
		const data = { filenames: doc };
		return this.postData('recommender', userId, data);
	}
	/**
	 * A generic get method to query the ML API.
	 * @method getData
	 * @param {string} key - a string mapping to a ml route
	 * @param {string} userId - the id of the user
	 * @returns an object with the ml api response data
	 */
	async getData(key, userId) {
		const headers = {
			ssl_client_s_dn_cn: userId,
		};
		try {
			const url = MLRoutes[key];
			const { data } = await this.axios({
				url,
				method: 'get',
				headers,
			});
			return data;
		} catch (e) {
			this.logger.error(e, 'VY3FQBN', userId);
			throw e;
		}
	}
	/**
	 * A generic post method to update the ML API
	 * @method postData
	 * @param {string} key - a string mapping to a ml route
	 * @param {string} userId - the id of the user
	 * @param {Object} postData
	 * @returns an object with the ml api response data
	 */
	async postData(key, userId, postData, queryString) {
		if (!constants.USE_ML_API) {
			return {};
		}
		const headers = {
			ssl_client_s_dn_cn: userId,
		};
		try {
			let url = MLRoutes[key];

			if (queryString) url += queryString;
			const { data } = await this.axios({
				url,
				method: 'post',
				headers,
				data: postData,
			});
			return data;
		} catch (e) {
			this.logger.error(e, 'QWU3KOP', userId);
			throw e;
		}
	}
}

module.exports.MLApiClient = MLApiClient;
