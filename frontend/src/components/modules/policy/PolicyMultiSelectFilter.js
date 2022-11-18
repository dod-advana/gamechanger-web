import React, { useState } from 'react';
import PropTypes from 'prop-types';

import MultiSelectFilter from '../../common/MultiSelectFilter';
import { setState } from '../../../utils/sharedFunctions';

const PolicyMultiSelectFilter = ({
	state,
	dispatch,
	classes,
	searchSettingsName,
	filter,
	originalFilters,
	allSelected,
	specificSelected,
	update,
	trackingName,
	showNumResultsPerOption = false,
	preventSearchOnChange = false,
}) => {
	const [showClear, setShowClear] = useState(false);

	const isChecked = (option) => {
		return state[searchSettingsName][filter][option];
	};

	const handleFilterChange = (event) => {
		const newSearchSettings = structuredClone(state[searchSettingsName]);
		if (state[searchSettingsName][allSelected]) {
			newSearchSettings[allSelected] = false;
			newSearchSettings[specificSelected] = true;
			setShowClear(true);
		}
		let name = showNumResultsPerOption
			? event.target.name.substring(0, event.target.name.lastIndexOf('(') - 1)
			: event.target.name;
		newSearchSettings[filter] = {
			...newSearchSettings[filter],
			[name]: event.target.checked,
		};
		if (Object.values(newSearchSettings[filter]).filter((value) => value).length === 0) {
			newSearchSettings[allSelected] = true;
			newSearchSettings[specificSelected] = false;
			setShowClear(false);
		}
		newSearchSettings.isFilterUpdate = true;
		newSearchSettings[update] = true;
		setState(dispatch, {
			[searchSettingsName]: newSearchSettings,
			metricsCounted: false,
			runSearch: !preventSearchOnChange,
			runGraphSearch: !preventSearchOnChange,
		});
	};

	const handleClear = () => {
		const newSearchSettings = structuredClone(state[searchSettingsName]);

		// Set all options to false
		const newFilter = Object.keys(state[searchSettingsName][filter]).reduce((accumulator, key) => {
			return { ...accumulator, [key]: false };
		}, {});

		newSearchSettings[filter] = newFilter;
		newSearchSettings[allSelected] = true;
		newSearchSettings[specificSelected] = false;
		newSearchSettings.isFilterUpdate = true;
		newSearchSettings[update] = true;
		setShowClear(false);
		setState(dispatch, {
			[searchSettingsName]: newSearchSettings,
			metricsCounted: false,
			runSearch: !preventSearchOnChange,
			runGraphSearch: !preventSearchOnChange,
		});
	};

	const handleSelectAll = () => {
		const newSearchSettings = structuredClone(state[searchSettingsName]);

		// Set all filters with nonzero options to true
		const newFilter = originalFilters.reduce((accumulator, originalFilter) => {
			if (searchSettingsName === 'searchSettings') {
				return { ...accumulator, [originalFilter[0]]: !!originalFilter[1] };
			}
			return { ...accumulator, [originalFilter[0]]: true };
		}, {});

		newSearchSettings[filter] = newFilter;
		newSearchSettings[allSelected] = true;
		newSearchSettings[specificSelected] = false;
		newSearchSettings.isFilterUpdate = true;
		newSearchSettings[update] = true;
		setShowClear(true);
		setState(dispatch, {
			[searchSettingsName]: newSearchSettings,
			metricsCounted: false,
			runSearch: !preventSearchOnChange,
			runGraphSearch: !preventSearchOnChange,
		});
	};

	return (
		<MultiSelectFilter
			state={state}
			dispatch={dispatch}
			classes={classes}
			searchSettingsName={searchSettingsName}
			filter={filter}
			originalFilters={originalFilters}
			trackingName={trackingName}
			showNumResultsPerOption={showNumResultsPerOption}
			handleFilterChange={handleFilterChange}
			handleClear={handleClear}
			showClear={showClear}
			isChecked={isChecked}
			showSelectAll={true}
			handleSelectAll={handleSelectAll}
		/>
	);
};

PolicyMultiSelectFilter.propTypes = {
	state: PropTypes.shape({
		searchSettings: PropTypes.object,
	}),
	dispatch: PropTypes.func,
	classes: PropTypes.object,
	searchSettingsName: PropTypes.string,
	filter: PropTypes.string,
	originalFilters: PropTypes.object,
	allSelected: PropTypes.string,
	specificSelected: PropTypes.string,
	update: PropTypes.string,
	trackingName: PropTypes.string,
	showNumResultsPerOption: PropTypes.bool,
	preventSearchOnChange: PropTypes.bool,
};

export default PolicyMultiSelectFilter;
