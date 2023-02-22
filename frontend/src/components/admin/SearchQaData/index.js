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
	const [selectedTab, setSelectedTab] = useState('Sources');
	const [selected, setSelected] = useState();
	const [results, setResults] = useState();
	const [metrics, setMetrics] = useState();
	const [searchResults, setSearchResults] = useState([]);
	const [docMetrics, setDocMetrics] = useState([]);
	const [searching, setSearching] = useState(false);
	const [gcVersion, setGcVersion] = useState();
	const [testing, setTesting] = useState(false);

	let selectedTabStyle = {
		...styles.tabSelectedStyle,
		borderBottom: 'none !important',
		borderRadius: `5px 5px 0px 0px`,
		position: ' relative',
		listStyle: 'none',
		padding: '2px 12px',
		textAlign: 'center',
		marginRight: '2px',
		marginLeft: '2px',
		height: 45,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '174px',
	};

	let tabStyles = {
		...styles.tabStyle,
		width: '174px',
	};

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

	function handleTabClick(e) {
		setSelectedTab(e.target.textContent);
	}

	const handleTests = useCallback(async () => {
		let returnedData = await gameChangerAPI.testSearch(documents);
		setSearchResults(returnedData.data.results);
		setDocMetrics(returnedData.data.docMetrics);
	}, []);

	useEffect(() => {
		let tmpColumns = selected ? [...RESULT_SELECTED_COLUMNS] : [...DEFAULT_COLUMNS];
		gameChangerAPI.getSearchTestResults().then(({ data }) => {
			setResults(data);
			setMetrics(data[0].source_results.docMetrics);
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
			source_results: { searchResults: searchResults, docMetrics: docMetrics },
			total_average: totalAvg / searchResults.length,
			total_number_of_documents_not_found: totalDocsNotFound,
		});
		setSearching(false);
	}, [docMetrics, gcVersion, searchResults]);

	useEffect(() => {
		console.log(metrics);
	}, [metrics]);

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
				<div>
					{resultSelected && (
						<div>
							<div style={{ ...styles.tabsList, marginLeft: '78px', marginRight: '78px' }}>
								<div
									onClick={handleTabClick}
									style={selectedTab === 'Sources' ? selectedTabStyle : tabStyles}
								>
									Sources
								</div>
								<div
									onClick={handleTabClick}
									style={selectedTab === 'Documents' ? selectedTabStyle : tabStyles}
								>
									Documents
								</div>
							</div>
						</div>
					)}
					<ReactTable
						data={
							resultSelected
								? results[
										results.findIndex((el) => {
											return el.test_id.toString() === selected;
										})
								  ].source_results.searchResults
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
			</div>
		</>
	);
};
