import React, { useState, useEffect } from 'react';
import {
	MuiPickersUtilsProvider,
	KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import GCButton from '../../common/GCButton';

import {
	Link,
	Typography,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	TextField,
	FormControl,
	FormGroup,
	FormControlLabel,
	Checkbox,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { backgroundGreyLight } from '../../common/gc-colors';
import CloseIcon from '@material-ui/icons/Close';
import ReactTable from 'react-table';
import { setState } from '../../../utils/sharedFunctions';

const _ = require('lodash');

const styles = {
	titleText: {
		fontWeight: 900,
		fontSize: '14px',
		marginBottom: 0,
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
		width: 1220,
		height: 600,
		padding: '15px 30px',
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
};

export const EDASummaryView = (props) => {
	const {
		edaSearchSettings,
		searchResults,
		loading,
		dispatch,
		currentViewName,
		summaryCardView,
	} = props;

	const [showDialog, setShowDialog] = useState(false);
	const [summaryDetailData, setSummaryDetailData] = useState([]);
	const [summaryDetailTitle, setSummaryDetailTitle] = useState('');

	useEffect(() => {
		if (currentViewName === 'Summary' && summaryCardView) {
			setState(dispatch, { summaryCardView: false, resultsText: '' });
		}
	}, [currentViewName, dispatch, summaryCardView]);

	const setEDASearchSetting = (field, value, isStartDate) => {
		const edaSettings = _.cloneDeep(edaSearchSettings);
		let doSearch = false;

		if (field === 'aggregations') {
			const index = edaSettings.aggregations.indexOf(value);
			if (index !== -1) {
				edaSettings.aggregations.splice(index, 1);
			} else {
				edaSettings.aggregations.push(value);
			}
		} else if (field === 'issueDateRange') {
			if (Object.prototype.toString.call(value) === '[object Date]') {
				value.setDate(value.getDate() + 1);
			}

			if (isStartDate) {
				edaSettings.startDate = new moment(value).format('YYYY-MM-DD');
			} else {
				edaSettings.endDate = new moment(value).format('YYYY-MM-DD');
			}

			if (value && value.toString() !== 'Invalid Date') {
				doSearch = true;
			}
		} else if (field === 'contractIssueAgency') {
			doSearch = true;
			edaSettings.issueAgency = value;
		}

		setState(dispatch, { edaSearchSettings: edaSettings, runSearch: doSearch });
	};

	const renderDetailTable = () => {
		return (
			<ReactTable
				data={summaryDetailData}
				className={'striped'}
				noDataText={'No rows found'}
				// loading={loadingTable}
				columns={getSummaryColumns(true)}
				editable={false}
				filterable={false}
				minRows={1}
				multiSort={false}
				showPageSizeOptions={false}
				showPagination={false}
				getTbodyProps={(state, rowInfo, column) => {
					return {
						style: {
							overflow: 'auto',
						},
					};
				}}
				getTdProps={(state, rowInfo, column) => ({
					style: {
						whiteSpace: 'unset',
					},
				})}
				getTrGroupProps={(state, rowInfo) => {
					return {
						style: { maxHeight: 72 },
					};
				}}
				getTheadTrProps={(state, rowInfo, column) => {
					return { style: styles.tableHeaderRow };
				}}
				getTheadThProps={(state, rowInfo, column) => {
					return {
						style: { fontSize: 15, fontWeight: 'bold', whiteSpace: 'unset' },
					};
				}}
				style={{
					height: '100%',
					borderTopRightRadius: 5,
					borderTopLeftRadius: 5,
					width: 1160,
				}}
				getTableProps={(state, rowInfo, column) => {
					return {
						style: {
							borderTopRightRadius: 5,
							borderTopLeftRadius: 5,
						},
					};
				}}
			/>
		);
	};

	const getSummaryColumns = (isDetailColumns = false) => {
		let summaryColumns = [
			{
				Header: () => <p style={styles.tableColumn}>Office Agency</p>,
				filterable: false,
				accessor: 'contract_issue_name_eda_ext',
				width: 250,
				Cell: (row) => (
					<div style={{ textAlign: 'left' }}>
						<p>{row.value}</p>
					</div>
				),
				aggregate: (vals) => [...new Set(vals)],
				id: 'contract_issue_name_eda_ext',
				Aggregated: (row) => {
					return <span>{row.value} </span>;
				},
			},
			{
				Header: () => <p style={styles.tableColumn}>Office DoDAAC</p>,
				filterable: false,
				accessor: 'contract_issue_dodaac_eda_ext',
				width: 250,
				Cell: (row) => (
					<div style={{ textAlign: 'left' }}>
						<p>{row.value}</p>
					</div>
				),
				aggregate: (vals) => [...new Set(vals)].join(','),
				Aggregated: (row) => {
					return <span>{row.value} </span>;
				},
				id: 'office_dodaac',
			},
			{
				Header: () => <p style={styles.tableColumn}>Office Command</p>,
				filterable: false,
				accessor: 'issuing_organization_eda_ext',
				width: 200,
				Cell: (row) => (
					<div style={{ textAlign: 'left' }}>
						<p>{row.value}</p>
					</div>
				),
				aggregate: (vals) => [...new Set(vals)],
				Aggregated: (row) => {
					return <span>{row.value} </span>;
				},
				id: 'officeCommand',
			},
			{
				Header: () => <p style={styles.tableColumn}>Vendor</p>,
				filterable: false,
				accessor: 'vendor_name_eda_ext',
				width: 250,
				Cell: (row) => (
					<div style={{ textAlign: 'left' }}>
						<p>{row.value}</p>
					</div>
				),
				aggregate: (vals) => [...new Set(vals)],
				Aggregated: (row) => {
					return <span>{row.value} </span>;
				},
				id: 'vendor_name_eda_ext',
			},
			{
				Header: () => <p style={styles.tableColumn}>Parent IDV</p>,
				filterable: false,
				accessor: 'reference_idv_eda_ext',
				width: 200,
				Cell: (row) => (
					<div style={{ textAlign: 'left' }}>
						<p>{row.value}</p>
					</div>
				),
				aggregate: (vals) => [...new Set(vals)],
				Aggregated: (row) => {
					return <span>{row.value} </span>;
				},
				id: 'reference_idv_eda_ext',
			},
		];

		if (!isDetailColumns) {
			summaryColumns = summaryColumns.concat([
				{
					Header: () => (
						<p style={styles.tableColumn}>Total Procurement Instruments</p>
					),
					filterable: false,
					accessor: 'procurement',
					width: 150,
					Cell: (row) => (
						<div style={{ textAlign: 'left' }}>
							<p>1</p>
						</div>
					),
					aggregate: (vals, rows) => {
						return rows.length;
					},
					Aggregated: (row, item) => {
						return <span>{row.value}</span>;
					},
					id: 'totalProcurementInstruments',
				},
				// {
				//     Header: () => <p style={styles.tableColumn}>Total Open</p>,
				//     filterable: false,
				//     accessor: 'totalOpen',
				//     Cell: row => (
				//         <div style={{ textAlign: 'left' }}>
				//             <p>{row.value}</p>
				//         </div>
				//     ),
				//     aggregate: vals => _.round(_.mean(vals)),
				//     Aggregated: row => {
				//         return <span>{row.value} (avg)</span>
				//     }
				// },
				// {
				//     Header: () => <p style={styles.tableColumn}>Total Closed</p>,
				//     filterable: false,
				//     accessor: 'totalClosed',
				//     Cell: row => (
				//         <div style={{ textAlign: 'left' }}>
				//             <p>{row.value}</p>
				//         </div>
				//     ),
				//     aggregate: vals => _.round(_.mean(vals)),
				//     Aggregated: row => {
				//         return <span>{row.value} (avg)</span>
				//     }
				// },
				// {
				//     Header: () => <p style={styles.tableColumn}>% Closed</p>,
				//     filterable: false,
				//     accessor: 'percentClosed',
				//     Cell: row => (
				//         <div style={{ textAlign: 'left' }}>
				//             <p>{row.value}</p>
				//         </div>
				//     ),
				//     aggregate: vals => _.round(_.mean(vals)),
				//     Aggregated: row => {
				//         return <span>{row.value} (avg)</span>
				//     }
				// },
				// {
				//     Header: () => <p style={styles.tableColumn}>Cumulative Obligated Amount ($)</p>,
				//     filterable: false,
				//     accessor: 'coa',
				//     width: 250,
				//     Cell: row => (
				//         <div style={{ textAlign: 'left' }}>
				//             <p>{row.value}</p>
				//         </div>
				//     ),
				//     aggregate: vals => _.round(_.mean(vals)),
				//     Aggregated: row => {
				//         return <span>{row.value} (avg)</span>
				//     },
				//     id: 'cumulativeObligatedAmount'
				// },
			]);
			if (edaSearchSettings.aggregations.length > 0) {
				summaryColumns.push({
					Header: () => (
						<p style={styles.tableColumn}>Procurement Instrument List</p>
					),
					filterable: false,
					accessor: 'procurementList',
					width: 250,
					Cell: (row) => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
					aggregate: (vals) => vals,
					Aggregated: (row) => {
						let subRows = row.row._subRows;
						let resultData = [];
						for (let i = 0; i < subRows.length; i++) {
							let subRow = subRows[i];
							for (
								let j = 0;
								j < edaSearchSettings.aggregations.length - 1;
								j++
							) {
								subRow = subRow._subRows[0];
							}
							resultData.push(subRow);
						}
						resultData = resultData.map((row) => row._original);

						return (
							<Link
								onClick={(event) => {
									setShowDialog(true);
									setSummaryDetailData(resultData);
									let title = '';
									for (const agg of edaSearchSettings.aggregations) {
										if (resultData && resultData.length > 0 && resultData[0]) {
											title += '[' + resultData[0][agg] + ']';
											if (
												edaSearchSettings.aggregations.indexOf(agg) !==
												edaSearchSettings.aggregations.length - 1
											) {
												title += ' - ';
											}
										}
									}

									setSummaryDetailTitle(title);
								}}
								style={{ color: '#386F94', cursor: 'pointer' }}
							>
								<div style={{ textAlign: 'left' }}>
									<p>Open</p>
								</div>
							</Link>
						);
					},
				});
			}
		} else {
			// summary detail columns
			summaryColumns = summaryColumns.concat([
				// {
				//     Header: () => <p style={styles.tableColumn}>PIID</p>,
				//     filterable: false,
				//     accessor: 'piid',
				//     Cell: row => (
				//         <div style={{ textAlign: 'left' }}>
				//             <p>{row.value}</p>
				//         </div>
				//     )
				// },
				{
					Header: () => <p style={styles.tableColumn}>Vendor Cage</p>,
					filterable: false,
					accessor: 'vendor_duns_eda_ext',
					width: 200,
					Cell: (row) => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
				},
				{
					Header: () => <p style={styles.tableColumn}>Vendor Name</p>,
					filterable: false,
					accessor: 'vendor_name_eda_ext',
					width: 200,
					Cell: (row) => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
				},
				{
					Header: () => <p style={styles.tableColumn}>Obligated Amount ($)</p>,
					filterable: false,
					accessor: 'obligated_amounts_eda_ext',
					width: 250,
					Cell: (row) => (
						<div style={{ textAlign: 'left' }}>
							<p>{row.value}</p>
						</div>
					),
				},
			]);
		}

		return summaryColumns;
	};

	return (
		<div>
			<Dialog
				open={showDialog}
				maxWidth="lg"
				onClose={() => setShowDialog(false)}
				style={styles.dialog}
			>
				<DialogTitle style={{ padding: '16px 30px 0' }}>
					<div style={{ display: 'flex', width: '100%' }}>
						<Typography
							variant="h3"
							display="inline"
							style={{ fontWeight: 700 }}
						>
							Summary Details
						</Typography>
					</div>
					<div style={{ display: 'flex', width: '100%', margin: '5px 0' }}>
						<Typography
							variant="h5"
							display="block"
							style={{ fontWeight: 400 }}
						>
							{summaryDetailTitle}
						</Typography>
					</div>
					<IconButton
						aria-label="close"
						style={{
							position: 'absolute',
							right: '0px',
							top: '0px',
							height: 60,
							width: 60,
							color: 'black',
							backgroundColor: backgroundGreyLight,
							borderRadius: 0,
						}}
						onClick={() => setShowDialog(false)}
					>
						<CloseIcon style={{ fontSize: 30 }} />
					</IconButton>
				</DialogTitle>
				<DialogContent style={styles.dialogContent}>
					{renderDetailTable()}
				</DialogContent>
				<DialogActions>
					<GCButton
						onClick={() => {
							setState(dispatch, {
								summaryCardView: true,
								summaryCardData: summaryDetailData,
								currentViewName: 'Card',
								listView: false,
								resultsText: `${summaryDetailData.length} results aggregated - ${summaryDetailTitle}`,
							});
						}}
					>
						Open Card View
					</GCButton>
				</DialogActions>
			</Dialog>

			<div>
				<div style={{ margin: '0 0 5px 0' }}>
					<div
						style={{
							padding: '0 15px 0 0',
							margin: '10px 0 0 0',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<div style={{ display: 'flex' }}>
							<Typography style={styles.filterTitle}>
								{' '}
								Aggregations:{' '}
							</Typography>
							<FormControl style={styles.filterInput}>
								<FormGroup row>
									<FormControlLabel
										name="Issue Office Agency"
										value="Issue Office Agency"
										style={styles.titleText}
										control={
											<Checkbox
												style={styles.filterBox}
												onClick={() =>
													setEDASearchSetting(
														'aggregations',
														'contract_issue_name_eda_ext'
													)
												}
												icon={
													<CheckBoxOutlineBlankIcon
														style={{ visibility: 'hidden' }}
													/>
												}
												checked={
													edaSearchSettings &&
													edaSearchSettings.aggregations &&
													edaSearchSettings.aggregations.indexOf(
														'contract_issue_name_eda_ext'
													) !== -1
												}
												checkedIcon={
													<i
														style={{ color: '#E9691D' }}
														className="fa fa-check"
													/>
												}
												name="Issue Office Agency"
											/>
										}
										label="Issue Office Agency"
										labelPlacement="end"
									/>
									<FormControlLabel
										name="Vendor"
										value="Vendor"
										style={styles.titleText}
										control={
											<Checkbox
												style={styles.filterBox}
												onClick={() =>
													setEDASearchSetting(
														'aggregations',
														'vendor_name_eda_ext'
													)
												}
												icon={
													<CheckBoxOutlineBlankIcon
														style={{ visibility: 'hidden' }}
													/>
												}
												checked={
													edaSearchSettings &&
													edaSearchSettings.aggregations &&
													edaSearchSettings.aggregations.indexOf(
														'vendor_name_eda_ext'
													) !== -1
												}
												checkedIcon={
													<i
														style={{ color: '#E9691D' }}
														className="fa fa-check"
													/>
												}
												name="Vendor"
											/>
										}
										label="Vendor"
										labelPlacement="end"
									/>
									<FormControlLabel
										name="Parent IDV"
										value="Parent IDV"
										style={styles.titleText}
										control={
											<Checkbox
												style={styles.filterBox}
												onClick={() =>
													setEDASearchSetting(
														'aggregations',
														'reference_idv_eda_ext'
													)
												}
												icon={
													<CheckBoxOutlineBlankIcon
														style={{ visibility: 'hidden' }}
													/>
												}
												checked={
													edaSearchSettings &&
													edaSearchSettings.aggregations &&
													edaSearchSettings.aggregations.indexOf(
														'reference_idv_eda_ext'
													) !== -1
												}
												checkedIcon={
													<i
														style={{ color: '#E9691D' }}
														className="fa fa-check"
													/>
												}
												name="Parent IDV"
											/>
										}
										label="Parent IDV"
										labelPlacement="end"
									/>
								</FormGroup>
							</FormControl>
						</div>
						<div style={{ display: 'flex' }}>
							<Typography
								style={{
									...styles.filterTitle,
									margin: '0 15px 0 0',
									display: 'flex',
									alignItems: 'center',
								}}
							>
								{' '}
								Contract Issue Agency:{' '}
							</Typography>
							<div style={{ display: 'inline-block', margin: '0 0 0 15px' }}>
								<Autocomplete
									options={[
										'Dept of Army',
										'Dept of Navy',
										'Dept of Air Force',
										'DARPA',
										'DLA',
									]}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Choose an agency"
											variant="outlined"
										/>
									)}
									clearOnEscape
									clearOnBlur
									blurOnSelect
									openOnFocus
									style={{ backgroundColor: 'white', width: 300 }}
									value={edaSearchSettings && edaSearchSettings.issueAgency}
									default
									onChange={(event, value) =>
										setEDASearchSetting('contractIssueAgency', value)
									}
								/>
							</div>
						</div>
					</div>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							margin: '0 0 15px 0',
						}}
					>
						<Typography style={styles.filterTitle}>
							{' '}
							PIID Issue Date Range:{' '}
						</Typography>
						<div style={{ ...styles.filterInput, display: 'inline-block' }}>
							<MuiPickersUtilsProvider utils={DateFnsUtils}>
								<KeyboardDatePicker
									margin="normal"
									style={{ margin: '0 15px 0 0' }}
									label="Start Date"
									format="MM/dd/yyyy"
									InputProps={{ style: { backgroundColor: 'white' } }}
									value={edaSearchSettings && edaSearchSettings.startDate}
									onChange={(date) =>
										setEDASearchSetting('issueDateRange', date, true)
									}
								/>
								<KeyboardDatePicker
									margin="normal"
									style={{ margin: '0 15px 0 0' }}
									label="End Date"
									format="MM/dd/yyyy"
									InputProps={{ style: { backgroundColor: 'white' } }}
									value={edaSearchSettings && edaSearchSettings.endDate}
									onChange={(date) =>
										setEDASearchSetting('issueDateRange', date, false)
									}
								/>
							</MuiPickersUtilsProvider>
						</div>
					</div>
				</div>

				<ReactTable
					data={searchResults}
					className={'striped'}
					noDataText={'No rows found'}
					loading={loading}
					columns={getSummaryColumns(false)}
					pivotBy={searchResults ? edaSearchSettings.aggregations : []}
					editable={false}
					filterable={false}
					minRows={1}
					multiSort={false}
					showPageSizeOptions={false}
					showPagination={false}
					getTbodyProps={(state, rowInfo, column) => {
						return {
							style: {
								overflow: 'auto',
							},
						};
					}}
					getTdProps={(state, rowInfo, column) => ({
						style: {
							whiteSpace: 'unset',
						},
					})}
					getTheadTrProps={(state, rowInfo, column) => {
						return { style: styles.tableHeaderRow };
					}}
					getTheadThProps={(state, rowInfo, column) => {
						return {
							style: { fontSize: 15, fontWeight: 'bold', whiteSpace: 'unset' },
						};
					}}
					style={{
						height: 'calc(100vh - 300px)',
						borderTopRightRadius: 5,
						borderTopLeftRadius: 5,
						marginBottom: 10,
					}}
					getTableProps={(state, rowInfo, column) => {
						return {
							style: {
								borderTopRightRadius: 5,
								borderTopLeftRadius: 5,
							},
						};
					}}
				/>
			</div>
		</div>
	);
};

export default EDASummaryView;
