'use strict'

const pdfMakeLib = require('pdfmake');
const csvStringifyLib = require('csv-stringify');
const moment = require('moment-timezone');
const path = require('path');
const loggerLib = require('@dod-advana/advana-logger');

class Reports {
	constructor(opts = {}) {
		const {
			logger = loggerLib,
			csvStringify = csvStringifyLib,
			pdfMake = pdfMakeLib
		} = opts

		this.logger = logger;
		this.csvStringify = csvStringify;
		this.pdfMake = pdfMake;
	}


	createCsvStream(data, userId) {
		try {
			const stringifier = this.csvStringify({ delimiter: ',' });

			stringifier.on('error', (err) => {
				this.logger.error(err.message, 'NL71UTC', userId);
				throw new Error(err);
			})

			this.writeCsvData(stringifier, data);

			stringifier.end();
			return stringifier;

		} catch (e) {
			this.logger.error(e.message, '79XRPNA', userId);
			throw e;
		}
	}

	writeCsvData(stringifier, data) {

		if(data && data.docs && data.docs.length > 0 && data.docs[0].esIndex ==='gc_eda'){
			const header = ['ID', 'Filename', 'Title', 'Document Type', 'Page Count','Match Count'];
			stringifier.write(header);

			data.docs.forEach((doc) => {
				const item = [doc.id, doc.filename, doc.title, doc.type, doc.page_count, doc.pageHitCount];
				stringifier.write(item);
			});
		}
		else{
			const header = ['Filename', 'Title', 'Document Number', 'Document Type', 'Match Count', 'Publishing Organization', 'Publication Date', 'Verified On', 'Cancelled', 'Keywords', 'Topics', 'Reference List'];
			stringifier.write(header);

			data.docs.forEach((doc) => {const item = [doc.filename, doc.title, doc.doc_num, doc.doc_type, doc.pageHitCount, doc.display_org_s, doc.publication_date_dt, doc.access_timestamp_dt, doc.is_revoked_b ? 'Yes':'No', doc.keyw_5, doc.topics_s, doc.ref_list];
				stringifier.write(item);
			});
		}

	}

	createPdfBuffer(data, userId, settings, callback=()=>{}){
		try {
			const fonts = {
				Roboto: {
					normal: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Regular.ttf'),
					medium: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Medium.ttf'),
					bold: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Medium.ttf'),
					italics: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Italic.ttf'),
					bolditalics: path.join(__dirname, '../../static/fonts/Roboto/Roboto-BoldItalic.ttf')
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
	
	createProfilePagePDFBuffer(data, userId, callback=()=>{}){
		try {
			const fonts = {
				Roboto: {
					normal: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Regular.ttf'),
					medium: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Medium.ttf'),
					bold: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Medium.ttf'),
					italics: path.join(__dirname, '../../static/fonts/Roboto/Roboto-Italic.ttf'),
					bolditalics: path.join(__dirname, '../../static/fonts/Roboto/Roboto-BoldItalic.ttf')
				},
			};

			const printer = new this.pdfMake(fonts);
			const docDefinition = this.constructProfilePagePDF(data);
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
		return path.resolve(__dirname, relFontPath)
	};

	constructCoverPage(data, settings) {

		const filters = Object.keys(settings.orgFilter);
		const orgFilter = filters.filter(function (key) {
			return settings.orgFilter[key]
		});

		const dataContent = data.docs.map(function (doc) {

			const snippets = doc.pageHits ? doc.pageHits.map(function (snip) {
				const splitReplace = snip.snippet.toString().replace(/<em>/g, '').replace(new RegExp('</em>', 'g'), '');
				
				return {
					stack: [
						{ text: ' '},
						{ text: 'Snippets: ', fontSize:13},
						{ text: ' ' },
						{ text: 'Page ' + snip.pageNumber ? snip.pageNumber : 'N/A'  },
						{ text: ' ' },
						{ text: splitReplace },
						{ text: ' ' },
					],
				};
			}) : [];
			const displayTitle = doc.title === 'NA' ? `${doc.doc_type} ${doc.doc_num}` : `${doc.doc_type} ${doc.doc_num} - ${doc.title}`;
			return {
				stack: [
					{ text: displayTitle, style: 'title', id: doc.filename, tocItem: true, },
					{ text: ' ' },
					{ text: 'Number of Page matches: ' + doc.pageHitCount },
					{ text: 'Publication Date: ' + doc.publication_date_dt },
					{ text: 'Verified On: ' + doc.access_timestamp_dt },
					{ text: `Cancelled: ${doc.is_revoked_b ? 'Yes' : 'No'}` },
					{ text: 'Document Type: ' + doc.display_doc_type_s },
					{ text: 'Publishing Organization: ' + doc.display_org_s },
					{
						canvas: [{
							type: 'line',
							x1: 0, y1: 8,
							x2: 513, y2: 8,
							linewidth: 1.5,
							lineColor: '#404040',
						}]
					},
					snippets,
					{ text: ' ' },
				],
				pageBreak: 'after'
			}
		})

		const sideMargin = 50;
		const title = 'GAMECHANGER REPORT'
		const footer = 'REPORT'
		const timeZone = 'America/New_York'
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
							canvas: [{
								type: 'line',
								x1: 0, y1: 35,
								x2: 513, y2: 35,
								linewidth: 1.5,
								lineColor: '#404040',
								marginBottom: 10,
							}]
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
					link: settings.tiny_url
				},
				{ text: ' ' },
				{ text: ' ' },
				{ text: ' ' },
				{ text: 'Search Settings', style: 'title' },
				{
					canvas: [{
						type: 'line',
						x1: 0, y1: 8,
						x2: 513, y2: 8,
						linewidth: 2,
						lineColor: '#404040',
					}]
				},
				{
					table: {
						widths: [100, '*'],
						body: [
							['Terms:', displaySearchTerm],
							['Matches:', data.docs.length],
							['Filters:', orgFilter.join(', ')],
							['Index:', settings.index],
						]
					},
					layout: 'noBorders',
					fontSize: 10,
				},
				{ text: '\nOpen this search in GAMECHANGER', link: settings.tiny_url, decoration: 'underline', pageBreak: 'after' },
				{
					toc: {
						title: { text: 'Table of Contents', style: 'title' },
						numberStyle: { bold: true },
						textMargin: [0, 10, 0, 10],
					}
				},
				{ text: ' ' },
				{ text: ' ' },
				//documentList,
				{ text: '', pageBreak: 'after' },
				dataContent,
				{ text: '[Page Intentionally Left Blank]', marginTop: 301, alignment: 'center', },
			],
			styles: {
				title: {
					fontSize: 15,
					color: '#404040',
					marginTop: 15
				},
				classification: {
					color: '#404040',
					fontSize: 11,
					marginTop: 5
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
					fontSize: 11
				}
			},
		};


		return doc
	}
	
	constructProfilePagePDF(data) {

		const sideMargin = 50;

		const timeZone = 'America/New_York'
		const date = timeZone ? moment.tz(timeZone) : moment();
		const dateString = `${date.format('MM/DD/YYYY')}`;
		const img = path.resolve(__dirname, './ProfilePagePDFImages/JAIC_blk.png');

		// console.log(data)

		let reviewData = data.review;

		// console.log(reviewData.serviceMissionPartnersList.split('|'));
		// console.log(reviewData.serviceMissionPartnersList);

		let label = '';
		if (reviewData) {
			if (reviewData.pocAgreeLabel && reviewData.pocAgreeLabel === 'No' && reviewData.pocClassLabel) {
				label = reviewData.pocClassLabel;
			} else if (reviewData.serviceAgreeLabel && reviewData.serviceAgreeLabel === 'No' && reviewData.serviceClassLabel) {
				label = reviewData.serviceClassLabel;
			} else if (reviewData.primaryClassLabel) {
				label = reviewData.primaryClassLabel;
			} else {
				label = 'Unknown';
			}
		}

		let totalCost = null;
		if (reviewData.allPriorYearsAmount) {
			totalCost += reviewData.allPriorYearsAmount;
		}
		if (reviewData.priorYearAmount) {
			totalCost += reviewData.priorYearAmount;
		}
		if (reviewData.currentYearAmount) {
			totalCost += reviewData.currentYearAmount;
		}

		const formatNum = (num) => {
			const parsed = parseInt(num);
			if (parsed > 999) {
				return `${(parsed / 1000).toFixed(2)} $B`;
			}

			if (parsed > 999999) {
				return `${(parsed / 1000000).toFixed(2)} $T`;
			}
			return `${parsed} $M`;
		}

		let doc = {
			pageMargins: [50, 50],
			footer: function (currentPage) {
				const pageNumOffset = 8;
				return {
					stack: [
						{
							canvas: [{
								type: 'line',
								x1: 0, y1: 35,
								x2: 513, y2: 35,
								linewidth: 1.5,
								lineColor: '#404040',
								marginBottom: 10,
							}]
						},
						{
							image: img,
							width: 50
						},
					],
					margin: [sideMargin, 0, sideMargin - pageNumOffset, 0],
				};
			},
			content: [
				{ text: 'Joint Artificial Intelligence Center', alignment: 'center', style: 'header' },
				// { text: 'Annual Artificial Intelligence Inventory Baseline Assessment - Fiscal Year (FY) ' + data.budgetYear, alignment: 'center', style: 'header', marginBottom: 5 },
				{
					canvas: [{
						type: 'line',
						x1: 0, y1: 15,
						x2: 513, y2: 15,
						linewidth: 1.5,
						lineColor: '#404040',
						marginBottom: 10,
					}]
				},
				// { text: 'Research & Development Funded AI Activities', alignment: 'center', style: 'header' },
				{
					style: 'table',
					margin: [ 0, 50, 0, 50 ],
					table: {
						widths: ['*', '*', '*', '*'],
						body: [
							['Project Title:', data.projectTitle ?? 'N/A', 'AI Labeling:', label ?? 'N/A'],
							['Project:', data.projectNum ?? 'N/A', 'Service Agency Name:', data.serviceAgency ?? 'N/A'],
							['Appropriation:', data.appropriationNumber ?? 'N/A', 'Appropriation Title:', data.appropriationTitle ?? 'N/A'],
							['Budget:', data.budgetActivityNumber ?? 'N/A', 'Budget Activity Title:', data.budgetActivityTitle],
							['', '', '', ''],
							['Source Tags:', data.sourceTag ?? 'N/A', '', ''],
							['# of Keywords:', data.keywords ? data.keywords.length : 'N/A', 'Included Keywords:', data.keywords ?? 'N/A'],
							['', '', '', ''],
							['Program Element:', data.programElement ?? 'N/A', 'Planned Transition Partner (if known):', reviewData ? reviewData.pocPlannedTransitionPartner ?? reviewData.servicePlannedTransitionPartner ?? reviewData.primaryPlannedTransitionPartner ?? 'N/A' : 'N/A' ],
							['AI Domain: ', reviewData.domainTask ?? 'N/A', '', '' ],
							['Joint Capability Area: ', reviewData.pocJointCapabilityArea ?? 'N/A', reviewData.pocJointCapabilityArea2 ?? 'N/A', reviewData.pocJointCapabilityArea3 ?? 'N/A'],
							['Prior Year Amount: ', data.priorYearAmount !== null && data.priorYearAmount !== undefined ? `${formatNum(data.priorYearAmount)}` : 'N/A', 'Current Year Amount: ', data.currentYearAmount !== null && data.currentYearAmount !== undefined ? `${formatNum(data.currentYearAmount)}` : 'N/A'],
							['To Complete: ', `${parseInt(data.budgetYear) + (data.budgetType === 'Procurement' ? 3 : 2)}` || 'N/A', 'Total Cost: ', totalCost ? `${formatNum(totalCost)}` : 'N/A']
						]
					},
					layout: {
						defaultBorder: false
					},
					fontSize: 10,
				},
				{
					style: 'table',
					table: {
						widths: ['*'],
						heights:[10, 100],
						body: 
						[
							[{text: 'Data Type', style: 'title'}],
							[{text: 'How does the project fit this data type?'}],
						]
					}
				},
				{
					style: 'table',
					table: {
						widths: ['*'],
						heights:[10, 100],
						body: 
						[
							[{text: 'Joint Capability Area', style: 'title'}],
							[{text: 'Role of AI in this project?'}],
						]
					}
				}
	
			],
			styles: {
				title: {
					fontSize: 15,
					color: '#404040',
					marginTop: 15
				},
				classification: {
					color: '#404040',
					fontSize: 11,
					marginTop: 5
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
					fontSize: 11
				},
				table: {
					margin: [0, 15, 0, 15]
				},
			},
		};

		// doc.content.push(
		// 	{
		// 		style: 'table',
		// 		table: {
		// 			widths:['*', '*'],
		// 			body: [
		// 				[{text: 'FY21-FY25 Total Program Element Cost', colSpan: 2, style: 'title'}, {}],
		// 				['FY20:', ''],
		// 				['FY21:', ''],
		// 				['FY22:', ''],
		// 				['FY23:', ''],
		// 				['FY24:', ''],
		// 				['FY25:', ''],
		// 				['To Complete:', ''],
		// 				['Total Cost:', ''],
		// 			],
		// 		},
		// 	},
		// );

		if (reviewData && reviewData.serviceMissionPartnersList && reviewData.serviceMissionPartnersList.length > 0) {
			doc.content.push(
				{ 
					style: 'table',
					table: {
						widths:['*'],
						body: [
							[{text: 'Mission Partners', style: 'title'}],
							...reviewData.serviceMissionPartnersList.split('|').map(mp => {
								return [mp ?? '']
							})
						],
					},
				},
			);

		}

		if (data.accomplishments && data.accomplishments.length) {
			doc.content.push(
				{ 
					style: 'table',
					table: {
						widths:['*'],
						body: [
							[{text: 'Accomplishments', style: 'title'}],
							...data.accomplishments.map(accomp => {
								return [accomp.Accomp_Title_text ?? '']
							})
						],
					},
				}
			);

		}
		
		return doc;
	}

}
module.exports.Reports = Reports;
