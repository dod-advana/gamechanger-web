import React from 'react';
import UOTPrimaryButton from './GCPrimaryButton';
import {grey400} from 'material-ui/styles/colors';

const GCButton = (props) => {
    const {
        style,
        textStyle,
        children,
        disabled = false,
        buttonColor,
        borderColor,
        ...remaining
    } = props;

    let primaryColor = '#E9691D';
    

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
                color: !disabled ? 'rgb(255, 255, 255, 1)' : 'rgb(255, 255, 255, .6)',
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
