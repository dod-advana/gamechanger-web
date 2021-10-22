import React from 'react';
import GCAccordion from '../../common/GCAccordion';
import GCButton from '../../common/GCButton';
import _ from 'lodash';
import {
	FormControl,
	FormGroup,
	FormControlLabel,
	Checkbox,
} from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { ThemeProvider } from '@material-ui/core/styles';
import { setState } from '../../../utils/sharedFunctions';
import themeDatePicker from '../../common/theme-datepicker';
import {
	MuiPickersUtilsProvider,
	KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { trackEvent } from '../../telemetry/Matomo';
import { getTrackingNameForFactory } from '../../../utils/gamechangerUtils';

const handleSelectSpecificOrgs = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.specificOrgsSelected = true;
	newSearchSettings.allOrgsSelected = false;
	setState(dispatch, {
		searchSettings: newSearchSettings,
		metricsCounted: false,
	});
};

const handleSelectAllOrgs = (state, dispatch) => {
	if (state.searchSettings.specificOrgsSelected) {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.specificOrgsSelected = false;
		newSearchSettings.allOrgsSelected = true;
		let runSearch = false;
		let runGraphSearch = false;
		Object.keys(state.searchSettings.orgFilter).forEach((org) => {
			if (newSearchSettings.orgFilter[org]) {
				newSearchSettings.isFilterUpdate = true;
				newSearchSettings.orgUpdate = true;
				runSearch = true;
				runGraphSearch = true;
			}
			newSearchSettings.orgFilter[org] = false;
		});
		setState(dispatch, {
			searchSettings: newSearchSettings,
			metricsCounted: false,
			runSearch,
			runGraphSearch,
		});
	}
};

const handleOrganizationFilterChange = (event, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	let orgName = event.target.name.substring(
		0,
		event.target.name.lastIndexOf('(') - 1
	);
	newSearchSettings.orgFilter = {
		...newSearchSettings.orgFilter,
		[orgName]: event.target.checked,
	};
	newSearchSettings.isFilterUpdate = true;
	newSearchSettings.orgUpdate = true;
	setState(dispatch, {
		searchSettings: newSearchSettings,
		metricsCounted: false,
		runSearch: true,
		runGraphSearch: true,
	});
	trackEvent(
		getTrackingNameForFactory(state.cloneData.clone_name),
		'OrgFilterToggle',
		event.target.name,
		event.target.value ? 1 : 0
	);
};

const handleOrganizationFilterChangeAdv = (event, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	let orgName = event.target.name;
	newSearchSettings.orgFilter = {
		...newSearchSettings.orgFilter,
		[orgName]: event.target.checked,
	};
	setState(dispatch, {
		searchSettings: newSearchSettings,
		metricsCounted: false,
	});
	trackEvent(
		getTrackingNameForFactory(state.cloneData.clone_name),
		'OrgFilterToggle',
		event.target.name,
		event.target.value ? 1 : 0
	);
};

const renderSources = (state, dispatch, classes, searchbar = false) => {
	const { originalOrgFilters, orgFilter } = state.searchSettings;
	const betterOrgData = {};
	for (let i = 0; i < originalOrgFilters.length; i++) {
		betterOrgData[originalOrgFilters[i][0]] = originalOrgFilters[i][1];
	}

	return (
		<FormControl
			style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}
		>
			{searchbar ? (
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
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={state.searchSettings.allOrgsSelected}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
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
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={state.searchSettings.specificOrgsSelected}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
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
						{state.searchSettings.specificOrgsSelected &&
							Object.keys(orgFilter).map((org, index) => {
								if (index < 10 || state.seeMoreSources) {
									return (
										<FormControlLabel
											key={`${org}`}
											value={`${originalOrgFilters[org]}`}
											classes={{
												root: classes.rootLabel,
												label: classes.checkboxPill,
											}}
											control={
												<Checkbox
													classes={{
														root: classes.rootButton,
														checked: classes.checkedButton,
													}}
													name={`${org}`}
													checked={state.searchSettings.orgFilter[org]}
													onClick={(event) =>
														handleOrganizationFilterChangeAdv(
															event,
															state,
															dispatch
														)
													}
												/>
											}
											label={`${org}`}
											labelPlacement="end"
										/>
									);
								} else {
									return null;
								}
							})}
					</FormGroup>
					{
						state.searchSettings.specificOrgsSelected && (
							// eslint-disable-next-line
							<a
								style={{ cursor: 'pointer', fontSize: '16px' }}
								onClick={() => {
									setState(dispatch, { seeMoreSources: !state.seeMoreSources });
								}}
							>
								See {state.seeMoreSources ? 'Less' : 'More'}
							</a>
						) // jsx-a11y/anchor-is-valid
					}
				</>
			) : (
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
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={state.searchSettings.allOrgsSelected}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
									name="All sources"
									style={styles.filterBox}
								/>
							}
							label="All sources"
							labelPlacement="end"
							style={styles.titleText}
						/>
					</FormGroup>
					<FormGroup row>
						<FormControlLabel
							name="Specific source(s)"
							value="Specific source(s)"
							classes={{ label: classes.titleText }}
							control={
								<Checkbox
									classes={{ root: classes.filterBox }}
									onClick={() => handleSelectSpecificOrgs(state, dispatch)}
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={state.searchSettings.specificOrgsSelected}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
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
						{state.searchSettings.specificOrgsSelected &&
							Object.keys(betterOrgData).map((org) => {
								return (
									<FormControlLabel
										disabled={
											!betterOrgData[org] &&
											!state.searchSettings.orgFilter[org]
										}
										key={`${org} (${betterOrgData[org]})`}
										value={`${org} (${betterOrgData[org]})`}
										classes={{
											root: classes.rootLabel,
											label: classes.checkboxPill,
										}}
										control={
											<Checkbox
												classes={{
													root: classes.rootButton,
													checked: classes.checkedButton,
												}}
												name={`${org} (${betterOrgData[org]})`}
												checked={state.searchSettings.orgFilter[org]}
												onClick={(event) =>
													handleOrganizationFilterChange(event, state, dispatch)
												}
											/>
										}
										label={`${org} (${betterOrgData[org]})`}
										labelPlacement="end"
									/>
								);
							})}
					</FormGroup>
				</>
			)}
		</FormControl>
	);
};

const handleSelectSpecificTypes = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.specificTypesSelected = true;
	newSearchSettings.allTypesSelected = false;
	setState(dispatch, {
		searchSettings: newSearchSettings,
		metricsCounted: false,
	});
};

const handleSelectAllTypes = (state, dispatch) => {
	if (state.searchSettings.specificTypesSelected) {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.specificTypesSelected = false;
		newSearchSettings.allTypesSelected = true;
		let runGraphSearch = false;
		let runSearch = false;
		Object.keys(state.searchSettings.typeFilter).forEach((type) => {
			if (newSearchSettings.typeFilter[type]) {
				newSearchSettings.isFilterUpdate = true;
				newSearchSettings.typeUpdate = true;
				runSearch = true;
				runGraphSearch = true;
			}
			newSearchSettings.typeFilter[type] = false;
		});
		setState(dispatch, {
			searchSettings: newSearchSettings,
			metricsCounted: false,
			runSearch,
			runGraphSearch,
		});
	}
};

const handleSelectArchivedCongress = (event, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.archivedCongressSelected = event.target.checked;
	newSearchSettings.isFilterUpdate = true;
	setState(dispatch, {
		searchSettings: newSearchSettings,
		metricsCounted: false,
		runSearch: true,
		runGraphSearch: true,
	});
};

const handleTypeFilterChangeLocal = (event, state, dispatch, searchbar) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	let typeName = event.target.name;
	if (typeName.includes('(')) {
		typeName = typeName.substring(0, event.target.name.lastIndexOf('(') - 1);
	}
	newSearchSettings.typeFilter = {
		...newSearchSettings.typeFilter,
		[typeName]: event.target.checked,
	};
	if (searchbar) {
		setState(dispatch, {
			searchSettings: newSearchSettings,
			metricsCounted: false,
		});
	} else {
		newSearchSettings.isFilterUpdate = true;
		newSearchSettings.typeUpdate = true;
		setState(dispatch, {
			searchSettings: newSearchSettings,
			metricsCounted: false,
			runSearch: true,
			runGraphSearch: true,
		});
	}

	trackEvent(
		getTrackingNameForFactory(state.cloneData.clone_name),
		'TypeFilterToggle',
		event.target.name,
		event.target.value ? 1 : 0
	);
};

const renderTypes = (state, dispatch, classes, searchbar = false) => {
	const { originalTypeFilters, typeFilter } = state.searchSettings;
	const betterTypeData = {};
	for (let i = 0; i < originalTypeFilters.length; i++) {
		betterTypeData[originalTypeFilters[i][0]] = originalTypeFilters[i][1];
	}

	return (
		<FormControl
			style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}
		>
			{searchbar ? (
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
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={state.searchSettings.allTypesSelected}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
									name="All types"
									style={styles.filterBox}
								/>
							}
							label="All types"
							labelPlacement="end"
							style={styles.titleText}
						/>
						<FormControlLabel
							name="Archived Congress"
							value="Archived Congress"
							classes={{ label: classes.titleText }}
							control={
								<Checkbox
									classes={{ root: classes.filterBox }}
									onClick={(event) => handleSelectArchivedCongress(event, state, dispatch)}
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={state.searchSettings.archivedCongressSelected}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
									name="Archived Congress"
									style={styles.filterBox}
								/>
							}
							label="Archived Congress"
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
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={state.searchSettings.specificTypesSelected}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
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
						{state.searchSettings.specificTypesSelected &&
							Object.keys(typeFilter).map((type, index) => {
								if (index < 10 || state.seeMoreTypes) {
									return (
										<FormControlLabel
											key={`${type}`}
											value={`${type}`}
											classes={{
												root: classes.rootLabel,
												label: classes.checkboxPill,
											}}
											control={
												<Checkbox
													classes={{
														root: classes.rootButton,
														checked: classes.checkedButton,
													}}
													name={`${type}`}
													checked={state.searchSettings.typeFilter[type]}
													onClick={(event) =>
														handleTypeFilterChangeLocal(
															event,
															state,
															dispatch,
															true
														)
													}
												/>
											}
											label={`${type}`}
											labelPlacement="end"
										/>
									);
								} else {
									return null;
								}
							})}
					</FormGroup>
					{state.searchSettings.specificTypesSelected && (
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
			) : (
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
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={state.searchSettings.allTypesSelected}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
									name="All types"
									style={styles.filterBox}
								/>
							}
							label="All types"
							labelPlacement="end"
							style={styles.titleText}
						/>
					</FormGroup>
					<FormGroup row style={{ marginBottom: '10px' }}>
						<FormControlLabel
							name="Archived Congress"
							value="Archived Congress"
							classes={{ label: classes.titleText }}
							control={
								<Checkbox
									classes={{ root: classes.filterBox }}
									onClick={(event) => handleSelectArchivedCongress(event, state, dispatch)}
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={state.searchSettings.archivedCongressSelected}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
									name="Archived Congress"
									style={styles.filterBox}
								/>
							}
							label="Archived Congress"
							labelPlacement="end"
							style={styles.titleText}
						/>
					</FormGroup>
					<FormGroup row>
						<FormControlLabel
							name="Specific type(s)"
							value="Specific type(s)"
							classes={{ label: classes.titleText }}
							control={
								<Checkbox
									classes={{ root: classes.filterBox }}
									onClick={() => handleSelectSpecificTypes(state, dispatch)}
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={state.searchSettings.specificTypesSelected}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
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
						{state.searchSettings.specificTypesSelected &&
							Object.keys(betterTypeData).map((type) => {
								return (
									<FormControlLabel
										disabled={
											!betterTypeData[type] &&
											!state.searchSettings.typeFilter[type]
										}
										key={`${type} (${betterTypeData[type]})`}
										value={`${type} (${betterTypeData[type]})`}
										classes={{
											root: classes.rootLabel,
											label: classes.checkboxPill,
										}}
										control={
											<Checkbox
												classes={{
													root: classes.rootButton,
													checked: classes.checkedButton,
												}}
												name={`${type} (${betterTypeData[type]})`}
												checked={state.searchSettings.typeFilter[type]}
												onClick={(event) =>
													handleTypeFilterChangeLocal(event, state, dispatch)
												}
											/>
										}
										label={`${type} (${betterTypeData[type]})`}
										labelPlacement="end"
									/>
								);
							})}
					</FormGroup>
				</>
			)}
		</FormControl>
	);
};

const handleSelectPublicationDateAllTime = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	const runSearch = !state.publicationDateAllTime;
	const runGraphSearch = !state.publicationDateAllTime;
	newSearchSettings.publicationDateAllTime = true;
	newSearchSettings.publicationDateFilter = [null, null];
	setState(dispatch, {
		searchSettings: newSearchSettings,
		metricsCounted: false,
		runSearch,
		runGraphSearch,
	});
};

const handleSelectPublicationDateSpecificDates = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.publicationDateAllTime = false;
	setState(dispatch, {
		searchSettings: newSearchSettings,
		metricsCounted: false,
	});
};

const handleDateRangeChange = (
	date,
	isStartDate,
	filterType,
	state,
	dispatch
) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	const { publicationDateFilter, accessDateFilter } = newSearchSettings;

	if (Object.prototype.toString.call(date) === '[object Date]') {
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		if (!isStartDate) {
			date.setDate(date.getDate() + 1);
		}
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
	let runSearch = false;
	let runGraphSearch = false;
	if (!isNaN(temp[0]?.getTime()) && !isNaN(temp[1]?.getTime())) {
		runSearch = true;
		runGraphSearch = true;
		newSearchSettings.isFilterUpdate = true;
	}

	if (filterType === 'publication') {
		newSearchSettings.publicationDateFilter = temp;
	} else {
		newSearchSettings.accessDateFilter = temp;
	}
	setState(dispatch, {
		searchSettings: newSearchSettings,
		metricsCounted: false,
		runSearch,
		runGraphSearch,
	});
};

const renderDates = (
	state,
	dispatch,
	classes,
	setDatePickerOpen,
	setDatePickerClosed,
	searchbar = false
) => {
	const pubAllTime =
		state.searchSettings.publicationDateAllTime === undefined
			? true
			: state.searchSettings.publicationDateAllTime;

	return (
		<MuiPickersUtilsProvider utils={DateFnsUtils}>
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
													onClick={() =>
														handleSelectPublicationDateAllTime(state, dispatch)
													}
													icon={
														<CheckBoxOutlineBlankIcon
															style={{ visibility: 'hidden' }}
														/>
													}
													checked={pubAllTime}
													checkedIcon={
														<i
															style={{ color: '#E9691D' }}
															className="fa fa-check"
														/>
													}
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
														handleSelectPublicationDateSpecificDates(
															state,
															dispatch
														)
													}
													icon={
														<CheckBoxOutlineBlankIcon
															style={{ visibility: 'hidden' }}
														/>
													}
													checked={!pubAllTime}
													checkedIcon={
														<i
															style={{ color: '#E9691D' }}
															className="fa fa-check"
														/>
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
														onClick={() =>
															handleSelectPublicationDateAllTime(
																state,
																dispatch
															)
														}
														icon={
															<CheckBoxOutlineBlankIcon
																style={{ visibility: 'hidden' }}
															/>
														}
														checked={pubAllTime}
														checkedIcon={
															<i
																style={{ color: '#E9691D' }}
																className="fa fa-check"
															/>
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
															handleSelectPublicationDateSpecificDates(
																state,
																dispatch
															)
														}
														icon={
															<CheckBoxOutlineBlankIcon
																style={{ visibility: 'hidden' }}
															/>
														}
														checked={!pubAllTime}
														checkedIcon={
															<i
																style={{ color: '#E9691D' }}
																className="fa fa-check"
															/>
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
							<div style={{ display: 'flex' }}>
								<KeyboardDatePicker
									margin="normal"
									label="Start Date"
									format="MM/dd/yyyy"
									InputProps={{
										style: {
											backgroundColor: 'white',
											padding: '5px',
											fontSize: '14px',
											marginRight: '15px',
										},
									}}
									value={state.searchSettings.publicationDateFilter[0]}
									onChange={(date) =>
										handleDateRangeChange(
											date,
											true,
											'publication',
											state,
											dispatch
										)
									}
									onOpen={setDatePickerOpen}
									onClose={setDatePickerClosed}
								/>
								<KeyboardDatePicker
									margin="normal"
									label="End Date"
									format="MM/dd/yyyy"
									InputProps={{
										style: {
											backgroundColor: 'white',
											padding: '5px',
											fontSize: '14px',
										},
									}}
									value={state.searchSettings.publicationDateFilter[1]}
									onChange={(date) =>
										handleDateRangeChange(
											date,
											false,
											'publication',
											state,
											dispatch
										)
									}
									onOpen={setDatePickerOpen}
									onClose={setDatePickerClosed}
								/>
							</div>
						)}
					</div>
				</ThemeProvider>
			</div>
		</MuiPickersUtilsProvider>
	);
};

const handleRevokedChange = (event, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.includeRevoked = event.target.checked;
	newSearchSettings.isFilterUpdate = true;
	setState(dispatch, {
		searchSettings: newSearchSettings,
		metricsCounted: false,
		runSearch: true,
		runGraphSearch: true,
	});
};

const renderStatus = (state, dispatch, classes) => {
	return (
		<div>
			<FormControl
				style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}
			>
				<FormGroup row style={{ marginBottom: '0px' }}>
					<FormControlLabel
						name="Revoked Docs"
						value="Revoked Docs"
						classes={{ label: classes.titleText }}
						control={
							<Checkbox
								classes={{ root: classes.filterBox }}
								onClick={(event) => handleRevokedChange(event, state, dispatch)}
								icon={
									<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />
								}
								checked={state.searchSettings.includeRevoked}
								checkedIcon={
									<i style={{ color: '#E9691D' }} className="fa fa-check" />
								}
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


const resetAdvancedSettings = (dispatch) => {
	dispatch({ type: 'RESET_SEARCH_SETTINGS' });
};

const PolicySearchMatrixHandler = {
	getSearchMatrixItems(props) {
		
		const {
			state,
			dispatch,
			classes,
		} = props;


		return (
			<>
				<div style={{ width: '100%', marginBottom: 10 }}>
					<GCAccordion
						expanded={state.searchSettings.specificOrgsSelected}
						header={'SOURCE'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						{renderSources(state, dispatch, classes)}
					</GCAccordion>
				</div>

				<div style={{ width: '100%', marginBottom: 10 }}>
					<GCAccordion
						expanded={state.searchSettings.specificTypesSelected}
						header={'TYPE'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						{renderTypes(state, dispatch, classes)}
					</GCAccordion>
				</div>

				<div style={{ width: '100%', marginBottom: 10 }}>
					<GCAccordion
						expanded={!state.searchSettings.publicationDateAllTime}
						header={'PUBLICATION DATE'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						{renderDates(state, dispatch, classes)}
					</GCAccordion>
				</div>

				<div style={{ width: '100%', marginBottom: 10 }}>
					<GCAccordion
						expanded={state.searchSettings.includeRevoked}
						header={'STATUS'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						{renderStatus(state, dispatch, classes)}
					</GCAccordion>
				</div>

				<button
					type="button"
					style={{
						border: 'none',
						backgroundColor: '#B0BAC5',
						padding: '0 15px',
						display: 'flex',
						height: 50,
						alignItems: 'center',
						borderRadius: 5,
					}}
					onClick={() => {
						resetAdvancedSettings(dispatch);
						setState(dispatch, { runSearch: true, runGraphSearch: true });
					}}
				>
					<span
						style={{
							fontFamily: 'Montserrat',
							fontWeight: 600,
							width: '100%',
							marginTop: '5px',
							marginBottom: '10px',
							marginLeft: '-1px',
						}}
					>
						Clear Filters
					</span>
				</button>
			</>
		);
	},

	getAdvancedOptions(props) {
		const {
			state,
			dispatch,
			classes,
			handleSubmit,
			setDatePickerOpen,
			setDatePickerClosed,
		} = props;

		return (
			<>
				<div style={styles.filterDiv}>
					<strong style={styles.boldText}>SOURCE</strong>
					<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
					<div>{renderSources(state, dispatch, classes, true)}</div>
				</div>

				<div style={styles.filterDiv}>
					<strong style={styles.boldText}>TYPE</strong>
					<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
					{renderTypes(state, dispatch, classes, true)}
				</div>

				<div style={styles.filterDiv}>
					<strong style={styles.boldText}>PUBLICATION DATE</strong>
					<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
					{renderDates(
						state,
						dispatch,
						classes,
						setDatePickerOpen,
						setDatePickerClosed,
						true
					)}
				</div>

				<div style={styles.filterDiv}>
					<strong style={styles.boldText}>STATUS</strong>
					<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
					{renderStatus(state, dispatch, classes)}
				</div>
				<div style={{ display: 'flex', margin: '10px' }}>
					<div style={{ width: '120px', height: '40px', marginRight: '20px' }}>
						<GCButton
							style={{
								border: 'none',
								width: '100%',
								height: '100%',
								padding: '0px',
							}}
							isSecondaryBtn={true}
							onClick={() => resetAdvancedSettings(dispatch)}
						>
							Clear Filters
						</GCButton>
					</div>
					<div style={{ width: '120px', height: '40px' }}>
						<GCButton
							style={{ width: '100%', height: '100%' }}
							onClick={handleSubmit}
						>
							Search
						</GCButton>
					</div>
				</div>
			</>
		);
	},
};

const styles = {
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

export default PolicySearchMatrixHandler;
