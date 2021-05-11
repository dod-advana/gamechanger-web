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

		this.getTransformerList = this.getTransformerList.bind(this);
		this.getCurrentTransformer = this.getCurrentTransformer.bind(this);
		this.setTransformerModel = this.setTransformerModel.bind(this);
	}

	async getTransformerList(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.mlApi.getTransfomerModelList(userId);
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
