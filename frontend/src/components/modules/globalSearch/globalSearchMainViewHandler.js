import React from 'react';
import _ from 'lodash';

// import GameChangerSearchMatrix from "../../searchMetrics/GCSearchMatrix";
import { trackEvent } from '../../telemetry/Matomo';
import { setState } from '../../../utils/sharedFunctions';
import SearchSection from '../globalSearch/SearchSection';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { backgroundWhite, gcOrange } from '../../common/gc-colors';
import { Card } from '../../cards/GCCard';
import Pagination from 'react-js-pagination';
import {
	getTrackingNameForFactory,
	RESULTS_PER_PAGE,
	StyledCenterContainer,
} from '../../../utils/gamechangerUtils';
import { Typography } from '@material-ui/core';
import '../../../containers/gamechanger.css';
import ResultView from '../../mainView/ResultView';
import AppsIcon from '@material-ui/icons/Apps';
import ListIcon from '@material-ui/icons/List';
import GCButton from '../../common/GCButton';
import defaultMainViewHandler from '../default/defaultMainViewHandler';
import ApplicationsIcon from '../../../images/icon/slideout-menu/applications icon.png';
import DashboardsIcon from '../../../images/icon/slideout-menu/dashboard icon.png';
import DatabasesIcon from '../../../images/icon/slideout-menu/database icon.png';
import DataSourcesIcon from '../../../images/icon/slideout-menu/resources icon.png';

const fullWidthCentered = {
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
};

const styles = {
	listViewBtn: {
		minWidth: 0,
		margin: '20px 0px 0px',
		marginLeft: 10,
		padding: '0px 7px 0',
		fontSize: 20,
		height: 34,
	},
	cachedResultIcon: {
		display: 'flex',
		justifyContent: 'center',
		padding: '0 0 1% 0',
	},
	searchResults: fullWidthCentered,
	paginationWrapper: fullWidthCentered,
	tabContainer: {
		alignItems: 'center',
		marginBottom: '14px',
		height: '600px',
		margin: '0px 4% 0 65px',
	},
	tabButtonContainer: {
		width: '100%',
		padding: '0em 1em',
		alignItems: 'center',
	},
	spacer: {
		flex: '0.375',
	},
	showingResultsRow: {
		width: '100%',
		display: 'inline-flex',
		justifyContent: 'space-between',
		marginBottom: 10,
		marginTop: 15,
	},
	container: {
		minWidth: 148,
	},
	containerDiv: {
		marginTop: 10,
		marginLeft: 0,
		marginRight: 0,
	},
	listViewContainer: {
		marginTop: 10,
		marginLeft: 0,
		marginRight: 0,
		paddingRight: 40,
	},
	text: {
		margin: 'auto 0px',
	},
	buttons: {
		height: 50,
		width: 64,
		margin: '0px 5px',
		minWidth: 64,
	},
	unselectedButton: {
		border: 'solid 2px #DFE6EE',
		color: '#8091A5',
	},
	icon: {
		fontSize: 30,
	},
};

const getViewHeader = (state, dispatch) => {
	return (
		<div style={styles.showingResultsRow}>
			{state.searchText && !_.isEmpty(state.categoryMetadata) && (
				<Typography variant="h3" style={styles.text}>
					{_.sum(_.map(Object.values(state.categoryMetadata), 'total'))
						? 'Showing results for '
						: `Looks like we don't have any matches for `}
					<b>{state.searchText}</b>
				</Typography>
			)}
			<div
				className={`tutorial-step-${state.componentStepNumbers['Tile Buttons']}`}
			>
				<div style={styles.container}>
					<GCButton
						onClick={() => setState(dispatch, { listView: false })}
						style={{
							...styles.buttons,
							...(!state.listView ? styles.unselectedButton : {}),
						}}
						textStyle={{ color: !state.listView ? backgroundWhite : '#8091A5' }}
						buttonColor={!state.listView ? gcOrange : backgroundWhite}
						borderColor={!state.listView ? gcOrange : '#B0B9BE'}
					>
						<div style={{ marginTop: 5 }}>
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
						buttonColor={!state.listView ? backgroundWhite : gcOrange}
						borderColor={!state.listView ? '#B0B9BE' : gcOrange}
					>
						<div style={{ marginTop: 5 }}>
							<ListIcon style={styles.icon} />
						</div>
					</GCButton>
				</div>
			</div>
		</div>
	);
};

const getSearchResults = (searchResultData, state, dispatch) => {
	return _.map(searchResultData, (item, idx) => {
		return (
			<Card key={idx} item={item} idx={idx} state={state} dispatch={dispatch} />
		);
	});
};

const GlobalSearchMainViewHandler = {
	async handlePageLoad(props) {
		const { state, dispatch, searchHandler } = props;

		const parsedURL = searchHandler.parseSearchURL(state);
		if (parsedURL.searchText) {
			const newState = { ...state, ...parsedURL, runSearch: true };
			setState(dispatch, newState);

			searchHandler.setSearchURL(newState);
		}
	},

	getMainView(props) {
		const { state, dispatch, pageLoaded, getViewPanels } = props;

		const { loading, rawSearchResults, viewNames } = state;

		const noResults = Boolean(rawSearchResults?.length === 0);
		const hideSearchResults = noResults && !loading;

		return (
			<div style={styles.tabButtonContainer}>
				<div key={'cardView'}>
					<div key={'cardView'} style={{ marginTop: 'auto' }}>
						<div>
							<div id="game-changer-content-top" />
							<StyledCenterContainer showSideFilters={false}>
								{/* <div className={'left-container'}>
										<div className={'side-bar-container'}>
											<GameChangerSearchMatrix context={{state, dispatch}} />
										</div>
								</div> */}
								<div className={'right-container'}>
									{loading && (
										<div style={{ margin: '0 auto' }}>
											<LoadingIndicator
												customColor={gcOrange}
												containerStyle={{ paddingTop: 100 }}
											/>
										</div>
									)}
									{!hideSearchResults && pageLoaded && (
										<>
											{!loading && getViewHeader(state, dispatch)}
											<div style={{ margin: '0 -75px 0 -52px' }}>
												<ResultView
													context={{ state, dispatch }}
													viewNames={viewNames}
													viewPanels={getViewPanels()}
												/>
											</div>
											<div style={styles.spacer} />
										</>
									)}
								</div>
							</StyledCenterContainer>
						</div>
					</div>
				</div>
			</div>
		);
	},

	renderHideTabs(props) {
		return defaultMainViewHandler.renderHideTabs(props);
	},

	handleCategoryTabChange(props) {
		const { tabName, dispatch } = props;

		setState(dispatch, { activeCategoryTab: tabName, resultsPage: 1 });
	},

	getViewNames(props) {
		return [];
	},

	getExtraViewPanels(props) {
		return [];
	},

	getCardViewPanel(props) {
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
		} = state;

		const applications = applicationsSearchResults;
		const dashboards = dashboardsSearchResults;
		const dataSources = dataSourcesSearchResults;
		const databases = databasesSearchResults;

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
					{applications &&
						applications.length > 0 &&
						(activeCategoryTab === 'Applications' ||
							activeCategoryTab === 'all') &&
						selectedCategories['Applications'] && (
						<div
							className={'col-xs-12'}
							style={
								state.listView
									? styles.listViewContainer
									: styles.containerDiv
							}
						>
							<SearchSection
								section={'Applications'}
								color={'rgb(50, 18, 77)'}
								icon={ApplicationsIcon}
							>
								{!applicationsLoading && !applicationsPagination ? (
									getSearchResults(applications, state, dispatch)
								) : (
									<div className="col-xs-12">
										<LoadingIndicator customColor={gcOrange} />
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

					{dashboards &&
						dashboards.length > 0 &&
						(activeCategoryTab === 'Dashboards' ||
							activeCategoryTab === 'all') &&
						selectedCategories['Dashboards'] && (
						<div
							className={'col-xs-12'}
							style={
								state.listView
									? styles.listViewContainer
									: styles.containerDiv
							}
						>
							<SearchSection
								section={'Dashboards'}
								color={'rgb(11, 167, 146)'}
								icon={DashboardsIcon}
							>
								{!dashboardsLoading && !dashboardsPagination ? (
									getSearchResults(dashboards, state, dispatch)
								) : (
									<div className="col-xs-12">
										<LoadingIndicator customColor={gcOrange} />
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

					{dataSources &&
						dataSources.length > 0 &&
						(activeCategoryTab === 'DataSources' ||
							activeCategoryTab === 'all') &&
						selectedCategories['DataSources'] && (
						<div
							className={'col-xs-12'}
							style={
								state.listView
									? styles.listViewContainer
									: styles.containerDiv
							}
						>
							<SearchSection
								section={'Data Sources'}
								color={'rgb(5, 159, 217)'}
								icon={DataSourcesIcon}
							>
								{!dataSourcesLoading && !dataSourcesPagination ? (
									getSearchResults(dataSources, state, dispatch)
								) : (
									<div className="col-xs-12">
										<LoadingIndicator customColor={gcOrange} />
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

					{databases &&
						databases.length > 0 &&
						(activeCategoryTab === 'Databases' ||
							activeCategoryTab === 'all') &&
						selectedCategories['Databases'] && (
						<div
							className={'col-xs-12'}
							style={
								state.listView
									? styles.listViewContainer
									: styles.containerDiv
							}
						>
							<SearchSection
								section={'Databases'}
								color={'rgb(233, 105, 29)'}
								icon={DatabasesIcon}
							>
								{!databasesLoading && !databasesPagination ? (
									getSearchResults(databases, state, dispatch)
								) : (
									<div className="col-xs-12">
										<LoadingIndicator customColor={gcOrange} />
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
				</div>
			</div>
		);
	},
};

export default GlobalSearchMainViewHandler;
