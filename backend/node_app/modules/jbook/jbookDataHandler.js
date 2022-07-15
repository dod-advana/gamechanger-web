const PDOC = require('../../models').pdoc;
const RDOC = require('../../models').rdoc;
const OM = require('../../models').om;
const REVIEW = require('../../models').review;
const KEYWORD_ASSOC = require('../../models').keyword_assoc;
const USER_REQUEST = require('../../models').user_request;
const REVIEWER = require('../../models').reviewer;
const FEEDBACK_JBOOK = require('../../models').feedback_jbook;
const PORTFOLIO = require('../../models').portfolio;
const JBOOK_CLASSIFICATION = require('../../models').jbook_classification;
const constantsFile = require('../../config/constants');
const GL = require('../../models').gl;
const { Sequelize, Op } = require('sequelize');
const DB = require('../../models/index');
const EmailUtility = require('../../utils/emailUtility');
const DataHandler = require('../base/dataHandler');
const SearchUtility = require('../../utils/searchUtility');
const JBookSearchUtility = require('./jbookSearchUtility');
const { DataLibrary } = require('../../lib/dataLibrary');
const _ = require('underscore');

const types = {
	'RDT&E': 'rdoc',
	Procurement: 'pdoc',
	'O&M': 'odoc',
};

class JBookDataHandler extends DataHandler {
	constructor(opts = {}) {
		const {
			pdoc = PDOC,
			rdoc = RDOC,
			om = OM,
			review = REVIEW,
			searchUtility = new SearchUtility(opts),
			jbookSearchUtility = new JBookSearchUtility(opts),
			constants = constantsFile,
			keyword_assoc = KEYWORD_ASSOC,
			gl = GL,
			db = DB,
			userRequest = USER_REQUEST,
			reviewer = REVIEWER,
			feedback = FEEDBACK_JBOOK,
			jbook_classification = JBOOK_CLASSIFICATION,
			portfolio = PORTFOLIO,
			dataLibrary = new DataLibrary(opts),
		} = opts;

		super({ ...opts });

		this.pdocs = pdoc;
		this.rdocs = rdoc;
		this.om = om;
		this.rev = review;
		this.searchUtility = searchUtility;
		this.jbookSearchUtility = jbookSearchUtility;
		this.constants = constants;
		this.gl = gl;
		this.keyword_assoc = keyword_assoc;
		this.db = db;
		this.userRequest = userRequest;
		this.reviewer = reviewer;
		this.feedback = feedback;
		this.portfolio = portfolio;
		this.searchUtility = searchUtility;
		this.dataLibrary = dataLibrary;
		this.jbook_classification = jbook_classification;

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
	}

	async getPortfolioAndDocument(id, portfolioName, userId) {
		try {
			const portfolio = await this.getPortfolio({ body: { name: portfolioName } }, userId);

			// Get ES Data
			const clientObj = { esClientName: 'gamechanger', esIndex: 'jbook' };
			const esQuery = this.jbookSearchUtility.getElasticSearchJBookDataFromId({ docIds: [id] }, userId);
			const esResults = await this.dataLibrary.queryElasticSearch(
				clientObj.esClientName,
				clientObj.esIndex,
				esQuery,
				userId
			);

			const { docs } = this.jbookSearchUtility.cleanESResults(esResults, userId);

			const data = docs[0];

			return { doc: data, portfolio };
		} catch (err) {
			this.logger.error(err, '8NG85TR', userId);
			return { doc: {}, portfolio: {} };
		}
	}

	async setDocClassification(doc) {
		// classification
		try {
			let classification;

			switch (doc.budgetType) {
				case 'pdoc':
					classification = await this.jbook_classification.findOne({
						where: {
							'P40-01_LI_Number': doc.budgetLineItem,
							budgetYear: doc.budgetYear,
							docType: 'pdoc',
						},
					});
					break;
				case 'rdoc':
					classification = await this.jbook_classification.findOne({
						where: {
							PE_Num: doc.programElement,
							Proj_Number: doc.projectNum,
							budgetYear: doc.budgetYear,
							docType: 'rdoc',
						},
					});
					break;
				case 'om':
					classification = await this.jbook_classification.findOne({
						where: {
							line_number: doc.budgetLineItem,
							sag_bli: doc.programElement,
							budgetYear: doc.budgetYear,
							docType: 'om',
						},
					});
					break;
				default:
					break;
			}

			// CLASSIFICATION
			if (classification?.dataValues) {
				doc.classification = classification.dataValues;
			}
		} catch (e) {
			console.log('error getting classification');
			console.log(e);
		}
	}

	async setOrCreateReview(doc, tmpReview, updateESReview_n, portfolioName, id, userId) {
		const clientObj = { esClientName: 'gamechanger', esIndex: 'jbook' };

		// If no review then look for one from the year prior, if nothing then create a empty one for this portfolio
		if (!tmpReview) {
			updateESReview_n = true;
			const tmpData = _.clone(doc);
			const currentYear = new Date().getFullYear();
			tmpData.budgetYear = (parseInt(currentYear) - 1).toString();
			const oldReview = await this.getReviewData(tmpData);
			if (Object.keys(oldReview).length !== 0) {
				oldReview.budget_year = doc.budgetYear;
				oldReview.review_status = 'Needs Review';
				oldReview.primary_review_status = 'Needs Review';
				oldReview.service_review_status = 'Needs Review';
				oldReview.poc_review_status = 'Needs Review';
				oldReview.portfolio_name = portfolioName;
				tmpReview = oldReview;
				delete tmpReview.id;
				delete tmpReview.primary_reviewer;
				delete tmpReview.service_reviewer;
				delete tmpReview.service_secondary_reviewer;
				delete tmpReview.service_secondary_reviewer;
				delete tmpReview.service_poc_email;
				delete tmpReview.service_poc_name;
				delete tmpReview.service_poc_org;
				delete tmpReview.service_poc_title;
				delete tmpReview.service_poc_phone_number;
				delete tmpReview.alternate_poc_email;
				delete tmpReview.alternate_poc_name;
				delete tmpReview.alternate_poc_org;
				delete tmpReview.alternate_poc_title;
				delete tmpReview.alternate_poc_phone_number;
				delete tmpReview.createdAt;
				delete tmpReview.updatedAt;

				// Now create the entry in PG
				const newReview = await this.rev.create(tmpReview);
				tmpReview = newReview['dataValues'];
				tmpReview = this.jbookSearchUtility.parseFields(tmpReview, false, 'review', true);
			}
		} else {
			tmpReview = this.jbookSearchUtility.parseFields(tmpReview, false, 'reviewES', true);
		}

		if (tmpReview) {
			doc.review_n.push(this.jbookSearchUtility.parseFields(tmpReview, true, 'reviewES', true));
			if (!tmpReview.portfolio_name_s) {
				tmpReview.portfolio_name_s = portfolioName;
				updateESReview_n = true;
			}
		}

		if (updateESReview_n) {
			const updated = await this.dataLibrary.updateDocument(
				clientObj.esClientName,
				clientObj.esIndex,
				{ review_n: doc.review_n },
				id,
				userId
			);
			if (!updated) {
				console.log(updated);
			}
		}
	}

	async getReviewerEmails(review) {
		try {
			// Add reviewer emails for primary secondary and service
			let primaryReviewer;

			if (review.primaryReviewer) {
				primaryReviewer = await this.reviewer.findOne({
					where: {
						type: 'primary',
						name: review.primaryReviewer.trim(),
					},
					raw: true,
				});
			}
			review.primaryReviewerEmail = primaryReviewer?.email || null;

			let serviceReviewer;
			if (review.serviceReviewer) {
				serviceReviewer = await this.reviewer.findOne({
					where: {
						type: 'service',
						name: review.serviceReviewer ? review.serviceReviewer.split('(')[0].trim() : '',
					},
					raw: true,
				});
			}
			review.serviceReviewerEmail = serviceReviewer?.email || null;

			let secondaryReviewer;
			const secName = review.serviceSecondaryReviewer ? review.serviceSecondaryReviewer.split('(')[0].trim() : '';
			if (review.serviceSecondaryReviewer) {
				secondaryReviewer = await this.reviewer.findOne({
					where: {
						type: 'secondary',
						name: secName,
					},
					raw: true,
				});
			}
			review.serviceSecondaryReviewerEmail = secondaryReviewer?.email || null;
		} catch (err) {
			console.log('Error fetching reviewer emails');
			console.log(err);
		}
		return review;
	}

	async parseESReviews(doc) {
		for (let idx in doc.review_n) {
			let tmp = this.jbookSearchUtility.parseFields(doc.review_n[idx], false, 'reviewES', true);

			// If this only has portfolio id look up the portfolio and add the name
			if (!tmp.portfolioName && tmp.portfolio_id_s) {
				const tmpPortfolio = await this.getPortfolio({ body: { id: parseInt(tmp.portfolio_id_s) } }, userId);
				tmp.portfolioName = tmpPortfolio?.name || '';
			}

			// get emails if possible
			tmp = await this.getReviewerEmails(tmp);

			doc.reviews[tmp.portfolioName] = tmp;
		}
	}

	async getAllBYProjectData(req, userId) {
		try {
			const { id } = req.body;

			const clientObj = { esClientName: 'gamechanger', esIndex: 'jbook' };
			const esQuery = this.jbookSearchUtility.getElasticSearchJBookDataFromId({ docIds: [id] }, userId);
			const esResults = await this.dataLibrary.queryElasticSearch(
				clientObj.esClientName,
				clientObj.esIndex,
				esQuery,
				userId
			);

			const profilePageQueryData = this.jbookSearchUtility.getProfilePageQueryData(esResults, userId);

			const pfpQuery = this.jbookSearchUtility.getESJBookProfilePageQuery(profilePageQueryData, userId);

			const pfpESResults = await this.dataLibrary.queryElasticSearch(
				clientObj.esClientName,
				clientObj.esIndex,
				pfpQuery,
				userId
			);

			const { docs } = this.jbookSearchUtility.cleanESResults(pfpESResults, userId);

			let yearToDoc = {};

			for (let doc of docs) {
				doc.reviews = {};
				await this.parseESReviews(doc);
				yearToDoc[doc.budgetYear] = doc;
			}

			return yearToDoc;
		} catch (err) {
			console.log(err);
			this.logger.error(err, 'HSGBFMB', userId);
			return [];
		}
	}

	async getESProjectData(req, userId) {
		try {
			const { id, portfolioName } = req.body;

			await this.getAllBYProjectData(req, userId);

			const { doc, portfolio } = await this.getPortfolioAndDocument(id, portfolioName, userId);

			await this.setDocClassification(doc);

			// Only return a review for the current portfolio
			let tmpReview;
			let updateESReview_n = false;

			if (Array.isArray(doc?.review_n)) {
				const tmpReview_n = [];
				doc.review_n.forEach((review) => {
					if (
						review['portfolio_name_s'] === portfolioName ||
						review['portfolio_id_s'] === portfolio?.id?.toString()
					) {
						tmpReview = review;
					} else {
						tmpReview_n.push(review);
					}
				});
				doc.review_n = tmpReview_n;
			} else if (doc?.review_n?.constructor === Object) {
				if (
					doc.review_n?.portfolio_name_s === portfolioName ||
					doc.review_n?.portfolio_id_s === portfolio?.id?.toString()
				) {
					tmpReview = doc.review_n;
					doc.review_n = [];
				} else {
					doc.review_n = [doc.review_n];
				}
				updateESReview_n = true;
			} else {
				doc.review_n = [];
				updateESReview_n = true;
			}

			// If no review then look for one from the year prior, if nothing then create a empty one for this portfolio
			if (portfolio) {
				await this.setOrCreateReview(doc, tmpReview, updateESReview_n, portfolioName, id, userId);
			}

			doc.reviews = {};

			await this.parseESReviews(doc);

			delete doc.review_n;

			return doc;
		} catch (err) {
			console.log(err);
			this.logger.error(err, '6T0ILGP', userId);
			return [];
		}
	}

	async getReviewData(data) {
		let review = {};
		try {
			const query = {
				budget_type: data.budgetType,
				budget_year: data.budgetYear,
				appn_num: { [Op.iLike]: `${data.appropriationNumber}%` },
				budget_activity: data.budgetActivityNumber,
				agency: data.serviceAgency,
			};

			// in review table, budget_line_item is also projectNum

			switch (data.budgetType) {
				case 'pdoc':
					query.budget_line_item = data.budgetLineItem;
					break;
				case 'rdoc':
					query.program_element = data.programElement;
					query.budget_line_item = data.projectNum;
					break;
				case 'om':
					query.budget_line_item = data.budgetLineItem;
					query.program_element = data.programElement;
					break;
				default:
					break;
			}

			let reviewData = await this.rev.findAll({
				where: query,
			});

			if (reviewData && reviewData.dataValues) {
				// parse mission partners
				if (reviewData.service_mp_list && typeof reviewData.service_mp_list === 'string') {
					reviewData.service_mp_list = reviewData.service_mp_list
						.replace(/[\[\]\\]/g, '')
						.split(';')
						.join('|');
				}

				review = this.jbookSearchUtility.parseFields(reviewData.dataValues, false, 'review', false);
			}
		} catch (err) {
			console.log('Error fetching for review');
			console.log(err);
		}
		return review;
	}

	async getBudgetDropdownData(userId) {
		try {
			let transitionPartnerP;
			let transitionPartnerR;
			let transitionPartnerO;
			try {
				transitionPartnerP = await this.pdocs.findAll({
					attributes: [Sequelize.fn('DISTINCT', Sequelize.col('P40-06_Organization')), 'P40-06_Organization'],
				});
				transitionPartnerP = transitionPartnerP.map((org) => org.dataValues['P40-06_Organization']);
			} catch (err) {
				console.log('Error fetching PDOC orgs');
				this.logger.error(err, 'XMCNRA1', userId);
			}

			try {
				transitionPartnerR = await this.rdocs.findAll({
					attributes: [Sequelize.fn('DISTINCT', Sequelize.col('Organization')), 'Organization'],
				});
				transitionPartnerR = transitionPartnerR.map((org) => org.dataValues['Organization']);
			} catch (err) {
				console.log('Error fetching RDOC orgs');
				this.logger.error(err, 'XMCNRA2', userId);
			}

			try {
				transitionPartnerO = await this.om.findAll({
					attributes: [Sequelize.fn('DISTINCT', Sequelize.col('organization')), 'organization'],
				});
				transitionPartnerO = transitionPartnerO.map((org) => org.dataValues['organization']);
			} catch (err) {
				console.log('Error fetching OM orgs');
				this.logger.error(err, 'XMCNRA3', userId);
			}

			const transitionPartner = [
				...new Set([...transitionPartnerP, ...transitionPartnerR, ...transitionPartnerO]),
			];
			transitionPartner.sort();
			transitionPartner.push('Unknown');

			const reviewers = await this.reviewer.findAll({
				where: {
					type: 'primary',
				},
			});

			const serviceReviewers = await this.reviewer.findAll({
				where: {
					type: 'service',
				},
			});

			const secondaryReviewers = await this.reviewer.findAll({
				where: {
					type: 'secondary',
				},
			});

			// hardcode from mitr if col doesn't exist/can't find it yet.. currently none
			const data = {
				reviewers,
				primaryClassLabel: [
					{ primary_class_label: 'Core AI' },
					{ primary_class_label: 'AI Enabled' },
					{ primary_class_label: 'AI Enabling' },
					{ primary_class_label: 'Not AI' },
					{ primary_class_label: 'Unknown' },
				],
				serviceReviewers,
				reviewStat: [
					{ jaic_review_stat: 'Needs Review' },
					{ jaic_review_stat: 'Partial Review' },
					{ jaic_review_stat: 'Finished Review' },
				],
				transitionPartner,
				missionPartners: [
					{ current_msn_part: 'Unknown' },
					{ current_msn_part: 'Academia' },
					{ current_msn_part: 'Industry' },
					{ current_msn_part: 'Other' },
				],
				secondaryReviewers,
			};
			data.secondaryReviewers.sort(function (a, b) {
				var nameA = a.name.toUpperCase(); // ignore upper and lowercase
				var nameB = b.name.toUpperCase(); // ignore upper and lowercase
				if (nameA < nameB) {
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				// names must be equal
				return 0;
			});
			return data;
		} catch (err) {
			this.logger.error(err, 'XMCNRAU', userId);
			return [];
		}
	}

	checkReviewerPermissions(permissions) {
		if (this.constants.JBOOK_USE_PERMISSIONS === 'true' && !permissions.includes('JBOOK Admin')) {
			if (
				(reviewType === 'primary' && !permissions.includes('JBOOK Primary Reviewer')) ||
				(reviewType === 'service' && !permissions.includes('JBOOK Service Reviewer')) ||
				(reviewType === 'poc' && !permissions.includes('JBOOK POC Reviewer'))
			) {
				throw new Error('Unauthorized');
			}
		}
	}

	updateReviewStatus(frontendReviewData, isSubmit, reviewType, portfolioName) {
		// Review Status Update logic
		if (!isSubmit) {
			frontendReviewData[reviewType + 'ReviewStatus'] = 'Partial Review';
		} else {
			frontendReviewData[reviewType + 'ReviewStatus'] = 'Finished Review';
		}

		// Review Status Update logic
		const { primaryReviewStatus, serviceReviewStatus, pocReviewStatus } = frontendReviewData;
		let status = '';
		if (
			(primaryReviewStatus === 'Finished Review' &&
				serviceReviewStatus === 'Finished Review' &&
				pocReviewStatus === 'Finished Review') ||
			(isSubmit && portfolioName !== 'AI Inventory')
		) {
			status = 'Finished Review';
		} else if (primaryReviewStatus === 'Finished Review' && serviceReviewStatus === 'Finished Review') {
			status = 'Partial Review (POC)';
		} else if (primaryReviewStatus === 'Finished Review') {
			status = 'Partial Review (Service)';
		} else if (primaryReviewStatus === 'Partial Review') {
			status = 'Partial Review (Primary)';
		} else {
			status = 'Needs Review';
		}

		frontendReviewData['reviewStatus'] = status;
	}

	async storeBudgetReview(req, userId) {
		try {
			const { frontendReviewData, isSubmit, reviewType, portfolioName, id } = req.body;
			const permissions = req.permissions;
			let wasUpdated = false;

			// check permissions
			this.checkReviewerPermissions(permissions);

			// Review Status Update
			this.updateReviewStatus(frontendReviewData, isSubmit, reviewType, portfolioName);

			const reviewData = this.jbookSearchUtility.parseFields(frontendReviewData, true, 'review');
			const tmpId = reviewData.id;
			const query = {
				id: tmpId,
				portfolio_name: portfolioName,
			};

			delete reviewData.id;

			// in review table, budget_line_item is also projectNum
			switch (types[reviewData.budget_type]) {
				case 'pdoc':
					break;
				case 'rdoc':
					reviewData.budget_line_item = reviewData.projectNum;
					delete reviewData.projectNum;
					break;
				case 'om':
					break;
				default:
					break;
			}

			let newOrUpdatedReview;
			if (!tmpId) {
				reviewData.budget_type = types[reviewData.budget_type];

				const newReview = await this.rev.create(reviewData);
				wasUpdated = true;
				newOrUpdatedReview = newReview.dataValues;
			} else {
				const result = await this.rev
					.update(
						{
							...reviewData,
							budget_type: types[reviewData.budget_type],
						},
						{
							where: query,
						}
					)
					.catch((err) => {
						console.log('Error updating review row');
						console.log(err);
					});

				wasUpdated = result && result.length && result[0] === 1;
				newOrUpdatedReview = { ...reviewData, budget_type: types[reviewData.budget_type] };
				newOrUpdatedReview.id = tmpId;
			}

			// Now update ES
			let tmpPGToES = this.jbookSearchUtility.parseFields(newOrUpdatedReview, false, 'review');
			tmpPGToES = this.jbookSearchUtility.parseFields(tmpPGToES, true, 'reviewES');

			const { doc } = await this.getPortfolioAndDocument(id, portfolioName, userId);

			let esReviews = [];
			if (doc.review_n && Array.isArray(doc.review_n)) {
				esReviews = doc.review_n;
			} else if (doc.review_n) {
				esReviews = [doc.review_n];
			} else {
				esReviews = [];
			}

			// Find if there already is a review in esReviews for this portfolio if so then replace if not add
			const newReviews = [];
			esReviews.forEach((review) => {
				if (review.portfolio_name_s !== portfolioName) {
					newReviews.push(review);
				}
			});
			newReviews.push(tmpPGToES);

			const clientObj = { esClientName: 'gamechanger', esIndex: 'jbook' };
			const updated = await this.dataLibrary.updateDocument(
				clientObj.esClientName,
				clientObj.esIndex,
				{ review_n: newReviews },
				id,
				userId
			);
			if (!updated) {
				console.log('ES NOT UPDATED for REVIEW');
			}

			return { created: wasUpdated && updated };
		} catch (err) {
			this.logger.error(err, 'GZ3D0DR', userId);
			return {};
		}
	}

	async reenableForm(req, userId) {
		try {
			const {
				programElement,
				budgetType,
				reviewType,
				budgetLineItem,
				projectNum,
				appropriationNumber,
				portfolioName,
				id,
			} = req.body;

			const query = {
				budget_type: types[budgetType],
				portfolio_name: portfolioName,
			};

			if (budgetType === 'RDT&E') {
				query.program_element = programElement;
				query.budget_line_item = projectNum;
			} else if (budgetType === 'Procurement') {
				query.budget_line_item = budgetLineItem;
			} else {
				// O&M
				query.program_element = programElement;
				query.budget_line_item = budgetLineItem;
				query.budget_activity = appropriationNumber;
			}

			let update;

			if (reviewType === 'jaic') {
				update = {
					primary_review_status: 'Partial Review',
					review_status: 'Partial Review (Primary)',
				};
			} else if (reviewType === 'service') {
				update = {
					service_review_status: 'Partial Review',
					review_status: 'Partial Review (Service)',
				};
			} else {
				update = {
					poc_review_status: 'Partial Review',
					review_status: 'Partial Review (POC)',
				};
			}

			let review = await this.rev.update(update, {
				where: query,
				returning: true,
				plain: true,
			});

			review = review[1].dataValues;

			// Now update ES
			let tmpPGToES = this.jbookSearchUtility.parseFields(review, false, 'review');
			tmpPGToES = this.jbookSearchUtility.parseFields(tmpPGToES, true, 'reviewES');

			const { doc } = await this.getPortfolioAndDocument(id, portfolioName, userId);

			let esReviews = [];
			if (doc.review_n && Array.isArray(doc.review_n)) {
				esReviews = doc.review_n;
			} else if (doc.review_n && doc.review_n !== null) {
				esReviews = [doc.review_n];
			} else {
				esReviews = [];
			}

			// Find if there already is a review in esReviews for this portfolio if so then replace if not add
			const newReviews = [];
			esReviews.forEach((esReview) => {
				if (esReview.portfolio_name_s !== portfolioName) {
					newReviews.push(esReview);
				}
			});
			newReviews.push(tmpPGToES);

			const clientObj = { esClientName: 'gamechanger', esIndex: 'jbook' };
			const updated = await this.dataLibrary.updateDocument(
				clientObj.esClientName,
				clientObj.esIndex,
				{ review_n: newReviews },
				id,
				userId
			);

			if (!updated) {
				console.log('ES NOT UPDATED for REVIEW');
			}

			return review;
		} catch (err) {
			this.logger.error(err, 'S2CZ29P', userId);
			return {};
		}
	}

	async submitFeedbackForm(req, userId) {
		try {
			const { feedbackForm } = req.body;
			feedbackForm.event_name = 'JBOOK_Feedback';
			return this.feedback.create(feedbackForm);
		} catch (err) {
			this.logger.error(err, '9BN7UG1', userId);
			console.log(err);
			return false;
		}
	}

	async getReviewer(jbookSearchSettings, email, type) {
		let reviewer = await this.reviewer.findOne({
			where: {
				type: type,
				email: email,
			},
			raw: true,
		});

		if (reviewer) {
			reviewer = `${reviewer.name}${reviewer.organization?.length > 1 ? '(' + reviewer.organization + ')' : ''}`;

			switch (type) {
				case 'primary':
					jbookSearchSettings[type + 'ReviewerForUserDash'] = reviewer;
					break;
				case 'service':
					jbookSearchSettings[type + 'ReviewerForUserDash'] = [reviewer];
					break;
				case 'secondary':
					if (jbookSearchSettings.hasOwnProperty(serviceReviewer)) {
						jbookSearchSettings['serviceReviewerForUserDash'].push(reviewer);
					} else {
						jbookSearchSettings['serviceReviewerForUserDash'] = [reviewer];
					}
					break;
				default:
					break;
			}
		}
	}

	async setJbookSearchSettingReviewers(permissions, email, jbookSearchSettings) {
		if (permissions.primary) {
			await this.getReviewer(jbookSearchSettings, email, 'primary');
		}

		if (permissions.service) {
			await this.getReviewer(jbookSearchSettings, email, 'service');

			await this.getReviewer(jbookSearchSettings, email, 'secondary');
		}

		if (permissions.poc) {
			jbookSearchSettings['pocReviewerEmailForUserDash'] = email;
		}
	}

	async getUserSpecificReviews(req, userId) {
		try {
			const { permissions, email } = req.body;

			const jbookSearchSettings = {};
			this.setJbookSearchSettingReviewers(permissions, email, jbookSearchSettings);

			const [pSelect, rSelect, oSelect] = this.jbookSearchUtility.buildSelectQuery();
			const [pWhere, rWhere, oWhere] = this.jbookSearchUtility.buildWhereQueryForUserDash(jbookSearchSettings);
			const pQuery = pSelect + pWhere;
			const rQuery = rSelect + rWhere;
			const oQuery = oSelect + oWhere;

			let giantQuery = pQuery + ` UNION ALL ` + rQuery + ` UNION ALL ` + oQuery;

			const queryEnd = this.jbookSearchUtility.buildEndQuery(jbookSearchSettings.sort);
			giantQuery += queryEnd;

			let data2 = await this.db.jbook.query(giantQuery, {});

			let returnData = data2[0];

			// set the keywords
			returnData.map((doc) => {
				return doc;
			});

			return {
				docs: returnData,
			};
		} catch (err) {
			this.logger.error(err, '6TNRBVL', userId);
			console.log(err);
			return false;
		}
	}

	async getContractTotals(req, userId) {
		const { useElasticSearch = false } = req.body;
		if (useElasticSearch) {
			return { contractTotals: {} };
		} else {
			return this.getPGContractTotals(req, userId);
		}
	}

	async getPGContractTotals(req, userId) {
		try {
			const { searchText, jbookSearchSettings } = req.body;
			const perms = req.permissions;

			const hasSearchText = searchText && searchText !== '';

			const [pSelect, rSelect] = this.jbookSearchUtility.buildSelectQuery();
			const [pWhere, rWhere] = this.jbookSearchUtility.buildWhereQuery(
				jbookSearchSettings,
				hasSearchText,
				null,
				perms,
				userId
			);

			const pQuery = pSelect + pWhere;
			const rQuery = rSelect + rWhere;

			let giantQuery = ``;

			// setting up promise.all
			if (!jbookSearchSettings.budgetType || jbookSearchSettings.budgetType.indexOf('Procurement') !== -1) {
				giantQuery = pQuery;
			}
			if (!jbookSearchSettings.budgetType || jbookSearchSettings.budgetType.indexOf('RDT&E') !== -1) {
				if (giantQuery.length === 0) {
					giantQuery = rQuery;
				} else {
					giantQuery += ` UNION ALL ` + rQuery;
				}
			}

			if (giantQuery.length === 0) {
				return { contractTotals: { 'Total Obligated Amt.': 0 } };
			}

			const structuredSearchText = this.searchUtility.getJBookPGQueryAndSearchTerms(searchText);

			// grab counts, can be optimized with promise.all
			const cTotals =
				`select "serviceAgency", SUM("currentYearAmount") FROM (` +
				giantQuery +
				`) as searchQuery GROUP BY "serviceAgency";`;
			let contractTotals = await this.db.jbook.query(cTotals, {
				replacements: {
					searchText: structuredSearchText,
				},
			});

			const totals = {};
			contractTotals[0].forEach((count) => {
				if (totals[count.serviceAgency] === undefined) {
					totals[count.serviceAgency] = 0;
				}
				totals[count.serviceAgency] += count.sum;
			});

			totals['Total Obligated Amt.'] = 0;
			Object.keys(totals).forEach((key) => {
				totals['Total Obligated Amt.'] += totals[key];
			});
			return { contractTotals: totals };
		} catch (e) {
			const { message } = e;
			this.logger.error(message, '6QJASKB', userId);
			return { contractTotals: {} };
		}
	}

	async getPortfolios(userId) {
		try {
			return await this.portfolio.findAll({
				where: {
					deleted: false,
				},
			});
		} catch (e) {
			const { message } = e;
			this.logger.error(message, '6QJASKC', userId);
			return {};
		}
	}

	async getPortfolio(req, userId) {
		try {
			const { id, name } = req.body;
			let portfolio;

			let where = { id };

			if (!id) {
				where = { name };
			}

			portfolio = await this.portfolio.findOne({
				where,
				raw: true,
			});

			return portfolio;
		} catch (e) {
			const { message } = e;
			this.logger.error(message, '6QJASKD', userId);
			return {};
		}
	}

	async editPortfolio(req, userId) {
		try {
			const { id, name, description, user_ids, tags } = req.body;

			if (id) {
				let update = await this.portfolio.update(
					{
						name,
						description,
						user_ids,
						tags,
					},
					{
						where: {
							id,
						},
					}
				);

				if (!update || !update[0] || update[0] !== 1) {
					throw new Error('Failed to update portfolio');
				} else {
					return {
						name,
						description,
						user_ids,
						tags,
					};
				}
			} else {
				throw new Error('Missing id to update portfolio');
			}
		} catch (e) {
			const { message } = e;
			this.logger.error(message, '6QJASKE', userId);
			return {};
		}
	}

	async deletePortfolio(req, userId) {
		try {
			const { id, name } = req.body;

			let where = { id };

			if (!id) {
				where = { name };
			}

			let update = await this.portfolio.update({ deleted: true }, { where });

			if (!update || !update[0] || update[0] !== 1) {
				throw new Error('Failed to update portfolio');
			} else {
				return { deleted: true };
			}
		} catch (e) {
			const { message } = e;
			this.logger.error(message, '6QJASKF', userId);
			return {};
		}
	}

	async createPortfolio(req, userId) {
		try {
			await this.portfolio.create(req.body);
			return true;
		} catch (e) {
			const { message } = e;
			this.logger.error(message, '6QJASKF', userId);
			return false;
		}
	}

	async restorePortfolio(req, userId) {
		try {
			const { id, name } = req.body;

			let where = { id };

			if (!id) {
				where = { name };
			}

			let update = await this.portfolio.update({ deleted: false }, { where });

			if (!update || !update[0] || update[0] !== 1) {
				throw new Error('Failed to restore portfolio');
			} else {
				return { deleted: false };
			}
		} catch (e) {
			const { message } = e;
			this.logger.error(message, '6QJASKG', userId);
			return {};
		}
	}

	async callFunctionHelper(req, userId) {
		const { functionName } = req.body;

		try {
			switch (functionName) {
				case 'getProjectData':
					return await this.getESProjectData(req, userId);
				case 'getBudgetDropdownData':
					return await this.getBudgetDropdownData(userId);
				case 'storeBudgetReview':
					return await this.storeBudgetReview(req, userId);
				case 'reenableForm':
					return await this.reenableForm(req, userId);
				case 'submitFeedbackForm':
					return await this.submitFeedbackForm(req, userId);
				case 'getUserSpecificReviews':
					return await this.getUserSpecificReviews(req, userId);
				case 'getContractTotals':
					return await this.getContractTotals(req, userId);
				case 'getPortfolios':
					return await this.getPortfolios(userId);
				case 'getPortfolio':
					return await this.getPortfolio(req, userId);
				case 'editPortfolio':
					return await this.editPortfolio(req, userId);
				case 'deletePortfolio':
					return await this.deletePortfolio(req, userId);
				case 'createPortfolio':
					return await this.createPortfolio(req, userId);
				case 'getAllBYProjectData':
					return await this.getAllBYProjectData(req, userId);
				default:
					this.logger.error(
						`There is no function called ${functionName} defined in the JBookDataHandler`,
						'5YIUXOA',
						userId
					);
					return {};
			}
		} catch (e) {
			console.log(e);
			const { message } = e;
			this.logger.error(message, 'D03Z7K6', userId);
			throw e;
		}
	}

	async sendPOCEmail(userId, toName, email, organization, phoneNumber) {
		try {
			// First check to make sure an email has not already been sent for this user.
			const [, created] = await this.userRequest.findOrCreate({
				where: { email: email },
				defaults: {
					email: email,
					organization: organization,
					phone_number: phoneNumber,
				},
				raw: true,
			});

			if (!created) {
				return 'User Request Already Sent';
			}

			console.log(
				`${this.constants.BASE_URL_FOR_EMAIL}/#/userProfileSetup?email=${email}&permissions=POCReviewer`
			);

			const emailBody = `
			<img src="cid:jbook-newsletter-header" width="100%"/><br/>
			<p>Hello ${toName},</p>
			<p>Per the FY21 NDAA, the Department of Defense is required to identify and report on all artificial intelligence-related programs and their cost. The Joint Artificial Intelligence Center (JAIC) and Advana teams have partnered to create the Budget Justification Book (JBOOK) Search application in order to meet this requirement.</p>
			<p>You have been identified as a point of contact to provide information regarding at least one program that is possibly related to artificial intelligence, which we would like to verify through your review using the link below. Completion of your review is required by 04 March 2022.</p>
			<p>Please visit the link below to access the JBOOK Search application and get started.</p>
			<p>
			---------------------------------------------------------------------------------------------------------------------------<br/>
			Follow Link: <a href="${this.constants.BASE_URL_FOR_EMAIL}/#/userProfileSetup?email=${email}&permissions=POCReviewer">Link</a><br/>
			---------------------------------------------------------------------------------------------------------------------------
			</p>
			<p>Please do not forward this email as the link is unique to you.</p>
			<p>
			Sincerely,<br/>
			The JBOOK Search Team
			</p>
			<img src="cid:jbook-newsletter-footer" width="100%"/><br/>`;
			const attachment = [
				{
					filename: 'jbook-newsletter-header.png',
					path: __dirname + '/../../images/email/JBOOK Search API Newsletter.png',
					cid: 'jbook-newsletter-header',
				},
				{
					filename: 'jbook-newsletter-footer.png',
					path: __dirname + '/../../images/email/JBOOK Search Newsletter.png',
					cid: 'jbook-newsletter-footer',
				},
			];
			await this.emailUtility.sendEmail(
				emailBody,
				'JBOOK Search POC Reviewer: Application Access',
				email,
				this.constants.ADVANA_EMAIL_CC,
				attachment,
				userId
			);
		} catch (err) {
			this.logger.error(err, 'DNZEUJD', userId);
		}
	}

	async sendServiceEmail(userId, toName, email, organization, phoneNumber) {
		try {
			// First check to make sure an email has not already been sent for this user.
			const [, created] = await this.userRequest.findOrCreate({
				where: { email: email },
				defaults: {
					email: email,
					organization: organization,
					phone_number: phoneNumber,
				},
				raw: true,
			});

			if (!created) {
				return 'User Request Already Sent';
			}

			console.log(
				`${this.constants.BASE_URL_FOR_EMAIL}/#/userProfileSetup?email=${email}&permissions=ServiceReviewer`
			);

			const emailBody = `
			<img src="cid:jbook-newsletter-header" width="100%"/><br/>
			<p>Hello ${toName},</p>
			<p>Per the FY21 NDAA, the Department of Defense is required to identify and report on all artificial intelligence-related programs and their cost. The Joint Artificial Intelligence Center (JAIC) and Advana teams have partnered to create the Budget Justification Book (JBOOK) Search application in order to meet this requirement.</p>
			<p>You have been identified as a service reviewer to provide information regarding at least one program that is possibly related to artificial intelligence, which we would like to verify through your review using the link below. Completion of your review is required by 04 March 2022.</p>
			<p>Please visit the link below to access the JBOOK Search application and get started.</p>
			<p>
			---------------------------------------------------------------------------------------------------------------------------<br/>
			Follow Link: <a href="${this.constants.BASE_URL_FOR_EMAIL}/#/userProfileSetup?email=${email}&permissions=ServiceReviewer">LINK</a><br/>
			---------------------------------------------------------------------------------------------------------------------------
			</p>
			<p>Please do not forward this email as the link is unique to you.</p>
			<p>
			Sincerely,<br/>
			The JBOOK Search Team
			</p>
			<img src="cid:jbook-newsletter-footer" width="100%"/><br/>`;
			const attachment = [
				{
					filename: 'jbook-newsletter-header.png',
					path: __dirname + '/../../images/email/JBOOK Search API Newsletter.png',
					cid: 'jbook-newsletter-header',
				},
				{
					filename: 'jbook-newsletter-footer.png',
					path: __dirname + '/../../images/email/JBOOK Search Newsletter.png',
					cid: 'jbook-newsletter-footer',
				},
			];
			await this.emailUtility.sendEmail(
				emailBody,
				'JBOOK Search Service Reviewer: Application Access',
				email,
				this.constants.ADVANA_EMAIL_CC,
				attachment,
				userId
			);
		} catch (err) {
			this.logger.error(err, 'B4E39XB', userId);
		}
	}
}

module.exports = JBookDataHandler;
