import React, { useContext, useEffect, useState } from 'react';
import './jbook.css';
import { setState } from '../utils/sharedFunctions';
import SideNavigation from '../components/navigation/SideNavigation';
import { JBookContext } from '../components/modules/jbook/JBookContext';
import { getQueryVariable } from '../utils/gamechangerUtils';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import GamechangerUserManagementAPI from '../components/api/GamechangerUserManagement';

const gameChangerUserAPI = new GamechangerUserManagementAPI();

export const gcColors = {
	buttonColor1: '#131E43',
	buttonColor2: '#E9691D'
};

export const scrollToContentTop = () => {
	document.getElementById('game-changer-content-top').scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
};

const JBookUserProfileSetupPage = (props) => {

	const {
		cloneData,
		history
	} = props;

	const context = useContext(JBookContext);
	const { state, dispatch } = context;

	const [profileLoading, setProfileLoading] = useState(true);

	useEffect(() => {
		if (!state.cloneDataSet) {
			setState(dispatch, { cloneData: cloneData, cloneDataSet: true });
		}

		if (!state.historySet) {
			setState(dispatch, { history: history, historySet: true });
		}

	}, [cloneData, state, dispatch, history]);

	useEffect(() => {
		const url = window.location.href;
		const email = getQueryVariable('email', url);
		const permissions = getQueryVariable('permissions', url).split(',');

		gameChangerUserAPI.setupUserProfile({ email, permissions }).then(data => {
			setProfileLoading(false);
			history.push('/summary');
		});

	}, []);

	return (
		<div className="main-container">
			{state.cloneDataSet &&
				<>
					{/* Side Navigation */}
					<SideNavigation context={context} />

					{profileLoading && <LoadingIndicator customColor={'#1C2D64'} style={{ width: '50px', height: '50px' }} />}
				</>
			}
		</div>
	);

};

export default JBookUserProfileSetupPage;
