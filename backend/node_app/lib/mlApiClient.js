const constants = require('../config/constants');
const loggerLib = require('../lib/logger');
const axiosLib = require('axios');

const mlBaseUrl = constants.GAMECHANGER_ML_API_BASE_URL;
const transformerBaseUrl = constants.GAMECHANGER_ML_API_BASE_URL;
class MLApiClient {
	constructor(opts = {}) {
		const {
			logger = loggerLib,
			axios = axiosLib,
		} = opts;

		this.logger = logger;
		this.axios = axios;

		this.getExpandedSearchTerms = this.getExpandedSearchTerms.bind(this);
		this.transformResults = this.transformResults.bind(this);
		this.getModelsList = this.getModelsList.bind(this);
		this.getCurrentTransformer = this.getCurrentTransformer.bind(this);
		this.setTransformerModel = this.setTransformerModel.bind(this);
		this.getSentenceTransformerResults = this.getSentenceTransformerResults.bind(this);
	}

	async getExpandedSearchTerms(termsList, userId = 'unknown') {
		const headers = {
			ssl_client_s_dn_cn: userId
		};

		try {
			const url = `${mlBaseUrl}/expandTerms`;
			const { data } = await this.axios({
				url,
				method: 'post',
				headers,
				data: { termsList, docIdsOnly: true }
			});

			return data;
		} catch (e) {
			this.logger.error(e, 'cPq9c3xw', userId);
			throw e;
		}
	}

	async getIntelAnswer(searchQuery, searchContext, userId = 'unknown') {
		const headers = {
			ssl_client_s_dn_cn: userId
		};

		try {
			const url = `${mlBaseUrl}/questionAnswer`;
			const { data } = await this.axios({
				url,
				method: 'post',
				headers,
				data: { query: searchQuery, search_context: searchContext }
			});

			return data;
		} catch (e) {
			this.logger.error(e, 'HBJJU7I', userId);
			throw e;
		}
	}

	async getSentenceTransformerResults(searchText, userId = 'unknown') {
		const headers = {
			ssl_client_s_dn_cn: userId
		};

		try {
			const url = `${transformerBaseUrl}/transSentenceSearch`;
			const { data } = await this.axios({
				url,
				method: 'post',
				headers,
				data: { text: searchText }
			});

			return data;
		} catch (e) {
			this.logger.error(e, 'ENGJUAU', userId);
			throw e;
		}
	}

	async transformResults(searchText, docs, userId = 'unknown') {
		const headers = {
			ssl_client_s_dn_cn: userId
		};

		try {
			const url = `${transformerBaseUrl}/transformerSearch`;
			const { data } = await this.axios({
				url,
				method: 'post',
				headers,
				data: { query: searchText, documents: docs}
			});
			return data;
		} catch (e) {
			this.logger.error(e, 'ENGJUAU', userId);
			throw e;
		}
	}
	async reloadModels(userId, models) {
		const headers = {
			ssl_client_s_dn_cn: userId
		};
		try {
			const url = `${transformerBaseUrl}/reloadModels`;
			const { data } = await this.axios({
				url,
				method: 'post',
				headers,
				data: models
			});
			return data;
		} catch (e) {
			this.logger.error(e, 'VY3FQBN', userId);
			throw e;
		}
	}

	async getAPIInformation(userId) {
		const headers = {
			ssl_client_s_dn_cn: userId
		};

		try {
			const url = `${mlBaseUrl}/`;
			const { data } = await this.axios({
				url,
				method: 'get',
				headers
			});

			return data;
		} catch (e) {
			this.logger.error(e, 'cPq9c3xw', userId);
			throw e;
		}
	}

	async getS3List(userId) {
		const headers = {
			ssl_client_s_dn_cn: userId
		};

		try {
			const url = `${mlBaseUrl}/s3?function=models`;
			const { data } = await this.axios({
				url,
				method: 'get',
				headers
			});

			return data;
		} catch (e) {
			this.logger.error(e, 'cPq9c3xw', userId);
			throw e;
		}
	}

	async getModelsList(userId) {
		const headers = {
			ssl_client_s_dn_cn: userId
		};

		try {
			const url = `${transformerBaseUrl}/getModelsList`;
			const { data } = await this.axios({
				url,
				method: 'get',
				headers
			});
			return data;
		} catch (e) {
			this.logger.error(e, 'EQZVNKP', userId);
			throw e;
		}

	}

	async getCurrentTransformer(userId) {
		const headers = {
			ssl_client_s_dn_cn: userId
		};
		try {
			const url = `${transformerBaseUrl}/getCurrentTransformer`;
			const { data } = await this.axios({
				url,
				method: 'get',
				headers
			});
			return data;
		} catch (e) {
			this.logger.error(e, 'VY3FQBN', userId);
			throw e;
		}
	}

	
	async downloadDependencies(userId) {
		const headers = {
			ssl_client_s_dn_cn: userId
		};
		try {
			const url = `${transformerBaseUrl}/getCurrentTransformer`;
			const { data } = await this.axios({
				url,
				method: 'get',
				headers
			});
			return data;
		} catch (e) {
			this.logger.error(e, 'VY3FQBN', userId);
			throw e;
		}
	}
	
	async setTransformerModel(model_name, userId) {
		const headers = {
			ssl_client_s_dn_cn: userId
		};
		try {
			const url = `${transformerBaseUrl}/updateModel`;
			const { data } = await this.axios({
				url,
				method: 'post',
				headers,
				data: { model_name }
			});
			return data;
		} catch (e) {
			this.logger.error(e, 'QWU3KOP', userId);
			throw e;
		}
	}
}

module.exports.MLApiClient = MLApiClient;
