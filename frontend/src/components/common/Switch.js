import { withStyles, Switch } from '@material-ui/core';

export default withStyles((theme, props) => ({
	root: {
		width: 28,
		height: 16,
		padding: 0,
		display: 'flex',
	},
	switchBase: {
		padding: 2,
		color: props.separatorColor || '#323E4A',
		'&$checked': {
			transform: 'translateX(12px)',
			color: 'white',
			'& + $track': {
				opacity: 1,
				backgroundColor: props.hoverColor || '#E9691D',
				borderColor: props.hoverColor || '#E9691D',
			},
		},
	},
	thumb: {
		width: 12,
		height: 12,
		boxShadow: 'none',
	},
	track: {
		border: `1px solid ${props.separatorColor || '#323E4A'}`,
		borderRadius: 16 / 2,
		opacity: 1,
		backgroundColor: 'white',
	},
	checked: {},
}))(Switch);
