const INTERNAL_USER_TRACKING = require('../models').internal_user_tracking;
const GC_USER = require('../models').gc_user;
const USER = require('../models').user;
const JBOOK_USER = require('../models').jbook_user;
const FAVORITE_DOCUMENT = require('../models').favorite_documents;
const FAVORITE_SEARCH = require('../models').favorite_searches;
const FAVORITE_TOPIC = require('../models').favorite_topics;
const FAVORITE_GROUP = require('../models').favorite_groups;
const FAVORITE_ORGANIZATION = require('../models').favorite_organizations;
const FAVORITE_DOCUMENTS_GROUP = require('../models').favorite_documents_groups;
const GC_HISTORY = require('../models').gc_history;
const EXPORT_HISTORY = require('../models').export_history;
const LOGGER = require('@dod-advana/advana-logger');
const sparkMD5Lib = require('spark-md5');
const SearchUtility = require('../utils/searchUtility');
const { SearchController } = require('./searchController');
const { ExternalAPIController } = require('./externalAPI/externalAPIController');
const EmailUtility = require('../utils/emailUtility');
const constantsFile = require('../config/constants');
const { DataLibrary } = require('../lib/dataLibrary');
const { AppStatsController } = require('../controllers/appStatsController');
const Sequelize = require('sequelize');
const { getUserIdFromSAMLUserId } = require('../utils/userUtility');
const constants = require('../config/constants');
const { user_app_versions } = require('../models');
const Op = Sequelize.Op;
const ApiKeyRequests = require('../models').api_key_request;
const ApiKey = require('../models').api_key;
const FEEDBACK = require('../models').feedback;
const GC_ASSISTS = require('../models').gc_assists;
const USER_APP_VERSIONS = require('../models').user_app_versions;

class UserController {
	constructor(opts = {}) {
		const {
			constants = constantsFile,
			logger = LOGGER,
			internalUserTracking = INTERNAL_USER_TRACKING,
			sparkMD5 = sparkMD5Lib,
			gcUser = GC_USER,
			favoriteDocument = FAVORITE_DOCUMENT,
			favoriteSearch = FAVORITE_SEARCH,
			favoriteTopic = FAVORITE_TOPIC,
			favoriteGroup = FAVORITE_GROUP,
			favoriteOrganization = FAVORITE_ORGANIZATION,
			favoriteDocumentsGroup = FAVORITE_DOCUMENTS_GROUP,
			gcHistory = GC_HISTORY,
			exportHistory = EXPORT_HISTORY,
			searchUtility = new SearchUtility(opts),
			search = new SearchController(opts),
			sequelize = new Sequelize(constantsFile.POSTGRES_CONFIG.databases.game_changer),
			externalAPI = new ExternalAPIController(opts),
			appStats = new AppStatsController(opts),
			dataApi = new DataLibrary(opts),
			apiKeyRequests = ApiKeyRequests,
			apiKey = ApiKey,
			feedback = FEEDBACK,
			gcAssists = GC_ASSISTS,
			user = USER,
			jbook_user = JBOOK_USER,
			user_app_versions = USER_APP_VERSIONS,
		} = opts;

		this.logger = logger;
		this.internalUserTracking = internalUserTracking;
		this.sparkMD5 = sparkMD5;
		this.gcUser = gcUser;
		this.favoriteDocument = favoriteDocument;
		this.favoriteSearch = favoriteSearch;
		this.favoriteTopic = favoriteTopic;
		this.favoriteGroup = favoriteGroup;
		this.favoriteOrganization = favoriteOrganization;
		this.favoriteDocumentsGroup = favoriteDocumentsGroup;
		this.gcHistory = gcHistory;
		this.exportHistory = exportHistory;
		this.searchUtility = searchUtility;
		this.search = search;
		this.sequelize = sequelize;
		this.externalAPI = externalAPI;
		this.appStats = appStats;
		this.constants = constants;
		this.dataApi = dataApi;
		this.apiKeyRequests = apiKeyRequests;
		this.apiKey = apiKey;
		this.feedback = feedback;
		this.gcAssists = gcAssists;
		this.user = user;
		this.jbookUser = jbook_user;
		this.user_app_versions = user_app_versions;

		let transportOptions = constants.ADVANA_EMAIL_TRANSPORT_OPTIONS;

		//apply TLS configs to smtp transport as appropriate from env vars
		if (process.env.EMAIL_REQUIRE_TLS?.toUpperCase() === 'TRUE') {
			transportOptions.requireTLS = process.env.EMAIL_REQUIRE_TLS;
			transportOptions.tls = {
				servername: process.env.EMAIL_TLS_SERVERNAME || '',
			};
		}

		this.emailUtility = new EmailUtility({
			transportOptions,
			fromName: constants.ADVANA_EMAIL_CONTACT_NAME,
			fromEmail: constants.ADVANA_NOREPLY_EMAIL_ADDRESS,
		});

		this.deleteInternalUser = this.deleteInternalUser.bind(this);
		this.syncUserTable = this.syncUserTable.bind(this);
		this.getInternalUsers = this.getInternalUsers.bind(this);
		this.submitUserInfo = this.submitUserInfo.bind(this);
		this.getUserSettings = this.getUserSettings.bind(this);
		this.getUserData = this.getUserData.bind(this);
		this.getUserDataForUserList = this.getUserDataForUserList.bind(this);
		this.updateOrCreateUser = this.updateOrCreateUser.bind(this);
		this.updateOrCreateUserHelper = this.updateOrCreateUserHelper.bind(this);
		this.sendFeedback = this.sendFeedback.bind(this);
		this.sendClassificationAlert = this.sendClassificationAlert.bind(this);
		this.clearDashboardNotification = this.clearDashboardNotification.bind(this);
		this.updateUserAPIRequestLimit = this.updateUserAPIRequestLimit.bind(this);
		this.resetAPIRequestLimit = this.resetAPIRequestLimit.bind(this);
		this.getRecentSearches = this.getRecentSearches.bind(this);
		this.getUserProfileData = this.getUserProfileData.bind(this);
		this.updateUserProfileData = this.updateUserProfileData.bind(this);
		this.syncUserHelper = this.syncUserHelper.bind(this);
		this.updateClonesVisited = this.updateClonesVisited.bind(this);
		this.setupUserProfile = this.setupUserProfile.bind(this);
		this.postUserAppVersion = this.postUserAppVersion.bind(this);
		this.deleteUserData = this.deleteUserData.bind(this);
	}

	async getUserProfileData(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const user_id = getUserIdFromSAMLUserId(req);

			const user = await this.user.findOne({
				attributes: [
					'id',
					'first_name',
					'last_name',
					'email',
					'organization',
					'phone_number',
					'preferred_name',
					'sub_office',
					'country',
					'state',
					'city',
					'job_title',
					'extra_fields',
				],
				where: { user_id: user_id },
				raw: true,
			});
			return res.status(200).send(user);
		} catch (err) {
			this.logger.error(err, 'BGNU8KA', userId);
			res.status(500).send(`Error getting user profile data: ${err.message}`);
		}
	}

	async updateUserProfileData(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const user_id = getUserIdFromSAMLUserId(req);
			const { userData } = req.body;

			const user = await this.user.findOne({ where: { user_id: user_id } });

			if (user) {
				user.first_name = userData.first_name;
				user.last_name = userData.last_name;
				user.organization = userData.organization;
				user.sub_office = userData.sub_office;
				user.email = userData.email;
				user.phone_number = userData.phone_number;
				user.preferred_name = userData.preferred_name;
				user.country = userData.country;
				user.state = userData.state;
				user.city = userData.city;
				user.job_title = userData.job_title;
				user.extra_fields = userData.extra_fields;
				await user.save();

				return res.sendStatus(200);
			} else {
				return res.status(404).send('User not found');
			}
		} catch (err) {
			this.logger.error(err, '6LFTX8V', userId);
			res.status(500).send(`Error updating user profile data: ${err.message}`);
		}
	}

	async updateUserVisited(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const user_id = getUserIdFromSAMLUserId(req);
			const { userData } = req.body;

			const user = await this.user.findOne({ where: { user_id: user_id } });

			if (user) {
				user.first_name = userData.first_name;
				user.last_name = userData.last_name;
				user.organization = userData.organization;
				user.sub_office = userData.sub_office;
				user.email = userData.email;
				user.phone_number = userData.phone_number;
				user.preferred_name = userData.preferred_name;
				user.country = userData.country;
				user.state = userData.state;
				user.city = userData.city;
				user.job_title = userData.job_title;
				user.extra_fields = userData.extra_fields;
				await user.save();

				return res.sendStatus(200);
			} else {
				return res.status(404).send('User not found');
			}
		} catch (err) {
			this.logger.error(err, '6LFTX8V', userId);
			res.status(500).send(`Error updating user profile data: ${err.message}`);
		}
	}

	async getUserDataForUserList(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const { cloneName } = req.body;

			const results = await this.user.findAll({
				attributes: [
					'id',
					'first_name',
					'last_name',
					'email',
					'organization',
					'phone_number',
					'extra_fields',
					'is_super_admin',
				],
				raw: true,
			});

			const fieldsToIgnore = ['clones_visited'];

			let filteredResults = results.map((result) => {
				let is_admin = false;
				Object.keys(result.extra_fields).forEach((extraKey) => {
					if (
						!fieldsToIgnore.includes(extraKey) &&
						result.extra_fields[extraKey].hasOwnProperty('is_admin')
					) {
						if (result.extra_fields[extraKey].is_admin) {
							is_admin = true;
						}
					}
				});

				return { ...result, is_admin };
			});

			if (cloneName) {
				filteredResults = filteredResults.filter((result) => {
					if (result.extra_fields.clones_visited) {
						return result.extra_fields.clones_visited.includes(cloneName);
					} else {
						return false;
					}
				});
			}

			res.status(200).send({ users: filteredResults, timeStamp: new Date().toISOString() });
		} catch (err) {
			this.logger.error(err, 'RQ0WSQP', userId);
			res.status(500).send(`Error getting users: ${err.message}`);
		}
	}

	async updateClonesVisited(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const user_id = getUserIdFromSAMLUserId(req);
			const { clone } = req.body;

			const user = await this.user.findOne({ where: { user_id: user_id }, raw: true });

			if (user && user !== null) {
				if (user.extra_fields.hasOwnProperty('clones_visited')) {
					if (!user.extra_fields.clones_visited.includes(clone)) {
						user.extra_fields.clones_visited.push(clone);
						await this.updateOrCreateUserHelper(user, user_id, true);
					}
				} else {
					user.extra_fields['clones_visited'] = [clone];
					await this.updateOrCreateUserHelper(user, user_id, true);
				}
			}

			res.sendStatus(200);
		} catch (err) {
			this.logger.error(err, 'CFHGJJ4', userId);
			res.status(500).send(`Error updating clones visited: ${err.message}`);
		}
	}

	async getUserData(req, res) {
		let userId = 'Unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const user_id = getUserIdFromSAMLUserId(req);
			let user = await this.user.findOne({
				where: { user_id: user_id },
				defaults: {
					user_id: user_id,
					notifications: {},
				},
				raw: true,
			});
			if (user) {
				const favorite_documents = await this.favoriteDocument.findAll({
					where: { user_id: user.user_id },
					raw: true,
				});

				const favorite_searches = await this.favoriteSearch.findAll({
					where: { user_id: user.user_id },
					order: [['id', 'DESC']],
					raw: true,
				});

				const favorite_topics = await this.favoriteTopic.findAll({
					where: { user_id: user.user_id },
					raw: true,
				});

				const favorite_groups = await this.favoriteGroup.findAll({
					where: { user_id: user.user_id },
					raw: true,
				});

				favorite_groups.forEach(async (group, index) => {
					const res = await this.favoriteDocumentsGroup.findAll({
						attributes: ['favorite_document_id'],
						where: { favorite_group_id: group.id },
						raw: true,
					});
					const favoriteList = [];
					res.forEach((fav) => favoriteList.push(fav.favorite_document_id));
					favorite_groups[index].favorites = favoriteList;
				});
				user.favorite_groups = favorite_groups;

				const favorite_organizations = await this.favoriteOrganization.findAll({
					where: { user_id: user.user_id },
					raw: true,
				});

				const search_history = await this.gcHistory.findAll({
					where: {
						user_id: user.user_id,
						is_tutorial_search: false,
						tiny_url: { [Op.ne]: null },
					},
					order: [['id', 'DESC']],
					limit: 20,
					raw: true,
				});
				const export_history = await this.exportHistory.findAll({
					raw: true,
					limit: 5,
					where: { user_id: user.user_id },
					order: [['updatedAt', 'DESC']],
				});
				const hashed_user = this.sparkMD5.hash(user.user_id);
				const pdf_opened = await this.appStats.getUserLastOpened(hashed_user);
				user.pdf_opened = pdf_opened;

				if (favorite_documents) {
					for (const doc of favorite_documents) {
						const countData = await this.favoriteDocument.findAll({
							attributes: [
								[
									this.favoriteDocument.sequelize.fn(
										'COUNT',
										this.favoriteDocument.sequelize.col('id')
									),
									'favorited_count',
								],
							],
							where: { filename: doc.filename },
							raw: true,
						});

						doc.favorited = countData[0].favorited_count;
					}

					const index = [
						this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.index,
						this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.legislation_index,
						this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.assist_index,
					];

					const filenames = favorite_documents.map((doc) => {
						return doc.filename;
					});

					const esQuery = {
						_source: {
							includes: ['download_url_s'],
						},
						stored_fields: ['filename', 'title', 'id', 'summary_30', 'doc_type', 'doc_num'],
						size: favorite_documents.length,
						query: {
							terms: { filename: filenames },
						},
					};

					let esClientName = 'gamechanger';
					const results = await this.dataApi.queryElasticSearch(esClientName, index, esQuery, userId);

					const returnDocsTemp = [];

					results.body.hits.hits.forEach((hit) => {
						returnDocsTemp.push({
							filename: hit.fields.filename[0],
							summary: hit.fields.summary_30[0],
							title: hit.fields.title[0],
							doc_type: hit.fields.doc_type[0],
							doc_num: hit.fields.doc_num[0],
							id: hit.fields.id[0],
							download_url_s: hit._source.download_url_s,
						});
					});

					const returnDocs = [];
					favorite_documents.forEach((doc) => {
						const docData = returnDocsTemp.find((data) => data.filename === doc.filename);
						if (docData) {
							doc.favorite_id = doc.id;
							doc.title = `${docData.doc_type} ${docData.doc_num} ${docData.title}`;
							doc.doc_type = docData.doc_type;
							doc.doc_num = docData.doc_num;
							doc.id = docData.id;
							doc.summary = docData.summary;
							doc.download_url_s = docData.download_url_s;
							returnDocs.push(doc);
						}
					});

					user.favorite_documents = returnDocs;
				} else {
					user.favorite_documents = [];
				}

				const favorite_urls = [];
				if (favorite_searches) {
					for (const search of favorite_searches) {
						const countData = await this.favoriteSearch.findAll({
							attributes: [
								[
									this.favoriteSearch.sequelize.fn('COUNT', this.favoriteSearch.sequelize.col('id')),
									'favorited_count',
								],
							],
							where: { tiny_url: search.tiny_url },
							raw: true,
						});
						favorite_urls.push(search.tiny_url);
						search.favorited = countData[0].favorited_count;
						const tiny = this.searchUtility.getQueryVariable('tiny', search.tiny_url);
						const url = await this.search.convertTiny(tiny);
						if (url) {
							search.url = url.url;
						}
					}

					user.favorite_searches = favorite_searches;
				} else {
					user.favorite_searches = [];
				}

				if (favorite_topics) {
					for (const topic of favorite_topics) {
						const countData = await this.favoriteTopic.findAll({
							attributes: [
								[
									this.favoriteTopic.sequelize.fn('COUNT', this.favoriteTopic.sequelize.col('id')),
									'favorited_count',
								],
							],
							where: { topic_name: topic.topic_name },
							raw: true,
						});
						topic.favorited = countData[0].favorited_count;
					}
					user.favorite_topics = favorite_topics;
				} else {
					user.favorite_topics = [];
				}

				if (favorite_organizations) {
					for (const org of favorite_organizations) {
						const countData = await this.favoriteOrganization.findAll({
							attributes: [
								[
									this.favoriteOrganization.sequelize.fn(
										'COUNT',
										this.favoriteOrganization.sequelize.col('id')
									),
									'favorited_count',
								],
							],
							where: { organization_name: org.organization_name },
							raw: true,
						});
						org.favorited = countData[0].favorited_count;
					}
					user.favorite_organizations = favorite_organizations;
				} else {
					user.favorite_organizations = [];
				}

				if (search_history) {
					const history = [];
					const urls = [];
					for (const search of search_history) {
						if (!urls.includes(search.tiny_url)) {
							search.favorite = favorite_urls.includes(search.tiny_url);
							const tiny = this.searchUtility.getQueryVariable('tiny', search.tiny_url);
							const url = await this.search.convertTiny(tiny);
							if (url) {
								search.url = url.url;
								history.push(search);
								urls.push(search.tiny_url);
							}
						}
					}
					user.search_history = history;
				} else {
					user.search_history = [];
				}

				const api_key = await this.externalAPI.getAPIKey(user_id);
				user.api_key = api_key;

				if (export_history) {
					user.export_history = export_history;
				} else {
					user.export_history = [];
				}
			} else {
				user = {
					user_id: user_id,
					notifications: {},
				};
				user.favorite_documents = [];
				user.favorite_searches = [];
				user.search_history = [];
				user.export_history = [];
				user.pdf_opened = [];
				user.api_key = '';
			}

			res.send(user);
		} catch (err) {
			this.logger.error(err, 'NG6CETF', userId);
			res.status(500).send(err);
			return err;
		}
	}

	async updateOrCreateUser(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const { userData, fromApp } = req.body;
			res.status(200).send(await this.updateOrCreateUserHelper(userData, userId, fromApp));
		} catch (err) {
			this.logger.error(err, 'VFA1YU7', userId);
			res.status(500).send(`Error adding or updating user: ${err.message}`);
		}
	}

	async updateOrCreateUserHelper(userData, userId, fromApp = false) {
		try {
			let foundItem;

			const user_id = !fromApp ? getUserIdFromSAMLUserId(userData.id, false) : userId;

			if (fromApp) {
				foundItem = await this.user.findOne({ where: { id: userData.id }, raw: true });
			} else {
				foundItem = await this.user.findOne({ where: { user_id: user_id }, raw: true });
			}

			if (!foundItem) {
				if (fromApp) {
					await this.user.create(userData);
				} else {
					// Migrate the users data from the old GC table
					const oldGCUserInfo = await this.syncUserHelper({ user_id, cn: userData.cn });

					const tmpExtraFields = { gamechanger: oldGCUserInfo.policy || {} };

					// Bring in jbook user info we want into extra fields and update the main user info with jbook info if available
					tmpExtraFields['jbook'] = {
						is_primary_reviewer: oldGCUserInfo.jbook ? oldGCUserInfo.jbook.is_primary_reviewer : false,
						is_service_reviewer: oldGCUserInfo.jbook ? oldGCUserInfo.jbook.is_service_reviewer : false,
						is_poc_reviewer: oldGCUserInfo.jbook ? oldGCUserInfo.jbook.is_poc_reviewer : false,
						is_admin: oldGCUserInfo.jbook ? oldGCUserInfo.jbook.is_admin : false,
					};

					const newUser = {
						user_id: user_id,
						first_name: oldGCUserInfo.jbook
							? oldGCUserInfo.jbook.first_name &&
							  oldGCUserInfo.jbook.first_name !== null &&
							  oldGCUserInfo.jbook.first_name !== ''
								? oldGCUserInfo.jbook.first_name
								: userData.firstName
							: userData.firstName,
						last_name: oldGCUserInfo.jbook
							? oldGCUserInfo.jbook.last_name &&
							  oldGCUserInfo.jbook.last_name !== null &&
							  oldGCUserInfo.jbook.last_name !== ''
								? oldGCUserInfo.jbook.last_name
								: userData.lastName
							: userData.lastName,
						organization: oldGCUserInfo.jbook
							? oldGCUserInfo.jbook.organization &&
							  oldGCUserInfo.jbook.organization !== null &&
							  oldGCUserInfo.jbook.organization !== ''
								? oldGCUserInfo.jbook.organization
								: null
							: null,
						email: oldGCUserInfo.jbook
							? oldGCUserInfo.jbook.email &&
							  oldGCUserInfo.jbook.email !== null &&
							  oldGCUserInfo.jbook.email !== ''
								? oldGCUserInfo.jbook.email
								: null
							: null,
						phone_number: oldGCUserInfo.jbook
							? oldGCUserInfo.jbook.phone_number &&
							  oldGCUserInfo.jbook.phone_number !== null &&
							  oldGCUserInfo.jbook.phone_number !== ''
								? oldGCUserInfo.jbook.phone_number
								: null
							: null,
						sub_office: oldGCUserInfo.jbook
							? oldGCUserInfo.jbook.sub_office &&
							  oldGCUserInfo.jbook.sub_office !== null &&
							  oldGCUserInfo.jbook.sub_office !== ''
								? oldGCUserInfo.jbook.sub_office
								: null
							: null,
						country: oldGCUserInfo.jbook
							? oldGCUserInfo.jbook.country &&
							  oldGCUserInfo.jbook.country !== null &&
							  oldGCUserInfo.jbook.country !== ''
								? oldGCUserInfo.jbook.country
								: null
							: null,
						state: oldGCUserInfo.jbook
							? oldGCUserInfo.jbook.state &&
							  oldGCUserInfo.jbook.state !== null &&
							  oldGCUserInfo.jbook.state !== ''
								? oldGCUserInfo.jbook.state
								: null
							: null,
						city: oldGCUserInfo.jbook
							? oldGCUserInfo.jbook.city &&
							  oldGCUserInfo.jbook.city !== null &&
							  oldGCUserInfo.jbook.city !== ''
								? oldGCUserInfo.jbook.city
								: null
							: null,
						job_title: oldGCUserInfo.jbook
							? oldGCUserInfo.jbook.job_title &&
							  oldGCUserInfo.jbook.job_title !== null &&
							  oldGCUserInfo.jbook.job_title !== ''
								? oldGCUserInfo.jbook.job_title
								: null
							: null,
						preferred_name: oldGCUserInfo.jbook
							? oldGCUserInfo.jbook.preferred_name &&
							  oldGCUserInfo.jbook.preferred_name !== null &&
							  oldGCUserInfo.jbook.preferred_name !== ''
								? oldGCUserInfo.jbook.preferred_name
								: null
							: null,
						cn: userData.cn,
						extra_fields: tmpExtraFields,
					};

					await this.user.create(newUser);
				}
				return true;
			} else {
				if (fromApp) {
					await this.user.update(userData, { where: { id: userData.id } });
				} else {
					const tempUser = { ...foundItem };

					if (
						(!tempUser.first_name || tempUser.first_name === null || tempUser.first_name === '') &&
						userData.firstName
					)
						tempUser.first_name = userData.firstName;
					if (
						(!tempUser.last_name || tempUser.last_name === null || tempUser.last_name === '') &&
						userData.lastName
					)
						tempUser.last_name = userData.lastName;
					if ((!tempUser.cn || tempUser.cn === null || tempUser.cn === '') && userData.cn)
						tempUser.cn = userData.cn;

					await this.user.update(tempUser, { where: { user_id: user_id } });
				}
			}

			return true;
		} catch (err) {
			this.logger.error(err, '2XY95Z7', userId);
			return false;
		}
	}

	async deleteUserData(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const { userRowId } = req.body;
			const user = await this.user.findOne({ where: { id: userRowId } });
			await user.destroy();

			res.status(200).send({ deleted: true });
		} catch (err) {
			this.logger.error(err, 'HZSJ075', userId);
			res.status(500).send(`Error delete user: ${err.message}`);
		}
	}

	async setupUserProfile(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const user_id = getUserIdFromSAMLUserId(req);
			const { email, permissions } = req.body;
			const userRequest = await this.userRequest.findOne({ where: { email: email }, raw: true });

			if (userRequest && !userRequest.is_activated) {
				const user = await this.user.findOne({ where: { user_id: user_id }, raw: true });

				if (user) {
					user.organization = userRequest.organization;
					user.email = email;
					user.phone_number = userRequest.phone_number;

					permissions.forEach((permission) => {
						switch (permission) {
							case 'PrimaryReviewer':
								user.is_primary_reviewer = true;
								break;
							case 'ServiceReviewer':
								user.is_service_reviewer = true;
								break;
							case 'POCReviewer':
								user.is_poc_reviewer = true;
								break;
							default:
								break;
						}
					});

					userRequest.is_activated = true;

					await this.userRequest.update(userRequest, { where: { id: userRequest.id } });
					await this.user.update(user, { where: { id: user.id } });

					return res.status(200).send({ setup: true });
				}
			}

			res.status(200).send({ setup: false });
		} catch (err) {
			this.logger.error(err, 'AXJ1YXX', userId);
			res.status(500).send(`Error setting up user: ${err.message}`);
		}
	}

	async syncUserTable(req, res) {
		let userId = 'webapp_unknown';

		try {
			// First pull all the users that have a CN as that means they are using new system
			const newUsers = await this.user.findAll({
				where: {
					cn: {
						[Op.not]: null,
					},
				},
				raw: true,
			});

			console.log(newUsers);

			// Loop through new users
			for (const user of newUsers) {
				await this.syncUserHelper(user, userId);
			}

			res.status(200).send({ syncd: true });
		} catch (err) {
			this.logger.error(err, 'K4822BB', userId);
			res.status(500).send(`Error delete user: ${err.message}`);
		}
	}

	async syncUserHelper(user, userId) {
		try {
			const decoupledUserIdHashed = this.sparkMD5.hash(user.cn);
			const coupledUserIDWithAtMilHashed = this.sparkMD5.hash(`${user.user_id}@mil`);
			const coupledUserIDHashed = this.sparkMD5.hash(user.user_id);

			const hashedIds = [decoupledUserIdHashed, coupledUserIDWithAtMilHashed, coupledUserIDHashed];

			// Pull any users that match these ids
			let finalOldUser = {};

			let oldUsers = await this.gcUser.findAll({
				where: {
					user_id: {
						[Op.in]: hashedIds,
					},
				},
				raw: true,
			});

			if (oldUsers.length > 0) {
				// Combine basic user data and delete the old user
				for (const oldUser of oldUsers) {
					const nonHashedIds = [user.cn, `${user.user_id}@mil`];
					const allIds = hashedIds.concat(nonHashedIds);

					// API Key Requests
					let foundRecords = await this.apiKeyRequests.findAll({
						where: {
							username: {
								[Op.in]: allIds,
							},
						},
						raw: true,
					});

					for (const apiKeyRequest of foundRecords) {
						apiKeyRequest.username = user.user_id;
						await this.apiKeyRequests.update(apiKeyRequest, { where: { id: apiKeyRequest.id } });
					}

					// API Keys
					foundRecords = await this.apiKey.findAll({
						where: {
							username: {
								[Op.in]: allIds,
							},
						},
						raw: true,
					});

					for (const apiKey of foundRecords) {
						apiKey.username = user.user_id;
						await this.apiKey.update(apiKey, { where: { id: apiKey.id } });
					}

					// Export History
					foundRecords = await this.exportHistory.findAll({
						where: {
							user_id: {
								[Op.in]: allIds,
							},
						},
						raw: true,
					});

					for (const history of foundRecords) {
						history.user_id = user.user_id;
						await this.exportHistory.update(history, { where: { id: history.id } });
					}

					// Favorite Documents
					foundRecords = await this.favoriteDocument.findAll({
						where: {
							user_id: {
								[Op.in]: allIds,
							},
						},
						raw: true,
					});

					for (const favorite of foundRecords) {
						favorite.user_id = user.user_id;
						await this.favoriteDocument.update(favorite, { where: { id: favorite.id } });
					}

					// Favorite Documents Group
					foundRecords = await this.favoriteDocumentsGroup.findAll({
						where: {
							user_id: {
								[Op.in]: allIds,
							},
						},
						raw: true,
					});

					for (const favorite of foundRecords) {
						favorite.user_id = user.user_id;
						await this.favoriteDocumentsGroup.update(favorite, { where: { id: favorite.id } });
					}

					// Favorite Groups
					foundRecords = await this.favoriteGroup.findAll({
						where: {
							user_id: {
								[Op.in]: allIds,
							},
						},
						raw: true,
					});

					for (const favorite of foundRecords) {
						favorite.user_id = user.user_id;
						await this.favoriteGroup.update(favorite, { where: { id: favorite.id } });
					}

					// Favorite Organizations
					foundRecords = await this.favoriteOrganization.findAll({
						where: {
							user_id: {
								[Op.in]: allIds,
							},
						},
						raw: true,
					});

					for (const favorite of foundRecords) {
						favorite.user_id = user.user_id;
						await this.favoriteOrganization.update(favorite, { where: { id: favorite.id } });
					}

					// Favorite Searches
					foundRecords = await this.favoriteSearch.findAll({
						where: {
							user_id: {
								[Op.in]: allIds,
							},
						},
						raw: true,
					});

					for (const favorite of foundRecords) {
						favorite.user_id = user.user_id;
						await this.favoriteSearch.update(favorite, { where: { id: favorite.id } });
					}

					// Favorite Topics
					foundRecords = await this.favoriteTopic.findAll({
						where: {
							user_id: {
								[Op.in]: allIds,
							},
						},
						raw: true,
					});

					for (const favorite of foundRecords) {
						favorite.user_id = user.user_id;
						await this.favoriteTopic.update(favorite, { where: { id: favorite.id } });
					}

					// Feedback
					foundRecords = await this.feedback.findAll({
						where: {
							user_id: {
								[Op.in]: allIds,
							},
						},
						raw: true,
					});

					for (const feedback of foundRecords) {
						feedback.user_id = user.user_id;
						await this.feedback.update(feedback, { where: { id: feedback.id } });
					}

					// GC Assists
					foundRecords = await this.gcAssists.findAll({
						where: {
							user_id: {
								[Op.in]: allIds,
							},
						},
						raw: true,
					});

					for (const assist of foundRecords) {
						assist.user_id = user.user_id;
						await this.gcAssists.update(assist, { where: { id: assist.id } });
					}

					// GC History
					foundRecords = await this.gcHistory.findAll({
						where: {
							user_id: {
								[Op.in]: allIds,
							},
						},
						raw: true,
					});

					for (const history of foundRecords) {
						history.user_id = user.user_id;
						await this.gcHistory.update(history, { where: { id: history.id } });
					}

					// Update old user id
					if (!finalOldUser['gamechanger']) {
						finalOldUser['gamechanger'] = {
							is_beta: oldUser.is_beta,
							notifications: oldUser.notifications,
							api_requests: oldUser.api_requests,
							submitted_info: oldUser.submitted_info,
							is_internal: oldUser.is_internal,
							is_admin: oldUser.is_admin,
						};
						finalOldUser.user_id = user.user_id;
						delete finalOldUser.id;
					} else {
						if (oldUser.is_beta != null) finalOldUser['gamechanger'].is_beta = oldUser.is_beta;
						if (oldUser.notifications != null)
							finalOldUser['gamechanger'].notifications = oldUser.notifications;
						if (oldUser.api_requests != null)
							finalOldUser['gamechanger'].api_requests = oldUser.api_requests;
						if (oldUser.submitted_info != null)
							finalOldUser['gamechanger'].submitted_info = oldUser.submitted_info;
						if (oldUser.is_internal != null) finalOldUser['gamechanger'].is_internal = oldUser.is_internal;
						if (oldUser.is_admin != null) finalOldUser['gamechanger'].is_admin = oldUser.is_admin;
					}

					await this.gcUser.destroy({
						where: {
							id: oldUser.id,
						},
					});
				}
			}

			oldUsers = await this.jbookUser.findOne({
				where: {
					user_id: user.user_id,
				},
				raw: true,
			});

			if (oldUsers && oldUsers !== null) {
				finalOldUser['jbook'] = {
					...oldUsers,
				};
			}

			return finalOldUser || {};
		} catch (err) {
			this.logger.error(err, 'Z70XSYL', userId);
			return {};
		}
	}

	async getUserSettings(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const user_id = getUserIdFromSAMLUserId(req);

			const user = await this.gcUser.findOne({
				where: { user_id: user_id },
				raw: true,
			});

			if (user) {
				user.submitted_info = true;
			}

			res.status(200).send(user);
		} catch (err) {
			this.logger.error(err.message, 'ZX1SWBU', userId);
			res.status(500).send(err);
		}
	}

	async submitUserInfo(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const user_id = getUserIdFromSAMLUserId(req);

			await this.gcUser.update(
				{
					user_info: req.body,
					submitted_info: true,
				},
				{
					where: {
						user_id: user_id,
					},
				}
			);
			res.status(200).send();
		} catch (err) {
			this.logger.error(err.message, '9BVU0H1', userId);
			res.status(500).send(err);
		}
	}

	async getInternalUsers(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const internalUsers = await this.internalUserTracking.findAll();
			res.status(200).send(internalUsers);
		} catch (err) {
			this.logger.error(err, '8QJXVTA', userId);
			res.status(500).send(`Error getting internal users list: ${err.message}`);
		}
	}

	async deleteInternalUser(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const deleted = this.internalUserTracking.destroy({
				where: {
					id: req.body.id,
				},
			});

			res.status(200).send(deleted);
		} catch (err) {
			this.logger.error(err, 'GZMUW3T', userId);
			res.status(500).send(`Error deleting internal user: ${err.message}`);
		}
	}

	async sendFeedback(req, res) {
		let userId = 'Unknown_Webapp';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const { feedbackType, feedbackText, screenShot, userEmail } = req.body.feedbackData;
			const emailBody = `
				<img src="cid:gc-user-feedback" width="100%"/><br/>
				<h2>Feedback Received</h2>
				<h4>Type: ${feedbackType}</h4>
				<p>${feedbackText}</p>
				${screenShot && screenShot !== '' ? `<p>${screenShot}</p>` : null}
				<p>**********</p>
				<p>Thank you for your feedback! A member of our team will contact you shortly to provide an update on your feedback or seek further information as needed.</p>
				<p>v/r,</p>
				<p>The GAMECHANGER Team</p>
				<img src="cid:gc-footer" width="100%"/><br/>
			`;
			const attachment = [
				{
					filename: 'GAMECHANGER User Feedback.png',
					path: __dirname + '/../images/email/GAMECHANGER User Feedback.png',
					cid: 'gc-user-feedback',
				},
				{
					filename: 'GC-footer.png',
					path: __dirname + '/../images/email/GC-footer.png',
					cid: 'gc-footer',
				},
			];
			this.logger.info(`User Feedback from ${userEmail}: ${emailBody} `);
			this.emailUtility
				.sendEmail(
					emailBody,
					`GAMECHANGER: User Feedback`,
					this.constants.GAME_CHANGER_OPTS.emailAddress,
					userEmail,
					attachment,
					userId
				)
				.then((success) => {
					res.status(200).send({ status: 'good' });
				})
				.catch((failure) => {
					res.status(500).send({ status: 'bad' });
				});
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'WH9IUG0', userId);
			res.status(500).send(message);
		}
	}

	async sendClassificationAlert(req, res) {
		let userId = 'Unknown_Webapp';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const { alertData } = req.body;
			const emailBody = `
				<p>A user with ID ${userId} has exported their search results with a non-standard classification marking.</p>
				<p>The marking they used is: ${alertData.options.classificationMarking}</p>
				<p>${JSON.stringify(alertData)}</p>
			`;
			this.logger.info(`Classification alert: ${emailBody}`);
			this.emailUtility
				.sendEmail(
					emailBody,
					'Document Export Classification Alert',
					this.constants.GAME_CHANGER_OPTS.emailAddress,
					this.constants.GAME_CHANGER_OPTS.emailAddress,
					null,
					userId
				)
				.then((success) => {
					res.status(200).send({ status: 'good' });
				})
				.catch((failure) => {
					res.status(500).send({ status: 'bad' });
				});
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'WH9IUG99', userId);
			res.status(500).send(message);
		}
	}

	async clearDashboardNotification(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');

		try {
			const user_id = getUserIdFromSAMLUserId(req);

			await this.sequelize.transaction(async (t) => {
				const userData = await this.gcUser.findOne({
					where: {
						user_id: user_id,
					},
					transaction: t,
					// there is a race condition between this select and the notification json modification
					// and update so we lock the row for update
					lock: t.LOCK.UPDATE,
				});

				const { cloneName, type } = req.body;

				// only update if the notification exists and is non-zero
				if (
					userData.notifications &&
					userData.notifications[cloneName] &&
					userData.notifications[cloneName][type]
				) {
					userData.notifications[cloneName][type] = 0;
					await this.gcUser.update(
						{ notifications: userData.notifications },
						{
							where: {
								user_id: user_id,
							},
							transaction: t,
						}
					);
				}
			});

			res.status(200).send();
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'J9VDKM2', userId);
		}
	}

	async updateUserAPIRequestLimit(req, res) {
		let userId = 'unknown_webapp';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const user_id = getUserIdFromSAMLUserId(req);

			await this.gcUser.update(
				{ api_requests: Sequelize.literal('api_requests - 1') },
				{ where: { user_id: user_id } }
			);

			res.status(200).send();
		} catch (err) {
			this.logger.error(err, 'OPN1XOE', userId);
			res.status(500).send(err);
		}
	}

	async resetAPIRequestLimit() {
		try {
			this.logger.info('Resetting all API Request limits to 3');

			const ids = await this.gcUser.findAll({
				attributes: ['id'],
			});
			const id_values = [];

			ids.forEach((id) => {
				const value = id.getDataValue('id');
				id_values.push(value);
			});

			const [count, rows] = await this.gcUser.update({ api_requests: 3 }, { where: { id: id_values } });
			this.logger.info(`Finished resetting; ${count} rows affected.`);
			return count;
		} catch (e) {
			this.logger.error(e, '4X1IB7M', 'api-request-reset-cron');
		}
	}

	async getRecentSearches(req, res) {
		let userId = 'unknown_webapp';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const { clone_name } = req.body;

			const user_id = getUserIdFromSAMLUserId(req);

			let ids = await this.gcHistory.findAll({
				attributes: [[Sequelize.fn('MAX', Sequelize.col('id')), 'id']],
				where: {
					clone_name,
					had_error: 'f',
					user_id: user_id,
				},
				group: ['search'],
				order: [[Sequelize.col('id'), 'DESC']],
				limit: 10,
			});
			ids = ids.map((id) => id.id);
			let searches = await this.gcHistory.findAll({
				attributes: ['request_body', 'search', 'run_at'],
				where: {
					clone_name,
					had_error: 'f',
					id: ids,
				},
				order: [['run_at', 'DESC']],
				limit: 10,
			});
			searches = searches.map((search) => {
				return { ...search.request_body, run_at: search.run_at };
			});
			res.status(200).send(searches);
		} catch (e) {
			this.logger.error(e, '6RN417M', userId);
			res.status(500).send(e);
		}
	}

	postUserAppVersion(req, res) {
		const { app } = req.body;

		const currentVersion = constants.VERSION;
		const username = req.user.cn;

		// search for app version
		return this.findAppVersionByUser(username, app)
			.then((result) => {
				// if data found, send data back and update it to newest version
				if (result) {
					// new users who are still in the same version
					if (result.dataValues.version === 'NEWUSER_' + currentVersion) {
						res.status(200).send({
							newUser: true,
							currentVersion: true,
							message: 'New user app version updated',
						});
					}

					// any user with outdated version
					else if (result.dataValues.version !== constants.VERSION) {
						this.updateAppVersion(username, app, currentVersion)
							.then((update) => {
								// the app version was found and updated
								if (update[0] === 1) {
									res.status(200).send({
										newUser: false,
										currentVersion: false, // version had to be updated
										message: 'user app version updated',
									});
								}

								// failed to update
								else {
									res.status(400).send({
										message: 'failed to update',
									});
								}
							})
							.catch((err) => {
								this.logger.error(err);
								res.status(400).send(err);
							});
					}

					// up to date
					else {
						res.status(200).send({
							newUser: false,
							currentVersion: true,
							message: 'App version is up to date',
						});
					}
				}
				// entirely new user
				else {
					// app version was not found, add new row
					this.addNewAppVersion(username, app, 'NEWUSER_' + currentVersion)
						.then(() => {
							res.status(200).send({
								newUser: true,
								currentVersion: false,
								message: 'new user app version added',
							});
						})
						.catch((err) => {
							this.logger.error(err);
							res.status(400).send({
								message: 'failed to add new user app',
							});
						});
				}
			})
			.catch((err) => {
				this.logger.error(err);
				res.status(400).send(err);
			});
	}

	findAppVersionByUser(username, app) {
		return new Promise((resolve, reject) => {
			this.user_app_versions
				.findOne({
					where: {
						username: username,
						app_name: app,
					},
				})
				.then((result) => {
					resolve(result);
				})
				.catch((e) => {
					this.logger.error(e);
					reject(e);
				});
		});
	}

	updateAppVersion(username, app, currentVersion) {
		return new Promise((resolve, reject) => {
			user_app_versions
				.update(
					{
						version: currentVersion,
					},
					{
						where: {
							username: username,
							app_name: app,
						},
					}
				)
				.then((update) => {
					resolve(update);
				})
				.catch((e) => {
					this.logger.error(e);
					reject(e);
				});
		});
	}

	addNewAppVersion(username, app, currentVersion) {
		return new Promise((resolve, reject) => {
			user_app_versions
				.create({
					username: username,
					app_name: app,
					version: currentVersion,
				})
				.then((resObj) => {
					resolve(resObj);
				})
				.catch((err) => {
					reject(err);
				});
		});
	}
}

module.exports.UserController = UserController;
