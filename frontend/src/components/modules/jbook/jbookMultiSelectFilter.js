import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, FormControlLabel, Checkbox } from '@material-ui/core';

import MultiSelectFilter from '../../common/MultiSelectFilter';
import { setState } from '../../../utils/sharedFunctions';

const JBookMultiSelectFilter = ({ state, dispatch, classes, filter, options }) => {
	const [showClear, setShowClear] = useState(false);

	const allSelected = `${filter}AllSelected`;
	const specificSelected = `${filter}SpecificSelected`;
	const trackingName = `${filter}FilterToggle`;
	const update = `${filter}Update`;
	const searchSettingsName = 'jbookSearchSettings';
	const originalFilters = Object.values(options).map((option) => [option, 0]);

	const isChecked = (option) => {
		return state[searchSettingsName][specificSelected] && state[searchSettingsName][filter].includes(option);
	};

	const handleFilterChange = (event, type = filter) => {
		const newSearchSettings = structuredClone(state[searchSettingsName]);
		console.log('here are the new search settings', newSearchSettings);
		newSearchSettings.reviewStatus.forEach((reviewer, index) => {
			console.log('here is the reviewer and the index', reviewer, index);
		});

		if (state[searchSettingsName][allSelected]) {
			newSearchSettings[allSelected] = false;
			newSearchSettings[specificSelected] = true;
			newSearchSettings[type] = [];
			setShowClear(true);
		}
		let name = event.target.name;
		const index = newSearchSettings[type].indexOf(name);
		if (index !== -1) {
			newSearchSettings[type].splice(index, 1);
		} else {
			newSearchSettings[type].push(name);
		}
		if (newSearchSettings[type].length === 0) {
			newSearchSettings[allSelected] = true;
			newSearchSettings[specificSelected] = false;
			setShowClear(false);
		}
		newSearchSettings.isFilterUpdate = true;
		newSearchSettings[update] = true;

		let diffSearchSettings = [...state.modifiedSearchSettings];
		// if filter is being applied for the first time
		if (index === -1 && !diffSearchSettings.includes(type)) {
			diffSearchSettings.push(type);
			diffSearchSettings.sort();
			// if a filter was removed and no longer applies
		} else if (index !== -1 && diffSearchSettings.includes(type)) {
			diffSearchSettings = diffSearchSettings.filter((e) => e !== type);
		}

		console.log('here is the review status before changing', newSearchSettings.reviewStatus);
		newSearchSettings.reviewStatus.forEach((rs, index) => {
			if (rs === 'Partial Review (Initial)') {
				newSearchSettings.reviewStatus[index] = 'Partial Review (Primary)';
			}
			if (rs === 'Partial Review (RAI Lead)') {
				newSearchSettings.reviewStatus[index] = 'Partial Review (Service)';
			}
		});
		console.log('here is the review status after changing', newSearchSettings.reviewStatus);

		setState(dispatch, {
			[searchSettingsName]: newSearchSettings,
			metricsCounted: false,
			runSearch: true,
			runGraphSearch: true,
			modifiedSearchSettings: diffSearchSettings,
		});
	};

	const handleClear = () => {
		const newSearchSettings = structuredClone(state[searchSettingsName]);

		newSearchSettings[filter] = state.defaultOptions[filter];
		newSearchSettings[allSelected] = true;
		newSearchSettings[specificSelected] = false;
		newSearchSettings.isFilterUpdate = true;
		newSearchSettings[update] = true;
		const diffSearchSettings = [...state.modifiedSearchSettings].filter((e) => e !== filter);
		if (filter === 'appropriationNumber') {
			newSearchSettings.paccts = [];
			newSearchSettings.raccts = [];
			newSearchSettings.oaccts = [];
		}
		setShowClear(false);
		setState(dispatch, {
			[searchSettingsName]: newSearchSettings,
			metricsCounted: false,
			runSearch: true,
			runGraphSearch: true,
			modifiedSearchSettings: diffSearchSettings,
		});
	};

	const renderAppropriationNumberOptions = (op, doctype = '') => {
		return op.map((option, index) => {
			return (
				<FormControlLabel
					key={`${option} ${index}`}
					value={`${option}`}
					classes={{
						root: classes.rootLabel,
						label: classes.checkboxPill,
					}}
					data-cy={`filter-option-${option}`}
					control={
						<Checkbox
							classes={{
								root: classes.rootButton,
								checked: classes.checkedButton,
							}}
							name={`${option}`}
							checked={
								state.jbookSearchSettings[doctype === '' ? filter : doctype].indexOf(option) !== -1
							}
							onClick={(event) => handleFilterChange(event, doctype === '' ? filter : doctype)}
						/>
					}
					label={`${option}`}
					labelPlacement="end"
				/>
			);
		});
	};

	if (filter === 'appropriationNumber') {
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
			<MultiSelectFilter
				state={state}
				dispatch={dispatch}
				classes={classes}
				searchSettingsName={searchSettingsName}
				filter={filter}
				originalFilters={originalFilters}
				trackingName={trackingName}
				handleFilterChange={handleFilterChange}
				handleClear={handleClear}
				showClear={showClear}
				isChecked={isChecked}
			>
				{docs.map((doctype) => {
					return (
						<>
							<Typography style={{ width: '100%', display: 'inline-flex', fontSize: '20' }}>
								{map[doctype]}
							</Typography>
							{renderAppropriationNumberOptions(options[doctype], doctype)}
						</>
					);
				})}
			</MultiSelectFilter>
		);
	} else {
		return (
			<MultiSelectFilter
				state={state}
				dispatch={dispatch}
				classes={classes}
				searchSettingsName={searchSettingsName}
				filter={filter}
				originalFilters={originalFilters}
				trackingName={trackingName}
				handleFilterChange={handleFilterChange}
				handleClear={handleClear}
				showClear={showClear}
				isChecked={isChecked}
			/>
		);
	}
};

JBookMultiSelectFilter.propTypes = {
	state: PropTypes.shape({
		searchSettings: PropTypes.object,
	}),
	dispatch: PropTypes.func,
	classes: PropTypes.object,
	filter: PropTypes.string,
	originalFilters: PropTypes.object,
	update: PropTypes.string,
	showNumResultsPerOption: PropTypes.bool,
	preventSearchOnChange: PropTypes.bool,
};

export default JBookMultiSelectFilter;
