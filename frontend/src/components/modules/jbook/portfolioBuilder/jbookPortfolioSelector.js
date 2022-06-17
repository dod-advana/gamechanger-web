import React, { useCallback } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { gcOrange } from '../../../common/gc-colors';
import { setState } from '../../../../utils/sharedFunctions';

const useStyles = makeStyles({
	root: {
		paddingTop: '16px',
		marginRight: '10px',
		'& .MuiInputBase-root': {
			height: '50px',
			fontSize: 20,
		},
		'& .MuiFormLabel-root': {
			fontSize: 20,
		},
		'&:hover .MuiInput-underline:before': {
			borderBottom: `3px solid ${gcOrange}`,
		},
		'& .MuiInput-underline:before': {
			borderBottom: `3px solid rgba(0, 0, 0, 0.42)`,
		},
		'& .MuiInput-underline:after': {
			borderBottom: `3px solid ${gcOrange}`,
		},
		'& .Mui-focused': {
			borderColor: `${gcOrange}`,
			color: `${gcOrange}`,
		},
	},
	selectRoot: {
		color: '#3F4A56',
	},
	selectIcon: {
		marginTop: '4px',
	},
	formlabel: {
		paddingTop: '16px',
	},
});

const PortfolioSelector = ({
	portfolios,
	selectedPortfolio,
	dispatch,
	formControlStyle,
	width,
	projectData = null,
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
			} catch (err) {
				console.log('Error setting portfolio');
				console.log(err);
			}
		},
		[dispatch, projectData]
	);

	const renderPortfolioOptions = useCallback(() => {
		let menuItems = [
			<MenuItem key={'General'} value={'General'} style={{ display: 'flex', padding: '3px 6px' }}>
				General
			</MenuItem>,
		];

		menuItems = menuItems.concat(
			portfolios.map((portfolio) => {
				return (
					<MenuItem
						key={portfolio.name}
						value={portfolio.name}
						style={{ display: 'flex', padding: '3px 6px' }}
					>
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

export default PortfolioSelector;
