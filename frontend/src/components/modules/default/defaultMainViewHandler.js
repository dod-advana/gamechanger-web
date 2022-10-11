import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { styles } from '../../mainView/commonStyles';
import { renderHideTabs, getAboutUs, getUserProfilePage } from '../../mainView/commonFunctions';
import ViewHeader from '../../mainView/ViewHeader';
import { trackEvent } from '../../telemetry/Matomo';
import {
	getNonMainPageOuterContainer,
	getSearchObjectFromString,
	getUserData,
	setState,
} from '../../../utils/sharedFunctions';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import { Card } from '../../cards/GCCard';
import GameChangerSearchMatrix from '../../searchMetrics/GCSearchMatrix';
import GameChangerSideBar from '../../searchMetrics/GCSideBar';
import Pagination from 'react-js-pagination';
import GCTooltip from '../../common/GCToolTip';
import {
	getTrackingNameForFactory,
	StyledCenterContainer,
	scrollToContentTop,
	getOrgToOrgQuery,
	getTypeQuery,
	getQueryVariable,
	RESULTS_PER_PAGE,
	PAGE_DISPLAYED,
} from '../../../utils/gamechangerUtils';
import ExportResultsDialog from '../../export/ExportResultsDialog';
import { gcOrange } from '../../common/gc-colors';
import ResultView from '../../mainView/ResultView';
import QueryDialog from '../../admin/util/QueryDialog';
import DocDialog from '../../admin/util/DocDialog';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import SearchHandlerFactory from '../../factories/searchHandlerFactory';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';

const DefaultDocumentExplorer = LoadableVisibility({
	loader: () => import('./defaultDocumentExplorer'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const getDocumentProperties = async (dispatch, gameChangerAPI) => {
	let documentProperties = [];

	try {
		const docPropsResponse = await gameChangerAPI.getDocumentProperties();
		const keepList = {
			display_title_s: 'Title',
			display_doc_type_s: 'Document Type',
			display_org_s: 'Organization',
			doc_num: 'Document Number',
			filename: 'Filename',
		};
		documentProperties = docPropsResponse.data.filter((field) => Object.keys(keepList).indexOf(field.name) !== -1);
		documentProperties.forEach((field) => {
			field.display_name = keepList[field.name];
		});
	} catch (e) {
		console.log(e);
	}

	setState(dispatch, { documentProperties });

	return documentProperties;
};

export const checkForTinyURL = async (location, gameChangerAPI) => {
	const tiny = getQueryVariable('tiny');

	if (!location || !tiny) {
		return false;
	}

	if (tiny) {
		const res = await gameChangerAPI.convertTinyURLPOST(tiny);
		return res.data.url;
	}
};

export const handlePageLoad = async (props) => {
	const { state, dispatch, history, searchHandler, gameChangerAPI } = props;

	gameChangerAPI.updateClonesVisited(state.cloneData.clone_name);

	if (state.runSearch || state.runDocumentComparisonSearch) return;

	const documentProperties = await getDocumentProperties(dispatch, gameChangerAPI);
	let newState = { ...state, documentProperties };

	// redirect the page if using tinyurl
	const url = await checkForTinyURL(window.location, gameChangerAPI);
	if (url) {
		history.replace(`#/${url}`);
		//setPageLoaded(false);
		//return;
	} else if (url === null) {
		///history.replace(state.cloneData.clone_data.url);
		return;
	}

	try {
		//getTrendingSearches(state.cloneData);
		const daysBack = 14;
		let trendingES = await gameChangerAPI.trendingSearches({ daysBack });

		setState(dispatch, { trending: trendingES });
	} catch (e) {
		console.log(e);
	}

	try {
		gameChangerAPI.recentSearchesPOST(state.cloneData.clone_name).then(({ data }) => {
			setState(dispatch, { recentSearches: data });
		});
	} catch (e) {
		// Do nothing
	}

	try {
		// gameChangerAPI.gcCrawlerTrackerData().then(({data}) => {
		// 	const names = data.docs.map(d=>d.crawler_name)
		// 	setState(dispatch, {crawlerSources: names});
		// });
		// let crawlerSources = await gameChangerAPI.gcCrawlerSealData();
		// setState(dispatch, {crawlerSources: crawlerSources.data});
	} catch (e) {
		// Do nothing
	}

	// fetch ES index
	try {
		const esIndex = await gameChangerAPI.getElasticSearchIndex();
		setState(dispatch, { esIndex: esIndex.data });
	} catch (e) {
		console.log(e);
	}

	try {
		await getUserData(dispatch);
	} catch (e) {
		console.log(e);
	}

	const parsedURL = searchHandler.parseSearchURL(newState);
	if (parsedURL.searchText) {
		newState = { ...newState, ...parsedURL, runSearch: true };
		setState(dispatch, newState);

		searchHandler.setSearchURL(newState);
	}
};

export const getMainView = (props) => {
	const { state, dispatch, setCurrentTime, pageLoaded, getViewPanels, renderHideTabs } = props;

	const {
		exportDialogVisible,
		searchSettings,
		prevSearchText,
		pageDisplayed,
		selectedDocuments,
		loading,
		rawSearchResults,
		viewNames,
		edaSearchSettings,
		currentSort,
		currentOrder,
		currentViewName,
	} = state;
	const { allOrgsSelected, orgFilter, searchType, searchFields, allTypesSelected, typeFilter } = searchSettings;

	const noResults = Boolean(rawSearchResults?.length === 0);
	const hideSearchResults = noResults && !loading && !pageDisplayed.includes('q=');
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
					isClone={true}
					cloneData={state.cloneData}
					searchType={searchType}
					searchFields={searchFields}
					edaSearchSettings={edaSearchSettings}
					sort={currentSort}
					order={currentOrder}
				/>
			)}
			{hideSearchResults && renderHideTabs(props)}
			{((!hideSearchResults && pageLoaded) || !state.replaceResults) && (
				<div style={styles.tabButtonContainer}>
					<ResultView context={{ state, dispatch }} viewNames={viewNames} viewPanels={getViewPanels()} />
					<div style={styles.spacer} />
				</div>
			)}
			{loading && currentViewName !== 'Explorer' && (
				<div style={{ margin: '0 auto' }}>
					<LoadingIndicator customColor={gcOrange} />
				</div>
			)}
			{state.showEsQueryDialog && (
				<QueryDialog
					open={state.showEsQueryDialog}
					handleClose={() => {
						setState(dispatch, { showEsQueryDialog: false });
					}}
					query={state.query}
				/>
			)}
			{state.showEsDocDialog && (
				<DocDialog
					open={state.showEsDocDialog}
					handleClose={() => {
						setState(dispatch, { showEsDocDialog: false });
					}}
					doc={state.selectedDoc}
				/>
			)}
		</>
	);
};

export const getViewNames = (props) => {
	const { cloneData } = props;
	const views = [{ name: 'Card', title: 'Card View', id: 'gcCardView' }];
	if (cloneData.document_view) views.push({ name: 'Explorer', title: 'Document Explorer', id: 'gcOpenDocExplorer' });
	return views;
};

const getExtraViewPanels = (props) => {
	const { context } = props;
	const { state, dispatch } = context;

	const { cloneData, count, docSearchResults, resultsPage, loading, prevSearchText, searchText } = state;

	const viewPanels = [];
	viewPanels.push({
		panelName: 'Explorer',
		panel: (
			<StyledCenterContainer showSideFilters={false}>
				<div className={'right-container'} style={{ ...styles.tabContainer, margin: '0', height: '800px' }}>
					<ViewHeader {...props} mainStyles={{ margin: '20px 0 0 0' }} resultsText=" " />
					<DefaultDocumentExplorer
						handleSearch={() => setState(dispatch, { runSearch: true })}
						data={docSearchResults}
						searchText={searchText}
						prevSearchText={prevSearchText}
						totalCount={count}
						loading={loading}
						resultsPage={resultsPage}
						resultsPerPage={RESULTS_PER_PAGE}
						onPaginationClick={(page) => {
							setState(dispatch, { resultsPage: page, runSearch: true });
						}}
						isClone={true}
						cloneData={cloneData}
					/>
				</div>
			</StyledCenterContainer>
		),
	});
	return viewPanels;
};

const getCardViewPanel = (props) => {
	const { context } = props;

	const { state, dispatch } = context;

	const {
		rawSearchResults,
		loading,
		count,
		iframePreviewLink,
		resultsPage,
		componentStepNumbers,
		hideTabs,
		isCachedResult,
		timeSinceCache,
		cloneData,
		showSideFilters,
		sidebarDocTypes,
		sidebarOrgs,
	} = state;

	let sideScroll = {
		height: '72vh',
	};
	if (!iframePreviewLink) sideScroll = {};

	const cacheTip = `Cached result from ${
		timeSinceCache > 0 ? timeSinceCache + ' hour(s) ago' : 'less than an hour ago'
	}`;

	const getSearchResults = (searchResultData) => {
		return _.map(searchResultData, (item, idx) => {
			return <Card key={idx} item={item} idx={idx} state={state} dispatch={dispatch} />;
		});
	};

	const getQAResults = () => {
		if (!state.qaResults) {
			return null;
		}
		const { question, answers } = state.qaResults;
		const wikiContainer = {
			margin: '5px',
			padding: '20px',
			backgroundColor: 'rgb(241, 245, 249)',
			fontSize: '1.2em',
			width: '100%',
		};
		// wikiResults[0]._source.text
		if (Permissions.isGameChangerAdmin() && question !== '' && answers.length > 0) {
			return (
				<div style={wikiContainer}>
					<strong>{question.toUpperCase()}</strong>
					<p style={{ marginTop: '10px', marginBottom: '0' }}>{answers[0]}</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div key={'cardView'}>
			<div key={'cardView'} style={{ marginTop: hideTabs ? 40 : 'auto' }}>
				<div>
					<div id="game-changer-content-top" />
					{(!loading || !state.replaceResults) && (
						<StyledCenterContainer showSideFilters={showSideFilters}>
							{showSideFilters && (
								<div className={'left-container'}>
									<div className={'side-bar-container'}>
										<div className={'filters-container sidebar-section-title'}>FILTERS</div>
										<GameChangerSearchMatrix context={context} />
										{sidebarDocTypes.length > 0 && sidebarOrgs.length > 0 && (
											<>
												<div className={'sidebar-section-title'}>RELATED</div>
												<GameChangerSideBar context={context} cloneData={cloneData} />
											</>
										)}
									</div>
								</div>
							)}
							<div className={'right-container'}>
								{(!hideTabs || !state.replaceResults) && <ViewHeader {...props} />}
								<div
									className={`row tutorial-step-${componentStepNumbers['Search Results Section']} card-container`}
								>
									<div className={'col-xs-12'} style={{ ...sideScroll, padding: 0 }}>
										<div
											className="row"
											style={{
												marginLeft: 0,
												marginRight: 0,
												paddingRight: 0,
												paddingLeft: 0,
											}}
										>
											{!loading && getQAResults()}
										</div>
										<div
											className="row"
											style={{
												marginLeft: 0,
												marginRight: 0,
												paddingRight: 0,
												paddingLeft: 0,
											}}
										>
											{(!loading || !state.replaceResults) && getSearchResults(rawSearchResults)}
										</div>
									</div>
								</div>
							</div>
						</StyledCenterContainer>
					)}
					{!iframePreviewLink && state.cloneData?.clone_name.toLowerCase() !== 'cdo' && (
						<div style={styles.paginationWrapper} className={'gcPagination'}>
							<Pagination
								activePage={resultsPage}
								itemsCountPerPage={RESULTS_PER_PAGE}
								totalItemsCount={count}
								pageRangeDisplayed={8}
								onChange={(page) => {
									trackEvent(
										getTrackingNameForFactory(state.cloneData.clone_name),
										'PaginationChanged',
										'page',
										page
									);
									setState(dispatch, { resultsPage: page, runSearch: true });
									scrollToContentTop();
								}}
							/>
						</div>
					)}
					{isCachedResult && (
						<div style={styles.cachedResultIcon}>
							<GCTooltip title={cacheTip} placement="right" arrow>
								<i style={styles.image} className="fa fa-bolt fa-2x" />
							</GCTooltip>
						</div>
					)}
					{Permissions.isGameChangerAdmin() && !loading && (
						<div style={styles.cachedResultIcon}>
							<i
								style={{ ...styles.image, cursor: 'pointer' }}
								className="fa fa-rocket"
								onClick={() => setState(dispatch, { showEsQueryDialog: true })}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const displayUserRelatedItems = () => {
	return <></>;
};

const DefaultMainViewHandler = (props) => {
	const { state, dispatch, cancelToken, setCurrentTime, gameChangerUserAPI, gameChangerAPI } = props;

	const [pageLoaded, setPageLoaded] = useState(false);
	const [searchHandler, setSearchHandler] = useState();

	useEffect(() => {
		if (state.cloneData.clone_name.toLowerCase() === 'cdo') {
			if (state.docsPagination && searchHandler) {
				setState(dispatch, {
					docsPagination: false,
				});
				searchHandler.handleSearch(state, dispatch, state.replaceResults);
			}
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

	const getViewPanels = () => {
		const viewPanels = { Card: getCardViewPanel({ context: { state, dispatch } }) };

		const extraViewPanels = getExtraViewPanels({ context: { state, dispatch } });
		extraViewPanels.forEach(({ panelName, panel }) => {
			viewPanels[panelName] = panel;
		});

		return viewPanels;
	};

	switch (state.pageDisplayed) {
		case PAGE_DISPLAYED.userDashboard:
			return getNonMainPageOuterContainer(
				getUserProfilePage(displayUserRelatedItems(), gameChangerUserAPI),
				state,
				dispatch
			);
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

export default DefaultMainViewHandler;
