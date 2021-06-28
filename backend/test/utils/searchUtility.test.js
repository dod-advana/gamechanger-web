const assert = require('assert');
const SearchUtility = require('../../node_app/utils/searchUtility');
const { constructorOptionsMock } = require('../resources/testUtility');
const { expect } = require('chai');
const qaESReturn = require('../resources/mockResponses/qaESReturn');

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
					topics_rs: ['Test']
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
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: []});
		});

		it('should return empty list for key if none of the sources are defined', () => {
			const target = new SearchUtility(opts);

			const expansionDict = undefined;
			const synonyms = undefined;
			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: []});
		});

		it('should just use ML terms if no synonyms are detected', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['thing1', 'thing2']};
			const synonyms = [];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}]});
		});

		it('should just use ML terms if synonyms are undefined', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['thing1', 'thing2']};
			const synonyms = undefined;
			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}]});
		});

		it('should just use synonyms if no ML terms are detected', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing1', 'thing2'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'thesaurus'}, {phrase: 'thing2', source: 'thesaurus'}]});
		});

		it('should just use synonyms if ML terms are undefined', () => {
			const target = new SearchUtility(opts);

			const expansionDict = undefined;
			const synonyms = ['thing1', 'thing2'];
			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'thesaurus'}, {phrase: 'thing2', source: 'thesaurus'}]});
		});

		it('should just use abbreviations if no synonyms + ML terms are detected', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = [];
			const key = 'something';
			const abbs = ['expansion1', 'expansion2'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'expansion1', source: 'abbreviations'}, {phrase: 'expansion2', source: 'abbreviations'}]});
		});

		it('should just use abbs if synonyms + ML terms are undefined', () => {
			const target = new SearchUtility(opts);

			const expansionDict = undefined;
			const synonyms = undefined;
			const key = 'something';
			const abbs = ['expansion1', 'expansion2'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'expansion1', source: 'abbreviations'}, {phrase: 'expansion2', source: 'abbreviations'}]});
		});

		it('should combine ML terms and synonyms if there are 3 of each, and no abbreviationss', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['thing1', 'thing2', 'thing3']};
			const synonyms = ['thing4', 'thing5', 'thing6'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}, {phrase: 'thing3', source: 'ML-QE'}, {phrase: 'thing4', source: 'thesaurus'}, {phrase: 'thing5', source: 'thesaurus'}, {phrase: 'thing6', source: 'thesaurus'}]});
		});

		it('should combine ML terms and abbreviations if there are 3 of each, and no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['thing1', 'thing2', 'thing3']};
			const synonyms = [];
			const key = 'something';
			const abbs = ['exp1', 'exp2', 'exp3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'exp1', source: 'abbreviations'}, {phrase: 'exp2', source: 'abbreviations'}, {phrase: 'exp3', source: 'abbreviations'}, {phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}, {phrase: 'thing3', source: 'ML-QE'}, ]});
		});

		it('should combine abbreviations and synonyms if there are 3 of each, and no ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing4', 'thing5', 'thing6'];
			const key = 'something';
			const abbs = ['exp1', 'exp2', 'exp3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'exp1', source: 'abbreviations'}, {phrase: 'exp2', source: 'abbreviations'}, {phrase: 'exp3', source: 'abbreviations'}, {phrase: 'thing4', source: 'thesaurus'}, {phrase: 'thing5', source: 'thesaurus'}, {phrase: 'thing6', source: 'thesaurus'}]});
		});

		it('should combine ML terms and synonyms if there are > 3 of each, and no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['thing1', 'thing2', 'thing3', 'thing41']};
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}, {phrase: 'thing3', source: 'ML-QE'}, {phrase: 'thing4', source: 'thesaurus'}, {phrase: 'thing5', source: 'thesaurus'}, {phrase: 'thing6', source: 'thesaurus'}]});
		});

		it('should combine ML terms and abbreviations if there are > 3 of each, and no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['thing1', 'thing2', 'thing3', 'thing41']};
			const synonyms = [];
			const key = 'something';
			const abbs = ['exp1', 'exp2', 'exp3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'exp1', source: 'abbreviations'}, {phrase: 'exp2', source: 'abbreviations'}, {phrase: 'exp3', source: 'abbreviations'}, {phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}, {phrase: 'thing3', source: 'ML-QE'}, ]});
		});

		it('should combine abbreviations and synonyms if there are > 3 of each, and no ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const key = 'something';
			const abbs = ['exp1', 'exp2', 'exp3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'exp1', source: 'abbreviations'}, {phrase: 'exp2', source: 'abbreviations'}, {phrase: 'exp3', source: 'abbreviations'}, {phrase: 'thing4', source: 'thesaurus'}, {phrase: 'thing5', source: 'thesaurus'}, {phrase: 'thing6', source: 'thesaurus'}]});
		});

		it('should combine ML terms and synonyms if there are > 3 of each with a space, and no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {'something else': ['thing1', 'thing2', 'thing3', 'thing41']};
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const key = 'something else';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {'something else': [{phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}, {phrase: 'thing3', source: 'ML-QE'}, {phrase: 'thing4', source: 'thesaurus'}, {phrase: 'thing5', source: 'thesaurus'}, {phrase: 'thing6', source: 'thesaurus'}]});
		});

		it('should combine ML terms and abbreviations if there are > 3 of each with a space, and no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {'something else': ['thing1', 'thing2', 'thing3', 'thing41']};
			const synonyms = [];
			const key = 'something else';
			const abbs = ['thing4', 'thing5', 'thing6', 'thing42'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {'something else': [{phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}, {phrase: 'thing3', source: 'ML-QE'}, {phrase: 'thing4', source: 'abbreviations'}, {phrase: 'thing5', source: 'abbreviations'}, {phrase: 'thing6', source: 'abbreviations'} ]});
		});

		it('should combine abbreviations and synonyms if there are > 3 of each with a space, and no ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const key = 'something else';
			const abbs = ['thing1', 'thing2', 'thing3', 'thing41'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {'something else': [{phrase: 'thing1', source: 'abbreviations'}, {phrase: 'thing2', source: 'abbreviations'}, {phrase: 'thing3', source: 'abbreviations'}, {phrase: 'thing4', source: 'thesaurus'}, {phrase: 'thing5', source: 'thesaurus'}, {phrase: 'thing6', source: 'thesaurus'}]});
		});

		it('should combine ML terms and synonyms if there are 4 ML terms and 2 synonyms, no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['thing1', 'thing2', 'thing3', 'thing41']};
			const synonyms = ['thing4', 'thing5'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}, {phrase: 'thing3', source: 'ML-QE'}, {phrase: 'thing4', source: 'thesaurus'}, {phrase: 'thing41', source: 'ML-QE'}, {phrase: 'thing5', source: 'thesaurus'}]});
		});

		it('should combine ML terms and synonyms if there are 4 synonyms and 2 ML terms, no abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['thing1', 'thing2']};
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing7'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}, {phrase: 'thing4', source: 'thesaurus'}, {phrase: 'thing5', source: 'thesaurus'}, {phrase: 'thing6', source: 'thesaurus'}, {phrase: 'thing7', source: 'thesaurus'}]});
		});

		it('should combine ML terms and synonyms if there are 4 ML terms and 2 abbreviations, no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['thing1', 'thing2', 'thing3', 'thing41']};
			const synonyms = [];
			const key = 'something';
			const abbs = ['thing4', 'thing5'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}, {phrase: 'thing3', source: 'ML-QE'}, {phrase: 'thing4', source: 'abbreviations'}, {phrase: 'thing41', source: 'ML-QE'}, {phrase: 'thing5', source: 'abbreviations'}]});
		});

		it('should combine ML terms and synonyms if there are 4 synonyms and 2 ML terms, no synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['thing1', 'thing2']};
			const synonyms = [];
			const key = 'something';
			const abbs = ['thing4', 'thing5', 'thing6', 'thing7'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}, {phrase: 'thing4', source: 'abbreviations'}, {phrase: 'thing5', source: 'abbreviations'}, {phrase: 'thing6', source: 'abbreviations'}, {phrase: 'thing7', source: 'abbreviations'}]});
		});

		it('should combine abbreviations and synonyms if there are 4 ML terms and 2 synonyms, no ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing4', 'thing5'];
			const key = 'something';
			const abbs = ['thing1', 'thing2', 'thing3', 'thing41'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'abbreviations'}, {phrase: 'thing2', source: 'abbreviations'}, {phrase: 'thing3', source: 'abbreviations'}, {phrase: 'thing4', source: 'thesaurus'}, {phrase: 'thing41', source: 'abbreviations'}, {phrase: 'thing5', source: 'thesaurus'}]});
		});

		it('should combine abbreviations and synonyms if there are 4 synonyms and 2 ML terms, no ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing7'];
			const key = 'something';
			const abbs = ['thing1', 'thing2'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'abbreviations'}, {phrase: 'thing2', source: 'abbreviations'}, {phrase: 'thing4', source: 'thesaurus'}, {phrase: 'thing5', source: 'thesaurus'}, {phrase: 'thing6', source: 'thesaurus'}, {phrase: 'thing7', source: 'thesaurus'}]});
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 ML terms and no synonyms or abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['thing1', 'thing2', 'thing3', 'thing4', 'thing5', 'thing6']};
			const synonyms = [];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}, {phrase: 'thing3', source: 'ML-QE'}, {phrase: 'thing4', source: 'ML-QE'}, {phrase: 'thing5', source: 'ML-QE'}, {phrase: 'thing6', source: 'ML-QE'}]});
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 ML terms and undefined synonyms and abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['thing1', 'thing2', 'thing3', 'thing4', 'thing5', 'thing6']};
			const synonyms = undefined;
			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'ML-QE'}, {phrase: 'thing2', source: 'ML-QE'}, {phrase: 'thing3', source: 'ML-QE'}, {phrase: 'thing4', source: 'ML-QE'}, {phrase: 'thing5', source: 'ML-QE'}, {phrase: 'thing6', source: 'ML-QE'}]});
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 synonyms and no ML terms or abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = ['thing1', 'thing2', 'thing3', 'thing4', 'thing5', 'thing6'];
			const key = 'something';
			const abbs = [];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'thesaurus'}, {phrase: 'thing2', source: 'thesaurus'}, {phrase: 'thing3', source: 'thesaurus'}, {phrase: 'thing4', source: 'thesaurus'}, {phrase: 'thing5', source: 'thesaurus'}, {phrase: 'thing6', source: 'thesaurus'}]});
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 synonyms and undefined ML terms and abbreviations', () => {
			const target = new SearchUtility(opts);

			const expansionDict = undefined;
			const synonyms = ['thing1', 'thing2', 'thing3', 'thing4', 'thing5', 'thing6'];
			const key = 'something';
			const abbs = undefined;

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'thesaurus'}, {phrase: 'thing2', source: 'thesaurus'}, {phrase: 'thing3', source: 'thesaurus'}, {phrase: 'thing4', source: 'thesaurus'}, {phrase: 'thing5', source: 'thesaurus'}, {phrase: 'thing6', source: 'thesaurus'}]});
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 abbreivations and no ML terms or synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {};
			const synonyms = [];
			const key = 'something';
			const abbs = ['thing1', 'thing2', 'thing3', 'thing4', 'thing5', 'thing6'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'abbreviations'}, {phrase: 'thing2', source: 'abbreviations'}, {phrase: 'thing3', source: 'abbreviations'}, {phrase: 'thing4', source: 'abbreviations'}, {phrase: 'thing5', source: 'abbreviations'}, {phrase: 'thing6', source: 'abbreviations'}]});
		});

		it('should combine ML terms and synonyms and abbreviations if there are 6 abbreviations and undefined ML terms and synonyms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = undefined;
			const synonyms = undefined;
			const key = 'something';
			const abbs = ['thing1', 'thing2', 'thing3', 'thing4', 'thing5', 'thing6'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'thing1', source: 'abbreviations'}, {phrase: 'thing2', source: 'abbreviations'}, {phrase: 'thing3', source: 'abbreviations'}, {phrase: 'thing4', source: 'abbreviations'}, {phrase: 'thing5', source: 'abbreviations'}, {phrase: 'thing6', source: 'abbreviations'}]});
		});

		it('should combine ML terms and synonyms and abbreviations if there are > 2 of each and checking for removal of search term in ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['something blah1', 'blah2 something', 'thing1', 'thing2', 'thing3', 'thing41']};
			const synonyms = ['thing4', 'thing5', 'thing6', 'thing42'];
			const key = 'something';
			const abbs = ['expansion1', 'expansion2', 'expansion3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'blah1', source: 'ML-QE'}, {phrase: 'blah2', source: 'ML-QE'}, {phrase: 'expansion1', source: 'abbreviations'}, {phrase: 'expansion2', source: 'abbreviations'}, {phrase: 'thing4', source: 'thesaurus'}, {phrase: 'thing5', source: 'thesaurus'}]});
		});

		it('should combine ML terms and synonyms and abbreviations if there are > 2 of two categories and 1 of the other and checking for removal of search term in ML terms', () => {
			const target = new SearchUtility(opts);

			const expansionDict = {something: ['something blah1', 'blah2 something', 'thing1', 'thing2', 'thing3', 'thing41']};
			const synonyms = ['thing4'];
			const key = 'something';
			const abbs = ['expansion1', 'expansion2', 'expansion3'];

			let result = target.combineExpansionTerms(expansionDict, synonyms, key, abbs);

			assert.deepEqual(result, {something: [{phrase: 'blah1', source: 'ML-QE'}, {phrase: 'blah2', source: 'ML-QE'}, {phrase: 'expansion1', source: 'abbreviations'}, {phrase: 'expansion2', source: 'abbreviations'}, {phrase: 'expansion3', source: 'abbreviations'}, {phrase: 'thing4', source: 'thesaurus'}]});
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
				constants: { GAME_CHANGER_OPTS: {index: 'gamechanger'}}
			};
			const body = { searchText: 'mission', index: 'gamechanger' };
			let target = new SearchUtility(tmpOpts);
			let actual = target.getESpresearchMultiQuery(body);
			const expected = [{index: 'gamechanger'}, {_source: ['filename'], query: {wildcard: {'filename.search': {boost: 1, rewrite: 'constant_score', value: '*MISSION*'}}}, size: 2}, {index: 'gamechanger'}, {_source: ['title'], query: {wildcard: {'title.search': {boost: 1, rewrite: 'constant_score', value: '*MISSION*'}}}, size: 2}, {index: undefined}, {aggs: {search_query: {aggs: {user: {terms: {field: 'user_id', size: 3}}}, terms: {field: 'search_query', min_doc_count: 5}}}, query: {prefix: {search_query: {value: 'mission'}}}, size: 1}, {index: undefined}, {_source: {includes: ['name', 'aliases', 'entity_type']}, query: {prefix: {name: {value: 'mission'}}}, size: 2}];
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

			const expected = {_source: {includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', 'topics_rs']}, aggregations: {doc_org_aggs: {terms: {field: 'display_org_s', size: 10000}}, doc_type_aggs: {terms: {field: 'display_doc_type_s', size: 10000}}}, from: 0, highlight: {fields: {id: {fragment_size: 180, number_of_fragments: 1}, keyw_5: {fragment_size: 180, number_of_fragments: 1}, 'title.search': {fragment_size: 180, number_of_fragments: 1}}, fragmenter: 'span'}, query: {bool: {filter: [{term: {is_revoked_b: 'false'}}], minimum_should_match: 1, must: [], should: [{nested: {inner_hits: {_source: false, from: 0, highlight: {fields: {'paragraphs.filename.search': {number_of_fragments: 0}, 'paragraphs.par_raw_text_t': {fragment_size: 180, number_of_fragments: 1}, 'paragraphs.par_raw_text_t.gc_english': {fragment_size: 180, number_of_fragments: 1}}, fragmenter: 'span'}, size: 5, stored_fields: ['paragraphs.page_num_i', 'paragraphs.filename', 'paragraphs.par_raw_text_t']}, path: 'paragraphs', query: {bool: {minimum_should_match: 1, should: [{wildcard: {'paragraphs.filename.search': {boost: 50, value: '*artificial intelligence*'}}}, {query_string: {analyzer: 'gc_english', default_field: 'paragraphs.par_raw_text_t.gc_english', default_operator: 'and', fuzziness: 'AUTO', fuzzy_max_expansions: 100, query: 'artificial intelligence', }}]}}}}, {multi_match: {fields: ['id^5', 'title.search^15', 'keyw_5'], operator: 'AND', query: 'artificial intelligence', type: 'best_fields'}}]}}, size: 20, "sort": [{"_score": {"order": "desc"}}], stored_fields: ['filename', 'title', 'page_count', 'doc_type', 'doc_num', 'ref_list', 'id', 'summary_30', 'keyw_5', 'p_text', 'type', 'p_page', 'display_title_s', 'display_org_s', 'display_doc_type_s', 'is_revoked_b', 'access_timestamp_dt', 'publication_date_dt', 'crawler_used_s', 'download_url_s', 'source_page_url_s', 'source_fqdn_s'], track_total_hits: true};
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
			assert.deepStrictEqual(actual.sort, [ {"publication_date_dt": {"order" : "desc"}} ]);
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
			assert.deepStrictEqual(actual.sort, [ {"display_title_s": {"order" : "desc"}} ]);
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
			assert.deepStrictEqual(actual.sort,  [{"_script": {
				"type": "number",
				"script": "doc.ref_list.size()",
				"order": "desc"
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

	describe('#getElasticsearchQueryUsingParagraphId', () => {
		it('should return an es query given paraIds', () => {
			const opts = {
				...constructorOptionsMock,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};

			const parsedQuery = 'artificial intelligence';
			const paraIds = ['Test', 'Test2'];
			let target = new SearchUtility(opts);

			const actual = target.getElasticsearchQueryUsingParagraphId({
				paraIds,
				parsedQuery
			});
			const expected = {_source: {includes: ['pagerank_r', 'kw_doc_score_r', 'pagerank']}, stored_fields: ['filename', 'title', 'page_count', 'doc_type', 'doc_num', 'ref_list', 'id', 'summary_30', 'keyw_5', 'type', 'pagerank_r'], track_total_hits: true, size: 100, aggregations: {doc_org_aggs: {terms: {field: 'display_org_s', size: 10000}}, doc_type_aggs: {terms: {field: 'display_doc_type_s', size: 10000}}}, query: {bool: {should: {nested: {path: 'paragraphs', inner_hits: {_source: false, stored_fields: ['paragraphs.page_num_i', 'paragraphs.filename', 'paragraphs.par_raw_text_t'], from: 0, size: 5, highlight: {fields: {'paragraphs.filename.search': {number_of_fragments: 0}, 'paragraphs.par_raw_text_t': {fragment_size: 180, number_of_fragments: 1}}, fragmenter: 'span'}}, query: {bool: {must: [{terms: {'paragraphs.id': ['Test', 'Test2']}}], should: [{wildcard: {'paragraphs.filename.search': {value: '*artificial intelligence*', boost: 15}}}, {query_string: {query: 'artificial intelligence', default_field: 'paragraphs.par_raw_text_t', default_operator: 'and', fuzzy_max_expansions: 100, fuzziness: 'AUTO'}}]}}}}}}};
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
			const expected = {docIds: ['Title 22.pdf_0'], docs: [{display_doc_type_s: 'Title', display_org_s: 'US House of Representatives', display_title_s: 'Foreign Relations and Intercourse', doc_num: '22', doc_type: 'Title', filename: 'Title 22.pdf', id: 'Title 22.pdf_0', keyw_5: ['effective date', 'congressional committees', 'fiscal year', 'foreign relations', 'international development', 'foreign affairs', 'complete classification', 'foreign service', 'human rights', 'international organizations'], page_count: 3355, ref_list: ['Title 50', 'Title 3', 'Title 8', 'Title 31', 'Title 18', 'Title 28', 'Title28', 'Title 10', 'Title 2', 'Title 12', 'Title 15', 'Title 30'], summary_30: 'WHenhancedRenhancedAS the Congress of the United Nationsited Nationsited States, in section 620 of the Foreign Assistance Act of 1961 (75 including section 301 of title 3, United Nationsited Nationsited States Code, I hereby delegate to the Secretary of the Treasury the Any agency or officer of the United Nationsited Nationsited States government-ownedvernment carrying out functions under this chapter comparable information on covered United Nationsited Nationsited States foreign assistance programs, including all including section 301 of title 3 of the United Nationsited Nationsited States Code, I hereby delegate to the Secretary of Defense the The United Nationsited Nationsited States government-ownedvernment shall terminate assistance to that country under the Foreign', title: 'Foreign Relations and Intercourse', type: 'document'}], expansionDict: [], pubIds: ['Title 22'], searchTerms: ['"requirement to conclude a bilateral agreement"', 'rocket'], totalCount: 1};
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
			const expected = {totalCount: 1, docs: [{display_doc_type_s: 'Title', display_org_s: 'US House of Representatives', display_title_s: 'Foreign Relations and Intercourse', doc_num: '22', doc_type: 'Title', filename: 'Title 22.pdf', id: 'Title 22.pdf_0', keyw_5: 'effective date, congressional committees, fiscal year, foreign relations, international development, foreign affairs, complete classification, foreign service, human rights, international organizations', page_count: 3355, ref_list: ['Title 50', 'Title 3', 'Title 8', 'Title 31', 'Title 18', 'Title 28', 'Title28', 'Title 10', 'Title 2', 'Title 12', 'Title 15', 'Title 30'], summary_30: 'WHenhancedRenhancedAS the Congress of the United Nationsited Nationsited States, in section 620 of the Foreign Assistance Act of 1961 (75 including section 301 of title 3, United Nationsited Nationsited States Code, I hereby delegate to the Secretary of the Treasury the Any agency or officer of the United Nationsited Nationsited States government-ownedvernment carrying out functions under this chapter comparable information on covered United Nationsited Nationsited States foreign assistance programs, including all including section 301 of title 3 of the United Nationsited Nationsited States Code, I hereby delegate to the Secretary of Defense the The United Nationsited Nationsited States government-ownedvernment shall terminate assistance to that country under the Foreign', title: 'Foreign Relations and Intercourse', type: 'document', topics_rs: ['0'], pageHits: [{snippet: '"the export of defense items .( C ) Exception for defense trade cooperation treaties ( i ) In general The <em>requirement</em> <em>to</em> <em>conclude</em> <em>a</em> <em>bilateral</em> <em>agreement</em> in accordance with subparagraph"', pageNumber: 1819}], pageHitCount: 1, esIndex: 'gamechanger'}], doc_types: [], doc_orgs: [], query: undefined, searchTerms: ['"requirement to conclude a bilateral agreement"', 'rocket'], expansionDict: []};
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

	describe('#getElasticsearchPagesQuery', () => {
		it('should return an es query given parsedQuery and defaults', () => {
			const tmpOpts = {
				...opts,
				constants: {GAME_CHANGER_OPTS: {allow_daterange: false}}
			};

			const parsedQuery = 'ai';
			let target = new SearchUtility(tmpOpts);
			const isClone = false;
			const actual = target.getElasticsearchPagesQuery({parsedQuery, isClone});
			const expected = {_source: {includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs']}, stored_fields: ['filename', 'title', 'page_count', 'doc_type', 'doc_num', 'ref_list', 'id', 'summary_30', 'keyw_5', 'p_text', 'type', 'p_page', 'display_title_s', 'display_org_s', 'display_doc_type_s'], from: 0, size: 20, aggregations: {doc_type_aggs: {terms: {field: 'doc_type', size: 10000}}}, track_total_hits: true, query: {bool: {must: [{bool: {should: [{nested: {path: 'pages', inner_hits: {_source: false, stored_fields: ['pages.filename', 'pages.p_raw_text'], from: 0, size: 5, highlight: {fields: {'pages.filename.search': {number_of_fragments: 0}, 'pages.p_raw_text': {fragment_size: 180, number_of_fragments: 1}}, fragmenter: 'span'}}, query: {bool: {should: [{wildcard: {'pages.filename.search': {value: 'ai*', boost: 15}}}, {query_string: {query: 'ai', default_field: 'pages.p_raw_text', default_operator: 'and', fuzzy_max_expansions: 100, fuzziness: 'AUTO'}}]}}}}]}}, {query_string: {query: 'display_org_s:(undefined)'}}], should: [{multi_match: {query: 'ai', fields: ['keyw_5^2', 'id^2', 'summary_30', 'pages.p_raw_text'], operator: 'or'}}, {rank_feature: {field: 'pagerank_r', boost: 0.5}}, {rank_feature: {field: 'kw_doc_score_r', boost: 0.1}}]}}};
			assert.deepEqual(actual, expected);
		});
	});

	describe('#makeBigramQueries', function () {

		it('should take in the query broken into a list, the found alias, and create bigram queries for QA', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
			};
	
			const searchTextList = ['what', 'is', 'the', 'mission', 'of', 'the', 'epa'];
			const alias = "Environmental Protection Agency"
			const target = new SearchUtility(tmpOpts);
			const actual = target.makeBigramQueries(searchTextList, alias);
			const expected = {"entityShouldQueries":[{"match_phrase":{"name":{"query":"what is","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"what is","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"is the","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"is the","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"the mission","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"the mission","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"mission of","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"mission of","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"of the","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"of the","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"the epa","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"the epa","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"Environmental Protection Agency","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"Environmental Protection Agency","type":"phrase_prefix"}}],"docMustQueries":[{"wildcard":{"paragraphs.filename.search":{"value":"what is","boost":15}}},{"query_string":{"query":"what is","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"is the","boost":15}}},{"query_string":{"query":"is the","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"the mission","boost":15}}},{"query_string":{"query":"the mission","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"mission of","boost":15}}},{"query_string":{"query":"mission of","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"of the","boost":15}}},{"query_string":{"query":"of the","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"the epa","boost":15}}},{"query_string":{"query":"the epa","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"Environmental Protection Agency","boost":15}}},{"query_string":{"query":"Environmental Protection Agency","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}],"docShouldQueries":[{"multi_match":{"query":"what is the mission of the epa","fields":["keyw_5^2","id^2","summary_30","paragraphs.par_raw_text_t"],"operator":"or"}},{"multi_match":{"query":"what is","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"is the","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"the mission","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"mission of","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"of the","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"the epa","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"Environmental Protection Agency","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}}]}
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#phraseQAQuery', function () {

		it('should take in the bigram queries and return an ES query for QA context (documents)', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
			};
			const bigramQueries = {"entityShouldQueries":[{"match_phrase":{"name":{"query":"what is","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"what is","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"is the","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"is the","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"the mission","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"the mission","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"mission of","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"mission of","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"of the","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"of the","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"the epa","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"the epa","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"Environmental Protection Agency","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"Environmental Protection Agency","type":"phrase_prefix"}}],"docMustQueries":[{"wildcard":{"paragraphs.filename.search":{"value":"what is","boost":15}}},{"query_string":{"query":"what is","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"is the","boost":15}}},{"query_string":{"query":"is the","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"the mission","boost":15}}},{"query_string":{"query":"the mission","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"mission of","boost":15}}},{"query_string":{"query":"mission of","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"of the","boost":15}}},{"query_string":{"query":"of the","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"the epa","boost":15}}},{"query_string":{"query":"the epa","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"Environmental Protection Agency","boost":15}}},{"query_string":{"query":"Environmental Protection Agency","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}],"docShouldQueries":[{"multi_match":{"query":"what is the mission of the epa","fields":["keyw_5^2","id^2","summary_30","paragraphs.par_raw_text_t"],"operator":"or"}},{"multi_match":{"query":"what is","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"is the","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"the mission","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"mission of","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"of the","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"the epa","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"Environmental Protection Agency","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}}]}
			const queryType = 'document';
			const entityLimit = 4;
			const maxLength = 3000;
			const user = 'fake user';
			const target = new SearchUtility(tmpOpts);
			const actual = target.phraseQAQuery(bigramQueries, queryType, entityLimit, maxLength, user);
			const expected = {"query":{"bool":{"must":[{"nested":{"path":"paragraphs","inner_hits":{"_source":false,"stored_fields":["paragraphs.page_num_i","paragraphs.filename","paragraphs.par_raw_text_t"],"from":0,"size":5,"highlight":{"fields":{"paragraphs.filename.search":{"number_of_fragments":0},"paragraphs.par_raw_text_t":{"fragment_size":3000,"number_of_fragments":1}},"fragmenter":"span"}},"query":{"bool":{"should":[{"wildcard":{"paragraphs.filename.search":{"value":"what is","boost":15}}},{"query_string":{"query":"what is","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"is the","boost":15}}},{"query_string":{"query":"is the","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"the mission","boost":15}}},{"query_string":{"query":"the mission","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"mission of","boost":15}}},{"query_string":{"query":"mission of","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"of the","boost":15}}},{"query_string":{"query":"of the","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"the epa","boost":15}}},{"query_string":{"query":"the epa","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"Environmental Protection Agency","boost":15}}},{"query_string":{"query":"Environmental Protection Agency","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}}],"should":[{"multi_match":{"query":"what is the mission of the epa","fields":["keyw_5^2","id^2","summary_30","paragraphs.par_raw_text_t"],"operator":"or"}},{"multi_match":{"query":"what is","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"is the","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"the mission","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"mission of","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"of the","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"the epa","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"Environmental Protection Agency","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}}]}}}
			assert.deepStrictEqual(actual, expected);
		});

		it('should take in the bigram queries and return an ES query for QA context (entities)', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
			};
			const bigramQueries = {"entityShouldQueries":[{"match_phrase":{"name":{"query":"what is","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"what is","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"is the","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"is the","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"the mission","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"the mission","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"mission of","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"mission of","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"of the","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"of the","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"the epa","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"the epa","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"Environmental Protection Agency","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"Environmental Protection Agency","type":"phrase_prefix"}}],"docMustQueries":[{"wildcard":{"paragraphs.filename.search":{"value":"what is","boost":15}}},{"query_string":{"query":"what is","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"is the","boost":15}}},{"query_string":{"query":"is the","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"the mission","boost":15}}},{"query_string":{"query":"the mission","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"mission of","boost":15}}},{"query_string":{"query":"mission of","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"of the","boost":15}}},{"query_string":{"query":"of the","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"the epa","boost":15}}},{"query_string":{"query":"the epa","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"Environmental Protection Agency","boost":15}}},{"query_string":{"query":"Environmental Protection Agency","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}],"docShouldQueries":[{"multi_match":{"query":"what is the mission of the epa","fields":["keyw_5^2","id^2","summary_30","paragraphs.par_raw_text_t"],"operator":"or"}},{"multi_match":{"query":"what is","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"is the","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"the mission","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"mission of","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"of the","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"the epa","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"Environmental Protection Agency","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}}]}
			const queryType = 'entities';
			const entityLimit = 4;
			const maxLength = 3000;
			const user = 'fake user';
			const target = new SearchUtility(tmpOpts);
			const actual = target.phraseQAQuery(bigramQueries, queryType, entityLimit, maxLength, user);
			const expected = {"from":0,"query":{"bool":{"should":[{"match_phrase":{"name":{"query":"what is","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"what is","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"is the","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"is the","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"the mission","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"the mission","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"mission of","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"mission of","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"of the","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"of the","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"the environmental","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"the environmental","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"environmental protection","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"environmental protection","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"protection agency","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"protection agency","type":"phrase_prefix"}}]}}};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#makeAliasQuery', function () {

		it('should take in the query searchtextlist and create an ES query for aliases', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
			};
	
			const searchTextList = ['what', 'is', 'the', 'mission', 'of', 'the', 'epa'];
			const entityLimit = 4;
			const target = new SearchUtility(tmpOpts);
			const actual = target.makeAliasQuery(searchTextList, entityLimit);
			const expected = {"from":0,"query":{"bool":{"should":{"nested":{"path":"aliases","query":{"bool":{"should":[{"match":{"aliases.name":"what"}},{"match":{"aliases.name":"is"}},{"match":{"aliases.name":"the"}},{"match":{"aliases.name":"mission"}},{"match":{"aliases.name":"of"}},{"match":{"aliases.name":"the"}},{"match":{"aliases.name":"epa"}}]}}}}}}}
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#findAliases', function () {

		it('should return an alias match for an entity in the query', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(qaESReturn);
					}
				}
			};
	
			const searchTextList = ['what', 'is', 'the', 'mission', 'of', 'the', 'epa'];
			const entityLimit = 4;
			const esClientName = 'gamechanger';
			const entitiesIndex = 'entities';
			const target = new SearchUtility(tmpOpts);
			const actual = await target.findAliases(searchTextList, entityLimit, esClientName, entitiesIndex, user);
			const expected = {"_index":"entities_20210624","_type":"_doc","_id":"fGIhP3oBSijRXU555yQW","_score":4.9245024,"_source":{"name":"Environmental Protection Agency","website":"https://www.epa.gov/","address":"Ariel Rios Building 1200 Pennsylvania Ave., NW Washington, DC 20460","government_branch":"Independent Agency","parent_agency":"United States Government","related_agency":"  ","entity_type":"org","crawlers":"","num_mentions":"","aliases":[{"name":"EPA"}],"information":"The Environmental Protection Agency (EPA) is an independent executive agency of the United States federal government tasked with environmental protection matters. President Richard Nixon proposed the establishment of EPA on July 9, 1970; it began operation on December 2, 1970, after Nixon signed an executive order. The order establishing the EPA was ratified by committee hearings in the House and Senate. The agency is led by its administrator, who is appointed by the president and approved by the Senate. The current Administrator is Michael S. Regan. The EPA is not a Cabinet department, but the administrator is normally given cabinet rank.The EPA has its headquarters in Washington, D.C., regional offices for each of the agency's ten regions, and 27 laboratories. The agency conducts environmental assessment, research, and education. It has the responsibility of maintaining and enforcing national standards under a variety of environmental laws, in consultation with state, tribal, and local governments. It delegates some permitting, monitoring, and enforcement responsibility to U.S. states and the federally recognized tribes. EPA enforcement powers include fines, sanctions, and other measures. The agency also works with industries and all levels of government in a wide variety of voluntary pollution prevention programs and energy conservation efforts.In 2018, the agency had 13,758 employees. More than half of EPA's employees are engineers, scientists, and environmental protection specialists; other employees include legal, public affairs, financial, and information technologists.Many public health and environmental groups advocate for the agency and believe that it is creating a better world. Other critics believe that the agency commits government overreach by adding unnecessary regulations on business and property owners.","information_source":"Wikipedia","information_retrieved":"2021-06-04"},"match":"EPA"};
			assert.deepStrictEqual(actual, expected);
		});

		it('should return no alias if no alias is matched in the query', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(qaESReturn);
					}
				}
			};
	
			const searchTextList = ['what', 'is', 'the', 'mission', 'of', 'the', 'environmental', 'protection', 'agency'];
			const entityLimit = 4;
			const esClientName = 'gamechanger';
			const entitiesIndex = 'entities';
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
						filename: "dummy one (fail)",
						docId: "dummyone.pdf",
						paragraphs: [
							{par_raw_text_t: ""},
							{par_raw_text_t: ""}
						]
					}
				},
				{
					_source: {
						filename: "dummy two (fail)",
						docId: "dummytwo.pdf",
						paragraphs: [
							{par_raw_text_t: "test test"},
							{par_raw_text_t: "test test test test"}
						]
					}
				},
				{
					_source: {
						filename: "dummy three (pass)",
						docId: "dummythree.pdf",
						paragraphs: [
							{par_raw_text_t: "5 . A AI TF leaders and talent have been selected to start work immediately in coordination with JAIC ’s efforts .The A AI TF will establish its footprint in accordance with Carnegie Mellon ’s 90 day occupation plan , formally organize under AFC , develop and then implement an Army AI Strategy , and initiate pilot projects in coordination with S E C R E T AR Y O F T H E A R M Y W A S H I N G T O N"}
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
						filename: "dummy three (pass)",
						docId: "dummythree.pdf",
						paragraphs: [
							{par_raw_text_t: "5 . A AI TF leaders and talent have been selected to start work immediately in coordination with JAIC ’s efforts .The A AI TF will establish its footprint in accordance with Carnegie Mellon ’s 90 day occupation plan , formally organize under AFC , develop and then implement an Army AI Strategy , and initiate pilot projects in coordination with S E C R E T AR Y O F T H E A R M Y W A S H I N G T O N"}
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
			const actual = target.expandParagraphs(qaESReturn, parIdx, minLength);
			const expected = ["MEMORANDUM FOR SEE DISTRIBUTION ", "SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ", "1 . References : ", "a . Memorandum , Deputy Secretary of Defense , June 27 , 2018 , subject : Establishment of the Joint Artificial Intelligence Center .", "b . 2018 Department of Defense Artificial Intelligence Strategy , June 27 , 2018 .", "2 . The 2018 National Defense Strategy articulates advancements in artificial intelligence ( AI ) that will present strategic opportunities and risks .The Department of Defense ( Do D ) has directed the establishment of the Joint Artificial Intelligence Center ( JAIC ) under the Do D Chief Information Officer .The JAIC serves as the accelerator and synchronizer of Do D AI activities .The Do D Chief Information Officer is seeking partnership with the Military Services as sponsors in three locations : the Pentagon , the National Capital Region , and Pittsburgh , PA .Large scale efforts or clusters of closely related joint urgent challenges will be identified as National Military Initiatives and will be executed in partnership across Do D . These efforts serve as opportunities for synergy among efforts the respective stakeholders may initiate to achieve their statutory responsibilities .", "3 . The Army is establishing the Army AI Task Force ( A AI TF ) that will narrow an existing AI capability gap by leveraging current technological applications to enhance our warfighters , preserve peace , and , if required , fight to win .", "4 . The purpose of this directive is to establish a scalable A AI TF under U.S . Army Futures Command ( AFC ) consisting of hand selected Army personnel with specific skillsets to lead Army AI efforts and support Do D projects , principally based at Carnegie Mellon University .The end state is an empowered team that rapidly integrates and synchronizes AI activities across the Army enterprise and Do D ’s National Military Initiatives .", "5 . A AI TF leaders and talent have been selected to start work immediately in coordination with JAIC ’s efforts .The A AI TF will establish its footprint in accordance with Carnegie Mellon ’s 90 day occupation plan , formally organize under AFC , develop and then implement an Army AI Strategy , and initiate pilot projects in coordination with S E C R E T AR Y O F T H E A R M Y W A S H I N G T O N "];
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
			const actual = result.body.hits.total;
			const expected = {"relation": "eq", "value": 9986};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#cleanParagraph', function () {

		it('should remove repeated table of contents-style periods from text', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};

			const paragraph = "GENERAL ISSUANCE INFORMATION . . . . . . . . . . . . . . . . . . . . . . 3 1.1 . Applicability ..................................................................................................................... 3 1.2 . Summary of Change 2 ...................................................................................................... 3 SECTION 2 : RESPONSIBILITIES ......................................................................................................... 4 2.1 . Assistant Secretary of Defense for Research and Engineering ( ASD ( R&E ) ) .................. 4 2.2 . Do D Component Heads .................................................................................................... 4 SECTION 3 : PROCEDURES ................................................................................................................ 5 3.1 . General .............................................................................................................................. 5 3.2 . FAPIIS Language in Notices of Funding Opportunity ..................................................... 5 3.3 . Determination of Recipient Qualifications ....................................................................... 5 3.4 . FAPIIS Award Term and Condition ................................................................................. 6 3.5"
			const target = new SearchUtility(tmpOpts);
			const actual = target.cleanParagraph(paragraph);
			const expected = "GENERAL ISSUANCE INFORMATION . 3 1.1 . Applicability . 3 1.2 . Summary of Change 2 . 3 SECTION 2 : RESPONSIBILITIES . 4 2.1 . Assistant Secretary of Defense for Research and Engineering ( ASD ( R E ) ) . 4 2.2 . Do D Component Heads . 4 SECTION 3 : PROCEDURES . 5 3.1 . General . 5 3.2 . FAPIIS Language in Notices of Funding Opportunity . 5 3.3 . Determination of Recipient Qualifications . 5 3.4 . FAPIIS Award Term and Condition . 6 3.5"
			assert.deepStrictEqual(actual, expected);
		});

		it('should remove repeated table of contents-style Xs from text', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};

			const paragraph = "AS 0205 Radar System 2  Active A/S Radar Modes 2.0 X X X X X X  AS 0206 SAR Map Theory  Pilot Techniques & Procedures 3.0 X X X X X X  AS 0207 TFLIR/LASER 2.0 X X X X X X  AS 0208 TFLIR/DAS/NVC A/S Interpretation 1.5 X X X X X X  AS 0209 Laser Guided Bombs 2.0 X X X X X  AS 0210 GPS Guided Bombs 4.0 X X X X X  AS 0211 Small Diameter Bomb 2.5 X X X X X  AS 0212 Weaponeering / Ballistic Weapons Planner 2.5 X X X X X"
			const target = new SearchUtility(tmpOpts);
			const actual = target.cleanParagraph(paragraph);
			const expected = "AS 0205 Radar System 2 Active A/S Radar Modes 2.0 X AS 0206 SAR Map Theory Pilot Techniques Procedures 3.0 X AS 0207 TFLIR/LASER 2.0 X AS 0208 TFLIR/DAS/NVC A/S Interpretation 1.5 X AS 0209 Laser Guided Bombs 2.0 X AS 0210 GPS Guided Bombs 4.0 X AS 0211 Small Diameter Bomb 2.5 X AS 0212 Weaponeering / Ballistic Weapons Planner 2.5 X"
			assert.deepStrictEqual(actual, expected);
		});

		it('should remove weird characters', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}}
			};

			const paragraph = "2 ‚Ä¢ HR 6950 IH ( 1 ) STUDY REQUIRED.‚ÄîNot later than 2 years 1 after the date of the enactment of this Act  the Sec - 2 retary of Commerce and the Federal Trade Commis - 3 sion  in coordination with the head of any other ap - 4 propriate Federal agency  shall conduct a study on 5 the impact of artificial intelligence  including ma - 6 chine learning  on United States businesses con - 7 ducting interstate commerce .8 ( 2 ) REQUIREMENTS FOR STUDY.‚ÄîIn con"
			const target = new SearchUtility(tmpOpts);
			const actual = target.cleanParagraph(paragraph);
			const expected = "2 HR 6950 IH ( 1 ) STUDY REQUIRED. Not later than 2 years 1 after the date of the enactment of this Act the Sec 2 retary of Commerce and the Federal Trade Commis 3 sion in coordination with the head of any other ap 4 propriate Federal agency shall conduct a study on 5 the impact of artificial intelligence including ma 6 chine learning on United States businesses con 7 ducting interstate commerce .8 ( 2 ) REQUIREMENTS FOR STUDY. In con"
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#formatQAquery', function () {

		it('should take in the query and produce a set of QA query objects including matching aliases', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(qaESReturn);
					}
				}
			};

			const searchText = "what is the mission of the jaic?"
			const qaParams = {maxLength: 3000, maxDocContext: 3, maxParaContext: 3, minLength: 350, scoreThreshold: 100, entitylimit: 4};
			const esClientName = 'gamechanger';
			const entitiesIndex = 'entities';
			const userId = 'fake-user'
			const target = new SearchUtility(tmpOpts);
			const actual = await target.formatQAquery(searchText, qaParams, esClientName, entitiesIndex, userId);
			const expected = {"text":"what is the mission of the Joint Artificial Intelligence Center","display":"what is the mission of the jaic?","list":["what","is","the","mission","of","the","jaic"],"alias":{"_index":"entities_20210624","_type":"_doc","_id":"lGIhP3oBSijRXU555ySL","_score":4.845589,"_source":{"name":"Joint Artificial Intelligence Center","website":"https://www.ai.mil","address":"","government_branch":"Executive Department Sub-Office/Agency/Bureau","parent_agency":"Office of the Secretary of Defense","related_agency":"","entity_type":"org","crawlers":"","num_mentions":"","aliases":[{"name":"JAIC"},{"name":"Joint AI Center"},{"name":"artificial intelligence"},{"name":"dod ai center"}],"information":"The Joint Artificial Intelligence Center (JAIC) is an American organization on exploring the usage of Artificial Intelligence (AI) (particularly Edge computing), Network of Networks and AI-enhanced communication for use in actual combat.It is a subdivision of the United States Armed Forces and was created in June 2018. The organization's stated objective is to 'transform the US Department of Defense by accelerating the delivery and adoption of AI to achieve mission impact at scale. The goal is to use AI to solve large and complex problem sets that span multiple combat systems; then, ensure the combat Systems and Components have real-time access to ever-improving libraries of data sets and tools.'","information_source":"Wikipedia","information_retrieved":"2021-06-04"},"match":"JAIC"}};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#getQAEntities', function () {

		it('should return the top matching entity (if an alias is found in the query)', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(qaESReturn);
					}
				}
			};

			const qaQueries = {"text":"what is the mission of the Joint Artificial Intelligence Center","display":"what is the mission of the jaic?","list":["what","is","the","mission","of","the","jaic"],"alias":{"_index":"entities_20210624","_type":"_doc","_id":"lGIhP3oBSijRXU555ySL","_score":4.845589,"_source":{"name":"Joint Artificial Intelligence Center","website":"https://www.ai.mil","address":"","government_branch":"Executive Department Sub-Office/Agency/Bureau","parent_agency":"Office of the Secretary of Defense","related_agency":"","entity_type":"org","crawlers":"","num_mentions":"","aliases":[{"name":"JAIC"},{"name":"Joint AI Center"},{"name":"artificial intelligence"},{"name":"dod ai center"}],"information":"The Joint Artificial Intelligence Center (JAIC) is an American organization on exploring the usage of Artificial Intelligence (AI) (particularly Edge computing), Network of Networks and AI-enhanced communication for use in actual combat.It is a subdivision of the United States Armed Forces and was created in June 2018. The organization's stated objective is to 'transform the US Department of Defense by accelerating the delivery and adoption of AI to achieve mission impact at scale. The goal is to use AI to solve large and complex problem sets that span multiple combat systems; then, ensure the combat Systems and Components have real-time access to ever-improving libraries of data sets and tools.'","information_source":"Wikipedia","information_retrieved":"2021-06-04"},"match":"JAIC"}};
			const bigramQueries = {"entityShouldQueries":[{"match_phrase":{"name":{"query":"what is","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"what is","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"is the","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"is the","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"the mission","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"the mission","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"mission of","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"mission of","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"of the","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"of the","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"the jaic","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"the jaic","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"Joint Artificial Intelligence Center","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"Joint Artificial Intelligence Center","type":"phrase_prefix"}}],"docMustQueries":[{"wildcard":{"paragraphs.filename.search":{"value":"what is","boost":15}}},{"query_string":{"query":"what is","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"is the","boost":15}}},{"query_string":{"query":"is the","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"the mission","boost":15}}},{"query_string":{"query":"the mission","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"mission of","boost":15}}},{"query_string":{"query":"mission of","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"of the","boost":15}}},{"query_string":{"query":"of the","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"the jaic","boost":15}}},{"query_string":{"query":"the jaic","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"Joint Artificial Intelligence Center","boost":15}}},{"query_string":{"query":"Joint Artificial Intelligence Center","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}],"docShouldQueries":[{"multi_match":{"query":"what is the mission of the jaic","fields":["keyw_5^2","id^2","summary_30","paragraphs.par_raw_text_t"],"operator":"or"}},{"multi_match":{"query":"what is","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"is the","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"the mission","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"mission of","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"of the","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"the jaic","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"Joint Artificial Intelligence Center","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}}]};
			const qaParams = {maxLength: 3000, maxDocContext: 3, maxParaContext: 3, minLength: 350, scoreThreshold: 100, entitylimit: 4};
			const esClientName = 'gamechanger';
			const entitiesIndex = 'entities';
			const userId = 'fake-user'
			const target = new SearchUtility(tmpOpts);
			const actual = await target.getQAEntities(qaQueries, bigramQueries, qaParams, esClientName, entitiesIndex, userId)
			const expected = {"QAResults":{"_index":"entities_20210624","_type":"_doc","_id":"lGIhP3oBSijRXU555ySL","_score":4.845589,"_source":{"name":"Joint Artificial Intelligence Center","website":"https://www.ai.mil","address":"","government_branch":"Executive Department Sub-Office/Agency/Bureau","parent_agency":"Office of the Secretary of Defense","related_agency":"","entity_type":"org","crawlers":"","num_mentions":"","aliases":[{"name":"JAIC"},{"name":"Joint AI Center"},{"name":"artificial intelligence"},{"name":"dod ai center"}],"information":"The Joint Artificial Intelligence Center (JAIC) is an American organization on exploring the usage of Artificial Intelligence (AI) (particularly Edge computing), Network of Networks and AI-enhanced communication for use in actual combat.It is a subdivision of the United States Armed Forces and was created in June 2018. The organization's stated objective is to 'transform the US Department of Defense by accelerating the delivery and adoption of AI to achieve mission impact at scale. The goal is to use AI to solve large and complex problem sets that span multiple combat systems; then, ensure the combat Systems and Components have real-time access to ever-improving libraries of data sets and tools.'","information_source":"Wikipedia","information_retrieved":"2021-06-04"},"match":"JAIC"}};
			assert.deepStrictEqual(actual, expected);
		});

		it('should return the top matching entity (even if there is no alias in the query)', () => {
			const tmpOpts = {
				...opts,
				constants: { GAME_CHANGER_OPTS: {allow_daterange: false}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(qaESReturn);
					}
				}
			};

			const qaQueries = {"text":"what is the mission of the joint artificial intelligence center","display":"what is the mission of the joint artificial intelligence center?","list":["what","is","the","mission","of","the","joint", "artificial", "intelligence", "center"],"alias":{}};
			const bigramQueries = {"entityShouldQueries":[{"match_phrase":{"name":{"query":"what is","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"what is","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"is the","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"is the","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"the mission","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"the mission","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"mission of","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"mission of","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"of the","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"of the","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"the joint","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"the joint","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"joint artificial","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"joint artificial","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"artificial intelligence","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"artificial intelligence","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"intelligence center","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"intelligence center","type":"phrase_prefix"}},{"match_phrase":{"name":{"query":"Joint Artificial Intelligence Center","slop":2,"boost":0.5}}},{"multi_match":{"fields":["name","aliases.name"],"query":"Joint Artificial Intelligence Center","type":"phrase_prefix"}}],"docMustQueries":[{"wildcard":{"paragraphs.filename.search":{"value":"what is","boost":15}}},{"query_string":{"query":"what is","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"is the","boost":15}}},{"query_string":{"query":"is the","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"the mission","boost":15}}},{"query_string":{"query":"the mission","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"mission of","boost":15}}},{"query_string":{"query":"mission of","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"of the","boost":15}}},{"query_string":{"query":"of the","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"the joint","boost":15}}},{"query_string":{"query":"the joint","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"joint artificial","boost":15}}},{"query_string":{"query":"joint artificial","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"artificial intelligence","boost":15}}},{"query_string":{"query":"artificial intelligence","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"intelligence center","boost":15}}},{"query_string":{"query":"intelligence center","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}},{"wildcard":{"paragraphs.filename.search":{"value":"Joint Artificial Intelligence Center","boost":15}}},{"query_string":{"query":"Joint Artificial Intelligence Center","default_field":"paragraphs.par_raw_text_t","default_operator":"AND","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}],"docShouldQueries":[{"multi_match":{"query":"what is the mission of the joint artificial intelligence center","fields":["keyw_5^2","id^2","summary_30","paragraphs.par_raw_text_t"],"operator":"or"}},{"multi_match":{"query":"what is","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"is the","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"the mission","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"mission of","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"of the","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"the joint","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"joint artificial","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"artificial intelligence","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"intelligence center","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}},{"multi_match":{"query":"Joint Artificial Intelligence Center","fields":["summary_30","title","keyw_5"],"type":"phrase","boost":5}}]};
			const qaParams = {maxLength: 3000, maxDocContext: 3, maxParaContext: 3, minLength: 350, scoreThreshold: 100, entitylimit: 4};
			const esClientName = 'gamechanger';
			const entitiesIndex = 'entities';
			const userId = 'fake-user';
			const target = new SearchUtility(tmpOpts);
			const actual = await target.getQAEntities(qaQueries, bigramQueries, qaParams, esClientName, entitiesIndex, userId)
			const expected = {"QAResults":{"_index":"entities_20210624","_type":"_doc","_id":"lGIhP3oBSijRXU555ySL","_score":5.1410418,"_source":{"name":"Joint Artificial Intelligence Center","website":"https://www.ai.mil","address":"","government_branch":"Executive Department Sub-Office/Agency/Bureau","parent_agency":"Office of the Secretary of Defense","related_agency":"","entity_type":"org","crawlers":"","num_mentions":"","aliases":[{"name":"JAIC"},{"name":"Joint AI Center"},{"name":"artificial intelligence"},{"name":"dod ai center"}],"information":"The Joint Artificial Intelligence Center (JAIC) is an American organization on exploring the usage of Artificial Intelligence (AI) (particularly Edge computing), Network of Networks and AI-enhanced communication for use in actual combat.It is a subdivision of the United States Armed Forces and was created in June 2018. The organization's stated objective is to 'transform the US Department of Defense by accelerating the delivery and adoption of AI to achieve mission impact at scale. The goal is to use AI to solve large and complex problem sets that span multiple combat systems; then, ensure the combat Systems and Components have real-time access to ever-improving libraries of data sets and tools.'","information_source":"Wikipedia","information_retrieved":"2021-06-04"},"match":"JAIC"}};
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
			const shortenedResults = {"answers":[{"text":"Increasing human resource team literacy","probability":0.9934731277348743,"null_score_diff":-5.02527916431427,"status":"passed","context":4},{"text":"to'transform the US Department of Defense by accelerating the delivery and adoption of AI","probability":0.9167887188464307,"null_score_diff":-2.3994941115379333,"status":"failed","context":0},{"text":"","probability":1,"null_score_diff":0,"status":"failed","context":1},{"text":"","probability":1,"null_score_diff":0,"status":"failed","context":2},{"text":"","probability":1,"null_score_diff":0,"status":"failed","context":3},{"text":"","probability":1,"null_score_diff":0,"status":"failed","context":5},{"text":"","probability":1,"null_score_diff":0,"status":"failed","context":6},{"text":"","probability":1,"null_score_diff":0,"status":"failed","context":7},{"text":"","probability":1,"null_score_diff":0,"status":"failed","context":7}],"question":"what is the mission of the Joint Artificial Intelligence Center"}
			const context = [{"filename":"Joint Artificial Intelligence Center","docId":"Joint Artificial Intelligence Center","docScore":4.845589,"retrievedDate":"2021-06-04","type":"org","resultType":"entity","source":"entity search","text":"The Joint Artificial Intelligence Center (JAIC) is an American organization on exploring the usage of Artificial Intelligence (AI) (particularly Edge computing), Network of Networks and AI-enhanced communication for use in actual combat.It is a subdivision of the United States Armed Forces and was created in June 2018. The organization's stated objective is to 'transform the US Department of Defense by accelerating the delivery and adoption of AI to achieve mission impact at scale. The goal is to use AI to solve large and complex problem sets that span multiple combat systems; then, ensure the combat Systems and Components have real-time access to ever-improving libraries of data sets and tools.'"},{"filename":"MCO 3120.11A MARINE CORPS PARACHUTING POLICY AND PROGRAM ADMINISTRATION","docId":"MCO 3120.11A.pdf_0","docScore":9.884508,"docTypeDisplay":"Document","pubDate":"2014-12-29T00:00:00","pageCount":69,"docType":"MCO","org":"US Marine Corps","resultType":"document","source":"intelligent search","parIdx":"593","text":"16 .Joint Aircraft Inspector ( JAI ) .The JAI serves as the on site air delivery cargo load inspector for the before load and after load inspections of all rigged air drop loads .The JAI provides flexibility and safety during sustained operations and training by performing required parachute load rigger inspections .These inspections are conducted prior to aircraft loading , after loading and rigging is completed from the transported force unit and the joint air drop load inspection with the air crew of all rigged , air drop supplies and equipment .Each JAI will be assigned in writing by the commanding officer .For USMC 0451 Airborne and Air Delivery Specialist a waiver must be approved prior to attendance for all Marines who do not meet the Army s E4 rank requirement .Waivers must be sent through the Marine Corps Detachment Ft .Lee , and approved by the Air Delivery and Field Service Department ( ADFSD ) Ft .Lee ."},{"filename":"H.Res. 855 Recognizing the Nordic Heritage Museum in Seattle, Washington, as the National Nordic Museum.","docId":"H.Res 855 IH 115th.pdf_0","docScore":124.252754,"docTypeDisplay":"Document","pubDate":"2018-04-27T00:00:00","pageCount":2,"docType":"H.Res.","org":"Congress","resultType":"document","source":"context search","parIdx":1,"text":"2 HRES 855 IH Whereas Nordic history , art , and culture will be even more vibrant and accessible when the Nordic Heritage Museum opens its new state of the art museum in 2018 ;Whereas the State of Washington , King County , the Nordic Council ( comprised of Nordic nations ) , the national museums of Denmark , Finland , Iceland , Norway , and Sweden , and many private individuals have partnered to provide funds and exhibits for the new Nordic Heritage Museum ;Whereas the Nordic Heritage Museum is a significant resource in preserving and celebrating the immigrant Nordic culture , art , and history ;Whereas the Nordic Heritage Museum is the only museum in the U.S . that exists for the exclusive purpose of preserving , interpreting , and providing education about Nordic culture and heritage ;Whereas the Nordic Heritage Museum promotes valuable international relations with the Nordic countries of Denmark , Finland , Iceland , Norway , and Sweden ; and Whereas it is appropriate to designate the Nordic Heritage Museum in Seattle , Washington , as the National Nordic Museum : Now , therefore , be it Resolved , That the House of Representatives recog 1 nizes the Nordic Heritage Museum of Seattle , Wash 2 ington , as the National Nordic Museum .3 Ver Date Sep 11 2014 21:45 Apr 27 , 2018 Jkt 079200 PO 00000 Frm 00002 Fmt 6652 Sfmt 6301 E: BILLS HR855.IH HR855 amozie on DSK30RV082PROD with BILLS "},{"filename":"H.Res. 855 Recognizing the Nordic Heritage Museum in Seattle, Washington, as the National Nordic Museum.","docId":"H.Res 855 IH 115th.pdf_0","docScore":124.252754,"docTypeDisplay":"Document","pubDate":"2018-04-27T00:00:00","pageCount":2,"docType":"H.Res.","org":"Congress","resultType":"document","source":"context search","parIdx":0,"text":"IV 115TH CONGRESS 2D SESSION H . RES . 855 Recognizing the Nordic Heritage Museum in Seattle , Washington , as the National Nordic Museum .IN THE HOUSE OF REPRESENTATIVES APRIL 27 , 2018 Ms . JAYAPAL( for herself , Mr . HOYER , Mr . SMITH of Washington , Mr . HECK , Ms . DELBENE , Mr . KILMER , Mr . LARSEN of Washington , Mr . COLE , Ms . MCCOLLUM , Mr . DOGGETT , Ms . JACKSON LEE , Mrs . DINGELL , and Mr . MEEKS ) submitted the following resolution ; which was referred to the Committee on Natural Resources RESOLUTION Recognizing the Nordic Heritage Museum in Seattle , Washington , as the National Nordic Museum .Whereas the Nordic Heritage Museum in Seattle , Washington , is the only museum in the United States dedicated to the history , culture , and art of the Nordic nations ;Whereas Nordic people have long contributed to the rich cultural heritage of the United States ;Whereas the Nordic Heritage Museum serves as a unique and valuable resource locally and nationwide in expanding knowledge of Nordic heritage and its impact throughout the U.S . ; Ver Date Sep 11 2014 21:45 Apr 27 , 2018 Jkt 079200 PO 00000 Frm 00001 Fmt 6652 Sfmt 6300 E: BILLS HR855.IH HR855 amozie on DSK30RV082PROD with BILLS "},{"filename":"S. 3965 To accelerate the application of artificial intelligence in the Department of Defense and to strengthen the workforce that pertains to artificial intelligence, and for other purposes.","docId":"S 3965 IS 116th.pdf_0","docScore":115.8213,"docTypeDisplay":"Legislation","pubDate":"2020-06-16T00:00:00","pageCount":11,"docType":"S.","org":"Congress","resultType":"document","source":"context search","parIdx":1,"text":"2 S 3965 IS Sec .1 . Short title ; table of contents .TITLE I DEPARTMENT OF DEFENSE ARTIFICIAL INTELLIGENCE LEADERSHIP Sec . 101 .Organizational placement of Director of the Joint Artificial Intelligence Center .Sec . 102 .Grade of Director of the Joint Artificial Intelligence Center .TITLE II STRENGTHENING THE DEPARTMENT OF DEFENSE ARTIFICIAL INTELLIGENCE WORKFORCE Sec . 201 .Increasing human resource team literacy in artificial intelligence .Sec . 202 .Guidance and direction on use of direct hiring processes for artificial intelligence professionals and other data science and software development personnel .Sec . 203 .Waiver of qualification standards for General Schedule positions in artificial intelligence .Sec . 204 .Modifying the Armed Services Vocational Aptitude Battery Test to address computational thinking .TITLE I DEPARTMENT OF DE 1 FENSE ARTIFICIAL INTELLI 2 GENCE LEADERSHIP 3 SEC . 101 .ORGANIZATIONAL PLACEMENT OF DIRECTOR OF 4 THE JOINT ARTIFICIAL INTELLIGENCE CEN 5 TER .6 ( a ) AUTHORITY . 7 ( 1 ) IN GENERAL. The Secretary of Defense 8 shall exercise authority and direction over the Joint 9 Artificial Intelligence Center .10 ( 2 )LIMITATION ON DELEGATION. The author 11 ity of the Secretary under this section may not be 12 delegated below the level of the Deputy Secretary of 13 Defense .14 ( b )DIRECT REPORTING TO SECRETARY OF DE 15 FENSE. The Director of the Joint Artificial Intelligence 16 Ver Date Sep 11 2014 05:18 Jun 26 , 2020 Jkt 099200 PO 00000 Frm 00002 Fmt 6652 Sfmt 6201 E: BILLS S3965.IS S3965 pbinns on DSKJLVW7X2PROD with BILLS "},{"filename":"S. 3965 To accelerate the application of artificial intelligence in the Department of Defense and to strengthen the workforce that pertains to artificial intelligence, and for other purposes.","docId":"S 3965 IS 116th.pdf_0","docScore":115.8213,"docTypeDisplay":"Legislation","pubDate":"2020-06-16T00:00:00","pageCount":11,"docType":"S.","org":"Congress","resultType":"document","source":"context search","parIdx":2,"text":"3 S 3965 IS Center shall report directly to the Secretary or the Deputy 1 Secretary on matters relating to artificial intelligence pol 2 icy , priorities , practices , and resourcing .3 SEC . 102 .GRADE OF DIRECTOR OF THE JOINT ARTIFICIAL 4 INTELLIGENCE CENTER .5 An officer appointed to serve as Director of the Joint 6 Artificial Intelligence Center shall , while so serving , have 7 the grade of lieutenant general in the Army , Air Force , 8 or Marine Corps or vice admiral in the Navy .9 TITLE II STRENGTHENING THE 10 DEPARTMENT OF DEFENSE 11 ARTIFICIAL INTELLIGENCE 12 WORKFORCE 13 SEC . 201 .INCREASING HUMAN RESOURCE TEAM LITERACY 14 IN ARTIFICIAL INTELLIGENCE .15 ( a )DEPARTMENT OF DEFENSE . 16 ( 1 ) TRAINING AND CERTIFICATION PROGRAM 17 REQUIRED. Not later than one year after the date 18 of the enactment of this Act , the Secretary of De 19 fense shall develop a training and certification pro 20 gram on software development , data science , and ar 21 tificial intelligence that is tailored to the needs of 22 the covered human resources workforce .23 ( 2 )REQUIREMENTS. The course required by 24 paragraph ( 1 ) shall 25 Ver Date Sep 11 2014 05:18 Jun 26 , 2020 Jkt 099200 PO 00000 Frm 00003 Fmt 6652 Sfmt 6201 E: BILLS S3965.IS S3965 pbinns on DSKJLVW7X2PROD with BILLS "},{"filename":"S. 3965 To accelerate the application of artificial intelligence in the Department of Defense and to strengthen the workforce that pertains to artificial intelligence, and for other purposes.","docId":"S 3965 IS 116th.pdf_0","docScore":115.8213,"docTypeDisplay":"Legislation","pubDate":"2020-06-16T00:00:00","pageCount":11,"docType":"S.","org":"Congress","resultType":"document","source":"context search","parIdx":4,"text":"5 S 3965 IS tus in which 80 percent of the covered human 1 resources workforce is so certified .2 ( b ) OTHER NATIONAL SECURITY AGENCIES. The 3 Secretary of Defense shall work with the Attorney Gen 4 eral , the Secretary of Homeland Security , the Director of 5 National Intelligence , or the head of any element of the 6 intelligence community to offer the training and certifi 7 cation program developed pursuant to subsection ( a ) to 8 employees of other national security agencies and to en 9 courage the heads of such agencies to achieve a level of 10 certification comparable to the objectives established for 11 the Department of Defense .12 ( c )DEFINITIONS. In this section : 13 ( 1 ) The term covered human resources work 14 force means human resources professionals , hiring 15 managers , and recruiters who are or will be respon 16 sible for hiring software developers , data scientists , 17 or artificial intelligence professionals .18 ( 2 )The term intelligence community has the 19 meaning given such term in section 3 of the Na 20 tional Security Act of 1947 ( 50 U.S.C . 3003 ) .21 ( d )AUTHORIZATION OF APPROPRIATIONS. There is 22 authorized to be appropriated to the Secretary of Defense 23 to carry out subsection ( a ) 2,500,000 for fiscal year 24 2021 .25 Ver Date Sep 11 2014 05:18 Jun 26 , 2020 Jkt 099200 PO 00000 Frm 00005 Fmt 6652 Sfmt 6201 E: BILLS S3965.IS S3965 pbinns on DSKJLVW7X2PROD with BILLS "},{"filename":"QTP 4B051-1 Program Management","docId":"QTP 4B051-1.pdf_0","docScore":99.85323,"docTypeDisplay":"Document","pubDate":"2015-03-20T00:00:00","pageCount":8,"docType":"QTP","org":"Dept. of the Air Force","resultType":"document","source":"context search","parIdx":0,"text":"AFQTP 4B051 1 Journeyman Training Guide : Program Management TABLE OF CONTENTS STS Line Item 2.3.4 Review local work order requests . 1 TRAINER GUIDANCE . 1 TASK STEPS . 2 TRAINEE REVIEW QUESTIONS . 4 PERFORMANCE CHECKLIST . 5 ANSWERS . 6 AFQTP 4B051 1 Journeyman Training Guide : Program Management STS Line Item 2.3.4 Review local work order requests . TRAINER GUIDANCE Proficiency Code : 2b PC Definition : Can do most parts of the task .Needs help only on hardest parts .Can determine step bystep procedures for doing the task .Prerequisites : None Training References : AFI 32 1001 , Operations Management , Sep 2005 Additional Supporting References : Air Force Pamphlet ( AFPAM ) 32 1004 V3 , Working in the Operations Flight Facility Maintenance , Chapter 4 CDC Reference : 4B051 Training Support Material : Copies of several previously reviewed work requests .Specific Techniques : Conduct hands on training and evaluation .Copies of self help/work requests previously reviewed can be useful when training this item .Select a variety of self help and work requests from the flight s administrative files and remove any documents that address finding of the previous review .The requests selected should cover a broad range of proposed work situations and potential OEH threats .Have the trainee review the work requests and identify and evaluate the potential OEH threats and recommend control measures .Compare the trainee s conclusions to those produced during the initial review .Criterion Objective : Given a work order request , determine the potential OEH hazards associated with the work order ( project ) and recommend appropriate control measures completing all checklist items with limited trainer assistance on only the hardest parts .Notes : 1 AFQTP 4B051 1 Journeyman Training Guide : Program Management TASK STEPS 1 . Log the work order request , if applicable ( See local requirements ) .2 . Review the work order request documents to develop a conceptual model of the project ( achieve an understanding of the work to be performed ) .1 3 .Anticipate OEH threats that could result.2 4 .Determine characteristics of each identified OEH health threat ( e.g . , toxicity , volatility , transmissibility ) .5 . Determine , if possible , exposure parameters ( e.g . , pathway , duration , concentration ) .6 . Identify populations at risk of exposure via all potential pathways.3 7 .Perform an exposure assessment for each population at risk of exposure.4 8 .Analyze the risk.5 9 .Determine appropriate control measures , if needed.6 10 .Document control measure recommendations , as required .11 .Communicate identified risks and control measures , as necessary.7 "}]
			const target = new SearchUtility(tmpOpts);
			const actual = target.cleanQAResults(searchResults, shortenedResults, context)
			const expected = {"question":"what is the mission of the jaic?","answers":["Increasing human resource team literacy"],"filenames":["Source: S. 3965 TO ACCELERATE THE APPLICATION OF ARTIFICIAL INTELLIGENCE IN THE DEPARTMENT OF DEFENSE AND TO STRENGTHEN THE WORKFORCE THAT PERTAINS TO ARTIFICIAL INTELLIGENCE, AND FOR OTHER PURPOSES. (DOCUMENT)"],"docIds":["S 3965 IS 116th.pdf_0"],"resultTypes":["document"]}
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
			const entity = {"_index":"entities_20210624","_type":"_doc","_id":"lGIhP3oBSijRXU555ySL","_score":7.461898,"_source":{"name":"Joint Artificial Intelligence Center","website":"https://www.ai.mil","address":"","government_branch":"Executive Department Sub-Office/Agency/Bureau","parent_agency":"Office of the Secretary of Defense","related_agency":"","entity_type":"org","crawlers":"","num_mentions":"","aliases":[{"name":"JAIC"},{"name":"Joint AI Center"},{"name":"artificial intelligence"},{"name":"dod ai center"}],"information":"The Joint Artificial Intelligence Center (JAIC) is an American organization on exploring the usage of Artificial Intelligence (AI) (particularly Edge computing), Network of Networks and AI-enhanced communication for use in actual combat.It is a subdivision of the United States Armed Forces and was created in June 2018. The organization's stated objective is to 'transform the US Department of Defense by accelerating the delivery and adoption of AI to achieve mission impact at scale. The goal is to use AI to solve large and complex problem sets that span multiple combat systems; then, ensure the combat Systems and Components have real-time access to ever-improving libraries of data sets and tools.'","information_source":"Wikipedia","information_retrieved":"2021-06-04"},"match":"JAIC"};
			const sentResults =  [{"score":0.002451957669109106,"id":"ARMY DIR 2018-18.pdf_20","text":"subject army directive army artificial intelligence task force in support of the department of defense joint artificial intelligence center"},{"score":0.002451957669109106,"id":"ARMY DIR 2018-18.pdf_2","text":"subject army directive army artificial intelligence task force in support of the department of defense joint artificial intelligence center"},{"score":0.002451957669109106,"id":"ARMY DIR 2018-18.pdf_52","text":"subject army directive army artificial intelligence task force in support of the department of defense joint artificial intelligence center"},{"score":0.002451957669109106,"id":"ARMY DIR 2018-18.pdf_35","text":"subject army directive army artificial intelligence task force in support of the department of defense joint artificial intelligence center"},{"score":0.002451957669109106,"id":"ARMY DIR 2018-18.pdf_11","text":"subject army directive army artificial intelligence task force in support of the department of defense joint artificial intelligence center"}];
			const esClientName = 'gamechanger';
			const esIndex = 'gamechanger';
			const userId = 'fake user';
			const qaParams = {maxLength: 3000, maxDocContext: 3, maxParaContext: 3, minLength: 350, scoreThreshold: 100, entitylimit: 4};
			const results = await target.getQAContext(docResults, entity, sentResults, esClientName, esIndex, userId, qaParams);
			const expected = [{"filename":"Joint Artificial Intelligence Center","docId":"Joint Artificial Intelligence Center","docScore":7.461898,"retrievedDate":"2021-06-04","type":"org","resultType":"entity","source":"entity search","text":"The Joint Artificial Intelligence Center (JAIC) is an American organization on exploring the usage of Artificial Intelligence (AI) (particularly Edge computing), Network of Networks and AI-enhanced communication for use in actual combat.It is a subdivision of the United States Armed Forces and was created in June 2018. The organization's stated objective is to 'transform the US Department of Defense by accelerating the delivery and adoption of AI to achieve mission impact at scale. The goal is to use AI to solve large and complex problem sets that span multiple combat systems; then, ensure the combat Systems and Components have real-time access to ever-improving libraries of data sets and tools.'"},{"filename":"ARMY 2018-18 ARMY ARTIFICIAL INTELLIGENCE TASK FORCE IN SUPPORT OF THE DEPARTMENT OF DEFENSE JOINT ARTIFICIAL INTELLIGENCE CENTER","docId":"ARMY DIR 2018-18.pdf_0","docScore":9.875534,"docTypeDisplay":"Document","pubDate":"2018-10-02T00:00:00","pageCount":7,"docType":"ARMY","org":"US Army","resultType":"document","source":"intelligent search","parIdx":"20","text":"c . Personnel .The A AI TF will be manned , with assistance from the Army Talent Management Task Force and U.S . Army Human Resources Command , to ensure proper talent selection within its organization for positions at the Pittsburgh location , in the National Capital Region , and with project teams to meet mission requirements .The Pittsburgh location will consist of six core personnel with talent from across the Army ( Functional Areas 49 , 26 , and 51 ; Career Field 01 ; and General Schedule 1101 and 1102 series personnel ) ; academia ; and industry .Each project team will be led by a project officer ( 01A ) , and the team size will vary based on the project s scope .The director , a general officer , and immediate support staff will locate in the National Capital Region . d . Responsibilities .The A AI TF , under the direction of AFC , is responsible for the life cycle of Army AI projects and projects that support the Do D level National Military Initiatives .The A AI TF will develop the Army AI Strategy , which will set the Army s AI developmental efforts and projects , AI governance , AI support requirements , and AI talent management . 6 . This effort will be executed in two phases : Phase I : Establish the A AI TF and Phase II : Manning and Occupation . a . Phase I : Establish the A AI TF .Phase I begins upon publication of this directive .AFC and A AI TF will begin planning and coordination .This phase ends when the Commanding General , AFC gives a back brief of the A AI TF Roadmap to the Under SUBJECT : Army Directive 2018 18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) 3 Secretary of the Army ( USA ) and Vice Chief of Staff , Army ( VCSA ) and the A AI TF is prepared to execute its occupation plan . b . Phase II : Manning and Occupation .Phase II will begin with the USA s and VCSA s approval of the Strategic Capability Roadmap and A AI TF charter .The AFC and A AI TF will refine requirements as needed .This phase will end when the Commanding General , AFC notifies the USA and VCSA that occupation and integration is complete . 7 . I direct the following actions : a . AFC will : ( 1 ) draft and staff the A AI TF execution order in conjunction with the Deputy Chief of Staff , G 3/5/7 ; and "}];
			assert.deepStrictEqual(results, expected);
		});
	});
});
