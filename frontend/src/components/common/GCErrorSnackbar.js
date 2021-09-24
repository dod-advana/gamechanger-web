import React from 'react';
import PropTypes from 'prop-types';
import { Snackbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(() => ({
	root: {
		fontWeight: 600,
	},
	icon: {
		marginTop: 2,
	},
}));

function GCErrorSnackbar({ open, message, onClose, style }) {
	const classes = useStyles();

	return (
		<Snackbar
			style={style || { marginTop: 20 }}
			anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			open={open}
			autoHideDuration={4000}
			onClose={onClose}
		>
			<Alert
				classes={{ root: classes.root, icon: classes.icon }}
				elevation={6}
				variant="filled"
				severity="error"
				action={
					<IconButton color="inherit" style={{ padding: 5 }} onClick={onClose}>
						<CloseIcon fontSize="large" />
					</IconButton>
				}
			>
				{message}
			</Alert>
		</Snackbar>
	);
}

GCErrorSnackbar.propTypes = {
	open: PropTypes.bool.isRequired,
	message: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
	style: PropTypes.shape({}),
};

export default GCErrorSnackbar;
