const LOGGER = require('@dod-advana/advana-logger');
const SearchUtility = require('../../utils/searchUtility');
const { ExportHistoryController } = require('../../controllers/exportHistoryController');
const { Reports } = require('../../lib/reports');
const APP_SETTINGS = require('../../models').app_settings;

class ExportHandler {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			searchUtility = new SearchUtility(opts),
			exportHistory = new ExportHistoryController(opts),
			reports = new Reports(opts),
			appSettings = APP_SETTINGS,
		} = opts;

		this.logger = logger;
		this.searchUtility = searchUtility;
		this.exportHistory = exportHistory;
		this.reports = reports;
		this.appSettings = appSettings;
	}

	async export(res, searchText, format, options, cloneName, permissions, userId, session) {
		try {
			this.logger.info(
				`${userId} is doing a ${cloneName} export for ${searchText} in ${format} format, options ${JSON.stringify(
					options
				)}`
			);
			const body = options;
			body.searchText = searchText;
			body.format = format;
			body.cloneName = cloneName;
			return await this.exportHelper({ body, permissions, session }, res, userId);
		} catch (e) {
			this.logger.error(e.message, 'CSECA88', userId);
			throw e.message;
		}
	}

	async exportHelper(req, _res, _userId) {
		return req.body;
	}

	async exportReview(res, permissions, options, userId) {
		try {
			const body = options;
			return await this.exportReviewHelper({ body, permissions }, res, userId);
		} catch (e) {
			this.logger.error(e.message, 'UB0D05C');
		}
	}

	async exportReviewHelper(req, _res, _userId) {
		return req.body;
	}

	async exportUsers(res, permissions, options, userId) {
		try {
			const body = options;
			return await this.exportUsersHelper({ body, permissions }, res, userId);
		} catch (e) {
			this.logger.error(e.message, 'UB0D051');
		}
	}

	async exportUsersHelper(req, _res, _userId) {
		return req.body;
	}

	async exportChecklist(res, permissions, options, userId) {
		try {
			const body = options;
			return await this.exportChecklistHelper({ body, permissions }, res, userId);
		} catch (e) {
			this.logger.error(e.message, 'UB0D053');
		}
	}

	async exportChecklistHelper(req, _res, _userId) {
		return req.body;
	}

	async exportProfilePage(res, permissions, options, userId) {
		try {
			const body = options;
			return await this.exportProfilePageHelper({ body, permissions }, res, userId);
		} catch (e) {
			this.logger.error(e.message, 'UB0D054');
		}
	}

	async exportProfilePageHelper(req, _res, _userId) {
		return req.body;
	}
}

module.exports = ExportHandler;
