import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { styled as muiStyled, styled } from '@mui/material/styles';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Typography,
	Button,
	DialogActions,
	Grid,
	Avatar,
	Box,
	TextField,
	Stack,
	Badge,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import ProfileDefaultImg from '../../images/logos/account_circle_black_24dp.png';
import { convertHexToRgbA } from '../../utils/gamechangerUtils';

const StyledDialog = styled(Dialog)(({ theme }) => ({
	'& .MuiPaper-root': {
		maxWidth: 1600,
		minWidth: 1600,
	},
	'& .MuiDialogActions-root': {
		margin: 20,
	},
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
	background: '#F5F5F5',
	width: '94%',
	margin: '20px 20px 0 20px',
}));

const StyledOutlinedButton = muiStyled(Button)(
	{
		fontSize: 16,
		fontFamily: 'Montserrat',
		'&:hover': {
			boxShadow: 'none',
		},
		'&:active': {
			boxShadow: 'none',
		},
	},
	(props) => ({
		borderColor: props.primaryColor,
		color: props.primaryColor,
		'&:hover': {
			borderColor: props.primaryColor,
		},
		'&:active': {
			borderColor: props.primaryColor,
		},
		'&:focus': {
			boxShadow: `0 0 0 0.2rem ${convertHexToRgbA(props.primaryColor, 0.5)}`,
		},
	})
);

const StyledFilledButton = muiStyled(Button)(
	{
		fontSize: 16,
		color: '#ffffff',
		fontFamily: 'Montserrat',
		'&:hover': {
			boxShadow: 'none',
		},
		'&:active': {
			boxShadow: 'none',
		},
	},
	(props) => ({
		borderColor: props.primaryColor,
		background: props.primaryColor,
		'&:hover': {
			borderColor: props.primaryColor,
			background: props.primaryColor,
		},
		'&:active': {
			borderColor: props.primaryColor,
		},
		'&:focus': {
			boxShadow: `0 0 0 0.2rem ${convertHexToRgbA(props.primaryColor, 0.5)}`,
		},
	})
);

const StyledTextField = muiStyled(TextField)({
	'& .MuiInputLabel-root': {
		fontSize: 16,
		fontFamily: 'Montserrat',
	},
	'& .MuiOutlinedInput-root': {
		fontSize: 18,
		fontFamily: 'Montserrat',
		background: '#ffffff',
	},
});

// const SmallAvatar = styled(Avatar)(({ theme }) => (
// 	props => ({
// 		width: props.size,
// 		height: props.size,
// 		border: `2px solid ${theme.palette.background.paper}`,
// 		background: '#ffffff'
// 	})
// ));

const REQUIRED_FIELDS = ['first_name', 'last_name', 'email', 'organization', 'country'];

const EditUserProfile = React.memo((props) => {
	const {
		updateUserData = () => {},
		setShowModal = () => {},
		showModal = false,
		userData = {},
		primaryColor = '#E9691D',
		secondaryColor = '#8091A5',
		customMessage,
	} = props;

	const [editUserData, setEditUserData] = useState({});
	const [userDataErrors, setUserDataErrors] = useState({});

	useEffect(() => {
		setEditUserData(userData);
		const tempUserDataErrors = {};

		Object.keys(userData).forEach((dataKey) => {
			tempUserDataErrors[dataKey] = false;
		});

		setUserDataErrors(tempUserDataErrors);
	}, [userData]);

	const closeUserModal = () => {
		const tmpData = { ...userDataErrors };
		Object.keys(tmpData).forEach((dataKey) => {
			tmpData[dataKey] = false;
		});
		setUserDataErrors(tmpData);
		setEditUserData(userData);

		setShowModal(false);
	};

	const saveUserData = () => {
		const tmpData = { ...userDataErrors };
		let hasErrors = false;

		// Check required fields are filled in
		REQUIRED_FIELDS.forEach((reqField) => {
			if (!editUserData[reqField] || editUserData[reqField] === null || editUserData[reqField] === '') {
				tmpData[reqField] = true;
				hasErrors = true;
			}
		});

		setUserDataErrors(tmpData);
		console.log(tmpData);

		if (!hasErrors) updateUserData(editUserData);
	};

	const handleTextChange = (event, key) => {
		const tmpData = { ...editUserData };
		tmpData[key] = event.target.value;
		setEditUserData(tmpData);
	};

	return (
		<StyledDialog
			open={showModal}
			scroll={'paper'}
			disableEscapeKeyDown
			disableBackdropClick
			data-cy={'EditProfile'}
		>
			<DialogTitle sx={{ m: 3, p: 0 }}>
				<Typography
					variant="h3"
					display="inline"
					style={{ fontFamily: 'Montserrat', fontWeight: 700, marginLeft: 20 }}
				>
					Edit Profile Data
				</Typography>
				<IconButton
					aria-label="close"
					onClick={closeUserModal}
					sx={{
						position: 'absolute',
						right: 20,
						top: 14,
						color: (theme) => theme.palette.grey[500],
					}}
				>
					<CloseIcon sx={{ width: 30, height: 30, color: '#1F2020' }} />
				</IconButton>
			</DialogTitle>
			<DialogContent style={{ height: customMessage ? 640 : 612 }}>
				{customMessage && (
					<Typography style={{ fontFamily: 'Montserrat', fontSize: 18, marginLeft: 20 }}>
						{customMessage}
					</Typography>
				)}
				<Typography style={{ fontFamily: 'Montserrat', fontSize: 18, marginLeft: 20 }}>
					Use the form below to edit your profile information
				</Typography>
				<StyledGrid container>
					<Grid container justify="center" item xs={2} sx={{ p: 2, justifyContent: 'center' }}>
						<Badge
							overlap="circular"
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							// badgeContent={
							// 	<SmallAvatar alt="EditImage" size={40} sx={{marginTop: 6, marginLeft: -2}}>
							// 		<AddAPhotoIcon sx={{width: 30, height: 30, color: '#E9691D'}} />
							// 	</SmallAvatar>
							// }
							sx={{ width: 145, height: 145, marginTop: 5 }}
						>
							<Avatar
								src={ProfileDefaultImg}
								alt="profile-pic"
								sx={{ width: 145, height: 145, marginTop: 5 }}
							/>
						</Badge>
					</Grid>
					<Grid item xs={10} sx={{ p: 2 }}>
						<Typography
							style={{ fontFamily: 'Montserrat', fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}
						>
							{editUserData.preferred_name ||
								`${editUserData.first_name || ''} ${editUserData.last_name || ''}`}
						</Typography>
						<Box component="form" autoComplete="off">
							<Stack spacing={2}>
								<Stack direction={'row'} spacing={2}>
									<StyledTextField
										required={REQUIRED_FIELDS.includes('preferred_name')}
										error={userDataErrors['preferred_name']}
										label="Preferred Name"
										variant="outlined"
										value={editUserData.preferred_name || ''}
										onChange={(event) => handleTextChange(event, 'preferred_name')}
										sx={{ width: 340 }}
									/>
								</Stack>
								<Stack direction={'row'} spacing={2}>
									<StyledTextField
										required={REQUIRED_FIELDS.includes('first_name')}
										error={userDataErrors['first_name']}
										label="First Name"
										variant="outlined"
										value={editUserData.first_name || ''}
										onChange={(event) => handleTextChange(event, 'first_name')}
										data-cy="firstName"
									/>
									<StyledTextField
										required={REQUIRED_FIELDS.includes('last_name')}
										error={userDataErrors['last_name']}
										label="Last Name"
										variant="outlined"
										value={editUserData.last_name || ''}
										onChange={(event) => handleTextChange(event, 'last_name')}
										data-cy="lastName"
									/>
								</Stack>
								<Stack direction={'row'} spacing={2}>
									<StyledTextField
										required={REQUIRED_FIELDS.includes('email')}
										error={userDataErrors['email']}
										label="Email"
										variant="outlined"
										value={editUserData.email || ''}
										onChange={(event) => handleTextChange(event, 'email')}
										sx={{ width: 400 }}
										data-cy="email"
									/>
									<StyledTextField
										required={REQUIRED_FIELDS.includes('phone_number')}
										error={userDataErrors['phone_number']}
										label="Phone"
										variant="outlined"
										value={editUserData.phone_number || ''}
										onChange={(event) => handleTextChange(event, 'phone_number')}
										sx={{ width: 400 }}
									/>
								</Stack>
								<Stack direction={'row'} spacing={2}>
									<StyledTextField
										required={REQUIRED_FIELDS.includes('organization')}
										error={userDataErrors['organization']}
										label="Agency/Organization"
										variant="outlined"
										value={editUserData.organization || ''}
										onChange={(event) => handleTextChange(event, 'organization')}
										sx={{ width: 440 }}
									/>
									<StyledTextField
										required={REQUIRED_FIELDS.includes('sub_office')}
										error={userDataErrors['sub_office']}
										label="Sub-Office"
										variant="outlined"
										value={editUserData.sub_office || ''}
										onChange={(event) => handleTextChange(event, 'sub_office')}
										sx={{ width: 440 }}
									/>
								</Stack>
								<Typography
									style={{
										fontFamily: 'Montserrat',
										fontWeight: 'bold',
										fontSize: 14,
										marginBottom: 2,
									}}
								>
									Work Location
								</Typography>
								<Stack direction={'row'} spacing={2}>
									<StyledTextField
										required={REQUIRED_FIELDS.includes('country')}
										error={userDataErrors['country']}
										label="Country"
										variant="outlined"
										value={editUserData.country || ''}
										onChange={(event) => handleTextChange(event, 'country')}
										sx={{ width: 340 }}
									/>
									<StyledTextField
										required={REQUIRED_FIELDS.includes('state')}
										error={userDataErrors['state']}
										label="State"
										variant="outlined"
										value={editUserData.state || ''}
										onChange={(event) => handleTextChange(event, 'state')}
										sx={{ width: 340 }}
									/>
									<StyledTextField
										required={REQUIRED_FIELDS.includes('city')}
										error={userDataErrors['city']}
										label="City"
										variant="outlined"
										value={editUserData.city || ''}
										onChange={(event) => handleTextChange(event, 'city')}
										sx={{ width: 200 }}
									/>
								</Stack>
								<Stack direction={'row'} spacing={2}>
									<StyledTextField
										required={REQUIRED_FIELDS.includes('job_title')}
										error={userDataErrors['job_title']}
										label="Job Title"
										variant="outlined"
										value={editUserData.job_title || ''}
										onChange={(event) => handleTextChange(event, 'job_title')}
										sx={{ width: 490 }}
									/>
								</Stack>
							</Stack>
						</Box>
					</Grid>
				</StyledGrid>
			</DialogContent>
			<DialogActions>
				<StyledOutlinedButton variant="outlined" onClick={closeUserModal} primaryColor={secondaryColor}>
					Cancel
				</StyledOutlinedButton>
				<StyledFilledButton onClick={saveUserData} primaryColor={primaryColor}>
					Save
				</StyledFilledButton>
			</DialogActions>
		</StyledDialog>
	);
});

EditUserProfile.propTypes = {
	updateUserData: PropTypes.func,
	setShowModal: PropTypes.func,
	userData: PropTypes.object,
	showModal: PropTypes.bool,
	primaryColor: PropTypes.string,
	secondaryColor: PropTypes.string,
	customMessage: PropTypes.string,
};

export default EditUserProfile;
