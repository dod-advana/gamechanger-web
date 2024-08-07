const { Client: esClient } = require('@elastic/elasticsearch');
const LOGGER = require('@dod-advana/advana-logger');

class ESSearchLib {
	constructor(optionsObj = {}) {
		const { logger = LOGGER, esClientConstructor = esClient } = optionsObj;
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
				body: queryBody,
			};
			return this._clients[clientName].search(query);
		} catch (e) {
			this.logger.error(e.message, 'SCSE2C1', user);
			return {};
		}
	}

	async multiqueryElasticsearch(clientName, _index, queryBodiesArray, user) {
		try {
			const multiquery = {
				body: [],
			};

			queryBodiesArray.forEach((query) => {
				multiquery.body.push(query);
			});

			return this._clients[clientName].msearch(multiquery);
		} catch (e) {
			this.logger.error(e.message, 'NL2FDHL', user);
			return {};
		}
	}

	async addDocument(clientName, index, document, user) {
		try {
			this._clients[clientName].index({ index: index, body: document });
		} catch (e) {
			this.logger.error(e.message, 'NL2FDZA', user);
		}
	}

	async updateDocument(clientName, index, updatedDocument, documentId, user) {
		try {
			await this._clients[clientName].update({
				index,
				id: documentId,
				body: { doc: updatedDocument, detect_noop: false },
				refresh: 'wait_for',
			});
			return true;
		} catch (e) {
			this.logger.error(e.message, 'N67SIIJ', user);
			return false;
		}
	}

	async createIndex(clientName, index, mappings, _aliases, user) {
		try {
			const { body: indexExists } = await this._clients[clientName].indices.exists({ index });
			if (indexExists) {
				this.logger.info('Index already exists', '6Q71ARK', user);
				return true;
			}

			const { body } = await this._clients[clientName].indices.create({ index, body: mappings });
			if (body['acknowledged'] === true) {
				this.logger.info('Index created and mapping applied', '6Q71ARK', user);
				return true;
			} else {
				this.logger.info('Error creating index', '6Q71ARK', user);
				return false;
			}
		} catch (e) {
			this.logger.error(e.message, '6Q71ARK', user);
			return false;
		}
	}

	async deleteIndex(clientName, index, user) {
		try {
			await this._clients[clientName].indices.delete({ index });

			return true;
		} catch (e) {
			this.logger.error(e.message, '6Q71ARKD', user);
			return false;
		}
	}

	async bulkInsert(clientName, index, documents, user) {
		try {
			const operations = documents.flatMap((doc) => [{ index: { _index: index, _id: doc['id'] } }, doc]);
			const bulkResponse = await this._clients[clientName].bulk({ refresh: true, body: operations });

			if (bulkResponse['body']['errors']) {
				const erroredDocuments = [];
				// The items array has the same order of the dataset we just indexed.
				// The presence of the `error` key indicates that the operation
				// that we did for the document has failed.
				bulkResponse['body']['items'].forEach((action, _i) => {
					const operation = Object.keys(action)[0];
					if (action[operation].error) {
						erroredDocuments.push({
							// If the status is 429 it means that you can retry the document,
							// otherwise it's very likely a mapping error, and you should
							// fix the document before to try it again.
							status: action[operation].status,
							error: action[operation].error,
						});
					}
				});
				console.log(erroredDocuments);
			}
		} catch (e) {
			this.logger.error(e.message, '1458DB1', user);
		}
	}
}

module.exports.ESSearchLib = ESSearchLib;
