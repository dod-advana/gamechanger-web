import React, { useState, useEffect, useCallback } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import _ from 'underscore';
import GameChangerAPI from '../../api/gameChanger-service-api';
import { styles, TableRow } from '../util/GCAdminStyles';

const gameChangerAPI = new GameChangerAPI();

// The table columns
const DEFAULT_COLUMNS = [
	{
		Header: 'First',
		accessor: 'first_name',
		Cell: (row) => <TableRow>{row.value && row.value !== null ? row.value : 'Unknown First'}</TableRow>,
		width: 150,
	},
	{
		Header: 'Last',
		accessor: 'last_name',
		Cell: (row) => <TableRow>{row.value && row.value !== null ? row.value : 'Unknown Last'}</TableRow>,
		width: 150,
	},
];

/**
 *
 * @class UserFeedback
 */
const UserFeedback = React.memo((props) => {
	const { cloneName, columns, title, titleAdditions, descriptionAdditions } = props;

	// Component Properties
	const [gcUserTableData, setGCUserTableData] = useState([]);
	const [tableColumns, setTableColumns] = useState([]);
	// Component Methods

	const getUserData = useCallback(async () => {
		const tableData = [];

		const data = await gameChangerAPI.getJbookFeedbackData();

		_.forEach(data.data.results, (result) => {
			tableData.push(result);
		});
		setGCUserTableData(tableData);
	}, []);

	useEffect(() => {
		getUserData();
	}, [getUserData]);

	useEffect(() => {
		let tmpColumns = [...DEFAULT_COLUMNS];

		if (columns && gcUserTableData) {
			if (columns.length > 0) {
				columns.forEach((column) => tmpColumns.push(column));
			}
		}

		setTableColumns(tmpColumns);
		// eslint-disable-next-line
	}, [columns, gcUserTableData]);

	const cloneDisplayName = cloneName ? cloneName.toUpperCase() : 'GAMECHANGER';

	return (
		<>
			<div>
				<div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 80px' }}>
					<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>
						{title ? `${cloneDisplayName} ${title}` : `${cloneDisplayName} User Feedback`}
					</p>
					{titleAdditions && titleAdditions()}
				</div>
				{descriptionAdditions && descriptionAdditions()}
				<ReactTable
					data={gcUserTableData}
					columns={tableColumns}
					style={{ margin: '0 80px 20px 80px', height: 700 }}
					defaultPageSize={10}
					filterable={true}
					defaultFilterMethod={(filter, row) =>
						String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase())
					}
					defaultSorted={[
						{
							id: 'last_name',
							desc: false,
						},
					]}
				/>
			</div>
		</>
	);
});

export default UserFeedback;
