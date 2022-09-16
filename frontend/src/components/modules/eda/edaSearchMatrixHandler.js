import React from 'react';
import GCAccordion from '../../common/GCAccordion';

import { FormControl, FormGroup, FormControlLabel, Checkbox, TextField, Radio } from '@material-ui/core';
import { setState } from '../../../utils/sharedFunctions';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { gcOrange } from '../../common/gc-colors';
import GCButton from '../../common/GCButton';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { numberWithCommas } from '../../../utils/gamechangerUtils';

const styles = {
	titleText: {
		fontWeight: 900,
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
	filterDiv: {
		display: 'inline-block',
	},
	filterTitle: {
		display: 'inline-block',
		fontSize: 14,
		fontWeight: 600,
	},
	filterInput: {
		padding: '0px 25px',
	},
	dialog: {},
	dialogContent: {
		width: 1000,
		height: 600,
		padding: '30px 30px',
	},
	detailDiv: {
		margin: '5px auto',
	},
	pill: {
		fontSize: 11,
		fontWeight: 600,
		border: 'none',
		height: 25,
		borderRadius: 15,
		backgroundColor: 'rgba(223, 230, 238, 0.5)',
		whiteSpace: 'nowrap',
		textAlign: 'center',
		display: 'inline-block',
		padding: '0 15px',
		margin: '0 0 0 15px',
	},
	tableHeaderRow: {
		backgroundColor: '#131E43',
		color: 'white',
	},
	tableColumn: {
		textAlign: 'left',
		margin: '4px 0',
	},
	container: {
		padding: 15,
		margin: '0 0 0 15px',
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
	advFilterDiv: {
		display: 'block',
		margin: '10px',
	},
	boldText: {
		fontSize: '0.8em',
	},
};

const setEDASearchSetting = (field, value, state, dispatch) => {
	const edaSettings = structuredClone(state.edaSearchSettings);

	switch (field) {
		case 'allOrgs':
			edaSettings.allOrgsSelected = true;
			edaSettings.organizations = [];
			break;
		case 'specOrgs':
			edaSettings.allOrgsSelected = false;
			break;
		case 'aggregations':
			edaSettings.aggregations[value] = !edaSettings.aggregations[value];
			break;
		case 'issueDateRangeStart':
			edaSettings.startDate = value;
			break;
		case 'issueDateRangeEnd':
			edaSettings.endDate = value;
			break;
		case 'contractIssueAgency':
			edaSettings.issueAgency = value;
			break;
		case 'organizations':
			const orgIndex = edaSettings.organizations.indexOf(value);
			if (orgIndex !== -1) {
				edaSettings.organizations.splice(orgIndex, 1);
			} else {
				edaSettings.organizations.push(value);
			}
			break;
		case 'allYears':
			edaSettings.allYearsSelected = true;
			edaSettings.fiscalYears = [];
			break;
		case 'specYears':
			edaSettings.allYearsSelected = false;
			break;
		case 'fiscalYear':
			const index = edaSettings.fiscalYears.indexOf(value);
			if (index !== -1) {
				edaSettings.fiscalYears.splice(index, 1);
			} else {
				edaSettings.fiscalYears.push(value);
			}
			break;
		case 'allData':
			edaSettings.allDataSelected = true;
			edaSettings.contractData = {
				pds: false,
				syn: false,
				fpds: false,
				none: false,
			};
			break;
		case 'specData':
			edaSettings.allDataSelected = false;
			break;
		case 'contractData':
			edaSettings.contractData[value] = !edaSettings.contractData[value];
			break;
		case 'issueOfficeDoDAAC':
		case 'issueOfficeName':
		case 'contractsOrMods':
		case 'maxObligatedAmount':
		case 'minObligatedAmount':
		case 'excludeTerms':
		case 'vendorName':
		case 'fundingOfficeCode':
		case 'idvPIID':
		case 'modNumber':
		case 'piid':
		case 'reqDesc':
		case 'psc':
		case 'fundingAgencyName':
		case 'naicsCode':
		case 'duns':
		case 'contractSOW':
		case 'clinText':
			edaSettings[field] = value;
			break;
		case 'majcoms':
			const majIndex = edaSettings.majcoms[value.org].indexOf(value.subOrg);
			if (majIndex !== -1) {
				edaSettings.majcoms[value.org].splice(majIndex, 1);
			} else {
				edaSettings.majcoms[value.org].push(value.subOrg);
			}
			break;
		default:
			break;
	}

	setState(dispatch, { edaSearchSettings: edaSettings });
};

const getIssuingOrgData = (issuingOrgs) => {
	const COLORS = ['#010691', '#007506', '#ad0202', '#6c0299', '#006069', '#969902'];

	// for the stats pie chart
	return Object.keys(issuingOrgs).map((org, index) => {
		let orgData = issuingOrgs[org];
		return {
			type: org,
			count: orgData.count,
			obligatedAmount: !isNaN(orgData.obligatedAmount)
				? '$' + numberWithCommas((orgData.obligatedAmount / 1000000).toFixed(2)) + ' M'
				: '',
			color: COLORS[index],
		};
	});
};

const SearchStats = ({ issuingOrgs, totalObligatedAmount }) => {
	let data = getIssuingOrgData(issuingOrgs);
	let amount = 0;

	if (!isNaN(totalObligatedAmount)) {
		amount = Math.floor(totalObligatedAmount / 1000000) ?? 0;
	}

	const renderChartLabel = (entry) => {
		return entry.type;
	};

	const CustomTooltip = ({ payload }) => {
		let tooltipText = '';
		if (payload.length > 0) {
			let agency = payload[0];
			tooltipText += agency.name + ': ' + agency.payload.obligatedAmount;
		}
		return <div style={{ backgroundColor: 'white', border: '1px black solid', padding: 5 }}>{tooltipText}</div>;
	};

	return (
		<ResponsiveContainer width="100%" height={300}>
			<PieChart width={250} height={300}>
				<Pie
					innerRadius={60}
					outerRadius={80}
					data={data}
					cx="50%"
					cy="50%"
					dataKey="count"
					nameKey="type"
					label={renderChartLabel}
					isAnimationActive={false}
				>
					{data.map((_entry, index) => (
						<Cell key={`cell-${index}`} fill={data[index].color} />
					))}
				</Pie>
				<text x={'50%'} y={'50%'} dy={8} textAnchor="middle">
					{numberWithCommas(Math.floor(amount))}$M
				</text>
				<Tooltip content={<CustomTooltip />} />
			</PieChart>
		</ResponsiveContainer>
	);
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
							setEDASearchSetting('majcoms', { org: org, subOrg: searchQuery }, state, dispatch)
						}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={
							state.edaSearchSettings &&
							state.edaSearchSettings.majcoms &&
							state.edaSearchSettings.majcoms[org].indexOf(searchQuery) !== -1
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

const renderOrganizationFilters = (state, dispatch) => {
	return (
		<div style={styles.container}>
			<FormControl>
				<FormGroup>
					<FormControlLabel
						name="All organizations"
						value="All organizations"
						control={
							<Checkbox
								onClick={() => setEDASearchSetting('allOrgs', '', state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={state.edaSearchSettings.allOrgsSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="All organizations"
								style={styles.filterBox}
							/>
						}
						label="All organizations"
						labelPlacement="end"
						style={styles.titleText}
					/>
					<FormControlLabel
						name="Specific organization(s)"
						value="Specific organization(s)"
						control={
							<Checkbox
								onClick={() => setEDASearchSetting('specOrgs', '', state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={!state.edaSearchSettings.allOrgsSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="Specific organization(s)"
								style={styles.filterBox}
							/>
						}
						label="Specific organization(s)"
						labelPlacement="end"
						style={styles.titleText}
						id={'specificOrgCheckbox'}
					/>
				</FormGroup>

				{!state.edaSearchSettings.allOrgsSelected && (
					<FormGroup style={styles.checkboxes}>
						<FormControlLabel
							name="Air Force"
							value="Air Force"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() => setEDASearchSetting('organizations', 'air force', state, dispatch)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.organizations &&
										state.edaSearchSettings.organizations.indexOf('air force') !== -1
									}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name="Air Force"
								/>
							}
							label="Air Force"
							labelPlacement="end"
							id="airForceCheckbox"
						/>
						{state.edaSearchSettings.organizations &&
							state.edaSearchSettings.organizations.indexOf('air force') !== -1 &&
							renderMajcoms(state, dispatch, 'air force')}
						<FormControlLabel
							name="Army"
							value="Army"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() => setEDASearchSetting('organizations', 'army', state, dispatch)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.organizations &&
										state.edaSearchSettings.organizations.indexOf('army') !== -1
									}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name="Army"
								/>
							}
							label="Army"
							labelPlacement="end"
							id="armyCheckbox"
						/>
						{state.edaSearchSettings.organizations &&
							state.edaSearchSettings.organizations.indexOf('army') !== -1 &&
							renderMajcoms(state, dispatch, 'army')}
						<FormControlLabel
							name="DOD"
							value="DOD"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() => setEDASearchSetting('organizations', 'defense', state, dispatch)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.organizations &&
										state.edaSearchSettings.organizations.indexOf('defense') !== -1
									}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name="DOD"
								/>
							}
							label="DOD"
							labelPlacement="end"
							id="dodCheckbox"
						/>
						{state.edaSearchSettings.organizations &&
							state.edaSearchSettings.organizations.indexOf('defense') !== -1 &&
							renderMajcoms(state, dispatch, 'defense')}
						<FormControlLabel
							name="Navy"
							value="Navy"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() => setEDASearchSetting('organizations', 'navy', state, dispatch)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.organizations &&
										state.edaSearchSettings.organizations.indexOf('navy') !== -1
									}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name="Navy"
								/>
							}
							label="Navy"
							labelPlacement="end"
							id="navyCheckbox"
						/>
						{state.edaSearchSettings.organizations &&
							state.edaSearchSettings.organizations.indexOf('navy') !== -1 &&
							renderMajcoms(state, dispatch, 'navy')}
					</FormGroup>
				)}
			</FormControl>
		</div>
	);
};

// render a textfield tied to the edaSearchSettings
const renderTextFieldFilter = (state, dispatch, displayName, fieldName) => {
	return (
		<TextField
			placeholder={displayName}
			variant="outlined"
			value={state.edaSearchSettings[fieldName]}
			style={{ backgroundColor: 'white', width: '100%' }}
			fullWidth={true}
			onChange={(event) => setEDASearchSetting(fieldName, event.target.value, state, dispatch)}
			inputProps={{
				style: {
					height: 19,
					width: '100%',
				},
				id: fieldName + 'Filter',
			}}
		/>
	);
};

const renderFiscalYearFilter = (state, dispatch) => {
	const now = new Date();
	const yearCheckboxes = [];

	const start = 2000;
	const end = now.getFullYear();

	for (let i = end; i >= start; i--) {
		yearCheckboxes.push(
			<FormControlLabel
				name={i.toString()}
				value={i.toString()}
				style={styles.titleText}
				control={
					<Checkbox
						style={styles.filterBox}
						onClick={() => setEDASearchSetting('fiscalYear', i.toString(), state, dispatch)}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={
							state.edaSearchSettings &&
							state.edaSearchSettings.fiscalYears &&
							state.edaSearchSettings.fiscalYears.indexOf(i.toString()) !== -1
						}
						checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
						name={i.toString()}
					/>
				}
				label={i.toString()}
				labelPlacement="end"
				id={'year' + i.toString() + 'Checkbox'}
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
								onClick={() => setEDASearchSetting('allYears', '', state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={state.edaSearchSettings.allYearsSelected}
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
								onClick={() => setEDASearchSetting('specYears', '', state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={!state.edaSearchSettings.allYearsSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="Specific fiscal year(s)"
								style={styles.filterBox}
							/>
						}
						label="Specific fiscal year(s)"
						labelPlacement="end"
						style={styles.titleText}
						id={'specificFiscalYearCheckbox'}
					/>
				</FormGroup>

				{!state.edaSearchSettings.allYearsSelected && (
					<FormGroup style={styles.checkboxes}>{yearCheckboxes}</FormGroup>
				)}
			</FormControl>
		</div>
	);
};

const renderContractDataFilter = (state, dispatch) => {
	return (
		<div style={styles.container}>
			<FormControl>
				<FormGroup>
					<FormControlLabel
						name="All data sources"
						value="All data sources"
						control={
							<Checkbox
								onClick={() => setEDASearchSetting('allData', '', state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={state.edaSearchSettings.allDataSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="All data sources"
								style={styles.filterBox}
							/>
						}
						label="All data sources"
						labelPlacement="end"
						style={styles.titleText}
					/>
					<FormControlLabel
						name="Specific data source(s)"
						value="Specific data source(s)"
						control={
							<Checkbox
								onClick={() => setEDASearchSetting('specData', '', state, dispatch)}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								checked={!state.edaSearchSettings.allDataSelected}
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name="Specific data source(s)"
								style={styles.filterBox}
							/>
						}
						label="Specific data source(s)"
						labelPlacement="end"
						style={styles.titleText}
						id="specificContractDataCheckbox"
					/>
				</FormGroup>

				{!state.edaSearchSettings.allDataSelected && (
					<FormGroup style={styles.checkboxes}>
						<FormControlLabel
							name="PDS"
							value="PDS"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() => setEDASearchSetting('contractData', 'pds', state, dispatch)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.contractData &&
										state.edaSearchSettings.contractData.pds
									}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name="PDS"
								/>
							}
							label="PDS"
							labelPlacement="end"
							id={'pdsCheckbox'}
						/>
						<FormControlLabel
							name="SYN"
							value="SYN"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() => setEDASearchSetting('contractData', 'syn', state, dispatch)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.contractData &&
										state.edaSearchSettings.contractData.syn
									}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name="SYN"
								/>
							}
							label="SYN"
							labelPlacement="end"
						/>
						<FormControlLabel
							name="FPDS"
							value="FPDS"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() => setEDASearchSetting('contractData', 'fpds', state, dispatch)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.contractData &&
										state.edaSearchSettings.contractData.fpds
									}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name="FPDS"
								/>
							}
							label="FPDS"
							labelPlacement="end"
						/>
						<FormControlLabel
							name="None"
							value="None"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() => setEDASearchSetting('contractData', 'none', state, dispatch)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.contractData &&
										state.edaSearchSettings.contractData.none
									}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name="None"
								/>
							}
							label="None"
							labelPlacement="end"
						/>
					</FormGroup>
				)}
			</FormControl>
		</div>
	);
};

const renderObligatedAmountFilter = (state, dispatch) => {
	return (
		<div style={styles.container}>
			<TextField
				placeholder="Min"
				variant="outlined"
				type="number"
				value={state.edaSearchSettings && state.edaSearchSettings.minObligatedAmount}
				style={{
					backgroundColor: 'white',
					width: '100%',
					margin: '0 0 15px 0',
				}}
				fullWidth={true}
				onChange={(event) => setEDASearchSetting('minObligatedAmount', event.target.value, state, dispatch)}
				inputProps={{
					style: {
						height: 19,
						width: '100%',
					},
					id: 'minObligatedAmountFilter',
				}}
			/>
			<TextField
				placeholder="Max"
				variant="outlined"
				type="number"
				value={state.edaSearchSettings && state.edaSearchSettings.maxObligatedAmount}
				style={{ backgroundColor: 'white', width: '100%' }}
				fullWidth={true}
				onChange={(event) => setEDASearchSetting('maxObligatedAmount', event.target.value, state, dispatch)}
				inputProps={{
					style: {
						height: 19,
						width: '100%',
					},
					id: 'maxObligatedAmountFilter',
				}}
			/>
		</div>
	);
};

const renderModificationFilter = (state, dispatch) => {
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
								onClick={() => setEDASearchSetting('contractsOrMods', 'both', state, dispatch)}
								checked={state.edaSearchSettings && state.edaSearchSettings.contractsOrMods === 'both'}
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
								onClick={() => setEDASearchSetting('contractsOrMods', 'contracts', state, dispatch)}
								checked={
									state.edaSearchSettings && state.edaSearchSettings.contractsOrMods === 'contracts'
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
								onClick={() => setEDASearchSetting('contractsOrMods', 'mods', state, dispatch)}
								checked={state.edaSearchSettings && state.edaSearchSettings.contractsOrMods === 'mods'}
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

const renderExcludeTerms = (state, dispatch) => {
	return (
		<div>
			<p style={{ fontSize: 12, color: 'gray' }}>
				Enter exclude terms separated by a semicolon. Example: <i>12-34;Machine Learning</i>
			</p>
			<TextField
				placeholder="Enter Text to Exclude"
				variant="outlined"
				value={state.edaSearchSettings.excludeTerms}
				style={{ backgroundColor: 'white', width: '100%' }}
				fullWidth={true}
				onChange={(event) => setEDASearchSetting('excludeTerms', event.target.value, state, dispatch)}
				inputProps={{
					style: {
						height: 19,
						width: '100%',
					},
				}}
			/>
		</div>
	);
};

const resetAdvancedSettings = (dispatch) => {
	dispatch({ type: 'RESET_SEARCH_SETTINGS' });
	setState(dispatch, { runSearch: true });
};

export const getAdvancedOptions = (props) => {
	const { state, dispatch, handleSubmit } = props;
	const { searchText } = state;

	return (
		<div style={{ height: 500, overflow: 'scroll' }}>
			<div style={styles.advFilterDiv}>
				<strong style={styles.boldText}>EXCLUDED TERMS</strong>
				<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
				<div>{renderExcludeTerms(state, dispatch)}</div>
			</div>

			<div style={styles.advFilterDiv}>
				<strong style={styles.boldText}>DESCRIPTION OF REQS</strong>
				<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
				<div>{renderTextFieldFilter(state, dispatch, 'Description of Requirements', 'reqDesc')}</div>
			</div>

			<div style={styles.advFilterDiv}>
				<strong style={styles.boldText}>CONTRACT SOW</strong>
				<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
				<div>{renderTextFieldFilter(state, dispatch, 'Contract SOW', 'contractSOW')}</div>
			</div>

			<div style={styles.advFilterDiv}>
				<strong style={styles.boldText}>CLIN DATA</strong>
				<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
				<div>{renderTextFieldFilter(state, dispatch, 'CLIN DATA', 'clinText')}</div>
			</div>

			{(!searchText || searchText.length === 0) && (
				<>
					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>ISSUE ORGANIZATION</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderOrganizationFilters(state, dispatch)}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>ISSUE OFFICE DODAAC</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderTextFieldFilter(state, dispatch, 'ISSUE OFFICE DODAAC', 'issueOfficeDoDAAC')}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>ISSUE OFFICE NAME</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderTextFieldFilter(state, dispatch, 'ISSUE OFFICE NAME', 'issueOfficeName')}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>FISCAL YEAR</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderFiscalYearFilter(state, dispatch)}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>OBLIGATED AMOUNT</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderObligatedAmountFilter(state, dispatch)}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>VENDOR NAME</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderTextFieldFilter(state, dispatch, 'Vendor Name', 'vendorName')}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>FUNDING OFFICE DoDAAC</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderTextFieldFilter(state, dispatch, 'Funding Office Code', 'fundingOfficeCode')}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>FUNDING AGENCY NAME</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderTextFieldFilter(state, dispatch, 'Funding Agency Name', 'fundingAgencyName')}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>PSC</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderTextFieldFilter(state, dispatch, 'PSC', 'psc')}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>NAICS</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderTextFieldFilter(state, dispatch, 'NAICS', 'naicsCode')}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>DUNS</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderTextFieldFilter(state, dispatch, 'DUNS', 'duns')}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>AVAILABLE EDA FORMAT</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderContractDataFilter(state, dispatch)}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>CONTRACTS OR MODS</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderModificationFilter(state, dispatch)}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>IDV PIID</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div> {renderTextFieldFilter(state, dispatch, 'IDV PIID', 'idvPIID')}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>PIID</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderTextFieldFilter(state, dispatch, 'PIID', 'piid')}</div>
					</div>

					<div style={styles.advFilterDiv}>
						<strong style={styles.boldText}>MOD NUMBER</strong>
						<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
						<div>{renderTextFieldFilter(state, dispatch, 'Mod Number', 'modNumber')}</div>
					</div>
				</>
			)}

			<div style={{ display: 'flex', margin: '10px' }}>
				<div style={{ width: '120px', height: '40px', marginRight: '20px' }}>
					<GCButton
						style={{
							border: 'none',
							width: '100%',
							height: '100%',
							padding: '0px',
							color: 'black',
							backgroundColor: '#B0BAC5',
						}}
						onClick={() => resetAdvancedSettings(dispatch)}
					>
						Clear Filters
					</GCButton>
				</div>
				<div style={{ width: '120px', height: '40px' }}>
					<GCButton style={{ width: '100%', height: '100%' }} onClick={handleSubmit}>
						Search
					</GCButton>
				</div>
			</div>
		</div>
	);
};

const EDASearchMatrixHandler = (props) => {
	const { state, dispatch } = props;

	const { edaSearchSettings, totalObligatedAmount, issuingOrgs } = state;

	const resetSearchSettings = () => {
		dispatch({ type: 'RESET_SEARCH_SETTINGS' });
		setState(dispatch, { runSearch: true });
	};

	return (
		<div data-cy="eda-filter-container">
			<div className={'sidebar-section-title'} style={{ paddingTop: 10 }}>
				FILTERS
				<p style={{ fontSize: 10, color: 'gray', margin: '5px 0px' }}>Data sources: PDS, SYN, FPDS</p>
			</div>
			<GCAccordion
				contentPadding={0}
				expanded={
					!edaSearchSettings.allOrgsSelected &&
					edaSearchSettings.organizations &&
					edaSearchSettings.organizations.length > 0
				}
				header={'ISSUE ORGANIZATION'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'issueOrganizationAccordion'}
			>
				{renderOrganizationFilters(state, dispatch)}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={edaSearchSettings.issueOfficeDoDAAC}
				header={'ISSUE OFFICE DODAAC'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'issueOfficeDoDAACAccordion'}
			>
				{renderTextFieldFilter(state, dispatch, 'Issue Office DoDAAC', 'issueOfficeDoDAAC')}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={edaSearchSettings.issueOfficeName}
				header={'ISSUE OFFICE NAME'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'issueOfficeNameAccordion'}
			>
				{renderTextFieldFilter(state, dispatch, 'Issue Office Name', 'issueOfficeName')}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={
					!edaSearchSettings.allYearsSelected &&
					edaSearchSettings.fiscalYears &&
					edaSearchSettings.fiscalYears.length > 0
				}
				header={'FISCAL YEAR'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'fiscalYearAccordion'}
			>
				{renderFiscalYearFilter(state, dispatch)}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={edaSearchSettings.minObligatedAmount || edaSearchSettings.maxObligatedAmount}
				header={'OBLIGATED AMOUNT'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'obligatedAmountAccordion'}
			>
				{renderObligatedAmountFilter(state, dispatch)}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={edaSearchSettings.vendorName}
				header={'VENDOR NAME'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'vendorNameAccordion'}
			>
				{renderTextFieldFilter(state, dispatch, 'Vendor Name', 'vendorName')}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={edaSearchSettings.fundingOfficeCode}
				header={'FUNDING OFFICE DoDAAC'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'fundingOfficeCodeAccordion'}
			>
				{renderTextFieldFilter(state, dispatch, 'Funding Office Code', 'fundingOfficeCode')}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={edaSearchSettings.fundingAgencyName}
				header={'FUNDING AGENCY NAME'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'fundingAgencyNameAccordion'}
			>
				{renderTextFieldFilter(state, dispatch, 'Funding Agency Name', 'fundingAgencyName')}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={edaSearchSettings.psc}
				header={'PSC'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'pscAccordion'}
			>
				{renderTextFieldFilter(state, dispatch, 'PSC', 'psc')}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={edaSearchSettings.naicsCode}
				header={'NAICS'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'naicsAccordion'}
			>
				{renderTextFieldFilter(state, dispatch, 'NAICS', 'naicsCode')}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={edaSearchSettings.duns}
				header={'DUNS'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'dunsAccordion'}
			>
				{renderTextFieldFilter(state, dispatch, 'DUNS', 'duns')}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={
					!edaSearchSettings.allDataSelected &&
					(edaSearchSettings.contractData.pds ||
						edaSearchSettings.contractData.syn ||
						edaSearchSettings.contractData.fpds ||
						edaSearchSettings.contractData.none)
				}
				header={'AVAILABLE EDA FORMAT'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'contractDataAccordion'}
			>
				{renderContractDataFilter(state, dispatch)}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={edaSearchSettings.contractsOrMods !== 'both'}
				header={'CONTRACTS OR MODS'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'contractsOrModsAccordion'}
			>
				{renderModificationFilter(state, dispatch)}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={edaSearchSettings.idvPIID}
				header={'IDV PIID'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'idvPIIDAccordion'}
			>
				{renderTextFieldFilter(state, dispatch, 'IDV PIID', 'idvPIID')}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={edaSearchSettings.piid}
				header={'PIID'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'piidAccordion'}
			>
				{renderTextFieldFilter(state, dispatch, 'PIID', 'piid')}
			</GCAccordion>

			<GCAccordion
				contentPadding={15}
				expanded={edaSearchSettings.modNumber}
				header={'MOD NUMBER'}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'normal'}
				id={'modNumberAccordion'}
			>
				{renderTextFieldFilter(state, dispatch, 'Mod Number', 'modNumber')}
			</GCAccordion>

			<GCButton
				style={{ width: '100%', marginBottom: '10px', marginLeft: '-1px' }}
				onClick={() => {
					setState(dispatch, { runSearch: true });
				}}
			>
				Update Search
			</GCButton>
			<GCButton
				style={{ width: '100%', marginBottom: '10px', marginLeft: '-1px' }}
				onClick={resetSearchSettings}
				isSecondaryBtn
			>
				Clear Filters
			</GCButton>

			<div className={'filters-container sidebar-section-title'} style={{ marginBottom: 5 }}>
				STATISTICS
			</div>
			<GCAccordion
				contentPadding={0}
				expanded={true}
				header={'CONTRACT TOTALS'}
				headerBackground={'rgb(56,63,64)'}
				headerTextColor={'white'}
				headerTextWeight={'normal'}
			>
				{state.statsLoading && (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={gcOrange} />
					</div>
				)}
				{!state.statsLoading && (
					<SearchStats issuingOrgs={issuingOrgs} totalObligatedAmount={totalObligatedAmount} />
				)}
			</GCAccordion>
		</div>
	);
};

export default EDASearchMatrixHandler;
