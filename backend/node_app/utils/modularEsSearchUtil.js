const ModularEsSearchUtil = function ModularEsSearchUtil(){};

ModularEsSearchUtil.prototype.createBasicEsQuery = function(opts) {
	const {
		searchText,
		offset,
		limit
	} = opts;
	return 'fake';
}

const modularEsSearchUtil = new ModularEsSearchUtil();

module.exports = modularEsSearchUtil;