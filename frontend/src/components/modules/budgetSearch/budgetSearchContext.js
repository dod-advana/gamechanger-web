import React, { useReducer } from 'react';

const initState = {
    mainPageData: {},
    runGetData: false,
    
    resultsPage: 1,
    showSideFilters: true,
    issuingOrgs: {},
    statsLoading: false,
    summaryCardView: false, 
    summaryCardData: [],
    resultsText: '',
    resetSettingsSwitch: false,
    categorySorting: {
		Documents: ['Relevance','Publishing Date', 'Alphabetical', 'References']
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

const BudgetSearchContext = React.createContext(initState);

const BudgetSearchProvider = React.memo((props) => {
	const [state, dispatch] = useReducer(reducer, initState, init);
	
	return (
		<BudgetSearchContext.Provider value={{state, dispatch}}>
			{props.children}
		</BudgetSearchContext.Provider>
	);
});

export { BudgetSearchContext, BudgetSearchProvider };