const { ModularGameChangerController } = require('../modularGameChangerController');
const { ORGFILTER, getOrgOptions, getOrgToDocQuery } = require('../../utils/routeUtility');
const LOGGER = require('../../lib/logger');

/**
 * @class ExternalSearchController
 */
class ExternalSearchController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			search = new ModularGameChangerController(opts)
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


	async externalSearch(req, res){
		let userId = 'API';
		try {
			if (!req.query || !req.query.search || req.query.search === '') {
				return res.status(400).send('Missing search');
			} else {
				userId = req.get('SSL_CLIENT_S_DN_CN');
				let orgFilterString = req.query.orgFilter || [];
				let typeFilterString = req.query.typeFilter || [];
				if (typeof orgFilterString === 'string') {
					orgFilterString = req.query.orgFilter ? [req.query.orgFilter] : [];
				}
				if (typeof typeFilterString === 'string') {
					typeFilterString = req.query.typeFilter ? [req.query.typeFilter] : [];
				}

				let publicationDateFilterStart;
				let publicationDateFilterEnd;
				let publicationDateAllTime = true;
				const publicationDateFilter = [null, null];
				if(req.query.publicationDateFilterStart) {
					publicationDateFilterStart = new Date(req.query.publicationDateFilterStart);
					publicationDateAllTime = false;
				}
				if(req.query.publicationDateFilterEnd) {
					publicationDateFilterEnd = new Date(req.query.publicationDateFilterEnd);
					publicationDateAllTime = false;
				}
				if(publicationDateFilterStart instanceof Date && !isNaN(publicationDateFilterStart)) publicationDateFilter[0] = req.query.publicationDateFilterStart;
				if(publicationDateFilterEnd instanceof Date && !isNaN(publicationDateFilterEnd)) publicationDateFilter[1] = req.query.publicationDateFilterEnd;

				// Format filter from query
				const body = {
					searchText: req.query.search,
					cloneName: req.query.cloneName,
					offset: req.query.offset ? parseInt(req.query.offset) : 0,
					limit: req.query.limit ? parseInt(req.query.limit) : 20,
					options: {
						searchType: 'keyword',
						orgFilter: {},
						typeFilter: {},
						orgFilterString: orgFilterString,
						typeFilterString: typeFilterString,
						publicationDateFilter,
						publicationDateAllTime,
						tiny_url: 'gamechanger?tiny=4',
					}
				};
				req.body = body;
				await this.searchController.search(req, res);
			}
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'DP7GSEH', userId);
			return res.status(500).send();
		}
	}
}

module.exports.ExternalSearchController = ExternalSearchController;