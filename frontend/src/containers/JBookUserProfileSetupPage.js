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

const getIsOpen = () => {
	const AGREEMENT_KEY = 'data.mil-consent-agreed';
	const cookieMap = {};
	const cookies = document.cookie.split(';');
	cookies.forEach((cookie) => {
		const splitCookie = cookie.split('=');
		cookieMap[splitCookie[0].trim()] = splitCookie[1];
	});

	console.log(document.cookie);
	if (!Object.keys(cookieMap).includes(AGREEMENT_KEY)) return true;

	try {
		const twoHoursAgo = Date.now() - 1000 * 60 * 60 * 2;
		return new Date(cookieMap[AGREEMENT_KEY]) < twoHoursAgo;
	} catch (err) {
		console.error(err);
		return true;
	}
};

const JBookUserProfileSetupPage = (props) => {
	const { history } = props;
	const [profileLoading, setProfileLoading] = useState(true);
	const [consentClosed, setConsentClosed] = useState(!getIsOpen());
	const hasSetUpUserProfile = useRef(false);

	useEffect(() => {
		if (!hasSetUpUserProfile.current) {
			gameChangerUserAPI.setupUserProfile().then((data) => {
				setProfileLoading(false);
			});
			hasSetUpUserProfile.current = true;
		}
	}, [history]);

	useEffect(() => {
		let interval;

		if (!consentClosed) {
			interval = setInterval(() => {
				let isOpen = getIsOpen();
				console.log('getIsOpen:', isOpen);
				setConsentClosed(!isOpen);
			}, 1000);
		} else {
			clearInterval(interval);
		}
		return () => clearInterval(interval);
	}, [consentClosed]);

	useEffect(() => {
		console.log(profileLoading, consentClosed);
		if (!profileLoading && consentClosed) {
			let newHref = window.location.href;
			newHref = newHref.split('#')[0];
			newHref += '#/jbook/userDashboard';
			window.location.replace(newHref);
		}
	}, [profileLoading, consentClosed]);

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
