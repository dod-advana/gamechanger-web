const INTERNAL_USER_TRACKING = require('../models').internal_user_tracking;
const GC_USER = require('../models').gc_user;
const FAVORITE_DOCUMENT = require('../models').favorite_documents;
const FAVORITE_SEARCH = require('../models').favorite_searches;
const FAVORITE_TOPIC = require('../models').favorite_topics;
const FAVORITE_GROUP= require('../models').favorite_groups;
const FAVORITE_ORGANIZATION = require('../models').favorite_organizations;
const FAVORITE_DOCUMENTS_GROUP = require('../models').favorite_documents_groups;
const GC_HISTORY = require('../models').gc_history;
const EXPORT_HISTORY = require('../models').export_history;
const LOGGER = require('../lib/logger');
const sparkMD5Lib = require('spark-md5');
const SearchUtility = require('../utils/searchUtility');
const { SearchController } = require('./searchController');
const { ExternalAPIController } = require('./externalAPI/externalAPIController');
const EmailUtility = require('../utils/emailUtility');
const constantsFile = require('../config/constants');
const { DataLibrary } = require('../lib/dataLibrary');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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
			emailUtility = new EmailUtility({
				fromName: constantsFile.ADVANA_EMAIL_CONTACT_NAME,
				fromEmail: constantsFile.ADVANA_NOREPLY_EMAIL_ADDRESS,
				transportOptions: constantsFile.ADVANA_EMAIL_TRANSPORT_OPTIONS
			}),
			dataApi = new DataLibrary(opts),
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
		this.emailUtility = emailUtility;
		this.constants = constants;
		this.dataApi = dataApi;

		this.deleteInternalUser = this.deleteInternalUser.bind(this);
		this.addInternalUser = this.addInternalUser.bind(this);
		this.getInternalUsers = this.getInternalUsers.bind(this);
		this.setUserBetaStatus = this.setUserBetaStatus.bind(this);
		this.submitUserInfo = this.submitUserInfo.bind(this);
		this.getUserSettings = this.getUserSettings.bind(this);
		this.getUserData = this.getUserData.bind(this);
		this.sendFeedback = this.sendFeedback.bind(this);
		this.sendClassificationAlert = this.sendClassificationAlert.bind(this);
		this.clearDashboardNotification = this.clearDashboardNotification.bind(this);
		this.updateUserAPIRequestLimit = this.updateUserAPIRequestLimit.bind(this);
		this.resetAPIRequestLimit = this.resetAPIRequestLimit.bind(this);
		this.populateNewUserId = this.populateNewUserId.bind(this);
		this.getRecentSearches = this.getRecentSearches.bind(this);
	}

	async getUserData(req, res) {
		let userId = 'Unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const hashed_user = this.sparkMD5.hash(userId);

			const [user, created] = await this.gcUser.findOrCreate(
				{
					where: { user_id: hashed_user },
					defaults: {
						user_id: hashed_user,
						notifications: {}
					},
					raw: true,
				}
			);

			if (!created) {
				const favorite_documents = await this.favoriteDocument.findAll({
					where: {user_id: user.user_id},
					raw: true
				});

				const favorite_searches = await this.favoriteSearch.findAll({
					where: {user_id: user.user_id},
					order: [['id', 'DESC']],
					raw: true
				});


				const favorite_topics = await this.favoriteTopic.findAll({
					where: {user_id: user.user_id},
					raw: true
				});

				const favorite_groups = await this.favoriteGroup.findAll({
					where: {user_id: user.user_id},
					raw: true
				})
				favorite_groups.forEach(async (group, index) => {
					const res = await this.favoriteDocumentsGroup.findAll({
						attributes: ['favorite_document_id'],
						where: {favorite_group_id: group.id},
						raw: true
					})
					const favoriteList = [];
					res.forEach(fav => favoriteList.push(fav.favorite_document_id))
					favorite_groups[index].favorites = favoriteList;
				})
				user.favorite_groups = favorite_groups;
				
				const favorite_organizations = await this.favoriteOrganization.findAll({
					where: {user_id: user.user_id},
					raw: true
				});

				const search_history = await this.gcHistory.findAll({
					where: {
						user_id: user.user_id,
						is_tutorial_search: false,
						tiny_url: {[Op.ne]: null}
					},
					order: [
						['id', 'DESC'],
					],
					limit: 20,
					raw: true
				});
				const export_history = await this.exportHistory.findAll({
					raw: true,
					limit: 20,
					where: { user_id: user.user_id 	},
					order: [
						['updatedAt', 'DESC']
					]
				});

				if (favorite_documents) {
					for (const doc of favorite_documents) {
						const countData = await this.favoriteDocument.findAll({
							attributes: [[this.favoriteDocument.sequelize.fn('COUNT', this.favoriteDocument.sequelize.col('id')), 'favorited_count']],
							where: {filename: doc.filename},
							raw: true
						});

						doc.favorited = countData[0].favorited_count;
					}

					const index = [this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.index, this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.legislation_index, this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS.assist_index];

					const filenames = favorite_documents.map(doc => {
						return doc.filename;
					});

					const esQuery = {
						_source: {
							'includes': [
								'download_url_s',
							]
						},
						stored_fields: [ 'filename', 'title', 'id', 'summary_30', 'doc_type', 'doc_num'],
						size: favorite_documents.length,
						query: {
							terms: { filename: filenames }
						}
					};

					let esClientName = 'gamechanger';
					const results = await this.dataApi.queryElasticSearch(esClientName, index, esQuery, userId);

					const returnDocsTemp = [];

					results.body.hits.hits.forEach(hit => {
						returnDocsTemp.push({
							filename: hit.fields.filename[0],
							summary: hit.fields.summary_30[0],
							title: hit.fields.title[0],
							doc_type: hit.fields.doc_type[0],
							doc_num: hit.fields.doc_num[0],
							id: hit.fields.id[0],
							download_url_s: hit._source.download_url_s
						});
					});

					const returnDocs = [];
					favorite_documents.forEach(doc => {
						const docData = returnDocsTemp.find(data => data.filename === doc.filename);
						if (docData) {
							doc.favorite_id = doc.id;
							doc.title = `${docData.doc_type} ${docData.doc_num} ${docData.title}`;
							doc.doc_type = docData.doc_type;
							doc.doc_num = docData.doc_num;
							doc.id = docData.id;
							doc.summary = docData.summary;
							doc.download_url_s = docData.download_url_s
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
							attributes: [[this.favoriteSearch.sequelize.fn('COUNT', this.favoriteSearch.sequelize.col('id')), 'favorited_count']],
							where: {tiny_url: search.tiny_url},
							raw: true
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
							attributes: [[this.favoriteTopic.sequelize.fn('COUNT', this.favoriteTopic.sequelize.col('id')), 'favorited_count']],
							where: {topic_name: topic.topic_name},
							raw: true
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
							attributes: [[this.favoriteOrganization.sequelize.fn('COUNT', this.favoriteOrganization.sequelize.col('id')), 'favorited_count']],
							where: {organization_name: org.organization_name},
							raw: true
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

				const api_key = await this.externalAPI.getAPIKey(userId);
				user.api_key = api_key;

				if (export_history) {
					user.export_history = export_history;
				} else {
					user.export_history = [];
				}

			} else {
				user.favorite_documents = [];
				user.favorite_searches = [];
				user.search_history = [];
				user.export_history = [];
				user.api_key = '';
			}

			res.send(user);

		} catch (err) {
			this.logger.error(err, 'NG6CETF', userId);
			res.status(500).send(err);
			return err;
		}
	}

	async getUserSettings(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const hashed_user = this.sparkMD5.hash(userId);

			const [user] = await this.gcUser.findOrCreate(
				{
					where: { user_id: hashed_user },
					defaults: {
						user_id: hashed_user,
						is_beta: false,
						notifications: {}
					},
					raw: true
				}
			);
			user.submitted_info = true;
			res.status(200).send(user);
		} catch (err) {
			this.logger.error(err.message, 'ZX1SWBU', userId);
			res.status(500).send(err);
		}
	}

	async setUserBetaStatus(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const hashed_user = this.sparkMD5.hash(userId);

			const { status } = req.body;

			await this.gcUser.update(
				{
					is_beta: status
				},
				{
					where: {
						user_id: hashed_user
					}
				}
			);
			res.status(200).send(status);
		} catch (err) {
			this.logger.error(err.message, 'NGED0R4', userId);
			res.status(500).send(err);
		}
	}

	async submitUserInfo(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const hashed_user = this.sparkMD5.hash(userId);


			await this.gcUser.update(
				{
					user_info: req.body,
					submitted_info: true
				},
				{
					where: {
						user_id: hashed_user
					}
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

	async addInternalUser(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const { trackByRequest = false } = req.body;
			let username;
			if (trackByRequest){
				username = userId;
			} else {
				username = req.body.username || '';
			}
			username = this.sparkMD5.hash(username);
			const exists = await this.internalUserTracking.findOne({ where: { username } });
			if (exists) {
				const { id, username } = exists;
				res.status(500).send(`This user is already being tracked. Table ID # ${id} - hash: ${username}`);
			} else {
				const created = await this.internalUserTracking.create({ username });
				res.status(200).send(created);
			}
		} catch (err) {
			this.logger.error(err, 'VEUUDWQ', userId);
			res.status(500).send(`Error adding internal user: ${err.message}`);
		}
	}

	async deleteInternalUser(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const deleted = this.internalUserTracking.destroy({
				where: {
					id: req.body.id
				}
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
			const {feedbackType, feedbackText, screenShot, userEmail} = req.body.feedbackData;
			const emailBody = `<h2>${feedbackType}</h2><p>${feedbackText}</p><p>${screenShot}</p>`;
			this.logger.info(`User Feedback from ${userEmail}: ${emailBody} `);
			// this.emailUtility.sendEmail(emailBody, 'User Feedback', this.constants.GAME_CHANGER_OPTS.emailAddress, userEmail, null, userId).then(resp => {
			res.status(200).send({status: 'good'});
			// }).catch(error => {
				// this.logger.error(JSON.stringify(error), '8D3C1VX', userId);
				// res.status(500).send(error);
			// });

			// const axios = require('axios');
			// const axiosInstance = axios.create({
			// 	httpsAgent: new https.Agent({ rejectUnauthorized: false }),
			// });
			// const currentTime = new Date(Date.now());
			// const version = this.constants.VERSION;
			// const userInstance = await this.users.findOne({
			// 	where: {
			// 		username: userId
			// 	}
			// });
			// const options = {
			// 	serviceDeskId: this.constants.SERVICEDESK_ID,
			// 	requestTypeId: this.constants.REQUEST_TYPE_ID,
			// 	requestFieldValues: {
			// 		customfield_10501: userInstance.email,
			// 		customfield_11607: this.constants.SERVICE_ACCOUNT_OPTS.PHONE,
			// 		customfield_10520: this.constants.SERVICE_ACCOUNT_OPTS.ORGANIZATION,
			// 		summary: `${userId} is submitting feedback at ${currentTime} in version ${version} of Advana. \n`,
			// 		customfield_10201: this.constants.SERVICE_ACCOUNT_OPTS.ENVIRONMENT,
			// 		customfield_10207: feedbackType,
			// 		customfield_10608: 'other',
			// 		description: feedbackText,
			// 		attachement: screenShot
			// 	}
			// };
			// await axiosInstance({
			// 	method: 'post',
			// 	url: 'https://support.advana.data.mil/rest/servicedeskapi/request',
			// 	data: options,
			// 	auth: {
			// 		username: this.constants.SERVICE_ACCOUNT_OPTS.USERNAME,
			// 		password: this.constants.SERVICE_ACCOUNT_OPTS.PASSWORD
			// 	}
			// });
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
			const emailBody = `<p>A user with ID ${userId} has exported their search results with a non-standard classification marking.</p><p>The marking they used is: ${alertData.options.classificationMarking}</p><p>${JSON.stringify(alertData)}</p>`;
			this.logger.info(`Classification alert: ${emailBody}`);
			// this.emailUtility.sendEmail(emailBody, 'Document Export Classification Alert', this.constants.GAME_CHANGER_OPTS.emailAddress, this.constants.GAME_CHANGER_OPTS.emailAddress, null, userId).then(resp => {
				res.status(200).send({status: 'good'});
			// }).catch(error => {
				// this.logger.error(JSON.stringify(error), '8D3C1VX', userId);
				// res.status(500).send(error);
			// });
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'WH9IUG0', userId);
			res.status(500).send(message);
		}
	}

	async clearDashboardNotification(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');

		try {
			const hashed_user = this.sparkMD5.hash(userId);

			await this.sequelize.transaction(async (t) => {
				const userData = await this.gcUser.findOne({
					where: {
						user_id: hashed_user
					},
					transaction: t,
					// there is a race condition between this select and the notification json modification
					// and update so we lock the row for update
					lock: t.LOCK.UPDATE,
				});

				const { cloneName, type } = req.body;

				// only update if the notification exists and is non-zero
				if (userData.notifications && userData.notifications[cloneName] && userData.notifications[cloneName][type]) {
					userData.notifications[cloneName][type] = 0;
					await this.gcUser.update({ notifications: userData.notifications },
						{
							where: {
								user_id: hashed_user
							},
							transaction: t,
						});
				}
			});

			res.status(200).send();
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'J9VDKM2', userId);
		}

	}

	async updateUserAPIRequestLimit(req, res){
		let userId = 'unknown_webapp'
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const hashed_user = this.sparkMD5.hash(userId);

			await this.gcUser.update({ 'api_requests': Sequelize.literal('api_requests - 1') }, { where: { user_id: hashed_user } });
			
			res.status(200).send();
		} catch(err) {
			this.logger.error(err, 'OPN1XOE', userId)
			res.status(500).send(err);
		}
	}

	async resetAPIRequestLimit() {
		try {
			this.logger.info('Resetting all API Request limits to 3')

			const ids = await this.gcUser.findAll({
				attributes: ['id']
			  });
			const id_values = []

			ids.forEach(id => {
				const value = id.getDataValue('id')
				id_values.push(value);
			})

			const [count, rows] = await this.gcUser.update({ 'api_requests': 3 }, {where: {id: id_values}});
			this.logger.info(`Finished resetting; ${count} rows affected.`)
			return count;
		} catch(e) {
			this.logger.error(e, '4X1IB7M', 'api-request-reset-cron');
		}
	}

	async populateNewUserId(req, res) {
		let userId = 'unknown_webapp'
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const tableArr = [this.gcHistory, this.exportHistory, this.favoriteDocument, this.favoriteSearch, this.favoriteTopic];
			tableArr.forEach(async (table, index) => {
				const users = await table.findAll({
					attributes: ['user_id','new_user_id'],
					group: ['user_id','new_user_id'],
					where: {
						'new_user_id': {
							[Op.ne]: null
						}
					}
				});
				users.forEach(async (combo) => {
					const old_id = combo.dataValues.user_id;
					const new_id = combo.dataValues.new_user_id;
					
					await table.update(
						{
							new_user_id : new_id
						},
						{
							where : {
								user_id : old_id,
								new_user_id: {
									$eq: null
								}
							}
						}
					);
				});
			});;
			res.status(200).send({});
		} catch(e) {
			this.logger.error(e, 'LTKT9WZ', userId);
			res.status(500).send(e)
		}
	}

	async getRecentSearches(req, res) {
		let userId = 'unknown_webapp';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const { clone_name } = req.body;
			
			const hashed_user = this.sparkMD5.hash(userId);
			
			let ids = await this.gcHistory.findAll({
				attributes: [
					[Sequelize.fn('MAX', Sequelize.col('id')), 'id']
				],
				where: {
					clone_name,
					had_error: 'f',
					user_id: hashed_user
				},
				group: ['search'],
				order: [[Sequelize.col('id'), 'DESC']],
				limit: 10
			});
			ids = ids.map(id=>id.id);
			let searches = await this.gcHistory.findAll({
				attributes: ['request_body','search','run_at'],
				where: {
					clone_name,
					had_error: 'f',
					id: ids
				},
				order: [['run_at', 'DESC']],
				limit: 10
			});
			searches = searches.map(search=>{
				return({...search.request_body, run_at: search.run_at});
			});
			res.status(200).send(searches);
		} catch(e) {
			this.logger.error(e, '6RN417M', userId);
			res.status(500).send(e)
		}
	}
}

module.exports.UserController = UserController;
