const { PolicyFields } = require('../fields');

module.exports = Object.freeze({
	/**
	 * Default `stored_fields` parameter for an Elasticsearch document search
	 * query.
	 */
	DEFAULT_STORED_FIELDS: [
		PolicyFields.TYPE.name,
		PolicyFields.FILENAME.name,
		PolicyFields.PAGE_COUNT.name,
		PolicyFields.DOCUMENT_TYPE.name,
		PolicyFields.DOCUMENT_NUMBER.name,
		PolicyFields.REFERENCES.name,
		PolicyFields.ID.name,
		PolicyFields.SUMMARY.name,
		PolicyFields.KEYWORDS.name,
		PolicyFields.TITLE.name,
		PolicyFields.DISPLAY_TITLE.name,
		PolicyFields.ORGANIZATION.name,
		PolicyFields.DISPLAY_DOCUMENT_TYPE.name,
		PolicyFields.IS_REVOKED.name,
		PolicyFields.ACCESS_TIMESTAMP.name,
		PolicyFields.PUBLICATION_DATE.name,
		PolicyFields.CRAWLER_USED.name,
		PolicyFields.DOWNLOAD_URL.name,
		PolicyFields.FILE_ORIGIN_URL.name,
		PolicyFields.SOURCE_URL.name,
		PolicyFields.TOPICS.name,
		PolicyFields.TOP_ENTITIES.name,
	],
});
