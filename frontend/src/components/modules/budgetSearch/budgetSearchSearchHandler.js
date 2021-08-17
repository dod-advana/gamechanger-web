import _ from "lodash";

import {
	getQueryVariable,
	getTrackingNameForFactory, NO_RESULTS_MESSAGE,
	PAGE_DISPLAYED, RECENT_SEARCH_LIMIT, RESULTS_PER_PAGE,
} from "../../../gamechangerUtils";
import {trackSearch} from "../../telemetry/Matomo";
import {
	checkUserInfo,
	createTinyUrl,
	getSearchObjectFromString,
	getUserData,
	isDecoupled,
	setState,
} from "../../../sharedFunctions";
import GameChangerAPI from "../../api/gameChanger-service-api";

const gameChangerAPI = new GameChangerAPI();

const getAndSetDidYouMean = (index, searchText, dispatch) => {
	gameChangerAPI.getTextSuggestion({ index, searchText }).then(({ data }) => {
		setState(dispatch, {idYouMean: data?.autocorrect?.[0]});
	}).catch(_ => {
		//do nothing
	})
}

const BudgetSearchSearchHandler = {
	async handleSearch(state, dispatch) {
		setState(dispatch, {runSearch: false});
		
		const {
			searchText = "",
			resultsPage,
			listView,
			showTutorial,
			userData,
			searchSettings,
			tabName,
			cloneData
		} = state;
		
		
		if (isDecoupled && userData && userData.search_history && userData.search_history.length > 9) {
			if (checkUserInfo(state, dispatch)) {
				return;
			}
		}
		
		this.setSearchURL(state);
		
		let url = window.location.hash.toString();
		url = url.replace("#/", "");
				
		setState(dispatch, {
			runningSearch: true,
			expansionDict: {},
			isDataTracker: false,
			isCachedResult: false,
			pageDisplayed: PAGE_DISPLAYED.main,
			didYouMean: '',
			trending: ''
		});
		
		const trimmed = searchText.trim();
		if (_.isEmpty(trimmed)) return;
		
		const searchObject = getSearchObjectFromString(searchText);
		const recentSearches = localStorage.getItem(`recent${cloneData.clone_name}Searches`) || '[]';
		const recentSearchesParsed = JSON.parse(recentSearches);
	
		if (!recentSearchesParsed.includes(searchText)) {
			recentSearchesParsed.unshift(searchText);
			if (recentSearchesParsed.length === RECENT_SEARCH_LIMIT) recentSearchesParsed.pop();
			localStorage.setItem(`recent${cloneData.clone_name}Searches`, JSON.stringify(recentSearchesParsed));
		}
		
		const t0 = new Date().getTime();
	
		let searchResults = [];
		let foundEntity = false;
	
		
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
			statsLoading: true
		});
		
		const offset = ((resultsPage - 1) * RESULTS_PER_PAGE)
	
		const charsPadding = listView ? 750 : 90;
	
		const tiny_url = await createTinyUrl(cloneData);
		
		try {
			
			if (cloneData.show_graph && tabName === 'graphView') {
				setState(dispatch, {runGraphSearch: true});
			}
			
			const combinedSearch = 'false';
	
			// regular search
			gameChangerAPI.modularSearch({
				cloneName: cloneData.clone_name,
				searchText: searchObject.search,
				offset,
				options: {
					charsPadding,
					showTutorial,
					tiny_url,
					combinedSearch
				},
			}).then(resp => {
				const t1 = new Date().getTime();
			
				let getUserDataFlag = true;
		
				if (_.isObject(resp.data)) {

					let { docs, totalCount, expansionDict, isCached, timeSinceCache } = resp.data;
		
					if (docs && Array.isArray(docs)) {
		
						// intelligent search failed, show keyword results with warning alert
						if (resp.data.transformFailed) {
							setState(dispatch, {transformFailed: true});
						}
		
						searchResults = searchResults.concat(docs);
						
						let hasExpansionTerms = false;
						
						if (expansionDict) {
							Object.keys(expansionDict).forEach(key => {
								if (expansionDict[key].length > 0) hasExpansionTerms = true;
							})
						}
						
						if (!offset) {
							trackSearch(
								searchText,
								`${getTrackingNameForFactory(cloneData.clone_name)}${combinedSearch ? '_combined' : ''}`,
								totalCount + (foundEntity ? 1 : 0),
								false
							);
						}
		
						setState(dispatch, {
							timeFound: ((t1 - t0) / 1000).toFixed(2),
							prevSearchText: searchText,
							loading: false,
							count: totalCount + (foundEntity ? 1 : 0),
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
							query: resp.data.query
						});
					} else {
						if (!offset) {
							trackSearch(
								searchText,
								`${getTrackingNameForFactory(cloneData.clone_name)}${combinedSearch ? '_combined' : ''}`,
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
							hasExpansionTerms: false
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
						hasExpansionTerms: false
					});
				}
		
				this.setSearchURL({...state, searchText, resultsPage, tabName, cloneData, searchSettings});
		
				if (getUserDataFlag) {
					getUserData(dispatch);
				}
			}).catch(err => {
				console.log(err);
				throw err;
			});

	
		} catch(e) {
			console.log(e);
			setState(dispatch, {
				prevSearchText: null,
				unauthorizedError: true,
				loading: false,
				autocompleteItems: [],
				searchResultsCount: 0,
				runningSearch: false,
				loadingTinyUrl: false,
				hasExpansionTerms: false
			});
		}
	
		const index = 'gamechanger';
		getAndSetDidYouMean(index, searchText, dispatch);
	},

	parseSearchURL(defaultState, url) {
		if (!url) url = window.location.href;

		const parsed = {};
		const newSearchSettings = {};

		const searchText = getQueryVariable('q', url);
		const offsetURL = getQueryVariable('offset', url);

		const isNullish = (param) => !param || param === 'null' || param === 'undefined';

		if (searchText) {
			parsed.searchText = searchText;
		}

		if (!isNullish(offsetURL)) {
			const offset = parseInt(offsetURL);
			if (!isNaN(offset))
				parsed.offset = offset;
			parsed.resultsPage = Math.floor(offset / RESULTS_PER_PAGE) + 1;
		}

		parsed.edaSearchSettings = _.defaults(newSearchSettings, _.cloneDeep(defaultState.edaSearchSettings));

		return parsed;
	},

	setSearchURL(state) {
		const { searchText, resultsPage } = state;

	
		const offset = ((resultsPage - 1) * RESULTS_PER_PAGE);

		const params = new URLSearchParams();

		if (searchText) params.append('q', searchText);
		if (offset) params.append('offset', String(offset));
	

		const linkString = `/#/${state.cloneData.url.toLowerCase()}?${params}`;

		window.history.pushState(null, document.title, linkString);
	},

	getPresearchData(state) {
		
	}
};

export default BudgetSearchSearchHandler;
