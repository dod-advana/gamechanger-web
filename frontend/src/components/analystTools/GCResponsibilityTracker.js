import React, { useEffect, useState } from 'react';
import propTypes from 'prop-types';
import styled from 'styled-components';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import {
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	IconButton,
	Popover,
	TextField,
	Typography,
} from '@material-ui/core';
import {
	backgroundGreyDark,
	backgroundGreyLight,
	backgroundWhite,
} from '../common/gc-colors';
import { gcOrange } from '../common/gc-colors';
import GCPrimaryButton from '../common/GCButton';
import GameChangerAPI from '../api/gameChanger-service-api';
import {trackEvent} from '../telemetry/Matomo';
import Link from '@material-ui/core/Link';
import Icon from '@material-ui/core/Icon';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CloseIcon from '@material-ui/icons/Close';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined';
import { getTrackingNameForFactory, exportToCsv } from '../../utils/gamechangerUtils';
// import { setState } from '../../utils/sharedFunctions';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const _ = require('lodash');

const FilterInput = ({value, setValue}) => {
	return(
		<input 
			type="text" 
			value={value} 
			style={{width: '100%'}}
			onChange={(e) => {setValue(e.target.value)}}
		/>
	)
}

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		flexWrap: 'wrap',
		margin: '0 20px',
	},
	textField: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		width: '25ch',
		'& .MuiFormHelperText-root': {
			fontSize: 12,
		},
	},
	textFieldWide: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		minWidth: '50ch',
		'& .MuiFormHelperText-root': {
			fontSize: 12,
		},
	},
	dialogLg: {
		maxWidth: '800px',
		minWidth: '800px',
	},
	closeButton: {
		position: 'absolute',
		right: '0px',
		top: '0px',
		height: 60,
		width: 60,
		color: 'black',
		backgroundColor: backgroundGreyLight,
		borderRadius: 0,
	},
	checkedLabel: {
		fontSize: 16,
	},
	textFieldFilter: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		'& .MuiOutlinedInput-root': {
			height: 26,
			fontSize: 16,
		},
	},
}));

const TableRow = styled.div`
	text-align: left;
	max-height: 250px;
	min-height: 20px;
`;

const GCCheckbox = withStyles({
	root: {
		color: '#E9691D',
		'&$checked': {
			color: '#E9691D',
		},
	},
	checked: {},
})((props) => <Checkbox color="default" {...props} />);

const gameChangerAPI = new GameChangerAPI();
const PAGE_SIZE = 10;

const getData = async ({
	limit = PAGE_SIZE,
	offset = 0,
	sorted = [],
	filtered = [],
}) => {
	const order = sorted.map(({ id, desc }) => [id, desc ? 'DESC' : 'ASC']);
	const where = filtered;

	try {
		const { data } = await gameChangerAPI.getResponsibilityData({
			limit,
			offset,
			order,
			where,
		});
		return data;
	} catch (err) {
		this.logger.error(err.message, 'GEADAKS');
		return []
	}
};

const preventDefault = (event) => event.preventDefault();

const GCResponsibilityTracker = ({
	state, 
	filters,
	setFilters,
	docTitle,
	setDocTitle,
	organization,
	setOrganization,
	responsibilityText,
	setResponsibilityText
}) => {

	const classes = useStyles();
	const [responsibilityTableData, setResponsibilityTableData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [numPages, setNumPages] = useState(0);

	const [sorts, setSorts] = useState([]);
	const [pageIndex, setPageIndex] = useState(0);
	const [hoveredRow, setHoveredRow] = useState(null);
	const [selectRows, setSelectRows] = useState(false);
	const [selectedIds, setSelectedIds] = useState([]);
	const [showReportModal, setShowReportModal] = useState(false);
	const [issueDescription, setIssueDescription] = useState('');
	const [sendingReports, setSendingReports] = useState(false);
	const [reportsSent, setReportsSent] = useState(false);
	const [filterPopperIsOpen, setFilterPopperIsOpen] = useState(false);
	const [filterPopperAnchorEl, setFilterPopperAnchorEl] = useState(null);
	const [otherEntRespFilters, setOtherEntRespFilters] = useState({});
	const [otherEntRespFiltersList, setOtherEntRespFiltersList] = useState([]);
	const [visibleOtherEntRespFilters, setVisibleOtherEntRespFilters] = useState(
		{}
	);
	const [otherEntRespSearchText, setOtherEntRespSearchText] = useState('');
	const [reloadResponsibilityTable, setReloadResponsibilityTable] = useState(true);

	useEffect(() => {
		gameChangerAPI.getOtherEntityFilterList().then((resp) => {
			const tmpFilters = {
				'Select All': { name: 'Select All', checked: true },
			};
			resp.data.forEach((org) => {
				tmpFilters[org] = {
					name: org,
					checked: false,
				};
			});
			setOtherEntRespFilters(tmpFilters);
			setVisibleOtherEntRespFilters(tmpFilters);
		});
	}, []);

	useEffect(() => {
		if (otherEntRespSearchText === '') {
			setVisibleOtherEntRespFilters(otherEntRespFilters);
		} else {
			const filteredList = {
				'Select All': {
					name: 'Select All',
					checked: otherEntRespFilters['Select All'].checked,
				},
			};
			Object.keys(otherEntRespFilters).forEach((org) => {
				if (org.toLowerCase().includes(otherEntRespSearchText.toLowerCase())) {
					filteredList[org] = otherEntRespFilters[org];
				}
			});
			setVisibleOtherEntRespFilters(filteredList);
		}
	}, [otherEntRespSearchText, otherEntRespFilters]);

	useEffect(() => {
		handleFetchData({ page: pageIndex, sorted: sorts, filtered: filters });
	}, [otherEntRespFiltersList]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (reloadResponsibilityTable) {
			handleFetchData({ page: pageIndex, sorted: sorts, filtered: filters });
			setReloadResponsibilityTable(false);
		}
	 // eslint-disable-next-line react-hooks/exhaustive-deps
	 }, [pageIndex, sorts, filters]); 

	 useEffect(() => {
		const newFilters = [];
		if(Object.keys(responsibilityText).length) newFilters.push(responsibilityText);
		if(organization.length) {
			organization.forEach(org => {
				newFilters.push({id: 'organizationPersonnel', value: org})
			})
		};
		if(docTitle.length) {
			docTitle.forEach(doc => {
				newFilters.push({id: 'documentTitle', value: doc.documentTitle})
			})
		};
		setFilters(newFilters);
		setReloadResponsibilityTable(true);
	 },[docTitle, organization, responsibilityText, setFilters])

	 const handleFetchData = async ({ page, sorted, filtered }) => {
		try {
			setLoading(true);
			const tmpFiltered = _.cloneDeep(filtered);
			if (otherEntRespFiltersList.length > 0) {
				tmpFiltered.push({
					id: 'otherOrganizationPersonnel',
					value: otherEntRespFiltersList,
				});
			}
			const { totalCount, results = [] } = await getData({
				offset: page * PAGE_SIZE,
				sorted,
				filtered: tmpFiltered,
			});
			const pageCount = Math.ceil(totalCount / PAGE_SIZE);
			setNumPages(pageCount);
			results.forEach((result) => {
				result.selected = selectedIds.includes(result.id);
			});
			setResponsibilityTableData(results);
		} catch (e) {
			setResponsibilityTableData([]);
			setNumPages(0);
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const exportCSV = async () => {
		try {
			const { results = [] } = await getData({
				limit: null,
				offset: 0,
				sorted: sorts,
				filtered: filters,
			});
			const rtnResults = results.filter((result) => {
				return selectedIds.includes(result.id);
			})
			trackEvent(
				getTrackingNameForFactory(state.cloneData.clone_name), 
				'ResponsibilityTracker', 
				'ExportCSV', 
				selectedIds.length > 0 ? rtnResults.length : results.length
			);
			exportToCsv(
				'ResponsibilityData.csv', 
				selectedIds.length > 0 ? rtnResults : results, 
				true
			);
			deselectRows();
		} catch (e) {
			console.error(e);
		}
	};

	// const reportButtonAction = async () => {
	// 	getRowData();
	// }

	// const getRowData = async () => {
	// 	try {
	// 		const { results = []} = await getData({ limit: null, offset: 0, sorted: sorts, filtered: filters });
	// 		const rtnResults = results.filter(result => {
	// 			return selectedIds.includes(result.id);
	// 		})
	// 		trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'ResponsibilityTracker', 'GetRowData', selectedIds.length > 0 ? rtnResults.length : results.length);

	// 		const rtn = selectedIds.length > 0 ? rtnResults : results;
	// 		const id = rtn[0].id;
	// 		const filename = rtn[0].filename;
	// 		const responsibilityText = rtn[0].responsibilityText;

	// 		setState(dispatch, {showResponsibilityAssistModal: true, id, filename, responsibilityText});

	// 		deselectRows();
	// 	} catch (e) {
	// 		console.error(e);
	// 	}
	// }

	const deselectRows = async () => {
		responsibilityTableData.forEach(result => {
			result.selected = false;
		});
		setSelectRows(false);
		setSelectedIds([]);
	}

	const renderDataTable = () => {
		const dataColumns = [
			{
				Header: 'Document Title',
				accessor: 'documentTitle',
				style: { whiteSpace: 'unset' },
				width: 300,
				Filter: 
					<FilterInput 
						value={docTitle.map(doc => doc.documentTitle).join(' AND ')} 
						setValue={(filter) => {
							const splitFilter = filter.split(' AND ');
							const parsedFilter = splitFilter.map(filter => {
								return {documentTitle: filter}
							})
							setDocTitle(parsedFilter)
						}}
					/>,
				Cell: (row) => (
					<TableRow>
						<Link href={'#'} onClick={(event)=> {
							preventDefault(event);
							fileClicked(row.row._original.filename, row.row.responsibilityText, 1);
						}}
						style={{ color: '#386F94' }}
						>
							<div>
								<p>{row.value}</p>
							</div>
						</Link>
					</TableRow>
				),
			},
			{
				Header: 'Organization/Personnel',
				accessor: 'organizationPersonnel',
				style: { whiteSpace: 'unset' },
				Filter: 
					<FilterInput 
						value={organization.join(' AND ')} 
						setValue={(filter) => {
							const parsedFilter = filter.split(' AND ');
							setOrganization(parsedFilter)
						}}
					/>,
				Cell: (row) => <TableRow>{row.value}</TableRow>,
			},
			{
				Header: 'Responsibility Text',
				accessor: 'responsibilityText',
				style: { whiteSpace: 'unset' },
				Filter: 
					<FilterInput 
						value={responsibilityText?.value || ''} 
						setValue={(filter) => setResponsibilityText({id: 'responsibilityText', value: filter})}
					/>,
				Cell: (row) => <TableRow>{row.value}</TableRow>,
			},
			{
				Header: () => (
					<div style={{ cursor: 'default' }}>
						<>Other Organization/Personnel</>
						<i onClick={(event) => {
							openFilterPopper(event.target, 'otherOrgsPers');
						}} className={'fa fa-filter'} style={{
							color: '#E9691D',
							marginLeft: '50px',
							cursor: 'pointer',
							fontSize: 18
						}}
						/>
					</div>
				),
				accessor: 'otherOrganizationPersonnel',
				style: { whiteSpace: 'unset' },
				width: 300,
				filterable: false,
				Cell: (row) => <TableRow>{row.value}</TableRow>,
			},
			{
				Header: 'Documents Referenced',
				accessor: 'documentsReferenced',
				style: { whiteSpace: 'unset' },
				width: 200,
				filterable: false,
				Cell: row => (
					<TableRow>
						{row.value? row.value.join(', '): '' }
					</TableRow>
				),
			},
			{
				Header: 'Select',
				accessor: 'id',
				style: { whiteSpace: 'unset' },
				show: selectRows,
				filterable: false,
				width: 120,
				sortable: false,
				Cell: (row) => (
					<TableRow>
						<Checkbox
							style={styles.checkbox}
							onChange={(e) => handleSelected(row.value)}
							color="primary"
							icon={
								<CheckBoxOutlineBlankIcon
									style={{ width: 25, height: 25, fill: 'rgb(224, 224, 224)' }}
									fontSize="large"
								/>
							}
							checkedIcon={
								<CheckBoxIcon
									style={{ width: 25, height: 25, fill: gcOrange }}
								/>
							}
							checked={row.row.selected}
						/>
					</TableRow>
				),
			},
		];

		return (
			<ReactTable
				data={responsibilityTableData}
				columns={dataColumns}
				style={{ height: 700, marginTop: 10 }}
				pageSize={PAGE_SIZE}
				showPageSizeOptions={false}
				filterable={true}
				manualSortBy={true}
				onSortedChange={(newSorts) => {
					setSorts(newSorts);
					setReloadResponsibilityTable(true);
				}}
				onPageChange={(pageIndex) => {
					setPageIndex(pageIndex);
					setReloadResponsibilityTable(true);
				}}
				defaultSorted={[
					{
						id: 'id',
						desc: false,
					},
				]}
				loading={loading}
				manual={true}
				pages={numPages}
				getTheadTrProps={() => {
					return {
						style: {
							height: 'fit-content',
							textAlign: 'left',
							fontWeight: 'bold',
							maxHeight: '400px',
						},
					};
				}}
				getTheadThProps={() => {
					return { style: { fontSize: 15, fontWeight: 'bold' } };
				}}
				getTrProps={(state, rowInfo, column) => {
					if (rowInfo && rowInfo.row) {
						return {
							onClick: (e, t) => {
							 },
							onMouseEnter: (e) => {
								setHoveredRow(rowInfo.index);
							},
							onMouseLeave: (e) => {
								setHoveredRow(null);
							},
							style: {
								background: rowInfo.index === hoveredRow ? '#efefef' : 'white',
								cursor: 'pointer',
							},
						};
					} else {
						return {};
					}
				}}
			/>
		);
	};

	const openFilterPopper = (target, column) => {
		if (filterPopperIsOpen) {
			setFilterPopperIsOpen(false);
			setFilterPopperAnchorEl(null);
			//(null);
		} else {
			setFilterPopperIsOpen(true);
			setFilterPopperAnchorEl(target);
			//setFilterColumn(column);
		}
	};

	const fileClicked = (filename, searchText, pageNumber) => {
		trackEvent(
			getTrackingNameForFactory(state.cloneData.clone_name),
			'ResponsibilityTracker',
			'PDFOpen'
		);
		trackEvent(
			getTrackingNameForFactory(state.cloneData.clone_name),
			'ResponsibilityTracker',
			'filename',
			filename
		);
		trackEvent(
			getTrackingNameForFactory(state.cloneData.clone_name),
			'ResponsibilityTracker',
			'pageNumber',
			pageNumber
		);
		let tempSearchText;
		if(searchText){
			const searchTextArray = searchText.split(' ');
			if(searchTextArray[0].match(/(\(\w{1,2}\)|\w{1,2}\.)/)) searchTextArray[0] += ' ';
			tempSearchText = searchTextArray.join(' ');
		}
		window.open(
			`/#/pdfviewer/gamechanger?filename=${filename.replace('.json', '.pdf')}&${
				searchText ? 'prevSearchText="' + tempSearchText + '"&' : ''
			}pageNumber=${pageNumber}&cloneIndex=${state.cloneData?.clone_name}`
		);
	};

	const handleSelected = (id) => {
		responsibilityTableData.forEach(row => {
			if(row['id'] === id){
				row.selected = !row.selected;
				trackEvent(
					getTrackingNameForFactory(state.cloneData.clone_name), 
					'ResponsibilityTracker', 
					`ID ${row.selected ? 'Selected' : 'Des-Selected'}`, 
					id);
				if (row.selected) {
					selectedIds.push(id);
				} else {
					selectedIds.splice(selectedIds.indexOf(id), 1);
				}
			}
		})
	}
	
	const handleCancelSelect = () => {
		deselectRows();
		trackEvent(
			getTrackingNameForFactory(state.cloneData.clone_name), 
			'ResponsibilityTracker', 
			'Cancel Select Rows'
		);
	}
	
	const hideShowReportModal = (show) => {
		trackEvent(
			getTrackingNameForFactory(state.cloneData.clone_name),
			'ResponsibilityTracker',
			`${show ? 'Opening' : 'Closing'} Reports Modal`
		);
		if (show) {
			setReportsSent(false);
		}
		setShowReportModal(show);
	};

	const renderReportModal = () => {
		return (
			<div>
				<FormControl style={{ width: '95%', margin: '20px 20px 10px 20px' }}>
					<TextField
						variant="outlined"
						placeholder="Enter issue information here..."
						multiline
						rows={9}
						width="75%"
						value={issueDescription}
						onBlur={(e) => setIssueDescription(e.target.value)}
					/>
				</FormControl>
			</div>
		);
	};

	const submitReport = async () => {
		setSendingReports(true);
		for (const reportId in selectedIds) {
			await gameChangerAPI.storeResponsibilityReportData({
				id: reportId,
				issue_description: issueDescription,
			});
		}
		trackEvent(
			getTrackingNameForFactory(state.cloneData.clone_name),
			'ResponsibilityTracker',
			'Reports Sent',
			selectedIds.length
		);
		setSelectedIds([]);
		setSelectRows(false);
		setIssueDescription('');
		setSendingReports(false);
		setReportsSent(true);
		setShowReportModal(false);
	};

	const renderLoading = () => {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					flexDirection: 'column',
				}}
			>
				<LoadingIndicator />
			</div>
		);
	};

	const renderSuccess = () => {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					flexDirection: 'column',
				}}
			>
				<CheckCircleOutlinedIcon
					style={{
						alignSelf: 'center',
						marginTop: '150px',
						height: '75px',
						width: '75px',
						filter:
							'invert(26%) sepia(49%) saturate(1486%) hue-rotate(146deg) brightness(72%) contrast(103%)',
					}}
				/>

				<h1 style={{ marginTop: '50px', alignSelf: 'center' }}>
					Thank You! We appreciate the feedback.
				</h1>
			</div>
		);
	};

	const handleFilterCheck = (event) => {
		const tmpEntFilters = _.cloneDeep(otherEntRespFilters);
		let selectAll = false;

		if (event.target.name === 'Select All' && event.target.checked) {
			selectAll = true;
			Object.keys(tmpEntFilters).forEach((key) => {
				if (key === 'Select All') {
					tmpEntFilters[key].checked = event.target.checked;
				} else {
					tmpEntFilters[key].checked = false;
				}
			});
		} else {
			tmpEntFilters[event.target.name].checked = event.target.checked;
			tmpEntFilters['Select All'].checked = false;
		}

		setOtherEntRespFilters(tmpEntFilters);

		if (!selectAll) {
			const tmpEntFilterNames = [];
			Object.keys(tmpEntFilters).forEach((key) => {
				if (tmpEntFilters[key].checked)
					tmpEntFilterNames.push(
						key === 'null' ? null : `%${tmpEntFilters[key].name}%`
					);
			});
			setOtherEntRespFiltersList(tmpEntFilterNames);
		} else {
			setOtherEntRespFiltersList([]);
		}
	};

	return (
		<>
			<Popover
				onClose={() => {
					setFilterPopperIsOpen(false);
					setFilterPopperAnchorEl(null);
				}}
				open={filterPopperIsOpen}
				anchorEl={filterPopperAnchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
			>
				<div style={{ padding: '0px 15px 10px', height: 200, width: 250 }}>
					<div style={{ margin: '10px 0' }}>
						<FormControl>
							<TextField
								variant="outlined"
								placeholder="Search filters..."
								value={otherEntRespSearchText}
								onChange={(e) => setOtherEntRespSearchText(e.target.value)}
								classes={{
									root: classes.textFieldFilter,
								}}
							/>
						</FormControl>
					</div>
					<div>
						{Object.keys(otherEntRespFilters).length > 0 &&
							Object.keys(visibleOtherEntRespFilters).length > 0 &&
							Object.keys(visibleOtherEntRespFilters).map((org) => {
								return (
									<div>
										<FormControlLabel
											control={
												<GCCheckbox
													checked={otherEntRespFilters[org].checked}
													onChange={handleFilterCheck}
													name={org}
													color="primary"
												/>
											}
											label={otherEntRespFilters[org].name}
											classes={{
												label: classes.checkedLabel,
											}}
										/>
									</div>
								);
							})}
					</div>
				</div>
			</Popover>

			<div style={styles.disclaimerContainer}>
				Data in the table below does not currently reflect all documents in
				GAMECHANGER. As we continue to process data for this capability, please
				check back later or reach us by email if your document/s of interest are
				not yet included: osd.pentagon.ousd-c.mbx.advana-gamechanger@mail.mil
			</div>
			
			<div style={{display: 'flex', justifyContent: 'flex-end'}}>
				{ selectRows ?
					<div>
						<GCPrimaryButton buttonColor={'#131E43'} onClick={handleCancelSelect}>
							Cancel <Icon className="fa fa-times" style={styles.buttons}/>
						</GCPrimaryButton>
						<GCPrimaryButton onClick={exportCSV}>
							Export <Icon className="fa fa-external-link" style={styles.buttons}/>
						</GCPrimaryButton>
						{/* <GCPrimaryButton buttonColor={'red'} onClick={reportButtonAction}>
							Update <Icon className="fa fa-bug" style={styles.buttons}/>
						</GCPrimaryButton> */}
						<div style={styles.spacer}/>
					</div>
					:
					<div>
						<GCPrimaryButton onClick={() => setSelectRows(true)}>
							Select Rows
						</GCPrimaryButton>
						<div style={styles.spacer}/>
					</div>
				}
			</div>
	
			{ renderDataTable() }
			
			<Dialog
				open={showReportModal}
				scroll={'paper'}
				maxWidth="lg"
				disableEscapeKeyDown
				disableBackdropClick
				classes={{
					paperWidthLg: classes.dialogLg,
				}}
			>
				<DialogTitle >
					<div style={{ display: 'flex', width: '100%' }}>
						<Typography 
							variant="h3" 
							display="inline" 
							style={{ fontWeight: 700 }}
						>
							Report Issues with Data
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
						onClick={() => hideShowReportModal(false)}
					>
						<CloseIcon style={{ fontSize: 30 }} />
					</IconButton>
				</DialogTitle>

				<DialogContent style={{ height: 300 }}>
					{sendingReports && renderLoading()}
					{reportsSent && renderSuccess()}
					{!sendingReports && renderReportModal()}
				</DialogContent>

				<DialogActions>
					<div
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
							width: '100%',
							margin: '0px 18px',
						}}
					>
						<GCPrimaryButton
							id={'editCloneSubmit'}
							onClick={() => submitReport()}
							style={{ margin: '10px' }}
						>
							Submit
						</GCPrimaryButton>
					</div>
				</DialogActions>
			</Dialog>
		</>
	);
};

const styles = {
	buttons: {
		paddingTop: 2,
	},
	tabsList: {
		borderBottom: `2px solid ${gcOrange}`,
		padding: 0,
		display: 'flex',
		alignItems: 'center',
		flex: 9,
		margin: '10px 0 10px 50px',
	},
	tabStyle: {
		width: '140px',
		border: '1px solid',
		borderColor: backgroundGreyDark,
		borderBottom: 'none !important',
		borderRadius: `6px 6px 0px 0px`,
		position: ' relative',
		listStyle: 'none',
		padding: '2px 12px',
		cursor: 'pointer',
		textAlign: 'center',
		backgroundColor: backgroundWhite,
		marginRight: '2px',
		marginLeft: '2px',
		height: 45,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabSelectedStyle: {
		border: '1px solid transparent',
		backgroundColor: gcOrange,
		borderColor: 'none',
		color: 'white',
	},
	tabContainer: {
		alignItems: 'center',
		minHeight: '613px',
	},
	tabButtonContainer: {
		backgroundColor: '#ffffff',
		width: '100%',
		display: 'flex',
		paddingLeft: '2em',
		paddingRight: '5em',
		paddingBottom: '5px',
		alignItems: 'center',
	},
	panelContainer: {
		alignItems: 'center',
		marginTop: 10,
		minHeight: 'calc(100vh - 600px)',
		paddingBottom: 20,
	},
	disclaimerContainer: {
		alignItems: 'center',
		fontWeight: 'bold'
	},
};

GCResponsibilityTracker.propTypes = {
	state: propTypes.objectOf({
		cloneData: propTypes.objectOf({
			clone_name: propTypes.string,
		}),
	}),
};

export default GCResponsibilityTracker;
