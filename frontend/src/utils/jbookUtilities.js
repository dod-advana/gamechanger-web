import {orgColorMap, typeColorMap} from './gamechangerUtils';
import _ from 'lodash';

export const getClassLabel = (reviewData) => {
	if (reviewData) {
		if (reviewData.pocAgreeLabel && reviewData.pocAgreeLabel === 'No' && reviewData.pocClassLabel) {
			return reviewData.pocClassLabel;
		} else if (reviewData.serviceAgreeLabel && reviewData.serviceAgreeLabel === 'No' && reviewData.serviceClassLabel) {
			return reviewData.serviceClassLabel;
		} else if (reviewData.primaryClassLabel) {
			return reviewData.primaryClassLabel;
		} else {
			return 'Unknown';
		}
	}

	return 'Unknown';
};

export const getTotalCost = (reviewData) => {
	let returnValue = 0;

	if (reviewData.allPriorYearsAmount) {
		returnValue += reviewData.allPriorYearsAmount;
	}
	if (reviewData.priorYearAmount) {
		returnValue += reviewData.priorYearAmount;
	}
	if (reviewData.currentYearAmount) {
		returnValue += reviewData.currentYearAmount;
	}
	return returnValue;
};

export const getSearchTerms = (searchText) => {
	return getQueryAndSearchTerms(searchText);
};

const getQueryAndSearchTerms = (searchText) => {
	// change all text to lower case, need upper case AND/OR for solr search so easier if everything is lower
	const searchTextLower = searchText.toLowerCase();
	
	// finds quoted phrases separated by and/or and allows nested quotes of another kind eg "there's an apostrophe"
	const rawSequences = findQuoted(searchTextLower);

	let searchTextWithPlaceholders = searchTextLower;
	// replace phrases with __#__ placeholder
	rawSequences.forEach((phrase, index) => {
		searchTextWithPlaceholders = searchTextWithPlaceholders.replace(phrase, `__${index}__`);
	});

	// replace and/or with ' AND ' ' OR ' as required for solr search, one space is required
	searchTextWithPlaceholders = searchTextWithPlaceholders.replace(/(\s+)and(\s+)/g, ` AND `);
	searchTextWithPlaceholders = searchTextWithPlaceholders.replace(/(\s+)or(\s+)/g, ` OR `);

	// find unquoted words after replacing and/or
	// combine all terms to return for snippet highlighting
	const termsArray = findLowerCaseWordsOrAcronyms(searchTextWithPlaceholders);

	// fill back in double quoted phrases for solr search
	rawSequences.forEach((phrase, index) => {
		const replacementSequence = convertPhraseToSequence(phrase);
		termsArray.push(replacementSequence.replace(/"/g, ''));
		searchTextWithPlaceholders = searchTextWithPlaceholders.replace(`__${index}__`, `${replacementSequence}`);
	});

	// return solr query and list of search terms after parsing
	return termsArray;
};

const findQuoted = (searchText) => {
	// finds quoted phrases separated by and/or and allows nested quotes of another kind eg "there's an apostrophe"
	return searchText.match(/(?!\s*(and|or))(?<words>(?<quote>'|").*?\k<quote>)/g) || [];
};

const findLowerCaseWordsOrAcronyms = (searchText) => {
	// finds lower case words, acronyms with . and with digits eg c2 or a.i.
	return searchText.match(/\b([a-z\d.])+(\b|)/g) || [];
};

const convertPhraseToSequence = (phrase) => {
	// force double quotes then
	// let json parser escape nested quotes
	// and then read back
	return JSON.parse(JSON.stringify(`"${phrase.slice(1, -1)}"`));
};

export const getDocTypeStyles = (docType) => {
	if (!docType) {
		return { docTypeColor: '', docOrg: '', docOrgColor: '' };
	}

	const docTypeColor = typeColorMap['document'];

	switch (docType) {
		case 'Air Force (AF)':
			docType = 'Dept. of the Air Force';
			break;
		case 'Army':
			docType = 'US Army';
			break;
		case 'Navy':
			docType = 'US Navy';
			break;
		case 'The Joint Staff (TJS)':
			docType = 'Joint Chiefs of Staff';
			break;
		case 'United States Special Operations Command (SOCOM)':
			docType = 'US Army';
			break;
		case 'US Marine Corp (USMC)':
			docType = 'US Marine Corps';
			break;
		default:
			//console.log(docType)
			docType = 'Dept. of Defense';
			break;
	}

	const docOrgColor = orgColorMap[docType] ?? '#964B00'; // brown

	return { docTypeColor, docOrgColor };
};

export const getConvertedName = (orgName) => {

	switch (orgName) {
		case 'United States Special Operations Command (SOCOM)':
			orgName = 'USSOCOM';
			break;
		default:
			break;
	}

	return orgName;
};

export const getConvertedType = (budgetType) => {

	switch (budgetType) {
		case 'pdoc':
			budgetType = 'Procurement';
			break;
		case 'odoc':
			budgetType = 'O&M';
			break;
		case 'rdoc':
			budgetType = 'RDT&E';
			break;
		default:
			break;
	}

	return budgetType;
};

export const processSearchSettings = (state, dispatch) => {
	const searchSettings = _.cloneDeep(state.jbookSearchSettings);

	for (const optionType in state.defaultOptions) {
		// if (optionType === 'reviewStatus') continue;

		if (state.defaultOptions[optionType] && searchSettings[optionType] && state.defaultOptions[optionType].length === searchSettings[optionType].length) {
			delete searchSettings[optionType];
		}
	}

	for (const setting in searchSettings) {
		if (!searchSettings[setting]) {
			delete searchSettings[setting];
		}
	}

	return searchSettings;
};


