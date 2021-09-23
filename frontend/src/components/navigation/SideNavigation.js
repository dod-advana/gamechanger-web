import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import SlideOutMenuContent from '@dod-advana/advana-side-nav/dist/SlideOutMenuContent';
import { SlideOutToolContext } from '@dod-advana/advana-side-nav/dist/SlideOutMenuContext';
import NavigationFactory from '../factories/navigationFactory';

const SideBarNavigation = (props) => {
	const { context } = props;

	const { state, dispatch } = context;

	const { setToolState, unsetTool } = useContext(SlideOutToolContext);

	const [navigationHandler, setNavigationHandler] = useState();
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		// Create the factory
		if (state.cloneDataSet && !loaded) {
			const factory = new NavigationFactory(state.cloneData.navigation_module);
			const handler = factory.createHandler();
			setNavigationHandler(handler);
			setLoaded(true);
		}
	}, [state, loaded]);

	useEffect(() => {
		// Update the document title using the browser API

		if (navigationHandler) {
			setToolState(navigationHandler.getToolState(state));
		}

		return () => {
			unsetTool();
		};
	}, [unsetTool, setToolState, state, navigationHandler]);

	return (
		<>
			{loaded ? (
				<>
					<SlideOutMenuContent type="closed">
						{navigationHandler.generateClosedContentArea(state, dispatch)}
					</SlideOutMenuContent>
					<SlideOutMenuContent type="open">
						{navigationHandler.generateOpenedContentArea(state, dispatch)}
					</SlideOutMenuContent>
				</>
			) : (
				<></>
			)}
		</>
	);
};

SideBarNavigation.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			cloneDataSet: PropTypes.bool,
			cloneData: PropTypes.shape({
				navigation_module: PropTypes.string,
			}),
		}),
		dispatch: PropTypes.func,
	}),
};

export default SideBarNavigation;
