const CLONE_META = require('../models').clone_meta;

class HandlerFactory {
	constructor() {
		this.reloadCloneMeta();
	}

	reloadCloneMeta() {
		this.cloneMetaMap = {};
		this.searchHandlerMap = {};
		this.exportHandlerMap = {};
		this.graphHandlerMap = {};
		this.dataHandlerMap = {};
		CLONE_META.findAll().then((meta) => {
			if (meta.filter((clone) => clone.clone_name === 'gamechanger').length <= 0) {
				meta.push({
					clone_name: 'gamechanger',
					search_module: 'policy/policySearchHandler',
					export_module: 'policy/policyExportHandler',
					title_bar_module: 'policy/policyTitleBarHandler',
					navigation_module: 'policy/policyNavigationHandler',
					card_module: 'policy/policyCardHandler',
					graph_module: 'policy/policyGraphHandler',
					search_bar_module: 'policy/policySearchBarHandler',
					data_module: 'simple/simpleDataHandler',
				});
			}
			meta.forEach((m) => {
				this.cloneMetaMap[m.clone_name] = {
					searchModule: m.search_module,
					exportModule: m.export_module,
					graphModule: m.graph_module,
					dataModule: m.data_module,
				};
				try {
					this.searchHandlerMap[m.search_module] = require(`../modules/${m.search_module}`);
					this.exportHandlerMap[m.export_module] = require(`../modules/${m.export_module}`);
					this.graphHandlerMap[m.graph_module] = require(`../modules/${m.graph_module}`);
					this.dataHandlerMap[m.data_module] = require(`../modules/${m.data_module}`);
				} catch (err) {
					console.log(err);
				}
			});
		});
	}

	createHandler(handlerType, cloneName) {
		let handlerMap = null;
		let moduleName = null;
		switch (handlerType) {
			case 'search':
				handlerMap = this.searchHandlerMap;
				moduleName = 'searchModule';
				break;
			case 'export':
				handlerMap = this.exportHandlerMap;
				moduleName = 'exportModule';
				break;
			case 'graph':
				handlerMap = this.graphHandlerMap;
				moduleName = 'graphModule';
				break;
			case 'data':
				handlerMap = this.dataHandlerMap;
				moduleName = 'dataModule';
				break;
		}
		if (
			handlerMap &&
			moduleName &&
			this.cloneMetaMap[cloneName] &&
			this.cloneMetaMap[cloneName][moduleName] &&
			handlerMap[this.cloneMetaMap[cloneName][moduleName]]
		) {
			return new handlerMap[this.cloneMetaMap[cloneName][moduleName]]();
		} else {
			throw 'Invalid clone or handler provided';
		}
	}
}

module.exports.HandlerFactory = HandlerFactory;
