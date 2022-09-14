import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getReferenceListMetadataPropertyTable, encode } from '../../../utils/gamechangerUtils';
import GameChangerAPI from '../../api/gameChanger-service-api';
import SimpleTable from '../../common/SimpleTable';

const gameChangerAPI = new GameChangerAPI();

const buildGraph = (resp) => {
	const graph = { nodes: [], edges: [], labels: [] };
	const nodeIds = [];
	const edgeIds = [];
	resp.data.labels.forEach((label) => {
		if (!graph.labels.includes(label)) {
			graph.labels.push(label);
		}
	});
	resp.data.nodes.forEach((node) => {
		if (!nodeIds.includes(node.id)) {
			graph.nodes.push(node);
			nodeIds.push(node.id);
		}
	});
	resp.data.edges.forEach((edge) => {
		if (!edgeIds.includes(edge.id)) {
			graph.edges.push(edge);
			edgeIds.push(edge.id);
		}
	});

	return graph;
};

const PolicyDocumentReferenceTable = ({ state, document, refList }) => {
	const { cloneData } = state;

	const [refData, setRefData] = useState();
	const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
	const [runningGraphReferencesQuery, setRunningGraphReferencesQuery] = useState(true);

	const getDocRefLinks = useCallback(
		(refList) => {
			return refList.map((reference) => {
				const found = graphData.nodes.find((doc) => `${doc.doc_type} ${doc.doc_num}` === reference);
				if (found) {
					return {
						name: reference,
						url: `/#/pdfviewer/gamechanger?filename=${encode(found.filename)}&cloneIndex=${
							cloneData.clone_name
						}&sourceUrl=${found.download_url_s}
						}`,
					};
				} else {
					return reference;
				}
			});
		},
		[graphData.nodes, cloneData.clone_name]
	);

	useEffect(() => {
		if (!document || !cloneData) return;

		const getGraphReferences = async (cloneName, document, setGraphData, setRunningGraphReferencesQuery) => {
			await gameChangerAPI
				.callGraphFunction({
					functionName: 'getReferencesPolicyGraph',
					cloneName: cloneName,
					options: {
						doc_id: document.id,
						isUnknown: false,
					},
				})
				.then((resp) => {
					if (resp?.data?.nodes?.length > 0) {
						setGraphData(buildGraph(resp));
					}
					setRunningGraphReferencesQuery(false);
				})
				.catch((e) => setRunningGraphReferencesQuery(false));
		};

		getGraphReferences(cloneData.clone_name, document, setGraphData, setRunningGraphReferencesQuery);
	}, [document, cloneData]);

	useEffect(() => {
		const refsWithLinks = getDocRefLinks(refList);
		setRefData(getReferenceListMetadataPropertyTable(refsWithLinks));
	}, [getDocRefLinks, refList, graphData]);

	return (
		<SimpleTable
			tableClass={'magellan-table'}
			zoom={1}
			headerExtraStyle={{ backgroundColor: '#313541', color: 'white', border: 'unset' }}
			rows={refData}
			height={'auto'}
			dontScroll={true}
			colWidth={{ minWidth: '25%', maxWidth: '25%' }}
			disableWrap={true}
			useParser
			loading={runningGraphReferencesQuery}
		/>
	);
};

PolicyDocumentReferenceTable.propTypes = {
	state: PropTypes.object.isRequired,
	document: PropTypes.object.isRequired,
	refList: PropTypes.array.isRequired,
};

export default PolicyDocumentReferenceTable;
