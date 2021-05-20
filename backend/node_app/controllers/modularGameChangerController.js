const {HandlerFactory} = require('../factories/handlerFactory');
const handlerFactory = new HandlerFactory();
const CLONE_META = require('../models').clone_meta;
const LOGGER = require('../lib/logger');

class ModularGameChangerController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			clone_meta = CLONE_META,
			handler_factory = handlerFactory,
		} = opts;

		this.logger = logger;
		this.clone_meta = clone_meta;
		this.handler_factory = handler_factory;

		this.getCloneMeta = this.getCloneMeta.bind(this);
		this.getCloneTableStructure = this.getCloneTableStructure.bind(this);
		this.storeCloneMeta = this.storeCloneMeta.bind(this);
		this.getAllCloneMeta = this.getAllCloneMeta.bind(this);
		this.deleteCloneMeta = this.deleteCloneMeta.bind(this);
		this.reloadHandlerMap = this.reloadHandlerMap.bind(this);
		this.search = this.search.bind(this);
		this.callSearchFunction = this.callSearchFunction.bind(this);
		this.export = this.export.bind(this);
		this.graphSearch = this.graphSearch.bind(this);
		this.graphQuery = this.graphQuery.bind(this);
		this.callGraphFunction = this.callGraphFunction.bind(this);
	}

	async getCloneTableStructure(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		try {
			const resp = await this.clone_meta.sequelize.query(`
				SELECT table_name, column_name, data_type
				FROM information_schema.columns
				WHERE table_name = 'clone_meta';
		   `);
			res.status(200).send(resp);
		} catch (err) {
			this.logger.error(err, 'I5BVGT7', userId);
			res.status(500).send();
		}
	}

	async getCloneMeta(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		const {cloneName} = req.body;
		this.clone_meta.findOne({ where: { clone_name: cloneName } }).then((c) => {
			res.status(200).send(c);
		}).catch((e) => {
			this.logger.error(e, 'C5UONCZ', userId);
			res.status(500).send();
		});
	}

	async getAllCloneMeta(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		this.clone_meta.findAll({ raw: true }).then((c) => {
			if (c.filter(clone => clone.clone_name === 'gamechanger').length <= 0) {
				c.push({
					clone_name: 'gamechanger',
					search_module: 'policy/policySearchHandler',
					export_module: 'simple/simpleExportHandler',
					title_bar_module: 'policy/policyTitleBarHandler',
					navigation_module: 'policy/policyNavigationHandler',
					card_module: 'policy/policyCardHandler',
					main_view_module: 'policy/policyMainViewHandler',
					graph_module: 'policy/policyGraphHandler',
					display_name: 'GAMECHANGER',
					is_live: true,
					url: '/',
					permissions_required: false,
					clone_to_advana: true,
					clone_to_gamchanger: true,
					clone_to_jupiter: true,
					clone_to_sipr: false,
					show_tutorial: true,
					show_graph: true,
					show_crowd_source: true,
					show_feedback: true,
					config: {esIndex: 'gamechanger'}
				});
			}
			c.forEach(clone => {
				clone.can_edit = clone.clone_name !== 'gamechanger';
			});
			res.status(200).send(c);
		}).catch((e) => {
			this.logger.error(e, 'CC0F2OK', userId);
			res.status(500).send();
		});
	}

	async storeCloneMeta(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		try {
			const { cloneData } = req.body;

			const [clone, created] = await this.clone_meta.findOrCreate(
				{
					where: { clone_name: cloneData.clone_name },
					defaults: { ...cloneData }
				}
			);

			if (!created) {
				Object.keys(cloneData).forEach(key => {
					clone[key] = cloneData[key];
				});
				await clone.save();
			}

			this.handler_factory.reloadCloneMeta();

			res.status(200).send({ created: created, updated: !created });

		} catch (err) {
			this.logger.error(err, '1WHVIJU', userId);
			res.status(500).send(err);
		}
	}

	async deleteCloneMeta(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		try {
			const { id } = req.body;

			const clone = await this.clone_meta.findOne({ where: { id: id } });
			await clone.destroy();

			res.status(200).send({ deleted: true });

		} catch (err) {
			this.logger.error(err, 'A5LTNHP', userId);
			res.status(500).send(err);
		}
	}

	async reloadHandlerMap(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		try {
			this.handler_factory.reloadCloneMeta();
			res.status(200).send({ updated: true });
		} catch (err) {
			this.logger.error(err, '82WNVV8', userId);
			res.status(500).send(err);
		}
	}

	async search(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		const {cloneName, searchText, offset = 0, limit = 18, options} = req.body;
		try {
			const handler = this.handler_factory.createHandler('search', cloneName);
			const results = await handler.search(searchText, offset, limit, options, cloneName, req.permissions, userId);
			res.status(200).send(results);
		} catch (error) {
			res.status(500).send(error);
			this.logger.error(error, 'W30WCN7', userId);
		}
	}

	async callSearchFunction(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		const {cloneName, functionName, options} = req.body;
		try {
			const handler = this.handler_factory.createHandler('search', cloneName);
			const results = await handler.callFunction(functionName, options, cloneName, req.permissions, userId);
			res.status(200).send(results);
		} catch (error) {
			res.status(500).send(error);
			this.logger.error(error, 'HZZ7OQK', userId);
		}
	}

	async export(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		const {cloneName, searchText, format, options} = req.body;
		try {
			const handler = this.handler_factory.createHandler('export', cloneName);
			await handler.export(res, searchText, format, options, cloneName, req.permissions, userId);
		} catch(error) {
			res.status(500).send(error);
			this.logger.error(error, '812U6Q2', userId);
		}
	}

	async graphSearch(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		const {cloneName, searchText, options} = req.body;
		try {
			const handler = this.handler_factory.createHandler('graph', cloneName);
			const results = await handler.search(searchText, options, cloneName, req.permissions, userId);
			res.status(200).send(results);
		} catch (error) {
			res.status(500).send(error);
			this.logger.error(error, 'B5DJS5C', userId);
		}
	}

	async graphQuery(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		const {cloneName, query, code, options} = req.body;
		try {
			const handler = this.handler_factory.createHandler('graph', cloneName);
			const results = await handler.query(query, code, options, cloneName, req.permissions, userId);
			res.status(200).send(results);
		} catch (error) {
			res.status(500).send(error);
			this.logger.error(error, 'D5GLQ6W', userId);
		}
	}

	async callGraphFunction(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		const {cloneName, functionName, options} = req.body;
		try {
			const handler = this.handler_factory.createHandler('graph', cloneName);
			const results = await handler.callFunction(functionName, options, cloneName, req.permissions, userId);
			res.status(200).send(results);
		} catch (error) {
			res.status(500).send(error);
			this.logger.error(error, 'LSZ82AY', userId);
		}
	}

	async querySuggester(req, res) {
		// TODO add Query Suggester Handlers
		res.status(200).send('TODO');
	}

	async docFetcher(req, res) {
		// TODO add Doc Fetcher Handlers
		res.status(200).send('TODO');
	}
}

module.exports.ModularGameChangerController = ModularGameChangerController;
