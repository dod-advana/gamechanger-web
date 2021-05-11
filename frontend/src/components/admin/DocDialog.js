import React from 'react';
import UOTDialog from '../common/GCDialog';
import { Typography } from '@material-ui/core'
import '../export/export-results-dialog.css';
import GCButton from "../common/GCButton";

//TODO replace orgFilterQuery with orgFilterString when DE has data in for display_org_s in prod

export default ({ open, handleClose, doc }) => {

	return (
		<UOTDialog
			open={open}
			title={<Typography variant="h3" display="inline">Selected Doc</Typography>}
			onRequestClose={handleClose}
			width="1000px"
			primaryLabel=''
			primaryAction={() => { }}
		> 
		<div>
			<p style={{fontSize: '12px'}}>{JSON.stringify(doc)}</p>
		</div>
		<div>
			<GCButton
				onClick={handleClose}
			>
				Close
			</GCButton>
		</div>
		</UOTDialog>
	)
}
