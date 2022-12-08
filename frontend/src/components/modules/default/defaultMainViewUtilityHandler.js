import { getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import { setState } from '../../../utils/sharedFunctions';
import { trackEvent } from '../../telemetry/Matomo';

const DefaultMainViewUtilityHandler = {
	handleCategoryTabChange: (props) => {
		const { tabName, state, dispatch } = props;

		trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'CategoryTabChange', tabName);

		if (tabName === 'all') {
			// if sort is relevance descending
			if (state.currentSort === 'Relevance' && state.currentOrder === 'desc') {
				setState(dispatch, {
					activeCategoryTab: tabName,
					resultsPage: 1,
					replaceResults: true,
					infiniteScrollPage: 1,
				});
			} else {
				// if sort isn't relevance, reset
				setState(dispatch, {
					activeCategoryTab: tabName,
					docSearchResults: [],
					resultsPage: 1,
					replaceResults: true,
					infiniteScrollPage: 1,
					currentSort: 'Relevance',
					currentOrder: 'desc',
					docsPagination: true,
				});
			}
		} else if (
			tabName === 'Documents' &&
			(state.resultsPage !== 1 ||
				(state.activeCategoryTab === 'all' &&
					(state.currentSort !== 'Relevance' || state.currentOrder !== 'desc')))
		) {
			// if pagination is wrong, or current sorting doesn't match
			setState(dispatch, {
				activeCategoryTab: tabName,
				resultsPage: 1,
				docSearchResults: [],
				replaceResults: true,
				docsPagination: true,
			});
		} else if (tabName === 'Documents') {
			setState(dispatch, { activeCategoryTab: tabName, replaceResults: false });
		}
		setState(dispatch, { activeCategoryTab: tabName, resultsPage: 1 });
	},
};

export default DefaultMainViewUtilityHandler;
