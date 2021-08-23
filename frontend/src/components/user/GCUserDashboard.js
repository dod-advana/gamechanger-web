import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import GameChangerAPI from '../api//gameChanger-service-api';
import { trackEvent } from "../telemetry/Matomo";
import { Tabs, Tab, TabPanel, TabList } from "react-tabs";
import { Typography } from "@material-ui/core";
import GCTooltip from "../common/GCToolTip"
import { backgroundGreyDark, backgroundWhite } from "../../components/common/gc-colors";
import { gcOrange } from "../../components/common/gc-colors";
import Pagination from "react-js-pagination";
import LoadingIndicator from "@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Icon from "@material-ui/core/Icon";
import GCButton from "../common/GCButton";
import { downloadFile } from '../export/ExportResultsDialog';
import Popover from "@material-ui/core/Popover";
import Popper from "@material-ui/core/Popper";
import Link from "@material-ui/core/Link";
import Badge from "@material-ui/core/Badge";
import {decodeTinyUrl, getTrackingNameForFactory} from "../../gamechangerUtils";
import FavoriteCard from "../cards/GCFavoriteCard";
import ReactTable from "react-table";
import TextField from "@material-ui/core/TextField";
import Config from '../../config/config.js';
import GCAccordion from "../common/GCAccordion";
import moment from 'moment';

const _ = require('lodash');

const gameChangerAPI = new GameChangerAPI();

const StyledBadge = withStyles((theme) => ({
	badge: {
		backgroundColor: '#AD0000',
		right: '-11px',
		top: 0,
		color: 'white',
		fontSize: 12,
		minWidth: 15,
		width: 16,
		height: 16
	}
}))(Badge);

const CloseButton = styled.div`
	padding: 6px;
	background-color: white;
	border-radius: 5px;
	color: #8091A5 !important;
	border: 1px solid #B0B9BE;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: .4;
	position: absolute;
	right: 15px;
	top: 15px;
`;

const StyledPlaceHolder = styled.div`
	font-family: Montserrat;
	font-size: 20px;
	font-weight: 300;
	text-align: center;
`;

const StyledI = styled.div`
	> i {
		color: #000000;
		cursor: pointer;
		font-size: 26px;
		
		:hover {
			color: #E9691D;
		}
	}
`;

const FavoriteStyledI = styled.div`
	> i {
		cursor: pointer;
		font-size: 26px;
		
		:hover {
			color: #E9691D;
		}
	}
	
	> .fa-star {
		color: #E9691D;
	}
	
	> .fa-star-o {
		color: rgb(200, 200, 200);
	}
`;

const useStyles = makeStyles((theme) => ({
	root: {
		padding: 0,

		'&:hover': {
			backgroundColor: 'transparent',
		},
	},
	popTransparent: {
		background: 'none',
		boxShadow: 'unset'
	},
	paper: {
		border: '1px solid',
		padding: theme.spacing(1),
		backgroundColor: theme.palette.background.paper,
	},
	textField: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		marginTop: '14px',
		paddingBottom: '8px',
		height: 'auto',
		width: '322px',
		'& .MuiFormHelperText-root': {
			fontSize: 14,
			marginLeft: 'unset'
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				height: '24px',
				fontSize: '14px'
			}
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: props => props.error ? 'red' : 'inherit',
			}
		},
	},
	textArea: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		marginTop: '14px',
		paddingBottom: '8px',
		height: 'auto',
		width: '322px',
		'& .MuiFormHelperText-root': {
			fontSize: 14,
			marginLeft: 'unset'
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				fontSize: '14px'
			}
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: props => props.error ? 'red' : 'inherit',
			}
		},
	},
	icon: {
		borderRadius: 4,
		color: '#DFE6EE',
		width: 20,
		height: 20,
		boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
		backgroundColor: '#ffffff',
		backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
		'$root.Mui-focusVisible &': {
			outline: '2px auto #DFE6EE',
			outlineOffset: 2,
		},
		'input:hover ~ &': {
			backgroundColor: '#ebf1f5',
		},
		'input:disabled ~ &': {
			boxShadow: 'none',
			background: 'rgba(206,217,224,.5)',
		},
	},
	checkedIcon: {
		backgroundColor: '#ffffff',
		color: '#E9691D',
		backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
		'&:before': {
			display: 'block',
			width: 20,
			height: 20,
			backgroundImage:
			"url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
			" fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
			"1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23E9691D'/%3E%3C/svg%3E\")",
			content: '""',
		},
		'input:hover ~ &': {
			backgroundColor: '#ebf1f5',
		},
	},
}));

const RESULTS_PER_PAGE = 12;

const GCUserDashboard = (props) => {
	
	const {
		userData,
		updateUserData,
		handleSaveFavoriteDocument,
		handleDeleteSearch,
		saveFavoriteSearch,
		clearDashboardNotification,
		handleFavoriteTopic,
		handleFavoriteOrganization,
		checkUserInfo,
		cloneData
	} = props;

	const [tabIndex, setTabIndex] = useState(0);

	// const [exportHistoryPage, setExportHistoryPage] = useState(1);
	// const [exportHistoryTotalCount, setExportHistoryTotalCount] = useState(0);
	const [exportHistory, setExportHistory] = useState([]);
	const [exportHistoryLoading, setExportHistoryLoading] = useState(true);
	const [exportHistoryDownloading, setExportHistoryDownloading] = useState(new Set());

	// const [searchHistoryPage, setSearchHistoryPage] = useState(1);
	// const [searchHistoryTotalCount, setSearchHistoryTotalCount] = useState(0);
	const [searchHistory, setSearchHistory] = useState([]);
	const [searchHistoryLoading, setSearchHistoryLoading] = useState(true);

	const [favoriteDocumentsLoading, setFavoriteDocumentsLoading] = useState(true);
	const [documentFavoritesPage, setDocumentFavoritesPage] = useState(1);
	const [documentFavoritesTotalCount, setDocumentFavoritesTotalCount] = useState(0);
	const [favoriteDocuments, setFavoriteDocuments] = useState([]);
	const [favoriteDocumentsSlice, setFavoriteDocumentsSlice] = useState([]);

	const [favoriteSearchesLoading, setFavoriteSearchesLoading] = useState(true);
	const [searchFavoritesPage, setSearchFavoritesPage] = useState(1);
	const [searchFavoritesTotalCount, setSearchFavoritesTotalCount] = useState(0);
	const [favoriteSearches, setFavoriteSearches] = useState([]);
	const [favoriteSearchesSlice, setFavoriteSearchesSlice] = useState([]);

	const [favoriteTopicsLoading, setFavoriteTopicsLoading] = useState(false);
	const [topicFavoritesPage, setTopicFavoritesPage] = useState(1);
	const [topicFavoritesTotalCount, setTopicFavoritesTotalCount] = useState(0);
	const [favoriteTopics, setFavoriteTopics] = useState([]);
	const [favoriteTopicsSlice, setFavoriteTopicsSlice] = useState([]);

	const [favoriteOrganizationsLoading, setFavoriteOrganizationsLoading] = useState(false);
	const [organizationFavoritesPage, setOrganizationFavoritesPage] = useState(1);
	const [organizationFavoritesTotalCount, setOrganizationFavoritesTotalCount] = useState(0);
	const [favoriteOrganizations, setFavoriteOrganizations] = useState([]);
	const [favoriteOrganizationsSlice, setFavoriteOrganizationsSlice] = useState([]);

	const [searchHistoryPopperAnchorEl, setSearchHistoryPopperAnchorEl] = useState(null);
	const [searchHistoryPopperOpen, setSearchHistoryPopperOpen] = useState(false);
	const [unfavoritePopperOpen, setUnfavoritePopperOpen] = useState(false);
	const [searchHistoryFavoriteData, setSearchHistoryFavoriteData] = useState({ favoriteName: '',
		favoriteSummary: '', favorite: false, tinyUrl: '', searchText: '', count: 0 });
	const [searchHistoryIdx, setSearchHistoryIdx] = useState(-1);

	const [searchHistorySettingsPopperAnchorEl, setSearchHistorySettingsPopperAnchorEl] = useState(null);
	const [searchHistorySettingsPopperOpen, setSearchHistorySettingsPopperOpen] = useState(false);
	const [searchHistorySettingsData, setSearchHistorySettingsData] = useState({searchType: '',
		orgFilterText: '', exportType: '', isExport: false});

	const [apiKeyPopperAnchorEl, setAPIKeyPopperAnchorEl] = useState(null);
	const [apiKeyPopperOpen, setAPIKeyPopperOpen] = useState(false);

	const [reload, setReload] = useState(false);

	const classes = useStyles();

	const preventDefault = (event) => event.preventDefault();

	const searchHistoryColumns = [
		{
			Header: () => <p>Search Text</p>,
			filterable: false,
			accessor: 'search',
			Cell: row => (
				<Link href={"#"} onClick={(event)=> {
					preventDefault(event);
					window.open(`${window.location.origin}/#/${row.original.tiny_url}`, "_blank");
				}}
				style={{ color: '#386F94' }}
				>
					<div style={styles.tableLeftDiv}>
						<p>{row.value}</p>
					</div>
				</Link>
			)
		},
		{
			Header: () => <p>Results Found</p>,
			filterable: false,
			accessor: 'num_results',
			width: 200,
			Cell: row => (
				<div style={styles.tableLeftDiv}>
					<p>{row.value}</p>
				</div>
			)
		},
		{
			Header: () => <p>Search Type</p>,
			filterable: false,
			accessor: 'searchType',
			width: 200,
			Cell: row => (
				<div style={styles.tableLeftDiv}>
					<p>{row.value}</p>
				</div>
			)
		},
		{
			Header: () => <p>Search Date</p>,
			filterable: false,
			accessor: 'completion_time',
			width: 250,
			Cell: row => (
				<div style={styles.tableLeftDiv}>
					<p>{row.value}</p>
				</div>
			)
		},
		{
			Header: () => <p>Settings Used</p>,
			filterable: false,
			width: 160,
			Cell: row => (
				<GCTooltip title={"Click to see setting for this search"} placement="top">
					<StyledI style={{...styles.tableCenterDiv, cursor: 'pointer'}}>
						<i className="fa fa-cogs" style={{fontSize: '20px'}} onClick={(event) => {
							handleHideShowSearchHistorySettings(event.target, row.original.searchType, row.original.orgFilterText);
							}}
						/>
					</StyledI>
				</GCTooltip>
			)
		},
		{
			Header: () => <p>Favorite</p>,
			filterable: false,
			accessor: 'favorite',
			width: 160,
			Cell: row => (
				<GCTooltip title={'Favorite a search to track in the User Dashboard'} placement='top'>
					<FavoriteStyledI style={{ ...styles.tableCenterDiv, cursor: "pointer", alignItems: 'center', padding: '0 15px' }}
						 onClick={(event) =>
							 handleFavoriteSearchHistoryStarClicked(event.target, !row.value,
								 row.original.tiny_url, row.original.search, row.original.num_results, row.index)
						 }
					>
						<i className={row.value ? "fa fa-star" : "fa fa-star-o"}/>
					</FavoriteStyledI>
				</GCTooltip>
			)
		}
	]

	const exportHistoryColumns = [
		{
			Header: () => <p>Search Text</p>,
			filterable: false,
			accessor: 'download_request_body.searchText',
			Cell: row => (
				<Link href={"#"} onClick={(event)=> {
					preventDefault(event);
					regenerate(row.original.download_request_body, row.original.id);
				}}
				style={{ color: '#386F94' }}
				>
					<div style={styles.tableLeftDiv}>
						<p>{row.value}</p>
					</div>
				</Link>
			)
		},
		{
			Header: () => <p>Documents Exported</p>,
			filterable: false,
			accessor: 'search_response_metadata',
			width: 200,
			Cell: row => (
				<div style={styles.tableLeftDiv}>
					<p>{row.value.totalCount}</p>
				</div>
			)
		},
		{
			Header: () => <p>Search Type</p>,
			filterable: false,
			accessor: 'download_request_body.searchType',
			width: 200,
			Cell: row => (
				<div style={styles.tableLeftDiv}>
					<p>{row.value}</p>
				</div>
			)
		},
		{
			Header: () => <p>Export Date</p>,
			filterable: false,
			accessor: 'updatedAt',
			width: 250,
			Cell: row => (
				<div style={styles.tableLeftDiv}>
					<p>{row.value}</p>
				</div>
			)
		},
		{
			Header: () => <p>Settings Used</p>,
			filterable: false,
			width: 160,
			Cell: row => (
				<GCTooltip title={"Click to see setting for this export"} placement="top">
					<StyledI style={{...styles.tableCenterDiv, cursor: 'pointer'}}>
						<i className="fa fa-cogs" style={{fontSize: '20px'}} onClick={(event) => {
							handleHideShowSearchHistorySettings(event.target, row.original.download_request_body.searchType, row.original.orgFilterText,
								row.original.download_request_body.format, true);
							}}
						/>
					</StyledI>
				</GCTooltip>
			)
		},
		{
			Header: () => <p>Export</p>,
			filterable: false,
			accessor: 'id',
			width: 160,
			Cell: row => (
				<GCTooltip title={'Click to export the files again'} placement='top'>
					<StyledI style={{ ...styles.tableCenterDiv, cursor: "pointer", alignItems: 'center', padding: '0 15px' }}
						 onClick={(event) =>
							 regenerate(row.original.download_request_body, row.value)
						 }
					>
						<i className={"fa fa-download"}/>
					</StyledI>
				</GCTooltip>
			)
		}
	]

	useEffect(() => {
		if (userData === null) return;

		// Decode url data
		if (userData.favorite_searches) {
			userData.favorite_searches = userData.favorite_searches.filter(search=>search.url.split('?')[0]===cloneData.clone_name)
			userData.favorite_searches.forEach(search => {
				const data = decodeTinyUrl(search.url);
				Object.assign(search, data);
			});

			setFavoriteSearches(userData.favorite_searches);
			setSearchFavoritesTotalCount(userData.favorite_searches? userData.favorite_searches.length : 0);
			setFavoriteSearchesSlice(userData.favorite_searches.slice(0, RESULTS_PER_PAGE));
			setFavoriteSearchesLoading(false);
		}

		if (userData.search_history) {
			userData.search_history = userData.search_history.filter(search=>search.clone_name===cloneData.clone_name)
			userData.search_history.forEach(search => {
				const data = decodeTinyUrl(search.url);
				Object.assign(search, data);
			});

        	setSearchHistory(userData.search_history);
        	setSearchHistoryLoading(false);
		}

		if (userData.favorite_documents) {
			setFavoriteDocuments(userData.favorite_documents);
			setDocumentFavoritesTotalCount(userData.favorite_documents ? userData.favorite_documents.length : 0);
			setFavoriteDocumentsSlice(userData.favorite_documents.slice(0, RESULTS_PER_PAGE));
			setFavoriteDocumentsLoading(false);
		}

		if (userData.export_history) {
			userData.export_history = userData.export_history.filter(search=>search.download_request_body.cloneData.clone_name===cloneData.clone_name)
			userData.export_history.forEach(hist => {

				let orgFilterText = '';
				if(hist.download_request_body && hist.download_request_body.orgFilterQuery && hist.download_request_body.orgFilterQuery === '*') {
					orgFilterText = 'All sources';
				} else if (hist.download_request_body && hist.download_request_body.orgFilter) {
					Object.keys(hist.download_request_body.orgFilter).forEach(key => {
						if (hist.download_request_body.orgFilter[key]) {
							orgFilterText += `${key}, `;
						}
					});
					orgFilterText = orgFilterText.slice(0, orgFilterText.length -2);
				}
				hist.orgFilterText = orgFilterText;

			});

			setExportHistory(userData.export_history);
			setExportHistoryLoading(false);
		}

		if (userData.favorite_topics) {
			setFavoriteTopics(userData.favorite_topics)
			setTopicFavoritesTotalCount(userData.favorite_topics ? userData.favorite_topics.length : 0);
			setFavoriteTopicsSlice(userData.favorite_topics.slice(0, RESULTS_PER_PAGE));
			setFavoriteTopicsLoading(false);
		}

		if (userData.favorite_organizations) {
			setFavoriteOrganizations(userData.favorite_organizations)
			setOrganizationFavoritesTotalCount(userData.favorite_organizations ? userData.favorite_organizations.length : 0);
			setFavoriteOrganizationsSlice(userData.favorite_organizations.slice(0, RESULTS_PER_PAGE));
			setFavoriteOrganizationsLoading(false);
		}

	}, [userData, cloneData.clone_name]);

	useEffect(() => {

	}, [reload]);

	const handleTabClicked = (tabIndex, lastIndex, event) => {
		const tabName = event.target.title;
		trackEvent(getTrackingNameForFactory(cloneData.clone_name), "UserDashboardTab", "onClick", tabName);
		setTabIndex(tabIndex);
	}

	const handlePaginationChange = (page, panel) => {
		switch (panel) {
			case 'searchHistory':
				// setSearchHistoryPage(page);
				break;
			case 'exportHistory':
				// setExportHistoryPage(page);
				break;
			case 'searchFavorites':
				setSearchFavoritesPage(page);
				setFavoriteSearchesSlice(favoriteSearches.slice((page - 1 ) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE));
				break;
			case 'documentsFavorites':
				setDocumentFavoritesPage(page);
				setFavoriteDocumentsSlice(favoriteDocuments.slice((page - 1 ) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE));
				break;
			case 'topicFavorites':
				setTopicFavoritesPage(page);
				setFavoriteTopicsSlice(favoriteTopics.slice((page - 1 ) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE));
				break;
			case 'organizationFavorites':
				setOrganizationFavoritesPage(page);
				setFavoriteOrganizationsSlice(favoriteOrganizations.slice((page - 1 ) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE));
				break;
			default:
		}
	}

	const renderFavorites = () => {
		return (
			<div>
				{Config.GAMECHANGER.SHOW_TOPICS && cloneData.clone_name === 'gamechanger' &&
					<GCAccordion expanded={false} header={'FAVORITE TOPICS'} itemCount={topicFavoritesTotalCount}>
						{ renderTopicFavorites() }
					</GCAccordion>
				}
				{ cloneData.clone_name === 'gamechanger' &&
				<GCAccordion expanded={false} header={'FAVORITE ORGANIZATIONS'} itemCount={organizationFavoritesTotalCount}>
					{ renderOrganizationFavorites() }
				</GCAccordion>
				}
				{ cloneData.clone_name === 'gamechanger' && 
				<GCAccordion expanded={false} header={'FAVORITE DOCUMENTS'} itemCount={documentFavoritesTotalCount}>
					{ renderDocumentFavorites() }
				</GCAccordion>
				}

				<GCAccordion expanded={true} header={'FAVORITE SEARCHES'} itemCount={searchFavoritesTotalCount}>
					{ renderSearchFavorites() }
				</GCAccordion>
				
				

				
			</div>
		);
	}

	const renderSearchFavorites = () => {
		return (
			<div style={{width: '100%', height: '100%'}}>
				{favoriteSearchesLoading ? (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={gcOrange} />
					</div>
				) : (
					favoriteSearchesSlice.length > 0 ? (
						<div style={{ height: '100%', overflow: 'hidden', marginBottom: 10}}>
						<div className={"col-xs-12"} style={{ padding: 0 }}>
							<div className="row" style={{ marginLeft: 0, marginRight: 0 }}>
								{_.map(favoriteSearchesSlice, (search, idx) => {
									return renderFavoriteSearchCard(search, idx)
								})}
							</div>
						</div>
					</div>
					) : (
						<StyledPlaceHolder>Favorite a search to see it listed here</StyledPlaceHolder>
					)
				)
				}

				{favoriteSearchesSlice.length > 0 &&
					<div className='gcPagination'>
						<Pagination
							activePage={searchFavoritesPage}
							itemsCountPerPage={RESULTS_PER_PAGE}
							totalItemsCount={searchFavoritesTotalCount}
							pageRangeDisplayed={8}
							onChange={page => {
								trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'UserDashboardSearchFavorites','pagination', page);
								handlePaginationChange(page, 'searchFavorites');
							}}
						/>
					</div>
				}
			</div>
		);
	}

	const renderFavoriteSearchCard = (search, idx) => {
		const toggleActive = () => {
			search.active = !search.active
		}

		const createdDate = moment(Date.parse(search.createdAt)).utc().format("YYYY-MM-DD HH:mm UTC");

		const searchDetails = 
		<>
			<GCTooltip title={search.search_text} placement="top">
				<div className={'search-text'}>Search Text: {search.search_text.length > 55 ? search.search_text.slice(0,40)+'...' : search.search_text}</div>
			</GCTooltip>
			<div className={'stats-details'}>
				<div className={'favorited-date'}>{createdDate}</div>
				<div className={'stats-details-stat-div'}>
					<GCTooltip title={'Number of documents found in search'} placement="top">
						<div className={'stats-stat'}>
							<span className={'stats-text'}>{search.document_count}</span>
							<Icon className="fa fa-file-pdf-o" />
						</div>
					</GCTooltip>
					<GCTooltip title={''} placement="top">
						<div className={'stats-stat'}>
							{/* <span className={'stats-text'}>{search.favorited}</span> */}
							<Icon className="fa fa-share" />
						</div>
					</GCTooltip>
					<GCTooltip title={"Click to see comments"} placement="top">
						<div className={'stats-comment'}>
							<Icon className="fa fa-comment" onClick={() => {
								toggleActive();
								setReload(!reload);
								}}
							/>
						</div>
					</GCTooltip>
				</div>
			</div>
		</>

		const searchOverlayText = <div>{search.search_summary}</div>;

		let searchFields = "";
		for (const field of search.searchFields) {
			searchFields += `[${field}] `
		}
		
		const searchSettings = 			
		<>
			<div style={{ textAlign: 'left', margin: '0 0 10px 0' }}><span style={{fontWeight: 'bold'}}>Organization Filters:</span> {search.orgFilterText}</div> 
			<div style={{ textAlign: 'left', margin: '0 0 10px 0' }}><span style={{fontWeight: 'bold'}}>Search Filters:</span> {searchFields}</div> 
			<div style={{ textAlign: 'left', margin: '0 0 10px 0' }}><span style={{fontWeight: 'bold'}}>Publication Date:</span> {search.pubDate}</div> 
			<div style={{ textAlign: 'left', margin: '0 0 10px 0' }}><span style={{fontWeight: 'bold'}}>Include Cancelled:</span> {search.isRevoked ? 'true' : 'false'}</div> 
		</>;


		return (
			<FavoriteCard
				key={`search-favorite-${idx}`}
				cardTitle={search.search_name}
				tiny_url={search.tiny_url}
				handleDeleteFavorite={handleDeleteFavoriteSearch}
				summary={searchSettings}
				details={searchDetails}
				overlayText={searchOverlayText}
				reload={reload}
				setReload={setReload}
				idx={idx}
				active={search.active}
				toggleActive={toggleActive}
				updated={search.updated_results}
				cloneData={cloneData}
			/>
		)
	}

	const handleDeleteFavoriteSearch = async (idx) => {
		favoriteSearchesSlice[idx].favorite = false;
		handleDeleteSearch(favoriteSearchesSlice[idx]);
		updateUserData();
	}

	const renderDocumentFavorites = () => {
		return (
			<div style={{width: '100%', height: '100%'}}>

				{favoriteDocumentsLoading ? (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={gcOrange} />
					</div>
				) : (
					favoriteDocumentsSlice.length > 0 ? (
					<div style={{ height: '100%', overflow: 'hidden', marginBottom: 10}}>
						<div className={"col-xs-12"} style={{ padding: 0 }}>
							<div className="row" style={{ marginLeft: 0, marginRight: 0 }}>
								{_.map(favoriteDocumentsSlice, (document, idx) => {
									return renderFavoriteDocumentCard(document, idx)
								})}
							</div>
						</div>
					</div>
					) : (
						<StyledPlaceHolder>Favorite a document to see it listed here</StyledPlaceHolder>
					)
				)}

				{favoriteDocumentsSlice.length > 0 &&
					<div className='gcPagination'>
						<Pagination
							activePage={documentFavoritesPage}
							itemsCountPerPage={RESULTS_PER_PAGE}
							totalItemsCount={documentFavoritesTotalCount}
							pageRangeDisplayed={8}
							onChange={page => {
								trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'UserDashboardDocumentFavorites', 'pagination', page);
								handlePaginationChange(page, 'documentsFavorites');
							}}
						/>
					</div>
				}
			</div>
		);
	}

	const renderFavoriteDocumentCard = (document, idx) => {

		const toggleActive = () => {
			document.active = !document.active
		}

		const createdDate = moment(Date.parse(document.createdAt)).utc().format("YYYY-MM-DD HH:mm UTC");

		const documentDetails = 
			<>
				<div className={'buttons-div'}>
					<GCButton
						onClick={() => handleAcknowledgeUpdatesToDocs(idx, 'updated')}
						style={{ visibility: document.updated ? null : 'hidden' }}
						buttonColor={'#059FD9'}
						textStyle={{color: '#ffffff', fontFamily: 'Noto Sans Medium', fontSize: 12}}
					>
						Updated
					</GCButton>
					<GCButton
						onClick={() => handleAcknowledgeUpdatesToDocs(idx, 'archived')}
						style={{ visibility: document.archived ? null : 'hidden' }}
						buttonColor={'#32124D'}
						textStyle={{color: '#ffffff', fontFamily: 'Noto Sans Medium', fontSize: 12}}
					>
						Archived
					</GCButton>
					<GCButton
						onClick={() => handleAcknowledgeUpdatesToDocs(idx, 'removed')}
						style={{ visibility: document.removed ? null : 'hidden' }}
						buttonColor={'#E9691D'}
						textStyle={{color: '#ffffff', fontFamily: 'Noto Sans Medium', fontSize: 12 }}
					>
						Removed
					</GCButton>
				</div>
				<div className={'stats-details'}>
					<div className={'favorited-date'}>{createdDate}</div>
					<div className={'stats-details-stat-div'}>
						<GCTooltip title={'The number of times this document has been favorited by others'} placement="top">
							<div className={'stats-stat'}>
								<span className={'stats-text'}>{document.favorited}</span>
								<Icon className="fa fa-heart-o" />
							</div>
						</GCTooltip>
						<GCTooltip title={'Click to see document comments'} placement="top">
							<div className={'stats-comment'}>
								<Icon className="fa fa-comment" onClick={() => {
									document.active = !document.active;
									setReload(!reload);
									}}
								/>
							</div>
						</GCTooltip>
					</div>
				</div>
			</>

		return (
			<FavoriteCard
				key={`document-favorite-${idx}`}
				cardTitle={document.title}
				isDocument={true}
				documentObject={document}
				handleDeleteFavorite={handleDeleteFavoriteDocument}
				summary={document.summary}
				details={documentDetails}
				overlayText={document.favorite_summary}
				reload={reload}
				setReload={setReload}
				idx={idx}
				active={document.active}
				toggleActive={toggleActive}
				cloneData={cloneData}
			/>
		)
	}

	const renderTopicFavorites = () => {
		return (
			<div style={{width: '100%', height: '100%'}}>
				{favoriteTopicsLoading ? (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={gcOrange} />
					</div>
				) : (
				favoriteTopicsSlice.length > 0 ? (
				<div style={{ height: '100%', overflow: 'hidden', marginBottom: 10}}>
					<div className={"col-xs-12"} style={{ padding: 0 }}>
						<div className="row" style={{ marginLeft: 0, marginRight: 0 }}>
							{_.map(favoriteTopicsSlice, (topic, idx) => {
								return renderFavoriteTopicCard(topic, idx)
							})}
						</div>
					</div>
				</div>
				) : (
					<StyledPlaceHolder>Favorite a topic to see it listed here</StyledPlaceHolder>
					)
				)
			 }

				{favoriteTopicsSlice.length > 0 &&
					<div className='gcPagination'>
						<Pagination
							activePage={topicFavoritesPage}
							itemsCountPerPage={RESULTS_PER_PAGE}
							totalItemsCount={topicFavoritesTotalCount}
							pageRangeDisplayed={8}
							onChange={page => {
								trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'UserDashboardTopicFavorites', 'pagination', page);
								handlePaginationChange(page, 'topicFavorites');
							}}
						/>
					</div>
				}
			</div>
		)
	};

	const renderFavoriteTopicCard = (topic, idx) => {

		const toggleActive = () => {
			topic.active = !topic.active
		}

		const createdDate = moment(Date.parse(topic.createdAt)).utc().format("YYYY-MM-DD HH:mm UTC");

		const searchDetails = 
			<div className={'stats-details'}>
				<div className={'favorited-date'}>{createdDate}</div>
				<div className={'stats-details-stat-div'}>
					<GCTooltip title={'The number of times this topic has been favorited by others'} placement="top">
						<div className={'stats-stat'}>
							<span className={'stats-text'}>{topic.favorited}</span>
							<Icon className="fa fa-heart-o" />
						</div>
					</GCTooltip>
					<GCTooltip title={"Click to see comments"} placement="top">
						<div className={'stats-comment'}>
							<Icon className="fa fa-comment" onClick={() => {
								toggleActive();
								setReload(!reload);
								}}
							/>
						</div>
					</GCTooltip>
				</div>
			</div>

		return (
			<FavoriteCard
				key={`topic-favorite-${idx}`}
				cardTitle={topic.topic_name}
				handleDeleteFavorite={handleDeleteFavoriteTopic}
				details={searchDetails}
				overlayText={topic.topic_summary}
				reload={reload}
				setReload={setReload}
				idx={idx}
				active={topic.active}
				toggleActive={toggleActive}
				isTopic
				cloneData={cloneData}
			/>
		)
	};

	const handleDeleteFavoriteTopic = async (idx) => {
		favoriteTopicsSlice[idx].favorite = false;
		handleFavoriteTopic(favoriteTopicsSlice[idx]);
		updateUserData();
	}

	const renderOrganizationFavorites = () => {
		return (
			<div style={{width: '100%', height: '100%'}}>
				{favoriteOrganizationsLoading ? (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={gcOrange} />
					</div>
				) : (
				favoriteOrganizationsSlice.length > 0 ? (
				<div style={{ height: '100%', overflow: 'hidden', marginBottom: 10}}>
					<div className={"col-xs-12"} style={{ padding: 0 }}>
						<div className="row" style={{ marginLeft: 0, marginRight: 0 }}>
							{_.map(favoriteOrganizationsSlice, (organization, idx) => {
								return renderFavoriteOrganizationCard(organization, idx)
							})}
						</div>
					</div>
				</div>
				) : (
					<StyledPlaceHolder>Favorite an organization to see it listed here</StyledPlaceHolder>
					)
				)
			 }

				{favoriteOrganizationsSlice.length > 0 &&
					<div className='gcPagination'>
						<Pagination
							activePage={organizationFavoritesPage}
							itemsCountPerPage={RESULTS_PER_PAGE}
							totalItemsCount={organizationFavoritesTotalCount}
							pageRangeDisplayed={8}
							onChange={page => {
								// trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'UserDashboardTopicFavorites', 'pagination', page);
								handlePaginationChange(page, 'organizationFavorites');
							}}
						/>
					</div>
				}
			</div>
		)
	};

	const renderFavoriteOrganizationCard = (organization, idx) => {
		const toggleActive = () => {
			organization.active = !organization.active
		}

		const createdDate = moment(Date.parse(organization.createdAt)).utc().format("YYYY-MM-DD HH:mm UTC");

		const searchDetails = 
			<div className={'stats-details'}>
				<div className={'favorited-date'}>{createdDate}</div>
				<div className={'stats-details-stat-div'}>
					<GCTooltip title={'The number of times this organization has been favorited by others'} placement="top">
						<div className={'stats-stat'}>
							<span className={'stats-text'}>{organization.favorited}</span>
							<Icon className="fa fa-heart-o" />
						</div>
					</GCTooltip>
					<GCTooltip title={"Click to see comments"} placement="top">
						<div className={'stats-comment'}>
							<Icon className="fa fa-comment" onClick={() => {
								toggleActive();
								setReload(!reload);
								}}
							/>
						</div>
					</GCTooltip>
				</div>
			</div>
		return (
			<FavoriteCard
				key={`organization-favorite-${idx}`}
				cardTitle={organization.organization_name}
				handleDeleteFavorite={handleDeleteFavoriteOrganization}
				details={searchDetails}
				overlayText={organization.organization_summary}
				reload={reload}
				setReload={setReload}
				idx={idx}
				active={organization.active}
				toggleActive={toggleActive}
				isOrganization
				cloneData={cloneData}
			/>
		)
	};

	const handleDeleteFavoriteOrganization = async (idx) => {
		favoriteOrganizationsSlice[idx].favorite = false;
		handleFavoriteOrganization(favoriteOrganizationsSlice[idx]);
		updateUserData();
	}
	
	const renderHistory = () => {
		return (
			<div>
				<GCAccordion expanded={false} header={'EXPORT HISTORY'} itemCount={exportHistory.length}>
					{ renderExportHistory() }
				</GCAccordion>
				
				<GCAccordion expanded={true} header={'SEARCH HISTORY'} itemCount={searchHistory.length}>
					{ renderSearchHistory() }
				</GCAccordion>
			</div>
		);
	}

	const regenerate = async (download_request_body, historyId) => {
		try {
			exportHistoryDownloading.add(historyId);
			setExportHistoryDownloading(new Set(exportHistoryDownloading));
			const exportInput = {
				cloneName: download_request_body.cloneData.clone_name,
				format: download_request_body.format,
				searchText: download_request_body.searchText,
				options:{
					limit: download_request_body.limit,
					index: download_request_body.index,
					classificationMarking: download_request_body.classificationMarking,
					cloneData: download_request_body.cloneData,
					orgFilter: download_request_body.orgFilter,
					orgFilterString: download_request_body.orgFilterString,
					typeFilter: download_request_body.typeFilter,
					typeFilterString: download_request_body.typeFilterString,
					selectedDocuments: download_request_body.selectedDocuments,
					tiny_url : download_request_body.tiny_url,
					searchFields: download_request_body.searchFields,
					edaSearchSettings: download_request_body.edaSearchSettings,
					sort: download_request_body.sort,
					order: download_request_body.order
				}
			};
			const { data } = await gameChangerAPI.modularExport(exportInput);
			downloadFile(data, download_request_body.format, cloneData);
		} catch(e) {
			console.log('regen err', e)
		} finally {
			exportHistoryDownloading.delete(historyId);
			setExportHistoryDownloading(new Set(exportHistoryDownloading));
		}
	}

	const renderExportHistory = () => {
		return (
			<div style={{ width: '100%', height: '100%' }}>
				<div style={{ width: '100%', height: '100%' }}>
					{exportHistoryLoading ? (
						<div style={{ margin: '0 auto' }}>
							<LoadingIndicator customColor={gcOrange} />
						</div>
					) : (
						exportHistory.length > 0 ?
						(
							<ReactTable
								data={exportHistory}
								className={'striped'}
								noDataText={"No rows found"}
								// loading={loadingTable}
								columns={exportHistoryColumns}
								editable={false}
								filterable={false}
								minRows={1}
								multiSort={false}
								showPageSizeOptions={false}
								showPagination={false}
								getTbodyProps={(state, rowInfo, column) => {
									return {
										style: {
											overflow: 'unset'
										}
									};
								}}
								getTdProps={(state, rowInfo, column) => ({
									style: {
										height: '40px',
									},
								})}
								getTrGroupProps={(state, rowInfo) => {
									return {
										style: { maxHeight: 40 }
									};
								}}
								getTheadTrProps={(state, rowInfo, column) => {
									return { style: styles.tableHeaderRow };
								}}
								getTheadThProps={(state, rowInfo, column) => {
									return { style: { fontSize: 15, fontWeight: 'bold' } };
								}}
								style={{
									height: "calc(100vh - 492px)",

								}}
							/>
						) :
						(
							<StyledPlaceHolder>Make a search to see the History</StyledPlaceHolder>
						)
					)
					}
				</div>

				{/*{exportHistory.length > 0 && (*/}
				{/*	<StyledPagination id={'exportHistoryPagination'}>*/}
				{/*		<Pagination*/}
				{/*			activePage={exportHistoryPage}*/}
				{/*			itemsCountPerPage={RESULTS_PER_PAGE}*/}
				{/*			totalItemsCount={exportHistoryTotalCount}*/}
				{/*			pageRangeDisplayed={8}*/}
				{/*			onChange={page => {*/}
				{/*				trackEvent('UserDashboardExportHistory', 'onChange', 'pagination', page);*/}
				{/*				handlePaginationChange(page, 'exportHistory');*/}
				{/*			}}*/}
				{/*			classname="gcPagination"*/}
				{/*		/>*/}
				{/*	</StyledPagination>*/}
				{/*)}*/}
			</div>
		)
	}

	const handleFavoriteSearchHistoryStarClicked = (target, favorite, tinyUrl, searchText, count, index) => {

		if (!favorite && !unfavoritePopperOpen) {
			setSearchHistoryPopperAnchorEl(target);
			setUnfavoritePopperOpen(true);
			setSearchHistoryIdx(index);
			console.log(index);
			return;
		}
		if (!searchHistoryPopperOpen) {
			if (checkUserInfo()) {
				return;
			}
			setSearchHistoryPopperAnchorEl(target);
			setSearchHistoryPopperOpen(true);
			setSearchHistoryFavoriteData({favoriteName: '', favoriteSummary: '', favorite, tinyUrl, searchText,
				count});
		} else {
			setSearchHistoryPopperAnchorEl(null);
			setSearchHistoryPopperOpen(false);
			setSearchHistoryFavoriteData({
				favoriteName: '',
				favoriteSummary: '',
				favorite: false,
				tinyUrl: '',
				searchText: '',
				count: 0
			});
		}
		setReload(!reload);
	}

	const renderSearchHistory = () => {
		return (
			<div style={{ width: '100%', height: '100%' }}>
				<div style={{ width: '100%', height: '100%' }}>
					{searchHistoryLoading ? (
						<div style={{ margin: '0 auto' }}>
							<LoadingIndicator customColor={gcOrange} />
						</div>
					) :
					(
						searchHistory.length > 0 ?
						(
							<ReactTable
								data={searchHistory}
								className={'striped'}
								noDataText={"No rows found"}
								// loading={loadingTable}
								columns={searchHistoryColumns}
								editable={false}
								filterable={false}
								minRows={1}
								multiSort={false}
								showPageSizeOptions={false}
								showPagination={false}
								getTbodyProps={(state, rowInfo, column) => {
									return {
										style: {
											overflow: 'unset'
										}
									};
								}}
								getTdProps={(state, rowInfo, column) => ({
									style: {
										height: '40px',
									},
								})}
								getTrGroupProps={(state, rowInfo) => {
									return {
										style: { maxHeight: 40 }
									};
								}}
								getTheadTrProps={(state, rowInfo, column) => {
									return { style: styles.tableHeaderRow };
								}}
								getTheadThProps={(state, rowInfo, column) => {
									return { style: { fontSize: 15, fontWeight: 'bold' } };
								}}
								style={{
									height: "calc(100vh - 492px)",

								}}
							/>
						) :
						(
							<StyledPlaceHolder>Make a search to see the History</StyledPlaceHolder>
						)
					)
					}
				</div>

				<Popover onClose={() => {handleFavoriteSearchHistoryStarClicked(null);}}
					open={searchHistoryPopperOpen} anchorEl={searchHistoryPopperAnchorEl}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
				>
					<div className={classes.paper}>
						<div style={{width: 330, margin: 5}}>
							<TextField
								label={'Favorite Name'}
								value={searchHistoryFavoriteData.favoriteName}
								onChange={(event) => {
									searchHistoryFavoriteData.favoriteName = event.target.value;
									setReload(!reload);
								}}
								className={classes.textField}
								margin='none'
								size='small'
								variant='outlined'
							/>
							<TextField
								label={'Favorite Summary'}
								value={searchHistoryFavoriteData.favoriteSummary}
								onChange={(event) => {
									searchHistoryFavoriteData.favoriteSummary = event.target.value;
									setReload(!reload);
								}}
								className={classes.textArea}
								margin='none'
								size='small'
								variant='outlined'
								multiline={true}
								rows={4}
							/>
							<div style={{display: 'flex', justifyContent: 'flex-end'}}>
								<GCButton
									onClick={() => handleFavoriteSearchHistoryStarClicked(null, true)}
									style={{ height: 40, minWidth: 40, padding: '2px 8px 0px', fontSize: 14, margin: '16px 0px 0px 10px' }}
									isSecondaryBtn={true}
								>Cancel
								</GCButton>
								<GCButton
									onClick={() => {

										handleSaveSearch();
									}}
									style={{ height: 40, minWidth: 40, padding: '2px 8px 0px', fontSize: 14, margin: '16px 0px 0px 10px' }}
								>Save
								</GCButton>
							</div>
						</div>
					</div>
				</Popover>

				<Popover onClose={() => {handleFavoriteSearchHistoryStarClicked(null);}}
					open={unfavoritePopperOpen} anchorEl={searchHistoryPopperAnchorEl}
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
						<div style={{ display: 'flex', justifyContent: 'flex-end'}}>
							<CloseButton 
								onClick={() => {
									setUnfavoritePopperOpen(false);
									setSearchHistoryIdx(-1);
								}}
							>
								<CloseIcon fontSize="small" />
							</CloseButton>
						</div>
						<div style={{width: 350, margin: 5}}>
							<div style={{ margin: '65px 15px 0'}}>Are you sure you want to delete this favorite? You will lose any comments made.</div>
							<div style={{display: 'flex', justifyContent: 'flex-end'}}>
								<GCButton
									onClick={() => {
										setUnfavoritePopperOpen(false);
										setSearchHistoryIdx(-1);
									}}
									isSecondaryBtn={true}
									style={{ height: 40, minWidth: 40, padding: '2px 8px 0px', fontSize: 14, margin: '16px 0px 0px 10px' }}
								>No
								</GCButton>
								<GCButton
									onClick={() => {
										setUnfavoritePopperOpen(false);
										setSearchHistorySettingsPopperAnchorEl(null);
										handleDeleteFavoriteSearch(searchHistoryIdx);
									}}
									style={{ height: 40, minWidth: 40, padding: '2px 8px 0px', fontSize: 14, margin: '16px 10px 0px', marginRight: 10 }}
								>Yes
								</GCButton>
							</div>
						</div>
					</div>
				</Popover>

				<Popover onClose={() => handleHideShowSearchHistorySettings(null)}
					open={searchHistorySettingsPopperOpen} anchorEl={searchHistorySettingsPopperAnchorEl}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					classes={{paper: classes.popTransparent}}
				>
					<div style={styles.searchHistorySettings}>
						<div style={styles.searchHistorySettings.overlayButtons}>
							<GCButton
								buttonColor={'transparent'}
								fontStyle={{color: '#ffffff'}}
								style={{minWidth: 'unset', }}
								onClick={()=> handleHideShowSearchHistorySettings(null)}
							><CloseIcon fontSize={'large'}/></GCButton>
						</div>
						<div style={styles.searchHistorySettings.overlayText}>
							<div style={styles.searchHistorySettings.overlaySearchDetails}><span style={{fontWeight: 'bold'}}>Organization Filters:</span> {searchHistorySettingsData.orgFilterText}</div>
							{searchHistorySettingsData.isExport &&
								<div style={styles.searchHistorySettings.overlaySearchDetails}><span style={{fontWeight: 'bold'}}>Export Type:</span> {searchHistorySettingsData.exportType}</div>
							}
						</div>
					</div>
				</Popover>
			</div>
		)
	}

	const handleHideShowSearchHistorySettings = (target, searchType, orgFilterText, exportType = '', isExport = false) => {
		if (!searchHistorySettingsPopperOpen) {
			searchHistorySettingsData.searchType = searchType;
			searchHistorySettingsData.orgFilterText = orgFilterText;
			searchHistorySettingsData.exportType = exportType;
			searchHistorySettingsData.isExport = isExport;
			setSearchHistorySettingsPopperAnchorEl(target);
			setSearchHistorySettingsPopperOpen(true);
		} else {
			setSearchHistorySettingsData({
				searchType: '', orgFilterText: '', exportType: '', isExport: false
			});
			setSearchHistorySettingsPopperAnchorEl(null);
			setSearchHistorySettingsPopperOpen(false);
		}
		setReload(!reload);
	}

	const handleSaveSearch = () => {
		const { favoriteName, favoriteSummary, favorite, tinyUrl, searchText, count } = searchHistoryFavoriteData;
		saveFavoriteSearch(favoriteName, favoriteSummary, favorite, tinyUrl, searchText, count);
		setSearchHistoryFavoriteData({
			favoriteName: '',
			favoriteSummary: '',
			favorite: false,
			tinyUrl: '',
			searchText: '',
			count: 0
		});
		setSearchHistoryPopperAnchorEl(null);
		setSearchHistoryPopperOpen(false);
	}

	const handleAcknowledgeUpdatesToDocs = (idx, name) => {
		switch (name){
			case 'updated':
				favoriteDocuments[idx].updated = !favoriteDocuments[idx].updated;
				break;
			case 'archived':
				favoriteDocuments[idx].archived = !favoriteDocuments[idx].archived;
				break;
			case 'removed':
				favoriteDocuments[idx].removed = !favoriteDocuments[idx].removed;
				break;
			default:
		}
		setReload(!reload);
	}

	const handleDeleteFavoriteDocument = async (idx) => {
		favoriteDocumentsSlice[idx].favorite = false;
		handleSaveFavoriteDocument(favoriteDocumentsSlice[idx]);
		updateUserData();
	}

	return (
		<div style={styles.tabContainer}>
			<Tabs onSelect={(tabIndex, lastIndex, event) => handleTabClicked(tabIndex, lastIndex, event)}>
				<div style={styles.tabButtonContainer}>
					<TabList style={styles.tabsList}>
						<Tab style={{...styles.tabStyle,
							...(tabIndex=== 0 ? styles.tabSelectedStyle : {}),
							borderRadius: `5px 0 0 0`
							}} title="userFavorites"
							onClick={() => clearDashboardNotification('favorites')}>
								<StyledBadge badgeContent={userData.notifications ? userData.notifications.favorites : 0}>
									<Typography variant="h6" display="inline" title="cardView">FAVORITES</Typography>
								</StyledBadge>
						</Tab>
						<Tab style={{...styles.tabStyle,
							...(tabIndex=== 1 ? styles.tabSelectedStyle : {}),
							borderRadius: ` 0 5px 0 0`
							}} title="userHistory">
							<Typography variant="h6" display="inline" title="cardView">HISTORY</Typography>
						</Tab>
					</TabList>

					<div style={styles.spacer} />
					{userData.api_key && <Typography
						variant="body"
						display="inline"
						title="API Key"
						style={{marginTop:'30px', marginLeft:'10px', cursor:'pointer', color:"rgb(6, 159, 217)"}}
						onClick={event=>{
							setAPIKeyPopperAnchorEl(event.currentTarget);
							setAPIKeyPopperOpen(true);
						}}
						>
							View API Key
					</Typography>}
					<Popper
						open={apiKeyPopperOpen}
						anchorEl={apiKeyPopperAnchorEl}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'right',
						}}
						transformOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
					>
						<div style={{padding:'10px', background:'white', border:'1px solid'}}>
							<Typography style={{fontSize:'14px', fontWeight:'900', marginBottom:'5px'}} className={classes.typography}>{userData.api_key}</Typography>
							<div style={{display:'flex', justifyContent:'center'}}>
								<GCButton
									onClick={()=>{
										const element = document.createElement('textarea');
										element.value = userData.api_key;
										element.setAttribute('readonly', '');
										element.style = {position: 'absolute', left: '-9999px'};
										document.body.appendChild(element);
										element.select();
										document.execCommand('copy');
										document.body.removeChild(element);
									}}
								>
									Copy Key
								</GCButton>
								<GCButton
									onClick={()=>{
										setAPIKeyPopperAnchorEl(null);
										setAPIKeyPopperOpen(false);
									}}
								>
									Close
								</GCButton>
							</div>
						</div>
					</Popper>
				</div>

				<div style={styles.panelContainer}>
					<TabPanel>
						{ renderFavorites() }
					</TabPanel>
					<TabPanel>
						{ renderHistory() }
					</TabPanel>
				</div>

			</Tabs>
		</div>
	);
}

const styles = {
	tabsList: {
		borderBottom: `2px solid ${gcOrange}`,
		padding: 0,
		display: 'flex',
		alignItems: 'center',
		flex: 9,
		margin: '10px 0 10px 50px'
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
		justifyContent: 'center'
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
		margin: '20px 72px 0 80px',
		minHeight: 'calc(100vh - 600px)',
		paddingBottom: 20
	},
	tableRow: {
		maxHeight: 200,
		fontSize: 15,
		fontFamily: 'Montserrat',
	},
	tableHeaderRow: {
		fontFamily: 'Montserrat',
		textAlign: 'left',
		fontWeight: 'bold',
		marginTop: '3px',
		maxHeight: '35px',
		height: '40px'
	},
	tableCenterDiv: {
		textAlign: 'center'
	},
	tableLeftDiv: {
		textAlign: 'left'
	},
	tableRightDiv: {
		textAlign: 'right'
	},
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
			marginRight: '5px'
		},
		overlayText: {
			height: '80%',
			margin: '0 10px',
			overflowWrap: 'break-word',
			color: '#ffffff',
			fontFamily: 'Montserrat',
			fontSize: '14px'
		},
		overlaySearchDetails: {
			marginBottom: '10px'
		}
	}
}

GCUserDashboard.propTypes = {
	userData: PropTypes.shape({
		favorite_searches: PropTypes.arrayOf(PropTypes.shape({
			url: PropTypes.string,
		})),
		search_history: PropTypes.arrayOf(PropTypes.shape({
			url: PropTypes.string
		})),
		favorite_documents: PropTypes.arrayOf(PropTypes.object),
		export_history: PropTypes.arrayOf(PropTypes.shape({
			download_request_body: PropTypes.shape({
				orgFilter: PropTypes.objectOf(PropTypes.bool),
				format: PropTypes.string
			})
		})),
		favorite_topics: PropTypes.arrayOf(PropTypes.object),
		favorite_organizations: PropTypes.arrayOf(PropTypes.object),
		notifications: PropTypes.objectOf(PropTypes.number),
		api_key: PropTypes.string
	}),
	updateUserData: PropTypes.func,
	handleSaveFavoriteDocument: PropTypes.func,
	handleDeleteSearch: PropTypes.func,
	saveFavoriteSearch: PropTypes.func,
	clearDashboardNotification: PropTypes.func,
	handleFavoriteTopic: PropTypes.func,
	handleFavoriteOrganization: PropTypes.func,
	checkUserInfo: PropTypes.func,
	cloneData: PropTypes.shape({
		clone_name: PropTypes.string
	})
}

export default GCUserDashboard;
