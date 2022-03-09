import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { setState } from '../../../utils/sharedFunctions';
import { JBookContext } from './jbookContext';

const StyledInput = styled.input`
    width: 100%;
`;

const InputFilter = (props) => {
	const {
		setJBookSetting,
		field
	} = props;

	const context = useContext(JBookContext);
	const { state, dispatch } = context;

	const [searchText, setSearchText] = useState(state.jbookSearchSettings[field]);

	const useDebounce = (value, delay) => {
		const [debouncedValue, setDebouncedValue] = useState(value);
		useEffect(() => {
			const handler = setTimeout(() => { setDebouncedValue(value) }, delay);
			return () => { clearTimeout(handler) };
		}, [value, delay]);
		return debouncedValue;
	};
	const debouncedSearchTerm = useDebounce(searchText, 500);

	useEffect(() => {
		if (!state.initial) {
			setJBookSetting(field, debouncedSearchTerm.trim(), state, dispatch);
			setState(dispatch, { runSearch: true, loading: true });
		}
		// eslint-disable-next-line
	}, [debouncedSearchTerm]);


	useEffect(() => {
		if (state.jbookSearchSettings[field] === '') {
			setSearchText(state.jbookSearchSettings[field]);
		} // eslint-disable-next-line
	}, [state.jbookSearchSettings[field]]);



	return (
		<StyledInput
			onChange={(event) => {
				if (!state.runSearch) {
					setSearchText(event.target.value);
				}
			}}
			value={searchText}
		/>
	);
};

export default InputFilter;
