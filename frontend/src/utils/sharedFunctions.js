import _ from 'lodash';

import { getTrackingNameForFactory, PAGE_DISPLAYED, SEARCH_TYPES } from './gamechangerUtils';
import { trackEvent } from '../components/telemetry/Matomo';
import GameChangerAPI from '../components/api/gameChanger-service-api';
import GamechangerUserManagementAPI from '../components/api/GamechangerUserManagement';
import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const gameChangerAPI = new GameChangerAPI();
const gcUserManagementAPI = new GamechangerUserManagementAPI();

export const isDecoupled =
	window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' || process.env.REACT_APP_GC_DECOUPLED === 'true';

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
	if (
		userData &&
		userData.notifications &&
		userData.notifications[cloneName] &&
		userData.notifications[cloneName][type]
	) {
		/* await */ gameChangerAPI.clearDashboardNotification(cloneName, type);
		userData = _.cloneDeep(userData);
		userData.notifications[cloneName][type] = 0;
		setState(dispatch, { userData });
	}
};

export const handleSearchTypeUpdate = ({ value = SEARCH_TYPES.keyword }, dispatch, state) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.searchType = value;
	setState(dispatch, {
		searchSettings: newSearchSettings,
		metricsCounted: false,
	});
	trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'SearchTypeChanged', 'value', value);
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

export const handleSaveFavoriteSearch = async (favoriteName, favoriteSummary, favorite, dispatch, state) => {
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

	if (!document.search_text) document.search_text = state.searchText;
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

export const handleSaveFavoriteTopic = async (topic, topicSummary, favorited, dispatch) => {
	await gameChangerAPI.favoriteTopic({
		topic,
		topicSummary,
		is_favorite: favorited,
	});
	await getUserData(dispatch);
};

export const handleDeleteFavoriteSearch = async (search, dispatch) => {
	await gameChangerAPI.favoriteSearch(search);
	await getUserData(dispatch);
};

export const handleClearFavoriteSearchNotification = async (search, dispatch) => {
	await gameChangerAPI.clearFavoriteSearchUpdate(search.tiny_url);
	await getUserData(dispatch);
};

export const handleSaveFavoriteSearchHistory = async (
	favoriteName,
	favoriteSummary,
	favorite,
	tinyUrl,
	searchText,
	count,
	dispatch
) => {
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

export const handleGenerateGroup = async (group, state, dispatch) => {
	const { cloneData } = state;
	const clone_index = cloneData?.clone_data?.project_name;
	const { group_type, group_name, group_description, create, group_ids } = group;

	await gameChangerAPI.favoriteGroup({
		group_type,
		group_name,
		group_description,
		create,
		clone_index,
		group_ids,
		is_clone: true,
	});
	await getUserData(dispatch);
};

export const handleSaveFavoriteOrganization = async (organization, organizationSummary, favorited, dispatch) => {
	await gameChangerAPI.favoriteOrganization({ organization, organizationSummary, is_favorite: favorited });
	await getUserData(dispatch);
};

export const handleRemoveFavoriteFromGroup = async (groupId, documentId, dispatch) => {
	await gameChangerAPI.deleteFavoriteFromGroupPOST({ groupId, documentId });
	await getUserData(dispatch);
};

export const createTinyUrl = async (cloneData) => {
	let url = window.location.hash.toString();
	url = url.replace('#/', '');
	const res = await gameChangerAPI.shortenSearchURLPOST(url);

	return `${cloneData.url}?tiny=${res.data.tinyURL}`;
};

export const getUserData = async (dispatch) => {
	try {
		const { data } = await gcUserManagementAPI.getUserData();
		setState(dispatch, { userData: data, userDataSet: true });
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

export const setCurrentTime = (dispatch) => {
	// const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	let currentTime = new Date();
	let currentMonth = currentTime.getMonth() + 1 < 10 ? `0${currentTime.getMonth() + 1}` : currentTime.getMonth() + 1;
	let currentDay = currentTime.getDate() < 10 ? `0${currentTime.getDate()}` : currentTime.getDate();

	// currentTime = `${months[currentTime.getMonth() - 1]} ${currentTime.getDate()}, ${currentTime.getHours()}:${currentTime.getMinutes()}`;
	currentTime = `${currentTime.getFullYear()}-${currentMonth}-${currentDay}-${currentTime.getHours()}-${currentTime.getSeconds()}-${currentTime.getMilliseconds()}`;

	setState(dispatch, { currentTime: currentTime });

	return currentTime;
};

export const sendJiraFeedback = (data) => {
	return gameChangerAPI.sendJiraFeedback(data);
};

export const getNonMainPageOuterContainer = (innerChildren, state, dispatch) => {
	return (
		<div>
			<div
				style={{
					backgroundColor: 'rgba(223, 230, 238, 0.5)',
					minHeight: 'calc(100vh - 200px)',
				}}
			>
				{state.pageDisplayed !== 'aboutUs' && state.pageDisplayed !== 'faq' && (
					<div
						style={{
							borderTop: '1px solid #B0BAC5',
							width: '96.5%',
							marginLeft: 'auto',
							marginRight: 'auto',
						}}
					/>
				)}
				<React.Fragment>
					{state.pageDisplayed !== 'aboutUs' && state.pageDisplayed !== 'faq' && (
						<Button
							style={{
								marginLeft: '10px',
								marginTop: '8px',
								fontFamily: 'Montserrat',
								color: '#313541',
								position: 'absolute',
							}}
							startIcon={<ArrowBackIcon />}
							onClick={() => {
								window.history.pushState(
									null,
									document.title,
									`/#/${state.cloneData.url.toLowerCase()}`
								);
								setState(dispatch, { pageDisplayed: PAGE_DISPLAYED.main });
								let viewName;
								switch (state.pageDisplayed) {
									case PAGE_DISPLAYED.dataTracker:
										viewName = 'DataTracker';
										break;
									case PAGE_DISPLAYED.userDashboard:
										viewName = 'UserDashboard';
										break;
									case PAGE_DISPLAYED.analystTools:
										viewName = 'AnalystTools';
										break;
									default:
										viewName = 'Main';
										break;
								}
								trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), viewName, 'Back');
							}}
						>
							<></>
						</Button>
					)}
					<div>
						<p
							style={{
								fontSize: '26px',
								marginLeft: '80px',
								fontFamily: 'Montserrat',
								fontWeight: 'bold',
								marginTop: '10px',
								color: '#313541',
							}}
						>
							{state.pageDisplayed === PAGE_DISPLAYED.dataTracker && 'Data Status Tracker'}
							{state.pageDisplayed === PAGE_DISPLAYED.analystTools && (
								<span>
									Analyst Tools | {state.analystToolsPageDisplayed}{' '}
									<b style={{ color: 'red', fontSize: 14 }}>(Beta)</b>
								</span>
							)}
							{state.pageDisplayed === PAGE_DISPLAYED.userDashboard && <span>User Dashboard</span>}
						</p>
					</div>

					<div
						style={{
							backgroundColor:
								state.pageDisplayed === PAGE_DISPLAYED.dataTracker ||
								state.pageDisplayed === PAGE_DISPLAYED.analystTools ||
								state.pageDisplayed === PAGE_DISPLAYED.aboutUs ||
								state.pageDisplayed === PAGE_DISPLAYED.faq
									? '#ffffff'
									: '#DFE6EE',
						}}
					>
						{innerChildren}
					</div>
				</React.Fragment>
			</div>
		</div>
	);
};

export const setUserMatomo = (value) => {
	localStorage.setItem('userMatomo', value);
};

/* 
	Wrapper to assist with debugging why components are rendering
	Usage:
		import { withPropsChecker } from './sharedFunctions.js';

		const myComponent = props => {...}

		export default withPropsChecker(myComponent);
*/
export function withPropsChecker(WrappedComponent) {
	return class PropsChecker extends Component {
		componentWillReceiveProps(nextProps) {
			Object.keys(nextProps)
				.filter((key) => {
					return nextProps[key] !== this.props[key];
				})
				.map((key) => {
					console.log('changed property:', key, 'from', this.props[key], 'to', nextProps[key]);
				});
		}
		render() {
			return <WrappedComponent {...this.props} />;
		}
	};
}
