import { setState } from '../../../utils/sharedFunctions';

const GlobalSearchMainViewUtilityHandler = {
	handleCategoryTabChange: (props) => {
		const { tabName, dispatch } = props;

		setState(dispatch, { activeCategoryTab: tabName, resultsPage: 1 });
	},
};

export default GlobalSearchMainViewUtilityHandler;
