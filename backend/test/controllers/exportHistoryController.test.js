const assert = require('assert');
const { ExportHistoryController } = require('../../node_app/controllers/exportHistoryController');
const { constructorOptionsMock, reqMock } = require('../resources/testUtility');

describe('ExportHistoryController', function () {

	describe('#getExportHistory', () => {
		it('it should return the export history for a user', async () => {
			const exportHistoryList = [{
				id: 1, user_id: '27d1ca9e10b731476b7641eae2710ac0', download_request_body: {}, search_response_metadata: {}
			}];
			const opts = {
				...constructorOptionsMock,
				dataApi: {},
				exportHistory: {
					findAll(data) {
						const returnList = [];
						exportHistoryList.forEach(history => {
							if (history.user_id === data.where.user_id) {
								returnList.push(history);
							}
						});
						return Promise.resolve(returnList);
					}
				}
			};
			const target = new ExportHistoryController(opts);

			const req = {
				...reqMock,
				body: {
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
				await target.getExportHistory(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = [{download_request_body: {}, id: 1, search_response_metadata: {}, user_id: '27d1ca9e10b731476b7641eae2710ac0'}];
			assert.deepStrictEqual(resMsg, expected);
		});
	});

	describe('#deleteExportHistory', () => {
		it('it should delete a export history for a user', async () => {
			const exportHistoryList = [{
				id: 1, user_id: '27d1ca9e10b731476b7641eae2710ac0', download_request_body: {}, search_response_metadata: {}
			}];
			const opts = {
				...constructorOptionsMock,
				dataApi: {},
				exportHistory: {
					destroy(data) {
						let returnItem;
						exportHistoryList.forEach((history, index) => {
							if (history.id === data.where.id) {
								returnItem = history;
								exportHistoryList.splice(index, 1);
							}
						});
						return Promise.resolve(returnItem);
					}
				}
			};
			const target = new ExportHistoryController(opts);

			const req = {
				...reqMock,
				params: {
					historyId: 1
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
				await target.deleteExportHistory(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {id: {download_request_body: {}, id: 1, search_response_metadata: {}, user_id: '27d1ca9e10b731476b7641eae2710ac0'}, message: 'delete success'};
			assert.deepStrictEqual(resMsg, expected);
			assert.deepStrictEqual(exportHistoryList, []);
		});
	});

	describe('#updateExportHistoryDate', () => {
		it('it should update export history date', async () => {
			const exportHistoryList = [{
				id: 1, user_id: '27d1ca9e10b731476b7641eae2710ac0', download_request_body: {}, search_response_metadata: {}
			}];
			let savedItem = {};
			const opts = {
				...constructorOptionsMock,
				dataApi: {},
				exportHistory: {
					findOne(data) {
						let returnItem;
						exportHistoryList.forEach((history, index) => {
							if (history.id === data.where.id) {
								returnItem = history;
							}
						});
						const tempReturn = {
							...returnItem,
							save: () => {
								savedItem = returnItem;
							},
							changed: (key, value) => {
								returnItem[key] = value;
							}
						};
						return Promise.resolve(tempReturn);
					}
				}
			};
			const target = new ExportHistoryController(opts);

			const req = {
				...reqMock,
				params: {
					historyId: 1
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
				await target.updateExportHistoryDate(res, 1, 'testsuite');
			} catch (e) {
				assert.fail(e);
			}
			const expected = {download_request_body: {}, id: 1, search_response_metadata: {}, updatedAt: true, user_id: '27d1ca9e10b731476b7641eae2710ac0'};
			assert.deepStrictEqual(savedItem, expected);
		});
	});
});
