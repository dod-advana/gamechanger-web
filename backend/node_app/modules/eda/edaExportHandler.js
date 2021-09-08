const { DataLibrary} = require('../../lib/dataLibrary');
const ExportHandler = require('../base/exportHandler');
const CONSTANTS = require('../../config/constants');
const SearchUtility = require('../../utils/searchUtility');
const EDASearchUtility = require('./edaSearchUtility');
const csvStringifyLib = require('csv-stringify');


class EdaExportHandler extends ExportHandler {
	constructor(opts={}) {
		const {
			dataLibrary = new DataLibrary(opts),
			csvStringify = csvStringifyLib,
			searchUtility = new SearchUtility(opts),
			edaSearchUtility = new EDASearchUtility(opts),
			constants = CONSTANTS
		} = opts;
		super({...opts});
		this.dataLibrary = dataLibrary;
		this.csvStringify = csvStringify;
		this.searchUtility = searchUtility;
		this.edaSearchUtility = edaSearchUtility;
		this.constants = constants;
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
		
			const clientObj = {};
			const [parsedQuery, searchTerms] = this.searchUtility.getEsSearchTerms(req.body, userId);
			const permissions = req.permissions ? req.permissions : [];
			req.body.searchTerms = searchTerms;
			req.body.parsedQuery = parsedQuery;

			let searchResults;
			try {

				// Using getESClient check to enable eda export. Verify whether permissible
				if (permissions.includes('View EDA') || permissions.includes('Webapp Super Admin')){
					clientObj.esClientName = 'eda';
					clientObj.esIndex = this.constants.EDA_ELASTIC_SEARCH_OPTS.index;
				} else {
					throw 'Unauthorized';
				}
				const {extSearchFields = [], extRetrieveFields = [] } = this.constants.EDA_ELASTIC_SEARCH_OPTS;

				req.body.extSearchFields = extSearchFields.map((field) => field.toLowerCase());
				req.body.extStoredFields = extRetrieveFields.map((field) => field.toLowerCase());
				
				const esQuery = this.edaSearchUtility.getElasticsearchPagesQuery(req.body, userId);
				const results = await this.dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery);
				
				if (results && results.body && results.body.hits && results.body.hits.total && results.body.hits.total.value && results.body.hits.total.value > 0) {
					searchResults = this.edaSearchUtility.cleanUpEsResults(results, searchTerms, userId, [], expansionDict, clientObj.esIndex);
					const filenames = searchResults.docs.map((a) => a.filename)
					
					const tables = ['"pds_parsed"."line_item_details"']
					const columns = ['filename','prod_or_svc_des', 'buying_currency']
			
					const pgResults = await this.dataLibrary.queryLineItemPostgres(columns, tables, filenames);

					for (const result of searchResults.docs) {
						if (result.filename) {
							result.line_items = pgResults.filter(lineItem => lineItem.pdf_filename === result.filename);
						}
					}
				} else {
					this.logger.error('Error with Elasticsearch download results', 'T5GRJ4Lzdf', userId);
					searchResults = { totalCount: 0, docs: [] };
				}
			} catch (e) {
				this.logger.error(`Error sentence transforming document search results ${e.message}`, '3MP4JCA', userId);
				throw e;
			}

			try {
				const { docs } = searchResults;

				// if (historyId) {
				// 	await this.exportHistory.updateExportHistoryDate(res, historyId, userId);
				// } else {
				// 	await this.exportHistory.storeExportHistory(res, req.body, {
				// 		totalCount: docs.length,
				// 		searchTerms
				// 	}, userId);
				// }



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
					const csvStream = this.createCsvStream(searchResults, userId);
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
	
	createCsvStream(data, userId) {
		try {
			const stringifier = this.csvStringify({ delimiter: ',' });

			stringifier.on('error', (err) => {
				this.logger.error(e.message, 'P9KP9BX', userId);
				throw new Error(err);
			})

			this.writeCsvData(stringifier, data);

			stringifier.end();
			return stringifier;

		} catch (e) {
			this.logger.error(e.message, '9WZWAAR', userId);
			throw e;
		}
	}

	writeCsvData(stringifier, data) {

		if(data && data.docs && data.docs.length > 0){
			const header = ['Filename', 'Contract Number', 'Page Count', 'Issuing Organization', '', '', 'CLINS', 'Prod or Svc', 'Description', 'Base', 'Type', 'Obligated Amount', 'Obligated Amount CIN', 'Row ID'];
			stringifier.write(header);

			data.docs.forEach((doc) => {
				const item = [doc.filename, this.getDisplayTitle(doc), doc.page_count, doc.issuing_organization_eda_ext];
				stringifier.write(item);

				for (const item of doc.line_items) {
					const line_item = ['', '', '', '', '', '', '', item.prod_or_svc, item.prod_or_svc_desc, item.li_base, item.li_type, item.obligated_amount, item.obligated_amount_cin, item.row_id];					
					stringifier.write(line_item);	
				}

			});
		}
	}

	getDisplayTitle (item) {
		if (item.title && item.title !== 'NA') {
			return item.title.replace(/-empty/g, '');
		}
		else {
			try {
				const rootfile = item.filename.substr(item.filename.lastIndexOf("/")+1)
				const pieces = rootfile.split('-');
				const first = pieces[7];
				if (first === 'empty' || !first) {
					throw new Error('parsing failed')
				}
				const second = pieces[8] === 'empty' ? '' : `-${pieces[8]}`;
				const mod = pieces[9] === 'empty' ? '' : `-${pieces[9]}`;
				const mod2 = pieces[10] === 'empty' ? '' : `-${pieces[10]}`;
	
				return `${first}${second}${mod}${mod2}`;
			} catch (e) {
				return `${item.filename.substr(item.filename.lastIndexOf("/")+1) ? 'Not Available' : ''}`
			}
		}
	};

}

module.exports = EdaExportHandler;
