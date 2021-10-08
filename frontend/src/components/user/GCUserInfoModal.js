import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	TextField,
} from '@material-ui/core';
import GCButton from '../common/GCButton';
import EmailValidator from 'email-validator';
import { getUserData, setState } from '../../utils/sharedFunctions';
import GamechangerUserManagementAPI from '../api/GamechangerUserManagement';
import GameChangerAPI from '../api/gameChanger-service-api';
import styled from 'styled-components';
import CloseIcon from '@material-ui/icons/Close';
const gameChangerAPI = new GameChangerAPI();
const gcUserManagementAPI = new GamechangerUserManagementAPI();
const CloseButton = styled.div`
	padding: 6px;
	background-color: white;
	border-radius: 5px;
	color: #8091a5 !important;
	border: 1px solid #b0b9be;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 0.4;
	position: absolute;
	right: 15px;
	top: 15px;
`;
const styles = {
	modalBody: {
		width: 1000,
		display: 'flex',
		flexDirection: 'column',
	},
	inputDiv: {
		width: '100%',
		margin: '16px auto',
	},
	textField: {
		width: '100%',
	},
	modalBtn: {
		marginBottom: 16,
		marginRight: 10,
		marginLeft: 0,
	},
	modalHeader: {
		padding: '16px 24px 0px',
	},
	disclaimer: {
		width: 970,
		display: 'flex',
		flexDirection: 'column',
		marginLeft: 25,
		marginBottom: -10,
		marginTop: 10,
		paddingRight: 30,
		fontFamily: 'Montserrat',
	},
};

export default function GCUserInfoModal(props) {
	const { context } = props;

	const { state, dispatch } = context;

	const [emailError, setEmailError] = useState(false);
	const [orgError, setOrgError] = useState(false);

	const checkRequired = (field, value) => {
		if (field === 'email') {
			setEmailError(!value || value === '' || !EmailValidator.validate(value));
		} else if (field === 'org') {
			setOrgError(!value || value === '');
		}
	};

	const isValid = () => {
		const { email, org } = state.userInfo;
		return (
			email !== null &&
			EmailValidator.validate(email) &&
			org !== null &&
			org !== ''
		);
	};

	const setUserInfoModal = (isOpen) => {
		setState(dispatch, { userInfoModalOpen: isOpen });
	};
	/**
	 * If the user closes the model that decision
	 * is put in local storage for a day
	 * @method passOnUserInfo
	 */
	const passOnUserInfo = () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);

		const userInfo = {
			passed: true,
			expires: tomorrow.toUTCString(),
		};
		localStorage.setItem('userInfoPassed', JSON.stringify(userInfo));
		setState(dispatch, { userInfoModalOpen: false });
	};

	const getUserFeedbackMode = async () => {
		try {
			const { data } = await gameChangerAPI.getUserFeedbackMode();
			const value = data.value === 'true';
			localStorage.setItem('userFeedbackMode', JSON.stringify(value));
		} catch (e) {
			console.error('Error getting user feedback mode', e);
		}
	};

	const handleUserInfoInput = (field, text) => {
		const userInfo = { ...state.userInfo };
		userInfo[field] = text;
		setState(dispatch, { userInfo });
	};

	const submitUserInfo = async () => {
		// save in pg
		try {
			await gcUserManagementAPI.submitUserInfo(state.userInfo);
			getUserData(dispatch);
		} catch (err) {
			console.log(err);
		}
		setUserInfoModal(false);
	};
	useEffect(() => {
		getUserFeedbackMode();
	}, []);

	return (
		<Dialog open={state.userInfoModalOpen} maxWidth="xl">
			<DialogTitle style={styles.modalHeader}>
				<div style={{ display: 'flex', width: '100%' }}>
					<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>
						Tell Us About Yourself
					</Typography>
				</div>
			</DialogTitle>
			<CloseButton onClick={passOnUserInfo}>
				<CloseIcon fontSize="large" />
			</CloseButton>
			<p style={styles.disclaimer}>
				The GAMECHANGER Team is collecting user data to support our research as
				we continue improving the application. Your responses will not be shared
				or used for any purposes outside of the GAMECHANGER development team.
			</p>
			<DialogContent style={styles.modalBody}>
				<div style={{ ...styles.inputDiv, height: 60 }}>
					{/* <Typography variant="h5">Email Address</Typography> */}
					<TextField
						label="Email Address"
						error={emailError}
						helperText={emailError ? 'Please enter a valid email address' : ''}
						variant="outlined"
						style={styles.textField}
						required
						onBlur={(event) => {
							handleUserInfoInput('email', event.target.value);
							checkRequired('email', event.target.value);
						}}
						FormHelperTextProps={{
							style: { fontSize: 12 },
						}}
					/>
				</div>
				<div style={{ ...styles.inputDiv, height: 60 }}>
					<TextField
						label="Organization"
						error={orgError}
						helperText={orgError ? 'Please enter an organization' : ''}
						variant="outlined"
						style={styles.textField}
						required
						onBlur={(event) => {
							handleUserInfoInput('org', event.target.value);
							checkRequired('org', event.target.value);
						}}
						FormHelperTextProps={{
							style: { fontSize: 12 },
						}}
					/>
				</div>
				<div style={styles.inputDiv}>
					<Typography variant="h6" style={{ margin: '0 0 5px 0' }}>
						(Optional) What data sets or capabilities is GAMECHANGER lacking
						that would be valuable for your role or office?
					</Typography>
					<TextField
						multiline
						variant="outlined"
						rows={4}
						style={styles.textField}
						onBlur={(event) => handleUserInfoInput('q1', event.target.value)}
					/>
				</div>
				<div style={styles.inputDiv}>
					<Typography variant="h6" style={{ margin: '0 0 5px 0' }}>
						(Optional) Can you share any examples of how GAMECHANGER has
						impacted your job?
					</Typography>
					<TextField
						multiline
						variant="outlined"
						rows={4}
						style={styles.textField}
						onBlur={(event) => handleUserInfoInput('q2', event.target.value)}
					/>
				</div>
			</DialogContent>
			<DialogActions>
				<GCButton
					onClick={passOnUserInfo}
					style={styles.modalBtn}
					isSecondaryBtn={true}
				>
					Close
				</GCButton>
				<GCButton
					onClick={() => submitUserInfo()}
					style={{ ...styles.modalBtn, marginRight: 16 }}
					disabled={!isValid() || emailError || orgError}
				>
					Submit
				</GCButton>
			</DialogActions>
		</Dialog>
	);
}

GCUserInfoModal.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			userInfo: PropTypes.objectOf(PropTypes.string),
			userInfoModalOpen: PropTypes.bool,
		}),
		dispatch: PropTypes.func,
	}),
};
