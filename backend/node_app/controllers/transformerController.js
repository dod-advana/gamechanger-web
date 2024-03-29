const { MLApiClient } = require('../lib/mlApiClient');
const LOGGER = require('@dod-advana/advana-logger');
/**
 * This class takes HTTP requests and passes needed
 * data onto the MLApiClient to get information
 * or update the ML API.
 * @class TransformerController
 */
class TransformerController {
	constructor(opts = {}) {
		const { logger = LOGGER, mlApi = new MLApiClient(opts) } = opts;

		this.logger = logger;
		this.mlApi = mlApi;

		// A mapping to the methods in MLApiClient
		this.registry = {
			getAPIInformation: this.mlApi.getAPIInformation,
			getAPIInformationTrain: this.mlApi.getAPIInformationTrain,
			getS3List: this.mlApi.getS3List,
			getS3DataList: this.mlApi.getS3DataList,
			downloadDependencies: this.mlApi.downloadDependencies,
			downloadS3File: this.mlApi.downloadS3File,
			downloadS3FileTrain: this.mlApi.downloadS3FileTrain,
			deleteLocalModel: this.mlApi.deleteLocalModel,
			deleteLocalModelTrain: this.mlApi.deleteLocalModelTrain,
			getModelsList: this.mlApi.getModelsList,
			getModelsListTrain: this.mlApi.getModelsListTrain,
			getDataList: this.mlApi.getDataList,
			getLoadedModels: this.mlApi.getLoadedModels,
			getFilesInCorpus: this.mlApi.getFilesInCorpus,
			getFilesInCorpusTrain: this.mlApi.getFilesInCorpusTrain,
			getProcessStatus: this.mlApi.getProcessStatus,
			getProcessStatusTrain: this.mlApi.getProcessStatusTrain,

			getCache: this.mlApi.getCache,
			reloadModels: this.mlApi.reloadModels,
			downloadCorpus: this.mlApi.downloadCorpus,
			trainModel: this.mlApi.trainModel,
			initializeLTR: this.mlApi.initializeLTR,
			createModelLTR: this.mlApi.createModelLTR,
			stopProcess: this.mlApi.stopProcess,
			sendUserAggregations: this.mlApi.sendUserAggregations,
			sendUserAggregationsTrain: this.mlApi.sendUserAggregationsTrain,
			clearCache: this.mlApi.clearCache,
		};

		// Get methods
		this.getAPIInformation = this.getData.bind(this, 'getAPIInformation');
		this.getAPIInformationTrain = this.getData.bind(this, 'getAPIInformationTrain');
		this.getS3List = this.getData.bind(this, 'getS3List');
		this.getS3DataList = this.getData.bind(this, 'getS3DataList');
		this.getModelsList = this.getData.bind(this, 'getModelsList');
		this.getModelsListTrain = this.getData.bind(this, 'getModelsListTrain');
		this.getDataList = this.getData.bind(this, 'getDataList');
		this.getLoadedModels = this.getData.bind(this, 'getLoadedModels');
		this.downloadDependencies = this.getData.bind(this, 'downloadDependencies');
		this.getProcessStatus = this.getData.bind(this, 'getProcessStatus');
		this.getProcessStatusTrain = this.getData.bind(this, 'getProcessStatusTrain');
		this.getFilesInCorpus = this.getData.bind(this, 'getFilesInCorpus');
		this.getFilesInCorpusTrain = this.getData.bind(this, 'getFilesInCorpusTrain');
		this.initializeLTR = this.getData.bind(this, 'initializeLTR');
		this.createModelLTR = this.getData.bind(this, 'createModelLTR');
		this.getCache = this.getData.bind(this, 'getCache');

		// Post methods
		this.setTransformerModel = this.postData.bind(this, 'setTransformerModel');
		this.reloadModels = this.postData.bind(this, 'reloadModels');
		this.downloadCorpus = this.postData.bind(this, 'downloadCorpus');
		this.trainModel = this.postData.bind(this, 'trainModel');
		this.downloadS3File = this.postData.bind(this, 'downloadS3File');
		this.downloadS3FileTrain = this.postData.bind(this, 'downloadS3FileTrain');
		this.deleteLocalModel = this.postData.bind(this, 'deleteLocalModel');
		this.deleteLocalModelTrain = this.postData.bind(this, 'deleteLocalModelTrain');
		this.stopProcess = this.postData.bind(this, 'stopProcess');
		this.sendUserAggregations = this.postData.bind(this, 'sendUserAggregations');
		this.sendUserAggregationsTrain = this.postData.bind(this, 'sendUserAggregationsTrain');
		this.clearCache = this.postData.bind(this, 'clearCache');
	}
	/**
	 * A generic get method to query the ML API.
	 * A key is bound to this method to dynamically call
	 * the differnet MLApiClient methods.
	 * @method getData
	 * @param {string} key - bound in constructor, maps to a MLApiClient method
	 * @param {*} req
	 * @param {*} res
	 */
	async getData(key, req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.registry[key](userId);
			res.send(resp);
		} catch (err) {
			this.logger.error(err.message, 'UB4F9M4', userId);
			res.status(500).send(err);
		}
	}
	/**
	 * A generic post method to update the ML API
	 * A key is bound to this method to dynamically call
	 * the differnet MLApiClient methods.
	 * @method postData
	 * @param {string} key - bound in constructor, maps to a MLApiClient method
	 * @param {*} req - all post data is in req.body
	 * @param {*} res
	 */
	async postData(key, req, res) {
		let userId = 'webapp_unknown';
		try {
			const data = req.body;
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.registry[key](userId, data);
			res.send(resp);
		} catch (err) {
			this.logger.error(err.message, 'UB4F9M4', userId);
			res.status(500).send(err);
		}
	}
}

module.exports.TransformerController = TransformerController;
