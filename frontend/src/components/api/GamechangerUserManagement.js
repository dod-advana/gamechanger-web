import axiosLib from 'axios';
import Config from '../../config/config.js';
import https from 'https';
// import util from "../advana/api/util";
import { axiosGET, axiosPOST } from '../../utils/axiosUtils';

const endpoints = {
	postUserAppVersion: '/api/userAppVersion',
	getUserData: '/api/gamechanger/user/getUserData',
	submitUserInfo: '/api/gameChanger/user/submitUserInfo',
};

export default class GamechangerUserManagementAPI {
	constructor(opts = {}) {
		const { axios = axiosLib } = opts;

		this.axios = axios.create({
			baseURL: Config.API_URL,
			httpsAgent: new https.Agent({
				keepAlive: true,
				rejectUnauthorized: false,
			}),
		});
	}

	postUserAppVersion = async (app) => {
		return axiosPOST(this.axios, endpoints.postUserAppVersion, { app });
	};

	getUserData = async () => {
		return axiosGET(this.axios, endpoints.getUserData);
	};

	submitUserInfo = async (data) => {
		const url = endpoints.submitUserInfo;
		return axiosPOST(this.axios, url, data);
	};
}
