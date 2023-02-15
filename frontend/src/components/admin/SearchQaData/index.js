import React, { useState, useEffect, useCallback } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCButton from '../../common/GCButton';
import { styles } from '../util/GCAdminStyles';
import DEFAULT_COLUMNS from './default_columns';
import RESULT_SELECTED_COLUMNS from './result_selected_columns';
import documents from './testDocuments';
import LoadingBar from '../../common/LoadingBar';

const gameChangerAPI = new GameChangerAPI();

/**
 *
 * @class SearchQaData
 */
export default () => {
	// Component Properties

	const [tableColumns, setTableColumns] = useState([]);
	const [resultSelected, setResultSelected] = useState(false);
	const [selected, setSelected] = useState();
	const [results, setResults] = useState();
	const [refresh, setRefresh] = useState(false);
	const [searchResults, setSearchResults] = useState([]);
	const [searching, setSearching] = useState(false);
	const [gcVersion, setGcVersion] = useState();
	const [currentSearch, setCurrentSearch] = useState();

	function handleRowSelected(e) {
		if (e.target.className.includes('test-id')) {
			setSelected(e.target.textContent);
			setResultSelected(true);
		}
	}

	function handleBackSelected() {
		if (resultSelected) {
			setSelected(null);
			setResultSelected(false);
		}
	}

	function handleGcVersionChange(e) {
		setGcVersion(e.target.value);
	}

	//Calls the API to run the test and receive the data
	let searchTests = useCallback(async (source) => {
		let positionSum = 0;
		let sourceData = {
			source: 'source',
			number_of_documents_tested: 0,
			number_of_documents_not_found: 0,
			number_of_documents_found: 0,
			average_position: 0,
		};
		for (const element of documents[source]) {
			let term = { searchText: element.metaData[element.searchText] };
			setCurrentSearch(term.searchText);
			let data = await gameChangerAPI.testSearch(term);

			positionSum += handleAPI(data, source, term, sourceData, element);
		}
		sourceData.average_position = sourceData.number_of_documents_found
			? positionSum / sourceData.number_of_documents_found
			: 0;
		return sourceData;
	}, []);

	//Loops through the sources and runs searchTests with each source
	let handleTests = useCallback(async () => {
		let results = [];
		let start = performance.now();
		for (const source in documents) {
			results.push(await searchTests(source));
		}
		console.log(`Finished in ${Math.floor((performance.now() - start) / 1000)}`);
		setSearchResults(results);
	}, [searchTests]);

	//Handles the data gathered in searchTests and changes it to the format needed to push it to the database
	function handleAPI(data, source, term, sourceData, element) {
		let position = 0;

		sourceData.source = source;
		sourceData.number_of_documents_tested++;
		if (data.data === '' || data.data.docs.length < 1) {
			sourceData.number_of_documents_not_found++;
		} else {
			position = resultsPositionLocator(data.data.docs, term.searchText, element.searchText);
			if (position === 0) {
				sourceData.number_of_documents_not_found++;
			} else {
				sourceData.number_of_documents_found++;
			}
		}

		console.log(`Searching ${source}`);
		return position;
	}

	useEffect(() => {
		let tmpColumns = selected ? [...RESULT_SELECTED_COLUMNS] : [...DEFAULT_COLUMNS];
		gameChangerAPI.getSearchTestResults().then(({ data }) => {
			setResults(data);
		});

		setTableColumns(tmpColumns);
	}, [resultSelected, refresh, selected]);

	useEffect(() => {
		if (searchResults.length < 1) return;
		let totalAvg = 0;
		let totalDocsNotFound = 0;
		console.log(searchResults);
		searchResults.forEach((el) => {
			totalAvg += el.average_position;
			totalDocsNotFound += el.number_of_documents_not_found;
		});
		gameChangerAPI.postSearchTestResults({
			gc_version: gcVersion,
			timestamp: Date.now(),
			source_results: searchResults,
			total_average: Math.floor(totalAvg / searchResults.length),
			total_number_of_documents_not_found: totalDocsNotFound,
		});
		setSearching(false);
		setRefresh(!refresh);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchResults]);

	// Component Methods

	return (
		<>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					margin: '10px 80px',
				}}
			>
				<p
					style={{
						...styles.sectionHeader,
						marginLeft: 0,
						marginTop: 10,
						cursor: resultSelected ? 'pointer' : 'auto',
					}}
					onClick={handleBackSelected}
				>
					{resultSelected ? '<<' : 'Search Test Results'}
				</p>
				<div style={{ display: 'flex' }}>
					<div style={{ paddingTop: '10px' }}>
						GC Version: <input value={gcVersion} onChange={handleGcVersionChange} />
					</div>
					<GCButton
						onClick={useCallback(() => {
							//Run test
							if (gcVersion) {
								handleTests();
								setSearching(true);
							}
						}, [gcVersion, handleTests])}
						disabled={searching || !gcVersion}
						style={{ minWidth: 'unset' }}
					>
						Run Test
					</GCButton>
					{/* <GCButton
					onClick={useCallback(() => {
						gameChangerAPI.resetSearchTestResults();
					}, [])}
					style={{ minWidth: 'unset' }}
					>
					RESET TABLE
				</GCButton> */}
				</div>
			</div>
			<div onClick={useCallback(handleRowSelected, [])}>
				<LoadingBar loading={searching} />
				<ReactTable
					data={
						resultSelected
							? results[
									results.findIndex((el) => {
										return el.test_id.toString() === selected;
									})
							  ].source_results
							: results
					}
					columns={tableColumns}
					style={{ margin: '0 80px 20px 80px', height: 600 }}
					defaultPageSize={10}
					filterable={true}
					defaultFilterMethod={useCallback(
						(filter, row) => String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase()),
						[]
					)}
					defaultSorted={[
						{
							id: 'timestamp',
							desc: false,
						},
					]}
				/>
				{searching && <div>{'Searching for: ' + currentSearch}</div>}
			</div>
		</>
	);
};

function resultsPositionLocator(results, expectedResult, metaDataSearched) {
	let position = results.findIndex((el) => el[metaDataSearched] === expectedResult);
	return position >= 0 ? position + 1 : 0;
}
