import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import './node-cluster-view.css';
import {backgroundWhite} from "../../components/common/gc-colors";
import {
	convertHexToRgbA,
	getDocTypeStyles,
	getLinkColor, getTrackingNameForFactory,
	numberWithCommas,
	typeColorMap
} from "../../gamechangerUtils";
import GameChangerAPI from "../api/gameChanger-service-api";

import styled from 'styled-components'
import GCTooltip from "../common/GCToolTip";
import {MemoizedNodeCluster2D, StyledLegendClickable} from "./GraphNodeCluster2D";
import {generateRandomColors, getLines, getTextColorBasedOnBackground, getNodeOutlineColors} from "../../graphUtils";
import Config from "../../config/config";
import {trackEvent} from "../telemetry/Matomo";
import {Card} from "../cards/GCCard";

const _ = require('lodash');

const NO_RESULTS_MESSAGE = 'No results found! Please try refining your search.';
const HIDDEN_NODE_ALPHA = 0.08;
const NODE_ALPHA = 1;
const LINK_ALPHA = 0.5;
const DEGREE_REL_TO_GET = 1;
const ZOOM_LIMIT = 8;

const gameChangerAPI = new GameChangerAPI();

const styles = {
	graphContainer: {
		alignItems: 'center',
		width: 'unset',
		height: '800px',
		margin: '0'
	},
	centeredContent: {
		position: 'absolute',
		zIndex: '99',
		left: '50%',
		top: '70%',
		transform: 'translate(-50%, -50%)',
	},
	loading: {
		position: 'absolute',
		zIndex: '99',
		left: '50%',
		top: '50%',
		transform: 'translate(-50%, -50%)',
	},
	toggle: {
		position: 'absolute',
		zIndex: '99',
	},
	graphCard: {
		position: 'absolute',
		zIndex: '99',
		right: '4%',
		top: '40%',
		backgroundColor: backgroundWhite,
		perspective: '1000px',
		width: 415
	},
	noResultsMessage: {
		fontWeight: 'bold',
		fontSize: '20px',
		margin: 'auto'
	},
	legendKey: {
		margin: '3em 0 0 0',
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		display: 'inline-block',
		fontWeight: 500,
		border: '1px solid lightgray',
		borderRadius: '6px',
		zIndex: 1,
		position: 'absolute',
		overflowY: 'auto',
		maxHeight: '650px',
		padding: '6px 0 6px 0',
		minWidth: '240px'
	},
	resultsText: {
		display: 'inline-block',
		fontWeight: 'bold',
		zIndex:1,
		fontSize: 22,
		color: '#131E43',
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		padding: '10px 6px 6px 6px',
		borderRadius: '3px'
	},
	legendRow: {
		margin: '1em',
		display: 'flex',
		alignItems: 'center'
	},
	legendRowClickable: {
		margin: '1em',
		display: 'flex',
		alignItems: 'center',
		cursor: 'pointer'
	},
	settingsMenuFormDiv: {
		marginTop: '5px',
		marginBottom: '5px'
	}
};

const StyledCircularMenu = styled.nav`
	width: 250px;
	height: 250px;
	margin: 0 auto;
	position: relative;
	pointer-events: none;
	
	> .circle {
		width: 250px;
		height: 250px;
		opacity: 0;
		-webkit-transform: scale(0);
		-moz-transform: scale(0);
		transform: scale(0);
		-webkit-transition: all 0.4s ease-out;
		-moz-transition: all 0.4s ease-out;
		transition: all 0.4s ease-out;
		position: relative;
		
		> .items {
			position: absolute;
			left: -20px;
			top: -20px;
			width: 250px;
    		height: 250px;
			
			> .graph-contextItem {
				position: absolute;
				width: 50px;
				height: 50px;
				pointer-events: auto;
				cursor: pointer;
				
				> .graph-contextBackground {
					background-color: rgb(210, 213, 218);
					border-radius: 50px;
					width: 100%;
					height: 100%;
				}
				
				&:hover {
					> .graph-contextBackground {
						border-color: rgb(185, 185, 185) transparent transparent transparent;
						background-color: rgb(185, 185, 185);
					}
				}
				
				> div {
					position: absolute;
					    width: 50px;
						height: 50px;
						text-align: center;
					> .graph-contextIcon {
						color: black;
						    padding: 10px 0;
					}
				}
				
			}
		}
		
	}
	
	> .open {
		opacity: 1;
		-webkit-transform: scale(1);
		-moz-transform: scale(1);
		transform: scale(1);
	}
`;

const makeGraphCollections = (graph) => {
	const { nodes } = graph;
	const docOrgNumbers = {};
	const collections = {};
	const nameToIdMap = {};

	nodes.forEach(node => {
		if (node.label === 'Publication') {
			nameToIdMap[node.name] = node.id;
		}
	});

	nodes.forEach(node => {

		const displayOrg = node['display_org_s'] ? node['display_org_s'] : 'Uncategorized';
		const displayType = node['display_doc_type_s'] ? node['display_doc_type_s'] : 'Document';
		
		switch (node.label) {
			case 'Entity':
				if (docOrgNumbers.hasOwnProperty('Entity')) {
					docOrgNumbers['Entity'] += 1;
				} else {
					docOrgNumbers['Entity'] = 1;
				}
				
				if (!collections.hasOwnProperty('Entity')) {
					collections['Entity'] = [];
				}
	
				collections['Entity'].push(node);
				break;
			case 'Topic':
				if (docOrgNumbers.hasOwnProperty('Topic')) {
					docOrgNumbers['Topic'] += 1;
				} else {
					docOrgNumbers['Topic'] = 1;
				}
				
				if (!collections.hasOwnProperty('Topic')) {
					collections['Topic'] = [];
				}
	
				collections['Topic'].push(node);
				break;
			default:
				node.orgType = getDocTypeStyles(displayType, displayOrg).docOrg;
	
				if (docOrgNumbers.hasOwnProperty(displayType)) {
					docOrgNumbers[displayType] += 1;
				} else {
					docOrgNumbers[displayType] = 1;
				}
		
				if (node.label === 'Publication') {
					if (!collections.hasOwnProperty(node.id)) {
						collections[node.id] = [];
					}
				} else if (node.label === 'Document') {
					if (!collections.hasOwnProperty(nameToIdMap[`${node.doc_type} ${node.doc_num}`])) {
						collections[nameToIdMap[`${node.doc_type} ${node.doc_num}`]] = [];
					}
		
					collections[nameToIdMap[`${node.doc_type} ${node.doc_num}`]].push(node);
				}
				break;
				
		}
	});
	
	return { collections, docOrgNumbers };
}

const setFixedCoordsBasedOnView = (is2D, nodes) => {
	nodes.forEach((node, idx) => {
		if (is2D) {
			if (node.coords2d && nodes.length > 1000) {
				nodes[idx].fx = node.coords2d.fx;
				nodes[idx].fy = node.coords2d.fy;
			} else {
				nodes[idx].x = null;
				nodes[idx].y = null;
			}
		} else {
			if (node.coords3d && nodes.length > 500) {
				node.fx = node.coords3d.fx;
				node.fy = node.coords3d.fy;
				node.fz = node.coords3d.fz;
			} else {
				nodes[idx].x = null;
				nodes[idx].y = null;
				nodes[idx].z = null;
			}
		}
	});
}

const makeFilteredGraph = (is2D, graph, collections) => {
	const { nodes, edges, timeFound = 0 } = graph;
	let documentsFound = 0;

	const gT0 = new Date().getTime();

	const { filteredGraph, docOrgNumbers } = filterGraphData(nodes, edges, collections);

	setFixedCoordsBasedOnView(is2D, filteredGraph.nodes);

	Object.keys(collections).forEach(key => {
		documentsFound += collections[key].length;
	});

	const gT1 = new Date().getTime();
	
	return { filteredGraph, documentsFound, docOrgNumbersTmp: docOrgNumbers, timeFound: (((gT1 - gT0) / 1000) + timeFound).toFixed(2) };
}

const filterGraphData = (nodes, edges, collections) => {

	const filteredGraph = { nodes: [], edges: [], relationships: [] };

	// remove nodes in collections, and collection nodes with only 1 child
	const labelsToIgnore = ['Entity', 'Topic']
	const nodesInLargeCollections = _.values(collections).filter(collection => {
		return collection.length > 1 && !labelsToIgnore.includes(collection[0].label);
	});
	
	const singleNodeCollectionIDs = [];
	_.keys(collections).forEach(id => {
		const children = collections[id];

		if (children.length === 1) {
			singleNodeCollectionIDs.push(parseInt(id));
		}
	});
	const singleNodeCollections = nodes.filter(node => _.includes(singleNodeCollectionIDs, node.id));

	const minimizedNodes = _.flatMapDeep(nodesInLargeCollections);
	const minimizedNodesIDs = minimizedNodes.map(node => node.id);
	const nodeToFilter = minimizedNodes.concat(singleNodeCollections);
	const docOrgNumbers = {};
	
	_.forEach(nodes, (node) => {
		if(!_.includes(nodeToFilter, node) && !node.hidden) {
			filteredGraph.nodes.push(node);
			
			const displayOrg = node['display_org_s'] ? node['display_org_s'] : 'Uncategorized';
			
			switch (node.label) {
				case 'Entity':
					if (docOrgNumbers.hasOwnProperty('Entity')) {
						docOrgNumbers['Entity'] += 1;
					} else {
						docOrgNumbers['Entity'] = 1;
					}
					break;
				case 'Topic':
					if (docOrgNumbers.hasOwnProperty('Topic')) {
						docOrgNumbers['Topic'] += 1;
					} else {
						docOrgNumbers['Topic'] = 1;
					}
					break;
				default:
					if (docOrgNumbers.hasOwnProperty(displayOrg)) {
						docOrgNumbers[displayOrg] += 1;
					} else {
						docOrgNumbers[displayOrg] = 1;
					}
					break;
			}
		}
	});

	_.forEach(edges, (edge) => {
		const sourceHasNode = edge.source.hasOwnProperty('id');
		const targetHasNode = edge.target.hasOwnProperty('id');

		const edgeSource = sourceHasNode ? edge.source.id : edge.source;
		const edgeTarget = targetHasNode ? edge.target.id : edge.target;


		// do not add edges to 'minimized' nodes
		if (!_.includes(minimizedNodesIDs, edgeSource) && !edge.target.hidden && !edge.source.hidden) {

			// do not add doc node -> single collection node relationship
			if (!(collections[edgeTarget] && collections[edgeTarget].length === 1 && collections[edgeTarget][0].id === edgeSource)) {

				// otherwise adjust removed collection node edges accordingly
				if (_.includes(singleNodeCollectionIDs, edgeSource)) {
					edge.source = collections[edgeSource][0].id;
				}
				if (_.includes(singleNodeCollectionIDs, edgeTarget)) {
					edge.target = collections[edgeTarget][0].id;
				}

				filteredGraph.edges.push(edge);
				
				if (!filteredGraph.relationships.includes(edge.label)) {
					filteredGraph.relationships.push(edge.label);
				}
			}
		}
	});

	return { filteredGraph, docOrgNumbers };
}

function NodeClusterView(props) {
	
	const {
		noSearches,
		graphData = { nodes: [], edges: [], timeFound: 0 },
		runningSearch,
		notificationCountProp = 0,
		expansionTerms,
		state,
		dispatch
	} = props;
	
	const [documentsFound, setDocumentsFound] = React.useState(0);
	const [timeFound, setTimeFound] = React.useState('0');
	const [filteredGraph, setFilteredGraph] = React.useState({edges: [], nodes: []});
	const [show2DView, setShow2DView] = React.useState(true);
	const [showGraphCard, setShowGraphCard] = React.useState(false);
	const [selectedItem, setSelectedItem] = React.useState({});
	const [selectedID, setSelectedID] = React.useState(null);
	const [orgTypeSelected, setOrgTypeSelected] = React.useState(null);
	const [docOrgNumbers, setDocOrgNumbers] = React.useState({});
	const [collections, setCollections] = React.useState({});
	
	const [shouldRender, setShouldRender] = React.useState(true);
	const [runSimulation, setRunSimulation] = React.useState(true);
	const [degreeConnected, setDegreeConnected] = React.useState({ 0: [], 1: [], 2: [] });
	const [graph, setGraph] = React.useState({ nodes: [], edges: [] });
	const [legendData, setLegendData] = React.useState({});
	const [reloadGraph, setReloadGraph] = React.useState(false);
	const [contextOpen, setContextOpen] = React.useState(false);
	const [mouseXY, setMouseXY] = React.useState({x: 0, y: 0});
	const [highlightNodes, setHighlightNodes] = React.useState(new Set());
	
	const [nodeHoverID, setNodeHoverID] = React.useState(-1);
	const [shouldCenter, setShouldCenter] = React.useState(true);
	
	const [notificationCount, setNotificationCount] = React.useState(0);
	
	const [graphCardData, setGraphCardData] = React.useState({});
	
	const graph2DRef = useRef();
	
	const [nodeRelSize, setNodeRelSize] = React.useState(5);
	
	const [communityView, setCommunityView] = React.useState(false);
	
	const [width, setWidth] = React.useState(window.innerWidth * (((state.showSideFilters ? 68.5 : 90.5) - 1) / 100));
	const [height, setHeight] = React.useState(window.innerHeight * .75);
	
	useEffect(() => {
		setWidth(window.innerWidth * (((state.showSideFilters ? 68.5 : 90.5) - 1) / 100));
		setHeight(window.innerHeight * .75);
	}, [state]);
	
	useEffect(() => {
		if (!graphData || graphData.nodes?.length <= 0) return;
		setContextOpen(false);
		setShouldRender(true);
		setShow2DView(true);
		setGraph(graphData);
		setHighlightNodes(new Set());
		setRunSimulation(true);
		setReloadGraph(true);
	}, [graphData]);
	
	useEffect(() => {
		setContextOpen(false);
		setRunSimulation(true);
	}, [runningSearch]);
	
	useEffect(() => {
		setNotificationCount(notificationCountProp);
	}, [notificationCountProp]);
	
	useEffect(() => {
		
		if (!graph || !graph.nodes) return;
		
		const tmpLegendData = {};
		
		if (communityView) {
			const communities = Array.from(new Set(graph.nodes.map(node => {
				return node.community;
			})));
			const nodeColors = generateRandomColors(communities.length);
			
			graph.nodes.forEach(node => {
				node.color = nodeColors[communities.indexOf(node.community)];
				if (!tmpLegendData[node.community]) {
					tmpLegendData[node.community] =  { color: node.color, name: node.community };
				}
			});
			
		} else {
			graph.nodes.forEach(node => {
				const displayOrg = node['display_org_s'] ? node['display_org_s'] : 'Uncategorized';
				const displayType = node['display_doc_type_s'] ? node['display_doc_type_s'] : 'Document';
				switch (node.label) {
					case 'Entity':
						if (!tmpLegendData['Entity']) {
							tmpLegendData['Entity'] =  { color: typeColorMap.organization, name: 'Entity' };
						}
						node.color = typeColorMap.organization;
						break;
					case 'Topic':
						if (!tmpLegendData['Topic']) {
							tmpLegendData['Topic'] =  { color: typeColorMap.topic, name: 'Topic' };
						}
						node.color = typeColorMap.topic;
						break;
					default:
						const docData = getDocTypeStyles(displayType, displayOrg);
						node.color = docData.docOrgColor !== '' ? docData.docOrgColor : '#964B00';
						if (!tmpLegendData[docData.docOrg]) {
							tmpLegendData[docData.docOrg] = { color: docData.docOrgColor, name: docData.docOrg };
						}
						break;
				}
			});
		}
		
		setLegendData(tmpLegendData);
		
		const { collections } = makeGraphCollections(graph);
		setCollections(collections);
		
		const { filteredGraph, documentsFound, docOrgNumbersTmp, timeFound} = makeFilteredGraph(show2DView, graph, collections);
		
		setFilteredGraph(filteredGraph);
		setDocumentsFound(documentsFound);
		setDocOrgNumbers(docOrgNumbersTmp);
		setTimeFound(timeFound);
	}, [graph, show2DView, reloadGraph, communityView]);
	
	const reloadAndRunSimulation = () => {
		setShouldRender(true);
		setRunSimulation(!runSimulation);
		setReloadGraph(!reloadGraph);
	}
	
	const doRunSimulation = () => {
		setShouldRender(true);
		setRunSimulation(!runSimulation);
	}
	
	const handleCloseGraphCard = () => {
		const filteredNodes = filteredGraph.nodes;
		const filteredEdges = filteredGraph.edges;
		
		clearSelection();
		
		setShowGraphCard(!showGraphCard);
		setFilteredGraph({ nodes: filteredNodes, edges: filteredEdges });
	}
	
	const removeChildren = (nodeId, filteredNodes, filteredEdges) => {
		const nodeIsToRemove = [];
		_.forEach(graph.nodes, tmpNode => {
			if (_.includes(collections[nodeId], tmpNode)){
				nodeIsToRemove.push(tmpNode.id);
				_.remove(filteredNodes, (n) => {
					return n === tmpNode;
				});
			}
		});

		_.forEach(graph.edges, (edge) => {
			const sourceHasNode = edge.source.hasOwnProperty('id');
			if(_.includes(nodeIsToRemove, sourceHasNode ? edge.source.id : edge.source)) {
				_.remove(filteredEdges, (n) => {
					return n.id === edge.id;
				});
			}
		});
	};
	
	const clearSelection = () => {
		highlightNodes.clear();
		setSelectedID(null);
		setDegreeConnected({0: [], 1: [], 3: [] });
	}
	
	const renderNodeLegendItems = () => {
		return (
			<>
			{ !runningSearch &&
				Object.keys(legendData).sort().map(key => {
					return (
						<GCTooltip key={key} title={`${docOrgNumbers[key]} node${docOrgNumbers[key] > 1 ? 's' : ''} associated`} arrow enterDelay={30}>
							<StyledLegendClickable
								key={legendData[key].name}
								onClick={() => handleLegendNodeClick(key)}
								typeSelected={orgTypeSelected}
								type={key}
							>
								<div style={{
									backgroundColor: legendData[key].color,
									width: '1em',
									height: '1em',
									borderRadius: '50%',
									marginTop: '4px',
								}}>
								</div>
								<div style={{ marginLeft: '2em', width: '80%' }}>{legendData[key].name}</div>
							</StyledLegendClickable>
						</GCTooltip>
					)
				})
			}
			</>
		);
	}
	
	const handleLegendNodeClick = (legendKey) => {
		trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'GraphLegendClicked', legendKey, legendKey !== orgTypeSelected);
		setOrgTypeSelected(legendKey === orgTypeSelected ? null : legendKey);
	}
	
	const showNodeContextMenu = () => {
		const myStyle = {
			position: 'absolute',
			top: `${mouseXY.y + 99 + (notificationCount * 50) + (expansionTerms ? 41 : 0)}px`,
			left:`${mouseXY.x - 20 + (state.showSideFilters ? 424 : 0)}px`,
			zIndex: 99
		};
		
		if (!graph || !graph.nodes) return;
		
		const node = graph.nodes.filter(node => {
			return node.id === selectedID;
		})[0];
		
		const nodeLabel = node ? node.label : '';
		const notInOriginal = node ? node.notInOriginalSearch : '';
		
		const menuItems = [];
		let cardText = '';
		
		switch (nodeLabel) {
			case 'Publication':
			case 'Document':
				cardText = 'document';
				break;
			case 'Entity':
				cardText = 'entity';
				break;
			case 'Topic':
				cardText = 'topic';
				break;
			default:
				break;
		}
		
		menuItems.push({ className: "fa fa-book fa-2x", onClick: () => handleContextMenuButtonClicked(() =>
				handleShowGraphCard(), false, 'showGraphCard'), tooltip: `Display the ${cardText} card`});
		
		if (nodeLabel === 'Publication' && !notInOriginal) {
			menuItems.push({ className: "fa fa-sitemap  fa-2x", onClick: () => handleContextMenuButtonClicked(() =>
				showChildDocuments(), true, 'showChildDocuments'), tooltip: 'Display child documents'});
		}
		if (nodeLabel === 'Document' && !notInOriginal) {
			menuItems.push({ className: "fa fa-address-card fa-2x", onClick: () => handleContextMenuButtonClicked(() =>
				showEntitiesForNode(), true, 'showEntities'), tooltip: 'Display entity nodes for this document'});
			if (Config.GAMECHANGER.SHOW_TOPICS) {
				menuItems.push({
					className: "fa fa-lightbulb-o fa-2x", onClick: () => handleContextMenuButtonClicked(() =>
						showTopicsForNode(), true, 'showTopics'), tooltip: 'Display topic nodes for this document'
				});
			}
		}
		
		if (!notInOriginal) {
			menuItems.push({
				className: "fa fa-code-fork fa-2x", onClick: () => handleContextMenuButtonClicked(() =>
					showReferencesForNode(), true, 'showReference'), tooltip: 'Display reference nodes for this document'
			});
		}
		
		menuItems.push({ className: "fa fa-unlock fa-2x", onClick: () => handleContextMenuButtonClicked(() =>
					lockNodeInPlace(null, false), true, 'lockUnlockNode'), tooltip: 'Unlock the node'});
		menuItems.push({ className: "fa fa-eye-slash fa-2x", onClick: () => handleContextMenuButtonClicked(() =>
					hideNode(), true, 'hideNode'), tooltip: 'Dismiss the node from the graph'});
		
		return (
			<StyledCircularMenu style={myStyle}>
				<div className={`circle ${contextOpen ? 'open' : null}`}>
					<div className={"items"}>
						{menuItems.map((item, idx) => {
							const leftBack = (50 - 31*Math.cos(-0.5 * Math.PI - 2*(1/menuItems.length)*idx*Math.PI)).toFixed(4) + "%";
							const topBack = (50 + 31*Math.sin(-0.5 * Math.PI - 2*(1/menuItems.length)*idx*Math.PI)).toFixed(4) + "%";
							return (
								<GCTooltip title={item.tooltip} arrow enterDelay={30} key={`tooltip-${idx}`}>
									<div className={"graph-contextItem"} onClick={item.onClick} style={{left: leftBack, top: topBack}}>
										<div className={"graph-contextBackground"} style={{transform: `rotate(${idx*(360/menuItems.length)}deg)`}}>
										</div>
										<div>
											<i className={`graph-contextIcon ${item.className}`}/>
										</div>
									</div>
								</GCTooltip>
							);
						})}
					</div>
				</div>
			</StyledCircularMenu>
		)
	}
	
	const handleContextMenuButtonClicked = (funcToRun, removeSelectedID, name) => {
		trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'GraphContextMenuClicked', name)
		funcToRun();
		setContextOpen(false);
		if (removeSelectedID) {
			setSelectedID(-1);
		}
	}
	
	const create2dGraphNode = (node, ctx, globalScale) => {
		let outlineThickness = 3;
		let connectedLevel = -1;

		if (highlightNodes.size > 0 && highlightNodes.has(node)) {
			if (_.includes(degreeConnected[0], node)){
				connectedLevel = 0;
			} else if (_.includes(degreeConnected[1], node)) {
				connectedLevel = 1;
			}
			outlineThickness += 2;
		}

		if (_.includes(collections[selectedID], node)) {
			outlineThickness += 2;
		}

		if (selectedID === node.id){
			outlineThickness += 2;
		}
		
		
		const combinedTypes = ['Topic', 'Entity'];
		const nodeType = communityView ? String(node.community) : combinedTypes.includes(node.label) ? node.label : node.orgType;

		const nodeColor = (orgTypeSelected !== null && orgTypeSelected !== nodeType) ?
			convertHexToRgbA(node.color, HIDDEN_NODE_ALPHA) :
			convertHexToRgbA(node.color, NODE_ALPHA);
		const outlineColor = (orgTypeSelected !== null && orgTypeSelected !== nodeType) ?
			getNodeOutlineColors(node, HIDDEN_NODE_ALPHA, node.color, connectedLevel) :
			getNodeOutlineColors(node, NODE_ALPHA, node.color, connectedLevel);

		ctx.beginPath();

		ctx.fillStyle = nodeColor;
		ctx.arc(node.x, node.y, node.value * nodeRelSize, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.strokeStyle = outlineColor
		ctx.lineWidth = outlineThickness / globalScale;
		ctx.arc(node.x, node.y, node.value * nodeRelSize, 0, 2 * Math.PI, false);
		ctx.stroke();
		
		// Selected/Hovered Outline
		if (node.id === selectedID || node.id === nodeHoverID) {
			ctx.strokeStyle = convertHexToRgbA('#6ac6ff',
				(orgTypeSelected !== null && orgTypeSelected !== nodeType) ? HIDDEN_NODE_ALPHA : NODE_ALPHA);
			ctx.lineWidth = (outlineThickness + 0.5) / globalScale;
			ctx.arc(node.x, node.y, node.value * nodeRelSize + 0.2, 0, 2 * Math.PI, false);
			ctx.stroke();
		}

		handleCreateNodeText(node, ctx, globalScale, null);
	}
	
	const createNodeLabel = (node) => {
		const useNameOnly = ['Entity', 'Topic'];
		return useNameOnly.includes(node.label) ? node.name : `${node.doc_type} ${node.doc_num}`;
	}
	
	const handleCreateNodeText = (node, ctx, globalScale, nodeTextColor) => {
		const label = createNodeLabel(node);
		const MAX_FONT_SIZE = (nodeRelSize / 5) * 1.5
		
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = nodeTextColor || getTextColorBasedOnBackground(node.color);

		if (label && globalScale > (3 / (nodeRelSize / 5))) {
			const lines = getLines(ctx, label,  node.value * nodeRelSize);
			lines.lines.forEach(function(line, i) {
				const fontSize = Math.min(MAX_FONT_SIZE, (node.value * nodeRelSize + 1.5) / lines.lines.length );
				ctx.font = `${fontSize}px Sans-Serif`;

				const mid = lines.lines.length / 2;
				if (lines.lines.length % 2 === 0) { // Even so no middle
					if (i <= mid) {
						ctx.fillText(line, node.x, node.y - (fontSize * Math.floor(mid - i)) + (lines.lines.length > 1 ? (fontSize / lines.lines.length) : 0));
					} else {
						ctx.fillText(line, node.x, node.y + (fontSize * Math.floor(i - mid)) + (lines.lines.length > 1 ? (fontSize / lines.lines.length) : 0));
					}
				} else { // Odd So middle
					if (i < mid) {
						ctx.fillText(line, node.x, node.y - (fontSize * Math.floor(mid - i)) + (lines.lines.length > 1 ? (fontSize / lines.lines.length) : 0));
					} else {
						ctx.fillText(line, node.x, node.y + (fontSize * Math.floor((i+1) - mid)) + (lines.lines.length > 1 ? (fontSize / lines.lines.length) : 0));
					}
				}
			});
		}
	}
	
	const handleGetLinkColor = (link) => {
		const start = link.source;
		const end = link.target;
		
		if (orgTypeSelected !== null && (start.orgType !== orgTypeSelected || end.orgType !== orgTypeSelected) ) {
			return getLinkColor(link, HIDDEN_NODE_ALPHA);
		} else {
			return getLinkColor(link, LINK_ALPHA);
		}
	}
    
    const handleNodeHover = (node) => {
		const elem = document.getElementById('graph2dContainer');
		elem.style.cursor = node ? 'pointer' : null;
		setNodeHoverID(node ? node.id : -1);
		
		if (node) {
			highlightSelectedNodes(node, filteredGraph.edges);
		} else {
			highlightNodes.clear();
		}
	}
    
    const handleNodeClick = async (node, event) => {
		trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'GraphNodeClicked', node.name);
		setShouldCenter(false);
		
		// Sleep until node is in place
		const sleep = (milliseconds) => {
		  return new Promise(resolve => setTimeout(resolve, milliseconds));
		}
		
		if (selectedID !== node.id && contextOpen) {
			setContextOpen(false);
			await sleep(500);
		}
		
		if (selectedID !== node.id) {
			setSelectedID(node.id);
		} else {
			setSelectedID(null);
			setShowGraphCard(false);
			setContextOpen(false);
			return;
		}
		
		// Zoom and center node
		graph2DRef.current.centerAt(node.x, node.y, 500);
		graph2DRef.current.zoom(ZOOM_LIMIT, 500);
		
		sleep(500).then(() => {
			const {x, y} = graph2DRef.current.graph2ScreenCoords(node.x, node.y);
			setMouseXY({x: x, y: y});
			setContextOpen(true);
		});
		
		lockNodeInPlace(node, true);
	}
	
	const handleShowGraphCard = async () => {
		
		const node = graph.nodes.filter(node => {
			return node.id === selectedID;
		})[0];
		
		let cardItem = {};
		
		setGraphCardData({done: false});
		
		const ignoreLabels = ['Publication', 'Entity', 'Topic'];
		if (!ignoreLabels.includes(node?.label)) {
			const resp = await gameChangerAPI.callGraphFunction({
				functionName: 'getSingleDocument',
				cloneName: state.cloneData.clone_name,
				options: {
					docIds: [node.doc_id],
					searchText: state.searchText
				}
			})
			
			cardItem = resp.data.docs[0];
		}
		
		let item = {
			id: node.id,
			title: node.name,
			label: node.label
		};
		node.properties.forEach(prop => {
			item[prop] = node[prop];
		});
		
		let cardType = '';
		switch (node.label) {
			case 'Document':
			case 'Publication':
				cardType = node.label === 'Document' ? 'document' : 'publication';
				item = {
					...node,
					...cardItem,
					id: node.id,
					title: node.label === 'Publication' ? `${node.name}` : `${node.display_title_s}`,
					type: cardType,
					doc_ids: [],
					label: node.label,
					name: node.name,
					isCollection: node.label === 'Publication',
				};
				setSelectedItem(item);
				break;
			case 'Entity':
				cardType = 'organization';
				item.description = '';
				item.type = cardType;
				setSelectedItem(item);
				break
			case 'Topic':
				cardType = 'topic';
				item.type = cardType;
				setSelectedItem(item);
				break;
			default:
				break;
		}
		
		setShowGraphCard(true);
	}
	
	const displayGraphCard = () => {
		
		switch (selectedItem.label) {
			case 'Publication':
				return (
					<Card
						item={selectedItem}
						closeGraphCard={handleCloseGraphCard}
						state={state}
						dispatch={dispatch}
						graphView={true}
						collection={collections[selectedItem.id]}
					/>
				);
			case 'Document':
				return (
					<Card
						item={selectedItem}
						closeGraphCard={handleCloseGraphCard}
						state={state}
						dispatch={dispatch}
						graphView={true}
					/>
				);
			case 'Entity':
				if (!graphCardData.done) {
					getEntityCardData();
				} else {
					selectedItem.description = graphCardData.description;
				}
				return (
					<Card
						item={selectedItem}
						closeGraphCard={handleCloseGraphCard}
						state={state}
						dispatch={dispatch}
						graphView={true}
					/>
				)
			case 'Topic':
				if (!graphCardData.done) {
					getTopicCardData();
				} else {
					selectedItem.doc_count = graphCardData.doc_count;
					selectedItem.entities = graphCardData.entities;
				}
				return (
					<Card
						item={selectedItem}
						closeGraphCard={handleCloseGraphCard}
						state={state}
						dispatch={dispatch}
						graphView={true}
					/>
				)
			default:
				break;
		}
	}
	
	const getEntityCardData = () => {
		gameChangerAPI.getDescriptionFromWikipedia(selectedItem.name).then(resp => {
			const desc = resp.query?.pages[Object.keys(resp.query.pages)[0]]?.extract;
			if (selectedItem) {
				selectedItem.description = desc;
				selectedItem.done = true;
			}
			setGraphCardData({
				description: desc,
				done: true
			});
		});
	}
	
	const getTopicCardData = async () => {
		const docData = await gameChangerAPI.graphQueryPOST(
			`MATCH (n:Topic)-[:IS_IN]->(d:Document)
			WHERE n.name = $name
			WITH COUNT(d) as docs, collect(d.doc_id) as doc_ids
			return sum(docs) as doc_count, doc_ids;`, 'S484S8B', state.cloneData.clone_name, {params: {name: selectedItem.name}}
		);
		
		const { doc_count, doc_ids } = docData.data;
		
		const convertedIds = doc_ids.map(docId => {
			return docId.replace(/'/g, '');
		});
		
		const entityData = await gameChangerAPI.graphQueryPOST(`
			MATCH (d:Document)-[m:MENTIONS]->(e:Entity)
			WHERE d.doc_id in $ids AND EXISTS(e.aliases)
			WITH e
			MATCH (e)<-[:MENTIONS]-(d:Document)
			WHERE d.doc_id in $ids
			RETURN e as node, count(d) as entityScore, count(e) as mentions
			ORDER BY mentions DESC LIMIT 10;
		`, 'NTDC5KE', state.cloneData.clone_name, {params: {ids: convertedIds}});
		
		const entities = entityData.data.nodes || [];
		entities.forEach(entity => {
			const aliases = entity.aliases ? entity.aliases.split(';') : [];
			aliases.sort((a, b) => a.length - b.length)
			entity.aliase = aliases[0];
		});
		if (selectedItem) {
			selectedItem.entities = entities;
			selectedItem.doc_count = doc_count;
			selectedItem.done = true;
		}
		setGraphCardData({
			entities,
			doc_count,
			done: true
		});
	}
	
	const showChildDocuments = () => {
		
		const node = graph.nodes.filter(node => {
			return node.id === selectedID;
		})[0];
		
		if (node.label === 'Publication') {
			const { filteredGraph } = hideShowChildren(node);
			
			node.showingChildren = !node.showingChildren;

			// Count num of nodes visible
			lockNodeInPlace(node, true);
			setFilteredGraph(filteredGraph);
			doRunSimulation();
		}
	}
	
	const handleBackgroundClick = (event) => {
		// Close any open context menu
		setContextOpen(false);
		setSelectedID(-1);
	}
	
	const showEntitiesForNode = () => {
		
		const node = graph.nodes.filter(node => {
			return node.id === selectedID;
		})[0];
		
		if (node.showingEntities) {
			
			const entityIDs = [];
			const edgesToRemove = [];
			graph.edges.forEach(edge => {
				if (edge.label === 'MENTIONS' && edge.notInOriginalSearch) {
					entityIDs.push(edge.target.id);
					edgesToRemove.push(edge.id);
				}
			});
			
			graph.edges = graph.edges.filter(edge => {
				return !edgesToRemove.includes(edge.id);
			});
			
			graph.nodes = graph.nodes.filter(node => {
				return !entityIDs.includes(node.id);
			});
			
			lockNodeInPlace(node, false);
			reloadAndRunSimulation();
			
			node.showingEntities = false;
			return;
		}
		
		gameChangerAPI.graphQueryPOST(
			'MATCH (d:Document)-[m:MENTIONS]->(e:Entity) ' +
			'WHERE d.doc_id = $doc_id AND size(m.pars) > 5 ' +
			'RETURN d, m, e;', 'I1JJI2D', state.cloneData.clone_name, {params: {doc_id: node.doc_id}}
		).then((data) => {
			const graphData = data.data;
			const nodeIds = graph.nodes.map(node => {
				return node.id;
			});
			const parentId = node.id;
			graphData.nodes.forEach(tmpNode => {
				if (tmpNode.label === 'Document') {
					tmpNode.id = parentId;
				} else {
					tmpNode.id = 200000 + tmpNode.id;
				}
				if (!nodeIds.includes(tmpNode.id)) {
				 	graph.nodes.push(tmpNode);
				 	nodeIds.push(tmpNode.id);
				}
			});
			graphData.edges.forEach(edge => {
				edge.source = parentId;
				edge.target = 200000 + edge.target;
				edge.notInOriginalSearch = true;
				graph.edges.push(edge);
			});
			
			lockNodeInPlace(node, true);
			reloadAndRunSimulation();
			
			node.showingEntities = true;
		});
	}
	
	const showReferencesForNode = () => {
		
		const node = graph.nodes.filter(node => {
			return node.id === selectedID;
		})[0];
		
		if (node.showingReferences) {
			
			const edgesToRemove = [];
			graph.edges.forEach(edge => {
				if (edge.label === 'REFERENCES' && edge.notInOriginalSearch) {
					edgesToRemove.push(edge.id);
				}
			});

			graph.edges = graph.edges.filter(edge => {
				return !edgesToRemove.includes(edge.id);
			});
			
			graph.nodes = graph.nodes.filter(node => {
				return !node.notInOriginalSearch;
			});
			
			reloadAndRunSimulation();
			
			node.showingReferences = false;
			return;
		}

		let pubName = '';
		if (node.label === 'Document') {
			if (node.doc_num !== '' && node.doc_type !== '') {
				pubName = `${node.doc_type} ${node.doc_num}`;
			} else {
				pubName = node.doc_id.split(',')[0].replace('.pdf_0', '');
			}
			
		} else if (node.label === 'Publication') {
			pubName = node.name;
		}
		
		gameChangerAPI.graphQueryPOST(`MATCH ref = (p:Publication)-[:REFERENCES]->(p2:Publication)
				WHERE p.name = $pub_name AND EXISTS(p2.doc_type) AND NOT p = p2
				RETURN ref;`, 'RX1V6Q8', state.cloneData.clone_name, {params: {pub_name: pubName}}).then((data) => {
			const graphData = data.data;
			const nodeIds = graph.nodes.map(node => {
				return node.id;
			});
			const edgeIds = graph.edges.map(edge => {
				return edge.id;
			});
			graphData.nodes.forEach(node => {
				if (!nodeIds.includes(node.id)) {
					node.notInOriginalSearch = true;
				 	graph.nodes.push(node);
				 	nodeIds.push(node.id);
				}
			});
			graphData.edges.forEach(edge => {
				if (!edgeIds.includes(edge.id)) {
					edge.notInOriginalSearch = true;
					graph.edges.push(edge);
				}
			});
			
			reloadAndRunSimulation();
			
			node.showingReferences = true;
		});
	}
	
	const showTopicsForNode = () => {
		
		const node = graph.nodes.filter(node => {
			return node.id === selectedID;
		})[0];
		
		if (node.showingTopics) {
			
			const edgesToRemove = [];
			const entityIDs = [];
			graph.edges.forEach(edge => {
				if (edge.label === 'CONTAINS' && edge.notInOriginalSearch) {
					entityIDs.push(edge.target.id);
					edgesToRemove.push(edge.id);
				}
			});

			graph.edges = graph.edges.filter(edge => {
				return !edgesToRemove.includes(edge.id);
			});
			
			graph.nodes = graph.nodes.filter(node => {
				return !entityIDs.includes(node.id);
			});
			
			lockNodeInPlace(node, false);
			reloadAndRunSimulation();
			
			node.showingTopics = false;
			return;
		}
		
		gameChangerAPI.graphQueryPOST(
			'MATCH mt = (d:Document)-[c:CONTAINS]->(:Topic) ' +
			'WHERE d.doc_id = $doc_id RETURN mt;', '5YPYYUX', state.cloneData.clone_name, {params: {doc_id: node.doc_id}}
		).then((data) => {
			const graphData = data.data;
			const nodeIds = graph.nodes.map(node => {
				return node.id;
			});
			const parentId = node.id;
			graphData.nodes.forEach(tmpNode => {
				if (tmpNode.label === 'Document') {
					tmpNode.id = parentId;
				} else {
					tmpNode.id = 200000 + tmpNode.id;
				}
				if (!nodeIds.includes(tmpNode.id)) {
				 	graph.nodes.push(tmpNode);
				 	nodeIds.push(tmpNode.id);
				}
			});
			graphData.edges.forEach(edge => {
				edge.source = parentId;
				edge.target = 200000 + edge.target;
				edge.notInOriginalSearch = true;
				graph.edges.push(edge);
			});
			
			lockNodeInPlace(node, true);
			reloadAndRunSimulation();
			
			node.showingTopics = true;
		});
	}
	
	const hideNode = () => {
		const node = graph.nodes.filter(node => {
			return node.id === selectedID;
		})[0];
		
		node.hidden = true;
		
		setShouldRender(true);
		setReloadGraph(!reloadGraph);
	}
	
	const lockNodeInPlace = (node, lock) => {
		
		if (!node) {
			node = graph.nodes.filter(node => {
				return node.id === selectedID;
			})[0];
		}
		
		if (lock) {
			node.fx = node.x;
			node.fy = node.y;
			node.fz = node.z;
		} else {
			node.fx = null;
			node.fy = null;
			node.fz = null;
		}
	}
	
	const hideShowChildren = (node) => {
		
    	const filteredNodes = filteredGraph.nodes;
		const filteredEdges = filteredGraph.edges;
		
    	// Select or De-Select Collection
		if (node.showingChildren) {
			// Collapse the child nodes
			removeChildren(node.id, filteredNodes, filteredEdges);
			countDocTypes(filteredNodes);
			return {
				filteredGraph: {nodes: filteredNodes, edges: filteredEdges}
			};
		}

		// Expand child nodes
		expandChildren(node.id, filteredNodes, filteredEdges);
		countDocTypes(filteredNodes);

		return{
			filteredGraph: {nodes: filteredNodes, edges: filteredEdges}
		};
	}
	
	const countDocTypes = (nodes) => {

		_.forEach(_.keys(docOrgNumbers), key => {
			docOrgNumbers[key] = 0;
		});

		_.forEach(nodes, (node) => {
			if (docOrgNumbers.hasOwnProperty(node.orgType)) {
				docOrgNumbers[node.orgType] += 1;
			} else {
				docOrgNumbers[node.orgType] = 1;
			}
		});

		return docOrgNumbers;
	}
	
	const expandChildren = (nodeID, filteredNodes, filteredEdges) => {

		const nodeIdsToAdd = [];
		const collectDocIds = collections[nodeID].map(doc => {
			return doc.id;
		})
		
		graph.nodes.forEach(tmpNode => {
			if (collectDocIds.includes(tmpNode.id)){
				filteredNodes.push(tmpNode);
				nodeIdsToAdd.push(tmpNode.id);
			}
		});
		
		// Expand child edges
		graph.edges.forEach((edge) => {
			const sourceHasNode = edge.source.hasOwnProperty('id');
			const targetHasNode = edge.target.hasOwnProperty('id');
			const sourceID = sourceHasNode ? edge.source.id : edge.source;
			const targetID = targetHasNode ? edge.target.id : edge.target;
			if(nodeIdsToAdd.includes(sourceID)) {
				let source;
				let target;
				graph.nodes.forEach(node => {
					if (node.id === sourceID) {
						source = node;
					} else if (node.id === targetID) {
						target = node;
					}
				})
				
				if (target.hasOwnProperty('id') && source.hasOwnProperty('id')) {
					edge.source = source;
					edge.target = target;
					filteredEdges.push(edge);
				}
			}
		});
	};
	
	const highlightSelectedNodes = (node, filteredEdges) => {
		
		highlightNodes.clear();

		// Get nth degree relationships
		const alreadyVisitedNodes = [node];
		let newNodes = [node];
		for (let i = 0; i <= DEGREE_REL_TO_GET; i++) {
			degreeConnected[i] = [];
			const tmpNewNodes = [];
			_.forEach(newNodes, (tmpNode) => {
				_.forEach(filteredEdges, (edge) => {
					if (edge.source === tmpNode) {
						if (!_.includes(alreadyVisitedNodes, edge.target) && !_.includes(tmpNewNodes, edge.target)) {
							tmpNewNodes.push(edge.target);
							alreadyVisitedNodes.push(edge.target);
							highlightNodes.add(edge.target);
							degreeConnected[i].push(edge.target)
						}
					} else if (edge.target === tmpNode) {
						if (!_.includes(alreadyVisitedNodes, edge.source) && !_.includes(tmpNewNodes, edge.source)) {
							tmpNewNodes.push(edge.source);
							alreadyVisitedNodes.push(edge.source);
							highlightNodes.add(edge.source);
							degreeConnected[i].push(edge.source);
						}
					}
				});
			});
			newNodes = tmpNewNodes;
		}
	}
	
	const updateNodeSize = (size) => {
		setNodeRelSize(size);
	}
	
	const resetGraph = () => {
		
		// Remove Remove visible child documents and unlock any locked nodes
		graph.nodes.forEach(node => {
			if (node.label === 'Publication') {
				node.showingChildren = false;
			}
			node.fx = null;
			node.fy = null;
			node.fz = null;
		})
		
		setShouldRender(true);
		setReloadGraph(true);
		setRunSimulation(!runSimulation);
	}
	
	const handleSetCommunityView = (show) => {
		setCommunityView(show);
	}

	const resultsText = runningSearch ? 'Running search...' : noSearches ? 'Make a search to see the graph network' : `${numberWithCommas(documentsFound)} document nodes and ${numberWithCommas(filteredGraph.edges.length)} edges returned in ${timeFound} seconds`;
	
	return (
		<div style={{...styles.graphContainer, height: '100%'}}>
			<div style={styles.resultsText}>
				{resultsText}
			</div>
			{show2DView &&
				<MemoizedNodeCluster2D renderContextMenu={showNodeContextMenu} runningQuery={runningSearch} cloneData={state.cloneData}
					graph={filteredGraph} graphRefProp={graph2DRef} createGraphNode={create2dGraphNode}
					onGetLinkColor={handleGetLinkColor} onNodeHover={handleNodeHover} renderNodeLegendItems={renderNodeLegendItems}
					onNodeClick={handleNodeClick} onBackgroundClick={handleBackgroundClick}
					runSimulation={shouldRender} zoomLimit={ZOOM_LIMIT} updateNodeSize={updateNodeSize}
					contextMenuOpen={contextOpen} createNodeLabel={createNodeLabel} reloadGraphProp={reloadGraph}
					resetGraph={() => resetGraph()} runSimulationProp={runSimulation} runningSearch={runningSearch}
					nodeRelativeSizeProp={nodeRelSize} graphWidth={width} graphHeight={height} nodeHoverIDProp={nodeHoverID}
					shouldCenterProp={shouldCenter} handleSetCommunityView={handleSetCommunityView} showCommunities={communityView}
				/>
			}
			{showGraphCard && <div style={styles.graphCard}>
				{displayGraphCard()}
			</div>}
			{(graphData.nodes.length === 0 && !runningSearch) && (
				<div style={styles.centeredContent}>
					<div style={styles.noResultsMessage}>{NO_RESULTS_MESSAGE}</div>
				</div>
			)}
		</div>
	);
}

NodeClusterView.propTypes = {
	noSearches: PropTypes.bool,
	graphData: PropTypes.shape({
		nodes: PropTypes.array,
		edges: PropTypes.array,
		timeFound: PropTypes.number
	}),
	runningSearch: PropTypes.bool,
	notificationCountProp: PropTypes.number,
	expansionTerms: PropTypes.array,
	state: PropTypes.shape({
		showSideFilters: PropTypes.bool.isRequired,
		cloneData: PropTypes.object,
		searchText: PropTypes.string
	}),
	dispatch: PropTypes.func
}

export default NodeClusterView