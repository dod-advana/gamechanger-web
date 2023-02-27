const LOGGER = require('@dod-advana/advana-logger');
const { DataLibrary } = require('../lib/dataLibrary');
const constantsFile = require('../config/constants');
const SearchUtility = require('../utils/searchUtility');
const { PolicyPreSearchSuggestionQuery } = require('../modules/policy/elasticsearch/queries');

class TextSuggestionController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			constants = constantsFile,
			dataApi = new DataLibrary(opts),
			searchUtility = new SearchUtility(opts),
		} = opts;

		this.logger = logger;
		this.constants = constants;
		this.dataApi = dataApi;
		this.searchUtility = searchUtility;

		// need to bind to have <this> in context
		this.getTextSuggestion = this.getTextSuggestion.bind(this);
		this.getPresearchSuggestion = this.getPresearchSuggestion.bind(this);
	}

	async getTextSuggestion(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
			const index = req.body.index
				? req.body.index
				: [
						this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.index,
						this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.assist_index,
				  ];
			const suggestionsFlag = req.body.suggestions ? req.body.suggestions : false;
			const esClientName = req.body.esClientName ? req.body.esClientName : 'gamechanger';
			const isPolicy = req.body?.cloneName === 'policy';

			let corrected;
			let presearchTitle;
			let presearchHistory;
			let presearchEntity = { presearchTopic: [], presearchOrg: [] };

			if (req.body.searchText.length > 3) {
				try {
					corrected = await this.searchUtility.autocorrect(req.body.searchText, index, userId);
				} catch (err) {
					const { message } = err;
					this.logger.error(message, 'JBVZKTP', userId);
				}
				if (corrected.length > 0 && esClientName !== 'eda') {
					const clientObj = {
						esClientName: esClientName,
						esIndex: index,
					};
					const originalText = req.body.searchText;
					req.body.searchText = corrected;
					// If the auto-corrected text doesn't return any results, don't suggest it to the user.
					const correctedResults = await this.searchUtility.documentSearch(null, req.body, clientObj, userId);

					if (!correctedResults.totalCount) {
						req.body.searchText = originalText;
						corrected = '';
					}
				}
				if (suggestionsFlag === true) {
					const data_presearch = await this.getPresearchSuggestion({
						body: { ...req.body },
						index: index,
						userId: userId,
						esClientName: esClientName,
					});
					if (esClientName === 'eda') {
						try {
							presearchHistory = this.getPreHistoryCorrectedEDA(data_presearch.responses[0].hits.hits);
						} catch (err) {
							const { message } = err;
							this.logger.error(message, 'JBVZKTZ', userId);
						}
					} else {
						try {
							presearchTitle = this.getPreTitleCorrected(data_presearch.responses[0].hits.hits, isPolicy);
						} catch (err) {
							const { message } = err;
							this.logger.error(message, 'JBVZKTF', userId);
						}

						try {
							presearchHistory = this.getPreHistoryCorrected(
								data_presearch.responses[1].aggregations.search_query.buckets
							);
						} catch (err) {
							const { message } = err;
							this.logger.error(message, 'JBVZKTG', userId);
						}

						try {
							presearchEntity = this.getPreEntityCorrected(data_presearch.responses[2].hits.hits);
						} catch (err) {
							const { message } = err;
							this.logger.error(message, 'JBVZKTF', userId);
						}
					}
				}
				return res.send({
					autocorrect: corrected ? [corrected] : [],
					presearchTitle: presearchTitle || [],
					presearchTopic: presearchEntity.presearchTopic || [],
					presearchOrg: presearchEntity.presearchOrg || [],
					predictions: presearchHistory || [],
				});
			} else {
				res.send({
					autocorrect: [],
					presearchTitle: [],
					presearchTopic: [],
					presearchOrg: [],
					predictions: [],
				});
			}
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'GV34YUM', userId);

			res.status(500).send(message);
		}
	}

	async getPresearchSuggestion({ body, index, userId, esClientName }) {
		try {
			let esQueryArray;
			if (esClientName === 'eda') {
				esQueryArray = this.searchUtility.getESpresearchMultiQueryEDA(body);
			} else if (body?.cloneName === 'policy') {
				esQueryArray = PolicyPreSearchSuggestionQuery.createMultiQuery({ ...body, documentsIndex: index });
			} else {
				esQueryArray = this.searchUtility.getESpresearchMultiQuery(body, index);
			}

			const results = await this.dataApi.mulitqueryElasticSearch(
				esClientName,
				this.constants.GAME_CHANGER_OPTS.textSuggestIndex,
				esQueryArray,
				userId
			);
			return results.body;
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'EMOSMUW', userId);
			throw message;
		}
	}

	getPreHistoryCorrected(suggesterArray) {
		const presearch = [];
		// amount of users need to be more than 1 (max shown = 3 for efficiency)
		if (suggesterArray.length > 0) {
			suggesterArray.forEach((term) => {
				let usercount = term.user.buckets;
				if (usercount.length > 1 && usercount[0].doc_count > 2) {
					presearch.push(term['key']);
				}
			});
		}
		// incase same
		let unique = [...new Set(presearch)];
		// only first two terms
		unique = unique.slice(0, 2);

		return unique;
	}
	getPreHistoryCorrectedEDA(suggesterArray) {
		const presearch = [];
		if (suggesterArray.length > 0) {
			suggesterArray.forEach((term) => {
				presearch.push(term['_source']['search_query']);
			});
		}
		// incase same
		let unique = [...new Set(presearch)];
		// Display only top 8 unique results
		unique = unique.slice(0, 8);
		return unique;
	}

	getPreTitleCorrected(suggesterArray, isPolicy = false) {
		if (isPolicy) {
			return PolicyPreSearchSuggestionQuery.extractTitles(suggesterArray);
		} else {
			const presearch = [];
			suggesterArray.forEach((suggestion) => {
				presearch.push(suggestion['_source']['display_title_s']);
			});
			return presearch;
		}
	}

	getPreEntityCorrected(suggesterArray) {
		const presearchTopic = [];
		const presearchOrg = [];

		suggesterArray.forEach((suggestion) => {
			if (suggestion['_source'].type && suggestion['_source'].type === 'topic') {
				// if topic, add to topic list.
				presearchTopic.push(suggestion['_source'].name);
			} else {
				presearchOrg.push(suggestion['_source'].name);
			}
		});
		return { presearchTopic, presearchOrg };
	}
}

module.exports.TextSuggestionController = TextSuggestionController;
