import React, {useState, useEffect, useRef} from 'react';
import {SearchBanner} from "../components/searchBar/GCSearchBanner";
import {trackEvent, trackPageView} from "../components/telemetry/Matomo";
import GameChangerAPI from "../components/api/gameChanger-service-api";
import {gcColors} from "./GameChangerPage";
import styled from "styled-components";
import Paper from 'material-ui/Paper/Paper';
import SimpleTable from "../components/common/SimpleTable";
import {MemoizedNodeCluster2D} from "../components/graph/GraphNodeCluster2D";
import {	numberWithCommas, getMetadataForPropertyTable,
	getReferenceListMetadataPropertyTable, getTrackingNameForFactory} from "../gamechangerUtils";
import Pagination from "react-js-pagination";
import {Card} from "../components/cards/GCCard";
import GCAccordion from "../components/common/GCAccordion";
import LoadingIndicator from "advana-platform-ui/dist/loading/LoadingIndicator";
import {gcOrange} from "../components/common/gc-colors";
import _ from "lodash";
import DocumentDetailsPage from "../components/details/documentDetailsPage";
import {MemoizedPolicyGraphView} from "../components/graph/policyGraphView";

const gameChangerAPI = new GameChangerAPI();

const RESULTS_PER_PAGE = 18;

const colWidth = {
	maxWidth: '900px',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

export const MainContainer = styled.div`
	display: flex;
	margin: 10px 4%;
	font-family: Montserrat !important;
	
	.details-header {
		text-align: left;
		color: white;
		background-color: #131E43;
		margin: 0 0 5px 0;
		padding: 12px 5px;
		font-family: Montserrat !important;
		font-weight: bold;
		font-size: 16px;
	}
	
	> .details {
		> div {
			border: 1px solid rgb(208,214,218);
			text-align: center;
			background-color: rgb(255,255,255) !important;
			height: fit-content !important;
			width: 300px;
			font-family: Montserrat !important;
			box-shadow: unset !important;
			
			> .name {
				font-size: 20px;
				margin: 5px;
				font-weight: bold;
			}
			
			> img {
				width: 160px;
				margin: 10px auto;
			}
			
			> .details-table {
				text-align: left;
				margin: 0 5px;
			}
		}
	}
	
	> .graph-top-docs {
		width: 100%;
		margin-left: 10px;
	
		> .section {
			> div {
				border-top-right-radius: 6px;
    			border-top-left-radius: 6px;
    			margin-bottom: 5px;
				
				> #graph2dContainer {
					margin 5px;
				}
				
				> .related-documents {
					margin: 0 10px;
				}
			}
		}
	}
`

const FavoriteTopic = styled.button`
	border: none;
	height: 25px;
	border-radius: 15px;
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
	border: 1px solid darkgray;

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
`;

function useQuery(location, setQuery, query) {
	if (!query) {
		setQuery(new URLSearchParams(location.search));
	}
}

const getEntityData = async (name, cloneName) => {
	const data = {};
	const resp = await gameChangerAPI.graphQueryPOST(
		`MATCH (e:Entity) WHERE e.name = $name RETURN e;`, '03JLGOM', cloneName, {params: {name: name}}
	);
	
	if (resp.data.nodes){
		const tmpEntity = resp.data.nodes[0];
		tmpEntity.details = [];
		Object.keys(tmpEntity).forEach(key => {
			if (tmpEntity[key] !== '') {
				if  (key !== 'image' && key !== 'properties' && key !== 'label' && key !== 'value' &&
					key !== 'details' && key !== 'id') {
					if (key === 'website') {
						tmpEntity.details.push({ name: key.charAt(0).toUpperCase() + key.slice(1),
							value: (<a href={tmpEntity[key]}>{tmpEntity[key]}</a>) });
					} else {
						tmpEntity.details.push({
							name: key.charAt(0).toUpperCase() + key.slice(1),
							value: tmpEntity[key]
						});
					}
				}
			}
		});
		
		data.entity = tmpEntity;
	}
	
	const graphResp = await gameChangerAPI.graphQueryPOST(
	'OPTIONAL MATCH pc=(c:Entity)-[:CHILD_OF]-(:Entity) ' +
		'WHERE c.name = $name ' +
		'RETURN pc;', 'WHB0K4M', cloneName, {params: {name: name}}
	);
	
	data.graph = graphResp.data;
	
	return data;
				
}

const getTopicData = async (name, cloneName) => {
	const data = {topic: {}, graph: {nodes: [], edges: []}};
	const resp = await gameChangerAPI.graphQueryPOST(
		'MATCH (t:Topic) WHERE t.name = $name ' +
			'WITH t MATCH (d:Document)-[:CONTAINS]->(t) ' +
			'RETURN t as topic, count(d) as documentCountsForTopic;', '8SJ22U3', cloneName, {params: {name: name}}
	);
	
	if (resp.data.nodes && resp.data.nodes.length > 0){
		const tmpTopic = resp.data.nodes[0];
		tmpTopic.details = [{key: 'Documents Referenced', value: resp.data.nodeProperties.documentCountsForTopic.low}];
		
		data.topic = tmpTopic;
		
		const graphResp = await gameChangerAPI.graphQueryPOST(
		'OPTIONAL MATCH pt=(d:Document)-[c:CONTAINS]->(t:Topic) ' +
			'WHERE t.name = $name ' +
			'RETURN pt;', 'KRH4Q7C', cloneName, {params: {name: name}}
		);
	
		data.graph = graphResp.data;
	}
	
	return data;
}

const getDocumentData = async (doc_id, cloneName) => {
	const data = {document: {}};
	const resp = await gameChangerAPI.callSearchFunction({
		functionName: 'getSingleDocumentFromES',
		cloneName: cloneName,
		options: {
			docIds: [doc_id]
		}
	})
	
	data.document = resp.data.docs[0];
	
	console.log(resp.data)
	
	const docData = getMetadataForPropertyTable(data.document);
	const { ref_list = [] } = data.document;
	const previewDataReflist = getReferenceListMetadataPropertyTable(ref_list, true);
	
	const labelText = data.document.isRevoked ? 'Cancel Date' : 'Verification Date';
	let dateText = "Unknown";
	if(data.document.current_as_of !== undefined && data.document.current_as_of !== ''){
		const currentDate = new Date(data.document.current_as_of);
		const year = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(currentDate);
		const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(currentDate);
		const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
		dateText = `${month}-${day}-${year}`;
	}
	
	let publicationDate;
	if(data.document.publication_date_dt !== undefined && data.document.publication_date_dt !== ''){
		const currentDate = new Date(data.document.publication_date_dt);
		const year = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(currentDate);
		const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(currentDate);
		const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
		publicationDate = `${month}-${day}-${year}`;
	} else {
		publicationDate = `unknown`;
	}
	
	const favoritableData = [{Key: 'Published', Value: publicationDate}, {Key: labelText, Value: dateText}, ...addFavoriteTopicToMetadata(docData, cloneName)];
	
	data.document.details = favoritableData;
	data.document.refList = previewDataReflist;
	
	return data;
}

const addFavoriteTopicToMetadata = (data, cloneName) => {
		const temp = _.cloneDeep(data);
		temp.map(metaData => {
			if(metaData.Key === 'Topics') {
				metaData.Key = <div>
					Topics<br/><b style={{color:'red'}}>(Beta)</b>
					</div>
				const topics = metaData.Value;
				metaData.Value =
				<div>
					{topics.map((topic,index) => {
						topic = topic.trim()
						return(
							<FavoriteTopic key={index}
								onClick={(event) => {
									trackEvent(getTrackingNameForFactory(cloneName), 'TopicOpened', topic)
									window.open(`#/gamechanger-details?cloneName=${cloneName}&type=topic&topicName=${topic}`);
								}}
								favorited={false}
							>
								{topic}
							</FavoriteTopic>
							)
						})
					}
				</div>
			}
			return metaData
		})
		return temp
	}
	
const GameChangerDetailsPage = (props) => {
	
	const {
		location
	} = props;
	
	const [cloneData, setCloneData] = useState({});
	const [entity, setEntity] = useState(null)
	const [query, setQuery] = useState(null)
	const [runningQuery, setRunningQuery] = useState(false);
	const [graph, setGraph] = useState({nodes: [], edges: [], labels: []});
	const [docCount, setDocCount] = useState(0);
	const [timeFound, setTimeFound] = useState('0.0');
	const [docResultsPage, setDocResultsPage] = useState(0);
	const [docResults, setDocResults] = useState([]);
	const [visibleDocs, setVisibleDocs] = useState([]);
	const [gettingDocuments, setGettingDocuments] = useState(true);
	const [showEntityContainer, setShowEntityContainer] = useState(false);
	const [detailsType, setDetailsType] = useState('');
	const [hierarchyView, setHierarchyView] = useState(false);
	
	const [topic, setTopic] = useState(null);
	const [showTopicContainer, setShowTopicContainer] = useState(false);
	
	const [document, setDocument] = useState(null);
	const [showDocumentContainer, setShowDocumentContainer] = useState(false);
	
	const graphRef = useRef();
	
	useQuery(location, setQuery, query);
	
	useEffect(() => {
		trackPageView("GameChanger Details Page", false);
	}, [])
	
	useEffect(() => {
		const cloneName = query.get('cloneName');
		gameChangerAPI.getCloneMeta({cloneName: query.get('cloneName')}).then(data => {
			setCloneData(data.data);
		});
		
		const type = query.get('type');
		let name = '';
		
		switch (type) {
			case 'entity':
				setDetailsType('Organization');
				name = query.get('entityName');
				setRunningQuery(true);
				setGettingDocuments(true);
				getEntityData(name, cloneName).then(data => {
					setEntity(data.entity);
					setGraph(data.graph);
					setRunningQuery(false);
					const type = data.entity['type'] || 'organization';
					if (type === 'organization') setHierarchyView(true);
					setDetailsType(type.charAt(0).toUpperCase() + type.slice(1));
					setShowEntityContainer(true);
				});
				break;
			case 'topic':
				setDetailsType('Topic');
				name = query.get('topicName');
				setRunningQuery(true);
				setGettingDocuments(true);
				getTopicData(name, cloneName).then(data => {
					setShowTopicContainer(true);
					setTopic(data.topic);
					setGraph(data.graph);
					setRunningQuery(false);
				})
				break;
			case 'document':
				setDetailsType('Document');
				name = query.get('documentName');
				
				setShowDocumentContainer(true);
				getDocumentData(name, cloneName).then(data => {
					setDocument(data.document);
				});
				
				break;
			default:
				break;
		}
	}, [query]);
	
	useEffect(() => {
		if (!entity || !cloneData) return;
		const aliases = entity.aliases ? entity.aliases.split(';') : [];
		let searchText = `"${entity.name}"`;
		aliases.forEach(alias => {
			searchText += ` or ${alias}`;
		})
		
		const t0 = new Date().getTime();
		gameChangerAPI.getDocumentsForEntity(cloneData.clone_name, {entityName: entity.name, searchText}).then(resp => {
			
			const t1 = new Date().getTime();
			setDocCount(resp.data.totalCount)
			setDocResultsPage(1);
			setDocResults(resp.data.docs);
			setVisibleDocs(resp.data.docs.slice(1, RESULTS_PER_PAGE + 1));
			if(resp.data.docs.length > 0) {
				setTimeFound(((t1 - t0) / 1000).toFixed(2));
				setGettingDocuments(false);
			}
		});
	}, [entity, cloneData]);
	
	useEffect(() => {

		if (!topic || !cloneData || graph.nodes.length <= 0) return;
		let searchText = `"${topic.name}"`;
		
		const docIds = [];
		
		graph.nodes.forEach(node => {
			if (node.doc_id) {
				docIds.push(node.doc_id);
			}
		});
		
		const t0 = new Date().getTime();
		gameChangerAPI.getDocumentsForTopic(cloneData.clone_name, {docIds, searchText}).then(resp => {
			
			const t1 = new Date().getTime();
			setDocCount(resp.data.totalCount)
			setDocResultsPage(1);
			setDocResults(resp.data.docs);
			setVisibleDocs(resp.data.docs.slice(0, RESULTS_PER_PAGE + 1));
			if(resp.data.docs.length > 0) {
				setTimeFound(((t1 - t0) / 1000).toFixed(2));
				setGettingDocuments(false);
			}
		});

	}, [topic, graph, cloneData]);
	
	const renderDocuments = () => {
		return visibleDocs.map((item, idx) => {
			
			return (
				<Card key={idx}
					item={item}
					idx={idx}
					state={{cloneData, selectedDocuments: new Map(), componentStepNumbers: {}}}
					//dispatch={dispatch}
				/>
			);
		});
	}
	
	const handleChangeDocsPage = (page) => {
		setDocResultsPage(page);
		setVisibleDocs(docResults.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE + 1));
	}
	
	const renderEntityContainer = () => {
		return (
			<>
				{entity &&
					<MainContainer>
						<div className={'details'}>
							<Paper>
								<div className={'name'}>{entity.name}</div>
								<img className={'img'} alt={`${entity.name} Img`} src={entity.image} />
								
								<div className={'details-header'}>
									<span>{'ENTITY DETAILS'}</span>
								</div>
								
								<div className={'details-table'}>
									<SimpleTable tableClass={'sidebar-table'}
										zoom={1}
										headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
										rows={entity.details}
										height={'auto'}
										dontScroll={true}
										colWidth={colWidth}
										disableWrap={true}
										title={'Entity Statistics'}
										hideHeader={true}
									/>
								</div>
							</Paper>
						</div>
						<div className={'graph-top-docs'}>
							
							<div className={'section'}>
								<GCAccordion expanded={false} header={'GRAPH VIEW'} backgroundColor={'rgb(238,241,242)'}>
									<MemoizedNodeCluster2D graphWidth={window.innerWidth-465} graphHeight={400} runningQuery={runningQuery}
										displayLinkLabel={false} graph={graph} graphRefProp={graphRef}
										hierarchyView={hierarchyView} cloneData={cloneData} />
								</GCAccordion>
							</div>
							
							<div className={'section'}>
								<GCAccordion expanded={true} header={'RELATED DOCUMENTS'} backgroundColor={'rgb(238,241,242)'}>
									<div className={'related-documents'} style={{width: '100%'}}>
										<div style={{ display: 'flex', justifyContent: 'space-between' }}>
											<div style={styles.resultsCount}>{gettingDocuments ? 'Searching for documents...' :
												`${numberWithCommas(docCount)} results found in ${timeFound} seconds`}</div>
												<div style={{ marginTop: '-14px', display: 'flex' }} className={'gcPagination'}>
													<Pagination
														activePage={docResultsPage}
														itemsCountPerPage={20}
														totalItemsCount={docCount}
														pageRangeDisplayed={8}
														onChange={page => {
															trackEvent('GAMECHANGER_DETAILS', 'DetailsPaginationChanged', 'page', page);
															handleChangeDocsPage(page);
														}}
														className='gcPagination'
													/>
												</div>
											</div>
											<div className="row" style={{ marginLeft: 0, marginRight: -15 }}>
												{gettingDocuments ?
												<div style={{ margin: '0 auto' }}>
													<LoadingIndicator customColor={gcOrange} />
												</div> :
													renderDocuments()}
											</div>
									</div>
								</GCAccordion>
							</div>
							
						</div>
					</MainContainer>
				}
			</>
			
		);
	}
	
	const renderTopicContainer =() => {
		return (
			<div>
				<p  style={{margin: '10px 4%', fontSize: 18}}>Welcome to our new (Beta version) Topic Details page! As you look around, you may note some technical issues below; please bear with us while we continue making improvements here and check back often for a more stable version.</p>
				{topic &&
					<MainContainer>
						<div className={'details'}>
							<Paper>
								<div className={'name'}>{topic.name || ''}</div>
								
								<div className={'details-header'}>
									<span>{'TOPIC DETAILS'}</span>
								</div>
								
								<div className={'details-table'}>
									<SimpleTable tableClass={'sidebar-table'}
												 zoom={1}
												 headerExtraStyle={{backgroundColor: '#313541', color: 'white'}}
												 rows={topic.details || []}
												 height={'auto'}
												 dontScroll={true}
												 colWidth={colWidth}
												 disableWrap={true}
												 title={'Topic Statistics'}
												 hideHeader={true}
									/>
								</div>
							</Paper>
						</div>
						<div className={'graph-top-docs'}>
							
							<div className={'section'}>
								<GCAccordion expanded={true} header={'GRAPH VIEW'} backgroundColor={'rgb(238,241,242)'}>
									<MemoizedPolicyGraphView width={1420} height={670} graphData={graph} runningSearchProp={runningQuery}
										 notificationCountProp={0} setDocumentsFound={() => {}} setTimeFound={() => {}}
										 cloneData={cloneData} expansionTerms={false} setNumOfEdges={() => {}}
										 dispatch={{}} showSideFilters={false} showBasic={false} searchText={''}
										 hierarchyView={hierarchyView} detailsView={true}
									/>
								</GCAccordion>
							</div>
							
							<div className={'section'}>
								<GCAccordion expanded={true} header={'RELATED DOCUMENTS'}
											 backgroundColor={'rgb(238,241,242)'}>
									<div className={'related-documents'} style={{width: '100%'}}>
										<div style={{display: 'flex', justifyContent: 'space-between'}}>
											<div
												style={styles.resultsCount}>{gettingDocuments ? 'Searching for documents...' :
												`${numberWithCommas(docCount)} results found in ${timeFound} seconds`}</div>
											<div style={{marginTop: '-14px', display: 'flex'}} className={'gcPagination'}>
												<Pagination
													activePage={docResultsPage}
													itemsCountPerPage={20}
													totalItemsCount={docCount}
													pageRangeDisplayed={8}
													onChange={page => {
														trackEvent('GAMECHANGER', 'DetailsPaginationChanged', 'page', page);
														handleChangeDocsPage(page);
													}}
													className='gcPagination'
												/>
											</div>
										</div>
										<div className="row" style={{marginLeft: 0, marginRight: -15}}>
											{gettingDocuments ?
												<div style={{margin: '0 auto'}}>
													<LoadingIndicator customColor={gcColors.buttonColor2}/>
												</div> :
												renderDocuments()}
										</div>
									</div>
								</GCAccordion>
							</div>
						
						</div>
					</MainContainer>
				}
			</div>
		);
	}
	
	return (
		<div style={{minHeight: 'calc(100% - 89px)', background: 'white'}}>

			<SearchBanner
				detailsType={detailsType}
				titleBarModule={'details/detailsTitleBarHandler'}
				rawSearchResults={[]}
			>
			</SearchBanner>
			
			{showEntityContainer &&
				renderEntityContainer()
			}
			
			{showTopicContainer &&
				renderTopicContainer()
			}
			
			{showDocumentContainer &&
				<DocumentDetailsPage document={document} cloneData={cloneData} runningQuery={runningQuery}
									 graphData={graph}
				/>
			}
			
		</div>
	);
};

const styles = {
	entityColWidth: {
		maxWidth: '100px',
		width: '100px',
		whiteSpace: 'nowrap',
		overflowWrap: 'anywhere',
		textOverflow: 'ellipsis',
		textAlign: 'left'
	},
	topicColWidth: {
		maxWidth: '900px',
		width: '200px',
		whiteSpace: 'nowrap',
		overflowWrap: 'anywhere',
		textOverflow: 'ellipsis',
		textAlign: 'left'
	},
	resultsCount: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#131E43',
		paddingTop: '10px'
	},
}

export default GameChangerDetailsPage;
