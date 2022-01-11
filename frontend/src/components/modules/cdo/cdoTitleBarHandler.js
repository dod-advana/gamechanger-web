import React from 'react';
import GamechangerCDOLogo from '../../../images/logos/GAMECHANGER-CDO.png';

const DefaultTitleBarHandler = {
	getTitleBar: (props) => {
		const { onTitleClick, componentStepNumbers, cloneData } = props;
		return (
			<img
				src={GamechangerCDOLogo}
				style={styles.title}
				onClick={onTitleClick}
				alt="gamechanger cdo"
				id={'titleButton'}
				className={`tutorial-step-${
					componentStepNumbers[`${cloneData.display_name} Title`]
				}`}
			/>
		);
	},

	getCategoryTabs(props) {
		return <></>;
	},

	getTitleBarStyle(props) {
		const { rawSearchResults, pageDisplayed } = props;
		return {
			...styles.titleBar,
			borderBottom:
				rawSearchResults.length > 0 && pageDisplayed === 'main'
					? '2px solid rgb(176, 186, 197)'
					: '',
		};
	},
};

export default DefaultTitleBarHandler;

const styles = {
	wording: {
		color: '#131E43',
		marginRight: 15,
	},
	titleBar: {
		padding: '0 1em',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flex: 1,
		minHeight: 80,
		width: '100%',
	},
	title: {
		margin: '0 40px 0 30px',
		cursor: 'pointer',
		height: '50px',
	},
};
