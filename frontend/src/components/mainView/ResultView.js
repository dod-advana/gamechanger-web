import React, {useEffect, useState} from "react";
import {
	useMountEffect
} from "../../gamechangerUtils";
import { setState } from "../../sharedFunctions";

const ResultView = (props) => {
	
	const {context, viewPanels = {}} = props;

	const {state, dispatch} = context;
	
	const [currentView, setCurrentView] = useState('Card');
	
	useMountEffect(() => {
		setCurrentView(viewPanels[currentView]);
		setState(dispatch, {currentViewName: currentView});
	})
	
	useEffect(() => {
		setCurrentView(state.currentViewName);
	}, [state.currentViewName]);
	
	return (
		<>
			{viewPanels[currentView]}
		</>
	);
}

export default ResultView;
