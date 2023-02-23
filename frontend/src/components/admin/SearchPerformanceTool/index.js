import React, { useState, useEffect, useCallback } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCButton from '../../common/GCButton';
import { styles } from '../util/GCAdminStyles';
import DEFAULT_COLUMNS from './default_columns';
import RESULT_SELECTED_COLUMNS from './result_selected_columns';
import DOCUMENTS_TAB_SELECTED_COLUMNS from './documents_tab_selected_columns';
import documents from './testDocuments';
import LoadingBar from '../../common/LoadingBar';

const gameChangerAPI = new GameChangerAPI();

/**
 *
 * @class SearchQaData
 */
export default () => {
	//Data states
	const [results, setResults] = useState();
	const [metrics, setMetrics] = useState();
	const [gcVersion, setGcVersion] = useState();
	//Search States | used for posting to database
	const [searchResults, setSearchResults] = useState([]);
	const [docMetrics, setDocMetrics] = useState([]);
	//Table states
	const [tableColumns, setTableColumns] = useState([]);
	const [tableData, setTableData] = useState(results);
	//Table selection states
	const [selected, setSelected] = useState();
	const [selectedTab, setSelectedTab] = useState('Sources');
	//Boolean states
	const [searching, setSearching] = useState(false);
	const [resultSelected, setResultSelected] = useState(false);
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
			setMetrics(
				results[
					results.findIndex((el) => {
						return el.test_id.toString() === e.target.textContent;
					})
				].source_results.docMetrics
			);
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

	//This creates an object from the document metrics that can easily be read by the table
	function documentWrapper(docs) {
		let wrappedDocuments = [];
		for (const doc in docs) {
			let document = {
				document: doc,
				title: docs[doc].title,
				doc_num: docs[doc].doc_num,
				filename: docs[doc].filename,
				display_title_s: docs[doc].display_title_s,
			};
			wrappedDocuments.push(document);
		}
		return wrappedDocuments;
	}

	const handleTests = useCallback(async () => {
		let returnedData = await gameChangerAPI.testSearch(documents);
		setSearchResults(returnedData.data.results);
		setDocMetrics(returnedData.data.docMetrics);
	}, []);

	//This useEffect is here to update the table on load as well as whenever a test completes
	useEffect(() => {
		let tmpColumns;
		if (selected) {
			if (selectedTab === 'Sources') {
				tmpColumns = [...RESULT_SELECTED_COLUMNS];
				setTableData(
					results[
						results.findIndex((el) => {
							return el.test_id.toString() === selected;
						})
					].source_results.searchResults
				);
			} else {
				tmpColumns = [...DOCUMENTS_TAB_SELECTED_COLUMNS];
				setTableData(documentWrapper(metrics));
			}
		} else {
			tmpColumns = [...DEFAULT_COLUMNS];
			setTableData(results);
		}
		setTableColumns(tmpColumns);
	}, [metrics, results, selected, selectedTab]);

	useEffect(() => {
		gameChangerAPI.getSearchTestResults().then(({ data }) => {
			if (!data.length) return;
			setResults(data);
		});
	}, [searching]);

	//This useEffect submits a post whenever a search is complete
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
			<div onClick={useCallback(handleRowSelected, [results])}>
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
						data={tableData}
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
