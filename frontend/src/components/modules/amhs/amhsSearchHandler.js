import _ from 'lodash';

import {
	getTrackingNameForFactory,
	NO_RESULTS_MESSAGE,
	PAGE_DISPLAYED,
	RECENT_SEARCH_LIMIT,
	RESULTS_PER_PAGE,
	SEARCH_TYPES,
} from '../../../utils/gamechangerUtils';
import { trackSearch } from '../../telemetry/Matomo';
import { createTinyUrl, getUserData, setState } from '../../../utils/sharedFunctions';
import GameChangerAPI from '../../api/gameChanger-service-api';
import simpleSearchHandler from '../simple/simpleSearchHandler';

const gameChangerAPI = new GameChangerAPI();

const getAndSetDidYouMean = (index, searchText, dispatch) => {
	gameChangerAPI
		.getTextSuggestion({ index, searchText })
		.then(({ data }) => {
			setState(dispatch, { idYouMean: data?.autocorrect?.[0] });
		})
		.catch(() => {
			//do nothing
		});
};

const clearFavoriteSearchUpdate = async (search, dispatch) => {
	try {
		await gameChangerAPI.clearFavoriteSearchUpdate(search.tiny_url);
		getUserData(dispatch);
	} catch (err) {
		console.log(err);
	}
};

const AmhsSearchHandler = {
	async handleSearch(state, dispatch) {
		setState(dispatch, { runSearch: false });

		const {
			searchText = '',
			resultsPage,
			listView,
			showTutorial,
			userData,
			searchSettings,
			tabName,
			cloneData,
		} = state;

		const {
			searchType,
			includeRevoked,
			accessDateFilter,
			publicationDateFilter,
			publicationDateAllTime,
			searchFields,
		} = searchSettings;

		let url = window.location.hash.toString().replace('#/', '');

		this.setSearchURL({ ...state, searchSettings });

		const searchFavorite = this.getFavoriteSearch(userData, url);

		setState(dispatch, {
			isFavoriteSearch: searchFavorite,
			runningSearch: true,
			expansionDict: {},
			isDataTracker: false,
			isCachedResult: false,
			pageDisplayed: PAGE_DISPLAYED.main,
			didYouMean: '',
		});

		const trimmed = searchText.trim();
		if (_.isEmpty(trimmed)) return;

		this.getRecentSearches(searchText, cloneData);

		const t0 = new Date().getTime();

		let searchResults = [];
		let foundEntity = false;

		const transformResults = searchType === SEARCH_TYPES.contextual;

		setState(dispatch, {
			selectedDocuments: new Map(),
			loading: true,
			metricsLoading: true,
			noResultsMessage: null,
			autocompleteItems: [],
			rawSearchResults: [],
			docSearchResults: [],
			searchResultsCount: 0,
			count: 0,
			resultsDownloadURL: '',
			timeFound: 0.0,
			iframePreviewLink: null,
			graph: { nodes: [], edges: [] },
			runningSearch: true,
			showFullGraph: false,
			docTypeData: {},
			runningEntitySearch: true,
			runningTopicSearch: true,
			hideTabs: true,
		});

		const offset = this.getOffset(resultsPage);

		const charsPadding = listView ? 750 : 90;

		const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));

		const tiny_url = await createTinyUrl(cloneData);

		const combinedSearch = 'false';

		try {
			this.checkGraphView(cloneData, tabName, dispatch);

			const resp = await gameChangerAPI.modularSearch({
				cloneName: cloneData.clone_name,
				searchText,
				offset,
				options: {
					transformResults,
					charsPadding,
					showTutorial,
					useGCCache,
					tiny_url,
					searchFields,
					accessDateFilter,
					publicationDateFilter,
					publicationDateAllTime,
					includeRevoked,
					combinedSearch,
				},
			});

			const t1 = new Date().getTime();

			let getUserDataFlag = true;
			if (_.isObject(resp.data)) {
				let { docs, totalCount, expansionDict, isCached, timeSinceCache } = resp.data;

				if (docs && Array.isArray(docs)) {
					let newSearchResults = this.getSearchResults(searchResults, docs, userData);
					// if this search is a favorite, turn off notifications of new results
					getUserDataFlag = this.checkFavorite(searchFavorite, userData, dispatch, url);

					let hasExpansionTerms = this.checkExpansionTerms(expansionDict);

					this.trackSearchOffset(offset, searchText, cloneData, combinedSearch);

					const categoryMetadata = this.getCategoryMetaData(totalCount, foundEntity);

					setState(dispatch, {
						timeFound: ((t1 - t0) / 1000).toFixed(2),
						prevSearchText: searchText,
						loading: false,
						count: totalCount + (foundEntity ? 1 : 0),
						categoryMetadata,
						rawSearchResults: newSearchResults,
						docSearchResults: docs,
						searchResultsCount: newSearchResults.length,
						autocompleteItems: [],
						expansionDict,
						isCachedResult: isCached,
						timeSinceCache,
						hasExpansionTerms,
						metricsLoading: false,
						metricsCounted: true,
						loadingTinyUrl: false,
						hideTabs: false,
						transformFailed: this.checkTransformer(resp.data.transformFailed), // intelligent search failed, show keyword results with warning alert
					});
				} else {
					this.trackSearchOffset(offset, searchText, cloneData, combinedSearch);

					setState(dispatch, {
						loading: false,
						count: 0,
						rawSearchResults: [],
						docSearchResults: [],
						searchResultsCount: 0,
						runningSearch: false,
						prevSearchText: searchText,
						isCachedResult: false,
						loadingTinyUrl: false,
						hasExpansionTerms: false,
					});
				}
			} else {
				setState(dispatch, {
					prevSearchText: null,
					loading: false,
					searchResultsCount: 0,
					noResultsMessage: NO_RESULTS_MESSAGE,
					autocompleteItems: [],
					runningSearch: false,
					loadingTinyUrl: false,
					hasExpansionTerms: false,
				});
			}

			this.setSearchURL({
				...state,
				searchText,
				resultsPage,
				tabName,
				cloneData,
				searchSettings,
			});

			if (getUserDataFlag) {
				getUserData(dispatch);
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
			});
		}

		const index = 'gamechanger';
		getAndSetDidYouMean(index, searchText, dispatch);
	},
	getCategoryMetaData(totalCount, foundEntity) {
		return {
			Documents: {
				total: totalCount + (foundEntity ? 1 : 0),
			},
		};
	},
	getOffset(resultsPage) {
		return (resultsPage - 1) * RESULTS_PER_PAGE;
	},
	trackSearchOffset(offset, searchText, cloneData, combinedSearch) {
		if (!offset) {
			trackSearch(
				searchText,
				`${getTrackingNameForFactory(cloneData.clone_name)}${combinedSearch ? '_combined' : ''}`,
				0,
				false
			);
		}
	},
	getFavoriteSearch(userData, url) {
		const favSearchUrls = userData.favorite_searches.map((search) => {
			return search.url;
		});

		return favSearchUrls.includes(url);
	},
	checkGraphView(cloneData, tabName, dispatch) {
		if (cloneData.show_graph && tabName === 'graphView') {
			setState(dispatch, { runGraphSearch: true });
		}
	},
	getSearchResults(searchResults, docs, userData) {
		searchResults = searchResults.concat(docs);
		const favFilenames = userData.favorite_documents.map((document) => {
			return document.filename;
		});
		searchResults.forEach((result) => {
			result.favorite = favFilenames.includes(result.filename);
			result.type = 'document';
		});
		return searchResults;
	},
	checkFavorite(searchFavorite, userData, dispatch, url) {
		// if this search is a favorite, turn off notifications of new results
		let getUserDataFlag = true;
		if (searchFavorite) {
			userData.favorite_searches.forEach((search) => {
				if (search.url === url) {
					clearFavoriteSearchUpdate(search, dispatch);
					getUserDataFlag = false;
				}
			});
		}
		return getUserDataFlag;
	},
	getRecentSearches(searchText, cloneData) {
		const recentSearches = localStorage.getItem(`recent${cloneData.clone_name}Searches`) || '[]';
		const recentSearchesParsed = JSON.parse(recentSearches);

		if (!recentSearchesParsed.includes(searchText)) {
			recentSearchesParsed.unshift(searchText);
			if (recentSearchesParsed.length === RECENT_SEARCH_LIMIT) recentSearchesParsed.pop();
			localStorage.setItem(`recent${cloneData.clone_name}Searches`, JSON.stringify(recentSearchesParsed));
		}
	},
	checkTransformer(transformFailedFlag) {
		if (transformFailedFlag) {
			return true;
		}
	},
	checkExpansionTerms(expansionDict) {
		let hasExpansionTerms = false;
		if (expansionDict) {
			Object.keys(expansionDict).forEach((key) => {
				if (expansionDict[key].length > 0) hasExpansionTerms = true;
			});
		}
		return hasExpansionTerms;
	},

	parseSearchURL(defaultState, url) {
		const { searchText, resultsPage } = simpleSearchHandler.parseSearchURL(defaultState, url);
		return { searchText, resultsPage };
	},

	setSearchURL(state) {
		const { searchText, resultsPage } = state;
		const offset = (resultsPage - 1) * RESULTS_PER_PAGE;

		const params = new URLSearchParams();
		if (searchText) params.append('q', searchText);
		if (offset) params.append('offset', String(offset)); // 0 is default

		const linkString = `/#/${state.cloneData.url.toLowerCase()}?${params}`;

		window.history.pushState(null, document.title, linkString);
	},
};

export default AmhsSearchHandler;
