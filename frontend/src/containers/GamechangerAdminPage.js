import React, { useState, useContext, useEffect } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { SlideOutToolContext } from '@dod-advana/advana-side-nav/dist/SlideOutMenuContext';
import TitleBar from '../components/searchBar/TitleBar';
import HomepageEditor from '../components/admin/HomepageEditor';
import { ClosedAdminMenu, OpenedAdminMenu } from '../components/admin/AdminMenu';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { trackEvent } from '../components/telemetry/Matomo';
import SlideOutMenuContent from '@dod-advana/advana-side-nav/dist/SlideOutMenuContent';
import { GCCheckbox, styles, TableRow, toolTheme } from '../components/admin/util/GCAdminStyles';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';
import { gcOrange } from '../components/common/gc-colors';

const NotificationsManagement = LoadableVisibility({
	loader: () => import('../components/notifications/NotificationsManagement'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const ResponsibilityUpdates = LoadableVisibility({
	loader: () => import('../components/admin/ResponsibilityUpdates'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const UserList = LoadableVisibility({
	loader: () => import('../components/admin/UserList'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const AdminList = LoadableVisibility({
	loader: () => import('../components/admin/AdminList'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const APIRequests = LoadableVisibility({
	loader: () => import('../components/admin/APIRequests'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const SearchPdfMapping = LoadableVisibility({
	loader: () => import('../components/admin/SearchPdfMapping'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const GamechangerAppStats = LoadableVisibility({
	loader: () => import('../components/searchMetrics/GamechangerAppStats'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const MLDashboard = LoadableVisibility({
	loader: () => import('../components/admin/MLDashboard'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const CloneList = LoadableVisibility({
	loader: () => import('../components/admin/CloneList'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const GeneralAdminButtons = LoadableVisibility({
	loader: () => import('../components/admin/GeneralAdminButtons'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const GCFooter = LoadableVisibility({
	loader: () => import('../components/navigation/GCFooter'),
	loading: () => {
		return (
			<div
				style={{
					display: 'flex',
					height: '90px',
					width: '100%',
					backgroundColor: 'black',
				}}
			/>
		);
	},
});

const PAGES = {
	general: 'General',
	cloneList: 'CloneList',
	searchPdfMapping: 'searchPdfMapping',
	adminList: 'AdminList',
	mlDashboard: 'mlDashboard',
	notifications: 'Notifications',
	userList: 'Users',
	appStats: 'Application Stats',
	apiKeys: 'API Keys',
	homepageEditor: 'Homepage Editor',
	responsibilityUpdates: 'Responsibility Updates',
};

const userListTableAdditions = [
	{
		Header: 'Admin',
		accessor: 'is_admin',
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
	{
		Header: 'Super Admin',
		accessor: 'is_super_admin',
		width: 100,
		Cell: (row) => (
			<TableRow>
				<GCCheckbox
					checked={row.value}
					onChange={() => {}}
					name={'super_admin'}
					color="inherit"
					style={{ ...styles.checkbox, color: '#1C2D64' }}
				/>
			</TableRow>
		),
	},
];

/**
 *
 * @class GamechangerAdminPage
 */
const GamechangerAdminPage = (props) => {
	const { jupiter, location } = props;
	const [pageToView, setPageToView] = useState(PAGES.general);
	const { setToolState, unsetTool } = useContext(SlideOutToolContext);
	const { path } = useRouteMatch();

	const renderSwitch = (page) => {
		trackEvent('GAMECHANGER_Admin', 'ChangeAdminPage', 'onChange', page.toString());

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
			case PAGES.userList:
				return <UserList columns={userListTableAdditions} />;
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
			hideAllApplicationsSection: false,
			hideContentSection: false,
			extraSupportLinks: [],
			associatedApplications: [],
		});
		return () => {
			unsetTool();
		};
	}, [unsetTool, setToolState, setPageToView]);

	return (
		<div style={{ minHeight: 'calc(100vh - 30px)', display: 'flex', flexDirection: 'column' }}>
			<SlideOutMenuContent type="closed">{ClosedAdminMenu({ setPageToView, PAGES })}</SlideOutMenuContent>
			<SlideOutMenuContent type="open">{OpenedAdminMenu({ setPageToView, PAGES })}</SlideOutMenuContent>
			<TitleBar
				onTitleClick={() => {
					window.location.href = `#/gamechanger-admin`;
					setPageToView(PAGES.general);
				}}
				titleBarModule={'admin/adminTitleBarHandler'}
				jupiter={jupiter}
				rawSearchResults={[]}
				cloneData={{ clone_name: 'gamechanger' }}
			/>
			<div style={{ flexGrow: 1 }}>
				<Switch>
					<Route exact path={`${path}/mldashboard`} component={MLDashboard} />
					<Route path="*" component={() => renderSwitch(pageToView)} />
				</Switch>
			</div>
			<GCFooter location={location} cloneName="gamechanger-admin" />
		</div>
	);
};
export default GamechangerAdminPage;
