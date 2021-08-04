import React, {useState, useContext, useEffect} from 'react';
import GameChangerAPI from '../components/api/gameChanger-service-api';
import UOTAlert from '../components/common/GCAlert';
import { SlideOutToolContext } from "@dod-advana/advana-side-nav/dist/SlideOutMenuContext";
import { TextField, Tooltip, Typography, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Link } from "@material-ui/core";
import {ConstrainedIcon, PageLink} from "@dod-advana/advana-side-nav/dist/SlideOutMenu";
import Permissions from "@dod-advana/advana-platform-ui/dist/utilities/permissions";
import AdminIcon from "../images/icon/AdminIcon.png";
import CloneIcon from "../images/icon/CloneIcon.png";
import AuthIcon from "../images/icon/Authority.png";
import AnalystToolsIcon from '../images/icon/analyticswht.png';
import ReportIcon from '../images/icon/slideout-menu/reports icon.png';

import DashboardIcon from '../images/icon/slideout-menu/dashboard icon.png';
import SearchBanner from "../components/searchBar/GCSearchBanner";
import _ from "underscore";
import "react-table/react-table.css";
import {Snackbar} from "@material-ui/core";
import GCButton from "../components/common/GCButton";
import Modal from 'react-modal';
import MLDashboard from '../components/admin/MLDashboard';
import GeneralAdminButtons from '../components/admin/GeneralAdminButtons';
import NotificationsManagement from '../components/notifications/NotificationsManagement';
import GCTrendingBlacklist from '../components/admin/GCTrendingBlacklist';
import InternalUsersManagement from '../components/user/InternalUserManagement';
import GamechangerAppStats from '../components/searchMetrics/GamechangerAppStats';
import SearchPdfMapping from '../components/admin/SearchPdfMapping';
import CloneList from '../components/admin/CloneList';
import AdminList from '../components/admin/AdminList';
import APIRequests from '../components/admin/APIRequests';
import HomepageEditor from '../components/admin/HomepageEditor';
import {generateClosedContentArea, generateOpenedContentArea} from '../components/admin/ContentArea';

import FormControlLabel from "@material-ui/core/FormControlLabel";
import CloseIcon from "@material-ui/icons/Close";
import { AddAlert, SupervisedUserCircle } from '@material-ui/icons';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import CreateIcon from '@material-ui/icons/Create';
import { trackEvent } from '../components/telemetry/Matomo';
import SlideOutMenuContent from '@dod-advana/advana-side-nav/dist/SlideOutMenuContent';
// import TutorialOverlayModal from '@dod-advana/advana-tutorial-overlay/dist/TutorialOverlayModal';
import { HoverNavItem } from '../components/navigation/NavItems'
// import UoTAPI from '../components/advana/api/api';
import GCAccordion from "../components/common/GCAccordion";
import {styles, TableRow, GCCheckbox, useStyles, toolTheme} from '../components/admin/GCAdminStyles';

const gameChangerAPI = new GameChangerAPI();

const isDecoupled = window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' || process.env.REACT_APP_GC_DECOUPLED === 'true';

const PAGES = {
	general: 'General',
	cloneList: 'CloneList',
	searchPdfMapping: 'searchPdfMapping',
	adminList: 'AdminList',
	mlDashboard: 'mlDashboard',
	notifications: 'Notifications',
	internalUsers: 'Internal Users',
	appStats: 'Application Stats',
	apiKeys: 'API Keys',
	homepageEditor: 'Homepage Editor'

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
	const [editAdminData, setEditAdminData] = useState({});


	const [editorTableData, setEditorTableData] = useState({topics:[],major_pubs:[]});
	const [showAddEditorTermDialog, setShowAddEditorTermDialog] = useState(false);
	const [editorAddTerm, setEditorAddTerm] = useState({value:'', section:'topic'});
	const [showSavedSnackbar, setShowSavedSnackbar] = useState(false);
	const [loginModalOpen, setLoginModalOpen] = useState(false);

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

	const createAlert = (title, type, message) => {
		setAlertTitle(title);
		setAlertType(type);
		setAlertMessage(message);
		setAlertActive(true);
	}

	const closeTrendingBlacklistModal = () => {
		setShowTrendingBlacklistModal(false);
	}



	const handleAddRow = (key, value) => {
		const tmp = {...editorTableData};
		tmp[key].push({name:value});
		setEditorTableData(tmp);
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
	const openCloneModal = (num=-99) =>{
		setEditCloneID(num);
        setShowCreateEditCloneModal(true);
	}

	const closeAdminModal = () => {
		setEditAdminID(-99);
		setEditAdminData({});
		setShowCreateEditAdminModal(false);
	}

	const openAdminModal = (num=-99) =>{
		setEditAdminID(-99);
		setShowCreateEditAdminModal(true);
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
				setPageToView(PAGES.cloneList);
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
				setPageToView(PAGES.adminList);
			}
		});

	}
	
	
	const openTrendingBlacklistModal = () => {
		setShowTrendingBlacklistModal(true);
	}
	const openEsIndexModal = () => {
		setShowEditESIndexModal(true);
	}
	const renderSwitch = (page) => {
		trackEvent('GAMECHANGER_Admin', "ChangeAdminPage", "onChange", page.toString());

		switch(page) {
			case PAGES.general:
				return <GeneralAdminButtons createAlert={createAlert} openEsIndexModal={openEsIndexModal} openTrendingBlacklistModal={openTrendingBlacklistModal} />;
			case PAGES.cloneList:
				return (<CloneList 
							openCloneModal={openCloneModal} 
							setPageToView={()=>setPageToView(PAGES.cloneList)} 
							setGCCloneTableData={setGCCloneTableData}
							setCloneTableMetaData={setCloneTableMetaData}
							storeCloneData={storeCloneData}
						/>);
			case PAGES.searchPdfMapping:
				return <SearchPdfMapping />;
			case PAGES.mlDashboard:
				return <MLDashboard />;
			case PAGES.adminList:
				return (<AdminList 
							setPageToView={()=>setPageToView(PAGES.adminList)}
							openAdminModal={openAdminModal}
						/>)
			case PAGES.notifications:
				return <NotificationsManagement />;
			case PAGES.internalUsers:
				return <InternalUsersManagement />;
			case PAGES.appStats:
				return <GamechangerAppStats />;
			case PAGES.apiKeys:
				return <APIRequests />
			case PAGES.homepageEditor:
				return (<HomepageEditor 
							editorTableData={editorTableData} 
							setEditorTableData={setEditorTableData} 
							setEditorAddTerm={setEditorAddTerm} 
							editorAddTerm={editorAddTerm} 
							setShowAddEditorTermDialog={setShowAddEditorTermDialog} 
							setShowSavedSnackbar={setShowSavedSnackbar}
						/>)
			default:
				return <GeneralAdminButtons createAlert={createAlert} openEsIndexModal={openEsIndexModal} openTrendingBlacklistModal={openTrendingBlacklistModal} />
		}
	}
	
	const setLoginModal = (open) => {
		setLoginModalOpen(open);
	}
	
	return (
		<div style={{ minHeight: 'calc(100vh - 120px)' }}>

			<SlideOutMenuContent type="closed">{generateClosedContentArea({ setPageToView})}</SlideOutMenuContent>
			<SlideOutMenuContent type="open">{generateOpenedContentArea({ setPageToView})}</SlideOutMenuContent>

			<SearchBanner
				onTitleClick={() => {
					window.location.href = `#/gamechanger-admin`;
					setPageToView(PAGES.general);
				}}
				titleBarModule={'admin/adminTitleBarHandler'}
				jupiter={jupiter}
				rawSearchResults={[]}
				loginModalOpen={loginModalOpen}
				setLoginModal={setLoginModal}
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

			<Dialog
				open={showAddEditorTermDialog}
				scroll={'paper'}
				maxWidth='300px'
			>
				<TextField
					id="margin-dense"
					onBlur={event => setEditorAddTerm({...editorAddTerm, value:event.target.value})}
					className={classes.textField}
					style={{padding:10}}
					helperText="Term to add..."
					margin="dense"
				/>
				<div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', padding:10}}>
					<GCButton
						id={'addTermSubmit'}
						onClick={()=>{
							setEditorAddTerm({value:'', section:'topic'});
							handleAddRow(editorAddTerm.section, editorAddTerm.value)
							setShowAddEditorTermDialog(false);
						}}
						style={{margin:'10px'}}
					>
						Submit
					</GCButton>
					<GCButton
						id={'addTermCancel'}
						onClick={()=>{
							setEditorAddTerm({value:'', section:'topic'});
							setShowAddEditorTermDialog(false);
						}}
						style={{margin:'10px'}}
					>
						Cancel
					</GCButton>
				</div>
			</Dialog>

			<Snackbar
				style={{marginTop: 20}}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				open={showSavedSnackbar}
				autoHideDuration={3000}
				onClose={() => setShowSavedSnackbar(false)}
				message={`Saved`}
			/>

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
		</div>
	);
}
export default GamechangerAdminPage;