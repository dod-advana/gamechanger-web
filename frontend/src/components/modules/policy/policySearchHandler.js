import {
	getOrgToOrgQuery,
	getTrackingNameForFactory, getTypeQuery,
	NO_RESULTS_MESSAGE,
	numberWithCommas,
	PAGE_DISPLAYED,
	RECENT_SEARCH_LIMIT,
	RESULTS_PER_PAGE,
	SEARCH_TYPES
} from "../../../gamechangerUtils";
import {trackSearch} from "../../telemetry/Matomo";
import {
	checkUserInfo,
	createTinyUrl,
	getSearchObjectFromString, getUserData, isDecoupled,
	setState
} from "../../../sharedFunctions";
import GameChangerAPI from "../../api/gameChanger-service-api";
const _ = require('lodash');

const gameChangerAPI = new GameChangerAPI();

const getAndSetDidYouMean = (index, searchText, dispatch) => {
	gameChangerAPI.getTextSuggestion({ index, searchText }).then(({ data }) => {
		setState(dispatch, {didYouMean: data?.autocorrect?.[0]});
	}).catch(_ => {
		//do nothing
	})
}

const clearFavoriteSearchUpdate = async (search, index, dispatch) => {
	try {
		await gameChangerAPI.clearFavoriteSearchUpdate(search.tiny_url);
		getUserData(dispatch);
	} catch (err) {
		console.log(err);
	}
}

const setSearchURL = (state, searchSettings) => {
	const { searchText,  resultsPage, currentViewName} = state;
	const {searchType, orgFilter, typeFilter, searchFields, accessDateFilter, publicationDateFilter, publicationDateAllTime, allOrgsSelected, allTypesSelected, includeRevoked} = searchSettings;
	const offset = ((resultsPage - 1) * RESULTS_PER_PAGE);
	let orgFilterText = 'ALLORGS';
	if(!allOrgsSelected) {
		orgFilterText = Object.keys(_.pickBy(orgFilter, (value, key) => value)).join('_');
	}
	let typeFilterText = 'ALLTYPES';
		if(!allTypesSelected) {
			typeFilterText = Object.keys(_.pickBy(typeFilter, (value, key) => value)).join('_');
		}
	const searchFieldText = Object.keys(_.pickBy(searchFields, (value, key) => value.field)).map(key => `${searchFields[key].field.display_name}-${searchFields[key].input}`).join('_');
	const accessDateText = (accessDateFilter && accessDateFilter[0] && accessDateFilter[1]) ? accessDateFilter.map(date => date.getTime()).join('_') : null;
	const publicationDateText = (publicationDateFilter && publicationDateFilter[0] && publicationDateFilter[1]) ? publicationDateFilter.map(date => date.getTime()).join('_') : null;
	const pubDateText = publicationDateAllTime ? 'ALL' : publicationDateText;

	const linkString = `/#/${state.cloneData.url.toLowerCase()}?q=${searchText}&offset=${offset}&searchType=${searchType}&viewName=${currentViewName}&orgFilter=${orgFilterText}&typeFilter=${typeFilterText}&searchFields=${searchFieldText}&accessDate=${accessDateText}&pubDate=${pubDateText}&revoked=${includeRevoked}`;
	window.history.pushState(null, null, linkString);
}

const PolicySearchHandler = {
	handleSearch: async (state, dispatch) => {
		setState(dispatch, {runSearch: false});
		
		const {
			searchText = "",
			resultsPage,
			listView,
			showTutorial,
			userData,
			searchSettings,
			currentViewName,
			cloneData
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
			verbatimSearch
		} = searchSettings;
		
		if (isDecoupled && userData && userData.search_history && userData.search_history.length > 9 && !showTutorial) {
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
			didYouMean: '',
			trending: ''
		});
		
		const trimmed = searchText.trim();
		if (_.isEmpty(trimmed)) return;
		
		const searchObject = getSearchObjectFromString(searchText);
		const recentSearches = localStorage.getItem(`recent${cloneData.clone_name}Searches`) || '[]';
		const recentSearchesParsed = JSON.parse(recentSearches);
		const orgFilterString = getOrgToOrgQuery(allOrgsSelected, orgFilter);
		const typeFilterString = getTypeQuery(allTypesSelected, typeFilter);
		
		// Save search settings to postgres
		gameChangerAPI.setUserSearchSettings({searchSettings});
	
		if (!recentSearchesParsed.includes(searchText)) {
			recentSearchesParsed.unshift(searchText);
			if (recentSearchesParsed.length === RECENT_SEARCH_LIMIT) recentSearchesParsed.pop();
			localStorage.setItem(`recent${cloneData.clone_name}Searches`, JSON.stringify(recentSearchesParsed));
		}
		
		const t0 = new Date().getTime();
	
		let searchResults = [];
	
		const transformResults = searchType === SEARCH_TYPES.contextual;
		
		setState(dispatch, {
			selectedDocuments: new Map(),
			loading: true,
			metricsLoading: true,
			noResultsMessage: null,
			autocompleteItems: [],
			rawSearchResults: [],
			docSearchResults: [],
			topicSearchResults: [],
			entitySearchResults: [],
			categoryMetadata: {},
			qaResults: {question: '', answers: [], filenames: [], docIds: []},
			searchResultsCount: 0,
			count: 0,
			entityCount: 0,
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
	
		let modifiedOrgFilter = allOrgsSelected ? {} : orgFilter;
		let modifiedTypeFilter = allTypesSelected ? {} : typeFilter;
		
		try {
			
			if (cloneData.show_graph && currentViewName === 'Graph') {
				setState(dispatch, {runGraphSearch: true});
			}
			
			gameChangerAPI.getDataForSearch({
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
				cloneName: cloneData.clone_name
			}).then(resp => {
				setState(dispatch, {
					entitiesForSearch: resp.data.entities,
					runningEntitySearch: false,
					topicsForSearch: resp.data.topics,
					runningTopicSearch: false
				});
			}).catch(err => {
				console.log(err);
				setState(dispatch, {
					entitiesForSearch: [],
					runningEntitySearch: false,
					topicsForSearch: [],
					runningTopicSearch: false
				});
			});
			
			let combinedSearch = await gameChangerAPI.getCombinedSearchMode();
			combinedSearch = combinedSearch.data.value === 'true';
	
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
					limit: 6,
					verbatimSearch
				},
			});
			
			const t1 = new Date().getTime();
			
			let getUserDataFlag = true;
	
			if (_.isObject(resp.data)) {
				let { doc_types, doc_orgs, docs, entities, topics, totalCount, totalEntities, totalTopics, expansionDict, isCached, timeSinceCache, query, qaResults } = resp.data;

				const categoryMetadata = 
				{
					Documents: {total: totalCount},
					Organizations: {total: totalEntities},
					Topics: {total: totalTopics},
				};
	
				if (entities && Array.isArray(entities)) {
					// if entity, add wiki description
					entities.forEach(async (obj, i) => {
						if(obj && obj.type === 'organization'){
							const descriptionAPI = await gameChangerAPI.getDescriptionFromWikipedia(obj.name);
							let description = descriptionAPI.query;
							if(description.pages){
								entities[i].description = description.pages[Object.keys(description.pages)[0]].extract
							}					
						}
					});

					// intelligent search failed, show keyword results with warning alert
					if (resp.data.transformFailed) {
						setState(dispatch, {transformFailed: true});
					}
	
					searchResults = searchResults.concat(docs);
	
					const favFilenames = userData.favorite_documents.map(document => {
						return document.filename;
					});
	
					searchResults.forEach(result => {
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
						Object.keys(expansionDict).forEach(key => {
							if (expansionDict[key].length > 0) hasExpansionTerms = true;
						})
					}
	
					if (doc_types && doc_orgs) {
						// get doc types (memorandum, issuance, etc.). also get top org.
						let orgCountMap = new Map();
						let docTypeMap = new Map();
	
						doc_types.forEach(element => {
							var docTypeName = element.key;
							if (docTypeName.slice(-1) !== 's') {
								docTypeName = docTypeName + 's';
							}
	
							docTypeMap[docTypeName] = docTypeMap[docTypeName] ? docTypeMap[docTypeName] + element.doc_count : element.doc_count;
	
							// const { docOrg } = getDocTypeStyles(element.key);
							// let docName = getTypeDisplay(docOrg);
	
							// if (docName === "" || docName === " ") {
							// 	docName = "Uncategorized ";
							// }
							
							// orgCountMap[docName] = orgCountMap[docName] ? orgCountMap[docName] + element.doc_count : element.doc_count;
						});
						
						doc_orgs.forEach(element => {
							orgCountMap[element.key] = orgCountMap[element.key] ? orgCountMap[element.key] + element.doc_count : element.doc_count;
						});
	
						var typeData = [];
						for (var key in docTypeMap) {
							typeData.push({
								name: key,
								value: docTypeMap[key]
							});
							}
							
						let sortedTypes = typeData.sort(function(a, b) {
						return (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0)
						});
	
						let sidebarTypes = [];
						for (let elt in sortedTypes) {
							sidebarTypes.push([sortedTypes[elt].name, numberWithCommas(sortedTypes[elt].value)]);
						}
	
						let orgData = [];
						for (let key in orgCountMap) {
							orgData.push({
								name: key,
								value: orgCountMap[key]
							});
						}
						
						let sortedOrgs = orgData.sort(function(a, b) {
						return (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0)
						});
						
						let orgFilter = searchSettings.orgFilter;
						if(sortedOrgs && sortedOrgs.length) {
							orgFilter = {};
							sortedOrgs.forEach((o) => {
								orgFilter[o.name] = !allOrgsSelected;
							});
						}
						
						let typeFilter = searchSettings.typeFilter;
						if(sortedTypes && sortedTypes.length) {
							typeFilter = {};
							sortedTypes.forEach((t) => {
								typeFilter[t.name] = !allTypesSelected;
							});
						}
						
						searchSettings.orgFilter = orgFilter;
						searchSettings.typeFilter = typeFilter;
	
						let sidebarOrgData = [];
						for (let elt2 in sortedOrgs) {
							sidebarOrgData.push([sortedOrgs[elt2].name, numberWithCommas(sortedOrgs[elt2].value)]);
						}
						
						setState(dispatch, {
							sidebarDocTypes: sidebarTypes,
							sidebarOrgs: sidebarOrgData,
							searchSettings
						});
					}
					
					if (!offset) {
						trackSearch(
							searchText,
							`${getTrackingNameForFactory(cloneData.clone_name)}${combinedSearch ? '_combined' : ''}`,
							totalCount,
							false
						);
					}
	
					setState(dispatch, {
						activeCategoryTab: (entities.length === 0 && topics.length === 0) ? 'Documents' : 'all',
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
						query
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
						qaResults: {question: '', answers: [], filenames: [], docIds: []},
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
					hasExpansionTerms: false
				});
			}
	
			setSearchURL({searchText, resultsPage, currentViewName, cloneData}, searchSettings);
	
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
		
		const index = cloneData.clone_name;
		getAndSetDidYouMean(index, searchText, dispatch);
	},

	handleDocPagination: async (state, dispatch, replaceResults) => {
		const {
			activeCategoryTab,
			docSearchResults,
			infiniteScrollPage,
			searchText = "",
			resultsPage,
			listView,
			showTutorial,
			searchSettings,
			cloneData,
			currentSort,
			currentOrder
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
			verbatimSearch,
		} = searchSettings;

		const offset = (((activeCategoryTab === 'all' ? resultsPage : infiniteScrollPage) - 1) * RESULTS_PER_PAGE);
		const orgFilterString = getOrgToOrgQuery(allOrgsSelected, orgFilter);
		const typeFilterString = getTypeQuery(allTypesSelected, typeFilter);
		const transformResults = searchType === SEARCH_TYPES.contextual;
		const charsPadding = listView ? 750 : 90;
		let modifiedOrgFilter = allOrgsSelected ? {} : orgFilter;
		let modifiedTypeFilter = allTypesSelected ? {} : typeFilter;
		const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));
		const limit = (activeCategoryTab === 'all' || infiniteScrollPage === 1) ? 6 : 18;

		const resp = await gameChangerAPI.callSearchFunction( 
			{
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
					verbatimSearch
				},
			});

			if(resp.data){
				if(replaceResults) {
					setState(dispatch, {
						docSearchResults: resp.data.docs,
						docsLoading: false,
						docsPagination: false
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
	

		handleEntityPagination: async (state, dispatch) => {
			setState(dispatch, {
				entityPagination: false,
			});
			const {
				searchText = "",
				entityPage,
				cloneData
			} = state;
			const offset = ((entityPage - 1) * RESULTS_PER_PAGE);
			const resp = await gameChangerAPI.callSearchFunction( 
				{
					functionName: 'entityPagination',
					cloneName: cloneData.clone_name,
					options: {
						searchText,
						offset,
						limit: 6,
					},
				});
				if(resp.data){
					setState(dispatch, {
						entitySearchResults: resp.data.entities,
						entitiesLoading: false
					});
				}
		},

		handleTopicPagination: async(state, dispatch) => {
			setState(dispatch, {
				topicPagination: false,
			});
			const {
				searchText = "",
				entityPage,
				cloneData
			} = state;
			const offset = ((entityPage - 1) * RESULTS_PER_PAGE);
			const resp = await gameChangerAPI.callSearchFunction( 
				{
					functionName: 'topicPagination',
					cloneName: cloneData.clone_name,
					options: {
						searchText,
						offset,
						limit: 6,
					},
				});
				if(resp.data){
					setState(dispatch, {
						topicSearchResults: resp.data.entities,
						topicsLoading: false
					});
				}
		}
	
};

export default PolicySearchHandler;
