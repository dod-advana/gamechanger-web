const constants = require('../config/constants');
const loggerLib = require('@dod-advana/advana-logger');
const axiosLib = require('axios');

const mlBaseUrl = constants.GAMECHANGER_ML_API_BASE_URL;
const mlTrainBaseUrl = constants.GAMECHANGER_ML_API_TRAIN_BASE_URL;

const MLRoutes = {
	getLoadedModels: `${mlBaseUrl}/getLoadedModels`,
	getS3List: `${mlBaseUrl}/s3?function=models`,
	getS3DataList: `${mlTrainBaseUrl}/s3?function=data`,
	downloadS3File: `${mlBaseUrl}/downloadS3File`,
	downloadS3FileTrain: `${mlTrainBaseUrl}/downloadS3File`,
	deleteLocalModel: `${mlBaseUrl}/deleteLocalModel`,
	deleteLocalModelTrain: `${mlTrainBaseUrl}/deleteLocalModel`,
	downloadDependencies: `${mlBaseUrl}/download`,
	getAPIInformation: `${mlBaseUrl}/`,
	getAPIInformationTrain: `${mlTrainBaseUrl}/`,
	getModelsList: `${mlBaseUrl}/getModelsList`,
	getModelsListTrain: `${mlTrainBaseUrl}/getModelsList`,
	getDataList: `${mlTrainBaseUrl}/getDataList`,
	getFilesInCorpus: `${mlBaseUrl}/getFilesInCorpus`,
	getFilesInCorpusTrain: `${mlTrainBaseUrl}/getFilesInCorpus`,
	getProcessStatus: `${mlBaseUrl}/getProcessStatus`,
	getProcessStatusTrain: `${mlTrainBaseUrl}/getProcessStatus`,
	getCache: `${mlBaseUrl}/getCache`,
	sendUserAggregations: `${mlBaseUrl}/sendUserAggregations`,

	expandTerms: `${mlBaseUrl}/expandTerms`,
	questionAnswer: `${mlBaseUrl}/questionAnswer`,
	transSentenceSearch: `${mlBaseUrl}/transSentenceSearch`,
	textExtractions: `${mlBaseUrl}/textExtractions`,
	documentCompare: `${mlBaseUrl}/documentCompare`,
	transformResults: `${mlBaseUrl}/transformerSearch`,
	reloadModels: `${mlBaseUrl}/reloadModels`,
	downloadCorpus: `${mlTrainBaseUrl}/downloadCorpus`,
	trainModel: `${mlTrainBaseUrl}/trainModel`,
	initializeLTR: `${mlTrainBaseUrl}/LTR/initLTR`,
	createModelLTR: `${mlTrainBaseUrl}/LTR/createModel`,
	recommender: `${mlBaseUrl}/recommender`,
	stopProcess: `${mlBaseUrl}/stopProcess`,
	sendUserAggregationsTrain: `${mlTrainBaseUrl}/sendUserAggregations`,
	clearCache: `${mlBaseUrl}/clearCache`,
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
		this.getAPIInformation = this.getAPIInformation.bind(this);
		this.getAPIInformationTrain = this.getAPIInformationTrain.bind(this);

		// Get methods
		this.getModelsList = this.getData.bind(this, 'getModelsList');
		this.getModelsListTrain = this.getData.bind(this, 'getModelsListTrain');
		this.getDataList = this.getData.bind(this, 'getDataList');
		this.getS3List = this.getData.bind(this, 'getS3List');
		this.getS3DataList = this.getData.bind(this, 'getS3DataList');
		this.getLoadedModels = this.getData.bind(this, 'getLoadedModels');
		this.downloadDependencies = this.getData.bind(this, 'downloadDependencies');
		this.getFilesInCorpus = this.getData.bind(this, 'getFilesInCorpus');
		this.getFilesInCorpusTrain = this.getData.bind(this, 'getFilesInCorpusTrain');
		this.getProcessStatus = this.getData.bind(this, 'getProcessStatus');
		this.getProcessStatusTrain = this.getData.bind(this, 'getProcessStatusTrain');
		this.initializeLTR = this.getData.bind(this, 'initializeLTR');
		this.createModelLTR = this.getData.bind(this, 'createModelLTR');
		this.getCache = this.getData.bind(this, 'getCache');
		this.sendUserAggregations = this.postData.bind(this, 'sendUserAggregations');

		// Post methods
		this.downloadCorpus = this.postData.bind(this, 'downloadCorpus');
		this.trainModel = this.postData.bind(this, 'trainModel');
		this.reloadModels = this.postData.bind(this, 'reloadModels');
		this.downloadS3File = this.postData.bind(this, 'downloadS3File');
		this.downloadS3FileTrain = this.postData.bind(this, 'downloadS3FileTrain');
		this.deleteLocalModel = this.postData.bind(this, 'deleteLocalModel');
		this.deleteLocalModelTrain = this.postData.bind(this, 'deleteLocalModelTrain');
		this.stopProcess = this.postData.bind(this, 'stopProcess');
		this.sendUserAggregationsTrain = this.postData.bind(this, 'sendUserAggregationsTrain');
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

	async getAPIInformation() {
		let data = await this.getData('getAPIInformation', 'unkown');
		data['host'] = mlBaseUrl;
		return data;
	}
	async getAPIInformationTrain() {
		let data = await this.getData('getAPIInformationTrain', 'unkown');
		data['host'] = mlTrainBaseUrl;
		return data;
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
