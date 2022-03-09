import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography} from '@material-ui/core';
import GCButton from '../../common/GCButton';
import {styles, useStyles} from '../util/GCAdminStyles';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';


/**
 * 
 * @class EditReviewStatusModal
 */
export default ({showEditReviewStatusEmailModal, setShowEditReviewStatusEmailModal, setEmailAddress, sendEmail}) => {

	const classes = useStyles();

	return(
		<Dialog
			open={showEditReviewStatusEmailModal}
			scroll={'paper'}
			maxWidth="sm"
			disableEscapeKeyDown
			disableBackdropClick
			classes={{
				paperWidthSm: classes.dialogSm
			}}
		>
			<DialogTitle >
				<div style={{ display: 'flex', width: '100%' }}>
					<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>{'Send Review Status Update Email'}</Typography>
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
				}} onClick={() => setShowEditReviewStatusEmailModal(false)}>
					<CloseIcon style={{ fontSize: 30 }} />
				</IconButton>
			</DialogTitle>
			<DialogContent style={{ height: 200 }}>
				<div style={{ margin: '0 20px' }}>
					<Grid container>
						<Grid item xs={12}>
							<TextField
								label="Email"
								id="margin-dense"
								onChange={event => setEmailAddress(event.target.value)}
								className={classes.textField}
								margin="dense"
							/>
						</Grid>
					</Grid>
				</div>
			</DialogContent>
			<DialogActions>
				<GCButton
					id={'editUserClose'}
					onClick={() => setShowEditReviewStatusEmailModal(false)}
					style={{ margin: '10px' }}
					buttonColor={'#8091A5'}
				>
						Close
				</GCButton>
				<GCButton
					id={'editUserSubmit'}
					onClick={() => sendEmail()}
					style={{ margin: '10px', backgroundColor: '#1C2D64', borderColor: '#1C2D64' }}
				>
						Submit
				</GCButton>
			</DialogActions>

		</Dialog>
	);
};
