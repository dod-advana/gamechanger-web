import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { createCopyTinyUrl, setState } from '../../../utils/sharedFunctions';
import { getCurrentView } from '../../../utils/gamechangerUtils';
import _ from 'lodash';

import GCButton from '../../common/GCButton';
import GCTooltip from '../../common/GCToolTip';
import { FormControl, InputLabel, MenuItem, Select, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { gcOrange } from '../../common/gc-colors';
import PortfolioSelector from './portfolioBuilder/jbookPortfolioSelector';
import ExportIcon from '../../../images/icon/Export.svg';

// Internet Explorer 6-11
const IS_IE = /*@cc_on!@*/ false || !!document.documentMode;

// Edge 20+
const IS_EDGE = !IS_IE && !!window.StyleMedia;

const PORTFOLIO_FILTERS = [
	'reviewStatus',
	'primaryReviewStatus',
	'primaryReviewer',
	'serviceReviewer',
	'pocReviewer',
	'sourceTag',
	'hasKeyword',
	'primaryClassLabel',
	'budgetType',
];

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

const JbookViewHeaderHandler = (props) => {
	const classes = useStyles();
	const { context = {}, extraStyle = {}, gameChangerAPI } = props;

	const { state, dispatch } = context;
	const {
		cloneData,
		componentStepNumbers,
		currentViewName,
		jbookSearchSettings,
		defaultOptions,
		listView,
		viewNames,
		projectData,
		categorySorting,
		activeCategoryTab,
		currentSort,
		currentOrder,
		sortSelected,
		searchText,
		exportLoading,
	} = state;

	const [dropdownValue, setDropdownValue] = useState(getCurrentView(currentViewName, listView));
	const [portfolios, setPortfolios] = useState([]);

	// if the user hasn't manually chosen a sort and they have entered search text, change the sort to Relevance
	useEffect(() => {
		if (searchText && searchText !== '' && !sortSelected && currentSort !== 'Relevance') {
			setState(dispatch, { currentSort: 'Relevance' });
		} else if (!searchText || (searchText === '' && !sortSelected)) {
			setState(dispatch, { currentSort: 'Budget Year' });
		}
	}, [dispatch, currentSort, searchText, sortSelected]);

	//If portfolio filters are present when selecting a different portfolio, resets those filters and runs updates search
	useEffect(() => {
		let search = false;
		PORTFOLIO_FILTERS.forEach((filter) => {
			if (jbookSearchSettings[filter] !== defaultOptions[filter]) {
				search = true;
			}
		});
		if (search) {
			dispatch({ type: 'RESET_PORTFOLIO_FILTERS' });
			setState(dispatch, { runSearch: true });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.selectedPortfolio, dispatch]);

	useEffect(() => {
		if (IS_EDGE) {
			setDropdownValue('List');
			setState(dispatch, { currentViewName: 'Card', listView: true });
		}
	}, [dispatch]);

	// fetch portfolio data for portfolio selector
	useEffect(() => {
		try {
			const fetchPortfolios = async () => {
				gameChangerAPI
					.callDataFunction({
						functionName: 'getPortfolios',
						cloneName: 'jbook',
						options: {},
					})
					.then((data) => {
						let pData = data.data !== undefined ? data.data : [];
						setPortfolios(pData);
					});
			};

			fetchPortfolios();
		} catch (e) {
			console.log('Error fetching jbook portfolios');
			console.log(e);
		}
	}, [gameChangerAPI]);

	// handle view selector change
	const handleChangeView = useCallback(
		(event) => {
			try {
				const {
					target: { value },
				} = event;
				const params = new URLSearchParams(
					window.location.hash.replace(`#/${state.cloneData.url.toLowerCase()}`, '')
				);
				switch (value) {
					case 'List':
						setState(dispatch, { currentViewName: 'Card', listView: true });
						params.delete('view');
						break;
					case 'Grid':
						setState(dispatch, { currentViewName: 'Card', listView: false });
						params.delete('view');
						break;
					case 'Graph':
						setState(dispatch, { currentViewName: value, runGraphSearch: true });
						params.set('view', 'graph');
						break;
					case 'Explorer':
					default:
						setState(dispatch, { currentViewName: value });
						params.delete('view');
				}
				setDropdownValue(value);
				const linkString = `/#/${state.cloneData.url.toLowerCase()}?${params}`;
				window.history.pushState(null, document.title, linkString);
			} catch (err) {
				console.log('Error changing the view');
				console.log(err);
			}
		},
		[dispatch, state.cloneData.url]
	);

	const handleChangeSort = (event) => {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.isFilterUpdate = true;
		const {
			target: { value },
		} = event;
		setState(dispatch, {
			currentSort: value,
			currentOrder: value === 'Alphabetical' ? 'asc' : 'desc',
			resultsPage: 1,
			docSearchResults: [],
			replaceResults: true,
			runSearch: true,
			infiniteScrollPage: 1,
			searchSettings: newSearchSettings,
			sortSelected: true,
		});
	};

	const handleChangeOrder = (value) => {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.isFilterUpdate = true;
		setState(dispatch, {
			currentOrder: value,
			resultsPage: 1,
			docSearchResults: [],
			replaceResults: true,
			runSearch: true,
			searchSettings: newSearchSettings,
		});
	};

	return (
		<div className={'results-count-view-buttons-container'} style={extraStyle}>
			<div className={'view-buttons-container'} style={{ marginRight: 35, zIndex: 99 }}>
				<PortfolioSelector
					portfolios={portfolios}
					selectedPortfolio={state.selectedPortfolio}
					dispatch={dispatch}
					projectData={projectData}
				/>
				{categorySorting !== undefined && categorySorting[activeCategoryTab] !== undefined && (
					<>
						<FormControl variant="outlined" classes={{ root: classes.root }}>
							<InputLabel classes={{ root: classes.formlabel }} id="view-name-select">
								Sort
							</InputLabel>
							<Select
								labelId="view-name"
								label="Sort"
								id="view-name-select"
								value={currentSort}
								onChange={handleChangeSort}
								classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
								className="MuiInputBase-root"
								autoWidth
							>
								{categorySorting[activeCategoryTab]
									.filter((sort) => !((!searchText || searchText === '') && sort === 'Relevance'))
									.map((sort) => {
										return (
											<MenuItem
												key={`${sort}-key`}
												value={sort}
												style={{ display: 'flex', padding: '3px 6px' }}
											>
												{sort}
											</MenuItem>
										);
									})}
							</Select>
						</FormControl>
						{currentSort !== 'Alphabetical' ? (
							<div style={{ width: '40px', marginRight: '6px', display: 'flex' }}>
								<i
									className="fa fa-sort-amount-desc"
									style={{
										marginTop: '80%',
										marginRight: '5px',
										cursor: 'pointer',
										color: currentOrder === 'desc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('desc');
									}}
								/>
								<i
									className="fa fa-sort-amount-asc"
									style={{
										marginTop: '80%',
										cursor: 'pointer',
										color: currentOrder === 'asc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('asc');
									}}
								/>
							</div>
						) : (
							<div style={{ width: '40px', marginRight: '6px', display: 'flex' }}>
								<i
									className="fa fa-sort-alpha-asc"
									style={{
										marginTop: '80%',
										marginRight: '5px',
										cursor: 'pointer',
										color: currentOrder === 'asc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('asc');
									}}
								/>
								<i
									className="fa fa-sort-alpha-desc"
									style={{
										marginTop: '80%',
										cursor: 'pointer',
										color: currentOrder === 'desc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('desc');
									}}
								/>
							</div>
						)}
					</>
				)}
				<FormControl variant="outlined" classes={{ root: classes.root }}>
					<InputLabel classes={{ root: classes.formlabel }} id="view-name-select">
						View
					</InputLabel>
					<Select
						className={`MuiInputBase-root tutorial-step-${componentStepNumbers['Change View']}`}
						labelId="view-name"
						label="View"
						id="view-name-select"
						value={dropdownValue}
						onChange={handleChangeView}
						classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
						autoWidth
					>
						{viewNames.map((view) => {
							if (view.name === 'Card') {
								return [
									<MenuItem
										key={`Card-List`}
										value={'List'}
										style={{ display: 'flex', padding: '3px 6px' }}
									>
										List View
									</MenuItem>,
									<MenuItem
										key={`Card-Grid`}
										value={'Grid'}
										style={{ display: 'flex', padding: '3px 6px' }}
									>
										Grid View
									</MenuItem>,
								];
							} else {
								return (
									<MenuItem
										key={`${view.name}-key`}
										value={view.name}
										style={{ display: 'flex', padding: '3px 6px' }}
									>
										{view.title}
									</MenuItem>
								);
							}
						})}
					</Select>
				</FormControl>
				<GCButton
					className={`tutorial-step-${state.componentStepNumbers['Share Search']}`}
					id={'gcShareSearch'}
					onClick={() => createCopyTinyUrl(cloneData.url, dispatch)}
					style={{ height: 50, padding: '0px 7px', margin: '16px 0px 0px 10px', minWidth: 50 }}
					disabled={!state.rawSearchResults || state.rawSearchResults.length <= 0}
				>
					<GCTooltip title="Share" placement="bottom" arrow>
						<i className="fa fa-share" style={{ margin: '0 0 0 5px' }} />
					</GCTooltip>
				</GCButton>

				<GCButton
					style={{ height: 50, padding: '0px 7px', margin: '16px 0px 0px 10px', minWidth: 50 }}
					onClick={async () => {
						try {
							setState(dispatch, {
								exportDialogVisible: true,
							});
						} catch (e) {
							console.log(e);
						}
					}}
				>
					{!exportLoading ? (
						<img
							src={ExportIcon}
							style={{
								margin: '0 0 3px 3px',
								width: 15,
							}}
							alt="export"
						/>
					) : (
						<CircularProgress color="#515151" size={25} style={{ margin: '8px' }} />
					)}
					{/* <img src={ExportIcon} style={{ margin: '0 0 3px 5px', width: 20, opacity: !mainPageData || (mainPageData.docs && mainPageData.docs.length <= 0) ? .6 : 1 }} alt="export"/> */}
				</GCButton>
			</div>
		</div>
	);
};

JbookViewHeaderHandler.propTypes = {
	context: PropTypes.objectOf(PropTypes.string),
	extraStyle: PropTypes.objectOf(PropTypes.string),
};

export default JbookViewHeaderHandler;
