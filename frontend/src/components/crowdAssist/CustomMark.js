import React from 'react';

export const CustomMark = ({
	color,
	start,
	end,
	onClick,
	tag,
	content,
	key,
}) => (
	<mark
		style={{
			backgroundColor: color,
			padding: '2px 4px',
			color: 'white',
			borderRadius: '4px',
			marginRight: '3px',
		}}
		data-start={start}
		data-end={end}
		onClick={() => onClick({ start: start, end: end })}
		key={key}
	>
		{content}
		{tag && (
			<span style={{ fontSize: '0.7em', fontWeight: 500, marginLeft: 6 }}>
				{tag}
			</span>
		)}
	</mark>
);
