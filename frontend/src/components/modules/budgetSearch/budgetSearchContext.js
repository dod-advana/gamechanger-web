import React, { useReducer } from 'react';

const initState = {
	mainPageData: {},
	runGetData: false,
	budgetSearchSettings: {
		dataSources: [],
	},
	cloneData: {
		clone_name: 'budgetSearch',
		search_module: 'budgetSearch/budgetSearchSearchHandler',
		export_module: 'simple/simpleExportHandler',
		title_bar_module: 'budgetSearch/budgetSearchTitleBarHandler',
		navigation_module: 'default/defaultNavigationHandler',
		card_module: 'budgetSearch/budgetSearchCardHandler',
		main_view_module: 'budgetSearch/budgetSearchMainViewHandler',
		search_bar_module: 'budgetSearch/budgetSearchSearchBarHandler',
		display_name: 'AI Inventory Portfolio Tool',
		is_live: true,
		url: 'budgetsearch',
		permissions_required: false,
		clone_to_advana: true,
		clone_to_gamechanger: true,
		clone_to_jupiter: false,
		clone_to_sipr: false,
		show_tutorial: false,
		show_graph: false,
		show_crowd_source: false,
		show_feedback: false,
		config: { esIndex: 'gc_budgetsearch' },
	},

	loading: false,
	resultsPage: 1,
	showSideFilters: true,
	issuingOrgs: {},
	resultsText: '',
	resetSettingsSwitch: false,
	categorySorting: {
		Documents: ['Relevance', 'Publishing Date', 'Alphabetical', 'References'],
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
	userData: {
		favorite_searches: [],
		favorite_documents: [],
	},
	notificationIds: [],
	componentStepNumbers: [],
	selectedDocuments: [],
	totalObligatedAmount: 0,
	sidebarDocTypes: [],
};

const init = (initialState) => {
	return initialState;
};

const handleSetMultipleStates = (state, action) => {
	return {
		...state,
		...action.payload,
	};
};

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

const BudgetSearchContext = React.createContext(initState);

const BudgetSearchProvider = React.memo((props) => {
	const [state, dispatch] = useReducer(reducer, initState, init);

	return (
		<BudgetSearchContext.Provider value={{ state, dispatch }}>
			{props.children}
		</BudgetSearchContext.Provider>
	);
});

export { BudgetSearchContext, BudgetSearchProvider };
