import React from 'react';
import styled from 'styled-components';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

import GCPrimaryButton from '../../common/GCButton';

import { Typography, Grid, CircularProgress, Snackbar } from '@material-ui/core';
import Pagination from 'react-js-pagination';
import {
	getTrackingNameForFactory, scrollToContentTop, getQueryVariable
} from '../../../utils/gamechangerUtils';
import { trackEvent } from '../../telemetry/Matomo';
import { setState } from '../../../utils/sharedFunctions';
import defaultMainViewHandler from '../default/defaultMainViewHandler';
import ReactTable from 'react-table';
import DropdownFilter from './DropdownFilter.js';
import InputFilter from './InputFilter.js';
import './jbook.css';
import JBookWelcome from '../../aboutUs/JBookWelcomeModal';
import LandingImage from '../../../images/JAIC_banner.png';
import JAICLogo from '../../../images/logos/JAIC_logo.png';
import JBookFAQ from '../../aboutUs/JBookFAQ';
import FeedbackModal from './jbookFeedbackModal';
import QueryExp from './QueryExp.js';
import { Link } from '@mui/material';
import GameChangerAPI from '../../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();

const _ = require('lodash');

const fullWidthCentered = {
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center'
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
		margin: '2px 5px 0px'
	},
	titleText: {
		fontSize: 22,
		fontWeight: 500,
		color: '#131E43',
		margin: '20px 0',
		fontFamily: 'Montserrat'
	},
	tableColumn: {
		textAlign: 'center',
		margin: '4px 0',
	},
	tabsList: {
		borderBottom: `2px solid ${'#1C2D65'}`,
		padding: 0,
		display: 'flex',
		alignItems: 'center',
		flex: 9,
	},
	tabStyle: {
		border: `1px solid ${'#DCDCDC'}`,
		borderBottom: 'none !important',
		borderRadius: `6px 6px 0px 0px`,
		position: ' relative',
		listStyle: 'none',
		padding: '2px 12px',
		cursor: 'pointer',
		textAlign: 'center',
		backgroundColor: '#ffffff',
		marginRight: '2px',
		marginLeft: '2px',
		height: 45,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	tabSelectedStyle: {
		border: `1px solid ${'#0000001F'}`,
		backgroundColor: '#1C2D65',
		color: 'white',
	},
	tabContainer: {
		// alignItems: 'center',
		// minHeight: '613px',
	},
	tabButtonContainer: {
		backgroundColor: '#ffffff',
		width: '100%',
		paddingTop: 20
	},
	orangeText: {
		fontWeight: 'bold',
		color: '#E9691D'
	}
};

const StyledContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
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

const StyledSummaryFAQContainer = styled.div`
	margin-top: 30px;
	
	.summarySection {
		background-image: url(${LandingImage});
		width: 100%;
		height: 150px;
		border-radius: 4px;
		align-self: center;
		
		& .summaryTextSectionContainer {
			padding: 20px 0 20px 20px;
			align-self: center;
			
			& .summarySectionHeader {
				font-family: Montserrat;
				font-weight: bold;
				font-size: 34px;
				color: ${'#FFFFFF'}
			}
		}
		
	}
	
	.summaryLogoSectionContainer {
	    align-self: center;
	    margin-top: 20px;
	    
		& .summaryLogoSection {
		    text-align: center;
		    
			& .jaic-image {
				width: 380px;
				margin-top: -12px;
			}
		}
	}
	
	.summaryTextSection {
		
		& .summarySectionText {
			font-family: Noto Sans;
			font-size: 20px;
			margin-top: 10px;
			color: ${'#000000'};
		}
		
		& .summarySectionSubHeader {
			font-family: Noto Sans;
			font-size: 22px;
			margin-top: 10px;
			color: ${'#000000'};
			font-weight: bold;
		}
		
		& ul {
			margin: 10px 0;
			& li {
				font-family: Noto Sans;
				font-size: 20px;
			}
		}
	}

	.faqSection {
		margin-top 30px;
	}
`;

const setJBookSetting = (field, value, state, dispatch, filteredList = false) => {
	let jbookSearchSettings = _.cloneDeep(state.jbookSearchSettings);
	let dataSources = _.cloneDeep(state.dataSources);
	let runSearch = false;
	let resultsPage = state.resultsPage;
	let searchText = state.searchText;

	switch (field) {
		case 'sort':
			jbookSearchSettings.sort = value;
			runSearch = true;
			resultsPage = 1;
			break;
		case 'dataSources':
			const dataSourceIndex = dataSources.indexOf(value);
			if (dataSourceIndex !== -1) {
				dataSources.splice(dataSourceIndex, 1);
			}
			else {
				dataSources.push(value);
			}
			break;
		case 'clearText':
			jbookSearchSettings[field] = value;
			break;
		case 'clearDataSources':
			dataSources = [];
			jbookSearchSettings = _.cloneDeep(state.defaultOptions);
			runSearch = true;
			resultsPage = 1;
			searchText = '';
			break;
		case 'serviceAgency':
		case 'reviewStatus':
			if (value === 'all') {
				jbookSearchSettings[field] = state.defaultOptions[field];
			}
			else if (value === 'none') {
				jbookSearchSettings[field] = [];
			}
			else if (filteredList) {
				jbookSearchSettings[field] = value;
				runSearch = true;
				resultsPage = 1;
			}
			else {
				const typeIndex = jbookSearchSettings[field].indexOf(value);
				if (typeIndex !== -1) {
					jbookSearchSettings[field].splice(typeIndex, 1);
				}
				else {
					jbookSearchSettings[field].push(value);
				}
			}
			break;
		case 'hasKeywords':
		case 'primaryReviewer':
		case 'serviceReviewer':
		case 'budgetYear':
		case 'budgetType':
		case 'primaryClassLabel':
		case 'sourceTag':
			if (value === 'all') {
				jbookSearchSettings[field] = state.defaultOptions[field];
			}
			else if (value === 'none') {
				jbookSearchSettings[field] = [];
			}
			else if (filteredList) {
				jbookSearchSettings[field] = value;
				runSearch = true;
				resultsPage = 1;
			}
			else {
				const typeIndex = jbookSearchSettings[field].indexOf(value);
				if (typeIndex !== -1) {
					jbookSearchSettings[field].splice(typeIndex, 1);
				}
				else {
					jbookSearchSettings[field].push(value);
				}
			}
			break;
		case 'programElement':
		case 'projectNum':
		case 'projectTitle':
		case 'pocReviewer':
			jbookSearchSettings[field] = value;
			resultsPage = 1;
			break;
		default:
			break;
	}
	setState(dispatch, { jbookSearchSettings, dataSources, runSearch, searchText, resultsPage, loading: runSearch });
};

const handleTabClicked = (dispatch, state, tab) => {

	const { tabs } = state;
	const isSummary = tabs[tab] === 'summary';

	const paramsIndex = window.location.hash.indexOf('?');
	let params = '';
	if (paramsIndex !== -1) {
		params = window.location.hash.substring(paramsIndex);
	}
	else {
		params = state.queryParams;
	}

	setState(dispatch, { mainTabSelected: tab });
	if (isSummary) {
		setState(dispatch, { queryParams: params });
	}

	window.history.replaceState(undefined, undefined, `#/jbook/${tabs[tab]}${isSummary ? '' : params}`);
};

export const scrollListViewTop = () => {
	if (document.getElementById('list-view-tbody')) {
		document.getElementById('list-view-tbody').scrollTop = 0;
	}
};

const filterSortFunction = (a, b) => {
	if (a === 'Blank' && b === 'Unknown') {
		return -1;
	} else if (a === 'Unknown' && b === 'Blank') {
		return 1;
	} else if (a === 'Blank' || a === 'Unknown') {
		return 1;
	} else if (b === 'Blank' || b === 'Unknown') {
		return -1;
	} else {
		if (a.toUpperCase() < b.toUpperCase()) {
			return -1;
		}
		if (a.toUpperCase() > b.toUpperCase()) {
			return 1;
		}

		return 0;
	}
};

const populateDropDowns = async (state, dispatch) => {
	const jbookSearchSettings = _.cloneDeep(state.jbookSearchSettings);
	const defaultOptions = _.cloneDeep(state.defaultOptions);

	const { data } = await gameChangerAPI.callSearchFunction({
		functionName: 'getDataForFilters',
		cloneName: state.cloneData.clone_name,
		options: {},
	});

	jbookSearchSettings.budgetYear = defaultOptions.budgetYear = data.budgetYear.map(year => year !== null ? year : 'Blank').sort(filterSortFunction);
	jbookSearchSettings.reviewStatus = defaultOptions.reviewStatus = data.reviewstatus.map(status => status !== null ? status : 'Blank').sort(filterSortFunction);
	jbookSearchSettings.serviceAgency = defaultOptions.serviceAgency = data.serviceAgency.map(agency => agency !== null ? agency : 'Blank').sort(filterSortFunction);
	jbookSearchSettings.primaryClassLabel = defaultOptions.primaryClassLabel = data.primaryclasslabel.map(label => label !== null ? label : 'Blank').sort(filterSortFunction);
	jbookSearchSettings.sourceTag = defaultOptions.sourceTag = data.sourcetag.map(tag => tag !== null ? tag : 'Blank').sort(filterSortFunction);

	let dropdownData;
	try {
		dropdownData = await gameChangerAPI.callDataFunction({
			functionName: 'getBudgetDropdownData',
			cloneName: 'jbook',
			options: {}
		});

		if (dropdownData && dropdownData.data) {

			dropdownData = dropdownData.data;
			dropdownData.serviceReviewers.push({ name: 'Blank' });

			jbookSearchSettings.primaryReviewer = defaultOptions.primaryReviewer = dropdownData.reviewers.map(reviewer => reviewer !== null && reviewer.name !== null ? `${reviewer.name}${reviewer.organization ? ` (${reviewer.organization})` : ''}` : 'Blank').sort(filterSortFunction);
			jbookSearchSettings.serviceReviewer = defaultOptions.serviceReviewer = dropdownData.serviceReviewers.map(reviewer => reviewer !== null && reviewer.name !== null ? `${reviewer.name}${reviewer.organization ? ` (${reviewer.organization})` : ''}` : 'Blank').concat(dropdownData.secondaryReviewers.map(reviewer => reviewer !== null && reviewer.name !== null ? `${reviewer.name}${reviewer.organization ? ` (${reviewer.organization})` : ''}` : 'Blank')).sort(filterSortFunction);

			jbookSearchSettings.primaryReviewer.push('Unknown');
			jbookSearchSettings.primaryReviewer.push('Blank');

			jbookSearchSettings.serviceReviewer.push('Blank');
			defaultOptions.serviceReviewer.push('Blank');

		}
		else {
			jbookSearchSettings.primaryReviewer = defaultOptions.primaryReviewer = data.primaryreviewer.map(reviewer => reviewer !== null ? reviewer : 'Blank').sort(filterSortFunction);
			jbookSearchSettings.serviceReviewer = defaultOptions.serviceReviewer = data.servicereviewer.map(reviewer => reviewer !== null ? reviewer : 'Blank').sort(filterSortFunction);
		}
	} catch (err) {
		console.log('Error fetching dropdown data');
		console.log(err);
	}

	return { defaultOptions, jbookSearchSettings, dropdownData };

	// if (initial) {
	// 	setState(dispatch, {loading: true, runSearch: true, defaultOptions, jbookSearchSettings, dropdownData });
	// } else {
	// 	setState(dispatch, {defaultOptions, dropdownData });
	// }
};

const autoDownloadFile = ({ data, filename = 'results', extension = 'txt' }) => {
	//Create a link element, hide it, direct it towards the blob, and then 'click' it programatically

	const a = document.createElement('a');
	a.style = 'display: none';
	document.body.appendChild(a);
	//Create a DOMString representing the blob 
	//and point the link element towards it
	const url = window.URL.createObjectURL(data);
	a.href = url;
	a.download = `${filename}.${extension}`;
	//programatically click the link to trigger the download
	a.click();
	//release the reference to the file by revoking the Object URL
	window.URL.revokeObjectURL(url);
	document.body.removeChild(a);
};

const jbookMainViewHandler = {
	async handlePageLoad(props) {
		const {
			dispatch,
			state,
		} = props;

		// const interval = setInterval(() => {
		// 	populateDropDowns(state, dispatch);
		// }, 1000 * 60);

		gameChangerAPI.updateClonesVisited(state.cloneData.clone_name);

		const { jbookSearchSettings, defaultOptions, dropdownData } = await populateDropDowns(state, dispatch);

		const url = window.location.href;
		const searchText = getQueryVariable('q', url) ?? '';


		let mainTabSelected = 0;
		if (window.location.hash.indexOf('#/jbook/checklist') !== -1) {
			mainTabSelected = 1;
		}

		// the main setstate that triggers the initial search
		setState(dispatch, { searchText, loading: true, runSearch: true, mainTabSelected, urlSearch: true, jbookSearchSettings, defaultOptions, dropdownData });

	},


	getMainView(props) {
		const {
			state,
			dispatch,
			searchHandler
		} = props;

		const {
			loading,
			mainPageData,
			resultsPage,
			mainTabSelected,
			exportLoading,
			feedbackSubmitted,
			feedbackText
		} = state;

		const setDropdown = (name, value) => {
			if (name === 'all') {
				setState(dispatch, { budgetTypeDropdown: false, serviceAgencyDropdown: false, reviewStatusDropdown: false });
			}
			else {
				setState(dispatch, {
					budgetTypeDropdown: false,
					budgetYearDropdown: false,
					serviceAgencyDropdown: false,
					primaryReviewerDropdown: false,
					serviceReviewerDropdown: false,
					reviewStatusDropdown: false,
					primaryClassLabelDropdown: false,
					sourceTagDropdown: false,
					hasKeywordsDropdown: false,
					[name]: value
				});
			}
		};

		const getMainPageColumns = () => {

			const mainPageColumns = [
				{
					Header: () => <p style={styles.tableColumn}>ID</p>,
					accessor: 'id',
					width: 190,
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					headerStyle: {
						overflow: 'visible'
					},
					id: 'id',
					sortable: false,
					show: false
				},
				{
					Header: () => <p style={styles.tableColumn}>BUDGET TYPE <span style={styles.orangeText}>{state.jbookSearchSettings.budgetType.length === state.defaultOptions.budgetType.length ? '' : `(${state.jbookSearchSettings.budgetType.length})`}</span></p>,
					Filter: () => <DropdownFilter setOpenDropdown={setDropdown} openDropdown={state.budgetTypeDropdown} setJBookSetting={setJBookSetting} type={'budgetType'} options={state.defaultOptions.budgetType} clearText={state.jbookSearchSettings.clearText} />,
					accessor: 'type',
					width: 130,
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					headerStyle: {
						overflow: 'visible'
					},
					id: 'budgetType',
					sortable: false
				},
				{
					Header: () => <p style={styles.tableColumn}>BUDGET YEAR (FY) <span style={styles.orangeText}>{state.jbookSearchSettings.budgetYear.length === state.defaultOptions.budgetYear.length ? '' : `(${state.jbookSearchSettings.budgetYear.length})`}</span></p>,
					Filter: () => <DropdownFilter setOpenDropdown={setDropdown} openDropdown={state.budgetYearDropdown} setJBookSetting={setJBookSetting} type={'budgetYear'} options={state.defaultOptions.budgetYear} clearText={state.jbookSearchSettings.clearText} />,
					accessor: 'budgetYear',
					width: 130,
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					headerStyle: {
						overflow: 'visible'
					},
					id: 'budgetYear',
				},
				{
					Header: () => <p style={styles.tableColumn}>PROGRAM ELEMENT / BUDGET LINE ITEM</p>,
					Filter: () => <InputFilter setJBookSetting={setJBookSetting} field={'programElement'} />,
					accessor: row => row.budgetLineItem && row.budgetLineItem !== '-' ? row.budgetLineItem : row.programElement,
					width: 180,
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					id: 'programElement'
				},
				{
					Header: () => <p style={styles.tableColumn}>PROJECT #</p>,
					Filter: () => <InputFilter setJBookSetting={setJBookSetting} field={'projectNum'} />,
					accessor: 'projectNum',
					width: 155,
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					id: 'projectNum'
				},
				{
					Header: () => <p style={styles.tableColumn}>PROJECT TITLE</p>,
					Filter: () => <InputFilter setJBookSetting={setJBookSetting} field={'projectTitle'} />,
					accessor: 'projectTitle',
					width: 190,
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					id: 'projectTitle'
				},
				{
					Header: () => <p style={styles.tableColumn}>SERVICE / AGENCY <span style={styles.orangeText}>{state.jbookSearchSettings.serviceAgency.length === state.defaultOptions.serviceAgency.length ? '' : `(${state.jbookSearchSettings.serviceAgency.length})`}</span></p>,
					Filter: () => <DropdownFilter setOpenDropdown={setDropdown} openDropdown={state.serviceAgencyDropdown} setJBookSetting={setJBookSetting} type={'serviceAgency'} options={state.defaultOptions.serviceAgency} clearText={state.jbookSearchSettings.clearText} />,
					accessor: 'serviceAgency',
					width: 150,
					headerStyle: {
						overflow: 'visible'
					},
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					id: 'serviceAgency'
				},
				{
					Header: () => <p style={styles.tableColumn}>PRIMARY REVIEWER <span style={styles.orangeText}>{state.jbookSearchSettings.primaryReviewer.length === state.defaultOptions.primaryReviewer.length ? '' : `(${state.jbookSearchSettings.primaryReviewer.length})`}</span></p>,
					Filter: () => <DropdownFilter setOpenDropdown={setDropdown} openDropdown={state.primaryReviewerDropdown} setJBookSetting={setJBookSetting} type={'primaryReviewer'} options={state.defaultOptions.primaryReviewer} clearText={state.jbookSearchSettings.clearText} />,
					accessor: 'primaryReviewer',
					width: 130,
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					headerStyle: {
						overflow: 'visible'
					},
					id: 'primaryReviewer',
				},
				{
					Header: () => <p style={styles.tableColumn}>SERVICE REVIEWER <span style={styles.orangeText}>{state.jbookSearchSettings.serviceReviewer.length === state.defaultOptions.serviceReviewer.length ? '' : `(${state.jbookSearchSettings.serviceReviewer.length})`}</span></p>,
					Filter: () => <DropdownFilter setOpenDropdown={setDropdown} openDropdown={state.serviceReviewerDropdown} setJBookSetting={setJBookSetting} type={'serviceReviewer'} options={state.dropdownData && state.dropdownData.serviceReviewers ? state.dropdownData.serviceReviewers.map(r => `${r.name}${r.organization ? ` (${r.organization})` : ''}`) ?? [] : []} secondaryOptions={state.dropdownData && state.dropdownData.secondaryReviewers ? state.dropdownData.secondaryReviewers.map(r => `${r.name}${r.organization ? ` (${r.organization})` : ''}`) : []} secondaryTitle={'Secondary'} clearText={state.jbookSearchSettings.clearText} />,
					accessor: row => row.serviceSecondaryReviewer && row.serviceSecondaryReviewer !== '' ? row.serviceSecondaryReviewer : row.serviceReviewer,
					width: 130,
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					headerStyle: {
						overflow: 'visible'
					},
					id: 'serviceReviewer',
				},
				{
					Header: () => <p style={styles.tableColumn}>POC REVIEWER</p>,
					Filter: () => <InputFilter setJBookSetting={setJBookSetting} field={'pocReviewer'} />,
					accessor: row => row.altPOCName && row.altPOCName !== '' ? row.altPOCOrg ? `${row.altPOCName} (${row.altPOCOrg})` : row.altPOCName : row.servicePOCOrg ? `${row.servicePOCName} (${row.servicePOCOrg})` : row.servicePOCName,
					width: 120,
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					headerStyle: {
						overflow: 'visible'
					},
					id: 'pocReviewer',
				},
				{
					Header: () => <p style={styles.tableColumn}>KEYWORD(S)</p>,
					accessor: row => row.keywords,
					width: 150,
					show: false,
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					id: 'keywords'
				},
				{
					Header: () => <p style={styles.tableColumn}>REVIEW STATUS <span style={styles.orangeText}>{state.jbookSearchSettings.reviewStatus.length === state.defaultOptions.reviewStatus.length ? '' : `(${state.jbookSearchSettings.reviewStatus.length})`}</span></p>,
					accessor: 'reviewStatus',
					width: 140,
					sortable: false,
					Filter: () => <DropdownFilter right={'5px'} setOpenDropdown={setDropdown} openDropdown={state.reviewStatusDropdown} setJBookSetting={setJBookSetting} type={'reviewStatus'} options={state.defaultOptions.reviewStatus} clearText={state.jbookSearchSettings.clearText} />,
					Cell: row => {
						return (
							<div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
								{row.value}
							</div>
						);
					},
					headerStyle: {
						overflow: 'visible'
					},
					id: 'serviceReviewStatus'
				},
				{
					Header: () => <p style={styles.tableColumn}>HAS KEYWORDS <span style={styles.orangeText}>{state.jbookSearchSettings.hasKeywords.length === 2 ? '' : `(${state.jbookSearchSettings.hasKeywords.length})`}</span></p>,
					Filter: () => <DropdownFilter right={'5px'} setOpenDropdown={setDropdown} openDropdown={state.hasKeywordsDropdown} setJBookSetting={setJBookSetting} type={'hasKeywords'} options={['Yes', 'No']} clearText={state.jbookSearchSettings.clearText} />,
					accessor: 'hasKeywords',
					width: 100,
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							{row.value ? <i style={{ color: 'green' }} className='fa fa-check' /> : <i style={{ color: 'red' }} className='fa fa-times' />}
						</div>
					),
					sortable: false,
					id: 'hasKeywords',
					headerStyle: {
						overflow: 'visible'
					},
					show: true
				},
				{
					Header: () => <p style={styles.tableColumn}>LABEL(S) <span style={styles.orangeText}>{state.jbookSearchSettings.primaryClassLabel.length === state.defaultOptions.primaryClassLabel.length ? '' : `(${state.jbookSearchSettings.primaryClassLabel.length})`}</span></p>,
					accessor: 'reviewStatus',
					Filter: () => <DropdownFilter right={'5px'} setOpenDropdown={setDropdown} openDropdown={state.primaryClassLabelDropdown} setJBookSetting={setJBookSetting} type={'primaryClassLabel'} options={state.defaultOptions.primaryClassLabel} clearText={state.jbookSearchSettings.clearText} />,
					width: 150,
					sortable: false,
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value === 'Finished Review' ? row.original.pocClassLabel ?? row.original.serviceClassLabel ?? row.original.primaryClassLabel : row.value === 'Partial Review (POC)' ? row.original.serviceClassLabel ?? row.original.primaryClassLabel : row.original.primaryClassLabel}</p>
						</div>
					),
					headerStyle: {
						overflow: 'visible'
					},
					id: 'primaryClassLabel',
				},
				{
					Header: () => <p style={styles.tableColumn}>SOURCE <span style={styles.orangeText}>{state.jbookSearchSettings.sourceTag.length === state.defaultOptions.sourceTag.length ? '' : `(${state.jbookSearchSettings.sourceTag.length})`}</span></p>,
					Filter: () => <DropdownFilter right={'5px'} setOpenDropdown={setDropdown} openDropdown={state.sourceTagDropdown} setJBookSetting={setJBookSetting} type={'sourceTag'} options={state.defaultOptions.sourceTag} clearText={state.jbookSearchSettings.clearText} />,
					accessor: 'sourceTag',
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					headerStyle: {
						overflow: 'visible'
					},
					width: 180,
					id: 'sourceTag'
				},
				{
					Header: () => <p style={styles.tableColumn}>BUDGET LINE ITEM #</p>,
					accessor: 'budgetLineItem',
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					id: 'budgetLineItem',
					show: false
				},
				{
					Header: () => <p style={styles.tableColumn}>APPROPRIATION NUMBER</p>,
					accessor: 'appropriationNumber',
					Cell: row => (
						<div style={{ textAlign: 'center' }}>
							<p>{row.value}</p>
						</div>
					),
					id: 'appropriationNumber',
					show: false
				},
			];

			return mainPageColumns;
		};

		const renderMainContainer = ({ state }) => {
			const { searchText } = state;
			return (
				<>
					<Snackbar
						anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
						open={feedbackSubmitted}
						onClose={() => setState(dispatch, { feedbackSubmitted: false })}
						message={feedbackText}
						autoHideDuration={3000}
					/>
					<Grid container style={{ background: '#f2f2f2', borderRadius: 6, marginTop: 10, padding: 10 }}>
						<Grid item xs={11}>
							<Typography style={{ fontFamily: 'Montserrat', fontSize: 20, fontWeight: 500, color: 'rgb(19, 30, 67)' }}>Service Reviewer O&M Form</Typography>
							<Typography style={{ fontFamily: 'Montserrat', fontSize: 16 }}>Please use the link provided below to access the Service Reviewer O&M form.</Typography>
							<Typography style={{ fontFamily: 'Montserrat', fontSize: 16 }}>*Users required to submit an O&M form have been notified of the requirement. Please do not complete an O&M form unless requested to do so.</Typography>
						</Grid>
						<Grid item xs={1} style={{ alignSelf: 'center' }}>
							<Link
								underline={'none'}
								href={'https://forms.osi.apps.mil/Pages/ResponsePage.aspx?id=kQEtEK7uYUexyxqD6G70ReEn65mxjY9GoAbY9R1q21tURUw2OERBOU41R1RROTJVMkZWNUNIM01ZSi4u'}
								target="_blank"
							>
								<Typography style={{ fontSize: 20, fontWeight: 500 }} color={'inherit'}>O&M Form ></Typography>
							</Link>
						</Grid>
					</Grid>
					<StyledMainTopBar id="game-changer-content-top">
						<div style={styles.titleText}>
							Results {mainPageData && mainPageData.totalCount ? `(${mainPageData.totalCount})`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
						</div>
						<div className='gcPagination' style={{ display: 'flex', alignItems: 'center' }}>
							<GCPrimaryButton
								style={{ minWidth: 'unset', color: 'white', backgroundColor: '#1C2D64', borderColor: '#1C2D64', height: '45px', marginRight: '10px' }} // padding: '0px', width: '49px',
								onClick={async () => {
									try {
										setState(dispatch, { exportLoading: true });
										const data = await searchHandler.exportSearch(state, dispatch);

										const blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
										const d = new Date();
										await autoDownloadFile({ data: blob, extension: 'csv', filename: 'checklist-data-' + d.toISOString() });
										setState(dispatch, { exportLoading: false });

									} catch (e) {
										console.log(e);
									}
								}}
							>
								{!exportLoading ?
									'Export'
									:
									<CircularProgress color="#515151" size={25} style={{ margin: '8px' }} />
								}
								{/* <img src={ExportIcon} style={{ margin: '0 0 3px 5px', width: 20, opacity: !mainPageData || (mainPageData.docs && mainPageData.docs.length <= 0) ? .6 : 1 }} alt="export"/> */}
							</GCPrimaryButton>
							<GCPrimaryButton
								style={{ color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '45px', marginRight: '20px' }}
								onClick={() => { setJBookSetting('clearDataSources', '', state, dispatch) }}
							>
								Clear Filters
							</GCPrimaryButton>
							<Pagination
								activePage={resultsPage}
								itemsCountPerPage={18}
								totalItemsCount={mainPageData.totalCount}
								pageRangeDisplayed={8}
								onChange={page => {
									trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'PaginationChanged', 'page', page);
									setState(dispatch, { resultsPage: page, runSearch: true, loading: true });
									scrollToContentTop();
								}}
							/>
						</div>
					</StyledMainTopBar>
					<StyledMainBottomContainer>
						<ReactTable
							manual
							sorted={state.jbookSearchSettings.sort}
							onSortedChange={(newSorted) => {
								setJBookSetting('sort', newSorted, state, dispatch);
							}}
							filterable={true}
							data={mainPageData ? mainPageData.docs : []}
							// onFetchData={(s) => {if(mainPageFetchData) mainPageFetchData(s, state, dispatch)}}
							className={'-striped -highlight'}
							noDataText={'No rows found'}
							loading={loading}
							columns={getMainPageColumns()}
							editable={false}
							minRows={1}
							multiSort={false}
							showPageSizeOptions={false}
							showPagination={false}
							defaultFilterMethod={(filter, row, column) => {
								const id = filter.pivotId || filter.id;
								return row[id] ? String(row[id].toLowerCase()).startsWith(filter.value.toLowerCase()) : true;
							}}
							getTbodyProps={(state, rowInfo, column) => {
								return {
									style: {
										overflowY: 'auto',
										overflowX: 'hidden'
									},
									id: 'list-view-tbody'
								};
							}}
							getTdProps={(state, rowInfo, column) => ({
								style: {
									whiteSpace: 'unset',
								},
							})
							}
							getTheadThProps={(state, rowInfo, column) => {
								return { style: { fontSize: 15, fontWeight: 'bold', whiteSpace: 'unset' } };
							}}
							getTheadTrProps={(state, rowInfo, column) => {
								return { style: { overflow: 'visible' } };
							}}
							style={{
								height: 'calc(100vh - 340px)',
								borderTopRightRadius: 5,
								borderTopLeftRadius: 5,
								marginBottom: 10
							}}
							getTableProps={(state, rowInfo, column) => {
								return {
									style: {
										borderTopRightRadius: 5,
										borderTopLeftRadius: 5,
										overflow: 'auto'
									}
								};
							}}
							getTrProps={(state, rowInfo, column) => {
								return {
									style: { cursor: 'pointer' },
									onClick: () => {
										const row = rowInfo.row;
										const {
											projectTitle,
											projectNum,
											budgetLineItem,
											budgetType,
											keywords,
											budgetYear,
											id,
											appropriationNumber
										} = row;
										// I do not understand why row changes programElement into BLI
										const programElement = rowInfo.original.programElement;
										let url = `#/jbook/profile?title=${projectTitle}&programElement=${programElement}&projectNum=${projectNum}&type=${encodeURIComponent(budgetType)}&budgetLineItem=${budgetLineItem}&budgetYear=${budgetYear}&searchText=${searchText}&id=${id}&appropriationNumber=${appropriationNumber}`;
										if (keywords && keywords.length) {
											url += `&keywords=${keywords}`;
										}
										window.open(url);
									},
								};
							}}
						/>
						<div className='gcPagination' style={{ textAlign: 'center' }}>
							<Pagination
								activePage={resultsPage}
								itemsCountPerPage={18}
								totalItemsCount={mainPageData.totalCount}
								pageRangeDisplayed={8}
								onChange={page => {
									trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'PaginationChanged', 'page', page);
									setState(dispatch, { resultsPage: page, runSearch: true, loading: true });
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

		const renderSummaryAndFAQ = () => {
			return (
				<StyledSummaryFAQContainer>
					<Grid container className={'summarySection'}>
						<Grid item xs={12} className={'summaryTextSectionContainer'}>
							<Typography className={'summarySectionHeader'}>Congressionally-Mandated Inventory of DoD AI Programs | Summary and FAQ</Typography>
						</Grid>
					</Grid>
					<Grid container>
						<Grid item xs={12}>
							<Grid container className={'summaryTextSection'}>
								<Grid item xs={8}>
									<Typography className={'summarySectionSubHeader'}>Welcome to the Phase II DoD AI Inventory!</Typography>
									<Typography className={'summarySectionText'}>Click <a href="https://wiki.advana.data.mil/display/SDKB/GAMECHANGER+Training+Resources">here</a> to view our User Guide.</Typography>
									<Typography className={'summarySectionText'}>As part of the FY21 Defense Appropriations Bill, Congress tasked the Director of the DoD Joint AI Center to provide the congressional defense committees an inventory of all DoD artificial intelligence activities, to include each:</Typography>
									<ul className={'summarySectionList'}>
										<li>program’s appropriation, project, and (budget) line number</li>
										<li>the current and future years defense program funding (FY21-FY25)</li>
										<li>the identification of academic or industry mission partners, if applicable</li>
										<li>any planned transition partners, if applicable</li>
									</ul>
									<Typography className={'summarySectionText'}>
										Over the past year, JAIC has worked closely with OUSD(R&E), OUSD(C), the Services, and other DoD Component representatives of the DoD AI Working Group in scoping and executing this task. We delivered the Phase I Inventory of DoD AI Programs in April 2021.
									</Typography>
									<Typography className={'summarySectionText'}>
										In partnership with OUSD(C), the JAIC is executing the Phase II AI Inventory via the Advana Platform, which the Deputy Secretary of Defense has officially designated “as the single enterprise authoritative data management and analytics platform.”
									</Typography>
								</Grid>
								<Grid item xs={4} className={'summaryLogoSectionContainer'}>
									<div className={'summaryLogoSection'}>
										<img
											src={JAICLogo}
											alt="jaic-title"
											id={'titleButton'}
											className={'jaic-image'}
										/>
									</div>
								</Grid>

							</Grid>
							<div className={'summaryTextSection'}>
								<Typography className={'summarySectionText'}>
									Using the Advana Gamechanger platform, you will be able to easily review key budget and contracting data about AI-related programs and projects and input additional information needed to complete this congressionally mandated tasking.
								</Typography>
								<Typography className={'summarySectionText'}>
									Phase II of the AI Inventory (to be submitted to Congress in early 2022) will result in a tool that addresses limitations of Phase I deliverable and includes an inventory of classified programs. The Phase II inventory will be conducted via a three-part data coordination and review process: at the JAIC-level, Service-level, and program POC-level.
								</Typography>
								<Typography className={'summarySectionText'}>
									JAIC-Level Review: The JAIC will publish and refine the SIPR and NIPR tools, and review the inventory data to initially classify projects and programs as either AI-core, AI-enabled, or AI-enabling.
								</Typography>
								<Typography className={'summarySectionText'}>
									Service-Level Review: After initial classification and tool refinement, the Services will confirm classification of the projects and programs, which will be followed by detailed analysis of each project or program at the POC-level.
								</Typography>
								<Typography className={'summarySectionText'}>
									Program PoC-Level Review: The POCs will provide more detailed information on each program and project, to include: Joint Capability Area, Type of AI, AI domain & task.
								</Typography>
								<Typography className={'summarySectionText'}>
									After all phases of coordination and review, the final PAT and Phase II of the inventory will be submitted to Congress in early 2022. After that time, this dataset will be made available to the entire DoD AI community for use in their analysis and planning.
								</Typography>
							</div>
						</Grid>
					</Grid>
					<div className={'faqSection'}>
						<JBookFAQ />
					</div>
				</StyledSummaryFAQContainer>
			);
		};


		return (
			<>
				<FeedbackModal state={state} dispatch={dispatch} />
				<JBookWelcome dispatch={dispatch} state={state} />
				<StyledContainer className={'cool-class'}>
					{/* <StyledFilterBar>
						{renderCheckboxes()}
					</StyledFilterBar> */}
					<StyledMainContainer>
						<QueryExp searchText={state.searchText ? state.searchText : ''} />
						<Tabs selectedIndex={mainTabSelected ?? 0}>
							<div style={styles.tabButtonContainer}>
								<TabList style={styles.tabsList}>
									<div style={{ flex: 1, display: 'flex' }}>
										<Tab style={{
											...styles.tabStyle,
											...(mainTabSelected === 0 ? styles.tabSelectedStyle : {}),
											borderRadius: `5px 5px 0 0`
										}} title="summaryFAQ" onClick={() => handleTabClicked(dispatch, state, 0)}
										>
											<Typography variant="h6" display="inline" title="summaryFAQ">SUMMARY AND FAQ</Typography>

										</Tab>
										<Tab style={{
											...styles.tabStyle,
											...(mainTabSelected === 1 ? styles.tabSelectedStyle : {}),
											borderRadius: `5px 5px 0 0`
										}} title="reviewerChecklist" onClick={() => handleTabClicked(dispatch, state, 1)}
										>
											<Typography variant="h6" display="inline" title="reviewerChecklist">REVIEWER CHECKLIST</Typography>
										</Tab>
									</div>
									<div style={{ flex: 1, display: 'flex', justifyContent: 'end', paddingBottom: '2px' }}>
										<GCPrimaryButton
											style={{ color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '45px', marginRight: '20px' }}
											onClick={() => setState(dispatch, { feedbackModalOpen: true })}
										>
											User Feedback
										</GCPrimaryButton>
									</div>
								</TabList>

								<div style={styles.panelContainer}>
									<TabPanel>
										{renderSummaryAndFAQ()}
									</TabPanel>
									<TabPanel>
										{renderMainContainer({ state })}
									</TabPanel>
								</div>
							</div>
						</Tabs>

					</StyledMainContainer>
				</StyledContainer>
			</>
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

		return (
			<div>
			</div>
		);
	}
};

export default jbookMainViewHandler;
