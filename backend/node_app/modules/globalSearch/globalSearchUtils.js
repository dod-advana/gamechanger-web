const axios = require('axios');
const https = require('https');
const constantsFile = require('../../config/constants');

const { QLIK_URL, QLIK_WS_URL, CA, KEY, CERT, AD_DOMAIN, QLIK_SYS_ACCOUNT } = constantsFile.QLIK_OPTS;

const STREAM_PROD_FILTER = `customProperties.value eq 'Production' and customProperties.definition.name eq 'StreamType'`;
const APP_PROD_FILTER = `stream.customProperties.value eq 'Production' and stream.customProperties.definition.name eq 'StreamType'`;

const getQlikApps = async (params = {}, userId, logger, getCount = false, getFull = false) => {
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

module.exports = {
	getQlikApps,
};
