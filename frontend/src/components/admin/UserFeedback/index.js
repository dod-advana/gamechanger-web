import React, { useState, useEffect, useCallback } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import _ from 'underscore';
import GameChangerAPI from '../../api/gameChanger-service-api';
import { styles, TableRow } from '../util/GCAdminStyles';

const gameChangerAPI = new GameChangerAPI();

const PAGE_SIZE = 15;

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

const getUserFeedbackData = async ({ limit = PAGE_SIZE, offset, sorted, filtered }) => {
	const order = sorted.map(({ id, desc }) => {
		return [id, desc ? 'DESC' : 'ASC'];
	});
	const where = filtered.map(({ id, value }) => ({
		[id]: { $iLike: `%${value}%` },
	}));

	const data = await gameChangerAPI.getJbookFeedbackData({
		limit,
		offset,
		order,
		where,
	});

	if (data && data.data) {
		return data.data;
	} else {
		return { totalCount: 0, docs: [] };
	}
};

/**
 *
 * @class UserFeedback
 */
const UserFeedback = React.memo((props) => {
	const { cloneName, columns, title, titleAdditions, descriptionAdditions } = props;

	// Component Properties
	const [gcUserTableData, setGCUserTableData] = useState([]);
	const [tableColumns, setTableColumns] = useState([]);
	const [loading, setLoading] = useState(true);
	const [numPages, setNumPages] = useState(0);
	// Component Methods

	const handleFetchData = useCallback(async ({ page, sorted, filtered }) => {
		try {
			setLoading(true);
			const { totalCount, docs = [] } = await getUserFeedbackData({
				offset: page * PAGE_SIZE,
				sorted,
				filtered,
			});
			const pageCount = Math.ceil(totalCount / PAGE_SIZE);
			setNumPages(pageCount);
			setGCUserTableData(docs);
		} catch (e) {
			setGCUserTableData([]);
			setNumPages(0);
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, []);

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
				filterable={true}
				pageSize={PAGE_SIZE}
				showPageSizeOptions={false}
				loading={loading}
				manual={true}
				pages={numPages}
				onFetchData={handleFetchData}
				defaultSorted={[
					{
						id: 'last_name',
						desc: false,
					},
				]}
			/>
		</div>
	);
});

export default UserFeedback;
