import React, { useEffect, useState } from 'react';
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

const dataLoading = (extras) => {
	const { applications, dashboards, dataSources, databases, models } = extras;

	return applications.loading || dashboards.loading || dataSources.loading || databases.loading || models.loading;
};

const getHeaderStyles = (view) => {
	return {
		textStyle: { color: view ? backgroundWhite : '#8091A5' },
		buttonColor: view ? PRIMARY_COLOR : backgroundWhite,
		borderColor: view ? PRIMARY_COLOR : '#B0B9BE',
	};
};

const getViewHeader = (state, dispatch, extras) => {
	let gridView, listView;

	if (state.listView) {
		gridView = false;
		listView = true;
	} else {
		gridView = true;
		listView = false;
	}

	let disableFavoritesButton = true;

	Object.keys(state.favorites || {}).forEach((key) => {
		if (state.favorites[key].searchResults.length > 0) {
			disableFavoritesButton = false;
		}
	});

	return (
		<div style={styles.showingResultsRow}>
			{state.searchText && !dataLoading(extras) && (
				<>
					<Typography variant="h3" style={{ ...styles.text, margin: '20px 15px' }}>
						{state.showFavorites ? 'Showing' : 'Showing results for'}{' '}
						<b>{state.showFavorites ? 'favorites' : state.searchText}</b>
					</Typography>
					<div className={`tutorial-step-${state.componentStepNumbers['Tile Buttons']}`}>
						<div style={{ ...styles.container, margin: '0px 25px' }}>
							<GCButton
								onClick={() => setState(dispatch, { listView: false })}
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
								onClick={() => setState(dispatch, { listView: true })}
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
								onClick={() => setState(dispatch, { showFavorites: !state.showFavorites })}
								style={{
									...styles.buttons,
									...(!state.showFavorites ? styles.unselectedButton : {}),
									width: 170,
								}}
								textStyle={getHeaderStyles(state.showFavorites)['textStyle']}
								buttonColor={getHeaderStyles(state.showFavorites)['buttonColor']}
								borderColor={getHeaderStyles(state.showFavorites)['borderColor']}
								disabled={disableFavoritesButton}
							>
								<div style={{ display: 'flex' }}>
									<Typography
										style={{
											fontSize: 14,
											fontWeight: state.showFavorites ? 'bold' : 500,
											color: state.showFavorites ? backgroundWhite : '#8091A5',
										}}
									>
										Show Favorites
									</Typography>
									<i
										className={state.showFavorites ? 'fa fa-star' : 'fa fa-star-o'}
										style={{
											color: state.showFavorites ? backgroundWhite : '#B0B9BE',
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
	return searchResultData.map((item, idx) => {
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
	gameChangerAPI.getUserFavoriteHomeApps().then(({ data }) => {
		const favoriteApps = data.favorite_apps || [];

		setState(dispatch, { favoriteApps });
		searchHandler.handleGetUserFavorites(favoriteApps, state).then((favorites) => {
			setState(dispatch, { favorites });
		});
	});
};

const getMainView = (props) => {
	const {
		state,
		dispatch,
		pageLoaded,
		getViewPanels,
		renderHideTabs: renderHideTabsInner,
		applications,
		dashboards,
		dataSources,
		databases,
		models,
	} = props;

	const { loading, viewNames, searchText } = state;

	const noResults = Boolean(
		!applications.totalCount &&
			!dashboards.totalCount &&
			!dataSources.totalCount &&
			!databases.totalCount &&
			!models.totalCount
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
									(applications.totalCount > 0 ||
									dashboards.totalCount > 0 ||
									dataSources.totalCount > 0 ||
									databases.totalCount > 0 ||
									models.totalCount > 0 ? (
										<>
											{getViewHeader(state, dispatch, {
												applications,
												dashboards,
												dataSources,
												databases,
												models,
											})}
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

const renderItems = (items, dispatch, itemCategory, stateCategoryName, categoryColor, categoryIcon, state) => {
	const { cloneData, activeCategoryTab, selectedCategories, listView } = state;
	const { loading, page: tmpPage, pagination, totalCount, searchResults } = items;

	return (
		<>
			{searchResults?.length > 0 &&
				(activeCategoryTab === itemCategory || activeCategoryTab === 'all') &&
				selectedCategories[itemCategory] && (
					<div className={'col-xs-12'} style={getListViewStyle(listView)}>
						<SearchSection section={itemCategory} color={categoryColor} icon={categoryIcon}>
							{!loading && !pagination ? (
								getSearchResults(searchResults, state, dispatch)
							) : (
								<div className="col-xs-12">
									<LoadingIndicator customColor={PRIMARY_COLOR} />
								</div>
							)}
							<div className="gcPagination col-xs-12 text-center">
								<Pagination
									activePage={tmpPage}
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
											[stateCategoryName]: {
												...items,
												loading: true,
												page: page,
												pagination: true,
												totalCount,
											},
										});
									}}
								/>
							</div>
						</SearchSection>
					</div>
				)}
		</>
	);
};

const getCardViewPanel = (props) => {
	const { context, applications, dashboards, dataSources, databases, models } = props;
	const { state, dispatch } = context;
	const { componentStepNumbers, iframePreviewLink, loading } = state;

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
				{renderItems(
					applications,
					dispatch,
					'Applications',
					'applicationsSearchResults',
					'rgb(50, 18, 77)',
					ApplicationsIcon,
					state
				)}

				{renderItems(
					dashboards,
					dispatch,
					'Dashboards',
					'dashboardsSearchResults',
					'rgb(11, 167, 146)',
					DashboardsIcon,
					state
				)}

				{renderItems(
					dataSources,
					dispatch,
					'DataSources',
					'dataSourcesSearchResults',
					'rgb(5, 159, 217)',
					DataSourcesIcon,
					state
				)}

				{renderItems(
					databases,
					dispatch,
					'Databases',
					'databasesSearchResults',
					'rgb(233, 105, 29)',
					DatabasesIcon,
					state
				)}

				{renderItems(models, dispatch, 'Models', 'modelsSearchResults', '#131E43', DatabasesIcon, state)}

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
		if (state.applicationsSearchResults.pagination) {
			searchHandler.handleApplicationsPagination(state, dispatch);
		}
		if (state.dashboardsSearchResults.pagination) {
			searchHandler.handleDashboardsPagination(state, dispatch);
		}
		if (state.dataSourcesSearchResults.pagination) {
			searchHandler.handleDataSourcesPagination(state, dispatch);
		}
		if (state.databasesSearchResults.pagination) {
			searchHandler.handleDatabasesPagination(state, dispatch);
		}
		if (state.modelsSearchResults.pagination) {
			searchHandler.handleModelsPagination(state, dispatch);
		}
	}
};

const checkFinishedLoading = (state, dispatch, applications, dashboards, dataSources, databases, models) => {
	if (
		state.runningSearch &&
		!applications.loading &&
		!dashboards.loading &&
		!dataSources.loading &&
		!databases.loading &&
		!models.loading
	) {
		setState(dispatch, {
			runningSearch: false,
			loading: false,
		});
	}
};

const setMetaData = (state, dispatch, applications, dashboards, dataSources, databases, models) => {
	const tmpMeta = structuredClone(state.categoryMetadata);

	if (!applications.loading) {
		tmpMeta['Applications'] = { total: applications.totalCount };
	}

	if (!dashboards.loading) {
		tmpMeta['Dashboards'] = { total: dashboards.totalCount };
	}
	if (!dataSources.loading) {
		tmpMeta['DataSources'] = { total: dataSources.totalCount };
	}
	if (!databases.loading) {
		tmpMeta['Databases'] = { total: databases.totalCount };
	}
	if (!models.loading) {
		tmpMeta['Models'] = { total: models.totalCount };
	}

	setState(dispatch, { categoryMetadata: tmpMeta });
};

const updateSearchFavorites = (gameChangerAPI, dispatch, state, searchHandler) => {
	// Get User Favorites from home App
	gameChangerAPI.getUserFavoriteHomeApps().then(({ data }) => {
		const favoriteApps = data.favorite_apps || [];

		setState(dispatch, { favoriteApps });
		searchHandler.handleGetUserFavorites(favoriteApps, state).then((tmpFavorites) => {
			setState(dispatch, { favorites: tmpFavorites, updateSearchFavorites: false });
		});
	});
};

const GlobalSearchMainViewHandler = (props) => {
	const { state, dispatch, abortController, setCurrentTime, gameChangerAPI } = props;

	const [pageLoaded, setPageLoaded] = useState(false);
	const [searchHandler, setSearchHandler] = useState();
	const [applications, setApplications] = useState(state.applicationsSearchResults);
	const [dashboards, setDashboards] = useState(state.dashboardsSearchResults);
	const [dataSources, setDataSources] = useState(state.dataSourcesSearchResults);
	const [databases, setDatabases] = useState(state.databasesSearchResults);
	const [models, setModels] = useState(state.modelsSearchResults);

	const [showFavorites, setShowFavorites] = useState(state.showFavorites);
	const [favorites, setFavorites] = useState(state.favorites);

	useEffect(() => {
		if (state.updateSearchFavorites) {
			updateSearchFavorites(gameChangerAPI, dispatch, state, searchHandler);
		}
	}, [dispatch, gameChangerAPI, searchHandler, state]);

	useEffect(() => {
		setFavorites(state.favorites);
		setShowFavorites(state.showFavorites);
	}, [state.showFavorites, state.favorites]);

	useEffect(() => {
		// if pagination is true in any of the pagination values then true
		const pagination =
			state.applicationsSearchResults.pagination ||
			state.dashboardsSearchResults.pagination ||
			state.dataSourcesSearchResults.pagination ||
			state.databasesSearchResults.pagination ||
			state.modelsSearchResults.pagination;

		if (pagination) handlePagination(state, dispatch, searchHandler);
	}, [
		state,
		dispatch,
		searchHandler,
		state.applicationsSearchResults.pagination,
		state.dashboardsSearchResults.pagination,
		state.dataSourcesSearchResults.pagination,
		state.databasesSearchResults.pagination,
		state.modelsSearchResults.pagination,
	]);

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
				abortController,
				gameChangerAPI,
			});
			setState(dispatch, { viewNames: getViewNames({ cloneData: state.cloneData }) });
			setPageLoaded(true);
		}
	}, [abortController, dispatch, gameChangerAPI, pageLoaded, state]);

	useEffect(() => {
		let tmpApplications, tmpDashboards, tmpDataSources, tmpDatabases, tmpModels;

		if (showFavorites) {
			tmpApplications = favorites.applicationsSearchResults;
			tmpDashboards = favorites.dashboardsSearchResults;
			tmpDataSources = favorites.dataSourcesSearchResults;
			tmpDatabases = favorites.databasesSearchResults;
			tmpModels = favorites.modelsSearchResults;
		} else {
			tmpApplications = state.applicationsSearchResults;
			tmpDashboards = state.dashboardsSearchResults;
			tmpDataSources = state.dataSourcesSearchResults;
			tmpDatabases = state.databasesSearchResults;
			tmpModels = state.modelsSearchResults;
		}

		setApplications(tmpApplications);
		setDashboards(tmpDashboards);
		setDataSources(tmpDataSources);
		setDatabases(tmpDatabases);
		setModels(tmpModels);
	}, [
		state.runningSearch,
		state.loading,
		dispatch,
		favorites,
		showFavorites,
		state.applicationsSearchResults,
		state.dashboardsSearchResults,
		state.dataSourcesSearchResults,
		state.databasesSearchResults,
		state.modelsSearchResults,
	]);

	useEffect(() => {
		setMetaData(state, dispatch, applications, dashboards, dataSources, databases, models);
		checkFinishedLoading(state, dispatch, applications, dashboards, dataSources, databases, models);
		// eslint-disable-next-line
	}, [applications, dashboards, dataSources, databases, dispatch, models]);

	const getViewPanels = () => {
		const viewPanels = {
			Card: getCardViewPanel({
				context: { state, dispatch },
				applications,
				dashboards,
				dataSources,
				databases,
				models,
			}),
		};

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
				applications,
				dashboards,
				dataSources,
				databases,
				models,
			});
	}
};

export default GlobalSearchMainViewHandler;
