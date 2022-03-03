import React from 'react';
import { trackEvent } from '../../telemetry/Matomo';
import {
	CARD_FONT_SIZE,
	getTrackingNameForFactory,
	getTypeIcon,
	getTypeTextColor,
} from '../../../utils/gamechangerUtils';
// import {
// 	List,
// 	ListItem,
// 	ListItemIcon,
// 	ListItemText,
// 	Divider
// } from "@material-ui/core";

// import GCAccordion from "../../common/GCAccordion";
import { primary } from '../../../components/common/gc-colors';
import { CardButton } from '../../common/CardButton';
import GCTooltip from '../../common/GCToolTip';
// import SimpleTable from "../../common/SimpleTable";
import { KeyboardArrowRight } from '@material-ui/icons';
import styled from 'styled-components';
import _ from 'lodash';
// import {setState} from "../../../utils/sharedFunctions";
// import LoadingIndicator from "@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator";
// import {gcOrange} from "../../common/gc-colors";
// import GameChangerAPI from "../../api/gameChanger-service-api";
import sanitizeHtml from 'sanitize-html';
// const gameChangerAPI = new GameChangerAPI();

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
};

const StyledFrontCardHeader = styled.div`
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
			font-size: 14px;
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

const StyledFrontCardSubHeader = styled.div`
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
`;

const RevokedTag = styled.div`
	font-size: 11px;
	font-weight: 600;
	border: none;
	height: 25px;
	border-radius: 15px;
	background-color: #e50000;
	color: white;
	white-space: nowrap;
	text-align: center;
	display: inline-block;
	padding-left: 15px;
	padding-right: 15px;
	margin-top: 10px;
	margin-bottom: 10px;
`;

const StyledListViewFrontCardContent = styled.div`
	.list-view-button {
		width: 100%;
		height: fit-content;
		margin-top: 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;

		i {
			font-size: ${CARD_FONT_SIZE}px;
			color: #386f94;
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

				background: #eceef1;
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

const StyledFrontCardContent = styled.div`
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

// const clickFn = (filename, cloneName, searchText, pageNumber = 0) => {
// 	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction' , 'PDFOpen');
// 	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'filename', filename);
// 	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'pageNumber', pageNumber);
// 	window.open(`/#/pdfviewer/gamechanger?filename=${encode(filename)}&prevSearchText=${searchText}&pageNumber=${pageNumber}&cloneIndex=${cloneName}`);
// };

const BudgetSearchCardHandler = {
	document: {
		getCardHeader: (props) => {
			const { item, state, graphView } = props;

			const displayTitle = 'budget display title here';
			const isRevoked = item.is_revoked_b;
			const subType = '';
			const displayOrg = '';

			const docListView = state.listView && !graphView;

			return (
				<StyledFrontCardHeader
					listView={state.listView}
					docListView={docListView}
				>
					<div className={'title-text-selected-favorite-div'}>
						<GCTooltip title={displayTitle} placement="top" arrow>
							<div
								className={'title-text'}
								//  onClick={(docListView) ? () => clickFn(item.filename, 0) : () => {}}
								style={{
									width: '100%',
									display: 'flex',
									justifyContent: 'space-between',
									padding: '0 5px 0 0',
								}}
							>
								<div className={'text'} style={{ width: '90%' }}>
									{displayTitle}
								</div>
								{docListView && (
									<div className={'list-view-arrow'}>
										<KeyboardArrowRight
											style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }}
										/>
									</div>
								)}
								{/* {isBaseAward && <img src={AwardIcon}  style={{ width: 19 }} alt="award"/>} */}
							</div>
						</GCTooltip>
						<div className={'selected-favorite'}>
							<div style={{ display: 'flex' }}>
								{docListView && isRevoked && <RevokedTag>Canceled</RevokedTag>}
							</div>
						</div>
					</div>
					{docListView && (
						<div className={'list-view-sub-header'}>
							<p>
								{' '}
								{subType} | {displayOrg}{' '}
							</p>
						</div>
					)}
				</StyledFrontCardHeader>
			);
		},

		getCardSubHeader: (props) => {
			const { item, state, toggledMore } = props;

			const cardType = item.type;
			const iconSrc = getTypeIcon(cardType);
			const subType = 'PDF';
			const typeTextColor = getTypeTextColor(cardType);

			return (
				<>
					{!state.listView && !toggledMore && (
						<StyledFrontCardSubHeader
							typeTextColor={typeTextColor}
							docTypeColor={'#439E86'}
							docOrgColor={'#20009E'}
						>
							<div className={'sub-header-one'}>
								{iconSrc.length > 0 && <img src={iconSrc} alt="type logo" />}
								{subType}
							</div>
							<div className={'sub-header-two'}>{/* EDA */}</div>
						</StyledFrontCardSubHeader>
					)}
				</>
			);
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

			const currentAsOfText = `Page Count: ${item.page_count}`;

			if (state.listView && !intelligentSearch) {
				return (
					<StyledListViewFrontCardContent>
						{item.pageHits && item.pageHits.length > 0 && (
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
						)}
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
														// clickFn(item.filename, page.pageNumber);
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
						<div>
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
						</div>
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
													// clickFn(item.filename, page.pageNumber);
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
						<div className={'currents-as-of-div'}>
							<div className={'current-text'}>{currentAsOfText}</div>
							{item.isRevoked && (
								<GCTooltip
									title={'This version of the document is no longer in effect'}
									placement="top"
									arrow
								>
									<RevokedTag>Canceled</RevokedTag>
								</GCTooltip>
							)}
						</div>
						{item.pageHits.length > 0 && (
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
														//  clickFn(item.filename, page.pageNumber);
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
						)}
					</StyledFrontCardContent>
				);
			}
		},

		getCardBack: (props) => {
			// const {
			// 	item,
			// 	state,
			// 	dispatch,
			// 	detailPage = false
			// } = props;

			return (
				<div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
					Back
					{/* <SimpleTable tableClass={'magellan-table'}
                        zoom={1}
                        headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
                        rows={getEDAMetadataForPropertyTable(EDA_FIELD_JSON_MAP, fields, item)}
                        height={'auto'}
                        dontScroll={true}
                        colWidth={colWidth}
                        disableWrap={true}
                        title={'Metadata'}
                        hideHeader={true}
                        margin={item.award_id_eda_ext && item.award_id_eda_ext !== "empty" && !detailPage ? '-10px 0 0 0' : ''}
                    /> */}
				</div>
			);
		},

		getFooter: (props) => {
			const {
				toggledMore,
				graphView,
				cloneName,
				setToggledMore = () => {},
				closeGraphCard = () => {},
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
								// clickFn(filename, cloneName);
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
						<GCTooltip
							title={'Click here to view the contract award details page'}
						>
							<CardButton
								style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
								href={'#'}
								disabled={true}
							>
								Contract
							</CardButton>
						</GCTooltip>
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

export default BudgetSearchCardHandler;
