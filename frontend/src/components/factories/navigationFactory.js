const defaultNavigationHandler = require(`../modules/default/defaultNavigationHandler`);
const policyNavigationHandler = require(`../modules/policy/policyNavigationHandler`);
const edaNavigationHandler = require(`../modules/eda/edaNavigationHandler`);
const globalSearchNavigationHandler = require(`../modules/globalSearch/globalSearchNavigationHandler`);
const jbookNavigationHandler = require(`../modules/jbook/jbookNavigationHandler`);

class NavigationFactory {
	constructor(module) {
		try {
			switch (module) {
				case 'policy/policyNavigationHandler':
					this.handler = policyNavigationHandler;
					break;
				case 'globalSearch/globalSearchNavigationHandler':
					this.handler = globalSearchNavigationHandler;
					break;
				case 'eda/edaNavigationHandler':
					this.handler = edaNavigationHandler;
					break;
				case 'jbook/jbookNavigationHandler':
					this.handler = jbookNavigationHandler;
					break;
				default:
					this.handler = defaultNavigationHandler;
					break;
			}
		} catch (err) {
			this.handler = defaultNavigationHandler;
		}
	}

	createHandler() {
		return this.handler.default;
	}
}

export default NavigationFactory;
