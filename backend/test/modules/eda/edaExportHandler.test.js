const assert = require('assert');
const EDAExportHandler = require('../../../node_app/modules/eda/edaExportHandler');
const { constructorOptionsMock } = require('../../resources/testUtility');

describe('EDAExportHandler', function () {

    describe('#exportHandler', () => {
        it ('should export a file based on search data', 
        async (done) => {
            const mockSearchTerms = [[ 'test', [ 'test' ] ], [ '"defending team"',
            'defence',
            '"defensive measure"',
            '"defense team"',
            '"defense lawyers"',
            'vindication',
            'demurrer',
            'denial',
            '"defense force"',
            '"defence force"',
            '"defence reaction"',
            '"defense reaction"',
            '"defence mechanism"',
            '"defense mechanism"',
            '"defensive structure"',
            '"Defense Department"',
            'DoD',
            '"Department of Defense"',
            '"United States Department of Defense"',
            'refutation' ]];
            const mockQuery = {"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","*_eda_ext"],"from":0,"size":10000,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"test*","boost":15}}},{"query_string":{"query":"test","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"multi_match":{"query":"test","fields":["pdf_filename_eda_ext","pds_contract_eda_ext","pds_filename_eda_ext","pdf_contract_eda_ext","pds_modification_eda_ext"],"operator":"or"}}]}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"should":[{"match":{"extracted_data_eda_n.dodaac_org_type_eda_ext":"army"}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.contract_issue_office_name_eda_ext":"Dept of Army"}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"range":{"extracted_data_eda_n.signature_date_eda_ext_dt":{"gte":"2017-06-10"}}}}}],"should":[{"multi_match":{"query":"test","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}]}}};
            const mockESResults = {"body":{"took":15,"timed_out":false,"_shards":{"total":3,"successful":3,"skipped":0,"failed":0},"hits":{"total":{"value":1,"relation":"eq"},"max_score":10.341896,"hits":[{"_index":"gc_eda_2021_syn_pds","_type":"_doc","_id":"ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db","_score":10.341896,"_source":{"extracted_data_eda_n":{"contract_payment_office_dodaac_eda_ext":"DFAS COLUMBUS CENTER","vendor_name_eda_ext":"Booz Allen Hamilton Inc.","contract_issue_office_name_eda_ext":"US ARMY ACC-APG-RTP W911NF","dodaac_org_type_eda_ext":"army","vendor_duns_eda_ext":"006928857","contract_admin_office_dodaac_eda_ext":"DCMA SPRINGFIELD","contract_issue_office_dodaac_eda_ext":"W911NF","effective_date_eda_ext_dt":"2017-09-21","contract_admin_agency_name_eda_ext":"S3101A","signature_date_eda_ext_dt":"2017-09-21","naics_eda_ext":"541330","modification_number_eda_ext":"Award","vendor_cage_eda_ext":"17038","award_id_eda_ext":"0002","referenced_idv_eda_ext":"W911NF17D0002","total_obligated_amount_eda_ext_f":6472000,"contract_payment_office_name_eda_ext":"HQ0338"},"pagerank_r":0.00001},"fields":{"metadata_type_eda_ext":["pds"],"pds_grouping_eda_ext":["pds_974_filenames_and_size"],"pdf_ordernum_eda_ext":["0002"],"pdf_modification_eda_ext":["empty"],"pds_ordernum_eda_ext":["0002"],"doc_num":["/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"],"dir_location_eda_ext":["eda/piee/unarchive_pdf/pdf_bah_2"],"file_location_eda_ext":["gamechanger/projects/eda/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"],"pds_contract_eda_ext":["W911NF17D0002"],"s3_path_eda_ext":[""],"doc_type":["/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"],"pds_category_eda_ext":["'historic'"],"type":["document"],"title":["W911NF17D0002-0002-empty"],"pdf_filename_eda_ext":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"],"pdf_category_eda_ext":["'historic'"],"pds_filename_eda_ext":["EDAPDS-59C397E8DE995F6AE05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-22.json"],"pdf_contract_eda_ext":["W911NF17D0002"],"filename":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"],"pdf_grouping_eda_ext":["pdf_log_217"],"pds_modification_eda_ext":["empty"],"id":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf_0"],"page_count":[48]},"inner_hits":{"pages":{"hits":{"total":{"value":7,"relation":"eq"},"max_score":6.5625486,"hits":[{"_index":"gc_eda_2021_syn_pds","_type":"_doc","_id":"ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db","_nested":{"field":"pages","offset":11},"_score":6.5625486,"fields":{"pages.filename":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"]},"highlight":{"pages.p_raw_text":["testing, and adjust units under <em>test</em>."]}},{"_index":"gc_eda_2021_syn_pds","_type":"_doc","_id":"ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db","_nested":{"field":"pages","offset":8},"_score":4.782032,"fields":{"pages.filename":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"]},"highlight":{"pages.p_raw_text":["Report \nDI-QCIC-81891 - ACCEPTANCE <em>TEST</em> REPORT (ATR) \nDI-SESS-80255A - FAILURE SUMMARY & ANALYSIS REPORT \nDI-SESS-81628A - RELIABILITY <em>TEST</em> REPORT \nDI-TMSS-80527C - Commercial Off"]}},{"_index":"gc_eda_2021_syn_pds","_type":"_doc","_id":"ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db","_nested":{"field":"pages","offset":15},"_score":4.0893645,"fields":{"pages.filename":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"]},"highlight":{"pages.p_raw_text":["and Demo Support \n \n3.2.14.1 The Contractor shall support scheduled and ad-hoc testing events and demonstrations, which may include events \nsuch as NIE, E15, <em>test</em> events at but not"]}},{"_index":"gc_eda_2021_syn_pds","_type":"_doc","_id":"ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db","_nested":{"field":"pages","offset":29},"_score":3.580061,"fields":{"pages.filename":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"]},"highlight":{"pages.p_raw_text":["This includes a stool sample <em>test</em> for ova and parasites."]}},{"_index":"gc_eda_2021_syn_pds","_type":"_doc","_id":"ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db","_nested":{"field":"pages","offset":31},"_score":2.8506374,"fields":{"pages.filename":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"]},"highlight":{"pages.p_raw_text":["., special \nradio <em>test</em> equipment, when the contractor is responsible for radio testing or repair) \n \n(End of Clause) \n \n5152.225-5910 \nCONTRACTOR HEALTH AND SAFETY \n(DEC 2011) \n \n(a"]}}]}}}}]}},"statusCode":200,"headers":{"date":"Fri, 14 May 2021 00:48:42 GMT","content-type":"application/json; charset=UTF-8","content-length":"5146","connection":"keep-alive","access-control-allow-origin":"*"},"meta":{"context":null,"request":{"params":{"method":"POST","path":"/gc_eda_2021_syn_pds/_search","body":"{\"_source\":{\"includes\":[\"pagerank_r\",\"kw_doc_score_r\",\"orgs_rs\",\"*_eda_n*\"]},\"stored_fields\":[\"filename\",\"title\",\"page_count\",\"doc_type\",\"doc_num\",\"ref_list\",\"id\",\"summary_30\",\"keyw_5\",\"p_text\",\"type\",\"p_page\",\"display_title_s\",\"display_org_s\",\"display_doc_type_s\",\"*_eda_ext\"],\"from\":0,\"size\":10000,\"track_total_hits\":true,\"query\":{\"bool\":{\"must\":[{\"bool\":{\"should\":[{\"nested\":{\"path\":\"pages\",\"inner_hits\":{\"_source\":false,\"stored_fields\":[\"pages.filename\",\"pages.p_raw_text\"],\"from\":0,\"size\":5,\"highlight\":{\"fields\":{\"pages.filename.search\":{\"number_of_fragments\":0},\"pages.p_raw_text\":{\"fragment_size\":180,\"number_of_fragments\":1}},\"fragmenter\":\"span\"}},\"query\":{\"bool\":{\"should\":[{\"wildcard\":{\"pages.filename.search\":{\"value\":\"test*\",\"boost\":15}}},{\"query_string\":{\"query\":\"test\",\"default_field\":\"pages.p_raw_text\",\"default_operator\":\"and\",\"fuzzy_max_expansions\":100,\"fuzziness\":\"AUTO\"}}]}}}},{\"multi_match\":{\"query\":\"test\",\"fields\":[\"pdf_filename_eda_ext\",\"pds_contract_eda_ext\",\"pds_filename_eda_ext\",\"pdf_contract_eda_ext\",\"pds_modification_eda_ext\"],\"operator\":\"or\"}}]}},{\"nested\":{\"path\":\"extracted_data_eda_n\",\"query\":{\"bool\":{\"should\":[{\"match\":{\"extracted_data_eda_n.dodaac_org_type_eda_ext\":\"army\"}}]}}}},{\"nested\":{\"path\":\"extracted_data_eda_n\",\"query\":{\"bool\":{\"must\":[{\"match\":{\"extracted_data_eda_n.contract_issue_office_name_eda_ext\":\"Dept of Army\"}}]}}}},{\"nested\":{\"path\":\"extracted_data_eda_n\",\"query\":{\"range\":{\"extracted_data_eda_n.signature_date_eda_ext_dt\":{\"gte\":\"2017-06-10\"}}}}}],\"should\":[{\"multi_match\":{\"query\":\"test\",\"fields\":[\"keyw_5^2\",\"id^2\",\"summary_30\",\"pages.p_raw_text\"],\"operator\":\"or\"}},{\"rank_feature\":{\"field\":\"pagerank_r\",\"boost\":0.5}},{\"rank_feature\":{\"field\":\"kw_doc_score_r\",\"boost\":0.1}}]}}}","querystring":"","headers":{"user-agent":"elasticsearch-js/7.11.0 (linux 4.19.76-linuxkit-x64; Node.js v10.9.0)","x-elastic-client-meta":"es=7.11.0,js=10.9.0,t=7.11.0,hc=10.9.0","content-type":"application/json","content-length":"1739"},"timeout":30000},"options":{},"id":1},"name":"elasticsearch-js","connection":{"url":"https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/","id":"https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/","headers":{},"deadCount":0,"resurrectTimeout":0,"_openRequests":0,"status":"alive","roles":{"master":true,"data":true,"ingest":true,"ml":false}},"attempts":0,"aborted":false}};
            const mockResults = {"totalCount":1,"docs":[{"metadata_type_eda_ext":"pds","pds_grouping_eda_ext":"pds_974_filenames_and_size","pdf_ordernum_eda_ext":"0002","pdf_modification_eda_ext":"empty","pds_ordernum_eda_ext":"0002","doc_num":"/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","dir_location_eda_ext":"eda/piee/unarchive_pdf/pdf_bah_2","file_location_eda_ext":"gamechanger/projects/eda/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pds_contract_eda_ext":"W911NF17D0002","s3_path_eda_ext":"","doc_type":"/var//tmp/tmp.vf4dXzVgIA/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pds_category_eda_ext":"'historic'","type":"document","title":"W911NF17D0002-0002-empty","pdf_filename_eda_ext":"EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pdf_category_eda_ext":"'historic'","pds_filename_eda_ext":"EDAPDS-59C397E8DE995F6AE05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-22.json","pdf_contract_eda_ext":"W911NF17D0002","filename":"EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pdf_grouping_eda_ext":"pdf_log_217","pds_modification_eda_ext":"empty","id":"EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf_0","page_count":48,"topics_s":[],"pageHits":[{"snippet":"Report \nDI-QCIC-81891 - ACCEPTANCE <em>TEST</em> REPORT (ATR) \nDI-SESS-80255A - FAILURE SUMMARY & ANALYSIS REPORT \nDI-SESS-81628A - RELIABILITY <em>TEST</em> REPORT \nDI-TMSS-80527C - Commercial Off","pageNumber":9},{"snippet":"testing, and adjust units under <em>test</em>.","pageNumber":12},{"snippet":"and Demo Support \n \n3.2.14.1 The Contractor shall support scheduled and ad-hoc testing events and demonstrations, which may include events \nsuch as NIE, E15, <em>test</em> events at but not","pageNumber":16},{"snippet":"This includes a stool sample <em>test</em> for ova and parasites.","pageNumber":30},{"snippet":"., special \nradio <em>test</em> equipment, when the contractor is responsible for radio testing or repair) \n \n(End of Clause) \n \n5152.225-5910 \nCONTRACTOR HEALTH AND SAFETY \n(DEC 2011) \n \n(a","pageNumber":32}],"pageHitCount":5,"contract_issue_name_eda_ext":"US ARMY ACC-APG-RTP W911NF","contract_issue_dodaac_eda_ext":"W911NF","issuing_organization_eda_ext":"Army","vendor_name_eda_ext":"Booz Allen Hamilton Inc.","vendor_duns_eda_ext":"006928857","vendor_cage_eda_ext":"17038","contract_admin_name_eda_ext":"S3101A","contract_admin_office_dodaac_eda_ext":"DCMA SPRINGFIELD","paying_office_name_eda_ext":"HQ0338","paying_office_dodaac_eda_ext":"DFAS COLUMBUS CENTER","modification_eda_ext":"Award","award_id_eda_ext":"0002","reference_idv_eda_ext":"W911NF17D0002","signature_date_eda_ext":"2017-09-21","effective_date_eda_ext":"2017-09-21","obligated_amounts_eda_ext":6472000,"naics_eda_ext":"541330","esIndex":"gc_eda_2021_syn_pds","keyw_5":"","ref_list":[]}],"doc_types":[],"doc_orgs":[],"searchTerms":["test"],"expansionDict":{}};
            const mockPGResults = [{"filename":"EDAPDS-6EC18152407E0E7FE05400215A9BA3BA-FA807514D0016-FA807518F1670-empty-empty-PDS-2018-06-16.json","prod_or_svc":"Services","prod_or_svc_desc":"Labor & ODCs This CLIN is for non-personal research, development, test, and evaluation (RDT&E) TATs within the scope of the DS TATS PWS DT 17-1670, titled “Survivability and Vulnerability Technical Analyses for Navy Warfare Development Command for Operational Readiness, Training, and Experimentation.","li_base":"0002","li_type":"CLIN","obligated_amount":null,"obligated_amount_cin":null,"row_id":"73220198bc8b02f58f219e1eb3725275ea148c50","all_outgoing_counts_pdf_pds_xwalk_only":{"pdf_filename":"EDAPDF-6EEEC741A5B56B97E05400215A9BA3BA-FA807514D0016-FA807518F1670-empty-empty-PDS-2018-06-18.pdf","pds_filename":"EDAPDS-6EC18152407E0E7FE05400215A9BA3BA-FA807514D0016-FA807518F1670-empty-empty-PDS-2018-06-16.json"},"pdf_filename":"EDAPDF-6EEEC741A5B56B97E05400215A9BA3BA-FA807514D0016-FA807518F1670-empty-empty-PDS-2018-06-18.pdf","pds_filename":"EDAPDS-6EC18152407E0E7FE05400215A9BA3BA-FA807514D0016-FA807518F1670-empty-empty-PDS-2018-06-16.json"}]
            let results = '';
            let status = 0;
            let pipe = false
            const opts = {
                ...constructorOptionsMock,
                searchUtility: {
                    getEsSearchTerms() {
                        return mockSearchTerms;
                    }
                },
                edaSearchUtility: {
                    getElasticsearchPagesQuery(body, userId) {
                        return mockQuery
                    },
                    cleanUpEsResults(results, searchTerms) {
                        return mockResults
                    }
                },
                dataLibrary: {
                    queryElasticSearch() {
                        return Promise.resolve(mockESResults)
                    },
                    queryLineItemPostgres() {
                        return Promise.resolve(mockPGResults)
                    }
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
                    }
                },
                constants: {
                    GAMECHANGER_ELASTIC_SEARCH_OPTS: {},
                    EDA_ELASTIC_SEARCH_OPTS: {
                        index: 'test index'
                    }
                }
            }
            const mockReq =  {"body":{"limit":10000,"index":"eda","cloneData":{"id":2,"clone_name":"eda","display_name":"ContractSearch","is_live":true,"url":"contractsearch","permissions_required":true,"clone_to_advana":true,"clone_to_gamechanger":false,"clone_to_sipr":false,"clone_to_jupiter":false,"show_tutorial":false,"show_graph":false,"show_crowd_source":false,"show_feedback":true,"search_module":"eda/edaSearchHandler","export_module":"eda/edaExportHandler","title_bar_module":"eda/edaTitleBarHandler","navigation_module":"eda/edaNavigationHandler","card_module":"eda/edaCardHandler","main_view_module":"eda/edaMainViewHandler","graph_module":null,"config":{"esIndex":"gc_eda"},"createdAt":"2021-03-24T14:33:43.907Z","updatedAt":"2021-03-24T14:33:44.807Z","can_edit":true},"orgFilterString":[],"typeFilterString":[],"selectedDocuments":[],"tiny_url":"https://gamechanger.advana.data.mil/#/gamechanger?tiny=304","edaSearchSettings":{"allOrgsSelected":false,"organizations":{"airForce":false,"army":true,"dla":false,"marineCorps":false,"navy":false,"estate":false},"aggregations":{"officeAgency":false,"vendor":false,"parentIDV":false},"startDate":"2017-06-10","endDate":null,"issueAgency":"Dept of Army"},"searchText":"test","format":"csv","cloneName":"eda"},"permissions":"Webapp Super Admin"};
            const mockRes = {
                contentType(text) {
                    contentType = text;
                },
                status(num) {
                    status = num;
                    return this;
                },
                send(){}
            };

            const target = new EDAExportHandler(opts);
            const expectedStatus = 200;
            const expectedResults = 'Filename,Contract Number,Page Count,Issuing Organization,,,CLINS,Prod or Svc,Description,Base,Type,Obligated Amount,Obligated Amount CIN,Row IDEDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf,W911NF17D0002-0002,48,Army';
            try {
                await target.exportHelper(mockReq, mockRes, 'test');
                assert.strictEqual(status, expectedStatus);
                assert.strictEqual(pipe, true);
                assert.strictEqual(results, expectedResults);
                done();
            } catch(err) {
                assert.fail(err);
            }

        })
    })
})