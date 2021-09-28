import React from 'react';
import _ from 'underscore';
import parse from 'html-react-parser';

import { primary } from './gc-colors';
import CONFIG from '../../config/config';

const defaultColWidth = {
	maxWidth: 250,
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const titleWidth = {
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
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
	};

	state = {
		selectedRow: null,
	};

	getHeader = (cols, colMap) => {
		const {
			hideHeader,
			hideSubheader,
			headerExtraStyle,
			colWidth,
			firstColWidth,
			title,
		} = this.props;

		if (hideHeader) return <thead></thead>;
		return (
			<thead>
				{title && (
					<tr>
						<th style={{ ...titleWidth, ...headerExtraStyle }} key={-1}>
							{title}
						</th>
						<th style={{ ...titleWidth, ...headerExtraStyle }} key={-2}></th>
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
							_.map(cols, (col, idx) => {
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
							})}
					</tr>
				)}
			</thead>
		);
	};

	getBody = (rows, cols, colMap, onRowClick) => {
		const rowItems = [];
		let extraWrapStyle = {};
		if (this.props.disableWrap) extraWrapStyle = noWrapStyle;
		const selectedRow = this.state.selectedRow
			? this.state.selectedRow
			: this.props.defaultRow;
		const {
			highlightSelectedRow,
			colWidth,
			firstColWidth,
			returnRowOnClick,
			useParser,
		} = this.props;
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
				_.each(colMap, (c, cIdx) => {
					let innerVal = c.format ? c.format(r[c.col]) : r[c.col];

					rowCells.push(
						<td
							title={c.noTooltip ? '' : innerVal}
							style={{ ...colWidth, ...extraWrapStyle }}
							key={`${rIdx}_${cIdx}`}
						>
							{innerVal}
						</td>
					);
				});
			} else {
				_.each(cols, (c, cIdx) => {
					let value = r[c];
					const editIcon = this.props.showEditIcon && cIdx === 0 && (
						<i
							style={{ marginRight: 10, color: 'blue' }}
							className="fa fa-pencil"
						/>
					);
					
					if (!value || _.isBoolean(value)) value = '';
					if(r[c]?.constructor === Array) r[c] = r[c].join(', ');

					rowCells.push(
						<td
							style={{
								...(cIdx === 0 ? firstColWidth : colWidth),
								...extraWrapStyle,
							}}
							key={`${rIdx}_${cIdx}`}
						>
							{editIcon}
							{useParser ? parse(r[c]) : r[c]}
						</td>
					);
				});
			}
			const isSelectedRow = highlightSelectedRow && selectedRow === r.id;

			onGoingCellCount += rowCells.length;

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
			zoom,
			tableClass,
			dontScroll,
			inheritOverflow,
			margin,
		} = this.props;
		if (rows.length === 0) return <i></i>;
		const cols = colKeys || _.keys(rows[0]);
		const head = this.getHeader(cols, columnMap);
		const body = this.getBody(rows, cols, columnMap, onRowClick);

		const s = {
			tbl: {
				zoom,
				backgroundColor: 'white',
				position: 'relative',
				// borderCollapse: 'separate'
			},
			container: {
				width: '100%',
				height,
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
