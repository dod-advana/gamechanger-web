import React, {useEffect, useState} from "react";
import {
	getOrgToOrgQuery, getTrackingNameForFactory, getTypeQuery,
	PAGE_DISPLAYED, RESULTS_PER_PAGE, SEARCH_TYPES, setFilterVariables, getQueryVariable
} from "../../gamechangerUtils";
import ResultView from "./ResultView";
import {Button} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {trackEvent} from "../telemetry/Matomo";
import GCDataStatusTracker from "../dataTracker/GCDataStatusTracker";
import GCResponsibilityTracker from "../analystTools/GCResponsibilityTracker";
import GCUserDashboard from "../user/GCUserDashboard";
import {
	checkUserInfo,
	clearDashboardNotification,
	getSearchObjectFromString,
	getUserData,
	handleSaveFavoriteDocument,
	handleSaveFavoriteTopic,
	setSearchURL,
	setState
} from "../../sharedFunctions";
import GameChangerAPI from "../api/gameChanger-service-api";
import {DidYouMean} from "../searchBar/SearchBarStyledComponents";
import MagellanTrendingLinkList from "../common/MagellanTrendingLinkList";
import {gcOrange} from "../../components/common/gc-colors";
import LoadingIndicator from "advana-platform-ui/dist/loading/LoadingIndicator";
import ExportResultsDialog from "../export/ExportResultsDialog";
// import util from "../advana/api/util";
import uuidv4 from "uuid/v4";
import QueryDialog from "../admin/QueryDialog";
import DocDialog from "../admin/DocDialog";
import MainViewFactory from "../factories/mainViewFactory";
import SearchHandlerFactory from "../factories/searchHandlerFactory";
import { useBottomScrollListener } from 'react-bottom-scroll-listener';

const _ = require('lodash');

const gameChangerAPI = new GameChangerAPI();


const handlePageLoad = async (state, dispatch, history) => {

	if (state.runSearch) return;
	
	let documentProperties = await getDocumentProperties(dispatch);
	
	// redirect the page if using tinyurl
	const url = await checkForTinyURL(window.location);
	if (url) {
		history.replace(`#/${url}`);
		//setPageLoaded(false);
		//return;
	}
	else if (url === null) {
		///history.replace(state.cloneData.clone_data.url);
		return;
	}
	
	try {
		getTrendingSearches(state.cloneData);
	} catch (e) {
		// Do nothing
	}
	
	// set search settings
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	try {
		const results = await gameChangerAPI.getUserSettings();
		const searchSettings = results.data.search_settings;
		
		if (searchSettings) {

			const accessAsDates = newSearchSettings.accessDateFilter[0] && newSearchSettings.accessDateFilter[1] ? newSearchSettings.accessDateFilter.map(date => new Date(date)) : [null,null];
			const publicationAsDates = newSearchSettings.publicationDateFilter[0] && newSearchSettings.publicationDateFilter[1] ? newSearchSettings.publicationDateFilter.map(date => new Date(date)) : [null,null];
			const publicationDateAllTimeValue = newSearchSettings.publicationDateAllTime === undefined ? true : newSearchSettings.publicationDateAllTime;
			
			newSearchSettings.accessDateFilter = accessAsDates;
			newSearchSettings.publicationDateFilter = publicationAsDates;
			newSearchSettings.publicationDateAllTime = publicationDateAllTimeValue;
		} else {
			console.log('NO SETTINGS')
		}
	} catch (e) {
		// do nothing
	}
	
	// fetch ES index
	try{
		const esIndex = await gameChangerAPI.getElasticSearchIndex();
		setState(dispatch, { esIndex: esIndex.data });
	} catch (e){
		console.log(e);
	}
	
	try {
		getUserData(dispatch);
	} catch(e) {
		console.log(e);
	}
	
	// get url data and set accordingly
	const searchText = getQueryVariable('q');
	let searchType = getQueryVariable('searchType');
	let offset = getQueryVariable('offset');
	let tabName = getQueryVariable('tabName');
	let orgURL = getQueryVariable('orgFilter');
	let typeURL = getQueryVariable('typeFilter');
	let searchFieldsURL = getQueryVariable('searchFields');
	
	if (!tabName) {
		tabName = state.tabName;
	}

	let orgFilterObject = _.cloneDeep(newSearchSettings.orgFilter);
	let typeFilterObject = _.cloneDeep(newSearchSettings.typeFilter);

	if (orgURL) {
		setFilterVariables(orgFilterObject, orgURL);
		if (orgURL !== 'ALLORGS') {
			newSearchSettings.allOrgsSelected = false;
			newSearchSettings.specificOrgsSelected = true;
		} else {
			newSearchSettings.allOrgsSelected = true;
			newSearchSettings.specificOrgsSelected = false;
		}
	}
	
	if(typeURL) {
		setFilterVariables(typeFilterObject, typeURL);
		if (orgURL !== 'ALLTYPES') {
			newSearchSettings.allTypesSelected = false;
			newSearchSettings.specificTypesSelected = true;
		} else {
			newSearchSettings.allTypesSelected = true;
			newSearchSettings.specificTypesSelected = false;
		}
	}
	
	let searchFields;
	
	if (searchFieldsURL) {
		const searchFieldPairs = searchFieldsURL.split('_');

		searchFieldPairs.forEach(pairText => {
			if (documentProperties) {
				const pair = pairText.split('-');
				const field = documentProperties.filter(prop => prop.display_name === pair[0])[0];
				searchFields[uuidv4()] = { field: field, input: pair[1] }
			}
		});
		searchFields[uuidv4()] = { field: null, input: '' }
		newSearchSettings.searchFields = searchFields;
	}

	if (Object.values(SEARCH_TYPES).indexOf(searchType) === -1) {
		searchType = 'Keyword';
	}

	if (isNaN(offset)) {
		offset = 0;
	}

	const resultsPage = Math.floor(offset / RESULTS_PER_PAGE) + 1;

	if (searchText) {
		newSearchSettings.searchType = searchType;
		newSearchSettings.orgFilter = orgFilterObject;
		newSearchSettings.typeFilter = typeFilterObject;
		setState(dispatch, {
			searchText,
			resultsPage,
			searchSettings: newSearchSettings,
			offset,
			tabName,
			runSearch: true
		});
		
		setSearchURL({searchText, resultsPage, tabName, cloneData: state.cloneData}, newSearchSettings);
	}
}

const getDocumentProperties = async (dispatch) => {
	let documentProperties = [];

	try {
		const docPropsResponse = await gameChangerAPI.getDocumentProperties();
		const keepList = {
			'display_title_s': 'Title',
			'display_doc_type_s': 'Document Type',
			'display_org_s': 'Organization',
			'doc_num': 'Document Number',
			'filename': 'Filename',
		}
		documentProperties = docPropsResponse.data.filter(field => Object.keys(keepList).indexOf(field.name) !== -1);
		documentProperties.forEach(field => {
			field.display_name = keepList[field.name];
		});
	} catch(e) {
		console.log(e)
	}

	setState(dispatch, {documentProperties});

	return documentProperties;
}

const checkForTinyURL = async (location) => {

	const tiny = getQueryVariable('tiny');

	if (!location || !tiny) {
		return false;
	}

	if (tiny) {
		const res = await gameChangerAPI.convertTinyURLPOST(tiny);
		return res.data.url;
	}
}

const getTrendingSearches = (cloneData) => {
	const daysAgo = 7;
	let internalUsers = [];
	let blacklist = [];

	gameChangerAPI.getInternalUsers().then(({data}) => {
		data.forEach(d => {
			internalUsers.push(d.username);
		});

		gameChangerAPI.getTrendingBlacklist().then(({data}) => {
			data.forEach(d => {
				blacklist.push(d.search_text);
			});

			gameChangerAPI.getAppStats({cloneData, daysAgo, internalUsers, blacklist}).then(({data}) => {
				localStorage.setItem(`trending${cloneData.clone_name}Searches`, JSON.stringify(data.data.topSearches.data));
			}).catch(e => {console.log("error with getting trending: " + e);})

		}).catch(e => console.log("error with getting blacklist: " + e));

	}).catch(e => {console.log("error getting internal users: " + e)});
}

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
			handlePageLoad(state, dispatch, state.history);
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
			<GCResponsibilityTracker/>
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
		const { cloneData, componentStepNumbers, prevSearchText, resetSettingsSwitch, didYouMean, loading } = state;
		const showDidYouMean = didYouMean && !loading;
		const latestLinks = localStorage.getItem(`recent${cloneData.clone_name}Searches`) || '[]';
		const trendingStorage = localStorage.getItem(`trending${cloneData.clone_name}Searches`) || '[]';
		let trendingLinks = [];
		if (trendingStorage) {
			JSON.parse(trendingStorage).forEach(search => {
				if (search.search) {
					trendingLinks.push(search.search.replaceAll('&#039;', '"'));
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
				<div style={{ margin: '10px auto', width: '67%' }}>
					<div className={`tutorial-step-${componentStepNumbers["Trending Searches"]}`} >
						<MagellanTrendingLinkList onLinkClick={handleLinkListItemClick}
						links={trendingLinks} title="Trending Searches This Week" padding={10} />
					</div>
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
			const {exportDialogVisible, searchSettings, prevSearchText, selectedDocuments, loading, rawSearchResults, viewNames, edaSearchSettings} = state;
			const {allOrgsSelected, orgFilter, searchType, searchFields, allTypesSelected, typeFilter,} = searchSettings;
			
			const noResults = Boolean(rawSearchResults?.length === 0);
			const hideSearchResults = noResults && !loading;

			const isSelectedDocs = selectedDocuments && selectedDocuments.size ? true : false;

			return (
				<>
					{exportDialogVisible && (
						<ExportResultsDialog
							open={exportDialogVisible}
							handleClose={() => setState(dispatch, { exportDialogVisible: false })}
							searchObject={getSearchObjectFromString(prevSearchText)}
							setCurrentTime={setCurrentTime}
							selectedDocuments={selectedDocuments}
							isSelectedDocs={isSelectedDocs}
							orgFilterString={getOrgToOrgQuery(allOrgsSelected, orgFilter)}
							typeFilterString={getTypeQuery(allTypesSelected, typeFilter)}
							orgFilter={orgFilter}
							typeFilter={typeFilter}
							getUserData={() => getUserData(dispatch)}
							isClone = {true}
							cloneData = {state.cloneData}
							searchType={searchType}
							searchFields={searchFields}
							edaSearchSettings={edaSearchSettings}
						/>
					)}
					{loading &&
						<div style={{ margin: '0 auto' }}>
							<LoadingIndicator customColor={gcOrange} />
						</div>
					}
					{hideSearchResults && renderHideTabs()}
					{(!hideSearchResults && pageLoaded) && <ResultView {...props} viewNames={viewNames} viewPanels={getViewPanels()} />}
					{state.showEsQueryDialog && (
						<QueryDialog
							open={state.showEsQueryDialog}
							handleClose={() => { setState(dispatch, { showEsQueryDialog: false }) }}
							query={state.query}
						/>
					)}
					{state.showEsDocDialog && (
						<DocDialog
							open={state.showEsDocDialog}
							handleClose={() => { setState(dispatch, { showEsDocDialog: false }) }}
							doc={state.selectedDoc}
						/>
					)}
				</>
			);
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

export default MainView;
