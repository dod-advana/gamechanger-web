import React, { useState, useEffect } from 'react';
import { Select, MenuItem, Tooltip, IconButton, Typography, TextField } from '@material-ui/core';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { CloudDownload } from '@material-ui/icons';
import Modal from 'react-modal';
import Autocomplete from '@mui/material/Autocomplete';
import GCButton from '../../common/GCButton';
import 'react-datepicker/dist/react-datepicker.css';

import { TableRow, StatusCircle, BorderDiv } from './util/styledDivs';
import { styles } from '../util/GCAdminStyles';
import GameChangerAPI from '../../api/gameChanger-service-api';
import Processes from './processes';

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

/**
 * Takes a String and checks if it is in any of the flag keys and checks
 * those values. If any of them are true it returns true
 * @method checkFlag
 * @param {String} flag
 * @returns boolean
 */
const checkFlag = (flag, props) => {
	let flagged = false;
	if (props.processes.process_status && props.processes.process_status.flags) {
		const flags = props.processes.process_status.flags;
		for (const key in flags) {
			if (key.includes(flag) && flags[key]) {
				flagged = true;
			}
		}
	}
	return flagged;
};

/**
 * Get a list of all the proccesses running and completed
 * @method getAllProcessData
 */
const getAllProcessData = (props) => {
	const processList = [];
	for (const key in props.processes.process_status) {
		const status = key !== 'flags' ? props.processes.process_status[key]['container'] : '';
		if (status !== 'training' && key !== 'flags') {
			processList.push({
				...props.processes.process_status[key],
				thread_id: key,
				date: 'Currently Running',
			});
		}
	}
	if (props.processes.completed_process) {
		for (const completed of props.processes.completed_process) {
			const completed_process = completed.process.split(': ');
			if (completed.container !== 'training') {
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
 * Pass a file from s3 to download into the ml-api
 * @method downloadS3File
 */
const downloadS3File = async (row, type, props) => {
	await gameChangerAPI.downloadS3File({
		file: row.original.file,
		type: type,
	});
	props.getProcesses();
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
		props.updateLogs('Successfully queried files in corpus', 0);
	} catch (e) {
		props.updateLogs('Error querying files in corpus: ' + e.toString(), 2);
		throw e;
	}
};

/**
 * Get a list of all the downloaded sentence index, qexp, and transformers.
 * @method getModelsList
 */
const getModelsList = async (setDownloadedModelsList, setModelTable, props) => {
	try {
		// set downloadedModelsList
		const list = await gameChangerAPI.getModelsList();
		setDownloadedModelsList(list.data);
		const modelList = [];
		for (const type in list.data) {
			for (const model in list.data[type]) {
				modelList.push({
					type,
					model,
					config: JSON.stringify(list.data[type][model], null, 2),
				});
			}
		}
		setModelTable(modelList);
		props.updateLogs('Successfully queried models list', 0);
	} catch (e) {
		props.updateLogs('Error querying models list: ' + e.toString(), 2);
		throw e;
	}
};

/**
 * Get user aggregations data and sends that to the ml-api
 * @method sendUserAggData
 */
const sendUserAggData = async () => {
	try {
		gameChangerAPI.sendUserAggregations();
	} catch (e) {
		console.error(e);
	}
};

/**
 * @method triggerReloadModels
 */
const triggerReloadModels = async (
	props,
	selectedSentence,
	docCompareSelectedSentence,
	selectedQEXP,
	selectedTopicModel,
	selectedJbookQEXP,
	selectedQAModel
) => {
	try {
		const params = {};
		if (selectedSentence) {
			params['sentence'] = selectedSentence;
		}
		if (docCompareSelectedSentence) {
			params['doc_compare_sentence'] = docCompareSelectedSentence;
		}
		if (selectedQEXP) {
			params['qexp'] = selectedQEXP;
		}
		if (selectedTopicModel) {
			params['topic_models'] = selectedTopicModel;
		}
		if (selectedJbookQEXP) {
			params['jbook_qexp'] = selectedJbookQEXP;
		}
		if (selectedQAModel) {
			params['qa_model'] = selectedQAModel;
		}
		await gameChangerAPI.reloadModels(params);
		props.updateLogs('Reloaded Models', 0);
		props.getProcesses();
	} catch (e) {
		props.updateLogs('Error reloading models: ' + e.toString(), 2);
	}
};

/**
 * @method getCache
 */
const getCache = async (props, setCacheOptions) => {
	try {
		const cache = await gameChangerAPI.getCache();
		setCacheOptions(cache.data);
		props.getProcesses();
	} catch (e) {
		props.updateLogs('Error clearing all cache: ' + e.toString(), 2);
	}
};

/**
 * @method clearAllCache
 */
const clearAllCache = async (props, setSelectedCache, setCacheOptions) => {
	try {
		await gameChangerAPI.clearCache({
			clear: [],
		});
		props.getProcesses();
		setSelectedCache([]);
		getCache(props, setCacheOptions);
	} catch (e) {
		props.updateLogs('Error clearing all cache: ' + e.toString(), 2);
	}
};

/**
 * @method clearSelectCache
 */
const clearSelectCache = async (props, selectedCache, setSelectedCache, setCacheOptions) => {
	try {
		await gameChangerAPI.clearCache({
			clear: selectedCache,
		});
		props.getProcesses();
		setSelectedCache([]);
		getCache(props, setCacheOptions);
	} catch (e) {
		props.updateLogs('Error clearing selected cache: ' + e.toString(), 2);
	}
};
/**
/**
 * This class queries the ml api information
 * @class Info
 */
export default (props) => {
	// Set state variables
	const [APIData, setAPIData] = useState({});
	const [s3List, setS3List] = useState([]);
	const [modelTable, setModelTable] = useState([]);

	const [currentSimModel, setCurrentSim] = useState('');
	const [currentEncoder, setCurrentEncoder] = useState('');
	const [currentSentenceIndex, setCurrentSentenceIndex] = useState('');
	const [currentDocCompareSimModel, setCurrentDocCompareSim] = useState('');
	const [currentDocCompareEncoder, setCurrentDocCompareEncoder] = useState('');
	const [currentDocCompareIndex, setCurrentDocCompareIndex] = useState('');
	const [currentQexp, setCurrentQexp] = useState('');
	const [currentQa, setCurrentQa] = useState('');
	const [currentJbook, setCurrentJbook] = useState('');
	const [currentWordSim, setCurrentWordSim] = useState('');
	const [currentTopicModel, setCurrentTopicModel] = useState('');

	const [selectedCache, setSelectedCache] = useState([]);
	const [cacheOptions, setCacheOptions] = useState([]);
	const [selectedSentence, setSelectedSentence] = useState('');
	const [docCompareSelectedSentence, setDocCompareSelectedSentence] = useState('');
	const [selectedQEXP, setSelectedQEXP] = useState('');
	const [selectedJbookQEXP, setSelectedJbookQEXP] = useState('');
	const [selectedTopicModel, setSelectedTopicModel] = useState('');
	const [selectedQAModel, setSelectedQAModel] = useState('');
	const [corpusCount, setCorpusCount] = useState(0);

	const [downloadedModelsList, setDownloadedModelsList] = useState({
		transformers: {},
		sentence: {},
		qexp: {},
		topic_models: {},
		jbook_qexp: {},
		qa_model: {},
	});
	const [deleteModal, setDeleteModal] = useState({
		show: false,
		model: '',
		type: '',
	});
	/**
	 * Load all the initial data on transformers and s3
	 * @method onload
	 */
	const onload = async () => {
		const loadingModels = [
			setCurrentEncoder,
			setCurrentSim,
			setCurrentSentenceIndex,
			setCurrentDocCompareEncoder,
			setCurrentDocCompareSim,
			setCurrentDocCompareIndex,
			setCurrentQexp,
			setCurrentQa,
			setCurrentJbook,
			setCurrentWordSim,
			setCurrentTopicModel,
		];
		getAPIInformation();
		getModelsList(setDownloadedModelsList, setModelTable, props);
		getLoadedModels(loadingModels, props);
		getCorpusCount(setCorpusCount, props);
		getCache(props, setCacheOptions);
	};

	useEffect(() => {
		getS3List();
		props.getProcesses();
		// eslint-disable-next-line
	}, []);

	/**
	 * @method checkCorpusDownloading
	 */
	const checkCorpusDownloading = () => {
		let downloading = checkFlag('corpus:', props);
		return ('' + downloading).toUpperCase();
	};
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
	 * Retrieves the current transformer from gameChangerAPI.getLoadedModels()
	 * @method getLoadedModels
	 */
	const getLoadedModels = async (loadingFunctions, props) => {
		try {
			const [
				setCurrentEncoder,
				setCurrentSim,
				setCurrentSentenceIndex,
				setCurrentDocCompareEncoder,
				setCurrentDocCompareSim,
				setCurrentDocCompareIndex,
				setCurrentQexp,
				setCurrentQa,
				setCurrentJbook,
				setCurrentWordSim,
				setCurrentTopicModel,
			] = loadingFunctions;
			// set currentTransformer
			const current = await gameChangerAPI.getLoadedModels();
			// current.data is of the form {sentence_models:{encoder, sim}}
			//setCurrentTransformer(
			//	current.data.sentence_models
			//		? current.data.sentence_models
			//		: initTransformer
			//);
			setCurrentEncoder(current.data.encoder_model ? current.data.encoder_model.replace(/^.*[\\/]/, '') : '');
			setCurrentSim(current.data.sim_model ? current.data.sim_model.replace(/^.*[\\/]/, '') : '');
			setCurrentSentenceIndex(
				current.data.sentence_index ? current.data.sentence_index.replace(/^.*[\\/]/, '') : ''
			);
			setCurrentDocCompareEncoder(
				current.data.doc_compare_encoder_model
					? current.data.doc_compare_encoder_model.replace(/^.*[\\/]/, '')
					: ''
			);
			setCurrentDocCompareSim(
				current.data.doc_compare_sim_model ? current.data.doc_compare_sim_model.replace(/^.*[\\/]/, '') : ''
			);
			setCurrentDocCompareIndex(
				current.data.doc_compare_sentence_index
					? current.data.doc_compare_sentence_index.replace(/^.*[\\/]/, '')
					: ''
			);
			setCurrentQexp(current.data.qexp_model ? current.data.qexp_model.replace(/^.*[\\/]/, '') : '');
			setCurrentQa(current.data.qa_model ? current.data.qa_model.replace(/^.*[\\/]/, '') : '');
			setCurrentJbook(current.data.jbook_model ? current.data.jbook_model.replace(/^.*[\\/]/, '') : '');
			setCurrentWordSim(current.data.wordsim_model ? current.data.wordsim_model.replace(/^.*[\\/]/, '') : '');
			setCurrentTopicModel(current.data.topic_model ? current.data.topic_model.replace(/^.*[\\/]/, '') : '');

			props.updateLogs('Successfully queried current loaded models.', 0);
		} catch (e) {
			props.updateLogs('Error querying current loaded models: ' + e.toString(), 2);
			throw e;
		}
	};
	const deleteLocalModels = async (model, type) => {
		setDeleteModal({
			show: false,
			model: '',
			type: '',
		});
		await gameChangerAPI.deleteLocalModel({
			model: model,
			type: type,
		});
		props.getProcesses();
		getModelsList(setDownloadedModelsList, setModelTable, props);
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
			if (mostRecent === '' || Date.parse(message.timeStamp) > Date.parse(mostRecent)) {
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
			Header: 'Inference',
			accessor: '',
			Cell: (row) => (
				<TableRow>
					<IconButton
						onClick={() => {
							downloadS3File(row, 'models', props);
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
							title={'Connection ' + status[getConnectionStatus()].toUpperCase()}
							placement="right"
							arrow
						>
							<StatusCircle className={status[getConnectionStatus()]} />
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
							</div>
							<div style={{ width: '65%' }} className="half">
								{APIData.API_Name} {APIData.Container_Type}
								<br />
								{APIData.Version} <br />
								{status[getConnectionStatus()].toUpperCase()} <br />
								{getLastQueried()} <br />
								{APIData.Elasticsearch_Host} <br />
								{APIData.Elasticsearch_Status} <br />
								{APIData.host} <br />
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
						}}
					>
						<div style={{ display: 'inline-block' }}>
							{' '}
							<b>Local State:</b>
						</div>
					</div>
					<fieldset className={'field'}>
						<div className="info-container">
							<div style={{ width: '35%', boxSizing: 'border-box', fontWeight: 'bold' }} className="half">
								Corpus:
								<br />
								<div style={{ paddingLeft: '15px' }}>Files in corpus:</div>
								<div style={{ paddingLeft: '15px' }}>Downloading:</div>
								Loaded Models:
								<br />
								<div style={{ paddingLeft: '15px' }}>Sentence Index:</div>
								<div style={{ paddingLeft: '15px' }}>Policy QExp:</div>
								<div style={{ paddingLeft: '15px' }}>Question Answer:</div>
								<div style={{ paddingLeft: '15px' }}>Jbook QExp:</div>
								<div style={{ paddingLeft: '15px' }}>Word Similarity:</div>
								<div style={{ paddingLeft: '15px' }}>Doc Compare Sentence Index:</div>
								<div style={{ paddingLeft: '15px' }}>Topic Model:</div>
								<div style={{ paddingLeft: '15px' }}>Transformer:</div>
								<div style={{ paddingLeft: '30px' }}>Encoder:</div>
								<div style={{ paddingLeft: '30px' }}>Sim:</div>
								<div style={{ paddingLeft: '30px' }}>Doc Compare Encoder:</div>
								<div style={{ paddingLeft: '30px' }}>Doc Compare Sim:</div>
							</div>
							<div style={{ width: '65%' }} className="half">
								<br />
								{corpusCount} <br />
								{checkCorpusDownloading()} <br />
								<br />
								{currentSentenceIndex} <br />
								{currentQexp} <br />
								{currentQa} <br />
								{currentJbook} <br />
								{currentWordSim} <br />
								{currentDocCompareIndex} <br />
								{currentTopicModel} <br />
								<br />
								{currentEncoder.replace(/^.*[\\/]/, '')}
								<br />
								{currentSimModel.replace(/^.*[\\/]/, '')}
								<br />
								{currentDocCompareEncoder.replace(/^.*[\\/]/, '')}
								<br />
								{currentDocCompareSimModel.replace(/^.*[\\/]/, '')}
							</div>
						</div>
					</fieldset>
				</BorderDiv>
				<BorderDiv className="half">
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
				<BorderDiv className="half" style={{ float: 'right' }}>
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
								data={s3List}
								columns={s3Columns}
								className="striped -highlight"
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
						<b>Reload Models</b>
						<br />
						<GCButton
							onClick={() => {
								triggerReloadModels(
									props,
									selectedSentence,
									docCompareSelectedSentence,
									selectedQEXP,
									selectedTopicModel,
									selectedJbookQEXP,
									selectedQAModel
								);
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Reload
						</GCButton>
						<div>
							<div>
								<div style={{ width: '120px', display: 'inline-block' }}>SENTENCE EMBEDDINGS:</div>
								<Select
									value={selectedSentence}
									onChange={(e) => setSelectedSentence(e.target.value)}
									name="labels"
									style={{
										fontSize: 'small',
										minWidth: '200px',
										margin: '10px',
									}}
								>
									{Object.keys(downloadedModelsList.sentence).map((name) => {
										return (
											<MenuItem style={{ fontSize: 'small', display: 'flex' }} value={name}>
												{name}
											</MenuItem>
										);
									})}
								</Select>
							</div>

							<div>
								<div style={{ width: '120px', display: 'inline-block' }}>QEXP MODEL:</div>
								<Select
									value={selectedQEXP}
									onChange={(e) => setSelectedQEXP(e.target.value)}
									name="labels"
									style={{
										fontSize: 'small',
										minWidth: '200px',
										margin: '10px',
									}}
								>
									{Object.keys(downloadedModelsList.qexp).map((name) => {
										return (
											<MenuItem style={{ fontSize: 'small', display: 'flex' }} value={name}>
												{name}
											</MenuItem>
										);
									})}
								</Select>
							</div>
							<div>
								<div style={{ width: '120px', display: 'inline-block' }}>JBOOK QEXP MODEL:</div>
								<Select
									value={selectedJbookQEXP}
									onChange={(e) => setSelectedJbookQEXP(e.target.value)}
									name="labels"
									style={{
										fontSize: 'small',
										minWidth: '200px',
										margin: '10px',
									}}
								>
									{Object.keys(downloadedModelsList.jbook_qexp).map((name) => {
										return (
											<MenuItem style={{ fontSize: 'small', display: 'flex' }} value={name}>
												{name}
											</MenuItem>
										);
									})}
								</Select>
							</div>
							<div>
								<div style={{ width: '120px', display: 'inline-block' }}>TOPIC MODEL:</div>
								<Select
									value={selectedTopicModel}
									onChange={(e) => setSelectedTopicModel(e.target.value)}
									name="labels"
									style={{
										fontSize: 'small',
										minWidth: '200px',
										margin: '10px',
									}}
								>
									{Object.keys(downloadedModelsList.topic_models).map((name) => {
										return (
											<MenuItem style={{ fontSize: 'small', display: 'flex' }} value={name}>
												{name}
											</MenuItem>
										);
									})}
								</Select>
							</div>
							<div>
								<div style={{ width: '120px', display: 'inline-block' }}>QA MODEL:</div>
								<Select
									value={selectedQAModel}
									onChange={(e) => setSelectedQAModel(e.target.value)}
									name="labels"
									style={{
										fontSize: 'small',
										minWidth: '200px',
										margin: '10px',
									}}
								>
									{Object.keys(downloadedModelsList.transformers).map((name) => {
										return (
											<MenuItem style={{ fontSize: 'small', display: 'flex' }} value={name}>
												{name}
											</MenuItem>
										);
									})}
								</Select>
							</div>
							<div>
								<div style={{ width: '120px', display: 'inline-block' }}>
									DOC COMPARE SENTENCE EMBEDDINGS:
								</div>
								<Select
									value={docCompareSelectedSentence}
									onChange={(e) => setDocCompareSelectedSentence(e.target.value)}
									name="labels"
									style={{
										fontSize: 'small',
										minWidth: '200px',
										margin: '10px',
									}}
								>
									{Object.keys(downloadedModelsList.sentence).map((name) => {
										return (
											<MenuItem style={{ fontSize: 'small', display: 'flex' }} value={name}>
												{name}
											</MenuItem>
										);
									})}
								</Select>
							</div>
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
						<b>Send User Data to ML-API</b>
						<GCButton
							onClick={() => {
								sendUserAggData();
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Send Data
						</GCButton>
					</div>
				</BorderDiv>
				<BorderDiv className="half">
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
						<div style={{ display: 'inline-block' }}>
							<b>Cache Control:</b>
						</div>
						<div
							style={{
								padding: '20px',
								marginBottom: '10px',
							}}
						>
							<Autocomplete
								multiple
								disablePortal
								id="combo-box-demo"
								options={cacheOptions}
								sx={{ width: 300 }}
								renderInput={(params) => <TextField {...params} label="Saved Searches" />}
								value={selectedCache}
								onChange={(_event, newValue) => {
									setSelectedCache(newValue);
								}}
							/>
						</div>
						<GCButton
							onClick={() => {
								clearSelectCache(props, selectedCache, setSelectedCache, setCacheOptions);
							}}
							style={{ minWidth: 'unset' }}
						>
							Clear Selected Cache
						</GCButton>
						<GCButton
							onClick={() => {
								clearAllCache(props, setSelectedCache, setCacheOptions);
							}}
							style={{ minWidth: 'unset' }}
						>
							Clear All Cache
						</GCButton>
					</div>
				</BorderDiv>
			</div>
		</div>
	);
};
