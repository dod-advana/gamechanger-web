const { SearchController } = require('../searchController');
const { ORGFILTER, getOrgOptions, getOrgToDocQuery } = require('../../utils/routeUtility');
const LOGGER = require('../../lib/logger');

/**
 * @class ExternalSearchController
 */
class ExternalSearchController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			search = new SearchController(opts)
		} = opts;
		this.searchController = search;
		this.logger = logger;
	}

	/**
	 * This is just a helper method to format the orgFilter for documentSearchHelper
	 * @method createOrgFilter
	 * @param {String} filter - a string of orgs separated by _
	 * @returns orgFilter, orgFilterQuery
	 */
	createOrgFilter(filter){
		if (!filter){
			return {orgFilter: {}, orgFilterQuery: '*'};
		}
		const orgFilter = Object.assign({}, ORGFILTER);
		const filterArray = filter ? filter.split('_') : getOrgOptions().split('_');
		// Use the list of orgs to set the filter
		for (let org of filterArray){
			if (org in orgFilter){
				orgFilter[org] = true;
			}
		}
		// Use the orgFilter for the org query
		const orgFilterQuery = getOrgToDocQuery(orgFilter);
		return {orgFilter, orgFilterQuery};
	}

	/**
	 * @method externalSearch
	 * @param {String} searchType - Whether the search is Intelligent or Keyword
	 * @param {Object} req - The general request containing body and query
	 * @param {String} req.query.search - string that is to be searched
	 * @param {String} req.query.orgFilter - string of orgs separated by _.
	 * @param {int} [req.query.offset=0] - optional to start at a different point in the results
	 * @param {int} [req.query.limit=20] - optional number of results to request at a time
	 *
	 * @param {Object} res - The response to reurn with object and status code
	 */
	async externalSearch(searchType, req, res){
		let userId = 'API';
		searchType = (searchType === 'Intelligent') ? searchType : 'Keyword';
		try {
			if (!req.query || !req.query.search || req.query.search === '') {
				return res.status(400).send('Missing search');
			} else {
				userId = req.get('SSL_CLIENT_S_DN_CN');
				// Format filter from query
				const {orgFilter, orgFilterQuery} = this.createOrgFilter(req.query.orgFilter);
				const body = {
					searchText: req.query.search,
					searchType,
					orgFilter,
					orgFilterQuery,
					tiny_url: 'gamechanger?tiny=4',
					offset: req.query.offset ? parseInt(req.query.offset) : 0,
					limit: req.query.limit ? parseInt(req.query.limit) : 20
				};
				const result = await this.searchController.documentSearchHelper({...req, body}, userId);
				return res.status(200).send(result);
			}
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'DP7GSEH', userId);
			return res.status(500).send();
		}
	}
}

module.exports.ExternalSearchController = ExternalSearchController;
