const searchHelperExpected = {
  "query":{
     "_source":{
        "includes":[
           "pagerank_r",
           "kw_doc_score_r",
           "orgs_rs",
           "topics_s"
        ]
     },
     "stored_fields":[
        "filename",
        "title",
        "page_count",
        "doc_type",
        "doc_num",
        "ref_list",
        "id",
        "summary_30",
        "keyw_5",
        "p_text",
        "type",
        "p_page",
        "display_title_s",
        "display_org_s",
        "display_doc_type_s",
        "is_revoked_b",
        "access_timestamp_dt",
        "publication_date_dt",
        "crawler_used_s",
        "download_url_s",
        "source_page_url_s",
        "source_fqdn_s"
     ],
     "from":0,
     "size":5,
     "aggregations":{
        "doc_type_aggs":{
           "terms":{
              "field":"display_doc_type_s",
              "size":10000
           }
        },
        "doc_org_aggs":{
           "terms":{
              "field":"display_org_s",
              "size":10000
           }
        }
     },
     "track_total_hits":true,
     "query":{
        "bool":{
           "must":[
              
           ],
           "should":[
              {
                 "nested":{
                    "path":"paragraphs",
                    "inner_hits":{
                       "_source":false,
                       "stored_fields":[
                          "paragraphs.page_num_i",
                          "paragraphs.filename",
                          "paragraphs.par_raw_text_t"
                       ],
                       "from":0,
                       "size":5,
                       "highlight":{
                          "fields":{
                             "paragraphs.filename.search":{
                                "number_of_fragments":0
                             },
                             "paragraphs.par_raw_text_t":{
                                "fragment_size":180,
                                "number_of_fragments":1
                             }
                          },
                          "fragmenter":"span"
                       }
                    },
                    "query":{
                       "bool":{
                          "should":[
                             {
                                "wildcard":{
                                   "paragraphs.filename.search":{
                                      "value":"*shark*",
                                      "boost":50
                                   }
                                }
                             },
                             {
                                "query_string":{
                                   "query":"shark",
                                   "default_field":"paragraphs.par_raw_text_t",
                                   "default_operator":"and",
                                   "fuzzy_max_expansions":100,
                                   "fuzziness":"AUTO"
                                }
                             }
                          ],
                          "minimum_should_match":1
                       }
                    }
                 }
              },
              {
                 "multi_match":{
                    "query":"shark",
                    "fields":[
                       "id^5",
                       "title.search^15",
                       "keyw_5"
                    ],
                    "operator":"AND",
                    "type":"best_fields"
                 }
              }
           ],
           "minimum_should_match":1,
           "filter":[
              {
                 "term":{
                    "is_revoked_b":"false"
                 }
              }
           ]
        }
     },
     "highlight":{
        "fields":{
           "title.search":{
              "fragment_size":180,
              "number_of_fragments":1
           },
           "keyw_5":{
              "fragment_size":180,
              "number_of_fragments":1
           },
           "id":{
              "fragment_size":180,
              "number_of_fragments":1
           }
        },
        "fragmenter":"span"
     }
  },
  "totalCount":61,
  "docs":[
     {
        "display_title_s":"ATP 57 THE SUBMARINE SEARCH AND RESCUE MANUAL",
        "display_org_s":"NATO",
        "crawler_used_s":"nato_stanag",
        "doc_num":"57",
        "summary_30":"This chapter provides information and guidance for Surface Forces and other Submarine Escape Medical considerations for survivors from submarine escape or rescue are of paramount The DMTT may require additional medical equipment to support the DISSUB survivors. Casualties in the T1/C1 category require both lifesaving immediate medical treatment and Note: T2/C1 casualties may receive urgently required non-life saving medical treatment prior Once DISSUB rescue seat is clear ROV transits to surface for recovery aboard the MOSHIP. Once DISSUB rescue seat is clear ADS disconnects safety line before transits to surface for",
        "is_revoked_b":false,
        "doc_type":"ATP",
        "title":"THE SUBMARINE SEARCH AND RESCUE MANUAL",
        "type":"document",
        "keyw_5":"submarine escape, rescue seat, rescue elements, purpose train, rescue element, debris clearing, surface forces, search assets, rescue phase, recompression chamber",
        "filename":"ATP 57.pdf",
        "access_timestamp_dt":"2021-02-16T20:13:27",
        "id":"ATP 57.pdf_0",
        "display_doc_type_s":"Document",
        "publication_date_dt":"2017-10-25T00:00:00",
        "page_count":275,
        "topics_s":[
           "submarine",
           "recompression",
           "escape",
           "edition version",
           "rescue"
        ],
        "pageHits":[
           {
              "snippet":"6.23 . MARINE ANIMAL HAZARDS The main animal hazard faced by survivors will be pelagic sharks .These animals may abrade exposed areas or bite causing extensive injury .",
              "pageNumber":154
           }
        ],
        "pageHitCount":1,
        "esIndex":"gamechanger",
        "ref_list":[
           
        ],
        "search_mode":"Intelligent Search"
     },
     {
        "display_title_s":"H.R. 406 To prohibit the sale of shark parts, and for other purposes.",
        "display_org_s":"Congress",
        "crawler_used_s":"legislation_pubs",
        "doc_num":"406",
        "summary_30":"To prohibit the sale of shark parts, and for other purposes. To prohibit the sale of shark parts, and for other purposes. shall be treated as an act prohibited by section 307 of",
        "is_revoked_b":false,
        "doc_type":"H.R.",
        "title":"To prohibit the sale of shark parts, and for other purposes.",
        "type":"document",
        "source_page_url_s":"https://www.govinfo.gov/app/details/BILLS-117hr406ih/",
        "keyw_5":"traditional fisheries, shark parts, shark, federal license, congress assembled, carchariniformes",
        "filename":"H.R 406 IH 117th.pdf",
        "access_timestamp_dt":"2021-04-08T18:53:44",
        "download_url_s":"https://www.govinfo.gov/content/pkg/BILLS-117hr406ih/pdf/BILLS-117hr406ih.pdf",
        "id":"H.R 406 IH 117th.pdf_0",
        "display_doc_type_s":"Legislation",
        "publication_date_dt":"2021-01-21T00:00:00",
        "source_fqdn_s":"www.govinfo.gov",
        "page_count":3,
        "topics_s":[
           "shark",
           "essed",
           "dskbc",
           "bills",
           "verdate"
        ],
        "pageHits":[
           {
              "snippet":"PROHIBITION ON SALE OF <em>SHARK</em> PARTS .6 ( a ) PROHIBITION.",
              "pageNumber":1
           },
           {
              "snippet":"—In this section : 22 ( 1 ) <em>SHARK</em>.",
              "pageNumber":2
           },
           {
              "snippet":"—The term ‘ ‘ <em>shark</em> part ’ ’ 3 means any <em>shark</em> or raw , dried , or otherwise proc - 4 essed detached part of a <em>shark</em> .5 Æ Ver Date Sep 11 2014 22:19 Feb 11 , 2021 Jkt 019200 PO 00000",
              "pageNumber":3
           },
           {
              "title":"Keywords",
              "snippet":"<em>shark</em>"
           }
        ],
        "pageHitCount":3,
        "esIndex":"gamechanger",
        "ref_list":[
           
        ]
     },
     {
        "display_title_s":"H.R. 59 To amend the Magnuson-Stevens Fishery Conservation and Management Act to provide flexibility for fishery managers and stability for fishermen, and for other purposes.",
        "display_org_s":"Congress",
        "crawler_used_s":"legislation_pubs",
        "doc_num":"59",
        "summary_30":"To amend the Magnuson-Stevens Fishery Conservation and Management Act Study of limited access privilege programs for mixed-use fisheries. Miscellaneous amendments relating to fishery management councils. eries Management Act, the Secretary shall establish and",
        "is_revoked_b":false,
        "doc_type":"H.R.",
        "title":"To amend the Magnuson-Stevens Fishery Conservation and Management Act to provide flexibility for fishery managers and stability for fishermen, and for other purposes.",
        "type":"document",
        "source_page_url_s":"https://www.govinfo.gov/app/details/BILLS-117hr59ih/",
        "keyw_5":"stock assessment, management act, short title, shark feeding, increasing flexibility, federal regulations, eligible vessels, cooperative research, account fishing, —section 303a",
        "filename":"H.R 59 IH 117th.pdf",
        "access_timestamp_dt":"2021-04-08T18:53:44",
        "download_url_s":"https://www.govinfo.gov/content/pkg/BILLS-117hr59ih/pdf/BILLS-117hr59ih.pdf",
        "id":"H.R 59 IH 117th.pdf_0",
        "display_doc_type_s":"Legislation",
        "ref_list":[
           "Title 50",
           "Title 13"
        ],
        "publication_date_dt":"2021-01-04T00:00:00",
        "source_fqdn_s":"www.govinfo.gov",
        "page_count":60,
        "topics_s":[
           "fishery",
           "dskbc",
           "bills",
           "fisheries",
           "fishery management"
        ],
        "pageHits":[
           {
              "snippet":"development quota .Sec . 406 .Reallocation of certain unused harvest allocation .Sec . 407 .Community Development Quota Program panel voting procedures .Sec . 408 .Prohibition on <em>shark</em>",
              "pageNumber":2
           },
           {
              "snippet":"—It is unlawful — ’ ’ ; and 9 ( 2 ) by adding at the end the following : 10 ‘ ‘ ( b ) PROHIBITION ON <em>SHARK</em> FEEDING OFF COAST 11 OF FLORIDA . — 12 ‘ ‘ ( 1 ) IN GENERAL.",
              "pageNumber":50
           },
           {
              "snippet":"‘ ‘ ( ii ) presenting food or any other sub - 16 stance to a <em>shark</em> for the purpose of feed - 17 ing or attracting <em>sharks</em> .18 ‘ ‘ ( 3 ) EXCEPTION.",
              "pageNumber":51
           },
           {
              "title":"Keywords",
              "snippet":"<em>shark</em> feeding"
           }
        ],
        "pageHitCount":3,
        "esIndex":"gamechanger"
     },
     {
        "display_title_s":"ATP 57 THE SUBMARINE SEARCH AND RESCUE MANUAL",
        "display_org_s":"NATO",
        "crawler_used_s":"nato_stanag",
        "doc_num":"57",
        "summary_30":"This chapter provides information and guidance for Surface Forces and other Submarine Escape Medical considerations for survivors from submarine escape or rescue are of paramount The DMTT may require additional medical equipment to support the DISSUB survivors. Casualties in the T1/C1 category require both lifesaving immediate medical treatment and Note: T2/C1 casualties may receive urgently required non-life saving medical treatment prior Once DISSUB rescue seat is clear ROV transits to surface for recovery aboard the MOSHIP. Once DISSUB rescue seat is clear ADS disconnects safety line before transits to surface for",
        "is_revoked_b":false,
        "doc_type":"ATP",
        "title":"THE SUBMARINE SEARCH AND RESCUE MANUAL",
        "type":"document",
        "source_page_url_s":"https://nso.nato.int/nso/nsdd/ListPromulg.html",
        "keyw_5":"submarine escape, rescue seat, rescue elements, purpose train, rescue element, debris clearing, surface forces, search assets, rescue phase, recompression chamber",
        "filename":"ATP 57.pdf",
        "access_timestamp_dt":"2021-02-16T20:13:27",
        "download_url_s":"https://nso.nato.int/nso/zPublic/ap/PROM/ATP-57%20EDC%20V3%20E.pdf",
        "id":"ATP 57.pdf_0",
        "display_doc_type_s":"Document",
        "publication_date_dt":"2017-10-25T00:00:00",
        "source_fqdn_s":"nso.nato.int",
        "page_count":275,
        "topics_s":[
           "submarine",
           "recompression",
           "escape",
           "edition version",
           "rescue"
        ],
        "pageHits":[
           {
              "snippet":"MARINE ANIMAL HAZARDS The main animal hazard faced by survivors will be pelagic <em>sharks</em> .These animals may abrade exposed areas or bite causing extensive injury .",
              "pageNumber":154
           }
        ],
        "pageHitCount":1,
        "esIndex":"gamechanger",
        "ref_list":[
           
        ]
     },
     {
        "display_title_s":"NAVMED P-5010-4 CHAPTER 4 RECREATIONAL WATER FACILITIES",
        "display_org_s":"US Navy Medicine",
        "crawler_used_s":"navy_med_pubs",
        "doc_num":"P-5010-4",
        "summary_30":"Many factors affect the disinfection process in swimming pools and spas: the pH of the water, Swimming pool and spa water must always be maintained at proper disinfectant All dissolved matter added to pool or spa water contributes to TDS, including salt, user The basic purpose of a bacterial quality indicator of water in a swimming pool or spa is to",
        "is_revoked_b":false,
        "doc_type":"NAVMED",
        "title":"CHAPTER 4 RECREATIONAL WATER FACILITIES",
        "type":"document",
        "source_page_url_s":"https://www.med.navy.mil/directives/Pages/Publications.aspx",
        "keyw_5":"total alkalinity, swimming pools, aquatic facilities, water temperature, aquatic venue, water surface, water samples, water quality, water features, water",
        "filename":"NAVMED P-5010-4.pdf",
        "access_timestamp_dt":"2021-04-08T18:52:58",
        "download_url_s":"https://www.med.navy.mil/directives/Pub/5010-4.pdf",
        "id":"NAVMED P-5010-4.pdf_0",
        "display_doc_type_s":"Manual",
        "ref_list":[
           "Title 15",
           "Title 16",
           "TB MED 575",
           "AF 32",
           "MCO 1700.39"
        ],
        "publication_date_dt":"2020-06-30T00:00:00",
        "source_fqdn_s":"www.med.navy.mil",
        "page_count":142,
        "topics_s":[
           "swimming",
           "aquatic venues",
           "recreational",
           "aquatic",
           "water"
        ],
        "pageHits":[
           {
              "snippet":"Two persons qualified in the use of firearms and provided with weapons and binoculars should be posted as <em>shark</em> guards in the ship ’s superstructure or other location with a clear view",
              "pageNumber":101
           }
        ],
        "pageHitCount":1,
        "esIndex":"gamechanger"
     },
     {
        "display_title_s":"AFMAN 11-246V7 AIRCRAFT DEMONSTRATIONS (SAILPLANES)",
        "display_org_s":"Dept. of the Air Force",
        "crawler_used_s":"air_force_pubs",
        "doc_num":"11-246V7",
        "summary_30":"provide procedures for Air Force performance of sailplane aircraft demonstrations. Unit commanders may not authorize profile changes for actual demonstrations. demonstration pilots to practice and evaluate proposed profile changes prior to submitting a",
        "is_revoked_b":false,
        "doc_type":"AFMAN",
        "title":"AIRCRAFT DEMONSTRATIONS (SAILPLANES)",
        "type":"document",
        "source_page_url_s":"https://www.e-publishing.af.mil/Product-Index/#/?view=pubs&orgID=10141&catID=1&series=-1&modID=449&tabID=131",
        "keyw_5":"profile includes, straight line, rolling turn, records created, quarter cloverleaves, pull-push-pull humpty, positive snap, mark kelly, major command-level, high-speed flyover",
        "filename":"AFMAN 11-246V7.pdf",
        "access_timestamp_dt":"2021-03-10T15:52:33",
        "download_url_s":"https://static.e-publishing.af.mil/production/1/af_a3/publication/afman11-246v7/afman11-246v7.pdf",
        "id":"AFMAN 11-246V7.pdf_0",
        "display_doc_type_s":"Document",
        "ref_list":[
           "AFI 11-246V7",
           "AFI 11-209",
           "AFI 33-360",
           "AFMAN 11-246",
           "AFMAN 33-363",
           "AFMAN 11-246V7",
           "AFMAN 11-2Sailplane",
           "AFMAN 11-2SailplaneV1",
           "AFPD 1",
           "AFM 11-24",
           "AFM 33-36",
           "AF 847"
        ],
        "publication_date_dt":"2020-03-27T00:00:00",
        "source_fqdn_s":"www.e-publishing.af.mil",
        "page_count":17,
        "topics_s":[
           "afman",
           "profile",
           "aerobatic",
           "demonstration",
           "sailplane"
        ],
        "pageHits":[
           {
              "snippet":"Reverse <em>shark</em> 's tooth .A3.4.9 . Repositioning as necessary to High speed pass",
              "pageNumber":15
           }
        ],
        "pageHitCount":1,
        "esIndex":"gamechanger"
     }
  ],
  "doc_types":[
     {
        "key":"Document",
        "doc_count":49
     },
     {
        "key":"Title",
        "doc_count":5
     },
     {
        "key":"Instruction",
        "doc_count":2
     },
     {
        "key":"Legislation",
        "doc_count":2
     },
     {
        "key":"Manual",
        "doc_count":1
     },
     {
        "key":"Order",
        "doc_count":1
     }
  ],
  "doc_orgs":[
     {
        "key":"US Marine Corps",
        "doc_count":26
     },
     {
        "key":"US Army",
        "doc_count":14
     },
     {
        "key":"Dept. of the Air Force",
        "doc_count":7
     },
     {
        "key":"United States Code",
        "doc_count":5
     },
     {
        "key":"Congress",
        "doc_count":3
     },
     {
        "key":"US Navy",
        "doc_count":2
     },
     {
        "key":"Executive Branch",
        "doc_count":1
     },
     {
        "key":"NATO",
        "doc_count":1
     },
     {
        "key":"US Navy Medicine",
        "doc_count":1
     }
  ],
  "searchTerms":[
     "shark"
  ],
  "expansionDict":{
     "shark":[
        {
           "phrase":"\"killer whale\"",
           "source":"ML-QE"
        },
        {
           "phrase":"\"whale boat\"",
           "source":"ML-QE"
        }
     ]
  },
  "qaResults":{
     "question":"",
     "answers":[],
     "qaContext": [],
     "params": {}
  },
  "entities":[
     
  ],
  "totalEntities":0,
  "topics":[
     
  ],
  "totalTopics":0
}

const createRecObjectExpected = { historyRec:
   { user_id: 'test',
     clone_name: 'gamechanger',
     search: '',
     startTime: null,
     numResults: -1,
     endTime: null,
     hadError: false,
     tiny_url: undefined,
     cachedResult: false,
     search_version: undefined,
     request_body:
     { cloneName: 'gamechanger',
       searchText: 'shark',
       offset: 0,
       options:     
         { searchType: 'Keyword',
           orgFilterString: [],
           transformResults: false,
           charsPadding: 90,
           typeFilterString: [],
           showTutorial: false,
           useGCCache: false,
           tiny_url: 'gamechanger?tiny=282',
           searchFields: { initial: { field: null, input: '' } },
           accessDateFilter: [ null, null ],
           publicationDateFilter: [ null, null ],
           publicationDateAllTime: true,
           includeRevoked: false,
           limit: 6,
           searchVersion: 1 
         } 
       },
     searchText: 'shark',
     orgFilters: '[]',
     searchType: undefined,
     showTutorial: false },
 cloneSpecificObject:
   { orgFilterString: [],
     searchFields: [],
     includeRevoked: undefined },
 clientObj: { esClientName: 'gamechanger', esIndex: 'gamechanger' } };

 const enrichSearchResultsExpected = {
   "entities":[],
   "qaResults":{
      "answers":[],
      "question":"",
      "qaContext": [],
      "params": {}
   },
   "topics":[
      
   ],
   "totalEntities":0,
   "totalTopics":0,
   "sentenceResults": []
}

const elasticSearchDocDataExpected = {
   _source: {
      includes: ['pagerank_r', 'kw_doc_score_r', 'pagerank', 'topics_s']
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
      'type',
      'pagerank_r',
      'display_title_s',
      'display_org_s',
      'display_doc_type_s'
   ],
   track_total_hits: true,
   size: 100,
   query: {
      bool: {
         must: {
            terms: {id: 'test_ID'}
         }
      }
   }
}

module.exports = {searchHelperExpected, createRecObjectExpected, enrichSearchResultsExpected, elasticSearchDocDataExpected};
