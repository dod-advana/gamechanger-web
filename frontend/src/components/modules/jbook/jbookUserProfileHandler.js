import React from 'react';
import UserProfile from '../../user/UserProfile';
import GamechangerUserManagementAPI from '../../api/GamechangerUserManagement';
import JBookUserDashboard from './userProfile/jbookUserDashboard';

const gameChangerUserAPI = new GamechangerUserManagementAPI();

const displayUserRelatedItems = () => {

	return (
		<JBookUserDashboard />
	);
};

const JBookUserProfileHandler = {
	getUserProfilePage: (props) => {

		return (
			<UserProfile
				getUserData={gameChangerUserAPI.getUserProfileData}
				updateUserData={gameChangerUserAPI.updateUserProfileData}
				getAppRelatedUserData={() => {}}
				updateAppRelatedUserData={() => {}}
				displayCustomAppContent={displayUserRelatedItems}
				style={{width: '100%', padding: '15px 22px 15px 30px', minHeight: 'calc(100vh - 245px)'}}
				primaryColor={'#1C2D65'}
				secondaryColor={'#8091A5'}
			/>
		);
	},
};

export default JBookUserProfileHandler;
