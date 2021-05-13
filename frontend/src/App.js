import React, { useEffect, useState } from 'react';
import { Redirect, Route, HashRouter as Router, Switch } from "react-router-dom";
import "./index.css";
import "bootstrap/dist/css/bootstrap.css";
import "react-select/dist/react-select.css";
// import Config from './config/config';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';
import { getProvider } from "./components/factories/contextFactory";
import GamechangerPage from './containers/GameChangerPage';
import GamechangerAdminPage from './containers/GamechangerAdminPage';
import GamechangerEsPage from './containers/GamechangerEsPage';
import GameChangerDetailsPage from './containers/GameChangerDetailsPage';
import GamechangerPdfViewer from './components/documentViewer/PDFViewer';
import GamechangerInternalUserTrackingPage from './components/user/InternalUserManagementAutotracker';
import GameChangerAPI from "./components/api/gameChanger-service-api";
import TrackerWrapper from './components/telemetry/TrackerWrapperHooks';
import { MuiThemeProvider as V0MuiThemeProvider } from 'material-ui';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { MuiThemeProvider } from '@material-ui/core/styles';
// import ClassificationBanner from './components/advana/ClassificationBanner';
import { useMatomo } from '@datapunt/matomo-tracker-react'
import { createBrowserHistory } from 'history';
import SlideOutMenuContextHandler from 'advana-side-nav/dist/SlideOutMenuContext';
import SparkMD5 from "spark-md5";
import _ from 'underscore';
import GCAuth from './components/common/GCAuth';
import './styles.css';
import 'font-awesome/css/font-awesome.css';
import 'flexboxgrid/css/flexboxgrid.css';
// import ThemeDefault from './components/advana/theme-default';
import SlideOutMenu from 'advana-side-nav/dist/SlideOutMenu';
import TutorialOverlayAPI from "advana-tutorial-overlay/dist/api/TutorialOverlay";
import Permissions from "advana-platform-ui/dist/utilities/permissions";
import Config from './config/config';
import Auth from 'advana-platform-ui/dist/utilities/Auth';
import AdvanaFooter from 'advana-platform-ui/dist/AdvanaFooter';
import ThemeDefault from 'advana-platform-ui/dist/theme-default';

import LoadingIndicator from "advana-platform-ui/dist/loading/LoadingIndicator";

import ClassificationBanner from 'advana-platform-ui/dist/ClassificationBanner';
// import SlideOutMenu from 'advana-side-nav/dist/SlideOutMenu';
// import SlideOutMenuContextHandler from 'advana-side-nav/dist/SlideOutMenuContext';

// import LoadingIndicator from 'advana-platform-ui/dist/loading/LoadingIndicator';

import NotFoundPage from 'advana-platform-ui/dist/containers/NotFoundPage';
import ErrorPage from 'advana-platform-ui/dist/containers/GenericErrorPage';
import DecoupledFooter from './components/navigation/DecoupledFooter';
require('typeface-noto-sans');
require('typeface-montserrat');

require('./favicon.ico');

console.log(window?.__env__?.REACT_APP_MATOMO_LINK);
console.log(process.env.REACT_APP_MATOMO_LINK);

const isDecoupled = window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' || process.env.REACT_APP_GC_DECOUPLED === 'true';

const instance = createInstance({
	urlBase: Config.MATOMO_LINK || '',
	siteId: isDecoupled ? 2 : 1
});

const history = createBrowserHistory();

const tutorialOverlayAPI = new TutorialOverlayAPI();
const gameChangerAPI = new GameChangerAPI();

const v0Theme = getMuiTheme({});

const styles = {
	splashContainerClosed: {
		padding: 0,
		height: "100%"
	},
	container: {
		paddingTop: 120,
		paddingRight: 30,
		paddingLeft: 30,
		paddingBottom: 10
	},
	emptyContainer: {
		paddingTop: 30,
		paddingRight: 0,
		paddingLeft: 0,
		paddingBottom: 0,
		height: 'calc(100% - 6px)'
	},
	newContainer: {
		height: 'calc(100% - 30px)',
		marginLeft: '50px',
		marginTop: '2em'
	}
};

const PrivateTrackedRoute = ({ allowFunction, component: Component, render: Render, pageName, customTelemetryDimensions = false, ...rest }) => {
	const WrappedComponent = TrackerWrapper(Component || Render, pageName, customTelemetryDimensions);
	return (
		<Route
			{...rest}
			render={props =>
				allowFunction(props) ? (
					<WrappedComponent {...rest} {...props} />
				) : (
						<Redirect
							to={{
								pathname: "/unauthorized"
							}}
						/>
					)
			}
		/>
	)
};

const TrackedPDFView = ({ component: Component, render: Render, location, ...rest }) => {
	const { trackPageView, pushInstruction } = useMatomo();
	const query = new URLSearchParams(location.search);
	const filename = query.get('filename');
	const documentTitle = `PDFViewer - ${filename}`;
	const RenderComponent = Component || Render;
	useEffect(() => {
		// On route load we want to log this to matomo, that is all this use effect does
		const userId = isDecoupled ? GCAuth.getTokenPayload().cn : Auth.getUserId() || ' ';
		const regex = /\d{10}/g;
		const id = regex.exec(userId)
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
			render={props =>
				<RenderComponent {...rest} {...props} />
			}
		/>
	)
};

const App = (props) => {

	const [gameChangerCloneRoutes, setGameChangerCloneRoutes] = useState([]);
	const [initialized, setInitialized] = useState(false);
	const [tokenLoaded, setTokenLoaded] = useState(false);

	const getGamechangerClones = async (tutorialData) => {
		try {
			let permissions = Auth.getUserPermissions();
			// const { gameChangerClones } = this.state;
			const data = await gameChangerAPI.getCloneData();
			const cloneRoutes = _.map(data.data, (clone, idx) => {
				if (clone.is_live && clone.clone_to_advana) {
					// gameChangerClones.push(clone);

					const name = clone.clone_name;
					const GamechangerProvider = getProvider(name);
					if (clone.permissions_required) {
						return (
							<PrivateTrackedRoute key={idx} path={`/${clone.url}`} render={(props) => <GamechangerProvider><GamechangerPage {...props}
								tutorialData={tutorialData && tutorialData[name] ? tutorialData[name].newUserTutorial : null}
								history={history} isClone={true} cloneData={clone} /></GamechangerProvider>} pageName={clone.display_name}
								allowFunction={() => {
									return Permissions.allowGCClone(clone.clone_name);
								}}
							/>
						)
					} else {
						return (
							<PrivateTrackedRoute key={idx} path={`/${clone.url}`} render={(props) => <GamechangerProvider><GamechangerPage {...props}
								tutorialData={tutorialData && tutorialData[name] ? tutorialData[name].newUserTutorial : null}
								history={history} isClone={true} cloneData={clone} /></GamechangerProvider>} pageName={clone.display_name}
								allowFunction={() => {
									return true;
								}}
							/>
						);
					}
				}
			});
			setGameChangerCloneRoutes(cloneRoutes);
		} catch (err) {
			console.log(err);
			console.log('Failed to retrieve GC Clones.');
		}
	}

	const isShowNothingButComponent = (location) => {
		const includePaths = ['/pdfviewer/gamechanger', '/gamechanger/internalUsers/track/me', '/gamechanger-details'];

		return includePaths.includes(location.pathname);
	}

	const setUserMatomo = (value) => {
		localStorage.setItem('userMatomo', value);
	}

	const getStyleType = (match, location) => {
		let style = styles.newContainer;
		if (isShowNothingButComponent(location)) {
			style = styles.emptyContainer;
		}
		return style;
	}

	useEffect(() => {
		const initialize = async () => {

			if(isDecoupled) {
				GCAuth.refreshUserToken(() => setTokenLoaded(true), () => setTokenLoaded(true));
			} else {
				Auth.refreshUserToken(() => setTokenLoaded(true), () => setTokenLoaded(true));
			}

			// fetch tutorial overlay data
			let tutorialData = [];
			try {
				const data = await tutorialOverlayAPI.tutorialOverlaysGET();
				tutorialData = tutorialOverlayAPI.setupTutorialOverlay(data.data);
			} catch (err) {
				console.log(err);
				console.log("Failed to retrieve Tutorial Overlay data");
			}

			getGamechangerClones(tutorialData);
		};
		if (!initialized) {
			setInitialized(true);
			initialize();
		}
	}, [initialized]);

	if(!initialized || !tokenLoaded) {
		return (<LoadingIndicator/>);
	}

	console.log(Auth.getUserPermissions());

	return (
		<MatomoProvider value={instance}>
			<MuiThemeProvider theme={ThemeDefault}>
				<V0MuiThemeProvider muiTheme={v0Theme}>
					<div style={{ height: '100%', paddingTop: 1, marginTop: -1 }}>
						<ClassificationBanner />
						<SlideOutMenuContextHandler>
							<Router>

								<Route exact path='/' children={({ match, location, history }) => (
									<div style={getStyleType(match, location)}>
										<>
											{location.pathname !== '/pdfviewer/gamechanger' && <SlideOutMenu match={match} location={location} history={history} />}
											<Switch >
												{tokenLoaded && gameChangerCloneRoutes.map(route => {
													return (
														route
													)
												})}
												<Route exact path="/gamechanger/internalUsers/track/me" component={GamechangerInternalUserTrackingPage} />
												<Route exact path="/gamechanger-details" component={GameChangerDetailsPage} location={location} />
												<PrivateTrackedRoute path="/gamechanger-admin" pageName={'GamechangerAdminPage'} component={GamechangerAdminPage} allowFunction={() => { return Permissions.isGameChangerAdmin(); }} />
												<PrivateTrackedRoute path="/gamechanger-es" pageName={'GamechangerEsPage'} component={GamechangerEsPage} allowFunction={() => { return true; }} />
												<TrackedPDFView path="/pdfviewer/gamechanger" component={GamechangerPdfViewer} location={location} />
											</Switch>
										</>
									</div>
								)} />
							</Router>
						</SlideOutMenuContextHandler>
						{isDecoupled && <DecoupledFooter setUserMatomo={setUserMatomo} />}
						{isDecoupled && <AdvanaFooter />}
					</div>
				</V0MuiThemeProvider>
			</MuiThemeProvider>
		</MatomoProvider>
	);
};

export default App;