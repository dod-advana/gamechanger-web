import React, { useEffect, useState, useRef } from 'react';
import './jbook.css';
import { Typography } from '@material-ui/core';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import GamechangerUserManagementAPI from '../components/api/GamechangerUserManagement';

const gameChangerUserAPI = new GamechangerUserManagementAPI();

export const gcColors = {
	buttonColor1: '#131E43',
	buttonColor2: '#E9691D',
};

export const scrollToContentTop = () => {
	document
		.getElementById('game-changer-content-top')
		.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
};

const JBookUserProfileSetupPage = (props) => {
	const { history } = props;
	const [profileLoading, setProfileLoading] = useState(true);

	const hasSetUpUserProfile = useRef(false);
	useEffect(() => {
		if (!hasSetUpUserProfile.current) {
			gameChangerUserAPI.setupUserProfile().then((data) => {
				setProfileLoading(false);
				let newHref = window.location.href;
				newHref = newHref.split('#')[0];
				newHref += '#/jbook/userDashboard';
				window.location.replace(newHref);
			});
			hasSetUpUserProfile.current = true;
		}
	}, [history]);

	return (
		<div className="main-container">
			<>
				<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					<Typography style={{ marginTop: '10%' }}>Providing Permissions...</Typography>
					{profileLoading && (
						<LoadingIndicator
							customColor={'#1C2D64'}
							style={{ width: '50px', height: '50px', margin: 0 }}
						/>
					)}
				</div>
			</>
		</div>
	);
};

export default JBookUserProfileSetupPage;
