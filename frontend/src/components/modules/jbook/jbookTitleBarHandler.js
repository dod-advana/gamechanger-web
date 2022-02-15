import React from 'react';
import JAICLogo from '../../../images/logos/JBooks Logo_wht.svg';

const jbookTitleBarHandler = {
	getTitleBar: (props) => {
		const {
			onTitleClick,
		} = props;
		return (
			<img
				src={JAICLogo}
				style={styles.title}
				onClick={onTitleClick}
				alt="jbook-title"
				id={'titleButton'}
			/>
		);
	},

	getCategoryTabs(props) {
		return <></>
	},

	getTitleBarStyle(props) {
		const {
			rawSearchResults,
			pageDisplayed
		} = props;
		return {
			...styles.titleBar,
			borderBottom: (rawSearchResults.length > 0 && pageDisplayed === 'main') ? '2px solid rgb(176, 186, 197)' : '',
			backgroundColor: '#1C2D64'
		};
	}
}

export default jbookTitleBarHandler;

const styles = {
	wording: {
		color: 'white',
		marginRight: 15,
		fontWeight: 700
	},
	titleBar: {
		padding: '0 1em',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flex: 1,
		minHeight: 80,
		width: '100%'
	},
	title: {
		margin: '0px 24px 0px 12px',
		cursor: 'pointer',
		width: '400px',
	},
};
