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
		<div style={styles.tabButtonContainer}>
			{viewPanels[currentView]}
			<div style={styles.spacer} />
		</div>
	);
}

const styles = {
	tabContainer: {
		alignItems: 'center',
		marginBottom: '14px',
		height: '600px',
		margin: '0px 4% 0 65px'
	},
	tabButtonContainer: {
		width: '100%',
		padding: '0em 1em',
		alignItems: 'center'
	},
	spacer: {
		flex: '0.375'
	},
}

export default ResultView;
