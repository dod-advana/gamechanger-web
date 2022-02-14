const defaultAdminMainViewHandler = require(`../modules/default/defaultAdminMainViewHandler`);
const policyAdminMainViewHandler = require(`../modules/policy/policyAdminMainViewHandler`);

class AdminMainViewFactory {
	constructor(module) {
		try {
			switch (module) {
				case 'policy/policyMainViewHandler':
					this.handler = policyAdminMainViewHandler;
					break;
				default:
					this.handler = defaultAdminMainViewHandler;
					break;
			}
		} catch (err) {
			this.handler = defaultAdminMainViewHandler;
		}
	}

	createHandler() {
		return this.handler.default;
	}
}

export default AdminMainViewFactory;
