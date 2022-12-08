import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import Button from '@mui/material/Button';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

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

const TopButtonGroup = ({ state, dispatch, showClear, handleSelectAll, handleClear }) => {
	return (
		<div style={{ ...styles.buttonContainer, paddingBottom: '10px' }}>
			{
				<Button variant="text" onClick={() => handleSelectAll(state, dispatch)} sx={styles.textButton}>
					Select All
				</Button>
			}
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

const BottomButtonGroup = ({
	state,
	dispatch,
	showSeeMore,
	showClear,
	showingAllOptions,
	handleSeeMore,
	handleClear,
}) => {
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
	trackingName,
	showNumResultsPerOption = false,
	handleFilterChange,
	handleSelectAll,
	handleClear,
	showSelectAll,
	showClear,
	isChecked,
	children,
}) => {
	const [showSeeMore, setShowSeeMore] = useState(false);
	const [maxNumVisible, setMaxNumVisible] = useState();
	const [showingAllOptions, setShowingAllOptions] = useState(false);

	const MAX_HEIGHT = 500;

	const betterData = {};
	originalFilters.forEach((option) => {
		betterData[option[0]] = option[1];
	});
	let visibleOptions = originalFilters.map((option) => option[0]);
	if (maxNumVisible && !showingAllOptions) {
		visibleOptions = visibleOptions.slice(0, maxNumVisible);
	}

	const containerRef = useRef();
	const checkboxRef = useRef();

	const handleFilterChangeAndTrack = (event) => {
		handleFilterChange(event);
		trackEvent(
			getTrackingNameForFactory(state.cloneData.clone_name),
			trackingName,
			event.target.name,
			event.target.checked ? 1 : 0
		);
	};

	const handleSeeMore = () => {
		setShowingAllOptions(!showingAllOptions);
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
			{showSelectAll && (
				<TopButtonGroup
					state={state}
					dispatch={dispatch}
					showClear={showClear}
					handleSelectAll={handleSelectAll}
					handleClear={handleClear}
				/>
			)}
			<div ref={containerRef} style={styles.checkboxContainer}>
				{children ||
					visibleOptions.map((option) => {
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
										checked={isChecked(option) || false}
										onChange={(event) => handleFilterChangeAndTrack(event)}
										key={checkboxText}
									/>
								}
								label={checkboxText}
								labelPlacement="end"
								ref={checkboxRef}
								data-cy={`filter-option-${option}`}
							/>
						);
					})}
			</div>
			{(showSeeMore || (showClear && !showSelectAll)) && (
				<BottomButtonGroup
					state={state}
					dispatch={dispatch}
					showSeeMore={showSeeMore}
					showClear={showClear && !showSelectAll}
					showingAllOptions={showingAllOptions}
					handleSeeMore={handleSeeMore}
					handleClear={handleClear}
				/>
			)}
		</FormGroup>
	);
};

TopButtonGroup.propTypes = {
	state: PropTypes.shape({
		searchSettings: PropTypes.object,
	}),
	dispatch: PropTypes.func,
	handleSelectAll: PropTypes.func,
	handleClear: PropTypes.func,
};

BottomButtonGroup.propTypes = {
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

MultiSelectFilter.defaultProps = {
	showSelectAll: false,
	handleSelectAll: () => {},
};

MultiSelectFilter.propTypes = {
	state: PropTypes.shape({
		searchSettings: PropTypes.object,
	}),
	dispatch: PropTypes.func,
	classes: PropTypes.object,
	searchSettingsName: PropTypes.string,
	filter: PropTypes.string,
	originalFilters: PropTypes.array,
	trackingName: PropTypes.string,
	showNumResultsPerOption: PropTypes.bool,
	preventSearchOnChange: PropTypes.bool,
	handleFilterChange: PropTypes.func,
	handleClear: PropTypes.func,
	showClear: PropTypes.bool,
	isChecked: PropTypes.func,

	showSelectAll: PropTypes.bool,
	handleSelectAll: PropTypes.func,
};

export default MultiSelectFilter;
