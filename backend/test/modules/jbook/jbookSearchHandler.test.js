const assert = require('assert');
const JBookSearchHandler = require('../../../node_app/modules/jbook/jbookSearchHandler');
const { constructorOptionsMock } = require('../../resources/testUtility');

const elasticSearchResultsMock = {
	body: {
		took: 9,
		timed_out: false,
		_shards: { total: 3, successful: 3, skipped: 0, failed: 0 },
		hits: {
			total: { value: 2, relation: 'eq' },
			max_score: null,
			hits: [
				{
					_index: 'jbook_c',
					_type: '_doc',
					_id: 'pdoc#2022#PB#02#0131B89000#21#N/A#2035',
					_score: null,
					_source: {
						type_s: 'procurement',
						key_s: 'pdoc#2022#PB#02#0131B89000#21#N/A#2035',
						priorYearAmount_d: '1.76',
						'P40-77_TOA_PY_d': '0.756',
						'P40-76_TOA_APY_d': '1.018',
						'P40-52_NetP1_APY_d': '1.018',
						budgetYear_s: '2022',
						appropriationNumber_s: '2035',
						appropriationTitle_t: 'Other Procurement, Army',
						budgetActivityNumber_s: '02',
						budgetActivityTitle_t: 'Communications and Electronics Equipment',
						budgetLineItem_s: '0131B89000',
						projectTitle_s: 'Insider Threat Program - Unit Activity Monitoring',
						p1LineNumber_s: '54',
						projectMissionDescription_t:
							"The Insider Threat Program - User Activity Monitoring (UAM) program supports the Army Network Modernization Strategy Line of Effort (LOE) Key Enabler for the Unified Network.  Efforts are aligned to support the Network-Cross Functional Team capability set approach to achieve the network modernization strategy.\n\nFY2022 OPA funds have been moved into OPA BLI 0128B63000.\n\nAll information technology (IT) procurement consists of commercial-off-the-shelf (COTS) solutions.  Quantities and units costs vary by system configuration and site.\n\nUAM operations are conducted in support of the Army's insider threat program.  UAM is the technical capability to observe and record the actions and activities of an individual, at any time, on any device access U.S. Government information in order to detect insider threats and to support authorized investigations.  The OPA program supports three objectives.  First, it provides advanced analytics (including user behavior modeling software) to increase UAM analysis effectiveness and efficiency.  Second, it provides additional system hardware.  Third, it supports the procurement of the next generation Army UAM tool in FY2021.  Advanced analytics procurement includes commercial-off-the-shelf (COTS) hardware, software, and open source software.  This capability will increase UAM analysts effectiveness and efficiency.  The primary objective is to employ COTS technology to identify potential insider threats by monitoring behavior between users, user interactions with data and network capabilities (especially in regards to privileged users), and monitoring user compliance with network and data standards and policies.\n\nNote: Army executes its insider threat program in accordance with Executive Order 13587, Structural Reforms to Improve the Security of Classified Networks and the Responsible Sharing and Safeguarding of Classified Information, (Reference b) dated 7 October 2011; Presidential Memorandum, National Insider Threat Policy and Minimum Standards for Executive Branch Insider Threat Programs, dated 21 November 2012; National Defense Authorization Act for Fiscal Year 2012, Section 922, Insider Threat Detection; and Army Directive 2013-18 (Army Insider Threat Program) dated 31 July 2013.",
						'P40-15_Justification_t': 'B89000 has no FY2022 funding request.',
						serviceAgency_s: 'DEPARTMENT OF THE ARMY',
						uot_department_s: '21',
						uot_agency_s: 'N/A',
						'P40-13_BSA_Title_t': 'Information Security',
						org_jbook_desc_s: 'Army',
						org_code_s: 'ARMY',
						key_review_s: 'pdoc#0131B89000#2022#2035#02#Army',
						keyword_n: [],
						review_n: [
							{
								id_s: '233211',
								budget_line_item_s: '0131B89000',
								service_agree_label_s: 'No',
								primary_class_label_s: 'Not AI',
								service_ptp_s: 'Space Force',
								service_mp_add_s: 'Unknown',
								review_status_s: 'Finished Review',
								service_poc_title_s: 'poc title',
								service_poc_name_s: 'poc name',
								service_poc_email_s: 'poc email',
								primary_review_notes_s: 'Test Automation Primary Reviewer Notes',
								budget_type_s: 'pdoc',
								budget_year_s: '2022',
								primary_review_status_s: 'Finished Review',
								service_review_status_s: 'Finished Review',
								poc_review_status_s: 'Finished Review',
								primary_reviewer_s: 'Allen, Gregory',
								service_reviewer_s: 'Shaha, Jacob (AI2C)',
								service_review_notes_s: 'Test Automation Secondary Reviewer Notes',
								poc_percentage_attributed_s: '60',
								poc_ai_type_s: 'Speech',
								poc_joint_capability_area_s: 'Logistics (LOG)',
								service_ptp_agree_label_s: 'No',
								doc_id_s: '7939',
								service_poc_org_s: 'poc org',
								poc_phone_number_s: 'poc phone number',
								primary_ptp_s: 'Air Force',
								service_class_label_s: 'AI Enabling',
								createdAt_s: '2021-11-10 13:59:27.983000+00:00',
								updatedAt_s: '2022-01-26 01:14:58.145000+00:00',
								service_secondary_reviewer_s: 'Aha, David NRL (Navy)',
								budget_activity_s: '02',
								domain_task_s: 'Responsible AI',
								alternate_poc_title_s: 'test',
								alternate_poc_name_s: 'test',
								alternate_poc_email_s: 'test',
								alternate_poc_phone_number_s: '1111111',
								alternate_poc_org_s: 'test',
								robotics_system_agree_s: 'Robotic',
								poc_agree_label_s: 'No',
								poc_class_label_s: 'Core AI',
								poc_ptp_s: 'Air Force',
								poc_ptp_agree_label_s: 'No',
								poc_mp_agree_label_s: 'No',
								intelligent_systems_agree_s: 'Yes',
								poc_mp_checklist_s: '{}',
								service_mp_checklist_s: '{}',
								appn_num_s: '2035A',
								agency_s: 'Army',
								jbook_ref_id_s: 'pdoc#0131B89000#2022#2035#02#Army',
								portfolio_name_s: 'AI Inventory',
							},
						],
					},
					highlight: {
						budgetActivityTitle_t: [
							'<em>Communications</em> <em>and</em> <em>Electronics</em> <em>Equipment</em>',
						],
						appropriationTitle_t: ['<em>Other</em> <em>Procurement</em>, <em>Army</em>'],
					},
					sort: ['2022'],
					inner_hits: {
						r2_adjustments_n: { hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] } },
						r4a_schedule_details_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						p40a_secondary_distribution_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						r2a_joint_funding_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						p5_cost_elements_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						p3a_contract_data_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						p40a_aggregated_items_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						p5_res_sum_optional_rows_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						r2a_other_program_funding_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						r2a_cong_adds_n: { hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] } },
						p3a_rdte_n: { hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] } },
						r_2a_accomp_pp_n: { hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] } },
						p3a_dev_milestones_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
					},
				},
				{
					_index: 'jbook_c',
					_type: '_doc',
					_id: 'pdoc#2014#PB#01#0902298J#97#THE JOINT STAFF#0300',
					_score: null,
					_source: {
						type_s: 'procurement',
						key_s: 'pdoc#2014#PB#01#0902298J#97#THE JOINT STAFF#0300',
						currentYearAmount_d: '14.265',
						priorYearAmount_d: '10.983',
						'P40-77_TOA_PY_d': '21.794',
						by1BaseYear_d: '14.265',
						budgetYear_s: '2014',
						appropriationNumber_s: '0300',
						appropriationTitle_t: 'Procurement, Defense-Wide',
						budgetActivityNumber_s: '01',
						budgetActivityTitle_t: 'Major Equipment',
						budgetLineItem_s: '0902298J',
						projectTitle_s: 'Management Headquarters',
						p1LineNumber_s: '40',
						projectMissionDescription_t:
							"Management Headquarters provides the day-to-day financial resources necessary to support Joint Staff operations and the Joint Staff Information Network (JSIN).  JSIN is the network infrastructure (for both classified and unclassified information) that supports the Chairman of the Joint Chiefs of Staff and the Joint Staff enabling collaboration and information-sharing among the Joint Staff, COCOMs, Agencies, and Services.  It provides information management resources and an application required for decision superiority, and empowers the Joint Staff as a knowledge-enabled organization.  The JSIN system accomplishes this through a collection of capabilities and services.  JSIN is comprised of three integrated networks that serve Top Secret (JWICS), Secret (SIPRNET), and combined internal and external unclassified (NIPRNET) collaboration needs.  The major capabilities of JSIN include an office automation suite, collaboration, workflow, information archiving, and document retrieval.  The most critical of these is staff action processing (decision-making) for faster coordination of critical classified and unclassified issues between the CJCS, Joint Staff, and the COCOMs, Services and Agencies.  JSIN's other key services include strategic geographical information services, office automation, collaborative planning, automated message handling, local area networking, electronic mail, financial management, contract management, manpower and personnel management, and record management.  The Joint Staffâs continued service contracts streamline JS IT support processes with 24/7 availability.",
						serviceAgency_s: 'DEPARTMENT OF THE DEFENSE',
						uot_department_s: '97',
						uot_agency_s: 'THE JOINT STAFF',
						'P40-13_BSA_Title_t': 'Major Equipment, TJS',
						p4082_toa_by2_d: '18.72',
						p4083_toa_by3_d: '18.623',
						p4084_toa_by4_d: '18.762',
						p4085_toa_by5_d: '19.222',
						p4087_toa_tot_d: '122.369',
						org_jbook_desc_s: 'The Joint Staff (TJS)',
						org_code_s: 'TJS',
						key_review_s: 'pdoc#0902298J#2014#0300#01#The Joint Staff (TJS)',
						p5_cost_elements_n: [{ 'P5-14_Item_Title_t': 'Management Headquarters' }],
						p5_res_sum_optional_rows_n: [{ 'P5-16_Item_Title_t': 'Management Headquarters' }],
						keyword_n: [],
						review_n: [
							{
								id_s: '259253',
								budget_line_item_s: '0902298J',
								service_agree_label_s: 'Yes',
								primary_class_label_s: 'AI Enabled',
								service_mp_add_s: 'Industry',
								review_status_s: 'Partial Review (Service)',
								service_poc_title_s: 'test',
								service_poc_name_s: 'testing email',
								service_poc_email_s: 'gerner_david@bah.com',
								budget_type_s: 'pdoc',
								budget_year_s: '2014',
								primary_review_status_s: 'Partial Review',
								service_review_status_s: 'Partial Review',
								poc_review_status_s: 'Partial Review',
								primary_reviewer_s: 'Allen, Gregory',
								poc_percentage_attributed_s: '11',
								poc_ai_type_s: 'Unstructured Text',
								poc_joint_capability_area_s: 'Logistics (LOG)',
								service_ptp_agree_label_s: 'Yes',
								doc_id_s: '277',
								service_poc_org_s: 'bah',
								poc_phone_number_s: '123-456-0999',
								primary_ptp_s: 'Space Force',
								createdAt_s: '2021-12-04 07:01:33.409000+00:00',
								updatedAt_s: '2022-01-12 00:23:04.527000+00:00',
								service_secondary_reviewer_s: 'Aha, David NRL (Navy)',
								budget_activity_s: '01',
								domain_task_s: 'Natural Language Processing',
								domain_task_secondary_s: 'Mapping',
								alternate_poc_title_s: 'a',
								alternate_poc_name_s: 'a',
								alternate_poc_email_s: 'a',
								alternate_poc_phone_number_s: '12',
								alternate_poc_org_s: 'a',
								robotics_system_agree_s: 'Computer',
								poc_agree_label_s: 'Yes',
								poc_ptp_agree_label_s: 'Yes',
								poc_mp_list_s: 'Dude|ABPRO CORPORATION|ARS ALEUT SERVICES LLC|test 2|test',
								poc_mp_agree_label_s: 'Yes',
								intelligent_systems_agree_s: 'Yes',
								poc_joint_capability_area2_s: 'Deployment & Distribution, Supply',
								poc_joint_capability_area3_s:
									'Force Sustainment, Supplies & Equipment Management, Inventory Management',
								appn_num_s: '0300D',
								agency_s: 'The Joint Staff (TJS)',
								jbook_ref_id_s: 'pdoc#0902298J#2014#0300#01#The Joint Staff (TJS)',
								portfolio_name_s: 'AI Inventory',
							},
						],
					},
					highlight: {
						budgetActivityTitle_t: ['<em>Major</em> <em>Equipment</em>'],
						appropriationTitle_t: ['<em>Procurement</em>, <em>Defense</em>-<em>Wide</em>'],
					},
					sort: ['2014'],
					inner_hits: {
						r2_adjustments_n: { hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] } },
						r4a_schedule_details_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						p40a_secondary_distribution_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						r2a_joint_funding_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						p5_cost_elements_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						p3a_contract_data_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						p40a_aggregated_items_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						p5_res_sum_optional_rows_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						r2a_other_program_funding_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
						r2a_cong_adds_n: { hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] } },
						p3a_rdte_n: { hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] } },
						r_2a_accomp_pp_n: { hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] } },
						p3a_dev_milestones_n: {
							hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
						},
					},
				},
			],
		},
		aggregations: {
			service_agency_aggs: {
				doc_count_error_upper_bound: 0,
				sum_other_doc_count: 0,
				buckets: [
					{ key: 'DEPARTMENT OF THE ARMY', doc_count: 1 },
					{ key: 'DEPARTMENT OF THE DEFENSE', doc_count: 1 },
				],
			},
		},
	},
};
const mockCleanESResults = {
	totalCount: 2,
	docs: [
		{
			budgetType: 'pdoc',
			key_s: 'pdoc#2022#PB#02#0131B89000#21#N/A#2035',
			priorYearAmount: '1.76',
			'P40-77_TOA_PY': '0.756',
			'P40-76_TOA_APY': '1.018',
			allPriorYearsAmount: '1.018',
			budgetYear: '2022',
			appropriationNumber: '2035',
			appropriationTitle: 'Other Procurement, Army',
			budgetActivityNumber: '02',
			budgetActivityTitle: 'Communications and Electronics Equipment',
			budgetLineItem: '0131B89000',
			projectTitle: 'Insider Threat Program - Unit Activity Monitoring',
			p1LineNumber: '54',
			projectMissionDescription:
				"The Insider Threat Program - User Activity Monitoring (UAM) program supports the Army Network Modernization Strategy Line of Effort (LOE) Key Enabler for the Unified Network.  Efforts are aligned to support the Network-Cross Functional Team capability set approach to achieve the network modernization strategy.\n\nFY2022 OPA funds have been moved into OPA BLI 0128B63000.\n\nAll information technology (IT) procurement consists of commercial-off-the-shelf (COTS) solutions.  Quantities and units costs vary by system configuration and site.\n\nUAM operations are conducted in support of the Army's insider threat program.  UAM is the technical capability to observe and record the actions and activities of an individual, at any time, on any device access U.S. Government information in order to detect insider threats and to support authorized investigations.  The OPA program supports three objectives.  First, it provides advanced analytics (including user behavior modeling software) to increase UAM analysis effectiveness and efficiency.  Second, it provides additional system hardware.  Third, it supports the procurement of the next generation Army UAM tool in FY2021.  Advanced analytics procurement includes commercial-off-the-shelf (COTS) hardware, software, and open source software.  This capability will increase UAM analysts effectiveness and efficiency.  The primary objective is to employ COTS technology to identify potential insider threats by monitoring behavior between users, user interactions with data and network capabilities (especially in regards to privileged users), and monitoring user compliance with network and data standards and policies.\n\nNote: Army executes its insider threat program in accordance with Executive Order 13587, Structural Reforms to Improve the Security of Classified Networks and the Responsible Sharing and Safeguarding of Classified Information, (Reference b) dated 7 October 2011; Presidential Memorandum, National Insider Threat Policy and Minimum Standards for Executive Branch Insider Threat Programs, dated 21 November 2012; National Defense Authorization Act for Fiscal Year 2012, Section 922, Insider Threat Detection; and Army Directive 2013-18 (Army Insider Threat Program) dated 31 July 2013.",
			'P40-15_Justification': 'B89000 has no FY2022 funding request.',
			serviceAgency: 'Army',
			uot_department_s: '21',
			uot_agency_s: 'N/A',
			'P40-13_BSA_Title': 'Information Security',
			org_jbook_desc_s: 'Army',
			org_code_s: 'ARMY',
			id: 'pdoc#0131B89000#2022#2035#02#Army',
			keywords: [],
			review_n: {
				id_s: '233211',
				budget_line_item_s: '0131B89000',
				service_agree_label_s: 'No',
				primary_class_label_s: 'Not AI',
				service_ptp_s: 'Space Force',
				service_mp_add_s: 'Unknown',
				review_status_s: 'Finished Review',
				service_poc_title_s: 'poc title',
				service_poc_name_s: 'poc name',
				service_poc_email_s: 'poc email',
				primary_review_notes_s: 'Test Automation Primary Reviewer Notes',
				budget_type_s: 'pdoc',
				budget_year_s: '2022',
				primary_review_status_s: 'Finished Review',
				service_review_status_s: 'Finished Review',
				poc_review_status_s: 'Finished Review',
				primary_reviewer_s: 'Allen, Gregory',
				service_reviewer_s: 'Shaha, Jacob (AI2C)',
				service_review_notes_s: 'Test Automation Secondary Reviewer Notes',
				poc_percentage_attributed_s: '60',
				poc_ai_type_s: 'Speech',
				poc_joint_capability_area_s: 'Logistics (LOG)',
				service_ptp_agree_label_s: 'No',
				doc_id_s: '7939',
				service_poc_org_s: 'poc org',
				poc_phone_number_s: 'poc phone number',
				primary_ptp_s: 'Air Force',
				service_class_label_s: 'AI Enabling',
				createdAt_s: '2021-11-10 13:59:27.983000+00:00',
				updatedAt_s: '2022-01-26 01:14:58.145000+00:00',
				service_secondary_reviewer_s: 'Aha, David NRL (Navy)',
				budget_activity_s: '02',
				domain_task_s: 'Responsible AI',
				alternate_poc_title_s: 'test',
				alternate_poc_name_s: 'test',
				alternate_poc_email_s: 'test',
				alternate_poc_phone_number_s: '1111111',
				alternate_poc_org_s: 'test',
				robotics_system_agree_s: 'Robotic',
				poc_agree_label_s: 'No',
				poc_class_label_s: 'Core AI',
				poc_ptp_s: 'Air Force',
				poc_ptp_agree_label_s: 'No',
				poc_mp_agree_label_s: 'No',
				intelligent_systems_agree_s: 'Yes',
				poc_mp_checklist_s: '{}',
				service_mp_checklist_s: '{}',
				appn_num_s: '2035A',
				agency_s: 'Army',
				jbook_ref_id_s: 'pdoc#0131B89000#2022#2035#02#Army',
				portfolio_name_s: 'AI Inventory',
			},
			hasKeywords: false,
			pageHits: [
				{
					title: 'Budget Activity Title',
					snippet: '<em>Communications</em> <em>and</em> <em>Electronics</em> <em>Equipment</em>',
				},
				{
					title: 'Appropriation Title',
					snippet: '<em>Other</em> <em>Procurement</em>, <em>Army</em>',
				},
			],
		},
		{
			budgetType: 'pdoc',
			key_s: 'pdoc#2014#PB#01#0902298J#97#THE JOINT STAFF#0300',
			currentYearAmount: '14.265',
			priorYearAmount: '10.983',
			'P40-77_TOA_PY': '21.794',
			by1BaseYear: '14.265',
			budgetYear: '2014',
			appropriationNumber: '0300',
			appropriationTitle: 'Procurement, Defense-Wide',
			budgetActivityNumber: '01',
			budgetActivityTitle: 'Major Equipment',
			budgetLineItem: '0902298J',
			projectTitle: 'Management Headquarters',
			p1LineNumber: '40',
			projectMissionDescription:
				"Management Headquarters provides the day-to-day financial resources necessary to support Joint Staff operations and the Joint Staff Information Network (JSIN).  JSIN is the network infrastructure (for both classified and unclassified information) that supports the Chairman of the Joint Chiefs of Staff and the Joint Staff enabling collaboration and information-sharing among the Joint Staff, COCOMs, Agencies, and Services.  It provides information management resources and an application required for decision superiority, and empowers the Joint Staff as a knowledge-enabled organization.  The JSIN system accomplishes this through a collection of capabilities and services.  JSIN is comprised of three integrated networks that serve Top Secret (JWICS), Secret (SIPRNET), and combined internal and external unclassified (NIPRNET) collaboration needs.  The major capabilities of JSIN include an office automation suite, collaboration, workflow, information archiving, and document retrieval.  The most critical of these is staff action processing (decision-making) for faster coordination of critical classified and unclassified issues between the CJCS, Joint Staff, and the COCOMs, Services and Agencies.  JSIN's other key services include strategic geographical information services, office automation, collaborative planning, automated message handling, local area networking, electronic mail, financial management, contract management, manpower and personnel management, and record management.  The Joint Staffâs continued service contracts streamline JS IT support processes with 24/7 availability.",
			serviceAgency: 'DEPARTMENT OF THE DEFENSE',
			uot_department_s: '97',
			uot_agency_s: 'THE JOINT STAFF',
			'P40-13_BSA_Title': 'Major Equipment, TJS',
			p4082_toa_by2_d: '18.72',
			p4083_toa_by3_d: '18.623',
			p4084_toa_by4_d: '18.762',
			p4085_toa_by5_d: '19.222',
			p4087_toa_tot_d: '122.369',
			org_jbook_desc_s: 'The Joint Staff (TJS)',
			org_code_s: 'TJS',
			id: 'pdoc#0902298J#2014#0300#01#The Joint Staff (TJS)',
			p5_cost_elements_n: [{ 'P5-14_Item_Title_t': 'Management Headquarters' }],
			p5_res_sum_optional_rows_n: [{ 'P5-16_Item_Title_t': 'Management Headquarters' }],
			keywords: [],
			review_n: {
				id_s: '259253',
				budget_line_item_s: '0902298J',
				service_agree_label_s: 'Yes',
				primary_class_label_s: 'AI Enabled',
				service_mp_add_s: 'Industry',
				review_status_s: 'Partial Review (Service)',
				service_poc_title_s: 'test',
				service_poc_name_s: 'testing email',
				service_poc_email_s: 'gerner_david@bah.com',
				budget_type_s: 'pdoc',
				budget_year_s: '2014',
				primary_review_status_s: 'Partial Review',
				service_review_status_s: 'Partial Review',
				poc_review_status_s: 'Partial Review',
				primary_reviewer_s: 'Allen, Gregory',
				poc_percentage_attributed_s: '11',
				poc_ai_type_s: 'Unstructured Text',
				poc_joint_capability_area_s: 'Logistics (LOG)',
				service_ptp_agree_label_s: 'Yes',
				doc_id_s: '277',
				service_poc_org_s: 'bah',
				poc_phone_number_s: '123-456-0999',
				primary_ptp_s: 'Space Force',
				createdAt_s: '2021-12-04 07:01:33.409000+00:00',
				updatedAt_s: '2022-01-12 00:23:04.527000+00:00',
				service_secondary_reviewer_s: 'Aha, David NRL (Navy)',
				budget_activity_s: '01',
				domain_task_s: 'Natural Language Processing',
				domain_task_secondary_s: 'Mapping',
				alternate_poc_title_s: 'a',
				alternate_poc_name_s: 'a',
				alternate_poc_email_s: 'a',
				alternate_poc_phone_number_s: '12',
				alternate_poc_org_s: 'a',
				robotics_system_agree_s: 'Computer',
				poc_agree_label_s: 'Yes',
				poc_ptp_agree_label_s: 'Yes',
				poc_mp_list_s: 'Dude|ABPRO CORPORATION|ARS ALEUT SERVICES LLC|test 2|test',
				poc_mp_agree_label_s: 'Yes',
				intelligent_systems_agree_s: 'Yes',
				poc_joint_capability_area2_s: 'Deployment & Distribution, Supply',
				poc_joint_capability_area3_s:
					'Force Sustainment, Supplies & Equipment Management, Inventory Management',
				appn_num_s: '0300D',
				agency_s: 'The Joint Staff (TJS)',
				jbook_ref_id_s: 'pdoc#0902298J#2014#0300#01#The Joint Staff (TJS)',
				portfolio_name_s: 'AI Inventory',
			},
			hasKeywords: false,
			pageHits: [
				{ title: 'Budget Activity Title', snippet: '<em>Major</em> <em>Equipment</em>' },
				{
					title: 'Appropriation Title',
					snippet: '<em>Procurement</em>, <em>Defense</em>-<em>Wide</em>',
				},
			],
		},
	],
	serviceAgencyCounts: [
		{ key: 'DEPARTMENT OF THE ARMY', doc_count: 1 },
		{ key: 'DEPARTMENT OF THE DEFENSE', doc_count: 1 },
	],
};

describe('JBookSearchHandler', function () {
	describe('#searchHelper', () => {
		it('should return data for an ES search', async (done) => {
			const esSearchTermsMock = [];

			const esQueryForJbookMock = {};
			const expansionTermsMock = {
				elephant: [
					{ phrase: 'pachyderm', source: 'ML-QE' },
					{ phrase: 'hippo', source: 'ML-QE' },
					{ phrase: 'african', source: 'ML-QE' },
				],
			};

			const req = {
				body: {
					searchText: 'test',
					useElasticSearch: true,
					searchVersion: 1,
					jbookSearchSettings: {
						pocReviewer: 'test',
						sort: [{ id: 'budgetYear', desc: true }],
						budgetTypeAllSelected: true,
						budgetYearAllSelected: true,
						serviceAgencyAllSelected: true,
						primaryReviewerAllSelected: true,
						serviceReviewerAllSelected: true,
						hasKeywordsAllSelected: true,
						primaryClassLabelAllSelected: true,
						sourceTagAllSelected: true,
						reviewStatusAllSelected: true,
					},
					permissions: [
						'View gamechanger',
						'Gamechanger Super Admin',
						'eda Admin',
						'jbook Admin',
						'gamechanger Admin',
						'Gamechanger Admin Lite',
					],
					user: {
						id: '1234567890@mil',
						perms: [],
						cn: 'test.test.1234567890',
						firstName: 'test',
						lastName: 'ching',
					},
				},
			};

			const opts = {
				...constructorOptionsMock,
				searchUtility: {
					getEsSearchTerms() {
						return esSearchTermsMock;
					},
				},
				jbookSearchUtility: {
					gatherExpansionTerms() {
						return expansionTermsMock;
					},
					cleanESResults() {
						return mockCleanESResults;
					},
					getMapping() {},
					getElasticSearchQueryForJBook() {
						return esQueryForJbookMock;
					},
				},
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(elasticSearchResultsMock);
					},
				},
				db: {},
				pdoc: {},
				rdoc: {},
				om: {},
				accomp: {},
				review: {},
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
					EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				},
				gl_contracts: {},
				reports: {},
				redisDB: {},
			};

			const target = new JBookSearchHandler(opts);

			try {
				const actual = await target.searchHelper(req, 'test', true);
				const expected = {
					totalCount: 2,
					docs: [
						{
							budgetType: 'pdoc',
							key_s: 'pdoc#2022#PB#02#0131B89000#21#N/A#2035',
							priorYearAmount: '1.76',
							'P40-77_TOA_PY': '0.756',
							'P40-76_TOA_APY': '1.018',
							allPriorYearsAmount: '1.018',
							budgetYear: '2022',
							appropriationNumber: '2035',
							appropriationTitle: 'Other Procurement, Army',
							budgetActivityNumber: '02',
							budgetActivityTitle: 'Communications and Electronics Equipment',
							budgetLineItem: '0131B89000',
							projectTitle: 'Insider Threat Program - Unit Activity Monitoring',
							p1LineNumber: '54',
							projectMissionDescription:
								"The Insider Threat Program - User Activity Monitoring (UAM) program supports the Army Network Modernization Strategy Line of Effort (LOE) Key Enabler for the Unified Network.  Efforts are aligned to support the Network-Cross Functional Team capability set approach to achieve the network modernization strategy.\n\nFY2022 OPA funds have been moved into OPA BLI 0128B63000.\n\nAll information technology (IT) procurement consists of commercial-off-the-shelf (COTS) solutions.  Quantities and units costs vary by system configuration and site.\n\nUAM operations are conducted in support of the Army's insider threat program.  UAM is the technical capability to observe and record the actions and activities of an individual, at any time, on any device access U.S. Government information in order to detect insider threats and to support authorized investigations.  The OPA program supports three objectives.  First, it provides advanced analytics (including user behavior modeling software) to increase UAM analysis effectiveness and efficiency.  Second, it provides additional system hardware.  Third, it supports the procurement of the next generation Army UAM tool in FY2021.  Advanced analytics procurement includes commercial-off-the-shelf (COTS) hardware, software, and open source software.  This capability will increase UAM analysts effectiveness and efficiency.  The primary objective is to employ COTS technology to identify potential insider threats by monitoring behavior between users, user interactions with data and network capabilities (especially in regards to privileged users), and monitoring user compliance with network and data standards and policies.\n\nNote: Army executes its insider threat program in accordance with Executive Order 13587, Structural Reforms to Improve the Security of Classified Networks and the Responsible Sharing and Safeguarding of Classified Information, (Reference b) dated 7 October 2011; Presidential Memorandum, National Insider Threat Policy and Minimum Standards for Executive Branch Insider Threat Programs, dated 21 November 2012; National Defense Authorization Act for Fiscal Year 2012, Section 922, Insider Threat Detection; and Army Directive 2013-18 (Army Insider Threat Program) dated 31 July 2013.",
							'P40-15_Justification': 'B89000 has no FY2022 funding request.',
							serviceAgency: 'Army',
							uot_department_s: '21',
							uot_agency_s: 'N/A',
							'P40-13_BSA_Title': 'Information Security',
							org_jbook_desc_s: 'Army',
							org_code_s: 'ARMY',
							id: 'pdoc#0131B89000#2022#2035#02#Army',
							keywords: [],
							review_n: {
								id_s: '233211',
								budget_line_item_s: '0131B89000',
								service_agree_label_s: 'No',
								primary_class_label_s: 'Not AI',
								service_ptp_s: 'Space Force',
								service_mp_add_s: 'Unknown',
								review_status_s: 'Finished Review',
								service_poc_title_s: 'poc title',
								service_poc_name_s: 'poc name',
								service_poc_email_s: 'poc email',
								primary_review_notes_s: 'Test Automation Primary Reviewer Notes',
								budget_type_s: 'pdoc',
								budget_year_s: '2022',
								primary_review_status_s: 'Finished Review',
								service_review_status_s: 'Finished Review',
								poc_review_status_s: 'Finished Review',
								primary_reviewer_s: 'Allen, Gregory',
								service_reviewer_s: 'Shaha, Jacob (AI2C)',
								service_review_notes_s: 'Test Automation Secondary Reviewer Notes',
								poc_percentage_attributed_s: '60',
								poc_ai_type_s: 'Speech',
								poc_joint_capability_area_s: 'Logistics (LOG)',
								service_ptp_agree_label_s: 'No',
								doc_id_s: '7939',
								service_poc_org_s: 'poc org',
								poc_phone_number_s: 'poc phone number',
								primary_ptp_s: 'Air Force',
								service_class_label_s: 'AI Enabling',
								createdAt_s: '2021-11-10 13:59:27.983000+00:00',
								updatedAt_s: '2022-01-26 01:14:58.145000+00:00',
								service_secondary_reviewer_s: 'Aha, David NRL (Navy)',
								budget_activity_s: '02',
								domain_task_s: 'Responsible AI',
								alternate_poc_title_s: 'test',
								alternate_poc_name_s: 'test',
								alternate_poc_email_s: 'test',
								alternate_poc_phone_number_s: '1111111',
								alternate_poc_org_s: 'test',
								robotics_system_agree_s: 'Robotic',
								poc_agree_label_s: 'No',
								poc_class_label_s: 'Core AI',
								poc_ptp_s: 'Air Force',
								poc_ptp_agree_label_s: 'No',
								poc_mp_agree_label_s: 'No',
								intelligent_systems_agree_s: 'Yes',
								poc_mp_checklist_s: '{}',
								service_mp_checklist_s: '{}',
								appn_num_s: '2035A',
								agency_s: 'Army',
								jbook_ref_id_s: 'pdoc#0131B89000#2022#2035#02#Army',
								portfolio_name_s: 'AI Inventory',
							},
							hasKeywords: false,
							pageHits: [
								{
									title: 'Budget Activity Title',
									snippet:
										'<em>Communications</em> <em>and</em> <em>Electronics</em> <em>Equipment</em>',
								},
								{
									title: 'Appropriation Title',
									snippet: '<em>Other</em> <em>Procurement</em>, <em>Army</em>',
								},
							],
						},
						{
							budgetType: 'pdoc',
							key_s: 'pdoc#2014#PB#01#0902298J#97#THE JOINT STAFF#0300',
							currentYearAmount: '14.265',
							priorYearAmount: '10.983',
							'P40-77_TOA_PY': '21.794',
							by1BaseYear: '14.265',
							budgetYear: '2014',
							appropriationNumber: '0300',
							appropriationTitle: 'Procurement, Defense-Wide',
							budgetActivityNumber: '01',
							budgetActivityTitle: 'Major Equipment',
							budgetLineItem: '0902298J',
							projectTitle: 'Management Headquarters',
							p1LineNumber: '40',
							projectMissionDescription:
								"Management Headquarters provides the day-to-day financial resources necessary to support Joint Staff operations and the Joint Staff Information Network (JSIN).  JSIN is the network infrastructure (for both classified and unclassified information) that supports the Chairman of the Joint Chiefs of Staff and the Joint Staff enabling collaboration and information-sharing among the Joint Staff, COCOMs, Agencies, and Services.  It provides information management resources and an application required for decision superiority, and empowers the Joint Staff as a knowledge-enabled organization.  The JSIN system accomplishes this through a collection of capabilities and services.  JSIN is comprised of three integrated networks that serve Top Secret (JWICS), Secret (SIPRNET), and combined internal and external unclassified (NIPRNET) collaboration needs.  The major capabilities of JSIN include an office automation suite, collaboration, workflow, information archiving, and document retrieval.  The most critical of these is staff action processing (decision-making) for faster coordination of critical classified and unclassified issues between the CJCS, Joint Staff, and the COCOMs, Services and Agencies.  JSIN's other key services include strategic geographical information services, office automation, collaborative planning, automated message handling, local area networking, electronic mail, financial management, contract management, manpower and personnel management, and record management.  The Joint Staffâs continued service contracts streamline JS IT support processes with 24/7 availability.",
							serviceAgency: 'DEPARTMENT OF THE DEFENSE',
							uot_department_s: '97',
							uot_agency_s: 'THE JOINT STAFF',
							'P40-13_BSA_Title': 'Major Equipment, TJS',
							p4082_toa_by2_d: '18.72',
							p4083_toa_by3_d: '18.623',
							p4084_toa_by4_d: '18.762',
							p4085_toa_by5_d: '19.222',
							p4087_toa_tot_d: '122.369',
							org_jbook_desc_s: 'The Joint Staff (TJS)',
							org_code_s: 'TJS',
							id: 'pdoc#0902298J#2014#0300#01#The Joint Staff (TJS)',
							p5_cost_elements_n: [{ 'P5-14_Item_Title_t': 'Management Headquarters' }],
							p5_res_sum_optional_rows_n: [{ 'P5-16_Item_Title_t': 'Management Headquarters' }],
							keywords: [],
							review_n: {
								id_s: '259253',
								budget_line_item_s: '0902298J',
								service_agree_label_s: 'Yes',
								primary_class_label_s: 'AI Enabled',
								service_mp_add_s: 'Industry',
								review_status_s: 'Partial Review (Service)',
								service_poc_title_s: 'test',
								service_poc_name_s: 'testing email',
								service_poc_email_s: 'gerner_david@bah.com',
								budget_type_s: 'pdoc',
								budget_year_s: '2014',
								primary_review_status_s: 'Partial Review',
								service_review_status_s: 'Partial Review',
								poc_review_status_s: 'Partial Review',
								primary_reviewer_s: 'Allen, Gregory',
								poc_percentage_attributed_s: '11',
								poc_ai_type_s: 'Unstructured Text',
								poc_joint_capability_area_s: 'Logistics (LOG)',
								service_ptp_agree_label_s: 'Yes',
								doc_id_s: '277',
								service_poc_org_s: 'bah',
								poc_phone_number_s: '123-456-0999',
								primary_ptp_s: 'Space Force',
								createdAt_s: '2021-12-04 07:01:33.409000+00:00',
								updatedAt_s: '2022-01-12 00:23:04.527000+00:00',
								service_secondary_reviewer_s: 'Aha, David NRL (Navy)',
								budget_activity_s: '01',
								domain_task_s: 'Natural Language Processing',
								domain_task_secondary_s: 'Mapping',
								alternate_poc_title_s: 'a',
								alternate_poc_name_s: 'a',
								alternate_poc_email_s: 'a',
								alternate_poc_phone_number_s: '12',
								alternate_poc_org_s: 'a',
								robotics_system_agree_s: 'Computer',
								poc_agree_label_s: 'Yes',
								poc_ptp_agree_label_s: 'Yes',
								poc_mp_list_s: 'Dude|ABPRO CORPORATION|ARS ALEUT SERVICES LLC|test 2|test',
								poc_mp_agree_label_s: 'Yes',
								intelligent_systems_agree_s: 'Yes',
								poc_joint_capability_area2_s: 'Deployment & Distribution, Supply',
								poc_joint_capability_area3_s:
									'Force Sustainment, Supplies & Equipment Management, Inventory Management',
								appn_num_s: '0300D',
								agency_s: 'The Joint Staff (TJS)',
								jbook_ref_id_s: 'pdoc#0902298J#2014#0300#01#The Joint Staff (TJS)',
								portfolio_name_s: 'AI Inventory',
							},
							hasKeywords: false,
							pageHits: [
								{ title: 'Budget Activity Title', snippet: '<em>Major</em> <em>Equipment</em>' },
								{
									title: 'Appropriation Title',
									snippet: '<em>Procurement</em>, <em>Defense</em>-<em>Wide</em>',
								},
							],
						},
					],
					serviceAgencyCounts: [
						{ key: 'DEPARTMENT OF THE ARMY', doc_count: 1 },
						{ key: 'DEPARTMENT OF THE DEFENSE', doc_count: 1 },
					],
					expansionDict: {
						elephant: [
							{ phrase: 'pachyderm', source: 'ML-QE' },
							{ phrase: 'hippo', source: 'ML-QE' },
							{ phrase: 'african', source: 'ML-QE' },
						],
					},
				};
				assert.deepStrictEqual(actual, expected);
			} catch (e) {
				assert.fail(e);
			}
			done();
		});

		it('should return data for filters', async (done) => {
			const req = {};

			const mockPGResults = [
				[
					{
						servicereviewer: ['service reviewer'],
						serviceagency: 'service agency',
						servicesecondaryreviewer: ['service secondary reviewer'],
						reviewstatus: [],
					},
				],
			];

			const mockAgencyYearData = [
				[
					{
						budgetyear: ['2020', '2021', '2022'],
						serviceagency: ['Army', 'Air Force'],
					},
					{
						budgetyear: ['2015', '2016'],
						serviceagency: ['Navy', 'Marine Corp'],
					},
				],
			];

			const mockESBudgetYear = {
				body: {
					aggregations: {
						values: {
							buckets: [
								{
									key: {
										budgetYear_s: '2020',
									},
								},
								{
									key: {
										budgetYear_s: '2021',
									},
								},
								{
									key: {
										budgetYear_s: '2022',
									},
								},
							],
						},
					},
				},
			};

			const mockESServiceAgency = {
				body: {
					aggregations: {
						values: {
							buckets: [
								{
									key: {
										serviceAgency_s: 'AF',
									},
								},
								{
									key: {
										serviceAgency_s: 'DCMA',
									},
								},
								{
									key: {
										serviceAgency_s: 'CAAF',
									},
								},
							],
						},
					},
				},
			};

			let esQueryCalled = false;
			const opts = {
				db: {
					jbook: {
						query(query) {
							if (query.indexOf('primary_reviewer') !== -1) {
								return mockPGResults;
							}
							return mockAgencyYearData;
						},
					},
				},
				redisDB: {},
				dataLibrary: {
					queryElasticSearch() {
						if (esQueryCalled) {
							return Promise.resolve(mockESServiceAgency);
						} else {
							esQueryCalled = true;
							return Promise.resolve(mockESBudgetYear);
						}
					},
				},
			};

			const target = new JBookSearchHandler(opts);

			try {
				const actual = await target.getDataForFilters(req, 'test');
				const expected = {
					budgetYearES: ['2020', '2021', '2022'],
					serviceAgencyES: [
						'Air Force (AF)',
						'Defense Contract Management Agency (DCMA)',
						'Court of Appeals for the Armed Forces (CAAF)',
					],
					budgetYear: ['2015', '2016', '2020', '2021', '2022'],
					reviewstatus: [null],
					serviceAgency: ['Air Force', 'Army', 'Navy', null],
					serviceagency: 'service agency',
					servicereviewer: ['service reviewer'],
					servicesecondaryreviewer: ['service secondary reviewer'],
				};
				assert.deepStrictEqual(actual, expected);
			} catch (e) {
				assert.fail(e);
			}
			done();
		});

		it('should return excel data for review status', async (done) => {
			const esSearchTermsMock = [];
			const esQueryForJbookMock = {};
			let resStatus = false;
			let setHeader = 0;
			let resEnd = false;

			const req = { test: true, portfolioName: 'AI ' };
			const res = {
				status() {
					resStatus = true;
				},
				setHeader() {
					setHeader += 1;
				},
				end() {
					resEnd = true;
				},
			};

			const expansionTermsMock = {
				test: [],
			};

			const keywordAssocMock = [[{ rdoc_ids: [1, 2, 3] }]];

			const opts = {
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(elasticSearchResultsMock);
					},
				},
				jbookSearchUtility: {
					cleanESResults() {
						return mockCleanESResults;
					},
					getElasticSearchQueryForJBook() {
						return esQueryForJbookMock;
					},
					gatherExpansionTerms() {
						return Promise.resolve(expansionTermsMock);
					},
					buildSelectQuery() {
						return '';
					},
					buildWhereQuery() {
						return '';
					},
					buildEndQuery() {
						return '';
					},
					getMapping() {},
				},
				keyword_assoc: {
					sequelize: {
						query() {
							return Promise.resolve(keywordAssocMock);
						},
					},
				},
				searchUtility: {
					getJBookPGQueryAndSearchTerms() {
						return 'structured search text';
					},
					getEsSearchTerms() {
						return esSearchTermsMock;
					},
				},
				redisDB: {},
			};

			const target = new JBookSearchHandler(opts);

			try {
				const actual = await target.getExcelDataForReviewStatus(req, 'test', res);
				const expected = {
					results: {
						totalCount: 2,
						docs: [
							{
								budgetType: 'pdoc',
								key_s: 'pdoc#2022#PB#02#0131B89000#21#N/A#2035',
								priorYearAmount: '1.76',
								'P40-77_TOA_PY': '0.756',
								'P40-76_TOA_APY': '1.018',
								allPriorYearsAmount: '1.018',
								budgetYear: '2022',
								appropriationNumber: '2035',
								appropriationTitle: 'Other Procurement, Army',
								budgetActivityNumber: '02',
								budgetActivityTitle: 'Communications and Electronics Equipment',
								budgetLineItem: '0131B89000',
								projectTitle: 'Insider Threat Program - Unit Activity Monitoring',
								p1LineNumber: '54',
								projectMissionDescription:
									"The Insider Threat Program - User Activity Monitoring (UAM) program supports the Army Network Modernization Strategy Line of Effort (LOE) Key Enabler for the Unified Network.  Efforts are aligned to support the Network-Cross Functional Team capability set approach to achieve the network modernization strategy.\n\nFY2022 OPA funds have been moved into OPA BLI 0128B63000.\n\nAll information technology (IT) procurement consists of commercial-off-the-shelf (COTS) solutions.  Quantities and units costs vary by system configuration and site.\n\nUAM operations are conducted in support of the Army's insider threat program.  UAM is the technical capability to observe and record the actions and activities of an individual, at any time, on any device access U.S. Government information in order to detect insider threats and to support authorized investigations.  The OPA program supports three objectives.  First, it provides advanced analytics (including user behavior modeling software) to increase UAM analysis effectiveness and efficiency.  Second, it provides additional system hardware.  Third, it supports the procurement of the next generation Army UAM tool in FY2021.  Advanced analytics procurement includes commercial-off-the-shelf (COTS) hardware, software, and open source software.  This capability will increase UAM analysts effectiveness and efficiency.  The primary objective is to employ COTS technology to identify potential insider threats by monitoring behavior between users, user interactions with data and network capabilities (especially in regards to privileged users), and monitoring user compliance with network and data standards and policies.\n\nNote: Army executes its insider threat program in accordance with Executive Order 13587, Structural Reforms to Improve the Security of Classified Networks and the Responsible Sharing and Safeguarding of Classified Information, (Reference b) dated 7 October 2011; Presidential Memorandum, National Insider Threat Policy and Minimum Standards for Executive Branch Insider Threat Programs, dated 21 November 2012; National Defense Authorization Act for Fiscal Year 2012, Section 922, Insider Threat Detection; and Army Directive 2013-18 (Army Insider Threat Program) dated 31 July 2013.",
								'P40-15_Justification': 'B89000 has no FY2022 funding request.',
								serviceAgency: 'Army',
								uot_department_s: '21',
								uot_agency_s: 'N/A',
								'P40-13_BSA_Title': 'Information Security',
								org_jbook_desc_s: 'Army',
								org_code_s: 'ARMY',
								id: 'pdoc#0131B89000#2022#2035#02#Army',
								keywords: [],
								review_n: {
									id_s: '233211',
									budget_line_item_s: '0131B89000',
									service_agree_label_s: 'No',
									primary_class_label_s: 'Not AI',
									service_ptp_s: 'Space Force',
									service_mp_add_s: 'Unknown',
									review_status_s: 'Finished Review',
									service_poc_title_s: 'poc title',
									service_poc_name_s: 'poc name',
									service_poc_email_s: 'poc email',
									primary_review_notes_s: 'Test Automation Primary Reviewer Notes',
									budget_type_s: 'pdoc',
									budget_year_s: '2022',
									primary_review_status_s: 'Finished Review',
									service_review_status_s: 'Finished Review',
									poc_review_status_s: 'Finished Review',
									primary_reviewer_s: 'Allen, Gregory',
									service_reviewer_s: 'Shaha, Jacob (AI2C)',
									service_review_notes_s: 'Test Automation Secondary Reviewer Notes',
									poc_percentage_attributed_s: '60',
									poc_ai_type_s: 'Speech',
									poc_joint_capability_area_s: 'Logistics (LOG)',
									service_ptp_agree_label_s: 'No',
									doc_id_s: '7939',
									service_poc_org_s: 'poc org',
									poc_phone_number_s: 'poc phone number',
									primary_ptp_s: 'Air Force',
									service_class_label_s: 'AI Enabling',
									createdAt_s: '2021-11-10 13:59:27.983000+00:00',
									updatedAt_s: '2022-01-26 01:14:58.145000+00:00',
									service_secondary_reviewer_s: 'Aha, David NRL (Navy)',
									budget_activity_s: '02',
									domain_task_s: 'Responsible AI',
									alternate_poc_title_s: 'test',
									alternate_poc_name_s: 'test',
									alternate_poc_email_s: 'test',
									alternate_poc_phone_number_s: '1111111',
									alternate_poc_org_s: 'test',
									robotics_system_agree_s: 'Robotic',
									poc_agree_label_s: 'No',
									poc_class_label_s: 'Core AI',
									poc_ptp_s: 'Air Force',
									poc_ptp_agree_label_s: 'No',
									poc_mp_agree_label_s: 'No',
									intelligent_systems_agree_s: 'Yes',
									poc_mp_checklist_s: '{}',
									service_mp_checklist_s: '{}',
									appn_num_s: '2035A',
									agency_s: 'Army',
									jbook_ref_id_s: 'pdoc#0131B89000#2022#2035#02#Army',
									portfolio_name_s: 'AI Inventory',
								},
								hasKeywords: false,
								pageHits: [
									{
										title: 'Budget Activity Title',
										snippet:
											'<em>Communications</em> <em>and</em> <em>Electronics</em> <em>Equipment</em>',
									},
									{
										title: 'Appropriation Title',
										snippet: '<em>Other</em> <em>Procurement</em>, <em>Army</em>',
									},
								],
							},
							{
								budgetType: 'pdoc',
								key_s: 'pdoc#2014#PB#01#0902298J#97#THE JOINT STAFF#0300',
								currentYearAmount: '14.265',
								priorYearAmount: '10.983',
								'P40-77_TOA_PY': '21.794',
								by1BaseYear: '14.265',
								budgetYear: '2014',
								appropriationNumber: '0300',
								appropriationTitle: 'Procurement, Defense-Wide',
								budgetActivityNumber: '01',
								budgetActivityTitle: 'Major Equipment',
								budgetLineItem: '0902298J',
								projectTitle: 'Management Headquarters',
								p1LineNumber: '40',
								projectMissionDescription:
									"Management Headquarters provides the day-to-day financial resources necessary to support Joint Staff operations and the Joint Staff Information Network (JSIN).  JSIN is the network infrastructure (for both classified and unclassified information) that supports the Chairman of the Joint Chiefs of Staff and the Joint Staff enabling collaboration and information-sharing among the Joint Staff, COCOMs, Agencies, and Services.  It provides information management resources and an application required for decision superiority, and empowers the Joint Staff as a knowledge-enabled organization.  The JSIN system accomplishes this through a collection of capabilities and services.  JSIN is comprised of three integrated networks that serve Top Secret (JWICS), Secret (SIPRNET), and combined internal and external unclassified (NIPRNET) collaboration needs.  The major capabilities of JSIN include an office automation suite, collaboration, workflow, information archiving, and document retrieval.  The most critical of these is staff action processing (decision-making) for faster coordination of critical classified and unclassified issues between the CJCS, Joint Staff, and the COCOMs, Services and Agencies.  JSIN's other key services include strategic geographical information services, office automation, collaborative planning, automated message handling, local area networking, electronic mail, financial management, contract management, manpower and personnel management, and record management.  The Joint Staffâs continued service contracts streamline JS IT support processes with 24/7 availability.",
								serviceAgency: 'DEPARTMENT OF THE DEFENSE',
								uot_department_s: '97',
								uot_agency_s: 'THE JOINT STAFF',
								'P40-13_BSA_Title': 'Major Equipment, TJS',
								p4082_toa_by2_d: '18.72',
								p4083_toa_by3_d: '18.623',
								p4084_toa_by4_d: '18.762',
								p4085_toa_by5_d: '19.222',
								p4087_toa_tot_d: '122.369',
								org_jbook_desc_s: 'The Joint Staff (TJS)',
								org_code_s: 'TJS',
								id: 'pdoc#0902298J#2014#0300#01#The Joint Staff (TJS)',
								p5_cost_elements_n: [{ 'P5-14_Item_Title_t': 'Management Headquarters' }],
								p5_res_sum_optional_rows_n: [{ 'P5-16_Item_Title_t': 'Management Headquarters' }],
								keywords: [],
								review_n: {
									id_s: '259253',
									budget_line_item_s: '0902298J',
									service_agree_label_s: 'Yes',
									primary_class_label_s: 'AI Enabled',
									service_mp_add_s: 'Industry',
									review_status_s: 'Partial Review (Service)',
									service_poc_title_s: 'test',
									service_poc_name_s: 'testing email',
									service_poc_email_s: 'gerner_david@bah.com',
									budget_type_s: 'pdoc',
									budget_year_s: '2014',
									primary_review_status_s: 'Partial Review',
									service_review_status_s: 'Partial Review',
									poc_review_status_s: 'Partial Review',
									primary_reviewer_s: 'Allen, Gregory',
									poc_percentage_attributed_s: '11',
									poc_ai_type_s: 'Unstructured Text',
									poc_joint_capability_area_s: 'Logistics (LOG)',
									service_ptp_agree_label_s: 'Yes',
									doc_id_s: '277',
									service_poc_org_s: 'bah',
									poc_phone_number_s: '123-456-0999',
									primary_ptp_s: 'Space Force',
									createdAt_s: '2021-12-04 07:01:33.409000+00:00',
									updatedAt_s: '2022-01-12 00:23:04.527000+00:00',
									service_secondary_reviewer_s: 'Aha, David NRL (Navy)',
									budget_activity_s: '01',
									domain_task_s: 'Natural Language Processing',
									domain_task_secondary_s: 'Mapping',
									alternate_poc_title_s: 'a',
									alternate_poc_name_s: 'a',
									alternate_poc_email_s: 'a',
									alternate_poc_phone_number_s: '12',
									alternate_poc_org_s: 'a',
									robotics_system_agree_s: 'Computer',
									poc_agree_label_s: 'Yes',
									poc_ptp_agree_label_s: 'Yes',
									poc_mp_list_s: 'Dude|ABPRO CORPORATION|ARS ALEUT SERVICES LLC|test 2|test',
									poc_mp_agree_label_s: 'Yes',
									intelligent_systems_agree_s: 'Yes',
									poc_joint_capability_area2_s: 'Deployment & Distribution, Supply',
									poc_joint_capability_area3_s:
										'Force Sustainment, Supplies & Equipment Management, Inventory Management',
									appn_num_s: '0300D',
									agency_s: 'The Joint Staff (TJS)',
									jbook_ref_id_s: 'pdoc#0902298J#2014#0300#01#The Joint Staff (TJS)',
									portfolio_name_s: 'AI Inventory',
								},
								hasKeywords: false,
								pageHits: [
									{ title: 'Budget Activity Title', snippet: '<em>Major</em> <em>Equipment</em>' },
									{
										title: 'Appropriation Title',
										snippet: '<em>Procurement</em>, <em>Defense</em>-<em>Wide</em>',
									},
								],
							},
						],
						serviceAgencyCounts: [
							{ key: 'DEPARTMENT OF THE ARMY', doc_count: 1 },
							{ key: 'DEPARTMENT OF THE DEFENSE', doc_count: 1 },
						],
						expansionDict: {},
					},
					counts: {
						fy22: {
							hasKeywords: {
								army: { total: 0, service: 0, poc: 0, finished: 0 },
								af: { total: 0, service: 0, poc: 0, finished: 0 },
								navy: { total: 0, service: 0, poc: 0, finished: 0 },
								usmc: { total: 0, service: 0, poc: 0, finished: 0 },
								socom: { total: 0, service: 0, poc: 0, finished: 0 },
								osd: { total: 0, service: 0, poc: 0, finished: 0 },
								js: { total: 0, service: 0, poc: 0, finished: 0 },
								other: { total: 0, service: 0, poc: 0, finished: 0 },
								total: 0,
								service: 0,
								poc: 0,
								finished: 0,
							},
							noKeywords: {
								army: { total: 1, service: 1, poc: 0, finished: 0 },
								af: { total: 0, service: 0, poc: 0, finished: 0 },
								navy: { total: 0, service: 0, poc: 0, finished: 0 },
								usmc: { total: 0, service: 0, poc: 0, finished: 0 },
								socom: { total: 0, service: 0, poc: 0, finished: 0 },
								osd: { total: 0, service: 0, poc: 0, finished: 0 },
								js: { total: 0, service: 0, poc: 0, finished: 0 },
								other: { total: 0, service: 0, poc: 0, finished: 0 },
								total: 1,
								service: 1,
								poc: 0,
								finished: 0,
							},
						},
						fy21: {
							hasKeywords: {
								army: { total: 0, service: 0, poc: 0, finished: 0 },
								af: { total: 0, service: 0, poc: 0, finished: 0 },
								navy: { total: 0, service: 0, poc: 0, finished: 0 },
								usmc: { total: 0, service: 0, poc: 0, finished: 0 },
								socom: { total: 0, service: 0, poc: 0, finished: 0 },
								osd: { total: 0, service: 0, poc: 0, finished: 0 },
								js: { total: 0, service: 0, poc: 0, finished: 0 },
								other: { total: 0, service: 0, poc: 0, finished: 0 },
								total: 0,
								service: 0,
								poc: 0,
								finished: 0,
							},
							noKeywords: {
								army: { total: 0, service: 0, poc: 0, finished: 0 },
								af: { total: 0, service: 0, poc: 0, finished: 0 },
								navy: { total: 0, service: 0, poc: 0, finished: 0 },
								usmc: { total: 0, service: 0, poc: 0, finished: 0 },
								socom: { total: 0, service: 0, poc: 0, finished: 0 },
								osd: { total: 0, service: 0, poc: 0, finished: 0 },
								js: { total: 0, service: 0, poc: 0, finished: 0 },
								other: { total: 1, service: 1, poc: 0, finished: 0 },
								total: 1,
								service: 1,
								poc: 0,
								finished: 0,
							},
						},
					},
				};
				assert.deepStrictEqual(actual, expected);
				assert.equal(resStatus, true);
				assert.equal(setHeader, 2);
			} catch (e) {
				assert.fail(e);
			}
			done();
		});
	});
});
