import React from 'react';
import GCAccordion from '../../common/GCAccordion';
import SimpleTable from '../../common/SimpleTable';

import {
	FormControl,
	FormGroup,
	FormControlLabel,
	Checkbox,
	TextField,
	Radio,
} from '@material-ui/core';
import { setState } from '../../../utils/sharedFunctions';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { gcOrange } from '../../common/gc-colors';
import GCButton from '../../common/GCButton';

const _ = require('lodash');

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
	const edaSettings = _.cloneDeep(state.edaSearchSettings);

	switch (field) {
		case 'allOrgs':
			edaSettings.allOrgsSelected = true;
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
		case 'issueOfficeDoDAAC':
			edaSettings.issueOfficeDoDAAC = value;
			break;
		case 'issueOfficeName':
			edaSettings.issueOfficeName = value;
			break;
		case 'allYears':
			edaSettings.allYearsSelected = true;
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
			break;
		case 'specData':
			edaSettings.allDataSelected = false;
			break;
		case 'contractData':
			edaSettings.contractData[value] = !edaSettings.contractData[value];
			break;
		case 'minObligatedAmount':
			edaSettings.minObligatedAmount = value;
			break;
		case 'maxObligatedAmount':
			edaSettings.maxObligatedAmount = value;
			break;
		case 'contractsOrMods':
			edaSettings.contractsOrMods = value;
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

const getIssuingOrgData = (state) => {
	return Object.keys(state.issuingOrgs).map((org) => ({
		Key: org,
		Value: state.issuingOrgs[org],
	}));
};

const getStatsData = (state) => {
	const issuingOrgData = getIssuingOrgData(state);
	const totalObligation = [
		{
			Key: 'Total Obligated Amount',
			Value: '$' + state.totalObligatedAmount.toLocaleString(),
		},
	];

	return issuingOrgData.concat(totalObligation);
};

const renderStats = (state) => {
	return (
		<SimpleTable
			tableClass={'magellan-table'}
			zoom={1}
			// headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
			rows={getStatsData(state)}
			height={'auto'}
			dontScroll={true}
			// colWidth={colWidth}
			disableWrap={true}
			// title={'Metadata'}
			hideHeader={true}
		/>
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
							setEDASearchSetting(
								'majcoms',
								{ org: org, subOrg: searchQuery },
								state,
								dispatch
							)
						}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={
							state.edaSearchSettings &&
							state.edaSearchSettings.majcoms &&
							state.edaSearchSettings.majcoms[org].indexOf(searchQuery) !== -1
						}
						checkedIcon={
							<i style={{ color: '#E9691D' }} className="fa fa-check" />
						}
						name={subOrg}
					/>
				}
				label={<span style={{ fontSize: 13, marginLeft: 5 }}>{subOrg}</span>}
				labelPlacement="end"
			/>
		);
	}

	return (
		<FormGroup style={{ margin: '0 0 0 28px' }}>{orgCheckboxes}</FormGroup>
	);
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
								onClick={() =>
									setEDASearchSetting('allOrgs', '', state, dispatch)
								}
								icon={
									<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />
								}
								checked={state.edaSearchSettings.allOrgsSelected}
								checkedIcon={
									<i style={{ color: '#E9691D' }} className="fa fa-check" />
								}
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
								onClick={() =>
									setEDASearchSetting('specOrgs', '', state, dispatch)
								}
								icon={
									<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />
								}
								checked={!state.edaSearchSettings.allOrgsSelected}
								checkedIcon={
									<i style={{ color: '#E9691D' }} className="fa fa-check" />
								}
								name="Specific organization(s)"
								style={styles.filterBox}
							/>
						}
						label="Specific organization(s)"
						labelPlacement="end"
						style={styles.titleText}
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
									onClick={() =>
										setEDASearchSetting(
											'organizations',
											'air force',
											state,
											dispatch
										)
									}
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.organizations &&
										state.edaSearchSettings.organizations.indexOf(
											'air force'
										) !== -1
									}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
									name="Air Force"
								/>
							}
							label="Air Force"
							labelPlacement="end"
						/>
						{state.edaSearchSettings.organizations &&
							state.edaSearchSettings.organizations.indexOf('air force') !==
								-1 &&
							renderMajcoms(state, dispatch, 'air force')}
						<FormControlLabel
							name="Army"
							value="Army"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() =>
										setEDASearchSetting(
											'organizations',
											'army',
											state,
											dispatch
										)
									}
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.organizations &&
										state.edaSearchSettings.organizations.indexOf('army') !== -1
									}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
									name="Army"
								/>
							}
							label="Army"
							labelPlacement="end"
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
									onClick={() =>
										setEDASearchSetting(
											'organizations',
											'defense',
											state,
											dispatch
										)
									}
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.organizations &&
										state.edaSearchSettings.organizations.indexOf('defense') !==
											-1
									}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
									name="DOD"
								/>
							}
							label="DOD"
							labelPlacement="end"
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
									onClick={() =>
										setEDASearchSetting(
											'organizations',
											'navy',
											state,
											dispatch
										)
									}
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.organizations &&
										state.edaSearchSettings.organizations.indexOf('navy') !== -1
									}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
									name="Navy"
								/>
							}
							label="Navy"
							labelPlacement="end"
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

const renderIssueOfficeDoDAACFilter = (state, dispatch) => {
	return (
		<TextField
			placeholder="Issue Office DoDAAC"
			variant="outlined"
			defaultValue={state.edaSearchSettings.issueOfficeDoDAAC}
			style={{ backgroundColor: 'white', width: '100%' }}
			fullWidth={true}
			onBlur={(event) =>
				setEDASearchSetting(
					'issueOfficeDoDAAC',
					event.target.value,
					state,
					dispatch
				)
			}
			inputProps={{
				style: {
					height: 19,
					width: '100%',
				},
			}}
		/>
	);
};

const renderIssueOfficeNameFilter = (state, dispatch) => {
	return (
		<TextField
			placeholder="Issue Office Name"
			variant="outlined"
			defaultValue={state.edaSearchSettings.issueOfficeName}
			style={{ backgroundColor: 'white', width: '100%' }}
			fullWidth={true}
			onBlur={(event) =>
				setEDASearchSetting(
					'issueOfficeName',
					event.target.value,
					state,
					dispatch
				)
			}
			inputProps={{
				style: {
					height: 19,
					width: '100%',
				},
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
						onClick={() =>
							setEDASearchSetting('fiscalYear', i.toString(), state, dispatch)
						}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={
							state.edaSearchSettings &&
							state.edaSearchSettings.fiscalYears &&
							state.edaSearchSettings.fiscalYears.indexOf(i.toString()) !== -1
						}
						checkedIcon={
							<i style={{ color: '#E9691D' }} className="fa fa-check" />
						}
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
								onClick={() =>
									setEDASearchSetting('allYears', '', state, dispatch)
								}
								icon={
									<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />
								}
								checked={state.edaSearchSettings.allYearsSelected}
								checkedIcon={
									<i style={{ color: '#E9691D' }} className="fa fa-check" />
								}
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
								onClick={() =>
									setEDASearchSetting('specYears', '', state, dispatch)
								}
								icon={
									<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />
								}
								checked={!state.edaSearchSettings.allYearsSelected}
								checkedIcon={
									<i style={{ color: '#E9691D' }} className="fa fa-check" />
								}
								name="Specific fiscal year(s)"
								style={styles.filterBox}
							/>
						}
						label="Specific fiscal year(s)"
						labelPlacement="end"
						style={styles.titleText}
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
								onClick={() =>
									setEDASearchSetting('allData', '', state, dispatch)
								}
								icon={
									<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />
								}
								checked={state.edaSearchSettings.allDataSelected}
								checkedIcon={
									<i style={{ color: '#E9691D' }} className="fa fa-check" />
								}
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
								onClick={() =>
									setEDASearchSetting('specData', '', state, dispatch)
								}
								icon={
									<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />
								}
								checked={!state.edaSearchSettings.allDataSelected}
								checkedIcon={
									<i style={{ color: '#E9691D' }} className="fa fa-check" />
								}
								name="Specific data source(s)"
								style={styles.filterBox}
							/>
						}
						label="Specific data source(s)"
						labelPlacement="end"
						style={styles.titleText}
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
									onClick={() =>
										setEDASearchSetting('contractData', 'pds', state, dispatch)
									}
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.contractData &&
										state.edaSearchSettings.contractData.pds
									}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
									name="PDS"
								/>
							}
							label="PDS"
							labelPlacement="end"
						/>
						<FormControlLabel
							name="SYN"
							value="SYN"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() =>
										setEDASearchSetting('contractData', 'syn', state, dispatch)
									}
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.contractData &&
										state.edaSearchSettings.contractData.syn
									}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
									name="SYN"
								/>
							}
							label="SYN"
							labelPlacement="end"
						/>
						<FormControlLabel
							name="None"
							value="None"
							style={styles.titleText}
							control={
								<Checkbox
									style={styles.filterBox}
									onClick={() =>
										setEDASearchSetting('contractData', 'none', state, dispatch)
									}
									icon={
										<CheckBoxOutlineBlankIcon
											style={{ visibility: 'hidden' }}
										/>
									}
									checked={
										state.edaSearchSettings &&
										state.edaSearchSettings.contractData &&
										state.edaSearchSettings.contractData.none
									}
									checkedIcon={
										<i style={{ color: '#E9691D' }} className="fa fa-check" />
									}
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
				defaultValue={
					state.edaSearchSettings && state.edaSearchSettings.minObligatedAmount
				}
				style={{
					backgroundColor: 'white',
					width: '100%',
					margin: '0 0 15px 0',
				}}
				fullWidth={true}
				onBlur={(event) =>
					setEDASearchSetting(
						'minObligatedAmount',
						event.target.value,
						state,
						dispatch
					)
				}
				inputProps={{
					style: {
						height: 19,
						width: '100%',
					},
				}}
			/>
			<TextField
				placeholder="Max"
				variant="outlined"
				type="number"
				defaultValue={
					state.edaSearchSettings && state.edaSearchSettings.maxObligatedAmount
				}
				style={{ backgroundColor: 'white', width: '100%' }}
				fullWidth={true}
				onBlur={(event) =>
					setEDASearchSetting(
						'maxObligatedAmount',
						event.target.value,
						state,
						dispatch
					)
				}
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
								checkedIcon={
									<FiberManualRecordIcon style={styles.radioChecked} />
								}
								onClick={() =>
									setEDASearchSetting(
										'contractsOrMods',
										'both',
										state,
										dispatch
									)
								}
								checked={
									state.edaSearchSettings &&
									state.edaSearchSettings.contractsOrMods === 'both'
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
								checkedIcon={
									<FiberManualRecordIcon style={styles.radioChecked} />
								}
								onClick={() =>
									setEDASearchSetting(
										'contractsOrMods',
										'contracts',
										state,
										dispatch
									)
								}
								checked={
									state.edaSearchSettings &&
									state.edaSearchSettings.contractsOrMods === 'contracts'
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
								checkedIcon={
									<FiberManualRecordIcon style={styles.radioChecked} />
								}
								onClick={() =>
									setEDASearchSetting(
										'contractsOrMods',
										'mods',
										state,
										dispatch
									)
								}
								checked={
									state.edaSearchSettings &&
									state.edaSearchSettings.contractsOrMods === 'mods'
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

const resetAdvancedSettings = (dispatch) => {
	dispatch({ type: 'RESET_SEARCH_SETTINGS' });
};

const EDASearchMatrixHandler = {
	getSearchMatrixItems(props) {
		const { state, dispatch } = props;

		const { edaSearchSettings } = state;

		return (
			<div>
				<div className={'sidebar-section-title'}>
					FILTERS
					<p style={{ fontSize: 10, color: 'gray', margin: '0px' }}>
						Data sources: PDS, SYN
					</p>
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
				>
					{renderIssueOfficeDoDAACFilter(state, dispatch)}
				</GCAccordion>

				<GCAccordion
					contentPadding={15}
					expanded={edaSearchSettings.issueOfficeName}
					header={'ISSUE OFFICE NAME'}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderIssueOfficeNameFilter(state, dispatch)}
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
				>
					{renderFiscalYearFilter(state, dispatch)}
				</GCAccordion>

				<GCAccordion
					contentPadding={15}
					expanded={
						!edaSearchSettings.allDataSelected &&
						(edaSearchSettings.contractData.pds ||
							edaSearchSettings.contractData.syn ||
							edaSearchSettings.contractData.none)
					}
					header={'EDA CONTRACT DATA'}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderContractDataFilter(state, dispatch)}
				</GCAccordion>

				<GCAccordion
					contentPadding={15}
					expanded={
						edaSearchSettings.minObligatedAmount ||
						edaSearchSettings.maxObligatedAmount
					}
					header={'OBLIGATED AMOUNT'}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderObligatedAmountFilter(state, dispatch)}
				</GCAccordion>

				<GCAccordion
					contentPadding={15}
					expanded={edaSearchSettings.contractsOrMods !== 'both'}
					header={'CONTRACTS OR MODS'}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderModificationFilter(state, dispatch)}
				</GCAccordion>

				<GCButton
					style={{ width: '100%', marginBottom: '10px', marginLeft: '-1px' }}
					onClick={() => {
						setState(dispatch, { runSearch: true });
					}}
				>
					Update Search
				</GCButton>

				<div
					className={'filters-container sidebar-section-title'}
					style={{ marginBottom: 5 }}
				>
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
					{!state.statsLoading && renderStats(state)}
				</GCAccordion>
			</div>
		);
	},

	getAdvancedOptions(props) {
		const { state, dispatch, handleSubmit } = props;

		return (
			<div style={{ height: 500, overflow: 'scroll' }}>
				<div style={styles.advFilterDiv}>
					<strong style={styles.boldText}>ISSUE ORGANIZATION</strong>
					<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
					<div>{renderOrganizationFilters(state, dispatch)}</div>
				</div>
				<div style={styles.advFilterDiv}>
					<strong style={styles.boldText}>ISSUE OFFICE DODAAC</strong>
					<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
					<div>{renderIssueOfficeDoDAACFilter(state, dispatch)}</div>
				</div>
				<div style={styles.advFilterDiv}>
					<strong style={styles.boldText}>ISSUE OFFICE NAME</strong>
					<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
					<div>{renderIssueOfficeNameFilter(state, dispatch)}</div>
				</div>
				<div style={styles.advFilterDiv}>
					<strong style={styles.boldText}>FISCAL YEAR</strong>
					<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
					<div>{renderFiscalYearFilter(state, dispatch)}</div>
				</div>
				<div style={styles.advFilterDiv}>
					<strong style={styles.boldText}>EDA CONTRACT DATA</strong>
					<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
					<div>{renderContractDataFilter(state, dispatch)}</div>
				</div>
				<div style={styles.advFilterDiv}>
					<strong style={styles.boldText}>OBLIGATED AMOUNT</strong>
					<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
					<div>{renderObligatedAmountFilter(state, dispatch)}</div>
				</div>
				<div style={styles.advFilterDiv}>
					<strong style={styles.boldText}>CONTRACTS OR MODS</strong>
					<hr style={{ marginTop: '5px', marginBottom: '10px' }} />
					<div>{renderModificationFilter(state, dispatch)}</div>
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
						<GCButton
							style={{ width: '100%', height: '100%' }}
							onClick={handleSubmit}
						>
							Search
						</GCButton>
					</div>
				</div>
			</div>
		);
	},
};

export default EDASearchMatrixHandler;
