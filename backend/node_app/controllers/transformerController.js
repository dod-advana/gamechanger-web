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

		this.getAPIInformation = this.getAPIInformation.bind(this);
		this.getS3List = this.getS3List.bind(this);
		this.getModelsList = this.getModelsList.bind(this);
		this.getCurrentTransformer = this.getCurrentTransformer.bind(this);
		this.setTransformerModel = this.setTransformerModel.bind(this);
	}

	async reloadModels(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.mlApi.reloadModels(userId);
			res.send(resp);
		} catch (err) {
			this.logger.error(err.message, 'UB4F9M4', userId);
			res.status(500).send(err);
		}
	}

	async downloadDependencies(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.mlApi.downloadDependencies(userId);
			res.send(resp);
		} catch (err) {
			this.logger.error(err.message, 'UB4F9M4', userId);
			res.status(500).send(err);
		}
	}

	async getAPIInformation(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.mlApi.getAPIInformation(userId);
			res.send(resp);
		} catch (err) {
			this.logger.error(err.message, 'UB4F9M4', userId);
			res.status(500).send(err);
		}
	}

	async getS3List(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.mlApi.getS3List(userId);
			res.send(resp);
		} catch (err) {
			this.logger.error(err.message, 'UB4F9M4', userId);
			res.status(500).send(err);
		}
	}
	
	async getModelsList(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.mlApi.getModelsList(userId);
			res.send(resp);
		} catch (err) {
			this.logger.error(err.message, 'UB4F9M4', userId);
			res.status(500).send(err);
		}
	}

	async getCurrentTransformer(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.mlApi.getCurrentTransformer(userId);
			res.send(resp);
		} catch (err) {
			this.logger.error(err.message, 'CC6PRTN', userId);
			res.status(500).send(err);
		}
	}

	async setTransformerModel(req, res) {
		let userId = 'webapp_unknown';
		try {
			const { model_name } = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.mlApi.setTransformerModel(model_name, userId);
			res.send(resp);
		} catch (err) {
			this.logger.error(err.message, 'WZHXH0L', userId);
			res.status(500).send(err);
		}
	}
}

module.exports.TransformerController = TransformerController;
