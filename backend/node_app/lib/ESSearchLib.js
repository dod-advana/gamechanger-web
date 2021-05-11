const { Client: esClient } = require('@elastic/elasticsearch');
const LOGGER = require('../lib/logger');

class ESSearchLib {
	constructor(optionsObj = {}) {
		const {
			logger = LOGGER,
			esClientConstructor = esClient,
		} = optionsObj;
		// assign this context to inputs
		// the defaults are set on destructuring for normal use and overrides allowed for testing
		this.logger = logger;
		this.ESClientConstructor = esClientConstructor;
		this._clients = {};

	}

	addClient(name, config, user) {
		try {
			this._clients[name] = new this.ESClientConstructor(config);
		} catch (e) {
			this.logger.error(e.message, 'X7S6C3O', user);
			throw e;
		}
	}

	listClients() {
		return Object.keys(this._clients);
	}

	async queryElasticsearch(clientName, index, queryBody, user) {
		try {
			const query = {
				index,
				body: queryBody
			};

			return this._clients[clientName].search(query);
		} catch (e) {
			this.logger.error(e.message, 'SCSE2C1', user);
			return {};
		}

	}

	async multiqueryElasticsearch(clientName, index, queryBodiesArray, user) {
		try {

			const multiquery = {
				body: []
			};

			queryBodiesArray.forEach(query => {
				multiquery.body.push(query)
			})

			return this._clients[clientName].msearch(multiquery);
		} catch (e) {
			this.logger.error(e.message, 'NL2FDHL', user);
			return {};
		}

	}
	async addDocument(clientName, index, document){
		try {
			this._clients[clientName].index({index: index, body: document})
		} catch (e){
			this.logger.error(e.message, 'NL2FDZA', user)
		}
	}
}

module.exports.ESSearchLib = ESSearchLib;
