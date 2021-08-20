import React from 'react';
import FlatButton from '@material-ui/core/FlatButton';
import { grey400 } from '@material-ui/core/styles/colors';
import { backgroundWhite, primary } from './gc-colors';
import { trackEvent } from '../telemetry/Matomo'
import _ from 'underscore';

const UOTPrimaryButton = (props) => {

	const { marginRight, minWidth, disabled, style, label, ...remaining } = props;
	const onClick = props.onClick? props.onClick : _.noop;

    const styles = {
        primaryButtonStyle: {
            color: backgroundWhite,
            backgroundColor: primary,
            opacity: !disabled ? 1 : 0.3,
            border: "solid 2px #00848f",
            borderColor: !disabled? '#00848f' : grey400,
            borderRadius: 2,
            height: 35,
            lineHeight: '31px',
            minWidth: minWidth || 110,
            marginRight: marginRight || 0,
            ...style,
        },
        primaryLabelStyle: {
            color:  backgroundWhite,
        },
    };

    if(disabled)
        styles.primaryButtonStyle['cursor'] = 'not-allowed'

    const handleOnClick = (event) => {
        trackEvent('UOTPrimaryButton', 'onClick', label);
        onClick(event);
    };

    return (
        <FlatButton
            {...remaining}  
            style={ styles.primaryButtonStyle}
            labelStyle={styles.primaryLabelStyle}
            disabled={disabled}
            onClick={handleOnClick}
            label={label}
        />
    );
};

export default UOTPrimaryButton;