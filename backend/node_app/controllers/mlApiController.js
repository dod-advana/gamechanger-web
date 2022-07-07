const LOGGER = require('@dod-advana/advana-logger');
const { MLApiClient } = require('../lib/mlApiClient');

class MlApiController {
	constructor(opts = {}) {
		const { mlApi = new MLApiClient(opts), logger = LOGGER } = opts;
		this.logger = logger;
		this.mlApi = mlApi;

		this.requestExpandedSearchTerms = this.requestExpandedSearchTerms.bind(this);
		this.requestQueryExpansion = this.requestQueryExpansion.bind(this);
		this.requestIntelAnswer = this.requestIntelAnswer.bind(this);
		this.requestTextExtractions = this.requestTextExtractions.bind(this);
		this.requestSentenceTransformerResults = this.requestSentenceTransformerResults.bind(this);
		this.requestSentenceTransformerResultsForCompare = this.requestSentenceTransformerResultsForCompare.bind(this);
		this.requestTransformResults = this.requestTransformResults.bind(this);
		this.requestRecommender = this.requestRecommender.bind(this);
	}

	async requestExpandedSearchTerms(req, res) {
		const { termsList, qe_model = undefined, userId = 'unknown' } = req.body;
		try {
			const results = await this.mlApi.getExpandedSearchTerms(termsList, userId, qe_model);
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, userId);
			res.status(500).send(err);
		}
	}

	async requestQueryExpansion(req, res) {
		const { searchText, userId = 'unknown' } = req.body;
		try {
			const results = await this.mlApi.queryExpansion(searchText, userId);
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, userId);
			res.status(500).send(err);
		}
	}

	async requestIntelAnswer(req, res) {
		const { searchQuery, searchContext, userId = 'unknown' } = req.body;
		try {
			const results = await this.mlApi.getIntelAnswer(searchQuery, searchContext, userId);
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, userId);
			res.status(500).send(err);
		}
	}

	async requestTextExtractions(req, res) {
		const { text, extractType, userId = 'unknown' } = req.body;
		try {
			const results = await this.mlApi.getTextExtractions(text, extractType, userId);
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, userId);
			res.status(500).send(err);
		}
	}

	async requestSentenceTransformerResults(req, res) {
		const { searchText, userId = 'unknown' } = req.body;
		try {
			const results = await this.mlApi.getSentenceTransformerResults(searchText, userId);
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, userId);
			res.status(500).send(err);
		}
	}

	async requestSentenceTransformerResultsForCompare(req, res) {
		const { searchText, paragraphIdBeingMatched, userId = 'unknown' } = req.body;
		try {
			const results = await this.mlApi.getSentenceTransformerResultsForCompare(
				searchText,
				paragraphIdBeingMatched,
				userId
			);
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, userId);
			res.status(500).send(err);
		}
	}

	async requestTransformResults(req, res) {
		const { searchText, docs, userId = 'unknown' } = req.body;
		try {
			const results = await this.mlApi.transformResults(searchText, docs, userId);
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, userId);
			res.status(500).send(err);
		}
	}

	async requestRecommender(req, res) {
		const { doc, userId = 'unknown' } = req.body;
		try {
			const results = await this.mlApi.recommender(doc, userId);
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, userId);
			res.status(500).send(err);
		}
	}
}

module.exports.MlApiController = MlApiController;
