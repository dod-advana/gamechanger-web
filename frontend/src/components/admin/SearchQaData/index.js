import React, { useState, useEffect, useCallback } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCButton from '../../common/GCButton';
import { styles } from '../util/GCAdminStyles';
import DEFAULT_COLUMNS from './default_columns';
import RESULT_SELECTED_COLUMNS from './result_selected_columns';
import data from './testData';

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

	// console.log(gameChangerAPI.getCloneMeta('policy'));

	function handleRowSelected(e) {
		if (e.target.className.includes('test-id')) {
			setSelected(e.target.textContent);
			setResultSelected(true);
		}
	}

	function handleBackSelected() {
		if (resultSelected) setResultSelected(false);
	}

	// The table columns : timestamp, GC version, JBOOK average score, Policy average score, EDA average score, Total average score
	useEffect(() => {
		let tmpColumns = resultSelected ? [...RESULT_SELECTED_COLUMNS] : [...DEFAULT_COLUMNS];

		setTableColumns(tmpColumns);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resultSelected]);

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
					}, [])}
					style={{ minWidth: 'unset' }}
				>
					Run Test
				</GCButton>
			</div>
			<div onClick={useCallback(handleRowSelected, [])}>
				<ReactTable
					data={resultSelected ? data[selected - 1].source_results : data}
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
