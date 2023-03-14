import React, { useEffect } from 'react';
import { trackEvent, trackFlipCardEvent } from '../../telemetry/Matomo';
import {
	CARD_FONT_SIZE,
	encode,
	getTrackingNameForFactory,
	getTypeIcon,
	getTypeTextColor,
} from '../../../utils/gamechangerUtils';
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
import { primary, gcOrange } from '../../common/gc-colors';
import { CardButton } from '../../common/CardButton';
import GCTooltip from '../../common/GCToolTip';
import { KeyboardArrowRight, Star } from '@material-ui/icons';
import _ from 'lodash';
import { setState } from '../../../utils/sharedFunctions';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import GameChangerAPI from '../../api/gameChanger-service-api';
import sanitizeHtml from 'sanitize-html';
import {
	getDefaultComponent,
	StyledFrontCardHeader,
	StyledFrontCardSubHeader,
	StyledFrontCardContent,
	RevokedTag,
} from '../default/defaultCardHandler';
import EDAListViewCard from './edaListViewCard';
import { CustomDimensions } from '../../telemetry/utils';

const gameChangerAPI = new GameChangerAPI();

// fields that are numbers that require commas
const EDA_NUMBER_FIELDS = ['Total Obligated Amounts'];

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
	// 'sow_pws_text_eda_ext_t',
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
	obligated_amounts_eda_ext: 'fpds_dollars_obligated_eda_ext_f',
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
	sow_pws_text_eda_ext_t: 'Contract SOW',
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

const tableColumns = [{ id: 'name' }, { id: 'fpds' }, { id: 'eda' }];

const clickFn = (filename, cloneName, searchText, pageNumber = 0) => {
	trackEvent(
		getTrackingNameForFactory(cloneName),
		'CardInteraction',
		'PDFOpen',
		null,
		CustomDimensions.create(true, filename, pageNumber)
	);
	window.open(
		`/#/pdfviewer/gamechanger?filename=${encode(
			filename
		)}&prevSearchText=${searchText}&pageNumber=${pageNumber}&cloneIndex=${cloneName}`
	);
};

const getCardTooltipText = (item) => {
	let tooltipText = 'No metadata available';
	if (item && item.metadata_type_eda_ext && item.contract_issue_dodaac_eda_ext) {
		if (item.metadata_type_eda_ext === 'pds') {
			tooltipText = 'Pulled from PDS data';
		} else if (item.metadata_type_eda_ext === 'syn' && item.award_id_eda_ext) {
			tooltipText = 'Pulled from Synopsis data';
		}
	}

	return tooltipText;
};

const loadContractAward = async ({ open, item, dispatch, contractAwards, cloneData }) => {
	if (open && item.award_id_eda_ext !== 'empty') {
		const newContractAwards = _.cloneDeep(contractAwards) ?? {};
		const awardID = item.award_id_eda_ext;
		if (!newContractAwards[awardID] || !newContractAwards[awardID].length > 0) {
			newContractAwards[awardID] = 'loading';
			setState(dispatch, { contractAwards: newContractAwards });
			try {
				const contractMods = await gameChangerAPI.callSearchFunction({
					functionName: 'queryContractMods',
					cloneName: cloneData.clone_name,
					options: {
						awardID: item.award_id_eda_ext,
						isSearch: false,
					},
				});
				newContractAwards[awardID] = contractMods?.data?.length ? contractMods.data : [];

				setState(dispatch, { contractAwards: newContractAwards });
			} catch (err) {
				console.log(err);
				contractAwards[awardID] = [];
				setState(dispatch, { contractAwards: newContractAwards });
			}
		}
	}
};

const renderContractMods = ({ contractAwards = {}, item }) => {
	const contractMods = contractAwards[item.award_id_eda_ext] ?? [];
	const listItems = [];

	if (contractMods === 'loading') {
		return listItems;
	}
	if (contractMods.length > 0) {
		listItems.push(
			<div key={'headers'}>
				<ListItem>
					<ListItemText style={{ textAlign: 'end' }} secondary={'(S) Signature Date | (E) Effective Date'} />
				</ListItem>
				<Divider light={true} />
			</div>
		);
	}

	for (const mod of contractMods) {
		const { modNumber, signatureDate, effectiveDate } = mod;
		if (modNumber === 'Award') {
			continue;
		}
		let date = null;
		let dateText = '';
		if (signatureDate) {
			date = signatureDate;
			dateText = '(S)';
		} else if (effectiveDate) {
			date = effectiveDate;
			dateText = '(E)';
		}

		listItems.push(
			<div key={modNumber}>
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
			</div>
		);
	}

	return listItems;
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
										: () => {
												// this is intentional
										  }
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
			} = props;

			const { cloneData } = state;
			const { clone_name } = cloneData;

			let contextHtml = '';
			if (Array.isArray(item.pageHits)) {
				contextHtml = item.pageHits[hoveredHit]?.snippet ?? '';
			}

			const isWideCard = true;

			const currentAsOfText = `Page Count: ${item.page_count}`;

			let tooltipText = getCardTooltipText(item);

			if (state.listView) {
				return (
					<EDAListViewCard
						item={item}
						tooltipText={tooltipText}
						cloneData={cloneData}
						hitsExpanded={hitsExpanded}
						setHitsExpanded={setHitsExpanded}
						hoveredHit={hoveredHit}
						setHoveredHit={setHoveredHit}
						clickFn={clickFn}
						contextHtml={contextHtml}
						metadataExpanded={metadataExpanded}
						setMetadataExpanded={setMetadataExpanded}
						backBody={backBody}
					/>
				);
			}
			return (
				<StyledFrontCardContent
					className={`eda-card-front tutorial-step-${state.componentStepNumbers['Highlight Keyword']}`}
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
												key={page.pageNumber}
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
		},

		getCardBack: (props) => {
			const { item, state, dispatch, detailPage = false } = props;

			const { contractAwards, cloneData, listView } = state;

			let tooltipText = getCardTooltipText(item);
			let fields = EDA_FIELDS;
			let rows = getEDAMetadataForCard(EDA_FIELD_JSON_MAP, fields, item, EDA_FPDS_MAP, EDA_NUMBER_FIELDS);

			// grab award ID from filename if missing
			if (!item.award_id_eda_ext) {
				const splitFilename = item.filename.split('-');
				if (splitFilename[1].length > 8) {
					item.award_id_eda_ext = splitFilename[2];
				} else {
					item.award_id_eda_ext = splitFilename[6];
				}
			}

			return (
				<GCTooltip title={listView ? '' : tooltipText} arrow placement="top" enterDelay={400}>
					<div style={{ height: '100%', overflow: 'hidden' }}>
						{item.award_id_eda_ext && item.award_id_eda_ext !== 'empty' && !detailPage && (
							<GCAccordion
								onChange={(e) =>
									loadContractAward({ open: e, item, dispatch, contractAwards, cloneData })
								}
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
									{renderContractMods({ contractAwards, item })}
									{state.contractAwards &&
										state.contractAwards[item.award_id_eda_ext] === 'loading' && (
											<LoadingIndicator customColor={gcOrange} />
										)}
								</List>
							</GCAccordion>
						)}

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
											<TableRow hover role="checkbox" tabIndex={-1} key={row.name}>
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
				setToggledMore = () => {
					// intentional
				},
				closeGraphCard = () => {
					// intentional
				},
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
										'Close Graph Card',
										null,
										CustomDimensions.create(true, filename)
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
										'showDocumentDetails',
										null,
										CustomDimensions.create(true, filename)
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
							trackFlipCardEvent(
								getTrackingNameForFactory(cloneName),
								toggledMore,
								CustomDimensions.create(true, filename)
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

		getCardExtras: () => {
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
