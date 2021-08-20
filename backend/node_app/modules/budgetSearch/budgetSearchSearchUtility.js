const LOGGER = require('../../lib/logger');
const constantsFile = require('../../config/constants');
const SearchUtility = require('../../utils/searchUtility');

class BudgetSearchSearchUtility {
	constructor(opts = {}) {

        const {
            logger = LOGGER,
            constants = constantsFile,
			searchUtility = new SearchUtility(opts)
        } = opts;

		this.logger = logger;
		this.constants = constants;
		this.searchUtility = searchUtility;

		this.getElasticsearchQuery = this.getElasticsearchQuery.bind(this);
		this.cleanUpEsResults = this.cleanUpEsResults.bind(this);
		this.getMainPageQuery = this.getMainPageQuery.bind(this);
		this.transformEsFields = this.transformEsFields.bind(this);
	}

	getElasticsearchQuery(
		{ 
			searchText, 
			searchTerms, 
			parsedQuery, 
			orgFilterString = '', 
			typeFilterString = '',
			index, 
			offset = 0, 
			limit = 20, 
			format = 'json', 
			getIdList = false, 
			expandTerms = false, 
			isClone = false, 
			cloneData = {}, 
			charsPadding = 90, 
			operator = 'and', 
			searchFields = {}, 
			accessDateFilter = [], 
			publicationDateFilter = [], 
			publicationDateAllTime = true, 
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
				'is_revoked_b',
				'access_timestamp_dt',
				'publication_date_dt',
				'crawler_used_s',
				'download_url_s',
				'source_page_url_s',
				'source_fqdn_s'
			], 
			extStoredFields = [], 
			extSearchFields = [], 
			includeRevoked = false,
			sort = 'Relevance', 
			order = 'desc',
			includeHighlights = true,
			docIds = {}
		 }, 
		 user) {

		try {
			// add additional search fields to the query
			const mustQueries = [];
			for (const key in searchFields) {
				const searchField = searchFields[key];
				if (searchField.field && searchField.field.name && searchField.input && searchField.input.length !== 0) {
					const wildcard = { query_string: { query: `${searchField.field.name}:*${searchField.input}*` } };
					// wildcard.wildcard[`${searchField.field.name}${searchField.field.searchField ? '.search' : ''}`] = { value: `*${searchField.input}*` };

					mustQueries.push(wildcard);
				}
			}
			storedFields = [...storedFields, ...extStoredFields];
			const verbatimSearch = searchText.startsWith('"') && searchText.endsWith('"');
			const default_field = (verbatimSearch ? 'paragraphs.par_raw_text_t' :  'paragraphs.par_raw_text_t.gc_english')
			const analyzer = (verbatimSearch ? 'standard' :  'gc_english');
			let query = {
				_source: {
					includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', 'topics_rs']
				},
				stored_fields: storedFields,
				from: offset,
				size: limit,
				aggregations: {
					doc_type_aggs: {
						terms: {
							field: 'display_doc_type_s',
							size: 10000
						}
					},
					doc_org_aggs: {
						terms: {
							field: 'display_org_s',
							size: 10000
						}
					}
				},
				track_total_hits: true,
				query: {
					bool: {
						must:[],
						should: [
							{
								nested: {
									path: 'paragraphs',
									inner_hits: {
										_source: false,
										stored_fields: [
											'paragraphs.page_num_i',
											'paragraphs.par_raw_text_t'
										],
										from: 0,
										size: 5,
										highlight: {
											fields: {
												'paragraphs.par_raw_text_t': {
													fragment_size: 3 * charsPadding,
													number_of_fragments: 1,
													type: 'plain'


												},
												'paragraphs.par_raw_text_t.gc_english': {
													fragment_size: 3 * charsPadding,
													number_of_fragments: 1,
													type: 'plain'

												},
											},
											fragmenter: 'span'
										}
									},
									query: {
										bool: {
											should: [
												{
													query_string: {
														query: `${parsedQuery}`,
														default_field,
														default_operator: `${operator}`,
														fuzzy_max_expansions: 100,
														fuzziness: 'AUTO',
														analyzer
													}
												}
											]										
										}
									}
								}
							},
							{
								wildcard: {
									'keyw_5': {
										value: `*${parsedQuery}*`
									}
								}
							},
							{
								wildcard: {
									'display_title_s.search': {
										value: `*${parsedQuery}*`,
										boost: 6
									}
								}
							},
							{
								multi_match: {
									query: `${parsedQuery}`,
									fields: ['display_title_s.search'],
									operator: 'AND',
									type: 'phrase',
									boost: 4
								  }
							}
						],
						minimum_should_match: 1,

						filter: []
						
					}
				},
				highlight: {
					require_field_match: false,
					fields: {
						'display_title_s.search': {},
						'keyw_5': {},
						'id': {}
					},
					fragment_size: 10,
					fragmenter: 'simple',
					type: 'unified',
					boundary_scanner: 'word'

				}
			};

			switch(sort){
				case 'Relevance':
					query.sort = [ {"_score": {"order" : order}} ]
					break;
				case 'Publishing Date':
					query.sort = [ {"publication_date_dt": {"order" : order}} ]
					break;
				case 'Alphabetical':
					query.sort = [ {"display_title_s": {"order" : order}} ]
					break;
				case 'References':
					query.sort = [{"_script": {
						"type": "number",
						"script": "doc.ref_list.size()",
						"order": order
					}}]
				default: 
					break;
			} 

			if (extSearchFields.length > 0){
				const extQuery = {
					multi_match: {
						query: searchText,
						fields: [],
						operator: 'or'
					}
				};
				extQuery.multi_match.fields = extSearchFields.map((field) => field.toLowerCase());
				query.query.bool.should = query.query.bool.should.concat(extQuery);
			}

			if (this.constants.GAME_CHANGER_OPTS.allow_daterange && !publicationDateAllTime && publicationDateFilter[0] && publicationDateFilter[1]){
				if (!publicationDateAllTime && publicationDateFilter[0] && publicationDateFilter[1]) {
					query.query.bool.must.push({
						range: {
							publication_date_dt: {
								gte: publicationDateFilter[0].split('.')[0],
								lte: publicationDateFilter[1].split('.')[0]
							}
						}
					});
				}
			}

			if (!includeRevoked && !isClone) { // if includeRevoked, get return cancelled docs
				query.query.bool.filter.push({
					term: {
						is_revoked_b: 'false'
					}
				});
			}

			if (mustQueries.length > 0) {
				query.query.bool.must = query.query.bool.must.concat(mustQueries);

			}

			if ((!isClone) && (orgFilterString.length > 0)) {
				query.query.bool.filter.push(
					{
						terms: {
							display_org_s: orgFilterString
						}
					}
				);
			}
			if ((!isClone) && (typeFilterString.length > 0)) {
				query.query.bool.filter.push(
					{
						terms: {
							display_doc_type_s: typeFilterString
						}
					}
				);
			}
			if (includeHighlights == false) {
				delete query.query.bool.should[0].nested.inner_hits;
				delete query.highlight;
			}
			if (Object.keys(docIds).length !== 0){
				query.query.bool.must.push(
					{terms: {id: docIds}}
					)

			}
			return query;
		} catch (err) {
			this.logger.error(err, '4PAFB56', user);
		}
	}

	cleanUpEsResults(raw, searchTerms, user, selectedDocuments, expansionDict, index, query) {
		try {
			let results = {
				query,
				totalCount: (selectedDocuments && selectedDocuments.length > 0) ? selectedDocuments.length : raw.body.hits.total.value,
				docs: [],
			};
	
			raw.body.hits.hits.forEach((r) => {
				let result = this.transformEsFields(r._source);

				const { _source = {}, fields = {} } = r;
				const { topics_rs = {} } = _source;
				result.topics_rs = Object.keys(topics_rs);
				
				result.pageHits = [];
				const pageSet = new Set();

				if (r.inner_hits) {
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
						result = this.parseFields(result);
					}
					catch(err) {
						console.log(err);
						console.log('Error parsing BudgetSearch fields')
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
			this.logger.error(err.message, 'DVHAAHW', user);
		}
	}

	getMainPageQuery() {
		return {
			query: {
				match_all: {}
			}
		}
	}

	transformEsFields(raw) {
		let result = {};
		const arrayFields = ['keyw_5', 'ref_list', 'paragraphs', 'entities', 'abbreviations_n'];
		const budgetSearchArrayFields = ['meta_o', 'record_o']
		for (let key in raw) {
			if ((raw[key] && raw[key][0]) || Number.isInteger(raw[key]) || typeof raw[key] === 'object' && raw[key] !== null) {
				if (arrayFields.includes(key) || budgetSearchArrayFields.includes(key)) {
					result[key] = raw[key];
				} else if (Array.isArray(raw[key])) {
					result[key] = raw[key][0];
				} else {
					result[key] = raw[key];
				}
			} else {
				result[key] = null;
			}
		}
		return result;
	}

	parseFields(result) {
		const {
			meta_o,
			record_o
		} = result;

		const hasRecord = record_o;
		const hasMeta = meta_o;

		
	}

}

module.exports = BudgetSearchSearchUtility;
