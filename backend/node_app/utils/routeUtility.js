// A Mapping of all the orgs to the docs
const ORGDOCMAP = {
	'Dept. of Defense': ['DoD', 'DoDM', 'DoDI', 'DoDD', 'DEP', 'SEC', 'AI', 'DTM'],
	'Joint Chiefs of Staff': ['CJCS', 'CJCSI', 'CJCSM', 'CJCSG'],
	'Intelligence Community': ['ICD', 'ICPG', 'ICPM'],
	'United States Code': ['Title'],
	'Executive Branch': ['EO'],
	'Classification Guides': ['(SCG Army)', '(SCG Navy)'],
	OPM: ['OMBM'],
	'Legislation':[
		'h.con. res',
		'h.j. res.',
		'hr.r.',
		'h. res',
		's.',
		's. con. res',
		's.j. res.',
		's. res.'
	],
	'Dept. of the Air Force': [
		'AFI',
		'AFMAN',
		'CFETP',
		'QTP',
		'AFPD',
		'AFTTP',
		'AFH',
		'HAFMD',
		'AFPAM',
		'AFMD',
		'HOI',
		'AFVA',
		'AFJQS',
		'AFJI',
		'AFGM',
		'DAFI',
		'AFJMAN',
		'DAFPD',
		'AFM',
		'AFPM',
		'(AF MISC)'
	],
	'US Army': [
		'AGO',
		'TB',
		'AR',
		'TM',
		'STP',
		'ARMY',
		'ATP',
		'DA',
		'PAM',
		'TC',
		'HQDA',
		'FM',
		'GTA',
		'JTA',
		'CTA',
		'ATTP',
		'ADP'
	],
	'US Marine Corps': [
		'(MC MISC)',
		'MCO',
		'DCG',
		'NAVMC',
		'MCRP',
		'MCTP',
		'(MCO P)',
		'MCWP',
		'FMFRP',
		'IRM',
		'MCBUL',
		'MCDP',
		'SECNAVINST',
		'MCIP',
		'SECNAV',
		'(NAVMC DIR)',
		'UM',
		'(DA PAM)',
		'NAVSUP',
		'MANUAL',
		'FMFM',
		'(DA FORM)',
		'JAGINST'
	],
	'US Navy': [
		'OPNAVNOTE',
		'SECNAVNOTE',
		'OPNAVINST',
		'SECNAVINST'
	],
	'US Navy Reserve': [
		'COMNAVRESFORCOMINST',
		'COMNAVRESFORCOMNOTE',
		'RESPERSMAN'
	],
	'US Navy Medicine': [
		'NAVMED',
		'BUMEDNOTE',
		'BUMEDINST'
	]
};
// Set ORGFILTER based on the keys from ORGDOCMAP
const ORGFILTER = {};
for (let key in ORGDOCMAP){
	ORGFILTER[key] = false;
}

/**
 * @method getOrgOptions
 * @returns a String of all the Orgs separated by _
 */
function getOrgOptions(){
	let orgList = Object.keys(ORGFILTER).join('_');
	return orgList;
}
/**
 * @method getOrgToDocQuery
 * @param {Object} orgTypes - dictionary with all the departments as keys and a boolean value if they should be included.
 * @param {Boolean} allOrgsSelected - if all the organizations should be selected.
 * @returns a String of all the Docs to query.
 */
function getOrgToDocQuery(orgTypes, allOrgsSelected){
	if (allOrgsSelected) {
		return '*';
	} else {
		let docTypeList = [];
		Object.keys(orgTypes).forEach(org => {
			if (orgTypes[org]){
				docTypeList = docTypeList.concat(ORGDOCMAP[org]);
			}
		});
		return docTypeList.join(' OR ');
	}
}

module.exports = { ORGFILTER, getOrgOptions, getOrgToDocQuery };
