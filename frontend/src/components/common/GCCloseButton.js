import React from 'react';
import styled from 'styled-components';
import CloseIcon from '@material-ui/icons/Close';

const CloseButton = styled.div`
	padding: 6px;
	background-color: white;
	border-radius: 5px;
	color: #8091a5 !important;
	border: 1px solid #b0b9be;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 0.4;
	position: absolute;
	right: 15px;
	top: 15px;
`;

export default function GCCloseButton({ onClick }) {
	return (
		<CloseButton onClick={() => onClick()}>
			<CloseIcon fontSize="large" />
		</CloseButton>
	);
}
