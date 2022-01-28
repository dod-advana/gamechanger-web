import React, { useState, useEffect, useRef } from 'react';
import { IconButton } from '@material-ui/core';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import CheveronRightIcon from '@material-ui/icons/ChevronRight';
import CheveronLeftIcon from '@material-ui/icons/ChevronLeft';

const ThumbnailRow = styled.div`
	font-family: Noto Sans;
	display: flex;
	flex-direction: row;
	margin-bottom: 20px;
	width: 90vw;
	overflow: hidden;
	scroll-behavior: smooth;
`;

const GameChangerThumbnailRow = (props) => {
	const {
		title = 'Thumbnail Row',
		width = '225px',
		children = [],
		links,
	} = props;

	const [rowWidth, setRowWidth] = useState(0);
	const [scrollable, setScrollable] = useState(false);
	const rowRef = useRef(null);

	// Calculate the max items per page using row width
	useEffect(() => {
		const rowWidth = rowRef.current.offsetWidth;
		const tWidth = parseInt(width);
		let items = Math.floor(rowWidth / tWidth);
		setScrollable(links.length > items);
		setRowWidth(items * (tWidth + 10));
	}, [children, links.length, width]);

	const scroll = (offset) => {
		rowRef.current.scrollLeft -= offset;
	};

	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					flexWrap: 'nowrap',
					overflow: 'auto',
				}}
			>
				<Typography variant="h3" style={{ fontSize: 18, fontWeight: 800 }}>
					{title}
				</Typography>
			</div>
			<div style={{ display: 'flex', alignItems: 'center' }}>
				{scrollable && (
					<IconButton onClick={() => scroll(rowWidth)}>
						<CheveronLeftIcon />
					</IconButton>
				)}
				<ThumbnailRow
					ref={rowRef}
					style={
						scrollable
							? { marginTop: '10px', marginRight: '3px', marginLeft: '3px' }
							: { marginLeft: '40px', marginTop: '10px', marginBottom: '10px' }
					}
				>
					{children}
				</ThumbnailRow>
				{scrollable && (
					<IconButton onClick={() => scroll(rowWidth * -1)}>
						<CheveronRightIcon />
					</IconButton>
				)}
			</div>
		</div>
	);
};

export default GameChangerThumbnailRow;
