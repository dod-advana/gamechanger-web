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
			offset = 0, 
		 }, 
		 user) {

		try {

			let query = {
				_source: {
					includes: ['meta_n', 'record_n', 'project_n', 'doc_type_s']
				},
				from: offset,
				track_total_hits: true,
				query: {
					bool: {
						should: [
						],
						minimum_should_match: 1,						
					}
				}
			};

			const nestedQueries = {
				record_n: 'ProgramElementMissionDescription_t',
				project_n: 'ProjectMissionDescription_t',
				meta_n: 'filename_s'
			}

			for (const source in nestedQueries) {
				query.query.bool.should.push(
				{
					"nested": {
                        "path": source,
                        "inner_hits": {
                            "_source": false,
                            "from": 0,
                            "size": 5,
                            "highlight": {
                                "fields": {
                                    [`${source}.${nestedQueries[source]}`]: {
                                        "fragment_size": 270,
                                        "number_of_fragments": 1,
                                        "type": "plain"
                                    }
                                },
                                "fragmenter": "span"
                            }
                        },
                        "query": {
                            "bool": {
                                "should": [
                                    {
                                        "query_string": {
                                            "query": `${searchText} OR ai-enabled OR ai-enabling OR core-ai`,
                                            "default_field": `${source}.${nestedQueries[source]}`,
                                            "default_operator": "and",
                                            "fuzzy_max_expansions": 100,
                                            "fuzziness": "AUTO"
                                        }
                                    }
                                ]
                            }
                        }
                    }
				}
				);
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
		const budgetSearchArrayFields = ['meta_n', 'record_n', 'project_n']
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

		return project;

	}

}

module.exports = BudgetSearchSearchUtility;
