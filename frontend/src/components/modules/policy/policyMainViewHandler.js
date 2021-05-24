import React from "react";
import GameChangerSearchMatrix from "../../searchMetrics/GCSearchMatrix";
import GameChangerSideBar from "../../searchMetrics/GCSideBar";
import DefaultGraphView from "../../graph/defaultGraphView";
import defaultMainViewHandler from "../default/defaultMainViewHandler";
import ViewHeader from "../../mainView/ViewHeader";
import {trackEvent} from "../../telemetry/Matomo";
import { setState } from "../../../sharedFunctions";
import Permissions from "advana-platform-ui/dist/utilities/permissions";
import SearchSection from "../globalSearch/SearchSection";
import LoadingIndicator from "advana-platform-ui/dist/loading/LoadingIndicator";
import {gcOrange} from "../../common/gc-colors";
import {Card} from "../../cards/GCCard";
import Pagination from "react-js-pagination";
import GCTooltip from "../../common/GCToolTip";
import GetQAResults from '../default/qaResults';
import {
	getTrackingNameForFactory,
	RESULTS_PER_PAGE, StyledCenterContainer
} from "../../../gamechangerUtils";

import '../../../containers/gamechanger.css';

const _ = require('lodash');

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


const PolicyMainViewHandler = {
	getViewNames(props) {
		const viewNames = defaultMainViewHandler.getViewNames(props);
		viewNames.push(
			{name: 'Graph', title: 'Graph View', id: 'gcOpenGraphView'}
		);
		return viewNames;
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
								
									<div className={`row tutorial-step-${componentStepNumbers["Search Results Section"]} card-container`}>
										<div className={"col-xs-12"} style={{...sideScroll, padding: 0}}>
											<div className="row" style={{ marginLeft: 0, marginRight: 0 }}>
												{!loading && <GetQAResults context={context} />}
											</div>
											{!loading && (activeCategoryTab === 'Documents' || activeCategoryTab === 'all') && selectedCategories['Documents'] &&
												<div className={"col-xs-12"} style={{marginTop: 10, marginLeft: 0, marginRight: 0}}>
													<SearchSection
														section={'Documents'}
														color={'#131E43'}
													>
														{activeCategoryTab === 'all' ? <>
															{!docsLoading ? 
																getSearchResults(docSearchResults, state, dispatch) : 
																<div className='col-xs-12'>
																	<LoadingIndicator customColor={gcOrange} />
																</div>
															}
															<div className='gcPagination col-xs-12 text-center'>
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
																	docsPagination && <div className='col-xs-12'>
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
															<div className='gcPagination col-xs-12 text-center'>
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
															<div className='gcPagination col-xs-12 text-center'>
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
