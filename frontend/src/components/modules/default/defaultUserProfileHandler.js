import React from 'react';
import UserProfile from '../../user/UserProfile';
import GamechangerUserManagementAPI from '../../api/GamechangerUserManagement';

const gameChangerUserAPI = new GamechangerUserManagementAPI();

const DefaultUserProfileHandler = {
	getUserProfilePage: (props) => {

		return (
			<UserProfile
				getUserData={gameChangerUserAPI.getUserProfileData}
				updateUserData={gameChangerUserAPI.updateUserProfileData}
				getAppRelatedUserData={() => {}}
				updateAppRelatedUserData={() => {}}
				displayCustomAppContent={() => {return (<></>)}}
				style={{margin: '20px 40px'}}
				primaryColor={'#1C2D65'}
				secondaryColor={'#8091A5'}
			/>
		);
	},
};

export default DefaultUserProfileHandler;
