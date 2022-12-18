import React, { useEffect } from 'react';
import GCTooltip from '../../common/GCToolTip';
import { KeyboardArrowRight } from '@material-ui/icons';
import { capitalizeFirst, getTrackingNameForFactory, getTypeDisplay } from '../../../utils/gamechangerUtils';
import SimpleTable from '../../common/SimpleTable';
import { primary } from '../../common/gc-colors';
import { trackFlipCardEvent } from '../../telemetry/Matomo';
import sanitizeHtml from 'sanitize-html';
import {
	getDefaultComponent,
	colWidth,
	styles,
	StyledFrontCardHeader,
	StyledFrontCardSubHeader,
	makeRows,
} from '../default/defaultCardHandler';

const auxDisplayBackFields = [
	'PresentationID',
	'Status',
	'PresentationStatusDesc',
	'PresentationTitle',
	'PresentationMethodDesc',
	'AuthorID',
	'AuthorFullName',
	'AuthorEmail',
	'Classification',
];
const auxDisplayTitleField = 'PresentationTitle';
const auxDisplayFieldJSONMap = {
	PresentationID: 'Presentation ID',
	Status: 'Status',
	PresentationStatusDesc: 'Presentation Status',
	PresentationTitle: 'Presentation Title',
	PresentationMethodDesc: 'Presentation Method',
	AuthorID: 'Author ID',
	AuthorFullName: 'Author Name',
	AuthorEmail: 'Author Email',
	Classification: 'Classification',
};
const auxDisplayLeftSubtitleText = 'AuthorFullName';
const auxDisplayRightSubtitleField = 'Classification';

const renderHighlights = (text, hoveredHit, setHoveredHit, setHighlightText) => {
	const fontSize = 12;
	const highlightList = [];

	let firstHighlight = {
		first: true,
		highlight: '',
		text: '',
	};

	const highlightLabel = `Abstract`;
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
					setHighlightText(text);
				}}
			>
				<span style={{ fontSize }}>{highlightLabel}</span>
				<i className="fa fa-chevron-right" style={{ marginLeft: 10, fontSize, color: 'white' }} />
			</div>
		</>
	);

	if (hoveredHit === 0) {
		setHoveredHit(firstHighlight.highlight);
		setHighlightText(firstHighlight.text);
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

			type = `Author: ${type}`;

			const docListView = state.listView && !graphView;

			return (
				<StyledFrontCardHeader listView={state.listView} docListView={docListView} intelligentSearch={false}>
					<div className={'title-text-selected-favorite-div'}>
						<GCTooltip title={title} placement="top" arrow>
							<div
								className={'title-text'}
								// onClick={docListView ? () => clickFn(item.body) : () => {}}
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

			type = `Author: ${type}`;

			const orgColor = '#4B5777';

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
			const { item } = props;

			let hoveredHit = 0;
			const setHoveredHit = (hit) => {
				hoveredHit = hit;
			};

			let highlightText = 'Highlight missing';
			const setHighlightText = (text) => {
				highlightText = text;
			};

			return (
				<div style={styles.bodyContainer}>
					{item?.['Abstract Text'] && (
						<div style={{ display: 'flex', height: '100%', margin: '5px 0 0 0' }}>
							<div
								style={{
									minWidth: 100,
									border: '1px solid rgb(189, 189, 189)',
									borderTop: 0,
								}}
							>
								{renderHighlights(item['Abstract Text'], hoveredHit, setHoveredHit, setHighlightText)}
							</div>
							<div
								style={{
									border: '1px solid rgb(189, 189, 189)',
									borderLeft: 0,
									maxWidth: props?.state?.listView ? '100%' : '72%',
									width: '100%',
								}}
							>
								<blockquote
									className="searchdemo-blockquote"
									style={{ height: '100%', overflowY: 'scroll', wordWrap: 'break-word' }}
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
			const { cloneName, toggledMore, setToggledMore } = props;

			return (
				<>
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

const CDOCardHandler = (props) => {
	const { setFilename, setDisplayTitle, item, cardType } = props;

	useEffect(() => {
		setFilename(cardHandler[cardType].getFilename(item));
		setDisplayTitle(cardHandler[cardType].getDisplayTitle(item));
	}, [cardType, item, setDisplayTitle, setFilename]);

	return <>{getDefaultComponent(props, cardHandler)}</>;
};

export default CDOCardHandler;
