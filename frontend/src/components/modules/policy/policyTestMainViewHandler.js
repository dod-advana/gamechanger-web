import React from "react";
import GameChangerSearchMatrix from "../../searchMetrics/GCSearchMatrix";
import GameChangerSideBar from "../../searchMetrics/GCSideBar";
import DefaultGraphView from "../../graph/defaultGraphView";
import defaultMainViewHandler from "../default/defaultMainViewHandler";
import ViewHeader from "../../mainView/ViewHeader";
import {trackEvent} from "../../telemetry/Matomo";
import {Typography} from "@material-ui/core";
import {setState} from "../../../sharedFunctions";
import Permissions from "@dod-advana/advana-platform-ui/dist/utilities/permissions";
import SearchSection from "../globalSearch/SearchSection";
import LoadingIndicator from "@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator";
import {gcOrange} from "../../common/gc-colors";
import {Card} from "../../cards/GCCard";
import {DidYouMean} from "../../searchBar/SearchBarStyledComponents";
import Pagination from "react-js-pagination";
import GCTooltip from "../../common/GCToolTip";
import GetQAResults from '../default/qaResults';
import GameChangerThumbnailRow from "../../mainView/ThumbnailRow";
import { TrendingSearchContainer, RecentSearchContainer, SourceContainer } from "../../mainView/HomePageStyledComponents";
import {
	getTrackingNameForFactory,
	RESULTS_PER_PAGE, StyledCenterContainer,
	crawlerMappingFunc
} from "../../../gamechangerUtils";
import GameChangerAPI from "../../api/gameChanger-service-api";
import '../../mainView/main-view.css'

const _ = require('lodash');

const gameChangerAPI = new GameChangerAPI();

const fullWidthCentered = {
	width: "100%",
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center"
};

const styles = {
	listViewBtn: {
		minWidth: 0,
		margin: '20px 0px 0px',
		marginLeft: 10,
		padding: '0px 7px 0',
		fontSize: 20,
		height: 34
	},
	cachedResultIcon: {
		display: 'flex',
		justifyContent: 'center',
		padding: '0 0 1% 0'
	},
	searchResults: fullWidthCentered,
	paginationWrapper: fullWidthCentered,
	resultsCount: {
		fontFamily: 'Noto Sans',
		fontSize: 22,
		fontWeight: 'bold',
		color: '#131E43',
		paddingTop: '10px'
	},
	subtext: {
		color:'#8091A5',
		fontSize: 12
	},
	containerText: {
		fontSize: 16,
		fontWeight: 'bold'
	}
}

const getSearchResults = (searchResultData, state, dispatch) => {
	return _.map(searchResultData, (item, idx) => {
		return (
			<Card key={idx}
				item={item}
				idx={idx}
				state={state}
				dispatch={dispatch}
			/>
		);
	});
}

const handleDidYouMeanClicked = (didYouMean, state, dispatch) => {
	trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'SuggestionSelected', 'DidYouMean');
	setState(dispatch, { searchText: didYouMean, runSearch: true });
}

// const openDocument = (filename, cloneData, cloneName, pageNumber = 0) => {
// 	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction' , 'PDFOpen');
// 	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'filename', filename);
// 	window.open(`/#/pdfviewer/gamechanger?filename=${filename}&pageNumber=${pageNumber}&cloneIndex=${cloneData.clone_name}`);
// };

const renderRecentSearches = (search, state, dispatch) => {
	const {
		searchText,
		favorite,
		orgFilterString,
		publicationDateAllTime,
		publicationDateFilter,
		typeFilterString,
		includeRevoked,
		run_at
	} = search;
	return (
		<RecentSearchContainer onClick={()=>{
			const orgFilters = {...state.searchSettings.orgFilter}
			if(orgFilterString.length>1){
				Object.keys(orgFilters).forEach(key=>{
					if(orgFilterString.includes(key)){
						orgFilters[key] = true;
					} else {
						orgFilters[key] = false;
					}
				})
			}
			const currSearchSettings = {
				...state.searchSettings,
				orgFilter: orgFilters,
				specificOrgsSelected: orgFilterString.length>0,
				allOrgsSelected: orgFilterString.length===0,
				publicationDateAllTime,
				publicationDateFilter,
				includeRevoked
			}
			setState(dispatch,{
				searchText,
				runSearch:true,
				searchSettings:currSearchSettings
			})}}>
			<div style={{display:'flex', justifyContent:'space-between'}}>
				<Typography style={styles.containerText}>{searchText}</Typography>
				<i className={favorite ? "fa fa-star" : "fa fa-star-o"} style={{
					color: favorite ? "#E9691D" : 'rgb(224, 224, 224)',
					cursor: "pointer",
					fontSize: 20
				}} />
			</div>
			<Typography style={styles.subtext}>Organization Filter:{orgFilterString.length===0? 'All' : orgFilterString.join(', ')}</Typography>
			<Typography style={styles.subtext}>Type Filter:{typeFilterString.length===0? 'All' : typeFilterString.join(', ')}</Typography>
			<Typography style={styles.subtext}>Publication Date:{publicationDateAllTime? 'All': publicationDateFilter.join(' - ')}</Typography>
			<Typography style={styles.subtext}>Include Canceled: {includeRevoked ? 'Yes': 'No'}</Typography>
			<Typography style={styles.subtext}>Search Time: {run_at}</Typography>
		</RecentSearchContainer>
	)
}

const PolicyMainViewHandler = {
	async handlePageLoad(props) {

		const { state, dispatch } = props;
		await defaultMainViewHandler.handlePageLoad(props);
		let topics = [];
		let pubs = [];
		try {
			const { data } = await gameChangerAPI.getHomepageEditorData();
			data.forEach(obj => {
				if(obj.key === 'homepage_topics'){
					topics = JSON.parse(obj.value);
				} else if(obj.key === 'homepage_major_pubs') {
					pubs = JSON.parse(obj.value);
				}
			});

		} catch(e){
			// Do nothing
		}
		
		setState(dispatch, {adminTopics:topics});

		try {
			const pngs = await gameChangerAPI.thumbnailStorageDownloadPOST({filenames: pubs, folder: 'thumbnails'});
			const buffers = pngs.data
			buffers.forEach((buf,idx) => {
				pubs[idx].imgSrc = 'data:image/png;base64,'+ buf;
			})
			
		} catch(e) {
			//Do nothing
		}
		
		setState(dispatch, {adminMajorPubs: pubs});

		try {
			let crawlerSources = await gameChangerAPI.gcCrawlerSealData();
			crawlerSources = crawlerSources.data;
			const thumbnailList = crawlerSources.map(item => {
				let filename = item.image_link.split('/').pop();
				filename = filename.substring(0, filename.lastIndexOf('.')) || filename;
				return {name: filename}
			});
			const pngs = await gameChangerAPI.thumbnailStorageDownloadPOST({filenames: thumbnailList, folder: 'crawler_images'});
			const buffers = pngs.data
			buffers.forEach((buf,idx) => {
				crawlerSources[idx].imgSrc = 'data:image/png;base64,'+ buf;
			});
			setState(dispatch, {crawlerSources});
		} catch(e) {
			//Do nothing
			console.log(e)
		}
	},
	
	getMainView(props) {
		return defaultMainViewHandler.getMainView(props);
	},
	
	handleCategoryTabChange(props) {
		defaultMainViewHandler.handleCategoryTabChange(props);
	},
	
	getViewNames(props) {
		const viewNames = defaultMainViewHandler.getViewNames(props);
		viewNames.push(
			{name: 'Graph', title: 'Graph View', id: 'gcOpenGraphView'}
		);
		return viewNames;
	},

	renderHideTabs(props) {
		const { state, dispatch, searchHandler } = props;
		const {
			adminTopics,
			adminMajorPubs,
			cloneData,
			crawlerSources,
			prevSearchText,
			resetSettingsSwitch,
			didYouMean,
			loading,
			userData,
			recentSearches,
		} = state;

		const showDidYouMean = didYouMean && !loading;
		// get trending from gamechanger, change it back when we move to main.
		// const trendingStorage = localStorage.getItem(`trending${cloneData.clone_name}Searches`) || '[]';
		const trendingStorage = localStorage.getItem(`trending${'gamechanger'}Searches`) || '[]';

		if(prevSearchText) {
			if(!resetSettingsSwitch) {
				dispatch({type: 'RESET_SEARCH_SETTINGS'});
				setState(dispatch, {resetSettingsSwitch: true, showSnackbar: true, snackBarMsg: 'Search settings reset'});
				if (searchHandler) searchHandler.setSearchURL(state)
			}
		}

		const { 
			favorite_topics = [],
			favorite_searches = [] }
		= userData;
		
		// const agencyPublications = ['Department of the United States Army', 'Department of the United States Navy', 'Department of the United States Marine Corp', 'Department of United States Air Force']


		let trendingLinks = [];
		if (trendingStorage) {
			JSON.parse(trendingStorage).forEach(search => {
				if (search.search) {
					trendingLinks.push({search:search.search.replaceAll('&#039;', '"'), count: search.count, favorite: false});
				}
			});
		}

		trendingLinks.forEach(({search},idx) => {
			favorite_searches.forEach(fav => {
				if(fav.search_text === search){
					trendingLinks[idx].favorite = true;
				}
			})
		});

		recentSearches.forEach((search,idx) => {
			favorite_searches.forEach(fav => {
				recentSearches[idx].favorite = fav.tiny_url === search.tiny_url;
			});
		});

		adminTopics.forEach((topic,idx)=> {
			favorite_topics.forEach(fav => {
				adminTopics[idx].favorite = topic.name.toLowerCase() === fav.topic_name.toLowerCase();
			})
		})

		return(
			<div style={{marginTop: '40px'}}>
				{prevSearchText &&
					<div style={{ margin: '10px auto', width: '67%' }}>
						<div style={styles.resultsCount}><p style={{fontWeight:'normal', display:'inline'}}>Looks like we don't have any matches for </p>"{prevSearchText}"</div>
					</div>
				}
				{showDidYouMean && (
					<div style={{ margin: '10px auto', fontSize: '25px', width: '67%', paddingLeft: 'auto'}}>
						Did you mean <DidYouMean onClick={()=>handleDidYouMeanClicked(didYouMean, state, dispatch)}>{didYouMean}</DidYouMean>?
					</div>
				)}
				<div style={{ margin: '0 70px 0 70px'}}>
					{/* <GameChangerThumbnailRow
						links={agencyPublications}
						title={"Agency Publications"}
						width='450px'
					>
						{agencyPublications.map(pub => 
							<AgencyPublicationContainer>
								<div style={{width:180, height:100}}/>
								<Typography style={{...styles.containerText, color:'#313541', marginLeft: 20, marginTop: 35}}>{pub}</Typography>
							</AgencyPublicationContainer>
						)}
					</GameChangerThumbnailRow> */}
					<GameChangerThumbnailRow
						links={adminTopics}
						title={"Editor's Choice: Top Topics"}
						width='300px'
					>
						{adminTopics.map(({name, favorite})=>
							<TrendingSearchContainer 
								style={{backgroundColor: '#E6ECF4'}} 
								onClick={() => {
									trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'TopicOpened', name)
									window.open(`#/gamechanger-details?cloneName=${cloneData.clone_name}&type=topic&topicName=${name.toLowerCase()}`);
								}}
							>
								<div style={{display:'flex', justifyContent:'space-between'}}>
									<Typography style={styles.containerText}>{name}</Typography>
									<i className={favorite ? "fa fa-star" : "fa fa-star-o"} style={{
										color: favorite ? "#E9691D" : 'rgb(224,224,224)',
										cursor: "pointer",
										fontSize: 20
									}} />
								</div>
							</TrendingSearchContainer>
						)}
					</GameChangerThumbnailRow>
					<GameChangerThumbnailRow
						links={trendingLinks}
						title={"Trending Searches"}
						width='300px'
					>
						{trendingLinks.map(({search, favorite, count},idx)=>
							<TrendingSearchContainer onClick={()=>setState(dispatch,{searchText:search, runSearch:true})}>
								<div style={{display:'flex', justifyContent:'space-between'}}>
									<Typography style={styles.containerText}>{`#${idx+1} ${search}`}</Typography>
									<i className={favorite ? "fa fa-star" : "fa fa-star-o"} style={{
										color: favorite ? "#E9691D" : 'rgb(224, 224, 224)',
										cursor: "pointer",
										fontSize: 20
									}} />
								</div>
								<Typography style={styles.subtext}>
									<i className="fa fa-search" style={{width:16, height:15}}/> 
									{`${count} searches this week`}
								</Typography>
							</TrendingSearchContainer>
						)}
					</GameChangerThumbnailRow>
					<GameChangerThumbnailRow 
						links={crawlerSources} 
						title="Sources" 
						width='300px'
					>
						{crawlerSources.map(source => 
							<SourceContainer>
								{/* <div style={{width:100, height:100}}/> */}
								<img src={source.imgSrc}></img>
								<Typography style={{...styles.containerText, color:'#313541', marginLeft: 20, marginTop: 25}}>{source.display_source_s}</Typography>
							</SourceContainer>
						)}
					</GameChangerThumbnailRow>
					<GameChangerThumbnailRow 
						links={recentSearches} 
						title="Recent Searches" 
						width='460px'
					>
						{recentSearches.map((search) => renderRecentSearches(search, state, dispatch))}
					</GameChangerThumbnailRow>
					<GameChangerThumbnailRow 
						links={adminMajorPubs} 
						title="Editor's Choice: Top Publications" 
						width='180px' 
					>
						{adminMajorPubs.map(({name, imgSrc}) =>
							<div className="topPublication"
							>
								<img 
									className="image"
									src={imgSrc}
									alt="thumbnail" 
									title={name}
								/>
								<div 
									className="hover-overlay"
									onClick={()=>{
										trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'PublicationOpened', name)
										// window.open(`/#/pdfviewer/gamechanger?filename=${name}&pageNumber=${1}&isClone=${true}&cloneIndex=${cloneData.clone_name}`)
										window.open(`#/gamechanger-details?cloneName=${cloneData.clone_name}&type=document&documentName=${name.toLowerCase()}`);
									}}
								>
									<div className="hover-text">{name}</div>
								</div>
							</div>
						)}
					</GameChangerThumbnailRow>
				</div>
			</div>
		);
	},
	
	getExtraViewPanels(props) {
		const {
			context
		} = props;
		
		const {state} = context;
		
		const viewPanels = defaultMainViewHandler.getExtraViewPanels(props);
		viewPanels.push({panelName: 'Graph', panel:
			<div key={'graphView'}>
				{!state.loading &&
					<StyledCenterContainer showSideFilters={state.showSideFilters}>
						{state.showSideFilters &&
							<div className={'left-container'}>
								<div className={'side-bar-container'}>
									<div className={'filters-container sidebar-section-title'}>FILTERS</div>
									<GameChangerSearchMatrix context={context} />
									{state.sidebarDocTypes.length > 0 && state.sidebarOrgs.length > 0 &&
										<>
											<div className={'sidebar-section-title'}>RELATED</div>
											<GameChangerSideBar context={context} cloneData={state.cloneData} />
										</>
									}
								</div>
							</div>
						}
						<div className={'right-container'}>
							<DefaultGraphView context={context}/>
						</div>
					</StyledCenterContainer>
				}
			</div>
		});
		
		return viewPanels;
	},

	getCardViewPanel(props) {
		const { context } = props;
		const { state, dispatch } = context;
		const {
			activeCategoryTab,
			cloneData,
			componentStepNumbers,

			count,
			docSearchResults,
			resultsPage,
			docsLoading,
			docsPagination,

			entityCount,
			entitySearchResults,
			entityPage,

			topicCount,
			topicSearchResults,
			topicPage,

			hideTabs,
			iframePreviewLink,
			isCachedResult,
			loading,
			selectedCategories,
			showSideFilters,
			sidebarOrgs,
			sidebarDocTypes,
			timeSinceCache,
		} = state;


		let sideScroll = {
			height: '72vh'
		}
		if (!iframePreviewLink) sideScroll = {};
		const cacheTip = `Cached result from ${timeSinceCache>0 ? timeSinceCache + " hour(s) ago": "less than an hour ago"}`;

		return (
			<div key={'cardView'}>
				<div key={'cardView'} style={{marginTop: hideTabs ? 40 : 'auto'}}>
					<div>
						<div id="game-changer-content-top"/>
						{!loading &&
							<StyledCenterContainer showSideFilters={showSideFilters}>
								{showSideFilters &&
									<div className={'left-container'}>
										<div className={'side-bar-container'}>
											<GameChangerSearchMatrix context={context} />
											{sidebarDocTypes.length > 0 && sidebarOrgs.length > 0 &&
												<>
													<div className={'sidebar-section-title'}>RELATED</div>
													<GameChangerSideBar context={context} cloneData={cloneData} />
												</>
											}
										</div>
									</div>
								}
								<div className={'right-container'}>
									{!hideTabs && <ViewHeader {...props}/>}
									<div className={`row tutorial-step-${componentStepNumbers["Search Results Section"]} card-container`} style={{padding: 0}}>
										<div className={"col-xs-12"} style={{...sideScroll, padding: 0}}>
											<div className="row" style={{ marginLeft: 0, marginRight: 0, padding: 0 }}>
												{!loading && <GetQAResults context={context} />}
											</div>
											{!loading && (activeCategoryTab === 'Documents' || activeCategoryTab === 'all') && selectedCategories['Documents'] &&
												<div className={"col-xs-12"} style={{marginTop: 10, marginLeft: 0, marginRight: 0}}>
													<SearchSection
														section={'Documents'}
														color={'#131E43'}
													>
														{activeCategoryTab === 'all' ? <>
															{!docsLoading && !docsPagination ?
																getSearchResults(docSearchResults, state, dispatch) :
																<div className='col-xs-12'>
																	<LoadingIndicator customColor={gcOrange} />
																</div>
															}
															<div className='col-xs-12 text-center'>
																<Pagination
																	activePage={resultsPage}
																	itemsCountPerPage={RESULTS_PER_PAGE}
																	totalItemsCount={count}
																	pageRangeDisplayed={8}
																	onChange={async page => {
																		trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'PaginationChanged', 'page', page);
																		setState(dispatch, { docsLoading: true, resultsPage: page, docsPagination: true });
																	}}/>

															</div>
															</>
															:
															<>
																{
																	getSearchResults(docSearchResults, state, dispatch)
															
																}
																{
																	docsPagination  && 
																	<div className='col-xs-12'>
																		<LoadingIndicator customColor={gcOrange} containerStyle={{margin:'-100px auto'}}/>
																	</div>
																}
															</>
														}
													</SearchSection>
												</div>}
												
												{entitySearchResults && entitySearchResults.length > 0 && (activeCategoryTab === 'Organizations' || activeCategoryTab === 'all') && selectedCategories['Organizations'] &&
													<div className={"col-xs-12"} style={{marginTop: 10, marginLeft: 0, marginRight: 0}}>
														<SearchSection
														section={'Organizations'}
														color={'#376f94'}
														>
															{getSearchResults(entitySearchResults, state, dispatch)}
															<div className='col-xs-12 text-center'>
																<Pagination
																	activePage={entityPage}
																	itemsCountPerPage={RESULTS_PER_PAGE}
																	totalItemsCount={entityCount}
																	pageRangeDisplayed={8}
																	onChange={async page => {
																		trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'PaginationChanged', 'page', page);
																		setState(dispatch, {entitiesLoading: true, entityPage: page, entityPagination: true });
																	}}/>
															</div>
														</SearchSection>
													</div>
												}

												{topicSearchResults && topicSearchResults.length > 0 && (activeCategoryTab === 'Topics' || activeCategoryTab === 'all') && selectedCategories['Topics'] &&
													<div className={"col-xs-12"} style={{marginTop: 10, marginLeft: 0, marginRight: 0}}>
														<SearchSection
														section={'Topics'}
														color={'#4da593'}
														>
															{getSearchResults(topicSearchResults, state, dispatch)}
															<div className='col-xs-12 text-center'>
																<Pagination
																	activePage={topicPage}
																	itemsCountPerPage={RESULTS_PER_PAGE}
																	totalItemsCount={topicCount}
																	pageRangeDisplayed={8}
																	onChange={async page => {
																		trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'PaginationChanged', 'page', page);
																		// setState(dispatch, {entitiesLoading: true, entityPage: page, entityPagination: true });
																	}}/>
															</div>
														</SearchSection>
													</div>
												}								
										</div>
									</div>
								</div>
							</StyledCenterContainer>
						}
						{isCachedResult &&
							<div style={styles.cachedResultIcon}>
								<GCTooltip title={cacheTip} placement="right" arrow>
									<i style={{cursor: 'pointer'}} className="fa fa-bolt fa-2x"/>
								</GCTooltip>
							</div>
						}
						{Permissions.isGameChangerAdmin() && !loading &&
							<div style={styles.cachedResultIcon}>
								<i style={{cursor: 'pointer'}} className="fa fa-rocket" onClick={() => setState(dispatch, { showEsQueryDialog: true })}/>
							</div>
						}
					</div>
				</div>
			</div>
		)
	}
}

export default PolicyMainViewHandler;
