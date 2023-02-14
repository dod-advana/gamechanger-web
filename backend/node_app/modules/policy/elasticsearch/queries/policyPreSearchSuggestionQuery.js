const { QueryBuilder } = require('./queryBuilder');
const { PolicyFields } = require('../fields/policyFields');
const { historyIndex: SEARCH_HISTORY_INDEX, entityIndex: ENTITY_INDEX } =
	require('../../../../config/constants').GAME_CHANGER_OPTS;

/** Create Elasticsearch queries for GAMECHANGER Policy pre-search suggestions.*/
class PolicyPreSearchSuggestionQuery {
	/**
	 * Creates an Elasticsearch multi-query that is used to suggest a search
	 * query to a user.
	 *
	 * @param {{
	 * 		searchText: string,
	 * 		documentsIndex: string,
	 * 		searchHistoryIndex: string|undefined,
	 * 		entityIndex: string|undefined,
	 * 		queryTypes: Array<string>|undefined
	 * }} opts
	 * @param opts.searchText - Query entered into the search bar by a user.
	 * @param opts.documentsIndex - Name of the Elasticsearch index
	 * 		with GAMECHANGER Policy documents.
	 * @param opts.searchHistoryIndex - Optional. Name of the Elasticsearch
	 * 		index with user search history. Defaults to
	 * 		{@link SEARCH_HISTORY_INDEX}.
	 * @param opts.entityIndex - Optional. Name of the Elasticsearch index with
	 * 		entities. Defaults to {@link ENTITY_INDEX}
	 * @param opts.queryTypes - Optional. Include 'title' to add a title query,
	 * 		'searchhistory' to add a search history query, and/ or 'entities'
	 * 		to add an entities query. Defaults to ['title', 'searchhistory',
	 * 		'entities'].
	 * @returns {Array<Object>}
	 */
	static createMultiQuery({
		searchText,
		documentsIndex,
		searchHistoryIndex = SEARCH_HISTORY_INDEX,
		entityIndex = ENTITY_INDEX,
		queryTypes = ['title', 'searchhistory', 'entities'],
	}) {
		const multiQuery = [];

		if (searchText.length < 3) {
			return multiQuery;
		}

		searchText = searchText.replace(/["']/g, '');
		queryTypes.includes('title') &&
			multiQuery.push(...PolicyPreSearchSuggestionQuery.createTitleQuery(searchText, documentsIndex));
		queryTypes.includes('searchhistory') &&
			multiQuery.push(...PolicyPreSearchSuggestionQuery.createSearchHistoryQuery(searchText, searchHistoryIndex));
		queryTypes.includes('entities') &&
			multiQuery.push(...PolicyPreSearchSuggestionQuery.createEntityQuery(searchText, entityIndex));

		return multiQuery;
	}

	static createTitleQuery(searchText, index) {
		const titleField = PolicyFields.DISPLAY_TITLE;

		const queryBuilder = new QueryBuilder();
		queryBuilder.setSize(4);
		queryBuilder.setSource([titleField.name]);
		queryBuilder.addExactTermFilter(PolicyFields.IS_REVOKED.name, false);
		queryBuilder.addBoolMust({
			wildcard: {
				[titleField.search]: {
					value: searchText,
					boost: 1.0,
					rewrite: 'constant_score',
				},
			},
		});

		return [{ index: index }, queryBuilder.body];
	}

	static createSearchHistoryQuery(searchText, index) {
		const queryBuilder = new QueryBuilder();
		queryBuilder.setSize(1);
		queryBuilder.setPrefix('search_query', searchText);
		queryBuilder.addAggregation('search_query', {
			terms: {
				field: 'search_query',
				min_doc_count: 5,
			},
			aggs: {
				user: {
					terms: {
						field: 'user_id',
						size: 3,
					},
				},
			},
		});

		return [{ index: index }, queryBuilder.body];
	}

	static createEntityQuery(searchText, index) {
		const queryBuilder = new QueryBuilder();
		queryBuilder.setSize(2);
		queryBuilder.setSource({ includes: ['name', 'aliases', 'entity_type'] });
		queryBuilder.setPrefix('name', searchText.trim());

		return [{ index: index }, queryBuilder.body];
	}

	static extractTitles(results) {
		return results.map((res) => res['_source'][PolicyFields.DISPLAY_TITLE.name]);
	}
}

module.exports = { PolicyPreSearchSuggestionQuery };
