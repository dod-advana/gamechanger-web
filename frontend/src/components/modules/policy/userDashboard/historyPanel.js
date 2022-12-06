import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GCAccordion from '../../../common/GCAccordion';
import { gcOrange } from '../../../common/gc-colors';
import ReactTable from 'react-table';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import GCButton from '../../../common/GCButton';
import CloseIcon from '@material-ui/icons/Close';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import Link from '@material-ui/core/Link';
import moment from 'moment';
import GCTooltip from '../../../common/GCToolTip';
import styled from 'styled-components';
import { downloadFile } from '../../../export/ExportResultsDialog';
import GameChangerAPI from '../../../api/gameChanger-service-api';
import { StyledPlaceHolder } from './userDashboardStyles';
import { decodeTinyUrl } from '../../../../utils/gamechangerUtils';

const _ = require('lodash');
const gameChangerAPI = new GameChangerAPI();

const StyledI = styled.div`
	> i {
		color: #000000;
		cursor: pointer;
		font-size: 26px;

		:hover {
			color: #e9691d;
		}
	}
`;

const FavoriteStyledI = styled.div`
	> i {
		cursor: pointer;
		font-size: 26px;

		:hover {
			color: #e9691d;
		}
	}

	> .fa-star {
		color: #e9691d;
	}

	> .fa-star-o {
		color: rgb(200, 200, 200);
	}
`;

const CloseButton = styled.div`
	padding: 6px;
	background-color: white;
	border-radius: 5px;
	color: #8091a5 !important;
	border: 1px solid #b0b9be;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 0.4;
	position: absolute;
	right: 15px;
	top: 15px;
`;

const preventDefault = (event) => event.preventDefault();

const styles = {
	searchHistorySettings: {
		width: '387px',
		height: '206px',
		border: '2px solid #386F94',
		borderRadius: '6px',
		backgroundColor: 'rgba(64, 79, 84, 0.9)',
		boxShadow: '0 0 6px 2px rgba(0,0,0,0.5)',
		margin: '10px',
		position: 'relative',
		overlayButtons: {
			display: 'flex',
			justifyContent: 'flex-end',
			marginRight: '5px',
		},
		overlayText: {
			height: '80%',
			margin: '0 10px',
			overflowWrap: 'break-word',
			color: '#ffffff',
			fontFamily: 'Montserrat',
			fontSize: '14px',
		},
		overlaySearchDetails: {
			marginBottom: '10px',
		},
	},
	tableLeftDiv: {
		textAlign: 'left',
	},
	textInCell: {
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	tableRightDiv: {
		textAlign: 'right',
	},
	tableCenterDiv: {
		textAlign: 'center',
	},
	tableHeaderRow: {
		fontFamily: 'Montserrat',
		textAlign: 'left',
		fontWeight: 'bold',
		marginTop: '3px',
		maxHeight: '35px',
		height: '40px',
	},
	tableRow: {
		maxHeight: 200,
		fontSize: 15,
		fontFamily: 'Montserrat',
	},
};

const renderDate = (row) => {
	return (
		<div style={styles.tableLeftDiv}>
			<p>{moment(Date.parse(row.value)).utc().format('YYYY-MM-DD HH:mm UTC')}</p>
		</div>
	);
};

const renderTable = (data, columns) => {
	return (
		<ReactTable
			data={data}
			className={'striped'}
			noDataText={'No rows found'}
			// loading={loadingTable}
			columns={columns}
			editable={false}
			filterable={false}
			minRows={1}
			multiSort={false}
			showPageSizeOptions={false}
			showPagination={false}
			getTbodyProps={() => {
				return {
					style: {
						overflow: 'unset',
					},
				};
			}}
			getTdProps={() => ({
				style: {
					height: '40px',
				},
			})}
			getTrGroupProps={() => {
				return {
					style: { maxHeight: 40 },
				};
			}}
			getTheadTrProps={() => {
				return { style: styles.tableHeaderRow };
			}}
			getTheadThProps={() => {
				return { style: { fontSize: 15, fontWeight: 'bold' } };
			}}
			style={{
				height: 'calc(100vh - 492px)',
			}}
		/>
	);
};

const ExportHistoryPanel = ({ userData, cloneData, reload, setReload, classes }) => {
	const [searchHistorySettingsPopperAnchorEl, setSearchHistorySettingsPopperAnchorEl] = useState(null);
	const [searchHistorySettingsPopperOpen, setSearchHistorySettingsPopperOpen] = useState(false);
	const [searchHistorySettingsData, setSearchHistorySettingsData] = useState({
		searchType: '',
		orgFilterText: '',
		exportType: '',
		isExport: false,
	});
	const [exportHistory, setExportHistory] = useState([]);
	const [exportHistoryLoading, setExportHistoryLoading] = useState(true);
	const [exportHistoryDownloading, setExportHistoryDownloading] = useState(new Set());

	useEffect(() => {
		if (userData === null) return;

		if (userData.export_history) {
			userData.export_history = userData.export_history.filter(
				(search) => search.download_request_body.cloneData?.clone_name === cloneData.clone_name
			);
			userData.export_history.forEach((hist) => {
				let orgFilterText = '';
				if (
					hist.download_request_body &&
					hist.download_request_body.orgFilterQuery &&
					hist.download_request_body.orgFilterQuery === '*'
				) {
					orgFilterText = 'All sources';
				} else if (hist.download_request_body && hist.download_request_body.orgFilter) {
					Object.keys(hist.download_request_body.orgFilter).forEach((key) => {
						if (hist.download_request_body.orgFilter[key]) {
							orgFilterText += `${key}, `;
						}
					});
					orgFilterText = orgFilterText.slice(0, orgFilterText.length - 2);
				}
				hist.orgFilterText = orgFilterText;
			});

			setExportHistory(userData.export_history);
			setExportHistoryLoading(false);
		}
	}, [userData, cloneData.clone_name, cloneData.url]);

	const exportHistoryColumns = [
		{
			Header: () => <p>Search Text</p>,
			filterable: false,
			accessor: 'download_request_body.searchText',
			Cell: (row) => (
				<Link
					href={'#'}
					onClick={(event) => {
						preventDefault(event);
						regenerate(row.original.download_request_body, row.original.id);
					}}
					style={{ color: '#386F94' }}
				>
					<GCTooltip title={row.value} placement="top">
						<div style={styles.tableLeftDiv}>
							<p style={styles.textInCell}>{row.value}</p>
						</div>
					</GCTooltip>
				</Link>
			),
		},
		{
			Header: () => <p>Documents Exported</p>,
			filterable: false,
			accessor: 'search_response_metadata',
			width: 200,
			Cell: (row) => (
				<div style={styles.tableLeftDiv}>
					<p>{row.value.totalCount}</p>
				</div>
			),
		},
		{
			Header: () => <p>Export Date</p>,
			filterable: false,
			accessor: 'updatedAt',
			width: 250,
			Cell: (row) => renderDate(row),
		},
		{
			Header: () => <p>Settings Used</p>,
			filterable: false,
			width: 160,
			Cell: (row) => (
				<GCTooltip title={'Click to see setting for this export'} placement="top">
					<StyledI style={{ ...styles.tableCenterDiv, cursor: 'pointer' }}>
						<i
							className="fa fa-cogs"
							style={{ fontSize: '20px' }}
							onClick={(event) => {
								handleHideShowSearchHistorySettings(
									event.target,
									row.original.download_request_body.searchType,
									row.original.orgFilterText,
									row.original.download_request_body.format,
									true
								);
							}}
						/>
					</StyledI>
				</GCTooltip>
			),
		},
		{
			Header: () => <p>Export</p>,
			filterable: false,
			accessor: 'id',
			width: 160,
			Cell: (row) => (
				<GCTooltip title={'Click to export the files again'} placement="top">
					<StyledI
						style={{
							...styles.tableCenterDiv,
							cursor: 'pointer',
							alignItems: 'center',
							padding: '0 15px',
						}}
						onClick={() => regenerate(row.original.download_request_body, row.value)}
					>
						<i className={'fa fa-download'} />
					</StyledI>
				</GCTooltip>
			),
		},
	];
	const handleHideShowSearchHistorySettings = (
		target,
		searchType,
		orgFilterText,
		exportType = '',
		isExport = false
	) => {
		const tmpSearchHistorySettings = _.cloneDeep(searchHistorySettingsData);
		if (target?.className === 'fa fa-cogs') {
			target = target.parentNode.parentNode;
		}

		if (!searchHistorySettingsPopperOpen) {
			tmpSearchHistorySettings.searchType = searchType;
			tmpSearchHistorySettings.orgFilterText = orgFilterText;
			tmpSearchHistorySettings.exportType = exportType;
			tmpSearchHistorySettings.isExport = isExport;
			setSearchHistorySettingsData(tmpSearchHistorySettings);
			setSearchHistorySettingsPopperAnchorEl(target);
			setSearchHistorySettingsPopperOpen(true);
		} else {
			setSearchHistorySettingsData({
				searchType: '',
				orgFilterText: '',
				exportType: '',
				isExport: false,
			});
			setSearchHistorySettingsPopperAnchorEl(null);
			setSearchHistorySettingsPopperOpen(false);
		}
		setReload(!reload);
	};

	const regenerate = async (download_request_body, historyId) => {
		try {
			exportHistoryDownloading.add(historyId);
			setExportHistoryDownloading(new Set(exportHistoryDownloading));
			const exportInput = {
				cloneName: download_request_body.cloneData.clone_name,
				format: download_request_body.format,
				searchText: download_request_body.searchText,
				options: {
					limit: download_request_body.limit,
					index: download_request_body.index,
					classificationMarking: download_request_body.classificationMarking,
					cloneData: download_request_body.cloneData,
					orgFilter: download_request_body.orgFilter,
					orgFilterString: download_request_body.orgFilterString,
					typeFilter: download_request_body.typeFilter,
					typeFilterString: download_request_body.typeFilterString,
					selectedDocuments: download_request_body.selectedDocuments,
					tiny_url: download_request_body.tiny_url,
					edaSearchSettings: download_request_body.edaSearchSettings,
					sort: download_request_body.sort,
					order: download_request_body.order,
				},
			};
			const { data } = await gameChangerAPI.modularExport(exportInput);
			downloadFile(data, download_request_body.format, cloneData);
		} catch (e) {
			console.log('regen err', e);
		} finally {
			exportHistoryDownloading.delete(historyId);
			setExportHistoryDownloading(new Set(exportHistoryDownloading));
		}
	};

	const renderExportHistory = () => {
		let renderData;
		if (exportHistoryLoading) {
			renderData = (
				<div style={{ margin: '0 auto' }}>
					<LoadingIndicator customColor={gcOrange} />
				</div>
			);
		} else {
			renderData =
				exportHistory.length > 0 ? (
					renderTable(exportHistory, exportHistoryColumns)
				) : (
					<StyledPlaceHolder>Make a search to see the History</StyledPlaceHolder>
				);
		}

		return (
			<div style={{ width: '100%', height: '100%' }}>
				<div style={{ width: '100%', height: '100%' }}>{renderData}</div>
				<Popover
					onClose={() => handleHideShowSearchHistorySettings(null)}
					open={searchHistorySettingsPopperOpen}
					anchorEl={searchHistorySettingsPopperAnchorEl}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					classes={{ paper: classes.popTransparent }}
				>
					<div style={styles.searchHistorySettings}>
						<div style={styles.searchHistorySettings.overlayButtons}>
							<GCButton
								buttonColor={'transparent'}
								fontStyle={{ color: '#ffffff' }}
								style={{ minWidth: 'unset' }}
								onClick={() => handleHideShowSearchHistorySettings(null)}
							>
								<CloseIcon fontSize={'large'} />
							</GCButton>
						</div>
						<div style={styles.searchHistorySettings.overlayText}>
							<div style={styles.searchHistorySettings.overlaySearchDetails}>
								<span style={{ fontWeight: 'bold' }}>Source Filter:</span>{' '}
								{searchHistorySettingsData.orgFilterText}
							</div>
							{searchHistorySettingsData.isExport && (
								<div style={styles.searchHistorySettings.overlaySearchDetails}>
									<span style={{ fontWeight: 'bold' }}>Export Type:</span>{' '}
									{searchHistorySettingsData.exportType}
								</div>
							)}
						</div>
					</div>
				</Popover>
			</div>
		);
	};
	return (
		<div>
			<GCAccordion expanded={false} header={'EXPORT HISTORY'} itemCount={exportHistory.length}>
				{renderExportHistory()}
			</GCAccordion>
		</div>
	);
};

const SearchHistoryPanel = ({
	userData,
	handleDeleteFavoriteSearch,
	reload,
	setReload,
	saveFavoriteSearch,
	cloneData,
	classes,
}) => {
	const [searchHistory, setSearchHistory] = useState([]);
	const [searchHistoryLoading, setSearchHistoryLoading] = useState(true);
	const [searchHistorySettingsPopperAnchorEl, setSearchHistorySettingsPopperAnchorEl] = useState(null);
	const [searchHistorySettingsPopperOpen, setSearchHistorySettingsPopperOpen] = useState(false);
	const [searchHistorySettingsData, setSearchHistorySettingsData] = useState({
		searchType: '',
		orgFilterText: '',
		exportType: '',
		isExport: false,
	});
	const [searchHistoryPopperAnchorEl, setSearchHistoryPopperAnchorEl] = useState(null);
	const [searchHistoryPopperOpen, setSearchHistoryPopperOpen] = useState(false);
	const [unfavoritePopperOpen, setUnfavoritePopperOpen] = useState(false);
	const [searchHistoryFavoriteData, setSearchHistoryFavoriteData] = useState({
		favoriteName: '',
		favoriteSummary: '',
		favorite: false,
		tinyUrl: '',
		searchText: '',
		count: 0,
	});
	const [searchHistoryIdx, setSearchHistoryIdx] = useState(-1);

	useEffect(() => {
		if (userData === null) return;

		if (userData.search_history) {
			userData.search_history = userData.search_history.filter(
				(search) => search.clone_name === cloneData.clone_name
			);
			userData.search_history.forEach((search) => {
				const data = decodeTinyUrl(search.url);
				Object.assign(search, data);
			});

			setSearchHistory(userData.search_history);
			setSearchHistoryLoading(false);
		}
	}, [userData, cloneData.clone_name, cloneData.url]);

	const searchHistoryColumns = [
		{
			Header: () => <p>Search Text</p>,
			filterable: false,
			accessor: 'search',
			Cell: (row) => (
				<Link
					href={'#'}
					onClick={(event) => {
						preventDefault(event);
						// console.log('this is the URL', `${window.location.origin}/#/${row.original.tiny_url}`);
						setTimeout(() => {
							window.open(
								`${window.location.origin}/#/${row.original.tiny_url}`,
								'_blank',
								'location=yes, status=yes'
							);
						}, 1000);
					}}
					style={{ color: '#386F94' }}
				>
					<GCTooltip title={row.value} placement="top">
						<div style={styles.tableLeftDiv}>
							<p style={styles.textInCell}>{row.value}</p>
						</div>
					</GCTooltip>
				</Link>
			),
		},
		{
			Header: () => <p>Results Found</p>,
			filterable: false,
			accessor: 'num_results',
			width: 200,
			Cell: (row) => (
				<div style={styles.tableLeftDiv}>
					<p>{row.value}</p>
				</div>
			),
		},
		{
			Header: () => <p>Search Date</p>,
			filterable: false,
			accessor: 'completion_time',
			width: 250,
			Cell: (row) => renderDate(row),
		},
		{
			Header: () => <p>Settings Used</p>,
			filterable: false,
			width: 160,
			Cell: (row) => (
				<GCTooltip title={'Click to see setting for this search'} placement="top">
					<StyledI style={{ ...styles.tableCenterDiv, cursor: 'pointer' }}>
						<i
							onClick={(event) => {
								handleHideShowSearchHistorySettings(
									event.target,
									row.original.searchType,
									row.original.orgFilterText
								);
							}}
							className="fa fa-cogs"
							style={{ fontSize: '20px' }}
						/>
					</StyledI>
				</GCTooltip>
			),
		},
		{
			Header: () => <p>Favorite</p>,
			filterable: false,
			accessor: 'favorite',
			width: 160,
			Cell: (row) => (
				<GCTooltip
					title={
						!row.value
							? 'Favorite this search to track in the User Dashboard'
							: 'Unfavorite this search to stop tracking in the User Dashboard'
					}
					placement="top"
				>
					<FavoriteStyledI
						style={{
							...styles.tableCenterDiv,
							cursor: 'pointer',
							alignItems: 'center',
							padding: '0 15px',
						}}
						onClick={(event) => {
							!row.value
								? handleFavoriteSearchHistoryStarClicked(
										event.target,
										!row.value,
										row.original.tiny_url,
										row.original.search,
										row.original.num_results,
										row.index
								  )
								: unfavoriteSearchHistoryStarClicked(event.target, row.index);
						}}
					>
						<i className={row.value ? 'fa fa-star' : 'fa fa-star-o'} />
					</FavoriteStyledI>
				</GCTooltip>
			),
		},
	];

	const handleHideShowSearchHistorySettings = (
		target,
		searchType,
		orgFilterText,
		exportType = '',
		isExport = false
	) => {
		const tmpSearchHistorySettings = _.cloneDeep(searchHistorySettingsData);
		if (target?.className === 'fa fa-cogs') {
			target = target.parentNode.parentNode;
		}

		if (!searchHistorySettingsPopperOpen) {
			tmpSearchHistorySettings.searchType = searchType;
			tmpSearchHistorySettings.orgFilterText = orgFilterText;
			tmpSearchHistorySettings.exportType = exportType;
			tmpSearchHistorySettings.isExport = isExport;
			setSearchHistorySettingsData(tmpSearchHistorySettings);
			setSearchHistorySettingsPopperAnchorEl(target);
			setSearchHistorySettingsPopperOpen(true);
		} else {
			setSearchHistorySettingsData({
				searchType: '',
				orgFilterText: '',
				exportType: '',
				isExport: false,
			});
			setSearchHistorySettingsPopperAnchorEl(null);
			setSearchHistorySettingsPopperOpen(false);
		}
		setReload(!reload);
	};

	const unfavoriteSearchHistoryStarClicked = (target, index) => {
		if (target?.className.startsWith('fa fa-star')) {
			target = target.parentNode.parentNode;
		}
		if (!unfavoritePopperOpen) {
			setSearchHistoryPopperAnchorEl(target);
			setUnfavoritePopperOpen(true);
			setSearchHistoryIdx(index);
		} else {
			setSearchHistoryPopperAnchorEl(null);
			setUnfavoritePopperOpen(false);
			setSearchHistoryIdx(index);
		}
	};

	const handleFavoriteSearchHistoryStarClicked = (target, favorite, tinyUrl, searchText, count, index) => {
		if (target?.className.startsWith('fa fa-star')) {
			target = target.parentNode.parentNode;
		}
		if (!searchHistoryPopperOpen) {
			setSearchHistoryPopperAnchorEl(target);
			setSearchHistoryPopperOpen(true);
			setSearchHistoryFavoriteData({
				favoriteName: '',
				favoriteSummary: '',
				favorite,
				tinyUrl,
				searchText,
				count,
			});
		} else {
			setSearchHistoryPopperAnchorEl(null);
			setSearchHistoryPopperOpen(false);
			setSearchHistoryFavoriteData({
				favoriteName: '',
				favoriteSummary: '',
				favorite: false,
				tinyUrl: '',
				searchText: '',
				count: 0,
			});
		}
		setReload(!reload);
	};

	const renderSearchHistory = () => {
		let renderData;
		if (searchHistoryLoading) {
			renderData = (
				<div style={{ margin: '0 auto' }}>
					<LoadingIndicator customColor={gcOrange} />
				</div>
			);
		} else {
			renderData =
				searchHistory.length > 0 ? (
					renderTable(searchHistory, searchHistoryColumns)
				) : (
					<StyledPlaceHolder>Make a search to see the History</StyledPlaceHolder>
				);
		}
		return (
			<div style={{ width: '100%', height: '100%' }}>
				<div style={{ width: '100%', height: '100%' }}>{renderData}</div>
				<Popover
					onClose={() => {
						handleFavoriteSearchHistoryStarClicked(null);
					}}
					open={searchHistoryPopperOpen}
					anchorEl={searchHistoryPopperAnchorEl}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
				>
					<div className={classes.paper}>
						<div style={{ width: 330, margin: 5 }}>
							<TextField
								label={'Favorite Name'}
								value={searchHistoryFavoriteData.favoriteName}
								onChange={(event) => {
									searchHistoryFavoriteData.favoriteName = event.target.value;
									setReload(!reload);
								}}
								className={classes.textField}
								margin="none"
								size="small"
								variant="outlined"
							/>
							<TextField
								label={'Favorite Summary'}
								value={searchHistoryFavoriteData.favoriteSummary}
								onChange={(event) => {
									searchHistoryFavoriteData.favoriteSummary = event.target.value;
									setReload(!reload);
								}}
								className={classes.textArea}
								margin="none"
								size="small"
								variant="outlined"
								multiline={true}
								rows={4}
							/>
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<GCButton
									onClick={() => handleFavoriteSearchHistoryStarClicked(null, true)}
									style={{
										height: 40,
										minWidth: 40,
										padding: '2px 8px 0px',
										fontSize: 14,
										margin: '16px 0px 0px 10px',
									}}
									isSecondaryBtn={true}
								>
									Cancel
								</GCButton>
								<GCButton
									onClick={() => {
										handleSaveSearch();
									}}
									style={{
										height: 40,
										minWidth: 40,
										padding: '2px 8px 0px',
										fontSize: 14,
										margin: '16px 0px 0px 10px',
									}}
								>
									Save
								</GCButton>
							</div>
						</div>
					</div>
				</Popover>

				<Popover
					onClose={() => {
						unfavoriteSearchHistoryStarClicked(null);
					}}
					open={unfavoritePopperOpen}
					anchorEl={searchHistoryPopperAnchorEl}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
				>
					<div style={{ padding: '0px 15px 10px' }}>
						<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
							<CloseButton
								onClick={() => {
									setUnfavoritePopperOpen(false);
									setSearchHistoryIdx(-1);
								}}
							>
								<CloseIcon fontSize="small" />
							</CloseButton>
						</div>
						<div style={{ width: 350, margin: 5 }}>
							<div style={{ margin: '65px 15px 0' }}>
								Are you sure you want to delete this favorite? You will lose any comments made.
							</div>
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<GCButton
									onClick={() => {
										setUnfavoritePopperOpen(false);
										setSearchHistoryIdx(-1);
									}}
									isSecondaryBtn={true}
									style={{
										height: 40,
										minWidth: 40,
										padding: '2px 8px 0px',
										fontSize: 14,
										margin: '16px 0px 0px 10px',
									}}
								>
									No
								</GCButton>
								<GCButton
									onClick={() => {
										setUnfavoritePopperOpen(false);
										setSearchHistorySettingsPopperAnchorEl(null);
										handleDeleteFavoriteSearch(searchHistoryIdx);
									}}
									style={{
										height: 40,
										minWidth: 40,
										padding: '2px 8px 0px',
										fontSize: 14,
										margin: '16px 10px 0px',
										marginRight: 10,
									}}
								>
									Yes
								</GCButton>
							</div>
						</div>
					</div>
				</Popover>

				<Popover
					onClose={() => handleHideShowSearchHistorySettings(null)}
					open={searchHistorySettingsPopperOpen}
					anchorEl={searchHistorySettingsPopperAnchorEl}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					classes={{ paper: classes.popTransparent }}
				>
					<div style={styles.searchHistorySettings}>
						<div style={styles.searchHistorySettings.overlayButtons}>
							<GCButton
								buttonColor={'transparent'}
								fontStyle={{ color: '#ffffff' }}
								style={{ minWidth: 'unset' }}
								onClick={() => handleHideShowSearchHistorySettings(null)}
							>
								<CloseIcon fontSize={'large'} />
							</GCButton>
						</div>
						<div style={styles.searchHistorySettings.overlayText}>
							<div style={styles.searchHistorySettings.overlaySearchDetails}>
								<span style={{ fontWeight: 'bold' }}>Source Filter:</span>{' '}
								{searchHistorySettingsData.orgFilterText}
							</div>
							{searchHistorySettingsData.isExport && (
								<div style={styles.searchHistorySettings.overlaySearchDetails}>
									<span style={{ fontWeight: 'bold' }}>Export Type:</span>{' '}
									{searchHistorySettingsData.exportType}
								</div>
							)}
						</div>
					</div>
				</Popover>
			</div>
		);
	};

	const handleSaveSearch = () => {
		const { favoriteName, favoriteSummary, favorite, tinyUrl, searchText, count } = searchHistoryFavoriteData;
		saveFavoriteSearch(favoriteName, favoriteSummary, favorite, tinyUrl, searchText, count);
		setSearchHistoryFavoriteData({
			favoriteName: '',
			favoriteSummary: '',
			favorite: false,
			tinyUrl: '',
			searchText: '',
			count: 0,
		});
		setSearchHistoryPopperAnchorEl(null);
		setSearchHistoryPopperOpen(false);
	};

	return (
		<div style={{ marginBottom: '10px' }}>
			<GCAccordion expanded={false} header={'SEARCH HISTORY'} itemCount={searchHistory.length}>
				{renderSearchHistory()}
			</GCAccordion>
		</div>
	);
};

SearchHistoryPanel.propTypes = {
	searchHistoryLoading: PropTypes.bool.isRequired,
	searchHistory: PropTypes.array,
};

ExportHistoryPanel.propTypes = {
	exportHistoryLoading: PropTypes.bool.isRequired,
	exportHistory: PropTypes.array,
};

export { SearchHistoryPanel, ExportHistoryPanel };
