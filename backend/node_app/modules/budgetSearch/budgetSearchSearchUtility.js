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
			parsedQuery, 
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
			docIds = {}
		 }, 
		 user) {

		try {
			// add additional search fields to the query
			const mustQueries = [];

			storedFields = [...storedFields, ...extStoredFields];
			const default_field = 'paragraphs.par_raw_text_t.gc_english';
			const analyzer = 'gc_english';
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

			if (mustQueries.length > 0) {
				query.query.bool.must = query.query.bool.must.concat(mustQueries);

			}


			if (Object.keys(docIds).length !== 0){
				query.query.bool.must.push(
					{terms: {id: docIds}}
					)

			}

			console.log(JSON.stringify(query));
			return query;
		} catch (err) {
			this.logger.error(err, '4PAFB56', user);
		}
	}

	cleanUpEsResults(raw, user, index) {
		try {
			let results = {
				totalCount: raw.body.hits.total.value,
				docs: [],
			};
	
			raw.body.hits.hits.forEach((r) => {
				let result = this.transformEsFields(r._source);

				try {
					result = this.getProjectData(result, index);
				}
				catch(err) {
					console.log(err);
					console.log('Error parsing BudgetSearch fields')
				}

				results.docs.push(result);
				
			});

			return results;
		} catch (err) {
			console.log(err);
			this.logger.error(err.message, 'DVHAAHW', user);
		}
	}

	getMainPageQuery(resultsPage) {
		return {
			from: resultsPage * 10,
			query: {
				match_all: {}
			}
		}
	}

	transformEsFields(raw) {
		let result = {};
		const arrayFields = ['keyw_5', 'ref_list', 'paragraphs', 'entities', 'abbreviations_n'];
		const budgetSearchArrayFields = ['meta_n', 'record_n']
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

	getProjectData(result, index) {
		const {
			meta_n,
			record_n,
			project_n
		} = result;

		const project = {};
		project.esIndex = index;

		console.log(result);

		if (project_n) {
			for (const key in project_n) {
				project[key] = project_n[key];
			}
		}

		if (record_n) {
			for (const key in record_n) {
				project[key] = record_n[key];
			}
		}

		if (meta_n) {
			for (const key in meta_n) {
				project[key] = meta_n[key];
			}
		}

		console.log(project);
		return project;

	}

}

module.exports = BudgetSearchSearchUtility;
