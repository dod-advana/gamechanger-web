import React from 'react';
import { Typography } from '@material-ui/core';
import { getTitleBarStyle, styles } from '../default/defaultTitleBarHandler';
import PropTypes from 'prop-types';
import AdvanaMegaMenuPill from '@dod-advana/advana-platform-ui/dist/megamenu/AdvanaMegaMenuPill';
import GamechangerLogo from '../../../images/logos/GAMECHANGER-NoPentagon.png';

const getTitleBar = (props) => {
	const { detailsType } = props;
	return (
		<div style={{ display: 'flex', marginLeft: '3%', alignItems: 'center' }}>
			<img
				src={GamechangerLogo}
				style={{ ...styles.title, width: 300 }}
				onClick={() => (window.location.href = window.location.href.split('#')[0] + '#')}
				alt="gamechanger"
				id={'titleButton'}
			/>
			<Typography variant="h1" data-cy="details-type" style={styles.wording} display="inline">
				{detailsType}
			</Typography>
			<Typography variant="h1" style={styles.wording} display="inline">
				Details
			</Typography>
		</div>
	);
};

const DetailsTitleBar = (props) => {
	const {
		style,
		children,
		componentStepNumbers = [],
		jupiter,
		detailsType,
		rawSearchResults,
		pageDisplayed,
		openPillRight,
		openPillTop,
		closeButtonRight,
		closeButtonTop,
	} = props;
	return (
		<div
			style={{ ...styles.container, ...style }}
			className={componentStepNumbers ? `tutorial-step-${componentStepNumbers['Search Bar']}` : null}
		>
			<div
				style={getTitleBarStyle({
					rawSearchResults,
					pageDisplayed,
				})}
			>
				{getTitleBar({
					detailsType,
				})}
				<div style={styles.searchBar}>{children}</div>
				{!jupiter && (
					<AdvanaMegaMenuPill
						margin="0 -30px 0 20px"
						defaultHeader="Applications"
						openPillRight={openPillRight}
						openPillTop={openPillTop}
						closeButtonRight={closeButtonRight}
						closeButtonTop={closeButtonTop}
					/>
				)}
			</div>

			<></>
		</div>
	);
};

DetailsTitleBar.propTypes = {
	style: PropTypes.objectOf(PropTypes.string),
	children: PropTypes.element,
	componentStepNumbers: PropTypes.objectOf(PropTypes.number),
	jupiter: PropTypes.bool,
	detailsType: PropTypes.string,
	rawSearchResults: PropTypes.array,
	pageDisplayed: PropTypes.string,
};

export default DetailsTitleBar;
