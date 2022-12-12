import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import _ from 'underscore';
import { styles, TableRow } from '../../../admin/util/GCAdminStyles';
import { Typography } from '@material-ui/core';
import GameChangerAPI from '../../../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();
export default () => {
	// Component Properties
	const [reviewerTableData, setReviewerTableData] = useState([]);
	// Component Methods

	const getReviewerData = async () => {
		const tableData = [];

		const users = await gameChangerAPI.getUserData('jbook');
		const newMap = {};
		users.data.users.forEach((user) => {
			newMap[user.id] = user;
		});

		const data = await gameChangerAPI.callDataFunction({
			functionName: 'getPublicPortfolioRequests',
			cloneName: 'jbook',
			options: {},
		});

		_.forEach(data.data, (result) => {
			const newResult = { ...result, creatorName: '' };
			newResult.creatorName = `${newMap[result.creator].first_name} ${newMap[result.creator].last_name}`;
			tableData.push(newResult);
		});

		setReviewerTableData(tableData);
	};

	useEffect(() => {
		getReviewerData();
		// eslint-disable-next-line
	}, []);

	// The table columns
	const columns = [
		{
			Header: 'Creator',
			accessor: 'creatorName',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Portfolio Name',
			accessor: 'portfolio_name',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Justification',
			accessor: 'justification',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Request Date',
			accessor: 'request_date',
			Cell: (row) => <TableRow>{new Date(row.value).toLocaleString()}</TableRow>,
		},
	];

	return (
		<>
			<div>
				<div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 80px' }}>
					<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>Public Portfolio Requests</p>
				</div>
				<div style={{ background: '#f2f2f2', borderRadius: 6, margin: '0 80px 20px 80px', padding: 10 }}>
					<Typography style={{ fontFamily: 'Montserrat', fontSize: 16 }}>
						This table below lists users' requests to change their private portfolios to public.
					</Typography>
				</div>
			</div>

			<ReactTable
				data={reviewerTableData}
				columns={columns}
				style={{ margin: '0 80px 20px 80px', height: 700 }}
				filterable={true}
				defaultPageSize={10}
				defaultFilterMethod={(filter, row) =>
					String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase())
				}
				defaultSorted={[
					{
						id: 'request_date',
						desc: true,
					},
				]}
			/>
		</>
	);
};
