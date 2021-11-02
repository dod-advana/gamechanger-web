import React, { useState, useEffect } from 'react';
import { Select, MenuItem, Input, Checkbox } from '@material-ui/core';
import ReactTable from 'react-table';
import { BorderDiv, TableRow } from './util/styledDivs';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCPrimaryButton from '../../common/GCButton';
import { styles } from '../util/GCAdminStyles';
import 'react-table/react-table.css';
import './index.scss';

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
		qexp: {}
	});

	const [modelTable, setModelTable] = useState([]);
	//const [currentTransformer, setCurrentTransformer] = useState(initTransformer);
	const [currentSimModel, setCurrentSim] = useState('');
	const [currentEncoder, setCurrentEncoder] = useState('');
	const [currentSentenceIndex, setCurrentSentenceIndex] = useState('');
	const [currentQexp, setCurrentQexp] = useState('');
	const [currentQa, setCurrentQa] = useState('');
	const [corpusCount, setCorpusCount] = useState(0);

	const [selectedSentence, setSelectedSentence] = useState('');
	const [selectedQEXP, setSelectedQEXP] = useState('');

	const [modelName, setModelName] = useState(DEFAULT_MODEL_NAME);
	const [evalModelName, setEvalModelName] = useState('');
	const [skipOriginal, setSkipOriginal] = useState(true);
	const [validationData, setValidationData] = useState('latest');
	const [sampleLimit, setSampleLimit] = useState(15000);
	const [version, setVersion] = useState(DEFAULT_VERSION);
	const [gpu, setgpu] = useState(true);
	const [upload, setUpload] = useState(false);
	const [batchSize, setBatchSize] = useState(32);
	const [warmupSteps, setWarmupSteps] = useState(100);
	const [epochs, setEpochs] = useState(3);

	/**
	 * Load all the initial data on transformers and s3
	 * @method onload
	 */
	const onload = async () => {
		getCurrentTransformer();
		getModelsList();
		getCorpusCount();
	};
	/**
	 * Retrieves the current transformer from gameChangerAPI.getCurrentTransformer()
	 * @method getCurrentTransformer
	 */
	const getCurrentTransformer = async () => {
		try {
			// set currentTransformer
			const current = await gameChangerAPI.getCurrentTransformer();
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
			props.updateLogs('Successfully queried current transformer', 0);
		} catch (e) {
			props.updateLogs(
				'Error querying current transformer: ' + e.toString(),
				2
			);
			throw e;
		}
	};

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
				batch_size: batchSize,
				warmup_steps: warmupSteps
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
				skip_original: skipOriginal,
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
			await gameChangerAPI.reloadModels(params);
			props.updateLogs('Reloaded Models', 0);
			props.getProcesses();
		} catch (e) {
			props.updateLogs('Error reloading models: ' + e.toString(), 2);
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
			<div className="info">
				<BorderDiv className="half">
					<div
						style={{
							width: '100%',
							display: 'inline-block',
							paddingBottom: '5px',
						}}
					>
						<div style={{ display: 'inline-block' }}>Local State:</div>
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
								<div style={{ paddingLeft: '15px' }}>Query Expansion:</div>
								<div style={{ paddingLeft: '15px' }}>Question Answer:</div>
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
						<div style={{ display: 'inline-block' }}>Local Models:</div>
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
						<div style={{ display: 'inline-block' }}>API Controls:</div>
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
						<b>Reload Index</b>
						<br />
						<GCPrimaryButton
							onClick={() => {
								triggerReloadModels();
							}}
							disabled={checkReloading()}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Reload
						</GCPrimaryButton>
						<div>
							<div>
								<div style={{ width: '120px', display: 'inline-block' }}>
									Sentence Index:
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
									QEXP Index:
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
						<b>Re-Build Index</b>
						<br />
						<GCPrimaryButton
							onClick={() => {
								triggerTrainModel();
							}}
							disabled={checkTraining()}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Build
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
							<div
								style={{
									width: '60px',
									display: 'inline-block',
									marginLeft: '20px',
								}}
							>
								GPU:
							</div>
							<Checkbox
								checked={gpu}
								onChange={(e) => setgpu(e.target.checked)}
							/>
						</div>
						<div>
							<div style={{ width: '120px', display: 'inline-block' }}>
								Version:
							</div>
							<Input
								value={version}
								onChange={(e) => setVersion(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '200px', margin: '10px' }}
							/>
							<div
								style={{
									width: '60px',
									display: 'inline-block',
									marginLeft: '20px',
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
						<b>Finetune Encoder</b>
						<br />
						<GCPrimaryButton
							onClick={() => {
								triggerFinetuneModel();
							}}
							disabled={checkTraining()}
							style={{ float: 'right', minWidth: 'unset' }}
						>
							Train
						</GCPrimaryButton>
					
						<div>
							<div style={{ width: '60x', display: 'inline-block' }}>
								Batch Size:
							</div>
							<Input
								value={batchSize}
								onChange={(e) => setBatchSize(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '50px', margin: '20px' }}
							/>
						</div>
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
						<b>Evaluate Model</b>
						<br />
						<GCPrimaryButton
							onClick={() => {
								triggerEvaluateModel();
							}}
							disabled={checkTraining()}
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
								style={{ fontSize: 'small', minWidth: '200px', margin: '10px' }}
							/>
							<div
								style={{
									width: '60px',
									display: 'inline-block',
									marginLeft: '20px',
								}}
							>
								Skip Original:
							</div>
							<Checkbox
								checked={skipOriginal}
								onChange={(e) => setSkipOriginal(e.target.checked)}
							/>
						</div>
						<div>
							<div style={{ width: '120px', display: 'inline-block' }}>
								Sample Limit:
							</div>
							<Input
								value={sampleLimit}
								onChange={(e) => setSampleLimit(e.target.value)}
								name="labels"
								style={{ fontSize: 'small', minWidth: '200px', margin: '10px' }}
							/>
						</div>
					</div>
				</BorderDiv>
			</div>
		</div>
	);
};
