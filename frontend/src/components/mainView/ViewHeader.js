import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
	checkUserInfo,
	createCopyTinyUrl,
	setState,
} from '../../sharedFunctions';
import { numberWithCommas, getCurrentView } from '../..//gamechangerUtils';
import GCButton from '../common/GCButton';
import GCTooltip from '../common/GCToolTip';
import { SelectedDocsDrawer } from '../searchBar/GCSelectedDocsDrawer';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { gcOrange } from '../common/gc-colors';

// Internet Explorer 6-11
const IS_IE = /*@cc_on!@*/ false || !!document.documentMode;

// Edge 20+
const IS_EDGE = !IS_IE && !!window.StyleMedia;

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

const ViewHeader = (props) => {
	const classes = useStyles();
	const { context, resultsText, mainStyles = {} } = props;

	const { state, dispatch } = context;

	const {
		activeCategoryTab,
		cloneData,
		componentStepNumbers,
		count,
		currentViewName,
		entityCount,
		listView,
		selectedCategories,
		topicCount,
		timeFound,
		viewNames,
		categorySorting,
		currentSort,
		currentOrder,
	} = state;

	const [dropdownValue, setDropdownValue] = useState(
		getCurrentView(currentViewName, listView)
	);
	const [displayCount, setDisplayCount] = useState(
		activeCategoryTab === 'all' ? count + entityCount + topicCount : count
	);

	useEffect(() => {
		if (IS_EDGE) {
			setDropdownValue('List');
			setState(dispatch, { currentViewName: 'Card', listView: true });
		}
	}, [dispatch]);

	useEffect(() => {
		let tempCount;
		switch (activeCategoryTab) {
			case 'all':
				tempCount =
					(selectedCategories['Documents'] === true ? count : 0) +
					(selectedCategories['Organizations'] === true ? entityCount : 0) +
					(selectedCategories['Topics'] === true ? topicCount : 0);
				break;
			case 'Organizations':
				tempCount = entityCount;
				break;
			case 'Topics':
				tempCount = topicCount;
				break;
			default:
				tempCount = count;
		}
		setDisplayCount(tempCount);
	}, [activeCategoryTab, count, entityCount, topicCount, selectedCategories]);

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

	const handleChangeSort = (event) => {
		const {
			target: { value },
		} = event;
		setState(dispatch, {
			currentSort: value,
			currentOrder: value === 'Alphabetical' ? 'asc' : 'desc',
			resultsPage: 1,
			docSearchResults: [],
			replaceResults: true,
			docsPagination: true,
			infiniteScrollPage: 1,
		});
	};

	const handleChangeOrder = (value) => {
		setState(dispatch, {
			currentOrder: value,
			resultsPage: 1,
			docSearchResults: [],
			replaceResults: true,
			docsPagination: true,
		});
	};

	const handleChangeView = (event) => {
		const {
			target: { value },
		} = event;
		switch (value) {
			case 'List':
				setState(dispatch, { currentViewName: 'Card', listView: true });
				break;
			case 'Grid':
				setState(dispatch, { currentViewName: 'Card', listView: false });
				break;
			case 'Graph':
				setState(dispatch, { currentViewName: value, runGraphSearch: true });
				break;
			case 'Explorer':
			default:
				setState(dispatch, { currentViewName: value });
		}
		setDropdownValue(value);
	};

	return (
		<div
			className={'results-count-view-buttons-container'}
			style={{ ...mainStyles }}
		>
			{state.cloneData.clone_name === 'gamechanger' ? (
				<>
					{!state.searchSettings.isFilterUpdate && displayCount > 0 ? (
						<div className={'sidebar-section-title'}>
							{`${numberWithCommas(
								displayCount
							)} results found in ${timeFound} seconds`}
						</div>
					) : (
						<div className={'sidebar-section-title'}>
							{'Loading results ...'}
						</div>
					)}
				</>
			) : (
				<div className={'sidebar-section-title'}>
					{resultsText
						? resultsText
						: `${numberWithCommas(
							displayCount
						  )} results found in ${timeFound} seconds`}
				</div>
			)}
			<div className={'view-buttons-container'}>
				{categorySorting !== undefined &&
					categorySorting[activeCategoryTab] !== undefined && (
					<>
						<FormControl variant="outlined" classes={{ root: classes.root }}>
							<InputLabel
								classes={{ root: classes.formlabel }}
								id="view-name-select"
							>
									Sort
							</InputLabel>
							<Select
								labelId="view-name"
								label="Sort"
								id="view-name-select"
								value={currentSort}
								onChange={handleChangeSort}
								classes={{
									root: classes.selectRoot,
									icon: classes.selectIcon,
								}}
								autoWidth
							>
								{categorySorting[activeCategoryTab].map((sort) => {
									return (
										<MenuItem key={`${sort}-key`} value={sort}>
											{sort}
										</MenuItem>
									);
								})}
							</Select>
						</FormControl>
						{currentSort !== 'Alphabetical' ? (
							<div
								style={{ width: '40px', marginRight: '6px', display: 'flex' }}
							>
								<i
									className="fa fa-sort-amount-desc"
									style={{
										marginTop: '80%',
										marginRight: '5px',
										cursor: 'pointer',
										color:
												currentOrder === 'desc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('desc');
									}}
								></i>
								<i
									className="fa fa-sort-amount-asc"
									style={{
										marginTop: '80%',
										cursor: 'pointer',
										color:
												currentOrder === 'asc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('asc');
									}}
								></i>
							</div>
						) : (
							<div
								style={{ width: '40px', marginRight: '6px', display: 'flex' }}
							>
								<i
									className="fa fa-sort-alpha-asc"
									style={{
										marginTop: '80%',
										marginRight: '5px',
										cursor: 'pointer',
										color:
												currentOrder === 'asc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('asc');
									}}
								></i>
								<i
									className="fa fa-sort-alpha-desc"
									style={{
										marginTop: '80%',
										cursor: 'pointer',
										color:
												currentOrder === 'desc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('desc');
									}}
								></i>
							</div>
						)}
					</>
				)}
				<FormControl variant="outlined" classes={{ root: classes.root }}>
					<InputLabel
						classes={{ root: classes.formlabel }}
						id="view-name-select"
					>
						View
					</InputLabel>
					<Select
						className={`tutorial-step-${componentStepNumbers['Change View']}`}
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
				{cloneData?.clone_name === 'eda' && (
					<a
						target="_blank"
						rel="noopener noreferrer"
						href="https://qlik.advana.data.mil/sense/app/604403a7-bf08-4d56-8807-7b5491a3db22/sheet/96329f3e-18a3-40e8-8b02-99d82feb1a6b/state/analysis"
					>
						<GCButton
							style={{ height: 34, margin: '16px 0px 0px 10px', minWidth: 0 }}
						>
							Validation Metrics
						</GCButton>
					</a>
				)}
				<GCButton
					className={`tutorial-step-${state.componentStepNumbers['Share Search']}`}
					id={'gcShareSearch'}
					onClick={() => createCopyTinyUrl(cloneData.url, dispatch)}
					style={{
						height: 50,
						padding: '0px 7px',
						margin: '16px 0px 0px 10px',
						minWidth: 50,
					}}
					disabled={
						!state.rawSearchResults || state.rawSearchResults.length <= 0
					}
				>
					<GCTooltip title="Share" placement="bottom" arrow>
						<i className="fa fa-share" style={{ margin: '0 0 0 5px' }} />
					</GCTooltip>
				</GCButton>

				<SelectedDocsDrawer
					selectedDocuments={state.selectedDocuments}
					docsDrawerOpen={state.docsDrawerOpen}
					setDrawer={setDrawer}
					clearSelections={() =>
						setState(dispatch, { selectedDocuments: new Map() })
					}
					openExport={() => setState(dispatch, { exportDialogVisible: true })}
					removeSelection={(doc) => removeSelectedDocument(doc)}
					componentStepNumbers={state.componentStepNumbers}
					isDrawerReady={state.isDrawerReady}
					setDrawerReady={setDrawerReady}
					setShowTutorial={(showTutorial) =>
						setState(dispatch, { showTutorial: showTutorial })
					}
					setStepIndex={setStepIndex}
					showTutorial={state.showTutorial}
					rawSearchResults={state.rawSearchResults}
					checkUserInfo={() => {
						checkUserInfo(state, dispatch);
					}}
				/>
			</div>
		</div>
	);
};

ViewHeader.propTypes = {
	activeCategoryTab: PropTypes.string,
	cloneData: PropTypes.shape({
		url: PropTypes.string,
	}),
	componentStepNumbers: PropTypes.objectOf(PropTypes.number),
	count: PropTypes.number,
	currentViewName: PropTypes.string,
	entityCount: PropTypes.number,
	listView: PropTypes.bool,
	selectedCategories: PropTypes.objectOf(PropTypes.bool),
	topicCount: PropTypes.number,
	timeFound: PropTypes.number,
	viewNames: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string,
			title: PropTypes.string,
		})
	),
	categorySorting: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
	currentSort: PropTypes.string,
	currentOrder: PropTypes.string,
};

export default ViewHeader;
