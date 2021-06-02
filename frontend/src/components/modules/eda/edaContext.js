import React, { useReducer } from 'react';

const initState = {
    edaSearchSettings: {
        allOrgsSelected: true,
        organizations: {
            airForce: false,
            army: false,
            dla: false,
            marineCorps: false,
            navy: false,
            estate: false,
        },
        aggregations: {
            officeAgency: false,
            vendor: false,
            parentIDV: false
        },
        startDate: null,
        endDate: null,
        issueAgency: null,
        issueOffice: null,
        allYearsSelected: true,
        fiscalYears: [],
        allDataSelected: true,
        contractData: {
            pds: false,
            syn: false,
            none: false
        }
    },
    showDialog: false,
    resultsPage: 1,
    showSideFilters: true,
    issuingOrgs: {},
    statsLoading: false,
    resetSettingsSwitch: false,
    
    // not part of EDA (yet) but currently required in NewGameChangerPage: 
    notifications: [],
    alerts: {},
    userInfo: {},
    searchSettings: {},
    rawSearchResults: [],
    userData: {
        favorite_searches: [],
        favorite_documents: [],
    },
    notificationIds: [],
    componentStepNumbers: [],
    selectedDocuments: []
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
        case 'RESET_SEARCH_SETTINGS':
            return {
                ...state,
                edaSearchSettings: initState.edaSearchSettings
            };
		default:
			return state;
	}
}

const EDAContext = React.createContext(initState);

const EDAProvider = React.memo((props) => {
	const [state, dispatch] = useReducer(reducer, initState, init);
	
	return (
		<EDAContext.Provider value={{state, dispatch}}>
			{props.children}
		</EDAContext.Provider>
	);
});

export { EDAContext, EDAProvider };