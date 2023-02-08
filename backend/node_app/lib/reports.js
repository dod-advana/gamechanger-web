'use strict';
const pdfMakeLib = require('pdfmake');
const csvStringifyLib = require('csv-stringify');
const moment = require('moment-timezone');
const path = require('path');
const loggerLib = require('@dod-advana/advana-logger');
const BudgetSearchUtility = require('../modules/jbook/jbookSearchUtility');
const ACCOMP = require('../models').rdoc_accomp;

class Reports {
	constructor(opts = {}) {
		const {
			logger = loggerLib,
			csvStringify = csvStringifyLib,
			pdfMake = pdfMakeLib,
			budgetSearchUtility = new BudgetSearchUtility(opts),
			accomp = ACCOMP,
		} = opts;

		this.logger = logger;
		this.csvStringify = csvStringify;
		this.pdfMake = pdfMake;
		this.budgetSearchUtility = budgetSearchUtility;
		this.accomp = accomp;
	}

	createCsvStream(data, userId) {
		try {
			const stringifier = this.csvStringify({ delimiter: ',' });

			stringifier.on('error', (err) => {
				this.logger.error(err.message, 'NL71UTC', userId);
				throw new Error(err);
			});

			this.writeCsvData(stringifier, data);

			stringifier.end();
			return stringifier;
		} catch (e) {
			this.logger.error(e.message, '79XRPNA', userId);
			throw e;
		}
	}

	writeCsvData(stringifier, data) {
		if (data && data.docs && data.docs.length > 0 && data.docs[0].esIndex === 'gc_eda') {
			const header = ['ID', 'Filename', 'Title', 'Document Type', 'Page Count', 'Match Count'];
			stringifier.write(header);

			data.docs.forEach((doc) => {
				const item = [doc.id, doc.filename, doc.title, doc.type, doc.page_count, doc.pageHitCount];
				stringifier.write(item);
			});
		} else {
			const header = [
				'Filename',
				'Title',
				'Document Number',
				'Document Type',
				'Match Count',
				'Publishing Organization',
				'Publication Date',
				'Verified On',
				'Cancelled',
				'Keywords',
				'Topics',
				'Reference List',
			];
			stringifier.write(header);

			data.docs.forEach((doc) => {
				const item = [
					doc.filename,
					doc.title,
					doc.doc_num,
					doc.doc_type,
					doc.pageHitCount,
					doc.display_org_s,
					doc.publication_date_dt,
					doc.access_timestamp_dt,
					doc.is_revoked_b ? 'Yes' : 'No',
					doc.keyw_5,
					doc.topics_s,
					doc.ref_list,
				];
				stringifier.write(item);
			});
		}
	}

	jbookCreateCsvStream(data, userId, includeReviews = false) {
		try {
			const stringifier = this.csvStringify({ delimiter: ',' });
			stringifier.on('error', (err) => {
				this.logger.error(err.message, 'NL71UTC', userId);
				throw new Error(err);
			});
			this.jbookWriteCSV(stringifier, data, includeReviews);
			stringifier.end();
			return stringifier;
		} catch (e) {
			this.logger.error(e.message, '79XRPNA', userId);
			throw e;
		}
	}

	jbookWriteCSV(stringifier, data, includeReviews = false) {
		if (data && data.docs && data.docs.length > 0) {
			const header = [
				'Budget Year',
				'PL Title',
				'Service / Agency',
				'Main Account',
				'Appropriation Title',
				'Project',
				'Budget Activity',
				'Budget Sub Activity',
				'Program Element / BLI',
				'Project # (RDT&E Only)',
				'Total Funding',
				'BY1 Funding',
				'BY2 Funding',
				'BY3 Funding',
				'BY4 Funding',
				'BY5 Funding',
				'Has Keywords',
				'Keywords',
				'Initial Reviewer',
				...(includeReviews
					? [
							'Initial Reviewer AI Tagging Label',
							'Initial Reviewer Transition Partner',
							'Initial Reviewer Notes',
					  ]
					: []),
				'RAI Lead Reviewer',
				...(includeReviews
					? [
							'RAI Secondary Reviewer',
							'RAI AI Tagging Label Agree',
							'RAI AI Tagging Label',
							'RAI Transition Partner Agree',
							'RAI Transition Partner',
							'RAI Mission Partners',
							'RAI Review Notes',
					  ]
					: []),
				'POC Reviewer',
				...(includeReviews
					? [
							'POC Email',
							'POC Phone Number',
							'POC Organization',
							'POC AI Tagging Label Agree',
							'POC AI Tagging Label',
							'POC Transition Partner Agree',
							'POC Transition Partner',
							'POC Mission Partners Agree',
							'POC Mission Partners',
							'Dollars Attributed (M)',
							'Percentage Attributed (%)',
							'Joint Capability Area 1',
							'Joint Capability Area 2',
							'Joint Capability Area 3',
							'AI Role Description',
							'AI Domain',
							'AI Task',
							'AI Type',
							'AI Type Description',
							'Deployment System',
							'Intelligent System',
					  ]
					: []),
				'Review Status',
				'Labels',
				'Source',
				'Portfolio',
			];
			stringifier.write(header);

			data.docs.forEach((doc) => {
				const docData = doc.dataValues ?? doc;
				const item = [
					docData.budgetYear,
					docData.budgetType,
					docData.serviceAgency,
					docData.appropriationNumber,
					docData.appropriationTitle,
					docData.projectTitle,
					docData.budgetActivityNumber,
					docData.budgetActivityTitle ?? docData['P40-13_BSA_Title_t'],
					docData.programElement ?? docData.budgetLineItem_s,
					docData.projectNum,
					docData.totalCost,
					docData.by1Request ?? '',
					docData.proj_fund_by2_d ?? docData.p4082_toa_by2_d ?? '',
					docData.proj_fund_by3_d ?? docData.p4083_toa_by3_d ?? '',
					docData.proj_fund_by4_d ?? docData.p4084_toa_by4_d ?? '',
					docData.proj_fund_by5_d ?? docData.p4085_toa_by5_d ?? '',
					docData.hasKeywords ? 'Yes' : 'No',
					docData.keywords?.join(', '),
					docData.primary_reviewer_s,
					...(includeReviews
						? [
								docData.primaryClassLabel ?? '',
								docData.primaryPlannedTransitionPartner ?? '',
								docData.primaryReviewNotes ?? '',
						  ]
						: []),
					docData.service_reviewer_s,
					...(includeReviews
						? [
								docData.serviceSecondaryReviewer ?? '',
								docData.serviceAgreeLabel ?? '',
								docData.serviceClassLabel ?? '',
								docData.servicePTPAgreeLabel ?? '',
								docData.servicePlannedTransitionPartner ?? '',
								docData.serviceMissionPartnersList?.replace(/\|/g, ', '),
								docData.service_review_notes_s ?? '',
						  ]
						: []),
					this.getPocReviewer(docData) === 'N/A' && '',
					...(includeReviews
						? [
								this.getPocEmail(docData) === 'N/A' && '',
								this.getPocPhone(docData) === 'N/A' && '',
								this.getPocOrganization(docData) === 'N/A' && '',
								docData.pocAgreeLabel ?? '',
								docData.pocClassLabel ?? '',
								docData.pocPTPAgreeLabel ?? '',
								docData.pocPlannedTransitionPartner ?? '',
								docData.pocMPAgreeLabel ?? '',
								docData.pocMissionPartnersList ?? '',
								docData.pocDollarsAttributed ?? '',
								docData.pocPercentageAttributed ?? '',
								docData.pocJointCapabilityArea ?? '',
								docData.pocJointCapabilityArea2?.join(', '),
								docData.pocJointCapabilityArea3?.join(', '),
								docData.pocAIRoleDescription ?? '',
								docData.domainTask ?? '',
								docData.domainTaskSecondary?.join(', '),
								docData.pocAIType ?? '',
								docData.pocAITypeDescription ?? '',
								docData.roboticsSystemAgree ?? '',
								docData.intelligentSystemsAgree ?? '',
						  ]
						: []),
					docData.review_status_s,
					docData.primary_class_label_s,
					docData.source_tag_s,
					docData.portfolio_name_s,
				];
				stringifier.write(item);
			});
		}
	}

	createPdfBuffer(data, userId, settings, callback = () => {}) {
		try {
			const fonts = {
				Roboto: {
					normal: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Regular.ttf'),
					medium: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Medium.ttf'),
					bold: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Medium.ttf'),
					italics: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Italic.ttf'),
					bolditalics: path.join(__dirname, '../../static/fonts/Roboto/Roboto-BoldItalic.ttf'),
				},
			};
			const printer = new this.pdfMake(fonts);
			const docDefinition = this.constructCoverPage(data, settings);
			const doc = printer.createPdfKitDocument(docDefinition);

			let chunks = [];
			let result;
			doc.on('data', (chunk) => {
				chunks.push(chunk);
			});

			doc.on('end', () => {
				result = Buffer.concat(chunks);
				callback(result);
			});

			doc.end();
		} catch (e) {
			this.logger.error(e);
			this.logger.error(e.message, 'KRx98r1', userId);
		}
	}

	async createProfilePagePDFBuffer(data, userId, callback = () => {}) {
		try {
			const fonts = {
				Roboto: {
					normal: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Regular.ttf'),
					medium: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Medium.ttf'),
					bold: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Medium.ttf'),
					italics: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Italic.ttf'),
					bolditalics: path.join(__dirname, '../../static/fonts/Roboto/Roboto-BoldItalic.ttf'),
				},
				Times: {
					normal: path.join(__dirname, '../../static/fonts/Times/times-new-roman.ttf'),
					bold: path.join(__dirname, '../../static/fonts/Times/times-new-roman-bold.ttf'),
					italics: path.join(__dirname, '../../static/fonts/Times/times-new-roman-bold.ttf'),
					bolditalics: path.join(__dirname, '../../static/fonts/Times/times-new-roman-bold-italic.ttf'),
				},
			};

			const printer = new this.pdfMake(fonts);
			const docDefinition = await this.constructProfilePagePDF(data, userId);
			const doc = printer.createPdfKitDocument(docDefinition);

			let chunks = [];
			let result;
			doc.on('data', (chunk) => {
				chunks.push(chunk);
			});

			doc.on('end', () => {
				result = Buffer.concat(chunks);
				callback(result);
			});

			doc.end();
		} catch (e) {
			callback('', true);
			this.logger.error(e);
			this.logger.error(e.message, 'KRx98r2', userId);
		}
	}

	mp(relFontPath) {
		return path.resolve(__dirname, relFontPath);
	}

	constructCoverPage(data, settings) {
		const filters =
			settings.orgFilter !== undefined ? Object.keys(settings.orgFilter) : settings.orfFilterString ?? [];
		const orgFilter = filters.filter(function (key) {
			return settings.orgFilter[key];
		});

		const dataContent = data.docs.map(function (doc) {
			const snippets = doc.pageHits
				? doc.pageHits.map(function (snip) {
						const splitReplace = snip.snippet
							.toString()
							.replace(/<em>/g, '')
							.replace(/<\/em>/g, '');

						return {
							stack: [
								{ text: ' ' },
								{ text: 'Snippets: ', fontSize: 13 },
								{ text: ' ' },
								{ text: 'Page ' + snip.pageNumber ? snip.pageNumber : 'N/A' },
								{ text: ' ' },
								{ text: splitReplace },
								{ text: ' ' },
							],
						};
				  })
				: [];
			const displayTitle =
				doc.title === 'NA' ? `${doc.doc_type} ${doc.doc_num}` : `${doc.doc_type} ${doc.doc_num} - ${doc.title}`;
			return {
				stack: [
					{ text: displayTitle, style: 'title', id: doc.filename, tocItem: true },
					{ text: ' ' },
					{ text: 'Number of Page matches: ' + doc.pageHitCount },
					{ text: 'Publication Date: ' + doc.publication_date_dt },
					{ text: 'Verified On: ' + doc.access_timestamp_dt },
					{ text: `Cancelled: ${doc.is_revoked_b ? 'Yes' : 'No'}` },
					{ text: 'Document Type: ' + doc.display_doc_type_s },
					{ text: 'Publishing Organization: ' + doc.display_org_s },
					{
						canvas: [
							{
								type: 'line',
								x1: 0,
								y1: 8,
								x2: 513,
								y2: 8,
								linewidth: 1.5,
								lineColor: '#404040',
							},
						],
					},
					snippets,
					{ text: ' ' },
				],
				pageBreak: 'after',
			};
		});

		const sideMargin = 50;
		const timeZone = 'America/New_York';
		const date = timeZone ? moment.tz(timeZone) : moment();
		const dateString = `${date.format('MM/DD/YYYY')}`;
		const displaySearchTerm = data.searchTerms.join(' ');

		return {
			pageSize: 'LETTER',
			pageMargins: [50, 50, 50, 100],

			header: function (currentPage) {
				const marginBottom = currentPage > 1 ? 500 : 0;
				return {
					stack: [
						{
							text: dateString,
							style: 'title',
							absolutePosition: { x: sideMargin, y: 20 },
						},
						{ text: data.classificationMarking, alignment: 'center', style: 'classification' },
					],
					margin: [0, 0, 0, marginBottom],
				};
			},
			footer: function (currentPage) {
				const pageNumOffset = 8;
				return {
					stack: [
						{
							canvas: [
								{
									type: 'line',
									x1: 0,
									y1: 35,
									x2: 513,
									y2: 35,
									linewidth: 1.5,
									lineColor: '#404040',
									marginBottom: 10,
								},
							],
						},
						{ text: currentPage.toString(), alignment: 'right', style: 'pageNum' },
						{ text: 'GAMECHANGER | REPORT', alignment: 'center', style: 'footer' },
						{ text: data.classificationMarking, alignment: 'center', style: 'classification' },
					],
					margin: [sideMargin, 0, sideMargin - pageNumOffset, 0],
				};
			},
			content: [
				{
					image: this.mp('./ReportsImages/GAMECHANGER-Tagline_CMYK_@3x.png'),
					width: 250,
					alignment: 'center',
					marginTop: 100,
					link: settings.tiny_url,
				},
				{ text: ' ' },
				{ text: ' ' },
				{ text: ' ' },
				{ text: 'Search Settings', style: 'title' },
				{
					canvas: [
						{
							type: 'line',
							x1: 0,
							y1: 8,
							x2: 513,
							y2: 8,
							linewidth: 2,
							lineColor: '#404040',
						},
					],
				},
				{
					table: {
						widths: [100, '*'],
						body: [
							['Terms:', displaySearchTerm],
							['Matches:', data.docs.length],
							['Filters:', orgFilter.join(', ')],
							['Index:', settings.index],
						],
					},
					layout: 'noBorders',
					fontSize: 10,
				},
				{
					text: '\nOpen this search in GAMECHANGER',
					link: settings.tiny_url,
					decoration: 'underline',
					pageBreak: 'after',
				},
				{
					toc: {
						title: { text: 'Table of Contents', style: 'title' },
						numberStyle: { bold: true },
						textMargin: [0, 10, 0, 10],
					},
				},
				{ text: ' ' },
				{ text: ' ' },
				//documentList,
				{ text: '', pageBreak: 'after' },
				dataContent,
				{ text: '[Page Intentionally Left Blank]', marginTop: 301, alignment: 'center' },
			],
			styles: {
				title: {
					fontSize: 15,
					color: '#404040',
					marginTop: 15,
				},
				classification: {
					color: '#404040',
					fontSize: 11,
					marginTop: 5,
				},
				footer: {
					color: '#404040',
					fontSize: 11,
					marginTop: 5,
				},
				pageNum: {
					color: '#404040',
					fontSize: 11,
					marginTop: 5,
				},
				settingsTable: {
					fontSize: 11,
				},
			},
		};
	}

	async constructProfilePagePDF(fullData, userId, showPOC = true) {
		const img = path.resolve(__dirname, './ProfilePagePDFImages/cdao_logo.png');
		const date = new Date();
		let currentYear = date.getFullYear();
		const month = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		];
		const nth = (day) => {
			if (day > 3 && day < 21) {
				return day + 'th';
			}
			switch (day % 10) {
				case 1:
					return day + 'st';
				case 2:
					return day + 'nd';
				case 3:
					return day + 'rd';
				default:
					return day + 'th';
			}
		};
		let currentMonth = month[date.getMonth()];
		let currentDay = nth(date.getDate());

		// Define base document
		let doc = {
			pageMargins: [30, 60, 30, 55],
			header: function () {
				return {
					stack: [
						{
							image: img,
							width: 60,
							absolutePosition: { x: 20, y: 5 },
							marginBottom: 5,
						},
						{
							text: `JBook Search Results | ${currentMonth} ${currentDay}, ${currentYear}`,
							alignment: 'center',
							marginTop: 4,
							marginBottom: 5,
							fontSize: 11,
						},
						{
							table: {
								headerRows: 1,
								widths: ['450', '450'],
								body: [
									[
										{ text: '', marginLeft: 50 },
										{ text: '', marginRight: 50 },
									],
									[
										{ text: '', marginLeft: 50, marginBottom: 5 },
										{ text: '', marginRight: 50, marginBottom: 5 },
									],
								],
							},
							layout: 'headerLineOnly',
						},
					],
				};
			},
			footer: function (currentPage, pageCount) {
				return {
					stack: [
						{
							table: {
								headerRows: 1,
								widths: ['450', '450'],
								body: [
									[
										{ text: '', marginLeft: 30 },
										{ text: '', marginRight: 30 },
									],
									[
										{ text: '', marginLeft: 30 },
										{ text: '', marginRight: 30 },
									],
								],
							},
							layout: 'headerLineOnly',
						},
						{
							layout: 'noBorders',
							table: {
								widths: ['*', 120, '*', 120, 130],
								body: [
									[
										{
											image: img,
											width: 60,
											marginLeft: 20,
											marginTop: 8,
										},
										{
											text: 'Go To: R&D Activities',
											linkToDestination: 'rdActivities',
											alignment: 'left',
											marginTop: 12,
											fontSize: 11,
											marginLeft: 10,
										},
										{ text: 'CUI', alignment: 'center', marginTop: 12, fontSize: 11 },
										{
											text: 'Go To: Proc Activities',
											linkToDestination: 'procActivities',
											alignment: 'right',
											marginTop: 12,
											fontSize: 11,
											marginRight: 10,
										},
										{
											text: `Page: ${currentPage.toString()}/${pageCount}`,
											alignment: 'right',
											marginRight: 30,
											marginTop: 12,
											fontSize: 11,
										},
									],
								],
							},
						},
					],
				};
			},
			content: [],
			defaultStyle: {
				font: 'Times',
				fontSize: 10,
			},
			styles: {
				title: {
					fontSize: 11,
					color: '#404040',
					marginTop: 15,
				},
				classification: {
					color: '#404040',
					fontSize: 11,
					marginTop: 5,
				},
				footer: {
					color: '#404040',
					fontSize: 11,
					marginTop: 5,
				},
				pageNum: {
					color: '#404040',
					fontSize: 11,
					marginTop: 5,
				},
				settingsTable: {
					fontSize: 11,
				},
				table: {
					margin: [0, 15, 0, 15],
				},
				subheader: {
					bold: true,
				},
				bottomheader: {
					marginTop: 5,
				},
				header: {
					marginBottom: 3,
					fontSize: 11,
				},
				logo: {
					width: 50,
				},
			},
		};

		try {
			//  Create RD&E Toc
			const rdToc = [
				{
					text: 'R&D Activities TOC',
					id: 'rdActivities',
					alignment: 'center',
					marginTop: 10,
					marginBottom: 10,
					fontSize: 11,
				},
				{
					pageBreak: 'after',
					layout: 'noBorders',
					table: {
						headerRows: 1,
						widths: [60, 60, 150, 130, 80, 30],
						body: [
							[
								{ text: 'PE', style: 'subheader', fontSize: 12, marginBottom: 5 },
								{ text: 'Proj', style: 'subheader', fontSize: 12, marginBottom: 5 },
								{ text: 'Project Title', style: 'subheader', fontSize: 12, marginBottom: 5 },
								{ text: 'Service', style: 'subheader', fontSize: 12, marginBottom: 5 },
								{ text: 'AI Label', style: 'subheader', fontSize: 12, marginBottom: 5 },
								{ text: 'Pg.', style: 'subheader', fontSize: 12, marginBottom: 5 },
							],
						],
					},
				},
			];
			// Create PRoc Toc
			const procToc = [
				{
					text: 'Procurement Activities TOC',
					id: 'procActivities',
					alignment: 'center',
					marginTop: 10,
					marginBottom: 10,
					fontSize: 11,
				},
				{
					pageBreak: 'after',
					layout: 'noBorders',
					table: {
						headerRows: 1,
						widths: [100, 170, 130, 80, 30],
						body: [
							[
								{ text: 'Budget Line Num', style: 'subheader', fontSize: 12, marginBottom: 5 },
								{ text: 'Project Title', style: 'subheader', fontSize: 12, marginBottom: 5 },
								{ text: 'Service', style: 'subheader', fontSize: 12, marginBottom: 5 },
								{ text: 'AI Label', style: 'subheader', fontSize: 12, marginBottom: 5 },
								{ text: 'Pg.', style: 'subheader', fontSize: 12, marginBottom: 5 },
							],
						],
					},
				},
			];
			// PDOC Content
			const pdocContent = [];
			// RDOC Content
			const rdocContent = [];

			// We need to filter out duplicated reviews that came as
			// a result of data propagation from 2022-2023
			const docIds = fullData.map((docData) => String(docData.id));
			const filteredFullData = fullData.filter(
				(docData, index) => !docIds.includes(String(docData.id), index + 1)
			);
			for (const docData of filteredFullData) {
				switch (docData.budgetType) {
					case 'pdoc':
						procToc[1].table.body.push(
							await this.constructPdocContent(docData, pdocContent, userId, showPOC)
						);
						break;
					case 'rdoc':
						rdToc[1].table.body.push(
							await this.constructRdocContent(docData, rdocContent, userId, showPOC)
						);
						break;
					default:
						break;
				}
			}

			// Add rdoc TOC
			doc.content.push(rdToc);
			// Add rdocs
			doc.content.push(...rdocContent);
			// Add pdoc TOC
			doc.content.push(procToc);
			// Add pdocs
			doc.content.push(...pdocContent);
		} catch (err) {
			const { message } = err;
			this.logger.error(message, '6T0ILGP', userId);
		}

		return doc;
	}

	// helper function to generate rdoc content
	getLabel(docData) {
		let label = '';
		if (docData) {
			if (docData.pocAgreeLabel && docData.pocAgreeLabel === 'No' && docData.pocClassLabel) {
				label = docData.pocClassLabel;
			} else if (docData.serviceAgreeLabel && docData.serviceAgreeLabel === 'No' && docData.serviceClassLabel) {
				label = docData.serviceClassLabel;
			} else if (docData.primaryClassLabel) {
				label = docData.primaryClassLabel;
			} else {
				label = 'Unknown';
			}
		}
		return label;
	}

	getPocReviewer(docData) {
		if (docData.altPOCName && docData.altPOCName !== null && docData.altPOCName !== '') {
			return docData.altPOCName;
		} else if (docData.servicePOCName && docData.servicePOCName !== null && docData.servicePOCName !== '') {
			return docData.servicePOCName;
		} else if (
			docData.serviceSecondaryReviewer &&
			docData.serviceSecondaryReviewer !== null &&
			docData.serviceSecondaryReviewer !== ''
		) {
			return docData.serviceSecondaryReviewer;
		} else if (docData.serviceReviewer && docData.serviceReviewer !== null && docData.serviceReviewer !== '') {
			return docData.serviceReviewer;
		} else if (docData.primaryReviewer && docData.primaryReviewer !== null && docData.primaryReviewer !== '') {
			return docData.primaryReviewer;
		} else {
			return 'N/A';
		}
	}

	getPocOrganization(docData) {
		if (docData.altPOCOrg && docData.altPOCOrg !== null && docData.altPOCOrg !== '') {
			return docData.altPOCOrg;
		} else if (docData.servicePOCOrg && docData.servicePOCOrg !== null && docData.servicePOCOrg !== '') {
			return docData.servicePOCOrg;
		} else if (
			docData.serviceSecondaryReviewer &&
			docData.serviceSecondaryReviewer !== null &&
			docData.serviceSecondaryReviewer !== ''
		) {
			return docData.serviceSecondaryReviewer.split('(')[1]?.replace(')', '');
		} else if (docData.serviceReviewer && docData.serviceReviewer !== null && docData.serviceReviewer !== '') {
			return docData.serviceReviewer.split('(')[1]?.replace(')', '');
		} else {
			return 'N/A';
		}
	}

	getPocEmail(docData) {
		if (docData.altPOCEmail && docData.altPOCEmail !== null && docData.altPOCEmail !== '') {
			return docData.altPOCEmail;
		} else if (docData.servicePOCEmail && docData.servicePOCEmail !== null && docData.servicePOCEmail !== '') {
			return docData.servicePOCEmail;
		}
		return 'N/A';
	}

	getPocPhone(docData) {
		if (docData.altPOCPhoneNumber && docData.altPOCPhoneNumber !== null && docData.altPOCPhoneNumber !== '') {
			return docData.altPOCPhoneNumber;
		} else if (
			docData.servicePOCPhoneNumber &&
			docData.servicePOCPhoneNumber !== null &&
			docData.servicePOCPhoneNumber !== ''
		) {
			return docData.servicePOCPhoneNumber;
		}
		return 'N/A';
	}

	getPlannedTransitionPartner(docData) {
		if (
			docData.pocPlannedTransitionPartner &&
			docData.pocPlannedTransitionPartner !== null &&
			docData.pocPlannedTransitionPartner !== ''
		) {
			return docData.pocPlannedTransitionPartner;
		} else if (
			docData.servicePlannedTransitionPartner &&
			docData.servicePlannedTransitionPartner !== null &&
			docData.servicePlannedTransitionPartner !== ''
		) {
			return docData.servicePlannedTransitionPartner;
		} else if (
			docData.primaryPlannedTransitionPartner &&
			docData.primaryPlannedTransitionPartner !== null &&
			docData.primaryPlannedTransitionPartner !== ''
		) {
			return docData.primaryPlannedTransitionPartner;
		}
		return 'N/A';
	}

	getDomainTask(docData) {
		if (docData.domainTask && docData.domainTask !== null && docData.domainTask !== '') {
			return `${docData.domainTask}${
				docData.domainTaskSecondary && docData.domainTaskSecondary !== null && docData.domainTaskSecondary != ''
					? `: ${docData.domainTaskSecondary}`
					: ''
			}`;
		}
		return 'N/A';
	}

	formatJCAData(JCAData, docData) {
		const tmpJCAData = [];
		if (
			docData.pocJointCapabilityArea &&
			docData.pocJointCapabilityArea !== null &&
			docData.pocJointCapabilityArea !== ''
		) {
			tmpJCAData.push({ text: `${docData.pocJointCapabilityArea}:`, bold: true, marginBottom: 5 });
			const areas2 =
				docData.pocJointCapabilityArea2 && docData.pocJointCapabilityArea2 !== null
					? docData.pocJointCapabilityArea2
					: [];
			const areas3 =
				docData.pocJointCapabilityArea3 && docData.pocJointCapabilityArea3 != null
					? docData.pocJointCapabilityArea3
					: [];
			const areasCombined = {};
			areas2.forEach((area2) => {
				areasCombined[area2] = [];
			});

			areas3.forEach((area3) => {
				areas2.forEach((area2) => {
					if (JCAData[docData.pocJointCapabilityArea][area2]?.includes(area3)) {
						areasCombined[area2].push(area3);
					}
				});
			});

			areas2.forEach((area2) => {
				tmpJCAData.push(
					{ text: `${area2}:`, marginLeft: 5 },
					{
						ul: areasCombined[area2].map((area3) => {
							return { text: area3 };
						}),
						marginBottom: 5,
						marginLeft: 10,
					}
				);
			});
		} else {
			tmpJCAData.push('N/A');
		}

		return tmpJCAData;
	}

	constructTitle(label, docData) {
		if (docData.budgetType === 'rdoc') {
			return [
				{
					text: 'Project Title:',
					style: 'subheader',
				},
				docData.projectTitle ?? 'N/A',
				{
					text: 'AI Category:',
					style: 'subheader',
				},
				label ?? 'N/A',
			];
		} else {
			return [
				{
					text: 'Line Item Title:',
					style: 'subheader',
				},
				docData.projectTitle ?? 'N/A',
				{
					text: 'AI Category:',
					style: 'subheader',
				},
				label ?? 'N/A',
			];
		}
	}

	constructSubheader(docData) {
		if (docData.docType === 'rdoc') {
			return [
				{
					text: 'Project:',
					style: 'subheader',
				},
				docData.projectNum ?? 'N/A',
				{
					text: 'Service Agency Name:',
					style: 'subheader',
				},
				docData.serviceAgency ?? 'N/A',
			];
		} else {
			return [
				{
					text: 'Line Item:',
					style: 'subheader',
				},
				docData.budgetLineItem ?? 'N/A',
				{
					text: 'Service Agency Name:',
					style: 'subheader',
				},
				docData.serviceAgency ?? 'N/A',
			];
		}
	}

	constructEndData(docData) {
		const plannedTransitionPartner = this.getPlannedTransitionPartner(docData);
		const domainTask = this.getDomainTask(docData);

		if (docData.docType === 'rdoc') {
			return [
				[
					{
						text: 'Program Element:',
						style: 'subheader',
					},
					docData.programElement ?? 'N/A',
					{
						text: 'Planned Transition Partner (if known):',
						style: 'subheader',
					},
					plannedTransitionPartner,
				],
				[{ text: 'AI Domain: ', style: 'subheader' }, domainTask, '', ''],
			];
		} else {
			return [
				[
					{ text: 'AI Domain: ', style: 'subheader' },
					domainTask,
					{
						text: 'Planned Transition Partner (if known):',
						style: 'subheader',
					},
					plannedTransitionPartner,
				],
			];
		}
	}

	getGeneralData(docData, showPOC) {
		const label = this.getLabel(docData);
		const pocReviewer = this.getPocReviewer(docData);
		const pocOrganization = this.getPocOrganization(docData);
		const pocEmail = this.getPocEmail(docData);
		const pocPhone = this.getPocPhone(docData);
		const title = this.constructTitle(label, docData);
		const subheader = this.constructSubheader(docData);
		const endData = this.constructEndData(docData);

		const referenceName = docData.id;

		return [
			{
				text: referenceName,
				id: referenceName,
				fontSize: 1,
				color: 'white',
			},
			{
				style: 'table',
				table: {
					widths: [70, '*', 100, '*'],
					body: [
						title,
						subheader,
						[
							{
								text: 'Budget Year',
								style: 'subheader',
							},
							`${docData.budgetYear}`,
							{
								text: '',
								style: 'subheader',
							},
							``,
						],
						[
							{
								text: showPOC ? 'Project POC:' : '',
								style: 'subheader',
							},
							`${showPOC ? pocReviewer : ''}`,
							{
								text: showPOC ? 'POC Organization:' : '',
								style: 'subheader',
							},
							`${showPOC ? pocOrganization : ''}`,
						],
						[
							{
								text: showPOC ? 'POC Email:' : '',
								style: 'subheader',
							},
							`${showPOC ? pocEmail : ''}`,
							{
								text: showPOC ? 'POC Phone:' : '',
								style: 'subheader',
							},
							`${showPOC ? pocPhone : ''}`,
						],
						[
							{
								text: 'Appropriation:',
								style: 'subheader',
							},
							docData.appropriationNumber ?? 'N/A',
							{
								text: 'Appropriation Title:',
								style: 'subheader',
							},
							docData.appropriationTitle ?? 'N/A',
						],
						[
							{
								text: 'Budget Activity:',
								style: 'subheader',
							},
							docData.budgetActivityNumber ?? 'N/A',
							{
								text: 'Budget Activity Title:',
								style: 'subheader',
							},
							docData.budgetActivityTitle,
						],
						[{ text: 'Source Tags:', style: 'subheader' }, docData.sourceTag ?? 'N/A', '', ''],
						[
							{
								text: '# of Keywords:',
								style: 'subheader',
							},
							docData.keywords ? docData.keywords.length : 'N/A',
							{
								text: 'Included Keywords:',
								style: 'subheader',
							},
							docData.keywords ?? 'N/A',
						],
						...endData,
					],
				},
				layout: {
					defaultBorder: false,
				},
				fontSize: 10,
			},
		];
	}

	constructJCAData(docData) {
		const JCAData = this.budgetSearchUtility.getJCAData();
		const tmpJCAData = this.formatJCAData(JCAData, docData);
		let currentYear = parseInt(docData.budgetYear);

		return {
			pageBreak: 'after',
			style: 'table',
			table: {
				widths: ['*', '*', '*'],
				body: [
					[
						{
							text: `FY${(currentYear - 1).toString().substring(2)}-FY${(currentYear + 3)
								.toString()
								.substring(2)} Total Program Element Cost`,
							style: 'subheader',
						},
						{
							text: 'Data Type',
							style: 'subheader',
						},
						{ text: 'Joint Capability Area', style: 'subheader' },
					],
					[
						{
							stack: [
								{ text: 'Total $ attributed to AI: ', marginBottom: 5 },
								{
									text: `FY${(currentYear - 1).toString().substring(2)} (previous year): ${
										docData.priorYearAmount !== undefined ? docData.priorYearAmount + ' M' : ''
									}`,
									marginBottom: 5,
								},
								{
									text: `FY${currentYear.toString().substring(2)}: ${
										docData.currentYearAmount !== undefined ? docData.currentYearAmount + ' M' : ''
									}`,
									marginBottom: 5,
								},
								{
									text: `FY${(currentYear + 1).toString().substring(2)}: ${
										docData.proj_fund_by2_d !== undefined ? docData.proj_fund_by2_d + ' M' : ''
									}`,
									marginBottom: 5,
								},
								{
									text: `FY${(currentYear + 2).toString().substring(2)}: ${
										docData.proj_fund_by3_d !== undefined ? docData.proj_fund_by3_d + ' M' : ''
									}`,
									marginBottom: 5,
								},
								{
									text: `FY${(currentYear + 3).toString().substring(2)}: ${
										docData.proj_fund_by4_d !== undefined ? docData.proj_fund_by4_d + ' M' : ''
									}`,
									marginBottom: 5,
								},
								{ text: 'To Complete:', marginBottom: 5 },
								{ text: `Total Cost: ${docData.totalCost}`, marginBottom: 5 },
							],
						},
						{
							stack: [
								{ text: 'How does the project fit this data type?', marginBottom: 5 },
								{
									text:
										docData.pocAIType && docData.pocAIType !== null && docData.pocAIType !== ''
											? `${docData.pocAIType}:`
											: 'N/A',
									marginBottom: 5,
									bold: docData.pocAIType && docData.pocAIType !== null && docData.pocAIType !== '',
								},
								{
									text:
										docData.pocAITypeDescription &&
										docData.pocAITypeDescription !== null &&
										docData.pocAITypeDescription !== ''
											? docData.pocAITypeDescription
											: '',
									marginLeft: 5,
								},
							],
						},
						{
							stack: [{ text: 'Role of AI in this project?', marginBottom: 5 }, ...tmpJCAData],
						},
					],
				],
			},
		};
	}

	getPartnerList(docData) {
		let serviceMPList = '';
		if (
			docData.serviceMissionPartnersList &&
			docData.serviceMissionPartnersList !== null &&
			docData.serviceMissionPartnersList !== ''
		) {
			serviceMPList = docData.serviceMissionPartnersList;
		}

		return !docData.pocMPAgreeLabel &&
			docData.pocMissionPartnersList &&
			docData.pocMissionPartnersList !== null &&
			docData.pocMissionPartnersList !== ''
			? docData.pocMissionPartnersList
			: serviceMPList;
	}

	getPartnerChecklist(docData) {
		let serviceMPChecklist = '';
		if (
			docData.serviceMissionPartnersChecklist &&
			docData.serviceMissionPartnersChecklist !== null &&
			docData.serviceMissionPartnersChecklist !== ''
		) {
			serviceMPChecklist = docData.serviceMissionPartnersChecklist;
		}

		return !docData.pocMPAgreeLabel &&
			docData.pocMissionPartnersChecklist &&
			docData.pocMissionPartnersChecklist !== null &&
			docData.pocMissionPartnersChecklist !== ''
			? docData.pocMissionPartnersChecklist
			: serviceMPChecklist;
	}

	// actual function to construct rdoc content
	async constructRdocContent(docData, rdocContent, userId, showPOC) {
		try {
			const generalData = this.getGeneralData(docData, showPOC);
			// General Data
			rdocContent.push(generalData);

			// Costs, data type, jca
			const jca = this.constructJCAData(docData);
			rdocContent.push(jca);

			// Mission partners acomplishments
			let partnerList = this.getPartnerList(docData);
			let partnerChecklist = this.getPartnerChecklist(docData);

			if (partnerList !== '') {
				partnerList = partnerList.split('|');
			} else {
				partnerList = [];
			}

			if (partnerChecklist !== '') {
				partnerChecklist = JSON.parse(partnerChecklist);
				Object.keys(partnerChecklist).forEach((mpKey) => {
					if (partnerChecklist[mpKey]) {
						partnerList.push(mpKey);
					}
				});
			}

			partnerList = [...new Set(partnerList)];

			let accomplishments = [];
			if (docData.r_2a_accomp_pp_n && docData.r_2a_accomp_pp_n !== null && docData.r_2a_accomp_pp_n.length > 0) {
				accomplishments = docData.r_2a_accomp_pp_n;
			}

			let accomplishmentTexts = [];
			for (let accomp of accomplishments) {
				if (accomp.PlanPrgrm_Fund_BY1Base_Text_t) {
					accomplishmentTexts.push({ text: accomp.PlanPrgrm_Fund_BY1Base_Text_t, margin: [2, 5, 0, 5] });
				}
				if (accomp.PlanPrgrm_Fund_CY_Text_t) {
					accomplishmentTexts.push({ text: accomp.PlanPrgrm_Fund_CY_Text_t, margin: [2, 5, 0, 5] });
				}
			}

			rdocContent.push({
				pageBreak: 'after',
				style: 'table',
				table: {
					widths: ['*', '*'],
					body: [
						[
							{ text: 'Mission Partners', style: 'subheader' },
							{
								text: 'Current FY Accomplishments',
								style: 'subheader',
							},
						],
						[
							{
								stack: [
									...partnerList.map((mp) => {
										return { text: mp ?? '', margin: [2, 5, 0, 5] };
									}),
								],
							},
							{
								stack: accomplishmentTexts,
							},
						],
					],
				},
			});

			const referenceName = docData.id;
			const label = this.getLabel(docData);

			// Updating TOC
			return [
				{ text: docData.programElement, linkToDestination: referenceName, marginBottom: 5, marginTop: 5 },
				{ text: docData.projectNum, linkToDestination: referenceName, marginBottom: 5, marginTop: 5 },
				{ text: docData.projectTitle, linkToDestination: referenceName, marginBottom: 5, marginTop: 5 },
				{ text: docData.serviceAgency, linkToDestination: referenceName, marginBottom: 5, marginTop: 5 },
				{ text: label, linkToDestination: referenceName, marginBottom: 5, marginTop: 5 },
				{ pageReference: referenceName, marginBottom: 5, marginTop: 5 },
			];
		} catch (err) {
			const { message } = err;
			this.logger.error(message, '84GUNJR', userId);
			return [''];
		}
	}

	async constructPdocContent(docData, pdocContent, userId, showPOC) {
		try {
			const generalData = this.getGeneralData(docData, showPOC);
			// General Data
			pdocContent.push(generalData);

			const jca = this.constructJCAData(docData);
			pdocContent.push(jca);

			// Mission partners acomplishments
			let partnerList = this.getPartnerList(docData);
			let partnerChecklist = this.getPartnerChecklist(docData);

			if (partnerList !== '') {
				partnerList = partnerList.split('|');
			} else {
				partnerList = [];
			}

			if (partnerChecklist !== '') {
				partnerChecklist = JSON.parse(partnerChecklist);
				Object.keys(partnerChecklist).forEach((mpKey) => {
					if (partnerChecklist[mpKey]) {
						partnerList.push(mpKey);
					}
				});
			}

			partnerList = [...new Set(partnerList)];

			pdocContent.push({
				pageBreak: 'after',
				style: 'table',
				table: {
					widths: ['*'],
					body: [
						[{ text: 'Mission Partners', style: 'subheader' }],
						[
							{
								stack: [
									...partnerList.map((mp) => {
										return { text: mp ?? '', margin: [2, 5, 0, 5] };
									}),
								],
							},
						],
					],
				},
			});

			const referenceName = docData.id;
			const label = this.getLabel(docData);

			// Updating TOC
			return [
				{ text: docData.budgetLineItem, linkToDestination: referenceName, marginBottom: 5, marginTop: 5 },
				{ text: docData.projectTitle, linkToDestination: referenceName, marginBottom: 5, marginTop: 5 },
				{ text: docData.serviceAgency, linkToDestination: referenceName, marginBottom: 5, marginTop: 5 },
				{ text: label, linkToDestination: referenceName, marginBottom: 5, marginTop: 5 },
				{ pageReference: referenceName, marginBottom: 5, marginTop: 5 },
			];
		} catch (err) {
			const { message } = err;
			this.logger.error(message, 'LZ6NDDJ', userId);
			return [''];
		}
	}
}
module.exports.Reports = Reports;
