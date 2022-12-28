import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getOrgToOrgQuery, getTypeQuery, numberWithCommas, SEARCH_TYPES } from '../../utils/gamechangerUtils';
import { getSearchObjectFromString, setState } from '../../utils/sharedFunctions';
import GameChangerAPI from '../api/gameChanger-service-api';
import { MemoizedPolicyGraphView } from './policyGraphView';
import ViewHeader from '../mainView/ViewHeader';
import _ from 'lodash';

const gameChangerAPI = new GameChangerAPI();
let mostRecentSearchTS = 0;

const getGraphData = async (
	setRunningSearch,
	setGraph,
	setNoSearches,
	setNodeLimit,
	setMockedFromES,
	state,
	dispatch
) => {
	setState(dispatch, { runGraphSearch: false });
	setRunningSearch(true);

	const { searchText = '', esIndex, searchSettings, cloneData } = state;

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
		loadAll,
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
		mostRecentSearchTS = gT0;

		const graphResp = await gameChangerAPI.graphSearchPOST({
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
				includeRevoked,
				loadAll,
			},
		});

		if (gT0 < mostRecentSearchTS) return;

		const { graphData = {} } = graphResp?.data ?? {};

		const gT1 = new Date().getTime();

		if (graphData.nodes?.length > 0) {
			setGraph({ ...graphData, timeFound: (gT1 - gT0) / 1000 });
			setRunningSearch(false);
			setNoSearches(false);
		} else {
			setGraph({ nodes: [], edges: [] });
			setRunningSearch(false);
			setNoSearches(true);
		}
		setNodeLimit(graphResp?.data?.query?.limit);
		setMockedFromES(graphResp?.data?.query?.query === 'Mocked from ES');
	} catch (err) {
		console.log(err);
	}
};

const DefaultGraphView = (props) => {
	const { context } = props;
	const { state, dispatch } = context;

	const [runningSearch, setRunningSearch] = useState(false);
	const [noSearches, setNoSearches] = useState(true);
	const [graph, setGraph] = useState({ nodes: [], edges: [], timeFound: 0 });
	const [documentsFound, setDocumentsFound] = React.useState(0);
	const [timeFound, setTimeFound] = React.useState('0');
	const [numOfEdges, setNumOfEdges] = React.useState(0);
	const [nodeLimit, setNodeLimit] = useState();
	const [mockedFromES, setMockedFromES] = useState(false);

	const [width, setWidth] = React.useState(window.innerWidth * (((state.showSideFilters ? 68.5 : 90.5) - 1) / 100));
	const [height, setHeight] = React.useState(window.innerHeight * 0.75);

	useEffect(() => {
		setWidth(window.innerWidth * (((state.showSideFilters ? 68.5 : 90.5) - 1) / 100));
		setHeight(window.innerHeight * 0.75);
	}, [state]);

	useEffect(() => {
		if (state.runGraphSearch) {
			getGraphData(setRunningSearch, setGraph, setNoSearches, setNodeLimit, setMockedFromES, state, dispatch);
			const newSearchSettings = _.cloneDeep(state.searchSettings);
			newSearchSettings.loadAll = false;
			setState(dispatch, { searchSettings: newSearchSettings });
		}
	}, [state, dispatch]);

	const resultsText = runningSearch
		? 'Running search...'
		: noSearches
		? 'Make a search to see the graph network'
		: `${numberWithCommas(documentsFound)} document nodes and ${numberWithCommas(
				numOfEdges
		  )} edges returned in ${timeFound} seconds`;

	return (
		<div style={{ ...styles.graphContainer, height: '100%' }}>
			<ViewHeader context={context} resultsText={resultsText} />
			{/* <div style={styles.resultsText}>
				{resultsText}
			</div> */}
			<MemoizedPolicyGraphView
				width={width}
				height={height}
				graphData={graph}
				runningSearchProp={runningSearch}
				setDocumentsFound={setDocumentsFound}
				setTimeFound={setTimeFound}
				cloneData={state.cloneData}
				setNumOfEdges={setNumOfEdges}
				dispatch={dispatch}
				searchText={state.searchText}
				selectedDocuments={state.selectedDocumentsForGraph}
				loadAll={() => {
					setState(dispatch, {
						searchSettings: { ...state.searchSettings, loadAll: true },
						runGraphSearch: true,
					});
				}}
				nodeLimit={nodeLimit}
				mockedFromES={mockedFromES}
			/>
		</div>
	);
};

const styles = {
	graphContainer: {
		alignItems: 'center',
		width: 'unset',
		height: '800px',
		margin: '0',
	},
	resultsText: {
		display: 'inline-block',
		fontWeight: 'bold',
		zIndex: 1,
		fontSize: 22,
		color: '#131E43',
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		padding: '10px 6px 6px 6px',
		borderRadius: '3px',
	},
};

DefaultGraphView.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			showSideFilters: PropTypes.bool.isRequired,
			runGraphSearch: PropTypes.bool,
			notifications: PropTypes.array,
			cloneData: PropTypes.object,
			hasExpansionTerms: PropTypes.bool,
			searchText: PropTypes.string,
		}),
	}),
	dispatch: PropTypes.func,
};

export default DefaultGraphView;
