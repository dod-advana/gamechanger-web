import React, { useEffect } from 'react';
import { trackEvent } from '../../telemetry/Matomo';
import {
	CARD_FONT_SIZE,
	encode,
	getTrackingNameForFactory,
	getTypeIcon,
	getTypeTextColor,
} from '../../../utils/gamechangerUtils';
import styled from 'styled-components';
import { getEDAMetadataForCard, getDisplayTitle } from './edaUtils';
import { List, ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import AwardIcon from '../../../images/icon/Award.svg';
import GCAccordion from '../../common/GCAccordion';
import { primary } from '../../common/gc-colors';
import { CardButton } from '../../common/CardButton';
import GCTooltip from '../../common/GCToolTip';
// import SimpleTable from '../../common/SimpleTable';
import { KeyboardArrowRight, Star } from '@material-ui/icons';
import _ from 'lodash';
import { setState } from '../../../utils/sharedFunctions';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { gcOrange } from '../../common/gc-colors';
import GameChangerAPI from '../../api/gameChanger-service-api';
import sanitizeHtml from 'sanitize-html';
import {
	getDefaultComponent,
	StyledFrontCardHeader,
	StyledFrontCardSubHeader,
	StyledFrontCardContent,
	RevokedTag,
} from '../default/defaultCardHandler';

const gameChangerAPI = new GameChangerAPI();

// the fields that will show in the back of the card
export const EDA_FIELDS = [
	'award_id_eda_ext',
	'modification_eda_ext',
	'reference_idv_eda_ext',
	'signature_date_eda_ext',
	'vendor_name_eda_ext',
	'vendor_duns_eda_ext',
	'vendor_cage_eda_ext',
	'contract_issue_dodaac_eda_ext',
	'contract_issue_name_eda_ext',
	'contract_issue_majcom_eda_ext',
	'issuing_organization_eda_ext',
	'paying_office_name_eda_ext',
	'paying_office_dodaac_eda_ext',
	'paying_office_majcom_eda_ext',
	'contract_admin_name_eda_ext',
	'contract_admin_office_dodaac_eda_ext',
	'contract_admin_majcom_eda_ext',
	'effective_date_eda_ext',
	'naics_eda_ext',
	'obligated_amounts_eda_ext',
	'fpds_funding_agency_name_eda_ext',
	'fpds_funding_office_code_eda_ext',
	'fpds_description_of_requirement_eda_ext',
	'fpds_psc_eda_ext',
	'fpds_psc_desc_eda_ext',
	// 'fpds_closed_date_eda_ext'
];

// mapping the older field names to their newer fpds field names
export const EDA_FPDS_MAP = {
	reference_idv_eda_ext: 'fpds_idv_piid_eda_ext',
	award_id_eda_ext: 'fpds_piid_eda_ext',
	modification_eda_ext: 'fpds_modification_number_eda_ext',
	signature_date_eda_ext: 'fpds_date_signed_eda_ext_dt',
	effective_date_eda_ext: 'fpds_effective_date_eda_ext_dt',
	naics_eda_ext: 'fpds_naics_code_eda_ext',
	vendor_name_eda_ext: 'fpds_vendor_name_eda_ext',
	vendor_duns_eda_ext: 'fpds_duns_eda_ext',
	vendor_cage_eda_ext: 'fpds_cage_code_eda_ext',
	contract_issue_name_eda_ext: 'fpds_contracting_office_name_eda_ext',
	contract_issue_dodaac_eda_ext: 'fpds_contracting_office_code_eda_ext',
	misc_fsc_eda_ext: 'fpds_psc_eda_ext',
	obligated_amounts_eda_ext: 'fpds_dollars_obligated_eda_ext',
};

// mapping the name of the field to the label
export const EDA_FIELD_JSON_MAP = {
	award_id_eda_ext: 'Award ID',
	reference_idv_eda_ext: 'Referenced IDV',
	signature_date_eda_ext: 'Award Date Signed',
	naics_eda_ext: 'NAICS (Code)',
	vendor_name_eda_ext: 'Vendor Name',
	vendor_duns_eda_ext: 'Vendor DUNS',
	vendor_cage_eda_ext: 'Vendor CAGE',
	obligated_amounts_eda_ext: 'Total Obligated Amounts',
	contract_issue_name_eda_ext: 'Issuing Office Name',
	contract_issue_dodaac_eda_ext: 'Issuing Office DoDaaC',
	misc_fsc_eda_ext: 'PSC on Contract Header',
	paying_office_name_eda_ext: 'Paying Office Name',
	paying_office_dodaac_eda_ext: 'Paying Office DoDAAC',
	modification_eda_ext: 'Modification Number',
	contract_admin_name_eda_ext: 'Admin Office Name',
	contract_admin_office_dodaac_eda_ext: 'Admin Office DoDAAC',
	effective_date_eda_ext: 'Effective Date',
	contract_issue_majcom_eda_ext: 'Issuing Office MAJCOM',
	paying_office_majcom_eda_ext: 'Paying Office MAJCOM',
	contract_admin_majcom_eda_ext: 'Admin Office MAJCOM',
	issuing_organization_eda_ext: 'Issuing Organization',

	fpds_dollars_obligated_eda_ext: 'FPDS Dollars Obligated',
	fpds_contracting_agency_name_eda_ext: 'FPDS Contracting Agency',
	fpds_vendor_name_eda_ext: 'FPDS Vendor Name',
	fpds_contracting_office_code_eda_ext: 'FPDS Contracting Office Code',
	fpds_effective_date_eda_ext: 'FPDS Effective Date',
	fpds_funding_office_code_eda_ext: 'FPDS Funding Office Code',
	fpds_idv_piid_eda_ext: 'FPDS IDV PIID',
	fpds_modification_number_eda_ext: 'FPDS Mod Number',
	fpds_psc_desc_eda_ext: 'FPDS PSC Description',
	fpds_contracting_office_name_eda_ext: 'FPDS Contracting Office',
	fpds_piid_eda_ext: 'FPDS PIID',
	fpds_date_signed_eda_ext: 'FPDS Date Signed',
	fpds_description_of_requirement_eda_ext: 'FPDS Description of Requirement',
	fpds_psc_eda_ext: 'FPDS PSC',
	fpds_funding_agency_name_eda_ext: 'FPDS Funding Agency',
	fpds_naics_code_eda_ext: 'FPDS NAICS Code',
	fpds_duns_eda_ext: 'FPDS DUNS',
};

const styles = {
	bodyContainer: {
		display: 'flex',
		height: '100%',
		flexDirection: 'column',
	},
	scrollBodyContainer: {
		backgroundColor: 'rgb(238,241,242)',
		display: 'block',
	},
	cardBody: {
		fontFamily: 'Noto Sans',
		overflow: 'auto',
	},
	actionButtonGroup: {
		flex: 1,
		justifyContent: 'flex-end',
		display: 'flex',
		alignItems: 'center',
	},
	footerButtonFront: {
		margin: '0 10px 0 0 ',
		padding: '5px 12px',
		height: 50,
		display: 'flex',
		alignItems: 'center',
	},
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

const tableColumns = [{ id: 'name' }, { id: 'fpds' }, { id: 'eda' }];

const clickFn = (filename, cloneName, searchText, pageNumber = 0) => {
	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'PDFOpen');
	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'filename', filename);
	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'pageNumber', pageNumber);
	window.open(
		`/#/pdfviewer/gamechanger?filename=${encode(
			filename
		)}&prevSearchText=${searchText}&pageNumber=${pageNumber}&cloneIndex=${cloneName}`
	);
};

const cardHandler = {
	document: {
		getCardHeader: (props) => {
			const { item, state, graphView } = props;

			const { cloneData } = state;
			const { clone_name } = cloneData;

			const displayTitle = getDisplayTitle(item);
			const isRevoked = item.is_revoked_b;
			const subType = 'PDF';
			const displayOrg = 'EDA';

			const docListView = state.listView && !graphView;

			const isBaseAward = item.mod_identifier_eda_ext === 'base_award';

			return (
				<StyledFrontCardHeader listView={state.listView} docListView={docListView}>
					<div className={'title-text-selected-favorite-div'}>
						<GCTooltip title={displayTitle} placement="top" arrow>
							<div
								className={'title-text'}
								onClick={
									docListView
										? () => clickFn(item.file_location_eda_ext, clone_name, '', 0)
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
									{displayTitle}
								</div>
								{docListView && (
									<div className={'list-view-arrow'}>
										<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }} />
									</div>
								)}
								{isBaseAward && <img src={AwardIcon} style={{ width: 19 }} alt="award" />}
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
							<div className={'sub-header-two'}>EDA</div>
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

			const { cloneData } = state;
			const { clone_name } = cloneData;

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
				} else if (item.metadata_type_eda_ext === 'syn' && item.award_id_eda_ext) {
					tooltipText = 'Pulled from Synopsis data';
				}
			}

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
								<span className="buttonText">Page Hits</span>
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
														clickFn(
															item.file_location_eda_ext,
															clone_name,
															'',
															page.pageNumber
														);
													}}
												>
													<span>
														{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}
													</span>
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
										dangerouslySetInnerHTML={{
											__html: sanitizeHtml(contextHtml),
										}}
									/>
								</div>
							</div>
						)}
						<GCTooltip title={tooltipText} arrow placement="top" enterDelay={400}>
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
						</GCTooltip>
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
													clickFn(
														item.file_location_eda_ext,
														clone_name,
														'',
														page.pageNumber
													);
												}}
											>
												<span>{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}</span>
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
														clickFn(
															item.file_location_eda_ext,
															clone_name,
															'',
															page.pageNumber
														);
													}}
												>
													<span>
														{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}
													</span>
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
						)}
					</StyledFrontCardContent>
				);
			}
		},

		getCardBack: (props) => {
			const { item, state, dispatch, detailPage = false } = props;

			let tooltipText = 'No metadata available';
			let fields = EDA_FIELDS;
			let rows = getEDAMetadataForCard(EDA_FIELD_JSON_MAP, fields, item, EDA_FPDS_MAP);

			if (item && item.metadata_type_eda_ext && item.contract_issue_dodaac_eda_ext) {
				if (item.metadata_type_eda_ext === 'pds') {
					tooltipText = 'Pulled from PDS data';
				} else if (item.metadata_type_eda_ext === 'syn') {
					tooltipText = 'Pulled from Synopsis data';
				}
			}

			// grab award ID from filename if missing
			if (!item.award_id_eda_ext) {
				const splitFilename = item.filename.split('-');
				if (splitFilename[1].length > 8) {
					item.award_id_eda_ext = splitFilename[2];
				} else {
					item.award_id_eda_ext = splitFilename[6];
				}
			}

			const loadContractAward = async (open) => {
				if (open && item.award_id_eda_ext !== 'empty') {
					const contractAwards = _.cloneDeep(state.contractAwards) ?? {};
					const awardID = item.award_id_eda_ext;
					if (!contractAwards[awardID] || !contractAwards[awardID].length > 0) {
						contractAwards[awardID] = 'loading';
						setState(dispatch, { contractAwards });
						try {
							const contractMods = await gameChangerAPI.callSearchFunction({
								functionName: 'queryContractMods',
								cloneName: state.cloneData.clone_name,
								options: {
									awardID: item.award_id_eda_ext,
									isSearch: false,
								},
							});
							contractAwards[awardID] = contractMods?.data?.length ? contractMods.data : [];

							setState(dispatch, { contractAwards });
						} catch (err) {
							console.log(err);
							contractAwards[awardID] = [];
							setState(dispatch, { contractAwards });
						}
					}
				}
			};

			const renderContractMods = () => {
				const contractMods =
					state.contractAwards && state.contractAwards[item.award_id_eda_ext]
						? state.contractAwards[item.award_id_eda_ext]
						: [];
				const listItems = [];

				if (contractMods && contractMods !== 'loading') {
					if (contractMods.length > 0) {
						listItems.push(
							<>
								<ListItem>
									<ListItemText
										style={{ textAlign: 'end' }}
										secondary={'(S) Signature Date | (E) Effective Date'}
									/>
								</ListItem>
								<Divider light={true} />
							</>
						);
					}

					for (const mod of contractMods) {
						const { modNumber, signatureDate, effectiveDate } = mod;
						if (modNumber !== 'Award') {
							let date = signatureDate ? signatureDate : effectiveDate ? effectiveDate : null;
							let dateText = '';
							if (signatureDate) {
								date = signatureDate;
								dateText = '(S)';
							} else if (effectiveDate) {
								date = effectiveDate;
								dateText = '(E)';
							} else {
								date = null;
								dateText = '';
							}
							listItems.push(
								<>
									<ListItem>
										{item.modification_eda_ext === modNumber && (
											<ListItemIcon style={{ minWidth: '54px' }}>
												<Star style={{ fontSize: 20 }} />
											</ListItemIcon>
										)}
										<ListItemText
											style={{
												margin: item.modification_eda_ext !== modNumber ? '0 0 0 54px' : '',
												display: 'flex',
												justifyContent: 'space-between',
											}}
											primary={modNumber}
											secondary={date ? `${dateText}  ${date}` : ''}
										/>
									</ListItem>
									<Divider light={true} />
								</>
							);
						}
					}
				}
				return listItems;
			};

			return (
				<GCTooltip title={state.listView ? '' : tooltipText} arrow placement="top" enterDelay={400}>
					<div style={{ height: '100%', overflow: 'hidden' }}>
						{item.award_id_eda_ext && item.award_id_eda_ext !== 'empty' && !detailPage && (
							<GCAccordion
								onChange={loadContractAward}
								contentPadding={0}
								expanded={false}
								header={'Show Contract Modifications'}
								headerBackground={'rgb(238,241,242)'}
								headerTextColor={'black'}
								headerTextWeight={'normal'}
								marginBottom={'0px !important'}
							>
								<List style={{ width: '100%', padding: '0' }}>
									<ListItem>
										<ListItemIcon>
											<img src={AwardIcon} style={{ width: 15 }} alt="award" />
										</ListItemIcon>
										<ListItemText primary={item.award_id_eda_ext} />
									</ListItem>
									<Divider light={true} />
									{renderContractMods()}
									{state.contractAwards &&
										state.contractAwards[item.award_id_eda_ext] === 'loading' && (
											<LoadingIndicator customColor={gcOrange} />
										)}
								</List>
							</GCAccordion>
						)}

						{/* <SimpleTable
							tableClass={'magellan-table'}
							zoom={1}
							headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
							rows={getEDAMetadataForPropertyTable(EDA_FIELD_JSON_MAP, fields, item, EDA_FPDS_MAP)}
							height={'auto'}
							dontScroll={true}
							colWidth={colWidth}
							disableWrap={true}
							title={'Metadata'}
							hideHeader={true}
							margin={
								item.award_id_eda_ext && item.award_id_eda_ext !== 'empty' && !detailPage
									? '-10px 0 0 0'
									: ''
							}
						/> */}
						<TableContainer sx={{ maxHeight: 295 }}>
							<Table stickyHeader aria-label="sticky table">
								<TableHead>
									<TableRow>
										<TableCell>Name</TableCell>
										<TableCell>FPDS</TableCell>
										<TableCell>EDA</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{rows.map((row) => {
										return (
											<TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
												{tableColumns.map((column) => {
													const value = row[column.id];
													return (
														<TableCell key={column.id} align={column.align}>
															{column.format && typeof value === 'number'
																? column.format(value)
																: value}
														</TableCell>
													);
												})}
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</TableContainer>
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
				closeGraphCard = () => {},
				item,
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
								clickFn(filename, cloneName);
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
						<GCTooltip title={'Click here to view the contract award details page'}>
							<CardButton
								style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
								href={'#'}
								onClick={(e) => {
									trackEvent(
										getTrackingNameForFactory(cloneName),
										'CardInteraction',
										'showDocumentDetails'
									);
									window.open(
										`#/gamechanger-details?cloneName=${cloneName}&type=contract&awardID=${item.award_id_eda_ext}`
									);
									e.preventDefault();
								}}
							>
								Contract
							</CardButton>
						</GCTooltip>
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
			return item.file_location_eda_ext;
		},

		getDisplayTitle: (item) => {
			return getDisplayTitle(item);
		},
	},
};

const EdaCardHandler = (props) => {
	const { setFilename, setDisplayTitle, item, cardType } = props;

	useEffect(() => {
		setFilename(cardHandler[cardType].getFilename(item));
		setDisplayTitle(cardHandler[cardType].getDisplayTitle(item));
	}, [cardType, item, setDisplayTitle, setFilename]);

	return <>{getDefaultComponent(props, cardHandler)}</>;
};

export default EdaCardHandler;
