const defaultMainViewHandler = require(`../modules/default/defaultMainViewHandler`);
const edaMainViewHandler = require(`../modules/eda/edaMainViewHandler`);
const policyMainViewHandler = require(`../modules/policy/policyMainViewHandler`);

class MainViewFactory {

	constructor(module) {
		try {
			switch (module) {
				case 'policy/policyMainViewHandler':
					this.handler = policyMainViewHandler;
					break;
				case 'eda/edaMainViewHandler':
					this.handler = edaMainViewHandler;
					break;
				default:
					this.handler = defaultMainViewHandler;
					break;
			}
		} catch (err) {
			this.handler = defaultMainViewHandler;
		}
	}

	createHandler() {
		return this.handler.default;
	}
}

export default MainViewFactory;
