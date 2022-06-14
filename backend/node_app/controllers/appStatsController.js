const mysql = require('mysql');
const LOGGER = require('@dod-advana/advana-logger');
const constantsFile = require('../config/constants');
const SearchUtility = require('../utils/searchUtility');
const { DataLibrary } = require('../lib/dataLibrary');
const USER = require('../models').user;
const FEEDBACK = require('../models').feedback;
const { getUserIdFromSAMLUserId } = require('../utils/userUtility');
const { sendExcelFile } = require('../utils/sendFileUtility');
const { queryFeedbackData } = './feedbackController';
const sparkMD5Lib = require('spark-md5');
const ExcelJS = require('exceljs');

/**
 * This class queries matomo for app stats and passes
 * them back to REST requests.
 * @class AppStatsController
 */
class AppStatsController {
	constructor(opts = {}) {
		const {
			mysql_lib = mysql,
			logger = LOGGER,
			constants = constantsFile,
			searchUtility = new SearchUtility(opts),
			dataApi = new DataLibrary(opts),
			sparkMD5 = sparkMD5Lib,
			user = USER,
			feedback = FEEDBACK,
		} = opts;

		this.logger = logger;
		this.constants = constants;
		this.searchUtility = searchUtility;
		this.dataApi = dataApi;
		this.mysql = mysql_lib;
		this.sparkMD5 = sparkMD5;
		this.user = user;
		this.feedback = feedback;
		this.getAppStats = this.getAppStats.bind(this);
		this.getSearchPdfMapping = this.getSearchPdfMapping.bind(this);
		this.exportUserData = this.exportUserData.bind(this);
		this.getClones = this.getClones.bind(this);
		this.getRecentlyOpenedDocs = this.getRecentlyOpenedDocs.bind(this);
		this.getAvgSearchesPerSession = this.getAvgSearchesPerSession.bind(this);
		this.getTopSearches = this.getTopSearches.bind(this);
		this.getDateNDaysAgo = this.getDateNDaysAgo.bind(this);
		this.getDocumentUsageData = this.getDocumentUsageData.bind(this);
		this.getUserAggregations = this.getUserAggregations.bind(this);
		this.getUserLastOpened = this.getUserLastOpened.bind(this);
	}
	/**
	 *
	 * @param {Number} daysAgo
	 * @returns
	 */
	getDateNDaysAgo(daysAgo) {
		const now = new Date();
		const last = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
		let day = last.getDate();
		day = ('0' + day).slice(-2);
		let month = last.getMonth() + 1;
		month = ('0' + month).slice(-2);
		let year = last.getFullYear();
		return `${year}-${month}-${day}`;
	}
	/**
	 *
	 * @param {Number} daysAgo
	 * @returns
	 */
	async getAvgSearchesPerSession(daysAgo = 3, connection) {
		return new Promise((resolve, reject) => {
			const startDate = this.getDateNDaysAgo(daysAgo);
			connection.query(
				`select SUM(search_count)/COUNT(search_count) as avg_search_count from (select distinct idvisit, 0 as search_count
				from matomo_log_link_visit_action where idaction_name in (select idaction from matomo_log_action where name = 'GamechangerPage') 
				and server_time > ? and idvisit not in (select a.idvisit from matomo_log_link_visit_action a, matomo_log_action b, matomo_log_visit c 
					where a.idaction_name = b.idaction and a.idvisit = c.idvisit and a.search_cat like 'GAMECHANGER%' group by a.idvisit, c.user_id) 
					UNION select a.idvisit, count(a.search_cat) as search_count from matomo_log_link_visit_action a, matomo_log_action b, matomo_log_visit c 
					where a.idaction_name = b.idaction and a.idvisit = c.idvisit and c.visit_last_action_time > ? and a.search_cat like 'GAMECHANGER%' 
					group by a.idvisit, c.user_id)x;`,
				[`${startDate}`, `${startDate}`],
				(error, results, fields) => {
					if (error) {
						this.logger.error(error, '5LR23WU');
						throw error;
					}
					resolve(results[0].avg_search_count);
				}
			);
		});
	}

	/**
	 *
	 * @param {Number} daysAgo
	 * @param {Number} topN
	 * @param {Boolean} isClone
	 * @returns
	 */
	async getTopSearches(cloneData = {}, daysAgo = 3, excluding = [], blacklist = [], topN = 10, connection) {
		return new Promise((resolve, reject) => {
			let cloneNameAdd = cloneData.clone_name.toLowerCase();

			let excludeValues = ['totallyfakethisisnotrealyesiwanttomergethis'];
			let blacklistValues = [];

			let excludingString = '?,';
			if (excluding.length > 0) {
				excluding.forEach((user) => {
					excludingString += '?,';
					excludeValues.push(user);
				});
			}

			excludingString = excludingString.slice(0, -1);

			let blacklistString = 'lower(b.name) not like ';
			if (blacklist.length > 0) {
				blacklist.forEach((q) => {
					blacklistString += '? and b.name not like ';
					blacklistValues.push(`%${q.toLowerCase()}%`);
				});
			}

			blacklistString += '?';
			blacklistValues.push('%totallyfakethisisnotrealyesiwanttomergethis%');

			const startDate = this.getDateNDaysAgo(daysAgo);

			let queryValues = [];
			queryValues.push(`gamechanger_${cloneNameAdd}%`);
			queryValues.push(`${startDate}`);
			queryValues = queryValues.concat(excludeValues);
			queryValues = queryValues.concat(blacklistValues);
			queryValues.push(topN);

			const query = `select trim(lower(b.name)) as search, count(b.name) as count from matomo_log_link_visit_action a, matomo_log_action b, matomo_log_visit c where a.idaction_name = b.idaction and a.idvisit = c.idvisit and lower(search_cat) like ? and a.server_time > ? and c.user_id not in (${excludingString}) and ${blacklistString} group by b.name order by count desc limit ?;`;
			connection.query(query, queryValues, (error, results, fields) => {
				if (error) {
					this.logger.error(error, 'BAP9ZIP');
					throw error;
				}
				resolve(results);
			});
		});
	}

	htmlDecode(encodedString) {
		var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
		var translate = {
			nbsp: ' ',
			amp: '&',
			quot: '"',
			lt: '<',
			gt: '>',
		};
		return encodedString
			.replace(translate_re, function (match, entity) {
				return translate[entity];
			})
			.replace(/&#(\d+);/gi, function (match, numStr) {
				var num = parseInt(numStr, 10);
				return String.fromCharCode(num);
			});
	}

	/**
	 *
	 * @param {*} req
	 * @param {*} res
	 */
	async getAppStats(req, res) {
		let connection;
		try {
			connection = this.mysql.createConnection({
				host: this.constants.MATOMO_DB_CONFIG.host,
				user: this.constants.MATOMO_DB_CONFIG.user,
				password: this.constants.MATOMO_DB_CONFIG.password,
				database: this.constants.MATOMO_DB_CONFIG.database,
			});
			connection.connect();

			const { cloneData = {}, daysAgo = 3, internalUsers = [], blacklist = [] } = req.body;

			const results = {
				daysBack: daysAgo,
				data: {
					avgSearchesPerSession: null,
					topSearches: {
						topN: 10,
						data: null,
					},
					cloneData: cloneData,
					excluding: internalUsers,
					blacklist: blacklist,
				},
			};
			results.data.avgSearchesPerSession = await this.getAvgSearchesPerSession(3, connection);
			results.data.topSearches.data = await this.getTopSearches(
				cloneData,
				daysAgo,
				internalUsers,
				blacklist,
				10,
				connection
			);
			let cleanedTopSearches = [];
			results.data.topSearches.data.forEach((d) => {
				cleanedTopSearches.push({ search: this.htmlDecode(d.search), count: d.count });
			});
			results.data.topSearches.data = cleanedTopSearches;
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, '80ZIUHU');
			res.status(500).send(err);
		} finally {
			try {
				connection.end();
			} catch (e) {
				// do nothing
			}
		}
	}
	/**
	 * This method gets an array of PDFs opened with a timestamp and idvisit
	 * depending on how many days back
	 * @method queryPdfOpend
	 * @param {Date} startDate
	 * @returns
	 */
	async queryPdfOpend(startDate, endDate, cloneName, connection) {
		return new Promise((resolve, reject) => {
			const self = this;
			connection.query(
				`
				select 
					a.idvisit as idvisit, 
					hex(a.idvisitor) as idvisitor,
					idaction_name, 
					b.name as document, 
					CONVERT_TZ(a.server_time,'UTC','EST') as documenttime,
					DATE_FORMAT(CONVERT_TZ(a.server_time,'UTC','EST'),'%Y-%m-%d %H:%i') as documenttime_formatted
				from 
					matomo_log_link_visit_action a, 
					matomo_log_action b
				where 
					a.idaction_name = b.idaction
					and b.name like 'PDFViewer%'
					and a.server_time >= ?
					and a.server_time <= ?
				order by 
					documenttime desc,
					idvisit;`,
				[startDate, endDate],
				(error, results, fields) => {
					if (error) {
						this.logger.error(error, 'BAP9ZIP');
						throw error;
					}
					resolve(self.cleanFilePath(results));
				}
			);
		});
	}
	/**
	 * This method gets an array of the 10 most recently opened PDFS
	 * by a specific user based on userID
	 * @method queryPDFOpenedByUserId
	 * @param {String} userId
	 *
	 *
	 */
	async queryPDFOpenedByUserId(userId, connection) {
		return new Promise((resolve, reject) => {
			const self = this;
			connection.query(
				`
				select 
					b.name as document, 
					CONVERT_TZ(a.server_time,'UTC','EST') as documenttime
				from 
					matomo_log_link_visit_action a, 
					matomo_log_action b 
				where 
					a.idaction_name = b.idaction  
					and b.name like 'PDFViewer%'
					and hex(a.idvisitor) in (?)
				order by 
					documenttime desc
				limit 10`,
				[userId],
				(error, results, fields) => {
					if (error) {
						this.logger.error('No userids found', 'B07IQHT');
						resolve([]);
					} else {
						resolve(results);
					}
				}
			);
		});
	}
	/**
	 * This method gets an array of searches made with a timestamp and idvisit
	 * depending on how many days back
	 * @method querySearches
	 * @param {Date} startDate
	 * @returns
	 *
	 */
	async querySearches(startDate, endDate, cloneName, connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`
			select
				a.idvisit as idvisit,
				idaction_name,
				a.search_cat,
				b.name as value,
				CONVERT_TZ(a.server_time,'UTC','EST') as searchtime,
				DATE_FORMAT(CONVERT_TZ(a.server_time,'UTC','EST'),'%Y-%m-%d %H:%i') as searchtime_formatted,
				hex(a.idvisitor) as idvisitor,
				'Search' as action
			from
				matomo_log_link_visit_action a,
				matomo_log_action b
			where
				a.idaction_name = b.idaction
				and a.idaction_event_category = ?
				and a.server_time > ?
				and a.server_time <= ?
			order by
				idvisit,
				searchtime desc
			`,
				[cloneName, startDate, endDate],
				(error, results, fields) => {
					if (error) {
						this.logger.error(error, 'BAP9ZIP');
						throw error;
					}
					resolve(results);
				}
			);
		});
	}


	/**
	 * This method gets the visitorID tied to one userid
	 * @method getOneUserVisitorID
	 * @param {String} userID
	 * @returns
	 *
	 */
	 async getOneUserVisitorID(userID, connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`
				select 
					distinct hex(a.idvisitor) as idvisitor,
					a.user_id as user_id
				from matomo_log_visit a
				where
					a.user_id = ?
				`,
				[userID],
				(error, results, fields) => {
					if (error) {
						this.logger.error(error, 'BAP9ZIP');
						resolve([]);
					} else {
						resolve(results);
					}
				}
			);
		});
		
	}

	/**
	 * This method gets the visitorID tied all userid
	 * @method getUserVisitorID
	 * @param {String} userID
	 * @returns
	 *
	 */
	async getUserVisitorID(cloneName,  connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`
				select 
					distinct hex(a.idvisitor) as idvisitor,
					a.user_id as user_id
				from matomo_log_visit a
				where a.idvisitor in (
					select distinct idvisitor
					from matomo_log_link_visit_action
					where idaction_event_category=?
				)
				`,
				[cloneName],
				(error, results, fields) => {
					if (error) {
						this.logger.error(error, 'BAP9ZIP');
						resolve([]);
					} else {
						resolve(results);
					}
				}
			);
		});
	}

	/**
	 * This method gets an array of events made with a timestamp and idvisit
	 * depending on how many days back
	 * @method queryEvents
	 * @param {Date} startDate
	 * @returns
	 */
	async queryEvents(startDate, endDate, cloneName, connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`
				SELECT 
					llva.idvisit,
					llva.idaction_name,
					CONVERT_TZ(llva.server_time,'UTC','EST') as searchtime,
					hex(llva.idvisitor) as idvisitor,
					la_names.name as document,
					la.name as action
				FROM 
					matomo_log_link_visit_action llva,
				 	matomo_log_action as la,
				 	matomo_log_action as la_names
				WHERE llva.idaction_event_action = la.idaction
				AND llva.idaction_name = la_names.idaction
				AND (la.name LIKE 'Favorite' OR la.name LIKE 'CancelFavorite' OR la.name LIKE 'ExportDocument' OR la.name LIKE 'Highlight')
				AND llva.idaction_event_category = ?
				AND server_time >= ?
				AND server_time <= ?
			`,
				[cloneName, startDate, endDate],
				(error, results, fields) => {
					if (error) {
						this.logger.error(error, 'BAP9ZIP');
						throw error;
					}
					resolve(results);
				}
			);
		});
	}

	/**
	 * This method gets the visitorID tied to a userid
	 * @method queryClones
	 * @param {String} userID
	 * @returns
	 *
	 */
	async queryClones(connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`
			select
				distinct a.name as name,
				a.idaction as category_id
			from
				matomo_log_action a,
				matomo_log_link_visit_action b
			where a.idaction = b.idaction_event_category
			and a.name LIKE 'GAMECHANGER_%'
			`,
				(error, results, fields) => {
					if (error) {
						this.logger.error(error, 'BAP9ZIP');
						resolve([]);
					} else {
						resolve(results);
					}
				}
			);
		});
	}
	/**
	 * This method takes in options from the endpoint and queries matomo with those parameters.
	 * @param {Object} opts - This object is of the form {daysBack=3, offset=0, limit=50, filters, sorting, pageSize}
	 * @returns an array of data from Matomo.
	 */
	async querySearchPdfMapping(opts, connection) {
		const { userId } = opts;
		const searches = await this.querySearches(opts.startDate, opts.endDate, opts.cloneName, connection);
		const documents = await this.queryPdfOpend(opts.startDate, opts.endDate, opts.cloneName, connection);
		const events = await this.queryEvents(opts.startDate, opts.endDate, opts.cloneName, connection);

		const searchMap = {};
		const eventMap = {};
		const searchPdfMapping = [];

		for (let search of searches) {
			if (!searchMap[search.idvisit]) {
				searchMap[search.idvisit] = [];
			}
			search = { ...search, value: this.htmlDecode(search.value) };
			searchMap[search.idvisit].push(search);
		}
		const tempSearch = { ...searchMap };
		for (let event of events) {
			if (!eventMap[event.idvisit]) {
				eventMap[event.idvisit] = [];
			}
			if (tempSearch[event.idvisit]) {
				let i = 0;
				let search = '';
				let tempSearchList = tempSearch[event.idvisit].map((a) => a).reverse();
				while (i < tempSearchList.length && tempSearchList[i].searchtime < event.searchtime) {
					search = tempSearchList[i].value;
					i++;
				}
				event = { ...event, value: search };
			}
			if (searchMap[event.idvisit]) {
				searchMap[event.idvisit].push(event);
			}
		}
		for (let document of documents) {
			if (searchMap[document.idvisit]) {
				const idSearches = searchMap[document.idvisit];
				for (let i = 0; i < idSearches.length; i++) {
					if (idSearches[i].searchtime < document.documenttime) {
						searchPdfMapping.push({ ...document, ...idSearches[i], visited: undefined });
						searchMap[document.idvisit][i].visited = true;
						break;
					}
				}
			}
		}
		for (const [key, value] of Object.entries(searchMap)) {
			for (let search of value) {
				if (search.visited === undefined) {
					searchPdfMapping.push(search);
				}
			}
		}
		// filename mapping to titles; pulled from ES
		let filenames = searchPdfMapping.filter((item) => item.document !== undefined && item.document !== 'null');
		filenames = filenames.map((item) => item.document);
		const esQuery = this.searchUtility.getDocMetadataQuery('all', filenames);
		const esClientName = 'gamechanger';
		const esIndex = 'gamechanger';
		let esResults = await this.dataApi.queryElasticSearch(esClientName, esIndex, esQuery, userId);
		esResults = esResults.body.hits.hits;
		const filenameMap = {};
		for (const doc of esResults) {
			const item = doc._source;
			filenameMap[item.filename] = item;
		}
		for (let i = 0; i < searchPdfMapping.length; i++) {
			const doc = searchPdfMapping[i];
			const item = filenameMap[doc.document];
			if (item !== undefined) {
				if (Array.isArray(item.keyw_5)) {
					item.keyw_5 = item.keyw_5.join(', ');
				}
				searchPdfMapping[i] = { ...doc, ...item };
			} else {
				searchPdfMapping[i] = { ...doc, display_title_s: doc.document };
			}
		}
		return searchPdfMapping;
	}
	/**
	 * Looks for a property called document and replaces the
	 * file path with the file name
	 * @param {Object[]} results  where each result has result['document']
	 * @returns
	 */
	cleanFilePath(results) {
		for (let result of results) {
			let action = result['document'].replace(/^.*[\\\/]/, '').replace('PDFViewer - ', '');
			const [filename, clone_name] = action.split(' - ');
			result['document'] = filename;
			result['clone_name'] = clone_name;
		}
		return results;
	}

	/**
	 * This method is called to get a list of clones and there ids to pass into a select
	 * It first makes the connection with matomo then populates the data for the results into an excel file.
	 * @param {*} req
	 * @param {*} res
	 */
	async getClones(req, res) {
		let connection;
		try {
			connection = this.mysql.createConnection({
				host: this.constants.MATOMO_DB_CONFIG.host,
				user: this.constants.MATOMO_DB_CONFIG.user,
				password: this.constants.MATOMO_DB_CONFIG.password,
				database: this.constants.MATOMO_DB_CONFIG.database,
			});
			connection.connect();
			const clones = await this.queryClones(connection);
			res.status(200).send(clones);
		} catch (err) {
			this.logger.error(err, '12OASMZ');
			res.status(500).send(err);
		} finally {
			connection.end();
		}
	}

	/**
	 * This method is called to export Matomo data into an excel document.
	 * It first makes the connection with matomo then populates the data for the results into an excel file.
	 * @param {*} req
	 * @param {*} res
	 */
	async exportUserData(req, res) {
		const { startDate, endDate, table, daysBack } = req.query;
		const opts = { startDate, endDate, daysBack };
		const userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');

		let connection;
		try {
			connection = this.mysql.createConnection({
				host: this.constants.MATOMO_DB_CONFIG.host,
				user: this.constants.MATOMO_DB_CONFIG.user,
				password: this.constants.MATOMO_DB_CONFIG.password,
				database: this.constants.MATOMO_DB_CONFIG.database,
			});
			connection.connect();

			if (table === 'SearchPdfMapping') {
				const columns = [
					{ header: 'User ID', key: 'idvisitor' },
					{ header: 'Visit ID', key: 'idvisit' },
					{ header: 'Search Time', key: 'searchtime_formatted' },
					{ header: 'Action', key: 'action' },
					{ header: 'Search', key: 'value' },
					{ header: 'Document Opened', key: 'display_title_s' },
					{ header: 'Document Time', key: 'documenttime_formatted' },
					{ header: 'Document Type', key: 'doc_type' },
					{ header: 'Source', key: 'display_org_s' },
					{ header: 'Keywords', key: 'keyw_5' },
				];
				const excelData = await this.querySearchPdfMapping(opts, connection);
				sendExcelFile(res, 'Searches', columns, excelData);
			} else if (table === 'UserData') {
				const columns = [
					{ header: 'User ID', key: 'user_id' },
					{ header: 'Organization', key: 'org' },
					{ header: 'Document Opened', key: 'docs_opened' },
					{ header: 'Total Search', key: 'searches_made' },
					{ header: 'Last Search', key: 'last_search_formatted' },
					{ header: 'Export', key: 'ExportDocument' },
					{ header: 'Opened', key: 'opened' },
					{ header: 'Favorited', key: 'Favorite' },
				];
				const excelData = await this.queryUserAggregations(opts, connection);
				sendExcelFile(res, 'Users', columns, excelData.users);
			} else if (table === 'Feedback') {
				const columns = [
					{ header: 'Feedback Event', key: 'event_name' },
					{ header: 'User ID', key: 'user_id' },
					{ header: 'Feedback Time', key: 'createdAt' },
					{ header: 'Search', key: 'value_2' },
					{ header: 'Returned', key: 'value_1' },
				];

				const feedbackData = await this.feedback.findAndCountAll({
					limit: 100,
					offset: 0,
					order: [],
					where: {},
					attributes: [
						'event_name',
						'user_id',
						'createdAt',
						'value_1',
						'value_2',
						'value_3',
						'value_4',
						'value_5',
						'value_7',
					],
				});
				sendExcelFile(res, 'Feedback', columns, feedbackData.rows);
			} else if (table === 'DocumentUsage') {
				const columns = [
					{ header: 'Document', key: 'document' },
					{ header: 'View Count', key: 'visit_count' },
					{ header: 'Unique Viewers', key: 'user_count' },
					{ header: 'Viewer List', key: 'user_list' },
					{ header: 'Searches', key: 'searches' },
				];
				const docDate = this.getDateNDaysAgo(opts.daysBack);
				const docData = await this.createDocumentUsageData(docDate, userId, connection);
				sendExcelFile(res, 'Documents', columns, docData);
			}
		} catch (err) {
			this.logger.error(err, '11MLULU');
			res.status(500).send(err);
		} finally {
			connection.end();
		}
	}

	/**
	 * This method is called by an endpoint to query matomo for a search to document mapping.
	 * It first makes the connection with matomo then populates the data for the results.
	 * @param {*} req
	 * @param {*} res
	 */
	async getSearchPdfMapping(req, res) {
		const userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
		const { startDate, endDate, cloneName, offset = 0, filters, sorting, pageSize } = req.query;

		const opts = { startDate, endDate, cloneName, offset, filters, sorting, pageSize, userId };
		let connection;
		try {
			connection = this.mysql.createConnection({
				host: this.constants.MATOMO_DB_CONFIG.host,
				user: this.constants.MATOMO_DB_CONFIG.user,
				password: this.constants.MATOMO_DB_CONFIG.password,
				database: this.constants.MATOMO_DB_CONFIG.database,
			});
			connection.connect();
			const results = {
				daysBack: 3,
				data: [],
			};
			results.data = await this.querySearchPdfMapping(opts, connection);
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, '88ZHUHU');
			res.status(500).send(err);
		} finally {
			connection.end();
		}
	}

	/**
	 * This method is called by an endpoint to query matomo to find the most recently opened documents
	 * by a user
	 * @param {*} req
	 * @param {*} res
	 */
	async getRecentlyOpenedDocs(req, res) {
		let userId = 'Unknown';
		let connection;

		try {
			const { clone_name } = req.body;
			const userId = this.sparkMD5.hash(getUserIdFromSAMLUserId(req));
			connection = this.mysql.createConnection({
				host: this.constants.MATOMO_DB_CONFIG.host,
				user: this.constants.MATOMO_DB_CONFIG.user,
				password: this.constants.MATOMO_DB_CONFIG.password,
				database: this.constants.MATOMO_DB_CONFIG.database,
			});
			connection.connect();
			const results = await this.queryPDFOpenedByUserId([userId], connection);
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, '1CZPASK', userId);
			res.status(500).send(err);
		} finally {
			connection.end();
		}
	}

	/**
	 * This method takes in options from the endpoint and queries matomo with those parameters.
	 * @param {Object} opts - This object is of the form {daysBack=3, offset=0, limit=50, filters, sorting, pageSize}
	 * @returns an array of data from Matomo.
	 */
	async queryDocumentUsageData(startDate, connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`
				select 
					b.name as document,
					GROUP_CONCAT(distinct a.idvisit separator ', ') as idvisits,
					count(*) as visit_count,
					count(distinct a.idvisitor) as user_count,
					GROUP_CONCAT(distinct hex(a.idvisitor) separator ', ') as user_list
				from 
					matomo_log_link_visit_action a,
					matomo_log_action b
				where 
					b.name LIKE 'PDFViewer%gamechanger' 
					AND b.idaction = a.idaction_name
					and a.server_time > ?
				group by
					b.name
				order by
					visit_count DESC;`,
				[`${startDate}`],
				(error, results, fields) => {
					if (error) {
						this.logger.error(error, 'BAP9ZIP');
						throw error;
					}
					resolve(results);
				}
			);
		});
	}

	/**
	 * This method takes in options from the endpoint and queries matomo with those parameters.
	 * @param {Object} opts - This object is of the form {daysBack=3, offset=0, limit=50, filters, sorting, pageSize}
	 * @returns an array of data from Matomo.
	 */
	async getSearchesAndPdfs(startDate, connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`
			select 
				b.name as search_doc,
				a.idvisit, 
				a.server_time
			from 
				matomo_log_link_visit_action a,
				matomo_log_action b
			where 
				( b.name LIKE 'PDFViewer%gamechanger'
				OR (a.search_cat = 'GAMECHANGER_gamechanger_combined' or a.search_cat = 'GAMECHANGER_gamechanger'))
				AND b.idaction = a.idaction_name
				AND server_time > ?
			order by 
				server_time asc;`,
				[`${startDate}`],
				(error, results, fields) => {
					if (error) {
						this.logger.error(error, 'BAP9ZIP');
						throw error;
					}
					resolve(results);
				}
			);
		});
	}

	async createDocumentUsageData(startDate, userId, connection) {
		const searches = await this.getSearchesAndPdfs(startDate, connection);
		const docData = await this.queryDocumentUsageData(startDate, connection);

		// create search map, grouping searches by visit ID, ordered by time.
		const searchMap = {};
		for (let search of searches) {
			if (!searchMap[search.idvisit]) {
				searchMap[search.idvisit] = [];
			}
			searchMap[search.idvisit].push({ search_doc: search.search_doc, time: search.server_time });
		}

		// creates docMap, mapping documents to search terms. documents are mapped to the most recent search in that visitID
		const docMap = {};
		for (const [visitID, arr] of Object.entries(searchMap)) {
			let currentSearch = '';
			for (const search_doc of arr) {
				const currItem = this.htmlDecode(search_doc.search_doc);
				if (!currItem.startsWith('PDFViewer -')) {
					currentSearch = currItem;
				} else if (currentSearch !== '') {
					if (docMap[currItem] === undefined) {
						docMap[currItem] = {};
					}
					if (docMap[currItem][currentSearch] === undefined) {
						docMap[currItem][currentSearch] = 0;
					}
					docMap[currItem][currentSearch] += 1;
				}
			}
		}

		// updates docData, cleans 'PDFViewer - ' and ' - gamechanger' document name; joins all the searches + frequency into top 5
		for (const doc of docData) {
			const searches = docMap[doc.document];
			if (searches !== undefined) {
				const sortSearches = Object.keys(searches)
					.sort(function (a, b) {
						return searches[b] - searches[a];
					})
					.map((item) => item + ' (' + searches[item] + ')')
					.slice(0, 5);
				const strSearches = sortSearches.join(', ');
				doc.searches = strSearches;
			} else {
				doc.searches = '';
			}
			doc.document = doc.document.substring(12).split(' - ')[0];
		}
		// filename mapping to titles; pulled from ES
		let filenames = docData.map((item) => item.document);
		const esQuery = this.searchUtility.getDocMetadataQuery('filenames', filenames);
		const esClientName = 'gamechanger';
		const esIndex = 'gamechanger';
		let esResults = await this.dataApi.queryElasticSearch(esClientName, esIndex, esQuery, userId);
		esResults = esResults.body.hits.hits;
		const filenameMap = {};
		for (const doc of esResults) {
			const item = doc._source;
			filenameMap[item.filename] = item.display_title_s;
		}
		for (const doc of docData) {
			const title = filenameMap[doc.document];
			if (title !== undefined) {
				doc.document = title;
			}
		}
		return docData;
	}
	/**
	 * This method is called by an endpoint to query matomo to list documents, visit count, and list of users that visited.
	 * by a user
	 * @param {*} req
	 * @param {*} res
	 */
	async getDocumentUsageData(req, res) {
		let connection;
		const userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
		const { daysBack = 3, offset = 0, filters, sorting, pageSize } = req.query;
		const opts = { daysBack, offset, filters, sorting, pageSize };
		const startDate = this.getDateNDaysAgo(opts.daysBack);
		try {
			connection = this.mysql.createConnection({
				host: this.constants.MATOMO_DB_CONFIG.host,
				user: this.constants.MATOMO_DB_CONFIG.user,
				password: this.constants.MATOMO_DB_CONFIG.password,
				database: this.constants.MATOMO_DB_CONFIG.database,
			});
			connection.connect();
			const results = {
				data: [],
			};

			const docData = await this.createDocumentUsageData(startDate, userId, connection);
			results.data = docData;
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, '88ZHUHU');
			res.status(500).send(err);
		} finally {
			connection.end();
		}
	}

	/**
	 * This method takes gets user aggregated data
	 * @returns an array of data from Matomo.
	 */
	async getUserAggregationsQuery(startDate, endDate, cloneName, connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`
				select
					hex(a.idvisitor) as idvisitor,
					SUM(IF(b.name LIKE 'PDFViewer%gamechanger', 1, 0)) as docs_opened,
					SUM(IF(idaction_event_category = ?, 1, 0)) as searches_made,
					max(server_time) as last_search,
					date_format(max(server_time),'%Y-%m-%d %H:%i') as last_search_formatted
				from 
					matomo_log_link_visit_action a,
					matomo_log_action b
				where 
					(b.name LIKE 'PDFViewer%gamechanger' OR idaction_event_category = ?)
					AND b.idaction = a.idaction_name
					AND server_time >= ?
					AND server_time <= ?
				group by
					a.idvisitor;`,
				[cloneName, cloneName, startDate, endDate],
				(error, results, fields) => {
					if (error) {
						this.logger.error(error, 'BAP9ZIP');
						throw error;
					}
					resolve(results);
				}
			);
		});
	}

	/**
	 * This method gets aggregations for the cards
	 * @returns an array of data from Matomo.
	 */
	async getCardUsersAggregationQuery(startDate, endDate, cloneName, connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`
				select
					count(distinct b.user_id) as unique_users
				from
					matomo_log_action a,
					matomo_log_visit b,
					matomo_log_link_visit_action c
				where
					c.idvisitor = b.idvisitor
					AND c.idaction_name = a.idaction
					AND c.idaction_event_category = ?
					AND b.visit_last_action_time >= ?
					AND b.visit_last_action_time <= ?
				`,
				[cloneName, startDate, endDate],
				(error, results, fields) => {
					if (error) {
						this.logger.error(error, 'BAP9ZIP');
						throw error;
					}
					resolve(results);
				}
			);
		});
	}

	/**
	 * This method gets aggregations for the cards
	 * @returns an array of data from Matomo.
	 */
	async getCardSearchAggregationQuery(startDate, endDate, cloneName, connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`
				select
					count(b.name) as total_searches,
					count(distinct b.name) as unique_searches
				from 
					matomo_log_link_visit_action a,
					matomo_log_action b
				where 
					b.idaction = a.idaction_name
					AND a.idaction_event_category = ?
					AND server_time >= ?
					AND server_time <= ?
				`,
				[cloneName, startDate, endDate],
				(error, results, fields) => {
					if (error) {
						this.logger.error(error, 'BAP9ZIP');
						throw error;
					}
					resolve(results);
				}
			);
		});
	}
	/**
	 * This method takes gets user aggregated data
	 * @returns an array of data from Matomo.
	 */
	async getUserDocuments(startDate, endDate, cloneName, connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`
				select
					hex(a.idvisitor) as idvisitor,
					a.idvisit as idvisit,
					a.server_time as documenttime,
					b.name as action,
					c.name as document
				from matomo_log_link_visit_action a
				join matomo_log_action as b
				join matomo_log_action as c
				where 
					a.idaction_event_action = b.idaction
					AND a.idaction_name = c.idaction
					AND (b.name LIKE 'Favorite' OR b.name LIKE 'ExportDocument')
					and a.idaction_event_category = ?
					AND server_time >= ?
					AND server_time <= ?
				order by 
					documenttime desc,
					idvisitor;`,
				[cloneName, startDate, endDate],
				(error, results, fields) => {
					if (error) {
						this.logger.error(error, 'BAP9ZIP');
						throw error;
					}
					resolve(results);
				}
			);
		});
	}

	/**
	 * This method is called by an endpoint to query matomo to find the most recently opened documents
	 * by a user
	 * @param {*} req
	 * @param {*} res
	 */
	async getUserAggregations(req, res) {
		const userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
		const { startDate, endDate, cloneName, offset = 0, filters, sorting, pageSize } = req.query;
		const opts = { startDate, endDate, cloneName, offset, filters, sorting, pageSize };
		let connection;
		try {
			connection = this.mysql.createConnection({
				host: this.constants.MATOMO_DB_CONFIG.host,
				user: this.constants.MATOMO_DB_CONFIG.user,
				password: this.constants.MATOMO_DB_CONFIG.password,
				database: this.constants.MATOMO_DB_CONFIG.database,
			});
			connection.connect();
			const userData = await this.queryUserAggregations(opts, connection);
			res.status(200).send(userData);
		} catch (err) {
			this.logger.error(err, '1CZPASK', userId);
			res.status(500).send(err);
		} finally {
			connection.end();
		}
	}

	async queryUserAggregations(opts, connection) {
		const documentMap = {};
		const vistitIDMap = {};
		const users = await this.user.findAll();
		const visitorIDs = await this.getUserVisitorID(
			opts.cloneName,
			connection
		);
		for (let visit of visitorIDs) {
			vistitIDMap[visit.idvisitor] = visit.user_id;
		}
		console.log(vistitIDMap);
		for (let user of users) {
			documentMap[this.sparkMD5.hash(user.user_id)] = {
				opened: [],
				ExportDocument: [],
				Favorite: [],
				docs_opened: 0,
				searches_made: 0,
				// name: user.first_name + ' ' + user.last_name,
				// email: user.email,
				user_id: this.sparkMD5.hash(user.user_id),
				org: user.organization,
				last_search: null,
				last_search_formatted: '',
			};
		}

		const searches = await this.getUserAggregationsQuery(opts.startDate, opts.endDate, opts.cloneName, connection);
		const documents = await this.getUserDocuments(opts.startDate, opts.endDate, opts.cloneName, connection);
		const opened = await this.queryPdfOpend(opts.startDate, opts.endDate, opts.cloneName, connection);
		const cards = await this.getCardSearchAggregationQuery(
			opts.startDate,
			opts.endDate,
			opts.cloneName,
			connection
		);
		const userCards = await this.getCardUsersAggregationQuery(
			opts.startDate,
			opts.endDate,
			opts.cloneName,
			connection
		);
		cards[0]['unique_users'] = userCards[0]['unique_users'];
		for (let search of searches) {
			if (vistitIDMap[search.idvisitor]) {
				if(documentMap[vistitIDMap[search.idvisitor]]){
					documentMap[vistitIDMap[search.idvisitor]]['docs_opened'] =
						documentMap[vistitIDMap[search.idvisitor]]['docs_opened'] + search.docs_opened;
					documentMap[vistitIDMap[search.idvisitor]]['searches_made'] =
						documentMap[vistitIDMap[search.idvisitor]]['searches_made'] + search.searches_made;
					if (documentMap[vistitIDMap[search.idvisitor]]['last_search'] < search.last_search) {
						documentMap[vistitIDMap[search.idvisitor]]['last_search'] = search.last_search;
						documentMap[vistitIDMap[search.idvisitor]]['last_search_formatted'] = search.last_search_formatted;
					}
				}
				else{
					documentMap[vistitIDMap[search.idvisitor]]= {
						user_id: vistitIDMap[search.idvisitor],
						'docs_opened':search.docs_opened,
						'searches_made':search.searches_made,
						'last_search':search.last_search,
						'last_search_formatted':search.last_search_formatted,
						'Favorite':[],
						'ExportDocument':[],
						'opened':[]
					}
				}
			}
		}
		for (let doc of documents) {
			if (vistitIDMap[doc.idvisitor]) {
				if (
					!documentMap[vistitIDMap[doc.idvisitor]][doc.action].includes(doc.document) &&
					documentMap[vistitIDMap[doc.idvisitor]][doc.action].length < 5
				) {
					documentMap[vistitIDMap[doc.idvisitor]][doc.action].push(doc.document);
				} else {
					documentMap[vistitIDMap[doc.idvisitor]][doc.action].push(doc.document);
					documentMap[vistitIDMap[doc.idvisitor]][doc.action].shift();
				}
			}
		}
		for (let open of opened) {
			if (vistitIDMap[open.idvisitor]) {
				if (
					!documentMap[vistitIDMap[open.idvisitor]]['opened'].includes(open.document) &&
					documentMap[vistitIDMap[open.idvisitor]]['opened'].length < 5
				) {
					documentMap[vistitIDMap[open.idvisitor]]['opened'].push(open.document);
				} else {
					documentMap[vistitIDMap[open.idvisitor]]['opened'].push(open.document);
					documentMap[vistitIDMap[open.idvisitor]]['opened'].shift();
				}
			}
		}
		return { users: Object.values(documentMap), cards: cards[0] };
	}
	/**
	 *
	 * @param {*} userdID
	 */
	async getUserLastOpened(userdID) {
		let connection;
		try {
			connection = this.mysql.createConnection({
				host: this.constants.MATOMO_DB_CONFIG.host,
				user: this.constants.MATOMO_DB_CONFIG.user,
				password: this.constants.MATOMO_DB_CONFIG.password,
				database: this.constants.MATOMO_DB_CONFIG.database,
			});
			connection.connect();
			const visitorID = await this.getOneUserVisitorID(userdID, connection);
			const opened = await this.queryPDFOpenedByUserId(
				visitorID.map((x) => x.idvisitor),
				connection
			);
			return opened;
		} catch (err) {
			this.logger.error(err, '1CZPASK', userdID);
			return [];
		} finally {
			if (connection) connection.end();
		}
	}
}

module.exports.AppStatsController = AppStatsController;
