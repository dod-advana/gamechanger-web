import React, { useEffect, useState } from 'react';
import { DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@material-ui/core';
import GCButton from '../../common/GCButton';
import { GCCheckbox, styles, useStyles } from '../util/GCAdminStyles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import GameChangerAPI from '../../api/gameChanger-service-api';
import styled from 'styled-components';
import { gcOrange } from '../../common/gc-colors';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { Dialog, Grid } from '@mui/material';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';

const gameChangerAPI = new GameChangerAPI();

const TabContainer = styled.div`
	align-items: center;
	min-height: 613px;

	.tab-button-container {
		width: 100%;
		display: flex;
		align-items: center;
	}

	.tabs-list {
		border-bottom: 2px solid ${gcOrange};
		padding: 0;
		display: flex;
		align-items: center;
		flex: 9;
		margin: 10px !important;
	}

	.panel-container {
		align-items: center;
		margin: 10px;
	}
`;

const tabList = [
	{
		title: 'userData',
		onClick: () => {},
		children: (
			<Typography variant="h6" display="inline" title="cardView">
				User Data
			</Typography>
		),
	},
	{
		title: 'clonePermissions',
		onClick: () => {},
		children: (
			<Typography variant="h6" display="inline" title="cardView">
				Clone Permissions
			</Typography>
		),
	},
];

/**
 *
 * @class UserModal
 */
const EditUserModal = React.memo(
	({ showCreateEditUserModal, setShowCreateEditUserModal, userData, getUserData, permissionsInfo, cloneName }) => {
		const [editUserData, setEditUserData] = useState({});
		const [tabIndex, setTabIndex] = useState(0);

		const classes = useStyles();

		useEffect(() => {
			setEditUserData(userData);
		}, [userData]);

		const closeUserModal = () => {
			setTabIndex(0);
			setEditUserData({});
			setShowCreateEditUserModal(false);
		};
		/**
		 *
		 * @param {*} UserToEdit
		 * @returns
		 */

		const storeUserData = (userToEdit = null) => {
			if (!userToEdit) {
				userToEdit = editUserData;
			}

			gameChangerAPI.storeUserData(userToEdit).then((data) => {
				if (data.status === 200) {
					closeUserModal();
					getUserData();
				}
			});
		};

		const handleCheck = (event) => {
			setEditUserData({ ...editUserData, [event.target.name]: event.target.checked });
		};

		const handlePermissionsCheck = (event) => {
			const tmpData = { ...editUserData };
			const splitKey = event.target.name.split('|');
			const clone = splitKey[0];
			const permissions = splitKey[1];
			if (tmpData['extra_fields']) {
				if (tmpData['extra_fields'][clone]) {
					tmpData['extra_fields'][clone][permissions] = event.target.checked;
				} else {
					tmpData['extra_fields'][clone] = {
						[permissions]: event.target.checked,
					};
				}
			}

			setEditUserData(tmpData);
		};

		const handleTextChange = (event, key) => {
			const tmpData = { ...editUserData };
			tmpData[key] = event.target.value;
			setEditUserData(tmpData);
		};

		const renderUserData = () => {
			return (
				<Grid container>
					<Grid item xs={6}>
						<TextField
							label="First Name"
							id="margin-dense"
							defaultValue={editUserData ? editUserData.first_name : null}
							onChange={(event) => handleTextChange(event, 'first_name')}
							className={classes.textField}
							margin="dense"
						/>
						<TextField
							label="Organization"
							id="margin-dense"
							defaultValue={editUserData ? editUserData.organization : null}
							onChange={(event) => handleTextChange(event, 'organization')}
							className={classes.textField}
							margin="dense"
						/>
					</Grid>
					<Grid item xs={6}>
						<TextField
							label="Last Name"
							id="margin-dense"
							defaultValue={editUserData ? editUserData.last_name : null}
							onChange={(event) => handleTextChange(event, 'last_name')}
							className={classes.textField}
							margin="dense"
						/>
						<TextField
							label="Email"
							id="margin-dense"
							defaultValue={editUserData ? editUserData.email : null}
							onChange={(event) => handleTextChange(event, 'email')}
							className={classes.textField}
							margin="dense"
						/>
					</Grid>

					<Grid item xs>
						{Permissions.permissionValidator(`Gamechanger Super Admin`, true) && (
							<FormControlLabel
								key={'is_super_admin'}
								control={
									<GCCheckbox
										checked={editUserData['is_super_admin']}
										onChange={handleCheck}
										name={'is_super_admin'}
										color="primary"
										style={styles.checkbox}
									/>
								}
								label={'Super Admin User'}
							/>
						)}
					</Grid>
				</Grid>
			);
		};

		const renderPermissions = () => {
			return (
				<>
					{Object.keys(permissionsInfo).map((permissionKey, indexAsKey) => {
						if (
							Permissions.permissionValidator(`${cloneName} Admin`, true) &&
							permissionKey === cloneName
						) {
							return (
								<div key={indexAsKey}>
									<Typography variant="h4" style={styles.modalHeaders}>
										{permissionKey.toUpperCase()}
									</Typography>
									<Grid container spacing={2} style={{ marginLeft: 8 }}>
										{permissionsInfo[permissionKey].map((permission, indexAsKey) => (
											<FormControlLabel
												key={`${indexAsKey}`}
												control={
													<GCCheckbox
														checked={
															editUserData['extra_fields'] &&
															editUserData['extra_fields'][permissionKey] &&
															editUserData['extra_fields'][permissionKey][permission]
																? editUserData['extra_fields'][permissionKey][
																		permission
																  ]
																: false
														}
														onChange={handlePermissionsCheck}
														name={`${permissionKey}|${permission}`}
														color="primary"
														style={{ ...styles.checkbox }}
													/>
												}
												label={permission}
											/>
										))}
									</Grid>
								</div>
							);
						} else if (Permissions.permissionValidator(`Gamechanger Super Admin`, true)) {
							return (
								<div key={indexAsKey}>
									<Typography variant="h4" style={styles.modalHeaders}>
										{permissionKey.toUpperCase()}
									</Typography>
									<Grid container spacing={2} style={{ marginLeft: 8 }}>
										{permissionsInfo[permissionKey].map((permission, indexAsKey) => (
											<FormControlLabel
												key={`${indexAsKey}`}
												control={
													<GCCheckbox
														checked={
															editUserData['extra_fields'] &&
															editUserData['extra_fields'][permissionKey] &&
															editUserData['extra_fields'][permissionKey][permission]
																? editUserData['extra_fields'][permissionKey][
																		permission
																  ]
																: false
														}
														onChange={handlePermissionsCheck}
														name={`${permissionKey}|${permission}`}
														color="primary"
														style={{ ...styles.checkbox }}
													/>
												}
												label={permission}
											/>
										))}
									</Grid>
								</div>
							);
						} else {
							return null;
						}
					})}
				</>
			);
		};

		return (
			<Dialog
				open={showCreateEditUserModal}
				scroll={'paper'}
				maxWidth={'lg'}
				fullWidth={true}
				disableEscapeKeyDown
				disableBackdropClick
			>
				<DialogTitle>
					<div style={{ display: 'flex', width: '100%' }}>
						<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>{`Edit ${
							editUserData.first_name || ''
						} ${editUserData.last_name || ''}'s User Data`}</Typography>
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
						onClick={() => closeUserModal()}
					>
						<CloseIcon style={{ fontSize: 30 }} />
					</IconButton>
				</DialogTitle>
				<DialogContent style={{ height: '100%', width: 1200 }}>
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
								Edit the fields below to update user permissions and general user data
							</Typography>
						</Grid>
						<TabContainer id="gc-clone-modal">
							<Tabs onSelect={(tabIndex) => setTabIndex(tabIndex)}>
								<div className={'tab-button-container'}>
									<TabList className={'tabs-list'}>
										{tabList.map((tab, index) => {
											const tl = index === 0 ? '5px' : '0';
											const tr = index === tabList.length - 1 ? '5px' : '0';
											return (
												<Tab
													key={index}
													style={{
														...styles.tabStyle,
														...(tabIndex === index ? styles.tabSelectedStyle : {}),
														borderRadius: `${tl} ${tr} 0 0`,
													}}
													title={tab.title}
													onClick={tab.onClick}
												>
													{tab.children}
												</Tab>
											);
										})}
									</TabList>
								</div>

								<div className={'panel-container'}>
									<TabPanel>{renderUserData()}</TabPanel>
									<TabPanel>{renderPermissions()}</TabPanel>
								</div>
							</Tabs>
						</TabContainer>
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
		);
	}
);

export default EditUserModal;
