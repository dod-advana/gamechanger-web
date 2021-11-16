import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import styled from 'styled-components';

import GameChangerAPI from '../../api/gameChanger-service-api';
import GCButton from '../../common/GCButton';
import { trackEvent } from '../../telemetry/Matomo';
import { styles } from '../util/GCAdminStyles';

const gameChangerAPI = new GameChangerAPI();

const TableRow = styled.div`
	text-align: left;
	max-height: 250px;
	min-height: 20px;
`;

const getResponsibilityData = async (setResponsibilityUpdates) => {
	const { data } = await gameChangerAPI.getResponsibilityUpdates();
	console.log('data: ', data);

	setResponsibilityUpdates(data);
};

/**
 *
 * @class CloneList
 */
export default () => {
	// Component Properties
	const [responsibilityUpdates, setResponsibilityUpdates] = useState([]);

	useEffect(() => {
		getResponsibilityData(setResponsibilityUpdates)
	}, [setResponsibilityUpdates])

	// Component Methods

	// The table columns
	const columns = [
		{
			Header: 'Document Title',
			accessor: 'responsibility.documentTitle',
			style: { whiteSpace: 'unset' },
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Entity',
			accessor: `responsibility.organizationPersonnel`,
			style: { whiteSpace: 'unset' },
			Cell: (row) => (
				<TableRow>
					{row.value}
				</TableRow>
			),
		},
		{
			Header: 'Responsibility Text',
			accessor: `responsibility.responsibilityText`,
			style: { whiteSpace: 'unset' },
			Cell: (row) => (
				<TableRow>
					{row.value}
				</TableRow>
			),
		},
		{
			Header: 'Text Type',
			accessor: 'updatedColumn',
			style: { whiteSpace: 'unset' },
			Cell: (row) => (
				<TableRow>
					{row.value}
				</TableRow>
			),
		},
		{
			Header: 'Updated Text',
			accessor: 'updatedText',
			style: { whiteSpace: 'unset' },
			Cell: (row) => (
				<TableRow>
					{row.value}
				</TableRow>
			),
		},
		{
			Header: ' ',
			accessor: 'id',
			width: 150,
			Cell: (row) => (
				<TableRow>
					<GCButton
						onClick={() => {
							trackEvent(
								'GAMECHANGER_Admin',
								'EditClone',
								'onClick',
								row.value
							);
							gameChangerAPI.updateResponsibility({id: row.value, status: 'Rejected'})
						}}
						style={{ minWidth: 'unset' }}
						isSecondaryBtn
					>
							Reject
					</GCButton>
				</TableRow>
			),
		},
		{
			Header: ' ',
			accessor: 'id',
			width: 150,
			Cell: (row) => (
				<TableRow>
					<GCButton
						onClick={() => {
							trackEvent(
								'GAMECHANGER_Admin',
								'DeleteClone',
								'onClick',
								row.value
							);
							gameChangerAPI.updateResponsibility({id: row.value, status: 'Accepted'})
						}}
					>
							Accept
					</GCButton>
				</TableRow>
			),
		},
	];

	return (
		<>
			<div>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						margin: '10px 80px',
					}}
				>
					<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>
						Responsibility Updates
					</p>
				</div>

				<ReactTable
					data={responsibilityUpdates}
					columns={columns}
					style={{ margin: '0 80px 20px 80px', height: 700 }}
					pageSize={10}
				/>
			</div>
		</>
	);
};
