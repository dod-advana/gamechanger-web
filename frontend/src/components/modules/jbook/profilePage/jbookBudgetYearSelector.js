import React, { useCallback } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { useStyles } from '../../default/defaultViewHeaderHandler.js';

const JBookBudgetYearSelector = ({
	profilePageBudgetYear = '',
	budgetYearProjectData = {},
	selectedPortfolio,
	selectBudgetYearProjectData,
	formControlStyle,
	width,
}) => {
	const classes = useStyles();

	// handle budget year selector change
	const handleChangeBudgetYear = useCallback(
		(event) => {
			try {
				const year = event.target.value;

				selectBudgetYearProjectData(budgetYearProjectData, year, selectedPortfolio);
			} catch (err) {
				console.log('Error setting profile page budget year');
				console.log(err);
			}
		},
		[budgetYearProjectData, selectedPortfolio, selectBudgetYearProjectData]
	);

	const renderBudgetYearOptions = useCallback(() => {
		let menuItems = [];

		menuItems = menuItems.concat(
			Object.keys(budgetYearProjectData).map((year) => {
				return (
					<MenuItem key={year} value={year} style={{ display: 'flex', padding: '3px 6px' }}>
						{year}
					</MenuItem>
				);
			})
		);

		return menuItems;
	}, [budgetYearProjectData]);

	return (
		<FormControl variant="outlined" classes={{ root: classes.root }} style={formControlStyle}>
			<InputLabel classes={{ root: classes.formlabel }} id="portfolio-name-select">
				Budget Year
			</InputLabel>
			<Select
				className={`MuiInputBase-root`}
				labelId="budget-year"
				label="Budget Year"
				id="budget-year-select"
				value={profilePageBudgetYear}
				onChange={handleChangeBudgetYear}
				classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
				style={{ width: width ?? 150 }}
			>
				{renderBudgetYearOptions()}
			</Select>
		</FormControl>
	);
};

export default JBookBudgetYearSelector;
