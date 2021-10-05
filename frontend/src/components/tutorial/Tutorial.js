import React from 'react';
import PropTypes from 'prop-types';
import { gcOrange } from '../../components/common/gc-colors';
import TutorialOverlay from '@dod-advana/advana-tutorial-overlay/dist/TutorialOverlay';
import { setState } from '../../utils/sharedFunctions';
import { initializeTutorial } from '@dod-advana/advana-tutorial-overlay/dist/TutorialOverlayHelper';
import { useMountEffect } from '../../utils/gamechangerUtils';

async function initTutorial(dispatch, cloneName) {
	try {
		let nameToUse = '';
		switch (cloneName) {
			case 'gamechanger':
				nameToUse = 'gamechanger';
				break;
			default:
				nameToUse = '';
				break;
		}
		const { componentStepNumbers, tutorialJoyrideSteps } =
			await initializeTutorial(nameToUse);
		setState(dispatch, {
			componentStepNumbers,
			tutorialJoyrideSteps,
		});
	} catch (err) {
		console.error(err.message);
	}
}

const Tutorial = (props) => {
	const { state, dispatch } = props.context;

	useMountEffect(() => {
		if (
			!sessionStorage.getItem(
				`${state.cloneData.clone_name}-userVersionChecked`
			)
		) {
			initTutorial(dispatch, state.cloneData.clone_name);
		}
	});

	const resetState = () => {
		dispatch({ type: 'RESET_STATE' });
	};

	const setStepIndex = (stepIndex) => {
		setState(dispatch, { tutorialStepIndex: stepIndex });
	};

	const setShowTutorial = (showTutorial) => {
		setState(dispatch, { showTutorial: showTutorial });
	};

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
};

Tutorial.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			cloneData: PropTypes.shape({
				clone_name: PropTypes.string,
			}),
			tutorialJoyrideSteps: PropTypes.arrayOf(PropTypes.object),
			showTutorial: PropTypes.bool,
			tutorialStepIndex: PropTypes.number,
		}),
	}),
};

export default Tutorial;
