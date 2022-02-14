import React from 'react';
import JAICLogo from '../../../images/logos/JBooks_wht.svg';
import {
	PageLink,
	ConstrainedIcon
} from '@dod-advana/advana-side-nav/dist/SlideOutMenu';
import { HoverNavItem } from '../../navigation/NavItems';
import GCTooltip from '../../common/GCToolTip';
import { getNotifications } from '../../notifications/Notifications';
import { trackEvent } from '../../telemetry/Matomo';
import { getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import BellIcon from '../../../images/icon/NewNotificationsIcon.png';
import AdminIcon from '../../../images/icon/NewAdminIcon.png';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import ResourcesIcon from '../../../images/icon/slideout-menu/resources icon.png';

const getToolTheme = (cloneData) => {
	return {
		menuBackgroundColor: '#171A23',
		logoBackgroundColor: '#000000',
		openCloseButtonBackgroundColor: '#000000',
		allAppsBackgroundColor: '#171A23',
		openCloseIconColor: '#FFFFFF',
		sectionSeparatorColor: '#323E4A',
		fontColor: '#FFFFFF',
		hoverColor: '#E9691D',
		toolLogo: (
			<PageLink href="#/">
				<img src={JAICLogo} alt="tool logo" />
			</PageLink>
		),
		toolIconHref: `#/${cloneData?.clone_data?.url || ''}`
	};
};

const JBookNavigationHandler = {

	getToolState: (state) => {
		return {
			knowledgeBaseHref: 'https://wiki.advana.data.mil',
			toolTheme: getToolTheme(state.cloneData),
			toolName: state.cloneData?.clone_name?.toUpperCase() || '',
			hideAllApplicationsSection: false,
			hideContentSection: false,
			extraSupportLinks: [],
			associatedApplications: []
		};
	},

	generateClosedContentArea: (state, dispatch) => {
		const toolTheme = getToolTheme(state.cloneData);
		return (
			<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				{state.notificationIds.length > 0 && (
					<GCTooltip title="Show Notifications" placement="right" arrow>
						<HoverNavItem
							centered
							onClick={() => {
								getNotifications(dispatch);
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'SidebarInteraction',
									'ShowNotifications'
								);
							}}
							toolTheme={toolTheme}
						>
							{/* <NotificationsClosed src={BellIcon} notificationCount={state.notifications.length} /> */}
							<ConstrainedIcon src={BellIcon} />
						</HoverNavItem>
					</GCTooltip>
				)}
				{Permissions.hasPermission('JBOOK Admin') && (
					<GCTooltip title="Admin Page" placement="right" arrow>
						<PageLink
							href="#/admin"
							centered
							style={{ width: '100%' }}
						>
							<HoverNavItem centered toolTheme={toolTheme}>
								<ConstrainedIcon src={AdminIcon} />
							</HoverNavItem>
						</PageLink>
					</GCTooltip>
				)}
				<GCTooltip title="User Guide" placement="right" arrow>
					<a href="https://wiki.advana.data.mil/display/SDKB/GAMECHANGER+Training+Resources" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', width: '40px' }}>
						<HoverNavItem centered toolTheme={toolTheme}
						>
							<ConstrainedIcon src={ResourcesIcon} />
						</HoverNavItem>
					</a>
				</GCTooltip>
			</div>
		);
	},

	generateOpenedContentArea: (state, dispatch) => {
		const toolTheme = getToolTheme(state.cloneData);
		return (
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				{state.notificationIds.length > 0 && (
					<GCTooltip title="Show Notifications" placement="right" arrow>
						<HoverNavItem
							onClick={() => {
								getNotifications(dispatch);
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'SidebarInteraction',
									'ShowNotifications'
								);
							}}
							toolTheme={toolTheme}
						>
							{/* <Notifications src={BellIcon} notificationCount={state.notifications.length} /> */}
							<ConstrainedIcon src={BellIcon} />
							<span style={{ marginLeft: '10px' }}>Notifications</span>
						</HoverNavItem>
					</GCTooltip>
				)}
				{Permissions.hasPermission('JBOOK Admin') && (
					<GCTooltip title="Admin Page" placement="right" arrow>
						<PageLink href="#/admin">
							<HoverNavItem toolTheme={toolTheme}>
								<ConstrainedIcon src={AdminIcon} />
								<span style={{ marginLeft: '10px' }}>Admin Page</span>
							</HoverNavItem>
						</PageLink>
					</GCTooltip>
				)}
				<GCTooltip title="User Guide" placement="right" arrow>
					<a href="https://wiki.advana.data.mil/display/SDKB/GAMECHANGER+Training+Resources" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>
						<HoverNavItem toolTheme={toolTheme}>
							<ConstrainedIcon src={ResourcesIcon} />
							<span style={{ marginLeft: '10px' }}>User Guide</span>
						</HoverNavItem>
					</a>
				</GCTooltip>
			</div>
		);
	}
}

export default JBookNavigationHandler;
