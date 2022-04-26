const assert = require('assert');
const { constructorOptionsMock } = require('../resources/testUtility');
const {
  AppStatsController,
} = require('../../node_app/controllers/appStatsController');

describe('AppStatsController', function () {
  describe('#getAppStats', () => {
    jest.setTimeout(10000);
    const opts = {
      ...constructorOptionsMock,
      dataApi: {},
      searchUtility: {},
      constants: {
        MATOMO_DB_CONFIG: {
          host: 'fakeHost',
          user: 'fakeUser',
          password: 'fakePassword',
          database: 'fakeDatabase',
        },
      },
    };

    it('should get application stats', async (done) => {
      let mysqlParams = null;
      const mySqlConnection = {
        connect: () => {
          connectCalled = true;
        },
        end: () => {
          endCalled = true;
        },
        query: (query, params, callback) => {
          queries.push(query);
          let response = expectedResponses[counter];
          counter++;
          callback(null, response, []);
        },
      };
      const tmpOpts = {
        ...opts,
        mysql_lib: {
          createConnection: (params) => {
            mysqlParams = params;
            return mySqlConnection;
          },
        },
      };

      let connectCalled = false;
      let endCalled = false;
      let queries = [];
      let counter = 0;
      let expectedResponses = [
        [{ avg_search_count: 13 }],
        [
          {
            search: 'fakeSearch1',
            count: 32,
          },
          {
            search: 'fakeSearch2',
            count: 16,
          },
        ],
      ];

      const req = {
        body: {
          isClone: false,
          cloneData: { clone_name: 'gamechanger' },
          internalUsers: [],
          daysAgo: 7,
        },
      };
      let passedCode = null;
      let sentData = null;
      const res = {
        status: (code) => {
          passedCode = code;
          return {
            send: (data) => {
              sentData = data;
            },
          };
        },
      };

      const expectedData = {
        daysBack: 7,
        data: {
          avgSearchesPerSession: 13,
          blacklist: [],
          cloneData: { clone_name: 'gamechanger' },
          excluding: [],
          topSearches: {
            topN: 10,
            data: [
              { search: 'fakeSearch1', count: 32 },
              { search: 'fakeSearch2', count: 16 },
            ],
          },
        },
      };

      const target = new AppStatsController(tmpOpts);
      await target.getAppStats(req, res);
      assert.equal(passedCode, 200);
      assert.deepEqual(sentData, expectedData);
      done();
    });

    it('should get application stats with clone data', async (done) => {
      let constants = {
        MATOMO_DB_CONFIG: {
          host: 'fakeHost',
          user: 'fakeUser',
          password: 'fakePassword',
          database: 'fakeDatabase',
        },
      };
      let mysqlParams = null;
      let connectCalled = false;
      let endCalled = false;
      let queries = [];
      let counter = 0;
      let expectedResponses = [
        [{ avg_search_count: 13 }],
        [
          {
            search: 'fakeSearch1',
            count: 32,
          },
          {
            search: 'fakeSearch2',
            count: 16,
          },
        ],
      ];
      const mySqlConnection = {
        connect: () => {
          connectCalled = true;
        },
        end: () => {
          endCalled = true;
        },
        query: (query, params, callback) => {
          queries.push(query);
          let response = expectedResponses[counter];
          counter++;
          callback(null, response, []);
        },
      };
      const mysql_lib = {
        createConnection: (params) => {
          mysqlParams = params;
          return mySqlConnection;
        },
      };
      const tmpOpts = { 
        ...opts,
        mysql_lib, 
        constants
      };
      const req = {
        body: {
          isClone: true,
          cloneData: { clone_name: 'test' },
          internalUsers: [],
          daysAgo: 7,
        },
      };
      let passedCode = null;
      let sentData = null;
      const res = {
        status: (code) => {
          passedCode = code;
          return {
            send: (data) => {
              sentData = data;
            },
          };
        },
      };

      const expectedData = {
        data: {
          avgSearchesPerSession: 13,
          blacklist: [],
          cloneData: { clone_name: 'test' },
          excluding: [],
          topSearches: {
            data: [
              { count: 32, search: 'fakeSearch1' },
              { count: 16, search: 'fakeSearch2' },
            ],
            topN: 10,
          },
        },
        daysBack: 7,
      };
      const target = new AppStatsController(tmpOpts);
      await target.getAppStats(req, res);
      assert.equal(passedCode, 200);
      assert.deepEqual(sentData, expectedData);
      done();
    });

    it('should get application stats with internal users to exclude', async (done) => {
      let mysqlParams = null;
      let connectCalled = false;
      let endCalled = false;
      let queries = [];
      let counter = 0;
      let expectedResponses = [
        [{ avg_search_count: 13 }],
        [
          {
            search: 'fakeSearch1',
            count: 32,
          },
          {
            search: 'fakeSearch2',
            count: 16,
          },
        ],
      ];
      const mySqlConnection = {
        connect: () => {
          connectCalled = true;
        },
        end: () => {
          endCalled = true;
        },
        query: (query, params, callback) => {
          queries.push(query);
          let response = expectedResponses[counter];
          counter++;
          callback(null, response, []);
        },
      };
      const mysql_lib = {
        createConnection: (params) => {
          mysqlParams = params;
          return mySqlConnection;
        },
      };
      const tmpOpts = { 
        ...opts,
        mysql_lib, 
      };
      const req = {
        body: {
          isClone: false,
          cloneData: { clone_name: 'game_changer' },
          internalUsers: ['testUser'],
          daysAgo: 7,
        },
      };
      let passedCode = null;
      let sentData = null;
      const res = {
        status: (code) => {
          passedCode = code;
          return {
            send: (data) => {
              sentData = data;
            },
          };
        },
      };

      const expectedData = {
        data: {
          avgSearchesPerSession: 13,
          blacklist: [],
          cloneData: { clone_name: 'game_changer' },
          excluding: ['testUser'],
          topSearches: {
            data: [
              { count: 32, search: 'fakeSearch1' },
              { count: 16, search: 'fakeSearch2' },
            ],
            topN: 10,
          },
        },
        daysBack: 7,
      };
      const target = new AppStatsController(tmpOpts);
      await target.getAppStats(req, res);
      assert.equal(passedCode, 200);
      assert.deepEqual(sentData, expectedData);
      done();
    });

    it('should get application stats with queries to exclude for top queries', async (done) => {

      let mysqlParams = null;
      let connectCalled = false;
      let endCalled = false;
      let queries = [];
      let counter = 0;
      let expectedResponses = [
        [{ avg_search_count: 13 }],
        [
          {
            search: 'fakeSearch1',
            count: 32,
          },
          {
            search: 'fakeSearch2',
            count: 16,
          },
        ],
      ];
      let blacklist = ['testQuery'];
      const mySqlConnection = {
        connect: () => {
          connectCalled = true;
        },
        end: () => {
          endCalled = true;
        },
        query: (query, params, callback) => {
          queries.push(query);
          let response = expectedResponses[counter];
          counter++;
          callback(null, response, []);
        },
      };
      const mysql_lib = {
        createConnection: (params) => {
          mysqlParams = params;
          return mySqlConnection;
        },
      };
      const tmpOpts = { 
        ...opts,
        mysql_lib,  
      };

      const req = {
        body: {
          isClone: false,
          cloneData: { clone_name: 'gamechanger' },
          internalUsers: ['testUser'],
          daysAgo: 7,
          blacklist: blacklist,
        },
      };
      let passedCode = null;
      let sentData = null;
      const res = {
        status: (code) => {
          passedCode = code;
          return {
            send: (data) => {
              sentData = data;
            },
          };
        },
      };

      const expectedData = {
        daysBack: 7,
        data: {
          avgSearchesPerSession: 13,
          blacklist: ['testQuery'],
          cloneData: { clone_name: 'gamechanger' },
          excluding: ['testUser'],
          topSearches: {
            topN: 10,
            data: [
              { search: 'fakeSearch1', count: 32 },
              { search: 'fakeSearch2', count: 16 },
            ],
          },
        },
      };

      const target = new AppStatsController(tmpOpts);
      await target.getAppStats(req, res);
      assert.equal(passedCode, 200);
      assert.deepEqual(sentData, expectedData);
      done();
    });
  });

  describe('#getDocumentUsageData', () => {
    jest.setTimeout(10000);
    const opts = {
      ...constructorOptionsMock,
			dataApi: {
        queryElasticSearch: (esClientName, esIndex, esQuery, userId) => (
          {body: {
            hits: {
              hits: [{"_index":"gamechanger_sans_abbreviations","_type":"_doc","_id":"1","_score":1,"_source":{"display_title_s":"Test Title","filename":"test.pdf"}}]
            }
          }
        })
			},
			// add searchUtility
      constants: {
        MATOMO_DB_CONFIG: {
          host: 'fakeHost',
          user: 'fakeUser',
          password: 'fakePassword',
          database: 'fakeDatabase',
        },
      },
    };

    it('should get Document Usage Data stats', async (done) => {
      let mysqlParams = null;
      const mySqlConnection = {
        connect: () => {
          connectCalled = true;
        },
        end: () => {
          endCalled = true;
        },
        query: (query, params, callback) => {
          queries.push(query);
          let response = expectedResponses[counter];
          counter++;
          callback(null, response, []);
        },
      };
      const tmpOpts = {
        ...opts,
        mysql_lib: {
          createConnection: (params) => {
            mysqlParams = params;
            return mySqlConnection;
          },
        },
      };

      let connectCalled = false;
      let endCalled = false;
      let queries = [];
      let counter = 0;
      const req = {
        body: {
          isClone: false,
          cloneData: { clone_name: 'gamechanger' }
        },
        query: {
          daysBack: 3, 
          offset: 0, 
          filters: [], 
          sorting: [], 
          pageSize: 1
        },
        get: (header) => ('test')
      };
      let passedCode = null;
      let sentData = null;
      const res = {
        status: (code) => {
          passedCode = code;
          return {
            send: (data) => {
              sentData = data;
            },
          };
        },
      };

      const expectedData = {"data": [{"document": "Test Title", "idvisits": "1", "searches": "test (1)", "user_count": 4, "user_list": "6718A3B744177B8A, 71339E3B3F85E3B4, 8E0BCAF48C3D73DD, DD80B9C66CADA1DA", "visit_count": 1}]};
      const target = new AppStatsController(tmpOpts);
      target.getSearchesAndPdfs = (connection) => [{"search_doc":"test","idvisit":1,"server_time":"2021-03-23T13:16:28.000Z"}, {"search_doc":"PDFViewer - test.pdf - gamechanger","idvisit":1,"server_time":"2021-03-23T13:17:28.000Z"}];
      target.queryDocumentUsageData = connection => [{"document":"PDFViewer - test.pdf - gamechanger","idvisits":"1","visit_count":1,"user_count":4,"user_list":"6718A3B744177B8A, 71339E3B3F85E3B4, 8E0BCAF48C3D73DD, DD80B9C66CADA1DA"}]
      await target.getDocumentUsageData(req, res);
      assert.equal(passedCode, 200);
      assert.deepEqual(sentData, expectedData);
      done();
    });
  });

  // describe('#getSearchPdfMapping', () => {
  //   jest.setTimeout(10000);
  //   const opts = {
  //     ...constructorOptionsMock,
	// 		dataApi: {
  //       queryElasticSearch: (esClientName, esIndex, esQuery, userId) => (
  //         {body: {
  //           hits: {
  //             hits: [{"_index":"gamechanger_sans_abbreviations","_type":"_doc","_id":"1","_score":1,"_source":{"display_title_s":"Test Title","filename":"test.pdf"}}]
  //           }
  //         }
  //       })
	// 		},
	// 		// add searchUtility
  //     constants: {
  //       MATOMO_DB_CONFIG: {
  //         host: 'fakeHost',
  //         user: 'fakeUser',
  //         password: 'fakePassword',
  //         database: 'fakeDatabase',
  //       },
  //     },
  //   };

  //   it('should get users searches', async (done) => {
  //     let mysqlParams = null;
  //     const mySqlConnection = {
  //       connect: () => {
  //         connectCalled = true;
  //       },
  //       end: () => {
  //         endCalled = true;
  //       },
  //       query: (query, params, callback) => {
  //         queries.push(query);
  //         let response = expectedResponses[counter];
  //         counter++;
  //         callback(null, response, []);
  //       },
  //     };
  //     const tmpOpts = {
  //       ...opts,
  //       mysql_lib: {
  //         createConnection: (params) => {
  //           mysqlParams = params;
  //           return mySqlConnection;
  //         },
  //       },
  //     };

  //     let connectCalled = false;
  //     let endCalled = false;
  //     let queries = [];
  //     let counter = 0;
  //     const req = {
  //       query: {
  //         startDate: '2022-03-14+04:00', 
  //         endDate:'2022-03-17+19:21'
  //       },
  //       get: (header) => ('test')
  //     };
  //     let passedCode = null;
  //     let sentData = null;
  //     const res = {
  //       status: (code) => {
  //         passedCode = code;
  //         return {
  //           send: (data) => {
  //             sentData = data;
  //           },
  //         };
  //       },
  //     };

  //     const expectedData = {
  //       daysBack: 3,
  //       data: [
  //         {
  //           idvisit: 1,
  //           idvisitor: '007',
  //           idaction_name: 1,
  //           document: 'test.pdf',
  //           documenttime: new Date('2022-01-01T01:05:00'),
  //           clone_name: 'gamechanger',
  //           search_cat: 'GAMECHANGER_gamechanger_combined',
  //           value: 'test 1',
  //           searchtime: new Date('2022-01-01T01:00:00'),
  //           action: 'Search',
  //           visited: undefined,
  //           display_title_s: 'Test Title',
  //           filename: 'test.pdf'
  //         },
  //         {
  //           idvisit: 1,
  //           idaction_name: 4,
  //           search_cat: 'GAMECHANGER_gamechanger_combined',
  //           value: 'test 1',
  //           searchtime:new Date('2022-01-01T01:05:00'),
  //           document: 'test.pdf',
  //           idvisitor: '007',
  //           action: 'ExportDocument',
  //           display_title_s: 'Test Title',
  //           filename: 'test.pdf'
  //         },
  //         {
  //           idvisit: 1,
  //           idaction_name: 3,
  //           search_cat: 'GAMECHANGER_gamechanger_combined',
  //           value: 'test 1',
  //           searchtime: new Date('2022-01-01T01:06:00'),
  //           document: 'test.pdf',
  //           idvisitor: '007',
  //           action: 'Favorite',
  //           display_title_s: 'Test Title',
  //           filename: 'test.pdf'
  //         },
  //         {
  //           idvisit: 2,
  //           idaction_name: 2,
  //           search_cat: 'GAMECHANGER_gamechanger_combined',
  //           value: 'test 2',
  //           searchtime: new Date('2022-01-01T02:00:00'),
  //           idvisitor: '007',
  //           action: 'Search',
  //           display_title_s: undefined
  //         }
  //       ]
  //     };
  //     const target = new AppStatsController(tmpOpts);
  //     target.querySearches = (connection) =>  [
  //       {
  //         idvisit: 1,
  //         idaction_name: 1,
  //         search_cat: 'GAMECHANGER_gamechanger_combined',
  //         value: 'test 1',
  //         searchtime: new Date('2022-01-01T01:00:00'),
  //         idvisitor: '007',
  //         action: 'Search'
  //       },
  //       {
  //         idvisit: 2,
  //         idaction_name: 2,
  //         search_cat: 'GAMECHANGER_gamechanger_combined',
  //         value: 'test 2',
  //         searchtime: new Date('2022-01-01T02:00:00'),
  //         idvisitor: '007',
  //         action: 'Search'
  //       }
  //     ];
  //     target.queryPdfOpend = (connection) => [
  //       {
  //         idvisit: 1,
  //         idvisitor: '007',
  //         idaction_name: 6,
  //         document: 'test.pdf',
  //         documenttime: new Date('2022-01-01T01:05:00'),
  //         clone_name: 'gamechanger'
  //       }
  //     ];
  //     target.queryEvents = (connection) =>[
  //       {
  //         idvisit: 1,
  //         idaction_name: 4,
  //         search_cat: 'GAMECHANGER_gamechanger_combined',
  //         value: 'test 1',
  //         searchtime: new Date('2022-01-01T01:05:00'),
  //         document: 'test.pdf',
  //         idvisitor: '007',
  //         action: 'ExportDocument'
  //       },
  //       {
  //         idvisit: 1,
  //         idaction_name: 3,
  //         search_cat: 'GAMECHANGER_gamechanger_combined',
  //         value: 'test 2',
  //         searchtime: new Date('2022-01-01T01:06:00'),
  //         document: 'test.pdf',
  //         idvisitor: '007',
  //         action: 'Favorite'
  //       }
  //     ];

  //     await target.getSearchPdfMapping(req, res);
  //     assert.equal(passedCode, 200);
  //     assert.deepEqual(sentData, expectedData);
  //     done();
  //   });
  // });

  describe('#getUserAggregations', () => {
    jest.setTimeout(10000);
    const opts = {
      ...constructorOptionsMock,
			// add searchUtility
      constants: {
        MATOMO_DB_CONFIG: {
          host: 'fakeHost',
          user: 'fakeUser',
          password: 'fakePassword',
          database: 'fakeDatabase',
        },
      },
      user: {
        findAll(){
          return [{user_id:1,organization:'test'}]
        }
      },
      sparkMD5:{
        hash(id){
          return id
        }
      }
    };

    it('should get users aggregated searches', async (done) => {
      let mysqlParams = null;
      const mySqlConnection = {
        connect: () => {
          connectCalled = true;
        },
        end: () => {
          endCalled = true;
        },
        query: (query, params, callback) => {
          queries.push(query);
          let response = expectedResponses[counter];
          counter++;
          callback(null, response, []);
        },
      };
      const tmpOpts = {
        ...opts,
        mysql_lib: {
          createConnection: (params) => {
            mysqlParams = params;
            return mySqlConnection;
          },
        },
      };

      let connectCalled = false;
      let endCalled = false;
      let queries = [];
      let counter = 0;
      const req = {
        query: {
          startDate: '2022-03-14+04:00', 
          endDate:'2022-03-17+19:21'
        },
        get: (header) => ('test')
      };
      let passedCode = null;
      let sentData = null;
      const res = {
        status: (code) => {
          passedCode = code;
          return {
            send: (data) => {
              sentData = data;
            },
          };
        },
      };

      const expectedData = {
        users: [
         {
          user_id:1,
          docs_opened:5,
          searches_made:10,
          opened: [
            'test3.pdf',
            'test4.pdf',
            'test5.pdf',
            'test6.pdf',
            'test7.pdf',
          ],
          ExportDocument: [
            'test2.pdf',
            'test3.pdf',
            'test4.pdf',
            'test5.pdf',
            'test6.pdf',
          ],
          Favorite: [
            'test2.pdf',
            'test3.pdf',
            'test4.pdf',
            'test5.pdf',
            'test6.pdf',
          ],
          last_search: new Date(2022,4,26,0,0,0),
          last_search_formatted: '2022-04-26 00:00',
          org:'test'
         }
        ],
        cards:{
          unique_users:5,
          total_searches:20
        }
      };
      const target = new AppStatsController(tmpOpts);
      target.getUserVisitorID = ([],connection) => [
        {idvisitor:'007',user_id:1}
      ]
      target.getUserAggregationsQuery = (connection) =>  [
        {
          idvisitor:'007',
          docs_opened:5,
          searches_made:10,
          last_search: new Date(2022,4,26,0,0,0),
          last_search_formatted: '2022-04-26 00:00'
        },
      ];
      target.queryPdfOpend = (connection) => [
        {
          idvisit: 1,
          idvisitor: '007',
          idaction_name: 6,
          document: 'test1.pdf',
          clone_name: 'gamechanger'
        },
        {
          idvisit: 1,
          idvisitor: '007',
          idaction_name: 6,
          document: 'test2.pdf',
          clone_name: 'gamechanger'
        },
        {
          idvisit: 1,
          idvisitor: '007',
          idaction_name: 6,
          document: 'test3.pdf',
          clone_name: 'gamechanger'
        },
        {
          idvisit: 1,
          idvisitor: '007',
          idaction_name: 6,
          document: 'test4.pdf',
          clone_name: 'gamechanger'
        },
        {
          idvisit: 1,
          idvisitor: '007',
          idaction_name: 6,
          document: 'test5.pdf',
          clone_name: 'gamechanger'
        },
        {
          idvisit: 1,
          idvisitor: '007',
          idaction_name: 6,
          document: 'test6.pdf',
          clone_name: 'gamechanger'
        },
        {
          idvisit: 1,
          idvisitor: '007',
          idaction_name: 6,
          document: 'test7.pdf',
          clone_name: 'gamechanger'
        },
      ];
      target.getUserDocuments = (connection) =>[
        {
          idvisitor:'007',
          idvisit:1,
          action:'Favorite',
          document:'test1.pdf'
        },
        {
          idvisitor:'007',
          idvisit:1,
          action:'Favorite',
          document:'test2.pdf'
        },
        {
          idvisitor:'007',
          idvisit:1,
          action:'Favorite',
          document:'test3.pdf'
        },
        {
          idvisitor:'007',
          idvisit:1,
          action:'Favorite',
          document:'test4.pdf'
        },
        {
          idvisitor:'007',
          idvisit:1,
          action:'Favorite',
          document:'test5.pdf'
        },
        {
          idvisitor:'007',
          idvisit:1,
          action:'Favorite',
          document:'test6.pdf'
        },
        {
          idvisitor:'007',
          idvisit:1,
          action:'ExportDocument',
          document:'test1.pdf'
        },
        {
          idvisitor:'007',
          idvisit:1,
          action:'ExportDocument',
          document:'test2.pdf'
        },
        {
          idvisitor:'007',
          idvisit:1,
          action:'ExportDocument',
          document:'test3.pdf'
        },
        {
          idvisitor:'007',
          idvisit:1,
          action:'ExportDocument',
          document:'test4.pdf'
        },
        {
          idvisitor:'007',
          idvisit:1,
          action:'ExportDocument',
          document:'test5.pdf'
        },
        {
          idvisitor:'007',
          idvisit:1,
          action:'ExportDocument',
          document:'test6.pdf'
        }
      ];
      target.getCardAggregationQuery = (connection) =>[
        {
          unique_users:5,
          total_searches:20
        }
      ];

      await target.getUserAggregations(req, res);
      console.log(sentData);
      assert.equal(passedCode, 200);
      assert.deepEqual(sentData, expectedData);
      done();
    });
  });
});


