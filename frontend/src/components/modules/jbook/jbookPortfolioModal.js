import React, { useEffect, useState } from 'react';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	TextField,
	Typography,
	FormControl,
} from '@material-ui/core';
import AddIcon from '@mui/icons-material/Add';
import GCButton from '../../common/GCButton';
import { styles, useStyles } from '../../admin/util/GCAdminStyles';
import JbookAddUsersModal from './jbookAddUsersModal';
import JbookAddTagsModal from './jbookAddTagsModal';
import styled from 'styled-components';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import GameChangerAPI from '../../api/gameChanger-service-api';
const gameChangerAPI = new GameChangerAPI();

const Pill = styled.button`
	padding: 2px 10px 3px;
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
	const [showUsersModal, setShowUsersModal] = useState(false);
	const [showTagsModal, setShowTagsModal] = useState(false);

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

	const handleAddButton = (id) => {
		if (!isNaN(id)) {
			let newList = [...data.user_ids];
			let idIndex = newList.indexOf(id);
			if (idIndex !== -1) {
				newList.splice(idIndex, 1);
			} else {
				newList.push(id);
			}

			handleTextChange(newList, 'user_ids');
		}
	};

	const renderSelectedUsers = () => {
		let selectedUsers = [];
		let userIDs = data.user_ids;
		for (let i = 0; i < userIDs.length; i++) {
			let user = userMap[userIDs[i]];
			selectedUsers.push(
				<Pill id={userIDs[i]} style={{ margin: '0 5px 10px' }}>
					{user.first_name} {user.last_name}
					<IconButton
						id={userIDs[i]}
						aria-label="close"
						style={{
							backgroundColor: '#BDBDBD',
							width: 17,
							height: 17,
							margin: '0 0 0 5px',
							color: 'white',
							padding: 0,
						}}
						onClick={() => handleAddButton(userIDs[i])}
					>
						<CloseIcon style={{ fontSize: 12 }} id={userIDs[i]} />
					</IconButton>
				</Pill>
			);
		}

		return selectedUsers;
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
		<>
			<JbookAddUsersModal
				showModal={showUsersModal}
				setShowModal={setShowUsersModal}
				userList={userList}
				portfolioData={data}
				renderSelectedUsers={renderSelectedUsers}
				handleAddButton={handleAddButton}
			/>
			<JbookAddTagsModal
				showModal={showTagsModal}
				setShowModal={setShowTagsModal}
				tagsList={[]}
				portfolioData={data}
			/>
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
				<DialogContent style={{ height: 500, padding: '8px 5px' }}>
					<div style={{ margin: '0 20px' }}>
						<Grid
							container
							style={{
								background: '#f2f2f2',
								borderRadius: 6,
								marginTop: 10,
								marginBottom: 10,
								padding: 10,
							}}
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
								<hr />
								<Typography variant="h5" display="inline" style={{ fontWeight: 700 }}>
									ADD PEOPLE WITH ACCESS
								</Typography>
								<FormControl
									fullWidth
									sx={{ m: 1 }}
									variant="standard"
									style={{ marginTop: 15, display: 'flex', flexDirection: 'row' }}
								>
									<IconButton
										aria-label="close"
										style={{ backgroundColor: styles.backgroundGreyLight, marginRight: 15 }}
										onClick={() => setShowUsersModal(true)}
									>
										<AddIcon style={{ cursor: 'pointer' }} />
									</IconButton>
									<div style={{ minHeight: 35 }}>{renderSelectedUsers()}</div>
								</FormControl>
								<hr />
								<Typography variant="h5" display="inline" style={{ fontWeight: 700 }}>
									ADD TAGS
								</Typography>
								<FormControl
									fullWidth
									sx={{ m: 1 }}
									variant="standard"
									style={{ marginTop: 15, display: 'flex', flexDirection: 'row' }}
								>
									<IconButton
										aria-label="close"
										style={{ backgroundColor: styles.backgroundGreyLight }}
										onClick={() => setShowTagsModal(true)}
									>
										<AddIcon style={{ cursor: 'pointer' }} />
									</IconButton>
									<div style={{ minHeight: 35 }}></div>
								</FormControl>
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
		</>
	);
};
