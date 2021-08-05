import React, {useState, useEffect} from 'react';
import GCButton from "../../common/GCButton";
import {useStyles} from '../GCAdminStyles';
/**
 * 
 * @class AdminList
 */
export default ({handleAddRow, editorAddTerm, setEditorAddTerm, setShowAddEditorTermDialog, showAddEditorTermDialog}) => {
	
	const classes = useStyles();
	return (
		<Dialog
			open={showAddEditorTermDialog}
			scroll={'paper'}
			maxWidth='300px'
		>
			<TextField
				id="margin-dense"
				onBlur={event => setEditorAddTerm({...editorAddTerm, value:event.target.value})}
				className={classes.textField}
				style={{padding:10}}
				helperText="Term to add..."
				margin="dense"
			/>
			<div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', padding:10}}>
				<GCButton
					id={'addTermSubmit'}
					onClick={()=>{
						setEditorAddTerm({value:'', section:'topic'});
						handleAddRow(editorAddTerm.section, editorAddTerm.value)
						setShowAddEditorTermDialog(false);
					}}
					style={{margin:'10px'}}
				>
					Submit
				</GCButton>
				<GCButton
					id={'addTermCancel'}
					onClick={()=>{
						setEditorAddTerm({value:'', section:'topic'});
						setShowAddEditorTermDialog(false);
					}}
					style={{margin:'10px'}}
				>
					Cancel
				</GCButton>
			</div>
		</Dialog>
	)
}