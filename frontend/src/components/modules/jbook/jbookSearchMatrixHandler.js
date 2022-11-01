import React from 'react';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Curve } from 'recharts';
import GCAccordion from '../../common/GCAccordion';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { GC_COLORS } from './jbookMainViewHandler';
import SimpleTable from '../../common/SimpleTable';
import JBookMultiSelectFilter from './jbookMultiSelectFilter';

import _ from 'lodash';
import { FormControl } from '@material-ui/core';
import { setState } from '../../../utils/sharedFunctions';
import InputFilter from './InputFilter';

const keywordsOpts = ['Yes', 'No'];

const renderFilterOptions = (state, dispatch, classes, type, customOptions = undefined) => {
	const options = customOptions || state.defaultOptions[type];

	return (
		<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
			<JBookMultiSelectFilter
				state={state}
				dispatch={dispatch}
				classes={classes}
				filter={type}
				options={options}
			/>
		</FormControl>
	);
};

const handleFilterInputChange = (field, value, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.jbookSearchSettings);

	newSearchSettings[field] = value.toUpperCase();

	// track that a change was made to a filter
	let diffSearchSettings = [...state.modifiedSearchSettings];
	// if a new value that is not empty was set
	if (!diffSearchSettings.includes(field) && value !== '') {
		diffSearchSettings.push(field);
		diffSearchSettings.sort();
		// if a value was unset
	} else if (value === '') {
		diffSearchSettings = diffSearchSettings.filter((e) => e !== field);
	}

	setState(dispatch, {
		jbookSearchSettings: newSearchSettings,
		modifiedSearchSettings: diffSearchSettings,
	});
};

const resetAdvancedSettings = (dispatch) => {
	dispatch({ type: 'RESET_SEARCH_SETTINGS' });
};

const parseContractAmounts = (amount) => {
	return '$' + (amount > 1000 ? (amount / 1000).toFixed(2) + ' B' : parseFloat(amount).toFixed(2) + ' M');
};

const renderStats = (contractTotals) => {
	contractTotals.sort((a, b) => b.sum_agg.value - a.sum_agg.value);
	let data = contractTotals.map((item) => {
		return {
			Key: item.key,
			Value: parseContractAmounts(item.sum_agg.value),
		};
	});

	data = data.filter((item) => item.Value !== '0.00 M');

	return (
		<SimpleTable
			tableClass={'magellan-table'}
			zoom={1}
			// headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
			rows={data}
			height={'auto'}
			dontScroll={true}
			colWidth={{
				whiteSpace: 'nowrap',
				maxWidth: '200px',
				minWidth: '100px',
			}}
			disableWrap={true}
			hideHeader={true}
		/>
	);
};

const getPortfolioMap = (portfolios) => {
	const portfolioMap = {};
	for (let item of portfolios) {
		portfolioMap[item.name] = item;
	}
	return portfolioMap;
};

const getContractData = (contractTotals) => {
	const COLORS = ['#fc9d03', '#ad0202', '#007506', '#6c0299', '#006069', '#969902'];
	const orgColorMap = {
		Army: '#4b5320', // army green
		Navy: '#282053', // navy blue
		'Air Force (AF)': '#00308f', // sky blue
		'The Joint Staff (TJS)': '#330066', // purple
	};
	let totalAmount = 0;
	let index = 0;

	const contractData = contractTotals.map((item) => {
		totalAmount += item.sum_agg.value;
		let color = COLORS[index % 6];
		if (orgColorMap[item.key]) {
			color = orgColorMap[item.key];
		} else {
			index++;
		}
		return {
			type: item.key,
			count: item.sum_agg.value,
			convertedTotal: parseContractAmounts(item.sum_agg.value),
			color,
		};
	});

	return { contractData, totalAmount };
};

const BudgetRequestPie = ({ contractTotals }) => {
	let { contractData, totalAmount } = getContractData(contractTotals);
	const convertedTotalAmount = parseContractAmounts(totalAmount);

	const hideLabel = ({ endAngle, startAngle }) => {
		const size = endAngle - startAngle;
		return size < 8;
	};

	const customLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, type, color, endAngle, startAngle }) => {
		const RADIAN = Math.PI / 180;
		const radius = 25 + innerRadius + (outerRadius - innerRadius);
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		if (hideLabel({ endAngle, startAngle })) return null;

		let display = type;
		const regExp = /\(([^)]+)\)/;
		const matches = regExp.exec(type);
		if (matches && matches[1]) display = matches[1];

		if (type)
			return (
				<text x={x} y={y} fill={color} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
					{display}
				</text>
			);
	};

	const customLabelLine = (props) => {
		if (hideLabel(props)) return null;
		return <Curve {...props} type="linear" className="recharts-pie-label-line" />;
	};

	const CustomTooltip = ({ payload }) => {
		let tooltipText = '';
		if (payload.length > 0) {
			let data = payload[0];
			tooltipText += data.name + ': ' + data.payload.convertedTotal;
		}
		return <div style={{ backgroundColor: 'white', border: '1px black solid', padding: 5 }}>{tooltipText}</div>;
	};

	return (
		<ResponsiveContainer width="100%" height={300}>
			<PieChart width={'100%'} height={'100%'}>
				<Pie
					innerRadius={'40%'}
					outerRadius={'55%'}
					data={contractData}
					cx="50%"
					cy="50%"
					dataKey="count"
					nameKey="type"
					label={customLabel}
					labelLine={customLabelLine}
					isAnimationActive={false}
				>
					{contractData.map((_entry, index) => (
						<Cell key={`cell-${index}`} fill={contractData[index].color} />
					))}
				</Pie>
				<text x={'50%'} y={'50%'} dy={8} textAnchor="middle">
					{convertedTotalAmount}
				</text>
				<Tooltip content={<CustomTooltip />} />
			</PieChart>
		</ResponsiveContainer>
	);
};

const BudgetRequestTotal = (props) => {
	const { runningSearch, contractTotals } = props;
	return (
		<GCAccordion
			contentPadding={0}
			expanded={true}
			header={<b>Search Results: Budget Request Totals by Org</b>}
			headerBackground={'rgb(28, 45, 101)'}
			headerTextColor={'white'}
			headerTextWeight={'normal'}
		>
			{runningSearch ? (
				<div style={{ margin: '0 auto' }}>
					<LoadingIndicator customColor={GC_COLORS.primary} />
				</div>
			) : (
				<div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
					{Boolean(contractTotals.length) && <BudgetRequestPie contractTotals={contractTotals} />}
					<div style={{ textAlign: 'left', width: '100%' }}>{renderStats(contractTotals)}</div>
				</div>
			)}
		</GCAccordion>
	);
};

// search matrix for the AI Inventory portfolio
const getSearchMatrixItemsAIInventory = (props) => {
	const { state, dispatch, classes } = props;
	const { contractTotals, jbookSearchSettings, selectedPortfolio, portfolios, runningSearch } = state;
	const portfolioMap = getPortfolioMap(portfolios);
	return (
		<div style={{ marginLeft: 15 }}>
			<div style={{ width: '100%', marginBottom: 10 }} data-cy="budgetYear-filter">
				<GCAccordion
					expanded={jbookSearchSettings.budgetYearSpecificSelected}
					header={<b>BUDGET YEAR (FY)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(state, dispatch, classes, 'budgetYear')}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }} data-cy="budgetType-filter">
				<GCAccordion
					expanded={jbookSearchSettings.budgetTypeSpecificSelected}
					header={<b>PL TITLE</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(
						state,
						dispatch,
						classes,
						'budgetType',
						selectedPortfolio !== 'AI Inventory'
							? state.defaultOptions['budgetType'].filter((item) => item !== 'O&M')
							: undefined
					)}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }} data-cy="serviceAgency-filter">
				<GCAccordion
					expanded={jbookSearchSettings.serviceAgencySpecificSelected}
					header={<b>SERVICE / AGENCY</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(state, dispatch, classes, 'serviceAgency')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="appropriationNumber-filter">
				<GCAccordion
					expanded={jbookSearchSettings.appropriationNumberSpecificSelected}
					header={<b>MAIN ACCOUNT</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(state, dispatch, classes, 'appropriationNumber')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="budgetActivity-filter">
				<GCAccordion
					expanded={jbookSearchSettings.budgetActivitySpecificSelected}
					header={<b>BUDGET ACTIVITY</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(state, dispatch, classes, 'budgetActivity')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="budgetSubActivity-filter">
				<GCAccordion
					header={<b>BUDGET SUB ACTIVITY (PROC only)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'budgetSubActivity'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="programElement-filter">
				<GCAccordion
					header={<b>BUDGET LINE ITEM (PE)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'programElement'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="projectNum-filter">
				<GCAccordion
					header={<b>PROJECT # (RDT&E only)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'projectNum'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="BY1Funding-filter">
				<GCAccordion
					header={<b>BY1 REQUEST</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFundingMinMaxInput('minBY1Funding', 'maxBY1Funding')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="totalCost-filter">
				<GCAccordion
					header={<b>TOTAL COST</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFundingMinMaxInput('minTotalCost', 'maxTotalCost')}
				</GCAccordion>
			</div>

			{!state.useElasticSearch && (
				<div style={{ width: '100%', marginBottom: 10 }} data-cy="projectTitle-filter">
					<GCAccordion
						header={<b>PROJECT TITLE</b>}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						<InputFilter setJBookSetting={handleFilterInputChange} field={'projectTitle'} />
					</GCAccordion>
				</div>
			)}

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="primaryReviewer-filter">
				<GCAccordion
					expanded={jbookSearchSettings.primaryReviewerSpecificSelected}
					header={<b>INITIAL REVIEWER</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(state, dispatch, classes, 'primaryReviewer')}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }} data-cy="serviceReviewer-filter">
				<GCAccordion
					expanded={jbookSearchSettings.serviceReviewerSpecificSelected}
					header={<b>RAI LEAD REVIEWER</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(state, dispatch, classes, 'serviceReviewer')}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }} data-cy="pocReviewer-filter">
				<GCAccordion
					expanded={jbookSearchSettings.pocReviewer && jbookSearchSettings.pocReviewer !== ''}
					header={<b>POC REVIEWER</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter
						setJBookSetting={handleFilterInputChange}
						field={'pocReviewer'}
						name={'POC Reviewer'}
					/>
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }} data-cy="reviewStatus-filter">
				<GCAccordion
					expanded={jbookSearchSettings.reviewStatusSpecificSelected}
					header={<b>REVIEW STATUS</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(state, dispatch, classes, 'reviewStatus')}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }} data-cy="hasKeywords-filter">
				<GCAccordion
					expanded={jbookSearchSettings.hasKeywordsSpecificSelected}
					header={<b>HAS KEYWORDS</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(state, dispatch, classes, 'hasKeywords', keywordsOpts)}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="primaryClassLabel-filter">
				<GCAccordion
					expanded={jbookSearchSettings.classLabelSpecificSelected}
					header={<b>TAGS</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(
						state,
						dispatch,
						classes,
						'classLabel',
						portfolioMap?.[selectedPortfolio]?.tags
					)}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="source-filter">
				<GCAccordion
					expanded={jbookSearchSettings.sourceSpecificSelected}
					header={<b>SOURCE</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(state, dispatch, classes, 'sourceTag')}
				</GCAccordion>
			</div>

			<button
				type="button"
				style={{
					border: 'none',
					backgroundColor: '#B0BAC5',
					padding: '0 15px',
					display: 'flex',
					height: 50,
					alignItems: 'center',
					borderRadius: 5,
					width: '100%',
					marginBottom: 10,
				}}
				onClick={() => {
					resetAdvancedSettings(dispatch);
					setState(dispatch, { runSearch: true, runGraphSearch: true });
				}}
			>
				<span
					style={{
						fontFamily: 'Montserrat',
						fontWeight: 600,
						width: '100%',
						marginTop: '5px',
						marginBottom: '10px',
						marginLeft: '-1px',
					}}
				>
					Clear Filters
				</span>
			</button>
			<BudgetRequestTotal contractTotals={contractTotals} runningSearch={runningSearch} />
		</div>
	);
};

// search matrix for all other portfolios (not AI Inventory)
const getSearchMatrixItems = (props) => {
	const { state, dispatch, classes } = props;

	const { contractTotals, jbookSearchSettings, selectedPortfolio, portfolios, runningSearch } = state;
	const portfolioMap = getPortfolioMap(portfolios);
	return (
		<div style={{ marginLeft: 15 }}>
			<div style={{ width: '100%', marginBottom: 10 }} data-cy="budgetYear-filter">
				<GCAccordion
					expanded={jbookSearchSettings.budgetYearSpecificSelected}
					header={<b>BUDGET YEAR (FY)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(state, dispatch, classes, 'budgetYear')}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }} data-cy="budgetType-filter">
				<GCAccordion
					expanded={jbookSearchSettings.budgetTypeSpecificSelected}
					header={<b>PL TITLE</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(
						state,
						dispatch,
						classes,
						'budgetType',
						selectedPortfolio !== 'AI Inventory'
							? state.defaultOptions['budgetType'].filter((item) => item !== 'O&M')
							: undefined
					)}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }} data-cy="serviceAgency-filter">
				<GCAccordion
					expanded={jbookSearchSettings.serviceAgencySpecificSelected}
					header={<b>SERVICE / AGENCY</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(state, dispatch, classes, 'serviceAgency')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="appropriationNumber-filter">
				<GCAccordion
					expanded={jbookSearchSettings.appropriationNumberSpecificSelected}
					header={<b>MAIN ACCOUNT</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(state, dispatch, classes, 'appropriationNumber')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="budgetActivity-filter">
				<GCAccordion
					expanded={jbookSearchSettings.budgetActivitySpecificSelected}
					header={<b>BUDGET ACTIVITY</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterOptions(state, dispatch, classes, 'budgetActivity')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="budgetSubActivity-filter">
				<GCAccordion
					header={<b>BUDGET SUB ACTIVITY (PROC only)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'budgetSubActivity'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="programElement-filter">
				<GCAccordion
					header={<b>BUDGET LINE ITEM (PE)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'programElement'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="projectNum-filter">
				<GCAccordion
					header={<b>PROJECT # (RDT&E only)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'projectNum'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="BY1Funding-filter">
				<GCAccordion
					header={<b>BY1 REQUEST</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFundingMinMaxInput('minBY1Funding', 'maxBY1Funding')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }} data-cy="totalCost-filter">
				<GCAccordion
					header={<b>TOTAL COST</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFundingMinMaxInput('minTotalCost', 'maxTotalCost')}
				</GCAccordion>
			</div>

			{!state.useElasticSearch && (
				<div style={{ width: '100%', marginBottom: 10 }} data-cy="pocReviewer-filter">
					<GCAccordion
						header={<b>POC REVIEWER</b>}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						<InputFilter setJBookSetting={handleFilterInputChange} field={'projectTitle'} />
					</GCAccordion>
				</div>
			)}

			{selectedPortfolio !== 'General' && (
				<div style={{ width: '100%', marginBottom: 10 }} data-cy="reviewStatus-filter">
					<GCAccordion
						expanded={jbookSearchSettings.reviewStatusSpecificSelected}
						header={<b>REVIEW STATUS</b>}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						{renderFilterOptions(state, dispatch, classes, 'primaryReviewStatus')}
					</GCAccordion>
				</div>
			)}

			{selectedPortfolio !== 'General' && (
				<div style={{ width: '100%', marginBottom: 10 }} data-cy="primaryClass-filter">
					<GCAccordion
						expanded={jbookSearchSettings.classLabelSpecificSelected}
						header={<b>TAGS</b>}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						{renderFilterOptions(
							state,
							dispatch,
							classes,
							'classLabel',
							portfolioMap?.[selectedPortfolio]?.tags
						)}
					</GCAccordion>
				</div>
			)}

			<button
				type="button"
				style={{
					border: 'none',
					backgroundColor: '#B0BAC5',
					padding: '0 15px',
					display: 'flex',
					height: 50,
					alignItems: 'center',
					borderRadius: 5,
					width: '100%',
					marginBottom: 10,
				}}
				onClick={() => {
					resetAdvancedSettings(dispatch);
					setState(dispatch, { runSearch: true, runGraphSearch: true });
				}}
			>
				<span
					style={{
						fontFamily: 'Montserrat',
						fontWeight: 600,
						width: '100%',
						marginTop: '5px',
						marginBottom: '10px',
						marginLeft: '-1px',
					}}
				>
					Clear Filters
				</span>
			</button>
			<BudgetRequestTotal contractTotals={contractTotals} runningSearch={runningSearch} />
		</div>
	);
};

const renderFundingMinMaxInput = (min, max) => {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
			<div style={{ display: 'flex', margin: '10px 0' }}>
				<div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center', fontSize: 20 }}>
					Min
				</div>

				<div style={{ display: 'flex', flex: 3 }}>
					<InputFilter setJBookSetting={handleFilterInputChange} field={min} />
					<span>
						<pre> M</pre>
					</span>
				</div>
			</div>
			<div style={{ display: 'flex', margin: '10px 0' }}>
				<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
					Max
				</div>
				<div style={{ display: 'flex', flex: 3 }}>
					<InputFilter setJBookSetting={handleFilterInputChange} field={max} />
					<span>
						<pre> M</pre>
					</span>
				</div>
			</div>
		</div>
	);
};

const JBookSearchMatrixHandler = (props) => {
	const { state } = props;
	const { selectedPortfolio } = state;
	if (selectedPortfolio === 'AI Inventory') {
		return getSearchMatrixItemsAIInventory(props);
	}
	return getSearchMatrixItems(props);
};

export default JBookSearchMatrixHandler;
