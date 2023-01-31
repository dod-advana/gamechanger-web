import React from 'react';
import GCAccordion from '../../common/GCAccordion';
import _ from 'lodash';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FormControl, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { ThemeProvider } from '@material-ui/core/styles';
import themeDatePicker from '../../common/theme-datepicker';
import { setState } from '../../../utils/sharedFunctions';
import { gcOrange } from '../../common/gc-colors';
import PolicyMultiSelectFilter from './PolicyMultiSelectFilter';

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
				width: 140px;
				border: 0;
				outline: 0;
				border-bottom: 1px solid black;
			}
		}
	}
`;

const AccordianWrapper = styled.div`
	.MuiAccordionSummary-root {
		display: flex !important;
		padding: 0px 10px !important;
	}
	.MuiIconButton-edgeEnd {
		margin-right: -12px;
		padding: 12px;
	}
`;

const renderSources = (state, dispatch, classes, results) => {
	const { orgFilter, orgCount } = state.analystToolsSearchSettings;
	const orgCountsPresent = orgCount ? Object.keys(orgCount).length > 0 : false;

	const sortedOrgs = Object.keys(orgFilter).map((org) => [org, orgCount?.[org] || 0]);
	if (results.length) {
		sortedOrgs.sort((a, b) => {
			return b[1] - a[1];
		});
	}

	return (
		<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
			<PolicyMultiSelectFilter
				state={state}
				dispatch={dispatch}
				classes={classes}
				searchSettingsName={'analystToolsSearchSettings'}
				filter={'orgFilter'}
				originalFilters={sortedOrgs}
				allSelected={'allOrgsSelected'}
				specificSelected={'specificOrgsSelected'}
				update={'orgUpdate'}
				trackingName={'DocumentComparisonTool-OrgFilterToggle'}
				showNumResultsPerOption={orgCountsPresent && results.length > 0}
				preventSearchOnChange
			/>
		</FormControl>
	);
};

const renderTypes = (state, dispatch, classes, results) => {
	const { typeFilter, typeCount } = state.analystToolsSearchSettings;
	const typeCountsPresent = typeCount ? Object.keys(typeCount).length > 0 : false;

	const sortedTypes = Object.keys(typeFilter).map((type) => [type, typeCount?.[type] || 0]);
	if (results.length) {
		sortedTypes.sort((a, b) => {
			return b[1] - a[1];
		});
	}

	return (
		<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
			<PolicyMultiSelectFilter
				state={state}
				dispatch={dispatch}
				classes={classes}
				searchSettingsName={'analystToolsSearchSettings'}
				filter={'typeFilter'}
				originalFilters={sortedTypes}
				allSelected={'allTypesSelected'}
				specificSelected={'specificTypesSelected'}
				update={'typeUpdate'}
				trackingName={'DocumentComparisonTool-TypeFilterToggle'}
				showNumResultsPerOption={typeCountsPresent && results.length > 0}
				preventSearchOnChange
			/>
		</FormControl>
	);
};

const handleDateRangeChange = (date, isStartDate, filterType, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	newSearchSettings.publicationDateAllTime = false;
	const { publicationDateFilter, accessDateFilter } = newSearchSettings;

	if (Object.prototype.toString.call(date) === '[object Date]') {
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
	}

	let temp;
	switch (filterType) {
		case 'publication':
			temp = publicationDateFilter;
			break;
		case 'timestamp':
			temp = accessDateFilter;
			break;
		default:
			break;
	}

	if (isStartDate) {
		temp[0] = date;
	} else {
		temp[1] = date;
	}
	if (!isNaN(temp[0]?.getTime()) && !isNaN(temp[1]?.getTime())) {
		newSearchSettings.isFilterUpdate = true;
	}

	if (filterType === 'publication') {
		newSearchSettings.publicationDateFilter = temp;
	} else {
		newSearchSettings.accessDateFilter = temp;
	}
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
};

const renderDates = (state, dispatch) => {
	return (
		<div style={{ padding: '10px' }}>
			<ThemeProvider theme={themeDatePicker}>
				<div>
					<div style={{ display: 'flex', flexWrap: 'wrap', margin: '-5px' }}>
						<DatePickerWrapper>
							<label>Start Date</label>
							<DatePicker
								selected={state.analystToolsSearchSettings.publicationDateFilter[0]}
								value={
									state.analystToolsSearchSettings.publicationDateFilter[0]
										? state.analystToolsSearchSettings.publicationDateFilter[0]
										: ''
								}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleDateRangeChange(
											state.analystToolsSearchSettings.publicationDateFilter[0],
											true,
											'publication',
											state,
											dispatch
										);
									}
								}}
								onChange={(date) => {
									const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
									newSearchSettings.publicationDateFilter[0] = date;
									setState(dispatch, {
										analystToolsSearchSettings: newSearchSettings,
									});
								}}
								onSelect={(date) => {
									handleDateRangeChange(date, true, 'publication', state, dispatch);
								}}
							/>
						</DatePickerWrapper>
						<DatePickerWrapper>
							<label>End Date</label>
							<DatePicker
								selected={state.analystToolsSearchSettings.publicationDateFilter[1]}
								value={
									state.analystToolsSearchSettings.publicationDateFilter[1]
										? state.analystToolsSearchSettings.publicationDateFilter[1]
										: ''
								}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleDateRangeChange(
											state.analystToolsSearchSettings.publicationDateFilter[1],
											false,
											'publication',
											state,
											dispatch
										);
									}
								}}
								onChange={(date) => {
									const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
									newSearchSettings.publicationDateFilter[1] = date;
									setState(dispatch, {
										analystToolsSearchSettings: newSearchSettings,
									});
								}}
								onSelect={(date) => {
									handleDateRangeChange(date, false, 'publication', state, dispatch);
								}}
							/>
						</DatePickerWrapper>
					</div>
				</div>
			</ThemeProvider>
		</div>
	);
};

const handleRevokedChange = (event, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	newSearchSettings.includeRevoked = event.target.checked;
	newSearchSettings.isFilterUpdate = true;
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
};

const renderStatus = (state, dispatch, classes) => {
	return (
		<div>
			<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
				<FormGroup row style={{ marginBottom: '0px' }}>
					<FormControlLabel
						name="Include Canceled Documents"
						value="Include Canceled Documents"
						classes={{ label: classes.titleText }}
						control={
							<Checkbox
								classes={{ root: classes.filterBox }}
								onClick={(event) => handleRevokedChange(event, state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={state.analystToolsSearchSettings.includeRevoked}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="Include Canceled Documents"
							/>
						}
						label="Include Canceled Documents"
						labelPlacement="end"
					/>
				</FormGroup>
			</FormControl>
		</div>
	);
};

const PolicyAnalyticsToolsHandler = {
	getSideBarItems(props) {
		const { state, dispatch, classes, results } = props;

		const { analystToolsSearchSettings } = state;

		const sourceCount = Object.keys(analystToolsSearchSettings.orgFilter).filter(
			(org) => analystToolsSearchSettings.orgFilter[org]
		).length;
		const typeCount = Object.keys(analystToolsSearchSettings.typeFilter).filter(
			(type) => analystToolsSearchSettings.typeFilter[type]
		).length;
		const dateActive =
			analystToolsSearchSettings?.publicationDateFilter[0] &&
			analystToolsSearchSettings?.publicationDateFilter[1];
		const statusActive = analystToolsSearchSettings.includeRevoked;

		return (
			<>
				<div>
					<div style={{ marginBottom: 20 }}>Apply filters to streamline search results:</div>

					<div style={{ width: '100%', marginBottom: 10 }}>
						<AccordianWrapper>
							<GCAccordion
								header={
									<>
										SOURCE{' '}
										<span style={styles.filterCount}>{sourceCount ? `(${sourceCount})` : ''}</span>
									</>
								}
								headerBackground={'rgb(238,241,242)'}
								headerTextColor={'black'}
								headerTextWeight={'normal'}
							>
								{renderSources(state, dispatch, classes, results)}
							</GCAccordion>
						</AccordianWrapper>
					</div>

					<div style={{ width: '100%', marginBottom: 10 }}>
						<AccordianWrapper>
							<GCAccordion
								header={
									<>
										TYPE <span style={styles.filterCount}>{typeCount ? `(${typeCount})` : ''}</span>
									</>
								}
								headerBackground={'rgb(238,241,242)'}
								headerTextColor={'black'}
								headerTextWeight={'normal'}
							>
								{renderTypes(state, dispatch, classes, results)}
							</GCAccordion>
						</AccordianWrapper>
					</div>

					<div style={{ width: '100%', marginBottom: 10 }}>
						<AccordianWrapper>
							<GCAccordion
								header={
									<>
										PUBLICATION DATE{' '}
										<span style={styles.filterCount}>{dateActive ? '(1)' : ''}</span>
									</>
								}
								headerBackground={'rgb(238,241,242)'}
								headerTextColor={'black'}
								headerTextWeight={'normal'}
							>
								{renderDates(state, dispatch)}
							</GCAccordion>
						</AccordianWrapper>
					</div>

					<div style={{ width: '100%', marginBottom: 10 }}>
						<AccordianWrapper>
							<GCAccordion
								header={
									<>
										STATUS <span style={styles.filterCount}>{statusActive ? '(1)' : ''}</span>
									</>
								}
								headerBackground={'rgb(238,241,242)'}
								headerTextColor={'black'}
								headerTextWeight={'normal'}
							>
								{renderStatus(state, dispatch, classes)}
							</GCAccordion>
						</AccordianWrapper>
					</div>
				</div>
			</>
		);
	},
};

const styles = {
	filterCount: {
		color: gcOrange,
	},
	innerContainer: {
		display: 'flex',
		height: '100%',
		flexDirection: 'column',
	},
	cardBody: {
		padding: '10px 0px',
		fontSize: '1.1em',
		fontFamily: 'Noto Sans',
	},
	subHead: {
		fontSize: '1.0em',
		display: 'flex',
		position: 'relative',
	},
	headerColumn: {
		fontSize: '1.0em',
		width: '100%',
		padding: '8px 8px',
		backgroundColor: 'rgb(50,53,64)',
		display: 'flex',
		alignItems: 'center',
	},
	filterDiv: {
		display: 'block',
		margin: '10px',
	},
	boldText: {
		fontSize: '0.8em',
	},
};

export default PolicyAnalyticsToolsHandler;
