import React, {useEffect, useState} from "react";
import PropTypes from 'prop-types';
import { getTrackingNameForFactory, PAGE_DISPLAYED } from "../../gamechangerUtils";
import {Button, Typography} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {trackEvent} from "../telemetry/Matomo";
import GCDataStatusTracker from "../dataTracker/GCDataStatusTracker";
import GCResponsibilityTracker from "../analystTools/GCResponsibilityTracker";
import GCUserDashboard from "../user/GCUserDashboard";
import {
	checkUserInfo,
	clearDashboardNotification,
	getUserData,
	handleSaveFavoriteDocument,
	handleSaveFavoriteTopic,
	setSearchURL,
	setState
} from "../../sharedFunctions";
import GameChangerAPI from "../api/gameChanger-service-api";
import {DidYouMean} from "../searchBar/SearchBarStyledComponents";
import MagellanTrendingLinkList from "../common/MagellanTrendingLinkList";
import MainViewFactory from "../factories/mainViewFactory";
import SearchHandlerFactory from "../factories/searchHandlerFactory";
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import GameChangerThumbnailRow from "./ThumbnailRow";
import { AgencyPublicationContainer, TrendingSearchContainer, RecentSearchContainer, SourceContainer } from "./HomePageStyledComponents";

const gameChangerAPI = new GameChangerAPI();

const MainView = (props) => {
	
	const {context} = props;

	const {state, dispatch} = context;
	
	const [pageLoaded, setPageLoaded] = useState(false);
	const [mainViewHandler, setMainViewHandler] = useState();
	const [searchHandler, setSearchHandler] = useState();


	useEffect(() => {
		if (state.cloneDataSet && state.historySet && !pageLoaded) {
			const factory = new MainViewFactory(state.cloneData.main_view_module);
			const handler = factory.createHandler();
			setMainViewHandler(handler);
			setPageLoaded(true);
			handler.handlePageLoad({state, dispatch, history: state.history});
			const viewNames = handler.getViewNames();

			const searchFactory = new SearchHandlerFactory(state.cloneData.search_module);
			const searchHandler = searchFactory.createHandler();
			setSearchHandler(searchHandler)
			
			setState(dispatch, {viewNames})
		}
		
		if (state.userData.favorite_searches?.length > 0) {
			const favSearchUrls = state.userData.favorite_searches.map(search => {
				return search.url;
			});
			
			let url = window.location.hash.toString();
			url = url.replace("#/", "");
	
			const searchFavorite = favSearchUrls.includes(url);
			
			if (state.isFavoriteSearch !== searchFavorite) {
				setState(dispatch, { isFavoriteSearch: searchFavorite });
			}
		}
	}, [state, dispatch, pageLoaded])

	useEffect(() => {
		if (state.cloneData.clone_name === 'gamechanger'){
			if (state.docsPagination && searchHandler) {
				searchHandler.handleDocPagination(state, dispatch, state.replaceResults);
			}
			if(state.entityPagination && searchHandler){
				searchHandler.handleEntityPagination(state, dispatch);
			}
			if(state.topicPagination && searchHandler){
				searchHandler.handleTopicPagination(state, dispatch);
			}
		}
	}, [state, dispatch, searchHandler]);


	useBottomScrollListener(() => {
		if(state.activeCategoryTab !== 'all' && !state.docsLoading && !state.docsPagination){
			setState(dispatch, {
				docsLoading: true,
				infiniteScrollPage: state.infiniteScrollPage+1,
				replaceResults: false,
				docsPagination: true
			})
		}
	},{debounce: 5000} )


	const getViewPanels = () => {
		const viewPanels = {'Card': mainViewHandler.getCardViewPanel({context})};
		
		const extraViewPanels = mainViewHandler.getExtraViewPanels({context});
		extraViewPanels.forEach(({panelName, panel}) => {
			viewPanels[panelName] = panel;
		})
	
		return viewPanels;
	}
	
	const handleDidYouMeanClicked = () => {
		const { didYouMean } = state
		trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'SuggestionSelected', 'DidYouMean');
		setState(dispatch, { searchText: didYouMean, runSearch: true });
	}
	
	const handleLinkListItemClick = (searchText) => {
		trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), "TrendingSearchSelected", "text", searchText);
		setState(dispatch, { searchText, autoCompleteItems: [], metricsCounted: false, runSearch: true });
	}
	

	
	const getAnalystTools = () => {
		return (
			<GCResponsibilityTracker state={state} />
		);
	}
	
	const getDataTracker = () => {
		return (
			<GCDataStatusTracker state={state} />
		);
	}
	
	const getUserDashboard = () => {
		return (
			<GCUserDashboard userData={state.userData} updateUserData={() => getUserData(dispatch)}
				handleSaveFavoriteDocument={(document) => handleSaveFavoriteDocument(document, state, dispatch)}
				handleDeleteSearch={(search) => handleDeleteFavoriteSearch(search)}
				saveFavoriteSearch={(favoriteName, favoriteSummary, favorite, tinyUrl, searchText, count) =>
					handleSaveFavoriteSearchHistory(favoriteName, favoriteSummary, favorite, tinyUrl, searchText, count)}
				handleFavoriteTopic={({topic_name, topic_summary, favorite}) =>
					handleSaveFavoriteTopic(topic_name, topic_summary, favorite, dispatch)}
				clearDashboardNotification={(type) => clearDashboardNotification(type, state, dispatch)}
				cloneData={state.cloneData} checkUserInfo={() => { return checkUserInfo(state, dispatch)}}
			/>
		);
	}
	
	const handleDeleteFavoriteSearch = async (search) => {
		await gameChangerAPI.favoriteSearch(search);
		await getUserData(dispatch);
	}

	const openDocument = (filename, cloneName, pageNumber = 0) => {
		const { cloneData } = state
		trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction' , 'PDFOpen');
		trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'filename', filename);
		window.open(`/#/pdfviewer/gamechanger?filename=${filename}&pageNumber=${pageNumber}&cloneIndex=${cloneData.clone_name}`);
	};
	
	const handleSaveFavoriteSearchHistory = async (favoriteName, favoriteSummary, favorite, tinyUrl, searchText, count) => {
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
	
	const getNonMainPageOuterContainer = (getInnerChildren) => {
		return (
			<div>
				<div style={{backgroundColor: 'rgba(223, 230, 238, 0.5)', marginBottom: 10}}>
					<div style={{borderTop: '1px solid #B0BAC5', width: '91.2%', marginLeft: 'auto', marginRight: 'auto'}}/>
					<React.Fragment>
						<Button
							style={{marginLeft: '10px', marginTop: '8px', fontFamily: 'Montserrat',
								color: '#313541', position: 'absolute' }}
							startIcon={<ArrowBackIcon/>}
							onClick={()=> {
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
						<div>
							<p style={{fontSize: '26px', marginLeft: '80px', fontFamily: 'Montserrat', fontWeight: 'bold', marginTop: '10px',
								color: '#313541'}}>
								{state.pageDisplayed === PAGE_DISPLAYED.dataTracker && "Data Status Tracker"}
								{state.pageDisplayed === PAGE_DISPLAYED.analystTools && <span>Analyst Tools <b style={{color: 'red', fontSize: 14}}>(Beta)</b></span>}
								{state.pageDisplayed === PAGE_DISPLAYED.userDashboard && <span>User Dashboard</span>}
							</p>
						</div>
						
						<div style={{backgroundColor: state.pageDisplayed === PAGE_DISPLAYED.dataTracker || state.pageDisplayed === PAGE_DISPLAYED.analystTools ? '#ffffff' : '#DFE6EE'}}>
							{getInnerChildren()}
						</div>
					</React.Fragment>
				</div>
			</div>
		);
	}
	
	const setCurrentTime = () => {
		// const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		let currentTime = new Date();
		let currentMonth = currentTime.getMonth() + 1 < 10 ? `0${currentTime.getMonth() + 1}` : currentTime.getMonth() + 1;
		let currentDay = currentTime.getDate() < 10 ? `0${currentTime.getDate()}` : currentTime.getDate();

		// currentTime = `${months[currentTime.getMonth() - 1]} ${currentTime.getDate()}, ${currentTime.getHours()}:${currentTime.getMinutes()}`;
		currentTime = `${currentTime.getFullYear()}-${currentMonth}-${currentDay}-${currentTime.getHours()}-${currentTime.getSeconds()}-${currentTime.getMilliseconds()}`;
		
		setState(dispatch, { currentTime: currentTime });

		return currentTime;
	}
	
	const renderHideTabs = () => {
		const { cloneData, componentStepNumbers, prevSearchText, resetSettingsSwitch, didYouMean, loading, userData, recentlyOpened } = state;
		const showDidYouMean = didYouMean && !loading;
		const latestLinks = localStorage.getItem(`recent${cloneData.clone_name}Searches`) || '[]';
		const trendingStorage = localStorage.getItem(`trending${cloneData.clone_name}Searches`) || '[]';
		let trendingLinks = [];
		if (trendingStorage) {
			JSON.parse(trendingStorage).forEach(search => {
				if (search.search) {
					trendingLinks.push({search:search.search.replaceAll('&#039;', '"'), favorite: false});
				}
			});
		}

		if(prevSearchText) {
			if(!resetSettingsSwitch) {
				dispatch({type: 'RESET_SEARCH_SETTINGS'});
				setState(dispatch, {resetSettingsSwitch: true, showSnackbar: true, snackBarMsg: 'Search settings reset'});
				setSearchURL(state, state.searchSettings)
			}
		}
		const { favorite_documents = [], favorite_searches = [] } = userData;
		const favorites = favorite_documents.map(favorite=>favorite.filename);

		trendingLinks.forEach(({search},idx) => {
			favorite_searches.forEach(fav => {
				if(fav.search_text === search){
					trendingLinks[idx].favorite = true;
				}
			})
		});
		console.log(state)
		
		return (
			<div style={{marginTop: '40px'}}>
			{prevSearchText &&
				<div style={{ margin: '10px auto', width: '67%' }}>
					<div style={styles.resultsCount}><p style={{fontWeight:'normal', display:'inline'}}>Looks like we don't have any matches for </p>"{prevSearchText}"</div>
				</div>
			}
			{showDidYouMean && (
				<div style={{ margin: '10px auto', fontSize: '25px', width: '67%', paddingLeft: 'auto'}}>
					Did you mean <DidYouMean onClick={handleDidYouMeanClicked}>{didYouMean}</DidYouMean>?
				</div>
			)}
			{cloneData.clone_name === 'gamechanger' && (
				<div style={{ margin: '0 70px 0 70px'}}>
					<GameChangerThumbnailRow
						title={"Agency Publications"}
					>
						{[<AgencyPublicationContainer/>]}
					</GameChangerThumbnailRow>
					<GameChangerThumbnailRow
						links={trendingLinks}
						title={"Trending Searches"}
						width='300px'
					>
						{trendingLinks.map(({search,favorite},idx)=>
							<TrendingSearchContainer>
								<div style={{display:'flex', justifyContent:'space-between'}}>
									<Typography style={{ fontSize:16,fontWeight: 'bold' }}>{`#${idx+1} ${search}`}</Typography>
									<i className={favorite ? "fa fa-star" : "fa fa-star-o"} style={{
										color: favorite ? "#E9691D" : 'rgb(224, 224, 224)',
										cursor: "pointer",
										fontSize: 20
									}} />
								</div>
							</TrendingSearchContainer>
						)}
					</GameChangerThumbnailRow>
					<GameChangerThumbnailRow 
						links={favorites} 
						title="Sources" 
						onLinkClick={(link) => openDocument(link)}
					>
						{[<SourceContainer/>]}
					</GameChangerThumbnailRow>
					<GameChangerThumbnailRow 
						links={recentlyOpened} 
						title="Recent Searches" 
						onLinkClick={openDocument}
					>
						{[<RecentSearchContainer/>]}
					</GameChangerThumbnailRow>
					<GameChangerThumbnailRow 
						links={trendingLinks} 
						title="Major Publications" 
						onLinkClick={openDocument} 
						thumbnailWidth='500px' 
						thumbnailHeight='100px'
					/>
						{/* <GameChangerThumbnailRow
							title="Banner Test"
							isImgRow={false}
						>
							<div style={{width:6000}}>
								<span>Hi</span>
							</div>
						</GameChangerThumbnailRow> */}
				</div>
			)}
			{cloneData.clone_name !== 'gamechanger' && (
				<div style={{ margin: '10px auto', width: '67%' }}>
					<div className={`tutorial-step-${componentStepNumbers["Recent Searches"]}`} >
						<MagellanTrendingLinkList onLinkClick={handleLinkListItemClick}
							links={JSON.parse(latestLinks)} title="Recent Searches" />
					</div>
				</div>
			)}
			</div>
		)
	}
	switch (state.pageDisplayed) {
		case PAGE_DISPLAYED.analystTools:
			return  getNonMainPageOuterContainer(getAnalystTools);
		case PAGE_DISPLAYED.dataTracker:
			return  getNonMainPageOuterContainer(getDataTracker);
		case PAGE_DISPLAYED.userDashboard:
			return  getNonMainPageOuterContainer(getUserDashboard);
		case PAGE_DISPLAYED.main:
		default:
			if (mainViewHandler) {
				return mainViewHandler.getMainView({state, dispatch, setCurrentTime, renderHideTabs, pageLoaded, getViewPanels});
			}
			else {
				return <></>
			}
			
	}
}


const styles = {
	tabContainer: {
		alignItems: 'center',
		marginBottom: '14px',
	},
	resultsCount: {
		fontFamily: 'Noto Sans',
		fontSize: 22,
		fontWeight: 'bold',
		color: '#131E43',
		paddingTop: '10px'
	}
}

MainView.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			cloneDataSet: PropTypes.bool,
			historySet: PropTypes.bool,
			cloneData: PropTypes.shape({
				main_view_module: PropTypes.string,
				search_module: PropTypes.string,
				clone_name: PropTypes.string
			}),
			history: PropTypes.object,
			userData: PropTypes.shape({
				favorite_searches: PropTypes.array
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
			searchSettings: PropTypes.object
		}),
		dispatch: PropTypes.func
	})
}

export default MainView;
