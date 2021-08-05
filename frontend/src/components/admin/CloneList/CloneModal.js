import React, {useState, useEffect} from 'react';
import _ from "underscore";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import GCButton from "../common/GCButton";
import {styles} from './GCAdminStyles';

/**
 * 
 * @class CloneModal
 */
export default (props) => {
    const [editCloneID, setEditCloneID] = useState(-99);
	const [editCloneData, setEditCloneData] = useState({});
    const closeCloneModal = () => {
		setEditCloneID(-99);
		setEditCloneData({});
		setShowCreateEditCloneModal(false);
	}
    const handleCheck = (event) => {
        setEditCloneData({ ...editCloneData, [event.target.name]: event.target.checked })
    };

    

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
						<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>{editCloneID === -99 ? 'Create Clone' : 'Edit Clone'}</Typography>
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
							label={field.display_name}
							id="margin-dense"
							defaultValue={editCloneData ? editCloneData[field.key] : ''}
							onChange={event => {editCloneData[field.key] = event.target.value}}
							className={classes.textField}
							helperText={field.display_name}
							margin="dense"
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
							label={field.display_name}
							id="margin-dense"
							defaultValue={editCloneData ? JSON.stringify(editCloneData[field.key]) : ''}
							onChange={event => {editCloneData[field.key] = event.target.value}}
							className={classes.textField}
							helperText={field.display_name}
							margin="dense"
						/>
					))}
				</div>
			</div>
                </DialogContent>

                <DialogActions>
					<div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', margin: '0px 18px' }}>
						<GCButton
							id={'editCloneSubmit'}
							onClick={()=>storeCloneData()}
							style={{margin:'10px'}}
						>
							Submit
						</GCButton>
					</div>
                </DialogActions>
        </Dialog>
    )
}