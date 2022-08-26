import React, { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import GameChangerAPI from '../api/gameChanger-service-api';
import Paper from '@material-ui/core/Paper';
import SimpleTable from '../common/SimpleTable';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { gcColors } from '../../containers/GameChangerPage';
import GCAccordion from '../common/GCAccordion';
import GCButton from '../common/GCButton';
import GCErrorSnackbar from '../common/GCErrorSnackbar';
import { MainContainer } from '../../containers/GameChangerDetailsPage';
import { MemoizedPolicyGraphView } from '../graph/policyGraphView';
import { trackEvent } from '../telemetry/Matomo';
import Pagination from 'react-js-pagination';
import { getTrackingNameForFactory, policyMetadata, getMetadataForPropertyTable } from '../../utils/gamechangerUtils';
import { Card } from '../cards/GCCard';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import '../../containers/gamechanger.css';
import { addFavoriteTopicToMetadata } from '../modules/policy/policyCardHandler';

const gameChangerAPI = new GameChangerAPI();

const colWidth = {
	maxWidth: '900px',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	overflowWrap: 'anywhere',
};

const RESULTS_PER_PAGE = 10;

const getGraphDataFull = (cloneName, document, setGraphData, setRunningQuery, setBackendError) => {
	gameChangerAPI
		.callGraphFunction({
			functionName: 'getDocumentDetailsPageDataFull',
			cloneName: cloneName,
			options: {
				doc_id: document.id,
			},
		})
		.then((graph) => {
			if (graph?.data?.error) setBackendError(graph.data.error);
			setGraphData(graph.data.graph);
			setRunningQuery(false);
		});
};

const emptyObject = {};

const DocumentDetailsPage = (props) => {
	const { document, cloneData, userData, rawSearchResults } = props;

	const defaultFunction = useCallback(() => {
		return;
	}, []);

	const ref = useRef(null);

	const [runningQuery, setRunningQuery] = useState(false);
	const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
	const [metadata, setMetadata] = useState(document?.detail);

	const [similarDocs, setSimilarDocs] = useState({
		docCount: 0,
		timeFound: '0.0',
		docs: [],
	});
	const [runningSimilarDocsQuery, setRunningSimilarDocsQuery] = useState(true);
	const [similarDocsPage, setSimilarDocsPage] = useState(1);

	const [docsReferenced, setDocsReferenced] = useState({
		docCount: 0,
		timeFound: '0.0',
		docs: [],
	});
	const [runningDocsReferencedQuery, setRunningDocsReferencedQuery] = useState(true);
	const [docsReferencedPage, setDocsReferencedPage] = useState(1);

	const [referencedByDocs, setReferencedByDocs] = useState({
		docCount: 0,
		timeFound: '0.0',
		docs: [],
	});
	const [runningReferencedByDocsQuery, setRunningReferencedByDocsQuery] = useState(true);
	const [referencedByDocsPage, setReferencedByDocsPage] = useState(1);

	const [backendError, setBackendError] = useState({});

	const [notInCorpusDocs, setNotInCorpusDocs] = useState(0);
	const [refList, setRefList] = useState([]);

	useEffect(() => {
		if (document?.refList) {
			const newList = [];
			document.ref_list.forEach((localRef) => {
				newList.push({ References: localRef });
			});
			setRefList(newList);
		}

		if (document) {
			const data = getMetadataForPropertyTable(document);
			let favoritableData = policyMetadata(document);
			favoritableData = [
				...favoritableData,
				...addFavoriteTopicToMetadata(data, userData, {}, cloneData, '', '150px'),
			];
			setMetadata(favoritableData);
		}
	}, [cloneData, document, userData]);

	useEffect(() => {
		if (document) {
			const docs = document?.ref_list.filter((doc) => {
				return notInCorpusHelper(doc);
			});
			setNotInCorpusDocs(docs);
		}
	}, [docsReferenced.docs, document]);

	useEffect(() => {
		setRunningQuery(true);
	}, [document]);

	useEffect(() => {
		if (!document || !cloneData) return;
		getGraphDataFull(cloneData.clone_name, document, setGraphData, setRunningQuery, setBackendError);
	}, [document, cloneData]);

	useEffect(() => {
		if (!graphData.nodes.length > 0 || !cloneData) return;

		// Find doc Ids to get the docs that are similar to
		let docIdSet = new Set();
		const docsMap = {
			similar_to: new Set(),
			references: new Set(),
			referencedBy: new Set(),
		};
		const nodeIdMap = {};
		for (const node of graphData.nodes) {
			nodeIdMap[node.id] = node;
		}
		graphData.edges.forEach((edge) => {
			buildDocMap(edge, nodeIdMap, docsMap, docIdSet);
		});

		let docIds = Array.from(docIdSet);

		// Limits number of documents that will be requested from Elasticsearch:
		// Express request sizes are limited by size in memory (100kb) rather than
		// count, so 1000 has been chosen as a reasonable limit that is not expected
		// to approach 100kb even for documents with long titles

		if (docIds.length > 1000) {
			docIds = docIds.slice(0, 1000);
		}

		let t0 = new Date().getTime();
		if (docIds.length > 0) {
			gameChangerAPI
				.callSearchFunction({
					functionName: 'getSingleDocumentFromES',
					cloneName: cloneData.clone_name,
					options: {
						docIds: docIds,
					},
				})
				.then((resp) => {
					const t1 = new Date().getTime();
					const filteredSimilarDocs = resp.data.docs.filter((doc) => {
						return docsMap.similar_to.has(doc.id);
					});
					const filteredReferencesDocs = resp.data.docs.filter((doc) => {
						return docsMap.references.has(doc.id);
					});
					const filteredReferencedByDocs = resp.data.docs.filter((doc) => {
						return docsMap.referencedBy.has(doc.id);
					});
					setSimilarDocs({
						timeFound: ((t1 - t0) / 1000).toFixed(2),
						docs: filteredSimilarDocs,
						docCount: filteredSimilarDocs.length,
					});
					setDocsReferenced({
						timeFound: ((t1 - t0) / 1000).toFixed(2),
						docs: filteredReferencesDocs,
						docCount: filteredReferencesDocs.length,
					});
					setReferencedByDocs({
						timeFound: ((t1 - t0) / 1000).toFixed(2),
						docs: filteredReferencedByDocs,
						docCount: filteredReferencedByDocs.length,
					});
					setRunningSimilarDocsQuery(false);
					setRunningDocsReferencedQuery(false);
					setRunningReferencedByDocsQuery(false);
				});
		} else {
			const t1 = new Date().getTime();
			setRunningSimilarDocsQuery(false);
			setRunningDocsReferencedQuery(false);
			setRunningReferencedByDocsQuery(false);
			setSimilarDocs({
				timeFound: ((t1 - t0) / 1000).toFixed(2),
				docs: [],
				docCount: 0,
			});
			setReferencedByDocs({
				timeFound: ((t1 - t0) / 1000).toFixed(2),
				docs: [],
				docCount: 0,
			});
			setDocsReferenced({
				timeFound: ((t1 - t0) / 1000).toFixed(2),
				docs: [],
				docCount: 0,
			});
		}
	}, [graphData, cloneData, document]);

	const handleChangeDocsPage = (section, page) => {
		switch (section) {
			case 'similarDocs':
				setSimilarDocsPage(page);
				break;
			case 'docsReferenced':
				setDocsReferencedPage(page);
				break;
			case 'referencedByDocs':
				setReferencedByDocsPage(page);
				break;
			default:
				break;
		}
	};

	const buildDocMap = (edge, nodeIdMap, docsMap, docIdSet) => {
		if (edge.label === 'REFERENCES' || edge.label === 'SIMILAR_TO') {
			const target = nodeIdMap[edge.target] ? nodeIdMap[edge.target].doc_id : '';
			const source = nodeIdMap[edge.source] ? nodeIdMap[edge.source].doc_id : '';

			if (source === document.id && edge.label === 'SIMILAR_TO') {
				docsMap.similar_to.add(target);
			}

			if (source === document.id && edge.label === 'REFERENCES') {
				docsMap.references.add(target);
			}

			if (target === document.id && edge.label === 'REFERENCES') {
				docsMap.referencedBy.add(source);
			}

			docIdSet.add(target);
			docIdSet.add(source);
		}
	};

	const addNotInCorpusDocs = (documentObj, localNotInCorpusDocs, docsVisible, emptyDoc) => {
		for (
			let i = docsReferencedPage * 10 - documentObj.docCount - 10;
			i < docsReferencedPage * 10 - documentObj.docCount;
			i++
		) {
			const invalidIndex = i < 0 || !localNotInCorpusDocs[i];
			if (invalidIndex) continue;
			docsVisible.push({
				...emptyDoc,
				display_title_s: localNotInCorpusDocs[i],
				type: 'document',
				notInCorpus: true,
			});
		}
	};

	const notInCorpusHelper = (doc) => {
		return (
			!docsReferenced.docs.find((localRef) => localRef.display_title_s.includes(doc)) &&
			!document.display_title_s.includes(doc)
		);
	};

	const renderDocs = (documentObj = {}, docPage = 0, section = '', queryInProgress = true) => {
		let docsVisible = [];

		switch (section) {
			case 'similarDocs':
				docsVisible = similarDocs.docs.slice((docPage - 1) * RESULTS_PER_PAGE, docPage * RESULTS_PER_PAGE + 1);
				break;
			case 'docsReferenced':
				docsVisible = docsReferenced.docs.slice(
					(docPage - 1) * RESULTS_PER_PAGE,
					docPage * RESULTS_PER_PAGE + 1
				);
				const localNotInCorpusDocs = document?.ref_list.filter((doc) => {
					return notInCorpusHelper(doc);
				});
				const emptyDoc = { ...document };
				Object.keys(emptyDoc).forEach((prop) => (emptyDoc[prop] = null));
				if (localNotInCorpusDocs) {
					addNotInCorpusDocs(documentObj, localNotInCorpusDocs, docsVisible, emptyDoc);
				}
				break;
			case 'referencedByDocs':
				docsVisible = referencedByDocs.docs.slice(
					(docPage - 1) * RESULTS_PER_PAGE,
					docPage * RESULTS_PER_PAGE + 1
				);
				break;
			default:
				break;
		}

		const renderDocsHelper = () => {
			return docsVisible.map((item, idx) => {
				return (
					<Card
						key={idx}
						item={item}
						idx={idx}
						state={{
							cloneData,
							selectedDocuments: new Map(),
							componentStepNumbers: {},
							listView: true,
							showSideFilters: false,
							userData,
							rawSearchResults,
						}}
						dispatch={() => {
							return;
						}}
					/>
				);
			});
		};

		const renderDisplay = () => {
			const totalDocCount = documentObj.docCount + notInCorpusDocs.length;
			if (queryInProgress) {
				return (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={gcColors.buttonColor2} />
					</div>
				);
			} else if (totalDocCount === 0) {
				return <div style={styles.noResults}>No Documents Found</div>;
			}
		};

		return (
			<div className={`related-documents`} style={{ width: '100%' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<div style={{ display: 'flex' }} className={'gcPagination'}>
						{!queryInProgress && documentObj.docCount > 0 && (
							<Pagination
								activePage={docPage}
								itemsCountPerPage={10}
								totalItemsCount={
									section === 'docsReferenced'
										? notInCorpusDocs?.length + documentObj.docCount
										: documentObj.docCount
								}
								pageRangeDisplayed={8}
								onChange={(page) => {
									trackEvent(
										getTrackingNameForFactory(cloneData.clone_name),
										'DetailsPaginationChanged',
										'page',
										page
									);
									handleChangeDocsPage(section, page);
								}}
							/>
						)}
					</div>
				</div>
				<div className="row" style={{ width: 'unset', marginLeft: 0 }}>
					{renderDisplay() || renderDocsHelper()}
				</div>
			</div>
		);
	};

	return (
		<div>
			<p style={{ margin: '10px 4%', fontSize: 18 }}>
				Welcome to our new Document Details page! As you look around, you may note some technical issues below;
				please bear with us while we continue making improvements here and check back often for a more stable
				version.
			</p>
			<MainContainer>
				<div className={'details'}>
					<Paper>
						<div className={'name'}>{document?.display_title_s || 'Loading...'}</div>

						<div>
							<GCButton
								onClick={(e) => {
									e.preventDefault();
									const isDLA = document.display_org_s === 'Defense Logistics Agency';
									trackEvent(
										getTrackingNameForFactory(cloneData?.clone_name),
										'CardInteraction',
										'PDFOpen'
									);
									window.open(
										`/#/pdfviewer/gamechanger?filename=${document?.filename}&cloneIndex=${
											cloneData?.clone_name
										}${isDLA ? '&sourceUrl=dla' : ''}`
									);
								}}
								style={{
									height: 40,
									width: '75%',
									fontSize: 14,
									margin: '16px 0px',
								}}
								disabled={!document}
							>
								OPEN DOCUMENT
							</GCButton>
						</div>

						<div className={'details-header'}>
							<span>{'DOCUMENT DETAILS'}</span>
						</div>

						<div className={'details-table'}>
							<div>
								{document ? (
									<>
										<SimpleTable
											tableClass={'magellan-table'}
											zoom={1}
											headerExtraStyle={{
												backgroundColor: '#313541',
												color: 'white',
											}}
											rows={metadata || []}
											height={'auto'}
											colWidth={colWidth}
											disableWrap={true}
											title={'Metadata'}
											hideHeader={true}
										/>
										<SimpleTable
											tableClass={'magellan-table'}
											zoom={1}
											headerExtraStyle={{
												backgroundColor: '#313541',
												color: 'white',
											}}
											rows={refList}
											height={'auto'}
											maxHeight={500}
											colWidth={{ minWidth: '25%', maxWidth: '25%' }}
											disableWrap={true}
										/>
									</>
								) : (
									<div style={{ margin: '0 auto' }}>
										<LoadingIndicator customColor={gcColors.buttonColor2} />
									</div>
								)}
							</div>
						</div>
					</Paper>
				</div>
				<div className={'graph-top-docs'}>
					<div className={'section'} ref={ref}>
						<GCAccordion expanded={true} header={'GRAPH VIEW (BETA)'} backgroundColor={'rgb(238,241,242)'}>
							<MemoizedPolicyGraphView
								width={ref?.current?.clientWidth ? ref.current.clientWidth - 25 : undefined}
								graphData={graphData}
								runningSearchProp={runningQuery}
								setDocumentsFound={defaultFunction}
								setTimeFound={defaultFunction}
								cloneData={cloneData}
								setNumOfEdges={defaultFunction}
								dispatch={emptyObject}
								showBasic={false}
								searchText={''}
								detailsView={true}
							/>
						</GCAccordion>
					</div>

					<div className={'section'}>
						<GCAccordion
							expanded={false}
							header={'SIMILAR DOCUMENTS'}
							itemCount={similarDocs.docs.length || 0}
							backgroundColor={'rgb(238,241,242)'}
						>
							{renderDocs(similarDocs, similarDocsPage, 'similarDocs', runningSimilarDocsQuery)}
						</GCAccordion>
					</div>

					<div className={'section'}>
						<GCAccordion
							expanded={false}
							header={'DOCUMENTS REFERENCED'}
							itemCount={docsReferenced.docs.length + notInCorpusDocs.length || 0}
							backgroundColor={'rgb(238,241,242)'}
						>
							{renderDocs(
								docsReferenced,
								docsReferencedPage,
								'docsReferenced',
								runningDocsReferencedQuery
							)}
						</GCAccordion>
					</div>

					<div className={'section'}>
						<GCAccordion
							expanded={false}
							header={'DOCUMENTS REFERENCED BY'}
							itemCount={referencedByDocs.docs.length || 0}
							backgroundColor={'rgb(238,241,242)'}
						>
							{renderDocs(
								referencedByDocs,
								referencedByDocsPage,
								'referencedByDocs',
								runningReferencedByDocsQuery
							)}
						</GCAccordion>
					</div>
				</div>
			</MainContainer>

			<GCErrorSnackbar
				open={!!backendError.code}
				message={
					Permissions.isGameChangerAdmin()
						? `An error occurred with ${backendError.category}. Error code ${backendError.code}`
						: `An error has occurred in the application, but we are working to fix it!`
				}
				onClose={() => setBackendError({})}
			/>
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
		textAlign: 'left',
	},
	topicColWidth: {
		maxWidth: '900px',
		width: '200px',
		whiteSpace: 'nowrap',
		overflowWrap: 'anywhere',
		textOverflow: 'ellipsis',
		textAlign: 'left',
	},
	resultsCount: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#131E43',
		paddingTop: '15px',
	},
	noResults: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#131E43',
	},
};

DocumentDetailsPage.propTypes = {
	document: PropTypes.shape({
		id: PropTypes.string,
		display_title_s: PropTypes.string,
		details: PropTypes.array,
		refList: PropTypes.array,
	}),
	cloneData: PropTypes.shape({
		clone_name: PropTypes.string,
	}),
};
export default DocumentDetailsPage;
