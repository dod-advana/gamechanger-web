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
	const isChecked = (option) => {
		return state[searchSettingsName][filter][option];
	};

	const handleFilterChange = (event) => {
		const newSearchSettings = structuredClone(state[searchSettingsName]);
		let name = showNumResultsPerOption
			? event.target.name.substring(0, event.target.name.lastIndexOf('(') - 1)
			: event.target.name;
		newSearchSettings[filter] = {
			...newSearchSettings[filter],
			[name]: event.target.checked,
		};

		const noFiltersSelected = Object.values(newSearchSettings[filter]).filter((value) => value).length === 0;
		const allAvailableSelected = originalFilters.reduce(
			(availableSelected, originalFilter) =>
				availableSelected && (!originalFilter[1] || newSearchSettings[filter][originalFilter[0]]),
			true
		);
		if (noFiltersSelected || allAvailableSelected) {
			newSearchSettings[allSelected] = true;
			newSearchSettings[specificSelected] = false;
		} else {
			newSearchSettings[allSelected] = false;
			newSearchSettings[specificSelected] = true;
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
		// in reg search, filters come in with [string: filter name, string | 0: number of docs]
		const newFilter = originalFilters.reduce((accumulator, originalFilter) => {
			if (showNumResultsPerOption) {
				return { ...accumulator, [originalFilter[0]]: !!originalFilter[1] };
			}
			return { ...accumulator, [originalFilter[0]]: true };
		}, {});

		newSearchSettings[filter] = newFilter;
		newSearchSettings[allSelected] = true;
		newSearchSettings[specificSelected] = false;
		newSearchSettings.isFilterUpdate = true;
		newSearchSettings[update] = true;
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
			showClear={Object.values(state[searchSettingsName][filter]).filter((value) => value).length !== 0}
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
