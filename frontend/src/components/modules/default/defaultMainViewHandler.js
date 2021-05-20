import React from "react";
import ViewHeader from "../../mainView/ViewHeader";
import {trackEvent} from "../../telemetry/Matomo";
import { setState } from "../../../sharedFunctions";
import DocumentExplorer from "../../documentViewer/DocumentExplorer";
import Permissions from "advana-platform-ui/dist/utilities/permissions";
import {Card} from "../../cards/GCCard";
import GameChangerSearchMatrix from "../../searchMetrics/GCSearchMatrix";
import GameChangerSideBar from "../../searchMetrics/GCSideBar";
import Pagination from "react-js-pagination";
import GCTooltip from "../../common/GCToolTip";
import GetQAResults from './qaResults';
import {
	getTrackingNameForFactory,
	RESULTS_PER_PAGE, StyledCenterContainer, scrollToContentTop
} from "../../../gamechangerUtils";

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

const DefaultMainViewHandler = {
	getViewNames(props) {
		return [
			{name: 'Card', title: 'Card View', id: 'gcCardView'},
			{name: 'Explorer', title: 'Document Explorer', id: 'gcOpenDocExplorer'}
		];
	},
	
	getExtraViewPanels(props) {
		const { context } = props;
		const { state, dispatch } = context;

		const {
			cloneData,
			count,
			docSearchResults,
			resultsPage,
			loading,
			prevSearchText,
			searchText,
		} = state;
		
		const viewPanels = [];
		viewPanels.push(
			{
				panelName: 'Explorer',
				panel:
					<StyledCenterContainer showSideFilters={false}>
						<div className={'right-container'} style={{ ...styles.tabContainer, margin: '0', height: '800px' }}>
							<ViewHeader {...props} mainStyles={{margin:'20px 0 0 0'}} resultsText=' '/>
							<DocumentExplorer handleSearch={() => setState(dispatch, {runSearch: true})}
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
								isEDA={cloneData.clone_name === 'eda'}
							/>
						</div>
					</StyledCenterContainer>
			}
		);
		return viewPanels;
	},

	getCardViewPanel(props) {

		const {
			context
		} = props;
		
		const {state, dispatch} = context;

		const {
			rawSearchResults,
			loading,
			count,
			iframePreviewLink,
			timeFound,
			resultsPage,
			componentStepNumbers,
			listView,
			hideTabs,
			isCachedResult,
			timeSinceCache,
			cloneData,
			showSideFilters,
			sidebarDocTypes,
			sidebarOrgs
		} = state;
		
		let sideScroll = {
			height: '72vh'
		}
		if (!iframePreviewLink) sideScroll = {};
		
		const cacheTip = `Cached result from ${timeSinceCache>0 ? timeSinceCache + " hour(s) ago": "less than an hour ago"}`;

		const getSearchResults = (searchResultData) => {
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

		const getQAResults = () => {
			if(!state.qaResults) {
				return null;
			} 
			const { question, answers }  = state.qaResults;
			const wikiContainer = {
				margin: '5px',
				padding: '20px',
				backgroundColor: 'rgb(241, 245, 249)',
				fontSize: '1.2em',
				width: '100%'
			}
			// wikiResults[0]._source.text
			if (Permissions.isGameChangerAdmin() && question !== '' && answers.length > 0){
				return (
					<div style={wikiContainer}>
						<strong>{question.toUpperCase()}</strong>
						<p style={{marginTop: '10px', marginBottom: '0'}}>{answers[0]}</p>
					</div>);
			} 
			return null;
		}
		
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
											<div className={'filters-container sidebar-section-title'}>FILTERS</div>
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
												{!loading && getQAResults()}
											</div>
											<div className="row" style={{marginLeft: 0, marginRight: 0}}>
												{!loading &&
													getSearchResults(rawSearchResults)
												}
											</div>
										</div>
									</div>
								</div>
							</StyledCenterContainer>
						}
						{!iframePreviewLink &&
							<div style={styles.paginationWrapper} className={'gcPagination'}>
								<Pagination
									activePage={resultsPage}
									itemsCountPerPage={RESULTS_PER_PAGE}
									totalItemsCount={count}
									pageRangeDisplayed={8}
									onChange={page => {
										trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'PaginationChanged', 'page', page);
										setState(dispatch, { resultsPage: page, runSearch: true });
										scrollToContentTop();
									}}
								/>
							</div>
						}
						{isCachedResult &&
							<div style={styles.cachedResultIcon}>
								<GCTooltip title={cacheTip} placement="right" arrow>
									<i style={styles.image} className="fa fa-bolt fa-2x"/>
								</GCTooltip>
							</div>
						}
						{Permissions.isGameChangerAdmin() && !loading &&
							<div style={styles.cachedResultIcon}>
								<i style={{...styles.image, cursor: 'pointer'}} className="fa fa-rocket" onClick={() => setState(dispatch, { showEsQueryDialog: true })}/>
							</div>
						}
					</div>
				</div>
			</div>
		)
	}

};

export default DefaultMainViewHandler;
