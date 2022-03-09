import { setState } from '../../../utils/sharedFunctions';
import GameChangerAPI from '../../api/gameChanger-service-api';
const _ = require('lodash');

const gamechangerAPI = new GameChangerAPI();


export const setJBookSetting = (field, value, state, dispatch, filteredList = false) => {
	let jbookSearchSettings = _.cloneDeep(state.jbookSearchSettings);
	let dataSources = _.cloneDeep(state.dataSources);
	let runSearch = false;
	let resultsPage = state.resultsPage;
	let searchText = state.searchText;

	switch (field) {
		case 'sort':
			jbookSearchSettings.sort = value;
			runSearch = true;
			resultsPage = 1;
			break;
		case 'dataSources':
			const dataSourceIndex = dataSources.indexOf(value);
			if (dataSourceIndex !== -1) {
				dataSources.splice(dataSourceIndex, 1);
			}
			else {
				dataSources.push(value);
			}
			break;
		case 'clearText':
			jbookSearchSettings[field] = value;
			break;
		case 'clearDataSources':
			dataSources = [];
			jbookSearchSettings = _.cloneDeep(state.defaultOptions);
			runSearch = true;
			resultsPage = 1;
			searchText = '';
			break;
		case 'serviceAgency':
		case 'reviewStatus':
			if (value === 'all') {
				jbookSearchSettings[field] = state.defaultOptions[field];
			}
			else if (value === 'none') {
				jbookSearchSettings[field] = [];
			}
			else if (filteredList) {
				jbookSearchSettings[field] = value;
				runSearch = true;
				resultsPage = 1;
			}
			else {
				const typeIndex = jbookSearchSettings[field].indexOf(value);
				if (typeIndex !== -1) {
					jbookSearchSettings[field].splice(typeIndex, 1);
				}
				else {
					jbookSearchSettings[field].push(value);
				}
			}
			break;
		case 'hasKeywords':
		case 'primaryReviewer':
		case 'serviceReviewer':
		case 'budgetYear':
		case 'budgetType':
		case 'primaryClassLabel':
		case 'sourceTag':
			if (value === 'all') {
				jbookSearchSettings[field] = state.defaultOptions[field];
			}
			else if (value === 'none') {
				jbookSearchSettings[field] = [];
			}
			else if (filteredList) {
				jbookSearchSettings[field] = value;
				runSearch = true;
				resultsPage = 1;
			}
			else {
				const typeIndex = jbookSearchSettings[field].indexOf(value);
				if (typeIndex !== -1) {
					jbookSearchSettings[field].splice(typeIndex, 1);
				}
				else {
					jbookSearchSettings[field].push(value);
				}
			}
			break;
		case 'programElement':
		case 'projectNum':
		case 'projectTitle':
		case 'pocReviewer':
			jbookSearchSettings[field] = value;
			resultsPage = 1;
			break;
		default:
			break;
	}
	setState(dispatch, { jbookSearchSettings, dataSources, runSearch, searchText, resultsPage, loading: runSearch });
};

export const handleTabClicked = (dispatch, state, tab) => {


	setState(dispatch, { mainTabSelected: tab });

};

export const scrollListViewTop = () => {
	if (document.getElementById('list-view-tbody')) {
		document.getElementById('list-view-tbody').scrollTop = 0;
	}
};

export const filterSortFunction = (a, b) => {
	if (a === 'Blank' && b === 'Unknown') {
		return -1;
	} else if (a === 'Unknown' && b === 'Blank') {
		return 1;
	} else if (a === 'Blank' || a === 'Unknown') {
		return 1;
	} else if (b === 'Blank' || b === 'Unknown') {
		return -1;
	} else {
		if (a.toUpperCase() < b.toUpperCase()) {
			return -1;
		}
		if (a.toUpperCase() > b.toUpperCase()) {
			return 1;
		}
		return 0;
	}
};

export const populateDropDowns = async (state, dispatch) => {
	const jbookSearchSettings = _.cloneDeep(state.jbookSearchSettings);
	const defaultOptions = _.cloneDeep(state.defaultOptions);

	const { data } = await gamechangerAPI.callSearchFunction({
		functionName: 'getDataForFilters',
		cloneName: state.cloneData.clone_name,
		options: {},
	});

	jbookSearchSettings.budgetYear = defaultOptions.budgetYear = data.budgetYear.map(year => year !== null ? year : 'Blank').sort(filterSortFunction);
	jbookSearchSettings.reviewStatus = defaultOptions.reviewStatus = data.reviewstatus.map(status => status !== null ? status : 'Blank').sort(filterSortFunction);
	jbookSearchSettings.serviceAgency = defaultOptions.serviceAgency = data.serviceAgency.map(agency => agency !== null ? agency : 'Blank').sort(filterSortFunction);
	jbookSearchSettings.primaryClassLabel = defaultOptions.primaryClassLabel = data.primaryclasslabel.map(label => label !== null ? label : 'Blank').sort(filterSortFunction);
	jbookSearchSettings.sourceTag = defaultOptions.sourceTag = data.sourcetag.map(tag => tag !== null ? tag : 'Blank').sort(filterSortFunction);

	let dropdownData;
	try {
		dropdownData = await gamechangerAPI.callDataFunction({
			functionName: 'getBudgetDropdownData',
			cloneName: 'jbook',
			options: {}
		});

		if (dropdownData && dropdownData.data) {

			dropdownData = dropdownData.data;
			dropdownData.serviceReviewers.push({ name: 'Blank' });

			jbookSearchSettings.primaryReviewer = defaultOptions.primaryReviewer = dropdownData.reviewers.map(reviewer => reviewer !== null && reviewer.name !== null ? `${reviewer.name}${reviewer.organization ? ` (${reviewer.organization})` : ''}` : 'Blank').sort(filterSortFunction);
			jbookSearchSettings.serviceReviewer = defaultOptions.serviceReviewer = dropdownData.serviceReviewers.map(reviewer => reviewer !== null && reviewer.name !== null ? `${reviewer.name}${reviewer.organization ? ` (${reviewer.organization})` : ''}` : 'Blank').concat(dropdownData.secondaryReviewers.map(reviewer => reviewer !== null && reviewer.name !== null ? `${reviewer.name}${reviewer.organization ? ` (${reviewer.organization})` : ''}` : 'Blank')).sort(filterSortFunction);

			jbookSearchSettings.primaryReviewer.push('Unknown');
			jbookSearchSettings.primaryReviewer.push('Blank');

			jbookSearchSettings.serviceReviewer.push('Blank');
			defaultOptions.serviceReviewer.push('Blank');

		}
		else {
			jbookSearchSettings.primaryReviewer = defaultOptions.primaryReviewer = data.primaryreviewer.map(reviewer => reviewer !== null ? reviewer : 'Blank').sort(filterSortFunction);
			jbookSearchSettings.serviceReviewer = defaultOptions.serviceReviewer = data.servicereviewer.map(reviewer => reviewer !== null ? reviewer : 'Blank').sort(filterSortFunction);
		}
	} catch (err) {
		console.log('Error fetching dropdown data');
		console.log(err);
	}

	return { defaultOptions, jbookSearchSettings, dropdownData };

	// if (initial) {
	// 	setState(dispatch, {loading: true, runSearch: true, defaultOptions, jbookSearchSettings, dropdownData });
	// } else {
	// 	setState(dispatch, {defaultOptions, dropdownData });
	// }
};

export const autoDownloadFile = ({ data, filename = 'results', extension = 'txt' }) => {
	//Create a link element, hide it, direct it towards the blob, and then 'click' it programatically

	const a = document.createElement('a');
	a.style = 'display: none';
	document.body.appendChild(a);
	//Create a DOMString representing the blob 
	//and point the link element towards it
	const url = window.URL.createObjectURL(data);
	a.href = url;
	a.download = `${filename}.${extension}`;
	//programatically click the link to trigger the download
	a.click();
	//release the reference to the file by revoking the Object URL
	window.URL.revokeObjectURL(url);
	document.body.removeChild(a);
};

