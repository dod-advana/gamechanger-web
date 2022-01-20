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

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const {
				cloneData = {},
			} = req.body;

			let cloneNameSql = {clone_name: cloneData.clone_name};

			let exclusionSql = {search: {$and: [
				{$notLike: '%artificial intelligence%'},
				{$notLike: '%pizza%'},
				{$notLike: 'pizza'},
				{$notLike: '%cyber%'},
				{$notLike: '%military intelligence program%'},
				{$notLike: '%"artificial intelligence" and president%'},
				{$notLike: '%machine learning%'},
			]}, run_at: {
				$gte: sequelize.literal('NOW() - INTERVAL \'7d\''),
			} };

			const trending = await this.gcHistory.findAll({
				attributes: [
					sequelize.literal('trim(lower(search)) as cleaned_search, count(*) as val')
				],
				where: exclusionSql, cloneNameSql,
				group: ['cleaned_search'],
				order: [
					[sequelize.literal('val'), 'DESC']
				],
				limit: 10,
				raw: true
			});
			res.status(200).send(trending);
		} catch (err) {
			this.logger.error(err, '5ED9CQB', userId);
			res.status(500).send(err);
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

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			let results = await this.searchUtility.getSearchCount(userId=userId)
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, 'RZ18OVI', userId);
			res.status(500).send(err);
		}
	}
	async getWeeklySearchCount_(req, res) {
		let userId = 'Unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			console.log("hello")
			const { trendingLinks=[] } = req.body;
			const results = await new Promise((resolve, reject) => {
				const counts = [];
				trendingLinks.forEach(async ({search}) => {
					counts.push(this.gcHistory.count({
						where:{
							search,
							run_at: {
								[Op.gte]: sequelize.literal('NOW() - INTERVAL \'14d\''),
							}
						}
					}));
				})
				console.log(trendingLinks)
				Promise.all(counts).then(values => {
					const trendingLinksWithCount = trendingLinks.map((trending,idx) => {return {...trending, count:values[idx]}})
					resolve(trendingLinksWithCount);
				}).catch(e=>reject(e));
			});
			console.log(results)
			res.status(200).send(results);
		} catch (err) {
			this.logger.error(err, 'RZ18OVI', userId);
			res.status(500).send(err);
		}
	}
}

module.exports.TrendingSearchesController = TrendingSearchesController;
