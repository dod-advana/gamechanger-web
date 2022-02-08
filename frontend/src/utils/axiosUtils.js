import Auth from '@dod-advana/advana-platform-ui/dist/utilities/Auth';
const CryptoJS = require('crypto-js');
const Base64 = require('crypto-js/enc-base64');

export const getSignature = (options, url) => {
	const signature = Base64.stringify(
		CryptoJS.HmacSHA256(url, Auth.getToken() || 'NoToken')
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