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
				constants: {env: { GAME_CHANGER_OPTS: {index: 'gamechanger'}}}
			};
			const body = { searchText: 'mission', index: 'gamechanger' };
			let target = new SearchUtility(tmpOpts);
			let actual = target.getESpresearchMultiQuery(body);
			const expected = [{index: 'gamechanger'}, {_source: ['filename'], query: {wildcard: {'filename.search': {boost: 1, rewrite: 'constant_score', value: '*MISSION*'}}}, size: 2}, {index: 'gamechanger'}, {_source: ['title'], query: {wildcard: {'title.search': {boost: 1, rewrite: 'constant_score', value: '*MISSION*'}}}, size: 2}, {index: undefined}, {aggs: {search_query: {aggs: {user: {terms: {field: 'user_id', size: 3}}}, terms: {field: 'search_query', min_doc_count: 5}}}, query: {prefix: {search_query: {value: 'mission'}}}, size: 1}, {index: undefined}, {_source: {includes: ['name', 'aliases', 'type']}, query: {prefix: {name: {value: 'mission'}}}, size: 2}];
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
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
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

			const expected = {_source: {includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', 'topics_rs']}, aggregations: {doc_org_aggs: {terms: {field: 'display_org_s', size: 10000}}, doc_type_aggs: {terms: {field: 'display_doc_type_s', size: 10000}}}, from: 0, highlight: {fields: {id: {fragment_size: 180, number_of_fragments: 1}, keyw_5: {fragment_size: 180, number_of_fragments: 1}, 'title.search': {fragment_size: 180, number_of_fragments: 1}}, fragmenter: 'span'}, query: {bool: {filter: [{term: {is_revoked_b: 'false'}}], minimum_should_match: 1, must: [], should: [{nested: {inner_hits: {_source: false, from: 0, highlight: {fields: {'paragraphs.filename.search': {number_of_fragments: 0}, 'paragraphs.par_raw_text_t': {fragment_size: 180, number_of_fragments: 1}}, fragmenter: 'span'}, size: 5, stored_fields: ['paragraphs.page_num_i', 'paragraphs.filename', 'paragraphs.par_raw_text_t']}, path: 'paragraphs', query: {bool: {minimum_should_match: 1, should: [{wildcard: {'paragraphs.filename.search': {boost: 50, value: '*artificial intelligence*'}}}, {query_string: {default_field: 'paragraphs.par_raw_text_t', default_operator: 'and', fuzziness: 'AUTO', fuzzy_max_expansions: 100, query: 'artificial intelligence', }}]}}}}, {multi_match: {fields: ['id^5', 'title.search^15', 'keyw_5'], operator: 'AND', query: 'artificial intelligence', type: 'best_fields'}}]}}, size: 20, stored_fields: ['filename', 'title', 'page_count', 'doc_type', 'doc_num', 'ref_list', 'id', 'summary_30', 'keyw_5', 'p_text', 'type', 'p_page', 'display_title_s', 'display_org_s', 'display_doc_type_s', 'is_revoked_b', 'access_timestamp_dt', 'publication_date_dt', 'crawler_used_s', 'download_url_s', 'source_page_url_s', 'source_fqdn_s'], track_total_hits: true};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#getElasticsearchQueryForGraphCache', () => {
		it('should return an es query given parsedQuery and defaults', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
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
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
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
				constants: {env: {GAME_CHANGER_OPTS: {allow_daterange: false}}}
			};

			const parsedQuery = 'ai';
			let target = new SearchUtility(tmpOpts);
			const isClone = false;
			const actual = target.getElasticsearchPagesQuery({parsedQuery, isClone});
			const expected = {_source: {includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs']}, stored_fields: ['filename', 'title', 'page_count', 'doc_type', 'doc_num', 'ref_list', 'id', 'summary_30', 'keyw_5', 'p_text', 'type', 'p_page', 'display_title_s', 'display_org_s', 'display_doc_type_s'], from: 0, size: 20, aggregations: {doc_type_aggs: {terms: {field: 'doc_type', size: 10000}}}, track_total_hits: true, query: {bool: {must: [{bool: {should: [{nested: {path: 'pages', inner_hits: {_source: false, stored_fields: ['pages.filename', 'pages.p_raw_text'], from: 0, size: 5, highlight: {fields: {'pages.filename.search': {number_of_fragments: 0}, 'pages.p_raw_text': {fragment_size: 180, number_of_fragments: 1}}, fragmenter: 'span'}}, query: {bool: {should: [{wildcard: {'pages.filename.search': {value: 'ai*', boost: 15}}}, {query_string: {query: 'ai', default_field: 'pages.p_raw_text', default_operator: 'and', fuzzy_max_expansions: 100, fuzziness: 'AUTO'}}]}}}}]}}, {query_string: {query: 'display_org_s:(undefined)'}}], should: [{multi_match: {query: 'ai', fields: ['keyw_5^2', 'id^2', 'summary_30', 'pages.p_raw_text'], operator: 'or'}}, {rank_feature: {field: 'pagerank_r', boost: 0.5}}, {rank_feature: {field: 'kw_doc_score_r', boost: 0.1}}]}}};
			assert.deepEqual(actual, expected);
		});
	});

	describe('#phraseQAQuery', function () {

		it('should take a question query and create an ES query for each bigram pair', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
			};

			const user = 'fake user';
			const searchText = 'what university does artificial intelligence for the army';
			const searchTextList = ['what', 'university', 'does', 'artificial', 'intelligence', 'for', 'the', 'army'];
			const maxLength = 3000;
			const target = new SearchUtility(tmpOpts);
			const actual = target.phraseQAQuery(searchText, searchTextList, maxLength, user);
			const expected = {query: {bool: {must: [{nested: {path: 'paragraphs', inner_hits: {_source: false, stored_fields: ['paragraphs.page_num_i', 'paragraphs.filename', 'paragraphs.par_raw_text_t'], from: 0, size: 5, highlight: {fields: {'paragraphs.filename.search': {number_of_fragments: 0}, 'paragraphs.par_raw_text_t': {fragment_size: 3000, number_of_fragments: 1}}, fragmenter: 'span'}}, query: {bool: {should: [{wildcard: {'paragraphs.filename.search': {value: 'what university', boost: 15}}}, {query_string: {query: 'what university', default_field: 'paragraphs.par_raw_text_t', default_operator: 'AND', fuzzy_max_expansions: 100, fuzziness: 'AUTO'}}, {wildcard: {'paragraphs.filename.search': {value: 'university does', boost: 15}}}, {query_string: {query: 'university does', default_field: 'paragraphs.par_raw_text_t', default_operator: 'AND', fuzzy_max_expansions: 100, fuzziness: 'AUTO'}}, {wildcard: {'paragraphs.filename.search': {value: 'does artificial', boost: 15}}}, {query_string: {query: 'does artificial', default_field: 'paragraphs.par_raw_text_t', default_operator: 'AND', fuzzy_max_expansions: 100, fuzziness: 'AUTO'}}, {wildcard: {'paragraphs.filename.search': {value: 'artificial intelligence', boost: 15}}}, {query_string: {query: 'artificial intelligence', default_field: 'paragraphs.par_raw_text_t', default_operator: 'AND', fuzzy_max_expansions: 100, fuzziness: 'AUTO'}}, {wildcard: {'paragraphs.filename.search': {value: 'intelligence for', boost: 15}}}, {query_string: {query: 'intelligence for', default_field: 'paragraphs.par_raw_text_t', default_operator: 'AND', fuzzy_max_expansions: 100, fuzziness: 'AUTO'}}, {wildcard: {'paragraphs.filename.search': {value: 'for the', boost: 15}}}, {query_string: {query: 'for the', default_field: 'paragraphs.par_raw_text_t', default_operator: 'AND', fuzzy_max_expansions: 100, fuzziness: 'AUTO'}}, {wildcard: {'paragraphs.filename.search': {value: 'the army', boost: 15}}}, {query_string: {query: 'the army', default_field: 'paragraphs.par_raw_text_t', default_operator: 'AND', fuzzy_max_expansions: 100, fuzziness: 'AUTO'}}]}}}}], should: [{multi_match: {query: 'what university does artificial intelligence for the army', fields: ['keyw_5^2', 'id^2', 'summary_30', 'paragraphs.par_raw_text_t'], operator: 'or'}}, {multi_match: {query: 'what university', fields: ['summary_30', 'title', 'keyw_5'], type: 'phrase', boost: 5}}, {multi_match: {query: 'university does', fields: ['summary_30', 'title', 'keyw_5'], type: 'phrase', boost: 5}}, {multi_match: {query: 'does artificial', fields: ['summary_30', 'title', 'keyw_5'], type: 'phrase', boost: 5}}, {multi_match: {query: 'artificial intelligence', fields: ['summary_30', 'title', 'keyw_5'], type: 'phrase', boost: 5}}, {multi_match: {query: 'intelligence for', fields: ['summary_30', 'title', 'keyw_5'], type: 'phrase', boost: 5}}, {multi_match: {query: 'for the', fields: ['summary_30', 'title', 'keyw_5'], type: 'phrase', boost: 5}}, {multi_match: {query: 'the army', fields: ['summary_30', 'title', 'keyw_5'], type: 'phrase', boost: 5}}]}}};
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#expandParagraphs', function () {

		it('should take a full doc, par id, and min length, and return the target paragraph expanded to include text before/after', () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}}
			};

			const listParagraphs = ['', 'MEMORANDUM FOR SEE DISTRIBUTION ', 'SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ', '1 . References : ', 'a . Memorandum , Deputy Secretary of Defense , June 27 , 2018 , subject : Establishment of the Joint Artificial Intelligence Center .', 'b . 2018 Department of Defense Artificial Intelligence Strategy , June 27 , 2018 .', '2 . The 2018 National Defense Strategy articulates advancements in artificial intelligence ( AI ) that will present strategic opportunities and risks .The Department of Defense ( Do D ) has directed the establishment of the Joint Artificial Intelligence Center ( JAIC ) under the Do D Chief Information Officer .The JAIC serves as the accelerator and synchronizer of Do D AI activities .The Do D Chief Information Officer is seeking partnership with the Military Services as sponsors in three locations : the Pentagon , the National Capital Region , and Pittsburgh , PA .Large scale efforts or clusters of closely related joint urgent challenges will be identified as National Military Initiatives and will be executed in partnership across Do D . These efforts serve as opportunities for synergy among efforts the respective stakeholders may initiate to achieve their statutory responsibilities .', '3 . The Army is establishing the Army AI Task Force ( A AI TF ) that will narrow an existing AI capability gap by leveraging current technological applications to enhance our warfighters , preserve peace , and , if required , fight to win .', '4 . The purpose of this directive is to establish a scalable A AI TF under U.S . Army Futures Command ( AFC ) consisting of hand selected Army personnel with specific skillsets to lead Army AI efforts and support Do D projects , principally based at Carnegie Mellon University .The end state is an empowered team that rapidly integrates and synchronizes AI activities across the Army enterprise and Do D ’s National Military Initiatives .', '5 . A AI TF leaders and talent have been selected to start work immediately in coordination with JAIC ’s efforts .The A AI TF will establish its footprint in accordance with Carnegie Mellon ’s 90 day occupation plan , formally organize under AFC , develop and then implement an Army AI Strategy , and initiate pilot projects in coordination with S E C R E T AR Y O F T H E A R M Y W A S H I N G T O N ', '', 'SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ', '2 the JAIC ’s National Military Initiatives .We will achieve initial operating capability 30 days from the date of this directive .', 'a . Location .The A AI TF will establish its main operating footprint at Carnegie Mellon ’s National Robotics Engineering Center in Pittsburgh to serve as the executor of JAIC ’s foundation and academic outreach .Smaller footprints , including the A AI TF director , will locate in the National Capital Region .A Pittsburgh location allows the A AI TF to integrate Do D efforts and leverage existing academic grants , knowledge , and experience within Carnegie Mellon .The A AI TF will expand its footprint based on specific project requirements , classification , and sponsoring organizations .', 'b . Relationships to Cross Functional Teams .The A AI TF will collaborate and coordinate with the Cross Functional Teams ( CFTs ) to integrate and advance the Army ’s modernization priorities .The relationship with the CFTs is cross cutting , in the same manner the Position Navigation Timing and Synthetic Training Environment CFTs interact with the other CFTs .', 'c . Personnel .The A AI TF will be manned , with assistance from the Army Talent Management Task Force and U.S . Army Human Resources Command , to ensure proper talent selection within its organization for positions at the Pittsburgh location , in the National Capital Region , and with project teams to meet mission requirements .The Pittsburgh location will consist of six core personnel with talent from across the Army ( Functional Areas 49 , 26 , and 51 ; Career Field 01 ; and General Schedule 1101 and 1102 series personnel ) ; academia ; and industry .Each project team will be led by a project officer ( 01A ) , and the team size will vary based on the project ’s scope .The director , a general officer , and immediate support staff will locate in the National Capital Region .', 'd . Responsibilities .The A AI TF , under the direction of AFC , is responsible for the life cycle of Army AI projects and projects that support the Do D level National Military Initiatives .The A AI TF will develop the Army AI Strategy , which will set the Army ’s AI developmental efforts and projects , AI governance , AI support requirements , and AI talent management .', '6 . This effort will be executed in two phases : Phase I : Establish the A AI TF and Phase II : Manning and Occupation .', 'a . Phase I : Establish the A AI TF .Phase I begins upon publication of this directive .AFC and A AI TF will begin planning and coordination .This phase ends when the Commanding General , AFC gives a back brief of the A AI TF Roadmap to the Under ', '', 'SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ', '3 Secretary of the Army ( USA ) and Vice Chief of Staff , Army ( VCSA ) and the A AI TF is prepared to execute its occupation plan .', 'b . Phase II : Manning and Occupation .Phase II will begin with the USA ’s and VCSA ’s approval of the Strategic Capability Roadmap and A AI TF charter .The AFC and A AI TF will refine requirements as needed .This phase will end when the Commanding General , AFC notifies the USA and VCSA that occupation and integration is complete .', '7 . I direct the following actions : ', 'a . AFC will : ', '( 1 ) draft and staff the A AI TF execution order in conjunction with the Deputy Chief of Staff , G 3/5/7 ; and ', '( 2 ) provide regularly updates to Army senior leaders on the organization charter and execution order .', 'b . The AFC and A AI TF will : ', '( 1 ) identify existing and ongoing machine learning initiatives within the Army , including datasets , timelines , funding , outputs , and transition plans to program of records .', '( 2 ) identify a framework and methodology for implementation of small machine learning projects that can evolve quickly to facilitate larger projects in the future .', '( 3 ) review policies that prohibit or impede machine learning , deep learning , and automation , and coordinate resolution .', '( 4 ) establish an Army AI test bed with appropriate hardware , software , and network access for experimentation , training , deployment , and testing of machine learning capabilities and workflows .', '( 5 ) coordinate , provide updates to , and take direction from the designated A AI TF Director for ongoing machine learning projects within the Army .', '( 6 ) develop a talent management plan for the acquisition and retention of necessary skillsets to support Army machine learning and AI activities today and into the future .', ''];
			const parIdx = 0;
			const minLength = 350;
			const target = new SearchUtility(tmpOpts);
			const actual = target.expandParagraphs(listParagraphs, parIdx, minLength);
			const expected = ['', 'MEMORANDUM FOR SEE DISTRIBUTION ', 'SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center ) ', '1 . References : ', 'a . Memorandum , Deputy Secretary of Defense , June 27 , 2018 , subject : Establishment of the Joint Artificial Intelligence Center .', 'b . 2018 Department of Defense Artificial Intelligence Strategy , June 27 , 2018 .', '2 . The 2018 National Defense Strategy articulates advancements in artificial intelligence ( AI ) that will present strategic opportunities and risks .The Department of Defense ( Do D ) has directed the establishment of the Joint Artificial Intelligence Center ( JAIC ) under the Do D Chief Information Officer .The JAIC serves as the accelerator and synchronizer of Do D AI activities .The Do D Chief Information Officer is seeking partnership with the Military Services as sponsors in three locations : the Pentagon , the National Capital Region , and Pittsburgh , PA .Large scale efforts or clusters of closely related joint urgent challenges will be identified as National Military Initiatives and will be executed in partnership across Do D . These efforts serve as opportunities for synergy among efforts the respective stakeholders may initiate to achieve their statutory responsibilities .', '3 . The Army is establishing the Army AI Task Force ( A AI TF ) that will narrow an existing AI capability gap by leveraging current technological applications to enhance our warfighters , preserve peace , and , if required , fight to win .', '4 . The purpose of this directive is to establish a scalable A AI TF under U.S . Army Futures Command ( AFC ) consisting of hand selected Army personnel with specific skillsets to lead Army AI efforts and support Do D projects , principally based at Carnegie Mellon University .The end state is an empowered team that rapidly integrates and synchronizes AI activities across the Army enterprise and Do D ’s National Military Initiatives .', '5 . A AI TF leaders and talent have been selected to start work immediately in coordination with JAIC ’s efforts .The A AI TF will establish its footprint in accordance with Carnegie Mellon ’s 90 day occupation plan , formally organize under AFC , develop and then implement an Army AI Strategy , and initiate pilot projects in coordination with S E C R E T AR Y O F T H E A R M Y W A S H I N G T O N '];
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#queryOneDocQA', function () {

		it('should take in the filename of an ES result, re-query ES to get the entire doc, and return the result', async () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}},
				dataApi: {
					queryElasticSearch() {
						return Promise.resolve(qaESReturn);
					}
				}
			};

			const target = new SearchUtility(tmpOpts);
			const userId = 'fake user';
			const docId = 'OMBM M-20-29.pdf_0';
			const result = await target.queryOneDocQA(docId, userId);
			const actual = result.body.hits.total;
			const expected = { "value": 1, "relation": 'eq' };
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('#getQAContext', function () {

		it('wrapper function that should take in searchResults, QA parameters, and return context', async () => {
			const tmpOpts = {
				...opts,
				constants: {env: { GAME_CHANGER_OPTS: {allow_daterange: false}}},
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
			const searchResults = {};
			searchResults.sentResults = [];
			const qaSearchText = 'what university does artificial intelligence for the army';
			const qaSearchTextList = ['what', 'university', 'does', 'artificial', 'intelligence', 'for', 'the', 'army'];
			const qaParams = {maxLength: 3000, maxDocContext: 3, maxParaContext: 3, minLength: 350, scoreThreshold: 100};
			const qaQuery = target.phraseQAQuery(qaSearchText, qaSearchTextList, qaParams.maxLength, userId);
			const contextResults = await target.dataLibrary.queryElasticSearch(esClientName, esIndex, qaQuery, userId);
			const results = await target.getQAContext(contextResults, searchResults.sentResults, userId, qaParams);
			const actual = results[0];
			const expected = {"filename": "ARMY 2018-18 ARMY ARTIFICIAL INTELLIGENCE TASK FORCE IN SUPPORT OF THE DEPARTMENT OF DEFENSE JOINT ARTIFICIAL INTELLIGENCE CENTER", "docId": "ARMY DIR 2018-18.pdf_0", "docScore": 93.40025, "docTypeDisplay": "Document", "pubDate": '2018-10-02T00:00:00', "pageCount": 7, "docType": "ARMY", "org": "US Army", "source": 'context search', "parId": 0, "text": "MEMORANDUM FOR SEE DISTRIBUTION  SUBJECT : Army Directive 2018-18 ( Army Artificial Intelligence Task Force in Support of the Department of Defense Joint Artificial Intelligence Center )  1 . References :  a . Memorandum , Deputy Secretary of Defense , June 27 , 2018 , subject : Establishment of the Joint Artificial Intelligence Center . b . 2018 Department of Defense Artificial Intelligence Strategy , June 27 , 2018 . 2 . The 2018 National Defense Strategy articulates advancements in artificial intelligence ( AI ) that will present strategic opportunities and risks .The Department of Defense ( Do D ) has directed the establishment of the Joint Artificial Intelligence Center ( JAIC ) under the Do D Chief Information Officer .The JAIC serves as the accelerator and synchronizer of Do D AI activities .The Do D Chief Information Officer is seeking partnership with the Military Services as sponsors in three locations : the Pentagon , the National Capital Region , and Pittsburgh , PA .Large scale efforts or clusters of closely related joint urgent challenges will be identified as National Military Initiatives and will be executed in partnership across Do D . These efforts serve as opportunities for synergy among efforts the respective stakeholders may initiate to achieve their statutory responsibilities . 3 . The Army is establishing the Army AI Task Force ( A AI TF ) that will narrow an existing AI capability gap by leveraging current technological applications to enhance our warfighters , preserve peace , and , if required , fight to win . 4 . The purpose of this directive is to establish a scalable A AI TF under U.S . Army Futures Command ( AFC ) consisting of hand selected Army personnel with specific skillsets to lead Army AI efforts and support Do D projects , principally based at Carnegie Mellon University .The end state is an empowered team that rapidly integrates and synchronizes AI activities across the Army enterprise and Do D ’s National Military Initiatives . 5 . A AI TF leaders and talent have been selected to start work immediately in coordination with JAIC ’s efforts .The A AI TF will establish its footprint in accordance with Carnegie Mellon ’s 90 day occupation plan , formally organize under AFC , develop and then implement an Army AI Strategy , and initiate pilot projects in coordination with S E C R E T AR Y O F T H E A R M Y W A S H I N G T O N "}
			assert.deepStrictEqual(actual, expected);
		});
	});

});
