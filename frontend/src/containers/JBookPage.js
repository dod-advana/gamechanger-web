import React, { useContext, useEffect, useState } from 'react';
import './jbook.css';
import MainView from '../components/mainView/MainView';
import { setState } from '../sharedFunctions';
import SideNavigation from '../components/navigation/SideNavigation';
import Alerts from '../components/notifications/Alerts';
import Notifications from '../components/notifications/Notifications';
import GCErrorSnackbar from '../components/common/GCErrorSnackbar';
import Tutorial from '../components/tutorial/Tutorial';
import SearchBar from '../components/searchBar/SearchBar';
import { Snackbar } from '@material-ui/core';
import { JBookContext } from '../components/modules/jbook/JBookContext';
import 'react-table/react-table.css';
import EditUserProfile from '../components/user/EditUserProfile';
import JBookAPI from '../components/api/jbook-service-api';

const jbookAPI = new JBookAPI();

export const gcColors = {
	buttonColor1: '#131E43',
	buttonColor2: '#E9691D'
};

export const scrollToContentTop = () => {
	document.getElementById('game-changer-content-top').scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
}

const CONSENT_KEY = 'data.mil-consent-agreed';

const getConsentIsOpen = () => {
	let lastAgreement = localStorage.getItem(CONSENT_KEY);
	if (!lastAgreement)
		return true;

	try {
		const twoHoursAgo = Date.now() - (1000 * 60 * 60 * 2);
		return new Date(lastAgreement) < twoHoursAgo;

	} catch (err) {
		console.error(err);
		return true;
	}
};

const JBookPage = (props) => {

	const {
		cloneData,
		history,
		jupiter
	} = props;

	const context = useContext(JBookContext);
	const { state, dispatch } = context;

	const [showEditUserModal, setShowEditUserModal] = useState(false);

	useEffect(() => {
		if (!state.cloneDataSet) {
			setState(dispatch, { cloneData: cloneData, cloneDataSet: true });
		}

		if (!state.historySet) {
			setState(dispatch, { history: history, historySet: true });
		}

		if (getConsentIsOpen()) {
			const timer = setInterval(() => {
				if (!getConsentIsOpen()) {
					setState(dispatch, { welcomeModalClosed: true, consentModalClosed: true });
					clearInterval(timer);
				}
			}, 2000)
		} else if (!getConsentIsOpen() !== state.consentModalClosed) {
			setState(dispatch, { consentModalClosed: true });
		}

		if (!state.userDataSet) {
			jbookAPI.getUserProfileData().then(data => {
				setState(dispatch, { userData: data.data, userDataSet: true });
			})
		}

		if (state.userData && (!state.userData.email || state.userData.email === '' || state.userData.email === null)) {
			if (state.consentModalClosed && state.welcomeModalClosed) {
				setShowEditUserModal(true);
			}
		}

	}, [cloneData, state, dispatch, history]);

	const saveUserData = async (data) => {
		await jbookAPI.updateUserProfileData({ userData: data });
		setShowEditUserModal(false);
	}

	return (
		<div className="main-container">
			{state.cloneDataSet &&
				<>
					{/* Side Navigation */}
					<SideNavigation context={context} />

					{/* Alerts */}
					<Alerts context={context} />

					{/* Notifications */}
					<Notifications context={context} />

					{/* Tutorial Overlay */}
					{cloneData.show_tutorial && <Tutorial context={context} />}

					{/* Search Banner */}
					{state.cloneDataSet && <SearchBar context={context} jupiter={jupiter} />}

					{/* Main View */}
					{state.historySet && <MainView context={context} />}

					{/* Snack BAr Messages */}
					<div>
						<Snackbar
							style={{ marginTop: 20 }}
							anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
							open={state.showSnackbar}
							autoHideDuration={3000}
							onClose={() => setState(dispatch, { showSnackbar: false })}
							message={state.snackBarMsg}
						/>
					</div>

					<GCErrorSnackbar
						open={state.showBackendError}
						message={state.backendErrorMsg}
						onClose={() => setState(dispatch, { showBackendError: false })}
					/>
				</>
			}

			<EditUserProfile
				setShowModal={setShowEditUserModal}
				showModal={showEditUserModal}
				userData={state.userData}
				updateUserData={saveUserData}
				primaryColor={'#1C2D65'}
				secondaryColor={'#8091A5'}
				customMessage={'It looks like the required fields for your profile have not been filled in. Please review the data and edit as needed'}
			/>
		</div>
	);

};

export default JBookPage;
