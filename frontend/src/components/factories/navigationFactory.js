// const defaultNavigationHandler = require(`../modules/default/defaultNavigationHandler`);
// const policyNavigationHandler = require(`../modules/policy/policyNavigationHandler`);
// const edaNavigationHandler = require(`../modules/eda/edaNavigationHandler`);
// const globalSearchNavigationHandler = require(`../modules/globalSearch/globalSearchNavigationHandler`);
// const jbookNavigationHandler = require(`../modules/jbook/jbookNavigationHandler`);

// class NavigationFactory {
// 	constructor(module) {
// 		try {
// 			switch (module) {
// 				case 'policy/policyNavigationHandler':
// 					//this.handler = policyNavigationHandler;
// 					this.handler = `../modules/policy/policyNavigationHandler`;
// 					break;
// 				case 'globalSearch/globalSearchNavigationHandler':
// 					//this.handler = globalSearchNavigationHandler;
// 					this.handler = `../modules/globalSearch/globalSearchNavigationHandler`;
// 					break;
// 				case 'eda/edaNavigationHandler':
// 					//this.handler = edaNavigationHandler;
// 					this.handler = `../modules/eda/edaNavigationHandler`;
// 					break;
// 				case 'jbook/jbookNavigationHandler':
// 					//this.handler = jbookNavigationHandler;
// 					this.handler = `../modules/jbook/jbookNavigationHandler`;
// 					break;
// 				default:
// 					//this.handler = defaultNavigationHandler;
// 					this.handler = `../modules/default/defaultNavigationHandler`;
// 					break;
// 			}
// 		} catch (err) {
// 			//this.handler = defaultNavigationHandler;
// 			this.handler = `../modules/default/defaultNavigationHandler`;
// 		}
// 	}
//
// 	async createHandler() {
// 		import(this.handler).then((handler) => {
// 			return handler.default;
// 		});
// 	}
// }
//
// export default NavigationFactory;

import React, { useContext, useEffect, useState } from 'react';
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

const NavigationFactory = (props) => {
	const { state, dispatch } = props;

	const getNavigationComponent = () => {
		switch (state.cloneData.navigation_module) {
			case 'policy/policyNavigationHandler':
				return <PolicyNavigationHandler state={state} dispatch={dispatch} />;
			default:
				return <DefaultNavigationHandler state={state} dispatch={dispatch} />;
		}
	};

	return <>{getNavigationComponent()}</>;
};

NavigationFactory.propTypes = {
	state: PropTypes.shape({
		cloneData: PropTypes.shape({
			navigation_module: PropTypes.string,
		}),
	}),
	dispatch: PropTypes.func,
};

export default NavigationFactory;
