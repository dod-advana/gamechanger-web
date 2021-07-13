import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import _ from "underscore";
import TextField from "@material-ui/core/TextField";
import {makeStyles} from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import { AccessTime, Search } from '@material-ui/icons';
import GCButton from "../common/GCButton";
import GCTooltip from "../common/GCToolTip";
import { trackEvent } from "../telemetry/Matomo";
import GameChangerAPI from "../api/gameChanger-service-api";
import AdvancedDropdown from "./AdvancedDropdown";
import SearchBarDropdown from './SearchBarDropdown';
import { SearchBarForm, SearchBarInput, SearchButton, AdvancedSearchButton } from './SearchBarStyledComponents';
import {getTrackingNameForFactory, getQueryVariable} from "../../gamechangerUtils";
import { handleSaveFavoriteSearch, setState, checkUserInfo } from '../../sharedFunctions';

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
			marginLeft: 'unset'
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				height: '24px',
				fontSize: '14px'
			}
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: props => props.error ? 'red' : 'inherit',
			}
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
			marginLeft: 'unset'
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				fontSize: '14px'
			}
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: props => props.error ? 'red' : 'inherit',
			}
		},
	}
}));
const gameChangerAPI = new GameChangerAPI();
const inputBorder = '1px solid lightgrey';

const GameChangerSearchBar = (props) => {
	const { context  } = props;
	const {state, dispatch} = context;
	const isEDA = state.cloneData.clone_name === 'eda';
	const isGamechanger = state.cloneData.clone_name === 'gamechanger';
	const classes = useStyles();
	const useDebounce = (value, delay) => {
		const [debouncedValue, setDebouncedValue] = useState(value);
		useEffect(() => {
			const handler = setTimeout(() => {setDebouncedValue(value);}, delay);
			return () => {clearTimeout(handler);};
		}, [value, delay]);
	 return debouncedValue;
	}; 
	const ref = useRef();

	const [loaded, setLoaded] = useState(false);
	const [searchText, setSearchText] = useState(getQueryVariable('q') || '');
	const debouncedSearchTerm = useDebounce(searchText, 300);
	const [debounceOn, setDebounceOn] = useState(true);

	const [userSearchHistory, setUserSearchHistory] = useState([]);
	const [autocorrect, setAutocorrect] = useState([]);
	const [presearchFile, setPresearchFile] = useState([]);
	const [presearchTitle, setPresearchTitle] = useState([]);
	const [presearchTopic, setPresearchTopic] = useState([]);
	const [presearchOrg, setPresearchOrg] = useState([]);
	const [predictions, setPredictions] = useState([]);
	const [dataRows, setDataRows] = useState([]);
	const [favoriteName, setFavoriteName] = useState('');
	const [favoriteSummary, setFavoriteSummary] = useState('')
	const [searchFavoritePopperOpen, setSearchFavoritePopperOpen] = useState(false);
	const [searchFavoritePopperAnchorEl, setSearchFavoritePopperAnchorEl] = useState(null);
	const [cursor, setCursor] = useState(null);
	const [originalText, setOriginalText] = useState(null);

	const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	useEffect(() => { // initial loading of user search history
			if(!loaded){
				const userSearchHistory = JSON.parse(localStorage.getItem(`recent${state.cloneData.clone_name}Searches`) || '[]');
				const historyWithIds = userSearchHistory.map((item, index) => ({ id: String(index), text: item }));
				setUserSearchHistory(historyWithIds);
				setLoaded(true);
			}
		},
	 [state, dispatch, loaded]);

	

	useEffect(()=> { 
		const debouncedFetchSearchSuggestions = async (value) => {
			try {
				const index = state.cloneData?.clone_data?.esCluster ?? '';
				const { data } = await gameChangerAPI.getTextSuggestion({ index, searchText: value });
				setAutocorrect(data?.autocorrect?.map(item => ({ text: item })) ?? []);
				setPresearchFile(data?.presearchFile?.map(item => ({ text: item })) ?? [])
				setPresearchTitle(data?.presearchTitle?.map(item => ({ text: item })) ?? []);
				setPresearchTopic(data?.presearchTopic?.map(item => ({ text: item })) ?? []);
				setPresearchOrg(data?.presearchOrg?.map(item => ({ text: item })) ?? []);
				setPredictions(data?.predictions?.map(item => ({ text: item })) ?? []);
			} catch (e) {
				console.log('debouncedFetchSearchSuggestions err', e);
			}
		}
		
		debouncedFetchSearchSuggestions(debouncedSearchTerm);
	}, [state.cloneData, debouncedSearchTerm ]); // run when debounce value changes;

	useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Enter'){
				setState(dispatch, {
					searchText: searchText,
					resultsPage: 1,
					metricsCounted: false,
					runSearch: true
				});
				setDropdownOpen(false);
				document.activeElement.blur();
			}
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch, searchText]);

	useEffect(() => { // if clicked outside of searchbar, close dropdown
    const handleClick = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }; 
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);
  

	const handleKeyDown = (e) => {
		let data = [];
		dataRows.forEach(item => {
			item.rows.forEach((row) => {
				data.push(row.text);
			});
		});
		// arrow up/down button should select next/previous list element
		if(e.keyCode === 38 || e.keyCode === 40) {
			e.preventDefault(); // keep cursor at front 
			setDebounceOn(false);
		}
		if(e.keyCode === 40 && cursor === null && data[0] !== undefined ){
			setCursor(0);
			setOriginalText(searchText);
			setSearchText(data[0].toLowerCase());
		}
		else if(e.keyCode === 38 && cursor === null && data[0] !== undefined ){
			setCursor(data.length-1);
			setOriginalText(searchText);
			setSearchText(data[data.length-1].toLowerCase());
		}
		else if (e.keyCode === 38 && cursor === 0) { // return to original state
			setSearchText(originalText);
			setCursor(null);
			setOriginalText(null);
		}
		else if (e.keyCode === 38 && cursor > 0) {
			setCursor(cursor - 1);
			setSearchText(data[cursor - 1].toLowerCase());
		} 
		else if (e.keyCode === 40 && cursor < data.length -1 ) {
			setCursor(cursor + 1);
			setSearchText(data[cursor + 1].toLowerCase());
		}
		else if (e.keyCode === 40 && cursor === data.length-1 ) {// return to original state by wrapping
			setSearchText(originalText);
			setCursor(null);
			setOriginalText(null);
		}
		else {
			setDebounceOn(true);
		}
	}


	const handleFavoriteSearchClicked = (anchorEL, favorite) => {
		if (favorite) {
			handleSaveSearch(false)
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
	}

	const handleSaveSearch = (favorite) => {
		handleSaveFavoriteSearch(favoriteName, favoriteSummary, favorite, dispatch, state)
		setFavoriteName('');
		setFavoriteSummary('')
		setSearchFavoritePopperOpen(false);
		setSearchFavoritePopperAnchorEl(null);
	}

	const handleOnType = (event) => {
		const { target: { value } } = event;
		if (value && value.length > 3) {
			if(cursor !== null){// return to typing state
				setCursor(null);
				setOriginalText(null);
			}
		} else {
			clearLiveSuggestions();
		}
		setSearchText(value);
	}

	const clearLiveSuggestions = () => {
		setAutocorrect([]);
		setPredictions([]);
		setPresearchFile([]);
		setPresearchOrg([]);
		setPresearchTopic([]);
		setPresearchTitle([]);
	}



	const handleOnBlur = (e) => {
		setCursor(null);
		setOriginalText(null);
	}

	const handleSubmit = (event) => {
		if (event) {
			event.preventDefault();
		}
		setState(dispatch, {
			searchText: searchText,
			resultsPage: 1,
			metricsCounted: false,
			runSearch: true
		});
		document.activeElement.blur();
		setDropdownOpen(false);
	}

	useEffect(() => { // getting dropdown data when searchText changes
		const getDropdownData = (text) => {
			let data = [];
			let textArray = [];
			// order of suggestions in dropdwon
			if (text.length > 0 && autocorrect.length > 0) {
				const rows = [];
				autocorrect.forEach(o => {
					if(textArray.findIndex(item => item === o.text.toLowerCase()) === -1){ // if current item is not in textArray
						rows.push(o);
						textArray.push(o.text.toLowerCase());
					}
				});
				data.push({
					IconComponent: Search,
					rows: rows,
					handleRowPressed: handleRowPressed,
					rowType: 'autocorrect'
				});
			}
			if (text.length > 0 && presearchFile.length > 0) {
				const rows = [];
				presearchFile.forEach(o => {
					if(textArray.findIndex(item => item === o.text.toLowerCase()) === -1){ // if current item is not in textArray
						rows.push(o);
						textArray.push(o.text.toLowerCase());
					}
				});
				data.push({
					IconComponent: Search,
					rows: rows,
					handleRowPressed: handleRowPressed,
					rowType: 'presearchFile'
				});
			}
			if (text.length > 0 && presearchTitle.length > 0) {
				const rows = [];
				presearchTitle.forEach(o => {
					if(textArray.findIndex(item => item === o.text.toLowerCase()) === -1){ // if current item is not in textArray
						rows.push(o);
						textArray.push(o.text.toLowerCase());
					}
				});
				data.push({
					IconComponent: Search,
					rows: rows,
					handleRowPressed: handleRowPressed,
					rowType: 'presearchTitle'
				});
			}
			if (text.length > 0 && predictions.length > 0) {
				const rows = [];
				predictions.forEach(o => {
					if(textArray.findIndex(item => item === o.text.toLowerCase()) === -1){ // if current item is not in textArray
						rows.push(o);
						textArray.push(o.text.toLowerCase());
					}
				});
				data.push({
					IconComponent: Search,
					rows: rows,
					handleRowPressed: handleRowPressed,
					rowType: 'predictions'
				});
			}
			if (text.length > 0 && presearchTopic.length > 0) {
				const rows = [];
				presearchTopic.forEach(o => {
					if(textArray.findIndex(item => item === o.text.toLowerCase()) === -1){ // if current item is not in textArray
						rows.push(o);
						textArray.push(o.text.toLowerCase());
					}
				});
				data.push({
					IconComponent: Search,
					rows: rows,
					handleRowPressed: handleRowPressed,
					rowType: 'presearchTopic'
				});
			}
			if (text.length > 0 && presearchOrg.length > 0) {
				const rows = [];
				presearchOrg.forEach(o => {
					if(textArray.findIndex(item => item === o.text.toLowerCase()) === -1){ // if current item is not in textArray
						rows.push(o);
						textArray.push(o.text.toLowerCase());
					}
				});
				data.push({
					IconComponent: Search,
					rows: rows,
					handleRowPressed: handleRowPressed,
					rowType: 'presearchOrg'
				});
			}
			if ((userSearchHistory?.length > 0) && (searchText.length === 0)){
				let filteredRows = userSearchHistory;
				// if scrolling using arrow keys, use original text
				const textToUse = originalText === null ? text : originalText;
				// filter rows to make sure it includes
				filteredRows = _.filter(filteredRows, (o) =>  o.text.toLowerCase().includes(textToUse.toLowerCase()));
				data.push({
					IconComponent: AccessTime,
					rows: text.length > 0 ? filteredRows : userSearchHistory, // if there's no text, give all the history
					handleRowPressed: handleRowPressed,
					rowType: 'user_search_history',
					// for future feature where history can be removed from suggestions
					// handleDeletePressed: this.handleHistoryDelete,
				})
			}
			return data;
		}

		const handleRowPressed = ({ text, rowType }) => {
			setState(dispatch, {
				searchText: text,
				resultsPage: 1,
				metricsCounted: false,
				runSearch: true
			});
			setSearchText(text);
			document.activeElement.blur();
			setDropdownOpen(false);
	
			if (rowType) {
				trackEvent(getTrackingNameForFactory(state.cloneData), 'SearchSuggestionSelected', rowType, text)
			}
		}

		if(cursor === null && debounceOn){
			const newDataRows = getDropdownData(debouncedSearchTerm);
			setDataRows(newDataRows);
		}
	},
	[ 
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
		presearchFile,
		presearchTitle,
		presearchTopic,
		presearchOrg,
		setDataRows
	]
);

	const noResults = Boolean(state.rawSearchResults?.length === 0);
	const hideSearchResults = noResults && !state.loading;
	return (
		<div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: "relative" }} ref={ref}>
			<SearchBarForm
				id="GamechangerSearchBarForm"
				className={state.componentStepNumbers ? `tutorial-step-${state.componentStepNumbers["Search Input"]}` : null}
				onSubmit={handleSubmit}
				autoComplete="off"
				onKeyDown={handleKeyDown}
			>
				<SearchBarInput
					type="text"
					value={searchText}
					onChange={handleOnType}
					onBlur={handleOnBlur}
					onFocus={() => {setDropdownOpen(true)}}
					placeholder="Search..."
					id="gcSearchInput"
				/>

				{!isEDA &&
					<GCTooltip title={'Favorite a search to track in the User Dashboard'} placement='top' arrow>
						<button
							type="button"
							style={{ border: inputBorder, borderLeft: 'none', height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: '0 15px' }}
							onClick={(event) => handleFavoriteSearchClicked(event.target, state.isFavoriteSearch)}
						>
							<i className={state.isFavoriteSearch ? "fa fa-star" : "fa fa-star-o"} style={{
								color: state.isFavoriteSearch ? "#E9691D" : 'rgb(224, 224, 224)',
								cursor: "pointer",
								fontSize: 26
							}} />
						</button>
					</GCTooltip>
				}
				{ dropdownOpen && !advancedSearchOpen && <SearchBarDropdown searchText={searchText} rowData={dataRows} cursor={cursor} /> }
				{ isGamechanger && hideSearchResults &&
					<AdvancedDropdown
						context={context}
						handleSubmit={handleSubmit}
						open={advancedSearchOpen}
						close={() => {setAdvancedSearchOpen(false)}}
						>
					</AdvancedDropdown>}
				{ isGamechanger && hideSearchResults && 
					<AdvancedSearchButton type='button' id='advancedSearchButton' onClick={() => {setAdvancedSearchOpen(!advancedSearchOpen)}}>
						Advanced
						<i className="fa fa-chevron-down" style={{marginLeft: '5px'}}/>
					</AdvancedSearchButton>
				}
			</SearchBarForm>
			<SearchButton id="gcSearchButton" onClick={handleSubmit}>
				<i className="fa fa-search" />
			</SearchButton>

			<Popover onClose={() => { handleFavoriteSearchClicked(null); }}
				open={searchFavoritePopperOpen} anchorEl={searchFavoritePopperAnchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
			>
				<div className={classes.paper}>
					<div style={{ width: 330, margin: 5 }}>
						<TextField
							label={'Favorite Name'}
							value={favoriteName}
							onChange={(event) => { setFavoriteName(event.target.value); }}
							className={classes.textField}
							margin='none'
							size='small'
							variant='outlined'
						/>
						<TextField
							label={'Favorite Summary'}
							value={favoriteSummary}
							onChange={(event) => { setFavoriteSummary(event.target.value) }}
							className={classes.textArea}
							margin='none'
							size='small'
							variant='outlined'
							multiline={true}
							rows={4}
						/>
						<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
							<GCButton
								onClick={() => handleSaveSearch(true)}
								style={{ height: 40, minWidth: 40, padding: '2px 8px 0px', fontSize: 14, margin: '16px 0px 0px 10px' }}
							>Save
							</GCButton>
							<GCButton
								onClick={() => handleFavoriteSearchClicked(null)}
								style={{ height: 40, minWidth: 40, padding: '2px 8px 0px', fontSize: 14, margin: '16px 0px 0px 10px' }}
								textStyle={{ color: '#8091A5' }}
								buttonColor={'#FFFFFF'}
								borderColor={'#B0B9BE'}
							>Cancel
							</GCButton>
						</div>
					</div>
				</div>
			</Popover>
		</div>
	);
}

GameChangerSearchBar.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			cloneDataSet: PropTypes.bool,
			historySet: PropTypes.bool,
			cloneData: PropTypes.shape({
				main_view_module: PropTypes.string,
				search_module: PropTypes.string,
				clone_name: PropTypes.string
			}),
			history: PropTypes.object,
			userData: PropTypes.shape({
				favorite_searches: PropTypes.array
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
			searchSettings: PropTypes.object
		}),
		dispatch: PropTypes.func
	})
}

export default GameChangerSearchBar;
