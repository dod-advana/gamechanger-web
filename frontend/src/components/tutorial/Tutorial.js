import React from "react";
import {gcOrange} from "../../components/common/gc-colors";
import TutorialOverlay from "advana-tutorial-overlay/dist/TutorialOverlay";
import {setState} from "../../sharedFunctions";
import {initializeTutorial} from "advana-tutorial-overlay/dist/TutorialOverlayHelper";
import {useMountEffect} from "../../gamechangerUtils";

async function initTutorial(dispatch, cloneName) {
	try {
		let nameToUse = '';
		switch (cloneName) {
			case 'gamechanger':
				nameToUse = 'gamechanger'
				break;
			default:
				nameToUse = '';
				break;
		}
		const { componentStepNumbers, tutorialJoyrideSteps } = await initializeTutorial(nameToUse);
		setState(dispatch, {
			componentStepNumbers,
			tutorialJoyrideSteps,
		});
	} catch (err) {
		console.error(err.message);
	}
}

const Tutorial = (props) => {

	const {state, dispatch} = props.context;
	
	useMountEffect(() => {
		if (!sessionStorage.getItem(`${state.cloneData.clone_name}-userVersionChecked`)){
			initTutorial(dispatch, state.cloneData.clone_name)
		}
	});
	
	const resetState = () => {
		dispatch({type: 'RESET_STATE'});
	}
	
	const setStepIndex = (stepIndex) => {
		setState(dispatch, { tutorialStepIndex: stepIndex });
	}
	
	const setShowTutorial = (showTutorial) => {
		setState(dispatch, { showTutorial: showTutorial });
	}
	
	return (
		<TutorialOverlay
			tutorialJoyrideSteps={state.tutorialJoyrideSteps}
			setShowTutorial={setShowTutorial}
			showTutorial={state.showTutorial}
			buttonColor={gcOrange}
			resetPage={resetState}
			stepIndex={state.tutorialStepIndex}
			setStepIndex={setStepIndex}
		/>
	);
}

export default Tutorial;
