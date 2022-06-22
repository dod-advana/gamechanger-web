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
			applicationsSearchResults: [],
			dashboardsSearchResults: [],
			dataSourcesSearchResults: [],
			databasesSearchResults: [],
			modelsSearchResults: [],
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
			applicationsLoading: selectedCategories.Applications,
			dashboardsLoading: selectedCategories.Dashboards,
			dataSourcesLoading: selectedCategories.DataSources,
			databasesLoading: selectedCategories.Databases,
			modelsLoading: selectedCategories.Models,
			categoryMetadata: {},
			applicationsTotalCount: 0,
			dashboardsTotalCount: 0,
			dataSourcesTotalCount: 0,
			databasesTotalCount: 0,
			modelsTotalCount: 0,
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
			try {
				this.handleModularSearch(state, 'applications', 1, offset, tiny_url)
					.then((data) => {
						setState(dispatch, {
							applicationsSearchResults: data.applications.results.map((hit) => ({
								...hit,
								type: 'application',
							})),
							applicationsTotalCount: data.applications.totalCount,
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
		}

		if (selectedCategories.Dashboards) {
			try {
				this.handleModularSearch(state, 'dashboards', 1, offset, tiny_url)
					.then((data) => {
						setState(dispatch, {
							dashboardsSearchResults: data.dashboards.results.map((hit) => ({
								...hit,
								type: 'dashboard',
							})),
							dashboardsTotalCount: data.dashboards.totalCount,
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
		}

		if (selectedCategories.DataSources) {
			try {
				this.handleModularSearch(state, 'dataSources', 1, offset, tiny_url)
					.then((data) => {
						setState(dispatch, {
							dataSourcesSearchResults: data.dataSources.results.map((hit) => ({
								...hit,
								type: 'dataSource',
							})),
							dataSourcesTotalCount: data.dataSources.total,
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
		}

		if (selectedCategories.Databases) {
			try {
				this.handleModularSearch(state, 'databases', 1, offset, tiny_url)
					.then((data) => {
						setState(dispatch, {
							databasesSearchResults: data.databases.results.map((hit) => ({
								...hit,
								type: 'database',
							})),
							databasesTotalCount: data.databases.total,
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
		}

		if (selectedCategories.Models) {
			try {
				this.handleModularSearch(state, 'models', 1, offset, tiny_url)
					.then((data) => {
						setState(dispatch, {
							modelsSearchResults: data.models.results.map((hit) => ({
								...hit,
								type: 'models',
							})),
							modelsTotalCount: data.models.total,
							modelsLoading: false,
						});
					})
					.catch(() => {
						setState(dispatch, {
							modelsTotalCount: 0,
							modelsLoading: false,
						});
					});
			} catch (err) {
				console.error(err);
			}
		}
	},

	async handleApplicationsPagination(state, dispatch) {
		const data = await this.handleModularSearch(state, 'applications', state.applicationsPage);

		if (data) {
			setState(dispatch, {
				applicationsSearchResults: data.applications.hits.map((hit) => {
					hit.type = 'application';
					return hit;
				}),
				applicationsLoading: false,
				applicationsPagination: false,
			});
		}
	},

	async handleDashboardsPagination(state, dispatch) {
		const data = await this.handleModularSearch(state, 'dashboards', state.dashboardsPage);

		if (data) {
			setState(dispatch, {
				dashboardsSearchResults: data.dashboards.hits.map((hit) => {
					hit.type = 'dashboard';
					return hit;
				}),
				dashboardsLoading: false,
				dashboardsPagination: false,
			});
		}
	},

	async handleDataSourcesPagination(state, dispatch) {
		const data = await this.handleModularSearch(state, 'dataSources', state.dataSourcesPage);

		if (data) {
			setState(dispatch, {
				dataSourcesSearchResults: data.dataSources.results.map((result) => {
					result.type = 'dataSource';
					return result;
				}),
				dataSourcesLoading: false,
				dataSourcesPagination: false,
			});
		}
	},

	async handleDatabasesPagination(state, dispatch) {
		const data = await this.handleModularSearch(state, 'databases', state.databasesPage);

		if (data) {
			setState(dispatch, {
				databasesSearchResults: data.databases.results.map((result) => {
					result.type = 'database';
					return result;
				}),
				databasesLoading: false,
				databasesPagination: false,
			});
		}
	},

	async handleModelsPagination(state, dispatch) {
		const data = await this.handleModularSearch(state, 'models', state.modelsPage);

		if (data) {
			setState(dispatch, {
				modelsSearchResults: data.models.results.map((result) => {
					result.type = 'models';
					return result;
				}),
				modelsLoading: false,
				modelsPagination: false,
			});
		}
	},

	async handleGetUserFavorites(favorite_apps, state) {
		const { cloneData } = state;

		const offset = 0;
		const limit = 100;
		const tiny_url = await createTinyUrl(cloneData);

		const favorites = { applications: [], dashboards: [], dataSources: [], databases: [], models: [] };
		const sections = ['applications', 'dashboards', 'dataSources', 'databases', 'models'];
		const conversion = ['application', 'dashboard', 'dataSource', 'database', 'models'];

		const calls = [
			await this.handleModularSearch(state, 'applications', 1, offset, tiny_url, limit),
			await this.handleModularSearch(state, 'dashboards', 1, offset, tiny_url, limit),
			await this.handleModularSearch(state, 'dataSources', 1, offset, tiny_url, limit),
			await this.handleModularSearch(state, 'databases', 1, offset, tiny_url, limit),
			await this.handleModularSearch(state, 'models', 1, offset, tiny_url, limit),
		];

		const favoriteResults = await Promise.all(calls);

		favoriteResults.forEach((results, idx) => {
			const type = sections[idx];

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
					favorites[type].push({
						...item,
						type: conversion[idx],
					});
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
