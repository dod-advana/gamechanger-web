import React from 'react';
import Modal from 'react-modal';
import { Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import GCButton from '../../common/GCButton';

const style = {
	overlay: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		borderRadius: '5px',
	},
};

export default ({ showDocIngestModal, setShowDocIngestModal }) => {
	return (
		<Modal isOpen={showDocIngestModal} data-cy="doc-ingest-modal" closeTimeoutMS={300} style={style}>
			<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
				<IconButton onClick={() => setShowDocIngestModal(false)}>
					<CloseIcon />
				</IconButton>
			</div>
			<Typography
				variant="h2"
				style={{
					width: '100%',
					padding: '20px',
					paddingLeft: '20px',
					fontSize: '25px',
				}}
			>
				Request Received
			</Typography>
			<div style={{ margin: '0 20px', fontSize: '1.2em' }}>
				<p>Thank you for your feedback!</p>
				<p>Your request that this document be made part of the GAMECHANGER corpus has been received.</p>
			</div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'flex-end',
					marginLeft: '20px',
					marginRight: '2em',
					width: '95%',
				}}
			>
				<GCButton
					id={'editCloneClose'}
					onClick={() => setShowDocIngestModal(false)}
					style={{ margin: '10px' }}
					buttonColor={'#8091A5'}
				>
					Close
				</GCButton>
			</div>
		</Modal>
	);
};
