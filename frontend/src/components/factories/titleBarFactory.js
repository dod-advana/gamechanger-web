const defaultTitleBarHandler = require(`../modules/default/defaultTitleBarHandler`);
const adminTitleBarHandler = require(`../modules/admin/adminTitleBarHandler`);
const detailsTitleBarHandler = require(`../modules/details/detailsTitleBarHandler`);
const edaTitleBarHandler = require(`../modules/eda/edaTitleBarHandler`);
const policyTitleBarHandler = require(`../modules/policy/policyTitleBarHandler`);
const globalSearchTitleBarHandler = require(`../modules/globalSearch/globalSearchTitleBarHandler`);
const budgetSearchTitleBarHandler = require(`../modules/budgetSearch/budgetSearchTitleBarHandler`);

class TitleBarFactory {
	constructor(module) {
		try {
			switch (module) {
				case 'policy/policyTitleBarHandler':
					this.handler = policyTitleBarHandler;
					break;
				case 'eda/edaTitleBarHandler':
					this.handler = edaTitleBarHandler;
					break;
				case 'details/detailsTitleBarHandler':
					this.handler = detailsTitleBarHandler;
					break;
				case 'globalSearch/globalSearchTitleBarHandler':
					this.handler = globalSearchTitleBarHandler;
					break;
				case 'admin/adminTitleBarHandler':
					this.handler = adminTitleBarHandler;
					break;
				case 'budgetSearch/budgetSearchTitleBarHandler':
					this.handler = budgetSearchTitleBarHandler;
					break;
				default:
					this.handler = defaultTitleBarHandler;
					break;
			}
		} catch (err) {
			this.handler = defaultTitleBarHandler;
		}
	}

	createHandler() {
		return this.handler.default;
	}
}

export default TitleBarFactory;
