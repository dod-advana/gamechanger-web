import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createCopyTinyUrl, setState } from '../../../utils/sharedFunctions';
import { getCurrentView } from '../../../utils/gamechangerUtils';

import GCButton from '../../common/GCButton';
import GCTooltip from '../../common/GCToolTip';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { gcOrange } from '../../common/gc-colors';

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

const EDAViewHeaderHandler = (props) => {
	const classes = useStyles();
	const { context = {}, extraStyle = {} } = props;

	const { state, dispatch } = context;
	const { cloneData, componentStepNumbers, currentViewName, listView, viewNames } = state;

	const [dropdownValue, setDropdownValue] = useState(getCurrentView(currentViewName, listView));

	useEffect(() => {
		if (IS_EDGE) {
			setDropdownValue('List');
			setState(dispatch, { currentViewName: 'Card', listView: true });
		}
	}, [dispatch]);

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

	return (
		<div className={'results-count-view-buttons-container'} style={extraStyle}>
			<div className={'view-buttons-container'} style={{ marginRight: 35, zIndex: 99 }}>
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
					onClick={() => createCopyTinyUrl(cloneData.url, dispatch)}
					style={{ height: 50, padding: '0px 7px', margin: '16px 0px 0px 10px', minWidth: 50 }}
					disabled={!state.rawSearchResults || state.rawSearchResults.length <= 0}
				>
					<GCTooltip title="Share" placement="bottom" arrow>
						<i className="fa fa-share" style={{ margin: '0 0 0 5px' }} />
					</GCTooltip>
				</GCButton>
			</div>
		</div>
	);
};

EDAViewHeaderHandler.propTypes = {
	context: PropTypes.objectOf(PropTypes.string),
	extraStyle: PropTypes.objectOf(PropTypes.string),
};

export default EDAViewHeaderHandler;
