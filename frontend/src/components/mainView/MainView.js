import React, { useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { setState, getUserData } from '../../utils/sharedFunctions';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';
import GameChangerAPI from '../api/gameChanger-service-api';
import GamechangerUserManagementAPI from '../api/GamechangerUserManagement';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';

const gameChangerAPI = new GameChangerAPI();
const gameChangerUserAPI = new GamechangerUserManagementAPI();

let cancelToken = axios.CancelToken.source();

const DefaultMainViewHandler = LoadableVisibility({
	loader: () => import('../modules/default/defaultMainViewHandler'),
	loading: () => {
		return (
			<div style={{ width: window.screen.width - 50 }}>
				<LoadingIndicator shadedOverlay={true} />
			</div>
		);
	},
});

const EDAMainViewHandler = LoadableVisibility({
	loader: () => import('../modules/eda/edaMainViewHandler'),
	loading: () => {
		return (
			<div style={{ width: window.screen.width - 50 }}>
				<LoadingIndicator shadedOverlay={true} />
			</div>
		);
	},
});

const GlobalSearchMainViewHandler = LoadableVisibility({
	loader: () => import('../modules/globalSearch/globalSearchMainViewHandler'),
	loading: () => {
		return (
			<div style={{ width: window.screen.width - 50 }}>
				<LoadingIndicator shadedOverlay={true} />
			</div>
		);
	},
});

const JBookMainViewHandler = LoadableVisibility({
	loader: () => import('../modules/jbook/jbookMainViewHandler'),
	loading: () => {
		return (
			<div style={{ width: window.screen.width - 50 }}>
				<LoadingIndicator shadedOverlay={true} />
			</div>
		);
	},
});

const PolicyMainViewHandler = LoadableVisibility({
	loader: () => import('../modules/policy/policyMainViewHandler'),
	loading: () => {
		return (
			<div style={{ width: window.screen.width - 50 }}>
				<LoadingIndicator shadedOverlay={true} />
			</div>
		);
	},
});

const MainView = (props) => {
	const { context } = props;

	const { state, dispatch } = context;

	useEffect(() => {
		if (state.cloneDataSet && !state.userDataSet) {
			getUserData(dispatch);
		}
	}, [dispatch, state.cloneData, state.cloneDataSet, state.userDataSet]);

	useEffect(() => {
		return function cleanUp() {
			cancelToken.cancel('canceled axios with cleanup');
			cancelToken = axios.CancelToken.source();
		};
	}, []);

	useEffect(() => {
		if (state.runningSearch && cancelToken) {
			cancelToken.cancel('canceled axios request from search run');
			cancelToken = axios.CancelToken.source();
		}
	}, [state.runningSearch]);

	useEffect(() => {
		const baseUrl = window.location.origin;
		const fullUrl = window.location.href;
		const pathname = fullUrl.replace(baseUrl, '');
		const { url } = state?.cloneData;
		const urlEnd = pathname.slice(pathname.indexOf(url) + url.length + 1);
		const pageDisplayed = urlEnd.match(/^([\w-]+)/g)?.[0] ?? 'main';
		setState(dispatch, { pageDisplayed });
	}, [dispatch, state.cloneData]);

	useEffect(() => {
		const favSearchUrls = state.userData?.favorite_searches?.map((search) => {
			return search.url;
		});

		let url = window.location.hash.toString();
		url = url.replace('#/', '');

		const searchFavorite = favSearchUrls?.includes(url);

		if (state.isFavoriteSearch !== searchFavorite) {
			setState(dispatch, { isFavoriteSearch: searchFavorite });
		}
	}, [state.isFavoriteSearch, state.userData, dispatch]);

	useBottomScrollListener(
		() => {
			if (
				(state.activeCategoryTab !== 'all' || state.cloneData.clone_name.toLowerCase() === 'cdo') &&
				!state.docsLoading &&
				!state.docsPagination &&
				state.cloneData.clone_name.toLowerCase() !== 'jbook' // disabling infinite scroll for jbook
			) {
				setState(dispatch, {
					docsLoading: true,
					infiniteScrollPage: state.infiniteScrollPage + 1,
					replaceResults: false,
					docsPagination: true,
				});
			}
		},
		{ offset: 200, debounce: 5000 }
	);

	const setCurrentTime = () => {
		// const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		let currentTime = new Date();
		let currentMonth =
			currentTime.getMonth() + 1 < 10 ? `0${currentTime.getMonth() + 1}` : currentTime.getMonth() + 1;
		let currentDay = currentTime.getDate() < 10 ? `0${currentTime.getDate()}` : currentTime.getDate();

		// currentTime = `${months[currentTime.getMonth() - 1]} ${currentTime.getDate()}, ${currentTime.getHours()}:${currentTime.getMinutes()}`;
		currentTime = `${currentTime.getFullYear()}-${currentMonth}-${currentDay}-${currentTime.getHours()}-${currentTime.getSeconds()}-${currentTime.getMilliseconds()}`;

		setState(dispatch, { currentTime: currentTime });

		return currentTime;
	};

	const getMainViewComponent = (props) => {
		switch (state.cloneData.main_view_module) {
			case 'eda/edaMainViewHandler':
				return <EDAMainViewHandler {...props} />;
			case 'globalSearch/globalSearchMainViewHandler':
				return <GlobalSearchMainViewHandler {...props} />;
			case 'jbook/jbookMainViewHandler':
				return <JBookMainViewHandler {...props} />;
			case 'policy/policyMainViewHandler':
				return <PolicyMainViewHandler {...props} />;
			default:
				return <DefaultMainViewHandler {...props} />;
		}
	};

	return (
		<>
			{getMainViewComponent({
				state,
				dispatch,
				cancelToken,
				setCurrentTime,
				gameChangerAPI,
				gameChangerUserAPI,
			})}
		</>
	);
};

MainView.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			cloneDataSet: PropTypes.bool,
			historySet: PropTypes.bool,
			cloneData: PropTypes.shape({
				main_view_module: PropTypes.string,
				search_module: PropTypes.string,
				clone_name: PropTypes.string,
			}),
			history: PropTypes.object,
			userData: PropTypes.shape({
				favorite_searches: PropTypes.array,
			}),
			isFavoriteSearch: PropTypes.bool,
			docsPagination: PropTypes.bool,
			entityPagination: PropTypes.bool,
			topicPagination: PropTypes.bool,
			replaceResults: PropTypes.bool,
			activeCategoryTab: PropTypes.string,
			docsLoading: PropTypes.bool,
			infiniteScrollPage: PropTypes.number,
			pageDisplayed: PropTypes.string,
			searchSettings: PropTypes.object,
		}),
		dispatch: PropTypes.func,
	}),
};

export default MainView;
