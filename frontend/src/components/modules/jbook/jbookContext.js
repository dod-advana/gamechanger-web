import React, { useReducer } from 'react';

const initState = {
	welcomeModalClosed: false,
	consentModalClosed: false,
	feedbackText: '',
	feedbackSubmitted: false,
	feedbackModalOpen: false,
	feedbackValidated: true,
	feedbackForm: {
		first_name: '',
		last_name: '',
		email: '',
		type: '',
		description: ''
	},
	feedbackFormValidation: {
		first_name: false,
		last_name: false,
		email: false,
	},
	exportLoading: false,
	mainTabSelected: 0,
	mainPageData: {},
	dropdownData: {},
	tabs: ['summary', 'checklist'],
	useDataSources: false,
	queryParams: '',
	urlSearch: false,
	initial: true,
	jbookSearchSettings: {
		clearText: true,
		budgetType: ['RDT&E', 'Procurement', 'O&M'],
		reviewStatus: ['Needs Review', 'Partial Review (Primary)', 'Partial Review (Service)', 'Partial Review (POC)', 'Finished Review'],
		serviceAgency: ['Air Force', 'Army', 'Navy', 'OTED', 'US SOC'],
		budgetYear: ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
		programElement: '',
		projectNum: '',
		projectTitle: '',
		primaryReviewer: ['Gregory Allen', 'Sridhar Srinivasan', 'Jeff MacKinnon', 'Tomeka Williams'],
		serviceReviewer: ['Brett Vaughan (Navy)', 'Ruben Cruz (Army)', 'Joseph Chapa (Air Force)', 'Misty Blowers (Marine Corp)', 'Paige Nemmers (SOCOM)', 'Reb Butler (Space Force)', 'Wade Pulliam (OUSD)', 'Unknown'],
		pocReviewer: '',
		sort: [],
		primaryClassLabel: ['Unknown', 'Not AI', 'AI Enabling', 'AI Enabled', 'Core AI'],
		sourceTag: ['Unknown', 'JAIC 2021 Review', 'JAIC Ontology', 'NSCAI', 'JAIC Ontology|OSD CIO', 'JAIC Ontology|NSCAI', 'JAIC Ontology|OSD CIO|NSCAI', 'OSD CIO|NSCAI', 'OSD CIO'],
		hasKeywords: ['Yes', 'No'],
	},
	defaultOptions: {
		clearText: true,
		budgetType: ['RDT&E', 'Procurement', 'O&M'],
		reviewStatus: ['Needs Review', 'Partial Review (Primary)', 'Partial Review (Service)', 'Partial Review (POC)', 'Finished Review'],
		serviceAgency: ['Air Force', 'Army', 'Navy', 'OTED', 'US SOC'],
		budgetYear: ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
		primaryReviewer: ['Gregory Allen', 'Sridhar Srinivasan', 'Jeff MacKinnon', 'Tomeka Williams'],
		serviceReviewer: ['Brett Vaughan (Navy)', 'Ruben Cruz (Army)', 'Joseph Chapa (Air Force)', 'Misty Blowers (Marine Corp)', 'Paige Nemmers (SOCOM)', 'Reb Butler (Space Force)', 'Wade Pulliam (OUSD)', 'Unknown'],
		pocReviewer: '',
		primaryClassLabel: ['Unknown', 'Not AI', 'AI Enabling', 'AI Enabled', 'Core AI'],
		sourceTag: ['Unknown', 'JAIC 2021 Review', 'JAIC Ontology', 'NSCAI', 'JAIC Ontology|OSD CIO', 'JAIC Ontology|NSCAI', 'JAIC Ontology|OSD CIO|NSCAI', 'OSD CIO|NSCAI', 'OSD CIO'],
		programElement: '',
		projectNum: '',
		projectTitle: '',
		sort: [],
		hasKeywords: ['Yes', 'No'],
		secondaryReviewer: ['Vicki Belleau', 'Robert Brooks', 'Randy Backley', 'Rudolph Butler', 'Matthew Cocuzzi', 'Amorella Davis', 'Edward Faudra', 'Nicholas Forrest', 'Angela Giddings', 'Adam Gilmore', 'Paul Hayes', 'Jason Hill', 'Russell Jimeno', 'Chetna Kapadia', 'Kevin Kennedy', 'Callie King', 'Christopher Kubricky', 'Elony May', 'Lisa Mazur', 'Melissa Moore', 'Laila Moretto', 'Kayla Peterson', 'Paul Roque', 'Tracy Slack', 'Samantha Roy', 'Cristina Stone', 'Kebin Umodu', 'Robert McFarland', 'Timothy Laban', 'Christina Buco', 'David Aha', 'Matt Poe', 'Erik Kirk']
	},
	serviceReviewersOnly: [],
	secondaryReviewersOnly: [],
	projectData: {},
	serviceValidated: true,
	pocValidated: true,
	serviceValidation: {
		// serviceSecondaryReviewer: false,
		serviceClassLabel: false,
		servicePTPAgreeLabel: false,
		servicePlannedTransitionPartner: false, //primaryPlannedTransitionPartner
		servicePOCTitle: false,
		servicePOCName: false,
		servicePOCEmail: false,
		servicePOCOrg: false,
		servicePOCPhoneNumber: false,
		// serviceReviewerNotes: false
	},
	pocValidation: {
		pocJointCapabilityArea: false,
		domainTask: false,
		// altPOCTitle: false,
		// altPOCName: false,
		// altPOCEmail: false,
		// altPOCOrg: false,
		// altPOCPhoneNumber: false,
		pocAgreeLabel: false,
		pocClassLabel: false, // serviceClassLabel
		pocPTPAgreeLabel: false,
		pocPlannedTransitionPartner: false, // service and primary
		pocMPAgreeLabel: false,
		roboticsSystemAgree: false,
		intelligentSystemsAgree: false,
		amountAttributed: false,
		pocAIType: false,
		pocAITypeDescription: false,
		pocAIRoleDescription: false,
	},
	reviewData: {
		serviceAgreeLabel: null,
		primaryClassLabel: null,
		transitionPartnerKnown: null,
		servicePTPAgreeLabel: null,
		serviceTransType: null,
		primaryPlannedTransitionPartner: null,
		servicePlannedTransitionPartner: null,
		serviceMissionPartnersList: [],
		serviceMissionPartnersChecklist: null,
		serviceAdditionalMissionPartners: null,
		reviewStatus: null,
		secLabelAgreement: null,
		secNotes: null,
		secReviewStatus: null,
		servicePOCTitle: null,
		servicePOCName: null,
		servicePOCEmail: null,
		primaryReviewNotes: null,
		primaryReviewStatus: null,
		serviceReviewStatus: null,
		pocReviewStatus: null,
		primaryReviewer: null,
		serviceReviewer: null,
		pocReviewer: null,
		otherMissionPartners: null,
		serviceReviewerNotes: null,
		altPOCTitle: null,
		altPOCName: null,
		altPOCEmail: null,
		altPOCOrg: null,
		altPOCPhoneNumber: null,
		pocMPAgreeLabel: 'Yes',
		pocMissionPartnersChecklist: null,
		pocJointCapabilityArea: null,
		pocJointCapabilityArea2: [],
		pocJointCapabilityArea3: [],
		pocDollarsAttributedCategory: null,
		pocDollarsAttributed: null,
		pocPercentageAttributedCategory: null,
		pocPercentageAttributed: null,
		pocAIRoleDescription: null,
		pocAITypeDescription: null,
		pocAIType: null,
		serviceSecondaryReviewer: null,
		servicePOCOrg: null,
		servicePOCPhoneNumber: null,
		domainTask: null,
		domainTaskSecondary: [],
		roboticsSystemAgree: null,
		intelligentSystemsAgree: null,
	},
	domainTasks: {
		'Natural Language Processing': [],
		'Sensing and Perception': [],
		'Planning, Scheduling, and Reasoning': [],
		'Prediction and Assessment': [],
		'Modeling and Simulation': [],
		'Human-Machine Interaction': [],
		'Responsible AI': [],
		'Other': []
	},
	budgetTypeDropdown: false,
	serviceAgencyDropdown: false,
	reviewStatusDropdown: false,
	budgetYearDropdown: false,
	primaryReviewerDropdown: false,
	serviceReviewerDropdown: false,
	// pocReviewerDropdown: false,
	primaryClassLabelDropdown: false,
	sourceTagDropdown: false,
	hasKeywordsDropdown: false,
	JAICModelOpen: false,
	ServiceModalOpen: false,
	reviewers: [],
	categories: ['Core AI', 'AI-Enabled', 'AI-Enabling', 'Not AI'],
	serviceReviewers: ['Army', 'Navy', 'Marines', 'Air Force', 'Coast Guard', 'Space Force'],
	// reviewStatus: ['Needs Review', 'Partial Review', 'Finished Review'],
	keywordsChecked: [],
	dataSources: [],
	cloneData: {
		clone_name: 'jbook',
		search_module: 'jbook/jbookSearchHandler',
		export_module: 'simple/simpleExportHandler',
		title_bar_module: 'jbook/jbookTitleBarHandler',
		navigation_module: 'default/defaultNavigationHandler',
		card_module: 'jbook/jbookCardHandler',
		main_view_module: 'jbook/jbookMainViewHandler',
		search_bar_module: 'jbook/jbookSearchBarHandler',
		display_name: 'AI Inventory Portfolio Tool',
		is_live: true,
		url: 'jbook',
		permissions_required: false,
		clone_to_advana: true,
		clone_to_gamechanger: true,
		clone_to_jupiter: false,
		clone_to_sipr: false,
		show_tutorial: false,
		show_graph: false,
		show_crowd_source: false,
		show_feedback: false,
		config: { esIndex: 'gc_budgetsearch' }
	},

	loading: true,
	profileLoading: false,
	primaryReviewLoading: false,
	resultsPage: 1,
	showSideFilters: true,
	issuingOrgs: {},
	resultsText: '',
	resetSettingsSwitch: false,
	categorySorting: {
		Documents: ['Relevance', 'Publishing Date', 'Alphabetical', 'References']
	},

	//
	notifications: [],
	alerts: {},
	userInfo: {},
	searchSettings: {
		allCategoriesSelected: true,
		specificCategoriesSelected: false,
	},
	rawSearchResults: [],
	userData: undefined,
	notificationIds: [],
	componentStepNumbers: [],
	totalObligatedAmount: 0,
	sidebarDocTypes: [],

	// gc card view context
	selectedDocuments: new Map(),
	listView: false

}

const init = (initialState) => {
	return initialState;
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
		case 'RESET_STATE':
			return {
				...initState,
			};
		// case 'RESET_SEARCH_SETTINGS':
		//     return {
		//         ...state,
		//         searchSettings: initState.searchSettings
		//     };
		default:
			return state;
	}
}

const JBookContext = React.createContext(initState);

const JBookProvider = React.memo((props) => {
	const [state, dispatch] = useReducer(reducer, initState, init);

	return (
		<JBookContext.Provider value={{ state, dispatch }}>
			{props.children}
		</JBookContext.Provider>
	);
});

export { JBookContext, JBookProvider };
