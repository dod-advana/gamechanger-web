const assert = require('assert');
const EDASearchHandler = require('../../../node_app/modules/eda/edaSearchHandler');
const { constructorOptionsMock } = require('../../resources/testUtility');

describe('EDASearchHandler', function () {
	describe('#searchHelper', () => {
		it('should return data for a search', async () => {
			const docSearchResultsMock = {
				body: {
					took: 15,
					timed_out: false,
					_shards: { total: 3, successful: 3, skipped: 0, failed: 0 },
					hits: {
						total: { value: 1, relation: 'eq' },
						max_score: 10.341896,
						hits: [
							{
								_index: 'gc_eda_2021_syn_pds',
								_type: '_doc',
								_id: 'ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db',
								_score: 10.341896,
								_source: {
									metadata_type_eda_ext: 'pds',
									extracted_data_eda_n: {
										contract_payment_office_dodaac_eda_ext: 'DFAS COLUMBUS CENTER',
										vendor_name_eda_ext: 'Booz Allen Hamilton Inc.',
										contract_issue_office_name_eda_ext: 'US ARMY ACC-APG-RTP W911NF',
										dodaac_org_type_eda_ext: 'army',
										vendor_duns_eda_ext: '006928857',
										contract_admin_office_dodaac_eda_ext: 'DCMA SPRINGFIELD',
										contract_issue_office_dodaac_eda_ext: 'W911NF',
										effective_date_eda_ext_dt: '2017-09-21',
										contract_admin_agency_name_eda_ext: 'S3101A',
										signature_date_eda_ext_dt: '2017-09-21',
										naics_eda_ext: '541330',
										modification_number_eda_ext: 'Award',
										vendor_cage_eda_ext: '17038',
										award_id_eda_ext: '0002',
										referenced_idv_eda_ext: 'W911NF17D0002',
										total_obligated_amount_eda_ext_f: 6472000,
										contract_payment_office_name_eda_ext: 'HQ0338',
									},
								},
								inner_hits: {
									pages: {
										hits: {
											total: { value: 7, relation: 'eq' },
											max_score: 6.5625486,
											hits: [
												{
													_index: 'gc_eda_2021_syn_pds',
													_type: '_doc',
													_id: 'ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db',
													_nested: { field: 'pages', offset: 11 },
													_score: 6.5625486,
													fields: {
														'pages.filename': [
															'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
														],
													},
													highlight: {
														'pages.p_raw_text': [
															'testing, and adjust units under <em>test</em>.',
														],
													},
												},
												{
													_index: 'gc_eda_2021_syn_pds',
													_type: '_doc',
													_id: 'ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db',
													_nested: { field: 'pages', offset: 8 },
													_score: 4.782032,
													fields: {
														'pages.filename': [
															'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
														],
													},
													highlight: {
														'pages.p_raw_text': [
															'Report \nDI-QCIC-81891 - ACCEPTANCE <em>TEST</em> REPORT (ATR) \nDI-SESS-80255A - FAILURE SUMMARY & ANALYSIS REPORT \nDI-SESS-81628A - RELIABILITY <em>TEST</em> REPORT \nDI-TMSS-80527C - Commercial Off',
														],
													},
												},
												{
													_index: 'gc_eda_2021_syn_pds',
													_type: '_doc',
													_id: 'ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db',
													_nested: { field: 'pages', offset: 15 },
													_score: 4.0893645,
													fields: {
														'pages.filename': [
															'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
														],
													},
													highlight: {
														'pages.p_raw_text': [
															'and Demo Support \n \n3.2.14.1 The Contractor shall support scheduled and ad-hoc testing events and demonstrations, which may include events \nsuch as NIE, E15, <em>test</em> events at but not',
														],
													},
												},
												{
													_index: 'gc_eda_2021_syn_pds',
													_type: '_doc',
													_id: 'ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db',
													_nested: { field: 'pages', offset: 29 },
													_score: 3.580061,
													fields: {
														'pages.filename': [
															'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
														],
													},
													highlight: {
														'pages.p_raw_text': [
															'This includes a stool sample <em>test</em> for ova and parasites.',
														],
													},
												},
												{
													_index: 'gc_eda_2021_syn_pds',
													_type: '_doc',
													_id: 'ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db',
													_nested: { field: 'pages', offset: 31 },
													_score: 2.8506374,
													fields: {
														'pages.filename': [
															'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
														],
													},
													highlight: {
														'pages.p_raw_text': [
															'., special \nradio <em>test</em> equipment, when the contractor is responsible for radio testing or repair) \n \n(End of Clause) \n \n5152.225-5910 \nCONTRACTOR HEALTH AND SAFETY \n(DEC 2011) \n \n(a',
														],
													},
												},
											],
										},
									},
								},
							},
						],
					},
				},
				statusCode: 200,
				headers: {
					date: 'Thu, 13 May 2021 16:50:29 GMT',
					'content-type': 'application/json; charset=UTF-8',
					'content-length': '3606',
					connection: 'keep-alive',
					'access-control-allow-origin': '*',
				},
				meta: {
					context: null,
					request: {
						params: {
							method: 'POST',
							path: '/gc_eda_2021_syn_pds/_search',
							body: '{"_source":{"includes":["extracted_data_eda_n","metadata_type_eda_ext"]},"from":0,"size":10000,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"test*","boost":15}}},{"query_string":{"query":"test","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"multi_match":{"query":"test","fields":["pdf_filename_eda_ext","pds_contract_eda_ext","pds_filename_eda_ext","pdf_contract_eda_ext","pds_modification_eda_ext"],"operator":"or"}}]}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.contract_issue_office_name_eda_ext":"Dept of Army"}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"should":[{"match":{"extracted_data_eda_n.dodaac_org_type_eda_ext":"army"}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"range":{"extracted_data_eda_n.signature_date_eda_ext_dt":{"gte":"2017-06-11"}}}}}],"should":[{"multi_match":{"query":"test","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}]}}}',
							querystring: '',
							headers: {
								'user-agent': 'elasticsearch-js/7.11.0 (linux 4.19.76-linuxkit-x64; Node.js v10.9.0)',
								'x-elastic-client-meta': 'es=7.11.0,js=10.9.0,t=7.11.0,hc=10.9.0',
								'content-type': 'application/json',
								'content-length': '1534',
							},
							timeout: 30000,
						},
						options: {},
						id: 2,
					},
					name: 'elasticsearch-js',
					connection: {
						url: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						id: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						headers: {},
						deadCount: 0,
						resurrectTimeout: 0,
						_openRequests: 0,
						status: 'alive',
						roles: { master: true, data: true, ingest: true, ml: false },
					},
					attempts: 0,
					aborted: false,
				},
			};
			const req = {
				body: {
					transformResults: false,
					charsPadding: 90,
					useGCCache: false,
					tiny_url: 'contractsearch?tiny=304',
					combinedSearch: 'false',
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
					searchVersion: 1,
					searchText: 'test',
					offset: 0,
					limit: 20,
					cloneName: 'eda',
				},
				permissions: ['View EDA'],
			};

			const opts = {
				...constructorOptionsMock,
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(docSearchResultsMock);
					},
					putDocument() {},
				},
				mlApi: {
					getExpandedSearchTerms() {
						return Promise.resolve([]);
					},
				},
				edaSearchUtility: {
					getElasticsearchPagesQuery() {
						return Promise.resolve();
					},
					cleanUpEsResults() {
						return Promise.resolve({
							query: {
								_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'] },
								stored_fields: [
									'filename',
									'title',
									'page_count',
									'doc_type',
									'doc_num',
									'ref_list',
									'id',
									'summary_30',
									'keyw_5',
									'p_text',
									'type',
									'p_page',
									'display_title_s',
									'display_org_s',
									'display_doc_type_s',
									'*_eda_ext',
								],
								from: 0,
								size: 20,
								track_total_hits: true,
								query: {
									bool: {
										must: [
											{
												bool: {
													should: [
														{
															nested: {
																path: 'pages',
																inner_hits: {
																	_source: false,
																	stored_fields: [
																		'pages.filename',
																		'pages.p_raw_text',
																	],
																	from: 0,
																	size: 5,
																	highlight: {
																		fields: {
																			'pages.filename.search': {
																				number_of_fragments: 0,
																			},
																			'pages.p_raw_text': {
																				fragment_size: 180,
																				number_of_fragments: 1,
																			},
																		},
																		fragmenter: 'span',
																	},
																},
																query: {
																	bool: {
																		should: [
																			{
																				wildcard: {
																					'pages.filename.search': {
																						value: 'test*',
																						boost: 15,
																					},
																				},
																			},
																			{
																				query_string: {
																					query: 'test',
																					default_field: 'pages.p_raw_text',
																					default_operator: 'and',
																					fuzzy_max_expansions: 100,
																					fuzziness: 'AUTO',
																				},
																			},
																		],
																	},
																},
															},
														},
														{
															multi_match: {
																query: 'test',
																fields: [
																	'pdf_filename_eda_ext',
																	'pds_contract_eda_ext',
																	'pds_filename_eda_ext',
																	'pdf_contract_eda_ext',
																	'pds_modification_eda_ext',
																],
																operator: 'or',
															},
														},
													],
												},
											},
											{
												nested: {
													path: 'extracted_data_eda_n',
													query: {
														bool: {
															should: [
																{
																	match: {
																		'extracted_data_eda_n.dodaac_org_type_eda_ext':
																			'army',
																	},
																},
															],
														},
													},
												},
											},
											{
												nested: {
													path: 'extracted_data_eda_n',
													query: {
														bool: {
															must: [
																{
																	match: {
																		'extracted_data_eda_n.contract_issue_office_name_eda_ext':
																			'Dept of Army',
																	},
																},
															],
														},
													},
												},
											},
											{
												nested: {
													path: 'extracted_data_eda_n',
													query: {
														range: {
															'extracted_data_eda_n.signature_date_eda_ext_dt': {
																gte: '2017-06-10',
															},
														},
													},
												},
											},
										],
										should: [
											{
												multi_match: {
													query: 'test',
													fields: ['keyw_5^2', 'id^2', 'summary_30', 'pages.p_raw_text'],
													operator: 'or',
												},
											},
											{ rank_feature: { field: 'pagerank_r', boost: 0.5 } },
											{ rank_feature: { field: 'kw_doc_score_r', boost: 0.1 } },
										],
									},
								},
							},
							totalCount: 1,
							docs: [
								{
									metadata_type_eda_ext: 'pds',
									pds_grouping_eda_ext: 'pds_974_filenames_and_size',
									pdf_ordernum_eda_ext: '0002',
									pdf_modification_eda_ext: 'empty',
									pds_ordernum_eda_ext: '0002',
									doc_num:
										'/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									dir_location_eda_ext: 'eda/piee/unarchive_pdf/pdf_bah_2',
									file_location_eda_ext:
										'gamechanger/projects/eda/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									pds_contract_eda_ext: 'W911NF17D0002',
									s3_path_eda_ext: '',
									doc_type:
										'/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									pds_category_eda_ext: "'historic'",
									type: 'document',
									title: 'W911NF17D0002-0002-empty',
									pdf_filename_eda_ext:
										'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									pdf_category_eda_ext: "'historic'",
									pds_filename_eda_ext:
										'EDAPDS-59C397E8DE995F6AE05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-22.json',
									pdf_contract_eda_ext: 'W911NF17D0002',
									filename:
										'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									pdf_grouping_eda_ext: 'pdf_log_217',
									pds_modification_eda_ext: 'empty',
									id: 'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf_0',
									page_count: 48,
									topics_s: [],
									pageHits: [
										{
											snippet:
												'Report \nDI-QCIC-81891 - ACCEPTANCE <em>TEST</em> REPORT (ATR) \nDI-SESS-80255A - FAILURE SUMMARY & ANALYSIS REPORT \nDI-SESS-81628A - RELIABILITY <em>TEST</em> REPORT \nDI-TMSS-80527C - Commercial Off',
											pageNumber: 9,
										},
										{ snippet: 'testing, and adjust units under <em>test</em>.', pageNumber: 12 },
										{
											snippet:
												'and Demo Support \n \n3.2.14.1 The Contractor shall support scheduled and ad-hoc testing events and demonstrations, which may include events \nsuch as NIE, E15, <em>test</em> events at but not',
											pageNumber: 16,
										},
										{
											snippet:
												'This includes a stool sample <em>test</em> for ova and parasites.',
											pageNumber: 30,
										},
										{
											snippet:
												'., special \nradio <em>test</em> equipment, when the contractor is responsible for radio testing or repair) \n \n(End of Clause) \n \n5152.225-5910 \nCONTRACTOR HEALTH AND SAFETY \n(DEC 2011) \n \n(a',
											pageNumber: 32,
										},
									],
									pageHitCount: 5,
									contract_issue_name_eda_ext: 'US ARMY ACC-APG-RTP W911NF',
									contract_issue_dodaac_eda_ext: 'W911NF',
									issuing_organization_eda_ext: 'Army',
									vendor_name_eda_ext: 'Booz Allen Hamilton Inc.',
									vendor_duns_eda_ext: '006928857',
									vendor_cage_eda_ext: '17038',
									contract_admin_name_eda_ext: 'S3101A',
									contract_admin_office_dodaac_eda_ext: 'DCMA SPRINGFIELD',
									paying_office_name_eda_ext: 'HQ0338',
									paying_office_dodaac_eda_ext: 'DFAS COLUMBUS CENTER',
									modification_eda_ext: 'Award',
									award_id_eda_ext: '0002',
									reference_idv_eda_ext: 'W911NF17D0002',
									signature_date_eda_ext: '2017-09-21',
									effective_date_eda_ext: '2017-09-21',
									obligated_amounts_eda_ext: 6472000,
									naics_eda_ext: '541330',
									esIndex: 'gc_eda_2021_syn_pds',
									keyw_5: '',
									ref_list: [],
								},
							],
							doc_types: [],
							doc_orgs: [],
							searchTerms: ['test'],
							expansionDict: {
								test: [
									{ phrase: 'mental', source: 'thesaurus' },
									{ phrase: 'psychometric', source: 'thesaurus' },
									{ phrase: 'check', source: 'ML-QE' },
									{ phrase: 'exam', source: 'thesaurus' },
									{ phrase: 'examination', source: 'thesaurus' },
									{ phrase: 'result', source: 'ML-QE' },
								],
							},
						});
					},
				},
				constants: {
					EDA_ELASTIC_SEARCH_OPTS: 'test es opts',
					GAME_CHANGER_OPTS: {
						historyIndex: 'test index',
					},
				},
				esSearchLib: {},
				redisDB: 'redis://localhost',
			};

			const target = new EDASearchHandler(opts);
			target.storeRecordOfSearchInPg = jest.fn(() => Promise.resolve());

			try {
				const actual = await target.searchHelper(req, 'test', true);
				const expected = {
					query: {
						_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'] },
						stored_fields: [
							'filename',
							'title',
							'page_count',
							'doc_type',
							'doc_num',
							'ref_list',
							'id',
							'summary_30',
							'keyw_5',
							'p_text',
							'type',
							'p_page',
							'display_title_s',
							'display_org_s',
							'display_doc_type_s',
							'*_eda_ext',
						],
						from: 0,
						size: 20,
						track_total_hits: true,
						query: {
							bool: {
								must: [
									{
										bool: {
											should: [
												{
													nested: {
														path: 'pages',
														inner_hits: {
															_source: false,
															stored_fields: ['pages.filename', 'pages.p_raw_text'],
															from: 0,
															size: 5,
															highlight: {
																fields: {
																	'pages.filename.search': { number_of_fragments: 0 },
																	'pages.p_raw_text': {
																		fragment_size: 180,
																		number_of_fragments: 1,
																	},
																},
																fragmenter: 'span',
															},
														},
														query: {
															bool: {
																should: [
																	{
																		wildcard: {
																			'pages.filename.search': {
																				value: 'test*',
																				boost: 15,
																			},
																		},
																	},
																	{
																		query_string: {
																			query: 'test',
																			default_field: 'pages.p_raw_text',
																			default_operator: 'and',
																			fuzzy_max_expansions: 100,
																			fuzziness: 'AUTO',
																		},
																	},
																],
															},
														},
													},
												},
												{
													multi_match: {
														query: 'test',
														fields: [
															'pdf_filename_eda_ext',
															'pds_contract_eda_ext',
															'pds_filename_eda_ext',
															'pdf_contract_eda_ext',
															'pds_modification_eda_ext',
														],
														operator: 'or',
													},
												},
											],
										},
									},
									{
										nested: {
											path: 'extracted_data_eda_n',
											query: {
												bool: {
													should: [
														{
															match: {
																'extracted_data_eda_n.dodaac_org_type_eda_ext': 'army',
															},
														},
													],
												},
											},
										},
									},
									{
										nested: {
											path: 'extracted_data_eda_n',
											query: {
												bool: {
													must: [
														{
															match: {
																'extracted_data_eda_n.contract_issue_office_name_eda_ext':
																	'Dept of Army',
															},
														},
													],
												},
											},
										},
									},
									{
										nested: {
											path: 'extracted_data_eda_n',
											query: {
												range: {
													'extracted_data_eda_n.signature_date_eda_ext_dt': {
														gte: '2017-06-10',
													},
												},
											},
										},
									},
								],
								should: [
									{
										multi_match: {
											query: 'test',
											fields: ['keyw_5^2', 'id^2', 'summary_30', 'pages.p_raw_text'],
											operator: 'or',
										},
									},
									{ rank_feature: { field: 'pagerank_r', boost: 0.5 } },
									{ rank_feature: { field: 'kw_doc_score_r', boost: 0.1 } },
								],
							},
						},
					},
					totalCount: 1,
					docs: [
						{
							metadata_type_eda_ext: 'pds',
							pds_grouping_eda_ext: 'pds_974_filenames_and_size',
							pdf_ordernum_eda_ext: '0002',
							pdf_modification_eda_ext: 'empty',
							pds_ordernum_eda_ext: '0002',
							doc_num:
								'/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
							dir_location_eda_ext: 'eda/piee/unarchive_pdf/pdf_bah_2',
							file_location_eda_ext:
								'gamechanger/projects/eda/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
							pds_contract_eda_ext: 'W911NF17D0002',
							s3_path_eda_ext: '',
							doc_type:
								'/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
							pds_category_eda_ext: "'historic'",
							type: 'document',
							title: 'W911NF17D0002-0002-empty',
							pdf_filename_eda_ext:
								'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
							pdf_category_eda_ext: "'historic'",
							pds_filename_eda_ext:
								'EDAPDS-59C397E8DE995F6AE05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-22.json',
							pdf_contract_eda_ext: 'W911NF17D0002',
							filename:
								'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
							pdf_grouping_eda_ext: 'pdf_log_217',
							pds_modification_eda_ext: 'empty',
							id: 'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf_0',
							page_count: 48,
							topics_s: [],
							pageHits: [
								{
									snippet:
										'Report \nDI-QCIC-81891 - ACCEPTANCE <em>TEST</em> REPORT (ATR) \nDI-SESS-80255A - FAILURE SUMMARY & ANALYSIS REPORT \nDI-SESS-81628A - RELIABILITY <em>TEST</em> REPORT \nDI-TMSS-80527C - Commercial Off',
									pageNumber: 9,
								},
								{ snippet: 'testing, and adjust units under <em>test</em>.', pageNumber: 12 },
								{
									snippet:
										'and Demo Support \n \n3.2.14.1 The Contractor shall support scheduled and ad-hoc testing events and demonstrations, which may include events \nsuch as NIE, E15, <em>test</em> events at but not',
									pageNumber: 16,
								},
								{
									snippet: 'This includes a stool sample <em>test</em> for ova and parasites.',
									pageNumber: 30,
								},
								{
									snippet:
										'., special \nradio <em>test</em> equipment, when the contractor is responsible for radio testing or repair) \n \n(End of Clause) \n \n5152.225-5910 \nCONTRACTOR HEALTH AND SAFETY \n(DEC 2011) \n \n(a',
									pageNumber: 32,
								},
							],
							pageHitCount: 5,
							contract_issue_name_eda_ext: 'US ARMY ACC-APG-RTP W911NF',
							contract_issue_dodaac_eda_ext: 'W911NF',
							issuing_organization_eda_ext: 'Army',
							vendor_name_eda_ext: 'Booz Allen Hamilton Inc.',
							vendor_duns_eda_ext: '006928857',
							vendor_cage_eda_ext: '17038',
							contract_admin_name_eda_ext: 'S3101A',
							contract_admin_office_dodaac_eda_ext: 'DCMA SPRINGFIELD',
							paying_office_name_eda_ext: 'HQ0338',
							paying_office_dodaac_eda_ext: 'DFAS COLUMBUS CENTER',
							modification_eda_ext: 'Award',
							award_id_eda_ext: '0002',
							reference_idv_eda_ext: 'W911NF17D0002',
							signature_date_eda_ext: '2017-09-21',
							effective_date_eda_ext: '2017-09-21',
							obligated_amounts_eda_ext: 6472000,
							naics_eda_ext: '541330',
							esIndex: 'gc_eda_2021_syn_pds',
							keyw_5: '',
							ref_list: [],
						},
					],
					doc_types: [],
					doc_orgs: [],
					searchTerms: ['test'],
					expansionDict: {
						test: [
							{ phrase: 'mental', source: 'thesaurus' },
							{ phrase: 'psychometric', source: 'thesaurus' },
							{ phrase: 'check', source: 'ML-QE' },
							{ phrase: 'exam', source: 'thesaurus' },
							{ phrase: 'examination', source: 'thesaurus' },
							{ phrase: 'result', source: 'ML-QE' },
						],
					},
				};
				assert.deepStrictEqual(actual, expected);
				expect(target.storeRecordOfSearchInPg).toHaveBeenCalled();
			} catch (err) {
				assert.fail(err);
			}
		});

		it('should not store history when requested', async () => {
			const docSearchResultsMock = {
				body: {
					took: 15,
					timed_out: false,
					_shards: { total: 3, successful: 3, skipped: 0, failed: 0 },
					hits: {
						total: { value: 1, relation: 'eq' },
						max_score: 10.341896,
						hits: [
							{
								_index: 'gc_eda_2021_syn_pds',
								_type: '_doc',
								_id: 'ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db',
								_score: 10.341896,
								_source: {
									metadata_type_eda_ext: 'pds',
									extracted_data_eda_n: {
										contract_payment_office_dodaac_eda_ext: 'DFAS COLUMBUS CENTER',
										vendor_name_eda_ext: 'Booz Allen Hamilton Inc.',
										contract_issue_office_name_eda_ext: 'US ARMY ACC-APG-RTP W911NF',
										dodaac_org_type_eda_ext: 'army',
										vendor_duns_eda_ext: '006928857',
										contract_admin_office_dodaac_eda_ext: 'DCMA SPRINGFIELD',
										contract_issue_office_dodaac_eda_ext: 'W911NF',
										effective_date_eda_ext_dt: '2017-09-21',
										contract_admin_agency_name_eda_ext: 'S3101A',
										signature_date_eda_ext_dt: '2017-09-21',
										naics_eda_ext: '541330',
										modification_number_eda_ext: 'Award',
										vendor_cage_eda_ext: '17038',
										award_id_eda_ext: '0002',
										referenced_idv_eda_ext: 'W911NF17D0002',
										total_obligated_amount_eda_ext_f: 6472000,
										contract_payment_office_name_eda_ext: 'HQ0338',
									},
								},
								inner_hits: {
									pages: {
										hits: {
											total: { value: 7, relation: 'eq' },
											max_score: 6.5625486,
											hits: [
												{
													_index: 'gc_eda_2021_syn_pds',
													_type: '_doc',
													_id: 'ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db',
													_nested: { field: 'pages', offset: 11 },
													_score: 6.5625486,
													fields: {
														'pages.filename': [
															'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
														],
													},
													highlight: {
														'pages.p_raw_text': [
															'testing, and adjust units under <em>test</em>.',
														],
													},
												},
												{
													_index: 'gc_eda_2021_syn_pds',
													_type: '_doc',
													_id: 'ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db',
													_nested: { field: 'pages', offset: 8 },
													_score: 4.782032,
													fields: {
														'pages.filename': [
															'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
														],
													},
													highlight: {
														'pages.p_raw_text': [
															'Report \nDI-QCIC-81891 - ACCEPTANCE <em>TEST</em> REPORT (ATR) \nDI-SESS-80255A - FAILURE SUMMARY & ANALYSIS REPORT \nDI-SESS-81628A - RELIABILITY <em>TEST</em> REPORT \nDI-TMSS-80527C - Commercial Off',
														],
													},
												},
												{
													_index: 'gc_eda_2021_syn_pds',
													_type: '_doc',
													_id: 'ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db',
													_nested: { field: 'pages', offset: 15 },
													_score: 4.0893645,
													fields: {
														'pages.filename': [
															'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
														],
													},
													highlight: {
														'pages.p_raw_text': [
															'and Demo Support \n \n3.2.14.1 The Contractor shall support scheduled and ad-hoc testing events and demonstrations, which may include events \nsuch as NIE, E15, <em>test</em> events at but not',
														],
													},
												},
												{
													_index: 'gc_eda_2021_syn_pds',
													_type: '_doc',
													_id: 'ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db',
													_nested: { field: 'pages', offset: 29 },
													_score: 3.580061,
													fields: {
														'pages.filename': [
															'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
														],
													},
													highlight: {
														'pages.p_raw_text': [
															'This includes a stool sample <em>test</em> for ova and parasites.',
														],
													},
												},
												{
													_index: 'gc_eda_2021_syn_pds',
													_type: '_doc',
													_id: 'ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db',
													_nested: { field: 'pages', offset: 31 },
													_score: 2.8506374,
													fields: {
														'pages.filename': [
															'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
														],
													},
													highlight: {
														'pages.p_raw_text': [
															'., special \nradio <em>test</em> equipment, when the contractor is responsible for radio testing or repair) \n \n(End of Clause) \n \n5152.225-5910 \nCONTRACTOR HEALTH AND SAFETY \n(DEC 2011) \n \n(a',
														],
													},
												},
											],
										},
									},
								},
							},
						],
					},
				},
				statusCode: 200,
				headers: {
					date: 'Thu, 13 May 2021 16:50:29 GMT',
					'content-type': 'application/json; charset=UTF-8',
					'content-length': '3606',
					connection: 'keep-alive',
					'access-control-allow-origin': '*',
				},
				meta: {
					context: null,
					request: {
						params: {
							method: 'POST',
							path: '/gc_eda_2021_syn_pds/_search',
							body: '{"_source":{"includes":["extracted_data_eda_n","metadata_type_eda_ext"]},"from":0,"size":10000,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"test*","boost":15}}},{"query_string":{"query":"test","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"multi_match":{"query":"test","fields":["pdf_filename_eda_ext","pds_contract_eda_ext","pds_filename_eda_ext","pdf_contract_eda_ext","pds_modification_eda_ext"],"operator":"or"}}]}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.contract_issue_office_name_eda_ext":"Dept of Army"}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"should":[{"match":{"extracted_data_eda_n.dodaac_org_type_eda_ext":"army"}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"range":{"extracted_data_eda_n.signature_date_eda_ext_dt":{"gte":"2017-06-11"}}}}}],"should":[{"multi_match":{"query":"test","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}]}}}',
							querystring: '',
							headers: {
								'user-agent': 'elasticsearch-js/7.11.0 (linux 4.19.76-linuxkit-x64; Node.js v10.9.0)',
								'x-elastic-client-meta': 'es=7.11.0,js=10.9.0,t=7.11.0,hc=10.9.0',
								'content-type': 'application/json',
								'content-length': '1534',
							},
							timeout: 30000,
						},
						options: {},
						id: 2,
					},
					name: 'elasticsearch-js',
					connection: {
						url: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						id: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						headers: {},
						deadCount: 0,
						resurrectTimeout: 0,
						_openRequests: 0,
						status: 'alive',
						roles: { master: true, data: true, ingest: true, ml: false },
					},
					attempts: 0,
					aborted: false,
				},
			};
			const req = {
				body: {
					transformResults: false,
					charsPadding: 90,
					useGCCache: false,
					tiny_url: 'contractsearch?tiny=304',
					combinedSearch: 'false',
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
					searchVersion: 1,
					searchText: 'test',
					offset: 0,
					limit: 20,
					cloneName: 'eda',
				},
				permissions: ['View EDA'],
			};

			const opts = {
				...constructorOptionsMock,
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(docSearchResultsMock);
					},
					putDocument() {},
				},
				mlApi: {
					getExpandedSearchTerms() {
						return Promise.resolve([]);
					},
				},
				edaSearchUtility: {
					getElasticsearchPagesQuery() {
						return Promise.resolve();
					},
					cleanUpEsResults() {
						return Promise.resolve({
							query: {
								_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'] },
								stored_fields: [
									'filename',
									'title',
									'page_count',
									'doc_type',
									'doc_num',
									'ref_list',
									'id',
									'summary_30',
									'keyw_5',
									'p_text',
									'type',
									'p_page',
									'display_title_s',
									'display_org_s',
									'display_doc_type_s',
									'*_eda_ext',
								],
								from: 0,
								size: 20,
								track_total_hits: true,
								query: {
									bool: {
										must: [
											{
												bool: {
													should: [
														{
															nested: {
																path: 'pages',
																inner_hits: {
																	_source: false,
																	stored_fields: [
																		'pages.filename',
																		'pages.p_raw_text',
																	],
																	from: 0,
																	size: 5,
																	highlight: {
																		fields: {
																			'pages.filename.search': {
																				number_of_fragments: 0,
																			},
																			'pages.p_raw_text': {
																				fragment_size: 180,
																				number_of_fragments: 1,
																			},
																		},
																		fragmenter: 'span',
																	},
																},
																query: {
																	bool: {
																		should: [
																			{
																				wildcard: {
																					'pages.filename.search': {
																						value: 'test*',
																						boost: 15,
																					},
																				},
																			},
																			{
																				query_string: {
																					query: 'test',
																					default_field: 'pages.p_raw_text',
																					default_operator: 'and',
																					fuzzy_max_expansions: 100,
																					fuzziness: 'AUTO',
																				},
																			},
																		],
																	},
																},
															},
														},
														{
															multi_match: {
																query: 'test',
																fields: [
																	'pdf_filename_eda_ext',
																	'pds_contract_eda_ext',
																	'pds_filename_eda_ext',
																	'pdf_contract_eda_ext',
																	'pds_modification_eda_ext',
																],
																operator: 'or',
															},
														},
													],
												},
											},
											{
												nested: {
													path: 'extracted_data_eda_n',
													query: {
														bool: {
															should: [
																{
																	match: {
																		'extracted_data_eda_n.dodaac_org_type_eda_ext':
																			'army',
																	},
																},
															],
														},
													},
												},
											},
											{
												nested: {
													path: 'extracted_data_eda_n',
													query: {
														bool: {
															must: [
																{
																	match: {
																		'extracted_data_eda_n.contract_issue_office_name_eda_ext':
																			'Dept of Army',
																	},
																},
															],
														},
													},
												},
											},
											{
												nested: {
													path: 'extracted_data_eda_n',
													query: {
														range: {
															'extracted_data_eda_n.signature_date_eda_ext_dt': {
																gte: '2017-06-10',
															},
														},
													},
												},
											},
										],
										should: [
											{
												multi_match: {
													query: 'test',
													fields: ['keyw_5^2', 'id^2', 'summary_30', 'pages.p_raw_text'],
													operator: 'or',
												},
											},
											{ rank_feature: { field: 'pagerank_r', boost: 0.5 } },
											{ rank_feature: { field: 'kw_doc_score_r', boost: 0.1 } },
										],
									},
								},
							},
							totalCount: 1,
							docs: [
								{
									metadata_type_eda_ext: 'pds',
									pds_grouping_eda_ext: 'pds_974_filenames_and_size',
									pdf_ordernum_eda_ext: '0002',
									pdf_modification_eda_ext: 'empty',
									pds_ordernum_eda_ext: '0002',
									doc_num:
										'/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									dir_location_eda_ext: 'eda/piee/unarchive_pdf/pdf_bah_2',
									file_location_eda_ext:
										'gamechanger/projects/eda/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									pds_contract_eda_ext: 'W911NF17D0002',
									s3_path_eda_ext: '',
									doc_type:
										'/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									pds_category_eda_ext: "'historic'",
									type: 'document',
									title: 'W911NF17D0002-0002-empty',
									pdf_filename_eda_ext:
										'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									pdf_category_eda_ext: "'historic'",
									pds_filename_eda_ext:
										'EDAPDS-59C397E8DE995F6AE05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-22.json',
									pdf_contract_eda_ext: 'W911NF17D0002',
									filename:
										'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									pdf_grouping_eda_ext: 'pdf_log_217',
									pds_modification_eda_ext: 'empty',
									id: 'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf_0',
									page_count: 48,
									topics_s: [],
									pageHits: [
										{
											snippet:
												'Report \nDI-QCIC-81891 - ACCEPTANCE <em>TEST</em> REPORT (ATR) \nDI-SESS-80255A - FAILURE SUMMARY & ANALYSIS REPORT \nDI-SESS-81628A - RELIABILITY <em>TEST</em> REPORT \nDI-TMSS-80527C - Commercial Off',
											pageNumber: 9,
										},
										{ snippet: 'testing, and adjust units under <em>test</em>.', pageNumber: 12 },
										{
											snippet:
												'and Demo Support \n \n3.2.14.1 The Contractor shall support scheduled and ad-hoc testing events and demonstrations, which may include events \nsuch as NIE, E15, <em>test</em> events at but not',
											pageNumber: 16,
										},
										{
											snippet:
												'This includes a stool sample <em>test</em> for ova and parasites.',
											pageNumber: 30,
										},
										{
											snippet:
												'., special \nradio <em>test</em> equipment, when the contractor is responsible for radio testing or repair) \n \n(End of Clause) \n \n5152.225-5910 \nCONTRACTOR HEALTH AND SAFETY \n(DEC 2011) \n \n(a',
											pageNumber: 32,
										},
									],
									pageHitCount: 5,
									contract_issue_name_eda_ext: 'US ARMY ACC-APG-RTP W911NF',
									contract_issue_dodaac_eda_ext: 'W911NF',
									issuing_organization_eda_ext: 'Army',
									vendor_name_eda_ext: 'Booz Allen Hamilton Inc.',
									vendor_duns_eda_ext: '006928857',
									vendor_cage_eda_ext: '17038',
									contract_admin_name_eda_ext: 'S3101A',
									contract_admin_office_dodaac_eda_ext: 'DCMA SPRINGFIELD',
									paying_office_name_eda_ext: 'HQ0338',
									paying_office_dodaac_eda_ext: 'DFAS COLUMBUS CENTER',
									modification_eda_ext: 'Award',
									award_id_eda_ext: '0002',
									reference_idv_eda_ext: 'W911NF17D0002',
									signature_date_eda_ext: '2017-09-21',
									effective_date_eda_ext: '2017-09-21',
									obligated_amounts_eda_ext: 6472000,
									naics_eda_ext: '541330',
									esIndex: 'gc_eda_2021_syn_pds',
									keyw_5: '',
									ref_list: [],
								},
							],
							doc_types: [],
							doc_orgs: [],
							searchTerms: ['test'],
							expansionDict: {
								test: [
									{ phrase: 'mental', source: 'thesaurus' },
									{ phrase: 'psychometric', source: 'thesaurus' },
									{ phrase: 'check', source: 'ML-QE' },
									{ phrase: 'exam', source: 'thesaurus' },
									{ phrase: 'examination', source: 'thesaurus' },
									{ phrase: 'result', source: 'ML-QE' },
								],
							},
						});
					},
				},
				constants: {
					EDA_ELASTIC_SEARCH_OPTS: 'test es opts',
					GAME_CHANGER_OPTS: {
						historyIndex: 'test index',
					},
				},
				esSearchLib: {},
				redisDB: 'redis://localhost',
			};

			const target = new EDASearchHandler(opts);
			target.storeRecordOfSearchInPg = jest.fn(() => Promise.resolve());
			target.storeEsRecord = jest.fn(() => Promise.resolve());
			try {
				const actual = await target.searchHelper(req, 'test', false);
				const expected = {
					query: {
						_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'] },
						stored_fields: [
							'filename',
							'title',
							'page_count',
							'doc_type',
							'doc_num',
							'ref_list',
							'id',
							'summary_30',
							'keyw_5',
							'p_text',
							'type',
							'p_page',
							'display_title_s',
							'display_org_s',
							'display_doc_type_s',
							'*_eda_ext',
						],
						from: 0,
						size: 20,
						track_total_hits: true,
						query: {
							bool: {
								must: [
									{
										bool: {
											should: [
												{
													nested: {
														path: 'pages',
														inner_hits: {
															_source: false,
															stored_fields: ['pages.filename', 'pages.p_raw_text'],
															from: 0,
															size: 5,
															highlight: {
																fields: {
																	'pages.filename.search': { number_of_fragments: 0 },
																	'pages.p_raw_text': {
																		fragment_size: 180,
																		number_of_fragments: 1,
																	},
																},
																fragmenter: 'span',
															},
														},
														query: {
															bool: {
																should: [
																	{
																		wildcard: {
																			'pages.filename.search': {
																				value: 'test*',
																				boost: 15,
																			},
																		},
																	},
																	{
																		query_string: {
																			query: 'test',
																			default_field: 'pages.p_raw_text',
																			default_operator: 'and',
																			fuzzy_max_expansions: 100,
																			fuzziness: 'AUTO',
																		},
																	},
																],
															},
														},
													},
												},
												{
													multi_match: {
														query: 'test',
														fields: [
															'pdf_filename_eda_ext',
															'pds_contract_eda_ext',
															'pds_filename_eda_ext',
															'pdf_contract_eda_ext',
															'pds_modification_eda_ext',
														],
														operator: 'or',
													},
												},
											],
										},
									},
									{
										nested: {
											path: 'extracted_data_eda_n',
											query: {
												bool: {
													should: [
														{
															match: {
																'extracted_data_eda_n.dodaac_org_type_eda_ext': 'army',
															},
														},
													],
												},
											},
										},
									},
									{
										nested: {
											path: 'extracted_data_eda_n',
											query: {
												bool: {
													must: [
														{
															match: {
																'extracted_data_eda_n.contract_issue_office_name_eda_ext':
																	'Dept of Army',
															},
														},
													],
												},
											},
										},
									},
									{
										nested: {
											path: 'extracted_data_eda_n',
											query: {
												range: {
													'extracted_data_eda_n.signature_date_eda_ext_dt': {
														gte: '2017-06-10',
													},
												},
											},
										},
									},
								],
								should: [
									{
										multi_match: {
											query: 'test',
											fields: ['keyw_5^2', 'id^2', 'summary_30', 'pages.p_raw_text'],
											operator: 'or',
										},
									},
									{ rank_feature: { field: 'pagerank_r', boost: 0.5 } },
									{ rank_feature: { field: 'kw_doc_score_r', boost: 0.1 } },
								],
							},
						},
					},
					totalCount: 1,
					docs: [
						{
							metadata_type_eda_ext: 'pds',
							pds_grouping_eda_ext: 'pds_974_filenames_and_size',
							pdf_ordernum_eda_ext: '0002',
							pdf_modification_eda_ext: 'empty',
							pds_ordernum_eda_ext: '0002',
							doc_num:
								'/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
							dir_location_eda_ext: 'eda/piee/unarchive_pdf/pdf_bah_2',
							file_location_eda_ext:
								'gamechanger/projects/eda/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
							pds_contract_eda_ext: 'W911NF17D0002',
							s3_path_eda_ext: '',
							doc_type:
								'/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
							pds_category_eda_ext: "'historic'",
							type: 'document',
							title: 'W911NF17D0002-0002-empty',
							pdf_filename_eda_ext:
								'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
							pdf_category_eda_ext: "'historic'",
							pds_filename_eda_ext:
								'EDAPDS-59C397E8DE995F6AE05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-22.json',
							pdf_contract_eda_ext: 'W911NF17D0002',
							filename:
								'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
							pdf_grouping_eda_ext: 'pdf_log_217',
							pds_modification_eda_ext: 'empty',
							id: 'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf_0',
							page_count: 48,
							topics_s: [],
							pageHits: [
								{
									snippet:
										'Report \nDI-QCIC-81891 - ACCEPTANCE <em>TEST</em> REPORT (ATR) \nDI-SESS-80255A - FAILURE SUMMARY & ANALYSIS REPORT \nDI-SESS-81628A - RELIABILITY <em>TEST</em> REPORT \nDI-TMSS-80527C - Commercial Off',
									pageNumber: 9,
								},
								{ snippet: 'testing, and adjust units under <em>test</em>.', pageNumber: 12 },
								{
									snippet:
										'and Demo Support \n \n3.2.14.1 The Contractor shall support scheduled and ad-hoc testing events and demonstrations, which may include events \nsuch as NIE, E15, <em>test</em> events at but not',
									pageNumber: 16,
								},
								{
									snippet: 'This includes a stool sample <em>test</em> for ova and parasites.',
									pageNumber: 30,
								},
								{
									snippet:
										'., special \nradio <em>test</em> equipment, when the contractor is responsible for radio testing or repair) \n \n(End of Clause) \n \n5152.225-5910 \nCONTRACTOR HEALTH AND SAFETY \n(DEC 2011) \n \n(a',
									pageNumber: 32,
								},
							],
							pageHitCount: 5,
							contract_issue_name_eda_ext: 'US ARMY ACC-APG-RTP W911NF',
							contract_issue_dodaac_eda_ext: 'W911NF',
							issuing_organization_eda_ext: 'Army',
							vendor_name_eda_ext: 'Booz Allen Hamilton Inc.',
							vendor_duns_eda_ext: '006928857',
							vendor_cage_eda_ext: '17038',
							contract_admin_name_eda_ext: 'S3101A',
							contract_admin_office_dodaac_eda_ext: 'DCMA SPRINGFIELD',
							paying_office_name_eda_ext: 'HQ0338',
							paying_office_dodaac_eda_ext: 'DFAS COLUMBUS CENTER',
							modification_eda_ext: 'Award',
							award_id_eda_ext: '0002',
							reference_idv_eda_ext: 'W911NF17D0002',
							signature_date_eda_ext: '2017-09-21',
							effective_date_eda_ext: '2017-09-21',
							obligated_amounts_eda_ext: 6472000,
							naics_eda_ext: '541330',
							esIndex: 'gc_eda_2021_syn_pds',
							keyw_5: '',
							ref_list: [],
						},
					],
					doc_types: [],
					doc_orgs: [],
					searchTerms: ['test'],
					expansionDict: {
						test: [
							{ phrase: 'mental', source: 'thesaurus' },
							{ phrase: 'psychometric', source: 'thesaurus' },
							{ phrase: 'check', source: 'ML-QE' },
							{ phrase: 'exam', source: 'thesaurus' },
							{ phrase: 'examination', source: 'thesaurus' },
							{ phrase: 'result', source: 'ML-QE' },
						],
					},
				};
				assert.deepStrictEqual(actual, expected);
				expect(target.storeRecordOfSearchInPg).not.toHaveBeenCalled();
				expect(target.storeEsRecord).not.toHaveBeenCalled();
			} catch (err) {
				assert.fail(err);
			}
		});

		it('should error and try storing results', async () => {
			const req = {};
			const opts = {
				...constructorOptionsMock,
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(docSearchResultsMock);
					},
					putDocument() {},
				},
				mlApi: {
					getExpandedSearchTerms() {
						return Promise.resolve([]);
					},
				},
				edaSearchUtility: {
					getElasticsearchPagesQuery() {
						return Promise.resolve();
					},
					cleanUpEsResults() {
						return Promise.resolve({
							query: {
								_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'] },
								stored_fields: [
									'filename',
									'title',
									'page_count',
									'doc_type',
									'doc_num',
									'ref_list',
									'id',
									'summary_30',
									'keyw_5',
									'p_text',
									'type',
									'p_page',
									'display_title_s',
									'display_org_s',
									'display_doc_type_s',
									'*_eda_ext',
								],
								from: 0,
								size: 20,
								track_total_hits: true,
								query: {
									bool: {
										must: [
											{
												bool: {
													should: [
														{
															nested: {
																path: 'pages',
																inner_hits: {
																	_source: false,
																	stored_fields: [
																		'pages.filename',
																		'pages.p_raw_text',
																	],
																	from: 0,
																	size: 5,
																	highlight: {
																		fields: {
																			'pages.filename.search': {
																				number_of_fragments: 0,
																			},
																			'pages.p_raw_text': {
																				fragment_size: 180,
																				number_of_fragments: 1,
																			},
																		},
																		fragmenter: 'span',
																	},
																},
																query: {
																	bool: {
																		should: [
																			{
																				wildcard: {
																					'pages.filename.search': {
																						value: 'test*',
																						boost: 15,
																					},
																				},
																			},
																			{
																				query_string: {
																					query: 'test',
																					default_field: 'pages.p_raw_text',
																					default_operator: 'and',
																					fuzzy_max_expansions: 100,
																					fuzziness: 'AUTO',
																				},
																			},
																		],
																	},
																},
															},
														},
														{
															multi_match: {
																query: 'test',
																fields: [
																	'pdf_filename_eda_ext',
																	'pds_contract_eda_ext',
																	'pds_filename_eda_ext',
																	'pdf_contract_eda_ext',
																	'pds_modification_eda_ext',
																],
																operator: 'or',
															},
														},
													],
												},
											},
											{
												nested: {
													path: 'extracted_data_eda_n',
													query: {
														bool: {
															should: [
																{
																	match: {
																		'extracted_data_eda_n.dodaac_org_type_eda_ext':
																			'army',
																	},
																},
															],
														},
													},
												},
											},
											{
												nested: {
													path: 'extracted_data_eda_n',
													query: {
														bool: {
															must: [
																{
																	match: {
																		'extracted_data_eda_n.contract_issue_office_name_eda_ext':
																			'Dept of Army',
																	},
																},
															],
														},
													},
												},
											},
											{
												nested: {
													path: 'extracted_data_eda_n',
													query: {
														range: {
															'extracted_data_eda_n.signature_date_eda_ext_dt': {
																gte: '2017-06-10',
															},
														},
													},
												},
											},
										],
										should: [
											{
												multi_match: {
													query: 'test',
													fields: ['keyw_5^2', 'id^2', 'summary_30', 'pages.p_raw_text'],
													operator: 'or',
												},
											},
											{ rank_feature: { field: 'pagerank_r', boost: 0.5 } },
											{ rank_feature: { field: 'kw_doc_score_r', boost: 0.1 } },
										],
									},
								},
							},
							totalCount: 1,
							docs: [
								{
									metadata_type_eda_ext: 'pds',
									pds_grouping_eda_ext: 'pds_974_filenames_and_size',
									pdf_ordernum_eda_ext: '0002',
									pdf_modification_eda_ext: 'empty',
									pds_ordernum_eda_ext: '0002',
									doc_num:
										'/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									dir_location_eda_ext: 'eda/piee/unarchive_pdf/pdf_bah_2',
									file_location_eda_ext:
										'gamechanger/projects/eda/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									pds_contract_eda_ext: 'W911NF17D0002',
									s3_path_eda_ext: '',
									doc_type:
										'/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									pds_category_eda_ext: "'historic'",
									type: 'document',
									title: 'W911NF17D0002-0002-empty',
									pdf_filename_eda_ext:
										'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									pdf_category_eda_ext: "'historic'",
									pds_filename_eda_ext:
										'EDAPDS-59C397E8DE995F6AE05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-22.json',
									pdf_contract_eda_ext: 'W911NF17D0002',
									filename:
										'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf',
									pdf_grouping_eda_ext: 'pdf_log_217',
									pds_modification_eda_ext: 'empty',
									id: 'EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf_0',
									page_count: 48,
									topics_s: [],
									pageHits: [
										{
											snippet:
												'Report \nDI-QCIC-81891 - ACCEPTANCE <em>TEST</em> REPORT (ATR) \nDI-SESS-80255A - FAILURE SUMMARY & ANALYSIS REPORT \nDI-SESS-81628A - RELIABILITY <em>TEST</em> REPORT \nDI-TMSS-80527C - Commercial Off',
											pageNumber: 9,
										},
										{ snippet: 'testing, and adjust units under <em>test</em>.', pageNumber: 12 },
										{
											snippet:
												'and Demo Support \n \n3.2.14.1 The Contractor shall support scheduled and ad-hoc testing events and demonstrations, which may include events \nsuch as NIE, E15, <em>test</em> events at but not',
											pageNumber: 16,
										},
										{
											snippet:
												'This includes a stool sample <em>test</em> for ova and parasites.',
											pageNumber: 30,
										},
										{
											snippet:
												'., special \nradio <em>test</em> equipment, when the contractor is responsible for radio testing or repair) \n \n(End of Clause) \n \n5152.225-5910 \nCONTRACTOR HEALTH AND SAFETY \n(DEC 2011) \n \n(a',
											pageNumber: 32,
										},
									],
									pageHitCount: 5,
									contract_issue_name_eda_ext: 'US ARMY ACC-APG-RTP W911NF',
									contract_issue_dodaac_eda_ext: 'W911NF',
									issuing_organization_eda_ext: 'Army',
									vendor_name_eda_ext: 'Booz Allen Hamilton Inc.',
									vendor_duns_eda_ext: '006928857',
									vendor_cage_eda_ext: '17038',
									contract_admin_name_eda_ext: 'S3101A',
									contract_admin_office_dodaac_eda_ext: 'DCMA SPRINGFIELD',
									paying_office_name_eda_ext: 'HQ0338',
									paying_office_dodaac_eda_ext: 'DFAS COLUMBUS CENTER',
									modification_eda_ext: 'Award',
									award_id_eda_ext: '0002',
									reference_idv_eda_ext: 'W911NF17D0002',
									signature_date_eda_ext: '2017-09-21',
									effective_date_eda_ext: '2017-09-21',
									obligated_amounts_eda_ext: 6472000,
									naics_eda_ext: '541330',
									esIndex: 'gc_eda_2021_syn_pds',
									keyw_5: '',
									ref_list: [],
								},
							],
							doc_types: [],
							doc_orgs: [],
							searchTerms: ['test'],
							expansionDict: {
								test: [
									{ phrase: 'mental', source: 'thesaurus' },
									{ phrase: 'psychometric', source: 'thesaurus' },
									{ phrase: 'check', source: 'ML-QE' },
									{ phrase: 'exam', source: 'thesaurus' },
									{ phrase: 'examination', source: 'thesaurus' },
									{ phrase: 'result', source: 'ML-QE' },
								],
							},
						});
					},
				},
				constants: {
					EDA_ELASTIC_SEARCH_OPTS: 'test es opts',
					GAME_CHANGER_OPTS: {
						historyIndex: 'test index',
					},
				},
				esSearchLib: {},
				redisDB: 'redis://localhost',
			};

			const target = new EDASearchHandler(opts);

			try {
				assert.rejects(async () => {
					await target.searchHelper(req, 'test', false);
				});
			} catch (err) {
				assert.fail(err);
			}
		});
	});

	describe('queryContractMods', function () {
		it('should return contract mod (number, sig date, effective date) from a contract award ID (isSearch is false)', async (done) => {
			const mockQuery = {
				_source: { includes: ['extracted_data_eda_n.modification_number_eda_ext'] },
				from: 0,
				size: 10000,
				track_total_hits: true,
				query: {
					bool: {
						must: [
							{
								nested: {
									path: 'extracted_data_eda_n',
									query: {
										bool: {
											must: [
												{
													match: {
														'extracted_data_eda_n.award_id_eda_ext': { query: '0012' },
													},
												},
											],
										},
									},
								},
							},
							{
								nested: {
									path: 'extracted_data_eda_n',
									query: {
										bool: {
											must: [
												{
													match: {
														'extracted_data_eda_n.referenced_idv_eda_ext': {
															query: 'FA807514D0016',
														},
													},
												},
											],
										},
									},
								},
							},
						],
					},
				},
			};
			const mockResults = {
				body: {
					took: 3,
					timed_out: false,
					_shards: { total: 3, successful: 3, skipped: 0, failed: 0 },
					hits: {
						total: { value: 15, relation: 'eq' },
						max_score: 7.9694905,
						hits: [
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: '9ab7179a5da0ecf331db2a1ec14bb5aaea19752f5767975369a477bfc0b517af',
								_score: 7.9694905,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: '18',
										effective_date_eda_ext_dt: '2017-04-18',
										signature_date_eda_ext_dt: '2017-04-18',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: '016ac9981ecf4a477ef229b8a240a03ffc1cc7be3db5b833646981a7402c785f',
								_score: 7.9694905,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: '27',
										effective_date_eda_ext_dt: '2018-05-14',
										signature_date_eda_ext_dt: '2018-05-14',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: 'a71354b9016f93bb9ade8a4a4ef465507c16e57eee402eaf165c485c6e9a20cf',
								_score: 7.9694905,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: '13',
										effective_date_eda_ext_dt: '2016-06-06',
										signature_date_eda_ext_dt: '2016-06-06',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: '97c05fb8da1c0933980032b2f952c7677a40d86e008bfa5e2250a8cbf310f2b0',
								_score: 7.9694905,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: '23',
										effective_date_eda_ext_dt: '2015-07-08',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: 'fc69e212de5e40a435932f1af3398b54f0775499d70039dece87a6a51cca8882',
								_score: 7.801201,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: 'Award',
										effective_date_eda_ext_dt: '2015-07-08',
										signature_date_eda_ext_dt: '2015-07-08',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: '32523bfd1ab9ce11566348464c57e0b79771a251ef602263b6bb6660da608384',
								_score: 7.801201,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: '14',
										effective_date_eda_ext_dt: '2016-08-15',
										signature_date_eda_ext_dt: '2016-08-15',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: '9e49ca892fdd7d22e3b565130073ff5998a59ccd8ee110a872cff555b5213566',
								_score: 7.801201,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: '21',
										effective_date_eda_ext_dt: '2017-07-27',
										signature_date_eda_ext_dt: '2017-07-28',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: '33658c502a4c48de491ff69772eddbb01069810adc1b33c32785f40a2e69a7cd',
								_score: 7.801201,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: '25',
										effective_date_eda_ext_dt: '2018-04-20',
										signature_date_eda_ext_dt: '2018-04-20',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: 'f6997f3a4e12d7432f16085a4b2f6f7ee453cc0d7f78b4132e4f204ca346bb71',
								_score: 7.801201,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: '26',
										effective_date_eda_ext_dt: '2018-04-20',
										signature_date_eda_ext_dt: '2018-04-20',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: '4e1bc3486a7f4ee5b0dff839a22cfbba35f93ce49b0c8fb7005adbd76d86e23d',
								_score: 7.2845793,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: 'AZ',
										effective_date_eda_ext_dt: '2017-05-04',
										signature_date_eda_ext_dt: '2017-05-05',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: '0d9de8ebd2a067089995f24273bd88966db332cca5c87ad23d9e98096162a74a',
								_score: 7.2845793,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: '15',
										effective_date_eda_ext_dt: '2016-08-22',
										signature_date_eda_ext_dt: '2016-08-22',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: '321be5b3e7eea41c15bc841de69ffcc6e7e2da5815703f30f0fe9ce8deff8b12',
								_score: 7.2845793,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: '19',
										effective_date_eda_ext_dt: '2017-05-09',
										signature_date_eda_ext_dt: '2017-05-09',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: 'f01688f40322786352a0dc231bd4dadd9eab243d930332a11202c995b39a063a',
								_score: 7.2845793,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: '24',
										effective_date_eda_ext_dt: '2018-03-07',
										signature_date_eda_ext_dt: '2018-03-07',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: '088b334d397dc2d63213a90f87197db7de6badfd4b25920090375377286eb29f',
								_score: 7.2845793,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: '20',
										effective_date_eda_ext_dt: '2015-07-08',
									},
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: 'ad26f11583302ac208c3a77d716182e12f7086cd03c98ab9cf09f22c11f91b5f',
								_score: 7.2845793,
								_source: {
									extracted_data_eda_n: {
										modification_number_eda_ext: '22',
										effective_date_eda_ext_dt: '2015-07-08',
									},
								},
							},
						],
					},
				},
				statusCode: 200,
				headers: {
					date: 'Fri, 09 Jul 2021 22:21:07 GMT',
					'content-type': 'application/json; charset=UTF-8',
					'content-length': '4420',
					connection: 'keep-alive',
					'access-control-allow-origin': '*',
				},
				meta: {
					context: null,
					request: {
						params: {
							method: 'POST',
							path: '/gc_eda_2021_apple/_search',
							body: '{"_source":{"includes":["extracted_data_eda_n.modification_number_eda_ext","extracted_data_eda_n.signature_date_eda_ext_dt","extracted_data_eda_n.effective_date_eda_ext_dt"]},"from":0,"size":10000,"track_total_hits":true,"query":{"bool":{"must":[{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.award_id_eda_ext":{"query":"0012"}}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.referenced_idv_eda_ext":{"query":"FA807514D0016"}}}]}}}}]}}}',
							querystring: '',
							headers: {
								'user-agent': 'elasticsearch-js/7.13.0 (linux 4.19.76-linuxkit-x64; Node.js v14.17.0)',
								'x-elastic-client-meta': 'es=7.13.0,js=14.17.0,t=7.13.0,hc=14.17.0',
								'content-type': 'application/json',
								'content-length': '544',
							},
							timeout: 30000,
						},
						options: {},
						id: 1,
					},
					name: 'elasticsearch-js',
					connection: {
						url: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						id: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						headers: {},
						deadCount: 0,
						resurrectTimeout: 0,
						_openRequests: 0,
						status: 'alive',
						roles: { master: true, data: true, ingest: true, ml: false },
					},
					attempts: 0,
					aborted: false,
				},
			};
			const mockSplitAwardID = { id: '0012', idv: 'FA807514D0016' };
			const opts = {
				...constructorOptionsMock,
				edaSearchUtility: {
					getEDAContractQuery() {
						return Promise.resolve(mockQuery);
					},
					splitAwardID(awardID) {
						return mockSplitAwardID;
					},
				},
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(mockResults);
					},
				},
				constants: {
					EDA_ELASTIC_SEARCH_OPTS: {
						index: 'test index',
					},
				},
				esSearchLib: {},
				redisDB: 'redis://localhost',
			};

			const req = {
				permissions: ['View EDA'],
				body: {
					awardID: 'FA807514D0016-0012',
					isSearch: false,
					functionName: 'queryContractMods',
					cloneName: 'eda',
				},
			};
			const target = new EDASearchHandler(opts);
			try {
				const actual = await target.queryContractMods(req, 'test user');
				const expected = [
					{ modNumber: '13', signatureDate: '2016-06-06', effectiveDate: '2016-06-06' },
					{ modNumber: '14', signatureDate: '2016-08-15', effectiveDate: '2016-08-15' },
					{ modNumber: '15', signatureDate: '2016-08-22', effectiveDate: '2016-08-22' },
					{ modNumber: '18', signatureDate: '2017-04-18', effectiveDate: '2017-04-18' },
					{ modNumber: '19', signatureDate: '2017-05-09', effectiveDate: '2017-05-09' },
					{ modNumber: '20', signatureDate: null, effectiveDate: '2015-07-08' },
					{ modNumber: '21', signatureDate: '2017-07-28', effectiveDate: '2017-07-27' },
					{ modNumber: '22', signatureDate: null, effectiveDate: '2015-07-08' },
					{ modNumber: '23', signatureDate: null, effectiveDate: '2015-07-08' },
					{ modNumber: '24', signatureDate: '2018-03-07', effectiveDate: '2018-03-07' },
					{ modNumber: '25', signatureDate: '2018-04-20', effectiveDate: '2018-04-20' },
					{ modNumber: '26', signatureDate: '2018-04-20', effectiveDate: '2018-04-20' },
					{ modNumber: '27', signatureDate: '2018-05-14', effectiveDate: '2018-05-14' },
					{ modNumber: 'AZ', signatureDate: '2017-05-05', effectiveDate: '2017-05-04' },
					{ modNumber: 'Award', signatureDate: '2015-07-08', effectiveDate: '2015-07-08' },
				];
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (err) {
				assert.fail(err);
			}
		});

		it('should return contract mod data from a contract award ID (isSearch is true)', async (done) => {
			const mockQuery = {
				_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'] },
				from: 0,
				size: 10000,
				track_total_hits: true,
				query: {
					bool: {
						must: [
							{
								nested: {
									path: 'extracted_data_eda_n',
									query: {
										bool: {
											must: [
												{
													match: {
														'extracted_data_eda_n.award_id_eda_ext': { query: 'M802' },
													},
												},
											],
										},
									},
								},
							},
							{
								nested: {
									path: 'extracted_data_eda_n',
									query: {
										bool: {
											must: [
												{
													match: {
														'extracted_data_eda_n.referenced_idv_eda_ext': {
															query: 'N0017804D4016',
														},
													},
												},
											],
										},
									},
								},
							},
						],
					},
				},
				stored_fields: [
					'filename',
					'title',
					'page_count',
					'doc_type',
					'doc_num',
					'ref_list',
					'id',
					'summary_30',
					'keyw_5',
					'p_text',
					'type',
					'p_page',
					'display_title_s',
					'display_org_s',
					'display_doc_type_s',
					'metadata_type_eda_ext',
				],
			};
			const mockResults = {
				body: {
					took: 3,
					timed_out: false,
					_shards: { total: 3, successful: 3, skipped: 0, failed: 0 },
					hits: {
						total: { value: 3, relation: 'eq' },
						max_score: 15.127008,
						hits: [
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: 'cb9c8d3f0c5b457c15cbc7712d40b5f389eb8bb267a018a13597a833b33452da',
								_score: 15.127008,
								_source: {
									extracted_data_eda_n: {
										vendor_name_eda_ext: 'BOOZ ALLEN HAMILTON ENGINEERING SERVICES',
										contract_issue_office_name_eda_ext: 'NAVAIR Aircraft Division Pax River',
										dodaac_org_type_eda_ext: 'DEPT OF THE NAVY',
										vendor_duns_eda_ext: '075916762',
										contract_issue_office_dodaac_eda_ext: 'N00421',
										effective_date_eda_ext_dt: '2017-10-05',
										signature_date_eda_ext_dt: '2017-10-05',
										modification_number_eda_ext: '83',
										vendor_cage_eda_ext: '1WAV4',
										award_id_eda_ext: 'M802',
										referenced_idv_eda_ext: 'N0017804D4016',
										vendor_org_hierarchy_eda_n: {
											cage_code_eda_ext_n: [
												{
													cage_code_name_eda_ext:
														'BOOZ ALLEN HAMILTON ENGINEERING SERVICES, LLC',
												},
											],
											vendor_org_eda_ext_n: [
												{
													dodaac_name_eda_ext: 'NAVAIR Aircraft Division Pax River',
													cgac_eda_ext: '017',
													dodaac_eda_ext: 'N00421',
													maj_command_eda_ext: 'N7',
													cgac_agency_name_eda_ext: 'DEPT OF THE NAVY',
													majcom_display_name_eda_ext:
														'Naval Air Systems Command Headquarters',
												},
											],
										},
										header_details_id_eda_ext: '160793fe2c82579162fb1f6a3e6d3624a8c4f4b0',
										total_obligated_amount_eda_ext_f: -30009.75,
										contract_issue_office_majcom_eda_ext: 'Naval Air Systems Command Headquarters',
									},
									pagerank_r: 0.00001,
								},
								fields: {
									metadata_type_eda_ext: ['pds'],
									filename: [
										'EDAPDF-5AD28BCF962951ADE05400215A9BA3BA-N0017804D4016-M802-empty-83-PDS-2017-10-05.pdf',
									],
									doc_num: [
										'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-5AD28BCF962951ADE05400215A9BA3BA-N0017804D4016-M802-empty-83-PDS-2017-10-05.pdf',
									],
									id: [
										'EDAPDF-5AD28BCF962951ADE05400215A9BA3BA-N0017804D4016-M802-empty-83-PDS-2017-10-05.pdf_0',
									],
									doc_type: [
										'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-5AD28BCF962951ADE05400215A9BA3BA-N0017804D4016-M802-empty-83-PDS-2017-10-05.pdf',
									],
									type: ['document'],
									title: ['N0017804D4016-M802-83'],
									page_count: [109],
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: 'e4bb1eb9cee3a266a7467694919dd4cad621a4c1d76074c88a87dead8c5408fd',
								_score: 13.40023,
								_source: {
									extracted_data_eda_n: {
										vendor_name_eda_ext: 'BOOZ ALLEN HAMILTON ENGINEER',
										contract_issue_office_name_eda_ext: 'DCMA BALTIMORE',
										dodaac_org_type_eda_ext: 'DEPARTMENT OF DEFENSE',
										contract_admin_office_dodaac_eda_ext: 'S2101A',
										contract_issue_office_dodaac_eda_ext: 'S2101A',
										effective_date_eda_ext_dt: '2016-08-18',
										contract_admin_agency_name_eda_ext: 'DCMA BALTIMORE',
										signature_date_eda_ext_dt: '2016-08-24',
										modification_number_eda_ext: '1A',
										vendor_cage_eda_ext: '1WAV4',
										award_id_eda_ext: 'M802',
										referenced_idv_eda_ext: 'N0017804D4016',
										vendor_org_hierarchy_eda_n: {
											cage_code_eda_ext_n: [
												{
													cage_code_name_eda_ext:
														'BOOZ ALLEN HAMILTON ENGINEERING SERVICES, LLC',
												},
											],
											vendor_org_eda_ext_n: [
												{
													dodaac_name_eda_ext: 'DCMA BALTIMORE',
													cgac_eda_ext: '097',
													dodaac_eda_ext: 'S2101A',
													maj_command_eda_ext: 'DR',
													cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
													majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
												},
											],
										},
										header_details_id_eda_ext: '6683911e062c3154c2141ea54611ce1d54230655',
										contract_issue_office_majcom_eda_ext: 'Defense Finance Accounting Service',
									},
									pagerank_r: 0.00001,
								},
								fields: {
									metadata_type_eda_ext: ['pds'],
									filename: [
										'EDAPDF-3AD055FFF6874280E05400215A9BA3BA-N0017804D4016-M802-1A-empty-PDS-2016-08-24.pdf',
									],
									doc_num: [
										'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-3AD055FFF6874280E05400215A9BA3BA-N0017804D4016-M802-1A-empty-PDS-2016-08-24.pdf',
									],
									id: [
										'EDAPDF-3AD055FFF6874280E05400215A9BA3BA-N0017804D4016-M802-1A-empty-PDS-2016-08-24.pdf_0',
									],
									doc_type: [
										'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-3AD055FFF6874280E05400215A9BA3BA-N0017804D4016-M802-1A-empty-PDS-2016-08-24.pdf',
									],
									type: ['document'],
									title: ['N0017804D4016-M802-1A'],
									page_count: [3],
								},
							},
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: '7306d300dd8cd0a7204585bb6f1f4c4f50f33877a9be5e263dfde5e85e1836c5',
								_score: 13.40023,
								_source: {
									extracted_data_eda_n: {
										vendor_name_eda_ext: 'BOOZ ALLEN HAMILTON ENGINEER',
										contract_issue_office_name_eda_ext: 'DCMA BALTIMORE',
										dodaac_org_type_eda_ext: 'DEPARTMENT OF DEFENSE',
										contract_admin_office_dodaac_eda_ext: 'S2101A',
										contract_issue_office_dodaac_eda_ext: 'S2101A',
										effective_date_eda_ext_dt: '2017-04-18',
										contract_admin_agency_name_eda_ext: 'DCMA BALTIMORE',
										signature_date_eda_ext_dt: '2017-04-19',
										modification_number_eda_ext: '1B',
										vendor_cage_eda_ext: '1WAV4',
										award_id_eda_ext: 'M802',
										referenced_idv_eda_ext: 'N0017804D4016',
										vendor_org_hierarchy_eda_n: {
											cage_code_eda_ext_n: [
												{
													cage_code_name_eda_ext:
														'BOOZ ALLEN HAMILTON ENGINEERING SERVICES, LLC',
												},
											],
											vendor_org_eda_ext_n: [
												{
													dodaac_name_eda_ext: 'DCMA BALTIMORE',
													cgac_eda_ext: '097',
													dodaac_eda_ext: 'S2101A',
													maj_command_eda_ext: 'DR',
													cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
													majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
												},
											],
										},
										header_details_id_eda_ext: '1c36317aafa49a28e562c0dd33eac200e3ae41ea',
										contract_issue_office_majcom_eda_ext: 'Defense Finance Accounting Service',
									},
									pagerank_r: 0.00001,
								},
								fields: {
									metadata_type_eda_ext: ['pds'],
									filename: [
										'EDAPDF-4D83EBC27F317325E05400215A9BA3BA-N0017804D4016-M802-1B-empty-PDS-2017-04-19.pdf',
									],
									doc_num: [
										'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-4D83EBC27F317325E05400215A9BA3BA-N0017804D4016-M802-1B-empty-PDS-2017-04-19.pdf',
									],
									id: [
										'EDAPDF-4D83EBC27F317325E05400215A9BA3BA-N0017804D4016-M802-1B-empty-PDS-2017-04-19.pdf_0',
									],
									doc_type: [
										'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-4D83EBC27F317325E05400215A9BA3BA-N0017804D4016-M802-1B-empty-PDS-2017-04-19.pdf',
									],
									type: ['document'],
									title: ['N0017804D4016-M802-1B'],
									page_count: [2],
								},
							},
						],
					},
				},
				statusCode: 200,
				headers: {
					date: 'Thu, 08 Jul 2021 23:53:34 GMT',
					'content-type': 'application/json; charset=UTF-8',
					'content-length': '5885',
					connection: 'keep-alive',
					'access-control-allow-origin': '*',
				},
				meta: {
					context: null,
					request: {
						params: {
							method: 'POST',
							path: '/gc_eda_2021_apple/_search',
							body: '{"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"from":0,"size":10000,"track_total_hits":true,"query":{"bool":{"must":[{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.award_id_eda_ext":{"query":"M802"}}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.referenced_idv_eda_ext":{"query":"N0017804D4016"}}}]}}}}]}},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","metadata_type_eda_ext"]}',
							querystring: '',
							headers: {
								'user-agent': 'elasticsearch-js/7.13.0 (linux 4.19.76-linuxkit-x64; Node.js v14.17.0)',
								'x-elastic-client-meta': 'es=7.13.0,js=14.17.0,t=7.13.0,hc=14.17.0',
								'content-type': 'application/json',
								'content-length': '659',
							},
							timeout: 30000,
						},
						options: {},
						id: 1,
					},
					name: 'elasticsearch-js',
					connection: {
						url: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						id: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						headers: {},
						deadCount: 0,
						resurrectTimeout: 0,
						_openRequests: 0,
						status: 'alive',
						roles: { master: true, data: true, ingest: true, ml: false },
					},
					attempts: 0,
					aborted: false,
				},
			};
			const mockSplitAwardID = { id: 'M802', idv: 'N0017804D4016' };
			const mockCleanedUpResults = {
				query: {
					_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'] },
					from: 0,
					size: 10000,
					track_total_hits: true,
					query: {
						bool: {
							must: [
								{
									nested: {
										path: 'extracted_data_eda_n',
										query: {
											bool: {
												must: [
													{
														match: {
															'extracted_data_eda_n.award_id_eda_ext': { query: 'M802' },
														},
													},
												],
											},
										},
									},
								},
								{
									nested: {
										path: 'extracted_data_eda_n',
										query: {
											bool: {
												must: [
													{
														match: {
															'extracted_data_eda_n.referenced_idv_eda_ext': {
																query: 'N0017804D4016',
															},
														},
													},
												],
											},
										},
									},
								},
							],
						},
					},
					stored_fields: [
						'filename',
						'title',
						'page_count',
						'doc_type',
						'doc_num',
						'ref_list',
						'id',
						'summary_30',
						'keyw_5',
						'p_text',
						'type',
						'p_page',
						'display_title_s',
						'display_org_s',
						'display_doc_type_s',
						'metadata_type_eda_ext',
					],
				},
				totalCount: 3,
				docs: [
					{
						metadata_type_eda_ext: 'pds',
						filename:
							'EDAPDF-5AD28BCF962951ADE05400215A9BA3BA-N0017804D4016-M802-empty-83-PDS-2017-10-05.pdf',
						doc_num:
							'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-5AD28BCF962951ADE05400215A9BA3BA-N0017804D4016-M802-empty-83-PDS-2017-10-05.pdf',
						id: 'EDAPDF-5AD28BCF962951ADE05400215A9BA3BA-N0017804D4016-M802-empty-83-PDS-2017-10-05.pdf_0',
						doc_type:
							'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-5AD28BCF962951ADE05400215A9BA3BA-N0017804D4016-M802-empty-83-PDS-2017-10-05.pdf',
						type: 'document',
						title: 'N0017804D4016-M802-83',
						page_count: 109,
						topics_s: [],
						pageHits: [],
						pageHitCount: 0,
						contract_issue_name_eda_ext: 'NAVAIR Aircraft Division Pax River',
						contract_issue_dodaac_eda_ext: 'N00421',
						vendor_name_eda_ext: 'BOOZ ALLEN HAMILTON ENGINEERING SERVICES',
						vendor_duns_eda_ext: '075916762',
						vendor_cage_eda_ext: '1WAV4',
						modification_eda_ext: '83',
						award_id_eda_ext: 'N0017804D4016-M802',
						reference_idv_eda_ext: 'N0017804D4016',
						signature_date_eda_ext: '2017-10-05',
						effective_date_eda_ext: '2017-10-05',
						obligated_amounts_eda_ext: -30009.75,
						issuing_organization_eda_ext: 'DEPT OF THE NAVY',
						contract_issue_majcom_eda_ext: 'Naval Air Systems Command Headquarters',
						esIndex: 'gc_eda_2021_apple',
						keyw_5: '',
						ref_list: [],
					},
					{
						metadata_type_eda_ext: 'pds',
						filename:
							'EDAPDF-3AD055FFF6874280E05400215A9BA3BA-N0017804D4016-M802-1A-empty-PDS-2016-08-24.pdf',
						doc_num:
							'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-3AD055FFF6874280E05400215A9BA3BA-N0017804D4016-M802-1A-empty-PDS-2016-08-24.pdf',
						id: 'EDAPDF-3AD055FFF6874280E05400215A9BA3BA-N0017804D4016-M802-1A-empty-PDS-2016-08-24.pdf_0',
						doc_type:
							'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-3AD055FFF6874280E05400215A9BA3BA-N0017804D4016-M802-1A-empty-PDS-2016-08-24.pdf',
						type: 'document',
						title: 'N0017804D4016-M802-1A',
						page_count: 3,
						topics_s: [],
						pageHits: [],
						pageHitCount: 0,
						contract_issue_name_eda_ext: 'DCMA BALTIMORE',
						contract_issue_dodaac_eda_ext: 'S2101A',
						vendor_name_eda_ext: 'BOOZ ALLEN HAMILTON ENGINEER',
						vendor_cage_eda_ext: '1WAV4',
						modification_eda_ext: '1A',
						award_id_eda_ext: 'N0017804D4016-M802',
						reference_idv_eda_ext: 'N0017804D4016',
						signature_date_eda_ext: '2016-08-24',
						effective_date_eda_ext: '2016-08-18',
						issuing_organization_eda_ext: 'DEPARTMENT OF DEFENSE',
						contract_issue_majcom_eda_ext: 'Defense Finance Accounting Service',
						esIndex: 'gc_eda_2021_apple',
						keyw_5: '',
						ref_list: [],
					},
					{
						metadata_type_eda_ext: 'pds',
						filename:
							'EDAPDF-4D83EBC27F317325E05400215A9BA3BA-N0017804D4016-M802-1B-empty-PDS-2017-04-19.pdf',
						doc_num:
							'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-4D83EBC27F317325E05400215A9BA3BA-N0017804D4016-M802-1B-empty-PDS-2017-04-19.pdf',
						id: 'EDAPDF-4D83EBC27F317325E05400215A9BA3BA-N0017804D4016-M802-1B-empty-PDS-2017-04-19.pdf_0',
						doc_type:
							'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-4D83EBC27F317325E05400215A9BA3BA-N0017804D4016-M802-1B-empty-PDS-2017-04-19.pdf',
						type: 'document',
						title: 'N0017804D4016-M802-1B',
						page_count: 2,
						topics_s: [],
						pageHits: [],
						pageHitCount: 0,
						contract_issue_name_eda_ext: 'DCMA BALTIMORE',
						contract_issue_dodaac_eda_ext: 'S2101A',
						vendor_name_eda_ext: 'BOOZ ALLEN HAMILTON ENGINEER',
						vendor_cage_eda_ext: '1WAV4',
						modification_eda_ext: '1B',
						award_id_eda_ext: 'N0017804D4016-M802',
						reference_idv_eda_ext: 'N0017804D4016',
						signature_date_eda_ext: '2017-04-19',
						effective_date_eda_ext: '2017-04-18',
						issuing_organization_eda_ext: 'DEPARTMENT OF DEFENSE',
						contract_issue_majcom_eda_ext: 'Defense Finance Accounting Service',
						esIndex: 'gc_eda_2021_apple',
						keyw_5: '',
						ref_list: [],
					},
				],
				doc_types: [],
				doc_orgs: [],
				searchTerms: [],
				expansionDict: [],
			};
			const opts = {
				...constructorOptionsMock,
				edaSearchUtility: {
					getEDAContractQuery() {
						return Promise.resolve(mockQuery);
					},
					splitAwardID(awardID) {
						return mockSplitAwardID;
					},
					cleanUpEsResults() {
						return mockCleanedUpResults;
					},
				},
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(mockResults);
					},
				},
				constants: {
					EDA_ELASTIC_SEARCH_OPTS: {
						index: 'test index',
					},
				},
				esSearchLib: {},
				redisDB: 'redis://localhost',
			};

			const req = {
				permissions: ['View EDA'],
				body: {
					awardID: 'N0017804D4016-M802',
					isSearch: true,
					functionName: 'queryContractMods',
					cloneName: 'eda',
				},
			};

			const target = new EDASearchHandler(opts);
			try {
				const actual = await target.queryContractMods(req, 'test user');
				const expected = {
					query: {
						_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'] },
						from: 0,
						size: 10000,
						track_total_hits: true,
						query: {
							bool: {
								must: [
									{
										nested: {
											path: 'extracted_data_eda_n',
											query: {
												bool: {
													must: [
														{
															match: {
																'extracted_data_eda_n.award_id_eda_ext': {
																	query: 'M802',
																},
															},
														},
													],
												},
											},
										},
									},
									{
										nested: {
											path: 'extracted_data_eda_n',
											query: {
												bool: {
													must: [
														{
															match: {
																'extracted_data_eda_n.referenced_idv_eda_ext': {
																	query: 'N0017804D4016',
																},
															},
														},
													],
												},
											},
										},
									},
								],
							},
						},
						stored_fields: [
							'filename',
							'title',
							'page_count',
							'doc_type',
							'doc_num',
							'ref_list',
							'id',
							'summary_30',
							'keyw_5',
							'p_text',
							'type',
							'p_page',
							'display_title_s',
							'display_org_s',
							'display_doc_type_s',
							'metadata_type_eda_ext',
						],
					},
					totalCount: 3,
					docs: [
						{
							metadata_type_eda_ext: 'pds',
							filename:
								'EDAPDF-5AD28BCF962951ADE05400215A9BA3BA-N0017804D4016-M802-empty-83-PDS-2017-10-05.pdf',
							doc_num:
								'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-5AD28BCF962951ADE05400215A9BA3BA-N0017804D4016-M802-empty-83-PDS-2017-10-05.pdf',
							id: 'EDAPDF-5AD28BCF962951ADE05400215A9BA3BA-N0017804D4016-M802-empty-83-PDS-2017-10-05.pdf_0',
							doc_type:
								'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-5AD28BCF962951ADE05400215A9BA3BA-N0017804D4016-M802-empty-83-PDS-2017-10-05.pdf',
							type: 'document',
							title: 'N0017804D4016-M802-83',
							page_count: 109,
							topics_s: [],
							pageHits: [],
							pageHitCount: 0,
							contract_issue_name_eda_ext: 'NAVAIR Aircraft Division Pax River',
							contract_issue_dodaac_eda_ext: 'N00421',
							vendor_name_eda_ext: 'BOOZ ALLEN HAMILTON ENGINEERING SERVICES',
							vendor_duns_eda_ext: '075916762',
							vendor_cage_eda_ext: '1WAV4',
							modification_eda_ext: '83',
							award_id_eda_ext: 'N0017804D4016-M802',
							reference_idv_eda_ext: 'N0017804D4016',
							signature_date_eda_ext: '2017-10-05',
							effective_date_eda_ext: '2017-10-05',
							obligated_amounts_eda_ext: -30009.75,
							issuing_organization_eda_ext: 'DEPT OF THE NAVY',
							contract_issue_majcom_eda_ext: 'Naval Air Systems Command Headquarters',
							esIndex: 'gc_eda_2021_apple',
							keyw_5: '',
							ref_list: [],
						},
						{
							metadata_type_eda_ext: 'pds',
							filename:
								'EDAPDF-3AD055FFF6874280E05400215A9BA3BA-N0017804D4016-M802-1A-empty-PDS-2016-08-24.pdf',
							doc_num:
								'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-3AD055FFF6874280E05400215A9BA3BA-N0017804D4016-M802-1A-empty-PDS-2016-08-24.pdf',
							id: 'EDAPDF-3AD055FFF6874280E05400215A9BA3BA-N0017804D4016-M802-1A-empty-PDS-2016-08-24.pdf_0',
							doc_type:
								'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-3AD055FFF6874280E05400215A9BA3BA-N0017804D4016-M802-1A-empty-PDS-2016-08-24.pdf',
							type: 'document',
							title: 'N0017804D4016-M802-1A',
							page_count: 3,
							topics_s: [],
							pageHits: [],
							pageHitCount: 0,
							contract_issue_name_eda_ext: 'DCMA BALTIMORE',
							contract_issue_dodaac_eda_ext: 'S2101A',
							vendor_name_eda_ext: 'BOOZ ALLEN HAMILTON ENGINEER',
							vendor_cage_eda_ext: '1WAV4',
							modification_eda_ext: '1A',
							award_id_eda_ext: 'N0017804D4016-M802',
							reference_idv_eda_ext: 'N0017804D4016',
							signature_date_eda_ext: '2016-08-24',
							effective_date_eda_ext: '2016-08-18',
							issuing_organization_eda_ext: 'DEPARTMENT OF DEFENSE',
							contract_issue_majcom_eda_ext: 'Defense Finance Accounting Service',
							esIndex: 'gc_eda_2021_apple',
							keyw_5: '',
							ref_list: [],
						},
						{
							metadata_type_eda_ext: 'pds',
							filename:
								'EDAPDF-4D83EBC27F317325E05400215A9BA3BA-N0017804D4016-M802-1B-empty-PDS-2017-04-19.pdf',
							doc_num:
								'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-4D83EBC27F317325E05400215A9BA3BA-N0017804D4016-M802-1B-empty-PDS-2017-04-19.pdf',
							id: 'EDAPDF-4D83EBC27F317325E05400215A9BA3BA-N0017804D4016-M802-1B-empty-PDS-2017-04-19.pdf_0',
							doc_type:
								'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-4D83EBC27F317325E05400215A9BA3BA-N0017804D4016-M802-1B-empty-PDS-2017-04-19.pdf',
							type: 'document',
							title: 'N0017804D4016-M802-1B',
							page_count: 2,
							topics_s: [],
							pageHits: [],
							pageHitCount: 0,
							contract_issue_name_eda_ext: 'DCMA BALTIMORE',
							contract_issue_dodaac_eda_ext: 'S2101A',
							vendor_name_eda_ext: 'BOOZ ALLEN HAMILTON ENGINEER',
							vendor_cage_eda_ext: '1WAV4',
							modification_eda_ext: '1B',
							award_id_eda_ext: 'N0017804D4016-M802',
							reference_idv_eda_ext: 'N0017804D4016',
							signature_date_eda_ext: '2017-04-19',
							effective_date_eda_ext: '2017-04-18',
							issuing_organization_eda_ext: 'DEPARTMENT OF DEFENSE',
							contract_issue_majcom_eda_ext: 'Defense Finance Accounting Service',
							esIndex: 'gc_eda_2021_apple',
							keyw_5: '',
							ref_list: [],
						},
					],
					doc_types: [],
					doc_orgs: [],
					searchTerms: [],
					expansionDict: [],
				};
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (err) {
				assert.fail(err);
			}
		});

		it('should return ES error', async (done) => {
			const mockQuery = {
				_source: { includes: ['extracted_data_eda_n.modification_number_eda_ext'] },
				from: 0,
				size: 10000,
				track_total_hits: true,
				query: {
					bool: {
						must: [
							{
								nested: {
									path: 'extracted_data_eda_n',
									query: {
										bool: {
											must: [
												{ match: { 'extracted_data_eda_n.award_id_eda_ext': { query: '1' } } },
											],
										},
									},
								},
							},
							{
								nested: {
									path: 'extracted_data_eda_n',
									query: {
										bool: {
											must: [
												{
													match: {
														'extracted_data_eda_n.referenced_idv_eda_ext': { query: '2' },
													},
												},
											],
										},
									},
								},
							},
						],
					},
				},
			};
			const opts = {
				...constructorOptionsMock,
				edaSearchUtility: {
					getEDAContractQuery() {
						return Promise.resolve(mockQuery);
					},
					splitAwardID() {
						return {};
					},
				},
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve({});
					},
				},
				constants: {
					EDA_ELASTIC_SEARCH_OPTS: {
						index: 'test index',
					},
				},
				esSearchLib: {},
				redisDB: 'redis://localhost',
			};

			const req = {
				permissions: ['View EDA'],
				body: {
					awardID: '1-2',
				},
			};
			const target = new EDASearchHandler(opts);
			try {
				const actual = await target.queryContractMods(req, 'test user');
				assert.deepStrictEqual(actual, []);
				done();
			} catch (err) {
				assert.fail(err);
			}
		});
	});

	describe('queryBaseAwardContract', function () {
		it('should return data for a base award contract using awardID', async (done) => {
			//'navy', second result
			const mockQuery = {
				_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'] },
				from: 0,
				size: 10000,
				track_total_hits: true,
				query: {
					bool: {
						must: [
							{
								nested: {
									path: 'extracted_data_eda_n',
									query: {
										bool: {
											must: [
												{
													match: {
														'extracted_data_eda_n.award_id_eda_ext': { query: '1023' },
													},
												},
											],
										},
									},
								},
							},
							{
								nested: {
									path: 'extracted_data_eda_n',
									query: {
										bool: {
											must: [
												{
													match: {
														'extracted_data_eda_n.referenced_idv_eda_ext': {
															query: 'N0018907DZ050',
														},
													},
												},
											],
										},
									},
								},
							},
							{ match: { mod_identifier_eda_ext: 'base_award' } },
						],
					},
				},
				stored_fields: [
					'filename',
					'title',
					'page_count',
					'doc_type',
					'doc_num',
					'ref_list',
					'id',
					'summary_30',
					'keyw_5',
					'p_text',
					'type',
					'p_page',
					'display_title_s',
					'display_org_s',
					'display_doc_type_s',
					'metadata_type_eda_ext',
				],
			};
			const mockResults = {
				body: {
					took: 3,
					timed_out: false,
					_shards: { total: 3, successful: 3, skipped: 0, failed: 0 },
					hits: {
						total: { value: 1, relation: 'eq' },
						max_score: 12.188597,
						hits: [
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: 'd388b5959c77f026c592add9c23d4f3f0a2dcb3ae607df7ee3eadbfa3a11e248',
								_score: 12.188597,
								_source: {
									extracted_data_eda_n: {
										contract_payment_office_dodaac_eda_ext: 'HQ0338',
										vendor_name_eda_ext: 'BOOZ ALLEN & HAMILTON, INC.',
										contract_issue_office_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
										dodaac_org_type_eda_ext: 'DEPT OF THE NAVY',
										vendor_duns_eda_ext: '006928857',
										contract_admin_office_dodaac_eda_ext: 'S2404A',
										contract_issue_office_dodaac_eda_ext: 'N00189',
										effective_date_eda_ext_dt: '2013-01-01',
										contract_admin_agency_name_eda_ext: 'DCMA VIRGINIA',
										modification_number_eda_ext: 'Award',
										vendor_cage_eda_ext: '17038',
										award_id_eda_ext: '1023',
										referenced_idv_eda_ext: 'N0018907DZ050',
										vendor_org_hierarchy_eda_n: {
											cage_code_eda_ext_n: [
												{ cage_code_name_eda_ext: 'BOOZ ALLEN HAMILTON INC.' },
											],
											vendor_org_eda_ext_n: [
												{
													dodaac_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
													cgac_eda_ext: '017',
													dodaac_eda_ext: 'N00189',
													maj_command_eda_ext: 'N9',
													cgac_agency_name_eda_ext: 'DEPT OF THE NAVY',
													majcom_display_name_eda_ext:
														'Naval Supply Systems Command Headquarters',
												},
												{
													dodaac_name_eda_ext: 'DCMA VIRGINIA',
													cgac_eda_ext: '097',
													dodaac_eda_ext: 'S2404A',
													maj_command_eda_ext: 'DR',
													cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
													majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
												},
												{
													dodaac_name_eda_ext: 'DFAS - COLUMBUS CENTER',
													cgac_eda_ext: '097',
													dodaac_eda_ext: 'HQ0338',
													maj_command_eda_ext: 'DT',
													cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
													majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
												},
											],
										},
										total_obligated_amount_eda_ext_f: 213575.01,
										contract_issue_office_majcom_eda_ext:
											'Naval Supply Systems Command Headquarters',
										contract_payment_office_name_eda_ext: 'DFAS - COLUMBUS CENTER',
									},
									pagerank_r: 0.00001,
								},
								fields: {
									metadata_type_eda_ext: ['syn'],
									filename: [
										'EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
									],
									doc_num: [
										'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
									],
									id: [
										'EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf_0',
									],
									doc_type: [
										'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
									],
									type: ['document'],
									title: ['N0018907DZ050-1023-empty'],
									page_count: [24],
								},
							},
						],
					},
				},
				statusCode: 200,
				headers: {
					date: 'Tue, 10 Aug 2021 00:21:26 GMT',
					'content-type': 'application/json; charset=UTF-8',
					'content-length': '2658',
					connection: 'keep-alive',
					'access-control-allow-origin': '*',
				},
				meta: {
					context: null,
					request: {
						params: {
							method: 'POST',
							path: '/gc_eda_2021_apple/_search',
							body: '{"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"from":0,"size":10000,"track_total_hits":true,"query":{"bool":{"must":[{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.award_id_eda_ext":{"query":"1023"}}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.referenced_idv_eda_ext":{"query":"N0018907DZ050"}}}]}}}},{"match":{"mod_identifier_eda_ext":"base_award"}}]}},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","metadata_type_eda_ext"]}',
							querystring: '',
							headers: {
								'user-agent': 'elasticsearch-js/7.13.0 (linux 5.10.25-linuxkit-x64; Node.js v14.17.0)',
								'x-elastic-client-meta': 'es=7.13.0,js=14.17.0,t=7.13.0,hc=14.17.0',
								'content-type': 'application/json',
								'content-length': '709',
							},
							timeout: 30000,
						},
						options: {},
						id: 1,
					},
					name: 'elasticsearch-js',
					connection: {
						url: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						id: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						headers: {},
						deadCount: 0,
						resurrectTimeout: 0,
						_openRequests: 0,
						status: 'alive',
						roles: { master: true, data: true, ingest: true, ml: false },
					},
					attempts: 0,
					aborted: false,
				},
			};
			const mockSplitAwardID = { id: '1023', idv: 'N0018907DZ050' };
			const mockMetadata = {
				_index: 'gc_eda_2021_apple',
				_type: '_doc',
				_id: 'd388b5959c77f026c592add9c23d4f3f0a2dcb3ae607df7ee3eadbfa3a11e248',
				_score: 12.188597,
				_source: {
					extracted_data_eda_n: {
						contract_payment_office_dodaac_eda_ext: 'HQ0338',
						vendor_name_eda_ext: 'BOOZ ALLEN & HAMILTON, INC.',
						contract_issue_office_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
						dodaac_org_type_eda_ext: 'DEPT OF THE NAVY',
						vendor_duns_eda_ext: '006928857',
						contract_admin_office_dodaac_eda_ext: 'S2404A',
						contract_issue_office_dodaac_eda_ext: 'N00189',
						effective_date_eda_ext_dt: '2013-01-01',
						contract_admin_agency_name_eda_ext: 'DCMA VIRGINIA',
						modification_number_eda_ext: 'Award',
						vendor_cage_eda_ext: '17038',
						award_id_eda_ext: '1023',
						referenced_idv_eda_ext: 'N0018907DZ050',
						vendor_org_hierarchy_eda_n: {
							cage_code_eda_ext_n: [{ cage_code_name_eda_ext: 'BOOZ ALLEN HAMILTON INC.' }],
							vendor_org_eda_ext_n: [
								{
									dodaac_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
									cgac_eda_ext: '017',
									dodaac_eda_ext: 'N00189',
									maj_command_eda_ext: 'N9',
									cgac_agency_name_eda_ext: 'DEPT OF THE NAVY',
									majcom_display_name_eda_ext: 'Naval Supply Systems Command Headquarters',
								},
								{
									dodaac_name_eda_ext: 'DCMA VIRGINIA',
									cgac_eda_ext: '097',
									dodaac_eda_ext: 'S2404A',
									maj_command_eda_ext: 'DR',
									cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
									majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
								},
								{
									dodaac_name_eda_ext: 'DFAS - COLUMBUS CENTER',
									cgac_eda_ext: '097',
									dodaac_eda_ext: 'HQ0338',
									maj_command_eda_ext: 'DT',
									cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
									majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
								},
							],
						},
						total_obligated_amount_eda_ext_f: 213575.01,
						contract_issue_office_majcom_eda_ext: 'Naval Supply Systems Command Headquarters',
						contract_payment_office_name_eda_ext: 'DFAS - COLUMBUS CENTER',
					},
					pagerank_r: 0.00001,
				},
				fields: {
					metadata_type_eda_ext: ['syn'],
					filename: [
						'EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
					],
					doc_num: [
						'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
					],
					id: ['EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf_0'],
					doc_type: [
						'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
					],
					type: ['document'],
					title: ['N0018907DZ050-1023-empty'],
					page_count: [24],
				},
				contract_issue_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
				contract_issue_dodaac_eda_ext: 'N00189',
				vendor_name_eda_ext: 'BOOZ ALLEN & HAMILTON, INC.',
				vendor_duns_eda_ext: '006928857',
				vendor_cage_eda_ext: '17038',
				contract_admin_name_eda_ext: 'DCMA VIRGINIA',
				contract_admin_office_dodaac_eda_ext: 'S2404A',
				paying_office_name_eda_ext: 'DFAS - COLUMBUS CENTER',
				paying_office_dodaac_eda_ext: 'HQ0338',
				modification_eda_ext: 'Award',
				award_id_eda_ext: 'N0018907DZ050-1023',
				reference_idv_eda_ext: 'N0018907DZ050',
				effective_date_eda_ext: '2013-01-01',
				obligated_amounts_eda_ext: 213575.01,
				issuing_organization_eda_ext: 'DEPT OF THE NAVY',
				contract_issue_majcom_eda_ext: 'Naval Supply Systems Command Headquarters',
				paying_office_majcom_eda_ext: 'Defense Finance Accounting Service',
			};

			const opts = {
				...constructorOptionsMock,
				edaSearchUtility: {
					getEDAContractQuery() {
						return Promise.resolve(mockQuery);
					},
					splitAwardID() {
						return mockSplitAwardID;
					},
					getExtractedFields() {
						return mockMetadata;
					},
				},
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(mockResults);
					},
				},
				constants: {
					EDA_ELASTIC_SEARCH_OPTS: {
						index: 'test index',
					},
				},
				esSearchLib: {},
				redisDB: 'redis://localhost',
			};

			const req = {
				permissions: ['View EDA'],
				body: {
					awardID: 'N0018907DZ050-1023',
					isSearch: false,
					functionName: 'queryBaseAwardContract',
					cloneName: 'eda',
				},
			};
			const target = new EDASearchHandler(opts);
			try {
				const actual = await target.queryBaseAwardContract(req, 'test user');
				const expected = {
					extracted_data_eda_n: {
						contract_payment_office_dodaac_eda_ext: 'HQ0338',
						vendor_name_eda_ext: 'BOOZ ALLEN & HAMILTON, INC.',
						contract_issue_office_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
						dodaac_org_type_eda_ext: 'DEPT OF THE NAVY',
						vendor_duns_eda_ext: '006928857',
						contract_admin_office_dodaac_eda_ext: 'S2404A',
						contract_issue_office_dodaac_eda_ext: 'N00189',
						effective_date_eda_ext_dt: '2013-01-01',
						contract_admin_agency_name_eda_ext: 'DCMA VIRGINIA',
						modification_number_eda_ext: 'Award',
						vendor_cage_eda_ext: '17038',
						award_id_eda_ext: '1023',
						referenced_idv_eda_ext: 'N0018907DZ050',
						vendor_org_hierarchy_eda_n: {
							cage_code_eda_ext_n: [{ cage_code_name_eda_ext: 'BOOZ ALLEN HAMILTON INC.' }],
							vendor_org_eda_ext_n: [
								{
									dodaac_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
									cgac_eda_ext: '017',
									dodaac_eda_ext: 'N00189',
									maj_command_eda_ext: 'N9',
									cgac_agency_name_eda_ext: 'DEPT OF THE NAVY',
									majcom_display_name_eda_ext: 'Naval Supply Systems Command Headquarters',
								},
								{
									dodaac_name_eda_ext: 'DCMA VIRGINIA',
									cgac_eda_ext: '097',
									dodaac_eda_ext: 'S2404A',
									maj_command_eda_ext: 'DR',
									cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
									majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
								},
								{
									dodaac_name_eda_ext: 'DFAS - COLUMBUS CENTER',
									cgac_eda_ext: '097',
									dodaac_eda_ext: 'HQ0338',
									maj_command_eda_ext: 'DT',
									cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
									majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
								},
							],
						},
						total_obligated_amount_eda_ext_f: 213575.01,
						contract_issue_office_majcom_eda_ext: 'Naval Supply Systems Command Headquarters',
						contract_payment_office_name_eda_ext: 'DFAS - COLUMBUS CENTER',
					},
					pagerank_r: 0.00001,
					metadata_type_eda_ext: ['syn'],
					filename: [
						'EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
					],
					doc_num: [
						'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
					],
					id: ['EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf_0'],
					doc_type: [
						'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
					],
					type: ['document'],
					title: ['N0018907DZ050-1023-empty'],
					page_count: [24],
					_index: 'gc_eda_2021_apple',
					_type: '_doc',
					_id: 'd388b5959c77f026c592add9c23d4f3f0a2dcb3ae607df7ee3eadbfa3a11e248',
					_score: 12.188597,
					_source: {
						extracted_data_eda_n: {
							contract_payment_office_dodaac_eda_ext: 'HQ0338',
							vendor_name_eda_ext: 'BOOZ ALLEN & HAMILTON, INC.',
							contract_issue_office_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
							dodaac_org_type_eda_ext: 'DEPT OF THE NAVY',
							vendor_duns_eda_ext: '006928857',
							contract_admin_office_dodaac_eda_ext: 'S2404A',
							contract_issue_office_dodaac_eda_ext: 'N00189',
							effective_date_eda_ext_dt: '2013-01-01',
							contract_admin_agency_name_eda_ext: 'DCMA VIRGINIA',
							modification_number_eda_ext: 'Award',
							vendor_cage_eda_ext: '17038',
							award_id_eda_ext: '1023',
							referenced_idv_eda_ext: 'N0018907DZ050',
							vendor_org_hierarchy_eda_n: {
								cage_code_eda_ext_n: [{ cage_code_name_eda_ext: 'BOOZ ALLEN HAMILTON INC.' }],
								vendor_org_eda_ext_n: [
									{
										dodaac_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
										cgac_eda_ext: '017',
										dodaac_eda_ext: 'N00189',
										maj_command_eda_ext: 'N9',
										cgac_agency_name_eda_ext: 'DEPT OF THE NAVY',
										majcom_display_name_eda_ext: 'Naval Supply Systems Command Headquarters',
									},
									{
										dodaac_name_eda_ext: 'DCMA VIRGINIA',
										cgac_eda_ext: '097',
										dodaac_eda_ext: 'S2404A',
										maj_command_eda_ext: 'DR',
										cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
										majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
									},
									{
										dodaac_name_eda_ext: 'DFAS - COLUMBUS CENTER',
										cgac_eda_ext: '097',
										dodaac_eda_ext: 'HQ0338',
										maj_command_eda_ext: 'DT',
										cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
										majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
									},
								],
							},
							total_obligated_amount_eda_ext_f: 213575.01,
							contract_issue_office_majcom_eda_ext: 'Naval Supply Systems Command Headquarters',
							contract_payment_office_name_eda_ext: 'DFAS - COLUMBUS CENTER',
						},
						pagerank_r: 0.00001,
					},
					fields: {
						metadata_type_eda_ext: ['syn'],
						filename: [
							'EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
						],
						doc_num: [
							'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
						],
						id: [
							'EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf_0',
						],
						doc_type: [
							'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
						],
						type: ['document'],
						title: ['N0018907DZ050-1023-empty'],
						page_count: [24],
					},
					contract_issue_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
					contract_issue_dodaac_eda_ext: 'N00189',
					vendor_name_eda_ext: 'BOOZ ALLEN & HAMILTON, INC.',
					vendor_duns_eda_ext: '006928857',
					vendor_cage_eda_ext: '17038',
					contract_admin_name_eda_ext: 'DCMA VIRGINIA',
					contract_admin_office_dodaac_eda_ext: 'S2404A',
					paying_office_name_eda_ext: 'DFAS - COLUMBUS CENTER',
					paying_office_dodaac_eda_ext: 'HQ0338',
					modification_eda_ext: 'Award',
					award_id_eda_ext: 'N0018907DZ050-1023',
					reference_idv_eda_ext: 'N0018907DZ050',
					effective_date_eda_ext: '2013-01-01',
					obligated_amounts_eda_ext: 213575.01,
					issuing_organization_eda_ext: 'DEPT OF THE NAVY',
					contract_issue_majcom_eda_ext: 'Naval Supply Systems Command Headquarters',
					paying_office_majcom_eda_ext: 'Defense Finance Accounting Service',
				};

				assert.deepStrictEqual(actual, expected);
				done();
			} catch (err) {
				assert.fail(err);
			}
		});
	});

	describe('callFunctionHelper', function () {
		it('should call the correct function (queryBaseAwardContract)', async (done) => {
			const mockQuery = {
				_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'] },
				from: 0,
				size: 10000,
				track_total_hits: true,
				query: {
					bool: {
						must: [
							{
								nested: {
									path: 'extracted_data_eda_n',
									query: {
										bool: {
											must: [
												{
													match: {
														'extracted_data_eda_n.award_id_eda_ext': { query: '1023' },
													},
												},
											],
										},
									},
								},
							},
							{
								nested: {
									path: 'extracted_data_eda_n',
									query: {
										bool: {
											must: [
												{
													match: {
														'extracted_data_eda_n.referenced_idv_eda_ext': {
															query: 'N0018907DZ050',
														},
													},
												},
											],
										},
									},
								},
							},
							{ match: { mod_identifier_eda_ext: 'base_award' } },
						],
					},
				},
				stored_fields: [
					'filename',
					'title',
					'page_count',
					'doc_type',
					'doc_num',
					'ref_list',
					'id',
					'summary_30',
					'keyw_5',
					'p_text',
					'type',
					'p_page',
					'display_title_s',
					'display_org_s',
					'display_doc_type_s',
					'metadata_type_eda_ext',
				],
			};
			const mockResults = {
				body: {
					took: 3,
					timed_out: false,
					_shards: { total: 3, successful: 3, skipped: 0, failed: 0 },
					hits: {
						total: { value: 1, relation: 'eq' },
						max_score: 12.188597,
						hits: [
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: 'd388b5959c77f026c592add9c23d4f3f0a2dcb3ae607df7ee3eadbfa3a11e248',
								_score: 12.188597,
								_source: {
									extracted_data_eda_n: {
										contract_payment_office_dodaac_eda_ext: 'HQ0338',
										vendor_name_eda_ext: 'BOOZ ALLEN & HAMILTON, INC.',
										contract_issue_office_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
										dodaac_org_type_eda_ext: 'DEPT OF THE NAVY',
										vendor_duns_eda_ext: '006928857',
										contract_admin_office_dodaac_eda_ext: 'S2404A',
										contract_issue_office_dodaac_eda_ext: 'N00189',
										effective_date_eda_ext_dt: '2013-01-01',
										contract_admin_agency_name_eda_ext: 'DCMA VIRGINIA',
										modification_number_eda_ext: 'Award',
										vendor_cage_eda_ext: '17038',
										award_id_eda_ext: '1023',
										referenced_idv_eda_ext: 'N0018907DZ050',
										vendor_org_hierarchy_eda_n: {
											cage_code_eda_ext_n: [
												{ cage_code_name_eda_ext: 'BOOZ ALLEN HAMILTON INC.' },
											],
											vendor_org_eda_ext_n: [
												{
													dodaac_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
													cgac_eda_ext: '017',
													dodaac_eda_ext: 'N00189',
													maj_command_eda_ext: 'N9',
													cgac_agency_name_eda_ext: 'DEPT OF THE NAVY',
													majcom_display_name_eda_ext:
														'Naval Supply Systems Command Headquarters',
												},
												{
													dodaac_name_eda_ext: 'DCMA VIRGINIA',
													cgac_eda_ext: '097',
													dodaac_eda_ext: 'S2404A',
													maj_command_eda_ext: 'DR',
													cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
													majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
												},
												{
													dodaac_name_eda_ext: 'DFAS - COLUMBUS CENTER',
													cgac_eda_ext: '097',
													dodaac_eda_ext: 'HQ0338',
													maj_command_eda_ext: 'DT',
													cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
													majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
												},
											],
										},
										total_obligated_amount_eda_ext_f: 213575.01,
										contract_issue_office_majcom_eda_ext:
											'Naval Supply Systems Command Headquarters',
										contract_payment_office_name_eda_ext: 'DFAS - COLUMBUS CENTER',
									},
									pagerank_r: 0.00001,
								},
								fields: {
									metadata_type_eda_ext: ['syn'],
									filename: [
										'EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
									],
									doc_num: [
										'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
									],
									id: [
										'EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf_0',
									],
									doc_type: [
										'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
									],
									type: ['document'],
									title: ['N0018907DZ050-1023-empty'],
									page_count: [24],
								},
							},
						],
					},
				},
				statusCode: 200,
				headers: {
					date: 'Tue, 10 Aug 2021 00:21:26 GMT',
					'content-type': 'application/json; charset=UTF-8',
					'content-length': '2658',
					connection: 'keep-alive',
					'access-control-allow-origin': '*',
				},
				meta: {
					context: null,
					request: {
						params: {
							method: 'POST',
							path: '/gc_eda_2021_apple/_search',
							body: '{"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"from":0,"size":10000,"track_total_hits":true,"query":{"bool":{"must":[{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.award_id_eda_ext":{"query":"1023"}}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.referenced_idv_eda_ext":{"query":"N0018907DZ050"}}}]}}}},{"match":{"mod_identifier_eda_ext":"base_award"}}]}},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","metadata_type_eda_ext"]}',
							querystring: '',
							headers: {
								'user-agent': 'elasticsearch-js/7.13.0 (linux 5.10.25-linuxkit-x64; Node.js v14.17.0)',
								'x-elastic-client-meta': 'es=7.13.0,js=14.17.0,t=7.13.0,hc=14.17.0',
								'content-type': 'application/json',
								'content-length': '709',
							},
							timeout: 30000,
						},
						options: {},
						id: 1,
					},
					name: 'elasticsearch-js',
					connection: {
						url: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						id: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						headers: {},
						deadCount: 0,
						resurrectTimeout: 0,
						_openRequests: 0,
						status: 'alive',
						roles: { master: true, data: true, ingest: true, ml: false },
					},
					attempts: 0,
					aborted: false,
				},
			};
			const mockSplitAwardID = { id: '1023', idv: 'N0018907DZ050' };
			const mockMetadata = {
				_index: 'gc_eda_2021_apple',
				_type: '_doc',
				_id: 'd388b5959c77f026c592add9c23d4f3f0a2dcb3ae607df7ee3eadbfa3a11e248',
				_score: 12.188597,
				_source: {
					extracted_data_eda_n: {
						contract_payment_office_dodaac_eda_ext: 'HQ0338',
						vendor_name_eda_ext: 'BOOZ ALLEN & HAMILTON, INC.',
						contract_issue_office_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
						dodaac_org_type_eda_ext: 'DEPT OF THE NAVY',
						vendor_duns_eda_ext: '006928857',
						contract_admin_office_dodaac_eda_ext: 'S2404A',
						contract_issue_office_dodaac_eda_ext: 'N00189',
						effective_date_eda_ext_dt: '2013-01-01',
						contract_admin_agency_name_eda_ext: 'DCMA VIRGINIA',
						modification_number_eda_ext: 'Award',
						vendor_cage_eda_ext: '17038',
						award_id_eda_ext: '1023',
						referenced_idv_eda_ext: 'N0018907DZ050',
						vendor_org_hierarchy_eda_n: {
							cage_code_eda_ext_n: [{ cage_code_name_eda_ext: 'BOOZ ALLEN HAMILTON INC.' }],
							vendor_org_eda_ext_n: [
								{
									dodaac_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
									cgac_eda_ext: '017',
									dodaac_eda_ext: 'N00189',
									maj_command_eda_ext: 'N9',
									cgac_agency_name_eda_ext: 'DEPT OF THE NAVY',
									majcom_display_name_eda_ext: 'Naval Supply Systems Command Headquarters',
								},
								{
									dodaac_name_eda_ext: 'DCMA VIRGINIA',
									cgac_eda_ext: '097',
									dodaac_eda_ext: 'S2404A',
									maj_command_eda_ext: 'DR',
									cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
									majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
								},
								{
									dodaac_name_eda_ext: 'DFAS - COLUMBUS CENTER',
									cgac_eda_ext: '097',
									dodaac_eda_ext: 'HQ0338',
									maj_command_eda_ext: 'DT',
									cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
									majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
								},
							],
						},
						total_obligated_amount_eda_ext_f: 213575.01,
						contract_issue_office_majcom_eda_ext: 'Naval Supply Systems Command Headquarters',
						contract_payment_office_name_eda_ext: 'DFAS - COLUMBUS CENTER',
					},
					pagerank_r: 0.00001,
				},
				fields: {
					metadata_type_eda_ext: ['syn'],
					filename: [
						'EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
					],
					doc_num: [
						'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
					],
					id: ['EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf_0'],
					doc_type: [
						'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
					],
					type: ['document'],
					title: ['N0018907DZ050-1023-empty'],
					page_count: [24],
				},
				contract_issue_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
				contract_issue_dodaac_eda_ext: 'N00189',
				vendor_name_eda_ext: 'BOOZ ALLEN & HAMILTON, INC.',
				vendor_duns_eda_ext: '006928857',
				vendor_cage_eda_ext: '17038',
				contract_admin_name_eda_ext: 'DCMA VIRGINIA',
				contract_admin_office_dodaac_eda_ext: 'S2404A',
				paying_office_name_eda_ext: 'DFAS - COLUMBUS CENTER',
				paying_office_dodaac_eda_ext: 'HQ0338',
				modification_eda_ext: 'Award',
				award_id_eda_ext: 'N0018907DZ050-1023',
				reference_idv_eda_ext: 'N0018907DZ050',
				effective_date_eda_ext: '2013-01-01',
				obligated_amounts_eda_ext: 213575.01,
				issuing_organization_eda_ext: 'DEPT OF THE NAVY',
				contract_issue_majcom_eda_ext: 'Naval Supply Systems Command Headquarters',
				paying_office_majcom_eda_ext: 'Defense Finance Accounting Service',
			};

			const req = {
				body: {
					functionName: 'queryBaseAwardContract',
				},
				permissions: ['View EDA'],
			};

			const opts = {
				...constructorOptionsMock,
				edaSearchUtility: {
					getEDAContractQuery() {
						return Promise.resolve(mockQuery);
					},
					splitAwardID() {
						return mockSplitAwardID;
					},
					getExtractedFields() {
						return mockMetadata;
					},
				},
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(mockResults);
					},
				},
				constants: {
					EDA_ELASTIC_SEARCH_OPTS: {
						index: 'test index',
					},
				},
				esSearchLib: {},
				redisDB: 'redis://localhost',
			};

			const target = new EDASearchHandler(opts);
			try {
				const actual = await target.callFunctionHelper(req, 'test user');
				const expected = {
					extracted_data_eda_n: {
						contract_payment_office_dodaac_eda_ext: 'HQ0338',
						vendor_name_eda_ext: 'BOOZ ALLEN & HAMILTON, INC.',
						contract_issue_office_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
						dodaac_org_type_eda_ext: 'DEPT OF THE NAVY',
						vendor_duns_eda_ext: '006928857',
						contract_admin_office_dodaac_eda_ext: 'S2404A',
						contract_issue_office_dodaac_eda_ext: 'N00189',
						effective_date_eda_ext_dt: '2013-01-01',
						contract_admin_agency_name_eda_ext: 'DCMA VIRGINIA',
						modification_number_eda_ext: 'Award',
						vendor_cage_eda_ext: '17038',
						award_id_eda_ext: '1023',
						referenced_idv_eda_ext: 'N0018907DZ050',
						vendor_org_hierarchy_eda_n: {
							cage_code_eda_ext_n: [{ cage_code_name_eda_ext: 'BOOZ ALLEN HAMILTON INC.' }],
							vendor_org_eda_ext_n: [
								{
									dodaac_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
									cgac_eda_ext: '017',
									dodaac_eda_ext: 'N00189',
									maj_command_eda_ext: 'N9',
									cgac_agency_name_eda_ext: 'DEPT OF THE NAVY',
									majcom_display_name_eda_ext: 'Naval Supply Systems Command Headquarters',
								},
								{
									dodaac_name_eda_ext: 'DCMA VIRGINIA',
									cgac_eda_ext: '097',
									dodaac_eda_ext: 'S2404A',
									maj_command_eda_ext: 'DR',
									cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
									majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
								},
								{
									dodaac_name_eda_ext: 'DFAS - COLUMBUS CENTER',
									cgac_eda_ext: '097',
									dodaac_eda_ext: 'HQ0338',
									maj_command_eda_ext: 'DT',
									cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
									majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
								},
							],
						},
						total_obligated_amount_eda_ext_f: 213575.01,
						contract_issue_office_majcom_eda_ext: 'Naval Supply Systems Command Headquarters',
						contract_payment_office_name_eda_ext: 'DFAS - COLUMBUS CENTER',
					},
					pagerank_r: 0.00001,
					metadata_type_eda_ext: ['syn'],
					filename: [
						'EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
					],
					doc_num: [
						'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
					],
					id: ['EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf_0'],
					doc_type: [
						'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
					],
					type: ['document'],
					title: ['N0018907DZ050-1023-empty'],
					page_count: [24],
					_index: 'gc_eda_2021_apple',
					_type: '_doc',
					_id: 'd388b5959c77f026c592add9c23d4f3f0a2dcb3ae607df7ee3eadbfa3a11e248',
					_score: 12.188597,
					_source: {
						extracted_data_eda_n: {
							contract_payment_office_dodaac_eda_ext: 'HQ0338',
							vendor_name_eda_ext: 'BOOZ ALLEN & HAMILTON, INC.',
							contract_issue_office_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
							dodaac_org_type_eda_ext: 'DEPT OF THE NAVY',
							vendor_duns_eda_ext: '006928857',
							contract_admin_office_dodaac_eda_ext: 'S2404A',
							contract_issue_office_dodaac_eda_ext: 'N00189',
							effective_date_eda_ext_dt: '2013-01-01',
							contract_admin_agency_name_eda_ext: 'DCMA VIRGINIA',
							modification_number_eda_ext: 'Award',
							vendor_cage_eda_ext: '17038',
							award_id_eda_ext: '1023',
							referenced_idv_eda_ext: 'N0018907DZ050',
							vendor_org_hierarchy_eda_n: {
								cage_code_eda_ext_n: [{ cage_code_name_eda_ext: 'BOOZ ALLEN HAMILTON INC.' }],
								vendor_org_eda_ext_n: [
									{
										dodaac_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
										cgac_eda_ext: '017',
										dodaac_eda_ext: 'N00189',
										maj_command_eda_ext: 'N9',
										cgac_agency_name_eda_ext: 'DEPT OF THE NAVY',
										majcom_display_name_eda_ext: 'Naval Supply Systems Command Headquarters',
									},
									{
										dodaac_name_eda_ext: 'DCMA VIRGINIA',
										cgac_eda_ext: '097',
										dodaac_eda_ext: 'S2404A',
										maj_command_eda_ext: 'DR',
										cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
										majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
									},
									{
										dodaac_name_eda_ext: 'DFAS - COLUMBUS CENTER',
										cgac_eda_ext: '097',
										dodaac_eda_ext: 'HQ0338',
										maj_command_eda_ext: 'DT',
										cgac_agency_name_eda_ext: 'DEPARTMENT OF DEFENSE',
										majcom_display_name_eda_ext: 'Defense Finance Accounting Service',
									},
								],
							},
							total_obligated_amount_eda_ext_f: 213575.01,
							contract_issue_office_majcom_eda_ext: 'Naval Supply Systems Command Headquarters',
							contract_payment_office_name_eda_ext: 'DFAS - COLUMBUS CENTER',
						},
						pagerank_r: 0.00001,
					},
					fields: {
						metadata_type_eda_ext: ['syn'],
						filename: [
							'EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
						],
						doc_num: [
							'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
						],
						id: [
							'EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf_0',
						],
						doc_type: [
							'/var//tmp/tmp.8iowLUq1fx/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_3/EDAPDF-CA76E16FE16A64ADE0440025B3E8F0A7-N0018907DZ050-1023-empty-empty-PDS-2012-09-24.pdf',
						],
						type: ['document'],
						title: ['N0018907DZ050-1023-empty'],
						page_count: [24],
					},
					contract_issue_name_eda_ext: 'FISC NORFOLK CONTRACTING DEPARTMENT',
					contract_issue_dodaac_eda_ext: 'N00189',
					vendor_name_eda_ext: 'BOOZ ALLEN & HAMILTON, INC.',
					vendor_duns_eda_ext: '006928857',
					vendor_cage_eda_ext: '17038',
					contract_admin_name_eda_ext: 'DCMA VIRGINIA',
					contract_admin_office_dodaac_eda_ext: 'S2404A',
					paying_office_name_eda_ext: 'DFAS - COLUMBUS CENTER',
					paying_office_dodaac_eda_ext: 'HQ0338',
					modification_eda_ext: 'Award',
					award_id_eda_ext: 'N0018907DZ050-1023',
					reference_idv_eda_ext: 'N0018907DZ050',
					effective_date_eda_ext: '2013-01-01',
					obligated_amounts_eda_ext: 213575.01,
					issuing_organization_eda_ext: 'DEPT OF THE NAVY',
					contract_issue_majcom_eda_ext: 'Naval Supply Systems Command Headquarters',
					paying_office_majcom_eda_ext: 'Defense Finance Accounting Service',
				};
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (err) {
				assert.fail(err);
			}
		});

		it('should not find the function', async (done) => {
			const req = {
				body: {
					functionName: 'test',
				},
				permissions: ['View EDA'],
			};

			const opts = {
				...constructorOptionsMock,
				edaSearchUtility: {
					getEDAContractQuery() {
						return Promise.resolve({});
					},
					splitAwardID() {
						return {};
					},
				},
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve({});
					},
				},
				constants: {
					EDA_ELASTIC_SEARCH_OPTS: {
						index: 'test index',
					},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {},
				},
				esSearchLib: {},
				redisDB: 'redis://localhost',
			};

			const target = new EDASearchHandler(opts);
			const actual = await target.callFunctionHelper(req, 'test user');
			assert.deepStrictEqual(actual, {});
			done();
		});
	});

	describe('querySimilarDocs', function () {
		it('should return search results that are "similar" to contract award data provided', async (done) => {
			const mockQuery = {
				_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'] },
				stored_fields: [
					'filename',
					'title',
					'page_count',
					'doc_type',
					'doc_num',
					'ref_list',
					'id',
					'summary_30',
					'keyw_5',
					'p_text',
					'type',
					'p_page',
					'display_title_s',
					'display_org_s',
					'display_doc_type_s',
				],
				from: 0,
				size: 20,
				track_total_hits: true,
				query: {
					bool: {
						must: [
							{
								bool: {
									should: [
										{
											nested: {
												path: 'pages',
												inner_hits: {
													_source: false,
													stored_fields: ['pages.filename', 'pages.p_raw_text'],
													from: 0,
													size: 5,
													highlight: {
														fields: {
															'pages.filename.search': { number_of_fragments: 0 },
															'pages.p_raw_text': {
																fragment_size: 180,
																number_of_fragments: 1,
															},
														},
														fragmenter: 'span',
													},
												},
												query: {
													bool: {
														should: [
															{
																wildcard: {
																	'pages.filename.search': {
																		value: 'undefined*',
																		boost: 15,
																	},
																},
															},
															{
																query_string: {
																	query: 'undefined',
																	default_field: 'pages.p_raw_text',
																	default_operator: 'and',
																	fuzzy_max_expansions: 100,
																	fuzziness: 'AUTO',
																},
															},
														],
													},
												},
											},
										},
									],
								},
							},
						],
						should: [
							{
								multi_match: {
									query: 'undefined',
									fields: ['keyw_5^2', 'id^2', 'summary_30', 'pages.p_raw_text'],
									operator: 'or',
								},
							},
							{ rank_feature: { field: 'pagerank_r', boost: 0.5 } },
							{ rank_feature: { field: 'kw_doc_score_r', boost: 0.1 } },
						],
						filter: [
							{
								nested: {
									path: 'extracted_data_eda_n',
									query: {
										bool: {
											must: [
												{
													match: {
														'extracted_data_eda_n.contract_issue_office_dodaac_eda_ext':
															'N00189',
													},
												},
											],
										},
									},
								},
							},
						],
					},
				},
			};
			const mockResults = {
				body: {
					took: 8,
					timed_out: false,
					_shards: { total: 3, successful: 3, skipped: 0, failed: 0 },
					hits: {
						total: { value: 686, relation: 'eq' },
						max_score: 15.25,
						hits: [
							{
								_index: 'gc_eda_2021_apple',
								_type: '_doc',
								_id: '8785270d2b2d57dda30d1bf92bd0b07cfbc57a6d85300036a53317f90d8a45fd',
								_score: 15.25,
								_source: {
									extracted_data_eda_n: {
										contract_payment_office_dodaac_eda_ext: 'N0024B',
										vendor_name_eda_ext: 'BOOZ ALLEN HAMILTON INC.',
										contract_issue_office_name_eda_ext: 'NAVSUP FLC NORFOLK CONTRACTING',
										dodaac_org_type_eda_ext: 'DEPT OF THE NAVY',
										vendor_duns_eda_ext: '006928857',
										contract_admin_office_dodaac_eda_ext: 'N00189',
										contract_issue_office_dodaac_eda_ext: 'N00189',
										effective_date_eda_ext_dt: '2016-09-07',
										contract_admin_agency_name_eda_ext: 'NAVSUP FLC NORFOLK CONTRACTING',
										signature_date_eda_ext_dt: '2016-09-06',
										naics_eda_ext: '541330',
										modification_number_eda_ext: 'Award',
										vendor_cage_eda_ext: '17038',
										award_id_eda_ext: '0003',
										referenced_idv_eda_ext: 'N0018916D0022',
										vendor_org_hierarchy_eda_n: {
											cage_code_eda_ext_n: [
												{ cage_code_name_eda_ext: 'BOOZ ALLEN HAMILTON INC.' },
											],
											vendor_org_eda_ext_n: [
												{
													dodaac_name_eda_ext: 'NAVSEA HQ',
													cgac_eda_ext: '017',
													dodaac_eda_ext: 'N0024B',
													maj_command_eda_ext: 'N0',
													cgac_agency_name_eda_ext: 'DEPT OF THE NAVY',
													majcom_display_name_eda_ext: 'Naval Sea Systems Command',
												},
												{
													dodaac_name_eda_ext: 'NAVSUP FLC NORFOLK CONTRACTING',
													cgac_eda_ext: '017',
													dodaac_eda_ext: 'N00189',
													maj_command_eda_ext: 'N9',
													cgac_agency_name_eda_ext: 'DEPT OF THE NAVY',
													majcom_display_name_eda_ext:
														'Naval Supply Systems Command Headquarters',
												},
											],
										},
										header_details_id_eda_ext: '9ad740473a788adaa76a85135997933f55fccd3d',
										total_obligated_amount_eda_ext_f: 14740.52,
										contract_issue_office_majcom_eda_ext:
											'Naval Supply Systems Command Headquarters',
										contract_payment_office_name_eda_ext: 'NAVSEA HQ',
									},
									pagerank_r: 0.00001,
								},
								fields: {
									filename: [
										'EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
									],
									doc_num: [
										'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
									],
									id: [
										'EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf_0',
									],
									doc_type: [
										'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
									],
									type: ['document'],
									title: ['N0018916D0022-0003-empty'],
									page_count: [12],
								},
								inner_hits: {
									pages: {
										hits: {
											total: { value: 12, relation: 'eq' },
											max_score: 15,
											hits: [
												{
													_index: 'gc_eda_2021_apple',
													_type: '_doc',
													_id: '8785270d2b2d57dda30d1bf92bd0b07cfbc57a6d85300036a53317f90d8a45fd',
													_nested: { field: 'pages', offset: 0 },
													_score: 15,
													fields: {
														'pages.filename': [
															'EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
														],
													},
													highlight: {
														'pages.filename.search': [
															'<em>EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf</em>',
														],
													},
												},
												{
													_index: 'gc_eda_2021_apple',
													_type: '_doc',
													_id: '8785270d2b2d57dda30d1bf92bd0b07cfbc57a6d85300036a53317f90d8a45fd',
													_nested: { field: 'pages', offset: 1 },
													_score: 15,
													fields: {
														'pages.filename': [
															'EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
														],
													},
													highlight: {
														'pages.filename.search': [
															'<em>EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf</em>',
														],
													},
												},
												{
													_index: 'gc_eda_2021_apple',
													_type: '_doc',
													_id: '8785270d2b2d57dda30d1bf92bd0b07cfbc57a6d85300036a53317f90d8a45fd',
													_nested: { field: 'pages', offset: 2 },
													_score: 15,
													fields: {
														'pages.filename': [
															'EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
														],
													},
													highlight: {
														'pages.filename.search': [
															'<em>EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf</em>',
														],
													},
												},
												{
													_index: 'gc_eda_2021_apple',
													_type: '_doc',
													_id: '8785270d2b2d57dda30d1bf92bd0b07cfbc57a6d85300036a53317f90d8a45fd',
													_nested: { field: 'pages', offset: 3 },
													_score: 15,
													fields: {
														'pages.filename': [
															'EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
														],
													},
													highlight: {
														'pages.filename.search': [
															'<em>EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf</em>',
														],
													},
												},
												{
													_index: 'gc_eda_2021_apple',
													_type: '_doc',
													_id: '8785270d2b2d57dda30d1bf92bd0b07cfbc57a6d85300036a53317f90d8a45fd',
													_nested: { field: 'pages', offset: 4 },
													_score: 15,
													fields: {
														'pages.filename': [
															'EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
														],
													},
													highlight: {
														'pages.filename.search': [
															'<em>EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf</em>',
														],
													},
												},
											],
										},
									},
								},
							},
						],
					},
				},
				statusCode: 200,
				headers: {
					date: 'Tue, 10 Aug 2021 00:02:05 GMT',
					'content-type': 'application/json; charset=UTF-8',
					'content-length': '4760',
					connection: 'keep-alive',
					'access-control-allow-origin': '*',
				},
				meta: {
					context: null,
					request: {
						params: {
							method: 'POST',
							path: '/gc_eda_2021_apple/_search',
							body: '{"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s"],"from":0,"size":1,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"*","boost":15}}},{"query_string":{"query":"","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}}]}}],"should":[{"multi_match":{"query":"","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}],"filter":[{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.contract_issue_office_dodaac_eda_ext":"N00189"}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.contract_issue_office_name_eda_ext":"FISC NORFOLK CONTRACTING DEPARTMENT"}}]}}}}]}}}',
							querystring: '',
							headers: {
								'user-agent': 'elasticsearch-js/7.13.0 (linux 5.10.25-linuxkit-x64; Node.js v14.17.0)',
								'x-elastic-client-meta': 'es=7.13.0,js=14.17.0,t=7.13.0,hc=14.17.0',
								'content-type': 'application/json',
								'content-length': '1446',
							},
							timeout: 30000,
						},
						options: {},
						id: 1,
					},
					name: 'elasticsearch-js',
					connection: {
						url: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						id: 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/',
						headers: {},
						deadCount: 0,
						resurrectTimeout: 0,
						_openRequests: 0,
						status: 'alive',
						roles: { master: true, data: true, ingest: true, ml: false },
					},
					attempts: 0,
					aborted: false,
				},
			};
			const mockCleanedResults = {
				query: {
					_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'] },
					stored_fields: [
						'filename',
						'title',
						'page_count',
						'doc_type',
						'doc_num',
						'ref_list',
						'id',
						'summary_30',
						'keyw_5',
						'p_text',
						'type',
						'p_page',
						'display_title_s',
						'display_org_s',
						'display_doc_type_s',
					],
					from: 0,
					size: 1,
					track_total_hits: true,
					query: {
						bool: {
							must: [
								{
									bool: {
										should: [
											{
												nested: {
													path: 'pages',
													inner_hits: {
														_source: false,
														stored_fields: ['pages.filename', 'pages.p_raw_text'],
														from: 0,
														size: 5,
														highlight: {
															fields: {
																'pages.filename.search': { number_of_fragments: 0 },
																'pages.p_raw_text': {
																	fragment_size: 180,
																	number_of_fragments: 1,
																},
															},
															fragmenter: 'span',
														},
													},
													query: {
														bool: {
															should: [
																{
																	wildcard: {
																		'pages.filename.search': {
																			value: '*',
																			boost: 15,
																		},
																	},
																},
																{
																	query_string: {
																		query: '',
																		default_field: 'pages.p_raw_text',
																		default_operator: 'and',
																		fuzzy_max_expansions: 100,
																		fuzziness: 'AUTO',
																	},
																},
															],
														},
													},
												},
											},
										],
									},
								},
							],
							should: [
								{
									multi_match: {
										query: '',
										fields: ['keyw_5^2', 'id^2', 'summary_30', 'pages.p_raw_text'],
										operator: 'or',
									},
								},
								{ rank_feature: { field: 'pagerank_r', boost: 0.5 } },
								{ rank_feature: { field: 'kw_doc_score_r', boost: 0.1 } },
							],
							filter: [
								{
									nested: {
										path: 'extracted_data_eda_n',
										query: {
											bool: {
												must: [
													{
														match: {
															'extracted_data_eda_n.contract_issue_office_dodaac_eda_ext':
																'N00189',
														},
													},
												],
											},
										},
									},
								},
								{
									nested: {
										path: 'extracted_data_eda_n',
										query: {
											bool: {
												must: [
													{
														match: {
															'extracted_data_eda_n.contract_issue_office_name_eda_ext':
																'FISC NORFOLK CONTRACTING DEPARTMENT',
														},
													},
												],
											},
										},
									},
								},
							],
						},
					},
				},
				totalCount: 686,
				docs: [
					{
						filename:
							'EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
						doc_num:
							'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
						id: 'EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf_0',
						doc_type:
							'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
						type: 'document',
						title: 'N0018916D0022-0003-empty',
						page_count: 12,
						topics_s: [],
						pageHits: [
							{
								snippet:
									'<em>EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06</em>',
								pageNumber: 0,
							},
						],
						pageHitCount: 1,
						contract_issue_name_eda_ext: 'NAVSUP FLC NORFOLK CONTRACTING',
						contract_issue_dodaac_eda_ext: 'N00189',
						vendor_name_eda_ext: 'BOOZ ALLEN HAMILTON INC.',
						vendor_duns_eda_ext: '006928857',
						vendor_cage_eda_ext: '17038',
						paying_office_name_eda_ext: 'NAVSEA HQ',
						paying_office_dodaac_eda_ext: 'N0024B',
						modification_eda_ext: 'Award',
						award_id_eda_ext: 'N0018916D0022-0003',
						reference_idv_eda_ext: 'N0018916D0022',
						signature_date_eda_ext: '2016-09-06',
						effective_date_eda_ext: '2016-09-07',
						obligated_amounts_eda_ext: 14740.52,
						naics_eda_ext: '541330',
						issuing_organization_eda_ext: 'DEPT OF THE NAVY',
						paying_office_majcom_eda_ext: 'Naval Sea Systems Command',
						contract_issue_majcom_eda_ext: 'Naval Supply Systems Command Headquarters',
						esIndex: 'gc_eda_2021_apple',
						keyw_5: '',
						ref_list: [],
					},
				],
				doc_types: [],
				doc_orgs: [],
				searchTerms: [],
				expansionDict: {},
			};
			const opts = {
				edaSearchUtility: {
					getElasticsearchPagesQuery() {
						return Promise.resolve(mockQuery);
					},
					cleanUpEsResults() {
						return mockCleanedResults;
					},
				},
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(mockResults);
					},
				},
				esSearchLib: {},
				redisDB: 'redis://localhost',
			};

			const req = {
				permissions: ['View EDA'],
				body: { issueOfficeDoDAAC: 'N00189' },
			};

			const target = new EDASearchHandler(opts);
			const actual = await target.querySimilarDocs(req, 'test user');
			const expected = {
				query: {
					_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', '*_eda_n*'] },
					stored_fields: [
						'filename',
						'title',
						'page_count',
						'doc_type',
						'doc_num',
						'ref_list',
						'id',
						'summary_30',
						'keyw_5',
						'p_text',
						'type',
						'p_page',
						'display_title_s',
						'display_org_s',
						'display_doc_type_s',
					],
					from: 0,
					size: 1,
					track_total_hits: true,
					query: {
						bool: {
							must: [
								{
									bool: {
										should: [
											{
												nested: {
													path: 'pages',
													inner_hits: {
														_source: false,
														stored_fields: ['pages.filename', 'pages.p_raw_text'],
														from: 0,
														size: 5,
														highlight: {
															fields: {
																'pages.filename.search': { number_of_fragments: 0 },
																'pages.p_raw_text': {
																	fragment_size: 180,
																	number_of_fragments: 1,
																},
															},
															fragmenter: 'span',
														},
													},
													query: {
														bool: {
															should: [
																{
																	wildcard: {
																		'pages.filename.search': {
																			value: '*',
																			boost: 15,
																		},
																	},
																},
																{
																	query_string: {
																		query: '',
																		default_field: 'pages.p_raw_text',
																		default_operator: 'and',
																		fuzzy_max_expansions: 100,
																		fuzziness: 'AUTO',
																	},
																},
															],
														},
													},
												},
											},
										],
									},
								},
							],
							should: [
								{
									multi_match: {
										query: '',
										fields: ['keyw_5^2', 'id^2', 'summary_30', 'pages.p_raw_text'],
										operator: 'or',
									},
								},
								{ rank_feature: { field: 'pagerank_r', boost: 0.5 } },
								{ rank_feature: { field: 'kw_doc_score_r', boost: 0.1 } },
							],
							filter: [
								{
									nested: {
										path: 'extracted_data_eda_n',
										query: {
											bool: {
												must: [
													{
														match: {
															'extracted_data_eda_n.contract_issue_office_dodaac_eda_ext':
																'N00189',
														},
													},
												],
											},
										},
									},
								},
								{
									nested: {
										path: 'extracted_data_eda_n',
										query: {
											bool: {
												must: [
													{
														match: {
															'extracted_data_eda_n.contract_issue_office_name_eda_ext':
																'FISC NORFOLK CONTRACTING DEPARTMENT',
														},
													},
												],
											},
										},
									},
								},
							],
						},
					},
				},
				totalCount: 686,
				docs: [
					{
						filename:
							'EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
						doc_num:
							'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
						id: 'EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf_0',
						doc_type:
							'/var//tmp/tmp.aaB4rxMCIq/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_1/EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06.pdf',
						type: 'document',
						title: 'N0018916D0022-0003-empty',
						page_count: 12,
						topics_s: [],
						pageHits: [
							{
								snippet:
									'<em>EDAPDF-3BE1829471411503E05400215A9BA3BA-N0018916D0022-0003-empty-empty-PDS-2016-09-06</em>',
								pageNumber: 0,
							},
						],
						pageHitCount: 1,
						contract_issue_name_eda_ext: 'NAVSUP FLC NORFOLK CONTRACTING',
						contract_issue_dodaac_eda_ext: 'N00189',
						vendor_name_eda_ext: 'BOOZ ALLEN HAMILTON INC.',
						vendor_duns_eda_ext: '006928857',
						vendor_cage_eda_ext: '17038',
						paying_office_name_eda_ext: 'NAVSEA HQ',
						paying_office_dodaac_eda_ext: 'N0024B',
						modification_eda_ext: 'Award',
						award_id_eda_ext: 'N0018916D0022-0003',
						reference_idv_eda_ext: 'N0018916D0022',
						signature_date_eda_ext: '2016-09-06',
						effective_date_eda_ext: '2016-09-07',
						obligated_amounts_eda_ext: 14740.52,
						naics_eda_ext: '541330',
						issuing_organization_eda_ext: 'DEPT OF THE NAVY',
						paying_office_majcom_eda_ext: 'Naval Sea Systems Command',
						contract_issue_majcom_eda_ext: 'Naval Supply Systems Command Headquarters',
						esIndex: 'gc_eda_2021_apple',
						keyw_5: '',
						ref_list: [],
					},
				],
				doc_types: [],
				doc_orgs: [],
				searchTerms: [],
				expansionDict: {},
			};
			assert.deepStrictEqual(actual, expected);
			done();
		});
	});
});
