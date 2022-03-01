const RESPONSIBILITIES = require('../models').responsibilities;
const RESPONSIBILITY_REPORTS = require('../models').responsibility_report;
const LOGGER = require('../lib/logger');
const sparkMD5Lib = require('spark-md5');
const EmailUtility = require('../utils/emailUtility');
const constantsFile = require('../config/constants');
const { DataLibrary } = require('../lib/dataLibrary');
const Sequelize = require('sequelize');
const { Op } = Sequelize;


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
		this.getFileLink = this.getFileLink.bind(this);
		this.getParagraphNum = this.getParagraphNum.bind(this);
		this.cleanUpEsResults = this.cleanUpEsResults.bind(this);
		this.cleanEsQueryText = this.cleanEsQueryText.bind(this);
		this.cleanDocument = this.cleanDocument.bind(this);
		this.getResponsibilityData = this.getResponsibilityData.bind(this);
		this.getResponsibilityDocTitles = this.getResponsibilityDocTitles.bind(this);
		this.storeResponsibilityReports = this.storeResponsibilityReports.bind(this);
		this.getResponsibilityUpdates = this.getResponsibilityUpdates.bind(this);
		this.getOtherEntResponsibilityFilterList = this.getOtherEntResponsibilityFilterList.bind(this);
		this.rejectResponsibility = this.rejectResponsibility.bind(this);
		this.updateResponsibility = this.updateResponsibility.bind(this);
		this.updateResponsibilityReport = this.updateResponsibilityReport.bind(this);
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
			'_source': {
				'includes': [
					'pagerank_r',
					'kw_doc_score_r',
					'orgs_rs',
					'topics_rs',
					'download_url_s',
				]
			},
			'stored_fields': [
				'filename',
			],
			'from': 0,
			'size': 1,
			'track_total_hits': true,
			'query': {
				'bool': {
					'must': [],
					'should': [
						{
							'nested': {
								'path': 'paragraphs',
								'inner_hits': {
									'_source': false,
									'stored_fields': [
										'paragraphs.par_inc_count',
										'paragraphs.filename',
										'paragraphs.page_num_i',
										'paragraphs.par_raw_text_t'
									],
								},
								'query': {
									'bool': {
										'should': [
											{
												'query_string': {
													'query': text,
													'default_field': 'paragraphs.par_raw_text_t',
													'default_operator': 'or',
													'fuzzy_max_expansions': 100,
													'fuzziness': 'AUTO'
												}
											},
										],
										'must': [
											{
												'query_string': {
													'query': filename,
													'default_field': 'paragraphs.filename',
													'default_operator': 'and',
													'fuzzy_max_expansions': 100,
													'fuzziness': 'AUTO'
												}
											}
										],
										//"minimum_should_match": 1
									}
								}
							}
						}
					],
					'minimum_should_match': 1,
				}
			},
			'sort': [
				{
					'_score': {
						'order': 'desc'
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

			const { cloneData = {}, filename = '', text = '' } = req.body;
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

	cleanEsQueryText(text){
		let cleanText = text;

		const colonIndex = text.match(/:+$/)?.index;
		if(colonIndex) cleanText = cleanText.slice(0, colonIndex);

		return cleanText;
	}

	async getFileLink(req, res) {
		// using a filename and a string, get back a list of paragraphs for the document AND
		// the paragraph number for the string.
		let userId = 'webapp_unknown';
		try{
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const permissions = req.permissions ? req.permissions : [];

			const { cloneData = {}, filename = '', text = '' } = req.body;
			
			const cleanedText = this.cleanEsQueryText(text);

			let esQuery = this.paraNumQuery(filename, cleanedText);
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
			const rawResults = await this.dataApi.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			const pageNumber = rawResults.body.hits.hits[0].inner_hits.paragraphs.hits.hits[0].fields['paragraphs.page_num_i'][0];
			const fileLink = rawResults.body.hits.hits[0]._source.download_url_s

			res.status(200).send({fileLink, pageNumber});
		} catch (err) {
			res.status(500).send();
			this.logger.error(err, 'QRDSM32', userId);
		}

	}

	async getParagraphNum(raw, user) {
		try {
			if (raw.body.hits.hits.length === 0 ){
				return -1
			} else {
				let fields = raw.body.hits.hits[0].inner_hits.paragraphs.hits.hits[0].fields;
				return fields['paragraphs.par_inc_count'][0]
			}
			
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

			const { offset = 0, order = [], where = [], docView, DOCS_PER_PAGE = 10, page, limit } = req.body;
			order.push(['documentTitle', 'ASC']);
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
					} else if (docView && id === 'documentTitle'){
						if(!tmpWhere[Op.or]) tmpWhere[Op.or] = [];
						tmpWhere[Op.or].push({
							[id]: value
						});
					} else {
						if(!tmpWhere[id]) tmpWhere[id] = {[Op.or]: []};
						tmpWhere[id][Op.or].push({
							[Op.iLike]: `%${value}%`
						});
					}
				}
			});
			tmpWhere['status'] = {[Op.not]: 'rejected'};
			const newOffsets = [];
			let newLimit = 0;
			if(docView){
				const docOffsets = await this.responsibilities.findAndCountAll({
					where: tmpWhere,
					group: 'documentTitle',
					order: order,
					attributes: [
						[Sequelize.fn('COUNT', Sequelize.col('documentTitle')), 'documentCount'],
						'documentTitle',
					]
				});
				docOffsets.rows.forEach(data => newOffsets.push(Number(data.dataValues.documentCount)))
				for(let i = (page - 1) * DOCS_PER_PAGE; i < page * DOCS_PER_PAGE; i++){
					if(!newOffsets[i]) break;
					newLimit += newOffsets[i];
				}
			}
			const results = await this.responsibilities.findAndCountAll({
				limit: docView ? newLimit : limit,
				offset,
				order: order,
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
			res.status(200).send({offsets: newOffsets, totalCount: results.count, results: results.rows});

		} catch (err) {
			this.logger.error(err, 'ASDED20', userId);
			res.status(500).send(err);
		}
	}

	async getResponsibilityDocTitles(req, res) {
		let userId = 'unknown_webapp';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const where = {};
			where['status'] = {[Op.not]: 'rejected'};

			const results = await this.responsibilities.findAll({
				group: ['documentTitle'],
				where,
				attributes: [
					'documentTitle',
				]
			});
			res.status(200).send({results});

		} catch (err) {
			this.logger.error(err, 'BTEFE31', userId);
			res.status(500).send(err);
		}
	}

	async rejectResponsibility(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');

		try {
			const { id } = req.body;

			const result = await this.responsibilities.update({status: 'rejected'},
				{
					where: { id: id },
					subQuery: false
				}
			);
			res.status(200).send();

		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'UYDC4856', userId);

			res.status(500).send(err);
		}
	}

	// Old update function for chart responsibility update functionality:

	// async updateResponsibility(req, res) {
	// 	const userId = req.get('SSL_CLIENT_S_DN_CN');

	// 	try {
	// 		const { id, updateProps } = req.body;
	// 		const result = await this.responsibilities.update({
	// 			...updateProps,
	// 			status: 'revised'
	// 		},
	// 		{
	// 			where: { id: id },
	// 			subQuery: false
	// 		}
	// 		);
	// 		res.status(200).send();

	// 	} catch (err) {
	// 		const { message } = err;
	// 		this.logger.error(message, 'IORFMS75', userId);

	// 		res.status(500).send(err);
	// 	}
	// }

	async updateResponsibility(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');

		try {
			const { update, responsibility, status } = req.body;
			const { id: updateId, updatedText, updatedColumn } = update;
			const { id: responsibilityId, responsibilityText, organizationPersonnel} = responsibility;
			let responsibilityStatus;
			if(updatedColumn === 'Reject' && status === 'accepted'){
				await this.responsibilities.update({
					status: 'rejected'
				}, 
				{
					where: {
						id: responsibilityId
					}
				})
				await this.responsibility_reports.update({
					issue_description: status
				}, 
				{
					where: {
						id: updateId
					}
				})

				return res.status(200).send();
			}
			const foundResp = await this.responsibilities.findOne({
				where: {id: responsibilityId},
				include: {
					model: RESPONSIBILITY_REPORTS,
					where: {issue_description: 'review'}
				}
			})
			if(status === 'accepted'){ 
				if(foundResp?.dataValues.responsibility_reports.length <= 1) {
					responsibilityStatus = 'updated';
				}else{
					responsibilityStatus = 'updated, review'
				}
				await this.responsibilities.update({
					[updatedColumn]: updatedText,
					status: responsibilityStatus
				}, 
				{
					where: {
						id: responsibilityId
					}
				})
				let responsibilityUpdate;
				if(updatedColumn === 'responsibilityText') responsibilityUpdate = responsibilityText;
				if(updatedColumn === 'organizationPersonnel') responsibilityUpdate = organizationPersonnel;
				await this.responsibility_reports.update({
					updatedText: responsibilityUpdate,
					issue_description: status
				}, 
				{
					where: {
						id: updateId
					}
				})
			}
			if(status === 'rejected'){
				await this.responsibility_reports.destroy({
					where: {
						id: updateId
					}
				})
				if(foundResp?.dataValues.responsibility_reports.length <= 1){
					await this.responsibilities.update({
						status: 'active'
					},
					{
						where: {
							id: responsibilityId
						}
					})
				}
			}
			res.status(200).send();

		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'IORFMS75', userId);

			res.status(500).send(err);
		}
	}

	async updateResponsibilityReport(req, res) {
		let userId = 'unknown_webapp';
		try{
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const { id, updatedText, textPosition } = req.body;

			const result = await this.responsibility_reports.update({
				updatedText,
				textPosition
			}, 
			{
				where: {
					id
				}
			})
			res.status(200).send(result);
		}catch (err) {
			this.logger.error(err, '1PU0TKR', userId);
			res.status(500).send(err);
		}
	}

	async storeResponsibilityReports(req, res) {
		let userId = 'unknown_webapp';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const {id, issue_description, updatedColumn, updatedText, textPosition} = req.body;
			if(id == null || !issue_description) return res.status(400).send();

			const hashed_user = sparkMD5Lib.hash(userId);
			const report = await this.responsibility_reports.create({
				responsibility_id: id,
				reporter_hashed_username: hashed_user,
				issue_description,
				updatedColumn,
				updatedText,
				textPosition
			})
			await this.responsibilities.update({
				status: 'review'
			},
			{
				where: { id: id },
				subQuery: false
			}
			);
				
			res.status(200).send(report);
		} catch (err) {
			this.logger.error(err, '5PO0TJR', userId);
			res.status(500).send(err);
		}
	}

	// async getResponsibilityUpdates(req, res) {
	// 	let userId = 'unknown_webapp';
	// 	try {
	// 		userId = req.get('SSL_CLIENT_S_DN_CN');

	// 		const { where } = req.body;

	// 		const updates = await this.responsibility_reports.findAll({
	// 			include: RESPONSIBILITIES,
	// 			where
	// 		})
				
	// 		res.status(200).send(updates);
	// 	} catch (err) {
	// 		console.log(err)
	// 		this.logger.error(err, 'DPI0RJS', userId);
	// 		res.status(500).send(err);
	// 	}
	// }

	async getResponsibilityUpdates(req, res) {
		let userId = 'unknown_webapp';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const { offset = 0, order = [], DOCS_PER_PAGE = 10, page } = req.body;
			order.push(['filename', 'ASC']);
			const where = {};
			where['status'] = {[Op.like]: '%review%'};
			const newOffsets = [];
			let limit = 0;
			const docOffsets = await this.responsibilities.findAndCountAll({
				where,
				group: 'filename',
				order: order,
				attributes: [
					[Sequelize.fn('COUNT', Sequelize.col('filename')), 'filenameCount'],
					'filename',
				]
			});
			docOffsets.rows.forEach(data => newOffsets.push(Number(data.dataValues.filenameCount)))
			for(let i = (page - 1) * DOCS_PER_PAGE; i < page * DOCS_PER_PAGE; i++){
				if(!newOffsets[i]) break;
				limit += newOffsets[i];
			}
			const results = await this.responsibilities.findAndCountAll({
				limit,
				offset,
				order: order,
				where,
				include: {
					model: RESPONSIBILITY_REPORTS,
					where: { issue_description: 'review'}
				}
			});
			res.status(200).send({offsets: newOffsets, totalCount: results.count, results: results.rows});

		} catch (err) {
			this.logger.error(err, 'BSRE320', userId);
			res.status(500).send(err);
		}
	}
}

module.exports.ResponsibilityController = ResponsibilityController;
