const GC_ADMINS = require('../models').admin;
const LOGGER = require('../lib/logger');
const sparkMD5Lib = require('spark-md5');

class AdminController {

	constructor(opts = {}) {
		const {
			logger = LOGGER,
			gcAdmins = GC_ADMINS,
			sparkMD5 = sparkMD5Lib,
		} = opts;

		this.logger = logger;
		this.gcAdmins = gcAdmins;
		this.sparkMD5 = sparkMD5;

		this.getGCAdminData = this.getGCAdminData.bind(this);
		this.storeGCAdminData = this.storeGCAdminData.bind(this);
		this.deleteGCAdminData = this.deleteGCAdminData.bind(this);
	}

	async getGCAdminData(req, res) {
		let userId = 'webapp_unknown';
		try {
			// const { searchQuery, docTitle } = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');

			this.gcAdmins.findAll({ raw: true }).then(results => {
				res.status(200).send({ admins: results, timeStamp: new Date().toISOString() });
			});

		} catch (err) {
			this.logger.error(err, '9BN7UGI', userId);
			res.status(500).send(err);
		}
	}

	async storeGCAdminData(req, res) {
		let userId = 'webapp_unknown';
		try {
			const { adminData } = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const [admin, created] = await this.gcAdmins.findOrCreate(
				{
					where: { username: adminData.username },
					defaults: {
						username: adminData.username
					}
				}
			);

			if (!created) {
				admin.username = adminData.username;
				await admin.save();
			}

			res.status(200).send({ created: created, updated: !created });

		} catch (err) {
			this.logger.error(err, 'GZ3D0DQ', userId);
			res.status(500).send(err);
		}
	}

	async deleteGCAdminData(req, res) {
		let userId = 'webapp_unknown';
		try {
			const { username } = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const admin = await this.gcAdmins.findOne({ where: { username } });
			await admin.destroy();

			res.status(200).send({ deleted: true });

		} catch (err) {
			this.logger.error(err, 'QH2QBDU', userId);
			res.status(500).send(err);
		}
	}
}

module.exports.AdminController = AdminController;
