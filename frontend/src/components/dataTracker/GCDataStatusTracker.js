import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Tabs, Tab, TabPanel, TabList } from 'react-tabs';
import { Typography } from '@material-ui/core';
import TabStyles from '../common/TabStyles';
import moment from 'moment';
import Link from '@material-ui/core/Link';
import { green, red } from '@material-ui/core/colors';

import GameChangerAPI from '../api/gameChanger-service-api';
import { MemoizedNodeCluster2D } from '../graph/GraphNodeCluster2D';
import { getTrackingNameForFactory } from '../../utils/gamechangerUtils';
import { trackEvent } from '../telemetry/Matomo';
import IngestStats from './IngestStats';

const GoalIcon = styled.div`
	height: 20px;
	width: 150px;
	margin: auto
`;

const TableRow = styled.div`
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;
const CenterRow = styled.div`
	display: flex;
	height: 100%;
`;
const SectionHeader = styled.div`
	display: flex;
	margin-bottom: 20px;
	background-color: #F7F7F7;
	border-radius: 12px;
	padding: 20px;
`;

const StyledNeo4jTable = styled.div`
	margin: 0px 0px 20px 0px;
	height: 690px;

	> .details-paragraph {
		margin-bottom: 10px;
		font-size: 16px;
		font-family: Montesserat;
	}

	> .columns {
		display: flex;

		> .left-column {
			width: 40%;
			margin-right: 10px;
		}

		> .right-column {
			width: 60%;

			> .graph-schema {
				border: 1px solid rgba(0, 0, 0, 0.1);
			}

			> .node-rel-counts {
				margin-top: 10px;
			}
		}
	}
`;

const TableStyle = styled.div`
	> .updates-table
		.rt-td {
			padding: 10px 5px;
		}
	> .ReactTable {
		border-right: none;
		font-family: 'Noto Sans';

		> .rt-table {

			> .rt-thead{
				border-bottom: 1px solid #0000001F;

				> .rt-tr {
					font-size: 14px;
					text-align: center; 
					text-transform: uppercase;
				}
			}
			.rt-th,
			.rt-td {
				border-right: 1px solid #0000001F !important;
				white-space: normal;
				text-align: center;
			}
			.rt-th {
				font-weight: bold;
				display: -webkit-box;
				-webkit-line-clamp: 3;
				-webkit-box-orient: vertical;
				overflow: hidden;
				white-space: initial;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.rt-tr-group:nth-of-type(even){
				background: #F3F3F3;
			}
		}
	}
`;

const styles = {
	legendItem: {
		margin: '0px 5px',
		textAlign: 'center'
	},
	legendText: {
		fontSize: '14px',
		textTransform: 'uppercase',
		fontWeight: 'bold'
	}
};

const gameChangerAPI = new GameChangerAPI();

const PAGE_SIZE = 15;

const nextFriday = new Date();
nextFriday.setDate(
	nextFriday.getDate() + ((5 + (7 - nextFriday.getDay())) % 7)
);
nextFriday.setUTCHours(11, 0, 0);

const preventDefault = (event) => event.preventDefault();

const neo4jPropertiesColumns = [
	{
		Header: 'Label',
		accessor: 'label',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Property',
		accessor: 'property',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Type',
		accessor: 'type',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Primary Key',
		accessor: 'primary_key',
		Cell: (row) => <TableRow>{row.value ? 'TRUE' : 'FALSE'}</TableRow>,
	},
];

const neo4jCountsColumns = [
	{
		Header: 'Node/RELATIONSHIP',
		accessor: 'name',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Count',
		accessor: 'count',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
];

const getData = async ({
	limit = PAGE_SIZE,
	offset = 0,
	sorted = [],
	filtered = [],
	tabIndex = 'documents',
	option = 'all',
}) => {
	const order = sorted.map(({ id, desc }) => {
		if (id === 'json_metadata') {
			return ['json_metadata.crawler_used', desc ? 'DESC' : 'ASC'];
		} else {
			return [id, desc ? 'DESC' : 'ASC'];
		}
	});
	const where = filtered.map(({ id, value }) => ({
		[id]: { $iLike: `%${value}%` },
	}));

	try {
		if (tabIndex === 'documents') {
			const data = await gameChangerAPI.getDataTrackerData({
				limit,
				offset,
				order,
				where,
			});
			if (data && data.data) {
				return data.data;
			} else {
				return [];
			}
		} else if (tabIndex === 'crawlerInfo') {
			const data = await gameChangerAPI.gcCrawlerSealData();
			if (data && data.data){
				return data.data;
			} else {
				return [];
			}
		} else if (tabIndex === 'crawler') {
			const data = await gameChangerAPI.gcCrawlerTrackerData({
				limit,
				offset,
				order,
				where,
				option,
			});
			if (data && data.data) {
				return data.data;
			} else {
				return [];
			}
		} else if (tabIndex === 'version') {
			const data = await gameChangerAPI.getBrowsingLibrary({ limit, offset });
			if (data && data.data) {
				return data.data;
			} else {
				return [];
			}
		}
	} catch (e) {
		return [];
	}
};

const GCDataStatusTracker = (props) => {
	const { state } = props;

	const [dataTableData, setDataTableData] = useState([]);
	const [crawlerTableData, setCrawlerTableData] = useState([]);
	const [neo4jPropertiesData, setNeo4jPropertiesData] = useState([]);
	const [neo4jCountsData, setNeo4jCountsData] = useState([]);
	const [neo4jGraphData, setNeo4jGraphData] = useState({
		nodes: [],
		edges: [],
	});
	const [loading, setLoading] = useState(true);
	const [loadingNeo4jPropertiesData, setLoadingNeo4jPropertiesData] =
		useState(true);
	const [loadingNeo4jGraphData, setLoadingNeo4jGraphData] = useState(true);
	const [loadingNeo4jCounts, setLoadingNeo4jCounts] = useState(true);
	const [numPages, setNumPages] = useState(0);
	const [tabIndex, setTabIndex] = useState('crawler');
	const [ingestData, setIngestData] = useState({});
	const [crawlerInfoMap, setCrawlerInfoMap] = useState(null);

	useEffect(() => {
		gameChangerAPI.getDocIngestionStats().then(res => {
			setIngestData(res.data);
		});
		gameChangerAPI.gcCrawlerSealData().then(res => {
			const map = {};
			res.data.forEach(crawler => {
				map[crawler.crawler] = crawler;
			});
			setCrawlerInfoMap(map);
		});
	}, []);
	
	const handleFetchData = async ({ page, sorted, filtered }) => {
		try {
			setLoading(true);
			const { totalCount, docs = [] } = await getData({
				offset: page * PAGE_SIZE,
				sorted,
				filtered,
			});
			const pageCount = Math.ceil(totalCount / PAGE_SIZE);
			setNumPages(pageCount);
			setDataTableData(docs);
		} catch (e) {
			setDataTableData([]);
			setNumPages(0);
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const handleFetchCrawlerData = async ({ page, sorted, filtered }) => {
		try {
			setLoading(true);
			const { totalCount, docs = [] } = await getData({
				offset: page * PAGE_SIZE,
				sorted,
				filtered,
				tabIndex: 'crawler',
				option: 'status',
			});
			const pageCount = Math.ceil(totalCount / PAGE_SIZE);
			setNumPages(pageCount);
			setCrawlerTableData(docs);
		} catch (e) {
			setCrawlerTableData([]);
			setNumPages(0);
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const handleGetNeo4jData = async () => {
		setLoading(true);
		setLoadingNeo4jPropertiesData(true);
		setLoadingNeo4jCounts(true);
		setNeo4jGraphData({ nodes: [], edges: [] });
		const resp = await gameChangerAPI.callGraphFunction({
			functionName: 'getGraphSchema',
			cloneName: state.cloneData.clone_name,
			options: {},
		});

		setNeo4jPropertiesData(resp.data.schema.graph_metadata || []);
		setLoadingNeo4jPropertiesData(false);

		const edges = [];
		const nodes = resp.data.graph.nodes;

		const usedIds = [];

		const labels = Array.from(
			new Set(
				nodes.map((node) => {
					return node.label;
				})
			)
		);

		resp.data.graph.edges.forEach((edge) => {
			if (edge.source === edge.target) {
				const sourceNode = nodes.filter((node) => {
					return node.id === edge.source;
				})[0];
				const targetNode = {};
				Object.keys(sourceNode).forEach((key) => {
					if (key === 'id') {
						let newId = -sourceNode.id;
						while (usedIds.includes(newId)) {
							newId += 1;
						}
						usedIds.push(newId);
						targetNode.id = newId;
					} else {
						targetNode[key] = sourceNode[key];
					}
				});

				nodes.push(targetNode);
				edge.target = targetNode.id;
			} else {
				usedIds.push(edge.source);
				usedIds.push(edge.target);
			}

			edges.push(edge);
		});
		setNeo4jGraphData({ nodes, edges, labels });
		setLoadingNeo4jGraphData(false);

		const metaData = resp.data.stats.graph_metadata[0] || {};
		const countsTableData = [];

		Object.keys(metaData.node_counts).forEach((countKey) => {
			countsTableData.push({
				name: countKey,
				count: metaData.node_counts[countKey].low,
			});
		});
		Object.keys(metaData.relationship_counts).forEach((countKey) => {
			countsTableData.push({
				name: countKey,
				count: metaData.relationship_counts[countKey].low,
			});
		});
		setNeo4jCountsData(countsTableData);
		setLoadingNeo4jCounts(false);
	};

	const handleTabClicked = async (tabIndex) => {
		trackEvent(
			getTrackingNameForFactory(state.cloneData.clone_name),
			'DataStatusTracker',
			tabIndex
		);
		setTabIndex(tabIndex);
		if (tabIndex === 'neo4j') {
			await handleGetNeo4jData();
		}
	};

	const crawl_download = (status) => {
		if (
			status === 'Crawl and Download Complete' ||
			status === 'Ingest In Progress' ||
			status === 'Ingest Complete'
		) {
			return true;
		}
		return false;
	};
	const ingest_progress = (status) => {
		if (status === 'Ingest In Progress' || status === 'Ingest Complete') {
			return true;
		}
		return false;
	};
	const ingest_complete = (status) => {
		if (status === 'Ingest Complete') {
			return true;
		}
		return false;
	};
	const date_difference = (date) => {
		const diffTime = Math.abs(Date.now() - date);
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	};
	
	const getCrawlerName = (crawler) => {
		if(crawler.data_source_s && crawler.source_title) return `${crawler.data_source_s} - ${crawler.source_title}`;
		return crawler.crawler_name;
	};

	const renderDataTable = () => {
		const fileClicked = (filename) => {
			trackEvent(
				getTrackingNameForFactory(state.cloneData.clone_name),
				'DataStatusTracker',
				'PDFOpen'
			);
			window.open(
				`/#/pdfviewer/gamechanger?filename=${filename.replace(
					/'/g,
					''
				)}&cloneIndex=${state.cloneData.clone_name}`
			);
		};

		const dataColumns = [
			{
				Header: 'Type',
				accessor: 'pub_type',
				Cell: (row) => <TableRow>{row.value}</TableRow>,
			},
			{
				Header: 'Number',
				accessor: 'pub_number',
				width: 90,
				Cell: (row) => <TableRow>{row.value}</TableRow>,
			},
			{
				Header: 'Title',
				accessor: 'pub_title',
				Cell: (props) => (
					<TableRow>
						<Link
							href={'#'}
							onClick={(event) => {
								preventDefault(event);
								fileClicked(props.original.doc_filename);
							}}
							style={{ color: '#386F94' }}
						>
							<div>
								{props.original.pub_title}
							</div>
						</Link>
					</TableRow>
				),
			},
			{
				Header: 'Source',
				accessor: 'json_metadata',
				width: 200,
				filterable: false,
				sortable: false,
				Cell: (props) => {
					const crawler = crawlerInfoMap[props.original.json_metadata.crawler_used];
					return (<TableRow>
						<Link
							href={'#'}
							onClick={(event) => {
								preventDefault(event);
								window.open(props.original.json_metadata.source_page_url);
							}}
							style={{ color: '#386F94' }}
						>
							<div>
								{crawler ? `${crawler.data_source_s} - ${crawler.source_title}` : props.original.json_metadata.crawler_used}
							</div>
						</Link>
					</TableRow>);
				},
			},
			{
				Header: 'Publication Date',
				accessor: 'publication_date',
				filterable: false,
				width: 115,
				Cell: (row) => (
					<TableRow>
						{moment(row.value).isValid() ? moment(Date.parse(row.value)).format('YYYY-MM-DD') : 'N/A'}
					</TableRow>
				),
			},
			{
				Header: 'Ingestion Date',
				accessor: 'upload_date',
				filterable: false,
				width: 115,
				Cell: (row) => (
					<TableRow>
						{moment(Date.parse(row.value)).format('YYYY-MM-DD')}
					</TableRow>
				),
			},
			{
				Header: 'Next update',
				width: 115,
				filterable: false,
				sortable: false,
				Cell: (row) => (
					<TableRow>
						{moment(Date.parse(nextFriday.toISOString())).format('YYYY-MM-DD')}
					</TableRow>
				),
			},
		];

		return (
			<>
				<SectionHeader>
					<div>
						<Typography variant="h3" style={{fontSize: '18px'}}>Document Overview</Typography>
						<Typography variant="body2">
						The following table lists all documents within the GAMECHANGER corpus. Use the 
						filtering capabilities for the TYPE, NUMBER, and TITLE columns to locate specific 
						documents of interest.
						</Typography>
					</div>
				</SectionHeader>
				<div style={{display: 'flex'}}>
					<TableStyle style={{width: '75%'}}>
						<ReactTable
							data={dataTableData}
							columns={dataColumns}
							style={{whiteSpace: 'unset', margin: '0 0 20px 0', height: 'auto' }}
							pageSize={PAGE_SIZE}
							showPageSizeOptions={false}
							filterable={true}
							loading={loading}
							manual={true}
							pages={numPages}
							onFetchData={handleFetchData}
							defaultSorted={[
								{
									id: 'pub_type',
									desc: false,
								},
							]}
						/>
					</TableStyle>
					<IngestStats style={{width: '25%'}} ingestData={ingestData}/>
				</div>
			</>
		);
	};

	const renderIngestprogress = (status) => {
		let percent;
		switch(status){
			case 'Crawl and Download Complete':
				percent = '33%';
				break;
			case 'Ingest In Progress':
				percent = '66%';
				break;
			case 'Ingest Complete':
				percent = '100%';
				break;
			default:
				percent = '0%';
		}

		return (<>
			<div style={{fontSize: '12px'}}>
				{percent}
			</div>
			<div style={{maxWidth: 150, width: '80%', height: 8, background: '#D8D8D8', borderRadius: '24px', position: 'relative'}}>
				<div style={{width: percent, height: 8, background: '#969696', borderRadius: '24px', position: 'absolute'}}/>
			</div>
		</>);
	};

	const renderCrawlerData = () => {
		const crawlerColumns = [
			{
				Header: 'Source',
				accessor: 'crawler_name',
				Cell: (row) =>{
					return row.original.url_origin ?
						<TableRow>
							<a 
								href={row.original.url_origin} 
								target='_blank' 
								rel="noreferrer">
								{getCrawlerName(row.original)}
							</a>
						</TableRow>
						:
						<TableRow>
							{getCrawlerName(row.original)}
						</TableRow>;
				},
				style: { 'whiteSpace': 'unset' },
			},
			{
				Header: '% Ingested',
				accessor: 'status',
				Cell: (row) => 
					<TableRow style={{display: 'flex', flexDirection: 'column', paddingBottom: '5px', justifyContent: 'center'}}>
						{renderIngestprogress(row.value)}
					</TableRow>,
			},
			{
				Header: 'Crawl and Download Complete',
				accessor: 'status',
				Cell: (props) => (
					<CenterRow>
						{crawl_download(props.original.status) ? (
							<GoalIcon
								style={{ backgroundColor: green[500] }}
							/>
						) : (
							<GoalIcon
								style={{ backgroundColor: red[500] }}
							/>
						)}
					</CenterRow>
				),
			},
			{
				Header: 'Ingest In Progress',
				accessor: 'status',
				Cell: (props) => (
					<CenterRow>
						{ingest_progress(props.original.status) ? (
							<GoalIcon
								style={{ backgroundColor: green[500] }}
							/>
						) : (
							<GoalIcon
								style={{ backgroundColor: red[500] }}
							/>
						)}
					</CenterRow>
				),
			},
			{
				Header: 'Ingest Complete',
				accessor: 'status',
				Cell: (props) => (
					<CenterRow>
						{ingest_complete(props.original.status) ? (
							<GoalIcon
								style={{ backgroundColor: green[500] }}
							/>
						) : (
							<GoalIcon
								style={{ backgroundColor: red[500] }}
							/>
						)}
					</CenterRow>
				),
			},
			{
				Header: 'Last Action',
				accessor: 'datetime',
				Cell: (row) => {
					return (
						<TableRow>
							{moment(Date.parse(row.value)).format('YYYY-MM-DD')}
						</TableRow>
					);
				},
			},
			{
				Header: 'Days Since Last Ingest',
				accessor: 'datetime',
				Cell: (row) => {
					return <TableRow>{date_difference(Date.parse(row.value))}</TableRow>;
				},
			},
		];

		return (
			<>
				<SectionHeader>
					<div>
						<Typography variant="h3" style={{fontSize: '18px'}}>Progress Overview</Typography>
						<Typography variant="body2">
							The following table and chart provide a real-time status update of each data 
							source within the GAMECHANGER corpus. Data pipelines update automatically, 
							typically every 7 days. Any issues or delays will be indicated directly in 
							the table.
						</Typography>
					</div>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							marginLeft: '10px'
						}}
					>	
						<div style={styles.legendItem}>
							<span style={styles.legendText}>Complete </span>
							<GoalIcon
								style={{ backgroundColor: green[500], width: 100 }}
							/>
						</div>
						<div style={styles.legendItem}>
							<span style={styles.legendText}>Incomplete </span>
							<GoalIcon
								style={{ backgroundColor: red[500], width: 100 }}
							/>
						</div>
					</div>
				</SectionHeader>
				<div style={{display: 'flex'}}>
					<TableStyle style={{width: '75%'}}>
						<ReactTable
							data={crawlerTableData}
							columns={crawlerColumns}
							style={{whiteSpace: 'unset', margin: '0 0 20px 0', height: 'auto' }}
							pageSize={PAGE_SIZE}
							showPageSizeOptions={false}
							filterable={false}
							loading={loading}
							manual={true}
							pages={numPages}
							onFetchData={handleFetchCrawlerData}
						/>
					</TableStyle>
					<IngestStats style={{width: '25%'}} ingestData={ingestData}/>
				</div>
			</>
		);
	};

	const renderNeo4jTable = () => {
		const width = window.innerWidth * 0.525;
		const height = 400;

		return (
			<StyledNeo4jTable>
				<SectionHeader>
					<div>
						<Typography variant="h3" style={{fontSize: '18px'}}>Knowledge Overview</Typography>
						<Typography variant="body2">
							The following tables and chart describe the schema in the Knowledge
							Graph. The table on the left lists the Nodes and Relationships by
							"Label" along with the property names and the types of those
							properties. The table in the bottom right lists the different Nodes and
							Relationships and the counts. The chart graphically describes the
							schema of the Knowledge Graph.
						</Typography>
					</div>
				</SectionHeader>
				<div className={'columns'}>
					<div className={'left-column'}>
						<div className={'properties-schema'}>
							<TableStyle>
								<ReactTable
									data={neo4jPropertiesData}
									style={{ height: 670 }}
									columns={neo4jPropertiesColumns}
									showPageSizeOptions={false}
									showPagination={false}
									filterable={false}
									loading={loadingNeo4jPropertiesData}
									manual={true}
									pages={numPages}
								/>
							</TableStyle>
						</div>
					</div>
					<div className={'right-column'}>
						<div className={'graph-schema'}>
							<MemoizedNodeCluster2D
								graphWidth={width}
								graphHeight={height}
								runningQuery={loadingNeo4jGraphData}
								displayLinkLabel={true}
								graph={neo4jGraphData}
								hierarchyView={false}
								showSettingsMenu={false}
								shouldHighlightNodes={false}
								shouldShowLegend={false}
								showBasic={true}
								cloneData={state.cloneData}
							/>
						</div>
						<div className={'node-rel-counts'}>
							<TableStyle>
								<ReactTable
									data={neo4jCountsData}
									style={{ height: 251 }}
									columns={neo4jCountsColumns}
									showPageSizeOptions={false}
									showPagination={false}
									filterable={false}
									loading={loadingNeo4jCounts}
									manual={true}
									minRows={0}
								/>
							</TableStyle>
						</div>
					</div>
				</div>
			</StyledNeo4jTable>
		);
	};

	return (
		<div style={TabStyles.tabContainer}>
			<Tabs>
				<div style={TabStyles.tabButtonContainer}>
					<TabList style={TabStyles.tabsList}>
						<Tab
							style={{
								...TabStyles.tabStyle,
								...(tabIndex === 'crawler' ? TabStyles.tabSelectedStyle : {}),
								borderRadius: `5px 0 0 0`,
							}}
							title="crawlerTable"
							onClick={() => handleTabClicked('crawler')}
						>
							<Typography variant="h6" display="inline">
								PROGRESS
							</Typography>
						</Tab>
						<Tab
							style={{
								...TabStyles.tabStyle,
								...(tabIndex === 'documents' ? TabStyles.tabSelectedStyle : {}),
								borderRadius: '0 0 0 0',
							}}
							title="userHistory"
							onClick={() => handleTabClicked('documents')}
						>
							<Typography variant="h6" display="inline" title="cardView">
								DOCUMENTS
							</Typography>
						</Tab>
						<Tab
							style={{
								...TabStyles.tabStyle,
								...(tabIndex === 'neo4j' ? TabStyles.tabSelectedStyle : {}),
								borderRadius: `0 5px 0 0`,
							}}
							title="neo4jDataTracker"
							onClick={() => handleTabClicked('neo4j')}
						>
							<Typography variant="h6" display="inline" title="cardView">
								KNOWLEDGE GRAPH
							</Typography>
						</Tab>
					</TabList>

					<div style={TabStyles.spacer} />
				</div>

				<div style={TabStyles.panelContainer}>
					<TabPanel>{renderCrawlerData()}</TabPanel>
					<TabPanel>{renderDataTable()}</TabPanel>
					<TabPanel style={{marginBottom: 100}}>{renderNeo4jTable()}</TabPanel>
				</div>
			</Tabs>
		</div>
	);
};

GCDataStatusTracker.propTypes = {
	state: PropTypes.shape({
		cloneData: PropTypes.shape({
			clone_name: PropTypes.string,
		}),
	}),
};

export default GCDataStatusTracker;
