import React, { useState, useEffect } from 'react';
import { Select, MenuItem, Input, Checkbox, Typography } from '@material-ui/core';
import ReactTable from 'react-table';
import Modal from 'react-modal';
import { BorderDiv, TableRow } from './util/styledDivs';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCPrimaryButton from '../../common/GCButton';
import GCButton from '../../common/GCButton';

import { styles } from '../util/GCAdminStyles';
import 'react-table/react-table.css';
import './index.scss';
import Processes from './processes';

const gameChangerAPI = new GameChangerAPI();

const DEFAULT_MODEL_NAME = 'msmarco-distilbert-base-v2';
const DEFAULT_VERSION = 'v4';
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
 * This class provides controls to veiw and control the
 * resouces loaded locally to the ml api.
 * @class Models
 */
export default (props) => {
	// Set state variables
	const [downloadedModelsList, setDownloadedModelsList] = useState({
		transformers: {},
		sentence: {},
		qexp: {},
		topic_models: {},
		jbook_qexp: {}
	});
	const [deleteModal,setDeleteModal] = useState({
		show:false,
		model:'',
		type:''
	})
	const [modelTable, setModelTable] = useState([]);
	const [dataTable, setDataTable] = useState([])
	//const [currentTransformer, setCurrentTransformer] = useState(initTransformer);
	const [currentSimModel, setCurrentSim] = useState('');
	const [currentEncoder, setCurrentEncoder] = useState('');
	const [currentSentenceIndex, setCurrentSentenceIndex] = useState('');
	const [currentQexp, setCurrentQexp] = useState('');
	const [currentQa, setCurrentQa] = useState('');
	const [currentJbook, setCurrentJbook] = useState('');
	const [currentWordSim, setCurrentWordSim] = useState('');
	const [currentTopicModel, setCurrentTopicModel] = useState('');

	const [corpusCount, setCorpusCount] = useState(0);

	const [selectedSentence, setSelectedSentence] = useState('');
	const [selectedQEXP, setSelectedQEXP] = useState('');
	const [selectedJbookQEXP, setSelectedJbookQEXP] = useState('');
	const [selectedTopicModel, setSelectedTopicModel] = useState('');

	const [modelName, setModelName] = useState(DEFAULT_MODEL_NAME);
	const [evalModelName, setEvalModelName] = useState('');
	const [evalType, setEvalType] = useState('original');
	const [validationData, setValidationData] = useState('latest');
	const [sampleLimit, setSampleLimit] = useState(15000);
	const [version, setVersion] = useState(DEFAULT_VERSION);
	const [qexpversion, setQexpVersion] = useState(DEFAULT_VERSION);
	const [qexpupload, setQexpUpload] = useState(false);
	const [topicsUpload, setTopicsUpload] = useState(false);
	const [topicsSampling, setTopicsSampling] = useState(0.1);
	const [topicsVersion, setTopicsVersion] = useState(DEFAULT_VERSION);

	const [gpu, setgpu] = useState(true);
	const [upload, setUpload] = useState(false);
	const [warmupSteps, setWarmupSteps] = useState(100);
	const [epochs, setEpochs] = useState(10);
	
	const [ltrInitializedStatus, setLTRInitializedStatus] = useState(null);
	const [ltrModelCreatedStatus, setLTRModelCreatedStatus] = useState(null);
	/**
	 * Load all the initial data on transformers and s3
	 * @method onload
	 */
	const onload = async () => {
		getLoadedModels();
		getModelsList();
		getCorpusCount();
		getLocalData();
	};
	/**
	 * Retrieves the current transformer from gameChangerAPI.getLoadedModels()
	 * @method getLoadedModels
	 */
	const getLoadedModels = async () => {
		try {
			// set currentTransformer
			const current = await gameChangerAPI.getLoadedModels();
			// current.data is of the form {sentence_models:{encoder, sim}}
			//setCurrentTransformer(
			//	current.data.sentence_models
			//		? current.data.sentence_models
			//		: initTransformer
			//);
			setCurrentEncoder(
				current.data.encoder_model
					? current.data.encoder_model.replace(/^.*[\\/]/, '')
					: ''
			);
			setCurrentSim(
				current.data.sim_model
					? current.data.sim_model.replace(/^.*[\\/]/, '')
					: ''
			);
			setCurrentSentenceIndex(
				current.data.sentence_index
					? current.data.sentence_index.replace(/^.*[\\/]/, '')
					: ''
			);
			setCurrentQexp(
				current.data.qexp_model
					? current.data.qexp_model.replace(/^.*[\\/]/, '')
					: ''
			);
			setCurrentQa(
				current.data.qa_model
					? current.data.qa_model.replace(/^.*[\\/]/, '')
					: ''
			);
			setCurrentJbook(
				current.data.jbook_model
					? current.data.jbook_model.replace(/^.*[\\/]/, '')
					: ''
			);
			setCurrentWordSim(
				current.data.wordsim_model
					? current.data.wordsim_model.replace(/^.*[\\/]/, '')
					: ''
			);
			setCurrentTopicModel(
				current.data.topic_model
					? current.data.topic_model.replace(/^.*[\\/]/, '')
					: ''
			);
			props.updateLogs('Successfully queried current loaded models.', 0);
		} catch (e) {
			props.updateLogs(
				'Error querying current loaded models: ' + e.toString(),
				2
			);
			throw e;
		}
	};


	const deleteLocalModels = async (model,type) =>{
		setDeleteModal({
			show:false,
			model:'',
			type:''
		})
		await gameChangerAPI.deleteLocalModel({
			'model':model,
			'type':type
		});
		props.getProcesses();
		getModelsList()
	}
	/**
	 * Get a list of all the proccesses running and completed
	 * @method getAllProcessData
	 */
	const getAllProcessData = () => {
		const processList = [];
		if (props.processes.process_status) {
			for (const key in props.processes.process_status) {
				if (key !== 'flags') {
					const status = key.split(': ');
					if (['models', 'training'].includes(status[0])){
						processList.push({
							...props.processes.process_status[key],
							process: status[1],
							category: status[0],
							date:'Currently Running'
						});
					}
				}
			}
		}
		if (props.processes && props.processes.completed_process) {
			for (const completed of props.processes.completed_process) {
				const completed_process = completed.process.split(': ');
				if (['models', 'training'].includes(completed_process[0])){
					processList.push({
						...completed,
						process: completed_process[1],
						category: completed_process[0],
						progress: completed.total
					});
				}
			}
		}
		return processList;
	};

	const getLocalData = async () => {
		const dataList =  await gameChangerAPI.getDataList();
		setDataTable(dataList.data.dirs)
	}
	/**
	 * Get a list of all the downloaded sentence index, qexp, and transformers.
	 * @method getModelsList
	 */
	const getModelsList = async () => {
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
				};
			};
			setModelTable(modelList);
			props.updateLogs('Successfully queried models list', 0);
		} catch (e) {
			props.updateLogs('Error querying models list: ' + e.toString(), 2);
			throw e;
		}
	};
	/**
	 * Get a list of all the downloaded sentence index, qexp, and transformers.
	 * @method getCorpusCount
	 */
	const getCorpusCount = async () => {
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
	 * @method triggerTrainModel
	 */
	const triggerTrainModel = async () => {
		try {
			await gameChangerAPI.trainModel({
				build_type: 'sentence',
				version: version,
				encoder_model: modelName,
				gpu: gpu,
				upload: upload
			});
			props.updateLogs('Started training', 0);
			props.getProcesses();
		} catch (e) {
			props.updateLogs('Error training model: ' + e.toString(), 2);
		}
	};

	/**
	 * @method triggerFinetuneModel
	 */
	 const triggerFinetuneModel = async () => {
		try {
			await gameChangerAPI.trainModel({
				build_type: 'sent_finetune',
				epochs: epochs,
				warmup_steps: warmupSteps
			});
			props.updateLogs('Started training', 0);
			props.getProcesses();
		} catch (e) {
			props.updateLogs('Error training model: ' + e.toString(), 2);
		}
	};
	/**
	 * @method triggerTrainQexp
	 */
	 const triggerTrainQexp = async () => {
		try {
			await gameChangerAPI.trainModel({
				validate: false,
				build_type: 'qexp',
				version: qexpversion,
				upload: qexpupload
			});
			props.updateLogs('Started training', 0);
			props.getProcesses();
		} catch (e) {
			props.updateLogs('Error training model: ' + e.toString(), 2);
		}
	};
	/**
	 * @method triggerTrainTopics
	 */
	const triggerTrainTopics = async () => {
		try {
			await gameChangerAPI.trainModel({
				build_type: 'topics',
				sample_rate: topicsSampling,
				upload: topicsUpload,
				version: topicsVersion
			});
			props.updateLogs('Started training', 0);
			props.getProcesses();
		} catch (e) {
			props.updateLogs('Error training model: ' + e.toString(), 2);
		}
	};
	/**
	 * @method triggerEvaluateModel
	 */
	const triggerEvaluateModel = async () => {
		try {
			await gameChangerAPI.trainModel({
				build_type: 'eval',
				model_name: evalModelName,
				validation_data: validationData,
				eval_type: evalType,
				sample_limit: sampleLimit
			});
			props.updateLogs('Started evaluating', 0);
			props.getProcesses();
		} catch (e) {
			console.log('\nERROR EVALUATING MODEL')
			console.log(e)
			props.updateLogs('Error evaluating model: ' + e.toString(), 2);
		}
	};
	
	/**
	 * @method triggerReloadModels
	 */
	const triggerReloadModels = async () => {
		try {
			const params = {};
			if (selectedSentence) {
				params['sentence'] = selectedSentence;
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
			await gameChangerAPI.reloadModels(params);
			props.updateLogs('Reloaded Models', 0);
			props.getProcesses();
		} catch (e) {
			props.updateLogs('Error reloading models: ' + e.toString(), 2);
		}
	};

	const triggerInitializeLTR = async () => {
		try {
			await gameChangerAPI.initializeLTR().then((data) => {
				setLTRInitializedStatus(data.status);
			});
			props.updateLogs('Initializing LTR', 0);
			props.getProcesses();
		} catch (e) {
			props.updateLogs('Error initializing LTR: ' + e.toString(), 2);
		}
	};

	const triggerCreateModelLTR = async () => {
		try {
			await gameChangerAPI.createModelLTR().then((data) => {
				setLTRModelCreatedStatus(data.status);
			});
			props.updateLogs('Creating LTR model', 0);
			props.getProcesses();
		} catch (e) {
			props.updateLogs('Error creating LTR model: ' + e.toString(), 2);
		}
	};

	/**
	 * @method checkCorpusDownloading
	 */
	const checkCorpusDownloading = () => {
		let downloading = checkFlag('corpus:');
		return ('' + downloading).toUpperCase();
	};
	const checkTraining = () => {
		return checkFlag('training:') || checkFlag('corpus:');
	};
	const checkReloading = () => {
		return checkFlag('models:');
	};
	/**
	 * Takes a String and checks if it is in any of the flag keys and checks
	 * those values. If any of them are true it returns true
	 * @method checkFlag
	 * @param {String} flag
	 * @returns boolean
	 */
	const checkFlag = (flag) => {
		let flagged = false;
		if (
			props.processes.process_status &&
			props.processes.process_status.flags
		) {
			const flags = props.processes.process_status.flags;
			for (const key in flags) {
				if (key.includes(flag) && flags[key]) {
					flagged = true;
				}
			}
		}
		return flagged;
	};

	useEffect(() => {
		onload();
		props.getProcesses();
		// eslint-disable-next-line
	}, []);

	return (
		<div>
			<Modal
				isOpen={deleteModal.show}
				onRequestClose={() => setDeleteModal({
					show:false,
					model:'',
					type:''
				})}
				style={styles.esIndexModal}
			>
				<div>
					<Typography>
							Are you sure you want to delete {deleteModal.model}
					</Typography>
				</div>
				<div
					style={{
						position:'absolute',
						bottom: 0,
						justifyContent: 'flex-end',
					}}
				>
					<GCButton
						id={'modelDeleteConfirm'}
						onClick={() => deleteLocalModels(deleteModal.model,deleteModal.type)}
						style={{ margin: '25px' }}
						buttonColor={'#8091A5'}
					>
						Yes
					</GCButton>
					<GCButton
						id={'modelModalClose'}
						onClick={() => setDeleteModal({
							show:false,
							model:'',
							type:''
						})}
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
				<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>
					Loaded Resources And Controls
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
			<div>
				<Processes
					processData={getAllProcessData()}
				/>
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
						<div style={{ display: 'inline-block' }}> <b>Local State:</b></div>
					</div>
					<fieldset className={'field'}>
						<div className="info-container">
							<div
								style={{ width: '35%', boxSizing: 'border-box' }}
								className="half"
							>
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
								<div style={{ paddingLeft: '15px' }}>Topic Model:</div>

								<div style={{ paddingLeft: '15px' }}>Transformer:</div>
								<div style={{ paddingLeft: '30px' }}>Encoder:</div>
								<div style={{ paddingLeft: '30px' }}>Sim:</div>
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
								{currentTopicModel} <br />

								<br />
								{currentEncoder.replace(/^.*[\\/]/, '')}
								<br />
								{currentSimModel.replace(/^.*[\\/]/, '')}
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
						<div style={{ display: 'inline-block' }}><b>Local Models:</b></div>
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
											<GCPrimaryButton
												onClick={() => {
													setDeleteModal({
														show:true,
														model:row.original.model,
														type:row.original.type
													})
													
												}}
												style={{ float: 'left', minWidth: 'unset' }}
											>
												Delete
											</GCPrimaryButton>
										</div>
									);
								}}
							/>
						</div>
					</fieldset>
				</BorderDiv>
				<BorderDiv className="half" style={{ marginTop: '10px' }}>
					<div
						style={{
							width: '100%',
							display: 'inline-block',
							paddingBottom: '5px',
						}}
					>
						<div style={{ display: 'inline-block' }}><b>API Controls:</b></div>
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
						<GCPrimaryButton
							onClick={() => {
								triggerReloadModels();
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Reload
						</GCPrimaryButton>
						<div>
							<div>
								<div style={{ width: '120px', display: 'inline-block' }}>
									SENTENCE EMBEDDINGS:
								</div>
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
											<MenuItem style={{ fontSize: 'small' }} value={name}>
												{name}
											</MenuItem>
										);
									})}
								</Select>
							</div>

							<div>
								<div style={{ width: '120px', display: 'inline-block' }}>
									QEXP MODEL:
								</div>
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
											<MenuItem style={{ fontSize: 'small' }} value={name}>
												{name}
											</MenuItem>
										);
									})}
								</Select>
							</div>
							<div>
								<div style={{ width: '120px', display: 'inline-block' }}>
									JBOOK QEXP MODEL:
								</div>
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
											<MenuItem style={{ fontSize: 'small' }} value={name}>
												{name}
											</MenuItem>
										);
									})}
								</Select>
							</div>
							<div>
								<div style={{ width: '120px', display: 'inline-block' }}>
									TOPIC MODEL:
								</div>
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
											<MenuItem style={{ fontSize: 'small' }} value={name}>
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
						<b>Sentence Embedding Model</b>
						<br />
						<GCPrimaryButton
							onClick={() => {
								triggerTrainModel();
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Train
						</GCPrimaryButton>

						<div>
							<div style={{ width: '120px', display: 'inline-block' }}>
								Encoder Model:
							</div>
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
									display: 'inline-block'
								}}
							>
								GPU:
							</div>
							<Checkbox
								checked={gpu}
								onChange={(e) => setgpu(e.target.checked)}
							/>
							<div style={{ width: '120px', display: 'inline-block', marginLeft: '10px'}}>
								Version:
							</div>
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
							<Checkbox
								checked={upload}
								onChange={(e) => setUpload(e.target.checked)}
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
						<b>Query Expansion Model</b>
						<br />
						<GCPrimaryButton
							onClick={() => {
								triggerTrainQexp();
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Train
						</GCPrimaryButton>
					
						<div>
							<div style={{ width: '120px', display: 'inline-block', marginLeft: '10px'}}>
							Version:
							</div>
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
							<Checkbox
								checked={qexpupload}
								onChange={(e) => setQexpUpload(e.target.checked)}
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
						<b>Topic Model</b>
						<br />
						<GCPrimaryButton
							onClick={() => {
								triggerTrainTopics();
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Train
						</GCPrimaryButton>
					
						<div>
							<div style={{ width: '120px', display: 'inline-block', marginLeft: '10px'}}>
							Version:
							</div>
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
							<Checkbox
								checked={topicsUpload}
								onChange={(e) => setTopicsUpload(e.target.checked)}
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
						<b>Finetune Models</b>
						<br />
						<GCPrimaryButton
							onClick={() => {
								triggerFinetuneModel();
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Train
						</GCPrimaryButton>
					
						<div>
							<div style={{ width: '60px', display: 'inline-block' }}>
								Warmup Steps:
							</div>
							<Input
								value={warmupSteps}
								onChange={(e) => setWarmupSteps(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '50px', margin: '20px' }}
							/>
							<div style={{ width: '60px', display: 'inline-block' }}>
								Epochs:
							</div>
							<Input
								value={epochs}
								onChange={(e) => setEpochs(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '50px', margin: '20px' }}
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
						<b>Evaluate Models</b>
						<br />
						<GCPrimaryButton
							onClick={() => {
								triggerEvaluateModel();
							}}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Evaluate
						</GCPrimaryButton>
						<div>
							<div style={{ width: '120px', display: 'inline-block' }}>
								Model:
							</div>
							<Input
								value={evalModelName}
								onChange={(e) => setEvalModelName(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '200px', margin: '10px' }}
							/>
							<div style={{ width: '120px', display: 'inline-block' }}>
								Validation Data:
							</div>
							<Input
								value={validationData}
								onChange={(e) => setValidationData(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '120px', margin: '10px' }}
							/>
						</div>
						<div>
							<div
								style={{
									width: '60px',
									display: 'inline-block'
								}}
							>
								Eval Type:
							</div>
							<Input
								value={evalType}
								onChange={(e) => setEvalType(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '200px', margin: '10px' }}
							/>
							<div style={{ width: '70px', display: 'inline-block' }}>
								Sample Limit:
							</div>
							<Input
								value={sampleLimit}
								onChange={(e) => setSampleLimit(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '50px', margin: '10px' }}
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
						<GCPrimaryButton
							onClick={() => {
								triggerInitializeLTR();
							}}
							style={{ margin: '0 10px 10px 0', minWidth: 'unset'}}
						>
							Initialize
						</GCPrimaryButton>
						{ltrInitializedStatus &&
							<div
								style={{
									minWidth: '200px',
									display: 'inline-block'
								}}
							>
								{ltrInitializedStatus === 200 ?
									'Initialize request successful' :
									`Initialize reqeust returned code ${ltrInitializedStatus}`
								}
							</div>
						}
						<br />
						<GCPrimaryButton
							onClick={() => {
								triggerCreateModelLTR();
							}}
							style={{ margin: '0 10px 0 0', minWidth: 'unset' }}
						>
							Create Model
						</GCPrimaryButton>
						{ltrModelCreatedStatus &&
							<div
								style={{
									minWidth: '200px',
									display: 'inline-block'
								}}
							>
								{ltrModelCreatedStatus === 200 ?
									'Create model request successful' :
									`Create model reqeust returned code ${ltrModelCreatedStatus}`
								}
							</div>
						}
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
						<div style={{ display: 'inline-block' }}><b>Local Data:</b></div>
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
										<div className="code-container" style={{padding:'15px'}}>
											Files
											<ul>
												{row.original.files.map((d) => <li key={d}>{d}</li>)}
											</ul>
											Directories
											<ul>
												{row.original.subdirectories.map((d) => <li key={d}>{d}</li>)}
											</ul>
										</div>
											
									);
								}}
							/>
						</div>
					</fieldset>
				</BorderDiv>
			</div>
		</div>
	);
};
