const constantsFile = require('../config/constants');
const LOGGER = require('../lib/logger');
const GC_ASSISTS = require('../models').gc_assists;
const ORGANIZATION_URLS = require('../models').organization_urls;
const { DataLibrary } = require('../lib/dataLibrary');
const sparkMD5Lib = require('spark-md5');
const fs = require('fs');
const axios = require('axios');
const https = require('https');
const url = require('url');
const { Op } = require('sequelize');
const { QLIK_URL, QLIK_WS_URL, CA, KEY, CERT, AD_DOMAIN, QLIK_SYS_ACCOUNT } = constantsFile.QLIK_OPTS;

class DocumentController {
	constructor(opts = {}) {
		const {
			constants = constantsFile,
			gcCrowdAssist = GC_ASSISTS,
			organizationURLs = ORGANIZATION_URLS,
			logger = LOGGER,
			dataApi = new DataLibrary(opts),
			sparkMD5 = sparkMD5Lib
		} = opts;

		this.constants = constants;
		this.gcCrowdAssist = gcCrowdAssist;
		this.organizationURLs = organizationURLs;
		this.logger = logger;
		this.dataApi = dataApi;
		this.sparkMD5 = sparkMD5;

		// need to bind to have <this> in context, mostly for logger
		this.getDocumentsToAnnotate = this.getDocumentsToAnnotate.bind(this);
		this.saveDocumentAnnotations = this.saveDocumentAnnotations.bind(this);
		this.getPDF = this.getPDF.bind(this);
		this.getThumbnail = this.getThumbnail.bind(this);
		this.getHomepageThumbnail = this.getHomepageThumbnail.bind(this);
		this.cleanDocumentForCrowdAssist = this.cleanDocumentForCrowdAssist.bind(this);
		this.getDocumentProperties = this.getDocumentProperties.bind(this);
		this.cleanUpEsResultsForAssist = this.cleanUpEsResultsForAssist.bind(this);
		this.getOrgImageOverrideURLs = this.getOrgImageOverrideURLs.bind(this);
		this.saveOrgImageOverrideURL = this.saveOrgImageOverrideURL.bind(this);
	}

	async getDocumentsToAnnotate(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const permissions = req.permissions ? req.permissions : [];

			const { cloneData = {} } = req.body;

			const esQuery = {
				_source: {
					includes: ['filename', 'id', 'doc_type', 'doc_num', 'p_text', 'type', 'p_page', 'paragraphs']
				},
				query: {
					bool: {
						must: [
							{
								exists: {
									field: 'filename'
								}
							}
						]
					}
				}
			};

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

			const results = await this.cleanUpEsResultsForAssist(rawResults, userId);

			const documents = results.docs;

			// Randomly Pick a file
			const randomDoc = documents[Math.floor(Math.random() * Math.floor(documents.length))];

			const returnObj = this.cleanDocumentForCrowdAssist(randomDoc, userId);

			res.send(returnObj);

		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'ixmxFNYyAL', userId);

			res.status(500).send(err);
		}
	}

	async cleanUpEsResultsForAssist(raw, user) {
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

	cleanDocumentForCrowdAssist(document, user) {
		try {
			let returnObj;

			if (document) {

				returnObj = {
					doc_id: document.id,
					doc_num: document.doc_num,
					doc_type: document.doc_type,
					type: document.type,
					paragraphs: document.paragraphs.filter(child => {
						if (child.type === 'paragraph') return child;
					}),
					tagsList: ['PERSON', 'NORP', 'ORG', 'GPE', 'LOC', 'LAW'],
					tagDescriptions: {
						PERSON: 'People',
						NORP: 'Nationalities, Religious or Political Groups',
						ORG: ' Companies, Agencies, Institutions, Etc.',
						GPE: 'Countries, Cities, States',
						LOC: 'Non-GPE locations, Mountain ranges, Bodies of water',
						LAW: 'Named Documents made into Laws'
					}
				};
			} else {
				returnObj = {
					doc_id: '',
					doc_num: '',
					doc_type: '',
					type: '',
					paragraphs: [],
					tagsList: ['PERSON', 'NORP', 'ORG', 'GPE', 'LOC', 'LAW'],
					tagDescriptions: {
						PERSON: 'People',
						NORP: 'Nationalities, Religious or Political Groups',
						ORG: ' Companies, Agencies, Institutions, Etc.',
						GPE: 'Countries, Cities, States',
						LOC: 'Non-GPE locations, Mountain ranges, Bodies of water',
						LAW: 'Named Documents made into Laws'
					}
				};
			}

			return returnObj;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, '3QC37ZY', user);
			return {
				doc_id: '',
				doc_num: '',
				doc_type: '',
				type: '',
				paragraphs: [],
				tagsList: ['PERSON', 'NORP', 'ORG', 'GPE', 'LOC', 'LAW'],
				tagDescriptions: {
					PERSON: 'People',
					NORP: 'Nationalities, Religious or Political Groups',
					ORG: ' Companies, Agencies, Institutions, Etc.',
					GPE: 'Countries, Cities, States',
					LOC: 'Non-GPE locations, Mountain ranges, Bodies of water',
					LAW: 'Named Documents made into Laws'
				}
			};
		}
	}

	async saveDocumentAnnotations(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');

		try {
			const { annotationData } = req.body;

			const hashed_user = this.sparkMD5.hash(userId);

			annotationData.forEach(answer => {
				if (answer.incorrect_reason === '') answer.incorrect_reason = 0;
				answer.user_id = hashed_user;
				this.gcCrowdAssist.create(answer);
			});

			res.status(200).send();

		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'OI5RZVI', userId);

			res.status(500).send(err);
		}
	}

	getPDF(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		try {
			const { path, dest, filekey, samplingType, samplingLines } = req.query;
	
			if (!(dest && filekey && path)) {
				throw new Error('Both destination and filekey are required query parameters');
			}

			this.dataApi.getFilePDF(res, {path, dest, filekey, samplingType, samplingLines}, userId);
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'imeN2WMyAL', userId);

			res.status(500).send(message);
		}
	}
	
	getUserHeader(userid = QLIK_SYS_ACCOUNT) {
		return `UserDirectory=${AD_DOMAIN}; UserId=${userid}`;
	};
	
	getRequestConfigs(params = {}, userid = QLIK_SYS_ACCOUNT) {
		return {
			params: {
				Xrfkey: 1234567890123456,
				...params
			},
			headers: { 'content-type': 'application/json', 'X-Qlik-xrfkey': '1234567890123456', 'X-Qlik-user': this.getUserHeader(userid) },
			httpsAgent: new https.Agent({
				rejectUnauthorized: false,
				ca: CA,
				key: KEY,
				cert: CERT
			})
		};
	};
	
	async getThumbnail(req, res) {
		try {
			
			const {location} = url.parse(req.url,true).query;
			console.log(location)
			let response = await axios.get(`${QLIK_URL}${location}`, { ...this.getRequestConfigs(), responseType: 'stream' });
	
			res.writeHead(200, {
				'content-type': response.headers['content-type'],
				'cache-control': response.headers['cache-control'],
				'etag': response.headers['etag'],
				'expires': response.headers['expires'],
				'last-modified': response.headers['last-modified'],
			});
	
			response.data.pipe(res);
	
		} catch (err) {
			this.logger.error(err, '7GILAOJ');
			res.end();
		}
	};

	async getHomepageThumbnail(req, res) {
		let userId = 'webapp_unknown';
		try {
			const { filenames, folder, dest, clone_name } = req.body
			const promises = []
			userId = req.get('SSL_CLIENT_S_DN_CN');
			filenames.forEach(({img_filename}) => {
				const filename = img_filename;
				if (!(dest && filename)) {
					throw new Error('Both destination and filekey are required query parameters');
				}
				let promise = this.dataApi.getFileThumbnail({dest, filename, folder, clone_name}, userId);
				promises.push(promise);
			});
			
			let allPromises = await Promise.allSettled(promises);
			res.status(200).send(allPromises);			
		} catch (err) {
			this.logger.error(err, 'TJJUFQC', userId)
			res.status(500).send(err);
		}
	}
	async getDocumentProperties(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const {clone = false, cloneData = {}} = req.body;

			const index = clone ? cloneData.clone_data.project_name : this.constants.GAME_CHANGER_OPTS.index;

			res.status(200).send([{ name: 'abbreviations_n', searchField: false }, { name: 'author', searchField: false }, { name: 'category_1', searchField: false }, { name: 'category_2', searchField: false }, { name: 'change_date', searchField: false }, { name: 'classification', searchField: false }, { name: 'display_doc_type_s', searchField: false }, { name: 'display_org_s', searchField: false }, { name: 'display_title_s', searchField: false }, { name: 'doc_num', searchField: false }, { name: 'doc_type', searchField: true }, { name: 'entities', searchField: false }, { name: 'filename', searchField: true }, { name: 'group_s', searchField: false }, { name: 'id', searchField: false }, { name: 'init_date', searchField: false }, { name: 'keyw_5', searchField: false }, { name: 'kw_doc_score', searchField: false }, { name: 'orgs', searchField: false }, { name: 'orgs_rs', searchField: false }, { name: 'page_count', searchField: false }, { name: 'pagerank', searchField: false }, { name: 'pagerank_r', searchField: false }, { name: 'par_count_i', searchField: false }, { name: 'paragraphs', searchField: false }, { name: 'ref_list', searchField: false }, { name: 'signature', searchField: false }, { name: 'subject', searchField: false }, { name: 'summary_30', searchField: false }, { name: 'text_length_r', searchField: false }, { name: 'title', searchField: true }, { name: 'type', searchField: false }, { name: 'word_count', searchField: false }]);

			// const rawResults = await this.dataApi.getElasticSearchFields(index, userId);
			//
			// for (const key in rawResults.data) {
			// 	if (rawResults.data[key]['mappings']) {
			// 		const mappings = rawResults.data[key]['mappings']['properties'];
			// 		const reformattedMappings = [];
			//
			// 		for (const field in mappings) {
			// 			const fieldData = mappings[field];
			// 			reformattedMappings.push({
			// 				name: field,
			// 				searchField: !!(fieldData.fields && fieldData.fields.search)
			// 			});
			// 		}
			//
			// 		res.status(200).send(reformattedMappings);
			// 	}
			// }
			//
			// res.status(200).send([]);

		} catch (err) {
			this.logger.error(err, '8AV00WC', userId);
			res.status(500).send(`Error getting document properties: ${err.message}`);
		}
	}

	async getOrgImageOverrideURLs(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const orgNames = req.query.names;
			const orgDataCleaned = {};
			const orgData = await this.organizationURLs.findAll(orgNames ? {
				where: {
					org_name: {
						[Op.or]: orgNames
					}
				}
			} : {});

			orgData.forEach((item) => {
				orgDataCleaned[item.org_name] = item.image_url;
			});
			
			res.status(200).send(orgDataCleaned);
		} catch (err) {
			this.logger.error(err, 'TJJU7QC', userId)
			res.status(500).send(err);
		}
	}

	async saveOrgImageOverrideURL(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const { name, imageURL } = req.body;

			const existingOrg = await this.organizationURLs.findOne({
				where: {
					org_name: name
				}
			});

			if (existingOrg) {
				existingOrg.update({ image_url: imageURL });
			} else {
				await this.organizationURLs.create({
					org_name: name,
					image_url: imageURL
				});
			}

			res.status(200).send({});
		} catch (err) {
			this.logger.error(err, 'TJDU7QC', userId)
			res.status(500).send(err);
		}
	}
}

module.exports.DocumentController = DocumentController;
