import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@material-ui/core';
import GCButton from '../../common/GCButton';
import { styles, useStyles } from '../../admin/util/GCAdminStyles';
import styled from 'styled-components';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import Autocomplete from '@material-ui/lab/Autocomplete';
import GameChangerAPI from '../../api/gameChanger-service-api';
const gameChangerAPI = new GameChangerAPI();

const Pill = styled.button`
	border: none;
	border-radius: 15px;
	background-color: white;
	color: black;
	white-space: nowrap;
	text-align: center;
	display: inline-block;
	margin-left: 6px;
	margin-right: 6px;
	margin-bottom: 3px;
	border: 1px solid rgb(209, 215, 220);
	cursor: default !important;
	> i {
		margin-left: 3px;
		color: #e9691d;
	}
`;
/**
 *
 * @class UserModal
 */
export default ({ showModal, setShowModal, modalData, userList, userMap }) => {
	const classes = useStyles();
	const [init, setInit] = useState(false);
	const emptyData = {
		name: '',
		description: '',
		user_ids: [],
		tags: [],
		deleted: false,
	};
	const [data, setData] = useState(emptyData);
	const [create, setCreate] = useState(true);

	const closeReviewerModal = () => {
		setShowModal(false);
		setData(emptyData);
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
							{}
							<Autocomplete
								label="Users"
								options={userList}
								getOptionLabel={(user) =>
									(user.first_name ? user.first_name : '') +
									' ' +
									(user.last_name ? user.last_name : '')
								}
								value={[]}
								style={{ backgroundColor: 'white', marginTop: '10px' }}
								renderInput={(params) => {
									return <TextField {...params} label="Users" variant="outlined" />;
								}}
								onChange={(event, value) => {
									const newList = [...data.user_ids, value.id];
									console.log(newList);
									handleTextChange(newList, 'user_ids');
								}}
							/>
							<div style={{ marginTop: '10px' }}>
								{data.user_ids.map((user, index) => {
									return (
										<Pill>
											<div style={{ marginRight: '5px', marginLeft: '5px' }}>
												{userMap[user].first_name + ' ' + userMap[user].last_name}
											</div>
											<IconButton
												aria-label="close"
												style={{
													height: 10,
													width: 10,
													color: 'red',
													borderRadius: 0,
												}}
												onClick={() => {
													let newUsers = data.user_ids.filter((item) => item.id === user.id);
													const newData = { ...data, user_ids: newUsers };
													setData(newData);
												}}
											>
												<CancelIcon style={{ fontSize: 30 }} />
											</IconButton>
										</Pill>
									);
								})}
							</div>

							<Autocomplete
								label="Tags"
								options={['Tag 1', 'Tag 2', 'Tag 3']}
								value={data.tags ?? []}
								style={{ backgroundColor: 'white', marginTop: '10px' }}
								renderInput={(params) => <TextField {...params} label="Tags" variant="outlined" />}
								onChange={(event, value) => {
									console.log(value);
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
					onClick={async () => {
						console.log(data);
						const res = await gameChangerAPI.callDataFunction({
							functionName: data.id === undefined ? 'createPortfolio' : 'editPortfolio',
							cloneName: 'jbook',
							options: { ...data },
						});
						closeReviewerModal();
					}}
					style={{ margin: '10px', backgroundColor: '#1C2D64', borderColor: '#1C2D64' }}
				>
					Submit
				</GCButton>
			</DialogActions>
		</Dialog>
	);
};
