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

const PAGES = {
	general: 'General',
	userList: 'UserList',
	reviewerList: 'ReviewerList',
	notifications: 'Notifications',
};

const userListColumns = [
	{
		Header: 'First',
		accessor: 'first_name',
		Cell: row => (
			<TableRow>{row.value}</TableRow>
		)
	},
	{
		Header: 'Last',
		accessor: 'last_name',
		Cell: row => (
			<TableRow>{row.value}</TableRow>
		)
	},
	{
		Header: 'Organization',
		accessor: 'organization',
		Cell: row => (
			<TableRow>{row.value}</TableRow>
		)
	},
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

const renderGeneralAdminButtons = () => {
	return (<></>);
}

const PolicyAdminMainViewHandler = {
	getPages: () => {
		return PAGES;
	},

	renderSwitch: (page, cloneName) => {
		switch (page) {
			case PAGES.general:
				return renderGeneralAdminButtons();
			case PAGES.notifications:
				return <NotificationsManagement cloneName={cloneName} />;
			case PAGES.userList:
				return <UserList cloneName={cloneName} columns={userListColumns} />;
			case PAGES.reviewerList:
				return <ReviewerList cloneName={cloneName} />;
			default:
				return renderGeneralAdminButtons();
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

export default PolicyAdminMainViewHandler;
