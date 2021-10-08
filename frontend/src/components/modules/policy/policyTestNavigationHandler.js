import React from 'react';
import GCTooltip from '../../common/GCToolTip';
import { HoverNavItem, NavItem } from '../../navigation/NavItems';
import { trackEvent } from '../../telemetry/Matomo';
import {
	getCloneTitleForFactory,
	getTrackingNameForFactory,
	PAGE_DISPLAYED,
} from '../../../utils/gamechangerUtils';
import {
	ConstrainedIcon,
	PageLink,
	StyledBadgeSmall,
} from '@dod-advana/advana-side-nav/dist/SlideOutMenu';
import BellIcon from '../../../images/icon/NewNotificationsIcon.png';
import { setState } from '../../../utils/sharedFunctions';
import AppTutorialsIcon from '../../../images/icon/AppTutorialsIcon.png';
import UserFeedbackIcon from '../../../images/icon/UserFeedbackIcon.png';
import CrowdSourcingAppIcon from '../../../images/icon/NewCrowdSourcingIcon.png';
import DataStatusTrackerIcon from '../../../images/icon/NewDataStatusTrackerIcon.png';
import AnalystToolsIcon from '../../../images/icon/analyticswht.png';
import CloneRequest from '../../../images/icon/CloneRequest.png';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import AdminIcon from '../../../images/icon/NewAdminIcon.png';
import GamechangerTextIcon from '../../../images/icon/GamechangerText.png';
import ResourcesIcon from '../../../images/icon/slideout-menu/resources icon.png';
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
			<PageLink href="#/gamechanger">
				<img src={GamechangerTextIcon} href="#/gamechanger" alt="tool logo" />
			</PageLink>
		),
		toolIconHref: '#/gamechanger',
	};
};

const PolicyNavigationHandler = {
	getToolState: (state) => {
		return {
			knowledgeBaseHref: 'https://wiki.advana.data.mil',
			toolTheme: getToolTheme(state.cloneData),
			toolName: 'GAMECHANGER',
			hideAllApplicationsSection: isDecoupled,
			hideContentSection: false,
			extraSupportLinks: [
				{
					label: 'User Guide',
					extraClass: `tutorial-step-${state.componentStepNumbers['User Guide']}`,
					id: 'gcUserGuide',
					icon: ResourcesIcon,
					link: 'https://wiki.advana.data.mil/display/SDKB/GAMECHANGER+User+Guide',
				},
			],
			associatedApplications: [],
		};
	},

	generateClosedContentArea: (state, dispatch) => {
		const toolTheme = getToolTheme(state.cloneData);
		return (
			<div
				className={`tutorial-step-${state.componentStepNumbers['Slide-out Menu']}`}
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
				{Object.keys(state.componentStepNumbers).length > 0 && (
					<GCTooltip title="How-to, features, and tips" placement="right" arrow>
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
				<GCTooltip title="Crowd Sourcing" placement="right" arrow>
					<HoverNavItem
						centered
						onClick={() => {
							setState(dispatch, { showAssistModal: true });
							trackEvent(
								getTrackingNameForFactory(state.cloneData.clone_name),
								'SidebarInteraction',
								'CrowdSourcing'
							);
						}}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={CrowdSourcingAppIcon} />
					</HoverNavItem>
				</GCTooltip>
				<GCTooltip title="Analyst Tools" placement="right" arrow>
					<HoverNavItem
						centered
						onClick={() => {
							setState(dispatch, {
								pageDisplayed: PAGE_DISPLAYED.analystTools,
							});
							trackEvent(
								getTrackingNameForFactory(state.cloneData.clone_name),
								'showResponsibilityTracker',
								'onCLick'
							);
						}}
						active={state.pageDisplayed === PAGE_DISPLAYED.analystTools}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={AnalystToolsIcon} />
					</HoverNavItem>
				</GCTooltip>
				<GCTooltip title="Clone Request" placement="right" arrow>
					<a
						href="https://support.advana.data.mil/plugins/servlet/desk/portal/15/create/235"
						target="_blank"
						rel="noopener noreferrer"
						style={{ color: 'white', textDecoration: 'none', width: '40px' }}
					>
						<HoverNavItem
							centered
							onClick={() => {
								// open modal or link
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'SidebarInteraction',
									'CloneRequest'
								);
							}}
							toolTheme={toolTheme}
						>
							<ConstrainedIcon src={CloneRequest} />
						</HoverNavItem>
					</a>
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
							{/* <Notifications src={BellIcon} notificationCount={state.notifications.length} /> */}
							<ConstrainedIcon src={BellIcon} />
							<span style={{ marginLeft: '10px' }}>Notifications</span>
						</HoverNavItem>
					</GCTooltip>
				)}
				<NavItem style={{ justifyContent: 'space-between' }}>
					<span>{getCloneTitleForFactory(state.cloneData, true)} MENU</span>
				</NavItem>
				{Object.keys(state.componentStepNumbers).length > 0 && (
					<GCTooltip title="How-to, features, and tips" placement="right" arrow>
						<HoverNavItem
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
							<span style={{ marginLeft: '10px' }}>Guided Tutorial</span>
						</HoverNavItem>
					</GCTooltip>
				)}
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
				<GCTooltip title="Help us verify data" placement="right" arrow>
					<HoverNavItem
						onClick={() => {
							setState(dispatch, { showAssistModal: true });
							trackEvent(
								getTrackingNameForFactory(state.cloneData.clone_name),
								'SidebarInteraction',
								'CrowdSourcingSelected'
							);
						}}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={CrowdSourcingAppIcon} />
						<span style={{ marginLeft: '10px' }}>Crowd Sourcing</span>
					</HoverNavItem>
				</GCTooltip>
				<GCTooltip title="Data Tracker" placement="right" arrow>
					<HoverNavItem
						onClick={() => {
							setState(dispatch, { pageDisplayed: PAGE_DISPLAYED.dataTracker });
							trackEvent(
								getTrackingNameForFactory(state.cloneData.clone_name),
								'SidebarInteraction',
								'DataTrackerSelected'
							);
						}}
						active={state.pageDisplayed === PAGE_DISPLAYED.dataTracker}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={DataStatusTrackerIcon} />
						<span style={{ marginLeft: '10px' }}>Data Tracker</span>
					</HoverNavItem>
				</GCTooltip>
				<GCTooltip title="Analyst Tools" placement="right" arrow>
					<HoverNavItem
						onClick={() => {
							setState(dispatch, {
								pageDisplayed: PAGE_DISPLAYED.analystTools,
							});
							trackEvent('DataTracker', 'onCLick');
						}}
						active={state.pageDisplayed === PAGE_DISPLAYED.analystTools}
						toolTheme={toolTheme}
					>
						<ConstrainedIcon src={AnalystToolsIcon} />
						<span style={{ marginLeft: '10px' }}>Analyst Tools</span>
					</HoverNavItem>
				</GCTooltip>
				<GCTooltip title="Clone Request" placement="right" arrow>
					<a
						href="https://support.advana.data.mil/plugins/servlet/desk/portal/15/create/235"
						target="_blank"
						rel="noopener noreferrer"
						style={{ color: 'white', textDecoration: 'none' }}
					>
						<HoverNavItem
							onClick={() => {
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'SidebarInteraction',
									'CloneRequest'
								);
							}}
							toolTheme={toolTheme}
						>
							<ConstrainedIcon src={CloneRequest} />
							<span style={{ marginLeft: '10px' }}>Clone Request</span>
						</HoverNavItem>
					</a>
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

export default PolicyNavigationHandler;
