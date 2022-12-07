import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withStyles } from '@material-ui/core/styles';
import { trackEvent } from '../../../telemetry/Matomo';
import { Tabs, Tab, TabPanel, TabList } from 'react-tabs';
import { Typography } from '@material-ui/core';
import { backgroundGreyDark, backgroundWhite, gcOrange } from '../../../common/gc-colors';
import makeStyles from '@material-ui/core/styles/makeStyles';
import GCButton from '../../../common/GCButton';
import Popper from '@material-ui/core/Popper';
import Badge from '@material-ui/core/Badge';
import { getTrackingNameForFactory } from '../../../../utils/gamechangerUtils';
import 'react-table/react-table.css';
import GCAccordion from '../../../common/GCAccordion';
import { clearDashboardNotification } from '../../../../utils/sharedFunctions';
import GroupsPanel from './GroupsPanel';
import HistoryPanel from './historyPanel';
import FavoritesPanel from './favoritesPanel';

const StyledBadge = withStyles(() => ({
	badge: {
		backgroundColor: '#AD0000',
		right: '-11px !important',
		top: 0,
		color: 'white',
		fontSize: 12,
		minWidth: 15,
		width: 16,
		height: 16,
	},
}))(Badge);

const TabContainer = styled.div`
	align-items: center;
	min-height: 613px;

	.tab-button-container {
		width: 100%;
		display: flex;
		align-items: center;
	}

	.tabs-list {
		border-bottom: 2px solid ${gcOrange};
		padding: 0;
		display: flex;
		align-items: center;
		flex: 9;
		margin: 10px !important;
	}

	.panel-container {
		align-items: center;
		margin: 10px;
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
		boxShadow: 'unset',
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
			marginLeft: 'unset',
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				height: '24px',
				fontSize: '14px',
			},
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: (props) => (props.error ? 'red' : 'inherit'),
			},
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
			marginLeft: 'unset',
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				fontSize: '14px',
			},
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: (props) => (props.error ? 'red' : 'inherit'),
			},
		},
	},
	modalTextField: {
		marginTop: '14px',
		paddingBottom: '8px',
		height: 'auto',
		width: '100%',
		'& .MuiFormHelperText-root': {
			fontSize: 14,
			marginLeft: 'unset',
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				height: '24px',
				fontSize: '14px',
			},
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: (props) => (props.error ? 'red' : 'inherit'),
			},
		},
	},
	modalTextArea: {
		marginTop: '14px',
		paddingBottom: '8px',
		height: 'auto',
		width: '100%',
		'& .MuiFormHelperText-root': {
			fontSize: 14,
			marginLeft: 'unset',
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				fontSize: '14px',
			},
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: (props) => (props.error ? 'red' : 'inherit'),
			},
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
				`url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath` +
				` fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 ` +
				`1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23E9691D'/%3E%3C/svg%3E")`,
			content: '""',
		},
		'input:hover ~ &': {
			backgroundColor: '#ebf1f5',
		},
	},
	newGroupModal: {
		position: 'fixed',
		top: '35%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		backgroundColor: 'white',
		zIndex: 9999,
		border: '1px solid #CCD8E5',
		boxShadow: '0px 12px 14px #00000080',
		borderRadius: '6px',
		padding: 15,
	},
	addToGroupModal: {
		position: 'fixed',
		top: '35%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		backgroundColor: 'white',
		zIndex: 1000,
		border: '1px solid #CCD8E5',
		boxShadow: '0px 12px 14px #00000080',
		borderRadius: '6px',
		padding: 15,
	},
	label: {
		fontSize: 14,
		maxWidth: 350,
	},
	labelFont: {
		backgroundColor: 'white',
		padding: '0px 10px',
	},
}));

const GCUserDashboard = React.memo((props) => {
	const {
		userData,
		updateUserData,
		handleSaveFavoriteDocument,
		handleDeleteSearch,
		handleClearFavoriteSearchNotification,
		saveFavoriteSearch,
		handleFavoriteTopic,
		handleFavoriteOrganization,
		cloneData,
		state,
		dispatch,
	} = props;

	const [tIndex, setTabIndex] = useState(0);

	const [apiKeyPopperAnchorEl, setAPIKeyPopperAnchorEl] = useState(null);
	const [apiKeyPopperOpen, setAPIKeyPopperOpen] = useState(false);

	const [favoriteSearchesSlice, setFavoriteSearchesSlice] = useState([]);

	const [reload, setReload] = useState(false);

	const classes = useStyles();

	const [documentGroups, setDocumentGroups] = useState([]);

	useEffect(() => {
		if (userData === null) return;

		if (userData.favorite_groups) {
			setDocumentGroups(userData.favorite_groups);
		}
	}, [userData, cloneData.clone_name, cloneData.url]);

	const handleTabClicked = (tabIndex, _lastIndex, event) => {
		const tabName = event.target.title;
		trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'UserDashboardTab', `onClick${tabName}`);
		setTabIndex(tabIndex);
	};

	const handleDeleteFavoriteSearch = async (idx) => {
		favoriteSearchesSlice[idx].favorite = false;
		handleDeleteSearch(favoriteSearchesSlice[idx]);
		updateUserData();
	};

	const renderGroups = () => {
		return (
			<div>
				<GCAccordion expanded={true} header={'DOCUMENT GROUPS'} itemCount={documentGroups.length}>
					<GroupsPanel state={state} dispatch={dispatch} documentGroups={documentGroups} />
				</GCAccordion>
			</div>
		);
	};

	const tabList = [];
	const favoritesTabMeta = {
		title: 'userFavorites',
		onClick: () => clearDashboardNotification(cloneData.clone_name, 'favorites', state, dispatch),
		children: (
			<StyledBadge
				badgeContent={
					userData?.notifications ? userData.notifications[cloneData.clone_name]?.favorites : undefined
				}
			>
				<Typography variant="h6" display="inline" title="cardView">
					FAVORITES
				</Typography>
			</StyledBadge>
		),
		panel: (
			<FavoritesPanel
				userData={userData}
				cloneData={cloneData}
				handleFavoriteTopic={handleFavoriteTopic}
				handleFavoriteOrganization={handleFavoriteOrganization}
				handleSaveFavoriteDocument={handleSaveFavoriteDocument}
				reload={reload}
				setReload={setReload}
				updateUserData={updateUserData}
				classes={classes}
				handleClearFavoriteSearchNotification={handleClearFavoriteSearchNotification}
				handleDeleteFavoriteSearch={handleDeleteFavoriteSearch}
				favoriteSearchesSlice={favoriteSearchesSlice}
				setFavoriteSearchesSlice={setFavoriteSearchesSlice}
				documentGroups={documentGroups}
			/>
		),
	};
	const historyTabMeta = {
		title: 'userHistory',
		children: (
			<Typography variant="h6" display="inline" title="cardView">
				HISTORY
			</Typography>
		),
		panel: (
			<HistoryPanel
				userData={userData}
				handleDeleteFavoriteSearch={handleDeleteFavoriteSearch}
				reload={reload}
				setReload={setReload}
				saveFavoriteSearch={saveFavoriteSearch}
				cloneData={cloneData}
				classes={classes}
			/>
		),
	};
	const groupTabMeta = {
		title: 'userGroups',
		children: (
			<Typography variant="h6" display="inline" title="cardView">
				GROUPS
			</Typography>
		),
		panel: renderGroups(),
	};
	if (cloneData.user_favorites) tabList.push(favoritesTabMeta, groupTabMeta);
	tabList.push(historyTabMeta);

	return (
		<TabContainer id="gc-user-dash">
			<Tabs onSelect={(tabIndex, lastIndex, event) => handleTabClicked(tabIndex, lastIndex, event)}>
				<div className={'tab-button-container'}>
					<TabList className={'tabs-list'}>
						{tabList.map((tab, index) => {
							const tl = index === 0 ? '5px' : '0';
							const tr = index === tabList.length - 1 ? '5px' : '0';
							return (
								<Tab
									style={{
										...styles.tabStyle,
										...(tIndex === index ? styles.tabSelectedStyle : {}),
										borderRadius: `${tl} ${tr} 0 0`,
									}}
									title={tab.title}
									onClick={tab.onClick}
								>
									{tab.children}
								</Tab>
							);
						})}
					</TabList>

					<div style={styles.spacer} />
					{userData.api_key && (
						<Typography
							variant="body"
							display="inline"
							title="API Key"
							style={{
								marginTop: '30px',
								marginLeft: '10px',
								marginRight: '15px',
								cursor: 'pointer',
								color: 'rgb(6, 159, 217)',
							}}
							onClick={(event) => {
								setAPIKeyPopperAnchorEl(event.currentTarget);
								setAPIKeyPopperOpen(true);
							}}
						>
							View API Key
						</Typography>
					)}
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
						<div
							style={{
								padding: '10px',
								background: 'white',
								border: '1px solid',
							}}
						>
							<Typography
								style={{
									fontSize: '14px',
									fontWeight: '900',
									marginBottom: '5px',
								}}
								className={classes.typography}
							>
								{userData.api_key}
							</Typography>
							<div style={{ display: 'flex', justifyContent: 'center' }}>
								<GCButton
									onClick={() => {
										navigator.clipboard.writeText(userData.api_key);
										setAPIKeyPopperOpen(false);
									}}
								>
									Copy Key
								</GCButton>
								<GCButton
									onClick={() => {
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

				<div className={'panel-container'}>
					{tabList.map((tab) => (
						<TabPanel> {tab.panel} </TabPanel>
					))}
				</div>
			</Tabs>
		</TabContainer>
	);
});

const styles = {
	menuItem: {
		fontSize: 16,
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
	panelContainer: {
		alignItems: 'center',
		marginTop: 10,
		margin: '20px 72px 0 80px',
		minHeight: 'calc(100vh - 600px)',
		paddingBottom: 20,
	},

	modalError: {
		color: '#f44336',
	},
};

GCUserDashboard.propTypes = {
	userData: PropTypes.shape({
		favorite_searches: PropTypes.arrayOf(
			PropTypes.shape({
				url: PropTypes.string,
			})
		),
		search_history: PropTypes.arrayOf(
			PropTypes.shape({
				url: PropTypes.string,
			})
		),
		favorite_documents: PropTypes.arrayOf(PropTypes.object),
		export_history: PropTypes.arrayOf(
			PropTypes.shape({
				download_request_body: PropTypes.shape({
					orgFilter: PropTypes.objectOf(PropTypes.bool),
					format: PropTypes.string,
				}),
			})
		),
		favorite_topics: PropTypes.arrayOf(PropTypes.object),
		favorite_organizations: PropTypes.arrayOf(PropTypes.object),
		notifications: PropTypes.objectOf(PropTypes.object),
		api_key: PropTypes.string,
	}),
	updateUserData: PropTypes.func,
	handleSaveFavoriteDocument: PropTypes.func,
	handleDeleteSearch: PropTypes.func,
	handleClearFavoriteSearchNotification: PropTypes.func,
	saveFavoriteSearch: PropTypes.func,
	handleFavoriteTopic: PropTypes.func,
	handleFavoriteOrganization: PropTypes.func,
	cloneData: PropTypes.shape({
		clone_name: PropTypes.string,
	}),
};

export default GCUserDashboard;
