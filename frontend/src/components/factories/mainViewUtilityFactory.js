const defaultMainViewUtilityHandler = require(`../modules/default/defaultMainViewUtilityHandler`);
const globalSearchMainViewUtilityHandler = require(`../modules/globalSearch/globalSearchMainViewUtilityHandler`);

class MainViewUtilityFactory {
	constructor(module) {
		try {
			switch (module) {
				case 'globalSearch/globalSearchMainViewHandler':
					this.handler = globalSearchMainViewUtilityHandler;
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
