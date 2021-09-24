import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';

import GameChangerAPI from '../api/gameChanger-service-api';
import GCAccordion from '../common/GCAccordion';
import GCButton from '../common/GCButton';
import { trackEvent } from '../telemetry/Matomo';
import { styles, TableRow } from './util/GCAdminStyles';

const gameChangerAPI = new GameChangerAPI();

/**
 * A table to view api keys and requests
 * @class APIRequests
 */
export default () => {
	// State Variables
	const [gcAPIRequestData, setGCAPIRequestData] = useState({
		approved: [],
		pending: [],
	});
	const [gcAPIKeyVision, setGCAPIKeyVision] = useState(false);
	// Comonent Methods
	/**
	 * Grabs all the data from the backend to populate the table
	 * @method getApiKeyRequestData
	 */
	const getApiKeyRequestData = async () => {
		const resp = await gameChangerAPI.getAPIKeyRequestData();
		setGCAPIRequestData(resp.data || { approved: [], pending: [] });
	};
	/**
	 * Attemps to revoke a key based on the id
	 * @method revokeAPIKeyRequestData
	 * @param {*} id
	 */
	const revokeAPIKeyRequestData = async (id) => {
		gameChangerAPI.revokeAPIKeyRequest(id).then((resp) => {
			getApiKeyRequestData();
		});
	};
	/**
	 * Either approves or rejects a key request with an id and boolean
	 * @method approveRejectAPIKeyRequestData
	 * @param {*} id
	 * @param {boolean} approve
	 */
	const approveRejectAPIKeyRequestData = async (id, approve) => {
		gameChangerAPI.approveRejectAPIKeyRequest(id, approve).then((resp) => {
			getApiKeyRequestData();
		});
	};
	useEffect(() => {
		getApiKeyRequestData();
	}, []);
	// Columns
	const approvedColumns = [
		{
			Header: 'Name',
			accessor: 'name',
			width: 200,
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Keys',
			accessor: 'keys',
			Cell: (row) => {
				return gcAPIKeyVision ? (
					<TableRow>{row.value.join(', ')}</TableRow>
				) : (
					<TableRow>******************************************</TableRow>
				);
			},
		},
		{
			Header: ' ',
			accessor: 'id',
			width: 120,
			Cell: (row) => (
				<TableRow>
					<GCButton
						onClick={() => {
							trackEvent(
								'GAMECHANGER_Admin',
								'AdminPage',
								'DeleteAPIKey',
								row.value
							);
							revokeAPIKeyRequestData(row.value);
						}}
						style={{
							minWidth: 'unset',
							backgroundColor: 'red',
							borderColor: 'red',
							height: 35,
						}}
					>
						Revoke
					</GCButton>
				</TableRow>
			),
		},
	];

	const pendingColumns = [
		{
			Header: 'Name',
			accessor: 'name',
			width: 200,
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Reason',
			accessor: 'reason',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: ' ',
			accessor: 'id',
			width: 230,
			Cell: (row) => (
				<TableRow>
					<GCButton
						onClick={() => {
							trackEvent(
								'GAMECHANGER_Admin',
								'AdminPage',
								'ApproveAPIKeyRequest',
								row.value
							);
							approveRejectAPIKeyRequestData(row.value, true);
						}}
						style={{
							minWidth: 'unset',
							backgroundColor: 'green',
							borderColor: 'green',
							height: 35,
						}}
					>
						Approve
					</GCButton>
					<GCButton
						onClick={() => {
							trackEvent(
								'GAMECHANGER_Admin',
								'AdminPage',
								'RejectAPIKeyRequest',
								row.value
							);
							approveRejectAPIKeyRequestData(row.value, false);
						}}
						style={{
							minWidth: 'unset',
							backgroundColor: 'red',
							borderColor: 'red',
							height: 35,
						}}
					>
						Reject
					</GCButton>
				</TableRow>
			),
		},
	];

	return (
		<div style={{ height: '100%' }}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					margin: '10px 80px',
				}}
			>
				<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>
					API Key Requests
				</p>
			</div>

			<div style={{ margin: '10px 80px' }}>
				<GCAccordion expanded={false} header={'APPROVED API KEYS'}>
					<div
						style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
					>
						<ReactTable
							data={gcAPIRequestData.approved}
							columns={approvedColumns}
							pageSize={10}
							style={{ width: '100%' }}
							getTheadTrProps={() => {
								return {
									style: {
										height: 'fit-content',
										textAlign: 'left',
										fontWeight: 'bold',
									},
								};
							}}
							getTheadThProps={() => {
								return { style: { fontSize: 15, fontWeight: 'bold' } };
							}}
						/>
						{gcAPIRequestData.approved.length > 0 && (
							<GCButton
								id={'editCloneSubmit'}
								onClick={() => setGCAPIKeyVision(!gcAPIKeyVision)}
								style={{ margin: '10px' }}
							>
								Show/Hide API keys
							</GCButton>
						)}
					</div>
				</GCAccordion>
				<GCAccordion expanded={true} header={'PENDING API KEYS'}>
					<ReactTable
						data={gcAPIRequestData.pending}
						columns={pendingColumns}
						pageSize={10}
						style={{ width: '100%' }}
						getTheadTrProps={() => {
							return {
								style: {
									height: 'fit-content',
									textAlign: 'left',
									fontWeight: 'bold',
								},
							};
						}}
						getTheadThProps={() => {
							return { style: { fontSize: 15, fontWeight: 'bold' } };
						}}
					/>
				</GCAccordion>
			</div>
		</div>
	);
};
