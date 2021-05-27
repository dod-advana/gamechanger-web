const LOGGER = require('../../lib/logger');
const constantsFile = require('../../config/constants');
const SearchUtility = require('../../utils/searchUtility');

class EDASearchUtility {
    constructor(opts = {}) {

        const {
            logger = LOGGER,
            constants = constantsFile,
			searchUtility = new SearchUtility(opts)
        } = opts;

        this.logger = logger;
		this.constants = constants;
		this.searchUtility = searchUtility;

        this.getElasticsearchPagesQuery = this.getElasticsearchPagesQuery.bind(this);
        this.getElasticsearchStatsQuery = this.getElasticsearchStatsQuery.bind(this);
        this.cleanUpEsResults = this.cleanUpEsResults.bind(this);
    }

    getElasticsearchPagesQuery(
		{
			searchText,
			parsedQuery,
			offset = 0,
			limit = 20,
			charsPadding = 90,
			operator = 'and',
			searchFields = {},
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
				'display_doc_type_s'
			],
			extStoredFields = [],
			extSearchFields = [],
			edaSearchSettings = {}
		}, user) {
	
		try {
			// add additional search fields to the query
			const mustQueries = [];
	
			for (const key in searchFields) {
				const searchField = searchFields[key];
				if (searchField.field && searchField.field.name && searchField.input && searchField.input.length !== 0) {
					const wildcard = { wildcard: {} };
					wildcard.wildcard[`${searchField.field.name}${searchField.field.searchField ? '.search' : ''}`] = { value: `*${searchField.input}*` };
	
					mustQueries.push(wildcard);
				}
			}

			if (edaSearchSettings.allOrgsSelected === false && edaSearchSettings.organizations) {
				const matchQuery = 					
				{ 
					"nested": {
						"path": "extracted_data_eda_n",
						"query": {
							"bool": {
								"should": []
							}
						}
					}
				}

				const orgs = Object.keys(edaSearchSettings.organizations).filter(org => edaSearchSettings.organizations[org]).map(org => org.toLowerCase())
				for (const org of orgs) {
					matchQuery.nested.query.bool.should.push(
						{
							"match": {
								"extracted_data_eda_n.dodaac_org_type_eda_ext": org
							}
						}
					);
				}
				mustQueries.push(matchQuery);
			}
	
			if (edaSearchSettings.issueAgency) {
				mustQueries.push( 
					{
						"nested": {
							"path": "extracted_data_eda_n",
							"query": {
								"bool": {
									"must": [
										{ "match" : { "extracted_data_eda_n.contract_issue_office_name_eda_ext": edaSearchSettings.issueAgency}}
									]
								}
							}
						}
					}
				);
			}	
			
			if (edaSearchSettings.startDate || edaSearchSettings.endDate) {
				const rangeQuery = {
					nested: {
						path: "extracted_data_eda_n",
						query: {
							range: {
								"extracted_data_eda_n.signature_date_eda_ext_dt": {}
							}
						}
					}
	
				};
	
				let push = false;
	
				if (edaSearchSettings.startDate) {
					rangeQuery.nested.query.range["extracted_data_eda_n.signature_date_eda_ext_dt"].gte = edaSearchSettings.startDate; //Math.round(start.getTime() / 1000)
					push = true;
				}
				
				if (edaSearchSettings.endDate) {
					rangeQuery.nested.query.range["extracted_data_eda_n.signature_date_eda_ext_dt"].lte = edaSearchSettings.endDate // Math.round(end.getTime() / 1000)
					push = true;	
				}
	
				if (push) {
					mustQueries.push(rangeQuery);
				}
			}

			if (edaSearchSettings.issueOffice && edaSearchSettings.issueOffice.length > 0) {
				mustQueries.push ({
					nested: {
						path: "extracted_data_eda_n",
						query: {
							bool: {
								must: [
									{ "match" : { "extracted_data_eda_n.contract_issue_office_dodaac_eda_ext": edaSearchSettings.issueOffice}}
								]
							}
						}
					}
				});
			}

			if (edaSearchSettings.allYearsSelected === false && edaSearchSettings.fiscalYears) {
				const nestedQuery = {
					nested: {
						path: "extracted_data_eda_n",
						query: {
							bool: {
								should: []
							}
						}
					}
				}

				for (const year of edaSearchSettings.fiscalYears) {
					const ceil = parseInt(year) + 1;
					nestedQuery.nested.query.bool.should.push({
						range: {
							"extracted_data_eda_n.signature_date_eda_ext_dt": {
								gte: year,
								lte: ceil.toString(),
								format: 'yyyy'
							}
						}
					})
				}
				mustQueries.push(nestedQuery);
			}

			if (edaSearchSettings.allDataSelected === false && edaSearchSettings.contractData) {
				const contractTypes = Object.keys(edaSearchSettings.contractData);
				const mustQuery = {
					bool: {
						should: []
					}
				}
				let metadataText = '';

				// set up query based on PDS, SYN, or PDF selected
				for (const contractType of contractTypes) {
					if (edaSearchSettings.contractData[contractType]) {
						if (contractType === 'none') { // PDF
							mustQuery.bool.should.push(
								{
									match: {
										is_supplementary_data_included_eda_ext_b: false
									}
								}
							)
						}
						else { // PDS or SYN
							metadataText += contractType + ", ";
						}
					}
				}

				if (metadataText != '') {
					metadataText = metadataText.substring(0, metadataText.length - 2);
					mustQuery.bool.should.push(
						{
							bool: {
								must: [
									{
										match: {
											metadata_type_eda_ext: metadataText
										}
									},
									{
										match: {
											is_supplementary_data_included_eda_ext_b: true
										}
									}
								]
							}
						}
						
					)
				}

				if (mustQuery.bool.should.length > 0) {
					mustQueries.push(mustQuery);
				}
			}
	
			storedFields = [...storedFields, ...extStoredFields];
	
			let query = {
				_source: {
					includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*', 'is_supplementary_data_included_eda_ext_b']
				},
				stored_fields: storedFields,
				from: offset,
				size: limit,
				// aggregations: {
				// 	doc_type_aggs: {
				// 		terms: {
				// 			field: 'doc_type',
				// 			size: 10000
				// 		}
				// 	}
				// },
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
													stored_fields: [
														'pages.filename',
														'pages.p_raw_text'
													],
													from: 0,
													size: 5,
													highlight: {
														fields: {
															'pages.filename.search': {
																number_of_fragments: 0
															},
															'pages.p_raw_text': {
																fragment_size: 2 * charsPadding,
																number_of_fragments: 1
															}
														},
														fragmenter: 'span'
													}
												},
												query: {
													bool: {
														should: [
															{
																wildcard: {
																	'pages.filename.search': {
																		value: `${parsedQuery}*`,
																		boost: 15
																	}
																}
															},
															{
																query_string: {
																	query: `${parsedQuery}`,
																	default_field: 'pages.p_raw_text',
																	default_operator: `${operator}`,
																	fuzzy_max_expansions: 100,
																	fuzziness: 'AUTO'
																}
															}
														]
													}
												}
											}
										}
									]
								}
							}
						],
						should: [
							{
								multi_match: {
									query: `${parsedQuery}`,
									fields: [
										'keyw_5^2',
										'id^2',
										'summary_30',
										'pages.p_raw_text'
									],
									operator: 'or'
								}
							},
							{
								rank_feature: {
									field: 'pagerank_r',
									boost: 0.5
								}
							},
							{
								rank_feature: {
									field: 'kw_doc_score_r',
									boost: 0.1
								}
							}
						]
					}
				}
			};
	
			if (extSearchFields.length > 0){
				const extQuery = {
					multi_match: {
						query: searchText,
						fields: [],
						operator: 'or'
					}
				};
				extQuery.multi_match.fields = extSearchFields.map((field) => field.toLowerCase());
				// query.query.bool.should = query.query.bool.should.concat(extQuery);
				query.query.bool.must[0].bool.should = query.query.bool.must[0].bool.should.concat(extQuery);
			}

	
			if (mustQueries.length > 0) {
				query.query.bool.must = query.query.bool.must.concat(mustQueries);
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
			offset = 0,
			limit = 20,
			charsPadding = 90,
			operator = 'and',
			searchFields = {},
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
				'display_doc_type_s'
			],
			extStoredFields = [],
			extSearchFields = [],
			edaSearchSettings = {}
		}, user) {
	
		try {
			// add additional search fields to the query
			const mustQueries = [];
	
			for (const key in searchFields) {
				const searchField = searchFields[key];
				if (searchField.field && searchField.field.name && searchField.input && searchField.input.length !== 0) {
					const wildcard = { wildcard: {} };
					wildcard.wildcard[`${searchField.field.name}${searchField.field.searchField ? '.search' : ''}`] = { value: `*${searchField.input}*` };
	
					mustQueries.push(wildcard);
				}
			}
	
			if (edaSearchSettings.issueAgency) {
				mustQueries.push( 
					{
						"nested": {
							"path": "extracted_data_eda_n",
							"query": {
								"bool": {
									"must": [
										{ "match" : { "extracted_data_eda_n.contract_issue_office_name_eda_ext": edaSearchSettings.issueAgency}}
									]
								}
							}
						}
					}
				);
			}	

			if (!edaSearchSettings.allOrgsSelected && edaSearchSettings.organizations) {
				const matchQuery = 					
				{ 
					"nested": {
						"path": "extracted_data_eda_n",
						"query": {
							"bool": {
								"should": []
							}
						}
					}
				}

				const orgs = Object.keys(edaSearchSettings.organizations).filter(org => edaSearchSettings.organizations[org]).map(org => org.toLowerCase())
				for (const org of orgs) {
					matchQuery.nested.query.bool.should.push(
						{
							"match": {
								"extracted_data_eda_n.dodaac_org_type_eda_ext": org
							}
						}
					);
				}
				mustQueries.push(matchQuery);
			}
			
			if (edaSearchSettings.startDate || edaSearchSettings.endDate) {
				const rangeQuery = {
					nested: {
						path: "extracted_data_eda_n",
						query: {
							range: {
								"extracted_data_eda_n.signature_date_eda_ext_dt": {}
							}
						}
					}
	
				};
	
				let push = false;
	
				if (edaSearchSettings.startDate) {
					rangeQuery.nested.query.range["extracted_data_eda_n.signature_date_eda_ext_dt"] = {
						gte: edaSearchSettings.startDate //Math.round(start.getTime() / 1000)
					}
					push = true;
				}
				
				if (edaSearchSettings.endDate) {
					rangeQuery.nested.query.range["extracted_data_eda_n.signature_date_eda_ext_dt"] = {
						lte: edaSearchSettings.endDate // Math.round(end.getTime() / 1000)
					}
					push = true;	
				}
	
				if (push) {
					mustQueries.push(rangeQuery);
				}
			}
	
			storedFields = [...storedFields, ...extStoredFields];
	
			let query = {
				_source: {
					includes: ['extracted_data_eda_n', 'metadata_type_eda_ext']
				},
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
													stored_fields: [
														'pages.filename',
														'pages.p_raw_text'
													],
													from: 0,
													size: 5,
													highlight: {
														fields: {
															'pages.filename.search': {
																number_of_fragments: 0
															},
															'pages.p_raw_text': {
																fragment_size: 2 * charsPadding,
																number_of_fragments: 1
															}
														},
														fragmenter: 'span'
													}
												},
												query: {
													bool: {
														should: [
															{
																wildcard: {
																	'pages.filename.search': {
																		value: `${parsedQuery}*`,
																		boost: 15
																	}
																}
															},
															{
																query_string: {
																	query: `${parsedQuery}`,
																	default_field: 'pages.p_raw_text',
																	default_operator: `${operator}`,
																	fuzzy_max_expansions: 100,
																	fuzziness: 'AUTO'
																}
															}
														]
													}
												}
											}
										}
									]
								}
							}
						],
						should: [
							{
								multi_match: {
									query: `${parsedQuery}`,
									fields: [
										'keyw_5^2',
										'id^2',
										'summary_30',
										'pages.p_raw_text'
									],
									operator: 'or'
								}
							},
							{
								rank_feature: {
									field: 'pagerank_r',
									boost: 0.5
								}
							},
							{
								rank_feature: {
									field: 'kw_doc_score_r',
									boost: 0.1
								}
							}
						]
					}
				}
			};
	
			if (extSearchFields.length > 0){
				const extQuery = {
					multi_match: {
						query: searchText,
						fields: [],
						operator: 'or'
					}
				};
				extQuery.multi_match.fields = extSearchFields.map((field) => field.toLowerCase());
				// query.query.bool.should = query.query.bool.should.concat(extQuery);
				query.query.bool.must[0].bool.should = query.query.bool.must[0].bool.should.concat(extQuery);
			}

	
			if (mustQueries.length > 0) {
				query.query.bool.must = query.query.bool.must.concat(mustQueries);
			}

			return query;
		} catch (err) {
			this.logger.error(err, 'M7THI27', user);
		}
	}

    cleanUpEsResults(raw, searchTerms, user, selectedDocuments, expansionDict, index, query) {
		try {
			let results = {
				query,
				totalCount: (selectedDocuments && selectedDocuments.length > 0) ? selectedDocuments.length : raw.body.hits.total.value,
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
				const { _source = {}, fields = {} } = r;
				const { topics_rs = {} } = _source;
				result.topics_rs = Object.keys(topics_rs);
	
				if (!selectedDocuments || selectedDocuments.length === 0 || (selectedDocuments.indexOf(result.filename) !== -1)) {
					result.pageHits = [];
					const pageSet = new Set();
					if (r.inner_hits.paragraphs) {
						r.inner_hits.paragraphs.hits.hits.forEach((parahit) => {
							const pageIndex = parahit.fields['paragraphs.page_num_i'][0];
							let pageNumber = pageIndex + 1;
							// one hit per page max
							if (!pageSet.has(pageNumber)) {
								const [snippet, usePageZero] = this.searchUtility.getESHighlightContent(parahit, user);
								// use page 0 for title matches or errors
								// but only allow 1
								if (usePageZero) {
									if (pageSet.has(0)) {
										return;
									} else {
										pageNumber = 0;
										pageSet.add(0);
									}
								}
	
								pageSet.add(pageNumber);
								result.pageHits.push({snippet, pageNumber});
							}
						});
						result.pageHits.sort((a, b) => a.pageNumber - b.pageNumber);
						if(r.highlight){
							if(r.highlight['title.search']){
								result.pageHits.push({title: 'Title', snippet: r.highlight['title.search'][0]});
							}						
							if(r.highlight.keyw_5){
								result.pageHits.push({title: 'Keywords', snippet: r.highlight.keyw_5.join(', ')});
							}
						}
						result.pageHitCount = pageSet.size;
	
					} else {
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
								result.pageHits.push({snippet, pageNumber });
							}
						});
						result.pageHits.sort((a, b) => a.pageNumber - b.pageNumber);
						if(r.highlight){
							if(r.highlight['title.search']){
								result.pageHits.push({title: 'Title', snippet: r.highlight['title.search'][0]});
							}						
							if(r.highlight.keyw_5){
								result.pageHits.push({title: 'Keywords', snippet: r.highlight.keyw_5[0]});
							}
						}
						result.pageHitCount = pageSet.size;
	
						try {
							const {metadata_type_eda_ext} = fields;
							result.metadata_type_eda_ext = metadata_type_eda_ext && metadata_type_eda_ext[0];
							result = this.getExtractedFields(_source, result);
						}
						catch(err) {
							console.log(err);
							console.log('Error parsing EDA fields')
						}
					}
	
					result.esIndex = index;
	
					if (Array.isArray(result['keyw_5'])){
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
			this.logger.error(err.message, 'GL7EDI3', user);
		}
	}

	getExtractedFields(source, result) {
		const { extracted_data_eda_n } = source;
		const data = extracted_data_eda_n;

		if (!data) {
			return result;
		}

		// Contract Issuing Office Name and Contract Issuing Office DoDaaC
		result.contract_issue_name_eda_ext = data.contract_issue_office_name_eda_ext;
		result.contract_issue_dodaac_eda_ext = data.contract_issue_office_dodaac_eda_ext;

		// Issuing Organization
		if (data.dodaac_org_type_eda_ext) {
			const orgToDisplay = {
				army: "Army",
				airforce: "Air Force",
				dla: "DLA",
				marinecorps: "Marine Corps",
				navy: "Navy",
				estate: "4th Estate"
			}

			result.issuing_organization_eda_ext = orgToDisplay[data.dodaac_org_type_eda_ext];
		}

		// Vendor Name, Vendor DUNS, and Vendor CAGE
		result.vendor_name_eda_ext = data.vendor_name_eda_ext;
		result.vendor_duns_eda_ext = data.vendor_duns_eda_ext;
		result.vendor_cage_eda_ext = data.vendor_cage_eda_ext;

		// Contract Admin Agency Name and Contract Admin Office DoDAAC
		result.contract_admin_name_eda_ext = data.contract_admin_agency_name_eda_ext;
		result.contract_admin_office_dodaac_eda_ext = data.contract_admin_office_dodaac_eda_ext;

		// Paying Office
		result.paying_office_name_eda_ext = data.contract_payment_office_name_eda_ext;
		result.paying_office_dodaac_eda_ext = data.contract_payment_office_dodaac_eda_ext;

		// Modifications
		result.modification_eda_ext = data.modification_number_eda_ext;

		// Award ID and Reference IDV
		result.award_id_eda_ext = data.award_id_eda_ext;
		result.reference_idv_eda_ext = data.referenced_idv_eda_ext;

		// Signature Date and Effective Date
		result.signature_date_eda_ext = data.signature_date_eda_ext_dt;
		result.effective_date_eda_ext = data.effective_date_eda_ext_dt;

		// Obligated Amounts
		result.obligated_amounts_eda_ext = data.total_obligated_amount_eda_ext_f;

		// NAICS
		result.naics_eda_ext = data.naics_eda_ext;

		return result;
	}

}

module.exports = EDASearchUtility;
