import React, { useState, useEffect } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Typography,
} from '@material-ui/core';

import GCButton from '../../common/GCButton';
import { styles, GCCheckbox, useStyles } from '../util/GCAdminStyles';

const DEFAULT_VALUES = {
	clone_name: '',
	card_module: 'default/defaultCardHandler',
	display_name: '',
	export_module: 'simple/simpleExportHandler',
	graph_module: 'simple/simpleGraphHandler',
	main_view_module: 'default/defaultMainViewHandler',
	navigation_module: 'default/defaultNavigationHandler',
	search_module: 'simple/simpleSearchHandler',
	search_bar_module: 'default/defaultSearchBarHandler',
	s3_bucket: 'advana-data-zone/bronze',
	title_bar_module: 'default/defaultTitleBarHandler',
	data_source_name: '',
	source_agency_name: '',
	metadata_creation_group: '',
	source_s3_bucket: '',
	source_s3_prefix: '',
};

/**
 *
 * @class CloneModal
 */

export default ({
	storeCloneData,
	cloneToEdit,
	cloneTableMetaData,
	showCreateEditCloneModal,
	setShowCreateEditCloneModal,
	getCloneModalTextDisplayName,
}) => {
	// console.log('cloneToEdit\n', JSON.stringify(cloneToEdit))
	// State Variables
	const [editCloneData, setEditCloneData] = useState({});
	const [editCloneDataErrors, setEditCloneDataErrors] = useState({});
	const classes = useStyles();

	//Component Methods
	const closeCloneModal = () => {
		setEditCloneData({});
		setEditCloneDataErrors({});
		setShowCreateEditCloneModal(false);
	};

	const handleCheck = (event) => {
		setEditCloneData({
			...editCloneData,
			[event.target.name]: event.target.checked,
		});
	};

	const handleTextChange = (event, key) => {
		const tmpData = { ...editCloneData };
		const cloneErrors = { ...editCloneDataErrors };

		cloneErrors[key] = false;
		tmpData[key] = event.target.value;

		setEditCloneDataErrors(cloneErrors);
		setEditCloneData(tmpData);
	};

	useEffect(() => {
		if (showCreateEditCloneModal && cloneToEdit) {
			if(cloneToEdit.available_at !== null){
				cloneToEdit.available_at = cloneToEdit.available_at.join(', ');
			}
			setEditCloneData(cloneToEdit);
		} else {
			setEditCloneData({ ...DEFAULT_VALUES });
		}
	}, [showCreateEditCloneModal, cloneToEdit]);

	return (
		<Dialog
			open={showCreateEditCloneModal}
			scroll={'paper'}
			maxWidth="lg"
			disableEscapeKeyDown
			disableBackdropClick
			classes={{
				paperWidthLg: classes.dialogLg,
			}}
		>
			<DialogTitle>
				<div style={{ display: 'flex', width: '100%' }}>
					<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>
						{editCloneData.id && editCloneData.id > 0
							? 'Edit Clone'
							: 'Create Clone'}
					</Typography>
				</div>
				<IconButton
					aria-label="close"
					style={{
						position: 'absolute',
						right: '0px',
						top: '0px',
						height: 60,
						width: 60,
						color: 'black',
						backgroundColor: styles.backgroundGreyLight,
						borderRadius: 0,
					}}
					onClick={() => closeCloneModal()}
				>
					<CloseIcon style={{ fontSize: 30 }} />
				</IconButton>
			</DialogTitle>

			<DialogContent style={{ height: 700 }}>
				<div style={{ margin: '0 20px' }}>
					<div>
						<Typography variant="h4" style={styles.modalHeaders}>
							Input Fields
						</Typography>
						{cloneTableMetaData.stringFields.map((field) => (
							<TextField
								key={field.key}
								label={getCloneModalTextDisplayName(field)}
								value={editCloneData[field.key]}
								onChange={(event) => handleTextChange(event, field.key)}
								className={classes.textField}
								helperText={field.display_name}
								margin="dense"
								error={editCloneDataErrors[field.key]}
							/>
						))}
					</div>
					<div>
						<Typography variant="h4" style={styles.modalHeaders}>
							Boolean Fields
						</Typography>
						{cloneTableMetaData.booleanFields.map((field) => (
							<FormControlLabel
								key={field.key}
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
				</div>
			</DialogContent>

			<DialogActions>
				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						width: '100%',
						margin: '0px 18px',
					}}
				>
					<GCButton
						id={'editCloneSubmit'}
						onClick={() => storeCloneData(editCloneData)}
						style={{ margin: '10px' }}
					>
						Submit
					</GCButton>
				</div>
			</DialogActions>
		</Dialog>
	);
};
