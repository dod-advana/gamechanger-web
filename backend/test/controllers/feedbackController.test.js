const assert = require('assert');
const { FeedbackController } = require('../../node_app/controllers/feedbackController');
const { iteratee } = require('underscore');
const { constructorOptionsMock, reqMock, resMock } = require('../resources/testUtility');


describe('feedbackController', function () {
	describe('#sendIntelligentSearchFeedback', () => {
    it('should send feedback from intelligent search', async (done) => {
      try {
        const opts = {};
        const req = {
          ...reqMock,
          body: {"eventName":"intelligent_search_thumbs_up","intelligentSearchTitle":"OPNAVINST 5420.117 RESOURCES AND REQUIREMENTS REVIEW BOARD AND NAVAL CAPABILITIES BOARD","searchText":"artificial intelligence"}
        };
        let resData;
        const res = {
          ...resMock,
          send: (data) => {
            resData = data;
            return data;
          }
        };        
        const target = new FeedbackController(opts);
        target.feedback.create = () => Promise.resolve();
        const actual = await target.sendIntelligentSearchFeedback(req, res);
        assert.strictEqual(resData, 'intelligent_search_thumbs_up feedback sent.')
        done();
      } catch (e) {
        console.log(e);
      }
    });
  });

  describe('#sendQAFeedback', () => {
    it('should send feedback from qa', async (done) => {
      try {
        const opts = {};
        const req = {
          ...reqMock,
          body: {"eventName":"qa_thumbs_up","question":"what is this","answer":"this is a test"}
        };
        let resData;
        const res = {
          ...resMock,
          send: (data) => {
            resData = data;
            return data;
          }
        };        
        const target = new FeedbackController(opts);
        target.feedback.create = () => Promise.resolve();
        const actual = await target.sendIntelligentSearchFeedback(req, res);
        assert.strictEqual(resData, 'qa_thumbs_up feedback sent.')
        done();
      } catch (e) {
        console.log(e);
      }
    })
  });

  describe('#getFeedback', () => {
    it('should get feedback from postgres', async (done) => {
      try {
        const opts = { };
        const req = {
          ...reqMock,
          body: {
            limit: 100, offset: 0, order: [], where: {}
          }
        };
        let resData;
        const res = {
          ...resMock,
          send: (data) => {
            resData = data;
            return data;
          }
        };        
        const target = new FeedbackController(opts);
        target.feedback.findAndCountAll = () => Promise.resolve({count: 4, rows:  ['testing', 'one', 'two', 'three']});
        const actual = await target.getFeedbackData(req, res);
        assert.deepStrictEqual(resData, {totalCount: 4, results: ['testing', 'one', 'two', 'three']})
        done();
      } catch (e) {
        console.log(e);
      }
    })
  });
});