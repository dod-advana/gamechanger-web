import React, {useEffect, useState} from "react";
import {
	handleSaveFavoriteSearch,
	handleSearchTypeUpdate, setState, checkUserInfo
} from "../../sharedFunctions";
import GameChangerSearchBar from "./GameChangerSearchBar";
import {
	getTrackingNameForFactory,
	PAGE_BORDER_RADIUS,
	SEARCH_TYPES
} from "../../gamechangerUtils";
import {gcBlue} from "../../components/common/gc-colors";
import {SearchBanner} from "./GCSearchBanner";
import {trackEvent} from "../telemetry/Matomo";
import SearchHandlerFactory from "../factories/searchHandlerFactory";

const SearchBar = (props) => {
	
	const {state, dispatch} = props.context;
	
	const [searchHandler, setSearchHandler] = useState();
	const [loaded, setLoaded] = useState(false);
	
	useEffect(() => {
		// Create the factory
		if (state.cloneDataSet && !loaded) {
			const factory = new SearchHandlerFactory(state.cloneData.search_module);
			const handler = factory.createHandler();
			setSearchHandler(handler)
			setLoaded(true);
		}
	}, [state, loaded]);
	
	useEffect(() => {
		if (state.runSearch && searchHandler) {
			searchHandler.handleSearch(state, dispatch);
		}
	}, [state, dispatch, searchHandler]);
	
	const toggleMenu = () => {
		setState(dispatch, {menuOpen: !state.menuOpen});
	}
	
	const addSearchTerm = (obj) => {
		trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'QueryExpansion', 'SearchTermAdded', `${obj.phrase}_${obj.source}`);
		const newSearchText = state.searchText.trim() ? `${state.searchText} OR ${obj.phrase}` : obj.phrase;
		setState(dispatch, { searchText: newSearchText, runSearch: true });
	}
	
	const setLoginModal = (open) => {
		setState(dispatch, { loginModalOpen: open });
	}
	
	const handleSearchTextUpdate = (searchText, runSearch) => {
		setState(dispatch, {
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
	
	return (
		<>
			<SearchBanner
				titleBarModule={state.cloneData.title_bar_module}
				onTitleClick={() => {
					window.location.href = `#/${state.cloneData.url}`;
					document.body.style.overflow = 'unset';
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
				addSearchTerm={addSearchTerm}
				loginModalOpen={state.loginModalOpen}
				setLoginModal={setLoginModal}
				jupiter={props.jupiter}
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
					checkUserInfo={() => {checkUserInfo(state, dispatch)}}
				/>
			</SearchBanner>
		</>
	);
}

export default SearchBar;
