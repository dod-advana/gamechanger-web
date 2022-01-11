const assert = require('assert');
const { TextSuggestionController } = require('../../node_app/controllers/textSuggestionController');
const { reqMock } = require('../resources/testUtility');

const constructorOptionsMock = {
	constants: {},
	logger: {
		info: (data) => {
			console.log('MOCKED LOGGER-[info]:', data);
		},
		error: (data, code) => {
			console.log(`MOCKED LOGGER-[error][${code}]:`, data);
		},
		metrics: (data) => {
			console.log('MOCKED LOGGER-[metrics]:', data);
		}
	},
	dataApi: {}
};

describe('TextSuggestionController', function () {

	describe('#getSingleCorrected()', () => {

		const opts = {
			...constructorOptionsMock,

		};

		const target = new TextSuggestionController(opts);

		it('should return a suggestion for each word where the first option has a score over 0.8', () => {
			const data = [
				{
					text: 'artifical',
					offset: 0,
					length: 9,
					options: [
						{
							text: 'artificial',
							score: 0.8888889,
							freq: 522
						},
						{
							text: 'artifice',
							score: 0.75,
							freq: 42
						},
						{
							text: 'artifically',
							score: 0.7777778,
							freq: 2
						},
						{
							text: 'artifices',
							score: 0.7777778,
							freq: 1
						},
						{
							text: 'artiﬁcial',
							score: 0.7777778,
							freq: 1
						}
					]
				},
				{
					text: 'intelligecne',
					offset: 10,
					length: 12,
					options: [
						{
							text: 'intelligence',
							score: 0.9166667,
							freq: 37162
						},
						{
							text: 'intelligent',
							score: 0.8181818,
							freq: 439
						},
						{
							text: 'intelligenc',
							score: 0.8181818,
							freq: 43
						},
						{
							text: 'intellegence',
							score: 0.8333333,
							freq: 7
						},
						{
							text: 'intelligency',
							score: 0.8333333,
							freq: 5
						}
					]
				}
			];
			const expected = 'artificial intelligence';
			const actual = target.getSingleCorrected(data);
			assert.equal(actual, expected);
		});

		it('should not replace words where the first option doesnt meet the score requirement', () => {
			const data = [
				{
					text: 'artifical',
					offset: 0,
					length: 9,
					options: [
						{
							text: 'artificial',
							score: 0.74,
							freq: 522
						},
						{
							text: 'artifice',
							score: 0.75,
							freq: 42
						},
						{
							text: 'artifically',
							score: 0.7777778,
							freq: 2
						},
						{
							text: 'artifices',
							score: 0.7777778,
							freq: 1
						},
						{
							text: 'artiﬁcial',
							score: 0.7777778,
							freq: 1
						}
					]
				},
				{
					text: 'intelligecne',
					offset: 10,
					length: 12,
					options: [
						{
							text: 'intelligence',
							score: 0.9166667,
							freq: 37162
						},
						{
							text: 'intelligent',
							score: 0.8181818,
							freq: 439
						},
						{
							text: 'intelligenc',
							score: 0.8181818,
							freq: 43
						},
						{
							text: 'intellegence',
							score: 0.8333333,
							freq: 7
						},
						{
							text: 'intelligency',
							score: 0.8333333,
							freq: 5
						}
					]
				}
			];
			const expected = 'artifical intelligence';
			const actual = target.getSingleCorrected(data);
			assert.equal(actual, expected);
		});

		it('should not replace words where there are no options from the suggester', () => {
			const data = [
				{
					text: 'artifical',
					offset: 0,
					length: 9,
					options: [
						{
							text: 'artificial',
							score: 0.85,
							freq: 522
						},
						{
							text: 'artifice',
							score: 0.75,
							freq: 42
						},
						{
							text: 'artifically',
							score: 0.7777778,
							freq: 2
						},
						{
							text: 'artifices',
							score: 0.7777778,
							freq: 1
						},
						{
							text: 'artiﬁcial',
							score: 0.7777778,
							freq: 1
						}
					]
				},
				{
					text: 'intelligenc',
					offset: 10,
					length: 11,
					options: []
				}
			];
			const expected = 'artificial intelligenc';
			const actual = target.getSingleCorrected(data);
			assert.equal(actual, expected);
		});

		it('should return an empty string when there are no options from the suggester', () => {
			const data = [
				{
					text: 'artificial',
					offset: 0,
					length: 9,
					options: []
				},
				{
					text: 'intelligence',
					offset: 10,
					length: 11,
					options: []
				}
			];
			const expected = '';
			const actual = target.getSingleCorrected(data);
			assert.strictEqual(actual, expected);
		});

	});

	describe('#getTextSuggestion', () => {
		const constants = {
			GAME_CHANGER_OPTS: {
				index: 'gamechanger'
			}
		};

		const elasticSearchData = {
			body: { suggest: { suggester: [{
				text: 'navy',
				offset: 0,
				length: 4,
				options: [{ text: 'navy', score: 0.8888889, freq: 522 }]
			}]}}
		};

		const multiQueryElasticSearchData = {
			body: {
				took: 45,
				responses: [
					{
						took: 45,
						timed_out: false,
						_shards: { total: 3, successful: 3, skipped: 0, failed: 0 },
						hits: {
							total: { value: 843, relation: 'eq' },
							max_score: 1,
							hits: [
								{
									_index: 'gamechanger_20211014',
									_type: '_doc',
									_id: '548b706df003b6129013045b68f6528fe17430b5545783ba3de8e3b55995fd95',
									_score: 1,
									_source: {
										display_title_s: 'H.R. 4402 To authorize the Secretary of the Navy to establish a surface danger zone over the Guam National Wildlife Refuge or any portion thereof to support the operation of a live-fire training range complex.'
									}
								},
								{
									_index: 'gamechanger_20211014',
									_type: '_doc',
									_id: '1e11df485ea01d6dd6e76edd8e5ac2581499d54828f028965c32b0a64b9ab89a',
									_score: 1,
									_source: {
										display_title_s: 'H.R. 3183 An Act To designate the facility of the United States Postal Service located at 13683 James Madison Highway in Palmyra, Virginia, as the U.S. Navy Seaman Dakota Kyle Rigsby Post Office.'
									}
								},
								{
									_index: 'gamechanger_20211014',
									_type: '_doc',
									_id: '254870107ee4cda3d783a09f136b1b0688c18be6c46bb50cc239bb6931a73595',
									_score: 1,
									_source: {
										display_title_s: 'H.R. 3183 An Act To designate the facility of the United States Postal Service located at 13683 James Madison Highway in Palmyra, Virginia, as the U.S. Navy Seaman Dakota Kyle Rigsby Post Office.'
									}
								},
								{
									_index: 'gamechanger_20211014',
									_type: '_doc',
									_id: '4cc4a309c86279761b140ff0e8581d0b442a024836219397a3be5489666232ed',
									_score: 1,
									_source: {
										display_title_s: 'BUMEDINST 1500.29D NAVY MEDICINE COMMAND TRAINING PROGRAM'
									}
								}
							]
						},
						status: 200
					},
					{
						took: 6,
						timed_out: false,
						_shards: { total: 5, successful: 5, skipped: 0, failed: 0 },
						hits: {
							total: { value: 10000, relation: 'gte' },
							max_score: 1,
							hits: [
								{
									_index: 'search_history',
									_type: '_doc',
									_id: 'uyqTqHgBRo9JEqXCcXgl',
									_score: 1,
									_source: {
										user_id: 'd69403e2673e611d4cbd3fad6fd1788e',
										search_query: 'navy',
										run_time: 1617735938310,
										clone_name: 'policy'
									}
								}
							]
						},
						aggregations: {
							search_query: {
								doc_count_error_upper_bound: 0,
								sum_other_doc_count: 7,
								buckets: [
									{
										key: 'navy',
										doc_count: 10105,
										user: {
											doc_count_error_upper_bound: 1,
											sum_other_doc_count: 2612,
											buckets: [
												{
													key: 'd69403e2673e611d4cbd3fad6fd1788e',
													doc_count: 3362
												},
												{
													key: '54baea34480635caea8437904697bd9c',
													doc_count: 2341
												},
												{
													key: '53bcc6d0d0bb13410e00765cfab60699',
													doc_count: 1785
												}
											]
										}
									},
									{
										key: 'navy OR "dark blue"',
										doc_count: 46,
										user: {
											doc_count_error_upper_bound: 0,
											sum_other_doc_count: 0,
											buckets: [
												{
													key: 'd69403e2673e611d4cbd3fad6fd1788e',
													doc_count: 41
												},
												{
													key: '54baea34480635caea8437904697bd9c',
													doc_count: 5
												}
											]
										}
									},
									{
										key: 'navy OR us',
										doc_count: 39,
										user: {
											doc_count_error_upper_bound: 0,
											sum_other_doc_count: 0,
											buckets: [
												{
													key: 'd69403e2673e611d4cbd3fad6fd1788e',
													doc_count: 38
												},
												{
													key: '54baea34480635caea8437904697bd9c',
													doc_count: 1
												}
											]
										}
									},
									{
										key: 'navy seal',
										doc_count: 30,
										user: {
											doc_count_error_upper_bound: 0,
											sum_other_doc_count: 0,
											buckets: [
												{
													key: 'd69403e2673e611d4cbd3fad6fd1788e',
													doc_count: 30
												}
											]
										}
									},
									{
										key: 'navy personnel command',
										doc_count: 27,
										user: {
											doc_count_error_upper_bound: 0,
											sum_other_doc_count: 0,
											buckets: [
												{
													key: 'd69403e2673e611d4cbd3fad6fd1788e',
													doc_count: 24
												},
												{
													key: '54baea34480635caea8437904697bd9c',
													doc_count: 3
												}
											]
										}
									},
									{
										key: 'navy OR us OR "dark blue"',
										doc_count: 20,
										user: {
											doc_count_error_upper_bound: 0,
											sum_other_doc_count: 0,
											buckets: [
												{
													key: 'd69403e2673e611d4cbd3fad6fd1788e',
													doc_count: 17
												},
												{
													key: '54baea34480635caea8437904697bd9c',
													doc_count: 3
												}
											]
										}
									},
									{
										key: 'navy command',
										doc_count: 17,
										user: {
											doc_count_error_upper_bound: 0,
											sum_other_doc_count: 0,
											buckets: [
												{
													key: 'f2e3e25e63be9acbb82c1e0ba8eabae6',
													doc_count: 16
												},
												{
													key: 'd69403e2673e611d4cbd3fad6fd1788e',
													doc_count: 1
												}
											]
										}
									},
									{
										key: 'navy submarine',
										doc_count: 17,
										user: {
											doc_count_error_upper_bound: 0,
											sum_other_doc_count: 0,
											buckets: [
												{
													key: 'd69403e2673e611d4cbd3fad6fd1788e',
													doc_count: 17
												}
											]
										}
									},
									{
										key: 'navy headquarters staff pandemic plan',
										doc_count: 8,
										user: {
											doc_count_error_upper_bound: 0,
											sum_other_doc_count: 0,
											buckets: [
												{
													key: 'd69403e2673e611d4cbd3fad6fd1788e',
													doc_count: 4
												},
												{
													key: 'f2e3e25e63be9acbb82c1e0ba8eabae6',
													doc_count: 4
												}
											]
										}
									},
									{
										key: 'navy OR "dark blue" OR "dark blue"',
										doc_count: 7,
										user: {
											doc_count_error_upper_bound: 0,
											sum_other_doc_count: 0,
											buckets: [
												{
													key: 'd69403e2673e611d4cbd3fad6fd1788e',
													doc_count: 6
												},
												{
													key: '54baea34480635caea8437904697bd9c',
													doc_count: 1
												}
											]
										}
									}
								]
							}
						},
						status: 200
					},
					{
						took: 1,
						timed_out: false,
						_shards: { total: 5, successful: 5, skipped: 0, failed: 0 },
						hits: {
							total: { value: 3, relation: 'eq' },
							max_score: 1,
							hits: [
								{
									_index: 'entities_20210624',
									_type: '_doc',
									_id: '3b4hP3oB6yUykPse54aX',
									_score: 1,
									_source: {
										aliases: [ { name: '' } ],
										entity_type: 'topic',
										name: 'Navy Personnel Command'
									}
								},
								{
									_index: 'entities_20210624',
									_type: '_doc',
									_id: '5_AhP3oB3J4Grvsi5nRq',
									_score: 1,
									_source: {
										aliases: [ { name: 'Navy' } ],
										entity_type: 'org',
										name: 'United States Navy'
									}
								}
							]
						},
						status: 200
					}
				]
			}
		};

		const searchUtility = {
			getESSuggesterQuery(body) {
				if (body) {
					return ['test'];
				} else {
					return [];
				}
			},
			getESpresearchMultiQuery(body) {
				if (body) {
					return ['test'];
				} else {
					return [];
				}
			}
		};

		it('should return parsed data', async () => {
			const dataApi = {
				queryElasticSearch(_esClientName, _textSuggestIndex, esQueryArray, _userId) {
					if (esQueryArray.length > 0 && esQueryArray[0] === 'test') {
						return Promise.resolve(elasticSearchData);
					} else {
						return Promise.resolve({ body: {} });
					}
				},
				mulitqueryElasticSearch(_esClientName, _textSuggestIndex, esQueryArray, _userId) {
					if (esQueryArray.length > 0 && esQueryArray[0] === 'test') {
						return Promise.resolve(multiQueryElasticSearchData);
					} else {
						return Promise.resolve({ body: {} });
					}
				}
			};
	
			const opts = {
				...constructorOptionsMock,
				constants,
				searchUtility,
				dataApi
			};
	
			const target = new TextSuggestionController(opts);

			const req = {
				...reqMock,
				body: { index: 'gamechanger', searchText: 'navy', suggestions: true }
			};
			let resMsg;		
			const res = {
				status() {
					return this;
				},
				send(msg) {
					resMsg = msg;
					return this;
				}
			};

			await target.getTextSuggestion(req, res);

			const expected = {
				autocorrect: [ 'navy' ],
				presearchTitle: [
					'H.R. 4402 To authorize the Secretary of the Navy to establish a surface danger zone over the Guam National Wildlife Refuge or any portion thereof to support the operation of a live-fire training range complex.',
					'H.R. 3183 An Act To designate the facility of the United States Postal Service located at 13683 James Madison Highway in Palmyra, Virginia, as the U.S. Navy Seaman Dakota Kyle Rigsby Post Office.',
					'H.R. 3183 An Act To designate the facility of the United States Postal Service located at 13683 James Madison Highway in Palmyra, Virginia, as the U.S. Navy Seaman Dakota Kyle Rigsby Post Office.',
					'BUMEDINST 1500.29D NAVY MEDICINE COMMAND TRAINING PROGRAM'
				],
				presearchTopic: [],
				presearchOrg: [ 'Navy Personnel Command', 'United States Navy' ],
				predictions: [ 'navy', 'navy OR "dark blue"' ]
			};

			assert.deepStrictEqual(resMsg, expected);
		});
	});
});
