import React, { useEffect, useState } from 'react';
import EDASummaryView from './edaSummaryView';
import JumpButton from '../globalSearch/JumpButton';
import GameChangerSearchMatrix from '../../searchMetrics/GCSearchMatrix';

import EDADocumentExplorer from './edaDocumentExplorer';
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
import {
	getAboutUs,
	getMainView,
	getUserProfilePage,
	getViewNames as defaultGetViewNames,
	handlePageLoad,
	renderHideTabs,
	styles,
} from '../default/defaultMainViewHandler';
import { Typography } from '@material-ui/core';
import SearchHandlerFactory from '../../factories/searchHandlerFactory';

const _ = require('lodash');

const getViewNames = (props) => {
	const viewNames = defaultGetViewNames(props);
	viewNames.push({
		name: 'Summary',
		title: 'Summary View',
		className: '',
		id: 'edaSummaryView',
	});

	return viewNames;
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
		summaryCardView,
		summaryCardData,
		resultsText,
		timeFound,
	} = state;

	let sideScroll = {
		height: '72vh',
	};
	if (!iframePreviewLink) sideScroll = {};

	const getSearchResults = (searchResultData) => {
		return _.map(searchResultData, (item, idx) => {
			return <Card key={item.doc_num} item={item} idx={idx} state={state} dispatch={dispatch} />;
		});
	};

	const searchResults = summaryCardView ? summaryCardData : rawSearchResults;

	return (
		<div key={'cardView'} style={{ marginTop: hideTabs ? 40 : 'auto' }}>
			<div id="game-changer-content-top" />
			{!loading && searchResults && searchResults.length > 0 && (
				<StyledCenterContainer showSideFilters={true}>
					<div className={'left-container'} style={summaryCardView ? styles.leftContainerSummary : {}}>
						<div className={'side-bar-container'}>
							{summaryCardView ? (
								<div>
									<JumpButton
										style={{ marginTop: 0 }}
										reverse={false}
										label="Back to Summary View"
										action={() => {
											setState(dispatch, {
												currentViewName: 'Summary',
												summaryCardData: [],
												resultsText: '',
											});
										}}
									/>
								</div>
							) : (
								<GameChangerSearchMatrix context={context} />
							)}
						</div>
					</div>
					<div className={'right-container'} style={summaryCardView ? styles.rightContainerSummary : {}}>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								padding: '0 0 0 10px',
							}}
						>
							<Typography variant="h3" display="inline">{`${
								searchResults ? count : '0'
							} results found in ${timeFound} seconds`}</Typography>

							{!hideTabs && <ViewHeader resultsText={resultsText} {...props} />}
						</div>

						<div
							className={`tutorial-step-${componentStepNumbers['Search Results Section']} card-container`}
						>
							<div className={'col-xs-12'} style={{ ...sideScroll, padding: 0 }}>
								<div
									className="row"
									style={{ marginLeft: 0, marginRight: 0, paddingRight: 0, paddingLeft: 0 }}
								>
									{!loading && getSearchResults(searchResults)}
								</div>
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

const EdaMainViewHandler = (props) => {
	const { state, dispatch, cancelToken, setCurrentTime } = props;

	const [pageLoaded, setPageLoaded] = useState(false);

	useEffect(() => {
		if (state.cloneDataSet && state.historySet && !pageLoaded) {
			const searchFactory = new SearchHandlerFactory(state.cloneData.search_module);
			const searchHandler = searchFactory.createHandler();

			handlePageLoad({ state, dispatch, history: state.history, searchHandler, cancelToken });
			setState(dispatch, { viewNames: getViewNames({ cloneData: state.cloneData }) });
			setPageLoaded(true);
		}
	}, [cancelToken, dispatch, pageLoaded, state]);

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
			return getNonMainPageOuterContainer(getUserProfilePage(displayUserRelatedItems), state, dispatch);
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
