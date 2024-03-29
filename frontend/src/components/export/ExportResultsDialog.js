import React, { useState } from 'react';
import PropTypes from 'prop-types';
import UOTDialog from '../common/GCDialog';
import GCButton from '../common/GCButton';
import { Select, InputLabel, FormControl, MenuItem, Typography, TextField } from '@material-ui/core';
import GameChangerAPI from '../api/gameChanger-service-api';
import LoadingBar from '../common/LoadingBar';
import './export-results-dialog.css';
import moment from 'moment';
import { trackEvent } from '../telemetry/Matomo';
import { getTrackingNameForFactory } from '../../utils/gamechangerUtils';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import { utils, writeFileXLSX } from 'xlsx';

const gameChangerAPI = new GameChangerAPI();
export const autoDownloadFile = ({ data, filename = 'results', extension = 'txt' }) => {
	//Create a link element, hide it, direct it towards the blob, and then 'click' it programatically

	const a = document.createElement('a');
	a.style = 'display: none';
	document.body.appendChild(a);
	//Create a DOMString representing the blob
	//and point the link element towards it
	const url = window.URL.createObjectURL(data);
	a.href = url;
	a.download = `${filename}.${extension}`;
	//programatically click the link to trigger the download
	a.click();
	//release the reference to the file by revoking the Object URL
	window.URL.revokeObjectURL(url);
	document.body.removeChild(a);
};

export const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
	const byteCharacters = atob(b64Data);
	const byteArrays = [];

	for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		const slice = byteCharacters.slice(offset, offset + sliceSize);

		const byteNumbers = new Array(slice.length);
		for (let i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
		}

		const byteArray = new Uint8Array(byteNumbers);
		byteArrays.push(byteArray);
	}

	const blob = new Blob(byteArrays, { type: contentType });
	return blob;
};

const downloadXlsx = (data, portfolio) => {
	const ws = utils.json_to_sheet(data);
	const wb = utils.book_new();
	utils.book_append_sheet(wb, ws, 'Primary Review Worksheet');
	writeFileXLSX(wb, `Jbook-Excel-Export-${portfolio}.xlsx`);
};

const useStyles = makeStyles(() => ({
	labelFont: {
		fontSize: 16,
	},
	helperText: {
		fontSize: 12,
	},
	options: {
		zIndex: '1500',
	},
}));

const styles = {
	menuItem: {
		fontSize: 16,
	},
	leftButtonGroup: {
		flex: 1,
		display: 'flex',
	},
	rightButtonGroup: {
		flex: 1,
		display: 'flex',
		justifyContent: 'flex-end',
	},
};

export const downloadFile = async (data, format, classificationMarking, cloneData) => {
	const cloneName = cloneData?.clone_name ?? 'gamechanger';
	trackEvent(getTrackingNameForFactory(cloneName), 'ExportResults', `onDownloadFile${format}`);
	let filename = `${cloneName.toUpperCase()}-Results-` + moment().format('YYYY-MM-DD_HH-mm-ss');
	if (classificationMarking === 'CUI') {
		filename += '-CUI';
	}
	if (format === 'pdf') {
		const blob = b64toBlob(data, 'application/pdf');
		autoDownloadFile({ data: blob, extension: 'pdf', filename });
	} else if (data && data instanceof Blob) {
		autoDownloadFile({ data, extension: format, filename });
	} else {
		throw new Error('Error downloading results');
	}
};

const ExportResultsDialog = ({
	state,
	dispatch,
	searchHandler,
	open,
	handleClose,
	searchObject,
	selectedDocuments,
	isSelectedDocs,
	orgFilter,
	orgFilterString,
	typeFilter,
	typeFilterString,
	isClone,
	cloneData,
	getUserData,
	searchType,
	searchFields,
	edaSearchSettings,
	sort,
	order,
}) => {
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const isEda = cloneData.clone_name === 'eda';
	const isJbookReviewer =
		state.userData?.extra_fields?.jbook.is_admin ||
		state.userData?.extra_fields?.jbook.is_poc_reviewer ||
		state.userData?.extra_fields?.jbook.is_primary_reviewer ||
		state.userData?.extra_fields?.jbook.is_service_reviewer;
	const [selectedFormat, setSelectedFormat] = useState(isEda ? 'csv' : 'pdf');
	const [classificationMarking, setClassificationMarking] = useState('');
	const index = cloneData.clone_name;
	const classes = useStyles();
	const classificationMarkingOptions = ['None', 'CUI'];

	const handleChange = ({ target: { value } }) => {
		setSelectedFormat(value);
	};

	const sendNonstandardClassificationAlert = async (exportInput) => {
		try {
			await gameChangerAPI.sendClassificationAlertPOST(exportInput);
		} catch (err) {
			console.log({ err });
		}
	};

	const generateFile = async () => {
		setLoading(true);
		setErrorMsg('');
		try {
			trackEvent(
				getTrackingNameForFactory(cloneData.clone_name),
				'ExportResultsDialog',
				`onGenerate${selectedFormat}`
			);
			Array.from(selectedDocuments.keys()).forEach((item) => {
				gameChangerAPI.sendIntelligentSearchFeedback(
					'intelligent_search_export_document',
					item,
					searchObject.search
				);
				trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'ExportDocument', `${item}`);
			});
			let url = window.location.hash.toString();
			url = url.replace('#/', '');
			const res = await gameChangerAPI.shortenSearchURLPOST(url);
			const tiny_url_send = `https://gamechanger.advana.data.mil/#/gamechanger?tiny=${res.data.tinyURL}`;
			const cleanSearchSettings =
				searchHandler !== undefined ? searchHandler.processSearchSettings(state, dispatch) : {};
			const exportInput = {
				cloneName: cloneData.clone_name,
				format: selectedFormat,
				searchText: searchObject.search,
				options: {
					limit: 10000,
					searchType,
					index,
					classificationMarking: classificationMarking === 'None' ? '' : classificationMarking,
					cloneData,
					orgFilter,
					orgFilterString,
					typeFilter,
					typeFilterString,
					selectedDocuments: isSelectedDocs ? Array.from(selectedDocuments.keys()) : [],
					tiny_url: tiny_url_send,
					edaSearchSettings,
					sort,
					order,
					jbookSearchSettings: cleanSearchSettings,
					portfolio: state !== undefined ? state.selectedPortfolio || 'AI Inventory' : null,
				},
			};
			const { data } = await gameChangerAPI.modularExport(exportInput);

			if (selectedFormat === 'xlsx') {
				//blob -> json
				const jsonData = JSON.parse(await data.text());
				downloadXlsx(jsonData, state.selectedPortfolio ?? 'General');
			} else {
				downloadFile(
					data,
					selectedFormat === 'csv-reviews' ? 'csv' : selectedFormat,
					classificationMarking,
					cloneData
				);
			}
			getUserData();
			if (
				selectedFormat === 'pdf' &&
				classificationMarking &&
				!classificationMarkingOptions.includes(classificationMarking)
			) {
				sendNonstandardClassificationAlert(exportInput);
			}
			setErrorMsg('Successfully Generated Results!');
		} catch (err) {
			console.log(err);
			setErrorMsg('Error Generating Results (Timeout)');
		} finally {
			setLoading(false);
		}
	};

	return (
		<UOTDialog
			open={open}
			title={
				<div data-cy="export-dialog">
					<Typography variant="h3" display="inline">
						Export Results
					</Typography>
				</div>
			}
			onRequestClose={handleClose}
			width="500px"
			primaryLabel=""
			primaryAction={() => {}}
			contentStyle={{ padding: 0 }}
			titleStyle={{ padding: 0 }}
			mainContainerStyle={{ margin: 0 }}
			handleClose={handleClose}
		>
			<h2>&nbsp;Export is currently limited to 10000 results</h2>

			<div
				style={{
					height: '60px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					margin: '4% 0 0 0',
				}}
				data-cy="export-classification"
			>
				<Autocomplete
					data-cy="export-autocomplete"
					freeSolo
					options={classificationMarkingOptions}
					renderInput={(params) => (
						<TextField
							{...params}
							InputLabelProps={{ className: classes.labelFont }}
							InputProps={{
								...params.InputProps,
								className: classes.labelFont,
							}}
							FormHelperTextProps={{ className: classes.helperText }}
							label="Classification Marking"
							variant="outlined"
						/>
					)}
					style={{ backgroundColor: 'white', width: '100%' }}
					classes={{ popper: classes.options, paper: classes.labelFont }}
					defaultValue="None"
					inputValue={classificationMarking}
					onInputChange={(_, value) => {
						setClassificationMarking(value);
					}}
				/>
			</div>

			<div
				style={{
					height: '60px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					margin: '3% 0 0 0',
				}}
			>
				<div style={styles.leftButtonGroup} data-cy="export-select">
					{/* needs form? or box overwritten as form? https://github.com/mui/material-ui/blob/d4d8512ce3453711f3c661374579b0d2ed13f3e7/docs/data/material/getting-started/templates/sign-up/SignUp.js#L59 */}
					<FormControl variant="outlined" style={{ width: '100%' }} i data-cy="export-select-form">
						<InputLabel className={classes.labelFont}>File Format</InputLabel>
						<Select
							label="File Format"
							style={{ fontSize: '16px' }}
							value={selectedFormat}
							onChange={handleChange}
							id={'#select'}
						>
							{!isEda && (
								<MenuItem style={styles.menuItem} value="pdf" key="pdf" data-cy={`export-option-pdf`}>
									PDF
								</MenuItem>
							)}
							<MenuItem style={styles.menuItem} value="csv" key="csv" data-cy={`export-option-csv`}>
								{cloneData.clone_name === 'jbook' ? 'CSV (Summary)' : 'CSV'}
							</MenuItem>
							{cloneData.clone_name === 'jbook' && isJbookReviewer && (
								<MenuItem
									style={styles.menuItem}
									value="csv-reviews"
									key="csv-reviews"
									data-cy={`export-option-csv-reviews`}
								>
									CSV (Detailed)
								</MenuItem>
							)}
							{cloneData.clone_name === 'jbook' && isJbookReviewer && (
								<MenuItem
									style={styles.menuItem}
									value="xlsx"
									key="xlsx"
									data-cy={`export-option-xlsx`}
								>
									XLSX
								</MenuItem>
							)}
						</Select>
					</FormControl>
				</div>
			</div>
			<div
				style={{
					height: '60px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					margin: '3% 0 0 0',
				}}
			>
				<div style={styles.rightButtonGroup}>
					<GCButton onClick={handleClose} isSecondaryBtn={true}>
						Close
					</GCButton>
					<GCButton onClick={generateFile} disabled={loading} data-cy={'generate'}>
						Generate
					</GCButton>
				</div>
			</div>
			{errorMsg ? (
				<div
					style={
						errorMsg[0] === 'S'
							? { color: 'green', display: 'flex', justifyContent: 'center' }
							: { color: 'red', display: 'flex', justifyContent: 'center' }
					}
				>
					{errorMsg}
				</div>
			) : (
				<LoadingBar color="primary" loading={loading} />
			)}
		</UOTDialog>
	);
};

ExportResultsDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	searchObject: PropTypes.shape({
		search: PropTypes.string,
	}),
	selectedDocuments: PropTypes.instanceOf(Map),
	isSelectedDocs: PropTypes.bool,
	orgFilter: PropTypes.objectOf(PropTypes.bool),
	orgFilterString: PropTypes.array,
	typeFilter: PropTypes.objectOf(PropTypes.bool),
	typeFilterString: PropTypes.array,
	isClone: PropTypes.bool,
	cloneData: PropTypes.shape({
		clone_name: PropTypes.string,
	}),
	getUserData: PropTypes.func,
	searchType: PropTypes.string,
	searchFields: PropTypes.object,
	edaSearchSettings: PropTypes.object,
	sort: PropTypes.string,
	order: PropTypes.string,
};

export default ExportResultsDialog;
