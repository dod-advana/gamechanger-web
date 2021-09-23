import React, { useReducer } from 'react';

const initState = {
	edaSearchSettings: {
		allOrgsSelected: true,
		organizations: [],
		aggregations: [],
		startDate: null,
		endDate: null,
		issueAgency: null,
		issueOfficeDoDAAC: null,
		issueOfficeName: null,
		allYearsSelected: true,
		fiscalYears: [],
		allDataSelected: true,
		contractData: {
			pds: false,
			syn: false,
			none: false,
		},
		minObligatedAmount: null,
		maxObligatedAmount: null,
		contractsOrMods: 'both',
		majcoms: {
			'air force': [],
			army: [],
			defense: [],
			navy: [],
		},
	},
	contractAwards: {},
	showDialog: false,
	resultsPage: 1,
	showSideFilters: true,
	issuingOrgs: {},
	statsLoading: false,
	summaryCardView: false,
	summaryCardData: [],
	resultsText: '',
	resetSettingsSwitch: false,
	categorySorting: {
		Documents: ['Relevance', 'Publishing Date', 'Alphabetical', 'References'],
	},

	// not part of EDA (yet) but currently required in NewGameChangerPage:
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
		case 'RESET_SEARCH_SETTINGS':
			return {
				...state,
				edaSearchSettings: initState.edaSearchSettings,
			};
		default:
			return state;
	}
}

const EDAContext = React.createContext(initState);

const EDAProvider = React.memo((props) => {
	const [state, dispatch] = useReducer(reducer, initState, init);

	return (
		<EDAContext.Provider value={{ state, dispatch }}>
			{props.children}
		</EDAContext.Provider>
	);
});

export { EDAContext, EDAProvider };
