import React from 'react';
import {
	SearchBarForm,
	SearchBarInput,
	SearchButton,
} from '../../searchBar/SearchBarStyledComponents';
import SearchBarDropdown from '../../searchBar/SearchBarDropdown';
import GCButton from '../../common/GCButton';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';

const GlobalSearchSearchBarHandler = {
	debouncedFetchSearchSuggestions() {},
	getSearchBar(props) {
		const {
			state,
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

		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					width: '100%',
					position: 'relative',
				}}
				ref={ref}
			>
				<SearchBarForm
					id="GamechangerSearchBarForm"
					className={
						state.componentStepNumbers
							? `tutorial-step-${state.componentStepNumbers['Search Input']}`
							: null
					}
					onSubmit={handleSubmit}
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
						<SearchBarDropdown
							searchText={searchText}
							rowData={dataRows}
							cursor={cursor}
						/>
					)}
				</SearchBarForm>
				<SearchButton id="gcSearchButton" onClick={handleSubmit}>
					<i className="fa fa-search" />
				</SearchButton>

				<Popover
					onClose={() => {
						handleFavoriteSearchClicked(null);
					}}
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

export default GlobalSearchSearchBarHandler;
