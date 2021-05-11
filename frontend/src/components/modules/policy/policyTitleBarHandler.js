import GamechangerLogo from "../../../images/logos/GAMECHANGER-NoPentagon.png";
import React from "react";

const PolicyTitleBarHandler = {
	getTitleBar: (props) => {
		const {
			onTitleClick,
			componentStepNumbers
		} = props;
		return (
			<img src={GamechangerLogo} style={styles.title} onClick={onTitleClick} alt='gamechanger' id={'titleButton'}
				className={componentStepNumbers ? `tutorial-step-${componentStepNumbers["Gamechanger Title"]}` : null} />
		);
	}
}

export default PolicyTitleBarHandler;

const styles = {
	title: {
		margin: '0 50px 0 55px',
		cursor: 'pointer',
		width: '190px',
		height: '50x'
	},
};
