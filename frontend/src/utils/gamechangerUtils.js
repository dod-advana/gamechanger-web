import _ from 'underscore';
import DocumentIcon from '../images/icon/Document.png';
import OrganizationIcon from '../images/icon/Organization.png';
import { trackEvent } from '../components/telemetry/Matomo';
import Config from '../config/config.js';
import { useEffect } from 'react';
import styled from 'styled-components';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import { setState } from './sharedFunctions';

export const RESULTS_PER_PAGE = 18;

export const RECENT_SEARCH_LIMIT = 6;

export const CARD_FONT_SIZE = 12;

export const NO_RESULTS_MESSAGE = 'No results found! Please try refining your search.';

export const orgAlias = {
	OSD: 'Office of the Secretary of Defense',
	JS: 'Joint Staff',
	IC: 'Intelligence Community',
	POTUS: 'Office of the President of the United States',
	LEG: 'Congress',
	FED: 'Federal Agencies',
	Army: 'Army',
	Navy: 'Navy',
	'Air Force': 'Air Force',
	'Marine Corps': 'Marine Corps',
	'Space Force': 'Space Force',
};

export const PAGE_DISPLAYED = {
	main: 'main',
	userDashboard: 'userDashboard',
	dataTracker: 'dataTracker',
	analystTools: 'analystTools',
	aboutUs: 'aboutUs',
	faq: 'faq',
	searchFavorites: 'searchFavorites',
	profile: 'profile',
};

export const SEARCH_TYPES = {
	sentence: 'Sentence',
	simple: 'Simple',
	keyword: 'Keyword',
	contextual: 'Intelligent',
};

const processRow = (row) => {
	let finalVal = '';
	for (let j = 0; j < row.length; j++) {
		let innerValue = row[j] === null ? '' : row[j].toString();
		if (row[j] instanceof Date) {
			innerValue = row[j].toLocaleString();
		}
		let result = innerValue.replace(/"/g, '""');
		if (result.search(/\("|,|\n\)/g) >= 0) result = '"' + result + '"';
		if (j > 0) finalVal += ',';
		finalVal += result;
	}
	return finalVal + '\n';
};

//https://stackoverflow.com/a/24922761
export const exportToCsv = (filename, data, isJson = false) => {
	const getRowsForExport = (rows, columns) => {
		const vals = [columns];
		return vals.concat(
			_.map(rows, (row) => {
				const newRow = [];
				_.each(row, (value, key) => {
					const idx = _.indexOf(columns, key);
					if (columns.includes(key)) newRow[idx] = value;
				});
				return newRow;
			})
		);
	};

	let tmpRows = [];
	if (isJson) tmpRows = getRowsForExport(data, _.keys(data[0]));
	else tmpRows = data;

	let csvFile = '';
	tmpRows.forEach((row) => {
		csvFile += processRow(row);
	});

	const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
	if (navigator.msSaveBlob) {
		// IE 10+
		navigator.msSaveBlob(blob, filename);
	} else {
		const link = document.createElement('a');
		if (link.download !== undefined) {
			// feature detection
			// Browsers that support HTML5 download attribute
			const url = URL.createObjectURL(blob);
			link.setAttribute('href', url);
			link.setAttribute('download', filename);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
};

export const orgFilters = {
	'Dept. of Defense': false,
	'Joint Chiefs of Staff': false,
	'Intelligence Community': false,
	'United States Code': false,
	'Executive Branch': false,
	'Dept. of the Air Force': false,
	'US Army': false,
	'US Marine Corps': false,
	'US Navy': false,
	'US Navy Reserve': false,
	'US Navy Medicine': false,
	'Classification Guides': false,
	FMR: false,
	NATO: false,
	Legislation: false,
};

export const PAGE_BORDER_RADIUS = 5;

export const StyledCenterContainer = styled.div`
	width: unset;
    margin: 0px 15px
    padding: 0px;
    align-items: left;
    
    .sidebar-section-title {
		font-family: "Noto Sans";
		font-size: 22px;
		font-weight: bold;
		color: rgb(19, 30, 67);
		padding-top: 10px;
		padding-left:10px;
    }
    
    .top-container {
    	display: flex;
			flex-direction: column;
			justify-content: flex-end;
    	margin: 0 0 0 15px;
    }
    
    .results-count-view-buttons-container {
		display: flex;
		justify-content: right;
		margin: 20px 0;
			
		 & .view-buttons-container {
			margin-top: -14px;
			display: flex;
		}
	}
    
   
    
    .left-container {
    	width: ${({ showSideFilters }) => (showSideFilters ? '20%' : '0%')};
		margin-top: 0px;
		float: left;
		padding: 0px;
		
		.side-bar-container {
			width: 100%;
			
			.filters-container {
				padding-bottom: 12px;
			}
		}
    }
    
    .right-container {
    	margin-left: ${({ showSideFilters }) => (showSideFilters ? '22%' : '0%')};
		margin-top: 0px;
		width: ${({ showSideFilters }) => (showSideFilters ? '78%' : '100%')};
		padding: 0px;
		box-shadow: none;

		.card-container {
			height: 100%;
			overflow: hidden;
			margin-top: -10px;
			margin-right: -6px;
			margin-left: -4px;
		}
    }
`;

export const scrollToContentTop = () => {
	document
		.getElementById('game-changer-content-top')
		.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
};

export const capitalizeFirst = (text) => {
	return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getTrackingNameForFactory = (cloneName) => {
	return `GAMECHANGER_${cloneName}`;
};

export const getCloneTitleForFactory = (cloneData, upperCase) => {
	return upperCase ? cloneData.clone_name.toUpperCase() : cloneData.clone_name;
};

// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = (fun) => useEffect(fun, []);

export const typeFilters = {
	Documents: false,
	Legislations: false,
	Memorandums: false,
	Titles: false,
	Orders: false,
	Instructions: false,
	Manuals: false,
	Directives: false,
};

export const getReferenceListMetadataPropertyTable = (ref_list = []) => {
	let parsedList = ref_list.map((ref) => {
		return ref.url ? `<a target="_blank" href="${ref.url}">${ref.name}</a>` : ref;
	});
	if (parsedList.length === 1) {
		parsedList = parsedList[0].split(', ');
	}
	const trimmed = _.chain(parsedList)
		.map((x) => x.trim())
		.chunk(4)
		.value();
	return _.map(trimmed, (x) => {
		let y = {};
		x.forEach((element, index) => {
			switch (index) {
				case 1:
					y[' '] = element;
					break;
				case 2:
					y['  '] = element;
					break;
				case 3:
					y['   '] = element;
					break;
				default:
					y['References'] = element;
					break;
			}
		});
		return y;
	});
};

export const getMetadataForPropertyTable = (item) => {
	let data = [];
	let dataKeys = [
		{ name: 'search_mode', keyLabel: 'Search Mode' },
		{ name: 'title', keyLabel: 'Title' },
		{ name: 'filename', keyLabel: 'Filename' },
		//{ name: 'summary_30', keyLabel: 'Summary (BETA)' },
		{ name: 'keyw_5', keyLabel: 'Keywords' },
		{ name: 'page_count', keyLabel: 'Page Count' },
		{ name: 'type', keyLabel: 'Entity Type' },
		{ name: 'doc_type', keyLabel: 'Document Type' },
		{ name: 'doc_num', keyLabel: 'Document Number' },
		{ name: 'pageHitCount', keyLabel: 'Page Matches' },
		{ name: 'matchCount', keyLabel: 'Total Matches' },
		{ name: 'top_entities_t', keyLabel: 'Entities' },

		//{ name: 'ref_list', keyLabel: 'references', valueFunction: (val) => _.first(val) },
	];

	if (Config.GAMECHANGER.SHOW_TOPICS) {
		dataKeys.push({ name: 'topics_s', keyLabel: 'Topics' });
	}
	_.each(dataKeys, (dataKey) => {
		let oldKey = dataKey.name;
		let newKey = oldKey;
		if (dataKey.keyLabel) newKey = dataKey.keyLabel;
		let value = item[oldKey];
		if (dataKey.valueFunction) value = dataKey.valueFunction(value);
		if (value) data.push({ Key: newKey, Value: value });
	});
	return data;
};

const getPublicationDate = (item) => {
	if (item.publication_date_dt !== undefined && item.publication_date_dt !== '') {
		const currentDate = new Date(item.publication_date_dt);
		const year = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(currentDate);
		const month = new Intl.DateTimeFormat('en', {
			month: '2-digit',
		}).format(currentDate);
		const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
		return `${month}-${day}-${year}`;
	} else {
		return `unknown`;
	}
};

export const policyMetadata = (item) => {
	const labelText = item.isRevoked ? 'Cancel Date' : 'Verification Date';
	let dateText = 'Unknown';
	if (item.current_as_of !== undefined && item.current_as_of !== '') {
		const currentDate = new Date(item.current_as_of);
		const year = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(currentDate);
		const month = new Intl.DateTimeFormat('en', {
			month: '2-digit',
		}).format(currentDate);
		const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
		dateText = `${month}-${day}-${year}`;
	}

	let publicationDate = getPublicationDate(item);

	let source_item;
	if (
		item.source_fqdn_s !== undefined &&
		item.source_fqdn_s !== '' &&
		item.crawler_used_s !== undefined &&
		item.crawler_used_s !== ''
	) {
		let source_name;
		if (item.source_fqdn_s.startsWith('https://')) {
			source_name = item.source;
		} else {
			source_name = `https://${item.source_fqdn_s}`;
		}
		source_item = (
			<a href={source_name} target="_blank" rel="noopener noreferrer">
				{crawlerMappingFunc(item.crawler_used_s)}
			</a>
		);
	} else {
		source_item = 'unknown';
	}

	let file_origin_item;
	if (item.source_page_url_s !== undefined && item.source_page_url_s !== '') {
		file_origin_item = (
			<a href={item.source_page_url_s} target="_blank" rel="noopener noreferrer">
				{' '}
				Go to Source{' '}
			</a>
		);
	} else {
		file_origin_item = 'unknown';
	}

	let source_file_item;
	if (item.download_url_s !== undefined && item.download_url_s !== '') {
		source_file_item = (
			<a href={item.download_url_s} target="_blank" rel="noopener noreferrer">
				{' '}
				Open from Source
			</a>
		);
	} else {
		source_file_item = 'unknown';
	}

	return [
		{ Key: 'Published', Value: publicationDate },
		{ Key: labelText, Value: dateText },
		{ Key: 'Source', Value: source_item },
		{ Key: 'File Origin', Value: file_origin_item },
		{ Key: 'Source File', Value: source_file_item },
	];
};

export function commaThousands(value) {
	if (_.isNull(value) || _.isUndefined(value)) return '';

	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const getCurrentView = (view, list) => {
	if (view === 'Card' && list) {
		return 'List';
	} else if (view === 'Card') {
		return 'Grid';
	} else {
		return view;
	}
};

//https://stackoverflow.com/a/2901298
export function numberWithCommas(x) {
	if (!x) return x;
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const crawlerMapping = {
	dod_issuances: ['WHS DoD Directives Division', 'Dept. of Defense'],
	army_pubs: ['Army Publishing Directorate', 'Dept. of the Army', 'US Army'],
	jcs_pubs: ['Joint Chiefs of Staff Library', 'CJCS Directives Library', 'Joint Chiefs of Staff'],
	// leaving in case these exist or added back
	//jcs_manual_uploads: ['Joint Chiefs of Staff'],
	//dod_manual_uploads: ['Dept. of Defense'],
	//army_manual_uploads: ['US Army'],
	ic_policies: ['Director of National Intelligence', 'Office Of Director Of National Intelligence'],
	us_code: ['Office of Law Revision Counsel'],
	ex_orders: ['Federal Register', 'Executive Office of The President'],
	opm_pubs: ['OMB Publication'],
	air_force_pubs: ['Dept. of the Air Force E-Publishing'],
	marine_pubs: ['Marine Corps Publications Electronic Library'],
	secnav_pubs: ['Dept. of the Navy Issuances'],
	navy_reserves: ['U.S. Navy Reserve Publications', 'U.S. Navy Reserve'],
	navy_med_pubs: ['Navy Medicine Directives', 'Navy Medicine'],
	Bupers_Crawler: ['Bureau of Naval Personnel Instructions', 'Mynavy Hr'],
	milpersman_crawler: ['Navy Personnel Command Instructions'],
	nato_stanag: ['NATO Publications', 'NATO Standardization Office'],
	fmr_pubs: [
		'DoD Financial Management Regulation',
		'Under Secretary Of Defense (comptroller)',
		'Defense Publications',
	],
	legislation_pubs: ['Congressional Legislation', 'U.S. Government Publishing Office'],
	Army_Reserve: ['U.S. Army Reserve Publications'],
	Memo: ['OSD Executive Secretary'],
	dha_pubs: ['Military Health System'],
	jumbo_FAR: ['Federal Acquisition Regulation', 'Acquisition Publications'],
	jumbo_DFAR: ['Defense Federal Acquisition Regulation'],
	National_Guard: [
		'National Guard Bureau Publications Library',
		'National Guard Bureau Publications & Forms Library',
		'National Guard Bureau Publications',
	],
	Coast_Guard: ['US Coast Guard Directives', 'Coast Guard Deputy Commandant For Mission Support'],
	dfar_subpart_regs: ['Defense Federal Acquisition Regulation'],
	far_subpart_regs: ['Federal Acquisition Regulation'],
	Chief_National_Guard_Bureau_Instructions: ['National Guard Bureau Instructions'],
	code_of_federal_regulations: ['Federal Accounting Standards Advisory Board'],
};
export const invertedCrawlerMappingFunc = (item) => {
	let crawler = '';
	for (let key in crawlerMapping) {
		if (crawlerMapping[key].map((name) => name.toLowerCase()).includes(item.toLowerCase())) {
			crawler = key;
			break;
		}
	}

	return crawler;
};

export const crawlerMappingFunc = (item) => {
	return crawlerMapping[item] ? crawlerMapping[item].join(', ') : item;
};

export const orgColorMap = {
	'Dept. of Defense': '#636363', // gray
	'Joint Chiefs of Staff': '#330066', // purple
	'Intelligence Community': '#ff4000', // orange
	'United States Code': '#490E67', // purple
	'US Army': '#4b5320', // army green
	'US Navy': '#282053', // navy blue
	'Dept. of the Air Force': '#00308f', // sky blue
	'US Marine Corps': '#990000', // marine red
	'SCG Army': '#4b5320', // army green
	'SCG Navy': '#282053', // navy blue
	'SCG Air Force': '#00308f', // sky blue
	'SCG Marine Corps': '#990000', // marine red
	'Uncategorized ': '#964B00', // brown
	'Executive Branch': '#204b53', // turqoise
	Congress: '#ffbf00', // bright yellow
	'Space Force': '#000000', // black
	NATO: '#003bd1', // blue
	'Financial Mgmt. Reg': '#636363',
	Legislation: '#ffbf00',
};

const linkColorMap = {
	belongs_to: '#B8860B', // mustard yellow
	references: '#808080', // gray
};

export const typeColorMap = {
	document: '#386F94',
	organization: '#386f94',
	topic: '#ffbf00',
	uknDocument: '#000000',
};

const typeTextColorMap = {
	Document: 'white',
	Publication: 'white',
	Organization: 'white',
};

const typeIconMap = {
	Document: DocumentIcon,
	Organization: OrganizationIcon,
};

// mainly for determining AB tests
export const hashCode = (value) => {
	let hash = 0;
	if (value.length === 0) {
		return hash;
	}

	for (let i = 0; i < value.length; i++) {
		let char = value.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}

	return hash;
};

export const getOrgToOrgQuery = (allOrgsSelected, orgTypes) => {
	if (allOrgsSelected) {
		return [];
	} else {
		let query = [];
		for (let org in orgTypes) {
			if (orgTypes[org]) {
				query.push(org);
			}
		}
		return query;
	}
};

export const getTypeQuery = (allTypesSelected, types) => {
	if (allTypesSelected) {
		return [];
	} else {
		let query = [];
		for (let type in types) {
			if (types[type]) {
				query.push(type);
			}
		}
		return query;
	}
};

export const getTypeDisplay = (docType = '') => {
	if (docType.length > 0 && docType[0] === '$') {
		return docType.substring(1);
	}
	return docType;
};

export const getDocTypeStyles = (docType, docOrg) => {
	if (!docType) {
		return { docTypeColor: '', docOrg: '', docOrgColor: '' };
	}

	const docTypeColor = typeColorMap['document'];

	docOrg = docOrg ?? 'GOV';

	let docOrgColor;
	if (docOrg === 'Classif.') {
		docOrgColor = orgColorMap[docType] ?? '#964B00'; // brown
	} else {
		docOrgColor = orgColorMap[docOrg] ?? '#964B00'; // brown
	}

	return { docTypeColor, docOrg, docOrgColor };
};

export const getTypeIcon = (type) => {
	return typeIconMap[type] ?? DocumentIcon;
};

// either in orgColorMap, or brown
export const getOrgColor = (org) => {
	return orgColorMap[org] ?? '#964B00'; // brown
};

// either in typeColorMap, or document gray
export const getTypeColor = (type) => {
	return typeColorMap[type] ?? '#D1D1D1';
};

export const getTypeTextColor = (type) => {
	return typeTextColorMap[type] ?? 'white';
};

export const getDocLinkTypeStyles = (linkType) => {
	const type = linkType.toLowerCase();
	return linkColorMap[type] ?? '#808080'; // gray
};

export const convertHexToRgbA = (hexVal, alpha) => {
	let ret;

	// If the hex value is valid.
	if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hexVal)) {
		// Getting the content after '#',
		// eg. 'ffffff' in case of '#ffffff'
		ret = hexVal.slice(1);

		// Splitting each character
		ret = ret.split('');

		// Checking if the length is 3
		// then make that 6
		if (ret.length === 3) {
			const ar = [];
			ar.push(ret[0]);
			ar.push(ret[0]);
			ar.push(ret[1]);
			ar.push(ret[1]);
			ar.push(ret[2]);
			ar.push(ret[2]);
			ret = ar;
		}

		// Starts with '0x'(in hexadecimal)
		ret = '0x' + ret.join('');

		// Converting the first 2 characters
		// from hexadecimal to r value
		const r = (ret >> 16) & 255;

		// Converting the second 2 characters
		// to hexadecimal to g value
		const g = (ret >> 8) & 255;

		// Converting the last 2 characters
		// to hexadecimal to b value
		const b = ret & 255;

		// Appending all of them to make
		// the RGBA value
		return `rgba(${[r, g, b].join(',')}, ${alpha})`;
	}
};

export const getLinkColor = (link, alpha) => {
	return convertHexToRgbA(getDocLinkTypeStyles(link.label), alpha);
};

// Darken or lighten colors
// https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
export const shadeColor = (col, amt) => {
	let usePound = false;

	if (col[0] === '#') {
		col = col.slice(1);
		usePound = true;
	}

	let R = parseInt(col.substring(0, 2), 16);
	let G = parseInt(col.substring(2, 4), 16);
	let B = parseInt(col.substring(4, 6), 16);

	// to make the colour less bright than the input
	// change the following three "+" symbols to "-"
	R = R + amt;
	G = G + amt;
	B = B + amt;

	if (R > 255) R = 255;
	else if (R < 0) R = 0;

	if (G > 255) G = 255;
	else if (G < 0) G = 0;

	if (B > 255) B = 255;
	else if (B < 0) B = 0;

	const RR = R.toString(16).length === 1 ? '0' + R.toString(16) : R.toString(16);
	const GG = G.toString(16).length === 1 ? '0' + G.toString(16) : G.toString(16);
	const BB = B.toString(16).length === 1 ? '0' + B.toString(16) : B.toString(16);

	return (usePound ? '#' : '') + RR + GG + BB;
};

export const handlePdfOnLoad = (iframeID, elementID, filename, category, cloneName, gameChangerAPI) => {
	let isScrolling, start, end, distance;

	const iframe = document.getElementById(iframeID);
	const iframeDoc = iframe?.contentWindow?.document;

	if (!iframeDoc) return;

	const element = iframeDoc.getElementById(elementID);

	if (element === null) {
		setTimeout(handlePdfOnLoad, 500);
	} else {
		element.onscroll = function () {
			if (!start) {
				start = element.scrollTop;
			}

			clearTimeout(isScrolling);

			isScrolling = setTimeout(function () {
				end = element.scrollTop;
				distance = end - start;

				distance = distance / (element.getBoundingClientRect().height - element.scrollHeight + 62);

				handleOnScroll(distance, filename, category);

				start = null;
				end = null;
				distance = null;
			}, 120);
		};
		element.addEventListener('mouseup', function () {
			const win = iframe.contentWindow;
			const doc = win.document;
			let text;

			if (win.getSelection) {
				text = win.getSelection().toString();
			} else if (doc.selection && doc.selection.createRange) {
				text = doc.selection.createRange().text;
			}
			if (text !== '') {
				trackEvent(getTrackingNameForFactory(cloneName), 'Highlight', filename);
				gameChangerAPI.sendIntelligentSearchFeedback('intelligent_search_highlight_text', filename, text);
			}
		});
	}
};

const handleOnScroll = (distance, filename, category) => {
	if (filename) {
		trackEvent(category, distance > 0 ? 'onScrollUp' : 'onScrollDown', filename, distance);
	}
};

export const setFilterVariables = (object, url) => {
	let urlValues = url.split('_');
	for (const key in object) {
		object[key] = urlValues.indexOf(key) !== -1;
	}
};

export const formatDate = (dateObj, separator) => {
	const year = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(dateObj);
	const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(dateObj);
	const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(dateObj);

	return `${month}${separator}${day}${separator}${year}`;
};

export const getQueryVariable = (name, url) => {
	if (!url) url = window.location.href;
	const params = new URLSearchParams(url.split('?')[1] || '');
	return params.get(name);
};

export const decodeTinyUrl = (url) => {
	const returnData = {};
	returnData.searchType = getQueryVariable('searchType', url);
	returnData.offset = getQueryVariable('offset', url);
	returnData.tabName = getQueryVariable('tabName', url);
	returnData.isRevoked = getQueryVariable('revoked', url) === 'true';

	const orgURL = getQueryVariable('orgFilter', url);
	const typeURL = getQueryVariable('typeFilter', url);
	const pubDateURL = getQueryVariable('pubDate', url);

	returnData.orgFilterObject = Object.assign({}, orgFilters);
	returnData.typeFilterObject = Object.assign({}, typeFilters);

	if (orgURL) {
		setFilterVariables(returnData.orgFilterObject, orgURL);
	}
	if (typeURL) {
		setFilterVariables(returnData.typeFilterObject, typeURL);
	}

	let orgFilterText = '';
	Object.keys(returnData.orgFilterObject).forEach((key) => {
		if (returnData.orgFilterObject[key]) {
			orgFilterText += `${key}, `;
		}
	});
	orgFilterText = orgFilterText.slice(0, orgFilterText.length - 2);
	if (orgFilterText === '') {
		orgFilterText = 'All sources';
	}
	returnData.orgFilterText = orgFilterText;

	let typeFilterText = '';
	Object.keys(returnData.typeFilterObject).forEach((key) => {
		if (returnData.typeFilterObject[key]) {
			typeFilterText += `${key}, `;
		}
	});
	typeFilterText = typeFilterText.slice(0, typeFilterText.length - 2);
	if (typeFilterText === '') {
		typeFilterText = 'All types';
	}
	returnData.typeFilterText = typeFilterText;

	if (Object.values(SEARCH_TYPES).indexOf(returnData.searchType) === -1) {
		returnData.searchType = 'Keyword';
	}

	if (isNaN(returnData.offset)) {
		returnData.offset = 0;
	}

	returnData.resultsPage = Math.floor(returnData.offset / RESULTS_PER_PAGE) + 1;
	returnData.useSemanticSearch = returnData.searchType === SEARCH_TYPES.semantic;
	returnData.pubDate = '';

	if (!pubDateURL || pubDateURL.indexOf('_') === -1) {
		returnData.pubDate = 'All';
	} else {
		try {
			const dates = pubDateURL.split('_');
			const start = new Date(parseInt(dates[0]));
			const end = new Date(parseInt(dates[1]));

			returnData.pubDate = `${formatDate(start, '/')} - ${formatDate(end, '/')}`;
		} catch (err) {
			console.log(err);
		}
	}

	return returnData;
};

export const encode = (filename) => {
	const encodings = {
		'+': '%2B',
		'!': '%21',
		'"': '%22',
		'#': '%23',
		$: '%24',
		'&': '%26',
		"'": '%27',
		//'(': '%28',
		//')': '%29',
		'*': '%2A',
		//',': '%2C',
		':': '%3A',
		';': '%3B',
		'=': '%3D',
		'?': '%3F',
		'@': '%40',
		//' ': '%20'
	};

	return filename.replace(/([+!"#$&'*:;=?@])/gim, (match) => encodings[match]);
};

export const exactMatch = (phrase, word, split) => {
	const wordList = phrase.trim().split(split);
	let exists = false;
	wordList.forEach((w) => {
		if (w.toLowerCase() === word.toLowerCase()) {
			exists = true;
		}
	});
	return exists;
};

export const displayBackendError = (resp, dispatch = () => Function.prototype) => {
	if (resp?.data?.error) {
		const errorMessage = Permissions.permissionValidator('Gamechanger Super Admin', true)
			? `An error occurred with ${resp.data.error.category}. Error code ${resp.data.error.code}`
			: `An error has occurred in the application, but we are working to fix it!`;
		setState(dispatch, {
			showBackendError: true,
			backendErrorMsg: errorMessage,
		});
	}
};

export const convertDCTScoreToText = (score) => {
	if (score >= 0.85) {
		return 'High';
	} else if (score >= 0.75 && score < 0.85) {
		return 'Medium';
	} else if (score >= 0.65 && score < 0.75) {
		return 'Low';
	} else {
		return 'No Match';
	}
};
