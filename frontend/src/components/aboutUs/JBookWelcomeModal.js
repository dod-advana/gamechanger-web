import React, { useEffect, useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	Checkbox,
	FormControlLabel,
	Link,
	makeStyles,
	withStyles,
} from '@material-ui/core';
import styled from 'styled-components';
import CloseIcon from '@material-ui/icons/Close';
import MainLogo from '../../images/logos/JBooks Logo_wht.svg';
import JAICLogo from '../../images/logos/JAIC_wht.png';
import CONFIG from '../../config/config';
import { setState } from '../../utils/sharedFunctions';

const CloseButton = styled.div`
	padding: 6px;
	background-color: transparent;
	border-radius: 4px;
	color: #ffffff !important;
	border: 1px solid #b0b9be;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 0.4;
	position: absolute;
	right: 50px;
	top: 30px;

	& .MuiSvgIcon-root {
		font-size: 40px !important;
	}
`;

const CustomColorCheckbox = withStyles({
	root: {
		color: '#ffffff',
		'&$checked': {
			color: '#ffffff',
		},
		'& .MuiSvgIcon-root': { fontSize: 28 },
	},
	checked: {},
})((props) => <Checkbox color="default" {...props} />);

const AGREEMENT_KEY = 'data.mil-do-not-show-welcome';

const CONSENT_KEY = 'data.mil-consent-agreed';

const getConsentIsOpen = () => {
	let lastAgreement = localStorage.getItem(CONSENT_KEY);
	if (!lastAgreement) return true;

	try {
		const twoHoursAgo = Date.now() - 1000 * 60 * 60 * 2;
		return new Date(lastAgreement) < twoHoursAgo;
	} catch (err) {
		console.error(err);
		return true;
	}
};

const getIsOpen = (dispatch, state) => {
	if (getConsentIsOpen()) return false;
	let hideWelcome = localStorage.getItem(AGREEMENT_KEY);
	if (!hideWelcome) {
		return true;
	} else {
		return hideWelcome !== 'true';
	}
};

const JBookWelcome = (props) => {
	const { dispatch, state } = props;

	const classes = useStyles();

	const [isOpen, setIsOpen] = useState(false);
	const [hideWelcome, setHideWelcome] = useState(false);

	useEffect(() => {
		const tempIsOpen = getIsOpen(dispatch, state);
		if (tempIsOpen && isOpen !== tempIsOpen) {
			setState(dispatch, { welcomeModalClosed: false });
			setIsOpen(true);
		} else if (!tempIsOpen && isOpen !== tempIsOpen) {
			setState(dispatch, { welcomeModalClosed: true });
			setIsOpen(false);
		} else {
			setState(dispatch, { welcomeModalClosed: true });
		}
		// eslint-disable-next-line
	}, []);

	const handleClose = () => {
		localStorage.setItem(AGREEMENT_KEY, hideWelcome.toString());
		setIsOpen(false);
		setState(dispatch, { welcomeModalClosed: true });
	};

	return (
		<Dialog
			open={isOpen}
			maxWidth="md"
			disableBackdropClick={true}
			disableEscapeKeyDown={true}
			classes={{
				root: classes.dialogRoot,
				paperWidthMd: classes.dialogMD,
			}}
		>
			<DialogTitle disableTypography style={{ margin: '0 50px', borderBottom: `1px solid ${'#3B4F89'}` }}>
				<div style={styles.titleBar}>
					<img src={MainLogo} style={styles.title} alt="jbook-title" id={'titleButton'} />
					<div style={styles.jaicTitleStyle}>
						<Typography style={styles.jaicText}>in partnership with</Typography>
						<img src={JAICLogo} style={styles.jaicImage} alt="jaic-title" id={'titleButton'} />
					</div>
				</div>
				<CloseButton onClick={() => handleClose()} style={{ margin: 'auto' }}>
					<CloseIcon fontSize="large" />
				</CloseButton>
			</DialogTitle>
			<DialogContent style={{ margin: '20px 50px 0px 50px' }}>
				<Typography variant="body2" style={styles.welcomeParagraphText}>
					For optimal experience, this application is best accessed by Google Chrome or Firefox
				</Typography>
				<Typography variant="body2" style={styles.welcomeParagraphText}>
					Welcome to the Joint Artificial Intelligence Center (JAIC) Artificial Intelligence Inventory and
					Portfolio Analysis Tool, JBOOK Search. We are committed to continue providing information and
					enabling services to DoD artificial intelligence (AI) leaders. As part of this, we are completing
					Phase II of the DoD AI Inventory, which will unify budget, contracting, requirements, and program
					point-of-contact data into a single, secure database. Currently, the tool’s workflow is specific to
					JAIC reviewers and users supporting their AI inventory review process. This Phase II version will
					provide the most comprehensive, accurate, organized, and useful picture of the DoD AI Portfolio. We
					are empowering DoD and Military Service Leadership with needed information and insights to make
					informed decisions.{' '}
				</Typography>
				<Typography variant="body2" style={styles.welcomeParagraphAssistance}>
					Need Further Assistance?
				</Typography>
				<Link style={{ color: '#E6E6E6' }} href={CONFIG.HELP_DESK_LINK}>
					Submit a help desk ticket here.
				</Link>
				<div style={{ marginTop: 15 }}>
					<FormControlLabel
						name={'dont-show-message'}
						value={"Don't show this message again"}
						z
						control={
							<CustomColorCheckbox
								onClick={(e) => setHideWelcome(e.target.checked)}
								// icon={<Checkbox />}
								checked={hideWelcome}
								//checkedIcon={<i style={{color:'#E9691D'}} className="fa fa-check"/>}
								name={'dont-show-checkbox'}
							/>
						}
						label={<span style={styles.checkboxLabel}>{"Don't show this message again"}</span>}
						labelPlacement="end"
					/>
				</div>
			</DialogContent>
			<DialogActions></DialogActions>
		</Dialog>
	);
};

const styles = {
	welcomeParagraphText: {
		marginBottom: 15,
		color: '#ffffff',
		fontFamily: 'Noto Sans',
		fontSize: 20,
	},
	welcomeParagraphAssistance: {
		color: '#E6E6E6',
		fontFamily: 'Noto Sans',
		textTransform: 'uppercase',
		fontSize: 14,
	},
	checkboxLabel: {
		fontSize: '16px',
		fontFamily: 'Noto Sans',
		color: '#FFFFFF',
	},
	title: {
		padding: '20px 0',
	},
	jaicTitleStyle: {
		display: 'flex',
		alignItems: 'center',
	},
	jaicImage: {
		height: 60,
	},
	titleBar: {
		display: 'flex',
	},
	jaicText: {
		color: '#ffffff',
		alignSelf: 'center',
		margin: '0 20px',
		fontFamily: 'Montserrat',
		fontWeight: 'bold',
		fontSize: 14,
		paddingTop: 12,
	},
};

const useStyles = makeStyles((theme) => ({
	dialogRoot: { zIndex: '1290 !important' },
	dialogMD: {
		// maxWidth: '1920px',
		minWidth: '1200px',
		backgroundColor: '#1C2D65',
		// height: 850,
		border: `1px solid ${'#707070'}`,
		boxShadow: `0px 0px 39px ${'#172E5F'}`,
	},
}));

export default JBookWelcome;
