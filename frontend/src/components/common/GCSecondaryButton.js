import React from 'react';
import Button from '@material-ui/core/Button';
import { backgroundWhite, primary } from './gc-colors';

const UOTSecondaryButton = (props) => {
	const {
		marginRight,
		marginLeft,
		minWidth,
		secondaryLabelStyle,
		secondaryButtonStyle,
		...remaining
	} = props;

	const styles = {
		secondaryButtonStyle: {
			border: 'solid 2px #00848f',
			backgroundColor: backgroundWhite,
			opacity: !props.disabled ? 1 : 0.3,
			borderRadius: 2,
			float: 'none',
			height: 35,
			lineHeight: '31px',
			minWidth: 110,
			marginRight: props.marginRight || 0,
			marginLeft: props.marginLeft || 0,
			paddingBottom: 0,
			...secondaryButtonStyle,
		},
		secondaryLabelStyle: {
			color: primary,
			...secondaryLabelStyle,
		},
	};

	if (props.disabled) styles.secondaryButtonStyle['cursor'] = 'not-allowed';

	return (
		<Button
			style={styles.secondaryButtonStyle}
			labelStyle={styles.secondaryLabelStyle}
			{...remaining}
		/>
	);
};

export default UOTSecondaryButton;
