import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
	getTrackingNameForFactory,
	PAGE_DISPLAYED,
} from '../../utils/gamechangerUtils';
import { Button } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { trackEvent } from '../telemetry/Matomo';
import GCDataStatusTracker from '../dataTracker/GCDataStatusTracker';
import AnalystTools from '../analystTools';
import GCUserDashboard from '../user/GCUserDashboard';
import GCAboutUs from '../aboutUs/GCAboutUs';
import {
	checkUserInfo,
	getUserData,
	handleSaveFavoriteDocument,
	handleSaveFavoriteTopic,
	handleSaveFavoriteOrganization,
	setState,
} from '../../utils/sharedFunctions';
import GameChangerAPI from '../api/gameChanger-service-api';
import MainViewFactory from '../factories/mainViewFactory';
import SearchHandlerFactory from '../factories/searchHandlerFactory';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';

const gameChangerAPI = new GameChangerAPI();
let cancelToken = axios.CancelToken.source();

const MainView = (props) => {
	const { context } = props;

	const { state, dispatch } = context;

	const [pageLoaded, setPageLoaded] = useState(false);
	const [mainViewHandler, setMainViewHandler] = useState();
	const [searchHandler, setSearchHandler] = useState();

	useEffect(() => {
		return function cleanUp(){
			cancelToken.cancel('canceled axios with cleanup');
			cancelToken = axios.CancelToken.source();
		}
	},[])

	useEffect(() => {
		if(state.runningSearch && cancelToken) {
			cancelToken.cancel('canceled axios request from search run');
			cancelToken = axios.CancelToken.source();
		};
	},[state.runningSearch])

	useEffect(() => {
		const urlArray = window.location.href.split('/');
		setState( dispatch, {pageDisplayed: urlArray[urlArray.length - 1]})
	}, [dispatch])

	useEffect(() => {
		if (state.cloneDataSet && state.historySet && !pageLoaded) {
			const factory = new MainViewFactory(state.cloneData.main_view_module);
			const handler = factory.createHandler();
			setMainViewHandler(handler);
			setPageLoaded(true);
			const viewNames = handler.getViewNames({cloneData: state.cloneData});

			const searchFactory = new SearchHandlerFactory(
				state.cloneData.search_module
			);
			const searchHandler = searchFactory.createHandler();
			setSearchHandler(searchHandler);

			handler.handlePageLoad({
				state,
				dispatch,
				history: state.history,
				searchHandler,
				cancelToken
			});

			setState(dispatch, { viewNames });
		}
	}, [state, dispatch, pageLoaded]);

	useEffect(() => {
		const favSearchUrls = state.userData?.favorite_searches?.map((search) => {
			return search.url;
		});

		let url = window.location.hash.toString();
		url = url.replace('#/', '');

		const searchFavorite = favSearchUrls?.includes(url);

		if (state.isFavoriteSearch !== searchFavorite) {
			setState(dispatch, { isFavoriteSearch: searchFavorite });
		}
	}, [state.isFavoriteSearch, state.userData, dispatch, pageLoaded]);

	useEffect(() => {
		if (state.cloneData.clone_name === 'gamechanger') {
			if (state.docsPagination && searchHandler) {
				searchHandler.handleDocPagination(
					state,
					dispatch,
					state.replaceResults
				);
			}
			if (state.entityPagination && searchHandler) {
				searchHandler.handleEntityPagination(state, dispatch);
			}
			if (state.topicPagination && searchHandler) {
				searchHandler.handleTopicPagination(state, dispatch);
			}
		} else if (state.cloneData.clone_name === 'globalSearch') {
			if (state.applicationsPagination && searchHandler) {
				searchHandler.handleApplicationsPagination(state, dispatch);
			}
			if (state.dashboardsPagination && searchHandler) {
				searchHandler.handleDashboardsPagination(state, dispatch);
			}
			if (state.dataSourcesPagination && searchHandler) {
				searchHandler.handleDataSourcesPagination(state, dispatch);
			}
			if (state.databasesPagination && searchHandler) {
				searchHandler.handleDatabasesPagination(state, dispatch);
			}
		} else if (state.cloneData.clone_name.toLowerCase() === 'cdo') {
			if (state.docsPagination && searchHandler) {
				setState(dispatch, {
					docsPagination: false,
				});
				searchHandler.handleSearch(
					state,
					dispatch,
					state.replaceResults
				);
			}
		}
	}, [state, dispatch, searchHandler]);

	useBottomScrollListener(
		() => {
			if (
				(state.activeCategoryTab !== 'all' || state.cloneData.clone_name.toLowerCase() === 'cdo') &&
				!state.docsLoading &&
				!state.docsPagination
			) {
				setState(dispatch, {
					docsLoading: true,
					infiniteScrollPage: state.infiniteScrollPage + 1,
					replaceResults: false,
					docsPagination: true,
				});
			}
		},
		{ debounce: 5000 }
	);

	const getViewPanels = () => {
		const viewPanels = { Card: mainViewHandler.getCardViewPanel({ context }) };

		const extraViewPanels = mainViewHandler.getExtraViewPanels({ context });
		extraViewPanels.forEach(({ panelName, panel }) => {
			viewPanels[panelName] = panel;
		});

		return viewPanels;
	};

	const getAnalystTools = () => {
		return (
			<AnalystTools context={context} />
		);
	}
	
	const getDataTracker = () => {
		return <GCDataStatusTracker state={state} />;
	};

	const getUserDashboard = () => {
		return (
			<GCUserDashboard 
				state={state} 
				userData={state.userData} 
				updateUserData={() => getUserData(dispatch)}
				handleSaveFavoriteDocument={(document) => handleSaveFavoriteDocument(document, state, dispatch)}
				handleDeleteSearch={(search) => handleDeleteFavoriteSearch(search)}
				handleClearFavoriteSearchNotification={(search) => handleClearFavoriteSearchNotification(search)}
				saveFavoriteSearch={(
					favoriteName,
					favoriteSummary,
					favorite,
					tinyUrl,
					searchText,
					count
				) =>
					handleSaveFavoriteSearchHistory(
						favoriteName,
						favoriteSummary,
						favorite,
						tinyUrl,
						searchText,
						count
					)
				}
				handleFavoriteTopic={({ topic_name, topic_summary, favorite }) =>
					handleSaveFavoriteTopic(topic_name, topic_summary, favorite, dispatch)
				}
				handleFavoriteOrganization={({
					organization_name,
					organization_summary,
					favorite,
				}) =>
					handleSaveFavoriteOrganization(
						organization_name,
						organization_summary,
						favorite,
						dispatch
					)
				}
				cloneData={state.cloneData}
				checkUserInfo={() => {
					return checkUserInfo(state, dispatch);
				}}
				dispatch={dispatch}
			/>
		);
	};

	const getAboutUs = () => {
		return <GCAboutUs state={state} />;
	};

	const handleDeleteFavoriteSearch = async (search) => {
		await gameChangerAPI.favoriteSearch(search);
		await getUserData(dispatch);
	};

	const handleClearFavoriteSearchNotification = async (search) => {
		await gameChangerAPI.clearFavoriteSearchUpdate(search.tiny_url);
		await getUserData(dispatch);
	};

	const handleSaveFavoriteSearchHistory = async (
		favoriteName,
		favoriteSummary,
		favorite,
		tinyUrl,
		searchText,
		count
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

	const getNonMainPageOuterContainer = (getInnerChildren) => {
		return (
			<div>
				<div
					style={{
						backgroundColor: 'rgba(223, 230, 238, 0.5)',
						marginBottom: 10,
					}}
				>
					{state.pageDisplayed !== 'aboutUs' && (
						<div
							style={{
								borderTop: '1px solid #B0BAC5',
								width: '91.2%',
								marginLeft: 'auto',
								marginRight: 'auto',
							}}
						/>
					)}
					<React.Fragment>
						{state.pageDisplayed !== 'aboutUs' && (
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
									window.history.pushState(null, document.title, `/#/${state.cloneData.url.toLowerCase()}`);
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
									trackEvent(
										getTrackingNameForFactory(state.cloneData.clone_name),
										viewName,
										'Back'
									);
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
								{state.pageDisplayed === PAGE_DISPLAYED.analystTools && <span>Analyst Tools | {state.analystToolsPageDisplayed} <b style={{ color: 'red', fontSize: 14 }}>(Beta)</b></span>}
								{state.pageDisplayed === PAGE_DISPLAYED.userDashboard && (
									<span>User Dashboard</span>
								)}
							</p>
						</div>

						<div
							style={{
								backgroundColor:
									state.pageDisplayed === PAGE_DISPLAYED.dataTracker ||
									state.pageDisplayed === PAGE_DISPLAYED.analystTools ||
									state.pageDisplayed === PAGE_DISPLAYED.aboutUs
										? '#ffffff'
										: '#DFE6EE',
							}}
						>
							{getInnerChildren()}
						</div>
					</React.Fragment>
				</div>
			</div>
		);
	};

	const setCurrentTime = () => {
		// const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		let currentTime = new Date();
		let currentMonth =
			currentTime.getMonth() + 1 < 10
				? `0${currentTime.getMonth() + 1}`
				: currentTime.getMonth() + 1;
		let currentDay =
			currentTime.getDate() < 10
				? `0${currentTime.getDate()}`
				: currentTime.getDate();

		// currentTime = `${months[currentTime.getMonth() - 1]} ${currentTime.getDate()}, ${currentTime.getHours()}:${currentTime.getMinutes()}`;
		currentTime = `${currentTime.getFullYear()}-${currentMonth}-${currentDay}-${currentTime.getHours()}-${currentTime.getSeconds()}-${currentTime.getMilliseconds()}`;

		setState(dispatch, { currentTime: currentTime });

		return currentTime;
	};

	const renderHideTabs = (props) => {
		return mainViewHandler.renderHideTabs(props);
	};

	switch (state.pageDisplayed) {
		case PAGE_DISPLAYED.analystTools:
			return getNonMainPageOuterContainer(getAnalystTools);
		case PAGE_DISPLAYED.dataTracker:
			return getNonMainPageOuterContainer(getDataTracker);
		case PAGE_DISPLAYED.userDashboard:
			return getNonMainPageOuterContainer(getUserDashboard);
		case PAGE_DISPLAYED.aboutUs:
			return getNonMainPageOuterContainer(getAboutUs);
		case PAGE_DISPLAYED.main:
		default:
			if (mainViewHandler) {
				return mainViewHandler.getMainView({
					state,
					dispatch,
					setCurrentTime,
					renderHideTabs,
					pageLoaded,
					getViewPanels,
				});
			} else {
				return <></>;
			}
	}
};

MainView.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			cloneDataSet: PropTypes.bool,
			historySet: PropTypes.bool,
			cloneData: PropTypes.shape({
				main_view_module: PropTypes.string,
				search_module: PropTypes.string,
				clone_name: PropTypes.string,
			}),
			history: PropTypes.object,
			userData: PropTypes.shape({
				favorite_searches: PropTypes.array,
			}),
			isFavoriteSearch: PropTypes.bool,
			docsPagination: PropTypes.bool,
			entityPagination: PropTypes.bool,
			topicPagination: PropTypes.bool,
			replaceResults: PropTypes.bool,
			activeCategoryTab: PropTypes.string,
			docsLoading: PropTypes.bool,
			infiniteScrollPage: PropTypes.number,
			pageDisplayed: PropTypes.string,
			searchSettings: PropTypes.object,
		}),
		dispatch: PropTypes.func,
	}),
};

export default MainView;
