import _ from 'lodash';

import { getTrackingNameForFactory, SEARCH_TYPES } from './gamechangerUtils';
import { trackEvent } from '../components/telemetry/Matomo';
import GameChangerAPI from '../components/api/gameChanger-service-api';
import GamechangerUserManagementAPI from '../components/api/GamechangerUserManagement';

const gameChangerAPI = new GameChangerAPI();
const gcUserManagementAPI = new GamechangerUserManagementAPI();

export const isDecoupled =
	window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' ||
	process.env.REACT_APP_GC_DECOUPLED === 'true';

// Sets the state using context
export const setState = (dispatch, newState) => {
	dispatch({
		type: 'SET_STATE',
		payload: {
			...newState,
		},
	});
};

// set one of the notification types for this user to 0 (not shown)
export const clearDashboardNotification = (cloneName, type, state, dispatch) => {
	let userData = state.userData;

	// only update if the notification exists and is non-zero
	if (userData.notifications && userData.notifications[cloneName] && userData.notifications[cloneName][type]) {
		/* await */ gameChangerAPI.clearDashboardNotification(cloneName, type);
		userData = _.cloneDeep(userData);
		userData.notifications[cloneName][type] = 0;
		setState(dispatch, { userData });
	}
};

export const handleSearchTypeUpdate = (
	{ value = SEARCH_TYPES.keyword },
	dispatch,
	state
) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.searchType = value;
	setState(dispatch, {
		searchSettings: newSearchSettings,
		metricsCounted: false,
	});
	trackEvent(
		getTrackingNameForFactory(state.cloneData.clone_name),
		'SearchTypeChanged',
		'value',
		value
	);
};

export const createCopyTinyUrl = (toolUrl, dispatch) => {
	let url = window.location.hash.toString();
	url = url.replace('#/', '');
	gameChangerAPI.shortenSearchURLPOST(url).then((res) => {
		try {
			// method for copying text to clipboard
			const element = document.createElement('textarea');
			element.value = `${window.location.origin}/#/${toolUrl}?tiny=${res.data.tinyURL}`;
			element.setAttribute('readonly', '');
			element.style = { position: 'absolute', left: '-9999px' };
			document.body.appendChild(element);
			element.select();
			document.execCommand('copy');
			document.body.removeChild(element);
			setState(dispatch, {
				showSnackbar: true,
				snackBarMsg: 'Link copied to clipboard',
			});
		} catch (err) {
			console.log(err);
		}
	});
};

export const handleSaveFavoriteSearch = async (
	favoriteName,
	favoriteSummary,
	favorite,
	dispatch,
	state
) => {
	const { searchText, count, cloneData } = state;
	const tinyUrl = await createTinyUrl(cloneData);
	const searchData = {
		search_name: favoriteName,
		search_summary: favoriteSummary,
		search_text: searchText,
		tiny_url: tinyUrl,
		document_count: count,
		is_favorite: favorite,
	};

	await gameChangerAPI.favoriteSearch(searchData);
	await getUserData(dispatch);
};

export const handleSaveFavoriteDocument = async (document, state, dispatch) => {
	const { rawSearchResults, cloneData } = state;

	if(!document.search_text) document.search_text = state.searchText;
	document.is_clone = true;
	document.clone_index = cloneData?.clone_data?.project_name;

	await gameChangerAPI.favoriteDocument(document);
	await getUserData(dispatch);

	const favFilenames = state.userData.favorite_documents.map((doc) => {
		return doc.filename;
	});

	const resultData = [];

	rawSearchResults.forEach((result) => {
		result.favorite = favFilenames.includes(result.filename);
		resultData.push(result);
	});
	setState(dispatch, { rawSearchResults: resultData });
};

export const handleSaveFavoriteTopic = async (
	topic,
	topicSummary,
	favorited,
	dispatch
) => {
	await gameChangerAPI.favoriteTopic({
		topic,
		topicSummary,
		is_favorite: favorited,
	});
	await getUserData(dispatch);
}

export const handleGenerateGroup = async ( group, state, dispatch ) => {
	const { cloneData } = state;
	const clone_index = cloneData?.clone_data?.project_name;
	const {group_type, group_name, group_description, create, group_ids} = group;

	await gameChangerAPI.favoriteGroup({group_type, group_name, group_description, create, clone_index, group_ids, is_clone: true});
	await getUserData(dispatch);
}

export const handleSaveFavoriteOrganization = async (organization, organizationSummary, favorited, dispatch) => {
	await gameChangerAPI.favoriteOrganization({organization, organizationSummary, is_favorite: favorited});
	await getUserData(dispatch);
};

export const handleRemoveFavoriteFromGroup = async (groupId, documentId, dispatch) => {
	await gameChangerAPI.deleteFavoriteFromGroupPOST({groupId, documentId});
	await getUserData(dispatch);
}

export const createTinyUrl = async (cloneData) => {
	let url = window.location.hash.toString();
	url = url.replace('#/', '');
	const res = await gameChangerAPI.shortenSearchURLPOST(url);

	return `${cloneData.url}?tiny=${res.data.tinyURL}`;
};

export const getUserData = async (dispatch) => {
	try {
		const { data } = await gcUserManagementAPI.getUserData();
		setState(dispatch, { userData: data });
	} catch (err) {
		console.log(err);
		console.log(err.message);
	}
};

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
		_.each(stringParts, (part) => {
			if (part.includes(':')) {
				const partSplits = part.split(':');
				const key = partSplits[0];
				const val = partSplits[1];
				if (key === 'tag') {
					tags.push(val);
				} else {
					properties.push({ key, value: val });
				}
			} else search += part + ' ';
		});
		return { search, properties, tags };
	} else {
		return {
			search: searchString,
			tags: undefined,
			properties: undefined,
		};
	}
};

// return true if they need to fill out the form
// open the form
// DECOUPLED ONLY
export const checkUserInfo = (state, dispatch) => {
	const { userData } = state;
	const userMatomoStatus = JSON.parse(localStorage.getItem('userMatomo'));
	const infoPassed = JSON.parse(localStorage.getItem('userInfoPassed'));
	const userFeedbackMode = JSON.parse(localStorage.getItem('userFeedbackMode'));
	let didPass = false;
	if (infoPassed && new Date(infoPassed.expires) > new Date()) {
		didPass = infoPassed.passed;
	}
	try {
		if (
			isDecoupled &&
			!userData?.submitted_info &&
			userMatomoStatus &&
			!didPass &&
			userFeedbackMode
		) {
			// show pop up
			setState(dispatch, { userInfoModalOpen: true });
			console.log('Decoupled user needs to fill out form');
			return true;
		}
	} catch (err) {
		console.log(err);
	}
	return false;
}

export const setCurrentTime = (dispatch) => {
	// const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	let currentTime = new Date();
	let currentMonth = currentTime.getMonth() + 1 < 10 ? `0${currentTime.getMonth() + 1}` : currentTime.getMonth() + 1;
	let currentDay = currentTime.getDate() < 10 ? `0${currentTime.getDate()}` : currentTime.getDate();

	// currentTime = `${months[currentTime.getMonth() - 1]} ${currentTime.getDate()}, ${currentTime.getHours()}:${currentTime.getMinutes()}`;
	currentTime = `${currentTime.getFullYear()}-${currentMonth}-${currentDay}-${currentTime.getHours()}-${currentTime.getSeconds()}-${currentTime.getMilliseconds()}`;
	
	setState(dispatch, { currentTime: currentTime });

	return currentTime;
}

export const sendJiraFeedback = (data) => {
	return gameChangerAPI.sendJiraFeedback(data);
}