import React from 'react';
import GCAccordion from '../../common/GCAccordion';
import _ from 'lodash';
import { FormControl, FormGroup, FormControlLabel, Checkbox, Radio, TextField } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { setState } from '../../../utils/sharedFunctions';
import { gcOrange } from '../../common/gc-colors';

const setAnalystToolsSettings = (field, value, state, dispatch) => {
	const analystToolsSettings = _.cloneDeep(state.analystToolsSearchSettings);

	switch (field) {
		case 'allOrgs':
			if (state.analystToolsSearchSettings.specificOrgsSelected) {
				analystToolsSettings.specificOrgsSelected = false;
				analystToolsSettings.allOrgsSelected = true;
				Object.keys(state.analystToolsSearchSettings.orgFilter).forEach((org) => {
					if (analystToolsSettings.orgFilter[org]) {
						analystToolsSettings.isFilterUpdate = true;
						analystToolsSettings.orgUpdate = true;
					}
					analystToolsSettings.orgFilter[org] = false;
				});
			}
			break;
		case 'specOrgs':
			analystToolsSettings.specificOrgsSelected = true;
			analystToolsSettings.allOrgsSelected = false;
			break;
		case 'organizations':
			const orgIndex = analystToolsSettings.organizations.indexOf(value);
			if (orgIndex !== -1) {
				analystToolsSettings.organizations.splice(orgIndex, 1);
			} else {
				analystToolsSettings.organizations.push(value);
			}
			break;
		case 'allYears':
			analystToolsSettings.allYearsSelected = true;
			break;
		case 'specYears':
			analystToolsSettings.allYearsSelected = false;
			break;
		case 'fiscalYear':
			const index = analystToolsSettings.fiscalYears.indexOf(value);
			if (index !== -1) {
				analystToolsSettings.fiscalYears.splice(index, 1);
			} else {
				analystToolsSettings.fiscalYears.push(value);
			}
			break;
		case 'contractsOrMods':
		case 'idvPIID':
			analystToolsSettings[field] = value;
			break;
		case 'majcoms':
			const majIndex = analystToolsSettings.majcoms[value.org].indexOf(value.subOrg);
			if (majIndex !== -1) {
				analystToolsSettings.majcoms[value.org].splice(majIndex, 1);
			} else {
				analystToolsSettings.majcoms[value.org].push(value.subOrg);
			}
			break;
		default:
			break;
	}

	setState(dispatch, { analystToolsSearchSettings: analystToolsSettings });
};

const renderMajcoms = (state, dispatch, org) => {
	const orgToMajcom = {
		'air force': [
			'Air Combat Command',
			'Air Education and Training Command',
			'Air Force District Of Washington',
			'Air Force Global Strike Command',
			'Air Force Materiel Command',
			'Air Force Space Command',
			'Defense Finance and Accounting Service',
			'Pacific Air Forces',
		],
		army: [
			'Army Contracting Command',
			'Army Corps of Engineers',
			'Army Intelligence and Security Command',
			'Army Joint Munitions Command',
			'Army Medical Command',
			'Army National Guard',
			'Army National Guard Component 1 Units',
			'Army Pacific Command',
			'Army Tank-automotive and Armaments Command',
			'Army War College',
		],
		defense: [
			'Defense Finance Accounting Service',
			'Defense Health Agency',
			'Defense Human Resources Activity (DHRA)',
			'Defense Information Systems Agency',
			'Missile Defense Agency',
			'Other DoD/OASD Activities',
			'US Special Operations  Command',
		],
		navy: [
			'Command, Pacific Fleet',
			'Commander, Atlantic Fleet',
			'Department of the Navy, Assistant for Administration',
			'Marine Corps Forces Special Operations Command',
			'Marine Corps Headquarters',
			'Marine Corps Installations Command',
			'Marine Corps Installations Pacific',
			'Marine Corps Logistics Command',
			'Marine Corps Systems Command',
			'Naval Air Systems Command Headquarters',
			'Naval Sea Systems Command',
			'Naval Supply Systems Command Headquarters',
			'Office Of Naval Research',
			'Office of the Chief of Naval Operations',
			'Space and Naval Warfare Systems Command',
		],
	};

	const orgCheckboxes = [];
	const orgs = orgToMajcom[org];

	for (const subOrg of orgs) {
		let searchQuery = subOrg.toLowerCase();

		orgCheckboxes.push(
			<FormControlLabel
				name={subOrg}
				value={subOrg}
				style={styles.titleText}
				control={
					<Checkbox
						style={styles.filterBox}
						onClick={() =>
							setAnalystToolsSettings('majcoms', { org: org, subOrg: searchQuery }, state, dispatch)
						}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={
							state.analystToolsSearchSettings &&
							state.analystToolsSearchSettings.majcoms &&
							state.analystToolsSearchSettings.majcoms[org].indexOf(searchQuery) !== -1
						}
						checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
						name={subOrg}
					/>
				}
				label={<span style={{ fontSize: 13, marginLeft: 5 }}>{subOrg}</span>}
				labelPlacement="end"
			/>
		);
	}

	return <FormGroup style={{ margin: '0 0 0 28px' }}>{orgCheckboxes}</FormGroup>;
};

const renderIssueOrganization = (state, dispatch) => {
	return (
		<div style={styles.container}>
			<FormControl>
				<FormGroup>
					<FormControlLabel
						name="All organizations"
						value="All organizations"
						control={
							<Checkbox
								onClick={() => setAnalystToolsSettings('allOrgs', '', state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={state.analystToolsSearchSettings.allOrgsSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="All organizations"
								style={styles.filterBox}
							/>
						}
						label="All organizations"
						labelPlacement="end"
					/>
					<FormControlLabel
						name="Specific organization(s)"
						value="Specific organization(s)"
						control={
							<Checkbox
								onClick={() => setAnalystToolsSettings('specOrgs', '', state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={state.analystToolsSearchSettings.specificOrgsSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="Specific organization(s)"
								style={styles.filterBox}
							/>
						}
						label="Specific organization(s)"
						labelPlacement="end"
						style={styles.titleText}
					/>
				</FormGroup>

				{state.analystToolsSearchSettings.specificOrgsSelected && (
					<FormGroup style={styles.checkboxes}>
						<FormControlLabel
							name="Air Force"
							value="Air Force"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() =>
										setAnalystToolsSettings('organizations', 'air force', state, dispatch)
									}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={
										state.analystToolsSearchSettings &&
										state.analystToolsSearchSettings.organizations &&
										state.analystToolsSearchSettings.organizations.indexOf('air force') !== -1
									}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name="Air Force"
								/>
							}
							label="Air Force"
							labelPlacement="end"
						/>
						{state.analystToolsSearchSettings.organizations &&
							state.analystToolsSearchSettings.organizations.indexOf('air force') !== -1 &&
							renderMajcoms(state, dispatch, 'air force')}
						<FormControlLabel
							name="Army"
							value="Army"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() => setAnalystToolsSettings('organizations', 'army', state, dispatch)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={
										state.analystToolsSearchSettings &&
										state.analystToolsSearchSettings.organizations &&
										state.analystToolsSearchSettings.organizations.indexOf('army') !== -1
									}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name="Army"
								/>
							}
							label="Army"
							labelPlacement="end"
						/>
						{state.analystToolsSearchSettings.organizations &&
							state.analystToolsSearchSettings.organizations.indexOf('army') !== -1 &&
							renderMajcoms(state, dispatch, 'army')}
						<FormControlLabel
							name="DOD"
							value="DOD"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() => setAnalystToolsSettings('organizations', 'defense', state, dispatch)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={
										state.analystToolsSearchSettings &&
										state.analystToolsSearchSettings.organizations &&
										state.analystToolsSearchSettings.organizations.indexOf('defense') !== -1
									}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name="DOD"
								/>
							}
							label="DOD"
							labelPlacement="end"
						/>
						{state.analystToolsSearchSettings.organizations &&
							state.analystToolsSearchSettings.organizations.indexOf('defense') !== -1 &&
							renderMajcoms(state, dispatch, 'defense')}
						<FormControlLabel
							name="Navy"
							value="Navy"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() => setAnalystToolsSettings('organizations', 'navy', state, dispatch)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={
										state.analystToolsSearchSettings &&
										state.analystToolsSearchSettings.organizations &&
										state.analystToolsSearchSettings.organizations.indexOf('navy') !== -1
									}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name="Navy"
								/>
							}
							label="Navy"
							labelPlacement="end"
						/>
						{state.analystToolsSearchSettings.organizations &&
							state.analystToolsSearchSettings.organizations.indexOf('navy') !== -1 &&
							renderMajcoms(state, dispatch, 'navy')}
					</FormGroup>
				)}
			</FormControl>
		</div>
	);
};

const renderFiscalYear = (state, dispatch) => {
	const now = new Date();
	const yearCheckboxes = [];

	const start = 2000;
	const end = now.getFullYear() + 1;

	for (let i = end; i >= start; i--) {
		yearCheckboxes.push(
			<FormControlLabel
				name={i.toString()}
				value={i.toString()}
				style={styles.titleText}
				control={
					<Checkbox
						style={styles.filterBox}
						onClick={() => setAnalystToolsSettings('fiscalYear', i.toString(), state, dispatch)}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={
							state.analystToolsSearchSettings &&
							state.analystToolsSearchSettings.fiscalYears &&
							state.analystToolsSearchSettings.fiscalYears.indexOf(i.toString()) !== -1
						}
						checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
						name={i.toString()}
					/>
				}
				label={i.toString()}
				labelPlacement="end"
			/>
		);
	}

	return (
		<div style={styles.container}>
			<FormControl>
				<FormGroup>
					<FormControlLabel
						name="All years"
						value="All years"
						control={
							<Checkbox
								onClick={() => setAnalystToolsSettings('allYears', '', state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={state.analystToolsSearchSettings.allYearsSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="All years"
								style={styles.filterBox}
							/>
						}
						label="All fiscal years"
						labelPlacement="end"
						style={styles.titleText}
					/>
					<FormControlLabel
						name="Specific fiscal year(s)"
						value="Specific fiscal year(s)"
						control={
							<Checkbox
								onClick={() => setAnalystToolsSettings('specYears', '', state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={!state.analystToolsSearchSettings.allYearsSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="Specific fiscal year(s)"
								style={styles.filterBox}
							/>
						}
						label="Specific fiscal year(s)"
						labelPlacement="end"
						style={styles.titleText}
					/>
				</FormGroup>

				{!state.analystToolsSearchSettings.allYearsSelected && (
					<FormGroup style={styles.checkboxes}>{yearCheckboxes}</FormGroup>
				)}
			</FormControl>
		</div>
	);
};

const renderContractsOrMods = (state, dispatch) => {
	return (
		<div style={styles.container}>
			<FormControl>
				<FormGroup>
					<FormControlLabel
						name="Both"
						value="Both"
						control={
							<Radio
								style={styles.radio}
								icon={<RadioButtonUncheckedIcon style={styles.radioIcon} />}
								checkedIcon={<FiberManualRecordIcon style={styles.radioChecked} />}
								onClick={() => setAnalystToolsSettings('contractsOrMods', 'both', state, dispatch)}
								checked={
									state.analystToolsSearchSettings &&
									state.analystToolsSearchSettings.contractsOrMods === 'both'
								}
							/>
						}
						label="Both"
						labelPlacement="end"
						style={styles.titleText}
					/>
					<FormControlLabel
						name="Contracts Only"
						value="Contracts Only"
						control={
							<Radio
								style={styles.radio}
								icon={<RadioButtonUncheckedIcon style={styles.radioIcon} />}
								checkedIcon={<FiberManualRecordIcon style={styles.radioChecked} />}
								onClick={() => setAnalystToolsSettings('contractsOrMods', 'contracts', state, dispatch)}
								checked={
									state.analystToolsSearchSettings &&
									state.analystToolsSearchSettings.contractsOrMods === 'contracts'
								}
							/>
						}
						label="Contracts Only"
						labelPlacement="end"
						style={styles.titleText}
					/>
					<FormControlLabel
						name="Modifications Only"
						value="Modifications Only"
						control={
							<Radio
								style={styles.radio}
								icon={<RadioButtonUncheckedIcon style={styles.radioIcon} />}
								checkedIcon={<FiberManualRecordIcon style={styles.radioChecked} />}
								onClick={() => setAnalystToolsSettings('contractsOrMods', 'mods', state, dispatch)}
								checked={
									state.analystToolsSearchSettings &&
									state.analystToolsSearchSettings.contractsOrMods === 'mods'
								}
							/>
						}
						label="Modifications Only"
						labelPlacement="end"
						style={styles.titleText}
					/>
				</FormGroup>
			</FormControl>
		</div>
	);
};

const renderIdvPiid = (state, dispatch) => {
	return (
		<TextField
			placeholder="IDV PIID"
			variant="outlined"
			value={state.analystToolsSearchSettings['idvPIID']}
			style={{ backgroundColor: 'white', width: '100%' }}
			fullWidth={true}
			onChange={(event) => setAnalystToolsSettings('idvPIID', event.target.value, state, dispatch)}
			inputProps={{
				style: {
					height: 19,
					width: '100%',
				},
			}}
		/>
	);
};

const edaAnalyticsToolsHandler = {
	getSideBarItems(props) {
		const { state, dispatch } = props;
		const { analystToolsSearchSettings } = state;

		return (
			<>
				<div style={{ marginBottom: 20 }}>Apply filters to your search</div>

				<div style={{ width: '100%', marginBottom: 10 }}>
					<GCAccordion
						contentPadding={0}
						expanded={
							!analystToolsSearchSettings.allOrgsSelected &&
							analystToolsSearchSettings.organizations &&
							analystToolsSearchSettings.organizations.length > 0
						}
						header={'ISSUE ORGANIZATION'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						{renderIssueOrganization(state, dispatch)}
					</GCAccordion>
				</div>

				<div style={{ width: '100%', marginBottom: 10 }}>
					<GCAccordion
						contentPadding={15}
						expanded={
							!analystToolsSearchSettings.allYearsSelected &&
							analystToolsSearchSettings.fiscalYears &&
							analystToolsSearchSettings.fiscalYears.length > 0
						}
						header={'FISCAL YEAR'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						{renderFiscalYear(state, dispatch)}
					</GCAccordion>
				</div>

				<div style={{ width: '100%', marginBottom: 10 }}>
					<GCAccordion
						contentPadding={15}
						expanded={analystToolsSearchSettings.contractsOrMods !== 'contracts'}
						header={'CONTRACTS OR MODS'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						{renderContractsOrMods(state, dispatch)}
					</GCAccordion>
				</div>

				<div style={{ width: '100%', marginBottom: 10 }}>
					<GCAccordion
						contentPadding={15}
						expanded={analystToolsSearchSettings.idvPIID}
						header={'IDV PIID'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						{renderIdvPiid(state, dispatch, 'IDV PIID', 'idvPIID')}
					</GCAccordion>
				</div>
			</>
		);
	},
};

const styles = {
	titleText: {
		fontWeight: 900,
		fontSize: 16,
		marginBottom: 5,
	},
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		marginLeft: '5px',
		marginRight: '5px',
	},
	container: {
		padding: 15,
		margin: '0 0 0 15px',
		fontSize: 16,
	},
	checkboxes: {
		margin: '0 0 0 25px',
	},
	radio: {
		width: 20,
		height: 20,
		border: '2px solid rgb(189, 204, 222)',
		margin: '0 10px 0 0',
		padding: 1,
	},
	radioIcon: {
		visibility: 'hidden',
	},
	radioChecked: {
		color: '#E9691D',
		width: 12,
		height: 12,
	},
	filterCount: {
		color: gcOrange,
	},
};

export default edaAnalyticsToolsHandler;
