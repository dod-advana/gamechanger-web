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
});
