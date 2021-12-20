import React, {useCallback, useEffect, useRef, useState} from 'react';
import propTypes from 'prop-types';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import {Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Typography} from '@material-ui/core';
import Dropzone from 'react-dropzone';
import GCAnalystToolsSideBar from './GCAnalystToolsSideBar';
import FileIcon from '../../images/icon/draganddrop_img.svg'
import GameChangerAPI from '../api/gameChanger-service-api';
import {setState} from '../../utils/sharedFunctions';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import {gcOrange} from '../common/gc-colors';
import CancelIcon from '@material-ui/icons/Cancel';
import Pagination from 'react-js-pagination';
import {encode, handlePdfOnLoad, RESULTS_PER_PAGE} from '../../utils/gamechangerUtils';
import {Card} from '../cards/GCCard';
import CloseIcon from '@material-ui/icons/Close';
import GCTooltip from '../common/GCToolTip';
const _ = require('lodash');

const gameChangerAPI = new GameChangerAPI();

const PAGE_SIZE = 20

const CloseButton = styled.div`
	padding: 6px;
	background-color: white;
	border-radius: 5px;
	color: #8091a5 !important;
	border: 1px solid #b0b9be;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 0.4;
	position: absolute;
	right: 15px;
	top: 15px;
`;

const DocumentCompareContainer = styled.div`
	height: 500px;

	.relevant-doc-text-container {
		display: flex;
		place-content: space-evenly;
		width: 100%;
		
		& .relevant-doc-text {
			color: ${'#000000DE'}
			font-family: Montserrat;
			font-size: 14px;
			margin-bottom: 20px;
			width: 48%;
		}
	}
	
	.compare-area {
		display: flex;
		place-content: space-evenly;
		margin: auto;
		width: 100%;
		height: 740px;
	
		& .uploaded-doc {
			background-color: ${'#ffffff'};
	        border: 2px solid ${'#BCCBDB'};
	        border-radius: 6px;
	        width: 48%;
	        padding: 10px;
	        
	        & .compare-header {
		        color: ${'#000000DE'};
		        font-size: 16px;
		        font-family: Montserrat;
		        font-weight: bold;
		        margin-bottom: 10px;
	        }
		}
		
		& .relevant-document {
			width: 48%;
		}
	}
`;

const DocumentInputContainer = styled.div`
	border: 1px ${'#707070'};
	background-color: ${'#F6F8FA'};
	
	.input-container-grid {
		margin: 30px;
	}
	
	.input-drop-zone {
		border: 2px solid ${'#B6C6D8'} !important;
		border-radius: 6px;
		background-color: ${'#ffffff'};		
	}
	
	.instruction-box {
		font-size: 20px;
		font-style: initial;
		font-family: Noto Sans;
		font-color: ${'#2f3f4a'};
		margin-bottom: 15px;
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
	
	.document-imported-block {
		display: flex;
	
		 & .document-text {
			border: 2px solid ${'#B6C6D8'} !important;
			border-radius: 6px;
			background-color: ${'rgb(239, 242, 246)'};
			margin: 30px 0px 30px 30px;
			width: 100%;
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

const SimilarDocumentsContainer = styled.div`

	.displaying-results-text {
		font-size: 24px;
		font-family: Montserrat;
		border-bottom: 2px solid ${'#BCCBDB'};
		display: flex;
		place-content: space-between;
		margin-top: 5px;
		
		& .text {
			margin: auto 0px;
			
			& span {
				font-weight: bold;
			}
		}
		
		& .gcPagination {
			& .pagination {
				margin: unset;
				font-size: 12px;
			}
		}
	}
	
	.results-container {
		margin-top: 5px;
	}
`;
const resetAdvancedSettings = (dispatch) => {
	dispatch({type: 'RESET_ANALYST_TOOLS_SEARCH_SETTINGS'});
}
const GCDocumentsComparisonTool = (props) => {
	
	const classes = useStyles();
	
	const { context } = props;
	const {state, dispatch} = context;
	
	const [paragraphText, setParagraphText] = useState('');
	const [paragraphs, setParagraphs] = useState([]);
	const [returnedDocs, setReturnedDocs] = useState([]);
	const [viewableDocs, setViewableDocs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [compareDocument, setCompareDocument] = useState(undefined);
	const [compareParagraphIndex, setCompareParagraphIndex] = useState(0);
	const [dropBoxWidthHeight, setDropBoxWidthHeight] = useState({width: 0, height: 0});
	
	const dropboxRef = useRef();
	
	
	useEffect(() => {
		if (state.runDocumentComparisonSearch) {
			setLoading(true);
			
			const paragraphs = paragraphText.split('\n').map(paragraph => {
				return paragraph.trim();
			}).filter(paragraph => paragraph.length > 0);
			
			setParagraphs(paragraphs);
			
			gameChangerAPI.compareDocumentPOST({cloneName: state.cloneData.cloneName, paragraphs: paragraphs}).then(resp => {
				setReturnedDocs(resp.data.docs);
				setState(dispatch, {runDocumentComparisonSearch: false});
				setLoading(false);
			});
		}
		
	}, [state.runDocumentComparisonSearch, paragraphText, state.cloneData.cloneName, dispatch]);
	
	useEffect(() => {
		setViewableDocs(returnedDocs)
	}, [returnedDocs]);
	
	useEffect(() => {
		if (dropboxRef.current) {
			setDropBoxWidthHeight({width: dropboxRef.current.offsetWidth, height: dropboxRef.current.offsetHeight});
		}
	}, [dropboxRef]);
	
	useEffect(() => {
		if (state.compareModalOpen) {
			const doc = returnedDocs.filter(document => {
				return document.filename === state.compareFilename;
			})[0];
			
			let tmpCompareIdx;
			doc.paragraphs.forEach(par => {
				if (tmpCompareIdx === undefined) {
					tmpCompareIdx = par.paragraphIdBeingMatched;
				}
			});
			
			setCompareParagraphIndex(tmpCompareIdx);
			setCompareDocument(doc);
		}
	}, [returnedDocs, state.compareModalOpen, state.compareFilename]);
	
	const measuredRef = useCallback(
		(node) => {
			if (node !== null && compareDocument) {
				
				const matchingPars = compareDocument.paragraphs.filter(par => {
					return par.paragraphIdBeingMatched === compareParagraphIndex;
				});
				
				if (compareDocument && matchingPars.length > 0) {
					gameChangerAPI
						.dataStorageDownloadGET(
							encode(compareDocument.filename || ''),
							`"${paragraphs[compareParagraphIndex]}"`,
							matchingPars[0].page_num_i + 1,
							true,
							state.cloneData
						)
						.then((url) => {
							node.src = url;
						});
				}
			}
		},
		[paragraphs, compareDocument, state.cloneData, compareParagraphIndex]
	);
	
	const getMatchingParsCount = (compareIdx) => {
		return compareDocument.paragraphs.filter(par => {
			return par.paragraphIdBeingMatched === compareIdx;
		}).length;
	}
	
	const handleSetCompareIndex = (idx) => {
		if (getMatchingParsCount(idx) > 0){
			setCompareParagraphIndex(idx);
		}
	}
	
	const handleFilesDropped = (files) => {
	
	}
	
	const reset = () => {
		setParagraphText('');
		setReturnedDocs([]);
		setViewableDocs([]);
		setPage(1);
	}
	
	const buildCards = (docs) => {
		return _.map(docs, (item, idx) => {
			item.type = 'document';
			item.isCompare = true;
			item.dataToQuickCompareTo = paragraphs;
			item.pageHits = [];
			return (
				<Card key={idx}
					item={item}
					idx={idx}
					state={{
						...state,
						selectedDocuments: new Map(), componentStepNumbers: {}, listView: true, showSideFilters: false
					}}
					dispatch={dispatch}
				/>
			);
		});
	}
	
	const handleChangePage = (page) => {
	
	}
	
	return (
		<>
			<Dialog
				open={state.compareModalOpen}
				scroll={'paper'}
				maxWidth="xl"
				disableEscapeKeyDown
				disableBackdropClick
				classes={{
					paperWidthXl: classes.dialogXl,
				}}
			>
				<DialogTitle>
					<CloseButton onClick={() => setState(dispatch, {compareModalOpen: false})}>
						<CloseIcon fontSize="large" />
					</CloseButton>
				</DialogTitle>

				<DialogContent>
					<DocumentCompareContainer>
						<div className={'relevant-doc-text-container'}>
							<Typography className={'relevant-doc-text'}>Click each paragraph below to jump to the page the match was found on</Typography>
							<Typography className={'relevant-doc-text'}>This document may contain relevant information to your search</Typography>
						</div>
						{compareDocument &&
							<div className={'compare-area'}>
								<div className={'uploaded-doc'}>
									<Typography className={'compare-header'}>Uploaded Document</Typography>
									{paragraphs.map((paragraph, idx) => (
										<>
											<div
												style={{
													border: idx === compareParagraphIndex ? `2px solid ${'#386f94'}` : '',
													padding: idx === compareParagraphIndex ? `5px` : '',
													borderRadius: 6,
													cursor: getMatchingParsCount(idx) > 0 ? 'pointer' : ''
												}}
												onClick={() => handleSetCompareIndex(idx)}
											>
												{paragraph}
											</div>
											<br/>
										</>
									))}
								</div>
								<div className={'relevant-document'}>
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
							</div>
						}
					</DocumentCompareContainer>
				</DialogContent>

				<DialogActions>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							width: '100%',
							margin: '0px 18px',
						}}
					>
					
					</div>
				</DialogActions>
			</Dialog>
			
			<Grid container style={{marginTop: 20}}>
				<Grid item xs={12}>
					<div style={{fontWeight:'bold', alignItems: 'center'}}>
					Data in the table below does not currently reflect all documents in GAMECHANGER. As we continue to process data for this capability, please check back later or reach us by email if your document/s of interest are not yet included: osd.pentagon.ousd-c.mbx.advana-gamechanger@mail.mil
					</div>
				</Grid>
				<Grid item xs={2}>
					<GCAnalystToolsSideBar context={context} />
				</Grid>
				<Grid item xs={10}>
					{(!loading && returnedDocs.length <= 0) &&
					<DocumentInputContainer>
						<Grid container className={'input-container-grid'}>
							<Grid item xs={12}>
								<Grid container style={{display: 'flex', flexDirection: 'column'}}>
									<Grid item xs={12}>
										<div className={'instruction-box'}>
											To search for similar documents, paste text into the box below.
										</div>
									</Grid>
									
									<Grid container>
										<Grid item xs={12}>
											<div className={'input-box'}>
												<TextField
													id="input-box"
													multiline
													rows={1000}
													variant="outlined"
													className={classes.inputBoxRoot}
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
												/>
											</div>
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
						<Grid container style={{justifyContent:'flex-end', marginLeft:'30px'}}>
						<Grid item xs={-2}>
						
										<button
					type="button"
					style={{ border: 'none', backgroundColor: gcOrange, padding: '0 15px', display: 'flex', height: 50, alignItems: 'center', borderRadius: 5}}
					onClick={() => {
						resetAdvancedSettings(dispatch);
						setState(dispatch, { runDocumentComparisonSearch: true });
					}}
				>
					<span style={{
						fontFamily: 'Montserrat',
						fontWeight: 600,
						width: '100%', marginTop: '5px', marginBottom: '10px', marginLeft: '-1px', color: '#ffffff'
					}}>
						Submit
					</span>
				</button>
				</Grid>
				</Grid>
					</DocumentInputContainer>
					}
					{loading &&
					<div style={{display:'flex', justifyContent:'center', flexDirection:'column'}}>
						<LoadingIndicator customColor={gcOrange}/>
					</div>
					}
					{(!loading && returnedDocs.length > 0) &&
					<>
						<DocumentInputContainer>
							<div className={'document-imported-block'}>
								<div className={'document-text'}>
									<div className={'text'}>
										{paragraphs.map(paragraph => (
											<>
												<div>{paragraph}</div>
												<br />
											</>
										))}
									</div>
								</div>
								<div className={'remove-document'}>
									<GCTooltip title={'Click to start over'} placement="top" arrow>
										<IconButton
											color="inherit"
											aria-label="remove document"
											component="span"
											style={{color: 'red'}}
											onClick={() => reset()}
										>
										    <CancelIcon fontSize={'inherit'} style={{fontSize: 20}}/>
									    </IconButton>
									</GCTooltip>
								</div>
							</div>
						</DocumentInputContainer>
						
						<SimilarDocumentsContainer>
							<div className={'displaying-results-text'}>
								<div className={'text'}>
									Showing results {(page - 1) * PAGE_SIZE + 1} - {returnedDocs.length} of: <span>Possibly Relevant Documents</span>
								</div>
								<div className='gcPagination text-center'>
									<Pagination
										activePage={page}
										itemsCountPerPage={RESULTS_PER_PAGE}
										totalItemsCount={viewableDocs.length}
										pageRangeDisplayed={8}
										onChange={async page => {
											handleChangePage(page);
										}}
									/>
								</div>

							</div>
							
							<div className={'results-container'}>
								
								{buildCards(viewableDocs)}
							</div>
							
						</SimilarDocumentsContainer>
					</>
					}
				</Grid>
			</Grid>
		</>
		
	)
};

GCDocumentsComparisonTool.propTypes = {
	context: propTypes.objectOf( {})
};

const styles = {
	fakeLink: {
		textDecoration: 'underline',
		color: '#386F94',
		fontFamily: 'Noto Sans',
		fontSize: 14,
		cursor: 'pointer'
	},
	dropText: {
		textAlign: 'center',
		margin: 'auto',
		paddingTop: 28
	},
}

const useStyles = makeStyles((theme) => ({
	inputBoxRoot: {
		backgroundColor: '#FFFFFF'
	},
	outlinedInput: {
		color: '#0000008A',
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
}));

export default GCDocumentsComparisonTool;
/*	
style={{ border: 'none', backgroundColor: gcOrange, padding: '0 15px', display: 'flex', height: 50, alignItems: 'center', borderRadius: 5, margin: '0 0 0 1150px'}}				
*/