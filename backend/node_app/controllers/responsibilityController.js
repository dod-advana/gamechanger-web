const RESPONSIBILITIES = require('../models').responsibilities;
const RESPONSIBILITY_REPORTS = require('../models').responsibility_report;
const LOGGER = require('../lib/logger');
const sparkMD5Lib = require('spark-md5');
const EmailUtility = require('../utils/emailUtility');
const constantsFile = require('../config/constants');
const { DataLibrary } = require('../lib/dataLibrary');
const { Op } = require('sequelize');


class ResponsibilityController {

	constructor(opts = {}) {
		const {
			constants = constantsFile,
			logger = LOGGER,
			dataApi = new DataLibrary(opts),
			responsibilities = RESPONSIBILITIES,
			responsibility_reports = RESPONSIBILITY_REPORTS,
			emailUtility = new EmailUtility({
				fromName: constants.ADVANA_EMAIL_CONTACT_NAME,
				fromEmail: constants.ADVANA_NOREPLY_EMAIL_ADDRESS,
				transportOptions: constants.ADVANA_EMAIL_TRANSPORT_OPTIONS
			})
		} = opts;

		this.logger = logger;
		this.dataApi = dataApi;
		this.responsibilities = responsibilities;
		this.responsibility_reports = responsibility_reports;
		this.emailUtility = emailUtility;
		this.constants = constants;

		this.oneDocQuery = this.oneDocQuery.bind(this);
		this.paraNumQuery = this.paraNumQuery.bind(this);
		this.queryOneDocES = this.queryOneDocES.bind(this);
		this.getParagraphNum = this.getParagraphNum.bind(this);
		this.cleanUpEsResults = this.cleanUpEsResults.bind(this);
		this.cleanDocument = this.cleanDocument.bind(this);
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


	paraNumQuery(filename, text){
		const query = {
			"_source": {
				"includes": [
					"pagerank_r",
					"kw_doc_score_r",
					"orgs_rs",
					"topics_rs"
				]
			},
			"stored_fields": [
				"filename",
			],
			"from": 0,
			"size": 1,
			"track_total_hits": true,
			"query": {
				"bool": {
					"must": [],
					"should": [
						{
							"nested": {
								"path": "paragraphs",
								"inner_hits": {
									"_source": false,
									"stored_fields": [
										"paragraphs.par_inc_count",
										"paragraphs.filename",
										"paragraphs.par_raw_text_t"
									],
								},
								"query": {
									"bool": {
										"should": [
											{
												"query_string": {
													"query": text,
													"default_field": "paragraphs.par_raw_text_t",
													"default_operator": "or",
													"fuzzy_max_expansions": 100,
													"fuzziness": "AUTO"
												}
											},
										],
										"must": [
											{
												"query_string": {
													"query": filename,
													"default_field": "paragraphs.filename",
													"default_operator": "and",
													"fuzzy_max_expansions": 100,
													"fuzziness": "AUTO"
												}
											}
										],
										//"minimum_should_match": 1
									}
								}
							}
						}
					],
					"minimum_should_match": 1,
				}
			},
			"sort": [
				{
					"_score": {
						"order": "desc"
					}
				}
			]
		}
		return query
	}

	oneDocQuery(filename) {
		// get contents of single document searching by filename
		try {
			return {
				size: 1,
				query: {
					bool: {
						should:
						{
							match: { 'filename': filename }
						}	
					}
				}
			}
		} catch (err) {
			this.logger.error(err, 'DOIFCN', userId);
		}
	}

	async queryOneDocES(req, res) {
		// using a filename and a string, get back a list of paragraphs for the document AND
		// the paragraph number for the string.
		let userId = 'webapp_unknown';
		try{
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const permissions = req.permissions ? req.permissions : [];

			const { cloneData = {}, filename = "", text = "" } = req.body;
			let esQuery = this.paraNumQuery(filename, text);
			let esClientName = 'gamechanger';
			let esIndex = 'gamechanger';
			switch (cloneData.clone_name) {
				case 'eda':
					if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')){
						esClientName = 'eda';
						esIndex = 'eda';
					} else {
						throw 'Unauthorized';
					}
					break;
				default:
					esClientName = 'gamechanger';
					esIndex = this.constants.GAME_CHANGER_OPTS.index;
			}

			let rawResults = await this.dataApi.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			const paragraphNum = await this.getParagraphNum(rawResults, userId);

			esQuery = this.oneDocQuery(filename);
			rawResults = await this.dataApi.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			const results = await this.cleanUpEsResults(rawResults, userId);

			const document = results.docs[0];
			const returnObj = this.cleanDocument(document, paragraphNum, userId);

			res.send(returnObj);
		} catch (err) {
			this.logger.error(err, 'QEDSN75', userId);
		}

	}

	async getParagraphNum(raw, user) {
		try {
			console.log(raw);
			let fields = raw.body.hits.hits[0].inner_hits.paragraphs.hits.hits[0].fields;

			return fields['paragraphs.par_inc_count'][0]
		} catch (err) {
			this.logger.error(err.message, 'FSDEW78', user);
		}
	}

	async cleanUpEsResults(raw, user) {
		try {
			
			let results = {
				totalCount: raw.body.hits.total.value,
				docs: []
			};

			raw.body.hits.hits.forEach((r) => {
				let result = r._source;
				results.docs.push(result);
			});
			return results;
		} catch (err) {
			this.logger.error(err.message, 'GX2SWL3', user);
		}
	}

	cleanDocument(document, paragraphNum, user) {
		try {
			let returnObj;

			if (document) {

				returnObj = {
					doc_id: document.id,
					doc_num: document.doc_num,
					par_num: paragraphNum,
					paragraphs: document.paragraphs.filter(child => {
						if (child.type === 'paragraph') return child;
					}),
				};
			} else {
				returnObj = {
					doc_id: 'BLANK',
					doc_num: '',
					paragraphs: [],
				};
			}
			
			return returnObj;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, '3QC37ZY', user);
			return {
				doc_id: 'ERROR',
				doc_num: '',
				paragraphs: [],
			};
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
