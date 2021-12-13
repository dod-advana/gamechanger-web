import React from 'react';
import { Tooltip } from '@material-ui/core';
import { ConstrainedIcon } from '@dod-advana/advana-side-nav/dist/SlideOutMenu';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import { AddAlert, SupervisedUserCircle } from '@material-ui/icons';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import CreateIcon from '@material-ui/icons/Create';

import AdminIcon from '../../images/icon/AdminIcon.png';
import CloneIcon from '../../images/icon/CloneIcon.png';
import AuthIcon from '../../images/icon/Authority.png';
import AnalystToolsIcon from '../../images/icon/analyticswht.png';
import DocumumentIcon from '../../images/icon/Document.png'
import ReportIcon from '../../images/icon/slideout-menu/reports icon.png';
import DashboardIcon from '../../images/icon/slideout-menu/dashboard icon.png';
import { HoverNavItem } from '../../components/navigation/NavItems';
import { toolTheme } from './util/GCAdminStyles';
/**
 * This file containes two components ClosedAdminMenu and OpenedAdminMenu
 * Both of theses components are the admin page menu on the left and have a list of buttons with icons.
 * When you click on a button from the menu it renders that page in the main open area.
 */
const isDecoupled =
	window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' ||
	process.env.REACT_APP_GC_DECOUPLED === 'true';
/**
 * @class ClosedAdminMenu
 * @param {method} props.setPageToView - Renders the selected component in the open space
 * @param {Object} props.PAGES  - a dictionary of component names to pass into setPageToView
 */
const ClosedAdminMenu = ({ setPageToView, PAGES }) => {
	return (
		<div
			style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
		>
			{Permissions.isGameChangerAdmin() && (
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

			{Permissions.isGameChangerAdmin() && isDecoupled && (
				<Tooltip title="Manage Admins" placement="right" arrow>
					<HoverNavItem
						centered
						onClick={() => {
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
						setPageToView(PAGES.cloneList);
						return false;
					}}
					toolTheme={toolTheme}
				>
					<ConstrainedIcon src={CloneIcon} />
				</HoverNavItem>
			</Tooltip>

			<Tooltip title="Service Notifications" placement="right" arrow>
				<HoverNavItem
					centered
					onClick={() => setPageToView(PAGES.notifications)}
					toolTheme={toolTheme}
				>
					<AddAlert style={{ fontSize: 30 }} />
				</HoverNavItem>
			</Tooltip>

			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Manage Internal Users" placement="right" arrow>
					<HoverNavItem
						centered
						onClick={() => setPageToView(PAGES.internalUsers)}
						toolTheme={toolTheme}
					>
						<SupervisedUserCircle style={{ fontSize: 30 }} />
					</HoverNavItem>
				</Tooltip>
			)}
			<Tooltip title="ML Dashboard" placement="right" arrow>
				<HoverNavItem
					centered
					onClick={() => {
						setPageToView(PAGES.mlDashboard);
						return false;
					}}
					toolTheme={toolTheme}
				>
					<ConstrainedIcon src={DashboardIcon} />
				</HoverNavItem>
			</Tooltip>
			<Tooltip title="User Tracker Tools" placement="right" arrow>
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
					}}
				>
					<ConstrainedIcon src={AnalystToolsIcon} />
				</HoverNavItem>
			</Tooltip>

			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Manage API Keys" placement="right" arrow>
					<HoverNavItem
						centered
						onClick={() => {
							setPageToView(PAGES.apiKeys);
						}}
						toolTheme={toolTheme}
					>
						<VpnKeyIcon style={{ fontSize: 30 }} />
					</HoverNavItem>
				</Tooltip>
			)}

			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Homepage Editor" placement="right" arrow>
					<HoverNavItem
						centered
						onClick={() => {
							setPageToView(PAGES.homepageEditor);
						}}
						toolTheme={toolTheme}
					>
						<CreateIcon style={{ fontSize: 30 }} />
					</HoverNavItem>
				</Tooltip>
			)}

			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Responsibility Updates" placement="right" arrow>
					<HoverNavItem
						centered
						onClick={() => {
							setPageToView(PAGES.responsibilityUpdates);
						}}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={DocumumentIcon} />
					</HoverNavItem>
				</Tooltip>
			)}
		</div>
	);
};
/**
 * @class OpenedAdminMenu
 * @param {method} props.setPageToView - Renders the selected component in the open space
 * @param {Object} props.PAGES  - a dictionary of component names to pass into setPageToView
 */
const OpenedAdminMenu = ({ setPageToView, PAGES }) => {
	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			{Permissions.isGameChangerAdmin() && (
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

			{Permissions.isGameChangerAdmin() && isDecoupled && (
				<Tooltip title="Manage Admins" placement="right" arrow>
					<HoverNavItem
						onClick={() => {
							setPageToView(PAGES.adminList);
							return false;
						}}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={AuthIcon} />
						<span style={{ marginLeft: '10px' }}>Manage Admins</span>
					</HoverNavItem>
				</Tooltip>
			)}

			<Tooltip title="Clone Gamechanger" placement="right" arrow>
				<HoverNavItem
					onClick={() => {
						setPageToView(PAGES.cloneList);
						return false;
					}}
					toolTheme={toolTheme}
				>
					<ConstrainedIcon src={CloneIcon} />
					<span style={{ marginLeft: '10px' }}>Clone Gamechanger</span>
				</HoverNavItem>
			</Tooltip>

			<Tooltip title="Show Notifications" placement="right" arrow>
				<HoverNavItem
					onClick={() => setPageToView(PAGES.notifications)}
					toolTheme={toolTheme}
				>
					<AddAlert style={{ fontSize: 30 }} />
					<span style={{ marginLeft: '5px' }}>Show Notifications</span>
				</HoverNavItem>
			</Tooltip>

			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Manage Internal Users" placement="right" arrow>
					<HoverNavItem
						onClick={() => setPageToView(PAGES.internalUsers)}
						toolTheme={toolTheme}
					>
						<SupervisedUserCircle style={{ fontSize: 30 }} />
						<span style={{ marginLeft: '5px' }}>Manage Internal Users</span>
					</HoverNavItem>
				</Tooltip>
			)}
			<Tooltip title="ML Dashboard" placement="right" arrow>
				<HoverNavItem
					onClick={() => {
						setPageToView(PAGES.mlDashboard);
						return false;
					}}
					toolTheme={toolTheme}
				>
					<ConstrainedIcon src={DashboardIcon} />
					<span style={{ marginLeft: '10px' }}>ML Dashboard</span>
				</HoverNavItem>
			</Tooltip>
			<Tooltip title="Search PDF Mapping" placement="right" arrow>
				<HoverNavItem
					onClick={() => {
						setPageToView(PAGES.searchPdfMapping);
						return false;
					}}
					toolTheme={toolTheme}
				>
					<ConstrainedIcon src={ReportIcon} />
					<span style={{ marginLeft: '10px' }}>User Tracker Tools</span>
				</HoverNavItem>
			</Tooltip>

			<Tooltip title="View Stats" placement="right" arrow>
				<HoverNavItem
					toolTheme={toolTheme}
					onClick={() => {
						setPageToView(PAGES.appStats);
						return false;
					}}
				>
					<ConstrainedIcon src={AnalystToolsIcon} />
					<span style={{ marginLeft: '10px' }}>View Stats</span>
				</HoverNavItem>
			</Tooltip>

			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Manage API Keys" placement="right" arrow>
					<HoverNavItem
						onClick={() => {
							setPageToView(PAGES.apiKeys);
						}}
						toolTheme={toolTheme}
					>
						<VpnKeyIcon style={{ fontSize: 30 }} />
						<span style={{ marginLeft: '5px' }}>Manage API Keys</span>
					</HoverNavItem>
				</Tooltip>
			)}

			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Homepage Editor" placement="right" arrow>
					<HoverNavItem
						onClick={() => {
							setPageToView(PAGES.homepageEditor);
						}}
						toolTheme={toolTheme}
					>
						<CreateIcon style={{ fontSize: 30 }} />
						<span style={{ marginLeft: '5px' }}>Homepage Editor</span>
					</HoverNavItem>
				</Tooltip>
			)}

			{Permissions.isGameChangerAdmin() && (
				<Tooltip title="Responsibility Updates" placement="right" arrow>
					<HoverNavItem
						onClick={() => {
							setPageToView(PAGES.responsibilityUpdates);
						}}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={DocumumentIcon} />
						<span style={{ marginLeft: '5px' }}>Responsibility Updates</span>
					</HoverNavItem>
				</Tooltip>
			)}
		</div>
	);
};

export { ClosedAdminMenu, OpenedAdminMenu };
