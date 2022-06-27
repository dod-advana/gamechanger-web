const axios = require('axios');
const https = require('https');
const constantsFile = require('../../config/constants');

const { QLIK_URL, QLIK_WS_URL, CA, KEY, CERT, AD_DOMAIN, QLIK_SYS_ACCOUNT } = constantsFile.QLIK_OPTS;

const STREAM_PROD_FILTER = `customProperties.value eq 'Production' and customProperties.definition.name eq 'StreamType'`;
const APP_PROD_FILTER = `stream.customProperties.value eq 'Production' and stream.customProperties.definition.name eq 'StreamType'`;

const QLIK_ES_FIELDS = ['name_s', 'description_t', 'streamName_s'];

const QLIK_ES_MAPPING = {
	created_dt: { newName: 'createdDate' },
	modified_dt: { newName: 'modifiedDate' },
	name_s: { newName: 'name' },
	publishTime_dt: { newName: 'publishTime' },
	published_b: { newName: 'published' },
	tags_n: { newName: 'tags' },
	description_t: { newName: 'description' },
	streamName_s: { newName: 'streamName' },
	fileSize_i: { newName: 'fileSize' },
	lastReloadTime_dt: { newName: 'lastReloadTime' },
	thumbnail_s: { newName: 'thumbnail' },
	dynamicColor_s: { newName: 'dynamicColor' },
};

const getQlikApps = async (userId, logger, getCount = false, getFull = false, params = {}) => {
	try {
		let url = `${QLIK_URL}/qrs/app`;

		if (getCount) {
			url = `${QLIK_URL}/qrs/app/count`;
		} else if (getFull) {
			url = `${QLIK_URL}/qrs/app/full`;
		}

		return await axios.get(url, getRequestConfigs({ filter: APP_PROD_FILTER, ...params }, userId));
	} catch (err) {
		if (!userId)
			// most common error is user wont have a qlik account which we dont need to log on every single search/hub hit
			logger.error(err, 'O799J51', userId);

		return {};
	}
};

const getRequestConfigs = (params = {}, userid = QLIK_SYS_ACCOUNT) => {
	return {
		params: {
			Xrfkey: 1234567890123456,
			...params,
		},
		headers: {
			'content-type': 'application/json',
			'X-Qlik-xrfkey': '1234567890123456',
			'X-Qlik-user': getUserHeader(userid),
		},
		httpsAgent: new https.Agent({
			rejectUnauthorized: false,
			ca: CA,
			key: KEY,
			cert: CERT,
		}),
	};
};

const getUserHeader = (userid = QLIK_SYS_ACCOUNT) => {
	return `UserDirectory=${AD_DOMAIN}; UserId=${userid}`;
};

const getElasticSearchQueryForQlikApps = (
	{ parsedQuery, offset, limit, operator = 'and', searchText },
	userId,
	logger
) => {
	try {
		let query = {
			track_total_hits: true,
			from: offset,
			size: limit,
			query: {
				bool: {
					should: [
						{
							multi_match: {
								query: `${parsedQuery}`,
								fields: QLIK_ES_FIELDS,
								type: 'best_fields',
								operator: `${operator}`,
								fuzziness: 'AUTO',
								analyzer: 'standard',
							},
						},
						{
							match_phrase: {
								name_s: searchText,
							},
						},
					],
				},
			},
			highlight: {
				require_field_match: false,
				fields: {},
				fragmenter: 'simple',
				type: 'unified',
			},
		};

		QLIK_ES_FIELDS.forEach((field) => {
			query.highlight.fields[field] = {};
		});

		return query;
	} catch (e) {
		logger.error(e.message, 'UY5PYLQ', userId);
		return {};
	}
};

const cleanQlikESResults = (esResults, userId, logger) => {
	const searchResults = { totalCount: 0, hits: [], count: 0 };

	try {
		const { body = {} } = esResults;
		const { hits: esHits = {} } = body;
		const {
			hits = [],
			total: { value },
		} = esHits;

		searchResults.totalCount = value;
		searchResults.count = hits.length;

		hits.forEach((hit) => {
			let result = transformEsFields(hit._source);

			result.highlights = [];
			if (hit.highlight) {
				Object.keys(hit.highlight).forEach((hitKey) => {
					result.highlights.push({
						title: QLIK_ES_MAPPING[hitKey].newName,
						fragment: hit.highlight[hitKey][0],
					});
				});
			}

			searchResults.hits.push(result);
		});
	} catch (e) {
		logger.error(e.message, 'Q2THL1B', userId);
	}

	return searchResults;
};

const transformEsFields = (raw) => {
	let result = {};
	const arrayFields = ['tags_n'];

	for (let key in raw) {
		let newKey = key;
		if (Object.keys(QLIK_ES_MAPPING).includes(key)) {
			newKey = QLIK_ES_MAPPING[key].newName;
		}

		if (
			(raw[key] && raw[key][0]) ||
			Number.isInteger(raw[key]) ||
			(typeof raw[key] === 'object' && raw[key] !== null)
		) {
			if (arrayFields.includes(key)) {
				result[newKey] = raw[key];
			} else if (Array.isArray(raw[key])) {
				result[newKey] = raw[key][0];
			} else {
				result[newKey] = raw[key];
			}
		} else {
			result[newKey] = null;
		}
	}
	return result;
};

module.exports = {
	getQlikApps,
	getElasticSearchQueryForQlikApps,
	cleanQlikESResults,
};
