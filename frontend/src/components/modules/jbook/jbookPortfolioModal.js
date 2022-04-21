import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@material-ui/core';
import GCButton from '../../common/GCButton';
import { styles, useStyles } from '../../admin/util/GCAdminStyles';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Autocomplete from '@material-ui/lab/Autocomplete';

/**
 *
 * @class UserModal
 */
export default ({ showModal, setShowModal, modalData }) => {
	const classes = useStyles();
	const [data, setData] = useState({
		name: '',
		description: '',
		user_ids: [],
		tags: [],
	});
	const [create, setCreate] = useState(true);
	const closeReviewerModal = () => {
		setShowModal(false);
	};
	const handleTextChange = (val, key) => {
		const newData = { ...data };
		newData[key] = val;
		setData(newData);
	};

	useEffect(() => {
		if (Object.keys(modalData).length > 0) {
			setCreate(false);
			setData(modalData);
		}
	}, [modalData]);

	/**
	 *
	 * @param {*} ReviewerToEdit
	 * @returns
	 */

	return (
		<Dialog
			open={showModal}
			scroll={'paper'}
			maxWidth="sm"
			disableEscapeKeyDown
			disableBackdropClick
			classes={{
				paperWidthSm: classes.dialogSm,
			}}
		>
			<DialogTitle>
				<div style={{ display: 'flex', width: '100%' }}>
					<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>{`${
						create ? 'Create' : 'Edit'
					} Portfolio`}</Typography>
				</div>
				<IconButton
					aria-label="close"
					style={{
						position: 'absolute',
						right: '0px',
						top: '0px',
						height: 60,
						width: 60,
						color: 'black',
						backgroundColor: styles.backgroundGreyLight,
						borderRadius: 0,
					}}
					onClick={() => closeReviewerModal()}
				>
					<CloseIcon style={{ fontSize: 30 }} />
				</IconButton>
			</DialogTitle>
			<DialogContent style={{ height: 500 }}>
				<div style={{ margin: '0 20px' }}>
					<Grid
						container
						style={{ background: '#f2f2f2', borderRadius: 6, marginTop: 10, marginBottom: 10, padding: 10 }}
					>
						<Typography style={{ fontFamily: 'Montserrat', fontSize: 16 }}>
							Complete the fields below to {create ? 'create a new' : 'edit'} portfolio
						</Typography>
					</Grid>
					<Grid container>
						<Grid item xs={12}>
							<TextField
								style={{ width: '100%', backgroundColor: 'white', marginTop: '10px' }}
								label="Portfolio Name"
								id="margin-dense"
								variant="outlined"
								defaultValue={data.name ?? null}
								onChange={(event) => handleTextChange(event.target.value, 'name')}
								className={classes.textField}
								margin="dense"
							/>
							<TextField
								style={{ width: '100%', backgroundColor: 'white', marginTop: '10px' }}
								label="Portfolio Description"
								id="margin-dense"
								variant="outlined"
								defaultValue={data.description ?? null}
								onChange={(event) => handleTextChange(event.target.value, 'description')}
								className={classes.textField}
								margin="dense"
								multiline
								rows={4}
							/>
							<Autocomplete
								label="Users"
								options={['user 1', 'user 2', 'user 3']}
								value={data.user_ids ?? []}
								style={{ backgroundColor: 'white', marginTop: '10px' }}
								renderInput={(params) => <TextField {...params} label="Users" variant="outlined" />}
								onChange={(event, value) => {
									handleTextChange(value, 'user_ids');
								}}
								multiple
							/>
							<Autocomplete
								label="Tags"
								options={['Tag 1', 'Tag 2', 'Tag 3']}
								value={data.tags ?? []}
								style={{ backgroundColor: 'white', marginTop: '10px' }}
								renderInput={(params) => <TextField {...params} label="Tags" variant="outlined" />}
								onChange={(event, value) => {
									handleTextChange(value, 'tags');
								}}
								multiple
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
					onClick={() => {
						console.log(data);
						setShowModal(false);
					}}
					style={{ margin: '10px', backgroundColor: '#1C2D64', borderColor: '#1C2D64' }}
				>
					Submit
				</GCButton>
			</DialogActions>
		</Dialog>
	);
};
