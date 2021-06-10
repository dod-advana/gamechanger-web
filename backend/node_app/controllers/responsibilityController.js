const RESPONSIBILITIES = require('../models').responsibilities;
const RESPONSIBILITY_REPORTS = require('../models').responsibility_report;
const LOGGER = require('../lib/logger');
const sparkMD5Lib = require('spark-md5');
const EmailUtility = require('../utils/emailUtility');
const constantsFile = require('../config/constants');
const { Op } = require('sequelize');

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
		this.getOtherEntResponsibilityFilterList = this.getOtherEntResponsibilityFilterList.bind(this)
	}
	
	async getOtherEntResponsibilityFilterList(req, res) {
		let userId = 'unknown_webapp';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const results = await this.responsibilities.findAll({
				raw: true,
				attributes: [
					'otherOrganizationPersonnel'
				]
			});
			
			const filterReturns = [];
			
			results.forEach(result => {
				if (result.otherOrganizationPersonnel === null) {
					if (!filterReturns.includes('null')) {
						filterReturns.push('null');
					}
				}
				else {
					const otherOrgsArray = result.otherOrganizationPersonnel.split('|');
					otherOrgsArray.forEach(org => {
						if (!filterReturns.includes(org)) {
							filterReturns.push(org);
						}
					})
				}
			});
			
			res.status(200).send(filterReturns.sort());

		} catch (err) {
			this.logger.error(err, 'DPDA9Y3', userId);
			res.status(500).send([]);
		}
	}

	async getResponsibilityData(req, res) {
		let userId = 'unknown_webapp';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const {limit = 10, offset = 0, order = [], where = []} = req.body;
			const tmpWhere = {};
			where.forEach(({id, value}) => {
				if (id === 'id') {
					tmpWhere[id] = {
						[Op.eq]: value
					};
				} else {
					if (id === 'otherOrganizationPersonnel') {
						if (value.includes(null)) {
							tmpWhere[id] = {
								[Op.or]: [
									{ [Op.like]: { [Op.any]: value } },
									{ [Op.eq]: null },
								]
							}
						} else {
							tmpWhere[id] = {
								[Op.like]: { [Op.any]: value }
							};
						}
					} else {
						tmpWhere[id] = {
							[Op.iLike]: `%${value}%`
						};
					}
				}
			});
			const results = await this.responsibilities.findAndCountAll({
				limit,
				offset,
				order,
				where: tmpWhere,
				attributes: [
					'id',
					'filename',
					'documentTitle',
					'organizationPersonnel',
					'responsibilityText',
					'otherOrganizationPersonnel',
					'documentsReferenced'
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
						resp.status(200).send(report);
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
