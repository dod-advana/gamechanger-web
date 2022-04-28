const _ = require('underscore');
const https = require('https');
const fs = require('fs');
const constants = require('../config/constants');
const asyncRedisLib = require('async-redis');

// config helper
const getDataCatalogSettings = async () => {
	const redisAsyncClient = asyncRedisLib.createClient(process.env.REDIS_URL || 'redis://localhost');
	await redisAsyncClient.select(13);
	const dcSettings = await redisAsyncClient.get('dataCatalogSettings');
	if (dcSettings) {
		return JSON.parse(dcSettings);
	} else {
		return {};
	}
};

function getCollibraUrl() {
	const url =
		constants.DATA_CATALOG_OPTS.host +
		(constants.DATA_CATALOG_OPTS.port ? `:${constants.DATA_CATALOG_OPTS.port}` : '');
	return `${constants.DATA_CATALOG_OPTS.protocol}://${url}${constants.DATA_CATALOG_OPTS.core_rest_path}`;
}

function getAuthConfig() {
	let authConfig = {};
	if (constants.DATA_CATALOG_OPTS.protocol === 'https') {
		authConfig.httpsAgent = new https.Agent({
			rejectUnauthorized: false,
			keepAlive: true,
			ca: constants.DATA_CATALOG_OPTS.ca,
		});
	}

	authConfig.auth = {
		username: constants.DATA_CATALOG_OPTS.username,
		password: constants.DATA_CATALOG_OPTS.password,
	};
	return authConfig;
}

function getAPIConfig() {
	return constants.DATA_CATALOG_OPTS.api_config;
}

// data format helpers

// srcData -> [{ newField: value }, .., { newField: value }]
function getListOfField(srcData, srcField, newField) {
	let names = [];
	if (srcData && srcData.total > 0) {
		names = _.map(srcData.results, (item) => {
			let tmp = {};
			tmp[newField] = item[srcField];
			return tmp;
		});

		return names;
	} else {
		return [];
	}
}

const generateAcronymSearchInFields = (acronymAttributeId, datasourceAssetId) => {
	return [
		{
			resourceType: 'Asset',
			fields: [`StringAttribute:${acronymAttributeId}`, `Asset:${datasourceAssetId}`],
		},
	];
};

const cleanSearchText = (text) => {
	if (text.includes(`"`)) return text;
	else return `${text}*`;
};

const getSearchTypeId = async (searchType) => {
	const dcSettings = await getDataCatalogSettings();
	if (!searchType) {
		return null;
	} else if (dcSettings.assetTypes && dcSettings.assetTypes[searchType]) {
		return [dcSettings.assetTypes[searchType]];
	} else if (dcSettings.assetTypes) {
		return _.toArray(dcSettings.assetTypes.assetTypes);
	} else {
		return null;
	}
};

const getQueryableStatuses = async () => {
	const dcSettings = await getDataCatalogSettings();
	return dcSettings.queryableStatuses;
};

module.exports = {
	getCollibraUrl,
	getAuthConfig,
	getAPIConfig,
	getQueryableStatuses,
	getListOfField,
	generateAcronymSearchInFields,
	cleanSearchText,
	getSearchTypeId,
};
