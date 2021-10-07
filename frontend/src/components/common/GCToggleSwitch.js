import React from 'react';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';
import { primary } from './gc-colors';

const getStyles = (props) => ({
	formControlLabelRoot: {
		...props.rightLabelStyle,
	},
	labelAbsActive: {
		fontSize: 15,
		color: '#3c4144',
		fontWeight: '700',
		fontFamily: 'Roboto',
		userSelect: 'none',
	},
	labelAbsInactive: {
		fontSize: 15,
		color: '#3c4144',
		fontWeight: '500',
		fontFamily: 'Roboto',
		userSelect: 'none',
	},
	input: { margin: '0px !important' },
	switch: {
		color: `${props.customColor ? props.customColor : primary} !important`,
		'&checked': {
			color: `${props.customColor ? props.customColor : primary} !important`,
		},
	},
	switchBar: {
		backgroundColor: `${
			props.customColor ? props.customColor : primary
		} !important`,
		opacity: 0.5,
	},
});

export default function (props) {
	
	const classes = makeStyles(getStyles(props))();
	
	const {
		disabled,
		onClickLeft,
		onClick
	} = props;

	return (
		<>
			<label
				onClick={() => {
					if (disabled) return;
					else if (onClickLeft) onClickLeft();
					else onClick();
				}}
				style={{
					marginRight: 15,
					fontSize: 15,
					color: '#3c4144',
					fontWeight: props.rightActive ? '500' : '700',
					...(props.disabled ? {} : { cursor: 'pointer'}),
					userSelect: 'none',
					...props.leftLabelStyle,
				}}
			>
				{props.leftLabel}
			</label>
			<FormControlLabel
				id={props.formControlLabelId || 'formControlLabel'}
				control={
					<Switch
						checked={props.rightActive}
						onChange={props.onClickRight ? props.onClickRight : props.onClick}
						value={props.rightActive}
						classes={{
							switchBase: classes.switch,
							track: classes.switchBar,
							input: classes.input
						}}
						disabled={props.disabled}
					/>
				}
				label={props.rightLabel}
				classes={{
					root: classes.formControlLabelRoot,
					label: props.rightActive ? classes.labelAbsActive : classes.labelAbsInactive
				}}
			/>
		</>
	)
}
