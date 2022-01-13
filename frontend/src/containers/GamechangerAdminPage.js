import React, { useState, useContext, useEffect } from 'react';
import { SlideOutToolContext } from '@dod-advana/advana-side-nav/dist/SlideOutMenuContext';

import SearchBanner from '../components/searchBar/GCSearchBanner';
import MLDashboard from '../components/admin/MLDashboard';
import GeneralAdminButtons from '../components/admin/GeneralAdminButtons';
import NotificationsManagement from '../components/notifications/NotificationsManagement';
import InternalUsersManagement from '../components/user/InternalUserManagement';
import GamechangerAppStats from '../components/searchMetrics/GamechangerAppStats';
import SearchPdfMapping from '../components/admin/SearchPdfMapping';
import CloneList from '../components/admin/CloneList';
import ResponsibilityUpdates from '../components/admin/ResponsibilityUpdates';
import AdminList from '../components/admin/AdminList';
import APIRequests from '../components/admin/APIRequests';
import HomepageEditor from '../components/admin/HomepageEditor';
import {
	ClosedAdminMenu,
	OpenedAdminMenu,
} from '../components/admin/AdminMenu';

import { trackEvent } from '../components/telemetry/Matomo';
import SlideOutMenuContent from '@dod-advana/advana-side-nav/dist/SlideOutMenuContent';
import { toolTheme } from '../components/admin/util/GCAdminStyles';

const isDecoupled =
	window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' ||
	process.env.REACT_APP_GC_DECOUPLED === 'true';

const PAGES = {
	general: 'General',
	cloneList: 'CloneList',
	searchPdfMapping: 'searchPdfMapping',
	adminList: 'AdminList',
	mlDashboard: 'mlDashboard',
	notifications: 'Notifications',
	internalUsers: 'Internal Users',
	appStats: 'Application Stats',
	apiKeys: 'API Keys',
	homepageEditor: 'Homepage Editor',
	responsibilityUpdates: 'Responsibility Updates'
};
/**
 *
 * @class GamechangerAdminPage
 */
const GamechangerAdminPage = (props) => {
	const { jupiter } = props;

	const [pageToView, setPageToView] = useState(PAGES.general);
	const { setToolState, unsetTool } = useContext(SlideOutToolContext);

	const renderSwitch = (page) => {
		trackEvent(
			'GAMECHANGER_Admin',
			'ChangeAdminPage',
			'onChange',
			page.toString()
		);

		switch (page) {
			case PAGES.general:
				return <GeneralAdminButtons />;
			case PAGES.cloneList:
				return <CloneList />;
			case PAGES.searchPdfMapping:
				return <SearchPdfMapping />;
			case PAGES.mlDashboard:
				return <MLDashboard />;
			case PAGES.adminList:
				return <AdminList />;
			case PAGES.notifications:
				return <NotificationsManagement />;
			case PAGES.internalUsers:
				return <InternalUsersManagement />;
			case PAGES.appStats:
				return <GamechangerAppStats />;
			case PAGES.apiKeys:
				return <APIRequests />;
			case PAGES.homepageEditor:
				return <HomepageEditor />;
			case PAGES.responsibilityUpdates:
				return <ResponsibilityUpdates />;
			default:
				return <GeneralAdminButtons />;
		}
	};

	useEffect(() => {
		// Update the document title using the browser API
		setToolState({
			knowledgeBaseHref: 'https://wiki.advana.data.mil',
			toolTheme,
			toolName: 'GAMECHANGER ADMIN',
			hideAllApplicationsSection: isDecoupled,
			hideContentSection: false,
			extraSupportLinks: [],
			associatedApplications: [],
		});

		return () => {
			unsetTool();
		};
	}, [unsetTool, setToolState, setPageToView]);

	return (
		<div style={{ minHeight: 'calc(100vh - 120px)' }}>
			<SlideOutMenuContent type="closed">
				{ClosedAdminMenu({ setPageToView, PAGES })}
			</SlideOutMenuContent>
			<SlideOutMenuContent type="open">
				{OpenedAdminMenu({ setPageToView, PAGES })}
			</SlideOutMenuContent>

			<SearchBanner
				onTitleClick={() => {
					window.location.href = `#/gamechanger-admin`;
					setPageToView(PAGES.general);
				}}
				titleBarModule={'admin/adminTitleBarHandler'}
				jupiter={jupiter}
				rawSearchResults={[]}
			></SearchBanner>

			{renderSwitch(pageToView)}
		</div>
	);
};
export default GamechangerAdminPage;
