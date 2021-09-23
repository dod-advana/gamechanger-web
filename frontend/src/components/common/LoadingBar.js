import React from 'react';
import { LinearProgress } from '@material-ui/core';

export default ({ loading = false, color = 'secondary', style = {} }) => {
	if (color !== 'primary' && color !== 'secondary') {
		console.warn(
			`Loading bar color must be "primary" or "secondary" not ${color}`
		);
		color = 'primary';
	}
	return (
		<LinearProgress
			color={color}
			style={{
				width: '100%',
				height: '4px',
				visibility: loading ? 'visible' : 'hidden',
				...style,
			}}
		/>
	);
};
