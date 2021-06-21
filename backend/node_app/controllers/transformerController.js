const { MLApiClient } = require('../lib/mlApiClient');
const LOGGER = require('../lib/logger');
/**
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
		this.Registry = {
			'getAPIInformation': this.mlApi.getAPIInformation,
			'getS3List': this.mlApi.getS3List,
			'getModelsList': this.mlApi.getModelsList,
			'getCurrentTransformer': this.mlApi.getCurrentTransformer,
			'setTransformerModel': this.mlApi.setTransformerModel,
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
		// Post methods
		this.setTransformerModel = this.postData.bind(this, 'setTransformerModel');
		this.reloadModels = this.postData.bind(this, 'reloadModels');
		this.downloadCorpus = this.postData.bind(this, 'downloadCorpus');
		this.trainModel = this.postData.bind(this, 'trainModel');
	}
	/**
	 * @method getData
	 * @param {string} key 
	 * @param {*} req 
	 * @param {*} res 
	 */
	async getData(key, req, res){
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.Registry[key](userId);
			res.send(resp);
		} catch (err) {
			this.logger.error(err.message, 'UB4F9M4', userId);
			res.status(500).send(err);
		}
	}
	/**
	 * @method postData
	 * @param {string} key 
	 * @param {*} req 
	 * @param {*} res 
	 */
	async postData(key, req, res){
		let userId = 'webapp_unknown';
		try {
			const data = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.Registry[key](userId, data);
			res.send(resp);
		} catch (err) {
			this.logger.error(err.message, 'UB4F9M4', userId);
			res.status(500).send(err);
		}
	}
}

module.exports.TransformerController = TransformerController;
