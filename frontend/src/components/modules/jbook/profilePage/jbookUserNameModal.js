import React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { ButtonStyles } from './profilePageStyles';
import TextField from '@material-ui/core/TextField';
import GCButton from '../../../common/GCButton';
import { setState } from '../../../../utils/sharedFunctions';

// modal for acquiring user's first and last name for comments
const JBookUserNameModal = ({ showUserModal, userData, dispatch, setShowUserModal, updateUserProfileData }) => {
	const handleFirstChange = (e) => {
		setState(dispatch, { userData: { ...userData, first_name: e.target.value } });
	};

	const handleLastChange = (e) => {
		setState(dispatch, { userData: { ...userData, last_name: e.target.value } });
	};

	const handleSubmitUserData = () => {
		setShowUserModal(false);
		updateUserProfileData({ userData });
	};
	return (
		<Dialog open={showUserModal}>
			<DialogTitle>User Profile Info</DialogTitle>
			<DialogContent>
				<p>Please enter your first and last name:</p>
				<TextField
					label="First Name"
					variant="outlined"
					style={{ width: '100%', margin: '5px 0' }}
					onBlur={handleFirstChange}
					color="secondary"
					defaultValue={userData.first_name ?? ''}
				/>
				<TextField
					label="Last Name"
					variant="outlined"
					style={{ width: '100%', margin: '5px 0' }}
					onBlur={handleLastChange}
					color="secondary"
					defaultValue={userData.last_name ?? ''}
				/>
			</DialogContent>
			<DialogActions>
				<GCButton style={ButtonStyles.submit} onClick={handleSubmitUserData}>
					Submit
				</GCButton>
			</DialogActions>
		</Dialog>
	);
};

export default JBookUserNameModal;
