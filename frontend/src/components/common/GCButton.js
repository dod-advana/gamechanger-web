import React from 'react';
import { gcOrange } from "./gc-colors"
import UOTPrimaryButton from './GCPrimaryButton';
import {grey400} from '@material-ui/core/colors/grey';

const GCButton = (props) => {
    const {
        style,
        textStyle,
        children,
        disabled = false,
        buttonColor,
        borderColor,
        isSecondaryBtn,
        ...remaining
    } = props;

    let primaryColor = isSecondaryBtn ? '#E0E0E0' : gcOrange;
    let fontColor  = isSecondaryBtn ? 'rgb(0, 0, 0, 1)' : 'rgb(255, 255, 255, 1)';
    

    if (buttonColor) {
        primaryColor = buttonColor;
    }

    let borderPrimaryColor = primaryColor;

    if (borderColor) {
        borderPrimaryColor = borderColor;
    }

    return (
        <UOTPrimaryButton
            style={{ 
                margin: '0 0 0 10px',
                height: 45,
                borderRadius: 5,
                backgroundColor: !disabled ? primaryColor : grey400,
                borderColor: !disabled ? borderPrimaryColor : grey400,
                padding: '0 15px',
                cursor: !disabled ? 'pointer' : 'not-allowed',
                fontSize: 16,
                color: !disabled ? fontColor : 'rgb(255, 255, 255, .6)',
                ...style
            }}
            {...remaining}
            disabled={disabled}
        >
            <span style={{
                fontFamily: 'Montserrat',
                fontWeight: 600,
                ...textStyle
            }}>
                {children}
            </span>
        </UOTPrimaryButton>
    );
}

export default GCButton;
