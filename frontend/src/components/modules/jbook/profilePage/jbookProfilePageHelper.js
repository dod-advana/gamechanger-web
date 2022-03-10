import React, { useState, useContext } from 'react';
import SimpleTable from '../../../common/SimpleTable';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import {Checkbox, FormControlLabel, Tooltip, Typography} from '@material-ui/core';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import {
	StyledTableContainer, StyledNavButton, StyledNavBar, StyledNavContainer, StyledSideNavContainer,
	StyledLeftContainer, StyledRightContainer, StyledMainContainer
} from './profilePageStyles';
import sanitizeHtml from 'sanitize-html';
import SideNavigation from '../../../navigation/SideNavigation';
import { getClassLabel, getTotalCost } from '../../../../utils/jbookUtilities';
import { JBookContext } from '../jbookContext';

const firstColWidth = {
	maxWidth: 100,
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const boldKeys = (data) => {
	return data.map(pair => {
		pair.Key = <strong>{pair.Key}</strong>;
		return pair;
	});
};

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

const SideNav = (props) => {
	const { budgetType, budgetYear, context } = props;

	return (
		<>
			<StyledNavBar id="The Basics">
				<StyledSideNavContainer>
					<Typography variant="h3" style={{ fontWeight: 'bold' }}>
						{(budgetType ?? '') + ' ' + (budgetYear ?? '')}
					</Typography>
				</StyledSideNavContainer>

				<StyledNavContainer>
					<NavButtons />
				</StyledNavContainer>

				<StyledSideNavContainer>
				</StyledSideNavContainer>
			</StyledNavBar>
			<SideNavigation context={context} />
		</>
	);
};

const BasicData = (props) => {
	const {
		budgetType
	} = props;

	const context = useContext(JBookContext);
	const { state } = context;
	const { projectData, reviewData } = state;

	return (
		<StyledLeftContainer>
			<SimpleTable tableClass={'magellan-table'}
				zoom={1}
				rows={[
					{
						Key: 'Category',
						Value: getClassLabel(reviewData)
					},
					{
						Key: 'Budget Line Item',
						Value: projectData.budgetLineItem,
						Hidden: budgetType === 'RDT&E'
					},
					{
						Key: 'Budget Activity Number',
						Value: projectData.budgetActivityNumber
					},
					{
						Key: 'Appropriations Number',
						Value: projectData.appropriationNumber
					},
					{
						Key: 'Program Element',
						Value: projectData.programElement,
						Hidden: budgetType === 'Procurement'
					},
					{
						Key: 'Project Number',
						Value: projectData.projectNum,
						Hidden: budgetType === 'Procurement'
					}
				]}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={'Basic Data'}
				headerExtraStyle={{
					backgroundColor: '#313541',
					color: 'white'
				}}
				hideSubheader={true}
				firstColWidth={firstColWidth}
			/>
		</StyledLeftContainer>
	);
};

const Metadata = (props) => {
	const { budgetType, projectNum, keywordCheckboxes, setKeywordCheck } = props;

	const context = useContext(JBookContext);
	const { state } = context;
	const { projectData, reviewData, keywordsChecked } = state;

	return (
		<StyledRightContainer>
			<SimpleTable tableClass={'magellan-table'}
				zoom={1}
				rows={projectData ? getMetadataTableData(projectData, budgetType, projectNum, reviewData, keywordsChecked, keywordCheckboxes, setKeywordCheck) : []}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={'Metadata'}
				headerExtraStyle={{
					backgroundColor: '#313541',
					color: 'white'
				}}
				hideSubheader={true}
				firstColWidth={firstColWidth}
			/>
		</StyledRightContainer>
	);
};

const ProjectDescription = (props) => {
	const { profileLoading, projectData, programElement, projectNum, projectDescriptions } = props;
	return (
		<StyledMainContainer>
			{profileLoading ? <LoadingIndicator customColor={'#1C2D64'} style={{ width: '50px', height: '50px' }} />
				:
				<>
					<Typography variant="h2" style={{ width: '100%', margin: '0 0 15px 0', fontWeight: 'bold' }}>{renderTitle(projectData, programElement, projectNum)}</Typography>
					<Typography variant="h3" style={{ fontWeight: 'bold', width: '100%', marginBottom: '20px' }}>
						{(projectData.projectMissionDescription || projectData.programDescription) ?? projectData.projectMissionDescription ? 'Project Description' : 'Program Description'}
					</Typography>
					<div style={{ maxHeight: '860px', overflow: 'auto' }}>
						<Typography variant="subtitle1" style={{ fontSize: '16px', margin: '10px 0' }}>
							{projectDescriptions.map((pd) => {
								return (
									<>
										<Typography key={pd.title} variant="h3" style={{ fontWeight: 'bold', width: '100%' }}>
											{pd.title}
										</Typography>
										<blockquote style={{ borderLeft: 'none' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(pd.value, { allowedAttributes: { span: ['style'] } }) }} />
									</>);
							})}
						</Typography>
					</div>
				</>
			}
		</StyledMainContainer>
	);
};

const Accomplishments = (props) => {
	const { accomplishments } = props;
	return (
		<StyledTableContainer>
			{accomplishments.map(accomp => {
				return (
					<SimpleTable
						tableClass={'magellan-table'}
						zoom={1}
						rows={accomp.data}
						height={'auto'}
						dontScroll={true}
						disableWrap={true}
						title={`Accomplishment: ${accomp.title ?? 'N/A'}`}
						headerExtraStyle={{
							backgroundColor: '#1C2D64',
							color: 'white'
						}}
						hideSubheader={true}
						firstColWidth={{
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							width: 60
						}}
						useInnerHtml={true}
					/>
				);
			})
			}
		</StyledTableContainer>
	);
};

const aggregateProjectDescriptions = (projectData) => {
	let tmpProjectDescriptions = [];

	const titleMapping = {
		// both or rdoc
		'programElementTitle': { title: 'Program Element Title' },
		'projectTitle': { title: 'Project Title' },
		'projectMissionDescription': { title: 'Project Mission Description' },
		'missionDescBudgetJustification': { title: 'Project Description' },
		'budgetActivityTitle': { title: 'Budget Activity Title' },
		'SubProj_Title': { title: 'Sub-project Title' },
		'Adj_OtherAdj_Title': { title: 'Other Title' },
		'CongAdds_Title': { title: 'CongAdds Title' },
		'Event_Title': { title: 'Event Title' },
		'JointFund_Title': { title: 'Joint Funding Title' },
		'OthProgFund_Title': { title: 'Other Program Title' },
		'appropriationTitle': { title: 'Appropriation Title' },

		//acomp
		'Accomp_Fund_PY_Text': { title: 'Accomp Fund PY Text' },
		'PlanPrgrm_Fund_CY_Text': { title: 'PlanPrgrm Fund CY Text' },
		'PlanPrgrm_Fund_BY1Base_Text': { title: 'PlanPrgrm Fund BY1Base Text' },
		'PlanPrgrm_Fund_BY10C0_Text': { title: 'PlanPrgrm Fund BY10C0 Text' },
		'PlanPrgrm_Fund_BY1_Text': { title: 'PlanPrgrm Fund BY1 Text' },


		// pdoc
		'projectTitle2': { title: 'Project Title 2' },
		'budgetLineItem': { title: 'Budget Line Item (Description)' },
		'programDescription': { title: 'Program Description' },
		'P3a-16_Title': { title: 'P3a-16 Title' },
		'P3a-19_ModItem_Title': { title: 'P3a-19 ModItem Title' },
		'P40-13_BSA_Title': { title: 'P40-13_BSA Title' },
		'P40-15_Justification': { title: 'P40-15_Justification' },
		'P40a-14_Title': { title: 'P40a-14 Title' },
		'P40a-16_Title': { title: 'P40a-16 Title' },
		'P5-14_Item_Title': { title: 'P5-14 Item Title' },
		'P5-16_Item_Title': { title: 'P5-16 Item Title' },
		'P40-11_BA_Title': { title: 'P40-11 BA Title' },
		'P3a-20_Milestone_Desc': { title: 'P3a-20_Milestone_Desc' },

		// odoc 
		'budgetLineItemTitle': { title: 'Budget Line Item Title' },

		// rdoc
		// 'projectNotes': {title: 'Project Notes'},
		// 'projectAquisitionStrategy': {title: 'Project Aquisition Strategy'},
		// 'projectPerformanceMetrics': {title: 'Project Performance Metrics'},
		// 'otherProgramFundSummaryRemarks': {title: 'Other Program Funded Summary Remarks'},

	};


	if (projectData.review && projectData.review.budgetType === 'rdoc') {
		titleMapping['missionDescBudgetJustification'] = { title: 'Program Mission Description' };
		titleMapping['projectMissionDescription'] = { title: 'Project Mission Description' };
		titleMapping['projectNotes'] = { title: 'Project Notes' };
		titleMapping['projectAquisitionStrategy'] = { title: 'Project Acquisition Strategy' };
		titleMapping['projectPerformanceMetrics'] = { title: 'Project Performance Metrics' };
		titleMapping['otherProgramFundingSummaryRemarks'] = { title: 'Other Program Funding Summary Remarks' };
	}

	Object.keys(titleMapping).forEach(key => {
		if (projectData[key]) {
			tmpProjectDescriptions.push({ ...titleMapping[key], value: projectData[key] });
		}
	});

	console.log(tmpProjectDescriptions);

	return tmpProjectDescriptions;
};

const Contracts = (props) => {
	const { contracts } = props;
	const contractTables = [];

	for (const contract of contracts) {
		const contractCols = [
			{
				Key: 'Parent Award',
				Value: contract.parentAward
			},
			{
				Key: 'PIIN',
				Value: contract.piin
			},
			{
				Key: 'Award Description',
				Value: contract.awardDesc
			},
			{
				Key: 'Product or Service Description',
				Value: contract.productDesc
			},
			{
				Key: 'Total Base and All Options Value',
				Value: contract.totalObligatedAmount,
			},
			{
				Key: 'Mod Number',
				Value: contract.modNumber
			}
		];

		contractTables.push(
			<SimpleTable tableClass={'magellan-table'}
				zoom={1}
				rows={boldKeys(contractCols)}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={<div style={{ display: 'flex', justifyContent: 'space-between' }}><div>Vendor: {contract.vendorName}</div><div>Fiscal Year: {contract.fiscalYear ?? 'N/A'}</div></div>}
				headerExtraStyle={{
					backgroundColor: '#313541',
					color: 'white'
				}}
				hideSubheader={true}
				firstColWidth={firstColWidth}
			/>
		);
	}

	return (
		<StyledTableContainer>
			{contractTables}
		</StyledTableContainer>
	);
};

const NavButtons = (props) => {
	const buttonNames = ['The Basics', 'Accomplishment', 'Contracts', 'Primary Reviewer Section', 'Service / DoD Component Reviewer Section', 'POC Reviewer Section'];
	const navButtons = [];

	const [currentNav, setCurrentNav] = useState('The Basics');

	buttonNames.forEach((name, index) => {
		navButtons.push(
			<StyledNavButton
				key={name + index}
				first={index === 0}
				last={index === navButtons.length - 1}
				selected={currentNav === name}
				onClick={() => {
					setCurrentNav(name);
					const element = document.getElementById(name);
					if (element) {
						element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
					}
				}
				}
			>
				{name}
			</StyledNavButton>
		);
	});

	return navButtons;
};

const renderKeywordCheckboxes = (keywordsChecked, keywordCheckboxes, setKeywordCheck) => {
	const checkboxes = [];
	for (const name of keywordCheckboxes) {
		checkboxes.push(
			<FormControlLabel
				name={name}
				value={name}
				style={{ margin: '0 20px 0 0' }}
				control={<Checkbox
					style={{
						backgroundColor: '#ffffff',
						borderRadius: '5px',
						padding: '2px',
						border: '2px solid #bdccde',
						pointerEvents: 'none',
						margin: '2px 5px 0px'
					}}
					onClick={() => setKeywordCheck(name)}
					icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
					checked={keywordsChecked && keywordsChecked.length && keywordsChecked.indexOf(name) !== -1}
					checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
					name={name}
				/>}
				label={<span style={{ fontSize: 13, margin: '0 5px', fontWeight: 600 }}>{name}</span>}
				labelPlacement="end"
			/>
		);
	}

	return checkboxes;
};

const getMetadataTableData = (projectData, budgetType, projectNum, reviewData, keywordsChecked, keywordCheckboxes, setKeywordCheck) => {

	const metadata = [
		{
			Key: 'Project',
			Value: projectData.projectTitle || 'N/A',
		},
		{
			Key: 'Program Element',
			Value: projectData.programElement || 'N/A',
			Hidden: budgetType === 'Procurement'
		},
		{
			Key: 'Service Agency Name',
			Value: projectData.serviceAgency || 'N/A',
		},
		{
			Key: 'Project Number',
			Value: projectNum || 'N/A',
			Hidden: budgetType === 'Procurement'
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
			Value: `${parseInt(projectData.budgetYear) + (budgetType === 'Procurement' ? 3 : 2)}` || 'N/A',
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
			Value: getClassLabel(reviewData)
		},
		{
			Key: 'Keywords',
			Value: <div>
				{keywordCheckboxes && keywordCheckboxes.length > 0 ? renderKeywordCheckboxes(keywordsChecked, keywordCheckboxes, setKeywordCheck) : 'None'}
			</div>,
		},
		{
			Key: <div style={{ display: 'flex', alignItems: 'center' }}>Cumulative Obligations<Tooltip title={'Metadata above reflects data at the BLI level'}><InfoOutlinedIcon style={{ margin: '-2px 6px' }} /></Tooltip></div>,
			Value: projectData.obligations && projectData.obligations[0] ? `${(projectData.obligations[0].cumulativeObligations / 1000000).toLocaleString('en-US')} $M` : 'N/A'
		},
		{
			Key: <div style={{ display: 'flex', alignItems: 'center' }}>Cumulative Expenditures<Tooltip title={'Metadata above reflects data at the BLI level'}><InfoOutlinedIcon style={{ margin: '-2px 6px' }} /></Tooltip></div>,
			Value: projectData.obligations && projectData.obligations[0] ? `${(projectData.obligations[0].cumulativeDisbursements / 1000000).toLocaleString('en-US')} $M` : 'N/A'
		},
	];

	return metadata;
};

const renderTitle = (projectData, programElement, projectNum) => {
	const projectTitle = projectData.projectTitle ?? projectData.budgetLineItemTitle;
	const service = projectData.serviceAgency;
	return `${projectTitle && projectTitle !== 'undefined' ? `${projectTitle}` : ''} ${programElement && programElement !== 'undefined' ? `${programElement} ` : ''} ${service && service !== 'undefined' ? `${service}` : ''} ${projectNum && projectNum !== 'undefined' ? `${projectNum} ` : ''}`;
};


export {
	Accomplishments,
	aggregateProjectDescriptions,
	boldKeys,
	Contracts,
	firstColWidth,
	formatNum,
	getMetadataTableData,
	NavButtons,
	renderTitle,
	BasicData,
	Metadata,
	ProjectDescription,
	SideNav
};