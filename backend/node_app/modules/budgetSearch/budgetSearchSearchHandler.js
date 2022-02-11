const _ = require('lodash');
const SearchUtility = require('../../utils/searchUtility');
const CONSTANTS = require('../../config/constants');
const { MLApiClient } = require('../../lib/mlApiClient');
const sparkMD5 = require('spark-md5');
const { DataLibrary } = require('../../lib/dataLibrary');
const BudgetSearchSearchUtility = require('./budgetSearchSearchUtility');

const SearchHandler = require('../base/searchHandler');

const PDOC = require('../../models').pdoc;
const RDOC = require('../../models').rdoc;
const OM = require('../../models').om;
const ACCOMP = require('../../models').accomp;
const KEYWORD = require('../../models').keyword;
const KEYWORD_ASSOC = require('../../models').keyword_assoc;
const REVIEW = require('../../models').review;
const DB = require('../../models/index');
const { result } = require('underscore');
const { Sequelize } = require('sequelize');
const { Reports } = require('../../lib/reports');



class BudgetSearchSearchHandler extends SearchHandler {
	constructor(opts = {}) {
		const {
			dataLibrary = new DataLibrary(opts),
			constants = CONSTANTS,
			mlApi = new MLApiClient(opts),
			searchUtility = new SearchUtility(opts),
			budgetSearchSearchUtility = new BudgetSearchSearchUtility(opts),
			pdoc = PDOC,
			rdoc = RDOC,
			om = OM,
			accomp = ACCOMP,
			review = REVIEW,
			db = DB,
			reports = Reports
		} = opts;

		super({ ...opts });
		this.dataLibrary = dataLibrary;
		this.constants = constants;
		this.mlApi = mlApi;
		this.searchUtility = searchUtility;
		this.budgetSearchSearchUtility = budgetSearchSearchUtility;

		this.pdocs = pdoc;
		this.rdocs = rdoc;
		this.om = om;
		this.accomp = accomp;
		this.review = review;
		this.db = db;
		this.reports = new Reports();

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
			budgetSearchSettings = {}
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

	async addKeywords(raw, dataType) {
		if (!raw || !raw.length) return raw;

		let results = [];

		let rawIds = [];
		raw.forEach((r) => {
			rawIds.push(r.id);
		});
		let assoc_query = '';
		if (dataType === 'pdoc') {
			assoc_query = `SELECT * from keyword_assoc where pdoc_id in (${rawIds})`;
		} else if (dataType === 'rdoc') {
			assoc_query = `SELECT * from keyword_assoc where rdoc_id in (${rawIds})`;
		} else if (dataType === 'om') {
			assoc_query = `SELECT * from keyword_assoc where om_id in (${rawIds})`;
		}
		let assoc_results = await KEYWORD_ASSOC.sequelize.query(assoc_query);
		assoc_results = assoc_results && assoc_results[0] ? assoc_results[0] : [];

		let lookup = {};
		let keyword_ids = [];
		assoc_results.forEach((ka) => {
			if (dataType === 'pdoc') {
				if (ka.pdoc_id) {
					if (!lookup[ka.pdoc_id]) {
						lookup[ka.pdoc_id] = [];
					}
					lookup[ka.pdoc_id].push(ka.keyword_id);
					keyword_ids.push(ka.keyword_id);
				}
			} else if (dataType === 'rdoc') {
				if (ka.rdoc_id) {
					if (!lookup[ka.rdoc_id]) {
						lookup[ka.rdoc_id] = [];
					}
					lookup[ka.rdoc_id].push(ka.keyword_id);
					keyword_ids.push(ka.keyword_id);
				}
			} else if (dataType === 'om') {
				if (ka.om_id) {
					if (!lookup[ka.om_id]) {
						lookup[ka.om_id] = [];
					}
					lookup[ka.om_id].push(ka.om_id);
					keyword_ids.push(ka.keyword_id);
				}
			}
		});

		let keyword_recs = [];
		if (keyword_ids && keyword_ids.length) {
			let keyword_query = `SELECT id, name from keyword where id in (${keyword_ids})`;
			keyword_recs = await KEYWORD.sequelize.query(keyword_query);
			keyword_recs = keyword_recs && keyword_recs[0] ? keyword_recs[0] : [];
		}

		raw.forEach((r) => {
			let result = r;
			if (lookup[r.id] && lookup[r.id].length) {
				result.keywords = [];
				lookup[r.id].forEach((keyword_id) => {
					keyword_recs.forEach((k) => {
						if (k.id === keyword_id) {
							result.keywords.push(k.name);
						}
					})
				});
			}
			results.push(result);
		})

		return results;
	}

	async addReviewData(raw, dataType) {
		if (!raw || !raw.length) return raw;

		let results = [];

		let review_query = '';
		let rawBlis = [];
		if (dataType === 'pdoc') {
			raw.forEach((r) => {
				rawBlis.push('\'' + r.budgetLineItem + '\'');
			});
			review_query = `SELECT * from review where budget_type = 'pdoc' and budget_line_item in (${rawBlis})`;
		} else if (dataType === 'rdoc') {
			raw.forEach((r) => {
				rawBlis.push('\'' + r.projectNum + '\'');
			});
			review_query = `SELECT * from review where budget_type = 'rdoc' and budget_line_item in (${rawBlis})`;
		} else if (dataType === 'om') {
			raw.forEach((r) => {
				rawBlis.push('\'' + r.line_number + '\'');
			});
			review_query = `SELECT * from review where budget_type = 'om' and budget_line_item in (${rawBlis})`;// where doc_id in (${rawIds})`;
		}

		let review_results = await REVIEW.sequelize.query(review_query);
		review_results = review_results && review_results[0] ? review_results[0] : [];

		raw.forEach((r) => {
			let result = r;
			let reviews = [];

			// don't match on budget year for now
			if (dataType === 'rdoc') {
				reviews = review_results.filter(rev => rev.budgetYear === r.BudgetYear && rev.program_element === r.programElement && rev.budget_line_item === r.projectNum);
			} else if (dataType === 'pdoc') {
				reviews = review_results.filter(rev => rev.budgetYear === r['P40-04_BudgetYear'] && rev.budget_line_item === r.budgetLineItem);
			} else if (dataType === 'om') {
				reviews = review_results.filter(rev => rev.budget_line_item === r.line_number);
			}

			if (reviews && reviews.length) {
				result.primaryReviewer = reviews[0].primary_reviewer;
				result.primaryClassLabel = reviews[0].primary_class_label;
				result.serviceReviewStatus = reviews[0].service_review_status;
			}

			results.push(result);
		})

		return results;
	}

	async documentSearch(req, userId, res) {

		try {
			const {
				offset,
				searchText,
				budgetSearchSettings,
				exportSearch
			} = req.body;

			const perms = req.permissions;

			const hasSearchText = searchText && searchText !== '';
			let limit = 18;

			let keywordIds = undefined;

			keywordIds = { pdoc: [], rdoc: [], om: [] };
			const assoc_query = `SELECT ARRAY_AGG(distinct pdoc_id) filter (where pdoc_id is not null) as pdoc_ids,
								ARRAY_AGG(distinct rdoc_id) filter (where rdoc_id is not null) as rdoc_ids,
								ARRAY_AGG(distinct om_id) filter (where om_id is not null) as om_ids FROM keyword_assoc`;
			const assoc_results = await KEYWORD_ASSOC.sequelize.query(assoc_query);
			keywordIds.pdoc = assoc_results[0][0].pdoc_ids ? assoc_results[0][0].pdoc_ids.map(i => Number(i)) : [0];
			keywordIds.rdoc = assoc_results[0][0].rdoc_ids ? assoc_results[0][0].rdoc_ids.map(i => Number(i)) : [0];
			keywordIds.om = assoc_results[0][0].om_ids ? assoc_results[0][0].om_ids.map(i => Number(i)) : [0];

			const keywordIdsParam = budgetSearchSettings.hasKeywords !== undefined && budgetSearchSettings.hasKeywords.length !== 0 ? keywordIds : null;

			const [pSelect, rSelect, oSelect] = this.budgetSearchSearchUtility.buildSelectQuery();
			const [pWhere, rWhere, oWhere] = this.budgetSearchSearchUtility.buildWhereQuery(budgetSearchSettings, hasSearchText, keywordIdsParam, perms, userId);
			const pQuery = pSelect + pWhere;
			const rQuery = rSelect + rWhere;
			const oQuery = oSelect + oWhere;

			let giantQuery = ``;

			// setting up promise.all
			if (!budgetSearchSettings.budgetType || budgetSearchSettings.budgetType.indexOf('Procurement') !== -1) {
				giantQuery = pQuery;
			}
			if (!budgetSearchSettings.budgetType || budgetSearchSettings.budgetType.indexOf('RDT&E') !== -1) {
				if (giantQuery.length === 0) {
					giantQuery = rQuery;
				} else {
					giantQuery += ` UNION ALL ` + rQuery;
				}
			}
			if (!budgetSearchSettings.budgetType || budgetSearchSettings.budgetType.indexOf('O&M') !== -1) {
				if (giantQuery.length === 0) {
					giantQuery = oQuery;
				} else {
					giantQuery += ` UNION ALL ` + oQuery;
				}
			}

			const structuredSearchText = this.searchUtility.getQueryAndSearchTerms(searchText);

			// grab counts, can be optimized with promise.all
			const totalCountQuery = `SELECT COUNT(*) FROM (` + giantQuery + `) as combinedRows;`;
			let totalCount = await this.db.jbook.query(totalCountQuery, { replacements: { searchText: structuredSearchText, offset, limit } });
			totalCount = totalCount[0][0].count;

			const queryEnd = this.budgetSearchSearchUtility.buildEndQuery(budgetSearchSettings.sort);
			giantQuery += queryEnd;

			if (!exportSearch) {
				giantQuery += ' LIMIT :limit';
			}
			giantQuery += ' OFFSET :offset;';

			let data2 = await this.db.jbook.query(giantQuery, { replacements: { searchText: structuredSearchText, offset, limit } });

			// new data combined: no need to parse because we renamed the column names in the query to match the frontend 
			let returnData = data2[0];

			// set the keywords
			returnData.map(doc => {
				const typeMap = {
					'Procurement': 'pdoc',
					'RDT&E': 'rdoc',
					'O&M': 'om'
				};
				doc.hasKeywords = keywordIds[typeMap[doc.type]].indexOf(doc.id) !== -1;
				return doc;
			});

			if (exportSearch) {
				const csvStream = await this.reports.createCsvStream({ docs: returnData }, userId);
				csvStream.pipe(res);
				res.status(200);
			}
			else {
				return {
					totalCount,
					docs: returnData
				}
			}

		} catch (e) {
			console.log(e);
			const { message } = e;
			this.logger.error(message, 'IDD6Y19', userId);
			throw e;
		}
	}

	async callFunctionHelper(req, userId) {
		const { functionName } = req.body;

		try {
			switch (functionName) {
				case 'getDataForFilters':
					return await this.getDataForFilters(req, userId);
				default:
					this.logger.error(
						`There is no function called ${functionName} defined in the budgetSearchSearchHandler`,
						'71739D8',
						userId
					);
					return {};
			}
		} catch (err) {
			console.log(err);
			const { message } = err;
			this.logger.error(message, 'D03Z7K6', userId);
			throw err;
		}


	}

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
		const odocQuer = `SELECT array_agg(DISTINCT "budget_year") as budgetYear, array_agg(DISTINCT "organization") as serviceAgency FROM om`;
		const rdocQuer = `SELECT array_agg(DISTINCT "BudgetYear") as budgetYear, array_agg(DISTINCT "Organization") as serviceAgency FROM rdoc`;

		const mainQuery = `${pdocQuery} UNION ALL ${odocQuer} UNION ALL ${rdocQuer};`

		const agencyYearData = await this.db.jbook.query(mainQuery, { replacements: {} });

		returnData.budgetYear = [];
		returnData.serviceAgency = [];

		if (agencyYearData[0].length > 0) {
			agencyYearData[0].forEach(data => {
				returnData.budgetYear = [...new Set([...returnData.budgetYear, ...data.budgetyear])];
				returnData.serviceAgency = [...new Set([...returnData.serviceAgency, ...data.serviceagency])];
			})
		}


		const serviceReviewers = Array.from(new Set([...returnData.servicereviewer, ...returnData.servicesecondaryreviewer]));

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

		return returnData;
	}

}

module.exports = BudgetSearchSearchHandler;
