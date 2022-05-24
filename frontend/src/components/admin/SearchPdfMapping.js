import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import DatePicker from 'react-datepicker';
import { Typography, Grid, Card, CardContent } from '@material-ui/core';
import moment from 'moment';
import { Tabs, Tab, TabPanel, TabList } from 'react-tabs';
import TabStyles from '../common/TabStyles';
import GameChangerAPI from '../api/gameChanger-service-api';
import GCPrimaryButton from '../common/GCButton';
import { trackEvent } from '../telemetry/Matomo';
import { encode } from '../../utils/gamechangerUtils';
import { styles } from './util/GCAdminStyles';
import './searchPdfStyles.css';

const gameChangerAPI = new GameChangerAPI();

const DatePickerWrapper = styled.div`
	margin-right: 10px;
	display: flex;
	flex-direction: column;

	> label {
		text-align: left;
		margin-bottom: 2px;
		color: #3f4a56;
		font-size: 15px;
		font-family: Noto Sans;
	}

	> .react-datepicker-wrapper {
		> .react-datepicker__input-container {
			> input {
				width: 225px;
				border: 0;
				outline: 0;
				border-bottom: 1px solid black;
			}
		}
	}
`;
const CreateWrapper = styled.div`
	display: flex;
	align-items: center;
	float: right;
`;
const LabelStack = styled.div`
    display: flex
	margin-left: 24px;
`;

const TableRow = styled.div`
	text-align: center;
`;

export const filterCaseInsensitiveIncludes = (filter, row) => {
	const id = filter.pivotId || filter.id;
	return row[id] !== undefined ? String(row[id].toLowerCase()).includes(filter.value.toLowerCase()) : false;
};

const columns = [
	{
		Header: 'User ID',
		accessor: 'idvisitor',
		width: 200,
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Visit ID',
		accessor: 'idvisit',
		width: 100,
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Search Time',
		accessor: 'searchtime_formatted',
		width: 200,
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Action',
		accessor: 'action',
		width: 200,
		style: { whiteSpace: 'unset' },
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Search',
		accessor: 'value',
		width: 200,
		style: { whiteSpace: 'unset' },
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Document Opened',
		accessor: 'display_title_s',
		width: 250,
		style: { whiteSpace: 'unset' },
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Document Time',
		accessor: 'documenttime',
		width: 200,
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Document Type',
		accessor: 'display_doc_type_s',
		width: 175,
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Source',
		accessor: 'doc_type',
		width: 100,
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Organization',
		accessor: 'display_org_s',
		width: 100,
		style: { whiteSpace: 'unset' },
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Topics',
		accessor: 'topics_rs',
		style: { whiteSpace: 'unset' },
		width: 250,
		Cell: (row) => {
			let finalString = '';
			if (row.value !== undefined) {
				finalString = Object.keys(row.value).join(', ');
			}
			return <TableRow>{finalString}</TableRow>;
		},
	},
	{
		Header: 'Keywords',
		accessor: 'keyw_5',
		width: 250,
		style: { whiteSpace: 'unset' },
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
];

const userAggColumns = [
	// {
	// 	Header: 'Name',
	// 	accessor: 'name',
	// 	Cell: (row) => <TableRow>{row.value}</TableRow>,
	// },
	// {
	// 	Header: 'Email',
	// 	accessor: 'email',
	// 	Cell: (row) => <TableRow>{row.value}</TableRow>,
	// },

	{
		Header: 'User ID',
		accessor: 'user_id',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Organization',
		accessor: 'org',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Documents Opened',
		accessor: 'docs_opened',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Total Searches',
		accessor: 'searches_made',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Last Search Made',
		accessor: 'last_search_formatted',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
];

const feedbackColumns = [
	{
		Header: 'Feedback Event',
		accessor: 'event_name',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'User ID',
		accessor: 'user_id',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Feedback Time',
		accessor: 'createdAt',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Search',
		accessor: 'value_1',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Returned',
		accessor: 'value_2',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
];

const documentUsageColumns = [
	{
		Header: 'Document',
		accessor: 'document',
		width: 400,
		headerStyle: { textAlign: 'left', paddingLeft: '15px' },
		style: { whiteSpace: 'unset' },
		filterMethod: (filter, row) => filterCaseInsensitiveIncludes(filter, row),
		Cell: (row) => <TableRow style={{ textAlign: 'left', paddingLeft: '15px' }}>{row.value}</TableRow>,
	},
	{
		Header: 'View Count',
		accessor: 'visit_count',
		width: 140,
		filterable: false,
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Unique Viewers',
		accessor: 'user_count',
		width: 140,
		filterable: false,
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Viewer List',
		accessor: 'user_list',
		headerStyle: { textAlign: 'left', paddingLeft: '15px' },
		sortable: false,
		filterMethod: (filter, row) => filterCaseInsensitiveIncludes(filter, row),
		style: { whiteSpace: 'unset' },
		Cell: (row) => <TableRow style={{ textAlign: 'left', paddingLeft: '15px' }}>{row.value}</TableRow>,
	},
	{
		Header: 'Searches',
		accessor: 'searches',
		sortable: false,
		filterMethod: (filter, row) => filterCaseInsensitiveIncludes(filter, row),
		style: { whiteSpace: 'unset' },
		Cell: (row) => <TableRow style={{ textAlign: 'left', paddingLeft: '15px' }}>{row.value}</TableRow>,
	},
];

/**
 * This method queries Matomo for documents based on search.
 * The query is handled in gamechanger-api.
 * @method getSearchPdfMapping
 */
const getSearchPdfMapping = async (startDate, endDate, setMappingData) => {
	try {
		// daysBack, offset, filters, sorting, pageSize
		const params = {
			startDate: moment(startDate).utc().format('YYYY-MM-DD HH:mm'),
			endDate: moment(endDate).utc().format('YYYY-MM-DD HH:mm'),
		};
		const { data = {} } = await gameChangerAPI.getSearchPdfMapping(params);
		setMappingData(data.data);
	} catch (e) {
		console.error(e);
	}
};

/**
 * This method queries postgres for feedback data.
 * The query is handled in gamechanger-api.
 * @method getFeedbackData
 */
const getFeedbackData = async (setFeedbackData) => {
	try {
		// daysBack, offset, filters, sorting, pageSize
		const data = await gameChangerAPI.getFeedbackData();
		setFeedbackData(data.data.results);
	} catch (e) {
		console.error(e);
	}
};

/**
 * This method queries postgres for feedback data.
 * The query is handled in gamechanger-api.
 * @method getDocumentData
 */
const getDocumentData = async (daysBack, setDocumentData) => {
	try {
		const params = { daysBack };
		const { data = {} } = await gameChangerAPI.getDocumentUsage(params);
		setDocumentData(data.data);
	} catch (e) {
		console.error(e);
	}
};

/**
 * This method queries postgres for user aggregations.
 * The query is handled in gamechanger-api.
 * @method getUserAggData
 */
const getUserAggData = async (startDate, endDate, setUserAggData, setCardData) => {
	try {
		const params = {
			startDate: moment(startDate).utc().format('YYYY-MM-DD HH:mm'),
			endDate: moment(endDate).utc().format('YYYY-MM-DD HH:mm'),
		};
		const { data = {} } = await gameChangerAPI.getUserAggregations(params);
		setUserAggData(data.users);
		setCardData(data.cards);
	} catch (e) {
		console.error(e);
	}
};

/**
 * This class queries a search to pdf mapping from matomo
 * and visualizes it as a tabel as well as provide the option
 * to download as a csv
 * @class SearchPdfMapping
 */
export default () => {
	// Set state variables
	const [mappingData, setMappingData] = useState([]);
	const [feedbackData, setFeedbackData] = useState([]);
	const [documentData, setDocumentData] = useState([]);
	const [userAggData, setUserAggData] = useState([]);
	const [cardData, setCardData] = useState({ unique_users: 0, total_searches: 0 });
	const [startDate, setStartDate] = useState(moment().subtract(3, 'd').set({ hour: 0, minute: 0 })._d);
	const [endDate, setEndDate] = useState(moment()._d);
	const [daysBack, setDaysBack] = useState(3);
	const [tabIndex, setTabIndex] = useState('pdfMapping');

	// flags that parameters have been changed and on
	// blur or enter press we should update the query
	const [shouldUpdate, setShouldUpdate] = useState(false);
	/**
	 * Handles text change in input
	 * @method handleDaysBackChange
	 * @param {*} event
	 */
	const handleDaysBackChange = (event) => {
		const value = event.target.value;
		const parsed = parseInt(value);
		if (!isNaN(parsed) && parsed > 0) {
			setShouldUpdate(true);
			setDaysBack(parsed);
		} else if (parsed === 0 || value === '') {
			setDaysBack(value);
		}
	};
	const handleDateChange = (date, setFunction) => {
		setFunction(date);
	};
	/**
	 * When an input is deselected check if the inputs are valid and a
	 * change was made. If so then query the data with new values.
	 * @method handleBlur
	 * @param {*} event
	 */
	const handleBlur = (event) => {
		if (!daysBack) {
			setShouldUpdate(false);
			setDaysBack(3);
		}
		if (shouldUpdate) {
			setShouldUpdate(false);
			switch (tabIndex) {
				case 'pdfMapping':
					getSearchPdfMapping(startDate, endDate, setMappingData);
					getUserAggData(daysBack, setUserAggData);
					break;
				case 'userTracking':
					getDocumentData(daysBack, setDocumentData);
					break;
				default:
					getSearchPdfMapping(startDate, endDate, setMappingData);
					getUserAggData(daysBack, setUserAggData);
					getDocumentData(daysBack, setDocumentData);
			}
		}
	};
	/**
	 * If the enter key is pressed while in an input trigger handleBlur
	 * @method handlePositionEnter
	 * @param {*} event
	 */
	const handlePositionEnter = (event) => {
		if (event.key === 'Enter') {
			handleBlur();
		}
	};

	/**
	 * This method renders the documents for react table
	 * @method subComponent
	 */
	const subComponent = (row) => {
		return (
			<div>
				<Grid container spacing={2}>
					<Grid item xs={1}></Grid>
					<Grid item xs={4}>
						<p>Opened:</p>
						<ol>
							{row.original.opened.map((o) => (
								<li>
									<a
										target={'_blank'}
										rel="noreferrer"
										href={`/#/pdfviewer/gamechanger?filename=${encode(o)}`}
									>
										{' '}
										{o}{' '}
									</a>
								</li>
							))}
						</ol>
					</Grid>
					<Grid item xs={3}>
						<p>Exported:</p>
						<ol>
							{row.original.ExportDocument.map((e) => (
								<li>
									<a
										target={'_blank'}
										rel="noreferrer"
										href={`/#/pdfviewer/gamechanger?filename=${encode(e)}`}
									>
										{' '}
										{e}{' '}
									</a>
								</li>
							))}
						</ol>
					</Grid>
					<Grid item xs={4}>
						<p>Favorited:</p>
						<ol>
							{row.original.Favorite.map((f) => (
								<li>
									<a
										target={'_blank'}
										rel="noreferrer"
										href={`/#/pdfviewer/gamechanger?filename=${encode(f)}`}
									>
										{' '}
										{f}{' '}
									</a>
								</li>
							))}
						</ol>
					</Grid>
				</Grid>
			</div>
		);
	};

	/**
	 * This method takes the a csv name + array in state
	 * and saves it to the users downloads as a csv.
	 * @method exportData
	 */
	const exportData = async (name) => {
		try {
			// daysBack, offset, filters, sorting, pageSize
			const params = {
				startDate: moment(startDate).utc().format('YYYY-MM-DD HH:mm'),
				endDate: moment(endDate).utc().format('YYYY-MM-DD HH:mm'),
				table: name,
				daysBack: daysBack,
			};
			const data = await gameChangerAPI.exportUserData(params);
			console.log(data);
			const url = window.URL.createObjectURL(
				new Blob([data.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
			);
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `${name}.xlsx`); //or any other extension
			document.body.appendChild(link);
			link.click();
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		switch (tabIndex) {
			case 'pdfMapping':
				getSearchPdfMapping(startDate, endDate, setMappingData);
				getUserAggData(startDate, endDate, setUserAggData, setCardData);
				break;
			case 'userTracking':
				getDocumentData(daysBack, setDocumentData);
				break;
			default:
				getSearchPdfMapping(startDate, endDate, setMappingData);
				getFeedbackData(setFeedbackData);
				getUserAggData(startDate, endDate, setUserAggData, setCardData);
				getDocumentData(daysBack, setDocumentData);
		}
	}, [daysBack, tabIndex, startDate, endDate]);

	return (
		<div style={{ ...TabStyles.tabContainer, minHeight: 'calc(100vh-100px)' }}>
			<Tabs>
				<div
					style={{
						...TabStyles.tabButtonContainer,
						background: 'rgb(245 245 245)',
					}}
				>
					<TabList style={TabStyles.tabsList}>
						<Tab
							style={{
								...TabStyles.tabStyle,
								...(tabIndex === 'pdfMapping' ? TabStyles.tabSelectedStyle : {}),
								borderRadius: `5px 0 0 0`,
							}}
							title="pdfMapping"
							onClick={() => {
								setTabIndex('pdfMapping');
								setDaysBack(3);
							}}
						>
							<Typography variant="h6" display="inline">
								Search PDF Mapping
							</Typography>
						</Tab>
						<Tab
							style={{
								...TabStyles.tabStyle,
								...(tabIndex === 'feedback' ? TabStyles.tabSelectedStyle : {}),
								borderRadius: '0 0 0 0',
							}}
							title="feedback"
							onClick={() => setTabIndex('feedback')}
						>
							<Typography variant="h6" display="inline">
								Feedback
							</Typography>
						</Tab>
						<Tab
							style={{
								...TabStyles.tabStyle,
								...(tabIndex === 'userTracker' ? TabStyles.tabSelectedStyle : {}),
								borderRadius: `0 0 0 0`,
							}}
							title="userTracker"
							onClick={() => {
								setTabIndex('userTracker');
								setDaysBack(30);
							}}
						>
							<Typography variant="h6" display="inline">
								User Tracker Tools
							</Typography>
						</Tab>
					</TabList>

					<div style={TabStyles.spacer} />
				</div>

				<div style={TabStyles.panelContainer}>
					<TabPanel>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								margin: '10px 80px',
							}}
						>
							<Grid container spacing={2}>
								<Grid item xs={2}>
									<DatePickerWrapper>
										<label>Start Date</label>
										<DatePicker
											showTimeSelect
											selected={startDate}
											onChange={(date) => handleDateChange(date, setStartDate)}
											dateFormat="MM/dd/yyyy h:mm aa"
										/>
									</DatePickerWrapper>
								</Grid>
								<Grid item xs={2}>
									<DatePickerWrapper>
										<label>End Date</label>
										<DatePicker
											showTimeSelect
											selected={endDate}
											onChange={(date) => handleDateChange(date, setEndDate)}
											dateFormat="MM/dd/yyyy h:mm aa"
										/>
									</DatePickerWrapper>
								</Grid>
								<Grid item xs={5}></Grid>
								<Grid item xs={3}>
									<GCPrimaryButton
										onClick={() => {
											trackEvent('GAMECHANGER', 'ExportSearchPDFMapping', 'onClick');
											exportData('SearchPdfMapping', mappingData);
										}}
										style={{ minWidth: 'unset' }}
									>
										Export Mapping
									</GCPrimaryButton>
								</Grid>
								<Grid item xs={2}>
									<Card>
										<CardContent>
											<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>
												Total Searches
											</p>
											{cardData.total_searches}
										</CardContent>
									</Card>
								</Grid>
								<Grid item xs={2}>
									<Card>
										<CardContent>
											<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>
												Unique Users
											</p>
											{cardData.unique_users}
										</CardContent>
									</Card>
								</Grid>
								<Grid item xs={8}></Grid>
							</Grid>
						</div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								margin: '10px 80px',
							}}
						>
							<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>
								Documents Opened Given Search
							</p>
						</div>
						<ReactTable
							data={mappingData}
							columns={columns}
							style={{ margin: '0 80px 20px 80px', height: 1000 }}
							defaultSorted={[{ id: 'searchtime', desc: true }]}
						/>

						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								margin: '10px 80px',
							}}
						>
							<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>User Data</p>
							<GCPrimaryButton
								onClick={() => {
									trackEvent('GAMECHANGER', 'ExportFeedback', 'onClick');
									exportData('UserData', userAggData);
								}}
								style={{ minWidth: 'unset' }}
							>
								Export User Data
							</GCPrimaryButton>
						</div>
						<ReactTable
							data={userAggData}
							columns={userAggColumns}
							defaultSorted={[{ id: 'searches_made', desc: true }]}
							style={{ margin: '0 80px 20px 80px', height: 700 }}
							SubComponent={subComponent}
						/>
					</TabPanel>
					<TabPanel>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								margin: '10px 80px',
							}}
						>
							<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>Feedback Data</p>
							<GCPrimaryButton
								onClick={() => {
									trackEvent('GAMECHANGER', 'ExportFeedback', 'onClick');
									exportData('Feedback', feedbackData);
								}}
								style={{ minWidth: 'unset' }}
							>
								Export Feedback
							</GCPrimaryButton>
						</div>
						<ReactTable
							data={feedbackData}
							columns={feedbackColumns}
							style={{ margin: '0 80px 20px 80px', height: 700 }}
							defaultSorted={[{ id: 'event_name', desc: false }]}
						/>
					</TabPanel>
					<TabPanel>
						<div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 80px' }}>
							<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>Document Usage Data</p>
							<CreateWrapper>
								<LabelStack>
									<label htmlFor="daysBack" style={{ marginRight: '10px', marginTop: '4px' }}>
										Days Back:
									</label>
									<input
										name="daysBack"
										value={daysBack}
										onChange={handleDaysBackChange}
										onBlur={handleBlur}
										onKeyPress={handlePositionEnter}
									/>
								</LabelStack>
							</CreateWrapper>
							<GCPrimaryButton
								onClick={() => {
									trackEvent('GAMECHANGER', 'ExportDocumentUsage', 'onClick');
									exportData('DocumentUsage', documentData);
								}}
								style={{ minWidth: 'unset' }}
							>
								Export Document Usage
							</GCPrimaryButton>
						</div>
						<ReactTable
							data={documentData}
							columns={documentUsageColumns}
							filterable={true}
							style={{ margin: '0 80px 20px 80px', height: 700 }}
							defaultSorted={[{ id: 'visit_count', desc: true }]}
						/>
					</TabPanel>
				</div>
			</Tabs>
		</div>
	);
};
