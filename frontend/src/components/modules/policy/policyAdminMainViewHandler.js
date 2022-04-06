import React from 'react';
import NotificationsManagement from '../../notifications/NotificationsManagement';
import UserList from '../../admin/UserList';
import { Tooltip } from '@material-ui/core';
import { HoverNavItem } from '../../navigation/NavItems';
import { GCCheckbox, styles, TableRow, toolTheme } from '../../admin/util/GCAdminStyles';
import AdminIcon from '../../../images/icon/AdminIcon.png';
import NewAdminIcon from '../../../images/icon/NewAdminIcon.png';
import { AddAlert, SupervisedUserCircle } from '@material-ui/icons';
import { ConstrainedIcon, PageLink } from '@dod-advana/advana-side-nav/dist/SlideOutMenu';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import defaultAdminMainViewHandler from '../default/defaultAdminMainViewHandler';
import GCTooltip from '../../common/GCToolTip';

const PAGES = {
	general: 'General',
	userList: 'Users',
	notifications: 'Notifications',
};

const renderGeneralAdminButtons = () => {
	return <></>;
};

const userListTableAdditions = [
	{
		Header: 'Internal User',
		accessor: 'extra_fields.gamechanger.is_internal',
		width: 160,
		Cell: (row) => (
			<TableRow>
				<GCCheckbox
					checked={row.value}
					onChange={() => {}}
					name={'is_internal'}
					color="inherit"
					style={{ ...styles.checkbox, color: '#1C2D64' }}
				/>
			</TableRow>
		),
	},
	{
		Header: 'Beta User',
		accessor: 'extra_fields.gamechanger.is_beta',
		width: 160,
		Cell: (row) => (
			<TableRow>
				<GCCheckbox
					checked={row.value}
					onChange={() => {}}
					name={'beta_user'}
					color="inherit"
					style={{ ...styles.checkbox, color: '#1C2D64' }}
				/>
			</TableRow>
		),
	},
	{
		Header: 'Admin',
		accessor: 'extra_fields.gamechanger.is_admin',
		width: 100,
		Cell: (row) => (
			<TableRow>
				<GCCheckbox
					checked={row.value}
					onChange={() => {}}
					name={'admin'}
					color="inherit"
					style={{ ...styles.checkbox, color: '#1C2D64' }}
				/>
			</TableRow>
		),
	},
];

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
				return <UserList cloneName={cloneName} columns={userListTableAdditions} />;
			default:
				return renderGeneralAdminButtons();
		}
	},

	closedAdminMenu: (setPageToView, pages, cloneName) => {
		return (
			<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
						<HoverNavItem centered onClick={() => setPageToView(PAGES.notifications)} toolTheme={toolTheme}>
							<AddAlert style={{ fontSize: 30 }} />
						</HoverNavItem>
					</Tooltip>
				)}

				{Permissions.permissionValidator(`${cloneName} Admin`, true) && (
					<Tooltip title="Manage Users" placement="right" arrow>
						<HoverNavItem centered onClick={() => setPageToView(PAGES.userList)} toolTheme={toolTheme}>
							<SupervisedUserCircle style={{ fontSize: 30 }} />
						</HoverNavItem>
					</Tooltip>
				)}

				{Permissions.permissionValidator(`Gamechanger Super Admin`, true) && (
					<GCTooltip title="Admin Page" placement="right" arrow>
						<PageLink href={`#/gamechanger-admin`} centered style={{ width: '100%' }}>
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
						<HoverNavItem onClick={() => setPageToView(PAGES.notifications)} toolTheme={toolTheme}>
							<AddAlert style={{ fontSize: 30 }} />
							<span style={{ marginLeft: '5px' }}>Show Notifications</span>
						</HoverNavItem>
					</Tooltip>
				)}

				{Permissions.permissionValidator(`${cloneName} Admin`, true) && (
					<Tooltip title="Manage Users" placement="right" arrow>
						<HoverNavItem onClick={() => setPageToView(PAGES.userList)} toolTheme={toolTheme}>
							<SupervisedUserCircle style={{ fontSize: 30 }} />
							<span style={{ marginLeft: '5px' }}>Manage Users</span>
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
	},
};

export default PolicyAdminMainViewHandler;
