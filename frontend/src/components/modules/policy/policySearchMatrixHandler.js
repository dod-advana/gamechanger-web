import React from "react";
import GCAccordion from "../../common/GCAccordion";
import GCButton from "../../common/GCButton";
import _ from "lodash";
import {
	FormControl,
	FormGroup,
	FormControlLabel,
	Checkbox,
	// TextField
} from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import {
	ThemeProvider,
} from '@material-ui/core/styles';
import {setState} from "../../../sharedFunctions";
import themeDatePicker from "../../common/theme-datepicker";
import {
	MuiPickersUtilsProvider,
	KeyboardDatePicker
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
// import uuidv4 from "uuid/v4";
// import Autocomplete from '@material-ui/lab/Autocomplete';
import {trackEvent} from "../../telemetry/Matomo";
import {getTrackingNameForFactory} from "../../../gamechangerUtils";

const handleSelectAllCategories = (state, dispatch) => {
	const newSelectedCategories = _.cloneDeep(state.selectedCategories);
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.specificCategoriesSelected = false;
	newSearchSettings.allCategoriesSelected = true;
	Object.keys(newSelectedCategories).forEach(category => newSelectedCategories[category] = true);
	setState(dispatch, { selectedCategories: newSelectedCategories, searchSettings: newSearchSettings, metricsCounted: false });
}

const handleSelectSpecificCategories = (state, dispatch) =>{
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.specificCategoriesSelected = true;
	newSearchSettings.allCategoriesSelected = false;
	setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
}

const handleCategoriesFilterChange = (event, state, dispatch) => {
	const newSelectedCategories = _.cloneDeep(state.selectedCategories);
	let categoryName = event.target.name;
	newSelectedCategories[categoryName] = event.target.checked;
	setState(dispatch, { selectedCategories: newSelectedCategories, metricsCounted: false });
}

const renderCategories = (state, dispatch, classes) => {
	return (
		<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
			<FormGroup row style={{ marginBottom: '10px' }}>
				<FormControlLabel
					name='All categories'
					value='All categories'
					classes={{ label: classes.titleText }}
					control={<Checkbox
						classes={{ root: classes.filterBox }}
						onClick={() => handleSelectAllCategories(state, dispatch)}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={state.searchSettings.allCategoriesSelected}
						checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
						name='All categories'
						style={styles.filterBox}
					/>}
					label='All categories'
					labelPlacement="end"
					style={styles.titleText}
				/>
				<FormControlLabel
					name='Specific category(s)'
					value='Specific category(s)'
					classes={{ label: classes.titleText }}
					control={<Checkbox
						classes={{ root: classes.filterBox }}
						onClick={() => handleSelectSpecificCategories(state, dispatch)}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={state.searchSettings.specificCategoriesSelected}
						checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
						name='Specific category(s)'
						style={styles.filterBox}
					/>}
					label='Specific category(s)'
					labelPlacement="end"
					style={styles.titleText}
				/>
			</FormGroup>
			<FormGroup row style={{ marginLeft: '10px', width: '100%' }}>
				{state.searchSettings.specificCategoriesSelected && Object.keys(state.selectedCategories).map(category => {
					return (
						<FormControlLabel
							key={`${category}`}
							value={`${category}`}
							classes={{ label: classes.checkboxPill }}
							control={<Checkbox classes={{ root: classes.rootButton, checked: classes.checkedButton }} name={`${category}`} checked={state.selectedCategories[category]} onClick={(event) => handleCategoriesFilterChange(event, state, dispatch)} />}
							label={`${category}`}
							labelPlacement="end"
						/>
					)
				})}
			</FormGroup>
		</FormControl>
	)
}

const handleSelectSpecificOrgs = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.specificOrgsSelected = true;
	newSearchSettings.allOrgsSelected = false;
	setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
}

const handleSelectAllOrgs = (state, dispatch) => {
	if(state.searchSettings.specificOrgsSelected){
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.specificOrgsSelected = false;
		newSearchSettings.allOrgsSelected = true;
		let runSearch = false;
		Object.keys(state.searchSettings.orgFilter).forEach(org => {
			if(newSearchSettings.orgFilter[org]){
				newSearchSettings.isFilterUpdate = true;
				newSearchSettings.orgUpdate = true;
				runSearch = true;
			}
			newSearchSettings.orgFilter[org] = false;
		});
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false, runSearch });
	}
}

const handleOrganizationFilterChange = (event, state, dispatch) => {
    const newSearchSettings = _.cloneDeep(state.searchSettings);
	let orgName = event.target.name.substring(0, event.target.name.lastIndexOf('(')-1);
	newSearchSettings.orgFilter = {
		...newSearchSettings.orgFilter,
		[orgName]: event.target.checked
	};
	newSearchSettings.isFilterUpdate = true;
	newSearchSettings.orgUpdate = true;
    setState(dispatch, {searchSettings: newSearchSettings, metricsCounted: false, runSearch: true});
	trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'OrgFilterToggle', event.target.name, event.target.value ? 1 : 0);
}

	const handleOrganizationFilterChangeAdv = (event, state, dispatch) => {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		let orgName = event.target.name;
		newSearchSettings.orgFilter = {
			...newSearchSettings.orgFilter,
			[orgName]: event.target.checked
		};
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
		trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'OrgFilterToggle', event.target.name, event.target.value ? 1 : 0);
	}

const renderSources = (state, dispatch, classes, searchbar = false) => {
		const { originalOrgFilters, orgFilter } = state.searchSettings;
		const betterOrgData = {};
		for(let i=0; i<originalOrgFilters.length; i++) {
			betterOrgData[originalOrgFilters[i][0]] = originalOrgFilters[i][1];
		}


		return (
			<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
				{searchbar ? (
					<>
						<FormGroup row style={{ marginBottom: '10px' }}>
							<FormControlLabel
								name='All sources'
								value='All sources'
								classes={{ label: classes.titleText }}
								control={<Checkbox
									classes={{ root: classes.filterBox }}
									onClick={() => handleSelectAllOrgs(state, dispatch)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={state.searchSettings.allOrgsSelected}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name='All sources'
									style={styles.filterBox}
								/>}
								label='All sources'
								labelPlacement="end"
								style={styles.titleText}
							/>
							<FormControlLabel
								name='Specific source(s)'
								value='Specific source(s)'
								classes={{ label: classes.titleText }}
								control={<Checkbox
									classes={{ root: classes.filterBox }}
									onClick={() => handleSelectSpecificOrgs(state, dispatch)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={state.searchSettings.specificOrgsSelected}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name='Specific source(s)'
									style={styles.filterBox}
								/>}
								label='Specific source(s)'
								labelPlacement="end"
								style={styles.titleText}
							/>
						</FormGroup>
						<FormGroup row style={{ marginLeft: '10px', width: '100%' }}>
							{state.searchSettings.specificOrgsSelected && Object.keys(orgFilter).map( (org, index) => {
								if(index < 10 || state.seeMoreSources){
									return (
										<FormControlLabel
											key={`${org}`}
											value={`${originalOrgFilters[org]}`}
											classes={{ label: classes.checkboxPill }}
											control={<Checkbox classes={{ root: classes.rootButton, checked: classes.checkedButton }} name={`${org}`} checked={state.searchSettings.orgFilter[org]} onClick={(event) => handleOrganizationFilterChangeAdv(event, state, dispatch)} />}
											label={`${org}`}
											labelPlacement="end"
										/>
									)
								} else {
									return null;
								}
							})}
						</FormGroup>
						{state.searchSettings.specificOrgsSelected &&
							<a style={{cursor: 'pointer', fontSize: '16px'}} onClick={() => {setState(dispatch, {seeMoreSources: !state.seeMoreSources})}}>See {state.seeMoreSources ? 'Less' : 'More'}</a>
						}
					</>
					) : (
				<>
					<FormGroup row style={{ marginBottom: '10px' }}>
						<FormControlLabel
							name='All sources'
							value='All sources'
							classes={{ label: classes.titleText }}
							control={<Checkbox
								classes={{ root: classes.filterBox }}
								onClick={() => handleSelectAllOrgs(state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={state.searchSettings.allOrgsSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name='All sources'
								style={styles.filterBox}
							/>}
							label='All sources'
							labelPlacement="end"
							style={styles.titleText}
						/>
					</FormGroup>
					<FormGroup row>
						<FormControlLabel
							name='Specific source(s)'
							value='Specific source(s)'
							classes={{ label: classes.titleText }}
							control={<Checkbox
								classes={{ root: classes.filterBox }}
								onClick={() => handleSelectSpecificOrgs(state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={state.searchSettings.specificOrgsSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name='Specific source(s)'
								style={styles.filterBox}
							/>}
							label='Specific source(s)'
							labelPlacement="end"
							style={styles.titleText}
						/>
					</FormGroup>
					<FormGroup row style={{ marginLeft: '10px', width: '100%' }}>
						{state.searchSettings.specificOrgsSelected && Object.keys(betterOrgData).map(org => {
							return (
								<FormControlLabel
									disabled={!betterOrgData[org] && !state.searchSettings.orgFilter[org]}
									key={`${org} (${betterOrgData[org]})`}
									value={`${org} (${betterOrgData[org]})`}
									classes={{ label: classes.checkboxPill }}
									control={<Checkbox classes={{ root: classes.rootButton, checked: classes.checkedButton }} name={`${org} (${betterOrgData[org]})`} checked={state.searchSettings.orgFilter[org]} onClick={(event) => handleOrganizationFilterChange(event, state, dispatch)} />}
									label={`${org} (${betterOrgData[org]})`}
									labelPlacement="end"
								/>
							)
						})}
					</FormGroup>
				</>)}
			</FormControl>
		);
	}
	
const handleSelectSpecificTypes = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.specificTypesSelected = true;
	newSearchSettings.allTypesSelected = false;
	setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
}

const handleSelectAllTypes = (state, dispatch) => {
	if(state.searchSettings.specificTypesSelected){
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.specificTypesSelected = false;
		newSearchSettings.allTypesSelected = true;
		let runSearch = false;
		Object.keys(state.searchSettings.typeFilter).forEach(type => {
			if(newSearchSettings.typeFilter[type]){
				newSearchSettings.isFilterUpdate = true;
				newSearchSettings.typeUpdate = true;
				runSearch = true;
			}
			newSearchSettings.typeFilter[type] = false;
		});
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false, runSearch });
	}
}

const handleTypeFilterChangeLocal = (event, state, dispatch, searchbar) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	let typeName = event.target.name;
	if(typeName.includes('(')){
		typeName = typeName.substring(0, event.target.name.lastIndexOf('(')-1);
	}
	newSearchSettings.typeFilter = {
		...newSearchSettings.typeFilter,
		[typeName]: event.target.checked
	};
	if(searchbar){
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false});
	} else {
		newSearchSettings.isFilterUpdate = true;
		newSearchSettings.typeUpdate = true;
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false, runSearch: true });
	}
	
	trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'TypeFilterToggle', event.target.name, event.target.value ? 1 : 0);
}


const renderTypes = (state, dispatch, classes, searchbar = false) => {
	const { originalTypeFilters, typeFilter } = state.searchSettings;
	const betterTypeData = {};
	for(let i=0; i<originalTypeFilters.length; i++) {
		betterTypeData[originalTypeFilters[i][0]] = originalTypeFilters[i][1];
	}

	return (
		<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
			{searchbar ? (
				<>
				<FormGroup row style={{ marginBottom: '10px' }}>
					<FormControlLabel
						name='All types'
						value='All types'
						classes={{ label: classes.titleText }}
						control={<Checkbox
							classes={{ root: classes.filterBox }}
							onClick={() => handleSelectAllTypes(state, dispatch)}
							icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
							checked={state.searchSettings.allTypesSelected}
							checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
							name='All types'
							style={styles.filterBox}
						/>}
						label='All types'
						labelPlacement="end"
						style={styles.titleText}
					/>
					<FormControlLabel
						name='Specific type(s)'
						value='Specific type(s)'
						classes={{ label: classes.titleText }}
						control={<Checkbox
							classes={{ root: classes.filterBox }}
							onClick={() => handleSelectSpecificTypes(state, dispatch)}
							icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
							checked={state.searchSettings.specificTypesSelected}
							checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
							name='Specific type(s)'
							style={styles.filterBox}
						/>}
						label='Specific type(s)'
						labelPlacement="end"
						style={styles.titleText}
					/>
				</FormGroup>
				<FormGroup row style={{ marginLeft: '10px', width: '100%' }}>
					{state.searchSettings.specificTypesSelected && Object.keys(typeFilter).map((type, index) => {
						if(index < 10 || state.seeMoreTypes){
							return (
								<FormControlLabel
									key={`${type}`}
									value={`${type}`}
									classes={{ label: classes.checkboxPill }}
									control={<Checkbox classes={{ root: classes.rootButton, checked: classes.checkedButton }} name={`${type}`} checked={state.searchSettings.typeFilter[type]} onClick={(event) => handleTypeFilterChangeLocal(event, state, dispatch, true)} />}
									label={`${type}`}
									labelPlacement="end"
								/>
							)
						} else {
							return null;
						}
					})}
				</FormGroup>
				{state.searchSettings.specificTypesSelected &&
					<a style={{cursor: 'pointer', fontSize: '16px'}} onClick={() => {setState(dispatch, {seeMoreTypes: !state.seeMoreTypes})}}>See {state.seeMoreTypes ? 'Less' : 'More'}</a> 
				}
			</>
			) 
			: (
			<>
				<FormGroup row style={{ marginBottom: '10px' }}>
					<FormControlLabel
						name='All types'
						value='All types'
						classes={{ label: classes.titleText }}
						control={<Checkbox
							classes={{ root: classes.filterBox }}
							onClick={() => handleSelectAllTypes(state, dispatch)}
							icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
							checked={state.searchSettings.allTypesSelected}
							checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
							name='All types'
							style={styles.filterBox}
						/>}
						label='All types'
						labelPlacement="end"
						style={styles.titleText}
					/>
				</FormGroup>
				<FormGroup row>
					<FormControlLabel
						name='Specific type(s)'
						value='Specific type(s)'
						classes={{ label: classes.titleText }}
						control={<Checkbox
							classes={{ root: classes.filterBox }}
							onClick={() => handleSelectSpecificTypes(state, dispatch)}
							icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
							checked={state.searchSettings.specificTypesSelected}
							checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
							name='Specific type(s)'
						style={styles.filterBox}
					/>}
					label='Specific type(s)'
					labelPlacement="end"
					style={styles.titleText}
				/>
			</FormGroup>
			<FormGroup row style={{ marginLeft: '10px', width: '100%' }}>
				{state.searchSettings.specificTypesSelected && Object.keys(betterTypeData).map(type => {
					return (
						<FormControlLabel
							disabled={!betterTypeData[type] && !state.searchSettings.typeFilter[type]}
							key={`${type} (${betterTypeData[type]})`}
							value={`${type} (${betterTypeData[type]})`}
							classes={{ label: classes.checkboxPill }}
							control={<Checkbox classes={{ root: classes.rootButton, checked: classes.checkedButton }} name={`${type} (${betterTypeData[type]})`} checked={state.searchSettings.typeFilter[type]} onClick={(event) => handleTypeFilterChangeLocal(event, state, dispatch)} />}
							label={`${type} (${betterTypeData[type]})`}
							labelPlacement="end"
						/>
					)
				})}
			</FormGroup>
			</>)}
		</FormControl>
	);
}

const handleSelectPublicationDateAllTime = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	const runSearch = !state.publicationDateAllTime;
	newSearchSettings.publicationDateAllTime = true;
	newSearchSettings.publicationDateFilter = [null, null];
	setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false, runSearch });
}

const handleSelectPublicationDateSpecificDates = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.publicationDateAllTime = false;
	setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
}

const handleDateRangeChange = (date, isStartDate, filterType, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	const { publicationDateFilter, accessDateFilter } = newSearchSettings;
	
	if(Object.prototype.toString.call(date) === '[object Date]'){
		date.setHours(0)
		date.setMinutes(0)
		date.setSeconds(0)
		if(!isStartDate) {
			date.setDate(date.getDate()+1)
		}
	}
	
	let temp;
	switch(filterType){
		case 'publication':
			temp = publicationDateFilter
			break;
		case 'timestamp':
			temp = accessDateFilter
			break;
		default:
			break;
	}
	
	if (isStartDate){
		temp[0] = date
	} else {
		temp[1] = date
	}
	let runSearch = false;
	if(!isNaN(temp[0]?.getTime()) && !isNaN(temp[1]?.getTime())) {
		runSearch = true;
		newSearchSettings.isFilterUpdate = true;
	}

	if(filterType === 'publication'){
		newSearchSettings.publicationDateFilter = temp;
	} else {
		newSearchSettings.accessDateFilter = temp;
	}
	setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false, runSearch });
}

const renderDates = (state, dispatch, classes, setDatePickerOpen, setDatePickerClosed, searchbar = false) => {
	const pubAllTime = state.searchSettings.publicationDateAllTime === undefined ? true : state.searchSettings.publicationDateAllTime;
	
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
										name='All time'
										value='All time'
										classes={{ label: classes.titleText }}
										control={<Checkbox
											classes={{ root: classes.filterBox }}
											onClick={() => handleSelectPublicationDateAllTime(state, dispatch)}
											icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
											checked={pubAllTime}
											checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
											name='All time'
											style={styles.filterBox}
										/>}
										label='All time'
										labelPlacement="end"
										style={styles.titleText}
									/>
									<FormControlLabel
										name='Specific dates'
										value='Specific dates'
										classes={{ label: classes.titleText }}
										control={<Checkbox
											classes={{ root: classes.filterBox }}
											onClick={() => handleSelectPublicationDateSpecificDates(state, dispatch)}
											icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
											checked={!pubAllTime}
											checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
											name='Specific dates'
											style={styles.filterBox}
										/>}
										label='Specific dates'
										labelPlacement="end"
										style={styles.titleText}
									/>
								</FormGroup>
							) : (
								<>
									<FormGroup row style={{ marginBottom: '10px' }}>
										<FormControlLabel
											name='All time'
											value='All time'
											classes={{ label: classes.titleText }}
											control={<Checkbox
												classes={{ root: classes.filterBox }}
												onClick={() => handleSelectPublicationDateAllTime(state, dispatch)}
												icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
												checked={pubAllTime}
												checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
												name='All time'
												style={styles.filterBox}
											/>}
											label='All time'
											labelPlacement="end"
											style={styles.titleText}
										/>
									</FormGroup>
									<FormGroup row>
										<FormControlLabel
											name='Specific dates'
											value='Specific dates'
											classes={{ label: classes.titleText }}
											control={<Checkbox
												classes={{ root: classes.filterBox }}
												onClick={() => handleSelectPublicationDateSpecificDates(state, dispatch)}
												icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
												checked={!pubAllTime}
												checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
												name='Specific dates'
												style={styles.filterBox}
											/>}
											label='Specific dates'
											labelPlacement="end"
											style={styles.titleText}
										/>
									</FormGroup>
								</>
							)}
						</FormControl>
						</div>
						{!pubAllTime && <div style={{display: 'flex'}}>
							<KeyboardDatePicker
								margin="normal"
								label="Start Date"
								format="MM/dd/yyyy"
								InputProps={{ style: { backgroundColor: 'white', padding: '5px', fontSize: '14px', marginRight: '15px' } }}
								value={state.searchSettings.publicationDateFilter[0]}
								onChange={date => handleDateRangeChange(date, true, 'publication', state, dispatch)}
								onOpen={setDatePickerOpen}
								onClose={setDatePickerClosed}
							/>
							<KeyboardDatePicker
								margin="normal"
								label="End Date"
								format="MM/dd/yyyy"
								InputProps={{ style: { backgroundColor: 'white', padding: '5px', fontSize: '14px' } }}
								value={state.searchSettings.publicationDateFilter[1]}
								onChange={date => handleDateRangeChange(date, false, 'publication', state, dispatch)}
								onOpen={setDatePickerOpen}
								onClose={setDatePickerClosed}
							/>
						</div>}
					</div>
				</ThemeProvider>
			</div>
		</MuiPickersUtilsProvider>
	);
}

const handleRevokedChange = (event, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.includeRevoked = event.target.checked;
	newSearchSettings.isFilterUpdate = true;
	setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false, runSearch: true });
}

const renderStatus = (state, dispatch, classes) => {
	return (
		<div>
			<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
				<FormGroup row style={{ marginBottom: '0px' }}>
					<FormControlLabel
						name='Revoked Docs'
						value='Revoked Docs'
						classes={{ label: classes.titleText }}
						control={<Checkbox
							classes={{ root: classes.filterBox }}
							onClick={(event) => handleRevokedChange(event, state, dispatch)}
							icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
							checked={state.searchSettings.includeRevoked}
							checkedIcon={<i style={{ color: '#E9691D' }}
								className="fa fa-check" />}
							name='Revoked Docs'
						/>}
						label='Include Canceled Documents'
						labelPlacement="end"
					/>
				</FormGroup>
			</FormControl>
		</div>
	);
}
// // Temporarily removing advanced search filter
// const setSearchField = (key, value, state, dispatch) => {
// 	const { searchSettings, documentProperties } = state;
// 	const {searchFields} = searchSettings;
	
// 	const newSearchFields = _.cloneDeep(searchFields);

// 	let filledOut = true;

// 	// if we set a field, and all other fields are not empty, add a new field
// 	if (value !== null) {
// 		newSearchFields[key].field = { display_name: value.display_name, name: value.name, searchField: value.searchField };

// 		for (const key in newSearchFields) {
// 			if (newSearchFields[key].field === null) {
// 				filledOut = false;
// 			}
// 		}

// 		if (filledOut && Object.keys(newSearchFields).length < documentProperties.length) {
// 			newSearchFields[uuidv4()] = { field: null, input: '' };
// 		}
// 	}
// 	else {
// 		newSearchFields[key].field = value;
// 	}

// 	const newCloneSettings = _.cloneDeep(searchSettings);
// 	newCloneSettings.searchFields = newSearchFields;
// 	setState(dispatch, { searchSettings: newCloneSettings, metricsCounted: false });
// }

// const setSearchFieldInput = (key, value, state, dispatch) => {
// 	const { searchSettings } = state;
// 	const {searchFields} = searchSettings;

// 	const newSearchFields = _.cloneDeep(searchFields);
// 	newSearchFields[key].input = value;

// 	const newCloneSettings = _.cloneDeep(searchSettings);
// 	newCloneSettings.searchFields = newSearchFields;
// 	setState(dispatch, { searchSettings: newCloneSettings, metricsCounted: false });
// }

// const removeSearchField = (key, state, dispatch) => {
// 	const { searchSettings, documentProperties } = state;
// 	const {searchFields} = searchSettings;
	
// 	const newSearchFields = _.cloneDeep(searchFields);
// 	const numValidFields = Object.keys(newSearchFields).filter(key  => newSearchFields[key].field).length;
	
// 	if (numValidFields === documentProperties.length) {
// 		newSearchFields[key] = { field: null, input: '' };
// 	}
// 	else {
// 		delete newSearchFields[key];
// 	}

// 	const newCloneSettings = _.cloneDeep(searchSettings);
// 	newCloneSettings.searchFields = newSearchFields;
// 	setState(dispatch, { searchSettings: newCloneSettings, metricsCounted: false });
// }

// const renderAdvancedFilters = (state, dispatch, searchbar = false) => {
// 	const usedPropertyNames = Object.values(state.searchSettings.searchFields).map(field => { return field.field ? field.field.display_name : '' });
// 	const unusedProperties = state.documentProperties.filter(prop => usedPropertyNames.indexOf(prop.display_name) === -1);
// 	return (
// 		<div id="searchFields" style={{ paddingTop: '10px', paddingBottom: '10px', maxHeight: '300px', overflowY: 'auto' }}>
// 			{Object.keys(state.searchSettings.searchFields).map(key => {
// 				const searchField = state.searchSettings.searchFields[key];
// 				if(searchbar){
// 					return (
// 						<div key={key} style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
// 							TESTING
// 							<div style={{ flexGrow: 1, marginRight: '10px'}}>
// 								<Autocomplete
// 									options={unusedProperties}
// 									getOptionLabel={(option) => option.display_name}
// 									getOptionSelected={(option, value) => { return option.name === value.name }}
// 									renderInput={(params) => <TextField {...params} label="Choose a field" variant="outlined" />}
// 									clearOnEscape
// 									clearOnBlur
// 									blurOnSelect
// 									openOnFocus
// 									style={{ backgroundColor: 'white', width: '100%'}}
// 									value={searchField.field}
// 									default
// 									onChange={(event, value) => setSearchField(key, value, state, dispatch)}
// 								/>
// 								</div>
// 								<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', flexGrow: 1 }}>
// 									<div style={{ marginRight: '15px', marginTop: '10px', marginBottom: '10px', clear: 'both' }}>
// 										<TextField
// 											disabled={!state.searchSettings.searchFields[key]?.field}
// 											placeholder="Input"
// 											variant="outlined"
// 											value={searchField.input}
// 											style={{ backgroundColor: 'white', width: '100%'}}
// 											fullWidth={true}
// 											onChange={(event) => setSearchFieldInput(key, event.target.value, state, dispatch)}
// 											inputProps={{
// 												style: {
// 													height: 19,
// 													width: '100%'
// 												}
// 											}}
// 										/>
// 									</div>
// 									{state.searchSettings.searchFields[key].field !== null &&
// 										<i className="fa fa-times-circle fa-fw" style={{ cursor: 'pointer' }} onClick={() => removeSearchField(key, state, dispatch)} />
// 									}
// 							</div>
// 							</div>
// 					);
// 				} else {
// 					return (
// 						<div key={key} style={{ marginLeft: '10px', float: 'left' }}>
// 							<div style = {{ marginRight: '15px' }}>
// 								<Autocomplete
// 									options={unusedProperties}
// 									getOptionLabel={(option) => option.display_name}
// 									getOptionSelected={(option, value) => { return option.name === value.name }}
// 									renderInput={(params) => <TextField {...params} label="Choose a field" variant="outlined" />}
// 									clearOnEscape
// 									clearOnBlur
// 									blurOnSelect
// 									openOnFocus
// 									style={{ backgroundColor: 'white', width: '100%' }}
// 									value={searchField.field}
// 									default
// 									onChange={(event, value) => setSearchField(key, value, state, dispatch)}
// 								/>
// 							</div>
// 							<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
// 								<div style={{ marginRight: '15px', marginTop: '10px', marginBottom: '10px', clear: 'both' }}>
// 									<TextField
// 										disabled={!state.searchSettings.searchFields[key]?.field}
// 										placeholder="Input"
// 										variant="outlined"
// 										value={searchField.input}
// 										style={{ backgroundColor: 'white', width: '100%' }}
// 										fullWidth={true}
// 										onChange={(event) => setSearchFieldInput(key, event.target.value, state, dispatch)}
// 										inputProps={{
// 											style: {
// 												height: 19,
// 												width: '100%'
// 											}
// 										}}
// 									/>
// 								</div>
// 								{state.searchSettings.searchFields[key].field !== null &&
// 									<i className="fa fa-times-circle fa-fw" style={{ cursor: 'pointer' }} onClick={() => removeSearchField(key, state, dispatch)} />
// 								}
// 							</div>
// 						</div>
// 					);
// 				}
				
// 			})}
// 		</div>
// 	);
// }

const renderExpansionTerms = (expansionTerms, handleAddSearchTerm, classes) => {
	return (
		<div style={{margin: '10px 0 10px 0'}}>
			<FormGroup row style={{ marginLeft: '20px', width: '100%' }}>
				{expansionTerms.map(({phrase, source, checked}, idx) => {
					const term = phrase
					return (
						<FormControlLabel
							key={term}
							value={term}
							classes={{ label: classes.checkboxPill }}
							control={<Checkbox classes={{ root: classes.rootButton, checked: classes.checkedButton }} name={term} checked={checked} onClick={() => handleAddSearchTerm(phrase,source,idx)} />}
							label={term}
							labelPlacement="end"
						/>
					)
				})}
			</FormGroup>
		</div>
	);
};

const resetAdvancedSettings = (dispatch) => {
	dispatch({type: 'RESET_SEARCH_SETTINGS'});
}

const PolicySearchMatrixHandler = {
	getSearchMatrixItems(props) {
		
		const {
			state,
			dispatch,
			classes,
			expansionTerms,
			handleAddSearchTerm
		} = props;
		
		let expansionTermSelected = false;
		expansionTerms.forEach(term => {
			if(term.checked === true) expansionTermSelected = true;
		})

        return (
			<>
				{/*{false &&*/}
				{/*	<div style={styles.subHead}>*/}
				{/*		<div style={{*/}
				{/*			...styles.headerColumn,*/}
				{/*			color: 'black',*/}
				{/*			backgroundColor: 'white',*/}
				{/*			marginTop: 0,*/}
				{/*			marginLeft: -5*/}
				{/*		}}>*/}
				{/*			<div><span>{'Sort By:'}</span></div>*/}
				{/*		</div>*/}
				{/*	</div>}*/}
				{/*	{false &&*/}
				{/*	<select name="category" value={category} style={{marginBottom: 15, borderWidth: '1px', borderRadius: '5px', borderStyle: 'solid', borderColor: '#B0BAC5'}} onChange={event => handleCategoryChange(event.target.value)}>*/}
				{/*		<option id="0" >Relevance</option>*/}
				{/*	</select>}*/}
				{/*	{false &&*/}
				{/*	<div style={{width: '100%', marginBottom: 10, border: 'none'}}>*/}
				{/*		<GCAccordion expanded={false} header={'SEARCH TYPES'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>*/}
				{/*			{ renderSearchTypes() }*/}
				{/*		</GCAccordion>*/}
				{/*	</div>*/}
				{/*}*/}
				
				<div style={{width: '100%', marginBottom: 10}}>
					<GCAccordion expanded={state.searchSettings.specificOrgsSelected} header={'SOURCE'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
						{ renderSources(state, dispatch, classes) }
					</GCAccordion>
				</div>
				
				<div style={{width: '100%', marginBottom: 10}}>
					<GCAccordion expanded={state.searchSettings.specificTypesSelected} header={'TYPE'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'500'}>
						{ renderTypes(state, dispatch, classes) }
					</GCAccordion>
				</div>
				
				<div style={{width: '100%', marginBottom: 10}}>
					<GCAccordion expanded={!state.searchSettings.publicationDateAllTime} header={'PUBLICATION DATE'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
						{ renderDates(state, dispatch, classes) }
					</GCAccordion>
				</div>
				
				<div style={{width: '100%', marginBottom: 10}}>
					<GCAccordion expanded={state.searchSettings.includeRevoked} header={'STATUS'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
						{ renderStatus(state, dispatch, classes) }
					</GCAccordion>
				</div>
				
				{/* <div style={{width: '100%', marginBottom: 10}}>
					<GCAccordion expanded={false} header={'ADVANCED'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
						{ renderAdvancedFilters(state, dispatch) }
					</GCAccordion>
				</div> */}

				{expansionTerms.length>0 && <div style={{width: '100%', marginBottom: 10}}>
					<GCAccordion expanded={expansionTermSelected} header={'RELATED TERMS'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
						{ renderExpansionTerms(expansionTerms, handleAddSearchTerm, classes) }
					</GCAccordion>
				</div>}

				<button
					type="button"
					style={{ border: 'none', backgroundColor: '#B0BAC5', padding: '0 15px', display: 'flex', height: 50, alignItems: 'center', borderRadius: 5 }}
					onClick={() => {
						resetAdvancedSettings(dispatch);
						setState(dispatch, { runSearch: true });
					}}
				>
					<span style={{
						fontFamily: 'Montserrat',
						fontWeight: 600,
						width: '100%', marginTop: '5px', marginBottom: '10px', marginLeft: '-1px'
					}}>
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
			setDatePickerClosed
		} = props;

		return (
			<>
				<div style={styles.filterDiv}>
					<strong style={styles.boldText}>CATEGORY</strong>
					<hr style={{marginTop: '5px', marginBottom: '10px'}}/>
					<div>
						{renderCategories(state, dispatch, classes)}
					</div>
				</div>

				<div style={styles.filterDiv}>
					<strong style={styles.boldText}>SOURCE</strong>
					<hr style={{marginTop: '5px', marginBottom: '10px'}}/>
					<div>
					{renderSources(state, dispatch, classes, true)}
					</div>
				</div>
				
				<div style={styles.filterDiv}>
					<strong style={styles.boldText}>TYPE</strong>
					<hr style={{marginTop: '5px', marginBottom: '10px'}}/>
					{renderTypes(state, dispatch, classes, true)}
				</div>

				<div style={styles.filterDiv}>
					<strong style={styles.boldText}>PUBLICATION DATE</strong>
					<hr style={{marginTop: '5px', marginBottom: '10px'}}/>
					{renderDates(state, dispatch, classes, setDatePickerOpen, setDatePickerClosed, true)}
				</div>

				<div style={styles.filterDiv}>
					<strong style={styles.boldText}>STATUS</strong>
					<hr style={{marginTop: '5px', marginBottom: '10px'}}/>
					{renderStatus(state, dispatch, classes)}
				</div>

				{/* <div style={styles.filterDiv}>
					<strong style={styles.boldText}>ADVANCED</strong>
					<hr style={{marginTop: '5px', marginBottom: '10px'}}/>
					{renderAdvancedFilters(state, dispatch, true)}
				</div> */}

				<div style ={{display: 'flex', margin: '10px'}}>
					<div style={{width: '120px', height: '40px', marginRight: '20px'}}>
						<GCButton style={{border: 'none', width: '100%', height: '100%', padding: '0px', color: 'black', backgroundColor: '#B0BAC5'}} onClick={() => resetAdvancedSettings(dispatch)}>Clear Filters</GCButton>
					</div>
					<div style={{width: '120px', height: '40px'}}>
						<GCButton style={{width: '100%', height: '100%'}} onClick={handleSubmit}>Search</GCButton>
					</div>
				</div>
				
			</>
		);
	}
}

const styles = {
	innerContainer: {
		display: 'flex',
		height: '100%',
		flexDirection: 'column'
	},
	cardBody: {
        padding: '10px 0px',
		fontSize: '1.1em',
		fontFamily: 'Noto Sans',
	},
	subHead: {
		fontSize: "1.0em",
		display: 'flex',
		position: 'relative'
	},
	headerColumn: {
		fontSize: "1.0em",
		width: '100%',
		padding: '8px 8px',
		backgroundColor: 'rgb(50,53,64)',
		display: 'flex',
		alignItems: 'center'
	},
	filterDiv: {
		display: 'block',
		margin: '10px'
	},
	boldText: {
		fontSize: '0.8em'
	}

};

export default PolicySearchMatrixHandler;
