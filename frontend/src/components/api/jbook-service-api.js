import axiosLib from 'axios';
import Config from '../../config/config.js';
import https from 'https';
import { axiosGET, axiosDELETE, axiosPOST } from '../../utils/axiosUtils';

const endpoints = {
	getCloneMeta: '/api/gameChanger/modular/getCloneMeta',
	modularSearch: '/api/gameChanger/modular/search',
	modularExport: '/api/gameChanger/modular/export',
	gameChangerSemanticSearchDownloadPOST: '/api/gameChanger/semanticSearch/download',
	gameChangerGraphSearchPOST: '/api/gameChanger/modular/graphSearch',
	reloadHandlerMapGET: '/api/gamechanger/modular/admin/reloadHandlerMap',
	gcUserDataGET: '/api/gameChanger/admin/getUserData',
	gcUserDataPOST: '/api/gameChanger/admin/createUpdateUser',
	setupUserProfilePOST: '/api/gameChanger/setupUserProfile',
	gcUserDataDeletePOST: '/api/gameChanger/admin/deleteUserData',
	reviewerDataGET: '/api/gameChanger/admin/getReviewerData',
	reviewerDataPOST: '/api/gameChanger/admin/createUpdateReviewer',
	reviewerDataDeletePOST: '/api/gameChanger/admin/deleteReviewerData',
	getHomepageEditorData: '/api/gameChanger/admin/getHomepageEditorData',
	setHomepageEditorData: '/api/gameChanger/admin/setHomepageEditorData',
	getElasticSearchIndex: '/api/gameChanger/admin/getElasticSearchIndex',
	setElasticSearchIndex: '/api/gameChanger/admin/setElasticSearchIndex',
	queryEs: '/api/gameChanger/admin/queryEs',
	queryExp: '/api/gameChanger/expandTerms',
	notificationsGET: '/api/gameChanger/getNotifications',
	notificationCreatePOST: '/api/gameChanger/admin/createNotification',
	notificationEditActivePOST: '/api/gameChanger/admin/editNotificationActive',
	notificationDeletePOST: '/api/gameChanger/admin/deleteNotification',
	gcShortenSearchURLPOST: '/api/gameChanger/shortenSearchURL',
	gcConvertTinyURLPOST: '/api/gameChanger/convertTinyURL',
	recentSearchesPOST: '/api/gameChanger/getRecentSearches',
	reloadModels: '/api/gamechanger/admin/reloadModels',
	downloadCorpus: '/api/gamechanger/admin/downloadCorpus',
	trainModel: '/api/gamechanger/admin/trainModel',
	downloadDependencies: '/api/gamechanger/admin/downloadDependencies',
	getS3List: '/api/gamechanger/admin/getS3List',
	getAPIInformation: '/api/gamechanger/admin/getAPIInformation',
	getModelsList: '/api/gameChanger/admin/getModelsList',
	getCurrentTransformer: '/api/gameChanger/admin/getCurrentTransformer',
	getProcessStatus: '/api/gameChanger/admin/getProcessStatus',
	getFilesInCorpus: '/api/gameChanger/admin/getFilesInCorpus',
	getUserSettings: '/api/gameChanger/getUserSettings',
	setUserBetaStatus: '/api/gameChanger/setUserBetaStatus',
	getDocumentProperties: '/api/gameChanger/getDocumentProperties',
	clearDashboardNotification: '/api/gameChanger/clearDashboardNotification',
	callGraphFunctionPOST: '/api/gameChanger/modular/callGraphFunction',
	callSearchFunctionPOST: '/api/gameChanger/modular/callSearchFunction',
	callDataFunctionPOST: '/api/gameChanger/modular/callDataFunction',
	sendFrontendErrorPOST: '/api/gameChanger/sendFrontendError',
	getFAQ: '/api/gamechanger/aboutGC/getFAQ',
	exportReview: '/api/gameChanger/modular/exportReview',
	exportUsers: '/api/gameChanger/modular/exportUsers',
	exportChecklist: '/api/gameChanger/modular/exportChecklist',
	sendReviewStatusUpdates: '/api/gameChanger/admin/sendReviewStatusUpdates',
	getUserProfileDataGET: '/api/gamechanger/getUserProfileData',
	updateUserProfileDataPOST: '/api/gamechanger/updateUserProfileData',

	exportHistoryDELETE: function (id) {
		if (!id) {
			throw new Error('id not passed to route');
		}
		return `${this.exportHistory}/${id}`;
	},

};

export default class JBookAPI {
	constructor(opts = {}) {
		const {
			axios = axiosLib,
		} = opts;

		this.axios = axios.create({
			baseURL: Config.API_URL,
			httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
		});

	}

	exportHistoryDELETE = async (id) => {
		const url = endpoints.exportHistoryDELETE(id);
		return axiosDELETE(this.axios, url);
	}

	exportHistoryGET = async () => {
		const url = endpoints.exportHistory;
		return axiosGET(this.axios, url);
	}

	modularSearch = async (data) => {
		const url = endpoints.modularSearch;
		data.options.searchVersion = Config.GAMECHANGER.SEARCH_VERSION;
		return axiosPOST(this.axios, url, data);
	}

	modularExport = async (data) => {
		const url = endpoints.modularExport;
		const options = (data?.format ?? '') === 'pdf' ? {} : { responseType: 'blob' };

		data.searchVersion = Config.GAMECHANGER.SEARCH_VERSION;
		return axiosPOST(this.axios, url, data, options);
	}

	graphSearchPOST = async (body) => {
		const url = endpoints.gameChangerGraphSearchPOST;
		return axiosPOST(this.axios, url, body);
	}

	reloadHandlerMap = async () => {
		const url = endpoints.reloadHandlerMapGET;
		return axiosGET(this.axios, url);
	}

	getUserData = async () => {
		const url = endpoints.gcUserDataGET;
		return axiosGET(this.axios, url);
	}

	storeUserData = async (userData) => {
		const url = endpoints.gcUserDataPOST;
		return axiosPOST(this.axios, url, { userData, fromApp: true });
	}

	deleteUserData = async (userRowId) => {
		const url = endpoints.gcUserDataDeletePOST;
		return axiosPOST(this.axios, url, { userRowId });
	}

	getReviewerData = async () => {
		const url = endpoints.reviewerDataGET;
		return axiosGET(this.axios, url);
	}

	storeReviewerData = async (reviewerData) => {
		const url = endpoints.reviewerDataPOST;
		return axiosPOST(this.axios, url, { reviewerData, fromApp: true });
	}

	deleteReviewerData = async (reviewerRowId) => {
		const url = endpoints.reviewerDataDeletePOST;
		return axiosPOST(this.axios, url, { reviewerRowId });
	}

	getElasticSearchIndex = async () => {
		const url = endpoints.getElasticSearchIndex;
		return axiosGET(this.axios, url);
	}

	setElasticSearchIndex = async (index) => {
		const url = endpoints.setElasticSearchIndex;
		return axiosPOST(this.axios, url, { index });
	}

	getNotifications = async () => {
		const url = endpoints.notificationsGET;
		return axiosGET(this.axios, url);
	}

	createNotification = async (body) => {
		const url = endpoints.notificationCreatePOST;
		return axiosPOST(this.axios, url, body);
	}

	deleteNotification = async (id) => {
		const url = endpoints.notificationDeletePOST;
		return axiosPOST(this.axios, url, { id });
	}

	editNotificationActive = async (id, active) => {
		const url = endpoints.notificationEditActivePOST;
		return axiosPOST(this.axios, url, { id, active });
	}

	shortenSearchURLPOST = async (longURL) => {
		const url = endpoints.gcShortenSearchURLPOST;
		return axiosPOST(this.axios, url, { url: longURL });
	}

	convertTinyURLPOST = async (tinyURL) => {
		const url = endpoints.gcConvertTinyURLPOST;
		return axiosPOST(this.axios, url, { url: tinyURL });
	}

	// Starting ML endpoints
	reloadModels = async (data) => {
		const url = endpoints.reloadModels;
		return axiosPOST(this.axios, url, data);
	}

	downloadDependencies = async () => {
		const url = endpoints.downloadDependencies;
		return axiosGET(this.axios, url);
	}

	downloadCorpus = async (data) => {
		const url = endpoints.downloadCorpus;
		return axiosPOST(this.axios, url, data);
	}

	trainModel = async (data) => {
		const url = endpoints.trainModel;
		return axiosPOST(this.axios, url, data);
	}

	getAPIInformation = async () => {
		const url = endpoints.getAPIInformation;
		return axiosGET(this.axios, url);
	}

	getProcessStatus = async () => {
		const url = endpoints.getProcessStatus;
		return axiosGET(this.axios, url);
	}

	getS3List = async () => {
		const url = endpoints.getS3List;
		return axiosGET(this.axios, url);
	}

	getModelsList = async () => {
		const url = endpoints.getModelsList;
		return axiosGET(this.axios, url);
	}

	getCurrentTransformer = async () => {
		const url = endpoints.getCurrentTransformer;
		return axiosGET(this.axios, url);
	}

	getFilesInCorpus = async () => {
		const url = endpoints.getFilesInCorpus;
		return axiosGET(this.axios, url);
	}
	// End ML endpoints
	getUserSettings = async () => {
		const url = endpoints.getUserSettings;
		return axiosGET(this.axios, url);
	}

	queryEs = async (opts) => {
		const url = endpoints.queryEs;
		return axiosPOST(this.axios, url, opts);
	}

	queryExp = async (data) => {
		const querydata = { 'searchText': data }
		const url = endpoints.queryExp;
		return axiosPOST(this.axios, url, data = querydata);
	}

	setUserBetaStatus = async (checked) => {
		const url = endpoints.setUserBetaStatus;
		return axiosPOST(this.axios, url, { status: checked });
	}

	recentSearchesPOST = async (clone_name) => {
		const url = endpoints.recentSearchesPOST;
		return axiosPOST(this.axios, url, { clone_name });
	}

	getDocumentProperties = async () => {
		const url = endpoints.getDocumentProperties;
		return axiosGET(this.axios, url);
	}

	clearDashboardNotification = async (type) => {
		const url = endpoints.clearDashboardNotification;
		return axiosPOST(this.axios, url, { type });
	}

	callGraphFunction = async (body) => {
		const url = endpoints.callGraphFunctionPOST;
		return axiosPOST(this.axios, url, body);
	}

	callSearchFunction = async (body) => {
		const url = endpoints.callSearchFunctionPOST;
		return axiosPOST(this.axios, url, body);
	}

	callDataFunction = async (body) => {
		const url = endpoints.callDataFunctionPOST;
		return axiosPOST(this.axios, url, body);
	}

	getHomepageEditorData = async () => {
		const url = endpoints.getHomepageEditorData;
		return axiosGET(this.axios, url);
	}

	setHomepageEditorData = async (body) => {
		const url = endpoints.setHomepageEditorData;
		return axiosPOST(this.axios, url, body)
	}

	sendFrontendErrorPOST = async (error) => {
		const url = endpoints.sendFrontendErrorPOST;
		return axiosPOST(this.axios, url, error);
	}

	getFAQ = async () => {
		const url = endpoints.getFAQ;
		return axiosGET(this.axios, url);
	}

	exportReview = async (body) => {
		const url = endpoints.exportReview;
		const options = { responseType: 'blob' };
		return axiosPOST(this.axios, url, body, options);
	}

	exportUsers = async (body) => {
		const url = endpoints.exportUsers;
		const options = { responseType: 'blob' };
		return axiosPOST(this.axios, url, body, options);
	}

	exportChecklist = async (body) => {
		const url = endpoints.exportChecklist;
		const options = { responseType: 'blob' };
		return axiosPOST(this.axios, url, body, options);
	}

	setupUserProfile = async (body) => {
		const url = endpoints.setupUserProfilePOST;
		return axiosPOST(this.axios, url, body);
	}

	sendReviewStatusUpdates = async (data) => {
		const url = endpoints.sendReviewStatusUpdates;
		return axiosPOST(this.axios, url, data);
	}

	getUserProfileData = async () => {
		const url = endpoints.getUserProfileDataGET;
		return axiosGET(this.axios, url);
	}

	updateUserProfileData = async (data) => {
		const url = endpoints.updateUserProfileDataPOST;
		return axiosPOST(this.axios, url, data);
	}
}
