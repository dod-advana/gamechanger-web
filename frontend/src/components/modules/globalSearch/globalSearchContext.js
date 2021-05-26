import React, { useReducer } from 'react';

const initState = {
	cloneDataSet: false,
	cloneData: {
		clone_name: 'globalSearch',
		search_module: 'globalSearch/globalSearchHandler',
		export_module: 'simple/simpleExportHandler',
		title_bar_module: 'globalSearch/globalSearchTitleBarHandler',
		navigation_module: 'globalSearch/globalSearchNavigationHandler',
		card_module: 'globalSearch/globalSearchCardHandler',
		display_name: 'Global Search',
		is_live: true,
		url: 'searchtest',
		permissions_required: false,
		clone_to_advana: true,
		clone_to_gamchanger: false,
		clone_to_jupiter: false,
		clone_to_sipr: false,
		show_tutorial: false,
		show_graph: false,
		show_crowd_source: false,
		show_feedback: true,
		config: {esIndex: 'globalsearch'}
	},
	history: undefined,
	historySet: false,
	
	// Notifications
	notifications: [],
	notificationIds: [],
	alerts: {
		noResultsMessage: null,
		unauthorizedError: false,
		transformFailed: false,
	},
	
	// User
	userData: { favorite_searches: [], favorite_documents: [], favorite_topics: [], search_history: [], export_history: [], api_key:'' },
	newUser: false,
	userInfoModalOpen: false,
	userInfoPassed:false,
	userInfo: {
		email: '',
		org: '',
		q1: '',
		q2: ''
	},
	
	// Tutorial
	showTutorial: false,
	clickedTutorial: false,
	tutorialStepIndex: 0,
	componentStepNumbers: {},
	tutorialJoyrideSteps: [],
	
	// Show Modals
	showFeedbackModal: false,
	showAssistModal: false,
	assistVoluntary: true,
	loginModalOpen: false,
	showSnackbar: false,
	exportDialogVisible: false,
	
	loading: false,
	isResetting: false,
	documentProperties: [],
	pageDisplayed: 'main',
	listView: false,
	
	// Documents
	iframePreviewLink: null,
	detailViewId: 0,
	
	// Export
	selectedDocuments: new Map(),
	docsDrawerOpen: false,
	isSelectedDocs: false,
	isDrawerReady: false,
	
	// Navigation
	menuOpen: false,
	tabName: '',
	hideTabs: true,
	
	// Graph
	runGraphSearch: false,
	
	// SideBar
	sidebarDocTypes: [],
	sidebarOrgs: [],
	runningEntitySearch: false,
	metricsCounted: false,
	metricsLoading: false,
	entitiesForSearch: [],
	topicsForSearch: [],
	runningTopicSearch: false,
	showSideFilters: false,
	
	// Search
	offset: 0,
	esIndex: '',
	autoCompleteItems: [],
	timeSinceCache: 0,
	isCachedResult: false,
	timeFound: 0.0,
	hasExpansionTerms: false,
	noSearches: true,
	count: 0,
	resultsPage: 1,
	searchText: '',
	prevSearchText: null,
	runSearch: false,
	runningSearch: false,
	expansionDict: {},
	rawSearchResults: [],
	docSearchResults: [],
	isFavoriteSearch: false,
	resetSettingsSwitch: false,
	snackBarMsg: '',
	searchSettings: {
		showingSearchTypes: {
			applications: true,
			dashboards: true,
			dataSources: true,
			databases: true,
			documentation: false,
			organizations: false,
			services: false
		}
	}
};

const init = (initialState) => {
	return initialState;
};

const handleSetAlert = (state, action) => {
	const alerts = {
		...state.alerts,
		...action.payload
	}
	return {
		...state,
		alerts
	};
}

const handleSetMultipleStates = (state, action) => {
	return {
		...state,
		...action.payload
	}
}

function reducer(state, action) {
	switch (action.type) {
		case 'SET_STATE':
			return handleSetMultipleStates(state, action);
		case 'SET_ALERT':
			return handleSetAlert(state, action);
		case 'SET_EXPORT_DIALOG_VISIBLE':
			return {
				...state,
				exportDialogVisible: action.payload,
				isSelectedDocs: action.payload
			};
		case 'RESET_SEARCH_SETTINGS':
			return {
				...state,
				searchSettings: initState.searchSettings
			};
		case 'RESET_STATE':
			return {
				...initState,
				searchSettings: state.searchSettings,
				componentStepNumbers: state.componentStepNumbers,
				tutorialJoyrideSteps: state.tutorialJoyrideSteps,
				userData: state.userData,
				documentProperties: state.documentProperties
			};
		default:
			return state;
	}
}

const GlobalSearchContext = React.createContext(initState);

const GlobalSearchProvider = React.memo((props) => {
	const [state, dispatch] = useReducer(reducer, initState, init);
	
	return (
		<GlobalSearchContext.Provider value={{state, dispatch}}>
			{props.children}
		</GlobalSearchContext.Provider>
	);
});

export { GlobalSearchContext, GlobalSearchProvider };
