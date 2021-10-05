import React from 'react';
import PropTypes from 'prop-types';

import {
	DropdownWrapper,
	Row,
	IconTextWrapper,
	DeleteButton,
	SuggestionText,
	SubText,
} from './SearchBarStyledComponents';

const SearchBarDropdown = ({ rowData = [], cursor, isEDA }) => {
	if (rowData.length < 1) {
		return null;
	}

	const subtext = (rowType) => {
		switch (rowType) {
			case 'autocorrect':
				return;
			case 'presearchTitle':
				return <SubText>Title</SubText>;
			case 'predictions':
				return <SubText>Prediction</SubText>;
			case 'presearchOrg':
				return <SubText>Organization</SubText>;
			case 'presearchTopic':
				return <SubText>Topic</SubText>;
			default:
				return;
		}
	};

	return (
		<DropdownWrapper id="GamechangerSearchBarDropdown">
			{
				// unpacks each set of rows in order from rowData, so that they can be different i.e. deletable or other future options
				rowData.reduce(
					(
						acc,
						{
							rows,
							IconComponent,
							handleRowPressed,
							handleDeletePressed,
							rowType,
						},
						i
					) => {
						const withDelete = handleDeletePressed instanceof Function;
						rows.forEach(({ text, id }, ii) => {
							if (!isEDA || (isEDA && rowType === 'autocorrect')) {
								acc.push(
									<Row
										name={acc.length}
										className={
											'SearchBar-Dropdown-Row' +
											(rowType === 'autocorrect' ? ' bold' : '') +
											(cursor === acc.length ? ' cursor' : '')
										}
										key={i + text + ii}
										onClick={() => {
											handleRowPressed({ text, rowType });
										}}
										tabIndex={0}
										role="option"
										onKeyPress={(event) => {
											// press enter
											if (event.charCode === 13) {
												handleRowPressed({ text, rowType });
											}
										}}
									>
										<IconTextWrapper>
											<IconComponent style={{ fontSize: '22px' }} />
											<div
												style={{
													display: 'flex',
													flexDirection: 'column',
													paddingLeft: '6px',
												}}
											>
												<SuggestionText>{text.toLowerCase()}</SuggestionText>
												{subtext(rowType)}
											</div>
										</IconTextWrapper>

										{withDelete && id && (
											<DeleteButton
												style={{ fontSize: '26px' }}
												onClick={(event) => {
													event.stopPropagation();
													handleDeletePressed(id);
												}}
											/>
										)}
									</Row>
								);
							}
						});
						return acc;
					},
					[]
				)
			}
		</DropdownWrapper>
	);
};

SearchBarDropdown.propTypes = {
	rowData: PropTypes.arrayOf(
		PropTypes.exact({
			IconComponent: PropTypes.elementType.isRequired,
			handleRowPressed: PropTypes.func.isRequired,
			handleDeletePressed: PropTypes.func,
			rows: PropTypes.arrayOf(
				PropTypes.exact({
					text: PropTypes.string.isRequired,
					id: PropTypes.string,
				})
			),
			rowType: PropTypes.string,
		})
	).isRequired,
};

export default SearchBarDropdown;
