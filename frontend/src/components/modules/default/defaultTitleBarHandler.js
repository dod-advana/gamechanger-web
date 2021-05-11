import React from "react";
import {Typography} from "@material-ui/core";

const DefaultTitleBarHandler = {
	getTitleBar: (props) => {
		const {
			onTitleClick,
			componentStepNumbers,
			cloneData
		} = props;
		return (
			<div className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				 onClick={onTitleClick}>
				<Typography variant="h1" style={styles.wording} display="inline">
					{cloneData.display_name}
				</Typography>
				<Typography variant="h6" style={styles.wording} display="inline">
					Powered by GAMECHANGER
				</Typography>
			</div>
		);
	}
}

export default DefaultTitleBarHandler;

const styles = {
	wording: {
		color: '#131E43',
		marginRight: 15
	}
};
