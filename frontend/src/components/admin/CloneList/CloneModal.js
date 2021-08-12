import React, {useState, useEffect} from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography } from '@material-ui/core';

import GCButton from '../../common/GCButton';
import {styles, GCCheckbox, useStyles} from '../util/GCAdminStyles';


/**
 * 
 * @class CloneModal
 */
export default ({storeCloneData, cloneToEdit, cloneTableMetaData, showCreateEditCloneModal, setShowCreateEditCloneModal, defaultModuleGivenKey, getCloneModalTextDisplayName}) => {
	// State Variables
	const [editCloneData, setEditCloneData] = useState({});
	const [editCloneDataErrors, setEditCloneDataErrors] = useState({});
	const classes = useStyles();

	//Component Methods
	const closeCloneModal = () => {
		setEditCloneData({});
		setEditCloneDataErrors({});
		setShowCreateEditCloneModal(false);
	}
	
	const handleCheck = (event) => {
		setEditCloneData({ ...editCloneData, [event.target.name]: event.target.checked })
	};
	
	const handleChange = (event, key) => {
		const tmpData = {...editCloneData};
		const cloneErrors = {...editCloneDataErrors};
		
		if (key === 'config') {
			tmpData[key] = JSON.parse(event.target.value);
		} else {
			tmpData[key] = event.target.value;
		}
		
		cloneErrors[key] = false;

		if (key === 'clone_name') {
			tmpData['config'] = {esIndex: event.target.value};
			tmpData['url'] = event.target.value;
			cloneErrors['config'] = false;
			cloneErrors['url'] = false;
		}

		setEditCloneDataErrors(cloneErrors);
		setEditCloneData(tmpData);
	};
	
    
	useEffect(() => {
		if (showCreateEditCloneModal && cloneToEdit) {
			setEditCloneData(cloneToEdit);
		} else {
			setEditCloneData({});
		}

	}, [showCreateEditCloneModal, cloneToEdit])
	
	return(
		<Dialog
			open={showCreateEditCloneModal}
			scroll={'paper'}
			maxWidth="lg"
			disableEscapeKeyDown
			disableBackdropClick
			classes={{
				paperWidthLg: classes.dialogLg
			}}
		>
			<DialogTitle >
				<div style={{display: 'flex', width: '100%'}}>
					<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>{editCloneData.id &&  editCloneData.id>0 ? 'Edit Clone' : 'Create Clone'}</Typography>
				</div>
				<IconButton aria-label="close" style={{ 
					position: 'absolute',
					right: '0px',
					top: '0px',
					height: 60,
					width: 60,
					color: 'black',
					backgroundColor: styles.backgroundGreyLight,
					borderRadius: 0
				}} onClick={() => closeCloneModal()}>
					<CloseIcon style={{ fontSize: 30 }} />
				</IconButton>
			</DialogTitle>

			<DialogContent style={{height: 700}}>
				<div style={{margin: '0 20px'}}>
					<div>
						<Typography variant="h4" style={styles.modalHeaders}>Input Fields</Typography>
						{cloneTableMetaData.stringFields.map(field => (
							<TextField
								label={getCloneModalTextDisplayName(field)}
								id="margin-dense"
								defaultValue={editCloneData[field.key] || defaultModuleGivenKey(field.key)}
								value={editCloneData[field.key] || defaultModuleGivenKey(field.key)}
								onChange={event => handleChange(event, field.key)}
								className={classes.textField}
								helperText={field.display_name}
								margin="dense"
								error={editCloneDataErrors[field.key]}
							/>
						))}
					</div>
					<div>
						<Typography variant="h4" style={styles.modalHeaders}>Boolean Fields</Typography>
						{cloneTableMetaData.booleanFields.map(field => (
							<FormControlLabel
								control={
									<GCCheckbox
										checked={editCloneData[field.key]}
										onChange={handleCheck}
										name={field.key}
										color="primary"
										style={styles.checkbox}
									/>
								}
								label={field.display_name}
							/>
						))}
					</div>
					<div>
						<Typography variant="h4" style={styles.modalHeaders}>JSON Fields</Typography>
						{cloneTableMetaData.jsonFields.map(field => (
							<TextField
								label={getCloneModalTextDisplayName(field)}
								id="margin-dense"
								defaultValue={editCloneData ? JSON.stringify(editCloneData[field.key]) : ''}
								value={editCloneData && editCloneData[field.key] ? JSON.stringify(editCloneData[field.key]) : '' }
								onChange={event => handleChange(event, field.key)}
								className={classes.textField}
								helperText={field.display_name}
								margin="dense"
								error={editCloneDataErrors[field.key]}
							/>
						))}
					</div>
				</div>
			</DialogContent>

			<DialogActions>
				<div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', margin: '0px 18px' }}>
					<GCButton
						id={'editCloneSubmit'}
						onClick={()=>storeCloneData(editCloneData)}
						style={{margin:'10px'}}
					>
							Submit
					</GCButton>
				</div>
			</DialogActions>
		</Dialog>
	)
}
