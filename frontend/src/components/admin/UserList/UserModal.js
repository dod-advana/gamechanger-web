import React, {useEffect, useState} from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography} from '@material-ui/core';
import GCButton from '../../common/GCButton';
import {GCCheckbox, styles, useStyles} from '../util/GCAdminStyles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import GameChangerAPI from '../../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();

/**
 * 
 * @class UserModal
 */
export default ({showCreateEditUserModal, setShowCreateEditUserModal, userData, getUserData}) => {
	const [editUserData, setEditUserData] = useState({});
    

	const classes = useStyles();

	useEffect(()=>{
		setEditUserData(userData);
	},[userData])

	const closeUserModal = () => {
		setEditUserData({});
		setShowCreateEditUserModal(false);
	}
	/**
     * 
     * @param {*} UserToEdit
     * @returns 
     */
    
	const storeUserData = (userToEdit = null) => {
		if (!userToEdit) {
			userToEdit = editUserData;
		}

		gameChangerAPI.storeUserData(userToEdit).then(data => {
			if (data.status === 200) {
				closeUserModal();
				getUserData();
			}
		});
	}

	const handleCheck = (event) => {
		setEditUserData({ ...editUserData, [event.target.name]: event.target.checked })
	};

	const handleTextChange = (event, key) => {
		const tmpData = { ...editUserData };
		tmpData[key] = event.target.value;
		setEditUserData(tmpData);
	};

	return(
		<Dialog
			open={showCreateEditUserModal}
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
					<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>{`Edit ${editUserData.first_name || ''} ${editUserData.last_name || ''}'s User Data`}</Typography>
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
				}} onClick={() => closeUserModal()}>
					<CloseIcon style={{ fontSize: 30 }} />
				</IconButton>
			</DialogTitle>
			<DialogContent style={{ height: 400 }}>
				<div style={{ margin: '0 20px' }}>
					<Grid container>
						<Grid item xs={6}>
							<TextField
								label="First Name"
								id="margin-dense"
								defaultValue={editUserData ? editUserData.first_name : null}
								onChange={event => handleTextChange(event, 'first_name')}
								className={classes.textField}
								margin="dense"
							/>
							<TextField
								label="Organization"
								id="margin-dense"
								defaultValue={editUserData ? editUserData.organization : null}
								onChange={event => handleTextChange(event, 'organization')}
								className={classes.textField}
								margin="dense"
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								label="Last Name"
								id="margin-dense"
								defaultValue={editUserData ? editUserData.last_name : null}
								onChange={event => handleTextChange(event, 'last_name')}
								className={classes.textField}
								margin="dense"
							/>
							<TextField
								label="Email"
								id="margin-dense"
								defaultValue={editUserData ? editUserData.email : null}
								onChange={event => handleTextChange(event, 'email')}
								className={classes.textField}
								margin="dense"
							/>
						</Grid>

						<Grid item xs>
							<FormControlLabel
								key={'is_beta'}
								control={
									<GCCheckbox
										checked={editUserData['is_beta']}
										onChange={handleCheck}
										name={'is_beta'}
										color="primary"
										style={styles.checkbox}
									/>
								}
								label={'Beta User'}
							/>
							<FormControlLabel
								key={'is_internal'}
								control={
									<GCCheckbox
										checked={editUserData['is_internal']}
										onChange={handleCheck}
										name={'is_internal'}
										color="primary"
										style={styles.checkbox}
									/>
								}
								label={'Internal User'}
							/>
							<FormControlLabel
								key={'is_admin'}
								control={
									<GCCheckbox
										checked={editUserData['is_admin']}
										onChange={handleCheck}
										name={'is_admin'}
										color="primary"
										style={styles.checkbox}
									/>
								}
								label={'Admin'}
							/>
						</Grid>
					</Grid>
				</div>
			</DialogContent>
			<DialogActions>
				<GCButton
					id={'editUserClose'}
					onClick={closeUserModal}
					style={{ margin: '10px' }}
					buttonColor={'#8091A5'}
				>
						Close
				</GCButton>
				<GCButton
					id={'editUserSubmit'}
					onClick={() => storeUserData()}
					style={{ margin: '10px', backgroundColor: '#1C2D64', borderColor: '#1C2D64' }}
				>
						Submit
				</GCButton>
			</DialogActions>
			
		</Dialog>
	)
}
