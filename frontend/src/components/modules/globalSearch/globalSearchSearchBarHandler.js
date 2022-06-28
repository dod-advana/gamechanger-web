import React from 'react';
import { SearchBarForm, SearchBarInput, SearchButton } from '../../searchBar/SearchBarStyledComponents';
import SearchBarDropdown from '../../searchBar/SearchBarDropdown';

const GlobalSearchSearchBarHandler = {
	debouncedFetchSearchSuggestions() {},
	getSearchBar(props) {
		const {
			state,
			advancedSearchOpen,
			dropdownOpen,
			ref,
			handleSubmit,
			handleKeyDown,
			handleOnType,
			handleOnBlur,
			searchText,
			setDropdownOpen,
			dataRows,
			cursor,
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
						<SearchBarDropdown searchText={searchText} rowData={dataRows} cursor={cursor} />
					)}
				</SearchBarForm>
				<SearchButton id="gcSearchButton" onClick={handleSubmit}>
					<i className="fa fa-search" />
				</SearchButton>
			</div>
		);
	},
};

export default GlobalSearchSearchBarHandler;
