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
		const newStr = name.replace(/[0-9]/g, '').replace(/\./g, ' ').toLowerCase().trim();
		return capitalizeWords(newStr);
	} catch (err) {
		console.warn('Error occurred in parseOwnerName');
		console.warn(err);
		return name;
	}
};
