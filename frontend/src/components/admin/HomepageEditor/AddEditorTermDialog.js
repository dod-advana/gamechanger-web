import React, { useState } from 'react';
import { Dialog, TextField } from '@material-ui/core';
import GCButton from '../../common/GCButton';
import { useStyles } from '../util/GCAdminStyles';
/**
 *
 * @class AddEditorTermDialog
 */
export default ({
	handleAddRow,
	setShowAddEditorTermDialog,
	showAddEditorTermDialog,
	section,
}) => {
	const [editorAddTerm, setEditorAddTerm] = useState({});
	const classes = useStyles();

	const closeDialog = () => {
		setEditorAddTerm('');
		setShowAddEditorTermDialog(false);
	};
	return (
		<Dialog open={showAddEditorTermDialog} scroll={'paper'} maxWidth="sm">
			<TextField
				id="margin-dense"
				onBlur={(event) =>
					setEditorAddTerm({ ...editorAddTerm, name: event.target.value })
				}
				className={classes.textField}
				style={{ padding: 10 }}
				helperText="Term to add..."
				margin="dense"
			/>
			{section === 'major_pubs' && (
				<>
					<TextField
						id="margin-dense"
						onBlur={(event) =>
							setEditorAddTerm({
								...editorAddTerm,
								img_filename: event.target.value,
							})
						}
						className={classes.textField}
						style={{ padding: 10 }}
						helperText="image filename (in s3)"
						margin="dense"
					/>
					<TextField
						id="margin-dense"
						onBlur={(event) =>
							setEditorAddTerm({
								...editorAddTerm,
								doc_filename: event.target.value,
							})
						}
						className={classes.textField}
						style={{ padding: 10 }}
						helperText="document filename (+ file extension)"
						margin="dense"
					/>
				</>
			)}
			<div
				style={{
					display: 'flex',
					justifyContent: 'flex-end',
					width: '100%',
					padding: 10,
				}}
			>
				<GCButton
					id={'addTermSubmit'}
					onClick={() => {
						handleAddRow(editorAddTerm);
						closeDialog();
					}}
					style={{ margin: '10px' }}
				>
					Submit
				</GCButton>
				<GCButton
					id={'addTermCancel'}
					onClick={() => {
						closeDialog();
					}}
					style={{ margin: '10px' }}
				>
					Cancel
				</GCButton>
			</div>
		</Dialog>
	);
};
