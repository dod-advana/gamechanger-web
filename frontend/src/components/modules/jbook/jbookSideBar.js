import React, { useEffect } from 'react';
import GCTooltip from '../../common/GCToolTip';
import GCAccordion from '../../common/GCAccordion';
import { exactMatch, getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import _ from 'lodash';
import { setState } from '../../../utils/sharedFunctions';
import { makeStyles } from '@material-ui/core/styles';
import { trackEvent } from '../../telemetry/Matomo';

const styles = {
	innerContainer: {
		display: 'flex',
		height: '100%',
		flexDirection: 'column',
	},
	scrollInnerContainer: {
		display: 'block',
		overflow: 'auto',
	},
	cardBody: {
		padding: '10px 0px',
		fontSize: '1.1em',
		fontFamily: 'Noto Sans',
	},
	subHead: {
		fontSize: '1.0em',
		display: 'flex',
		position: 'relative',
	},
	headerColumn: {
		fontSize: '1.0em',
		width: '100%',
		padding: '8px 8px',
		backgroundColor: 'rgb(50,53,64)',
		display: 'flex',
		alignItems: 'center',
	},
	colWidth: {
		maxWidth: '900px',
		width: '120px',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
};

const useStyles = makeStyles({
	radioButtonLabel: {
		position: 'relative',
		backgroundColor: '#ffffff',
		padding: '5px 10px 10px 10px',
		marginRight: '20px',
		fontSize: '26px',
		height: '90px',
		lineHeight: '150px',
		display: 'block',
		cursor: 'pointer',
		boxSizing: 'border-box',
		borderRadius: '10px',
		border: '2px solid #bdccde',
	},
	titleText: {
		fontSize: '14px',
	},
	tipText: {
		maxWidth: '250px',
		width: '250px',
		margin: '0 auto',
		fontSize: '12px',
		lineHeight: '20px',
	},
	optionText: {
		margin: '20px 75px 0px',
		fontSize: '14px',
		lineHeight: '20px',
	},
	dateOptionText: {
		margin: '20px 0px 0px',
		fontSize: '14px',
		lineHeight: '20px',
	},
	title: {
		margin: '20px 75px 0px',
		fontSize: '20px',
		lineHeight: '20px',
		fontWeight: 600,
	},
	rootButton: {
		visibility: 'hidden',
		width: '0px',
		padding: '0px',
		border: '0px',
		cursor: 'default',
	},
	rootLabel: {
		cursor: 'pointer',
		display: 'inline-flex',
		alignItems: 'center',
		marginRight: '26px',
		marginBottom: '15px',
		verticalAlign: 'middle',
	},
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		marginLeft: '5px',
		marginRight: '5px',
	},
	checkBox: {
		visibility: 'hidden',
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '4px',
		border: '2px solid #bdccde',
	},
	checkedButton: {
		'& + $radioButtonLabel': {
			backgroundColor: '#313541',
			boxShadow: '0px 0px 15px grey',
			border: '2px solid #313541',
			borderRadius: '10px',
			'&, $tipText,$titleText': {
				color: '#ffffff',
			},
			'&::after': {
				fontFamily: 'FontAwesome',
				content: `'\\f00c'`,
				width: '20px',
				height: '20px',
				lineHeight: '10px',
				borderRadius: '100%',
				fontSize: '15px',
				border: '2px solid #333',
				backgroundColor: '#ffffff',
				color: '#E9691D',
				zIndex: 999,
				position: 'absolute',
				top: '10px',
				right: '10px',
				paddingTop: '3px',
			},
		},
		'& + $checkboxPill': {
			backgroundColor: '#313541',
			boxShadow: '0px 0px 5px grey',
			border: '2px solid #313541',
			borderRadius: '10px',
			color: '#ffffff',
		},
	},
	checkboxPill: {
		width: '200px',
		textAlign: 'center',
		borderRadius: '10px',
		lineHeight: 1.2,
		fontSize: '12px',
		border: '2px solid #bdccde',
		backgroundColor: 'white',
		boxSizing: 'border-box',
		color: 'black',
		minHeight: '40px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	disabledButton: {
		'& + $checkboxPill': {
			backgroundColor: 'rgba(0, 0, 0, 0.38)',
			border: '2px solid grey',
			borderRadius: '10px',
			color: '#ffffff',
		},
	},
});

export default function JBookSideBar(props) {
	const { context } = props;

	const classes = useStyles();

	const { state, dispatch } = context;

	const [expansionTerms, setExpansionTerms] = React.useState([]);

	let expansionTermSelected = true;
	expansionTerms.forEach((term) => {
		if (term.checked === true) expansionTermSelected = true;
	});
	const comparableExpansion = JSON.stringify(state.expansionDict);

	useEffect(() => {
		// nested arrays of expanded terms from each searchTerm
		let expansion = {};
		const maxExpansions = 10;
		if (comparableExpansion) {
			expansion = JSON.parse(comparableExpansion);
		}
		let expandedTerms = Object.values(expansion || {});
		const keys = Object.keys(expansion || {});
		const quotedKeys = keys.map((term) => `'${term}'`);
		const exclude = new Set([...keys, ...quotedKeys]);
		let topTerms = new Set();

		while (topTerms.size < maxExpansions) {
			if (expandedTerms.length === 0) {
				break;
			}
			const frontArr = expandedTerms[0];
			const term = frontArr.shift();
			const [a, ...rest] = expandedTerms;
			if (!term) {
				expandedTerms = [...rest];
			} else {
				if (!exclude.has(term)) {
					topTerms.add(term);
				}
				expandedTerms = [...rest, a];
			}
		}
		let topTermsArr = Array.from(topTerms);
		topTermsArr = topTermsArr.map((term) => {
			return {
				...term,
				checked: exactMatch(state.searchText, term.phrase, ' OR '),
			};
		});
		setExpansionTerms(topTermsArr);
	}, [state, comparableExpansion]);

	useEffect(() => {
		if (state.jbookSearchSettings.expansionTermAdded) {
			let newSearchText = state.searchText.trim();
			expansionTerms.forEach(({ phrase, source, checked }) => {
				if (checked && !exactMatch(newSearchText, phrase, ' OR ')) {
					trackEvent(
						getTrackingNameForFactory(state.cloneData.clone_name),
						'QueryExpansion',
						'SearchTermAdded',
						`${phrase}_${source}`
					);
					//newSearchText = newSearchText.trim() ? `${newSearchText} OR ${phrase}` : phrase;
					newSearchText = phrase;
				} else if (!checked && exactMatch(newSearchText, `${phrase}`, ' OR ')) {
					newSearchText = newSearchText.replace(` OR ${phrase}`, '').trim();
				}
			});

			const newSearchSettings = _.cloneDeep(state.jbookSearchSettings);
			newSearchSettings.expansionTermAdded = false;
			setState(dispatch, {
				searchText: newSearchText,
				runSearch: true,
				jbookSearchSettings: newSearchSettings,
			});
		}
	}, [state, expansionTerms, dispatch]);

	const renderExpansionTerms = (expansionTerms, handleAddSearchTerm, classes) => {
		return (
			<div style={{ margin: '10px 0 10px 0' }}>
				<FormGroup row style={{ marginLeft: '20px', width: '100%' }}>
					{expansionTerms.map(({ phrase, source, checked }, idx) => {
						let term = phrase;
						term = term.length > 25 ? term.substring(0, 25 - 3) + '...' : term;

						return (
							<GCTooltip key={phrase} title={phrase} arrow enterDelay={30} leaveDelay={10}>
								<FormControlLabel
									key={term}
									value={term}
									classes={{
										root: classes.rootLabel,
										label: classes.checkboxPill,
									}}
									control={
										<Checkbox
											classes={{
												root: classes.rootButton,
												checked: classes.checkedButton,
											}}
											name={term}
											checked={checked}
											onClick={() => handleAddSearchTerm(phrase, source, idx)}
										/>
									}
									label={term}
									labelPlacement="end"
								/>
							</GCTooltip>
						);
					})}
				</FormGroup>
			</div>
		);
	};

	const handleAddSearchTerm = (phrase, source, idx) => {
		const temp = _.cloneDeep(expansionTerms);
		temp[idx].checked = !temp[idx].checked;
		const newSearchSettings = _.cloneDeep(state.jbookSearchSettings);
		newSearchSettings.expansionTermAdded = true;
		newSearchSettings.isFilterUpdate = true;
		setState(dispatch, { jbookSearchSettings: newSearchSettings });
		setExpansionTerms(temp);
	};

	return (
		<div className={''} style={{ height: 'fit-content', minWidth: '100%', marginRight: -10, marginLeft: 15 }}>
			<div className={''}>
				<div style={styles.innerContainer}>
					<div style={styles.cardBody} className={`tutorial-step-unknown2`}>
						<div style={styles.innerContainer}>
							{expansionTerms.length > 0 && (
								<div style={{ width: '100%', marginBottom: 10 }}>
									<GCTooltip title={'Select a document for export'} placement="top" arrow>
										<GCAccordion
											expanded={expansionTermSelected}
											header={'SEARCHES'}
											headerTextWeight={'normal'}
										>
											{renderExpansionTerms(expansionTerms, handleAddSearchTerm, classes)}
										</GCAccordion>
									</GCTooltip>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
