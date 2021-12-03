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
		const {
			logger = LOGGER,
			mlApi = new MLApiClient(opts),
		} = opts;

		this.logger = logger;
		this.mlApi = mlApi;

		// A mapping to the methods in MLApiClient 
		this.registry = {
			'getAPIInformation': this.mlApi.getAPIInformation,
			'getS3List': this.mlApi.getS3List,
			'getModelsList': this.mlApi.getModelsList,
			'getCurrentTransformer': this.mlApi.getCurrentTransformer,
			'getFilesInCorpus': this.mlApi.getFilesInCorpus,
			'getProcessStatus': this.mlApi.getProcessStatus,
			'reloadModels': this.mlApi.reloadModels,
			'downloadCorpus': this.mlApi.downloadCorpus,
			'trainModel': this.mlApi.trainModel
		}

		// Get methods
		this.getAPIInformation = this.getData.bind(this, 'getAPIInformation');
		this.getS3List = this.getData.bind(this, 'getS3List');
		this.getModelsList = this.getData.bind(this, 'getModelsList');
		this.getCurrentTransformer = this.getData.bind(this, 'getCurrentTransformer');
		this.downloadDependencies = this.getData.bind(this, 'downloadDependencies');
		this.getProcessStatus = this.getData.bind(this, 'getProcessStatus');
		this.getFilesInCorpus = this.getData.bind(this, 'getFilesInCorpus');
		// Post methods
		this.setTransformerModel = this.postData.bind(this, 'setTransformerModel');
		this.reloadModels = this.postData.bind(this, 'reloadModels');
		this.downloadCorpus = this.postData.bind(this, 'downloadCorpus');
		this.trainModel = this.postData.bind(this, 'trainModel');
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
	async getData(key, req, res){
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
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
	async postData(key, req, res){
		let userId = 'webapp_unknown';
		try {
			const data = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.registry[key](userId, data);
			res.send(resp);
		} catch (err) {
			this.logger.error(err.message, 'UB4F9M4', userId);
			res.status(500).send(err);
		}
	}
}

module.exports.TransformerController = TransformerController;
