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
import {
	checkUserInfo,
	createTinyUrl,
	getSearchObjectFromString,
	getUserData,
	isDecoupled,
	setState,
} from '../../../utils/sharedFunctions';
import GameChangerAPI from '../../api/gameChanger-service-api';
import simpleSearchHandler from '../simple/simpleSearchHandler';

const gameChangerAPI = new GameChangerAPI();

const getAndSetDidYouMean = (index, searchText, dispatch) => {
	gameChangerAPI
		.getTextSuggestion({ index, searchText })
		.then(({ data }) => {
			setState(dispatch, { idYouMean: data?.autocorrect?.[0] });
		})
		.catch((_) => {
			//do nothing
		});
};

const clearFavoriteSearchUpdate = async (search, index, dispatch) => {
	try {
		await gameChangerAPI.clearFavoriteSearchUpdate(search.tiny_url);
		getUserData(dispatch);
	} catch (err) {
		console.log(err);
	}
};

const CDOSearchHandler = {
	async handleSearch(state, dispatch, replaceResults = true) {
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

		if (
			isDecoupled &&
			userData &&
			userData.search_history &&
			userData.search_history.length > 9
		) {
			if (checkUserInfo(state, dispatch)) {
				return;
			}
		}

		const favSearchUrls = userData.favorite_searches.map((search) => {
			return search.url;
		});

		this.setSearchURL({ ...state, searchSettings });

		let url = window.location.hash.toString();
		url = url.replace('#/', '');

		const searchFavorite = favSearchUrls.includes(url);

		setState(dispatch, {
			isFavoriteSearch: searchFavorite,
			runningSearch: true,
			expansionDict: {},
			isDataTracker: false,
			isCachedResult: false,
			pageDisplayed: PAGE_DISPLAYED.main,
			didYouMean: '',
			trending: '',
		});

		const trimmed = searchText.trim();
		if (_.isEmpty(trimmed)) return;

		const searchObject = getSearchObjectFromString(searchText);
		const recentSearches =
			localStorage.getItem(`recent${cloneData.clone_name}Searches`) || '[]';
		const recentSearchesParsed = JSON.parse(recentSearches);

		if (!recentSearchesParsed.includes(searchText)) {
			recentSearchesParsed.unshift(searchText);
			if (recentSearchesParsed.length === RECENT_SEARCH_LIMIT)
				recentSearchesParsed.pop();
			localStorage.setItem(
				`recent${cloneData.clone_name}Searches`,
				JSON.stringify(recentSearchesParsed)
			);
		}

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
			rawSearchResults: replaceResults ? [] : state.rawSearchResults,
			docSearchResults: replaceResults ? [] : state.docSearchResults,
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

		const offset = 
			((replaceResults ? resultsPage : state.infiniteScrollPage) - 1) *
			RESULTS_PER_PAGE;

		const charsPadding = listView ? 750 : 90;

		const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));

		const tiny_url = await createTinyUrl(cloneData);

		try {
			if (cloneData.show_graph && tabName === 'graphView') {
				setState(dispatch, { runGraphSearch: true });
			}

			const combinedSearch = 'false';

			const resp = await gameChangerAPI.modularSearch({
				cloneName: cloneData.clone_name,
				searchText: searchObject.search,
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
				let { docs, totalCount, expansionDict, isCached, timeSinceCache } =
					resp.data;

				if (docs && Array.isArray(docs)) {
					// intelligent search failed, show keyword results with warning alert
					if (resp.data.transformFailed) {
						setState(dispatch, { transformFailed: true });
					}

					searchResults = searchResults.concat(docs);

					const favFilenames = userData.favorite_documents.map((document) => {
						return document.filename;
					});

					searchResults.forEach((result) => {
						result.favorite = favFilenames.includes(result.filename);
						result.type = 'document';
					});

					// if this search is a favorite, turn off notifications of new results
					if (searchFavorite) {
						userData.favorite_searches.forEach((search, index) => {
							if (search.url === url) {
								clearFavoriteSearchUpdate(search, index, dispatch);
								getUserDataFlag = false;
							}
						});
					}

					let hasExpansionTerms = false;

					if (expansionDict) {
						Object.keys(expansionDict).forEach((key) => {
							if (expansionDict[key].length > 0) hasExpansionTerms = true;
						});
					}

					if (!offset) {
						trackSearch(
							searchText,
							`${getTrackingNameForFactory(cloneData.clone_name)}${
								combinedSearch ? '_combined' : ''
							}`,
							totalCount + (foundEntity ? 1 : 0),
							false
						);
					}
					const categoryMetadata = {
						'Documents':  {total: totalCount + (foundEntity ? 1 : 0)},
					};
					if (replaceResults) {
						setState(dispatch, {
							timeFound: ((t1 - t0) / 1000).toFixed(2),
							prevSearchText: searchText,
							loading: false,
							count: totalCount + (foundEntity ? 1 : 0),
							categoryMetadata,
							rawSearchResults: searchResults,
							docSearchResults: docs,
							searchResultsCount: searchResults.length,
							autocompleteItems: [],
							expansionDict,
							isCachedResult: isCached,
							timeSinceCache,
							hasExpansionTerms,
							metricsLoading: false,
							metricsCounted: true,
							loadingTinyUrl: false,
							hideTabs: false,
						});
					} else {
						setState(dispatch, {
							loading: false,
							rawSearchResults: [...state.rawSearchResults, ...searchResults],
							docSearchResults: [...state.docSearchResults, ...docs],
							searchResultsCount: searchResults.length,
							autocompleteItems: [],
							expansionDict,
							isCachedResult: isCached,
							timeSinceCache,
							hasExpansionTerms,
							metricsLoading: false,
							metricsCounted: true,
							loadingTinyUrl: false,
							hideTabs: false,
							docsLoading: false,
							docsPagination: false
						});
					}
				} else {
					if (!offset) {
						trackSearch(
							searchText,
							`${getTrackingNameForFactory(cloneData.clone_name)}${
								combinedSearch ? '_combined' : ''
							}`,
							0,
							false
						);
					}

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

	parseSearchURL(defaultState, url) {
		const { searchText, resultsPage } = simpleSearchHandler.parseSearchURL(
			defaultState,
			url
		);
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

export default CDOSearchHandler;
