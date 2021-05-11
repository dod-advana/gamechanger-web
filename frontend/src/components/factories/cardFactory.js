const policyCardHandler = require('../modules/policy/policyCardHandler');
const hermesCardHandler = require('../modules/hermes/hermesCardHandler');
const globalSearchCardHandler = require('../modules/globalSearch/globalSearchCardHandler');
const edaCardHandler = require('../modules/eda/edaCardHandler');
const defaultCardHandler = require('../modules/default/defaultCardHandler');

class CardFactory {

	constructor(module) {
		try {
			switch (module) {
				case 'policy/policyCardHandler':
					this.handler = policyCardHandler;
					break;
				case 'hermes/hermesCardHandler':
					this.handler = hermesCardHandler;
					break;
				case 'globalSearch/globalSearchCardHandler':
					this.handler = globalSearchCardHandler;
					break;
				case 'eda/edaCardHandler':
					this.handler = edaCardHandler;
					break;
				default:
					this.handler = defaultCardHandler;
					break;
			}
		} catch (err) {
			this.handler = defaultCardHandler;
		}
	}

	createHandler() {
		return this.handler.default;
	}
}

export default CardFactory;
