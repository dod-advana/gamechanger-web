const defaultSearchHandler = require(`../modules/default/defaultSearchHandler`);
const policySearchHandler = require(`../modules/policy/policySearchHandler`);
const globalSearchHandler = require(`../modules/globalSearch/globalSearchHandler`);
const edaSearchHandler = require(`../modules/eda/edaSearchHandler`);
const hermesSearchHandler = require(`../modules/hermes/hermesSearchHandler`);

class SearchHandlerFactory {

	constructor(module) {
		try {
			switch (module) {
				case 'policy/policySearchHandler':
					this.handler = policySearchHandler;
					break;
				case 'globalSearch/globalSearchHandler':
					this.handler = globalSearchHandler;
					break;
				case 'eda/edaSearchHandler':
					this.handler = edaSearchHandler;
					break;
				case 'hermes/hermesSearchHandler':
					this.handler = hermesSearchHandler;
					break;
				default:
					this.handler = defaultSearchHandler;
					break;
			}
		} catch (err) {
			this.handler = defaultSearchHandler;
		}
	}

	createHandler() {
		return this.handler.default;
	}
}

export default SearchHandlerFactory;
