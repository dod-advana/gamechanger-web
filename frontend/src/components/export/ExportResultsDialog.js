import React, { useState } from 'react';
import UOTDialog from '../common/GCDialog';
import GCButton from '../common/GCButton';
import styled from 'styled-components';
import { Select, InputLabel, FormControl, MenuItem, Typography } from '@material-ui/core'
import GameChangerAPI from "../api/gameChanger-service-api";
import LoadingBar from '../common/LoadingBar';
import { backgroundGreyDark } from '../../components/common/gc-colors';
import CloseIcon from '@material-ui/icons/Close';
import './export-results-dialog.css';
import moment from 'moment';
import {trackEvent} from "../telemetry/Matomo";
import {getTrackingNameForFactory} from "../../gamechangerUtils";

const gameChangerAPI = new GameChangerAPI()
const autoDownloadFile = ({ data, filename = "results", extension = "txt" }) => {
	//Create a link element, hide it, direct it towards the blob, and then 'click' it programatically

	const a = document.createElement("a");
	a.style = "display: none";
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
	document.body.removeChild(a)
}

const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
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
}

const styles = {
	menuItem: {
		fontSize: 16
	},
	leftButtonGroup: {
		flex: 1,
		display: 'flex'
	},
	rightButtonGroup: {
		flex: 1,
		display: 'flex',
		justifyContent: 'flex-end'
	},
	selectedDocsTable: {
		border: `1px solid ${backgroundGreyDark}`,
		margin: '3% 1%',
		width: '45%'
	},
	tableContainer: {
		width: '100%',
		height: 300,
		overflow: 'auto'
	},
	selectedDocsTableCol: {
		display: 'flex',
		justifyContent: 'space-between',
		padding: 10
	}
}

const CloseButton = styled.div`
    padding: 6px;
    background-color: white;
    border-radius: 5px;
    color: #8091A5 !important;
    border: 1px solid #B0B9BE;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: .4;
    position: absolute;
    right: -20px;
    top: -10px;
`;

export const downloadFile = async (data, format, cloneData) => {
	trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'ExportResults', 'onDownloadFile', format);
	const filename = "GAMECHANGER-Results-" + moment().format("YYYY-MM-DD_HH-mm-ss");
	if (format === 'pdf') {
		const blob = b64toBlob(data, 'application/pdf');
		autoDownloadFile({ data: blob, extension: 'pdf', filename })
	} else if (data && data instanceof Blob) {
		autoDownloadFile({ data, extension: format, filename })
	} else {
		throw new Error('Error downloading results')
	}
}

export default ({ open, handleClose, searchObject, selectedDocuments, isSelectedDocs, orgFilter, orgFilterString, typeFilter, typeFilterString, isClone, cloneData, getUserData, searchType, searchFields, edaSearchSettings }) => {
	
	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrorMsg] = useState('')
	const isEda = cloneData.clone_name === 'eda';
	const [selectedFormat, setSelectedFormat] = isEda ? useState('csv') : useState('pdf')
	const index = cloneData.clone_name;

	const handleChange = ({ target: { value } }) => {
		setSelectedFormat(value)
	}

	const generateFile = async () => {
		setLoading(true);
		setErrorMsg('');
		try {
			trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'ExportResultsDialog', 'onGenerate', selectedFormat);
			let url = window.location.hash.toString();
			url = url.replace("#/", "");
			const res = await gameChangerAPI.shortenSearchURLPOST(url);
			const tiny_url_send = `https://gamechanger.advana.data.mil/#/gamechanger?tiny=${res.data.tinyURL}`;
			const { data } = await gameChangerAPI.modularExport({cloneName: cloneData.clone_name, format: selectedFormat, searchText: searchObject.search, options:{ limit: 10000, searchType, index,  cloneData, orgFilter: orgFilter, orgFilterString: orgFilterString, typeFilter, typeFilterString, selectedDocuments: isSelectedDocs ? Array.from(selectedDocuments.keys()) : [], tiny_url : tiny_url_send, searchFields, edaSearchSettings }});
			downloadFile(data, selectedFormat, cloneData);
			getUserData();
		} catch (err) {
			console.log(err)
			setErrorMsg('Error Downloading Results')
		} finally {
			setLoading(false)
		}
	}

	return (
		
		<UOTDialog
			open={open}
			title={<div><Typography variant="h3" display="inline">Export Results</Typography><CloseButton onClick={handleClose}>
			<CloseIcon fontSize="large" />
		</CloseButton></div>}
			onRequestClose={handleClose}
			width="500px"
			primaryLabel=''
			primaryAction={() => { }}
		> 
		<h2>&nbsp;Export is currently limited to 10000 results</h2>
			
			<div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '3% 0 0 0' }}>
				<div style={styles.leftButtonGroup}>
					<FormControl variant="outlined" style={{ width: '115px' }}>
						<InputLabel style={{ color: 'black' }}>File Format</InputLabel>
						<Select label="File Format" style={{ height: '45px', fontSize: '16px' }} value={selectedFormat} onChange={handleChange}>
							{!isEda && <MenuItem style={styles.menuItem} value='pdf' key='pdf'>PDF</MenuItem>}
							<MenuItem style={styles.menuItem} value='json' key='json'>JSON</MenuItem>
							<MenuItem style={styles.menuItem} value='csv' key='csv'>CSV</MenuItem>
						</Select>
					</FormControl>
				</div>

				<div style={styles.rightButtonGroup}>
					<GCButton
						onClick={handleClose}
						buttonColor={'#8091A5'}
					>
						Close
					</GCButton>
					<GCButton
						onClick={generateFile}
						disabled={loading}
					>
						Generate
					</GCButton>
				</div>
			</div>
			{
				errorMsg ?
					(
						<div style={{ color: 'red', display: 'flex', justifyContent: 'center' }}>{errorMsg}</div>
					) : (
						<LoadingBar color='primary' loading={loading} />
					)
			}
		</UOTDialog>
	)
}
