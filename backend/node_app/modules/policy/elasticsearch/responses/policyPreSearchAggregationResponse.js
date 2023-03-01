const LOGGER = require('@dod-advana/advana-logger');

class PolicyPreSearchAggregationResponse {
	/**
	 * Formats the Elasticsearch response for the GAMECHANGER Policy pre-search
	 * organization aggregation.
	 *
	 * @param {Object} elasticsearchResponse
	 * @returns {Array<string>}
	 */
	static formatOrganizationResponse(elasticsearchResponse, logger = LOGGER) {
		let organizations = PolicyPreSearchAggregationResponse.extractAggregations(
			elasticsearchResponse,
			'display_org',
			logger
		);
		return organizations
			.map((item) => (item.revoke_filter.buckets.query.doc_count !== 0 ? item.key.type : null))
			.filter((item) => item !== null);
	}

	/**
	 * Formats the Elasticsearch response for the GAMECHANGER Policy pre-search
	 * document type aggregation.
	 *
	 * @param {Object} elasticsearchResponse
	 * @param {typeof LOGGER|undefined} logger - Defaults to {@link LOGGER}.
	 * @returns {Array<string>}
	 */
	static formatDocumentTypeResponse(elasticsearchResponse, logger = LOGGER) {
		let documentTypes = PolicyPreSearchAggregationResponse.extractAggregations(
			elasticsearchResponse,
			'display_type',
			logger
		);
		return documentTypes.map((item) => item.key.type);
	}

	static extractAggregations(elasticsearchResponse, aggregationName, logger) {
		let aggregations = elasticsearchResponse?.body?.aggregations[aggregationName]?.buckets;

		if (aggregations === undefined) {
			logger.warn(
				`MTBLPWX - Cannot get aggregations from Elasticsearch response.
				aggregationName: ${aggregationName}.
				elasticsearchResponse: ${JSON.stringify(elasticsearchResponse)}`
			);
			aggregations = [];
		}

		return aggregations;
	}
}

module.exports = { PolicyPreSearchAggregationResponse };
