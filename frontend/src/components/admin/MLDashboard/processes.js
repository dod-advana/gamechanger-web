import React from 'react';
import ReactTable from 'react-table';
import { IconButton  } from '@material-ui/core';

import ProgressBar from './util/ProgressBar';
import { TableRow, BorderDiv } from './util/styledDivs';
import { Stop  } from '@material-ui/icons';
import GameChangerAPI from '../../api/gameChanger-service-api';

import 'react-table/react-table.css';
import './index.scss';

const gameChangerAPI = new GameChangerAPI();

/**
 * This class queries the ml api information and provides controls
 * for the different endpoints
 * @class Process
 */
const Process = (props) => {
	/**
	 * Get the general information for the API
	 * @method getProcessData
	 */

	/**
	 * Pass a file from s3 to download into the ml-api
	 * @method downloadS3File
	 */
	 const  killProcess = async (row) => {
		await gameChangerAPI.stopProcess({
			'thread_id':row.original.thread_id,
			'process': `${row.original.category}: ${row.original.process}`
		});
	}

	const allColumns = [
		{
			Header: 'Category',
			accessor: 'category',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Process',
			accessor: 'process',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Progress',
			id: 'progress',
			Cell: (row) => (
				<TableRow>
					<ProgressBar
						 progress={(100 * row.original.progress) / row.original.total}
					 />
				</TableRow>
			),
		},
		{
			Header: 'Total',
			accessor: 'total',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Date Completed',
			accessor: 'date',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: '',
			accessor: 'message',
			Cell: (row) => <TableRow>
				{('message' in row.original) ? row.value : 
					<IconButton onClick={() => {
						killProcess(row)
					}} style={{ color: 'white' }}><Stop fontSize="large"/></IconButton>}
			</TableRow>,
		},
	];
	
	return (
		<div className="info">
			<BorderDiv >
				<div
					style={{
						width: '100%',
						display: 'inline-block',
						paddingBottom: '5px',
						marginTop: '10px'
					}}
				>
					<div style={{ display: 'inline-block', fontWeight: 'bold' }}>
						Processes:
					</div>
					<fieldset className={'field'}>
						<div className="info-container">
							<ReactTable
								data={props.processData}
								columns={allColumns}
								className="striped -highlight"
								defaultPageSize={10}
							/>
						</div>
					</fieldset>
				</div>
			</BorderDiv>
		</div>
	);
};

export default Process;
