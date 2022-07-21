const LOGGER = require('@dod-advana/advana-logger');
const constantsFile = require('../../config/constants');
const SearchUtility = require('../../utils/searchUtility');
const Mappings = require('./jbookDataMapping');
const _ = require('underscore');
const { MLApiClient } = require('../../lib/mlApiClient');
const asyncRedisLib = require('async-redis');
const { Thesaurus } = require('../../lib/thesaurus');
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
	parseFields(data, fromFrontend, docType, doMapping = true) {
		try {
			const newData = {};
			const mapping = this.getMapping(docType, fromFrontend);

			for (const field in data) {
				if (data[field] && data[field] !== null && Object.keys(mapping).includes(field) && doMapping) {
					const newKey = mapping[field].newName;
					newData[newKey] = mapping[field].processValue(data[field]);
				} else if (data[field] && data[field] !== null) {
					newData[field] = data[field];
				}
			}
			return newData;
		} catch (e) {
			console.log('Error parsing jbook fields');
			this.logger.error(e.message, 'IEPGRA00');
			throw e;
		}
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
					...Mappings.reviewMapping,
				};
			}

			return mapping;
		} catch (err) {
			console.log('Error retrieving jbook mapping');
			this.logger.error(err.message, 'AJTKSKQ');
			console.log('an update was made');
		}
	}

	async gatherExpansionTerms(body, userId) {
		const { searchText } = body;

		try {
			const [, termsArray] = this.searchUtility.getEsSearchTerms({ searchText });
			let expansionDict = await this.mlApiExpansion(termsArray, false, userId);
			let [synonyms] = this.thesaurusExpansion(searchText, termsArray);
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
		const abbreviationExpansions = [];
		for (const term of termsArray) {
			const upperTerm = term.toUpperCase().replace(/['"]+/g, '');
			const expandedTerm = await this.redisDB.get(upperTerm);
			const lowerTerm = term.toLowerCase().replace(/['"]+/g, '');
			const compressedTerm = await this.redisDB.get(lowerTerm);
			if (expandedTerm && !abbreviationExpansions.includes('"' + expandedTerm.toLowerCase() + '"')) {
				abbreviationExpansions.push('"' + expandedTerm.toLowerCase() + '"');
			}
			if (compressedTerm && !abbreviationExpansions.includes('"' + compressedTerm.toLowerCase() + '"')) {
				abbreviationExpansions.push('"' + compressedTerm.toLowerCase() + '"');
			}
		}

		// removing abbreviations of expanded terms (so if someone has "dod" AND "department of defense" in the search, it won't show either in expanded terms)
		const cleanedAbbreviations = [];
		abbreviationExpansions.forEach((abb) => {
			const cleaned = abb.toLowerCase().replace(/['"]+/g, '');
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
			for (let term in termsArray) {
				lookUpTerm = termsArray[term].replace(/\"/g, '');
				const synonyms = this.thesaurus.lookUp(lookUpTerm);
				if (synonyms && synonyms.length > 1) {
					synList = synList.concat(synonyms.slice(0, 2));
				}
			}
		}

		let text = searchText;
		if (!useText && termsArray && termsArray.length && termsArray[0]) {
			text = termsArray[0];
		}
		return [synList, text];
	}

	getPageHits(hit) {
		let pageHits = [];

		if (hit.inner_hits) {
			Object.keys(hit.inner_hits).forEach((hitKey) => {
				hit.inner_hits[hitKey].hits.hits.forEach((innerHit) => {
					Object.keys(innerHit.highlight).forEach((highlightKey) => {
						if (Mappings.esTopLevelFieldsNameMapping[hitKey] !== undefined) {
							pageHits.push({
								title: Mappings.esTopLevelFieldsNameMapping[hitKey],
								snippet: innerHit.highlight[highlightKey][0],
							});
						}
					});
				});
			});
		}

		if (hit.highlight) {
			Object.keys(hit.highlight).forEach((hitKey) => {
				pageHits.push({
					title: Mappings.esTopLevelFieldsNameMapping[hitKey],
					snippet: hit.highlight[hitKey][0],
				});
			});
		}

		return pageHits;
	}

	cleanESResults(esResults, userId) {
		const results = [];

		try {
			let searchResults = { totalCount: 0, docs: [] };

			const { body = {} } = esResults;
			const { aggregations = {} } = body;
			const { service_agency_aggs = {}, contract_totals = {} } = aggregations;
			const service_buckets = service_agency_aggs.buckets ? service_agency_aggs.buckets : [];
			const contract_buckets = contract_totals.buckets ? contract_totals.buckets : [];
			const { hits: esHits = {} } = body;
			const {
				hits = [],
				total: { value },
			} = esHits;

			searchResults.totalCount = value;
			searchResults.serviceAgencyCounts = service_buckets;
			searchResults.contractTotalCounts = contract_buckets;

			const agencyMapping = this.getMapping('esServiceAgency', false);

			hits.forEach((hit) => {
				let result = this.transformEsFields(hit._source);

				result.hasKeywords = result?.keywords?.length > 0;
				if (result.hasKeywords) {
					result.keywords = result.keywords.map((keyword) => {
						return keyword.keyword_s;
					});
				}

				result.serviceAgency = agencyMapping[result.serviceAgency] || result.serviceAgency;

				result.pageHits = this.getPageHits(hit);

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
			console.log(e);
			const { message } = e;
			this.logger.error(message, '8V1IZLH', userId);
			return results;
		}
	}

	transformEsFields(raw) {
		let result = {};
		const arrayFields = ['keyword_n', 'review_n', 'gl_contract_n', 'r_2a_accomp_pp_n'];

		Mappings.esInnerHitFields.forEach((innerField) => {
			arrayFields.push(innerField.path);
		});

		const mapping = this.getMapping('elasticSearch', false);

		for (let key in raw) {
			let newKey = key;
			if (Object.keys(mapping).includes(key)) {
				newKey = mapping[key].newName;
			}

			if ((raw[key] && raw[key][0]) || !isNaN(raw[key]) || (typeof raw[key] === 'object' && raw[key] !== null)) {
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

	getProfilePageQueryData(esResults, userId) {
		try {
			const { body = {} } = esResults;
			const { hits } = body;

			const pfpQueryData = {};

			hits.hits.forEach((hit) => {
				const { _source } = hit;

				pfpQueryData.type_s = _source?.type_s;
				pfpQueryData.appropriationNumber_s = _source?.appropriationNumber_s;
				pfpQueryData.budgetActivityNumber_s = _source?.budgetActivityNumber_s;
				pfpQueryData.budgetLineItem_s = _source?.budgetLineItem_s;
				pfpQueryData.programElement_s = _source?.programElement_s;
				pfpQueryData.projectNum_s = _source?.projectNum_s;
			});

			return pfpQueryData;
		} catch (err) {
			console.log('Error extracting data from ES results for profile page query');
			this.logger.error(err, 'BNRKMTY', userId);
		}
	}

	getESJBookProfilePageQuery(
		{ type_s, appropriationNumber_s, budgetActivityNumber_s, budgetLineItem_s, programElement_s, projectNum_s },
		userId
	) {
		try {
			let query = {
				track_total_hits: true,
				query: {
					bool: {
						must: [
							{
								match: {
									type_s,
								},
							},
							{
								match: {
									appropriationNumber_s,
								},
							},
							{
								match: {
									budgetActivityNumber_s,
								},
							},
						],
					},
				},
			};

			if (budgetLineItem_s) {
				query.query.bool.must.push({
					match: {
						budgetLineItem_s,
					},
				});
			}

			if (programElement_s) {
				query.query.bool.must.push({
					match: {
						programElement_s,
					},
				});
			}

			if (projectNum_s) {
				query.query.bool.must.push({
					match: {
						projectNum_s,
					},
				});
			}

			return query;
		} catch (err) {
			console.log('Error generating ES query for profile page data (all years)');
			this.logger.error(err, '3UDLIZ3', userId);
		}
	}

	getElasticSearchJBookDataFromId({ docIds }, userId) {
		try {
			return {
				track_total_hits: true,
				size: 100,
				query: {
					bool: {
						must: {
							terms: { key_s: docIds },
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
		{ searchText = '', parsedQuery, offset, limit, jbookSearchSettings, operator = 'and', sortSelected },
		userId,
		serviceAgencyMappings
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
					contract_totals: {
						aggs: {
							sum_agg: {
								sum: { field: 'by1_request_d' },
							},
						},
						terms: {
							field: 'org_jbook_desc_s',
							size: 10000,
						},
					},
				},
				query: {
					bool: {
						must: [],
						should: [],
						minimum_should_match: 1,
					},
				},
				highlight: {
					fields: {},
				},
			};

			// ES FILTERS
			let filterQueries = this.getJbookESFilters(jbookSearchSettings, serviceAgencyMappings);
			query.query.bool.must = this.getJBookESReviewFilters(jbookSearchSettings);

			if (filterQueries.length > 0) {
				query.query.bool.filter = filterQueries;
			}

			if (searchText !== '') {
				query.query.bool.should.push({
					query_string: {
						query: `${parsedQuery}`,
						fields: Mappings.esTopLevelFields,
						type: 'best_fields',
						default_operator: `${operator}`,
					},
				});
			}

			Mappings.esTopLevelFields.forEach((field) => {
				query.highlight.fields[field] = {};
			});

			Mappings.esInnerHitFields.forEach((innerField) => {
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
										query_string: {
											query: `${parsedQuery}`,
											fields: innerField.fields,
											type: 'best_fields',
											default_operator: `${operator}`,
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
				budgetActivityTitle_t: 6,
				budgetActivityTitle_s: 6,
				programElement_t: 15,
				accountTitle_s: 1,
				budgetLineItemTitle_s: 1,
				budgetLineItem_t: 15,
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

			let sortText = jbookSearchSettings.sort[0].id;
			if (!sortSelected && searchText && searchText !== '') {
				sortText = 'relevance';
			}

			let sort = jbookSearchSettings.sort[0].desc ? 'desc' : 'asc';
			// SORT
			switch (sortText) {
				case 'relevance':
					query.sort = [{ _score: { order: sort } }];
					break;
				case 'budgetYear':
					query.sort = [{ budgetYear_s: { order: sort } }];
					break;
				case 'programElement':
					query.sort = [{ programElement_s: { order: sort } }];
					break;
				case 'projectNum':
					query.sort = [{ projectNum_s: { order: sort } }];
					break;
				case 'projectTitle':
					query.sort = [{ projectTitle_s: { order: sort } }];
					break;
				case 'serviceAgency':
					query.sort = [{ serviceAgency_s: { order: sort } }];
					break;
				case 'budgetLineItem':
					query.sort = [{ budgetLineItem_s: { order: sort } }];
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

	handleBudgetSubPrimaryReviewFilter(jbookSearchSettings) {
		let shouldQuery = {
			bool: {
				should: [],
			},
		};
		if (jbookSearchSettings.budgetSubActivity) {
			shouldQuery.bool.should.push({
				query_string: {
					query: `*${jbookSearchSettings.budgetSubActivity}*`,
					default_field: 'P40-13_BSA_Title_t',
				},
			});

			shouldQuery.bool.should.push({
				query_string: {
					query: `*${jbookSearchSettings.budgetSubActivity}*`,
					default_field: 'budgetActivityTitle_t',
				},
			});
		}

		if (jbookSearchSettings.primaryReviewStatus) {
			jbookSearchSettings.primaryReviewStatus.forEach((status) => {
				if (status === 'Not Reviewed') {
					shouldQuery.bool.should.push({
						bool: {
							must_not: [
								{
									nested: {
										path: 'review_n',
										query: {
											bool: {
												must: [
													{
														term: {
															'review_n.primary_review_status_s': 'Finished Review',
														},
													},
													{
														term: {
															'review_n.portfolio_name_s':
																jbookSearchSettings.selectedPortfolio,
														},
													},
												],
											},
										},
									},
								},
								{
									nested: {
										path: 'review_n',
										query: {
											bool: {
												must: [
													{
														term: {
															'review_n.primary_review_status_s': 'Partial Review',
														},
													},
													{
														term: {
															'review_n.portfolio_name_s':
																jbookSearchSettings.selectedPortfolio,
														},
													},
												],
											},
										},
									},
								},
							],
						},
					});
				} else {
					shouldQuery.bool.should.push({
						nested: {
							path: 'review_n',
							query: {
								bool: {
									must: [
										{
											match: {
												'review_n.primary_review_status_s': status,
											},
										},
										{
											match: {
												'review_n.portfolio_name_s': jbookSearchSettings.selectedPortfolio,
											},
										},
									],
								},
							},
						},
					});
				}
			});
		}
		return shouldQuery;
	}

	handleRangeFilter(jbookSearchSettings, min, max, field) {
		const rangeQuery = {
			range: {
				[field]: {},
			},
		};

		if (jbookSearchSettings[min]) {
			rangeQuery.range[field].gte = jbookSearchSettings[min];
		}

		if (jbookSearchSettings[max]) {
			rangeQuery.range[field].lte = jbookSearchSettings[max];
		}

		return rangeQuery;
	}

	handleMainAccount(jbookSearchSettings) {
		let mainAcct = {
			bool: {
				should: [],
			},
		};
		if (jbookSearchSettings.paccts) {
			mainAcct.bool.should.push({
				bool: {
					must: [
						{ term: { type_s: 'procurement' } },
						{ terms: { appropriationNumber_s: jbookSearchSettings.paccts } },
					],
				},
			});
		}
		if (jbookSearchSettings.raccts) {
			mainAcct.bool.should.push({
				bool: {
					must: [
						{ term: { type_s: 'rdte' } },
						{ terms: { appropriationNumber_s: jbookSearchSettings.raccts } },
					],
				},
			});
		}
		if (jbookSearchSettings.oaccts) {
			mainAcct.bool.should.push({
				bool: {
					must: [
						{ term: { type_s: 'om' } },
						{ terms: { appropriationNumber_s: jbookSearchSettings.oaccts } },
					],
				},
			});
		}
		return mainAcct;
	}

	handleHasKeywords(jbookSearchSettings) {
		const mustOrNot = jbookSearchSettings.hasKeywords[0] === 'Yes' ? 'must' : 'must_not';
		return {
			bool: {
				[mustOrNot]: [
					{
						nested: {
							path: 'keyword_n',
							query: {
								bool: {
									filter: {
										exists: {
											field: 'keyword_n',
										},
									},
								},
							},
						},
					},
				],
			},
		};
	}

	handleBudgetType(jbookSearchSettings) {
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

		return {
			terms: {
				type_s: budgetTypesTemp,
			},
		};
	}

	// creates the portions of the ES query for filtering based on jbookSearchSettings
	// 'filter' instead of 'must' should ignore scoring, and do a hard include/exclude of results
	getJbookESFilters(jbookSearchSettings = {}, serviceAgencyMappings = {}) {
		let filterQueries = [];
		try {
			let settingKeys = Object.keys(jbookSearchSettings);
			for (const key of settingKeys) {
				switch (key) {
					//Has Keywords
					case 'hasKeywords':
						if (jbookSearchSettings.hasKeywords.length > 1) break;
						filterQueries.push(this.handleHasKeywords(jbookSearchSettings));
						break;
					// Review Status
					case 'reviewStatus':
						filterQueries.push({
							nested: {
								path: 'review_n',
								query: {
									bool: {
										must: [
											{
												terms: {
													'review_n.review_status_s': jbookSearchSettings.reviewStatus,
												},
											},
											{
												term: {
													'review_n.portfolio_name_s': jbookSearchSettings.selectedPortfolio,
												},
											},
										],
									},
								},
							},
						});
						break;

					// Budget Activity
					case 'budgetActivity':
						filterQueries.push({
							bool: {
								should: [
									{ terms: { budgetActivityNumber_s: jbookSearchSettings.budgetActivity } },
									{ terms: { appropriationNumber_s: jbookSearchSettings.budgetActivity } },
								],
							},
						});
						break;

					// Budget Sub Activity
					case 'budgetSubActivity':
					case 'primaryReviewStatus':
						filterQueries.push(this.handleBudgetSubPrimaryReviewFilter(jbookSearchSettings));
						break;

					// Total Funding
					case 'minTotalCost':
					case 'maxTotalCost':
						filterQueries.push(
							this.handleRangeFilter(jbookSearchSettings, 'minTotalCost', 'maxTotalCost', 'totalCost_d')
						);
						break;

					// BY1 Funding
					case 'minBY1Funding':
					case 'maxBY1Funding':
						filterQueries.push(
							this.handleRangeFilter(
								jbookSearchSettings,
								'minBY1Funding',
								'maxBY1Funding',
								'by1_request_d'
							)
						);
						break;

					// Budget Type
					case 'budgetType':
						filterQueries.push(this.handleBudgetType(jbookSearchSettings));
						break;

					// Budget Year
					case 'budgetYear':
						filterQueries.push({
							terms: {
								budgetYear_s: jbookSearchSettings.budgetYear,
							},
						});
						break;

					// Program Element / BLI
					case 'programElement':
						filterQueries.push({
							bool: {
								should: [
									{
										query_string: {
											query: `*${jbookSearchSettings.programElement}*`,
											default_field: 'budgetLineItem_t',
										},
									},
									{
										query_string: {
											query: `*${jbookSearchSettings.programElement}*`,
											default_field: 'programElement_s',
										},
									},
								],
							},
						});
						break;

					// Project Number
					case 'projectNum':
						filterQueries.push({
							query_string: {
								query: `*${jbookSearchSettings.projectNum}*`,
								default_field: 'projectNum_s',
							},
						});
						break;

					// Service Agency
					case 'serviceAgency':
						const convertedAgencies = [];

						jbookSearchSettings.serviceAgency.forEach((agency) => {
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
						break;
					default:
						break;
				}
			}

			if (jbookSearchSettings.appropriationNumberSpecificSelected) {
				filterQueries.push(this.handleMainAccount(jbookSearchSettings));
			}
		} catch (e) {
			console.log('Error applying Jbook ES filters');
			this.logger.error(e.message, 'IEPGRAZ9');
			return filterQueries;
		}

		return filterQueries;
	}

	getJBookESReviewFilters(jbookSearchSettings) {
		const nestedMustObjects = [];

		// Primary Reviewer
		if (jbookSearchSettings.primaryReviewer) {
			const reviewerTerms = jbookSearchSettings.primaryReviewer.map((reviewer) => {
				return { term: { 'review_n.primary_reviewer_s': reviewer } };
			});
			nestedMustObjects.push({
				nested: {
					path: 'review_n',
					query: {
						bool: {
							must: [
								{
									bool: {
										should: reviewerTerms,
									},
								},
								{ term: { 'review_n.portfolio_name_s': jbookSearchSettings.selectedPortfolio } },
							],
						},
					},
				},
			});
		}

		// Service Reviewer
		if (jbookSearchSettings.serviceReviewer) {
			const reviewerTerms = jbookSearchSettings.serviceReviewer.map((reviewer) => {
				return { term: { 'review_n.service_reviewer_s': reviewer } };
			});
			nestedMustObjects.push({
				nested: {
					path: 'review_n',
					query: {
						bool: {
							must: [
								{
									bool: {
										should: reviewerTerms,
									},
								},
								{ term: { 'review_n.portfolio_name_s': jbookSearchSettings.selectedPortfolio } },
							],
						},
					},
				},
			});
		}

		// POC Reviewer
		if (jbookSearchSettings.pocReviewer) {
			nestedMustObjects.push({
				nested: {
					path: 'review_n',
					query: {
						bool: {
							should: [
								{
									wildcard: {
										'review_n.service_poc_name_s': {
											value: `*${jbookSearchSettings.pocReviewer}*`,
										},
									},
								},
								{
									wildcard: {
										'review_n.alternate_poc_name_s': {
											value: `*${jbookSearchSettings.pocReviewer}*`,
										},
									},
								},
							],
						},
					},
				},
			});
		}

		// Primary Class Label
		if (jbookSearchSettings.primaryClassLabel) {
			nestedMustObjects.push({
				nested: {
					path: 'review_n',
					query: {
						bool: {
							should: [
								{
									terms: {
										'review_n.primary_class_label_s': jbookSearchSettings.primaryClassLabel,
									},
								},
								{
									terms: {
										'review_n.service_class_label_s': jbookSearchSettings.primaryClassLabel,
									},
								},
								{
									terms: {
										'review_n.poc_class_label_s': jbookSearchSettings.primaryClassLabel,
									},
								},
							],
						},
					},
				},
			});
		}

		// Source Tag
		if (jbookSearchSettings.sourceTag) {
			nestedMustObjects.push({
				nested: {
					path: 'review_n',
					query: {
						terms: {
							'review_n.source_tag_s': jbookSearchSettings.sourceTag,
						},
					},
				},
			});
		}

		return nestedMustObjects;
	}
}

module.exports = JBookSearchUtility;
