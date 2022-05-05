import React from 'react';
import GCAccordion from '../../common/GCAccordion';
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

const renderFilterCheckboxes = (state, dispatch, classes, type, displayName) => {
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
	const options = state.defaultOptions[type];

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
	let data = Object.keys(contractTotals).map((key) => {
		return {
			Key: key,
			Value:
				contractTotals[key] > 1000
					? (contractTotals[key] / 1000).toFixed(2) + ' B'
					: parseFloat(contractTotals[key]).toFixed(2) + ' M',
		};
	});
	data = data.filter((row) => row.Key !== '');
	data.sort((a, b) => {
		if (a.Key === 'Total Obligated Amt.') {
			return 1;
		} else {
			return a.Key > b.Key ? 1 : -1;
		}
	});

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
			}}
			disableWrap={true}
			hideHeader={true}
		/>
	);
};

const getSearchMatrixItems = (props) => {
	const { state, dispatch, classes } = props;

	const { contractTotals } = state;

	return (
		<div style={{ marginLeft: 15 }}>
			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={state.jbookSearchSettings.budgetTypeSpecificSelected}
					header={<b>BUDGET TYPE</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'budgetType', 'budget type')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={state.jbookSearchSettings.budgetYearSpecificSelected}
					header={<b>BUDGET YEAR (FY)</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'budgetYear', 'budget year')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={
						state.jbookSearchSettings.programElement && state.jbookSearchSettings.programElement !== ''
					}
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
					expanded={state.jbookSearchSettings.projectNum && state.jbookSearchSettings.projectNum !== ''}
					header={<b>PROJECT #</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<InputFilter setJBookSetting={handleFilterInputChange} field={'projectNum'} />
				</GCAccordion>
			</div>

			{!state.useElasticSearch && (
				<div style={{ width: '100%', marginBottom: 10 }}>
					<GCAccordion
						expanded={
							state.jbookSearchSettings.projectTitle && state.jbookSearchSettings.projectTitle !== ''
						}
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
					expanded={state.jbookSearchSettings.serviceAgencySpecificSelected}
					header={<b>SERVICE / AGENCY</b>}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					{renderFilterCheckboxes(state, dispatch, classes, 'serviceAgency', 'service agency')}
				</GCAccordion>
			</div>

			<div style={{ width: '100%', marginBottom: 10 }}>
				<GCAccordion
					expanded={state.jbookSearchSettings.primaryReviewerSpecificSelected}
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
					expanded={state.jbookSearchSettings.serviceReviewerSpecificSelected}
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
					expanded={state.jbookSearchSettings.pocReviewer && state.jbookSearchSettings.pocReviewer !== ''}
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
					expanded={state.jbookSearchSettings.reviewStatusSpecificSelected}
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
					expanded={state.jbookSearchSettings.hasKeywordsSpecificSelected}
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
					expanded={state.jbookSearchSettings.primaryClassLabelSpecificSelected}
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
					expanded={state.jbookSearchSettings.sourceSpecificSelected}
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
				header={<b>ESTIMATED BUDGET TOTALS</b>}
				headerBackground={'rgb(28, 45, 101)'}
				headerTextColor={'white'}
				headerTextWeight={'normal'}
			>
				{state.statsLoading && <div style={{ margin: '0 auto' }}>loading</div>}
				{!state.statsLoading && (
					<div style={{ textAlign: 'left', width: '100%' }}>{renderStats(contractTotals)}</div>
				)}
			</GCAccordion>
		</div>
	);
};

const PolicySearchMatrixHandler = (props) => {
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

export default PolicySearchMatrixHandler;
