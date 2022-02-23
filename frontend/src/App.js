import React, { useEffect, useState } from 'react';
import {
	Redirect,
	Route,
	HashRouter as Router,
	Switch,
} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';
import { getProvider } from './components/factories/contextFactory';
import ConsentAgreement from '@dod-advana/advana-platform-ui/dist/ConsentAgreement';
import GamechangerPage from './containers/GameChangerPage';
import GamechangerAdminPage from './containers/GamechangerAdminPage';
import GamechangerEsPage from './containers/GamechangerEsPage';
import GameChangerDetailsPage from './containers/GameChangerDetailsPage';
import GamechangerPdfViewer from './components/documentViewer/PDFViewer';
import GamechangerInternalUserTrackingPage from './components/user/InternalUserManagementAutotracker';
import GameChangerAPI from './components/api/gameChanger-service-api';
import TrackerWrapper from './components/telemetry/TrackerWrapperHooks';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { createBrowserHistory } from 'history';
import SlideOutMenuContextHandler from '@dod-advana/advana-side-nav/dist/SlideOutMenuContext';
import SparkMD5 from 'spark-md5';
import _ from 'lodash';
import GCAuth from './components/common/GCAuth';
import './styles.css';
import 'font-awesome/css/font-awesome.css';
import 'flexboxgrid/css/flexboxgrid.css';
// import ThemeDefault from './components/advana/theme-default';
import SlideOutMenu from '@dod-advana/advana-side-nav/dist/SlideOutMenu';
import TutorialOverlayAPI from '@dod-advana/advana-tutorial-overlay/dist/api/TutorialOverlay';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import Config from './config/config';
import Auth from '@dod-advana/advana-platform-ui/dist/utilities/Auth';
import ThemeDefault from '@dod-advana/advana-platform-ui/dist/theme-default';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';

import ClassificationBanner from '@dod-advana/advana-platform-ui/dist/ClassificationBanner';
// import SlideOutMenu from '@dod-advana/advana-side-nav/dist/SlideOutMenu';
// import SlideOutMenuContextHandler from '@dod-advana/advana-side-nav/dist/SlideOutMenuContext';

// import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';

import NotFoundPage from '@dod-advana/advana-platform-ui/dist/containers/NotFoundPage';
import ErrorPage from '@dod-advana/advana-platform-ui/dist/containers/GenericErrorPage';
import { ErrorBoundary } from 'react-error-boundary';
import './index.css';
import BudgetSearchProfilePage from './containers/BudgetSearchProfilePage';
import GCFooter from './components/navigation/GCFooter';
require('typeface-noto-sans');
require('typeface-montserrat');

require('./favicon.ico');

const isDecoupled =
	window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' ||
	process.env.REACT_APP_GC_DECOUPLED === 'true';

const instance = createInstance({
	urlBase: Config.MATOMO_LINK || '',
	siteId: isDecoupled ? 2 : 1,
});

const history = createBrowserHistory();

const tutorialOverlayAPI = new TutorialOverlayAPI();
const gameChangerAPI = new GameChangerAPI();

const theme = createMuiTheme({});

const styles = {
	splashContainerClosed: {
		padding: 0,
		height: '100%',
	},
	container: {
		paddingTop: 120,
		paddingRight: 30,
		paddingLeft: 30,
		paddingBottom: 10,
	},
	emptyContainer: {
		paddingTop: 30,
		paddingRight: 0,
		paddingLeft: 0,
		paddingBottom: 0,
		height: 'calc(100% - 6px)',
	},
	newContainer: {
		minHeight: 'calc(100% - 30px)',
		marginLeft: '50px',
		paddingTop: '2em',
		background: '#ffffff',
	},
};

const PrivateTrackedRoute = ({
	allowFunction,
	component: Component,
	render: Render,
	pageName,
	customTelemetryDimensions = false,
	...rest
}) => {
	const WrappedComponent = TrackerWrapper(
		Component || Render,
		pageName,
		customTelemetryDimensions
	);
	return (
		<Route
			{...rest}
			render={(props) =>
				allowFunction(props) ? (
					<WrappedComponent {...rest} {...props} />
				) : (
					<Redirect
						to={{
							pathname: '/unauthorized',
						}}
					/>
				)
			}
		/>
	);
};

const TrackedPDFView = ({
	component: Component,
	render: Render,
	location,
	...rest
}) => {
	const { trackPageView, pushInstruction } = useMatomo();
	const query = new URLSearchParams(location.search);
	const filename = query.get('filename');
	const clone_name = query.get('cloneIndex');
	const documentTitle = `PDFViewer - ${filename} - ${clone_name}`;
	const RenderComponent = Component || Render;
	useEffect(() => {
		// On route load we want to log this to matomo, that is all this use effect does
		const userId = isDecoupled
			? GCAuth.getTokenPayload().cn
			: Auth.getUserId() || ' ';
		const regex = /\d{10}/g;
		const id = regex.exec(userId);
		pushInstruction('setUserId', SparkMD5.hash(id ? id[0] : userId));
		trackPageView({
			// documentTitle and href get logged automatically
			documentTitle,
			href: window.location.href,
		});
	});
	return (
		<Route
			{...rest}
			render={(props) => <RenderComponent {...rest} {...props} />}
		/>
	);
};

const App = () => {
	const [gameChangerCloneRoutes, setGameChangerCloneRoutes] = useState([]);
	const [initialized, setInitialized] = useState(false);
	const [tokenLoaded, setTokenLoaded] = useState(false);

	const getGamechangerClones = async (tutorialData) => {
		try {
			const data = await gameChangerAPI.getCloneData();
			const cloneRoutes = [];
			_.forEach(data.data, (clone, idx) => {
				if (clone.is_live) {
					const name = clone.clone_name;
					const GamechangerProvider = getProvider(name);

					const url = new URL(window.location.href).hostname;
					if(clone.available_at === null){
						clone.available_at = []; // if there's nothing at all, set as empty array
					}
					if (clone.available_at.some(v => v.includes(url) || v === 'all')) {
						if (clone.permissions_required) {
							cloneRoutes.push(
								<PrivateTrackedRoute
									key={idx}
									path={`/${clone.url}`}
									render={(props) => (
										<GamechangerProvider>
											<GamechangerPage
												{...props}
												tutorialData={
													tutorialData && tutorialData[name]
														? tutorialData[name].newUserTutorial
														: null
												}
												history={history}
												isClone={true}
												cloneData={clone}
											/>
										</GamechangerProvider>
									)}
									pageName={clone.display_name}
									allowFunction={() => {
										return Permissions.allowGCClone(clone.clone_name);
									}}
								/>
							);
						} else {
							cloneRoutes.push(
								<PrivateTrackedRoute
									key={idx}
									path={`/${clone.url}`}
									render={(props) => (
										<GamechangerProvider>
											<GamechangerPage
												{...props}
												tutorialData={
													tutorialData && tutorialData[name]
														? tutorialData[name].newUserTutorial
														: null
												}
												history={history}
												isClone={true}
												cloneData={clone}
											/>
										</GamechangerProvider>
									)}
									pageName={clone.display_name}
									allowFunction={() => {
										return true;
									}}
								/>
							);
						}
					}
				}
			});
			setGameChangerCloneRoutes(cloneRoutes);
		} catch (err) {
			console.log(err);
			console.log('Failed to retrieve GC Clones.');
		}
	};

	const getBudgetSearchProfileRoute = () => {
		const BudgetSearchProvider = getProvider('budgetSearch');

		return (
			<PrivateTrackedRoute
				path={`/budgetsearch-profile`}
				render={(props) => (
					<BudgetSearchProvider>
						<BudgetSearchProfilePage {...props} />
					</BudgetSearchProvider>
				)}
				pageName={'BudgetSearchProfilePage'}
				allowFunction={() => {
					return true;
				}}
			/>
		);
	};

	const isShowNothingButComponent = (location) => {
		const includePaths = [
			'/pdfviewer/gamechanger',
			'/gamechanger/internalUsers/track/me',
			'/gamechanger-details',
		];
		return includePaths.includes(location.pathname);
	};

	const getStyleType = (match, location) => {
		let style = styles.newContainer;
		if (isShowNothingButComponent(location)) {
			style = styles.emptyContainer;
		}
		return style;
	};

	useEffect(() => {
		const initialize = async () => {
			if (isDecoupled) {
				await GCAuth.refreshUserToken(
					() => setTokenLoaded(true),
					() => setTokenLoaded(true)
				);
			} else {
				Auth.refreshUserToken(
					() => setTokenLoaded(true),
					() => setTokenLoaded(true)
				);
			}

			// fetch tutorial overlay data
			let tutorialData = [];
			const doTutorial =
				window?.__env__?.REACT_APP_ENABLE_TUTORIAL === 'true' ||
				process.env.REACT_APP_ENABLE_TUTORIAL === 'true';
			if (doTutorial) {
				try {
					const data = await tutorialOverlayAPI.tutorialOverlaysGET();
					tutorialData = tutorialOverlayAPI.setupTutorialOverlay(data.data);
				} catch (err) {
					console.log(err);
					console.log('Failed to retrieve Tutorial Overlay data');
				}
			}

			getGamechangerClones(tutorialData);
		};
		if (!initialized) {
			setInitialized(true);
			initialize();
		}

	}, [initialized]);

	if (!initialized || !tokenLoaded) {
		return <LoadingIndicator />;
	}

	async function errorHandler(error) {
		try {
			await gameChangerAPI.sendFrontendErrorPOST(error.stack);
		} catch (err) {
			console.log({ err });
		}
	}

	return (
		<Router>
			<MatomoProvider value={instance}>
				<MuiThemeProvider theme={ThemeDefault}>
					<MuiThemeProvider muiTheme={theme}>
						<ClassificationBanner />
						<ConsentAgreement />

						<Route
							exact
							path="/"
							children={({ match, location, history }) => (
								<div style={getStyleType(match, location)}>
									<SlideOutMenuContextHandler>
										<>
											<ErrorBoundary
												FallbackComponent={ErrorPage}
												onError={errorHandler}
											>
												{!isShowNothingButComponent(location) && (
													<SlideOutMenu
														match={match}
														location={location}
														history={history}
													/>
												)}
												<Switch>
													{tokenLoaded &&
														gameChangerCloneRoutes.map((route) => {
															return route;
														})}
													<Route
														exact
														path="/"
														render={() => <Redirect to="/gamechanger" />}
													/>
													<Route
														exact
														path="/gamechanger/internalUsers/track/me"
														component={GamechangerInternalUserTrackingPage}
													/>
													<Route
														exact
														path="/gamechanger-details"
														component={GameChangerDetailsPage}
														location={location}
													/>
													{getBudgetSearchProfileRoute()}
													<PrivateTrackedRoute
														path="/gamechanger-admin"
														pageName={'GamechangerAdminPage'}
														component={GamechangerAdminPage}
														allowFunction={() => {
															return Permissions.isGameChangerAdmin();
														}}
													/>
													<PrivateTrackedRoute
														path="/gamechanger-es"
														pageName={'GamechangerEsPage'}
														component={GamechangerEsPage}
														allowFunction={() => {
															return true;
														}}
													/>
													<TrackedPDFView
														path="/pdfviewer/gamechanger"
														component={GamechangerPdfViewer}
														location={location}
													/>
													<Route path="*" component={NotFoundPage} />
												</Switch>
											</ErrorBoundary>
										</>
									</SlideOutMenuContextHandler>
									<GCFooter />
								</div>
							)}
						/>
					</MuiThemeProvider>
				</MuiThemeProvider>
			</MatomoProvider>
		</Router>
	);
};

export default App;
