const PDOC = require('../../models').pdoc;
const RDOC = require('../../models').rdoc;
const OM = require('../../models').om;
const ACCOMP = require('../../models').rdoc_accomp;
const REVIEW = require('../../models').review;
const KEYWORD_ASSOC = require('../../models').keyword_assoc;
const KEYWORD = require('../../models').keyword;
const VENDORS = require('../../models').vendor;
const USER_REQUEST = require('../../models').user_request;
const GL_CONTRACTS = require('../../models').gl_contracts;
const OBLIGATIONS = require('../../models').obligations_expenditures;
const REVIEWER = require('../../models').reviewer;
const FEEDBACK = require('../../models').feedback;
const PORTFOLIO = require('../../models').portfolio;
const constantsFile = require('../../config/constants');
const GL = require('../../models').gl;
const { Sequelize } = require('sequelize');
const DB = require('../../models/index');
const Op = Sequelize.Op;
const EmailUtility = require('../../utils/emailUtility');
const DataHandler = require('../base/dataHandler');
const SearchUtility = require('../../utils/searchUtility');
const JBookSearchUtility = require('./jbookSearchUtility');
const { DataLibrary } = require('../../lib/dataLibrary');

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
			accomp = ACCOMP,
			review = REVIEW,
			searchUtility = new SearchUtility(opts),
			jbookSearchUtility = new JBookSearchUtility(opts),
			constants = constantsFile,
			keyword_assoc = KEYWORD_ASSOC,
			keyword = KEYWORD,
			gl = GL,
			db = DB,
			vendors = VENDORS,
			userRequest = USER_REQUEST,
			gl_contracts = GL_CONTRACTS,
			obligations = OBLIGATIONS,
			reviewer = REVIEWER,
			feedback = FEEDBACK,
			portfolio = PORTFOLIO,
			dataLibrary = new DataLibrary(opts),
		} = opts;

		super({ ...opts });

		this.pdocs = pdoc;
		this.rdocs = rdoc;
		this.om = om;
		this.accomp = accomp;
		this.rev = review;
		this.searchUtility = searchUtility;
		this.jbookSearchUtility = jbookSearchUtility;
		this.constants = constants;
		this.gl = gl;
		this.keyword_assoc = keyword_assoc;
		this.keyword = keyword;
		this.db = db;
		this.vendors = vendors;
		this.userRequest = userRequest;
		this.gl_contracts = gl_contracts;
		this.obligations = obligations;
		this.reviewer = reviewer;
		this.feedback = feedback;
		this.portfolio = portfolio;
		this.searchUtility = searchUtility;
		this.dataLibrary = dataLibrary;
		this.portfolio = portfolio;

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

	// budget line item : pdoc and project num : rdoc
	async getProjectData(req, userId) {
		const { useElasticSearch = false } = req.body;

		if (useElasticSearch) {
			return this.getESProjectData(req, userId);
		} else {
			return this.getPGProjectData(req, userId);
		}
	}

	async getESProjectData(req, userId) {
		try {
			const { id, type } = req.body;

			const keys = id.split('#');

			// pdoc#${review.budget_line_item}#${review.budget_year}#${review.appn_num}#0${review.budget_activity}#${review.agency}
			// rdoc#${review.program_element}#${review.budget_line_item}#${review.budget_year}#${review.appn_num}#0${review.budget_activity}#${review.agency}
			// odoc#${review.budget_line_item}#${review.program_element}#${review.budget_year}#${review.appn_num}#0${review.budget_activity}#${review.agency}

			let budgetYear;
			const budgetType = keys[0];
			let budgetCycle;
			let budgetActivityNumber;
			let budgetLineItem;
			let programElement;
			let serviceAgency;
			let projectNum;
			let appropriationNumber;

			switch (budgetType) {
				case 'pdoc':
					budgetLineItem = keys[1];
					budgetYear = keys[2];
					appropriationNumber = keys[3];
					budgetActivityNumber = keys[4];
					serviceAgency = keys[5];
					break;
				case 'rdoc':
					programElement = keys[1];
					budgetLineItem = keys[2];
					budgetYear = keys[3];
					appropriationNumber = keys[4];
					budgetActivityNumber = keys[5];
					serviceAgency = keys[6];
					break;
				case 'odoc':
					budgetLineItem = keys[1];
					programElement = keys[2];
					budgetYear = keys[3];
					appropriationNumber = keys[4];
					budgetActivityNumber = keys[5];
					serviceAgency = keys[6];
					break;
				default:
					break;
			}

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
			if (!data.currentYearAmount) {
			}

			data.review = await this.getReviewData(
				{
					budgetYear,
					appropriationNumber,
					budgetActivityNumber,
					serviceAgency,
					budgetLineItem,
					programElement,
					projectNum: budgetLineItem,
				},
				type,
				0
			);

			return data;
		} catch (err) {
			this.logger.error(err, '6T0ILGP', userId);
			return [];
		}
	}

	async getPGProjectData(req, userId) {
		// projectNum here is also budgetLineItem (from list view)
		try {
			const { type, id } = req.body;
			let docType = type;
			let data;
			let totalBudget = 0;

			switch (docType) {
				case 'Procurement':
					data = await this.pdocs.findOne({
						where: {
							id,
						},
					});
					break;
				case 'RDT&E':
					data = await this.rdocs.findOne({
						where: {
							id,
						},
					});
					break;
				case 'O&M':
					data = await this.om.findOne({
						where: {
							id,
						},
					});
					break;
				default:
					break;
			}

			docType = types[docType];

			if (data && data.dataValues) {
				data = this.jbookSearchUtility.parseFields(data.dataValues, false, docType);

				if (!data.currentYearAmount) {
					let maxVal = null;
					try {
						if (docType === 'pdoc') {
							maxVal = await this.pdocs.findAll({
								attributes: [
									Sequelize.fn('MAX', Sequelize.col('P40-79_TOA_BY1Base')),
									'currentYearAmountMax',
								],
							});
						} else if (docType === 'rdoc') {
							maxVal = await this.rdocs.findAll({
								attributes: [
									Sequelize.fn('MAX', Sequelize.col('Proj_Fund_BY1')),
									'currentYearAmountMax',
								],
							});
						} else if (docType === 'odoc') {
							// om doesn't have a currentYearAmount currently
							// maxVal = this.om.findAll({
							// 	attributes: [
							// 		sequelize.fn('MAX', sequelize.col(''))
							// 	]
							// });
						}
					} catch {
						console.log('Error fetching max values');
					}

					if (maxVal && maxVal.dataValues) {
						data.currentYearAmountMax = maxVal.dataValues.currentYearAmountMax;
					}
				}

				// CONTRACTS
				let contracts = [];
				try {
					if (docType === 'pdoc') {
						contracts = await this.gl_contracts.findAll({
							where: {
								bli: data.budgetLineItem,
								ba_number: data.budgetActivityNumber,
								appn_num: data.appropriationNumber,
								service_agency: data.serviceAgency,
								budget_type: 'pdoc',
							},
						});
					} else if (docType === 'rdoc') {
						let query = {
							bli: data.programElement,
							ba_number: data.budgetActivityNumber,
							appn_num: data.appropriationNumber,
							service_agency: data.serviceAgency,
							budget_type: 'rdoc',
							// projnumber: projectNum
						};

						contracts = await this.gl_contracts.findAll({
							where: query,
						});

						// if (contracts.length === 0) {
						// 	delete query.projnumber;

						// 	contracts = await this.gl_contracts.findAll({
						// 		where: query
						// 	});
						// }
					}

					const parsedContracts = [];
					for (let contract of contracts) {
						parsedContracts.push(
							this.jbookSearchUtility.parseFields(contract.dataValues, false, 'glContract')
						);
					}

					data.contracts = parsedContracts;
				} catch (err) {
					console.log('Error fetching for contracts');
					console.log(err);
				}

				// OBLIGATIONS AND EXPENDITURES
				let obligations = [];
				try {
					if (docType === 'pdoc') {
						obligations = await this.obligations.findAll({
							where: {
								doc_type: 'pdoc',
								bli: data.budgetLineItem,
								ba_num: data.budgetActivityNumber,
								appn_num: data.appropriationNumber,
								begfy: data.budgetYear,
							},
							order: [['yearmonth', 'DESC']],
						});
					} else if (docType === 'rdoc') {
						obligations = await this.obligations.findAll({
							where: {
								doc_type: 'rdoc',
								bli: data.programElement,
								ba_num:
									data.budgetActivityNumber.length < 2
										? data.budgetActivityNumber.padStart(2, '0')
										: data.budgetActivityNumber,
								appn_num: data.appropriationNumber,
								begfy: data.budgetYear,
							},
							order: [['yearmonth', 'DESC']],
						});
					}

					const parsedObligations = [];
					for (let obligation of obligations) {
						parsedObligations.push(
							this.jbookSearchUtility.parseFields(obligation.dataValues, false, 'obligation')
						);
					}
					data.obligations = parsedObligations;
				} catch (err) {
					console.log('Error fetching for obligations');
					console.log(err);
				}

				// ACCOMPLISHMENTS
				let accomplishments = [];
				try {
					accomplishments = await this.accomp.findAll({
						where: {
							PE_Num: data.programElement || '',
							Proj_Number: data.projectNum || '',
							BudgetYear: data.budgetYear,
						},
					});
					if (accomplishments && accomplishments.length && accomplishments.length > 0) {
						for (let accomp in accomplishments) {
							accomp = this.jbookSearchUtility.parseFields(accomp, false, 'accomplishment');
						}
						data.accomplishments = accomplishments;
					}
				} catch (err) {
					console.log('Error fetching for accomplishments:');
					console.log(err);
				}

				// KEYWORDS
				let keywords;
				try {
					let keywordAssocWhere;
					switch (type) {
						case 'Procurement':
							keywordAssocWhere = 'pdoc_id';
							break;
						case 'RDT&E':
							keywordAssocWhere = 'rdoc_id';
							break;
						case 'O&M':
							keywordAssocWhere = 'om_id';
							break;
						default:
							break;
					}

					const query = `SELECT ARRAY_AGG(distinct keyword_id) as keyword_ids FROM keyword_assoc WHERE ${keywordAssocWhere} = :keywordAssocId;`;
					const keyWordIdData = await this.db.jbook.query(query, { replacements: { keywordAssocId: id } });
					const keywordIDs = keyWordIdData[0][0].keyword_ids
						? keyWordIdData[0][0].keyword_ids.map((i) => Number(i))
						: [];

					const keywordsData = await this.keyword.findAll({
						where: { id: { [Op.in]: keywordIDs } },
						raw: true,
					});
					keywords = keywordsData.map((data) => {
						return data.name.replace(/\*/g, '');
					});
				} catch (err) {
					console.log('Error fetching for keywords:');
					console.log(err);
				}
				data.keywords = keywords;

				// REVIEW
				data.review = await this.getReviewData(data, type, totalBudget);

				// VENDORS
				let vendorData = [];
				try {
					if (type === 'RDT&E') {
						vendorData = await this.vendors.findAll({
							attributes: [Sequelize.fn('DISTINCT', Sequelize.col('vendor_name')), 'vendor_name'],
							where: { pe_num: data.programElement },
							raw: true,
						});
					}
					if (vendorData.length <= 0) {
						vendorData = await this.vendors.findAll({
							attributes: [Sequelize.fn('DISTINCT', Sequelize.col('vendor_name')), 'vendor_name'],
							raw: true,
						});
					}
					data.vendors = vendorData
						? vendorData.map((vendor) => {
								return vendor.vendor_name;
						  })
						: undefined;
				} catch (err) {
					console.log('Error fetching for vendor data');
					console.log(err);
				}
			}

			return data;
		} catch (err) {
			this.logger.error(err, 'N49863Q', userId);
			return [];
		}
	}

	async getReviewData(data, type, totalBudget) {
		let review = {};
		try {
			const query = {
				budget_type: types[type],
				budget_year: data.budgetYear,
				appn_num: { [Op.iLike]: `${data.appropriationNumber}%` },
				budget_activity: data.budgetActivityNumber,
				agency: data.serviceAgency,
			};

			// in review table, budget_line_item is also projectNum

			switch (type) {
				case 'Procurement':
					query.budget_line_item = data.budgetLineItem;
					break;
				case 'RDT&E':
					query.program_element = data.programElement;
					query.budget_line_item = data.projectNum;
					break;
				case 'O&M':
					query.budget_line_item = data.budgetLineItem;
					query.program_element = data.programElement;
					break;
				default:
					break;
			}

			review = await this.rev.findOne({
				where: query,
			});

			// console.log(review)
			if (review && review.dataValues) {
				// parse mission partners
				if (review.service_mp_list && typeof review.service_mp_list === 'string') {
					review.service_mp_list = review.service_mp_list
						.replace(/\[|\]|\\/g, '')
						.split(';')
						.join('|');
				}

				review = this.jbookSearchUtility.parseFields(review.dataValues, false, 'review');
				review.totalBudget = totalBudget;
			}

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
				const secName = review.serviceSecondaryReviewer
					? review.serviceSecondaryReviewer.split('(')[0].trim()
					: '';
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
		} catch (err) {
			console.log('Error fetching for review');
			console.log(err);
		}
		return review;
	}

	async getBudgetDropdownData(req, userId) {
		try {
			// const reviewers = await this.pdocs.findAll({
			//     attributes: [Sequelize.fn('DISTINCT', Sequelize.col('reviewer')), 'reviewer']
			// });

			// const coreAILabel = await this.pdocs.findAll({
			//     attributes: [Sequelize.fn('DISTINCT', Sequelize.col('core_ai_label')), 'core_ai_label']
			// });

			// const serviceReviewer = await this.pdocs.findAll({
			//     attributes: [Sequelize.fn('DISTINCT', Sequelize.col('service_review')), 'service_review']
			// });

			// const reviewStat = await this.pdocs.findAll({
			//     attributes: [Sequelize.fn('DISTINCT', Sequelize.col('jaic_review_stat')), 'jaic_review_stat']
			// });

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

			// const missionPartners = await this.pdocs.findAll({
			//     attributes: [Sequelize.fn('DISTINCT', Sequelize.col('current_msn_part')), 'current_msn_part']
			// });

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

	async getBudgetReview(req, userId) {
		const { btype, programElement, bli } = req.body;
		try {
			this.rev
				.findAll({
					where: {
						budget_type: btype,
						program_element: programElement,
						budget_line_item: bli,
					},
				})
				.then((results) => {
					return { review: results, timeStamp: new Date().toISOString() };
				});
		} catch (err) {
			this.logger.error(err, '9BN7UGJ', userId);
			return {};
		}
	}

	async storeBudgetReview(req, userId) {
		try {
			const { frontendReviewData, isSubmit, reviewType, projectNum, appropriationNumber } = req.body;
			const permissions = req.permissions;

			if (this.constants.JBOOK_USE_PERMISSIONS === 'true' && !permissions.includes('JBOOK Admin')) {
				if (reviewType === 'jaic' && !permissions.includes('JBOOK Primary Reviewer')) {
					throw 'Unauthorized';
				} else if (reviewType === 'service' && !permissions.includes('JBOOK Service Reviewer')) {
					throw 'Unauthorized';
				} else if (reviewType === 'poc' && !permissions.includes('JBOOK POC Reviewer')) {
					throw 'Unauthorized';
				}
			}

			if (!isSubmit) {
				frontendReviewData[reviewType + 'ReviewStatus'] = 'Partial Review';
			} else {
				frontendReviewData[reviewType + 'ReviewStatus'] = 'Finished Review';
			}
			// Review Status Update logic
			const { primaryReviewStatus, serviceReviewStatus, pocReviewStatus } = frontendReviewData;
			let status = '';
			if (primaryReviewStatus === 'Finished Review') {
				if (serviceReviewStatus === 'Finished Review') {
					if (pocReviewStatus === 'Finished Review') {
						status = 'Finished Review';
					} else {
						status = 'Partial Review (POC)';
					}
				} else {
					status = 'Partial Review (Service)';
				}
			} else if (primaryReviewStatus === 'Partial Review') {
				status = 'Partial Review (Primary)';
			} else {
				status = 'Needs Review';
			}
			frontendReviewData['reviewStatus'] = status;

			const reviewData = this.jbookSearchUtility.parseFields(frontendReviewData, true, 'review');

			const query = {
				budget_type: types[reviewData.budget_type],
				budget_year: reviewData.budget_year,
			};

			if (reviewData.budget_type === 'RDT&E') {
				query.program_element = reviewData.program_element;
				query.budget_line_item = projectNum;
				reviewData.budget_line_item = projectNum;
			} else if (reviewData.budget_type === 'Procurement') {
				query.budget_line_item = reviewData.budget_line_item;
			} else {
				query.budget_line_item = reviewData.budget_line_item;
				query.program_element = reviewData.program_element;
				query.budget_activity = appropriationNumber;
			}

			const [review, created] = await this.rev
				.findOrCreate({
					where: query,
					defaults: {
						...reviewData,
						budget_type: types[reviewData.budget_type],
					},
				})
				.catch((err) => {
					console.log('Error finding / creating review');
					console.log(err);
				});

			// If Submitting and POC info added email them letting them know.
			if (isSubmit && reviewType === 'service') {
				const info = await this.sendPOCEmail(
					userId,
					reviewData.service_poc_name,
					reviewData.service_poc_email,
					reviewData.service_poc_org,
					reviewData.poc_phone_number,
					false
				);
			}

			if (!isSubmit && reviewType === 'service') {
				if (reviewData.service_secondary_reviewer && reviewData.service_secondary_reviewer !== null) {
					const secondaryReviewer = await this.reviewer.findOne({
						where: {
							type: 'secondary',
							name: reviewData.service_secondary_reviewer.split('(')[0].trim(),
						},
						raw: true,
					});

					if (secondaryReviewer) {
						const serviceInfo = await this.sendServiceEmail(
							userId,
							reviewData.service_secondary_reviewer,
							secondaryReviewer.email,
							secondaryReviewer.organization,
							secondaryReviewer.phone_number
						);
					}
				}
			}

			if (!isSubmit && reviewType === 'poc') {
				const info = await this.sendPOCEmail(
					userId,
					reviewData.alternate_poc_name,
					reviewData.alternate_poc_email,
					reviewData.alternate_poc_org,
					reviewData.alternate_poc_phone_number,
					true
				);
			}

			// if an existing row, update
			if (!created) {
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

				return { created: result && result.length && result[0] === 1 };
			}

			return { created };
		} catch (err) {
			this.logger.error(err, 'GZ3D0DR', userId);
			return {};
		}
	}

	async reenableForm(req, userId) {
		try {
			const { programElement, budgetType, reviewType, budgetLineItem, projectNum, appropriationNumber } =
				req.body;

			const query = {
				budget_type: types[budgetType],
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

			const review = await this.rev.update(update, {
				where: query,
			});

			return review;
		} catch (err) {
			this.logger.error(err, 'S2CZ29P', userId);
			return {};
		}
	}

	async submitFeedbackForm(req, userId) {
		try {
			const { feedbackForm } = req.body;
			return this.feedback.create(feedbackForm);
		} catch (err) {
			this.logger.error(err, '9BN7UG1', userId);
			console.log(err);
			return false;
		}
	}

	async getUserSpecificReviews(req, userId) {
		try {
			const { permissions, email } = req.body;

			let primaryReviewer;
			let serviceReviewer;
			let secondaryReviewer;

			const jbookSearchSettings = {};

			if (permissions.primary) {
				primaryReviewer = await this.reviewer.findOne({
					where: {
						type: 'primary',
						email: email,
					},
					raw: true,
				});

				if (primaryReviewer !== null) {
					primaryReviewer = `${primaryReviewer.name}${
						primaryReviewer.organization &&
						primaryReviewer.organization.length &&
						primaryReviewer.organization.length > 1
							? ` (${primaryReviewer.organization})`
							: ''
					}`;
				}
			}

			if (permissions.service) {
				serviceReviewer = await this.reviewer.findOne({
					where: {
						type: 'service',
						email: email,
					},
					raw: true,
				});
				if (serviceReviewer !== null) {
					serviceReviewer = `${serviceReviewer.name}${
						serviceReviewer.organization &&
						serviceReviewer.organization.length &&
						serviceReviewer.organization.length > 1
							? ` (${serviceReviewer.organization})`
							: ''
					}`;
				}

				secondaryReviewer = await this.reviewer.findOne({
					where: {
						type: 'secondary',
						email: email,
					},
					raw: true,
				});
				if (secondaryReviewer !== null) {
					secondaryReviewer = `${secondaryReviewer.name}${
						secondaryReviewer.organization &&
						secondaryReviewer.organization.length &&
						secondaryReviewer.organization.length > 1
							? ` (${secondaryReviewer.organization})`
							: ''
					}`;
				}
			}

			if (primaryReviewer && primaryReviewer !== null) {
				jbookSearchSettings['primaryReviewerForUserDash'] = primaryReviewer;
			}

			if (serviceReviewer && serviceReviewer !== null) {
				jbookSearchSettings['serviceReviewerForUserDash'] = [serviceReviewer];
			}

			if (secondaryReviewer && secondaryReviewer !== null) {
				if (jbookSearchSettings.hasOwnProperty(serviceReviewer))
					jbookSearchSettings['serviceReviewerForUserDash'].push(secondaryReviewer);
				else jbookSearchSettings['serviceReviewerForUserDash'] = [secondaryReviewer];
			}

			if (permissions.poc) {
				jbookSearchSettings['pocReviewerEmailForUserDash'] = email;
			}

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
			return this.getESContractTotals(req, userId);
		} else {
			return this.getPGContractTotals(req, userId);
		}
	}

	async getESContractTotals(req, userId) {
		try {
			return { contractTotals: {} };
		} catch (e) {
			const { message } = e;
			this.logger.error(message, '0Z82N92', userId);
			return { contractTotals: {} };
		}
	}

	async getPGContractTotals(req, userId) {
		try {
			const { searchText, jbookSearchSettings } = req.body;
			const perms = req.permissions;

			const hasSearchText = searchText && searchText !== '';

			const [pSelect, rSelect, oSelect] = this.jbookSearchUtility.buildSelectQuery();
			const [pWhere, rWhere, oWhere] = this.jbookSearchUtility.buildWhereQuery(
				jbookSearchSettings,
				hasSearchText,
				null,
				perms,
				userId
			);

			const pQuery = pSelect + pWhere;
			const rQuery = rSelect + rWhere;
			const oQuery = oSelect + oWhere;

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
			// if (!jbookSearchSettings.budgetType || jbookSearchSettings.budgetType.indexOf('O&M') !== -1) {
			// 	if (giantQuery.length === 0) {
			// 		giantQuery = oQuery;
			// 	} else {
			// 		giantQuery += ` UNION ALL ` + oQuery;
			// 	}
			// }

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

	async getPortfolios(req, userId) {
		try {
			const portfolios = await this.portfolio.findAll({
				where: {
					deleted: false,
				},
			});
			return portfolios;
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
					return await this.getProjectData(req, userId);
				case 'getBudgetDropdownData':
					return await this.getBudgetDropdownData(req, userId);
				case 'getBudgetReview':
					return await this.getBudgetReview(req, userId);
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
					return await this.getPortfolios(req, userId);
				case 'getPortfolio':
					return await this.getPortfolio(req, userId);
				case 'editPortfolio':
					return await this.editPortfolio(req, userId);
				case 'deletePortfolio':
					return await this.deletePortfolio(req, userId);
				case 'createPortfolio':
					return await this.createPortfolio(req, userId);
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

	async sendPOCEmail(userId, toName, email, organization, phoneNumber, isAlternate = false) {
		try {
			// First check to make sure an email has not already been sent for this user.
			const [request, created] = await this.userRequest.findOrCreate({
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

	async sendServiceEmail(userId, toName, email, organization, phoneNumber, isAlternate = false) {
		try {
			// First check to make sure an email has not already been sent for this user.
			const [request, created] = await this.userRequest.findOrCreate({
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
