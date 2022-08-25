import _ from 'lodash';
import axios from 'axios';

import {
	displayBackendError,
	getQueryVariable,
	getTrackingNameForFactory,
	NO_RESULTS_MESSAGE,
	RECENT_SEARCH_LIMIT,
	RESULTS_PER_PAGE,
} from '../../../utils/gamechangerUtils';
import { trackSearch } from '../../telemetry/Matomo';
import {
	// createTinyUrl,
	// getSearchObjectFromString,
	// getUserData,
	setState,
} from '../../../utils/sharedFunctions';
import GamechangerAPI from '../../api/gameChanger-service-api';

const gamechangerAPI = new GamechangerAPI();
let cancelToken = axios.CancelToken.source();

// const getAndSetDidYouMean = (index, searchText, dispatch) => {
// 	jbookAPI.getTextSuggestion({ index, searchText }).then(({ data }) => {
// 		setState(dispatch, {idYouMean: data?.autocorrect?.[0]});
// 	}).catch(_ => {
// 		//do nothing
// 	})
// };

const JBookSearchHandler = {
	updateRecentSearches(searchText) {
		const recentSearches = localStorage.getItem(`recentjbookSearches`) || '[]';
		const recentSearchesParsed = JSON.parse(recentSearches);

		if (!recentSearchesParsed.includes(searchText)) {
			recentSearchesParsed.unshift(searchText);
			if (recentSearchesParsed.length === RECENT_SEARCH_LIMIT) recentSearchesParsed.pop();
			localStorage.setItem(`recentjbookSearches`, JSON.stringify(recentSearchesParsed));
		}
	},

	async exportSearch(state, dispatch) {
		try {
			const cleanSearchSettings = this.processSearchSettings(state, dispatch);
			const offset = 0;

			const { searchText = '' } = state;

			// regular search with no limit
			const resp = await gamechangerAPI.modularSearch({
				cloneName: 'jbook',
				searchText,
				offset,
				options: {
					searchVersion: 1,
					jbookSearchSettings: cleanSearchSettings,
					portfolio: state.selectedPortfolio || 'AI Inventory',
					sortSelected: state.sortSelected,
					exportSearch: true,
				},
			});

			if (resp) {
				return resp.data;
			} else {
				return null;
			}
		} catch (e) {
			console.log(e);
		}
	},

	async performQuery(state, searchText, resultsPage, dispatch, runningSearch) {
		try {
			const cleanSearchSettings = this.processSearchSettings(state, dispatch);
			const offset = (resultsPage - 1) * RESULTS_PER_PAGE;

			if (runningSearch) {
				cancelToken.cancel('cancelled axios with consecutive call');
				cancelToken = axios.CancelToken.source();
			}

			// regular search
			const resp = await gamechangerAPI.modularSearch(
				{
					cloneName: 'jbook',
					searchText,
					offset,
					options: {
						searchVersion: 1,
						jbookSearchSettings: cleanSearchSettings,
						portfolio: state.selectedPortfolio || 'AI Inventory',
						sortSelected: state.sortSelected,
					},
				},
				cancelToken
			);

			if (_.isObject(resp.data)) {
				displayBackendError(resp, dispatch);
				return resp.data;
			} else {
				return null;
			}
		} catch (err) {
			console.error(err);
			throw err;
		}
	},

	async getContractTotals(state, dispatch) {
		const cleanSearchSettings = this.processSearchSettings(state, dispatch);

		const { data } = await gamechangerAPI.callDataFunction({
			functionName: 'getContractTotals',
			cloneName: 'jbook',
			options: {
				searchText: state.searchText ?? '',
				jbookSearchSettings: cleanSearchSettings,
				portfolio: state.portfolio || 'AI Inventory',
			},
		});
		return data;
	},

	async handleSearch(state, dispatch) {
		const { searchText = '', resultsPage, urlSearch, paginationSearch, edaPaginationSearch, runningSearch } = state;

		if (edaPaginationSearch) {
			return this.handleEDASearch(state, dispatch);
		}
		if (!urlSearch) {
			this.setSearchURL(state);
		}

		this.updateRecentSearches(searchText);

		setState(dispatch, {
			runSearch: false,
			budgetTypeDropdown: false,
			serviceAgencyDropdown: false,
			serviceReviewStatusDropdown: false,
			reviewStatusDropdown: false,
			budgetYearDropdown: false,
			primaryReviewerDropdown: false,
			serviceReviewerDropdown: false,
			primaryClassLabelDropdown: false,
			sourceTagDropdown: false,
			hasKeywordsDropdown: false,
			noResultsMessage: null,
			count: 0,
			timeFound: 0.0,
			iframePreviewLink: null,
			runningSearch: true,
			edaRunningSearch: true,
			urlSearch: false,
			initial: false,
			expansionDict: {},
			statsLoading: true,
		});

		try {
			const t0 = new Date().getTime();

			// run these simultaneously
			if (!paginationSearch) {
				this.handleEDASearch(state, dispatch);
			}

			const results = await this.performQuery(state, searchText, resultsPage, dispatch, runningSearch);
			const t1 = new Date().getTime();

			if (results === null || !results.docs || results.docs.length <= 0) {
				setState(dispatch, {
					prevSearchText: null,
					loading: false,
					searchResultsCount: 0,
					noResultsMessage: NO_RESULTS_MESSAGE,
					runningSearch: false,
					loadingTinyUrl: false,
					rawSearchResults: [],
					hasExpansionTerms: false,
					paginationSearch: false,
					contractTotals: [],
				});
			} else {
				let { docs, totalCount, query, expansionDict, contractTotalCounts = {} } = results;
				let hasExpansionTerms = false;
				if (expansionDict) {
					Object.keys(expansionDict).forEach((key) => {
						if (expansionDict[key].length > 0) hasExpansionTerms = true;
					});
				}

				// temporarily add review data
				// docs.map((doc) => {
				// 	doc.reviews = {
				// 		General: {
				// 			tags: ['Generic Tag'],
				// 		},
				// 		'AI Inventory': {
				// 			tags: ['AI Enabled', 'AI Enabling', 'Not AI', 'AI', 'Very Cool AI'],
				// 		},
				// 	};
				// 	return doc;
				// });

				setState(dispatch, {
					timeFound: ((t1 - t0) / 1000).toFixed(2),
					activeCategoryTab: 'jbook',
					prevSearchText: searchText,
					loading: false,
					loadingTinyUrl: false,
					count: totalCount,
					query: query,
					rawSearchResults: docs,
					hideTabs: false,
					resetSettingsSwitch: false,
					runningSearch: false,
					expansionDict,
					hasExpansionTerms,
					paginationSearch: false,
					contractTotals: contractTotalCounts,
				});
			}

			if (resultsPage < 2) {
				trackSearch(searchText, `${getTrackingNameForFactory('jbook')}`, results.totalCount, false);
			}
		} catch (e) {
			console.log(e);
			setState(dispatch, {
				prevSearchText: null,
				unauthorizedError: true,
				loading: false,
				autocompleteItems: [],
				searchResultsCount: 0,
				runningSearch: false,
				loadingTinyUrl: false,
				hasExpansionTerms: false,
				paginationSearch: false,
				runSearch: false,
				contractTotals: [],
			});
		}
	},

	async handleEDASearch(state, dispatch) {
		const { searchText = '', edaResultsPage, edaCloneData } = state;

		setState(dispatch, {
			edaCount: 0,
			edaSearchResults: [],
			edaLoading: true,
			edaPaginationSearch: false,
			runSearch: false,
		});

		const offset = (edaResultsPage - 1) * RESULTS_PER_PAGE;
		const charsPadding = 90;

		try {
			// run EDA Search
			// const t0 = new Date().getTime();
			const results = await gamechangerAPI.modularSearch({
				cloneName: edaCloneData.clone_name,
				searchText,
				offset,
				storeHistory: false,
				options: {
					charsPadding,
				},
			});

			if (_.isObject(results.data)) {
				let { docs, totalCount } = results.data;

				// set EDA search results
				if (docs && Array.isArray(docs)) {
					setState(dispatch, {
						edaLoading: false,
						edaCount: totalCount,
						edaSearchResults: docs,
					});
				}
			} else {
				setState(dispatch, {
					edaLoading: false,
				});
			}
		} catch (e) {
			console.log('Error running EDA search in JBOOK');
			console.log(e);
			// if it's a consecutive call triggered by a filter update, don't reset state,
			// the error is taken care of; there's another call later in the stack working the updated search
			if (e.message !== 'cancelled axios with consecutive call') {
				setState(dispatch, {
					prevSearchText: null,
					unauthorizedError: true,
					edaLoading: false,
					autocompleteItems: [],
					searchResultsCount: 0,
					edaRunningSearch: false,
					loadingTinyUrl: false,
					hasExpansionTerms: false,
				});
			}
		}
	},

	parseSearchURL(defaultState, url) {
		if (!url) url = window.location.href;

		const parsed = {};
		// const newSearchSettings = {};

		const searchText = getQueryVariable('q', url);
		const offsetURL = getQueryVariable('offset', url);

		const isNullish = (param) => !param || param === 'null' || param === 'undefined';

		if (searchText) {
			parsed.searchText = searchText;
		}

		if (!isNullish(offsetURL)) {
			const offset = parseInt(offsetURL);
			if (!isNaN(offset)) parsed.offset = offset;
			parsed.resultsPage = Math.floor(offset / RESULTS_PER_PAGE) + 1;
		}

		return parsed;
	},

	setSearchURL(state) {
		const { searchText, resultsPage } = state;

		const offset = (resultsPage - 1) * RESULTS_PER_PAGE;

		const params = new URLSearchParams();
		let linkString = `/`;

		if (searchText) params.append('q', searchText);
		if (searchText && offset) params.append('offset', String(offset));

		const hash = window.location.hash;

		const paramIndex = hash.indexOf('?');

		linkString += `${paramIndex === -1 ? hash : hash.substring(0, paramIndex)}${
			searchText && searchText !== '' ? '?' : ''
		}${params}`;

		window.history.pushState(null, document.title, linkString);
	},

	getPresearchData(state) {},

	processSearchSettings(state) {
		const searchSettings = _.cloneDeep(state.jbookSearchSettings);
		searchSettings.selectedPortfolio = state.selectedPortfolio;
		const sortDesc = state.currentOrder === 'desc';

		switch (state.currentSort) {
			case 'Relevance':
				searchSettings.sort = [{ id: 'relevance', desc: sortDesc }];
				break;
			case 'Program Element':
				searchSettings.sort = [{ id: 'programElement', desc: sortDesc }];
				break;
			case 'Budget Line Item':
				searchSettings.sort = [{ id: 'budgetLineItem', desc: sortDesc }];
				break;
			case 'Project #':
				searchSettings.sort = [{ id: 'projectNum', desc: sortDesc }];
				break;
			case 'Project Title':
				searchSettings.sort = [{ id: 'projectTitle', desc: sortDesc }];
				break;
			case 'Service / Agency':
				searchSettings.sort = [{ id: 'serviceAgency', desc: sortDesc }];
				break;
			case 'Primary Reviewer':
				searchSettings.sort = [{ id: 'primaryReviewer', desc: sortDesc }];
				break;
			case 'Service Reviewer':
				searchSettings.sort = [{ id: 'serviceReviewer', desc: sortDesc }];
				break;
			case 'POC Reviewer':
				searchSettings.sort = [{ id: 'pocReviewer', desc: sortDesc }];
				break;
			case 'Source':
				searchSettings.sort = [{ id: 'sourceTag', desc: sortDesc }];
				break;
			case 'Budget Year':
			default:
				searchSettings.sort = [{ id: 'budgetYear', desc: sortDesc }];
				break;
		}

		for (const optionType in state.defaultOptions) {
			// if (optionType === 'reviewStatus') continue;

			if (
				state.defaultOptions[optionType] &&
				searchSettings[optionType] &&
				state.defaultOptions[optionType].length === searchSettings[optionType].length
			) {
				delete searchSettings[optionType];
			}

			if (searchSettings[optionType] && searchSettings[optionType].length === 0) {
				delete searchSettings[optionType];
			}
		}

		for (const setting in searchSettings) {
			if (!searchSettings[setting]) {
				delete searchSettings[setting];
			} else if (typeof searchSettings[setting] === 'string') {
				searchSettings[setting] = searchSettings[setting].trim();
			}
		}

		return searchSettings;
	},
};

export default JBookSearchHandler;
