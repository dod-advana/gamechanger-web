import styled from 'styled-components';

export const CloseButton = styled.div`
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

export const StyledNavBar = styled.div`
	width: 100%;
	display: flex;
	height: 65px;
	background-color: #eff2f6;
	align-items: center;
	justify-content: center;
	padding-left: 30px;
`;

export const StyledNavContainer = styled.div`
	width: 75%;
	display: flex;
	flex-direction: row;
	height: 97%;
	flex: 5;
`;

export const StyledSideNavContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
`;

export const StyledNavButton = styled.div`
    background-color: ${({ selected }) => (selected ? '#1C2D64' : '')};
    color: ${({ selected }) => (selected ? 'white' : '#8A9AAD')};
    padding: 5px 18px
    font-weight: 600;
    border-left: ${({ first }) => (first ? '' : '2px solid white')}
    border-right: ${({ last }) => (last ? '' : '2px solid white')}
    text-align: center;
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 13px;
`;

export const StyledContainer = styled.div`
	display: flex;
	width: 100%;
	height: 100%;
`;

export const StyledLeftContainer = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	padding: 20px 10px 20px 25px;
`;

export const StyledMainContainer = styled.div`
	display: flex;
	flex: 2;
	flex-direction: column;
	padding: 20px;
	max-height: 1165px;
`;

export const StyledRightContainer = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	padding: 20px;
`;

export const StyledAccordionDiv = styled.div`
	padding: ${({ padding }) => padding ?? '0'};
	width: 100%;
`;

export const StyledAIText = styled.div`
	padding: 10px 30px;
`;

export const StyledReviewContainer = styled.div`
	display: flex;
`;

export const StyledReviewLeftContainer = styled.div`
	display: flex;
	flex: 3;
	flex-direction: column;
	padding: 20px;
`;

export const StyledReviewRightContainer = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	padding: 20px;
`;

export const StyledTableContainer = styled.div`
	padding: 20px;
	display: flex;
	flex-direction: column;
	width: 100%;
	text-align: left;
`;

export const StyledAccordionContainer = styled.div`
	width: 100%;
	margin: 0 0 15px 0;
`;

export const StyledTableKeyContainer = styled.div`
	width: 100%;
	height: 100%;
	padding: 10px;
`;

export const StyledTableValueContainer = styled.div`
	padding: 15px;
`;

export const StyledCheckboxContainer = styled.div`
	display: flex;
	flex-direction: column;
	margin: 10px 0;
`;

export const StyledInlineContainer = styled.div`
	display: flex;
	align-items: center;
	margin: 20px 0;
	justify-content: ${({ justifyContent }) => justifyContent ?? 'space-between'};
`;

export const StyledFooterDiv = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin-top: 10px;
`;

export const StyledAccordionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
`;

export const ButtonStyles = {
	main: { color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '35px', fontSize: 14 },
	submit: { color: 'white', backgroundColor: '#1C2D64', borderColor: '#1C2D64', height: '35px', fontSize: 14 },
};
