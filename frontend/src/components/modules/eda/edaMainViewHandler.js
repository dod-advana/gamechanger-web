import React, { useEffect, useState } from 'react';
import EDASummaryView from './edaSummaryView';
import GameChangerSearchMatrix from '../../searchMetrics/GCSearchMatrix';
import { styles } from '../../mainView/commonStyles';
import { getAboutUs, getUserProfilePage } from '../../mainView/commonFunctions';
import Pagination from 'react-js-pagination';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import {
	getTrackingNameForFactory,
	PAGE_DISPLAYED,
	RESULTS_PER_PAGE,
	scrollToContentTop,
	StyledCenterContainer,
} from '../../../utils/gamechangerUtils';
import { trackEvent } from '../../telemetry/Matomo';
import { getNonMainPageOuterContainer, setState } from '../../../utils/sharedFunctions';
import { Card } from '../../cards/GCCard';
import ViewHeader from '../../mainView/ViewHeader';
import { getMainView, getViewNames as defaultGetViewNames, handlePageLoad } from '../default/defaultMainViewHandler';
import SearchHandlerFactory from '../../factories/searchHandlerFactory';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';
import { gcOrange } from '../../common/gc-colors';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import MagellanTrendingLinkList from '../../common/MagellanTrendingLinkList';

const _ = require('lodash');

const EDADocumentExplorer = LoadableVisibility({
	loader: () => import('./edaDocumentExplorer'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const AnalystTools = LoadableVisibility({
	loader: () => import('../../analystTools'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const getViewNames = (props) => {
	return defaultGetViewNames(props);
};

const getExtraViewPanels = (props) => {
	const { context } = props;

	const { state, dispatch } = context;

	const {
		edaSearchSettings,
		docSearchResults,
		loading,
		cloneData,
		resultsPage,
		searchText,
		prevSearchText,
		count,
		currentViewName,
		summaryCardView,
	} = state;

	const viewPanels = [];
	viewPanels.push({
		panelName: 'Explorer',
		panel: (
			<StyledCenterContainer showSideFilters={false}>
				<div className={'right-container'} style={{ ...styles.tabContainer, margin: '0', height: '800px' }}>
					<ViewHeader {...props} mainStyles={{ margin: '20px 0 0 0' }} resultsText=" " />
					<EDADocumentExplorer
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

	viewPanels.push({
		panelName: 'Summary',
		panel: (
			<div>
				{!loading && (
					<StyledCenterContainer>
						<ViewHeader
							resultsText={' '}
							mainStyles={{
								float: 'right',
								marginLeft: '5px',
								marginTop: '-10px',
							}}
							{...props}
						/>
						<EDASummaryView
							edaSearchSettings={edaSearchSettings}
							searchResults={docSearchResults}
							loading={loading}
							dispatch={dispatch}
							currentViewName={currentViewName}
							summaryCardView={summaryCardView}
						/>
					</StyledCenterContainer>
				)}
			</div>
		),
	});

	return viewPanels;
};

const getSearchResults = (searchResultData, state, dispatch) => {
	return _.map(searchResultData, (item, idx) => {
		return <Card key={item.doc_num} item={item} idx={idx} state={state} dispatch={dispatch} />;
	});
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
		summaryCardView,
		resultsText,
		runningSearch,
		searchText,
	} = state;

	let sideScroll = {
		height: '72vh',
	};
	if (!iframePreviewLink) sideScroll = {};

	const searchTextPresent = searchText && searchText.length > 0;

	return (
		<div key={'cardView'}>
			<div id="game-changer-content-top" />
			{searchTextPresent && (
				<StyledCenterContainer showSideFilters={true}>
					<div className={'left-container'} style={summaryCardView ? styles.leftContainerSummary : {}}>
						<div className={'side-bar-container'}>
							<GameChangerSearchMatrix context={context} />
						</div>
					</div>
					<div className={'right-container'} style={summaryCardView ? styles.rightContainerSummary : {}}>
						<ViewHeader resultsText={resultsText} {...props} />
						<div
							className={`tutorial-step-${componentStepNumbers['Search Results Section']} card-container`}
						>
							<div className={'col-xs-12'} style={{ ...sideScroll, padding: 0 }}>
								{runningSearch && (
									<div style={{ margin: '0 auto' }} data-cy="eda-search-load">
										<LoadingIndicator />
									</div>
								)}
								{!runningSearch && (
									<div
										className="row"
										style={{ marginLeft: 0, marginRight: 0, paddingRight: 0, paddingLeft: 0 }}
									>
										{getSearchResults(rawSearchResults, state, dispatch)}
									</div>
								)}
							</div>
						</div>
					</div>
				</StyledCenterContainer>
			)}
			{!iframePreviewLink && !summaryCardView && (
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
	);
};

const displayUserRelatedItems = () => {
	return <></>;
};

const getAnalystTools = (context) => {
	return <AnalystTools context={context} showResponsibilityExplorer={false} />;
};

export const renderHideTabs = (props) => {
	const { state, dispatch } = props;
	const { componentStepNumbers, cloneData, searchText } = state;
	const latestLinks = localStorage.getItem(`recent${cloneData.clone_name}Searches`) || '[]';

	const handleLinkListItemClick = (text) => {
		trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'TrendingSearchSelected', text);
		setState(dispatch, {
			searchText: text,
			autoCompleteItems: [],
			metricsCounted: false,
			runSearch: true,
		});
	};

	return (
		<div style={{ marginTop: '40px' }}>
			{(!searchText || searchText === '') && (
				<div style={{ margin: '10px auto', width: '67%' }}>
					<div
						data-cy="eda-recent-searches"
						className={`tutorial-step-${componentStepNumbers['Recent Searches']}`}
					>
						<MagellanTrendingLinkList
							onLinkClick={handleLinkListItemClick}
							links={JSON.parse(latestLinks)}
							title="Recent Searches"
						/>
					</div>
				</div>
			)}
		</div>
	);
};

const EdaMainViewHandler = (props) => {
	const { state, dispatch, cancelToken, setCurrentTime, gameChangerUserAPI, gameChangerAPI } = props;

	const [pageLoaded, setPageLoaded] = useState(false);

	useEffect(() => {
		if (state.cloneDataSet && state.historySet && !pageLoaded) {
			const searchFactory = new SearchHandlerFactory(state.cloneData.search_module);
			const searchHandler = searchFactory.createHandler();

			handlePageLoad({ state, dispatch, history: state.history, searchHandler, cancelToken, gameChangerAPI });
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
		case PAGE_DISPLAYED.analystTools:
			return getNonMainPageOuterContainer(getAnalystTools({ state, dispatch }), state, dispatch);
		case PAGE_DISPLAYED.userDashboard:
			return getNonMainPageOuterContainer(
				getUserProfilePage(displayUserRelatedItems(), gameChangerUserAPI),
				state,
				dispatch
			);
		case PAGE_DISPLAYED.aboutUs:
			return getNonMainPageOuterContainer(getAboutUs({ state }), state, dispatch);
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

export default EdaMainViewHandler;
