const LOGGER = require('@dod-advana/advana-logger');
const constantsFile = require('../../config/constants');
const SearchUtility = require('../../utils/searchUtility');
const Mappings = require('./jbookDataMapping');
const _ = require('underscore');
const { reviewMapping, esInnerHitFields, esTopLevelFieldsNameMapping } = require('./jbookDataMapping');
const { MLApiClient } = require('../../lib/mlApiClient');
const asyncRedisLib = require('async-redis');
const { Thesaurus } = require('../../lib/thesaurus');
const { esTopLevelFields } = require('./jbookDataMapping');
const abbreviationRedisAsyncClientDB = 9;

class JBookSearchUtility {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			constants = constantsFile,
			searchUtility = new SearchUtility(opts),
			mlApi = new MLApiClient(opts),
			redisDB = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost'),
			thesaurus = new Thesaurus(),
		} = opts;

		this.logger = logger;
		this.constants = constants;
		this.searchUtility = searchUtility;
		this.mlApi = mlApi;
		this.redisDB = redisDB;
		this.thesaurus = thesaurus;
	}

	// parse list of key : value to their frontend/db counterpart
	parseFields(data, fromFrontend, docType) {
		const newData = {};
		const mapping = this.getMapping(docType, fromFrontend);

		for (const field in data) {
			if (data[field] && data[field] !== null && Object.keys(mapping).includes(field)) {
				const newKey = mapping[field].newName;
				newData[newKey] = mapping[field].processValue(data[field]);
			} else if (data[field] && data[field] !== null) {
				newData[field] = data[field];
			}
		}

		return newData;
	}

	// map just the name of a field between frontend/db
	mapFieldName(docType, field, fromFrontend) {
		const mapping = this.getMapping(docType, fromFrontend);
		return mapping[field] ? mapping[field].newName : field;
	}

	getMapping(docType, fromFrontend) {
		try {
			let mapping;
			if (Mappings[`${docType}Mapping`]) {
				mapping = _.clone(Mappings[`${docType}Mapping`]);
			} else {
				console.log(`${docType} mapping not found`);
				return {};
			}

			if (fromFrontend) {
				let frontEndMapping = {};
				for (const field in mapping) {
					const newName = mapping[field].newName;

					if (!frontEndMapping[newName]) {
						frontEndMapping[newName] = _.clone(mapping[field]);
						frontEndMapping[newName].newName = field;
					}
				}
				return frontEndMapping;
			} else if (docType !== 'review' || docType !== 'gl') {
				mapping = {
					...mapping,
					...reviewMapping,
				};
			}

			return mapping;
		} catch (err) {
			console.log('Error retrieving jbook mapping');
			this.logger.error(err.message, 'AJTKSKQ');
		}
	}

	getDocCols(docType, totals = false, fullPDFExport = false) {
		let fields = [];
		let mapping = this.getMapping(docType, true);
		let reviewMapping = this.getMapping('review', true);

		const requiredCols = [
			'budgetType',
			'budgetYear',
			'programElement',
			'projectNum',
			'budgetLineItem',
			'projectTitle',
			'serviceAgency',
			'primaryReviewer',
			'primaryClassLabel',
			'primaryReviewStatus',
			'serviceReviewStatus',
			'pocReviewStatus',
			'reviewStatus',
			'sourceTag',
			'appropriationNumber',
			'serviceReviewer',
			'serviceSecondaryReviewer',
			'pocReviewer',
			'servicePOCName',
			'servicePOCEmail',
			'servicePOCOrg',
			'servicePOCTitle',
			'altPOCTitle',
			'altPOCName',
			'altPOCEmail',
			'altPOCOrg',
			'altPOCPhoneNumber',
			'serviceClassLabel',
			'pocClassLabel',
			// gc cards
			'projectMissionDescription',

			'allPriorYearsAmount',
			'priorYearAmount',
			'currentYearAmount',

			'budgetCycle',
			'appropriationTitle',
			'budgetActivityNumber',
			'budgetActivityTitle',

			// for class label
			'pocAgreeLabel',
			'pocClassLabel',
			'serviceAgreeLabel',
			'serviceClassLabel',
			'primaryClassLabel',
		];

		if (fullPDFExport) {
			requiredCols.push(
				'budgetActivityNumber',
				'budgetActivityTitle',
				'servicePOCPhoneNumber',
				'altPOCPhoneNumber',
				'serviceMissionPartnersList',
				'pocMissionPartnersList',
				'pocMissionPartnersChecklist',
				'serviceMissionPartnersChecklist',
				'budgetCycle',
				'pocPlannedTransitionPartner',
				'servicePlannedTransitionPartner',
				'primaryPlannedTransitionPartner',
				'appropriationTitle',
				'domainTask',
				'pocJointCapabilityArea',
				'pocJointCapabilityArea2',
				'pocJointCapabilityArea3',
				'domainTask',
				'domainTaskSecondary',
				'pocAIType',
				'pocAITypeDescription',
				'pocMPAgreeLabel'
			);
		}

		const typeMap = {
			rdoc: 'rd',
			pdoc: 'p',
			odoc: 'o',
		};

		for (const field of requiredCols) {
			if (mapping[field]) {
				// console.log(field + ' : ' + mapping[field].newName);
				if (docType === 'odoc' && field === 'priorYearAmount') {
					fields.push(
						`cast(replace(${typeMap[docType]}."${mapping[field].newName}", ',', '') as double precision) AS "${field}"`
					);
				} else {
					fields.push(`${typeMap[docType]}."${mapping[field].newName}"  AS "${field}"`);
				}
			} else if (reviewMapping[field] && !totals) {
				// console.log(field + ' : ' + mapping[field].newName)
				fields.push(`r."${reviewMapping[field].newName}" AS "${field}"`);
			} else {
				if (['allPriorYearsAmount', 'priorYearAmount', 'currentYearAmount'].includes(field)) {
					fields.push(`cast(NULL AS DOUBLE PRECISION) AS "${field}"`);
				} else {
					fields.push(`'' AS "${field}"`);
				}
			}
		}

		fields.push(`${typeMap[docType]}.id`);

		//  add type
		const typeMap2 = {
			rdoc: 'RDT&E',
			pdoc: 'Procurement',
			odoc: 'O&M',
		};
		fields.push(`'${typeMap2[docType]}' as type`);

		return fields;
	}

	buildSelectQuery() {
		// console.log(this.getDocCols('pdoc').join(', '));
		// console.log(this.getDocCols('rdoc').join(', '));
		// console.log(this.getDocCols('odoc').join(', '));

		let pQuery = `SELECT DISTINCT accomplishments, contracts, keywords, ${this.getDocCols('pdoc').join(
			', '
		)}, p.id as id FROM pdoc p LEFT JOIN (SELECT *, CASE WHEN review_status = 'Finished Review' THEN poc_class_label WHEN review_status = 'Partial Review (POC)' THEN service_class_label ELSE primary_class_label END AS search_label FROM (SELECT id, MAX(rc."updatedAt") as time FROM review rc GROUP BY id) b JOIN review d ON b.id = d.id AND b.time = d."updatedAt") r ON r."budget_type" = 'pdoc' AND p."P40-01_LI_Number" = r.budget_line_item AND p."P40-04_BudgetYear" = r."budget_year" AND p."P40-08_Appn_Number" = r."appn_num" AND p."P40-10_BA_Number" = r."budget_activity" AND p."P40-06_Organization" = r."agency" LEFT JOIN (SELECT p.id, string_agg(k.name, ', ') FROM keyword_assoc k_a JOIN pdoc p on p.id = k_a.pdoc_id JOIN keyword k on k.id = k_a.keyword_id group by p.id) keywords ON keywords.id = p.id LEFT JOIN (select string_agg(vendor_name, '; '), string_agg(piin, '; '), string_agg(fiscal_year, '; '), bli, budget_type  FROM gl_contracts group by bli, budget_type) contracts ON contracts.bli = p."P40-01_LI_Number" AND contracts.budget_type = 'pdoc' LEFT JOIN (select string_agg("Accomp_Title_text", '; '), "PE_Num", "Proj_Number", "BudgetYear" FROM rdoc_accomp group by "PE_Num", "Proj_Number", "BudgetYear") accomplishments ON accomplishments."PE_Num" = p."P40-01_LI_Number" AND accomplishments."BudgetYear" = p."P40-04_BudgetYear"`;
		let rQuery = `SELECT DISTINCT accomplishments, contracts, keywords, ${this.getDocCols('rdoc').join(
			', '
		)}, rd.id as id FROM rdoc rd LEFT JOIN (SELECT *, CASE WHEN review_status = 'Finished Review' THEN poc_class_label WHEN review_status = 'Partial Review (POC)' THEN service_class_label ELSE primary_class_label END AS search_label FROM (SELECT id, MAX(rc."updatedAt") as time FROM review rc GROUP BY id) b JOIN review d ON b.id = d.id AND b.time = d."updatedAt") r ON r."budget_type" = 'rdoc' AND rd."PE_Num" = r.program_element AND rd."Proj_Number" = r.budget_line_item AND rd."BudgetYear" = r."budget_year" AND rd."Appn_Num" = r."appn_num" AND rd."BA_Number" = r."budget_activity" AND rd."Organization" = r."agency"  LEFT JOIN (SELECT rd.id, string_agg(k.name, ', ') FROM keyword_assoc k_a JOIN rdoc rd on rd.id = k_a.rdoc_id JOIN keyword k on k.id = k_a.keyword_id group by rd.id) keywords ON keywords.id = rd.id LEFT JOIN (select string_agg(vendor_name, '; '), string_agg(piin, '; '), string_agg(fiscal_year, '; '), bli, budget_type FROM gl_contracts group by bli, budget_type) contracts ON contracts.bli = rd."PE_Num" AND contracts.budget_type = 'rdoc' LEFT JOIN (select string_agg("Accomp_Title_text", '; '), "PE_Num", "Proj_Number", "BudgetYear" FROM rdoc_accomp group by "PE_Num", "Proj_Number", "BudgetYear") accomplishments ON accomplishments."PE_Num" = rd."PE_Num" AND accomplishments."Proj_Number" = rd."Proj_Number" AND accomplishments."BudgetYear" = rd."BudgetYear"`;
		let oQuery = `SELECT DISTINCT accomplishments, contracts, keywords, ${this.getDocCols('odoc').join(
			', '
		)}, o.id as id FROM om o LEFT JOIN (SELECT *, CASE WHEN review_status = 'Finished Review' THEN poc_class_label WHEN review_status = 'Partial Review (POC)' THEN service_class_label ELSE primary_class_label END AS search_label FROM (SELECT id, MAX(rc."updatedAt") as time FROM review rc GROUP BY id) b JOIN review d ON b.id = d.id AND b.time = d."updatedAt") r ON r."budget_type" = 'odoc' AND o.line_number = r.budget_line_item AND o.sag_bli = r.program_element AND o."budget_year" = r."budget_year" AND o."line_number" is not null AND o."line_number" != '' AND o."account" = r."appn_num" AND o."budget_activity" = r."budget_activity" AND o."organization" = r."agency"  LEFT JOIN (SELECT o.id, string_agg(k.name, ', ') FROM keyword_assoc k_a JOIN om o on o.id = k_a.om_id JOIN keyword k on k.id = k_a.keyword_id group by o.id) keywords ON keywords.id = o.id LEFT JOIN (select string_agg(vendor_name, '; '), string_agg(piin, '; '), string_agg(fiscal_year, '; '), bli, budget_type FROM gl_contracts group by bli, budget_type) contracts ON contracts.bli = o."line_number" AND contracts.budget_type = 'om' LEFT JOIN (select string_agg("Accomp_Title_text", '; '), "PE_Num", "Proj_Number", "BudgetYear" FROM rdoc_accomp group by "PE_Num", "Proj_Number", "BudgetYear") accomplishments ON accomplishments."PE_Num" = o."account" AND accomplishments."Proj_Number" = o."sag_bli" AND accomplishments."BudgetYear" = o."budget_year"`;

		return [pQuery, rQuery, oQuery];
	}

	buildSelectQueryForFullPDF() {
		// console.log(this.getDocCols('pdoc').join(', '));
		// console.log(this.getDocCols('rdoc').join(', '));
		// console.log(this.getDocCols('odoc').join(', '));

		let pQuery = `SELECT DISTINCT ${this.getDocCols('pdoc', false, true).join(
			', '
		)}, p.id as id, keywords.keywords_arr as keywords, accomp.accomp as accomp FROM pdoc p LEFT JOIN (SELECT *, CASE WHEN review_status = 'Finished Review' THEN poc_class_label WHEN review_status = 'Partial Review (POC)' THEN service_class_label ELSE primary_class_label END AS search_label FROM (SELECT id, MAX(rc."updatedAt") as time FROM review rc GROUP BY id) b JOIN review d ON b.id = d.id AND b.time = d."updatedAt") r ON r."budget_type" = 'pdoc' AND p."P40-01_LI_Number" = r.budget_line_item AND p."P40-04_BudgetYear" = r."budget_year" AND p."P40-08_Appn_Number" = r."appn_num" AND p."P40-10_BA_Number" = r."budget_activity" AND p."P40-06_Organization" = r."agency" LEFT JOIN (SELECT p.id as id, ARRAY_AGG(k.name) as keywords_arr FROM keyword_assoc k_a JOIN pdoc p ON p.id = k_a.pdoc_id JOIN keyword k ON k.id = k_a.keyword_id GROUP BY p.id) keywords ON keywords.id = p.id LEFT JOIN (SELECT p.id as id, ARRAY_AGG("Accomp_Title_text") as accomp FROM rdoc_accomp rda JOIN pdoc p ON '' = rda."PE_Num" AND '' = rda."Proj_Number" AND p."P40-04_BudgetYear" = rda."BudgetYear" GROUP BY p.id) accomp ON accomp.id = p.id`;
		let rQuery = `SELECT DISTINCT ${this.getDocCols('rdoc', false, true).join(
			', '
		)}, rd.id as id, keywords.keywords_arr as keywords, accomp.accomp as accomp FROM rdoc rd LEFT JOIN (SELECT *, CASE WHEN review_status = 'Finished Review' THEN poc_class_label WHEN review_status = 'Partial Review (POC)' THEN service_class_label ELSE primary_class_label END AS search_label FROM (SELECT id, MAX(rc."updatedAt") as time FROM review rc GROUP BY id) b JOIN review d ON b.id = d.id AND b.time = d."updatedAt") r ON r."budget_type" = 'rdoc' AND  rd."PE_Num" = r.program_element AND rd."Proj_Number" = r.budget_line_item AND rd."BudgetYear" = r."budget_year" AND rd."Appn_Num" = r."appn_num" AND rd."BA_Number" = r."budget_activity" AND rd."Organization" = r."agency" LEFT JOIN (SELECT rd.id as id, ARRAY_AGG(k.name) as keywords_arr FROM keyword_assoc k_a JOIN rdoc rd ON rd.id = k_a.rdoc_id JOIN keyword k ON k.id = k_a.keyword_id GROUP BY rd.id) keywords ON keywords.id = rd.id LEFT JOIN (SELECT rd.id as id, ARRAY_AGG("Accomp_Title_text") as accomp FROM rdoc_accomp rda JOIN rdoc rd ON rd."PE_Num" = rda."PE_Num" AND rd."Proj_Number" = rda."Proj_Number" AND rd."BudgetYear" = rda."BudgetYear" GROUP BY rd.id) accomp ON accomp.id = rd.id`;
		let oQuery = `SELECT DISTINCT ${this.getDocCols('odoc', false, true).join(
			', '
		)}, o.id as id, keywords.keywords_arr as keywords, accomp.accomp as accomp FROM om o LEFT JOIN (SELECT *, CASE WHEN review_status = 'Finished Review' THEN poc_class_label WHEN review_status = 'Partial Review (POC)' THEN service_class_label ELSE primary_class_label END AS search_label FROM (SELECT id, MAX(rc."updatedAt") as time FROM review rc GROUP BY id) b JOIN review d ON b.id = d.id AND b.time = d."updatedAt") r ON r."budget_type" = 'odoc' AND o.line_number = r.budget_line_item AND o.sag_bli = r.program_element AND o."budget_year" = r."budget_year"  AND o."line_number" is not null AND o."line_number" != '' AND o."account" = r."appn_num" AND o."budget_activity" = r."budget_activity" AND o."organization" = r."agency" LEFT JOIN (SELECT o.id as id, ARRAY_AGG(k.name) as keywords_arr FROM keyword_assoc k_a JOIN om o ON o.id = k_a.om_id JOIN keyword k ON k.id = k_a.keyword_id GROUP BY o.id) keywords ON keywords.id = o.id LEFT JOIN (SELECT om.id as id, ARRAY_AGG("Accomp_Title_text") as accomp FROM rdoc_accomp rda JOIN om om ON om."account" = rda."PE_Num" AND om."sag_bli" = rda."Proj_Number" AND om."budget_year" = rda."BudgetYear" GROUP BY om.id) accomp ON accomp.id = o.id`;

		return [pQuery, rQuery, oQuery];
	}

	buildWhereQuery(jbookSearchSettings, hasSearchText, keywordIds, perms, userId) {
		let pQueryFilter = `"P40-01_LI_Number" is not null AND "P40-01_LI_Number" != '' AND "P40-02_LI_Title" is not null AND "P40-02_LI_Title" != ''`;
		let rQueryFilter = `rd."PE_Num" is not null AND rd."PE_Num" != '' AND rd."Proj_Number" is not null AND rd."Proj_Number" != '' AND rd."Proj_Title" is not null AND rd."Proj_Title" != ''`;
		let oQueryFilter = `"account" is not null AND "account" != '' AND "account_title" is not null AND "account_title" != '' AND "budget_activity_title" is not null AND "budget_activity_title" != ''`;

		const pDocSearchQueryArray = Mappings['pdocSearchMapping'].map((pdocSearchText) => {
			return `"${pdocSearchText}" @@ to_tsquery('english', :searchText)`;
		});
		const rDocSearchQueryArray = Mappings['rdocSearchMapping'].map((rdocSearchText) => {
			return `"${rdocSearchText}" @@ to_tsquery('english', :searchText)`;
		});
		const oDocSearchQueryArray = Mappings['odocSearchMapping'].map((odocSearchText) => {
			return `"${odocSearchText}" @@ to_tsquery('english', :searchText)`;
		});

		let pQuery = hasSearchText
			? ` WHERE ( ${pDocSearchQueryArray.join(' OR ')} AND ${pQueryFilter} )`
			: ` WHERE ${pQueryFilter}`;
		let rQuery = hasSearchText
			? ` WHERE ( ${rDocSearchQueryArray.join(' OR ')} AND ${rQueryFilter} )`
			: ` WHERE ${rQueryFilter}`;
		let oQuery = hasSearchText
			? ` WHERE ( ${oDocSearchQueryArray.join(' OR ')} AND ${oQueryFilter} )`
			: ` WHERE ${oQueryFilter}`;

		if (keywordIds) {
			let queryText = 'IN';
			if (jbookSearchSettings.hasKeywords && jbookSearchSettings.hasKeywords.indexOf('No') !== -1) {
				queryText = 'NOT ' + queryText;
			}
			pQuery += ` AND p."${this.mapFieldName('pdoc', 'id', true)}" ${queryText} (${keywordIds['pdoc'].join(
				', '
			)})`;
			rQuery += ` AND rd."${this.mapFieldName('rdoc', 'id', true)}" ${queryText} (${keywordIds['rdoc'].join(
				', '
			)})`;
			oQuery += ` AND o."${this.mapFieldName('odoc', 'id', true)}" ${queryText} (${keywordIds['om'].join(', ')})`;
		}

		for (const setting in jbookSearchSettings) {
			switch (setting) {
				case 'reviewStatus':
					if (
						jbookSearchSettings[setting] &&
						Array.isArray(jbookSearchSettings[setting]) &&
						jbookSearchSettings[setting].length > 1
					) {
						const reviewString = `('${jbookSearchSettings[setting].join("', '")}')`;
						const hasNull = jbookSearchSettings[setting].includes('Blank');
						if (hasNull) {
							pQuery += ` AND (r.review_status IN ${reviewString} OR r.review_status = '' OR r.review_status IS NULL)`;
							rQuery += ` AND (r.review_status IN ${reviewString} OR r.review_status = '' OR r.review_status IS NULL)`;
							oQuery += ` AND (r.review_status IN ${reviewString} OR r.review_status = '' OR r.review_status IS NULL)`;
						} else {
							pQuery += ` AND r.review_status IN ${reviewString}`;
							rQuery += ` AND r.review_status IN ${reviewString}`;
							oQuery += ` AND r.review_status IN ${reviewString}`;
						}
					} else if (
						jbookSearchSettings[setting] &&
						Array.isArray(jbookSearchSettings[setting]) &&
						jbookSearchSettings[setting].length === 1
					) {
						const searchString = jbookSearchSettings[setting][0];
						const hasNull = searchString === 'Blank';
						pQuery += ` AND ${
							hasNull ? `r.review_status IS NULL` : `r.review_status = '${jbookSearchSettings[setting]}'`
						}`;
						rQuery += ` AND ${
							hasNull ? `r.review_status IS NULL` : `r.review_status = '${jbookSearchSettings[setting]}'`
						}`;
						oQuery += ` AND ${
							hasNull ? `r.review_status IS NULL` : `r.review_status = '${jbookSearchSettings[setting]}'`
						}`;
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += ` AND r.review_status = '${jbookSearchSettings[setting]}'`;
						rQuery += ` AND r.review_status = '${jbookSearchSettings[setting]}'`;
						oQuery += ` AND r.review_status = '${jbookSearchSettings[setting]}'`;
					}
					break;
				// review-specific filters
				case 'primaryClassLabel':
					if (
						jbookSearchSettings[setting] &&
						Array.isArray(jbookSearchSettings[setting]) &&
						jbookSearchSettings[setting].length > 0
					) {
						const fieldString = `('${jbookSearchSettings[setting].join("', '")}')`;
						const hasNull = jbookSearchSettings[setting].includes('Blank');
						if (hasNull) {
							pQuery += ` AND (r."search_label" IN ${fieldString} OR r."search_label" = '' OR r."search_label" IS NULL)`;
							rQuery += ` AND (r."search_label" IN ${fieldString} OR r."search_label" = '' OR r."search_label" IS NULL)`;
							oQuery += ` AND (r."search_label" IN ${fieldString} OR r."search_label" = '' OR r."search_label" IS NULL)`;
						} else {
							pQuery += ` AND r."search_label" IN ${fieldString}`;
							rQuery += ` AND r."search_label" IN ${fieldString}`;
							oQuery += ` AND r."search_label" IN ${fieldString}`;
						}
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += ` AND r."search_label" ILIKE '%${jbookSearchSettings[setting]}%'`;
						rQuery += ` AND r."search_label" ILIKE '%${jbookSearchSettings[setting]}%'`;
						oQuery += ` AND r."search_label" ILIKE '%${jbookSearchSettings[setting]}%'`;
					}
					break;
				case 'serviceReviewer':
					if (
						jbookSearchSettings[setting] &&
						Array.isArray(jbookSearchSettings[setting]) &&
						jbookSearchSettings[setting].length > 0
					) {
						const fieldString = `('${jbookSearchSettings[setting].join("', '")}')`;
						const hasNull = jbookSearchSettings[setting].includes('Blank');
						if (hasNull) {
							pQuery += ` AND (r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
							rQuery += ` AND (r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
							oQuery += ` AND (r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;

							pQuery += ` AND (r."${this.mapFieldName(
								'review',
								'serviceSecondaryReviewer',
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								'serviceSecondaryReviewer',
								true
							)}" = '' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IS NULL)`;
							rQuery += ` AND (r."${this.mapFieldName(
								'review',
								'serviceSecondaryReviewer',
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								'serviceSecondaryReviewer',
								true
							)}" = '' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IS NULL)`;
							oQuery += ` AND (r."${this.mapFieldName(
								'review',
								'serviceSecondaryReviewer',
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								'serviceSecondaryReviewer',
								true
							)}" = '' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IS NULL)`;
						} else {
							pQuery += ` AND (r."${this.mapFieldName(
								'review',
								'serviceReviewer',
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								'serviceSecondaryReviewer',
								true
							)}" IN ${fieldString})`;
							rQuery += ` AND (r."${this.mapFieldName(
								'review',
								'serviceReviewer',
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								'serviceSecondaryReviewer',
								true
							)}" IN ${fieldString})`;
							oQuery += ` AND (r."${this.mapFieldName(
								'review',
								'serviceReviewer',
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								'serviceSecondaryReviewer',
								true
							)}" IN ${fieldString})`;
						}
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += ` AND (r."${this.mapFieldName('review', 'serviceReviewer', true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%')`;
						rQuery += ` AND (r."${this.mapFieldName('review', 'serviceReviewer', true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%')`;
						oQuery += ` AND (r."${this.mapFieldName('review', 'serviceReviewer', true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%')`;
					}
					break;
				case 'pocReviewer':
					if (
						jbookSearchSettings[setting] &&
						Array.isArray(jbookSearchSettings[setting]) &&
						jbookSearchSettings[setting].length > 0
					) {
						const fieldString = `('${jbookSearchSettings[setting].join("', '")}')`;
						const hasNull = jbookSearchSettings[setting].includes('Blank');
						if (hasNull) {
							pQuery += ` AND (r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
							rQuery += ` AND (r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
							oQuery += ` AND (r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
						} else {
							pQuery += ` AND (r."${this.mapFieldName(
								'review',
								'servicePOCName',
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								'altPOCName',
								true
							)}" IN ${fieldString})`;
							rQuery += ` AND (r."${this.mapFieldName(
								'review',
								'servicePOCName',
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								'altPOCName',
								true
							)}" IN ${fieldString})`;
							oQuery += ` AND (r."${this.mapFieldName(
								'review',
								'servicePOCName',
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								'altPOCName',
								true
							)}" IN ${fieldString})`;
						}
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += ` AND (r."${this.mapFieldName('review', 'servicePOCName', true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%' OR r."${this.mapFieldName('review', 'altPOCName', true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%')`;
						rQuery += ` AND (r."${this.mapFieldName('review', 'servicePOCName', true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%' OR r."${this.mapFieldName('review', 'altPOCName', true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%')`;
						oQuery += ` AND (r."${this.mapFieldName('review', 'servicePOCName', true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%' OR r."${this.mapFieldName('review', 'altPOCName', true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%')`;
					}
					break;
				case 'sourceTag':
				case 'primaryReviewer':
					if (
						jbookSearchSettings[setting] &&
						Array.isArray(jbookSearchSettings[setting]) &&
						jbookSearchSettings[setting].length > 0
					) {
						const fieldString = `('${jbookSearchSettings[setting].join("', '")}')`;
						const hasNull = jbookSearchSettings[setting].includes('Blank');
						if (hasNull) {
							pQuery += ` AND (r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
							rQuery += ` AND (r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
							oQuery += ` AND (r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" IN ${fieldString} OR r."${this.mapFieldName(
								'review',
								setting,
								true
							)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
						} else {
							pQuery += ` AND r."${this.mapFieldName('review', setting, true)}" IN ${fieldString}`;
							rQuery += ` AND r."${this.mapFieldName('review', setting, true)}" IN ${fieldString}`;
							oQuery += ` AND r."${this.mapFieldName('review', setting, true)}" IN ${fieldString}`;
						}
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += ` AND r."${this.mapFieldName('review', setting, true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%'`;
						rQuery += ` AND r."${this.mapFieldName('review', setting, true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%'`;
						oQuery += ` AND r."${this.mapFieldName('review', setting, true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%'`;
					}
					break;
				case 'serviceAgency':
				case 'budgetYear':
					if (
						jbookSearchSettings[setting] &&
						Array.isArray(jbookSearchSettings[setting]) &&
						jbookSearchSettings[setting].length > 0
					) {
						const yearString = `('${jbookSearchSettings[setting].join("', '")}')`;
						const hasNull = jbookSearchSettings[setting].includes('Blank');
						if (hasNull) {
							pQuery += ` AND (p."${this.mapFieldName(
								'pdoc',
								setting,
								true
							)}" IN ${yearString} OR p."${this.mapFieldName(
								'pdoc',
								setting,
								true
							)}" = '' OR p."${this.mapFieldName('pdoc', setting, true)}" IS NULL )`;
							rQuery += ` AND (rd."${this.mapFieldName(
								'rdoc',
								setting,
								true
							)}" IN ${yearString} OR rd."${this.mapFieldName(
								'rdoc',
								setting,
								true
							)}" = '' OR rd."${this.mapFieldName('rdoc', setting, true)}" IS NULL)`;
							oQuery += ` AND (o."${this.mapFieldName(
								'odoc',
								setting,
								true
							)}" IN ${yearString} OR o."${this.mapFieldName(
								'odoc',
								setting,
								true
							)}" = '' OR o."${this.mapFieldName('odoc', setting, true)}" IS NULL)`;
						} else {
							pQuery += ` AND p."${this.mapFieldName('pdoc', setting, true)}" IN ${yearString}`;
							rQuery += ` AND rd."${this.mapFieldName('rdoc', setting, true)}" IN ${yearString}`;
							oQuery += ` AND o."${this.mapFieldName('odoc', setting, true)}" IN ${yearString}`;
						}
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += ` AND p."${this.mapFieldName('pdoc', setting, true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%'`;
						rQuery += ` AND rd."${this.mapFieldName('rdoc', setting, true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%'`;
						oQuery += ` AND o."${this.mapFieldName('odoc', setting, true)}" ILIKE '%${
							jbookSearchSettings[setting]
						}%'`;
					}
					break;
				case 'programElement':
					pQuery += ` AND p."P40-01_LI_Number" ILIKE '%${jbookSearchSettings[setting]}%'`;
					rQuery += ` AND rd."${this.mapFieldName('rdoc', setting, true)}" ILIKE '%${
						jbookSearchSettings[setting]
					}%'`;
					oQuery += ` AND (o."${this.mapFieldName('odoc', 'programElement', true)}" ILIKE '%${
						jbookSearchSettings[setting]
					}%' OR o."${this.mapFieldName('odoc', 'budgetLineItem', true)}" ILIKE '%${
						jbookSearchSettings[setting]
					}%')`;
					break;
				case 'projectNum':
					pQuery += ` AND p."P40-01_LI_Number" ILIKE 'THIS IS HERE TO MAKE SURE YOU DONT GET RESULTS'`;
					rQuery += ` AND rd."${this.mapFieldName('rdoc', setting, true)}" ILIKE '%${
						jbookSearchSettings[setting]
					}%'`;
					oQuery += ` AND o."${this.mapFieldName('odoc', setting, true)}" ILIKE '%${
						jbookSearchSettings[setting]
					}%'`;
					break;
				case 'projectTitle':
					pQuery += ` AND p."${this.mapFieldName('pdoc', setting, true)}" ILIKE '%${
						jbookSearchSettings[setting]
					}%'`;
					rQuery += ` AND rd."${this.mapFieldName('rdoc', setting, true)}" ILIKE '%${
						jbookSearchSettings[setting]
					}%'`;
					oQuery += ` AND o."${this.mapFieldName('odoc', setting, true)}" ILIKE '%${
						jbookSearchSettings[setting]
					}%'`;
					break;
				default:
					break;
			}
		}

		return [pQuery, rQuery, oQuery];
	}

	buildWhereQueryForUserDash(jbookSearchSettings) {
		let pQueryFilter = `"P40-01_LI_Number" is not null AND "P40-01_LI_Number" != '' AND "P40-02_LI_Title" is not null AND "P40-02_LI_Title" != ''`;
		let rQueryFilter = `rd."PE_Num" is not null AND rd."PE_Num" != '' AND rd."Proj_Number" is not null AND rd."Proj_Number" != '' AND rd."Proj_Title" is not null AND rd."Proj_Title" != ''`;
		let oQueryFilter = `"account" is not null AND "account" != '' AND "account_title" is not null AND "account_title" != '' AND "budget_activity_title" is not null AND "budget_activity_title" != ''`;

		const useAND = Object.keys(jbookSearchSettings).length > 1;

		let pQuery = ` WHERE ${pQueryFilter}${useAND ? ' AND (' : ''}`;
		let rQuery = ` WHERE ${rQueryFilter}${useAND ? ' AND (' : ''}`;
		let oQuery = ` WHERE ${oQueryFilter}${useAND ? ' AND (' : ''}`;

		Object.keys(jbookSearchSettings).forEach((setting, i) => {
			switch (setting) {
				case 'primaryReviewerForUserDash':
					if (
						jbookSearchSettings[setting] &&
						Array.isArray(jbookSearchSettings[setting]) &&
						jbookSearchSettings[setting].length > 0
					) {
						const fieldString = `('${jbookSearchSettings[setting].join("', '")}')`;
						pQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}r."${this.mapFieldName(
							'review',
							'primaryReviewer',
							true
						)}" IN ${fieldString}`;
						rQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}r."${this.mapFieldName(
							'review',
							'primaryReviewer',
							true
						)}" IN ${fieldString}`;
						oQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}r."${this.mapFieldName(
							'review',
							'primaryReviewer',
							true
						)}" IN ${fieldString}`;
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}r."${this.mapFieldName(
							'review',
							'primaryReviewer',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
						rQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}r."${this.mapFieldName(
							'review',
							'primaryReviewer',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
						oQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}r."${this.mapFieldName(
							'review',
							'primaryReviewer',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
					}
					break;
				case 'serviceReviewerForUserDash':
					if (
						jbookSearchSettings[setting] &&
						Array.isArray(jbookSearchSettings[setting]) &&
						jbookSearchSettings[setting].length > 0
					) {
						const fieldString = `('${jbookSearchSettings[setting].join("', '")}')`;
						pQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}(r."${this.mapFieldName(
							'review',
							'serviceReviewer',
							true
						)}" IN ${fieldString} OR r."${this.mapFieldName(
							'review',
							'serviceSecondaryReviewer',
							true
						)}" IN ${fieldString})`;
						rQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}(r."${this.mapFieldName(
							'review',
							'serviceReviewer',
							true
						)}" IN ${fieldString} OR r."${this.mapFieldName(
							'review',
							'serviceSecondaryReviewer',
							true
						)}" IN ${fieldString})`;
						oQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}(r."${this.mapFieldName(
							'review',
							'serviceReviewer',
							true
						)}" IN ${fieldString} OR r."${this.mapFieldName(
							'review',
							'serviceSecondaryReviewer',
							true
						)}" IN ${fieldString})`;
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}(r."${this.mapFieldName(
							'review',
							'serviceReviewer',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName(
							'review',
							'serviceSecondaryReviewer',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
						rQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}(r."${this.mapFieldName(
							'review',
							'serviceReviewer',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName(
							'review',
							'serviceSecondaryReviewer',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
						oQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}(r."${this.mapFieldName(
							'review',
							'serviceReviewer',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName(
							'review',
							'serviceSecondaryReviewer',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
					}
					break;
				case 'pocReviewerEmailForUserDash':
					if (
						jbookSearchSettings[setting] &&
						Array.isArray(jbookSearchSettings[setting]) &&
						jbookSearchSettings[setting].length > 0
					) {
						const fieldString = `('${jbookSearchSettings[setting].join("', '")}')`;
						pQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}(r."${this.mapFieldName(
							'review',
							'servicePOCEmail',
							true
						)}" IN ${fieldString} OR r."${this.mapFieldName(
							'review',
							'altPOCEmail',
							true
						)}" IN ${fieldString})`;
						rQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}(r."${this.mapFieldName(
							'review',
							'servicePOCEmail',
							true
						)}" IN ${fieldString} OR r."${this.mapFieldName(
							'review',
							'altPOCEmail',
							true
						)}" IN ${fieldString})`;
						oQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}(r."${this.mapFieldName(
							'review',
							'servicePOCEmail',
							true
						)}" IN ${fieldString} OR r."${this.mapFieldName(
							'review',
							'altPOCEmail',
							true
						)}" IN ${fieldString})`;
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}(r."${this.mapFieldName(
							'review',
							'servicePOCEmail',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName(
							'review',
							'altPOCEmail',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
						rQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}(r."${this.mapFieldName(
							'review',
							'servicePOCEmail',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName(
							'review',
							'altPOCEmail',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
						oQuery += `${useAND ? (i > 0 ? ' OR ' : '') : ' AND '}(r."${this.mapFieldName(
							'review',
							'servicePOCEmail',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName(
							'review',
							'altPOCEmail',
							true
						)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
					}
					break;
				default:
					break;
			}
		});

		if (Object.keys(jbookSearchSettings).length > 1) {
			pQuery += ')';
			rQuery += ')';
			oQuery += ')';
		}

		return [pQuery, rQuery, oQuery];
	}

	buildStatusUpdateWhereQuery(year = '2022') {
		let pQueryFilter = `"P40-01_LI_Number" is not null AND "P40-01_LI_Number" != '' AND "P40-02_LI_Title" is not null AND "P40-02_LI_Title" != ''`;
		let rQueryFilter = `"PE_Num" is not null AND "PE_Num" != '' AND "Proj_Number" is not null AND "Proj_Number" != '' AND "Proj_Title" is not null AND "Proj_Title" != ''`;
		let oQueryFilter = `"account" is not null AND "account" != '' AND "account_title" is not null AND "account_title" != '' AND "budget_activity_title" is not null AND "budget_activity_title" != ''`;

		let pQuery = ` WHERE ${pQueryFilter} AND r."primary_reviewer" IS NOT NULL AND r."primary_reviewer" != '' AND r."primary_reviewer" != 'Unknown' AND r."budget_year" = '${year}'`;
		let rQuery = ` WHERE ${rQueryFilter} AND r."primary_reviewer" IS NOT NULL AND r."primary_reviewer" != '' AND r."primary_reviewer" != 'Unknown' AND r."budget_year" = '${year}'`;
		let oQuery = ` WHERE ${oQueryFilter} AND r."primary_reviewer" IS NOT NULL AND r."primary_reviewer" != '' AND r."primary_reviewer" != 'Unknown' AND r."budget_year" = '${year}'`;

		return [pQuery, rQuery, oQuery];
	}

	buildEndQuery(sort) {
		let newQuery = '';
		if (sort && sort.length) {
			if (sort[0].id === 'serviceReviewer') {
				newQuery += ` ORDER BY "serviceSecondaryReviewer" ${sort[0].desc ? 'DESC' : 'ASC'}, "serviceReviewer" ${
					sort[0].desc ? 'DESC' : 'ASC'
				}`;
			}
			if (sort[0].id === 'pocReviewer') {
				newQuery += ` ORDER BY "altPOCName" ${sort[0].desc ? 'DESC' : 'ASC'}, "servicePOCName" ${
					sort[0].desc ? 'DESC' : 'ASC'
				}`;
			} else {
				newQuery += ` ORDER BY "${sort[0].id}" ${sort[0].desc ? 'DESC' : 'ASC'}`;
			}
		}
		return newQuery;
	}

	async gatherExpansionTerms(body, userId) {
		const { searchText } = body;

		try {
			const [parsedQuery, termsArray] = this.searchUtility.getEsSearchTerms({ searchText });
			let expansionDict = await this.mlApiExpansion(termsArray, false, userId);
			let [synonyms, text] = this.thesaurusExpansion(searchText, termsArray);
			const cleanedAbbreviations = await this.abbreviationCleaner(termsArray);
			expansionDict = this.searchUtility.combineExpansionTerms(
				expansionDict,
				synonyms,
				[],
				termsArray[0],
				cleanedAbbreviations,
				userId
			);
			return expansionDict;
		} catch (e) {
			this.logger.error(e.message, 'IEPGRAZ');
			return {};
		}
	}

	async mlApiExpansion(termsArray, forCacheReload, userId) {
		let expansionDict = {};
		try {
			expansionDict = await this.mlApi.getExpandedSearchTerms(termsArray, userId, 'jbook');
		} catch (e) {
			// log error and move on, expansions are not required
			if (forCacheReload) {
				throw Error('Cannot get expanded search terms in cache reload');
			}
			this.logger.error(
				'DETECTED ERROR: Cannot get expanded search terms, continuing with search',
				'LH48NHI',
				userId
			);
		}
		return expansionDict;
	}

	async abbreviationCleaner(termsArray) {
		// get expanded abbreviations
		await this.redisDB.select(abbreviationRedisAsyncClientDB);
		let abbreviationExpansions = [];
		let i = 0;
		for (i = 0; i < termsArray.length; i++) {
			let term = termsArray[i];
			let upperTerm = term.toUpperCase().replace(/['"]+/g, '');
			let expandedTerm = await this.redisDB.get(upperTerm);
			let lowerTerm = term.toLowerCase().replace(/['"]+/g, '');
			let compressedTerm = await this.redisDB.get(lowerTerm);
			if (expandedTerm) {
				if (!abbreviationExpansions.includes('"' + expandedTerm.toLowerCase() + '"')) {
					abbreviationExpansions.push('"' + expandedTerm.toLowerCase() + '"');
				}
			}
			if (compressedTerm) {
				if (!abbreviationExpansions.includes('"' + compressedTerm.toLowerCase() + '"')) {
					abbreviationExpansions.push('"' + compressedTerm.toLowerCase() + '"');
				}
			}
		}

		// removing abbreviations of expanded terms (so if someone has "dod" AND "department of defense" in the search, it won't show either in expanded terms)
		let cleanedAbbreviations = [];
		abbreviationExpansions.forEach((abb) => {
			let cleaned = abb.toLowerCase().replace(/['"]+/g, '');
			let found = false;
			termsArray.forEach((term) => {
				if (term.toLowerCase().replace(/['"]+/g, '') === cleaned) {
					found = true;
				}
			});
			if (!found) {
				cleanedAbbreviations.push(abb);
			}
		});
		return cleanedAbbreviations;
	}

	thesaurusExpansion(searchText, termsArray) {
		let lookUpTerm = searchText.replace(/\"/g, '');
		let useText = true;
		let synList = [];
		if (termsArray && termsArray.length && termsArray[0]) {
			useText = false;
			for (var term in termsArray) {
				lookUpTerm = termsArray[term].replace(/\"/g, '');
				const synonyms = this.thesaurus.lookUp(lookUpTerm);
				if (synonyms && synonyms.length > 1) {
					synList = synList.concat(synonyms.slice(0, 2));
				}
			}
		}
		//const synonyms = thesaurus.lookUp(lookUpTerm);
		let text = searchText;
		if (!useText && termsArray && termsArray.length && termsArray[0]) {
			text = termsArray[0];
		}
		return [synList, text];
	}

	cleanESResults(esResults, userId) {
		const results = [];

		try {
			let searchResults = { totalCount: 0, docs: [] };

			const { body = {} } = esResults;
			const { aggregations = {} } = body;
			const { service_agency_aggs = {} } = aggregations;
			const service_buckets = service_agency_aggs.buckets ? service_agency_aggs.buckets : [];
			const { hits: esHits = {} } = body;
			const {
				hits = [],
				total: { value },
			} = esHits;

			searchResults.totalCount = value;
			searchResults.serviceAgencyCounts = service_buckets;

			const agencyMapping = this.getMapping('esServiceAgency', false);

			hits.forEach((hit) => {
				let result = this.transformEsFields(hit._source);

				result.hasKeywords = result.keywords && result.keywords.length > 0;
				if (result.hasKeywords) {
					result.keywords = result.keywords.map((keyword) => {
						return keyword.keyword_s;
					});
				}
				result.serviceAgency = agencyMapping[result.serviceAgency] || result.serviceAgency;

				result.pageHits = [];

				if (hit.inner_hits) {
					Object.keys(hit.inner_hits).forEach((hitKey) => {
						hit.inner_hits[hitKey].hits.hits.forEach((innerHit) => {
							Object.keys(innerHit.highlight).forEach((highlightKey) => {
								result.pageHits.push({
									title: esTopLevelFieldsNameMapping[hitKey],
									snippet: innerHit.highlight[highlightKey][0],
								});
							});
						});
					});
				}

				if (hit.highlight) {
					Object.keys(hit.highlight).forEach((hitKey) => {
						result.pageHits.push({
							title: esTopLevelFieldsNameMapping[hitKey],
							snippet: hit.highlight[hitKey][0],
						});
					});
				}

				switch (result.budgetType) {
					case 'rdte':
						result.budgetType = 'rdoc';
						break;
					case 'om':
						result.budgetType = 'odoc';
						break;
					case 'procurement':
						result.budgetType = 'pdoc';
						break;
					default:
						break;
				}

				results.push(result);
			});

			searchResults.docs = results;

			return searchResults;
		} catch (e) {
			const { message } = e;
			this.logger.error(message, '8V1IZLH', userId);
			return results;
		}
	}

	transformEsFields(raw) {
		let result = {};
		const arrayFields = ['keyword_n'];

		esInnerHitFields.forEach((innerField) => {
			arrayFields.push(innerField.path);
		});

		const mapping = this.getMapping('elasticSearch', false);

		for (let key in raw) {
			let newKey = key;
			if (Object.keys(mapping).includes(key)) {
				newKey = mapping[key].newName;
			}

			if (
				(raw[key] && raw[key][0]) ||
				Number.isInteger(raw[key]) ||
				(typeof raw[key] === 'object' && raw[key] !== null)
			) {
				if (arrayFields.includes(key)) {
					result[newKey] = raw[key];
				} else if (Array.isArray(raw[key])) {
					result[newKey] = raw[key][0];
				} else {
					result[newKey] = raw[key];
				}
			} else {
				result[newKey] = null;
			}
		}
		return result;
	}

	getJCAData() {
		return {
			'Force Support  (FS)': {
				'Force Management': [
					'Global Force Management',
					'Force Configuration',
					'Global Defense Posture Extraction',
					'Readiness Reporting',
					'Human Capital Management',
				],
				'Force Preparation': [
					'Training',
					'Exercising',
					'Education',
					'Doctrine',
					'Lessons Learned',
					'Concepts',
					'Experimentation',
				],
				'Building Partnerships': [
					'Engage Partners',
					'Manage Partnership Agreements',
					'Conduct Security Cooperation Activities',
					'Conduct Civil-Military Operations',
				],
			},
			'Battlespace Awareness (aka INTEL)': {
				'Planning & Direction': [
					'Define & Prioritize Requirements',
					'Develop Plans & Strategies',
					'Task & Monitor Resources',
				],
				Collection: [
					'Signals Collection',
					'Imagery Collection',
					'Human-based Collection',
					'Open Source Collection',
				],
				'Processing & Exploitation': ['Processing', 'Exploitation', 'Report Generation'],
				'Analysis, Estimation, & Production': [
					'Integration',
					'Evaluation',
					'Intepretation',
					'Estimation',
					'Product Generation',
				],
				'BA Dissemination & Integration': ['BA Data Transmission', 'BA Data Access'],
				'Counterintelligence (CI)': ['Offensive CI', 'Investigations'],
			},
			'Force Application (FA)': {
				Maneuver: ['Air', 'Space', 'Land', 'Maritime', 'Cyberspace', 'Cyberspace'],
				Fires: ['Kinetic', 'Electromagnetic', 'Information'],
			},
			'Logistics (LOG)': {
				'Deployment & Distribution': ['Force Deployment', 'Force Sustainment'],
				Supply: [
					'Supplies & Equipment Management',
					'Inventory Management',
					'Global Supplier Networks Management',
				],
				Maintenance: ['Inspect', 'Test', 'Service', 'Repair', 'Rebuild', 'Calibrate', 'Reclaim'],
				'Logistics Services': [
					'Food Services',
					'Water & Ice Services',
					'Contingency Base Services',
					'Hygiene Services',
					'Mortuary Affairs',
				],
				'Operational Contract Support': ['Contract Support Integration', 'Contractor Management'],
				Engineering: ['General Engineering', 'Combat Engineering', 'Geospatial Engineering'],
				'Base & Installation Support': ['Real Property Life Cycle Management', 'Installation Services'],
				'Health Services': ['Operational Medicine', 'Health Services Delivery'],
			},
			'Command & Control (C2)': {
				Organize: [
					'Establish & Maintain Unity of Effort with Mission Partners',
					'Structure Organization to Mission',
					'Foster Organizational Collaboration',
				],
				Understand: [
					'Organize Information',
					'Develop Knowledge & Situational Awareness',
					'Share Knowledge & Situational Awareness',
				],
				Plan: [
					'Analyze Problem',
					'Apply Situational Understanding',
					'Develop Strategy',
					'Develop Courses of Action',
					'Analyze Courses of Action',
				],
				Decide: ['Manage Risk', 'Select Actions', 'Establish Rule Sets', 'Establish Intent & Guidance'],
				Direct: ['Communicate Intent & Guidance', 'Task', 'Establish Metrics'],
				Monitor: [
					'Assess Compliance with Guidance',
					'Assess Effects',
					'Assess Achievement of Objectives',
					'Assess Guidance',
				],
			},
			'Communications & Computers': {
				'Information Transport': ['Wired Transmission', 'Wireless Transmission', 'Switching & Routing'],
				'Network Management': [
					'Optimized Network Functions & Resources',
					'Deployable, Scalable, & Modular Networks',
					'Spectrum Management',
				],
				Cybersecurity: [
					'Information Exchange Security',
					'Networks Protection',
					'Data Protection',
					'Identity & Access Management',
					'Application Security',
					'Cyberspace Survivability',
				],
				'Defensive Cyberspace Operations (Internal Defensive Measures)': ['Cyberspace Defense'],
				'Enterprise Services': [
					'Information Sharing',
					'Computing Services',
					'Common Enterprises Services',
					'Positioning, Navigation & Timing',
				],
			},
			Protection: {
				Prevention: [
					'Concealment/Stealth',
					'Countering Weapons of Mass Destruction',
					'Counter Air & Missile',
					'Physical Security',
				],
				Mitigation: [
					'Explosive',
					'Projectile',
					'Chemical',
					'Biological',
					'Radiological',
					'Nuclear',
					'Electromagnetic Effects',
					'Directed Energy',
					'Natural Hazards',
				],
				Recovery: ['CBRN Response', 'Maritime Counter-Mine'],
			},
			'Corporate Management & Support': {
				'Advisory & Compliance': [
					'Legal Advice',
					'Legislative Advice',
					'Audit, Inspection, & Investigation',
					'Personnel Security Investigations & Clearance Certification',
					'Operational Test & Evaluation',
				],
				'Strategic Management': [
					'Strategy Development',
					'Capability Development',
					'Performance Management',
					'Enterprise Risk Management',
					'Studies & Analyses',
					'Enterprise Architecture',
				],
				'Information Management': [],
				'Acquisition & Technology': [
					'Research',
					'Advanced Technology',
					'Developmental Engineering',
					'Acquisition Management',
				],
				'Financial Management': ['Programming & Budgeting', 'Accounting & Finance'],
			},
		};
	}

	getElasticSearchJBookDataFromId({ docIds }, userId) {
		try {
			return {
				track_total_hits: true,
				size: 100,
				query: {
					bool: {
						must: {
							terms: { key_review_s: docIds },
						},
					},
				},
			};
		} catch (err) {
			this.logger.error(err, '1F07MYM', userId);
		}
	}

	// creates the ES query for jbook search
	getElasticSearchQueryForJBook(
		{ searchText = '', parsedQuery, offset, limit, jbookSearchSettings, operator = 'and' },
		userId
	) {
		let query = {};
		try {
			const isVerbatimSearch = this.searchUtility.isVerbatim(searchText);
			const plainQuery = isVerbatimSearch ? parsedQuery.replace(/["']/g, '') : parsedQuery;

			query = {
				track_total_hits: true,
				from: offset,
				size: limit,
				aggregations: {
					service_agency_aggs: {
						terms: {
							field: 'serviceAgency_s',
							size: 10000,
						},
					},
				},
				query: {
					bool: {
						must: [],
						should: [
							{
								multi_match: {
									query: `${parsedQuery}`,
									fields: esTopLevelFields,
									type: 'best_fields',
									operator: `${operator}`,
								},
							},
						],
					},
				},
				highlight: {
					fields: {},
				},
			};

			if (jbookSearchSettings.pgKeys !== undefined) {
				query.query.must.push({ terms: { key_review_s: jbookSearchSettings.pgKeys } });
			}

			esTopLevelFields.forEach((field) => {
				query.highlight.fields[field] = {};
			});

			esInnerHitFields.forEach((innerField) => {
				const nested = {
					nested: {
						path: innerField.path,
						inner_hits: {
							_source: false,
							highlight: {
								fields: {},
							},
						},
						query: {
							bool: {
								should: [
									{
										multi_match: {
											query: `${parsedQuery}`,
											fields: innerField.fields,
											type: 'best_fields',
											operator: `${operator}`,
										},
									},
								],
							},
						},
					},
				};

				innerField.fields.forEach((field) => {
					nested.nested.inner_hits.highlight.fields[field] = {};
				});
				query.query.bool.should.push(nested);
			});

			const wildcardList = {
				type_s: 1,
				key_s: 1,
				projectTitle_t: 1,
				projectNum_s: 6,
				programElementTitle_t: 1,
				serviceAgency_s: 2,
				appropriationTitle_t: 1,
				appropriationNumber_s: 6,
				budgetActivityTitle_t: 6,
				budgetActivityTitle_s: 6,
				programElement_s: 6,
				accountTitle_s: 1,
				budgetLineItemTitle_s: 1,
				budgetLineItem_s: 6,
			};

			Object.keys(wildcardList).forEach((wildCardKey) => {
				query.query.bool.should.push({
					wildcard: {
						[wildCardKey]: {
							value: `*${plainQuery}*`,
							boost: wildcardList[wildCardKey],
						},
					},
				});
			});

			// ES FILTERS
			let filterQueries = this.getJbookESFilters(jbookSearchSettings, serviceAgencyMappings);

			if (filterQueries.length > 0) {
				query.query.bool.filter = filterQueries;
			}

			// SORT
			switch (jbookSearchSettings.sort[0].id) {
				case 'budgetYear':
					query.sort = [{ budgetYear_s: { order: jbookSearchSettings.sort[0].desc ? 'desc' : 'asc' } }];
					break;
				case 'programElement':
					query.sort = [{ programElement_s: { order: jbookSearchSettings.sort[0].desc ? 'desc' : 'asc' } }];
					break;
				case 'projectNum':
					query.sort = [{ projectNum_s: { order: jbookSearchSettings.sort[0].desc ? 'desc' : 'asc' } }];
					break;
				case 'projectTitle':
					query.sort = [{ projectTitle_s: { order: jbookSearchSettings.sort[0].desc ? 'desc' : 'asc' } }];
					break;
				case 'serviceAgency':
					query.sort = [{ serviceAgency_s: { order: jbookSearchSettings.sort[0].desc ? 'desc' : 'asc' } }];
					break;
				default:
					break;
			}

			return query;
		} catch (e) {
			console.log('Error making ES query for jbook');
			this.logger.error(e.message, 'IEPGRAZ91', userId);
			return query;
		}
	}

	// creates the portions of the ES query for filtering based on jbookSearchSettings
	// 'filter' instead of 'must' should ignore scoring, and do a hard include/exclude of results
	getJbookESFilters(jbookSearchSettings, serviceAgencyMappings) {
		let filterQueries = [];
		try {
			if (jbookSearchSettings) {
				// Budget Type filter
				if (jbookSearchSettings.budgetType) {
					const budgetTypesTemp = [];

					jbookSearchSettings.budgetType.forEach((budgetType) => {
						switch (budgetType) {
							case 'RDT&E':
								budgetTypesTemp.push('rdte');
								break;
							case 'O&M':
								budgetTypesTemp.push('om');
								break;
							case 'Procurement':
								budgetTypesTemp.push('procurement');
								break;
							default:
								break;
						}
					});

					filterQueries.push({
						terms: {
							type_s: budgetTypesTemp,
						},
					});
				}

				// Budget Year filter
				if (jbookSearchSettings.budgetYear) {
					filterQueries.push({
						terms: {
							budgetYear_s: jbookSearchSettings.budgetYear,
						},
					});
				}

				// Program Element / BLI filter
				if (jbookSearchSettings.programElement) {
					filterQueries.push({
						query_string: {
							query: `*${jbookSearchSettings.programElement}`,
							default_field: 'budgetLineItem_s',
						},
					});
				}

				// Project Number filter (doesn't appear in kibana)
				if (jbookSearchSettings.projectNum) {
					filterQueries.push({
						query_string: {
							query: `*${jbookSearchSettings.projectNum}`,
							default_field: 'projectNum_s',
						},
					});
				}

				// Service Agency filter
				if (jbookSearchSettings.serviceAgency) {
					const convertedAgencies = [];

					jbookSearchSettings.serviceAgency.forEach((agency) => {
						console.log(agency);
						Object.keys(serviceAgencyMappings).forEach((agencyKey) => {
							if (serviceAgencyMappings[agencyKey] === agency) {
								convertedAgencies.push(agencyKey);
							}
						});
					});

					filterQueries.push({
						terms: {
							serviceAgency_s: convertedAgencies,
						},
					});
				}
			}
		} catch (e) {
			console.log('Error applying Jbook ES filters');
			this.logger.error(e.message, 'IEPGRAZ9');
			return filterQueries;
		}

		return filterQueries;
	}
}

module.exports = JBookSearchUtility;
