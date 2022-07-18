import React from 'react';
import GCAccordion from '../../common/GCAccordion';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { GC_COLORS } from './jbookMainViewHandler';
import SimpleTable from '../../common/SimpleTable';

import _ from 'lodash';
import { Typography, FormControl, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import Pluralize from 'pluralize';
import { setState } from '../../../utils/sharedFunctions';

import { trackEvent } from '../../telemetry/Matomo';
import { getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import InputFilter from './InputFilter';

const handleSelectSpecific = (state, dispatch, type, checked) => {
	const newSearchSettings = _.cloneDeep(state.jbookSearchSettings);
	newSearchSettings[`${type}SpecificSelected`] = true;
	newSearchSettings[`${type}AllSelected`] = false;
	if (!checked) newSearchSettings[type] = [];
	setState(dispatch, {
		jbookSearchSettings: newSearchSettings,
		metricsCounted: false,
	});
};

const handleSelectAll = (state, dispatch, type) => {
	const specific = `${type}SpecificSelected`;
	const all = `${type}AllSelected`;

	if (state.jbookSearchSettings[specific]) {
		const newSearchSettings = _.cloneDeep(state.jbookSearchSettings);
		newSearchSettings[specific] = false;
		newSearchSettings[all] = true;
		let runSearch = true;
		let runGraphSearch = false;
		newSearchSettings[type] = state.defaultOptions[type];
		const diffSearchSettings = [...state.modifiedSearchSettings].filter((e) => e !== type);
		if (type === 'appropriationNumber') {
			newSearchSettings.paccts = [];
			newSearchSettings.raccts = [];
			newSearchSettings.oaccts = [];
		}
		setState(dispatch, {
			jbookSearchSettings: newSearchSettings,
			metricsCounted: false,
			runSearch,
			runGraphSearch,
			modifiedSearchSettings: diffSearchSettings,
		});
	}
};

const handleFilterChange = (event, state, dispatch, type) => {
	const newSearchSettings = _.cloneDeep(state.jbookSearchSettings);
	let optionName = event.target.name;
	const index = newSearchSettings[type].indexOf(optionName);

	if (index !== -1) {
		newSearchSettings[type].splice(index, 1);
	} else {
		newSearchSettings[type].push(optionName);
	}

	console.log(newSearchSettings);

	newSearchSettings.isFilterUpdate = true;
	newSearchSettings[`${type}Update`] = true;

	let diffSearchSettings = [...state.modifiedSearchSettings];
	// if filter is being applied for the first time
	if (index === -1 && !diffSearchSettings.includes(type)) {
		diffSearchSettings.push(type);
		diffSearchSettings.sort();
		// if a filter was removed and no longer applies
	} else if (index !== -1 && diffSearchSettings.includes(type)) {
		diffSearchSettings = diffSearchSettings.filter((e) => e !== type);
	}

	setState(dispatch, {
		jbookSearchSettings: newSearchSettings,
		metricsCounted: false,
		runSearch: true,
		runGraphSearch: true,
		modifiedSearchSettings: diffSearchSettings,
	});
	trackEvent(
		getTrackingNameForFactory(state.cloneData.clone_name),
		`${type}FilterToggle`,
		event.target.name,
		event.target.value ? 1 : 0
	);
};

const keywordsOpts = ['Yes', 'No'];

const renderFilterCheckboxesOptions = (state, dispatch, classes, type, options) => {
	const renderOptions = (op, doctype = '') => {
		return op.map((option, index) => {
			return (
				<FormControlLabel
					key={`${option} ${index}`}
					value={`${option}`}
					classes={{
						root: classes.rootLabel,
						label: classes.checkboxPill,
					}}
					control={
						<Checkbox
							classes={{
								root: classes.rootButton,
								checked: classes.checkedButton,
							}}
							name={`${option}`}
							checked={state.jbookSearchSettings[doctype === '' ? type : doctype].indexOf(option) !== -1}
							onClick={(event) =>
								handleFilterChange(event, state, dispatch, doctype === '' ? type : doctype)
							}
						/>
					}
					label={`${option}`}
					labelPlacement="end"
				/>
			);
		});
	};

	if (type === 'appropriationNumber') {
		let docs = Object.keys(options);
		let map = {
			raccts: 'RDT&E',
			'RDT&E': 'raccts',
			paccts: 'Procurement',
			Procurement: 'paccts',
			oaccts: 'O&M',
			'O&M': 'oaccts',
		};

		if (state.selectedPortfolio !== 'AI Inventory') {
			docs = docs.filter((item) => item !== 'oaccts');
		}
		if (state.jbookSearchSettings.budgetTypeSpecificSelected && state.jbookSearchSettings.budgetType.length > 0) {
			docs = state.jbookSearchSettings.budgetType.map((item) => map[item]);
		}
		return (
			<FormGroup row style={{ marginLeft: '10px', width: '100%' }}>
				{docs.map((doctype) => {
					return (
						<>
							<Typography style={{ width: '100%', display: 'inline-flex', fontSize: '20' }}>
								{map[doctype]}
							</Typography>
							{renderOptions(options[doctype], doctype)}
						</>
					);
				})}
			</FormGroup>
		);
	}
	return (
		<FormGroup row style={{ marginLeft: '10px', width: '100%' }}>
			{renderOptions(options)}
		</FormGroup>
	);
};

const renderFilterCheckboxes = (
	state,
	dispatch,
	classes,
	type,
	displayName,
	useES = false,
	customOptions = undefined
) => {
	const allSelected = `${type}AllSelected`;
	const allText = `All ${Pluralize(displayName)}`;
	const specificText = `Specific ${Pluralize(displayName)}`;
	const specificSelected = `${type}SpecificSelected`;

	let optionType = useES ? type + 'ES' : type;
	const options = customOptions || state.defaultOptions[optionType];

	return (
		<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
			{
				<>
					<FormGroup row style={{ marginBottom: '10px' }}>
						<FormControlLabel
							name={allText}
							value={allText}
							classes={{ label: classes.titleText }}
							control={
								<Checkbox
									classes={{ root: classes.filterBox }}
									onClick={() => handleSelectAll(state, dispatch, type)}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={state.jbookSearchSettings[allSelected]}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name={allText}
									style={styles.filterBox}
								/>
							}
							label={allText}
							labelPlacement="end"
							style={styles.titleText}
						/>
					</FormGroup>
					<FormGroup row>
						<FormControlLabel
							name={specificText}
							value={specificText}
							classes={{ label: classes.titleText }}
							control={
								<Checkbox
									classes={{ root: classes.filterBox }}
									onClick={() =>
										handleSelectSpecific(
											state,
											dispatch,
											type,
											state.jbookSearchSettings[specificSelected]
										)
									}
									icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
									checked={state.jbookSearchSettings[specificSelected]}
									checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
									name={specificText}
									style={styles.filterBox}
								/>
							}
							label={specificText}
							labelPlacement="end"
							style={styles.titleText}
						/>
					</FormGroup>
					{state.jbookSearchSettings[specificSelected] &&
						options &&
						renderFilterCheckboxesOptions(state, dispatch, classes, type, options)}
				</>
			}
		</FormControl>
	);
};

const handleFilterInputChange = (field, value, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.jbookSearchSettings);

	newSearchSettings[field] = value;

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

const renderStats = (contractTotals) => {
	contractTotals.sort((a, b) => b.sum_agg.value - a.sum_agg.value);
	let data = contractTotals.map((item) => {
		return {
			Key: item.key,
			Value:
				item.sum_agg.value > 1000
					? (item.sum_agg.value / 1000).toFixed(2) + ' B'
					: parseFloat(item.sum_agg.value).toFixed(2) + ' M',
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

// search matrix for the AI Inventory portfolio
const getSearchMatrixItemsAIInventory = (props) => {
	const { state, dispatch, classes } = props;
	const { contractTotals, jbookSearchSettings, selectedPortfolio, portfolios } = state;
	const portfolioMap = getPortfolioMap(portfolios);
	return (
		<div style={{ marginLeft: 15 }}>
			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.budgetYearSpecificSelected}
					header={<b>BUDGET YEAR (FY)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'budgetYear', 'budget year', true)}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.budgetTypeSpecificSelected}
					header={<b>PL TITLE</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(
						state,
						dispatch,
						classes,
						'budgetType',
						'budget type',
						false,
						selectedPortfolio !== 'AI Inventory'
							? state.defaultOptions['budgetType'].filter((item) => item !== 'O&M')
							: undefined
					)}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.serviceAgencySpecificSelected}
					header={<b>SERVICE / AGENCY</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'serviceAgency', 'service agency', true)}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.appropriationNumberSpecificSelected}
					header={<b>MAIN ACCOUNT</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(
						state,
						dispatch,
						classes,
						'appropriationNumber',
						'appropriation number',
						true
					)}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.budgetActivitySpecificSelected}
					header={<b>BUDGET ACTIVITY</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'budgetActivity', 'budget activity')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					header={<b>BUDGET SUB ACTIVITY (PROC only)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'budgetSubActivity'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					header={<b>BUDGET LINE ITEM (PE)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'programElement'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					header={<b>PROJECT # (RDT&E only)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'projectNum'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					header={<b>BY1 FUNDING</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFundingMinMaxInput('minBY1Funding', 'maxBY1Funding')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					header={<b>TOTAL FUNDING</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFundingMinMaxInput('minTotalCost', 'maxTotalCost')}
				</GCAccordion>
			</div>

			{!state.useElasticSearch && (
				<div style={{ width: '100%', marginBottom: 10 }}>
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

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.primaryReviewerSpecificSelected}
					header={<b>PRIMARY REVIEWER</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'primaryReviewer', 'primary reviewer')}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.serviceReviewerSpecificSelected}
					header={<b>SERVICE REVIEWER</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'serviceReviewer', 'service reviewer')}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }}>
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
			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.reviewStatusSpecificSelected}
					header={<b>REVIEW STATUS</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'reviewStatus', 'review status')}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.hasKeywordsSpecificSelected}
					header={<b>HAS KEYWORDS</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<FormControl style={{ padding: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
						{renderFilterCheckboxesOptions(state, dispatch, classes, 'hasKeywords', keywordsOpts)}
					</FormControl>
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.primaryClassLabelSpecificSelected}
					header={<b>TAGS</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(
						state,
						dispatch,
						classes,
						'primaryClassLabel',
						'primary class tag',
						false,
						portfolioMap[selectedPortfolio].tags
					)}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.sourceSpecificSelected}
					header={<b>SOURCE</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'sourceTag', 'source tag')}
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

			<GCAccordion
				contentPadding={0}
				expanded={true}
				header={<b>Search Results: Budget Request Totals by Org</b>}
				headerBackground={'rgb(28, 45, 101)'}
				headerTextColor={'white'}
				headerTextWeight={'normal'}
			>
				{state.runningSearch ? (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={GC_COLORS.primary} />
					</div>
				) : (
					<div style={{ textAlign: 'left', width: '100%' }}>{renderStats(contractTotals)}</div>
				)}
			</GCAccordion>
		</div>
	);
};

// search matrix for all other portfolios (not AI Inventory)
const getSearchMatrixItems = (props) => {
	const { state, dispatch, classes } = props;

	const { contractTotals, jbookSearchSettings, selectedPortfolio, portfolios } = state;
	const portfolioMap = getPortfolioMap(portfolios);
	return (
		<div style={{ marginLeft: 15 }}>
			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.budgetYearSpecificSelected}
					header={<b>BUDGET YEAR (FY)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'budgetYear', 'budget year', true)}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.budgetTypeSpecificSelected}
					header={<b>PL TITLE</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(
						state,
						dispatch,
						classes,
						'budgetType',
						'budget type',
						false,
						selectedPortfolio !== 'AI Inventory'
							? state.defaultOptions['budgetType'].filter((item) => item !== 'O&M')
							: undefined
					)}
				</GCAccordion>
			</div>
			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.serviceAgencySpecificSelected}
					header={<b>SERVICE / AGENCY</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'serviceAgency', 'service agency', true)}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.appropriationNumberSpecificSelected}
					header={<b>MAIN ACCOUNT</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(
						state,
						dispatch,
						classes,
						'appropriationNumber',
						'appropriation number',
						true
					)}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.budgetActivitySpecificSelected}
					header={<b>BUDGET ACTIVITY</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'budgetActivity', 'budget activity')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					header={<b>BUDGET SUB ACTIVITY (PROC only)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'budgetSubActivity'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					header={<b>BUDGET LINE ITEM (PE)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'programElement'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					header={<b>PROJECT # (RDT&E only)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'projectNum'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					header={<b>BY1 FUNDING</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFundingMinMaxInput('minBY1Funding', 'maxBY1Funding')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					header={<b>TOTAL FUNDING</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFundingMinMaxInput('minTotalCost', 'maxTotalCost')}
				</GCAccordion>
			</div>

			{!state.useElasticSearch && (
				<div style={{ width: '100%', marginBottom: 10 }}>
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
				<div style={{ width: '100%', marginBottom: 10 }}>
					<GCAccordion
						expanded={jbookSearchSettings.reviewStatusSpecificSelected}
						header={<b>REVIEW STATUS</b>}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						{renderFilterCheckboxes(state, dispatch, classes, 'primaryReviewStatus', 'review status')}
					</GCAccordion>
				</div>
			)}

			{selectedPortfolio !== 'General' && (
				<div style={{ width: '100%', marginBottom: 10 }}>
					<GCAccordion
						expanded={jbookSearchSettings.primaryClassLabelSpecificSelected}
						header={<b>TAGS</b>}
						headerBackground={'rgb(238,241,242)'}
						headerTextColor={'black'}
						headerTextWeight={'normal'}
					>
						{renderFilterCheckboxes(
							state,
							dispatch,
							classes,
							'primaryClassLabel',
							'primary class tag',
							false,
							portfolioMap[selectedPortfolio].tags
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

			<GCAccordion
				contentPadding={0}
				expanded={true}
				header={<b>Search Results: Budget Request Totals by Org</b>}
				headerBackground={'rgb(28, 45, 101)'}
				headerTextColor={'white'}
				headerTextWeight={'normal'}
			>
				{state.runningSearch ? (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={GC_COLORS.primary} />
					</div>
				) : (
					<div style={{ textAlign: 'left', width: '100%' }}>{renderStats(contractTotals)}</div>
				)}
			</GCAccordion>
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

				<div style={{ flex: 3 }}>
					<InputFilter
						style={{ width: 200, marginRight: 10 }}
						setJBookSetting={handleFilterInputChange}
						field={min}
					/>
					M
				</div>
			</div>
			<div style={{ display: 'flex', margin: '10px 0' }}>
				<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
					Max
				</div>
				<div style={{ flex: 3 }}>
					<InputFilter
						style={{ width: 200, marginRight: 10 }}
						setJBookSetting={handleFilterInputChange}
						field={max}
					/>
					M
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

const styles = {
	innerContainer: {
		display: 'flex',
		height: '100%',
		flexDirection: 'column',
	},
	cardBody: {
		padding: '10px 0px',
		fontSize: '1.1em',
		fontFamily: 'Noto Sans',
	},
	subHead: {
		fontSize: '1.0em',
		display: 'flex',
		position: 'relative',
	},
	headerColumn: {
		fontSize: '1.0em',
		width: '100%',
		padding: '8px 8px',
		backgroundColor: 'rgb(50,53,64)',
		display: 'flex',
		alignItems: 'center',
	},
	filterDiv: {
		display: 'block',
		margin: '10px',
	},
	boldText: {
		fontSize: '0.8em',
	},
};

export default JBookSearchMatrixHandler;
