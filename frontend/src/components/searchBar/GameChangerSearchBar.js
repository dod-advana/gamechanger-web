import React from 'react';
import _ from "underscore";
import GCTooltip from "../common/GCToolTip";
import TextField from "@material-ui/core/TextField";
import withStyles from "@material-ui/core/styles/withStyles";
import GCButton from "../common/GCButton";
import Popover from "@material-ui/core/Popover";

import { trackEvent } from "../telemetry/Matomo";
import GameChangerAPI from "../api/gameChanger-service-api";

import SearchBarDropdown from './SearchBarDropdown';
import { SearchBarForm, SearchBarInput, SearchButton } from './SearchBarStyledComponents';

import {
	AccessTime,
	Search
} from '@material-ui/icons';
import {getTrackingNameForFactory, getQueryVariable} from "../../gamechangerUtils";

const useStyles = (theme) => ({
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
});

const gameChangerAPI = new GameChangerAPI();

const inputBorder = '1px solid lightgrey';

class GameChangerSearchBar extends React.Component {
	constructor(props) {
		super(props)
		this.SEARCH_TYPES = Object.values(props.SEARCH_TYPES).map(name => ({ value: name, label: name }))
		this.handleKeyDown = this.handleKeyDown.bind(this)
		this.debouncedFetchSearchSuggestions = _.debounce(this.debouncedFetchSearchSuggestions, 400);
	}

	static defaultProps = {
		handleSearch: _.noop,
		handleSearchTextUpdate: _.noop,
		updateSearchTextOnly: _.noop,
		handleSearchTypeUpdate: _.noop,
		searchText: '',
		SEARCH_TYPES: []
	}

	state = {
		highlightedRow: null,
		open: false,
		favoriteName: '',
		favoriteSummary: '',
		searchFavoritePopperOpen: false,
		searchFavoritePopperAnchorEl: null,
		userSearchHistory: [],
		autocorrect: [],
		predictions: [],
		presearchFile: [],
		presearchTitle: [],
		presearchOrg: [],
		presearchTopic: [],
		searchText: getQueryVariable('q') || '',
		originalText: null, // describes text used before using arrow keys
		cursor: null, // describes cursor position when using arrow keys
		dataRows: []
	}

	componentDidMount() {
		try {
			const userSearchHistory = JSON.parse(localStorage.getItem(`recent${this.props.cloneData.clone_name}Searches`) || '[]');
			const historyWithIds = userSearchHistory.map((item, index) => ({ id: String(index), text: item }));
			this.setState({ userSearchHistory: historyWithIds});
		} catch (e) {
			console.error('Failed to parse latest links', e)
		}
	}

	componentDidUpdate(prevProps, prevState) {
		// check if search is different, or any of the search history results have changed.
		if ( this.state.originalText === null && // if we are using arrow keys, do not update dropdown data
			(this.state.searchText !== prevState.searchText || 
			!_.isEqual(this.state.userSearchHistory, prevState.userSearchHistory) ||
			!_.isEqual(this.state.autocorrect, prevState.autocorrect) ||
			!_.isEqual(this.state.presearchFile, prevState.presearchFile) ||
			!_.isEqual(this.state.presearchTitle, prevState.presearchTitle) ||
			!_.isEqual(this.state.presearchTopic, prevState.presearchTopic) ||
			!_.isEqual(this.state.presearchOrg, prevState.presearchOrg) )
			) {
			const newDataRows = this.getDropdownData(this.state.searchText);
			this.setState({ dataRows: newDataRows});
		}
		if ( this.props.searchText !== prevProps.searchText ) {
			this.setState({ searchText: this.props.searchText });
		}
	}

	debouncedFetchSearchSuggestions = async (value) => {
		try {
			const index = this.props.cloneData?.clone_data?.esCluster ?? '';
			const { data } = await gameChangerAPI.getTextSuggestion({ index, searchText: value });
			this.setState({ autocorrect: data?.autocorrect?.map(item => ({ text: item })) ?? [], 
			presearchFile: data?.presearchFile?.map(item => ({ text: item })) ?? [], 
			presearchTitle: data?.presearchTitle?.map(item => ({ text: item })) ?? [],
			presearchTopic: data?.presearchTopic?.map(item => ({ text: item })) ?? [],
			presearchOrg: data?.presearchOrg?.map(item => ({ text: item })) ?? [],
			predictions: data?.predictions?.map(item => ({ text: item })) ?? []});
		} catch (e) {
			console.log('debouncedFetchSearchSuggestions err', e);
		}
	}

	onKeyDown = (event) => {
		if(event.key === 'Enter') {
			this.props.handleSearch();
		}
	}

	handleKeyDown(e) {
		let data = [];
		this.state.dataRows.forEach(item => {
			item.rows.forEach((row) => {
				data.push(row.text);
			});
		});
		// arrow up/down button should select next/previous list element
		if(e.keyCode === 38 || e.keyCode === 40) {
			e.preventDefault(); // keep cursor at front 
		}
		if(e.keyCode === 40 && this.state.cursor === null && data[0] !== undefined ){
			this.setState({cursor: 0, originalText: this.state.searchText});
			this.setState({searchText:data[0].toLowerCase()})
		}
		else if(e.keyCode === 38 && this.state.cursor === null && data[0] !== undefined ){
			this.setState({cursor: data.length-1, originalText: this.state.searchText});
			this.setState({searchText:data[data.length-1].toLowerCase()})
		}
		else if (e.keyCode === 38 && this.state.cursor === 0) {
			this.setState({cursor: null, originalText: null, searchText: this.state.originalText}); // return to original state
		}
		else if (e.keyCode === 38 && this.state.cursor > 0) {
			this.setState( prevState => ({ cursor: prevState.cursor - 1}));
			this.setState({searchText: data[this.state.cursor - 1].toLowerCase()})
		} 
		else if (e.keyCode === 40 && this.state.cursor < data.length -1 ) {
			this.setState( prevState => ({ cursor: prevState.cursor + 1}));
			this.setState({searchText: data[this.state.cursor + 1].toLowerCase()})
		}
		else if (e.keyCode === 40 && this.state.cursor === data.length-1 ) {
			this.setState({cursor: null, originalText: null, searchText: this.state.originalText}); // return to original state by wrapping
		}
	}


	handleFavoriteSearchClicked = (anchorEL, favorite) => {
		const { searchFavoritePopperOpen } = this.state;

		if (favorite) {
			this.handleSaveSearch(false)
			return;
		}

		if (!searchFavoritePopperOpen) {
			if (this.props.checkUserInfo()) {
				return;
			}
			this.setState({ searchFavoritePopperOpen: true, searchFavoritePopperAnchorEl: anchorEL });
		} else {
			this.setState({ searchFavoritePopperOpen: false, searchFavoritePopperAnchorEl: null });
		}
	}

	handleSaveSearch = (favorite) => {
		this.props.saveFavoriteSearch(this.state.favoriteName, this.state.favoriteSummary, favorite);
		this.setState({ favoriteName: '', favoriteSummary: '', searchFavoritePopperOpen: false, searchFavoritePopperAnchorEl: null });
	}

	handleOnType = (event) => {
		const { target: { value } } = event;
		if (value && value.length > 3) {
			if(this.state.cursor !== null){
				this.setState({cursor: null, originalText: null}); // return to typing state
			}
			this.debouncedFetchSearchSuggestions(value);
		} else {
			this.clearLiveSuggestions();
		}

		this.setState({ searchText: value });
	}

	clearLiveSuggestions = () => {
		this.setState({
			autocorrect: [],
			predictions: [],
			presearchFile: [],
			presearchOrg: [],
			presearchTopic: [],
			presearchTitle: []
		})
	}

	handleRowPressed = ({ text, rowType }) => {
		this.props.handleSearchTextUpdate(text, true);
		this.setState({searchText: text});
		document.activeElement.blur();

		if (rowType) {
			trackEvent(getTrackingNameForFactory(this.props.cloneData), 'SearchSuggestionSelected', rowType, text)
		}
	}

	handleOnBlur = (event) => {
		this.setState({cursor: null, originalText: null });
	}

	handleSubmit = (event) => {
		if (event) {
			event.preventDefault();
		}
		this.props.handleSearchTextUpdate(this.state.searchText, true);
		document.activeElement.blur();
	}

	getDropdownData = (searchText) => {
		let data = [];
		let textArray = [];
		// order of suggestions in dropdwon
		if (searchText.length > 0 && this.state.autocorrect?.length > 0) {
			const rows = [];
			this.state.autocorrect.forEach(o => {
				if(textArray.findIndex(item => item === o.text.toLowerCase()) === -1){ // if current item is not in textArray
					rows.push(o);
					textArray.push(o.text.toLowerCase());
				}
			});
			data.push({
				IconComponent: Search,
				rows: rows,
				handleRowPressed: this.handleRowPressed,
				rowType: 'autocorrect'
			});
		}
		if (searchText.length > 0 && this.state.presearchFile?.length > 0) {
			const rows = [];
			this.state.presearchFile.forEach(o => {
				if(textArray.findIndex(item => item === o.text.toLowerCase()) === -1){ // if current item is not in textArray
					rows.push(o);
					textArray.push(o.text.toLowerCase());
				}
			});
			data.push({
				IconComponent: Search,
				rows: rows,
				handleRowPressed: this.handleRowPressed,
				rowType: 'presearchFile'
			});
		}
		if (searchText.length > 0 && this.state.presearchTitle?.length > 0) {
			const rows = [];
			this.state.presearchTitle.forEach(o => {
				if(textArray.findIndex(item => item === o.text.toLowerCase()) === -1){ // if current item is not in textArray
					rows.push(o);
					textArray.push(o.text.toLowerCase());
				}
			});
			data.push({
				IconComponent: Search,
				rows: rows,
				handleRowPressed: this.handleRowPressed,
				rowType: 'presearchTitle'
			});
		}
		if (searchText.length > 0 && this.state.predictions?.length > 0) {
			const rows = [];
			this.state.predictions.forEach(o => {
				if(textArray.findIndex(item => item === o.text.toLowerCase()) === -1){ // if current item is not in textArray
					rows.push(o);
					textArray.push(o.text.toLowerCase());
				}
			});
			data.push({
				IconComponent: Search,
				rows: rows,
				handleRowPressed: this.handleRowPressed,
				rowType: 'predictions'
			});
		}
		if (searchText.length > 0 && this.state.presearchTopic?.length > 0) {
			const rows = [];
			this.state.presearchTopic.forEach(o => {
				if(textArray.findIndex(item => item === o.text.toLowerCase()) === -1){ // if current item is not in textArray
					rows.push(o);
					textArray.push(o.text.toLowerCase());
				}
			});
			data.push({
				IconComponent: Search,
				rows: rows,
				handleRowPressed: this.handleRowPressed,
				rowType: 'presearchTopic'
			});
		}
		if (searchText.length > 0 && this.state.presearchOrg?.length > 0) {
			const rows = [];
			this.state.presearchOrg.forEach(o => {
				if(textArray.findIndex(item => item === o.text.toLowerCase()) === -1){ // if current item is not in textArray
					rows.push(o);
					textArray.push(o.text.toLowerCase());
				}
			});
			data.push({
				IconComponent: Search,
				rows: rows,
				handleRowPressed: this.handleRowPressed,
				rowType: 'presearchOrg'
			});
		}
		if ((this.state.userSearchHistory?.length > 0) && (searchText.length === 0)){
			let filteredRows = this.state.userSearchHistory;
			// if scrolling using arrow keys, use original text
			const textToUse = this.state.originalText === null ? searchText : this.state.originalText;
			// filter rows to make sure it includes
			filteredRows = _.filter(filteredRows, (o) =>  o.text.toLowerCase().includes(textToUse.toLowerCase()));
			data.push({
				IconComponent: AccessTime,
				rows: searchText.length > 0 ? filteredRows : this.state.userSearchHistory, // if there's no text, give all the history
				handleRowPressed: this.handleRowPressed,
				rowType: 'user_search_history',
				// for future feature where history can be removed from suggestions
				// handleDeletePressed: this.handleHistoryDelete,
			})
		}
		return data;
	}

	render() {
		const {
			searchText,
			componentStepNumbers,
			// rawSearchResults,
			favorite,
			isEDA
		} = this.props;
		const classes = this.props.classes;

		return (
			<div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: "relative" }}>

				<SearchBarForm
					id="GamechangerSearchBarForm"
					className={componentStepNumbers ? `tutorial-step-${componentStepNumbers["Search Input"]}` : null}
					onSubmit={this.handleSubmit}
					autoComplete="off"
					onKeyDown={this.handleKeyDown}
				>
					<SearchBarInput
						type="text"
						value={this.state.searchText}
						onChange={this.handleOnType}
						onBlur={this.handleOnBlur}
						placeholder="Search..."
						id="gcSearchInput"
					/>

					{!isEDA &&
						<GCTooltip title={'Favorite a search to track in the User Dashboard'} placement='top' arrow>
							<button
								type="button"
								style={{ border: inputBorder, borderLeft: 'none', height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: '0 15px' }}
								onClick={(event) => this.handleFavoriteSearchClicked(event.target, favorite)}
							>
								<i className={favorite ? "fa fa-star" : "fa fa-star-o"} style={{
									color: favorite ? "#E9691D" : 'rgb(224, 224, 224)',
									cursor: "pointer",
									fontSize: 26
								}} />
							</button>
						</GCTooltip>
					}
					{!isEDA && <SearchBarDropdown searchText={searchText} rowData={this.state.dataRows} cursor={this.state.cursor} /> }
					
				</SearchBarForm>
				
				<SearchButton id="gcSearchButton" onClick={this.handleSubmit}>
					<i className="fa fa-search" />
				</SearchButton>

				<Popover onClose={() => { this.handleFavoriteSearchClicked(null); }}
					open={this.state.searchFavoritePopperOpen} anchorEl={this.state.searchFavoritePopperAnchorEl}
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
								value={this.state.favoriteName}
								onChange={(event) => { this.setState({ favoriteName: event.target.value }); }}
								className={classes.textField}
								margin='none'
								size='small'
								variant='outlined'
							/>
							<TextField
								label={'Favorite Summary'}
								value={this.state.favoriteSummary}
								onChange={(event) => { this.setState({ favoriteSummary: event.target.value }); }}
								className={classes.textArea}
								margin='none'
								size='small'
								variant='outlined'
								multiline={true}
								rows={4}
							/>
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<GCButton
									onClick={() => this.handleSaveSearch(true)}
									style={{ height: 40, minWidth: 40, padding: '2px 8px 0px', fontSize: 14, margin: '16px 0px 0px 10px' }}
								>Save
								</GCButton>
								<GCButton
									onClick={() => this.handleFavoriteSearchClicked(null)}
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
}

export default withStyles(useStyles)(GameChangerSearchBar)
