import React, { useContext, useCallback } from 'react';
import styled from 'styled-components';
import { setState } from '../../../utils/sharedFunctions';
import { JBookContext } from './jbookContext';
import _ from 'lodash';

const StyledInput = styled.input`
	width: 100%;
`;

const InputFilter = (props) => {
	const { setJBookSetting, field, style } = props;

	const context = useContext(JBookContext);
	const { state, dispatch } = context;

	const handleChange = (event) => {
		setJBookSetting(field, event.target.value.trim(), state, dispatch);
		debounce(event.target.value);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debounce = useCallback(
		_.debounce((_searchVal) => {
			// send the server request here
			setState(dispatch, { runSearch: true, loading: true });
		}, 1500),
		[]
	);

	return <StyledInput style={style} onChange={handleChange} value={state.jbookSearchSettings[field]} />;
};

export default InputFilter;
