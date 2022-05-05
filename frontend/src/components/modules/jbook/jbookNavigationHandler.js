import React, { useContext, useEffect } from 'react';
import JAICLogo from '../../../images/logos/JBooks_wht.svg';
import { PageLink, ConstrainedIcon } from '@dod-advana/advana-side-nav/dist/SlideOutMenu';
import { HoverNavItem } from '../../navigation/NavItems';
import GCTooltip from '../../common/GCToolTip';
import { getNotifications } from '../../notifications/Notifications';
import { trackEvent } from '../../telemetry/Matomo';
import { getTrackingNameForFactory, PAGE_DISPLAYED } from '../../../utils/gamechangerUtils';
import BellIcon from '../../../images/icon/NewNotificationsIcon.png';
import AdminIcon from '../../../images/icon/NewAdminIcon.png';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import ResourcesIcon from '../../../images/icon/slideout-menu/resources icon.png';
import { setState } from '../../../utils/sharedFunctions';
import AboutUsIcon from '../../../images/icon/AboutUsIcon.png';
import UserFeedbackIcon from '../../../images/icon/userfeedback.png';
import UserIcon from '../../../images/icon/UserIcon.png';
import SlideOutMenuContent from '@dod-advana/advana-side-nav/dist/SlideOutMenuContent';
import { SlideOutToolContext } from '@dod-advana/advana-side-nav/dist/SlideOutMenuContext';
import PropTypes from 'prop-types';

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
		toolIconHref: `#/${cloneData?.clone_data?.url || ''}`,
	};
};

const getToolState = (state) => {
	return {
		knowledgeBaseHref: 'https://wiki.advana.data.mil',
		toolTheme: getToolTheme(state.cloneData),
		toolName: state.cloneData?.clone_name?.toUpperCase() || '',
		hideAllApplicationsSection: false,
		hideContentSection: false,
		extraSupportLinks: [],
		associatedApplications: [],
	};
};

const generateClosedContentArea = (state, dispatch) => {
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
			<GCTooltip title="About Us" placement="right" arrow>
				<HoverNavItem
					centered
					onClick={() => {
						window.history.pushState(
							null,
							document.title,
							`/#/${state.cloneData.url.toLowerCase()}/${PAGE_DISPLAYED.aboutUs}`
						);
						setState(dispatch, { pageDisplayed: PAGE_DISPLAYED.aboutUs });
						trackEvent(
							getTrackingNameForFactory(state.cloneData.clone_name),
							'SidebarInteraction',
							'showAboutUs'
						);
					}}
					active={state.pageDisplayed === PAGE_DISPLAYED.aboutUs}
					toolTheme={toolTheme}
				>
					<ConstrainedIcon src={AboutUsIcon} />
				</HoverNavItem>
			</GCTooltip>
			<GCTooltip title="User Feedback" placement="right" arrow>
				<HoverNavItem
					centered
					onClick={() => {
						setState(dispatch, { feedbackModalOpen: true });
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
			<GCTooltip title="User Dashboard" placement="right" arrow>
				<HoverNavItem
					centered
					onClick={() => {
						window.history.pushState(
							null,
							document.title,
							`/#/${state.cloneData.url.toLowerCase()}/${PAGE_DISPLAYED.userDashboard}`
						);
						setState(dispatch, { pageDisplayed: PAGE_DISPLAYED.userDashboard });
						trackEvent(
							getTrackingNameForFactory(state.cloneData.clone_name),
							'SidebarInteraction',
							'showUserDashboard'
						);
					}}
					active={state.pageDisplayed === PAGE_DISPLAYED.userDashboard}
					toolTheme={toolTheme}
				>
					<ConstrainedIcon src={UserIcon} />
				</HoverNavItem>
			</GCTooltip>
			{Permissions.hasPermission('JBOOK Admin') && (
				<GCTooltip title="Admin Page" placement="right" arrow>
					<PageLink href={`#/${state.cloneData.url}/admin`} centered style={{ width: '100%' }}>
						<HoverNavItem centered toolTheme={toolTheme}>
							<ConstrainedIcon src={AdminIcon} />
						</HoverNavItem>
					</PageLink>
				</GCTooltip>
			)}
			<GCTooltip title="User Guide" placement="right" arrow>
				<a
					href="https://wiki.advana.data.mil/display/SDKB/GAMECHANGER+Training+Resources"
					target="_blank"
					rel="noopener noreferrer"
					style={{ color: 'white', textDecoration: 'none', width: '40px' }}
				>
					<HoverNavItem centered toolTheme={toolTheme}>
						<ConstrainedIcon src={ResourcesIcon} />
					</HoverNavItem>
				</a>
			</GCTooltip>
		</div>
	);
};

const generateOpenedContentArea = (state, dispatch) => {
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
			<GCTooltip title="About Us" placement="right" arrow>
				<HoverNavItem
					onClick={() => {
						window.history.pushState(
							null,
							document.title,
							`/#/${state.cloneData.url.toLowerCase()}/${PAGE_DISPLAYED.aboutUs}`
						);
						setState(dispatch, { pageDisplayed: PAGE_DISPLAYED.aboutUs });
						trackEvent(
							getTrackingNameForFactory(state.cloneData.clone_name),
							'SidebarInteraction',
							'showAboutUs'
						);
					}}
					active={state.pageDisplayed === PAGE_DISPLAYED.aboutUs}
					toolTheme={toolTheme}
				>
					<ConstrainedIcon src={AboutUsIcon} />
					<span style={{ marginLeft: '10px' }}>About Us</span>
				</HoverNavItem>
			</GCTooltip>
			<GCTooltip title="Tell us what you think!" placement="right" arrow>
				<HoverNavItem
					onClick={() => {
						setState(dispatch, { feedbackModalOpen: true });
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
			<GCTooltip title="User Dashboard" placement="right" arrow>
				<HoverNavItem
					onClick={() => {
						window.history.pushState(
							null,
							document.title,
							`/#/${state.cloneData.url.toLowerCase()}/${PAGE_DISPLAYED.userDashboard}`
						);
						setState(dispatch, { pageDisplayed: PAGE_DISPLAYED.userDashboard });
						trackEvent(
							getTrackingNameForFactory(state.cloneData.clone_name),
							'SidebarInteraction',
							'shoeUserDashboard'
						);
					}}
					active={state.pageDisplayed === PAGE_DISPLAYED.userDashboard}
					toolTheme={toolTheme}
				>
					<ConstrainedIcon src={UserIcon} />
					<span style={{ marginLeft: '10px' }}>User Dashboard</span>
				</HoverNavItem>
			</GCTooltip>
			{Permissions.hasPermission('JBOOK Admin') && (
				<GCTooltip title="Admin Page" placement="right" arrow>
					<PageLink href={`#/${state.cloneData.url}/admin`}>
						<HoverNavItem toolTheme={toolTheme}>
							<ConstrainedIcon src={AdminIcon} />
							<span style={{ marginLeft: '10px' }}>Admin Page</span>
						</HoverNavItem>
					</PageLink>
				</GCTooltip>
			)}
			<GCTooltip title="User Guide" placement="right" arrow>
				<a
					href="https://wiki.advana.data.mil/display/SDKB/GAMECHANGER+Training+Resources"
					target="_blank"
					rel="noopener noreferrer"
					style={{ color: 'white', textDecoration: 'none' }}
				>
					<HoverNavItem toolTheme={toolTheme}>
						<ConstrainedIcon src={ResourcesIcon} />
						<span style={{ marginLeft: '10px' }}>User Guide</span>
					</HoverNavItem>
				</a>
			</GCTooltip>
		</div>
	);
};

const JBookNavigationHandler = (props) => {
	const { state, dispatch } = props;

	const { setToolState, unsetTool } = useContext(SlideOutToolContext);

	useEffect(() => {
		setToolState(getToolState(state));

		return () => {
			unsetTool();
		};
	}, [unsetTool, setToolState, state]);

	return (
		<>
			<SlideOutMenuContent type="closed">{generateClosedContentArea(state, dispatch)}</SlideOutMenuContent>
			<SlideOutMenuContent type="open">{generateOpenedContentArea(state, dispatch)}</SlideOutMenuContent>
		</>
	);
};

JBookNavigationHandler.propTypes = {
	state: PropTypes.shape({
		cloneData: PropTypes.object,
		componentStepNumbers: PropTypes.array,
	}),
	dispatch: PropTypes.func,
};

export default JBookNavigationHandler;
