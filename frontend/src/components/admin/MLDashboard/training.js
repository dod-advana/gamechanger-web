import React, { useState, useEffect } from 'react';
import { Tooltip, Typography, Input, IconButton, Checkbox } from '@material-ui/core';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import Modal from 'react-modal';
import styled from 'styled-components';
import moment from 'moment';
import { CloudDownload } from '@material-ui/icons';

import { TableRow, StatusCircle, BorderDiv } from './util/styledDivs';
import { styles } from '../util/GCAdminStyles';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCButton from '../../common/GCButton';

import Processes from './processes';

import './index.scss';
const status = ['ok', 'warning', 'error', 'loading'];

const gameChangerAPI = new GameChangerAPI();

const S3_CORPUS_PATH = 'bronze/gamechanger/json';
const DEFAULT_MODEL_NAME = 'msmarco-distilbert-base-v2';
const DEFAULT_VERSION = 'v4';

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
				<div style={{ borderRadius: '8px' }} className={row.value.toLowerCase()}>
					{row.value}
				</div>
			</TableRow>
		),
	},
];

const modelColumns = [
	{
		Header: 'Model Type',
		accessor: 'type',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Model',
		accessor: 'model',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
];

const dataColumns = [
	{
		Header: 'Path',
		accessor: 'path',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
	{
		Header: 'Name',
		accessor: 'name',
		Cell: (row) => <TableRow>{row.value}</TableRow>,
	},
];

/**
 * Get a list of all the proccesses running and completed
 * @method getAllProcessData
 */
const getAllProcessData = (props) => {
	const processList = [];
	if (props.processes.process_status) {
		for (const key in props.processes.process_status) {
			const status = key !== 'flags' ? props.processes.process_status[key]['container'] : [''];
			if (['training'].includes(status)) {
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
			if (['training'].includes(completed.container)) {
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

const handleDateChange = (date, setFunction) => {
	setFunction(date);
};

/**
 * @method triggerDownloadCorpus
 */
const triggerDownloadCorpus = async (props, corpus) => {
	try {
		await gameChangerAPI.downloadCorpus({
			corpus: corpus,
		});
		props.updateTrainLogs('Downloaded Corpus: ' + corpus, 0);
		props.getProcesses();
	} catch (e) {
		props.updateTrainLogs('Error downloading corpus: ' + e.toString(), 2);
	}
};

/**
 * @method getLocalData
 *
 * Gets local data from ml container directories
 */
const getLocalData = async (setDataTable) => {
	const dataList = await gameChangerAPI.getDataList();
	setDataTable(dataList.data.dirs);
};

/**
 * Get user aggregations data and sends that to the ml-api
 * @method sendUserAggData
 */
const sendUserAggData = async (startDate, endDate) => {
	try {
		const params = {
			startDate: moment(startDate).utc().format('YYYY-MM-DD HH:mm'),
			endDate: moment(endDate).utc().format('YYYY-MM-DD HH:mm'),
			limit: null,
		};
		const userData = await gameChangerAPI.getUserAggregations(params);
		const searchData = await gameChangerAPI.getSearchPdfMapping(params);
		const mlParams = {
			searchData: searchData.data.data,
			userData: userData.data.users,
		};
		gameChangerAPI.sendUserAggregationsTrain(mlParams);
	} catch (e) {
		console.error(e);
	}
};

/**
 * Get a list of all the downloaded sentence index, qexp, and transformers.
 * @method getModelsList
 */
const getModelsList = async (setModelTable, props) => {
	try {
		// set downloadedModelsList
		const listTrain = await gameChangerAPI.getModelsListTrain();
		const modelList = [];
		for (const type in listTrain.data) {
			for (const model in listTrain.data[type]) {
				modelList.push({
					type,
					model,
					config: JSON.stringify(listTrain.data[type][model], null, 2),
				});
			}
		}
		setModelTable(modelList);
		props.updateTrainLogs('Successfully queried models list', 0);
	} catch (e) {
		props.updateTrainLogs('Error querying models list: ' + e.toString(), 2);
		throw e;
	}
};

/**
 * Get a list of all the downloaded sentence index, qexp, and transformers.
 * @method getCorpusCount
 */
const getCorpusCount = async (setCorpusCount, props) => {
	try {
		// set downloadedModelsList
		const count = await gameChangerAPI.getFilesInCorpus();
		setCorpusCount(count.data);
		props.updateTrainLogs('Successfully queried files in corpus', 0);
	} catch (e) {
		props.updateTrainLogs('Error querying files in corpus: ' + e.toString(), 2);
		throw e;
	}
};

/**
 * @method triggerDownloadModel
 */
const triggerDownloadModel = async (props, setDownloading) => {
	try {
		setDownloading(true);
		await gameChangerAPI.downloadDependencies();
		props.updateTrainLogs('Triggered download dependencies', 0);
		props.getProcesses();
	} catch (e) {
		props.updateTrainLogs('Error setting transformer model: ' + e.toString(), 2);
	} finally {
		setDownloading(false);
	}
};

/**
 * @method triggerTrainModel
 */
const triggerTrainModel = async (props, version, modelName, gpu, upload) => {
	try {
		await gameChangerAPI.trainModel({
			build_type: 'sentence',
			version: version,
			encoder_model: modelName,
			gpu: gpu,
			upload: upload,
		});
		props.updateTrainLogs('Started training', 0);
		props.getProcesses();
	} catch (e) {
		props.updateTrainLogs('Error training model: ' + e.toString(), 2);
	}
};

/**
 * @method triggerFinetuneModel
 */
const triggerFinetuneModel = async (props, epochs, warmupSteps, baseModel, remakeTD, testingOnly) => {
	try {
		await gameChangerAPI.trainModel({
			build_type: 'sent_finetune',
			epochs: epochs,
			warmup_steps: warmupSteps,
			model: baseModel,
			remake_train_data: remakeTD,
			testing_only: testingOnly,
		});
		props.updateTrainLogs('Started training', 0);
		props.getProcesses();
	} catch (e) {
		props.updateTrainLogs('Error training model: ' + e.toString(), 2);
	}
};

/**
 * @method triggerTrainQexp
 */
const triggerTrainQexp = async (props, qexpversion, qexpupload) => {
	try {
		await gameChangerAPI.trainModel({
			validate: false,
			build_type: 'qexp',
			version: qexpversion,
			upload: qexpupload,
		});
		props.updateTrainLogs('Started training', 0);
		props.getProcesses();
	} catch (e) {
		props.updateTrainLogs('Error training model: ' + e.toString(), 2);
	}
};

/**
 * @method triggerTrainTopics
 */
const triggerTrainTopics = async (props, topicsSampling, topicsUpload, topicsVersion) => {
	try {
		await gameChangerAPI.trainModel({
			build_type: 'topics',
			sample_rate: topicsSampling,
			upload: topicsUpload,
			version: topicsVersion,
		});
		props.updateTrainLogs('Started training', 0);
		props.getProcesses();
	} catch (e) {
		props.updateTrainLogs('Error training model: ' + e.toString(), 2);
	}
};

/**
 * @method triggerEvaluateModel
 */
const triggerEvaluateModel = async (props, evalModelName) => {
	try {
		await gameChangerAPI.trainModel({
			build_type: 'eval',
			model_name: evalModelName,
			validation_data: 'latest',
			eval_type: 'domain',
		});
		props.updateTrainLogs('Started evaluating', 0);
		props.getProcesses();
	} catch (e) {
		props.updateTrainLogs('Error evaluating model: ' + e.toString(), 2);
	}
};

/**
 * @method triggerInitializeLTR
 */
const triggerInitializeLTR = async (props, setLTRInitializedStatus) => {
	try {
		await gameChangerAPI.initializeLTR().then((data) => {
			setLTRInitializedStatus(data.status);
		});
		props.updateTrainLogs('Initializing LTR', 0);
		props.getProcesses();
	} catch (e) {
		props.updateTrainLogs('Error initializing LTR: ' + e.toString(), 2);
	}
};

/**
 * @method triggerCreateModelLTR
 */
const triggerCreateModelLTR = async (props, setLTRModelCreatedStatus) => {
	try {
		await gameChangerAPI.createModelLTR().then((data) => {
			setLTRModelCreatedStatus(data.status);
		});
		props.updateTrainLogs('Creating LTR model', 0);
		props.getProcesses();
	} catch (e) {
		props.updateTrainLogs('Error creating LTR model: ' + e.toString(), 2);
	}
};

/**
 * @method getLastQueried
 * @returns
 */
const getLastQueried = (props) => {
	let mostRecent = '';
	for (const message of props.apiTrainErrors) {
		if (mostRecent === '' || Date.parse(message.timeStamp) > Date.parse(mostRecent)) {
			mostRecent = message.timeStamp;
		}
	}
	return mostRecent;
};

/**
 * Get all the model tar files in s3 with their upload time.
 * @method getS3List
 */
const getS3List = async (setS3List, props) => {
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
		props.updateTrainLogs('Successfully queried s3 models', 0);
	} catch (e) {
		props.updateTrainLogs('Error querying s3 models: ' + e.toString(), 2);
		throw e;
	}
};

/**
 * Get all the tar data files in s3 with their upload time.
 * @method getS3DataList
 */
const getS3DataList = async (setS3DataList, props) => {
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
		props.updateTrainLogs('Successfully queried s3 data', 0);
	} catch (e) {
		props.updateTrainLogs('Error querying s3 data: ' + e.toString(), 2);
		throw e;
	}
};

/**
 * @method getConnectionStatus
 * @return integer 0-3
 */
const getConnectionStatus = (props) => {
	let success = false;
	let error = false;
	for (const message of props.apiTrainErrors) {
		if (message.status === 'OK') {
			success = true;
		}
		if (message.status === 'ERROR') {
			error = true;
		}
	}
	if (success && error) {
		return 1;
	} else if (!success && error) {
		return 2;
	} else if (!success && !error) {
		return 3;
	}
	return 0;
};

/**
 * This class queries the ml api information
 * @class Training
 */
export default (props) => {
	// Set state variables
	const [APITrainData, setAPITrainData] = useState({});
	const [startDate, setStartDate] = useState(moment().subtract(6, 'months').set({ hour: 0, minute: 0 })._d);
	const [endDate, setEndDate] = useState(moment()._d);
	const [corpus, setCorpus] = useState(S3_CORPUS_PATH);
	const [s3List, setS3List] = useState([]);
	const [s3DataList, setS3DataList] = useState([]);
	const [modelTable, setModelTable] = useState([]);
	const [dataTable, setDataTable] = useState([]);

	const [deleteModal, setDeleteModal] = useState({
		show: false,
		model: '',
		type: '',
	});

	const [modelName, setModelName] = useState(DEFAULT_MODEL_NAME);
	const [evalModelName, setEvalModelName] = useState('');
	const [version, setVersion] = useState(DEFAULT_VERSION);
	const [qexpversion, setQexpVersion] = useState(DEFAULT_VERSION);
	const [qexpupload, setQexpUpload] = useState(false);
	const [topicsUpload, setTopicsUpload] = useState(false);
	const [topicsSampling, setTopicsSampling] = useState(0.1);
	const [topicsVersion, setTopicsVersion] = useState(DEFAULT_VERSION);

	const [gpu, setgpu] = useState(true);
	const [upload, setUpload] = useState(false);
	const [baseModel, setBaseModel] = useState('msmarco-distilbert-base-v2');
	const [warmupSteps, setWarmupSteps] = useState(100);
	const [epochs, setEpochs] = useState(10);
	const [testingOnly, setTesting] = useState(false);
	const [remakeTD, setRemakeTD] = useState(true);

	const [ltrInitializedStatus, setLTRInitializedStatus] = useState(null);
	const [ltrModelCreatedStatus, setLTRModelCreatedStatus] = useState(null);
	const [corpusCount, setCorpusCount] = useState(0);

	// flags that parameters have been changed and on
	// blur or enter press we should update the query
	const [downloading, setDownloading] = useState(false);

	/**
	 * Load all the initial data on transformers and s3
	 * @method onload
	 */
	const onload = async () => {
		getAPIInformationTrain();
		getModelsList(setModelTable, props);
		getLocalData(setDataTable);
		getCorpusCount(setCorpusCount, props);
	};

	useEffect(() => {
		getS3List(setS3List, props);
		getS3DataList(setS3DataList, props);
		props.getProcesses();
		// eslint-disable-next-line
	}, []);

	const deleteLocalModels = async (model, type) => {
		setDeleteModal({
			show: false,
			model: '',
			type: '',
		});
		await gameChangerAPI.deleteLocalModelTrain({
			model: model,
			type: type,
		});
		props.getProcesses();
		getModelsList(setModelTable, props);
	};
	/**
	 * Get the general information for the API
	 * @method getAPIInformationTrain
	 */
	const getAPIInformationTrain = async () => {
		try {
			// set APIData
			const info = await gameChangerAPI.getAPIInformationTrain();
			setAPITrainData(info.data);
			props.updateTrainLogs('Successfully queried train api information', 0);
		} catch (e) {
			props.updateTrainLogs('Error querying train api information: ' + e.toString(), 2);
			throw e;
		}
	};

	/**
	 * Pass a file from s3 to download into the ml-api
	 * @method downloadS3File
	 */
	const downloadS3FileTrain = async (row, type) => {
		await gameChangerAPI.downloadS3FileTrain({
			file: row.original.file,
			type: type,
		});
		props.getProcesses();
	};

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
							downloadS3FileTrain(row, 'models');
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
							downloadS3FileTrain(row, 'ml-data');
						}}
						style={{ color: 'white' }}
					>
						<CloudDownload fontSize="large" />
					</IconButton>
				</TableRow>
			),
		},
	];

	useEffect(() => {
		onload();
		// eslint-disable-next-line
	}, []);

	return (
		<div>
			<Modal
				isOpen={deleteModal.show}
				onRequestClose={() =>
					setDeleteModal({
						show: false,
						model: '',
						type: '',
					})
				}
				style={styles.esIndexModal}
			>
				<div>
					<Typography>Are you sure you want to delete {deleteModal.model}</Typography>
				</div>
				<div
					style={{
						position: 'absolute',
						bottom: 0,
						justifyContent: 'flex-end',
					}}
				>
					<GCButton
						id={'modelDeleteConfirm'}
						onClick={() => deleteLocalModels(deleteModal.model, deleteModal.type)}
						style={{ margin: '25px' }}
						buttonColor={'#8091A5'}
					>
						Yes
					</GCButton>
					<GCButton
						id={'modelModalClose'}
						onClick={() =>
							setDeleteModal({
								show: false,
								model: '',
								type: '',
							})
						}
						style={{ margin: '25px' }}
						buttonColor={'#8091A5'}
					>
						No
					</GCButton>
				</div>
			</Modal>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					margin: '10px 80px',
				}}
			>
				<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>General Information</p>

				<GCButton
					onClick={() => {
						onload();
					}}
					style={{ minWidth: 'unset' }}
				>
					Refresh
				</GCButton>
			</div>
			<div>
				<div>
					<Processes processData={getAllProcessData(props)} />
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
						<div style={{ display: 'inline-block', fontWeight: 'bold' }}>Current State:</div>
						<Tooltip
							title={'Connection ' + status[getConnectionStatus(props)].toUpperCase()}
							placement="right"
							arrow
						>
							<StatusCircle className={status[getConnectionStatus(props)]} />
						</Tooltip>
					</div>
					<fieldset className={'field'}>
						<div className="info-container">
							<div style={{ width: '35%', boxSizing: 'border-box', fontWeight: 'bold' }} className="half">
								Application: <br />
								Version: <br />
								Connection Status: <br />
								Last Queried: <br />
								Elasticsearch Host: <br />
								Elasticsearch Status: <br />
								Host: <br />
								Files in corpus: <br />
							</div>
							<div style={{ width: '65%' }} className="half">
								{APITrainData.API_Name} {APITrainData.Container_Type}
								<br />
								{APITrainData.Version} <br />
								{status[getConnectionStatus(props)].toUpperCase()} <br />
								{getLastQueried(props)} <br />
								{APITrainData.Elasticsearch_Host} <br />
								{APITrainData.Elasticsearch_Status} <br />
								{APITrainData.host} <br />
								{corpusCount} <br />
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
								data={props.apiTrainErrors}
								columns={apiColumns}
								className="striped -highlight"
								defaultSorted={[{ id: 'searchtime', desc: true }]}
								defaultPageSize={5}
							/>
						</div>
					</fieldset>
				</BorderDiv>
				<BorderDiv className="half">
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
				<BorderDiv className="half" style={{ float: 'right' }}>
					<div
						style={{
							width: '100%',
							display: 'inline-block',
							paddingBottom: '5px',
						}}
					>
						<div style={{ display: 'inline-block' }}>
							<b>Local Models:</b>
						</div>
					</div>
					<fieldset className={'field'}>
						<div className="info-container">
							<ReactTable
								data={modelTable}
								columns={modelColumns}
								className="striped -highlight"
								defaultPageSize={10}
								SubComponent={(row) => {
									return (
										<div className="code-container">
											<pre className="code-block">
												<code>{row.original.config}</code>
											</pre>
											<GCButton
												onClick={() => {
													setDeleteModal({
														show: true,
														model: row.original.model,
														type: row.original.type,
													});
												}}
												style={{ float: 'left', minWidth: 'unset' }}
											>
												Delete
											</GCButton>
										</div>
									);
								}}
							/>
						</div>
					</fieldset>
				</BorderDiv>
				<BorderDiv className="half" style={{ float: 'right' }}>
					<div
						style={{
							width: '100%',
							display: 'inline-block',
							paddingBottom: '5px',
						}}
					>
						<div style={{ display: 'inline-block' }}>
							<b>Local Data:</b>
						</div>
					</div>
					<fieldset className={'field'}>
						<div className="info-container">
							<ReactTable
								data={dataTable}
								columns={dataColumns}
								className="striped -highlight"
								defaultPageSize={10}
								SubComponent={(row) => {
									return (
										<div className="code-container" style={{ padding: '15px', color: 'black' }}>
											Files
											<ul>
												{row.original.files.map((d, indexAsKey) => (
													<li key={indexAsKey}>{d}</li>
												))}
											</ul>
											Directories
											<ul>
												{row.original.subdirectories.map((d, indexAsKey) => (
													<li key={indexAsKey}>{d}</li>
												))}
											</ul>
										</div>
									);
								}}
							/>
						</div>
					</fieldset>
				</BorderDiv>
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
						<GCButton
							onClick={() => {
								triggerDownloadModel(props, setDownloading);
							}}
							disabled={downloading}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Download
						</GCButton>
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
						<GCButton
							onClick={() => {
								sendUserAggData(startDate, endDate);
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Send Data
						</GCButton>
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
						<GCButton
							onClick={() => {
								triggerDownloadCorpus(props, corpus);
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Download
						</GCButton>
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
				<BorderDiv className="half">
					<div
						style={{
							width: '100%',
							display: 'inline-block',
							paddingBottom: '5px',
						}}
					>
						<div style={{ display: 'inline-block' }}>
							<b>API Controls:</b>
						</div>
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
						<b>Sentence Embedding Model</b>
						<br />
						<GCButton
							onClick={() => {
								triggerTrainModel(props, version, modelName, gpu, upload);
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Train
						</GCButton>

						<div>
							<div style={{ width: '120px', display: 'inline-block' }}>Encoder Model:</div>
							<Input
								value={modelName}
								onChange={(e) => setModelName(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '200px', margin: '10px' }}
							/>
						</div>
						<div>
							<div
								style={{
									width: '60px',
									display: 'inline-block',
								}}
							>
								GPU:
							</div>
							<Checkbox checked={gpu} onChange={(e) => setgpu(e.target.checked)} />
							<div style={{ width: '120px', display: 'inline-block', marginLeft: '10px' }}>Version:</div>
							<Input
								value={version}
								onChange={(e) => setVersion(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '120px', margin: '10px' }}
							/>
							<div
								style={{
									width: '60px',
									display: 'inline-block',
									marginLeft: '10px',
								}}
							>
								Upload:
							</div>
							<Checkbox checked={upload} onChange={(e) => setUpload(e.target.checked)} />
						</div>
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
						<b>Query Expansion Model</b>
						<br />
						<GCButton
							onClick={() => {
								triggerTrainQexp(props, qexpversion, qexpupload);
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Train
						</GCButton>

						<div>
							<div style={{ width: '120px', display: 'inline-block', marginLeft: '10px' }}>Version:</div>
							<Input
								value={qexpversion}
								onChange={(e) => setQexpVersion(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '120px', margin: '10px' }}
							/>
							<div
								style={{
									width: '60px',
									display: 'inline-block',
									marginLeft: '10px',
								}}
							>
								Upload:
							</div>
							<Checkbox checked={qexpupload} onChange={(e) => setQexpUpload(e.target.checked)} />
						</div>
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
						<b>Topic Model</b>
						<br />
						<GCButton
							onClick={() => {
								triggerTrainTopics(props, topicsSampling, topicsUpload, topicsVersion);
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Train
						</GCButton>

						<div>
							<div style={{ width: '120px', display: 'inline-block', marginLeft: '10px' }}>Version:</div>
							<Input
								value={topicsVersion}
								onChange={(e) => setTopicsVersion(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '120px', margin: '10px' }}
							/>
							<div
								style={{
									width: '60px',
									display: 'inline-block',
									marginLeft: '10px',
								}}
							>
								Sampling:
							</div>
							<Input
								value={topicsSampling}
								onChange={(e) => setTopicsSampling(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '120px', margin: '10px' }}
							/>
							<div
								style={{
									width: '60px',
									display: 'inline-block',
									marginLeft: '10px',
								}}
							>
								Upload:
							</div>
							<Checkbox checked={topicsUpload} onChange={(e) => setTopicsUpload(e.target.checked)} />
						</div>
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
						<b>Finetune Models</b>
						<br />
						<GCButton
							onClick={() => {
								triggerFinetuneModel(props, epochs, warmupSteps, baseModel, remakeTD, testingOnly);
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Train
						</GCButton>

						<div>
							<div style={{ width: '60px', display: 'inline-block' }}>Base Model:</div>
							<Input
								value={baseModel}
								onChange={(e) => setBaseModel(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '200px', margin: '10px' }}
							/>
						</div>
						<div>
							<div style={{ width: '60px', display: 'inline-block' }}>Warmup Steps:</div>
							<Input
								value={warmupSteps}
								onChange={(e) => setWarmupSteps(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '20px', margin: '10px' }}
							/>
						</div>
						<div>
							<div style={{ width: '60px', display: 'inline-block' }}>Epochs:</div>
							<Input
								value={epochs}
								onChange={(e) => setEpochs(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '20px', margin: '10px' }}
							/>
						</div>
						<div>
							<div
								style={{
									width: '60px',
									display: 'inline-block',
									marginLeft: '10px',
								}}
							>
								Remake Training Data:
							</div>
							<Checkbox checked={remakeTD} onChange={(e) => setRemakeTD(e.target.checked)} />
							<div
								style={{
									width: '60px',
									display: 'inline-block',
									marginLeft: '10px',
								}}
							>
								Testing Only:
							</div>
							<Checkbox checked={testingOnly} onChange={(e) => setTesting(e.target.checked)} />
						</div>
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
						<b>Evaluate Models</b>
						<br />
						<GCButton
							onClick={() => {
								triggerEvaluateModel(props, evalModelName);
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Evaluate
						</GCButton>
						<div>
							<div style={{ width: '120px', display: 'inline-block' }}>Model:</div>
							<Input
								value={evalModelName}
								onChange={(e) => setEvalModelName(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '200px', margin: '10px' }}
							/>
						</div>
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
						<b>Learn to Rank Model</b>
						<br />
						<br />
						<GCButton
							onClick={() => {
								triggerInitializeLTR(props, setLTRInitializedStatus);
							}}
							style={{ margin: '0 10px 10px 0', minWidth: 'unset' }}
						>
							Initialize
						</GCButton>
						{ltrInitializedStatus && (
							<div
								style={{
									minWidth: '200px',
									display: 'inline-block',
								}}
							>
								{ltrInitializedStatus === 200
									? 'Initialize request successful'
									: `Initialize reqeust returned code ${ltrInitializedStatus}`}
							</div>
						)}
						<br />
						<GCButton
							onClick={() => {
								triggerCreateModelLTR(props, setLTRModelCreatedStatus);
							}}
							style={{ margin: '0 10px 0 0', minWidth: 'unset' }}
						>
							Create Model
						</GCButton>
						{ltrModelCreatedStatus && (
							<div
								style={{
									minWidth: '200px',
									display: 'inline-block',
								}}
							>
								{ltrModelCreatedStatus === 200
									? 'Create model request successful'
									: `Create model reqeust returned code ${ltrModelCreatedStatus}`}
							</div>
						)}
					</div>
				</BorderDiv>
			</div>
		</div>
	);
};
