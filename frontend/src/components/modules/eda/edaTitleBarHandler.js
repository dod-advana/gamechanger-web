import React from "react";
import ContractSearchLogo from '../../../images/logos/GAMECHANGER-Contract.png';

const EdaTitleBarHandler = {
	getTitleBar: (props) => {
		const {
			componentStepNumbers
		} = props;
		return (
			<img src={ContractSearchLogo} style={{...styles.title, cursor: 'auto', width: 320}} alt='contractSearch'
						className={componentStepNumbers ? `tutorial-step-${componentStepNumbers["Gamechanger Title"]}` : null} />
		);
	}
}

export default EdaTitleBarHandler;

const styles = {
	wording: {
		color: '#131E43',
		marginRight: 15
	}
};
