const assert = require('assert');
const { SearchController } = require('../../node_app/controllers/searchController');
const { constructorOptionsMock, reqMock, resMock } = require('../resources/testUtility');

const documentSearchRes = require('../resources/mockResponses/documentSearchRes.js');
const documentSearchES = require('../resources/mockResponses/documentSearchES.json');
const documentSearchSentenceTransformer = require('../resources/mockResponses/documentSearchSentenceTransformer.js');
const docSearchOneID = require('../resources/mockResponses/documentSearchOneID.json');


describe('searchController', function () {

	describe('#convertTinyURL', () => {
		let searchUrls = [{
			id: 1,
			url: 'Test'
		}];
		const opts = {
			...constructorOptionsMock,
			dataApi: {},
			gcSearchURLs: {
				findOne(data) {
					let returnUrl = {};
					searchUrls.forEach(url => {
						if (url.id === data.where.id) {
							returnUrl = url;
						}
					});

					return Promise.resolve(returnUrl);
				}
			}
		};

		it('returns a url for the provided id', async () => {
			const target = new SearchController(opts);

			const req = {
				...reqMock,
				body: {
					url: '1'
				}
			};

			let resCode;
			let resMsg;

			const res = {
				status(code) {
					resCode = code;
					return this;
				},
				send(msg) {
					resMsg = msg;
					return this;
				}
			};

			try {
				await target.convertTinyURL(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {url: 'Test'};
			assert.deepStrictEqual(resMsg, expected);
		});
	});

	describe('#shortenSearchURL', () => {
		let searchUrls = [];
		const opts = {
			...constructorOptionsMock,
			dataApi: {},
			gcSearchURLs: {
				findOrCreate(data) {
					let returnUrl = {
						id: 1,
						url: data.defaults.url
					};
					searchUrls.push(returnUrl);
					return Promise.resolve([returnUrl, true]);
				}
			}
		};

		it('save a tiny url', async () => {
			const target = new SearchController(opts);

			const req = {
				...reqMock,
				body: {
					url: '/testing'
				}
			};

			let resCode;
			let resMsg;

			const res = {
				status(code) {
					resCode = code;
					return this;
				},
				send(msg) {
					resMsg = msg;
					return this;
				}
			};

			try {
				await target.shortenSearchURL(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {tinyURL: 1};
			assert.deepStrictEqual(resMsg, expected);
		});
	});
});
