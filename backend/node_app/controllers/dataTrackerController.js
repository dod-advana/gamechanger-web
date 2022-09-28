const DOCUMENT_CORPUS = require('../models').gc_document_corpus_snapshot;
const CRAWLER_STATUS = require('../models').crawler_status;
const CRAWLER_INFO = require('../models').crawler_info;
const ORGANIZATION_INFO = require('../models').organization_info;
const VERSIONED_DOCS = require('../models').versioned_docs;
const LOGGER = require('@dod-advana/advana-logger');
const Sequelize = require('sequelize');
const constantsFile = require('../config/constants');
const { Op } = require('sequelize');
const { DataLibrary } = require('../lib/dataLibrary');
const SearchUtility = require('../utils/searchUtility');
const moment = require('moment');

class DataTrackerController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			documentCorpus = DOCUMENT_CORPUS,
			crawlerStatus = CRAWLER_STATUS,
			crawlerInfo = CRAWLER_INFO,
			organizationInfo = ORGANIZATION_INFO,
			versioned_docs = VERSIONED_DOCS,
			sequelizeGCOrchestration = new Sequelize(constantsFile.POSTGRES_CONFIG.databases['gc-orchestration']),
			searchUtility = new SearchUtility(opts),
			dataLibrary = new DataLibrary(opts),
		} = opts;

		this.logger = logger;
		this.documentCorpus = documentCorpus;
		this.crawlerStatus = crawlerStatus;
		this.crawlerInfo = crawlerInfo;
		this.organizationInfo = organizationInfo;
		this.versioned_docs = versioned_docs;
		this.sequelizeGCOrchestration = sequelizeGCOrchestration;
		this.dataLibrary = dataLibrary;
		this.searchUtility = searchUtility;

		this.getTrackedData = this.getTrackedData.bind(this);
		this.getBrowsingLibrary = this.getBrowsingLibrary.bind(this);
		this.getTrackedSource = this.getTrackedSource.bind(this);
		this.crawlerDateHelper = this.crawlerDateHelper.bind(this);
		this.getCrawlerMetadata = this.getCrawlerMetadata.bind(this);
		this.getCrawlerInfoData = this.getCrawlerInfoData.bind(this);
		this.getOrgSealData = this.getOrgSealData.bind(this);
		this.getDocIngestionStats = this.getDocIngestionStats.bind(this);
	}

	async getBrowsingLibrary(req, res) {
		let userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
		const { level = 1 } = req.body;
		let level_value;
		try {
			switch (level) {
				case 1:
					level_value = await this.crawlerStatus.aggregate('crawler_name', 'DISTINCT', { plain: false });
					break;
				default:
					level_value = [];
					break;
			}
			res.status(200).send({ totalCount: level_value.length, docs: level_value });
		} catch (err) {
			this.logger.error(err, 'VFXZA74', userId);
			res.status(500).send(err);
		}
	}

	async getTrackedData(req, res) {
		let userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
		const { limit = 10, offset = 0, order = [], where = {} } = req.body;
		const new_where = {};
		where.forEach((object, idx) => {
			const col = Object.keys(object)[0];
			new_where[col] = { [Sequelize.Op.iLike]: where[idx][col]['$iLike'] };
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
		let userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
		const { limit = 10, offset = 0, order = [], where = {} } = req.body;
		try {
			const totalCount = await this.documentCorpus.count({ where, group: 'source_fqdn' });
			const sources = await this.documentCorpus.findAll({
				limit,
				offset,
				order,
				where,
				attributes: ['*', [Sequelize.fn('COUNT', Sequelize.col('source_fqdn')), 'num_docs']],
				group: 'source_fqdn',
			});

			res.status(200).send({ totalCount, sources });
		} catch (err) {
			this.logger.error(err, 'L1YL7BX', userId);
			res.status(500).send(err);
		}
	}

	async crawlerDateHelper(searchResults, userId) {
		const crawlerDateLookup = {};
		try {
			for (let searchIndex = 0; searchIndex < searchResults.docs.length; searchIndex++) {
				const doc = searchResults.docs[searchIndex];
				let crawler = doc.crawler_used_s;
				if (crawler === undefined) {
					searchResults.docs[searchIndex].current_as_of = undefined;
					continue;
				}
				// if there crawler not found in lookup table
				if (crawlerDateLookup[crawler] === undefined) {
					const result = await this.crawlerStatus.findAll({
						limit: 1,
						attributes: ['crawler_name', 'datetime'],
						where: {
							crawler_name: crawler,
							status: 'Ingest Complete',
						},
						order: [['datetime', 'DESC']],
					});
					if (result.length === 1) {
						const data = result[0].dataValues;
						const crawler_date = data.datetime;
						crawlerDateLookup[crawler] = crawler_date;
					}
				}
				searchResults.docs[searchIndex].current_as_of = crawlerDateLookup[crawler];
			}
			return searchResults;
		} catch (e) {
			const { message } = e;
			this.logger.error(message, '3QVUGXF', userId);
			throw e;
		}
	}

	compileDataFromStatusTable(data, crawlerData) {
		data.map((item) => {
			if (crawlerData[item.crawler_name]) {
				if (crawlerData[item.crawler_name].datetime < item.datetime) {
					crawlerData[item.crawler_name] = { datetime: item.datetime, status: item.status };
				}
			} else {
				crawlerData[item.crawler_name] = { datetime: item.datetime, status: item.status };
			}
		});
		return crawlerData;
	}

	setCrawlerDisplayName(crawler, crawlerName) {
		const data_source_s = crawler?.dataValues.data_source_s;
		const source_title = crawler?.dataValues.source_title;
		const dataSourceOrData = data_source_s ? data_source_s : crawlerName;
		return data_source_s && source_title && source_title !== 'none'
			? `${data_source_s} - ${source_title}`
			: dataSourceOrData;
	}

	handleSortByDisplayName(a, b, order) {
		if (a.displayName.toLocaleLowerCase() > b.displayName.toLocaleLowerCase()) return order === 'ASC' ? 1 : -1;
		return order === 'ASC' ? -1 : 1;
	}

	async getAllCrawlerMeta(res, req) {
		try {
			const { limit = 10, offset = 0, order = [], where = {} } = req.body;
			const crawlerData = await this.crawlerStatus.findAndCountAll({
				raw: true,
				attributes: ['crawler_name', 'status', 'datetime'],
				where,
				offset,
				order,
				limit,
			});
			res.status(200).send({ totalCount: crawlerData.count, docs: crawlerData.rows });
		} catch (e) {
			this.logger.error(e.message, 'UXV7V01', userId);
			res.status(500).send({ error: e.message, message: 'Error retrieving last crawler meta status' });
		}
	}

	async getCrawlerMetaStatus(res, req, userId) {
		try {
			const { limit = 10, offset = 0, order = [], where = {}, cloneName = 'gamechanger' } = req.body;
			const permissions = req.permissions ? req.permissions : [];
			const filter = where?.[0]?.displayName.$iLike.replace(/%/gi, '').toLowerCase();
			let crawlerStatusList;
			let crawlerData = {};
			const info = await this.crawlerInfo.findAll({
				attributes: ['crawler', 'url_origin', 'data_source_s', 'source_title'],
			});

			crawlerStatusList = await this.crawlerStatus
				.findAll({
					attributes: ['crawler_name', 'status', 'datetime'],
					where: {
						crawler_name: {
							[Op.ne]: 'dfars_subpart_regs',
						},
					},
				})
				.then((data) => {
					return this.compileDataFromStatusTable(data, crawlerData);
				});

			const esQuery = {
				size: 0,
				aggs: {
					pubs: {
						terms: {
							size: Object.keys(crawlerData).length + 10,
							field: 'crawler_used_s',
						},
					},
				},
			};
			const { esClientName, esIndex } = this.searchUtility.getESClient(cloneName, permissions);
			const esResults = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			const docCounts = esResults?.body?.aggregations?.pubs?.buckets;

			let resp = [];

			const sort = order?.[0]?.[0];
			const sortDirection = order?.[0]?.[1];

			const crawlerList = Object.keys(crawlerStatusList);

			crawlerList.forEach((data) => {
				const dataInfo = info.find(
					(crawler) => crawler.dataValues.crawler.toLowerCase() === data.toLowerCase()
				);
				const docCount =
					docCounts.find((crawler) => crawler.key.toLowerCase() === data.toLowerCase())?.doc_count ||
					'No Documents Found';
				const displayName = this.setCrawlerDisplayName(dataInfo, data);

				const crawlerObject = {
					displayName,
					crawler_name: data,
					status: crawlerStatusList[data].status,
					datetime: crawlerStatusList[data].datetime,
					url_origin: dataInfo?.dataValues?.url_origin,
					data_source_s: dataInfo?.dataValues.data_source_s,
					source_title: dataInfo?.dataValues.source_title,
					docCount,
				};
				if (filter) {
					if (displayName.toLowerCase().includes(filter)) resp.push(crawlerObject);
				} else {
					resp.push(crawlerObject);
				}
			});
			if (sort === 'displayName') {
				resp.sort((a, b) => {
					return this.handleSortByDisplayName(a, b, sortDirection);
				});
			}

			res.status(200).send({
				totalCount: resp.length,
				docs: resp.slice(offset, offset + limit),
			});
		} catch (e) {
			this.logger.error(e.message, 'UXV7V02', userId);
			res.status(500).send({ error: e.message, message: 'Error retrieving crawler meta status' });
		}
	}

	async getLastCrawlerMetaStatus(res, req) {
		try {
			const { limit = 10, offset = 0 } = req.body;
			let crawlerStatusList;
			let crawlerData = {};
			crawlerStatusList = await this.crawlerStatus
				.findAll({
					attributes: ['crawler_name', 'status', 'datetime'],
					where: {
						status: 'Ingest Complete',
					},
				})
				.then((data) => {
					return this.compileDataFromStatusTable(data, crawlerData);
				});
			let resp = Object.keys(crawlerStatusList)
				.slice(offset, offset + limit)
				.map((data) => {
					resp.push({
						crawler_name: data,
						status: crawlerStatusList[data].status,
						datetime: crawlerStatusList[data].datetime,
					});
				});
			res.status(200).send({ totalCount: Object.keys(crawlerData).length, docs: resp });
		} catch (e) {
			this.logger.error(e.message, 'UXV7V03', userId);
			res.status(500).send({ error: e.message, message: 'Error retrieving last crawler meta status' });
		}
	}

	async getCrawlerMetadata(req, res) {
		let userId = 'webapp_unknown';
		const { option = 'all' } = req.body;
		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
			if (option === 'all') {
				return await this.getAllCrawlerMeta(res, req);
			} else if (option === 'status') {
				return await this.getCrawlerMetaStatus(res, req, userId);
			} else if (option === 'last') {
				this.getLastCrawlerMetaStatus(res, req);
			}
		} catch (e) {
			this.logger.error(e.message, 'UXV7V8R', userId);
			res.status(500).send({ error: e.message, message: 'Error retrieving crawler metadata' });
		}
	}

	async getCrawlerInfoData(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
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
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
			const orgData = await this.organizationInfo.findAll();
			res.status(200).send(orgData);
		} catch (e) {
			this.logger.error(e.message, 'VMHW263', userId);
			res.status(500).send({ error: e.message, message: 'Error retrieving organization seals' });
		}
	}

	async getDocIngestionStats(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');

			const numberOfSources = await this.crawlerInfo.count({});
			const numDocResp = await this.sequelizeGCOrchestration.query(
				'select count (*) from publications where is_revoked is false;'
			);
			const numberOfDocuments = Number(numDocResp[0][0].count);

			const yearAgo = new Date();
			yearAgo.setMonth(yearAgo.getMonth() - 11);
			yearAgo.setDate(1);
			yearAgo.setHours(0);
			yearAgo.setMinutes(0);
			yearAgo.setSeconds(0);
			yearAgo.setMilliseconds(0);

			const docsByMonthRaw = await this.documentCorpus.findAll({
				where: {
					upload_date: {
						[Op.gt]: yearAgo,
					},
				},
				attributes: [
					[Sequelize.fn('date_trunc', 'month', Sequelize.col('upload_date')), 'month'],
					[Sequelize.fn('count', '*'), 'count'],
				],
				group: 'month',
			});
			docsByMonthRaw.sort((a, b) => {
				if (a.dataValues.month > b.dataValues.month) return 1;
				return -1;
			});

			const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

			const monthsObject = {};
			docsByMonthRaw.forEach((data) => {
				monthsObject[monthNames[data.dataValues.month.getUTCMonth()]] = data.dataValues.count;
			});

			const docsByMonth = [];
			for (let i = 0; i < 12; i++) {
				let monthIndex = yearAgo.getMonth() + i;
				if (monthIndex - 12 >= 0) monthIndex -= 12;
				const month = monthNames[monthIndex];
				if (monthsObject[month]) {
					docsByMonth.push({ month, count: Number(monthsObject[month]) });
				} else {
					docsByMonth.push({ month, count: 0 });
				}
			}

			const docIngestionStats = {
				docsByMonth,
				numberOfSources,
				numberOfDocuments,
			};

			res.status(200).send(docIngestionStats);
		} catch (e) {
			this.logger.error(e.message, 'VMHW336', userId);
			res.status(500).send({ error: e.message, message: 'Error retrieving ingestion stats' });
		}
	}
}

module.exports.DataTrackerController = DataTrackerController;
