import React from 'react';
import GCAccordion from '../../common/GCAccordion';
import _ from 'lodash';
import {
	FormControl,
	FormGroup,
	FormControlLabel,
	Checkbox,
} from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import {
	ThemeProvider,
} from '@material-ui/core/styles';
import themeDatePicker from '../../common/theme-datepicker';
import {
	MuiPickersUtilsProvider,
	KeyboardDatePicker
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import {trackEvent} from '../../telemetry/Matomo';
import {setState} from '../../../utils/sharedFunctions';
import {getTrackingNameForFactory} from '../../../utils/gamechangerUtils';
import { gcOrange } from '../../common/gc-colors';

const handleSelectSpecificOrgs = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	newSearchSettings.specificOrgsSelected = true;
	newSearchSettings.allOrgsSelected = false;
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
}

const handleSelectAllOrgs = (state, dispatch) => {
	if(state.analystToolsSearchSettings.specificOrgsSelected){
		const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
		newSearchSettings.specificOrgsSelected = false;
		newSearchSettings.allOrgsSelected = true;
		Object.keys(state.analystToolsSearchSettings.orgFilter).forEach(org => {
			if(newSearchSettings.orgFilter[org]){
				newSearchSettings.isFilterUpdate = true;
				newSearchSettings.orgUpdate = true;
			}
			newSearchSettings.orgFilter[org] = false;
		});
		setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false});
	}
}

const handleOrganizationFilterChange = (event, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	let orgName = event.target.name;
	newSearchSettings.orgFilter = {
		...newSearchSettings.orgFilter,
		[orgName]: event.target.checked
	};
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
	trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'OrgFilterToggle', event.target.name, event.target.value ? 1 : 0);
}

const renderSources = (state, dispatch, classes) => {
	const { originalOrgFilters, orgFilter } = state.analystToolsSearchSettings;
	const betterOrgData = {};
	for(let i=0; i<originalOrgFilters.length; i++) {
		betterOrgData[originalOrgFilters[i][0]] = originalOrgFilters[i][1];
	}


	return (
		<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
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
							checked={state.analystToolsSearchSettings.allOrgsSelected}
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
							checked={state.analystToolsSearchSettings.specificOrgsSelected}
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
					{state.analystToolsSearchSettings.specificOrgsSelected && Object.keys(orgFilter).map( (org, index) => {
						if(index < 10 || state.seeMoreSources){
							return (
								<FormControlLabel
									key={`${org}`}
									value={`${originalOrgFilters[org]}`}
									classes={{ root: classes.rootLabel, label: classes.checkboxPill }}
									control={<Checkbox classes={{ root: classes.rootButton, checked: classes.checkedButton }} name={`${org}`} checked={state.analystToolsSearchSettings.orgFilter[org]} onClick={(event) => handleOrganizationFilterChange(event, state, dispatch)} />}
									label={`${org}`}
									labelPlacement="end"
								/>
							)
						} else {
							return null;
						}
					})}
				</FormGroup>
				{state.analystToolsSearchSettings.specificOrgsSelected &&
						// eslint-disable-next-line
						<a style={{cursor: 'pointer', fontSize: '16px'}} onClick={() => {setState(dispatch, {seeMoreSources: !state.seeMoreSources})}}>See {state.seeMoreSources ? 'Less' : 'More'}</a> // jsx-a11y/anchor-is-valid
				}
			</>
		</FormControl>
	);
}
	
const handleSelectSpecificTypes = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	newSearchSettings.specificTypesSelected = true;
	newSearchSettings.allTypesSelected = false;
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
}

const handleSelectAllTypes = (state, dispatch) => {
	if(state.analystToolsSearchSettings.specificTypesSelected){
		const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
		newSearchSettings.specificTypesSelected = false;
		newSearchSettings.allTypesSelected = true;
		Object.keys(state.analystToolsSearchSettings.typeFilter).forEach(type => {
			if(newSearchSettings.typeFilter[type]){
				newSearchSettings.isFilterUpdate = true;
				newSearchSettings.typeUpdate = true;
			}
			newSearchSettings.typeFilter[type] = false;
		});
		setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false});
	}
}

const handleTypeFilterChangeLocal = (event, state, dispatch, searchbar) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	let typeName = event.target.name;
	if(typeName.includes('(')){
		typeName = typeName.substring(0, event.target.name.lastIndexOf('(')-1);
	}
	newSearchSettings.typeFilter = {
		...newSearchSettings.typeFilter,
		[typeName]: event.target.checked
	};
	if(searchbar){
		setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false});
	} else {
		newSearchSettings.isFilterUpdate = true;
		newSearchSettings.typeUpdate = true;
		setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false});
	}
	
	trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'TypeFilterToggle', event.target.name, event.target.value ? 1 : 0);
}


const renderTypes = (state, dispatch, classes) => {
	const { originalTypeFilters, typeFilter } = state.analystToolsSearchSettings;
	const betterTypeData = {};
	for(let i=0; i<originalTypeFilters.length; i++) {
		betterTypeData[originalTypeFilters[i][0]] = originalTypeFilters[i][1];
	}

	return (
		<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
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
							checked={state.analystToolsSearchSettings.allTypesSelected}
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
							checked={state.analystToolsSearchSettings.specificTypesSelected}
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
					{state.analystToolsSearchSettings.specificTypesSelected && Object.keys(typeFilter).map((type, index) => {
						if(index < 10 || state.seeMoreTypes){
							return (
								<FormControlLabel
									key={`${type}`}
									value={`${type}`}
									classes={{ root: classes.rootLabel, label: classes.checkboxPill }}
									control={<Checkbox classes={{ root: classes.rootButton, checked: classes.checkedButton }} name={`${type}`} checked={state.analystToolsSearchSettings.typeFilter[type]} onClick={(event) => handleTypeFilterChangeLocal(event, state, dispatch, true)} />}
									label={`${type}`}
									labelPlacement="end"
								/>
							)
						} else {
							return null;
						}
					})}
				</FormGroup>
				{state.analystToolsSearchSettings.specificTypesSelected &&
				// eslint-disable-next-line
				<a style={{cursor: 'pointer', fontSize: '16px'}} onClick={() => {setState(dispatch, {seeMoreTypes: !state.seeMoreTypes})}}>See {state.seeMoreTypes ? 'Less' : 'More'}</a> 
				}
			</>
		</FormControl>
	);
}

const handleSelectPublicationDateAllTime = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	newSearchSettings.publicationDateAllTime = true;
	newSearchSettings.publicationDateFilter = [null, null];
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
}

const handleSelectPublicationDateSpecificDates = (state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	newSearchSettings.publicationDateAllTime = false;
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
}

const handleDateRangeChange = (date, isStartDate, filterType, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
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
	if(!isNaN(temp[0]?.getTime()) && !isNaN(temp[1]?.getTime())) {
		newSearchSettings.isFilterUpdate = true;
	}

	if(filterType === 'publication'){
		newSearchSettings.publicationDateFilter = temp;
	} else {
		newSearchSettings.accessDateFilter = temp;
	}
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
}

const renderDates = (state, dispatch, classes, setDatePickerOpen, setDatePickerClosed, searchbar = false) => {
	const pubAllTime = state.analystToolsSearchSettings.publicationDateAllTime === undefined ? true : state.analystToolsSearchSettings.publicationDateAllTime;
	
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
						{!pubAllTime && <div style={{display: 'flex', flexWrap: 'wrap', margin: '-5px'}}>
							<KeyboardDatePicker
								margin="normal"
								format="MM/dd/yyyy"
								InputProps={{ style: { backgroundColor: 'white', padding: '5px', fontSize: '14px' } }}
								value={state.analystToolsSearchSettings.publicationDateFilter[0]}
								onChange={date => handleDateRangeChange(date, true, 'publication', state, dispatch)}
								onOpen={setDatePickerOpen}
								onClose={setDatePickerClosed}
								style={{flex: '110px', margin: '5px'}}
							/>
							<KeyboardDatePicker
								margin="normal"
								format="MM/dd/yyyy"
								InputProps={{ style: { backgroundColor: 'white', padding: '5px', fontSize: '14px' } }}
								value={state.analystToolsSearchSettings.publicationDateFilter[1]}
								onChange={date => handleDateRangeChange(date, false, 'publication', state, dispatch)}
								onOpen={setDatePickerOpen}
								onClose={setDatePickerClosed}
								style={{flex: '110px', margin: '5px'}}
							/>
						</div>}
					</div>
				</ThemeProvider>
			</div>
		</MuiPickersUtilsProvider>
	);
}

const handleRevokedChange = (event, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
	newSearchSettings.includeRevoked = event.target.checked;
	newSearchSettings.isFilterUpdate = true;
	setState(dispatch, { analystToolsSearchSettings: newSearchSettings, metricsCounted: false });
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
							checked={state.analystToolsSearchSettings.includeRevoked}
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

const PolicyAnalyticsToolsHandler = {
	getSideBarItems(props) {
		
		const {
			state,
			dispatch,
			classes,
		} = props;

		const { analystToolsSearchSettings } = state;

		const sourceCount = analystToolsSearchSettings.specificOrgsSelected && 
			Object.keys(analystToolsSearchSettings.orgFilter).filter(org => analystToolsSearchSettings.orgFilter[org]).length;
		const typeCount = analystToolsSearchSettings.specificTypesSelected && 
			Object.keys(analystToolsSearchSettings.typeFilter).filter(type => analystToolsSearchSettings.typeFilter[type]).length;
		const dateActive = analystToolsSearchSettings?.publicationDateFilter[0] && analystToolsSearchSettings?.publicationDateFilter[1];
		const statusActive = analystToolsSearchSettings.includeRevoked;
		
		return (
			<>
				<div>
					<div style={{ marginBottom: 20 }}>
						Apply filters to your search
					</div>
					
					<div style={{width: '100%', marginBottom: 10}}>
						<GCAccordion expanded={analystToolsSearchSettings.specificOrgsSelected} header={<>SOURCE  <span style={styles.filterCount}>{sourceCount ? `(${sourceCount})` : ''}</span></>} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
							{ renderSources(state, dispatch, classes) }
						</GCAccordion>
					</div>
					
					<div style={{width: '100%', marginBottom: 10}}>
						<GCAccordion expanded={analystToolsSearchSettings.specificTypesSelected} header={<>TYPE  <span style={styles.filterCount}>{typeCount ? `(${typeCount})` : ''}</span></>} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
							{ renderTypes(state, dispatch, classes) }
						</GCAccordion>
					</div>
					
					<div style={{width: '100%', marginBottom: 10}}>
						<GCAccordion expanded={!analystToolsSearchSettings.publicationDateAllTime} header={<>PUBLICATION DATE  <span style={styles.filterCount}>{dateActive ? '(1)' : ''}</span></>} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
							{ renderDates(state, dispatch, classes) }
						</GCAccordion>
					</div>
					
					<div style={{width: '100%', marginBottom: 10}}>
						<GCAccordion expanded={statusActive} header={<>STATUS  <span style={styles.filterCount}>{statusActive ? '(1)' : ''}</span></>} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
							{ renderStatus(state, dispatch, classes) }
						</GCAccordion>
					</div>
				</div>
			</>
		);
	},
}

const styles = {
	filterCount: {
		color: gcOrange
	},
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
		fontSize: '1.0em',
		display: 'flex',
		position: 'relative'
	},
	headerColumn: {
		fontSize: '1.0em',
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

export default PolicyAnalyticsToolsHandler;
