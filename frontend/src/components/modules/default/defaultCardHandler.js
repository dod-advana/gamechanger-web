import React from 'react';
import GCTooltip from '../../common/GCToolTip';
import { KeyboardArrowRight } from '@material-ui/icons';
import styled from 'styled-components';
import {
	capitalizeFirst,
	CARD_FONT_SIZE,
	getDocTypeStyles,
	getTrackingNameForFactory,
	getTypeDisplay,
	getTypeIcon,
	getTypeTextColor,
	orgAlias,
	getMetadataForPropertyTable,
	encode,
} from '../../../utils/gamechangerUtils';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import SimpleTable from '../../common/SimpleTable';
import { CardButton } from '../../common/CardButton';
import { trackEvent } from '../../telemetry/Matomo';
import { primary } from '../../../components/common/gc-colors';
import _ from 'lodash';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import sanitizeHtml from 'sanitize-html';

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
		color: '#1E88E5',
		fontWeight: 'normal',
		marginLeft: 5,
	},
	viewMoreButton: {
		fontSize: 16,
		color: '#1E88E5',
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

export const StyledListViewFrontCardContent = styled.div`
	.list-view-button {
		width: 100%;
		height: fit-content;
		margin-top: 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;

		i {
			font-size: ${CARD_FONT_SIZE}px;
			color: rgb(0, 131, 143);
			font-weight: normal;
			margin-left: 5px;
			margin-right: 20px;
		}
	}

	.expanded-hits {
		display: flex;
		height: 100%;

		.page-hits {
			min-width: 100px;
			height: 100%;
			border: 1px solid rgb(189, 189, 189);
			border-top: 0px;

			.page-hit {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-right: 5px;
				padding-left: 5px;
				border-top: 1px solid rgb(189, 189, 189);
				cursor: pointer;
				color: #386f94;

				span {
					font-size: ${CARD_FONT_SIZE}px;
				}

				i {
					font-size: ${CARD_FONT_SIZE}px;
					margin-left: 10px;
				}
			}
		}

		> .expanded-metadata {
			border: 1px solid rgb(189, 189, 189);
			border-left: 0px;
			min-height: 126px;
			width: 100%;

			> blockquote {
				font-size: ${CARD_FONT_SIZE}px;
				line-height: 20px;

				background: #dde1e0;
				margin-bottom: 0;
				height: 165px;
				border-left: 0;
				overflow: hidden;
				font-family: Noto Sans, Arial, Helvetica, sans-serif;
				padding: 0.5em 10px;
				margin-left: 0;
				quotes: '\\201C''\\201D''\\2018''\\2019';

				> em {
					color: white;
					background-color: #e9691d;
					margin-right: 5px;
					padding: 4px;
					font-style: normal;
				}
			}
		}
	}

	.metadata {
		display: flex;
		height: 100%;
		flex-direction: column;
		border-radius: 5px;
		overflow: auto;

		.inner-scroll-container {
			background-color: rgb(238, 241, 242);
			display: block;
			overflow: auto;
			height: 100%;
		}
	}
`;

export const StyledFrontCardHeader = styled.div`
	font-size: 1.2em;
	display: inline-block;
	color: black;
	margin-bottom: 0px;
	background-color: ${({ intelligentSearch }) =>
		intelligentSearch ? '#9BB1C8' : 'white'};
	font-weight: bold;
	font-family: Montserrat;
	height: ${({ listView }) => (listView ? 'fit-content' : '59px')};
	padding: ${({ listView }) => (listView ? '0px' : '5px')};
	margin-left: ${({ listView }) => (listView ? '10px' : '0px')};
	margin-right: ${({ listView }) => (listView ? '10px' : '0px')};

	.title-text-selected-favorite-div {
		max-height: ${({ listView }) => (listView ? '' : '50px')};
		height: ${({ listView }) => (listView ? '35px' : '')};
		overflow: hidden;
		display: flex;
		justify-content: space-between;

		.title-text {
			cursor: pointer;
			display: ${({ docListView }) => (docListView ? 'flex' : '')};
			alignitems: ${({ docListView }) => (docListView ? 'top' : '')};
			height: ${({ docListView }) => (docListView ? 'fit-content' : '')};
			overflow-wrap: ${({listView}) => listView ? '': 'anywhere'};

			.text {
				margin-top: ${({ listView }) => (listView ? '10px' : '0px')};
			}

			.list-view-arrow {
				display: inline-block;
				margin-top: 7px;
			}
		}

		.selected-favorite {
			display: inline-block;
			font-family: 'Noto Sans';
			font-weight: 400;
			font-size: ${CARD_FONT_SIZE}px;
			margin-top: ${({ listView }) => (listView ? '2px' : '0px')};
		}
	}

	.list-view-sub-header {
		font-size: 0.8em;
		display: flex;
		color: black;
		margin-bottom: 0px;
		margin-top: 0px;
		background-color: ${({ intelligentSearch }) =>
		intelligentSearch ? '#9BB1C8' : 'white'};
		font-family: Montserrat;
		height: 24px;
		justify-content: space-between;
	}
`;

export const StyledEntityFrontCardContent = styled.div`
	display: flex;
	height: 100%;
	flex-direction: column;
	align-items: center;
	background-color: ${({ listView }) =>
		listView ? 'transparent' : 'rgb(238, 241, 242)'};

	> img {
		width: 75px;
		margin: 10px;
	}

	> p {
		margin: 10px;
		font-size: 14px;
	}

	> div {
		margin-top: -90px;
	}
`;

export const StyledFrontCardSubHeader = styled.div`
	display: flex;
	position: relative;

	.sub-header-one {
		color: ${({ typeTextColor }) =>
		typeTextColor ? typeTextColor : '#ffffff'};
		background-color: ${({ docTypeColor }) =>
		docTypeColor ? docTypeColor : '#000000'};
		width: 50%;
		padding: 8px;
		display: flex;
		align-items: center;

		img {
			width: 25px;
			margin: 0px 10px 0px 0px;
		}
	}

	.sub-header-two {
		width: 50%;
		color: white;
		padding: 10px 8px 8px;
		background-color: ${({ docOrgColor }) =>
		docOrgColor ? docOrgColor : '#000000'};
	}

	.sub-header-full {
		color: ${({ typeTextColor }) =>
		typeTextColor ? typeTextColor : '#ffffff'};
		background-color: ${({ docTypeColor }) =>
		docTypeColor ? docTypeColor : '#000000'};
		padding: 8px;
		display: flex;
		align-items: center;
		width: 100%;
		img {
			width: 25px;
			margin: 0px 10px 0px 0px;
		}
	}
`;

export const StyledFrontCardContent = styled.div`
	font-family: 'Noto Sans';
	overflow: auto;
	font-size: ${CARD_FONT_SIZE}px;

	.current-as-of-div {
		display: flex;
		justify-content: space-between;

		.current-text {
			margin: 10px 0;
		}
	}

	.hits-container {
		display: flex;
		height: 100%;

		.page-hits {
			min-width: 100px;
			height: 100%;
			border: 1px solid rgb(189, 189, 189);
			border-top: 0px;

			.page-hit {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-right: 5px;
				padding-left: 5px;
				border-top: 1px solid rgb(189, 189, 189);
				cursor: pointer;
				color: #386f94;

				span {
					font-size: ${CARD_FONT_SIZE}px;
				}

				i {
					font-size: ${CARD_FONT_SIZE}px;
					margin-left: 10px;
				}
			}

			> .expanded-metadata {
				border: 1px solid rgb(189, 189, 189);
				border-left: 0px;
				min-height: 126px;
				width: 100%;
				max-width: ${({ isWideCard }) => (isWideCard ? '' : '280px')};

				> blockquote {
					font-size: ${CARD_FONT_SIZE}px;
					line-height: 20px;

					background: #dde1e0;
					margin-bottom: 0;
					height: 165px;
					border-left: 0;
					overflow: hidden;
					font-family: Noto Sans, Arial, Helvetica, sans-serif;
					padding: 0.5em 10px;
					margin-left: 0;
					quotes: '\\201C''\\201D''\\2018''\\2019';

					> em {
						color: white;
						background-color: #e9691d;
						margin-right: 5px;
						padding: 4px;
						font-style: normal;
					}
				}
			}
		}
	}
`;

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

const DefaultCardHandler = {
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
			const { item, state } = props;

			const displayTitle = item.name;

			return (
				<StyledFrontCardHeader
					listView={state.listView}
					docListView={state.listView}
					intelligentSearch={false}
				>
					<div className={'title-text-selected-favorite-div'}>
						<GCTooltip title={displayTitle} placement="top" arrow>
							<div
								className={'title-text'}
								onClick={
									state.listView
										? () =>
											window.open(
												`#/gamechanger-details?type=entity&entityName=${item.name}&cloneName=${state.cloneData.clone_name}`
											)
										: () => {}
								}
							>
								<div className={'text'}>{displayTitle}</div>
								{state.listView && (
									<div className={'list-view-arrow'}>
										<KeyboardArrowRight
											style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }}
										/>
									</div>
								)}
							</div>
						</GCTooltip>
						{/*<div className={'selected-favorite'}>*/}
						{/*	<div style={{display: "flex"}}>*/}
						{/*		{docListView && isRevoked && <RevokedTag>Canceled</RevokedTag>}*/}
						{/*		{checkboxComponent(item.filename, `${type} ${num}`, idx)}*/}
						{/*		{favoriteComponent()}*/}
						{/*	</div>*/}
						{/*</div>*/}
					</div>
					{state.listView && (
						<div className={'list-view-sub-header'}>
							<p> {displayTitle} </p>
						</div>
					)}
				</StyledFrontCardHeader>
			);
		},

		getCardSubHeader: (props) => {
			return <></>;
		},

		getCardFront: (props) => {
			const { item, state } = props;

			if (state.listView) {
				if (item.description?.length > 300) {
					item.description = item?.description?.slice(0, 280) + '...';
				}
			} else if (item.description?.length > 180) {
				item.description = item?.description?.slice(0, 160) + '...';
			}

			return (
				<StyledEntityFrontCardContent listView={state.listView}>
					{!state.listView && <img alt="Office Img" src={item.image} />}
					{!item.done ? (
						<div>
							<LoadingIndicator customColor={'#E9691D'} />
						</div>
					) : (
						<p>{item.description}</p>
					)}
				</StyledEntityFrontCardContent>
			);
		},

		getCardBack: (props) => {
			const { item } = props;

			const metadata = [];

			metadata.push({
				Key: 'Name',
				Value: item.name,
			});
			metadata.push({
				Key: 'Alias',
				Value: item.alias,
			});
			metadata.push({
				Key: 'Type',
				Value: capitalizeFirst(item.type),
			});
			metadata.push({
				Key: 'Category',
				Value: orgAlias[item.category] ?? item.category,
			});
			metadata.push({
				Key: 'Key People',
				Value: item.key_people,
			});
			metadata.push({
				Key: 'Website',
				Value: (
					<a href={item.resource_url} target="_blank" rel="noopener noreferrer">
						{item.resource_url}
					</a>
				),
			});

			return (
				<SimpleTable
					tableClass={'magellan-table'}
					zoom={1}
					headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
					rows={metadata}
					height={'auto'}
					dontScroll={true}
					colWidth={colWidth}
					disableWrap={true}
					title={'Organization Info'}
					hideHeader={false}
				/>
			);
		},

		getFooter: (props) => {
			const {
				name,
				cloneName,
				graphView,
				toggledMore,
				setToggledMore,
				closeGraphCard,
			} = props;

			return (
				<>
					<>
						<CardButton
							target={'_blank'}
							style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
							href={'#'}
							onClick={(e) => {
								trackEvent(
									getTrackingNameForFactory(cloneName),
									'GraphCardInteraction',
									'Open',
									`${name}DetailsPage`
								);
								e.preventDefault();
								window.open(
									`#/gamechanger-details?type=entity&entityName=${name}&cloneName=${cloneName}`
								);
							}}
						>
							Open
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

export default DefaultCardHandler;
