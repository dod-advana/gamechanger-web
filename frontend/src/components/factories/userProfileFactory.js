const defaultUserProfileHandler = require(`../modules/default/defaultUserProfileHandler`);
const policyUserProfileHandler = require(`../modules/policy/policyUserProfileHandler`);
const jbookUserProfileHandler = require(`../modules/jbook/jbookUserProfileHandler`);

class UserProfileFactory {
	constructor(module) {
		try {
			switch (module) {
				case 'policy/policyMainViewHandler':
					this.handler = policyUserProfileHandler;
					break;
				case 'jbook/jbookMainViewHandler':
					this.handler = jbookUserProfileHandler;
					break;
				default:
					this.handler = defaultUserProfileHandler;
					break;
			}
		} catch (err) {
			this.handler = defaultUserProfileHandler;
		}
	}

	createHandler() {
		return this.handler.default;
	}
}

export default UserProfileFactory;
