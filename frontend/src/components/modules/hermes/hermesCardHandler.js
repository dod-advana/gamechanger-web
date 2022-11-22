import React, { useEffect } from 'react';
import GCTooltip from '../../common/GCToolTip';
import { KeyboardArrowRight } from '@material-ui/icons';
import {
	capitalizeFirst,
	CARD_FONT_SIZE,
	getTrackingNameForFactory,
	getTypeDisplay,
} from '../../../utils/gamechangerUtils';
import SimpleTable from '../../common/SimpleTable';
import { CardButton } from '../../common/CardButton';
import { primary } from '../../common/gc-colors';
import { trackEvent, trackFlipCardEvent } from '../../telemetry/Matomo';
import sanitizeHtml from 'sanitize-html';
import {
	getDefaultComponent,
	styles,
	colWidth,
	StyledFrontCardHeader,
	StyledFrontCardSubHeader,
	makeRows,
} from '../default/defaultCardHandler';

const auxDisplayBackFields = [
	'precedence',
	'Sensitivity',
	'Importance',
	'DTG',
	'originator',
	'receiver',
	'Subject',
	'Body',
];
const auxDisplayTitleField = 'Subject';
const auxDisplayFrontFields = ['originator', 'receiver', 'Subject', 'Body'];
const auxDisplayFieldJSONMap = {
	Subject: 'Subject',
	Body: 'Body: ',
	from_address: 'From Address',
	from_name: 'From: ',
	from_type: 'From Type',
	to_address: 'To Address',
	to_name: 'To: ',
	to_type: 'To Type',
	cc_address: 'CC Address',
	cc_name: 'CC Name',
	cc_type: 'CC Type',
	importance: 'Importance',
	sensitivity: 'Sensitivity',
	categories: 'Categories',
	billing_information: 'Billing Info',
	originator: 'Originator',
	receiver: 'Receiver',
};
const auxDisplayLeftSubtitleText = 'precedence';
const auxDisplayRightSubtitleField = 'DTG';

const clickFn = (body) => {
	let data = `<pre> ${body} </pre>`;
	let myWindow = window.open('data:text/html,', '_blank', '');
	myWindow.document.write(data);
	myWindow.focus();
};

const renderHighlights = (highlights, hoveredHit, setHoveredHit) => {
	const fontSize = 12;
	const highlightList = [];

	let firstHighlight = {
		first: true,
		highlight: '',
		text: '',
	};

	for (const field in highlights) {
		const highlight = highlights[field];
		let label = 1;
		for (const text of highlight) {
			const highlightLabel = `${field} ${label}`;
			if (firstHighlight.first) {
				firstHighlight.first = false;
				firstHighlight.highlight = highlightLabel;
				firstHighlight.text = text;
			}
			highlightList.push(
				<>
					<div
						key={highlightLabel}
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							paddingRight: '5px',
							paddingLeft: '5px',
							borderTop: '1px solid rgb(189, 189, 189)',
							cursor: 'pointer',
							color: '#386F94',
							backgroundColor: 'white',
							...(hoveredHit === highlightLabel && {
								backgroundColor: '#E9691D',
								color: 'white',
							}),
						}}
						onMouseEnter={() => {
							setHoveredHit(highlightLabel);
						}}
					>
						<span style={{ fontSize }}>{`${capitalizeFirst(field)} ${label++}`}</span>
						<i className="fa fa-chevron-right" style={{ marginLeft: 10, fontSize, color: 'white' }} />
					</div>
				</>
			);
		}
	}
	if (hoveredHit === 0) {
		setHoveredHit(firstHighlight.highlight);
	}

	return highlightList;
};

const getDisplayTitle = (item) => {
	return `${item[auxDisplayTitleField]}`;
};

const cardHandler = {
	document: {
		getDisplayTitle: (item) => {
			return getDisplayTitle(item);
		},

		getCardHeader: (props) => {
			const { state, item, graphView } = props;

			const title = getDisplayTitle(item);
			// $ to indicate use text as is
			let type = item[auxDisplayLeftSubtitleText];
			let org = `$${capitalizeFirst(auxDisplayRightSubtitleField)}: ${item[auxDisplayRightSubtitleField]}`;

			type = `$${capitalizeFirst(auxDisplayLeftSubtitleText)}: ${type}`;

			const docListView = state.listView && !graphView;

			return (
				<StyledFrontCardHeader listView={state.listView} docListView={docListView} intelligentSearch={false}>
					<div className={'title-text-selected-favorite-div'}>
						<GCTooltip title={title} placement="top" arrow>
							<div
								className={'title-text'}
								onClick={docListView ? () => clickFn(item.body) : () => Function.prototype}
							>
								<div className={'text'}>{title}</div>
								{docListView && (
									<div className={'list-view-arrow'}>
										<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }} />
									</div>
								)}
							</div>
						</GCTooltip>
					</div>
					{docListView && (
						<div className={'list-view-sub-header'}>
							<p>
								{' '}
								{getTypeDisplay(type.toLowerCase())} | {getTypeDisplay(org)}{' '}
							</p>
						</div>
					)}
				</StyledFrontCardHeader>
			);
		},

		getCardSubHeader: (props) => {
			const { item, state, toggledMore } = props;

			// $ to indicate use text as is
			let type = item[auxDisplayLeftSubtitleText];
			let org = `$${capitalizeFirst(auxDisplayRightSubtitleField)}: ${item[auxDisplayRightSubtitleField]}`;
			let typeColor = 'black';

			if (type === 'Z') {
				typeColor = '#BD0000';
			} else if (type === 'O') {
				typeColor = '#ff8d00';
			} else if (type === 'P') {
				typeColor = '#c9c600';
			} else if (type === 'R') {
				typeColor = 'forestgreen';
			}

			type = `$${capitalizeFirst(auxDisplayLeftSubtitleText)}: ${type}`;

			const orgColor = '#9BB1C8';

			return (
				<>
					{!state.listView && !toggledMore && (
						<StyledFrontCardSubHeader
							typeTextColor={'white'}
							docTypeColor={typeColor}
							docOrgColor={orgColor}
						>
							<div className={'sub-header-one'}>{getTypeDisplay(type)}</div>
							<div className={'sub-header-two'}>{getTypeDisplay(org)}</div>
						</StyledFrontCardSubHeader>
					)}
				</>
			);
		},

		getCardFront: (props) => {
			const { item, hoveredHit, setHoveredHit } = props;

			let hoveredSnippet = '';
			if (hoveredHit) {
				const sliceIndex = hoveredHit.match(/\d+$/).index;
				const type = hoveredHit.slice(0, sliceIndex).trim();
				const index = hoveredHit.slice(sliceIndex) - 1;
				hoveredSnippet = item.highlight[type][index];
			}
			const highlightText = hoveredSnippet;

			let displayNameMap;
			if (auxDisplayFieldJSONMap) {
				try {
					displayNameMap = auxDisplayFieldJSONMap;
				} catch (e) {
					console.log(e);
				}
			}

			const frontItems = makeRows(auxDisplayFrontFields, item, displayNameMap, false);

			return (
				<div style={styles.bodyContainer}>
					{frontItems}
					{item && item.highlight && (
						<div style={{ display: 'flex', height: '100%', margin: '5px 0 0 0' }}>
							<div
								style={{
									minWidth: 100,
									height: 190,
									border: '1px solid rgb(189, 189, 189)',
									borderTop: 0,
									overflow: 'scroll',
								}}
							>
								{renderHighlights(item.highlight, hoveredHit, setHoveredHit)}
							</div>
							<div
								style={{
									height: 150,
									border: '1px solid rgb(189, 189, 189)',
									borderLeft: 0,
									width: '100%',
								}}
							>
								<blockquote
									className="searchdemo-blockquote"
									dangerouslySetInnerHTML={{
										__html: sanitizeHtml(highlightText),
									}}
								></blockquote>
							</div>
						</div>
					)}
				</div>
			);
		},

		getCardBack: (props) => {
			const { item } = props;

			let displayNameMap;
			if (auxDisplayFieldJSONMap) {
				try {
					displayNameMap = auxDisplayFieldJSONMap;
				} catch (e) {
					console.log(e);
				}
			}

			const backItemsTable = makeRows(auxDisplayBackFields, item, displayNameMap, true);

			return (
				<SimpleTable
					tableClass={'magellan-table'}
					zoom={1}
					headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
					rows={backItemsTable}
					height={'auto'}
					dontScroll={true}
					colWidth={colWidth}
					disableWrap={true}
					title={'Metadata'}
					hideHeader={false}
				/>
			);
		},

		getFooter: (props) => {
			const { item, cloneName, toggledMore, setToggledMore } = props;

			return (
				<>
					<CardButton
						target={'_blank'}
						style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
						href={'#'}
						onClick={(e) => {
							e.preventDefault();
							clickFn(item.Body);
						}}
					>
						Open
					</CardButton>
					<div
						style={{ ...styles.viewMoreButton, color: primary }}
						onClick={() => {
							trackFlipCardEvent(getTrackingNameForFactory(cloneName), toggledMore);
							setToggledMore(!toggledMore);
						}}
					>
						{toggledMore ? 'Overview' : 'More'}
						<i
							style={{ ...styles.viewMoreChevron, color: primary }}
							className="fa fa-chevron-right"
							aria-hidden="true"
						/>
					</div>
				</>
			);
		},

		getCardExtras: (_props) => {
			return <></>;
		},

		getFilename: (_item) => {
			return '';
		},
	},
};

const HermesCardHandler = (props) => {
	const { setFilename, setDisplayTitle, item, cardType } = props;

	useEffect(() => {
		setFilename(cardHandler[cardType].getFilename(item));
		setDisplayTitle(cardHandler[cardType].getDisplayTitle(item));
	}, [cardType, item, setDisplayTitle, setFilename]);

	return <>{getDefaultComponent(props, cardHandler)}</>;
};

export default HermesCardHandler;
