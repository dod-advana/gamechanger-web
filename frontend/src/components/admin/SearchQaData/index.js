import React, { useState, useEffect, useCallback } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCButton from '../../common/GCButton';
import { styles } from '../util/GCAdminStyles';
import DEFAULT_COLUMNS from './default_columns';
import RESULT_SELECTED_COLUMNS from './result_selected_columns';
import data from './testData';
// import searchTests from './searchTests';
import documents from './testDocumentsTESTING';

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

	async function handleTests() {
		let testSource;
		for (const source in documents) {
			let positionSum = 0;
			testSource = {
				source: source,
				number_of_documents_tested: 0,
				number_of_documents_not_found: 0,
				number_of_docuemnts_found: 0,
				average_position: 0,
			};
			for (const element of documents[source]) {
				let term = { searchText: element.metaData.title };
				let searchResults = await searchTests(term);
				let position = searchResults.position;
				let allResults = searchResults.results;
				testSource.number_of_documents_tested++;
				console.log('allresults', allResults);
				if (position >= 0) {
					testSource.number_of_docuemnts_found++;
				} else {
					testSource.number_of_documents_not_found++;
				}
				positionSum += position;
			}
			testSource.average_position = positionSum / testSource.number_of_documents_tested;
			setSearchResults([...searchResults, testSource]);
		}
		// return results;
	}

	// The table columns : timestamp, GC version, JBOOK average score, Policy average score, EDA average score, Total average score
	useEffect(() => {
		let tmpColumns = selected ? [...RESULT_SELECTED_COLUMNS] : [...DEFAULT_COLUMNS];
		gameChangerAPI.getSearchTestResults().then(({ data }) => {
			setResults(data);
		});

		setTableColumns(tmpColumns);
	}, [resultSelected, refresh, selected]);

	useEffect(() => {
		console.log(searchResults);
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
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div style={{ paddingTop: '10px' }}>
					GC Version: <input />
				</div>
				<GCButton
					onClick={useCallback(() => {
						//Run test
						handleTests();
						// data.forEach((row) => {
						// 	gameChangerAPI.postSearchTestResults(row);
						// });
						setRefresh(!refresh);
						// eslint-disable-next-line react-hooks/exhaustive-deps
					}, [])}
					style={{ minWidth: 'unset' }}
				>
					Run Test
				</GCButton>
				<GCButton
					onClick={useCallback(() => {
						gameChangerAPI.resetSearchTestResults();
						// setRefresh(!refresh);
						// eslint-disable-next-line react-hooks/exhaustive-deps
					}, [])}
					style={{ minWidth: 'unset' }}
				>
					RESET TABLE
				</GCButton>
			</div>
			<div onClick={useCallback(handleRowSelected, [])}>
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
			</div>
		</>
	);
};

function searchTests(term) {
	let position = -1;
	gameChangerAPI
		.testSearch(term)
		.then((data) => {
			if (data.data === '') {
				position = 404;
			} else {
				position = resultsPositionLocator(data.data.docs, term.searchText, 'title');
			}
			console.log(data.data.docs);
			return { position: position, results: data.data.docs };
		})
		.catch((e) => {
			console.log('This is bad', e);
		});

	return 'Something Broke';
}

function resultsPositionLocator(results, expectedResult, metaDataSearched) {
	let position = results.findIndex((el) => el[metaDataSearched] === expectedResult);
	return position >= 0 ? position + 1 : 404;
}
