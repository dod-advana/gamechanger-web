import axiosLib from 'axios';
import Config from '../../config/config.js';
import https from 'https';
// import util from "../advana/api/util";
import { axiosGET, axiosPOST } from '../../utils/axiosUtils';

const endpoints = {
	postUserAppVersion: '/api/userAppVersion',
	getUserData: '/api/gamechanger/user/getUserData',
	submitUserInfo: '/api/gameChanger/user/submitUserInfo',
	getUserProfileDataGET: '/api/gamechanger/user/getUserProfileData',
	updateUserProfileDataPOST: '/api/gamechanger/user/updateUserProfileData',
	setupUserProfilePOST: '/api/gameChanger/user/setupUserProfile',
	exportUsers: '/api/gameChanger/modular/exportUsers',
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

	getUserProfileData = async () => {
		const url = endpoints.getUserProfileDataGET;
		return axiosGET(this.axios, url);
	};

	updateUserProfileData = async (data) => {
		const url = endpoints.updateUserProfileDataPOST;
		return axiosPOST(this.axios, url, data);
	};

	setupUserProfile = async (body) => {
		const url = endpoints.setupUserProfilePOST;
		return axiosPOST(this.axios, url, body);
	};

	exportUsers = async (body) => {
		const url = endpoints.exportUsers;
		const options = { responseType: 'blob' };
		return axiosPOST(this.axios, url, body, options);
	};
}
