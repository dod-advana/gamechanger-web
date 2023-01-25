const { ModularGameChangerController } = require('../modularGameChangerController');
const { DataLibrary } = require('../../lib/dataLibrary');
const { ORGFILTER, getOrgOptions, getOrgToDocQuery } = require('../../utils/routeUtility');
const LOGGER = require('@dod-advana/advana-logger');

/**
 * @class ExternalSearchController
 */
class ExternalSearchController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			search = new ModularGameChangerController(opts),
			dataLibrary = new DataLibrary(opts),
		} = opts;
		this.searchController = search;
		this.dataLibrary = dataLibrary;
		this.logger = logger;
	}

	/**
	 * This is just a helper method to format the orgFilter for documentSearchHelper
	 * @method createOrgFilter
	 * @param {String} filter - a string of orgs separated by _
	 * @returns orgFilter, orgFilterQuery
	 */
	createOrgFilter(filter) {
		if (!filter) {
			return { orgFilter: {}, orgFilterQuery: '*' };
		}
		const orgFilter = Object.assign({}, ORGFILTER);
		const filterArray = filter ? filter.split('_') : getOrgOptions().split('_');
		// Use the list of orgs to set the filter
		for (let org of filterArray) {
			if (org in orgFilter) {
				orgFilter[org] = true;
			}
		}
		// Use the orgFilter for the org query
		const orgFilterQuery = getOrgToDocQuery(orgFilter);
		return { orgFilter, orgFilterQuery };
	}

	async externalSearch(req, res) {
		let userId = 'API';
		try {
			if (!req.query || !req.query.search || req.query.search === '') {
				return res.status(400).send('Missing search');
			} else {
				userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');
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
				if (req.query.publicationDateFilterStart) {
					publicationDateFilterStart = new Date(req.query.publicationDateFilterStart);
					publicationDateAllTime = false;
				}
				if (req.query.publicationDateFilterEnd) {
					publicationDateFilterEnd = new Date(req.query.publicationDateFilterEnd);
					publicationDateAllTime = false;
				}
				if (publicationDateFilterStart instanceof Date && !isNaN(publicationDateFilterStart))
					publicationDateFilter[0] = req.query.publicationDateFilterStart;
				if (publicationDateFilterEnd instanceof Date && !isNaN(publicationDateFilterEnd))
					publicationDateFilter[1] = req.query.publicationDateFilterEnd;

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
					},
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

	/**
	 * Gets metadata for all docs according to fields specified when building
	 * this endpoint for Enterprise search.
	 * We know we've hit end of results when hits.length is less than 10000,
	 * though we've also surfaced total hits just in case.
	 * @param {string} cloneName must line up with API key permissions
	 * @param {string | undefined} searchAfterID single value from 'sort' array in
	 *   last elem of 'hits' from prev search | undefined for first page of results
	 * @returns {esHits}
	 *
	 * @typedef {Object} esHits
	 * @property {Object} total holds total number of results
	 * @property {Array<Hit>} hits holds results
	 *
	 * @typedef {Object} Hit
	 * @property {Object} fields holds key-value pairs
	 * @property {Array<string>} sort holds document ID; pass last ID to search_after
	 *   of next call to getGCDocsMetadata to paginate
	 */
	async getGCDocsMetadata(req, res) {
		let userId = 'API';
		try {
			userId = req.session?.user?.id || req.get('SSL_CLIENT_S_DN_CN');

			const esQuery = {
				_source: false,
				stored_fields: [
					'filename',
					'title',
					'page_count',
					'doc_type',
					'doc_num',
					'ref_list',
					'keyw_5',
					'type',
					'display_title_s',
					'display_org_s',
					'display_source_s',
					'is_revoked_b',
					'publication_date_dt',
					'download_url_s',
					'source_fqdn_s',
					'source_title_s',
					'top_entities_t',
				],
				track_total_hits: true,
				size: 10000,
				query: {
					match_all: {},
				},
				sort: [
					{
						_id: 'asc',
					},
				],
			};

			if (req.query?.searchAfterID) {
				esQuery.search_after = [req.query.searchAfterID];
			}

			const esClientName = 'gamechanger';
			const esIndex = 'gamechanger';
			let esResults = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, esQuery, userId);
			esResults = esResults.body.hits;

			return res.status(200).send(esResults);
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'METAERR', userId);
			return res.status(500).send();
		}
	}
}

module.exports.ExternalSearchController = ExternalSearchController;
