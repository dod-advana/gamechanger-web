import React, { useEffect, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { getUserProfilePage } from '../../mainView/commonFunctions';
import { styles } from '../../mainView/commonStyles';
import ViewHeader from '../../mainView/ViewHeader';
import { Card } from '../../cards/GCCard';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import GameChangerSearchMatrix from '../../searchMetrics/GCSearchMatrix';
import { Typography } from '@material-ui/core';
import Pagination from 'react-js-pagination';
import '../../../containers/jbook.css';
import {
	getQueryVariable,
	getTrackingNameForFactory,
	PAGE_DISPLAYED,
	scrollToContentTop,
	StyledCenterContainer,
	getOrgToOrgQuery,
	getTypeQuery,
} from '../../../utils/gamechangerUtils';
import { trackEvent } from '../../telemetry/Matomo';
import {
	getNonMainPageOuterContainer,
	getSearchObjectFromString,
	getUserData,
	setState,
} from '../../../utils/sharedFunctions';
import './jbook.css';
import JBookWelcome from '../../aboutUs/JBookWelcomeModal';
import FeedbackModal from './jbookFeedbackModal';
import { handleTabClicked, populateDropDowns } from './jbookMainViewHelper';
import ResultView from '../../mainView/ResultView';
import GCButton from '../../common/GCButton';
import GCTooltip from '../../common/GCToolTip';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import SearchHandlerFactory from '../../factories/searchHandlerFactory';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';
import JBookUserDashboard from './userProfile/jbookUserDashboard';
import ExportResultsDialog from '../../export/ExportResultsDialog';

const _ = require('lodash');

export const GC_COLORS = {
	primary: '#1C2D65',
	secondary: '#E9691D',
};

const JBookAboutUs = LoadableVisibility({
	loader: () => import('../../aboutUs/JBookAboutUs'),
	loading: () => {
		return <LoadingIndicator customColor={GC_COLORS.secondary} />;
	},
});

const JBookSideBar = LoadableVisibility({
	loader: () => import('./jbookSideBar'),
	loading: () => {
		return <LoadingIndicator customColor={GC_COLORS.secondary} />;
	},
});

const getSearchResults = (searchResultData, state, dispatch, module = null) => {
	return _.map(searchResultData, (item, idx) => {
		item.type = 'document';
		return <Card key={idx} item={item} idx={idx} state={state} dispatch={dispatch} card_module={module} />;
	});
};

const handlePageLoad = async (props) => {
	const { dispatch, state, gameChangerAPI } = props;

	gameChangerAPI.updateClonesVisited(state.cloneData.clone_name);

	const { jbookSearchSettings, defaultOptions, dropdownData } = await populateDropDowns(state, dispatch);

	const url = window.location.href;
	const searchText = getQueryVariable('q', url) ?? '';
	let mainTabSelected = 0;

	// grab the portfolio data
	let portfolios = [];
	await gameChangerAPI
		.callDataFunction({
			functionName: 'getPortfolios',
			cloneName: 'jbook',
			options: {},
		})
		.then((data) => {
			portfolios = data.data !== undefined ? data.data : [];
		});

	// the main setstate that triggers the initial search
	setState(dispatch, {
		searchText,
		loading: true,
		runSearch: true,
		mainTabSelected,
		urlSearch: true,
		jbookSearchSettings,
		defaultOptions: { ...state.defaultOptions, ...defaultOptions },
		dropdownData,
		portfolios,
	});
};

const renderHideTabs = () => {
	return <></>;
};

const getMainView = (props) => {
	const { state, dispatch, getViewPanels, setCurrentTime, searchHandler } = props;

	const {
		exportDialogVisible,
		searchSettings,
		prevSearchText,
		selectedDocuments,
		loading,
		viewNames,
		edaSearchSettings,
		currentSort,
		currentOrder,
		currentViewName,
	} = state;
	const { allOrgsSelected, orgFilter, searchType, searchFields, allTypesSelected, typeFilter } = searchSettings;
	const isSelectedDocs = selectedDocuments && selectedDocuments.size ? true : false;

	return (
		<>
			{exportDialogVisible && (
				<ExportResultsDialog
					state={state}
					dispatch={dispatch}
					searchHandler={searchHandler}
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
					isClone={true}
					cloneData={state.cloneData}
					searchType={searchType}
					searchFields={searchFields}
					edaSearchSettings={edaSearchSettings}
					sort={currentSort}
					order={currentOrder}
				/>
			)}
			<FeedbackModal state={state} dispatch={dispatch} />
			<JBookWelcome dispatch={dispatch} state={state} />
			{loading &&
				currentViewName === undefined && ( // initial loading indicator when site has not populated yet
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={GC_COLORS.primary} />
					</div>
				)}
			<div style={{ ...styles.tabButtonContainer, backgroundColor: '#ffffff', paddingTop: 20 }}>
				<ResultView context={{ state, dispatch }} viewNames={viewNames} viewPanels={getViewPanels()} />
				<div style={styles.spacer} />
			</div>
		</>
	);
};

const getViewNames = (_props) => {
	return [{ name: 'Card', title: 'Card View', id: 'gcCardView' }];
};

const getExtraViewPanels = (_props) => {
	return [];
};

const getSideFilters = (context, cloneData, showSideFilters, expansionDict) => {
	return (
		showSideFilters && (
			<div className={'left-container'}>
				<div className={'side-bar-container'} data-cy="jbook-filters">
					<GameChangerSearchMatrix context={context} />
					{expansionDict && Object.keys(expansionDict).length > 0 && (
						<>
							<div className={'sidebar-section-title'} style={{ marginLeft: 5 }}>
								RELATED
							</div>
							<JBookSideBar context={context} cloneData={cloneData} />
						</>
					)}
				</div>
			</div>
		)
	);
};

const getPagination = (state, dispatch, edaCloneData, edaLoading, edaSearchResults, edaResultsPage, edaCount) => {
	return (
		(Permissions.permissionValidator(`${edaCloneData.clone_name} Admin`, true) ||
			Permissions.permissionValidator(`View ${edaCloneData.clone_name}`, true)) && (
			<>
				{edaLoading && (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={GC_COLORS.primary} />
					</div>
				)}
				{!edaLoading && (
					<div className="row" style={{ padding: 5 }}>
						{getSearchResults(
							edaSearchResults ? edaSearchResults : [],
							state,
							dispatch,
							edaCloneData.card_module
						)}
						<div className="jbookPagination col-xs-12 text-center">
							<Pagination
								activePage={edaResultsPage}
								itemsCountPerPage={18}
								totalItemsCount={edaCount}
								pageRangeDisplayed={8}
								onChange={(page) => {
									trackEvent(
										getTrackingNameForFactory(edaCloneData.clone_name),
										'PaginationChanged',
										'page',
										page
									);
									setState(dispatch, {
										edaResultsPage: page,
										runSearch: true,
										edaPaginationSearch: true,
									});
									scrollToContentTop();
								}}
							/>
						</div>
					</div>
				)}
			</>
		)
	);
};

const getCardViewPanel = (props) => {
	const { context } = props;
	const { state, dispatch } = context;
	const {
		componentStepNumbers,
		count,
		resultsPage,
		hideTabs,
		iframePreviewLink,
		showSideFilters,
		rawSearchResults,
		mainTabSelected,
		runningSearch,
		edaSearchResults,
		edaLoading,
		edaCloneData,
		edaResultsPage,
		edaCount,
		expansionDict,
		cloneData,
	} = state;

	const sideScroll = !iframePreviewLink
		? {}
		: {
				height: '72vh',
		  };

	return (
		<div key={'cardView'} className={'jbook-main-view'}>
			<div key={'cardView'} style={{ marginTop: hideTabs ? 40 : 'auto' }}>
				<div id="game-changer-content-top" />

				<StyledCenterContainer showSideFilters={showSideFilters}>
					{getSideFilters(context, cloneData, showSideFilters, expansionDict)}

					<div className={'right-container'}>
						<div className={'top-container'} style={{ marginLeft: 10 }}>
							<div>
								{!hideTabs && <ViewHeader {...props} extraStyle={{ marginRight: -15, marginTop: 5 }} />}
							</div>
						</div>
						<div
							className={`row tutorial-step-${componentStepNumbers['Search Results Section']} card-container`}
							style={{ padding: 0 }}
						>
							<div className={'col-xs-12'} style={{ ...sideScroll, padding: 0 }}>
								<div
									className={'col-xs-12'}
									style={{ ...sideScroll, padding: 0, position: 'relative' }}
								>
									<GCTooltip
										title="View JBOOK Search Summary Analytics available on our Qlik Dashboard"
										placement="bottom"
										arrow
									>
										<GCButton
											buttonColor={'rgb(28, 45, 101)'}
											style={{ position: 'absolute', right: 15, top: 5 }}
											onClick={() => {
												window.open(
													'https://qlik.advana.data.mil/sense/app/629bd685-187f-48bc-b66e-59787d8f6a9e/sheet/c8a85d97-1198-4185-8d55-f6306b2a13c8/state/analysis'
												);
											}}
										>
											Budget Insights & Dashboards
										</GCButton>
									</GCTooltip>
									<Tabs selectedIndex={mainTabSelected ?? 0}>
										<div
											style={{
												...styles.tabButtonContainer,
												backgroundColor: '#ffffff',
												paddingTop: 20,
												background: 'transparent',
											}}
										>
											<TabList style={styles.tabsList}>
												<div style={{ flex: 1, display: 'flex' }}>
													<Tab
														style={{
															...styles.tabStyle,
															...(mainTabSelected === 0 ? styles.tabSelectedStyle : {}),
															borderRadius: `5px 5px 0 0`,
														}}
														title="summaryFAQ"
														onClick={() => handleTabClicked(dispatch, state, 0)}
													>
														<Typography variant="h6" display="inline" title="jbookSearch">
															JBOOK SEARCH ({count})
														</Typography>
													</Tab>
													{(Permissions.permissionValidator(
														`${edaCloneData.clone_name} Admin`,
														true
													) ||
														Permissions.permissionValidator(
															`View ${edaCloneData.clone_name}`,
															true
														)) && (
														<Tab
															style={{
																...styles.tabStyle,
																...(mainTabSelected === 1
																	? styles.tabSelectedStyle
																	: {}),
																borderRadius: `5px 5px 0 0`,
															}}
															title="reviewerChecklist"
															onClick={() => handleTabClicked(dispatch, state, 1)}
														>
															<Typography
																variant="h6"
																display="inline"
																title="contractSearch"
															>
																CONTRACT SEARCH
															</Typography>
														</Tab>
													)}
												</div>
											</TabList>

											<div style={styles.panelContainer}>
												<TabPanel>
													{runningSearch && (
														<div style={{ margin: '0 auto' }} data-cy="jbook-search-load">
															<LoadingIndicator customColor={GC_COLORS.primary} />
														</div>
													)}
													{!runningSearch && (
														<div
															className="row"
															style={{ padding: 5 }}
															data-cy="jbook-search-results"
														>
															{getSearchResults(
																rawSearchResults ? rawSearchResults : [],
																state,
																dispatch
															)}
															<div
																className="jbookPagination col-xs-12 text-center"
																style={{ marginTop: 10 }}
															>
																<div
																	className="jbookPagination col-xs-12 text-center"
																	style={{ marginTop: 10 }}
																>
																	<Pagination
																		activePage={resultsPage}
																		itemsCountPerPage={18}
																		totalItemsCount={count}
																		pageRangeDisplayed={8}
																		onChange={(page) => {
																			trackEvent(
																				getTrackingNameForFactory(
																					cloneData.clone_name
																				),
																				'PaginationChanged',
																				'page',
																				page
																			);
																			setState(dispatch, {
																				resultsPage: page,
																				runSearch: true,
																				loading: true,
																				paginationSearch: true,
																			});
																			scrollToContentTop();
																		}}
																	/>
																</div>
															</div>
														</div>
													)}
												</TabPanel>
												<TabPanel>
													{getPagination(
														state,
														dispatch,
														edaCloneData,
														edaLoading,
														edaSearchResults,
														edaResultsPage,
														edaCount
													)}
												</TabPanel>
											</div>
										</div>
									</Tabs>
								</div>
							</div>
						</div>
					</div>
				</StyledCenterContainer>
			</div>
		</div>
	);
};

const getAboutUs = (props) => {
	const { state, dispatch } = props;
	return (
		<>
			<FeedbackModal state={state} dispatch={dispatch} />
			<JBookAboutUs />
		</>
	);
};

const displayUserRelatedItems = (props) => {
	const { state, dispatch } = props;
	return (
		<>
			<FeedbackModal state={state} dispatch={dispatch} />
			<JBookUserDashboard />
		</>
	);
};

const JBookMainViewHandler = (props) => {
	const { state, dispatch, cancelToken, setCurrentTime, gameChangerUserAPI, gameChangerAPI } = props;

	const [pageLoaded, setPageLoaded] = useState(false);
	const [searchHandler, setSearchHandler] = useState();

	// handle pagination being clicked
	useEffect(() => {
		if (state.docsPagination && searchHandler) {
			setState(dispatch, {
				docsPagination: false,
			});
			searchHandler.handleSearch(state, dispatch, state.replaceResults);
		}
	}, [state, dispatch, searchHandler]);

	// handle page load
	useEffect(() => {
		if (state.cloneDataSet && state.historySet && !pageLoaded) {
			const searchFactory = new SearchHandlerFactory(state.cloneData.search_module);
			const tmpSearchHandler = searchFactory.createHandler();

			setSearchHandler(tmpSearchHandler);

			handlePageLoad({
				state,
				dispatch,
				history: state.history,
				searchHandler: tmpSearchHandler,
				cancelToken,
				gameChangerAPI,
			});
			setState(dispatch, { viewNames: getViewNames({ cloneData: state.cloneData }) });
			setPageLoaded(true);
		}
	}, [cancelToken, dispatch, gameChangerAPI, pageLoaded, state]);

	const getViewPanels = () => {
		const viewPanels = { Card: getCardViewPanel({ context: { state, dispatch }, gameChangerAPI, searchHandler }) };

		const extraViewPanels = getExtraViewPanels({ context: { state, dispatch } });
		extraViewPanels.forEach(({ panelName, panel }) => {
			viewPanels[panelName] = panel;
		});

		return viewPanels;
	};

	switch (state.pageDisplayed) {
		case PAGE_DISPLAYED.userDashboard:
			return getNonMainPageOuterContainer(
				getUserProfilePage(displayUserRelatedItems(props), gameChangerUserAPI),
				state,
				dispatch,
				searchHandler
			);
		case PAGE_DISPLAYED.aboutUs:
			return getNonMainPageOuterContainer(getAboutUs(props), state, dispatch);
		case PAGE_DISPLAYED.main:
		default:
			return getMainView({
				state,
				dispatch,
				setCurrentTime,
				renderHideTabs,
				pageLoaded,
				getViewPanels,
				searchHandler,
			});
	}
};

export default JBookMainViewHandler;
