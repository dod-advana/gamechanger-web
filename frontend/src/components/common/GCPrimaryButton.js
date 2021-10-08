import React from 'react';
import Button from '@material-ui/core/Button';
import grey from '@material-ui/core/colors/grey';
import { backgroundWhite, primary } from './gc-colors';
import { trackEvent } from '../telemetry/Matomo';
import _ from 'underscore';

const grey400 = grey[400];

const UOTPrimaryButton = (props) => {
	const { marginRight, minWidth, disabled, style, label, ...remaining } = props;
	const onClick = props.onClick ? props.onClick : _.noop;

	const styles = {
		primaryButtonStyle: {
			color: backgroundWhite,
			backgroundColor: primary,
			opacity: !disabled ? 1 : 0.3,
			border: 'solid 2px #00848f',
			borderColor: !disabled ? '#00848f' : grey400,
			borderRadius: 2,
			height: 35,
			lineHeight: '31px',
			minWidth: minWidth || 110,
			marginRight: marginRight || 0,
			...style,
		},
		primaryLabelStyle: {
			color: backgroundWhite,
		},
	};

	if (disabled) styles.primaryButtonStyle['cursor'] = 'not-allowed';

	const handleOnClick = (event) => {
		trackEvent('UOTPrimaryButton', 'onClick', label);
		onClick(event);
	};

	return (
		<Button
			{...remaining}
			style={styles.primaryButtonStyle}
			labelStyle={styles.primaryLabelStyle}
			disabled={disabled}
			onClick={handleOnClick}
			label={label}
		/>
	);
};

export default UOTPrimaryButton;
