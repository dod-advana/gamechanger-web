const defaultSearchBarHandler = require(`../modules/default/defaultSearchBarHandler`);
const edaSearchBarHandler = require(`../modules/eda/edaSearchBarHandler`);
const policySearchBarHandler = require(`../modules/policy/policySearchBarHandler`);
const globalSearchSearchBarHandler = require(`../modules/globalSearch/globalSearchSearchBarHandler`);
const jbookSearchBarHandler = require(`../modules/jbook/jbookSearchBarHandler`);

class SearchBarFactory {
	constructor(module) {
		try {
			switch (module) {
				case 'policy/policySearchBarHandler':
					this.handler = policySearchBarHandler;
					break;
				case 'eda/edaSearchBarHandler':
					this.handler = edaSearchBarHandler;
					break;
				case 'globalSearch/globalSearchSearchBarHandler':
					this.handler = globalSearchSearchBarHandler;
					break;
				case 'jbook/jbookSearchBarHandler':
					this.handler = jbookSearchBarHandler;
					break;
				default:
					this.handler = defaultSearchBarHandler;
					break;
			}
		} catch (err) {
			this.handler = defaultSearchBarHandler;
		}
	}

	createHandler() {
		return this.handler.default;
	}
}

export default SearchBarFactory;
