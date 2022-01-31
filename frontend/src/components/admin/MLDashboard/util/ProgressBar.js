import React from 'react';
import '../index.scss';
/**
 * Takes in className, progress and two thresholds. One for Warning and one for High/Error.
 * Only  the progress is required. The thresholds determine the css class to use
 * and the className is just appened to the default classes.
 * @class ProgressBar
 */
const ProgressBar = (props) => {
	const status = ['good', 'warning', 'high'];
	let index = 0;
	if (props.warning && props.progress >= props.warning) {
		index++;
		if (props.high && props.progress >= props.high) {
			index++;
		}
	}
	const progress = Math.round(props.progress * 100) / 100 + '%';
	return (
		<div className={props?.className ? props.className + ' bar' : 'bar'}>
			<div style={{ position: 'absolute', width: '100%', zIndex: '10' }}>
				{' '}
				{progress}
			</div>
			<div
				style={{ width: progress }}
				className={'progress-container ' + status[index]}
			></div>
		</div>
	);
};

export default ProgressBar;
