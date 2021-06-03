const { MLApiClient } = require('../../lib/mlApiClient');
const ExportHandler = require('../base/exportHandler');
const _ = require('lodash');

class PolicyExportHandler extends ExportHandler {
	constructor(opts={}) {
		super();

		this.mlApi = new MLApiClient(opts);
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
				sort, 
				order,
				...rest
			} = req.body;

			const clientObj = { esClientName: 'gamechanger', esIndex: 'gamechanger'}
			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms(req.body, userId);
			req.body.searchTerms = searchTerms;
			req.body.parsedQuery = parsedQuery;

			let searchResults;
			try {
				const noFilters = _.isEqual(searchFields, { initial: { field: null, input: '' } });
				const noSourceSpecified = _.isEqual({}, orgFilter);
				const noTypeSpecified = _.isEqual({}, typeFilter);
				const noPubDateSpecified = req.body.publicationDateAllTime;
				let combinedSearch = await this.appSettings.findAll({ attributes: ['value'], where: { key: 'combined_search'} });
				if (combinedSearch.length > 0){
					combinedSearch = combinedSearch[0].dataValues.value === 'true';
				}
				if (combinedSearch && noFilters && noSourceSpecified && noTypeSpecified && noPubDateSpecified){
					try {
						searchResults = await this.searchUtility.combinedSearchHandler(searchText, userId, req, expansionDict, index, operator, offset);
					} catch (e) {
						this.logger.error(`Error sentence transforming document search results ${e.message}`, 'ZSXYML3', userId);
						const { message } = e;
						this.logger.error(message, 'JN18ILV', userId);
						throw e;
					}
				} else {
					searchResults = await this.searchUtility.documentSearch(req, {...req.body, expansionDict, operator: 'and'}, clientObj, userId);
				}
			} catch (e) {
				this.logger.error(`Error sentence transforming document search results ${e.message}`, 'L0V3LYT', userId);
				throw e;
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
						const pdfBase64String = buffer.toString('base64');
						res.contentType('application/pdf');
						res.status(200);
						res.send(pdfBase64String);
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

}

module.exports = PolicyExportHandler;