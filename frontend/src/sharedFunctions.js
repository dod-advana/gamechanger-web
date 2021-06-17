import {getTrackingNameForFactory, RESULTS_PER_PAGE, SEARCH_TYPES} from "./gamechangerUtils";
import {trackEvent} from "./components/telemetry/Matomo";
import GameChangerAPI from "./components/api/gameChanger-service-api";
import GamechangerUserManagementAPI from "./components/api/GamechangerUserManagement";

const _ = require('lodash');

const gameChangerAPI = new GameChangerAPI();
const gcUserManagementAPI = new GamechangerUserManagementAPI();

export const isDecoupled = window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' || process.env.REACT_APP_GC_DECOUPLED === 'true';

// Sets the state using context
export const setState = (dispatch, newState) => {
	dispatch(
		{
			type: 'SET_STATE',
			payload: {
				...newState
			}
		}
	);
}

// set one of the notification types for this user to 0 (not shown)
export const clearDashboardNotification = (type, state, dispatch) => {
	gameChangerAPI.clearDashboardNotification(type);
	const userData = Object.assign({}, state.userData);

	if (userData.notifications) {
		userData.notifications[type] = 0;
	}
	else {
		userData.notifications = {
			total: 0,
			favorites: 0,
			history: 0
		}
	}
	setState(dispatch, {userData});
}

export const handleSearchTypeUpdate = ({ value = SEARCH_TYPES.keyword }, dispatch, state) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.searchType = value;
	setState(dispatch, {searchSettings: newSearchSettings, metricsCounted: false});
	trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'SearchTypeChanged', 'value', value);
}

export const createCopyTinyUrl = (toolUrl, dispatch) => {
	let url = window.location.hash.toString();
	url = url.replace("#/", "");
	gameChangerAPI.shortenSearchURLPOST(url).then(res => {
		try {
			// method for copying text to clipboard
			const element = document.createElement('textarea');
			element.value = `${window.location.origin}/#/${toolUrl}?tiny=${res.data.tinyURL}`;
			element.setAttribute('readonly', '');
			element.style = {position: 'absolute', left: '-9999px'};
			document.body.appendChild(element);
			element.select();
			document.execCommand('copy');
			document.body.removeChild(element);
			setState(dispatch, {showSnackbar: true, snackBarMsg: 'Link copied to clipboard'});
		} catch(err) {
			console.log(err);
		}
	});
}

export const handleSaveFavoriteSearch = async (favoriteName, favoriteSummary, favorite, dispatch, state) => {
	const { searchText, count, cloneData } = state;
	const tinyUrl = await createTinyUrl(cloneData);
	const searchData = {
		search_name: favoriteName,
		search_summary: favoriteSummary,
		search_text: searchText,
		tiny_url: tinyUrl,
		document_count: count,
		is_favorite: favorite
	};

	await gameChangerAPI.favoriteSearch(searchData);
	await getUserData(dispatch);
}

export const handleSaveFavoriteDocument = async (document, state, dispatch) => {
	const { rawSearchResults, cloneData } = state;

	document.search_text = state.searchText;
	document.is_clone = true;
	document.clone_index = cloneData?.clone_data?.project_name;

	await gameChangerAPI.favoriteDocument(document);

	await getUserData(dispatch);

	const favFilenames = state.userData.favorite_documents.map(doc => {
		return doc.filename;
	});

	const resultData = [];

	rawSearchResults.forEach(result => {
		result.favorite = favFilenames.includes(result.filename);
		resultData.push(result);
	});
	setState(dispatch, {rawSearchResults: resultData});
}

export const handleSaveFavoriteTopic = async (topic, topicSummary, favorited, dispatch) => {
	await gameChangerAPI.favoriteTopic({topic, topicSummary, is_favorite: favorited});
	await getUserData(dispatch);
}

export const createTinyUrl = async (cloneData) => {
	let url = window.location.hash.toString();
	url = url.replace("#/", "");
	const res = await gameChangerAPI.shortenSearchURLPOST(url);

	return `${cloneData.url}?tiny=${res.data.tinyURL}`;
}

export const getUserData = async (dispatch) => {
	try {
		const { data } = await gcUserManagementAPI.getUserData();
		setState(dispatch, {userData: data});
	} catch(err) {
		console.log(err);
		console.log(err.message);
	}
}

export const getSearchObjectFromString = (searchString = '') => {
	//this search string in the input field on front end...
	// tmp tag:foo tag:bar prop1:val1 prop2:val2
	// ... would yield these request params
	// {"text": "tmp", "tags": ["foo", "bar"], "properties": [{ "key": "prop1", "value": "val1" }, { "key": "prop2", "value": "val2" },] }
	if (searchString.includes(':')) {
		const stringParts = searchString.split(' ');
		let search = '';
		let properties = [];
		let tags = [];
		_.each(stringParts, part => {
			if (part.includes(':')) {
				const partSplits = part.split(':');
				const key = partSplits[0];
				const val = partSplits[1];
				if (key === 'tag') {
					tags.push(val);
				}
				else {
					properties.push({ key, value: val });
				}
			}
			else search += part + ' ';
		});
		return { search, properties, tags };
	}
	else {
		return {
			search: searchString,
			tags: undefined,
			properties: undefined
		}
	}
}

export const setSearchURL = (state, searchSettings) => {
	const { searchText,  resultsPage, tabName} = state;
	const {searchType, orgFilter, searchFields, accessDateFilter, publicationDateFilter, publicationDateAllTime, allOrgsSelected, includeRevoked} = searchSettings;
	const offset = ((resultsPage - 1) * RESULTS_PER_PAGE);
	let orgFilterText = 'ALLORGS';
	if(!allOrgsSelected) {
		orgFilterText = Object.keys(_.pickBy(orgFilter, (value, key) => value)).join('_');
	}
	const searchFieldText = Object.keys(_.pickBy(searchFields, (value, key) => value.field)).map(key => `${searchFields[key].field.display_name}-${searchFields[key].input}`).join('_');
	const accessDateText = (accessDateFilter && accessDateFilter[0] && accessDateFilter[1]) ? accessDateFilter.map(date => date.getTime()).join('_') : null;
	const publicationDateText = (publicationDateFilter && publicationDateFilter[0] && publicationDateFilter[1]) ? publicationDateFilter.map(date => date.getTime()).join('_') : null;
	const pubDateText = publicationDateAllTime ? 'ALL' : publicationDateText;

	const linkString = `/#/${state.cloneData.url.toLowerCase()}?q=${searchText}&offset=${offset}&searchType=${searchType}&tabName=${tabName}&orgFilter=${orgFilterText}&searchFields=${searchFieldText}&accessDate=${accessDateText}&pubDate=${pubDateText}&revoked=${includeRevoked}`;
	window.history.pushState(null, null, linkString);
}

// return true if they need to fill out the form
	// open the form
	// DECOUPLED ONLY
export const checkUserInfo = (state, dispatch) => {
	const { userData } = state;

	try {
		if (isDecoupled && userData && !userData.submitted_info) {
			// show pop up
			setState(dispatch, { userInfoModalOpen: true });
			console.log('Decoupled user needs to fill out form')
			return true;
		}
	} catch(err) {
		console.log(err);
	}
	return false;
}
