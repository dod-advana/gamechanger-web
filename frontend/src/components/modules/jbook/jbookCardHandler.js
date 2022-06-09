import React, { useEffect } from 'react';
import { trackEvent } from '../../telemetry/Matomo';
import { CARD_FONT_SIZE, getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import { primary } from '../../common/gc-colors';
import { CardButton } from '../../common/CardButton';
import GCTooltip from '../../common/GCToolTip';
import SimpleTable from '../../common/SimpleTable';
import { getClassLabel, getConvertedType } from '../../../utils/jbookUtilities';
import { KeyboardArrowRight } from '@material-ui/icons';
import _ from 'lodash';
import styled from 'styled-components';
import sanitizeHtml from 'sanitize-html';
import {
	getDefaultComponent,
	styles,
	colWidth,
	StyledFrontCardSubHeader,
	StyledListViewFrontCardContent,
	RevokedTag,
} from '../default/defaultCardHandler';

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

		.expanded-metadata {
			width: 100%;
		}

		.page-hits {
			min-width: 160px;
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

const StyledFrontCardHeader = styled.div`
	font-size: 1.2em;
	display: inline-block;
	color: black;
	margin-bottom: 0px;
	background-color: ${({ intelligentSearch }) => (intelligentSearch ? '#9BB1C8' : 'white')};
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

			.text {
				margin-top: ${({ listView }) => (listView ? '10px' : '0px')};
				-webkit-line-clamp: 2;
				display: -webkit-box;
				-webkit-box-orient: vertical;
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
		background-color: ${({ intelligentSearch }) => (intelligentSearch ? '#9BB1C8' : 'white')};
		font-family: Montserrat;
		height: 24px;
		justify-content: space-between;
	}
`;

const StyledPill = styled.div`
	padding: 0px 9px 1px;
	border-radius: 15px;
	background-color: white;
	color: black;
	white-space: nowrap;
	text-align: center;
	display: inline-block;
	margin-left: 6px;
	margin-right: 6px;
	margin-bottom: 3px;
	border: 1px solid rgb(209, 215, 220);
	cursor: default !important;
	> i {
		margin-left: 3px;
		color: #e9691d;
	}
`;

const types = {
	pdoc: 'Procurement',
	rdoc: 'RDT&E',
	odoc: 'O&M',
};

const clickFn = (cloneName, searchText, item, portfolioName) => {
	const { budgetType, appropriationNumber, id, budgetYear } = item;

	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'LineItemOpen');
	let url = `#/jbook/profile?type=${encodeURIComponent(
		types[budgetType]
	)}&searchText=${searchText}&id=${id}&appropriationNumber=${appropriationNumber}&portfolioName=${portfolioName}&budgetYear=${budgetYear}`;
	window.open(url);
};

const cardHandler = {
	document: {
		getCardHeader: (props) => {
			const { item, state, graphView } = props;

			const { cloneData, searchText, selectedPortfolio } = state;

			let displayTitleTop = '';
			let displayTitleBot = ''; // item.projectTitle;
			switch (item.budgetType) {
				case 'odoc':
				case 'pdoc':
					displayTitleTop = `BLI: ${item.budgetLineItem ?? ''} | Title: ${item.projectTitle}`;
					break;
				case 'rdoc':
					displayTitleTop = `PE Num: ${item.programElement ?? ''} | Title: ${item.projectTitle}`;
					break;
				default:
					break;
			}

			const isRevoked = item.is_revoked_b;

			const cardType = item.budgetType ? getConvertedType(item.budgetType) : '';
			const agency = item.serviceAgency;

			const docListView = state.listView && !graphView;

			return (
				<StyledFrontCardHeader listView={state.listView} docListView={docListView}>
					<div className={'title-text-selected-favorite-div'}>
						<GCTooltip title={displayTitleTop} placement="top" arrow>
							<div
								className={'title-text'}
								onClick={
									docListView
										? (e) => {
												e.preventDefault();
												clickFn(cloneData.cloneName, searchText, item, selectedPortfolio);
										  }
										: () => {}
								}
								style={{
									width: '100%',
									display: 'flex',
									justifyContent: 'space-between',
									padding: '0 5px 0 0',
								}}
							>
								<div className={'text'} style={{ width: '90%' }}>
									{displayTitleTop} <br /> {displayTitleBot}
								</div>
								{docListView && (
									<div className={'list-view-arrow'}>
										<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }} />
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
								{cardType} | {agency}{' '}
							</p>
						</div>
					)}
				</StyledFrontCardHeader>
			);
		},

		getCardSubHeader: (props) => {
			const { item, state, toggledMore } = props;

			let appropriationTitle, budgetPrefix, budgetAmount;
			try {
				appropriationTitle = item.appropriationTitle
					? item.appropriationTitle.replace('Procurement', 'Proc')
					: '';

				if (item.budgetType === 'odoc') {
					appropriationTitle = item.accountTitle;
				}

				budgetPrefix = '';
				let year = item.budgetYear ? item.budgetYear.slice(2) : '';
				let cycle = item.budgetCycle ?? 'PB';
				budgetPrefix = cycle + year + (item.currentYearAmount ? ': ' : '');

				budgetAmount = item.currentYearAmount ? item.currentYearAmount + ' $M' : '';
			} catch (e) {
				console.log('Error setting card subheader');
				console.log(e);
			}

			return (
				<>
					{!state.listView && !toggledMore && (
						<StyledFrontCardSubHeader
							typeTextColor={'white'}
							docTypeColor={'#386F94'}
							docOrgColor={'#636363'}
						>
							<div className={'sub-header-one'}>{appropriationTitle}</div>
							<div className={'sub-header-two'}>{budgetPrefix + budgetAmount}</div>
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

			const review =
				item.reviews && item.reviews[state.selectedPortfolio] ? item.reviews[state.selectedPortfolio] : {};

			try {
				const renderContracts = (contracts) => {
					let contractElements = `<b>Contracts: ${contracts.length}</b>`;

					for (let i = 0; i < contracts.length && i < 5; i++) {
						const contract = contracts[i];
						contractElements += `<br/><p>- ${contract}</p>`;
					}

					return contractElements;
				};

				const renderAccomplishments = (accomplishments) => {
					let accomplishmentElements = `<b>Accomplishments: ${accomplishments.length}</b>`;

					for (let i = 0; i < accomplishments.length && i < 5; i++) {
						const accomplishment = accomplishments[i];
						accomplishmentElements += `<br/><p>- ${accomplishment}</p>`;
					}

					return accomplishmentElements;
				};

				const renderPortfolioTags = (tags) => {
					let tagElements = [];

					try {
						if (tags && tags.length) {
							for (const tag of tags) {
								tagElements.push(<StyledPill>{tag}</StyledPill>);
							}
						}
					} catch (err) {
						console.log('Error rendering portfolio tags');
						console.log(err);
					}

					return tagElements;
				};

				// render the hover menu and options
				if (
					!state.searchText ||
					state.searchText === null ||
					state.searchText === '' ||
					!item.pageHits ||
					item.pageHits.length <= 0
				) {
					item.pageHits = [
						{
							title: 'Project Description',
							snippet: _.truncate(item.projectMissionDescription, { length: 150 }),
						},
						{
							title: 'Contracts',
							snippet: _.truncate(item.contracts ? renderContracts(item.contracts) : 'No Contracts', {
								length: 180,
							}),
						},
						{
							title: 'Accomplishments',
							snippet: _.truncate(
								item.accomplishments
									? renderAccomplishments(item.accomplishments)
									: 'No Accomplishments',
								{ length: 200 }
							),
						},
					];
				}

				let hoveredSnippet = '';
				if (Array.isArray(item.pageHits) && item.pageHits[hoveredHit]) {
					hoveredSnippet = item.pageHits[hoveredHit]?.snippet ?? '';
				}
				const contextHtml = hoveredSnippet;
				const isWideCard = true;

				if (state.listView && !intelligentSearch) {
					return (
						<StyledListViewFrontCardContent expandedDataBackground={'#eceef1'}>
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
									<span className="buttonText">Details</span>
									<i
										className={hitsExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'}
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
														<span>{page.title && <span>{page.title}</span>}</span>
														<i
															className="fa fa-chevron-right"
															style={{
																color:
																	hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
															}}
														/>
													</div>
												);
											})
											.value()}
									</div>
									<div className={'expanded-metadata'}>
										<blockquote dangerouslySetInnerHTML={{ __html: sanitizeHtml(contextHtml) }} />
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
										className={metadataExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'}
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
						<StyledListViewFrontCardContent expandedDataBackground={'#eceef1'}>
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
													<span>{page.title && <span>{page.title}</span>}</span>
													<i
														className="fa fa-chevron-right"
														style={{
															color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
														}}
													/>
												</div>
											);
										})
										.value()}
								</div>
								<div className={'expanded-metadata'}>
									<blockquote dangerouslySetInnerHTML={{ __html: sanitizeHtml(contextHtml) }} />
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
									className={metadataExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'}
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
						<StyledFrontCardContent className={`tutorial-step-highlight-keyword`} isWideCard={isWideCard}>
							<div className={'currents-as-of-div'}>
								<div className={'current-text'}>{/*currentAsOfText*/}</div>
							</div>
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
														// clickFn(
														// 	item.filename,
														// 	state.cloneData.clone_name,
														// 	state.searchText,
														// 	page.pageNumber
														// );
													}}
												>
													{page.title && <span>{page.title}</span>}
													{page.pageNumber && (
														<span>
															{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}
														</span>
													)}
													<i
														className="fa fa-chevron-right"
														style={{
															color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
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
							<div style={{ margin: '5px 0 0 0' }} className={'portfolio-tags-container'}>
								{review && review.primaryClassLabel && 'Tag:'}{' '}
								{renderPortfolioTags([review.primaryClassLabel])}
							</div>
						</StyledFrontCardContent>
					);
				}
			} catch (e) {
				console.log('Error rendering jbook card front');
				console.log(e);
				return {};
			}
		},

		getCardBack: (props) => {
			const { item, detailPage = false } = props;

			const projectData = { ...item };
			const budgetType = item.budgetType?.toUpperCase() || '';

			const formatNum = (num) => {
				const parsed = parseInt(num);
				if (parsed > 999) {
					return `${(parsed / 1000).toFixed(2)} $B`;
				}

				if (parsed > 999999) {
					return `${(parsed / 1000000).toFixed(2)} $T`;
				}
				return `${parsed} $M`;
			};

			const metadata = [
				{
					Key: 'Project',
					Value: projectData.projectTitle || 'N/A',
				},
				{
					Key: 'Program Element',
					Value: projectData.programElement || 'N/A',
					Hidden: budgetType === 'PDOC',
				},
				{
					Key: 'Project Number',
					Value: projectData.projectNum || 'N/A',
					Hidden: budgetType === 'PDOC',
				},
				{
					Key: 'Service Agency Name',
					Value: projectData.serviceAgency || 'N/A',
				},
				{
					Key: 'All Prior Years Amount',
					Value:
						projectData.allPriorYearsAmount !== null && projectData.allPriorYearsAmount !== undefined
							? `${formatNum(projectData.allPriorYearsAmount)}`
							: 'N/A',
				},
				{
					Key: 'Prior Year Amount',
					Value:
						projectData.priorYearAmount !== null && projectData.priorYearAmount !== undefined
							? `${formatNum(projectData.priorYearAmount)}`
							: 'N/A',
				},
				{
					Key: 'Current Year Amount',
					Value:
						projectData.currentYearAmount !== null && projectData.currentYearAmount !== undefined
							? `${formatNum(projectData.currentYearAmount)}`
							: 'N/A',
				},
				{
					Key: 'Fiscal Year',
					Value: projectData.budgetYear || 'N/A',
				},
				{
					Key: 'To Complete',
					Value: `${parseInt(projectData.budgetYear) + (budgetType === 'PDOC' ? 3 : 2)}` || 'N/A',
				},
				{
					Key: 'Total Cost',
					Value: projectData.totalCost
						? isNaN(projectData.totalCost)
							? projectData.totalCost
							: `${formatNum(projectData.totalCost)}`
						: 'N/A',
				},
				{
					Key: 'Budget Year (FY)',
					Value: projectData.budgetYear || 'N/A',
				},
				{
					Key: 'Budget Cycle',
					Value: projectData.budgetCycle || 'N/A',
				},
				{
					Key: 'Main Account',
					Value: projectData.appropriationNumber || 'N/A',
				},
				{
					Key: 'Appropriation Title',
					Value: projectData.appropriationTitle || 'N/A',
				},
				{
					Key: 'Budget Activity',
					Value: projectData.budgetActivityNumber || 'N/A',
				},
				{
					Key: 'Budget Sub Activity',
					Value:
						projectData.budgetType === 'odoc'
							? projectData.budgetActivityTitle ?? 'N/A'
							: projectData.budgetSubActivity ?? 'N/A',
				},
				{
					Key: 'Category',
					Value: getClassLabel(projectData),
				},
				{
					Key: 'Keywords',
					Value: (
						<div>
							{projectData.keywords && projectData.keywords.length > 0
								? projectData.keywords.map((keyword) => <p>{keyword}</p>)
								: 'None'}
						</div>
					),
				},
				// {
				// 	Key: <div style={{ display: 'flex', alignItems: 'center' }}>Cumulative Obligations<Tooltip title={'Metadata above reflects data at the BLI level'}><InfoOutlinedIcon style={{ margin: '-2px 6px' }} /></Tooltip></div>,
				// 	Value: projectData.obligations && projectData.obligations[0] ? `${(projectData.obligations[0].cumulativeObligations / 1000000).toLocaleString('en-US')} $M` : 'N/A'
				// },
				// {
				// 	Key: <div style={{ display: 'flex', alignItems: 'center' }}>Cumulative Expenditures<Tooltip title={'Metadata above reflects data at the BLI level'}><InfoOutlinedIcon style={{ margin: '-2px 6px' }} /></Tooltip></div>,
				// 	Value: projectData.obligations && projectData.obligations[0] ? `${(projectData.obligations[0].cumulativeDisbursements / 1000000).toLocaleString('en-US')} $M` : 'N/A'
				// },
			];

			return (
				<div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
					<SimpleTable
						tableClass={'magellan-table'}
						zoom={1}
						headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
						rows={metadata}
						height={'auto'}
						dontScroll={true}
						colWidth={colWidth}
						disableWrap={true}
						title={'Metadata'}
						hideHeader={false}
						margin={
							item.award_id_eda_ext && item.award_id_eda_ext !== 'empty' && !detailPage
								? '-10px 0 0 0'
								: ''
						}
					/>
				</div>
			);
		},

		getFooter: (props) => {
			const {
				item,
				state,
				toggledMore,
				graphView,
				cloneName,
				setToggledMore = () => {},
				closeGraphCard = () => {},
			} = props;

			const { searchText, selectedPortfolio } = state;

			return (
				<>
					<>
						<CardButton
							target={'_blank'}
							style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
							href={'#'}
							onClick={(e) => {
								e.preventDefault();
								clickFn(cloneName, searchText, item, selectedPortfolio);
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
						{/*<GCTooltip title={'Click here to view the contract award details page'}>*/}
						{/*	<CardButton*/}
						{/*		style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}*/}
						{/*		href={'#'}*/}
						{/*		disabled={true}*/}
						{/*	>*/}
						{/*		Preview*/}
						{/*	</CardButton>*/}
						{/*</GCTooltip>*/}
					</>
					<div
						style={{ ...styles.viewMoreButton, color: primary }}
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
							style={{ ...styles.viewMoreChevron, color: primary }}
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

		getDisplayTitle: (item) => {
			return '';
		},
	},
};

const JBookCardHandler = (props) => {
	const { setFilename, setDisplayTitle, item, cardType } = props;

	useEffect(() => {
		setFilename(cardHandler[cardType].getFilename(item));
		setDisplayTitle(cardHandler[cardType].getDisplayTitle(item));
	}, [cardType, item, setDisplayTitle, setFilename]);

	return <>{getDefaultComponent(props, cardHandler)}</>;
};

export default JBookCardHandler;
