import React from "react";
import EDASummaryView from "./edaSummaryView";
import EDASidePanel from "./edaSidePanel";

import Pagination from "react-js-pagination";
import GCTooltip from "../../common/GCToolTip";
import GCButton from "../../common/GCButton";
import Permissions from "advana-platform-ui/dist/utilities/permissions";
import {
	getTrackingNameForFactory,
	numberWithCommas,
	RESULTS_PER_PAGE, scrollToContentTop, StyledCenterContainer
} from "../../../gamechangerUtils";
import {trackEvent} from "../../telemetry/Matomo";
import {setState} from "../../../sharedFunctions";
import {Card} from "../../cards/GCCard";
import ViewHeader from "../../mainView/ViewHeader";

import defaultMainViewHandler from "../default/defaultMainViewHandler";

// Internet Explorer 6-11
const IS_IE = /*@cc_on!@*/false || !!document.documentMode;
// Edge 20+
const IS_EDGE = !IS_IE && !!window.StyleMedia;

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

const EdaMainViewHandler = {

	getViewNames(props) {
		const viewNames = defaultMainViewHandler.getViewNames(props);
		viewNames.push(
			{
				name: 'Summary',
				title: 'Summary View',
				className: '',
				id: 'edaSummaryView'
			}
		);
		return viewNames;
	},
	
	getExtraViewPanels(props) {
		const {
			context
		} = props;

		const {state, dispatch} = context;

		const {
			edaSearchSettings,
			docSearchResults,
			loading
		} = state;

		const viewPanels = defaultMainViewHandler.getExtraViewPanels(props);
		viewPanels.push({panelName: 'Summary', panel:
			<div>
				{!loading && <StyledCenterContainer>
					<ViewHeader resultsText={" "} mainStyles={{float:'right', marginLeft: '5px', marginTop: '-10px'}}{...props} />
					<EDASummaryView 
						edaSearchSettings={edaSearchSettings}
						searchResults={docSearchResults}
						loading={loading}
						dispatch={dispatch}
					/>
				</StyledCenterContainer>}
			</div>
		});

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
			resultsPage,
			componentStepNumbers,
			hideTabs,
			isCachedResult,
			timeSinceCache,
			edaSearchSettings,
			issuingOrgs,
			statsLoading
		} = state;
		
		let sideScroll = {
			height: '72vh'
		}
		if (!iframePreviewLink) sideScroll = {};
		
		const cacheTip = `Cached result from ${timeSinceCache>0 ? timeSinceCache + " hour(s) ago": "less than an hour ago"}`;

		const getSearchResults = (searchResultData) => {

			return _.map(searchResultData, (item, idx) => {
				return (
					<Card key={item.doc_num}
						item={item}
						idx={idx}
						state={state}
						dispatch={dispatch}
					/>
				);
			});
		}
		
		return (
			<div key={'cardView'} style={{marginTop: hideTabs ? 40 : 'auto'}}>
				<div>
					<div id="game-changer-content-top"/>
					{!loading &&
						<StyledCenterContainer showSideFilters={true}>
							<div className={'left-container'}>
								<div className={'side-bar-container'}>
									<EDASidePanel 
										searchResults={rawSearchResults}
										dispatch={dispatch}
										edaSearchSettings={edaSearchSettings}
										issuingOrgs={issuingOrgs}
										statsLoading={statsLoading}
									/>
								</div>
							</div>
							<div className={'right-container'}>
								{!hideTabs && <ViewHeader {...props}/>
								}
							
								<div className={`row tutorial-step-${componentStepNumbers["Search Results Section"]} card-container`}>
									<div className={"col-xs-12"} style={{...sideScroll, padding: 0}}>
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
		)
	}
};

export default EdaMainViewHandler;
