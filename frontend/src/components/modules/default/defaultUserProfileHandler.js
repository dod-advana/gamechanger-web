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
				displayCustomAppContent={() => {
					return <></>;
				}}
				style={{ width: '100%', padding: '15px 22px 15px 30px', minHeight: 'calc(100vh - 245px)' }}
				primaryColor={'#1C2D65'}
				secondaryColor={'#8091A5'}
			/>
		);
	},
};

export default DefaultUserProfileHandler;
