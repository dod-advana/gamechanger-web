import React from 'react';
import EDASummaryView from './edaSummaryView';
import JumpButton from '../globalSearch/JumpButton';
import GameChangerSearchMatrix from '../../searchMetrics/GCSearchMatrix';

import EDADocumentExplorer from './edaDocumentExplorer';
import Pagination from 'react-js-pagination';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import {
	getTrackingNameForFactory,
	RESULTS_PER_PAGE,
	scrollToContentTop,
	StyledCenterContainer,
} from '../../../utils/gamechangerUtils';
import { trackEvent } from '../../telemetry/Matomo';
import { setState } from '../../../utils/sharedFunctions';
import { Card } from '../../cards/GCCard';
import ViewHeader from '../../mainView/ViewHeader';
import defaultMainViewHandler from '../default/defaultMainViewHandler';

const _ = require('lodash');

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
	leftContainerSummary: {
		width: '15%',
		marginTop: 10,
	},
	rightContainerSummary: {
		marginLeft: '17.5%',
		width: '79.7%',
	},
};

const EdaMainViewHandler = {
	async handlePageLoad(props) {
		await defaultMainViewHandler.handlePageLoad(props);
	},

	getMainView(props) {
		return defaultMainViewHandler.getMainView(props);
	},

	renderHideTabs(props) {
		return defaultMainViewHandler.renderHideTabs(props);
	},

	handleCategoryTabChange(props) {
		defaultMainViewHandler.handleCategoryTabChange(props);
	},

	getViewNames(props) {
		const viewNames = defaultMainViewHandler.getViewNames(props);
		viewNames.push({
			name: 'Summary',
			title: 'Summary View',
			className: '',
			id: 'edaSummaryView',
		});

		return viewNames;
	},

	getExtraViewPanels(props) {
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
					<div
						className={'right-container'}
						style={{ ...styles.tabContainer, margin: '0', height: '800px' }}
					>
						<ViewHeader
							{...props}
							mainStyles={{ margin: '20px 0 0 0' }}
							resultsText=" "
						/>
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
	},

	getCardViewPanel(props) {
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
		} = state;

		let sideScroll = {
			height: '72vh',
		};
		if (!iframePreviewLink) sideScroll = {};

		const getSearchResults = (searchResultData) => {
			return _.map(searchResultData, (item, idx) => {
				return (
					<Card
						key={item.doc_num}
						item={item}
						idx={idx}
						state={state}
						dispatch={dispatch}
					/>
				);
			});
		};

		const searchResults = summaryCardView ? summaryCardData : rawSearchResults;

		return (
			<div key={'cardView'} style={{ marginTop: hideTabs ? 40 : 'auto' }}>
				<div id="game-changer-content-top" />
				{!loading && (
					<StyledCenterContainer showSideFilters={true}>
						<div
							className={'left-container'}
							style={summaryCardView ? styles.leftContainerSummary : {}}
						>
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
						<div
							className={'right-container'}
							style={summaryCardView ? styles.rightContainerSummary : {}}
						>
							{!hideTabs && <ViewHeader resultsText={resultsText} {...props} />}

							<div
								className={`tutorial-step-${componentStepNumbers['Search Results Section']} card-container`}
							>
								<div
									className={'col-xs-12'}
									style={{ ...sideScroll, padding: 0 }}
								>
									<div
										className="row"
										style={{ marginLeft: 0, marginRight: 0 }}
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
	},
};

export default EdaMainViewHandler;
