const _ = require('lodash');
const SearchUtility = require('../../utils/searchUtility');
const CONSTANTS = require('../../config/constants');
// const sparkMD5 = require('spark-md5');
const { DataLibrary } = require('../../lib/dataLibrary');
const JBookSearchUtility = require('./jbookSearchUtility');
const SearchHandler = require('../base/searchHandler');
const PDOC = require('../../models').pdoc;
const RDOC = require('../../models').rdoc;
const OM = require('../../models').om;
const ACCOMP = require('../../models').accomp;
const KEYWORD = require('../../models').keyword;
const KEYWORD_ASSOC = require('../../models').keyword_assoc;
const REVIEW = require('../../models').review;
const DB = require('../../models/index');
// const { result } = require('underscore');
// const { Sequelize } = require('sequelize');
const { Reports } = require('../../lib/reports');
const ExcelJS = require('exceljs');
const moment = require('moment');

const excelStyles = {
	middleAlignment: { vertical: 'middle', horizontal: 'center' },
	leftAlignment: { vertical: 'middle', horizontal: 'left' },
	topAlignment: { vertical: 'top', horizontal: 'left' },
	yellowFill: {
		type: 'pattern',
		pattern: 'solid',
		fgColor: { argb: 'FFFF00' },
	},
	greyFill: {
		type: 'pattern',
		pattern: 'solid',
		fgColor: { argb: 'E5E5E5' },
	},
	borderAllThin: {
		top: { style: 'thin' },
		left: { style: 'thin' },
		bottom: { style: 'thin' },
		right: { style: 'thin' },
	},
	borderAllMedium: {
		top: { style: 'medium' },
		left: { style: 'medium' },
		bottom: { style: 'medium' },
		right: { style: 'medium' },
	},
};

class JBookSearchHandler extends SearchHandler {
	constructor(opts = {}) {
		const {
			dataLibrary = new DataLibrary(opts),
			constants = CONSTANTS,
			searchUtility = new SearchUtility(opts),
			jbookSearchUtility = new JBookSearchUtility(opts),
			pdoc = PDOC,
			rdoc = RDOC,
			om = OM,
			accomp = ACCOMP,
			review = REVIEW,
			db = DB,
			keyword_assoc = KEYWORD_ASSOC,
			reports = new Reports(opts),
		} = opts;

		super({ ...opts });
		this.dataLibrary = dataLibrary;
		this.constants = constants;
		this.searchUtility = searchUtility;
		this.jbookSearchUtility = jbookSearchUtility;

		this.pdocs = pdoc;
		this.rdocs = rdoc;
		this.om = om;
		this.accomp = accomp;
		this.review = review;
		this.db = db;
		this.reports = reports;
		this.keyword_assoc = keyword_assoc;
	}

	async searchHelper(req, userId, res) {
		const historyRec = {
			user_id: userId,
			clone_name: undefined,
			search: '',
			startTime: new Date().toISOString(),
			numResults: -1,
			endTime: null,
			hadError: false,
			tiny_url: '',
			cachedResult: false,
			search_version: 1,
			request_body: {},
		};

		const {
			searchText,
			searchVersion,
			cloneName,
			offset,
			showTutorial = false,
			tiny_url,
			jbookSearchSettings = {},
		} = req.body;

		try {
			historyRec.search = searchText;
			historyRec.searchText = searchText;
			historyRec.tiny_url = tiny_url;
			historyRec.clone_name = cloneName;
			historyRec.search_version = searchVersion;
			historyRec.request_body = req.body;
			historyRec.showTutorial = showTutorial;

			let searchResults;

			// search postgres
			searchResults = await this.documentSearch(req, userId, res);

			// store record in history
			try {
				const { totalCount } = searchResults;
				historyRec.endTime = new Date().toISOString();
				historyRec.numResults = totalCount;
				// await this.storeRecordOfSearchInPg(historyRec, userId);
			} catch (e) {
				this.logger.error(e.message, 'ZMVI2TO', userId);
			}

			return searchResults;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'WHMU1G2', userId);
			historyRec.endTime = new Date().toISOString();
			historyRec.hadError = true;
			// await this.storeRecordOfSearchInPg(historyRec, showTutorial);

			throw err;
		}
	}

	async documentSearch(req, userId, res, statusExport = false) {
		const { useElasticSearch = false } = req.body;

		try {
			if (useElasticSearch) {
				return this.elasticSearchDocumentSearch(req, userId, res, statusExport);
			} else {
				return this.postgresDocumentSearch(req, userId, res, statusExport);
			}
		} catch (e) {
			console.log(e);
			const { message } = e;
			this.logger.error(message, 'IDD6Y19', userId);
			throw e;
		}
	}

	async elasticSearchDocumentSearch(req, userId, res, statusExport = false) {
		try {
			const clientObj = { esClientName: 'gamechanger', esIndex: 'jbook' };
			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms(req.body);

			req.body.searchTerms = searchTerms;
			req.body.parsedQuery = parsedQuery;

			// check if there are PG filters

			const { jbookSearchSettings } = req.body;
			// clean empty options:
			Object.keys(req.body.jbookSearchSettings).forEach((key) => {
				if (
					(Array.isArray(req.body.jbookSearchSettings[key]) &&
						req.body.jbookSearchSettings[key].length === 0) ||
					req.body.jbookSearchSettings[key] === ''
				) {
					delete req.body.jbookSearchSettings[key];
				}
			});
			let pgQueryWhere = ``;
			const pgFilters = [
				'reviewStatus',
				'primaryReviewer',
				'serviceReviewer',
				'pocReviewer',
				'primaryClassLabel',
				'sourceTag',
			];
			const reviewMapping = this.jbookSearchUtility.getMapping('review', true);
			pgFilters.forEach((filter) => {
				if (jbookSearchSettings[filter] !== undefined && jbookSearchSettings[filter].length > 0) {
					console.log(filter);
					console.log(jbookSearchSettings[filter]);

					if (pgQueryWhere.length > 0) {
						pgQueryWhere += ` AND ( `;
					} else {
						pgQueryWhere += `(`;
					}
					for (let i = 0; i < jbookSearchSettings[filter].length; i++) {
						if (i > 0) {
							pgQueryWhere += ` OR `;
						}
						if (filter === 'pocReviewer') {
							pgQueryWhere += ` ${reviewMapping[filter].newName} ILIKE '%${jbookSearchSettings[filter][i]}%' `;
						} else {
							const hasNull = jbookSearchSettings[filter].includes('Blank');
							pgQueryWhere += ` ${reviewMapping[filter].newName} = '${jbookSearchSettings[filter][i]}' `;
							if (hasNull) {
								pgQueryWhere += `OR ${reviewMapping[filter].newName} = '' OR ${reviewMapping[filter].newName} IS NULL `;
							}
						}
					}
					pgQueryWhere += ` ) `;
				}
			});

			const keys = [];
			if (pgQueryWhere.length > 0) {
				try {
					let pgQuery =
						`SELECT *, CASE WHEN review_status = 'Finished Review' THEN poc_class_label WHEN review_status = 'Partial Review (POC)' THEN service_class_label ELSE primary_class_label END AS review_status FROM REVIEW WHERE ` +
						pgQueryWhere +
						`;`;
					const pgResults = await this.db.jbook.query(pgQuery, {});
					pgResults[0].forEach((review) => {
						let key;
						let leadingZeroBudgetActivity = review.budget_activity !== null ? review.budget_activity : '';
						if (leadingZeroBudgetActivity.length === 1) {
							leadingZeroBudgetActivity = 0 + leadingZeroBudgetActivity;
						}
						let numOnlyAppnNum = review.appn_num !== null ? review.appn_num.replace(/[^\d.-]/g, '') : '';
						if (review.budget_type === 'pdoc') {
							key = `pdoc#${review.budget_line_item}#${
								review.budget_year
							}#${numOnlyAppnNum}#${leadingZeroBudgetActivity}#${
								review.agency !== null ? review.agency : ''
							}`;
						} else if (review.budget_type === 'rdoc') {
							key = `rdoc#${review.program_element}#${review.budget_line_item}#${review.budget_year}#${numOnlyAppnNum}#${leadingZeroBudgetActivity}#${review.agency}`;
						} else if (review.budget_type === 'odoc') {
							key = `odoc#${review.budget_line_item}#${review.program_element}#${review.budget_year}#${numOnlyAppnNum}#${leadingZeroBudgetActivity}#${review.agency}`;
						}
						keys.push(key);
					});
				} catch (err) {
					console.log('Error querying PG for jbook ES search');
					this.logger.error(err.message, 'G4W6UNW', userId);
				}
			}

			if (pgQueryWhere.length > 0) {
				req.body.jbookSearchSettings.pgKeys = keys;
			}

			let esQuery = {};
			try {
				esQuery = this.jbookSearchUtility.getElasticSearchQueryForJBook(
					req.body,
					userId,
					this.jbookSearchUtility.getMapping('esServiceAgency', false)
				);
			} catch (e) {
				console.log('Error getting jbook search ES query');
				console.log(e);
				this.logger.error(e.message, 'SSZJ57Q', userId);
			}

			let expansionDict = {};

			if (req.body.searchText && req.body.searchText !== '') {
				expansionDict = await this.jbookSearchUtility.gatherExpansionTerms(req.body, userId);
			}

			if (Object.keys(expansionDict)[0] === 'undefined') expansionDict = {};

			let esResults = [];
			try {
				esResults = await this.dataLibrary.queryElasticSearch(
					clientObj.esClientName,
					clientObj.esIndex,
					esQuery,
					userId
				);
			} catch (e) {
				console.log('Error getting jbook search ES results');
				this.logger.error(message, 'MTQLS2N', userId);
			}

			let returnData = {};
			try {
				returnData = this.jbookSearchUtility.cleanESResults(esResults, userId);
				returnData.expansionDict = expansionDict;
			} catch (e) {}

			return returnData;
		} catch (e) {
			const { message } = e;
			console.log('Error running jbook ES doc search');
			this.logger.error(message, 'G4W6UNW', userId);
			throw e;
		}
	}

	async postgresDocumentSearch(req, userId, res, statusExport = false) {
		try {
			const { offset, searchText, jbookSearchSettings, exportSearch } = req.body;

			const perms = req.permissions;

			let expansionDict = {};

			if (searchText && searchText !== '') {
				expansionDict = await this.jbookSearchUtility.gatherExpansionTerms(req.body, userId);
			}

			if (Object.keys(expansionDict)[0] === 'undefined') expansionDict = {};

			const hasSearchText = searchText && searchText !== '';
			let limit = 18;

			let keywordIds = undefined;

			keywordIds = { pdoc: [], rdoc: [], om: [] };
			const assoc_query = `SELECT ARRAY_AGG(distinct pdoc_id) filter (where pdoc_id is not null) as pdoc_ids,
							ARRAY_AGG(distinct rdoc_id) filter (where rdoc_id is not null) as rdoc_ids,
							ARRAY_AGG(distinct om_id) filter (where om_id is not null) as om_ids FROM keyword_assoc`;
			const assoc_results = await this.keyword_assoc.sequelize.query(assoc_query);
			keywordIds.pdoc = assoc_results[0][0].pdoc_ids ? assoc_results[0][0].pdoc_ids.map((i) => Number(i)) : [0];
			keywordIds.rdoc = assoc_results[0][0].rdoc_ids ? assoc_results[0][0].rdoc_ids.map((i) => Number(i)) : [0];
			keywordIds.om = assoc_results[0][0].om_ids ? assoc_results[0][0].om_ids.map((i) => Number(i)) : [0];

			const keywordIdsParam =
				jbookSearchSettings.hasKeywords !== undefined && jbookSearchSettings.hasKeywords.length !== 0
					? keywordIds
					: null;

			const [pSelect, rSelect, oSelect] = this.jbookSearchUtility.buildSelectQuery();
			const [pWhere, rWhere, oWhere] = this.jbookSearchUtility.buildWhereQuery(
				jbookSearchSettings,
				hasSearchText,
				keywordIdsParam,
				perms,
				userId
			);
			const pQuery = pSelect + pWhere;
			const rQuery = rSelect + rWhere;
			const oQuery = oSelect + oWhere;

			let giantQuery = ``;

			// setting up promise.all
			if (!jbookSearchSettings.budgetType || jbookSearchSettings.budgetType.indexOf('Procurement') !== -1) {
				giantQuery = pQuery;
			}
			if (!jbookSearchSettings.budgetType || jbookSearchSettings.budgetType.indexOf('RDT&E') !== -1) {
				if (giantQuery.length === 0) {
					giantQuery = rQuery;
				} else {
					giantQuery += ` UNION ALL ` + rQuery;
				}
			}
			if (!jbookSearchSettings.budgetType || jbookSearchSettings.budgetType.indexOf('O&M') !== -1) {
				if (giantQuery.length === 0) {
					giantQuery = oQuery;
				} else {
					giantQuery += ` UNION ALL ` + oQuery;
				}
			}

			const structuredSearchText = this.searchUtility.getJBookPGQueryAndSearchTerms(searchText);

			// grab counts, can be optimized with promise.all
			const totalCountQuery = `SELECT COUNT(*) FROM (` + giantQuery + `) as combinedRows;`;

			let totalCount;
			try {
				totalCount = await this.db.jbook.query(totalCountQuery, {
					replacements: {
						searchText: structuredSearchText,
						offset,
						limit,
					},
				});
				totalCount = totalCount[0][0].count;
			} catch (e) {
				console.log('Error getting total count');
				console.log(e);
			}

			const queryEnd = this.jbookSearchUtility.buildEndQuery(jbookSearchSettings.sort);
			giantQuery += queryEnd;

			if (!exportSearch && !statusExport) {
				giantQuery += ' LIMIT :limit';
			}
			giantQuery += ' OFFSET :offset;';

			let data2 = await this.db.jbook.query(giantQuery, {
				replacements: {
					searchText: structuredSearchText,
					offset,
					limit,
				},
			});

			// new data combined: no need to parse because we renamed the column names in the query to match the frontend
			let returnData = data2[0];

			// set the keywords
			returnData.map((doc) => {
				const typeMap = {
					Procurement: 'pdoc',
					'RDT&E': 'rdoc',
					'O&M': 'odoc',
				};
				doc.budgetType = typeMap[doc.type];
				doc.hasKeywords = keywordIds[typeMap[doc.type]]?.indexOf(doc.id) !== -1;
				if (doc.keywords) {
					try {
						let keywords = doc.keywords.replace(/[\(\)\"]\s*/g, '');
						keywords = keywords.split(',').slice(1);
						doc.keywords = keywords;
					} catch (e) {
						console.log('Error adding keywords to doc');
						console.log(e);
					}
				}

				if (doc.contracts) {
					try {
						let contracts = doc.contracts.replace(/[\(\)]\s*/g, '');
						contracts = contracts.split('",');

						let titles = contracts[0].replace(/[\"]\s*/g, '').split('; ');
						let piids = contracts[1].replace(/[\"]\s*/g, '').split('; ');
						let fys = contracts[2].replace(/[\"]\s*/g, '').split('; ');

						let contractData = [];
						for (let i = 0; i < titles.length; i++) {
							contractData.push(`${titles[i]} ${piids[i]} ${fys[i]}`);
						}

						doc.contracts = contractData;
					} catch (e) {
						console.log('Error adding contracts to doc');
						console.log(e);
					}
				}

				if (doc.accomplishments) {
					try {
						let accomps = doc.accomplishments.replace(/[\(\)]\s*/g, '');
						accomps = accomps.split('",');

						let titles = accomps[0].replace(/[\"]\s*/g, '').split('; ');

						doc.accomplishments = titles;
					} catch (e) {
						console.log('Error adding accomplishments to doc');
						console.log(e);
					}
				}

				return doc;
			});

			if (exportSearch) {
				const csvStream = await this.reports.createCsvStream({ docs: returnData }, userId);
				csvStream.pipe(res);
				res.status(200);
			} else {
				return {
					totalCount,
					docs: returnData,
					expansionDict,
				};
			}
		} catch (e) {
			const { message } = e;
			this.logger.error(message, 'O1U2WBP', userId);
			throw e;
		}
	}

	async callFunctionHelper(req, userId, res) {
		const { functionName } = req.body;

		try {
			switch (functionName) {
				case 'getDataForFilters':
					return await this.getDataForFilters(req, userId);
				case 'getDataForReviewStatus':
					return await this.getExcelDataForReviewStatus(req, userId, res);
				case 'getDataForFullPDFExport':
					return await this.getDataForFullPDFExport(req, userId);
				default:
					this.logger.error(
						`There is no function called ${functionName} defined in the JBookSearchHandler`,
						'71739D8',
						userId
					);
					return {};
			}
		} catch (err) {
			console.log(err);
			const { message } = err;
			this.logger.error(message, 'D03Z7K7', userId);
			throw err;
		}
	}

	async getDataForFullPDFExport(req, userId) {
		try {
			const { jbookSearchSettings = { budgetYear: ['2022'] } } = req.body;
			let keywordIds = undefined;

			keywordIds = { pdoc: [], rdoc: [], om: [] };
			const assoc_query = `SELECT ARRAY_AGG(distinct pdoc_id) filter (where pdoc_id is not null) as pdoc_ids,
								ARRAY_AGG(distinct rdoc_id) filter (where rdoc_id is not null) as rdoc_ids,
								ARRAY_AGG(distinct om_id) filter (where om_id is not null) as om_ids FROM keyword_assoc`;
			const assoc_results = await this.keyword_assoc.sequelize.query(assoc_query);
			keywordIds.pdoc = assoc_results[0][0].pdoc_ids ? assoc_results[0][0].pdoc_ids.map((i) => Number(i)) : [0];
			keywordIds.rdoc = assoc_results[0][0].rdoc_ids ? assoc_results[0][0].rdoc_ids.map((i) => Number(i)) : [0];
			keywordIds.om = assoc_results[0][0].om_ids ? assoc_results[0][0].om_ids.map((i) => Number(i)) : [0];

			const keywordIdsParam =
				jbookSearchSettings.hasKeywords !== undefined && jbookSearchSettings.hasKeywords.length !== 0
					? keywordIds
					: null;

			const [pSelect, rSelect, oSelect] = this.jbookSearchUtility.buildSelectQueryForFullPDF();
			const [pWhere, rWhere, oWhere] = this.jbookSearchUtility.buildWhereQuery(
				jbookSearchSettings,
				false,
				keywordIdsParam,
				[],
				userId
			);
			const pQuery = pSelect + pWhere;
			const rQuery = rSelect + rWhere;
			const oQuery = oSelect + oWhere;
			const queryEnd = this.jbookSearchUtility.buildEndQuery([{ id: 'serviceAgency', desc: false }]);

			let giantQuery = ``;

			// setting up promise.all
			if (!jbookSearchSettings.budgetType || jbookSearchSettings.budgetType.indexOf('Procurement') !== -1) {
				giantQuery = pQuery;
			}
			if (!jbookSearchSettings.budgetType || jbookSearchSettings.budgetType.indexOf('RDT&E') !== -1) {
				if (giantQuery.length === 0) {
					giantQuery = rQuery;
				} else {
					giantQuery += ` UNION ALL ` + rQuery;
				}
			}
			if (!jbookSearchSettings.budgetType || jbookSearchSettings.budgetType.indexOf('O&M') !== -1) {
				if (giantQuery.length === 0) {
					giantQuery = oQuery;
				} else {
					giantQuery += ` UNION ALL ` + oQuery;
				}
			}

			giantQuery += ';';

			const data = await this.db.jbook.query(giantQuery, { replacements: { searchText: '' } });

			let returnData = data[0];

			returnData.map((doc) => {
				const typeMap = {
					Procurement: 'pdoc',
					'RDT&E': 'rdoc',
					'O&M': 'om',
				};
				doc.hasKeywords = keywordIds[typeMap[doc.type]].indexOf(doc.id) !== -1;
				return doc;
			});

			return returnData;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, '8', userId);
			return [];
		}
	}

	// retrieving the data used to populate the filter options on the frontend
	async getDataForFilters(req, userId) {
		let returnData = {};

		const reviewQuery = `SELECT array_agg(DISTINCT primary_reviewer) as primaryReviewer,
	       array_agg(DISTINCT service_reviewer) as serviceReviewer,
	       array_agg(DISTINCT service_secondary_reviewer) as serviceSecondaryReviewer,
	       array_agg(DISTINCT review_status) as reviewStatus,
	       array_agg(DISTINCT primary_class_label) as primaryClassLabel,
	       array_agg(DISTINCT source_tag) as sourceTag
	       FROM review`;

		const reviewData = await this.db.jbook.query(reviewQuery, { replacements: {} });

		if (reviewData[0][0]) {
			returnData = reviewData[0][0];
		}

		returnData.budgetYear = [];
		returnData.serviceAgency = [];

		const pdocQuery = `SELECT array_agg(DISTINCT "P40-04_BudgetYear") as budgetYear, array_agg(DISTINCT "P40-06_Organization") as serviceAgency FROM pdoc`;
		const odocQuery = `SELECT array_agg(DISTINCT "budget_year") as budgetYear, array_agg(DISTINCT "organization") as serviceAgency FROM om`;
		const rdocQuery = `SELECT array_agg(DISTINCT "BudgetYear") as budgetYear, array_agg(DISTINCT "Organization") as serviceAgency FROM rdoc`;

		const mainQuery = `${pdocQuery} UNION ALL ${odocQuery} UNION ALL ${rdocQuery};`;

		const agencyYearData = await this.db.jbook.query(mainQuery, { replacements: {} });

		returnData.budgetYear = [];
		returnData.serviceAgency = [];

		if (agencyYearData[0].length > 0) {
			agencyYearData[0].forEach((data) => {
				returnData.budgetYear = [
					...new Set([
						...returnData.budgetYear,
						...(data.budgetyear && data.budgetyear !== null ? data.budgetyear : []),
					]),
				];
				returnData.serviceAgency = [
					...new Set([
						...returnData.serviceAgency,
						...(data.serviceagency && data.serviceagency !== null ? data.serviceagency : []),
					]),
				];
			});
		}

		const serviceReviewers = Array.from(
			new Set([...returnData.servicereviewer, ...returnData.servicesecondaryreviewer])
		);

		// cover null index of service reviewer + service agency
		let index = serviceReviewers.indexOf('');
		if (index !== undefined) {
			serviceReviewers.splice(index, 1);
		}
		returnData.servicereviewer = serviceReviewers;

		index = returnData.serviceAgency.indexOf('');
		if (index !== undefined) {
			returnData.serviceAgency.splice(index, 1);
		}

		returnData.serviceAgency.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
		returnData.budgetYear.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
		returnData.serviceAgency.push(null);
		returnData.reviewstatus.push(null);

		returnData = await this.getESDataForFilters(returnData, userId);

		return returnData;
	}

	// retrieve data for filter options from ES
	async getESDataForFilters(returnData, userId) {
		try {
			const clientObj = { esClientName: 'gamechanger', esIndex: 'jbook' };

			// base query
			let query = {
				size: 0,
				aggs: {
					values: {
						composite: {
							sources: [],
						},
					},
				},
			};

			const processESResults = (results, field) => {
				return results.body.aggregations.values.buckets
					.map((bucket) => bucket.key[field])
					.filter((value) => value !== '');
			};

			// get budget year data
			query.aggs.values.composite.sources = [
				{
					budgetYear_s: {
						terms: {
							field: 'budgetYear_s',
						},
					},
				},
			];
			const budgetYearESResults = await this.dataLibrary.queryElasticSearch(
				clientObj.esClientName,
				clientObj.esIndex,
				query,
				userId
			);
			if (budgetYearESResults && budgetYearESResults.body.aggregations) {
				returnData.budgetYearES = processESResults(budgetYearESResults, 'budgetYear_s');
			}

			// get service agency data
			query.aggs.values.composite.sources = [
				{
					serviceAgency_s: {
						terms: {
							field: 'serviceAgency_s',
						},
					},
				},
			];
			const serviceAgencyESResults = await this.dataLibrary.queryElasticSearch(
				clientObj.esClientName,
				clientObj.esIndex,
				query,
				userId
			);

			if (serviceAgencyESResults && serviceAgencyESResults.body.aggregations) {
				const saMapping = this.jbookSearchUtility.getMapping('esServiceAgency', false);

				returnData.serviceAgencyES = processESResults(serviceAgencyESResults, 'serviceAgency_s').map(
					(sa) => saMapping[sa]
				);
			}

			// console.log(returnData);
			return returnData;
		} catch (e) {
			console.log('Error getESDataForFilters');
			this.logger.error(message, 'K318I7C', userId);
		}
	}

	async getExcelDataForReviewStatus(req, userId, res) {
		try {
			const { test = false } = req;
			const workbook = new ExcelJS.Workbook();

			const sheet = workbook.addWorksheet('Review Status', { properties: { tabColor: { argb: 'FFC0000' } } });

			sheet.columns = [
				{ width: 14 },
				{ width: 6 },
				{ width: 14 },
				{ width: 14 },
				{ width: 14 },
				{ width: 6 },
				{ width: 14 },
				{ width: 14 },
				{ width: 14 },
				{ width: 14 },
				{ width: 6 },
			];
			sheet.mergeCells('A1:A3');
			sheet.getCell('A1').value = `As of: ${moment().format('DDMMMYY')}`;
			sheet.getCell('A1:A3').fill = excelStyles.yellowFill;

			sheet.mergeCells('B1:E1');
			sheet.getCell('B1').value = 'Has AI Keywords';
			sheet.getCell('B1:E1').fill = excelStyles.greyFill;
			sheet.mergeCells('F1:J1');
			sheet.getCell('F1').value = 'Has No AI Keywords';
			sheet.getCell('F1:J1').fill = excelStyles.greyFill;

			sheet.mergeCells('C2:E2');
			sheet.getCell('C2').value = 'Review Status';
			sheet.mergeCells('G2:I2');
			sheet.getCell('G2').value = 'Review Status (JAIC 2021 Review Only)';

			[
				'A1:A3',
				'B1:E1',
				'F1:J1',
				'C2:E2',
				'G2:I2',
				'B3',
				'C3',
				'D3',
				'E3',
				'F3',
				'G3',
				'H3',
				'I3',
				'J3',
				'K3',
			].forEach((col) => {
				sheet.getCell(`${col}`).font = { bold: true };
				sheet.getCell(`${col}`).alignment = excelStyles.middleAlignment;
				sheet.getCell(`${col}`).border = excelStyles.borderAllThin;
			});

			sheet.getCell('B3').value = 'Total';
			sheet.getCell('C3').value = 'Service';
			sheet.getCell('D3').value = 'POC';
			sheet.getCell('E3').value = 'Finished';
			sheet.getCell('F3').value = 'Total';
			sheet.getCell('G3').value = 'Service';
			sheet.getCell('H3').value = 'POC';
			sheet.getCell('I3').value = 'Finished';
			sheet.getCell('J3').value = 'Other Projects';
			sheet.getCell('K3').value = 'Total';
			sheet.getCell('A4').value = 'FY22 Results';
			sheet.getCell('A5').value = 'Army';
			sheet.getCell('A6').value = 'Air Force';
			sheet.getCell('A7').value = 'Navy';
			sheet.getCell('A8').value = 'USMC';
			sheet.getCell('A9').value = 'SOCOM';
			sheet.getCell('A10').value = 'OSD';
			sheet.getCell('A11').value = 'Joint Staff';
			sheet.getCell('A12').value = 'Other Agencies';
			sheet.getCell('A13').value = 'FY21 Results';
			sheet.getCell('A14').value = 'Army';
			sheet.getCell('A15').value = 'Air Force';
			sheet.getCell('A16').value = 'Navy';
			sheet.getCell('A17').value = 'USMC';
			sheet.getCell('A18').value = 'SOCOM';
			sheet.getCell('A19').value = 'OSD';
			sheet.getCell('A20').value = 'Joint Staff';
			sheet.getCell('A21').value = 'Other Agencies';
			sheet.getCell('A22').value = 'All Results';

			sheet.mergeCells('K4:K12');
			sheet.mergeCells('B13:E13');
			sheet.mergeCells('F13:J13');
			sheet.mergeCells('K13:K21');
			sheet.mergeCells('B22:E22');
			sheet.mergeCells('F22:J22');

			sheet.getCell('B13:E13').alignment = excelStyles.leftAlignment;
			sheet.getCell('B22:E22').alignment = excelStyles.leftAlignment;
			sheet.getCell('F13:J13').alignment = excelStyles.leftAlignment;
			sheet.getCell('F22:J22').alignment = excelStyles.leftAlignment;
			sheet.getCell('K4:K12').alignment = excelStyles.topAlignment;
			sheet.getCell('K13:K21').alignment = excelStyles.topAlignment;

			[
				'A4',
				'B4',
				'C4',
				'D4',
				'E4',
				'F4',
				'G4',
				'H4',
				'I4',
				'J4',
				'K4:K12',
				'A13',
				'B13:E13',
				'F13:J13',
				'K13:K21',
				'B22:E22',
				'F22:J22',
				'K22',
				'A22',
				'J2',
			].forEach((col) => {
				sheet.getCell(`${col}`).font = { bold: true };
				sheet.getCell(`${col}`).border = excelStyles.borderAllThin;
			});

			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}5`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}6`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}7`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}8`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}9`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}10`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}11`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}12`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}14`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}15`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}16`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}17`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}18`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}19`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}20`).border = excelStyles.borderAllThin;
			});
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col) => {
				sheet.getCell(`${col}21`).border = excelStyles.borderAllThin;
			});

			const results = await this.documentSearch(
				{
					body: {
						offset: 0,
						searchText: '',
						jbookSearchSettings: {
							budgetYear: ['2022', '2021'],
						},
						exportSearch: false,
					},
				},
				userId,
				null,
				true
			);

			const counts = {
				fy22: {
					hasKeywords: {
						army: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						af: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						navy: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						usmc: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						socom: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						osd: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						js: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						other: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						total: 0,
						service: 0,
						poc: 0,
						finished: 0,
					},
					noKeywords: {
						army: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						af: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						navy: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						usmc: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						socom: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						osd: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						js: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						other: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						total: 0,
						service: 0,
						poc: 0,
						finished: 0,
					},
				},
				fy21: {
					hasKeywords: {
						army: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						af: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						navy: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						usmc: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						socom: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						osd: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						js: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						other: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						total: 0,
						service: 0,
						poc: 0,
						finished: 0,
					},
					noKeywords: {
						army: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						af: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						navy: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						usmc: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						socom: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						osd: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						js: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						other: {
							total: 0,
							service: 0,
							poc: 0,
							finished: 0,
						},
						total: 0,
						service: 0,
						poc: 0,
						finished: 0,
					},
				},
			};

			if (results && results.docs) {
				results.docs.forEach((result) => {
					let serviceKey;
					let reviewStep = 'service';
					let keywordsKey;
					let yearKey;

					switch (result.serviceAgency) {
						case 'Army':
							serviceKey = 'army';
							break;
						case 'Air Force (AF)':
							serviceKey = 'af';
							break;
						case 'Navy':
							serviceKey = 'navy';
							break;
						case 'The Joint Staff (TJS)':
							serviceKey = 'js';
							break;
						case 'United States Special Operations Command (SOCOM)':
							serviceKey = 'socom';
							break;
						case 'Office of the Secretary Of Defense (OSD)':
							serviceKey = 'osd';
							break;
						case 'US Marine Corp (USMC)':
							serviceKey = 'usmc';
							break;
						default:
							serviceKey = 'other';
							break;
					}

					if (result.primaryReviewStatus === 'Finished Review') reviewStep = 'service';
					if (result.serviceReviewStatus === 'Finished Review') reviewStep = 'poc';
					if (result.pocReviewStatus === 'Finished Review') reviewStep = 'finished';

					if (result.hasKeywords === true) {
						keywordsKey = 'hasKeywords';
					} else {
						keywordsKey = 'noKeywords';
					}

					if (result.budgetYear === '2022') {
						yearKey = 'fy22';
					} else {
						yearKey = 'fy21';
					}

					counts[yearKey][keywordsKey][serviceKey].total = counts[yearKey][keywordsKey][serviceKey].total + 1;
					counts[yearKey][keywordsKey].total = counts[yearKey][keywordsKey].total + 1;
					counts[yearKey][keywordsKey][serviceKey][reviewStep] =
						counts[yearKey][keywordsKey][serviceKey][reviewStep] + 1;
					counts[yearKey][keywordsKey][reviewStep] = counts[yearKey][keywordsKey][reviewStep] + 1;
				});
			}

			// FY22 Totals
			sheet.getCell('B4').value = counts.fy22.hasKeywords.total;
			sheet.getCell('C4').value = counts.fy22.hasKeywords.service;
			sheet.getCell('D4').value = counts.fy22.hasKeywords.poc;
			sheet.getCell('E4').value = counts.fy22.hasKeywords.finished;
			sheet.getCell('F4').value = counts.fy22.noKeywords.total;
			sheet.getCell('G4').value = counts.fy22.noKeywords.service;
			sheet.getCell('H4').value = counts.fy22.noKeywords.poc;
			sheet.getCell('I4').value = counts.fy22.noKeywords.finished;
			sheet.getCell('J4').value =
				counts.fy22.noKeywords.total -
				(counts.fy22.noKeywords.service + counts.fy22.noKeywords.poc + counts.fy22.noKeywords.finished);
			sheet.getCell('K4').value = counts.fy22.hasKeywords.total + counts.fy22.noKeywords.total;

			//FY22  Army
			sheet.getCell('B5').value = counts.fy22.hasKeywords.army.total;
			sheet.getCell('C5').value = counts.fy22.hasKeywords.army.service;
			sheet.getCell('D5').value = counts.fy22.hasKeywords.army.poc;
			sheet.getCell('E5').value = counts.fy22.hasKeywords.army.finished;
			sheet.getCell('F5').value = counts.fy22.noKeywords.army.total;
			sheet.getCell('G5').value = counts.fy22.noKeywords.army.service;
			sheet.getCell('H5').value = counts.fy22.noKeywords.army.poc;
			sheet.getCell('I5').value = counts.fy22.noKeywords.army.finished;
			sheet.getCell('J5').value =
				counts.fy22.noKeywords.army.total -
				(counts.fy22.noKeywords.army.service +
					counts.fy22.noKeywords.army.poc +
					counts.fy22.noKeywords.army.finished);

			//FY22  AF
			sheet.getCell('B6').value = counts.fy22.hasKeywords.af.total;
			sheet.getCell('C6').value = counts.fy22.hasKeywords.af.service;
			sheet.getCell('D6').value = counts.fy22.hasKeywords.af.poc;
			sheet.getCell('E6').value = counts.fy22.hasKeywords.af.finished;
			sheet.getCell('F6').value = counts.fy22.noKeywords.af.total;
			sheet.getCell('G6').value = counts.fy22.noKeywords.af.service;
			sheet.getCell('H6').value = counts.fy22.noKeywords.af.poc;
			sheet.getCell('I6').value = counts.fy22.noKeywords.af.finished;
			sheet.getCell('J6').value =
				counts.fy22.noKeywords.af.total -
				(counts.fy22.noKeywords.af.service +
					counts.fy22.noKeywords.af.poc +
					counts.fy22.noKeywords.af.finished);

			//FY22  Navy
			sheet.getCell('B7').value = counts.fy22.hasKeywords.navy.total;
			sheet.getCell('C7').value = counts.fy22.hasKeywords.navy.service;
			sheet.getCell('D7').value = counts.fy22.hasKeywords.navy.poc;
			sheet.getCell('E7').value = counts.fy22.hasKeywords.navy.finished;
			sheet.getCell('F7').value = counts.fy22.noKeywords.navy.total;
			sheet.getCell('G7').value = counts.fy22.noKeywords.navy.service;
			sheet.getCell('H7').value = counts.fy22.noKeywords.navy.poc;
			sheet.getCell('I7').value = counts.fy22.noKeywords.navy.finished;
			sheet.getCell('J7').value =
				counts.fy22.noKeywords.navy.total -
				(counts.fy22.noKeywords.navy.service +
					counts.fy22.noKeywords.navy.poc +
					counts.fy22.noKeywords.navy.finished);

			//FY22  USMC
			sheet.getCell('B8').value = counts.fy22.hasKeywords.usmc.total;
			sheet.getCell('C8').value = counts.fy22.hasKeywords.usmc.service;
			sheet.getCell('D8').value = counts.fy22.hasKeywords.usmc.poc;
			sheet.getCell('E8').value = counts.fy22.hasKeywords.usmc.finished;
			sheet.getCell('F8').value = counts.fy22.noKeywords.usmc.total;
			sheet.getCell('G8').value = counts.fy22.noKeywords.usmc.service;
			sheet.getCell('H8').value = counts.fy22.noKeywords.usmc.poc;
			sheet.getCell('I8').value = counts.fy22.noKeywords.usmc.finished;
			sheet.getCell('J8').value =
				counts.fy22.noKeywords.usmc.total -
				(counts.fy22.noKeywords.usmc.service +
					counts.fy22.noKeywords.usmc.poc +
					counts.fy22.noKeywords.usmc.finished);

			//FY22  SOCOM
			sheet.getCell('B9').value = counts.fy22.hasKeywords.socom.total;
			sheet.getCell('C9').value = counts.fy22.hasKeywords.socom.service;
			sheet.getCell('D9').value = counts.fy22.hasKeywords.socom.poc;
			sheet.getCell('E9').value = counts.fy22.hasKeywords.socom.finished;
			sheet.getCell('F9').value = counts.fy22.noKeywords.socom.total;
			sheet.getCell('G9').value = counts.fy22.noKeywords.socom.service;
			sheet.getCell('H9').value = counts.fy22.noKeywords.socom.poc;
			sheet.getCell('I9').value = counts.fy22.noKeywords.socom.finished;
			sheet.getCell('J9').value =
				counts.fy22.noKeywords.socom.total -
				(counts.fy22.noKeywords.socom.service +
					counts.fy22.noKeywords.socom.poc +
					counts.fy22.noKeywords.socom.finished);

			//FY22  OSD
			sheet.getCell('B10').value = counts.fy22.hasKeywords.osd.total;
			sheet.getCell('C10').value = counts.fy22.hasKeywords.osd.service;
			sheet.getCell('D10').value = counts.fy22.hasKeywords.osd.poc;
			sheet.getCell('E10').value = counts.fy22.hasKeywords.osd.finished;
			sheet.getCell('F10').value = counts.fy22.noKeywords.osd.total;
			sheet.getCell('G10').value = counts.fy22.noKeywords.osd.service;
			sheet.getCell('H10').value = counts.fy22.noKeywords.osd.poc;
			sheet.getCell('I10').value = counts.fy22.noKeywords.osd.finished;
			sheet.getCell('J10').value =
				counts.fy22.noKeywords.osd.total -
				(counts.fy22.noKeywords.osd.service +
					counts.fy22.noKeywords.osd.poc +
					counts.fy22.noKeywords.osd.finished);

			//FY22  JS
			sheet.getCell('B11').value = counts.fy22.hasKeywords.js.total;
			sheet.getCell('C11').value = counts.fy22.hasKeywords.js.service;
			sheet.getCell('D11').value = counts.fy22.hasKeywords.js.poc;
			sheet.getCell('E11').value = counts.fy22.hasKeywords.js.finished;
			sheet.getCell('F11').value = counts.fy22.noKeywords.js.total;
			sheet.getCell('G11').value = counts.fy22.noKeywords.js.service;
			sheet.getCell('H11').value = counts.fy22.noKeywords.js.poc;
			sheet.getCell('I11').value = counts.fy22.noKeywords.js.finished;
			sheet.getCell('J11').value =
				counts.fy22.noKeywords.js.total -
				(counts.fy22.noKeywords.js.service +
					counts.fy22.noKeywords.js.poc +
					counts.fy22.noKeywords.js.finished);

			//FY22  Other
			sheet.getCell('B12').value = counts.fy22.hasKeywords.other.total;
			sheet.getCell('C12').value = counts.fy22.hasKeywords.other.service;
			sheet.getCell('D12').value = counts.fy22.hasKeywords.other.poc;
			sheet.getCell('E12').value = counts.fy22.hasKeywords.other.finished;
			sheet.getCell('F12').value = counts.fy22.noKeywords.other.total;
			sheet.getCell('G12').value = counts.fy22.noKeywords.other.service;
			sheet.getCell('H12').value = counts.fy22.noKeywords.other.poc;
			sheet.getCell('I12').value = counts.fy22.noKeywords.other.finished;
			sheet.getCell('J12').value =
				counts.fy22.noKeywords.other.total -
				(counts.fy22.noKeywords.other.service +
					counts.fy22.noKeywords.other.poc +
					counts.fy22.noKeywords.other.finished);

			// FY21
			sheet.getCell('B13').value = counts.fy21.hasKeywords.total;
			sheet.getCell('F13').value = counts.fy21.noKeywords.total;
			sheet.getCell('K13').value = counts.fy21.noKeywords.total + counts.fy21.hasKeywords.total;
			sheet.getCell('B14').value = counts.fy21.hasKeywords.army.total;
			sheet.getCell('F14').value = counts.fy21.noKeywords.army.total;
			sheet.getCell('B15').value = counts.fy21.hasKeywords.af.total;
			sheet.getCell('F15').value = counts.fy21.noKeywords.af.total;
			sheet.getCell('B16').value = counts.fy21.hasKeywords.navy.total;
			sheet.getCell('F16').value = counts.fy21.noKeywords.navy.total;
			sheet.getCell('B17').value = counts.fy21.hasKeywords.usmc.total;
			sheet.getCell('F17').value = counts.fy21.noKeywords.usmc.total;
			sheet.getCell('B18').value = counts.fy21.hasKeywords.socom.total;
			sheet.getCell('F18').value = counts.fy21.noKeywords.socom.total;
			sheet.getCell('B19').value = counts.fy21.hasKeywords.osd.total;
			sheet.getCell('F19').value = counts.fy21.noKeywords.osd.total;
			sheet.getCell('B20').value = counts.fy21.hasKeywords.js.total;
			sheet.getCell('F20').value = counts.fy21.noKeywords.js.total;
			sheet.getCell('B21').value = counts.fy21.hasKeywords.other.total;
			sheet.getCell('F21').value = counts.fy21.noKeywords.other.total;
			sheet.getCell('B22').value = counts.fy22.hasKeywords.total + counts.fy21.hasKeywords.total;
			sheet.getCell('F22').value = counts.fy22.noKeywords.total + counts.fy21.noKeywords.total;
			sheet.getCell('K22').value = sheet.getCell('K4').value + sheet.getCell('K13').value;

			res.status(200);
			res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			res.setHeader('Content-Disposition', `attachment; filename=${'data'}.xlsx`);

			if (!test) {
				await workbook.xlsx.write(res);
				res.end();
			} else {
				// for test purposes
				return { results, counts };
			}
		} catch (e) {
			const { message } = e;
			this.logger.error(message, 'WW05F8X', userId);
			throw e;
		}
	}
}

module.exports = JBookSearchHandler;
