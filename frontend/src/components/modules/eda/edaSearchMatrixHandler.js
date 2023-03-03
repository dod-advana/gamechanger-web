import React, { useCallback } from 'react';
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
import MultiSelectAutocomplete from '../../common/GCMultiSelectAutoComplete';
import EdaHierarchicalFilter from './edaHierarchicalFilter';
import GameChangerAPI from '../../api/gameChanger-service-api';
import { insertChildrenBF, getParentsOfChild, applyFunctionBF } from './edaUtils';
import _ from 'lodash';

const gameChangerAPI = new GameChangerAPI();

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
	width100: {
		width: '100%',
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
			obligatedAmount: !isNaN(orgData.obligatedAmount) ? orgData.obligatedAmount : 0,
			color: COLORS[index],
		};
	});
};

const SearchStats = ({ issuingOrgs, totalObligatedAmount }) => {
	let data = getIssuingOrgData(issuingOrgs);

	const renderChartLabel = (entry) => {
		return entry.type;
	};

	const renderObligatedAmountMBT = (obligatedAmount) => {
		if (isNaN(obligatedAmount)) {
			return '$0';
		}

		const amountMillions = obligatedAmount / 1000000;
		if (amountMillions < 1000) {
			return '$' + numberWithCommas(amountMillions.toFixed(2)) + 'M';
		}
		const amountBillions = amountMillions / 1000;
		if (amountBillions < 1000) {
			return '$' + numberWithCommas(amountBillions.toFixed(2)) + 'B';
		}
		const amountTrillions = amountBillions / 1000;
		return '$' + numberWithCommas(amountTrillions.toFixed(2)) + 'T';
	};

	const CustomTooltip = ({ payload }) => {
		let tooltipText = '';
		if (payload.length > 0) {
			let agency = payload[0];
			tooltipText = `${agency.name}: ${renderObligatedAmountMBT(
				agency.payload.obligatedAmount
			)}/${numberWithCommas(agency.payload.count)} contracts`;
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
					dataKey="obligatedAmount"
					nameKey="type"
					label={renderChartLabel}
					isAnimationActive={false}
				>
					{data.map((_entry, index) => (
						<Cell key={`cell-${index}`} fill={data[index].color} />
					))}
				</Pie>
				<text x={'50%'} y={'50%'} dy={8} textAnchor="middle">
					{renderObligatedAmountMBT(totalObligatedAmount)}
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
			'U.S. Special Operations Command',
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
		<div style={{ ...styles.container, padding: 0 }}>
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
	const end = now.getFullYear() + 1;

	for (let i = end; i >= start; i--) {
		const year = i;
		yearCheckboxes.push(
			<FormControlLabel
				name={year}
				value={year}
				style={styles.titleText}
				control={
					<Checkbox
						style={styles.filterBox}
						onClick={() => setEDASearchSetting('fiscalYear', year, state, dispatch)}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={
							state.edaSearchSettings &&
							state.edaSearchSettings.fiscalYears &&
							state.edaSearchSettings.fiscalYears.indexOf(year) !== -1
						}
						checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
						name={year}
					/>
				}
				label={year}
				labelPlacement="end"
				id={'year' + year + 'Checkbox'}
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

/**
 * Fetch the children for a particular node in the hierarchical filter data & update
 * filter options in state.
 *
 * @param {Object} nodee - The node whose children are to be fetched
 * @param {String} filterName - The name of the filter (ex: 'psc')
 * @param {Object} state - The eda state object
 * @param {Function} dispatch - The dispatch function provided by Context
 *
 * @return {undefined} - no return value, just calls setState
 */
const getChildrenHierarchicalFilter = async (node, filterName, state, dispatch) => {
	const newFilterData = { ...state.edaFilterData };
	const resp = await gameChangerAPI.callSearchFunction({
		functionName: 'getHierarchicalFilterData',
		cloneName: state.cloneData.clone_name,
		options: {
			parentCode: node.code,
			picklistName: filterName,
		},
	});

	const newChildren = resp.data.map((e) => {
		return { ...e, children: [] };
	});

	newFilterData[filterName + '_hierarchy'] = newFilterData[filterName + '_hierarchy'].map((root) =>
		insertChildrenBF(root, node, newChildren)
	);

	const searchSettings = { ...state.edaSearchSettings };
	const selectedOptions = [...searchSettings[filterName]];

	if (_.findIndex(selectedOptions, (e) => e.code === node.code) !== -1) {
		searchSettings[filterName] = selectedOptions.concat(newChildren);
	}

	setState(dispatch, { filterDataFetched: true, edaFilterData: newFilterData, edaSearchSettings: searchSettings });
};

const EDASearchMatrixHandler = (props) => {
	const { state, dispatch } = props;

	const { edaSearchSettings, totalObligatedAmount, issuingOrgs } = state;

	const resetSearchSettings = () => {
		dispatch({ type: 'RESET_SEARCH_SETTINGS' });
		setState(dispatch, { runSearch: true });
	};

	/**
	 * Deselects an option in a hierarchical filter. Also deselects the option's children, and all its
	 * parents (including grandparents, etc.).
	 *
	 * @param {Object} nodeToDeselect - The node being deselected
	 * @param {Array} selectedNodes - The currently selected nodes/options
	 * @param {Array} node_hierarchy - The root nodes of the tree of hierarchical filter options
	 *
	 * @return {Array} - Array of now selected nodes
	 */
	const deselectHierarchicalFilterOption = useCallback((nodeToDeselect, selectedNodes, node_hierarchy) => {
		const { code } = nodeToDeselect;
		let newSelectedNodes = [...selectedNodes];
		// if the node has children, also deselect them
		if (nodeToDeselect.hasChildren) {
			applyFunctionBF(nodeToDeselect, (node) => {
				newSelectedNodes = newSelectedNodes.filter((e) => e.code !== node.code);
			});
		} else {
			newSelectedNodes = newSelectedNodes.filter((node) => node.code !== code);
		}
		// if the node's parent is selected, deselect it (recursively)
		if (nodeToDeselect.parent) {
			let parentsToDeselect = [];
			for (let root of node_hierarchy) {
				const possibleParents = getParentsOfChild(root, nodeToDeselect);
				if (possibleParents && possibleParents.length > 0) {
					parentsToDeselect = possibleParents;
					break;
				}
			}
			newSelectedNodes = newSelectedNodes.filter(
				(node) => _.findIndex(parentsToDeselect, (e) => e.code === node.code) === -1
			);
		}
		return newSelectedNodes;
	}, []);

	const pscOnOptionClick = useCallback(
		(pscNode) => {
			const currPsc = state.edaSearchSettings.psc;
			let newPsc = [...currPsc];
			const psc = pscNode.code;

			// we are deselecting an option
			if (_.findIndex(currPsc, (node) => node.code === psc) !== -1) {
				newPsc = deselectHierarchicalFilterOption(pscNode, newPsc, state.edaFilterData.psc_hierarchy);
			}
			// we are selecting an option, also select children
			else if (pscNode.hasChildren) {
				applyFunctionBF(pscNode, (node) => {
					newPsc.push(node);
				});
			} else {
				newPsc.push(pscNode);
			}

			setEDASearchSetting('psc', newPsc, state, dispatch);
		},
		[dispatch, state, deselectHierarchicalFilterOption]
	);

	const pscFetchChildren = useCallback(
		(node) => getChildrenHierarchicalFilter(node, 'psc', state, dispatch),
		[state, dispatch]
	);

	const naicsOnOptionClick = useCallback(
		(naicsNode) => {
			const currNaics = state.edaSearchSettings.naicsCode;
			let newNaics = [...currNaics];
			const naics = naicsNode.code;

			// we are deselecting an option
			if (_.findIndex(newNaics, (node) => node.code === naics) !== -1) {
				newNaics = deselectHierarchicalFilterOption(
					naicsNode,
					newNaics,
					state.edaFilterData.naicsCode_hierarchy
				);
			}
			// we are selecting an option, also select children
			else if (naicsNode.hasChildren) {
				applyFunctionBF(naicsNode, (node) => {
					newNaics.push(node);
				});
			} else {
				newNaics.push(naicsNode);
			}

			setEDASearchSetting('naicsCode', newNaics, state, dispatch);
		},
		[dispatch, state, deselectHierarchicalFilterOption]
	);

	const naicsFetchChildren = useCallback(
		(node) => getChildrenHierarchicalFilter(node, 'naicsCode', state, dispatch),
		[state, dispatch]
	);

	return (
		<div data-cy="eda-filter-container">
			<GCAccordion
				header={
					<div
						className={'sidebar-section-title'}
						style={{ paddingTop: 10, paddingLeft: 0 }}
						data-cy="eda-filter-accordion-header"
					>
						FILTERS
						<p style={{ fontSize: 10, color: 'gray', margin: '5px 0px' }}>Data sources: PDS, SYN, FPDS</p>
					</div>
				}
				notBordered
				contentPadding="5px"
				headerTextColor="black"
				headerBackground="white"
			>
				<div style={styles.width100}>
					<GCAccordion
						header={'ISSUED BY'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
						id={'issuedByAccordion'}
					>
						<div style={styles.width100}>
							<div>
								<p style={{ fontSize: 15, color: 'black', margin: '5px 0px', textAlign: 'left' }}>
									ISSUE ORGANIZATION
								</p>
								{renderOrganizationFilters(state, dispatch)}
							</div>
							<div>
								<p style={{ fontSize: 15, color: 'black', margin: '5px 0px', textAlign: 'left' }}>
									ISSUE OFFICE DODAAC
								</p>
								<div style={styles.width100}>
									<MultiSelectAutocomplete
										value={state.edaSearchSettings.issueOfficeDoDAAC}
										setValue={(value) => {
											setEDASearchSetting('issueOfficeDoDAAC', value, state, dispatch);
										}}
										options={state.edaFilterData.issueOfficeDoDAAC}
										placeholder="Search DoDAACs"
										label=""
										inputId="issueOfficeDoDAAC-multiselect-input"
									/>
								</div>
							</div>
							<div>
								<p style={{ fontSize: 15, color: 'black', margin: '5px 0px', textAlign: 'left' }}>
									ISSUE OFFICE NAME
								</p>
								<div style={styles.width100}>
									<MultiSelectAutocomplete
										value={state.edaSearchSettings.issueOfficeName}
										setValue={(value) => {
											setEDASearchSetting('issueOfficeName', value, state, dispatch);
										}}
										options={state.edaFilterData.issueOfficeName}
										placeholder="Search Names"
										label=""
										inputId="issueOfficeName-multiselect-input"
									/>
								</div>
							</div>
						</div>
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
						header={'FUNDED BY'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
						id={'fundedByAccordion'}
					>
						<div style={styles.width100}>
							<div>
								<p style={{ fontSize: 15, color: 'black', margin: '5px 0px', textAlign: 'left' }}>
									FUNDING OFFICE DODAAC
								</p>
								<div style={styles.width100}>
									<MultiSelectAutocomplete
										value={state.edaSearchSettings.fundingOfficeCode}
										setValue={(value) => {
											setEDASearchSetting('fundingOfficeCode', value, state, dispatch);
										}}
										options={state.edaFilterData.fundingOfficeDoDAAC}
										placeholder="Search DoDAACs"
										label=""
										inputId="fundingOfficeDoDAAC-multiselect-input"
									/>
								</div>
							</div>
							<div>
								<p style={{ fontSize: 15, color: 'black', margin: '5px 0px', textAlign: 'left' }}>
									FUNDING AGENCY NAME
								</p>
								<div style={styles.width100}>
									<MultiSelectAutocomplete
										value={state.edaSearchSettings.fundingAgencyName}
										setValue={(value) => {
											setEDASearchSetting('fundingAgencyName', value, state, dispatch);
										}}
										options={state.edaFilterData.fundingAgencyName}
										placeholder="Search Names"
										label=""
										inputId="fundingAgencyName-multiselect-input"
									/>
								</div>
							</div>
						</div>
					</GCAccordion>

					<GCAccordion
						contentPadding={15}
						expanded={edaSearchSettings.psc && edaSearchSettings.psc.length > 0}
						header={'PSC'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
						id={'pscAccordion'}
					>
						<div style={styles.width100}>
							<EdaHierarchicalFilter
								options={state.edaFilterData.psc_hierarchy}
								fetchChildren={pscFetchChildren}
								onOptionClick={pscOnOptionClick}
								optionsSelected={state.edaSearchSettings.psc}
							/>
						</div>
					</GCAccordion>

					<GCAccordion
						contentPadding={15}
						expanded={edaSearchSettings.naicsCode && edaSearchSettings.naicsCode.length > 0}
						header={'NAICS'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
						id={'naicsAccordion'}
					>
						<div style={styles.width100}>
							<EdaHierarchicalFilter
								options={state.edaFilterData.naicsCode_hierarchy}
								fetchChildren={naicsFetchChildren}
								onOptionClick={naicsOnOptionClick}
								optionsSelected={state.edaSearchSettings.naicsCode}
							/>
						</div>
					</GCAccordion>

					<GCAccordion
						contentPadding={15}
						expanded={edaSearchSettings.duns && edaSearchSettings.duns.length > 0}
						header={'DUNS'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
						id={'dunsAccordion'}
					>
						<div style={styles.width100}>
							<MultiSelectAutocomplete
								value={state.edaSearchSettings.duns}
								setValue={(value) => {
									setEDASearchSetting('duns', value, state, dispatch);
								}}
								options={state.edaFilterData.duns}
								placeholder="Search DUNS"
								label="DUNS"
							/>
						</div>
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
						expanded={edaSearchSettings.contractsOrMods !== 'contracts'}
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
						expanded={edaSearchSettings.modNumber && edaSearchSettings.modNumber.length > 0}
						header={'MOD NUMBER'}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
						id={'modNumberAccordion'}
					>
						<div style={styles.width100}>
							<MultiSelectAutocomplete
								value={state.edaSearchSettings.modNumber}
								setValue={(value) => {
									setEDASearchSetting('modNumber', value, state, dispatch);
								}}
								options={state.edaFilterData.modNumber}
								placeholder="Search Numbers"
								label="Mod Number"
							/>
						</div>
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
				</div>
			</GCAccordion>

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
