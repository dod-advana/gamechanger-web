import React, { useCallback, useEffect, useState } from 'react';
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
import GCButton from '../../../common/GCButton';
import { styles, useStyles } from '../../../admin/util/GCAdminStyles';
import JbookAddUsersModal from './jbookAddUsersModal';
import JbookAddTagsModal from './jbookAddTagsModal';
import styled from 'styled-components';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import GameChangerAPI from '../../../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();

const Pill = styled.button`
	padding: 2px 10px 3px;
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
export default ({ showModal, setShowModal, modalData, userList, userMap, user }) => {
	const classes = useStyles();
	const [showUsersModal, setShowUsersModal] = useState(false);
	const [showAdminsModal, setShowAdminsModal] = useState(false);
	const [showTagsModal, setShowTagsModal] = useState(false);
	const emptyData = {
		name: '',
		description: '',
		creator: user.id,
		admins: [],
		user_ids: [],
		tags: [],
		deleted: false,
		isPrivate: true,
	};
	const [data, setData] = useState(emptyData);
	const [create, setCreate] = useState(true);

	const closeModal = () => {
		setShowModal(false);
		setData(emptyData);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleDataChange = useCallback((val, key) => {
		const newData = { ...data };
		newData[key] = val;
		setData(newData);
	});

	// add user to portfolio data user_ids
	const handleAddUser = (id) => {
		try {
			if (!isNaN(id)) {
				let newList = [...data.user_ids];
				let idIndex = newList.indexOf(id);
				if (idIndex !== -1) {
					newList.splice(idIndex, 1);
				} else {
					newList.push(id);
				}

				handleDataChange(newList, 'user_ids');
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleAddAdmin = useCallback(
		(id) => {
			try {
				if (!isNaN(id)) {
					let newList = [...data.admins];
					let idIndex = newList.indexOf(id);
					if (idIndex !== -1) {
						newList.splice(idIndex, 1);
					} else {
						newList.push(id);
					}
					handleDataChange(newList, 'admins');
				}
			} catch (e) {
				console.log(e);
			}
		},
		[data.admins, handleDataChange]
	);

	// add tag to portfolio data tags
	const handleAddTag = (tag, add) => {
		try {
			let tagIndex = data.tags.indexOf(tag);
			let newList = [...data.tags];

			if (add) {
				if (tagIndex === -1 && tag !== '') {
					newList.push(tag);
				} else {
					// potentially add a notification here
				}
			} else {
				if (tagIndex !== -1) {
					newList.splice(tagIndex, 1);
				}
			}

			handleDataChange(newList, 'tags');
		} catch (e) {
			console.log(e);
		}
	};

	// render the selected users as pills on the portfolio editor
	const renderSelectedUsers = () => {
		try {
			let selectedUsers = [];
			let userIDs = data.user_ids;
			for (let id of userIDs) {
				let user = userMap[id];
				if (user) {
					selectedUsers.push(
						<Pill style={{ margin: '0 5px 10px' }}>
							{user.first_name} {user.last_name}
							<IconButton
								aria-label="close"
								style={{
									backgroundColor: '#BDBDBD',
									width: 17,
									height: 17,
									margin: '0 0 0 5px',
									color: 'white',
									padding: 0,
									borderRadius: '15px',
								}}
								onClick={() => handleAddUser(id)}
							>
								<CloseIcon style={{ fontSize: 11 }} />
							</IconButton>
						</Pill>
					);
				}
			}

			return selectedUsers;
		} catch (e) {
			console.log(e);
			console.log('Error rendering selected users on edit portfolio modal');
			return [];
		}
	};

	// render the selected admins as pills on the portfolio editor
	const renderSelectedAdmins = () => {
		try {
			let selectedUsers = [];
			let userIDs = data.admins;
			for (let id of userIDs) {
				let user = userMap[id];
				if (user) {
					selectedUsers.push(
						<Pill style={{ margin: '0 5px 10px' }}>
							{user.first_name} {user.last_name}
							<IconButton
								aria-label="close"
								style={{
									backgroundColor: '#BDBDBD',
									width: 17,
									height: 17,
									margin: '0 0 0 5px',
									color: 'white',
									padding: 0,
									borderRadius: '15px',
								}}
								onClick={() => handleAddAdmin(id)}
							>
								<CloseIcon style={{ fontSize: 11 }} />
							</IconButton>
						</Pill>
					);
				}
			}

			return selectedUsers;
		} catch (e) {
			console.log(e);
			console.log('Error rendering selected admins on edit portfolio modal');
			return [];
		}
	};

	// render the selected users as pills on the portfolio editor
	const renderSelectedTags = () => {
		try {
			let selectedTags = [];
			let tags = data.tags;
			for (const tag of tags) {
				selectedTags.push(
					<Pill style={{ margin: '0 5px 10px' }}>
						{tag}
						<IconButton
							aria-label="close"
							style={{
								backgroundColor: '#BDBDBD',
								width: 17,
								height: 17,
								margin: '0 0 0 5px',
								color: 'white',
								padding: 0,
								borderRadius: '15px',
							}}
							onClick={() => handleAddTag(tag, false)}
						>
							<CloseIcon style={{ fontSize: 11 }} />
						</IconButton>
					</Pill>
				);
			}

			return selectedTags;
		} catch (e) {
			console.log(e);
			console.log('Error rendering the selected tag pills on edit portfolio modal');
		}
	};

	useEffect(() => {
		if (Object.keys(modalData).length > 0) {
			setCreate(false);
			setData(modalData);
		}
	}, [modalData]);

	//Automatically adds the user as the admin when they attempt to create a new portfolio
	useEffect(() => {
		if (showModal) {
			handleAddAdmin(user.id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showModal, user]);

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
				handleAddUser={handleAddUser}
			/>
			<JbookAddUsersModal
				showModal={showAdminsModal}
				setShowModal={setShowAdminsModal}
				userList={userList}
				portfolioData={data}
				renderSelectedUsers={renderSelectedAdmins}
				handleAddUser={handleAddAdmin}
				admin={true}
			/>
			<JbookAddTagsModal
				showModal={showTagsModal}
				setShowModal={setShowTagsModal}
				tagsList={[]}
				portfolioData={data}
				handleAddTag={handleAddTag}
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
						onClick={closeModal}
					>
						<CloseIcon style={{ fontSize: 30 }} />
					</IconButton>
				</DialogTitle>
				<DialogContent style={{ height: 600, padding: '8px 5px' }}>
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
								<div>
									Creator:{' '}
									{(userMap[data.creator] ? userMap[data.creator].first_name : '') +
										' ' +
										(userMap[data.creator] ? userMap[data.creator].last_name : '')}
								</div>
								<TextField
									style={{ width: '100%', backgroundColor: 'white', marginTop: '10px' }}
									label="Portfolio Name"
									id="margin-dense"
									variant="outlined"
									defaultValue={data.name ?? null}
									onChange={(event) => handleDataChange(event.target.value, 'name')}
									className={classes.textField}
									margin="dense"
								/>
								<TextField
									style={{ width: '100%', backgroundColor: 'white', marginTop: '10px' }}
									label="Portfolio Description"
									id="margin-dense"
									variant="outlined"
									defaultValue={data.description ?? null}
									onChange={(event) => handleDataChange(event.target.value, 'description')}
									className={classes.textField}
									margin="dense"
									multiline
									rows={4}
								/>
								<hr />
								{/* <Typography variant="h5" display="inline" style={{ fontWeight: 700 }}>
									Upload Ontology
								</Typography>
								<FormControl
									fullWidth
									sx={{ m: 1 }}
									variant="standard"
									style={{ marginTop: 15, display: 'flex', flexDirection: 'row' }}
								>
									<IconButton
										aria-label="close"
										style={{
											backgroundColor: styles.backgroundGreyLight,
											marginRight: 15,
											borderRadius: '30px',
											height: '30px',
											width: '30px',
										}}
										onClick={() => {}}
									>
										<AddIcon style={{ cursor: 'pointer' }} />
									</IconButton>
								</FormControl>
								<hr /> */}
								<Typography variant="h5" display="inline" style={{ fontWeight: 700 }}>
									ADD ADMINISTRATORS
								</Typography>
								<FormControl
									fullWidth
									sx={{ m: 1 }}
									variant="standard"
									style={{ marginTop: 15, display: 'flex', flexDirection: 'row' }}
								>
									<IconButton
										aria-label="close"
										style={{
											backgroundColor: styles.backgroundGreyLight,
											marginRight: 15,
											borderRadius: '30px',
											height: '30px',
											width: '30px',
										}}
										onClick={() => setShowAdminsModal(true)}
									>
										<AddIcon style={{ cursor: 'pointer' }} />
									</IconButton>
									<div style={{ minHeight: 35 }}>{renderSelectedAdmins()}</div>
								</FormControl>
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
										style={{
											backgroundColor: styles.backgroundGreyLight,
											marginRight: 15,
											borderRadius: '30px',
											height: '30px',
											width: '30px',
										}}
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
										style={{
											backgroundColor: styles.backgroundGreyLight,
											marginRight: 15,
											borderRadius: '30px',
											height: '30px',
											width: '30px',
										}}
										onClick={() => setShowTagsModal(true)}
									>
										<AddIcon style={{ cursor: 'pointer' }} />
									</IconButton>
									<div style={{ minHeight: 35 }}>{renderSelectedTags()}</div>
								</FormControl>
							</Grid>
						</Grid>
					</div>
				</DialogContent>
				<DialogActions>
					<GCButton onClick={closeModal} style={{ margin: '10px' }} buttonColor={'#8091A5'}>
						Close
					</GCButton>
					<GCButton
						onClick={async () => {
							try {
								let createEditOptions = { ...data };
								if (data.id !== undefined) {
									// if we are editing, send over current user in api (for permission checking)
									createEditOptions.user = user.id;
								}

								await gameChangerAPI.callDataFunction({
									functionName: data.id === undefined ? 'createPortfolio' : 'editPortfolio',
									cloneName: 'jbook',
									options: createEditOptions,
								});
							} catch (e) {
								console.log(e);
							}

							closeModal();
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
