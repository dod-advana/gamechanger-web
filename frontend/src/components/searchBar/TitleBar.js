import React from 'react';
import PropTypes from 'prop-types';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';

const DefaultTitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/default/defaultTitleBarHandler'),
	loading: () => {
		return <></>;
	},
});

const AdminTitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/admin/adminTitleBarHandler'),
	loading: () => {
		return <></>;
	},
});

const DetailsTitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/details/detailsTitleBarHandler'),
	loading: () => {
		return <></>;
	},
});

const EDATitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/eda/edaTitleBarHandler'),
	loading: () => {
		return <></>;
	},
});

const PolicyTitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/policy/policyTitleBarHandler'),
	loading: () => {
		return <></>;
	},
});

const GlobalSearchTitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/globalSearch/globalSearchTitleBarHandler'),
	loading: () => {
		return <></>;
	},
});

const JBookSearchTitleBarHandler = LoadableVisibility({
	loader: () => import('../modules/jbook/jbookTitleBarHandler'),
	loading: () => {
		return <></>;
	},
});

const SearchBanner = (props) => {
	const { titleBarModule } = props;

	const getTitleBarComponent = () => {
		switch (titleBarModule) {
			case 'policy/policyTitleBarHandler':
				return <PolicyTitleBarHandler {...props} />;
			case 'eda/edaTitleBarHandler':
				return <EDATitleBarHandler {...props} />;
			case 'details/detailsTitleBarHandler':
				return <DetailsTitleBarHandler {...props} />;
			case 'globalSearch/globalSearchTitleBarHandler':
				return <GlobalSearchTitleBarHandler {...props} />;
			case 'admin/adminTitleBarHandler':
				return <AdminTitleBarHandler {...props} />;
			case 'jbook/jbookTitleBarHandler':
				return <JBookSearchTitleBarHandler {...props} />;
			default:
				return <DefaultTitleBarHandler {...props} />;
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
