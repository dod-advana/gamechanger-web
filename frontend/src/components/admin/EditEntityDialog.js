import React, { useState } from 'react';
import PropTypes from 'prop-types';
import UOTDialog from '../common/GCDialog';
import GCButton from '../common/GCButton';
import styled from 'styled-components';
import { Select, InputLabel, FormControl, MenuItem, Typography, TextField } from '@material-ui/core'
import GameChangerAPI from '../api/gameChanger-service-api';
import LoadingBar from '../common/LoadingBar';
import { backgroundGreyDark } from '../common/gc-colors';
import CloseIcon from '@material-ui/icons/Close';
import '../../components/export/export-results-dialog.css';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';

const gameChangerAPI = new GameChangerAPI()

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

const useStyles = makeStyles(() => ({
	labelFont: {
	  fontSize: 16
	},
	helperText: {
		fontSize: 12
	},
	options: {
		zIndex: '1500'
	}
}));

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

const EditEntityDialog = ({ open, handleClose }) => {
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const classes = useStyles();

	const handleChange = ({ target: { value } }) => {
	};

	const handleSave = () => {

	};

	return (		
		<UOTDialog
			open={open}
			title={
				<div>
					<Typography variant="h3" display="inline">Edit Details</Typography>
					<CloseButton onClick={handleClose}>
						<CloseIcon fontSize="large" />
					</CloseButton>
				</div>
			}
			onRequestClose={handleClose}
			width="500px"
			primaryLabel=''
			primaryAction={() => { }}
		> 
			<FormControl style={{ width:'100%', marginTop: 5 }}>
				<TextField
					label="Seal Image URL"
					variant="outlined"
					InputLabelProps={{ className: classes.labelFont }}
					InputProps={{ className: classes.labelFont }}
					FormHelperTextProps={{ className: classes.helperText }}
				/>
			</FormControl>
			
			<div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '3% 0 0 0' }}>
				<div style={styles.leftButtonGroup}>
					
				</div>

				<div style={styles.rightButtonGroup}>
					<GCButton onClick={handleSave}>
						Save
					</GCButton>
					<GCButton
						onClick={handleClose}
						buttonColor={'#8091A5'}
					>
						Close
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
};

EditEntityDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired, 
	searchObject: PropTypes.shape({
		search: PropTypes.string
	}),
	selectedDocuments: PropTypes.instanceOf(Map), 
	isSelectedDocs: PropTypes.bool, 
	orgFilter: PropTypes.objectOf(PropTypes.bool), 
	orgFilterString: PropTypes.array, 
	typeFilter: PropTypes.objectOf(PropTypes.bool), 
	typeFilterString: PropTypes.array, 
	isClone: PropTypes.bool, 
	cloneData: PropTypes.shape({
		clone_name: PropTypes.string
	}), 
	getUserData: PropTypes.func, 
	searchType: PropTypes.string, 
	searchFields: PropTypes.object, 
	edaSearchSettings: PropTypes.object, 
	sort: PropTypes.string, 
	order: PropTypes.string
}

export default EditEntityDialog