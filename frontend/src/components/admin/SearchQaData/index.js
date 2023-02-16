import React, { useState, useEffect, useCallback } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCButton from '../../common/GCButton';
import { styles } from '../util/GCAdminStyles';
import DEFAULT_COLUMNS from './default_columns';
import RESULT_SELECTED_COLUMNS from './result_selected_columns';
import documents from './testDocumentsTESTING';
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
	const [searchResults, setSearchResults] = useState([]);
	const [searching, setSearching] = useState(false);
	const [gcVersion, setGcVersion] = useState();
	const [testing, setTesting] = useState(true);

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

	const handleTests = useCallback(async () => {
		let returnedData = await gameChangerAPI.testSearch(documents);
		setSearchResults(returnedData.data);
	}, []);

	useEffect(() => {
		let tmpColumns = selected ? [...RESULT_SELECTED_COLUMNS] : [...DEFAULT_COLUMNS];
		gameChangerAPI.getSearchTestResults().then(({ data }) => {
			setResults(data);
		});

		setTableColumns(tmpColumns);
	}, [resultSelected, searching, selected]);

	useEffect(() => {
		if (searchResults.length < 1) return;
		let totalAvg = 0;
		let totalDocsNotFound = 0;
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
	}, [gcVersion, searchResults]);

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
					{testing && (
						<GCButton
							onClick={useCallback(() => {
								gameChangerAPI.resetSearchTestResults();
							}, [])}
							style={{ minWidth: 'unset' }}
						>
							RESET TABLE
						</GCButton>
					)}
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
			</div>
		</>
	);
};
