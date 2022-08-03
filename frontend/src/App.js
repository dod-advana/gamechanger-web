import React, { useEffect, useState } from 'react';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';
import { Redirect, Route, HashRouter as Router, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import { MatomoProvider, createInstance, useMatomo } from '@datapunt/matomo-tracker-react';
import { getProvider } from './components/factories/contextFactory';
import GameChangerAPI from './components/api/gameChanger-service-api';
import TrackerWrapper from './components/telemetry/TrackerWrapperHooks';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { createBrowserHistory } from 'history';
import SparkMD5 from 'spark-md5';
import _ from 'lodash';
import './styles.css';
import 'font-awesome/css/font-awesome.css';
import 'flexboxgrid/css/flexboxgrid.css';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import Config from './config/config';
import Auth from '@dod-advana/advana-platform-ui/dist/utilities/Auth';
import ThemeDefault from '@dod-advana/advana-platform-ui/dist/theme-default';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import ClassificationBanner from '@dod-advana/advana-platform-ui/dist/ClassificationBanner';
import { ErrorBoundary } from 'react-error-boundary';
import TutorialOverlayAPI from '@dod-advana/advana-tutorial-overlay/dist/api/TutorialOverlay';
import SlideOutMenu from '@dod-advana/advana-side-nav/dist/SlideOutMenu';

import './index.css';

require('typeface-noto-sans');
require('typeface-montserrat');
require('./favicon.ico');

const emptyPage = () => {
	return (
		<div className="main-container" style={{ minHeight: 'calc(100vh - 30px)' }}>
			<LoadingIndicator />
		</div>
	);
};

const ConsentAgreement = LoadableVisibility({
	loader: () => import('@dod-advana/advana-platform-ui/dist/ConsentAgreement'),
	loading: () => {
		return <></>;
	},
});

const SlideOutMenuContextHandler = LoadableVisibility({
	loader: () => import('@dod-advana/advana-side-nav/dist/SlideOutMenuContext'),
	loading: () => {
		return (
			<div
				style={{
					position: 'fixed',
					left: 0,
					top: '2em',
					bottom: 0,
					zIndex: 500,
					backgroundColor: '#171A23',
				}}
			/>
		);
	},
});

const ErrorPage = LoadableVisibility({
	loader: () => import('@dod-advana/advana-platform-ui/dist/containers/GenericErrorPage'),
	loading: () => emptyPage(),
});

const NotFoundPage = LoadableVisibility({
	loader: () => import('@dod-advana/advana-platform-ui/dist/containers/NotFoundPage'),
	loading: () => emptyPage(),
});

const UnauthorizedPage = LoadableVisibility({
	loader: () => import('@dod-advana/advana-platform-ui/dist/containers/UnauthorizedPage'),
	loading: () => emptyPage(),
});

const GamechangerPage = LoadableVisibility({
	loader: () => import('./containers/GameChangerPage'),
	loading: () => {
		return (
			<div className="main-container" style={{ minHeight: 'calc(100vh - 220px)' }}>
				<div style={{ width: window.screen.width - 50 }}>
					<LoadingIndicator shadedOverlay={true} />
				</div>
			</div>
		);
	},
});

const GamechangerAdminPage = LoadableVisibility({
	loader: () => import('./containers/GamechangerAdminPage'),
	loading: () => emptyPage(),
});

const GamechangerEsPage = LoadableVisibility({
	loader: () => import('./containers/GamechangerEsPage'),
	loading: () => emptyPage(),
});

const GameChangerDetailsPage = LoadableVisibility({
	loader: () => import('./containers/GameChangerDetailsPage'),
	loading: () => emptyPage(),
});

const GamechangerPdfViewer = LoadableVisibility({
	loader: () => import('./components/documentViewer/PDFViewer'),
	loading: () => emptyPage(),
});

const GamechangerLiteAdminPage = LoadableVisibility({
	loader: () => import('./containers/GamechangerLiteAdminPage'),
	loading: () => emptyPage(),
});

const instance = createInstance({
	urlBase: Config.MATOMO_LINK || '',
	siteId: Config.MATOMO_SITE_ID || 2,
});

const browserHistory = createBrowserHistory();

const tutorialOverlayAPI = new TutorialOverlayAPI();
const gameChangerAPI = new GameChangerAPI();

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
	const WrappedComponent = TrackerWrapper(Component || Render, pageName, customTelemetryDimensions);
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

const TrackedPDFView = ({ component: Component, render: Render, location, ...rest }) => {
	const { trackPageView, pushInstruction } = useMatomo();
	const query = new URLSearchParams(location.search);
	const filename = query.get('filename');
	const clone_name = query.get('cloneIndex');
	const documentTitle = `PDFViewer - ${filename} - ${clone_name}`;
	const RenderComponent = Component || Render;
	useEffect(() => {
		// On route load we want to log this to matomo, that is all this use effect does
		const userId = Auth.getUserId() || ' ';
		const regex = /\d{10}/g;
		const id = regex.exec(userId);
		pushInstruction('setUserId', SparkMD5.hash(id ? id[0] : userId));
		trackPageView({
			// documentTitle and href get logged automatically
			documentTitle,
			href: window.location.href,
		});
	});
	return <Route {...rest} render={(props) => <RenderComponent {...rest} {...props} />} />;
};

const getGamechangerRoute = (clone, tutorialData) => {
	const cloneRoutes = [];
	const name = clone.clone_name;
	const GamechangerProvider = getProvider(name);

	const url = new URL(window.location.href).hostname;
	if (clone.available_at === null) {
		clone.available_at = []; // if there's nothing at all, set as empty array
	}
	if (clone.available_at.some((v) => v.includes(url) || v === 'all')) {
		cloneRoutes.push((location) => (
			<PrivateTrackedRoute
				key={`${clone.url}-admin-lite`}
				path={`/${clone.url}/admin`}
				render={(props) => (
					<GamechangerProvider>
						<GamechangerLiteAdminPage {...props} cloneData={clone} jupiter={false} location={location} />
					</GamechangerProvider>
				)}
				pageName={clone.display_name}
				allowFunction={() => {
					return Permissions.permissionValidator(`${clone.clone_name} Admin`, true);
				}}
			/>
		));
		cloneRoutes.push((location) => (
			<PrivateTrackedRoute
				key={`${clone.url}-main`}
				path={`/${clone.url}`}
				render={(props) => (
					<GamechangerProvider>
						<GamechangerPage
							{...props}
							tutorialData={tutorialData?.[name]?.newUserTutorial || null}
							history={browserHistory}
							isClone={true}
							cloneData={clone}
							location={location}
						/>
					</GamechangerProvider>
				)}
				pageName={clone.display_name}
				allowFunction={() => {
					if (clone.permissions_required) {
						Permissions.allowGCClone(clone.clone_name) ||
							Permissions.permissionValidator(`${clone.clone_name} Admin`, true);
					} else {
						return true;
					}
				}}
			/>
		));
	}

	return cloneRoutes;
};

const getGamechangerClones = async (tutorialData, setGameChangerCloneRoutes) => {
	try {
		const data = await gameChangerAPI.getCloneData();
		const cloneRoutes = [];
		_.forEach(data.data, (clone) => {
			if (clone.is_live) {
				cloneRoutes.push(...getGamechangerRoute(clone, tutorialData));
			}
		});
		setGameChangerCloneRoutes(cloneRoutes);
	} catch (err) {
		console.log(err);
		console.log('Failed to retrieve GC Clones.');
	}
};

const App = () => {
	const [gameChangerCloneRoutes, setGameChangerCloneRoutes] = useState([]);
	const [initialized, setInitialized] = useState(false);
	const [tokenLoaded, setTokenLoaded] = useState(false);

	const isShowNothingButComponent = (location) => {
		const includePaths = ['/pdfviewer/gamechanger', '/gamechanger/internalUsers/track/me', '/gamechanger-details'];
		return includePaths.includes(location.pathname);
	};

	const getStyleType = (location) => {
		let style = styles.newContainer;
		if (isShowNothingButComponent(location)) {
			style = styles.emptyContainer;
		}
		return style;
	};

	useEffect(() => {
		const initialize = async () => {
			Auth.refreshUserToken(
				() => setTokenLoaded(true),
				() => {
					console.log('Error getting token');
					setTokenLoaded(false);
				}
			);

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
			await getGamechangerClones(tutorialData, setGameChangerCloneRoutes);
		};
		if (!initialized) {
			setInitialized(true);
			initialize();
		}
		// eslint-disable-next-line
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
					<ClassificationBanner />
					<ConsentAgreement id={'consent-agreement'} />

					<Route
						exact
						path="/"
						children={({ location }) => (
							<div style={getStyleType(location)}>
								<SlideOutMenuContextHandler>
									<>
										<ErrorBoundary FallbackComponent={ErrorPage} onError={errorHandler}>
											{!isShowNothingButComponent(location) && <SlideOutMenu />}
											<Switch>
												{tokenLoaded && gameChangerCloneRoutes.map((route) => route(location))}
												<Route
													exact
													path="/"
													render={() => (
														<Redirect to={`/${Config.ROOT_CLONE || 'gamechanger'}`} />
													)}
												/>
												<Route
													exact
													path="/gamechanger-details"
													component={GameChangerDetailsPage}
													location={location}
												/>
												<PrivateTrackedRoute
													key={`gamechanger-main-admin`}
													path="/gamechanger-admin"
													pageName={'GamechangerAdminPage'}
													component={GamechangerAdminPage}
													allowFunction={() => {
														return Permissions.permissionValidator(
															'Gamechanger Super Admin',
															true
														);
													}}
													location={location}
												/>
												<PrivateTrackedRoute
													key={`gamechanger-es`}
													path="/gamechanger-es"
													pageName={'GamechangerEsPage'}
													component={GamechangerEsPage}
													allowFunction={() => {
														return true;
													}}
													location={location}
												/>
												<TrackedPDFView
													path="/pdfviewer/gamechanger"
													component={GamechangerPdfViewer}
													location={location}
												/>
												<Route
													exact
													path="/unauthorized"
													component={() => (
														<div data-cy={'unauthorized-page'}>{UnauthorizedPage()}</div>
													)}
													location={location}
												/>
												<Route path="*" component={NotFoundPage} />
											</Switch>
										</ErrorBoundary>
									</>
								</SlideOutMenuContextHandler>
							</div>
						)}
					/>
				</MuiThemeProvider>
			</MatomoProvider>
		</Router>
	);
};

export default App;
