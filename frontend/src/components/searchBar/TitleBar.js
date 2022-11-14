import React from 'react';
import PropTypes from 'prop-types';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';

const DefaultTitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/default/defaultTitleBarHandler'),
	loading: () => {
		return <div style={{ minHeight: 80, width: '100%' }} />;
	},
});

const AdminTitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/admin/adminTitleBarHandler'),
	loading: () => {
		return <div style={{ minHeight: 80, width: '100%' }} />;
	},
});

const DetailsTitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/details/detailsTitleBarHandler'),
	loading: () => {
		return <div style={{ minHeight: 80, width: '100%' }} />;
	},
});

const EDATitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/eda/edaTitleBarHandler'),
	loading: () => {
		return <div style={{ minHeight: 80, width: '100%' }} />;
	},
});

const PolicyTitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/policy/policyTitleBarHandler'),
	loading: () => {
		return <div style={{ minHeight: 80, width: '100%' }} />;
	},
});

const GlobalSearchTitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/globalSearch/globalSearchTitleBarHandler'),
	loading: () => {
		return <div style={{ minHeight: 80, width: '100%' }} />;
	},
});

const JBookSearchTitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/jbook/jbookTitleBarHandler'),
	loading: () => {
		return <div style={{ minHeight: 80, width: '100%' }} />;
	},
});

const SearchBanner = (props) => {
	const { titleBarModule } = props;

	const newProps = {
		...props,
		openPillRight: '68px',
		openPillTop: '60px',
		closeButtonRight: '37px',
		closeButtonTop: '160px',
	};

	const getTitleBarComponent = () => {
		switch (titleBarModule) {
			case 'policy/policyTitleBarHandler':
				return <PolicyTitleBarHandler {...newProps} />;
			case 'eda/edaTitleBarHandler':
				return <EDATitleBarHandler {...newProps} />;
			case 'details/detailsTitleBarHandler':
				return <DetailsTitleBarHandler {...newProps} />;
			case 'globalSearch/globalSearchTitleBarHandler':
				return <GlobalSearchTitleBarHandler {...newProps} />;
			case 'admin/adminTitleBarHandler':
				return <AdminTitleBarHandler {...newProps} />;
			case 'jbook/jbookTitleBarHandler':
				return <JBookSearchTitleBarHandler {...newProps} />;
			default:
				return <DefaultTitleBarHandler {...newProps} />;
		}
	};

	return <>{getTitleBarComponent()}</>;
};

SearchBanner.propTypes = {
	style: PropTypes.objectOf(PropTypes.string),
	children: PropTypes.element,
	onTitleClick: PropTypes.func,
	componentStepNumbers: PropTypes.objectOf(PropTypes.number),
	jupiter: PropTypes.bool,
	cloneData: PropTypes.object,
	detailsType: PropTypes.string,
	titleBarModule: PropTypes.string,
	rawSearchResults: PropTypes.array,
	selectedCategories: PropTypes.objectOf(PropTypes.bool),
	categoryMetadata: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number)),
	activeCategoryTab: PropTypes.string,
	setActiveCategoryTab: PropTypes.func,
	pageDisplayed: PropTypes.string,
	dispatch: PropTypes.func,
};

export default SearchBanner;
