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

const dataLoading = (state) => {
	return (
		!state.applicationsLoading ||
		!state.dashboardsLoading ||
		!state.dataSourcesLoading ||
		!state.databasesLoading ||
		!state.modelsLoading
	);
};

const getHeaderStyles = (view) => {
	return {
		textStyle: { color: view ? backgroundWhite : '#8091A5' },
		buttonColor: view ? PRIMARY_COLOR : backgroundWhite,
		borderColor: view ? PRIMARY_COLOR : '#B0B9BE',
	};
};

const getViewHeader = (state, dispatch) => {
	let gridView, listView, showFavorites;

	if (state.showFavorites) {
		gridView = false;
		listView = false;
		showFavorites = true;
	} else if (state.listView) {
		gridView = false;
		listView = true;
		showFavorites = false;
	} else {
		gridView = true;
		listView = false;
		showFavorites = false;
	}

	return (
		<div style={styles.showingResultsRow}>
			{state.searchText && dataLoading(state) && (
				<>
					<Typography variant="h3" style={{ ...styles.text, margin: '20px 15px' }}>
						Showing results for <b>{state.searchText}</b>
					</Typography>
					<div className={`tutorial-step-${state.componentStepNumbers['Tile Buttons']}`}>
						<div style={{ ...styles.container, margin: '0px 25px' }}>
							<GCButton
								onClick={() => setState(dispatch, { listView: false, showFavorites: false })}
								style={{
									...styles.buttons,
									...(!gridView ? styles.unselectedButton : {}),
								}}
								textStyle={getHeaderStyles(gridView)['textStyle']}
								buttonColor={getHeaderStyles(gridView)['buttonColor']}
								borderColor={getHeaderStyles(gridView)['borderColor']}
							>
								<div>
									<AppsIcon style={styles.icon} />
								</div>
							</GCButton>

							<GCButton
								onClick={() => setState(dispatch, { listView: true, showFavorites: false })}
								style={{
									...styles.buttons,
									...(!listView ? styles.unselectedButton : {}),
								}}
								textStyle={getHeaderStyles(listView)['textStyle']}
								buttonColor={getHeaderStyles(listView)['buttonColor']}
								borderColor={getHeaderStyles(listView)['borderColor']}
							>
								<div>
									<ListIcon style={styles.icon} />
								</div>
							</GCButton>

							<GCButton
								onClick={() => setState(dispatch, { showFavorites: true })}
								style={{
									...styles.buttons,
									...(!showFavorites ? styles.unselectedButton : {}),
									width: 170,
								}}
								textStyle={getHeaderStyles(showFavorites)['textStyle']}
								buttonColor={getHeaderStyles(showFavorites)['buttonColor']}
								borderColor={getHeaderStyles(showFavorites)['borderColor']}
							>
								<div style={{ display: 'flex' }}>
									<Typography
										style={{
											fontSize: 14,
											fontWeight: showFavorites ? 'bold' : 500,
											color: showFavorites ? backgroundWhite : '#8091A5',
										}}
									>
										Show Favorites
									</Typography>
									<i
										className={showFavorites ? 'fa fa-star' : 'fa fa-star-o'}
										style={{
											color: showFavorites ? backgroundWhite : '#B0B9BE',
											marginLeft: '5px',
											cursor: 'pointer',
											fontSize: 26,
											alignSelf: 'center',
										}}
									/>
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
	const favorites = await searchHandler.handleGetUserFavorites(data.favorite_apps, state);
	setState(dispatch, { favoriteApps: data.favorite_apps || [], favorites });
};

const getMainView = (props) => {
	const { state, dispatch, pageLoaded, getViewPanels, renderHideTabs: renderHideTabsInner } = props;

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
								{hideSearchResults && renderHideTabsInner(props)}
								{noSearchResults && (
									<>
										<div style={{ margin: '40px auto', width: '67%' }}>
											<Typography>
												No results found for: <strong>{searchText}</strong>. Try refining your
												search terms.
											</Typography>
										</div>
										{renderHideTabsInner(props)}
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

const getViewNames = (_props) => {
	return [];
};

const getExtraViewPanels = (_props) => {
	return [];
};

const getListViewStyle = (listView) => {
	return listView ? styles.listViewContainer : styles.containerDiv;
};

function renderItems({
	items,
	activePage,
	isLoading,
	isPaginating,
	totalCount,
	dispatch,
	itemCategory,
	categoryColor,
	categoryIcon,
	state,
}) {
	const { cloneData, activeCategoryTab, selectedCategories, listView } = state;

	return (
		<>
			{items?.length > 0 &&
				(activeCategoryTab === itemCategory || activeCategoryTab === 'all') &&
				selectedCategories[itemCategory] && (
					<div className={'col-xs-12'} style={getListViewStyle(listView)}>
						<SearchSection section={itemCategory} color={categoryColor} icon={categoryIcon}>
							{!isLoading && !isPaginating ? (
								getSearchResults(items, state, dispatch)
							) : (
								<div className="col-xs-12">
									<LoadingIndicator customColor={PRIMARY_COLOR} />
								</div>
							)}
							<div className="gcPagination col-xs-12 text-center">
								<Pagination
									activePage={activePage}
									itemsCountPerPage={RESULTS_PER_PAGE}
									totalItemsCount={totalCount}
									pageRangeDisplayed={8}
									onChange={async (page) => {
										trackEvent(
											getTrackingNameForFactory(cloneData.clone_name),
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
		</>
	);
}

const getCardViewPanel = (props) => {
	const { context } = props;
	const { state, dispatch } = context;
	const {
		componentStepNumbers,
		iframePreviewLink,
		applicationsSearchResults,
		applicationsPage,
		applicationsLoading,
		applicationsPagination,
		applicationsTotalCount,
		dashboardsSearchResults,
		dashboardsTotalCount,
		dashboardsPage,
		dashboardsLoading,
		dashboardsPagination,
		dataSourcesSearchResults,
		dataSourcesPage,
		dataSourcesLoading,
		dataSourcesPagination,
		dataSourcesTotalCount,
		databasesSearchResults,
		databasesPage,
		databasesLoading,
		databasesPagination,
		databasesTotalCount,
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

	let sideScroll = !iframePreviewLink
		? {}
		: {
				height: '72vh',
		  };

	return (
		<div
			className={`row tutorial-step-${componentStepNumbers['Search Results Section']} card-container`}
			style={{ marginTop: 0 }}
		>
			<div className={'col-xs-12'} style={{ ...sideScroll, padding: 0 }}>
				{renderItems({
					items: applications,
					activePage: applicationsPage,
					isLoading: applicationsLoading,
					isPaginating: applicationsPagination,
					totalCount: applicationsTotalCount,
					dispatch,
					itemCategory: 'Applications',
					categoryColor: 'rgb(50, 18, 77)',
					categoryIcon: ApplicationsIcon,
					state,
				})}

				{renderItems({
					items: dashboards,
					activePage: dashboardsPage,
					isLoading: dashboardsLoading,
					isPaginating: dashboardsPagination,
					totalCount: dashboardsTotalCount,
					dispatch,
					itemCategory: 'Dashboards',
					categoryColor: 'rgb(11, 167, 146)',
					categoryIcon: DashboardsIcon,
					state,
				})}

				{renderItems({
					items: dataSources,
					activePage: dataSourcesPage,
					isLoading: dataSourcesLoading,
					isPaginating: dataSourcesPagination,
					totalCount: dataSourcesTotalCount,
					dispatch,
					itemCategory: 'DataSources',
					categoryColor: 'rgb(5, 159, 217)',
					categoryIcon: DataSourcesIcon,
					state,
				})}

				{renderItems({
					items: databases,
					activePage: databasesPage,
					isLoading: databasesLoading,
					isPaginating: databasesPagination,
					totalCount: databasesTotalCount,
					dispatch,
					itemCategory: 'Databases',
					categoryColor: 'rgb(233, 105, 29)',
					categoryIcon: DatabasesIcon,
					state,
				})}

				{renderItems({
					items: models,
					activePage: modelsPage,
					isLoading: modelsLoading,
					isPaginating: modelsPagination,
					totalCount: modelsTotalCount,
					dispatch,
					itemCategory: 'Models',
					categoryColor: '#131E43',
					categoryIcon: DatabasesIcon,
					state,
				})}

				{loading && (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={PRIMARY_COLOR} containerStyle={{ paddingTop: 100 }} />
					</div>
				)}
			</div>
		</div>
	);
};

const handlePagination = (state, dispatch, searchHandler) => {
	if (searchHandler) {
		if (state.applicationsPagination) {
			searchHandler.handleApplicationsPagination(state, dispatch);
		}
		if (state.dashboardsPagination) {
			searchHandler.handleDashboardsPagination(state, dispatch);
		}
		if (state.dataSourcesPagination) {
			searchHandler.handleDataSourcesPagination(state, dispatch);
		}
		if (state.databasesPagination) {
			searchHandler.handleDatabasesPagination(state, dispatch);
		}
		if (state.modelsPagination) {
			searchHandler.handleModelsPagination(state, dispatch);
		}
	}
};

const GlobalSearchMainViewHandler = (props) => {
	const { state, dispatch, cancelToken, setCurrentTime, gameChangerAPI } = props;

	const [pageLoaded, setPageLoaded] = useState(false);
	const [searchHandler, setSearchHandler] = useState();

	useEffect(() => {
		handlePagination(state, dispatch, searchHandler);
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
