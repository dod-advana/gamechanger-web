const assert = require('assert');

const { TextSuggestionController } = require('../../node_app/controllers/textSuggestionController');

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
							score: 0.80,
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
	describe('#getPreFileCorrected()', () => {

		const opts = {
			...constructorOptionsMock,
		};

		const target = new TextSuggestionController(opts);

		it('should returned parsed filename', () => {
			const data = [
				{
					_index: 'gamechanger-20201209-with-display-fields',
					_type: '_doc',
					_id: '9cc18990e4c16abfba28ccd2d09f57a5f90c782c5020c047f4113d5f83680027',
					_score: 1.0,
					_source: {
						filename: 'CMDRS COMMANDER\'S GUIDE TO ENVIRONMENTAL MANAGEMENT.pdf_0'
					}
				}
			];
			const expected = ['CMDRS COMMANDER\'S GUIDE TO ENVIRONMENTAL MANAGEMENT'];
			const actual = target.getPreFileCorrected(data);
			assert.deepStrictEqual(actual, expected);
		});

	});
	describe('#getPreTitleCorrected()', () => {

		const opts = {
			...constructorOptionsMock,
		};

		const target = new TextSuggestionController(opts);

		it('should return parsed title', () => {
			const data = [
				{
					_index: 'gamechanger-20201209-with-display-fields',
					_type: '_doc',
					_id: '5895f0c357f23ef934f5d10415936f40679c81bc2316b381c6bcfc36a14e0f94',
					_score: 1.0,
					_source: {
						title: 'AIR FORCE EQUIPMENT MANAGEMENT'
					}
				},
				{
					_index: 'gamechanger-20201209-with-display-fields',
					_type: '_doc',
					_id: '0f49dc66f81e89646c63bec4b1d1e3ecb765ea2b76744b08ac3fab91ecad8658',
					_score: 1.0,
					_source: {
						title: 'AICUZ PROGRAM MANAGERS GUIDE'
					}
				}
			];
			const expected = ['AIR FORCE EQUIPMENT MANAGEMENT', 'AICUZ PROGRAM MANAGERS GUIDE'];
			const actual = target.getPreTitleCorrected(data);
			assert.deepStrictEqual(actual, expected);
		});

	});
	describe('#getCommonSearchCorrected()', () => {

		const opts = {
			...constructorOptionsMock,
		};

		const target = new TextSuggestionController(opts);

		it('should return parsed common searches', () => {
			const data = [{"key":"missile defense","doc_count":14,"user":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"Becca Tester","doc_count":3},{"key":"steve","doc_count":1}]}},{"key":"missile defense governance","doc_count":7,"user":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[]}}]
			const expected = ['missile defense'];
			const actual = target.getPreHistoryCorrected(data);
			assert.deepStrictEqual(actual, expected);
		});

	});
});
