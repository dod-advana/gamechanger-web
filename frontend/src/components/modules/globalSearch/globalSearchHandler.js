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
		setState(dispatch, { runSearch: false, activeCategoryTab: 'all' });

		const {
			searchText = '',
			resultsPage,
			userData,
			searchSettings,
			tabName,
			cloneData,
			selectedCategories,
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
			applicationsSearchResults: {
				searchResults: [],
				loading: selectedCategories.Applications,
				totalCount: 0,
				pagination: false,
				page: 1,
			},
			dashboardsSearchResults: {
				searchResults: [],
				loading: selectedCategories.Dashboards,
				totalCount: 0,
				pagination: false,
				page: 1,
			},
			dataSourcesSearchResults: {
				searchResults: [],
				loading: selectedCategories.DataSources,
				totalCount: 0,
				pagination: false,
				page: 1,
			},
			databasesSearchResults: {
				searchResults: [],
				loading: selectedCategories.Databases,
				totalCount: 0,
				pagination: false,
				page: 1,
			},
			modelsSearchResults: {
				searchResults: [],
				loading: selectedCategories.Models,
				totalCount: 0,
				pagination: false,
				page: 1,
			},
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
			categoryMetadata: {},
		});

		try {
			// Make the global search calls
			await this.makeMainSearchCalls(state, dispatch);

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

	async makeMainSearchCalls(state, dispatch) {
		const { selectedCategories, cloneData } = state;

		const offset = 0;
		const tiny_url = await createTinyUrl(cloneData);

		if (selectedCategories.Applications) {
			this.handleModularSearch(state, 'applications', 1, offset, tiny_url)
				.then((data) => {
					setState(dispatch, {
						applicationsSearchResults: {
							searchResults: data.applications.results.map((hit) => ({
								...hit,
								type: 'applications',
							})),
							totalCount: data.applications.totalCount,
							loading: false,
							pagination: false,
							page: 1,
						},
					});
				})
				.catch((err) => {
					console.error(err);
					setState(dispatch, {
						applicationsSearchResults: {
							searchResults: [],
							totalCount: 0,
							loading: false,
							pagination: false,
							page: 1,
						},
					});
				});
		}

		if (selectedCategories.Dashboards) {
			this.handleModularSearch(state, 'dashboards', 1, offset, tiny_url)
				.then((data) => {
					setState(dispatch, {
						dashboardsSearchResults: {
							searchResults: data.dashboards.results.map((hit) => ({
								...hit,
								type: 'dashboards',
							})),
							totalCount: data.dashboards.totalCount,
							loading: false,
							pagination: false,
							page: 1,
						},
					});
				})
				.catch((err) => {
					console.error(err);
					setState(dispatch, {
						dashboardsSearchResults: {
							searchResults: [],
							totalCount: 0,
							loading: false,
							pagination: false,
							page: 1,
						},
					});
				});
		}

		if (selectedCategories.DataSources) {
			this.handleModularSearch(state, 'dataSources', 1, offset, tiny_url)
				.then((data) => {
					setState(dispatch, {
						dataSourcesSearchResults: {
							searchResults: data.dataSources.results.map((hit) => ({
								...hit,
								type: 'dataSources',
							})),
							totalCount: data.dataSources.total,
							loading: false,
							pagination: false,
							page: 1,
						},
					});
				})
				.catch((err) => {
					console.error(err);
					setState(dispatch, {
						dataSourcesSearchResults: {
							searchResults: [],
							totalCount: 0,
							loading: false,
							pagination: false,
							page: 1,
						},
					});
				});
		}

		if (selectedCategories.Databases) {
			this.handleModularSearch(state, 'databases', 1, offset, tiny_url)
				.then((data) => {
					setState(dispatch, {
						databasesSearchResults: {
							searchResults: data.databases.results.map((hit) => ({
								...hit,
								type: 'databases',
							})),
							totalCount: data.databases.total,
							loading: false,
							pagination: false,
							page: 1,
						},
					});
				})
				.catch((err) => {
					console.error(err);
					setState(dispatch, {
						databasesSearchResults: {
							searchResults: [],
							totalCount: 0,
							loading: false,
							pagination: false,
							page: 1,
						},
					});
				});
		}

		if (selectedCategories.Models) {
			this.handleModularSearch(state, 'models', 1, offset, tiny_url)
				.then((data) => {
					setState(dispatch, {
						modelsSearchResults: {
							searchResults: data.models.results.map((hit) => ({
								...hit,
								type: 'models',
							})),
							totalCount: data.models.total,
							loading: false,
							pagination: false,
							page: 1,
						},
					});
				})
				.catch((err) => {
					console.error(err);
					setState(dispatch, {
						modelsSearchResults: {
							searchResults: [],
							totalCount: 0,
							loading: false,
							pagination: false,
							page: 1,
						},
					});
				});
		}
	},

	async handlePagination(state, searchResultsObject, category) {
		const tmpResults = structuredClone(searchResultsObject);

		const data = await this.handleModularSearch(state, category, tmpResults.page);

		if (data) {
			tmpResults.searchResults = data[category].hits.map((hit) => {
				hit.type = category;
				return hit;
			});
			tmpResults.loading = false;
			tmpResults.pagination = false;
		}

		return tmpResults;
	},

	async handleApplicationsPagination(state, dispatch) {
		const results = this.handlePagination(state, state.applicationsSearchResults, 'applications');

		if (results) {
			setState(dispatch, {
				applicationsSearchResults: results,
			});
		}
	},

	async handleDashboardsPagination(state, dispatch) {
		const results = this.handlePagination(state, state.dashboardsSearchResults, 'dashboards');

		if (results) {
			setState(dispatch, {
				dashboardsSearchResults: results,
			});
		}
	},

	async handleDataSourcesPagination(state, dispatch) {
		const results = this.handlePagination(state, state.dataSourcesSearchResults, 'dataSources');

		if (results) {
			setState(dispatch, {
				dataSourcesSearchResults: results,
			});
		}
	},

	async handleDatabasesPagination(state, dispatch) {
		const results = this.handlePagination(state, state.databasesSearchResults, 'databases');

		if (results) {
			setState(dispatch, {
				databasesSearchResults: results,
			});
		}
	},

	async handleModelsPagination(state, dispatch) {
		const results = this.handlePagination(state, state.modelsSearchResults, 'models');

		if (results) {
			setState(dispatch, {
				modelsSearchResults: results,
			});
		}
	},

	async handleGetUserFavorites(favorite_apps, state) {
		const { cloneData } = state;

		const offset = 0;
		const limit = 100;
		const tiny_url = await createTinyUrl(cloneData);

		const favorites = {
			applicationsSearchResults: {
				searchResults: [],
				loading: false,
				totalCount: 0,
				pagination: false,
				page: 1,
			},
			dashboardsSearchResults: {
				searchResults: [],
				loading: false,
				totalCount: 0,
				pagination: false,
				page: 1,
			},
			dataSourcesSearchResults: {
				searchResults: [],
				loading: false,
				totalCount: 0,
				pagination: false,
				page: 1,
			},
			databasesSearchResults: {
				searchResults: [],
				loading: false,
				totalCount: 0,
				pagination: false,
				page: 1,
			},
			modelsSearchResults: {
				searchResults: [],
				loading: false,
				totalCount: 0,
				pagination: false,
				page: 1,
			},
		};

		const categories = ['applications', 'dashboards', 'dataSources', 'databases', 'models'];
		const conversion = [
			'applicationsSearchResults',
			'dashboardsSearchResults',
			'dataSourcesSearchResults',
			'databasesSearchResults',
			'modelsSearchResults',
		];

		const calls = [
			await this.handleModularSearch(state, 'applications', 1, offset, tiny_url, limit),
			await this.handleModularSearch(state, 'dashboards', 1, offset, tiny_url, limit),
			await this.handleModularSearch(state, 'dataSources', 1, offset, tiny_url, limit),
			await this.handleModularSearch(state, 'databases', 1, offset, tiny_url, limit),
			await this.handleModularSearch(state, 'models', 1, offset, tiny_url, limit),
		];

		const favoriteResults = await Promise.all(calls);

		favoriteResults.forEach((results, idx) => {
			const type = categories[idx];

			results[type].results?.forEach((item) => {
				let isFavorite = false;

				switch (type) {
					case 'applications':
					case 'dashboards':
						if (favorite_apps.includes(item.id.toString())) {
							isFavorite = true;
						}
						break;
					default:
						if (favorite_apps.includes(item.resource.id.toString())) {
							isFavorite = true;
						}
						break;
				}

				if (isFavorite) {
					favorites[conversion[idx]].searchResults.push({
						...item,
						type,
					});
					favorites[conversion[idx]].totalCount += 1;
				}
			});
		});

		return favorites;
	},

	async handleModularSearch(state, category, page, offset, tiny_url, limit) {
		const { searchText = '', listView, showTutorial, cloneData } = state;

		if (tiny_url === undefined) {
			tiny_url = await createTinyUrl(cloneData);
		}

		if (offset === undefined) {
			offset = (page - 1) * RESULTS_PER_PAGE;
		}

		if (limit === undefined) {
			limit = 18;
		}

		return new Promise((resolve, reject) => {
			const charsPadding = listView ? 750 : 90;
			const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));

			gameChangerAPI
				.modularSearch({
					cloneName: cloneData.clone_name,
					searchText: searchText,
					offset,
					limit,
					options: {
						charsPadding,
						showTutorial,
						useGCCache,
						tiny_url,
						category,
					},
				})
				.then(({ data }) => {
					resolve(data);
				})
				.catch((err) => {
					reject(err);
				});
		});
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
