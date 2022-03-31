import GamechangerLogo from '../../../images/logos/GAMECHANGER-NoPentagon.png';
import React from 'react';
import { Typography } from '@material-ui/core';
import defaultTitleBarHandler from '../default/defaultTitleBarHandler';
import NGA from '../../../images/logos/NGALogo.png';
import Hermes from '../../../images/logos/HermesLogo.png';
import NFR from '../../../images/logos/NFRLogo.png';
import SpaceForce from '../../../images/logos/SpaceForceLogo.png';
import Covid19 from '../../../images/logos/Covid19Logo.png';
import CDO from '../../../images/logos/CDOLogo.png';
import JAICLogo from '../../../images/logos/JBooks Logo_blk.svg';

const AdminTitleBar = {
	getTitleBar: (props) => {
		const { onTitleClick, cloneData } = props;
		if (cloneData.clone_name === 'gamechanger') {
			return (
				<div style={{ display: 'flex' }}>
					<img src={GamechangerLogo} style={styles.adminTitle} onClick={onTitleClick} alt="title" />
					<Typography variant="h2" style={styles.adminWording} display="inline">
						Admin
					</Typography>
				</div>
			);
		} else if (cloneData.clone_name === 'nga') {
			return (
				<div onClick={onTitleClick} style={{ display: 'flex' }}>
					<img
						src={NGA}
						style={styles.adminTitle}
						onClick={onTitleClick}
						alt="gamechanger NGA"
						id={'titleButton'}
					/>
					<Typography variant="h2" style={styles.adminWording} display="inline">
						Admin
					</Typography>
				</div>
			);
		} else if (cloneData.clone_name === 'hermes') {
			return (
				<div onClick={onTitleClick} style={{ display: 'flex' }}>
					<img
						src={Hermes}
						style={styles.adminTitle}
						onClick={onTitleClick}
						alt="gamechanger hermes"
						id={'titleButton'}
					/>
					<Typography variant="h2" style={styles.adminWording} display="inline">
						Admin
					</Typography>
				</div>
			);
		} else if (cloneData.clone_name === 'nfr') {
			return (
				<div onClick={onTitleClick} style={{ display: 'flex' }}>
					<img
						src={NFR}
						style={styles.adminTitle}
						onClick={onTitleClick}
						alt="gamechanger NFR"
						id={'titleButton'}
					/>
					<Typography variant="h2" style={styles.adminWording} display="inline">
						Admin
					</Typography>
				</div>
			);
		} else if (cloneData.clone_name === 'space-force') {
			return (
				<div onClick={onTitleClick} style={{ display: 'flex' }}>
					<img
						src={SpaceForce}
						style={styles.adminTitle}
						onClick={onTitleClick}
						alt="gamechanger space force"
						id={'titleButton'}
					/>
					<Typography variant="h2" style={styles.adminWording} display="inline">
						Admin
					</Typography>
				</div>
			);
		} else if (cloneData.clone_name === 'covid19') {
			return (
				<div onClick={onTitleClick} style={{ display: 'flex' }}>
					<img
						src={Covid19}
						style={styles.adminTitle}
						onClick={onTitleClick}
						alt="gamechanger Covid19"
						id={'titleButton'}
					/>
					<Typography variant="h2" style={styles.adminWording} display="inline">
						Admin
					</Typography>
				</div>
			);
		} else if (cloneData.clone_name === 'cdo') {
			return (
				<div onClick={onTitleClick} style={{ display: 'flex' }}>
					<img
						src={CDO}
						style={styles.adminTitle}
						onClick={onTitleClick}
						alt="gamechanger CDO"
						id={'titleButton'}
					/>
					<Typography variant="h2" style={styles.adminWording} display="inline">
						Admin
					</Typography>
				</div>
			);
		} else if (cloneData.clone_name === 'jbook') {
			return (
				<div onClick={onTitleClick} style={{ display: 'flex' }}>
					<img
						src={JAICLogo}
						style={styles.adminTitle}
						onClick={onTitleClick}
						alt="gamechanger JBOOK"
						id={'titleButton'}
					/>
					<Typography variant="h2" style={styles.adminWording} display="inline">
						Admin
					</Typography>
				</div>
			);
		} else {
			return (
				<div onClick={onTitleClick} style={{ display: 'flex' }}>
					<Typography variant="h1" style={styles.wording} display="inline">
						{cloneData.display_name}
					</Typography>
					<Typography variant="h6" style={styles.wording} display="inline">
						Powered by GAMECHANGER
					</Typography>
					<Typography variant="h2" style={styles.adminWording} display="inline">
						Admin
					</Typography>
				</div>
			);
		}
	},

	getCategoryTabs(props) {
		return <></>;
	},

	getTitleBarStyle(props) {
		return defaultTitleBarHandler.getTitleBarStyle(props);
	},
};

export default AdminTitleBar;

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
