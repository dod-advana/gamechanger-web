const defaultMainViewHandler = require(`../modules/default/defaultMainViewHandler`);
const edaMainViewHandler = require(`../modules/eda/edaMainViewHandler`);
const policyMainViewHandler = require(`../modules/policy/policyMainViewHandler`);
const globalSearchMainViewHandler = require(`../modules/globalSearch/globalSearchMainViewHandler`);
const budgetSearchMainViewHandler = require(`../modules/budgetSearch/budgetSearchMainViewHandler`);

const policyTestMainViewHandler = require(`../modules/policy/policyTestMainViewHandler`)

class MainViewFactory {

	constructor(module) {
		try {
			switch (module) {
				case 'policy/policyMainViewHandler':
					this.handler = policyMainViewHandler;
					break;
				// TODO Remove this once the homepage is used for main GC page. 
				case 'policy/policyTestMainViewHandler':
					this.handler = policyTestMainViewHandler;
					break;
				case 'eda/edaMainViewHandler':
					this.handler = edaMainViewHandler;
					break;
				case 'globalSearch/globalSearchMainViewHandler':
					this.handler = globalSearchMainViewHandler;
					break;
				case 'budgetSearch/budgetSearchMainViewHandler':
					this.handler = budgetSearchMainViewHandler;
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
