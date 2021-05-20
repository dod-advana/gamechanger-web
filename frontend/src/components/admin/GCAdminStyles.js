import {
	primary,
	backgroundWhite,
	backgroundGreyLight,
	backgroundGreyDark,
	gcOrange
} from '../../components/common/gc-colors';
import { typography } from 'material-ui/styles';

const styles = {
	sectionHeader: {
		fontSize: '16px',
		fontWeight: '600',
		fontFamily: "Noto Sans",
		marginLeft: 40,
		marginTop: 40
	},
	sectionFooter: {
		fontSize: '14px',
		fontWeight: '600',
		fontFamily: "Noto Sans",
		marginLeft: 40
	},
	alert: {
		padding: 15,
		marginLeft: 15,
		position: 'fixed',
		top: 140,
		width: 'calc(100% - 150px)',
		// border: '2px solid',
		display: 'flex',
		justifyContent: 'space-between',
		zIndex: 10,
	},
	features: {
		display: 'flex',
		flexDirection: 'column'
	},
	image: {
		display: 'flex',
		justifyContent: 'center',
		margin: 'auto',
		height: 30,
		color: backgroundWhite
	},
	paper: {
		backgroundColor: primary,
		height: 150,
		width: 150,
		paddingTop: 25,
		marginRight: 30,
		marginBottom: 30,
		cursor: 'pointer'
	},
	featureName: {
		color: typography.textFullWhite,
		fontSize: 16,
		textAlign: 'center',
		textTransform: 'uppercase',
		fontWeight: 900,
		margin: '5px 5px 0 5px'
	},
	featureNameLink: {
		color: typography.textFullWhite
	},
	applicationsRow: {
		marginTop: 40,
		marginLeft: 40
		//justifyContent: 'space-evenly'
	},
	modalHeaders: {
		width: '100%',
		padding: '10px 20px 20px 0',
		fontSize:'20px'
	},
	modalSubHeaders: {
		width: '100%',
		padding: '10px 20px 20px 0',
		fontSize: '16px'
	},
	esIndexModal: {
		content:{
			position: 'absolute',
			top: '120px',
			left: '400px',
			right: '400px',
			bottom: '420px',
			backgroundColor: 'white',
			borderRadius: '8px',
			boxShadow: '-8px 8px 12px 12px rgba(0, 0, 0, 0.5)',
			zIndex: 9999,
			height: 600
		}
	},
	tabsList: {
		borderBottom: `2px solid ${gcOrange}`,
		padding: 0,
		display: 'flex',
		alignItems: 'center',
		flex: 9,
	},
	tabStyle: {
		width: '185px',
		border: '1px solid', 
		borderColor: backgroundGreyDark, 
		borderBottom: 'none !important',
		borderRadius: `5px 5px 0px 0px`,
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
		justifyContent: 'center'
	},
	tabSelectedStyle: {
		border: '1px solid transparent',
		backgroundColor: gcOrange,
		borderColor: 'none',
		color: 'white',
	},
	checkbox: {
		padding: 9
	},
    backgroundGreyLight:backgroundGreyLight
}

export default styles;
