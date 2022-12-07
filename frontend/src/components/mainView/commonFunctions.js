import React from 'react';
import { setState } from '../../utils/sharedFunctions';
import { trackEvent } from '../telemetry/Matomo';
import { makeCustomDimensions } from '../telemetry/utils/customDimensions';
import { getTrackingNameForFactory } from '../../utils/gamechangerUtils';
import { DidYouMean } from '../searchBar/SearchBarStyledComponents';
import MagellanTrendingLinkList from '../common/MagellanTrendingLinkList';
import { styles } from './commonStyles';
import UserProfile from '../user/UserProfile';

export const handleDidYouMeanClicked = (didYouMean, state, dispatch) => {
	trackEvent(
		getTrackingNameForFactory(state.cloneData.clone_name),
		'SuggestionSelected',
		'DidYouMean',
		null,
		makeCustomDimensions(didYouMean)
	);
	setState(dispatch, { searchText: didYouMean, runSearch: true });
};

export const renderHideTabs = (props) => {
	const { state, dispatch, searchHandler } = props;
	const { componentStepNumbers, cloneData, resetSettingsSwitch, didYouMean, loading, prevSearchText } = state;
	const showDidYouMean = didYouMean && !loading;
	const latestLinks = localStorage.getItem(`recent${cloneData.clone_name}Searches`) || '[]';
	const trendingStorage = localStorage.getItem(`trending${cloneData.clone_name}Searches`) || '[]';
	let trendingLinks = [];
	if (trendingStorage) {
		JSON.parse(trendingStorage).forEach((search) => {
			if (search.search) {
				trendingLinks.push(search.search.replaceAll('&#039;', '"'));
			}
		});
	}

	if (prevSearchText) {
		if (!resetSettingsSwitch) {
			dispatch({ type: 'RESET_SEARCH_SETTINGS' });
			setState(dispatch, {
				resetSettingsSwitch: true,
				showSnackbar: true,
				snackBarMsg: 'Search settings reset',
			});
			if (searchHandler) searchHandler.setSearchURL(state);
		}
	}

	const handleLinkListItemClick = (searchText) => {
		trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'TrendingSearchSelected', searchText);
		setState(dispatch, {
			searchText,
			autoCompleteItems: [],
			metricsCounted: false,
			runSearch: true,
		});
	};

	return (
		<div style={{ marginTop: '40px' }}>
			{prevSearchText && (
				<div style={{ margin: '10px auto', width: '67%' }}>
					<div style={styles.resultsCount}>
						<p style={{ fontWeight: 'normal', display: 'inline' }}>
							Looks like we don't have any matches for{' '}
						</p>
						"{prevSearchText}"
					</div>
				</div>
			)}
			{showDidYouMean && (
				<div
					style={{
						margin: '10px auto',
						fontSize: '25px',
						width: '67%',
						paddingLeft: 'auto',
					}}
				>
					Did you mean{' '}
					<DidYouMean onClick={() => handleDidYouMeanClicked(didYouMean, state, dispatch)}>
						{didYouMean}
					</DidYouMean>
					?
				</div>
			)}
			{cloneData.clone_name === 'gamechanger' && (
				<div style={{ margin: '10px auto', width: '67%' }}>
					<div className={`tutorial-step-${componentStepNumbers['Trending Searches']}`}>
						<MagellanTrendingLinkList
							onLinkClick={handleLinkListItemClick}
							links={trendingLinks}
							title="Trending Searches This Week"
							padding={10}
						/>
					</div>
				</div>
			)}
			{cloneData.clone_name !== 'gamechanger' && (
				<div style={{ margin: '10px auto', width: '67%' }}>
					<div className={`tutorial-step-${componentStepNumbers['Recent Searches']}`}>
						<MagellanTrendingLinkList
							onLinkClick={handleLinkListItemClick}
							links={JSON.parse(latestLinks)}
							title="Recent Searches"
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export const getAboutUs = (props) => {
	return <></>;
};

export const getUserProfilePage = (displayUserRelatedItems, gameChangerUserAPI, primaryColor, secondaryColor) => {
	return (
		<UserProfile
			getUserData={gameChangerUserAPI.getUserProfileData}
			updateUserData={gameChangerUserAPI.updateUserProfileData}
			getAppRelatedUserData={() => {}}
			updateAppRelatedUserData={() => {}}
			displayCustomAppContent={displayUserRelatedItems}
			style={{
				width: '100%',
				padding: '15px 22px 15px 30px',
				marginBottom: '-6px',
				minHeight: 'calc(100vh - 245px)',
			}}
			primaryColor={primaryColor || '#1C2D65'}
			secondaryColor={secondaryColor || '#8091A5'}
		/>
	);
};
