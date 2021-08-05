const parse = (input) => {
	let result = addWildcardsToSingleWords(input);

	result = addWilcardToLastWord(result);
	result = replaceNots(result);
	result = replaceExactSearch(result);

	return `${result} ${input}`;
};

const replaceExactSearch = (input) => {
	let hasQuotedWordsRegex = new RegExp(/"[^"]*"/, 'gus');

	if (!hasQuotedWordsRegex.test(input))
		return input;

	let [match] = input.match(hasQuotedWordsRegex);
	match = match.replace(/(\b\w+\b)/g, '+$&');
	match = match.replace(/\"/g, '');

	return input.replace(hasQuotedWordsRegex, match);
};


const replaceNots = (input) => {
	return input.replace(/\!/g, '-');
};

const addWildcardsToSingleWords = (input) => {
	let hasOneWordRegex = new RegExp(/^\w+$/);

	if (!hasOneWordRegex.test(input))
		return input;

	return '*' + input + '*';
};

const addWilcardToLastWord = (input) => {
	let endWithQuoteRegex = new RegExp(/(\"|\*)$/);
	let lastWordHasSpecialCharRegex = new RegExp(/((\+|-|\!)\b\w+)$/);

	if (endWithQuoteRegex.test(input) || lastWordHasSpecialCharRegex.test(input))
		return input;


	return input + '*';
};



module.exports = {
	parse
};