import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator.js';

import './sidebar.css';
import styled from 'styled-components';
import { trackEvent } from '../telemetry/Matomo';
import {
	getTrackingNameForFactory,
	orgColorMap,
	exactMatch,
} from  '../../utils/gamechangerUtils';
import GCTooltip from '../common/GCToolTip';
import GCAccordion from '../common/GCAccordion';
import ReactTable from 'react-table';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import { setState } from '../../utils/sharedFunctions';
import GameChangerAPI from '../api/gameChanger-service-api';
import DefaultSeal from '../mainView/img/GC Default Seal.png';
import dodSeal from '../../images/United_States_Department_of_Defense_Seal.svg.png';

import {
	FormGroup,
	FormControlLabel,
	Checkbox,
} from '@material-ui/core';
const gcColors = {
	buttonColor1: '#131E43',
	buttonColor2: '#E9691D',
};

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

export const StyledTopEntities = styled.div`
	display: flex;
	margin: ${({ margin }) => (margin ? `${margin}` : '0 0 10px 0')};
	flex-flow: wrap;

	.entity-div {
		flex-direction: column;
		display: flex;
		align-items: center;
		cursor: pointer;
		margin: 6px;

		> img {
			width: ${({ width }) => (width ? `${width}px` : '62px')};
			height: ${({ height }) => (height ? `${height}px` : '62px')};
		}

		> span {
			text-align: center;
		}
	}
`;

export const StyledTopTopics = styled.div`
	display: flex;
	margin: ${({ margin }) => (margin ? `${margin}` : '0 0 10px 0')};
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
			color: ${({ favorited }) => (favorited ? '#E9691D' : '#B0B9BE')};
		}

		&:hover {
			background-color: #e9691d;
			color: white;
			> i {
				color: ${({ favorited }) => (favorited ? '#FFFFFF' : '#B0B9BE')};
			}
		}
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
		background-color: #e9691d;
		color: white;
	}
`;
const gameChangerAPI = new GameChangerAPI();

export default function SideBar(props) {
	const { cloneData = {}, context } = props;

	const { state, dispatch } = context;
	const classes = useStyles();

	const [topEntities, setTopEntities] = useState([]);
	const [topTopics, setTopTopics] = useState([]);
	const [runningTopicSearch, setRunningTopicSearch] = useState(
		state.runningTopicSearch
	);
	const [runningEntitySearch, setRunningEntitySearch] = useState(
		state.runningEntitySearch
	);
	const [expansionTerms, setExpansionTerms] = React.useState([]);

	let expansionTermSelected = true;
	expansionTerms.forEach((term) => {
		if (term.checked === true) expansionTermSelected = true;
	});
	const comparableExpansion = JSON.stringify(state.expansionDict);

	// eslint-disable-next-line no-unused-vars
	const [orgSources, setOrgSources] = useState([]); // Will use when s3 performance fixed
	const [orgOverrideImageURLs, setOrgOverrideImageURLs] = useState({});

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
		setTopEntities(state.entitiesForSearch);
		state.entitiesForSearch.forEach((entity) => {
			const aliases = entity.aliases ? entity.aliases.split(';') : [];
			aliases.sort((a, b) => a.length - b.length);
			entity.aliase = aliases[0];
		});
		const tmpTopics = state.topicsForSearch.map((topic) => {
			return topic.name;
		});
		setTopTopics(tmpTopics);
		setRunningTopicSearch(state.runningTopicSearch);
		setRunningEntitySearch(state.runningEntitySearch);
	}, [state]);

	useEffect(() => {
		if (state.searchSettings.expansionTermAdded) {
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

			const newSearchSettings = _.cloneDeep(state.searchSettings);
			newSearchSettings.expansionTermAdded = false;
			setState(dispatch, {
				searchText: newSearchText,
				runSearch: true,
				searchSettings: newSearchSettings,
			});
		}
	}, [state, expansionTerms, dispatch]);

	useEffect(() => {
		gameChangerAPI
			.getOrgImageOverrideURLs(topEntities.map((entity) => entity.name))
			.then(({ data }) => {
				setOrgOverrideImageURLs(data);
			});
	}, [topEntities]);

	useEffect(() => {
		try {
			gameChangerAPI.gcOrgSealData().then(({ data }) => {
				let orgSources = data.filter((org) =>
					org.image_link.startsWith('s3://')
				);
				if (orgSources.length > 0) {
					let folder = orgSources[0].image_link.split('/');
					folder = folder[folder.length - 2];
					const thumbnailList = orgSources.map((item) => {
						let filename = item.image_link.split('/').pop();
						return { img_filename: filename };
					});
					gameChangerAPI
						.thumbnailStorageDownloadPOST(
							thumbnailList,
							folder,
							state.cloneData
						)
						.then(({ data }) => {
							const buffers = data;
							buffers.forEach((buf, idx) => {
								if (buf.status === 'fulfilled') {
									if (orgSources[idx].image_link.split('.').pop() === 'png') {
										orgSources[idx].imgSrc =
											'data:image/png;base64,' + buf.value;
									} else if (
										orgSources[idx].image_link.split('.').pop() === 'svg'
									) {
										orgSources[idx].imgSrc =
											'data:image/svg+xml;base64,' + buf.value;
									}
								} else {
									orgSources[idx].imgSrc = DefaultSeal;
								}
							});
						}).catch(e => {
							//Do nothing
						});
				}
				setOrgSources(orgSources);
			});
		} catch (e) {
			// Do nothing
		}
	}, [state.cloneData]);

	const handleImgSrcError = (event, fallbackSources) => {
		if (fallbackSources.admin) {
			// fallback to entity
			event.target.src = fallbackSources.entity;
		} else if (fallbackSources.entity) {
			// fallback to default
			event.target.src = dodSeal;
		}
	};

	const renderTopEntities = () => {
		return (
			<StyledTopEntities>
				{topEntities.map((entity) => {
					let fallbackSources = {
						s3: undefined, // use values from orgSources
						admin: orgOverrideImageURLs[entity.name],
						entity: entity.image,
					};
					return (
						<GCTooltip
							key={entity.name}
							title={entity.name}
							arrow
							enterDelay={30}
							leaveDelay={10}
						>
							<div
								className={'entity-div'}
								onClick={() => {
									trackEvent(
										getTrackingNameForFactory(state.cloneData.clone_name),
										'TopEntitySelected',
										entity.name
									);
									window.open(
										`#/gamechanger-details?cloneName=${cloneData.clone_name}&type=entity&entityName=${entity.name}`
									);
								}}
							>
								<img
									alt={`${entity.name} Img`}
									src={
										fallbackSources.s3 ||
										fallbackSources.admin ||
										fallbackSources.entity
									}
									onError={(event) => {
										handleImgSrcError(event, fallbackSources);
										if (fallbackSources.admin)
											fallbackSources.admin = undefined;
									}}
								/>
								<span>{entity.aliase}</span>
							</div>
						</GCTooltip>
					);
				})}
			</StyledTopEntities>
		);
	};
	const renderExpansionTerms = (
		expansionTerms,
		handleAddSearchTerm,
		classes
	) => {
		return (
			<div style={{ margin: '10px 0 10px 0' }}>
				<FormGroup row style={{ marginLeft: '20px', width: '100%' }}>
					{expansionTerms.map(({ phrase, source, checked }, idx) => {
						let term = phrase;
						term = term.length > 25 ? term.substring(0, 25 - 3) + '...' : term;

						return (
							<GCTooltip
								key={phrase}
								title={phrase}
								arrow
								enterDelay={30}
								leaveDelay={10}
							>
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

	const renderTopTopics = () => {
		return (
			<StyledTopTopics>
				{topTopics.map((topic, idx) => {
					return (
						<div
							className={'topic-button'}
							key={`topic-${idx}`}
							onClick={() => {
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'TopTopics',
									topic.name
								);
								window.open(
									`#/gamechanger-details?cloneName=${cloneData.clone_name}&type=topic&topicName=${topic}`
								);
							}}
						>
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
			${({ color }) => (color ? `background: ${color};` : '')}
			${({ color }) => (color ? `color: white;` : '')}
		`;
		const columns = [
			{
				Header: 'Category',
				accessor: 'category',
				headerClassName: 'legend-header',
				minWidth: 200,
				Cell: (row) => <TableRow>{row.value}</TableRow>,
			},
			{
				Header: 'Color',
				accessor: 'color',
				headerClassName: 'legend-header',
				Cell: (row) => <TableRow color={row.value}>{row.value}</TableRow>,
			},
		];
		const orgArray = [];
		for (const key in orgColorMap) {
			orgArray.push({ category: key, color: orgColorMap[key] });
		}

		return (
			<ReactTable
				data={orgArray}
				columns={columns}
				style={{ width: '100%' }}
				showPagination={false}
				className="-striped -highlight legend-table"
			/>
		);
	};

	const handleAddSearchTerm = (phrase, source, idx) => {
		const temp = _.cloneDeep(expansionTerms);
		temp[idx].checked = !temp[idx].checked;
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.expansionTermAdded = true;
		newSearchSettings.isFilterUpdate = true;
		setState(dispatch, { searchSettings: newSearchSettings });
		setExpansionTerms(temp);
	};
	return (
		<div
			className={''}
			style={{ height: 'fit-content', minWidth: '100%', marginRight: -10 }}
		>
			<div className={''}>
				<div style={styles.innerContainer}>
					<div style={styles.cardBody} className={`tutorial-step-unknown2`}>
						<div style={styles.innerContainer}>
							{expansionTerms.length > 0 && (
								<div style={{ width: '100%', marginBottom: 10 }}>
									<GCTooltip
										title={'Select a document for export'}
										placement="top"
										arrow
									>
										<GCAccordion
											expanded={expansionTermSelected}
											header={'SEARCHES'}
											headerTextWeight={'normal'}
										>
											{renderExpansionTerms(
												expansionTerms,
												handleAddSearchTerm,
												classes
											)}
										</GCAccordion>
									</GCTooltip>
								</div>
							)}
							{topEntities.length > 0 && (
								<>
									<div style={{ width: '100%', marginBottom: 10 }}>
										<GCAccordion
											expanded={true}
											header={'ORGANIZATIONS'}
											headerTextWeight={'normal'}
										>
											{runningEntitySearch ? (
												<div style={{ margin: '0 auto' }}>
													<LoadingIndicator
														customColor={gcColors.buttonColor2}
													/>
												</div>
											) : (
												<>{renderTopEntities()}</>
											)}
										</GCAccordion>
									</div>
									<div style={{ width: '100%', marginBottom: 10 }}>
										<GCAccordion
											expanded={false}
											header={'TOPICS'}
											headerTextWeight={'normal'}
										>
											{runningTopicSearch ? (
												<div style={{ margin: '0 auto' }}>
													<LoadingIndicator
														customColor={gcColors.buttonColor2}
													/>
												</div>
											) : (
												<>{renderTopTopics()}</>
											)}
										</GCAccordion>
									</div>
									{false && (
										<div style={{ width: '100%', marginBottom: 10 }}>
											<GCAccordion
												expanded={false}
												header={'LEGEND'}
												headerTextWeight={'normal'}
											>
												<>{renderLegend()}</>
											</GCAccordion>
										</div>
									)}
								</>
							)}
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
				clone_name: PropTypes.string,
			}),
		}),
	}),
};
