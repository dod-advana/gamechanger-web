import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { ForceGraph2D } from 'react-force-graph';
import { backgroundWhite, gcOrange } from '../common/gc-colors';
import React, { useEffect, useRef } from 'react';
import {
	calcLinkControlPoints,
	draw2DArrows,
	EDGE_PATTERNS,
	getLines,
	getNodeColors,
	getNodeOutlineColors,
	getTextColorBasedOnBackground,
	shuffleArray,
} from '../../utils/graphUtils';
import { convertHexToRgbA, getLinkColor, getTrackingNameForFactory } from '../../utils/gamechangerUtils';
import styled from 'styled-components';
import { FormControl, Input, InputLabel, Popper, SvgIcon } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import GCTooltip from '../common/GCToolTip';
import { trackEvent } from '../telemetry/Matomo';
import UOTToggleSwitch from '../common/GCToggleSwitch';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

const NODE_ALPHA = 1;
const HIDDEN_NODE_ALPHA = 0.08;
const LINK_ALPHA = 0.5;
const DEGREE_REL_TO_GET = 1;
export const ZOOM_LIMIT = 8;
const ARROW_LENGTH = 3;
const ARROW_REL_POS = 1;

const edgePatterns = [[], ...shuffleArray(EDGE_PATTERNS)];

const styles = {
	loading: {
		position: 'fixed',
		zIndex: '99',
		left: '50%',
		top: '50%',
		transform: 'translate(50%, -30%)',
	},
	legendKey: {
		margin: '8px',
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		display: 'inline-block',
		fontWeight: 500,
		border: '1px solid lightgray',
		borderRadius: '6px',
		zIndex: 1,
		position: 'absolute',
		overflowY: 'auto',
		maxHeight: '650px',
		minWidth: '240px',
		maxWidth: '25%',
		textAlign: 'left',
	},
	legendRow: {
		margin: '1em',
		display: 'flex',
		alignItems: 'center',
	},
	legendRowClickable: {
		margin: '1em',
		display: 'flex',
		alignItems: 'center',
		cursor: 'pointer',
	},
};

const CloseButton = styled.div`
	padding: 6px;
	background-color: white;
	border-radius: 5px;
	color: #8091a5 !important;
	border: 1px solid #b0b9be;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 0.4;
	position: absolute;
	right: 15px;
	top: 15px;
`;

const StyledMenu = styled.nav`
	display: flex;
	flex-direction: column;
	justify-content: center;
	background: rgba(255, 255, 255, 0.9);
	opacity: ${({ open }) => (open ? '1' : '0')};
	visibility: ${({ open }) => (open ? 'visible' : 'hidden')};
	text-align: left;
	padding: 2rem;
	position: absolute;
	right: 5%;
	margin-top: 5px;
	transition: opacity 0.3s ease-in-out;
	z-index: 98;

	@media (max-width: 576px) {
		width: 100rem;
	}

	Input {
		width: 140px;
	}

	i {
		font-size: 1.5rem;
		text-transform: uppercase;
		padding: 2rem 0;
		font-weight: bold;
		color: #0d0c1d;
		text-decoration: none;

		@media (max-width: 576px) {
			font-size: 1.5rem;
			text-align: left;
		}
	}

	.settings-item {
		margin: 5px 0;
	}

	.form-item-width {
		min-width: 160px;
	}
`;

const StyledBurger = styled.button`
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	width: 2rem;
	height: 2rem;
	background: transparent;
	border: none;
	cursor: pointer;
	padding: 0;
	z-index: 99;
	margin-top: 1px;

	&:focus {
		outline: none;
	}

	div {
		width: 2rem;
		height: 0.25rem;
		background: #0d0c1d;
		border-radius: 10px;
		transition: all 0.3s linear;
		position: relative;
		transform-origin: 1px;

		:first-child {
			transform: ${({ open }) => (open ? 'rotate(45deg)' : 'rotate(0)')};
		}

		:nth-child(2) {
			opacity: ${({ open }) => (open ? '0' : '1')};
			transform: ${({ open }) => (open ? 'translateX(20px)' : 'translateX(0)')};
		}

		:nth-child(3) {
			transform: ${({ open }) => (open ? 'rotate(-45deg)' : 'rotate(0)')};
		}
	}
`;

const StyledRefresh = styled.div`
	cursor: pointer;
	z-index: 1;
	margin-right: 15px;
	margin-top: -1px;
`;

export const StyledLegendClickable = styled.div`
	margin: 0 1em;
	display: flex;
	align-items: center;
	cursor: pointer;
	transition: opacity 0.3s ease-in-out;
	border-radius: 6px;
	padding: 5px;
	opacity: ${({ type, typesSelected }) => (typesSelected.length === 0 || typesSelected.includes(type) ? 1 : 0.2)};

	&:hover {
		background: rgba(222, 235, 255, 0.5);
		opacity: 1;
	}
`;

const StyledNodeGroupNode = styled.div`
	display: flex;
	align-items: center;
	cursor: pointer;
	transition: opacity 0.3s ease-in-out;
	border-radius: 6px;

	&:hover {
		background: rgba(222, 235, 255, 0.5);
		opacity: 1;
	}
`;

const EdgeLegendItem = (props) => {
	const { edgePattern, width, height } = props;

	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		const pattern = edgePattern.map((num) => {
			return num * 2;
		});

		ctx.strokeStyle = '#000000';
		ctx.beginPath();
		ctx.setLineDash(pattern || []);
		ctx.lineWidth = 1;
		ctx.moveTo(0, 5);
		ctx.lineTo(width, 5);
		ctx.stroke();
	}, [edgePattern, width, canvasRef]);

	return <canvas ref={canvasRef} width={width} height={height} />;
};

export default function GraphNodeCluster2D(props) {
	const {
		renderContextMenu = () => undefined,
		runningQuery = false,
		graph = { nodes: [], edges: [] },
		graphRefProp = null,
		createGraphNode = null,
		createGraphLink = null,
		onNodeHover = null,
		onNodeClick = null,
		onNodeDrag = null,
		onNodeDragEnd = null,
		onBackgroundClick = null,
		onSimulationStop = null,
		contextMenuOpen = false,
		createNodeLabel = null,
		onZoom = null,
		onGetLinkColor = null,
		zoomLimit = ZOOM_LIMIT,
		nodeRelativeSizeProp = 5.5,
		graphWidth = window.innerWidth * ((90 - 5) / 100),
		graphHeight = window.innerHeight * 0.75,
		loadingIndicatorColor = '#E9691D',
		nodeAlpha = NODE_ALPHA,
		hiddenNodeAlpha = HIDDEN_NODE_ALPHA,
		linkAlpha = LINK_ALPHA,
		arrowLength = ARROW_LENGTH,
		arrowRelativePosition = ARROW_REL_POS,
		displayLinkLabel = false,
		nodeHoverIDProp = null,
		updateNodeSize = null,
		reloadGraphProp = false,
		runSimulationProp = false,
		renderNodeLegendItems = null,
		renderEdgeLegendItems = null,
		style = {},
		resetGraph = null,
		runningSearch = false,
		shouldCenterProp = true,
		hierarchyView = false,
		shouldHighlightNodes = true,
		shouldShowLegend = true,
		showBasic = false,
		showSettingsMenu = true,
		cloneData,
		zoom = 1,
		nodeGroupMenuOpenProp = undefined,
		nodeGroupMenuTargetProp = undefined,
		nodeGroupMenuLabelProp = undefined,
		setNodeGroupMenuLabelProp = () => undefined,
		closeGroupNodeMenu = undefined,
		orgTypesSelected = [],
		nodePointerAreaPaint,
	} = props;

	const graphRef = useRef();

	const [shouldRunSimulation, setShouldRunSimulation] = React.useState(true);
	const [highlightNodes, setHighlightNodes] = React.useState(new Set());
	const [degreeConnected, setDegreeConnected] = React.useState({
		0: [],
		1: [],
		2: [],
	});
	const [selectedNodeID, setSelectedNodeID] = React.useState(null);
	const [nodeHoverID, setNodeHoverID] = React.useState(null);

	const [settingsOpen, setSettingsOpen] = React.useState(false);
	const [reloadGraph, setReloadGraph] = React.useState(false);
	const [graphRendered1stTime, setGraphRendered1stTime] = React.useState(false);

	const [edgeThickness, setEdgeThickness] = React.useState(2);
	const [chargeStrength, setChargeStrength] = React.useState(-50);
	const [linkDistance, setLinkDistance] = React.useState(30);
	const [linkIterations, setLinkIterations] = React.useState(1);
	const [nodeRelativeSize, setNodeRelativeSize] = React.useState(1);
	const [zoomFactor, setZoomFactor] = React.useState(0.5);
	const [nodeLabelColors, setNodeLabelColors] = React.useState({});
	const [nodeLabelSelected, setNodeLabelSelected] = React.useState(null);
	const [edgeLabelPatterns, setEdgeLabelPatterns] = React.useState({});
	const [edgeLabels, setEdgeLabels] = React.useState({});

	const [legendData, setLegendData] = React.useState({});
	const [shouldCenter, setShouldCenter] = React.useState(true);
	const [nodeGroupMenuTarget, setNodeGroupMenuTarget] = React.useState(null);
	const [nodeGroupMenuLabel, setNodeGroupMenuLabel] = React.useState('');
	const [nodeGroupMenuOpen, setNodeGroupMenuOpen] = React.useState(false);

	const [dagMode, setDagMode] = React.useState(false);

	const [resetGraphClicked, setResetGraphClicked] = React.useState(false);

	const legendRef = React.useRef();

	const { nodes, edges } = graph;
	const graphData = { nodes, links: edges };

	useEffect(() => {
		setHighlightNodes(new Set());
		setDegreeConnected({ 0: [], 1: [], 2: [] });
		setEdgeLabels({});
	}, []);

	useEffect(() => {
		const newLegendData = {};
		const newEdgeLabels = {};
		if (graph.labels) {
			const newNodeLabelColors = {};
			graph.labels.forEach((label) => {
				newNodeLabelColors[label] = { color: '', textColor: '' };
				const count = graph.nodes.filter((node) => {
					return node.label === label;
				}).length;
				newLegendData[label] = { name: label, count: count };
			});

			setNodeLabelColors(newNodeLabelColors);
			setLegendData(newLegendData);
		}

		if (graph.edges) {
			graph.edges.forEach((edge) => {
				if (!Object.keys(newEdgeLabels).includes(edge.label)) {
					newEdgeLabels[edge.label] = 1;
				} else {
					newEdgeLabels[edge.label] += 1;
				}
			});

			const tmpEdgeLabelPatterns = {};
			Object.keys(newEdgeLabels).forEach((label, idx) => {
				tmpEdgeLabelPatterns[label] = {
					label: label,
					pattern: edgePatterns[idx] || [],
				};
			});
			setEdgeLabels(newEdgeLabels);
			setEdgeLabelPatterns(tmpEdgeLabelPatterns);
		}
	}, [graph]);

	useEffect(() => {
		setShouldRunSimulation(runSimulationProp);
	}, [runSimulationProp]);

	useEffect(() => {
		setNodeHoverID(nodeHoverIDProp);
		setNodeRelativeSize(nodeRelativeSizeProp);
	}, [nodeHoverIDProp, nodeRelativeSizeProp]);

	useEffect(() => {
		setShouldRunSimulation(true);
	}, [runningSearch]);

	useEffect(() => {
		setDagMode(hierarchyView);
	}, [hierarchyView]);

	useEffect(() => {
		setShouldCenter(shouldCenterProp);
	}, [shouldCenterProp]);

	useEffect(() => {
		setReloadGraph(reloadGraphProp);
		setShouldRunSimulation(true);
		setGraphRendered1stTime(false);
	}, [reloadGraphProp, runSimulationProp]);

	/**
	 * Graph Interactions
	 */

	const handleNodeHover = onNodeHover
		? onNodeHover
		: (node) => {
				const elem = document.getElementById('graph2dContainer');
				elem.style.cursor = node ? 'pointer' : null;
				setNodeHoverID(node ? node.id : -1);

				if (node && shouldHighlightNodes) {
					highlightSelectedNodes(node, graph.edges);
				} else {
					highlightNodes.clear();
				}
		  };

	const processEdgesForHighlight = (selectedEdges, tmpNode, alreadyVisitedNodes, tmpNewNodes, index) => {
		selectedEdges.forEach((edge) => {
			if (edge.source === tmpNode) {
				if (!alreadyVisitedNodes.includes(edge.target) && !tmpNewNodes.includes(edge.target)) {
					tmpNewNodes.push(edge.target);
					alreadyVisitedNodes.push(edge.target);
					highlightNodes.add(edge.target);
					degreeConnected[index].push(edge.target);
				}
			} else if (edge.target === tmpNode) {
				if (!alreadyVisitedNodes.includes(edge.source) && !tmpNewNodes.includes(edge.source)) {
					tmpNewNodes.push(edge.source);
					alreadyVisitedNodes.push(edge.source);
					highlightNodes.add(edge.source);
					degreeConnected[index].push(edge.source);
				}
			}
		});
	};

	const highlightSelectedNodes = (node, selectedEdges) => {
		highlightNodes.clear();

		// Get nth degree relationships
		const alreadyVisitedNodes = [node];
		let newNodes = [node];
		for (let i = 0; i <= DEGREE_REL_TO_GET; i++) {
			degreeConnected[i] = [];
			const tmpNewNodes = [];
			newNodes.forEach((tmpNode) => {
				processEdgesForHighlight(selectedEdges, tmpNode, alreadyVisitedNodes, tmpNewNodes, i);
			});
			newNodes = tmpNewNodes;
		}
	};

	const handleNodeClick = onNodeClick
		? onNodeClick
		: async (node, _event) => {
				trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'GraphNode', 'onClick', node.name);
				if (selectedNodeID !== node.id) {
					setSelectedNodeID(node.id);
				} else {
					setSelectedNodeID(null);
				}
		  };

	const handleNodeDrag = onNodeDrag
		? onNodeDrag
		: (_node, _translate) => {
				setShouldRunSimulation(true);
		  };

	const handleNodeDragEnd = onNodeDragEnd
		? onNodeDragEnd
		: (node, translate) => {
				setShouldRunSimulation(false);
				if (Math.max(Math.abs(translate.x), Math.abs(translate.y)) < 0.3) {
					// Node was not dragged far enough, treat as click event
					handleNodeClick(node);
				}
		  };

	const handleBackgroundClick = onBackgroundClick
		? onBackgroundClick
		: (_event) => {
				setSelectedNodeID(-1);
		  };

	const handleOnZoom = onZoom
		? onZoom
		: (event) => {
				if (event.k > zoomLimit) {
					const ref = graphRefProp ? graphRefProp : graphRef;
					ref.current.zoom(zoomLimit);
				}
		  };

	const zoomInOut = (zoomIn) => {
		const ref = graphRefProp ? graphRefProp : graphRef;
		const newZoom = zoom + (zoomIn ? 1 : -1) * Number(zoomFactor);
		if (newZoom > zoomLimit) {
			ref.current.zoom(zoomLimit);
		} else {
			ref.current.zoom(newZoom);
		}
	};

	const handleResetGraph = resetGraph
		? resetGraph
		: () => {
				graph.nodes.forEach((node) => {
					node.hidden = false;
				});

				setReloadGraph(!reloadGraph);
				setShouldRunSimulation(true);
		  };

	const recenterGraph = () => {
		if (shouldCenter) focusCameraOnGraph();
	};

	const focusCameraOnGraph = () => {
		const ref = graphRefProp ? graphRefProp : graphRef;

		if (ref.current) {
			const atLeastN = getNodesWithNEdges(4);

			ref.current.zoomToFit(500, 150, (node) => {
				return atLeastN.includes(node.id);
			});
		}
	};

	/**
	 * Graph Legend Functions
	 */

	const handleRenderNodeLegendItems = renderNodeLegendItems
		? renderNodeLegendItems
		: () => {
				return (
					<>
						{!runningQuery &&
							Object.keys(legendData)
								.sort()
								.map((key) => {
									return (
										<GCTooltip
											key={key}
											title={`${legendData[key].count} node${
												legendData[key].count > 1 ? 's' : ''
											} associated`}
											arrow
											enterDelay={30}
										>
											<StyledLegendClickable
												key={legendData[key].name}
												onClick={(event) => handleLegendNodeClick(key, event.target)}
												typesSelected={nodeLabelSelected ? [nodeLabelSelected] : []}
												type={key}
											>
												<div
													style={{
														backgroundColor: nodeLabelColors[key].color,
														width: '1em',
														height: '1em',
														borderRadius: '50%',
														marginTop: '4px',
													}}
												></div>
												<div style={{ marginLeft: '2em', width: '80%' }}>
													{legendData[key].name}
												</div>
											</StyledLegendClickable>
										</GCTooltip>
									);
								})}
					</>
				);
		  };

	const handleRenderEdgeLegendItems = renderEdgeLegendItems
		? renderEdgeLegendItems
		: () => {
				return (
					<>
						{!runningQuery &&
							Object.keys(edgeLabelPatterns).map((label) => {
								if (edgeLabels[label] > 0) {
									return (
										<div
											style={styles.legendRow}
											key={`${edgeLabelPatterns[label].label}-legend-item`}
										>
											<EdgeLegendItem
												edgePattern={edgeLabelPatterns[label].pattern}
												height={10}
												width={50}
											/>
											<div style={{ marginLeft: '1em' }}>{edgeLabelPatterns[label].label}</div>
										</div>
									);
								} else return <></>;
							})}
					</>
				);
		  };

	const handleRenderLegend = () => {
		return (
			<div ref={legendRef} style={{ ...styles.legendKey, maxHeight: `calc(${graphHeight}px - 15px)` }}>
				<div style={styles.legendRow} key="legendKeys">
					<div style={{ fontWeight: 'bold' }}>Icon</div>
					<div style={{ fontWeight: 'bold', marginLeft: '1em', width: '80%' }}>Label</div>
				</div>

				{handleRenderNodeLegendItems()}

				<div
					style={{
						borderBottom: '1px solid black',
						width: '80%',
						marginLeft: '10%',
						marginTop: '1em',
					}}
				/>

				<div style={styles.legendRow} key="selectedNode">
					<div
						style={{
							backgroundColor: 'white',
							width: '1em',
							height: '1em',
							borderRadius: '50%',
							border: '3px solid #6ac6ff',
							marginLeft: '6px',
						}}
					/>
					<div style={{ marginLeft: '2em' }}>Selected</div>
				</div>

				<div style={styles.legendRow} key="neighbors1">
					<div
						style={{
							backgroundColor: 'white',
							width: '1em',
							height: '1em',
							borderRadius: '50%',
							border: '3px solid #ffe89c',
							marginLeft: '6px',
						}}
					/>
					<div style={{ marginLeft: '2em' }}>1 Degree Away</div>
				</div>
				<div style={styles.legendRow} key="neighbors2">
					<div
						style={{
							backgroundColor: 'white',
							width: '1em',
							height: '1em',
							borderRadius: '50%',
							border: '3px solid #ff9c50',
							marginLeft: '6px',
						}}
					/>
					<div style={{ marginLeft: '2em' }}>2 Degrees Away</div>
				</div>

				{handleRenderEdgeLegendItems()}
			</div>
		);
	};

	const handleLegendNodeClick = (label, target) => {
		trackEvent(
			getTrackingNameForFactory(cloneData.clone_name),
			'GraphLegendOnClick',
			label,
			label !== nodeLabelSelected
		);
		setNodeLabelSelected(label === nodeLabelSelected ? null : label);
		if (nodeGroupMenuOpen) {
			setNodeGroupMenuOpen(false);
			setNodeGroupMenuTarget(null);
			setNodeGroupMenuLabel('');
		} else {
			setNodeGroupMenuOpen(true);
			setNodeGroupMenuTarget(target);
			setNodeGroupMenuLabel(label);
		}
	};

	const ACTIVE_TAB_COLOR = 'rgb(68,111,145)';

	const legendStyles = {
		container: {
			display: 'flex',
			alignItems: 'center',
			height: '100%',
		},
		left: {
			width: 440,
			padding: '0 10px',
			height: '100%',
			display: 'flex',
			alignItems: 'center',
		},
		tabsContainer: {
			height: '100%',
			width: '100%',

			display: 'flex',
			alignItems: 'center',
			justifyContent: 'flex-start',
		},
		activeTab: {
			borderBottom: `4px solid ${ACTIVE_TAB_COLOR}`,
			color: ACTIVE_TAB_COLOR,
		},
		tab: {
			cursor: 'pointer',
			borderBottom: '4px solid transparent',
			fontWeight: '500',
			fontSize: 15,
			textTransform: 'capitalize',
			margin: '0px 5px',
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			minWidth: 62,
			textOverflow: 'ellipsis',
		},
	};

	// construct 2d array from a 1d array of filters to match structure of filter tab table
	const make2dArray = (filters) => {
		const TABS_PER_ROW = 4;
		const array2d = [];
		let row = [];

		filters.forEach((type) => {
			if (row.length < TABS_PER_ROW) {
				row.push(type);
			} else {
				array2d.push(row);
				row = [type];
			}
		});

		if (row.length > 0) array2d.push(row);

		return array2d;
	};

	const setActiveTab = (tab) => {
		setNodeGroupMenuLabelProp(tab);
	};

	const renderFilterTabs = (filterTab2dArray, activeFilterTab) => {
		return filterTab2dArray.map((row) => (
			<div style={legendStyles.tabsContainer}>
				{row.map((tab) => (
					<GCTooltip title={tab} enterDelay={30}>
						<Typography
							key={tab}
							style={
								activeFilterTab === tab
									? { ...legendStyles.tab, ...legendStyles.activeTab }
									: { ...legendStyles.tab }
							}
							variant="body1"
							onClick={() => setActiveTab(tab)}
						>
							{tab}
						</Typography>
					</GCTooltip>
				))}
			</div>
		));
	};

	const renderNodesList = (nodesInGroup) => {
		return nodesInGroup.map((node) => {
			let isTopicOrEntityNode = node.label === 'Topic' || node.label === 'Entity';
			return (
				<GCTooltip
					title={isTopicOrEntityNode || node.label === 'UKN_Document' ? '' : node.display_title_s}
					arrow
					style={{ zIndex: 99999 }}
				>
					<StyledNodeGroupNode
						onClick={() => {
							handleNodeClick(node, null);
							handleCloseGroupNodeMenu();
						}}
						onMouseEnter={() => {
							const ref = graphRefProp ? graphRefProp : graphRef;
							ref.current.centerAt(node.x, node.y, 500);
							handleNodeHover(node);
						}}
						onMouseLeave={() => {
							handleNodeHover(null);
						}}
					>
						{isTopicOrEntityNode ? node.name : `${node.doc_type} ${node.doc_num}`}
					</StyledNodeGroupNode>
				</GCTooltip>
			);
		});
	};

	const renderNodeGroupMenu = () => {
		const activeFilterTab =
			nodeGroupMenuLabel ||
			nodeGroupMenuLabelProp ||
			(orgTypesSelected.length > 0 ? orgTypesSelected[0] : undefined);
		const filterTab2dArray = make2dArray(orgTypesSelected);
		const nodesInGroup = graphData.nodes.filter((node) => {
			if (activeFilterTab === 'All Documents') {
				return node.label === 'Document' || node.label === 'UKN_Document';
			}
			return node.display_org_s ? node.display_org_s === activeFilterTab : node.label === activeFilterTab;
		});

		return (
			<Popper
				onClose={() => handleCloseGroupNodeMenu()}
				id={'graph-legend-node-group'}
				open={nodeGroupMenuOpenProp || nodeGroupMenuOpen}
				anchorEl={legendRef.current || nodeGroupMenuTargetProp || nodeGroupMenuTarget}
				placement={'right-start'}
				modifiers={{ offset: { offset: '0, 10' } }}
				style={{ zIndex: 1000 }}
			>
				<div
					style={{
						padding: '0px 0px 10px',
						border: '1px solid lightgray',
						borderRadius: '6px',
						backgroundColor: 'rgba(255, 255, 255, 0.9)',
					}}
				>
					<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
						<CloseButton onClick={() => handleCloseGroupNodeMenu()}>
							<CloseIcon fontSize="small" />
						</CloseButton>
					</div>
					<div style={{ width: 290 }}>
						<div style={{ margin: '16px 0px 0px' }}>
							<span style={{ fontWeight: 'bold', marginLeft: 10 }}>Nodes in Group</span>
							<div
								style={{
									margin: '14px 0px',
									borderBottom: '1px solid lightgray',
									borderTop: '1px solid lightgray',
								}}
							>
								{renderFilterTabs(filterTab2dArray, activeFilterTab)}
							</div>
							<div
								style={{
									marginTop: 2,
									marginRight: 10,
									marginLeft: 10,
									maxHeight: 400,
									overflow: 'auto',
								}}
							>
								{renderNodesList(nodesInGroup)}
							</div>
						</div>
					</div>
				</div>
			</Popper>
		);
	};

	const handleCloseGroupNodeMenu = closeGroupNodeMenu
		? closeGroupNodeMenu
		: () => {
				setNodeGroupMenuOpen(false);
				setNodeGroupMenuTarget(null);
				setNodeGroupMenuLabel('');
		  };

	/**
	 * Graph Functions
	 */

	const handleCreateNodeLabel = createNodeLabel
		? createNodeLabel
		: (node) => {
				return node.name;
		  };

	const drawNode = (ctx, node, nodeColor, outlineColor, outlineThickness, nodeTextColor, globalScale) => {
		ctx.beginPath();

		ctx.fillStyle = nodeColor;
		ctx.arc(node.x, node.y, node.value * nodeRelativeSize, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.strokeStyle = outlineColor;
		ctx.lineWidth = outlineThickness / globalScale;
		ctx.arc(node.x, node.y, node.value * nodeRelativeSize, 0, 2 * Math.PI, false);
		ctx.stroke();

		// Selected/Hovered Outline
		if (node.id === selectedNodeID || node.id === nodeHoverID) {
			ctx.strokeStyle = convertHexToRgbA('#6ac6ff', nodeAlpha);
			ctx.lineWidth = (outlineThickness + 0.5) / globalScale;
			ctx.arc(node.x, node.y, node.value * nodeRelativeSize + 0.2, 0, 2 * Math.PI, false);
			ctx.stroke();
		}

		handleCreateNodeText(node, ctx, globalScale, nodeTextColor);
	};

	const handleCreateGraphNode = createGraphNode
		? createGraphNode
		: (node, ctx, globalScale) => {
				let outlineThickness = 3;
				let connectedLevel = -1;

				if (highlightNodes.size > 0 && highlightNodes.has(node)) {
					if (degreeConnected[0].includes(node)) {
						connectedLevel = 0;
					} else if (degreeConnected[1].includes(node)) {
						connectedLevel = 1;
					}
					outlineThickness += 2;
				}

				if (selectedNodeID === node.id) {
					outlineThickness += 2;
				}

				const { nodeColor, nodeHexColor, nodeTextColor } =
					nodeLabelSelected !== null && nodeLabelSelected !== node.label
						? getNodeColors(node, hiddenNodeAlpha, nodeLabelColors)
						: getNodeColors(node, nodeAlpha, nodeLabelColors);
				const outlineColor =
					nodeLabelSelected !== null && nodeLabelSelected !== node.label
						? getNodeOutlineColors(node, hiddenNodeAlpha, nodeHexColor, connectedLevel)
						: getNodeOutlineColors(node, nodeAlpha, nodeHexColor, connectedLevel);

				drawNode(ctx, node, nodeColor, outlineColor, outlineThickness, nodeTextColor, globalScale);
		  };

	const drawTextEvenLines = (ctx, line, lines, node, fontSize, i, mid) => {
		// Even so no middle
		if (i <= mid) {
			ctx.fillText(
				line,
				node.x,
				node.y - fontSize * Math.floor(mid - i) + (lines.lines.length > 1 ? fontSize / lines.lines.length : 0)
			);
		} else {
			ctx.fillText(
				line,
				node.x,
				node.y + fontSize * Math.floor(i - mid) + (lines.lines.length > 1 ? fontSize / lines.lines.length : 0)
			);
		}
	};

	const drawTextOddLines = (ctx, line, lines, node, fontSize, i, mid) => {
		// Odd So middle
		if (i < mid) {
			ctx.fillText(
				line,
				node.x,
				node.y - fontSize * Math.floor(mid - i) + (lines.lines.length > 1 ? fontSize / lines.lines.length : 0)
			);
		} else {
			ctx.fillText(
				line,
				node.x,
				node.y +
					fontSize * Math.floor(i + 1 - mid) +
					(lines.lines.length > 1 ? fontSize / lines.lines.length : 0)
			);
		}
	};

	const handleCreateNodeText = (node, ctx, globalScale, nodeTextColor) => {
		const label = handleCreateNodeLabel(node);
		const MAX_FONT_SIZE = (nodeRelativeSize / 5) * 1.5;

		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = nodeTextColor || getTextColorBasedOnBackground(node.color);

		if (label && globalScale > 3 / (nodeRelativeSize / 5)) {
			const lines = getLines(ctx, label, node.value * nodeRelativeSize);
			lines.lines.forEach(function (line, i) {
				const fontSize = Math.min(MAX_FONT_SIZE, (node.value * nodeRelativeSize + 1.5) / lines.lines.length);
				ctx.font = `${fontSize}px Sans-Serif`;

				const mid = lines.lines.length / 2;
				if (lines.lines.length % 2 === 0) {
					drawTextEvenLines(ctx, line, lines, node, fontSize, i, mid);
				} else {
					drawTextOddLines(ctx, line, lines, node, fontSize, i, mid);
				}
			});
		}
	};

	const drawLink = (ctx, link, lineWidth, start, end, globalScale) => {
		ctx.beginPath();
		ctx.setLineDash(edgeLabelPatterns[link.label]?.pattern || []);
		ctx.lineWidth = lineWidth / globalScale;
		ctx.moveTo(start.x, start.y);

		const controlPoints = link.__controlPoints;

		if (!controlPoints) {
			// Straight line
			let xEnd = end.x;
			let yEnd = end.y;
			if (xEnd < start.x) {
				ctx.lineTo(end.x + 10, end.y);
			} else {
				ctx.lineTo(end.x - 10, end.y);
			}
		} else {
			// Use quadratic curves for regular lines and bezier for loops
			ctx[controlPoints.length === 2 ? 'quadraticCurveTo' : 'bezierCurveTo'](...controlPoints, end.x, end.y);
		}
		ctx.stroke();
	};

	const handleCreateGraphLink = createGraphLink
		? createGraphLink
		: (link, ctx, globalScale) => {
				if (!showBasic) {
					calcLinkControlPoints(link);
				}

				const start = link.source;
				const end = link.target;
				let lineWidth = edgeThickness;

				if (highlightNodes.size > 0 && (highlightNodes.has(start) || highlightNodes.has(end))) {
					lineWidth += 1;
				}

				const color = handleGetLinkColor(link);

				ctx.strokeStyle = color;

				// ignore unbound links
				if (typeof start !== 'object' || typeof end !== 'object') return;

				ctx.save();

				drawLink(ctx, link, lineWidth, start, end, globalScale);

				if (globalScale >= 8) {
					// Draw Arrow
					draw2DArrows(
						link,
						ctx,
						globalScale,
						arrowLength,
						arrowRelativePosition,
						color,
						nodeRelativeSize + 5
					);
				} else if (globalScale > 5) {
					// Draw Arrow
					draw2DArrows(link, ctx, globalScale, arrowLength, arrowRelativePosition, color, nodeRelativeSize);
				}

				if (displayLinkLabel) {
					handleCreateGraphLinkText(link, ctx, globalScale);
				}

				ctx.restore();
		  };

	const handleCreateGraphLinkText = (link, ctx, _globalScale) => {
		const MAX_FONT_SIZE = 4;
		const LABEL_NODE_MARGIN = nodeRelativeSize * 1.5;

		const start = link.source;
		const end = link.target;

		// ignore unbound links
		if (typeof start !== 'object' || typeof end !== 'object') return;

		// calculate label positioning
		const textPos = Object.assign(
			...['x', 'y'].map((c) => ({
				[c]: start[c] + (end[c] - start[c]) / 2, // calc middle point
			}))
		);

		const relLink = { x: end.x - start.x, y: end.y - start.y };

		const maxTextLength = Math.sqrt(Math.pow(relLink.x, 2) + Math.pow(relLink.y, 2)) - LABEL_NODE_MARGIN * 2;

		let textAngle = Math.atan2(relLink.y, relLink.x);
		// maintain label vertical orientation for legibility
		if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
		if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

		const label = `${link.label}`;

		// estimate fontSize to fit in link length
		ctx.font = '1px Sans-Serif';
		const fontSize = Math.min(MAX_FONT_SIZE, maxTextLength / ctx.measureText(label).width);
		ctx.font = `${fontSize}px Sans-Serif`;
		const textWidth = ctx.measureText(label).width;
		const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.2); // some padding

		// draw text label (with background rect)
		ctx.save();
		if (link.__controlPoints?.length >= 2) {
			const x = (textPos.x + link.__controlPoints[0]) / 2;
			const y = (textPos.y + link.__controlPoints[1]) / 2;
			ctx.translate(x, y);
		} else {
			ctx.translate(textPos.x, textPos.y);
		}
		ctx.rotate(textAngle);

		ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
		ctx.fillRect(-bckgDimensions[0] / 2, -bckgDimensions[1] / 2, ...bckgDimensions);

		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = 'darkgrey';
		ctx.fillText(label, 0, 0);
		ctx.restore();
	};

	const handleGetLinkColor = onGetLinkColor
		? onGetLinkColor
		: (link) => {
				return getLinkColor(link, linkAlpha);
		  };

	const processGraphEdges = (centralNode) => {
		const newNodes = {};
		let count = 0;
		graph.edges.forEach((edge) => {
			const end = edge.target;
			const start = edge.source;

			if (newNodes.hasOwnProperty(end.id)) {
				newNodes[end.id] += 1;
			} else {
				newNodes[end.id] = 1;
			}

			if (newNodes.hasOwnProperty(start.id)) {
				newNodes[start.id] += 1;
			} else {
				newNodes[start.id] = 1;
			}

			if (newNodes[end.id] > count) {
				count = newNodes[end.id];
				centralNode = end;
			} else if (newNodes[start.id] > count) {
				count = newNodes[start.id];
				centralNode = start;
			} else if (!centralNode) {
				centralNode = end;
			}
		});
	};

	const handleSimulationStop = onSimulationStop
		? onSimulationStop
		: () => {
				if (graphData.nodes?.[0]?.x !== null) {
					setShouldRunSimulation(false);
				} else {
					setShouldRunSimulation(true);
				}

				if (!graphRendered1stTime) {
					recenterGraph();
					setGraphRendered1stTime(true);
				}

				if (!shouldCenter) setShouldCenter(true);

				let centralNode = null;

				graph.nodes.forEach((node) => {
					node.fx = null;
					node.fy = null;
					node.fz = null;
				});

				processGraphEdges(centralNode);

				if (centralNode) {
					centralNode.fx = centralNode?.x;
					centralNode.fy = centralNode?.y;
					centralNode.fz = centralNode?.z;
				}

				if (resetGraphClicked) {
					setReloadGraph(!reloadGraph);
					setShouldRunSimulation(!shouldRunSimulation);
					recenterGraph();
					setResetGraphClicked(false);
				}
		  };

	const handleUpdateNodeSize = (size) => {
		updateNodeSize(size);
		setNodeRelativeSize(size);
	};

	const processEdgesForN = (atLeastN, edgeCount, numEdges, edgeSource, edgeTarget) => {
		if (!atLeastN.includes(edgeSource)) {
			if (edgeCount[edgeSource]) {
				edgeCount[edgeSource] += 1;
				if (edgeCount[edgeSource] >= numEdges) {
					atLeastN.push(edgeSource);
				}
			} else {
				edgeCount[edgeSource] = 1;
			}
		}

		if (!atLeastN.includes(edgeTarget)) {
			if (edgeCount[edgeTarget]) {
				edgeCount[edgeTarget] += 1;
				if (edgeCount[edgeTarget] >= numEdges) {
					atLeastN.push(edgeTarget);
				}
			} else {
				edgeCount[edgeTarget] = 1;
			}
		}
	};

	const getNodesWithNEdges = (numEdges) => {
		const edgeCount = {};
		const atLeastN = [];

		graph.edges.forEach((edge) => {
			const edgeSource = edge.source.id ?? edge.source;
			const edgeTarget = edge.target.id ?? edge.target;

			processEdgesForN(atLeastN, edgeCount, numEdges, edgeSource, edgeTarget);
		});

		if (atLeastN.length <= 0) {
			atLeastN.push(
				...graph.nodes.map((node) => {
					return node.id;
				})
			);
		}

		return atLeastN;
	};

	/**
	 * Menu Funcions
	 */

	const settingsBurger = () => {
		return (
			<StyledBurger
				open={settingsOpen}
				onClick={() => {
					trackEvent(
						getTrackingNameForFactory(cloneData.clone_name),
						'GraphSettingsMenuOnClick',
						!settingsOpen ? 'open' : 'close'
					);
					setSettingsOpen(!settingsOpen);
				}}
			>
				<div />
				<div />
				<div />
			</StyledBurger>
		);
	};

	const settingsMenu = () => {
		return (
			<StyledMenu open={settingsOpen}>
				<div>
					<i>Hierarchy Settings</i>
					<form noValidate autoComplete="off">
						<div className={'settings-item'} style={styles.settingsMenuFormDiv}>
							<div>Hierarchy Mode</div>
							<UOTToggleSwitch
								id="dag-mode"
								rightActive={dagMode}
								leftLabel={'Off'}
								rightLabel={'On'}
								customColor={gcOrange}
								onClick={() => {
									trackEvent(
										getTrackingNameForFactory(cloneData.clone_name),
										'GraphSettingsMenu',
										'DAGMode',
										!dagMode ? 1 : 0
									);
									setDagMode(!dagMode);
									setShouldRunSimulation(true);
								}}
								leftLabelStyle={{ marginBottom: 0 }}
								rightLabelStyle={{ marginBottom: 0 }}
							/>
						</div>
					</form>
				</div>
				<div>
					<i>Zoom Settings</i>
					<form noValidate autoComplete="off">
						<div className={'settings-item'}>
							<FormControl className={'form-item-width'}>
								<InputLabel htmlFor="zoom-settings">Zoom Factor</InputLabel>
								<Input
									id="zoom-settings"
									value={zoomFactor}
									onChange={(event) => {
										trackEvent(
											getTrackingNameForFactory(cloneData.clone_name),
											'GraphSettingsMenu',
											'zoomFactor',
											event.target.value
										);
										setZoomFactor(event.target.value);
									}}
									onKeyPress={(e) => {
										e.key === 'Enter' && e.preventDefault();
									}}
								/>
							</FormControl>
						</div>
					</form>
				</div>
				<div>
					<i>Node Settings</i>
					<form noValidate autoComplete="off">
						<div className={'settings-item'}>
							<FormControl className={'form-item-width'}>
								<InputLabel htmlFor="node-size">Node Size</InputLabel>
								<Input
									id="node-size"
									value={nodeRelativeSize}
									onChange={(event) => {
										trackEvent(
											getTrackingNameForFactory(cloneData.clone_name),
											'GraphSettingsMenu',
											'NodeSize',
											Number(event.target.value)
										);
										handleUpdateNodeSize(Number(event.target.value));
										setShouldRunSimulation(true);
									}}
									onKeyPress={(e) => {
										e.key === 'Enter' && e.preventDefault();
									}}
								/>
							</FormControl>
						</div>
					</form>
				</div>
				<div>
					<i>Edge Settings</i>
					<form noValidate autoComplete="off">
						<div className={'settings-item'}>
							<FormControl className={'form-item-width'}>
								<InputLabel htmlFor="edge-thickness">Edge Thickness</InputLabel>
								<Input
									id="edge-thickness"
									value={edgeThickness}
									onChange={(event) => {
										trackEvent(
											getTrackingNameForFactory(cloneData.clone_name),
											'GraphSettingsMenu',
											'EdgeThickness',
											Number(event.target.value)
										);
										setEdgeThickness(Number(event.target.value));
										setShouldRunSimulation(true);
									}}
									onKeyPress={(e) => {
										e.key === 'Enter' && e.preventDefault();
									}}
								/>
							</FormControl>
						</div>
					</form>
				</div>
				<div>
					<i>Force Settings</i>
					<form noValidate autoComplete="off">
						<div className={'settings-item'}>
							<FormControl className={'form-item-width'}>
								<InputLabel htmlFor="charge-strength">Charge Strength</InputLabel>
								<Input
									id="charge-strength"
									value={chargeStrength * -1}
									onChange={(event) => {
										trackEvent(
											getTrackingNameForFactory(cloneData.clone_name),
											'GraphSettingsMenu',
											'ChargeStrength',
											Number(event.target.value)
										);
										setChargeStrength(Number(event.target.value) * -1);
										setShouldRunSimulation(true);
									}}
								/>
							</FormControl>
						</div>
						<div className={'settings-item'}>
							<FormControl className={'form-item-width'}>
								<InputLabel htmlFor="link-distance">Link Distance</InputLabel>
								<Input
									id="link-distance"
									value={linkDistance}
									onChange={(event) => {
										trackEvent(
											getTrackingNameForFactory(cloneData.clone_name),
											'GraphSettingsMenu',
											'LinkDistance',
											Number(event.target.value)
										);
										setLinkDistance(Number(event.target.value));
										setShouldRunSimulation(true);
									}}
								/>
							</FormControl>
						</div>
						<div className={'settings-item'}>
							<FormControl className={'form-item-width'}>
								<InputLabel htmlFor="link-iterations">Link Iterations</InputLabel>
								<Input
									id="link-iterations"
									value={linkIterations}
									onChange={(event) => {
										trackEvent(
											getTrackingNameForFactory(cloneData.clone_name),
											'GraphSettingsMenu',
											'LinkIterations',
											Number(event.target.value)
										);
										setLinkIterations(Number(event.target.value));
										setShouldRunSimulation(true);
									}}
								/>
							</FormControl>
						</div>
					</form>
				</div>
			</StyledMenu>
		);
	};

	/**
	 * Render Functions
	 */

	const renderNodeViewer = () => {
		const forceGraphRef = graphRefProp ? graphRefProp.current : graphRef.current;
		if (forceGraphRef) {
			forceGraphRef.d3Force('charge').strength(chargeStrength).distanceMin(20).distanceMax(700);
			forceGraphRef.d3Force('link').distance(linkDistance).iterations(linkIterations);
		}

		return (
			<ForceGraph2D
				ref={graphRefProp ? graphRefProp : graphRef}
				graphData={graphData}
				width={graphWidth}
				height={graphHeight}
				backgroundColor={backgroundWhite}
				nodeCanvasObject={handleCreateGraphNode}
				nodePointerAreaPaint={nodePointerAreaPaint}
				onNodeHover={handleNodeHover}
				linkCanvasObject={handleCreateGraphLink}
				linkPointerAreaPaint={() => undefined}
				cooldownTicks={shouldRunSimulation ? 60 : 0}
				onEngineStop={handleSimulationStop}
				// onEngineTick={handleSimulationTick}
				enableNodeDrag={!contextMenuOpen}
				onNodeClick={handleNodeClick}
				onNodeDrag={handleNodeDrag}
				onNodeDragEnd={handleNodeDragEnd}
				onBackgroundClick={handleBackgroundClick}
				enableZoomPanInteraction={!contextMenuOpen}
				nodeLabel={handleCreateNodeLabel}
				onZoom={handleOnZoom}
				dagMode={dagMode ? 'bu' : null}
				dagLevelDistance={20}
			/>
		);
	};

	return (
		<div id={'graph2dContainer'} style={{ ...style, textAlign: 'left', position: 'relative' }}>
			{showSettingsMenu && (
				<div
					style={{
						display: 'flex',
						position: 'absolute',
						width: graphWidth,
						justifyContent: 'flex-end',
						margin: '5px 0px 5px -10px',
					}}
				>
					<GCTooltip title="Zoom In" arrow>
						<StyledRefresh
							onClick={() => {
								trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'graphView', 'ZoomIn');
								zoomInOut(true);
							}}
						>
							<ZoomInIcon fontSize="inherit" style={{ fontSize: 26 }} />
						</StyledRefresh>
					</GCTooltip>
					<GCTooltip title="Zoom Out" arrow>
						<StyledRefresh
							onClick={() => {
								trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'graphView', 'ZoomOut');
								zoomInOut(false);
							}}
						>
							<ZoomOutIcon fontSize="inherit" style={{ fontSize: 26 }} />
						</StyledRefresh>
					</GCTooltip>
					<GCTooltip title="Recenter graph" arrow>
						<StyledRefresh
							onClick={() => {
								trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'graphView', 'CenterGraph');
								recenterGraph();
							}}
						>
							<SvgIcon>
								<path
									fill="currentColor"
									d="M11,2V4.07C7.38,4.53 4.53,7.38 4.07,11H2V13H4.07C4.53,16.62 7.38,19.47 11,19.93V22H13V19.93C16.62,19.47 19.47,16.62 19.93,13H22V11H19.93C19.47,7.38 16.62,4.53 13,4.07V2M11,6.08V8H13V6.09C15.5,6.5 17.5,8.5 17.92,11H16V13H17.91C17.5,15.5 15.5,17.5 13,17.92V16H11V17.91C8.5,17.5 6.5,15.5 6.08,13H8V11H6.09C6.5,8.5 8.5,6.5 11,6.08M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11Z"
								/>
							</SvgIcon>
						</StyledRefresh>
					</GCTooltip>
					<GCTooltip title="Reset graph" arrow>
						<StyledRefresh
							onClick={() => {
								trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'graphView', 'ResetGraph');
								handleResetGraph();
								setResetGraphClicked(true);
							}}
						>
							<RefreshIcon fontSize="inherit" style={{ fontSize: 26 }} />
						</StyledRefresh>
					</GCTooltip>
					{settingsBurger()}
					{settingsMenu()}
				</div>
			)}
			{renderContextMenu()}
			{renderNodeGroupMenu()}
			{shouldShowLegend && handleRenderLegend()}
			{runningQuery && (
				<div style={{ height: 650 }}>
					<div style={styles.loading}>
						<LoadingIndicator customColor={loadingIndicatorColor} />
					</div>
				</div>
			)}
			{!runningQuery && renderNodeViewer()}
		</div>
	);
}

export const MemoizedNodeCluster2D = React.memo(GraphNodeCluster2D);
