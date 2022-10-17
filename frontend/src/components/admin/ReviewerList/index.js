import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import _ from 'underscore';
import GCButton from '../../common/GCButton';
import { styles, TableRow } from '../util/GCAdminStyles';
import ReviewerModal from './ReviewerModal';
import { Typography } from '@material-ui/core';
import GameChangerAPI from '../../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();

/**
 *
 * @class ReviewerList
 */
export default () => {
	// Component Properties
	const [reviewerTableData, setReviewerTableData] = useState([]);
	const [showCreateEditReviewerModal, setShowCreateEditReviewerModal] = useState(false);
	const [editReviewerData, setEditReviewerData] = useState({});
	// Component Methods

	const getReviewerData = async () => {
		const tableData = [];

		const data = await gameChangerAPI.getReviewerData();

		_.forEach(data.data, (result) => {
			tableData.push(result);
		});

		setReviewerTableData(tableData);
	};
	const deleteReviewerData = async (reviewerRowId) => {
		await gameChangerAPI.deleteReviewerData(reviewerRowId);
	};

	useEffect(() => {
		getReviewerData();
		// eslint-disable-next-line
	}, []);

	// The table columns
	const columns = [
		{
			Header: 'Name',
			accessor: 'name',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Type',
			accessor: 'type',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Title',
			accessor: 'title',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Organization',
			accessor: 'organization',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Email',
			accessor: 'email',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Phone Number',
			accessor: 'phone_number',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: ' ',
			accessor: 'id',
			width: 120,
			filterable: false,
			Cell: (row) => (
				<TableRow>
					<GCButton
						onClick={() => {
							// trackEvent('GAMECHANGER_Admin', 'EditReviewer', 'onClick', row.value);
							setEditReviewerData(reviewerTableData.filter((reviewer) => reviewer.id === row.value)[0]);
							setShowCreateEditReviewerModal(true);
						}}
						style={{ minWidth: 'unset', backgroundColor: '#1C2D64', borderColor: '#1C2D64' }}
					>
						Edit
					</GCButton>
				</TableRow>
			),
		},
		{
			Header: ' ',
			accessor: 'id',
			width: 120,
			filterable: false,
			Cell: (row) => (
				<TableRow>
					<GCButton
						onClick={() => {
							// trackEvent('GAMECHANGER_Admin', 'DeleteReviewer', 'onClick', row.value);
							deleteReviewerData(row.value).then(() => {
								getReviewerData().then(() => {
									setShowCreateEditReviewerModal(false);
								});
							});
						}}
						style={{ minWidth: 'unset', backgroundColor: 'red', borderColor: 'red' }}
					>
						Delete
					</GCButton>
				</TableRow>
			),
		},
	];

	return (
		<>
			<div>
				<div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 80px' }}>
					<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>Add/Edit Reviewers</p>
					<GCButton
						onClick={() => {
							// trackEvent('GAMECHANGER_Admin', 'EditReviewer', 'onClick', row.value);
							setEditReviewerData({});
							setShowCreateEditReviewerModal(true);
						}}
						style={{ minWidth: 'unset', backgroundColor: '#1C2D64', borderColor: '#1C2D64' }}
					>
						Add
					</GCButton>
				</div>
				<div style={{ background: '#f2f2f2', borderRadius: 6, margin: '0 80px 20px 80px', padding: 10 }}>
					<Typography style={{ fontFamily: 'Montserrat', fontSize: 16 }}>
						The table below lists all Initial (Primary), Service, and RAI (Secondary) Reviewers. Use this
						page to edit reviewer information or to add a new reviewer. Reviewers added to this page will
						automatically be added to the respective columns and dropdown menus in the webapp.
					</Typography>
					<Typography style={{ fontFamily: 'Montserrat', fontSize: 16 }}>
						*Note: POC Reviewers are not included in the table below.
					</Typography>
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
							id: 'name',
							desc: false,
						},
					]}
				/>
			</div>
			<ReviewerModal
				showCreateEditReviewerModal={showCreateEditReviewerModal}
				setShowCreateEditReviewerModal={setShowCreateEditReviewerModal}
				reviewerData={editReviewerData}
				getReviewerData={getReviewerData}
			/>
		</>
	);
};
