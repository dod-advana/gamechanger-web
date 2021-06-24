const LOGGER = require('../lib/logger');
const {HandlerFactory} = require('../factories/handlerFactory');
const handlerFactory = new HandlerFactory();

class EDAController {
    constructor(opts = {}) {
        const {
            logger = LOGGER
        } = opts;
        this.logger = logger;

        this.queryContractAward = this.queryContractAward.bind(this);
    }

    async queryContractAward(req, res) {
        const userId = req.get('SSL_CLIENT_S_DN_CN');
        try {
			const edaSearchHandler = handlerFactory.createHandler('search', 'eda');
			const results = await edaSearchHandler.queryContractAward(req, userId);
            res.status(200).send(results);
        } catch(err) {
            res.status(500).send(err);
            this.logger.error(err, '', userId);
        }
    }
}

module.exports.EDAController = EDAController;