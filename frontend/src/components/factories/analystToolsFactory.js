const DefaultAnalyticsToolsHandler = require(`../modules/default/defaultAnalyticsToolsHandler`);
const PolicyAnalyticsToolsHandler = require(`../modules/policy/policyAnalyticsToolsHandler`);

class AnalystToolsFactory {

	constructor(module) {
		try {
			switch (module) {
				case 'policy/policyMainViewHandler':
				case 'policy/policyTestMainViewHandler':
					this.handler = PolicyAnalyticsToolsHandler;
					break;
				case 'globalSearch/globalSearchMainViewHandler':
					this.handler = DefaultAnalyticsToolsHandler;
					break;
				case 'eda/edaMainViewHandler':
					this.handler = DefaultAnalyticsToolsHandler;
					break;
				default:
					this.handler = DefaultAnalyticsToolsHandler;
					break;
			}
		} catch (err) {
			this.handler = DefaultAnalyticsToolsHandler;
		}
	}

	createHandler() {
		return this.handler.default;
	}
}

export default AnalystToolsFactory;
