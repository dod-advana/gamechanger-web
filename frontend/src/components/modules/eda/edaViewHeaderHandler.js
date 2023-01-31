import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createCopyTinyUrl, setState } from '../../../utils/sharedFunctions';
import { getCurrentView, numberWithCommas } from '../../../utils/gamechangerUtils';
import _, { isArray } from 'lodash';
import { SelectedDocsDrawer } from '../../searchBar/GCSelectedDocsDrawer';
import FilterList from '../../common/FilterList';
import GCButton from '../../common/GCButton';
import GCTooltip from '../../common/GCToolTip';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { useStyles } from '../../modules/default/defaultViewHeaderHandler.js';
import Typography from '@material-ui/core/Typography';
import { removeChildrenFromListDF } from './edaUtils';

// Internet Explorer 6-11
const IS_IE = /*@cc_on!@*/ !!document.documentMode;

// Edge 20+
const IS_EDGE = !IS_IE && !!window.StyleMedia;

const filterNameMap = {
	organizations: 'Organizations',
	aggregations: 'Aggregations',
	startDate: 'Start Date',
	endDate: 'End Date',
	issueAgency: 'Issue Agency',
	issueOfficeDoDAAC: 'Issue Office DoDAAC',
	issueOfficeName: 'Issue Office Name',
	fiscalYears: 'Fiscal Year',
	minObligatedAmount: 'Min Obligated Amount',
	maxObligatedAmount: 'Max Obligated Amount',
	vendorName: 'Vendor Name',
	fundingOfficeCode: 'Funding Office DoDAAC',
	fundingAgencyName: 'Funding Agency Name',
	psc: 'PSC',
	naicsCode: 'NAICS',
	duns: 'DUNS',
	contractData: 'EDA Format',
	contractsOrMods: 'Contracts/Mods',
	idvPIID: 'IDV PIID',
	piid: 'PIID',
	modNumber: 'Mod Number',
	excludeTerms: 'Excluded Term',
	contractSOW: 'Contract SOW',
	clinText: 'CLIN Data',
	reqDesc: 'Desc of Reqs',
};

const EDAViewHeaderHandler = (props) => {
	const classes = useStyles();
	const { context = {}, extraStyle = {} } = props;

	const { state, dispatch } = context;
	const {
		cloneData,
		componentStepNumbers,
		currentViewName,
		listView,
		viewNames,
		categorySorting,
		activeCategoryTab,
		currentSort,
		currentOrder,
		edaSearchSettings,
		runningSearch,
		rawSearchResults,
		count,
		timeFound,
		runSearch,
		defaultOptions,
		loading,
	} = state;

	const [dropdownValue, setDropdownValue] = useState(getCurrentView(currentViewName, listView));

	useEffect(() => {
		if (IS_EDGE) {
			setDropdownValue('List');
			setState(dispatch, { currentViewName: 'Card', listView: true });
		}
	}, [dispatch]);

	const handleFilterChange = (option, type) => {
		const newSearchSettings = structuredClone(state.edaSearchSettings);

		if (isArray(newSearchSettings[type])) {
			let index;
			if (type === 'naicsCode' || type === 'psc') {
				index = _.findIndex(
					newSearchSettings[type],
					(node) => node.code === option || `${node.code}*` === option
				);
			} else {
				index = newSearchSettings[type].indexOf(option);
			}

			if (index !== -1) {
				newSearchSettings[type].splice(index, 1);
			} else {
				newSearchSettings[type].push(option);
			}
		} else if (typeof newSearchSettings[type] === 'string') {
			if (type === 'contractsOrMods') {
				newSearchSettings[type] = 'both';
			} else {
				newSearchSettings[type] = '';
			}
		} else if (type === 'contractData') {
			newSearchSettings[type] = { pds: false, syn: false, fpds: false, none: false };
		}

		setState(dispatch, {
			edaSearchSettings: newSearchSettings,
			runSearch: true,
			runGraphSearch: true,
		});
	};

	const setDrawer = (open) => {
		setState(dispatch, { docsDrawerOpen: open });
	};

	const setDrawerReady = (ready) => {
		setState(dispatch, { isDrawerReady: ready });
	};

	const setStepIndex = (stepIndex) => {
		setState(dispatch, { stepIndex: stepIndex });
	};

	const removeSelectedDocument = (key) => {
		const { selectedDocuments } = state;

		if (selectedDocuments.has(key)) {
			selectedDocuments.delete(key);
		}

		setState(dispatch, { selectedDocuments: new Map(selectedDocuments) });
	};

	const handleChangeView = (event) => {
		const {
			target: { value },
		} = event;
		const params = new URLSearchParams(window.location.hash.replace(`#/${state.cloneData.url.toLowerCase()}`, ''));
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
	};

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

	const contractDataToString = (settings) => {
		try {
			let contractString = '';
			for (const contractType of Object.keys(settings.contractData)) {
				if (settings.contractData[contractType]) {
					if (contractString.length > 0) {
						contractString += ', ';
					}
					contractString += contractType.toUpperCase();
				}
			}

			return contractString;
		} catch (err) {
			console.log('Error turning contract data into string');
			console.log(err);
		}
	};

	const processFiltersMinimizeHierarchies = (settings, type) => {
		const processedFilters = [];
		const minimizedSettings = [...settings[type]];
		// tidy up parent/child stuff
		const rootOptions = minimizedSettings.filter((e) => !e.parent);
		if (rootOptions.length > 0) {
			rootOptions.forEach((root) => {
				removeChildrenFromListDF(root, minimizedSettings);
			});
		}
		minimizedSettings
			.filter((e) => e.parent)
			.sort((a, b) => a.code < b.code)
			.forEach((node) => removeChildrenFromListDF(node, minimizedSettings));

		minimizedSettings.forEach((option) => {
			if (option.hasChildren) {
				processedFilters.push({ type, optionName: `${option.code}*` });
			} else {
				processedFilters.push({ type, optionName: option.code });
			}
		});
		return processedFilters;
	};

	const processFilters = (settings) => {
		let processedFilters = [];
		Object.keys(settings).forEach((type) => {
			if (type in filterNameMap) {
				if (type === 'naicsCode' || type === 'psc') {
					processedFilters = processedFilters.concat(processFiltersMinimizeHierarchies(settings, type));
				} else if (isArray(settings[type]) && settings[type].length > 0) {
					settings[type].forEach((option) => {
						processedFilters.push({ type, optionName: option });
					});
				} else if (
					type === 'contractData' &&
					(settings.contractData.pds ||
						settings.contractData.syn ||
						settings.contractData.fpds ||
						settings.contractData.none)
				) {
					let optionString = contractDataToString(settings);
					processedFilters.push({ type, optionName: optionString });
				} else if (type === 'contractsOrMods' && settings.contractsOrMods !== 'both') {
					processedFilters.push({ type, optionName: settings[type] });
				} else if (
					!isArray(settings[type]) &&
					typeof settings[type] === 'string' &&
					type !== 'contractsOrMods' &&
					settings[type].length > 0
				) {
					processedFilters.push({ type, optionName: settings[type] });
				}
			}
		});

		return processedFilters;
	};

	const numResultsText = `${rawSearchResults ? numberWithCommas(count) : '0'} results found in ${timeFound} seconds`;

	return (
		<div
			className={'results-count-view-buttons-container'}
			style={{ ...extraStyle, display: 'flex', flexDirection: 'column', margin: '17px 0' }}
		>
			<div
				style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}
			>
				<Typography variant="h3" display="inline" data-cy="eda-results-found">
					{!runningSearch ? numResultsText : ''}
				</Typography>
				<div className={'view-buttons-container'} style={{ marginRight: 35, zIndex: 99 }}>
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
									{categorySorting[activeCategoryTab].map((sort) => {
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
										<MenuItem key={`Card-List`} value={'List'}>
											List View
										</MenuItem>,
										<MenuItem key={`Card-Grid`} value={'Grid'}>
											Grid View
										</MenuItem>,
									];
								} else {
									return (
										<MenuItem key={`${view.name}-key`} value={view.name}>
											{view.title}
										</MenuItem>
									);
								}
							})}
						</Select>
					</FormControl>
					<a
						target="_blank"
						rel="noopener noreferrer"
						href="https://qlik.advana.data.mil/sense/app/604403a7-bf08-4d56-8807-7b5491a3db22/sheet/96329f3e-18a3-40e8-8b02-99d82feb1a6b/state/analysis"
					>
						<GCButton style={{ height: 50, margin: '16px 0px 0px 10px', minWidth: 0 }}>
							Validation Metrics
						</GCButton>
					</a>
					<GCButton
						className={`tutorial-step-${state.componentStepNumbers['Share Search']}`}
						id={'gcShareSearch'}
						onClick={() => createCopyTinyUrl(cloneData.url, dispatch, cloneData.clone_name)}
						style={{ height: 50, padding: '0px 7px', margin: '16px 0px 0px 10px', minWidth: 50 }}
						disabled={!state.rawSearchResults || state.rawSearchResults.length <= 0}
					>
						<GCTooltip title="Share" placement="bottom" arrow>
							<i className="fa fa-share" style={{ margin: '0 0 0 5px' }} />
						</GCTooltip>
					</GCButton>
					<SelectedDocsDrawer
						selectedDocuments={state.selectedDocuments}
						docsDrawerOpen={state.docsDrawerOpen}
						setDrawer={setDrawer}
						clearSelections={() => setState(dispatch, { selectedDocuments: new Map() })}
						openExport={() => setState(dispatch, { exportDialogVisible: true })}
						removeSelection={(doc) => removeSelectedDocument(doc)}
						componentStepNumbers={state.componentStepNumbers}
						isDrawerReady={state.isDrawerReady}
						setDrawerReady={setDrawerReady}
						setShowTutorial={(showTutorial) => setState(dispatch, { showTutorial: showTutorial })}
						setStepIndex={setStepIndex}
						showTutorial={state.showTutorial}
						rawSearchResults={state.rawSearchResults}
					/>
				</div>
			</div>

			<FilterList
				filterNameMap={filterNameMap}
				searchSettings={edaSearchSettings}
				handleFilterChange={handleFilterChange}
				processFilters={processFilters}
				margin="26px 0 0 6px"
				runSearch={runSearch}
				defaultOptions={defaultOptions}
				loading={loading}
			/>
		</div>
	);
};

EDAViewHeaderHandler.propTypes = {
	context: PropTypes.objectOf(PropTypes.string),
	extraStyle: PropTypes.objectOf(PropTypes.string),
};

export default EDAViewHeaderHandler;
