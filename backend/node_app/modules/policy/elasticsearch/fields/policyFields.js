const { PolicyFieldDefinition } = require('./policyFieldDefinition');

/**
 * Elasticsearch fields and their associated metadata for GAMECHANGER Policy
 * documents.
 */
class PolicyFields {
	// Top-level fields.
	static DISPLAY_TITLE = new PolicyFieldDefinition('display_title_s', { hasSearchSubField: true });
	static TITLE = new PolicyFieldDefinition('title', { hasSearchSubField: true });
	static SOURCE = new PolicyFieldDefinition('display_source_s', { hasSearchSubField: true });
	static TYPE = new PolicyFieldDefinition('type');
	static ORGANIZATION = new PolicyFieldDefinition('display_org_s');
	static DOCUMENT_NUMBER = new PolicyFieldDefinition('doc_num');
	static DOCUMENT_TYPE = new PolicyFieldDefinition('doc_type');
	static DISPLAY_DOCUMENT_TYPE = new PolicyFieldDefinition('display_doc_type_s');
	static FILENAME = new PolicyFieldDefinition('filename', { hasSearchSubField: true });
	static ENTITIES = new PolicyFieldDefinition('entities');
	static TOP_ENTITIES = new PolicyFieldDefinition('top_entities_t', { hasSearchSubField: true });
	static KEYWORDS = new PolicyFieldDefinition('keyw_5');
	static TOPICS = new PolicyFieldDefinition('topics_s');
	static REFERENCES = new PolicyFieldDefinition('ref_list');
	static PAGE_COUNT = new PolicyFieldDefinition('page_count');
	static ID = new PolicyFieldDefinition('id');
	static SUMMARY = new PolicyFieldDefinition('summary_30');
	static IS_REVOKED = new PolicyFieldDefinition('is_revoked_b');
	static ACCESS_TIMESTAMP = new PolicyFieldDefinition('access_timestamp_dt');
	static PUBLICATION_DATE = new PolicyFieldDefinition('publication_date_dt');
	static CRAWLER_USED = new PolicyFieldDefinition('crawler_used_s');
	static DOWNLOAD_URL = new PolicyFieldDefinition('download_url_s');
	static FILE_ORIGIN_URL = new PolicyFieldDefinition('source_page_url_s');
	static SOURCE_URL = new PolicyFieldDefinition('source_fqdn_s');

	// Nested fields.
	static PARAGRAPHS = new PolicyFieldDefinition('paragraphs');
	static PARAGRAPH_TEXT = new PolicyFieldDefinition('par_raw_text_t', {
		hasGCEnglishAnalyzer: true,
		parentFieldName: PolicyFields.PARAGRAPHS.name,
	});
	static PARAGRAPH_FILENAME = new PolicyFieldDefinition('filename', {
		hasSearchSubField: true,
		hasGCEnglishAnalyzer: true,
		parentFieldName: PolicyFields.PARAGRAPHS.name,
	});
	static PARAGRAPH_PAGE_NUMBER = new PolicyFieldDefinition('page_num_i', {
		parentFieldName: PolicyFields.PARAGRAPHS.name,
	});
	static PARAGRAPH_ID = new PolicyFieldDefinition('id', { parentFieldName: PolicyFields.PARAGRAPHS.name });

	static ARRAYS = [
		PolicyFields.KEYWORDS.name,
		PolicyFields.TOPICS.name,
		PolicyFields.REFERENCES.name,
		PolicyFields.TOP_ENTITIES.name,
	];

	/**
	 * Returns whether or not the given field name exists in PolicyFields.ARRAYS.
	 *
	 * @param {string} fieldName - The field name to check.
	 * @returns {boolean}
	 */
	static isArray(fieldName) {
		return PolicyFields.ARRAYS.includes(fieldName);
	}
}

module.exports = { PolicyFields };
