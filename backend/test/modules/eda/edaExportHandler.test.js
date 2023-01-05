const assert = require('assert');
const { constructorOptionsMock } = require('../../resources/testUtility');
const _ = require('lodash');

const EDAExportHandler = require('../../../node_app/modules/eda/edaExportHandler');
const {
	mockPGResults,
	mockESResults,
	mockQuery,
	mockSearchTerms,
	mockResults,
} = require('../../resources/mockResponses/edaMockData');

let results = '';
let status = 0;
let pipe = false;
let additionalData = null;
let endData = null;

const mockReq = {
	body: {
		limit: 10000,
		index: 'eda',
		cloneData: {
			id: 2,
			clone_name: 'eda',
			display_name: 'ContractSearch',
			is_live: true,
			url: 'contractsearch',
			permissions_required: true,
			clone_to_advana: true,
			clone_to_gamechanger: false,
			clone_to_sipr: false,
			clone_to_jupiter: false,
			show_tutorial: false,
			show_graph: false,
			show_crowd_source: false,
			show_feedback: true,
			search_module: 'eda/edaSearchHandler',
			export_module: 'eda/edaExportHandler',
			title_bar_module: 'eda/edaTitleBarHandler',
			navigation_module: 'eda/edaNavigationHandler',
			card_module: 'eda/edaCardHandler',
			main_view_module: 'eda/edaMainViewHandler',
			graph_module: null,
			config: { esIndex: 'gc_eda' },
			createdAt: '2021-03-24T14:33:43.907Z',
			updatedAt: '2021-03-24T14:33:44.807Z',
			can_edit: true,
		},
		orgFilterString: [],
		typeFilterString: [],
		selectedDocuments: [],
		tiny_url: 'https://gamechanger.advana.data.mil/#/gamechanger?tiny=304',
		edaSearchSettings: {
			allOrgsSelected: false,
			organizations: {
				airForce: false,
				army: true,
				dla: false,
				marineCorps: false,
				navy: false,
				estate: false,
			},
			aggregations: { officeAgency: false, vendor: false, parentIDV: false },
			startDate: '2017-06-10',
			endDate: null,
			issueAgency: 'Dept of Army',
		},
		searchText: 'test',
		format: 'csv',
		cloneName: 'eda',
	},
	permissions: 'Webapp Super Admin',
};
const mockRes = {
	contentType(text) {
		this.contentType = text;
	},
	status(num) {
		status = num;
		return this;
	},
	send(data) {
		additionalData = data;
	},
	end(data) {
		endData = data;
	},
};

beforeEach(() => {
	results = '';
	status = 0;
	pipe = false;
	additionalData = null;
	endData = null;
});

describe('EDAExportHandler', function () {
	describe('#exportHandler', () => {
		it('should export a csv file based on search data', async (done) => {
			results = '';
			status = 0;
			pipe = false;

			const opts = {
				...constructorOptionsMock,
				searchUtility: {
					getEsSearchTerms() {
						return mockSearchTerms;
					},
				},
				edaSearchUtility: {
					getElasticsearchPagesQuery(body, userId) {
						return mockQuery;
					},
					cleanUpEsResults(results, searchTerms) {
						return mockResults;
					},
				},
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(mockESResults);
					},
					queryLineItemPostgres() {
						return Promise.resolve(mockPGResults);
					},
				},
				csvStringify() {
					return {
						on() {},
						end() {},
						write(text) {
							results += text;
						},
						pipe() {
							pipe = true;
						},
					};
				},
				constants: {
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {},
					EDA_ELASTIC_SEARCH_OPTS: {
						index: 'test index',
					},
				},
			};

			const target = new EDAExportHandler(opts);
			const expectedStatus = 200;
			const expectedResults =
				'(U) Filename,(U) Contract Number,(U) Page Count,(U) Issuing Organization,(CUI//SP-PROCURE) PCS Code (FPDS-NG),(CUI//SP-PROCURE) PSC Description (FPDS-NG),(CUI//SP-PROCURE) Obligated Amount,(CUI//SP-PROCURE) Clin Number,(CUI//SP-PROCURE) Unit,(CUI//SP-PROCURE) Unit Price,(CUI//SP-PROCURE) Amount,(CUI//SP-PROCURE) Purchase Request Number,(CUI//SP-PROCURE) PSC Code,(CUI//SP-PROCURE) NAICSEDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf,2017-09-21.pdf-undefined,48,Army,,,6472000see previous filename*,,,,,,,test,test,test,test,test,test,test';
			try {
				await target.exportHelper(mockReq, mockRes, 'test');

				assert.strictEqual(status, expectedStatus);
				assert.strictEqual(pipe, true);
				assert.strictEqual(results, expectedResults);

				done();
			} catch (err) {
				assert.fail(err);
			}
		});

		it('should not export any content when no search results are found', async (done) => {
			try {
				results = '';
				status = 0;
				pipe = false;

				let mockedESResults = _.cloneDeep(mockESResults);

				// test errors
				mockedESResults.body.hits.total.value = 0;

				const opts = {
					...constructorOptionsMock,
					searchUtility: {
						getEsSearchTerms() {
							return mockSearchTerms;
						},
					},
					edaSearchUtility: {
						getElasticsearchPagesQuery(body, userId) {
							return mockQuery;
						},
						cleanUpEsResults(results, searchTerms) {
							return mockResults;
						},
					},
					dataLibrary: {
						queryElasticSearch() {
							return Promise.resolve(mockedESResults);
						},
						queryLineItemPostgres() {
							return Promise.resolve(mockPGResults);
						},
					},
					csvStringify() {
						return {
							on() {},
							end() {},
							write(text) {
								results += text;
							},
							pipe() {
								pipe = true;
							},
						};
					},
					constants: {
						GAMECHANGER_ELASTIC_SEARCH_OPTS: {},
						EDA_ELASTIC_SEARCH_OPTS: {
							index: 'test index',
						},
					},
				};

				const target = new EDAExportHandler(opts);

				// we're expecting the results to not change at all, as none were found
				await target.exportHelper(mockReq, mockRes, 'test');
				assert.strictEqual(results, '');
				done();
			} catch (err) {
				assert.fail(err);
			}
		});

		it('should throw an Unauthorized error', async (done) => {
			try {
				const mockedReq = _.cloneDeep(mockReq);

				// test no permissions
				mockedReq.permissions = [];

				const opts = {
					...constructorOptionsMock,
					searchUtility: {
						getEsSearchTerms() {
							return mockSearchTerms;
						},
					},
					edaSearchUtility: {
						getElasticsearchPagesQuery(body, userId) {
							return mockQuery;
						},
						cleanUpEsResults(results, searchTerms) {
							return mockResults;
						},
					},
					dataLibrary: {
						queryElasticSearch() {
							return Promise.resolve(mockESResults);
						},
						queryLineItemPostgres() {
							return Promise.resolve(mockPGResults);
						},
					},
					csvStringify() {
						return {
							on() {},
							end() {},
							write(text) {
								results += text;
							},
							pipe() {
								pipe = true;
							},
						};
					},
					constants: {
						GAMECHANGER_ELASTIC_SEARCH_OPTS: {},
						EDA_ELASTIC_SEARCH_OPTS: {
							index: 'test index',
						},
					},
				};

				const target = new EDAExportHandler(opts);

				await target.exportHelper(mockedReq, mockRes, 'test');
				assert.strictEqual(status, 500);
				assert.strictEqual(additionalData.message, 'Unauthorized');

				done();
			} catch (err) {
				assert.fail(err);
			}
		});

		it('should export a pdf file on search data', async (done) => {
			try {
				const mockedReq = _.cloneDeep(mockReq);
				mockedReq.body.format = 'pdf';

				const opts = {
					...constructorOptionsMock,
					searchUtility: {
						getEsSearchTerms() {
							return mockSearchTerms;
						},
					},
					edaSearchUtility: {
						getElasticsearchPagesQuery(body, userId) {
							return mockQuery;
						},
						cleanUpEsResults(results, searchTerms) {
							return mockResults;
						},
					},
					dataLibrary: {
						queryElasticSearch() {
							return Promise.resolve(mockESResults);
						},
						queryLineItemPostgres() {
							return Promise.resolve(mockPGResults);
						},
					},
					csvStringify() {
						return {
							on() {},
							end() {},
							write(text) {
								results += text;
							},
							pipe() {
								pipe = true;
							},
						};
					},
					constants: {
						GAMECHANGER_ELASTIC_SEARCH_OPTS: {},
						EDA_ELASTIC_SEARCH_OPTS: {
							index: 'test index',
						},
					},
					reports: {
						createPdfBuffer(searchResults, userId, rest, callback) {
							results = JSON.stringify(searchResults);
						},
					},
				};

				const target = new EDAExportHandler(opts);
				await target.exportHelper(mockedReq, mockRes, 'test');

				const expectedResults =
					'{"totalCount":1,"docs":[{"metadata_type_eda_ext":"pds","pds_grouping_eda_ext":"pds_974_filenames_and_size","pdf_ordernum_eda_ext":"0002","pdf_modification_eda_ext":"empty","pds_ordernum_eda_ext":"0002","doc_num":"/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","dir_location_eda_ext":"eda/piee/unarchive_pdf/pdf_bah_2","file_location_eda_ext":"gamechanger/projects/eda/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pds_contract_eda_ext":"W911NF17D0002","s3_path_eda_ext":"","doc_type":"/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pds_category_eda_ext":"\'historic\'","type":"document","pdf_filename_eda_ext":"EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pdf_category_eda_ext":"\'historic\'","pds_filename_eda_ext":"EDAPDS-59C397E8DE995F6AE05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-22.json","pdf_contract_eda_ext":"W911NF17D0002","filename":"EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pdf_grouping_eda_ext":"pdf_log_217","pds_modification_eda_ext":"empty","id":"EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf_0","page_count":48,"topics_s":[],"pageHits":[{"snippet":"Report \\nDI-QCIC-81891 - ACCEPTANCE <em>TEST</em> REPORT (ATR) \\nDI-SESS-80255A - FAILURE SUMMARY & ANALYSIS REPORT \\nDI-SESS-81628A - RELIABILITY <em>TEST</em> REPORT \\nDI-TMSS-80527C - Commercial Off","pageNumber":9},{"snippet":"testing, and adjust units under <em>test</em>.","pageNumber":12},{"snippet":"and Demo Support \\n \\n3.2.14.1 The Contractor shall support scheduled and ad-hoc testing events and demonstrations, which may include events \\nsuch as NIE, E15, <em>test</em> events at but not","pageNumber":16},{"snippet":"This includes a stool sample <em>test</em> for ova and parasites.","pageNumber":30},{"snippet":"., special \\nradio <em>test</em> equipment, when the contractor is responsible for radio testing or repair) \\n \\n(End of Clause) \\n \\n5152.225-5910 \\nCONTRACTOR HEALTH AND SAFETY \\n(DEC 2011) \\n \\n(a","pageNumber":32}],"pageHitCount":5,"contract_issue_name_eda_ext":"US ARMY ACC-APG-RTP W911NF","contract_issue_dodaac_eda_ext":"W911NF","issuing_organization_eda_ext":"Army","vendor_name_eda_ext":"Booz Allen Hamilton Inc.","vendor_duns_eda_ext":"006928857","vendor_cage_eda_ext":"17038","contract_admin_name_eda_ext":"S3101A","contract_admin_office_dodaac_eda_ext":"DCMA SPRINGFIELD","paying_office_name_eda_ext":"HQ0338","paying_office_dodaac_eda_ext":"DFAS COLUMBUS CENTER","modification_eda_ext":"Award","award_id_eda_ext":"0002","reference_idv_eda_ext":"W911NF17D0002","signature_date_eda_ext":"2017-09-21","effective_date_eda_ext":"2017-09-21","obligated_amounts_eda_ext":6472000,"naics_eda_ext":"541330","esIndex":"gc_eda_2021_syn_pds","keyw_5":"","ref_list":[],"clins":[{"clin_num_eda_ext":"test","unit_eda_ext":"test","unit_price_eda_ext":"test","amount_eda_ext":"test","purchase_request_number_eda_ext":"test","supplies_services_eda_ext":"test","psc_code_eda_ext":"test","naics_code_clin_eda_ext":"test"}]}],"doc_types":[],"doc_orgs":[],"searchTerms":["test"],"expansionDict":{}}';

				assert.strictEqual(status, 200);
				assert.strictEqual(results, expectedResults);

				done();
			} catch (err) {
				assert.fail(err);
			}
		});

		it('should end the response with the data being sent', async (done) => {
			try {
				const mockedReq = _.cloneDeep(mockReq);
				mockedReq.body.format = 'none';

				const opts = {
					...constructorOptionsMock,
					searchUtility: {
						getEsSearchTerms() {
							return mockSearchTerms;
						},
					},
					edaSearchUtility: {
						getElasticsearchPagesQuery(body, userId) {
							return mockQuery;
						},
						cleanUpEsResults(results, searchTerms) {
							return mockResults;
						},
					},
					dataLibrary: {
						queryElasticSearch() {
							return Promise.resolve(mockESResults);
						},
						queryLineItemPostgres() {
							return Promise.resolve(mockPGResults);
						},
					},
					csvStringify() {
						return {
							on() {},
							end() {},
							write(text) {
								results += text;
							},
							pipe() {
								pipe = true;
							},
						};
					},
					constants: {
						GAMECHANGER_ELASTIC_SEARCH_OPTS: {},
						EDA_ELASTIC_SEARCH_OPTS: {
							index: 'test index',
						},
					},
					reports: {
						createPdfBuffer(searchResults, userId, rest, callback) {
							results = JSON.stringify(searchResults);
						},
					},
				};

				const target = new EDAExportHandler(opts);
				await target.exportHelper(mockedReq, mockRes, 'test');

				const expectedResults =
					'{"totalCount":1,"docs":[{"metadata_type_eda_ext":"pds","pds_grouping_eda_ext":"pds_974_filenames_and_size","pdf_ordernum_eda_ext":"0002","pdf_modification_eda_ext":"empty","pds_ordernum_eda_ext":"0002","doc_num":"/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","dir_location_eda_ext":"eda/piee/unarchive_pdf/pdf_bah_2","file_location_eda_ext":"gamechanger/projects/eda/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pds_contract_eda_ext":"W911NF17D0002","s3_path_eda_ext":"","doc_type":"/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pds_category_eda_ext":"\'historic\'","type":"document","pdf_filename_eda_ext":"EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pdf_category_eda_ext":"\'historic\'","pds_filename_eda_ext":"EDAPDS-59C397E8DE995F6AE05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-22.json","pdf_contract_eda_ext":"W911NF17D0002","filename":"EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pdf_grouping_eda_ext":"pdf_log_217","pds_modification_eda_ext":"empty","id":"EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf_0","page_count":48,"topics_s":[],"pageHits":[{"snippet":"Report \\nDI-QCIC-81891 - ACCEPTANCE <em>TEST</em> REPORT (ATR) \\nDI-SESS-80255A - FAILURE SUMMARY & ANALYSIS REPORT \\nDI-SESS-81628A - RELIABILITY <em>TEST</em> REPORT \\nDI-TMSS-80527C - Commercial Off","pageNumber":9},{"snippet":"testing, and adjust units under <em>test</em>.","pageNumber":12},{"snippet":"and Demo Support \\n \\n3.2.14.1 The Contractor shall support scheduled and ad-hoc testing events and demonstrations, which may include events \\nsuch as NIE, E15, <em>test</em> events at but not","pageNumber":16},{"snippet":"This includes a stool sample <em>test</em> for ova and parasites.","pageNumber":30},{"snippet":"., special \\nradio <em>test</em> equipment, when the contractor is responsible for radio testing or repair) \\n \\n(End of Clause) \\n \\n5152.225-5910 \\nCONTRACTOR HEALTH AND SAFETY \\n(DEC 2011) \\n \\n(a","pageNumber":32}],"pageHitCount":5,"contract_issue_name_eda_ext":"US ARMY ACC-APG-RTP W911NF","contract_issue_dodaac_eda_ext":"W911NF","issuing_organization_eda_ext":"Army","vendor_name_eda_ext":"Booz Allen Hamilton Inc.","vendor_duns_eda_ext":"006928857","vendor_cage_eda_ext":"17038","contract_admin_name_eda_ext":"S3101A","contract_admin_office_dodaac_eda_ext":"DCMA SPRINGFIELD","paying_office_name_eda_ext":"HQ0338","paying_office_dodaac_eda_ext":"DFAS COLUMBUS CENTER","modification_eda_ext":"Award","award_id_eda_ext":"0002","reference_idv_eda_ext":"W911NF17D0002","signature_date_eda_ext":"2017-09-21","effective_date_eda_ext":"2017-09-21","obligated_amounts_eda_ext":6472000,"naics_eda_ext":"541330","esIndex":"gc_eda_2021_syn_pds","keyw_5":"","ref_list":[],"clins":[{"clin_num_eda_ext":"test","unit_eda_ext":"test","unit_price_eda_ext":"test","amount_eda_ext":"test","purchase_request_number_eda_ext":"test","supplies_services_eda_ext":"test","psc_code_eda_ext":"test","naics_code_clin_eda_ext":"test"}]}],"doc_types":[],"doc_orgs":[],"searchTerms":["test"],"expansionDict":{}}';

				assert.strictEqual(status, 200);
				assert.strictEqual(endData, expectedResults);

				done();
			} catch (err) {
				assert.fail(err);
			}
		});

		it('should send status 500 due to error', async (done) => {
			try {
				const mockedReq = _.cloneDeep(mockReq);
				mockedReq.body.format = 'none';

				const mockedRes = _.cloneDeep(mockRes);
				delete mockedRes.end;

				const opts = {
					...constructorOptionsMock,
					searchUtility: {
						getEsSearchTerms() {
							return mockSearchTerms;
						},
					},
					edaSearchUtility: {
						getElasticsearchPagesQuery(body, userId) {
							return mockQuery;
						},
						cleanUpEsResults(results, searchTerms) {
							return mockResults;
						},
					},
					dataLibrary: {
						queryElasticSearch() {
							return Promise.resolve(mockESResults);
						},
						queryLineItemPostgres() {
							return Promise.resolve(mockPGResults);
						},
					},
					csvStringify() {
						return {
							on() {},
							end() {},
							write(text) {
								results += text;
							},
							pipe() {
								pipe = true;
							},
						};
					},
					constants: {
						GAMECHANGER_ELASTIC_SEARCH_OPTS: {},
						EDA_ELASTIC_SEARCH_OPTS: {
							index: 'test index',
						},
					},
					reports: {
						createPdfBuffer(searchResults, userId, rest, callback) {
							results = JSON.stringify(searchResults);
						},
					},
				};

				const target = new EDAExportHandler(opts);
				await target.exportHelper(mockedReq, mockedRes, 'test');

				assert.strictEqual(status, 500);
				assert.strictEqual(results, '');

				done();
			} catch (err) {
				assert.fail(err);
			}
		});
	});
});
