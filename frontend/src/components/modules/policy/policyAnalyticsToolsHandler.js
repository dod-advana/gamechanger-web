import React from 'react';
import GCAccordion from '../../common/GCAccordion';
import _ from 'lodash';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import { FormControl, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { ThemeProvider } from '@material-ui/core/styles';
import themeDatePicker from '../../common/theme-datepicker';
import { trackEvent } from '../../telemetry/Matomo';
import { setState } from '../../../utils/sharedFunctions';
import { getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import { gcOrange } from '../../common/gc-colors';

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

const handleSelectSpecificOrgs = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	newSearchSettings.specificOrgsSelected = true;
	newSearchSettings.allOrgsSelected = false;
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
};

const handleSelectAllOrgs = (state, dispatch) => {
	if (state.analystToolsSearchSettings.specificOrgsSelected) {
		const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
		newSearchSettings.specificOrgsSelected = false;
		newSearchSettings.allOrgsSelected = true;
		Object.keys(state.analystToolsSearchSettings.orgFilter).forEach((org) => {
			if (newSearchSettings.orgFilter[org]) {
				newSearchSettings.isFilterUpdate = true;
				newSearchSettings.orgUpdate = true;
			}
			newSearchSettings.orgFilter[org] = false;
		});
		setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
	}
};

const handleOrganizationFilterChange = (event, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	let orgName = event.target.name;
	newSearchSettings.orgFilter = {
		...newSearchSettings.orgFilter,
		[orgName]: event.target.checked,
	};
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
	trackEvent(
		getTrackingNameForFactory(state.cloneData.clone_name),
		'OrgFilterToggle',
		event.target.name,
		event.target.value ? 1 : 0
	);
};

const renderSources = (state, dispatch, classes, results) => {
	const { orgFilter, allOrgsSelected, specificOrgsSelected, orgCount } = state.analystToolsSearchSettings;
	const sortedOrgs = Object.keys(orgFilter).map((org) => org);
	if (results.length) {
		sortedOrgs.sort((a, b) => {
			if ((orgCount?.[a] ?? 0) > (orgCount?.[b] ?? 0)) return -1;
			if ((orgCount?.[a] ?? 0) < (orgCount?.[b] ?? 0)) return 1;
			return 0;
		});
	}

	return (
		<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
			<>
				<FormGroup row style={{ marginBottom: '10px' }}>
					<FormControlLabel
						name="All sources"
						value="All sources"
						classes={{ label: classes.titleText }}
						control={
							<Checkbox
								classes={{ root: classes.filterBox }}
								onClick={() => handleSelectAllOrgs(state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={allOrgsSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="All sources"
								style={styles.filterBox}
							/>
						}
						label="All sources"
						labelPlacement="end"
						style={styles.titleText}
					/>
					<FormControlLabel
						name="Specific source(s)"
						value="Specific source(s)"
						classes={{ label: classes.titleText }}
						control={
							<Checkbox
								classes={{ root: classes.filterBox }}
								onClick={() => handleSelectSpecificOrgs(state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={specificOrgsSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="Specific source(s)"
								style={styles.filterBox}
							/>
						}
						label="Specific source(s)"
						labelPlacement="end"
						style={styles.titleText}
					/>
				</FormGroup>
				<FormGroup row style={{ marginLeft: '10px', width: '100%' }}>
					{specificOrgsSelected &&
						sortedOrgs.map((org, index) => {
							if (index < 10 || state.seeMoreSources) {
								const label = results.length ? `${org} (${orgCount?.[org] ?? 0})` : `${org}`;
								return (
									<FormControlLabel
										disabled={results.length ? !orgCount?.[org] : false}
										key={`${org}`}
										value={`${orgFilter[org]}`}
										classes={{ root: classes.rootLabel, label: classes.checkboxPill }}
										control={
											<Checkbox
												classes={{ root: classes.rootButton, checked: classes.checkedButton }}
												name={`${org}`}
												checked={state.analystToolsSearchSettings.orgFilter[org]}
												onClick={(event) =>
													handleOrganizationFilterChange(event, state, dispatch)
												}
											/>
										}
										label={label}
										labelPlacement="end"
									/>
								);
							} else {
								return null;
							}
						})}
				</FormGroup>
				{specificOrgsSelected && (
					// eslint-disable-next-line
					<a
						style={{ cursor: 'pointer', fontSize: '16px' }}
						onClick={() => {
							setState(dispatch, { seeMoreSources: !state.seeMoreSources });
						}}
					>
						See {state.seeMoreSources ? 'Less' : 'More'}
					</a> // jsx-a11y/anchor-is-valid
				)}
			</>
		</FormControl>
	);
};

const handleSelectSpecificTypes = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	newSearchSettings.specificTypesSelected = true;
	newSearchSettings.allTypesSelected = false;
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
};

const handleSelectAllTypes = (state, dispatch) => {
	if (state.analystToolsSearchSettings.specificTypesSelected) {
		const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
		newSearchSettings.specificTypesSelected = false;
		newSearchSettings.allTypesSelected = true;
		Object.keys(state.analystToolsSearchSettings.typeFilter).forEach((type) => {
			if (newSearchSettings.typeFilter[type]) {
				newSearchSettings.isFilterUpdate = true;
				newSearchSettings.typeUpdate = true;
			}
			newSearchSettings.typeFilter[type] = false;
		});
		setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
	}
};

const handleTypeFilterChangeLocal = (event, state, dispatch, searchbar) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	let typeName = event.target.name;
	if (typeName.includes('(')) {
		typeName = typeName.substring(0, event.target.name.lastIndexOf('(') - 1);
	}
	newSearchSettings.typeFilter = {
		...newSearchSettings.typeFilter,
		[typeName]: event.target.checked,
	};
	if (searchbar) {
		setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
	} else {
		newSearchSettings.isFilterUpdate = true;
		newSearchSettings.typeUpdate = true;
		setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
	}

	trackEvent(
		getTrackingNameForFactory(state.cloneData.clone_name),
		'TypeFilterToggle',
		event.target.name,
		event.target.value ? 1 : 0
	);
};

const renderTypes = (state, dispatch, classes, results) => {
	const { typeFilter, allTypesSelected, specificTypesSelected, typeCount } = state.analystToolsSearchSettings;
	const sortedTypes = Object.keys(typeFilter).map((type) => type);
	if (results.length) {
		sortedTypes.sort((a, b) => {
			if ((typeCount?.[a] ?? 0) > (typeCount?.[b] ?? 0)) return -1;
			if ((typeCount?.[a] ?? 0) < (typeCount?.[b] ?? 0)) return 1;
			return 0;
		});
	}

	return (
		<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
			<>
				<FormGroup row style={{ marginBottom: '10px' }}>
					<FormControlLabel
						name="All types"
						value="All types"
						classes={{ label: classes.titleText }}
						control={
							<Checkbox
								classes={{ root: classes.filterBox }}
								onClick={() => handleSelectAllTypes(state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={allTypesSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="All types"
								style={styles.filterBox}
							/>
						}
						label="All types"
						labelPlacement="end"
						style={styles.titleText}
					/>
					<FormControlLabel
						name="Specific type(s)"
						value="Specific type(s)"
						classes={{ label: classes.titleText }}
						control={
							<Checkbox
								classes={{ root: classes.filterBox }}
								onClick={() => handleSelectSpecificTypes(state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={specificTypesSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="Specific type(s)"
								style={styles.filterBox}
							/>
						}
						label="Specific type(s)"
						labelPlacement="end"
						style={styles.titleText}
					/>
				</FormGroup>
				<FormGroup row style={{ marginLeft: '10px', width: '100%' }}>
					{specificTypesSelected &&
						sortedTypes.map((type, index) => {
							if (index < 10 || state.seeMoreTypes) {
								const label = results.length ? `${type} (${typeCount?.[type] ?? 0})` : `${type}`;
								return (
									<FormControlLabel
										disabled={results.length ? !typeCount?.[type] : false}
										key={`${type}`}
										value={`${type}`}
										classes={{ root: classes.rootLabel, label: classes.checkboxPill }}
										control={
											<Checkbox
												classes={{ root: classes.rootButton, checked: classes.checkedButton }}
												name={`${type}`}
												checked={typeFilter[type]}
												onClick={(event) =>
													handleTypeFilterChangeLocal(event, state, dispatch, true)
												}
											/>
										}
										label={label}
										labelPlacement="end"
									/>
								);
							} else {
								return null;
							}
						})}
				</FormGroup>
				{specificTypesSelected && (
					// eslint-disable-next-line
					<a
						style={{ cursor: 'pointer', fontSize: '16px' }}
						onClick={() => {
							setState(dispatch, { seeMoreTypes: !state.seeMoreTypes });
						}}
					>
						See {state.seeMoreTypes ? 'Less' : 'More'}
					</a>
				)}
			</>
		</FormControl>
	);
};

const handleSelectPublicationDateAllTime = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	newSearchSettings.publicationDateAllTime = true;
	newSearchSettings.publicationDateFilter = [null, null];
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
};

const handleSelectPublicationDateSpecificDates = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	newSearchSettings.publicationDateAllTime = false;
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
};

const handleDateRangeChange = (date, isStartDate, filterType, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
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

const renderDates = (state, dispatch, classes, setDatePickerOpen, setDatePickerClosed, searchbar = false) => {
	const pubAllTime =
		state.analystToolsSearchSettings.publicationDateAllTime === undefined
			? true
			: state.analystToolsSearchSettings.publicationDateAllTime;

	return (
		<div style={{ padding: '10px' }}>
			<ThemeProvider theme={themeDatePicker}>
				<div>
					<div style={{ display: 'flex' }}>
						<FormControl>
							{searchbar ? (
								<FormGroup row style={{ marginBottom: '10px' }}>
									<FormControlLabel
										name="All time"
										value="All time"
										classes={{ label: classes.titleText }}
										control={
											<Checkbox
												classes={{ root: classes.filterBox }}
												onClick={() => handleSelectPublicationDateAllTime(state, dispatch)}
												icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
												checked={pubAllTime}
												checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
												name="All time"
												style={styles.filterBox}
											/>
										}
										label="All time"
										labelPlacement="end"
										style={styles.titleText}
									/>
									<FormControlLabel
										name="Specific dates"
										value="Specific dates"
										classes={{ label: classes.titleText }}
										control={
											<Checkbox
												classes={{ root: classes.filterBox }}
												onClick={() =>
													handleSelectPublicationDateSpecificDates(state, dispatch)
												}
												icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
												checked={!pubAllTime}
												checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
												name="Specific dates"
												style={styles.filterBox}
											/>
										}
										label="Specific dates"
										labelPlacement="end"
										style={styles.titleText}
									/>
								</FormGroup>
							) : (
								<>
									<FormGroup row style={{ marginBottom: '10px' }}>
										<FormControlLabel
											name="All time"
											value="All time"
											classes={{ label: classes.titleText }}
											control={
												<Checkbox
													classes={{ root: classes.filterBox }}
													onClick={() => handleSelectPublicationDateAllTime(state, dispatch)}
													icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
													checked={pubAllTime}
													checkedIcon={
														<i style={{ color: '#E9691D' }} className="fa fa-check" />
													}
													name="All time"
													style={styles.filterBox}
												/>
											}
											label="All time"
											labelPlacement="end"
											style={styles.titleText}
										/>
									</FormGroup>
									<FormGroup row>
										<FormControlLabel
											name="Specific dates"
											value="Specific dates"
											classes={{ label: classes.titleText }}
											control={
												<Checkbox
													classes={{ root: classes.filterBox }}
													onClick={() =>
														handleSelectPublicationDateSpecificDates(state, dispatch)
													}
													icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
													checked={!pubAllTime}
													checkedIcon={
														<i style={{ color: '#E9691D' }} className="fa fa-check" />
													}
													name="Specific dates"
													style={styles.filterBox}
												/>
											}
											label="Specific dates"
											labelPlacement="end"
											style={styles.titleText}
										/>
									</FormGroup>
								</>
							)}
						</FormControl>
					</div>
					{!pubAllTime && (
						<div style={{ display: 'flex', flexWrap: 'wrap', margin: '-5px' }}>
							<DatePickerWrapper>
								<label>Start Date</label>
								<DatePicker
									selected={state.searchSettings.publicationDateFilter[0]}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											handleDateRangeChange(
												state.searchSettings.publicationDateFilter[0],
												true,
												'publication',
												state,
												dispatch
											);
										}
									}}
									onChange={(date) => {
										const newSearchSettings = _.cloneDeep(state.searchSettings);
										newSearchSettings.publicationDateFilter[0] = date;
										setState(dispatch, {
											searchSettings: newSearchSettings,
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
									selected={state.searchSettings.publicationDateFilter[1]}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											handleDateRangeChange(
												state.searchSettings.publicationDateFilter[1],
												false,
												'publication',
												state,
												dispatch
											);
										}
									}}
									onChange={(date) => {
										const newSearchSettings = _.cloneDeep(state.searchSettings);
										newSearchSettings.publicationDateFilter[1] = date;
										setState(dispatch, {
											searchSettings: newSearchSettings,
										});
									}}
									onSelect={(date) => {
										handleDateRangeChange(date, false, 'publication', state, dispatch);
									}}
								/>
							</DatePickerWrapper>
						</div>
					)}
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
						name="Revoked Docs"
						value="Revoked Docs"
						classes={{ label: classes.titleText }}
						control={
							<Checkbox
								classes={{ root: classes.filterBox }}
								onClick={(event) => handleRevokedChange(event, state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={state.analystToolsSearchSettings.includeRevoked}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="Revoked Docs"
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

		const sourceCount =
			analystToolsSearchSettings.specificOrgsSelected &&
			Object.keys(analystToolsSearchSettings.orgFilter).filter((org) => analystToolsSearchSettings.orgFilter[org])
				.length;
		const typeCount =
			analystToolsSearchSettings.specificTypesSelected &&
			Object.keys(analystToolsSearchSettings.typeFilter).filter(
				(type) => analystToolsSearchSettings.typeFilter[type]
			).length;
		const dateActive =
			analystToolsSearchSettings?.publicationDateFilter[0] &&
			analystToolsSearchSettings?.publicationDateFilter[1];
		const statusActive = analystToolsSearchSettings.includeRevoked;

		return (
			<>
				<div>
					<div style={{ marginBottom: 20 }}>Apply filters to your search</div>

					<div style={{ width: '100%', marginBottom: 10 }}>
						<GCAccordion
							expanded={analystToolsSearchSettings.specificOrgsSelected}
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
					</div>

					<div style={{ width: '100%', marginBottom: 10 }}>
						<GCAccordion
							expanded={analystToolsSearchSettings.specificTypesSelected}
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
					</div>

					<div style={{ width: '100%', marginBottom: 10 }}>
						<GCAccordion
							expanded={!analystToolsSearchSettings.publicationDateAllTime}
							header={
								<>
									PUBLICATION DATE <span style={styles.filterCount}>{dateActive ? '(1)' : ''}</span>
								</>
							}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'normal'}
						>
							{renderDates(state, dispatch, classes)}
						</GCAccordion>
					</div>

					<div style={{ width: '100%', marginBottom: 10 }}>
						<GCAccordion
							expanded={statusActive}
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
