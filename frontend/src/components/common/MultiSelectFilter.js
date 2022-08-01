import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import Button from '@mui/material/Button';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { setState } from '../../utils/sharedFunctions';
import { trackEvent } from '../telemetry/Matomo';
import { getTrackingNameForFactory } from '../../utils/gamechangerUtils';

const styles = {
	buttonContainer: {
		display: 'flex',
		width: '100%',
		justifyContent: 'space-between',
		marginLeft: '-16px',
	},
	checkboxContainer: {
		textAlign: 'left',
	},
	textButton: {
		color: '#1E88E5',
	},
	textButtonIcon: {
		paddingBottom: '2px',
	},
};

const ButtonGroup = ({ state, dispatch, showSeeMore, showClear, showingAllOptions, handleSeeMore, handleClear }) => {
	const getSeeMoreText = () => {
		return showingAllOptions ? (
			<>
				See Less
				<KeyboardArrowUpIcon sx={styles.textButtonIcon} />
			</>
		) : (
			<>
				See More
				<KeyboardArrowDownIcon sx={styles.textButtonIcon} />
			</>
		);
	};

	return (
		<div style={styles.buttonContainer}>
			{showSeeMore ? (
				<Button variant="text" onClick={handleSeeMore} sx={styles.textButton}>
					{getSeeMoreText()}
				</Button>
			) : (
				<span></span>
			)}
			{showClear ? (
				<Button variant="text" onClick={() => handleClear(state, dispatch)} sx={styles.textButton}>
					Clear
				</Button>
			) : (
				<span></span>
			)}
		</div>
	);
};

const MultiSelectFilter = ({
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
}) => {
	const [showSeeMore, setShowSeeMore] = useState(false);
	const [showClear, setShowClear] = useState(false);
	const [maxNumVisible, setMaxNumVisible] = useState();
	const [showingAllOptions, setShowingAllOptions] = useState(false);

	const MAX_HEIGHT = 500;

	const betterData = {};
	originalFilters.forEach((option) => {
		betterData[option[0]] = option[1];
	});
	let visibleOptions = Object.keys(betterData);
	if (maxNumVisible && !showingAllOptions) {
		visibleOptions = Object.keys(betterData).slice(0, maxNumVisible);
	}

	const containerRef = useRef();
	const checkboxRef = useRef();

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
			runSearch: showNumResultsPerOption,
			runGraphSearch: showNumResultsPerOption,
		});
		trackEvent(
			getTrackingNameForFactory(state.cloneData.clone_name),
			trackingName,
			event.target.name,
			event.target.value ? 1 : 0
		);
	};

	const handleSeeMore = () => {
		setShowingAllOptions(!showingAllOptions);
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
			runSearch: showNumResultsPerOption,
			runGraphSearch: showNumResultsPerOption,
		});
	};

	const getCheckboxWidthAndHeight = (ref) => {
		let width;
		let height;
		if (ref.current) {
			const checkboxStyle = window.getComputedStyle(checkboxRef.current);
			const marginTop = Number(checkboxStyle.marginTop.split('px')[0]);
			const marginBottom = Number(checkboxStyle.marginBottom.split('px')[0]);
			const marginLeft = Number(checkboxStyle.marginLeft.split('px')[0]);
			const marginRight = Number(checkboxStyle.marginRight.split('px')[0]);
			height = ref.current.clientHeight + marginTop + marginBottom;
			width = ref.current.clientWidth + marginLeft + marginRight;
		}
		return [width, height];
	};

	const getCheckboxText = (option) => {
		if (showNumResultsPerOption) return `${option} (${betterData[option]})`;
		else return option;
	};

	useEffect(() => {
		if (!showSeeMore && containerRef.current?.clientHeight > MAX_HEIGHT && checkboxRef.current) {
			setShowSeeMore(true);

			// Calculate max number of visible options
			const [checkboxWidth, checkboxHeight] = getCheckboxWidthAndHeight(checkboxRef);
			const numCols = Math.floor(containerRef.current.clientWidth / checkboxWidth);
			const numRowsToDisplay = Math.floor(MAX_HEIGHT / checkboxHeight);

			setMaxNumVisible(numCols * numRowsToDisplay);
		}
	}, [containerRef.current?.clientHeight, checkboxRef, showSeeMore]);

	return (
		<FormGroup row style={{ marginLeft: '10px', width: '100%' }}>
			<div ref={containerRef} style={styles.checkboxContainer}>
				{visibleOptions.map((option) => {
					const checkboxText = getCheckboxText(option);
					return (
						<FormControlLabel
							disabled={
								showNumResultsPerOption &&
								!betterData[option] &&
								!state[searchSettingsName][filter][option]
							}
							key={checkboxText}
							value={checkboxText}
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
									name={checkboxText}
									checked={state[searchSettingsName][filter][option] || false}
									onChange={(event) => handleFilterChange(event)}
									key={checkboxText}
								/>
							}
							label={checkboxText}
							labelPlacement="end"
							ref={checkboxRef}
						/>
					);
				})}
			</div>
			{(showSeeMore || showClear) && (
				<ButtonGroup
					state={state}
					dispatch={dispatch}
					showSeeMore={showSeeMore}
					showClear={showClear}
					showingAllOptions={showingAllOptions}
					handleSeeMore={handleSeeMore}
					handleClear={handleClear}
				/>
			)}
		</FormGroup>
	);
};

ButtonGroup.propTypes = {
	state: PropTypes.shape({
		searchSettings: PropTypes.object,
	}),
	dispatch: PropTypes.func,
	showSeeMore: PropTypes.bool,
	showClear: PropTypes.bool,
	showingAllOptions: PropTypes.bool,
	handleSeeMore: PropTypes.func,
	handleClear: PropTypes.func,
};

MultiSelectFilter.propTypes = {
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
};

export default MultiSelectFilter;
