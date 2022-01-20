'use strict'

const pdfMakeLib = require('pdfmake');
const csvStringifyLib = require('csv-stringify');
const moment = require('moment-timezone');
const path = require('path');
const loggerLib = require('../lib/logger');

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
				this.logger.error(e.message, 'NL71UTC', userId);
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

}
module.exports.Reports = Reports;
