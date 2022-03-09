import React from 'react';
import { trackEvent } from '../../telemetry/Matomo';
import {
	CARD_FONT_SIZE,
	getTrackingNameForFactory, getTypeIcon, getTypeTextColor
} from '../../../utils/gamechangerUtils';
import { primary } from '../../common/gc-colors';
import { CardButton } from '../../common/CardButton';
import GCTooltip from '../../common/GCToolTip';
import SimpleTable from '../../common/SimpleTable';
import {
	getClassLabel,
	getConvertedName,
	getConvertedType,
	getDocTypeStyles,
	getTotalCost
} from '../../../utils/jbookUtilities';
import { KeyboardArrowRight } from '@material-ui/icons';
import styled from 'styled-components';
import _ from 'lodash';
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
		padding: '8px 12px'
	},
	viewMoreChevron: {
		fontSize: 14,
		color: primary,
		fontWeight: 'normal',
		marginLeft: 5
	},
	viewMoreButton: {
		fontSize: 16,
		color: primary,
		fontWeight: 'bold',
		cursor: 'pointer',
		minWidth: 60
	},
};


const StyledFrontCardHeader = styled.div`
	font-size: 1.2em;
	display: inline-block;
	color: black;
	margin-bottom: 0px;
	background-color: ${({ intelligentSearch }) => intelligentSearch ? '#9BB1C8' : 'white'};
	font-weight: bold;
	font-family: Montserrat;
	height: ${({ listView }) => listView ? 'fit-content' : '59px'};
	padding: ${({ listView }) => listView ? '0px' : '5px'};
	margin-left: ${({ listView }) => listView ? '10px' : '0px'};
	margin-right: ${({ listView }) => listView ? '10px' : '0px'};
	
	.title-text-selected-favorite-div {
		max-height: ${({ listView }) => listView ? '' : '50px'};
		height: ${({ listView }) => listView ? '35px' : ''};
		overflow: hidden;
		display: flex;
		justify-content: space-between;
		
		.title-text {
			cursor: pointer;
			display:  ${({ docListView }) => docListView ? 'flex' : ''};
			alignItems:  ${({ docListView }) => docListView ? 'top' : ''};
			height:  ${({ docListView }) => docListView ? 'fit-content' : ''};
			
			.text {
				margin-top: ${({ listView }) => listView ? '10px' : '0px'};
			}
			
			.list-view-arrow {
				display: inline-block;
				margin-top: 7px;
			}
		}
		
		.selected-favorite {
			display: inline-block;
			font-family: "Noto Sans";
			font-weight: 400;
			font-size: 14px;
			margin-top: ${({ listView }) => listView ? '2px' : '0px'};
		}
	}
	
	.list-view-sub-header {
		font-size: 0.8em;
		display: flex;
		color: black;
		margin-bottom: 0px;
		margin-top: 0px;
		background-color: ${({ intelligentSearch }) => intelligentSearch ? '#9BB1C8' : 'white'};
		font-family: Montserrat;
		height: 24px;
		justify-content: space-between;
	}
`;

const StyledFrontCardSubHeader = styled.div`
	display: flex;
	position: relative;
	
	.sub-header-one {
		color: ${({ typeTextColor }) => typeTextColor ? typeTextColor : '#ffffff'};
		background-color: ${({ docTypeColor }) => docTypeColor ? docTypeColor : '#000000'};
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
		background-color: ${({ docOrgColor }) => docOrgColor ? docOrgColor : '#000000'};
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
				color: #386F94;
				
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
				quotes: "\\201C""\\201D""\\2018""\\2019";
				
				> em {
					color: white;
					background-color: #E9691D;
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
	font-family: "Noto Sans";
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
				color: #386F94;
				
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
				max-width: ${({ isWideCard }) => isWideCard ? '' : '280px'};
				
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
					quotes: "\\201C""\\201D""\\2018""\\2019";
					
					> em {
						color: white;
						background-color: #E9691D;
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


const jbookCardHandler = {
	document: {
		getCardHeader: (props) => {
			const {
				item,
				state,
				graphView
			} = props;

			let displayTitle = '';
			switch (item.budgetType) {
				case 'pdoc':
					displayTitle = `BA Num: ${item.budgetActivityNumber} BA Title: ${item.budgetActivityTitle}`;
					break;
				case 'rdoc':
					displayTitle = `PE Num: ${item.programElement} Proj Num: ${item.projectNum}`;
					break;
				case 'odoc':
					displayTitle = `BLI: ${item.budgetLineItem} App Num: ${item.appropriationNumber} BA Num: ${item.budgetActivityNumber}`;
					break;
				default:
					break;
			}

			const isRevoked = item.is_revoked_b;

			const cardType = item.budgetType ? getConvertedType(item.budgetType) : '';
			const agency = item.serviceAgency;

			const docListView = state.listView && !graphView;


			return (
				<StyledFrontCardHeader listView={state.listView} docListView={docListView} >
					<div className={'title-text-selected-favorite-div'}>
						<GCTooltip title={displayTitle} placement='top' arrow>
							<div className={'title-text'}
								//  onClick={(docListView) ? () => clickFn(item.filename, 0) : () => {}}
								style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 5px 0 0' }}
							>
								<div className={'text'} style={{ width: '90%' }}>
									{item.budgetYear} | {displayTitle} <br /> {item.projectTitle}
								</div>
								{docListView &&
									<div className={'list-view-arrow'}>
										<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }} />
									</div>
								}
								{/* {isBaseAward && <img src={AwardIcon}  style={{ width: 19 }} alt="award"/>} */}
							</div>
						</GCTooltip>
						<div className={'selected-favorite'}>
							<div style={{ display: 'flex' }}>
								{docListView && isRevoked && <RevokedTag>Canceled</RevokedTag>}
							</div>
						</div>
					</div>
					{docListView &&
						<div className={'list-view-sub-header'}>
							<p> {cardType} | {agency} </p>
						</div>
					}
				</StyledFrontCardHeader >
			);
		},

		getCardSubHeader: (props) => {
			const { item, state, toggledMore } = props;

			const cardType = item.budgetType ? getConvertedType(item.budgetType) : '';
			const agency = item.serviceAgency;
			const iconSrc = getTypeIcon('PDF');
			const typeTextColor = getTypeTextColor('PDF');

			let { docOrgColor } = getDocTypeStyles(agency);

			return (
				<>
					{!state.listView && !toggledMore &&
						<StyledFrontCardSubHeader typeTextColor={typeTextColor} docTypeColor={'#386F94'} docOrgColor={docOrgColor}>
							<div className={'sub-header-one'}>
								{iconSrc.length > 0 && <img src={iconSrc} alt="type logo" />}
								{cardType}
							</div>
							<div className={'sub-header-two'}>
								{getConvertedName(agency)}
							</div>
						</StyledFrontCardSubHeader>
					}
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
				intelligentFeedbackComponent
			} = props;

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

			if (!state.searchText || state.searchText === null || state.searchText === '' || !item.pageHits || item.pageHits.length <= 0) {
				item.pageHits = [
					{
						title: 'Project Description',
						snippet: _.truncate(item.projectMissionDescription, { 'length': 150 })
					},
					{
						title: 'Contracts',
						snippet: _.truncate(item.contracts ? renderContracts(item.contracts) : 'No Contracts', {'length': 180})
					},
					{
						title: 'Accomplishments',
						snippet: _.truncate(item.accomplishments ? renderAccomplishments(item.accomplishments) : 'No Accomplishments', {'length': 200})
					},
					{
						title: 'Section',
						snippet: 'Section text: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
					}
				];
			}

			let hoveredSnippet = '';
			if (Array.isArray(item.pageHits) && item.pageHits[hoveredHit]) {
				hoveredSnippet = item.pageHits[hoveredHit]?.snippet ?? '';
			}
			const contextHtml = hoveredSnippet;
			const isWideCard = true;

			const currentAsOfText = `Budget Year: ${item.budgetYear}`;

			if (state.listView && !intelligentSearch) {
				return (
					<StyledListViewFrontCardContent>
						{item.pageHits && item.pageHits.length > 0 &&
							<button type="button" className={'list-view-button'}
								onClick={() => {
									trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'ListViewInteraction', !hitsExpanded ? 'Expand hit pages' : 'Collapse hit pages');
									setHitsExpanded(!hitsExpanded);
								}}
							>
								<span className="buttonText">Details</span>
								<i className={hitsExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'} aria-hidden="true" />
							</button>
						}
						{hitsExpanded &&
							<div className={'expanded-hits'}>
								<div className={'page-hits'}>
									{_.chain(item.pageHits).map((page, key) => {
										return (
											<div
												className={'page-hit'}
												key={key}
												style={{ ...(hoveredHit === key && { backgroundColor: '#E9691D', color: 'white' }), }}
												onMouseEnter={() => setHoveredHit(key)}
												onClick={e => {
													e.preventDefault();
													// clickFn(item.filename, page.pageNumber);
												}}
											>
												<span>
													{page.title && <span>{page.title}</span>}
												</span>
												<i className="fa fa-chevron-right" style={{ color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)' }} />
											</div>
										);
									}).value()}
								</div>
								<div className={'expanded-metadata'}>
									<blockquote dangerouslySetInnerHTML={{ __html: sanitizeHtml(contextHtml) }} />
								</div>
							</div>
						}
						<div>
							<button type="button" className={'list-view-button'}
								onClick={() => {
									trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'ListViewInteraction', !metadataExpanded ? 'Expand metadata' : 'Collapse metadata');
									setMetadataExpanded(!metadataExpanded);
								}}
							>
								<span className="buttonText">Document Metadata</span>
								<i className={metadataExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'} aria-hidden="true" />
							</button>
							{metadataExpanded &&
								<div className={'metadata'}>
									<div className={'inner-scroll-container'}>
										{backBody}
									</div>
								</div>
							}
						</div>
					</StyledListViewFrontCardContent>
				);
			} else if (state.listView && intelligentSearch) {
				return (
					<StyledListViewFrontCardContent>
						<div className={'expanded-hits'}>
							<div className={'page-hits'}>
								{_.chain(item.pageHits).map((page, key) => {
									return (
										<div
											className={'page-hit'}
											key={key}
											style={{ ...(hoveredHit === key && { backgroundColor: '#E9691D', color: 'white' }), }}
											onMouseEnter={() => setHoveredHit(key)}
											onClick={e => {
												e.preventDefault();
												// clickFn(item.filename, page.pageNumber);
											}}
										>
											<span>
												{page.title && <span>{page.title}</span>}
											</span>
											<i className="fa fa-chevron-right" style={{ color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)' }} />
										</div>
									);
								}).value()}
							</div>
							<div className={'expanded-metadata'}>
								<blockquote dangerouslySetInnerHTML={{ __html: sanitizeHtml(contextHtml) }} />
							</div>
						</div>
						<button type="button" className={'list-view-button'}
							onClick={() => {
								trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'ListViewInteraction', !metadataExpanded ? 'Expand metadata' : 'Collapse metadata');
								setMetadataExpanded(!metadataExpanded);
							}}>
							<span className="buttonText">Document Metadata</span>
							<i className={metadataExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'} aria-hidden="true" />
						</button>

						{metadataExpanded &&
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>
									{backBody}
								</div>
							</div>
						}

						<div style={{ marginTop: '10px', marginBottom: '10px' }}> {intelligentFeedbackComponent()} </div>
					</StyledListViewFrontCardContent>
				);
			} else {
				return (
					<StyledFrontCardContent className={`tutorial-step-highlight-keyword`} isWideCard={isWideCard}>
						<div className={'currents-as-of-div'}>
							<div className={'current-text'}>
								{/*currentAsOfText*/}
							</div>
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
														{page.pageNumber === 0
															? 'ID'
															: `Page ${page.pageNumber}`}
													</span>
												)}
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

			const {
				item,
				detailPage = false
			} = props;

			const projectData = { ...item };
			const budgetType = item.budgetType?.toUpperCase() || '';
			const projectNum = null;

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
					Hidden: budgetType === 'PDOC'
				},
				{
					Key: 'Project Number',
					Value: projectNum || 'N/A',
					Hidden: budgetType === 'PDOC'
				},
				{
					Key: 'Service Agency Name',
					Value: projectData.serviceAgency || 'N/A',
				},
				{
					Key: 'All Prior Years Amount',
					Value: projectData.allPriorYearsAmount !== null && projectData.allPriorYearsAmount !== undefined ? `${formatNum(projectData.allPriorYearsAmount)}` : 'N/A',
				},
				{
					Key: 'Prior Year Amount',
					Value: projectData.priorYearAmount !== null && projectData.priorYearAmount !== undefined ? `${formatNum(projectData.priorYearAmount)}` : 'N/A',
				},
				{
					Key: 'Current Year Amount',
					Value: projectData.currentYearAmount !== null && projectData.currentYearAmount !== undefined ? `${formatNum(projectData.currentYearAmount)}` : 'N/A',
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
					Value: getTotalCost(projectData) ? `${formatNum(getTotalCost(projectData))}` : 'N/A',
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
					Key: 'Appropriation',
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
					Key: 'Budget Activity Title',
					Value: projectData.budgetActivityTitle || 'N/A',
				},
				{
					Key: 'Category',
					Value: getClassLabel(projectData)
				},
				{
					Key: 'Keywords',
					Value: <div>
						{projectData.keywords && projectData.keywords.length > 0 ? projectData.keywords.map(keyword => <p>{keyword}</p>) : 'None'}
					</div>,
				}
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
					<SimpleTable tableClass={'magellan-table'}
						zoom={1}
						headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
						rows={metadata}
						height={'auto'}
						dontScroll={true}
						colWidth={colWidth}
						disableWrap={true}
						title={'Metadata'}
						hideHeader={false}
						margin={item.award_id_eda_ext && item.award_id_eda_ext !== 'empty' && !detailPage ? '-10px 0 0 0' : ''}
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
				setToggledMore = () => { },
				closeGraphCard = () => { },
			} = props;

			const { searchText } = state;

			const {
				projectTitle,
				programElement,
				projectNum,
				budgetLineItem,
				budgetType,
				budgetYear,
				id,
				appropriationNumber
			} = item;

			const types = {
				pdoc: 'Procurement',
				rdoc: 'RDT&E',
				om: 'O&M',
			};

			return (
				<>
					<>
						<CardButton target={'_blank'} style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }} href={'#'}
							onClick={(e) => {
								e.preventDefault();
								let url = `#/jbook/profile?title=${projectTitle}&programElement=${programElement}&projectNum=${projectNum}&type=${encodeURIComponent(types[budgetType])}&budgetLineItem=${budgetLineItem}&budgetYear=${budgetYear}&searchText=${searchText}&id=${id}&appropriationNumber=${appropriationNumber}&useElasticSearch=${state.useElasticSearch}`;
								window.open(url);
							}}
						>
							Open
						</CardButton>
						{graphView && <CardButton
							style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
							href={'#'}
							onClick={(e) => {
								trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'Close Graph Card');
								e.preventDefault();
								closeGraphCard();
							}}
						>
							Close
						</CardButton>}
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
					<div style={{ ...styles.viewMoreButton }} onClick={() => {
						trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'flipCard', toggledMore ? 'Overview' : 'More');
						setToggledMore(!toggledMore);
					}}
					>
						{toggledMore ? 'Overview' : 'More'}
						<i style={styles.viewMoreChevron} className="fa fa-chevron-right" aria-hidden="true" />
					</div>
				</>
			);
		},

		getCardExtras: (props) => {

			return (
				<></>
			);
		},

		getFilename: (item) => {
			return '';
		},

	},

	publication: {
		getCardHeader: (props) => {

			return (
				<></>
			);
		},

		getCardSubHeader: (props) => {

			return (
				<></>
			);
		},

		getCardFront: (props) => {

			return (
				<></>
			);
		},

		getCardBack: (props) => {


			return (
				<></>
			);
		},

		getFooter: (props) => {

			return (
				<></>
			);
		},

		getCardExtras: (props) => {

			return (
				<></>
			);
		},

		getFilename: (item) => {
			return '';
		},
	},

	entity: {
		getCardHeader: (props) => {

			return (
				<></>
			);
		},

		getCardSubHeader: (props) => {

			return (
				<></>
			);
		},

		getCardFront: (props) => {

			return (
				<></>
			);
		},

		getCardBack: (props) => {


			return (
				<></>
			);
		},

		getFooter: (props) => {

			return (
				<></>
			);
		},

		getCardExtras: (props) => {

			return (
				<></>
			);
		},

		getFilename: (item) => {
			return '';
		},
	},

	topic: {
		getCardHeader: (props) => {

			return (
				<></>
			);
		},

		getCardSubHeader: (props) => {

			return (
				<></>
			);
		},

		getCardFront: (props) => {

			return (
				<></>
			);
		},

		getCardBack: (props) => {


			return (
				<></>
			);
		},

		getFooter: (props) => {

			return (
				<></>
			);
		},

		getCardExtras: (props) => {

			return (
				<></>
			);
		},

		getFilename: (item) => {
			return '';
		},
	}
};

export default jbookCardHandler;
