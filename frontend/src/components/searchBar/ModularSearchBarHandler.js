import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { makeStyles } from '@material-ui/core/styles';
import { AccessTime, Search } from '@material-ui/icons';
import { trackEvent } from '../telemetry/Matomo';
import { getTrackingNameForFactory } from '../../utils/gamechangerUtils';
import {
	handleSaveFavoriteSearch,
	setState,
	checkUserInfo,
} from '../../utils/sharedFunctions';
import SearchBarFactory from '../factories/searchBarFactory';

const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
			margin: theme.spacing(1),
			width: '25ch',
		},
	},
	paper: {
		border: '1px solid',
		padding: theme.spacing(1),
		backgroundColor: theme.palette.background.paper,
	},
	textField: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		marginTop: '14px',
		paddingBottom: '8px',
		height: 'auto',
		width: '322px',
		'& .MuiFormHelperText-root': {
			fontSize: 14,
			marginLeft: 'unset',
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				height: '24px',
				fontSize: '14px',
			},
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: (props) => (props.error ? 'red' : 'inherit'),
			},
		},
	},
	textArea: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		marginTop: '14px',
		paddingBottom: '8px',
		height: 'auto',
		width: '322px',
		'& .MuiFormHelperText-root': {
			fontSize: 14,
			marginLeft: 'unset',
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				fontSize: '14px',
			},
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: (props) => (props.error ? 'red' : 'inherit'),
			},
		},
	},
}));
const inputBorder = '1px solid lightgrey';

const ModularSearchBarHandler = (props) => {
	const { context } = props;
	const { state, dispatch } = context;
	const classes = useStyles();
	const useDebounce = (value, delay) => {
		const [debouncedValue, setDebouncedValue] = useState(value);
		useEffect(() => {
			const handler = setTimeout(() => {
				setDebouncedValue(value);
			}, delay);
			return () => {
				clearTimeout(handler);
			};
		}, [value, delay]);
		return debouncedValue;
	};
	const ref = useRef();

	const [loaded, setLoaded] = useState(false);
	const [searchText, setSearchText] = useState(context.state.searchText || '');
	const debouncedSearchTerm = useDebounce(searchText, 300);
	const [debounceOn, setDebounceOn] = useState(true);

	const [userSearchHistory, setUserSearchHistory] = useState([]);
	const [autocorrect, setAutocorrect] = useState([]);
	const [presearchTitle, setPresearchTitle] = useState([]);
	const [presearchTopic, setPresearchTopic] = useState([]);
	const [presearchOrg, setPresearchOrg] = useState([]);
	const [predictions, setPredictions] = useState([]);
	const [dataRows, setDataRows] = useState([]);
	const [favoriteName, setFavoriteName] = useState('');
	const [favoriteSummary, setFavoriteSummary] = useState('');
	const [searchFavoritePopperOpen, setSearchFavoritePopperOpen] =
		useState(false);
	const [searchFavoritePopperAnchorEl, setSearchFavoritePopperAnchorEl] =
		useState(null);
	const [cursor, setCursor] = useState(null);
	const [originalText, setOriginalText] = useState(null);

	const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const [searchBarHandler, setSearchBarHandler] = useState();

	useEffect(() => {
		const queryText = context.state.searchText
			? context.state.searchText
			: null;
		if (queryText) {
			setSearchText(queryText);
		}
	}, [context.state.searchText, context.state.runSearch]);

	useEffect(() => {
		// initial loading of user search history
		if (!loaded) {
			const userSearchHistory = JSON.parse(
				localStorage.getItem(`recent${state.cloneData.clone_name}Searches`) ||
					'[]'
			);
			const historyWithIds = userSearchHistory.map((item, index) => ({
				id: String(index),
				text: item,
			}));
			setUserSearchHistory(historyWithIds);
			setLoaded(true);
		}
	}, [state, dispatch, loaded]);

	useEffect(() => {
		if (searchBarHandler) {
			if(debouncedSearchTerm.length > 3){
				searchBarHandler.debouncedFetchSearchSuggestions(
					debouncedSearchTerm,
					state.cloneData,
					setAutocorrect,
					setPresearchTitle,
					setPresearchTopic,
					setPresearchOrg,
					setPredictions
				);
			}
		}
	}, [state.cloneData, debouncedSearchTerm, searchBarHandler]); // run when debounce value changes;

	useEffect(() => {
		function onKeyDown(e) {
			if (e.key === 'Enter' && state.inputActive !== 'compareInput' && cursor) {
				setState(dispatch, {
					searchText: searchText,
					resultsPage: 1,
					metricsCounted: false,
					runSearch: true,
				});
				setDropdownOpen(false);
				document.activeElement.blur();
			}
		}
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [dispatch, searchText, state.inputActive, cursor]);

	useEffect(() => {
		// if clicked outside of searchbar, close dropdown
		const handleClick = (e) => {
			if (ref.current && !ref.current.contains(e.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClick);
		return () => {
			document.removeEventListener('mousedown', handleClick);
		};
	}, []);

	useEffect(() => {
		const searchBarFactory = new SearchBarFactory(
			state.cloneData.search_bar_module
		);
		const tmpSearchBarHandler = searchBarFactory.createHandler();
		setSearchBarHandler(tmpSearchBarHandler);
	}, [state.cloneData.search_bar_module]);

	const handleKeyDown = (e) => {
		let data = [];
		dataRows.forEach((item) => {
			item.rows.forEach((row) => {
				data.push(row.text);
			});
		});
		// arrow up/down button should select next/previous list element
		if (e.keyCode === 38 || e.keyCode === 40) {
			e.preventDefault(); // keep cursor at front
			setDebounceOn(false);
		}
		if (e.keyCode === 40 && cursor === null && data[0] !== undefined) {
			setCursor(0);
			setOriginalText(searchText);
			setSearchText(data[0].toLowerCase());
		} else if (e.keyCode === 38 && cursor === null && data[0] !== undefined) {
			setCursor(data.length - 1);
			setOriginalText(searchText);
			setSearchText(data[data.length - 1].toLowerCase());
		} else if (e.keyCode === 38 && cursor === 0) {
			// return to original state
			setSearchText(originalText);
			setCursor(null);
			setOriginalText(null);
		} else if (e.keyCode === 38 && cursor > 0) {
			setCursor(cursor - 1);
			setSearchText(data[cursor - 1].toLowerCase());
		} else if (e.keyCode === 40 && cursor < data.length - 1) {
			setCursor(cursor + 1);
			setSearchText(data[cursor + 1].toLowerCase());
		} else if (e.keyCode === 40 && cursor === data.length - 1) {
			// return to original state by wrapping
			setSearchText(originalText);
			setCursor(null);
			setOriginalText(null);
		} else {
			setDebounceOn(true);
		}
	};

	const handleFavoriteSearchClicked = (anchorEL, favorite) => {
		if (favorite) {
			handleSaveSearch(false);
			return;
		}

		if (!searchFavoritePopperOpen) {
			if (checkUserInfo(state, dispatch)) {
				return;
			}
			setSearchFavoritePopperOpen(true);
			setSearchFavoritePopperAnchorEl(anchorEL);
		} else {
			setSearchFavoritePopperOpen(false);
			setSearchFavoritePopperAnchorEl(null);
		}
	};

	const handleSaveSearch = (favorite) => {
		handleSaveFavoriteSearch(
			favoriteName,
			favoriteSummary,
			favorite,
			dispatch,
			state
		);
		setFavoriteName('');
		setFavoriteSummary('');
		setSearchFavoritePopperOpen(false);
		setSearchFavoritePopperAnchorEl(null);
	};

	const handleOnType = (event) => {
		const {
			target: { value },
		} = event;
		if (value && value.length > 3) {
			if (cursor !== null) {
				// return to typing state
				setCursor(null);
				setOriginalText(null);
			}
		} else {
			clearLiveSuggestions();
		}
		setSearchText(value);
	};

	const clearLiveSuggestions = () => {
		setAutocorrect([]);
		setPredictions([]);
		setPresearchOrg([]);
		setPresearchTopic([]);
		setPresearchTitle([]);
	};

	const handleOnBlur = (e) => {
		setCursor(null);
		setOriginalText(null);
	};

	const handleSubmit = (event) => {
		if (event) {
			event.preventDefault();
		}
		setState(dispatch, {
			searchText: searchText,
			resultsPage: 1,
			metricsCounted: false,
			runSearch: true,
		});
		document.activeElement.blur();
		setDropdownOpen(false);
	};

	useEffect(() => {
		// getting dropdown data when searchText changes
		const getDropdownData = (text) => {
			let data = [];
			let textArray = [];
			// order of suggestions in dropdwon
			if (text.length > 0 && autocorrect.length > 0) {
				const rows = [];
				autocorrect.forEach((o) => {
					if (
						textArray.findIndex((item) => item === o.text.toLowerCase()) === -1
					) {
						// if current item is not in textArray
						rows.push(o);
						textArray.push(o.text.toLowerCase());
					}
				});
				data.push({
					IconComponent: Search,
					rows: rows,
					handleRowPressed: handleRowPressed,
					rowType: 'autocorrect',
				});
			}
			if (text.length > 0 && presearchTitle.length > 0) {
				const rows = [];
				presearchTitle.forEach((o) => {
					if (
						textArray.findIndex((item) => item === o.text.toLowerCase()) === -1
					) {
						// if current item is not in textArray
						rows.push(o);
						textArray.push(o.text.toLowerCase());
					}
				});
				data.push({
					IconComponent: Search,
					rows: rows,
					handleRowPressed: handleRowPressed,
					rowType: 'presearchTitle',
				});
			}
			if (text.length > 0 && predictions.length > 0) {
				const rows = [];
				predictions.forEach((o) => {
					if (
						textArray.findIndex((item) => item === o.text.toLowerCase()) === -1
					) {
						// if current item is not in textArray
						rows.push(o);
						textArray.push(o.text.toLowerCase());
					}
				});
				data.push({
					IconComponent: Search,
					rows: rows,
					handleRowPressed: handleRowPressed,
					rowType: 'predictions',
				});
			}
			if (text.length > 0 && presearchTopic.length > 0) {
				const rows = [];
				presearchTopic.forEach((o) => {
					if (
						textArray.findIndex((item) => item === o.text.toLowerCase()) === -1
					) {
						// if current item is not in textArray
						rows.push(o);
						textArray.push(o.text.toLowerCase());
					}
				});
				data.push({
					IconComponent: Search,
					rows: rows,
					handleRowPressed: handleRowPressed,
					rowType: 'presearchTopic',
				});
			}
			if (text.length > 0 && presearchOrg.length > 0) {
				const rows = [];
				presearchOrg.forEach((o) => {
					if (
						textArray.findIndex((item) => item === o.text.toLowerCase()) === -1
					) {
						// if current item is not in textArray
						rows.push(o);
						textArray.push(o.text.toLowerCase());
					}
				});
				data.push({
					IconComponent: Search,
					rows: rows,
					handleRowPressed: handleRowPressed,
					rowType: 'presearchOrg',
				});
			}
			if (userSearchHistory?.length > 0 && searchText.length === 0) {
				let filteredRows = userSearchHistory;
				// if scrolling using arrow keys, use original text
				const textToUse = originalText === null ? text : originalText;
				// filter rows to make sure it includes
				filteredRows = _.filter(filteredRows, (o) =>
					o.text.toLowerCase().includes(textToUse.toLowerCase())
				);
				data.push({
					IconComponent: AccessTime,
					rows: text.length > 0 ? filteredRows : userSearchHistory, // if there's no text, give all the history
					handleRowPressed: handleRowPressed,
					rowType: 'user_search_history',
					// for future feature where history can be removed from suggestions
					// handleDeletePressed: this.handleHistoryDelete,
				});
			}
			return data;
		};

		const handleRowPressed = ({ text, rowType }) => {
			setState(dispatch, {
				searchText: text,
				resultsPage: 1,
				metricsCounted: false,
				runSearch: true,
			});
			setSearchText(text);
			document.activeElement.blur();
			setDropdownOpen(false);

			if (rowType) {
				trackEvent(
					getTrackingNameForFactory(state.cloneData),
					'SearchSuggestionSelected',
					rowType,
					text
				);
			}
		};

		if (cursor === null && debounceOn) {
			const newDataRows = getDropdownData(debouncedSearchTerm);
			setDataRows(newDataRows);
		}
	}, [
		dispatch,
		cursor,
		originalText,
		predictions,
		searchText,
		state.cloneData,
		debounceOn,
		debouncedSearchTerm,
		userSearchHistory,
		autocorrect,
		presearchTitle,
		presearchTopic,
		presearchOrg,
		setDataRows,
	]);

	const noResults = Boolean(state.rawSearchResults?.length === 0);
	const hideSearchResults = noResults && !state.loading;
	return (
		<>
			{searchBarHandler &&
				searchBarHandler.getSearchBar({
					context,
					state,
					classes,
					dispatch,
					searchFavoritePopperAnchorEl,
					ref,
					advancedSearchOpen,
					dropdownOpen,
					hideSearchResults,
					inputBorder,
					handleSubmit,
					handleKeyDown,
					handleOnType,
					handleOnBlur,
					searchText,
					setDropdownOpen,
					handleFavoriteSearchClicked,
					dataRows,
					cursor,
					setAdvancedSearchOpen,
					searchFavoritePopperOpen,
					favoriteName,
					setFavoriteName,
					setFavoriteSummary,
					handleSaveSearch,
				})}
		</>
	);
};

ModularSearchBarHandler.propTypes = {
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

export default ModularSearchBarHandler;
