import React from 'react';
import GCTooltip from '../common/GCToolTip';
import { HelpOutline } from '@material-ui/icons';

export default ({ color }) => (
	<GCTooltip
		title={'Open gamechanger tutorial documentation'}
		placement="top-start"
		style={{ color: 'white' }}
		arrow
	>
		<a
			href="https://wiki.advana.data.mil/display/SDKB/GAMECHANGER+User+Guide"
			target="_blank"
			rel="noopener noreferrer"
			style={{
				textDecoration: 'none',
				color: color,
				display: 'flex',
				alignItems: 'center',
				fontSize: 30,
				marginRight: 5,
			}}
		>
			<HelpOutline fontSize="inherit" />
		</a>
	</GCTooltip>
);
