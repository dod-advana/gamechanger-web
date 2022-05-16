import React from 'react';
import propTypes from 'prop-types';
import { Collapse } from 'react-collapse';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { Grid, Typography, Checkbox, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import GCAnalystToolsSideBar from './GCAnalystToolsSideBar';
import { setState } from '../../utils/sharedFunctions';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { gcOrange } from '../common/gc-colors';
import { handlePdfOnLoad, convertDCTScoreToText } from '../../utils/gamechangerUtils';
import GCTooltip from '../common/GCToolTip';
import GCButton from '../common/GCButton';
import ExportIcon from '../../images/icon/Export.svg';

const styles = {
	image: {
		display: 'flex',
		justifyContent: 'center',
		margin: 'auto',
		marginLeft: '10px',
		height: 30,
		color: '#939395',
		cursor: 'pointer',
	},
	checkbox: {
		padding: '9px',
	},
	collapsedInput: {
		margin: 'auto 0',
		display: '-webkit-box',
		WebkitLineClamp: 3,
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden',
	},
	resultsText: {
		fontSize: 24,
		fontFamily: 'Montserrat',
		borderBottom: '2px solid #BCCBDB',
		display: 'flex',
		placeContent: 'space-between',
		marginTop: 20,
		marginLeft: 20,
	},
};

const DocumentInputContainer = styled.div`
	border: 5px ${'#FFFFFF'};
	border-radius: 5px;
	background-color: ${'#F6F8FA'};
	padding: 20px;
	margin: 20px 0px 0px 20px;

	.input-container-grid {
		margin-top: 30px;
		margin-left: 80px;
	}

	.input-drop-zone {
		border: 2px solid ${'#B6C6D8'} !important;
		border-radius: 6px;
		background-color: ${'#ffffff'};
	}

	.instruction-box {
		font-size: 1.1em;
		font-style: initial;
		font-family: Noto Sans;
		font-color: ${'#2f3f4a'};
		margin-bottom: 10px;
	}

	.or-use-text {
		height: 100%;
		text-align: center;
		display: table;
		width: 100%;

		> span {
			display: table-cell;
			vertical-align: middle;
		}
	}

	.input-box {
		font-size: 14px;
		overflow: auto;
		font-family: Noto Sans;
	}

	fieldset {
		height: auto !important;
	}

	.document-imported-block {
		display: flex;

		& .document-text {
			border: 2px solid ${'#B6C6D8'} !important;
			border-radius: 6px;
			background-color: ${'rgb(239, 242, 246)'};
			margin: 30px 0px 30px 30px;
			width: 100%;
			overflow: scroll;
			height: 250px;

			& .text {
				padding: 5px;
			}
		}

		& .remove-document {
			padding-top: 16px;
		}
	}
`;

const resetAdvancedSettings = (dispatch) => {
	dispatch({ type: 'RESET_ANALYST_TOOLS_SEARCH_SETTINGS' });
};

const GCDocumentsComparisonTool = ({
	context,
	description,
	loading,
	returnedDocs = 0,
	setReturnedDocs,
	sortType,
	setSortType,
	setNeedsSort,
	sortOrder,
	setSortOrder,
	exportAll,
	setNoResults,
	noResults,
	filterChange,
	setFilterChange,
	paragraphText,
	setParagraphText,
	setInputError,
	inputError,
	setViewableDocs,
	viewableDocs,
	setItemsToCombine,
	itemsToCombine,
	setSelectedParagraph,
	selectedParagraph,
	setSelectedInput,
	selectedInput,
	handleCompare,
	measuredRef,
	compareDocument,
	setCompareDocument,
	paragraphs,
	removeParagraph,
	combineDisabled,
	handleCombine,
	collapseKeys,
	setCollapseKeys,
	exportSingleDoc,
	saveDocToFavorites,
	feedbackList,
	handleFeedback,
}) => {
	const classes = useStyles();

	const { dispatch } = context;

	const reset = () => {
		setParagraphText('');
		setInputError(false);
		setReturnedDocs([]);
		setViewableDocs([]);
	};

	const handleCheck = (id) => {
		setItemsToCombine({
			...itemsToCombine,
			[id]: !itemsToCombine?.[id],
		});
	};

	const handleSelectInput = (id) => {
		setSelectedParagraph(undefined);
		setSelectedInput(id);
		setNeedsSort(true);
	};

	const handleChangeOrder = (order) => {
		setSortOrder(order);
		setNeedsSort(true);
	};

	return (
		<Grid container style={{ marginTop: 20, paddingBottom: 20 }}>
			<Grid item xs={12}>
				<div style={{ display: 'flex' }}>
					<div style={{ fontWeight: 'bold', alignItems: 'center', fontFamily: 'Noto Sans' }}>
						{description}
					</div>
					{!loading && returnedDocs.length > 0 && (
						<div style={{ display: 'flex', marginLeft: 20 }}>
							<FormControl
								variant="outlined"
								classes={{ root: classes.root }}
								style={{ marginLeft: 'auto', margin: '-10px 0px 0px 0px', minWidth: 195 }}
							>
								<InputLabel classes={{ root: classes.formlabel }} id="view-name-select">
									Sort
								</InputLabel>
								<Select
									className={`MuiInputBase-root`}
									labelId="re-view-name"
									label="View"
									id="re-view-name-select"
									value={sortType}
									onChange={(event) => {
										setSortType(event.target.value);
										setNeedsSort(true);
									}}
									classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
									autoWidth
								>
									<MenuItem
										key={`Similarity Score`}
										value={'Similarity Score'}
										style={{ display: 'flex', padding: '3px 6px' }}
									>
										Similarity Score
									</MenuItem>
									<MenuItem
										key={`Alphabetically`}
										value={'Alphabetically'}
										style={{ display: 'flex', padding: '3px 6px' }}
									>
										Alphabetically
									</MenuItem>
									<MenuItem
										key={`Date Published`}
										value={'Date Published'}
										style={{ display: 'flex', padding: '3px 6px' }}
									>
										Date Published
									</MenuItem>
								</Select>
							</FormControl>
							<div style={{ width: '40px', marginLeft: '10px', display: 'flex' }}>
								<i
									className="fa fa-sort-amount-desc"
									style={{
										marginTop: '50%',
										marginRight: '5px',
										cursor: 'pointer',
										color: sortOrder === 'desc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('desc');
									}}
								></i>
								<i
									className="fa fa-sort-amount-asc"
									style={{
										marginTop: '50%',
										cursor: 'pointer',
										color: sortOrder === 'asc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('asc');
									}}
								></i>
							</div>
							<GCTooltip title="Export all results" placement="bottom" arrow>
								<div style={{ marginTop: 6 }}>
									<GCButton
										onClick={exportAll}
										style={{
											minWidth: 50,
											padding: '0px 7px',
											height: 50,
										}}
									>
										<img
											src={ExportIcon}
											style={{
												margin: '0 0 3px 3px',
												width: 15,
											}}
											alt="export"
										/>
									</GCButton>
								</div>
							</GCTooltip>
						</div>
					)}
				</div>
			</Grid>
			<Grid item xs={2} style={{ marginTop: 20 }}>
				<GCAnalystToolsSideBar context={context} results={returnedDocs} />
				<GCButton
					isSecondaryBtn
					onClick={() => resetAdvancedSettings(dispatch)}
					style={{ margin: 0, width: '100%' }}
				>
					Clear Filters
				</GCButton>
				{!loading && returnedDocs.length > 0 && (
					<GCButton
						onClick={() => {
							setNoResults(false);
							setReturnedDocs([]);
							setNeedsSort(true);
							setState(dispatch, { runDocumentComparisonSearch: true });
						}}
						style={{ margin: '10px 0 0 0', width: '100%' }}
						disabled={!filterChange}
					>
						Apply filters
					</GCButton>
				)}
			</Grid>
			{!(returnedDocs.length > 0) && !loading && (
				<Grid item xs={10}>
					<DocumentInputContainer>
						<Grid container className={'input-container-grid'} style={{ margin: 0 }}>
							<Grid item xs={12}>
								<Grid container style={{ display: 'flex', flexDirection: 'column' }}>
									<Grid item xs={12}>
										<div className={'instruction-box'}>
											To search for similar documents, paste text into the box below.
										</div>
									</Grid>

									<Grid container style={{ display: 'flex' }}>
										<Grid item xs={12}>
											<div className={'input-box'}>
												<TextField
													id="input-box"
													disabled={returnedDocs.length > 0}
													multiline
													rows={1000}
													variant="outlined"
													value={paragraphText}
													onChange={(event) => {
														setParagraphText(event.target.value);
													}}
													onClick={() => setState(dispatch, { inputActive: 'compareInput' })}
													InputProps={{
														classes: {
															root: classes.outlinedInput,
															focused: classes.focused,
															notchedOutline: classes.notchedOutline,
														},
													}}
													placeholder={'Text Content Here'}
													fullWidth={true}
													helperText={
														inputError ? 'Input currently limited to five paragraphs' : ''
													}
													FormHelperTextProps={{
														style: {
															color: 'red',
															fontSize: 12,
															backgroundColor: 'rgba(0,0,0,0)',
														},
													}}
												/>
											</div>
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
						<Grid container style={{ justifyContent: 'flex-end' }}>
							<GCTooltip title={'Compare Documents'} placement="top" arrow>
								<div style={{ marginTop: 20 }}>
									<GCButton disabled={inputError} onClick={handleCompare}>
										Submit
									</GCButton>
								</div>
							</GCTooltip>
						</Grid>
					</DocumentInputContainer>
					{noResults && !loading && (
						<div style={styles.resultsText}>
							<div className={'text'}>No results found</div>
						</div>
					)}
				</Grid>
			)}
			{loading && (
				<Grid item xs={10}>
					<div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
						<LoadingIndicator customColor={gcOrange} />
					</div>
				</Grid>
			)}
			{!loading && returnedDocs.length > 0 && (
				<>
					<Grid item xs={6} style={{ marginTop: 20 }}>
						<div style={{ margin: '0px 20px', height: '800px' }}>
							<iframe
								title={'PDFViewer'}
								className="aref"
								id={'pdfViewer'}
								ref={measuredRef}
								onLoad={() =>
									handlePdfOnLoad(
										'pdfViewer',
										'viewerContainer',
										compareDocument.filename,
										'PDF Viewer'
									)
								}
								style={{ width: '100%', height: '100%' }}
							/>
						</div>
					</Grid>
					<Grid
						item
						xs={4}
						style={{
							marginTop: 20,
							height: '800px',
							overflowY: 'auto',
							maxWidth: 'calc(33.333333% + 20px)',
							flexBasis: 'calc((33.333333% + 20px)',
							paddingLeft: '20px',
							marginLeft: '-20px',
						}}
					>
						<div
							style={{
								padding: 20,
								background: '#F6F8FA 0% 0% no-repeat padding-box',
								border: '1px dashed #707070',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Typography variant="body1" style={{ marginBottom: 10 }}>
								Paragraph Input
							</Typography>
							{paragraphs.map((paragraph) => (
								<div
									key={paragraph.id}
									style={{
										border: paragraph.id === selectedInput ? 'none' : `2px solid #B6C6D8`,
										boxShadow: paragraph.id === selectedInput ? '0px 3px 6px #00000029' : 'none',
										padding: 10,
										borderRadius: 6,
										display: 'flex',
										lineHeight: '20px',
										marginBottom: 10,
										cursor: 'pointer',
										backgroundColor: paragraph.id === selectedInput ? '#DFE6EE' : '#FFFFFF',
									}}
									onClick={() => {
										handleSelectInput(paragraph.id);
									}}
								>
									{paragraphs.length > 1 && (
										<div
											onClick={(event) => {
												event.stopPropagation();
												handleCheck(paragraph.id);
											}}
											style={{ margin: 'auto 0px' }}
										>
											<Checkbox
												checked={itemsToCombine[paragraph.id] ? true : false}
												classes={{ root: classes.filterBox }}
												icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
												checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
											/>
										</div>
									)}
									<div
										style={
											paragraph.id === selectedInput
												? { margin: 'auto 0' }
												: styles.collapsedInput
										}
									>
										{paragraph.text}
									</div>
									{paragraphs.length > 1 && (
										<div style={{ margin: 'auto 0 auto auto' }}>
											<i
												style={styles.image}
												onClick={(event) => {
													event.stopPropagation();
													removeParagraph(paragraph.id);
												}}
												className="fa fa-trash fa-2x"
											/>
										</div>
									)}
								</div>
							))}
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<GCButton
									style={{ marginTop: 0, width: 'fit-content' }}
									isSecondaryBtn
									disabled={combineDisabled}
									onClick={() => {
										handleCombine();
									}}
								>
									Combine
								</GCButton>
								<GCButton
									style={{ marginTop: 0, width: 'fit-content' }}
									isSecondaryBtn
									onClick={() => {
										setNoResults(false);
										setFilterChange(false);
										return reset();
									}}
								>
									Reset
								</GCButton>
							</div>
						</div>
						<div style={{ marginTop: 20 }}>
							{viewableDocs.length ? (
								<></>
							) : (
								<div style={{ ...styles.resultsText, marginLeft: 0 }}>
									<div className={'text'}>No results for paragraph found</div>
								</div>
							)}
							{viewableDocs.map((doc) => {
								const docOpen = collapseKeys[doc.filename] ? collapseKeys[doc.filename] : false;
								const displayTitle = doc.title;
								return (
									<div key={doc.id}>
										<div
											className="searchdemo-modal-result-header"
											style={{ marginTop: 0 }}
											onClick={(e) => {
												e.preventDefault();
												setCollapseKeys({ ...collapseKeys, [doc.filename]: !docOpen });
											}}
										>
											<i
												style={{
													marginRight: docOpen ? 10 : 14,
													fontSize: 20,
													cursor: 'pointer',
												}}
												className={`fa fa-caret-${docOpen ? 'down' : 'right'}`}
											/>
											<span className="gc-document-explorer-result-header-text">
												{displayTitle}
											</span>
										</div>
										<div>
											<Collapse isOpened={docOpen}>
												{doc.paragraphs &&
													doc.paragraphs
														.filter(
															(paragraph) =>
																paragraph.paragraphIdBeingMatched === selectedInput
														)
														.map((paragraph) => {
															let blockquoteClass = 'searchdemo-blockquote-sm';
															const pOpen = selectedParagraph?.id === paragraph.id;
															const isHighlighted = pOpen && docOpen;
															if (isHighlighted)
																blockquoteClass += ' searchdemo-blockquote-sm-active';
															return (
																<div
																	key={paragraph.id}
																	style={{ position: 'relative' }}
																>
																	{isHighlighted && (
																		<span className="searchdemo-arrow-left-sm"></span>
																	)}
																	<div
																		className={blockquoteClass}
																		onClick={(e) => {
																			e.preventDefault();
																			setCompareDocument(doc);
																			setSelectedParagraph(paragraph);
																		}}
																		style={{
																			marginLeft: 20,
																			marginRight: 0,
																			border: isHighlighted
																				? 'none'
																				: '1px solid #DCDCDC',
																			padding: '3px',
																			cursor: 'pointer',
																		}}
																	>
																		<span
																			className="gc-document-explorer-result-header-text"
																			style={{
																				color: isHighlighted
																					? 'white'
																					: '#131E43',
																			}}
																		>
																			{isHighlighted
																				? `Page: ${
																						paragraph.page_num_i + 1
																				  }, Par: ${
																						paragraph.id.split('_')[1]
																				  }, Similarity Score: ${convertDCTScoreToText(
																						paragraph.score
																				  )}`
																				: paragraph.par_raw_text_t}
																		</span>
																	</div>
																	<Collapse isOpened={pOpen && docOpen}>
																		<div
																			className="searchdemo-blockquote-sm"
																			style={{
																				marginLeft: 20,
																				marginRight: 0,
																				border: '1px solid #DCDCDC',
																				padding: '10px',
																				whiteSpace: 'normal',
																			}}
																		>
																			<span
																				className="gc-document-explorer-result-header-text"
																				style={{ fontWeight: 'normal' }}
																			>
																				{paragraph.par_raw_text_t}
																			</span>
																			<div
																				style={{
																					display: 'flex',
																					justifyContent: 'right',
																					marginTop: '10px',
																				}}
																			>
																				<GCTooltip
																					title={
																						'Export document matches to CSV'
																					}
																					placement="bottom"
																					arrow
																				>
																					<div>
																						<GCButton
																							onClick={() =>
																								exportSingleDoc(doc)
																							}
																							style={{
																								marginLeft: 10,
																								height: 36,
																								padding: '0px, 10px',
																								minWidth: 0,
																								fontSize: '14px',
																								lineHeight: '15px',
																							}}
																						>
																							Export
																						</GCButton>
																					</div>
																				</GCTooltip>
																				<GCTooltip
																					title={'Save document to favorites'}
																					placement="bottom"
																					arrow
																				>
																					<div>
																						<GCButton
																							onClick={() =>
																								saveDocToFavorites(
																									doc.filename,
																									paragraph
																								)
																							}
																							style={{
																								marginLeft: 10,
																								height: 36,
																								padding: '0px, 10px',
																								minWidth: 0,
																								fontSize: '14px',
																								lineHeight: '15px',
																							}}
																						>
																							Save to Favorites
																						</GCButton>
																					</div>
																				</GCTooltip>
																				<GCTooltip
																					title={'Was this result relevant?'}
																					placement="bottom"
																					arrow
																				>
																					<i
																						className={
																							classes.feedback +
																							' fa fa-thumbs-up'
																						}
																						style={
																							feedbackList[paragraph.id]
																								? {
																										color: '#939395',
																										WebkitTextStroke:
																											'1px black',
																								  }
																								: {}
																						}
																						onClick={() =>
																							handleFeedback(
																								doc,
																								paragraph,
																								true
																							)
																						}
																					/>
																				</GCTooltip>
																				<GCTooltip
																					title={'Was this result relevant?'}
																					placement="bottom"
																					arrow
																				>
																					<i
																						className={
																							classes.feedback +
																							' fa fa-thumbs-down'
																						}
																						style={
																							feedbackList[
																								paragraph.id
																							] === false
																								? {
																										color: '#939395',
																										WebkitTextStroke:
																											'1px black',
																								  }
																								: {}
																						}
																						onClick={() =>
																							handleFeedback(
																								doc,
																								paragraph,
																								false
																							)
																						}
																					/>
																				</GCTooltip>
																			</div>
																		</div>
																	</Collapse>
																</div>
															);
														})}
											</Collapse>
										</div>
										<div>
											<Collapse isOpened={docOpen}>
												{doc.pageHits &&
													doc.pageHits
														.filter(
															(paragraph) =>
																paragraph.paragraphIdBeingMatched === selectedInput
														)
														.map((paragraph) => {
															let blockquoteClass = 'searchdemo-blockquote-sm';
															const pOpen = selectedParagraph?.id === paragraph.id;
															const isHighlighted = pOpen && docOpen;
															if (isHighlighted)
																blockquoteClass += ' searchdemo-blockquote-sm-active';
															return (
																<div
																	key={paragraph.id}
																	style={{ position: 'relative' }}
																>
																	{isHighlighted && (
																		<span className="searchdemo-arrow-left-sm"></span>
																	)}
																	<div
																		className={blockquoteClass}
																		onClick={(e) => {
																			e.preventDefault();
																			setCompareDocument(doc);
																			setSelectedParagraph(paragraph);
																		}}
																		style={{
																			marginLeft: 20,
																			marginRight: 0,
																			border: isHighlighted
																				? 'none'
																				: '1px solid #DCDCDC',
																			padding: '3px',
																			cursor: 'pointer',
																		}}
																	>
																		<span
																			className="gc-document-explorer-result-header-text"
																			style={{
																				color: isHighlighted
																					? 'white'
																					: '#131E43',
																			}}
																		>
																			{isHighlighted
																				? `Page: ${
																						paragraph.pageNumber
																				  }, Par: ${
																						paragraph.id
																				  }, Similarity Score: ${convertDCTScoreToText(
																						paragraph.score
																				  )}`
																				: paragraph.text}
																		</span>
																	</div>
																	<Collapse isOpened={pOpen && docOpen}>
																		<div
																			className="searchdemo-blockquote-sm"
																			style={{
																				marginLeft: 20,
																				marginRight: 0,
																				border: '1px solid #DCDCDC',
																				padding: '10px',
																				whiteSpace: 'normal',
																			}}
																		>
																			<span
																				className="gc-document-explorer-result-header-text"
																				style={{ fontWeight: 'normal' }}
																			>
																				{paragraph.text}
																			</span>
																			<div
																				style={{
																					display: 'flex',
																					justifyContent: 'right',
																					marginTop: '10px',
																				}}
																			>
																				<GCTooltip
																					title={
																						'Export document matches to CSV'
																					}
																					placement="bottom"
																					arrow
																				>
																					<div>
																						<GCButton
																							onClick={() =>
																								exportSingleDoc(doc)
																							}
																							style={{
																								marginLeft: 10,
																								height: 36,
																								padding: '0px, 10px',
																								minWidth: 0,
																								fontSize: '14px',
																								lineHeight: '15px',
																							}}
																						>
																							Export
																						</GCButton>
																					</div>
																				</GCTooltip>
																				<GCTooltip
																					title={'Save document to favorites'}
																					placement="bottom"
																					arrow
																				>
																					<div>
																						<GCButton
																							onClick={() =>
																								saveDocToFavorites(
																									doc.filename,
																									paragraph
																								)
																							}
																							style={{
																								marginLeft: 10,
																								height: 36,
																								padding: '0px, 10px',
																								minWidth: 0,
																								fontSize: '14px',
																								lineHeight: '15px',
																							}}
																						>
																							Save to Favorites
																						</GCButton>
																					</div>
																				</GCTooltip>
																				<GCTooltip
																					title={'Was this result relevant?'}
																					placement="bottom"
																					arrow
																				>
																					<i
																						className={
																							classes.feedback +
																							' fa fa-thumbs-up'
																						}
																						style={
																							feedbackList[paragraph.id]
																								? {
																										color: '#939395',
																										WebkitTextStroke:
																											'1px black',
																								  }
																								: {}
																						}
																						onClick={() =>
																							handleFeedback(
																								doc,
																								paragraph,
																								true
																							)
																						}
																					/>
																				</GCTooltip>
																				<GCTooltip
																					title={'Was this result relevant?'}
																					placement="bottom"
																					arrow
																				>
																					<i
																						className={
																							classes.feedback +
																							' fa fa-thumbs-down'
																						}
																						style={
																							feedbackList[
																								paragraph.id
																							] === false
																								? {
																										color: '#939395',
																										WebkitTextStroke:
																											'1px black',
																								  }
																								: {}
																						}
																						onClick={() =>
																							handleFeedback(
																								doc,
																								paragraph,
																								false
																							)
																						}
																					/>
																				</GCTooltip>
																			</div>
																		</div>
																	</Collapse>
																</div>
															);
														})}
											</Collapse>
										</div>
									</div>
								);
							})}
						</div>
					</Grid>
				</>
			)}
		</Grid>
	);
};

GCDocumentsComparisonTool.propTypes = {
	context: propTypes.objectOf({}),
};

const useStyles = makeStyles((theme) => ({
	outlinedInput: {
		color: '#0000008A',
		backgroundColor: '#FFFFFF',
		fontFamily: 'Montserrat',
		fontSize: 14,
		height: 247,
		padding: '10px 0px 10px 10px',
		'&focused $notchedOutline': {
			border: `2px solid ${'#B6C6D8'} !important`,
			borderRadius: 6,
		},
		'& textarea': {
			height: '100%',
		},
	},
	root: {
		paddingTop: '16px',
		marginRight: '10px',
		'& .MuiInputBase-root': {
			height: '50px',
			fontSize: 20,
		},
		'& .MuiFormLabel-root': {
			fontSize: 20,
		},
		'&:hover .MuiInput-underline:before': {
			borderBottom: `3px solid ${gcOrange}`,
		},
		'& .MuiInput-underline:before': {
			borderBottom: `3px solid rgba(0, 0, 0, 0.42)`,
		},
		'& .MuiInput-underline:after': {
			borderBottom: `3px solid ${gcOrange}`,
		},
		'& .Mui-focused': {
			borderColor: `${gcOrange}`,
			color: `${gcOrange}`,
		},
	},
	focused: {},
	notchedOutline: {
		border: `2px solid ${'#B6C6D8'} !important`,
		borderRadius: 6,
		height: '100%',
	},
	dialogXl: {
		maxWidth: '1920px',
		minWidth: '1500px',
		backgroundColor: '#EFF1F6',
		height: 850,
	},
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		margin: 'auto 5px auto 0px',
		height: 19,
		width: 19,
	},
	feedback: {
		fontSize: 25,
		margin: 'auto 0 auto 10px',
		justifyContent: 'center',
		color: 'white',
		'-webkit-text-stroke': '1px #808080',
		'&:hover': {
			cursor: 'pointer',
			'-webkit-text-stroke': '1px black',
		},
	},
	selectIcon: {
		marginTop: '4px',
	},
	formlabel: {
		paddingTop: '16px',
	},
}));

export default GCDocumentsComparisonTool;
