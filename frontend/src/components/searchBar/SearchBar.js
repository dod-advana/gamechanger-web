import React, {useEffect, useState} from "react";
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
	handleSaveFavoriteSearch,
	handleSearchTypeUpdate, setState, checkUserInfo
} from "../../sharedFunctions";
import GameChangerSearchBar from "./GameChangerSearchBar";
import {
	PAGE_BORDER_RADIUS,
	SEARCH_TYPES
} from "../../gamechangerUtils";
import {gcBlue} from "../common/gc-colors";
import SearchBanner from "./GCSearchBanner";
import SearchHandlerFactory from "../factories/searchHandlerFactory";
import MainViewFactory from "../factories/mainViewFactory";

const SearchBar = (props) => {
	
	const {state, dispatch} = props.context;

	const { rawSearchResults } = state;
	const [searchHandler, setSearchHandler] = useState();
	const [mainViewHandler, setMainViewHandler] = useState();
	const [loaded, setLoaded] = useState(false);
	
	useEffect(() => {
		// Create the factory
		if (state.cloneDataSet && !loaded) {
			const searchFactory = new SearchHandlerFactory(state.cloneData.search_module);
			const tmpSearchHandler = searchFactory.createHandler();
			setSearchHandler(tmpSearchHandler)
			const mainViewFactory = new MainViewFactory(state.cloneData.main_view_module);
			const tmpMainViewHandler = mainViewFactory.createHandler();
			setMainViewHandler(tmpMainViewHandler);
			setLoaded(true);
		}
	}, [state, loaded]);
	
	useEffect(() => {
		if (state.runSearch && searchHandler) {
			setState(dispatch, { resetSettingsSwitch: false })
			searchHandler.handleSearch(state, dispatch);
		}
	}, [state, dispatch, searchHandler]);
	
	const toggleMenu = () => {
		setState(dispatch, {menuOpen: !state.menuOpen});
	}
	
	const setLoginModal = (open) => {
		setState(dispatch, { loginModalOpen: open });
	}
	
	const handleSearchTextUpdate = (searchText, runSearch) => {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.isFilterUpdate = false;
		setState(dispatch, {
			searchSettings: newSearchSettings,
			searchText: searchText,
			resultsPage: 1,
			metricsCounted: false,
			runSearch
		});
	};
	
	// function for search dropdown: updates searchText when using arrow keys
	const updateSearchTextOnly = (searchText) => {
		setState(dispatch, {searchText});
	}

	const handleCategoryTabChange = (tabName) => {
		mainViewHandler.handleCategoryTabChange({tabName, state, dispatch});
	}
	return (
		<>
			<SearchBanner
				titleBarModule={state.cloneData.title_bar_module}
				onTitleClick={() => {
					window.location.href = `#/${state.cloneData.url}`;
					dispatch({type: 'RESET_STATE'});
				}}
				componentStepNumbers={state.componentStepNumbers}
				toggleMenu={toggleMenu}
				borderRadius='10px'
				menuOpen={state.menuOpen}
				menuColor='#13A792'
				cloneData={state.cloneData}
				expansionDict={state.expansionDict}
				searchText={state.searchText}
				loginModalOpen={state.loginModalOpen}
				setLoginModal={setLoginModal}
				jupiter={props.jupiter}
				rawSearchResults={rawSearchResults}
				selectedCategories={state.selectedCategories}
				activeCategoryTab={state.activeCategoryTab}
				setActiveCategoryTab={tabName=>handleCategoryTabChange(tabName)}
				categoryMetadata={state.categoryMetadata}
				pageDisplayed={state.pageDisplayed}
				dispatch={dispatch}
			>
				<GameChangerSearchBar
					handleSearch={() => searchHandler.handleSearch(state, dispatch)}
					updateSearchTextOnly={updateSearchTextOnly}
					handleSearchTextUpdate={handleSearchTextUpdate}
					searchText={state.searchText}
					componentStepNumbers={state.componentStepNumbers}
					handleSearchTypeUpdate={(value) => handleSearchTypeUpdate(value, dispatch, state)}
					searchType={state.searchSettings?.searchType || SEARCH_TYPES.keyword}
					SEARCH_TYPES={SEARCH_TYPES}
					buttonColor={gcBlue}
					rawSearchResults={state.rawSearchResults}
					borderRadius={PAGE_BORDER_RADIUS}
					cloneData={state.cloneData}
					saveFavoriteSearch={(favoriteName, favoriteSummary, favorite) => handleSaveFavoriteSearch(favoriteName, favoriteSummary, favorite, dispatch, state)}
					favorite={state.isFavoriteSearch}
					publicationDateFilter={state.searchSettings?.publicationDateFilter || [null, null]}
					accessDateFilter={state.searchSettings?.accessDateFilter || [null, null]}
					checkUserInfo={() => { return checkUserInfo(state, dispatch)}}
				/>
			</SearchBanner>
		</>
	);
}

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
				accessDateFilter: PropTypes.arrayOf(PropTypes.string)
			}),
			loginModalOpen: PropTypes.bool,
			expansionDict: PropTypes.object,
			selectedCategories: PropTypes.objectOf(PropTypes.bool),
			activeCategoryTab: PropTypes.string,
			categoryMetadata: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number)),
			isFavoriteSearch: PropTypes.bool
		}),
		dispatch: PropTypes.func
	})
}

export default SearchBar;
