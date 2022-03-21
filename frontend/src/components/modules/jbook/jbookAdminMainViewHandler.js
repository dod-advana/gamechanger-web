import React from 'react';
import NotificationsManagement from '../../notifications/NotificationsManagement';
import UserList from '../../admin/UserList';
import {Tooltip} from '@material-ui/core';
import {HoverNavItem} from '../../navigation/NavItems';
import {toolTheme, TableRow, GCCheckbox, styles} from '../../admin/util/GCAdminStyles';
import AdminIcon from '../../../images/icon/AdminIcon.png';
import NewAdminIcon from '../../../images/icon/NewAdminIcon.png';
import {AddAlert} from '@material-ui/icons';
import { ConstrainedIcon, PageLink } from '@dod-advana/advana-side-nav/dist/SlideOutMenu';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import defaultAdminMainViewHandler from '../default/defaultAdminMainViewHandler';
import GCTooltip from '../../common/GCToolTip';
import ReviewerList from '../../admin/ReviewerList';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import RateReviewIcon from '@mui/icons-material/RateReview';
import GeneralAdminButtons from './jbookGeneralButtons';
import GamechangerUserManagementAPI from '../../api/GamechangerUserManagement';
import GCButton from '../../common/GCButton';
import {Typography} from '@mui/material';

const gameChangerUserAPI = new GamechangerUserManagementAPI();

const PAGES = {
	general: 'General',
	userList: 'UserList',
	reviewerList: 'ReviewerList',
	notifications: 'Notifications',
};

const userListTableAdditions = [
	{
		Header: 'Primary Reviewer',
		accessor: 'extra_fields.jbook.is_primary_reviewer',
		width: 160,
		Cell: row => (
			<TableRow>
				<GCCheckbox
					checked={row.value}
					onChange={() => {}}
					name={'primary_reviewer'}
					color="inherit"
					style={{...styles.checkbox, color: '#1C2D64'}}
				/>
			</TableRow>
		)
	},
	{
		Header: 'Service Reviewer',
		accessor: 'extra_fields.jbook.is_service_reviewer',
		width: 160,
		Cell: row => (
			<TableRow>
				<GCCheckbox
					checked={row.value}
					onChange={() => {}}
					name={'service_reviewer'}
					color="inherit"
					style={{...styles.checkbox, color: '#1C2D64'}}
				/>
			</TableRow>
		)
	},
	{
		Header: 'POC Reviewer',
		accessor: 'extra_fields.jbook.is_poc_reviewer',
		width: 160,
		Cell: row => (
			<TableRow>
				<GCCheckbox
					checked={row.value}
					onChange={() => {}}
					name={'poc_reviewer'}
					color="inherit"
					style={{...styles.checkbox, color: '#1C2D64'}}
				/>
			</TableRow>
		)
	},
	{
		Header: 'Admin',
		accessor: 'extra_fields.jbook.is_admin',
		width: 100,
		Cell: row => (
			<TableRow>
				<GCCheckbox
					checked={row.value}
					onChange={() => {}}
					name={'admin'}
					color="inherit"
					style={{...styles.checkbox, color: '#1C2D64'}}
				/>
			</TableRow>
		)
	}
];

const autoDownloadFile = ({ data, filename = 'results', extension = 'txt' }) => {
	//Create a link element, hide it, direct it towards the blob, and then 'click' it programatically
	console.log('autodownload file');

	const a = document.createElement('a');
	a.style = 'display: none';
	document.body.appendChild(a);
	//Create a DOMString representing the blob
	//and point the link element towards it
	const url = window.URL.createObjectURL(data);
	a.href = url;
	a.download = `${filename}.${extension}`;
	//programatically click the link to trigger the download
	a.click();
	//release the reference to the file by revoking the Object URL
	window.URL.revokeObjectURL(url);
	document.body.removeChild(a);
};

const renderManageUsersTitleAdditions = () => {
	return (
		<GCButton
			onClick={async () => {
				const data = await gameChangerUserAPI.exportUsers({
					cloneName: 'jbook',
				});
				const blob = new Blob([data.data], { type: 'text/csv;charset=utf-8' });
				const d = new Date();
				await autoDownloadFile({data: blob, extension: 'csv', filename: 'user-data-' + d.toISOString()});
			}}
			style={{minWidth: 'unset', backgroundColor: '#1C2D64', borderColor: '#1C2D64'}}
		>Download</GCButton>
	);
};

const renderDescriptionAdditions = () => {
	return (
		<div style={{ background: '#f2f2f2', borderRadius: 6, margin: '0 80px 20px 80px', padding: 10 }}>
			<Typography style={{ fontFamily: 'Montserrat', fontSize: 16 }}>The table below lists all users that have visited JBOOK Search to date. Permissions and basic user information can be edited here.</Typography>
		</div>
	);
};

const JBookAdminMainViewHandler = {
	getPages: () => {
		return PAGES;
	},

	renderSwitch: (page, cloneName) => {
		switch (page) {
			case PAGES.general:
				return <GeneralAdminButtons />;
			case PAGES.notifications:
				return <NotificationsManagement cloneName={cloneName} />;
			case PAGES.userList:
				return <UserList
					cloneName={cloneName}
					columns={userListTableAdditions}
					title={'User Permissions'}
					titleAdditions={renderManageUsersTitleAdditions}
					descripitionAdditions={renderDescriptionAdditions}
				/>;
			case PAGES.reviewerList:
				return <ReviewerList cloneName={cloneName} />;
			default:
				return <GeneralAdminButtons />;
		}
	},
	
	closedAdminMenu: (setPageToView, pages, cloneName) => {
		return (
			<div
				style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
			>
				{Permissions.permissionValidator(`${cloneName} Admin`, true) && (
					<Tooltip title="Admin Page" placement="right" arrow>
						<HoverNavItem
							centered
							onClick={() => {
								setPageToView(PAGES.general);
								return false;
							}}
							toolTheme={toolTheme}
						>
							<ConstrainedIcon src={AdminIcon} />
						</HoverNavItem>
					</Tooltip>
				)}

				{Permissions.permissionValidator(`${cloneName} Admin`, true) && (
					<Tooltip title="Service Notifications" placement="right" arrow>
						<HoverNavItem
							centered
							onClick={() => setPageToView(PAGES.notifications)}
							toolTheme={toolTheme}
						>
							<AddAlert style={{ fontSize: 30 }} />
						</HoverNavItem>
					</Tooltip>
				)}
	
				{Permissions.permissionValidator(`${cloneName} Admin`, true) && (
					<Tooltip title="User Permissions" placement="right" arrow>
						<HoverNavItem
							centered
							onClick={() => setPageToView(PAGES.userList)}
							toolTheme={toolTheme}
						>
							<ManageAccountsIcon style={{ fontSize: 30 }} />
						</HoverNavItem>
					</Tooltip>
				)}

				{Permissions.permissionValidator(`${cloneName} Admin`, true) && (
					<Tooltip title="Add/Edit Reviewers" placement="right" arrow>
						<HoverNavItem
							centered
							onClick={() => setPageToView(PAGES.reviewerList)}
							toolTheme={toolTheme}
						>
							<RateReviewIcon style={{ fontSize: 30 }} />
						</HoverNavItem>
					</Tooltip>
				)}

				{Permissions.permissionValidator(`Gamechanger Super Admin`, true) && (
					<GCTooltip title="Admin Page" placement="right" arrow>
						<PageLink
							href={`#/gamechanger-admin`}
							centered
							style={{ width: '100%' }}
						>
							<HoverNavItem centered toolTheme={toolTheme}>
								<ConstrainedIcon src={NewAdminIcon} />
							</HoverNavItem>
						</PageLink>
					</GCTooltip>
				)}

			</div>
		);
	},
	
	openedAdminMenu: (setPageToView, pages, cloneName) => {
		return (
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				{Permissions.permissionValidator(`${cloneName} Admin`, true) && (
					<Tooltip title="Admin Page" placement="right" arrow>
						<HoverNavItem
							onClick={() => {
								setPageToView(PAGES.general);
								return false;
							}}
							toolTheme={toolTheme}
						>
							<ConstrainedIcon src={AdminIcon} />
							<span style={{ marginLeft: '10px' }}>Admin Page</span>
						</HoverNavItem>
					</Tooltip>
				)}

				{Permissions.permissionValidator(`${cloneName} Admin`, true) && (
					<Tooltip title="Show Notifications" placement="right" arrow>
						<HoverNavItem
							onClick={() => setPageToView(PAGES.notifications)}
							toolTheme={toolTheme}
						>
							<AddAlert style={{ fontSize: 30 }} />
							<span style={{ marginLeft: '5px' }}>Show Notifications</span>
						</HoverNavItem>
					</Tooltip>
				)}

				{Permissions.permissionValidator(`${cloneName} Admin`, true) && (
					<Tooltip title="User Permissions" placement="right" arrow>
						<HoverNavItem
							onClick={() => setPageToView(PAGES.userList)}
							toolTheme={toolTheme}
						>
							<ManageAccountsIcon style={{ fontSize: 30 }} />
							<span style={{ marginLeft: '5px' }}>User Permissions</span>
						</HoverNavItem>
					</Tooltip>
				)}

				{Permissions.permissionValidator(`${cloneName} Admin`, true) && (
					<Tooltip title="Add/Edit Reviewers" placement="right" arrow>
						<HoverNavItem
							onClick={() => setPageToView(PAGES.reviewerList)}
							toolTheme={toolTheme}
						>
							<RateReviewIcon style={{ fontSize: 30 }} />
							<span style={{ marginLeft: '5px' }}>Add/Edit Reviewers</span>
						</HoverNavItem>
					</Tooltip>
				)}

				{Permissions.permissionValidator(`Gamechanger Super Admin`, true) && (
					<GCTooltip title="Admin Page" placement="right" arrow>
						<PageLink href={`#/gamechanger-admin`}>
							<HoverNavItem toolTheme={toolTheme}>
								<ConstrainedIcon src={NewAdminIcon} />
								<span style={{ marginLeft: '10px' }}>Admin Page</span>
							</HoverNavItem>
						</PageLink>
					</GCTooltip>
				)}
			</div>
		);
	},
	
	getToolTheme: (cloneData) => {
		return defaultAdminMainViewHandler.getToolTheme(cloneData);
	}
};

export default JBookAdminMainViewHandler;
