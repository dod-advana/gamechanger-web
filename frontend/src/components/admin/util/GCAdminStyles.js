import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import styled from 'styled-components';
import { PageLink } from '@dod-advana/advana-side-nav/dist/SlideOutMenu';

import GamechangerTextIcon from '../../../images/icon/GamechangerText.png';
import {
	primary,
	backgroundWhite,
	backgroundGreyLight,
	backgroundGreyDark,
	gcOrange,
} from '../../common/gc-colors';

const styles = {
	sectionHeader: {
		fontSize: '16px',
		fontWeight: '600',
		fontFamily: 'Noto Sans',
		marginLeft: 40,
		marginTop: 40,
	},
	sectionFooter: {
		fontSize: '14px',
		fontWeight: '600',
		fontFamily: 'Noto Sans',
		marginLeft: 40,
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
		zIndex: 101,
	},
	feature: {
		display: 'flex',
		flexDirection: 'column',
		width: 'fit-content',
	},
	image: {
		display: 'flex',
		justifyContent: 'center',
		margin: 'auto',
		height: 30,
		color: backgroundWhite,
	},
	paper: {
		backgroundColor: primary,
		borderRadius: '50%',
		height: 150,
		width: 150,
		paddingTop: 25,
		marginRight: 30,
		marginBottom: 30,
		cursor: 'pointer',
		boxShadow: ' rgb(0 0 0 / 16%) 0px 3px 10px, rgb(0 0 0 / 23%) 0px 3px 10px',
	},
	featureName: {
		color: 'white',
		fontSize: 16,
		textAlign: 'center',
		fontFamily: 'Roboto, sans-serif',
		textTransform: 'uppercase',
		fontWeight: 900,
		margin: '5px 5px 0 5px',
	},
	featureNameLink: {
		color: 'white',
	},
	applicationsRow: {
		marginTop: 40,
		marginLeft: 40,
		//justifyContent: 'space-evenly'
	},
	modalHeaders: {
		width: '100%',
		padding: '10px 20px 20px 0',
		fontSize: '20px',
	},
	modalSubHeaders: {
		width: '100%',
		padding: '10px 20px 20px 0',
		fontSize: '16px',
	},
	esIndexModal: {
		content: {
			position: 'absolute',
			top: '120px',
			left: '400px',
			right: '400px',
			bottom: '420px',
			backgroundColor: 'white',
			borderRadius: '8px',
			boxShadow: '-8px 8px 12px 12px rgba(0, 0, 0, 0.5)',
			zIndex: 9999,
			height: 600,
		},
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
		justifyContent: 'center',
	},
	tabSelectedStyle: {
		border: '1px solid transparent',
		backgroundColor: gcOrange,
		borderColor: 'none',
		color: 'white',
	},
	checkbox: {
		padding: 9,
	},
	backgroundGreyLight: backgroundGreyLight,
};
const toolTheme = {
	menuBackgroundColor: '#171A23',
	logoBackgroundColor: '#000000',
	openCloseButtonBackgroundColor: '#000000',
	allAppsBackgroundColor: '#171A23',
	openCloseIconColor: '#FFFFFF',
	sectionSeparatorColor: '#323E4A',
	fontColor: '#FFFFFF',
	hoverColor: '#E9691D',
	toolLogo: (
		<PageLink href="#/gamechanger">
			<img src={GamechangerTextIcon} href="#/gamechanger" alt="tool logo" />
		</PageLink>
	),
	toolIconHref: '#/gamechanger',
};

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		flexWrap: 'wrap',
		margin: '0 20px',
	},
	textField: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		width: '40ch',
		'& .MuiFormHelperText-root': {
			fontSize: 12,
		},
	},
	textFieldWide: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		minWidth: '50ch',
		'& .MuiFormHelperText-root': {
			fontSize: 12,
		},
	},
	dialogLg: {
		maxWidth: '1200px',
		minWidth: '1200px',
	},
	closeButton: {
		position: 'absolute',
		right: '0px',
		top: '0px',
		height: 60,
		width: 60,
		color: 'black',
		backgroundColor: styles.backgroundGreyLight,
		borderRadius: 0,
	},
}));

const GCCheckbox = withStyles({
	root: {
		color: '#E9691D',
		'&$checked': {
			color: '#E9691D',
		},
	},
	checked: {},
})((props) => <Checkbox color="default" {...props} />);

const TableRow = styled.div`
	text-align: left;
	height: 35px;
`;

export { styles, TableRow, GCCheckbox, useStyles, toolTheme };
