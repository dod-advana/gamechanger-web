import React from 'react';
// import GeneralAdminButtons from '../../admin/GeneralAdminButtons';
import NotificationsManagement from '../../notifications/NotificationsManagement';
import UserList from '../../admin/UserList';
import { Tooltip, Typography } from '@material-ui/core';
import { HoverNavItem } from '../../navigation/NavItems';
import { toolTheme } from '../../admin/util/GCAdminStyles';
import AdminIcon from '../../../images/icon/AdminIcon.png';
import NewAdminIcon from '../../../images/icon/NewAdminIcon.png';
import { AddAlert, SupervisedUserCircle } from '@material-ui/icons';
import { ConstrainedIcon, PageLink } from '@dod-advana/advana-side-nav/dist/SlideOutMenu';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import GamechangerNGALogo from '../../../images/logos/NGA-Sidemenu.png';
import GamechangerHermesLogo from '../../../images/logos/Hermes-Sidemenu.png';
import GamechangerNFRLogo from '../../../images/logos/NFR-Sidemenu.png';
import GamechangerSFLogo from '../../../images/logos/SF-Sidemenu.png';
import GamechangerCDOLogo from '../../../images/logos/CDO-Sidemenu.png';
import GamechangerTextIcon from '../../../images/icon/GamechangerText.png';
import JAICLogo from '../../../images/logos/JBooks_wht.svg';
import { getCloneTitleForFactory } from '../../../utils/gamechangerUtils';
import GCTooltip from '../../common/GCToolTip';

const PAGES = {
	general: 'General',
	userList: 'Users',
	notifications: 'Notifications',
};

const styles = {
	wording: {
		color: 'white',
		marginRight: 15,
	},
};

const renderGeneralAdminButtons = () => {
	return <></>;
};

const DefaultAdminMainViewHandler = {
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
				return <UserList cloneName={cloneName} />;
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
		const toolTheme = {
			menuBackgroundColor: '#171A23',
			logoBackgroundColor: '#000000',
			openCloseButtonBackgroundColor: '#000000',
			allAppsBackgroundColor: '#171A23',
			openCloseIconColor: '#FFFFFF',
			sectionSeparatorColor: '#323E4A',
			fontColor: '#FFFFFF',
			hoverColor: '#E9691D',
		};

		if (cloneData.clone_name === 'gamechanger') {
			return {
				...toolTheme,
				toolLogo: (
					<PageLink href={`#/${cloneData.url}`}>
						<img src={GamechangerTextIcon} alt="tool logo" />
					</PageLink>
				),
				toolIconHref: `#/${cloneData?.url || ''}`,
			};
		} else if (cloneData.clone_name === 'nga') {
			return {
				...toolTheme,
				toolLogo: (
					<PageLink href={`#/${cloneData.url}`}>
						<img src={GamechangerNGALogo} alt="tool logo" />
					</PageLink>
				),
				toolIconHref: `#/${cloneData?.url || ''}`,
			};
		} else if (cloneData.clone_name === 'hermes') {
			return {
				...toolTheme,
				toolLogo: (
					<PageLink href={`#/${cloneData.url}`}>
						<img src={GamechangerHermesLogo} alt="tool logo" />
					</PageLink>
				),
				toolIconHref: `#/${cloneData?.url || ''}`,
			};
		} else if (cloneData.clone_name === 'nfr') {
			return {
				...toolTheme,
				toolLogo: (
					<PageLink href={`#/${cloneData.url}`}>
						<img src={GamechangerNFRLogo} alt="tool logo" />
					</PageLink>
				),
				toolIconHref: `#/${cloneData?.url || ''}`,
			};
		} else if (cloneData.clone_name === 'space-force') {
			return {
				...toolTheme,
				toolLogo: (
					<PageLink href={`#/${cloneData.url}`}>
						<img src={GamechangerSFLogo} alt="tool logo" />
					</PageLink>
				),
				toolIconHref: `#/${cloneData?.url || ''}`,
			};
		} else if (cloneData.clone_name === 'cdo') {
			return {
				...toolTheme,
				toolLogo: (
					<PageLink href={`#/${cloneData.url}`}>
						<img src={GamechangerCDOLogo} alt="tool logo" />
					</PageLink>
				),
				toolIconHref: `#/${cloneData?.url || ''}`,
			};
		} else if (cloneData.clone_name === 'jbook') {
			return {
				...toolTheme,
				toolLogo: (
					<PageLink href={`#/${cloneData.url}`}>
						<img src={JAICLogo} alt="tool logo" />
					</PageLink>
				),
				toolIconHref: `#/${cloneData?.url || ''}`,
			};
		} else {
			return {
				...toolTheme,
				toolLogo: (
					<PageLink href={`#/${cloneData.url}`}>
						<div>
							<Typography variant="h1" style={{ ...styles.wording, margin: '0 15px 0 0' }}>
								{getCloneTitleForFactory(cloneData, false)}
							</Typography>
							<Typography
								variant="h6"
								style={{
									...styles.wording,
									textAlign: 'center',
									margin: '0 15px 0 0',
								}}
							>
								Powered by GAMECHANGER
							</Typography>
						</div>
					</PageLink>
				),
				toolIconHref: `#/${cloneData?.url || ''}`,
			};
		}
	},
};

export default DefaultAdminMainViewHandler;
