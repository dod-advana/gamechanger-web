import _ from 'lodash';

export const DEFAULT_SEARCH_TYPES = {
	applications: true,
	dashboards:
		process.env.REACT_APP_NODE_ENV !== 'sipr' &&
		window?.__env__?.REACT_APP_NODE_ENV !== 'sipr',
	dataSources:
		process.env.REACT_APP_NODE_ENV !== 'sipr' &&
		window?.__env__?.REACT_APP_NODE_ENV !== 'sipr',
	databases: true,
	documentation: false,
	organizations: false,
	services: false,
};

export const searchTypeReducer = (existingState, typesToUpdate = {}) => {
	return { ...existingState, ...typesToUpdate };
};

export const resultsMetaReducer = (existingState, action = {}) => {
	let { type, key, value } = action;

	if (type === 'reset') return {};

	if (!(key in DEFAULT_SEARCH_TYPES)) return existingState;

	let copy = _.cloneDeep(existingState);

	if (copy[key]) copy[key] = { ...copy[key], ...value };
	else copy[key] = value;

	return copy;
};

export const hideSearchSection = (activeTab, currentTab) => {
	let lowerActive = activeTab?.toLowerCase();
	let lowerCurrent = currentTab?.toLowerCase();

	return lowerActive !== 'all' && lowerActive !== lowerCurrent;
};

export const parseSearchTypes = (urlParams) => {
	let result = {};

	for (let key of Object.keys(DEFAULT_SEARCH_TYPES)) {
		if (urlParams.get(key)) result[key] = urlParams.get(key) === 'true';
		else result[key] = DEFAULT_SEARCH_TYPES[key];
	}

	return result;
};

const capitalizeWords = (string) => {
	const words = string.split(' ');
	return words
		.map((word) => {
			return word[0].toUpperCase() + word.substring(1);
		})
		.join(' ');
};

export const parseOwnerName = (name = '') => {
	try {
		const newStr = name
			.replace(/[0-9]/g, '')
			.replace(/\./g, ' ')
			.toLowerCase()
			.trim();
		return capitalizeWords(newStr);
	} catch (err) {
		console.warn('Error occurred in parseOwnerName');
		console.warn(err);
		return name;
	}
};
