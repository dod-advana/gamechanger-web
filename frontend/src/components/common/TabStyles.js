import { backgroundGreyDark, backgroundWhite, gcOrange } from './gc-colors';

const TabStyles = {
	tabsList: {
		borderBottom: `2px solid ${gcOrange}`,
		padding: 0,
		display: 'flex',
		alignItems: 'center',
		flex: 9,
		margin: '10px 30px',
	},
	tabStyle: {
		width: '140px',
		border: '1px solid',
		borderColor: backgroundGreyDark,
		borderBottom: 'none !important',
		borderRadius: `6px 6px 0px 0px`,
		position: ' relative',
		listStyle: 'none',
		padding: '2px 12px',
		cursor: 'pointer',
		textAlign: 'center',
		backgroundColor: backgroundWhite,
		marginRight: '2px',
		marginLeft: '2px',
		height: 45,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabSelectedStyle: {
		border: '1px solid transparent',
		backgroundColor: gcOrange,
		borderColor: 'none',
		color: 'white',
	},
	tabContainer: {
		alignItems: 'center',
		minHeight: '613px',
	},
	tabButtonContainer: {
		backgroundColor: '#ffffff',
		width: '100%',
		display: 'flex',
		paddingBottom: '5px',
		alignItems: 'center',
	},
	panelContainer: {
		alignItems: 'center',
		margin: '0px 80px',
		minHeight: 'calc(100vh - 600px)',
		paddingBottom: 20,
	},
};

export default TabStyles;
