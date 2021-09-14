const assert = require('assert');
const GraphHandler = require('../../../node_app/modules/base/graphHandler');
const { constructorOptionsMock, reqMock } = require('../../resources/testUtility');

function generateFieldLookup (keys) {
	const lookup = {};
	keys.forEach((name, idx) => {
		lookup[name] = idx;
	});
	return lookup;
}

class Record {
	constructor (keys, fields, fieldLookup = null) {
		this.keys = keys;
		this.length = keys.length;
		this._fields = fields;
		this._fieldLookup = fieldLookup || generateFieldLookup(keys);
	}

	forEach (visitor) {
		for (const [key, value] of this.entries()) {
			visitor(value, key, this);
		}
	}

	toObject () {
		const object = {};

		for (const [key, value] of this.entries()) {
			object[key] = value;
		}

		return object;
	}

	* entries () {
		for (let i = 0; i < this.keys.length; i++) {
			yield [this.keys[i], this._fields[i]];
		}
	}

	* values () {
		for (let i = 0; i < this.keys.length; i++) {
			yield this._fields[i];
		}
	}
}

describe('GraphHandler', function () {
	let redisData = {gamechanger_f740af5d2e2819eeb0063eca402fcce8: JSON.stringify({test: ['test']})};

	const opts = {
		...constructorOptionsMock,
		constants: {
			GAME_CHANGER_OPTS: {downloadLimit: 1000},
			GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
		},
		dataLibrary: {},
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
		it('it should return the body passed to it sense it is the base and doesnt do a search', async (done) => {

			const target = new GraphHandler(opts);

			try {
				const actual = await target.search('test', {test: 'test'}, 'gamechanger', [], 'test');
				const expected = {cloneName: 'gamechanger', searchText: 'test', test: 'test'};
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e) {
				assert.fail(e);
				done();
			}
		});
	});

	describe('#query', () => {
		it('it should return the body passed to it sense it is the base and doesnt do a query', async (done) => {

			const target = new GraphHandler(opts);

			try {
				const actual = await target.query('test', 'test', {test: 'test'}, 'gamechanger', [], 'test');
				const expected = {cloneName: 'gamechanger', query: 'test', test: 'test'};
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e) {
				assert.fail(e);
				done();
			}
		});
	});

	describe('#callFunction', () => {
		it('it should return the body passed to it sense it is the base and doesnt do a callFunction', async (done) => {

			const target = new GraphHandler(opts);

			try {
				const actual = await target.callFunction('test', {test: 'test'}, 'gamechanger', [], 'test');
				const expected = {cloneName: 'gamechanger', functionName: 'test', test: 'test'};
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e) {
				assert.fail(e);
				done();
			}
		});
	});

	describe('#getGraphData', () => {
		it('it should return graph data for a query', async (done) => {

			const graphDataResultsMock = {
				result: {
					records:
						[
							{
								keys: [
									'pt'
								],
								length: 1,
								_fields: [
									{
										start: {
											identity: {
												low: 505,
												high: 0
											},
											labels: [
												'Publication'
											],
											properties: {
												name: 'ICD 402',
												display_org_s: 'Intelligence Community',
												display_doc_type_s: 'Directive',
												doc_type: 'ICD',
												doc_num: '402'
											}
										},
										end: {
											identity: {
												low: 505,
												high: 0
											},
											labels: [
												'Publication'
											],
											properties: {
												name: 'ICD 402',
												display_org_s: 'Intelligence Community',
												display_doc_type_s: 'Directive',
												doc_type: 'ICD',
												doc_num: '402'
											}
										},
										segments: [
											{
												start: {
													identity: {
														low: 505,
														high: 0
													},
													labels: [
														'Publication'
													],
													properties: {
														name: 'ICD 402',
														display_org_s: 'Intelligence Community',
														display_doc_type_s: 'Directive',
														doc_type: 'ICD',
														doc_num: '402'
													}
												},
												relationship: {
													identity: {
														low: 1890,
														high: 0
													},
													start: {
														low: 505,
														high: 0
													},
													end: {
														low: 505,
														high: 0
													},
													type: 'REFERENCES',
													properties: {}
												},
												end: {
													identity: {
														low: 505,
														high: 0
													},
													labels: [
														'Publication'
													],
													properties: {
														name: 'ICD 402',
														display_org_s: 'Intelligence Community',
														display_doc_type_s: 'Directive',
														doc_type: 'ICD',
														doc_num: '402'
													}
												}
											}
										],
										length: 1
									}
								],
								_fieldLookup: {
									pt: 0
								}
							}
						]
				}
			};

			const records = [];
			graphDataResultsMock.result.records.forEach(rec => {
				records.push(new Record(rec.keys, rec._fields, rec._fieldLookup));
			});
			graphDataResultsMock.result.records = records;

			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {
					queryGraph() {
						return Promise.resolve(graphDataResultsMock);
					}
				}
			};

			const target = new GraphHandler(opts);

			try {
				const actual = await target.getGraphData('test', {}, true, 'test');
				const expected = [{edges: [{curvature: 0, id: 1890, label: 'REFERENCES', properties: [], rotation: 0, source: 505, target: 505, value: 1}], labels: ['Publication'], nodeProperties: {Publication: ['name', 'display_org_s', 'display_doc_type_s', 'doc_type', 'doc_num']}, nodes: [{display_doc_type_s: 'Directive', display_org_s: 'Intelligence Community', doc_num: '402', doc_type: 'ICD', id: 505, label: 'Publication', name: 'ICD 402', pageRank: 1, properties: ['name', 'display_org_s', 'display_doc_type_s', 'doc_type', 'doc_num'], value: 1}], relProperties: {REFERENCES: []}, relationships: ['REFERENCES']}, 'test', {}];
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e) {
				assert.fail(e);
				done();
			}
		});
	});

	describe('#getCachedResults', () => {
		it('it should return fake cached results based off the request info', async (done) => {

			const target = new GraphHandler(opts);

			const req = {
				...reqMock,
				body: {
					searchText: 'test',
					options: {test: 'test'},
					cloneName: 'gamechanger',
					permissions: [],
					userId: 'test'
				}
			};

			const cloneSpecificObject = {};

			try {
				const actual = await target.getCachedResults(req, cloneSpecificObject, 'Test');
				const expected = {isCached: true, test: ['test']};
				assert.deepStrictEqual(actual, expected);
				done();
			} catch (e) {
				assert.fail(e);
				done();
			}
		});
	});

	describe('#storeCachedResults', () => {
		it('it should store fake cached results based off the request info', async (done) => {

			const target = new GraphHandler(opts);

			const req = {
				...reqMock,
				body: {
					searchText: 'test',
					options: {test: 'test'},
					cloneName: 'gamechanger',
					permissions: [],
					userId: 'test'
				}
			};

			const cloneSpecificObject = {test: 'test'};
			const searchResults = ['Test'];

			try {
				await target.storeCachedResults(req, searchResults, cloneSpecificObject, 'Test');
				const expected = {gamechanger_2f5d59d9ad2d29d94175d8b9bcd70e9e: '["Test"]', gamechanger_f740af5d2e2819eeb0063eca402fcce8: '{"test":["test"]}'};
				assert.deepStrictEqual(redisData, expected);
				done();
			} catch (e) {
				assert.fail(e);
				done();
			}
		});
	});

});
