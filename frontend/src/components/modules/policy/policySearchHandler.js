import _ from 'lodash';
import axios from 'axios';

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
import { createTinyUrl, getSearchObjectFromString, getUserData, setState } from '../../../utils/sharedFunctions';
import GameChangerAPI from '../../api/gameChanger-service-api';
import simpleSearchHandler from '../simple/simpleSearchHandler';

const gameChangerAPI = new GameChangerAPI();
let cancelToken = axios.CancelToken.source();

const getAndSetDidYouMean = (index, searchText, dispatch) => {
	gameChangerAPI
		.getTextSuggestion({ index, searchText })
		.then(({ data }) => {
			setState(dispatch, { didYouMean: data?.autocorrect?.[0] });
		})
		.catch((_e) => {
			//do nothing
		});
};

const clearFavoriteSearchUpdate = async (search, _index, dispatch) => {
	try {
		await gameChangerAPI.clearFavoriteSearchUpdate(search.tiny_url);
		getUserData(dispatch);
	} catch (err) {
		console.log(err);
	}
};

const addWikiDescriptionToEntities = (entities) => {
	// if entity, add wiki description
	entities.forEach(async (obj, i) => {
		if (obj && obj.type === 'organization') {
			const descriptionAPI = await gameChangerAPI.getDescriptionFromWikipedia(obj.name);
			let description = descriptionAPI.query;
			if (description.pages) {
				entities[i].description = description.pages[Object.keys(description.pages)[0]].extract;
			}
		}
	});
};

const disableNotificationsForFavSearch = (searchFavorite, userData, url, dispatch) => {
	// if this search is a favorite, turn off notifications of new results
	if (searchFavorite) {
		userData.favorite_searches.forEach((search, index) => {
			if (search.url === url) {
				clearFavoriteSearchUpdate(search, index, dispatch);
				return false;
			}
		});
	}
	return true;
};

const addFavoriteFieldToSearchResults = (userData, searchResults) => {
	const favFilenames = userData.favorite_documents.map((document) => {
		return document.filename;
	});

	searchResults.forEach((result) => {
		result.favorite = favFilenames.includes(result.filename);
	});
};

const checkForExpansionTerms = (expansionDict) => {
	let hasExpansionTerms = false;
	if (expansionDict) {
		Object.keys(expansionDict).forEach((expansionDictKey) => {
			if (expansionDict[expansionDictKey].length > 0) hasExpansionTerms = true;
		});
	}
	return hasExpansionTerms;
};

const createOrgCountDocTypeMaps = (doc_types, doc_orgs) => {
	let orgCountMap = new Map();
	let docTypeMap = new Map();

	doc_types.forEach((element) => {
		let docTypeName = element.key;
		docTypeMap[docTypeName] = docTypeMap[docTypeName]
			? docTypeMap[docTypeName] + element.doc_count
			: element.doc_count;
	});

	doc_orgs.forEach((element) => {
		orgCountMap[element.key] = orgCountMap[element.key]
			? orgCountMap[element.key] + element.doc_count
			: element.doc_count;
	});

	return { orgCountMap, docTypeMap };
};

const createDocTypesList = (docTypeMap, state) => {
	let typeData = [];
	for (let key in docTypeMap) {
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

	return typeData.sort(function (a, b) {
		return b.value - a.value;
	});
};

const createOrgCountList = (orgCountMap, state) => {
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

	return orgData.sort(function (a, b) {
		return b.value - a.value;
	});
};

const createSidebarTypesOrgs = (sortedTypes, sortedOrgs) => {
	let sidebarTypes = [];
	for (let elt in sortedTypes) {
		sidebarTypes.push([sortedTypes[elt].name, numberWithCommas(sortedTypes[elt].value)]);
	}

	let sidebarOrgData = [];
	for (let elt2 in sortedOrgs) {
		sidebarOrgData.push([sortedOrgs[elt2].name, numberWithCommas(sortedOrgs[elt2].value)]);
	}

	return { sidebarTypes, sidebarOrgData };
};

const updateNewSearchSettingsOrgTypeFilters = (searchSettings, newSearchSettings, sidebarOrgData, sidebarTypes) => {
	if (!searchSettings.isFilterUpdate || (searchSettings.isFilterUpdate && searchSettings.allOrgsSelected)) {
		newSearchSettings.originalOrgFilters = sidebarOrgData;
	}
	if (!searchSettings.isFilterUpdate || (searchSettings.isFilterUpdate && searchSettings.allTypesSelected)) {
		newSearchSettings.originalTypeFilters = sidebarTypes;
	}
	if (searchSettings.orgUpdate) {
		const typeFilterObject = {};
		newSearchSettings.originalTypeFilters.forEach((type) => (typeFilterObject[type[0]] = 0));
		sidebarTypes.forEach((type) => {
			typeFilterObject[type[0]] = type[1];
		});

		newSearchSettings.originalTypeFilters = Object.keys(typeFilterObject).map((type) => [
			type,
			typeFilterObject[type],
		]);
		newSearchSettings.originalTypeFilters.sort((a, b) => b[1] - a[1]);
	} else if (searchSettings.typeUpdate) {
		const orgFilterObject = {};
		newSearchSettings.originalOrgFilters.forEach((org) => (orgFilterObject[org[0]] = 0));

		sidebarOrgData.forEach((org) => {
			orgFilterObject[org[0]] = org[1];
		});

		newSearchSettings.originalOrgFilters = Object.keys(orgFilterObject).map((obj) => [obj, orgFilterObject[obj]]);
		newSearchSettings.originalOrgFilters.sort((a, b) => b[1] - a[1]);
	}
};

const handleDocTypesAndDocOrgs = (doc_types, doc_orgs, state, searchSettings, newSearchSettings, dispatch) => {
	if (doc_types && doc_orgs) {
		const { docTypeMap, orgCountMap } = createOrgCountDocTypeMaps(doc_types, doc_orgs);
		const sortedTypes = createDocTypesList(docTypeMap, state);
		const sortedOrgs = createOrgCountList(orgCountMap, state);
		const { sidebarOrgData, sidebarTypes } = createSidebarTypesOrgs(sortedTypes, sortedOrgs);
		updateNewSearchSettingsOrgTypeFilters(searchSettings, newSearchSettings, sidebarOrgData, sidebarTypes);

		newSearchSettings.orgUpdate = false;
		newSearchSettings.typeUpdate = false;
		newSearchSettings.isFilterUpdate = false;
		setState(dispatch, {
			sidebarDocTypes: sidebarTypes,
			sidebarOrgs: sidebarOrgData,
		});
	}
};

const getNewActiveCategory = (activeCategoryTab, entities, topics) => {
	let newActiveCategory = activeCategoryTab;

	if (
		entities.length === 0 &&
		(topics.length === 0 || newActiveCategory === 'Organizations' || newActiveCategory === 'Topics')
	) {
		newActiveCategory = 'Documents';
	}
	return newActiveCategory;
};

const handleResponseData = (
	resp,
	dispatch,
	state,
	{ searchResults, searchFavorite, url, combinedSearch, t0, getUserDataFlag }
) => {
	const {
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
	const { userData, searchSettings, resultsPage, searchText = '', cloneData, activeCategoryTab } = state;
	const offset = (resultsPage - 1) * RESULTS_PER_PAGE;
	const categoryMetadata = {
		Documents: { total: totalCount },
		Organizations: { total: totalEntities },
		Topics: { total: totalTopics },
	};
	const t1 = new Date().getTime();

	displayBackendError(resp, dispatch);

	if (entities && Array.isArray(entities)) {
		addWikiDescriptionToEntities(entities);

		// intelligent search failed, show keyword results with warning alert
		if (resp.data.transformFailed) {
			setState(dispatch, { transformFailed: true });
		}

		searchResults = searchResults.concat(docs);
		addFavoriteFieldToSearchResults(userData, searchResults);

		getUserDataFlag = disableNotificationsForFavSearch(searchFavorite, userData, url, dispatch);
		let hasExpansionTerms = checkForExpansionTerms(expansionDict);

		const newSearchSettings = _.cloneDeep(searchSettings);
		handleDocTypesAndDocOrgs(doc_types, doc_orgs, state, searchSettings, newSearchSettings, dispatch);

		if (!offset) {
			trackSearch(
				searchText,
				`${getTrackingNameForFactory(cloneData.clone_name)}${combinedSearch ? '_combined' : ''}`,
				totalCount,
				false
			);
		}

		const newActiveCategory = getNewActiveCategory(activeCategoryTab, entities, topics);

		setState(dispatch, {
			searchSettings: newSearchSettings,
			activeCategoryTab: newActiveCategory,
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
			runningSearch: false,
		});
	} else {
		if (!offset) {
			trackSearch(
				searchText,
				`${getTrackingNameForFactory(cloneData.clone_name)}${combinedSearch ? '_combined' : ''}`,
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

	return getUserDataFlag;
};

const handleGetUserData = (getUserDataFlag, dispatch) => {
	if (getUserDataFlag) {
		getUserData(dispatch);
	}
};

const handleRecentSearchesLocalStorage = (recentSearchesParsed, searchText, cloneData) => {
	if (!recentSearchesParsed.includes(searchText)) {
		recentSearchesParsed.unshift(searchText);
		if (recentSearchesParsed.length === RECENT_SEARCH_LIMIT) recentSearchesParsed.pop();
		localStorage.setItem(`recent${cloneData.clone_name}Searches`, JSON.stringify(recentSearchesParsed));
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
			runningSearch,
			currentSort,
			currentOrder,
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

		if (runningSearch) {
			cancelToken.cancel('cancelled axios with consecutive call');
			cancelToken = axios.CancelToken.source();
		}

		let favSearchUrls = [];
		if (userData !== undefined && userData.favorite_searches !== undefined) {
			favSearchUrls = userData.favorite_searches.map((search) => {
				return search.url;
			});
		}

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
			infiniteScrollPage: 1,
		});

		const trimmed = searchText.trim();
		if (_.isEmpty(trimmed)) return;

		const searchObject = getSearchObjectFromString(searchText);
		const recentSearches = localStorage.getItem(`recent${cloneData.clone_name}Searches`) || '[]';
		const recentSearchesParsed = JSON.parse(recentSearches);
		const orgFilterString = getOrgToOrgQuery(allOrgsSelected, orgFilter);
		const typeFilterString = getTypeQuery(allTypesSelected, typeFilter);

		handleRecentSearchesLocalStorage(recentSearchesParsed, searchText, cloneData);

		const t0 = new Date().getTime();

		let searchResults = [];

		const transformResults = searchType === SEARCH_TYPES.contextual;

		setState(dispatch, {
			selectedDocuments: new Map(),
			loading: searchSettings.isFilterUpdate ? false : true,
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
				.getDataForSearch(
					{
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
					},
					cancelToken
				)
				.then((res) => {
					setState(dispatch, {
						entitiesForSearch: res.data.entities,
						runningEntitySearch: false,
						topicsForSearch: res.data.topics,
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

			let combinedSearch = await gameChangerAPI.getCombinedSearchMode(cancelToken);
			combinedSearch = combinedSearch.data.value === 'true';

			let ltr = await gameChangerAPI.getLTRMode();
			ltr = ltr.data.value === 'true';

			const resp = await gameChangerAPI.modularSearch(
				{
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
						ltr,
						sort: currentSort,
						order: currentOrder,
					},
					limit: 18,
				},
				cancelToken
			);

			let getUserDataFlag = true;

			if (_.isObject(resp.data)) {
				getUserDataFlag = handleResponseData(resp, dispatch, state, {
					searchResults,
					searchFavorite,
					url,
					combinedSearch,
					t0,
					getUserDataFlag,
				});
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

			handleGetUserData(getUserDataFlag, dispatch);
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
			currentViewName,
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

		let offset =
			((activeCategoryTab === 'all' || currentViewName === 'Explorer' ? resultsPage : infiniteScrollPage) - 1) *
			RESULTS_PER_PAGE;
		const orgFilterString = getOrgToOrgQuery(allOrgsSelected, orgFilter);
		const typeFilterString = getTypeQuery(allTypesSelected, typeFilter);
		const transformResults = searchType === SEARCH_TYPES.contextual;
		const charsPadding = listView ? 750 : 90;
		let modifiedOrgFilter = allOrgsSelected ? {} : orgFilter;
		let modifiedTypeFilter = allTypesSelected ? {} : typeFilter;
		const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));
		const limit = 18;

		let search_after = [];
		let search_before = [];
		if (offset >= 9982 && state.rawSearchResults.length > 0) {
			offset = 0;
			if (state.visitEarlierPage) {
				search_before = state.rawSearchResults[0]?.sort;
			} else {
				search_after = state.rawSearchResults[state.rawSearchResults.length - 1]?.sort;
			}
		}

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
				search_after,
				search_before,
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
				typeFilters[name] = false;
			}
			const newSearchSettings = _.cloneDeep(state.searchSettings);
			newSearchSettings.orgFilter = orgFilters;
			newSearchSettings.typeFilter = typeFilters;

			//initiallize original org and type filters to revert counts to.
			if (!newSearchSettings?.originalOrgFilters?.length)
				newSearchSettings.originalOrgFilters = Object.keys(orgFilters).map((org) => [org, 0]);
			if (!newSearchSettings?.originalTypeFilters?.length)
				newSearchSettings.originalTypeFilters = Object.keys(typeFilters).map((type) => [type, 0]);

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
		const { searchText } = state;
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

		const orgFilterText = !allOrgsSelected
			? Object.keys(_.pickBy(orgFilter, (value) => value)).join('_')
			: undefined;

		const typeFilterText = !allTypesSelected
			? Object.keys(_.pickBy(typeFilter, (value) => value)).join('_')
			: undefined;

		const searchFieldText = Object.keys(_.pickBy(searchFields, (value) => value.field))
			.map((key) => `${searchFields[key].field.display_name}-${searchFields[key].input}`)
			.join('_');

		const accessDateText =
			accessDateFilter && accessDateFilter[0] && accessDateFilter[1]
				? accessDateFilter.map((date) => date.getTime()).join('_')
				: undefined;

		const pubDateText =
			!publicationDateAllTime && publicationDateFilter && publicationDateFilter[0] && publicationDateFilter[1]
				? publicationDateFilter.map((date) => date.getTime()).join('_')
				: undefined;

		const categoriesText = state.selectedCategories
			? Object.keys(_.pickBy(state.selectedCategories, (value) => !!value)).join('_')
			: undefined;

		const currentParams = new URLSearchParams(
			window.location.hash.replace(`#/${state.cloneData.url.toLowerCase()}`, '')
		);

		const appendParams = (parameters, field, paramName) => {
			if (field) parameters.append(paramName, field);
		};
		const params = new URLSearchParams();
		appendParams(params, searchText, 'q');
		appendParams(params, searchType, 'searchType');
		appendParams(params, orgFilterText, 'orgFilter');
		appendParams(params, typeFilterText, 'typeFilter');
		appendParams(params, searchFieldText, 'searchFields');
		appendParams(params, accessDateText, 'accessDate');
		appendParams(params, pubDateText, 'pubDate');
		appendParams(params, includeRevoked, 'revoked');
		appendParams(params, currentParams.get('view'), 'view');
		if (categoriesText !== undefined) params.append('categories', categoriesText); // '' is different than undefined

		const linkString = `/#/${state.cloneData.url.toLowerCase()}?${params}`;

		window.history.pushState(null, document.title, linkString);
	},
};

export default PolicySearchHandler;
