import React, { useState, useEffect, useCallback } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCButton from '../../common/GCButton';
import { styles } from '../util/GCAdminStyles';
import DEFAULT_COLUMNS from './default_columns';
import RESULT_SELECTED_COLUMNS from './result_selected_columns';
import data from './testData';
import searchTests from './searchTests';

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

	function handleTests() {
		return searchTests();
	}

	// The table columns : timestamp, GC version, JBOOK average score, Policy average score, EDA average score, Total average score
	useEffect(() => {
		let tmpColumns = selected ? [...RESULT_SELECTED_COLUMNS] : [...DEFAULT_COLUMNS];
		gameChangerAPI.getSearchTestResults().then(({ data }) => {
			setResults(data);
		});

		setTableColumns(tmpColumns);
	}, [resultSelected, refresh, selected]);

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
						console.log('final', handleTests());
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
