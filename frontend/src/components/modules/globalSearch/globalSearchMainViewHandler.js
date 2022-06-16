import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { styles } from '../../mainView/commonStyles';
import { renderHideTabs, getAboutUs } from '../../mainView/commonFunctions';
import { trackEvent } from '../../telemetry/Matomo';
import { getNonMainPageOuterContainer, setState } from '../../../utils/sharedFunctions';
import SearchSection from '../globalSearch/SearchSection';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { backgroundWhite } from '../../common/gc-colors';
import { Card } from '../../cards/GCCard';
import Pagination from 'react-js-pagination';
import {
	getTrackingNameForFactory,
	PAGE_DISPLAYED,
	RESULTS_PER_PAGE,
	StyledCenterContainer,
} from '../../../utils/gamechangerUtils';
import { Typography } from '@material-ui/core';
import './globalSearch.css';
import ResultView from '../../mainView/ResultView';
import AppsIcon from '@material-ui/icons/Apps';
import ListIcon from '@material-ui/icons/List';
import GCButton from '../../common/GCButton';
import ApplicationsIcon from '../../../images/icon/slideout-menu/applications icon.png';
import DashboardsIcon from '../../../images/icon/slideout-menu/dashboard icon.png';
import DatabasesIcon from '../../../images/icon/slideout-menu/database icon.png';
import DataSourcesIcon from '../../../images/icon/slideout-menu/resources icon.png';
import SearchHandlerFactory from '../../factories/searchHandlerFactory';

const PRIMARY_COLOR = '#13A792';

const getViewHeader = (state, dispatch) => {
	return (
		<div style={styles.showingResultsRow}>
			{state.searchText &&
				(!state.applicationsLoading ||
					!state.dashboardsLoading ||
					!state.dataSourcesLoading ||
					!state.databasesLoading ||
					!state.modelsLoading) && (
					<>
						<Typography variant="h3" style={{ ...styles.text, margin: '20px 15px' }}>
							Showing results for <b>{state.searchText}</b>
						</Typography>
						<div className={`tutorial-step-${state.componentStepNumbers['Tile Buttons']}`}>
							<div style={{ ...styles.container, margin: '0px 25px' }}>
								<GCButton
									onClick={() => setState(dispatch, { listView: false })}
									style={{
										...styles.buttons,
										...(!state.listView ? styles.unselectedButton : {}),
									}}
									textStyle={{ color: !state.listView ? backgroundWhite : '#8091A5' }}
									buttonColor={!state.listView ? PRIMARY_COLOR : backgroundWhite}
									borderColor={!state.listView ? PRIMARY_COLOR : '#B0B9BE'}
								>
									<div>
										<AppsIcon style={styles.icon} />
									</div>
								</GCButton>

								<GCButton
									onClick={() => setState(dispatch, { listView: true })}
									style={{
										...styles.buttons,
										...(!state.listView ? {} : styles.unselectedButton),
									}}
									textStyle={{ color: !state.listView ? '#8091A5' : backgroundWhite }}
									buttonColor={!state.listView ? backgroundWhite : PRIMARY_COLOR}
									borderColor={!state.listView ? '#B0B9BE' : PRIMARY_COLOR}
								>
									<div>
										<ListIcon style={styles.icon} />
									</div>
								</GCButton>
							</div>
						</div>
					</>
				)}
		</div>
	);
};

const getSearchResults = (searchResultData, state, dispatch) => {
	return _.map(searchResultData, (item, idx) => {
		return <Card key={idx} item={item} idx={idx} state={state} dispatch={dispatch} />;
	});
};

const handlePageLoad = async (props) => {
	const { state, dispatch, searchHandler, gameChangerAPI } = props;

	gameChangerAPI.updateClonesVisited(state.cloneData.clone_name);

	const parsedURL = searchHandler.parseSearchURL(state);

	if (parsedURL.searchText) {
		const newState = { ...state, ...parsedURL, runSearch: true };
		setState(dispatch, newState);

		searchHandler.setSearchURL(newState);
	}

	// Get User Favorites from home App
	const { data } = await gameChangerAPI.getUserFavoriteHomeApps();
	setState(dispatch, { favoriteApps: data.favorite_apps || [] });
};

const getMainView = (props) => {
	const { state, dispatch, pageLoaded, getViewPanels, renderHideTabs } = props;

	const {
		loading,
		viewNames,
		applicationsTotalCount,
		dashboardsTotalCount,
		dataSourcesTotalCount,
		databasesTotalCount,
		modelsTotalCount,
		searchText,
	} = state;

	const noResults = Boolean(
		!applicationsTotalCount &&
			!dashboardsTotalCount &&
			!dataSourcesTotalCount &&
			!databasesTotalCount &&
			!modelsTotalCount
	);

	const hideSearchResults = noResults && !loading && !searchText;
	const noSearchResults = noResults && !loading && searchText;

	return (
		<div style={styles.tabButtonContainer}>
			<div key={'cardView'}>
				<div key={'cardView'} style={{ marginTop: 'auto' }}>
					<div>
						<div id="game-changer-content-top" />
						<StyledCenterContainer showSideFilters={false}>
							<div className={'right-container'}>
								{hideSearchResults && renderHideTabs(props)}
								{noSearchResults && (
									<>
										<div style={{ margin: '40px auto', width: '67%' }}>
											<Typography>
												No results found for: <strong>{searchText}</strong>. Try refining your
												search terms.
											</Typography>
										</div>
										{renderHideTabs(props)}
									</>
								)}
								{!(hideSearchResults || noSearchResults) &&
									pageLoaded &&
									(applicationsTotalCount > 0 ||
									dashboardsTotalCount > 0 ||
									dataSourcesTotalCount > 0 ||
									databasesTotalCount > 0 ||
									modelsTotalCount > 0 ? (
										<>
											{getViewHeader(state, dispatch)}
											<div style={{ margin: '0 15px 0 5px' }}>
												<ResultView
													context={{ state, dispatch }}
													viewNames={viewNames}
													viewPanels={getViewPanels()}
												/>
											</div>
											<div style={styles.spacer} />
										</>
									) : (
										<div className="col-xs-12">
											<LoadingIndicator customColor={PRIMARY_COLOR} />
										</div>
									))}
							</div>
						</StyledCenterContainer>
					</div>
				</div>
			</div>
		</div>
	);
};

const getViewNames = (props) => {
	return [];
};

const getExtraViewPanels = (props) => {
	return [];
};

const getCardViewPanel = (props) => {
	const { context } = props;
	const { state, dispatch } = context;
	const {
		activeCategoryTab,
		componentStepNumbers,
		iframePreviewLink,
		selectedCategories,
		applicationsSearchResults,
		applicationsPage,
		applicationsLoading,
		applicationsPagination,
		dashboardsSearchResults,
		dashboardsPage,
		dashboardsLoading,
		dashboardsPagination,
		dataSourcesSearchResults,
		dataSourcesPage,
		dataSourcesLoading,
		dataSourcesPagination,
		databasesSearchResults,
		databasesPage,
		databasesLoading,
		databasesPagination,
		modelsSearchResults,
		modelsPage,
		modelsLoading,
		modelsPagination,
		modelsTotalCount,
		loading,
	} = state;

	const applications = applicationsSearchResults;
	const dashboards = dashboardsSearchResults;
	const dataSources = dataSourcesSearchResults;
	const databases = databasesSearchResults;
	const models = modelsSearchResults;

	let sideScroll = {
		height: '72vh',
	};
	if (!iframePreviewLink) sideScroll = {};

	return (
		<div
			className={`row tutorial-step-${componentStepNumbers['Search Results Section']} card-container`}
			style={{ marginTop: 0 }}
		>
			<div className={'col-xs-12'} style={{ ...sideScroll, padding: 0 }}>
				{applications?.length > 0 &&
					(activeCategoryTab === 'Applications' || activeCategoryTab === 'all') &&
					selectedCategories['Applications'] && (
						<div
							className={'col-xs-12'}
							style={state.listView ? styles.listViewContainer : styles.containerDiv}
						>
							<SearchSection section={'Applications'} color={'rgb(50, 18, 77)'} icon={ApplicationsIcon}>
								{!applicationsLoading && !applicationsPagination ? (
									getSearchResults(applications, state, dispatch)
								) : (
									<div className="col-xs-12">
										<LoadingIndicator customColor={PRIMARY_COLOR} />
									</div>
								)}
								<div className="gcPagination col-xs-12 text-center">
									<Pagination
										activePage={applicationsPage}
										itemsCountPerPage={RESULTS_PER_PAGE}
										totalItemsCount={state.applicationsTotalCount}
										pageRangeDisplayed={8}
										onChange={async (page) => {
											trackEvent(
												getTrackingNameForFactory(state.cloneData.clone_name),
												'PaginationChanged',
												'page',
												page
											);
											setState(dispatch, {
												applicationsLoading: true,
												applicationsPage: page,
												applicationsPagination: true,
											});
										}}
									/>
								</div>
							</SearchSection>
						</div>
					)}

				{dashboards?.length > 0 &&
					(activeCategoryTab === 'Dashboards' || activeCategoryTab === 'all') &&
					selectedCategories['Dashboards'] && (
						<div
							className={'col-xs-12'}
							style={state.listView ? styles.listViewContainer : styles.containerDiv}
						>
							<SearchSection section={'Dashboards'} color={'rgb(11, 167, 146)'} icon={DashboardsIcon}>
								{!dashboardsLoading && !dashboardsPagination ? (
									getSearchResults(dashboards, state, dispatch)
								) : (
									<div className="col-xs-12">
										<LoadingIndicator customColor={PRIMARY_COLOR} />
									</div>
								)}
								<div className="gcPagination col-xs-12 text-center">
									<Pagination
										activePage={dashboardsPage}
										itemsCountPerPage={RESULTS_PER_PAGE}
										totalItemsCount={state.dashboardsTotalCount}
										pageRangeDisplayed={8}
										onChange={async (page) => {
											trackEvent(
												getTrackingNameForFactory(state.cloneData.clone_name),
												'PaginationChanged',
												'page',
												page
											);
											setState(dispatch, {
												dashboardsLoading: true,
												dashboardsPage: page,
												dashboardsPagination: true,
											});
										}}
									/>
								</div>
							</SearchSection>
						</div>
					)}

				{dataSources?.length > 0 &&
					(activeCategoryTab === 'DataSources' || activeCategoryTab === 'all') &&
					selectedCategories['DataSources'] && (
						<div
							className={'col-xs-12'}
							style={state.listView ? styles.listViewContainer : styles.containerDiv}
						>
							<SearchSection section={'Data Sources'} color={'rgb(5, 159, 217)'} icon={DataSourcesIcon}>
								{!dataSourcesLoading && !dataSourcesPagination ? (
									getSearchResults(dataSources, state, dispatch)
								) : (
									<div className="col-xs-12">
										<LoadingIndicator customColor={PRIMARY_COLOR} />
									</div>
								)}
								<div className="gcPagination col-xs-12 text-center">
									<Pagination
										activePage={dataSourcesPage}
										itemsCountPerPage={RESULTS_PER_PAGE}
										totalItemsCount={state.dataSourcesTotalCount}
										pageRangeDisplayed={8}
										onChange={async (page) => {
											trackEvent(
												getTrackingNameForFactory(state.cloneData.clone_name),
												'PaginationChanged',
												'page',
												page
											);
											setState(dispatch, {
												dataSourcesLoading: true,
												dataSourcesPage: page,
												dataSourcesPagination: true,
											});
										}}
									/>
								</div>
							</SearchSection>
						</div>
					)}

				{databases?.length > 0 &&
					(activeCategoryTab === 'Databases' || activeCategoryTab === 'all') &&
					selectedCategories['Databases'] && (
						<div
							className={'col-xs-12'}
							style={state.listView ? styles.listViewContainer : styles.containerDiv}
						>
							<SearchSection section={'Databases'} color={'rgb(233, 105, 29)'} icon={DatabasesIcon}>
								{!databasesLoading && !databasesPagination ? (
									getSearchResults(databases, state, dispatch)
								) : (
									<div className="col-xs-12">
										<LoadingIndicator customColor={PRIMARY_COLOR} />
									</div>
								)}
								<div className="gcPagination col-xs-12 text-center">
									<Pagination
										activePage={databasesPage}
										itemsCountPerPage={RESULTS_PER_PAGE}
										totalItemsCount={state.databasesTotalCount}
										pageRangeDisplayed={8}
										onChange={async (page) => {
											trackEvent(
												getTrackingNameForFactory(state.cloneData.clone_name),
												'PaginationChanged',
												'page',
												page
											);
											setState(dispatch, {
												databasesLoading: true,
												databasesPage: page,
												databasesPagination: true,
											});
										}}
									/>
								</div>
							</SearchSection>
						</div>
					)}

				{models?.length > 0 &&
					(activeCategoryTab === 'Models' || activeCategoryTab === 'all') &&
					selectedCategories['Models'] && (
						<div
							className={'col-xs-12'}
							style={state.listView ? styles.listViewContainer : styles.containerDiv}
						>
							<SearchSection section={'Models'} color={'#131E43'} icon={DatabasesIcon}>
								{!modelsLoading && !modelsPagination ? (
									getSearchResults(models, state, dispatch)
								) : (
									<div className="col-xs-12">
										<LoadingIndicator customColor={PRIMARY_COLOR} />
									</div>
								)}
								<div className="gcPagination col-xs-12 text-center">
									<Pagination
										activePage={modelsPage}
										itemsCountPerPage={RESULTS_PER_PAGE}
										totalItemsCount={modelsTotalCount}
										pageRangeDisplayed={8}
										onChange={async (page) => {
											trackEvent(
												getTrackingNameForFactory(state.cloneData.clone_name),
												'PaginationChanged',
												'page',
												page
											);
											setState(dispatch, {
												modelsLoading: true,
												modelsPage: page,
												modelsPagination: true,
											});
										}}
									/>
								</div>
							</SearchSection>
						</div>
					)}

				{loading && (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={PRIMARY_COLOR} containerStyle={{ paddingTop: 100 }} />
					</div>
				)}
			</div>
		</div>
	);
};

const GlobalSearchMainViewHandler = (props) => {
	const { state, dispatch, cancelToken, setCurrentTime, gameChangerAPI } = props;

	const [pageLoaded, setPageLoaded] = useState(false);
	const [searchHandler, setSearchHandler] = useState();

	useEffect(() => {
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
		if (state.modelsPagination && searchHandler) {
			searchHandler.handleModelsPagination(state, dispatch);
		}
	}, [state, dispatch, searchHandler]);

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

	useEffect(() => {
		if (
			state.runningSearch &&
			!state.applicationsLoading &&
			!state.dashboardsLoading &&
			!state.dataSourcesLoading &&
			!state.databasesLoading &&
			!state.modelsLoading
		) {
			setState(dispatch, {
				categoryMetadata: {
					Applications: { total: state.applicationsTotalCount },
					Dashboards: { total: state.dashboardsTotalCount },
					DataSources: { total: state.dataSourcesTotalCount },
					Databases: { total: state.databasesTotalCount },
					Models: { total: state.modelsTotalCount },
					Documentation: { total: 0 },
					Organizations: { total: 0 },
					Services: { total: 0 },
				},
				runningSearch: false,
				loading: false,
			});
		}
	}, [
		state.runningSearch,
		state.applicationsLoading,
		state.dashboardsLoading,
		state.dataSourcesLoading,
		state.databasesLoading,
		state.modelsLoading,
		state.applicationsTotalCount,
		state.dashboardsTotalCount,
		state.dataSourcesTotalCount,
		state.databasesTotalCount,
		state.modelsTotalCount,
		state.loading,
		dispatch,
	]);

	const getViewPanels = () => {
		const viewPanels = { Card: getCardViewPanel({ context: { state, dispatch } }) };

		const extraViewPanels = getExtraViewPanels({ context: { state, dispatch } });
		extraViewPanels.forEach(({ panelName, panel }) => {
			viewPanels[panelName] = panel;
		});

		return viewPanels;
	};

	switch (state.pageDisplayed) {
		case PAGE_DISPLAYED.aboutUs:
			return getNonMainPageOuterContainer(getAboutUs, state, dispatch);
		case PAGE_DISPLAYED.main:
		default:
			return getMainView({
				state,
				dispatch,
				setCurrentTime,
				renderHideTabs,
				pageLoaded,
				getViewPanels,
			});
	}
};

export default GlobalSearchMainViewHandler;
