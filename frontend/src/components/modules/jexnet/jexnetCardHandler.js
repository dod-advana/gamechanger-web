import React from 'react';
import GCTooltip from '../../common/GCToolTip';
import { KeyboardArrowRight } from '@material-ui/icons';
import {
	CARD_FONT_SIZE,
	getDocTypeStyles,
	getTrackingNameForFactory,
	getTypeDisplay,
	getTypeIcon,
	getTypeTextColor,
	getMetadataForPropertyTable,
	encode,
} from '../../../utils/gamechangerUtils';
import {
	StyledFrontCardContent,
	StyledFrontCardHeader,
	StyledFrontCardSubHeader,
	StyledListViewFrontCardContent
} from '../default/defaultCardHandler';
import SimpleTable from '../../common/SimpleTable';
import { CardButton } from '../../common/CardButton';
import { trackEvent } from '../../telemetry/Matomo';
import { primary } from '../../../components/common/gc-colors';
import _ from 'lodash';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import sanitizeHtml from 'sanitize-html';
import config from '../../../config/config';

const colWidth = {
	maxWidth: '900px',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const styles = {
	footerButtonBack: {
		margin: '0 10px 0 0 ',
		padding: '8px 12px',
	},
	viewMoreChevron: {
		fontSize: 14,
		color: primary,
		fontWeight: 'normal',
		marginLeft: 5,
	},
	viewMoreButton: {
		fontSize: 16,
		color: primary,
		fontWeight: 'bold',
		cursor: 'pointer',
		minWidth: 60,
	},
	collectionContainer: {
		margin: '1em',
		overflow: 'auto',
	},
	bodyImg: {
		width: 75,
		margin: '10px',
	},
	bodyText: {
		margin: '10px',
		fontSize: '14px',
	},
};

const getCardHeaderHandler = ({
	item,
	state,
	idx,
	checkboxComponent,
	favoriteComponent,
	graphView,
	intelligentSearch,
}) => {
	const displayTitle = getDisplayTitle(item);
	// const isRevoked = item.is_revoked_b;

	const docListView = state.listView && !graphView;

	const displayOrg = item['display_org_s']
		? item['display_org_s']
		: 'Uncategorized';
	const displayType = item['display_doc_type_s']
		? item['display_doc_type_s']
		: 'Document';

	return (
		<StyledFrontCardHeader
			listView={state.listView}
			docListView={docListView}
			intelligentSearch={intelligentSearch}
		>
			<div className={'title-text-selected-favorite-div'}>
				<GCTooltip title={displayTitle} placement="top" arrow>
					<div
						className={'title-text'}
						onClick={
							docListView
								? () =>
									clickFn(
										item.filename,
										state.cloneData.clone_name,
										state.searchText,
										0
									)
								: () => {}
						}
					>
						<div className={'text'}>{displayTitle}</div>
						{docListView && (
							<div className={'list-view-arrow'}>
								<KeyboardArrowRight
									style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }}
								/>
							</div>
						)}
					</div>
				</GCTooltip>
				{/* // export and favoriting not currently working for default
					<div className={'selected-favorite'}>
					<div style={{display: "flex"}}>
						{checkboxComponent(item.filename, item.display_title_s ?? item.title, idx)}
						{favoriteComponent()}
					</div>
				</div> */}
			</div>
			{docListView && (
				<div className={'list-view-sub-header'}>
					<p>
						{' '}
						{displayType} | {displayOrg}{' '}
					</p>
				</div>
			)}
		</StyledFrontCardHeader>
	);
};

const getCardSubHeaderHandler = ({ item, state, toggledMore }) => {
	const cardType = item.type;
	const iconSrc = getTypeIcon(cardType);
	const typeTextColor = getTypeTextColor(cardType);

	const displayOrg = item['display_org_s']
		? item['display_org_s']
		: 'Uncategorized';
	const displayType = item['display_doc_type_s']
		? item['display_doc_type_s']
		: 'Document';

	let { docTypeColor, docOrgColor } = getDocTypeStyles(displayType, displayOrg);

	return (
		<>
			{!state.listView && !toggledMore && (
				<StyledFrontCardSubHeader
					typeTextColor={typeTextColor}
					docTypeColor={docTypeColor}
					docOrgColor={docOrgColor}
				>
					<div className={'sub-header-one'}>
						{iconSrc.length > 0 && <img src={iconSrc} alt="type logo" />}
						{displayType}
					</div>
					<div className={'sub-header-two'}>
						{item.display_org_s
							? item.display_org_s
							: getTypeDisplay(displayOrg)}
					</div>
				</StyledFrontCardSubHeader>
			)}
		</>
	);
};

const getDisplayTitle = (item) => {
	return item.title;
};

const clickFn = (filename, cloneName, searchText, pageNumber = 0) => {
	trackEvent(
		getTrackingNameForFactory(cloneName),
		'CardInteraction',
		'PDFOpen'
	);
	trackEvent(
		getTrackingNameForFactory(cloneName),
		'CardInteraction',
		'filename',
		filename
	);
	trackEvent(
		getTrackingNameForFactory(cloneName),
		'CardInteraction',
		'pageNumber',
		pageNumber
	);
	window.open(
		`/#/pdfviewer/gamechanger?filename=${encode(
			filename
		)}&prevSearchText=${searchText.replace(
			/"/gi,
			''
		)}&pageNumber=${pageNumber}&cloneIndex=${cloneName}`
	);
};

const Row = ({ label, value, minWidth = 'inherit' }) => {
	return (
		<div style={styles.row}>
			<div style={{ fontWeight: 'bold', minWidth }}>{label}</div>
			<div style={{ marginLeft: '12px', flex: 1 }}>{value}</div>
		</div>
	);
};

const makeRows = (
	fieldsArr = [],
	itemWithValues = {},
	displayNameMap,
	forTable = false
) => {
	const rows = [];
	for (const fieldName of fieldsArr) {
		let cleanFieldName = fieldName.replace(/_1|_2/g, '');
		const displayName = displayNameMap?.[fieldName] ?? fieldName;
		let value = itemWithValues[cleanFieldName] ?? 'Unknown';
		if (Array.isArray(value)) {
			value = value.join(', ');
		}

		if (cleanFieldName === 'body') {
			let splitValue = value.split('-----');
			value = splitValue[splitValue.length - 1];
		}

		// shorten text longer than x length
		if (value.length > 230) {
			value = value.substring(0, 230) + '...';
		}

		if (value) {
			if (forTable) {
				const row = {};
				row['Key'] = displayName.replace(/:/g, '');
				row['Value'] = value;
				rows.push(row);
			} else {
				rows.push(
					<Row
						key={cleanFieldName}
						label={displayName}
						value={value}
						minWidth={40}
					/>
				);
			}
		}
	}

	return rows;
};

const JexnetCardHandler = {
	document: {
		getDisplayTitle: (item) => {
			return getDisplayTitle(item);
		},
		getCardHeader: (props) => {
			return getCardHeaderHandler(props);
		},

		getCardSubHeader: (props) => {
			return getCardSubHeaderHandler(props);
		},

		getCardFront: (props) => {
			const {
				item,
				state,
				backBody,
				hitsExpanded,
				setHitsExpanded,
				hoveredHit,
				setHoveredHit,
				metadataExpanded,
				setMetadataExpanded,
				intelligentSearch,
				intelligentFeedbackComponent,
			} = props;

			let hoveredSnippet = '';
			if (Array.isArray(item.pageHits) && item.pageHits[hoveredHit]) {
				hoveredSnippet = item.pageHits[hoveredHit]?.snippet ?? '';
			}
			const contextHtml = hoveredSnippet;
			const isWideCard = true;

			if (state.listView && !intelligentSearch) {
				return (
					<StyledListViewFrontCardContent>
						<button
							type="button"
							className={'list-view-button'}
							onClick={() => {
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'ListViewInteraction',
									!hitsExpanded ? 'Expand hit pages' : 'Collapse hit pages'
								);
								setHitsExpanded(!hitsExpanded);
							}}
						>
							<span className="buttonText">Page Hits</span>
							<i
								className={
									hitsExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'
								}
								aria-hidden="true"
							/>
						</button>
						{hitsExpanded && (
							<div className={'expanded-hits'}>
								<div className={'page-hits'}>
									{_.chain(item.pageHits)
										.map((page, key) => {
											return (
												<div
													className={'page-hit'}
													key={key}
													style={{
														...(hoveredHit === key && {
															backgroundColor: '#E9691D',
															color: 'white',
														}),
													}}
													onMouseEnter={() => setHoveredHit(key)}
													onClick={(e) => {
														e.preventDefault();
														clickFn(
															item.filename,
															state.cloneData.clone_name,
															state.searchText,
															page.pageNumber
														);
													}}
												>
													<span>
														{page.pageNumber === 0
															? 'ID'
															: `Page ${page.pageNumber}`}
													</span>
													<i
														className="fa fa-chevron-right"
														style={{
															color:
																hoveredHit === key
																	? 'white'
																	: 'rgb(189, 189, 189)',
														}}
													/>
												</div>
											);
										})
										.value()}
								</div>
								<div className={'expanded-metadata'}>
									<blockquote
										dangerouslySetInnerHTML={{
											__html: sanitizeHtml(contextHtml),
										}}
									/>
								</div>
							</div>
						)}
						<button
							type="button"
							className={'list-view-button'}
							onClick={() => {
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'ListViewInteraction',
									!metadataExpanded ? 'Expand metadata' : 'Collapse metadata'
								);
								setMetadataExpanded(!metadataExpanded);
							}}
						>
							<span className="buttonText">Document Metadata</span>
							<i
								className={
									metadataExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'
								}
								aria-hidden="true"
							/>
						</button>
						{metadataExpanded && (
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>{backBody}</div>
							</div>
						)}
					</StyledListViewFrontCardContent>
				);
			} else if (state.listView && intelligentSearch) {
				return (
					<StyledListViewFrontCardContent>
						<div className={'expanded-hits'}>
							<div className={'page-hits'}>
								{_.chain(item.pageHits)
									.map((page, key) => {
										return (
											<div
												className={'page-hit'}
												key={key}
												style={{
													...(hoveredHit === key && {
														backgroundColor: '#E9691D',
														color: 'white',
													}),
												}}
												onMouseEnter={() => setHoveredHit(key)}
												onClick={(e) => {
													e.preventDefault();
													clickFn(
														item.filename,
														state.cloneData.clone_name,
														state.searchText,
														page.pageNumber
													);
												}}
											>
												<span>
													{page.pageNumber === 0
														? 'ID'
														: `Page ${page.pageNumber}`}
												</span>
												<i
													className="fa fa-chevron-right"
													style={{
														color:
															hoveredHit === key
																? 'white'
																: 'rgb(189, 189, 189)',
													}}
												/>
											</div>
										);
									})
									.value()}
							</div>
							<div className={'expanded-metadata'}>
								<blockquote
									dangerouslySetInnerHTML={{
										__html: sanitizeHtml(contextHtml),
									}}
								/>
							</div>
						</div>
						<button
							type="button"
							className={'list-view-button'}
							onClick={() => {
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'ListViewInteraction',
									!metadataExpanded ? 'Expand metadata' : 'Collapse metadata'
								);
								setMetadataExpanded(!metadataExpanded);
							}}
						>
							<span className="buttonText">Document Metadata</span>
							<i
								className={
									metadataExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'
								}
								aria-hidden="true"
							/>
						</button>

						{metadataExpanded && (
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>{backBody}</div>
							</div>
						)}

						<div style={{ marginTop: '10px', marginBottom: '10px' }}>
							{' '}
							{intelligentFeedbackComponent()}{' '}
						</div>
					</StyledListViewFrontCardContent>
				);
			} else {
				return (
					<StyledFrontCardContent
						className={`tutorial-step-${state.componentStepNumbers['Highlight Keyword']}`}
						isWideCard={isWideCard}
					>
						<div className={'hits-container'}>
							<div className={'page-hits'}>
								{_.chain(item.pageHits)
									.map((page, key) => {
										return (
											<div
												className={'page-hit'}
												key={key}
												style={{
													...(hoveredHit === key && {
														backgroundColor: '#E9691D',
														color: 'white',
													}),
												}}
												onMouseEnter={() => setHoveredHit(key)}
												onClick={(e) => {
													e.preventDefault();
													clickFn(
														item.filename,
														state.cloneData.clone_name,
														state.searchText,
														page.pageNumber
													);
												}}
											>
												<span>
													{page.pageNumber === 0
														? 'ID'
														: `Page ${page.pageNumber}`}
												</span>
												<i
													className="fa fa-chevron-right"
													style={{
														color:
															hoveredHit === key
																? 'white'
																: 'rgb(189, 189, 189)',
													}}
												/>
											</div>
										);
									})
									.value()}
							</div>
							<div className={'expanded-metadata'}>
								<blockquote
									className="searchdemo-blockquote"
									dangerouslySetInnerHTML={{
										__html: sanitizeHtml(contextHtml),
									}}
								/>
							</div>
						</div>
					</StyledFrontCardContent>
				);
			}
		},

		getCardBack: (props) => {
			const { item } = props;
			const metadata = getMetadataForPropertyTable(item);

			const fields = metadata.map((d) => d.Key);
			const displayItem = Object.fromEntries(
				metadata.map((d) => [d.Key, d.Value])
			);

			const backItemsTable = makeRows(fields, displayItem, null, true);

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
			const {
				filename,
				cloneName,
				graphView,
				toggledMore,
				setToggledMore,
				closeGraphCard,
				showEsDoc,
				searchText,
			} = props;
			return (
				<>
					<>
						<CardButton
							target={'_blank'}
							style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
							href={'#'}
							onClick={(e) => {
								e.preventDefault();
								clickFn(filename, cloneName, searchText, 0);
							}}
						>
							Open
						</CardButton>
						<CardButton
							target={'_blank'}
							style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
							href={'#'}
							onClick={(e) => {
								e.preventDefault();
								window.open(`${config.JEXNET_LINK}file?name=${filename}`);
							}}
						>
							Go to Jexnet
						</CardButton>
						{graphView && (
							<CardButton
								style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
								href={'#'}
								onClick={(e) => {
									trackEvent(
										getTrackingNameForFactory(cloneName),
										'CardInteraction',
										'Close Graph Card'
									);
									e.preventDefault();
									closeGraphCard();
								}}
							>
								Close
							</CardButton>
						)}
						{toggledMore && Permissions.isGameChangerAdmin() && (
							<CardButton
								style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
								href={'#'}
								onClick={(e) => {
									e.preventDefault();
									showEsDoc();
								}}
							>
								<i className="fa fa-code" />
							</CardButton>
						)}
					</>
					<div
						style={{ ...styles.viewMoreButton }}
						onClick={() => {
							trackEvent(
								getTrackingNameForFactory(cloneName),
								'CardInteraction',
								'flipCard',
								toggledMore ? 'Overview' : 'More'
							);
							setToggledMore(!toggledMore);
						}}
					>
						{toggledMore ? 'Overview' : 'More'}
						<i
							style={styles.viewMoreChevron}
							className="fa fa-chevron-right"
							aria-hidden="true"
						/>
					</div>
				</>
			);
		},

		getCardExtras: (props) => {
			return <></>;
		},

		getFilename: (item) => {
			return item.filename;
		},
	},

	publication: {
		getCardHeader: (props) => {
			return <></>;
		},

		getCardSubHeader: (props) => {
			return <></>;
		},

		getCardFront: (props) => {
			return <></>;
		},

		getCardBack: (props) => {
			return <></>;
		},

		getFooter: (props) => {
			return <></>;
		},

		getCardExtras: (props) => {
			return <></>;
		},

		getFilename: (item) => {
			return '';
		},
	},

	entity: {
		getCardHeader: (props) => {
			return <></>;
		},

		getCardSubHeader: (props) => {
			return <></>;
		},

		getCardFront: (props) => {
			return <></>;
		},

		getCardBack: (props) => {
			return <></>;
		},

		getFooter: (props) => {
			return <></>;
		},

		getCardExtras: (props) => {
			return <></>;
		},

		getFilename: (item) => {
			return '';
		},
	},

	topic: {
		getCardHeader: (props) => {
			return <></>;
		},

		getCardSubHeader: (props) => {
			return <></>;
		},

		getCardFront: (props) => {
			return <></>;
		},

		getCardBack: (props) => {
			return <></>;
		},

		getFooter: (props) => {
			return <></>;
		},

		getCardExtras: (props) => {
			return <></>;
		},

		getFilename: (item) => {
			return '';
		},
	},
};

export default JexnetCardHandler;
