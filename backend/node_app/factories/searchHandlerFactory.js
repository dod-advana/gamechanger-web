const CLONE_META = require('../models').clone_meta;

class SearchHandlerFactory {

	constructor() {
		this.reloadCloneMeta();
	}

	reloadCloneMeta() {
		this.cloneMetaMap = {};
		this.searchHandlerMap = {};
		CLONE_META.findAll().then((meta) => {
			meta.forEach((m) => {
				this.cloneMetaMap[m.clone_name] = {
					searchModule: m.search_module
				};
				this.searchHandlerMap[m.search_module] = require(`../modules/${m.search_module}`);
			});
		});
	}

	createSearchHandler(cloneName) {
		if (this.cloneMetaMap[cloneName] &&
			this.cloneMetaMap[cloneName].searchModule &&
			this.searchHandlerMap[this.cloneMetaMap[cloneName].searchModule]) {
			return this.searchHandlerMap[this.cloneMetaMap[cloneName].searchModule];
		} else {
			throw 'Invalid clone or handler provided';
		}
	}
}

module.exports.SearchHandlerFactory = SearchHandlerFactory;