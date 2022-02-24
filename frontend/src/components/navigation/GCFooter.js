import React from 'react';
import AdvanaFooter from '@dod-advana/advana-platform-ui/dist/AdvanaFooter';
import {Typography} from '@material-ui/core';
import JAICLogo from '../../images/logos/JAIC_wht.png';
import styled from 'styled-components';
import DecoupledFooter from './DecoupledFooter';

const isDecoupled =
	window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' ||
	process.env.REACT_APP_GC_DECOUPLED === 'true';
const FooterDiv = styled.div`
	width: 100%;
	-webkit-align-items: center;
	display: flex;
	& button {
		margin: 0 8px;
	}
`;

const GCFooter = (props) => {
	
	const setUserMatomo = (value) => {
		localStorage.setItem('userMatomo', value);
	}
	
	return (
		<>
			{isDecoupled &&
				<FooterDiv>
					<div style={styles.footerStyle}>
						<Typography style={styles.footerText}>in partnership with</Typography>
						<img
							src={JAICLogo}
							style={styles.title}
							alt="jaic-title"
							id={'titleButton'}
						/>
					</div>
					<DecoupledFooter setUserMatomo={setUserMatomo} />
				</FooterDiv>
			}
			{!isDecoupled &&
				<FooterDiv>
					<div style={styles.footerStyle}>
						<Typography style={styles.footerText}>in partnership with</Typography>
						<img
							src={JAICLogo}
							style={styles.title}
							alt="jaic-title"
							id={'titleButton'}
						/>
					</div>
					<AdvanaFooter />
				</FooterDiv>
			}
		</>
	)
}

const styles = {
	title: {
		width: 80
	},
	footerStyle: {
		display: 'flex',
		position: 'absolute',
	},
	footerText: {
		color: '#ffffff',
		alignSelf: 'center',
		margin: '0 10px 0 40px',
		fontFamily: 'Montserrat',
		fontWeight: 'bold',
		fontSize: 14
	}
}

export default GCFooter;
