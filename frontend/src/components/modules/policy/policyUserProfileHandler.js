import React from 'react';
import UserProfile from '../../user/UserProfile';
import GamechangerUserManagementAPI from '../../api/GamechangerUserManagement';
import {
	checkUserInfo,
	getUserData,
	handleClearFavoriteSearchNotification,
	handleDeleteFavoriteSearch,
	handleSaveFavoriteDocument,
	handleSaveFavoriteOrganization,
	handleSaveFavoriteSearchHistory,
	handleSaveFavoriteTopic,
} from '../../../utils/sharedFunctions';
import GCUserDashboard from '../../user/GCUserDashboard';

const gameChangerUserAPI = new GamechangerUserManagementAPI();

const getGCUserDashboard = (props) => {
	const { state, dispatch } = props;
	return (
		<GCUserDashboard
			state={state}
			userData={state.userData}
			updateUserData={() => getUserData(dispatch)}
			handleSaveFavoriteDocument={(document) => handleSaveFavoriteDocument(document, state, dispatch)}
			handleDeleteSearch={(search) => handleDeleteFavoriteSearch(search, dispatch)}
			handleClearFavoriteSearchNotification={(search) => handleClearFavoriteSearchNotification(search, dispatch)}
			saveFavoriteSearch={(favoriteName, favoriteSummary, favorite, tinyUrl, searchText, count) =>
				handleSaveFavoriteSearchHistory(
					favoriteName,
					favoriteSummary,
					favorite,
					tinyUrl,
					searchText,
					count,
					dispatch
				)
			}
			handleFavoriteTopic={({ topic_name, topic_summary, favorite }) =>
				handleSaveFavoriteTopic(topic_name, topic_summary, favorite, dispatch)
			}
			handleFavoriteOrganization={({ organization_name, organization_summary, favorite }) =>
				handleSaveFavoriteOrganization(organization_name, organization_summary, favorite, dispatch)
			}
			cloneData={state.cloneData}
			checkUserInfo={() => {
				return checkUserInfo(state, dispatch);
			}}
			dispatch={dispatch}
		/>
	);
};

const PolicyUserProfileHandler = {
	getUserProfilePage: (props) => {
		const { state, dispatch } = props;

		return (
			<UserProfile
				getUserData={gameChangerUserAPI.getUserProfileData}
				updateUserData={gameChangerUserAPI.updateUserProfileData}
				getAppRelatedUserData={() => {}}
				updateAppRelatedUserData={() => {}}
				displayCustomAppContent={() => getGCUserDashboard({ state, dispatch })}
				style={{ width: '100%', padding: '15px 22px 15px 30px', minHeight: 'calc(100vh - 245px)' }}
				primaryColor={'#1C2D65'}
				secondaryColor={'#8091A5'}
			/>
		);
	},
};

export default PolicyUserProfileHandler;
