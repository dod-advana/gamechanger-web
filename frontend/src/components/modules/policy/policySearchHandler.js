import _ from 'lodash';

import {
	getOrgToOrgQuery,
	getTrackingNameForFactory,
	getTypeQuery,
	NO_RESULTS_MESSAGE,
	numberWithCommas,
	PAGE_DISPLAYED,
	RECENT_SEARCH_LIMIT,
	RESULTS_PER_PAGE,
	SEARCH_TYPES,
	displayBackendError,
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
			setState(dispatch, { didYouMean: data?.autocorrect?.[0] });
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

const PolicySearchHandler = {
	async handleSearch(state, dispatch) {
		setState(dispatch, { runSearch: false });

		const {
			searchText = '',
			resultsPage,
			listView,
			showTutorial,
			userData,
			searchSettings,
			currentViewName,
			cloneData,
		} = state;

		const {
			searchType,
			orgFilter,
			typeFilter,
			allOrgsSelected,
			allTypesSelected,
			archivedCongressSelected,
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
			userData.search_history.length > 9 &&
			!showTutorial
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
			infiniteScrollPage: 1,
		});

		const trimmed = searchText.trim();
		if (_.isEmpty(trimmed)) return;

		const searchObject = getSearchObjectFromString(searchText);
		const recentSearches =
			localStorage.getItem(`recent${cloneData.clone_name}Searches`) || '[]';
		const recentSearchesParsed = JSON.parse(recentSearches);
		const orgFilterString = getOrgToOrgQuery(allOrgsSelected, orgFilter);
		const typeFilterString = getTypeQuery(allTypesSelected, typeFilter);

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

		const transformResults = searchType === SEARCH_TYPES.contextual;

		setState(dispatch, {
			selectedDocuments: new Map(),
			loading: searchSettings.isFilterUpdate ? false: true,
			replaceResults: true,
			metricsLoading: false,
			noResultsMessage: null,
			autocompleteItems: [],
			rawSearchResults: searchSettings.isFilterUpdate ? true : [],
			docSearchResults: [],
			topicSearchResults: [],
			entitySearchResults: [],
			categoryMetadata: {},
			qaResults: { question: '', answers: [], qaContext: [], params: {} },
			intelligentSearchResult: {},
			sentenceResults: [],
			searchResultsCount: 0,
			count: 0,
			entityCount: 0,
			topicCount: 0,
			resultsDownloadURL: '',
			timeFound: 0.0,
			iframePreviewLink: null,
			graph: { nodes: [], edges: [] },
			runningSearch: true,
			showFullGraph: false,
			docTypeData: {},
			runningEntitySearch: true,
			runningTopicSearch: true,
			hideTabs: false,
		});

		const offset = (resultsPage - 1) * RESULTS_PER_PAGE;

		const charsPadding = listView ? 750 : 90;

		const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));

		const tiny_url = await createTinyUrl(cloneData);

		let modifiedOrgFilter = allOrgsSelected ? {} : orgFilter;
		let modifiedTypeFilter = allTypesSelected ? {} : typeFilter;

		try {
			if (cloneData.show_graph && currentViewName === 'Graph') {
				setState(dispatch, { runGraphSearch: true });
			}

			gameChangerAPI
				.getDataForSearch({
					options: {
						orgFilterString,
						orgFilter: modifiedOrgFilter,
						typeFilterString,
						typeFilter: modifiedTypeFilter,
						cloneData,
						useGCCache,
						searchFields,
						accessDateFilter,
						publicationDateFilter,
						publicationDateAllTime,
						searchText,
						includeRevoked,
					},
					cloneName: cloneData.clone_name,
				})
				.then((resp) => {
					setState(dispatch, {
						entitiesForSearch: resp.data.entities,
						runningEntitySearch: false,
						topicsForSearch: resp.data.topics,
						runningTopicSearch: false,
					});
				})
				.catch((err) => {
					console.log(err);
					setState(dispatch, {
						entitiesForSearch: [],
						runningEntitySearch: false,
						topicsForSearch: [],
						runningTopicSearch: false,
					});
				});

			let combinedSearch = await gameChangerAPI.getCombinedSearchMode();
			combinedSearch = combinedSearch.data.value === 'true';

			let ltr = await gameChangerAPI.getLTRMode();
			ltr = ltr.data.value === 'true';

			const resp = await gameChangerAPI.modularSearch({
				cloneName: cloneData.clone_name,
				searchText: searchObject.search,
				offset,
				options: {
					searchType,
					orgFilterString,
					transformResults,
					charsPadding,
					typeFilterString,
					showTutorial,
					useGCCache,
					tiny_url,
					searchFields,
					accessDateFilter,
					publicationDateFilter,
					publicationDateAllTime,
					includeRevoked,
					archivedCongressSelected,
					ltr
				},
				limit: 18,
			});

			const t1 = new Date().getTime();

			let getUserDataFlag = true;

			if (_.isObject(resp.data)) {
				let {
					doc_types,
					doc_orgs,
					docs,
					entities,
					topics,
					totalCount,
					totalEntities,
					totalTopics,
					expansionDict,
					isCached,
					timeSinceCache,
					query,
					qaResults,
					sentenceResults,
					intelligentSearch,
				} = resp.data;

				displayBackendError(resp, dispatch);
				const categoryMetadata = {
					Documents: { total: totalCount },
					Organizations: { total: totalEntities },
					Topics: { total: totalTopics },
				};

				if (entities && Array.isArray(entities)) {
					// if entity, add wiki description
					entities.forEach(async (obj, i) => {
						if (obj && obj.type === 'organization') {
							const descriptionAPI =
								await gameChangerAPI.getDescriptionFromWikipedia(obj.name);
							let description = descriptionAPI.query;
							if (description.pages) {
								entities[i].description =
									description.pages[Object.keys(description.pages)[0]].extract;
							}
						}
					});

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

					const newSearchSettings = _.cloneDeep(searchSettings);

					if (doc_types && doc_orgs) {
						// get doc types (memorandum, issuance, etc.). also get top org.
						let orgCountMap = new Map();
						let docTypeMap = new Map();

						doc_types.forEach((element) => {
							var docTypeName = element.key;
							if (docTypeName.slice(-1) !== 's') {
								docTypeName = docTypeName + 's';
							}

							docTypeMap[docTypeName] = docTypeMap[docTypeName]
								? docTypeMap[docTypeName] + element.doc_count
								: element.doc_count;

							// const { docOrg } = getDocTypeStyles(element.key);
							// let docName = getTypeDisplay(docOrg);

							// if (docName === "" || docName === " ") {
							// 	docName = "Uncategorized ";
							// }

							// orgCountMap[docName] = orgCountMap[docName] ? orgCountMap[docName] + element.doc_count : element.doc_count;
						});

						doc_orgs.forEach((element) => {
							orgCountMap[element.key] = orgCountMap[element.key]
								? orgCountMap[element.key] + element.doc_count
								: element.doc_count;
						});

						var typeData = [];
						for (var key in docTypeMap) {
							typeData.push({
								name: key,
								value: docTypeMap[key],
							});
						}
						for (let key in state.presearchTypes) {
							if (!_.has(docTypeMap, key)) {
								typeData.push({
									name: key,
									value: 0,
								});
							}
						}

						let sortedTypes = typeData.sort(function (a, b) {
							return a.value < b.value ? 1 : b.value < a.value ? -1 : 0;
						});

						let sidebarTypes = [];
						for (let elt in sortedTypes) {
							sidebarTypes.push([
								sortedTypes[elt].name,
								numberWithCommas(sortedTypes[elt].value),
							]);
						}
						let orgData = [];
						for (let key in orgCountMap) {
							orgData.push({
								name: key,
								value: orgCountMap[key],
							});
						}

						for (let key in state.presearchSources) {
							if (!_.has(orgCountMap, key)) {
								orgData.push({
									name: key,
									value: 0,
								});
							}
						}

						let sortedOrgs = orgData.sort(function (a, b) {
							return a.value < b.value ? 1 : b.value < a.value ? -1 : 0;
						});

						let sidebarOrgData = [];
						for (let elt2 in sortedOrgs) {
							sidebarOrgData.push([
								sortedOrgs[elt2].name,
								numberWithCommas(sortedOrgs[elt2].value),
							]);
						}

						if (
							!searchSettings.isFilterUpdate ||
							(searchSettings.isFilterUpdate && searchSettings.allOrgsSelected)
						) {
							newSearchSettings.originalOrgFilters = sidebarOrgData;
						}
						if (
							!searchSettings.isFilterUpdate ||
							(searchSettings.isFilterUpdate && searchSettings.allTypesSelected)
						) {
							newSearchSettings.originalTypeFilters = sidebarTypes;
						}
						if (searchSettings.orgUpdate) {
							const typeFilterObject = {};
							newSearchSettings.originalTypeFilters.forEach(
								(type) => (typeFilterObject[type[0]] = 0)
							);

							sidebarTypes.forEach((type) => {
								typeFilterObject[type[0]] = type[1];
							});

							newSearchSettings.originalTypeFilters = Object.keys(
								typeFilterObject
							).map((type) => [type, typeFilterObject[type]]);
							newSearchSettings.originalTypeFilters.sort((a, b) => b[1] - a[1]);
						} else if (searchSettings.typeUpdate) {
							const orgFilterObject = {};
							newSearchSettings.originalOrgFilters.forEach(
								(org) => (orgFilterObject[org[0]] = 0)
							);

							sidebarOrgData.forEach((org) => {
								orgFilterObject[org[0]] = org[1];
							});

							newSearchSettings.originalOrgFilters = Object.keys(
								orgFilterObject
							).map((obj) => [obj, orgFilterObject[obj]]);
							newSearchSettings.originalOrgFilters.sort((a, b) => b[1] - a[1]);
						}

						newSearchSettings.orgUpdate = false;
						newSearchSettings.typeUpdate = false;
						newSearchSettings.isFilterUpdate = false;

						setState(dispatch, {
							sidebarDocTypes: sidebarTypes,
							sidebarOrgs: sidebarOrgData,
						});
					}

					if (!offset) {
						trackSearch(
							searchText,
							`${getTrackingNameForFactory(cloneData.clone_name)}${
								combinedSearch ? '_combined' : ''
							}`,
							totalCount,
							false
						);
					}

					setState(dispatch, {
						searchSettings: newSearchSettings,
						activeCategoryTab:
							entities.length === 0 && topics.length === 0
								? 'Documents'
								: 'all',
						timeFound: ((t1 - t0) / 1000).toFixed(2),
						prevSearchText: searchText,
						loading: false,
						count: totalCount,
						entityCount: totalEntities,
						topicCount: totalTopics,
						rawSearchResults: searchResults,
						docSearchResults: docs,
						entitySearchResults: entities,
						topicSearchResults: topics,
						qaResults: qaResults,
						intelligentSearchResult: intelligentSearch,
						sentenceResults: sentenceResults,
						searchResultsCount: searchResults.length,
						categoryMetadata: categoryMetadata,
						autocompleteItems: [],
						expansionDict,
						isCachedResult: isCached,
						timeSinceCache,
						hasExpansionTerms,
						metricsLoading: false,
						metricsCounted: true,
						loadingTinyUrl: false,
						hideTabs: false,
						resetSettingsSwitch: false,
						query,
					});
				} else {
					if (!offset) {
						trackSearch(
							searchText,
							`${getTrackingNameForFactory(cloneData.clone_name)}${
								combinedSearch ? '_combined' : ''
							}`,
							totalCount,
							false
						);
					}

					setState(dispatch, {
						loading: false,
						count: 0,
						rawSearchResults: [],
						docSearchResults: [],
						entitySearchResults: [],
						topicSearchResults: [],
						categoryMetadata: {},
						qaResults: { question: '', answers: [], qaContext: [], params: {} },
						intelligentSearchResult: {},
						sentenceResults: [],
						searchResultsCount: 0,
						runningSearch: false,
						prevSearchText: searchText,
						isCachedResult: false,
						loadingTinyUrl: false,
						hasExpansionTerms: false,
						resetSettingsSwitch: false,
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
				currentViewName,
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

		const index = cloneData.clone_name;
		getAndSetDidYouMean(index, searchText, dispatch);
	},

	async handleDocPagination(state, dispatch, replaceResults) {
		const {
			activeCategoryTab,
			docSearchResults,
			infiniteScrollPage,
			searchText = '',
			resultsPage,
			listView,
			showTutorial,
			searchSettings,
			cloneData,
			currentSort,
			currentOrder,
		} = state;

		const {
			searchType,
			orgFilter,
			typeFilter,
			allOrgsSelected,
			allTypesSelected,
			includeRevoked,
			accessDateFilter,
			publicationDateFilter,
			publicationDateAllTime,
			searchFields,
		} = searchSettings;

		const offset =
			((activeCategoryTab === 'all' ? resultsPage : infiniteScrollPage) - 1) *
			RESULTS_PER_PAGE;
		const orgFilterString = getOrgToOrgQuery(allOrgsSelected, orgFilter);
		const typeFilterString = getTypeQuery(allTypesSelected, typeFilter);
		const transformResults = searchType === SEARCH_TYPES.contextual;
		const charsPadding = listView ? 750 : 90;
		let modifiedOrgFilter = allOrgsSelected ? {} : orgFilter;
		let modifiedTypeFilter = allTypesSelected ? {} : typeFilter;
		const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));
		const limit = 18;

		const resp = await gameChangerAPI.callSearchFunction({
			functionName: 'documentSearchPagination',
			cloneName: cloneData.clone_name,
			options: {
				searchText,
				offset,
				searchType,
				orgFilterString,
				transformResults,
				charsPadding,
				orgFilter: modifiedOrgFilter,
				typeFilter: modifiedTypeFilter,
				typeFilterString,
				showTutorial,
				useGCCache,
				searchFields,
				accessDateFilter,
				publicationDateFilter,
				publicationDateAllTime,
				includeRevoked,
				limit,
				sort: currentSort,
				order: currentOrder,
			},
		});

		if (resp.data) {
			if (replaceResults) {
				setState(dispatch, {
					docSearchResults: resp.data.docs,
					docsLoading: false,
					docsPagination: false,
				});
			} else {
				setState(dispatch, {
					docSearchResults: [...docSearchResults, ...resp.data.docs],
					docsLoading: false,
					docsPagination: false,
				});
			}
		}
	},

	async handleEntityPagination(state, dispatch) {
		setState(dispatch, {
			entityPagination: false,
		});
		const { searchText = '', entityPage, cloneData } = state;
		const offset = (entityPage - 1) * RESULTS_PER_PAGE;
		const resp = await gameChangerAPI.callSearchFunction({
			functionName: 'entityPagination',
			cloneName: cloneData.clone_name,
			options: {
				searchText,
				offset,
				limit: 6,
			},
		});
		if (resp.data) {
			setState(dispatch, {
				entitySearchResults: resp.data.entities,
				entitiesLoading: false,
			});
		}
	},

	async handleTopicPagination(state, dispatch) {
		setState(dispatch, {
			topicPagination: false,
		});
		const { searchText = '', entityPage, cloneData } = state;
		const offset = (entityPage - 1) * RESULTS_PER_PAGE;
		const resp = await gameChangerAPI.callSearchFunction({
			functionName: 'topicPagination',
			cloneName: cloneData.clone_name,
			options: {
				searchText,
				offset,
				limit: 6,
			},
		});
		if (resp.data) {
			setState(dispatch, {
				topicSearchResults: resp.data.entities,
				topicsLoading: false,
			});
		}
	},

	async getPresearchData(state, dispatch) {
		const { cloneData } = state;
		if (_.isEmpty(state.presearchSources)) {
			const resp = await gameChangerAPI.callSearchFunction({
				functionName: 'getPresearchData',
				cloneName: cloneData.clone_name,
				options: {},
			});

			const orgFilters = {};
			for (const key in resp.data.orgs) {
				orgFilters[resp.data.orgs[[key]]] = false;
			}
			const typeFilters = {};
			for (const key in resp.data.types) {
				let name = resp.data.types[key];
				if (name.slice(-1) !== 's') {
					name = name + 's';
				}
				typeFilters[name] = false;
			}
			const newSearchSettings = _.cloneDeep(state.searchSettings);
			newSearchSettings.orgFilter = orgFilters;
			newSearchSettings.typeFilter = typeFilters;
			if (_.isEmpty(state.presearchSources)) {
				setState(dispatch, { presearchSources: orgFilters });
			}
			if (_.isEmpty(state.presearchTypes)) {
				setState(dispatch, { presearchTypes: typeFilters });
			}
			setState(dispatch, { searchSettings: newSearchSettings });
		} else {
			const newSearchSettings = _.cloneDeep(state.searchSettings);
			newSearchSettings.orgFilter = state.presearchSources;
			newSearchSettings.typeFilter = state.presearchTypes;
			setState(dispatch, { searchSettings: newSearchSettings });
		}
	},

	parseSearchURL(defaultState, url) {
		return simpleSearchHandler.parseSearchURL(defaultState, url);
	},

	setSearchURL(state) {
		const { searchText, resultsPage } = state;
		const {
			searchType,
			orgFilter,
			typeFilter,
			searchFields,
			accessDateFilter,
			publicationDateFilter,
			publicationDateAllTime,
			allOrgsSelected,
			allTypesSelected,
			includeRevoked,
		} = state.searchSettings;

		const offset = (resultsPage - 1) * RESULTS_PER_PAGE;

		const orgFilterText = !allOrgsSelected
			? Object.keys(_.pickBy(orgFilter, (value, key) => value)).join('_')
			: undefined;

		const typeFilterText = !allTypesSelected
			? Object.keys(_.pickBy(typeFilter, (value, key) => value)).join('_')
			: undefined;

		const searchFieldText = Object.keys(
			_.pickBy(searchFields, (value, key) => value.field)
		)
			.map(
				(key) =>
					`${searchFields[key].field.display_name}-${searchFields[key].input}`
			)
			.join('_');

		const accessDateText =
			accessDateFilter && accessDateFilter[0] && accessDateFilter[1]
				? accessDateFilter.map((date) => date.getTime()).join('_')
				: undefined;

		const pubDateText =
			!publicationDateAllTime &&
			publicationDateFilter &&
			publicationDateFilter[0] &&
			publicationDateFilter[1]
				? publicationDateFilter.map((date) => date.getTime()).join('_')
				: undefined;

		const categoriesText = state.selectedCategories
			? Object.keys(
				_.pickBy(state.selectedCategories, (value) => !!value)
			  ).join('_')
			: undefined;

		const currentParams =
			new URLSearchParams(window.location.hash.replace(`#/${state.cloneData.url.toLowerCase()}`, ''));

		const params = new URLSearchParams();
		if (searchText) params.append('q', searchText);
		if (offset) params.append('offset', String(offset)); // 0 is default
		if (searchType) params.append('searchType', searchType);
		if (orgFilterText) params.append('orgFilter', orgFilterText);
		if (typeFilterText) params.append('typeFilter', typeFilterText);
		if (searchFieldText) params.append('searchFields', searchFieldText);
		if (accessDateText) params.append('accessDate', accessDateText);
		if (pubDateText) params.append('pubDate', pubDateText);
		if (includeRevoked) params.append('revoked', String(includeRevoked)); // false is default
		if (categoriesText !== undefined)
			params.append('categories', categoriesText); // '' is different than undefined
		if (currentParams.get('view') === 'graph') params.append('view', 'graph');

		const linkString = `/#/${state.cloneData.url.toLowerCase()}?${params}`;

		window.history.pushState(null, document.title, linkString);
	},
};

export default PolicySearchHandler;
