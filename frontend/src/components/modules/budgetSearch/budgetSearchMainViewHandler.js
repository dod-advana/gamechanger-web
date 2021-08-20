import React from "react";
import GameChangerSearchMatrix from "../../searchMetrics/GCSearchMatrix";
import styled from 'styled-components';

import GCPrimaryButton from "../../common/GCButton";

import { FormControlLabel, Checkbox } from "@material-ui/core";
import Pagination from "react-js-pagination";
import Permissions from "@dod-advana/advana-platform-ui/dist/utilities/permissions";
import {
	getTrackingNameForFactory,
	RESULTS_PER_PAGE, scrollToContentTop, StyledCenterContainer
} from "../../../gamechangerUtils";
import {trackEvent} from "../../telemetry/Matomo";
import {setState} from "../../../sharedFunctions";
import {Card} from "../../cards/GCCard";
import ViewHeader from "../../mainView/ViewHeader";
import defaultMainViewHandler from "../default/defaultMainViewHandler";
import GameChangerAPI from "../../api/gameChanger-service-api";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import ReactTable from "react-table";
import './budgetsearch.css';

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
	leftContainerSummary: {
		width: '15%',
		marginTop: 10
	},
	rightContainerSummary: {
		marginLeft: '17.5%',
		width: '79.7%'
	},
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		marginLeft: '5px',
		marginRight: '5px'
	},
	titleText: {
		fontSize: 22,
		fontWeight: 500,
		color: '#131E43',
	},
	tableColumn: {
        textAlign: 'left',
        margin: '4px 0'
    }
}

const StyledContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
`;

const StyledFilterBar = styled.div`
	width: 100%;
	display: flex;
	height: 60px;
	background-color: #EFF2F6;
	padding: 0 2em;
	align-items: center;
	justify-content: space-between;
`;

const StyledMainContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 0 2em;

`;

const StyledMainTopBar = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	align-items: center;
`;

const StyledMainBottomContainer = styled.div`
	width: 100%;
	height: 100%;

`;


const BudgetSearchMainViewHandler = {
	async handlePageLoad(props) {
		const { 
			state, dispatch
		} = props;
		await defaultMainViewHandler.handlePageLoad(props);
		const mainData = await gameChangerAPI.callSearchFunction({
			functionName: 'getMainPageData',
			cloneName: state.cloneData.clone_name,
			options: {}
		});
		setState(dispatch, { mainPageData: mainData.data })
		console.log(mainData);
	},
	
	getMainView(props) {
		const {
			state,
			dispatch
		} = props;

		const {
			loading,
			mainPageData
		} = state;

		const renderFilterBar = () => {
			const filterOptions = [];
			for (let i = 0; i < 9; i++) {
				filterOptions.push(		
				<FormControlLabel
					name={'Lorem ipsum dolor'}
					value={''}
					style={{}}
					control={<Checkbox
						style={styles.filterBox}
						onClick={() => {}}
						icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
						checked={false}
						checkedIcon={<i style={{color:'#E9691D'}} className="fa fa-check"/>}
						name={''}
					/>}
					label={<span style={{ fontSize: 13, marginLeft: 5, fontWeight: 600 }}>Lorem Ipsum</span>}
					labelPlacement="end"                        
				/>
				)
			}
			return (
			<>
				<div>
					{filterOptions}
				</div>
				<div style={{ margin: '0 15px 0 0'}}>
					<GCPrimaryButton
						style={{ color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '35px' }}
					>
						Clear Filters
					</GCPrimaryButton>
					<GCPrimaryButton
						style={{ color: 'white', backgroundColor: '#1C2D64', borderColor: '#1C2D64', height: '35px' }}
					>
						Review Filters
					</GCPrimaryButton>
				</div>
			</>);
		}

		const getMainPageColumns = () => {
			const mainPageColumns = [
				{
					Header: () => <p style={styles.tableColumn}>PER</p>,
					filterable: false,
					accessor: 'per',
					width: 150,
					Cell: row => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>
					},
					id: 'per'
				},
				{
					Header: () => <p style={styles.tableColumn}>PROJECT TITLE</p>,
					filterable: false,
					accessor: 'projectTitle',
					width: 150,
					Cell: row => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>
					},
					id: 'projectTitle'
				},
				{
					Header: () => <p style={styles.tableColumn}>PROJECT #</p>,
					filterable: false,
					accessor: 'projectNum',
					width: 150,
					Cell: row => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>
					},
					id: 'projectNum'
				},
				{
					Header: () => <p style={styles.tableColumn}>SERVICE</p>,
					filterable: false,
					accessor: 'service',
					width: 150,
					Cell: row => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>
					},
					id: 'service'
				},
				{
					Header: () => <p style={styles.tableColumn}>KEY HITS</p>,
					filterable: false,
					accessor: 'keyHits',
					width: 150,
					Cell: row => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>
					},
					id: 'keyHits'
				},
				{
					Header: () => <p style={styles.tableColumn}>COST CONTRIB</p>,
					filterable: false,
					accessor: 'costContributer',
					width: 150,
					Cell: row => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>
					},
					id: 'costContributer'
				},
				{
					Header: () => <p style={styles.tableColumn}>AI LABEL</p>,
					filterable: false,
					accessor: 'aiLabel',
					width: 150,
					Cell: row => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>
					},
					id: 'aiLabel'
				},
				{
					Header: () => <p style={styles.tableColumn}>REVIEW STATUS</p>,
					filterable: false,
					accessor: 'reviewStatus',
					width: 150,
					Cell: row => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>
					},
					id: 'reviewStatus'
				},
			];

			return mainPageColumns;
		}

		const renderMainContainer = () => {
			return (
			<>
				<StyledMainTopBar>
					<div style={styles.titleText}>
						Filtered Results
					</div>
					<div className='gcPagination'>
						<Pagination
							activePage={1}
							itemsCountPerPage={10}
							totalItemsCount={mainPageData.totalCount}
							pageRangeDisplayed={8}
							onChange={page => {
								trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'PaginationChanged', 'page', page);
								// setState(dispatch, { resultsPage: page, runSearch: true });
								scrollToContentTop();
							}}
						/>					
					</div>
				</StyledMainTopBar>
				<StyledMainBottomContainer>
					<ReactTable
						data={mainPageData ? mainPageData.docs : []}
						className={'striped'}
						noDataText={"No rows found"}
						loading={loading}
						columns={getMainPageColumns()}
						// pivotBy={searchResults ? edaSearchSettings.aggregations: []}
						editable={false}
						filterable={false}
						minRows={1}
						multiSort={false}
						showPageSizeOptions={false}
						showPagination={false}
						getTbodyProps={(state, rowInfo, column) => {
							return {
								style: {
									overflow: 'auto'
								}
							};
						}}
						getTdProps={(state, rowInfo, column) => ({
							style: {
								whiteSpace: 'unset'
							},
						})}
						getTheadTrProps={(state, rowInfo, column) => {
							return { style: styles.tableHeaderRow };
						}}
						getTheadThProps={(state, rowInfo, column) => {
							return { style: { fontSize: 15, fontWeight: 'bold', whiteSpace: 'unset' } };
						}}
						style={{
							height: "calc(100vh - 300px)",
							borderTopRightRadius: 5,
							borderTopLeftRadius: 5,
							marginBottom: 10
						}}
						getTableProps={(state, rowInfo, column) => {
							return { style: { 
								borderTopRightRadius: 5,
								borderTopLeftRadius: 5
							}}
						}}
					/>
				</StyledMainBottomContainer>
			</>
			)
		}

		return (
			<StyledContainer className={"cool-class"}>
				<StyledFilterBar>
					{renderFilterBar()}
				</StyledFilterBar>
				<StyledMainContainer>
					{renderMainContainer()}
				</StyledMainContainer>
			</StyledContainer>
		)
	},
	
	renderHideTabs(props) {
		return defaultMainViewHandler.renderHideTabs(props);
	},
	
	handleCategoryTabChange(props) {
		defaultMainViewHandler.handleCategoryTabChange(props);
	},

	getViewNames(props) {
		const viewNames = defaultMainViewHandler.getViewNames(props);

		return viewNames;
	},
	
	getExtraViewPanels(props) {
		const {
			context
		} = props;

		const {state, dispatch} = context;

		const {
			docSearchResults,
			loading,
			cloneData,
			resultsPage,
			searchText,
			prevSearchText,
			count,
		} = state;

		const viewPanels = [];

        //DOC EXPLORER
		// viewPanels.push(
		// 	{
		// 		panelName: 'Explorer',
		// 		panel:
		// 			<StyledCenterContainer showSideFilters={false}>
		// 				<div className={'right-container'} style={{ ...styles.tabContainer, margin: '0', height: '800px' }}>
		// 					<ViewHeader {...props} mainStyles={{margin:'20px 0 0 0'}} resultsText=' '/>
		// 					<EDADocumentExplorer handleSearch={() => setState(dispatch, {runSearch: true})}
		// 						data={docSearchResults}
		// 						searchText={searchText}
		// 						prevSearchText={prevSearchText}
		// 						totalCount={count}
		// 						loading={loading}
		// 						resultsPage={resultsPage}
		// 						resultsPerPage={RESULTS_PER_PAGE}
		// 						onPaginationClick={(page) => {
		// 							setState(dispatch, { resultsPage: page, runSearch: true });
		// 						}}
		// 						isClone={true}
		// 						cloneData={cloneData}
		// 					/>
		// 				</div>
		// 			</StyledCenterContainer>
		// 	}
		// );
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
			resultsText
		} = state;
		
		let sideScroll = {
			height: '72vh'
		}
		if (!iframePreviewLink) sideScroll = {};
		
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

		const searchResults = rawSearchResults;
		
		return (
			<div key={'cardView'} style={{marginTop: hideTabs ? 40 : 'auto'}}>
				<div id="game-changer-content-top"/>
				{!loading &&
					<StyledCenterContainer showSideFilters={true}>
						<div className={'left-container'}>
							<div className={'side-bar-container'}>
                                <GameChangerSearchMatrix 
                                    context={context}
                                />
							</div>
						</div>
						<div className={'right-container'}>
							{!hideTabs && 
								<ViewHeader resultsText={resultsText} {...props}/>
							}
						
							<div className={`tutorial-step-${componentStepNumbers["Search Results Section"]} card-container`}>
								<div className={"col-xs-12"} style={{...sideScroll, padding: 0}}>
									<div className="row" style={{marginLeft: 0, marginRight: 0}}>
										{!loading &&
											getSearchResults(searchResults)
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
							style={{backgroundColor: 'blue'}}
						/>
					</div>
				}

				{Permissions.isGameChangerAdmin() && !loading &&
					<div style={styles.cachedResultIcon}>
						<i style={{...styles.image, cursor: 'pointer'}} className="fa fa-rocket" onClick={() => setState(dispatch, { showEsQueryDialog: true })}/>
					</div>
				}
			</div>
		)
	}
};

export default BudgetSearchMainViewHandler;
