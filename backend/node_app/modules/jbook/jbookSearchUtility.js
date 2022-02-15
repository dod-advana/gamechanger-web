const LOGGER = require('@dod-advana/advana-logger');
const constantsFile = require('../../config/constants');
const SearchUtility = require('../../utils/searchUtility');
const Mappings = require('./jbookDataMapping');
const _ = require('underscore');
const { reviewMapping } = require('./jbookDataMapping');

class JBookSearchUtility {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			constants = constantsFile,
			searchUtility = new SearchUtility(opts)
		} = opts;

		this.logger = logger;
		this.constants = constants;
		this.searchUtility = searchUtility;
	}

	// parse list of key : value to their frontend/db counterpart
	parseFields(data, fromFrontend, docType) {
		const newData = {};
		const mapping = this.getMapping(docType, fromFrontend);

		for (const field in mapping) {
			if (data[field] != null || data[field] != undefined) {
				const newKey = mapping[field].newName;
				newData[newKey] = mapping[field].processValue(data[field]);
			}
			else {
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
		let mapping;
		if (Mappings[`${docType}Mapping`]) {
			mapping = _.clone(Mappings[`${docType}Mapping`]);
		}
		else {
			console.log(`${docType} mapping not found`)
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
			return frontEndMapping
		}
		else if (docType !== 'review' || docType !== 'gl') {
			mapping = {
				...mapping,
				...reviewMapping
			}
		}

		return mapping;
	}

	getDocCols(docType) {
		let fields = [];
		let mapping = this.getMapping(docType, true);
		let reviewMapping = this.getMapping('review', true);


		const requiredCols = [
			'revBudgetType',
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
			'pocClassLabel',]

		const typeMap = {
			'rdoc': 'rd',
			'pdoc': 'p',
			'odoc': 'o'
		};

		for (const field of requiredCols) {
			if (mapping[field]) {
				// console.log(field + ' : ' + mapping[field].newName);
				fields.push(`${typeMap[docType]}."${mapping[field].newName}"  AS "${field}"`)
			} else if (reviewMapping[field]) {
				// console.log(field + ' : ' + mapping[field].newName)
				fields.push(`r."${reviewMapping[field].newName}" AS "${field}"`);
			}
			else {
				fields.push(`'' AS "${field}"`);
			}
		}

		fields.push(`${typeMap[docType]}.id`);


		//  add type
		const typeMap2 = {
			'rdoc': 'RDT&E',
			'pdoc': 'Procurement',
			'odoc': 'O&M'
		};
		fields.push(`'${typeMap2[docType]}' as type`);



		return fields;
	}

	buildSelectQuery() {
		// console.log(this.getDocCols('pdoc').join(', '));
		// console.log(this.getDocCols('rdoc').join(', '));
		// console.log(this.getDocCols('odoc').join(', '));

		let pQuery = `SELECT DISTINCT ${this.getDocCols('pdoc').join(', ')}, p.id as id FROM pdoc p LEFT JOIN (SELECT *, CASE WHEN review_status = 'Finished Review' THEN poc_class_label WHEN review_status = 'Partial Review (POC)' THEN service_class_label ELSE primary_class_label END AS search_label FROM (SELECT id, MAX(rc."updatedAt") as time FROM review rc GROUP BY id) b JOIN review d ON b.id = d.id AND b.time = d."updatedAt") r ON r."budget_type" = 'pdoc' AND p."P40-01_LI_Number" = r.budget_line_item AND p."P40-04_BudgetYear" = r."budget_year"`;
		let rQuery = `SELECT DISTINCT ${this.getDocCols('rdoc').join(', ')}, rd.id as id FROM rdoc rd LEFT JOIN (SELECT *, CASE WHEN review_status = 'Finished Review' THEN poc_class_label WHEN review_status = 'Partial Review (POC)' THEN service_class_label ELSE primary_class_label END AS search_label FROM (SELECT id, MAX(rc."updatedAt") as time FROM review rc GROUP BY id) b JOIN review d ON b.id = d.id AND b.time = d."updatedAt") r ON r."budget_type" = 'rdoc' AND  rd."PE_Num" = r.program_element AND rd."Proj_Number" = r.budget_line_item AND rd."BudgetYear" = r."budget_year"`;
		let oQuery = `SELECT DISTINCT ${this.getDocCols('odoc').join(', ')}, o.id as id FROM om o LEFT JOIN (SELECT *, CASE WHEN review_status = 'Finished Review' THEN poc_class_label WHEN review_status = 'Partial Review (POC)' THEN service_class_label ELSE primary_class_label END AS search_label FROM (SELECT id, MAX(rc."updatedAt") as time FROM review rc GROUP BY id) b JOIN review d ON b.id = d.id AND b.time = d."updatedAt") r ON r."budget_type" = 'odoc' AND o.line_number = r.budget_line_item AND o.account = r.program_element AND o."budget_activity" = r."budget_activity" AND o."budget_year" = r."budget_year"  AND o."line_number" is not null AND o."line_number" != ''`;

		return [pQuery, rQuery, oQuery];
	}

	buildWhereQuery(jbookSearchSettings, hasSearchText, keywordIds, perms, userId) {
		let pQueryFilter = `"P40-01_LI_Number" is not null AND "P40-01_LI_Number" != '' AND "P40-02_LI_Title" is not null AND "P40-02_LI_Title" != ''`;
		let rQueryFilter = `"PE_Num" is not null AND "PE_Num" != '' AND "Proj_Number" is not null AND "Proj_Number" != '' AND "Proj_Title" is not null AND "Proj_Title" != ''`;
		let oQueryFilter = `"account" is not null AND "account" != '' AND "account_title" is not null AND "account_title" != '' AND "budget_activity_title" is not null AND "budget_activity_title" != ''`;

		const pDocSearchQueryArray = Mappings['pdocSearchMapping'].map(pdocSearchText => { return `"${pdocSearchText}" @@ to_tsquery('english', :searchText)`; });
		const rDocSearchQueryArray = Mappings['rdocSearchMapping'].map(rdocSearchText => { return `"${rdocSearchText}" @@ to_tsquery('english', :searchText)`; });
		const oDocSearchQueryArray = Mappings['odocSearchMapping'].map(odocSearchText => { return `"${odocSearchText}" @@ to_tsquery('english', :searchText)`; });

		let pQuery = hasSearchText ? ` WHERE ( ${pDocSearchQueryArray.join(' OR ')} AND ${pQueryFilter} )` : ` WHERE ${pQueryFilter}`;
		let rQuery = hasSearchText ? ` WHERE ( ${rDocSearchQueryArray.join(' OR ')} AND ${rQueryFilter} )` : ` WHERE ${rQueryFilter}`;
		let oQuery = hasSearchText ? ` WHERE ( ${oDocSearchQueryArray.join(' OR ')} AND ${oQueryFilter} )` : ` WHERE ${oQueryFilter}`;

		if (keywordIds) {
			let queryText = 'IN';
			if (jbookSearchSettings.hasKeywords.indexOf('No') !== -1) {
				queryText = 'NOT ' + queryText;
			}
			pQuery += ` AND p."${this.mapFieldName('pdoc', 'id', true)}" ${queryText} (${keywordIds['pdoc'].join(', ')})`;
			rQuery += ` AND rd."${this.mapFieldName('rdoc', 'id', true)}" ${queryText} (${keywordIds['rdoc'].join(', ')})`;
			oQuery += ` AND o."${this.mapFieldName('odoc', 'id', true)}" ${queryText} (${keywordIds['om'].join(', ')})`;
		}

		for (const setting in jbookSearchSettings) {
			switch (setting) {
				case 'reviewStatus':
					if (jbookSearchSettings[setting] && Array.isArray(jbookSearchSettings[setting]) && jbookSearchSettings[setting].length > 0) {
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
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += ` AND r.review_status = '${jbookSearchSettings[setting]}'`;
						rQuery += ` AND r.review_status = '${jbookSearchSettings[setting]}'`;
						oQuery += ` AND r.review_status = '${jbookSearchSettings[setting]}'`;
					}
					break;
				// review-specific filters
				case 'primaryClassLabel':
					if (jbookSearchSettings[setting] && Array.isArray(jbookSearchSettings[setting]) && jbookSearchSettings[setting].length > 0) {
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
					if (jbookSearchSettings[setting] && Array.isArray(jbookSearchSettings[setting]) && jbookSearchSettings[setting].length > 0) {
						const fieldString = `('${jbookSearchSettings[setting].join("', '")}')`;
						const hasNull = jbookSearchSettings[setting].includes('Blank');
						if (hasNull) {
							pQuery += ` AND (r."${this.mapFieldName('review', setting, true)}" IN ${fieldString} OR r."${this.mapFieldName('review', setting, true)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
							rQuery += ` AND (r."${this.mapFieldName('review', setting, true)}" IN ${fieldString} OR r."${this.mapFieldName('review', setting, true)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
							oQuery += ` AND (r."${this.mapFieldName('review', setting, true)}" IN ${fieldString} OR r."${this.mapFieldName('review', setting, true)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;

							pQuery += ` AND (r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" = '' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IS NULL)`;
							rQuery += ` AND (r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" = '' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IS NULL)`;
							oQuery += ` AND (r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" = '' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IS NULL)`;
						} else {
							pQuery += ` AND (r."${this.mapFieldName('review', 'serviceReviewer', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IN ${fieldString})`;
							rQuery += ` AND (r."${this.mapFieldName('review', 'serviceReviewer', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IN ${fieldString})`;
							oQuery += ` AND (r."${this.mapFieldName('review', 'serviceReviewer', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IN ${fieldString})`;
						}
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += ` AND (r."${this.mapFieldName('review', 'serviceReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
						rQuery += ` AND (r."${this.mapFieldName('review', 'serviceReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
						oQuery += ` AND (r."${this.mapFieldName('review', 'serviceReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
					}
					break;
				case 'pocReviewer':
					if (jbookSearchSettings[setting] && Array.isArray(jbookSearchSettings[setting]) && jbookSearchSettings[setting].length > 0) {
						const fieldString = `('${jbookSearchSettings[setting].join("', '")}')`;
						const hasNull = jbookSearchSettings[setting].includes('Blank');
						if (hasNull) {
							pQuery += ` AND (r."${this.mapFieldName('review', setting, true)}" IN ${fieldString} OR r."${this.mapFieldName('review', setting, true)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
							rQuery += ` AND (r."${this.mapFieldName('review', setting, true)}" IN ${fieldString} OR r."${this.mapFieldName('review', setting, true)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
							oQuery += ` AND (r."${this.mapFieldName('review', setting, true)}" IN ${fieldString} OR r."${this.mapFieldName('review', setting, true)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
						} else {
							pQuery += ` AND (r."${this.mapFieldName('review', 'servicePOCName', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'altPOCName', true)}" IN ${fieldString})`;
							rQuery += ` AND (r."${this.mapFieldName('review', 'servicePOCName', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'altPOCName', true)}" IN ${fieldString})`;
							oQuery += ` AND (r."${this.mapFieldName('review', 'servicePOCName', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'altPOCName', true)}" IN ${fieldString})`;
						}
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += ` AND (r."${this.mapFieldName('review', 'servicePOCName', true)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName('review', 'altPOCName', true)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
						rQuery += ` AND (r."${this.mapFieldName('review', 'servicePOCName', true)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName('review', 'altPOCName', true)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
						oQuery += ` AND (r."${this.mapFieldName('review', 'servicePOCName', true)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName('review', 'altPOCName', true)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
					}
					break;
				case 'sourceTag':
				case 'primaryReviewer':
					if (jbookSearchSettings[setting] && Array.isArray(jbookSearchSettings[setting]) && jbookSearchSettings[setting].length > 0) {
						const fieldString = `('${jbookSearchSettings[setting].join("', '")}')`;
						const hasNull = jbookSearchSettings[setting].includes('Blank');
						if (hasNull) {
							pQuery += ` AND (r."${this.mapFieldName('review', setting, true)}" IN ${fieldString} OR r."${this.mapFieldName('review', setting, true)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
							rQuery += ` AND (r."${this.mapFieldName('review', setting, true)}" IN ${fieldString} OR r."${this.mapFieldName('review', setting, true)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
							oQuery += ` AND (r."${this.mapFieldName('review', setting, true)}" IN ${fieldString} OR r."${this.mapFieldName('review', setting, true)}" = '' OR r."${this.mapFieldName('review', setting, true)}" IS NULL)`;
						} else {
							pQuery += ` AND r."${this.mapFieldName('review', setting, true)}" IN ${fieldString}`;
							rQuery += ` AND r."${this.mapFieldName('review', setting, true)}" IN ${fieldString}`;
							oQuery += ` AND r."${this.mapFieldName('review', setting, true)}" IN ${fieldString}`;
						}
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += ` AND r."${this.mapFieldName('review', setting, true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
						rQuery += ` AND r."${this.mapFieldName('review', setting, true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
						oQuery += ` AND r."${this.mapFieldName('review', setting, true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
					}
					break;
				case 'serviceAgency':
				case 'budgetYear':
					if (jbookSearchSettings[setting] && Array.isArray(jbookSearchSettings[setting]) && jbookSearchSettings[setting].length > 0) {
						const yearString = `('${jbookSearchSettings[setting].join("', '")}')`;
						const hasNull = jbookSearchSettings[setting].includes('Blank');
						if (hasNull) {
							pQuery += ` AND (p."${this.mapFieldName('pdoc', setting, true)}" IN ${yearString} OR p."${this.mapFieldName('pdoc', setting, true)}" = '' OR p."${this.mapFieldName('pdoc', setting, true)}" IS NULL )`;
							rQuery += ` AND (rd."${this.mapFieldName('rdoc', setting, true)}" IN ${yearString} OR rd."${this.mapFieldName('rdoc', setting, true)}" = '' OR rd."${this.mapFieldName('rdoc', setting, true)}" IS NULL)`;
							oQuery += ` AND (o."${this.mapFieldName('odoc', setting, true)}" IN ${yearString} OR o."${this.mapFieldName('odoc', setting, true)}" = '' OR o."${this.mapFieldName('odoc', setting, true)}" IS NULL)`;
						} else {
							pQuery += ` AND p."${this.mapFieldName('pdoc', setting, true)}" IN ${yearString}`;
							rQuery += ` AND rd."${this.mapFieldName('rdoc', setting, true)}" IN ${yearString}`;
							oQuery += ` AND o."${this.mapFieldName('odoc', setting, true)}" IN ${yearString}`;
						}
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += ` AND p."${this.mapFieldName('pdoc', setting, true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
						rQuery += ` AND rd."${this.mapFieldName('rdoc', setting, true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
						oQuery += ` AND o."${this.mapFieldName('odoc', setting, true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
					}
					break;
				case 'programElement':
					pQuery += ` AND p."P40-01_LI_Number" ILIKE '%${jbookSearchSettings[setting]}%'`;
					rQuery += ` AND rd."${this.mapFieldName('rdoc', setting, true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
					oQuery += ` AND (o."${this.mapFieldName('odoc', 'programElement', true)}" ILIKE '%${jbookSearchSettings[setting]}%' OR o."${this.mapFieldName('odoc', 'budgetLineItem', true)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
					break;
				case 'projectNum':
					pQuery += ` AND p."P40-01_LI_Number" ILIKE 'THIS IS HERE TO MAKE SURE YOU DONT GET RESULTS'`;
					rQuery += ` AND rd."${this.mapFieldName('rdoc', setting, true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
					oQuery += ` AND o."${this.mapFieldName('odoc', setting, true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
					break;
				case 'projectTitle':
					pQuery += ` AND p."${this.mapFieldName('pdoc', setting, true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
					rQuery += ` AND rd."${this.mapFieldName('rdoc', setting, true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
					oQuery += ` AND o."${this.mapFieldName('odoc', setting, true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
					break;
				default:
					break;
			}
		}

		return [pQuery, rQuery, oQuery];

		/*if (perms.includes('JBOOK Admin') || perms.includes('JBOOK Primary Reviewer')) {
			return [pQuery, rQuery, oQuery];
		} else {
			// 0 = Last, 1 = First, 2 = MI, 3 = DODID (Do not Use unless Hashed)
			const nameArray = userId.split('.');
			
			if (perms.includes('JBOOK Service Reviewer') || perms.includes('JBOOK POC Reviewer')) {
				pQuery = `${pQuery} AND r."service_reviewer" ILIKE '${nameArray[1]} ${nameArray[0]}%'`
				rQuery = `${rQuery} AND r."service_reviewer" ILIKE '${nameArray[1]} ${nameArray[0]}%'`
				oQuery = `${oQuery} AND r."service_reviewer" ILIKE '${nameArray[1]} ${nameArray[0]}%'`
			} else if (perms.includes('JBOOK POC Reviewer')) {
				pQuery = `${pQuery} AND r."poc_reviewer" ILIKE '${nameArray[1]} ${nameArray[0]}%'`
				rQuery = `${rQuery} AND r."poc_reviewer" ILIKE '${nameArray[1]} ${nameArray[0]}%'`
				oQuery = `${oQuery} AND r."poc_reviewer" ILIKE '${nameArray[1]} ${nameArray[0]}%'`
			} else {
				pQuery = `${pQuery} AND r."poc_reviewer" = 'BLAH'`
				rQuery = `${rQuery} AND r."poc_reviewer" = 'BLAH'`
				oQuery = `${oQuery} AND r."poc_reviewer" = 'BLAH'`
			}
			return [pQuery, rQuery, oQuery];
		}*/
	}

	buildWhereQueryForUserDash(jbookSearchSettings) {
		let pQueryFilter = `"P40-01_LI_Number" is not null AND "P40-01_LI_Number" != '' AND "P40-02_LI_Title" is not null AND "P40-02_LI_Title" != ''`;
		let rQueryFilter = `"PE_Num" is not null AND "PE_Num" != '' AND "Proj_Number" is not null AND "Proj_Number" != '' AND "Proj_Title" is not null AND "Proj_Title" != ''`;
		let oQueryFilter = `"account" is not null AND "account" != '' AND "account_title" is not null AND "account_title" != '' AND "budget_activity_title" is not null AND "budget_activity_title" != ''`;

		const useAND = Object.keys(jbookSearchSettings).length > 1;

		let pQuery = ` WHERE ${pQueryFilter}${useAND ? ' AND (' : ''}`;
		let rQuery = ` WHERE ${rQueryFilter}${useAND ? ' AND (' : ''}`;
		let oQuery = ` WHERE ${oQueryFilter}${useAND ? ' AND (' : ''}`;

		Object.keys(jbookSearchSettings).forEach((setting, i) => {
			switch (setting) {
				case 'primaryReviewerForUserDash':
					if (jbookSearchSettings[setting] && Array.isArray(jbookSearchSettings[setting]) && jbookSearchSettings[setting].length > 0) {
						const fieldString = `('${jbookSearchSettings[setting].join("', '")}')`;
						pQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}r."${this.mapFieldName('review', 'primaryReviewer', true)}" IN ${fieldString}`;
						rQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}r."${this.mapFieldName('review', 'primaryReviewer', true)}" IN ${fieldString}`;
						oQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}r."${this.mapFieldName('review', 'primaryReviewer', true)}" IN ${fieldString}`;
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}r."${this.mapFieldName('review', 'primaryReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
						rQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}r."${this.mapFieldName('review', 'primaryReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
						oQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}r."${this.mapFieldName('review', 'primaryReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%'`;
					}
					break;
				case 'serviceReviewerForUserDash':
					if (jbookSearchSettings[setting] && Array.isArray(jbookSearchSettings[setting]) && jbookSearchSettings[setting].length > 0) {
						const fieldString = `('${jbookSearchSettings[setting].join("', '")}')`;
						pQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}(r."${this.mapFieldName('review', 'serviceReviewer', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IN ${fieldString})`;
						rQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}(r."${this.mapFieldName('review', 'serviceReviewer', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IN ${fieldString})`;
						oQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}(r."${this.mapFieldName('review', 'serviceReviewer', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" IN ${fieldString})`;

					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}(r."${this.mapFieldName('review', 'serviceReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
						rQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}(r."${this.mapFieldName('review', 'serviceReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
						oQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}(r."${this.mapFieldName('review', 'serviceReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName('review', 'serviceSecondaryReviewer', true)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
					}
					break;
				case 'pocReviewerEmailForUserDash':
					if (jbookSearchSettings[setting] && Array.isArray(jbookSearchSettings[setting]) && jbookSearchSettings[setting].length > 0) {
						const fieldString = `('${jbookSearchSettings[setting].join("', '")}')`;
						pQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}(r."${this.mapFieldName('review', 'servicePOCEmail', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'altPOCEmail', true)}" IN ${fieldString})`;
						rQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}(r."${this.mapFieldName('review', 'servicePOCEmail', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'altPOCEmail', true)}" IN ${fieldString})`;
						oQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}(r."${this.mapFieldName('review', 'servicePOCEmail', true)}" IN ${fieldString} OR r."${this.mapFieldName('review', 'altPOCEmail', true)}" IN ${fieldString})`;
					} else if (typeof jbookSearchSettings[setting] === 'string') {
						pQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}(r."${this.mapFieldName('review', 'servicePOCEmail', true)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName('review', 'altPOCEmail', true)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
						rQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}(r."${this.mapFieldName('review', 'servicePOCEmail', true)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName('review', 'altPOCEmail', true)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
						oQuery += `${useAND ? i > 0 ? ' OR ' : '' : ' AND '}(r."${this.mapFieldName('review', 'servicePOCEmail', true)}" ILIKE '%${jbookSearchSettings[setting]}%' OR r."${this.mapFieldName('review', 'altPOCEmail', true)}" ILIKE '%${jbookSearchSettings[setting]}%')`;
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

		/*if (perms.includes('JBOOK Admin') || perms.includes('JBOOK Primary Reviewer')) {
			return [pQuery, rQuery, oQuery];
		} else {
			// 0 = Last, 1 = First, 2 = MI, 3 = DODID (Do not Use unless Hashed)
			const nameArray = userId.split('.');

			if (perms.includes('JBOOK Service Reviewer') || perms.includes('JBOOK POC Reviewer')) {
				pQuery = `${pQuery} AND r."service_reviewer" ILIKE '${nameArray[1]} ${nameArray[0]}%'`
				rQuery = `${rQuery} AND r."service_reviewer" ILIKE '${nameArray[1]} ${nameArray[0]}%'`
				oQuery = `${oQuery} AND r."service_reviewer" ILIKE '${nameArray[1]} ${nameArray[0]}%'`
			} else if (perms.includes('JBOOK POC Reviewer')) {
				pQuery = `${pQuery} AND r."poc_reviewer" ILIKE '${nameArray[1]} ${nameArray[0]}%'`
				rQuery = `${rQuery} AND r."poc_reviewer" ILIKE '${nameArray[1]} ${nameArray[0]}%'`
				oQuery = `${oQuery} AND r."poc_reviewer" ILIKE '${nameArray[1]} ${nameArray[0]}%'`
			} else {
				pQuery = `${pQuery} AND r."poc_reviewer" = 'BLAH'`
				rQuery = `${rQuery} AND r."poc_reviewer" = 'BLAH'`
				oQuery = `${oQuery} AND r."poc_reviewer" = 'BLAH'`
			}
			return [pQuery, rQuery, oQuery];
		}*/
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
				newQuery += ` ORDER BY "serviceSecondaryReviewer" ${sort[0].desc ? 'DESC' : 'ASC'}, "serviceReviewer" ${sort[0].desc ? 'DESC' : 'ASC'}`;
			} if (sort[0].id === 'pocReviewer') {
				newQuery += ` ORDER BY "altPOCName" ${sort[0].desc ? 'DESC' : 'ASC'}, "servicePOCName" ${sort[0].desc ? 'DESC' : 'ASC'}`;
			} else {
				newQuery += ` ORDER BY "${sort[0].id}" ${sort[0].desc ? 'DESC' : 'ASC'}`;
			}

		}
		return newQuery;
	}
}

module.exports = JBookSearchUtility;
