const EXPORT_HISTORY = require('../models').export_history;
const LOGGER = require('../lib/logger');
const sparkMD5Lib = require('spark-md5');
const { getTenDigitUserId } = require('../utils/userUtility');

class ExportHistoryController {

	constructor(opts = {}) {
		const {
			logger = LOGGER,
			exportHistory = EXPORT_HISTORY,
			sparkMD5 = sparkMD5Lib,
		} = opts;

		this.logger = logger;
		this.exportHistory = exportHistory;
		this.sparkMD5 = sparkMD5;

		this.updateExportHistoryDate = this.updateExportHistoryDate.bind(this);
		this.storeExportHistory = this.storeExportHistory.bind(this);
		this.getExportHistory = this.getExportHistory.bind(this);
		this.deleteExportHistory = this.deleteExportHistory.bind(this);
	}

	async updateExportHistoryDate(res, historyId, userId){
		try {
			const instance = await this.exportHistory.findOne({ where: { id: historyId, user_id: this.sparkMD5.hash(userId) }});
			instance.changed('updatedAt', true);
			instance.save();
		} catch (e) {
			this.logger.error(e.message, '584pke03', userId);
			res.status(502).send({ error: e.message, message: 'Error creating export history' });
		}
	}

	async storeExportHistory(res, reqBody, respMeta, userId = 'webapp_unknown'){
		const new_id = getTenDigitUserId(userId)
		const record = {
			user_id: this.sparkMD5.hash(userId),
			download_request_body: reqBody,
			search_response_metadata: respMeta,
			new_user_id: new_id ? this.sparkMD5.hash(new_id) : null
		};

		try {
			await this.exportHistory.create(record);
		} catch (e) {
			this.logger.error(e.message, '3Me8cG6', userId);
			res.status(502).send({ error: e.message, message: 'Error creating export history' });
		}
	}

	async getExportHistory(req, res){
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const hist = await this.exportHistory.findAll({
				raw: true,
				where: {
					user_id: this.sparkMD5.hash(userId)
				},
				order: [
					['updatedAt', 'DESC']
				]
			});

			res.send(hist);
		} catch (e) {
			this.logger.error(e.message, '3A3RUG6', userId);
			res.status(502).send({ error: e.message, message: 'Error retrieving export history' });
		}
	}

	async deleteExportHistory(req, res) {
		let userId = 'webapp_unknown';

		try {
			const { historyId: id } = req.params;
			if (!id) {
				throw new Error('No id passed in route');
			}

			userId = req.get('SSL_CLIENT_S_DN_CN');
			const resp = await this.exportHistory.destroy(
				{
					where: {
						id
					}
				}
			);

			res.send({ message: 'delete success', id: resp });
		} catch (e) {
			this.logger.error(e.message, '3A3RUG6', userId);
			res.status(502).send({ error: e.message, message: 'Error deleting item from export history' });
		}
	}
}

module.exports.ExportHistoryController = ExportHistoryController;
