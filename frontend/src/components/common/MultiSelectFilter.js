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
	filter,
	originalFilters,
	allSelected,
	specificSelected,
	update,
	trackingName,
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

	const handleFilterChange = (event, gcState, gcDispatch) => {
		const newSearchSettings = structuredClone(gcState.searchSettings);
		if (gcState.searchSettings[allSelected]) {
			newSearchSettings[allSelected] = false;
			newSearchSettings[specificSelected] = true;
			setShowClear(true);
		}
		let name = event.target.name.substring(0, event.target.name.lastIndexOf('(') - 1);
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
		setState(gcDispatch, {
			searchSettings: newSearchSettings,
			metricsCounted: false,
			runSearch: true,
			runGraphSearch: true,
		});
		trackEvent(
			getTrackingNameForFactory(gcState.cloneData.clone_name),
			trackingName,
			event.target.name,
			event.target.value ? 1 : 0
		);
	};

	const handleSeeMore = () => {
		setShowingAllOptions(!showingAllOptions);
	};

	const handleClear = (gcState, gcDispatch) => {
		const newSearchSettings = structuredClone(gcState.searchSettings);

		// Set all options to false
		const newFilter = Object.keys(gcState.searchSettings[filter]).reduce((accumulator, key) => {
			return { ...accumulator, [key]: false };
		}, {});

		newSearchSettings[filter] = newFilter;
		newSearchSettings[allSelected] = true;
		newSearchSettings[specificSelected] = false;
		newSearchSettings.isFilterUpdate = true;
		newSearchSettings[update] = true;
		setShowClear(false);
		setState(gcDispatch, {
			searchSettings: newSearchSettings,
			metricsCounted: false,
			runSearch: true,
			runGraphSearch: true,
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
					return (
						<FormControlLabel
							disabled={!betterData[option] && !state.searchSettings[filter][option]}
							key={`${option} (${betterData[option]})`}
							value={`${option} (${betterData[option]})`}
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
									name={`${option} (${betterData[option]})`}
									checked={state.searchSettings[filter][option] || false}
									onChange={(event) => handleFilterChange(event, state, dispatch)}
									key={`${option} (${betterData[option]})`}
								/>
							}
							label={`${option} (${betterData[option]})`}
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
	filter: PropTypes.string,
	originalFilters: PropTypes.object,
	allSelected: PropTypes.string,
	specificSelected: PropTypes.string,
	update: PropTypes.string,
	trackingName: PropTypes.string,
};

export default MultiSelectFilter;
