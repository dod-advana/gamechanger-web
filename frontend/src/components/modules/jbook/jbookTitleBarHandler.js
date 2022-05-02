import React from 'react';
import { getTitleBarStyle, styles } from '../default/defaultTitleBarHandler';
import PropTypes from 'prop-types';
import AdvanaMegaMenuPill from '@dod-advana/advana-platform-ui/dist/megamenu/AdvanaMegaMenuPill';
import JAICLogo from '../../../images/logos/JBooks Logo_wht.svg';

const getTitleBar = (props) => {
	const { onTitleClick, componentStepNumbers, cloneData } = props;

	return (
		<div
			className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
			onClick={onTitleClick}
		>
			<img
				src={JAICLogo}
				style={{ ...styles.title, width: 500, marginRight: 0 }}
				onClick={onTitleClick}
				alt="gamechanger jbook"
				id={'titleButton'}
				className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
			/>
		</div>
	);
};

const JBookTitleBarHandler = (props) => {
	const {
		style,
		children,
		onTitleClick,
		componentStepNumbers = [],
		jupiter,
		cloneData,
		rawSearchResults,
		pageDisplayed,
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
					backgroundColor: '#1C2D64',
				})}
			>
				{getTitleBar({
					componentStepNumbers,
					onTitleClick,
					cloneData,
				})}
				<div style={styles.searchBar}>{children}</div>
				{!jupiter && <AdvanaMegaMenuPill margin="0 -30px 0 20px" defaultHeader="Applications" />}
			</div>

			<></>
		</div>
	);
};

JBookTitleBarHandler.propTypes = {
	style: PropTypes.objectOf(PropTypes.string),
	children: PropTypes.element,
	onTitleClick: PropTypes.func,
	componentStepNumbers: PropTypes.objectOf(PropTypes.number),
	jupiter: PropTypes.bool,
	cloneData: PropTypes.object,
	rawSearchResults: PropTypes.array,
	pageDisplayed: PropTypes.string,
};

export default JBookTitleBarHandler;
