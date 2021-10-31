const assert = require('assert');
const SearchHandler = require('../../../node_app/modules/base/searchHandler');
const { constructorOptionsMock, reqMock } = require('../../resources/testUtility');

describe('SearchHandler', function () {
	let redisData = {gamechanger_f740af5d2e2819eeb0063eca402fcce8: JSON.stringify({test: ['test']})};

	const opts = {
		...constructorOptionsMock,
		redisDB: {
			get(redisKey) {
				return Promise.resolve(redisData[redisKey]);
			},
			set(redisKey, data) {
				if (redisKey.includes('time')) {
					data = 'test';
				}
				redisData[redisKey] = data;
				return Promise.resolve(true);
			},
			select(id) {}
		},
		gc_history: {
			create(obj) {}
		}
	};

	describe('#search', () => {
		it('it should return the body passed to it sense it is the base and doesnt do a search', async () => {

			const target = new SearchHandler(opts);
			const searchHelperSpy = jest.spyOn(target, 'searchHelper');

			try {
				const actual = await target.search('test', 0, 20, {test: 'test'}, 'gamechanger', [], 'test', true);
				const expected = {cloneName: 'gamechanger', limit: 20, offset: 0, searchText: 'test', test: 'test'};
				assert.deepStrictEqual(actual, expected);
				expect(searchHelperSpy).toHaveBeenCalledWith({body: expected, permissions: []}, 'test', true);
			} catch (e) {
				assert.fail(e);
			} finally {
				searchHelperSpy.mockRestore();
			}
		});
	});

	describe('#getCachedResults', () => {
		it('it should return fake cached results based off the request info', async () => {

			const target = new SearchHandler(opts);

			const req = {
				...reqMock,
				body: {
					searchText: 'test',
					offest: 0,
					limit: 20,
					options: {test: 'test'},
					cloneName: 'gamechanger',
					permissions: [],
					userId: 'test'
				}
			};

			const historyRec = {
				user_id: 'Test',
				searchText: 'test',
				startTime: new Date().toISOString(),
				request_bod: req.body,
				search_version: 1,
				clone_name: 'gamechanger',
				showTutorial: false
			};
			const cloneSpecificObject = {};

			try {
				const actual = await target.getCachedResults(req, historyRec, cloneSpecificObject, 'Test', true);
				const expected = {isCached: true, test: ['test'], timeSinceCache: NaN};
				assert.deepStrictEqual(actual, expected);
			} catch (e) {
				assert.fail(e);
			}
		});
	});

	describe('#storeCachedResults', () => {
		it('it should store fake cached results based off the request info', async () => {

			const target = new SearchHandler(opts);

			const req = {
				...reqMock,
				body: {
					searchText: 'test',
					offest: 0,
					limit: 20,
					options: {test: 'test'},
					cloneName: 'gamechanger',
					permissions: [],
					userId: 'test'
				}
			};

			const historyRec = {
				user_id: 'Test',
				searchText: 'test',
				startTime: new Date().toISOString(),
				request_bod: req.body,
				search_version: 1,
				clone_name: 'gamechanger',
				showTutorial: false
			};
			const cloneSpecificObject = {test: 'test'};
			const searchResults = ['Test'];

			try {
				await target.storeCachedResults(req, historyRec, searchResults, cloneSpecificObject, 'Test');
				const expected = {gamechanger_2f5d59d9ad2d29d94175d8b9bcd70e9e: '["Test"]', 'gamechanger_2f5d59d9ad2d29d94175d8b9bcd70e9e:time': 'test', gamechanger_f740af5d2e2819eeb0063eca402fcce8: '{"test":["test"]}'};
				assert.deepStrictEqual(redisData, expected);
			} catch (e) {
				assert.fail(e);
			}
		});
	});

});
