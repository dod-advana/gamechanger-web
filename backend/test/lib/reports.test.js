const assert = require('assert');
const { Reports } = require('../../node_app/lib/reports');
const stream = require('stream');

describe('Reports', function () {

	const data = {
		"totalCount": 1,
		"docs": [{
			"display_title_s": "TM 4-41.11 DINING FACILITY OPERATIONS",
			"display_org_s": "US Army",
			"crawler_used_s": "army_pubs",
			"doc_num": "4-41.11",
			"summary_30": "1- The DFM manages the overall dining facility operation and is in direct charge of all food service these units food service personnel are then consolidated to operate the dining facility. Food service personnel that use standardized production tools and cooking methods Use the correct utensils for best food preparation, cooking and serving results. The recipe tells you what size cake pan to use and how much batter to pour into it. Army Food Management Information System To moisten food with liquid or melted fat during cooking to prevent drying of the surface and to add Army Food Management",
			"is_revoked_b": false,
			"doc_type": "TM",
			"type": "document",
			"title": "DINING FACILITY OPERATIONS",
			"keyw_5": "dining facility, sample sop, appendix, menu items, sample figure, proper temperature, pie crust, menu planning, danish pastry, crust peels",
			"filename": "TM 4-41.11.pdf",
			"access_timestamp_dt": "2021-03-10T15:54:30",
			"id": "TM 4-41.11.pdf_0",
			"display_doc_type_s": "Document",
			"ref_list": ["Title 21", "AR 30-22", "AR 40-25", "AR 40-657", "AR 40-656", "AR 350-1", "AR 614-200", "AR 600-38", "AR 735-5", "PAM 30-22", "PAM 750-8", "STP 10-92G1-SM-TG", "STP 10-92G25-SM-TG", "STP 21-1-SMCT", "STP 21-24-SMCT", "TB MED  530", "TB MED 530", "FM 10-23-2", "TM 4-41.11", "TM 10-412", "TM 4-41.12"],
			"publication_date_dt": "2012-04-23T00:00:00",
			"page_count": 186,
			"topics_s": ["diner", "recipe", "cooking", "dining facility", "dough"],
			"pageHits": [{
				"snippet": "addition to grilled sandwiches and the deli bar .Entrees may include other hot sandwiches such as the Sloppy Joe , Cannon Ball , and Fishwich or other popular short order entrees such as <em>pizza</em>",
				"pageNumber": 116
			}],
			"pageHitCount": 1,
			"esIndex": "gamechanger"
		}],
		"doc_types": [{
			"key": "TM",
			"doc_count": 1
		}],
		"searchTerms": ["pizza", "soda"],
		"expansionDict": {}
	};

	describe('#createCsvStream()', () => {

		it('should generate csv stream from data', (done) => {

			const result = `Filename,Title,Document Number,Document Type,Match Count,Publishing Organization,Publication Date,Verified On,Cancelled,Keywords,Topics,Reference List\nTM 4-41.11.pdf,DINING FACILITY OPERATIONS,4-41.11,TM,1,US Army,2012-04-23T00:00:00,2021-03-10T15:54:30,No,"dining facility, sample sop, appendix, menu items, sample figure, proper temperature, pie crust, menu planning, danish pastry, crust peels","[""diner"",""recipe"",""cooking"",""dining facility"",""dough""]","[""Title 21"",""AR 30-22"",""AR 40-25"",""AR 40-657"",""AR 40-656"",""AR 350-1"",""AR 614-200"",""AR 600-38"",""AR 735-5"",""PAM 30-22"",""PAM 750-8"",""STP 10-92G1-SM-TG"",""STP 10-92G25-SM-TG"",""STP 21-1-SMCT"",""STP 21-24-SMCT"",""TB MED  530"",""TB MED 530"",""FM 10-23-2"",""TM 4-41.11"",""TM 10-412"",""TM 4-41.12""]"\n`
			const target = new Reports();
			const userId = 'tester';

			const resStream = target.createCsvStream(data, userId);

			let resString = ''
			const sink = new stream.Writable();
			sink._write = (chunk, enc, next) => {
				resString = resString + chunk.toString()
				next();
			}

			sink.on('finish', () => {
				assert.equal(resString, result);
				done();
			});

			resStream.pipe(sink);

		});

	});
});