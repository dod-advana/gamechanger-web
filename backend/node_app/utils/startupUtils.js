const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getAuthConfig, getCollibraUrl } = require('./DataCatalogUtils');

const copyConfigToBuild = () => {
	try {
		if (process.env.DISABLE_FRONT_END_CONFIG !== 'true') {
			let result = {};

			for (let envvar in process.env) {
				if (envvar.startsWith('REACT_APP_')) result[envvar] = process.env[envvar];
			}

			fs.writeFileSync(
				path.join(__dirname, '../../build', 'config.js'),
				`window.__env__ = ${JSON.stringify(result)}`
			);
		}
	} catch (err) {
		console.error(err);
		console.error('No env variables created');
	}
};

const storeDataCatalogInfo = async (redisAsyncClient) => {
	let url = getCollibraUrl() + '/assetTypes?offset=0&limit=0&nameMatchMode=ANYWHERE&excludeMeta=true&topLevel=false';
	const assetTypes = {};
	const queryableStatuses = [];

	try {
		let data = await axios.get(url, getAuthConfig());
		if (data.data.results.length > 0) {
			data.data.results.forEach((assetType) => {
				assetTypes[assetType['name']] = assetType['id'];
			});
		}
		url = getCollibraUrl() + '/statuses?offset=0&limit=0&nameMatchMode=ANYWHERE&excludeMeta=true&topLevel=false';

		data = await axios.get(url, getAuthConfig());
		if (data.data.results.length > 0) {
			data.data.results.forEach((status) => {
				queryableStatuses.push(status.id);
			});
		}
	} catch (error) {
		console.log(error);
	}

	// Store in redis
	await redisAsyncClient.select(13);
	await redisAsyncClient.set(
		'dataCatalogSettings',
		JSON.stringify({
			assetTypes,
			queryableStatuses,
		})
	);
};

module.exports = {
	copyConfigToBuild,
	storeDataCatalogInfo,
};
