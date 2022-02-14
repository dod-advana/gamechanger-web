import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { setState } from '../../../utils/sharedFunctions';
import { BudgetSearchContext } from './budgetSearchContext';

const StyledInput = styled.input`
    width: 100%;
`;

const InputFilter = (props) => {
	const {
		setBudgetSearchSetting,
		field
	} = props;

	const context = useContext(BudgetSearchContext);
	const { state, dispatch } = context;

	const [searchText, setSearchText] = useState(state.budgetSearchSettings[field]);

	const useDebounce = (value, delay) => {
		const [debouncedValue, setDebouncedValue] = useState(value);
		useEffect(() => {
			const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
			return () => { clearTimeout(handler); };
		}, [value, delay]);
		return debouncedValue;
	};
	const debouncedSearchTerm = useDebounce(searchText, 300);

	useEffect(() => {
		if (!state.initial) {
			setBudgetSearchSetting(field, debouncedSearchTerm.trim(), state, dispatch);
			setState(dispatch, { runSearch: true, loading: true }); // eslint-disable-next-line
		}
	}, [debouncedSearchTerm, dispatch, field, setBudgetSearchSetting, state]);


	useEffect(() => {
		if (state.budgetSearchSettings[field] === '') {
			setSearchText(state.budgetSearchSettings[field]);
		} // eslint-disable-next-line
	}, [state.budgetSearchSettings[field]]);



	return (
		<StyledInput
			onChange={(event) => setSearchText(event.target.value)}
			value={searchText}
		/>
	)
}

export default InputFilter;
