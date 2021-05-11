const { DataLibrary} = require('../../lib/dataLibrary');
const ExportHandler = require('../base/exportHandler');

class EdaExportHandler extends ExportHandler {
	constructor(opts={}) {
		super();

		this.dataApi = new DataLibrary(opts);
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
			
			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms(req.body, userId);
			const permissions = req.permissions ? req.permissions : [];
			req.body.searchTerms = searchTerms;
			req.body.parsedQuery = parsedQuery;

			let searchResults;
			try {
				// Using getESClient check to enable eda export. Verify whether permissible
				if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')){
					esClientName = 'eda';
					esIndex = this.constants.EDA_ELASTIC_SEARCH_OPTS.index;
				} else {
					throw 'Unauthorized';
				}
				const {extSearchFields = [], extRetrieveFields = [] } = this.constants.EDA_ELASTIC_SEARCH_OPTS;

				req.body.extSearchFields = extSearchFields.map((field) => field.toLowerCase());
				req.body.extStoredFields = extRetrieveFields.map((field) => field.toLowerCase());
				const esQuery = this.searchUtility.getElasticsearchPagesQuery(req.body, userId);

				const results = await this.dataApi.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery);

				if (results && results.body && results.body.hits && results.body.hits.total && results.body.hits.total.value && results.body.hits.total.value > 0) {
					searchResults = this.searchUtility.cleanUpEsResults(results, searchTerms, userId, selectedDocuments, expansionDict, clientObj.esIndex);
				} else {
					this.logger.error('Error with Elasticsearch download results', 'T5GRJ4Lzdf', userId);
					searchResults = { totalCount: 0, docs: [] };
				}
			} catch (e) {
				this.logger.error(`Error sentence transforming document search results ${e.message}`, 'L0V3LYT', userId);
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
				this.logger.error(err.message, '2DZD8ID', userId);
				res.status(500).send(err);
			}

		} catch (err) {
			this.logger.error(err.message, 'NAL6LTU', userId);
			res.status(500).send(err);
		}
	}

}

module.exports = new EdaExportHandler();