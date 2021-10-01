import GamechangerLogo from '../../../images/logos/GAMECHANGER-NoPentagon.png';
import React from 'react';
import { Typography } from '@material-ui/core';
import defaultTitleBarHandler from '../default/defaultTitleBarHandler';

const PolicyTitleBar = {
	getTitleBar: (props) => {
		const { onTitleClick } = props;
		return (
			<div style={{ display: 'flex' }}>
				<img
					src={GamechangerLogo}
					style={styles.adminTitle}
					onClick={onTitleClick}
					alt="gamechanger"
				/>
				<Typography variant="h2" style={styles.adminWording} display="inline">
					Admin
				</Typography>
			</div>
		);
	},

	getCategoryTabs(props) {
		return <></>;
	},

	getTitleBarStyle(props) {
		return defaultTitleBarHandler.getTitleBarStyle(props);
	},
};

export default PolicyTitleBar;

const styles = {
	adminWording: {
		color: '#131E43',
		marginRight: 15,
		marginTop: 15,
		fontWeight: 600,
		fontFamily: 'Montserrat',
	},
	adminTitle: {
		margin: '0 20px 0 55px',
		cursor: 'pointer',
		width: '300px',
	},
};
