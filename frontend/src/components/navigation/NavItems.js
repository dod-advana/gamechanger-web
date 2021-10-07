import styled from 'styled-components';

export const NavItem = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	padding: 6px 20px 6px 20px;
	font-size: 16px;
	font-family: Montserrat;
	color: white;
`;

export const HoverNavItem = styled(NavItem)`
	cursor: pointer;
	justify-content: ${(props) => (props.centered ? 'center' : 'auto')};
	background-color: ${(props) =>
		props.active
			? props.toolTheme.hoverColor
			: props.toolTheme.menuBackgroundColor};

	&:hover {
		background-color: ${(props) => props.toolTheme.hoverColor};
		color: white;
	}
`;
