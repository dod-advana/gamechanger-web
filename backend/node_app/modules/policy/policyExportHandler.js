const { MLApiClient } = require('../../lib/mlApiClient');
const ExportHandler = require('../base/exportHandler');
const _ = require('lodash');
const constantsFile = require('../../config/constants');
const APP_SETTINGS = require('../../models').app_settings;

class PolicyExportHandler extends ExportHandler {
	constructor(opts={}) {
		const {
			constants = constantsFile,
			app_settings = APP_SETTINGS,
			mlApi = new MLApiClient(opts),
		} = opts;
		super();
		this.app_settings = app_settings;
		this.constants = constants;
		this.mlApi = mlApi;
	}

	async exportHelper(req, res, userId) {
		try {
			const { 
				searchText,
				index,
				format,
				historyId,
				cloneData = {},
				limit = 20,
				searchFields = {},
				expansionDict = {},
				orgFilter,
				typeFilter,
				operator,
				offset,
				selectedDocuments,
				sort = 'Relevance',
				order = 'desc',
				...rest
			} = req.body;
			
			const doubleQuoteCount = (searchText.match(/["]/g) || []).length;
			if(doubleQuoteCount % 2 === 1){
				req.body.searchText = searchText.replace(/["]+/g,"");
			}
			const clientObj = { esClientName: 'gamechanger', esIndex: this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.index}
			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms(req.body, userId);
			req.body.searchTerms = searchTerms;
			req.body.parsedQuery = parsedQuery;

			let searchResults;
			try {
				// intelligent search data
				let intelligentSearchOn = await this.app_settings.findOrCreate({where: { key: 'combined_search'}, defaults: {value: 'true'} });
				intelligentSearchOn = intelligentSearchOn.length > 0 ? intelligentSearchOn[0].dataValues.value === 'true' : false;
				searchResults = await this.searchUtility.documentSearch(req, {...req.body, expansionDict, operator: 'and'}, clientObj, userId);
				if(intelligentSearchOn){ // add intelligent search result if QA empty
					const intelligentSearchResult = await this.intelligentSearch(req, clientObj, userId);
					const intelligentSearchFound = searchResults.docs.findIndex((item) => item.id === intelligentSearchResult.id);
					if(intelligentSearchFound !== -1){ // if found, remove that entry from list
						searchResults.docs.splice(intelligentSearchFound, 1);
											
						// then put intelligent search at front
						searchResults.docs.unshift(intelligentSearchResult);
					}

				}
				searchResults.classificationMarking = req.body.classificationMarking;
			} catch (e) {
				this.logger.error(`Error sentence transforming document search results ${e.message}`, 'L0V3LYT', userId);
				res.status(500).send(err);
			}

			try {
				let { docs } = searchResults;
				let cleanedDocs = [];

				docs.forEach((d) => {
					if (!selectedDocuments || selectedDocuments.length === 0 || (selectedDocuments.indexOf(d.filename) !== -1)) {
						cleanedDocs.push(d);
					}
				});

				docs = cleanedDocs;

				if (historyId) {
					await this.exportHistory.updateExportHistoryDate(res, historyId, userId);
				} else {
					await this.exportHistory.storeExportHistory(res, req.body, {
						totalCount: docs.length,
						searchTerms
					}, userId);
				}

				if (format === 'pdf') {
					const sendDataCallback = (buffer) => {
						try {
							const pdfBase64String = buffer.toString('base64');
							res.contentType('application/pdf');
							res.status(200);
							res.send(pdfBase64String);
						} catch (e) {
							this.logger.error(e.message, 'V6VU5LQ', userId);
						}
					};
					rest.index = index;
					rest.orgFilter = orgFilter;
					this.reports.createPdfBuffer(searchResults, userId, rest, sendDataCallback);
				} else if (format === 'csv') {
					const csvStream = this.reports.createCsvStream(searchResults, userId);
					res.status(200);
					csvStream.pipe(res);
				} else {
					res.end(JSON.stringify(searchResults));
					res.status(200);
				}
			} catch (err) {
				this.logger.error(err.message, 'E7AHKPK', userId);
				res.status(500).send(err);
			}

		} catch (err) {
			this.logger.error(err.message, 'CKCR4JE', userId);
			res.status(500).send(err);
		}
	}

	async intelligentSearch(req, sentenceResults, clientObj, userId){
		const {
			searchText,
			orgFilterString = [],
			typeFilterString = [],
			forCacheReload = false,
			searchFields = {},
			sort = 'Relevance',
			order = 'desc'
		} = req.body;
		let intelligentSearchResult = {};

		// combined search: run if not clone + sort === 'relevance' + flag enabled
		const verbatimSearch = searchText.startsWith('"') && searchText.endsWith('"');
		const noFilters = _.isEqual(searchFields, { initial: { field: null, input: '' } });
		const noSourceSpecified = _.isEqual([], orgFilterString);
		const noTypeSpecified = _.isEqual([], typeFilterString);
		let combinedSearch = await this.app_settings.findOrCreate({where: { key: 'combined_search'}, defaults: {value: 'true'} });
		combinedSearch = combinedSearch.length > 0 ? combinedSearch[0].dataValues.value === 'true' : false;
		if (sort === 'Relevance' && order === 'desc' && noFilters && noSourceSpecified && noTypeSpecified && combinedSearch && !verbatimSearch){
			try {
				// get intelligent search result
				intelligentSearchResult = await this.searchUtility.intelligentSearchHandler(sentenceResults, userId, req, clientObj);
				return intelligentSearchResult;
			} catch (e) {
				if (forCacheReload) {
					throw Error('Cannot transform document search terms in cache reload');
				}
				this.logger.error(`Error sentence transforming document search results ${e.message}`, 'L6SPJU9', userId);
				const { message } = e;
				this.logger.error(message, 'H6XFEIW', userId);
				return intelligentSearchResult;
			}
		}
		return intelligentSearchResult;
	}


}

module.exports = PolicyExportHandler;
