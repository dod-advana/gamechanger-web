const defaultNavigationHandler = require(`../modules/default/defaultNavigationHandler`);
const policyNavigationHandler = require(`../modules/policy/policyNavigationHandler`);
const edaNavigationHandler = require(`../modules/eda/edaNavigationHandler`);
const policyTestNavigationHandler = require(`../modules/policy/policyTestNavigationHandler`);
class NavigationFactory {

	constructor(module) {
		try {
			switch (module) {
				case 'policy/policyNavigationHandler':
					this.handler = policyNavigationHandler;
					break;
				case 'policy/policyTestNavigationHandler': 
					this.handler = policyTestNavigationHandler;
					break;
				case 'eda/edaNavigationHandler':
					this.handler = edaNavigationHandler;
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
