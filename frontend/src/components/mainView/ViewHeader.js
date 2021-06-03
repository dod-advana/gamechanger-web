import React, { useState, useEffect } from 'react';
import { checkUserInfo, createCopyTinyUrl, setState } from "../../sharedFunctions";
import { numberWithCommas, getCurrentView } from "../..//gamechangerUtils";
import GCButton from "../common/GCButton";
import GCTooltip from "../common/GCToolTip";
import {SelectedDocsDrawer} from "../searchBar/GCSelectedDocsDrawer";
import { FormControl, InputLabel, MenuItem,  Select, } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { gcOrange } from "../common/gc-colors";

// Internet Explorer 6-11
const IS_IE = /*@cc_on!@*/false || !!document.documentMode;

// Edge 20+
const IS_EDGE = !IS_IE && !!window.StyleMedia;

const useStyles = makeStyles({
	root: {
		marginTop: '1px',
		marginRight: '10px',
		'& .MuiInputBase-root':{
			height: '34px'
		},
		'&:hover .MuiInput-underline:before':{
			borderBottom: `3px solid ${gcOrange}`
		},
		'& .MuiInput-underline:before':{
			borderBottom: `3px solid rgba(0, 0, 0, 0.42)`
		},
		'& .MuiInput-underline:after':{
			borderBottom: `3px solid ${gcOrange}`
		}
	},
	selectRoot: {
		color: '#3F4A56',
	},
	formlabel: {
		fontSize: '16px'
	}
})

const ViewHeader = (props) => {

	const classes = useStyles();
	const {context, resultsText, mainStyles={}} = props;

	const {state, dispatch} = context;
	
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
		viewNames
	} = state;

	const [dropdownValue, setDropdownValue] = useState(getCurrentView(currentViewName, listView));
	const [displayCount, setDisplayCount] = useState(activeCategoryTab === 'all'?count+entityCount+topicCount: count)

	useEffect(()=> {
		if(IS_EDGE){
			setDropdownValue('List')
			setState(dispatch, {currentViewName: 'Card', listView: true});
		}
	},[dispatch])

	useEffect(()=> {
		let tempCount;
		switch(activeCategoryTab){
			case 'all':
				tempCount = (selectedCategories['Documents']===true ? count : 0) +
							(selectedCategories['Organizations']===true ? entityCount : 0) +
							(selectedCategories['Topics']===true ? topicCount: 0);
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
		setDisplayCount(tempCount)
	},[activeCategoryTab, count, entityCount, topicCount, selectedCategories])
	
	const setDrawer = (open) => {
		setState(dispatch, {docsDrawerOpen: open});
	}

	const setDrawerReady = (ready) => {
		setState(dispatch, {isDrawerReady: ready});
	}
	
	const setStepIndex = (stepIndex) => {
		setState(dispatch, {stepIndex: stepIndex});
	}

	const removeSelectedDocument = (key) => {
		const { selectedDocuments } = state;

		if (selectedDocuments.has(key)) {
			selectedDocuments.delete(key);
		}

		setState(dispatch, { selectedDocuments: new Map(selectedDocuments) });
	}

	const handleChangeSort = (event) => {
		const {target: { value }} = event;
		setState(dispatch,{currentSort: value, currentOrder: (value === 'Alphabetical' ? 'asc' : 'desc'), resultsPage: 1, docSearchResults: [], replaceResults: true, docsPagination: true});
	}

	const handleChangeOrder = (value) => {
		setState(dispatch,{currentOrder: value, resultsPage: 1, docSearchResults: [], replaceResults: true, docsPagination: true});
	}

	const handleChangeView = (event) => {
		const {target: { value }} = event;
		switch(value) {
			case "List":
				setState(dispatch, {currentViewName: 'Card', listView: true});
				break;
			case "Grid":
				setState(dispatch, {currentViewName: 'Card', listView: false});
				break;
			case "Graph":
				setState(dispatch, {currentViewName: value, runGraphSearch: true});
				break;
			case "Explorer":
			default:
				setState(dispatch, {currentViewName: value});
		}
		setDropdownValue(value)
	}
	
	return (
		<div className={'results-count-view-buttons-container'} style={{...mainStyles}}>
			<div className={'sidebar-section-title'}>
				{resultsText ? resultsText : `${numberWithCommas(displayCount)} results found in ${timeFound} seconds`}
			</div>
			<div className={'view-buttons-container'}>
				{categorySorting[activeCategoryTab] !== undefined && 
					<>
						<FormControl classes={{root:classes.root}}>
							<InputLabel classes={{root: classes.formlabel}} id="view-name-select">Sort</InputLabel>
							<Select
							labelId="view-name"
							id="view-name-select"
							value={currentSort}
							onChange={handleChangeSort}
							classes={{root:classes.selectRoot}}
							autoWidth
							>
							{categorySorting[activeCategoryTab].map(sort => {
								return <MenuItem key={`${sort}-key`}value={sort}>{sort}</MenuItem>
							})}
							</Select>
						</FormControl>
						{currentSort !== 'Alphabetical' ? 
							(<div style={{width: '40px', marginRight: '25px', display: 'flex'}}>
								<i 
									class="fa fa-sort-amount-desc"
									style={{marginTop: '60%', marginRight: '5px', cursor: 'pointer', color: currentOrder === 'desc' ? 'rgb(233, 105, 29)' : 'grey'}} 
									aria-hidden="true"
									onClick={() => {handleChangeOrder('desc')}	}
								></i>
								<i 
									class="fa fa-sort-amount-asc"
									style={{marginTop: '60%', cursor: 'pointer', color: currentOrder === 'asc' ? 'rgb(233, 105, 29)' : 'grey'}} 
									aria-hidden="true"
									onClick={() => {handleChangeOrder('asc')}	}
								></i>
							</div>) : 
							(<div style={{width: '40px', marginRight: '25px', display: 'flex'}}>
								<i 
									class="fa fa-sort-alpha-asc"
									style={{marginTop: '60%', marginRight: '5px', cursor: 'pointer', color: currentOrder === 'asc' ? 'rgb(233, 105, 29)' : 'grey'}} 
									aria-hidden="true"
									onClick={() => {handleChangeOrder('asc')}	}
								></i>
								<i 
									class="fa fa-sort-alpha-desc"
									style={{marginTop: '60%', cursor: 'pointer', color: currentOrder === 'desc' ? 'rgb(233, 105, 29)' : 'grey'}} 
									aria-hidden="true"
									onClick={() => {handleChangeOrder('desc')}	}
								></i>
							</div>)
						}
				</>
				}
				<FormControl classes={{root:classes.root}}>
					<InputLabel classes={{root: classes.formlabel}} id="view-name-select">View</InputLabel>
					<Select
						className={`tutorial-step-${componentStepNumbers["Change View"]}`}
						labelId="view-name"
						id="view-name-select"
						value={dropdownValue}
						onChange={handleChangeView}
						classes={{root:classes.selectRoot}}
						autoWidth
					>
					{viewNames.map(view => {
						if(view.name === "Card"){
							return([
								<MenuItem key={`Card-List`}value={'List'}>List View</MenuItem>,
								<MenuItem key={`Card-Grid`}value={'Grid'}>Grid View</MenuItem>
							])
						} else {
							return <MenuItem key={`${view.name}-key`}value={view.name}>{view.title}</MenuItem>
						}
					})}
					</Select>
				</FormControl>
				{cloneData?.clone_name === 'eda' &&
					<a target="_blank" rel="noopener noreferrer" href="https://qlik.advana.data.mil/sense/app/604403a7-bf08-4d56-8807-7b5491a3db22/sheet/96329f3e-18a3-40e8-8b02-99d82feb1a6b/state/analysis">
						<GCButton
							style={{ height: 34, margin: '16px 0px 0px 10px', minWidth: 0 }}
						>Validation Metrics</GCButton>
					</a>
				}
				<GCButton
						className={`tutorial-step-${state.componentStepNumbers["Share Search"]}`}
						id={"gcShareSearch"}
						onClick={() => createCopyTinyUrl(cloneData.url, dispatch)}
						style={{height: 34, padding: '0px 7px', margin: '16px 0px 0px 10px', minWidth: 0}}
						disabled={!state.rawSearchResults || state.rawSearchResults.length <= 0}
					>
					<GCTooltip title='Share' placement="bottom" arrow>
						<i className="fa fa-share" style={{margin: '0 0 0 5px'}}/>
					</GCTooltip>
				</GCButton>

				<SelectedDocsDrawer
					selectedDocuments={state.selectedDocuments}
					docsDrawerOpen={state.docsDrawerOpen}
					setDrawer={setDrawer}
					clearSelections={() => setState(dispatch, {selectedDocuments: new Map()})}
					openExport={() => setState(dispatch, {exportDialogVisible: true})}
					removeSelection={(doc) => removeSelectedDocument(doc)}
					componentStepNumbers={state.componentStepNumbers}
					isDrawerReady={state.isDrawerReady}
					setDrawerReady={setDrawerReady}
					setShowTutorial={(showTutorial) => setState(dispatch, {showTutorial: showTutorial})}
					setStepIndex={setStepIndex}
					showTutorial={state.showTutorial}
					rawSearchResults={state.rawSearchResults}
					checkUserInfo={() => {checkUserInfo(state, dispatch)}}
				/>
			</div>
		</div>
	)
}

export default ViewHeader;
