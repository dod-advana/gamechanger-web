import React, {useEffect, useState} from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography} from '@material-ui/core';
import GCButton from '../../common/GCButton';
import {styles, useStyles} from '../util/GCAdminStyles';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Autocomplete from '@material-ui/lab/Autocomplete';
import GameChangerAPI from '../../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();

/**
 * 
 * @class UserModal
 */
export default ({showCreateEditReviewerModal, setShowCreateEditReviewerModal, reviewerData, getReviewerData}) => {
	const [editReviewerData, setEditReviewerData] = useState({});
    

	const classes = useStyles();

	useEffect(()=>{
		setEditReviewerData(reviewerData);
	},[reviewerData]);

	const closeReviewerModal = () => {
		setEditReviewerData({});
		setShowCreateEditReviewerModal(false);
	};
	/**
     * 
     * @param {*} ReviewerToEdit
     * @returns 
     */
    
	const storeReviewerData = (reviewerToEdit = null) => {
		if (!reviewerToEdit) {
			reviewerToEdit = editReviewerData;
		}

		gameChangerAPI.storeReviewerData(reviewerToEdit).then(data => {
			if (data.status === 200) {
				closeReviewerModal();
				getReviewerData();
			}
		});
	};

	const handleTextChange = (value, key) => {
		const tmpData = { ...editReviewerData };
		tmpData[key] = value;

		console.log(key);

		if (key === 'type'){
			switch (value) {
				case 'primary':
					tmpData['title'] = 'Primary Reviewer';
					break;
				case 'service':
					tmpData['title'] = 'Service Reviewer';
					break;
				case 'secondary':
					tmpData['title'] = 'Secondary Reviewer';
					break;
				default:
					break;
			}
		}
		setEditReviewerData(tmpData);
	};

	return(
		<Dialog
			open={showCreateEditReviewerModal}
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
					<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>{`${editReviewerData.name ? 'Edit ' + editReviewerData.name + '\'s' : 'Insert'} Reviewer Data`}</Typography>
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
				}} onClick={() => closeReviewerModal()}>
					<CloseIcon style={{ fontSize: 30 }} />
				</IconButton>
			</DialogTitle>
			<DialogContent style={{ height: 400 }}>
				<div style={{ margin: '0 20px' }}>
					<Grid container style={{ background: '#f2f2f2', borderRadius: 6, marginTop: 10, marginBottom: 10, padding: 10 }}>
						<Typography style={{ fontFamily: 'Montserrat', fontSize: 16 }}>Complete the fields below to add a new Primary, Service, or Secondary Reviewer</Typography>
					</Grid>
					<Grid container>
						<Grid item xs={6}>
							<TextField
								label="Name"
								id="margin-dense"
								defaultValue={editReviewerData ? editReviewerData.name : null}
								onChange={event => handleTextChange(event.target.value, 'name')}
								className={classes.textField}
								margin="dense"
								helperText={'Last, First'}
							/>
							<TextField
								label="Organization"
								id="margin-dense"
								defaultValue={editReviewerData ? editReviewerData.organization : null}
								onChange={event => handleTextChange(event.target.value, 'organization')}
								className={classes.textField}
								margin="dense"
								helperText={' '}
							/>
							<TextField
								label="Phone Number"
								id="margin-dense"
								defaultValue={editReviewerData ? editReviewerData.phone_number : null}
								onChange={event => handleTextChange(event.target.value, 'phone_number')}
								className={classes.textField}
								margin="dense"
								helperText={' '}
							/>
						</Grid>
						<Grid item xs={6}>
							<Autocomplete
								size="small"
								options={['primary', 'service', 'secondary']}
								style={{ width: 300, backgroundColor: 'white', marginBottom: 24 }}
								renderInput={(params) => <TextField {...params} label="Type" margin="dense" />}
								defaultValue={editReviewerData ? editReviewerData.type : null}
								onChange={(event, value) => {
									handleTextChange(value, 'type');
								}}
								disableClearable
								helperText={' '}
							/>
							{/*<TextField*/}
							{/*	label="Type"*/}
							{/*	id="margin-dense"*/}
							{/*	defaultValue={editReviewerData ? editReviewerData.type : null}*/}
							{/*	onChange={event => handleTextChange(event, 'type')}*/}
							{/*	className={classes.textField}*/}
							{/*	margin="dense"*/}
							{/*	helperText={'primary or service or secondary'}*/}
							{/*/>*/}
							<TextField
								label="Email"
								id="margin-dense"
								defaultValue={editReviewerData ? editReviewerData.email : null}
								onChange={event => handleTextChange(event.target.value, 'email')}
								className={classes.textField}
								margin="dense"
								helperText={' '}
							/>
							<TextField
								label="Title"
								id="margin-dense"
								value={editReviewerData ? editReviewerData.title : null}
								onChange={event => handleTextChange(event.target.value, 'title')}
								className={classes.textField}
								margin="dense"
								helperText={' '}
							/>
						</Grid>
					</Grid>
				</div>
			</DialogContent>
			<DialogActions>
				<GCButton
					id={'editReviewerClose'}
					onClick={closeReviewerModal}
					style={{ margin: '10px' }}
					buttonColor={'#8091A5'}
				>
						Close
				</GCButton>
				<GCButton
					id={'editReviewerSubmit'}
					onClick={() => storeReviewerData()}
					style={{ margin: '10px', backgroundColor: '#1C2D64', borderColor: '#1C2D64' }}
				>
						Submit
				</GCButton>
			</DialogActions>
			
		</Dialog>
	);
};
