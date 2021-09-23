import React, { useState } from 'react';
import Modal from 'react-modal';
import { TextField, Typography } from '@material-ui/core';

import GameChangerAPI from '../../api/gameChanger-service-api';
import GCButton from '../../common/GCButton';
import { styles, useStyles } from '../util/GCAdminStyles';

const gameChangerAPI = new GameChangerAPI();

/**
 *
 * @class AdminModal
 */
export default ({
	showCreateEditAdminModal,
	setShowCreateEditAdminModal,
	getAdminData,
}) => {
	const [editAdminID, setEditAdminID] = useState(-99);
	const [editAdminData, setEditAdminData] = useState({});

	const classes = useStyles();

	const closeAdminModal = () => {
		setEditAdminID(-99);
		setEditAdminData({});
		setShowCreateEditAdminModal(false);
	};
	/**
	 *
	 * @param {*} adminToEdit
	 * @returns
	 */

	const storeAdminData = (adminToEdit = null) => {
		const adminDataToStore = {};
		adminDataToStore.id = adminToEdit ? adminToEdit.username : editAdminID;
		if (!adminToEdit) {
			adminToEdit = editAdminData;
		}

		try {
			adminDataToStore.username = adminToEdit.username;
		} catch (e) {
			console.log('No username set');
			return;
		}

		gameChangerAPI.storeAdminData(adminDataToStore).then((data) => {
			if (data.status === 200) {
				closeAdminModal();
				getAdminData();
			}
		});
	};
	return (
		<Modal
			isOpen={showCreateEditAdminModal}
			onRequestClose={closeAdminModal}
			className="edit-clone-modal"
			overlayClassName="edit-clone-modal-overlay"
			id="edit-clone-modal"
			closeTimeoutMS={300}
			style={{
				margin: 'auto',
				marginTop: '30px',
				minWidth: '80%',
				maxWidth: '90%',
				display: 'flex',
				flexDirection: 'column',
				border: '1px solid gray',
				boxShadow: '1px 1px gray',
				borderRadius: '2px',
			}}
		>
			<Typography
				variant="h2"
				style={{
					width: '100%',
					padding: '20px',
					paddingLeft: '20px',
					fontSize: '25px',
				}}
			>
				{editAdminID === -99 ? 'Create Admin' : 'Edit Admin'}
			</Typography>
			<div style={{ margin: '0 20px' }}>
				<div className={classes.root}>
					<Typography variant="h4" style={styles.modalHeaders}>
						Admins
					</Typography>
					<TextField
						label="New Admin CAC ID"
						id="margin-dense"
						defaultValue={editAdminData ? editAdminData.username : null}
						onChange={(event) => {
							editAdminData.username = event.target.value;
						}}
						className={classes.textField}
						helperText="Admin"
						margin="dense"
					/>
				</div>
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
					onClick={closeAdminModal}
					style={{ margin: '10px' }}
					buttonColor={'#8091A5'}
				>
					Close
				</GCButton>
				<GCButton
					id={'editCloneSubmit'}
					onClick={() => storeAdminData()}
					style={{ margin: '10px' }}
				>
					Submit
				</GCButton>
			</div>
		</Modal>
	);
};
