import { createContext } from 'react';

export const SearchContext = createContext({
	filters: {},
	setFilters: () => {},

	reset: () => {},

	keyword: '',
	setKeyword: () => {},

	gridView: true,
	setGridView: () => {},

	searchTypes: {},
	dispatchSearchTypes: () => {},

	orderBy: '',
	setOrderBy: () => {},

	activeTab: 'all',
	setActiveTab: () => {},

	resultMetaData: {},
	dispatchResultMetaData: () => {},

	returnHome: () => {},
});
