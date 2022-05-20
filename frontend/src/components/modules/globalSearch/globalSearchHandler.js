import _ from 'lodash';

import {
	getQueryVariable,
	PAGE_DISPLAYED,
	RECENT_SEARCH_LIMIT,
	RESULTS_PER_PAGE,
} from '../../../utils/gamechangerUtils';
import { createTinyUrl, setState } from '../../../utils/sharedFunctions';
import GameChangerAPI from '../../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();

const GlobalSearchHandler = {
	async handleSearch(state, dispatch) {
		setState(dispatch, { runSearch: false });

		const {
			searchText = '',
			resultsPage,
			listView,
			userData,
			searchSettings,
			tabName,
			cloneData,
			showTutorial,
		} = state;

		let favSearchUrls = [];
		if (userData.favorite_searches) {
			favSearchUrls = userData.favorite_searches.map((search) => {
				return search.url;
			});
		}

		this.setSearchURL(state);

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
		});

		const trimmed = searchText.trim();
		if (_.isEmpty(trimmed)) return;

		const recentSearches = localStorage.getItem(`recent${cloneData.clone_name}Searches`) || '[]';
		const recentSearchesParsed = JSON.parse(recentSearches);

		if (!recentSearchesParsed.includes(searchText)) {
			recentSearchesParsed.unshift(searchText);
			if (recentSearchesParsed.length === RECENT_SEARCH_LIMIT) recentSearchesParsed.pop();
			localStorage.setItem(`recent${cloneData.clone_name}Searches`, JSON.stringify(recentSearchesParsed));
		}

		setState(dispatch, {
			selectedDocuments: new Map(),
			loading: true,
			metricsLoading: true,
			noResultsMessage: null,
			autocompleteItems: [],
			rawSearchResults: [],
			docSearchResults: [],
			applicationsSearchResults: [],
			dashboardsSearchResults: [],
			dataSourcesSearchResults: [],
			databasesSearchResults: [],
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
			applicationsLoading: true,
			dashboardsLoading: true,
			dataSourcesLoading: true,
			databasesLoading: true,
			categoryMetadata: {},
			applicationsTotalCount: 0,
			dashboardsTotalCount: 0,
			dataSourcesTotalCount: 0,
			databasesTotalCount: 0,
		});

		const offset = (resultsPage - 1) * RESULTS_PER_PAGE;

		const charsPadding = listView ? 750 : 90;

		const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));

		const tiny_url = await createTinyUrl(cloneData);

		try {
			// Make the global search calls
			try {
				gameChangerAPI
					.modularSearch({
						cloneName: cloneData.clone_name,
						searchText: searchText,
						offset,
						options: {
							charsPadding,
							showTutorial,
							useGCCache,
							tiny_url,
							category: 'applications',
						},
					})
					.then((data) => {
						setState(dispatch, {
							applicationsSearchResults: data.data.applications.hits.map((hit) => ({
								...hit,
								type: 'application',
							})),
							applicationsTotalCount: data.data.applications.totalCount,
							applicationsLoading: false,
						});
					})
					.catch(() => {
						setState(dispatch, {
							applicationsTotalCount: 0,
							applicationsLoading: false,
						});
					});
			} catch (err) {
				console.error(err);
			}

			try {
				gameChangerAPI
					.modularSearch({
						cloneName: cloneData.clone_name,
						searchText: searchText,
						offset,
						options: {
							charsPadding,
							showTutorial,
							useGCCache,
							tiny_url,
							category: 'dashboards',
						},
					})
					.then((data) => {
						setState(dispatch, {
							dashboardsSearchResults: data.data.dashboards.hits.map((hit) => ({
								...hit,
								type: 'dashboard',
							})),
							dashboardsTotalCount: data.data.dashboards.totalCount,
							dashboardsLoading: false,
						});
					})
					.catch(() => {
						setState(dispatch, {
							dashboardsTotalCount: 0,
							dashboardsLoading: false,
						});
					});
			} catch (err) {
				console.error(err);
			}

			try {
				gameChangerAPI
					.modularSearch({
						cloneName: cloneData.clone_name,
						searchText: searchText,
						offset,
						options: {
							charsPadding,
							showTutorial,
							useGCCache,
							tiny_url,
							category: 'dataSources',
						},
					})
					.then((data) => {
						setState(dispatch, {
							dataSourcesSearchResults: data.data.dataSources.results.map((hit) => ({
								...hit,
								type: 'dataSource',
							})),
							dataSourcesTotalCount: data.data.dataSources.total,
							dataSourcesLoading: false,
						});
					})
					.catch(() => {
						setState(dispatch, {
							dataSourcesTotalCount: 0,
							dataSourcesLoading: false,
						});
					});
			} catch (err) {
				console.error(err);
			}

			try {
				gameChangerAPI
					.modularSearch({
						cloneName: cloneData.clone_name,
						searchText: searchText,
						offset,
						options: {
							charsPadding,
							showTutorial,
							useGCCache,
							tiny_url,
							category: 'databases',
						},
					})
					.then((data) => {
						setState(dispatch, {
							databasesSearchResults: data.data.databases.results.map((hit) => ({
								...hit,
								type: 'database',
							})),
							databasesTotalCount: data.data.databases.total,
							databasesLoading: false,
						});
					})
					.catch(() => {
						setState(dispatch, {
							databasesTotalCount: 0,
							databasesLoading: false,
						});
					});
			} catch (err) {
				console.error(err);
			}

			this.setSearchURL({
				...state,
				searchText,
				resultsPage,
				tabName,
				cloneData,
				searchSettings,
			});
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
	},

	async handleApplicationsPagination(state, dispatch) {
		const { searchText = '', applicationsPage, listView, showTutorial, cloneData } = state;

		const offset = (applicationsPage - 1) * RESULTS_PER_PAGE;
		const charsPadding = listView ? 750 : 90;
		const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));
		const limit = 18;
		const tiny_url = await createTinyUrl(cloneData);

		const resp = await gameChangerAPI.modularSearch({
			cloneName: cloneData.clone_name,
			searchText: searchText,
			offset,
			options: {
				charsPadding,
				showTutorial,
				useGCCache,
				tiny_url,
				category: 'applications',
				limit,
			},
		});

		if (resp.data) {
			setState(dispatch, {
				applicationsSearchResults: resp.data.applications.hits.map((hit) => {
					hit.type = 'application';
					return hit;
				}),
				applicationsLoading: false,
				applicationsPagination: false,
			});
		}
	},

	async handleDashboardsPagination(state, dispatch) {
		const { searchText = '', dashboardsPage, listView, showTutorial, cloneData } = state;

		const offset = (dashboardsPage - 1) * RESULTS_PER_PAGE;
		const charsPadding = listView ? 750 : 90;
		const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));
		const limit = 18;
		const tiny_url = await createTinyUrl(cloneData);

		const resp = await gameChangerAPI.modularSearch({
			cloneName: cloneData.clone_name,
			searchText: searchText,
			offset,
			options: {
				charsPadding,
				showTutorial,
				useGCCache,
				tiny_url,
				category: 'dashboards',
				limit,
			},
		});

		if (resp.data) {
			setState(dispatch, {
				dashboardsSearchResults: resp.data.dashboards.hits.map((hit) => {
					hit.type = 'dashboard';
					return hit;
				}),
				dashboardsLoading: false,
				dashboardsPagination: false,
			});
		}
	},

	async handleDataSourcesPagination(state, dispatch) {
		const { searchText = '', dataSourcesPage, listView, showTutorial, cloneData } = state;

		const offset = (dataSourcesPage - 1) * RESULTS_PER_PAGE;
		const charsPadding = listView ? 750 : 90;
		const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));
		const limit = 18;
		const tiny_url = await createTinyUrl(cloneData);

		const resp = await gameChangerAPI.modularSearch({
			cloneName: cloneData.clone_name,
			searchText: searchText,
			offset,
			options: {
				charsPadding,
				showTutorial,
				useGCCache,
				tiny_url,
				category: 'dataSources',
				limit,
			},
		});

		if (resp.data) {
			setState(dispatch, {
				dataSourcesSearchResults: resp.data.dataSources.results.map((result) => {
					result.type = 'dataSource';
					return result;
				}),
				dataSourcesLoading: false,
				dataSourcesPagination: false,
			});
		}
	},

	async handleDatabasesPagination(state, dispatch) {
		const { searchText = '', databasesPage, listView, showTutorial, cloneData } = state;

		const offset = (databasesPage - 1) * RESULTS_PER_PAGE;
		const charsPadding = listView ? 750 : 90;
		const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));
		const limit = 18;
		const tiny_url = await createTinyUrl(cloneData);

		const resp = await gameChangerAPI.modularSearch({
			cloneName: cloneData.clone_name,
			searchText: searchText,
			offset,
			options: {
				charsPadding,
				showTutorial,
				useGCCache,
				tiny_url,
				category: 'databases',
				limit,
			},
		});

		if (resp.data) {
			setState(dispatch, {
				databasesSearchResults: resp.data.databases.results.map((result) => {
					result.type = 'database';
					return result;
				}),
				databasesLoading: false,
				databasesPagination: false,
			});
		}
	},

	parseSearchURL(defaultState, url) {
		if (!url) url = window.location.href;

		const parsed = {};

		const keyword = getQueryVariable('keyword', url);
		const categoriesURL = getQueryVariable('categories', url);

		if (keyword) {
			parsed.searchText = keyword;
		}

		if (categoriesURL) {
			const categories = categoriesURL.split('_');
			const selectedCategories = _.cloneDeep(defaultState.selectedCategories || {});
			for (const category in selectedCategories) {
				selectedCategories[category] = categories.includes(category);
			}
			if (!_.isEmpty(selectedCategories)) {
				parsed.selectedCategories = selectedCategories;
			}
		}

		return parsed;
	},

	setSearchURL(state) {
		const { searchText, resultsPage } = state;
		const offset = (resultsPage - 1) * RESULTS_PER_PAGE;

		const categoriesText = state.selectedCategories
			? Object.keys(_.pickBy(state.selectedCategories, (value) => !!value)).join('_')
			: undefined;

		const params = new URLSearchParams();
		if (searchText) params.append('keyword', searchText);
		if (offset) params.append('offset', String(offset)); // 0 is default
		if (categoriesText !== undefined) params.append('categories', categoriesText); // '' is different than undefined

		const linkString = `/#/${state.cloneData.url.toLowerCase()}?${params}`;

		window.history.pushState(null, document.title, linkString);
	},
};

export default GlobalSearchHandler;
