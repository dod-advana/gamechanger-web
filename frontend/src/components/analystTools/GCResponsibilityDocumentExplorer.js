import React, { useEffect, useCallback, useState } from 'react';
import _ from 'underscore';
import { Collapse } from 'react-collapse';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import SimpleTable from '../common/SimpleTable';
import GameChangerAPI from '../api/gameChanger-service-api';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator.js';
import '../cards/keyword-result-card.css';
import '../../containers/gamechanger.css';
import GCAccordion from '../common/GCAccordion';
import {
	handlePdfOnLoad,
	getTrackingNameForFactory,
} from '../../utils/gamechangerUtils';
import { trackEvent } from '../telemetry/Matomo';
import PDFHighlighter from './PDFHighlighter';
import GCButton from '../common/GCButton';
import UOTAlert from '../common/GCAlert';
import { styles as adminStyles} from '../../components/admin/util/GCAdminStyles'

const gameChangerAPI = new GameChangerAPI();
const SIDEBAR_TOGGLE_WIDTH = 20;
const LEFT_PANEL_COL_WIDTH = 3;
const RIGHT_PANEL_COL_WIDTH = 3;
const useStyles = makeStyles({
	root: {
		width: '100%'
	}
})

const getIframePreviewLinkInferred = (
	filename,
	responsibilityText,
	pageNumber,
	isClone = false,
	cloneData = {}
) => {
	let highlightText = responsibilityText;
	highlightText = highlightText.replace(/&/g, '%26');
	//solution for discrepancy in PDF text having extra space after letters and numbers at beginning of responsibilities 
	if(highlightText){
		const textArray = highlightText.split(' ');
		if(textArray[0].match(/(\(\w{1,2}\)|\w{1,2}\.)/)) textArray[0] += ' ';
		highlightText = textArray.join(' ');
	}
	return new Promise((resolve, reject) => {
		gameChangerAPI
			.dataStorageDownloadGET(
				filename,
				`"${highlightText}"`,
				pageNumber,
				isClone,
				cloneData
			)
			.then((url) => {
				resolve(url);
			});
	});
};


export default function ResponsibilityDocumentExplorer({
	state,
	responsibilityData = {},
	loading,
	totalCount,
	setResultsPage,
	isClone = true,
	setReloadResponsibilities,
	docTitle, 
	setDocTitle,
	organization, 
	setOrganization,
	responsibilityText, 
	setResponsibilityText,
	filters,
	setFilters,
	documentList,
	infiniteScrollRef
}) {

	const { cloneData } = state;
	const classes = useStyles();

	// Set out state variables and access functions
	const [collapseKeys, setCollapseKeys] = useState({});
	const [iframePreviewLink, setIframePreviewLink] = useState({
		dataIdx: 0,
		entityIdx: 0,
		responsibilityIdx: 0
	});
	const [iframeLoading, setIframeLoading] = useState(false);
	const [leftPanelOpen, setLeftPanelOpen] = useState(true);
	const [rightPanelOpen, setRightPanelOpen] = useState(true);
	const [pdfLoaded, setPdfLoaded] = useState(false);
	const [isEditingResp, setIsEditingResp] = useState(false);
	const [isEditingEntity, setIsEditingEntity] = useState(false);
	const [selectedResponsibility, setSelectedResponsibility] = useState({});
	const [documentLink, setDocumentLink] = useState('');
	const [clearFilters, setClearFilters] = useState(false);
	const [highlights, setHighlights] = useState([])

	const [alertActive, setAlertActive] = useState(false);
	const [alertTitle, setAlertTitle] = useState('');
	const [alertType, setAlertType] = useState('');
	const [alertMessage, setAlertMessage] = useState('');


	const createAlert = (title, type, message) => {
		setAlertTitle(title);
		setAlertType(type);
		setAlertMessage(message);
		setAlertActive(true);
	};

	useEffect(() => {
		if(Object.keys(responsibilityData).length){
			const { dataIdx, entityIdx, responsibilityIdx } = iframePreviewLink;
			const doc = Object.keys(responsibilityData)[dataIdx];
			if(!doc) return;
			const entity = Object.keys(responsibilityData[doc])[entityIdx];
			if(!entity) return;
			const resp = responsibilityData[doc][entity][responsibilityIdx];
			if (resp) {
				setSelectedResponsibility(resp);
			}
		}
	}, [responsibilityData, iframePreviewLink]);

	useEffect(() => {
		if(!iframeLoading){
			setTimeout(() => {
				const notFound = document.getElementById('PdfViewer')?.contentWindow?.document.getElementsByClassName('notFound');
				if(notFound?.length){
					createAlert(
						'Text Not Found',
						'error',
						'The exact respsonsibility text could not be found in the PDF due to a discrepancy'
					);
				}
			}, 2000)
		}
	},[iframeLoading])

	useEffect(() => {
		if (Object.keys(responsibilityData).length) {
			let initialCollapseKeys = {};
			Object.keys(responsibilityData).forEach(doc => {
				initialCollapseKeys[doc] = false;
				Object.keys(responsibilityData[doc]).forEach(entity => {
					initialCollapseKeys[doc + entity] = false;
				})
			})
			setCollapseKeys(initialCollapseKeys);
		}
		setIframePreviewLink({
			dataIdx: 0,
			entityIdx: 0,
			responsibilityIdx: 0
		})
	}, [responsibilityData]);

	useEffect(() => {
		setIsEditingEntity(false);
		setIsEditingResp(false);
		setDocumentLink('');
	}, [selectedResponsibility])

	const measuredRef = useCallback(
		(node) => {
			if (node !== null) {
				const rec = Object.keys(responsibilityData).length;
				if (rec) {
					const pageNumber = 1;
					if (
						selectedResponsibility.filename
					) {
						setIframeLoading(true);
						getIframePreviewLinkInferred(
							selectedResponsibility.filename,
							selectedResponsibility.responsibilityText,
							pageNumber,
							isClone,
							cloneData
						).then((url) => {
							node.src = url;
							setIframeLoading(false);
						});
					}
				}
			}
		},
		[
			selectedResponsibility,
			isClone,
			cloneData,
			responsibilityData,
		]
	);

	function handleRightPanelToggle() {
		trackEvent(
			getTrackingNameForFactory(cloneData.clone_name),
			'ResponsibilityExplorerInteraction',
			'RightPanelToggle',
			rightPanelOpen ? 'Close' : 'Open'
		);
		setRightPanelOpen(!rightPanelOpen);
	}

	function handleLeftPanelToggle() {
		trackEvent(
			getTrackingNameForFactory(cloneData.clone_name),
			'ResponsibilityExplorerInteraction',
			'LeftPanelToggle',
			leftPanelOpen ? 'Close' : 'Open'
		);
		setLeftPanelOpen(!leftPanelOpen);
	}

	function handleQuoteLinkClick(e, respKey, entKey, key) {
		// if (Object.keys(selectedResponsibility).length) {
		// 	const fileName = selectedResponsibility.filename;
		// 	trackEvent(
		// 		getTrackingNameForFactory(cloneData.clone_name),
		// 		'ResponsibilityExplorerInteraction',
		// 		'PDFOpen'
		// 	);
		// 	trackEvent(
		// 		getTrackingNameForFactory(cloneData.clone_name),
		// 		'ResponsibilityExplorerInteraction',
		// 		'filename',
		// 		fileName
		// 	);
		// 	setPdfLoaded(false);
		// }
		e.preventDefault();
		setIframePreviewLink({
			responsibilityIdx: respKey,
			entityIdx: entKey,
			dataIdx: key,
		});
	}

	function handlePdfOnLoadStart() {
		if (!iframeLoading && !pdfLoaded) {
			try {
				if (selectedResponsibility.filename && !pdfLoaded) {
					const fileName = selectedResponsibility.filename + '_0';
					handlePdfOnLoad(
						'docPdfViewer',
						'viewerContainer',
						fileName,
						'PDF Viewer'
					);
					setPdfLoaded(true);
				}
			} catch (err) {
				console.log(err);
				console.log('Doc Explorer: failed to load pdf');
			}
		}
	}

	const getResponsibilityPageInfo = async (text) => {
		const payload = {
			filename: selectedResponsibility.filename,
			text
		}
		const { data } = await gameChangerAPI.getResponsibilityDocLink(payload);
		if(data){
			setHighlights([ {
				content: {},
				position: {
					boundingRect: {
						'x1': 100,
						'y1': 100,
						'x2': 101,
						'y2': 101,
						'width': 1,
						'height': 1320
					},
					'rects': [
						{
							'x1': 100,
							'y1': 100,
							'x2': 101,
							'y2': 101,
							'width': 1,
							'height': 1320
						}
					],
					'pageNumber': data.pageNumber + 1
				},
				'id': 0
			}])
			setDocumentLink(data.fileLink);
			setIframeLoading(false);
		}
	}

	const getMetadataForTable = () => {
		if(!Object.keys(responsibilityData).length) return [];
		const doc = Object.keys(responsibilityData)[iframePreviewLink.dataIdx];
		if(!doc) return [];
		const entity = Object.keys(responsibilityData[doc])[iframePreviewLink.entityIdx];
		const responsibility = responsibilityData[doc][entity][iframePreviewLink.responsibilityIdx];
		const keyMap = {
			filename: 'File Name',
			documentTitle: 'Document Title',
			organizationPersonnel: 'Organization/Personnel',
			responsibilityText: 'Responsibility Text',
			documentsReferenced: 'Documents Referenced'
		}
		const metaData = [];
		Object.keys(responsibility).forEach(key => {
			if(keyMap[key]){
				const editButtons = key === 'responsibilityText' || key === 'organizationPersonnel'
					? 
					<div className='row' style={{justifyContent: 'right'}}>
						{(key === 'responsibilityText' || isEditingEntity) && <GCButton
							onClick={() => {
								if(isEditingResp || isEditingEntity){
									setIsEditingEntity(false);
									setIsEditingResp(false);
									setDocumentLink('');
								}else{
									rejectResponsibility(selectedResponsibility);
								}
							}}
							style={{
								height: 40,
								minWidth: 40,
								padding: '2px 8px 0px',
								fontSize: 14,
								margin: '16px 0px 0px 10px',
								width: 'auto'
							}}
							isSecondaryBtn
							disabled={isEditingEntity && key === 'responsibilityText'}
						>
							{key === 'organizationPersonnel' && <>{'Cancel'}</>}
							{key === 'responsibilityText' && <>{isEditingResp ? 'Cancel' : 'Reject'}</>}
						</GCButton>}
						{!isEditingResp && key === 'responsibilityText' && <GCButton
							onClick={() => {
								getResponsibilityPageInfo(responsibility.responsibilityText);
								setIsEditingResp(true);
							}}
							style={{
								height: 40,
								minWidth: 40,
								padding: '2px 8px 0px',
								fontSize: 14,
								margin: '16px 0px 0px 10px',
								width: 'auto'
							}}
							disabled={isEditingEntity}
						>
							Edit
						</GCButton>}
						{!isEditingEntity && key === 'organizationPersonnel' && <GCButton
							onClick={() => {
								getResponsibilityPageInfo(responsibility.organizationPersonnel || responsibility.responsibilityText);
								setIsEditingEntity(true);
							}}
							style={{
								height: 40,
								minWidth: 40,
								padding: '2px 8px 0px',
								fontSize: 14,
								margin: '16px 0px 0px 10px',
								width: 'auto'
							}}
							disabled={isEditingResp}
						>
							Edit
						</GCButton>}
					</div>
					:
					<></>
				metaData.push({
					Key: keyMap[key],
					Value: <div style={{wordBreak: 'break-word'}}>
						{responsibility[key]}
						{editButtons}
					</div>
				})
			}
		})
		return metaData
	}

	const rejectResponsibility = (responsibility) => {
		gameChangerAPI.storeResponsibilityReportData({
			id: responsibility.id, 
			issue_description: 'review',
			updatedColumn: 'Reject',
			updatedText: ''
		}).then(() => {
			setIsEditingEntity(false);
			setIsEditingResp(false);
			createAlert(
				'Update Successful',
				'success',
				'Thank you for the help. Your update will now be reviewed before the responsiblity is updated.'
			);
		}).catch(() => {
			createAlert(
				'Update error',
				'error',
				'There was an error sending your responsibility update. Please try againg later.'
			);
		})
	}

	const updateResponsibility = (updatedResp, textPosition) => {
		const { id } = selectedResponsibility;
		let updatedColumn = '';
		if(isEditingResp){
			updatedColumn = 'responsibilityText';
		}else if(isEditingEntity){
			updatedColumn = 'organizationPersonnel';
		}
		gameChangerAPI.storeResponsibilityReportData({
			id, 
			issue_description: 'review',
			updatedColumn,
			updatedText: updatedResp,
			textPosition
		}).then(() => {
			setIsEditingEntity(false);
			setIsEditingResp(false);
			createAlert(
				'Update Successful',
				'success',
				'Thank you for the help. Your update will now be reviewed before the responsiblity is updated.'
			);
		}).catch(() => {
			createAlert(
				'Update error',
				'error',
				'There was an error sending your responsibility update. Please try againg later.'
			);
		})
	}

	const iframePanelSize =
		12 -
		(leftPanelOpen ? LEFT_PANEL_COL_WIDTH : 0) -
		(rightPanelOpen ? RIGHT_PANEL_COL_WIDTH : 0);

	let leftBarExtraStyles = {};
	let rightBarExtraStyles = { right: 0 };

	const colWidth = {
		minWidth: '75%',
		maxWidth: '75%',
	};

	if (!leftPanelOpen)
		leftBarExtraStyles = { marginLeft: 10, borderBottomLeftRadius: 10 };
	if (!rightPanelOpen)
		rightBarExtraStyles = { right: '10px', borderBottomRightRadius: 10 };

	return (
		<div
			className="row"
			style={{ height: 'calc(100% - 70px)', marginTop: 0, padding: 0, marginLeft: 0 }}
		>
			<div
				className={`col-xs-${LEFT_PANEL_COL_WIDTH}`}
				style={{
					display: leftPanelOpen ? 'block' : 'none',
					paddingRight: 10,
					paddingLeft: 0,
					borderRight: '1px solid lightgrey',
					height: '800px',
					overflow: 'scroll',
				}}
				ref={infiniteScrollRef}
			>
				<GCAccordion
					expanded={docTitle.length || organization.length || Object.keys(responsibilityText).length ? true : false}
					header={
						<span>FILTERS  {filters.length ? <span style={{color: '#ed691d'}}>{`(${filters.length})`}</span> : ''}</span>
					}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<div style={{ width: '100%' }}>
						<div style={{ width: '100%', marginBottom: 10 }}>
							<GCAccordion
								expanded={docTitle.length ? true : false}
								header={
									<span>
										DOCUMENT TITLE  {
											filters.filter(f => f.id === 'documentTitle').length ? 
												<span style={{color: '#ed691d'}}>{`(${filters.filter(f => f.id === 'documentTitle').length})`}</span> 
												: ''
										}
									</span>
								}
								headerBackground={'rgb(238,241,242)'}
								headerTextColor={'black'}
								headerTextWeight={'normal'}
							>
								<Autocomplete
									classes={{ root: classes.root }}
									key={clearFilters}
									multiple
									options={documentList}
									getOptionLabel={(option) => option.documentTitle}
									defaultValue={docTitle}
									onChange={(event, newValue) => {
										setDocTitle(newValue);
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											classes={{ root: classes.root }}
											variant="outlined"
											label="Document Titles"
										/>
									)}
								/>
							</GCAccordion>
						</div><div style={{ width: '100%', marginBottom: 10 }}>
							<GCAccordion
								expanded={organization.length ? true : false}
								header={
									<span>
										ORGANIZATION  {
											filters.filter(f => f.id === 'organizationPersonnel').length ? 
												<span style={{color: '#ed691d'}}>{`(${filters.filter(f => f.id === 'organizationPersonnel').length})`}</span> 
												: ''
										}
									</span>
								}
								headerBackground={'rgb(238,241,242)'}
								headerTextColor={'black'}
								headerTextWeight={'normal'}
							>
								<Autocomplete
									classes={{ root: classes.root }}
									key={clearFilters}
									multiple
									options={[]}
									freeSolo
									autoSelect
									getOptionLabel={(option) => option}
									defaultValue={organization}
									onChange={(event, newValue) => {
										setOrganization(newValue);
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											classes={{ root: classes.root }}
											variant="outlined"
											label="Organizations"
										/>
									)}
								/>
							</GCAccordion>
						</div>
						<div style={{ width: '100%', marginBottom: 10 }}>
							<GCAccordion
								expanded={Object.keys(responsibilityText).length ? true : false}
								header={
									<span>
										RESPONSIBILITY TEXT  {
											filters.filter(f => f.id === 'responsibilityText').length ? 
												<span style={{color: '#ed691d'}}>{`(${filters.filter(f => f.id === 'responsibilityText').length})`}</span> 
												: ''
										}
									</span>
								}
								headerBackground={'rgb(238,241,242)'}
								headerTextColor={'black'}
								headerTextWeight={'normal'}
							>
								<div style={{width:'100%'}}>
									<TextField
										classes={{ root: classes.root }}
										variant="outlined"
										placeholder='Responsibility Text'
										value={responsibilityText?.value || ''}
										onChange={(e) => setResponsibilityText({id: 'responsibilityText', value: e.target.value})}
									/>
								</div>
							</GCAccordion>
							<GCButton 
								onClick={() => {
									setIframePreviewLink({
										dataIdx: 0,
										entityIdx: 0,
										responsibilityIdx: 0
									})
									setResponsibilityText({});
									setOrganization([]);
									setDocTitle([]);
									setClearFilters(!clearFilters);
									setFilters([]);
									setResultsPage(1);
									setReloadResponsibilities(true);
								}}
								style={{display: 'block', width: '100%', margin: '20px 0 10px 0'}}
								isSecondaryBtn
							>
								Clear Filters
							</GCButton>
							<GCButton 
								onClick={() => {
									setIframePreviewLink({
										dataIdx: 0,
										entityIdx: 0,
										responsibilityIdx: 0
									})
									const filters = [];
									if(Object.keys(responsibilityText).length) filters.push(responsibilityText);
									if(organization.length) {
										organization.forEach(org => {
											filters.push({id: 'organizationPersonnel', value: org})
										})
									};
									if(docTitle.length) {
										docTitle.forEach(doc => {
											filters.push({id: 'documentTitle', value: doc.documentTitle})
										})
									};
									setFilters(filters);
									setResultsPage(1);
									setReloadResponsibilities(true);
								}}
								style={{display: 'block', width: '100%', margin: 0 }}
							>
								Update Search
							</GCButton>
						</div>
					</div>
				</GCAccordion>
				{Object.keys(responsibilityData).length > 0 &&
					_.map(Object.keys(responsibilityData), (doc, key) => {
						const docOpen = collapseKeys[doc] ? collapseKeys[doc] : false;
						const displayTitle = doc;
						return (
							<div key={key}>
								<div
									className="searchdemo-modal-result-header"
									onClick={(e) => {
										e.preventDefault();
										setCollapseKeys({ ...collapseKeys, [doc]: !docOpen });
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
									{Object.keys(responsibilityData[doc]).map((entity, entKey) =>{
										const entOpen = collapseKeys[(doc + entity)] ? collapseKeys[(doc + entity)] : false;
										return <div key={entKey}>
											<div
												className="searchdemo-modal-result-header"
												onClick={(e) => {
													e.preventDefault();
													setCollapseKeys({ ...collapseKeys, [doc + entity]: !entOpen });
												}}
												style={{marginLeft: 20, backgroundColor: '#eceff1'}}
											>
												<i
													style={{
														marginRight: entOpen ? 10 : 14,
														fontSize: 20,
														cursor: 'pointer',
													}}
													className={`fa fa-caret-${entOpen ? 'down' : 'right'}`}
												/>
												<span className="gc-document-explorer-result-header-text">
													{entity}
												</span>
											</div>
											<Collapse isOpened={entOpen && docOpen}>
												<div>
													{responsibilityData[doc][entity].map((responsibility, respKey) => {
														let isHighlighted = false;
														const dataObj = responsibilityData[doc];
														if (dataObj) {
															const pageObj =
																responsibilityData[doc][entity][
																	iframePreviewLink.entityIdx
																];
															if (pageObj) {
																const selectedDoc = Object.keys(responsibilityData)[iframePreviewLink.dataIdx]
																const selectedEntity = Object.keys(responsibilityData[selectedDoc])[iframePreviewLink.entityIdx] === 'NO ENTITY' ? null : Object.keys(responsibilityData[selectedDoc])[iframePreviewLink.entityIdx];
																isHighlighted =
																	selectedDoc === responsibility.documentTitle &&
																	selectedEntity === responsibility.organizationPersonnel &&
																	respKey === iframePreviewLink.responsibilityIdx;
															}
														}

														let blockquoteClass = 'searchdemo-blockquote-sm';

														if (isHighlighted)
															blockquoteClass +=
																' searchdemo-blockquote-sm-active';
														return (
															<div
																key={key + respKey}
																style={{ position: 'relative' }}
															>
																<div
																	className="searchdemo-quote-link"
																	onClick={(e) => {
																		handleQuoteLinkClick(e, respKey, entKey, key);
																	}}
																>
																	<div className={blockquoteClass} style={{marginLeft: 40}}>
																		<span>
																			{responsibility.responsibilityText}
																		</span>
																	</div>
																</div>
																{isHighlighted && (
																	<span className="searchdemo-arrow-right-sm"></span>
																)}
															</div>
														);
													})
													}
												</div>
											</Collapse>
										</div>
									})}
								</Collapse>
							</div>
						);
					})}
				{loading && (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={'#E9691D'} />
					</div>
				)}
			</div>
			<div
				className={`col-xs-${iframePanelSize}`}
				style={{ paddingLeft: 0, paddingRight: 0, height: 800}}
			>
				<div
					style={{
						display: 'flex',
						width: '100%',
						height: '100%',
						flexDirection: 'column',
					}}
				>
					<div
						className="searchdemo-vertical-bar-toggle"
						style={{ ...leftBarExtraStyles, bottom: '0px' }}
						onClick={() => handleLeftPanelToggle()}
					>
						<i
							className={`fa ${
								leftPanelOpen ? 'fa-rotate-270' : 'fa-rotate-90'
							} fa-angle-double-up`}
							style={{
								color: 'white',
								verticalAlign: 'sub',
								height: 20,
								width: 20,
								margin: '20px 0 20px 2px',
							}}
						/>
						<span>{leftPanelOpen ? 'Hide' : 'Show'} Search Results</span>
						<i
							className={`fa ${
								leftPanelOpen ? 'fa-rotate-270' : 'fa-rotate-90'
							} fa-angle-double-up`}
							style={{
								color: 'white',
								verticalAlign: 'sub',
								height: 20,
								width: 20,
								margin: '20px 0 20px 2px',
							}}
						/>
					</div>
					<div
						style={{
							paddingLeft: SIDEBAR_TOGGLE_WIDTH + (!leftPanelOpen ? 10 : 0),
							paddingRight: SIDEBAR_TOGGLE_WIDTH + (!rightPanelOpen ? 10 : 0),
							height: '100%',
						}}
					>
						<div style={{ height: '100%' }}>
							{selectedResponsibility.filename && (
								<iframe
									title={'PDFViewer'}
									className="aref"
									id={'PdfViewer'}
									ref={measuredRef}
									onLoad={handlePdfOnLoadStart}
									style={{
										borderStyle: 'none',
										display:
											!isEditingResp && !isEditingEntity && Object.keys(responsibilityData).length > 0 && !iframeLoading ? 'initial' : 'none',
									}}
									width="100%"
									height="100%%"
								></iframe>
							)}
							{(isEditingResp || isEditingEntity) &&
								<PDFHighlighter 
									handleSave={updateResponsibility}
									highlights={highlights}
									scrollId={'0'}
									saveActive={isEditingEntity || isEditingResp}
									documentLink={documentLink}
								/>
							}
						</div>
					</div>

					{iframeLoading && (
						<div style={{ margin: '0 auto' }}>
							<LoadingIndicator customColor={'#E9691D'} />
						</div>
					)}
					<div
						className="searchdemo-vertical-bar-toggle"
						style={{ ...rightBarExtraStyles, bottom: '0px', zIndex: 100 }}
						onClick={() => handleRightPanelToggle()}
					>
						<i
							className={`fa ${
								rightPanelOpen ? 'fa-rotate-90' : 'fa-rotate-270'
							} fa-angle-double-up`}
							style={{
								color: 'white',
								verticalAlign: 'sub',
								height: 20,
								width: 20,
								margin: '20px 0 20px 2px',
							}}
						/>
						<span>{rightPanelOpen ? 'Hide' : 'Show'} Metadata</span>
						<i
							className={`fa ${
								rightPanelOpen ? 'fa-rotate-90' : 'fa-rotate-270'
							} fa-angle-double-up`}
							style={{
								color: 'white',
								verticalAlign: 'sub',
								height: 20,
								width: 20,
								margin: '20px 0 20px 2px',
							}}
						/>
					</div>
				</div>
			</div>
			<div
				className={`col-xs-${RIGHT_PANEL_COL_WIDTH}`}
				style={{
					display: rightPanelOpen ? 'block' : 'none',
					padding: 0,
					borderLeft: '1px solid lightgrey',
					height: '800px',
					overflow: 'scroll',
					zIndex: 100
				}}
			>
				{ Object.keys(responsibilityData).length > 0 &&
				<SimpleTable
					tableClass={'magellan-table'}
					zoom={0.8}
					headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
					rows={getMetadataForTable()}
					height={'auto'}
					dontScroll={true}
					colWidth={colWidth}
					disableWrap={true}
					title={'Metadata'}
				/>
				}
			</div>
			{alertActive ? (
				<UOTAlert
					title={alertTitle}
					type={alertType}
					elementId="Admin-Button"
					message={alertMessage}
					onHide={() => setAlertActive(false)}
					containerStyles={{
						...adminStyles.alert, 
						top: 230,
						width: '88%',}}
				/>
			) : (
				<></>
			)}
		</div>
	);
}
