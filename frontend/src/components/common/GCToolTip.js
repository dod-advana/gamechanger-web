import React from 'react';
import { Tooltip } from '@material-ui/core';

const GCTooltip = (props) => {
	const {
		children,
		title,
		placement,
		enterDelay = 1000,
		leaveDelay = 10,
		...remaining
	} = props;

	return (
		<Tooltip
			title={title}
			placement={placement}
			arrow
			enterDelay={enterDelay}
			leaveDelay={leaveDelay}
			{...remaining}
		>
			{children}
		</Tooltip>
	);
};

export default GCTooltip;
