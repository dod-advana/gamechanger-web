import React from 'react';
import ContractSearchLogo from '../../../images/logos/GAMECHANGER-Contract.png';
import { getTitleBarStyle, styles } from '../default/defaultTitleBarHandler';
import PropTypes from 'prop-types';
import AdvanaMegaMenuPill from '@dod-advana/advana-platform-ui/dist/megamenu/AdvanaMegaMenuPill';

const getTitleBar = (props) => {
	const { componentStepNumbers, onTitleClick, cloneData } = props;
	return (
		<div
			className={`tutorial-step-${componentStepNumbers[cloneData.display_name + 'Title']}`}
			onClick={onTitleClick}
		>
			<img
				src={ContractSearchLogo}
				style={styles.title}
				onClick={onTitleClick}
				alt="contractSearch"
				className={
					componentStepNumbers
						? `tutorial-step-${componentStepNumbers[cloneData.display_name + 'Title']}`
						: null
				}
			/>
		</div>
	);
};

const EdaTitleBarHandler = (props) => {
	const {
		style,
		children,
		onTitleClick,
		componentStepNumbers = [],
		jupiter,
		cloneData,
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
					componentStepNumbers,
					onTitleClick,
					cloneData,
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

EdaTitleBarHandler.propTypes = {
	style: PropTypes.objectOf(PropTypes.string),
	children: PropTypes.element,
	onTitleClick: PropTypes.func,
	componentStepNumbers: PropTypes.objectOf(PropTypes.number),
	jupiter: PropTypes.bool,
	cloneData: PropTypes.object,
	rawSearchResults: PropTypes.array,
	pageDisplayed: PropTypes.string,
};

export default EdaTitleBarHandler;
