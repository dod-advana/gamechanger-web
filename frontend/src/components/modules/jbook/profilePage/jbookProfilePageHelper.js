import React, { useState, useContext } from 'react';
import { PieChart, Pie, Label } from 'recharts';
import SimpleTable from '../../../common/SimpleTable';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import {
	StyledTableContainer,
	StyledNavButton,
	StyledNavBar,
	StyledNavContainer,
	StyledLeftContainer,
	StyledSideNavContainer,
} from './profilePageStyles';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import sanitizeHtml from 'sanitize-html';
import SideNavigation from '../../../navigation/SideNavigation';
import { getClassLabel, getTotalCost, formatNum } from '../../../../utils/jbookUtilities';
import { JBookContext } from '../jbookContext';

const firstColWidth = {
	maxWidth: 150,
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const boldKeys = (data) => {
	return data.map((pair) => {
		pair.Key = <strong>{pair.Key}</strong>;
		return pair;
	});
};

const SideNav = ({ budgetType, budgetYear, context }) => {
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

				<StyledSideNavContainer></StyledSideNavContainer>
			</StyledNavBar>
			<SideNavigation context={context} />
		</>
	);
};

const BasicData = (props) => {
	const { budgetType } = props;

	const context = useContext(JBookContext);
	const { state } = context;
	const { projectData, reviewData } = state;

	return (
		<>
			<SimpleTable
				tableClass={'magellan-table'}
				zoom={1}
				rows={[
					{
						Key: 'Category',
						Value: getClassLabel(reviewData),
					},
					{
						Key: 'Budget Line Item',
						Value: projectData.budgetLineItem,
						Hidden: budgetType === 'RDT&E',
					},
					{
						Key: 'Budget Activity Number',
						Value: projectData.budgetActivityNumber,
					},
					{
						Key: 'Appropriations Number',
						Value: projectData.appropriationNumber,
					},
					{
						Key: 'Program Element',
						Value: projectData.programElement,
						Hidden: budgetType === 'Procurement',
					},
					{
						Key: 'Project Number',
						Value: projectData.projectNum,
						Hidden: budgetType === 'Procurement',
					},
				]}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={'Basic Data'}
				headerExtraStyle={{
					backgroundColor: '#313541',
					color: 'white',
				}}
				hideSubheader={true}
				firstColWidth={firstColWidth}
			/>
		</>
	);
};

const ClassificationScoreCard = (props) => {
	const { scores } = props;

	return (
		<StyledLeftContainer>
			<div style={{ backgroundColor: 'rgb(239, 241, 246)', marginLeft: -6, marginRight: -8 }}>
				<Typography variant="h3" style={{ margin: '10px 10px 15px 10px', fontWeight: 'bold' }}>
					{`Classification Scorecard`}
				</Typography>
				{scores.map((score) => {
					return (
						<div style={{ backgroundColor: 'white', padding: '10px', margin: '10px 10px 15px 10px' }}>
							<Typography
								variant="h5"
								style={{ width: '100%', margin: '0 0 15px 0', fontWeight: 'bold' }}
							>
								{score.name}
							</Typography>
							<div style={{ display: 'flex' }}>
								<div style={{ flexGrow: 2 }}>
									<div>{score.description}</div>
									{score.timestamp && <div>Timestamp: {score.timestamp}</div>}
									{score.justification && <div>{score.justification}</div>}{' '}
								</div>
								{score.value !== undefined && (
									<div style={{ flexGrow: 1, padding: '10px' }}>
										<PieChart width={100} height={100}>
											<Pie
												data={[
													{
														name: 'score',
														value: 100 - score.value * 100,
														fill: 'rgb(166, 206, 227)',
													},
													{
														name: 'score',
														value: score.value * 100,
														fill: 'rgb(32, 119, 180)',
													},
												]}
												dataKey="value"
												nameKey="name"
												cx="50%"
												cy="50%"
												innerRadius={25}
												outerRadius={40}
											>
												<Label value={score.value} position="center" />
											</Pie>
										</PieChart>
									</div>
								)}
							</div>
							<hr />
							<div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
								<ThumbDownOffAltIcon style={{ marginRight: '5px' }} />
								<ThumbUpOffAltIcon style={{ marginRight: '5px' }} />
							</div>
						</div>
					);
				})}
			</div>
		</StyledLeftContainer>
	);
};

const Metadata = ({ budgetType, keywordCheckboxes, setKeywordCheck }) => {
	const context = useContext(JBookContext);
	const { state } = context;
	const { projectData, reviewData, keywordsChecked } = state;

	return (
		<SimpleTable
			tableClass={'magellan-table'}
			zoom={1}
			rows={
				projectData
					? getMetadataTableData(
							projectData,
							budgetType,
							reviewData,
							keywordsChecked,
							keywordCheckboxes,
							setKeywordCheck
					  )
					: []
			}
			height={'auto'}
			dontScroll={true}
			disableWrap={true}
			title={`Budget Year (FY) ${projectData.budgetYear || ''}`}
			headerExtraStyle={{
				backgroundColor: '#313541',
				color: 'white',
			}}
			hideSubheader={true}
			firstColWidth={firstColWidth}
		/>
	);
};

const ProjectDescription = ({ profileLoading, projectData, programElement, projectNum, projectDescriptions }) => {
	return (
		<>
			{profileLoading ? (
				<LoadingIndicator customColor={'#1C2D64'} style={{ width: '50px', height: '50px' }} />
			) : (
				<>
					<Typography variant="h2" style={{ width: '100%', margin: '0 0 15px 0', fontWeight: 'bold' }}>
						{renderTitle(projectData, programElement, projectNum)}
					</Typography>
					<div style={{ overflow: 'auto' }}>
						<Typography variant="subtitle1" style={{ fontSize: '16px', margin: '10px 0' }}>
							{projectDescriptions.map((pd) => {
								return (
									<>
										<Typography
											key={pd.title}
											variant="h3"
											style={{ fontWeight: 'bold', width: '100%' }}
										>
											{pd.title}
										</Typography>
										<blockquote
											style={{ borderLeft: 'none' }}
											dangerouslySetInnerHTML={{
												__html: sanitizeHtml(pd.value, {
													allowedAttributes: { span: ['style'] },
												}),
											}}
										/>
									</>
								);
							})}
						</Typography>
					</div>
				</>
			)}
		</>
	);
};

const Accomplishments = ({ accomplishments }) => {
	return (
		<StyledTableContainer>
			{accomplishments.map((accomp) => {
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
							color: 'white',
						}}
						hideSubheader={true}
						firstColWidth={{
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							width: 60,
						}}
						useInnerHtml={true}
					/>
				);
			})}
		</StyledTableContainer>
	);
};

const aggregateProjectDescriptions = (projectData) => {
	let tmpProjectDescriptions = [];

	const titleMapping = {
		// both or rdoc
		appropriationTitle: { title: 'Appropriation Title' },
		budgetActivityTitle: { title: 'Budget Activity Title' },
		programElementTitle: { title: 'Program Element Title' },
		projectTitle: { title: 'Budget Line Item Title' },
		projectMissionDescription: { title: 'Description' },
		missionDescBudgetJustification: { title: 'Project Description' },
		SubProj_Title: { title: 'Sub-project Title' },
		Adj_OtherAdj_Title: { title: 'Other Title' },
		CongAdds_Title: { title: 'CongAdds Title' },
		Event_Title: { title: 'Event Title' },
		JointFund_Title: { title: 'Joint Funding Title' },
		OthProgFund_Title: { title: 'Other Program Title' },

		//acomp
		Accomp_Fund_PY_Text: { title: 'Accomp Fund PY Text' },
		PlanPrgrm_Fund_CY_Text: { title: 'PlanPrgrm Fund CY Text' },
		PlanPrgrm_Fund_BY1Base_Text: { title: 'PlanPrgrm Fund BY1Base Text' },
		PlanPrgrm_Fund_BY10C0_Text: { title: 'PlanPrgrm Fund BY10C0 Text' },
		PlanPrgrm_Fund_BY1_Text: { title: 'PlanPrgrm Fund BY1 Text' },

		// pdoc
		projectTitle2: { title: 'Project Title 2' },
		programDescription: { title: 'Program Description' },
		'P3a-16_Title': { title: 'P3a-16 Title' },
		'P3a-19_ModItem_Title': { title: 'P3a-19 ModItem Title' },
		'P40-13_BSA_Title': { title: 'P40-13_BSA Title' },
		'P40-15_Justification': { title: 'Justification' },
		'P40a-14_Title': { title: 'P40a-14 Title' },
		'P40a-16_Title': { title: 'P40a-16 Title' },
		'P5-14_Item_Title': { title: 'P5-14 Item Title' },
		'P5-16_Item_Title': { title: 'P5-16 Item Title' },
		'P40-11_BA_Title': { title: 'P40-11 BA Title' },
		'P3a-20_Milestone_Desc': { title: 'P3a-20_Milestone_Desc' },

		// odoc
		budgetLineItemTitle: { title: 'Budget Line Item Title' },

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

	Object.keys(titleMapping).forEach((key) => {
		if (projectData[key]) {
			tmpProjectDescriptions.push({ ...titleMapping[key], value: projectData[key] });
		}
	});

	return tmpProjectDescriptions;
};

const Contracts = (props) => {
	const { contracts } = props;
	const contractTables = [];

	for (const contract of contracts) {
		const contractCols = [
			{
				Key: 'Parent Award',
				Value: contract.parent_award_s,
			},
			{
				Key: 'PIIN',
				Value: contract.piin_s,
			},
			{
				Key: 'Award Description',
				Value: contract.award_desc_s,
			},
			{
				Key: 'Product or Service Description',
				Value: contract.product_desc_s,
			},
			{
				Key: 'Total Base and All Options Value',
				Value: contract.total_oblig_amount_s,
			},
			{
				Key: 'Mod Number',
				Value: contract.modification_number_s,
			},
		];

		contractTables.push(
			<SimpleTable
				tableClass={'magellan-table'}
				zoom={1}
				rows={boldKeys(contractCols)}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={
					<div style={{ display: 'flex', justifyContent: 'space-between' }}>
						<div>Vendor: {contract.vendor_name_s}</div>
						<div>Fiscal Year: {contract.fiscal_year_s ?? 'N/A'}</div>
					</div>
				}
				headerExtraStyle={{
					backgroundColor: '#313541',
					color: 'white',
				}}
				hideSubheader={true}
				firstColWidth={firstColWidth}
			/>
		);
	}

	return <StyledTableContainer>{contractTables}</StyledTableContainer>;
};

const NavButtons = () => {
	const buttonNames = [
		'The Basics',
		'Accomplishment',
		'Contracts',
		'Primary Reviewer Section',
		'Service / DoD Component Reviewer Section',
		'POC Reviewer Section',
	];
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
				}}
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
				control={
					<Checkbox
						style={{
							backgroundColor: '#ffffff',
							borderRadius: '5px',
							padding: '2px',
							border: '2px solid #bdccde',
							pointerEvents: 'none',
							margin: '2px 5px 0px',
						}}
						onClick={() => setKeywordCheck(name)}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={keywordsChecked && keywordsChecked.length && keywordsChecked.indexOf(name) !== -1}
						checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
						name={name}
					/>
				}
				label={<span style={{ fontSize: 13, margin: '0 5px', fontWeight: 600 }}>{name}</span>}
				labelPlacement="end"
			/>
		);
	}

	return checkboxes;
};

const getFormattedTotalCost = (projectData) => {
	if (projectData.continuing) return 'Continuing';
	return projectData.totalCost ? `${formatNum(projectData.totalCost)}` : 'N/A';
};

const getTableFormattedCost = (cost) => {
	return cost ? `${formatNum(cost)}` : 'N/A';
};

const getMetadataTableData = (
	projectData,
	budgetType,
	reviewData,
	keywordsChecked,
	keywordCheckboxes,
	setKeywordCheck
) => {
	return [
		{
			Key: 'Current Year Amount',
			Value: getTableFormattedCost(projectData.currentYearAmount),
		},
		{
			Key: 'Prior Year Amount',
			Value: getTableFormattedCost(projectData.priorYearAmount),
		},
		{
			Key: 'All Prior Years Amount',
			Value: getTableFormattedCost(projectData.allPriorYearsAmount),
		},
		{
			Key: 'Total Cost',
			Value: getFormattedTotalCost(projectData),
		},
		{
			Key: 'BY2',
			Value: getTableFormattedCost(projectData.p4082_toa_by2_d || projectData.proj_fund_by2_d),
		},
		{
			Key: 'BY3',
			Value: getTableFormattedCost(projectData.p4083_toa_by3_d || projectData.proj_fund_by3_d),
		},
		{
			Key: 'BY4',
			Value: getTableFormattedCost(projectData.p4084_toa_by4_d || projectData.proj_fund_by4_d),
		},
		{
			Key: 'BY5',
			Value: getTableFormattedCost(projectData.p4085_toa_by5_d || projectData.proj_fund_by5_d),
		},
		{
			Key: 'Program Element',
			Value: projectData.programElement || 'N/A',
			Hidden: budgetType === 'Procurement',
		},
		{
			Key: 'Service Agency Name',
			Value: projectData.serviceAgency || 'N/A',
		},
		{
			Key: 'To Complete',
			Value: `${parseInt(projectData.budgetYear) + (budgetType === 'Procurement' ? 3 : 2)}` || 'N/A',
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
			Value: getClassLabel(reviewData),
		},
		{
			Key: 'Keywords',
			Value: (
				<div>
					{keywordCheckboxes && keywordCheckboxes.length > 0
						? renderKeywordCheckboxes(keywordsChecked, keywordCheckboxes, setKeywordCheck)
						: 'None'}
				</div>
			),
		},
	];
};

const renderTitle = (projectData, programElement, projectNum) => {
	const projectTitle = projectData.projectTitle ?? projectData.budgetLineItemTitle;
	const title = projectTitle && projectTitle !== 'undefined' ? `${projectTitle}` : '';
	const element = programElement && programElement !== 'undefined' ? `${programElement} ` : '';
	const service =
		projectData.serviceAgency && projectData.serviceAgency !== 'undefined' ? `${projectData.serviceAgency}` : '';
	const num = projectNum && projectNum !== 'undefined' ? `${projectNum} ` : '';
	const budgetLineItem = projectData.budgetLineItem ? `${projectData.budgetLineItem}:` : '';
	return `${budgetLineItem} ${title} ${element} ${service} ${num}`;
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
	SideNav,
	ClassificationScoreCard,
};
