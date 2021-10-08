import React from 'react';
import UOTDialog from '../../common/GCDialog';
import GCButton from '../../common/GCButton';
import { Typography } from '@material-ui/core';
import '../../export/export-results-dialog.css';

//TODO replace orgFilterQuery with orgFilterString when DE has data in for display_org_s in prod

export default ({ open, handleClose, query }) => {
	return (
		<UOTDialog
			open={open}
			title={
				<Typography variant="h3" display="inline">
					Elasticsearch Query
				</Typography>
			}
			onRequestClose={handleClose}
			width="1000px"
			primaryLabel=""
			primaryAction={() => {}}
			handleClose={handleClose}
		>
			<div>
				<p style={{ fontSize: '12px' }}>{JSON.stringify(query)}</p>
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
