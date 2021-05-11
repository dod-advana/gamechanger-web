import React, {useEffect} from "react";
import styled from "styled-components";
import { trackEvent } from '../telemetry/Matomo';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import Autocomplete from '@material-ui/lab/Autocomplete';
import GCButton from "../common/GCButton";
import {
	MuiPickersUtilsProvider,
	KeyboardDatePicker
} from '@material-ui/pickers';
import themeDatePicker from '../common/theme-datepicker';
import DateFnsUtils from '@date-io/date-fns';

import {
	ThemeProvider,
	makeStyles
} from '@material-ui/core/styles';
import {
	FormControl,
	FormGroup,
	FormControlLabel,
	Checkbox,
	TextField
} from '@material-ui/core';
import {getTrackingNameForFactory} from '../../gamechangerUtils';
import GCAccordion from "../common/GCAccordion";
import uuidv4 from "uuid/v4";
import {setState} from "../../sharedFunctions";
import _ from "lodash";


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

const useStyles = makeStyles({
	radioButtonLabel: {
		position: 'relative',
		backgroundColor: '#ffffff',
		padding: '5px 10px 10px 10px',
		marginRight: '20px',
		fontSize: '26px',
		height: '90px',
		lineHeight: '150px',
		display: 'block',
		cursor: 'pointer',
		boxSizing: 'border-box',
		borderRadius: '10px',
		border: '2px solid #bdccde',
	},
	titleText: {
		fontWeight: 900,
		fontSize: '14px'
	},
	tipText: {
		maxWidth: '250px',
		width: '250px',
		margin: '0 auto',
		fontSize: '12px',
		lineHeight: '20px'
	},
	optionText: {
		margin: '20px 75px 0px',
		fontSize: '14px',
		lineHeight: '20px'
	},
	dateOptionText: {
		margin: '20px 0px 0px',
		fontSize: '14px',
		lineHeight: '20px'
	},
	title: {
		margin: '20px 75px 0px',
		fontSize: '20px',
		lineHeight: '20px',
		fontWeight: 600
	},
	rootButton: {
		visibility: 'hidden',
		width: '0px',
		padding: '0px',
		border: '0px',
		cursor: 'default'
	},
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		marginLeft: '5px',
		marginRight: '5px'
	},
	checkBox: {
		visibility: 'hidden',
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
	},
	checkedButton: {
		'& + $radioButtonLabel': {
			backgroundColor: '#313541',
			boxShadow: '0px 0px 15px grey',
			border: '2px solid #313541',
			borderRadius: '10px',
			'&, $tipText,$titleText': {
				color: '#ffffff'
			},
			'&::after': {
				fontFamily: 'FontAwesome',
				content: "'\\f00c'",
				width: '20px',
				height: '20px',
				lineHeight: '10px',
				borderRadius: '100%',
				fontSize: '15px',
				border: '2px solid #333',
				backgroundColor: '#ffffff',
				color: '#E9691D',
				zIndex: 999,
				position: 'absolute',
				top: '10px',
				right: '10px',
				paddingTop: '3px',
			}
		},
		'& + $checkboxPill': {
			backgroundColor: '#313541',
			boxShadow: '0px 0px 5px grey',
			border: '2px solid #313541',
			borderRadius: '10px',
			color: '#ffffff',
		}
	},
	checkboxPill: {
		width: '145px',
		textAlign: 'center',
		borderRadius: '10px',
		lineHeight: 1.2,
		fontSize: '12px',
		marginBottom: '15px',
		marginRight: '10px',
		border: '2px solid #bdccde',
		backgroundColor: 'white',
		boxSizing: 'border-box',
		color: 'black',
		minHeight: '35px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	disabledButton: {
		'& + $checkboxPill': {
			backgroundColor: 'rgba(0, 0, 0, 0.38)',
			border: '2px solid grey',
			borderRadius: '10px',
			color: '#ffffff',
		}
	}
});

export const StyledTopEntities = styled.div`
	display: flex;
	margin: ${({ margin }) => margin ? `${margin}` : '0 0 10px 0'};
	flex-flow: wrap;
	
	.entity-div {
		flex-direction: column;
    	display: flex;
		width: 20%;
    	align-items: center;
    	cursor: pointer;
    	margin-top: 10px;
    
		> img {
			width: ${({ width }) => width ? `${width}px` : '80px'};
			height: ${({ height }) => height ? `${height}px` : '80px'};
		}
		
		> span {
			text-align: center;
		}
	}
`;

export const StyledTopTopics = styled.div`
	display: flex;
	margin: ${({ margin }) => margin ? `${margin}` : '0 0 10px 0'};
	flex-flow: wrap;
	
	.topic-button {
		border: none;
		height: 25px;
		border-radius: 15px;
		background-color: white;
		color: black;
		white-space: nowrap;
		text-align: center;
		display: inline-block;
		padding-left: 5px;
		padding-right: 5px;
		margin-left: 6px;
		margin-right: 6px;
		margin-bottom: 3px;
		cursor: pointer;

		> i {
			color: ${({ favorited }) => favorited? '#E9691D' : '#B0B9BE'};
		}
		
		&:hover {
			background-color: #E9691D;
			color: white;
			> i {
				 color: ${({ favorited }) => favorited? '#FFFFFF' : '#B0B9BE'};
			}
		};
	}
`;

export default function SearchMatrix(props) {
	
	const {
		context
	} = props;
	
	const {state, dispatch} = context;

	const [unusedDocumentProperties, setUnusedDocumentProperties] = React.useState([]);
	const [category, setCategory] = React.useState('');

	const handleCategoryChange = (category) => {
	   setCategory(category);
   }

   const handleOrganizationFilterChange = event => {
		handleOrgFilterChange(event);
		trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'OrgFilterToggle', event.target.name, event.target.value ? 1 : 0);
	}

	const handleTypeFilterChangeLocal = event => {
		handleTypeFilterChange(event);
		trackEvent('GAMECHANGER', 'TypeFilterToggle', event.target.name, event.target.value ? 1 : 0);
	}

   const classes = useStyles();

	const [searchFields, setSearchFields] = React.useState(state.searchSettings.searchFields);

	const pubAllTime = state.searchSettings.publicationDateAllTime === undefined ? true : state.searchSettings.publicationDateAllTime;

	useEffect(() => {
		setSearchFields(state.searchSettings.searchFields);
	}, [state]);
		
	useEffect(() => {
		const usedPropertyNames = Object.values(state.searchSettings.searchFields).map(field => { return field.field ? field.field.display_name : '' });
		const unusedProperties = state.documentProperties.filter(prop => usedPropertyNames.indexOf(prop.display_name) === -1);
        setUnusedDocumentProperties(unusedProperties);
	}, [state]);

	const handleSubmit = (event) => {
		if (event) {
			event.preventDefault();
		}
		setState(dispatch, {runSearch: true});
	}
	
	const setSearchField = (key, value) => {
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

	const setSearchFieldInput = (key, value) => {
		const { searchSettings } = state;
		const {searchFields} = searchSettings;
	
		const newSearchFields = _.cloneDeep(searchFields);
		newSearchFields[key].input = value;
	
		const newCloneSettings = _.cloneDeep(searchSettings);
		newCloneSettings.searchFields = newSearchFields;
		setState(dispatch, { searchSettings: newCloneSettings, metricsCounted: false });
	}
	
	const removeSearchField = (key, state) => {
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
	
	const handleOrgFilterChange = (event) => {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		let orgName = event.target.name.substring(0, event.target.name.lastIndexOf('(')-1);
		newSearchSettings.orgFilter = {
			...newSearchSettings.orgFilter,
			[orgName]: event.target.checked
		};
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
	}
	
	const handleSelectSpecificOrgs = () => {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.specificOrgsSelected = true;
		newSearchSettings.allOrgsSelected = false;
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
	}
	
	const handleSelectAllOrgs = () => {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.specificOrgsSelected = false;
		newSearchSettings.allOrgsSelected = true;
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
	}
	
	const handleSelectPublicationDateAllTime = (e) => {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.publicationDateAllTime = true;
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
	}

	const handleSelectPublicationDateSpecificDates = (e) => {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.publicationDateAllTime = false;
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
	}

	const handleDateRangeChange = (date, isStartDate, filterType) => {
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
	
	const handleTypeFilterChange = (event) => {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		let typeName = event.target.name.substring(0, event.target.name.lastIndexOf('(')-1);
		newSearchSettings.typeFilter = {
			...newSearchSettings.typeFilter,
			[typeName]: event.target.checked
		};
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
	}

	const handleSelectSpecificTypes = () => {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.specificTypesSelected = true;
		newSearchSettings.allTypesSelected = false;
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
	}
	
	const handleSelectAllTypes = () => {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.specificTypesSelected = false;
		newSearchSettings.allTypesSelected = true;
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
	}
	
	const resetAdvancedSettings = () => {
		dispatch({type: 'RESET_SEARCH_SETTINGS'});
	}
	
	const handleRevokedChange = (event) => {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.includeRevoked = event.target.checked;
		setState(dispatch, { searchSettings: newSearchSettings, metricsCounted: false });
	}

	const renderSearchTypes = () => {
		return (
			<div style={{width: '100%'}}>
			<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px', width: '100%' }}>
				<FormGroup style={{width: '100%'}}>
					<FormControlLabel
						name='Documentations'
						value='Documentations'
						classes={{ label: classes.titleText }}
						control={<Checkbox
							classes={{ root: classes.filterBox }}
							onClick={_.noop}
							icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
							checked={false}
							checkedIcon={<i style={{ color: '#E9691D' }}
								className="fa fa-check" />}
							name='Documentations'
						/>}
						label='Documentations'
						labelPlacement="end"
					/>
					<FormControlLabel
						name='Organizations'
						value='Organizations'
						classes={{ label: classes.titleText }}
						control={<Checkbox
							classes={{ root: classes.filterBox }}
							onClick={_.noop}
							icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
							checked={false}
							checkedIcon={<i style={{ color: '#E9691D' }}
								className="fa fa-check" />}
							name='Organizations'
						/>}
						label='Organizations'
						labelPlacement="end"
					/>
					<FormControlLabel
						name='Topics'
						value='Topics'
						classes={{ label: classes.titleText }}
						control={<Checkbox
							classes={{ root: classes.filterBox }}
							onClick={_.noop}
							icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
							checked={false}
							checkedIcon={<i style={{ color: '#E9691D' }}
								className="fa fa-check" />}
							name='Topics'
						/>}
						label='Topics'
						labelPlacement="end"
					/>
				</FormGroup>
			</FormControl>
			</div>
		);
	}

	const renderAdvancedFilters = () => {
		return (
			<div id="searchFields" style={{ paddingTop: '10px', paddingBottom: '10px', maxHeight: '300px', overflowY: 'auto' }}>
				{Object.keys(searchFields).map(key => {
					const searchField = searchFields[key];
					return (
						<div key={key} style={{ marginLeft: '10px', float: 'left' }}>
							<div style = {{ marginRight: '15px' }}>
								<Autocomplete
                                    options={unusedDocumentProperties}
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
									onChange={(event, value) => setSearchField(key, value)}
								/>
							</div>
							<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
								<div style={{ marginRight: '15px', marginTop: '10px', marginBottom: '10px', clear: 'both' }}>
									<TextField
										disabled={!searchFields[key]?.field}
										placeholder="Input"
										variant="outlined"
										defaultValue={searchField.input}
										style={{ backgroundColor: 'white', width: '100%' }}
										fullWidth={true}
										onBlur={(event) => setSearchFieldInput(key, event.target.value)}
										inputProps={{
											style: {
												height: 19,
												width: '100%'
											}
										}}
									/>
								</div>
								{searchFields[key].field !== null &&
									<i className="fa fa-times-circle fa-fw" style={{ cursor: 'pointer' }} onClick={() => removeSearchField(key)} />
								}
							</div>
						</div>
					);
				})}
			</div>
		);
	}

	const renderTypes = () => {

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
							onClick={handleSelectAllTypes}
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
							onClick={handleSelectSpecificTypes}
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
								control={<Checkbox classes={{ root: classes.rootButton, checked: classes.checkedButton }} name={`${type} (${betterTypeData[type]})`} checked={state.searchSettings.typeFilter[type]} onClick={handleTypeFilterChangeLocal} />}
								label={`${type} (${betterTypeData[type]})`}
								labelPlacement="end"
							/>
						)
					})}
				</FormGroup>
			</FormControl>
		);
	}

	const renderSources = () => {

		const betterOrgData = {};
		for(let i=0; i<state.sidebarOrgs.length; i++) {
			betterOrgData[state.sidebarOrgs[i][0]] = state.sidebarOrgs[i][1];
		}

		return (
			<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
				<FormGroup row style={{ marginBottom: '10px' }}>
					<FormControlLabel
						name='All sources'
						value='All sources'
						classes={{ label: classes.titleText }}
						control={<Checkbox
							classes={{ root: classes.filterBox }}
							onClick={handleSelectAllOrgs}
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
							onClick={handleSelectSpecificOrgs}
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
					{state.searchSettings.specificOrgsSelected && Object.keys(state.searchSettings.orgFilter).map(org => {
						return (
							<FormControlLabel
								key={`${org} (${betterOrgData[org]})`}
								value={`${org} (${betterOrgData[org]})`}
								classes={{ label: classes.checkboxPill }}
								control={<Checkbox classes={{ root: classes.rootButton, checked: classes.checkedButton }} name={`${org} (${betterOrgData[org]})`} checked={state.searchSettings.orgFilter[org]} onClick={handleOrganizationFilterChange} />}
								label={`${org} (${betterOrgData[org]})`}
								labelPlacement="end"
							/>
						)
					})}
				</FormGroup>
			</FormControl>
		);
	}

	const renderDates = () => {
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
											onClick={handleSelectPublicationDateAllTime}
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
											onClick={handleSelectPublicationDateSpecificDates}
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
									onChange={date => handleDateRangeChange(date, true, 'publication')}
								/>
								<KeyboardDatePicker
									margin="normal"
									label="End Date"
									format="MM/dd/yyyy"
									InputProps={{ style: { backgroundColor: 'white', padding: '5px', fontSize: '14px' } }}
									value={state.searchSettings.publicationDateFilter[1]}
									onChange={date => handleDateRangeChange(date, false, 'publication')}
								/>
							</div>}
						</div>
					</ThemeProvider>
				</div>
			</MuiPickersUtilsProvider>
		);
	}

	const renderStatus = () => {
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
								onClick={handleRevokedChange}
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

	return (
		<div className={''} style={{ height: 'fit-content', minWidth: '100%', marginRight: -10 }}>
			<div className={''}>
				<div style={styles.innerContainer}>
					<div style={styles.cardBody} className={`tutorial-step-${state.componentStepNumbers["Advanced Settings"]}`}>
						<div style={styles.innerContainer}>
                            {false &&
							<div style={styles.subHead}>
								<div style={{
									...styles.headerColumn,
									color: 'black',
									backgroundColor: 'white',
									marginTop: 0,
									marginLeft: -5
								}}>
									<div><span>{'Sort By:'}</span></div>
								</div>
							</div>}
                            {false &&
							<select name="category" value={category} style={{marginBottom: 15, borderWidth: '1px', borderRadius: '5px', borderStyle: 'solid', borderColor: '#B0BAC5'}} onChange={event => handleCategoryChange(event.target.value)}>
								<option id="0" >Relevance</option>
							</select>}
                            {false &&
							<div style={{width: '100%', marginBottom: 10, border: 'none'}}>
								<GCAccordion expanded={false} header={'SEARCH TYPES'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
									{ renderSearchTypes() }
								</GCAccordion>
							</div>}
							
							<div style={{width: '100%', marginBottom: 10}}>
								<GCAccordion expanded={true} header={'SOURCE'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
									{ renderSources() }
								</GCAccordion>
							</div>
							
							<div style={{width: '100%', marginBottom: 10}}>
								<GCAccordion expanded={false} header={'TYPE'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
									{ renderTypes() }
								</GCAccordion>
							</div>
							
							<div style={{width: '100%', marginBottom: 10}}>
								<GCAccordion expanded={false} header={'PUBLICATION DATE'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
									{ renderDates() }
								</GCAccordion>
							</div>
							
							<div style={{width: '100%', marginBottom: 10}}>
								<GCAccordion expanded={false} header={'STATUS'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
									{ renderStatus() }
								</GCAccordion>
							</div>
							
                            <div style={{width: '100%', marginBottom: 10}}>
								<GCAccordion expanded={false} header={'ADVANCED'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
									{ renderAdvancedFilters() }
								</GCAccordion>
							</div>

							<GCButton style={{width: '100%', marginBottom: '10px', marginLeft: '-1px' }} onClick={handleSubmit}>Update Search</GCButton>
							<button
								type="button"
								style={{ border: 'none', backgroundColor: '#B0BAC5', padding: '0 15px', display: 'flex', height: 50, alignItems: 'center', borderRadius: 5 }}
								onClick={resetAdvancedSettings}
							>
							<span style={{
								fontFamily: 'Montserrat',
								fontWeight: 600,
								width: '100%', marginTop: '5px', marginBottom: '10px', marginLeft: '-1px'
							}}>
								Clear Filters
							</span>
							</button>
                        </div>
					</div>
				</div> 
			</div>
		</div>
	);
}
