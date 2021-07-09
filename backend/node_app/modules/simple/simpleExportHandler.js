const { MLApiClient } = require('../../lib/mlApiClient');
const ExportHandler = require('../base/exportHandler');

class SimpleExportHandler extends ExportHandler {
	constructor(opts={}) {
		const {
			mlApi = new MLApiClient(opts),
		} = opts;
    super();

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
				...rest
			} = req.body;

			const clientObj = { esClientName: 'gamechanger', esIndex: 'gamechanger'}
			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms(req.body, userId);
			req.body.searchTerms = searchTerms;
			req.body.parsedQuery = parsedQuery;
			let searchResults;
			try {
				searchResults = await this.searchUtility.documentSearch(req, {...req.body, expansionDict, operator: 'and'}, clientObj, userId);
				searchResults.classificationMarking = req.body.classificationMarking;
			} catch (e) {
				this.logger.error(`Error sentence transforming document search results ${e.message}`, 'GPLMHKA', userId);
				throw e;
			}

			try {
				const { docs } = searchResults;
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
				this.logger.error(err.message, '9HQ0878', userId);
				res.status(500).send(err);
			}

		} catch (err) {
			this.logger.error(err.message, '61ODZD4', userId);
			res.status(500).send(err);
		}
	}

}

module.exports = SimpleExportHandler;