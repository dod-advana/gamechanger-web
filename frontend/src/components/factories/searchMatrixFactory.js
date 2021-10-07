const defaultSearchMatrixHandler = require(`../modules/default/defaultSearchMatrixHandler`);
const policySearchMatrixHandler = require(`../modules/policy/policySearchMatrixHandler`);
const globalSearchMatrixHandler = require(`../modules/globalSearch/globalSearchMatrixHandler`);
const edaSearchMatrixHandler = require(`../modules/eda/edaSearchMatrixHandler`);
class SearchMatrixFactory {
	constructor(module) {
		try {
			switch (module) {
				case 'policy/policyMainViewHandler':
				case 'policy/policyTestMainViewHandler':
					this.handler = policySearchMatrixHandler;
					break;
				case 'globalSearch/globalSearchMainViewHandler':
					this.handler = globalSearchMatrixHandler;
					break;
				case 'eda/edaMainViewHandler':
					this.handler = edaSearchMatrixHandler;
					break;
				default:
					this.handler = defaultSearchMatrixHandler;
					break;
			}
		} catch (err) {
			this.handler = defaultSearchMatrixHandler;
		}
	}

	createHandler() {
		return this.handler.default;
	}
}

export default SearchMatrixFactory;
