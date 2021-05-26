import {
	getTrackingNameForFactory,
	PAGE_DISPLAYED, RECENT_SEARCH_LIMIT, RESULTS_PER_PAGE
} from "../../../gamechangerUtils";
import {trackSearch} from "../../telemetry/Matomo";
import {
	checkUserInfo,
	createTinyUrl,
	getUserData, isDecoupled,
	setState
} from "../../../sharedFunctions";
import GameChangerAPI from "../../api/gameChanger-service-api";
const _ = require('lodash');

const gameChangerAPI = new GameChangerAPI();

const setSearchURL = (state, selectedCategories) => {
	const { searchText} = state;
	
	const linkString = `/#/${state.cloneData.url.toLowerCase()}?${new URLSearchParams({ keyword: searchText, ...selectedCategories }).toString()}`;
	window.history.pushState(null, null, linkString);
}

const GlobalSearchHandler = {
	handleSearch: async (state, dispatch) => {
		setState(dispatch, {runSearch: false});
		
		const {
			searchText = "",
			resultsPage,
			listView,
			userData,
			searchSettings,
			tabName,
			cloneData,
			showTutorial,
			selectedCategories
		} = state;
		
		if (isDecoupled && userData && userData.search_history && userData.search_history.length > 9) {
			if (checkUserInfo(state, dispatch)) {
				return;
			}
		}
		
		const favSearchUrls = userData.favorite_searches.map(search => {
			return search.url;
		});
		
		setSearchURL(state, searchSettings);
		
		let url = window.location.hash.toString();
		url = url.replace("#/", "");
		
		const searchFavorite = favSearchUrls.includes(url);
		
		setState(dispatch, {
			isFavoriteSearch: searchFavorite,
			runningSearch: true,
			expansionDict: {},
			isDataTracker: false,
			isCachedResult: false,
			pageDisplayed: PAGE_DISPLAYED.main,
			trending: ''
		});
		
		const trimmed = searchText.trim();
		if (_.isEmpty(trimmed)) return;
		
		const recentSearches = localStorage.getItem(`recent${cloneData.clone_name}Searches`) || '[]';
		const recentSearchesParsed = JSON.parse(recentSearches);
		
		// Save search settings to postgres
		gameChangerAPI.setUserSearchSettings({searchSettings});
	
		if (!recentSearchesParsed.includes(searchText)) {
			recentSearchesParsed.unshift(searchText);
			if (recentSearchesParsed.length === RECENT_SEARCH_LIMIT) recentSearchesParsed.pop();
			localStorage.setItem(`recent${cloneData.clone_name}Searches`, JSON.stringify(recentSearchesParsed));
		}
		
		const t0 = new Date().getTime();
	
		let searchResults = [];
		
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
			hideTabs: true
		});
		
		const offset = ((resultsPage - 1) * RESULTS_PER_PAGE)
	
		const charsPadding = listView ? 750 : 90;
	
		const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));
	
		const tiny_url = await createTinyUrl(cloneData);
		
		const categoryMetadata =
			{
				Applications: {total: 0},
				Dashboards: {total: 0},
				DataSources: {total: 0},
				Databases: {total: 0},
				Documentation: {total: 0},
				Organizations: {total: 0},
				Services: {total: 0},
			};
		
		try {
			
			// Make the global search calls
			let totalCount = 0;
			
			try {
				const {data} = await gameChangerAPI.modularSearch({
					cloneName: cloneData.clone_name,
					searchText: searchText,
					offset,
					options: {
						charsPadding,
						showTutorial,
						useGCCache,
						tiny_url,
						getApplications: selectedCategories.Applications,
						getDashboards: selectedCategories.Dashboards,
						getDataSources: selectedCategories.DataSources,
						getDatabases: selectedCategories.Databases
					},
				});
				
				
				
				data.applications.hits.forEach(hit => {
					hit.type = 'application';
					searchResults.push(hit);
				})
				totalCount += data.applications.totalCount;
				categoryMetadata.Applications.total = data.applications.totalCount || 0;
				
				data.dashboards.hits.forEach(hit => {
					hit.type = 'dashboard';
					searchResults.push(hit);
				})
				totalCount += data.dashboards.totalCount;
				categoryMetadata.Dashboards.total = data.dashboards.totalCount || 0;
				
				data.dataSources.results.forEach(hit => {
					hit.type = 'dataSource';
					searchResults.push(hit);
				})
				totalCount += data.dataSources.total;
				categoryMetadata.DataSources.total = data.dataSources.total || 0;
				
				data.databases.results.forEach(hit => {
					hit.type = 'database';
					searchResults.push(hit);
				})
				totalCount += data.databases.total;
				categoryMetadata.Databases.total = data.databases.total || 0;
				console.log(data)
			} catch (err) {
				console.error(err);
			}
			
			console.log(categoryMetadata);
			
			const t1 = new Date().getTime();
			
			let getUserDataFlag = true;
	
			if (searchResults && searchResults.length > 0) {
				
				if (!offset) {
					trackSearch(
						searchText,
						`${getTrackingNameForFactory(cloneData.clone_name)}`,
						totalCount,
						false
					);
				}

				setState(dispatch, {
					timeFound: ((t1 - t0) / 1000).toFixed(2),
					prevSearchText: searchText,
					loading: false,
					count: totalCount,
					rawSearchResults: searchResults,
					searchResultsCount: searchResults.length,
					autocompleteItems: [],
					isCachedResult: false,
					metricsLoading: false,
					metricsCounted: true,
					loadingTinyUrl: false,
					hideTabs: false,
					categoryMetadata
				});
				
			} else {
				if (!offset) {
					trackSearch(
						searchText,
						`${getTrackingNameForFactory(cloneData.clone_name)}`,
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
	
			setSearchURL({searchText, resultsPage, tabName, cloneData}, searchSettings);
	
			if (getUserDataFlag) {
				getUserData(dispatch);
			}
	
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
	}
};

export default GlobalSearchHandler;
