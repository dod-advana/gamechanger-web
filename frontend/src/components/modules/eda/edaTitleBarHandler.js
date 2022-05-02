import React from 'react';
import ContractSearchLogo from '../../../images/logos/GAMECHANGER-Contract.png';
import defaultTitleBarHandler from '../default/defaultTitleBarHandler';

const EdaTitleBarHandler = {
	getTitleBar: (props) => {
		const { componentStepNumbers, onTitleClick, cloneData } = props;
		return (
			<div
				className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				onClick={onTitleClick}
			>
				<img
					src={ContractSearchLogo}
					style={styles.title}
					onClick={onTitleClick}
					alt="contractSearch"
					className={
						componentStepNumbers
							? `tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`
							: null
					}
				/>
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

export default EdaTitleBarHandler;

const styles = {
	wording: {
		color: '#131E43',
		marginRight: 15,
	},
	title: {
		margin: '0 25px 0 15px',
		cursor: 'pointer',
		height: '50px',
	},
};
