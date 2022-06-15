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

	jbookCreateCsvStream(data, userId) {
		try {
			const stringifier = this.csvStringify({ delimiter: ',' });
			stringifier.on('error', (err) => {
				this.logger.error(err.message, 'NL71UTC', userId);
				throw new Error(err);
			});
			this.jbookWriteCSV(stringifier, data);
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

	jbookWriteCSV(stringifier, data) {
		if (data && data.docs && data.docs.length > 0) {
			const sample = data.docs[0].dataValues ?? data.docs[0];
			const header = Object.keys(sample).map((field) =>
				field
					.split('_')
					.map((word) => word[0].toUpperCase() + word.slice(1))
					.join(' ')
			);
			stringifier.write(header);
			data.docs.forEach((doc) => {
				const docData = doc.dataValues ?? doc;
				const item = Object.values(docData);
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
			const docDefinition = await this.constructProfilePagePDF(data);
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
							.replace(new RegExp('</em>', 'g'), '');

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
		const title = 'GAMECHANGER REPORT';
		const footer = 'REPORT';
		const timeZone = 'America/New_York';
		const date = timeZone ? moment.tz(timeZone) : moment();
		const dateString = `${date.format('MM/DD/YYYY')}`;
		const displaySearchTerm = data.searchTerms.join(' ');

		let doc = {
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

		return doc;
	}

	async constructProfilePagePDF(fullData, userId, showPOC = true) {
		const sideMargin = 50;

		const timeZone = 'America/New_York';
		const date = timeZone ? moment.tz(timeZone) : moment();
		const dateString = `${date.format('MM/DD/YYYY')}`;
		const img = path.resolve(__dirname, './ProfilePagePDFImages/JAIC_blk.png');
		let currentYear = new Date().getFullYear();

		// Define base document
		let doc = {
			pageMargins: [30, 60, 30, 55],
			header: function (currentPage, pageCount, pageSize) {
				return {
					stack: [
						{
							text: `Annual Artificial Intelligence Inventory Baseline Assessment - Fiscal Year (FY) ${currentYear}`,
							alignment: 'center',
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

			for (const docData of fullData) {
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

	async constructRdocContent(docData, rdocContent, userId, showPOC) {
		try {
			let label = '';
			if (docData) {
				if (docData.pocAgreeLabel && docData.pocAgreeLabel === 'No' && docData.pocClassLabel) {
					label = docData.pocClassLabel;
				} else if (
					docData.serviceAgreeLabel &&
					docData.serviceAgreeLabel === 'No' &&
					docData.serviceClassLabel
				) {
					label = docData.serviceClassLabel;
				} else if (docData.primaryClassLabel) {
					label = docData.primaryClassLabel;
				} else {
					label = 'Unknown';
				}
			}

			let totalCost = null;
			if (docData.allPriorYearsAmount) {
				totalCost += docData.allPriorYearsAmount;
			}
			if (docData.priorYearAmount) {
				totalCost += docData.priorYearAmount;
			}
			if (docData.currentYearAmount) {
				totalCost += docData.currentYearAmount;
			}

			const pocReviewer =
				docData.altPOCName && docData.altPOCName !== null && docData.altPOCName !== ''
					? docData.altPOCName
					: docData.servicePOCName && docData.servicePOCName !== null && docData.servicePOCName !== ''
					? docData.servicePOCName
					: docData.serviceSecondaryReviewer &&
					  docData.serviceSecondaryReviewer !== null &&
					  docData.serviceSecondaryReviewer !== ''
					? docData.serviceSecondaryReviewer
					: docData.serviceReviewer && docData.serviceReviewer !== null && docData.serviceReviewer !== ''
					? docData.serviceReviewer
					: docData.primaryReviewer && docData.primaryReviewer !== null && docData.primaryReviewer !== ''
					? docData.primaryReviewer
					: 'N/A';

			const pocOrganization =
				docData.altPOCOrg && docData.altPOCOrg !== null && docData.altPOCOrg !== ''
					? docData.altPOCOrg
					: docData.servicePOCOrg && docData.servicePOCOrg !== null && docData.servicePOCOrg !== ''
					? docData.servicePOCOrg
					: docData.serviceSecondaryReviewer &&
					  docData.serviceSecondaryReviewer !== null &&
					  docData.serviceSecondaryReviewer !== ''
					? docData.serviceSecondaryReviewer.split('(')[1].replace(')', '')
					: docData.serviceReviewer && docData.serviceReviewer !== null && docData.serviceReviewer !== ''
					? docData.serviceReviewer.split('(')[1].replace(')', '')
					: 'N/A';

			const pocEmail =
				docData.altPOCEmail && docData.altPOCEmail !== null && docData.altPOCEmail !== ''
					? docData.altPOCEmail
					: docData.servicePOCEmail && docData.servicePOCEmail !== null && docData.servicePOCEmail !== ''
					? docData.servicePOCEmail
					: 'N/A';

			const pocPhone =
				docData.altPOCPhoneNumber && docData.altPOCPhoneNumber !== null && docData.altPOCPhoneNumber !== ''
					? docData.altPOCPhoneNumber
					: docData.servicePOCPhoneNumber &&
					  docData.servicePOCPhoneNumber !== null &&
					  docData.servicePOCPhoneNumber !== ''
					? docData.servicePOCPhoneNumber
					: 'N/A';

			const plannedTransitionPartner =
				docData.pocPlannedTransitionPartner &&
				docData.pocPlannedTransitionPartner !== null &&
				docData.pocPlannedTransitionPartner !== ''
					? docData.pocPlannedTransitionPartner
					: docData.servicePlannedTransitionPartner &&
					  docData.servicePlannedTransitionPartner !== null &&
					  docData.servicePlannedTransitionPartner !== ''
					? docData.servicePlannedTransitionPartner
					: docData.primaryPlannedTransitionPartner &&
					  docData.primaryPlannedTransitionPartner !== null &&
					  docData.primaryPlannedTransitionPartner !== ''
					? docData.primaryPlannedTransitionPartner
					: 'N/A';

			const domainTask =
				docData.domainTask && docData.domainTask !== null && docData.domainTask !== ''
					? `${docData.domainTask}${
							docData.domainTaskSecondary &&
							docData.domainTaskSecondary !== null &&
							docData.domainTaskSecondary != ''
								? `: ${docData.domainTaskSecondary}`
								: ''
					  }`
					: 'N/A';

			const referenceName = `rdoc#${docData.budgetYear}#${docData.budgetCycle}#${docData.budgetActivityNumber}#${docData.programElement}#${docData.serviceAgency}#${docData.appropriationNumber}#${docData.projectNum}`;

			// General Data
			rdocContent.push(
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
							[
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
							],
							[
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
						],
					},
					layout: {
						defaultBorder: false,
					},
					fontSize: 10,
				}
			);

			// Costs, data type, jca
			const JCAData = this.budgetSearchUtility.getJCAData();
			const tmpJCAData = [];
			if (
				docData.pocJointCapabilityArea &&
				docData.pocJointCapabilityArea !== null &&
				docData.pocJointCapabilityArea !== ''
			) {
				tmpJCAData.push({ text: `${docData.pocJointCapabilityArea}:`, bold: true, marginBottom: 5 });
				const areas2 =
					docData.pocJointCapabilityArea2 && docData.pocJointCapabilityArea2 !== null
						? docData.pocJointCapabilityArea2.split(', ')
						: [];
				const areas3 =
					docData.pocJointCapabilityArea3 && docData.pocJointCapabilityArea3 != null
						? docData.pocJointCapabilityArea3.split(', ')
						: [];
				const areasCombined = {};
				areas2.forEach((area2) => {
					areasCombined[area2] = [];
				});

				areas3.forEach((area3) => {
					areas2.forEach((area2) => {
						if (JCAData[docData.pocJointCapabilityArea][area2].includes(area3)) {
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
			let currentYear = new Date().getFullYear();

			rdocContent.push({
				pageBreak: 'after',
				style: 'table',
				table: {
					widths: ['*', '*', '*'],
					body: [
						[
							{ text: 'FY21-FY25 Total Program Element Cost', style: 'subheader' },
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
											docData.priorYearAmount
										} M`,
										marginBottom: 5,
									},
									{
										text: `FY${currentYear.toString().substring(2)}: ${
											docData.currentYearAmount
										} M`,
										marginBottom: 5,
									},
									{
										text: `FY${(currentYear + 1).toString().substring(2)}: ${
											docData.proj_fund_by2_d
										} M`,
										marginBottom: 5,
									},
									{
										text: `FY${(currentYear + 1).toString().substring(2)}: ${
											docData.proj_fund_by3_d
										} M`,
										marginBottom: 5,
									},
									{
										text: `FY${(currentYear + 1).toString().substring(2)}: ${
											docData.proj_fund_by4_d
										} M`,
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
										bold:
											docData.pocAIType && docData.pocAIType !== null && docData.pocAIType !== '',
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
			});

			// Mission partners acomplishments
			let partnerList =
				!docData.pocMPAgreeLabel &&
				docData.pocMissionPartnersList &&
				docData.pocMissionPartnersList !== null &&
				docData.pocMissionPartnersList !== ''
					? docData.pocMissionPartnersList
					: docData.serviceMissionPartnersList &&
					  docData.serviceMissionPartnersList !== null &&
					  docData.serviceMissionPartnersList !== ''
					? docData.serviceMissionPartnersList
					: '';
			let partnerChecklist =
				!docData.pocMPAgreeLabel &&
				docData.pocMissionPartnersChecklist &&
				docData.pocMissionPartnersChecklist !== null &&
				docData.pocMissionPartnersChecklist !== ''
					? docData.pocMissionPartnersChecklist
					: docData.serviceMissionPartnersChecklist &&
					  docData.serviceMissionPartnersChecklist !== null &&
					  docData.serviceMissionPartnersChecklist !== ''
					? docData.serviceMissionPartnersChecklist
					: '';

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
			let label = '';
			if (docData) {
				if (docData.pocAgreeLabel && docData.pocAgreeLabel === 'No' && docData.pocClassLabel) {
					label = docData.pocClassLabel;
				} else if (
					docData.serviceAgreeLabel &&
					docData.serviceAgreeLabel === 'No' &&
					docData.serviceClassLabel
				) {
					label = docData.serviceClassLabel;
				} else if (docData.primaryClassLabel) {
					label = docData.primaryClassLabel;
				} else {
					label = 'Unknown';
				}
			}

			let totalCost = null;
			if (docData.allPriorYearsAmount) {
				totalCost += docData.allPriorYearsAmount;
			}
			if (docData.priorYearAmount) {
				totalCost += docData.priorYearAmount;
			}
			if (docData.currentYearAmount) {
				totalCost += docData.currentYearAmount;
			}

			const pocReviewer =
				docData.altPOCName && docData.altPOCName !== null && docData.altPOCName !== ''
					? docData.altPOCName
					: docData.servicePOCName && docData.servicePOCName !== null && docData.servicePOCName !== ''
					? docData.servicePOCName
					: docData.serviceSecondaryReviewer &&
					  docData.serviceSecondaryReviewer !== null &&
					  docData.serviceSecondaryReviewer !== ''
					? docData.serviceSecondaryReviewer
					: docData.serviceReviewer && docData.serviceReviewer !== null && docData.serviceReviewer !== ''
					? docData.serviceReviewer
					: docData.primaryReviewer && docData.primaryReviewer !== null && docData.primaryReviewer !== ''
					? docData.primaryReviewer
					: 'N/A';

			const pocOrganization =
				docData.altPOCOrg && docData.altPOCOrg !== null && docData.altPOCOrg !== ''
					? docData.altPOCOrg
					: docData.servicePOCOrg && docData.servicePOCOrg !== null && docData.servicePOCOrg !== ''
					? docData.servicePOCOrg
					: docData.serviceSecondaryReviewer &&
					  docData.serviceSecondaryReviewer !== null &&
					  docData.serviceSecondaryReviewer !== ''
					? docData.serviceSecondaryReviewer.split('(')[1].replace(')', '')
					: docData.serviceReviewer && docData.serviceReviewer !== null && docData.serviceReviewer !== ''
					? docData.serviceReviewer.split('(')[1].replace(')', '')
					: 'N/A';

			const pocEmail =
				docData.altPOCEmail && docData.altPOCEmail !== null && docData.altPOCEmail !== ''
					? docData.altPOCEmail
					: docData.servicePOCEmail && docData.servicePOCEmail !== null && docData.servicePOCEmail !== ''
					? docData.servicePOCEmail
					: 'N/A';

			const pocPhone =
				docData.altPOCPhoneNumber && docData.altPOCPhoneNumber !== null && docData.altPOCPhoneNumber !== ''
					? docData.altPOCPhoneNumber
					: docData.servicePOCPhoneNumber &&
					  docData.servicePOCPhoneNumber !== null &&
					  docData.servicePOCPhoneNumber !== ''
					? docData.servicePOCPhoneNumber
					: 'N/A';

			const plannedTransitionPartner =
				docData.pocPlannedTransitionPartner &&
				docData.pocPlannedTransitionPartner !== null &&
				docData.pocPlannedTransitionPartner !== ''
					? docData.pocPlannedTransitionPartner
					: docData.servicePlannedTransitionPartner &&
					  docData.servicePlannedTransitionPartner !== null &&
					  docData.servicePlannedTransitionPartner !== ''
					? docData.servicePlannedTransitionPartner
					: docData.primaryPlannedTransitionPartner &&
					  docData.primaryPlannedTransitionPartner !== null &&
					  docData.primaryPlannedTransitionPartner !== ''
					? docData.primaryPlannedTransitionPartner
					: 'N/A';

			const domainTask =
				docData.domainTask && docData.domainTask !== null && docData.domainTask !== ''
					? `${docData.domainTask}${
							docData.domainTaskSecondary &&
							docData.domainTaskSecondary !== null &&
							docData.domainTaskSecondary != ''
								? `: ${docData.domainTaskSecondary}`
								: ''
					  }`
					: 'N/A';

			const referenceName = `pdoc#${docData.budgetYear}#${docData.budgetCycle}#${docData.budgetActivityNumber}#${docData.budgetLineItem}#${docData.serviceAgency}#${docData.appropriationNumber}`;

			// General Data
			pdocContent.push(
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
							[
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
							],
							[
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
							[
								{ text: 'AI Domain: ', style: 'subheader' },
								domainTask,
								{
									text: 'Planned Transition Partner (if known):',
									style: 'subheader',
								},
								plannedTransitionPartner,
							],
						],
					},
					layout: {
						defaultBorder: false,
					},
					fontSize: 10,
				}
			);

			// Costs, data type, jca
			const JCAData = this.budgetSearchUtility.getJCAData();
			const tmpJCAData = [];
			if (
				docData.pocJointCapabilityArea &&
				docData.pocJointCapabilityArea !== null &&
				docData.pocJointCapabilityArea !== ''
			) {
				tmpJCAData.push({ text: `${docData.pocJointCapabilityArea}:`, bold: true, marginBottom: 5 });
				const areas2 =
					docData.pocJointCapabilityArea2 && docData.pocJointCapabilityArea2 !== null
						? docData.pocJointCapabilityArea2.split(', ')
						: [];
				const areas3 =
					docData.pocJointCapabilityArea3 && docData.pocJointCapabilityArea3 != null
						? docData.pocJointCapabilityArea3.split(', ')
						: [];
				const areasCombined = {};
				areas2.forEach((area2) => {
					areasCombined[area2] = [];
				});

				areas3.forEach((area3) => {
					areas2.forEach((area2) => {
						if (JCAData[docData.pocJointCapabilityArea][area2].includes(area3)) {
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
			pdocContent.push({
				pageBreak: 'after',
				style: 'table',
				table: {
					widths: ['*', '*', '*'],
					body: [
						[
							{ text: 'FY21-FY25 Total Program Element Cost', style: 'subheader' },
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
											docData.priorYearAmount
										} M`,
										marginBottom: 5,
									},
									{
										text: `FY${currentYear.toString().substring(2)}: ${
											docData.currentYearAmount
										} M`,
										marginBottom: 5,
									},
									{
										text: `FY${(currentYear + 1).toString().substring(2)}: ${
											docData.proj_fund_by2_d
										} M`,
										marginBottom: 5,
									},
									{
										text: `FY${(currentYear + 1).toString().substring(2)}: ${
											docData.proj_fund_by3_d
										} M`,
										marginBottom: 5,
									},
									{
										text: `FY${(currentYear + 1).toString().substring(2)}: ${
											docData.proj_fund_by4_d
										} M`,
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
										bold:
											docData.pocAIType && docData.pocAIType !== null && docData.pocAIType !== '',
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
			});

			// Mission partners acomplishments
			let partnerList =
				!docData.pocMPAgreeLabel &&
				docData.pocMissionPartnersList &&
				docData.pocMissionPartnersList !== null &&
				docData.pocMissionPartnersList !== ''
					? docData.pocMissionPartnersList
					: docData.serviceMissionPartnersList &&
					  docData.serviceMissionPartnersList !== null &&
					  docData.serviceMissionPartnersList !== ''
					? docData.serviceMissionPartnersList
					: '';
			let partnerChecklist =
				!docData.pocMPAgreeLabel &&
				docData.pocMissionPartnersChecklist &&
				docData.pocMissionPartnersChecklist !== null &&
				docData.pocMissionPartnersChecklist !== ''
					? docData.pocMissionPartnersChecklist
					: docData.serviceMissionPartnersChecklist &&
					  docData.serviceMissionPartnersChecklist !== null &&
					  docData.serviceMissionPartnersChecklist !== ''
					? docData.serviceMissionPartnersChecklist
					: '';

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
