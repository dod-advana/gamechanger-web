import React from 'react';
import { SearchBarForm, SearchBarInput, SearchButton } from '../../searchBar/SearchBarStyledComponents';
import SearchBarDropdown from '../../searchBar/SearchBarDropdown';
import GCButton from '../../common/GCButton';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import { setState } from '../../../utils/sharedFunctions';
import { PAGE_DISPLAYED } from '../../../utils/gamechangerUtils';

const jbookSearchBarHandler = {
	async debouncedFetchSearchSuggestions(
		_value,
		_cloneData,
		_setAutocorrect,
		_setPresearchTitle,
		_setPresearchTopic,
		_setPresearchOrg,
		_setPredictions
	) {
		try {
			// do nothing
		} catch (e) {
			console.log('default debouncedFetchSearchSuggestions err', e);
		}
	},
	getSearchBar(props) {
		const {
			state,
			dispatch,
			classes,
			searchFavoritePopperAnchorEl,
			advancedSearchOpen,
			dropdownOpen,
			ref,
			handleSubmit,
			handleKeyDown,
			handleOnType,
			handleOnBlur,
			searchText,
			setDropdownOpen,
			handleFavoriteSearchClicked,
			dataRows,
			cursor,
			searchFavoritePopperOpen,
			favoriteName,
			setFavoriteName,
			setFavoriteSummary,
			favoriteSummary,
			handleSaveSearch,
		} = props;

		const handleSearchFromOtherPages = () => {
			// if user is searching from a page other than the main page,
			// navigate to main page first to show results
			if (state.pageDisplayed !== PAGE_DISPLAYED.main) {
				window.history.pushState(null, document.title, `/#/jbook`);
				setState(dispatch, { pageDisplayed: PAGE_DISPLAYED.main });
			}
		};

		const jbookDataRows = [];
		if (dataRows.length > 0) {
			dataRows.forEach((rowGroup) => {
				const { handleRowPressed } = rowGroup;
				jbookDataRows.push({
					...rowGroup,
					handleRowPressed: ({ text, rowType }) => {
						handleSearchFromOtherPages();
						handleRowPressed({ text, rowType });
					},
				});
			});
		}

		const jbookHandleSubmit = (event) => {
			handleSearchFromOtherPages();
			handleSubmit(event);
		};

		return (
			<div
				style={{ display: 'flex', justifyContent: 'center', margin: '0 0 0 25px', position: 'relative' }}
				ref={ref}
			>
				<SearchBarForm
					id="GamechangerSearchBarForm"
					className={
						state.componentStepNumbers
							? `tutorial-step-${state.componentStepNumbers['Search Input']}`
							: null
					}
					onSubmit={jbookHandleSubmit}
					autoComplete="off"
					onKeyDown={handleKeyDown}
				>
					<SearchBarInput
						type="text"
						value={searchText}
						onChange={handleOnType}
						onBlur={handleOnBlur}
						onFocus={() => {
							setDropdownOpen(true);
						}}
						placeholder="Search..."
						id="gcSearchInput"
					/>
					{dropdownOpen && !advancedSearchOpen && (
						<SearchBarDropdown searchText={searchText} rowData={jbookDataRows} cursor={cursor} />
					)}
				</SearchBarForm>
				<SearchButton backgroundColor={'#9E9E9E'} id="gcSearchButton" onClick={jbookHandleSubmit}>
					<i className="fa fa-search" />
				</SearchButton>

				<Popover
					onClose={handleFavoriteSearchClicked}
					open={searchFavoritePopperOpen}
					anchorEl={searchFavoritePopperAnchorEl}
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
								onChange={(event) => {
									setFavoriteName(event.target.value);
								}}
								className={classes.textField}
								margin="none"
								size="small"
								variant="outlined"
							/>
							<TextField
								label={'Favorite Summary'}
								value={favoriteSummary}
								onChange={(event) => {
									setFavoriteSummary(event.target.value);
								}}
								className={classes.textArea}
								margin="none"
								size="small"
								variant="outlined"
								multiline={true}
								rows={4}
							/>
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<GCButton
									onClick={() => handleFavoriteSearchClicked(null)}
									style={{
										height: 40,
										minWidth: 40,
										padding: '2px 8px 0px',
										fontSize: 14,
										margin: '16px 0px 0px 10px',
									}}
									isSecondaryBtn={true}
								>
									Cancel
								</GCButton>
								<GCButton
									onClick={() => handleSaveSearch(true)}
									style={{
										height: 40,
										minWidth: 40,
										padding: '2px 8px 0px',
										fontSize: 14,
										margin: '16px 0px 0px 10px',
									}}
								>
									Save
								</GCButton>
							</div>
						</div>
					</div>
				</Popover>
			</div>
		);
	},
};

export default jbookSearchBarHandler;
