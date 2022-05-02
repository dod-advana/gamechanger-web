const defaultMainViewUtilityHandler = require(`../modules/default/defaultMainViewUtilityHandler`);
const edaMainViewUtilityHandler = require(`../modules/eda/edaMainViewUtilityHandler`);
const policyMainViewUtilityHandler = require(`../modules/policy/policyMainViewUtilityHandler`);
const globalSearchMainViewUtilityHandler = require(`../modules/globalSearch/globalSearchMainViewUtilityHandler`);
const jbookMainViewUtilityHandler = require(`../modules/jbook/jbookMainViewUtilityHandler`);

class MainViewUtilityFactory {
	constructor(module) {
		try {
			switch (module) {
				case 'policy/policyMainViewHandler':
					this.handler = policyMainViewUtilityHandler;
					break;
				case 'eda/edaMainViewHandler':
					this.handler = edaMainViewUtilityHandler;
					break;
				case 'globalSearch/globalSearchMainViewHandler':
					this.handler = globalSearchMainViewUtilityHandler;
					break;
				case 'jbook/jbookMainViewHandler':
					this.handler = jbookMainViewUtilityHandler;
					break;
				default:
					this.handler = defaultMainViewUtilityHandler;
					break;
			}
		} catch (err) {
			this.handler = defaultMainViewUtilityHandler;
		}
	}

	createHandler() {
		return this.handler.default;
	}
}

export default MainViewUtilityFactory;
