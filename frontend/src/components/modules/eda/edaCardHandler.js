import React from "react";
import {trackEvent} from "../../telemetry/Matomo";
import {
	CARD_FONT_SIZE,
	getTrackingNameForFactory, getTypeIcon, getTypeTextColor
} from "../../../gamechangerUtils";
import {
	getEDAMetadataForPropertyTable,
	getDisplayTitle
} from "./edaUtils";
import {
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Divider
} from "@material-ui/core";

import EDAAPI from "../../api/eda-service-api.js";
import AwardIcon from '../../../images/icon/Award.svg';
import GCAccordion from "../../common/GCAccordion";
import {primary} from "../../../components/common/gc-colors";
import {CardButton} from "../../common/CardButton";
import GCTooltip from "../../common/GCToolTip";
import SimpleTable from "../../common/SimpleTable";
import {KeyboardArrowRight, Star} from "@material-ui/icons";
import styled from "styled-components";
import _ from "lodash";
import {setState} from "../../../sharedFunctions";
import LoadingIndicator from "advana-platform-ui/dist/loading/LoadingIndicator";
import {gcOrange} from "../../common/gc-colors";

const edaAPI = new EDAAPI();

//
export const EDA_FIELDS = [
	"award_id_eda_ext", 
	"modification_eda_ext",
	"reference_idv_eda_ext", 
	"signature_date_eda_ext", 
	"vendor_name_eda_ext",
	"vendor_duns_eda_ext",
	"vendor_cage_eda_ext",
	"issuing_organization_eda_ext",
	"contract_issue_name_eda_ext",
	"contract_issue_dodaac_eda_ext",
	"contract_issue_majcom_eda_ext",
	"paying_office_name_eda_ext",
	"paying_office_dodaac_eda_ext",
	"paying_office_majcom_eda_ext",
	"contract_admin_name_eda_ext",
	"contract_admin_office_dodaac_eda_ext",
	"contract_admin_majcom_eda_ext",
	"effective_date_eda_ext",
	"naics_eda_ext",
	"obligated_amounts_eda_ext",
];


export const EDA_FIELD_JSON_MAP = {
	"award_id_eda_ext": "Award ID", 
	"reference_idv_eda_ext": "Referenced IDV", 
	"signature_date_eda_ext": "Award Date Signed", 
	"naics_eda_ext" : "NAICS (Code)",
	"vendor_name_eda_ext": "Vendor Name",
	"vendor_duns_eda_ext": "Vendor DUNS",
	"vendor_cage_eda_ext": "Vendor CAGE",
	"obligated_amounts_eda_ext": "Total Obligated Amounts",
	"contract_issue_name_eda_ext": "Issuing Office Name",
	"contract_issue_dodaac_eda_ext": "Issuing Office DoDaaC",
	"misc_fsc_eda_ext": "PSC on Contract Header",
	"paying_office_name_eda_ext": "Paying Office Name",
	"paying_office_dodaac_eda_ext": "Paying Office DoDAAC",
	"modification_eda_ext": "Modification Number",
	"contract_admin_name_eda_ext": "Admin Office Name",
	"contract_admin_office_dodaac_eda_ext": "Admin Office DoDAAC",
	"effective_date_eda_ext": "Effective Date",
	"contract_issue_majcom_eda_ext": "Issuing Office MAJCOM",
	"paying_office_majcom_eda_ext": "Paying Office MAJCOM",
	"contract_admin_majcom_eda_ext": "Admin Office MAJCOM",
	"issuing_organization_eda_ext": "Issuing Organization"
};

const styles = {
	bodyContainer: {
		display: 'flex',
		height: '100%',
		flexDirection: 'column'
	},
	scrollBodyContainer: {
		backgroundColor: "rgb(238,241,242)",
		display: 'block',
	},
	cardBody: {
        fontFamily: 'Noto Sans',
        overflow: 'auto'
	},
    actionButtonGroup: {
		flex: 1,
		justifyContent: 'flex-end',
		display: 'flex',
		alignItems: 'center'
	},
	footerButtonFront: {
        margin: '0 10px 0 0 ',
		padding: '5px 12px',
		height: 50,
		display: 'flex',
		alignItems: 'center'
    },
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

const colWidth = {
	maxWidth: '900px',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const StyledFrontCardHeader = styled.div`
	font-size: 1.2em;
	display: inline-block;
	color: black;
	margin-bottom: 0px;
	background-color: ${({intelligentSearch}) => intelligentSearch ? '#9BB1C8': 'white'};
	font-weight: bold;
	font-family: Montserrat;
	height: ${({listView}) => listView ? 'fit-content': '59px'};
	padding: ${({listView}) => listView ? '0px': '5px'};
	margin-left: ${({listView}) => listView ? '10px': '0px'};
	margin-right: ${({listView}) => listView ? '10px': '0px'};
	
	.title-text-selected-favorite-div {
		max-height: ${({listView}) => listView ? '': '50px'};
		height: ${({listView}) => listView ? '35px': ''};
		overflow: hidden;
		display: flex;
		justify-content: space-between;
		
		.title-text {
			cursor: pointer;
			display:  ${({docListView}) => docListView ? 'flex': ''};
			alignItems:  ${({docListView}) => docListView ? 'top': ''};
			height:  ${({docListView}) => docListView ? 'fit-content': ''};
			
			.text {
				margin-top: ${({listView}) => listView ? '10px': '0px'};
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
			margin-top: ${({listView}) => listView ? '2px': '0px'};
		}
	}
	
	.list-view-sub-header {
		font-size: 0.8em;
		display: flex;
		color: black;
		margin-bottom: 0px;
		margin-top: 0px;
		background-color: ${({intelligentSearch}) => intelligentSearch ? '#9BB1C8': 'white'};
		font-family: Montserrat;
		height: 24px;
		justify-content: space-between;
	}
`;

const StyledFrontCardSubHeader = styled.div`
	display: flex;
	position: relative;
	
	.sub-header-one {
		color: ${({typeTextColor}) => typeTextColor ? typeTextColor : '#ffffff'};
		background-color: ${({docTypeColor}) => docTypeColor ? docTypeColor : '#000000'};
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
		background-color: ${({docOrgColor}) => docOrgColor ? docOrgColor : '#000000'};
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
				max-width: ${({isWideCard}) => isWideCard ? '' : '280px'};
				
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

const clickFn = (filename, cloneName, searchText, pageNumber = 0) => {
	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction' , 'PDFOpen');
	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'filename', filename);
	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'pageNumber', pageNumber);
	window.open(`/#/pdfviewer/gamechanger?filename=${filename}&prevSearchText=${searchText}&pageNumber=${pageNumber}&cloneIndex=${cloneName}`);
};

const EdaCardHandler = {
	document: {
		getCardHeader: (props) => {
			const {
				item,
				state,
				graphView
			} = props;
			
			const displayTitle = getDisplayTitle(item);
			const isRevoked = item.is_revoked_b;
			const subType = 'PDF';
			const displayOrg = 'EDA';
			
			const docListView = state.listView && !graphView;

			const isBaseAward = item.mod_identifier_eda_ext === "base_award";
			
			return (
				<StyledFrontCardHeader listView={state.listView} docListView={docListView}>
						<div className={'title-text-selected-favorite-div'}>
						<GCTooltip title={displayTitle} placement='top' arrow>
							<div className={'title-text'}
								 onClick={(docListView) ? () => clickFn(item.filename, 0) : () => {}}
								 style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 5px 0 0' }}
							>
								<div className={'text'} style={{ width: '90%' }}>
									{displayTitle}
								</div>
								{docListView &&
									<div className={'list-view-arrow'}>
										<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }}/>
									</div>
								}
								{isBaseAward && <img src={AwardIcon}  style={{ width: 19 }} alt="award"/>}
							</div>
						</GCTooltip>
						<div className={'selected-favorite'}>
							<div style={{display: "flex"}}>
								{docListView && isRevoked && <RevokedTag>Canceled</RevokedTag>}
							</div>
						</div>
					</div>
					{docListView &&
						<div className={'list-view-sub-header'}>
							<p> {subType} | {displayOrg} </p>
						</div>
					}
				</StyledFrontCardHeader>
			);
		},
		
		getCardSubHeader: (props) => {
			const {item, state, toggledMore} = props;
			
			const cardType = item.type;
			const iconSrc = getTypeIcon(cardType);
			const subType = 'PDF';
    		const typeTextColor = getTypeTextColor(cardType);
    		
    		return (
				<>
					{!state.listView && !toggledMore &&
						<StyledFrontCardSubHeader typeTextColor={typeTextColor} docTypeColor={'#439E86'} docOrgColor={'#20009E'}>
							<div className={'sub-header-one'}>
								{iconSrc.length > 0 && <img src={iconSrc} alt="type logo"/>}
								{subType}
							</div>
							<div className={'sub-header-two'}>
								EDA
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
			
			let hoveredSnippet = '';
			if (Array.isArray(item.pageHits) && item.pageHits[hoveredHit]) {
				hoveredSnippet = item.pageHits[hoveredHit]?.snippet ?? '';
			}
			const contextHtml = hoveredSnippet;
			const isWideCard = true;
			
			const currentAsOfText = `Page Count: ${item.page_count}`;

			let tooltipText = 'No metadata available';
			if (item && item.metadata_type_eda_ext && item.contract_issue_dodaac_eda_ext) {
				if (item.metadata_type_eda_ext === 'pds') {
					tooltipText = 'Pulled from PDS data';
				}
				else if (item.metadata_type_eda_ext === 'syn' && item.award_id_eda_ext) {
					tooltipText = 'Pulled from Synopsis data';
				}
			}
	
			if (state.listView && !intelligentSearch) {
				return (
						<StyledListViewFrontCardContent>
							{item.pageHits && item.pageHits.length > 0 &&
								<>
									<button type="button" className={'list-view-button'}
										onClick={() => {
											trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'ListViewInteraction', !hitsExpanded ? 'Expand hit pages' : 'Collapse hit pages');
											setHitsExpanded(!hitsExpanded);
										}}
									>
										<span className = "buttonText">Page Hits</span>
										<i className= {hitsExpanded ? "fa fa-chevron-up" : "fa fa-chevron-down"} aria-hidden="true"/>
									</button>
									{hitsExpanded &&
										<div className={'expanded-hits'}>
											<div className={'page-hits'}>
												{_.chain(item.pageHits).map((page, key) => {
													return (
														<div className={'page-hit'} key={key} style={{
																...(hoveredHit === key && { backgroundColor: '#E9691D', color: 'white' }),
															}}
															onMouseEnter={() => setHoveredHit(key) }
															onClick={e => {
																e.preventDefault();
																clickFn(item.filename, page.pageNumber);
															}}
														>
															<span>
																{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}
															</span>
															<i className="fa fa-chevron-right" style={{ color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)' }} />
														</div>
													);
												}).value()}
											</div>
											<div className={'expanded-metadata'}>
												<blockquote dangerouslySetInnerHTML={{ __html: contextHtml }} />
											</div>
										</div>
									}
									<GCTooltip title={tooltipText} arrow placement="top" enterDelay={400}>
										<div>
											<button type="button" className={'list-view-button'}
												onClick={() => {
													trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'ListViewInteraction', !metadataExpanded ? 'Expand metadata' : 'Collapse metadata');
													setMetadataExpanded(!metadataExpanded);
												}}
											>
												<span className="buttonText">Document Metadata</span>
												<i className = {metadataExpanded ? "fa fa-chevron-up" : "fa fa-chevron-down"} aria-hidden="true"/>
											</button>
											{metadataExpanded &&
												<div className={'metadata'}>
													<div className={'inner-scroll-container'}>
														{backBody}
													</div>
												</div>
											}
										</div>
									</GCTooltip>

								</>
							}
						</StyledListViewFrontCardContent>
				);
			} else if (state.listView && intelligentSearch) {
				return (
					<StyledListViewFrontCardContent>
						<div className={'expanded-hits'}>
							<div className={'page-hits'}>
								{_.chain(item.pageHits).map((page, key) => {
									return (
											<div className={'page-hit'} key={key} style={{
													...(hoveredHit === key && { backgroundColor: '#E9691D', color: 'white' }),
												}}
												onMouseEnter={() => setHoveredHit(key) }
												onClick={e => {
													e.preventDefault();
													clickFn(item.filename, page.pageNumber);
												}}
											>
												<span>
													{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}
												</span>
												<i className="fa fa-chevron-right" style={{ color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)' }} />
											</div>
										);
								}).value()}
							</div>
							<div className={'expanded-metadata'}>
								<blockquote dangerouslySetInnerHTML={{ __html: contextHtml }} />
							</div>
						</div>
						<button type="button" className={'list-view-button'}
							onClick={() => {
								trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'ListViewInteraction', !metadataExpanded ? 'Expand metadata' : 'Collapse metadata');
								setMetadataExpanded(!metadataExpanded);
							}}>
								<span className="buttonText">Document Metadata</span>
								<i className = {metadataExpanded ? "fa fa-chevron-up" : "fa fa-chevron-down"} aria-hidden="true"/>
						</button>

						{metadataExpanded &&
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>
									{backBody}
								</div>
							</div>
						}
						
						<div style={{marginTop: '10px', marginBottom: '10px'}}> {intelligentFeedbackComponent()} </div>
					</StyledListViewFrontCardContent>
				);
			} else {
				return (
					<StyledFrontCardContent className={`tutorial-step-${state.componentStepNumbers["Highlight Keyword"]}`} isWideCard={isWideCard}>
						<div className={'currents-as-of-div'}>
							<div className={'current-text'}>
								{currentAsOfText}
							</div>
							{item.isRevoked &&
								<GCTooltip title={'This version of the document is no longer in effect'} placement='top' arrow>
									<RevokedTag>Canceled</RevokedTag>
								</GCTooltip>
							}
							{item.pageHits.length === 0 &&
								<p>Matched on PDS data</p>
							}
						</div>
						{item.pageHits.length > 0 &&
							<div className={'hits-container'}>
								<div className={'page-hits'}>
									{_.chain(item.pageHits).map((page, key) => {
										return (
											<div className={'page-hit'} key={key} style={{
												...(hoveredHit === key && {backgroundColor: '#E9691D', color: 'white'}),
											}}
												 onMouseEnter={() => setHoveredHit(key)}
												 onClick={e => {
													 e.preventDefault();
													 clickFn(item.filename, page.pageNumber);
												 }}
											>
												<span>{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}</span>
												<i className="fa fa-chevron-right"
												   style={{color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)'}}/>
											</div>
										)
									}).value()}
								</div>
								<div className={'expanded-metadata'}>
									<blockquote className="searchdemo-blockquote"
												dangerouslySetInnerHTML={{__html: contextHtml}}/>
								</div>
							</div>
						}
					</StyledFrontCardContent>
				);
			}
		},
		
		getCardBack: (props) => {
			
			const {
				item,
				state, 
				dispatch
			} = props;

			let tooltipText = 'No metadata available';
			let fields = EDA_FIELDS;
			if (item && item.metadata_type_eda_ext && item.contract_issue_dodaac_eda_ext) {
				if (item.metadata_type_eda_ext === 'pds') {
					tooltipText = 'Pulled from PDS data';
				}
				else if (item.metadata_type_eda_ext === 'syn') {
					tooltipText = 'Pulled from Synopsis data';
				}
			}

			const loadContractAward = async (open) => {
				if (open && item.award_id_eda_ext !== "empty") {
					const contractAwards = _.cloneDeep(state.contractAwards);
					const awardID = item.award_id_eda_ext;
					if (!contractAwards[awardID] || !contractAwards[awardID].length > 0) {
						contractAwards[awardID] = 'loading';
						setState(dispatch, { contractAwards });

						const contractMods = await edaAPI.queryEDAContractAward(item.award_id_eda_ext);
						contractAwards[awardID] = contractMods.data;

						setState(dispatch, { contractAwards });
					}
				}
			}

			const renderContractMods = () => {
				const contractMods = state.contractAwards && state.contractAwards[item.award_id_eda_ext] ? state.contractAwards[item.award_id_eda_ext] : [];
				const listItems = [];
				if (contractMods !== 'loading') {
					for (const mod of contractMods) {
						if (mod !== "Award") {
							listItems.push(
							<>
								<ListItem>
									{item.modification_eda_ext === mod &&
										<ListItemIcon>
											<Star />
										</ListItemIcon>
									}
									<ListItemText style={{ margin: '0 0 0 54px'}} primary={mod} />
								</ListItem>
								<Divider light={true}/>
							</>
							);
						}
					}
				}
				return listItems;
			}
			
			return (
				<GCTooltip title={state.listView ? '' : tooltipText} arrow placement="top" enterDelay={400}>
					<div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
						{item.award_id_eda_ext && item.award_id_eda_ext !== "empty" &&
							<GCAccordion onChange={loadContractAward}contentPadding={0} expanded={false} header={'Show Contract Modifications'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'} style={{ marginBottom: '0px !important' }}>
								<List style={{ width: '100%', padding: '0' }}>
									<ListItem>
										<ListItemIcon>
											<img src={AwardIcon}  style={{ width: 15 }} alt="award"/>
										</ListItemIcon>
										<ListItemText primary={item.award_id_eda_ext} />
									</ListItem>
									<Divider light={true} />
									{renderContractMods()}
									{state.contractAwards && state.contractAwards[item.award_id_eda_ext] === 'loading' && 
										<LoadingIndicator customColor={gcOrange} />
									}
								</List>
							</GCAccordion>				
						}

						<SimpleTable tableClass={'magellan-table'}
							zoom={1}
							headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
							rows={getEDAMetadataForPropertyTable(EDA_FIELD_JSON_MAP, fields, item)}
							height={'auto'}
							dontScroll={true}
							colWidth={colWidth}
							disableWrap={true}
							title={'Metadata'}
							hideHeader={true}
							margin={item.award_id_eda_ext && item.award_id_eda_ext !== "empty" ? '-10px 0 0 0' : ''}
						/>
					</div>
				</GCTooltip>
			);
		},
		
		getFooter: (props) => {
			
			const {
				toggledMore,
				graphView,
				cloneName,
				filename,
				setToggledMore = () => {},
				closeGraphCard = () => {}
			} = props
			
			return (
				<>
					<>
						<CardButton target={'_blank'} style={{...styles.footerButtonBack, CARD_FONT_SIZE}} href={'#'}
							onClick={(e) => {
								e.preventDefault();
								clickFn(filename, cloneName);
							}}
						>
							Open
						</CardButton>
						{graphView && <CardButton
							style={{...styles.footerButtonBack, CARD_FONT_SIZE}}
							href={'#'}
							onClick={(e) => {
								trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'Close Graph Card');
								e.preventDefault();
								closeGraphCard();
							}}
						>
							Close
						</CardButton>}
						<GCTooltip title={'Check back soon for a new document details page.'}>
							 <CardButton
								disabled={true}
								style={{...styles.footerButtonBack, CARD_FONT_SIZE}}
								href={'#'}
								onClick={(e) => {
									trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'showDocumentDetails');
									e.preventDefault();
								}}
							 >
								 Details
							</CardButton>
						</GCTooltip>
					</>
					<div style={{...styles.viewMoreButton}} onClick={() => {
						trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'flipCard', toggledMore ? 'Overview' : 'More');
							setToggledMore(!toggledMore)
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
			return item.file_location_eda_ext;
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
}

export default EdaCardHandler;
