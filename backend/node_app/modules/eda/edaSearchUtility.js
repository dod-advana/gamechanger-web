const LOGGER = require('@dod-advana/advana-logger');
const constantsFile = require('../../config/constants');
const SearchUtility = require('../../utils/searchUtility');

class EDASearchUtility {
	constructor(opts = {}) {
		const { logger = LOGGER, constants = constantsFile, searchUtility = new SearchUtility(opts) } = opts;

		this.logger = logger;
		this.constants = constants;
		this.searchUtility = searchUtility;

		this.getElasticsearchPagesQuery = this.getElasticsearchPagesQuery.bind(this);
		this.getElasticsearchStatsQuery = this.getElasticsearchStatsQuery.bind(this);
		this.cleanUpEsResults = this.cleanUpEsResults.bind(this);
	}

	getElasticsearchPagesQuery(
		{
			searchText = '',
			parsedQuery = '',
			offset = 0,
			limit = 20,
			charsPadding = 90,
			operator = 'and',
			storedFields = [
				'filename',
				'title',
				'page_count',
				'doc_type',
				'doc_num',
				'ref_list',
				'id',
				'summary_30',
				'keyw_5',
				'p_text',
				'type',
				'p_page',
				'display_title_s',
				'display_org_s',
				'display_doc_type_s',
			],
			extStoredFields = [],
			extSearchFields = [],
			edaSearchSettings = {},
		},
		user
	) {
		try {
			// add additional search fields to the query
			let filterQueries = [];

			filterQueries = filterQueries.concat(this.getEDASearchQuery(edaSearchSettings));

			storedFields = [...storedFields, ...extStoredFields];

			let query = {
				_source: {
					includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*', 'fpds*'],
				},
				stored_fields: storedFields,
				from: offset,
				size: limit,
				track_total_hits: true,
				query: {
					bool: {
						must: [
							{
								bool: {
									should: [
										{
											nested: {
												path: 'pages',
												inner_hits: {
													_source: false,
													stored_fields: ['pages.filename', 'pages.p_raw_text'],
													from: 0,
													size: 5,
													highlight: {
														fields: {
															'pages.filename.search': {
																number_of_fragments: 0,
															},
															'pages.p_raw_text': {
																fragment_size: 2 * charsPadding,
																number_of_fragments: 1,
															},
														},
														fragmenter: 'span',
													},
												},
												query: {
													bool: {
														should: [
															{
																wildcard: {
																	'pages.filename.search': {
																		value: `${parsedQuery}*`,
																		boost: 15,
																	},
																},
															},
															{
																query_string: {
																	query: `${parsedQuery}`,
																	default_field: 'pages.p_raw_text',
																	default_operator: `${operator}`,
																	fuzzy_max_expansions: 100,
																	fuzziness: 'AUTO',
																},
															},
														],
													},
												},
											},
										},
									],
								},
							},
						],
						should: [
							{
								multi_match: {
									query: `${parsedQuery}`,
									fields: ['keyw_5^2', 'id^2', 'summary_30', 'pages.p_raw_text'],
									operator: 'or',
								},
							},
							{
								rank_feature: {
									field: 'pagerank_r',
									boost: 0.5,
								},
							},
							{
								rank_feature: {
									field: 'kw_doc_score_r',
									boost: 0.1,
								},
							},
						],
					},
				},
			};

			// exclude certain terms or phrases
			if (edaSearchSettings.excludeTerms && edaSearchSettings.excludeTerms !== '') {
				let phrases = edaSearchSettings.excludeTerms.split(';');
				let should = [];

				phrases.forEach((phrase) => {
					should.push({
						wildcard: {
							'pages.filename.search': {
								value: `*${phrase}*`,
							},
						},
					});
					should.push({
						match_phrase: {
							'pages.p_raw_text': phrase,
						},
					});
				});

				query.query.bool.must_not = [
					{
						bool: {
							should: [
								{
									nested: {
										path: 'pages',
										query: {
											bool: {
												should,
											},
										},
									},
								},
							],
						},
					},
				];
			}

			if (extSearchFields.length > 0) {
				const extQuery = {
					multi_match: {
						query: searchText,
						fields: [],
						operator: 'or',
					},
				};
				extQuery.multi_match.fields = extSearchFields.map((field) => field.toLowerCase());
				query.query.bool.must[0].bool.should = query.query.bool.must[0].bool.should.concat(extQuery);
			}

			if (filterQueries.length > 0) {
				query.query.bool.filter = filterQueries;
			}
			return query;
		} catch (err) {
			this.logger.error(err, 'M6THI27', user);
		}
	}

	getElasticsearchStatsQuery(
		{
			searchText,
			parsedQuery,
			limit = 20,
			charsPadding = 90,
			operator = 'and',
			storedFields = [
				'filename',
				'title',
				'page_count',
				'doc_type',
				'doc_num',
				'ref_list',
				'id',
				'summary_30',
				'keyw_5',
				'p_text',
				'type',
				'p_page',
				'display_title_s',
				'display_org_s',
				'display_doc_type_s',
			],
			extStoredFields = [],
			extSearchFields = [],
			edaSearchSettings = {},
		},
		user
	) {
		try {
			// add additional search fields to the query
			let filterQueries = [];

			filterQueries = filterQueries.concat(this.getEDASearchQuery(edaSearchSettings));

			storedFields = [...storedFields, ...extStoredFields];

			let query = {
				_source: {
					includes: ['extracted_data_eda_n', 'metadata_type_eda_ext'],
				},
				from: 0,
				size: limit,
				track_total_hits: true,
				query: {
					bool: {
						must: [
							{
								bool: {
									should: [
										{
											nested: {
												path: 'pages',
												inner_hits: {
													_source: false,
													stored_fields: ['pages.filename', 'pages.p_raw_text'],
													from: 0,
													size: 5,
													highlight: {
														fields: {
															'pages.filename.search': {
																number_of_fragments: 0,
															},
															'pages.p_raw_text': {
																fragment_size: 2 * charsPadding,
																number_of_fragments: 1,
															},
														},
														fragmenter: 'span',
													},
												},
												query: {
													bool: {
														should: [
															{
																wildcard: {
																	'pages.filename.search': {
																		value: `${parsedQuery}*`,
																		boost: 15,
																	},
																},
															},
															{
																query_string: {
																	query: `${parsedQuery}`,
																	default_field: 'pages.p_raw_text',
																	default_operator: `${operator}`,
																	fuzzy_max_expansions: 100,
																	fuzziness: 'AUTO',
																},
															},
														],
													},
												},
											},
										},
									],
								},
							},
						],
						should: [
							{
								multi_match: {
									query: `${parsedQuery}`,
									fields: ['keyw_5^2', 'id^2', 'summary_30', 'pages.p_raw_text'],
									operator: 'or',
								},
							},
							{
								rank_feature: {
									field: 'pagerank_r',
									boost: 0.5,
								},
							},
							{
								rank_feature: {
									field: 'kw_doc_score_r',
									boost: 0.1,
								},
							},
						],
					},
				},
			};

			// exclude certain terms or phrases
			if (edaSearchSettings.excludeTerms && edaSearchSettings.excludeTerms !== '') {
				let phrases = edaSearchSettings.excludeTerms.split(';');
				let should = [];

				phrases.forEach((phrase) => {
					should.push({
						wildcard: {
							'pages.filename.search': {
								value: `*${phrase}*`,
							},
						},
					});
					should.push({
						match_phrase: {
							'pages.p_raw_text': phrase,
						},
					});
				});

				query.query.bool.must_not = [
					{
						bool: {
							should: [
								{
									nested: {
										path: 'pages',
										query: {
											bool: {
												should,
											},
										},
									},
								},
							],
						},
					},
				];
			}

			if (extSearchFields.length > 0) {
				const extQuery = {
					multi_match: {
						query: searchText,
						fields: [],
						operator: 'or',
					},
				};
				extQuery.multi_match.fields = extSearchFields.map((field) => field.toLowerCase());
				query.query.bool.must[0].bool.should = query.query.bool.must[0].bool.should.concat(extQuery);
			}

			if (filterQueries.length > 0) {
				query.query.bool.must = query.query.bool.must.concat(filterQueries);
			}
			return query;
		} catch (err) {
			this.logger.error(err, 'M7THI27', user);
		}
	}

	getEDASearchQuery(settings) {
		const filterQueries = [];

		try {
			// summary view filter
			if (settings.issueAgency) {
				filterQueries.push({
					nested: {
						path: 'extracted_data_eda_n',
						query: {
							bool: {
								must: [
									{
										match: {
											'extracted_data_eda_n.contract_issue_office_name_eda_ext':
												settings.issueAgency,
										},
									},
								],
							},
						},
					},
				});
			}

			// ISSUE ORGANIZATION
			if (!settings.allOrgsSelected && settings.organizations && settings.organizations.length > 0) {
				const orgQuery = {
					nested: {
						path: 'fpds_ng_n',
						query: {
							bool: {
								should: [],
							},
						},
					},
				};

				const majcomQuery = {
					nested: {
						path: 'fpds_ng_n',
						query: {
							bool: {
								should: [],
							},
						},
					},
				};

				const orgMap = {
					army: 'W*',
					navy: 'N* OR M*',
					'air force': 'F*',
				};

				let orgString = '';

				const orgs = settings.organizations;
				for (let i = 0; i < orgs.length; i++) {
					const org = orgs[i];

					// for filtering by MAJCOM / sub orgs
					if (settings.majcoms && settings.majcoms[org] && settings.majcoms[org].length > 0) {
						for (const subOrg of settings.majcoms[org]) {
							majcomQuery.nested.query.bool.should.push({
								match: {
									'fpds_ng_n.contracting_agency_name_eda_ext': {
										query: subOrg,
										operator: 'AND',
									},
								},
							});
						}
						filterQueries.push(majcomQuery);
					}

					// for Issue Organization (no specific majcoms selected)
					// we construct the string that goes in the query field for ES query_string
					if (!settings.majcoms[org] || settings.majcoms[org].length === 0) {
						let orgText = '';
						if (orgMap[org]) {
							orgText = orgMap[org];
						}

						orgString += `${i !== 0 ? ' OR ' : ''}${orgText}`;
					}
				}

				if (orgString && orgString.length > 0) {
					orgQuery.nested.query.bool.should.push({
						query_string: {
							query: orgString,
							default_field: 'fpds_ng_n.contracting_office_code_eda_ext',
						},
					});
					filterQueries.push(orgQuery);
				}
			}

			// DATE RANGE
			if (settings.startDate || settings.endDate) {
				const rangeQuery = {
					nested: {
						path: 'fpds_ng_n',
						query: {
							range: {
								'fpds_ng_n.date_signed_eda_ext_dt': {},
							},
						},
					},
				};

				let push = false;

				if (settings.startDate) {
					rangeQuery.nested.query.range['fpds_ng_n.date_signed_eda_ext_dt'].gte = settings.startDate;
					push = true;
				}

				if (settings.endDate) {
					rangeQuery.nested.query.range['fpds_ng_n.date_signed_eda_ext_dt'].lte = settings.endDate;
					push = true;
				}

				if (push) {
					filterQueries.push(rangeQuery);
				}
			}

			// ISSUE OFFICE DODAAC
			if (settings.issueOfficeDoDAAC && settings.issueOfficeDoDAAC.length > 0) {
				filterQueries.push(
					this.getFilterQuery('fpds_ng_n.contracting_office_code_eda_ext', settings.issueOfficeDoDAAC)
				);
			}

			// ISSUE OFFICE NAME
			if (settings.issueOfficeName && settings.issueOfficeName.length > 0) {
				filterQueries.push(
					this.getFilterQuery('fpds_ng_n.contracting_office_name_eda_ext', settings.issueOfficeName)
				);
			}

			// FISCAL YEARS
			if (settings.allYearsSelected === false && settings.fiscalYears) {
				const nestedQuery = {
					nested: {
						path: 'fpds_ng_n',
						query: {
							bool: {
								should: [],
							},
						},
					},
				};

				for (const year of settings.fiscalYears) {
					const ceil = parseInt(year) + 1;
					nestedQuery.nested.query.bool.should.push({
						range: {
							'fpds_ng_n.date_signed_eda_ext_dt': {
								gte: year,
								lte: ceil.toString(),
								format: 'yyyy',
							},
						},
					});
				}
				filterQueries.push(nestedQuery);
			}

			// DATA SOURCE
			if (settings.allDataSelected === false && settings.contractData) {
				const contractTypes = Object.keys(settings.contractData);
				const filterQuery = {
					bool: {
						should: [],
					},
				};
				let metadataText = '';

				// set up query based on PDS, SYN, or PDF selected
				for (const contractType of contractTypes) {
					if (settings.contractData[contractType]) {
						if (contractType === 'none') {
							// PDF
							filterQuery.bool.should.push({
								match: {
									is_supplementary_data_included_eda_ext_b: false,
								},
							});
						} else if (contractType === 'fpds') {
							filterQueries.push(this.getFilterQuery('fpds_ng_n.contracting_office_code_eda_ext', ''));
						} else {
							// PDS or SYN
							metadataText += contractType + ', ';
						}
					}
				}

				if (metadataText != '') {
					metadataText = metadataText.substring(0, metadataText.length - 2);
					filterQuery.bool.should.push({
						bool: {
							must: [
								{
									match: {
										metadata_type_eda_ext: metadataText,
									},
								},
								{
									match: {
										is_supplementary_data_included_eda_ext_b: true,
									},
								},
							],
						},
					});
				}

				if (filterQuery.bool.should.length > 0) {
					filterQueries.push(filterQuery);
				}
			}

			// OBLIGATED AMOUNT
			if (
				(settings.minObligatedAmount && settings.minObligatedAmount.length > 0) ||
				(settings.maxObligatedAmount && settings.maxObligatedAmount.length > 0)
			) {
				const rangeQuery = {
					nested: {
						path: 'fpds_ng_n',
						query: {
							range: {
								'fpds_ng_n.dollars_obligated_eda_ext_f': {},
							},
						},
					},
				};

				let push = false;

				if (settings.minObligatedAmount && settings.minObligatedAmount.length > 0) {
					rangeQuery.nested.query.range['fpds_ng_n.dollars_obligated_eda_ext_f'].gte =
						settings.minObligatedAmount;
					push = true;
				}

				if (settings.maxObligatedAmount && settings.maxObligatedAmount.length > 0) {
					rangeQuery.nested.query.range['fpds_ng_n.dollars_obligated_eda_ext_f'].lte =
						settings.maxObligatedAmount;
					push = true;
				}

				if (push) {
					filterQueries.push(rangeQuery);
				}
			}

			// CONTRACTS OR MODS
			if (settings.contractsOrMods !== 'both') {
				const filterQuery = {
					match: {
						mod_identifier_eda_ext: 'base_award',
					},
				};

				const boolQuery = {
					bool: {
						must_not: [
							{
								term: {
									mod_identifier_eda_ext: 'base_award',
								},
							},
						],
					},
				};

				if (settings.contractsOrMods === 'contracts') {
					filterQueries.push(filterQuery);
				} else if (settings.contractsOrMods === 'mods') {
					filterQueries.push(boolQuery);
				}
			}

			// VENDOR NAME
			if (settings.vendorName && settings.vendorName.length > 0) {
				filterQueries.push(this.getFilterQuery('fpds_ng_n.vendor_name_eda_ext', settings.vendorName));
			}

			// FUNDING OFFICE CODE
			if (settings.fundingOfficeCode && settings.fundingOfficeCode.length > 0) {
				filterQueries.push(
					this.getFilterQuery('fpds_ng_n.funding_office_code_eda_ext', settings.fundingOfficeCode)
				);
			}

			// IDV PIID
			if (settings.idvPIID && settings.idvPIID.length > 0) {
				filterQueries.push(this.getFilterQuery('fpds_ng_n.idv_piid_eda_ext', settings.idvPIID));
			}

			// MOD NUMBER
			if (settings.modNumber && settings.modNumber.length > 0) {
				filterQueries.push(this.getFilterQuery('fpds_ng_n.modification_number_eda_ext', settings.modNumber));
			}

			// PSC DESC
			if (settings.pscDesc && settings.pscDesc.length > 0) {
				filterQueries.push(this.getFilterQuery('fpds_ng_n.psc_desc_eda_ext', settings.pscDesc));
			}

			// PIID
			if (settings.piid && settings.piid.length > 0) {
				filterQueries.push(this.getFilterQuery('fpds_ng_n.piid_eda_ext', settings.piid));
			}

			// DESCRIPTION OF REQUIREMENTS
			if (settings.reqDesc && settings.reqDesc.length > 0) {
				filterQueries.push(
					this.getFilterQuery('fpds_ng_n.description_of_requirement_eda_ext', settings.reqDesc)
				);
			}

			// PSC
			if (settings.psc && settings.psc.length > 0) {
				filterQueries.push(this.getFilterQuery('fpds_ng_n.psc_eda_ext', settings.psc));
			}

			// FUNDING AGENCY NAME
			if (settings.fundingAgencyName && settings.fundingAgencyName.length > 0) {
				filterQueries.push(
					this.getFilterQuery('fpds_ng_n.funding_agency_name_eda_ext', settings.fundingAgencyName)
				);
			}

			// NAICS
			if (settings.naicsCode && settings.naicsCode.length > 0) {
				filterQueries.push(this.getFilterQuery('fpds_ng_n.naics_code_eda_ext', settings.naicsCode));
			}

			// DUNS
			if (settings.duns && settings.duns.length > 0) {
				filterQueries.push(this.getFilterQuery('fpds_ng_n.duns_eda_ext', settings.duns));
			}
		} catch (err) {
			console.log(err);
			this.logger.error(err.message, 'FKJ37ZZ', user);
		}

		return filterQueries;
	}

	// provide the setting field name, the elasticsearch field name, and the field values
	// return the ES nested query to add to a filtered query
	getFilterQuery(esFieldName, fieldValue) {
		const regex = /[\+\-\=\&\|\>\<\!\(\)\{\}\[\]\^\"\~\*\?\:\\\/]+/g;
		const matches = fieldValue.match(regex);

		if (matches) {
			for (let i = 0; i < matches.length; i++) {
				fieldValue = fieldValue.replace(matches[i], `\\${matches[i]}`);
			}
		}

		return {
			nested: {
				path: 'fpds_ng_n',
				query: {
					bool: {
						should: [
							{
								query_string: {
									query: `*${fieldValue}*`,
									default_field: esFieldName,
									fuzziness: 2,
								},
							},
						],
					},
				},
			},
		};
	}

	cleanUpEsResults(raw, searchTerms, user, selectedDocuments, expansionDict, index, query) {
		try {
			let results = {
				query,
				totalCount:
					selectedDocuments && selectedDocuments.length > 0
						? selectedDocuments.length
						: raw.body.hits.total.value,
				docs: [],
			};

			let docTypes = [];
			let docOrgs = [];

			const { body = {} } = raw;
			const { aggregations = {} } = body;
			const { doc_type_aggs = {}, doc_org_aggs = {} } = aggregations;
			const type_buckets = doc_type_aggs.buckets ? doc_type_aggs.buckets : [];
			const org_buckets = doc_org_aggs.buckets ? doc_org_aggs.buckets : [];

			type_buckets.forEach((agg) => {
				docTypes.push(agg);
			});

			org_buckets.forEach((agg) => {
				docOrgs.push(agg);
			});

			results.doc_types = docTypes;
			results.doc_orgs = docOrgs;

			raw.body.hits.hits.forEach((r) => {
				let result = this.searchUtility.transformEsFields(r.fields);
				const { _source = {}, fields = {}, _score = 0 } = r;
				const { topics_s = {} } = _source;
				result.topics_s = topics_s;
				result.score = _score;

				if (
					!selectedDocuments ||
					selectedDocuments.length === 0 ||
					selectedDocuments.indexOf(result.filename) !== -1
				) {
					result.pageHits = [];
					const pageSet = new Set();

					if (r.inner_hits) {
						if (r.inner_hits.pages) {
							r.inner_hits.pages.hits.hits.forEach((phit) => {
								const pageIndex = phit._nested.offset;
								// const snippet =  phit.fields["pages.p_raw_text"][0];
								let pageNumber = pageIndex + 1;
								// one hit per page max
								if (!pageSet.has(pageNumber)) {
									const [snippet, usePageZero] = this.searchUtility.getESHighlightContent(phit, user);
									if (usePageZero) {
										if (pageSet.has(0)) {
											return;
										} else {
											pageNumber = 0;
											pageSet.add(0);
										}
									}
									pageSet.add(pageNumber);
									result.pageHits.push({ snippet, pageNumber });
								}
							});
						} else {
							Object.keys(r.inner_hits).forEach((id) => {
								const { file_location_eda_ext } = _source;
								result.file_location_eda_ext = file_location_eda_ext;
								result.score = _score;
								r.inner_hits[id].hits.hits.forEach((phit) => {
									const pageIndex = phit._nested.offset;
									const paragraphIdBeingMatched = parseInt(id);
									const text = phit.fields['pages.p_raw_text'][0];
									const score = phit._score;
									let pageNumber = pageIndex + 1;

									// one hit per page max
									if (!pageSet.has(pageNumber)) {
										const [snippet, usePageZero] = this.searchUtility.getESHighlightContent(
											phit,
											user
										);
										if (usePageZero) {
											if (pageSet.has(0)) {
												return;
											} else {
												pageNumber = 0;
												pageSet.add(0);
											}
										}
										pageSet.add(pageNumber);
										result.pageHits.push({
											snippet,
											pageNumber,
											paragraphIdBeingMatched,
											score,
											text,
											id,
										});
									}
								});
							});
						}
					}

					result.pageHits.sort((a, b) => a.pageNumber - b.pageNumber);
					if (r.highlight) {
						if (r.highlight['title.search']) {
							result.pageHits.push({ title: 'Title', snippet: r.highlight['title.search'][0] });
						}
						if (r.highlight.keyw_5) {
							result.pageHits.push({ title: 'Keywords', snippet: r.highlight.keyw_5[0] });
						}
					}
					result.pageHitCount = pageSet.size;

					try {
						const { metadata_type_eda_ext } = fields;
						result.metadata_type_eda_ext = metadata_type_eda_ext && metadata_type_eda_ext[0];
						result = this.getExtractedFields(_source, result);
					} catch (err) {
						console.log(err);
						console.log('Error parsing EDA fields');
					}

					result.esIndex = index;

					if (Array.isArray(result['keyw_5'])) {
						result['keyw_5'] = result['keyw_5'].join(', ');
					} else {
						result['keyw_5'] = '';
					}
					if (!result.ref_list) {
						result.ref_list = [];
					}
					results.docs.push(result);
				}
			});
			results.searchTerms = searchTerms;
			results.expansionDict = expansionDict;

			return results;
		} catch (err) {
			console.log(err);
			this.logger.error(err.message, 'FKJ37ZU', user);
		}
	}

	getExtractedFields(source, result) {
		const { extracted_data_eda_n, fpds_ng_n } = source;
		const data = extracted_data_eda_n;

		if (!data) {
			return result;
		}

		// temporarily pull in all fpds data
		if (fpds_ng_n) {
			let fpdsKeys = Object.keys(fpds_ng_n);
			for (let i = 0; i < fpdsKeys.length; i++) {
				result['fpds_' + fpdsKeys[i]] = fpds_ng_n[fpdsKeys[i]];
			}
		}

		// Contract Issuing Office Name and Contract Issuing Office DoDaaC
		result.contract_issue_name_eda_ext = data.contract_issue_office_name_eda_ext;
		result.contract_issue_dodaac_eda_ext = data.contract_issue_office_dodaac_eda_ext; // issue dodaac

		// Vendor Name, Vendor DUNS, and Vendor CAGE
		result.vendor_name_eda_ext = data.vendor_name_eda_ext;
		result.vendor_duns_eda_ext = data.vendor_duns_eda_ext;
		result.vendor_cage_eda_ext = data.vendor_cage_eda_ext;

		// Contract Admin Agency Name and Contract Admin Office DoDAAC
		const adminPresent = data.contract_issue_office_dodaac_eda_ext != data.contract_admin_office_dodaac_eda_ext;
		if (adminPresent) {
			result.contract_admin_name_eda_ext = data.contract_admin_agency_name_eda_ext;
			result.contract_admin_office_dodaac_eda_ext = data.contract_admin_office_dodaac_eda_ext; // admin dodaac
		}

		// Paying Office
		result.paying_office_name_eda_ext = data.contract_payment_office_name_eda_ext;
		result.paying_office_dodaac_eda_ext = data.contract_payment_office_dodaac_eda_ext; // paying dodaac

		// Modifications
		result.modification_eda_ext = data.modification_number_eda_ext;

		// Award ID and Reference IDV
		if (data.award_id_eda_ext && data.award_id_eda_ext.length === 4) {
			result.award_id_eda_ext = data.referenced_idv_eda_ext + '-' + data.award_id_eda_ext;
		} else {
			result.award_id_eda_ext = data.award_id_eda_ext;
		}
		result.reference_idv_eda_ext = data.referenced_idv_eda_ext;

		// Signature Date and Effective Date
		result.signature_date_eda_ext = data.signature_date_eda_ext_dt;
		result.effective_date_eda_ext = data.effective_date_eda_ext_dt;

		// Obligated Amounts
		result.obligated_amounts_eda_ext = data.total_obligated_amount_eda_ext_f;

		// NAICS
		result.naics_eda_ext = data.naics_eda_ext;
		result.issuing_organization_eda_ext = data.dodaac_org_type_eda_ext;

		// get paying, admin, issue
		if (data.vendor_org_hierarchy_eda_n && data.vendor_org_hierarchy_eda_n.vendor_org_eda_ext_n) {
			const orgData = data.vendor_org_hierarchy_eda_n.vendor_org_eda_ext_n;

			for (const org of orgData) {
				if (org.dodaac_eda_ext) {
					if (org.dodaac_eda_ext === result.contract_issue_dodaac_eda_ext) {
						// match issue office
						result.contract_issue_majcom_eda_ext = org.majcom_display_name_eda_ext; // majcom
					} else if (org.dodaac_eda_ext === result.paying_office_dodaac_eda_ext) {
						// match paying office
						result.paying_office_majcom_eda_ext = org.majcom_display_name_eda_ext; // majcom
					} else if (adminPresent && org.dodaac_eda_ext === result.contract_admin_name_eda_ext) {
						// match admin office
						result.contract_admin_majcom_eda_ext = org.majcom_display_name_eda_ext; // majcom
					}
				}
			}
		}

		return result;
	}

	getEDAContractQuery(award = '', idv = '', isAward = false, isSearch = false, user) {
		try {
			let query = {
				_source: {
					includes: [
						'extracted_data_eda_n.modification_number_eda_ext',
						'extracted_data_eda_n.signature_date_eda_ext_dt',
						'extracted_data_eda_n.effective_date_eda_ext_dt',
					],
				},
				from: 0,
				size: 10000,
				track_total_hits: true,
				query: {
					bool: {
						must: [
							{
								nested: {
									path: 'extracted_data_eda_n',
									query: {
										bool: {
											must: [
												{
													match: {
														'extracted_data_eda_n.award_id_eda_ext': {
															query: award,
														},
													},
												},
											],
										},
									},
								},
							},
						],
					},
				},
			};

			if (idv !== '') {
				query.query.bool.must.push({
					nested: {
						path: 'extracted_data_eda_n',
						query: {
							bool: {
								must: [
									{
										match: {
											'extracted_data_eda_n.referenced_idv_eda_ext': {
												query: idv,
											},
										},
									},
								],
							},
						},
					},
				});
			}

			if (isAward) {
				query.query.bool.must.push({
					match: {
						mod_identifier_eda_ext: 'base_award',
					},
				});
			}

			if (isSearch || isAward) {
				query._source.includes = ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'];
				query.stored_fields = [
					'filename',
					'title',
					'page_count',
					'doc_type',
					'doc_num',
					'ref_list',
					'id',
					'summary_30',
					'keyw_5',
					'p_text',
					'type',
					'p_page',
					'display_title_s',
					'display_org_s',
					'display_doc_type_s',
					'metadata_type_eda_ext',
				];
			}
			return query;
		} catch (err) {
			this.logger.error(err, 'S5PJASQ', user);
		}
	}

	splitAwardID(awardID) {
		// award ID can be a combination of 2 fields
		const awardIDSplit = awardID.split('-');
		let id = '';
		let idv = '';
		if (awardIDSplit.length > 1) {
			id = awardIDSplit[1];
			idv = awardIDSplit[0];
		} else {
			id = awardID;
		}

		return { id, idv };
	}

	getESSimilarityQuery(pages, filters) {
		let filterQueries = [];
		filterQueries = filterQueries.concat(this.getEDASearchQuery(filters));

		const pagesQuery = pages.map((page) => {
			return {
				nested: {
					score_mode: 'max',
					path: 'pages',
					query: {
						match: { 'pages.p_raw_text': page.text },
					},
					inner_hits: {
						_source: false,
						stored_fields: ['pages.filename', 'pages.p_raw_text'],
						from: 0,
						size: 5,
						name: page.id.toString(),
						highlight: {
							fields: {
								'pages.filename.search': {
									number_of_fragments: 0,
								},
								'pages.p_raw_text': {
									fragment_size: 2,
									number_of_fragments: 1,
								},
							},
							fragmenter: 'span',
						},
					},
				},
			};
		});

		const query = {
			track_total_hits: true,
			size: 10,
			_source: {
				includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', 'file_location_eda_ext'],
			},
			stored_fields: [
				'filename',
				'title',
				'page_count',
				'doc_type',
				'doc_num',
				'ref_list',
				'id',
				'summary_30',
				'keyw_5',
				'p_text',
				'type',
				'p_page',
				'display_title_s',
				'display_org_s',
				'display_doc_type_s',
				'is_revoked_b',
				'access_timestamp_dt',
				'publication_date_dt',
				'crawler_used_s',
				'topics_s',
			],
			query: {
				bool: {
					must: filterQueries,
					should: pagesQuery,
				},
			},
		};

		return query;
	}
}

module.exports = EDASearchUtility;
