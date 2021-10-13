const asyncRedisLib = require('async-redis');
const LOGGER = require('../../lib/logger');
const SearchUtility = require('../../utils/searchUtility');
const { getTenDigitUserId } = require('../../utils/userUtility');
const GC_HISTORY = require('../../models').gc_history;
const sparkMD5 = require('spark-md5');

class SearchHandler {
	constructor(opts = {}) {
		const {
			redisClientDB = 1,
			redisDB = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost'),
			gc_history = GC_HISTORY,
			logger = LOGGER,
			searchUtility = new SearchUtility(opts)
		} = opts;
		this.redisClientDB = redisClientDB;
		this.redisDB = redisDB;
		this.gc_history = gc_history;
		this.logger = logger;
		this.searchUtility = searchUtility;
	}

	async search(searchText, offset, limit, options, cloneName, permissions, userId, storeHistory) {
		// Setup the request
		this.logger.info(`${userId} is doing a ${cloneName} search for ${searchText} with offset ${offset}, limit ${limit}, options ${JSON.stringify(options)}`);
		const proxyBody = options;
		proxyBody.searchText = searchText;
		proxyBody.offset = offset;
		proxyBody.limit = limit;
		proxyBody.cloneName = cloneName;

		return await this.searchHelper({body: proxyBody, permissions}, userId, storeHistory);
	}

	async callFunction(functionName, options, cloneName, permissions, userId, res) {
		// Setup the request
		this.logger.info(`${userId} is calling ${functionName} in the ${cloneName} search module with options ${JSON.stringify(options)}`);
		const proxyBody = options;
		proxyBody.functionName = functionName;
		proxyBody.cloneName = cloneName;

		return await this.callFunctionHelper({body: proxyBody, permissions}, userId, res);
	}

	async searchHelper(req, userId, storeHistory) {
		return req.body;
	}

	async callFunctionHelper(req, userId, res) {
		return req.body;
	}

	async getCachedResults(req, historyRec, cloneSpecificObject, userId, storeHistory) {
		try {
			const {
				showTutorial = false,
			} = req.body;

			await this.redisDB.select(this.redisClientDB);

			// ## try to get cached results
			const redisKey = this.searchUtility.createCacheKeyFromOptions({...req.body, cloneSpecificObject});

			// check cache for search (first page only)
			const cachedResults = JSON.parse(await this.redisDB.get(redisKey));
			const timestamp = await this.redisDB.get(redisKey + ':time');
			const timeDiffHours = Math.floor((new Date().getTime() - timestamp) / (1000 * 60 * 60));
			if (cachedResults) {
				const { totalCount } = cachedResults;
				historyRec.endTime = new Date().toISOString();
				historyRec.numResults = totalCount;
				historyRec.cachedResult = true;
				await this.storeRecordOfSearchInPg(historyRec, showTutorial);
				return { ...cachedResults, isCached: true, timeSinceCache: timeDiffHours };
			}

		} catch (e) {
			// don't reject if cache errors just log
			this.logger.error(e.message, 'UA0YFKY', userId);
		}
	}

	async storeCachedResults(req, historyRec, searchResults, cloneSpecificObject, userId) {
		await this.redisDB.select(this.redisClientDB);

		// ## try to get cached results
		const redisKey = this.searchUtility.createCacheKeyFromOptions({...req.body, cloneSpecificObject});

		try {
			const timestamp = new Date().getTime();
			this.logger.info(`Storing new keyword cache entry: ${redisKey}`);
			await this.redisDB.set(redisKey, JSON.stringify(searchResults));
			await this.redisDB.set(redisKey + ':time', timestamp);
			historyRec.cachedResult = false;
		} catch (e) {
			this.logger.error(e.message, 'WVVCLPX', userId);
		}
	}

	async storeRecordOfSearchInPg(historyRec, userId) {
		try {
			const {
				user_id,
				searchText,
				startTime,
				endTime,
				hadError,
				numResults,
				searchType,
				cachedResult,
				orgFilters,
				tiny_url,
				request_body,
				search_version,
				clone_name,
				showTutorial
			} = historyRec;

			const hashed_user = sparkMD5.hash(user_id);
			const new_id = getTenDigitUserId(user_id);
			const new_hashed_user = new_id ? sparkMD5.hash(new_id) : null;

			if (user_id) userId = user_id;

			const obj = {
				user_id: hashed_user,
				new_user_id: new_hashed_user,
				search: searchText,
				run_at: startTime,
				completion_time: endTime,
				had_error: hadError,
				num_results: numResults,
				search_type: searchType,
				cached_result: cachedResult,
				org_filters: orgFilters,
				is_tutorial_search: showTutorial,
				tiny_url: tiny_url,
				clone_name,
				request_body,
				search_version
			};

			this.gc_history.create(obj);

		} catch (err) {
			this.logger.error(err, 'UQ5B8CP', userId);
		}
	}

	getError() {
		return {};
	}
}

module.exports = SearchHandler;
