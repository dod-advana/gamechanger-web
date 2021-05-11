import React, {useEffect} from "react";

import LoadingIndicator from 'advana-platform-ui/dist/loading/LoadingIndicator.js';

import './sidebar.css';
import styled from "styled-components";
import { trackEvent } from '../telemetry/Matomo';
import {getTrackingNameForFactory, orgColorMap} from "../../gamechangerUtils";
import GCTooltip from "../common/GCToolTip";
import GCAccordion from "../common/GCAccordion";
import ReactTable from 'react-table';

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

export default function SideBar(props) {
	
	const {
		cloneData = {},
		context
	} = props;
	
	const {state} = context;
	
	const [topEntities, setTopEntities] = React.useState([]);
	const [topTopics, setTopTopics] = React.useState([]);
	const [runningTopicSearch, setRunningTopicSearch] = React.useState(state.runningTopicSearch);
	const [runningEntitySearch, setRunningEntitySearch] = React.useState(state.runningEntitySearch);
	
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
	
	const renderTopTopics = () => {
		return (
			
			<StyledTopTopics>
				{topTopics.map((topic, idx) => {
					return (
						<div className={'topic-button'} key={`topic-${idx}`}onClick={() => {
							trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'TopTopics', topic.name)
							window.open(`#/gamechanger/details?cloneName=${cloneData.clone_name}&type=topic&topicName=${topic}`);
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

	return (
		<div className={''} style={{ height: 'fit-content', minWidth: '100%', marginRight: -10 }}>
			<div className={''}>
				<div style={styles.innerContainer}>
					<div style={styles.cardBody} className={`tutorial-step-unknown2`}>
						<div style={styles.innerContainer}>
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
								<div style={{width: '100%', marginBottom: 10}}>
									<GCAccordion expanded={false} header={'LEGEND'} headerTextWeight={'normal'}>
										<>
											{renderLegend()}
										</>
									</GCAccordion>
								</div>
							</>}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
