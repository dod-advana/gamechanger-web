import React, {useState, useContext, useEffect} from 'react';
import { SlideOutToolContext } from '@dod-advana/advana-side-nav/dist/SlideOutMenuContext';
import 'react-table/react-table.css';
import SearchBanner from '../components/searchBar/GCSearchBanner';
import GeneralAdminButtons from '../components/admin/GeneralAdminButtons';
import NotificationsManagement from '../components/notifications/NotificationsManagement';
import UserList from '../components/admin/UserList';
import ReviewerList from '../components/admin/ReviewerList';

import {ClosedAdminMenu, OpenedAdminMenu} from '../components/admin/AdminMenu';

import { trackEvent } from '../components/telemetry/Matomo';
import SlideOutMenuContent from '@dod-advana/advana-side-nav/dist/SlideOutMenuContent';
import {toolTheme} from '../components/admin/util/GCAdminStyles';

const PAGES = {
	general: 'General',
	userList: 'UserList',
	notifications: 'Notifications',
	reviewerList: 'ReviewerList'
}
/**
 * 
 * @class JBookAdminPage
 */
const JBookAdminPage = props => {
	const { jupiter } = props;

	const [pageToView, setPageToView] = useState(PAGES.general);
	const [loginModalOpen, setLoginModalOpen] = useState(false);
	const { setToolState, unsetTool } = useContext(SlideOutToolContext);

	const setLoginModal = (open) => {
		setLoginModalOpen(open);
	}

	const renderSwitch = (page) => {
		trackEvent('JBOOK_Admin', 'ChangeAdminPage', 'onChange', page.toString());

		switch(page) {
			case PAGES.general:
				return <GeneralAdminButtons />;
			case PAGES.userList:
				return <UserList />;
			case PAGES.notifications:
				return <NotificationsManagement />;
			case PAGES.reviewerList:
				return <ReviewerList />;
			default:
				return <GeneralAdminButtons />;
		}
	}
	
	useEffect(() => {
		// Update the document title using the browser API
		setToolState({
			knowledgeBaseHref: 'https://wiki.advana.data.mil',
			toolTheme,
			toolName: 'JBOOK ADMIN',
			hideAllApplicationsSection: false,
			hideContentSection: false,
			extraSupportLinks: [],
			associatedApplications: []
		});

		return () => {
			unsetTool();
		};

	}, [unsetTool, setToolState, setPageToView]);

	return (
		<div style={{ minHeight: 'calc(100vh - 120px)' }}>

			<SlideOutMenuContent type="closed">{ClosedAdminMenu({ setPageToView, PAGES})}</SlideOutMenuContent>
			<SlideOutMenuContent type="open">{OpenedAdminMenu({ setPageToView, PAGES})}</SlideOutMenuContent>

			<SearchBanner
				onTitleClick={() => {
					window.location.href = `#/admin`;
					setPageToView(PAGES.general);
				}}
				titleBarModule={'admin/adminTitleBarHandler'}
				jupiter={jupiter}
				rawSearchResults={[]}
				loginModalOpen={loginModalOpen}
				setLoginModal={setLoginModal}
			>
			</SearchBanner>

			{renderSwitch(pageToView)}
			
		</div>
	);
}
export default JBookAdminPage;
