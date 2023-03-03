const { PolicyFields } = require('../fields');

/**
 * Create Elasticsearch queries to pull aggregations for GAMECHANGER Policy pre-search.
 */
class PolicyPreSearchAggregationQuery {
	/**
	 * Creates an Elasticsearch query to aggregate organizations for documents
	 * that have not been revoked.
	 *
	 * The organizations field name is defined by the name attribute of
	 * {@link PolicyFields.ORGANIZATION}. The revoked field name is defined by
	 * the name attribute of {@link POlicyFields.IS_REVOKED}.
	 *
	 * This query is used in GAMECHANGER Policy pre-search.
	 *
	 * @param {number} compositeBucketSize - How many composite buckets should be returned.
	 *      Reference: https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html#_size
	 * @returns {Object} Elasticsearch query body.
	 */
	static createOrganizationQuery(compositeBucketSize) {
		return {
			_source: 'false',
			aggs: {
				display_org: {
					composite: {
						size: compositeBucketSize,
						sources: [
							{
								type: {
									terms: {
										field: PolicyFields.ORGANIZATION.name,
									},
								},
							},
						],
					},
					aggs: {
						revoke_filter: {
							filters: {
								filters: {
									query: {
										term: {
											[PolicyFields.IS_REVOKED.name]: 'false',
										},
									},
								},
							},
						},
					},
				},
			},
		};
	}

	/**
	 * Creates an Elasticsearch query to aggregate document types.
	 *
	 * The document type field name is defined by the name attribute of
	 * {@link PolicyFields.DISPLAY_DOCUMENT_TYPE}.
	 *
	 * This query is used in GAMECHANGER Policy pre-search.
	 * @param {number} compositeBucketSize - How many composite buckets should be returned.
	 *      Reference: https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html#_size
	 * @returns {Object} Elasticsearch query body.
	 */
	static createDocumentTypeQuery(compositeBucketSize) {
		return {
			size: 0,
			aggs: {
				display_type: {
					composite: {
						size: compositeBucketSize,
						sources: [
							{
								type: {
									terms: {
										field: PolicyFields.DISPLAY_DOCUMENT_TYPE.name,
									},
								},
							},
						],
					},
				},
			},
		};
	}
}

module.exports = { PolicyPreSearchAggregationQuery };
