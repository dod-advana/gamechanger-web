import React from 'react';
import Button from '@material-ui/core/Button';
import CheveronRightIcon from '@material-ui/icons/ChevronRight';
import CheveronLeftIcon from '@material-ui/icons/ChevronLeft';

function noop() {}

const JumpButton = ({ action = noop, label, style, reverse = false }) => {
	let content;
	if (!reverse)
		content = (
			<>
				{label} <CheveronRightIcon style={styles.chevron} />
			</>
		);
	else
		content = (
			<>
				<CheveronLeftIcon style={styles.chevronRight} />
				{label}
			</>
		);

	return (
		<Button
			onClick={() => action()}
			disableRipple={true}
			style={{ ...styles.btn, ...(style || {}) }}
			variant={'text'}
		>
			{content}
		</Button>
	);
};

const styles = {
	btn: {
		marginTop: 30,
		fontSize: 16,
		color: '#386F94',
		font: 'Noto Sans',
		padding: 0,
		textTransform: 'unset',
	},
	chevron: {
		fontSize: 24,
		marginLeft: 2,
	},
	chevronRight: {
		fontSize: 24,
		marginRight: 2,
	},
};

export default JumpButton;
