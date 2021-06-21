const { MLApiClient } = require('../lib/mlApiClient');
const LOGGER = require('../lib/logger');

class TransformerController {

	constructor(opts = {}) {
		const {
			logger = LOGGER,
			mlApi = new MLApiClient(opts),
		} = opts;

		this.logger = logger;
		this.mlApi = mlApi;

		this.Registry = {
			'getAPIInformation': this.mlApi.getAPIInformation,
			'getS3List': this.mlApi.getS3List,
			'getModelsList': this.mlApi.getModelsList,
			'getCurrentTransformer': this.mlApi.getCurrentTransformer,
			'setTransformerModel': this.mlApi.setTransformerModel,
			'reloadModels': this.mlApi.reloadModels
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
	}

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
