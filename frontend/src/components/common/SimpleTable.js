import React from 'react';
import _ from 'underscore';
import parse from 'html-react-parser';
import { Tooltip } from '@material-ui/core';
import { primary } from './gc-colors';
import CONFIG from '../../config/config';
import sanitizeHtml from 'sanitize-html';
import CircularProgress from '@mui/material/CircularProgress';

const defaultColWidth = {
	maxWidth: 250,
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const titleWidth = {
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	border: 'unset',
};

const stickyHeader = {
	position: 'sticky',
	top: '-1px',
	backgroundColor: 'white',
	boxShadow: 'inset 0 -2px 0 #ddd',
};

const noWrapStyle = {
	whiteSpace: 'normal',
	// maxWidth: '100%',
	// width: '100%'
};

const loadingStyle = {
	color: '#fff',
};

const titleText = {
	display: '-webkit-box',
	WebkitLineClamp: '2',
	WebkitBoxOrient: 'vertical',
	overflow: 'hidden',
	padding: '0',
	margin: '0',
};

const getCellText = (content, useParser) => {
	if (useParser) return parse(content || '');
	else if (Array.isArray(content)) return content.join(', ');
	else if (typeof content === 'boolean') return content.toString();
	else return content;
};

export default class SimpleTable extends React.Component {
	static defaultProps = {
		rows: [],
		colKeys: null,
		hideHeader: false,
		highlightSelectedRow: false,
		height: 600,
		zoom: 0.8,
		tableClass: '',
		headerExtraStyle: {},
		firstColWidth: defaultColWidth,
		colWidth: defaultColWidth,
		showEditIcon: false,
		disableWrap: false,
		stickyHeader: false,
		useParser: false,
		hideSubheader: false,
		useInnerHtml: false,
		loading: false,
	};

	state = {
		selectedRow: null,
	};

	renderSubHeaderWithoutColMap = (cols, colWidth, firstColWidth, headerExtraStyle, title, loading) => {
		return _.map(cols, (col, idx) => {
			if (idx === 0) {
				return (
					<th
						style={{
							...(this.props.stickyHeader && stickyHeader),
							...firstColWidth,
							...headerExtraStyle,
						}}
						key={idx}
					>
						{col}
					</th>
				);
			} else if (!title && loading && idx === cols.length - 1 && !col.trim()) {
				return (
					<th
						style={{
							...(this.props.stickyHeader && stickyHeader),
							...colWidth,
							...headerExtraStyle,
						}}
						key={idx}
					>
						<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
							<CircularProgress size={24} sx={loadingStyle} />
						</div>
					</th>
				);
			} else {
				return (
					<th
						style={{
							...(this.props.stickyHeader && stickyHeader),
							...colWidth,
							...headerExtraStyle,
						}}
						key={idx}
					>
						{col}
					</th>
				);
			}
		});
	};

	getHeader = (cols, colMap) => {
		const { hideHeader, hideSubheader, headerExtraStyle, colWidth, firstColWidth, title, loading } = this.props;
		if (hideHeader) return <thead></thead>;
		return (
			<thead>
				{title && (
					<tr>
						<th colSpan={loading ? 1 : cols.length} style={{ ...titleWidth, ...headerExtraStyle }} key={-1}>
							<Tooltip title={title.length > 100 ? `${title}` : ''} placement="top-start" arrow>
								<p style={titleText}>{title}</p>
							</Tooltip>
						</th>
						{loading && (
							<th style={{ ...titleWidth, ...headerExtraStyle }} key={-2}>
								<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
									<CircularProgress size={24} sx={loadingStyle} />
								</div>
							</th>
						)}
					</tr>
				)}
				{!hideSubheader && (
					<tr>
						{colMap &&
							_.map(colMap, (col, idx) => {
								if (idx === 0) {
									return (
										<th
											style={{
												...(this.props.stickyHeader && stickyHeader),
												...firstColWidth,
												...headerExtraStyle,
											}}
											key={idx}
										>
											{col.label || col.col}
										</th>
									);
								} else {
									return (
										<th
											style={{
												...(this.props.stickyHeader && stickyHeader),
												...colWidth,
												...headerExtraStyle,
											}}
											key={idx}
										>
											{col.label || col.col}
										</th>
									);
								}
							})}
						{!colMap &&
							this.renderSubHeaderWithoutColMap(
								cols,
								colWidth,
								firstColWidth,
								headerExtraStyle,
								title,
								loading
							)}
					</tr>
				)}
			</thead>
		);
	};

	buildRow = (r, c, useInnerHtml, rowCells, cIdx, rIdx, firstColWidth, colWidth, extraWrapStyle, useParser) => {
		let value = r[c] ?? '';
		if (useInnerHtml) {
			if (!value || _.isBoolean(value)) value = '';
			rowCells.push(
				<td style={{ ...(cIdx === 0 ? firstColWidth : colWidth), ...extraWrapStyle }} key={`${rIdx}_${cIdx}`}>
					<blockquote
						style={{ borderLeft: 'none' }}
						dangerouslySetInnerHTML={{
							__html: sanitizeHtml(value, {
								allowedAttributes: { span: ['style'], br: [] },
							}),
						}}
					/>
				</td>
			);
		} else {
			const editIcon = this.props.showEditIcon && cIdx === 0 && (
				<i style={{ marginRight: 10, color: 'blue' }} className="fa fa-pencil" />
			);
			rowCells.push(
				<td style={{ ...(cIdx === 0 ? firstColWidth : colWidth), ...extraWrapStyle }} key={`${rIdx}_${cIdx}`}>
					{editIcon}
					{getCellText(r[c], useParser)}
				</td>
			);
		}
	};

	buildRowItemsForBody = (isSelectedRow, activeRow, r, returnRowOnClick, onRowClick, rIdx, rowCells, rowItems) => {
		rowItems.push(
			<tr
				style={isSelectedRow ? activeRow : {}}
				onClick={() => {
					this.setState({ selectedRow: r.id });
					if (returnRowOnClick) {
						onRowClick(r)();
					} else {
						onRowClick(r.id || r)();
					}
				}}
				key={rIdx}
			>
				{rowCells}
			</tr>
		);
	};

	buildRowWithColMap = (colMap, rowCells, colWidth, extraWrapStyle, rIdx, r) => {
		colMap.forEach((c, cIdx) => {
			let innerVal = c.format ? c.format(r[c.col]) : r[c.col];

			rowCells.push(
				<td style={{ ...colWidth, ...extraWrapStyle }} key={`${rIdx}_${cIdx}`}>
					{innerVal}
				</td>
			);
		});
	};

	getBody = (rows, cols, colMap, onRowClick) => {
		const rowItems = [];
		const extraWrapStyle = this.props.disableWrap ? noWrapStyle : {};
		const selectedRow = this.state.selectedRow ? this.state.selectedRow : this.props.defaultRow;
		const { highlightSelectedRow, colWidth, firstColWidth, returnRowOnClick, useParser, useInnerHtml } = this.props;
		const tbodyStyle = {
			cursor: onRowClick ? 'pointer' : 'default',
			borderTop: '1px solid #ddd',
		};
		const activeRow = {
			backgroundColor: primary,
			color: 'white',
		};
		onRowClick = onRowClick || (() => _.noop);

		let onGoingCellCount = 0;

		for (let rIdx = 0; rIdx < rows.length; rIdx++) {
			const rowCells = [];
			let r = rows[rIdx];

			if (colMap) {
				this.buildRowWithColMap(colMap, rowCells, colWidth, extraWrapStyle, rIdx);
			} else {
				if (!r.Hidden) {
					_.each(cols, (c, cIdx) => {
						this.buildRow(
							r,
							c,
							useInnerHtml,
							rowCells,
							cIdx,
							rIdx,
							firstColWidth,
							colWidth,
							extraWrapStyle,
							useParser
						);
					});
				}
			}
			const isSelectedRow = highlightSelectedRow && selectedRow === r.id;

			onGoingCellCount += rowCells.length;

			this.buildRowItemsForBody(
				isSelectedRow,
				activeRow,
				r,
				returnRowOnClick,
				onRowClick,
				rIdx,
				rowCells,
				rowItems
			);

			if (onGoingCellCount > CONFIG.MAX_SIMPLE_TABLE_CELLS) break;
		}

		return <tbody style={tbodyStyle}>{rowItems}</tbody>;
	};

	render() {
		const {
			rows,
			colKeys,
			columnMap,
			onRowClick,
			height,
			maxHeight,
			zoom,
			tableClass,
			dontScroll,
			inheritOverflow,
			margin,
		} = this.props;
		if (rows.length === 0) return <i></i>;
		const cols = colKeys || _.keys(rows[0]);
		let filtered_cols = cols.filter((col) => col !== 'Hidden');
		const head = this.getHeader(filtered_cols, columnMap);
		const body = this.getBody(rows, filtered_cols, columnMap, onRowClick);

		const s = {
			tbl: {
				zoom,
				backgroundColor: 'white',
				position: 'relative',
				// borderCollapse: 'separate'
				marginBottom: 0,
			},
			container: {
				width: '100%',
				height,
				maxHeight,
				overflow: 'auto',
				margin,
			},
		};
		if (dontScroll) s.container.overflow = 'hidden';
		else if (inheritOverflow) s.container.overflow = 'inherit';
		return (
			<div style={s.container}>
				<table className={`table table-bordered ${tableClass}`} style={s.tbl}>
					{head}
					{body}
				</table>
			</div>
		);
	}
}
