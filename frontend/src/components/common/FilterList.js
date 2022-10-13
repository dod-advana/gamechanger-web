import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import GCTooltip from './GCToolTip';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';

const StyledContainer = styled.div`
	display: flex;
	justify-content: left;
	margin: ${({ margin }) => margin ?? '15px 0 0 0'};
	flex-wrap: wrap;
`;

const FilterList = ({
	filterNameMap,
	searchSettings,
	handleFilterChange,
	processFilters,
	margin,
	runSearch,
	defaultOptions,
	loading = false,
}) => {
	const [filterList, setFilterList] = useState([]);

	//Processes the search settings to find which filters are applied for displaying at the top
	useEffect(() => {
		if (runSearch || loading) {
			let cleanedSearchSettings = searchSettings;
			if (processFilters) {
				cleanedSearchSettings = processFilters(searchSettings, defaultOptions);
			}
			setFilterList(cleanedSearchSettings);
		}
	}, [searchSettings, runSearch, processFilters, defaultOptions, loading]);

	return (
		<StyledContainer margin={filterList && filterList.length > 0 ? margin : null}>
			{filterList.map((filter) => {
				const { type, optionName } = filter;
				const typeText = filterNameMap[type] ? filterNameMap[type] + ': ' : type + ': ';

				return (
					<GCTooltip title={`${typeText}${optionName}`} placement="top" arrow>
						<Button
							variant="outlined"
							backgroundColor="white"
							display="inline-flex"
							style={{
								marginRight: '10px',
								marginBottom: '15px',
								padding: '10px 15px',
								backgroundColor: 'white',
								color: 'rgb(28, 45, 101)',
								height: 40,
								maxWidth: 400,
								ariaPressed: 'true',
							}}
							endIcon={<CloseIcon />}
							onClick={() => {
								handleFilterChange(optionName, type);
							}}
						>
							<span
								style={{
									fontFamily: 'Montserrat',
									fontWeight: 300,
									color: 'black',
									textOverflow: 'ellipsis',
									overflow: 'hidden',
									whiteSpace: 'nowrap',
								}}
							>
								{`${typeText}${optionName}`}
							</span>
						</Button>
					</GCTooltip>
				);
			})}
		</StyledContainer>
	);
};

FilterList.propTypes = {
	searchSettings: PropTypes.objectOf(PropTypes.string),
	handleFilterChange: PropTypes.func,
	filterNameMap: PropTypes.objectOf(PropTypes.string),
	processFilters: PropTypes.func,
	margin: PropTypes.string,
	runSearch: PropTypes.bool,
	defaultOptions: PropTypes.objectOf(PropTypes.string),
	loading: PropTypes.bool,
};

export default FilterList;
