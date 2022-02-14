import React, {useContext, useEffect, useState} from 'react';
import './jbook.css';
import {setState} from '../sharedFunctions';
import SideNavigation from '../components/navigation/SideNavigation';
import {BudgetSearchContext} from '../components/modules/budgetSearch/budgetSearchContext';
import {getQueryVariable} from '../gamechangerUtils';
import JBookAPI from '../components/api/jbook-service-api';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';

const jbookAPI = new JBookAPI();

export const gcColors = {
	buttonColor1: '#131E43',
	buttonColor2: '#E9691D'
};

export const scrollToContentTop = () => {
	document.getElementById('game-changer-content-top').scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
}

const JBookUserProfileSetupPage = (props) => {
	
	const {
		cloneData,
		history
	} = props;

	const context = useContext(BudgetSearchContext);
	const {state, dispatch} = context;

	const [profileLoading, setProfileLoading] = useState(true);

	useEffect(() => {
		if (!state.cloneDataSet) {
			setState(dispatch, {cloneData: cloneData, cloneDataSet: true});
		}
		
		if (!state.historySet) {
			setState(dispatch, {history: history, historySet: true});
		}

	}, [cloneData, state, dispatch, history]);

	useEffect(() => {
		const url = window.location.href;
		const email = getQueryVariable('email', url);
		const permissions = getQueryVariable('permissions', url).split(',');

		jbookAPI.setupUserProfile({email, permissions}).then(data => {
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
