import React from 'react';
import {
	SearchBarForm,
	SearchBarInput,
	SearchButton,
	AdvancedSearchButton,
} from '../../searchBar/SearchBarStyledComponents';
import GCTooltip from '../../common/GCToolTip';
import SearchBarDropdown from '../../searchBar/SearchBarDropdown';
import AdvancedDropdown from '../../searchBar/AdvancedDropdown';
import GCButton from '../../common/GCButton';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import { setState } from '../../../utils/sharedFunctions';
import GameChangerAPI from '../../api/gameChanger-service-api';
import UserButton from '../../searchBar/UserButton';
const gameChangerAPI = new GameChangerAPI();

const PolicySearchBarHandler = {
	async debouncedFetchSearchSuggestions(
		value,
		state,
		setAutocorrect,
		setPresearchTitle,
		setPresearchTopic,
		setPresearchOrg,
		setPredictions
	) {
		try {
			const index = state.cloneData?.clone_data?.esCluster ?? '';
			const { data } = await gameChangerAPI.getTextSuggestion({
				index,
				searchText: value,
				suggestions: true,
			});
			setAutocorrect(data?.autocorrect?.map((item) => ({ text: item })) ?? []);
			setPresearchTitle(
				data?.presearchTitle?.map((item) => ({ text: item })) ?? []
			);
			setPresearchTopic(
				data?.presearchTopic?.map((item) => ({ text: item })) ?? []
			);
			setPresearchOrg(
				data?.presearchOrg?.map((item) => ({ text: item })) ?? []
			);
			setPredictions(data?.predictions?.map((item) => ({ text: item })) ?? []);
		} catch (e) {
			console.log('Policy debouncedFetchSearchSuggestions err', e);
		}
	},
	getSearchBar(props) {
		const {
			context,
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
			hideSearchResults,
			setAdvancedSearchOpen,
			searchFavoritePopperOpen,
			favoriteName,
			setFavoriteName,
			setFavoriteSummary,
			favoriteSummary,
			handleSaveSearch,
		} = props;
		const inputBorder = '1px solid lightgrey';

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
						onClick={() => setState(dispatch, {inputActive: 'searchInput'})}
						placeholder="Search..."
						id="gcSearchInput"
					/>
					<GCTooltip
						title={'Favorite a search to track in the User Dashboard'}
						placement="top"
						arrow
					>
						<button
							type="button"
							style={{
								border: inputBorder,
								borderLeft: 'none',
								height: 50,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								backgroundColor: 'white',
								padding: '0 15px',
							}}
							onClick={(event) =>
								handleFavoriteSearchClicked(
									event.target,
									state.isFavoriteSearch
								)
							}
						>
							<i
								className={
									state.isFavoriteSearch ? 'fa fa-star' : 'fa fa-star-o'
								}
								style={{
									color: state.isFavoriteSearch
										? '#E9691D'
										: 'rgb(224, 224, 224)',
									cursor: 'pointer',
									fontSize: 26,
								}}
							/>
						</button>
					</GCTooltip>
					{dropdownOpen && !advancedSearchOpen && (
						<SearchBarDropdown
							searchText={searchText}
							rowData={dataRows}
							cursor={cursor}
						/>
					)}
					{hideSearchResults && (
						<AdvancedDropdown
							context={context}
							handleSubmit={handleSubmit}
							open={advancedSearchOpen}
							close={() => {
								setAdvancedSearchOpen(false);
							}}
						></AdvancedDropdown>
					)}
					{hideSearchResults && (
						<AdvancedSearchButton
							type="button"
							id="advancedSearchButton"
							onClick={() => {
								setAdvancedSearchOpen(!advancedSearchOpen);
							}}
						>
							Advanced
							<i className="fa fa-chevron-down" style={{ marginLeft: '5px' }} />
						</AdvancedSearchButton>
					)}
				</SearchBarForm>
				<SearchButton id="gcSearchButton" onClick={handleSubmit}>
					<i className="fa fa-search" />
				</SearchButton>

				<UserButton context={context}></UserButton>

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

export default PolicySearchBarHandler;
