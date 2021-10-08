import React from 'react';
import GCTooltip from '../../common/GCToolTip';
import { HoverNavItem, NavItem } from '../../navigation/NavItems';
import { trackEvent } from '../../telemetry/Matomo';
import { getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import {
	ConstrainedIcon,
	PageLink,
	StyledBadgeSmall,
} from '@dod-advana/advana-side-nav/dist/SlideOutMenu';
import BellIcon from '../../../images/icon/NewNotificationsIcon.png';
import { setState } from '../../../utils/sharedFunctions';
import AppTutorialsIcon from '../../../images/icon/AppTutorialsIcon.png';
import UserFeedbackIcon from '../../../images/icon/UserFeedbackIcon.png';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import AdvanaDarkTheme from '@dod-advana/advana-platform-ui/dist/images/AdvanaDarkTheme.png';
import AdminIcon from '../../../images/icon/NewAdminIcon.png';
import { getNotifications } from '../../notifications/Notifications';

const isDecoupled =
	window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' ||
	process.env.REACT_APP_GC_DECOUPLED === 'true';

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
			<img
				src={AdvanaDarkTheme}
				style={{ width: '196px' }}
				alt="search"
				id={'titleLogo'}
			/>
		),
		toolIconHref: `#/${cloneData?.clone_data?.url || ''}`,
	};
};

const GlobalSearchNavigationHandler = {
	getToolState: (state) => {
		return {
			knowledgeBaseHref: 'https://wiki.advana.data.mil',
			toolTheme: getToolTheme(state.cloneData),
			toolName: state.cloneData?.clone_name?.toUpperCase() || '',
			hideAllApplicationsSection: isDecoupled,
			hideContentSection: false,
			extraSupportLinks: [],
			associatedApplications: [],
		};
	},

	generateClosedContentArea: (state, dispatch) => {
		const toolTheme = getToolTheme(state.cloneData);
		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
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
				{state.cloneData?.show_tutorial &&
					Object.keys(state.componentStepNumbers).length > 0 && (
					<GCTooltip
						title="How-to, features, and tips"
						placement="right"
						arrow
					>
						<HoverNavItem
							centered
							onClick={() => {
								setState(dispatch, {
									showTutorial: true,
									clickedTutorial: true,
								});
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'SidebarInteraction',
									'ShowTutorial'
								);
							}}
							toolTheme={toolTheme}
						>
							<StyledBadgeSmall
								color="secondary"
								badgeContent=" "
								invisible={!state.newUser || state.clickedTutorial}
							>
								<ConstrainedIcon src={AppTutorialsIcon} />
							</StyledBadgeSmall>
						</HoverNavItem>
					</GCTooltip>
				)}
				<GCTooltip title="User Feedback" placement="right" arrow>
					<HoverNavItem
						centered
						onClick={() => {
							setState(dispatch, { showFeedbackModal: true });
							trackEvent(
								getTrackingNameForFactory(state.cloneData.clone_name),
								'SidebarInteraction',
								'showUserFeedback'
							);
						}}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={UserFeedbackIcon} />
					</HoverNavItem>
				</GCTooltip>
				{Permissions.isGameChangerAdmin() && (
					<GCTooltip title="Admin Page" placement="right" arrow>
						<PageLink
							href="#/gamechanger-admin"
							centered
							style={{ width: '100%' }}
						>
							<HoverNavItem centered toolTheme={toolTheme}>
								<ConstrainedIcon src={AdminIcon} />
							</HoverNavItem>
						</PageLink>
					</GCTooltip>
				)}
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
							<ConstrainedIcon src={BellIcon} />
							<span style={{ marginLeft: '10px' }}>Notifications</span>
						</HoverNavItem>
					</GCTooltip>
				)}
				<NavItem style={{ justifyContent: 'space-between' }}>
					<span>MENU</span>
				</NavItem>
				<GCTooltip title="Tell us what you think!" placement="right" arrow>
					<HoverNavItem
						onClick={() => {
							setState(dispatch, { showFeedbackModal: true });
							trackEvent(
								getTrackingNameForFactory(state.cloneData.clone_name),
								'SidebarInteraction',
								'showUserFeedbackSelected'
							);
						}}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={UserFeedbackIcon} />
						<span style={{ marginLeft: '10px' }}>User Feedback</span>
					</HoverNavItem>
				</GCTooltip>
				{Permissions.isGameChangerAdmin() && (
					<GCTooltip title="Admin Page" placement="right" arrow>
						<PageLink href="#/gamechanger-admin">
							<HoverNavItem toolTheme={toolTheme}>
								<ConstrainedIcon src={AdminIcon} />
								<span style={{ marginLeft: '10px' }}>Admin Page</span>
							</HoverNavItem>
						</PageLink>
					</GCTooltip>
				)}
			</div>
		);
	},
};

export default GlobalSearchNavigationHandler;
