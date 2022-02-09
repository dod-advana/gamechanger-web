import React, {useCallback, useEffect, useState} from 'react';
import propTypes from 'prop-types';
import { Collapse } from 'react-collapse';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { Grid, Typography, Checkbox } from '@material-ui/core';
import GCAnalystToolsSideBar from './GCAnalystToolsSideBar';
import GameChangerAPI from '../api/gameChanger-service-api';
import {setState} from '../../utils/sharedFunctions';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import {gcOrange} from '../common/gc-colors';
import {
	encode, 
	handlePdfOnLoad,
	getOrgToOrgQuery,
	getTypeQuery
} from '../../utils/gamechangerUtils';
import GCTooltip from '../common/GCToolTip';
import GCButton from '../common/GCButton';

const _ = require('lodash');

const gameChangerAPI = new GameChangerAPI();

const styles = {
	image: {
		display: 'flex',
		justifyContent: 'center',
		margin: 'auto',
		marginLeft: '10px',
		height: 30,
		color: '#939395',
		cursor: 'pointer'
	},
	checkbox: {
		padding: '9px'
	}
}

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
		overflow: scroll;
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
				padding: 5px
			}
		}
		
		& .remove-document {
			padding-top: 16px
		}
	}
	
`;

const getPresearchData = async (state, dispatch) => {
	const { cloneData } = state;
	if (_.isEmpty(state.presearchSources)) {
		const resp = await gameChangerAPI.callSearchFunction({
			functionName: 'getPresearchData',
			cloneName: cloneData.clone_name,
			options: {},
		});

		const orgFilters = {};
		for (const key in resp.data.orgs) {
			orgFilters[resp.data.orgs[[key]]] = false;
		}
		const typeFilters = {};
		for (const key in resp.data.types) {
			let name = resp.data.types[key];
			if (name.slice(-1) !== 's') {
				name = name + 's';
			}
			typeFilters[name] = false;
		}
		const newSearchSettings = _.cloneDeep(state.analystToolsSearchSettings);
		newSearchSettings.orgFilter = orgFilters;
		newSearchSettings.typeFilter = typeFilters;
		if (_.isEmpty(state.presearchSources)) {
			setState(dispatch, { presearchSources: orgFilters });
		}
		if (_.isEmpty(state.presearchTypes)) {
			setState(dispatch, { presearchTypes: typeFilters });
		}
		setState(dispatch, { analystToolsSearchSettings: newSearchSettings });
	} else {
		const newSearchSettings = _.cloneDeep(state.searchSettings);
		newSearchSettings.orgFilter = state.presearchSources;
		newSearchSettings.typeFilter = state.presearchTypes;
		setState(dispatch, { analystToolsSearchSettings: newSearchSettings });
	}
}

const resetAdvancedSettings = (dispatch) => {
	dispatch({type: 'RESET_ANALYST_TOOLS_SEARCH_SETTINGS'});
}

const GCDocumentsComparisonTool = (props) => {
	
	const classes = useStyles();
	
	const { context } = props;
	const {state, dispatch} = context;
	const { analystToolsSearchSettings } = state;
	const { 
		allOrgsSelected,
		orgFilter,
		allTypesSelected,
		typeFilter,
		publicationDateFilter,
		includeRevoked
	} = analystToolsSearchSettings;
	
	const [paragraphText, setParagraphText] = useState('');
	const [paragraphs, setParagraphs] = useState([]);
	const [selectedInput, setSelectedInput] = useState(undefined);
	const [returnedDocs, setReturnedDocs] = useState([]);
	const [viewableDocs, setViewableDocs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [compareDocument, setCompareDocument] = useState(undefined);
	const [selectedParagraph, setSelectedParagraph] = useState(undefined);
	const [itemsToCombine, setItemsToCombine] = useState({});
	const [combineDisabled, setCombineDisabled] = useState(true);
	const [filtersLoaded, setFiltersLoaded] = useState(false);
	const [noResults, setNoResults] = useState(false);
	const [filterChange, setFilterChange] = useState(false);
	const [inputError, setInputError] = useState(false);
	const [collapseKeys, setCollapseKeys] = useState([]);

	const handleSetParagraphs = useCallback(() => {
		const paragraphs = paragraphText.split('\n').map((paragraph, idx) => {
			return {text: paragraph.trim(), id: idx};
		}).filter(paragraph => paragraph.text.length > 0);

		if(paragraphs.length > 5){
			setInputError(true);
		}else{
			setInputError(false);
		}
		
		setParagraphs(paragraphs);
	}, [paragraphText])

	useEffect(() => {
		let disable = true;
		Object.keys(itemsToCombine).forEach(par => {
			if(itemsToCombine[par]) disable = false;
		})
		setCombineDisabled(disable)
	}, [itemsToCombine])
	
	useEffect(() => {
		if(!filtersLoaded){
			getPresearchData(state, dispatch);
			setFiltersLoaded(true);
		}
	}, [state, dispatch, filtersLoaded])

	useEffect(() => {
		setFilterChange(true);
	}, [orgFilter, typeFilter, publicationDateFilter, includeRevoked])

	useEffect(() => {
		setNoResults(false)
	}, [paragraphText])

	useEffect(() => {
		if (state.runDocumentComparisonSearch) {
			setLoading(true);
			setCollapseKeys([]);

			const filters = {
				orgFilters: getOrgToOrgQuery(allOrgsSelected, orgFilter),
				typeFilters: getTypeQuery(allTypesSelected, typeFilter),
				dateFilter: publicationDateFilter,
				canceledDocs: includeRevoked
			}
			
			gameChangerAPI.compareDocumentPOST({cloneName: state.cloneData.cloneName, paragraphs: paragraphs, filters}).then(resp => {
				if(resp.data.docs.length <= 0) setNoResults(true);
				setReturnedDocs(resp.data.docs);
				setState(dispatch, {runDocumentComparisonSearch: false});
				setLoading(false);
			}).catch(() =>{
				setReturnedDocs([]);
				setState(dispatch, {runDocumentComparisonSearch: false});
				setLoading(false);
				console.log('server error')
			});
		}
		
	}, [state.runDocumentComparisonSearch, paragraphText, state.cloneData.cloneName, dispatch, allOrgsSelected, orgFilter, allTypesSelected, typeFilter, publicationDateFilter, includeRevoked, paragraphs]);
	
	useEffect(() => {
		setViewableDocs(returnedDocs)
	}, [returnedDocs]);

	useEffect(() => {
		// if(state.ignoredDocs.length){
		// 	const { item, index } = state.ignoredDocs[0];
		// 	const searchedParagraph = paragraphs[item.paragraphs[index].paragraphIdBeingMatched]
		// 	const matchedParagraphId = item.paragraphs[index].id;

		// 	gameChangerAPI.compareFeedbackPOST({
		// 		searchedParagraph,
		// 		matchedParagraphId,
		// 		docId: item.id,
		// 		positiveFeedback: false
		// 	});
		// 	setState( dispatch, {ignoredDocs: []})

		// 	const newViewableDocs = viewableDocs;
		// 	const docIndex = viewableDocs.findIndex((doc) => item.filename === doc.filename);
		// 	newViewableDocs[docIndex].paragraphs.splice(index, 1);
		// 	if(!newViewableDocs[docIndex].paragraphs.length) newViewableDocs.splice(docIndex, 1);
		// 	setViewableDocs(newViewableDocs);
		// }
	}, [state.ignoredDocs, viewableDocs, dispatch, paragraphs])
	
	const measuredRef = useCallback(
		(node) => {
			if (node !== null && compareDocument) {

				if (compareDocument && selectedParagraph) {
					gameChangerAPI
						.dataStorageDownloadGET(
							encode(compareDocument.filename || ''),
							`"${selectedParagraph.par_raw_text_t}"`,
							selectedParagraph.page_num_i + 1,
							true,
							state.cloneData
						)
						.then((url) => {
							node.src = url;
						});
				}
			}
		},
		[compareDocument, state.cloneData, selectedParagraph]
	);

	useEffect(() => {
		handleSetParagraphs();
	}, [paragraphText, handleSetParagraphs])
	
	const reset = () => {
		setParagraphText('');
		setInputError(false);
		setReturnedDocs([]);
		setViewableDocs([]);
	}

	const handleCheck = (id) => {
		setItemsToCombine({
			...itemsToCombine,
			[id]: !itemsToCombine?.[id],
		});
	}

	const removeParagraph = (text) => {
		const newParagraphs = paragraphs.filter((par) => par.text !== text);
		const newItemsToCombine = itemsToCombine;
		delete newItemsToCombine[text]
		setParagraphs(newParagraphs);
	}
	
	return (
		<>
			<Grid container style={{marginTop: 20}}>
				<Grid item xs={12}>
					<div style={{fontWeight:'bold', alignItems: 'center', fontFamily: 'Noto Sans',}}>
					The Document Comparison Tool enables you to input text and locate policies in the GAMECHANGER policy repository with semantically similar language. Using the Document Comparison Tool below, you can conduct deeper policy analysis and understand how one piece of policy compares to the GAMECHANGER policy repository.
					</div>
				</Grid>
				<Grid item xs={2} style={{marginTop: 20}}>
					<GCAnalystToolsSideBar context={context} />
					<GCButton 
						isSecondaryBtn 
						onClick={() => resetAdvancedSettings(dispatch)}
						style={{margin: 0, width: '100%'}}
					>
						Clear filters
					</GCButton>
					{!loading && returnedDocs.length > 0 && <GCButton 
						onClick={() => { 
							setNoResults(false);
							setState(dispatch, { runDocumentComparisonSearch: true });
						}}
						style={{margin: '10px 0 0 0', width: '100%'}}
						disabled={!filterChange}
					>
						Apply filters
					</GCButton>}
				</Grid>
				{!(returnedDocs.length > 0) &&
				<Grid item xs={10}>
					<DocumentInputContainer>
						<Grid container className={'input-container-grid'} style={{margin: 0}}>
							<Grid item xs={12}>
								<Grid container style={{display: 'flex', flexDirection: 'column'}}>
									<Grid item xs={12}>
										<div className={'instruction-box'}>
											To search for similar documents, paste text into the box below.
										</div>
									</Grid>
									
									<Grid container style={{display: 'flex'}}>
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
													onClick={() => setState(dispatch, {inputActive: 'compareInput'})}
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
														inputError
															? 'Input currently limited to five paragraphs'
															: ''
													}
													FormHelperTextProps={{
														style: {
															color: 'red',
															fontSize: 12,
															backgroundColor: 'rgba(0,0,0,0)'
														}
													}}
												/>
											</div>
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
						<Grid container style={{justifyContent:'flex-end'}}>
							<GCTooltip 
								title={returnedDocs.length > 0 ? 'Click to start over' : 'Compare Documents'} 
								placement="top" arrow
							>
								<GCButton
									style={{ marginTop: 20 }}
									disabled={inputError}
									onClick={() => {
										setNoResults(false);
										setFilterChange(false);
										setSelectedInput(paragraphs?.[0].id);
										setState(dispatch, { runDocumentComparisonSearch: true });
									}}
								>
									Submit
								</GCButton>
							</GCTooltip>
						</Grid>
					</DocumentInputContainer>
					{loading &&
					<div style={{display:'flex', justifyContent:'center', flexDirection:'column'}}>
						<LoadingIndicator customColor={gcOrange}/>
					</div>
					}
					{noResults && !loading && 
                        <div className={'displaying-results-text'}>
                        	<div className={'text'}>
                                No results found
                        	</div>
                        </div>
					}
					
				</Grid>
				}
				{(!loading && returnedDocs.length > 0) &&
				<>
					<Grid item xs={6} style={{marginTop: 20}}>
						<div style={{margin: '0px 20px', height: '800px'}}>
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
								style={{width: '100%', height: '100%'}}
							/>
						</div>
					</Grid>
					<Grid item xs={4} style={{marginTop: 20, height: '800px', overflowY: 'scroll', maxWidth: 'calc(33.333333% + 20px)', flexBasis: 'calc((33.333333% + 20px)', paddingLeft: '20px', marginLeft: '-20px'}}>
						<div 
							style={{
								padding: 20,
								background: '#F6F8FA 0% 0% no-repeat padding-box',
								border: '1px dashed #707070',
								display: 'flex',
								flexDirection: 'column'
							}}
						>
							<Typography variant="body1" style={{marginBottom: 10}}>
								Paragraph Input
							</Typography>
							{paragraphs.map((paragraph) => (
								<div
									key={paragraph.id}
									style={{
										border: paragraph.id === selectedInput ? 'none' :`2px solid #B6C6D8`,
										boxShadow: paragraph.id === selectedInput ? '0px 3px 6px #00000029' : 'none',
										padding: 10,
										borderRadius: 6,
										display: 'flex',
										lineHeight: '20px',
										marginBottom: 10,
										cursor: 'pointer',
										backgroundColor: paragraph.id === selectedInput ? '#DFE6EE' : '#FFFFFF'
									}}
									onClick={(event) => {
										setSelectedInput(paragraph.id);
									}}
								>
									<div 
										onClick={(event) => {
											event.stopPropagation();
											handleCheck(paragraph.id);
										}}
										style={{margin: 'auto 0px'}}
									>
										<Checkbox
											checked={itemsToCombine[paragraph.id] ? true : false}
											classes={{ root: classes.filterBox }}
											icon={
												<CheckBoxOutlineBlankIcon
													style={{ visibility: 'hidden' }}
												/>
											}
											checkedIcon={
												<i
													style={{ color: '#E9691D' }}
													className="fa fa-check"
												/>
											}
										/>
									</div>
									<div style={{margin: 'auto 0'}}>
										{paragraph.text}
									</div>
									<div style={{margin: 'auto 0 auto auto'}}>
										<i 
											style={styles.image}
											onClick={(event) => {
												event.stopPropagation();
												removeParagraph(paragraph.text);
											}} 
											className="fa fa-trash fa-2x" 
										/>
									</div>
								</div>
							))}
							<div style={{display: 'flex', justifyContent: 'flex-end'}}>
								<GCButton
									style={{ marginTop: 0, width: 'fit-content'}}
									isSecondaryBtn
									disabled={combineDisabled}
									onClick={() => {
										
									}}
								>
									Combine
								</GCButton>
								<GCButton
									style={{ marginTop: 0, width: 'fit-content'}}
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
							{viewableDocs.filter(doc => {
								return doc.paragraphs.find(match => match.paragraphIdBeingMatched === selectedInput);
							}).map((doc) => {
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
										<Collapse isOpened={docOpen}>
											{doc.paragraphs.filter(paragraph => paragraph.paragraphIdBeingMatched === selectedInput).map((paragraph) =>{
												let blockquoteClass = 'searchdemo-blockquote-sm';
												const pOpen = selectedParagraph?.id === paragraph.id;
												const isHighlighted = pOpen && docOpen;
												if (isHighlighted)
													blockquoteClass +=
													' searchdemo-blockquote-sm-active';
												return <div key={paragraph.id} style={{position: 'relative'}}>
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
															marginLeft: isHighlighted ? 0 : 20, 
															marginRight: 0,
															border: isHighlighted ? 'none' : '1px solid #DCDCDC', 
															padding: '3px',
															cursor: 'pointer'
														}}
													>
														<span className="gc-document-explorer-result-header-text" style={{color: isHighlighted ? 'white' : '#131E43' }}>
															{paragraph.par_raw_text_t}
														</span>
													</div>
													<Collapse isOpened={pOpen && docOpen}>
														<div
															className='searchdemo-blockquote-sm'
															style={{ 
																marginLeft: 20, 
																marginRight: 0,
																border: '1px solid #DCDCDC', 
																padding: '10px',
																whiteSpace: 'normal'
															}}
														>
															<span className="gc-document-explorer-result-header-text" style={{fontWeight: 'normal'}}>
																{paragraph.par_raw_text_t}
															</span>
															<div style={{display: 'flex', justifyContent:'right', marginTop:'10px'}}>
																<GCButton
																	onClick={() => console.log('export')}
																	style={{marginLeft: 10, height: 36, padding: '0px, 10px', minWidth: 0, fontSize: '14px', lineHeight: '15px'}}
																>
																	Export
																</GCButton>
																<GCButton 
																	onClick={() => console.log('Favorite')}
																	style={{marginLeft: 10, height: 36, padding: '0px, 10px', minWidth: 0, fontSize: '14px', lineHeight: '15px'}}
																>
																	Save to Favorites
																</GCButton>
																<GCButton 
																	isSecondaryBtn 
																	onClick={() => console.log('Ignore')}
																	style={{marginLeft: 10, height: 36, padding: '0px, 10px', minWidth: 0, fontSize: '14px', lineHeight: '15px'}}
																>
																	Ignore
																</GCButton>
															</div>
														</div>
													</Collapse>
												</div>
											})}
										</Collapse>
									</div>
								);
							})}
						</div>
					</Grid>
				</>
				}
			</Grid>
		</>
		
	)
};

GCDocumentsComparisonTool.propTypes = {
	context: propTypes.objectOf( {})
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
			borderRadius: 6
		},
		'& textarea': {
			height: '100%'
		}
	},
	focused: {},
	notchedOutline: {
		border: `2px solid ${'#B6C6D8'} !important`,
		borderRadius: 6,
		height: '100%'
	},
	dialogXl: {
		maxWidth: '1920px',
		minWidth: '1500px',
		backgroundColor: '#EFF1F6',
		height: 850
	},
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		margin: 'auto 5px auto 0px',
		height: 19,
		width: 19
	},
}));

export default GCDocumentsComparisonTool;