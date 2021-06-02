import React from "react";
import ViewHeader from "../../mainView/ViewHeader";
import {trackEvent} from "../../telemetry/Matomo";
import {getSearchObjectFromString, getUserData, setSearchURL, setState} from "../../../sharedFunctions";
import DocumentExplorer from "../../documentViewer/DocumentExplorer";
import Permissions from "advana-platform-ui/dist/utilities/permissions";
import {Card} from "../../cards/GCCard";
import GameChangerSearchMatrix from "../../searchMetrics/GCSearchMatrix";
import GameChangerSideBar from "../../searchMetrics/GCSideBar";
import Pagination from "react-js-pagination";
import GCTooltip from "../../common/GCToolTip";
import {
	getTrackingNameForFactory,
	RESULTS_PER_PAGE,
	StyledCenterContainer,
	scrollToContentTop,
	getOrgToOrgQuery,
	getTypeQuery,
	getQueryVariable,
	setFilterVariables, SEARCH_TYPES
} from "../../../gamechangerUtils";
import ExportResultsDialog from "../../export/ExportResultsDialog";
import {gcOrange} from "../../common/gc-colors";
import ResultView from "../../mainView/ResultView";
import QueryDialog from "../../admin/QueryDialog";
import DocDialog from "../../admin/DocDialog";
import LoadingIndicator from "advana-platform-ui/dist/loading/LoadingIndicator";
import GameChangerAPI from "../../api/gameChanger-service-api";
import uuidv4 from "uuid/v4";

const gameChangerAPI = new GameChangerAPI();

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
	tabContainer: {
		alignItems: 'center',
		marginBottom: '14px',
		height: '600px',
		margin: '0px 4% 0 65px'
	},
	tabButtonContainer: {
		width: '100%',
		padding: '0em 1em',
		alignItems: 'center'
	},
	spacer: {
		flex: '0.375'
	},
}

const getDocumentProperties = async (dispatch) => {
	let documentProperties = [];

	try {
		const docPropsResponse = await gameChangerAPI.getDocumentProperties();
		const keepList = {
			'display_title_s': 'Title',
			'display_doc_type_s': 'Document Type',
			'display_org_s': 'Organization',
			'doc_num': 'Document Number',
			'filename': 'Filename',
		}
		documentProperties = docPropsResponse.data.filter(field => Object.keys(keepList).indexOf(field.name) !== -1);
		documentProperties.forEach(field => {
			field.display_name = keepList[field.name];
		});
	} catch(e) {
		console.log(e)
	}

	setState(dispatch, {documentProperties});

	return documentProperties;
}

const checkForTinyURL = async (location) => {

	const tiny = getQueryVariable('tiny');

	if (!location || !tiny) {
		return false;
	}

	if (tiny) {
		const res = await gameChangerAPI.convertTinyURLPOST(tiny);
		return res.data.url;
	}
}

const getTrendingSearches = (cloneData) => {
	const daysAgo = 7;
	let internalUsers = [];
	let blacklist = [];

	gameChangerAPI.getInternalUsers().then(({data}) => {
		data.forEach(d => {
			internalUsers.push(d.username);
		});

		gameChangerAPI.getTrendingBlacklist().then(({data}) => {
			data.forEach(d => {
				blacklist.push(d.search_text);
			});

			gameChangerAPI.getAppStats({cloneData, daysAgo, internalUsers, blacklist}).then(({data}) => {
				localStorage.setItem(`trending${cloneData.clone_name}Searches`, JSON.stringify(data.data.topSearches.data));
			}).catch(e => {console.log("error with getting trending: " + e);})

		}).catch(e => console.log("error with getting blacklist: " + e));

	}).catch(e => {console.log("error getting internal users: " + e)});
}

const DefaultMainViewHandler = {
	async handlePageLoad(props) {
		const {
			state,
			dispatch,
			history
		} = props;
		
		if (state.runSearch) return;
	
		let documentProperties = await getDocumentProperties(dispatch);
		
		// redirect the page if using tinyurl
		const url = await checkForTinyURL(window.location);
		if (url) {
			history.replace(`#/${url}`);
			//setPageLoaded(false);
			//return;
		}
		else if (url === null) {
			///history.replace(state.cloneData.clone_data.url);
			return;
		}
		
		try {
			getTrendingSearches(state.cloneData);
		} catch (e) {
			// Do nothing
		}
		
		// set search settings
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		try {
			const results = await gameChangerAPI.getUserSettings();
			const searchSettings = results.data.search_settings;
			
			if (searchSettings) {
	
				const accessAsDates = newSearchSettings.accessDateFilter[0] && newSearchSettings.accessDateFilter[1] ? newSearchSettings.accessDateFilter.map(date => new Date(date)) : [null,null];
				const publicationAsDates = newSearchSettings.publicationDateFilter[0] && newSearchSettings.publicationDateFilter[1] ? newSearchSettings.publicationDateFilter.map(date => new Date(date)) : [null,null];
				const publicationDateAllTimeValue = newSearchSettings.publicationDateAllTime === undefined ? true : newSearchSettings.publicationDateAllTime;
				
				newSearchSettings.accessDateFilter = accessAsDates;
				newSearchSettings.publicationDateFilter = publicationAsDates;
				newSearchSettings.publicationDateAllTime = publicationDateAllTimeValue;
			} else {
				console.log('NO SETTINGS')
			}
		} catch (e) {
			// do nothing
		}
		
		// fetch ES index
		try{
			const esIndex = await gameChangerAPI.getElasticSearchIndex();
			setState(dispatch, { esIndex: esIndex.data });
		} catch (e){
			console.log(e);
		}
		
		try {
			getUserData(dispatch);
		} catch(e) {
			console.log(e);
		}
		
		// get url data and set accordingly
		const searchText = getQueryVariable('q');
		let searchType = getQueryVariable('searchType');
		let offset = getQueryVariable('offset');
		let tabName = getQueryVariable('tabName');
		let orgURL = getQueryVariable('orgFilter');
		let typeURL = getQueryVariable('typeFilter');
		let searchFieldsURL = getQueryVariable('searchFields');
		
		if (!tabName) {
			tabName = state.tabName;
		}
	
		let orgFilterObject = _.cloneDeep(newSearchSettings.orgFilter);
		let typeFilterObject = _.cloneDeep(newSearchSettings.typeFilter);
	
		if (orgURL) {
			setFilterVariables(orgFilterObject, orgURL);
			if (orgURL !== 'ALLORGS') {
				newSearchSettings.allOrgsSelected = false;
				newSearchSettings.specificOrgsSelected = true;
			} else {
				newSearchSettings.allOrgsSelected = true;
				newSearchSettings.specificOrgsSelected = false;
			}
		}
		
		if(typeURL) {
			setFilterVariables(typeFilterObject, typeURL);
			if (orgURL !== 'ALLTYPES') {
				newSearchSettings.allTypesSelected = false;
				newSearchSettings.specificTypesSelected = true;
			} else {
				newSearchSettings.allTypesSelected = true;
				newSearchSettings.specificTypesSelected = false;
			}
		}
		
		let searchFields;
		
		if (searchFieldsURL) {
			const searchFieldPairs = searchFieldsURL.split('_');
	
			searchFieldPairs.forEach(pairText => {
				if (documentProperties) {
					const pair = pairText.split('-');
					const field = documentProperties.filter(prop => prop.display_name === pair[0])[0];
					searchFields[uuidv4()] = { field: field, input: pair[1] }
				}
			});
			searchFields[uuidv4()] = { field: null, input: '' }
			newSearchSettings.searchFields = searchFields;
		}
	
		if (Object.values(SEARCH_TYPES).indexOf(searchType) === -1) {
			searchType = 'Keyword';
		}
	
		if (isNaN(offset)) {
			offset = 0;
		}
	
		const resultsPage = Math.floor(offset / RESULTS_PER_PAGE) + 1;
	
		if (searchText) {
			newSearchSettings.searchType = searchType;
			newSearchSettings.orgFilter = orgFilterObject;
			newSearchSettings.typeFilter = typeFilterObject;
			setState(dispatch, {
				searchText,
				resultsPage,
				searchSettings: newSearchSettings,
				offset,
				tabName,
				runSearch: true
			});
			
			setSearchURL({searchText, resultsPage, tabName, cloneData: state.cloneData}, newSearchSettings);
		}
	},
	
	getMainView(props) {
		const {
			state,
			dispatch,
			setCurrentTime,
			renderHideTabs,
			pageLoaded,
			getViewPanels
		} = props;
		
		const {exportDialogVisible, searchSettings, prevSearchText, selectedDocuments, loading, rawSearchResults, viewNames, edaSearchSettings} = state;
		const {allOrgsSelected, orgFilter, searchType, searchFields, allTypesSelected, typeFilter,} = searchSettings;
		
		const noResults = Boolean(rawSearchResults?.length === 0);
		const hideSearchResults = noResults && !loading;

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
							isClone = {true}
							cloneData = {state.cloneData}
							searchType={searchType}
							searchFields={searchFields}
							edaSearchSettings={edaSearchSettings}
						/>
					)}
					{loading &&
						<div style={{ margin: '0 auto' }}>
							<LoadingIndicator customColor={gcOrange} />
						</div>
					}
					{hideSearchResults && renderHideTabs()}
					{(!hideSearchResults && pageLoaded) &&
						<div style={styles.tabButtonContainer}>
							<ResultView context={{state, dispatch}} viewNames={viewNames} viewPanels={getViewPanels()} />
							<div style={styles.spacer} />
						</div>
					}
					{state.showEsQueryDialog && (
						<QueryDialog
							open={state.showEsQueryDialog}
							handleClose={() => { setState(dispatch, { showEsQueryDialog: false }) }}
							query={state.query}
						/>
					)}
					{state.showEsDocDialog && (
						<DocDialog
							open={state.showEsDocDialog}
							handleClose={() => { setState(dispatch, { showEsDocDialog: false }) }}
							doc={state.selectedDoc}
						/>
					)}
				</>
			);
	},
	
	handleCategoryTabChange(props) {
		const {
			tabName,
			state,
			dispatch
		} = props;
		
		if (tabName === 'all'){
			setState(dispatch,{
				activeCategoryTab:tabName,
				docSearchResults:state.docSearchResults.slice(0,6),
				resultsPage: 1,
				replaceResults: true,
				infiniteScrollPage: 1
			})
		} else if (tabName === 'Documents' && state.resultsPage !== 1){
			setState(dispatch,{activeCategoryTab:tabName, resultsPage: 1, docSearchResults: [], replaceResults: true, docsPagination: true});
		} else if (tabName === 'Documents'){
			setState(dispatch,{activeCategoryTab:tabName, replaceResults: false});
		}
		setState(dispatch,{activeCategoryTab:tabName, resultsPage: 1});
	},
	
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
			resultsPage,
			componentStepNumbers,
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
