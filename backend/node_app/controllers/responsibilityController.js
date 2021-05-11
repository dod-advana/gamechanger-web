const RESPONSIBILITIES = require('../models').responsibilities;
const RESPONSIBILITY_REPORTS = require('../models').responsibility_report;
const LOGGER = require('../lib/logger');
const sparkMD5Lib = require('spark-md5');
const EmailUtility = require('../utils/emailUtility');
const constantsFile = require('../config/constants');

class ResponsibilityController {

	constructor(opts = {}) {
		const {
			constants = constantsFile,
			logger = LOGGER,
			responsibilities = RESPONSIBILITIES,
			responsibility_reports = RESPONSIBILITY_REPORTS,
			emailUtility = new EmailUtility({
				fromName: constants.ADVANA_EMAIL_CONTACT_NAME,
				fromEmail: constants.ADVANA_NOREPLY_EMAIL_ADDRESS,
				transportOptions: constants.ADVANA_EMAIL_TRANSPORT_OPTIONS
			})
		} = opts;

		this.logger = logger;
		this.responsibilities = responsibilities;
		this.responsibility_reports = responsibility_reports;
		this.emailUtility = emailUtility;
		this.constants = constants;

		this.getResponsibilityData = this.getResponsibilityData.bind(this);
		this.storeResponsibilityReports = this.storeResponsibilityReports.bind(this);
	}

	async getResponsibilityData(req, res) {
		let userId = 'unknown_webapp';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const {limit = 10, offset = 0, order = [], where = {}} = req.body;
			const results = await this.responsibilities.findAndCountAll({
				limit,
				offset,
				order,
				where,
				attributes: [
					'id',
					'filename',
					'primaryEntity',
					'responsibilityLevel1',
					'responsibilityLevel2',
					'responsibilityLevel3',
					'entitiesFound',
					'references'
				]
			});
			res.status(200).send({totalCount: results.count, results: results.rows});

		} catch (err) {
			this.logger.error(err, 'DPDA9Y3', userId);
			res.status(500).send(err);
		}
	}

	async storeResponsibilityReports(req, res) {
		let userId = 'unknown_webapp';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const {id, issue_description} = req.body;

			const hashed_user = sparkMD5Lib.hash(userId);

			if (id && issue_description) {
				const [report, created] = await this.responsibility_reports.findOrCreate(
					{
						where: { reporter_hashed_username: hashed_user, responsibility_id: id },
						defaults: {
							reporter_hashed_username: hashed_user,
							responsibility_id: id,
							issue_description: issue_description
						}
					}
				);
				if (created) {
					const emailBody = `<h2>Responsibility Issue Report from ${userId}</h2>
						<p>Responsibility Row in Postgres: ${id}</p>
						<p>${issue_description}</p>`;
					this.emailUtility.sendEmail(emailBody, 'Responsibility Issue Report', this.constants.GAME_CHANGER_OPTS.emailAddress, null, null, userId).then(resp => {
						res.status(200).send(report);
					}).catch(error => {
						this.logger.error(JSON.stringify(error), 'YXBG3G4', userId);
						res.status(200).send(report);
					});
				} else {
					res.status(200).send(report);
				}
			} else {
				res.status(400).send('Responsibility id not included or the description of the issue not included.');
			}
		} catch (err) {
			this.logger.error(err, '5PO0TJR', userId);
			res.status(500).send(err);
		}
	}
}

module.exports.ResponsibilityController = ResponsibilityController;
