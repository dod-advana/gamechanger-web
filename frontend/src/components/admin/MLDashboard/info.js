import React, { useState, useEffect } from 'react';
import { Tooltip } from '@material-ui/core';
import ReactTable from 'react-table';

import { TableRow, StatusCircle, BorderDiv } from './util/styledDivs';
import { styles } from '../util/GCAdminStyles';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCPrimaryButton from '../../common/GCButton';
import 'react-table/react-table.css';
import './index.scss';
const status = ['ok', 'warning', 'error', 'loading'];

const gameChangerAPI = new GameChangerAPI();

const apiColumns = [
	{
		Header: 'Response',
		accessor: 'response',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Time Stamp',
		accessor: 'timeStamp',
		width: 220,
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Status',
		accessor: 'status',
		width: 100,
		Cell: (row) => (
			<TableRow>
				<div
					style={{ borderRadius: '8px' }}
					className={row.value.toLowerCase()}
				>
					{row.value}
				</div>
			</TableRow>
		),
	},
];


/**
 * This class queries the ml api information
 * @class Info
 */
export default (props) => {
	// Set state variables
	const [APIData, setAPIData] = useState({});


	/**
	 * Load all the initial data on transformers and s3
	 * @method onload
	 */
	const onload = async () => {
		getAPIInformation();
	};

	/**
	 * Get the general information for the API
	 * @method getAPIInformation
	 */
	const getAPIInformation = async () => {
		try {
			// set APIData
			const info = await gameChangerAPI.getAPIInformation();
			setAPIData(info.data);
			props.updateLogs('Successfully queried api information', 0);
		} catch (e) {
			props.updateLogs('Error querying api information: ' + e.toString(), 2);
			throw e;
		}
	};
	/**
	 * @method getLastQueried
	 * @returns
	 */
	const getLastQueried = () => {
		let mostRecent = '';
		for (const message of props.apiErrors) {
			if (mostRecent === '') {
				mostRecent = message.timeStamp;
			} else if (Date.parse(message.timeStamp) > Date.parse(mostRecent)) {
				mostRecent = message.timeStamp;
			}
		}
		return mostRecent;
	};
	/**
	 * @method getConnectionStatus
	 * @return integer 0-3
	 */
	const getConnectionStatus = () => {
		let success = false;
		let error = false;
		for (const message of props.apiErrors) {
			if (message.status === 'OK') {
				success = true;
			}
			if (message.status === 'ERROR') {
				error = true;
			}
		}
		//setLastQueried(new Date(Date.now()).toLocaleString());
		if (success && error) {
			return 1;
		} else if (!success && error) {
			return 2;
		} else if (!success && !error) {
			return 3;
		}
		return 0;
	};

	useEffect(() => {
		onload();
		// eslint-disable-next-line
	}, []);

	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					margin: '10px 80px',
				}}
			>
				<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>
					General Information
				</p>

				<GCPrimaryButton
					onClick={() => {
						onload();
					}}
					style={{ minWidth: 'unset' }}
				>
					Refresh
				</GCPrimaryButton>
			</div>
			<div className="info">
				<BorderDiv className="half">
					<div
						style={{
							width: '100%',
							display: 'inline-block',
							paddingBottom: '5px',
						}}
					>
						<div style={{ display: 'inline-block', fontWeight: 'bold' }}>Current State:</div>
						<Tooltip
							title={
								'Connection ' + status[getConnectionStatus()].toUpperCase()
							}
							placement="right"
							arrow
						>
							<StatusCircle className={status[getConnectionStatus()]} />
						</Tooltip>
					</div>
					<fieldset className={'field'}>
						<div className="info-container">
							<div
								style={{ width: '35%', boxSizing: 'border-box' }}
								className="half"
							>
								Application: <br />
								Version: <br />
								Connection Status: <br />
								Last Queried: <br />
								Elasticsearch Host: <br />
								Elasticsearch Status: <br />

							</div>
							<div style={{ width: '65%' }} className="half">
								{APIData.API_Name} <br />
								{APIData.Version} <br />
								{status[getConnectionStatus()].toUpperCase()} <br />
								{getLastQueried()} <br />
								{APIData.Elasticsearch_Host} <br />
								{APIData.Elasticsearch_Status} <br />

								<br />

							</div>
						</div>
					</fieldset>
				</BorderDiv>
				<BorderDiv className="half" style={{ float: 'right' }}>
					<div
						style={{
							width: '100%',
							display: 'inline-block',
							paddingBottom: '5px',
							marginTop: '10px',
						}}
					>
						<div style={{ display: 'inline-block', fontWeight: 'bold' }}>API Response:</div>
					</div>
					<fieldset className={'field'}>
						<div className="info-container">
							<ReactTable
								data={props.apiErrors}
								columns={apiColumns}
								className="striped -highlight"
								defaultSorted={[{ id: 'searchtime', desc: true }]}
								defaultPageSize={5}
							/>
						</div>
					</fieldset>
				</BorderDiv>
			</div>
		</div>
	);
};
