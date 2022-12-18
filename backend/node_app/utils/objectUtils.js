function sortByValueDescending(obj) {
	return Object.entries(obj)
		.sort(([, a], [, b]) => b - a)
		.reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
}

module.exports = {
	sortByValueDescending,
};
