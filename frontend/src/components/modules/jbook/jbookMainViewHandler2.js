import React from 'react';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';


// ===== gc look and feel ======
import GCPrimaryButton from '../../common/GCButton';
import GetQAResults from '../default/qaResults';
import ViewHeader from '../../mainView/ViewHeader';
import {Card} from '../../cards/GCCard';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
// ==============================
import {CircularProgress, Grid, Snackbar, Typography} from '@material-ui/core';
import Pagination from 'react-js-pagination';
import {
	getQueryVariable,
	getTrackingNameForFactory,
	scrollToContentTop,
	StyledCenterContainer,
} from '../../../utils/gamechangerUtils';
import {trackEvent} from '../../telemetry/Matomo';
import {setState} from '../../../utils/sharedFunctions';
import defaultMainViewHandler from '../default/defaultMainViewHandler';
import ReactTable from 'react-table';
import DropdownFilter from './DropdownFilter.js';
import InputFilter from './InputFilter.js';
import './jbook.css';
import JBookWelcome from '../../aboutUs/JBookWelcomeModal';
import JAICLogo from '../../../images/logos/JAIC_logo.png';
import JBookFAQ from '../../aboutUs/JBookFAQ';
import FeedbackModal from './jbookFeedbackModal';
import {
	StyledMainBottomContainer,
	StyledMainTopBar,
	StyledSummaryFAQContainer,
	styles
} from './jbookMainViewStyles';
import {autoDownloadFile, handleTabClicked, populateDropDowns, setJBookSetting} from './jbookMainViewHelper';
import QueryExp from './QueryExp.js'
import {Link} from '@mui/material';
import ResultView from '../../mainView/ResultView';
import GameChangerAPI from '../../api/gameChanger-service-api';
import JBookAboutUs from '../../aboutUs/JBookAboutUs';

const _ = require('lodash');

const gameChangerAPI = new GameChangerAPI();

export const GC_COLORS = {
	primary: '#131E43',
	secondary: '#E9691D'
};

const getSearchResults = (searchResultData, state, dispatch) => {
	console.log(searchResultData);
	console.log(state);
	return _.map(searchResultData, (item, idx) => {
		item.type = 'document';
		return (
			<Card key={idx} item={item} idx={idx} state={state} dispatch={dispatch} />
		);
	});
};

const jbookMainViewHandler = {
	async handlePageLoad(props) {
		const {
			dispatch,
			state,
		} = props;
		console.log('handle page load');

		gameChangerAPI.updateClonesVisited(state.cloneData.clone_name);

		const { jbookSearchSettings, defaultOptions, dropdownData } = await populateDropDowns(state, dispatch);

		const url = window.location.href;
		const searchText = getQueryVariable('q', url) ?? '';
		let mainTabSelected = 0;
		// if (window.location.hash.indexOf('#/jbook/checklist') !== -1) {
		// 	mainTabSelected = 1;
		// }
		// the main setstate that triggers the initial search
		setState(dispatch, { searchText, loading: true, runSearch: true, mainTabSelected, urlSearch: true, jbookSearchSettings, defaultOptions, dropdownData });
	},

	renderHideTabs(props) {
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
	},

	getMainView(props) {
		const {
			state,
			dispatch,
			searchHandler,
			getViewPanels,
			pageLoaded,
		} = props;

		const {
			loading,
			mainPageData,
			resultsPage,
			exportLoading,
			feedbackSubmitted,
			feedbackText,
			viewNames,
			currentViewName,
		} = state;

		const noResults = Boolean(!mainPageData.docs || mainPageData?.docs?.length === 0);
		const hideSearchResults = noResults && loading;

		const setDropdown = (name, value) => {
			if (name === 'all') {
				setState(dispatch, { budgetTypeDropdown: false, serviceAgencyDropdown: false, reviewStatusDropdown: false })
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
				})
			}
		}

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
						)
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
		}

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
								onClick={() => { setJBookSetting('clearDataSources', '', state, dispatch); }}
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
								return row[id] ? String(row[id].toLowerCase()).startsWith(filter.value.toLowerCase()) : true
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
								}
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
								}
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
			)
		}

		return (
			<>
				<FeedbackModal state={state} dispatch={dispatch} />
				<JBookWelcome dispatch={dispatch} state={state} />
				{loading && currentViewName !== 'Explorer' && (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={GC_COLORS.primary} />
					</div>
				)}
				{(!hideSearchResults && pageLoaded) && (
					<div style={styles.tabButtonContainer}>
						<ResultView
							context={{ state, dispatch }}
							viewNames={viewNames}
							viewPanels={getViewPanels()}
						/>
						<div style={styles.spacer} />
					</div>
				)}
			</>
		)
	},



	handleCategoryTabChange(props) {
		defaultMainViewHandler.handleCategoryTabChange(props);
	},

	getViewNames(props) {
		return [
			{name: 'Card', title: 'Card View', id: 'gcCardView'}
		];
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
		const { context } = props;
		const { state, dispatch } = context;
		const {
			activeCategoryTab,
			cloneData,
			componentStepNumbers,

			count,
			docSearchResults,
			resultsPage,
			docsLoading,
			docsPagination,

			hideTabs,
			iframePreviewLink,
			loading,
			selectedCategories,
			showSideFilters,
			sidebarOrgs,
			sidebarDocTypes,
			timeSinceCache,
			searchSettings,
			rawSearchResults,

			mainTabSelected,
			mainPageData
		} = state;

		let sideScroll = {
			height: '72vh',
		};
		if (!iframePreviewLink) sideScroll = {};

		return (
			<div key={'cardView'}>
				<div key={'cardView'} style={{ marginTop: hideTabs ? 40 : 'auto' }}>
					<div>
						<div id="game-changer-content-top" />

						<StyledCenterContainer showSideFilters={showSideFilters}>
							{showSideFilters && (
								<div className={'left-container'}>
									<div className={'side-bar-container'}>
										side bar
									</div>
								</div>
							)}

							<div className={'right-container'}>
								{!hideTabs && <ViewHeader {...props} />}
								<div
									className={`row tutorial-step-${componentStepNumbers['Search Results Section']} card-container`}
									style={{ padding: 0 }}
								>
									<div
										className={'col-xs-12'}
										style={{ ...sideScroll, padding: 0 }}
									>
										<div
											className="row"
											style={{ marginLeft: 0, marginRight: 0, padding: 0 }}
										>
											{false && !loading && <GetQAResults context={context} />}
											{!loading && <QueryExp searchText={state.searchText ? state.searchText : ''} />}
										</div>
										<div
											className={'col-xs-12'}
											style={{
												marginTop: 10,
												marginLeft: 0,
												marginRight: 0,
											}}
										>
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
																<Typography variant="h6" display="inline" title="summaryFAQ">JBOOK SEARCH</Typography>

															</Tab>
															<Tab style={{
																...styles.tabStyle,
																...(mainTabSelected === 1 ? styles.tabSelectedStyle : {}),
																borderRadius: `5px 5px 0 0`
															}} title="reviewerChecklist" onClick={() => handleTabClicked(dispatch, state, 1)}
															>
																<Typography variant="h6" display="inline" title="reviewerChecklist">CONTRACT SEARCH</Typography>
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
															{getSearchResults(mainPageData ? mainPageData.docs : [], state, dispatch)}
														</TabPanel>
														<TabPanel>
															{'contract search'}
														</TabPanel>
													</div>
												</div>
											</Tabs>
											{/*
														<div className="col-xs-12">
															<LoadingIndicator customColor={gcOrange} />
														</div>
											*/}
										</div>

									</div>
								</div>
							</div>
						</StyledCenterContainer>
					</div>
				</div>
			</div>
		);
	},

	getAboutUs(props) {
		return <JBookAboutUs />;
	}
};

export default jbookMainViewHandler;
