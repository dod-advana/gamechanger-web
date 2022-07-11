const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getAuthConfig, getCollibraUrl } = require('./DataCatalogUtils');
const moment = require('moment');
const CryptoJS = require('crypto-js');
const secureRandom = require('secure-random');
const { getUserIdFromSAMLUserId } = require('./userUtility');
const { UserController } = require('../controllers/userController');
const User = require('../models').user;

const userController = new UserController();

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

const checkOldTokens = async (userTokenOld, tokenTimeoutOld, csrfHash, req) => {
	if (userTokenOld && tokenTimeoutOld) {
		tokenTimeoutOld = moment(tokenTimeoutOld);
		if (tokenTimeoutOld <= moment()) {
			csrfHash = CryptoJS.SHA256(secureRandom(10)).toString(CryptoJS.enc.Hex);
			const tokenTimeout = moment().add(2, 'days').format();
			await redisAsyncClient.set(`${getUserIdFromSAMLUserId(req)}-token`, csrfHash);
			await redisAsyncClient.set(`${getUserIdFromSAMLUserId(req)}-tokenExpiration`, tokenTimeout);
		}
	} else {
		csrfHash = CryptoJS.SHA256(secureRandom(10)).toString(CryptoJS.enc.Hex);
		const tokenTimeout = moment().add(2, 'days').format();
		await redisAsyncClient.set(`${getUserIdFromSAMLUserId(req)}-token`, csrfHash);
		await redisAsyncClient.set(`${getUserIdFromSAMLUserId(req)}-tokenExpiration`, tokenTimeout);
	}
	return csrfHash;
};

const checkUser = async (req, sessUser) => {
	let user = await User.findOne({ where: { user_id: getUserIdFromSAMLUserId(req) }, raw: true });
	if (!user || user === null) {
		await userController.updateOrCreateUserHelper(sessUser);
		user = await User.findOne({ where: { user_id: getUserIdFromSAMLUserId(req) }, raw: true });
	}
	return user;
};

const checkHash = async (req) => {
	let csrfHash;
	if (req.get('SSL_CLIENT_S_DN_CN') === 'ml-api') {
		csrfHash = process.env.ML_WEB_TOKEN || 'Add The Token';
	} else {
		csrfHash = await redisAsyncClient.get(`${getUserIdFromSAMLUserId(req)}-token`);
	}
	return csrfHash;
};

module.exports = {
	copyConfigToBuild,
	storeDataCatalogInfo,
	checkOldTokens,
	checkUser,
	checkHash,
};
