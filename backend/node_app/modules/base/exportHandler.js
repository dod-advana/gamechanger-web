const LOGGER = require('../../lib/logger');
const SearchUtility = require('../../utils/searchUtility')
const { ExportHistoryController } = require('../../controllers/exportHistoryController');
const { Reports } = require('../../lib/reports');
const APP_SETTINGS = require('../../models').app_settings;

class ExportHandler {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
		} = opts;

		this.logger = logger;
		this.searchUtility = new SearchUtility(opts);
		this.exportHistory = new ExportHistoryController(opts);
		this.reports = new Reports();
		this.appSettings = APP_SETTINGS;
	}

	async export(res, searchText, format, options, cloneName, permissions, userId) {
		try {
			this.logger.info(`${userId} is doing a ${cloneName} export for ${searchText} in ${format} format, options ${JSON.stringify(options)}`)
			const body = options;
			body.searchText = searchText;
			body.format = format;
			body.cloneName = cloneName;
			return await this.exportHelper({body, permissions}, res, userId)
		} catch (e) {
			this.logger.error(e.message, 'CSECA88', userId);
			throw e.message;
		}
	}

	async exportHelper(req, res, userId){
		return req.body;
	}

}

module.exports = ExportHandler;