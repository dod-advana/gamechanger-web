import Auth from '@dod-advana/advana-platform-ui/dist/utilities/Auth';
const CryptoJS = require('crypto-js');

export const getSignature = (options, url) => {
	const token = Auth.getTokenPayload();
	const signature = CryptoJS.enc.Base64.stringify(
		CryptoJS.HmacSHA256(url, token ? token['csrf-token'] : 'NoToken')
	);
	options.headers = { 'X-UA-SIGNATURE': signature };
};

export const axiosPOST = async (axios, url, data, options = {}) => {
	getSignature(options, url);
	return axios.post(url, data, options);
};

export const axiosGET = async (axios, url, options = {}) => {
	getSignature(options, url.split('?')[0]);
	return axios.get(url, options);
};

export const axiosDELETE = async (axios, url, options = {}) => {
	getSignature(options, url);
	return axios.delete(url, options);
};