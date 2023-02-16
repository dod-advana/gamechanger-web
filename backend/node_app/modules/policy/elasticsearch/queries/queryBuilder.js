class QueryBuilder {
	#body;

	/**
	 * Build Elasticsearch queries.
	 *
	 * This pattern is used to incrementally build a query object for
	 * Elasticsearch. This helps abstract the process of query building.
	 */
	constructor() {
		this.#body = { query: {} };
	}

	get body() {
		return this.#body;
	}

	#addBool() {
		if (!('bool' in this.#body.query)) {
			this.#body.query.bool = {};
		}
	}

	#addBoolMust() {
		this.#addBool();

		if (!('must' in this.#body.query.bool)) {
			this.#body.query.bool.must = [];
		}
	}

	#addBoolShould() {
		this.#addBool();

		if (!('should' in this.#body.query.bool)) {
			this.#body.query.bool.should = [];
		}
	}

	#addBoolFilter() {
		this.#addBool();

		if (!('filter' in this.#body.query.bool)) {
			this.#body.query.bool.filter = [];
		}
	}

	#addAggregations() {
		if (!('aggregations' in this.#body)) {
			this.#body.aggregations = {};
		}
	}

	/**
	 * Set the `track_total_hits` parameter to true for the query.
	 *
	 * [Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-your-data.html)
	 */
	trackTotalHits() {
		this.#body.track_total_hits = true;
	}

	/**
	 * Set the `_source` parameter for the query.
	 *
	 * [Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-fields.html)
	 *
	 * @param {Object|false} source - The clause used to access the original
	 * 		data that was passed at index time. Or, false to not include the
	 * 		document source in the response.
	 *
	 */
	setSource(source) {
		this.#body._source = source;
	}

	/**
	 * Set the `stored_fields` parameter for the query.
	 *
	 * [Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-fields.html#stored-fields)
	 *
	 * @param {Array<string>} fieldNames
	 */
	setStoredFields(fieldNames) {
		this.#body.stored_fields = fieldNames;
	}

	/**
	 * Set the `size` parameter for the query.
	 *
	 * [Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html)
	 *
	 * @param {number} size - The maximum number of hits to return.
	 */
	setSize(size) {
		this.#body.size = size;
	}

	/**
	 * Set the `from` parameter for the query.
	 *
	 * [Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html)
	 *
	 * @param {number} offset - The number of hits to skip.
	 */
	setFrom(offset) {
		this.#body.from = offset;
	}

	/**
	 * Set the `path` parameter for the query.
	 *
	 * This should only be used when constructing a nested query.
	 *
	 * @param {string} fieldPath - The path to the nested object you wish to
	 * 		search.
	 */
	setPath(fieldPath) {
		this.#body.path = fieldPath;
	}

	/**
	 * Set the `inner_hits` parameter for the query.
	 *
	 * This should only be used when constructing a nested query.
	 *
	 * @param {Object} clause - See [here[(https://www.elastic.co/guide/en/elasticsearch/reference/current/inner-hits.html).
	 */
	setInnerHits(clause) {
		this.#body.inner_hits = clause;
	}

	/**
	 * Set the `prefix` clause in the query.
	 *
	 * This method adds `prefix` clause under the query. The query will return
	 * documents that contain the given prefix value in the given field.
	 *
	 * [Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html)
	 *
	 * @param {string} fieldName - The field you wish to search.
	 * @param {string} value - Beginning characters of the terms you wish to
	 * 		find in the given field.
	 */
	setPrefix(fieldName, value) {
		this.#body.query.prefix = { [fieldName]: { value: value } };
	}

	/**
	 * Set the `minimum_should_match` parameter for the `bool` clause in the query.
	 *
	 * ```
	 * {
	 *		query: {
	 *			bool: {
	 *				should: [ ... ],
	 *				minimum_should_match: minimum
	 *			}
	 *		}
	 * }
	 * ```
	 *
	 * [Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-minimum-should-match.html)
	 *
	 * @param {number} minimum - The minimum number of should clauses that must
	 * 		match in order for a document to be returned as a hit.
	 */
	setBoolMinimumShouldMatch(minimum) {
		this.#addBoolShould();
		this.#body.query.bool.minimum_should_match = minimum;
	}

	/**
	 * Add a `should` clause to the `bool` clause.
	 * Only added if it does not exist yet.
	 *
	 * ```
	 * {
	 *		query: {
	 *			bool: {
	 *				should: [ ... ]
	 *			}
	 *		}
	 * }
	 * ```
	 */
	addBoolShould(clause) {
		this.#addBoolShould();
		this.#body.query.bool.should.push(clause);
	}

	/**
	 * Add a `must` clause to the `bool` clause.
	 *
	 * Only added if it does not exist yet.
	 *
	 * ```
	 * {
	 *		query: {
	 *			bool: {
	 *				must: [ ... ]
	 *			}
	 *		}
	 * }
	 * ```
	 */
	addBoolMust(clause) {
		this.#addBoolMust();
		this.#body.query.bool.must.push(clause);
	}

	/**
	 * Add a `filter` clause to the `bool` clause.
	 *
	 * Only added if it does not exist yet.
	 *
	 * ```
	 * {
	 *		query: {
	 *			bool: {
	 *				filter: [ ... ]
	 *			}
	 *		}
	 * }
	 * ```
	 */
	addBoolFilter(clause) {
		this.#addBoolFilter();
		this.#body.query.bool.filter.push(clause);
	}

	/**
	 * Add a union filter to the query.
	 *
	 * This method adds a filter under `bool`. Documents that match *any* of the
	 * given values for the given field name will be returned in the result.
	 *
	 * ```
	 * {
	 *		query: {
	 *			bool: {
	 *				filter: [
	 *					{
	 *						terms: {
	 *							[fieldName]: values
	 *						}
	 *					}
	 *				]
	 *			}
	 *		}
	 * }
	 * ```
	 *
	 * [Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html)
	 *
	 * @param {string} fieldName - The field name to match on.
	 * @param {Array<string>} values - Documents that match any of these values
	 * 		in the given field name will be returned in the result.
	 */
	addUnionFieldFilter(fieldName, values) {
		this.addBoolFilter({ terms: { [fieldName]: values } });
	}

	/**
	 * Add a filter to match an exact term in the given field.
	 *
	 * This method adds a `term` clause to the `bool` `filter` clause.
	 *
	 * ```
	 * {
	 *		query: {
	 *			bool: {
	 *				filter: [
	 *					{
	 *						term: {
	 *							[fieldName]: value
	 *						}
	 *					}
	 *				]
	 *			}
	 *		}
	 * }
	 * ```
	 *
	 * [Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html)
	 *
	 * @param {string} fieldName - The field you wish to search.
	 * @param {string} value - The term you wish to find in the given field.
	 */
	addExactTermFilter(fieldName, value) {
		this.addBoolFilter({ term: { [fieldName]: value } });
	}

	/**
	 * Add an aggregation to the `aggregations` clause.
	 *
	 * Only added if an aggregation with the given name does not exist yet.
	 *
	 * ```
	 * {
	 * 		aggregations: {
	 * 			[name]: clause
	 * 		}
	 * }
	 * ```
	 *
	 * @throws {Error} If an aggregation already exists with the given name.
	 * @param {string} name - The name to assign this aggregation.
	 * @param {Object} clause - The aggregation clause.
	 */
	addAggregation(name, clause) {
		this.#addAggregations();
		if (name in this.#body.aggregations) {
			throw new Error(`Aggregation already exists for name: '${name}'`);
		}
		this.#body.aggregations[name] = clause;
	}
}

module.exports = { QueryBuilder };
