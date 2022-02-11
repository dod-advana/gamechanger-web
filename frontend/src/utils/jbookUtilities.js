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
}

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
}

export const getSearchTerms = (searchText) => {
	return getQueryAndSearchTerms(searchText);
}

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
}

const findQuoted = (searchText) => {
	// finds quoted phrases separated by and/or and allows nested quotes of another kind eg "there's an apostrophe"
	return searchText.match(/(?!\s*(and|or))(?<words>(?<quote>'|").*?\k<quote>)/g) || [];
}

const findLowerCaseWordsOrAcronyms = (searchText) => {
	// finds lower case words, acronyms with . and with digits eg c2 or a.i.
	return searchText.match(/\b([a-z\d.])+(\b|)/g) || [];
}

const convertPhraseToSequence = (phrase) => {
	// force double quotes then
	// let json parser escape nested quotes
	// and then read back
	return JSON.parse(JSON.stringify(`"${phrase.slice(1, -1)}"`));
}


