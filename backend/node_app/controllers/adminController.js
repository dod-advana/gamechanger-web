const GC_ADMINS = require('../models').admin;
const LOGGER = require('../lib/logger');
const sparkMD5Lib = require('spark-md5');
const APP_SETTINGS = require('../models').app_settings;
const SearchUtility = require('../utils/searchUtility');
const constantsFile = require('../config/constants');
class AdminController {

	constructor(opts = {}) {
		const {
			logger = LOGGER,
			gcAdmins = GC_ADMINS,
			sparkMD5 = sparkMD5Lib,
			appSettings = APP_SETTINGS,
			searchUtility = new SearchUtility(opts),
			constants = constantsFile,

		} = opts;

		this.logger = logger;
		this.gcAdmins = gcAdmins;
		this.sparkMD5 = sparkMD5;
		this.appSettings = appSettings;
		this.searchUtility = searchUtility;
		this.constants = constants;



		this.getGCAdminData = this.getGCAdminData.bind(this);
		this.storeGCAdminData = this.storeGCAdminData.bind(this);
		this.deleteGCAdminData = this.deleteGCAdminData.bind(this);
		this.getHomepageEditorData = this.getHomepageEditorData.bind(this);
		this.setHomepageEditorData = this.setHomepageEditorData.bind(this);

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
	async getHomepageEditorData(req, res) {
		let userId = 'webapp_unknown';
		let esIndex = "gamechanger";

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const results = await this.appSettings.findAll({
				where: {
					key: [
						'homepage_topics',
						'homepage_major_pubs',
						'homepage_popular_docs_inactive'
					]
				}
			});
			let docs = {}
			docs.key = "popular_docs";
			try {
				docs.value =  await this.searchUtility.getPopularDocs(userId, esIndex);
			} catch (err) {
				this.logger.error(err, 'FL1LLDU', userId);
				res.status(500).send(err);
				docs.value = []
			}
			results.push(docs);
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, '7R9BUO3', userId);
			res.status(500).send(err);
		}
	}

	async setHomepageEditorData(req, res) {
		let userId = 'webapp_unknown'

		try {
			const { key, tableData } = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');
			await this.appSettings.update(
				{
					value: JSON.stringify(tableData)
				}, {
					where:{
						key: `homepage_${key}`
					}
				})
			res.status(200).send();
		} catch (err) {
			this.logger.error(err, 'QKTBF4J', userId);
			res.status(500).send(err)
		}
	}
}

module.exports.AdminController = AdminController;
