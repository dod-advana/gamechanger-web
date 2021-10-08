import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMountEffect } from '../../utils/gamechangerUtils';
import { setState } from '../../utils/sharedFunctions';

const ResultView = (props) => {
	const { context, viewPanels = {} } = props;

	const { state, dispatch } = context;

	const [currentView, setCurrentView] = useState('Card');

	useMountEffect(() => {
		setCurrentView(viewPanels[currentView]);
		setState(dispatch, { currentViewName: currentView });
	});

	useEffect(() => {
		setCurrentView(state.currentViewName);
	}, [state.currentViewName]);

	return <>{viewPanels[currentView]}</>;
};

ResultView.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			currentViewName: PropTypes.string,
		}),
		dispatch: PropTypes.func,
	}),
	viewPanels: PropTypes.objectOf(PropTypes.element).isRequired,
};

export default ResultView;
