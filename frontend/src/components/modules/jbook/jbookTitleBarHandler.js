import React from 'react';
import DefaultTitleBarHandler from '../default/defaultTitleBarHandler';

const jbookTitleBarHandler = {
	getTitleBar: (props) => {
		return DefaultTitleBarHandler.getTitleBar(props);
	},

	getCategoryTabs(props) {
		return <></>;
	},

	getTitleBarStyle(props) {
		const { rawSearchResults, pageDisplayed } = props;
		return {
			...styles.titleBar,
			borderBottom: rawSearchResults.length > 0 && pageDisplayed === 'main' ? '2px solid rgb(176, 186, 197)' : '',
			backgroundColor: '#1C2D64',
		};
	},
};

export default jbookTitleBarHandler;

const styles = {
	titleBar: {
		padding: '0 1em',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flex: 1,
		minHeight: 80,
		width: '100%',
	},
};
