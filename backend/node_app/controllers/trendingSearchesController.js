const GC_HISTORY = require('../models').gc_history;
const GC_TRENDING_BLACKLIST = require('../models').gc_trending_blacklist;
const LOGGER = require('../lib/logger');
const SearchUtility = require('../utils/searchUtility');
const sequelize = require('sequelize');
const Op = sequelize.Op;

class TrendingSearchesController {

	constructor(opts = {}) {
		const {
			logger = LOGGER,
			gcHistory = GC_HISTORY,
			gcTrendingBlacklist = GC_TRENDING_BLACKLIST,
			searchUtility = new SearchUtility(opts),


		} = opts;

		this.logger = logger;
		this.gcHistory = gcHistory;
		this.gcTrendingBlacklist = gcTrendingBlacklist;
		this.searchUtility = searchUtility;

		this.trendingSearchesPOST = this.trendingSearchesPOST.bind(this);
		this.getTrendingBlacklist = this.getTrendingBlacklist.bind(this); 
		this.setTrendingBlacklist = this.setTrendingBlacklist.bind(this);
		this.deleteTrendingBlacklist = this.deleteTrendingBlacklist.bind(this);
		this.getWeeklySearchCount = this.getWeeklySearchCount.bind(this);
		
	}

	async trendingSearchesPOST(req, res) {
		let userId = 'Unknown';
		let trending = [];

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const {
				cloneData = {},
				daysBack,
			} = req.body;
			const blacklist = [];
			try{
				const blacklistItems = await this.gcTrendingBlacklist.findAll({
					attributes: [
						sequelize.literal('search_text, added_by, \"updatedAt\"')
					],
					order: [
						[sequelize.literal('\"updatedAt\"'), 'DESC']
					],
					raw: true
				});
				for (let items of blacklistItems) {
					blacklist.push(items['search_text'])
				 }
			} catch (err) {
				this.logger.error(err, '5ED1092')
			}

			trending = await this.searchUtility.getSearchCount(daysBack, blacklist, userId)
			res.status(200).send(trending);
		} catch (err) {
			this.logger.error(err, '5ED9CQB', userId);
			res.status(500).send(trending);
			return err;
		}
	}


	async getTrendingBlacklist(req, res) {
		let userId = 'Unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const blacklist = await this.gcTrendingBlacklist.findAll({
				attributes: [
					sequelize.literal('search_text, added_by, \"updatedAt\"')
				],
				order: [
					[sequelize.literal('\"updatedAt\"'), 'DESC']
				],
				raw: true
			});
			res.status(200).send(blacklist);
		} catch (err) {
			this.logger.error(err, '5ED9CQC', userId);
			res.status(500).send(err);
			return err;
		}
	}

	async setTrendingBlacklist(req, res) {
		let userId = 'Unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const {
				createEntry = 'test'
			} = req.body;

			const blacklist = await this.gcTrendingBlacklist.findOrCreate({
				where: {
					search_text: createEntry,
					added_by: userId
				},
				default: {
					search_text: createEntry,
					added_by: userId
				}
			});
			res.status(200).send(blacklist);
		} catch (err) {
			this.logger.error(err, '5ED9CQD', userId);
			res.status(500).send(err);
			return err;
		}
	}

	async deleteTrendingBlacklist(req, res) {
		let userId = 'Unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const {
				searchText = 'test'
			} = req.body;

			const deleted = this.gcTrendingBlacklist.destroy({
				where: {
					search_text: searchText
				}
			});

			res.status(200).send(deleted);
		} catch (err) {
			this.logger.error(err, '5ED9CQE', userId);
			res.status(500).send(err);
			return err;
		}
	}
	async getWeeklySearchCount(req, res) {
		let userId = 'Unknown';
		const daysBack = 14;
		let results = []
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			results = await this.searchUtility.getSearchCount(daysBack, userId)
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, 'RZ18OVI', userId);
			res.status(500).send(results);
		}
	}
	
}

module.exports.TrendingSearchesController = TrendingSearchesController;
