import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
} from '@material-ui/core';
import GCButton from '../common/GCButton';
import CloseIcon from '@material-ui/icons/Close';
import '../../components/export/export-results-dialog.css';
import { makeStyles } from '@material-ui/core/styles';

const CloseButton = styled.div`
	padding: 6px;
	background-color: white;
	border-radius: 5px;
	color: #8091a5 !important;
	border: 1px solid #b0b9be;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 0.4;
	position: absolute;
	right: 15px;
	top: 15px;
`;

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

const RequestAPIKeyDialog = ({
	handleClose,
	handleSave,
	apiRequestLimit,
	renderContent,
}) => {
	const classes = useStyles();

	return (
		<Dialog
			open
			scroll={'paper'}
			maxWidth="lg"
			disableEscapeKeyDown
			disableBackdropClick
			classes={{ paperWidthLg: classes.dialogLg }}
		>
			<DialogTitle>
				<div style={{ display: 'flex', width: '100%' }}>
					<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>
						Request API Key
					</Typography>
					<Typography
						display="inline"
						style={{ fontSize: '14px', lineHeight: '33px', marginLeft: '5px' }}
					>{`Limit 3 per month (${apiRequestLimit} left)`}</Typography>
				</div>
				<CloseButton onClick={handleClose}>
					<CloseIcon fontSize="large" />
				</CloseButton>
			</DialogTitle>

			<DialogContent style={{ height: '100%' }}>
				{renderContent()}
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
						onClick={handleClose}
						style={{ margin: '10px' }}
						isSecondaryBtn={true}
					>
						Cancel
					</GCButton>
					<GCButton
						id={'editCloneSubmit'}
						onClick={handleSave}
						style={{ margin: '10px' }}
						disabled={apiRequestLimit === 0}
					>
						Submit
					</GCButton>
				</div>
			</DialogActions>
		</Dialog>
	);
};

RequestAPIKeyDialog.propTypes = {
	handleClose: PropTypes.func.isRequired,
	handleSave: PropTypes.func,
	apiRequestLimit: PropTypes.number,
	renderContent: PropTypes.func,
};

export default RequestAPIKeyDialog;
