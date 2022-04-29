import React from 'react';
import PropTypes from 'prop-types';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';

const PolicyNavigationHandler = LoadableVisibility({
	loader: () => import('../modules/policy/policyNavigationHandler'),
	loading: () => {
		return <></>;
	},
});

const DefaultNavigationHandler = LoadableVisibility({
	loader: () => import('../modules/default/defaultNavigationHandler'),
	loading: () => {
		return <></>;
	},
});

const EDANavigationHandler = LoadableVisibility({
	loader: () => import('../modules/eda/edaNavigationHandler'),
	loading: () => {
		return <></>;
	},
});

const GlobalSearchNavigationHandler = LoadableVisibility({
	loader: () => import('../modules/globalSearch/globalSearchNavigationHandler'),
	loading: () => {
		return <></>;
	},
});

const JBookNavigationHandler = LoadableVisibility({
	loader: () => import('../modules/jbook/jbookNavigationHandler'),
	loading: () => {
		return <></>;
	},
});

const SideBarNavigation = (props) => {
	const { context } = props;

	const { state, dispatch } = context;

	const getNavigationComponent = () => {
		switch (state.cloneData.navigation_module) {
			case 'policy/policyNavigationHandler':
				return <PolicyNavigationHandler state={state} dispatch={dispatch} />;
			case 'eda/edaNavigationHandler':
				return <EDANavigationHandler state={state} dispatch={dispatch} />;
			case 'globalSearch/globalSearchNavigationHandler':
				return <GlobalSearchNavigationHandler state={state} dispatch={dispatch} />;
			case 'jbook/jbookNavigationHandler':
				return <JBookNavigationHandler state={state} dispatch={dispatch} />;
			default:
				return <DefaultNavigationHandler state={state} dispatch={dispatch} />;
		}
	};

	return <>{getNavigationComponent()}</>;
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
