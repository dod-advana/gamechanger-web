const LOGGER = require('../lib/logger');
const SearchUtility = require('../utils/searchUtility');
const { DataLibrary} = require('../lib/dataLibrary');
const { MLApiClient } = require('../lib/mlApiClient');

class AnalystToolsController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			searchUtility = new SearchUtility(opts),
			dataLibrary = new DataLibrary(opts),
			mlApi = new MLApiClient(opts),
		} = opts;

		this.logger = logger;
		this.searchUtility = searchUtility;
		this.dataLibrary = dataLibrary;
		this.mlApi = mlApi;

		this.compareDocument = this.compareDocument.bind(this)
	}


	async compareDocument(req,res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			
			const { cloneName, paragraphs = [] } = req.body;
			const permissions = req.permissions ? req.permissions : [];
			
			// ML API Call Goes Here
			const paragraphSearches = paragraphs.map((paragraph, id) => this.mlApi.getSentenceTransformerResultsForCompare(paragraph, userId, id));
			const paragraphResults = await Promise.all(paragraphSearches);
			
			const resultsObject = {};
			
			paragraphResults.forEach(result => {
				Object.keys(result).forEach(id => {
					resultsObject[result[id].id] = {
						score: result[id].score,
						text: result[id].text,
						paragraphIdBeingMatched: result.paragraphIdBeingMatched
					};
				});
			});
			
			const ids = Object.keys(resultsObject);
			
			// Query ES
			const esQuery = this.searchUtility.getDocumentParagraphsByParIDs(ids);
			let clientObj = this.searchUtility.getESClient(cloneName, permissions);
			let esResults = await this.dataLibrary.queryElasticSearch(clientObj.esClientName, clientObj.esIndex, esQuery, userId);
			
			// Aggregate Data
			const returnData = this.searchUtility.cleanUpEsResults(esResults, [], userId, [], {}, null, esQuery, true, resultsObject);
			
			res.status(200).send(returnData);
		} catch(e) {
			this.logger.error(e, '60OOE62', userId);
			res.status(500).send(e);
		}
	}
	
	cleanUpEsResultsForDocumentComparisonTool(raw, paragraphResults,user) {
		try {
			if (!raw.body || !raw.body.hits || !raw.body.hits.total || !raw.body.hits.total.value || raw.body.hits.total.value === 0) {
				return { totalCount: 0, docs: [] };
			}

			let results = {};

			results.totalCount = raw.body.hits.total.value;
			results.docs = [];

			raw.body.hits.hits.forEach((r) => {

				const result = this.searchUtility.transformEsFields(r.fields);
				const doc = {
					doc_id: result.id,
					doc_type: result.doc_type,
					doc_num: result.doc_num,
					display_title_s: result.display_title_s,
					display_org_s: result.display_org_s,
					display_doc_type_s: result.display_doc_type_s,
					ref_list: result.ref_list,
					pagerank_r: result.pagerank_r,
					ref_name: `${result.doc_type} ${result.doc_num}`,
					paragraphs: [],
					topics: Object.keys(r._source.topics_rs)
				};
				r.inner_hits.paragraphs.hits.hits.forEach(paragraph => {
					const entities = [];
					Object.keys(paragraph._source.entities).forEach(entKey => {
						paragraph._source.entities[entKey].forEach(org => {
							entities.push(org);
						})
					})
					
					doc.paragraphs.push({
						id: paragraph._source.id,
						par_raw_text_t: paragraph._source.par_raw_text_t,
						entities: entities,
						score: paragraphResults[paragraph._source.id].score,
						transformTextMatch: paragraphResults[paragraph._source.id].text
					})
				})

				results.docs.push(doc);
			});

			return results;
		} catch (err) {
			this.logger.error(err, 'ZT0UBU2', user);
		}
	}

}

module.exports.AnalystToolsController = AnalystToolsController;
