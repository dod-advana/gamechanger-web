import React from 'react';
import _ from 'underscore';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';

const muiStyles = (theme) => ({
	dialog: {},
	root: {
		margin: 0,
		padding: theme.spacing(2),
		display: 'flex',
		justifyContent: 'space-between',
	},
	closeButton: {
		position: 'absolute',
		right: theme.spacing(1),
		top: theme.spacing(1),
		color: theme.palette.grey[500],
	},
});

const styles = {
	close: {
		cursor: 'pointer',
		marginRight: -10,
		marginTop: -10,
		height: 45,
		padding: '10px 15px',
		backgroundColor: 'lightgrey',
	},
	modalCloseIcon: {
		cursor: 'pointer',
		fontSize: '20px',
	},
};

const DialogTitle = withStyles(muiStyles)((props) => {
	const { children, classes, onClose, ...other } = props;
	return (
		<MuiDialogTitle disableTypography className={classes.root} {...other}>
			<Typography variant="h3" style={{ marginTop: 10, marginLeft: 10 }}>
				{children}
			</Typography>
			{onClose && (
				<div
					style={styles.close}
					onClick={(e) => {
						e.preventDefault();
						onClose();
					}}
				>
					<i
						style={styles.modalCloseIcon}
						className="fa fa-times"
						aria-hidden="true"
					></i>
				</div>
			)}
		</MuiDialogTitle>
	);
});

const DialogContent = withStyles((theme) => ({
	root: {
		padding: '0px 20px',
	},
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
	root: {
		margin: 0,
		padding: 20,
	},
}))(MuiDialogActions);

const contentStyle = {
	minHeight: 80,
	minWidth: 650,
	display: 'flex',
};

export default function BetaModal({
	onCancelClick = _.noop,
	onLegacyClick = _.noop,
	onBetaClick = _.noop,
	open = false,
}) {
	return (
		<div>
			<Dialog maxWidth={'md'} onClose={onCancelClick} open={open}>
				<DialogTitle onClose={onCancelClick}>Try Beta Version!</DialogTitle>
				<DialogContent>
					<div style={contentStyle}>
						<Typography variant="body2">
							Would you like to try this app with the new Beta Version?
						</Typography>
					</div>
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" onClick={onCancelClick}>
						Cancel
					</Button>
					<Button variant="contained" onClick={onLegacyClick} color="secondary">
						Use Legacy App
					</Button>
					<Button
						variant="contained"
						autoFocus
						onClick={onBetaClick}
						color="primary"
					>
						Try New Beta Version
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
