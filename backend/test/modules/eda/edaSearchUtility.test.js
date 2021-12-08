const assert = require('assert');
const EDASearchUtility = require('../../../node_app/modules/eda/edaSearchUtility');
const { constructorOptionsMock } = require('../../resources/testUtility');


describe('EDASearchUtility', function () {

    describe('getElasticsearchPagesQuery', function() {
        it ('should return an ES query for a search with Issue Org, Signature Start Date, and Issue Agency included',
        async (done) => {

            const opts = {
				...constructorOptionsMock
			};

            // includes issue org filter, date filter, issue office agency filter
            const mockBody = {"transformResults":false,"charsPadding":90,"useGCCache":false,"tiny_url":"contractsearch?tiny=52","combinedSearch":"false","edaSearchSettings":{"allOrgsSelected":false,"organizations":["DEPT OF THE ARMY"],"majcoms": {"air force":[],"army":[],"defense":[]},"aggregations":[],"startDate":"2017-06-11","endDate":null,"issueAgency":"Dept of Army","issueOfficeDoDAAC":null,"allYearsSelected":true,"fiscalYears":[],"allDataSelected":true,"contractData":{"pds":false,"syn":false,"none":false},"minObligatedAmount":null,"maxObligatedAmount":null,"contractsOrMods":"both"},"searchVersion":1,"searchText":"army","offset":0,"limit":18,"cloneName":"eda","expansionDict":{"army":[{"phrase":"\"u. s.\"","source":"thesaurus"},{"phrase":"\"united states\"","source":"thesaurus"},{"phrase":"\"ground forces\"","source":"thesaurus"},{"phrase":"regular","source":"thesaurus"},{"phrase":"soldiers","source":"ML-QE"},{"phrase":"troops","source":"ML-QE"}]},"operator":"and","searchTerms":["army"],"parsedQuery":"army","extSearchFields":["*_eda_ext"],"extStoredFields":["*_eda_ext"]};
            const target = new EDASearchUtility(opts);
            try {
                const actual = await target.getElasticsearchPagesQuery(mockBody, 'test user');
                const expected = {"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","*_eda_ext"],"from":0,"size":18,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"army*","boost":15}}},{"query_string":{"query":"army","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"multi_match":{"query":"army","fields":["*_eda_ext"],"operator":"or"}}]}}],"should":[{"multi_match":{"query":"army","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}],"filter":[{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.contract_issue_office_name_eda_ext":"Dept of Army"}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"should":[{"match":{"extracted_data_eda_n.dodaac_org_type_eda_ext":{"query":"DEPT OF THE ARMY"}}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"range":{"extracted_data_eda_n.signature_date_eda_ext_dt":{"gte":"2017-06-11"}}}}}]}}};

                assert.deepStrictEqual(actual, expected);
                done();
            } catch(err) {
                assert.fail(err);
            }
        });

        it('should return an ES query based on the Fiscal Year and EDA Contract Data filters',
        async (done) => {
            const opts = {
				...constructorOptionsMock
			};

            const mockBody = {"transformResults":false,"charsPadding":90,"useGCCache":false,"tiny_url":"contractsearch?tiny=37","combinedSearch":"false","edaSearchSettings":{"allOrgsSelected":true,"organizations":{"airForce":false,"army":false,"dla":false,"marineCorps":false,"navy":false,"estate":false},"aggregations":[],"startDate":null,"endDate":null,"issueAgency":null,"issueOfficeDoDAAC":"","allYearsSelected":false,"fiscalYears":["2017"],"allDataSelected":false,"contractData":{"pds":true,"syn":true,"none":false}},"searchVersion":1,"searchText":"test","offset":0,"limit":18,"cloneName":"eda","expansionDict":{"test":[{"phrase":"mental","source":"thesaurus"},{"phrase":"psychometric","source":"thesaurus"},{"phrase":"check","source":"ML-QE"},{"phrase":"exam","source":"thesaurus"},{"phrase":"examination","source":"thesaurus"},{"phrase":"result","source":"ML-QE"}]},"operator":"and","searchTerms":["test"],"parsedQuery":"test","extSearchFields":["*_eda_ext"],"extStoredFields":["*_eda_ext"]};
            const target = new EDASearchUtility(opts);
            try {
                const actual = await target.getElasticsearchPagesQuery(mockBody, 'test user');
                const expected = {"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","*_eda_ext"],"from":0,"size":18,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"test*","boost":15}}},{"query_string":{"query":"test","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"multi_match":{"query":"test","fields":["*_eda_ext"],"operator":"or"}}]}}],"should":[{"multi_match":{"query":"test","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}],"filter":[{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"should":[{"range":{"extracted_data_eda_n.signature_date_eda_ext_dt":{"gte":"2017","lte":"2018","format":"yyyy"}}}]}}}},{"bool":{"should":[{"bool":{"must":[{"match":{"metadata_type_eda_ext":"pds, syn"}},{"match":{"is_supplementary_data_included_eda_ext_b":true}}]}}]}}]}}};
                assert.deepStrictEqual(actual, expected);
                done();
            } catch(err) {
                assert.fail(err);
            }
        });

        it('should return an ES query based on the Issue Office DoDAAC and Obligated Amount filters',
        async (done) => {
            const opts = {
                ...constructorOptionsMock
            };

            const mockBody = {"transformResults":false,"charsPadding":90,"useGCCache":false,"tiny_url":"contractsearch?tiny=37","combinedSearch":"false","edaSearchSettings":{"allOrgsSelected":true,"organizations":{"airForce":false,"army":false,"dla":false,"marineCorps":false,"navy":false,"estate":false},"aggregations":[],"startDate":null,"endDate":null,"issueAgency":null,"issueOfficeDoDAAC":"N66001","allYearsSelected":true,"fiscalYears":[],"allDataSelected":true,"contractData":{"pds":false,"syn":false,"none":false},"minObligatedAmount":"200000","maxObligatedAmount":null},"searchVersion":1,"searchText":"test","offset":0,"limit":18,"cloneName":"eda","expansionDict":{"test":[{"phrase":"mental","source":"thesaurus"},{"phrase":"psychometric","source":"thesaurus"},{"phrase":"check","source":"ML-QE"},{"phrase":"exam","source":"thesaurus"},{"phrase":"examination","source":"thesaurus"},{"phrase":"result","source":"ML-QE"}]},"operator":"and","searchTerms":["test"],"parsedQuery":"test","extSearchFields":["*_eda_ext"],"extStoredFields":["*_eda_ext"]};

            const target = new EDASearchUtility(opts);
            try {
                const actual = await target.getElasticsearchPagesQuery(mockBody, 'test user');
                const expected =  {"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","*_eda_ext"],"from":0,"size":18,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"test*","boost":15}}},{"query_string":{"query":"test","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"multi_match":{"query":"test","fields":["*_eda_ext"],"operator":"or"}}]}}],"should":[{"multi_match":{"query":"test","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}],"filter":[{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.contract_issue_office_dodaac_eda_ext":"N66001"}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"range":{"extracted_data_eda_n.total_obligated_amount_eda_ext_f":{"gte":"200000"}}}}}]}}};

                assert.deepStrictEqual(actual, expected);
                done();
            } catch(err) {
                assert.fail(err);
            }
        });

        it('should return an ES query based on the contract filter',
        async (done) => {
            const opts = {
                ...constructorOptionsMock
            };

            const mockBody = {"transformResults":false,"charsPadding":90,"useGCCache":false,"tiny_url":"contractsearch?tiny=37","combinedSearch":"false","edaSearchSettings":{"allOrgsSelected":true,"organizations":{"airForce":false,"army":false,"dla":false,"marineCorps":false,"navy":false,"estate":false},"aggregations":[],"startDate":null,"endDate":null,"issueAgency":null,"issueOfficeDoDAAC":null,"allYearsSelected":true,"fiscalYears":[],"allDataSelected":true,"contractData":{"pds":false,"syn":false,"none":false},"minObligatedAmount":null,"maxObligatedAmount":null,"contractsOrMods":"contracts"},"searchVersion":1,"searchText":"test","offset":0,"limit":18,"cloneName":"eda","expansionDict":{"test":[{"phrase":"mental","source":"thesaurus"},{"phrase":"psychometric","source":"thesaurus"},{"phrase":"check","source":"ML-QE"},{"phrase":"exam","source":"thesaurus"},{"phrase":"examination","source":"thesaurus"},{"phrase":"result","source":"ML-QE"}]},"operator":"and","searchTerms":["test"],"parsedQuery":"test","extSearchFields":["*_eda_ext"],"extStoredFields":["*_eda_ext"]};

            const target = new EDASearchUtility(opts);
            try {
                const actual = await target.getElasticsearchPagesQuery(mockBody, 'test user');
                const expected =  {"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","*_eda_ext"],"from":0,"size":18,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"test*","boost":15}}},{"query_string":{"query":"test","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"multi_match":{"query":"test","fields":["*_eda_ext"],"operator":"or"}}]}}],"should":[{"multi_match":{"query":"test","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}],"filter":[{"match":{"mod_identifier_eda_ext":"base_award"}}]}}};

                assert.deepStrictEqual(actual, expected);
                done();
            } catch(err) {
                assert.fail(err);
            }
        });

        it('should return an ES query based on the issue org and majcom filter',
        async (done) => {
            const opts = {
                ...constructorOptionsMock
            };

            const mockBody = {"charsPadding":90,"tiny_url":"contractsearch?tiny=47","combinedSearch":"false","edaSearchSettings":{"contractsOrMods":"both","allOrgsSelected":false,"organizations":["defense"],"aggregations":[],"startDate":null,"endDate":null,"issueAgency":null,"issueOfficeDoDAAC":null,"issueOfficeName":null,"allYearsSelected":true,"fiscalYears":[],"allDataSelected":true,"contractData":{"pds":false,"syn":false,"none":false},"minObligatedAmount":null,"maxObligatedAmount":null,"majcoms":{"air force":[],"army":[],"defense":["information systems"],"navy":[]}},"searchVersion":1,"searchText":"defense","offset":0,"limit":18,"cloneName":"eda","expansionDict":{},"operator":"and","searchTerms":["defense"],"parsedQuery":"defense","extSearchFields":["*_eda_ext"],"extStoredFields":["*_eda_ext"]};

            const target = new EDASearchUtility(opts);
            try {
                const actual = await target.getElasticsearchPagesQuery(mockBody, 'test user');
                const expected =  {"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","*_eda_ext"],"from":0,"size":18,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"defense*","boost":15}}},{"query_string":{"query":"defense","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"multi_match":{"query":"defense","fields":["*_eda_ext"],"operator":"or"}}]}}],"should":[{"multi_match":{"query":"defense","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}],"filter":[{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"should":[{"match":{"extracted_data_eda_n.contract_issue_office_majcom_eda_ext":{"query":"information systems","operator":"AND"}}}]}}}}]}}};

                assert.deepStrictEqual(actual, expected);
                done();
            } catch(err) {
                assert.fail(err);
            }
        });

        it('should return an ES query based on the issue office dodaac and issue office name',
        async (done) => {
            const opts = {
                ...constructorOptionsMock
            };

            const mockBody = {"transformResults":false,"charsPadding":90,"useGCCache":null,"tiny_url":"contractsearch?tiny=4","combinedSearch":"false","edaSearchSettings":{"allOrgsSelected":true,"organizations":[],"aggregations":[],"startDate":null,"endDate":null,"issueAgency":null,"issueOfficeDoDAAC":"FA8075","issueOfficeName":"AFICA/KD","allYearsSelected":true,"fiscalYears":[],"allDataSelected":true,"contractData":{"pds":false,"syn":false,"none":false},"minObligatedAmount":null,"maxObligatedAmount":null,"contractsOrMods":"both","majcoms":{"air force":[],"army":[],"defense":[],"navy":[]}},"searchVersion":1,"searchText":"defense","offset":0,"limit":18,"cloneName":"eda","expansionDict":{},"operator":"and","searchTerms":["defense"],"parsedQuery":"defense","extSearchFields":["*_eda_ext"],"extStoredFields":["*_eda_ext"]};

            const target = new EDASearchUtility(opts);
            try {
                const actual = await target.getElasticsearchPagesQuery(mockBody, 'test user');
                const expected =  {"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","*_eda_ext"],"from":0,"size":18,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"defense*","boost":15}}},{"query_string":{"query":"defense","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"multi_match":{"query":"defense","fields":["*_eda_ext"],"operator":"or"}}]}}],"should":[{"multi_match":{"query":"defense","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}],"filter":[{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.contract_issue_office_dodaac_eda_ext":"FA8075"}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.contract_issue_office_name_eda_ext":"AFICA/KD"}}]}}}}]}}};

                assert.deepStrictEqual(actual, expected);
                done();
            } catch(err) {
                assert.fail(err);
            }
        });

        it('should return an ES query with just majcoms and not their org included',
        async (done) => {
            const opts = {
                ...constructorOptionsMock
            };

            const mockBody =  {"charsPadding":90,"tiny_url":"contractsearch?tiny=47","combinedSearch":"false","edaSearchSettings":{"contractsOrMods":"both","allOrgsSelected":false,"organizations":["defense"],"aggregations":[],"startDate":null,"endDate":null,"issueAgency":null,"issueOfficeDoDAAC":null,"issueOfficeName":null,"allYearsSelected":true,"fiscalYears":[],"allDataSelected":true,"contractData":{"pds":false,"syn":false,"none":false},"minObligatedAmount":null,"maxObligatedAmount":null,"majcoms":{"air force":[],"army":[],"defense":["information systems"],"navy":[]}},"searchVersion":1,"searchText":"defense","offset":0,"limit":18,"cloneName":"eda","expansionDict":{},"operator":"and","searchTerms":["defense"],"parsedQuery":"defense","extSearchFields":["*_eda_ext"],"extStoredFields":["*_eda_ext"]}

            const target = new EDASearchUtility(opts);
            try {
                const actual = await target.getElasticsearchPagesQuery(mockBody, 'test user');
                const expected =  {"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","*_eda_ext"],"from":0,"size":18,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"defense*","boost":15}}},{"query_string":{"query":"defense","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"multi_match":{"query":"defense","fields":["*_eda_ext"],"operator":"or"}}]}}],"should":[{"multi_match":{"query":"defense","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}],"filter":[{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"should":[{"match":{"extracted_data_eda_n.contract_issue_office_majcom_eda_ext":{"query":"information systems","operator":"AND"}}}]}}}}]}}};

                assert.deepStrictEqual(actual, expected);
                done();
            } catch(err) {
                assert.fail(err);
            }
        })
    });

    describe('getElasticSearchStatsQuery', function () {
        it ('should return an ES query for a search with filters included',
        async (done) => {
            const opts = {
                ...constructorOptionsMock
            };
            const mockBody = {"transformResults":false,"charsPadding":90,"useGCCache":false,"tiny_url":"contractsearch?tiny=52","combinedSearch":"false","edaSearchSettings":{"allOrgsSelected":true,"organizations":[],"aggregations":[],"startDate":"2017-06-11","endDate":null,"issueAgency":"Dept of Army","issueOfficeDoDAAC":null,"allYearsSelected":true,"fiscalYears":[],"allDataSelected":true,"contractData":{"pds":false,"syn":false,"none":false},"minObligatedAmount":null,"maxObligatedAmount":null,"contractsOrMods":"both"},"forStats":true,"searchVersion":1,"searchText":"army","offset":0,"limit":10000,"cloneName":"eda","expansionDict":{"army":[{"phrase":"\"u. s.\"","source":"thesaurus"},{"phrase":"\"united states\"","source":"thesaurus"},{"phrase":"\"ground forces\"","source":"thesaurus"},{"phrase":"regular","source":"thesaurus"},{"phrase":"soldiers","source":"ML-QE"},{"phrase":"troops","source":"ML-QE"}]},"operator":"and","searchTerms":["army"],"parsedQuery":"army","extSearchFields":["*_eda_ext"],"extStoredFields":["*_eda_ext"]}

    
            const target = new EDASearchUtility(opts);
            try {
                const actual = await target.getElasticsearchStatsQuery(mockBody, 'test user');
                const expected = {"_source":{"includes":["extracted_data_eda_n","metadata_type_eda_ext"]},"from":0,"size":10000,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"army*","boost":15}}},{"query_string":{"query":"army","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"multi_match":{"query":"army","fields":["*_eda_ext"],"operator":"or"}}]}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.contract_issue_office_name_eda_ext":"Dept of Army"}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"range":{"extracted_data_eda_n.signature_date_eda_ext_dt":{"gte":"2017-06-11"}}}}}],"should":[{"multi_match":{"query":"army","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}]}}};
                assert.deepStrictEqual(actual, expected);
                done();
            } catch(err) {
                assert.fail(err);
            }
        });
    });

    describe('cleanUpEsResults', function () {
        it ('should return cleaned up ES results to frontend', 
        async (done) => {
            const mockResults = {"body":{"took":15,"timed_out":false,"_shards":{"total":3,"successful":3,"skipped":0,"failed":0},"hits":{"total":{"value":1,"relation":"eq"},"max_score":8.036867,"hits":[{"_index":"gc_eda_2021_vendor_org_hierarchy_2","_type":"_doc","_id":"ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db","_score":8.036867,"_source":{"extracted_data_eda_n":{"contract_payment_office_dodaac_eda_ext":"HQ0338","vendor_name_eda_ext":"Booz Allen Hamilton Inc.","contract_issue_office_name_eda_ext":"US ARMY ACC-APG-RTP W911NF","dodaac_org_type_eda_ext":"DEPT OF THE ARMY","vendor_duns_eda_ext":"006928857","contract_admin_office_dodaac_eda_ext":"S3101A","contract_issue_office_dodaac_eda_ext":"W911NF","effective_date_eda_ext_dt":"2017-09-21","contract_admin_agency_name_eda_ext":"DCMA SPRINGFIELD","signature_date_eda_ext_dt":"2017-09-21","modification_number_eda_ext":"Award","vendor_cage_eda_ext":"17038","award_id_eda_ext":"0002","referenced_idv_eda_ext":"W911NF17D0002","vendor_org_hierarchy_eda_n":{"cage_code_eda_ext_n":[{"cage_code_name_eda_ext":"BOOZ ALLEN HAMILTON INC."}],"vendor_org_eda_ext_n":[{"dodaac_name_eda_ext":"US ARMY ACC-APG-RTP W911NF","cgac_eda_ext":"021","dodaac_eda_ext":"W911NF","maj_command_eda_ext":"XD","cgac_agency_name_eda_ext":"DEPT OF THE ARMY","majcom_display_name_eda_ext":"Army Contracting Command"},{"dodaac_name_eda_ext":"DCMA SPRINGFIELD","cgac_eda_ext":"097","dodaac_eda_ext":"S3101A","maj_command_eda_ext":"DR","cgac_agency_name_eda_ext":"DEPARTMENT OF DEFENSE","majcom_display_name_eda_ext":"Defense Finance Accounting Service"},{"dodaac_name_eda_ext":"DFAS COLUMBUS CENTER","cgac_eda_ext":"097","dodaac_eda_ext":"HQ0338","maj_command_eda_ext":"DT","cgac_agency_name_eda_ext":"DEPARTMENT OF DEFENSE","majcom_display_name_eda_ext":"Defense Finance Accounting Service"}]},"total_obligated_amount_eda_ext_f":6472000,"contract_payment_office_name_eda_ext":"DFAS COLUMBUS CENTER"},"pagerank_r":0.00001},"fields":{"metadata_type_eda_ext":["syn"],"syn_json_filename_eda_ext":["EDASYNOPSIS-59C1F3528E3F487DE05400215A9BA3BA-W911NF17D0002-0002-empty-empty-SynopsisEDI-2017-09-22.json"],"pdf_ordernum_eda_ext":["0002"],"pdf_modification_eda_ext":["empty"],"doc_num":["/var//tmp/tmp.zjdFDs8BCT/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"],"dir_location_eda_ext":["eda/piee/unarchive_pdf/pdf_bah_2"],"file_location_eda_ext":["gamechanger/projects/eda/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"],"mod_identifier_eda_ext":["base_award"],"syn_ordernum_eda_ext":["0002"],"doc_type":["/var//tmp/tmp.zjdFDs8BCT/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"],"syn_contract_eda_ext":["W911NF17D0002"],"type":["document"],"title":["W911NF17D0002-0002-empty"],"pdf_filename_eda_ext":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"],"pdf_category_eda_ext":["'historic'"],"pdf_contract_eda_ext":["W911NF17D0002"],"filename":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"],"pdf_grouping_eda_ext":["pdf_log_217"],"syn_category_eda_ext":["'historic'"],"syn_modification_eda_ext":["empty"],"s3_loc_eda_ext":["s3://advana-raw-zone/eda/syn/W911NF17D00020002/EDASYNOPSIS-59C1F3528E3F487DE05400215A9BA3BA-W911NF17D0002-0002-empty-empty-SynopsisEDI-2017-09-22.json"],"id":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf_0"],"page_count":[48]},"inner_hits":{"pages":{"hits":{"total":{"value":13,"relation":"eq"},"max_score":5.867005,"hits":[{"_index":"gc_eda_2021_vendor_org_hierarchy_2","_type":"_doc","_id":"ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db","_nested":{"field":"pages","offset":19},"_score":5.867005,"fields":{"pages.filename":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"]},"highlight":{"pages.p_raw_text":["in <em>Army</em> Regulation (AR) 381-12, Threat Awareness and Reporting \nProgram, Chapter 3."]}},{"_index":"gc_eda_2021_vendor_org_hierarchy_2","_type":"_doc","_id":"ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db","_nested":{"field":"pages","offset":12},"_score":5.5411716,"fields":{"pages.filename":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"]},"highlight":{"pages.p_raw_text":["Intelligence), S3 (<em>Army</em> \nOperations), and S6 (<em>Army</em> Technology)."]}},{"_index":"gc_eda_2021_vendor_org_hierarchy_2","_type":"_doc","_id":"ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db","_nested":{"field":"pages","offset":21},"_score":5.5161047,"fields":{"pages.filename":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"]},"highlight":{"pages.p_raw_text":["W911NF-17-D-0002 \n0002 \nPage 22 of 48 \n \n \nprivileged users, are in IA specialty position and/or act as IA managers must be registered in the ATCTS (<em>Army</em> \nTraining Certification Tracing"]}},{"_index":"gc_eda_2021_vendor_org_hierarchy_2","_type":"_doc","_id":"ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db","_nested":{"field":"pages","offset":6},"_score":5.1518774,"fields":{"pages.filename":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"]},"highlight":{"pages.p_raw_text":["Should an OCI develop during Task Order performance, Contractor personnel \nshall be required to sign a non-disclosure statement.  \n \n1.6  <em>ARMY</em> CONTRACTOR MANPOWER REPORTING SYSTEM"]}},{"_index":"gc_eda_2021_vendor_org_hierarchy_2","_type":"_doc","_id":"ff904a99f190fc7819326a4d3748b3c87760f9a09e826f43772d2d4faad8b7db","_nested":{"field":"pages","offset":7},"_score":4.5171714,"fields":{"pages.filename":["EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf"]},"highlight":{"pages.p_raw_text":["The required information includes: \n \n(1) Unit Identification Code (UIC) of the <em>Army</em> Requiring Activity that would be performing the mission if not \nfor the Contractor: W4G828."]}}]}}}}]}},"statusCode":200,"headers":{"date":"Mon, 14 Jun 2021 23:39:58 GMT","content-type":"application/json; charset=UTF-8","content-length":"6263","connection":"keep-alive","access-control-allow-origin":"*"},"meta":{"context":null,"request":{"params":{"method":"POST","path":"/gc_eda_vendor_org_hierarchy_2/_search","body":"{\"_source\":{\"includes\":[\"pagerank_r\",\"kw_doc_score_r\",\"orgs_rs\",\"*_eda_n*\"]},\"stored_fields\":[\"filename\",\"title\",\"page_count\",\"doc_type\",\"doc_num\",\"ref_list\",\"id\",\"summary_30\",\"keyw_5\",\"p_text\",\"type\",\"p_page\",\"display_title_s\",\"display_org_s\",\"display_doc_type_s\",\"*_eda_ext\"],\"from\":0,\"size\":18,\"track_total_hits\":true,\"query\":{\"bool\":{\"must\":[{\"bool\":{\"should\":[{\"nested\":{\"path\":\"pages\",\"inner_hits\":{\"_source\":false,\"stored_fields\":[\"pages.filename\",\"pages.p_raw_text\"],\"from\":0,\"size\":5,\"highlight\":{\"fields\":{\"pages.filename.search\":{\"number_of_fragments\":0},\"pages.p_raw_text\":{\"fragment_size\":180,\"number_of_fragments\":1}},\"fragmenter\":\"span\"}},\"query\":{\"bool\":{\"should\":[{\"wildcard\":{\"pages.filename.search\":{\"value\":\"army*\",\"boost\":15}}},{\"query_string\":{\"query\":\"army\",\"default_field\":\"pages.p_raw_text\",\"default_operator\":\"and\",\"fuzzy_max_expansions\":100,\"fuzziness\":\"AUTO\"}}]}}}},{\"multi_match\":{\"query\":\"army\",\"fields\":[\"*_eda_ext\"],\"operator\":\"or\"}}]}},{\"nested\":{\"path\":\"extracted_data_eda_n\",\"query\":{\"bool\":{\"must\":[{\"match\":{\"extracted_data_eda_n.contract_issue_office_name_eda_ext\":\"Dept of Army\"}}]}}}},{\"nested\":{\"path\":\"extracted_data_eda_n\",\"query\":{\"range\":{\"extracted_data_eda_n.signature_date_eda_ext_dt\":{\"gte\":\"2017-06-11\"}}}}}],\"should\":[{\"multi_match\":{\"query\":\"army\",\"fields\":[\"keyw_5^2\",\"id^2\",\"summary_30\",\"pages.p_raw_text\"],\"operator\":\"or\"}},{\"rank_feature\":{\"field\":\"pagerank_r\",\"boost\":0.5}},{\"rank_feature\":{\"field\":\"kw_doc_score_r\",\"boost\":0.1}}]}}}","querystring":"","headers":{"user-agent":"elasticsearch-js/7.13.0 (linux 4.19.76-linuxkit-x64; Node.js v14.17.0)","x-elastic-client-meta":"es=7.13.0,js=14.17.0,t=7.13.0,hc=14.17.0","content-type":"application/json","content-length":"1490"},"timeout":30000},"options":{},"id":2},"name":"elasticsearch-js","connection":{"url":"https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/","id":"https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/","headers":{},"deadCount":0,"resurrectTimeout":0,"_openRequests":0,"status":"alive","roles":{"master":true,"data":true,"ingest":true,"ml":false}},"attempts":0,"aborted":false}}
            const mockSearchResults = ['army'];
            const mockUserId = 'test';
            const mockSelectedDocuments = undefined;
            const mockExpansionDict = {"army":[{"phrase":"\"u. s.\"","source":"thesaurus"},{"phrase":"\"united states\"","source":"thesaurus"},{"phrase":"\"ground forces\"","source":"thesaurus"},{"phrase":"regular","source":"thesaurus"},{"phrase":"soldiers","source":"ML-QE"},{"phrase":"troops","source":"ML-QE"}]}
            const mockESIndex = 'gc_eda_vendor_org_hierarchy_2';
            const mockESQuery =  {"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","*_eda_ext"],"from":0,"size":18,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"army*","boost":15}}},{"query_string":{"query":"army","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"multi_match":{"query":"army","fields":["*_eda_ext"],"operator":"or"}}]}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.contract_issue_office_name_eda_ext":"Dept of Army"}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"range":{"extracted_data_eda_n.signature_date_eda_ext_dt":{"gte":"2017-06-11"}}}}}],"should":[{"multi_match":{"query":"army","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}]}}}
            const opts = {
                ...constructorOptionsMock
            };
            const target = new EDASearchUtility(opts);

            try {
                const actual = target.cleanUpEsResults(mockResults, mockSearchResults, mockUserId, mockSelectedDocuments, mockExpansionDict, mockESIndex, mockESQuery);
                const expected =   {"query":{"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","*_eda_ext"],"from":0,"size":18,"track_total_hits":true,"query":{"bool":{"must":[{"bool":{"should":[{"nested":{"path":"pages","inner_hits":{"_source":false,"stored_fields":["pages.filename","pages.p_raw_text"],"from":0,"size":5,"highlight":{"fields":{"pages.filename.search":{"number_of_fragments":0},"pages.p_raw_text":{"fragment_size":180,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"pages.filename.search":{"value":"army*","boost":15}}},{"query_string":{"query":"army","default_field":"pages.p_raw_text","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"multi_match":{"query":"army","fields":["*_eda_ext"],"operator":"or"}}]}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.contract_issue_office_name_eda_ext":"Dept of Army"}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"range":{"extracted_data_eda_n.signature_date_eda_ext_dt":{"gte":"2017-06-11"}}}}}],"should":[{"multi_match":{"query":"army","fields":["keyw_5^2","id^2","summary_30","pages.p_raw_text"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}]}}},"totalCount":1,"docs":[{"metadata_type_eda_ext":"syn","syn_json_filename_eda_ext":"EDASYNOPSIS-59C1F3528E3F487DE05400215A9BA3BA-W911NF17D0002-0002-empty-empty-SynopsisEDI-2017-09-22.json","pdf_ordernum_eda_ext":"0002","pdf_modification_eda_ext":"empty","doc_num":"/var//tmp/tmp.zjdFDs8BCT/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","dir_location_eda_ext":"eda/piee/unarchive_pdf/pdf_bah_2","file_location_eda_ext":"gamechanger/projects/eda/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","mod_identifier_eda_ext":"base_award","syn_ordernum_eda_ext":"0002","doc_type":"/var//tmp/tmp.zjdFDs8BCT/gc/pdf/eda/piee/unarchive_pdf/pdf_bah_2/EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","syn_contract_eda_ext":"W911NF17D0002","type":"document","title":"W911NF17D0002-0002-empty","pdf_filename_eda_ext":"EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pdf_category_eda_ext":"'historic'","pdf_contract_eda_ext":"W911NF17D0002","filename":"EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf","pdf_grouping_eda_ext":"pdf_log_217","syn_category_eda_ext":"'historic'","syn_modification_eda_ext":"empty","s3_loc_eda_ext":"s3://advana-raw-zone/eda/syn/W911NF17D00020002/EDASYNOPSIS-59C1F3528E3F487DE05400215A9BA3BA-W911NF17D0002-0002-empty-empty-SynopsisEDI-2017-09-22.json","id":"EDAPDF-59BE6A9B163C1247E05400215A9BA3BA-W911NF17D0002-0002-empty-empty-PDS-2017-09-21.pdf_0","page_count":48,"topics_s":{},"pageHits":[{"snippet":"Should an OCI develop during Task Order performance, Contractor personnel \nshall be required to sign a non-disclosure statement.  \n \n1.6  <em>ARMY</em> CONTRACTOR MANPOWER REPORTING SYSTEM","pageNumber":7},{"snippet":"The required information includes: \n \n(1) Unit Identification Code (UIC) of the <em>Army</em> Requiring Activity that would be performing the mission if not \nfor the Contractor: W4G828.","pageNumber":8},{"snippet":"Intelligence), S3 (<em>Army</em> \nOperations), and S6 (<em>Army</em> Technology).","pageNumber":13},{"snippet":"in <em>Army</em> Regulation (AR) 381-12, Threat Awareness and Reporting \nProgram, Chapter 3.","pageNumber":20},{"snippet":"W911NF-17-D-0002 \n0002 \nPage 22 of 48 \n \n \nprivileged users, are in IA specialty position and/or act as IA managers must be registered in the ATCTS (<em>Army</em> \nTraining Certification Tracing","pageNumber":22}],"pageHitCount":5,"contract_issue_name_eda_ext":"US ARMY ACC-APG-RTP W911NF","contract_issue_dodaac_eda_ext":"W911NF","vendor_name_eda_ext":"Booz Allen Hamilton Inc.","vendor_duns_eda_ext":"006928857","vendor_cage_eda_ext":"17038","contract_admin_name_eda_ext":"DCMA SPRINGFIELD","contract_admin_office_dodaac_eda_ext":"S3101A","paying_office_name_eda_ext":"DFAS COLUMBUS CENTER","paying_office_dodaac_eda_ext":"HQ0338","modification_eda_ext":"Award","naics_eda_ext":undefined,"award_id_eda_ext":"W911NF17D0002-0002","reference_idv_eda_ext":"W911NF17D0002","signature_date_eda_ext":"2017-09-21","effective_date_eda_ext":"2017-09-21","obligated_amounts_eda_ext":6472000,"issuing_organization_eda_ext":"DEPT OF THE ARMY","contract_issue_majcom_eda_ext":"Army Contracting Command","paying_office_majcom_eda_ext":"Defense Finance Accounting Service","esIndex":"gc_eda_vendor_org_hierarchy_2","keyw_5":"","ref_list":[]}],"doc_types":[],"doc_orgs":[],"searchTerms":["army"],"expansionDict":{"army":[{"phrase":"\"u. s.\"","source":"thesaurus"},{"phrase":"\"united states\"","source":"thesaurus"},{"phrase":"\"ground forces\"","source":"thesaurus"},{"phrase":"regular","source":"thesaurus"},{"phrase":"soldiers","source":"ML-QE"},{"phrase":"troops","source":"ML-QE"}]}}

                assert.deepStrictEqual(actual, expected);
                done();
            } catch(err) {
                assert.fail(err);
            }
        })
    });

    describe('getEDAContractQuery', function () {
        it('should return a query just to retrieve related contract mods',
        async (done) => {
            const award = "1";
            const idv = "2";
            const opts = {
                ...constructorOptionsMock
            };

            const target = new EDASearchUtility(opts);

            try {
                const actual = await target.getEDAContractQuery(award, idv, false, false, 'test user');
                const expected = {"_source":{"includes":["extracted_data_eda_n.modification_number_eda_ext","extracted_data_eda_n.signature_date_eda_ext_dt","extracted_data_eda_n.effective_date_eda_ext_dt"]},"from":0,"size":10000,"track_total_hits":true,"query":{"bool":{"must":[{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.award_id_eda_ext":{"query":"1"}}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.referenced_idv_eda_ext":{"query":"2"}}}]}}}}]}}}
                assert.deepStrictEqual(actual, expected);
                done();
            } catch(err) {
                assert.fail(err);
            }
        });

        it('should return a query just to retrieve a base award and its data',
        async (done) => {
            const award = "1";
            const idv = "2";
            const opts = {
                ...constructorOptionsMock
            };

            const target = new EDASearchUtility(opts);

            try {
                const actual = await target.getEDAContractQuery(award, idv, true, true, 'test user');
                const expected = {"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","*_eda_n*"]},"from":0,"size":10000,"track_total_hits":true,"query":{"bool":{"must":[{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.award_id_eda_ext":{"query":"1"}}}]}}}},{"nested":{"path":"extracted_data_eda_n","query":{"bool":{"must":[{"match":{"extracted_data_eda_n.referenced_idv_eda_ext":{"query":"2"}}}]}}}},{"match":{"mod_identifier_eda_ext":"base_award"}}]}},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","metadata_type_eda_ext"]}
                assert.deepStrictEqual(actual, expected);
                done();
            } catch(err) {
                assert.fail(err);
            }
        });
    });

    describe('splitAwardID', function () {
        it ('should return an id and idv', 
        async (done) => {
            const opts = {
                ...constructorOptionsMock
            };

            const target = new EDASearchUtility(opts);

            try {
                const actual = await target.splitAwardID('abc-123');
                const expected = { id: '123', idv: 'abc'};
                assert.deepStrictEqual(actual, expected);
                done();
            } catch(err) {
                assert.fail(err);
            }
        });
    })
});