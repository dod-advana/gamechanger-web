import _ from 'lodash';

import {
	getQueryVariable,
	getTrackingNameForFactory,
	NO_RESULTS_MESSAGE,
	RECENT_SEARCH_LIMIT,
	RESULTS_PER_PAGE,
} from '../../../utils/gamechangerUtils';
import { trackSearch } from '../../telemetry/Matomo';
import {
	createTinyUrl,
	getSearchObjectFromString,
	getUserData,
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

const BudgetSearchSearchHandler = {
	async handleSearch(state, dispatch) {
		setState(dispatch, { runSearch: false });

		const {
			searchText = '',
			resultsPage,
			listView,
			showTutorial,
			searchSettings,
			tabName,
			cloneData,
			runGetData,
		} = state;

		if (runGetData) {
			setState(dispatch, { loading: true });
			const mainData = await gameChangerAPI.callSearchFunction({
				functionName: 'getMainPageData',
				cloneName: state.cloneData.clone_name,
				options: {
					resultsPage,
				},
			});
			setState(dispatch, {
				mainPageData: mainData.data,
				runGetData: false,
				loading: false,
			});
			return;
		}

		this.setSearchURL(state);

		// let url = window.location.hash.toString();
		// url = url.replace("#/", "");

		setState(dispatch, {
			runningSearch: true,
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

		setState(dispatch, {
			loading: true,
			noResultsMessage: null,
			count: 0,
			timeFound: 0.0,
			iframePreviewLink: null,
			runningSearch: true,
		});

		const offset = (resultsPage - 1) * RESULTS_PER_PAGE;

		const charsPadding = listView ? 750 : 90;

		const tiny_url = await createTinyUrl(cloneData);

		try {
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
					},
				})
				.then((resp) => {
					const t1 = new Date().getTime();

					let getUserDataFlag = true;

					if (_.isObject(resp.data)) {
						let { docs, totalCount } = resp.data;

						if (docs && Array.isArray(docs)) {
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
								loadingTinyUrl: false,
								query: resp.data.query,
								mainPageData: resp.data,
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
								runningSearch: false,
								prevSearchText: searchText,
								loadingTinyUrl: false,
								mainPageData: {},
							});
						}
					} else {
						setState(dispatch, {
							prevSearchText: null,
							loading: false,
							noResultsMessage: NO_RESULTS_MESSAGE,
							runningSearch: false,
							loadingTinyUrl: false,
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
		} catch (e) {
			console.log(e);
			setState(dispatch, {
				prevSearchText: null,
				unauthorizedError: true,
				loading: false,
				autocompleteItems: [],
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

		parsed.edaSearchSettings = _.defaults(
			newSearchSettings,
			_.cloneDeep(defaultState.edaSearchSettings)
		);

		return parsed;
	},

	setSearchURL(state) {
		const { searchText, resultsPage } = state;

		const offset = (resultsPage - 1) * RESULTS_PER_PAGE;

		const params = new URLSearchParams();

		if (searchText) params.append('q', searchText);
		if (offset) params.append('offset', String(offset));

		const linkString = `/#/${state.cloneData.url.toLowerCase()}?${params}`;

		window.history.pushState(null, document.title, linkString);
	},

	getPresearchData(state) {},
};

export default BudgetSearchSearchHandler;
