import React, { useState, useEffect, useRef } from "react";
import _ from 'underscore';
import {grey300} from 'material-ui/styles/colors';
import { IconButton } from '@material-ui/core';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import CheveronRightIcon from '@material-ui/icons/ChevronRight';
import CheveronLeftIcon from '@material-ui/icons/ChevronLeft';


const ThumbnailRow = styled.div`
	padding-left: 0;
	font-family: Noto Sans;
	display: flex;
	flex-direction: row;
	margin-bottom: 20px;
`;
const ThumbnailRowItem = styled.div`
	border: 1px solid ${grey300};
	cursor: pointer;
	color: #386F94;
`;

const GameChangerThumbnailRow = (props) => {
	const {
		title = 'Thumbnail Row',
		width = '225px',
		onLinkClick = _.noop,
		children = []
	} = props;

	const [itemsPerPage, setItemsPerPage] = useState(5)
	const [maxPage, setMaxPage] = useState(0)
	const [page, setPage] = useState(0)
	const [currItems, setCurrItems] = useState(children.slice(0,5))
	const rowRef = useRef(null);

	// Calculate the max items per page using row width
	useEffect(() => {
		const rowWidth = rowRef.current.offsetWidth;
		const tWidth = parseInt(width)
		let items = Math.floor(rowWidth/tWidth);
		const thumbnailMargin = (items-1)*10;
		if( rowWidth < (items*tWidth)+thumbnailMargin ){
			items -= 1;
		}
		setMaxPage(Math.ceil(children.length/items)-1);
		setCurrItems(children.slice(0,items));
		setItemsPerPage(items);

	},[children, width, setCurrItems, setMaxPage, setItemsPerPage])

	// Handle Pagination
	useEffect(() => {
		const start = page*itemsPerPage;
		setCurrItems(children.slice(start, start+itemsPerPage));
	},[children, page, itemsPerPage, setCurrItems])
	
	return (
		<div>
			<div style={{display:'flex', justifyContent:'space-between'}}>
				<Typography variant="h3" style={{ marginBottom: 10, fontSize: 20 }}>{title}</Typography>
				<div>
					{ maxPage > 0 && 
					[<IconButton onClick={()=>setPage(page-1)} disabled={page===0}>
						<CheveronLeftIcon/>
					</IconButton>,
					<IconButton onClick={()=>setPage(page+1)} disabled={page===maxPage}>
						<CheveronRightIcon/>
					</IconButton>]
				}
				</div>
			</div>
			<ThumbnailRow ref={rowRef} style={{marginLeft:-10}}>  
			{currItems}
			</ThumbnailRow>
		</div>
	);
}

export default GameChangerThumbnailRow;