import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';

import UOTDialog from '../../common/GCDialog';
import GCButton from '../../common/GCButton';
import '../../export/export-results-dialog.css';

const DocDialog = ({ open, handleClose, doc }) => {
	return (
		<UOTDialog
			open={open}
			title={
				<Typography variant="h3" display="inline">
					Selected Doc
				</Typography>
			}
			onRequestClose={handleClose}
			width="1000px"
			primaryLabel=""
			primaryAction={() => {}}
			handleClose={handleClose}
		>
			<div>
				<p style={{ fontSize: '12px' }}>{JSON.stringify(doc)}</p>
			</div>
			<div
				style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}
			>
				<GCButton onClick={handleClose} isSecondaryBtn={true}>
					Close
				</GCButton>
			</div>
		</UOTDialog>
	);
};

DocDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	doc: PropTypes.object.isRequired,
};

export default DocDialog;
