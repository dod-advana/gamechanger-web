const DOCUMENT_CORPUS = require('../models').gc_document_corpus_snapshot;
const CRAWLER_STATUS = require('../models').crawler_status;
const CRAWLER_INFO = require('../models').crawler_info;
const ORGANIZATION_INFO = require('../models').organization_info;
const VERSIONED_DOCS = require('../models').versioned_docs;
const LOGGER = require('../lib/logger');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

class DataTrackerController {

	constructor(opts = {}) {
		const {
			logger = LOGGER,
			documentCorpus = DOCUMENT_CORPUS,
			crawlerStatus = CRAWLER_STATUS,
			crawlerInfo = CRAWLER_INFO,
			organizationInfo = ORGANIZATION_INFO,
			versioned_docs = VERSIONED_DOCS,
		} = opts;

		this.logger = logger;
		this.documentCorpus = documentCorpus;
		this.crawlerStatus = crawlerStatus;
		this.crawlerInfo = crawlerInfo;
		this.organizationInfo = organizationInfo;
		this.versioned_docs = versioned_docs;

		this.getTrackedData = this.getTrackedData.bind(this);
		this.getBrowsingLibrary = this.getBrowsingLibrary.bind(this);
		this.getTrackedSource = this.getTrackedSource.bind(this);
		this.crawlerDateHelper = this.crawlerDateHelper.bind(this);
		this.getCrawlerMetadata = this.getCrawlerMetadata.bind(this);
		this.getCrawlerInfoData = this.getCrawlerInfoData.bind(this);
		this.getOrgSealData = this.getOrgSealData.bind(this);
	}

	async getBrowsingLibrary(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		const { level=1 } = req.body;
		let level_value;
		try {
			switch(level){
				case 1:
					level_value = await this.crawlerStatus.aggregate('crawler_name', 'DISTINCT', { plain: false })
					break;
				default:
					level_value = []
					break;
			}
			res.status(200).send({totalCount: level_value.length, docs:level_value});

		} catch (err) {
			this.logger.error(err, 'VFXZA74', userId);
			res.status(500).send(err);
		}
	}

	async getTrackedData(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		const { limit = 10, offset = 0, order = [], where = {} } = req.body;
		const new_where = {}
		where.forEach((object,idx) => {
			const col = Object.keys(object)[0]
			new_where[col] = {[Sequelize.Op.iLike]: where[idx][col]['$iLike']}
		});
		try {
			const totalCount = await this.documentCorpus.count({ where: new_where });
			const docs = await this.documentCorpus.findAll({ limit, offset, order, where: new_where });

			res.status(200).send({ totalCount, docs });

		} catch (err) {
			this.logger.error(err, 'VFXZA74', userId);
			res.status(500).send(err);
		}
	}

	async getTrackedSource(req, res) {
		let userId = req.get('SSL_CLIENT_S_DN_CN');
		const { limit = 10, offset = 0, order = [], where = {} } = req.body;
		try {
			const totalCount = await this.documentCorpus.count({ where, group: 'source_fqdn'});
			const sources = await this.documentCorpus.findAll({
				limit,
				offset,
				order,
				where,
				attributes: [
					'*',
					[Sequelize.fn('COUNT', Sequelize.col('source_fqdn')), 'num_docs']
				],
				group: 'source_fqdn'
			});

			res.status(200).send({ totalCount, sources });
		} catch (err) {
			this.logger.error(err, 'L1YL7BX', userId);
			res.status(500).send(err);
		}
	}

	async crawlerDateHelper(searchResults, userId){
		const crawlerDateLookup = {};
		try {
			for (let searchIndex = 0; searchIndex < searchResults.docs.length; searchIndex++) {
				const doc = searchResults.docs[searchIndex];
				let crawler = doc.crawler_used_s;
				if (crawler === undefined){
					searchResults.docs[searchIndex].current_as_of = undefined;
					continue;
				}
				// if there crawler not found in lookup table
				if (crawlerDateLookup[crawler] === undefined){
					const result = await this.crawlerStatus.findAll({
						limit: 1,
						attributes: ['crawler_name', 'datetime'],
						where: {
							crawler_name: crawler,
							status: 'Ingest Complete'
						},
						order: [['datetime', 'DESC']]
					});
					if (result.length === 1){
						const data = result[0].dataValues;
						const crawler_date = data.datetime;
						crawlerDateLookup[crawler] = crawler_date;
					}
				}
				searchResults.docs[searchIndex].current_as_of = crawlerDateLookup[crawler];
			}
			return searchResults;
		} catch (e){
			const { message } = e;
			this.logger.error(message, '3QVUGXF', userId);
			throw e;
		}
	}

	async getCrawlerMetadata(req, res) {
		let userId = 'webapp_unknown';
		const { limit = 10, offset = 0, order = [], where = {}, option='all' } = req.body;
		
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			if (option === 'all'){
				const crawlerData = await this.crawlerStatus.findAndCountAll({
					raw: true,
					attributes: ['crawler_name', 'status', 'datetime'],
					where,
					offset,
					order,
					limit
				});
				res.status(200).send({totalCount: crawlerData.count, docs: crawlerData.rows});
			}else if (option === 'status'){
				let level_value;
				let crawlerData = {};
				level_value = await this.crawlerStatus.findAll({
					attributes: ['crawler_name', 'status', 'datetime'],
				}).then(data=>{
					data.map(item =>{
						if (crawlerData[item.crawler_name] ){
							if (crawlerData[item.crawler_name].datetime <item.datetime){
								crawlerData[item.crawler_name] = {'datetime':item.datetime, 'status':item.status}
							}
						}else{
							crawlerData[item.crawler_name] = {'datetime':item.datetime, 'status':item.status}
						}
					})
					return crawlerData
				})
				let resp = []
				Object.keys(level_value).slice(offset, offset + limit).map(data =>{
					resp.push({'crawler_name':data, 'status':level_value[data].status, 'datetime':level_value[data].datetime})
				})
				res.status(200).send({totalCount: Object.keys(crawlerData).length, docs: resp});
			}else if (option === 'last'){
				let level_value;
				let crawlerData = {};
				level_value = await this.crawlerStatus.findAll({
					attributes: ['crawler_name', 'status', 'datetime'],
					where: {
						status: 'Ingest Complete'
					}
				}).then(data=>{
					data.map(item =>{
						if (crawlerData[item.crawler_name] ){
							if (crawlerData[item.crawler_name].datetime <item.datetime){
								crawlerData[item.crawler_name] = {'datetime':item.datetime, 'status':item.status}
							}
						}else{
							crawlerData[item.crawler_name] = {'datetime':item.datetime, 'status':item.status}
						}
					})
					return crawlerData
				})
				let resp = []
				Object.keys(level_value).slice(offset, offset + limit).map(data =>{
					resp.push({'crawler_name':data, 'status':level_value[data].status, 'datetime':level_value[data].datetime})
				})
				res.status(200).send({totalCount: Object.keys(crawlerData).length, docs: resp});
			}
		} catch (e) {
			this.logger.error(e.message, 'UXV7V8R', userId);
			res.status(502).send({ error: e.message, message: 'Error retrieving crawler metadata' });
		}
	}

	async getCrawlerInfoData(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const crawlerData = await this.crawlerInfo.findAndCountAll({});
			const crawlerDataCleaned = crawlerData.rows.map((item) => {
				return item.dataValues;
			});
			res.status(200).send(crawlerDataCleaned);
		} catch (e) {
			this.logger.error(e.message, 'VMHW663', userId);
			res.status(500).send({ error: e.message, message: 'Error retrieving crawler seals' });
		}
	}
	
	async getOrgSealData(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const orgData = await this.organizationInfo.findAll();
			res.status(200).send(orgData);
		} catch (e) {
			this.logger.error(e.message, 'VMHW263', userId);
			res.status(500).send({ error: e.message, message: 'Error retrieving organization seals' });
		}
	}
}

module.exports.DataTrackerController = DataTrackerController;
