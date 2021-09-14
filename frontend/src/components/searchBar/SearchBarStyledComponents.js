import styled from 'styled-components';
import { CloseRounded } from '@material-ui/icons';

const inputBorder = '1px solid lightgrey';

export const DropdownWrapper = styled.ul`
	background-color: white;
	border-radius: 6px;
	position: absolute;
	top: 100%;
	width: 100%;
	z-index: 1000;
	box-shadow: 0 6px 8px 3px rgba(0, 0, 0, 0.5);
	font-size: 22px;
	padding: 3px 0;
	font-family: 'Montserrat';
`;

export const AdvDropdownWrapper = styled.div`
	background-color: white;
	border-radius: 6px;
	position: absolute;
	top: 100%;
	width: 100%;
	z-index: 1000;
	box-shadow: 0 6px 8px 3px rgba(0, 0, 0, 0.5);
	font-size: 22px;
	padding: 10px;
	font-family: 'Montserrat';
`;

export const SearchBarInput = styled.input`
	flex: 1;
	height: 50px;
	font-size: 22px;
	padding-left: 36px;
	border: ${inputBorder};
	border-right: none;
	font-family: 'Montserrat';
	outline: none;
	border-top-left-radius: 5px;
	border-bottom-left-radius: 5px;
`;

export const SearchBarForm = styled.form`
	width: 100%;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	position: relative;
	flex: 1;
`;

export const Row = styled.li`
	display: flex;
	align-items: center;
	padding: 4px 8px;
	cursor: pointer;
	justify-content: space-between;
	list-style-type: none;

	&:hover,
	:focus,
	:focus-within {
		outline: none;
		background-color: gainsboro;
	}
	&.cursor {
		outline: none;
		background-color: gainsboro;
	}
	&.bold {
		font-weight: bold;
	}
`;

export const IconTextWrapper = styled.div`
	display: flex;
	align-items: center;
`;

export const DeleteButton = styled(CloseRounded)`
	cursor: pointer;
	border-radius: 50%;

	&:hover {
		background-color: gray;
	}
`;

export const Beta = styled.div`
	display: flex;
	justify-content: center;
	color: red;
	font-size: 12px;
	font-family: 'Noto Sans';
`;

export const SearchButton = styled.button`
	font-size: 24px;
	background-color: ${({ backgroundColor }) => backgroundColor ?? '#131E43'};
	color: white;
	padding: 4px 18px;
	border: none;
	border-radius: 0 5px 5px 0;
	width: 60px;
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const AdvancedSearchButton = styled.button`
	font-size: 1em;
	background-color: rgb(182, 197, 216);
	color: #131e43;
	padding: 4px 18px;
	border: none;
	width: 150px;
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const DidYouMean = styled.span`
	color: blue;
	cursor: pointer;
	font-style: italic;
	font-weight: 500;
`;

export const SuggestionText = styled.div`
	color: black;
`;
export const SubText = styled.div`
	color: grey;
	font-size: 0.75em;
`;
