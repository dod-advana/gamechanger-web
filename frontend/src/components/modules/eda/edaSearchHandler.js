import _ from 'lodash';

import {
	getQueryVariable,
	getTrackingNameForFactory,
	NO_RESULTS_MESSAGE,
	PAGE_DISPLAYED,
	RECENT_SEARCH_LIMIT,
	RESULTS_PER_PAGE,
} from '../../../utils/gamechangerUtils';
import { removeChildrenFromListDF } from './edaUtils';
import { trackSearch } from '../../telemetry/Matomo';
import { createTinyUrl, getSearchObjectFromString, getUserData, setState } from '../../../utils/sharedFunctions';
import GameChangerAPI from '../../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();

const getAndSetDidYouMean = (index, searchText, dispatch) => {
	gameChangerAPI
		.getTextSuggestion({ index, searchText })
		.then(({ data }) => {
			setState(dispatch, { idYouMean: data?.autocorrect?.[0] });
		})
		.catch(() => {
			//do nothing
		});
};

const clearFavoriteSearchUpdate = async (search, dispatch) => {
	try {
		await gameChangerAPI.clearFavoriteSearchUpdate(search.tiny_url);
		getUserData(dispatch);
	} catch (err) {
		console.log(err);
	}
};

// set url, trim search text, determine search favorite, set recent searches
const setupSearchState = (state, dispatch, setSearchURL) => {
	const { searchText = '', userData, tabName, cloneData } = state;
	const favSearchUrls = userData?.favorite_searches?.map((search) => {
		return search.url;
	});

	let url = window.location.hash.toString();
	url = url.replace('#/', '');

	const searchFavorite = favSearchUrls?.includes(url) || false;

	const runGraphSearch = cloneData.show_graph && tabName === 'graphView';

	setSearchURL(state);

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
		expansionDict: {},
		isDataTracker: false,
		isCachedResult: false,
		pageDisplayed: PAGE_DISPLAYED.main,
		didYouMean: '',
		isFavoriteSearch: searchFavorite,
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
		runGraphSearch,
	});

	return { searchFavorite, url };
};

const checkForExpansionTerms = (expansionDict) => {
	if (expansionDict) {
		Object.keys(expansionDict).forEach((key) => {
			if (expansionDict[key].length > 0) return true;
		});
	}

	return false;
};

const checkSearchFavorites = (searchFavorite, userData, url, dispatch) => {
	let getUserDataFlag = true;

	if (searchFavorite) {
		userData.favorite_searches.forEach((search) => {
			if (search.url === url) {
				clearFavoriteSearchUpdate(search, dispatch);
				getUserDataFlag = false;
			}
		});
	}

	return getUserDataFlag;
};

const setURLParams = ({
	cloneData,
	searchText,
	offset,
	orgFilterText,
	issueOfficeDoDAACText,
	issueOfficeNameText,
	fiscalYearsText,
	contractDataText,
	minObligatedAmountText,
	maxObligatedAmountText,
	modTypeText,
	startDateText,
	endDateText,
	issueAgencyText,
}) => {
	const params = new URLSearchParams();

	if (searchText) params.append('q', searchText);
	if (offset) params.append('offset', String(offset));
	if (orgFilterText) params.append('orgFilter', orgFilterText);
	if (issueOfficeDoDAACText) params.append('dodaac', issueOfficeDoDAACText);
	if (issueOfficeNameText) params.append('officeName', issueOfficeNameText);
	if (fiscalYearsText) params.append('fiscalYears', fiscalYearsText);
	if (contractDataText) params.append('contractData', contractDataText);
	if (minObligatedAmountText) params.append('minAmount', minObligatedAmountText);
	if (maxObligatedAmountText) params.append('maxAmount', maxObligatedAmountText);
	if (modTypeText) params.append('modType', modTypeText);
	if (startDateText) params.append('startDate', startDateText);
	if (endDateText) params.append('endDate', endDateText);
	if (issueAgencyText) params.append('issueAgency', issueAgencyText);

	const linkString = `/#/${cloneData.url.toLowerCase()}?${params}`;

	window.history.pushState(null, document.title, linkString);
};

const getOrgMajcomFilters = (organizations, majcoms, allOrgsSelected) => {
	let orgFilterText =
		!allOrgsSelected && organizations && organizations.length > 0 ? organizations.join('_') : undefined;

	const majcomFilter =
		organizations && majcoms
			? _.pickBy(majcoms, (value, key) => value && value.length > 0 && organizations.indexOf(key) !== -1)
			: undefined;

	if (!allOrgsSelected && majcomFilter && Object.keys(majcomFilter).length > 0) {
		orgFilterText = '';
		for (const org of organizations) {
			let separator = Object.keys(majcomFilter).indexOf(org) !== 0 ? '|' : '';
			orgFilterText += `${separator}${org}${majcomFilter[org] ? ':' + majcomFilter[org].join('_') : ''}`;
		}
	}

	return { orgFilterText };
};

// parse the organizations or sub organizations out of the url param
const parseOrgs = (orgURL, newSearchSettings) => {
	const hasSubOrgs = orgURL.indexOf(':') !== -1;
	const orgs = orgURL.split('|');
	newSearchSettings.allOrgsSelected = false;

	// if no sub orgs, just take the main orgs
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
};

// parse the offset/result page number out of the url
const parseResultsPage = (offsetURL, parsed) => {
	const offset = parseInt(offsetURL);
	if (!isNaN(offset)) parsed.offset = offset;
	parsed.resultsPage = Math.floor(offset / RESULTS_PER_PAGE) + 1;
};

// parse the contract data type out of the url
const parseContractDataURL = (contractDataURL, newSearchSettings) => {
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
};

const EdaSearchHandler = {
	setSearchURL(state) {
		const { searchText, resultsPage, cloneData } = state;
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

		let { orgFilterText } = getOrgMajcomFilters(organizations, majcoms, allOrgsSelected);

		const issueOfficeDoDAACText =
			issueOfficeDoDAAC && issueOfficeDoDAAC.length > 0 ? issueOfficeDoDAAC.join('__') : undefined;
		const issueOfficeNameText =
			issueOfficeName && issueOfficeName.length > 0 ? issueOfficeName.join('__') : undefined;
		const fiscalYearsText =
			!allYearsSelected && fiscalYears && fiscalYears.length > 0 ? fiscalYears.join('_') : undefined;
		const contractDataText =
			!allDataSelected && contractData
				? Object.keys(_.pickBy(contractData, (value) => value)).join('_')
				: undefined;
		const minObligatedAmountText = minObligatedAmount ?? undefined;
		const maxObligatedAmountText = maxObligatedAmount ?? undefined;
		const modTypeText = contractsOrMods ?? undefined;
		const startDateText = startDate ?? undefined;
		const endDateText = endDate ?? undefined;
		const issueAgencyText = issueAgency ?? undefined;
		const offset = (resultsPage - 1) * RESULTS_PER_PAGE;

		setURLParams({
			cloneData,
			searchText,
			offset,
			orgFilterText,
			issueOfficeDoDAACText,
			issueOfficeNameText,
			fiscalYearsText,
			contractDataText,
			minObligatedAmountText,
			maxObligatedAmountText,
			modTypeText,
			startDateText,
			endDateText,
			issueAgencyText,
		});
	},

	async getPresearchData(state, dispatch) {
		const { cloneData } = state;
		if (!state.filterDataFetched) {
			const resp = await gameChangerAPI.callSearchFunction({
				functionName: 'getPresearchData',
				cloneName: cloneData.clone_name,
				options: {},
			});

			const newFilterData = {
				fiscalYear: resp.data.filters.fpds_date_signed_dt.reverse(),
				issueOfficeName: resp.data.filters.fpds_contracting_office_name,
				issueOfficeDoDAAC: resp.data.filters.fpds_contracting_office_code,
				vendorName: resp.data.filters.fpds_vendor_name,
				fundingOfficeDoDAAC: resp.data.filters.fpds_funding_office_code,
				fundingAgencyName: resp.data.filters.fpds_funding_agency_name,
				psc: resp.data.filters.fpds_psc,
				psc_hierarchy: resp.data.hierarchical_filters.psc.map((e) => {
					return { ...e, children: [] };
				}),
				naics: resp.data.filters.fpds_naics_code,
				naicsCode_hierarchy: resp.data.hierarchical_filters.naics.map((e) => {
					return { ...e, children: [] };
				}),
				duns: resp.data.filters.fpds_duns,
				modNumber: resp.data.filters.fpds_modification_number,
			};

			setState(dispatch, { filterDataFetched: true, edaFilterData: newFilterData });
		}
	},

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

		try {
			// set url, trim search text, determine search favorite, set recent searches
			const { searchFavorite, url } = setupSearchState(state, dispatch, this.setSearchURL);

			const combinedSearch = 'false';
			const offset = (resultsPage - 1) * RESULTS_PER_PAGE;
			const charsPadding = listView ? 750 : 90;
			const tiny_url = await createTinyUrl(cloneData);
			const t0 = new Date().getTime();
			const searchObject = getSearchObjectFromString(searchText);

			let searchResults = [];

			// regular search
			let resp = {};
			let minimizedEdaSearchSettings = { ...edaSearchSettings };
			const naicsCode = [...minimizedEdaSearchSettings.naicsCode];
			const psc = [...minimizedEdaSearchSettings.psc];

			if (naicsCode && naicsCode.length > 0) {
				// tidy up parent/child stuff
				const rootOptions = naicsCode.filter((e) => !e.parent);
				if (rootOptions.length > 0) {
					rootOptions.forEach((root) => {
						removeChildrenFromListDF(root, naicsCode);
					});
				}
				naicsCode
					.filter((e) => e.parent)
					.sort((a, b) => a.code < b.code)
					.forEach((node) => removeChildrenFromListDF(node, naicsCode));

				minimizedEdaSearchSettings.naicsCode = naicsCode;
			}
			if (psc && psc.length > 0) {
				// tidy up parent/child stuff
				const rootOptions = psc.filter((e) => !e.parent);
				if (rootOptions.length > 0) {
					rootOptions.forEach((root) => {
						removeChildrenFromListDF(root, psc);
					});
				}
				psc.filter((e) => e.parent)
					.sort((a, b) => a.code < b.code)
					.forEach((node) => removeChildrenFromListDF(node, psc));

				minimizedEdaSearchSettings.psc = psc;
			}
			try {
				resp = await gameChangerAPI.modularSearch({
					cloneName: cloneData.clone_name,
					searchText: searchObject.search,
					offset,
					options: {
						charsPadding,
						showTutorial,
						tiny_url,
						combinedSearch,
						edaSearchSettings: minimizedEdaSearchSettings,
					},
				});

				const t1 = new Date().getTime();

				let getUserDataFlag = true;

				if (_.isObject(resp.data)) {
					let {
						docs,
						totalCount,
						expansionDict,
						isCached,
						timeSinceCache,
						issuingOrgs,
						totalObligatedAmount,
					} = resp.data;

					setState(dispatch, {
						issuingOrgs: this.countOrgData(issuingOrgs),
						statsLoading: false,
						totalObligatedAmount,
					});

					if (Array.isArray(docs)) {
						// intelligent search failed, show keyword results with warning alert
						let transformFailed = resp.data.transformFailed || false;

						searchResults = searchResults.concat(docs);

						// if this search is a favorite, turn off notifications of new results
						getUserDataFlag = checkSearchFavorites(searchFavorite, userData, url, dispatch);

						let hasExpansionTerms = checkForExpansionTerms(expansionDict);

						setState(dispatch, {
							timeFound: ((t1 - t0) / 1000).toFixed(2),
							prevSearchText: searchText,
							loading: false,
							count: totalCount,
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
							runningSearch: false,
							transformFailed,
						});
					} else {
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

					if (!offset) {
						trackSearch(
							searchText,
							`${getTrackingNameForFactory(cloneData.clone_name)}${combinedSearch ? '_combined' : ''}`,
							totalCount,
							false
						);
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
			} catch (err) {
				console.log(err);
				throw err;
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

	countOrgData(data) {
		try {
			const issuingOrgs = {
				'Air Force': {
					count: 0,
					obligatedAmount: 0,
				},
				Army: {
					count: 0,
					obligatedAmount: 0,
				},
				DOD: {
					count: 0,
					obligatedAmount: 0,
				},
				Navy: {
					count: 0,
					obligatedAmount: 0,
				},
				DLA: {
					count: 0,
					obligatedAmount: 0,
				},
				ODA: {
					count: 0,
					obligatedAmount: 0,
				},
			};

			const orgNames = {
				'DEPT OF THE AIR FORCE': 'Air Force',
				'DEPT OF THE ARMY': 'Army',
				'DEPARTMENT OF DEFENSE': 'DOD',
				'DEPT OF THE NAVY': 'Navy',
				'DEFENSE LOGISTICS AGENCY': 'DLA',
			};

			data?.forEach((org) => {
				const orgName = orgNames[org.key.toUpperCase()] ? orgNames[org.key.toUpperCase()] : 'ODA';
				issuingOrgs[orgName].count += org.count;
				issuingOrgs[orgName].obligatedAmount += org.value;
			});

			for (const org of Object.keys(issuingOrgs)) {
				if (issuingOrgs[org].count === 0) {
					delete issuingOrgs[org];
				} else {
					issuingOrgs[org].obligatedAmount = Math.floor(issuingOrgs[org].obligatedAmount);
				}
			}

			return issuingOrgs;
		} catch (err) {
			console.log('Error calculating EDA org data');
			console.log(err);
			return {};
		}
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

		const isNullish = (param) => !param || param === 'null' || param === 'undefined';

		if (searchText) {
			parsed.searchText = searchText;
		}

		if (!isNullish(offsetURL)) {
			parseResultsPage(offsetURL, parsed);
		}

		if (!isNullish(orgURL)) {
			parseOrgs(orgURL, newSearchSettings);
		}

		if (!isNullish(dodaacURL)) {
			newSearchSettings.issueOfficeDoDAAC = dodaacURL.split('__');
		}

		if (!isNullish(officeNameURL)) {
			newSearchSettings.issueOfficeName = officeNameURL.split('__');
		}

		if (!isNullish(fiscalYearsURL)) {
			newSearchSettings.allYearsSelected = false;
			newSearchSettings.fiscalYears = fiscalYearsURL.split('_');
		}

		if (!isNullish(contractDataURL)) {
			parseContractDataURL(contractDataURL, newSearchSettings);
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

		parsed.edaSearchSettings = _.defaults(newSearchSettings, _.cloneDeep(defaultState.edaSearchSettings));

		return parsed;
	},
};

export default EdaSearchHandler;
