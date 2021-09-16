import React, {useEffect, useState} from "react";
import PropTypes from 'prop-types';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator.js';

import './sidebar.css';
import styled from "styled-components";
import { trackEvent } from '../telemetry/Matomo';
import {getTrackingNameForFactory, orgColorMap, exactMatch} from "../../gamechangerUtils";
import GCTooltip from "../common/GCToolTip";
import GCAccordion from "../common/GCAccordion";
import ReactTable from 'react-table';
import {makeStyles} from '@material-ui/core/styles';
import _ from "lodash";
import {setState} from "../../sharedFunctions";

import {
	FormControl,
	FormGroup,
	FormControlLabel,
	Checkbox,
} from '@material-ui/core';
const gcColors = {
	buttonColor1: '#131E43',
	buttonColor2: '#E9691D'
};

const styles = {
	innerContainer: {
		display: 'flex',
		height: '100%',
		flexDirection: 'column'
	},
	scrollInnerContainer: {
		display: 'block',
		overflow: 'auto'
	},
	cardBody: {
		padding: '10px 0px',
		fontSize: '1.1em',
		fontFamily: 'Noto Sans',
	},
	subHead: {
		fontSize: "1.0em",
		display: 'flex',
		position: 'relative'
	},
	headerColumn: {
		fontSize: "1.0em",
		width: '100%',
		padding: '8px 8px',
		backgroundColor: 'rgb(50,53,64)',
		display: 'flex',
		alignItems: 'center'
	},
	colWidth: {
		maxWidth: '900px',
		width: '120px',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	}
};

export const StyledTopEntities = styled.div`
	display: flex;
	margin: ${({ margin }) => margin ? `${margin}` : '0 0 10px 0'};
	flex-flow: wrap;
	
	.entity-div {
		flex-direction: column;
		display: flex;
		align-items: center;
		cursor: pointer;
		margin: 6px;
	
		> img {
			width: ${({ width }) => width ? `${width}px` : '62px'};
			height: ${({ height }) => height ? `${height}px` : '62px'};
		}
		
		> span {
			text-align: center;
		}
	}
`;

export const StyledTopTopics = styled.div`
	display: flex;
	margin: ${({ margin }) => margin ? `${margin}` : '0 0 10px 0'};
	flex-flow: wrap;
	
	.topic-button {
		height: 25px;
		border-radius: 15px;
		border: 1px solid darkgray;
		background-color: white;
		color: black;
		white-space: nowrap;
		text-align: center;
		display: inline-block;
		padding-left: 5px;
		padding-right: 5px;
		margin-left: 6px;
		margin-right: 6px;
		margin-bottom: 3px;
		cursor: pointer;

		> i {
			color: ${({ favorited }) => favorited? '#E9691D' : '#B0B9BE'};
		}
		
		&:hover {
			background-color: #E9691D;
			color: white;
			> i {
				 color: ${({ favorited }) => favorited? '#FFFFFF' : '#B0B9BE'};
			}
		};
	}
`;

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
		fontSize: '14px'
	},
	tipText: {
		maxWidth: '250px',
		width: '250px',
		margin: '0 auto',
		fontSize: '12px',
		lineHeight: '20px'
	},
	optionText: {
		margin: '20px 75px 0px',
		fontSize: '14px',
		lineHeight: '20px'
	},
	dateOptionText: {
		margin: '20px 0px 0px',
		fontSize: '14px',
		lineHeight: '20px'
	},
	title: {
		margin: '20px 75px 0px',
		fontSize: '20px',
		lineHeight: '20px',
		fontWeight: 600
	},
	rootButton: {
		visibility: 'hidden',
		width: '0px',
		padding: '0px',
		border: '0px',
		cursor: 'default'
	},
	rootLabel: {
		cursor: 'pointer',
		display: 'inline-flex',
		alignItems: 'center',
		marginRight: '26px',
		marginBottom: '15px',
		verticalAlign: 'middle'
	},
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		marginLeft: '5px',
		marginRight: '5px'
	},
	checkBox: {
		visibility: 'hidden',
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
	},
	checkedButton: {
		'& + $radioButtonLabel': {
			backgroundColor: '#313541',
			boxShadow: '0px 0px 15px grey',
			border: '2px solid #313541',
			borderRadius: '10px',
			'&, $tipText,$titleText': {
				color: '#ffffff'
			},
			'&::after': {
				fontFamily: 'FontAwesome',
				content: "'\\f00c'",
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
			}
		},
		'& + $checkboxPill': {
			backgroundColor: '#313541',
			boxShadow: '0px 0px 5px grey',
			border: '2px solid #313541',
			borderRadius: '10px',
			color: '#ffffff',
		}
	},
	checkboxPill: {
		width: '145px',
		textAlign: 'center',
		borderRadius: '10px',
		lineHeight: 1.2,
		fontSize: '12px',
		border: '2px solid #bdccde',
		backgroundColor: 'white',
		boxSizing: 'border-box',
		color: 'black',
		minHeight: '35px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	disabledButton: {
		'& + $checkboxPill': {
			backgroundColor: 'rgba(0, 0, 0, 0.38)',
			border: '2px solid grey',
			borderRadius: '10px',
			color: '#ffffff',
		}
	}
});

export const StyledAddTermButton = styled.button`
	border: none;
	height: 30px;
	border-radius: 15px;
	background-color: white;
	color: black;
	white-space: nowrap;
	text-align: center;
	display: inline-block;
	padding-left: 15px;
	padding-right: 15px;
	margin-left: 6px;
	margin-right: 6px;
	margin-bottom: 6px;
	cursor: pointer;
	border: 1px solid darkgray;

	&:hover {
		background-color: #E9691D;
		color: white;
	};
`;
export default function SideBar(props) {
	
	const {
		cloneData = {},
		context,

	} = props;
	
	const {state, dispatch} = context;
	const classes = useStyles();

	const [topEntities, setTopEntities] = useState([]);
	const [topTopics, setTopTopics] = useState([]);
	const [runningTopicSearch, setRunningTopicSearch] = useState(state.runningTopicSearch);
	const [runningEntitySearch, setRunningEntitySearch] = useState(state.runningEntitySearch);
	const [expansionTerms, setExpansionTerms] = React.useState([]);

	let expansionTermSelected = true;
	expansionTerms.forEach(term => {
		if(term.checked === true) expansionTermSelected = true;
	})
	const comparableExpansion = JSON.stringify(state.expansionDict);

	useEffect(() => {
		// nested arrays of expanded terms from each searchTerm
		let expansion = {};
		if(comparableExpansion) {
			expansion = JSON.parse(comparableExpansion)
		}
		let expandedTerms = Object.values(expansion || {});
		const keys = Object.keys(expansion || {});
		const quotedKeys = keys.map((term) => `"${term}"`);
		const exclude = new Set([...keys, ...quotedKeys]);
		let topFive = new Set();

		while(topFive.size < 10){
			if(expandedTerms.length === 0){
				break;
			}
			const frontArr = expandedTerms[0];
			const term = frontArr.shift();
			const [a, ...rest] = expandedTerms;
			if(!term){
				expandedTerms = [...rest];
			} else {
				if(!exclude.has(term)){
					topFive.add(term);
				}
				expandedTerms = [...rest, a];
			}
		}
		let topFiveArr = Array.from(topFive)
		topFiveArr = topFiveArr.map(term => {
			return {...term, checked:exactMatch(state.searchText, term.phrase, " OR ")}
		})
		setExpansionTerms(topFiveArr);

	}, [state, comparableExpansion]);

	useEffect(() => {
		setTopEntities(state.entitiesForSearch);
		state.entitiesForSearch.forEach(entity => {
			const aliases = entity.aliases ? entity.aliases.split(';') : [];
			aliases.sort((a, b) => a.length - b.length)
			entity.aliase = aliases[0];
		});
		const tmpTopics = state.topicsForSearch.map(topic => {
			return topic.name;
		})
		setTopTopics(tmpTopics);
		setRunningTopicSearch(state.runningTopicSearch);
		setRunningEntitySearch(state.runningEntitySearch);
	}, [state]);

	const renderTopEntities = () => {
		return (
			
			<StyledTopEntities>
				{topEntities.map(entity => {
					return (
						<GCTooltip key={entity.name} title={entity.name} arrow enterDelay={30} leaveDelay={10} >
							<div className={'entity-div'} onClick={() => {
								trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'TopEntitySelected', entity.name)
								window.open(`#/gamechanger-details?cloneName=${cloneData.clone_name}&type=entity&entityName=${entity.name}`);
							}}>
								<img
									alt={`${entity.name} Img`}
									src={entity.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/United_States_Department_of_Defense_Seal.svg/1200px-United_States_Department_of_Defense_Seal.svg.png'}
								/>
								<span>{entity.aliase}</span>
							</div>
						</GCTooltip>
					);
				})}
			</StyledTopEntities>
			
		);
	};
	const renderExpansionTerms = (expansionTerms, handleAddSearchTerm, classes) => {
		return (
			<div style={{margin: '10px 0 10px 0'}}>
				<FormGroup row style={{ marginLeft: '20px', width: '100%' }}>
					{expansionTerms.map(({phrase, source, checked}, idx) => {
						const term = phrase
						return (
							<FormControlLabel
								key={term}
								value={term}
								classes={{ root: classes.rootLabel, label: classes.checkboxPill }}
								control={<Checkbox classes={{ root: classes.rootButton, checked: classes.checkedButton }} name={term} checked={checked} onClick={() => handleAddSearchTerm(phrase,source,idx)} />}
								label={term}
								LineBreakMode="TailTruncation"
								labelPlacement="end"
							/>
						)
					})}
				</FormGroup>
			</div>
		);
	};
	
	const renderTopTopics = () => {
		return (
			
			<StyledTopTopics>
				{topTopics.map((topic, idx) => {
					return (
						<div className={'topic-button'} key={`topic-${idx}`}onClick={() => {
							trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'TopTopics', topic.name)
							window.open(`#/gamechanger-details?cloneName=${cloneData.clone_name}&type=topic&topicName=${topic}`);
						}}>
							{topic}
						</div>
					);
				})}
			</StyledTopTopics>
			
		);
	};
	const renderLegend = () => {
		const TableRow = styled.div`
			text-align: center;
			font-weight: normal;
    		font-family: Noto Sans, Arial, Helvetica, sans-serif;
			${({ color }) => color ? `background: ${color};` : ''}
			${({ color }) => color ? `color: white;` : ''}
		`
		const columns = [
			{
				Header: 'Category',
				accessor: 'category',
				headerClassName:'legend-header',
				minWidth:200,
				Cell: row => (
					<TableRow>{row.value}</TableRow>
				)
			},
			{
				Header: 'Color',
				accessor: 'color',
				headerClassName:'legend-header',
				Cell: row => (
					<TableRow color={row.value}>{row.value}</TableRow>
				)
			}
		]
		const orgArray =[];
		for(const key in orgColorMap){
			orgArray.push({category:key, color:orgColorMap[key]})
		}

		return (
			<ReactTable
                data={orgArray}
                columns={columns}
				style={{width:'100%'}}
				showPagination={false}
				className="-striped -highlight legend-table"
            />
		);
	};

	const handleAddSearchTerm = (phrase, source, idx) => {
		const temp = _.cloneDeep(expansionTerms)
		temp[idx].checked = !temp[idx].checked
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.expansionTermAdded = true;
		newSearchSettings.isFilterUpdate = true;
		setState(dispatch, { searchSettings: newSearchSettings });
		setExpansionTerms(temp);
	}
	return (
		<div className={''} style={{ height: 'fit-content', minWidth: '100%', marginRight: -10 }}>
			<div className={''}>
				<div style={styles.innerContainer}>
					<div style={styles.cardBody} className={`tutorial-step-unknown2`}>
						<div style={styles.innerContainer}>
						{expansionTerms.length>0 && <div style={{width: '100%', marginBottom: 10}}>
						<GCAccordion expanded={expansionTermSelected} header={'SEARCHES'} headerTextWeight={'normal'}>
						{ renderExpansionTerms(expansionTerms, handleAddSearchTerm, classes) }
						</GCAccordion>
						</div>}
							{(topEntities.length > 0) && <>
								<div style={{width: '100%', marginBottom: 10}}>
									<GCAccordion expanded={true} header={'ORGANIZATIONS'} headerTextWeight={'normal'}>
										{runningEntitySearch ?
											<div style={{margin: '0 auto'}}>
												<LoadingIndicator customColor={gcColors.buttonColor2} />
											</div> :
											<>
												{renderTopEntities()}
											</>
										}
									</GCAccordion>
								</div>
								<div style={{width: '100%', marginBottom: 10}}>
									<GCAccordion expanded={false} header={'TOPICS'} headerTextWeight={'normal'}>
											{runningTopicSearch ?
												<div style={{margin: '0 auto'}}>
													<LoadingIndicator customColor={gcColors.buttonColor2} />
												</div> :
												<>
													{renderTopTopics()}
												</>
											}
									</GCAccordion>
								</div>
								{false && <div style={{width: '100%', marginBottom: 10}}>
									<GCAccordion expanded={false} header={'LEGEND'} headerTextWeight={'normal'}>
										<>
											{renderLegend()}
										</>
									</GCAccordion>
								</div>}
							</>}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

SideBar.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			runningEntitySearch: PropTypes.bool,
			runningTopicSearch: PropTypes.bool,
			entitiesForSearch: PropTypes.arrayOf(PropTypes.object),
			topicsForSearch: PropTypes.arrayOf(PropTypes.object),
			cloneData: PropTypes.shape({
				clone_name: PropTypes.string
			})
		})
	})
}
