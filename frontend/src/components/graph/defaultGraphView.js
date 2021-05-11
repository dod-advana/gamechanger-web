import React, {useEffect, useState} from 'react';
import NodeClusterView from "./GCNodeClusterView";
import {getOrgToOrgQuery, getTypeQuery, SEARCH_TYPES} from "../../gamechangerUtils";
import {getSearchObjectFromString, setState} from "../../sharedFunctions";
import GameChangerAPI from "../api/gameChanger-service-api";

const gameChangerAPI = new GameChangerAPI();

const getGraphData = async (setRunningSearch, setGraphResultsFound, graphResultsFound, setGraph, setNoSearches, state, dispatch) => {
	setState(dispatch, {runGraphSearch: false});
	setRunningSearch(true);
	
	const {
		searchText = "",
		esIndex,
		searchSettings,
		cloneData
	} = state;
	
	const {
		orgFilter,
		searchFields,
		accessDateFilter,
		publicationDateFilter,
		publicationDateAllTime,
		allOrgsSelected,
		searchType,
		includeRevoked,
		allTypesSelected,
		typeFilter,
	} = searchSettings;
	
	const searchObject = getSearchObjectFromString(searchText);
	const transformResults = searchType === SEARCH_TYPES.contextual;
	const useGCCache = JSON.parse(localStorage.getItem('useGCCache'));
	let modifiedOrgFilter = allOrgsSelected ? {} : orgFilter;
	let modifiedTypeFilter = allTypesSelected ? {} : typeFilter;
	const orgFilterString = getOrgToOrgQuery(allOrgsSelected, orgFilter, 'graph');
	const typeFilterString = getTypeQuery(allTypesSelected, typeFilter, 'graph');
	
	try {
		const gT0 = new Date().getTime();
		setGraphResultsFound(false)
		const graphResp = await gameChangerAPI.graphSearchPOST(
			{
				cloneName: cloneData.clone_name,
				searchText: searchObject.search,
				options: {
					orgFilterString,
					typeFilterString,
					transformResults,
					cloneData,
					index: esIndex,
					orgFilter: modifiedOrgFilter,
					typeFilter: modifiedTypeFilter,
					useGCCache,
					searchFields,
					accessDateFilter,
					publicationDateFilter,
					publicationDateAllTime,
					includeRevoked
				}
			});
		if (graphResultsFound) return;

		const {graphData = {}} = graphResp?.data ?? {};
		
		const gT1 = new Date().getTime();
		
		if (graphData.nodes.length > 0) {
			setGraph({...graphData, timeFound: ((gT1 - gT0) / 1000)});
			setRunningSearch(false);
			setGraphResultsFound(true);
			setNoSearches(false);
		} else {
			setGraph({nodes: [], edges: []});
			setRunningSearch(false);
			setGraphResultsFound(true);
			setNoSearches(true);
		}
	} catch (err) {
		console.log(err);
	}
}

const DefaultGraphView = (props) => {

	const {context} = props;
	const {state, dispatch} = context;
	
	const [graphResultsFound, setGraphResultsFound] = useState(false);
	const [runningSearch, setRunningSearch] = useState(false);
	const [noSearches, setNoSearches] = useState(true);
	const [graph, setGraph] = useState({ nodes: [], edges: [], timeFound: 0 });
	
	useEffect (() => {
		if (state.runGraphSearch) {
			getGraphData(setRunningSearch, setGraphResultsFound, graphResultsFound, setGraph, setNoSearches, state, dispatch);
		}
	}, [state, graphResultsFound, dispatch])
	
	return (
		<>
			<NodeClusterView
				graphData={graph}
				runningSearch={runningSearch}
				searchText={state.searchText}
				componentStepNumbers={state.componentStepNumbers}
				resetGraph={state.isResetting}
				noSearches={noSearches}
				notificationCountProp={state.notifications.length}
				expansionTerms={state.hasExpansionTerms}
				state={state}
				dispatch={dispatch}
			/>
		</>
	);
};

export default DefaultGraphView;
