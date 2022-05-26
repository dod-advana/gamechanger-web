import React, { useContext, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { setState } from '../../../utils/sharedFunctions';
import { JBookContext } from './jbookContext';
import _ from 'lodash';

const StyledInput = styled.input`
	width: 100%;
`;

const InputFilter = (props) => {
	const { setJBookSetting, field } = props;

	const context = useContext(JBookContext);
	const { state, dispatch } = context;

	const [searchText, setSearchText] = useState(state.jbookSearchSettings[field]);

	const handleChange = (event) => {
		setSearchText(event.target.value);
		debounce(event.target.value);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debounce = useCallback(
		_.debounce((_searchVal) => {
			// send the server request here
			if (!state.initial) {
				setJBookSetting(field, _searchVal.trim(), state, dispatch);
				setState(dispatch, { runSearch: true, loading: true });
			}
		}, 1500),
		[]
	);
	// useEffect(() => {
	// 	console.log(debouncedSearchTerm);
	// 	if (!state.initial) {
	// 		setJBookSetting(field, debouncedSearchTerm.trim(), state, dispatch);
	// 		setState(dispatch, { runSearch: true, loading: true });
	// 	}
	// }, [debouncedSearchTerm]);

	useEffect(() => {
		if (state.jbookSearchSettings[field] === '') {
			setSearchText(state.jbookSearchSettings[field]);
		} // eslint-disable-next-line
	}, [state.jbookSearchSettings[field]]);

	return <StyledInput onChange={handleChange} value={searchText} />;
};

export default InputFilter;
