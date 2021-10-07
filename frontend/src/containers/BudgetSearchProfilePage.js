import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import SearchBar from '../components/searchBar/SearchBar';
import { getContext } from '../components/factories/contextFactory';
import GCAccordion from '../components/common/GCAccordion';
import {
	PieChart,
	Pie,
	ResponsiveContainer,
	Cell,
	Legend,
	Tooltip,
} from 'recharts';
import {
	TextField,
	Typography,
	Checkbox,
	FormControlLabel,
} from '@material-ui/core';
import SimpleTable from '../components/common/SimpleTable';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import GCPrimaryButton from '../components/common/GCButton';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

const StyledNavBar = styled.div`
	width: 100%;
	display: flex;
	height: 65px;
	background-color: #eff2f6;
	align-items: center;
	justify-content: center;
`;

const StyledNavContainer = styled.div`
	width: 75%;
	display: flex;
	flex-direction: row;
	height: 97%;
`;

const StyledNavButton = styled.div`
    background-color: ${({ selected }) => (selected ? '#1C2D64' : '')};
    color: ${({ selected }) => (selected ? 'white' : '#8A9AAD')};
    padding: 5px 18px
    font-weight: 600;
    border-left: ${({ first }) => (first ? '' : '2px solid white')}
    border-right: ${({ last }) => (last ? '' : '2px solid white')}
    text-align: center;
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 13px;
`;

const StyledContainer = styled.div`
	display: flex;
	width: 100%;
	height: 100%;
`;

const StyledLeftContainer = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	padding: 20px 10px 20px 25px;
`;

const StyledMainContainer = styled.div`
	display: flex;
	flex: 2;
	flex-direction: column;
	padding: 20px;
`;

const StyledRightContainer = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	padding: 20px;
`;

const StyledAccordionDiv = styled.div`
	padding: ${({ padding }) => padding ?? '0'};
	width: 100%;
`;

const StyledAIText = styled.div`
	padding: 10px 30px;
`;

const StyledReviewContainer = styled.div`
	display: flex;
`;

const StyledReviewLeftContainer = styled.div`
	display: flex;
	flex: 3;
	flex-direction: column;
	padding: 20px;
`;

const StyledReviewRightContainer = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	padding: 20px;
`;

const StyledTableContainer = styled.div`
	padding: 20px;
	display: flex;
	flex-direction: column;
	width: 100%;
	text-align: left;
`;

const StyledAccordionContainer = styled.div`
	width: 100%;
	margin: 0 0 15px 0;
`;

const StyledTableKeyContainer = styled.div`
	width: 100%;
	height: 100%;
	padding: 10px;
`;

const StyledTableValueContainer = styled.div`
	padding: 15px;
`;

const StyledCheckboxContainer = styled.div`
	display: flex;
	flex-direction: column;
	margin: 10px 0;
`;

const StyledInlineContainer = styled.div`
	display: flex;
	align-items: center;
	margin: 20px 0;
	justify-content: ${({ justifyContent }) => justifyContent ?? 'space-between'};
`;

const StyledFooterDiv = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
`;

const StyledAccordionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
`;

const firstColWidth = {
	maxWidth: 100,
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const samplePieData = [
	{
		type: 'AI-Enabled',
		value: 54,
		color: '#1C2D64',
	},
	{
		type: 'AI-Enabling',
		value: 30,
		color: '#59C5CA',
	},
	{
		type: 'Core-AI',
		value: 26,
		color: '#7CB458',
	},
];

const sampleMetadata = [
	{
		Key: 'Program POC',
		Value: 'First Name, Last Name, Position, Agency',
	},
	{
		Key: 'Project',
		Value: '000000',
	},
	{
		Key: 'Program POC',
		Value: 'First Name, Last Name, Position, Agency',
	},
	{
		Key: 'Program POC',
		Value: 'First Name, Last Name, Position, Agency',
	},
	{
		Key: 'Program POC',
		Value: 'First Name, Last Name, Position, Agency',
	},
	{
		Key: 'Program POC',
		Value: 'First Name, Last Name, Position, Agency',
	},
	{
		Key: 'Program POC',
		Value: 'First Name, Last Name, Position, Agency',
	},
	{
		Key: 'Program POC',
		Value: 'First Name, Last Name, Position, Agency',
	},
	{
		Key: 'Program POC',
		Value: 'First Name, Last Name, Position, Agency',
	},
	{
		Key: 'Program POC',
		Value: 'First Name, Last Name, Position, Agency',
	},
	{
		Key: 'Program POC',
		Value: 'First Name, Last Name, Position, Agency',
	},
	{
		Key: 'Program POC',
		Value: 'First Name, Last Name, Position, Agency',
	},
	{
		Key: 'Program POC',
		Value: 'First Name, Last Name, Position, Agency',
	},
];

const sampleAccomplishmentData = [
	{
		Key: 'Description',
		Value:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra blandit est, hendrerit luctus tortor sollicitudin ut. Donec vulputate quam in elit hendrerit, vitae iaculis est tristique. Sed condimentum enim at enim venenatis, non suscipit urna lobortis. Sed quis risus vulputate, porta orci eget, cursus sem. Mauris non sodales nunc.',
	},
	{
		Key: 'Budget',
		Value: '00,000 $M',
	},
];

const sampleVendorData = [
	{
		Key: 'Consolidated Award',
		Value: '00000000',
	},
	{
		Key: 'Parent Award',
		Value: '00000000',
	},
	{
		Key: 'PIIN',
		Value: '00000000',
	},
	{
		Key: 'Award Description',
		Value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
	},
	{
		Key: 'Fiscal Year',
		Value: '2020',
	},
	{
		Key: 'Budget Activity',
		Value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
	},
	{
		Key: 'Reimbursable',
		Value: 'Nan',
	},
	{
		Key: 'Product or Service Code Description',
		Value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
	},
];

const jaicReviewData = [
	{
		Key: 'Reviewers',
		Value: (
			<Autocomplete
				size="small"
				options={[]}
				getOptionLabel={(option) => option.title}
				style={{ width: 300 }}
				renderInput={(params) => (
					<TextField {...params} label="Select" variant="outlined" />
				)}
			/>
		),
	},
	{
		Key: 'Core AI Analysis',
		Value: (
			<Autocomplete
				size="small"
				options={[]}
				getOptionLabel={(option) => option.title}
				style={{ width: 300, backgroundColor: 'white' }}
				renderInput={(params) => (
					<TextField {...params} label="Select" variant="outlined" />
				)}
			/>
		),
	},
	{
		Key: 'Service/DoD Component Reviewer',
		Value: (
			<Autocomplete
				size="small"
				options={[]}
				getOptionLabel={(option) => option.title}
				style={{ width: 300, backgroundColor: 'white' }}
				renderInput={(params) => (
					<TextField {...params} label="Select" variant="outlined" />
				)}
			/>
		),
	},
	{
		Key: 'Review Status',
		Value: (
			<Autocomplete
				size="small"
				options={[]}
				getOptionLabel={(option) => option.title}
				style={{ width: 300, backgroundColor: 'white' }}
				renderInput={(params) => (
					<TextField {...params} label="Select" variant="outlined" />
				)}
			/>
		),
	},
	{
		Key: 'Planned Transition Partner',
		Value: (
			<Autocomplete
				size="small"
				options={[]}
				getOptionLabel={(option) => option.title}
				style={{ width: 300, backgroundColor: 'white' }}
				renderInput={(params) => (
					<TextField {...params} label="Select" variant="outlined" />
				)}
			/>
		),
	},
	{
		Key: 'Current Mission Partners (Academia, Industry, or Other)',
		Value: (
			<>
				<Autocomplete
					size="small"
					options={[]}
					getOptionLabel={(option) => option.title}
					style={{ width: 300, backgroundColor: 'white' }}
					renderInput={(params) => (
						<TextField {...params} label="Select" variant="outlined" />
					)}
				/>
				<TextField
					placeholder="Reviewer Notes"
					variant="outlined"
					defaultValue={''}
					style={{
						backgroundColor: 'white',
						width: '100%',
						margin: '15px 0 0 0',
					}}
					onBlur={() => {}}
					inputProps={{
						style: {
							width: '100%',
						},
					}}
					rows={10}
					multiline
				/>
			</>
		),
	},
];

const renderMissionPartnerCheckboxes = () => {
	const missionPartners = [
		'Alion Science and Technology Corporation',
		'Austal USA LLC',
		'General Dynamics Corporation',
		'Innovative Professional Solutions Inc.',
		'Johns Hopkins University',
		'Raytheon Company',
		'Saic Gemini Inc.',
		'Technical Systems Integration Inc.',
		'Textron Inc.',
	];
	const checkboxes = [];
	for (const name of missionPartners) {
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
						onClick={() => {}}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={true}
						checkedIcon={
							<i style={{ color: '#E9691D' }} className="fa fa-check" />
						}
						name={name}
					/>
				}
				label={
					<span style={{ fontSize: 13, margin: '0 5px', fontWeight: 600 }}>
						{name}
					</span>
				}
				labelPlacement="end"
			/>
		);
	}

	return checkboxes;
};

const serviceReviewData = [
	{
		Key: (
			<StyledTableKeyContainer>
				<strong>AI Labeling</strong>
			</StyledTableKeyContainer>
		),
		Value: (
			<StyledTableValueContainer>
				<StyledInlineContainer>
					<Typography variant="subtitle1" style={{ fontSize: 16 }}>
						Do you agree with the JAIC's labeling of "Not AI" for this effort?
					</Typography>
					<Autocomplete
						size="small"
						options={[]}
						getOptionLabel={(option) => option.title}
						renderInput={(params) => (
							<TextField {...params} label="Select" variant="outlined" />
						)}
					/>
				</StyledInlineContainer>
				<StyledInlineContainer>
					<Typography variant="subtitle1" style={{ fontSize: 16 }}>
						If you don't agree, how would you label this effort?{' '}
					</Typography>
					<Autocomplete
						size="small"
						options={[]}
						getOptionLabel={(option) => option.title}
						renderInput={(params) => (
							<TextField {...params} label="Select" variant="outlined" />
						)}
					/>
				</StyledInlineContainer>
			</StyledTableValueContainer>
		),
	},
	{
		Key: (
			<StyledTableKeyContainer>
				<strong>Transition Partners</strong>
			</StyledTableKeyContainer>
		),
		Value: (
			<StyledTableValueContainer>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						margin: '20px 0',
					}}
				>
					<Typography variant="subtitle1" style={{ fontSize: 16 }}>
						Is the transition partner known for this effort?
					</Typography>
					<Autocomplete
						style={{ backgroundColor: 'white' }}
						size="small"
						options={[]}
						getOptionLabel={(option) => option.title}
						renderInput={(params) => (
							<TextField {...params} label="Select" variant="outlined" />
						)}
					/>
				</div>
			</StyledTableValueContainer>
		),
	},
	{
		Key: (
			<StyledTableKeyContainer>
				<strong>Academic/Industry Mission Partners</strong>
				<Typography variant="subtitle1" style={{ fontSize: 14 }}>
					Please uncheck any academic or industry mission partners not
					applicable for this effort
				</Typography>
			</StyledTableKeyContainer>
		),
		Value: (
			<StyledTableValueContainer>
				<Typography variant="subtitle1" style={{ fontSize: 16 }}>
					Based on our analysis of contract data, here are the identified
					academic and industry mission partners.
				</Typography>
				<StyledCheckboxContainer>
					{renderMissionPartnerCheckboxes()}
				</StyledCheckboxContainer>
				<Typography variant="subtitle1" style={{ fontSize: 16 }}>
					Are there any mission partners not listed above (please list using
					commas):
				</Typography>
				<TextField
					placeholder=""
					variant="outlined"
					defaultValue={''}
					style={{
						backgroundColor: 'white',
						width: '100%',
						margin: '15px 0 0 0',
					}}
					onBlur={() => {}}
					inputProps={{
						style: {
							width: '100%',
						},
					}}
				/>
			</StyledTableValueContainer>
		),
	},
	{
		Key: (
			<StyledTableKeyContainer>
				<strong>AI Point of Contact (POC) for Effort</strong>
				<Typography variant="subtitle1" style={{ fontSize: 14 }}>
					If available, please share the appropriate AI POC for this effort.
				</Typography>
			</StyledTableKeyContainer>
		),
		Value: (
			<StyledTableValueContainer>
				<StyledInlineContainer justifyContent={'left'}>
					<Typography
						variant="subtitle1"
						style={{ fontSize: 16, marginRight: 20, width: 90 }}
					>
						POC Title
					</Typography>
					<TextField
						placeholder="Title"
						variant="outlined"
						defaultValue={''}
						style={{ backgroundColor: 'white', width: '40%' }}
						onBlur={() => {}}
						size="small"
					/>
				</StyledInlineContainer>
				<StyledInlineContainer justifyContent={'left'}>
					<Typography
						variant="subtitle1"
						style={{ fontSize: 16, marginRight: 20, width: 90 }}
					>
						POC Name
					</Typography>
					<TextField
						placeholder="Name"
						variant="outlined"
						defaultValue={''}
						style={{ backgroundColor: 'white', width: '40%' }}
						onBlur={() => {}}
						size="small"
					/>
				</StyledInlineContainer>
				<StyledInlineContainer justifyContent={'left'}>
					<Typography
						variant="subtitle1"
						style={{ fontSize: 16, marginRight: 20, width: 90 }}
					>
						POC Email
					</Typography>
					<TextField
						placeholder="Email"
						variant="outlined"
						defaultValue={''}
						style={{ backgroundColor: 'white', width: '40%' }}
						onBlur={() => {}}
						size="small"
					/>
				</StyledInlineContainer>
			</StyledTableValueContainer>
		),
	},
	{
		Key: (
			<StyledTableKeyContainer>
				<strong>Reviewer Notes</strong>
			</StyledTableKeyContainer>
		),
		Value: (
			<StyledTableValueContainer>
				<TextField
					placeholder="Reviewer Notes"
					variant="outlined"
					defaultValue={''}
					style={{ backgroundColor: 'white', width: '100%' }}
					onBlur={() => {}}
					inputProps={{
						style: {
							width: '100%',
						},
					}}
					rows={6}
					multiline
				/>
			</StyledTableValueContainer>
		),
	},
];

const boldKeys = (data) => {
	return data.map((pair) => {
		pair.Key = <strong>{pair.Key}</strong>;
		return pair;
	});
};

const renderAICategory = () => {
	return (
		<StyledAccordionDiv>
			<ResponsiveContainer width="100%" height={300}>
				<PieChart width={300} height={300}>
					<Pie
						innerRadius={60}
						outerRadius={80}
						data={samplePieData}
						cx="50%"
						cy="50%"
						dataKey="value"
						nameKey="type"
						label
					>
						<text x={'50%'} y={'50%'} dy={8} textAnchor="middle">
							76$M
						</text>
						{samplePieData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={samplePieData[index].color} />
						))}
					</Pie>
					<Legend />
					<Tooltip />
				</PieChart>
			</ResponsiveContainer>
			<hr style={{ margin: '10px auto', width: '85%' }} />
			<StyledAIText>
				<p align="left">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra
					blandit est, hendrerit luctus tortor sollicitudin ut. Donec vulputate
					quam in elit hendrerit, vitae iaculis est tristique. Sed condimentum
					enim at enim venenatis, non suscipit urna lobortis. Sed quis risus
					vulputate, porta orci eget, cursus sem. Mauris non sodales nunc.
				</p>
			</StyledAIText>
		</StyledAccordionDiv>
	);
};

const renderUserSummaryInput = () => {
	return (
		<StyledAccordionDiv padding="15px">
			<TextField
				placeholder="AI Summary from User"
				variant="outlined"
				defaultValue={''}
				style={{ backgroundColor: 'white', width: '100%' }}
				onBlur={() => {}}
				inputProps={{
					style: {
						width: '100%',
					},
				}}
				rows={10}
				multiline
			/>
		</StyledAccordionDiv>
	);
};

const renderClassifier = () => {
	return <StyledAccordionDiv></StyledAccordionDiv>;
};

const renderOtherProjects = () => {
	return <StyledAccordionDiv></StyledAccordionDiv>;
};

const renderMissionPartners = () => {
	return <StyledAccordionDiv></StyledAccordionDiv>;
};

const renderVendors = () => {
	return (
		<StyledTableContainer>
			<SimpleTable
				tableClass={'magellan-table'}
				zoom={1}
				rows={boldKeys(sampleVendorData)}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={'Vendor Name: Lorem Ipsum'}
				headerExtraStyle={{
					backgroundColor: '#313541',
					color: 'white',
				}}
				hideSubheader={true}
				firstColWidth={firstColWidth}
			/>
			<SimpleTable
				tableClass={'magellan-table'}
				zoom={1}
				rows={boldKeys(sampleVendorData)}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={'Vendor Name: Lorem Ipsum'}
				headerExtraStyle={{
					backgroundColor: '#313541',
					color: 'white',
				}}
				hideSubheader={true}
				firstColWidth={firstColWidth}
			/>
		</StyledTableContainer>
	);
};

const renderAccomplishments = () => {
	return (
		<StyledTableContainer>
			<SimpleTable
				tableClass={'magellan-table'}
				zoom={1}
				rows={boldKeys(sampleAccomplishmentData)}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={'Accomplishment Name/Title'}
				headerExtraStyle={{
					backgroundColor: '#1C2D64',
					color: 'white',
				}}
				hideSubheader={true}
				firstColWidth={firstColWidth}
			/>
			<SimpleTable
				tableClass={'magellan-table'}
				zoom={1}
				rows={boldKeys(sampleAccomplishmentData)}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={'Accomplishment Name/Title'}
				hideSubheader={true}
				headerExtraStyle={{
					backgroundColor: '#1C2D64',
					color: 'white',
				}}
				firstColWidth={firstColWidth}
			/>
			<SimpleTable
				tableClass={'magellan-table'}
				zoom={1}
				rows={boldKeys(sampleAccomplishmentData)}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={'Accomplishment Name/Title'}
				headerExtraStyle={{
					backgroundColor: '#1C2D64',
					color: 'white',
				}}
				hideSubheader={true}
				firstColWidth={firstColWidth}
			/>
			<SimpleTable
				tableClass={'magellan-table'}
				zoom={1}
				rows={boldKeys(sampleAccomplishmentData)}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={'Accomplishment Name/Title'}
				headerExtraStyle={{
					backgroundColor: '#1C2D64',
					color: 'white',
				}}
				hideSubheader={true}
				firstColWidth={firstColWidth}
			/>
		</StyledTableContainer>
	);
};

const renderJAICReview = () => {
	return (
		<StyledTableContainer>
			<div style={{ margin: '0 0 15px 0' }}>
				<Typography
					variant="subtitle1"
					style={{ color: 'green', fontSize: '18px', textAlign: 'right' }}
				>
					Finished Review
				</Typography>
			</div>
			<SimpleTable
				tableClass={'magellan-table'}
				zoom={1}
				rows={boldKeys(jaicReviewData)}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={''}
				headerExtraStyle={{
					backgroundColor: '#313541',
					color: 'white',
				}}
				hideHeader={true}
				firstColWidth={firstColWidth}
			/>
			<StyledFooterDiv>
				<GCPrimaryButton
					style={{
						color: '#515151',
						backgroundColor: '#E0E0E0',
						borderColor: '#E0E0E0',
						height: '35px',
					}}
				>
					Submit and Go to Home
				</GCPrimaryButton>
				<GCPrimaryButton
					style={{
						color: 'white',
						backgroundColor: '#1C2D64',
						borderColor: '#1C2D64',
						height: '35px',
					}}
				>
					Submit
				</GCPrimaryButton>
			</StyledFooterDiv>
		</StyledTableContainer>
	);
};

const renderServiceReviewer = () => {
	return (
		<StyledTableContainer>
			<div style={{ margin: '0 0 15px 0' }}>
				<Typography
					variant="subtitle1"
					style={{ color: 'green', fontSize: '18px', textAlign: 'right' }}
				>
					Finished Review
				</Typography>
			</div>
			<SimpleTable
				tableClass={'magellan-table'}
				zoom={1}
				rows={boldKeys(serviceReviewData)}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={''}
				headerExtraStyle={{
					backgroundColor: '#313541',
					color: 'white',
				}}
				hideHeader={true}
				firstColWidth={firstColWidth}
			/>
			<StyledFooterDiv>
				<GCPrimaryButton
					style={{
						color: '#515151',
						backgroundColor: '#E0E0E0',
						borderColor: '#E0E0E0',
						height: '35px',
					}}
				>
					Save (Partial Review)
				</GCPrimaryButton>
				<GCPrimaryButton
					style={{
						color: '#515151',
						backgroundColor: '#E0E0E0',
						borderColor: '#E0E0E0',
						height: '35px',
					}}
				>
					Submit and Go to Home (Finished Review)
				</GCPrimaryButton>
				<GCPrimaryButton
					style={{
						color: 'white',
						backgroundColor: '#1C2D64',
						borderColor: '#1C2D64',
						height: '35px',
					}}
				>
					Submit
				</GCPrimaryButton>
			</StyledFooterDiv>
		</StyledTableContainer>
	);
};

const renderPOCReviewer = () => {
	return <StyledAccordionDiv></StyledAccordionDiv>;
};

const renderSecondaryReviewer = () => {
	return (
		<div style={{ padding: '0 15px 20px', width: '100%' }}>
			<StyledInlineContainer>
				<Typography
					variant="subtitle1"
					style={{ fontSize: 16, fontWeight: 500 }}
				>
					Do you agree with the Service / DoD Component's review for this effort
				</Typography>
				<Autocomplete
					size="small"
					options={[]}
					getOptionLabel={(option) => option.title}
					renderInput={(params) => (
						<TextField {...params} label="Select" variant="outlined" />
					)}
				/>
				<Typography
					variant="subtitle1"
					style={{
						color: '#F9B32D',
						fontSize: '18px',
						textAlign: 'right',
						fontWeight: 500,
					}}
				>
					Needs Review
				</Typography>
			</StyledInlineContainer>
			<StyledFooterDiv>
				<GCPrimaryButton
					style={{
						color: '#515151',
						backgroundColor: '#E0E0E0',
						borderColor: '#E0E0E0',
						height: '35px',
					}}
				>
					Submit and Go to Home
				</GCPrimaryButton>
				<GCPrimaryButton
					style={{
						color: 'white',
						backgroundColor: '#1C2D64',
						borderColor: '#1C2D64',
						height: '35px',
					}}
				>
					Submit
				</GCPrimaryButton>
			</StyledFooterDiv>
		</div>
	);
};

const BudgetSearchProfilePage = (props) => {
	const [currentNav, setCurrentNav] = useState('The Basics');
	const context = useContext(getContext('budgetSearch'));

	const renderNavButtons = () => {
		const buttonNames = [
			'The Basics',
			'Accomplishment',
			'Contracts',
			'JAIC Reviewer Section',
			'Service / DoD Component Reviewer Section',
			'POC Reviewer Section',
			'Secondary Reviewer Section',
		];
		const navButtons = [];
		buttonNames.forEach((name, index) => {
			navButtons.push(
				<StyledNavButton
					first={index === 0}
					last={index === navButtons.length - 1}
					selected={currentNav === name}
					onClick={() => setCurrentNav(name)}
				>
					{name}
				</StyledNavButton>
			);
		});

		return navButtons;
	};

	return (
		<div>
			<SearchBar context={context} />
			<StyledNavBar>
				<StyledNavContainer>{renderNavButtons()}</StyledNavContainer>
			</StyledNavBar>
			<StyledContainer>
				<StyledLeftContainer>
					<StyledAccordionContainer>
						<GCAccordion
							contentPadding={0}
							expanded={true}
							header={'AI Category'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'600'}
						>
							{renderAICategory()}
						</GCAccordion>
					</StyledAccordionContainer>
					<StyledAccordionContainer>
						<GCAccordion
							contentPadding={0}
							expanded={false}
							header={'Classifier'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'600'}
							style={{ width: '100%' }}
						>
							{renderClassifier()}
						</GCAccordion>
					</StyledAccordionContainer>
					<StyledAccordionContainer>
						<GCAccordion
							contentPadding={0}
							expanded={true}
							header={'User Summary on AI'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'600'}
						>
							{renderUserSummaryInput()}
						</GCAccordion>
					</StyledAccordionContainer>
					<StyledAccordionContainer>
						<GCAccordion
							contentPadding={0}
							expanded={true}
							header={'Other Projects'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'600'}
						>
							{renderOtherProjects()}
						</GCAccordion>
					</StyledAccordionContainer>
				</StyledLeftContainer>
				<StyledMainContainer>
					<Typography
						variant="h2"
						style={{ width: '100%', margin: '0 0 15px 0', fontWeight: 'bold' }}
					>
						187 0904759A Major T&E Investment
					</Typography>
					<Typography variant="subtitle1" style={{ fontSize: '16px' }}>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra
						blandit est, hendrerit luctus tortor sollicitudin ut. Donec
						vulputate quam in elit hendrerit, vitae iaculis est tristique. Sed
						condimentum enim at enim venenatis, non suscipit urna lobortis. Sed
						quis risus vulputate, porta orci eget, cursus sem. Mauris non
						sodales nunc.
					</Typography>
					<Typography variant="subtitle1" style={{ fontSize: '16px' }}>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra
						blandit est, hendrerit luctus tortor sollicitudin ut. Donec
						vulputate quam in elit hendrerit, vitae iaculis est tristique. Sed
						condimentum enim at enim venenatis, non suscipit urna lobortis. Sed
						quis risus vulputate, porta orci eget, cursus sem. Mauris non
						sodales nunc.
					</Typography>
					<Typography variant="subtitle1" style={{ fontSize: '16px' }}>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra
						blandit est, hendrerit luctus tortor sollicitudin ut. Donec
						vulputate quam in elit hendrerit, vitae iaculis est tristique. Sed
						condimentum enim at enim venenatis, non suscipit urna lobortis. Sed
						quis risus vulputate, porta orci eget, cursus sem. Mauris non
						sodales nunc.
					</Typography>
					<Typography variant="subtitle1" style={{ fontSize: '16px' }}>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra
						blandit est, hendrerit luctus tortor sollicitudin ut. Donec
						vulputate quam in elit hendrerit, vitae iaculis est tristique. Sed
						condimentum enim at enim venenatis, non suscipit urna lobortis. Sed
						quis risus vulputate, porta orci eget, cursus sem. Mauris non
						sodales nunc.
					</Typography>
					<Typography variant="subtitle1" style={{ fontSize: '16px' }}>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra
						blandit est, hendrerit luctus tortor sollicitudin ut. Donec
						vulputate quam in elit hendrerit, vitae iaculis est tristique. Sed
						condimentum enim at enim venenatis, non suscipit urna lobortis. Sed
						quis risus vulputate, porta orci eget, cursus sem. Mauris non
						sodales nunc.
					</Typography>
				</StyledMainContainer>
				<StyledRightContainer>
					<SimpleTable
						tableClass={'magellan-table'}
						zoom={1}
						rows={sampleMetadata}
						height={'auto'}
						dontScroll={true}
						disableWrap={true}
						title={'Metadata'}
						headerExtraStyle={{
							backgroundColor: '#313541',
							color: 'white',
						}}
						hideSubheader={true}
						firstColWidth={firstColWidth}
					/>
				</StyledRightContainer>
			</StyledContainer>
			<StyledReviewContainer>
				<StyledReviewLeftContainer>
					<StyledAccordionContainer>
						<GCAccordion
							contentPadding={0}
							expanded={true}
							header={'ACCOMPLISHMENTS (#)'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'600'}
						>
							{renderAccomplishments()}
						</GCAccordion>
					</StyledAccordionContainer>
					<StyledAccordionContainer>
						<GCAccordion
							contentPadding={0}
							expanded={true}
							header={'CONTRACTS (#)'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'600'}
						>
							{renderVendors()}
						</GCAccordion>
					</StyledAccordionContainer>
					<StyledAccordionContainer>
						<GCAccordion
							contentPadding={0}
							expanded={true}
							headerWidth="100%"
							header={
								<StyledAccordionHeader headerWidth="100%">
									<strong>JAIC REVIEW</strong>
									<FiberManualRecordIcon style={{ color: 'green' }} />
								</StyledAccordionHeader>
							}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'600'}
						>
							{renderJAICReview()}
						</GCAccordion>
					</StyledAccordionContainer>
					<StyledAccordionContainer>
						<GCAccordion
							contentPadding={0}
							expanded={true}
							headerWidth="100%"
							header={
								<StyledAccordionHeader>
									<strong>SERVICE REVIEWER</strong>
									<FiberManualRecordIcon style={{ color: 'green' }} />
								</StyledAccordionHeader>
							}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'600'}
						>
							{renderServiceReviewer()}
						</GCAccordion>
					</StyledAccordionContainer>
					<StyledAccordionContainer>
						<GCAccordion
							contentPadding={0}
							expanded={false}
							headerWidth="100%"
							header={
								<StyledAccordionHeader>
									<strong>POC REVIEWER</strong>
									<FiberManualRecordIcon style={{ color: 'green' }} />
								</StyledAccordionHeader>
							}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'600'}
						>
							{renderPOCReviewer()}
						</GCAccordion>
					</StyledAccordionContainer>
					<StyledAccordionContainer>
						<GCAccordion
							contentPadding={0}
							expanded={true}
							headerWidth="100%"
							header={
								<StyledAccordionHeader>
									<strong>SECONDARY REVIEWER SECTION</strong>
									<FiberManualRecordIcon style={{ color: '#F9B32D' }} />
								</StyledAccordionHeader>
							}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'600'}
						>
							{renderSecondaryReviewer()}
						</GCAccordion>
					</StyledAccordionContainer>
				</StyledReviewLeftContainer>
				<StyledReviewRightContainer>
					<StyledAccordionContainer>
						<GCAccordion
							contentPadding={0}
							expanded={true}
							header={'MISSION PARTNERS'}
							headerBackground={'#1C2D64'}
							headerTextColor={'white'}
							headerTextWeight={'600'}
						>
							{renderMissionPartners()}
						</GCAccordion>
					</StyledAccordionContainer>
				</StyledReviewRightContainer>
			</StyledReviewContainer>
		</div>
	);
};

export default BudgetSearchProfilePage;
