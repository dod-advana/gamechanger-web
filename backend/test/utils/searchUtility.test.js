const assert = require('assert');
const SearchUtility = require('../../node_app/utils/searchUtility');
const { constructorOptionsMock } = require('../resources/testUtility');
const { expect } = require('chai');
const qaESReturn = require('../resources/mockResponses/qaESReturn');
const qaEntitiesReturn = require('../resources/mockResponses/qaEntitiesReturn');
const documentSearchES = require('../resources/mockResponses/documentSearchES');
const graphRecSearches = require('../resources/mockResponses/graphRecSearches');

const fake_ref_list = [
	'Title 50',
	'Title 3',
	'Title 8',
	'Title 31',
	'Title 18',
	'Title 28',
	'Title28',
	'Title 10',
	'Title 2',
	'Title 12',
	'Title 15',
	'Title 30',
];
const RAW_ES_BODY_SEARCH_RESPONSE = {
	body: {
		hits: {
			total: {
				value: 1,
			},
			hits: [
				{
					fields: {
						display_doc_type_s: ['Title'],
						display_org_s: ['US House of Representatives'],
						display_title_s: ['Foreign Relations and Intercourse'],
						doc_num: ['22'],
						doc_type: ['Title'],
						filename: ['Title 22.pdf'],
						id: ['Title 22.pdf_0'],
						keyw_5: [
							'effective date',
							'congressional committees',
							'fiscal year',
							'foreign relations',
							'international development',
							'foreign affairs',
							'complete classification',
							'foreign service',
							'human rights',
							'international organizations',
						],
						page_count: [3355],
						ref_list: fake_ref_list,
						summary_30: [
							'WHenhancedRenhancedAS the Congress of the United Nationsited Nationsited States, in section 620 of the Foreign Assistance Act of 1961 (75 including section 301 of title 3, United Nationsited Nationsited States Code, I hereby delegate to the Secretary of the Treasury the Any agency or officer of the United Nationsited Nationsited States government-ownedvernment carrying out functions under this chapter comparable information on covered United Nationsited Nationsited States foreign assistance programs, including all including section 301 of title 3 of the United Nationsited Nationsited States Code, I hereby delegate to the Secretary of Defense the The United Nationsited Nationsited States government-ownedvernment shall terminate assistance to that country under the Foreign',
						],
						title: ['Foreign Relations and Intercourse'],
						type: ['document'],
					},
					_source: {
						topics_s: ['Test'],
					},
					inner_hits: {
						paragraphs: {
							hits: {
								total: { value: 1, relation: 'eq' },
								hits: [
									{
										fields: {
											'paragraphs.filename.search': ['Title 22.pdf'],
											'paragraphs.page_num_i': [1818],
											'paragraphs.par_raw_text_t': [
												'The President may utilize the regulatory or other authority pursuant to this chapter to exempt a foreign country from the licensing requirements of this chapter with respect to exports of defense items only if the United States Government has concluded a binding bilateral agreement with the foreign country .Such agreement shall — ( i ) meet the requirements set forth in paragraph ( 2 ) ; and ( ii ) be implemented by the United States and the foreign country in a manner that is legally binding under their domestic laws .( B ) Exception for Canada The requirement to conclude a bilateral agreement in accordance with subparagraph ( A ) shall not apply with respect to an exemption for Canada from the licensing requirements of this chapter for the export of defense items .( C ) Exception for defense trade cooperation treaties ( i ) In general The requirement to conclude a bilateral agreement in accordance with subparagraph ( A ) shall not apply with respect to an exemption from the licensing requirements of this chapter for the export of defense items to give effect to any of the following defense trade cooperation treaties , provided that the treaty has entered into force pursuant to article II , section 2 , clause 2 of the Constitution of the United States : ( I ) The Treaty Between the Government of the United States of America and the Government of the United Kingdom of Great Britain and Northern Ireland Concerning Defense Trade Cooperation , done at Washington and London on June 21 and 26 , 2007 ( and any implementing arrangement thereto ) .( II ) The Treaty Between the Government of the United States of America and the Government of Australia Concerning Defense Trade Cooperation , done at Sydney September 5 , 2007 ( and any implementing arrangement thereto ) .( ii ) Limitation of scope The United States shall exempt from the scope of a treaty referred to in clause ( i ) — ( I ) complete rocket systems ( including ballistic missile systems , space launch vehicles , and sounding rockets ) or complete unmanned aerial vehicle systems ( including cruise missile systems , target drones , and reconnaissance drones ) capable of delivering at least a 500 kilogram payload to a range of 300 kilometers , and associated production facilities , software , or technology for these systems , as defined in the Missile Technology Control Regime Annex Category I , Item 1 ; ( II ) individual rocket stages , re entry vehicles and equipment , solid or liquid propellant motors or engines , guidance sets , thrust vector control systems , and associated production facilities , software , and technology , as defined in the Missile Technology Control Regime Annex Category I , Item 2 ; ( III ) defense articles and defense services listed in the Missile Technology Control Regime Annex Category II that are for use in rocket systems , as that term is used in such Annex , including associated production facilities , software , or technology ; ( IV ) toxicological agents , biological agents , and associated equipment , as listed in the United States Munitions List ( part 121.1 of chapter I of title 22 , Code of Federal Regulations ) , Category XIV , subcategories ( a ) , ( b ) , ( f ) ( 1 ) , ( i ) , ( j ) as it pertains to ( f ) ( 1 ) , ( l ) as it pertains to ( f ) ( 1 ) , and ( m ) as it pertains to all of the subcategories cited in this paragraph ; ( V ) defense articles and defense services specific to the design and testing of nuclear weapons which are controlled under United States Munitions List Category XVI ( a ) and ( b ) , along with associated defense articles in Category XVI ( d ) and technology in Category XVI ( e ) ; ( VI ) with regard to the treaty cited in clause ( i ) ( I ) , defense articles and defense services that the United States controls under the United States Munitions List that are not ',
											],
										},
										highlight: {
											'paragraphs.par_raw_text_t': [
												'"the export of defense items .( C ) Exception for defense trade cooperation treaties ( i ) In general The <em>requirement</em> <em>to</em> <em>conclude</em> <em>a</em> <em>bilateral</em> <em>agreement</em> in accordance with subparagraph"',
											],
										},
									},
								],
							},
						},
					},
				},
			],
		},
	},
};

describe('SearchUtility', function () {
	const opts = {
		...constructorOptionsMock,
		mlAPi: {},
		dataLibrary: {},
	};

	describe('#createCacheKeyFromOptions()', () => {
		const utility = new SearchUtility(opts);

		it('should have the same cache key for the same options passed in any order', () => {
			const inA = {
				searchText: 'building',
				offset: 0,
				orgFilterQuery:
					'DoD OR DoDM OR DoDI OR DoDD OR DEP OR SEC OR AI OR DTM OR CJCS OR CJCSI OR CJCSM OR CJCSG OR ICD OR ICPG OR ICPM OR Title OR AGO OR TB OR AR OR TM OR STP OR ARMY OR ATP OR DA OR PAM OR TC OR HQDA OR FM OR GTA OR JTA OR CTA OR ATTP OR ADP OR (MC MISC) OR MCO OR DCG OR NAVMC OR MCRP OR MCTP OR (MCO P) OR MCWP OR FMFRP OR IRM OR MCBUL OR MCDP OR SECNAVINST OR MCIP OR SECNAV OR (NAVMC DIR) OR UM OR (DA PAM) OR NAVSUP OR MANUAL OR FMFM OR (DA FORM) OR JAGINST',
				transformResults: false,
				isClone: false,
				index: '',
				charsPadding: 90,
				orgFilter: {
					'Department of Defense': true,
					'Joint Chiefs of Staff': true,
					'Intelligence Community': true,
					'United States Code': true,
					'Executive Branch': false,
					'US Air Force': false,
					'US Army': true,
					'US Marine Corps': true,
					'US Navy': false,
					'Classification Guides': false,
				},
				showTutorial: false,
				useGCCache: true,
				tiny_url: 'gamechanger?tiny=38',
				searchType: 'Keyword',
				searchVersion: 1,
			};

			const inB = {
				orgFilter: {
					'Department of Defense': true,
					'Joint Chiefs of Staff': true,
					'Intelligence Community': true,
					'United States Code': true,
					'Executive Branch': false,
					'US Air Force': false,
					'US Army': true,
					'US Marine Corps': true,
					'US Navy': false,
					'Classification Guides': false,
				},
				searchText: 'building',
				index: '',
				charsPadding: 90,
				showTutorial: false,
				useGCCache: true,
				offset: 0,
				orgFilterQuery:
					'DoD OR DoDM OR DoDI OR DoDD OR DEP OR SEC OR AI OR DTM OR CJCS OR CJCSI OR CJCSM OR CJCSG OR ICD OR ICPG OR ICPM OR Title OR AGO OR TB OR AR OR TM OR STP OR ARMY OR ATP OR DA OR PAM OR TC OR HQDA OR FM OR GTA OR JTA OR CTA OR ATTP OR ADP OR (MC MISC) OR MCO OR DCG OR NAVMC OR MCRP OR MCTP OR (MCO P) OR MCWP OR FMFRP OR IRM OR MCBUL OR MCDP OR SECNAVINST OR MCIP OR SECNAV OR (NAVMC DIR) OR UM OR (DA PAM) OR NAVSUP OR MANUAL OR FMFM OR (DA FORM) OR JAGINST',
				transformResults: false,
				tiny_url: 'gamechanger?tiny=38',
				searchType: 'Keyword',
				searchVersion: 1,
				isClone: false,
			};

			const a = utility.createCacheKeyFromOptions(inA);
			const b = utility.createCacheKeyFromOptions(inB);
			assert.equal(a, b);
		});
	});

	describe('#combineExpansionTerms', () => {
		it('should return empty list for key if none of the sources are detected', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = [];
			const relatedSearches = [];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = { something: [] };
			assert.deepEqual(result, expected);
		});

		it('should return empty list for key if none of the sources are defined', () => {
			const target = new SearchUtility(opts);

			const expansionDict = undefined;
			const synonyms = undefined;
			const relatedSearches = undefined;
			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = { something: [] };
			assert.deepEqual(result, expected);
		});

		it('should just use ML terms if no synonyms are detected', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3'] };
			const synonyms = [];
			const relatedSearches = [];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should just use ML terms if synonyms are undefined', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3'] };
			const synonyms = undefined;
			const relatedSearches = [];
			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should just use ML terms if related searches are undefined', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3'] };
			const synonyms = undefined;
			const relatedSearches = undefined;
			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});
		it('should just use related searches if no synonyms or ML expansions are detected', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = [];
			const relatedSearches = ['related search'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = { something: [{ phrase: 'related search', source: 'related' }] };
			assert.deepEqual(result, expected);
		});

		it('should just use related searches if no synonyms or ML expansions undefined', () => {
			const target = new SearchUtility(opts);

			const expansionDict = undefined;
			const synonyms = [];
			const relatedSearches = ['related search'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = { something: [{ phrase: 'related search', source: 'related' }] };
			assert.deepEqual(result, expected);
		});

		it('should just use synonyms if no ML terms are detected', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing1', 'thing2'];
			const relatedSearches = [];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing1', source: 'thesaurus' },
					{ phrase: 'thing2', source: 'thesaurus' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should just use synonyms if ML terms are undefined', () => {
			const target = new SearchUtility(opts);

			const expansionDict = undefined;
			const synonyms = ['thing1', 'thing2'];
			const relatedSearches = [];

			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing1', source: 'thesaurus' },
					{ phrase: 'thing2', source: 'thesaurus' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should just use abbreviations if no synonyms + ML terms are detected', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = [];
			const relatedSearches = [];

			const key = 'something';
			const abbs = ['expansion1', 'expansion2'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'expansion2', source: 'abbreviations' },
					{ phrase: 'expansion1', source: 'abbreviations' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should just use abbs if synonyms + ML terms are undefined and no related search', () => {
			const target = new SearchUtility(opts);

			const expansionDict = undefined;
			const synonyms = undefined;
			const relatedSearches = [];

			const key = 'something';
			const abbs = ['expansion1', 'expansion2'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'expansion2', source: 'abbreviations' },
					{ phrase: 'expansion1', source: 'abbreviations' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are 3 of each, and no abbreviations and no related search', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3'] };
			const synonyms = ['thing4', 'thing5', 'thing6'];
			const relatedSearches = [];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing6', source: 'thesaurus' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});
		it('should combine ML terms, synonyms, and related search if there are 3 of each, and no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3'] };
			const synonyms = ['thing4', 'thing5', 'thing6'];
			const relatedSearches = ['related 1', 'related 2'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'related 1', source: 'related' },
					{ phrase: 'related 2', source: 'related' },
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing6', source: 'thesaurus' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});
		it('should combine ML terms and abbreviations if there are 3 of each, and no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3'] };
			const relatedSearches = [];

			const synonyms = [];
			const key = 'something';
			const abbs = ['exp1', 'exp2', 'exp3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'exp3', source: 'abbreviations' },
					{ phrase: 'exp2', source: 'abbreviations' },
					{ phrase: 'exp1', source: 'abbreviations' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine abbreviations and synonyms if there are 3 of each, and no ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing4', 'thing5', 'thing6'];
			const relatedSearches = [];

			const key = 'something';
			const abbs = ['exp1', 'exp2', 'exp3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'exp3', source: 'abbreviations' },
					{ phrase: 'exp2', source: 'abbreviations' },
					{ phrase: 'exp1', source: 'abbreviations' },
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing6', source: 'thesaurus' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are > 3 of each, and no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3'] };
			const relatedSearches = [];

			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing6', source: 'thesaurus' },
					{ phrase: 'thing2', source: 'ML-QE' },
					{ phrase: 'thing42', source: 'thesaurus' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and abbreviations if there are > 3 of each, and no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3'] };
			const relatedSearches = [];

			const synonyms = [];
			const key = 'something';
			const abbs = ['exp1', 'exp2', 'exp3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'exp3', source: 'abbreviations' },
					{ phrase: 'exp2', source: 'abbreviations' },
					{ phrase: 'exp1', source: 'abbreviations' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine abbreviations and synonyms if there are > 3 of each, and no ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const relatedSearches = [];

			const key = 'something';
			const abbs = ['exp1', 'exp2', 'exp3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'exp3', source: 'abbreviations' },
					{ phrase: 'exp2', source: 'abbreviations' },
					{ phrase: 'exp1', source: 'abbreviations' },
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing6', source: 'thesaurus' },
					{ phrase: 'thing42', source: 'thesaurus' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are > 3 of each with a space, and no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3'] };
			const relatedSearches = [];

			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const key = 'something else';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				'something else': [
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing6', source: 'thesaurus' },
					{ phrase: 'thing2', source: 'ML-QE' },
					{ phrase: 'thing42', source: 'thesaurus' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and abbreviations if there are > 3 of each with a space, and no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3'] };
			const relatedSearches = [];

			const synonyms = [];
			const key = 'something else';
			const abbs = ['thing4', 'thing5', 'thing6', 'thing42'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				'something else': [
					{ phrase: 'thing42', source: 'abbreviations' },
					{ phrase: 'thing6', source: 'abbreviations' },
					{ phrase: 'thing5', source: 'abbreviations' },
					{ phrase: 'thing4', source: 'abbreviations' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});
		it('should combine all if there are > 3 of each with a space, and no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3'] };
			const relatedSearches = ['related 1', 'related 2', 'related 3'];

			const synonyms = [];
			const key = 'something else';
			const abbs = ['thing4', 'thing5', 'thing6', 'thing42'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				'something else': [
					{ phrase: 'thing42', source: 'abbreviations' },
					{ phrase: 'thing6', source: 'abbreviations' },
					{ phrase: 'thing5', source: 'abbreviations' },
					{ phrase: 'thing4', source: 'abbreviations' },
					{ phrase: 'related 1', source: 'related' },
					{ phrase: 'related 2', source: 'related' },
					{ phrase: 'related 3', source: 'related' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});
		it('should combine abbreviations and synonyms if there are > 3 of each with a space, and no ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const relatedSearches = [];

			const key = 'something else';
			const abbs = ['thing1', 'thing2', 'thing3', 'thing41'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				'something else': [
					{ phrase: 'thing41', source: 'abbreviations' },
					{ phrase: 'thing3', source: 'abbreviations' },
					{ phrase: 'thing2', source: 'abbreviations' },
					{ phrase: 'thing1', source: 'abbreviations' },
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing6', source: 'thesaurus' },
					{ phrase: 'thing42', source: 'thesaurus' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine all if there are > 3 of each with a space, and no ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const relatedSearches = ['related 1', 'related 2', 'related 3'];

			const key = 'something else';
			const abbs = ['thing1', 'thing2', 'thing3', 'thing41'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				'something else': [
					{ phrase: 'thing41', source: 'abbreviations' },
					{ phrase: 'thing3', source: 'abbreviations' },
					{ phrase: 'thing2', source: 'abbreviations' },
					{ phrase: 'thing1', source: 'abbreviations' },
					{ phrase: 'related 1', source: 'related' },
					{ phrase: 'related 2', source: 'related' },
					{ phrase: 'related 3', source: 'related' },
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing6', source: 'thesaurus' },
					{ phrase: 'thing42', source: 'thesaurus' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are 4 ML terms and 2 synonyms, no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3', 'thing4'] };
			const relatedSearches = [];

			const synonyms = ['thing4', 'thing5'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are 4 synonyms and 2 ML terms, no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1'] }, wordsim: ['thing3'] };
			const relatedSearches = [];

			const synonyms = ['thing4', 'thing5', 'thing6', 'thing7'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing6', source: 'thesaurus' },
					{ phrase: 'thing7', source: 'thesaurus' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are 4 ML terms and 2 abbreviations, no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3', 'thing4'] };
			const relatedSearches = [];

			const synonyms = [];
			const key = 'something';
			const abbs = ['thing4', 'thing5'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing5', source: 'abbreviations' },
					{ phrase: 'thing4', source: 'abbreviations' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are 4 synonyms and 3 ML terms, no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3'] };
			const relatedSearches = [];

			const synonyms = [];
			const key = 'something';
			const abbs = ['thing4', 'thing5', 'thing6', 'thing7'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing7', source: 'abbreviations' },
					{ phrase: 'thing6', source: 'abbreviations' },
					{ phrase: 'thing5', source: 'abbreviations' },
					{ phrase: 'thing4', source: 'abbreviations' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine abbreviations and synonyms if there are 4 ML terms and 2 synonyms, no ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const relatedSearches = [];

			const synonyms = ['thing4', 'thing5'];

			const key = 'something';
			const abbs = ['thing1', 'thing2', 'thing3', 'thing41'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing41', source: 'abbreviations' },
					{ phrase: 'thing3', source: 'abbreviations' },
					{ phrase: 'thing2', source: 'abbreviations' },
					{ phrase: 'thing1', source: 'abbreviations' },
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing5', source: 'thesaurus' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine abbreviations and synonyms if there are 4 synonyms and 2 ML terms, no ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing7'];
			const relatedSearches = [];

			const key = 'something';
			const abbs = ['thing1', 'thing2'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing2', source: 'abbreviations' },
					{ phrase: 'thing1', source: 'abbreviations' },
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing6', source: 'thesaurus' },
					{ phrase: 'thing7', source: 'thesaurus' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 ML terms and no synonyms or abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {
				qexp: { something: ['thing1', 'thing2'] },
				wordsim: ['thing3', 'thing4', 'thing5', 'thing6'],
			};
			const synonyms = [];
			const relatedSearches = [];

			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing4', source: 'ML-QE' },
					{ phrase: 'thing5', source: 'ML-QE' },
					{ phrase: 'thing6', source: 'ML-QE' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};

			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 ML terms and undefined synonyms and abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {
				qexp: { something: ['thing1', 'thing2'] },
				wordsim: ['thing3', 'thing4', 'thing5', 'thing6'],
			};
			const synonyms = undefined;
			const relatedSearches = [];

			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing4', source: 'ML-QE' },
					{ phrase: 'thing5', source: 'ML-QE' },
					{ phrase: 'thing6', source: 'ML-QE' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing2', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 synonyms and no ML terms or abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing1', 'thing2', 'thing3', 'thing4', 'thing5', 'thing6'];
			const relatedSearches = [];

			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing1', source: 'thesaurus' },
					{ phrase: 'thing2', source: 'thesaurus' },
					{ phrase: 'thing3', source: 'thesaurus' },
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing6', source: 'thesaurus' },
				],
			};

			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 synonyms and undefined ML terms and abbreviations', () => {
			const target = new SearchUtility(opts);
			const relatedSearches = [];
			const expansionDict = undefined;
			const synonyms = ['thing1', 'thing2', 'thing3', 'thing4', 'thing5', 'thing6'];
			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);

			assert.deepEqual(result, {
				something: [
					{ phrase: 'thing1', source: 'thesaurus' },
					{ phrase: 'thing2', source: 'thesaurus' },
					{ phrase: 'thing3', source: 'thesaurus' },
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing6', source: 'thesaurus' },
				],
			});
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 abbreivations and no ML terms or synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const relatedSearches = [];

			const synonyms = [];
			const key = 'something';
			const abbs = ['thing1', 'thing2', 'thing3', 'thing4', 'thing5', 'thing6'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing6', source: 'abbreviations' },
					{ phrase: 'thing5', source: 'abbreviations' },
					{ phrase: 'thing4', source: 'abbreviations' },
					{ phrase: 'thing3', source: 'abbreviations' },
					{ phrase: 'thing2', source: 'abbreviations' },
					{ phrase: 'thing1', source: 'abbreviations' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 abbreviations and undefined ML terms and synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = undefined;
			const synonyms = undefined;
			const relatedSearches = [];

			const key = 'something';
			const abbs = ['thing1', 'thing2', 'thing3', 'thing4', 'thing5', 'thing6'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'thing6', source: 'abbreviations' },
					{ phrase: 'thing5', source: 'abbreviations' },
					{ phrase: 'thing4', source: 'abbreviations' },
					{ phrase: 'thing3', source: 'abbreviations' },
					{ phrase: 'thing2', source: 'abbreviations' },
					{ phrase: 'thing1', source: 'abbreviations' },
				],
			};

			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms and abbreviations if there are > 2 of each and checking for removal of search term in ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing2'] }, wordsim: ['thing3'] };
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const relatedSearches = [];

			const key = 'something';
			const abbs = ['expansion1', 'expansion2', 'expansion3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'expansion3', source: 'abbreviations' },
					{ phrase: 'expansion2', source: 'abbreviations' },
					{ phrase: 'expansion1', source: 'abbreviations' },
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing5', source: 'thesaurus' },
					{ phrase: 'thing1', source: 'ML-QE' },
					{ phrase: 'thing6', source: 'thesaurus' },
					{ phrase: 'thing2', source: 'ML-QE' },
					{ phrase: 'thing42', source: 'thesaurus' },
				],
			};

			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms and abbreviations if there are > 2 of two categories and 1 of the other and checking for removal of search term in ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing1'] }, wordsim: ['thing3'] };
			const synonyms = ['thing4'];
			const relatedSearches = [];

			const key = 'something';
			const abbs = ['expansion1', 'expansion2', 'expansion3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'expansion3', source: 'abbreviations' },
					{ phrase: 'expansion2', source: 'abbreviations' },
					{ phrase: 'expansion1', source: 'abbreviations' },
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing1', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});
		it('should combine all if there are > 2 of two categories and 1 of the other and checking for removal of search term in ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing1'] }, wordsim: ['thing3'] };
			const synonyms = ['thing4'];
			const relatedSearches = ['related 1', 'related 2'];

			const key = 'something';
			const abbs = ['expansion1', 'expansion2', 'expansion3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'expansion3', source: 'abbreviations' },
					{ phrase: 'expansion2', source: 'abbreviations' },
					{ phrase: 'expansion1', source: 'abbreviations' },
					{ phrase: 'related 1', source: 'related' },
					{ phrase: 'related 2', source: 'related' },
					{ phrase: 'thing4', source: 'thesaurus' },
					{ phrase: 'thing3', source: 'ML-QE' },
					{ phrase: 'thing1', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});

		it('should combine all if and remove duplicates', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: ['thing1', 'thing1'] }, wordsim: ['thing3'] };
			const synonyms = ['thing1'];
			const relatedSearches = ['related 1', 'thing1'];

			const key = 'something';
			const abbs = ['expansion1', 'expansion2', 'expansion3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'expansion3', source: 'abbreviations' },
					{ phrase: 'expansion2', source: 'abbreviations' },
					{ phrase: 'expansion1', source: 'abbreviations' },
					{ phrase: 'related 1', source: 'related' },
					{ phrase: 'thing1', source: 'related' },
					{ phrase: 'thing3', source: 'ML-QE' },
				],
			};
			assert.deepEqual(result, expected);
		});
		it('ML Exp has empty lists and combines others', () => {
			const target = new SearchUtility(opts);

			const expansionDict = { qexp: { something: [] }, wordsim: [] };
			const synonyms = ['thing1'];
			const relatedSearches = ['related 1', 'thing1'];

			const key = 'something';
			const abbs = ['expansion1', 'expansion2', 'expansion3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {
				something: [
					{ phrase: 'expansion3', source: 'abbreviations' },
					{ phrase: 'expansion2', source: 'abbreviations' },
					{ phrase: 'expansion1', source: 'abbreviations' },
					{ phrase: 'related 1', source: 'related' },
					{ phrase: 'thing1', source: 'related' },
				],
			};
			assert.deepEqual(result, expected);
		});
	});

	describe('#cleanExpansions()', () => {
		it('should clean expansions by removing duplciates and punctuations', () => {
			const target = new SearchUtility(opts);
			const key = 'something';
			let toReturn = {
				something: [
					{ phrase: 'related 1', source: 'related' },
					{ phrase: 'related 1', source: 'related' },
					{ phrase: 'expansion1/', source: 'abbreviations' },
					{ phrase: "'expansion2'", source: 'abbreviations' },
					{ phrase: 'expansion3', source: 'abbreviations' },
				],
			};

			let actual = target.cleanExpansions(key, toReturn);
			let expected = {
				something: [
					{ phrase: 'related 1', source: 'related' },
					{ phrase: 'expansion1', source: 'abbreviations' },
					{ phrase: 'expansion2', source: 'abbreviations' },
					{ phrase: 'expansion3', source: 'abbreviations' },
				],
			};
			assert.deepEqual(actual, expected);
		});
		it('should clean expansions by getting rid of duplicates even if one is capitalized', () => {
			const target = new SearchUtility(opts);
			const key = 'something';
			let toReturn = {
				something: [
					{ phrase: 'THING', source: 'related' },
					{ phrase: 'thing', source: 'related' },
				],
			};

			let actual = target.cleanExpansions(key, toReturn);
			let expected = { something: [{ phrase: 'THING', source: 'related' }] };
			assert.deepEqual(actual, expected);
		});
	});
	describe('#getQueryVariable()', () => {
		it('should return back the value for a query variable', () => {
			const constants = {
				env: {
					GAME_CHANGER_OPTS: {
						version: 'version',
					},
				},
			};
			const tmpOpts = {
				...opts,
				constants,
			};

			const target = new SearchUtility(tmpOpts);

			const expected = 'cardView';
			const actual = target.getQueryVariable(
				'tabName',
				'gamechanger?q=Special%20Operations%20Weather&offset=0&searchType=Keyword&tabName=cardView&orgFilter=Joint%20Chiefs%20of%20Staff_US%20Air%20Force'
			);
			assert.deepEqual(actual, expected);
		});
	});

	describe('#getESSuggesterQuery()', function () {
		it('should create the ElasticSearch suggester query from searchText', () => {
			const body = { searchText: 'artificial intelligence', index: 'gamechanger' };
			let target = new SearchUtility(opts);
			let actual = target.getESSuggesterQuery(body);
			const expected = {
				suggest: {
					suggester: {
						term: { field: 'paragraphs.par_raw_text_t', sort: 'frequency', suggest_mode: 'popular' },
						text: 'artificial intelligence',
					},
				},
			};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#getESSuggesterPresearchQuery()', function () {
		it('should create the ElasticSearch suggester query from searchText', () => {
			const tmpOpts = {
				...opts,
				constants: {
					GAME_CHANGER_OPTS: {
						index: 'gamechanger',
						historyIndex: 'search_history',
						entityIndex: 'entities',
					},
				},
			};
			const body = { searchText: 'mission', index: 'gamechanger' };
			let target = new SearchUtility(tmpOpts);
			let actual = target.getESpresearchMultiQuery(body);
			const expected = [
				{ index: 'gamechanger' },
				{
					_source: ['display_title_s'],
					query: {
						bool: {
							filter: [{ term: { is_revoked_b: false } }],
							must: [
								{
									wildcard: {
										'display_title_s.search': {
											boost: 1,
											rewrite: 'constant_score',
											value: '*mission*',
										},
									},
								},
							],
						},
					},
					size: 4,
				},
				{ index: 'search_history' },
				{
					aggs: {
						search_query: {
							aggs: { user: { terms: { field: 'user_id', size: 3 } } },
							terms: { field: 'search_query', min_doc_count: 5 },
						},
					},
					query: { prefix: { search_query: { value: 'mission' } } },
					size: 1,
				},
				{ index: 'entities' },
				{
					_source: { includes: ['name', 'aliases', 'entity_type'] },
					query: { prefix: { name: { value: 'mission' } } },
					size: 2,
				},
			];
			assert.deepStrictEqual(actual, expected);
		});
	});
	describe('#getSearchCount', () => {
		it('should get search count query', () => {
			const tmpOpts = {
				...opts,
				constants: {
					GAME_CHANGER_OPTS: {
						index: 'gamechanger',
						historyIndex: 'search_history',
						entityIndex: 'entities',
					},
				},
			};
			const daysBack = 14;
			let target = new SearchUtility(tmpOpts);
			let actual = target.getSearchCountQuery(daysBack);
			const expected = {
				aggs: {
					searchTerms: {
						aggs: { user: { terms: { field: 'user_id', size: 2 } } },
						terms: { field: 'search_query', size: 1000 },
					},
				},
				query: {
					bool: {
						must: [{ range: { run_time: { gte: 'now-14d/d', lt: 'now/d' } } }],
						must_not: [{ terms: { search_query: undefined } }],
					},
				},
				size: 1,
			};

			assert.deepStrictEqual(actual, expected);
		});
	});
	describe('#getEsSearchTerms()', function () {
		it('should get ES search terms from searchText', () => {
			const body = { searchText: 'mission', index: 'gamechanger' };
			let target = new SearchUtility(opts);
			let actual = target.getEsSearchTerms(body);
			const expected = ['mission', ['mission']];
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#getPopularQuery()', function () {
		it('should get popular documents query', () => {
			let target = new SearchUtility(opts);
			let actual = target.getPopularDocsQuery();
			const expected = {
				_source: ['title', 'filename', 'pop_score', 'id'],
				from: 0,
				query: { range: { pop_score: { gte: 10 } } },
				size: 10,
				sort: [{ pop_score: { order: 'desc' } }],
			};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#getElasticsearchQuery', () => {
		it('should return an es query given parsedQuery and defaults', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: { allow_daterange: false }, STOP_WORDS: ['word'] },
			};

			const parsedQuery = 'artificial intelligence';
			let target = new SearchUtility(tmpOpts);

			const actual = target.getElasticsearchQuery({
				searchText: 'test',
				searchTerms: 'test',
				parsedQuery,
				orgFilterString: [],
				typeFilterString: [],
			});
			const expected = {
				_source: {
					includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', 'topics_s'],
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
					'p_text',
					'type',
					'p_page',
					'display_title_s',
					'display_org_s',
					'display_doc_type_s',
					'is_revoked_b',
					'access_timestamp_dt',
					'publication_date_dt',
					'crawler_used_s',
					'download_url_s',
					'source_page_url_s',
					'source_fqdn_s',
					'topics_s',
					'top_entities_t',
				],
				from: 0,
				size: 20,
				aggregations: {
					doc_type_aggs: {
						terms: {
							field: 'display_doc_type_s',
							size: 10000,
						},
					},
					doc_org_aggs: {
						terms: {
							field: 'display_org_s',
							size: 10000,
						},
					},
				},
				track_total_hits: true,
				query: {
					bool: {
						must: [],
						should: [
							{
								nested: {
									path: 'paragraphs',
									inner_hits: {
										_source: false,
										stored_fields: ['paragraphs.page_num_i', 'paragraphs.par_raw_text_t'],
										from: 0,
										size: 100,
										highlight: {
											fields: {
												'paragraphs.par_raw_text_t': {
													fragment_size: 270,
													number_of_fragments: 1,
													type: 'plain',
												},
												'paragraphs.par_raw_text_t.gc_english': {
													fragment_size: 270,
													number_of_fragments: 1,
													type: 'plain',
												},
											},
											fragmenter: 'span',
										},
									},
									query: {
										bool: {
											should: [
												{
													query_string: {
														query: 'artificial intelligence',
														default_field: 'paragraphs.par_raw_text_t.gc_english',
														default_operator: 'and',
														fuzzy_max_expansions: 100,
														fuzziness: 'AUTO',
														analyzer: 'gc_english',
														boost: 0.5,
													},
												},
											],
										},
									},
									score_mode: 'sum',
								},
							},
							{
								wildcard: {
									keyw_5: {
										value: '*artificial intelligence*',
										boost: 5,
									},
								},
							},
							{
								wildcard: {
									'display_title_s.search': {
										value: '*artificial intelligence*',
										boost: 15,
										case_insensitive: true,
									},
								},
							},
							{
								fuzzy: {
									'display_title_s.search': {
										value: 'artificial intelligence',
										fuzziness: 'AUTO',
										transpositions: false,
										boost: 15,
									},
								},
							},
							{
								wildcard: {
									'filename.search': {
										value: '*artificial intelligence*',
										boost: 10,
										case_insensitive: true,
									},
								},
							},
							{
								wildcard: {
									'display_source_s.search': {
										value: '*artificial intelligence*',
										boost: 4,
									},
								},
							},
							{
								wildcard: {
									'top_entities_t.search': {
										value: '*artificial intelligence*',
										boost: 5,
									},
								},
							},
							{
								match_phrase: {
									'display_title_s.search': 'artificial intelligence',
								},
							},
							{
								query_string: {
									fields: ['display_title_s.search'],
									query: '*artificial* AND *intelligence*',
									type: 'best_fields',
									boost: 10,
									analyzer: 'gc_english',
								},
							},
						],
						minimum_should_match: 1,
						filter: [
							{
								term: {
									is_revoked_b: 'false',
								},
							},
						],
					},
				},
				highlight: {
					require_field_match: false,
					fields: {
						'display_title_s.search': {},
						keyw_5: {},
						'filename.search': {},
						'display_source_s.search': {},
						top_entities_t: {},
						topics_s: {},
					},
					fragment_size: 10,
					fragmenter: 'simple',
					type: 'unified',
					boundary_scanner: 'word',
				},
				sort: [
					{
						_score: {
							order: 'desc',
						},
					},
					{ _id: 'desc' },
				],
			};
			assert.deepStrictEqual(actual, expected);
		});

		it('should return sorted ES query (pub date)', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: { allow_daterange: false }, STOP_WORDS: ['word'] },
			};

			const parsedQuery = 'artificial intelligence';
			let target = new SearchUtility(tmpOpts);
			const actual = target.getElasticsearchQuery({
				searchText: 'test',
				searchTerms: 'test',
				parsedQuery,
				orgFilterString: [],
				typeFilterString: [],
				sort: 'Publishing Date',
			});
			assert.deepStrictEqual(actual.sort, [{ publication_date_dt: { order: 'desc' } }, { _id: 'desc' }]);
		});

		it('should return sorted ES query (alpha)', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: { allow_daterange: false }, STOP_WORDS: ['word'] },
			};

			const parsedQuery = 'artificial intelligence';
			let target = new SearchUtility(tmpOpts);
			const actual = target.getElasticsearchQuery({
				searchText: 'test',
				searchTerms: 'test',
				parsedQuery,
				orgFilterString: [],
				typeFilterString: [],
				sort: 'Alphabetical',
			});
			assert.deepStrictEqual(actual.sort, [{ display_title_s: { order: 'desc' } }, { _id: 'desc' }]);
		});

		it('should return sorted ES query (References)', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: { allow_daterange: false }, STOP_WORDS: ['word'] },
			};

			const parsedQuery = 'artificial intelligence';
			let target = new SearchUtility(tmpOpts);
			const actual = target.getElasticsearchQuery({
				searchText: 'test',
				searchTerms: 'test',
				parsedQuery,
				orgFilterString: [],
				typeFilterString: [],
				sort: 'References',
			});
			assert.deepStrictEqual(actual.sort, [
				{
					_script: {
						type: 'number',
						script: 'doc.ref_list.size()',
						order: 'desc',
					},
				},
				{ _id: 'desc' },
			]);
		});
	});

	describe('#getElasticsearchQueryForGraphCache', () => {
		it('should return an es query given parsedQuery and defaults', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: { allow_daterange: false }, STOP_WORDS: ['word'] },
			};

			let target = new SearchUtility(tmpOpts);

			const actual = target.getElasticsearchQueryForGraphCache({}, 'test');
			const expected = {
				_source: false,
				query: { match_all: {} },
				size: 1000,
				sort: [{ id: 'asc' }],
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
				],
				track_total_hits: true,
			};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#cleanUpIdEsResults', function () {
		it('should return with searchData and pageHits when a search is done', () => {
			const user = 'fake user';
			const raw = RAW_ES_BODY_SEARCH_RESPONSE;
			const searchTerms = [`"requirement to conclude a bilateral agreement"`, 'rocket'];

			const target = new SearchUtility(opts);
			const actual = target.cleanUpIdEsResults(raw, searchTerms, user, [], true);
			const expected = {
				docIds: ['Title 22.pdf_0'],
				docs: [
					{
						display_doc_type_s: 'Title',
						display_org_s: 'US House of Representatives',
						display_title_s: 'Foreign Relations and Intercourse',
						doc_num: '22',
						doc_type: 'Title',
						filename: 'Title 22.pdf',
						id: 'Title 22.pdf_0',
						keyw_5: [
							'effective date',
							'congressional committees',
							'fiscal year',
							'foreign relations',
							'international development',
							'foreign affairs',
							'complete classification',
							'foreign service',
							'human rights',
							'international organizations',
						],
						page_count: 3355,
						ref_list: [
							'Title 50',
							'Title 3',
							'Title 8',
							'Title 31',
							'Title 18',
							'Title 28',
							'Title28',
							'Title 10',
							'Title 2',
							'Title 12',
							'Title 15',
							'Title 30',
						],
						summary_30:
							'WHenhancedRenhancedAS the Congress of the United Nationsited Nationsited States, in section 620 of the Foreign Assistance Act of 1961 (75 including section 301 of title 3, United Nationsited Nationsited States Code, I hereby delegate to the Secretary of the Treasury the Any agency or officer of the United Nationsited Nationsited States government-ownedvernment carrying out functions under this chapter comparable information on covered United Nationsited Nationsited States foreign assistance programs, including all including section 301 of title 3 of the United Nationsited Nationsited States Code, I hereby delegate to the Secretary of Defense the The United Nationsited Nationsited States government-ownedvernment shall terminate assistance to that country under the Foreign',
						title: 'Foreign Relations and Intercourse',
						type: 'document',
					},
				],
				expansionDict: [],
				pubIds: ['Title 22'],
				searchTerms: ['"requirement to conclude a bilateral agreement"', 'rocket'],
				totalCount: 1,
			};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#cleanUpEsResults', function () {
		it('should flatten results and add pageHits when a search is done', () => {
			const user = 'fake user';
			const raw = RAW_ES_BODY_SEARCH_RESPONSE;
			const searchTerms = [`"requirement to conclude a bilateral agreement"`, 'rocket'];

			const target = new SearchUtility(opts);
			const actual = target.cleanUpEsResults({
				raw,
				searchTerms,
				user,
				selectedDocuments: null,
				expansionDict: [],
				index: 'gamechanger',
				query: undefined,
			});
			const expected = {
				doc_orgs: [],
				doc_types: [],
				docs: [
					{
						display_doc_type_s: 'Title',
						display_org_s: 'US House of Representatives',
						display_title_s: 'Foreign Relations and Intercourse',
						doc_num: '22',
						doc_type: 'Title',
						esIndex: 'gamechanger',
						filename: 'Title 22.pdf',
						id: 'Title 22.pdf_0',
						keyw_5: 'effective date, congressional committees, fiscal year, foreign relations, international development, foreign affairs, complete classification, foreign service, human rights, international organizations',
						pageHitCount: 1,
						pageHits: [
							{
								pageNumber: 1819,
								snippet:
									'"the export of defense items .( C ) Exception for defense trade cooperation treaties ( i ) In general The <em>requirement</em> <em>to</em> <em>conclude</em> <em>a</em> <em>bilateral</em> <em>agreement</em> in accordance with subparagraph"',
							},
						],
						matchCount: 1,
						page_count: 3355,
						ref_list: [
							'Title 50',
							'Title 3',
							'Title 8',
							'Title 31',
							'Title 18',
							'Title 28',
							'Title28',
							'Title 10',
							'Title 2',
							'Title 12',
							'Title 15',
							'Title 30',
						],
						summary_30:
							'WHenhancedRenhancedAS the Congress of the United Nationsited Nationsited States, in section 620 of the Foreign Assistance Act of 1961 (75 including section 301 of title 3, United Nationsited Nationsited States Code, I hereby delegate to the Secretary of the Treasury the Any agency or officer of the United Nationsited Nationsited States government-ownedvernment carrying out functions under this chapter comparable information on covered United Nationsited Nationsited States foreign assistance programs, including all including section 301 of title 3 of the United Nationsited Nationsited States Code, I hereby delegate to the Secretary of Defense the The United Nationsited Nationsited States government-ownedvernment shall terminate assistance to that country under the Foreign',
						title: 'Foreign Relations and Intercourse',
						type: 'document',
					},
				],
				expansionDict: [],
				query: undefined,
				searchTerms: ['"requirement to conclude a bilateral agreement"', 'rocket'],
				totalCount: 1,
			};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#cleanUpIdEsResultsForGraphCache', function () {
		it('should return with searchData and pageHits when a search is done', () => {
			const user = 'fake user';
			const raw = RAW_ES_BODY_SEARCH_RESPONSE;
			const searchTerms = [`"requirement to conclude a bilateral agreement"`, 'rocket'];

			const target = new SearchUtility(opts);
			const actual = target.cleanUpIdEsResultsForGraphCache(raw, searchTerms, user, [], true);
			const expected = {
				docs: [
					{
						display_doc_type_s: 'Title',
						display_org_s: 'US House of Representatives',
						display_title_s: 'Foreign Relations and Intercourse',
						doc_num: '22',
						doc_type: 'Title',
						filename: 'Title 22.pdf',
						id: 'Title 22.pdf_0',
						keyw_5: 'effective date, congressional committees, fiscal year, foreign relations, international development, foreign affairs, complete classification, foreign service, human rights, international organizations',
						pageHitCount: 0,
						pageHits: [],
						page_count: 3355,
						ref_list: [
							'Title 50',
							'Title 3',
							'Title 8',
							'Title 31',
							'Title 18',
							'Title 28',
							'Title28',
							'Title 10',
							'Title 2',
							'Title 12',
							'Title 15',
							'Title 30',
						],
						summary_30:
							'WHenhancedRenhancedAS the Congress of the United Nationsited Nationsited States, in section 620 of the Foreign Assistance Act of 1961 (75 including section 301 of title 3, United Nationsited Nationsited States Code, I hereby delegate to the Secretary of the Treasury the Any agency or officer of the United Nationsited Nationsited States government-ownedvernment carrying out functions under this chapter comparable information on covered United Nationsited Nationsited States foreign assistance programs, including all including section 301 of title 3 of the United Nationsited Nationsited States Code, I hereby delegate to the Secretary of Defense the The United Nationsited Nationsited States government-ownedvernment shall terminate assistance to that country under the Foreign',
						title: 'Foreign Relations and Intercourse',
						type: 'document',
					},
				],
				totalCount: 1,
			};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#getElasticsearchDocDataFromId', () => {
		it('should return the right ES query', () => {
			const opts = {
				...constructorOptionsMock,
				dataLibrary: {},
			};
			const target = new SearchUtility(opts);
			const actual = target.getElasticsearchDocDataFromId({ docIds: 'test_ID' }, 'test');
			const expected = {
				_source: { includes: ['pagerank_r', 'kw_doc_score_r', 'pagerank'] },
				query: { bool: { must: { terms: { id: 'test_ID' } } } },
				size: 100,
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
					'display_doc_type_s',
					'access_timestamp_dt',
					'publication_date_dt',
					'crawler_used_s',
					'topics_s',
					'top_entities_t',
					'download_url_s',
					'source_page_url_s',
					'source_fqdn_s',
				],
				track_total_hits: true,
			};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#getQueryAndSearchTerms()', function () {
		let target = new SearchUtility(opts);

		it('should parse a single word search', () => {
			const searchText = 'fish';

			const [actualSolrSearchText, actualSearchTermsArray] = target.getQueryAndSearchTerms(searchText);
			const expectedSolrSearchText = 'fish';
			const expectedSearchTermsArray = ['fish'];
			assert.equal(actualSolrSearchText, expectedSolrSearchText);
			expect(actualSearchTermsArray).to.have.members(expectedSearchTermsArray);
		});

		it('should parse an AND search', () => {
			const searchText = 'fish and fries';

			const [actualSolrSearchText, actualSearchTermsArray] = target.getQueryAndSearchTerms(searchText);
			const expectedSolrSearchText = 'fish AND fries';
			const expectedSearchTermsArray = ['fish', 'fries'];
			assert.equal(actualSolrSearchText, expectedSolrSearchText);
			expect(actualSearchTermsArray).to.have.members(expectedSearchTermsArray);
		});

		it('should parse an OR search', () => {
			const searchText = 'fish or fries';

			const [actualSolrSearchText, actualSearchTermsArray] = target.getQueryAndSearchTerms(searchText);
			const expectedSolrSearchText = 'fish OR fries';
			const expectedSearchTermsArray = ['fish', 'fries'];
			assert.equal(actualSolrSearchText, expectedSolrSearchText);
			expect(actualSearchTermsArray).to.have.members(expectedSearchTermsArray);
		});

		it('should parse double quoted phrases', () => {
			const searchText = `"artificial intelligence"`;

			const [actualSolrSearchText, actualSearchTermsArray] = target.getQueryAndSearchTerms(searchText);
			const expectedSolrSearchText = `"artificial intelligence"`;
			const expectedSearchTermsArray = [`"artificial intelligence"`];
			assert.equal(actualSolrSearchText, expectedSolrSearchText);
			expect(actualSearchTermsArray).to.have.members(expectedSearchTermsArray);
		});

		it('should parse single quoted phrases into double quoted', () => {
			const searchText = `'artificial intelligence'`;

			const [actualSolrSearchText, actualSearchTermsArray] = target.getQueryAndSearchTerms(searchText);
			const expectedSolrSearchText = `"artificial intelligence"`;
			const expectedSearchTermsArray = [`"artificial intelligence"`];
			assert.equal(actualSolrSearchText, expectedSolrSearchText);
			expect(actualSearchTermsArray).to.have.members(expectedSearchTermsArray);
		});

		it('should allow apostrophes within double quoted phrases', () => {
			const searchText = `"general's orders"`;

			const [actualSolrSearchText, actualSearchTermsArray] = target.getQueryAndSearchTerms(searchText);
			const expectedSolrSearchText = `"general's orders"`;
			const expectedSearchTermsArray = [`"general's orders"`];
			assert.equal(actualSolrSearchText, expectedSolrSearchText);
			expect(actualSearchTermsArray).to.have.members(expectedSearchTermsArray);
		});

		it('should allow acronyms', () => {
			const searchText = 'a.i.';

			const [actualSolrSearchText, actualSearchTermsArray] = target.getQueryAndSearchTerms(searchText);
			const expectedSolrSearchText = 'a.i.';
			const expectedSearchTermsArray = ['a.i.'];
			assert.equal(actualSolrSearchText, expectedSolrSearchText);
			expect(actualSearchTermsArray).to.have.members(expectedSearchTermsArray);
		});

		it('should allow AND statements between phrases and terms', () => {
			const searchText = `'artificial intelligence' and president`;

			const [actualSolrSearchText, actualSearchTermsArray] = target.getQueryAndSearchTerms(searchText);
			const expectedSolrSearchText = `"artificial intelligence" AND president`;
			const expectedSearchTermsArray = [`"artificial intelligence"`, `president`];
			assert.equal(actualSolrSearchText, expectedSolrSearchText);
			expect(actualSearchTermsArray).to.have.members(expectedSearchTermsArray);
		});

		it('should allow OR statements between single quoted phrases and terms', () => {
			const searchText = `'command and control' or C2`;

			const [actualSolrSearchText, actualSearchTermsArray] = target.getQueryAndSearchTerms(searchText);
			const expectedSolrSearchText = `"command and control" OR c2`;
			const expectedSearchTermsArray = [`"command and control"`, `c2`];
			assert.equal(actualSolrSearchText, expectedSolrSearchText);
			expect(actualSearchTermsArray).to.have.members(expectedSearchTermsArray);
		});

		it('should allow OR statements between double quoted phrases and terms', () => {
			const searchText = `"command and control" or C2`;

			const [actualSolrSearchText, actualSearchTermsArray] = target.getQueryAndSearchTerms(searchText);
			const expectedSolrSearchText = `"command and control" OR c2`;
			const expectedSearchTermsArray = [`"command and control"`, `c2`];
			assert.equal(actualSolrSearchText, expectedSolrSearchText);
			expect(actualSearchTermsArray).to.have.members(expectedSearchTermsArray);
		});

		it('should allow OR statements between phrases and acronym terms', () => {
			const searchText = `'artificial intelligence' or a.i.`;

			const [actualSolrSearchText, actualSearchTermsArray] = target.getQueryAndSearchTerms(searchText);
			const expectedSolrSearchText = `"artificial intelligence" OR a.i.`;
			const expectedSearchTermsArray = [`"artificial intelligence"`, `a.i.`];
			assert.equal(actualSolrSearchText, expectedSolrSearchText);
			expect(actualSearchTermsArray).to.have.members(expectedSearchTermsArray);
		});
	});

	describe('#makeAliasesQuery', function () {
		it('should take in the query searchtextlist and create an ES query for aliases', () => {
			const tmpOpts = {
				...opts,
				constants: { env: { GAME_CHANGER_OPTS: { allow_daterange: false } } },
			};

			const searchTextList = ['what', 'is', 'the', 'mission', 'of', 'the', 'epa'];
			const entityLimit = 4;
			const target = new SearchUtility(tmpOpts);
			const actual = target.makeAliasesQuery(searchTextList, entityLimit);
			const expected = {
				from: 0,
				query: {
					bool: {
						should: {
							nested: {
								path: 'aliases',
								query: {
									bool: {
										should: [
											{ match: { 'aliases.name': 'what' } },
											{ match: { 'aliases.name': 'is' } },
											{ match: { 'aliases.name': 'the' } },
											{ match: { 'aliases.name': 'mission' } },
											{ match: { 'aliases.name': 'of' } },
											{ match: { 'aliases.name': 'the' } },
											{ match: { 'aliases.name': 'epa' } },
										],
									},
								},
							},
						},
					},
				},
				size: 4,
			};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#findAliases', function () {
		it('should return an alias match for an entity in the query', async () => {
			const tmpOpts = {
				...opts,
				constants: { env: { GAME_CHANGER_OPTS: { allow_daterange: false } } },
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(qaEntitiesReturn);
					},
				},
			};

			const searchTextList = ['what', 'is', 'the', 'mission', 'of', 'epa'];
			const entityLimit = 4;
			const esClientName = 'gamechanger';
			const entitiesIndex = 'entities';
			let user = 'fake-user';
			const target = new SearchUtility(tmpOpts);
			const actual = await target.findAliases(searchTextList, entityLimit, esClientName, entitiesIndex, user);
			const expected = {
				_id: 'fGIhP3oBSijRXU555yQW',
				_index: 'entities_20210624',
				_score: 4.9245024,
				_source: {
					address: 'Ariel Rios Building 1200 Pennsylvania Ave., NW Washington, DC 20460',
					aliases: [{ name: 'EPA' }],
					crawlers: '',
					entity_type: 'org',
					government_branch: 'Independent Agency',
					information:
						"The Environmental Protection Agency (EPA) is an independent executive agency of the United States federal government tasked with environmental protection matters. President Richard Nixon proposed the establishment of EPA on July 9, 1970; it began operation on December 2, 1970, after Nixon signed an executive order. The order establishing the EPA was ratified by committee hearings in the House and Senate. The agency is led by its administrator, who is appointed by the president and approved by the Senate. The current Administrator is Michael S. Regan. The EPA is not a Cabinet department, but the administrator is normally given cabinet rank.The EPA has its headquarters in Washington, D.C., regional offices for each of the agency's ten regions, and 27 laboratories. The agency conducts environmental assessment, research, and education. It has the responsibility of maintaining and enforcing national standards under a variety of environmental laws, in consultation with state, tribal, and local governments. It delegates some permitting, monitoring, and enforcement responsibility to U.S. states and the federally recognized tribes. EPA enforcement powers include fines, sanctions, and other measures. The agency also works with industries and all levels of government in a wide variety of voluntary pollution prevention programs and energy conservation efforts.In 2018, the agency had 13,758 employees. More than half of EPA's employees are engineers, scientists, and environmental protection specialists; other employees include legal, public affairs, financial, and information technologists.Many public health and environmental groups advocate for the agency and believe that it is creating a better world. Other critics believe that the agency commits government overreach by adding unnecessary regulations on business and property owners.",
					information_retrieved: '2021-06-04',
					information_source: 'Wikipedia',
					name: 'Environmental Protection Agency',
					num_mentions: '',
					parent_agency: 'United States Government',
					related_agency: '  ',
					website: 'https://www.epa.gov/',
				},
				_type: '_doc',
				match: 'EPA',
			};
			assert.deepStrictEqual(actual, expected);
		});

		it('should return no alias if no alias is matched in the query', async () => {
			const tmpOpts = {
				...opts,
				constants: { env: { GAME_CHANGER_OPTS: { allow_daterange: false } } },
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve({
							body: {
								took: 7,
								timed_out: false,
								_shards: { total: 0, successful: 0, skipped: 0, failed: 0 },
								hits: { total: { value: 0, relation: 'eq' }, max_score: 28.753735, hits: [] },
							},
						});
					},
				},
			};

			const searchTextList = [
				'what',
				'is',
				'the',
				'mission',
				'of',
				'the',
				'environmental',
				'protection',
				'agency',
			];
			const entityLimit = 4;
			const esClientName = 'gamechanger';
			const entitiesIndex = 'entities';
			let user = 'fake-user';
			const target = new SearchUtility(tmpOpts);
			const actual = await target.findAliases(searchTextList, entityLimit, esClientName, entitiesIndex, user);
			const expected = {};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#getDocumentParagraphsByParIDs', () => {
		it('should return an es query paragraph ids for compare', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: { allow_daterange: false } },
			};

			const parsedQuery = 'artificial intelligence';
			let target = new SearchUtility(tmpOpts);

			const actual = target.getDocumentParagraphsByParIDs([0, 1, 2, 3], {
				orgFilters: ['Coast Guard'],
				typeFilters: ['CFR Index'],
				dateFilter: ['2021-12-01T05:00:00.000Z', '2021-12-30T05:00:00.428Z'],
				canceledDocs: true,
			});

			const expected = {
				from: 0,
				size: 100,
				_source: { includes: ['pagerank_r', 'kw_doc_score_r'] },
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
					'p_text',
					'type',
					'p_page',
					'display_title_s',
					'display_org_s',
					'display_doc_type_s',
					'is_revoked_b',
					'access_timestamp_dt',
					'publication_date_dt',
					'crawler_used_s',
					'topics_s',
				],
				query: {
					bool: {
						filter: [
							{ terms: { display_org_s: ['Coast Guard'] } },
							{ terms: { display_doc_type_s: ['CFR Index'] } },
						],
						must: [],
						should: [
							{
								nested: {
									path: 'paragraphs',
									inner_hits: {
										_source: true,
										highlight: {
											fields: {
												'paragraphs.filename.search': { number_of_fragments: 0 },
												'paragraphs.par_raw_text_t': {
													fragment_size: 200,
													number_of_fragments: 1,
												},
											},
											fragmenter: 'span',
										},
									},
									query: { bool: { must: [{ terms: { 'paragraphs.id': [0, 1, 2, 3] } }] } },
								},
							},
						],
					},
				},
			};

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#highlightKeywords', () => {
		it('it should return a list of highlighted keys given a list of words and one to be highlighted', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: { allow_daterange: false } },
			};

			let target = new SearchUtility(tmpOpts);
			let full_kw = ['space allocations', 'space allocation', 'space acquisition'];
			let highlighted_kw = ['<em>acquisition</em>'];

			const actual = target.highlight_keywords(full_kw, highlighted_kw);

			const expected = ['space allocations', 'space allocation', 'space <em>acquisition</em>'];

			assert.deepStrictEqual(actual, expected);
		});
		it('it should return a list of highlighted keys given a list of words and multiple words to be highlighted', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: { allow_daterange: false } },
			};

			let target = new SearchUtility(tmpOpts);
			let full_kw = ['space allocations', 'space allocation', 'space acquisition'];
			let highlighted_kw = ['<em>acquisition</em>', '<em>allocations</em>'];

			const actual = target.highlight_keywords(full_kw, highlighted_kw);

			const expected = ['space <em>allocations</em>', 'space allocation', 'space <em>acquisition</em>'];

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#autocorrect', () => {
		it('it should give a correct spelled word', async () => {
			let testWord = 'nav';

			const elasticSearchData = {
				body: {
					suggest: {
						suggester: [
							{
								text: testWord,
								offset: 0,
								length: 4,
								options: [{ text: 'navy', score: 0.8888889, freq: 522 }],
							},
						],
					},
				},
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test' },
				},
				mlApi: {},
				dataApi: {
					queryElasticSearch(_esClientName, _textSuggestIndex, esQueryArray, _userId) {
						return Promise.resolve(elasticSearchData);
					},
				},
			};
			const target = new SearchUtility(opts);
			const actual = await target.autocorrect(testWord, 'gamechanger', 'test');
			const expected = 'navy';

			assert.deepStrictEqual(actual, expected);
		});
		it('it should choose the the highest score option', async () => {
			let testWord = 'nav';

			const elasticSearchData = {
				body: {
					suggest: {
						suggester: [
							{
								text: testWord,
								offset: 0,
								length: 4,
								options: [
									{ text: 'navy', score: 0.85, freq: 522 },
									{ text: 'naval', score: 0.5, freq: 522 },
								],
							},
						],
					},
				},
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test' },
				},
				mlApi: {},
				dataApi: {
					queryElasticSearch(_esClientName, _textSuggestIndex, esQueryArray, _userId) {
						return Promise.resolve(elasticSearchData);
					},
				},
			};
			const target = new SearchUtility(opts);
			const actual = await target.autocorrect(testWord, 'gamechanger', 'test');
			const expected = 'navy';

			assert.deepStrictEqual(actual, expected);
		});
		it('it should return correctly spelled words for multiple words', async () => {
			let testWord = 'nav';
			let testWord2 = 'comamand';

			const elasticSearchData = {
				body: {
					suggest: {
						suggester: [
							{
								text: testWord,
								offset: 0,
								length: 4,
								options: [{ text: 'navy', score: 0.85, freq: 522 }],
							},
							{
								text: testWord2,
								offset: 0,
								length: 4,
								options: [{ text: 'command', score: 0.8, freq: 522 }],
							},
						],
					},
				},
			};
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: { downloadLimit: 1000 },
					GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test' },
				},
				mlApi: {},
				dataApi: {
					queryElasticSearch(_esClientName, _textSuggestIndex, esQueryArray, _userId) {
						return Promise.resolve(elasticSearchData);
					},
				},
			};
			const target = new SearchUtility(opts);
			const actual = await target.autocorrect(testWord + ' ' + testWord2, 'gamechanger', 'test');
			const expected = 'navy command';

			assert.deepStrictEqual(actual, expected);
		});
	});
});
