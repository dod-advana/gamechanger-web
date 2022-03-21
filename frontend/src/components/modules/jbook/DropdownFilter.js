import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import FilterIcon from './FilterIcon.png';
import { FormControlLabel, Checkbox, TextField } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import GCPrimaryButton from '../../common/GCButton';
import { setState } from '../../../utils/sharedFunctions';
import { JBookContext } from './jbookContext';


const StyledButtonDiv = styled.div`
    border: 1px solid rgba(0,0,0,0.1);
    padding: 3px 7px;
    border-radius: 3px;
    outline: none;
    width: 100%;
    text-align: right;
    cursor: pointer;
`;

const StyledDropdownDiv = styled.div`
    width: ${({ width }) => `${width ? width + 'px' : 'unset'}`};
    padding: 10px;
    display: ${({ show }) => show ? 'block' : 'none'}
    border: 1px solid rgba(0,0,0,0.1);
    position: absolute;
    background-color: white;
	right: ${({ right }) => right ? right : ''};
	max-height: 600px;
`;

const StyledIcon = styled.img`
    width: 20px;
    opacity: .5;
`;

const StyledCheckboxContainer = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
	overflow: auto;
	max-height: 370px;
`;

const StyledAllNoneContainer = styled.div`
	display: flex;
	justify-content: space-around;
`;

const DropdownFilter = (props) => {
	const {
		width,
		options = [],
		clearText = false,
		type,
		setJBookSetting,
		openDropdown,
		setOpenDropdown,
		right,
		secondaryOptions = [],
		secondaryTitle
	} = props;

	const context = useContext(JBookContext);
	const { state, dispatch } = context;
	const { jbookSearchSettings } = state;

	const [textBoxActive, setTextBoxActive] = useState(false);
	const [enterPressed, setEnterPressed] = useState(false);
	const [filteredSearch, setFilteredSearch] = useState('');
	const [filteredOptions, setFilteredOptions] = useState(options);
	const [filteredSecondaryOptions, setFilteredSecondaryOptions] = useState(secondaryOptions ?? []);

	useEffect(() => {
		let newOptions = [...options];
		let newSecondaryOptions = secondaryOptions ?? [];

		if (filteredSearch !== '') {
			newOptions = newOptions.filter(option => {
				return option.toLowerCase().includes(filteredSearch.toLowerCase());
			});

			if (secondaryOptions && secondaryOptions.length && secondaryOptions.length > 0) {
				newSecondaryOptions = [...secondaryOptions].filter(option => {
					return option.toLowerCase().includes(filteredSearch.toLowerCase());
				});
			}
		}

		setFilteredSecondaryOptions(newSecondaryOptions);
		setFilteredOptions(newOptions);

	}, [options, filteredSearch, secondaryOptions]);

	useEffect(() => {
		if (enterPressed) {
			setJBookSetting(type, [...filteredOptions, ...filteredSecondaryOptions], state, dispatch, true);
			setEnterPressed(false);
			setTextBoxActive(false);
			setFilteredSearch('');
		}
		// eslint-disable-next-line
	}, [enterPressed]);

	useEffect(() => {
		if (clearText === true) {
			setFilteredSearch('');
			setTextBoxActive(false);
		}
	}, [clearText, setFilteredSearch]);

	useEffect(() => {
		function onKeyDown(e) {
			if (e.key === 'Enter' && textBoxActive) {
				document.activeElement.blur();
				setEnterPressed(true);
			}
		}
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [textBoxActive]);

	const renderAllNone = () => {

		return (
			<StyledAllNoneContainer>
				<FormControlLabel
					name={'All'}
					value={'All'}
					control={<Checkbox
						style={{
							backgroundColor: '#ffffff',
							borderRadius: '5px',
							padding: '2px',
							border: '2px solid #bdccde',
							pointerEvents: 'none',
							margin: '2px 5px 0px'
						}}
						onClick={() => setJBookSetting(type, 'all', state, dispatch)}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={jbookSearchSettings && jbookSearchSettings[type] && jbookSearchSettings[type].length === options.length}
						checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
						name={'All'}
					/>}
					label={<span style={{ fontSize: 13, fontWeight: 600 }}>All</span>}
					labelPlacement="end"
				/>
				<FormControlLabel
					name={'None'}
					value={'None'}
					control={<Checkbox
						style={{
							backgroundColor: '#ffffff',
							borderRadius: '5px',
							padding: '2px',
							border: '2px solid #bdccde',
							pointerEvents: 'none',
							margin: '2px 5px 0px'
						}}
						onClick={() => setJBookSetting(type, 'none', state, dispatch)}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={jbookSearchSettings && jbookSearchSettings[type] && jbookSearchSettings[type].length === 0}
						checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
						name={'None'}
					/>}
					label={<span style={{ fontSize: 13, fontWeight: 600 }}>Clear</span>}
					labelPlacement="end"
				/>
			</StyledAllNoneContainer>
		);
	};

	const renderOptions = () => {
		const checkboxes = [];
		const secondaryCheckboxes = [];

		for (const option of filteredOptions) {
			checkboxes.push(
				<FormControlLabel
					name={option}
					value={option}
					style={{ margin: '0 20px 0 0' }}
					key={option}
					control={<Checkbox
						style={{
							backgroundColor: '#ffffff',
							borderRadius: '5px',
							padding: '2px',
							border: '2px solid #bdccde',
							pointerEvents: 'none',
							margin: '2px 5px 0px'
						}}
						onClick={() => {
							if (jbookSearchSettings.clearText === true) {
								setJBookSetting('clearText', false, state, dispatch);
							}
							setJBookSetting(type, option, state, dispatch);
						}}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={jbookSearchSettings && jbookSearchSettings[type] && jbookSearchSettings[type].indexOf(option) !== -1}
						checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
						name={options}
					/>}
					label={<span style={{ fontSize: 13, margin: '0 5px', fontWeight: 600 }}>{option}</span>}
					labelPlacement="end"
				/>
			);
		}

		for (const option of filteredSecondaryOptions) {
			secondaryCheckboxes.push(
				<FormControlLabel
					name={option}
					value={option}
					style={{ margin: '0 20px 0 0' }}
					key={option}
					control={<Checkbox
						style={{
							backgroundColor: '#ffffff',
							borderRadius: '5px',
							padding: '2px',
							border: '2px solid #bdccde',
							pointerEvents: 'none',
							margin: '2px 5px 0px'
						}}
						onClick={() => {
							if (jbookSearchSettings.clearText === true) {
								setJBookSetting('clearText', false, state, dispatch);
							}
							setJBookSetting(type, option, state, dispatch);
						}}
						icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
						checked={jbookSearchSettings && jbookSearchSettings[type] && jbookSearchSettings[type].indexOf(option) !== -1}
						checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
						name={options}
					/>}
					label={<span style={{ fontSize: 13, margin: '0 5px', fontWeight: 600 }}>{option}</span>}
					labelPlacement="end"
				/>
			);
		}

		return (
			<StyledCheckboxContainer>
				{checkboxes}
				{secondaryCheckboxes.length > 0 &&
					<>
						<hr style={{ margin: '7px 0' }} />
						{secondaryTitle}
						{secondaryCheckboxes}
					</>
				}

			</StyledCheckboxContainer>
		);
	};

	const renderFilterSearch = () => {
		return (
			<TextField
				placeholder="Filter Search"
				variant="outlined"
				value={filteredSearch}
				style={{ backgroundColor: 'white', width: '100%', margin: '15px 0 0 0' }}
				onBlur={(event) => {
					setFilteredSearch(event.target.value);
					if (jbookSearchSettings.clearText === true) {
						setJBookSetting('clearText', false, state, dispatch);
					}
				}}
				onChange={(event) => {
					setTextBoxActive(true);
					setFilteredSearch(event.target.value);
				}}
				inputProps={{
					style: {
						width: '100%'
					}
				}}
			/>
		);
	};

	return (
		<div style={{ width: '100%' }}>
			<StyledButtonDiv onClick={() => setOpenDropdown(type + 'Dropdown', !openDropdown)}>
				<StyledIcon src={FilterIcon} />
			</StyledButtonDiv>
			<StyledDropdownDiv width={width} show={openDropdown} right={right}>
				{renderAllNone()}
				{(options.length + secondaryOptions.length) > 12 &&
					renderFilterSearch()
				}
				<hr style={{ margin: '7px 0' }} />
				{renderOptions()}
				<hr style={{ margin: '7px 0' }} />
				<GCPrimaryButton
					style={{ margin: '5px 0', color: '#3F4956', backgroundColor: 'white', borderColor: '#3F4956', height: 25, width: 110, fontSize: '12px', lineHeight: 0, padding: 0 }}
					onClick={() => setState(dispatch, { runSearch: true, resultsPage: 1, loading: true })}
				>
					Update Search
				</GCPrimaryButton>
			</StyledDropdownDiv>
		</div>
	);
};

export default DropdownFilter;
