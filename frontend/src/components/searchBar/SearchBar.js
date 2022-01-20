import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { setState } from '../../utils/sharedFunctions';
import ModularSearchBarHandler from './ModularSearchBarHandler';
import SearchBanner from './GCSearchBanner';
import SearchHandlerFactory from '../factories/searchHandlerFactory';
import MainViewFactory from '../factories/mainViewFactory';

const SearchBar = (props) => {
	const { context } = props;
	const { state, dispatch } = context;

	const { rawSearchResults } = state;
	const [searchHandler, setSearchHandler] = useState();
	const [mainViewHandler, setMainViewHandler] = useState();
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		// Create the factory
		if (state.cloneDataSet && !loaded) {
			const searchFactory = new SearchHandlerFactory(
				state.cloneData.search_module
			);
			const tmpSearchHandler = searchFactory.createHandler();
			setSearchHandler(tmpSearchHandler);
			const mainViewFactory = new MainViewFactory(
				state.cloneData.main_view_module
			);
			const tmpMainViewHandler = mainViewFactory.createHandler();
			setMainViewHandler(tmpMainViewHandler);
			setLoaded(true);
		}
	}, [state, loaded]);

	useEffect(() => {
		if (state.runSearch && searchHandler) {
			setState(dispatch, { resetSettingsSwitch: false });
			searchHandler.handleSearch(state, dispatch);
		}
	}, [state, dispatch, searchHandler]);

	const toggleMenu = () => {
		setState(dispatch, { menuOpen: !state.menuOpen });
	};

	const handleCategoryTabChange = (tabName) => {
		mainViewHandler.handleCategoryTabChange({ tabName, state, dispatch });
	};

	return (
		<>
			<SearchBanner
				titleBarModule={state.cloneData.title_bar_module}
				onTitleClick={() => {
					window.location.href = `#/${state.cloneData.url}`;
					dispatch({ type: 'RESET_STATE' });
				}}
				componentStepNumbers={state.componentStepNumbers}
				toggleMenu={toggleMenu}
				borderRadius="10px"
				menuOpen={state.menuOpen}
				menuColor="#13A792"
				cloneData={state.cloneData}
				expansionDict={state.expansionDict}
				searchText={state.searchText}
				jupiter={props.jupiter}
				rawSearchResults={rawSearchResults}
				selectedCategories={state.selectedCategories}
				activeCategoryTab={state.activeCategoryTab}
				setActiveCategoryTab={(tabName) => handleCategoryTabChange(tabName)}
				categoryMetadata={state.categoryMetadata}
				pageDisplayed={state.pageDisplayed}
				dispatch={dispatch}
				loading={state.loading}
			>
				<ModularSearchBarHandler context={context} />
			</SearchBanner>
		</>
	);
};

SearchBar.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			rawSearchResults: PropTypes.arrayOf(PropTypes.object),
			cloneDataSet: PropTypes.bool,
			cloneData: PropTypes.shape({
				search_module: PropTypes.string,
				main_view_module: PropTypes.string,
				title_bar_module: PropTypes.string,
				url: PropTypes.string,
			}),
			runSearch: PropTypes.bool,
			menuOpen: PropTypes.bool,
			pageDisplayed: PropTypes.string,
			searchText: PropTypes.string,
			componentStepNumbers: PropTypes.objectOf(PropTypes.number),
			searchSettings: PropTypes.shape({
				searchType: PropTypes.string,
				publicationDateFilter: PropTypes.arrayOf(PropTypes.string),
				accessDateFilter: PropTypes.arrayOf(PropTypes.string),
			}),
			expansionDict: PropTypes.object,
			selectedCategories: PropTypes.objectOf(PropTypes.bool),
			activeCategoryTab: PropTypes.string,
			categoryMetadata: PropTypes.objectOf(
				PropTypes.objectOf(PropTypes.number)
			),
			isFavoriteSearch: PropTypes.bool,
		}),
		dispatch: PropTypes.func,
	}),
};

export default SearchBar;
