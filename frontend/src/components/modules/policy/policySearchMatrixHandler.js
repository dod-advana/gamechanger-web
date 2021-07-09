import React from "react";
import GCAccordion from "../../common/GCAccordion";
import GCButton from "../../common/GCButton";
import _ from "lodash";
import {
	FormControl,
	FormGroup,
	FormControlLabel,
	Checkbox,
	TextField
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
import uuidv4 from "uuid/v4";
import Autocomplete from '@material-ui/lab/Autocomplete';
import {trackEvent} from "../../telemetry/Matomo";
import {getTrackingNameForFactory} from "../../../gamechangerUtils";

const handleSelectSpecificOrgs = (state, dispatch) => {
    const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.specificOrgsSelected = true;
	newSearchSettings.allOrgsSelected = false;
	setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
}

const handleSelectAllOrgs = (state, dispatch) => {
    const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.specificOrgsSelected = false;
	newSearchSettings.allOrgsSelected = true;
    setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
}

const handleOrganizationFilterChange = (event, state, dispatch) => {
//	const newSelectedOrgs = _.cloneDeep(state.searchSettings.orgFilter);
        
    const newSearchSettings = _.cloneDeep(state.searchSettings);
	let orgName = event.target.name.substring(0, event.target.name.lastIndexOf('(')-1);
	newSearchSettings.orgFilter = {
		...newSearchSettings.orgFilter,
		[orgName]: event.target.checked
	};
	newSearchSettings.isFilterUpdate = true;
    state.runSearch = true;

    //newSelectedOrgs[orgName] = event.target.checked;
    setState(dispatch, {searchSettings: newSearchSettings, metricsCounted: false});
	//setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
	trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'OrgFilterToggle', event.target.name, event.target.value ? 1 : 0);
}

const renderSources = (state, dispatch, classes) => {
		
		const betterOrgData = {};
		for(let i=0; i<state.sidebarOrgs.length; i++) {
			betterOrgData[state.sidebarOrgs[i][0]] = state.sidebarOrgs[i][1];
		}
		const { originalOrgFilters } = state.searchSettings;

		return (
			<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
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
					{state.searchSettings.specificOrgsSelected && Object.keys(originalOrgFilters).map(org => {
						return (
							<FormControlLabel
								key={`${originalOrgFilters[org][0]} (${originalOrgFilters[org][1]})`}
								value={`${originalOrgFilters[org][0]} (${originalOrgFilters[org][1]})`}
								classes={{ label: classes.checkboxPill }}
								control={<Checkbox classes={{ root: classes.rootButton, checked: classes.checkedButton }} name={`${originalOrgFilters[org][0]} (${originalOrgFilters[org][1]})`} checked={state.searchSettings.orgFilter[originalOrgFilters[org][0]]} onClick={(event) => handleOrganizationFilterChange(event, state, dispatch)} />}
								label={`${originalOrgFilters[org][0]} (${originalOrgFilters[org][1]})`}
								labelPlacement="end"
							/>
						)
					})}
				</FormGroup>
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
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.specificTypesSelected = false;
	newSearchSettings.allTypesSelected = true;
	setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
}

const handleTypeFilterChangeLocal = (event, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	let typeName = event.target.name.substring(0, event.target.name.lastIndexOf('(')-1);
	newSearchSettings.typeFilter = {
		...newSearchSettings.typeFilter,
		[typeName]: event.target.checked
	};
	setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
	trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'TypeFilterToggle', event.target.name, event.target.value ? 1 : 0);
}

const renderTypes = (state, dispatch, classes) => {

	const betterTypeData = {};
	for(let i=0; i<state.sidebarDocTypes.length; i++) {
		betterTypeData[state.sidebarDocTypes[i][0]] = state.sidebarDocTypes[i][1];
	}

	return (
		<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
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
				{state.searchSettings.specificTypesSelected && Object.keys(state.searchSettings.typeFilter).map(type => {
					return (
						<FormControlLabel
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
		</FormControl>
	);
}

const handleSelectPublicationDateAllTime = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.searchSettings);
	newSearchSettings.publicationDateAllTime = true;
	setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
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
	
	if(filterType === 'publication'){
		newSearchSettings.publicationDateFilter = temp;
	} else {
		newSearchSettings.accessDateFilter = temp;
	}
	setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
}

const renderDates = (state, dispatch, classes) => {
	const pubAllTime = state.searchSettings.publicationDateAllTime === undefined ? true : state.searchSettings.publicationDateAllTime;
	
	return (
		<MuiPickersUtilsProvider utils={DateFnsUtils}>
			<div style={{ padding: '10px' }}>
				<ThemeProvider theme={themeDatePicker}>
					<div>
						<div style={{ float: 'left' }}>
						<FormControl>
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
						</FormControl>
						</div>
						{!pubAllTime && <div style={{clear: 'both'}}>
							<KeyboardDatePicker
								margin="normal"
								label="Start Date"
								format="MM/dd/yyyy"
								InputProps={{ style: { backgroundColor: 'white', padding: '5px', fontSize: '14px' } }}
								value={state.searchSettings.publicationDateFilter[0]}
								onChange={date => handleDateRangeChange(date, true, 'publication', state, dispatch)}
							/>
							<KeyboardDatePicker
								margin="normal"
								label="End Date"
								format="MM/dd/yyyy"
								InputProps={{ style: { backgroundColor: 'white', padding: '5px', fontSize: '14px' } }}
								value={state.searchSettings.publicationDateFilter[1]}
								onChange={date => handleDateRangeChange(date, false, 'publication', state, dispatch)}
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
	setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
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

const setSearchField = (key, value, state, dispatch) => {
	const { searchSettings, documentProperties } = state;
	const {searchFields} = searchSettings;
	
	const newSearchFields = _.cloneDeep(searchFields);

	let filledOut = true;

	// if we set a field, and all other fields are not empty, add a new field
	if (value !== null) {
		newSearchFields[key].field = { display_name: value.display_name, name: value.name, searchField: value.searchField };

		for (const key in newSearchFields) {
			if (newSearchFields[key].field === null) {
				filledOut = false;
			}
		}

		if (filledOut && Object.keys(newSearchFields).length < documentProperties.length) {
			newSearchFields[uuidv4()] = { field: null, input: '' };
		}
	}
	else {
		newSearchFields[key].field = value;
	}

	const newCloneSettings = _.cloneDeep(searchSettings);
	newCloneSettings.searchFields = newSearchFields;
	setState(dispatch, { searchSettings: newCloneSettings, metricsCounted: false });
}

const setSearchFieldInput = (key, value, state, dispatch) => {
	const { searchSettings } = state;
	const {searchFields} = searchSettings;

	const newSearchFields = _.cloneDeep(searchFields);
	newSearchFields[key].input = value;

	const newCloneSettings = _.cloneDeep(searchSettings);
	newCloneSettings.searchFields = newSearchFields;
	setState(dispatch, { searchSettings: newCloneSettings, metricsCounted: false });
}

const removeSearchField = (key, state, dispatch) => {
	const { searchSettings, documentProperties } = state;
	const {searchFields} = searchSettings;
	
	const newSearchFields = _.cloneDeep(searchFields);
	const numValidFields = Object.keys(newSearchFields).filter(key  => newSearchFields[key].field).length;
	
	if (numValidFields === documentProperties.length) {
		newSearchFields[key] = { field: null, input: '' };
	}
	else {
		delete newSearchFields[key];
	}

	const newCloneSettings = _.cloneDeep(searchSettings);
	newCloneSettings.searchFields = newSearchFields;
	setState(dispatch, { searchSettings: newCloneSettings, metricsCounted: false });
}

const renderAdvancedFilters = (state, dispatch) => {
	const usedPropertyNames = Object.values(state.searchSettings.searchFields).map(field => { return field.field ? field.field.display_name : '' });
	const unusedProperties = state.documentProperties.filter(prop => usedPropertyNames.indexOf(prop.display_name) === -1);
	
	return (
		<div id="searchFields" style={{ paddingTop: '10px', paddingBottom: '10px', maxHeight: '300px', overflowY: 'auto' }}>
			{Object.keys(state.searchSettings.searchFields).map(key => {
				const searchField = state.searchSettings.searchFields[key];
				return (
					<div key={key} style={{ marginLeft: '10px', float: 'left' }}>
						<div style = {{ marginRight: '15px' }}>
							<Autocomplete
								options={unusedProperties}
								getOptionLabel={(option) => option.display_name}
								getOptionSelected={(option, value) => { return option.name === value.name }}
								renderInput={(params) => <TextField {...params} label="Choose a field" variant="outlined" />}
								clearOnEscape
								clearOnBlur
								blurOnSelect
								openOnFocus
								style={{ backgroundColor: 'white', width: '100%' }}
								value={searchField.field}
								default
								onChange={(event, value) => setSearchField(key, value, state, dispatch)}
							/>
						</div>
						<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
							<div style={{ marginRight: '15px', marginTop: '10px', marginBottom: '10px', clear: 'both' }}>
								<TextField
									disabled={!state.searchSettings.searchFields[key]?.field}
									placeholder="Input"
									variant="outlined"
									value={searchField.input}
									style={{ backgroundColor: 'white', width: '100%' }}
									fullWidth={true}
									onChange={(event) => setSearchFieldInput(key, event.target.value, state, dispatch)}
									inputProps={{
										style: {
											height: 19,
											width: '100%'
										}
									}}
								/>
							</div>
							{state.searchSettings.searchFields[key].field !== null &&
								<i className="fa fa-times-circle fa-fw" style={{ cursor: 'pointer' }} onClick={() => removeSearchField(key, state, dispatch)} />
							}
						</div>
					</div>
				);
			})}
		</div>
	);
}

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
			renderCategories,
			state,
			dispatch,
			classes,
			expansionTerms,
			handleAddSearchTerm,
			handleSubmit
		} = props;
		
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
					<GCAccordion expanded={true} header={'CATEGORY'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
						{ renderCategories() }
					</GCAccordion>
				</div>
				
				<div style={{width: '100%', marginBottom: 10}}>
					<GCAccordion expanded={false} header={'SOURCE'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
						{ renderSources(state, dispatch, classes) }
					</GCAccordion>
				</div>
				
				<div style={{width: '100%', marginBottom: 10}}>
					<GCAccordion expanded={false} header={'TYPE'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
						{ renderTypes(state, dispatch, classes) }
					</GCAccordion>
				</div>
				
				<div style={{width: '100%', marginBottom: 10}}>
					<GCAccordion expanded={false} header={'PUBLICATION DATE'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
						{ renderDates(state, dispatch, classes) }
					</GCAccordion>
				</div>
				
				<div style={{width: '100%', marginBottom: 10}}>
					<GCAccordion expanded={false} header={'STATUS'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
						{ renderStatus(state, dispatch, classes) }
					</GCAccordion>
				</div>
				
				<div style={{width: '100%', marginBottom: 10}}>
					<GCAccordion expanded={false} header={'ADVANCED'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
						{ renderAdvancedFilters(state, dispatch) }
					</GCAccordion>
				</div>

				{expansionTerms.length>0 && <div style={{width: '100%', marginBottom: 10}}>
					<GCAccordion expanded={false} header={'RELATED TERMS'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
						{ renderExpansionTerms(expansionTerms, handleAddSearchTerm, classes) }
					</GCAccordion>
				</div>}

				<GCButton style={{width: '100%', marginBottom: '10px', marginLeft: '-1px' }} onClick={handleSubmit}>Update Search</GCButton>
				<button
					type="button"
					style={{ border: 'none', backgroundColor: '#B0BAC5', padding: '0 15px', display: 'flex', height: 50, alignItems: 'center', borderRadius: 5 }}
					onClick={() => resetAdvancedSettings(dispatch)}
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
	}
};

export default PolicySearchMatrixHandler;
