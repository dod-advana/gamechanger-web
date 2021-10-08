import _ from 'lodash';

import {
	getQueryVariable,
	getTrackingNameForFactory,
	NO_RESULTS_MESSAGE,
	PAGE_DISPLAYED,
	RECENT_SEARCH_LIMIT,
	RESULTS_PER_PAGE,
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

const EdaSearchHandler = {
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
			edaSearchSettings,
		} = state;

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
			statsLoading: true,
		});

		const offset = (resultsPage - 1) * RESULTS_PER_PAGE;

		const charsPadding = listView ? 750 : 90;

		const tiny_url = await createTinyUrl(cloneData);

		try {
			if (cloneData.show_graph && tabName === 'graphView') {
				setState(dispatch, { runGraphSearch: true });
			}

			const combinedSearch = 'false';

			// regular search
			gameChangerAPI
				.modularSearch({
					cloneName: cloneData.clone_name,
					searchText: searchObject.search,
					offset,
					options: {
						charsPadding,
						showTutorial,
						tiny_url,
						combinedSearch,
						edaSearchSettings,
					},
				})
				.then((resp) => {
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
								query: resp.data.query,
							});
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
				})
				.catch((err) => {
					console.log(err);
					throw err;
				});

			// stats search
			gameChangerAPI
				.modularSearch({
					cloneName: cloneData.clone_name,
					searchText: searchObject.search,
					offset,
					limit: 10000,
					options: {
						charsPadding,
						tiny_url,
						combinedSearch,
						edaSearchSettings,
						forStats: true,
					},
				})
				.then((resp) => {
					if (_.isObject(resp.data)) {
						const docs = resp.data.docs;
						const issuingOrgs = {
							'Air Force': 0,
							Army: 0,
							'Department of Defense': 0,
							Navy: 0,
						};

						const orgNames = {
							'DEPT OF THE AIR FORCE': 'Air Force',
							'DEPT OF THE ARMY': 'Army',
							'DEPARTMENT OF DEFENSE': 'Department of Defense',
							'DEPT OF THE NAVY': 'Navy',
						};

						let totalObligatedAmount = 0;
						for (const doc of docs) {
							const org = orgNames[doc.issuing_organization_eda_ext];
							if (org && issuingOrgs[org] !== undefined) {
								issuingOrgs[org] += 1;
							}

							if (
								doc.obligated_amounts_eda_ext &&
								!isNaN(doc.obligated_amounts_eda_ext)
							) {
								totalObligatedAmount += doc.obligated_amounts_eda_ext;
							}
						}

						setState(dispatch, {
							issuingOrgs,
							statsLoading: false,
							totalObligatedAmount,
						});
					}
				})
				.catch((err) => {
					console.log('error');
					console.log(err);
					throw err;
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

		const index = 'gamechanger';
		getAndSetDidYouMean(index, searchText, dispatch);
	},

	parseSearchURL(defaultState, url) {
		if (!url) url = window.location.href;

		const parsed = {};
		const newSearchSettings = {};

		const searchText = getQueryVariable('q', url);
		const offsetURL = getQueryVariable('offset', url);
		const orgURL = getQueryVariable('orgFilter', url);
		const dodaacURL = getQueryVariable('dodaac', url);
		const officeNameURL = getQueryVariable('officeName', url);
		const fiscalYearsURL = getQueryVariable('fiscalYears', url);
		const contractDataURL = getQueryVariable('contractData', url);
		const minAmountURL = getQueryVariable('minAmount', url);
		const maxAmountURL = getQueryVariable('maxAmount', url);
		const modTypeURL = getQueryVariable('modType', url);
		const startDateURL = getQueryVariable('startDate', url);
		const endDateURL = getQueryVariable('endDate', url);
		const issueAgencyURL = getQueryVariable('issueAgency', url);

		const isNullish = (param) =>
			!param || param === 'null' || param === 'undefined';

		if (searchText) {
			parsed.searchText = searchText;
		}

		if (!isNullish(offsetURL)) {
			const offset = parseInt(offsetURL);
			if (!isNaN(offset)) parsed.offset = offset;
			parsed.resultsPage = Math.floor(offset / RESULTS_PER_PAGE) + 1;
		}

		if (!isNullish(orgURL)) {
			const hasSubOrgs = orgURL.indexOf(':') !== -1;
			const orgs = orgURL.split('|');
			newSearchSettings.allOrgsSelected = false;
			if (!hasSubOrgs) {
				newSearchSettings.organizations = orgs[0].split('_');
			} else {
				const organizations = [];
				const majcoms = {
					'air force': [],
					army: [],
					defense: [],
					navy: [],
				};

				for (const org of orgs) {
					const orgWithSubOrgs = org.split(':');
					organizations.push(orgWithSubOrgs[0]);
					if (orgWithSubOrgs.length > 1) {
						const subOrgs = orgWithSubOrgs[1].split('_');
						for (const subOrg of subOrgs) {
							majcoms[orgWithSubOrgs[0]].push(subOrg);
						}
					}
				}
				newSearchSettings.organizations = organizations;
				newSearchSettings.majcoms = majcoms;
			}
		}

		if (!isNullish(dodaacURL)) {
			newSearchSettings.issueOfficeDoDAAC = dodaacURL;
		}

		if (!isNullish(officeNameURL)) {
			newSearchSettings.issueOfficeName = officeNameURL;
		}

		if (!isNullish(fiscalYearsURL)) {
			newSearchSettings.allYearsSelected = false;
			newSearchSettings.fiscalYears = fiscalYearsURL.split('_');
		}

		if (!isNullish(contractDataURL)) {
			newSearchSettings.allDataSelected = false;
			const dataSources = contractDataURL.split('_');
			const contractData = {
				pds: false,
				syn: false,
				none: false,
			};
			for (const source of dataSources) {
				contractData[source] = true;
			}

			newSearchSettings.contractData = contractData;
		}

		if (!isNullish(minAmountURL)) {
			newSearchSettings.minObligatedAmount = minAmountURL;
		}

		if (!isNullish(maxAmountURL)) {
			newSearchSettings.maxObligatedAmount = maxAmountURL;
		}

		if (!isNullish(modTypeURL)) {
			newSearchSettings.contractsOrMods = modTypeURL;
		}

		if (!isNullish(startDateURL)) {
			newSearchSettings.startDate = startDateURL;
		}

		if (!isNullish(endDateURL)) {
			newSearchSettings.endDate = endDateURL;
		}

		if (!isNullish(issueAgencyURL)) {
			newSearchSettings.issueAgency = issueAgencyURL;
		}

		parsed.edaSearchSettings = _.defaults(
			newSearchSettings,
			_.cloneDeep(defaultState.edaSearchSettings)
		);

		return parsed;
	},

	setSearchURL(state) {
		const { searchText, resultsPage } = state;
		const {
			allOrgsSelected,
			organizations,
			startDate,
			endDate,
			issueAgency,
			issueOfficeDoDAAC,
			issueOfficeName,
			allYearsSelected,
			fiscalYears,
			allDataSelected,
			contractData,
			minObligatedAmount,
			maxObligatedAmount,
			contractsOrMods,
			majcoms,
		} = state.edaSearchSettings;

		let orgFilterText = undefined;
		const majcomFilter =
			organizations && majcoms
				? _.pickBy(
					majcoms,
					(value, key) =>
						value && value.length > 0 && organizations.indexOf(key) !== -1
				  )
				: undefined;
		if (
			!allOrgsSelected &&
			majcomFilter &&
			Object.keys(majcomFilter).length > 0
		) {
			orgFilterText = '';
			for (const org of organizations) {
				let separator = Object.keys(majcomFilter).indexOf(org) !== 0 ? '|' : '';
				orgFilterText += `${separator}${org}${
					majcomFilter[org] ? ':' + majcomFilter[org].join('_') : ''
				}`;
			}
		} else {
			orgFilterText =
				!allOrgsSelected && organizations && organizations.length > 0
					? organizations.join('_')
					: undefined;
		}
		const issueOfficeDoDAACText = issueOfficeDoDAAC ?? undefined;
		const issueOfficeNameText = issueOfficeName ?? undefined;
		const fiscalYearsText =
			!allYearsSelected && fiscalYears && fiscalYears.length > 0
				? fiscalYears.join('_')
				: undefined;
		const contractDataText =
			!allDataSelected && contractData
				? Object.keys(_.pickBy(contractData, (value, key) => value)).join('_')
				: undefined;
		const minObligatedAmountText = minObligatedAmount ?? undefined;
		const maxObligatedAmountText = maxObligatedAmount ?? undefined;
		const modTypeText = contractsOrMods ?? undefined;
		const startDateText = startDate ?? undefined;
		const endDateText = endDate ?? undefined;
		const issueAgencyText = issueAgency ?? undefined;
		const offset = (resultsPage - 1) * RESULTS_PER_PAGE;

		const params = new URLSearchParams();

		if (searchText) params.append('q', searchText);
		if (offset) params.append('offset', String(offset));
		if (orgFilterText) params.append('orgFilter', orgFilterText);
		if (issueOfficeDoDAACText) params.append('dodaac', issueOfficeDoDAACText);
		if (issueOfficeNameText) params.append('officeName', issueOfficeNameText);
		if (fiscalYearsText) params.append('fiscalYears', fiscalYearsText);
		if (contractDataText) params.append('contractData', contractDataText);
		if (minObligatedAmountText)
			params.append('minAmount', minObligatedAmountText);
		if (maxObligatedAmountText)
			params.append('maxAmount', maxObligatedAmountText);
		if (modTypeText) params.append('modType', modTypeText);
		if (startDateText) params.append('startDate', startDateText);
		if (endDateText) params.append('endDate', endDateText);
		if (issueAgencyText) params.append('issueAgency', issueAgencyText);

		const linkString = `/#/${state.cloneData.url.toLowerCase()}?${params}`;

		window.history.pushState(null, document.title, linkString);
	},

	getPresearchData(state) {},
};

export default EdaSearchHandler;
