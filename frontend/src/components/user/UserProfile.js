import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, FormControl, Grid, Input, InputAdornment, InputLabel, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { styled as muiStyled } from '@mui/material/styles';
import ProfileDefaultImg from '../../images/logos/account_circle_black_24dp.png';
import makeStyles from '@material-ui/core/styles/makeStyles';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import { Button } from '@mui/material';
import EditUserProfile from './EditUserProfile';
import { convertHexToRgbA } from '../../utils/gamechangerUtils';

const StyledTopDescription = styled.div`
	font-family: Montserrat;
	background: ${'#FFFFFF'};
	width: 100%;
	border-radius: 6px;

	& .description-header {
		color: ${'#212121'};
		font-size: 18px;
		font-family: Montserrat-SemiBold;
		padding: 10px 10px 0 10px;
	}

	& .description-text {
		color: ${'#212121'};
		font-size: 14px;
		padding: 0 10px 10px 10px;
	}
`;

const StyledUserProfileDataDiv = styled.div`
	background: ${'#FFFFFF'};
	border-radius: 6px;
	box-shadow: 0px 3px 6px ${'#00000029'};
	width: 100%;
	height: 100%;
	
	& .user-picture {
		padding-top: 20px;
	
		& .user-name {
			font-family: Montserrat;
			font-weight: bold;
			font-size: 24px;
			color: ${'#000000DE'}
			margin-top: 20px;
		}
	}
	
	& .user-data {
		margin-left: 30px;
	}
	
	& .user-edit-button {
		margin-bottom: 20px;
	}
	
	.input-field {
		margin-bottom: 12px;
	}
`;

const StyledCustomAppDataDiv = styled.div`
	background: ${'#FFFFFF'};
	border-radius: 6px;
	box-shadow: 0px 3px 6px ${'#00000029'};
	width: 100%;
`;

const UserEditButton = muiStyled(Button)(
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

const useStyles = makeStyles((theme) => ({
	bigAvatar: {
		width: 145,
		height: 145,
	},
	inputLabel: {
		fontFamily: 'Montserrat',
		fontSize: '18px',
		color: '#000000DD',
	},
	inputBox: {
		fontFamily: 'Montserrat',
		fontSize: '20px',
		color: '#000000DD !important',
		'&&&:before': {
			borderBottom: 'none',
		},
		'&&:after': {
			borderBottom: 'none',
		},
	},
}));

const UserProfile = React.memo((props) => {
	const {
		getUserData = async () => {},
		updateUserData = async () => {},
		// getAppRelatedUserData = () => {return {}},
		// updateAppRelatedUserData = () => {},
		displayCustomAppContent = () => {
			return <></>;
		},
		style = {},
		primaryColor = '#E9691D',
		secondaryColor = '#8091A5',
	} = props;

	const classes = useStyles();

	const [userData, setUserData] = useState({});
	const [showEditUserModal, setShowEditUserModal] = useState(false);

	useEffect(() => {
		getUserData().then((data) => {
			setUserData(data.data);
		});
	}, [getUserData]);

	useEffect(() => {}, [userData]);

	const refreshUserData = async () => {
		const { data } = await getUserData();
		setUserData(data);
	};

	const saveUserData = async (data) => {
		await updateUserData({ userData: data });
		setShowEditUserModal(false);
		refreshUserData();
	};

	const renderUserData = () => {
		return (
			<>
				<FormControl className={'input-field'}>
					<InputLabel shrink htmlFor="name-input" className={classes.inputLabel}>
						Name
					</InputLabel>
					<Input
						id={'name-input'}
						className={classes.inputBox}
						startAdornment={
							<InputAdornment position="start">
								<PersonIcon fontSize="large" />
							</InputAdornment>
						}
						value={`${userData.first_name || ''} ${userData.last_name || ''}`}
						disabled={true}
					/>
				</FormControl>
				<FormControl className={'input-field'}>
					<InputLabel shrink htmlFor="job-title-input" className={classes.inputLabel}>
						Job Title
					</InputLabel>
					<Input
						id={'job-title-input'}
						className={classes.inputBox}
						startAdornment={
							<InputAdornment position="start">
								<WorkIcon fontSize="large" />
							</InputAdornment>
						}
						value={userData.job_title || ''}
						disabled={true}
					/>
				</FormControl>
				<FormControl className={'input-field'}>
					<InputLabel shrink htmlFor="email-address-input" className={classes.inputLabel}>
						Email Address
					</InputLabel>
					<Input
						id={'email-address-input'}
						className={classes.inputBox}
						startAdornment={
							<InputAdornment position="start">
								<EmailIcon fontSize="large" />
							</InputAdornment>
						}
						value={userData.email || ''}
						disabled={true}
					/>
				</FormControl>
				<FormControl className={'input-field'}>
					<InputLabel shrink htmlFor="phone-number-input" className={classes.inputLabel}>
						Phone Number
					</InputLabel>
					<Input
						id={'phone-number-input'}
						className={classes.inputBox}
						startAdornment={
							<InputAdornment position="start">
								<PhoneIcon fontSize="large" />
							</InputAdornment>
						}
						value={userData.phone_number || ''}
						disabled={true}
					/>
				</FormControl>
				<FormControl className={'input-field'}>
					<InputLabel shrink htmlFor="organization-input" className={classes.inputLabel}>
						Organization
					</InputLabel>
					<Input
						id={'organization-input'}
						className={classes.inputBox}
						startAdornment={
							<InputAdornment position="start">
								<BadgeIcon fontSize="large" />
							</InputAdornment>
						}
						value={userData.organization || ''}
						disabled={true}
					/>
					{userData.sub_office && userData.sub_office !== '' && (
						<Input
							id={'sub-office-input'}
							className={classes.inputBox}
							value={userData.sub_office || ''}
							disabled={true}
							style={{ marginLeft: 30 }}
						/>
					)}
				</FormControl>
				<FormControl className={'input-field'}>
					<InputLabel shrink htmlFor="work-location-input" className={classes.inputLabel}>
						Work Location
					</InputLabel>
					<Input
						id={'work-location-input'}
						className={classes.inputBox}
						startAdornment={
							<InputAdornment position="start">
								<LocationOnIcon fontSize="large" />
							</InputAdornment>
						}
						value={`${userData.country || ''}${userData.state ? `, ${userData.state}` : ''}${
							userData.city ? `, ${userData.city}` : ''
						}`}
						disabled={true}
					/>
				</FormControl>
			</>
		);
	};

	return (
		<div style={style}>
			<Grid container spacing={3}>
				<Grid container item xs={12} style={{ paddingRight: 15 }}>
					<StyledTopDescription>
						<Typography className={'description-header'}>User Profile</Typography>
						<Typography className={'description-text'}>
							This is the user profile page, use this page to edit your information and view app specific
							items or tasks.
						</Typography>
					</StyledTopDescription>
				</Grid>
				<Grid container item xs={12} spacing={3}>
					<Grid container item xs={3} justify="center" alignItems="center">
						<StyledUserProfileDataDiv>
							<Grid
								direction={'column'}
								container
								justify="center"
								alignItems="center"
								className={'user-picture'}
							>
								<Avatar src={ProfileDefaultImg} alt="profile-pic" className={classes.bigAvatar} />
								<Typography className={'user-name'}>
									{userData.preferred_name ||
										`${userData.first_name || ''} ${userData.last_name || ''}`}
								</Typography>
							</Grid>
							<Grid direction={'column'} container className={'user-data'}>
								{renderUserData()}
							</Grid>
							<div className={'user-tags'}></div>
							<Grid
								direction={'column'}
								container
								justify="center"
								alignItems="center"
								className={'user-edit-button'}
							>
								<UserEditButton
									variant="outlined"
									startIcon={<EditIcon />}
									onClick={() => {
										setShowEditUserModal(true);
									}}
									primaryColor={primaryColor}
								>
									Edit Profile
								</UserEditButton>
							</Grid>
						</StyledUserProfileDataDiv>
					</Grid>
					<Grid container item xs={9} style={{ paddingRight: 0 }}>
						<StyledCustomAppDataDiv>{displayCustomAppContent()}</StyledCustomAppDataDiv>
					</Grid>
				</Grid>
			</Grid>

			<EditUserProfile
				setShowModal={setShowEditUserModal}
				showModal={showEditUserModal}
				userData={userData}
				updateUserData={saveUserData}
				primaryColor={primaryColor}
				secondaryColor={secondaryColor}
			/>
		</div>
	);
});

UserProfile.propTypes = {
	getUserData: PropTypes.func,
	updateUserData: PropTypes.func,
	getAppRelatedUserData: PropTypes.func,
	updateAppRelatedUserData: PropTypes.func,
	displayCustomAppRelatedContent: PropTypes.func,
	style: PropTypes.object,
	primaryColor: PropTypes.string,
	secondaryColor: PropTypes.string,
};

export default UserProfile;
