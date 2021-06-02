import React, {useState, useContext, useEffect} from 'react';
import Paper from 'material-ui/Paper';
import GameChangerAPI from '../components/api/gameChanger-service-api';
import UOTAlert from '../components/common/GCAlert';
import { SlideOutToolContext } from "advana-side-nav/dist/SlideOutMenuContext";
import { TextField, Tooltip, Typography, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Link } from "@material-ui/core";
import {ConstrainedIcon, PageLink} from "advana-side-nav/dist/SlideOutMenu";
import Permissions from "advana-platform-ui/dist/utilities/permissions";
import AdminIcon from "../images/icon/AdminIcon.png";
import CloneIcon from "../images/icon/CloneIcon.png";
import AuthIcon from "../images/icon/Authority.png";
import AnalystToolsIcon from '../images/icon/analyticswht.png';
import ReportIcon from '../images/icon/slideout-menu/reports icon.png';
import styled from "styled-components";
import { SearchBanner } from "../components/searchBar/GCSearchBanner";
import ReactTable from "react-table";
import _ from "underscore";
import "react-table/react-table.css";
import GCButton from "../components/common/GCButton";
import Modal from 'react-modal';
import NotificationsManagement from '../components/notifications/NotificationsManagement';
import GCTrendingBlacklist from '../components/admin/GCTrendingBlacklist';
import InternalUsersManagement from '../components/user/InternalUserManagement';
import GamechangerAppStats from '../components/searchMetrics/GamechangerAppStats';
import SearchPdfMapping from '../components/admin/SearchPdfMapping';
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import UOTToggleSwitch from "../components/common/GCToggleSwitch";
import CloseIcon from "@material-ui/icons/Close";
import { AddAlert, SupervisedUserCircle } from '@material-ui/icons';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import { trackEvent } from '../components/telemetry/Matomo';
import SlideOutMenuContent from 'advana-side-nav/dist/SlideOutMenuContent';
// import TutorialOverlayModal from 'advana-tutorial-overlay/dist/TutorialOverlayModal';
import { HoverNavItem } from '../components/navigation/NavItems'
// import UoTAPI from '../components/advana/api/api';
import GCAccordion from "../components/common/GCAccordion";
import GamechangerTextIcon from "../images/icon/GamechangerText.png";
import styles from '../components/admin/GCAdminStyles';

const gameChangerAPI = new GameChangerAPI();

const isDecoupled = window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' || process.env.REACT_APP_GC_DECOUPLED === 'true';

const toolTheme = {
	menuBackgroundColor: '#171A23',
	logoBackgroundColor: '#000000',
	openCloseButtonBackgroundColor: '#000000',
	allAppsBackgroundColor: '#171A23',
	openCloseIconColor: '#FFFFFF',
	sectionSeparatorColor: '#323E4A',
	fontColor: '#FFFFFF',
	hoverColor: '#E9691D',
	toolLogo: (<PageLink href="#/gamechanger"><img src={GamechangerTextIcon} href='#/gamechanger' alt="tool logo" /></PageLink>),
	toolIconHref: '#/gamechanger'
};

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		flexWrap: 'wrap',
		margin: '0 20px'
	},
	textField: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		width: '25ch',
		'& .MuiFormHelperText-root': {
			fontSize: 12
		}
	},
	textFieldWide: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		minWidth: '50ch',
		'& .MuiFormHelperText-root': {
			fontSize: 12
		}
	},
	dialogLg: {
		maxWidth: '800px',
		minWidth: '800px'
	},
	closeButton: {
		position: 'absolute',
		right: '0px',
		top: '0px',
		height: 60,
		width: 60,
		color: 'black',
		backgroundColor: styles.backgroundGreyLight,
		borderRadius: 0
    },
}));

const GCCheckbox = withStyles({
  root: {
    color: '#E9691D',
    '&$checked': {
      color:'#E9691D',
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

const TableRow = styled.div`
	text-align: left;
	height: 35px;
`

const PAGES = {
	general: 'General',
	cloneList: 'CloneList',
	searchPdfMapping: 'searchPdfMapping',
	adminList: 'AdminList',
	notifications: 'Notifications',
	internalUsers: 'Internal Users',
	appStats: 'Application Stats',
	apiKeys: 'API Keys'
}

const generateClosedContentArea = ({ setPageToView, getCloneData, getAdminData, getAPIRequestData }) => {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Admin Page" placement="right" arrow>
					<HoverNavItem
						centered
						onClick={() => { setPageToView(PAGES.general); return false; }}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={AdminIcon} />
					</HoverNavItem>
				</Tooltip>
			)}

			{(Permissions.isGameChangerAdmin() && isDecoupled) && (
				<Tooltip title="Manage Admins" placement="right" arrow>
					<HoverNavItem
						centered
						onClick={() => { 
							getAdminData();
							setPageToView(PAGES.adminList); 
							return false; 
						}}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={AuthIcon} />
					</HoverNavItem>
				</Tooltip>
			)}

			<Tooltip title="Clone Gamechanger" placement="right" arrow>
				<HoverNavItem
					centered
					onClick={() => {
						getCloneData();
						setPageToView(PAGES.cloneList);
						return false;
					}}
					toolTheme={toolTheme}
				>
					<ConstrainedIcon src={CloneIcon} />
				</HoverNavItem>
			</Tooltip>

			<Tooltip title="Service Notifications" placement="right" arrow>
				<HoverNavItem centered onClick={() => setPageToView(PAGES.notifications)}
					toolTheme={toolTheme}
				>
					<AddAlert style={{ fontSize: 30 }} />
				</HoverNavItem>
			</Tooltip>

			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Manage Internal Users" placement="right" arrow>
					<HoverNavItem centered onClick={() => setPageToView(PAGES.internalUsers)}
						toolTheme={toolTheme}
					>
						<SupervisedUserCircle style={{ fontSize: 30 }} />
					</HoverNavItem>
				</Tooltip>
			)}
			<Tooltip title="Search PDF Mapping" placement="right" arrow>
				<HoverNavItem
					centered
					onClick={() => {
						setPageToView(PAGES.searchPdfMapping);
						return false;
					}}
					toolTheme={toolTheme}
				>
					<ConstrainedIcon src={ReportIcon} />
				</HoverNavItem>
			</Tooltip>
			<Tooltip title="View Stats" placement="right" arrow>
				<HoverNavItem
					centered
					toolTheme={toolTheme}
					onClick={() => {
						setPageToView(PAGES.appStats);
						return false;
					}}>
					<ConstrainedIcon src={AnalystToolsIcon} />
				</HoverNavItem>
			</Tooltip>
			
			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Manage API Keys" placement="right" arrow>
					<HoverNavItem centered onClick={() => {
						getAPIRequestData();
						setPageToView(PAGES.apiKeys);
					}}
						toolTheme={toolTheme}
					>
						<VpnKeyIcon style={{ fontSize: 30 }} />
					</HoverNavItem>
				</Tooltip>
			)}
		</div>
	);
}

const generateOpenedContentArea = ({ setPageToView, getCloneData, getAdminData, getAPIRequestData }) => {
	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>

			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Admin Page" placement="right" arrow>
					<HoverNavItem
						onClick={() => { setPageToView(PAGES.general); return false; }}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={AdminIcon} /><span style={{ marginLeft: '10px' }}>Admin Page</span>
					</HoverNavItem>
				</Tooltip>
			)}

			{(Permissions.isGameChangerAdmin() && isDecoupled) && (
				<Tooltip title="Manage Admins" placement="right" arrow>
					<HoverNavItem
						onClick={() => { 
							getAdminData();
							setPageToView(PAGES.adminList); 
							return false; 
						}}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={AuthIcon} /><span style={{ marginLeft: '10px' }}>Manage Admins</span>
					</HoverNavItem>
				</Tooltip>
			)}

			<Tooltip title="Clone Gamechanger" placement="right" arrow>
				<HoverNavItem
					onClick={() => {
						getCloneData();
						setPageToView(PAGES.cloneList);
						return false;
					}}
					toolTheme={toolTheme}
				>
					<ConstrainedIcon src={CloneIcon} /><span style={{ marginLeft: '10px' }}>Clone Gamechanger</span>
				</HoverNavItem>
			</Tooltip>

			<Tooltip title="Show Notifications" placement="right" arrow>
				<HoverNavItem onClick={() => setPageToView(PAGES.notifications)}
					toolTheme={toolTheme}
				>
					<AddAlert style={{ fontSize: 30 }} />
					<span style={{ marginLeft: '5px' }}>Show Notifications</span>
				</HoverNavItem>
			</Tooltip>

			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Manage Internal Users" placement="right" arrow>
					<HoverNavItem onClick={() => setPageToView(PAGES.internalUsers)}
						toolTheme={toolTheme}
					>
						<SupervisedUserCircle style={{ fontSize: 30 }} />
						<span style={{ marginLeft: '5px' }}>Manage Internal Users</span>
					</HoverNavItem>
				</Tooltip>
			)}

			<Tooltip title="Search PDF Mapping" placement="right" arrow>
				<HoverNavItem
					onClick={() => {
						setPageToView(PAGES.searchPdfMapping);
						return false;
					}}
					toolTheme={toolTheme}
				>
					<ConstrainedIcon src={ReportIcon} /><span style={{ marginLeft: '10px' }}>Search PDF Mapping</span>
				</HoverNavItem>
			</Tooltip>

			<Tooltip title="View Stats" placement="right" arrow>
				<HoverNavItem
					toolTheme={toolTheme}
					onClick={() => {
						setPageToView(PAGES.appStats);
						return false;
					}}>
					<ConstrainedIcon src={AnalystToolsIcon} /><span style={{ marginLeft: '10px' }}>View Stats</span>
				</HoverNavItem>
			</Tooltip>
			
			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Manage API Keys" placement="right" arrow>
					<HoverNavItem onClick={() => {
						getAPIRequestData();
						setPageToView(PAGES.apiKeys);
					}}
						toolTheme={toolTheme}
					>
						<VpnKeyIcon style={{ fontSize: 30 }} />
						<span style={{ marginLeft: '5px' }}>Manage API Keys</span>
					</HoverNavItem>
				</Tooltip>
			)}

		</div>
	);
}

const getCloneData = async (setGCCloneTableData, setCloneTableMetaData) => {
	const tableData = [];

	const data = await gameChangerAPI.getCloneData();

	_.forEach(data.data, result => {
		tableData.push(result);
	});
	
	const tableMetaData = await gameChangerAPI.getCloneTableData();
	
	const booleanFields = [];
	const stringFields = [];
	const jsonFields = [];
	
	tableMetaData.data[0].forEach(meta => {
		if (meta.column_name !== 'createdAt' && meta.column_name !== 'updatedAt' && meta.column_name !== 'id') {
			let i, frags = meta.column_name.split('_');
			for (i=0; i<frags.length; i++) {
				frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
			}
			const display_name = frags.join(' ');
			switch (meta.data_type) {
				case 'integer':
					stringFields.push({key: meta.column_name, display_name});
					break;
				case 'boolean':
					booleanFields.push({key: meta.column_name, display_name});
					break;
				case 'jsonb':
					jsonFields.push({key: meta.column_name, display_name});
					break;
				case 'character varying':
				default:
					stringFields.push({key: meta.column_name, display_name});
					break;
			}
		}
	});
	
	setCloneTableMetaData({booleanFields, stringFields, jsonFields});
	setGCCloneTableData(tableData);
}

const getAdminData = async (setGCAdminTableData) => {
	const tableData = [];

	const data = await gameChangerAPI.getAdminData();

	_.forEach(data.data.admins, result => {
		tableData.push({
			username: result.username
		});
	});

	setGCAdminTableData(tableData);
}

const getApiKeyRequestData = async (setGCAPIRequestData) => {
	const resp = await gameChangerAPI.getAPIKeyRequestData();
	setGCAPIRequestData(resp.data || {approved: [], pending: []});
}

const GamechangerAdminPage = props => {

	const classes = useStyles();

	const { refreshClones, jupiter } = props;

	const [isAlertActive, setAlertActive] = useState(false);
	const [alertTitle, setAlertTitle] = useState('');
	const [alertType, setAlertType] = useState('');
	const [alertMessage, setAlertMessage] = useState('');
	const [pageToView, setPageToView] = useState(PAGES.general);
	const [gcCloneTableData, setGCCloneTableData] = useState([]);
	const [cloneTableMetaData, setCloneTableMetaData] = useState({stringFields: [], booleanFields: [], jsonFields: []});
	const [showCreateEditCloneModal, setShowCreateEditCloneModal] = useState(false);
	const [editCloneID, setEditCloneID] = useState(-99);
	const [editCloneData, setEditCloneData] = useState({});
	const [showEditESIndexModal, setShowEditESIndexModal] = useState(false);
	const [showTrendingBlacklistModal, setShowTrendingBlacklistModal] = useState(false);
	const [esIndex, setEsIndex] = useState('');
	const [editEsIndex, setEditEsIndex] = useState('');
	const [showCreateEditAdminModal, setShowCreateEditAdminModal] = useState(false);
	const [editAdminID, setEditAdminID] = useState(-99);
	const [gcAdminTableData, setGCAdminTableData] = useState([]);
	const [editAdminData, setEditAdminData] = useState({});
	// const [useMatomo, setUseMatomo] = useState(JSON.parse(localStorage.getItem('appMatomo')));
	// const [useGCCache, setUseGCCache] = useState(JSON.parse(localStorage.getItem('useGCCache')));
	const [transformerList, setTransformerList] = useState([]);
	const [selectedTransformer, setSelectedTransformer] = useState('');
	const [currentTransformerDisplayName, setCurrentTransformerDisplayName] = useState('');
	const [transformerLoading, setTransformerLoading] = useState(false);
	// const [tutorialModalOpen, setTutorialModalOpen] = useState(false);
	const [combinedSearch, setCombinedSearch] = useState(true);
	const [intelligentAnswers, setIntelligentAnswers] = useState(true);
	const [entitySearch, setEntitySearch] = useState(true);
	const [userFeedback, setUserFeedback] = useState(true);
	const [topicSearch, setTopicSearch] = useState(true);
	const [gcAPIRequestData, setGCAPIRequestData] = useState({approved: [], pending: []});
	const [gcAPIKeyVision, setGCAPIKeyVision] = useState(false);

	const { setToolState, unsetTool } = useContext(SlideOutToolContext);

	useEffect(() => {
		// Update the document title using the browser API
		setToolState({
			knowledgeBaseHref: 'https://wiki.advana.data.mil',
			toolTheme,
			toolName: 'GAMECHANGER ADMIN',
			hideAllApplicationsSection: isDecoupled,
			hideContentSection: false,
			extraSupportLinks: [],
			associatedApplications: []
		});

		return () => {
			unsetTool();
		};

	}, [unsetTool, setToolState, setPageToView, setGCCloneTableData]);

	useEffect(() => {
		const getEsIndexFromRedis = async () => {
			try {
				const index = await gameChangerAPI.getElasticSearchIndex();
				setEsIndex(index.data);
			} catch (err) {
				console.log(err);
				console.log('Could not retrieve elasticsearch index from redis');
			}
		}
		
		getEsIndexFromRedis();
	}, [setEsIndex])

	useEffect(() => {

		if (editCloneID >= 0) {
			const filteredClones = _.filter(gcCloneTableData, clone => {
				return clone.id === editCloneID;
			});

			const cloneToEdit = {...filteredClones[0] };

			setEditCloneData(cloneToEdit);
		} else {
			setEditCloneData({});
		}
	}, [editCloneID,gcCloneTableData])

	const setCurrentTransformer = async () => {
		try {
			setTransformerLoading(true);
			const { data } = await gameChangerAPI.setTransformerModel(selectedTransformer);
			const { model_name } = data;
			setCurrentTransformerDisplayName(model_name);
		} catch(e) {
			console.error('Error setting transformer model', e);
		} finally {
			setTransformerLoading(false);
		}
	}

	const setCombinedSearchMode = async () => {
		try {
			await gameChangerAPI.setCombinedSearchMode(!combinedSearch);
			setCombinedSearch(!combinedSearch);
			createAlert("Search Mode", "info", (!combinedSearch ? "Combined" : "Keyword only"));
		} catch(e) {
			console.error('Error setting combined search mode', e);
		}
	}

	const setIntelligentAnswersMode = async () => {
		try {
			await gameChangerAPI.setIntelligentAnswersMode(!intelligentAnswers);
			setIntelligentAnswers(!intelligentAnswers);
			createAlert("Intelligent Answers", "info", (!intelligentAnswers ? "On" : "Off"));
		} catch(e) {
			console.error('Error setting Intelligent Answers', e);
		}
	}

	const setEntitySearchMode = async () => {
		try {
			await gameChangerAPI.setEntitySearchMode(!entitySearch);
			setEntitySearch(!entitySearch);
			createAlert("Entity Search", "info", (!entitySearch ? "On" : "Off"));
		} catch(e) {
			console.error('Error setting Entity Search', e);
		}
	}

	const setTopicSearchMode = async () => {
		try {
			await gameChangerAPI.setTopicSearchMode(!topicSearch);
			setTopicSearch(!topicSearch);
			createAlert("Topic Search", "info", (!topicSearch ? "On" : "Off"));
		} catch(e) {
			console.error('Error setting Topic Search', e);
		}
	}

	const getCurrentTransformer = async () => {
		try {
			const { data } = await gameChangerAPI.getCurrentTransformer();
			const { model_name } = data;
			setCurrentTransformerDisplayName(model_name);
		} catch (e) {
			console.error('Error getting current transformer model', e);
		}
	};

	const getTransformerList = async () => {
		try {
			const { data } = await gameChangerAPI.getTransformerList();
			setTransformerList(data);
		} catch(e) {
			console.error('Error getting transformer list', e);
		}
	};

	const getCombinedSearch = async () => {
		try {
			const { data } = await gameChangerAPI.getCombinedSearchMode();
			const value = data.value === 'true';
			setCombinedSearch(value);
		} catch(e) {
			console.error('Error getting combined search mode', e);
		}
	}

	const getIntelligentAnswers = async () => {
		try {
			const { data } = await gameChangerAPI.getIntelligentAnswersMode();
			const value = data.value === 'true';
			setIntelligentAnswers(value);
		} catch(e) {
			console.error('Error getting intelligent search mode', e);
		}
	}

	const getEntitySearch = async () => {
		try {
			const { data } = await gameChangerAPI.getEntitySearchMode();
			const value = data.value === 'true';
			setEntitySearch(value);
		} catch(e) {
			console.error('Error getting entity search mode', e);
		}
	}
	const getUserFeedback = async () => {
		try {
			const { data } = await gameChangerAPI.getUserFeedbackMode();
			const value = data.value === 'true';
			setUserFeedback(value);
		} catch(e) {
			console.error('Error getting user feedback mode', e);
		}
	}

	const getTopicSearch = async () => {
		try {
			const { data } = await gameChangerAPI.getTopicSearchMode();
			const value = data.value === 'true';
			setTopicSearch(value);
		} catch(e) {
			console.error('Error getting topic search mode', e);
		}
	}

	useEffect(() => {
		getCurrentTransformer();
		getTransformerList();
		getCombinedSearch();
		getIntelligentAnswers();
		getEntitySearch();
		getUserFeedback();
		getTopicSearch();
	}, []);

	const createAlert = (title, type, message) => {
		setAlertActive(true);
		setAlertTitle(title);
		setAlertType(type);
		setAlertMessage(message);
	}

	const createSearchCache = async () => {
		const title = "Creating cache for searched terms: ";
		createAlert(title, "info", "Started");
		try {
			await gameChangerAPI.createSearchHistoryCache().then(res => {
				createAlert(title, "success", "Creation complete");
				console.log(res);
			});
		} catch (e) {
			console.log(e);
			createAlert(title, "error", "Creation failed");
		}
	}

	const clearSearchCache = async () => {
		const title = "Clearing cache for searched terms: ";
		createAlert(title, "info", "Started");
		try {
			await gameChangerAPI.clearSearchHistoryCache().then(res => {
				createAlert(title, "success", "Cache cleared");
			})
		} catch (e) {
			console.log(e);
			createAlert(title, "error", "Cache clearing failed");
		}
	}
	
	const createAbbreviationsCache = async () => {
		const title = "Creating cache for abreviations: ";
		createAlert(title, "info", "Started");
		try {
			await gameChangerAPI.createAbbreviationsCache().then(res => {
				createAlert(title, "success", "Creation Complete");
				console.log(res);
			});
		} catch (e) {
			console.log(e);
			createAlert(title, "error", "Creation failed");
		}
	}

	const clearAbbreviationsCache = async () => {
		const title = "Clearing cache for abbreviations: ";
		createAlert(title, "info", "Started");
		try {
			await gameChangerAPI.clearAbbreviationsCache().then(res => {
				createAlert(title, "success", "Cache cleared");
			})
		} catch (e) {
			console.log(e);
			createAlert(title, "error", "Cache clearing failed");
		}
	}

	const createGraphDataCache = async () => {
		const title = "Creating cache for graph data: ";
		createAlert(title, "info", "Started");
		try {
			await gameChangerAPI.createGraphDataCache().then(res => {
				createAlert(title, "success", "Creation complete");
				console.log(res);
			});
		} catch (e) {
			console.log(e);
			createAlert(title, "error", "Creation failed");
		}
	}

	const clearGraphDataCache = async () => {
		const title = "Clearing cache for graph data: ";
		createAlert(title, "info", "Started");
		try {
			await gameChangerAPI.clearGraphDataCache().then(res => {
				createAlert(title, "success", "Cache cleared");
			})
		} catch (e) {
			console.log(e);
			createAlert(title, "error", "Cache clearing failed");
		}
	}
	
	// const checkMatomo = async () => {
	// 	createAlert('Toggling Matomo', "info", `${useMatomo? 'Turning Matomo Off': 'Turning Matomo On'}`);
	// 	try {

	// 		await UoTAPI.setAppMatomoStatus({tracking: !useMatomo}, (res) => {
	// 			createAlert('Toggling Matomo', "success", `${res.data ? 'Sending' : 'Not Sending'}  Data To Matomo`);
	// 			setAppMatomo(!useMatomo);
	// 			setUseMatomo(!useMatomo);
	// 		}, (err) => {
	// 			console.log(err);
	// 		})
	// 	} catch (e) {
	// 		console.log(e);
	// 		createAlert('Toggling Matomo', "error", "Can't Connect To Matomo");
	// 	}
	// }

	const populateNewUserId = async () => {
		try {
			await gameChangerAPI.populateNewUserId().then(() => {
				createAlert('Populating New User IDs', "success", 'Updated new_user_id column')
			})
		} catch (e){
			console.log(e);
			createAlert('Populating New User IDs', "error", "Failed updating Postgres table")
		}
	}
	
	const reloadHandlerMap = async () => {
		const title = "Reloading Handler Map: ";
		createAlert(title, "info", "Started");
		try {
			await gameChangerAPI.reloadHandlerMap().then(res => {
				createAlert('Reloading Handler Map', "success", 'Updated handler map')
			})
		} catch (e){
			console.log(e);
			createAlert('Reloading Handler Map', "error", "Failed updating handler map")
		}
	}
	const toggleUserFeedback = async () => {
		const title = "Requst User Feedback: ";
		createAlert(title, "info", "Started");
		try {
			await gameChangerAPI.toggleUserFeedbackMode().then(res => {
				createAlert('Toggling user feedback value', "success", 'updated user feedback mode')
				getUserFeedback();
			})
		} catch (e){
			console.log(e);
			createAlert('Toggling user feedback value', "error", "failed updating user feedback mode")
		}
	}

	// const toggleSearchCache = async () => {
	// 	createAlert('Toggling Search Cache', 'info', `${useGCCache ? 'Turning Search Cache Off' : 'Turning Search Cache On'}`);
	// 	try {
	// 		await gameChangerAPI.toggleGCCacheStatus().then((res) => {
	// 			createAlert('Toggling Search Cache', 'success', `${res.data ? 'Cache On' : 'Cache Off'}`);
	// 			setGCCache(res.data);
	// 			setUseGCCache(res.data);
	// 		});
	// 	} catch (e) {
	// 		console.log(e);
	// 		createAlert('Toggling Search Cache', 'error', `Failed to toggle cache ${useGCCache ? 'off' : 'on'}`);
	// 	}
	// }

	const openEsIndexModal = () => {
		setShowEditESIndexModal(true);
	}

	const openTrendingBlacklistModal = () => {
		setShowTrendingBlacklistModal(true);
	}

	const closeTrendingBlacklistModal = () => {
		setShowTrendingBlacklistModal(false);
	}

	const changeEsIndex = async (setDefault) => {
		try {
			if(setDefault){
				await gameChangerAPI.setElasticSearchIndex('').then(() =>
					setEsIndex('')
				);
			} else {
				await gameChangerAPI.setElasticSearchIndex(editEsIndex).then(() => {
					setEsIndex(editEsIndex);
				});
			}
		} catch (e) {
			console.log(e);
		}
	}

	const renderGeneralAdminButtons = () => {
		return (
			<div>
				<p style={styles.sectionHeader}>General Actions</p>
				<div className="row" style={styles.applicationsRow}>
					{/* <div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link to="#" onClick={() => {
								checkMatomo();
								trackEvent('GAMECHANGER_Admin', "AdminPageToggleMatomo", "onClick");
							}} style={{ textDecoration: 'none' }}>
								<i style={styles.image} className="fa fa fa-eye fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Toggle Matomo</span></h2>
							</Link>
						</Paper>
					</div>
					{/* <div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link to="#" onClick={toggleSearchCache} style={{ textDecoration: 'none' }}>
								<i style={styles.image} className="fa fa-database fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Toggle Search Cache</span></h2>
							</Link>
						</Paper>
					</div> */}
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link to="#" onClick={() => {
								openEsIndexModal();
								trackEvent('GAMECHANGER_Admin', "AdminPageChangeEsIndex", "onClick");
							}} style={{ textDecoration: 'none' }}>
								<i style={styles.image} className="fa fa fa-plug fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Change ElasticSearch Index</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link to="#" onClick={createSearchCache} style={{ textDecoration: 'none' }}>
								<i style={styles.image} className="fa fa-search fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Create Search Cache</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link to="#" onClick={clearSearchCache} style={{ textDecoration: 'none' }}>
								<i style={styles.image} className="fa fa-trash fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Clear Search Cache</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link to="#" onClick={createAbbreviationsCache} style={{ textDecoration: 'none' }}>
								<i style={styles.image} className="fa fa-search fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Create Abbreviations Cache</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link to="#" onClick={clearAbbreviationsCache} style={{ textDecoration: 'none' }}>
								<i style={styles.image} className="fa fa-trash fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Clear Abbreviations Cache</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link to="#" onClick={createGraphDataCache} style={{ textDecoration: 'none' }}>
								<i style={styles.image} className="fa fa-code-fork fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Create Graph Cache</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link to="#" onClick={clearGraphDataCache} style={{ textDecoration: 'none' }}>
								<i style={styles.image} className="fa fa-trash fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Clear Graph Cache</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link to="#" onClick={openTrendingBlacklistModal} style={{ textDecoration: 'none' }}>
							<i style={styles.image} className="fa fa-line-chart fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Edit Trending Blacklist</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link to="#" onClick={populateNewUserId} style={{ textDecoration: 'none' }}>
							<i style={styles.image} className="fa fa-users fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Populate New User ID Column</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link to="#" onClick={reloadHandlerMap} style={{ textDecoration: 'none' }}>
							<i style={styles.image} className="fa fa-map fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Reload Handler Map</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={combinedSearch?styles.paper:{...styles.paper, backgroundColor:'rgb(181 52 82)'}} zDepth={2} circle>
							<Link to="#" onClick={setCombinedSearchMode} style={{ textDecoration: 'none' }}>
							<i style={styles.image} className="fa fa-btc fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Toggle Combined Search</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={intelligentAnswers?styles.paper:{...styles.paper, backgroundColor:'rgb(181 52 82)'}} zDepth={2} circle>
							<Link to="#" onClick={setIntelligentAnswersMode} style={{ textDecoration: 'none' }}>
							<i style={styles.image} className="fa fa-question fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Toggle Intelligent Answers</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={entitySearch?styles.paper:{...styles.paper, backgroundColor:'rgb(181 52 82)'}} zDepth={2} circle>
							<Link to="#" onClick={setEntitySearchMode} style={{ textDecoration: 'none' }}>
							<i style={styles.image} className="fa fa-id-badge fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Toggle Entity Search</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={topicSearch?styles.paper:{...styles.paper, backgroundColor:'rgb(181 52 82)'}} zDepth={2} circle>
							<Link to="#" onClick={setTopicSearchMode} style={{ textDecoration: 'none' }}>
							<i style={styles.image} className="fa fa-id-badge fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Toggle Topic Search</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={userFeedback?styles.paper:{...styles.paper, backgroundColor:'rgb(181 52 82)'}} zDepth={2} circle>
							<Link to="#" onClick={toggleUserFeedback} style={{ textDecoration: 'none' }}>
							<i style={styles.image} className="fa fa-id-card-o fa-2x"></i>
								<h2 style={styles.featureName}><span style={styles.featureNameLink}>Toggle User Feedback</span></h2>
							</Link>
						</Paper>
					</div>
					<div style={{ minWidth: '400px', height: '150px', border: '2px solid darkgray', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
						<b>Transformer Model Select</b>
						<select style={{ margin: '0 5px' }} value={selectedTransformer} onChange={({ target: { value } }) => { setSelectedTransformer(value) }}>
							{transformerList.map((name) => {
								return (
									<option key={name} value={name}>{name}</option>
								)
							})}
						</select>
						<button onClick={() => setCurrentTransformer()} disabled={transformerLoading}> Set Model </button>
						{transformerLoading ? <span>Loading new model...</span> : <span>Currently using {currentTransformerDisplayName}</span>}
					</div>
				</div>
				
				{/* <p style={styles.sectionFooter}>Currently {useMatomo ? 'sending': 'not sending'} data to Matomo</p> */}
				<p style={styles.sectionFooter}>Currently not using cache for searches</p>
				<p style={styles.sectionFooter}>Currently using {combinedSearch ? 'combined search mode' : 'keyword searching only'}</p>
				<p style={styles.sectionFooter}>Currently {!intelligentAnswers ? 'not' : ''} using intelligent answers</p>
			</div>
		)
	}

	const renderCloneList = () => {

		const columns = [
			{
				Header: 'Name',
				accessor: 'display_name',
				Cell: row => (
					<TableRow>{row.value}</TableRow>
				)
			},
			{
				Header: 'Url',
				accessor: 'url',
				Cell: row => (
					<TableRow><a href={`#/${row.value}`}>{`#/${row.value}`}</a></TableRow>
				)
			},
			{
				Header: 'Live',
				accessor: 'is_live',
				width: 200,
				Cell: row => (
					<TableRow>
						<UOTToggleSwitch
				 			leftLabel={'Off'}
				 			rightLabel={'Live'}
				 			rightActive={row.value}
				 			onClick={ () => {
				 				if (!row.row._original.can_edit) return;
				 				const filteredClones = _.filter(gcCloneTableData, clone => {
									return clone.id ===  row.row.id;
								});

								const cloneToEdit = {...filteredClones[0]};

				 				cloneToEdit.is_live = !row.value;
				 				trackEvent('GAMECHANGER_Admin', "ToggleCloneIsLive", cloneToEdit.name, cloneToEdit.is_live ? 1 : 0);
				 				storeCloneData(cloneToEdit);
							}}
				 			customColor={'#E9691D'}
				 		/>
					</TableRow>
				)
			},
			{
				Header: ' ',
				accessor: 'id',
				width: 150,
				Cell: row => (
					<TableRow>
						{row.row._original.can_edit &&
							<GCButton
								onClick={() => {
									trackEvent('GAMECHANGER_Admin', "EditClone", "onClick", row.value);
									setEditCloneID(row.value);
									setShowCreateEditCloneModal(true);
								}}
								style={{minWidth: 'unset'}}
							>Edit</GCButton>
						}
					</TableRow>
				)
			},
			{
				Header: ' ',
				accessor: 'id',
				width: 150,
				Cell: row => (
					<TableRow>
						{row.row._original.can_edit &&
							<GCButton
								onClick={() => {
									trackEvent('GAMECHANGER_Admin', "DeleteClone", "onClick", row.value);
									deleteCloneData(row.value).then(() => {
										getCloneData(setGCCloneTableData, setCloneTableMetaData).then(() => {
											setPageToView(PAGES.cloneList);
										});
									});
								}}
								style={{minWidth: 'unset', backgroundColor: 'red', borderColor: 'red'}}
							>Delete</GCButton>
						}
					</TableRow>
				)
			}
		];

		return (
			
			<div>
				<div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
					<p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>Gamechanger Clones</p>
					<GCButton
						onClick={() => {
							trackEvent('GAMECHANGER_Admin', "CreateClone", "onClick");
							setEditCloneID(-99);
							setShowCreateEditCloneModal(true);
						}}
						style={{minWidth: 'unset'}}
					>Create Clone</GCButton>
				</div>

				<ReactTable
					data={gcCloneTableData}
					columns={columns}
					style={{margin: '0 80px 20px 80px', height: 700}}
					pageSize={10}
				/>
			</div>
		)
	}

	const renderAdminList = () => {

		const columns = [
			{
				Header: 'Username',
				accessor: 'username',
				Cell: row => (
					<TableRow>{row.value}</TableRow>
				)
			},
			{
				Header: ' ',
				accessor: 'username',
				width: 150,
				Cell: row => (
					<TableRow>
						<GCButton
							onClick={() => {
								trackEvent('GAMECHANGER_Admin', "DeleteAdmin", "onClick", row.value);
								deleteAdminData(row.value).then(() => {
									getAdminData(setGCAdminTableData).then(() => {
										setPageToView(PAGES.adminList);
									});
								});
							}}
							style={{minWidth: 'unset', backgroundColor: 'red', borderColor: 'red'}}
						>Delete</GCButton>
					</TableRow>
				)
			}
		]

		return (
			<div>
				<div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
					<p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>Gamechanger Admins</p>
					<GCButton
						onClick={() => {
							trackEvent('GAMECHANGER_Admin', "CreateAdmin", "onClick");
							setEditAdminID(-99);
							setShowCreateEditAdminModal(true);
						}}
						style={{minWidth: 'unset'}}
					>Create Admin</GCButton>
				</div>

				<ReactTable
					data={gcAdminTableData}
					columns={columns}
					style={{margin: '0 80px 20px 80px', height: 700}}
					pageSize={10}
				/>
			</div>
		)
	}

	const renderCloneModal = () => {
		const handleCheck = (event) => {
			setEditCloneData({ ...editCloneData, [event.target.name]: event.target.checked })
		};
		
		return (
			<div style={{margin: '0 20px'}}>
				<div>
					<Typography variant="h4" style={styles.modalHeaders}>Input Fields</Typography>
					{cloneTableMetaData.stringFields.map(field => (
						<TextField
							label={field.display_name}
							id="margin-dense"
							defaultValue={editCloneData ? editCloneData[field.key] : ''}
							onChange={event => {editCloneData[field.key] = event.target.value}}
							className={classes.textField}
							helperText={field.display_name}
							margin="dense"
						/>
					))}
				</div>
				<div>
					<Typography variant="h4" style={styles.modalHeaders}>Boolean Fields</Typography>
					{cloneTableMetaData.booleanFields.map(field => (
						<FormControlLabel
							control={
								<GCCheckbox
									checked={editCloneData[field.key]}
									onChange={handleCheck}
									name={field.key}
									color="primary"
									style={styles.checkbox}
								/>
							}
							label={field.display_name}
						/>
					))}
				</div>
				<div>
					<Typography variant="h4" style={styles.modalHeaders}>JSON Fields</Typography>
					{cloneTableMetaData.jsonFields.map(field => (
						<TextField
							label={field.display_name}
							id="margin-dense"
							defaultValue={editCloneData ? JSON.stringify(editCloneData[field.key]) : ''}
							onChange={event => {editCloneData[field.key] = event.target.value}}
							className={classes.textField}
							helperText={field.display_name}
							margin="dense"
						/>
					))}
				</div>
			</div>
		)
	}

	const renderAdminModal = () => {

		return (
			<>
				<Typography variant="h2" style={{ width: '100%', padding: '20px', paddingLeft: '20px', fontSize: '25px' }}>{editAdminID === -99 ? 'Create Admin' : 'Edit Admin'}</Typography>
				<div style={{ margin: '0 20px' }}>
					<div className={classes.root}>
						<Typography variant="h4" style={styles.modalHeaders}>Admins</Typography>
						<TextField
							label="New Admin CAC ID"
							id="margin-dense"
							defaultValue={editAdminData ? editAdminData.username : null}
							onChange={event => { editAdminData.username = event.target.value }}
							className={classes.textField}
							helperText="Admin"
							margin="dense"
						/>
					</div>

				</div>
				<div style={{ display: 'flex', justifyContent: 'flex-end', marginLeft: '20px', marginRight: '2em', width: '95%' }}>
					<GCButton
						id={'editCloneClose'}
						onClick={closeAdminModal}
						style={{ margin: '10px' }}
						buttonColor={'#8091A5'}
					>
						Close
					</GCButton>
					<GCButton
						id={'editCloneSubmit'}
						onClick={() => storeAdminData()}
						style={{ margin: '10px' }}
					>
						Submit
					</GCButton>
				</div>
			</>
		)
	}

	const closeCloneModal = () => {
		setEditCloneID(-99);
		setEditCloneData({});
		setShowCreateEditCloneModal(false);
	}

	const closeAdminModal = () => {
		setEditAdminID(-99);
		setEditAdminData({});
		setShowCreateEditAdminModal(false);
	}

	const storeCloneData = (cloneToEdit = null) => {
		
		if (!cloneToEdit) {
			cloneToEdit = editCloneData;
		}
		
		const cloneDataToStore = {...cloneToEdit};
		
		delete cloneDataToStore.id;
		delete cloneDataToStore.createdAt;
		delete cloneDataToStore.updatedAt;
		
			cloneTableMetaData.jsonFields.forEach(field => {
				if (typeof cloneDataToStore[field.key] === 'string') {
					cloneDataToStore[field.key] = JSON.parse(cloneDataToStore[field.key]);
				}
			})
		
		gameChangerAPI.storeCloneData(cloneDataToStore).then(data => {
			if (data.status === 200) {
				setEditCloneID(-99);
				setEditCloneData({});
				setShowCreateEditCloneModal(false);
				getCloneData(setGCCloneTableData, setCloneTableMetaData).then(() => {
					setPageToView(PAGES.cloneList);
				});
				refreshClones();
			}
		});

	}

	const storeAdminData = (adminToEdit = null) => {

		const adminDataToStore = {};

		adminDataToStore.id = adminToEdit ? adminToEdit.username : editAdminID;

		if (!adminToEdit) {
			adminToEdit = editAdminData;
		}

		try {
			adminDataToStore.username = adminToEdit.username;
		} catch(e) {
			console.log('No username set')
			return
		}

		gameChangerAPI.storeAdminData(adminDataToStore).then(data => {
			if (data.status === 200) {
				setEditAdminID(-99);
				setEditAdminData({});
				setShowCreateEditAdminModal(false);
				getAdminData(setGCAdminTableData).then(() => {
					setPageToView(PAGES.adminList);
				});
			}
		});

	}

	const deleteCloneData = async (id) => {
		await gameChangerAPI.deleteCloneData(id);
	}

	const deleteAdminData = async (username) => {
		await gameChangerAPI.deleteAdminData(username);
	}
	
	const renderAPIRequests = () => {
		const approvedColumns = [
			{
				Header: 'Name',
				accessor: 'name',
				width: 200,
				Cell: row => (
					<TableRow>{row.value}</TableRow>
				)
			},
			{
				Header: 'Keys',
				accessor: 'keys',
				Cell: row => 
					{ return (gcAPIKeyVision ? 
						<TableRow>{row.value.join(", ")}</TableRow> :
						<TableRow>******************************************</TableRow> )
					}
			},
			{
				Header: ' ',
				accessor: 'id',
				width: 120,
				Cell: row => (
					<TableRow>
						<GCButton
							onClick={() => {
								trackEvent('GAMECHANGER_Admin', "AdminPage", "DeleteAPIKey", row.value);
								revokeAPIKeyRequestData(row.value);
							}}
							style={{minWidth: 'unset', backgroundColor: 'red', borderColor: 'red', height: 35}}
						>Revoke</GCButton>
					</TableRow>
				)
			}
		]
		
		const pendingColumns = [
			{
				Header: 'Name',
				accessor: 'name',
				width: 200,
				Cell: row => (
					<TableRow>{row.value}</TableRow>
				)
			},
			{
				Header: 'Reason',
				accessor: 'reason',
				Cell: row => (
					<TableRow>{row.value}</TableRow>
				)
			},
			{
				Header: ' ',
				accessor: 'id',
				width: 230,
				Cell: row => (
					<TableRow>
						<GCButton
							onClick={() => {
								trackEvent('GAMECHANGER_Admin', "AdminPage", "ApproveAPIKeyRequest", row.value);
								approveRejectAPIKeyRequestData(row.value, true);
							}}
							style={{minWidth: 'unset', backgroundColor: 'green', borderColor: 'green', height: 35}}
						>Approve</GCButton>
						<GCButton
							onClick={() => {
								trackEvent('GAMECHANGER_Admin', "AdminPage", "RejectAPIKeyRequest", row.value);
								approveRejectAPIKeyRequestData(row.value, false);
							}}
							style={{minWidth: 'unset', backgroundColor: 'red', borderColor: 'red', height: 35}}
						>Reject</GCButton>
					</TableRow>
				)
			}
		]

		return (
			<div style={{height: '100%'}}>
				<div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
					<p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>API Key Requests</p>
				</div>
				
				<div style={{margin: '10px 80px'}}>
					<GCAccordion expanded={false} header={'APPROVED API KEYS'}>
						<div style={{display:"flex", flexDirection: 'column', width: "100%"}}>
							<ReactTable
								data={gcAPIRequestData.approved}
								columns={approvedColumns}
								pageSize={10}
								style={{width: '100%'}}
								getTheadTrProps={() => {
									return { style: { height: 'fit-content', textAlign: 'left', fontWeight: 'bold' } };
								}}
								getTheadThProps={() => {
									return { style: { fontSize: 15, fontWeight: 'bold' } };
								}}
							/>
							{gcAPIRequestData.approved.length>0 && <GCButton
								id={'editCloneSubmit'}
								onClick={()=>setGCAPIKeyVision(!gcAPIKeyVision)}
								style={{margin:'10px'}}
							>
								Show/Hide API keys
							</GCButton>}
						</div>
					</GCAccordion>
					<GCAccordion expanded={true} header={'PENDING API KEYS'}>
						<ReactTable
							data={gcAPIRequestData.pending}
							columns={pendingColumns}
							pageSize={10}
							style={{width: '100%'}}
							getTheadTrProps={() => {
								return { style: { height: 'fit-content', textAlign: 'left', fontWeight: 'bold' } };
							}}
							getTheadThProps={() => {
								return { style: { fontSize: 15, fontWeight: 'bold' } };
							}}
						/>
					</GCAccordion>
				</div>
			</div>
		)
	}
	
	const revokeAPIKeyRequestData = async (id) => {
		gameChangerAPI.revokeAPIKeyRequest(id).then(resp => {
			getApiKeyRequestData(setGCAPIRequestData);
		});
	}
	
	const approveRejectAPIKeyRequestData = async (id, approve) => {
		gameChangerAPI.approveRejectAPIKeyRequest(id, approve).then(resp => {
			getApiKeyRequestData(setGCAPIRequestData);
		});
	}

	const renderSwitch = (page) => {
		trackEvent('GAMECHANGER_Admin', "ChangeAdminPage", "onChange", page.toString());

		switch(page) {
			case PAGES.general:
				return renderGeneralAdminButtons();
			case PAGES.cloneList:
				return renderCloneList();
			case PAGES.searchPdfMapping:
				return <SearchPdfMapping />;
			case PAGES.adminList:
				return renderAdminList();
			case PAGES.notifications:
				return <NotificationsManagement />;
			case PAGES.internalUsers:
				return <InternalUsersManagement />;
			case PAGES.appStats:
				return <GamechangerAppStats />;
			case PAGES.apiKeys:
				return renderAPIRequests();
			default:
				return renderGeneralAdminButtons();
		}
	}
	
	return (
		<div style={{ minHeight: '100%' }}>

			<SlideOutMenuContent type="closed">{generateClosedContentArea({ setPageToView, getCloneData: () => getCloneData(setGCCloneTableData, setCloneTableMetaData),  getAdminData: () => getAdminData(setGCAdminTableData), getAPIRequestData: () => getApiKeyRequestData(setGCAPIRequestData) })}</SlideOutMenuContent>
			<SlideOutMenuContent type="open">{generateOpenedContentArea({ setPageToView, getCloneData: () => getCloneData(setGCCloneTableData, setCloneTableMetaData), getAdminData: () => getAdminData(setGCAdminTableData), getAPIRequestData: () => getApiKeyRequestData(setGCAPIRequestData) })}</SlideOutMenuContent>

			<SearchBanner
				onTitleClick={() => {
					window.location.href = `#/gamechanger-admin`;
					setPageToView(PAGES.general);
				}}
				titleBarModule={'admin/adminTitleBarHandler'}
				jupiter={jupiter}
				rawSearchResults={[]}
			>
			</SearchBanner>

			{renderSwitch(pageToView)}

			<div>
				{
					isAlertActive ? <UOTAlert
						title={alertTitle}
						type={alertType}
						message={alertMessage}
						onHide={() => setAlertActive(false)}
						containerStyles={styles.alert}
					/> : <i></i>
				}
			</div>

			<Dialog
                open={showCreateEditCloneModal}
                scroll={'paper'}
                maxWidth="lg"
                disableEscapeKeyDown
                disableBackdropClick
                classes={{
                    paperWidthLg: classes.dialogLg
				}}
            >
                <DialogTitle >
					<div style={{display: 'flex', width: '100%'}}>
						<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>{editCloneID === -99 ? 'Create Clone' : 'Edit Clone'}</Typography>
					</div>
					<IconButton aria-label="close" style={{ 
						position: 'absolute',
						right: '0px',
						top: '0px',
						height: 60,
						width: 60,
						color: 'black',
						backgroundColor: styles.backgroundGreyLight,
						borderRadius: 0
					}} onClick={() => closeCloneModal()}>
						<CloseIcon style={{ fontSize: 30 }} />
					</IconButton>
                </DialogTitle>

                <DialogContent style={{height: 700}}>
					{renderCloneModal()}
                </DialogContent>

                <DialogActions>
					<div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', margin: '0px 18px' }}>
						<GCButton
							id={'editCloneSubmit'}
							onClick={()=>storeCloneData()}
							style={{margin:'10px'}}
						>
							Submit
						</GCButton>
					</div>
                </DialogActions>
            </Dialog>

			<Modal
				isOpen={showCreateEditAdminModal}
				onRequestClose={closeAdminModal}
				className="edit-clone-modal"
				overlayClassName="edit-clone-modal-overlay"
				id="edit-clone-modal"
				closeTimeoutMS={300}
				style={{ margin: 'auto', marginTop: '30px', minWidth: '80%', maxWidth: '90%', display: 'flex', flexDirection: 'column', border: '1px solid gray', boxShadow: '1px 1px gray', borderRadius: '2px' }}>
				{renderAdminModal()}
			</Modal>

			<Modal
					isOpen={showTrendingBlacklistModal}
					onRequestClose={closeTrendingBlacklistModal}
					style={styles.esIndexModal}
					>
					<IconButton aria-label="close" style={{
						position: 'absolute',
						right: '0px',
						top: '0px',
						height: 60,
						width: 60,
						color: 'black',
						backgroundColor: styles.backgroundGreyLight,
						borderRadius: 0
					}} onClick={() => closeTrendingBlacklistModal()}>
						<CloseIcon style={{ fontSize: 30 }} />
					</IconButton>
					<GCTrendingBlacklist/>
					<div style={{display: 'flex', justifyContent: 'flex-end', marginLeft:'20px', marginRight:'2em',width:'95%'}}>
					<GCButton
						id={'esModalClose'}
						onClick={()=>setShowTrendingBlacklistModal(false)}
						style={{margin:'10px'}}
					>
						Close
					</GCButton>
				</div>
			</Modal>
			
			<Modal
				isOpen={showEditESIndexModal}
				onRequestClose={() => setShowEditESIndexModal(false)}
				style={styles.esIndexModal}
				>
				<Typography variant="h2" style={{ width: '100%', padding: '20px', paddingLeft: '20px', fontSize:'25px' }}>{'Change Elasticsearch Index'}</Typography>
					<div style={{margin: '0 20px'}}>
						<div className={classes.root}>
						<Typography variant="h4" style={styles.modalHeaders}>Current Elasticsearch Index: {esIndex ? esIndex : 'Default Index'}</Typography>
						<TextField
							label="Elasticsearch Index"
							id="margin-dense"
							onBlur={event => setEditEsIndex(event.target.value)}
							className={classes.textField}
							helperText="Index To Change To."
							margin="dense"
						/>
						</div>
					</div>
				<div style={{display: 'flex', justifyContent: 'flex-end', marginLeft:'20px', marginRight:'2em',width:'95%'}}>
					<GCButton
						id={'esModalClose'}
						onClick={()=>setShowEditESIndexModal(false)}
						style={{margin:'10px'}}
						buttonColor={'#8091A5'}
					>
						Close
					</GCButton>
					<GCButton
						id={'esModalReset'}
						onClick={()=> {
							changeEsIndex(true);
							setShowEditESIndexModal(false);
						}}
						style={{margin:'10px'}}
						buttonColor={'#8091A5'}
					>
						Set to Default
					</GCButton>
					<GCButton
						id={'esModalSubmit'}
						onClick={() => {
							changeEsIndex(false);
							setShowEditESIndexModal(false);
						}}
						style={{margin:'10px'}}
					>
						Submit
					</GCButton>
				</div>
			</Modal>
			
			{/* {tutorialData && 
					<TutorialOverlayModal 
						isOpen={tutorialModalOpen} 
						closeModal={() => setTutorialModalOpen(false)}
						allTutorials={tutorialData}
						fromGC
					/>
			}*/}
		</div>
	);
}

export default GamechangerAdminPage;
