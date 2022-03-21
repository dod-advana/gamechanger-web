const LOGGER = require('@dod-advana/advana-logger');
const sparkMD5Lib = require('spark-md5');
const APP_SETTINGS = require('../models').app_settings;
const REVIEW = require('../models').review;
const PDOC = require('../models').pdoc;
const RDOC = require('../models').rdoc;
const ODOC = require('../models').om;
const SearchUtility = require('../utils/searchUtility');
const constantsFile = require('../config/constants');
const { Op } = require('sequelize');
const Excel = require('exceljs');
const EmailUtility = require('../utils/emailUtility');
const JBookSearchUtility = require('../modules/jbook/jbookSearchUtility');
const DB = require('../models/index');

class ReviewController {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			sparkMD5 = sparkMD5Lib,
			appSettings = APP_SETTINGS,
			searchUtility = new SearchUtility(opts),
			jbookSearchUtility = new JBookSearchUtility(opts),
			constants = constantsFile,
			review = REVIEW,
			pdoc = PDOC,
			rdoc = RDOC,
			odoc = ODOC,
			db = DB
		} = opts;

		this.logger = logger;
		this.sparkMD5 = sparkMD5;
		this.appSettings = appSettings;
		this.searchUtility = searchUtility;
		this.constants = constants;
		this.review = review;
		this.pdoc = pdoc;
		this.rdoc = rdoc;
		this.odoc = odoc;
		this.jbookSearchUtility = jbookSearchUtility;
		this.db = db;

		let transportOptions = constants.ADVANA_EMAIL_TRANSPORT_OPTIONS;

		//apply TLS configs to smtp transport as appropriate from env vars
		if (process.env.EMAIL_REQUIRE_TLS?.toUpperCase() === 'TRUE') {
			transportOptions.requireTLS = process.env.EMAIL_REQUIRE_TLS;
			transportOptions.tls = {
				servername: process.env.EMAIL_TLS_SERVERNAME || ''
			};
		}

		this.emailUtility = new EmailUtility({
			transportOptions,
			fromName: constants.ADVANA_EMAIL_CONTACT_NAME,
			fromEmail: constants.ADVANA_NOREPLY_EMAIL_ADDRESS,
		});

		this.sendReviewStatusUpdates = this.sendReviewStatusUpdates.bind(this);
		this.getProfilePageLinkForReview = this.getProfilePageLinkForReview.bind(this);
		this.sendReviewStatusEmail = this.sendReviewStatusEmail.bind(this);
	}

	async sendReviewStatusUpdates(req, res) {
		let userId = 'webapp_unknown';

		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const { emails = [] } = req.body;

			// Gather all the reviews that have not been completed and that have primary reviewer
			const [pSelect, rSelect, oSelect] = this.jbookSearchUtility.buildSelectQuery();
			const [pWhere, rWhere, oWhere] = this.jbookSearchUtility.buildStatusUpdateWhereQuery();

			const pQuery = pSelect + pWhere;
			const rQuery = rSelect + rWhere;
			const oQuery = oSelect + oWhere;

			let giantQuery = `${pQuery} UNION ALL ${rQuery} UNION ALL ${oQuery};`;

			let data =  await this.db.jbook.query(giantQuery);

			// Split reviews out to which section are not completed but only if the previous section is completed
			const primaryReviewsNeedingFinished = [];
			const serviceReviewsNeedingFinished = [];
			const pocReviewsNeedingFinished = [];

			if (data[0]) {
				data[0].forEach(review => {
					if (review.primaryReviewStatus !== 'Finished Review') {
						primaryReviewsNeedingFinished.push(review);
						return;
					}

					if (review.serviceReviewStatus !== 'Finished Review') {
						serviceReviewsNeedingFinished.push(review);
						return;
					}

					if (review.pocReviewStatus !== 'Finished Review') {
						pocReviewsNeedingFinished.push(review);
						return;
					}
				});
			}

			// Create data for export
			const filename = 'ReviewStatus.xlsx';
			let workbook = new Excel.Workbook();
			let primaryReviewerStatus = workbook.addWorksheet('PrimaryReviewerStatus');
			let serviceReviewerStatus = workbook.addWorksheet('ServiceReviewerStatus');
			let pocReviewerStatus = workbook.addWorksheet('POCReviewerStatus');

			const columns = [
				{ header: 'Name', key: 'name', width: 30},
				{ header: 'Email', key: 'email', width: 35},
				{ header: 'Organization', key: 'org', width: 30},
				{ header: 'Profile Page Link', key: 'profile_page_link', width: 30},
				{ header: 'Status', key: 'status', width: 20},
			];

			primaryReviewerStatus.columns = columns;
			serviceReviewerStatus.columns = columns;
			pocReviewerStatus.columns = columns;

			const primaryLinks = [];
			const serviceLinks = [];
			const pocLinks = [];

			const linkStyle = {
				underline: true,
				color: { argb: 'FF0000FF' },
			};
			const headerStyle = {
				size: 14,
				bold: true
			};

			let row = 1;
			for (const review of primaryReviewsNeedingFinished) {
				primaryReviewerStatus.addRow({
					name: review.primaryReviewer,
					email: review.primary_reviewer_email || 'N/A',
					org: review.primary_reviewer_org || 'N/A',
					profile_page_link: { text: 'Click to View Profile Page', hyperlink: await this.getProfilePageLinkForReview(review)},
					status: review.primaryReviewStatus
				});
				primaryLinks.push({row: row, column: 4});
				row += 1;
			}

			this.applyLinkStyle(primaryReviewerStatus, primaryLinks, linkStyle);

			row = 1;
			for (const review of serviceReviewsNeedingFinished) {
				serviceReviewerStatus.addRow({
					name: review.serviceReviewer,
					email: review.service_reviewer_email || 'N/A',
					org: review.service_reviewer_org || 'N/A',
					profile_page_link: { text: 'Click to View Profile Page', hyperlink: await this.getProfilePageLinkForReview(review)},
					status: review.serviceReviewStatus
				});
				serviceLinks.push({row: row, column: 4});
				row += 1;
			}
			this.applyLinkStyle(serviceReviewerStatus, serviceLinks, linkStyle);

			row = 1;
			for (const review of pocReviewsNeedingFinished) {
				pocReviewerStatus.addRow({
					name: review.servicePOCName,
					email: review.servicePOCEmail || 'N/A',
					org: review.servicePOCOrg || 'N/A',
					profile_page_link: { text: 'Click to View Profile Page', hyperlink: await this.getProfilePageLinkForReview(review)},
					status: review.pocReviewStatus
				});
				pocLinks.push({row: row, column: 4});
				row += 1;
			}
			this.applyLinkStyle(pocReviewerStatus, pocLinks, linkStyle);

			// Style Headers
			const headers = [
				{row: 1, column: 1},
				{row: 1, column: 2},
				{row: 1, column: 3},
				{row: 1, column: 4},
				{row: 1, column: 5},
			];

			this.applyLinkStyle(primaryReviewerStatus, headers, headerStyle);
			this.applyLinkStyle(serviceReviewerStatus, headers, headerStyle);
			this.applyLinkStyle(pocReviewerStatus, headers, headerStyle);

			const buffer = await workbook.xlsx.writeBuffer();
			const attachment = {
				filename,
				content: buffer,
				contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			};

			if (await this.sendReviewStatusEmail(attachment, emails, userId)) res.sendStatus(200);
			else res.sendStatus(500);
		} catch (err) {
			this.logger.error(err, '3CZM3SR', userId);
			res.status(500).send(err);
		}
	}



	applyLinkStyle(sheet, cells, style) {
		cells.forEach(cellInfo => {
			const cell = sheet.getRow(cellInfo.row).getCell(cellInfo.column);
			if (cell) {
				cell.font = style;
			}
		});
	}

	async getProfilePageLinkForReview(review) {
		const budgetYear = review.budgetYear;
		let type = review.budgetType;
		const programElement = review.programElement;
		const projectNum = review.projectNum;
		const budgetLineItem = review.budgetLineItem;
		const id = review.id;
		const appropriationNumber = review.appropriationNumber;

		if (type === 'rdoc') type = encodeURIComponent('RDT&E');
		if (type === 'odoc') type = encodeURIComponent('O&M');
		if (type === 'pdoc') type = 'Procurement';

		return `${this.constants.BASE_URL_FOR_EMAIL}/#/profile?programElement=${programElement}&projectNum=${projectNum}&type=${type}&budgetLineItem=${budgetLineItem}&budgetYear=${budgetYear}&id=${id}&appropriationNumber=${appropriationNumber}`;
	}

	async sendReviewStatusEmail(excelAttachment, emails, userId) {
		try {
			const emailBody = `
			<img src="cid:jbook-newsletter-header" width="100%"/><br/>
			<p>Hello,</p>
			<p>Attached is the requested status updates for any outstanding reviews broken down by section.</p>
			<p>Please see the "ReviewStatus.xlsx" file attached to this email.</p>
			<p>
			Sincerely,<br/>
			The JBOOK team
			</p>
			<img src="cid:jbook-newsletter-footer" width="100%"/><br/>`;
			const attachment = [
				{
					filename: 'jbook-newsletter-header.png',
					path: __dirname + '/../images/email/JBOOK Search API Newsletter.png',
					cid: 'jbook-newsletter-header'
				},
				{
					filename: 'jbook-newsletter-footer.png',
					path: __dirname + '/../images/email/JBOOK Search Newsletter.png',
					cid: 'jbook-newsletter-footer'
				},
				excelAttachment
			];
			await this.emailUtility.sendEmail(emailBody,'JBOOK Review Status', emails, null, attachment, userId);
        	return true;
		} catch (err) {
			this.logger.error(err, '164X80Q', userId);
			return false;
		}
	}
}

module.exports.ReviewController = ReviewController;