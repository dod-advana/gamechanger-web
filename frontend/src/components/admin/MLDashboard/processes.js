import React, { useEffect } from 'react';
import ReactTable from 'react-table';

import ProgressBar from './util/ProgressBar';
import { TableRow, BorderDiv } from './util/styledDivs';
import { styles } from '../util/GCAdminStyles';

import 'react-table/react-table.css';
import './index.scss';

// const currentColumns = [
// 	{
// 		Header: 'Category',
// 		accessor: 'category',
// 		Cell: (row) => <TableRow>{row.value}</TableRow>,
// 	},
// 	{
// 		Header: 'Process',
// 		accessor: 'process',
// 		Cell: (row) => <TableRow>{row.value}</TableRow>,
// 	},
// 	{
// 		Header: 'Progress',
// 		id: 'progress',
// 		Cell: (row) => (
// 			<TableRow>
// 				{row.original.progress} of {row.original.total}
// 			</TableRow>
// 		),
// 	},
// 	{
// 		Header: 'Percentage',
// 		accessor: 'date',
// 		Cell: (row) => (
// 			<TableRow>
// 				<ProgressBar
// 					progress={(100 * row.original.progress) / row.original.total}
// 				/>
// 			</TableRow>
// 		),
// 	},
// ];

// const completedColumns = [
// 	{
// 		Header: 'Category',
// 		accessor: 'category',
// 		Cell: (row) => <TableRow>{row.value}</TableRow>,
// 	},
// 	{
// 		Header: 'Process',
// 		accessor: 'process',
// 		Cell: (row) => <TableRow>{row.value}</TableRow>,
// 	},
// 	{
// 		Header: 'Total',
// 		accessor: 'total',
// 		Cell: (row) => <TableRow>{row.value}</TableRow>,
// 	},
// 	{
// 		Header: 'Date Completed',
// 		accessor: 'date',
// 		Cell: (row) => <TableRow>{row.value}</TableRow>,
// 	},
// ];

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
				{row.original.progress} of {row.original.total}
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
];

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
	// const getProcessData = () => {
	// 	const processList = [];
	// 	if (props.processes.process_status) {
	// 		for (const key in props.processes.process_status) {
	// 			if (key !== 'flags') {
	// 				const status = key.split(': ');
	// 				processList.push({
	// 					...props.processes.process_status[key],
	// 					process: status[1],
	// 					category: status[0],
	// 				});
	// 			}
	// 		}
	// 	}
	// 	return processList;
	// };
	// const getAllProcessData = () => {
	// 	const processList = [];
	// 	if (props.processes.process_status) {
	// 		for (const key in props.processes.process_status) {
	// 			if (key !== 'flags') {
	// 				const status = key.split(': ');
	// 				processList.push({
	// 					...props.processes.process_status[key],
	// 					process: status[1],
	// 					category: status[0],
	// 					date:'Currently Running'
	// 				});
	// 			}
	// 		}
	// 	}
	// 	if (props.processes && props.processes.completed_process) {
	// 		for (const completed of props.processes.completed_process) {
	// 			const completed_process = completed.process.split(': ');
	// 			processList.push({
	// 				...completed,
	// 				process: completed_process[1],
	// 				category: completed_process[0],
	// 				progress: completed.total
	// 			});
	// 		}
	// 	}
	// 	return processList;
	// };
	// /**
	//  * Get the general information for the API
	//  * @method getCompletedData
	//  */
	// const getCompletedData = () => {
	// 	const processList = [];
	// 	if (props.processes && props.processes.completed_process) {
	// 		for (const completed of props.processes.completed_process) {
	// 			const completed_process = completed.process.split(': ');
	// 			processList.push({
	// 				...completed,
	// 				process: completed_process[1],
	// 				category: completed_process[0],
	// 			});
	// 		}
	// 	}

	// 	return processList;
	// };

	return (
		<div className="info">
			<BorderDiv >
				<div
					style={{
						width: '100%',
						display: 'inline-block',
						paddingBottom: '5px',
						marginTop: '10px',
					}}
				>
					<div style={{ display: 'inline-block' }}>
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
