import axiosLib from 'axios';
import Config from '../../config/config.js';
import https from 'https';
import { axiosGET, axiosDELETE, axiosPOST, axiosPUT } from '../../utils/axiosUtils';
import html2pdf from 'html2pdf.js';

const endpoints = {
	getCloneMeta: '/api/gameChanger/modular/getCloneMeta',
	modularSearch: '/api/gameChanger/modular/search',
	modularExport: '/api/gameChanger/modular/export',
	gameChangerSemanticSearchDownloadPOST: '/api/gameChanger/semanticSearch/download',
	gameChangerGraphSearchPOST: '/api/gameChanger/modular/graphSearch',
	graphQueryPOST: '/api/gameChanger/modular/graphQuery',
	getDocumentsToAnnotate: '/api/gameChanger/assist/getDocumentsToAnnotate',
	saveDocumentAnnotationsPOST: '/api/gameChanger/assist/saveDocumentAnnotationsPOST',
	sendFeedbackPOST: '/api/gameChanger/sendFeedback',
	sendClassificationAlertPOST: '/api/gameChanger/sendClassificationAlert',
	intelligentSearchFeedback: '/api/gameChanger/sendFeedback/intelligentSearch',
	dataStorageDownloadGET: '/api/gameChanger/v2/data/storage/download',
	thumbnailStorageDownloadPOST: '/api/gameChanger/thumbnailDownload',
	gcCloneDataGET: '/api/gamechanger/modular/getAllCloneMeta',
	gcCloneTableDataGET: '/api/gamechanger/modular/admin/getCloneTableStructure',
	reloadHandlerMapGET: '/api/gamechanger/modular/admin/reloadHandlerMap',
	gcCloneDataPOST: '/api/gameChanger/modular/admin/storeCloneMeta',
	gcCloneDataDeletePOST: '/api/gameChanger/modular/admin/deleteCloneMeta',
	gcDataTrackerDataPOST: '/api/gameChanger/dataTracker/getTrackedData',
	getDocIngestionStats: '/api/gameChanger/getDocIngestionStats',
	gcBrowsingLibraryPOST: '/api/gameChanger/dataTracker/getBrowsingLibrary',
	gcAdminDataGET: '/api/gameChanger/admin/getAdminData',
	gcAdminDataPOST: '/api/gameChanger/admin/storeAdminData',
	gcAdminDataDeletePOST: '/api/gameChanger/admin/deleteAdminData',
	getHomepageEditorData: '/api/gameChanger/getHomepageEditorData',
	setHomepageEditorData: '/api/gameChanger/admin/setHomepageEditorData',
	getGCCacheStatus: '/api/gameChanger/admin/getGCCacheStatus',
	toggleGCCacheStatus: '/api/gameChanger/admin/toggleGCCacheStatus',
	getElasticSearchIndex: '/api/gameChanger/getElasticSearchIndex',
	setElasticSearchIndex: '/api/gameChanger/admin/setElasticSearchIndex',
	queryEs: '/api/gameChanger/admin/queryEs',
	notificationsPOST: '/api/gameChanger/getNotifications',
	notificationCreatePOST: '/api/gameChanger/admin/createNotification',
	notificationEditActivePOST: '/api/gameChanger/admin/editNotificationActive',
	notificationDeletePOST: '/api/gameChanger/admin/deleteNotification',
	gcCreateSearchHistoryCache: '/api/gameChanger/admin/createSearchHistoryCache',
	gcClearSearchHistoryCache: '/api/gameChanger/admin/clearSearchHistoryCache',
	gcCreateAbbreviationsCache: '/api/gameChanger/admin/createAbbreviationsCache',
	gcClearAbbreviationsCache: '/api/gameChanger/admin/clearAbbreviationsCache',
	gcCreateGraphDataCache: '/api/gameChanger/admin/createGraphDataCache',
	gcClearGraphDataCache: '/api/gameChanger/admin/clearGraphDataCache',
	gcShortenSearchURLPOST: '/api/gameChanger/shortenSearchURL',
	gcConvertTinyURLPOST: '/api/gameChanger/convertTinyURL',
	gcCrawlerTrackerData: '/api/gameChanger/getCrawlerMetadata',
	gcCrawlerSealData: '/api/gameChanger/getCrawlerSeals',
	gcOrgSealData: '/api/gameChanger/getOrgSeals',
	favoriteDocumentPOST: '/api/gameChanger/favorites/document',
	favoriteGroupPOST: '/api/gameChanger/favorites/group',
	addTofavoriteGroupPOST: '/api/gameChanger/favorites/addToGroup',
	deleteFavoriteFromGroupPOST: '/api/gameChanger/favorites/removeFromGroup',
	getRecentlyOpenedDocs: '/api/gameChanger/getRecentlyOpenedDocs',
	recentSearchesPOST: '/api/gameChanger/getRecentSearches',
	trendingSearchesPOST: '/api/gameChanger/trending/trendingSearches',
	getTrendingBlacklist: '/api/gameChanger/trending/getTrendingBlacklist',
	setTrendingBlacklist: '/api/gameChanger/admin/trending/setTrendingBlacklist',
	deleteTrendingBlacklist: '/api/gameChanger/admin/trending/deleteTrendingBlacklist',
	getWeeklySearchCount: '/api/gameChanger/trending/getWeeklySearchCount',
	favoriteSearchPOST: '/api/gameChanger/favorites/search',
	favoriteTopicPOST: '/api/gameChanger/favorites/topic',
	favoriteOrganizationPOST: '/api/gameChanger/favorites/organization',
	reloadModels: '/api/gamechanger/admin/reloadModels',
	downloadCorpus: '/api/gamechanger/admin/downloadCorpus',
	trainModel: '/api/gamechanger/admin/trainModel',
	downloadDependencies: '/api/gamechanger/admin/downloadDependencies',
	getS3List: '/api/gamechanger/admin/getS3List',
	getS3DataList: '/api/gamechanger/admin/getS3DataList',
	downloadS3File: '/api/gamechanger/admin/downloadS3File',
	deleteLocalModel: '/api/gamechanger/admin/deleteLocalModel',
	stopProcess: '/api/gamechanger/admin/stopProcess',
	getAPIInformation: '/api/gamechanger/admin/getAPIInformation',
	getModelsList: '/api/gameChanger/admin/getModelsList',
	getDataList: '/api/gameChanger/admin/getDataList',
	getLoadedModels: '/api/gameChanger/admin/getLoadedModels',
	getProcessStatus: '/api/gameChanger/admin/getProcessStatus',
	getFilesInCorpus: '/api/gameChanger/admin/getFilesInCorpus',
	getUserSettings: '/api/gameChanger/getUserSettings',
	getInternalUsers: '/api/gameChanger/getInternalUsers',
	addInternalUser: '/api/gameChanger/admin/addInternalUser',
	deleteInternalUser: '/api/gameChanger/admin/deleteInternalUser',
	getAppStats: '/api/gameChanger/getAppStats',
	getClonesMatomo: '/api/gameChanger/admin/getClonesMatomo',
	getSearchPdfMapping: '/api/gameChanger/admin/getSearchPdfMapping',
	exportUserData: '/api/gameChanger/admin/exportUserData',
	getDocumentUsage: '/api/gameChanger/admin/getDocumentUsage',
	getUserAggregations: '/api/gameChanger/admin/getUserAggregations',
	sendUserAggregations: '/api/gameChanger/admin/sendUserAggregations',
	getDocumentProperties: '/api/gameChanger/getDocumentProperties',
	clearDashboardNotification: '/api/gameChanger/clearDashboardNotification',
	clearFavoriteSearchUpdate: '/api/gameChanger/clearFavoriteSearchUpdate',
	callGraphFunctionPOST: '/api/gameChanger/modular/callGraphFunction',
	callSearchFunctionPOST: '/api/gameChanger/modular/callSearchFunction',
	textSuggestionPOST: '/api/gameChanger/textSuggestion',
	getResponsibilityData: '/api/gameChanger/responsibilities/get',
	getResponsibilityDocTitles: '/api/gameChanger/responsibilities/getDocTitles',
	getResponsibilityDoc: '/api/gameChanger/responsibilities/getDoc',
	getResponsibilityDocLink: '/api/gameChanger/responsibilities/getDocLink',
	setRejectionStatus: '/api/gameChanger/responsibilities/setRejectionStatus',
	updateResponsibility: '/api/gameChanger/responsibilities/updateResponsibility',
	updateResponsibilityReport: '/api/gameChanger/responsibilities/updateResponsibilityReport',
	storeResponsibilityReportData: '/api/gameChanger/responsibilities/storeReport',
	getResponsibilityUpdates: '/api/gameChanger/responsibilities/getUpdates',
	approveRejectAPIKeyRequestPOST: '/api/gameChanger/admin/approveRejectAPIKeyRequest',
	revokeAPIKeyRequestPOST: '/api/gameChanger/admin/revokeAPIKeyRequest',
	updateAPIKeyDescriptionPOST: '/api/gameChanger/admin/updateAPIKeyDescription',
	getAPIKeyRequestsGET: '/api/gameChanger/admin/getAPIKeyRequests',
	createAPIKeyRequestPOST: '/api/gameChanger/createAPIKeyRequest',
	updateUserAPIRequestLimit: '/api/gameChanger/updateUserAPIRequestLimit',
	combinedSearchMode: '/api/gamechanger/appSettings/combinedSearch',
	intelligentAnswers: '/api/gamechanger/appSettings/intelligentAnswers',
	entitySearch: '/api/gamechanger/appSettings/entitySearch',
	jiraFeedback: '/api/gamechanger/appSettings/jiraFeedback',
	ltr: '/api/gamechanger/appSettings/ltr',
	sendJiraFeedback: '/api/gamechanger/sendFeedback/jira',
	requestDocIngest: '/api/gamechanger/sendFeedback/requestDoc',
	getThumbnail: '/api/gameChanger/getThumbnail',
	topicSearch: '/api/gamechanger/appSettings/topicSearch',
	qaSearchFeedback: '/api/gameChanger/sendFeedback/QA',
	getFeedbackData: '/api/gameChanger/sendFeedback/getFeedbackData',
	sendFrontendErrorPOST: '/api/gameChanger/sendFrontendError',
	getOrgImageOverrideURLs: '/api/gameChanger/getOrgImageOverrideURLs',
	saveOrgImageOverrideURL: '/api/gameChanger/saveOrgImageOverrideURL',
	getFAQ: '/api/gamechanger/aboutGC/getFAQ',
	compareDocumentPOST: '/api/gamechanger/analyticsTools/compareDocument',
	compareFeedbackPOST: '/api/gamechanger/analyticsTools/compareFeedback',
	initializeLTR: '/api/gamechanger/admin/initializeLTR',
	createModelLTR: '/api/gamechanger/admin/createModelLTR',
	updateClonesVisitedPOST: '/api/gameChanger/user/updateClonesVisited',
	gcUserDataGET: '/api/gameChanger/admin/getAllUserData',
	gcUserDataPOST: '/api/gameChanger/admin/createUpdateUser',
	gcUserDataDeletePOST: '/api/gameChanger/admin/deleteUserData',
	syncUserTableGET: '/api/gameChanger/admin/syncUserTable',
	callDataFunctionPOST: '/api/gameChanger/modular/callDataFunction',
	queryExp: '/api/gameChanger/expandTerms',
	reviewerDataGET: '/api/gameChanger/admin/getReviewerData',
	reviewerDataDeletePOST: '/api/gameChanger/admin/deleteReviewerData',
	reviewerDataPOST: '/api/gameChanger/admin/createUpdateReviewer',
	exportReview: '/api/gameChanger/modular/exportReview',
	exportChecklist: '/api/gameChanger/modular/exportChecklist',
	exportProfilePage: '/api/gameChanger/modular/exportProfilePage',
	sendReviewStatusUpdates: '/api/gameChanger/admin/sendReviewStatusUpdates',
	//getUserFavoriteHomeApps: '/api/um/profile/current-user',
	getUserFavoriteHomeApps: '/api/gamechanger/user/profile/current-user',

	exportHistoryDELETE: function (id) {
		if (!id) {
			throw new Error('id not passed to route');
		}
		return `${this.exportHistory}/${id}`;
	},

	// mirror advana matomo in decoupled
	appMatomoStatus: '/api/matomo',
	userMatomoStatus: '/api/matomo/user',
};

export default class GameChangerAPI {
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

	exportHistoryDELETE = async (id) => {
		const url = endpoints.exportHistoryDELETE(id);
		return axiosDELETE(this.axios, url);
	};

	exportHistoryGET = async () => {
		const url = endpoints.exportHistory;
		return axiosGET(this.axios, url);
	};

	genericDocumentSearchPOST = async ({
		searchText,
		offset,
		getIdList,
		orgFilterQuery,
		transformResults,
		isClone = false,
		cloneData = {},
		index,
		charsPadding,
		orgFilter = {},
		showTutorial,
		useGCCache = false,
		tiny_url,
		limit = 20,
		storedFields = [],
	}) => {
		const url = endpoints.modularSearch;
		return axiosPOST(this.axios, url, {
			searchText,
			offset,
			getIdList,
			orgFilterQuery,
			transformResults,
			isClone,
			cloneData,
			index,
			charsPadding,
			orgFilter,
			showTutorial,
			useGCCache,
			limit,
			tiny_url,
			storedFields,
		});
	};

	getCloneMeta = async (data) => {
		const url = endpoints.getCloneMeta;
		return axiosPOST(this.axios, url, data);
	};

	modularSearch = async (data, cancelToken) => {
		const url = endpoints.modularSearch;
		data.options.searchVersion = Config.GAMECHANGER.SEARCH_VERSION;
		if (cancelToken) {
			return axiosPOST(this.axios, url, data, {
				cancelToken: cancelToken?.token ? cancelToken.token : {},
			});
		}
		return axiosPOST(this.axios, url, data);
	};

	modularExport = async (data) => {
		const url = endpoints.modularExport;
		const options = (data?.format ?? '') === 'pdf' ? {} : { responseType: 'blob' };

		data.searchVersion = Config.GAMECHANGER.SEARCH_VERSION;
		return axiosPOST(this.axios, url, data, options);
	};

	createSearchHistoryCache = async () => {
		const url = endpoints.gcCreateSearchHistoryCache;
		return axiosGET(this.axios, url);
	};

	clearSearchHistoryCache = async () => {
		const url = endpoints.gcClearSearchHistoryCache;
		return axiosGET(this.axios, url);
	};

	createAbbreviationsCache = async () => {
		const url = endpoints.gcCreateAbbreviationsCache;
		return axiosGET(this.axios, url);
	};

	clearAbbreviationsCache = async () => {
		const url = endpoints.gcClearAbbreviationsCache;
		return axiosGET(this.axios, url);
	};

	createGraphDataCache = async () => {
		const url = endpoints.gcCreateGraphDataCache;
		return axiosGET(this.axios, url);
	};

	clearGraphDataCache = async () => {
		const url = endpoints.gcClearGraphDataCache;
		return axiosGET(this.axios, url);
	};

	graphSearchPOST = async (body) => {
		const url = endpoints.gameChangerGraphSearchPOST;
		return axiosPOST(this.axios, url, body);
	};

	getDocumentsToAnnotate = async ({ clone, cloneData }) => {
		const url = endpoints.getDocumentsToAnnotate;
		return axiosPOST(this.axios, url, { clone, cloneData });
	};

	saveDocumentAnnotations = async (annotationData) => {
		const url = endpoints.saveDocumentAnnotationsPOST;
		return axiosPOST(this.axios, url, { annotationData: annotationData });
	};

	sendFeedbackPOST = async (feedbackData) => {
		const url = endpoints.sendFeedbackPOST;
		return axiosPOST(this.axios, url, { feedbackData: feedbackData });
	};

	sendClassificationAlertPOST = async (alertData) => {
		const url = endpoints.sendClassificationAlertPOST;
		return axiosPOST(this.axios, url, { alertData: alertData });
	};

	getAllMatchesBetweenDoubleQuotes = (string) => {
		const pattern = /".*?"/g;
		let current;
		let matches = [];
		/*eslint-disable */
		while ((current = pattern.exec(string))) {
			if (current && current[0]) matches.push(current[0].replace(/"/g, ''));
		}
		/*eslint-enable */
		return matches;
	};

	splitSearchText = (str) => {
		//Case 1: exact phrase match. We only match the FIRST phrase due to pdfjs highlighting limitations
		const phraseMatches = this.getAllMatchesBetweenDoubleQuotes(str);
		if (phraseMatches.length > 0) return phraseMatches[0] + '&phrase=true';
		//Case 2: no phrases, but boolean operators that need separated
		const upperStr = str.toUpperCase();
		const splits = upperStr.split(/ AND | OR /);
		return splits.join(' ');
	};

	buildPdfViewerUrl = (generatedUrl, highlightText, pageNumber, fileName) => {
		let redirectUrl = `/pdfjs/web/viewer.html?file=${generatedUrl}`;
		let append = '';
		if (highlightText) {
			if (Array.isArray(highlightText)) {
				append += `#search=${JSON.stringify(highlightText)}&searchArray`;
			} else {
				append += `#search=${this.splitSearchText(highlightText)}`;
			}
		}
		if (pageNumber) append += `${append[0] === '#' ? '&' : '#'}page=${pageNumber}`;
		if (fileName) append += `${append[0] === '#' ? '&' : '#'}filename=${fileName}`;
		redirectUrl += append;
		return redirectUrl;
	};

	getPdfViewerUrl = async (response, highlightText, pageNumber, fileName) => {
		let generatedUrl;
		if (fileName.toLowerCase().endsWith('html')) {
			const htmlString = await response.data.text();
			const opt = {
				margin: 10,
				enableLinks: false,
			};
			const blobUri = await html2pdf().set(opt).from(htmlString).outputPdf('bloburi');
			generatedUrl = blobUri;
		} else {
			generatedUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
		}
		return this.buildPdfViewerUrl(generatedUrl, highlightText, pageNumber, fileName);
	};

	dataStorageDownloadGET = async (
		fileName,
		highlightText,
		pageNumber,
		isClone = false,
		cloneData = { clone_name: 'gamechanger' },
		isDLA = false
	) => {
		return new Promise((resolve, reject) => {
			const s3Bucket = cloneData?.s3_bucket ?? 'advana-data-zone/bronze';

			let filename = encodeURIComponent(
				`gamechanger${cloneData.clone_name !== 'gamechanger' ? `/projects/${cloneData.clone_name}` : ''}/${
					isDLA ? 'pdf-assist' : 'pdf'
				}/${fileName}`
			);

			if (cloneData.clone_name === 'eda') {
				filename = encodeURIComponent(fileName);
			}

			axiosGET(
				this.axios,
				`${endpoints.dataStorageDownloadGET}?path=${encodeURIComponent(
					fileName
				)}&dest=${s3Bucket}&filekey=${filename}&isClone=${isClone}&clone_name=${cloneData.clone_name}`,
				{
					responseType: 'blob',
					withCredentials: false,
				}
			)
				.then(async (resp) => {
					const redirectUrl = await this.getPdfViewerUrl(resp, highlightText, pageNumber, fileName);
					resolve(redirectUrl);
				})
				.catch((e) => {
					console.error(e);
					console.error('ERROR GC-service-api storageDownloadBlobGET', e.message);
					reject(e.message);
				});
		});
	};

	thumbnailStorageDownloadPOST = async (filenames, folder, cloneData, cancelToken) => {
		const s3Bucket = cloneData?.s3_bucket ?? 'advana-data-zone/bronze';
		const url = endpoints.thumbnailStorageDownloadPOST;
		if (cancelToken) {
			return axiosPOST(
				this.axios,
				url,
				{ filenames, folder, clone_name: cloneData.clone_name, dest: s3Bucket },
				{
					timeout: 0,
					cancelToken: cancelToken?.token ? cancelToken.token : {},
				}
			);
		}
		return axiosPOST(
			this.axios,
			url,
			{ filenames, folder, clone_name: cloneData.clone_name, dest: s3Bucket },
			{ timeout: 0 }
		);
	};

	getCloneData = async () => {
		const url = endpoints.gcCloneDataGET;
		return axiosGET(this.axios, url);
	};

	getCloneTableData = async () => {
		const url = endpoints.gcCloneTableDataGET;
		return axiosGET(this.axios, url);
	};

	reloadHandlerMap = async () => {
		const url = endpoints.reloadHandlerMapGET;
		return axiosGET(this.axios, url);
	};

	storeCloneData = async (cloneData) => {
		const url = endpoints.gcCloneDataPOST;
		return axiosPOST(this.axios, url, { cloneData });
	};

	deleteCloneData = async (id) => {
		const url = endpoints.gcCloneDataDeletePOST;
		return axiosPOST(this.axios, url, { id });
	};

	getDataTrackerData = async (options) => {
		const url = endpoints.gcDataTrackerDataPOST;
		return axiosPOST(this.axios, url, options);
	};

	getDocIngestionStats = async () => {
		const url = endpoints.getDocIngestionStats;
		return axiosGET(this.axios, url);
	};

	getBrowsingLibrary = async (options) => {
		const url = endpoints.gcVersionedDocsPOST;
		return axiosPOST(this.axios, url, options);
	};

	gcCrawlerTrackerData = async (options) => {
		const url = endpoints.gcCrawlerTrackerData;
		return axiosPOST(this.axios, url, options);
	};

	gcCrawlerSealData = async () => {
		const url = endpoints.gcCrawlerSealData;
		return axiosPOST(this.axios, url);
	};

	gcOrgSealData = async () => {
		const url = endpoints.gcOrgSealData;
		return axiosPOST(this.axios, url);
	};

	getSourceTrackerData = async (options) => {
		const url = endpoints.gcSourceTrackerDataPOST;
		return axiosPOST(this.axios, url, options);
	};

	getResponsibilityData = async (options) => {
		const url = endpoints.getResponsibilityData;
		return axiosPOST(this.axios, url, options);
	};

	getResponsibilityDocTitles = async (options) => {
		const url = endpoints.getResponsibilityDocTitles;
		return axiosPOST(this.axios, url, options);
	};

	getResponsibilityDocLink = async (options) => {
		const url = endpoints.getResponsibilityDocLink;
		return axiosPOST(this.axios, url, options);
	};

	getResponsibilityDoc = async (options) => {
		const url = endpoints.getResponsibilityDoc;
		return axiosPOST(this.axios, url, options);
	};

	setRejectionStatus = async (options) => {
		const url = endpoints.setRejectionStatus;
		return axiosPOST(this.axios, url, options);
	};

	updateResponsibility = async (options) => {
		const url = endpoints.updateResponsibility;
		return axiosPOST(this.axios, url, options);
	};

	updateResponsibilityReport = async (options) => {
		const url = endpoints.updateResponsibilityReport;
		return axiosPOST(this.axios, url, options);
	};

	storeResponsibilityReportData = async (data) => {
		const url = endpoints.storeResponsibilityReportData;
		return axiosPOST(this.axios, url, data);
	};

	getResponsibilityUpdates = async (data) => {
		const url = endpoints.getResponsibilityUpdates;
		return axiosPOST(this.axios, url, data);
	};

	getAdminData = async () => {
		const url = endpoints.gcAdminDataGET;
		return axiosGET(this.axios, url);
	};

	storeAdminData = async (adminData) => {
		const url = endpoints.gcAdminDataPOST;
		return axiosPOST(this.axios, url, { adminData });
	};

	deleteAdminData = async (username) => {
		const url = endpoints.gcAdminDataDeletePOST;
		return axiosPOST(this.axios, url, { username });
	};

	getGCCacheStatus = async () => {
		const url = endpoints.getGCCacheStatus;
		return axiosGET(this.axios, url);
	};

	toggleGCCacheStatus = async () => {
		const url = endpoints.toggleGCCacheStatus;
		return axiosGET(this.axios, url);
	};

	getElasticSearchIndex = async () => {
		const url = endpoints.getElasticSearchIndex;
		return axiosGET(this.axios, url);
	};

	setElasticSearchIndex = async (index) => {
		const url = endpoints.setElasticSearchIndex;
		return axiosPOST(this.axios, url, { index });
	};

	getNotifications = async (cloneName) => {
		const url = endpoints.notificationsPOST;
		return axiosPOST(this.axios, url, { project_name: cloneName });
	};

	createNotification = async (body) => {
		const url = endpoints.notificationCreatePOST;
		return axiosPOST(this.axios, url, body);
	};

	deleteNotification = async (id) => {
		const url = endpoints.notificationDeletePOST;
		return axiosPOST(this.axios, url, { id });
	};

	editNotificationActive = async (id, active) => {
		const url = endpoints.notificationEditActivePOST;
		return axiosPOST(this.axios, url, { id, active });
	};

	getAppMatomoStatus = async () => {
		const url = endpoints.appMatomoStatus;
		return axiosGET(this.axios, url);
	};

	getUserMatomoStatus = async () => {
		const url = endpoints.userMatomoStatus;
		return axiosGET(this.axios, url);
	};

	setAppMatomoStatus = async (data) => {
		const url = endpoints.appMatomoStatus;
		return axiosPOST(this.axios, url, data);
	};

	setUserMatomoStatus = async (data) => {
		const url = endpoints.userMatomoStatus;
		return axiosPOST(this.axios, url, data);
	};

	shortenSearchURLPOST = async (longURL) => {
		const url = endpoints.gcShortenSearchURLPOST;
		return axiosPOST(this.axios, url, { url: longURL });
	};

	convertTinyURLPOST = async (tinyURL) => {
		const url = endpoints.gcConvertTinyURLPOST;
		return axiosPOST(this.axios, url, { url: tinyURL });
	};

	favoriteDocument = async (data) => {
		const url = endpoints.favoriteDocumentPOST;
		return axiosPOST(this.axios, url, data);
	};

	favoriteGroup = async (data) => {
		const url = endpoints.favoriteGroupPOST;
		return axiosPOST(this.axios, url, data);
	};

	addTofavoriteGroupPOST = async (data) => {
		const url = endpoints.addTofavoriteGroupPOST;
		return axiosPOST(this.axios, url, data);
	};

	deleteFavoriteFromGroupPOST = async (data) => {
		const url = endpoints.deleteFavoriteFromGroupPOST;
		return axiosPOST(this.axios, url, data);
	};

	favoriteSearch = async (data) => {
		const url = endpoints.favoriteSearchPOST;
		return axiosPOST(this.axios, url, data);
	};

	favoriteTopic = async (data) => {
		const url = endpoints.favoriteTopicPOST;
		return axiosPOST(this.axios, url, data);
	};

	favoriteOrganization = async (data) => {
		const url = endpoints.favoriteOrganizationPOST;
		return axiosPOST(this.axios, url, data);
	};

	trendingSearches = async (data) => {
		const url = endpoints.trendingSearchesPOST;
		return axiosPOST(this.axios, url, data);
	};

	getTrendingBlacklist = async () => {
		const url = endpoints.getTrendingBlacklist;
		return axiosGET(this.axios, url);
	};

	setTrendingBlacklist = async (data) => {
		const url = endpoints.setTrendingBlacklist;
		return axiosPOST(this.axios, url, data);
	};

	deleteTrendingBlacklist = async (data) => {
		const url = endpoints.deleteTrendingBlacklist;
		return axiosPOST(this.axios, url, data);
	};
	// Starting ML endpoints
	reloadModels = async (data) => {
		const url = endpoints.reloadModels;
		return axiosPOST(this.axios, url, data);
	};

	downloadDependencies = async () => {
		const url = endpoints.downloadDependencies;
		return axiosGET(this.axios, url);
	};

	downloadCorpus = async (data) => {
		const url = endpoints.downloadCorpus;
		return axiosPOST(this.axios, url, data);
	};

	trainModel = async (data) => {
		const url = endpoints.trainModel;
		return axiosPOST(this.axios, url, data);
	};

	getAPIInformation = async () => {
		const url = endpoints.getAPIInformation;
		return axiosGET(this.axios, url);
	};

	getProcessStatus = async () => {
		const url = endpoints.getProcessStatus;
		return axiosGET(this.axios, url);
	};

	getS3List = async () => {
		const url = endpoints.getS3List;
		return axiosGET(this.axios, url);
	};

	getS3DataList = async () => {
		const url = endpoints.getS3DataList;
		return axiosGET(this.axios, url);
	};

	downloadS3File = async (opts) => {
		const url = endpoints.downloadS3File;
		return axiosPOST(this.axios, url, opts);
	};

	stopProcess = async (opts) => {
		const url = endpoints.stopProcess;
		return axiosPOST(this.axios, url, opts);
	};

	deleteLocalModel = async (opts) => {
		const url = endpoints.deleteLocalModel;
		return axiosPOST(this.axios, url, opts);
	};
	getModelsList = async () => {
		const url = endpoints.getModelsList;
		return axiosGET(this.axios, url);
	};

	getDataList = async () => {
		const url = endpoints.getDataList;
		return axiosGET(this.axios, url);
	};

	getLoadedModels = async () => {
		const url = endpoints.getLoadedModels;
		return axiosGET(this.axios, url);
	};

	getFilesInCorpus = async () => {
		const url = endpoints.getFilesInCorpus;
		return axiosGET(this.axios, url);
	};
	// End ML endpoints
	getUserSettings = async () => {
		const url = endpoints.getUserSettings;
		return axiosGET(this.axios, url);
	};

	queryEs = async (opts) => {
		const url = endpoints.queryEs;
		return axiosPOST(this.axios, url, opts);
	};

	getInternalUsers = async () => {
		const url = endpoints.getInternalUsers;
		return axiosGET(this.axios, url);
	};

	getAppStats = async (data) => {
		const url = endpoints.getAppStats;
		return axiosPOST(this.axios, url, data);
	};

	getRecentlyOpenedDocs = async (clone_name) => {
		const url = endpoints.getRecentlyOpenedDocs;
		return axiosPOST(this.axios, url, { clone_name });
	};

	recentSearchesPOST = async (clone_name) => {
		const url = endpoints.recentSearchesPOST;
		return axiosPOST(this.axios, url, { clone_name });
	};

	getSearchPdfMapping = async (body) => {
		const url = endpoints.getSearchPdfMapping;
		return axiosGET(this.axios, url, { params: body });
	};

	getClonesMatomo = async (body) => {
		const url = endpoints.getClonesMatomo;
		return axiosGET(this.axios, url, { params: body });
	};

	exportUserData = async (body) => {
		const url = endpoints.exportUserData;
		return axiosGET(this.axios, url, { params: body, responseType: 'arraybuffer' });
	};

	getDocumentUsage = async (body) => {
		const url = endpoints.getDocumentUsage;
		return axiosGET(this.axios, url, { params: body });
	};

	getUserAggregations = async (body) => {
		const url = endpoints.getUserAggregations;
		return axiosGET(this.axios, url, { params: body });
	};

	sendUserAggregations = async (body) => {
		const url = endpoints.sendUserAggregations;
		return axiosPOST(this.axios, url, { params: body });
	};

	addInternalUser = async (body) => {
		const url = endpoints.addInternalUser;
		return axiosPOST(this.axios, url, body);
	};

	deleteInternalUser = async (id) => {
		const url = endpoints.deleteInternalUser;
		return axiosPOST(this.axios, url, { id });
	};

	getDocumentProperties = async () => {
		const url = endpoints.getDocumentProperties;
		return axiosGET(this.axios, url);
	};

	clearDashboardNotification = async (cloneName, type) => {
		const url = endpoints.clearDashboardNotification;
		return axiosPOST(this.axios, url, { cloneName, type });
	};

	clearFavoriteSearchUpdate = async (tinyurl) => {
		const url = endpoints.clearFavoriteSearchUpdate;
		return axiosPOST(this.axios, url, { tinyurl });
	};

	getDataForSearch = async (body, cancelToken) => {
		const url = endpoints.callGraphFunctionPOST;
		if (cancelToken) {
			return axiosPOST(
				this.axios,
				url,
				{
					functionName: 'getDataForSearch',
					...body,
				},
				{
					cancelToken: cancelToken?.token ? cancelToken.token : {},
				}
			);
		}
		return axiosPOST(this.axios, url, {
			functionName: 'getDataForSearch',
			...body,
		});
	};

	getDocumentsForEntity = async (cloneName, body) => {
		const url = endpoints.callGraphFunctionPOST;
		return axiosPOST(this.axios, url, {
			cloneName,
			functionName: 'getDocumentsForEntity',
			options: body,
		});
	};

	getDocumentsForTopic = async (cloneName, body) => {
		const url = endpoints.callGraphFunctionPOST;
		return axiosPOST(this.axios, url, {
			cloneName,
			functionName: 'getDocumentsForTopic',
			options: body,
		});
	};

	getTextSuggestion = async (body) => {
		const url = endpoints.textSuggestionPOST;
		return axiosPOST(this.axios, url, body);
	};

	getDescriptionFromWikipedia = async (title) => {
		const api = `https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${title}`;
		const body = { method: 'GET', dataType: 'json' };
		const myRequest = new Request(api, body);
		return await fetch(myRequest).then((res) => {
			return res.json();
		});
	};

	getAPIKeyRequestData = async () => {
		const url = endpoints.getAPIKeyRequestsGET;
		return axiosGET(this.axios, url);
	};

	revokeAPIKeyRequest = async (id) => {
		const url = endpoints.revokeAPIKeyRequestPOST;
		return axiosPOST(this.axios, url, { id });
	};

	updateAPIKeyDescription = async (description, key) => {
		const url = endpoints.updateAPIKeyDescriptionPOST;
		return axiosPOST(this.axios, url, { description, key });
	};

	approveRejectAPIKeyRequest = async (id, approve) => {
		const url = endpoints.approveRejectAPIKeyRequestPOST;
		return axiosPOST(this.axios, url, { id, approve });
	};

	createAPIKeyRequest = async (name, email, reason, clones) => {
		const url = endpoints.createAPIKeyRequestPOST;
		return axiosPOST(this.axios, url, { name, email, reason, clones });
	};

	updateUserAPIRequestLimit = async () => {
		const url = endpoints.updateUserAPIRequestLimit;
		return axiosGET(this.axios, url);
	};
	getCombinedSearchMode = async (cancelToken) => {
		const url = endpoints.combinedSearchMode;
		if (cancelToken) {
			return axiosGET(this.axios, url, {
				cancelToken: cancelToken?.token ? cancelToken.token : {},
			});
		}
		return axiosGET(this.axios, url);
	};

	setCombinedSearchMode = async (value) => {
		const url = endpoints.combinedSearchMode;
		const bodyValue = value ? 'true' : 'false';
		return axiosPOST(this.axios, url, { value: bodyValue });
	};

	getIntelligentAnswersMode = async () => {
		const url = endpoints.intelligentAnswers;
		return axiosGET(this.axios, url);
	};

	setIntelligentAnswersMode = async (value) => {
		const url = endpoints.intelligentAnswers;
		const bodyValue = value ? 'true' : 'false';
		return axiosPOST(this.axios, url, { value: bodyValue });
	};

	getEntitySearchMode = async () => {
		const url = endpoints.entitySearch;
		return axiosGET(this.axios, url);
	};

	setEntitySearchMode = async (value) => {
		const url = endpoints.entitySearch;
		const bodyValue = value ? 'true' : 'false';
		return axiosPOST(this.axios, url, { value: bodyValue });
	};

	getJiraFeedbackMode = async () => {
		const url = endpoints.jiraFeedback;
		return axiosGET(this.axios, url);
	};

	toggleJiraFeedbackMode = async () => {
		const url = endpoints.jiraFeedback;
		return axiosPOST(this.axios, url, {});
	};

	sendJiraFeedback = async (body) => {
		const url = endpoints.sendJiraFeedback;
		return axiosPOST(this.axios, url, body);
	};

	requestDocIngest = async (body) => {
		const url = endpoints.requestDocIngest;
		return axiosPOST(this.axios, url, body);
	};

	getLTRMode = async (cancelToken) => {
		const url = endpoints.ltr;
		if (cancelToken) {
			return axiosGET(this.axios, url, {
				cancelToken: cancelToken?.token ? cancelToken.token : {},
			});
		}
		return axiosGET(this.axios, url);
	};

	toggleLTR = async () => {
		const url = endpoints.ltr;
		return axiosPOST(this.axios, url, {});
	};

	getTopicSearchMode = async () => {
		const url = endpoints.topicSearch;
		return axiosGET(this.axios, url);
	};

	setTopicSearchMode = async (value) => {
		const url = endpoints.topicSearch;
		const bodyValue = value ? 'true' : 'false';
		return axiosPOST(this.axios, url, { value: bodyValue });
	};

	getDescriptionFromWikipedia(title) {
		const url = `https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${title}`;
		return axiosGET(this.axios, url);
	}

	sendIntelligentSearchFeedback = async (eventName, intelligentSearchTitle, searchText, sentenceResults) => {
		const url = endpoints.intelligentSearchFeedback;
		return axiosPOST(this.axios, url, {
			eventName,
			intelligentSearchTitle,
			searchText,
			sentenceResults,
		});
	};

	callGraphFunction = async (body) => {
		const url = endpoints.callGraphFunctionPOST;
		return axiosPOST(this.axios, url, body);
	};

	callSearchFunction = async (body, config) => {
		const url = endpoints.callSearchFunctionPOST;
		return axiosPOST(this.axios, url, body, config);
	};

	sendQAFeedback = async (eventName, question, answer, qaContext, params) => {
		const url = endpoints.qaSearchFeedback;
		return axiosPOST(this.axios, url, {
			eventName,
			question,
			answer,
			qaContext,
			params,
		});
	};

	getFeedbackData = async () => {
		const url = endpoints.getFeedbackData;
		return axiosGET(this.axios, url);
	};

	getThumbnail = async (body) => {
		const url = endpoints.getThumbnail;
		return axiosGET(this.axios, url, { params: body });
	};

	getWeeklySearchCount = async (body) => {
		const url = endpoints.getWeeklySearchCount;
		return axiosPOST(this.axios, url, body);
	};

	getHomepageEditorData = async (body) => {
		const url = endpoints.getHomepageEditorData;
		return axiosPOST(this.axios, url, body);
	};

	setHomepageEditorData = async (body) => {
		const url = endpoints.setHomepageEditorData;
		return axiosPOST(this.axios, url, body);
	};

	sendFrontendErrorPOST = async (error) => {
		const url = endpoints.sendFrontendErrorPOST;
		return axiosPOST(this.axios, url, error);
	};

	getOrgImageOverrideURLs = async (names) => {
		const url = endpoints.getOrgImageOverrideURLs;
		return axiosGET(this.axios, url, { params: { names } });
	};

	saveOrgImageOverrideURL = async ({ name, imageURL }) => {
		const url = endpoints.saveOrgImageOverrideURL;
		return axiosPOST(this.axios, url, { name, imageURL });
	};

	compareDocumentPOST = async ({ cloneName, paragraphs, filters }) => {
		const url = endpoints.compareDocumentPOST;
		return axiosPOST(this.axios, url, { cloneName, paragraphs, filters });
	};

	compareFeedbackPOST = async (data) => {
		const url = endpoints.compareFeedbackPOST;
		return axiosPOST(this.axios, url, data);
	};

	getFAQ = async () => {
		const url = endpoints.getFAQ;
		return axiosGET(this.axios, url);
	};

	initializeLTR = async () => {
		const url = endpoints.initializeLTR;
		return axiosGET(this.axios, url);
	};

	createModelLTR = async () => {
		const url = endpoints.createModelLTR;
		return axiosGET(this.axios, url);
	};

	getUserData = async (cloneName) => {
		const url = endpoints.gcUserDataGET;
		return axiosPOST(this.axios, url, { cloneName });
	};

	storeUserData = async (userData) => {
		const url = endpoints.gcUserDataPOST;
		return axiosPOST(this.axios, url, { userData, fromApp: true });
	};

	deleteUserData = async (userRowId) => {
		const url = endpoints.gcUserDataDeletePOST;
		return axiosPOST(this.axios, url, { userRowId });
	};

	syncUserTable = async () => {
		const url = endpoints.syncUserTableGET;
		return axiosGET(this.axios, url);
	};

	updateClonesVisited = async (clone) => {
		const url = endpoints.updateClonesVisitedPOST;
		return axiosPOST(this.axios, url, { clone });
	};

	callDataFunction = async (body) => {
		const url = endpoints.callDataFunctionPOST;
		return axiosPOST(this.axios, url, body);
	};

	queryExp = async (data) => {
		const querydata = { searchText: data };
		const url = endpoints.queryExp;
		return axiosPOST(this.axios, url, (data = querydata));
	};

	getReviewerData = async () => {
		const url = endpoints.reviewerDataGET;
		return axiosGET(this.axios, url);
	};

	deleteReviewerData = async (reviewerRowId) => {
		const url = endpoints.reviewerDataDeletePOST;
		return axiosPOST(this.axios, url, { reviewerRowId });
	};

	storeReviewerData = async (reviewerData) => {
		const url = endpoints.reviewerDataPOST;
		return axiosPOST(this.axios, url, { reviewerData, fromApp: true });
	};

	exportReview = async (body) => {
		const url = endpoints.exportReview;
		const options = { responseType: 'blob' };
		return axiosPOST(this.axios, url, body, options);
	};

	exportChecklist = async (body) => {
		const url = endpoints.exportChecklist;
		const options = { responseType: 'blob' };
		return axiosPOST(this.axios, url, body, options);
	};

	sendReviewStatusUpdates = async (data) => {
		const url = endpoints.sendReviewStatusUpdates;
		return axiosPOST(this.axios, url, data);
	};

	exportProfilePage = async (body) => {
		const url = endpoints.exportProfilePage;
		const options = {}; //{responseType: 'blob'};
		return axiosPOST(this.axios, url, body, options);
	};

	getUserFavoriteHomeApps = async () => {
		const url = endpoints.getUserFavoriteHomeApps; //`${Config.HOME_APP_BASE_URL}${endpoints.getUserFavoriteHomeApps}`;
		return axiosGET(this.axios, url);
	};

	putUserFavoriteHomeApps = async (data) => {
		const url = endpoints.getUserFavoriteHomeApps; //`${Config.HOME_APP_BASE_URL}${endpoints.getUserFavoriteHomeApps}`;
		return axiosPUT(this.axios, url, data);
	};
}
