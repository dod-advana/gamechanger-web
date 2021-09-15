import { Typography } from '@material-ui/core';
import React from 'react';

export default function SearchSection(props) {
	const { section, color, children, icon } = props;

	return (
		<div style={styles.container(color)}>
			<div style={styles.headerWrapper}>
				<span style={styles.header(color)}>
					{icon && (
						<img src={icon} alt={`${section}-icon`} style={styles.icon} />
					)}

					<Typography variant="h5" color="inherit" align="center">
						{section}
					</Typography>
				</span>
			</div>

			<div className="row" style={styles.childContainer}>
				{children}
			</div>
		</div>
	);
}

const styles = {
	container: (color) => ({
		borderLeft: ` 6px solid ${color}`,
		marginBottom: 25,
		width: '100%',
	}),
	headerWrapper: {
		display: 'inline-block',
		height: 50,
	},
	header: (color) => ({
		backgroundColor: `${color}`,
		borderRadius: '0px 5px 5px 0px',
		color: 'white',
		height: '100%',
		padding: 15,
		minWidth: 200,
		display: 'inline-flex',
	}),
	childContainer: {
		paddingLeft: 20,
		paddingTop: 20,
	},
	icon: {
		height: 20,
		marginRight: 15,
	},
	link: {
		marginLeft: 15,
		fontSize: '1.2em',
	},
};
