import React, { useEffect } from 'react';
import { trackEvent } from '../../telemetry/Matomo';
import { CARD_FONT_SIZE, getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import { primary } from '../../common/gc-colors';
import { CardButton } from '../../common/CardButton';
import GCTooltip from '../../common/GCToolTip';
import SimpleTable from '../../common/SimpleTable';
import { getClassLabel, getConvertedType, formatNum } from '../../../utils/jbookUtilities';
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

// mappings
const types = {
	pdoc: 'Procurement',
	rdoc: 'RDT&E',
	odoc: 'O&M',
};

const metadataNameToSearchFilterName = {
	'Service Agency Name': 'serviceAgency',
	'Budget Year (FY)': 'budgetYear',
	'Program Element': 'programElement',
	'Project Number': 'projectNum',
	Project: 'projectTitle',
	Keywords: 'hasKeywords',
	'Total Cost': ['minTotalCost', 'maxTotalCost'],
	'Main Account': 'appropriationNumber',
	'Budget Activity': 'budgetActivity',
	'Budget Sub Activity': 'budgetSubActivity',
};

// helper functions
const getBudgetSubActivity = (projectData) => {
	return projectData.budgetType === 'odoc'
		? projectData.budgetActivityTitle ?? 'N/A'
		: projectData.budgetSubActivity ?? 'N/A';
};

const getToComplete = (projectData, budgetType) => {
	return `${parseInt(projectData.budgetYear) + (budgetType === 'PDOC' ? 3 : 2)}` || 'N/A';
};

const emptyFunction = function () {
	// this is intentionally empty
};

const clickFn = (cloneName, searchText, item, portfolioName) => {
	const { budgetType, appropriationNumber, id, budgetYear } = item;

	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'LineItemOpen');
	let url = `#/jbook/profile?type=${encodeURIComponent(
		types[budgetType]
	)}&searchText=${searchText}&id=${id}&appropriationNumber=${appropriationNumber}&portfolioName=${portfolioName}&budgetYear=${budgetYear}`;
	window.open(url);
};

const formatField = (projectData, field) => {
	let finalString = 'N/A';
	if (projectData[field] !== null && projectData[field] !== undefined) {
		finalString = `${formatNum(projectData[field])}`;
	}
	return finalString;
};

const renderContracts = (contracts, length) => {
	let contractElements = `<b>Contracts: ${contracts.length}</b>`;

	let lengthOver = false;

	for (let i = 0; i < contracts.length && i < 5; i++) {
		const contract = contracts[i];
		if (contractElements.length < length) {
			const contractPiin = contract.piin_s ? `- ${contract.piin_s}` : '';
			contractElements += `<br/><p>${contractPiin}</p>`;
		} else {
			lengthOver = true;
		}
	}

	contractElements += lengthOver ? '...' : '';

	return contractElements;
};

const renderAccomplishments = (accomplishments, length) => {
	let accomplishmentElements = `<b>Accomplishments: ${accomplishments.length}</b>`;

	let lengthOver = false;

	for (let i = 0; i < accomplishments.length && i < 5; i++) {
		const accomplishment = accomplishments[i];
		if (accomplishmentElements.length < length) {
			accomplishmentElements += `<br/><p>${
				accomplishment.Accomp_Title_text_t ? `- ${accomplishment.Accomp_Title_text_t}` : ''
			}</p>`;
		} else {
			lengthOver = true;
		}
	}

	accomplishmentElements += lengthOver ? '...' : '';

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

const getItemPageHits = (item) => {
	const pageHits = [
		{
			title: 'Project Description',
			snippet: _.truncate(item.projectMissionDescription, { length: 150 }),
		},
	];

	if (item.contracts) {
		pageHits.push({
			title: 'Contracts',
			snippet: renderContracts(item.contracts, 180),
		});
	}

	if (item.accomplishments) {
		pageHits.push({
			title: 'Accomplishments',
			snippet: renderAccomplishments(item.accomplishments, 200),
		});
	}

	return pageHits;
};

/* takes list of modified searchSettings and the name of a metadata field
	returns true if that metadata field represents a search setting that has been modified
	false otherwise */
const isSearchFilterModified = (modifiedSearchSettings, metadataName) => {
	if (metadataName === 'Total Cost') {
		return (
			modifiedSearchSettings.includes(metadataNameToSearchFilterName[metadataName][0]) ||
			modifiedSearchSettings.includes(metadataNameToSearchFilterName[metadataName][1])
		);
	}
	return modifiedSearchSettings.includes(metadataNameToSearchFilterName[metadataName]);
};

/* handle sorting the Total Cost metadata field
	helper for sortMetadataByAppliedSearchFilters
	either a.Key or b.Key or both will be "Total Cost" when this function is invoked
	return -1, 0, or 1 indicating the respective order of a and b given which search
		filters have been modified from the default
*/
const sortTotalCostMetadataByAppliedSearchFilters = (modifiedSearchSettings, a, b) => {
	if (a.Key === 'Total Cost' && isSearchFilterModified(modifiedSearchSettings, a.Key)) {
		if (b.Key === 'Total Cost' && isSearchFilterModified(modifiedSearchSettings, b.Key)) {
			return 0;
		} else return -1;
	} else if (b.Key === 'Total Cost' && isSearchFilterModified(modifiedSearchSettings, b.Key)) {
		if (isSearchFilterModified(modifiedSearchSettings, a.Key)) {
			return 0;
		} else {
			return 1;
		}
	} else {
		return 0;
	}
};

/* handle sorting metadata fields based on the search filters
	return -1, 0, or 1 indicating the respective order of a and b given which search
		filters have been modified from the default
*/
const sortMetadataByAppliedSearchFilters = (modifiedSearchSettings) => {
	return (a, b) => {
		const metadataNames = Object.keys(metadataNameToSearchFilterName);
		if (!metadataNames.includes(a.Key) && !metadataNames.includes(b.Key)) return 0;
		if (a.Key === 'Total Cost' || b.Key === 'Total Cost') {
			return sortTotalCostMetadataByAppliedSearchFilters(modifiedSearchSettings, a, b);
		}
		if (metadataNames.includes(a.Key) && isSearchFilterModified(modifiedSearchSettings, a.Key)) {
			if (metadataNames.includes(b.Key) && isSearchFilterModified(modifiedSearchSettings, b.Key)) {
				return 0;
			} else {
				return -1;
			}
		} else {
			if (metadataNames.includes(b.Key) && isSearchFilterModified(modifiedSearchSettings, b.Key)) {
				return 1;
			} else {
				return 0;
			}
		}
	};
};

// sub-components
const HitsExpandedButton = ({ item, clone_name, hitsExpanded, setHitsExpanded }) => {
	if (item.pageHits && item.pageHits.length > 0) {
		return (
			<button
				type="button"
				className={'list-view-button'}
				onClick={() => {
					trackEvent(
						getTrackingNameForFactory(clone_name),
						'ListViewInteraction',
						!hitsExpanded ? 'Expand hit pages' : 'Collapse hit pages'
					);
					setHitsExpanded(!hitsExpanded);
				}}
			>
				<span className="buttonText">Details</span>
				<i className={hitsExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'} aria-hidden="true" />
			</button>
		);
	} else return <></>;
};

const ExpandedHits = ({ item, hoveredHit, setHoveredHit, contextHtml }) => {
	return (
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
				<blockquote
					className="searchdemo-blockquote"
					dangerouslySetInnerHTML={{ __html: sanitizeHtml(contextHtml) }}
				/>
			</div>
		</div>
	);
};

const ExpandedMetadata = ({ metadataExpanded, backBody }) => {
	if (metadataExpanded) {
		return (
			<div className={'metadata'}>
				<div className={'inner-scroll-container'}>{backBody}</div>
			</div>
		);
	} else return <></>;
};

const ListViewFrontCardContent = ({
	intelligentSearch,
	item,
	clone_name,
	hitsExpanded,
	setHitsExpanded,
	hoveredHit,
	setHoveredHit,
	contextHtml,
	toggleExpandMetadata,
	metadataExpanded,
	backBody,
	intelligentFeedbackComponent,
}) => {
	return (
		<StyledListViewFrontCardContent expandedDataBackground={'#eceef1'}>
			<HitsExpandedButton
				item={item}
				clone_name={clone_name}
				hitsExpanded={hitsExpanded}
				setHitsExpanded={setHitsExpanded}
			/>
			{hitsExpanded && (
				<ExpandedHits
					item={item}
					hoveredHit={hoveredHit}
					setHoveredHit={setHoveredHit}
					contextHtml={contextHtml}
				/>
			)}
			<div>
				<button type="button" className={'list-view-button'} onClick={toggleExpandMetadata}>
					<span className="buttonText">Document Metadata</span>
					<i className={metadataExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'} aria-hidden="true" />
				</button>
				<ExpandedMetadata metadataExpanded={metadataExpanded} backBody={backBody} />
			</div>
			{intelligentSearch && (
				<div style={{ marginTop: '10px', marginBottom: '10px' }}> {intelligentFeedbackComponent()} </div>
			)}
		</StyledListViewFrontCardContent>
	);
};

const ProjectKeywords = (keywords) => {
	return <>{keywords && keywords.length > 0 ? keywords.map((keyword) => <p>{keyword}</p>) : 'None'}</>;
};

// main card handler
const cardHandler = {
	document: {
		getCardHeader: (props) => {
			const { item, state, graphView } = props;

			const { cloneData, searchText, selectedPortfolio } = state;

			let displayTitleTop = '';
			let displayTitleBot = '';
			switch (item.budgetType) {
				case 'odoc':
				case 'pdoc':
					displayTitleTop = `BLI: ${item.budgetLineItem ?? ''} | Title: ${item.projectTitle}`;
					break;
				case 'rdoc':
					displayTitleTop = `BLI: ${item.programElement ?? ''} | Title: ${item.projectTitle}`;
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
								onClick={(e) => {
									if (!docListView) return;
									e.preventDefault();
									clickFn(cloneData.cloneName, searchText, item, selectedPortfolio);
								}}
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

				let year = item.budgetYear ? item.budgetYear.slice(2) : '';
				let cycle = item.budgetCycle ?? 'PB';
				budgetPrefix = cycle + year + (item.currentYearAmount ? ': ' : '');

				budgetAmount = item.currentYearAmount ? '$' + item.currentYearAmount + ' M' : '';
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
				const toggleExpandMetadata = () => {
					trackEvent(
						getTrackingNameForFactory(state.cloneData.clone_name),
						'ListViewInteraction',
						!metadataExpanded ? 'Expand metadata' : 'Collapse metadata'
					);
					setMetadataExpanded(!metadataExpanded);
				};
				// render the hover menu and options

				if (
					!state.searchText ||
					state.searchText === null ||
					state.searchText === '' ||
					!item.pageHits ||
					item.pageHits.length <= 0
				) {
					item.pageHits = getItemPageHits(item);
				}

				let hoveredSnippet = '';
				if (Array.isArray(item.pageHits) && item.pageHits[hoveredHit]) {
					hoveredSnippet = item.pageHits[hoveredHit]?.snippet ?? '';
				}
				const contextHtml = hoveredSnippet;
				const isWideCard = true;

				if (state.listView) {
					return (
						<ListViewFrontCardContent
							intelligentSearch={intelligentSearch}
							item={item}
							clone_name={state.cloneData.clone_name}
							hitsExpanded={hitsExpanded}
							setHitsExpanded={setHitsExpanded}
							hoveredHit={hoveredHit}
							setHoveredHit={setHoveredHit}
							contextHtml={contextHtml}
							toggleExpandMetadata={toggleExpandMetadata}
							metadataExpanded={metadataExpanded}
							backBody={backBody}
							intelligentFeedbackComponent={intelligentFeedbackComponent}
						/>
					);
				} else {
					return (
						<StyledFrontCardContent className={`tutorial-step-highlight-keyword`} isWideCard={isWideCard}>
							<div className={'currents-as-of-div'}>
								<div className={'current-text'}>{/*currentAsOfText*/}</div>
							</div>
							<ExpandedHits
								item={item}
								hoveredHit={hoveredHit}
								setHoveredHit={setHoveredHit}
								contextHtml={contextHtml}
							/>
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
			const { state, item, detailPage = false } = props;
			const { selectedPortfolio, modifiedSearchSettings } = state;

			const projectData = { ...item };
			const budgetType = item.budgetType?.toUpperCase() || '';

			let keys = [
				'projectTitle',
				'programElement',
				'projectNum',
				'serviceAgency',
				'budgetYear',
				'budgetCycle',
				'appropriationNumber',
				'appropriationTitle',
				'budgetActivityNumber',
			];

			for (let key of keys) {
				if (projectData[key] === undefined) {
					projectData[key] = 'N/A';
				}
			}

			const metadata = [
				{
					Key: 'Project',
					Value: projectData.projectTitle,
				},
				{
					Key: 'Program Element',
					Value: projectData.programElement,
					Hidden: budgetType === 'PDOC',
				},
				{
					Key: 'Project Number',
					Value: projectData.projectNum,
					Hidden: budgetType === 'PDOC',
				},
				{
					Key: 'Service Agency Name',
					Value: projectData.serviceAgency,
				},
				{
					Key: 'All Prior Years Amount',
					Value: formatField(projectData, 'allPriorYearsAmount'),
				},
				{
					Key: 'Prior Year Amount',
					Value: formatField(projectData, 'priorYearAmount'),
				},
				{
					Key: 'Current Year Amount',
					Value: formatField(projectData, 'currentYearAmount'),
				},
				{
					Key: 'Fiscal Year',
					Value: projectData.budgetYear,
				},
				{
					Key: 'To Complete',
					Value: getToComplete(projectData, budgetType),
				},
				{
					Key: 'Total Cost',
					Value: formatField(projectData, 'totalCost'),
				},
				{
					Key: 'Budget Year (FY)',
					Value: projectData.budgetYear,
				},
				{
					Key: 'Budget Cycle',
					Value: projectData.budgetCycle,
				},
				{
					Key: 'Main Account',
					Value: projectData.appropriationNumber,
				},
				{
					Key: 'Appropriation Title',
					Value: projectData.appropriationTitle,
				},
				{
					Key: 'Budget Activity',
					Value: projectData.budgetActivityNumber,
				},
				{
					Key: 'Budget Sub Activity',
					Value: getBudgetSubActivity(projectData),
				},
			];

			if (selectedPortfolio === 'AI Inventory') {
				metadata.push({
					Key: 'Category',
					Value: getClassLabel(projectData),
				});
				metadata.push({
					Key: 'Keywords',
					Value: (
						<div>
							<ProjectKeywords keywords={projectData.keywords} />
						</div>
					),
				});
			}

			console.log('modified : ', modifiedSearchSettings);
			console.log(metadata);
			const rankedMetadata = metadata.sort(sortMetadataByAppliedSearchFilters(modifiedSearchSettings));
			console.log(rankedMetadata);
			console.log('\n\n\n\n\n');
			return (
				<div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
					<SimpleTable
						tableClass={'magellan-table'}
						zoom={1}
						headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
						rows={rankedMetadata}
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
				setToggledMore = emptyFunction,
				closeGraphCard = emptyFunction,
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

		getCardExtras: () => {
			return <></>;
		},

		getFilename: () => {
			return '';
		},

		getDisplayTitle: () => {
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
