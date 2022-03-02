const assert = require('assert');
const SearchUtility = require('../../node_app/utils/searchUtility');
const { constructorOptionsMock } = require('../resources/testUtility');
const { expect } = require('chai');
const qaESReturn = require('../resources/mockResponses/qaESReturn');
const qaEntitiesReturn = require('../resources/mockResponses/qaEntitiesReturn');
const documentSearchES = require('../resources/mockResponses/documentSearchES');

const fake_ref_list = ['Title 50', 'Title 3', 'Title 8', 'Title 31', 'Title 18', 'Title 28', 'Title28', 'Title 10', 'Title 2', 'Title 12', 'Title 15', 'Title 30'];
const RAW_ES_BODY_SEARCH_RESPONSE = {
	body: {
		hits: {
			total: {
				value: 1
			},
			hits: [{
				fields: {
					display_doc_type_s: ['Title'],
					display_org_s: ['US House of Representatives'],
					display_title_s: ['Foreign Relations and Intercourse'],
					doc_num: ['22'],
					doc_type: ['Title'],
					filename: ['Title 22.pdf'],
					id: ['Title 22.pdf_0'],
					keyw_5: ['effective date', 'congressional committees', 'fiscal year', 'foreign relations', 'international development', 'foreign affairs', 'complete classification', 'foreign service', 'human rights', 'international organizations'],
					page_count: [3355],
					ref_list: fake_ref_list,
					summary_30: ['WHenhancedRenhancedAS the Congress of the United Nationsited Nationsited States, in section 620 of the Foreign Assistance Act of 1961 (75 including section 301 of title 3, United Nationsited Nationsited States Code, I hereby delegate to the Secretary of the Treasury the Any agency or officer of the United Nationsited Nationsited States government-ownedvernment carrying out functions under this chapter comparable information on covered United Nationsited Nationsited States foreign assistance programs, including all including section 301 of title 3 of the United Nationsited Nationsited States Code, I hereby delegate to the Secretary of Defense the The United Nationsited Nationsited States government-ownedvernment shall terminate assistance to that country under the Foreign'],
					title: ['Foreign Relations and Intercourse'],
					type: ['document']
				},
				_source: {
					topics_s: ['Test']
				},
				inner_hits: {
					paragraphs: {
						hits: {
							hits: [{
								fields: {
									'paragraphs.filename.search': ['Title 22.pdf'],
									'paragraphs.page_num_i': [1818],
									'paragraphs.par_raw_text_t': ['The President may utilize the regulatory or other authority pursuant to this chapter to exempt a foreign country from the licensing requirements of this chapter with respect to exports of defense items only if the United States Government has concluded a binding bilateral agreement with the foreign country .Such agreement shall — ( i ) meet the requirements set forth in paragraph ( 2 ) ; and ( ii ) be implemented by the United States and the foreign country in a manner that is legally binding under their domestic laws .( B ) Exception for Canada The requirement to conclude a bilateral agreement in accordance with subparagraph ( A ) shall not apply with respect to an exemption for Canada from the licensing requirements of this chapter for the export of defense items .( C ) Exception for defense trade cooperation treaties ( i ) In general The requirement to conclude a bilateral agreement in accordance with subparagraph ( A ) shall not apply with respect to an exemption from the licensing requirements of this chapter for the export of defense items to give effect to any of the following defense trade cooperation treaties , provided that the treaty has entered into force pursuant to article II , section 2 , clause 2 of the Constitution of the United States : ( I ) The Treaty Between the Government of the United States of America and the Government of the United Kingdom of Great Britain and Northern Ireland Concerning Defense Trade Cooperation , done at Washington and London on June 21 and 26 , 2007 ( and any implementing arrangement thereto ) .( II ) The Treaty Between the Government of the United States of America and the Government of Australia Concerning Defense Trade Cooperation , done at Sydney September 5 , 2007 ( and any implementing arrangement thereto ) .( ii ) Limitation of scope The United States shall exempt from the scope of a treaty referred to in clause ( i ) — ( I ) complete rocket systems ( including ballistic missile systems , space launch vehicles , and sounding rockets ) or complete unmanned aerial vehicle systems ( including cruise missile systems , target drones , and reconnaissance drones ) capable of delivering at least a 500 kilogram payload to a range of 300 kilometers , and associated production facilities , software , or technology for these systems , as defined in the Missile Technology Control Regime Annex Category I , Item 1 ; ( II ) individual rocket stages , re entry vehicles and equipment , solid or liquid propellant motors or engines , guidance sets , thrust vector control systems , and associated production facilities , software , and technology , as defined in the Missile Technology Control Regime Annex Category I , Item 2 ; ( III ) defense articles and defense services listed in the Missile Technology Control Regime Annex Category II that are for use in rocket systems , as that term is used in such Annex , including associated production facilities , software , or technology ; ( IV ) toxicological agents , biological agents , and associated equipment , as listed in the United States Munitions List ( part 121.1 of chapter I of title 22 , Code of Federal Regulations ) , Category XIV , subcategories ( a ) , ( b ) , ( f ) ( 1 ) , ( i ) , ( j ) as it pertains to ( f ) ( 1 ) , ( l ) as it pertains to ( f ) ( 1 ) , and ( m ) as it pertains to all of the subcategories cited in this paragraph ; ( V ) defense articles and defense services specific to the design and testing of nuclear weapons which are controlled under United States Munitions List Category XVI ( a ) and ( b ) , along with associated defense articles in Category XVI ( d ) and technology in Category XVI ( e ) ; ( VI ) with regard to the treaty cited in clause ( i ) ( I ) , defense articles and defense services that the United States controls under the United States Munitions List that are not ']
								},
								highlight: {
									'paragraphs.par_raw_text_t': ['"the export of defense items .( C ) Exception for defense trade cooperation treaties ( i ) In general The <em>requirement</em> <em>to</em> <em>conclude</em> <em>a</em> <em>bilateral</em> <em>agreement</em> in accordance with subparagraph"']
								}
							}]
						}
					}
				}
			}]
		}
	}
};

describe('SearchUtility', function () {
	const opts = {
		...constructorOptionsMock,
		mlAPi: {},
		dataLibrary: {}
	};

	describe('#createCacheKeyFromOptions()', () => {
		const utility = new SearchUtility(opts);

		it('should have the same cache key for the same options passed in any order', () => {
			const inA = {
				searchText: 'building',
				offset: 0,
				orgFilterQuery: 'DoD OR DoDM OR DoDI OR DoDD OR DEP OR SEC OR AI OR DTM OR CJCS OR CJCSI OR CJCSM OR CJCSG OR ICD OR ICPG OR ICPM OR Title OR AGO OR TB OR AR OR TM OR STP OR ARMY OR ATP OR DA OR PAM OR TC OR HQDA OR FM OR GTA OR JTA OR CTA OR ATTP OR ADP OR (MC MISC) OR MCO OR DCG OR NAVMC OR MCRP OR MCTP OR (MCO P) OR MCWP OR FMFRP OR IRM OR MCBUL OR MCDP OR SECNAVINST OR MCIP OR SECNAV OR (NAVMC DIR) OR UM OR (DA PAM) OR NAVSUP OR MANUAL OR FMFM OR (DA FORM) OR JAGINST',
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
					OPM: false,
					'Classification Guides': false
				},
				showTutorial: false,
				useGCCache: true,
				tiny_url: 'gamechanger?tiny=38',
				searchType: 'Keyword',
				searchVersion: 1
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
					OPM: false,
					'Classification Guides': false
				},
				searchText: 'building',
				index: '',
				charsPadding: 90,
				showTutorial: false,
				useGCCache: true,
				offset: 0,
				orgFilterQuery: 'DoD OR DoDM OR DoDI OR DoDD OR DEP OR SEC OR AI OR DTM OR CJCS OR CJCSI OR CJCSM OR CJCSG OR ICD OR ICPG OR ICPM OR Title OR AGO OR TB OR AR OR TM OR STP OR ARMY OR ATP OR DA OR PAM OR TC OR HQDA OR FM OR GTA OR JTA OR CTA OR ATTP OR ADP OR (MC MISC) OR MCO OR DCG OR NAVMC OR MCRP OR MCTP OR (MCO P) OR MCWP OR FMFRP OR IRM OR MCBUL OR MCDP OR SECNAVINST OR MCIP OR SECNAV OR (NAVMC DIR) OR UM OR (DA PAM) OR NAVSUP OR MANUAL OR FMFM OR (DA FORM) OR JAGINST',
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
			let expected = {something: []};
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
			let expected = {something: []};
			assert.deepEqual(result, expected);
		});

		it('should just use ML terms if no synonyms are detected', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3']};
			const synonyms = [];
			const relatedSearches = [];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing2", "source": "ML-QE"}]};
			assert.deepEqual(result, expected);
		});

		it('should just use ML terms if synonyms are undefined', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3']};
			const synonyms = undefined;
			const relatedSearches = [];
			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected =  {"something": [{"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing2", "source": "ML-QE"}]};
			assert.deepEqual(result, expected);
		});

		it('should just use ML terms if related searches are undefined', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3']};
			const synonyms = undefined;
			const relatedSearches = undefined;
			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected =  {"something": [{"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing2", "source": "ML-QE"}]};
			assert.deepEqual(result, expected);
		});
		it('should just use related searches if no synonyms or ML expansions are detected', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = [];
			const relatedSearches = ["related search"];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "related search", "source": "related"}]};
			assert.deepEqual(result, expected);
		});

		it('should just use related searches if no synonyms or ML expansions undefined', () => {
			const target = new SearchUtility(opts);

			const expansionDict = undefined;
			const synonyms = [];
			const relatedSearches = ["related search"];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "related search", "source": "related"}]};
			assert.deepEqual(result, expected);
		});

		
		it('should just use synonyms if no ML terms are detected', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing1', 'thing2'];
			const relatedSearches = [];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches,key, abbs);
			let expected =  {something: [{phrase: 'thing1', source: 'thesaurus'}, {phrase: 'thing2', source: 'thesaurus'}]};
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
			let expected = {something: [{phrase: 'thing1', source: 'thesaurus'}, {phrase: 'thing2', source: 'thesaurus'}]};
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
			let expected = {something: [{phrase: 'expansion1', source: 'abbreviations'}, {phrase: 'expansion2', source: 'abbreviations'}]};
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
			let expected = {something: [{phrase: 'expansion1', source: 'abbreviations'}, {phrase: 'expansion2', source: 'abbreviations'}]};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are 3 of each, and no abbreviations and no related search', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3']};
			const synonyms = ['thing4', 'thing5', 'thing6'];
			const relatedSearches = [];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing6", "source": "thesaurus"}, {"phrase": "thing2", "source": "ML-QE"}]};
			assert.deepEqual(result, expected);
		});
		it('should combine ML terms, synonyms, and related search if there are 3 of each, and no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3']};
			const synonyms = ['thing4', 'thing5', 'thing6'];
			const relatedSearches = ['related 1', 'related 2'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "related 1", "source": "related"}, {"phrase": "related 2", "source": "related"}, {"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing6", "source": "thesaurus"}, {"phrase": "thing2", "source": "ML-QE"}]};
			assert.deepEqual(result, expected);
		});
		it('should combine ML terms and abbreviations if there are 3 of each, and no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3']};
			const relatedSearches = [];

			const synonyms = [];
			const key = 'something';
			const abbs = ['exp1', 'exp2', 'exp3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "exp1", "source": "abbreviations"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "exp2", "source": "abbreviations"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "exp3", "source": "abbreviations"}, {"phrase": "thing2", "source": "ML-QE"}]};
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
			let expected = {"something": [{"phrase": "exp1", "source": "abbreviations"}, {"phrase": "thing4", "source": "thesaurus"}, {"phrase": "exp2", "source": "abbreviations"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "exp3", "source": "abbreviations"}, {"phrase": "thing6", "source": "thesaurus"}]};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are > 3 of each, and no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3']};
			const relatedSearches = [];

			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing6", "source": "thesaurus"}, {"phrase": "thing2", "source": "ML-QE"}, {"phrase": "thing42", "source": "thesaurus"}]};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and abbreviations if there are > 3 of each, and no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3']};
			const relatedSearches = [];

			const synonyms = [];
			const key = 'something';
			const abbs = ['exp1', 'exp2', 'exp3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "exp1", "source": "abbreviations"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "exp2", "source": "abbreviations"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "exp3", "source": "abbreviations"}, {"phrase": "thing2", "source": "ML-QE"}]}
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
			let expected = {"something": [{"phrase": "exp1", "source": "abbreviations"}, {"phrase": "thing4", "source": "thesaurus"}, {"phrase": "exp2", "source": "abbreviations"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "exp3", "source": "abbreviations"}, {"phrase": "thing6", "source": "thesaurus"}, {"phrase": "thing42", "source": "thesaurus"}]};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are > 3 of each with a space, and no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3']};
			const relatedSearches = [];

			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const key = 'something else';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected =       {"something else": [{"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing6", "source": "thesaurus"}, {"phrase": "thing2", "source": "ML-QE"}, {"phrase": "thing42", "source": "thesaurus"}]};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and abbreviations if there are > 3 of each with a space, and no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3']};
			const relatedSearches = [];

			const synonyms = [];
			const key = 'something else';
			const abbs = ['thing4', 'thing5', 'thing6', 'thing42'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something else": [{"phrase": "thing4", "source": "abbreviations"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing5", "source": "abbreviations"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing6", "source": "abbreviations"}, {"phrase": "thing2", "source": "ML-QE"}, {"phrase": "thing42", "source": "abbreviations"}]};
			assert.deepEqual(result, expected);
		});
		it('should combine all if there are > 3 of each with a space, and no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3']};
			const relatedSearches = ['related 1', 'related 2', 'related 3'];

			const synonyms = [];
			const key = 'something else';
			const abbs = ['thing4', 'thing5', 'thing6', 'thing42'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something else": [{"phrase": "related 1", "source": "related"}, {"phrase": "related 2", "source": "related"}, {"phrase": "related 3", "source": "related"}, {"phrase": "thing4", "source": "abbreviations"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing5", "source": "abbreviations"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing6", "source": "abbreviations"}, {"phrase": "thing2", "source": "ML-QE"}, {"phrase": "thing42", "source": "abbreviations"}]};
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
			let expected = {"something else": [{"phrase": "thing1", "source": "abbreviations"}, {"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing2", "source": "abbreviations"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "thing3", "source": "abbreviations"}, {"phrase": "thing6", "source": "thesaurus"}, {"phrase": "thing41", "source": "abbreviations"}, {"phrase": "thing42", "source": "thesaurus"}]}
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
			let expected = {"something else": [{"phrase": "related 1", "source": "related"}, {"phrase": "related 2", "source": "related"}, {"phrase": "related 3", "source": "related"}, {"phrase": "thing1", "source": "abbreviations"}, {"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing2", "source": "abbreviations"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "thing3", "source": "abbreviations"}, {"phrase": "thing6", "source": "thesaurus"}, {"phrase": "thing41", "source": "abbreviations"}, {"phrase": "thing42", "source": "thesaurus"}]}
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are 4 ML terms and 2 synonyms, no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3', 'thing4']};
			const relatedSearches = [];

			const synonyms = ['thing4', 'thing5'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing2", "source": "ML-QE"}]}
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are 4 synonyms and 2 ML terms, no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1']}, wordsim: ['thing3']};
			const relatedSearches = [];

			const synonyms = ['thing4', 'thing5', 'thing6', 'thing7'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing6", "source": "thesaurus"}, {"phrase": "thing7", "source": "thesaurus"}]};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are 4 ML terms and 2 abbreviations, no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3', 'thing4']};
			const relatedSearches = [];

			const synonyms = [];
			const key = 'something';
			const abbs = ['thing4', 'thing5'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "thing4", "source": "abbreviations"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing5", "source": "abbreviations"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing2", "source": "ML-QE"}]}
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms if there are 4 synonyms and 3 ML terms, no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3']};
			const relatedSearches = [];

			const synonyms = [];
			const key = 'something';
			const abbs = ['thing4', 'thing5', 'thing6', 'thing7'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "thing4", "source": "abbreviations"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing5", "source": "abbreviations"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing6", "source": "abbreviations"}, {"phrase": "thing2", "source": "ML-QE"}, {"phrase": "thing7", "source": "abbreviations"}]};
			assert.deepEqual(result, expected
			);
		});

		it('should combine abbreviations and synonyms if there are 4 ML terms and 2 synonyms, no ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const relatedSearches = [];

			const synonyms = ['thing4', 'thing5'];

			const key = 'something';
			const abbs = ['thing1', 'thing2', 'thing3', 'thing41'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "thing1", "source": "abbreviations"}, {"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing2", "source": "abbreviations"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "thing3", "source": "abbreviations"}, {"phrase": "thing41", "source": "abbreviations"}]};
			assert.deepEqual(result, expected)
			
		});

		it('should combine abbreviations and synonyms if there are 4 synonyms and 2 ML terms, no ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing7'];
			const relatedSearches = [];

			const key = 'something';
			const abbs = ['thing1', 'thing2'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "thing1", "source": "abbreviations"}, {"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing2", "source": "abbreviations"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "thing6", "source": "thesaurus"}, {"phrase": "thing7", "source": "thesaurus"}]};
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 ML terms and no synonyms or abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3', 'thing4', 'thing5', 'thing6']};
			const synonyms = [];
			const relatedSearches = [];

			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing4", "source": "ML-QE"}, {"phrase": "thing5", "source": "ML-QE"}, {"phrase": "thing6", "source": "ML-QE"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing2", "source": "ML-QE"}]};

			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 ML terms and undefined synonyms and abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3', 'thing4', 'thing5', 'thing6']};
			const synonyms = undefined;
			const relatedSearches = [];

			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "thing3", "source": "ML-QE"}, {"phrase": "thing4", "source": "ML-QE"}, {"phrase": "thing5", "source": "ML-QE"}, {"phrase": "thing6", "source": "ML-QE"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "thing2", "source": "ML-QE"}]};
			assert.deepEqual(result,  expected);
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 synonyms and no ML terms or abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing1', 'thing2', 'thing3', 'thing4', 'thing5', 'thing6'];
			const relatedSearches = [];

			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected =  {"something": [{"phrase": "thing1", "source": "thesaurus"}, {"phrase": "thing2", "source": "thesaurus"}, {"phrase": "thing3", "source": "thesaurus"}, {"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "thing6", "source": "thesaurus"}]}
			
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

			assert.deepEqual(result, {"something": [{"phrase": "thing1", "source": "thesaurus"}, {"phrase": "thing2", "source": "thesaurus"}, {"phrase": "thing3", "source": "thesaurus"}, {"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "thing6", "source": "thesaurus"}]}
			);
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 abbreivations and no ML terms or synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const relatedSearches = [];

			const synonyms = [];
			const key = 'something';
			const abbs = ['thing1', 'thing2', 'thing3', 'thing4', 'thing5', 'thing6'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "thing1", "source": "abbreviations"}, {"phrase": "thing2", "source": "abbreviations"}, {"phrase": "thing3", "source": "abbreviations"}, {"phrase": "thing4", "source": "abbreviations"}, {"phrase": "thing5", "source": "abbreviations"}, {"phrase": "thing6", "source": "abbreviations"}]}
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
			let expected = {"something": [{"phrase": "thing1", "source": "abbreviations"}, {"phrase": "thing2", "source": "abbreviations"}, {"phrase": "thing3", "source": "abbreviations"}, {"phrase": "thing4", "source": "abbreviations"}, {"phrase": "thing5", "source": "abbreviations"}, {"phrase": "thing6", "source": "abbreviations"}]}
			
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms and abbreviations if there are > 2 of each and checking for removal of search term in ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing2']}, wordsim: ['thing3']};
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const relatedSearches = [];

			const key = 'something';
			const abbs = ['expansion1', 'expansion2', 'expansion3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "expansion1", "source": "abbreviations"}, {"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "expansion2", "source": "abbreviations"}, {"phrase": "thing5", "source": "thesaurus"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "expansion3", "source": "abbreviations"}, {"phrase": "thing6", "source": "thesaurus"}, {"phrase": "thing2", "source": "ML-QE"}, {"phrase": "thing42", "source": "thesaurus"}]}
			
			assert.deepEqual(result, expected);
		});

		it('should combine ML terms and synonyms and abbreviations if there are > 2 of two categories and 1 of the other and checking for removal of search term in ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing1']}, wordsim: ['thing3']};
			const synonyms = ['thing4'];
			const relatedSearches = [];

			const key = 'something';
			const abbs = ['expansion1', 'expansion2', 'expansion3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "expansion1", "source": "abbreviations"}, {"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "expansion2", "source": "abbreviations"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "expansion3", "source": "abbreviations"}]}
			assert.deepEqual(result, expected);
		});
		it('should combine all if there are > 2 of two categories and 1 of the other and checking for removal of search term in ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing1']}, wordsim: ['thing3']};
			const synonyms = ['thing4'];
			const relatedSearches = ['related 1', 'related 2'];

			const key = 'something';
			const abbs = ['expansion1', 'expansion2', 'expansion3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected ={"something": [{"phrase": "related 1", "source": "related"}, {"phrase": "related 2", "source": "related"}, {"phrase": "expansion1", "source": "abbreviations"}, {"phrase": "thing4", "source": "thesaurus"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "expansion2", "source": "abbreviations"}, {"phrase": "thing1", "source": "ML-QE"}, {"phrase": "expansion3", "source": "abbreviations"}]};
			assert.deepEqual(result, expected);
		});

		it('should combine all if and remove duplicates', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : ['thing1', 'thing1']}, wordsim: ['thing3']};
			const synonyms = ['thing1'];
			const relatedSearches = ['related 1', 'thing1'];

			const key = 'something';
			const abbs = ['expansion1', 'expansion2', 'expansion3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "related 1", "source": "related"}, {"phrase": "thing1", "source": "related"}, {"phrase": "expansion1", "source": "abbreviations"}, {"phrase": "thing3", "source": "ML-QE"}, {"phrase": "expansion2", "source": "abbreviations"}, {"phrase": "expansion3", "source": "abbreviations"}]};
			assert.deepEqual(result, expected);
		});
		it('ML Exp has empty lists and combines others', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {qexp: {something : []}, wordsim: []};
			const synonyms = ['thing1'];
			const relatedSearches = ['related 1', 'thing1'];

			const key = 'something';
			const abbs = ['expansion1', 'expansion2', 'expansion3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, relatedSearches, key, abbs);
			let expected = {"something": [{"phrase": "related 1", "source": "related"}, {"phrase": "thing1", "source": "related"}, {"phrase": "expansion1", "source": "abbreviations"}, {"phrase": "expansion2", "source": "abbreviations"}, {"phrase": "expansion3", "source": "abbreviations"}]};
			assert.deepEqual(result, expected);
		});
	});

	describe('#cleanExpansions()', () => {
		it('should clean expansions by removing duplciates and punctuations', () => {
			const target = new SearchUtility(opts);
			const key = 'something';
			let toReturn = {"something": [{"phrase": "related 1", "source": "related"}, {"phrase": "related 1", "source": "related"}, {"phrase": "expansion1/", "source": "abbreviations"}, {"phrase": "'expansion2'", "source": "abbreviations"}, {"phrase": "expansion3", "source": "abbreviations"}]};

			let actual = target.cleanExpansions(key, toReturn);
			let expected =       {"something": [{"phrase": "related 1", "source": "related"}, {"phrase": "expansion1", "source": "abbreviations"}, {"phrase": "expansion2", "source": "abbreviations"}, {"phrase": "expansion3", "source": "abbreviations"}]};
			assert.deepEqual(actual, expected);
		});
		it('should clean expansions by getting rid of duplicates even if one is capitalized', () => {
			const target = new SearchUtility(opts);
			const key = 'something';
			let toReturn = {"something": [{"phrase": "THING", "source": "related"}, {"phrase": "thing", "source": "related"}]}

			let actual = target.cleanExpansions(key, toReturn);
			let expected =   {"something": [{"phrase": "THING", "source": "related"}]};
			assert.deepEqual(actual, expected);
		});
	});
	describe('#getQueryVariable()', () => {
		it('should return back the value for a query variable', () => {
			const constants = {
				env: {
					GAME_CHANGER_OPTS: {
						version: 'version'
					}
				}
			};
			const tmpOpts = {
				...opts,
				constants
			};

			const target = new SearchUtility(tmpOpts);

			const expected = 'cardView';
			const actual = target.getQueryVariable('tabName', 'gamechanger?q=Special%20Operations%20Weather&offset=0&searchType=Keyword&tabName=cardView&orgFilter=Joint%20Chiefs%20of%20Staff_US%20Air%20Force');
			assert.deepEqual(actual, expected);
		});
	});

	describe('#getESSuggesterQuery()', function () {

		it('should create the ElasticSearch suggester query from searchText', () => {
			const body = { searchText: 'artificial intelligence', index: 'gamechanger' };
			let target = new SearchUtility(opts);
			let actual = target.getESSuggesterQuery(body);
			const expected = {suggest: {suggester: {term: {field: 'paragraphs.par_raw_text_t', sort: 'frequency', suggest_mode: 'popular'}, text: 'artificial intelligence'}}};
			assert.deepStrictEqual(actual, expected);
		});

	});

	describe('#getESSuggesterPresearchQuery()', function () {

		it('should create the ElasticSearch suggester query from searchText', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {index: 'gamechanger',
					historyIndex: 'search_history',
					entityIndex: 'entities'}
				}
			};
			const body = { searchText: 'mission', index: 'gamechanger' };
			let target = new SearchUtility(tmpOpts);
			let actual = target.getESpresearchMultiQuery(body);
			const expected = [{"index": "gamechanger"}, {"_source": ["display_title_s"], "query": {"bool": {"filter": [{"term": {"is_revoked_b": false}}], "must": [{"wildcard": {"display_title_s.search": {"boost": 1, "rewrite": "constant_score", "value": "*mission*"}}}]}}, "size": 4}, {"index": "search_history"}, {"aggs": {"search_query": {"aggs": {"user": {"terms": {"field": "user_id", "size": 3}}}, "terms": {"field": "search_query", "min_doc_count": 5}}}, "query": {"prefix": {"search_query": {"value": "mission"}}}, "size": 1}, {"index": "entities"}, {"_source": {"includes": ["name", "aliases", "entity_type"]}, "query": {"prefix": {"name": {"value": "mission"}}}, "size": 2}]
			assert.deepStrictEqual(actual, expected);
		});

	});
	describe('#getSearchCount', () => {
		it('should get search count query', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {index: 'gamechanger',
					historyIndex: 'search_history',
					entityIndex: 'entities'}
				}
			};
			const daysBack = 14;
			let target = new SearchUtility(tmpOpts);
			let actual = target.getSearchCountQuery(daysBack);
			const expected = {"aggs": {"searchTerms": {"aggs": {"user": {"terms": {"field": "user_id", "size": 2}}}, "terms": {"field": "search_query", "size": 1000}}}, "query": {"bool": {"must": [{"range": {"run_time": {"gte": "now-14d/d", "lt": "now/d"}}}], "must_not": [{"terms": {"search_query": undefined}}]}}, "size": 1}


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
			const expected = {'_source': ['title', 'filename', 'pop_score', 'id'], 'from': 0, 'query': {'range': {'pop_score': {'gte': 10}}}, 'size': 10, 'sort': [{'pop_score': {'order': 'desc'}}]}	 
			assert.deepStrictEqual(actual, expected);
		});

	});

	describe('#getElasticsearchQuery', () => {
		it('should return an es query given parsedQuery and defaults', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};

			const parsedQuery = 'artificial intelligence';
			let target = new SearchUtility(tmpOpts);

			const actual = target.getElasticsearchQuery({
				searchText: 'test',
				searchTerms: 'test',
				parsedQuery,
				orgFilterString: [],
				typeFilterString: []
			});
			const expected = {"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","topics_s"]},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","is_revoked_b","access_timestamp_dt","publication_date_dt","crawler_used_s","download_url_s","source_page_url_s","source_fqdn_s","topics_s","top_entities_t"],"from":0,"size":20,"aggregations":{"doc_type_aggs":{"terms":{"field":"display_doc_type_s","size":10000}},"doc_org_aggs":{"terms":{"field":"display_org_s","size":10000}}},"track_total_hits":true,"query":{"bool":{"must":[],"should":[{"nested":{"path":"paragraphs","inner_hits":{"_source":false,"stored_fields":["paragraphs.page_num_i","paragraphs.par_raw_text_t"],"from":0,"size":5,"highlight":{"fields":{"paragraphs.par_raw_text_t":{"fragment_size":270,"number_of_fragments":1,"type":"plain"},"paragraphs.par_raw_text_t.gc_english":{"fragment_size":270,"number_of_fragments":1,"type":"plain"}},"fragmenter":"span"}},"query":{"bool":{"should":[{"query_string":{"query":"artificial intelligence","default_field":"paragraphs.par_raw_text_t.gc_english","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO","analyzer":"gc_english"}}]}}}},{"wildcard":{"keyw_5":{"value":"*artificial intelligence*","boost":4}}},{"wildcard":{"display_title_s.search":{"value":"*artificial intelligence*","boost":10}}},{"wildcard":{"filename.search":{"value":"*artificial intelligence*","boost":5}}},{"wildcard":{"display_source_s.search":{"value":"*artificial intelligence*","boost":4}}},{"wildcard":{"top_entities_t.search":{"value":"*artificial intelligence*","boost":4}}},{"query_string":{"fields":["display_title_s.search"],"query":"artificial* OR *intelligence*","type":"best_fields","boost":6,"analyzer":"gc_english"}}],"minimum_should_match":1,"filter":[{"term":{"is_revoked_b":"false"}}]}},"highlight":{"require_field_match":false,"fields":{"display_title_s.search":{},"keyw_5":{},"filename.search":{},"display_source_s.search":{},"top_entities_t":{},"topics_s":{}},"fragment_size":10,"fragmenter":"simple","type":"unified","boundary_scanner":"word"},"sort":[{"_score":{"order":"desc"}}]}
			assert.deepStrictEqual(actual, expected);
		});

		it('should return sorted ES query (pub date)', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};
			const parsedQuery = 'artificial intelligence';
			let target = new SearchUtility(tmpOpts);
			const actual = target.getElasticsearchQuery({
				searchText: 'test',
				searchTerms: 'test',
				parsedQuery,
				orgFilterString: [],
				typeFilterString: [],
				sort: 'Publishing Date'
			});
			assert.deepStrictEqual(actual.sort, [ {'publication_date_dt': {'order' : 'desc'}} ]);
		});

		it('should return sorted ES query (alpha)', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};
			const parsedQuery = 'artificial intelligence';
			let target = new SearchUtility(tmpOpts);
			const actual = target.getElasticsearchQuery({
				searchText: 'test',
				searchTerms: 'test',
				parsedQuery,
				orgFilterString: [],
				typeFilterString: [],
				sort: 'Alphabetical'
			});
			assert.deepStrictEqual(actual.sort, [ {'display_title_s': {'order' : 'desc'}} ]);
		});

		it('should return sorted ES query (References)', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};
			const parsedQuery = 'artificial intelligence';
			let target = new SearchUtility(tmpOpts);
			const actual = target.getElasticsearchQuery({
				searchText: 'test',
				searchTerms: 'test',
				parsedQuery,
				orgFilterString: [],
				typeFilterString: [],
				sort: 'References'
			});
			assert.deepStrictEqual(actual.sort,  [{'_script': {
				'type': 'number',
				'script': 'doc.ref_list.size()',
				'order': 'desc'
			}}]);
		});
	});

	describe('#getElasticsearchQueryForGraphCache', () => {
		it('should return an es query given parsedQuery and defaults', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};

			let target = new SearchUtility(tmpOpts);

			const actual = target.getElasticsearchQueryForGraphCache({}, 'test');
			const expected = {_source: false, query: {match_all: {}}, size: 1000, sort: [{id: 'asc'}], stored_fields: ['filename', 'title', 'page_count', 'doc_type', 'doc_num', 'ref_list', 'id', 'summary_30', 'keyw_5', 'type'], track_total_hits: true}
;
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
			const expected = {"docIds": ["Title 22.pdf_0"], "docs": [{"display_doc_type_s": "Title", "display_org_s": "US House of Representatives", "display_title_s": "Foreign Relations and Intercourse", "doc_num": "22", "doc_type": "Title", "filename": "Title 22.pdf", "id": "Title 22.pdf_0", "keyw_5": ["effective date", "congressional committees", "fiscal year", "foreign relations", "international development", "foreign affairs", "complete classification", "foreign service", "human rights", "international organizations"], "page_count": 3355, "ref_list": ["Title 50", "Title 3", "Title 8", "Title 31", "Title 18", "Title 28", "Title28", "Title 10", "Title 2", "Title 12", "Title 15", "Title 30"], "summary_30": "WHenhancedRenhancedAS the Congress of the United Nationsited Nationsited States, in section 620 of the Foreign Assistance Act of 1961 (75 including section 301 of title 3, United Nationsited Nationsited States Code, I hereby delegate to the Secretary of the Treasury the Any agency or officer of the United Nationsited Nationsited States government-ownedvernment carrying out functions under this chapter comparable information on covered United Nationsited Nationsited States foreign assistance programs, including all including section 301 of title 3 of the United Nationsited Nationsited States Code, I hereby delegate to the Secretary of Defense the The United Nationsited Nationsited States government-ownedvernment shall terminate assistance to that country under the Foreign", "title": "Foreign Relations and Intercourse", "type": "document"}], "expansionDict": [], "pubIds": ["Title 22"], "searchTerms": ["\"requirement to conclude a bilateral agreement\"", "rocket"], "totalCount": 1}
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#cleanUpEsResults', function () {

		it('should flatten results and add pageHits when a search is done', () => {
			const user = 'fake user';
			const raw = RAW_ES_BODY_SEARCH_RESPONSE;
			const searchTerms = [`"requirement to conclude a bilateral agreement"`, 'rocket'];

			const target = new SearchUtility(opts);
			const actual = target.cleanUpEsResults(raw, searchTerms, user, null, [], 'gamechanger');
			const expected = {"doc_orgs": [], "doc_types": [], "docs": [{"display_doc_type_s": "Title", "display_org_s": "US House of Representatives", "display_title_s": "Foreign Relations and Intercourse", "doc_num": "22", "doc_type": "Title", "esIndex": "gamechanger", "filename": "Title 22.pdf", "id": "Title 22.pdf_0", "keyw_5": "effective date, congressional committees, fiscal year, foreign relations, international development, foreign affairs, complete classification, foreign service, human rights, international organizations", "pageHitCount": 1, "pageHits": [{"pageNumber": 1819, "snippet": "\"the export of defense items .( C ) Exception for defense trade cooperation treaties ( i ) In general The <em>requirement</em> <em>to</em> <em>conclude</em> <em>a</em> <em>bilateral</em> <em>agreement</em> in accordance with subparagraph\""}], "page_count": 3355, "ref_list": ["Title 50", "Title 3", "Title 8", "Title 31", "Title 18", "Title 28", "Title28", "Title 10", "Title 2", "Title 12", "Title 15", "Title 30"], "summary_30": "WHenhancedRenhancedAS the Congress of the United Nationsited Nationsited States, in section 620 of the Foreign Assistance Act of 1961 (75 including section 301 of title 3, United Nationsited Nationsited States Code, I hereby delegate to the Secretary of the Treasury the Any agency or officer of the United Nationsited Nationsited States government-ownedvernment carrying out functions under this chapter comparable information on covered United Nationsited Nationsited States foreign assistance programs, including all including section 301 of title 3 of the United Nationsited Nationsited States Code, I hereby delegate to the Secretary of Defense the The United Nationsited Nationsited States government-ownedvernment shall terminate assistance to that country under the Foreign", "title": "Foreign Relations and Intercourse", "type": "document"}], "expansionDict": [], "query": undefined, "searchTerms": ["\"requirement to conclude a bilateral agreement\"", "rocket"], "totalCount": 1}
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
			const expected = {docs: [{display_doc_type_s: 'Title', display_org_s: 'US House of Representatives', display_title_s: 'Foreign Relations and Intercourse', doc_num: '22', doc_type: 'Title', filename: 'Title 22.pdf', id: 'Title 22.pdf_0', keyw_5: 'effective date, congressional committees, fiscal year, foreign relations, international development, foreign affairs, complete classification, foreign service, human rights, international organizations', pageHitCount: 0, pageHits: [], page_count: 3355, ref_list: ['Title 50', 'Title 3', 'Title 8', 'Title 31', 'Title 18', 'Title 28', 'Title28', 'Title 10', 'Title 2', 'Title 12', 'Title 15', 'Title 30'], summary_30: 'WHenhancedRenhancedAS the Congress of the United Nationsited Nationsited States, in section 620 of the Foreign Assistance Act of 1961 (75 including section 301 of title 3, United Nationsited Nationsited States Code, I hereby delegate to the Secretary of the Treasury the Any agency or officer of the United Nationsited Nationsited States government-ownedvernment carrying out functions under this chapter comparable information on covered United Nationsited Nationsited States foreign assistance programs, including all including section 301 of title 3 of the United Nationsited Nationsited States Code, I hereby delegate to the Secretary of Defense the The United Nationsited Nationsited States government-ownedvernment shall terminate assistance to that country under the Foreign', title: 'Foreign Relations and Intercourse', type: 'document'}], totalCount: 1}
;
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#getElasticsearchDocDataFromId', () => {
		it('should return the right ES query', () => {
			const opts = {
				...constructorOptionsMock,
				dataLibrary: {}
			};
			const target = new SearchUtility(opts);
			const actual = target.getElasticsearchDocDataFromId({docIds: 'test_ID'}, 'test');
			const expected = {'_source': {'includes': ['pagerank_r', 'kw_doc_score_r', 'pagerank']}, 'query': {'bool': {'must': {'terms': {'id': 'test_ID'}}}}, 'size': 100, 'stored_fields': ['filename', 'title', 'page_count', 'doc_type', 'doc_num', 'ref_list', 'id', 'summary_30', 'keyw_5', 'type', 'pagerank_r', 'display_title_s', 'display_org_s', 'display_doc_type_s', 'access_timestamp_dt', 'publication_date_dt', 'crawler_used_s', 'topics_s', 'top_entities_t'], 'track_total_hits': true};
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

	describe('#makeBigramQueries', function () {

		it('should take in the query broken into a list, the found alias, and create bigram queries for QA', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
			};
	
			const searchTextList = ['what', 'is', 'the', 'mission', 'of', 'the', 'epa'];
			const alias = 'Environmental Protection Agency'
			const target = new SearchUtility(tmpOpts);
			const actual = target.makeBigramQueries(searchTextList, alias);
			const expected = {'docMustQueries': [{'wildcard': {'display_title_s.search': {'boost': 6, 'value': 'what is'}}}, {'query_string': {'default_field': 'paragraphs.par_raw_text_t', 'default_operator': 'AND', 'fuzziness': 'AUTO', 'fuzzy_max_expansions': 100, 'query': 'what is'}}, {'wildcard': {'display_title_s.search': {'boost': 6, 'value': 'is the'}}}, {'query_string': {'default_field': 'paragraphs.par_raw_text_t', 'default_operator': 'AND', 'fuzziness': 'AUTO', 'fuzzy_max_expansions': 100, 'query': 'is the'}}, {'wildcard': {'display_title_s.search': {'boost': 6, 'value': 'the mission'}}}, {'query_string': {'default_field': 'paragraphs.par_raw_text_t', 'default_operator': 'AND', 'fuzziness': 'AUTO', 'fuzzy_max_expansions': 100, 'query': 'the mission'}}, {'wildcard': {'display_title_s.search': {'boost': 6, 'value': 'mission of'}}}, {'query_string': {'default_field': 'paragraphs.par_raw_text_t', 'default_operator': 'AND', 'fuzziness': 'AUTO', 'fuzzy_max_expansions': 100, 'query': 'mission of'}}, {'wildcard': {'display_title_s.search': {'boost': 6, 'value': 'of the'}}}, {'query_string': {'default_field': 'paragraphs.par_raw_text_t', 'default_operator': 'AND', 'fuzziness': 'AUTO', 'fuzzy_max_expansions': 100, 'query': 'of the'}}, {'wildcard': {'display_title_s.search': {'boost': 6, 'value': 'the epa'}}}, {'query_string': {'default_field': 'paragraphs.par_raw_text_t', 'default_operator': 'AND', 'fuzziness': 'AUTO', 'fuzzy_max_expansions': 100, 'query': 'the epa'}}], 'docShouldQueries': [{'multi_match': {'fields': ['keyw_5^2', 'id^2', 'summary_30', 'paragraphs.par_raw_text_t'], 'operator': 'or', 'query': 'what is the mission of the epa'}}, {'multi_match': {'boost': 3, 'fields': ['summary_30', 'keyw_5'], 'query': 'what is', 'type': 'phrase'}}, {'multi_match': {'boost': 3, 'fields': ['summary_30', 'keyw_5'], 'query': 'is the', 'type': 'phrase'}}, {'multi_match': {'boost': 3, 'fields': ['summary_30', 'keyw_5'], 'query': 'the mission', 'type': 'phrase'}}, {'multi_match': {'boost': 3, 'fields': ['summary_30', 'keyw_5'], 'query': 'mission of', 'type': 'phrase'}}, {'multi_match': {'boost': 3, 'fields': ['summary_30', 'keyw_5'], 'query': 'of the', 'type': 'phrase'}}, {'multi_match': {'boost': 3, 'fields': ['summary_30', 'keyw_5'], 'query': 'the epa', 'type': 'phrase'}}], 'entityShouldQueries': [{'match_phrase': {'name': {'boost': 0.5, 'query': 'what is', 'slop': 2}}}, {'multi_match': {'fields': ['name', 'aliases.name'], 'query': 'what is', 'type': 'phrase_prefix'}}, {'match_phrase': {'name': {'boost': 0.5, 'query': 'is the', 'slop': 2}}}, {'multi_match': {'fields': ['name', 'aliases.name'], 'query': 'is the', 'type': 'phrase_prefix'}}, {'match_phrase': {'name': {'boost': 0.5, 'query': 'the mission', 'slop': 2}}}, {'multi_match': {'fields': ['name', 'aliases.name'], 'query': 'the mission', 'type': 'phrase_prefix'}}, {'match_phrase': {'name': {'boost': 0.5, 'query': 'mission of', 'slop': 2}}}, {'multi_match': {'fields': ['name', 'aliases.name'], 'query': 'mission of', 'type': 'phrase_prefix'}}, {'match_phrase': {'name': {'boost': 0.5, 'query': 'of the', 'slop': 2}}}, {'multi_match': {'fields': ['name', 'aliases.name'], 'query': 'of the', 'type': 'phrase_prefix'}}, {'match_phrase': {'name': {'boost': 0.5, 'query': 'the epa', 'slop': 2}}}, {'multi_match': {'fields': ['name', 'aliases.name'], 'query': 'the epa', 'type': 'phrase_prefix'}}]};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#phraseQAQuery', function () {

		it('should take in the bigram queries and return an ES query for QA context (documents)', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
			};
			const bigramQueries = {'entityShouldQueries':[{'match_phrase':{'name':{'query':'what is','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'what is','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'is the','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'is the','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'the mission','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'the mission','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'mission of','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'mission of','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'of the','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'of the','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'the jaic','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'the jaic','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'Joint Artificial Intelligence Center','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'Joint Artificial Intelligence Center','type':'phrase_prefix'}}],'docMustQueries':[{'wildcard':{'paragraphs.filename.search':{'value':'what is','boost':15}}},{'query_string':{'query':'what is','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'is the','boost':15}}},{'query_string':{'query':'is the','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'the mission','boost':15}}},{'query_string':{'query':'the mission','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'mission of','boost':15}}},{'query_string':{'query':'mission of','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'of the','boost':15}}},{'query_string':{'query':'of the','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'the jaic','boost':15}}},{'query_string':{'query':'the jaic','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'Joint Artificial Intelligence Center','boost':15}}},{'query_string':{'query':'Joint Artificial Intelligence Center','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}}],'docShouldQueries':[{'multi_match':{'query':'what is the mission of the jaic','fields':['keyw_5^2','id^2','summary_30','paragraphs.par_raw_text_t'],'operator':'or'}},{'multi_match':{'query':'what is','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'is the','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'the mission','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'mission of','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'of the','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'the jaic','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'Joint Artificial Intelligence Center','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}}]};
			const queryType = 'documents';
			const entityLimit = 4;
			const maxLength = 3000;
			const user = 'fake user';
			const target = new SearchUtility(tmpOpts);
			const actual = target.phraseQAQuery(bigramQueries, queryType, entityLimit, maxLength, user);
			const expected = {'query':{'bool':{'must':[{'nested':{'path':'paragraphs','inner_hits':{'_source':false,'stored_fields':['paragraphs.page_num_i','paragraphs.filename','paragraphs.par_raw_text_t'],'from':0,'size':100,'highlight':{'fields':{'paragraphs.filename.search':{'number_of_fragments':0},'paragraphs.par_raw_text_t':{'fragment_size':3000,'number_of_fragments':1}},'fragmenter':'span'}},'query':{'bool':{'should':[{'wildcard':{'paragraphs.filename.search':{'value':'what is','boost':15}}},{'query_string':{'query':'what is','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'is the','boost':15}}},{'query_string':{'query':'is the','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'the mission','boost':15}}},{'query_string':{'query':'the mission','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'mission of','boost':15}}},{'query_string':{'query':'mission of','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'of the','boost':15}}},{'query_string':{'query':'of the','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'the jaic','boost':15}}},{'query_string':{'query':'the jaic','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'Joint Artificial Intelligence Center','boost':15}}},{'query_string':{'query':'Joint Artificial Intelligence Center','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}}]}}}}],'should':[{'multi_match':{'query':'what is the mission of the jaic','fields':['keyw_5^2','id^2','summary_30','paragraphs.par_raw_text_t'],'operator':'or'}},{'multi_match':{'query':'what is','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'is the','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'the mission','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'mission of','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'of the','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'the jaic','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'Joint Artificial Intelligence Center','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}}]}}};
			assert.deepStrictEqual(actual, expected);
		});

		it('should take in the bigram queries and return an ES query for QA context (entities)', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
			};
			const bigramQueries = {'entityShouldQueries':[{'match_phrase':{'name':{'query':'what is','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'what is','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'is the','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'is the','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'the mission','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'the mission','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'mission of','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'mission of','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'of the','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'of the','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'the environmental','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'the environmental','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'environmental protection','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'environmental protection','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'protection agency','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'protection agency','type':'phrase_prefix'}}],'docMustQueries':[{'wildcard':{'paragraphs.filename.search':{'value':'what is','boost':15}}},{'query_string':{'query':'what is','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'is the','boost':15}}},{'query_string':{'query':'is the','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'the mission','boost':15}}},{'query_string':{'query':'the mission','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'mission of','boost':15}}},{'query_string':{'query':'mission of','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'of the','boost':15}}},{'query_string':{'query':'of the','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'the environmental','boost':15}}},{'query_string':{'query':'the environmental','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'environmental protection','boost':15}}},{'query_string':{'query':'environmental protection','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'paragraphs.filename.search':{'value':'protection agency','boost':15}}},{'query_string':{'query':'protection agency','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}}],'docShouldQueries':[{'multi_match':{'query':'what is the mission of the environmental protection agency','fields':['keyw_5^2','id^2','summary_30','paragraphs.par_raw_text_t'],'operator':'or'}},{'multi_match':{'query':'what is','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'is the','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'the mission','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'mission of','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'of the','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'the environmental','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'environmental protection','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}},{'multi_match':{'query':'protection agency','fields':['summary_30','title','keyw_5'],'type':'phrase','boost':5}}]};
			const queryType = 'entities';
			const entityLimit = 4;
			const maxLength = 3000;
			const user = 'fake user';
			const target = new SearchUtility(tmpOpts);
			const actual = target.phraseQAQuery(bigramQueries, queryType, entityLimit, maxLength, user);
			const expected = {'from':0,'size':4,'query':{'bool':{'should':[{'match_phrase':{'name':{'query':'what is','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'what is','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'is the','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'is the','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'the mission','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'the mission','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'mission of','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'mission of','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'of the','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'of the','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'the environmental','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'the environmental','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'environmental protection','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'environmental protection','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'protection agency','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'protection agency','type':'phrase_prefix'}}]}}};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#getTitle', function () {

		it('should return partial, lowercase matches on display_title field', async () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(documentSearchES);
					}
				}
			};
			let clientObj = { esClientName: "gamechanger", esIndex: "gamechanger" }
			let userId = '';
			const query = "dodi 8110.01 mission partner"
			const target = new SearchUtility(tmpOpts);
			const result = await target.getTitle(query, clientObj, userId);
			let titles = [];
			result.body.hits.hits.forEach((r) => {
				titles.push(r.fields.display_title_s[0])
			})
			const actual = titles
			const expected = ["SECNAVINST 5030.8C GENERAL GUIDANCE FOR THE CLASSIFICATION OF NAVAL VESSELS AND BATTLE FORCE SHIP COUNTING PROCEDURES", "OPNAVINST 3501.363B REQUIRED OPERATIONAL CAPABILITIES AND PROJECTED OPERATIONAL ENVIRONMENT FOR COASTAL RIVERINE FORCES", "OPNAVINST 3111.17A STRATEGIC LAYDOWN AND DISPERSAL PLAN FOR THE OPERATING FORCES OF THE U.S. NAVY", "CFETP 2A9X1X BomberSpecial (BS) Integrated CommunicationNavigationMission Systems", "AJP 3.14 ALLIED JOINT DOCTRINE FOR FORCE PROTECTION", "OPNAVINST 3111.17B STRATEGIC LAYDOWN AND DISPERSAL PLAN FOR THE OPERATING FORCES OF THE U.S. NAVY", "CJCSI 1805.01B Enlisted Professional Military Education Policy", "AFI 36-2670 TOTAL FORCE DEVELOPMENT", "OPNAVINST 5100.19F NAVY SAFETY AND OCCUPATIONAL HEALTH PROGRAM MANUAL FOR FORCES AFLOAT", "CJCS GDE 3401D CJCS Guide to the Chairman's Readiness System", "ATP 99 URBAN TACTICS", "DoDFMR V2ACH3 Volume 2A, Chapter 3 : \"Operation and Maintenance Appropriations\"", "AFMAN 13-1BCCV3 OPERATING PROCEDURES-BATTLE CONTROL CENTER (BCC)", "AFJQS 8U000 Air Force Job Qualification Standard (AFJQS) Unit Deployment Manager (UDM)", "DAFI 10-401 OPERATIONS PLANNING AND EXECUTION", "DoDM 4160.21 Defense Materiel Disposition: Instructions for Hazardous Property and Other Special Processing Materiel", "CFETP 1C5X1C2 COMMAND AND CONTROL BATTLE MANAGEMENT OPERATONS", "OPNAVINST 3501.93F REQUIRED OPERATIONAL CAPABILITIES AND PROJECTED OPERATIONAL ENVIRONMENT FOR NAVAL BEACH GROUPS AND THEIR ELEMENTS", "CJCSI 3030.01 IMPLEMENTING JOINT FORCE DEVELOPMENT AND DESIGN", "CJCSI 3115.01 Common Tactical Picture Reporting Requirements"]
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#reorderFirst', function () {

		it('should reorder a result with matching display_title to the top of the results', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
			};

			const titleResults = {"body":{"took":47,"timed_out":false,"_shards":{"total":3,"successful":3,"skipped":0,"failed":0},"hits":{"total":{"value":1,"relation":"eq"},"max_score":1,"hits":[{"_index":"gamechanger_20211014","_type":"_doc","_id":"d1a90cddb9518223136472d48ab0677d5ec03b84674e2db1b7dd371d8c15526a","_score":1,"_source":{"display_title_s": "DoDI 8110.01 Mission Partner Environment Information Sharing Capability Implementation for the DoD", "title":"Mission Partner Environment Information Sharing Capability Implementation for the DoD","filename":"DoDI 8110.01.pdf","id":"DoDI 8110.01.pdf_0","group_s":"DoDI 8110.01.pdf_0","doc_type":"DoDI","doc_num":"8110.01","type":"document","init_date":"NA","change_date":"NA","entities":["NA_1","NA_2"],"author":"NA","signature":"NA","subject":"NA","classification":"NA","par_count_i":53,"page_count":23,"keyw_5":["dod mpe","warfighting functions","mpe capabilities","trans-regional operations","supports development","supporting organizations","standardized guidance","sharing information","sharing agreements","security usd"]}}]}}}
			const results = {"body":{"took":71,"timed_out":false,"_shards":{"total":3,"successful":3,"skipped":0,"failed":0},"hits":{"total":{"value":3,"relation":"eq"},"max_score":27.600607,"hits":[{"_index":"gamechanger_20211014","_type":"_doc","_id":"efd82d2f2a725220eeba3575843d25437152a71712ec8a7ef319280c05cc394f","_score":27.600607,"_source":{"kw_doc_score_r":0.00001,"topics_s":{"chess":0.16856570971216633,"information technology":0.19194784166650866,"enterprise":0.19992821436573413,"arcyber":0.2412196706591791,"dodin":0.43229646739497485},"orgs_rs":{},"pagerank_r":0.00001},"fields":{"display_title_s":["AR 25-1 ARMY INFORMATION TECHNOLOGY"],"display_org_s":["Dept. of the Army"],"crawler_used_s":["army_pubs"],"doc_num":["25-1"],"summary_30":["network architecture and information-sharing policy, modernizing Army IT resource management processes, and ensuring Establish and manage the Army's information support plan review and approval process. Coordinate IT plans, programs, and requirements with appropriate information system security managers in accord- Internet service provider and network temporary exception to policy : Waives the requirement to use an Army Army organizations will coordinate with the supporting NEC or other service providers to determine requirements Army will use DOD Identity and Access Management data to populate and maintain strategic and tactical directories, Army Information Technology Service Management Policy"],"is_revoked_b":[false],"doc_type":["AR"],"title":["ARMY INFORMATION TECHNOLOGY"],"type":["document"],"source_page_url_s":["https://armypubs.army.mil/ProductMaps/PubForm/Details.aspx?PUB_ID=1004709"],"keyw_5":["information technology","ar 25","life cycle","investment management","data center","army information","visual information","spectrum management","public affairs","product managers"],"filename":["AR 25-1.pdf"],"access_timestamp_dt":["2021-07-27T22:27:00"],"download_url_s":["https://armypubs.army.mil/epubs/DR_pubs/DR_a/pdf/ARN18225_AR25-1_FINAL.epub"],"id":["AR 25-1.pdf_0"],"display_doc_type_s":["Document"],"ref_list":["DoD 4160.21","DoD 5500.7","DoD 5015.02","DoD 5500.07","DoD 5400.07","DoDD 8000.01","DoDD 8115.01","DoDD 8115.02","DoDD 5144.02","DoDD 5105.83","DoDD 5000.01","DoDD 5535.09","DoDD 3020.26","DoDD 5230.09","DoDD 5400.11","DoDD 8100.02","DoDD 4630.05","DoDI 8115.02","DoDI 5000.02","DoDI 5000.75","DoDI 5000.74","DoDI 8110.01","DoDI 8320.07","DoDI 8330.01","DoDI 8530.01","DoDI 5230.24","DoDI 5000.76","DoDI 8100.04","DoDI 8320.02","DoDI 8320.03","DoDI 8510.01","DoDI 4000.19","DoDI 8410.01","DoDI 8550.01","DoDI 5230.29","DoDI 5040.02","DoDI 1015.12","DoDI 1015.15","DoDI 1035.01","DoDI 5400.16","DoDI 1000.15","DoDI 1015.10","DoDI 1015.15 E","DoDI 5040.07","DoDI 8310.01","DoDI 8440.01","DoDI 8500.01","DoDI 8551.1","DoDI 8560.01","DoDI 8582.01","DoDI 4630.8","DoDM 5200.01 Volume 1","DoDM 4160.21","DoDM 5200.01, Volume 1","DoDM 5200.02","DTM 08 - 037","Title 40","Title 32","Title 10","CJCSI 3170.01","CJCSI 5128.01","CJCSI 3170.01H","CJCSI 6212.01F","CJCSI 5123.01H","CJCSI 3170.01I","CJCSI 5128.02","CJCSI 6211.02D","CJCSI 6285.01D","CJCSI 6250.01","JP 6-0","DCID 6/3","EO 13526","EO 13514","EO 12845","EO 12999","EO 12958","EO 13103","EO 13589","EO 13693","AR 25 - 1","AR 25 - 2","AR 25-1","AR 25 - 30","AR 11 - 2","AR 15 - 1","AR 380 - 5","AR 530 - 1","AR 25 - 400 - 2","AR 5 - 1","AR 70 - 1","AR 71 - 9","AR 25 - 55","AR 25-30","AR 690 - 950","AR 350 - 1","AR 25 - 13","AR 5 - 12","AR 525 - 27","AR 25 - 6","AR 73 - 1","AR 215 - 4","AR 700 - 127","AR 71 - 32","AR 500 - 3","AR 25 - 22","AR 420 - 1","AR 429 - 1","AR 360 - 1","AR 335 - 15","AR 600 - 7","AR 710 - 2","AR 215 - 1","AR 5 - 11","AR 5 - 20","AR 5 - 22","AR 12 - 1","AR 25 - 50","AR 25 - 51","AR 25 - 58","AR 25 - 59","AR 27 - 26","AR 27 - 60","AR 34 - 1","AR 190 - 53","AR 195 - 2","AR 215 - 7","AR 380 - 10","AR 380 - 40","AR 380 - 53","AR 380 - 381","AR 550 - 1","AR 640 - 30","AR 700 - 131","AR 700 - 142","AR 735 - 5","AR 750 - 1","AGO 2017 - 01","AGO 2006 - 01","AGO 2017 - 07","PAM 25 - 1 - 1","PAM 25-403","PAM 25 - 403","PAM 25 - 91","PAM 25 - 1 - 2","PAM 25-1-1","PAM 25 - 2-14","PAM 25 - 2 - 14","PAM 420 - 11","PAM 710 - 2 - 1","PAM 25 - 40","PAM 70 - 3","PAM 700 - 142","ARMY 2009 - 03","ARMY 2013 - 02","ARMY 2013 - 26","ARMY 2016 - 18","DA 25 - 51","FM 6 - 02","CTA 50 - 909"],"publication_date_dt":["2019-07-15T00:00:00"],"source_fqdn_s":["armypubs.army.mil"],"page_count":[122]},"inner_hits":{"paragraphs":{"hits":{"total":{"value":1,"relation":"eq"},"max_score":27.600607,"hits":[{"_index":"gamechanger_20211014","_type":"_doc","_id":"efd82d2f2a725220eeba3575843d25437152a71712ec8a7ef319280c05cc394f","_nested":{"field":"paragraphs","offset":215},"_score":27.600607,"fields":{"paragraphs.page_num_i":[78],"paragraphs.par_raw_text_t":["DODI 1015.10 Military Morale , Welfare , and Recreation ( MWR ) Programs DODI 1015.12 Lodging Program Resource Management DODI 1015.15 Establishment , Management , and Control of Non appropriated Fund Instrumentalities and Financial Management of Supporting Resources DODI 1035.01 Telework Policy DODI 4000.19 Support Agreements DODI 5000.02 Operation of the Defense Acquisition System DODI 5000.74 Defense Acquisition of Services DODI 5000.75 Business Systems Requirements and Acquisition DODI 5000.76 Accountability and Management of Internal Use Software ( IUS ) DODI 5040.02 Visual Information ( VI ) DODI 5040.07 Visual Information ( VI ) Productions DODI 5230.24 Distribution Statements of Technical Document DODI 5230.29 Security and Policy Review of DOD Information for Public Release DODI 5400.16 DOD Privacy Impact Assessment ( PIA ) Guidance DODI 8100.04 DOD Unified Capabilities ( UC ) DODI 8110.01 Mission Partner Environment ( MPE ) Information Sharing Capability Implementation for the DOD DODI 8310.01 Information Technology Standards in the DOD DODI 8320.02 Sharing Data , Information , and Technology ( IT ) Services in the Department of Defense DODI 8320.03 Unique Identification ( UID ) Standards for Supporting the DOD Information Enterprise DODI 8320.07 Implementing the Sharing of Data , Information , and Information Technology ( IT ) Services in the Department of Defense DODI 8330.01 Interoperability of Information Technology ( IT ) , Including National Security Systems ( NSS ) DODI 8410.01 Internet Domain Name and Internet Protocol Address Space Use and Approval "]},"highlight":{"paragraphs.par_raw_text_t.gc_english":[" Privacy Impact Assessment ( PIA ) Guidance <em>DODI</em> 8100.04 DOD Unified Capabilities ( UC ) <em>DODI</em> <em>8110.01</em> <em>Mission</em> <em>Partner</em> Environment ( MPE ) Information Sharing Capability Implementation for the DOD <em>DODI</em> 8310.01 Information Technology Standards in the DOD <em>DODI</em> 8320.02"]}}]}}}},{"_index":"gamechanger_20211014","_type":"_doc","_id":"f23124d4eb0bd5cdf0fc274beec45eee8ec7037dd12af2ea0e48ec020a14b1dd","_score":20.232485,"_source":{"kw_doc_score_r":0.00001,"topics_s":{"abcanz":0.8469349618695373,"forums":0.15898364568075746,"armies":0.1738771895202615,"stanags":0.19247560534495273,"standardization":0.11554268373092857},"orgs_rs":{},"pagerank_r":0.00001},"fields":{"display_title_s":["AR 34-1 INTEROPERABILITY"],"display_org_s":["Dept. of the Army"],"crawler_used_s":["army_pubs"],"doc_num":["34-1"],"summary_30":["The Armys policy is to develop interoperability to enhance readiness in support of United States national de- Provide NATO, MIP, ABCANZ Armies Program, and DOD MPE capability and support group leaders, project The fulfillment by a nation or Service of its obligation under the terms of a ratified NATO or ABCANZ standardization These include agreements with allies and potential coalition partners on such matters as the standardization of doctrine,"],"is_revoked_b":[false],"doc_type":["AR"],"title":["INTEROPERABILITY"],"type":["document"],"source_page_url_s":["https://armypubs.army.mil/ProductMaps/PubForm/Details.aspx?PUB_ID=1008050"],"keyw_5":["interoperability forums","interoperability agreements","internal controls","ar 34","validation cio/","term interoperability","technology sharing","technical areas","team leaders","support interoperability"],"filename":["AR 34-1.pdf"],"access_timestamp_dt":["2021-07-27T22:26:52"],"download_url_s":["https://armypubs.army.mil/epubs/DR_pubs/DR_a/pdf/ARN21781_AR34_1_EBOOK_FINAL.epub"],"id":["AR 34-1.pdf_0"],"display_doc_type_s":["Document"],"ref_list":["DoD 7000.14","DoDD 5000.01","DoDD 5132.03","DoDD 5530.3","DoDD 5230.20","DoDI 2015.4","DoDI 4120.24","DoDI 8110.01","DoDI 8330.01","DoDM 4120.24","Title 10","CJCSI 2700.01G","CJCSI 5123.01H","CJCSI 5128.01","CJCSI 6290.01","AR 34 - 1","AR 34-1","AR 25 - 30","AR 70 - 1","AR 11 - 31","AR 11 - 33","AR 380 - 10","AR 550 - 51","AR 70 - 41","AR 5 - 22","AR 380 - 5","AR 360 - 1","AR 1 - 1","AR 11 - 2","AR 12 - 1","AR 15 - 1","AR 25 - 400 - 2","AR 350 - 1","AR 570 - 9","AR 614 - 10","AR 700 - 131","PAM 25 - 403","PAM 11 - 31","PAM 70 - 3","FM 3 - 22"],"publication_date_dt":["2020-04-09T00:00:00"],"source_fqdn_s":["armypubs.army.mil"],"page_count":[37]},"inner_hits":{"paragraphs":{"hits":{"total":{"value":1,"relation":"eq"},"max_score":20.232485,"hits":[{"_index":"gamechanger_20211014","_type":"_doc","_id":"f23124d4eb0bd5cdf0fc274beec45eee8ec7037dd12af2ea0e48ec020a14b1dd","_nested":{"field":"paragraphs","offset":66},"_score":20.232485,"fields":{"paragraphs.page_num_i":[21],"paragraphs.par_raw_text_t":["DODD 5230.20 Visits and Assignments of Foreign Nationals DODI 2015.4 Defense Research , Development , Test and Evaluation ( RDT&E ) Information Exchange Program ( IEP ) DODI 4120.24 Defense Standardization Program ( DSP ) DODI 8110.01 Mission Partner Environment ( MPE ) Information Sharing Capability Implementation for the Do D DODI 8330.01 Interoperability of Information Technology ( IT ) , Including National Security Systems ( NSS ) International Cooperation in Acquisition , Technology and Logistics ( IC in AT&L ) Handbook ( Available at https://www.acq.osd.mil/ic/links/ichandbook.pdf . ) JP 3 – 0 Joint Operations ( Available at https://www.jcs.mil/doctrine/joint doctrine pubs/3 – 0 operations series / . ) JP 3 – 16 Multinational Operations ( Available at https://www.jcs.mil/doctrine/joint doctrine pubs/3 – 0 operations series / . ) Military Committee Policy for Military Operational Standardization( Available from the Central U.S . Repository , U.S . NATO Document Repository , 3072 Army Pentagon , Washington , DC 20310 – 3072 . )NATO Action Sheet PO ( 2016 ) 0179 – AS1 ( Available at nso.nato.int . ) NATO Allied Medical Publications ( Available at http://nso.nato.int/nso / . ) NSDD NATO Standardization Documents Database( The NSDD replaces Allied Administrative Publication 4 , NATO Standardization Agreements and Related Publications , and is available on NATO Standardization Office , NSDD ( Available at http://nso.nato.int/nso . ) NSOP NATO Standardization Office Procedures Presidential Policy Directive–8 National Preparedness Presidential Policy Directive–17 Countering Improvised Explosive Devices Presidential Policy Directive–23 U.S . Security Sector Assistance Policy The Army Vision ( Available at https://www.army.mil/e2/downloads/rv7/vision/the army vision.pdf . ) TRADOC Pamphlet 525 – 3 – 1 The U.S . Army in Multi Domain Operations 2028 10 USC Armed Forces 22 USC 2778 – 2780 Arms Export Control Act 22 USC 2796d Loan of materials , supplies , and equipment for research and development purposes "]},"highlight":{"paragraphs.par_raw_text_t.gc_english":["DODD 5230.20 Visits and Assignments of Foreign Nationals <em>DODI</em> 2015.4 Defense Research , Development , Test and Evaluation ( RDT&E ) Information Exchange Program ( IEP ) <em>DODI</em> 4120.24 Defense Standardization Program ( DSP ) <em>DODI</em> <em>8110.01</em> <em>Mission</em> <em>Partner</em> Environment ( MPE"]}}]}}}},{"_index":"gamechanger_20211014","_type":"_doc","_id":"d1a90cddb9518223136472d48ab0677d5ec03b84674e2db1b7dd371d8c15526a","_score":10,"_source":{"kw_doc_score_r":0.00001,"topics_s":{"uscybercom":0.1545856199762491,"dodis":0.21759227234478004,"sharing":0.5318415637796077,"cybersecurity":0.1807565173278742,"cssps":0.176412634384188},"orgs_rs":{},"pagerank_r":0.00001},"fields":{"display_title_s":["DoDI 8110.01 Mission Partner Environment Information Sharing Capability Implementation for the DoD"],"display_org_s":["Dept. of Defense"],"crawler_used_s":["dod_issuances"],"doc_num":["8110.01"],"summary_30":["Manage MPE information sharing capabilities in accordance with applicable DoD MPE information-sharing capabilities in support of joint and combined operations, leveraging Assists the DoD CIO in monitoring and evaluating MPE information sharing capabilities"],"is_revoked_b":[false],"doc_type":["DoDI"],"title":["Mission Partner Environment Information Sharing Capability Implementation for the DoD"],"type":["document"],"source_page_url_s":["https://www.esd.whs.mil/Directives/issuances/dodi/"],"keyw_5":["dod mpe","warfighting functions","mpe capabilities","trans-regional operations","supports development","supporting organizations","standardized guidance","sharing information","sharing agreements","security usd"],"filename":["DoDI 8110.01.pdf"],"access_timestamp_dt":["2021-08-28T13:30:54"],"download_url_s":["https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodi/811001p.pdf?ver=98IOYlI0vyJIaQJfLQKkAg%3d%3d"],"id":["DoDI 8110.01.pdf_0"],"display_doc_type_s":["Instruction"],"ref_list":["DoD 5400.11-R","DoDD 5144.02","DoDD 5240.01","DoDD 5230.11","DoDD 5101.22E","DoDD 3000.05","DoDD 8000.01","DoDD 5143.01","DoDD 5250.01","DoDD 5111.01","DoDD 5135.02","DoDD 5137.02","DoDD 5141.02","DoDD 3025.18","DoDD 5105.19","DoDI 8110.01","DoDI 8220.02","DoDI 5400.11","DoDI 5015.02","DoDI 8310.01","DoDI 8551.01","DoDI 8320.07","DoDI 8510.01","DoDI 5530.03","DoDI 2040.02","DoDI 8530.01","DoDI 8010.01","DoDI 5200.01","DoDI 5200.48","DoDI 8330.01","DoDI 8500.01","DoDM 5200.01","DoDM 5240.01","DoDM 5200.01 Volume 1","DoDM 5200.01 Volume 2","DoDM 5200.01 Volume 3","Title 5","Title 10","ICD 501","CJCSI 5128.02","CJCSI 5123.01H","CJCSI 6290.01","EO 12333","EO 13526","EO 13556","OMBM M-19-21"],"publication_date_dt":["2021-06-30T00:00:00"],"source_fqdn_s":["www.esd.whs.mil"],"page_count":[23]},"highlight":{"display_title_s.search":["<em>DoDI 8110.01 Mission Partner Environment Information Sharing Capability Implementation for the DoD</em>"]},"inner_hits":{"paragraphs":{"hits":{"total":{"value":0,"relation":"eq"},"max_score":null,"hits":[]}}}}]},"aggregations":{"doc_type_aggs":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"Document","doc_count":2},{"key":"Instruction","doc_count":1}]},"doc_org_aggs":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"Dept. of the Army","doc_count":2},{"key":"Dept. of Defense","doc_count":1}]}}},"statusCode":200,"headers":{"date":"Fri, 12 Nov 2021 21:16:09 GMT","content-type":"application/json; charset=UTF-8","content-length":"14870","connection":"keep-alive","access-control-allow-origin":"*"},"meta":{"context":null,"request":{"params":{"method":"POST","path":"/gamechanger/_search","body":"{\"_source\":{\"includes\":[\"pagerank_r\",\"kw_doc_score_r\",\"orgs_rs\",\"topics_s\"]},\"stored_fields\":[\"filename\",\"title\",\"page_count\",\"doc_type\",\"doc_num\",\"ref_list\",\"id\",\"summary_30\",\"keyw_5\",\"p_text\",\"type\",\"p_page\",\"display_title_s\",\"display_org_s\",\"display_doc_type_s\",\"is_revoked_b\",\"access_timestamp_dt\",\"publication_date_dt\",\"crawler_used_s\",\"download_url_s\",\"source_page_url_s\",\"source_fqdn_s\"],\"from\":0,\"size\":18,\"aggregations\":{\"doc_type_aggs\":{\"terms\":{\"field\":\"display_doc_type_s\",\"size\":10000}},\"doc_org_aggs\":{\"terms\":{\"field\":\"display_org_s\",\"size\":10000}}},\"track_total_hits\":true,\"query\":{\"bool\":{\"must\":[],\"should\":[{\"nested\":{\"path\":\"paragraphs\",\"inner_hits\":{\"_source\":false,\"stored_fields\":[\"paragraphs.page_num_i\",\"paragraphs.par_raw_text_t\"],\"from\":0,\"size\":5,\"highlight\":{\"fields\":{\"paragraphs.par_raw_text_t\":{\"fragment_size\":270,\"number_of_fragments\":1,\"type\":\"plain\"},\"paragraphs.par_raw_text_t.gc_english\":{\"fragment_size\":270,\"number_of_fragments\":1,\"type\":\"plain\"}},\"fragmenter\":\"span\"}},\"query\":{\"bool\":{\"should\":[{\"query_string\":{\"query\":\"dodi 8110.01 mission partner\",\"default_field\":\"paragraphs.par_raw_text_t.gc_english\",\"default_operator\":\"and\",\"fuzzy_max_expansions\":100,\"fuzziness\":\"AUTO\",\"analyzer\":\"gc_english\"}}]}}}},{\"wildcard\":{\"keyw_5\":{\"value\":\"*dodi 8110.01 mission partner*\"}}},{\"wildcard\":{\"display_title_s.search\":{\"value\":\"*dodi 8110.01 mission partner*\",\"boost\":10}}},{\"multi_match\":{\"query\":\"dodi 8110.01 mission partner\",\"fields\":[\"display_title_s.search\"],\"operator\":\"AND\",\"type\":\"phrase\",\"boost\":10}},{\"match\":{\"filename.search\":\"dodi 8110.01 mission partner.pdf\"}}],\"minimum_should_match\":1,\"filter\":[{\"term\":{\"is_revoked_b\":\"false\"}}]}},\"highlight\":{\"require_field_match\":false,\"fields\":{\"display_title_s.search\":{},\"keyw_5\":{},\"id\":{}},\"fragment_size\":10,\"fragmenter\":\"simple\",\"type\":\"unified\",\"boundary_scanner\":\"word\"},\"sort\":[{\"_score\":{\"order\":\"desc\"}}]}","querystring":"","headers":{"user-agent":"elasticsearch-js/7.13.0 (linux 5.10.47-linuxkit-x64; Node.js v14.18.1)","x-elastic-client-meta":"es=7.13.0,js=14.18.1,t=7.13.0,hc=14.18.1","content-type":"application/json","content-length":"1909"},"timeout":60000},"options":{},"id":3},"name":"elasticsearch-js","connection":{"url":"https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/","id":"https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/","headers":{},"deadCount":0,"resurrectTimeout":0,"_openRequests":0,"status":"alive","roles":{"master":true,"data":true,"ingest":true,"ml":false}},"attempts":0,"aborted":false}}
			const target = new SearchUtility(tmpOpts);
			const reordered = target.reorderFirst(results, titleResults);
			let titles = [];
			reordered.body.hits.hits.forEach((r) => {
				titles.push(r.fields.display_title_s[0])
			})
			const actual = titles;
			const expected = ['DoDI 8110.01 Mission Partner Environment Information Sharing Capability Implementation for the DoD','AR 25-1 ARMY INFORMATION TECHNOLOGY','AR 34-1 INTEROPERABILITY']
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#makeAliasesQuery', function () {

		it('should take in the query searchtextlist and create an ES query for aliases', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
			};
	
			const searchTextList = ['what', 'is', 'the', 'mission', 'of', 'the', 'epa'];
			const entityLimit = 4;
			const target = new SearchUtility(tmpOpts);
			const actual = target.makeAliasesQuery(searchTextList, entityLimit);
			const expected = {'from': 0, 'query': {'bool': {'should': {'nested': {'path': 'aliases', 'query': {'bool': {'should': [{'match': {'aliases.name': 'what'}}, {'match': {'aliases.name': 'is'}}, {'match': {'aliases.name': 'the'}}, {'match': {'aliases.name': 'mission'}}, {'match': {'aliases.name': 'of'}}, {'match': {'aliases.name': 'the'}}, {'match': {'aliases.name': 'epa'}}]}}}}}}, 'size': 4};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#findAliases', function () {

		it('should return an alias match for an entity in the query', async () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(qaEntitiesReturn);
					}
				}
			};
	
			const searchTextList = ['what', 'is', 'the', 'mission', 'of', 'epa'];
			const entityLimit = 4;
			const esClientName = 'gamechanger';
			const entitiesIndex = 'entities';
			let user = 'fake-user';
			const target = new SearchUtility(tmpOpts);
			const actual = await target.findAliases(searchTextList, entityLimit, esClientName, entitiesIndex, user);
			const expected =  {'_id': 'fGIhP3oBSijRXU555yQW', '_index': 'entities_20210624', '_score': 4.9245024, '_source': {'address': 'Ariel Rios Building 1200 Pennsylvania Ave., NW Washington, DC 20460', 'aliases': [{'name': 'EPA'}], 'crawlers': '', 'entity_type': 'org', 'government_branch': 'Independent Agency', 'information': 'The Environmental Protection Agency (EPA) is an independent executive agency of the United States federal government tasked with environmental protection matters. President Richard Nixon proposed the establishment of EPA on July 9, 1970; it began operation on December 2, 1970, after Nixon signed an executive order. The order establishing the EPA was ratified by committee hearings in the House and Senate. The agency is led by its administrator, who is appointed by the president and approved by the Senate. The current Administrator is Michael S. Regan. The EPA is not a Cabinet department, but the administrator is normally given cabinet rank.The EPA has its headquarters in Washington, D.C., regional offices for each of the agency\'s ten regions, and 27 laboratories. The agency conducts environmental assessment, research, and education. It has the responsibility of maintaining and enforcing national standards under a variety of environmental laws, in consultation with state, tribal, and local governments. It delegates some permitting, monitoring, and enforcement responsibility to U.S. states and the federally recognized tribes. EPA enforcement powers include fines, sanctions, and other measures. The agency also works with industries and all levels of government in a wide variety of voluntary pollution prevention programs and energy conservation efforts.In 2018, the agency had 13,758 employees. More than half of EPA\'s employees are engineers, scientists, and environmental protection specialists; other employees include legal, public affairs, financial, and information technologists.Many public health and environmental groups advocate for the agency and believe that it is creating a better world. Other critics believe that the agency commits government overreach by adding unnecessary regulations on business and property owners.', 'information_retrieved': '2021-06-04', 'information_source': 'Wikipedia', 'name': 'Environmental Protection Agency', 'num_mentions': '', 'parent_agency': 'United States Government', 'related_agency': '  ', 'website': 'https://www.epa.gov/'}, '_type': '_doc', 'match': 'EPA'};
			assert.deepStrictEqual(actual, expected);
		});

		it('should return no alias if no alias is matched in the query', async () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve({'body':{'took':7,'timed_out':false,'_shards':{'total':0,'successful':0,'skipped':0,'failed':0},'hits':{'total':{'value':0,'relation':'eq'},'max_score':28.753735,'hits':[]}}});
					}
				}
			};
	
			const searchTextList = ['what', 'is', 'the', 'mission', 'of', 'the', 'environmental', 'protection', 'agency'];
			const entityLimit = 4;
			const esClientName = 'gamechanger';
			const entitiesIndex = 'entities';
			let user = 'fake-user';
			const target = new SearchUtility(tmpOpts);
			const actual = await target.findAliases(searchTextList, entityLimit, esClientName, entitiesIndex, user);
			const expected = {}
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#filterEmptyDocs', function () {

		it('should remove results (one and two) that have no text/short text in the paragraphs field', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};
			const docs = [
				{
					_source: {
						filename: 'dummy one (fail)',
						docId: 'dummyone.pdf',
						paragraphs: [
							{par_raw_text_t: ''},
							{par_raw_text_t: ''}
						]
					}
				},
				{
					_source: {
						filename: 'dummy two (fail)',
						docId: 'dummytwo.pdf',
						paragraphs: [
							{par_raw_text_t: 'test test'},
							{par_raw_text_t: 'test test test test'}
						]
					}
				},
				{
					_source: {
						filename: 'dummy three (pass)',
						docId: 'dummythree.pdf',
						paragraphs: [
							{par_raw_text_t: '5 . A AI TF leaders and talent have been selected to start work immediately in coordination with JAIC ’s efforts .The A AI TF will establish its footprint in accordance with Carnegie Mellon ’s 90 day occupation plan , formally organize under AFC , develop and then implement an Army AI Strategy , and initiate pilot projects in coordination with S E C R E T AR Y O F T H E A R M Y W A S H I N G T O N'}
						]
					}
				}
			]
			const filterLength = 15;
			const target = new SearchUtility(tmpOpts);
			const actual = target.filterEmptyDocs(docs, filterLength);
			const expected = [				
				{
					_source: {
						filename: 'dummy three (pass)',
						docId: 'dummythree.pdf',
						paragraphs: [
							{par_raw_text_t: '5 . A AI TF leaders and talent have been selected to start work immediately in coordination with JAIC ’s efforts .The A AI TF will establish its footprint in accordance with Carnegie Mellon ’s 90 day occupation plan , formally organize under AFC , develop and then implement an Army AI Strategy , and initiate pilot projects in coordination with S E C R E T AR Y O F T H E A R M Y W A S H I N G T O N'}
						]
					}
				}
			]
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#expandParagraphs', function () {

		it('should take a full doc, par id, and min length, and return the target paragraph expanded to include text before/after', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};

			const parIdx = 0;
			const minLength = 350;
			const target = new SearchUtility(tmpOpts);
			const actual = target.expandParagraphs(qaESReturn.body.hits.hits[0], parIdx, minLength);
			const expected = ['MEMORANDUM FOR SEE DISTRIBUTION ', 'SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ', '1 . References : ', 'a . Memorandum , Deputy Secretary of Defense , June 27 , 2018 , subject : Establishment of the Joint Artificial Intelligence Center .', 'b . 2018 Department of Defense Artificial Intelligence Strategy , June 27 , 2018 .', '2 . The 2018 National Defense Strategy articulates advancements in artificial intelligence ( AI ) that will present strategic opportunities and risks .The Department of Defense ( Do D ) has directed the establishment of the Joint Artificial Intelligence Center ( JAIC ) under the Do D Chief Information Officer .The JAIC serves as the accelerator and synchronizer of Do D AI activities .The Do D Chief Information Officer is seeking partnership with the Military Services as sponsors in three locations : the Pentagon , the National Capital Region , and Pittsburgh , PA .Large scale efforts or clusters of closely related joint urgent challenges will be identified as National Military Initiatives and will be executed in partnership across Do D . These efforts serve as opportunities for synergy among efforts the respective stakeholders may initiate to achieve their statutory responsibilities .', '3 . The Army is establishing the Army AI Task Force ( A AI TF ) that will narrow an existing AI capability gap by leveraging current technological applications to enhance our warfighters , preserve peace , and , if required , fight to win .', '4 . The purpose of this directive is to establish a scalable A AI TF under U.S . Army Futures Command ( AFC ) consisting of hand selected Army personnel with specific skillsets to lead Army AI efforts and support Do D projects , principally based at Carnegie Mellon University .The end state is an empowered team that rapidly integrates and synchronizes AI activities across the Army enterprise and Do D ’s National Military Initiatives .', '5 . A AI TF leaders and talent have been selected to start work immediately in coordination with JAIC ’s efforts .The A AI TF will establish its footprint in accordance with Carnegie Mellon ’s 90 day occupation plan , formally organize under AFC , develop and then implement an Army AI Strategy , and initiate pilot projects in coordination with S E C R E T AR Y O F T H E A R M Y W A S H I N G T O N '];
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#queryOneDocQA', function () {

		it('should take in the filename of an ES result, re-query ES to get the entire doc, and return the result', async () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(qaESReturn);
					}
				}
			};

			const target = new SearchUtility(tmpOpts);
			const esClientName = 'gamechanger';
			const esIndex = 'gamechanger';
			const userId = 'fake user';
			const docId = 'OMBM M-20-29.pdf_0';
			const result = await target.queryOneDocQA(docId, esClientName, esIndex, userId);
			const expected = {'_index':'gamechanger_20210412_reparse','_type':'_doc','_id':'dc5e2cd73d91862aa51a67326659aee52e6a753d1612d77776d418055f1a813f','_score':93.40025,'_source':{'title':'ARMY ARTIFICIAL INTELLIGENCE TASK FORCE IN SUPPORT OF THE DEPARTMENT OF DEFENSE JOINT ARTIFICIAL INTELLIGENCE CENTER','filename':'ARMY DIR 2018-18.pdf','id':'ARMY DIR 2018-18.pdf_0','group_s':'ARMY DIR 2018-18.pdf_0','doc_type':'ARMY','doc_num':'2018-18','type':'document','init_date':'NA','change_date':'NA','entities':['NA_1','NA_2'],'author':'NA','signature':'NA','subject':'NA','classification':'NA','par_count_i':79,'page_count':7,'keyw_5':['a-ai tf','execution order','doctrine command','develop capabilities','data access','artificial intelligence','army intelligence','army corps','ai governance','ai agents'],'paragraphs':[{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':0,'id':'ARMY DIR 2018-18.pdf_0','par_count_i':0,'page_num_i':0,'par_raw_text_t':'','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':1,'id':'ARMY DIR 2018-18.pdf_1','par_count_i':1,'page_num_i':0,'par_raw_text_t':'MEMORANDUM FOR SEE DISTRIBUTION ','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':2,'id':'ARMY DIR 2018-18.pdf_2','par_count_i':2,'page_num_i':0,'par_raw_text_t':'SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ','entities':{'ORG_s':['Army','Army Directive','Defense'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':3,'id':'ARMY DIR 2018-18.pdf_3','par_count_i':3,'page_num_i':0,'par_raw_text_t':'1 . References : ','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':4,'id':'ARMY DIR 2018-18.pdf_4','par_count_i':4,'page_num_i':0,'par_raw_text_t':'a . Memorandum , Deputy Secretary of Defense , June 27 , 2018 , subject : Establishment of the Joint Artificial Intelligence Center .','entities':{'ORG_s':['Defense','the Joint Artificial Intelligence Center'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':5,'id':'ARMY DIR 2018-18.pdf_5','par_count_i':5,'page_num_i':0,'par_raw_text_t':'b . 2018 Department of Defense Artificial Intelligence Strategy , June 27 , 2018 .','entities':{'ORG_s':['Defense','Department of Defense Artificial Intelligence Strategy'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':6,'id':'ARMY DIR 2018-18.pdf_6','par_count_i':6,'page_num_i':0,'par_raw_text_t':'2 . The 2018 National Defense Strategy articulates advancements in artificial intelligence ( AI ) that will present strategic opportunities and risks .The Department of Defense ( Do D ) has directed the establishment of the Joint Artificial Intelligence Center ( JAIC ) under the Do D Chief Information Officer .The JAIC serves as the accelerator and synchronizer of Do D AI activities .The Do D Chief Information Officer is seeking partnership with the Military Services as sponsors in three locations : the Pentagon , the National Capital Region , and Pittsburgh , PA .Large scale efforts or clusters of closely related joint urgent challenges will be identified as National Military Initiatives and will be executed in partnership across Do D . These efforts serve as opportunities for synergy among efforts the respective stakeholders may initiate to achieve their statutory responsibilities .','entities':{'ORG_s':['National Military Initiatives','JAIC','Pentagon','the National Capital Region','The Department of Defense','Defense','the Military Services','the Joint Artificial Intelligence Center'],'GPE_s':['PA','Pittsburgh'],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':7,'id':'ARMY DIR 2018-18.pdf_7','par_count_i':7,'page_num_i':0,'par_raw_text_t':'3 . The Army is establishing the Army AI Task Force ( A AI TF ) that will narrow an existing AI capability gap by leveraging current technological applications to enhance our warfighters , preserve peace , and , if required , fight to win .','entities':{'ORG_s':['Army','AI TF','Army AI'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':8,'id':'ARMY DIR 2018-18.pdf_8','par_count_i':8,'page_num_i':0,'par_raw_text_t':'4 . The purpose of this directive is to establish a scalable A AI TF under U.S . Army Futures Command ( AFC ) consisting of hand selected Army personnel with specific skillsets to lead Army AI efforts and support Do D projects , principally based at Carnegie Mellon University .The end state is an empowered team that rapidly integrates and synchronizes AI activities across the Army enterprise and Do D ’s National Military Initiatives .','entities':{'ORG_s':['National Military Initiatives','Carnegie Mellon University','AI TF','AFC','Army','Army AI'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':9,'id':'ARMY DIR 2018-18.pdf_9','par_count_i':9,'page_num_i':0,'par_raw_text_t':'5 . A AI TF leaders and talent have been selected to start work immediately in coordination with JAIC ’s efforts .The A AI TF will establish its footprint in accordance with Carnegie Mellon ’s 90 day occupation plan , formally organize under AFC , develop and then implement an Army AI Strategy , and initiate pilot projects in coordination with S E C R E T AR Y O F T H E A R M Y W A S H I N G T O N ','entities':{'ORG_s':['JAIC','AI TF','AFC','Army','Army AI Strategy','Army AI'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':10,'id':'ARMY DIR 2018-18.pdf_10','par_count_i':0,'page_num_i':1,'par_raw_text_t':'','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':11,'id':'ARMY DIR 2018-18.pdf_11','par_count_i':1,'page_num_i':1,'par_raw_text_t':'SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ','entities':{'ORG_s':['Army','Army Directive'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':12,'id':'ARMY DIR 2018-18.pdf_12','par_count_i':2,'page_num_i':1,'par_raw_text_t':'2 the JAIC ’s National Military Initiatives .We will achieve initial operating capability 30 days from the date of this directive .','entities':{'ORG_s':['National Military Initiatives'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':13,'id':'ARMY DIR 2018-18.pdf_13','par_count_i':3,'page_num_i':1,'par_raw_text_t':'a . Location .The A AI TF will establish its main operating footprint at Carnegie Mellon ’s National Robotics Engineering Center in Pittsburgh to serve as the executor of JAIC ’s foundation and academic outreach .Smaller footprints , including the A AI TF director , will locate in the National Capital Region .A Pittsburgh location allows the A AI TF to integrate Do D efforts and leverage existing academic grants , knowledge , and experience within Carnegie Mellon .The A AI TF will expand its footprint based on specific project requirements , classification , and sponsoring organizations .','entities':{'ORG_s':['Carnegie Mellon','the National Capital Region'],'GPE_s':['the National Capital Region','Pittsburgh'],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':14,'id':'ARMY DIR 2018-18.pdf_14','par_count_i':4,'page_num_i':1,'par_raw_text_t':'b . Relationships to Cross Functional Teams .The A AI TF will collaborate and coordinate with the Cross Functional Teams ( CFTs ) to integrate and advance the Army ’s modernization priorities .The relationship with the CFTs is cross cutting , in the same manner the Position Navigation Timing and Synthetic Training Environment CFTs interact with the other CFTs .','entities':{'ORG_s':['Army'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':15,'id':'ARMY DIR 2018-18.pdf_15','par_count_i':5,'page_num_i':1,'par_raw_text_t':'c . Personnel .The A AI TF will be manned , with assistance from the Army Talent Management Task Force and U.S . Army Human Resources Command , to ensure proper talent selection within its organization for positions at the Pittsburgh location , in the National Capital Region , and with project teams to meet mission requirements .The Pittsburgh location will consist of six core personnel with talent from across the Army ( Functional Areas 49 , 26 , and 51 ; Career Field 01 ; and General Schedule 1101 and 1102 series personnel ) ; academia ; and industry .Each project team will be led by a project officer ( 01A ) , and the team size will vary based on the project ’s scope .The director , a general officer , and immediate support staff will locate in the National Capital Region .','entities':{'ORG_s':['Army','the National Capital Region','Career Field 01','the Army Talent Management Task Force'],'GPE_s':['the National Capital Region','Pittsburgh'],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':16,'id':'ARMY DIR 2018-18.pdf_16','par_count_i':6,'page_num_i':1,'par_raw_text_t':'d . Responsibilities .The A AI TF , under the direction of AFC , is responsible for the life cycle of Army AI projects and projects that support the Do D level National Military Initiatives .The A AI TF will develop the Army AI Strategy , which will set the Army ’s AI developmental efforts and projects , AI governance , AI support requirements , and AI talent management .','entities':{'ORG_s':['National Military Initiatives','AFC','Army','Army AI Strategy','Army AI'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':17,'id':'ARMY DIR 2018-18.pdf_17','par_count_i':7,'page_num_i':1,'par_raw_text_t':'6 . This effort will be executed in two phases : Phase I : Establish the A AI TF and Phase II : Manning and Occupation .','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':18,'id':'ARMY DIR 2018-18.pdf_18','par_count_i':8,'page_num_i':1,'par_raw_text_t':'a . Phase I : Establish the A AI TF .Phase I begins upon publication of this directive .AFC and A AI TF will begin planning and coordination .This phase ends when the Commanding General , AFC gives a back brief of the A AI TF Roadmap to the Under ','entities':{'ORG_s':['the Commanding General','AFC'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':19,'id':'ARMY DIR 2018-18.pdf_19','par_count_i':0,'page_num_i':2,'par_raw_text_t':'','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':20,'id':'ARMY DIR 2018-18.pdf_20','par_count_i':1,'page_num_i':2,'par_raw_text_t':'SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ','entities':{'ORG_s':['Army','Army Directive'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':21,'id':'ARMY DIR 2018-18.pdf_21','par_count_i':2,'page_num_i':2,'par_raw_text_t':'3 Secretary of the Army ( USA ) and Vice Chief of Staff , Army ( VCSA ) and the A AI TF is prepared to execute its occupation plan .','entities':{'ORG_s':['Army','USA'],'GPE_s':['USA','VCSA'],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':22,'id':'ARMY DIR 2018-18.pdf_22','par_count_i':3,'page_num_i':2,'par_raw_text_t':'b . Phase II : Manning and Occupation .Phase II will begin with the USA ’s and VCSA ’s approval of the Strategic Capability Roadmap and A AI TF charter .The AFC and A AI TF will refine requirements as needed .This phase will end when the Commanding General , AFC notifies the USA and VCSA that occupation and integration is complete .','entities':{'ORG_s':['USA','the Commanding General','AFC'],'GPE_s':['USA','VCSA'],'NORP_s':[],'LAW_s':['the Strategic Capability Roadmap'],'LOC_s':[],'PERSON_s':['Manning']}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':23,'id':'ARMY DIR 2018-18.pdf_23','par_count_i':4,'page_num_i':2,'par_raw_text_t':'7 . I direct the following actions : ','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':24,'id':'ARMY DIR 2018-18.pdf_24','par_count_i':5,'page_num_i':2,'par_raw_text_t':'a . AFC will : ','entities':{'ORG_s':['AFC'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':25,'id':'ARMY DIR 2018-18.pdf_25','par_count_i':6,'page_num_i':2,'par_raw_text_t':'( 1 ) draft and staff the A AI TF execution order in conjunction with the Deputy Chief of Staff , G 3/5/7 ; and ','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':26,'id':'ARMY DIR 2018-18.pdf_26','par_count_i':7,'page_num_i':2,'par_raw_text_t':'( 2 ) provide regularly updates to Army senior leaders on the organization charter and execution order .','entities':{'ORG_s':['Army'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':27,'id':'ARMY DIR 2018-18.pdf_27','par_count_i':8,'page_num_i':2,'par_raw_text_t':'b . The AFC and A AI TF will : ','entities':{'ORG_s':['AFC'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':28,'id':'ARMY DIR 2018-18.pdf_28','par_count_i':9,'page_num_i':2,'par_raw_text_t':'( 1 ) identify existing and ongoing machine learning initiatives within the Army , including datasets , timelines , funding , outputs , and transition plans to program of records .','entities':{'ORG_s':['Army'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':29,'id':'ARMY DIR 2018-18.pdf_29','par_count_i':10,'page_num_i':2,'par_raw_text_t':'( 2 ) identify a framework and methodology for implementation of small machine learning projects that can evolve quickly to facilitate larger projects in the future .','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':30,'id':'ARMY DIR 2018-18.pdf_30','par_count_i':11,'page_num_i':2,'par_raw_text_t':'( 3 ) review policies that prohibit or impede machine learning , deep learning , and automation , and coordinate resolution .','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':31,'id':'ARMY DIR 2018-18.pdf_31','par_count_i':12,'page_num_i':2,'par_raw_text_t':'( 4 ) establish an Army AI test bed with appropriate hardware , software , and network access for experimentation , training , deployment , and testing of machine learning capabilities and workflows .','entities':{'ORG_s':['Army','Army AI'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':32,'id':'ARMY DIR 2018-18.pdf_32','par_count_i':13,'page_num_i':2,'par_raw_text_t':'( 5 ) coordinate , provide updates to , and take direction from the designated A AI TF Director for ongoing machine learning projects within the Army .','entities':{'ORG_s':['Army'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':33,'id':'ARMY DIR 2018-18.pdf_33','par_count_i':14,'page_num_i':2,'par_raw_text_t':'( 6 ) develop a talent management plan for the acquisition and retention of necessary skillsets to support Army machine learning and AI activities today and into the future .','entities':{'ORG_s':['Army'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':34,'id':'ARMY DIR 2018-18.pdf_34','par_count_i':0,'page_num_i':3,'par_raw_text_t':'','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':35,'id':'ARMY DIR 2018-18.pdf_35','par_count_i':1,'page_num_i':3,'par_raw_text_t':'SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ','entities':{'ORG_s':['Army','Army Directive'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':36,'id':'ARMY DIR 2018-18.pdf_36','par_count_i':2,'page_num_i':3,'par_raw_text_t':'4 ','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':37,'id':'ARMY DIR 2018-18.pdf_37','par_count_i':3,'page_num_i':3,'par_raw_text_t':'( 7 ) initiate the projects with the respective lead agencies to execute the stated Do D National Military Initiatives .','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':38,'id':'ARMY DIR 2018-18.pdf_38','par_count_i':4,'page_num_i':3,'par_raw_text_t':'( 8 ) initiate Service sponsored projects that include , but are not limited to : ','entities':{'ORG_s':['Service'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':39,'id':'ARMY DIR 2018-18.pdf_39','par_count_i':5,'page_num_i':3,'par_raw_text_t':'( a ) develop Direct Enhanced Autonomous Targeting and other vehicle capabilities ( AFC will lead the effort ) .','entities':{'ORG_s':['AFC'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':40,'id':'ARMY DIR 2018-18.pdf_40','par_count_i':6,'page_num_i':3,'par_raw_text_t':'( b ) coordinate with the Army Analytics Group to develop and deploy a Personnel Risk Management Tool .','entities':{'ORG_s':['the Army Analytics Group','Army'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':41,'id':'ARMY DIR 2018-18.pdf_41','par_count_i':7,'page_num_i':3,'par_raw_text_t':'( c ) coordinate with the Deputy Chief of Staff , G 2 to develop capabilities to employ operational use of intelligence to support the Long Range Precision Fires CFT .','entities':{'ORG_s':['the Long Range Precision Fires CFT'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':42,'id':'ARMY DIR 2018-18.pdf_42','par_count_i':8,'page_num_i':3,'par_raw_text_t':'c . The Commanding General , U.S . Army Materiel Command will support AFC with functional expertise and technical systems to develop predictive maintenance capabilities to decrease cost and increase readiness .','entities':{'ORG_s':['Army','AFC'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':43,'id':'ARMY DIR 2018-18.pdf_43','par_count_i':9,'page_num_i':3,'par_raw_text_t':'d . The Commanding General , U.S . Army Cyber Command will : ','entities':{'ORG_s':['Army'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':44,'id':'ARMY DIR 2018-18.pdf_44','par_count_i':10,'page_num_i':3,'par_raw_text_t':'( 1 ) facilitate rapid implementation of machine learning , deep learning , data science , and AI hardware on Army networks .','entities':{'ORG_s':['Army'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':45,'id':'ARMY DIR 2018-18.pdf_45','par_count_i':11,'page_num_i':3,'par_raw_text_t':'( 2 ) support deployment of tool suites and software libraries for machine learning projects on Army networks .','entities':{'ORG_s':['Army'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':46,'id':'ARMY DIR 2018-18.pdf_46','par_count_i':12,'page_num_i':3,'par_raw_text_t':'e . The Deputy Chief of Staff , G 1 , in coordination with the Deputy Chief of Staff , G 3/5/7 , will identify talent required by AFC for the A AI TF and initial A AI TF projects , to include directed military overstrength positions as needed , not later than 31 October 2018 .','entities':{'ORG_s':['AFC'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':47,'id':'ARMY DIR 2018-18.pdf_47','par_count_i':13,'page_num_i':3,'par_raw_text_t':'f . The Deputy Chief of Staff , G 2 will support AFC with functional expertise and technical systems to : ','entities':{'ORG_s':['AFC'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':48,'id':'ARMY DIR 2018-18.pdf_48','par_count_i':14,'page_num_i':3,'par_raw_text_t':'( 1 ) demonstrate an AI capability no later than 180 days from the date of this directive that will focus on intelligence support to operations by leveraging existing and Government owned frameworks .','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':49,'id':'ARMY DIR 2018-18.pdf_49','par_count_i':15,'page_num_i':3,'par_raw_text_t':'( 2 ) document the process and methodology necessary to employ machine learning , including necessary data processes , infrastructure , and lessons learned .','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':50,'id':'ARMY DIR 2018-18.pdf_50','par_count_i':16,'page_num_i':3,'par_raw_text_t':'','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':51,'id':'ARMY DIR 2018-18.pdf_51','par_count_i':0,'page_num_i':4,'par_raw_text_t':'','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':52,'id':'ARMY DIR 2018-18.pdf_52','par_count_i':1,'page_num_i':4,'par_raw_text_t':'SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ','entities':{'ORG_s':['Army','Army Directive'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':53,'id':'ARMY DIR 2018-18.pdf_53','par_count_i':2,'page_num_i':4,'par_raw_text_t':'5 ( 3 ) provide linkages to the Under Secretary of Defense for Intelligence Algorithmic Warfare CFT ( Project Maven ) .','entities':{'ORG_s':['Defense for Intelligence Algorithmic Warfare CFT'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':54,'id':'ARMY DIR 2018-18.pdf_54','par_count_i':3,'page_num_i':4,'par_raw_text_t':'g . The Director of the Army Staff and Deputy Chief of Staff , G 3/5/7 will codify the administrative support and reporting relationships between the Army and Secretariat staffs to the A AI TF .','entities':{'ORG_s':['Army','Secretariat','AI','the Army Staff'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':55,'id':'ARMY DIR 2018-18.pdf_55','par_count_i':4,'page_num_i':4,'par_raw_text_t':'h . The Chief Information Officer/G 6 will : ','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':56,'id':'ARMY DIR 2018-18.pdf_56','par_count_i':5,'page_num_i':4,'par_raw_text_t':'( 1 ) revise the Army Cloud Strategy to establish an accessible , secure cloud environment that is an AI - and a machine learning ready hybrid to share system data more easily to support decision making speed and lethality .','entities':{'ORG_s':['Army','Army Cloud Strategy','AI'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':57,'id':'ARMY DIR 2018-18.pdf_57','par_count_i':6,'page_num_i':4,'par_raw_text_t':'( 2 ) develop and recommend policy and procedures for an Identity , Credential , and Access Management system that will efficiently issue and verify credentials to nonperson entities/AI agents and machines that are authorized to operate on Army networks .','entities':{'ORG_s':['Army','Access Management','AI'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':58,'id':'ARMY DIR 2018-18.pdf_58','par_count_i':7,'page_num_i':4,'par_raw_text_t':'( 3 ) develop and recommend policy and procedures for a more agile certification and accreditation process that enables the rapid integration of AI and machine learning tools , including commercially available and open source software in multiple domains .','entities':{'ORG_s':['AI'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':59,'id':'ARMY DIR 2018-18.pdf_59','par_count_i':8,'page_num_i':4,'par_raw_text_t':'( 4 ) review all information technology , network , and cybersecurity policies to account for the development and employment of emerging AI capabilities and tools on Army networks .','entities':{'ORG_s':['Army','AI'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':60,'id':'ARMY DIR 2018-18.pdf_60','par_count_i':9,'page_num_i':4,'par_raw_text_t':'( 5 ) develop and recommend an Army Data Strategy that sets the conditions for the seamless use of data and applications by AI agents and machines .','entities':{'ORG_s':['Army','AI','Army Data Strategy'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':61,'id':'ARMY DIR 2018-18.pdf_61','par_count_i':10,'page_num_i':4,'par_raw_text_t':'( 6 ) develop and recommend a standards based technical architecture that establishes a common foundation that underpins all AI and machine learning capabilities , including network connectivity , data access and availability , hybrid cloud hosting capabilities , and data protection mechanisms .','entities':{'ORG_s':['AI'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':62,'id':'ARMY DIR 2018-18.pdf_62','par_count_i':11,'page_num_i':4,'par_raw_text_t':'i . The Commanding General , AFC , in coordination with the Deputy Chief of Staff , G 8 and the Assistant Secretary of the Army ( Acquisition , Logistics and Technology ) , will incorporate AI requirements as part of future concepts , requirements , and solutions .','entities':{'ORG_s':['Army','AI','AFC'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':63,'id':'ARMY DIR 2018-18.pdf_63','par_count_i':12,'page_num_i':4,'par_raw_text_t':'j . The Assistant Secretary of the Army ( Financial Management and Comptroller ) will initiate resource actions to ensure funding for fiscal year 2019 is reallocated through ','entities':{'ORG_s':['Army'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':64,'id':'ARMY DIR 2018-18.pdf_64','par_count_i':0,'page_num_i':5,'par_raw_text_t':'','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':65,'id':'ARMY DIR 2018-18.pdf_65','par_count_i':1,'page_num_i':5,'par_raw_text_t':'SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ','entities':{'ORG_s':['Army Directive'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':66,'id':'ARMY DIR 2018-18.pdf_66','par_count_i':2,'page_num_i':5,'par_raw_text_t':'6 appropriate processes to support necessary activities for the Army ’s AI initiatives .A AI TF leadership ; the Assistant Secretaries of the Army ( Financial Management and Comptroller ) and ( Acquisition , Logistics and Technology ) ; and the Deputy Chief of Staff , G 8 will deliver a confirmation briefing to the USA and VCSA .','entities':{'ORG_s':['AI TF'],'GPE_s':['USA','VCSA'],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':67,'id':'ARMY DIR 2018-18.pdf_67','par_count_i':3,'page_num_i':5,'par_raw_text_t':'k . All organizations will : ','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':68,'id':'ARMY DIR 2018-18.pdf_68','par_count_i':4,'page_num_i':5,'par_raw_text_t':'( 1 ) fund pay and entitlements for respective personnel detailed to the A AI TF .','entities':{'ORG_s':['AI TF'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':69,'id':'ARMY DIR 2018-18.pdf_69','par_count_i':5,'page_num_i':5,'par_raw_text_t':'( 2 ) support the development of the A AI TF charter .','entities':{'ORG_s':['AI TF'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':70,'id':'ARMY DIR 2018-18.pdf_70','par_count_i':6,'page_num_i':5,'par_raw_text_t':'( 3 ) support the A AI TF initial and subsequent projects .','entities':{'ORG_s':['AI TF'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':71,'id':'ARMY DIR 2018-18.pdf_71','par_count_i':7,'page_num_i':5,'par_raw_text_t':'8 . The provisions of this directive are effective immediately and apply to the Regular Army , Army National Guard/Army National Guard of the United States , and U.S . Army Reserve .','entities':{'ORG_s':['Army National Guard Army National Guard','the Regular Army'],'GPE_s':['the United States'],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':72,'id':'ARMY DIR 2018-18.pdf_72','par_count_i':8,'page_num_i':5,'par_raw_text_t':'Mark T . Esper ','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':73,'id':'ARMY DIR 2018-18.pdf_73','par_count_i':9,'page_num_i':5,'par_raw_text_t':'DISTRIBUTION : Principal Officials of Headquarters , Department of the Army Commander U.S . Army Forces Command U.S . Army Training and Doctrine Command U.S . Army Materiel Command U.S . Army Futures Command U.S . Army Pacific U.S . Army Europe U.S . Army Central U.S . Army North U.S . Army South U.S . Army Africa/Southern European Task Force U.S . Army Special Operations Command Military Surface Deployment and Distribution Command U.S . Army Space and Missile Defense Command/Army Strategic Command U.S . Army Cyber Command U.S . Army Medical Command ( CONT ) ','entities':{'ORG_s':['Principal Officials of Headquarters','CONT'],'GPE_s':[],'NORP_s':['Africa Southern European'],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':74,'id':'ARMY DIR 2018-18.pdf_74','par_count_i':0,'page_num_i':6,'par_raw_text_t':'','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':75,'id':'ARMY DIR 2018-18.pdf_75','par_count_i':1,'page_num_i':6,'par_raw_text_t':'SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ','entities':{'ORG_s':['Army Directive'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':76,'id':'ARMY DIR 2018-18.pdf_76','par_count_i':2,'page_num_i':6,'par_raw_text_t':'7 DISTRIBUTION : ( CONT ) U.S . Army Intelligence and Security Command U.S . Army Criminal Investigation Command U.S . Army Corps of Engineers U.S . Army Military District of Washington U.S . Army Test and Evaluation Command U.S . Army Installation Management Command U.S . Army Human Resources Command U.S . Army Financial Management Command U.S . Army Marketing and Engagement Brigade Superintendent , United States Military Academy Director , U.S . Army Acquisition Support Center Executive Director , Arlington National Cemetery Commandant , U.S . Army War College Director , U.S . Army Civilian Human Resources Agency ','entities':{'ORG_s':['United States','Arlington National Cemetery','Engagement Brigade Superintendent'],'GPE_s':['Washington'],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':77,'id':'ARMY DIR 2018-18.pdf_77','par_count_i':3,'page_num_i':6,'par_raw_text_t':'CF : Director , Army National Guard Director of Business Transformation Commander , Eighth Army ','entities':{'ORG_s':['Business Transformation Commander','Eighth Army','Army National Guard'],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}},{'type':'paragraph','filename':'ARMY DIR 2018-18.pdf','par_inc_count':78,'id':'ARMY DIR 2018-18.pdf_78','par_count_i':4,'page_num_i':6,'par_raw_text_t':'','entities':{'ORG_s':[],'GPE_s':[],'NORP_s':[],'LAW_s':[],'LOC_s':[],'PERSON_s':[]}}],'ref_list':['ARMY DIR 2018-18'],'topics_s':{'artificial intelligence':0.6870027164408719,'learning':0.20495664109562162,'pittsburgh':0.1818845994454403,'mellon':0.1796568171892148,'machine':0.17290160593993661},'abbreviations_n':[{'abbr_s':'task force','description_s':'tf'}],'summary_30':'skillsets to lead Army AI efforts and support DoD projects, principally based at Carnegie Management Task Force and Army Human Resources Command, to ensure','pagerank_r':0.00003509842455928412,'orgs_rs':{'Army':16,'Department of Defense':4,'Defense':1,'the Department of Defense':1,'the Military Services':1,'Pentagon':1},'kw_doc_score_r':null,'word_count':2208,'access_timestamp_dt':'2021-04-08T15:55:09','publication_date_dt':'2018-10-02T00:00:00','display_doc_type_s':'Document','display_title_s':'ARMY 2018-18 ARMY ARTIFICIAL INTELLIGENCE TASK FORCE IN SUPPORT OF THE DEPARTMENT OF DEFENSE JOINT ARTIFICIAL INTELLIGENCE CENTER','display_org_s':'US Army','is_revoked_b':false,'text_length_r':0.032247491301497656,'crawler_used_s':'army_pubs','source_fqdn_s':'armypubs.army.mil','source_page_url_s':'https://armypubs.army.mil/ProductMaps/PubForm/Details.aspx?PUB_ID=1005711','cac_login_required_b':false,'download_url_s':'https://armypubs.army.mil/epubs/DR_pubs/DR_a/pdf/web/ARN13011_AD2018_18_Final.pdf','version_hash_s':'052f9b9f80b59b8eed43d8db15a7b2a31e7496447637d33eea9ee899c2a471ee'},'inner_hits':{'paragraphs':{'hits':{'total':{'value':42,'relation':'eq'},'max_score':44.628925,'hits':[{'_index':'gamechanger_20210412_reparse','_type':'_doc','_id':'dc5e2cd73d91862aa51a67326659aee52e6a753d1612d77776d418055f1a813f','_nested':{'field':'paragraphs','offset':2},'_score':44.628925,'fields':{'paragraphs.page_num_i':[0],'paragraphs.filename':['ARMY DIR 2018-18.pdf'],'paragraphs.par_raw_text_t':['SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ']},'highlight':{'paragraphs.par_raw_text_t':['SUBJECT : <em>Army</em> Directive 2018-18 ( <em>Army</em> <em>Artificial</em> <em>Intelligence</em> Task Force in Support of the Department of Defense Joint <em>Artificial</em> <em>Intelligence</em> Center )']}},{'_index':'gamechanger_20210412_reparse','_type':'_doc','_id':'dc5e2cd73d91862aa51a67326659aee52e6a753d1612d77776d418055f1a813f','_nested':{'field':'paragraphs','offset':11},'_score':44.628925,'fields':{'paragraphs.page_num_i':[1],'paragraphs.filename':['ARMY DIR 2018-18.pdf'],'paragraphs.par_raw_text_t':['SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ']},'highlight':{'paragraphs.par_raw_text_t':['SUBJECT : <em>Army</em> Directive 2018-18 ( <em>Army</em> <em>Artificial</em> <em>Intelligence</em> Task Force in Support of the Department of Defense Joint <em>Artificial</em> <em>Intelligence</em> Center )']}},{'_index':'gamechanger_20210412_reparse','_type':'_doc','_id':'dc5e2cd73d91862aa51a67326659aee52e6a753d1612d77776d418055f1a813f','_nested':{'field':'paragraphs','offset':20},'_score':44.628925,'fields':{'paragraphs.page_num_i':[2],'paragraphs.filename':['ARMY DIR 2018-18.pdf'],'paragraphs.par_raw_text_t':['SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ']},'highlight':{'paragraphs.par_raw_text_t':['SUBJECT : <em>Army</em> Directive 2018-18 ( <em>Army</em> <em>Artificial</em> <em>Intelligence</em> Task Force in Support of the Department of Defense Joint <em>Artificial</em> <em>Intelligence</em> Center )']}},{'_index':'gamechanger_20210412_reparse','_type':'_doc','_id':'dc5e2cd73d91862aa51a67326659aee52e6a753d1612d77776d418055f1a813f','_nested':{'field':'paragraphs','offset':35},'_score':44.628925,'fields':{'paragraphs.page_num_i':[3],'paragraphs.filename':['ARMY DIR 2018-18.pdf'],'paragraphs.par_raw_text_t':['SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ']},'highlight':{'paragraphs.par_raw_text_t':['SUBJECT : <em>Army</em> Directive 2018-18 ( <em>Army</em> <em>Artificial</em> <em>Intelligence</em> Task Force in Support of the Department of Defense Joint <em>Artificial</em> <em>Intelligence</em> Center )']}},{'_index':'gamechanger_20210412_reparse','_type':'_doc','_id':'dc5e2cd73d91862aa51a67326659aee52e6a753d1612d77776d418055f1a813f','_nested':{'field':'paragraphs','offset':52},'_score':44.628925,'fields':{'paragraphs.page_num_i':[4],'paragraphs.filename':['ARMY DIR 2018-18.pdf'],'paragraphs.par_raw_text_t':['SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ']},'highlight':{'paragraphs.par_raw_text_t':['SUBJECT : <em>Army</em> Directive 2018-18 ( <em>Army</em> <em>Artificial</em> <em>Intelligence</em> Task Force in Support of the Department of Defense Joint <em>Artificial</em> <em>Intelligence</em> Center )']}}]}}}};
			assert.deepStrictEqual(result, expected);
		});
	});

	describe('#cleanParagraph', function () {

		it('should remove repeated table of contents-style periods from text', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};

			const paragraph = 'GENERAL ISSUANCE INFORMATION . . . . . . . . . . . . . . . . . . . . . . 3 1.1 . Applicability ..................................................................................................................... 3 1.2 . Summary of Change 2 ...................................................................................................... 3 SECTION 2 : RESPONSIBILITIES ......................................................................................................... 4 2.1 . Assistant Secretary of Defense for Research and Engineering ( ASD ( R&E ) ) .................. 4 2.2 . Do D Component Heads .................................................................................................... 4 SECTION 3 : PROCEDURES ................................................................................................................ 5 3.1 . General .............................................................................................................................. 5 3.2 . FAPIIS Language in Notices of Funding Opportunity ..................................................... 5 3.3 . Determination of Recipient Qualifications ....................................................................... 5 3.4 . FAPIIS Award Term and Condition ................................................................................. 6 3.5'
			const target = new SearchUtility(tmpOpts);
			const actual = target.cleanParagraph(paragraph);
			const expected = 'GENERAL ISSUANCE INFORMATION . 3 1.1 . Applicability . 3 1.2 . Summary of Change 2 . 3 SECTION 2 : RESPONSIBILITIES . 4 2.1 . Assistant Secretary of Defense for Research and Engineering ( ASD ( R E ) ) . 4 2.2 . Do D Component Heads . 4 SECTION 3 : PROCEDURES . 5 3.1 . General . 5 3.2 . FAPIIS Language in Notices of Funding Opportunity . 5 3.3 . Determination of Recipient Qualifications . 5 3.4 . FAPIIS Award Term and Condition . 6 3.5'
			assert.deepStrictEqual(actual, expected);
		});

		it('should remove repeated table of contents-style Xs from text', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};

			const paragraph = 'AS 0205 Radar System 2  Active A/S Radar Modes 2.0 X X X X X X  AS 0206 SAR Map Theory  Pilot Techniques & Procedures 3.0 X X X X X X  AS 0207 TFLIR/LASER 2.0 X X X X X X  AS 0208 TFLIR/DAS/NVC A/S Interpretation 1.5 X X X X X X  AS 0209 Laser Guided Bombs 2.0 X X X X X  AS 0210 GPS Guided Bombs 4.0 X X X X X  AS 0211 Small Diameter Bomb 2.5 X X X X X  AS 0212 Weaponeering / Ballistic Weapons Planner 2.5 X X X X X'
			const target = new SearchUtility(tmpOpts);
			const actual = target.cleanParagraph(paragraph);
			const expected = 'AS 0205 Radar System 2 Active A/S Radar Modes 2.0 X AS 0206 SAR Map Theory Pilot Techniques Procedures 3.0 X AS 0207 TFLIR/LASER 2.0 X AS 0208 TFLIR/DAS/NVC A/S Interpretation 1.5 X AS 0209 Laser Guided Bombs 2.0 X AS 0210 GPS Guided Bombs 4.0 X AS 0211 Small Diameter Bomb 2.5 X AS 0212 Weaponeering / Ballistic Weapons Planner 2.5 X'
			assert.deepStrictEqual(actual, expected);
		});

		it('should remove weird characters', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};

			const paragraph = '2 ‚Ä¢ HR 6950 IH ( 1 ) STUDY REQUIRED.‚ÄîNot later than 2 years 1 after the date of the enactment of this Act  the Sec - 2 retary of Commerce and the Federal Trade Commis - 3 sion  in coordination with the head of any other ap - 4 propriate Federal agency  shall conduct a study on 5 the impact of artificial intelligence  including ma - 6 chine learning  on United States businesses con - 7 ducting interstate commerce .8 ( 2 ) REQUIREMENTS FOR STUDY.‚ÄîIn con'
			const target = new SearchUtility(tmpOpts);
			const actual = target.cleanParagraph(paragraph);
			const expected = '2 HR 6950 IH ( 1 ) STUDY REQUIRED. Not later than 2 years 1 after the date of the enactment of this Act the Sec 2 retary of Commerce and the Federal Trade Commis 3 sion in coordination with the head of any other ap 4 propriate Federal agency shall conduct a study on 5 the impact of artificial intelligence including ma 6 chine learning on United States businesses con 7 ducting interstate commerce .8 ( 2 ) REQUIREMENTS FOR STUDY. In con'
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#formatQAquery', function () {

		it('should take in the query and produce a set of QA query objects including matching aliases', async () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(qaEntitiesReturn);
					}
				}
			};

			const searchText = 'what is the mission of the jaic?'
			const qaParams = {maxLength: 3000, maxDocContext: 3, maxParaContext: 3, minLength: 350, scoreThreshold: 100, entityLimit: 4};
			const esClientName = 'gamechanger';
			const entitiesIndex = 'entities';
			const userId = 'fake-user'
			const target = new SearchUtility(tmpOpts);
			const actual = await target.formatQAquery(searchText, qaParams, esClientName, entitiesIndex, userId);
			const expected = {'alias': {'_id': 'fGIhP3oBSijRXU555yQW', '_index': 'entities_20210624', '_score': 4.9245024, '_source': {'address': 'Ariel Rios Building 1200 Pennsylvania Ave., NW Washington, DC 20460', 'aliases': [{'name': 'EPA'}], 'crawlers': '', 'entity_type': 'org', 'government_branch': 'Independent Agency', 'information': 'The Environmental Protection Agency (EPA) is an independent executive agency of the United States federal government tasked with environmental protection matters. President Richard Nixon proposed the establishment of EPA on July 9, 1970; it began operation on December 2, 1970, after Nixon signed an executive order. The order establishing the EPA was ratified by committee hearings in the House and Senate. The agency is led by its administrator, who is appointed by the president and approved by the Senate. The current Administrator is Michael S. Regan. The EPA is not a Cabinet department, but the administrator is normally given cabinet rank.The EPA has its headquarters in Washington, D.C., regional offices for each of the agency\'s ten regions, and 27 laboratories. The agency conducts environmental assessment, research, and education. It has the responsibility of maintaining and enforcing national standards under a variety of environmental laws, in consultation with state, tribal, and local governments. It delegates some permitting, monitoring, and enforcement responsibility to U.S. states and the federally recognized tribes. EPA enforcement powers include fines, sanctions, and other measures. The agency also works with industries and all levels of government in a wide variety of voluntary pollution prevention programs and energy conservation efforts.In 2018, the agency had 13,758 employees. More than half of EPA\'s employees are engineers, scientists, and environmental protection specialists; other employees include legal, public affairs, financial, and information technologists.Many public health and environmental groups advocate for the agency and believe that it is creating a better world. Other critics believe that the agency commits government overreach by adding unnecessary regulations on business and property owners.', 'information_retrieved': '2021-06-04', 'information_source': 'Wikipedia', 'name': 'Environmental Protection Agency', 'num_mentions': '', 'parent_agency': 'United States Government', 'related_agency': '  ', 'website': 'https://www.epa.gov/'}, '_type': '_doc', 'match': 'EPA'}, 'display': 'what is the mission of the jaic?', 'list': ['what', 'is', 'the', 'mission', 'of', 'the', 'jaic'], 'text': 'what is the mission of the jaic'};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#getQAEntities', function () {

		it('should return the top matching entity (if an alias is found in the query)', async () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(qaEntitiesReturn);
					}
				}
			};

			const qaQueries = {'text':'what is the mission of the Environmental Protection Agency','display':'what is the mission of the epa?','list':['what','is','the','mission','of','the','epa'],'alias':{'_index':'entities_20210624','_type':'_doc','_id':'fGIhP3oBSijRXU555yQW','_score':4.9245024,'_source':{'name':'Environmental Protection Agency','website':'https://www.epa.gov/','address':'Ariel Rios Building 1200 Pennsylvania Ave., NW Washington, DC 20460','government_branch':'Independent Agency','parent_agency':'United States Government','related_agency':'  ','entity_type':'org','crawlers':'','num_mentions':'','aliases':[{'name':'EPA'}],'information':'The Environmental Protection Agency (EPA) is an independent executive agency of the United States federal government tasked with environmental protection matters. President Richard Nixon proposed the establishment of EPA on July 9, 1970; it began operation on December 2, 1970, after Nixon signed an executive order. The order establishing the EPA was ratified by committee hearings in the House and Senate. The agency is led by its administrator, who is appointed by the president and approved by the Senate. The current Administrator is Michael S. Regan. The EPA is not a Cabinet department, but the administrator is normally given cabinet rank.The EPA has its headquarters in Washington, D.C., regional offices for each of the agency\'s ten regions, and 27 laboratories. The agency conducts environmental assessment, research, and education. It has the responsibility of maintaining and enforcing national standards under a variety of environmental laws, in consultation with state, tribal, and local governments. It delegates some permitting, monitoring, and enforcement responsibility to U.S. states and the federally recognized tribes. EPA enforcement powers include fines, sanctions, and other measures. The agency also works with industries and all levels of government in a wide variety of voluntary pollution prevention programs and energy conservation efforts.In 2018, the agency had 13,758 employees. More than half of EPA\'s employees are engineers, scientists, and environmental protection specialists; other employees include legal, public affairs, financial, and information technologists.Many public health and environmental groups advocate for the agency and believe that it is creating a better world. Other critics believe that the agency commits government overreach by adding unnecessary regulations on business and property owners.','information_source':'Wikipedia','information_retrieved':'2021-06-04'},'match':'EPA'}};
			const bigramQueries = {'entityShouldQueries':[{'match_phrase':{'name':{'query':'what is','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'what is','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'is the','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'is the','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'the mission','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'the mission','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'mission of','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'mission of','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'of the','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'of the','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'the epa','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'the epa','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'Environmental Protection Agency','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'Environmental Protection Agency','type':'phrase_prefix'}}],'docMustQueries':[{'wildcard':{'display_title_s.search':{'value':'what is','boost':6}}},{'query_string':{'query':'what is','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'display_title_s.search':{'value':'is the','boost':6}}},{'query_string':{'query':'is the','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'display_title_s.search':{'value':'the mission','boost':6}}},{'query_string':{'query':'the mission','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'display_title_s.search':{'value':'mission of','boost':6}}},{'query_string':{'query':'mission of','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'display_title_s.search':{'value':'of the','boost':6}}},{'query_string':{'query':'of the','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'display_title_s.search':{'value':'the epa','boost':6}}},{'query_string':{'query':'the epa','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'display_title_s.search':{'value':'Environmental Protection Agency','boost':6}}},{'query_string':{'query':'Environmental Protection Agency','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}}],'docShouldQueries':[{'multi_match':{'query':'what is the mission of the epa','fields':['keyw_5^2','id^2','summary_30','paragraphs.par_raw_text_t'],'operator':'or'}},{'multi_match':{'query':'what is','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}},{'multi_match':{'query':'is the','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}},{'multi_match':{'query':'the mission','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}},{'multi_match':{'query':'mission of','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}},{'multi_match':{'query':'of the','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}},{'multi_match':{'query':'the epa','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}},{'multi_match':{'query':'Environmental Protection Agency','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}}]};
			const qaParams = {maxLength: 1500, maxDocContext: 3, maxParaContext: 2, minLength: 200, scoreThreshold: 100, entityLimit: 10};
			const esClientName = 'gamechanger';
			const entitiesIndex = 'entities';
			const userId = 'fake-user'
			const entities = {QAResults: {}, allResults: {}};
			const target = new SearchUtility(tmpOpts);
			const actual = await target.getQAEntities(entities, qaQueries, bigramQueries, qaParams, esClientName, entitiesIndex, userId);
			const expected = {'QAResults':{'_index':'entities_20210624','_type':'_doc','_id':'fGIhP3oBSijRXU555yQW','_score':4.9245024,'_source':{'name':'Environmental Protection Agency','website':'https://www.epa.gov/','address':'Ariel Rios Building 1200 Pennsylvania Ave., NW Washington, DC 20460','government_branch':'Independent Agency','parent_agency':'United States Government','related_agency':'  ','entity_type':'org','crawlers':'','num_mentions':'','aliases':[{'name':'EPA'}],'information':'The Environmental Protection Agency (EPA) is an independent executive agency of the United States federal government tasked with environmental protection matters. President Richard Nixon proposed the establishment of EPA on July 9, 1970; it began operation on December 2, 1970, after Nixon signed an executive order. The order establishing the EPA was ratified by committee hearings in the House and Senate. The agency is led by its administrator, who is appointed by the president and approved by the Senate. The current Administrator is Michael S. Regan. The EPA is not a Cabinet department, but the administrator is normally given cabinet rank.The EPA has its headquarters in Washington, D.C., regional offices for each of the agency\'s ten regions, and 27 laboratories. The agency conducts environmental assessment, research, and education. It has the responsibility of maintaining and enforcing national standards under a variety of environmental laws, in consultation with state, tribal, and local governments. It delegates some permitting, monitoring, and enforcement responsibility to U.S. states and the federally recognized tribes. EPA enforcement powers include fines, sanctions, and other measures. The agency also works with industries and all levels of government in a wide variety of voluntary pollution prevention programs and energy conservation efforts.In 2018, the agency had 13,758 employees. More than half of EPA\'s employees are engineers, scientists, and environmental protection specialists; other employees include legal, public affairs, financial, and information technologists.Many public health and environmental groups advocate for the agency and believe that it is creating a better world. Other critics believe that the agency commits government overreach by adding unnecessary regulations on business and property owners.','information_source':'Wikipedia','information_retrieved':'2021-06-04'},'match':'EPA'},'allResults':{}};
			assert.deepStrictEqual(actual, expected);
		});

		it('should return the top matching entity (even if there is no alias in the query)', async () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(qaEntitiesReturn);
					}
				}
			};

			const qaQueries = {'text':'what is the mission of the environmental protection agency','display':'what is the mission of the environmental protection agency?','list':['what','is','the','mission','of','the','environmental','protection','agency'],'alias':{}};
			const bigramQueries = {'entityShouldQueries':[{'match_phrase':{'name':{'query':'what is','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'what is','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'is the','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'is the','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'the mission','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'the mission','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'mission of','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'mission of','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'of the','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'of the','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'the environmental','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'the environmental','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'environmental protection','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'environmental protection','type':'phrase_prefix'}},{'match_phrase':{'name':{'query':'protection agency','slop':2,'boost':0.5}}},{'multi_match':{'fields':['name','aliases.name'],'query':'protection agency','type':'phrase_prefix'}}],'docMustQueries':[{'wildcard':{'display_title_s.search':{'value':'what is','boost':6}}},{'query_string':{'query':'what is','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'display_title_s.search':{'value':'is the','boost':6}}},{'query_string':{'query':'is the','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'display_title_s.search':{'value':'the mission','boost':6}}},{'query_string':{'query':'the mission','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'display_title_s.search':{'value':'mission of','boost':6}}},{'query_string':{'query':'mission of','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'display_title_s.search':{'value':'of the','boost':6}}},{'query_string':{'query':'of the','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'display_title_s.search':{'value':'the environmental','boost':6}}},{'query_string':{'query':'the environmental','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'display_title_s.search':{'value':'environmental protection','boost':6}}},{'query_string':{'query':'environmental protection','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}},{'wildcard':{'display_title_s.search':{'value':'protection agency','boost':6}}},{'query_string':{'query':'protection agency','default_field':'paragraphs.par_raw_text_t','default_operator':'AND','fuzzy_max_expansions':100,'fuzziness':'AUTO'}}],'docShouldQueries':[{'multi_match':{'query':'what is the mission of the environmental protection agency','fields':['keyw_5^2','id^2','summary_30','paragraphs.par_raw_text_t'],'operator':'or'}},{'multi_match':{'query':'what is','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}},{'multi_match':{'query':'is the','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}},{'multi_match':{'query':'the mission','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}},{'multi_match':{'query':'mission of','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}},{'multi_match':{'query':'of the','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}},{'multi_match':{'query':'the environmental','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}},{'multi_match':{'query':'environmental protection','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}},{'multi_match':{'query':'protection agency','fields':['summary_30','keyw_5'],'type':'phrase','boost':3}}]};
			const qaParams = {maxLength: 1500, maxDocContext: 3, maxParaContext: 2, minLength: 200, scoreThreshold: 100, entityLimit: 10};
			const esClientName = 'gamechanger';
			const entitiesIndex = 'entities';
			const userId = 'fake-user';
			const entities = {QAResults: {}, allResults: {}};
			const target = new SearchUtility(tmpOpts);
			const actual = await target.getQAEntities(entities, qaQueries, bigramQueries, qaParams, esClientName, entitiesIndex, userId);
			const expected = {'QAResults': {'_id': 'fGIhP3oBSijRXU555yQW', '_index': 'entities_20210624', '_score': 4.9245024, '_source': {'address': 'Ariel Rios Building 1200 Pennsylvania Ave., NW Washington, DC 20460', 'aliases': [{'name': 'EPA'}], 'crawlers': '', 'entity_type': 'org', 'government_branch': 'Independent Agency', 'information': 'The Environmental Protection Agency (EPA) is an independent executive agency of the United States federal government tasked with environmental protection matters. President Richard Nixon proposed the establishment of EPA on July 9, 1970; it began operation on December 2, 1970, after Nixon signed an executive order. The order establishing the EPA was ratified by committee hearings in the House and Senate. The agency is led by its administrator, who is appointed by the president and approved by the Senate. The current Administrator is Michael S. Regan. The EPA is not a Cabinet department, but the administrator is normally given cabinet rank.The EPA has its headquarters in Washington, D.C., regional offices for each of the agency\'s ten regions, and 27 laboratories. The agency conducts environmental assessment, research, and education. It has the responsibility of maintaining and enforcing national standards under a variety of environmental laws, in consultation with state, tribal, and local governments. It delegates some permitting, monitoring, and enforcement responsibility to U.S. states and the federally recognized tribes. EPA enforcement powers include fines, sanctions, and other measures. The agency also works with industries and all levels of government in a wide variety of voluntary pollution prevention programs and energy conservation efforts.In 2018, the agency had 13,758 employees. More than half of EPA\'s employees are engineers, scientists, and environmental protection specialists; other employees include legal, public affairs, financial, and information technologists.Many public health and environmental groups advocate for the agency and believe that it is creating a better world. Other critics believe that the agency commits government overreach by adding unnecessary regulations on business and property owners.', 'information_retrieved': '2021-06-04', 'information_source': 'Wikipedia', 'name': 'Environmental Protection Agency', 'num_mentions': '', 'parent_agency': 'United States Government', 'related_agency': '  ', 'website': 'https://www.epa.gov/'}, '_type': '_doc', 'match': 'EPA'}, 'allResults': {'body': {'_shards': {'failed': 0, 'skipped': 0, 'successful': 5, 'total': 5}, 'hits': {'hits': [{'_id': 'fGIhP3oBSijRXU555yQW', '_index': 'entities_20210624', '_score': 4.9245024, '_source': {'address': 'Ariel Rios Building 1200 Pennsylvania Ave., NW Washington, DC 20460', 'aliases': [{'name': 'EPA'}], 'crawlers': '', 'entity_type': 'org', 'government_branch': 'Independent Agency', 'information': 'The Environmental Protection Agency (EPA) is an independent executive agency of the United States federal government tasked with environmental protection matters. President Richard Nixon proposed the establishment of EPA on July 9, 1970; it began operation on December 2, 1970, after Nixon signed an executive order. The order establishing the EPA was ratified by committee hearings in the House and Senate. The agency is led by its administrator, who is appointed by the president and approved by the Senate. The current Administrator is Michael S. Regan. The EPA is not a Cabinet department, but the administrator is normally given cabinet rank.The EPA has its headquarters in Washington, D.C., regional offices for each of the agency\'s ten regions, and 27 laboratories. The agency conducts environmental assessment, research, and education. It has the responsibility of maintaining and enforcing national standards under a variety of environmental laws, in consultation with state, tribal, and local governments. It delegates some permitting, monitoring, and enforcement responsibility to U.S. states and the federally recognized tribes. EPA enforcement powers include fines, sanctions, and other measures. The agency also works with industries and all levels of government in a wide variety of voluntary pollution prevention programs and energy conservation efforts.In 2018, the agency had 13,758 employees. More than half of EPA\'s employees are engineers, scientists, and environmental protection specialists; other employees include legal, public affairs, financial, and information technologists.Many public health and environmental groups advocate for the agency and believe that it is creating a better world. Other critics believe that the agency commits government overreach by adding unnecessary regulations on business and property owners.', 'information_retrieved': '2021-06-04', 'information_source': 'Wikipedia', 'name': 'Environmental Protection Agency', 'num_mentions': '', 'parent_agency': 'United States Government', 'related_agency': '  ', 'website': 'https://www.epa.gov/'}, '_type': '_doc', 'match': 'EPA'}], 'max_score': 4.9245024, 'total': {'relation': 'eq', 'value': 1}}, 'timed_out': false, 'took': 1}, 'headers': {'access-control-allow-origin': '*', 'connection': 'keep-alive', 'content-length': '2574', 'content-type': 'application/json; charset=UTF-8', 'date': 'Wed, 18 Aug 2021 21:09:14 GMT'}, 'meta': {'aborted': false, 'attempts': 0, 'connection': {'_openRequests': 0, 'deadCount': 0, 'headers': {}, 'id': 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/', 'resurrectTimeout': 0, 'roles': {'data': true, 'ingest': true, 'master': true, 'ml': false}, 'status': 'alive', 'url': 'https://vpc-gamechanger-iquxkyq2dobz4antllp35g2vby.us-east-1.es.amazonaws.com/'}, 'context': null, 'name': 'elasticsearch-js', 'request': {'id': 2, 'options': {}, 'params': {'body': '{"from":0,"size":2,"query":{"bool":{"should":{"nested":{"path":"aliases","query":{"bool":{"should":[{"match":{"aliases.name":"what"}},{"match":{"aliases.name":"is"}},{"match":{"aliases.name":"the"}},{"match":{"aliases.name":"mission"}},{"match":{"aliases.name":"of"}},{"match":{"aliases.name":"epa"}}]}}}}}}}', 'headers': {'content-length': '308', 'content-type': 'application/json', 'user-agent': 'elasticsearch-js/7.13.0 (linux 5.10.25-linuxkit-x64; Node.js v14.17.5)', 'x-elastic-client-meta': 'es=7.13.0,js=14.17.5,t=7.13.0,hc=14.17.5'}, 'method': 'POST', 'path': '/entities/_search', 'querystring': '', 'timeout': 30000}}}, 'statusCode': 200}};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#cleanQAResults', function () {

		it('should format the results of QA', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};

			const searchResults = {qaResults: {answers: [], filenames: [], docIds: [], resultTypes: []}}
			const shortenedResults = {'answers':[{'text':'Increasing human resource team literacy','probability':0.9934731277348743,'null_score_diff':-5.02527916431427,'status':'passed','context':4},{'text':'to\'transform the US Department of Defense by accelerating the delivery and adoption of AI','probability':0.9167887188464307,'null_score_diff':-2.3994941115379333,'status':'failed','context':0},{'text':'','probability':1,'null_score_diff':0,'status':'failed','context':1},{'text':'','probability':1,'null_score_diff':0,'status':'failed','context':2},{'text':'','probability':1,'null_score_diff':0,'status':'failed','context':3},{'text':'','probability':1,'null_score_diff':0,'status':'failed','context':5},{'text':'','probability':1,'null_score_diff':0,'status':'failed','context':6},{'text':'','probability':1,'null_score_diff':0,'status':'failed','context':7},{'text':'','probability':1,'null_score_diff':0,'status':'failed','context':7}],'question':'what is the mission of the Joint Artificial Intelligence Center'}
			const context = [{'filename':'Joint Artificial Intelligence Center','docId':'Joint Artificial Intelligence Center','docScore':4.845589,'retrievedDate':'2021-06-04','type':'org','resultType':'entity','source':'entity search','text':'The Joint Artificial Intelligence Center (JAIC) is an American organization on exploring the usage of Artificial Intelligence (AI) (particularly Edge computing), Network of Networks and AI-enhanced communication for use in actual combat.It is a subdivision of the United States Armed Forces and was created in June 2018. The organization\'s stated objective is to \'transform the US Department of Defense by accelerating the delivery and adoption of AI to achieve mission impact at scale. The goal is to use AI to solve large and complex problem sets that span multiple combat systems; then, ensure the combat Systems and Components have real-time access to ever-improving libraries of data sets and tools.\''},{'filename':'MCO 3120.11A MARINE CORPS PARACHUTING POLICY AND PROGRAM ADMINISTRATION','docId':'MCO 3120.11A.pdf_0','docScore':9.884508,'docTypeDisplay':'Document','pubDate':'2014-12-29T00:00:00','pageCount':69,'docType':'MCO','org':'US Marine Corps','resultType':'document','source':'intelligent search','parIdx':'593','text':'16 .Joint Aircraft Inspector ( JAI ) .The JAI serves as the on site air delivery cargo load inspector for the before load and after load inspections of all rigged air drop loads .The JAI provides flexibility and safety during sustained operations and training by performing required parachute load rigger inspections .These inspections are conducted prior to aircraft loading , after loading and rigging is completed from the transported force unit and the joint air drop load inspection with the air crew of all rigged , air drop supplies and equipment .Each JAI will be assigned in writing by the commanding officer .For USMC 0451 Airborne and Air Delivery Specialist a waiver must be approved prior to attendance for all Marines who do not meet the Army s E4 rank requirement .Waivers must be sent through the Marine Corps Detachment Ft .Lee , and approved by the Air Delivery and Field Service Department ( ADFSD ) Ft .Lee .'},{'filename':'H.Res. 855 Recognizing the Nordic Heritage Museum in Seattle, Washington, as the National Nordic Museum.','docId':'H.Res 855 IH 115th.pdf_0','docScore':124.252754,'docTypeDisplay':'Document','pubDate':'2018-04-27T00:00:00','pageCount':2,'docType':'H.Res.','org':'Congress','resultType':'document','source':'context search','parIdx':1,'text':'2 HRES 855 IH Whereas Nordic history , art , and culture will be even more vibrant and accessible when the Nordic Heritage Museum opens its new state of the art museum in 2018 ;Whereas the State of Washington , King County , the Nordic Council ( comprised of Nordic nations ) , the national museums of Denmark , Finland , Iceland , Norway , and Sweden , and many private individuals have partnered to provide funds and exhibits for the new Nordic Heritage Museum ;Whereas the Nordic Heritage Museum is a significant resource in preserving and celebrating the immigrant Nordic culture , art , and history ;Whereas the Nordic Heritage Museum is the only museum in the U.S . that exists for the exclusive purpose of preserving , interpreting , and providing education about Nordic culture and heritage ;Whereas the Nordic Heritage Museum promotes valuable international relations with the Nordic countries of Denmark , Finland , Iceland , Norway , and Sweden ; and Whereas it is appropriate to designate the Nordic Heritage Museum in Seattle , Washington , as the National Nordic Museum : Now , therefore , be it Resolved , That the House of Representatives recog 1 nizes the Nordic Heritage Museum of Seattle , Wash 2 ington , as the National Nordic Museum .3 Ver Date Sep 11 2014 21:45 Apr 27 , 2018 Jkt 079200 PO 00000 Frm 00002 Fmt 6652 Sfmt 6301 E: BILLS HR855.IH HR855 amozie on DSK30RV082PROD with BILLS '},{'filename':'H.Res. 855 Recognizing the Nordic Heritage Museum in Seattle, Washington, as the National Nordic Museum.','docId':'H.Res 855 IH 115th.pdf_0','docScore':124.252754,'docTypeDisplay':'Document','pubDate':'2018-04-27T00:00:00','pageCount':2,'docType':'H.Res.','org':'Congress','resultType':'document','source':'context search','parIdx':0,'text':'IV 115TH CONGRESS 2D SESSION H . RES . 855 Recognizing the Nordic Heritage Museum in Seattle , Washington , as the National Nordic Museum .IN THE HOUSE OF REPRESENTATIVES APRIL 27 , 2018 Ms . JAYAPAL( for herself , Mr . HOYER , Mr . SMITH of Washington , Mr . HECK , Ms . DELBENE , Mr . KILMER , Mr . LARSEN of Washington , Mr . COLE , Ms . MCCOLLUM , Mr . DOGGETT , Ms . JACKSON LEE , Mrs . DINGELL , and Mr . MEEKS ) submitted the following resolution ; which was referred to the Committee on Natural Resources RESOLUTION Recognizing the Nordic Heritage Museum in Seattle , Washington , as the National Nordic Museum .Whereas the Nordic Heritage Museum in Seattle , Washington , is the only museum in the United States dedicated to the history , culture , and art of the Nordic nations ;Whereas Nordic people have long contributed to the rich cultural heritage of the United States ;Whereas the Nordic Heritage Museum serves as a unique and valuable resource locally and nationwide in expanding knowledge of Nordic heritage and its impact throughout the U.S . ; Ver Date Sep 11 2014 21:45 Apr 27 , 2018 Jkt 079200 PO 00000 Frm 00001 Fmt 6652 Sfmt 6300 E: BILLS HR855.IH HR855 amozie on DSK30RV082PROD with BILLS '},{'filename':'S. 3965 To accelerate the application of artificial intelligence in the Department of Defense and to strengthen the workforce that pertains to artificial intelligence, and for other purposes.','docId':'S 3965 IS 116th.pdf_0','docScore':115.8213,'docTypeDisplay':'Legislation','pubDate':'2020-06-16T00:00:00','pageCount':11,'docType':'S.','org':'Congress','resultType':'document','source':'context search','parIdx':1,'text':'2 S 3965 IS Sec .1 . Short title ; table of contents .TITLE I DEPARTMENT OF DEFENSE ARTIFICIAL INTELLIGENCE LEADERSHIP Sec . 101 .Organizational placement of Director of the Joint Artificial Intelligence Center .Sec . 102 .Grade of Director of the Joint Artificial Intelligence Center .TITLE II STRENGTHENING THE DEPARTMENT OF DEFENSE ARTIFICIAL INTELLIGENCE WORKFORCE Sec . 201 .Increasing human resource team literacy in artificial intelligence .Sec . 202 .Guidance and direction on use of direct hiring processes for artificial intelligence professionals and other data science and software development personnel .Sec . 203 .Waiver of qualification standards for General Schedule positions in artificial intelligence .Sec . 204 .Modifying the Armed Services Vocational Aptitude Battery Test to address computational thinking .TITLE I DEPARTMENT OF DE 1 FENSE ARTIFICIAL INTELLI 2 GENCE LEADERSHIP 3 SEC . 101 .ORGANIZATIONAL PLACEMENT OF DIRECTOR OF 4 THE JOINT ARTIFICIAL INTELLIGENCE CEN 5 TER .6 ( a ) AUTHORITY . 7 ( 1 ) IN GENERAL. The Secretary of Defense 8 shall exercise authority and direction over the Joint 9 Artificial Intelligence Center .10 ( 2 )LIMITATION ON DELEGATION. The author 11 ity of the Secretary under this section may not be 12 delegated below the level of the Deputy Secretary of 13 Defense .14 ( b )DIRECT REPORTING TO SECRETARY OF DE 15 FENSE. The Director of the Joint Artificial Intelligence 16 Ver Date Sep 11 2014 05:18 Jun 26 , 2020 Jkt 099200 PO 00000 Frm 00002 Fmt 6652 Sfmt 6201 E: BILLS S3965.IS S3965 pbinns on DSKJLVW7X2PROD with BILLS '},{'filename':'S. 3965 To accelerate the application of artificial intelligence in the Department of Defense and to strengthen the workforce that pertains to artificial intelligence, and for other purposes.','docId':'S 3965 IS 116th.pdf_0','docScore':115.8213,'docTypeDisplay':'Legislation','pubDate':'2020-06-16T00:00:00','pageCount':11,'docType':'S.','org':'Congress','resultType':'document','source':'context search','parIdx':2,'text':'3 S 3965 IS Center shall report directly to the Secretary or the Deputy 1 Secretary on matters relating to artificial intelligence pol 2 icy , priorities , practices , and resourcing .3 SEC . 102 .GRADE OF DIRECTOR OF THE JOINT ARTIFICIAL 4 INTELLIGENCE CENTER .5 An officer appointed to serve as Director of the Joint 6 Artificial Intelligence Center shall , while so serving , have 7 the grade of lieutenant general in the Army , Air Force , 8 or Marine Corps or vice admiral in the Navy .9 TITLE II STRENGTHENING THE 10 DEPARTMENT OF DEFENSE 11 ARTIFICIAL INTELLIGENCE 12 WORKFORCE 13 SEC . 201 .INCREASING HUMAN RESOURCE TEAM LITERACY 14 IN ARTIFICIAL INTELLIGENCE .15 ( a )DEPARTMENT OF DEFENSE . 16 ( 1 ) TRAINING AND CERTIFICATION PROGRAM 17 REQUIRED. Not later than one year after the date 18 of the enactment of this Act , the Secretary of De 19 fense shall develop a training and certification pro 20 gram on software development , data science , and ar 21 tificial intelligence that is tailored to the needs of 22 the covered human resources workforce .23 ( 2 )REQUIREMENTS. The course required by 24 paragraph ( 1 ) shall 25 Ver Date Sep 11 2014 05:18 Jun 26 , 2020 Jkt 099200 PO 00000 Frm 00003 Fmt 6652 Sfmt 6201 E: BILLS S3965.IS S3965 pbinns on DSKJLVW7X2PROD with BILLS '},{'filename':'S. 3965 To accelerate the application of artificial intelligence in the Department of Defense and to strengthen the workforce that pertains to artificial intelligence, and for other purposes.','docId':'S 3965 IS 116th.pdf_0','docScore':115.8213,'docTypeDisplay':'Legislation','pubDate':'2020-06-16T00:00:00','pageCount':11,'docType':'S.','org':'Congress','resultType':'document','source':'context search','parIdx':4,'text':'5 S 3965 IS tus in which 80 percent of the covered human 1 resources workforce is so certified .2 ( b ) OTHER NATIONAL SECURITY AGENCIES. The 3 Secretary of Defense shall work with the Attorney Gen 4 eral , the Secretary of Homeland Security , the Director of 5 National Intelligence , or the head of any element of the 6 intelligence community to offer the training and certifi 7 cation program developed pursuant to subsection ( a ) to 8 employees of other national security agencies and to en 9 courage the heads of such agencies to achieve a level of 10 certification comparable to the objectives established for 11 the Department of Defense .12 ( c )DEFINITIONS. In this section : 13 ( 1 ) The term covered human resources work 14 force means human resources professionals , hiring 15 managers , and recruiters who are or will be respon 16 sible for hiring software developers , data scientists , 17 or artificial intelligence professionals .18 ( 2 )The term intelligence community has the 19 meaning given such term in section 3 of the Na 20 tional Security Act of 1947 ( 50 U.S.C . 3003 ) .21 ( d )AUTHORIZATION OF APPROPRIATIONS. There is 22 authorized to be appropriated to the Secretary of Defense 23 to carry out subsection ( a ) 2,500,000 for fiscal year 24 2021 .25 Ver Date Sep 11 2014 05:18 Jun 26 , 2020 Jkt 099200 PO 00000 Frm 00005 Fmt 6652 Sfmt 6201 E: BILLS S3965.IS S3965 pbinns on DSKJLVW7X2PROD with BILLS '},{'filename':'QTP 4B051-1 Program Management','docId':'QTP 4B051-1.pdf_0','docScore':99.85323,'docTypeDisplay':'Document','pubDate':'2015-03-20T00:00:00','pageCount':8,'docType':'QTP','org':'Dept. of the Air Force','resultType':'document','source':'context search','parIdx':0,'text':'AFQTP 4B051 1 Journeyman Training Guide : Program Management TABLE OF CONTENTS STS Line Item 2.3.4 Review local work order requests . 1 TRAINER GUIDANCE . 1 TASK STEPS . 2 TRAINEE REVIEW QUESTIONS . 4 PERFORMANCE CHECKLIST . 5 ANSWERS . 6 AFQTP 4B051 1 Journeyman Training Guide : Program Management STS Line Item 2.3.4 Review local work order requests . TRAINER GUIDANCE Proficiency Code : 2b PC Definition : Can do most parts of the task .Needs help only on hardest parts .Can determine step bystep procedures for doing the task .Prerequisites : None Training References : AFI 32 1001 , Operations Management , Sep 2005 Additional Supporting References : Air Force Pamphlet ( AFPAM ) 32 1004 V3 , Working in the Operations Flight Facility Maintenance , Chapter 4 CDC Reference : 4B051 Training Support Material : Copies of several previously reviewed work requests .Specific Techniques : Conduct hands on training and evaluation .Copies of self help/work requests previously reviewed can be useful when training this item .Select a variety of self help and work requests from the flight s administrative files and remove any documents that address finding of the previous review .The requests selected should cover a broad range of proposed work situations and potential OEH threats .Have the trainee review the work requests and identify and evaluate the potential OEH threats and recommend control measures .Compare the trainee s conclusions to those produced during the initial review .Criterion Objective : Given a work order request , determine the potential OEH hazards associated with the work order ( project ) and recommend appropriate control measures completing all checklist items with limited trainer assistance on only the hardest parts .Notes : 1 AFQTP 4B051 1 Journeyman Training Guide : Program Management TASK STEPS 1 . Log the work order request , if applicable ( See local requirements ) .2 . Review the work order request documents to develop a conceptual model of the project ( achieve an understanding of the work to be performed ) .1 3 .Anticipate OEH threats that could result.2 4 .Determine characteristics of each identified OEH health threat ( e.g . , toxicity , volatility , transmissibility ) .5 . Determine , if possible , exposure parameters ( e.g . , pathway , duration , concentration ) .6 . Identify populations at risk of exposure via all potential pathways.3 7 .Perform an exposure assessment for each population at risk of exposure.4 8 .Analyze the risk.5 9 .Determine appropriate control measures , if needed.6 10 .Document control measure recommendations , as required .11 .Communicate identified risks and control measures , as necessary.7 '}]
			const target = new SearchUtility(tmpOpts);
			const actual = target.cleanQAResults(searchResults, shortenedResults, context)
			const expected = {'answers': [{'answer': 'Increasing human resource team literacy', 'cac_only': undefined, 'displaySource': 'Source: S. 3965 TO ACCELERATE THE APPLICATION OF ARTIFICIAL INTELLIGENCE IN THE DEPARTMENT OF DEFENSE AND TO STRENGTHEN THE WORKFORCE THAT PERTAINS TO ARTIFICIAL INTELLIGENCE, AND FOR OTHER PURPOSES. (DOCUMENT)', 'docId': 'S 3965 IS 116th.pdf_0', 'filename': 'S. 3965 To accelerate the application of artificial intelligence in the Department of Defense and to strengthen the workforce that pertains to artificial intelligence, and for other purposes.', 'null_score_diff': -5.02527916431427, 'pub_date': '2020-06-16T00:00:00', 'resultType': 'document'}], 'qaResults': {'answers': [], 'docIds': [], 'filenames': [], 'resultTypes': []}};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#getQAContext', function () {

		it('wrapper function that should take in doc, sentence, and entity results and return QA context', async () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(qaESReturn);
					}
				}
			};

			const target = new SearchUtility(tmpOpts);
			const docResults = {};
			const entity = {'_index':'entities_20210624','_type':'_doc','_id':'lGIhP3oBSijRXU555ySL','_score':7.461898,'_source':{'name':'Joint Artificial Intelligence Center','website':'https://www.ai.mil','address':'','government_branch':'Executive Department Sub-Office/Agency/Bureau','parent_agency':'Office of the Secretary of Defense','related_agency':'','entity_type':'org','crawlers':'','num_mentions':'','aliases':[{'name':'JAIC'},{'name':'Joint AI Center'},{'name':'artificial intelligence'},{'name':'dod ai center'}],'information':'The Joint Artificial Intelligence Center (JAIC) is an American organization on exploring the usage of Artificial Intelligence (AI) (particularly Edge computing), Network of Networks and AI-enhanced communication for use in actual combat.It is a subdivision of the United States Armed Forces and was created in June 2018. The organization\'s stated objective is to \'transform the US Department of Defense by accelerating the delivery and adoption of AI to achieve mission impact at scale. The goal is to use AI to solve large and complex problem sets that span multiple combat systems; then, ensure the combat Systems and Components have real-time access to ever-improving libraries of data sets and tools.\'','information_source':'Wikipedia','information_retrieved':'2021-06-04'},'match':'JAIC'};
			const sentResults =  [{'score':0.002451957669109106,'id':'ARMY DIR 2018-18.pdf_20','text':'subject army directive army artificial intelligence task force in support of the department of defense joint artificial intelligence center'},{'score':0.002451957669109106,'id':'ARMY DIR 2018-18.pdf_2','text':'subject army directive army artificial intelligence task force in support of the department of defense joint artificial intelligence center'},{'score':0.002451957669109106,'id':'ARMY DIR 2018-18.pdf_52','text':'subject army directive army artificial intelligence task force in support of the department of defense joint artificial intelligence center'},{'score':0.002451957669109106,'id':'ARMY DIR 2018-18.pdf_35','text':'subject army directive army artificial intelligence task force in support of the department of defense joint artificial intelligence center'},{'score':0.002451957669109106,'id':'ARMY DIR 2018-18.pdf_11','text':'subject army directive army artificial intelligence task force in support of the department of defense joint artificial intelligence center'}];
			const esClientName = 'gamechanger';
			const esIndex = 'gamechanger';
			const userId = 'fake user';
			const qaParams = {maxLength: 3000, maxDocContext: 3, maxParaContext: 3, minLength: 350, scoreThreshold: 100, entityLimit: 4};
			const results = await target.getQAContext(docResults, entity, sentResults, esClientName, esIndex, userId, qaParams);
			const expected = [{'docId': 'Joint Artificial Intelligence Center', 'docScore': 7.461898, 'filename': 'Joint Artificial Intelligence Center', 'resultType': 'entity', 'retrievedDate': '2021-06-04', 'source': 'entity search', 'text': 'The Joint Artificial Intelligence Center (JAIC) is an American organization on exploring the usage of Artificial Intelligence (AI) (particularly Edge computing), Network of Networks and AI-enhanced communication for use in actual combat.It is a subdivision of the United States Armed Forces and was created in June 2018. The organization\'s stated objective is to \'transform the US Department of Defense by accelerating the delivery and adoption of AI to achieve mission impact at scale. The goal is to use AI to solve large and complex problem sets that span multiple combat systems; then, ensure the combat Systems and Components have real-time access to ever-improving libraries of data sets and tools.\'', 'type': 'org'}, {'cac_only': false, 'docId': 'ARMY DIR 2018-18.pdf_0', 'docScore': 93.40025, 'docType': 'ARMY', 'docTypeDisplay': 'Document', 'filename': 'ARMY 2018-18 ARMY ARTIFICIAL INTELLIGENCE TASK FORCE IN SUPPORT OF THE DEPARTMENT OF DEFENSE JOINT ARTIFICIAL INTELLIGENCE CENTER', 'org': 'US Army', 'pageCount': 7, 'parIdx': '20', 'pubDate': '2018-10-02T00:00:00', 'resultType': 'document', 'source': 'intelligent search', 'text': 'c . Personnel .The A AI TF will be manned , with assistance from the Army Talent Management Task Force and U.S . Army Human Resources Command , to ensure proper talent selection within its organization for positions at the Pittsburgh location , in the National Capital Region , and with project teams to meet mission requirements .The Pittsburgh location will consist of six core personnel with talent from across the Army ( Functional Areas 49 , 26 , and 51 ; Career Field 01 ; and General Schedule 1101 and 1102 series personnel ) ; academia ; and industry .Each project team will be led by a project officer ( 01A ) , and the team size will vary based on the project s scope .The director , a general officer , and immediate support staff will locate in the National Capital Region . d . Responsibilities .The A AI TF , under the direction of AFC , is responsible for the life cycle of Army AI projects and projects that support the Do D level National Military Initiatives .The A AI TF will develop the Army AI Strategy , which will set the Army s AI developmental efforts and projects , AI governance , AI support requirements , and AI talent management . 6 . This effort will be executed in two phases : Phase I : Establish the A AI TF and Phase II : Manning and Occupation . a . Phase I : Establish the A AI TF .Phase I begins upon publication of this directive .AFC and A AI TF will begin planning and coordination .This phase ends when the Commanding General , AFC gives a back brief of the A AI TF Roadmap to the Under SUBJECT : Army Directive 2018 18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) 3 Secretary of the Army ( USA ) and Vice Chief of Staff , Army ( VCSA ) and the A AI TF is prepared to execute its occupation plan . b . Phase II : Manning and Occupation .Phase II will begin with the USA s and VCSA s approval of the Strategic Capability Roadmap and A AI TF charter .The AFC and A AI TF will refine requirements as needed .This phase will end when the Commanding General , AFC notifies the USA and VCSA that occupation and integration is complete . 7 . I direct the following actions : a . AFC will : ( 1 ) draft and staff the A AI TF execution order in conjunction with the Deputy Chief of Staff , G 3/5/7 ; and '}]
			assert.deepStrictEqual(results, expected);
		});
	});
	
	describe('#getDocumentParagraphsByParIDs', () => {
		it('should return an es query paragraph ids for compare', () => {
			const tmpOpts = {
				...opts,
				constants: {GAME_CHANGER_OPTS: {allow_daterange: false}}
			};
			
			const parsedQuery = 'artificial intelligence';
			let target = new SearchUtility(tmpOpts);
			
			const actual = target.getDocumentParagraphsByParIDs(
				[0, 1, 2, 3],
				{
					orgFilters: [ 'Coast Guard' ],
					typeFilters: [ 'CFR Index' ],
					dateFilter: [ '2021-12-01T05:00:00.000Z', '2021-12-30T05:00:00.428Z' ],
					canceledDocs: true
				}
			);
			
			const expected = {from: 0, size: 100, '_source':{'includes':['pagerank_r','kw_doc_score_r']},'stored_fields':['filename','title','page_count','doc_type','doc_num','ref_list','id','summary_30','keyw_5','p_text','type','p_page','display_title_s','display_org_s','display_doc_type_s','is_revoked_b','access_timestamp_dt','publication_date_dt','crawler_used_s','topics_s'],'query':{'bool':{"filter": [{"terms": {"display_org_s": ["Coast Guard",],},},{"terms": {"display_doc_type_s": ["CFR Index",],},},],"must":[],'should':[{'nested':{'path':'paragraphs','inner_hits':{'_source':true,'highlight':{'fields':{'paragraphs.filename.search':{'number_of_fragments':0},'paragraphs.par_raw_text_t':{'fragment_size':200,'number_of_fragments':1}},'fragmenter':'span'}},'query':{'bool':{'must':[{'terms':{'paragraphs.id':[0,1,2,3]}}]}}}}]}}};
			
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#highlightKeywords', () => {
		it('it should return a list of highlighted keys given a list of words and one to be highlighted', () => {
			const tmpOpts = {
				...opts,
				constants: {GAME_CHANGER_OPTS: {allow_daterange: false}}
			};
			
			let target = new SearchUtility(tmpOpts);
			let full_kw = [			
				'space allocations',
				'space allocation',
				'space acquisition'
 			]
			let highlighted_kw = [ '<em>acquisition</em>' ]

			const actual = target.highlight_keywords(full_kw, highlighted_kw);
			
			const expected = [			
				'space allocations',
				'space allocation',
				'space <em>acquisition</em>'
 			]
			
			assert.deepStrictEqual(actual, expected);
		});
		it('it should return a list of highlighted keys given a list of words and multiple words to be highlighted', () => {
			const tmpOpts = {
				...opts,
				constants: {GAME_CHANGER_OPTS: {allow_daterange: false}}
			};
			
			let target = new SearchUtility(tmpOpts);
			let full_kw = [			
				'space allocations',
				'space allocation',
				'space acquisition'
 			]
			let highlighted_kw = [ '<em>acquisition</em>', '<em>allocations</em>', ]

			const actual = target.highlight_keywords(full_kw, highlighted_kw);
			
			const expected = [			
				'space <em>allocations</em>',
				'space allocation',
				'space <em>acquisition</em>'
 			]
			
			assert.deepStrictEqual(actual, expected);
		});
	});
	describe('#recommend', () => {
		it('given one filename it should recommend docs', async () => {
			const opts = {
				...constructorOptionsMock,
				constants: {
					GAME_CHANGER_OPTS: {downloadLimit: 1000},
					GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test'}
				},
				dataLibrary: {},
				mlApi: {
					recommender: (filenames, userId) => { return Promise.resolve({
						"filenames": [
							"Title 10"
						],
						"results": [
							"Title 50",
							"AACP 02.1",
							"NDAA 2017 Conference Report",
							"DOD-DIGITAL-MODERNIZATION-STRATEGY-2019",
							"DoD Dictionary"
						]
					}); }
				}
			};
			const target = new SearchUtility(opts);
			const filenames = ["Title 10"]
			const actual = await target.getRecDocs(filenames, "test");
			const expected = {
				"filenames": [
					"Title 10"
				],
				"results": [
					"Title 50",
					"AACP 02.1",
					"NDAA 2017 Conference Report",
					"DOD-DIGITAL-MODERNIZATION-STRATEGY-2019",
					"DoD Dictionary"
				]
			}
			assert.deepStrictEqual(actual, expected);
		});
	});
});
