import React, { useCallback } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { setState } from '../../../../utils/sharedFunctions';
import { useStyles } from '../../default/defaultViewHeaderHandler.js';
import _ from 'lodash';

const JBookPortfolioSelector = ({
	portfolios,
	selectedPortfolio,
	dispatch,
	formControlStyle,
	width,
	projectData = null,
	docID,
	getCommentThread,
	updatePortfolioSpecificFilters,
	pageDisplayed,
}) => {
	const classes = useStyles();

	// handle portfolio selector change
	const handleChangePortfolio = useCallback(
		(event) => {
			try {
				const name = event.target.value;
				setState(dispatch, {
					selectedPortfolio: name,
					reviewData:
						projectData && projectData.reviews && projectData.reviews[name]
							? projectData.reviews[name]
							: {},
				});
				if (pageDisplayed === 'profile') {
					getCommentThread(docID, name);
				} else {
					// get tag list
					let selectedPortfolio = _.find(portfolios, (item) => item.name === name);
					let tags = selectedPortfolio ? selectedPortfolio.tags : [];
					updatePortfolioSpecificFilters(name, tags);
				}
			} catch (err) {
				console.log('Error setting portfolio');
				console.log(err);
			}
		},
		[dispatch, projectData, pageDisplayed, getCommentThread, docID, portfolios, updatePortfolioSpecificFilters]
	);

	const renderPortfolioOptions = useCallback(() => {
		let menuItems = [
			<MenuItem key={'General'} value={'General'} style={{ display: 'flex', padding: '3px 6px' }}>
				General
			</MenuItem>,
		];

		menuItems = menuItems.concat(
			portfolios.map((portfolio, indexAsKey) => {
				return (
					<MenuItem key={indexAsKey} value={portfolio.name} style={{ display: 'flex', padding: '3px 6px' }}>
						{portfolio.name}
					</MenuItem>
				);
			})
		);

		return menuItems;
	}, [portfolios]);

	return (
		<FormControl variant="outlined" classes={{ root: classes.root }} style={formControlStyle}>
			<InputLabel classes={{ root: classes.formlabel }} id="portfolio-name-select">
				Portfolio
			</InputLabel>
			<Select
				className={`MuiInputBase-root`}
				labelId="portfolio-name"
				label="Portfolio"
				id="portfolio-name-select"
				data-cy="portfolio-select"
				value={selectedPortfolio}
				onChange={handleChangePortfolio}
				classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
				style={{ width: width ?? 150 }}
			>
				{renderPortfolioOptions()}
			</Select>
		</FormControl>
	);
};

export default JBookPortfolioSelector;
