import React from 'react';
import GCAccordion from '../../common/GCAccordion';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { GC_COLORS } from './jbookMainViewHandler';
import SimpleTable from '../../common/SimpleTable';

import _ from 'lodash';
import { FormControl, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { setState } from '../../../utils/sharedFunctions';

import { trackEvent } from '../../telemetry/Matomo';
import { getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import InputFilter from './InputFilter';

const handleSelectSpecific = (state, dispatch, type) => {
	const newSearchSettings = _.cloneDeep(state.jbookSearchSettings);
	newSearchSettings[`${type}SpecificSelected`] = true;
	newSearchSettings[`${type}AllSelected`] = false;
	newSearchSettings[type] = [];
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
		setState(dispatch, {
			jbookSearchSettings: newSearchSettings,
			metricsCounted: false,
			runSearch,
			runGraphSearch,
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

	newSearchSettings.isFilterUpdate = true;
	newSearchSettings[`${type}Update`] = true;
	setState(dispatch, {
		jbookSearchSettings: newSearchSettings,
		metricsCounted: false,
		runSearch: true,
		runGraphSearch: true,
	});
	trackEvent(
		getTrackingNameForFactory(state.cloneData.clone_name),
		`${type}FilterToggle`,
		event.target.name,
		event.target.value ? 1 : 0
	);
};

const renderFilterCheckboxes = (state, dispatch, classes, type, displayName, useES = false) => {
	const endsInY = displayName[displayName.length - 1] === 'y';
	const endsInS = displayName[displayName.length - 1] === 's';

	const allSelected = `${type}AllSelected`;
	const allText = `All ${endsInY ? displayName.slice(0, displayName.length - 1) : displayName}${
		endsInY ? 'ies' : endsInS ? 'es' : 's'
	}`;
	const specificText = `Specific ${endsInY ? displayName.slice(0, displayName.length - 1) : displayName}${
		endsInY ? 'ies' : endsInS ? 'es' : 's'
	}`;
	const specificSelected = `${type}SpecificSelected`;

	let optionType = useES ? type + 'ES' : type;
	const options = state.defaultOptions[optionType];

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
									onClick={() => handleSelectSpecific(state, dispatch, type)}
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
					<FormGroup row style={{ marginLeft: '10px', width: '100%' }}>
						{state.jbookSearchSettings[specificSelected] &&
							options &&
							options.map((option) => {
								return (
									<FormControlLabel
										key={`${option}`}
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
												checked={state.jbookSearchSettings[type].indexOf(option) !== -1}
												onClick={(event) => handleFilterChange(event, state, dispatch, type)}
											/>
										}
										label={`${option}`}
										labelPlacement="end"
									/>
								);
							})}
					</FormGroup>
				</>
			}
		</FormControl>
	);
};

const handleFilterInputChange = (field, value, state, dispatch) => {
	const newSearchSettings = _.cloneDeep(state.jbookSearchSettings);

	newSearchSettings[field] = value;

	setState(dispatch, {
		jbookSearchSettings: newSearchSettings,
	});
};

const resetAdvancedSettings = (dispatch) => {
	dispatch({ type: 'RESET_SEARCH_SETTINGS' });
};

const renderStats = (contractTotals) => {
	console.log(contractTotals);
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

const getSearchMatrixItems = (props) => {
	const { state, dispatch, classes } = props;

	const { contractTotals, jbookSearchSettings } = state;

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
					{renderFilterCheckboxes(state, dispatch, classes, 'budgetType', 'budget type')}
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
					expanded={jbookSearchSettings.appropriationNumber && jbookSearchSettings.appropriationNumber !== ''}
					header={<b>MAIN ACCOUNT</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'appropriationNumber'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.budgetActivity && jbookSearchSettings.budgetActivity !== ''}
					header={<b>BUDGET ACTIVITY</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'budgetActivity'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.budgetSubActivity && jbookSearchSettings.budgetSubActivity !== ''}
					header={<b>BUDGET SUB ACTIVITY</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'budgetSubActivity'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.programElement && jbookSearchSettings.programElement !== ''}
					header={<b>PROGRAM ELEMENT / BLI</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'programElement'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.projectNum && jbookSearchSettings.projectNum !== ''}
					header={<b>PROJECT #</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'projectNum'} />
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={
						(jbookSearchSettings.minBY1Funding && jbookSearchSettings.minBY1Funding !== '') ||
						(jbookSearchSettings.maxBY1Funding && jbookSearchSettings.maxBY1Funding !== '')
					}
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
					expanded={jbookSearchSettings.totalCost && jbookSearchSettings.totalCost !== ''}
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
						expanded={jbookSearchSettings.projectTitle && jbookSearchSettings.projectTitle !== ''}
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
					{renderFilterCheckboxes(state, dispatch, classes, 'hasKeywords', 'has keyword')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={jbookSearchSettings.primaryClassLabelSpecificSelected}
					header={<b>LABELS</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'primaryClassLabel', 'primary class label')}
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
				{state.runningSearch && (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={GC_COLORS.primary} />
					</div>
				)}
				{!state.runningSearch && (
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
					$M
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
					$M
				</div>
			</div>
		</div>
	);
};

const JBookSearchMatrixHandler = (props) => {
	return <>{getSearchMatrixItems(props)}</>;
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
