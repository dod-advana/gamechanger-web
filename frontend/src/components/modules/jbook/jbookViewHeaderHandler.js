import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { createCopyTinyUrl, setState } from '../../../utils/sharedFunctions';
import { getCurrentView } from '../../../utils/gamechangerUtils';
import _, { isArray } from 'lodash';
import FilterList from '../../common/FilterList';

import GCButton from '../../common/GCButton';
import GCTooltip from '../../common/GCToolTip';
import JBookPortfolioSelector from './portfolioBuilder/jbookPortfolioSelector';
import ExportIcon from '../../../images/icon/Export.svg';
import { useStyles } from '../../modules/default/defaultViewHeaderHandler.js';
import { filterSortFunction } from './jbookMainViewHelper';
import GameChangerAPI from '../../api/gameChanger-service-api';

const gamechangerAPI = new GameChangerAPI();

// Internet Explorer 6-11
const IS_IE = /*@cc_on!@*/ !!document.documentMode;

// Edge 20+
const IS_EDGE = !IS_IE && !!window.StyleMedia;

const filterNameMap = {
	budgetYear: 'Budget Year',
	budgetType: 'PL Title',
	serviceAgency: 'Service/Agency',
	raccts: 'Main Account',
	budgetActivity: 'Budget Activity',
	budgetSubActivity: 'Budget Sub Activity',
	programElement: 'BLI',
	projectNum: 'Project #',
	minBY1Funding: 'BY1 Fund Min',
	maxBY1Funding: 'BY1 Fund Max',
	minTotalCost: 'Total Fund Min',
	maxTotalCost: 'Total Fund Max',
	primaryReviewer: 'Initial Reviewer',
	serviceReviewer: 'Service Reviewer',
	pocReviewer: 'POC Reviewer',
	reviewStatus: 'Review Status',
	hasKeywords: 'Keywords',
	primaryClassLabel: 'Tag',
	sourceTag: 'Source',
};

const createFilterArray = (settings, options) => {
	const processedFilters = [];
	Object.keys(settings).forEach((type) => {
		if (Object.keys(options).includes(type) && type !== 'sort') {
			if (isArray(settings[type])) {
				settings[type].forEach((option) => {
					processedFilters.push({ type, optionName: option });
				});
			} else {
				processedFilters.push({ type, optionName: settings[type] });
			}
		}
	});
	return processedFilters;
};

const processFilters = (settings, options) => {
	const searchSettings = _.cloneDeep(settings);
	for (const optionType in options) {
		if (
			options[optionType] &&
			searchSettings[optionType] &&
			options[optionType].length === searchSettings[optionType].length
		) {
			delete searchSettings[optionType];
		}

		if (searchSettings?.[optionType]?.length === 0) {
			delete searchSettings[optionType];
		}
	}

	for (const setting in searchSettings) {
		if (!searchSettings[setting]) {
			delete searchSettings[setting];
		}
	}
	return createFilterArray(searchSettings, options);
};

const JbookViewHeaderHandler = (props) => {
	const classes = useStyles();
	const { context = {}, extraStyle = {}, gameChangerAPI, gameChangerUserAPI } = props;

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
		runSearch,
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
				let user = await gameChangerUserAPI.getUserProfileData();
				await gameChangerAPI
					.callDataFunction({
						functionName: 'getPortfolios',
						cloneName: 'jbook',
						options: { id: user.data.id },
					})
					.then((data) => {
						let publicData = data.data ? data.data.publicPortfolios : [];
						let privateData = data.data ? data.data.privatePortfolios : [];
						let portfolios = [...publicData, ...privateData];
						portfolios.sort((a, b) => {
							const nameA = a.name.toUpperCase(); // ignore upper and lowercase
							const nameB = b.name.toUpperCase(); // ignore upper and lowercase
							if (nameA < nameB) {
								return -1;
							}
							if (nameA > nameB) {
								return 1;
							}
							// names must be equal
							return 0;
						});
						setPortfolios(portfolios);
					});
			};

			fetchPortfolios();
		} catch (e) {
			console.log('Error fetching jbook portfolios');
			console.log(e);
		}
	}, [gameChangerAPI, gameChangerUserAPI]);

	const handleFilterChange = (option, type) => {
		const newSearchSettings = _.cloneDeep(state.jbookSearchSettings);
		let filterTypeStillPresent = false;

		if (isArray(newSearchSettings[type])) {
			const index = newSearchSettings[type].indexOf(option);

			if (index !== -1) {
				newSearchSettings[type].splice(index, 1);
			} else {
				newSearchSettings[type].push(option);
			}
			if (newSearchSettings[type].length) filterTypeStillPresent = true;
		} else {
			newSearchSettings[type] = '';
		}

		newSearchSettings.isFilterUpdate = true;
		newSearchSettings[`${type}Update`] = true;

		let diffSearchSettings = [...state.modifiedSearchSettings];
		if (!filterTypeStillPresent) diffSearchSettings = diffSearchSettings.filter((e) => e !== type);

		setState(dispatch, {
			modifiedSearchSettings: diffSearchSettings,
			jbookSearchSettings: newSearchSettings,
			metricsCounted: false,
			runSearch: true,
			runGraphSearch: true,
		});
	};

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

	const updatePortfolioSpecificFilters = async (portfolio) => {
		const newSearchSettings = {
			...state.jbookSearchSettings,

			primaryReviewerSpecificSelected: false,
			primaryReviewerAllSelected: true,

			serviceReviewerSpecificSelected: false,
			serviceReviewerAllSelected: true,

			hasKeywordsSpecificSelected: false,
			hasKeywordsAllSelected: true,

			classLabelSpecificSelected: false,
			classLabelAllSelected: true,

			sourceTagSpecificSelected: false,
			sourceTagAllSelected: true,

			reviewStatusSpecificSelected: false,
			reviewStatusAllSelected: true,

			primaryReviewStatusSpecificSelected: false,
			primaryReviewStatusAllSelected: true,

			budgetType: state.defaultOptions.budgetType,
			reviewStatus: state.defaultOptions.reviewStatus,
			primaryReviewStatus: state.defaultOptions.primaryReviewStatus,
			primaryReviewer: state.defaultOptions.primaryReviewer,
			serviceReviewer: state.defaultOptions.serviceReviewer,
			pocReviewer: state.defaultOptions.pocReviewer,
			sourceTag: state.defaultOptions.sourceTag,
			hasKeywords: state.defaultOptions.hasKeywords,
			classLabel: state.defaultOptions.classLabel,
		};
		const newDefaultOptions = _.cloneDeep(state.defaultOptions);

		const { data } = await gamechangerAPI.callSearchFunction({
			functionName: 'getUpdatedAgencyFilter',
			cloneName: state.cloneData.clone_name,
			options: { selectedPortfolio: portfolio },
		});
		newSearchSettings.serviceAgency = [];
		newDefaultOptions.serviceAgency = data.serviceAgency
			.map((item) => {
				if (item !== null) {
					return item;
				}
				return 'Blank';
			})
			.sort(filterSortFunction);

		setState(dispatch, {
			jbookSearchSettings: newSearchSettings,
			defaultOptions: newDefaultOptions,
			runSearch: true,
		});
	};

	return (
		<div
			className={'results-count-view-buttons-container'}
			style={{ ...extraStyle, flexDirection: 'column', margin: '5px 0px 0px 0px' }}
		>
			<div className={'view-buttons-container'} style={{ marginRight: 10, zIndex: 99, justifyContent: 'right' }}>
				<JBookPortfolioSelector
					portfolios={portfolios}
					selectedPortfolio={state.selectedPortfolio}
					dispatch={dispatch}
					projectData={projectData}
					updatePortfolioSpecificFilters={updatePortfolioSpecificFilters}
					pageDisplayed={state.pageDisplayed}
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
					data-cy="export-button"
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
					<img
						src={ExportIcon}
						style={{
							margin: '0 0 3px 3px',
							width: 15,
						}}
						alt="export"
					/>
				</GCButton>
			</div>
			<FilterList
				filterNameMap={filterNameMap}
				searchSettings={jbookSearchSettings}
				handleFilterChange={handleFilterChange}
				processFilters={processFilters}
				runSearch={runSearch}
				defaultOptions={defaultOptions}
			/>
		</div>
	);
};

JbookViewHeaderHandler.propTypes = {
	context: PropTypes.objectOf(PropTypes.string),
	extraStyle: PropTypes.objectOf(PropTypes.string),
};

export default JbookViewHeaderHandler;
