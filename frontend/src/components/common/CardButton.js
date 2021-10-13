import styled from 'styled-components';
import grey from '@material-ui/core/colors/grey';

export const CardButton = styled.a`
	border: 1px solid #b0b9be;
	border-radius: 6px;
	padding: 10px 20px;
	background-color: ${({ disabled }) => (disabled ? grey[400] : '#FFFFFF')};
	color: '#8091A5 !important';
	font-weight: bold;
	font-size: 16px;
	font-family: 'Montserrat';
	text-decoration: none;
	&:hover {
		text-decoration: none;
		color: '#8091A5 !important';
	}
`;
