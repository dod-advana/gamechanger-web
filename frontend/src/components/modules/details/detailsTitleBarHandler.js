import React from 'react';
import { Typography } from '@material-ui/core';
import defaultTitleBarHandler from '../default/defaultTitleBarHandler';

const DetailsTitleBar = {
	getTitleBar: (props) => {
		const { detailsType } = props;
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
	},

	getCategoryTabs(props) {
		return <></>;
	},

	getTitleBarStyle(props) {
		return defaultTitleBarHandler.getTitleBarStyle(props);
	},
};

export default DetailsTitleBar;

const styles = {
	wording: {
		color: '#131E43',
		marginRight: 15,
	},
};
