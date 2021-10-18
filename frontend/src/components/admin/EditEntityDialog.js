import React, { useState } from 'react';
import PropTypes from 'prop-types';
import UOTDialog from '../common/GCDialog';
import GCButton from '../common/GCButton';
import { FormControl, Typography, TextField } from '@material-ui/core';
import GameChangerAPI from '../api/gameChanger-service-api';
import '../../components/export/export-results-dialog.css';
import { makeStyles } from '@material-ui/core/styles';

const gameChangerAPI = new GameChangerAPI();

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

const EditEntityDialog = ({
	open,
	handleClose,
	url,
	orgName,
	setSealURLOverride,
}) => {
	const [sealURL, setSealURL] = useState(url);
	const classes = useStyles();

	async function handleSave() {
		try {
			await gameChangerAPI.saveOrgImageOverrideURL({
				name: orgName,
				imageURL: sealURL,
			});
			setSealURLOverride(sealURL);
			handleClose();
		} catch (err) {
			console.log({ err });
		}
	}

	return (
		<UOTDialog
			open={open}
			title={
				<div>
					<Typography variant="h3" display="inline">
						Edit Details
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
			<FormControl style={{ width: '100%', marginTop: 5 }}>
				<TextField
					label="Seal Image URL"
					variant="outlined"
					InputLabelProps={{ className: classes.labelFont }}
					InputProps={{ className: classes.labelFont }}
					FormHelperTextProps={{ className: classes.helperText }}
					value={sealURL}
					onChange={(event) => setSealURL(event.target.value)}
				/>
			</FormControl>

			<div
				style={{
					height: '60px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					margin: '3% 0 0 0',
				}}
			>
				<div style={styles.leftButtonGroup}></div>

				<div style={styles.rightButtonGroup}>
					<GCButton onClick={handleClose} isSecondaryBtn={true}>
						Close
					</GCButton>
					<GCButton onClick={handleSave}>Save</GCButton>
				</div>
			</div>
		</UOTDialog>
	);
};

EditEntityDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	url: PropTypes.string,
	orgName: PropTypes.string,
	setSealURLOverride: PropTypes.func,
};

export default EditEntityDialog;
