import React from "react";
import {Typography} from "@material-ui/core";

const PolicyTitleBar = {
	getTitleBar: (props) => {
		const {
			detailsType
		} = props;
		return (
			<div style={{ display: 'flex', marginLeft: '3%' }}>
				<Typography variant="h1" style={styles.wording} display="inline">
					{detailsType}
				</Typography>
				<Typography variant="h1" style={styles.wording} display="inline">
					Details
				</Typography>
			</div>
		);
	}
}

export default PolicyTitleBar;

const styles = {
	wording: {
		color: '#131E43',
		marginRight: 15
	}
};
