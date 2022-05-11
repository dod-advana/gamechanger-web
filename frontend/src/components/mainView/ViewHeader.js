import React from 'react';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';

const DefaultViewHeaderHandler = LoadableVisibility({
	loader: () => import('../modules/default/defaultViewHeaderHandler'),
	loading: () => {
		return (
			<div style={{ width: window.screen.width - 50 }}>
				<LoadingIndicator shadedOverlay={true} />
			</div>
		);
	},
});

const PolicyViewHeaderHandler = LoadableVisibility({
	loader: () => import('../modules/policy/policyViewHeaderHandler'),
	loading: () => {
		return (
			<div style={{ width: window.screen.width - 50 }}>
				<LoadingIndicator shadedOverlay={true} />
			</div>
		);
	},
});

const JbookViewHeaderHandler = LoadableVisibility({
	loader: () => import('../modules/jbook/jbookViewHeaderHandler'),
	loading: () => {
		return (
			<div style={{ width: window.screen.width - 50 }}>
				<LoadingIndicator shadedOverlay={true} />
			</div>
		);
	},
});

const ViewHeader = (props) => {
	const { context } = props;
	const { state, dispatch } = context;

	console.log(props);

	const getViewHeaderComponent = (props) => {
		switch (state.cloneData.view_header_module) {
			case 'policy/policyViewHeaderHandler':
				return <PolicyViewHeaderHandler {...props} />;
			case 'jbook/jbookViewHeaderHandler':
				return <JbookViewHeaderHandler {...props} />;
			default:
				return <DefaultViewHeaderHandler {...props} />;
		}
	};

	return (
		<>
			{getViewHeaderComponent({
				state,
				dispatch,
			})}
		</>
	);
};

export default ViewHeader;
