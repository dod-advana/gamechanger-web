import React, { useState, useEffect } from 'react';
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
	},
	{
		Header: 'Last',
		accessor: 'last_name',
		Cell: (row) => <TableRow>{row.value && row.value !== null ? row.value : 'Unknown Last'}</TableRow>,
	},
	{
		Header: 'Organization',
		accessor: 'organization',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
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

	const getUserData = async () => {
		const tableData = [];

		const data = await gameChangerAPI.getUserData(cloneName);

		_.forEach(data.data.users, (result) => {
			tableData.push(result);
		});
		setGCUserTableData(tableData);
	};

	useEffect(() => {
		getUserData();
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		let tmpColumns = [...DEFAULT_COLUMNS];

		if (columns && gcUserTableData) {
			if (columns.length > 0) {
				columns.forEach((column) => tmpColumns.push(column));
			}

			tmpColumns.push({
				Header: ' ',
				accessor: 'id',
				width: 120,
				filterable: false,
				Cell: () => <TableRow>Edit</TableRow>,
			});
			tmpColumns.push({
				Header: ' ',
				accessor: 'id',
				width: 120,
				filterable: false,
				Cell: () => <TableRow>Delete</TableRow>,
			});
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
