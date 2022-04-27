import React, { useReducer } from 'react';
import { orgFilters, typeFilters } from '../../../utils/gamechangerUtils';

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
			fpds: false,
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
		excludeTerms: null,
		vendorName: null,
		fundingOfficeCode: null,
		idvPIID: null,
		modNumber: null,
		pscDesc: null,
		piid: null,
		reqDesc: null,
		psc: null,
		fundingAgencyName: null,
		naicsCode: null,
		duns: null,
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
	analystToolsSearchSettings: {
		isFilterUpdate: false,
		orgUpdate: false,
		orgFilter: orgFilters,
		orgCount: {},
		typeCount: {},
		organizations: [],
		majcoms: {
			'air force': [],
			army: [],
			defense: [],
			navy: [],
		},
		fiscalYears: [],
		allYearsSelected: true,
		contractsOrMods: 'both',
		idvPIID: '',
		typeFilter: typeFilters,
		allOrgsSelected: true,
		specificOrgsSelected: false,
		allTypesSelected: true,
		specificTypesSelected: false,
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
		case 'RESET_ANALYST_TOOLS_SEARCH_SETTINGS':
			const newState = {
				...state,
				analystToolsSearchSettings: initState.analystToolsSearchSettings,
			};
			newState.analystToolsSearchSettings.typeFilter = state.presearchTypes;
			newState.analystToolsSearchSettings.orgFilter = state.presearchSources;
			return newState;
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

	return <EDAContext.Provider value={{ state, dispatch }}>{props.children}</EDAContext.Provider>;
});

export { EDAContext, EDAProvider };
