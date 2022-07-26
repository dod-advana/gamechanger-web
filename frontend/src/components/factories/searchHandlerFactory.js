const simpleSearchHandler = require(`../modules/simple/simpleSearchHandler`);
const policySearchHandler = require(`../modules/policy/policySearchHandler`);
const globalSearchHandler = require(`../modules/globalSearch/globalSearchHandler`);
const edaSearchHandler = require(`../modules/eda/edaSearchHandler`);
const hermesSearchHandler = require(`../modules/hermes/hermesSearchHandler`);
const amhsSearchHandler = require(`../modules/amhs/amhsSearchHandler`);
const cdoSearchHandler = require(`../modules/cdo/cdoSearchHandler`);
const jbookSearchHandler = require(`../modules/jbook/jbookSearchHandler`);
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
				case 'amhs/amhsSearchHandler':
					this.handler = amhsSearchHandler;
					break;
				case 'cdo/cdoSearchHandler':
					this.handler = cdoSearchHandler;
					break;
				case 'jbook/jbookSearchHandler':
					this.handler = jbookSearchHandler;
					break;
				default:
					this.handler = simpleSearchHandler;
					break;
			}
		} catch (err) {
			this.handler = simpleSearchHandler;
		}
	}

	createHandler() {
		return this.handler.default;
	}
}

export default SearchHandlerFactory;
