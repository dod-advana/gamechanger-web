import React, { useState, useEffect } from 'react';
import { Input, IconButton } from '@material-ui/core';
import { TableRow, BorderDiv } from './util/styledDivs';
import { CloudDownload } from '@material-ui/icons';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';
import GameChangerAPI from '../../api/gameChanger-service-api';
import ReactTable from 'react-table';
import GCPrimaryButton from '../../common/GCButton';
import { styles } from '../util/GCAdminStyles';
import Processes from './processes';

import 'react-table/react-table.css';
import './index.css';

const gameChangerAPI = new GameChangerAPI();

const S3_CORPUS_PATH = 'bronze/gamechanger/json';

const DatePickerWrapper = styled.div`
	margin-right: 10px;
	display: flex;
	flex-direction: column;
	> label {
		text-align: left;
		margin-bottom: 2px;
		color: #3f4a56;
		font-size: 15px;
		font-family: Noto Sans;
	}
	> .react-datepicker-wrapper {
		> .react-datepicker__input-container {
			> input {
				width: 225px;
				border: 0;
				outline: 0;
				border-bottom: 1px solid black;
			}
		}
	}
`;

/**
 * This class queries the ml api information and provides controls
 * for the different endpoints
 * @class MLDashboard
 */
export default (props) => {
	// Set state variables
	const [s3List, setS3List] = useState([]);
	const [s3DataList, setS3DataList] = useState([]);
	const [startDate, setStartDate] = useState(moment().subtract(3, 'd').set({ hour: 0, minute: 0 })._d);
	const [endDate, setEndDate] = useState(moment()._d);
	const [corpus, setCorpus] = useState(S3_CORPUS_PATH);

	// flags that parameters have been changed and on
	// blur or enter press we should update the query
	const [downloading, setDownloading] = useState(false);

	/**
	 * Get all the model tar files in s3 with their upload time.
	 * @method getS3List
	 */
	const getS3List = async () => {
		try {
			// set transformerList
			const slist = await gameChangerAPI.getS3List();
			const setList = [];
			// slist is an array of arrays of length 2.
			// First is the name of the tar file,
			// the second is the time it was uploaded to s3
			for (const s3 of slist.data) {
				setList.push({
					file: s3[0],
					upload: s3[1],
				});
			}
			setS3List(setList);
			props.updateLogs('Successfully queried s3 models', 0);
		} catch (e) {
			props.updateLogs('Error querying s3 models: ' + e.toString(), 2);
			throw e;
		}
	};

	/**
	 * Get all the tar data files in s3 with their upload time.
	 * @method getS3DataList
	 */
	const getS3DataList = async () => {
		try {
			// set transformerList
			const slist = await gameChangerAPI.getS3DataList();
			const setList = [];
			// slist is an array of arrays of length 2.
			// First is the name of the tar file,
			// the second is the time it was uploaded to s3
			for (const s3 of slist.data) {
				setList.push({
					file: s3[0],
					upload: s3[1],
				});
			}
			setS3DataList(setList);
			props.updateLogs('Successfully queried s3 data', 0);
		} catch (e) {
			props.updateLogs('Error querying s3 data: ' + e.toString(), 2);
			throw e;
		}
	};

	/**
	 * Pass a file from s3 to download into the ml-api
	 * @method downloadS3File
	 */
	const downloadS3File = async (row, type) => {
		await gameChangerAPI.downloadS3File({
			file: row.original.file,
			type: type,
		});
		props.getProcesses();
	};

	/**
	 * Get a list of all the proccesses running and completed
	 * @method getAllProcessData
	 */
	const getAllProcessData = () => {
		const processList = [];
		if (props.processes.process_status) {
			for (const key in props.processes.process_status) {
				const status = key !== 'flags' ? props.processes.process_status[key]['process'].split(': ') : [''];
				if (['s3', 'corpus'].includes(status[0])) {
					processList.push({
						...props.processes.process_status[key],
						thread_id: key,
						date: 'Currently Running',
					});
				}
			}
		}
		if (props.processes.completed_process) {
			for (const completed of props.processes.completed_process) {
				const completed_process = completed.process.split(': ');
				if (['s3', 'corpus'].includes(completed_process[0])) {
					processList.push({
						...completed,
						process: completed_process[1],
						category: completed_process[0],
						progress: completed.total,
					});
				}
			}
		}
		return processList;
	};
	/**
	 * @method triggerDownloadModel
	 */
	const triggerDownloadModel = async () => {
		try {
			setDownloading(true);
			await gameChangerAPI.downloadDependencies();
			props.updateLogs('Triggered download dependencies', 0);
			props.getProcesses();
		} catch (e) {
			props.updateLogs('Error setting transformer model: ' + e.toString(), 2);
		} finally {
			setDownloading(false);
		}
	};

	/**
	 * @method triggerDownloadCorpus
	 */
	const triggerDownloadCorpus = async () => {
		try {
			await gameChangerAPI.downloadCorpus({
				corpus: corpus,
			});
			props.updateLogs('Downloaded Corpus: ' + corpus, 0);
			props.getProcesses();
		} catch (e) {
			props.updateLogs('Error downloading corpus: ' + e.toString(), 2);
		}
	};

	const handleDateChange = (date, setFunction) => {
		setFunction(date);
	};
	/**
	 * Get user aggregations data and sends that to the ml-api
	 * @method sendUserAggData
	 */
	const sendUserAggData = async () => {
		try {
			const params = {
				startDate: moment(startDate).utc().format('YYYY-MM-DD HH:mm'),
				endDate: moment(endDate).utc().format('YYYY-MM-DD HH:mm'),
			};
			const userData = await gameChangerAPI.getUserAggregations(params);
			const searchData = await gameChangerAPI.getSearchPdfMapping(params);
			const mlParams = {
				searchData: searchData.data.data,
				userData: userData.data.users,
			};
			gameChangerAPI.sendUserAggregations(mlParams);
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		getS3List();
		getS3DataList();
		props.getProcesses();
		// eslint-disable-next-line
	}, []);

	const s3Columns = [
		{
			Header: 'Tar File',
			accessor: 'file',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Upload Time',
			accessor: 'upload',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Download',
			accessor: '',
			Cell: (row) => (
				<TableRow>
					<IconButton
						onClick={() => {
							downloadS3File(row, 'models');
						}}
						style={{ color: 'white' }}
					>
						<CloudDownload fontSize="large" />
					</IconButton>
				</TableRow>
			),
		},
	];

	const s3ColumnsData = [
		{
			Header: 'Tar File',
			accessor: 'file',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Upload Time',
			accessor: 'upload',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'Download',
			accessor: '',
			Cell: (row) => (
				<TableRow>
					<IconButton
						onClick={() => {
							downloadS3File(row, 'ml-data');
						}}
						style={{ color: 'white' }}
					>
						<CloudDownload fontSize="large" />
					</IconButton>
				</TableRow>
			),
		},
	];
	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					margin: '10px 80px',
				}}
			>
				<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>S3 Resources and Controls</p>

				<GCPrimaryButton
					onClick={() => {
						getS3List();
						getS3DataList();
					}}
					style={{ minWidth: 'unset' }}
				>
					Refresh
				</GCPrimaryButton>
			</div>
			<div>
				<div>
					<Processes processData={getAllProcessData()} />
				</div>
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
						<div style={{ display: 'inline-block', fontWeight: 'bold' }}>API Controls:</div>
					</div>
					<div
						style={{
							width: '100%',
							padding: '20px',
							marginBottom: '10px',
							border: '2px solid darkgray',
							borderRadius: '6px',
							display: 'inline-block',
							justifyContent: 'space-between',
						}}
					>
						<b>Download dependencies from s3 Args</b>
						<GCPrimaryButton
							onClick={() => {
								triggerDownloadModel();
							}}
							disabled={downloading}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Download
						</GCPrimaryButton>
					</div>
					<div
						style={{
							width: '100%',
							padding: '20px',
							marginBottom: '10px',
							border: '2px solid darkgray',
							borderRadius: '6px',
							display: 'inline-block',
							justifyContent: 'space-between',
						}}
					>
						<b>Send User Data to ML-API</b>
						<DatePickerWrapper>
							<label>Start Date</label>
							<DatePicker
								showTimeSelect
								selected={startDate || ''}
								onChange={(date) => handleDateChange(date, setStartDate)}
								dateFormat="yyyy-MM-dd HH:mm"
							/>
						</DatePickerWrapper>
						<DatePickerWrapper>
							<label>End Date</label>
							<DatePicker
								showTimeSelect
								selected={endDate || ''}
								onChange={(date) => handleDateChange(date, setEndDate)}
								dateFormat="yyyy-MM-dd HH:mm"
							/>
						</DatePickerWrapper>
						<GCPrimaryButton
							onClick={() => {
								sendUserAggData();
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Send Data
						</GCPrimaryButton>
					</div>
					<div
						style={{
							width: '100%',
							padding: '20px',
							marginBottom: '10px',
							border: '2px solid darkgray',
							borderRadius: '6px',
							display: 'inline-block',
							justifyContent: 'space-between',
						}}
					>
						<b>Download Corpus</b>
						<br />
						<GCPrimaryButton
							onClick={() => {
								triggerDownloadCorpus();
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Download
						</GCPrimaryButton>
						<div>
							Corpus:
							<Input
								value={corpus}
								onChange={(e) => setCorpus(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: 'unset', margin: '10px' }}
							/>
						</div>
					</div>
				</BorderDiv>
				<BorderDiv className="half" style={{ float: 'right' }}>
					<div
						style={{
							width: '100%',
							display: 'inline-block',
							paddingBottom: '5px',
						}}
					>
						<div style={{ display: 'inline-block', fontWeight: 'bold' }}>S3 Models:</div>
					</div>
					<fieldset className={'field'}>
						<div className="info-container">
							<ReactTable
								data={s3List}
								columns={s3Columns}
								className="striped -highlight"
								defaultPageSize={5}
							/>
						</div>
					</fieldset>
					<div
						style={{
							width: '100%',
							display: 'inline-block',
							paddingBottom: '5px',
						}}
					>
						<div style={{ display: 'inline-block', fontWeight: 'bold' }}>S3 Data:</div>
					</div>
					<fieldset className={'field'}>
						<div className="info-container">
							<ReactTable
								data={s3DataList}
								columns={s3ColumnsData}
								className="striped -highlight"
								defaultPageSize={5}
							/>
						</div>
					</fieldset>
				</BorderDiv>
			</div>
		</div>
	);
};
