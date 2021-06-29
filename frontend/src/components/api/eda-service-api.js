import axiosLib from "axios";
import Config from '../../config/config.js';
import https from 'https';
import {axiosPOST} from '../../gamechangerUtils';
import Permissions from "advana-platform-ui/dist/utilities/permissions";

const endpoints = {
    edaContractAwardGET: '/api/gamechanger/eda/edaContractAward'
}

export default class EDAAPI {
    constructor(opts = {}) {
		const {
			axios = axiosLib,
		} = opts;

		this.axios = axios.create({
			baseURL: Config.API_URL,
			httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
		});

	}

	queryEDAContractAward = async (awardID) => {
		if (Permissions.allowGCClone('eda')) {
			const url = endpoints.edaContractAwardGET;
			return axiosPOST(this.axios, url, {awardID});
		}
		else {
			return {}
		}
	}
}