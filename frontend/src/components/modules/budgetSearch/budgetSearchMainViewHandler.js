import React from 'react';
import styled from 'styled-components';

import GCPrimaryButton from '../../common/GCButton';

import { FormControlLabel, Checkbox } from '@material-ui/core';
import Pagination from 'react-js-pagination';
import {
	getTrackingNameForFactory,
	scrollToContentTop,
	getQueryVariable,
} from '../../../utils/gamechangerUtils';
import { trackEvent } from '../../telemetry/Matomo';
import { setState } from '../../../utils/sharedFunctions';
import defaultMainViewHandler from '../default/defaultMainViewHandler';
import GameChangerAPI from '../../api/gameChanger-service-api';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import ReactTable from 'react-table';
import './budgetsearch.css';

const gameChangerAPI = new GameChangerAPI();

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
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		margin: '2px 5px 0px',
	},
	titleText: {
		fontSize: 22,
		fontWeight: 500,
		color: '#131E43',
	},
	tableColumn: {
		textAlign: 'left',
		margin: '4px 0',
	},
};

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
	background-color: #eff2f6;
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

const setBudgetSearchSetting = (field, value, state, dispatch) => {
	const budgetSearchSettings = _.cloneDeep(state.budgetSearchSettings);
	switch (field) {
		case 'dataSources':
			const dataSourceIndex = budgetSearchSettings.dataSources.indexOf(value);
			if (dataSourceIndex !== -1) {
				budgetSearchSettings.dataSources.splice(dataSourceIndex, 1);
			} else {
				budgetSearchSettings.dataSources.push(value);
			}
			break;
		case 'clearDataSources':
			budgetSearchSettings.dataSources = [];
			break;
		default:
			break;
	}

	setState(dispatch, { budgetSearchSettings });
};

const BudgetSearchMainViewHandler = {
	async handlePageLoad(props) {
		const { state, dispatch } = props;

		await defaultMainViewHandler.handlePageLoad(props);
		const url = window.location.href;
		const searchText = getQueryVariable('q', url);
		if (!searchText) {
			setState(dispatch, { loading: true, cloneData: state.cloneData });
			const mainData = await gameChangerAPI.callSearchFunction({
				functionName: 'getMainPageData',
				cloneName: state.cloneData.clone_name,
				options: {
					resultsPage: state.resultsPage,
				},
			});
			setState(dispatch, { mainPageData: mainData.data, loading: false });
			console.log(mainData);
		}
	},

	getMainView(props) {
		const { state, dispatch } = props;

		const { loading, mainPageData, resultsPage, budgetSearchSettings } = state;

		const renderCheckboxes = () => {
			const filterOptions = [];
			const dataSources = [
				'RDocs Historical',
				'PDocs (JSON) Historical',
				'RDocs FY21',
				'PDocs FY21',
				'RDocs FY22',
				'PDocs FY22',
			];

			for (const dataSource of dataSources) {
				filterOptions.push(
					<FormControlLabel
						name={dataSource}
						value={dataSource}
						style={{ margin: '0 20px 0 0' }}
						control={
							<Checkbox
								style={styles.filterBox}
								onClick={() =>
									setBudgetSearchSetting(
										'dataSources',
										dataSource,
										state,
										dispatch
									)
								}
								icon={
									<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />
								}
								checked={
									budgetSearchSettings &&
									budgetSearchSettings.dataSources &&
									budgetSearchSettings.dataSources.indexOf(dataSource) !== -1
								}
								checkedIcon={
									<i style={{ color: '#E9691D' }} className="fa fa-check" />
								}
								name={dataSource}
							/>
						}
						label={
							<span style={{ fontSize: 13, margin: '0 5px', fontWeight: 600 }}>
								{dataSource}
							</span>
						}
						labelPlacement="end"
					/>
				);
			}

			return (
				<>
					<div>{filterOptions}</div>
					<div style={{ margin: '0 15px 0 0' }}>
						<GCPrimaryButton
							style={{
								color: '#515151',
								backgroundColor: '#E0E0E0',
								borderColor: '#E0E0E0',
								height: '35px',
							}}
							onClick={() =>
								setBudgetSearchSetting('clearDataSources', '', state, dispatch)
							}
						>
							Clear Filters
						</GCPrimaryButton>
						<GCPrimaryButton
							style={{
								color: 'white',
								backgroundColor: '#1C2D64',
								borderColor: '#1C2D64',
								height: '35px',
							}}
							onClick={() => setState(dispatch, { runSearch: true })}
						>
							Review Filters
						</GCPrimaryButton>
					</div>
				</>
			);
		};

		const getMainPageColumns = () => {
			const mainPageColumns = [
				{
					Header: () => <p style={styles.tableColumn}>PER</p>,
					filterable: false,
					accessor: 'ProgramElementNumber_s',
					width: 150,
					Cell: (row) => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>;
					},
					id: 'per',
				},
				{
					Header: () => <p style={styles.tableColumn}>PROJECT TITLE</p>,
					filterable: false,
					accessor: 'ProjectTitle_s',
					width: 150,
					Cell: (row) => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>;
					},
					id: 'projectTitle',
				},
				{
					Header: () => <p style={styles.tableColumn}>PROJECT #</p>,
					filterable: false,
					accessor: 'ProjectNumber_s',
					width: 150,
					Cell: (row) => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>;
					},
					id: 'projectNum',
				},
				{
					Header: () => <p style={styles.tableColumn}>SERVICE</p>,
					filterable: false,
					accessor: 'ServiceAgencyName_s',
					width: 150,
					Cell: (row) => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>;
					},
					id: 'service',
				},
				{
					Header: () => <p style={styles.tableColumn}>KEY HITS</p>,
					filterable: false,
					accessor: 'keyHits',
					width: 150,
					Cell: (row) => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>;
					},
					id: 'keyHits',
				},
				{
					Header: () => <p style={styles.tableColumn}>COST CONTRIB</p>,
					filterable: false,
					accessor: 'costContributer',
					width: 150,
					Cell: (row) => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>;
					},
					id: 'costContributer',
				},
				{
					Header: () => <p style={styles.tableColumn}>AI LABEL</p>,
					filterable: false,
					accessor: 'aiLabel',
					width: 150,
					Cell: (row) => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>;
					},
					id: 'aiLabel',
				},
				{
					Header: () => <p style={styles.tableColumn}>REVIEW STATUS</p>,
					filterable: false,
					accessor: 'reviewStatus',
					width: 150,
					Cell: (row) => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>;
					},
					id: 'reviewStatus',
				},
			];

			return mainPageColumns;
		};

		const renderMainContainer = () => {
			return (
				<>
					<StyledMainTopBar id="game-changer-content-top">
						<div style={styles.titleText}>
							Filtered Results{' '}
							{mainPageData && mainPageData.totalCount
								? `(${mainPageData.totalCount})`
								: ''}
						</div>
						<div className="gcPagination">
							<Pagination
								activePage={resultsPage}
								itemsCountPerPage={10}
								totalItemsCount={mainPageData.totalCount}
								pageRangeDisplayed={8}
								onChange={(page) => {
									trackEvent(
										getTrackingNameForFactory(state.cloneData.clone_name),
										'PaginationChanged',
										'page',
										page
									);
									setState(dispatch, {
										resultsPage: page,
										runGetData: true,
										runSearch: true,
									});
									scrollToContentTop();
								}}
							/>
						</div>
					</StyledMainTopBar>
					<StyledMainBottomContainer>
						<ReactTable
							data={mainPageData ? mainPageData.docs : []}
							className={'striped'}
							noDataText={'No rows found'}
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
										overflow: 'auto',
									},
								};
							}}
							getTdProps={(state, rowInfo, column) => ({
								style: {
									whiteSpace: 'unset',
								},
							})}
							getTheadTrProps={(state, rowInfo, column) => {
								return { style: styles.tableHeaderRow };
							}}
							getTheadThProps={(state, rowInfo, column) => {
								return {
									style: {
										fontSize: 15,
										fontWeight: 'bold',
										whiteSpace: 'unset',
									},
								};
							}}
							style={{
								height: 'calc(100vh - 300px)',
								borderTopRightRadius: 5,
								borderTopLeftRadius: 5,
								marginBottom: 10,
							}}
							getTableProps={(state, rowInfo, column) => {
								return {
									style: {
										borderTopRightRadius: 5,
										borderTopLeftRadius: 5,
									},
								};
							}}
						/>
						<div className="gcPagination" style={{ textAlign: 'center' }}>
							<Pagination
								activePage={resultsPage}
								itemsCountPerPage={10}
								totalItemsCount={mainPageData.totalCount}
								pageRangeDisplayed={8}
								onChange={(page) => {
									console.log(page);
									trackEvent(
										getTrackingNameForFactory(state.cloneData.clone_name),
										'PaginationChanged',
										'page',
										page
									);
									setState(dispatch, {
										resultsPage: page,
										runGetData: true,
										runSearch: true,
									});
									scrollToContentTop();
								}}
							/>
						</div>
					</StyledMainBottomContainer>
					{/* </>
				} */}
				</>
			);
		};

		return (
			<StyledContainer className={'cool-class'}>
				<StyledFilterBar>{renderCheckboxes()}</StyledFilterBar>
				<StyledMainContainer>{renderMainContainer()}</StyledMainContainer>
			</StyledContainer>
		);
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
		// const {
		// 	context
		// } = props;

		// const {state, dispatch} = context;

		// const {
		// 	docSearchResults,
		// 	loading,
		// 	cloneData,
		// 	resultsPage,
		// 	searchText,
		// 	prevSearchText,
		// 	count,
		// } = state;

		const viewPanels = [];
		return viewPanels;
	},

	getCardViewPanel(props) {
		// const {
		// 	context
		// } = props;

		// const {state, dispatch} = context;

		return <div></div>;
	},
};

export default BudgetSearchMainViewHandler;
