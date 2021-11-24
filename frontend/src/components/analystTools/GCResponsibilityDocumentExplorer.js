import React, { useEffect, useCallback, useState } from 'react';
import _ from 'underscore';
import { Collapse } from 'react-collapse';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
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

import Pagination from 'react-js-pagination';
import { trackEvent } from '../telemetry/Matomo';
// import GamechangerPdfViewer from '../documentViewer/PDFViewer'
import PDFHighlighter from './PDFHighlighter';
import GCButton from '../common/GCButton';
import UOTAlert from '../common/GCAlert';
import { styles as adminStyles} from '../../components/admin/util/GCAdminStyles'

const gameChangerAPI = new GameChangerAPI();
const grey800 = grey[800];
const SIDEBAR_TOGGLE_WIDTH = 20;
const LEFT_PANEL_COL_WIDTH = 3;
const RIGHT_PANEL_COL_WIDTH = 3;
const styles = {
	iframeHeader: {
		backgroundImage: 'linear-gradient(hsla(0,0%,32%,.99), hsla(0,0%,27%,.95))',
		height: 20,
		width: '100%',
		color: 'white',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		fontFamily: 'Montserrat',
		fontWeight: 'bold',
		fontSize: '1em',
	},
	docExplorerPag: {
		display: 'flex',
		width: '100%',
	},
};
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
	return new Promise((resolve, reject) => {
		gameChangerAPI
			.dataStorageDownloadGET(
				filename,
				responsibilityText,
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
	data = [],
	totalCount,
	resultsPage,
	docsPerPage,
	onPaginationClick,
	isClone = true,
	setReloadResponsibilities,
	docTitle, 
	setDocTitle,
	organization, 
	setOrganization,
	responsibilityText, 
	setResponsibilityText,
	setFilters,
	documentList
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
	const [prevIframPreviewLink, setPrevIframPreviewLink] = useState({
		dataIdx: -1,
		entityIdx: -1,
		responsibilityIdx: -1
	});
	const [iframeLoading, setIframeLoading] = useState(false);
	const [leftPanelOpen, setLeftPanelOpen] = useState(true);
	const [rightPanelOpen, setRightPanelOpen] = useState(true);
	const [pdfLoaded, setPdfLoaded] = useState(false);
	const [viewTogle, setViewTogle] = useState(false);
	const [fileUrl, setFileUrl] = useState(null);
	const [isEditingResp, setIsEditingResp] = useState(false);
	const [isEditingEntity, setIsEditingEntity] = useState(false);
	const [selectedResponsibility, setSelectedResponsibility] = useState({});
	const [documentLink, setDocumentLink] = useState('');
	const [clearFilters, setClearFilters] = useState(false);

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

	const measuredRef = useCallback(
		(node) => {
			if (node !== null) {
				const rec = Object.keys(responsibilityData).length;
				if (rec) {
					const pageNumber = 1;
					if (
						selectedResponsibility.filename &&
						JSON.stringify(prevIframPreviewLink) !==
							JSON.stringify(iframePreviewLink)
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
							setPrevIframPreviewLink(iframePreviewLink);
						});
					}
				}
			}
		},
		[
			iframePreviewLink,
			selectedResponsibility,
			prevIframPreviewLink,
			isClone,
			cloneData,
			responsibilityData,
		]
	);

	useEffect(() => {
		const getFileName = async () => {
			const payload = {
				filename: selectedResponsibility.filename,
				text: selectedResponsibility.updatedText
			}
			const { data } = await gameChangerAPI.getResponsibilityDocLink(payload);
			setDocumentLink(data);
		}
		getFileName();
	}, [selectedResponsibility])

	useEffect(() => {
		if(Object.keys(responsibilityData).length){
			const { dataIdx, entityIdx, responsibilityIdx } = iframePreviewLink;
			const doc = Object.keys(responsibilityData)[dataIdx];
			const entity = Object.keys(responsibilityData[doc])[entityIdx];
			const resp = responsibilityData[doc][entity][responsibilityIdx];
			if (resp) {
				setSelectedResponsibility(resp);
			}
		}
	}, [responsibilityData, iframePreviewLink]);

	useEffect(() => {
		if (!Object.keys(collapseKeys).length && Object.keys(responsibilityData).length) {
			let initialCollapseKeys = {};
			Object.keys(responsibilityData).forEach(doc => {
				initialCollapseKeys[doc] = false;
				Object.keys(responsibilityData[doc]).forEach(entity => {
					initialCollapseKeys[doc + entity] = false;
				})
			})
			setCollapseKeys(initialCollapseKeys);
		}
	}, [responsibilityData, collapseKeys]);

	function handleRightPanelToggle() {
		trackEvent(
			getTrackingNameForFactory(cloneData.clone_name),
			'DocumentExplorerInteraction',
			'RightPanelToggle',
			rightPanelOpen ? 'Close' : 'Open'
		);
		setRightPanelOpen(!rightPanelOpen);
	}

	function handleLeftPanelToggle() {
		trackEvent(
			getTrackingNameForFactory(cloneData.clone_name),
			'DocumentExplorerInteraction',
			'LeftPanelToggle',
			leftPanelOpen ? 'Close' : 'Open'
		);
		setLeftPanelOpen(!leftPanelOpen);
	}

	// This toggles whether the Document Header texts are open or not by setting collapseKeys
	function handleViewToggle() {
		if (collapseKeys) {
			let collapse = Object.assign({}, collapseKeys);
			for (let key in collapse) {
				collapse[key] = !viewTogle;
			}
			setCollapseKeys(collapse);
		}
		setViewTogle(!viewTogle);
	}

	function handleQuoteLinkClick(e, respKey, entKey, key) {
		const rec = data[key];
		if (rec) {
			const fileName = rec.id;
			const pageObj = rec.pageHits[entKey];
			const pageNumber = pageObj ? pageObj.pageNumber : 1;
			trackEvent(
				getTrackingNameForFactory(cloneData.clone_name),
				'DocumentExplorerInteraction',
				'PDFOpen'
			);
			trackEvent(
				getTrackingNameForFactory(cloneData.clone_name),
				'DocumentExplorerInteraction',
				'filename',
				fileName
			);
			trackEvent(
				getTrackingNameForFactory(cloneData.clone_name),
				'DocumentExplorerInteraction',
				'pageNumber',
				pageNumber
			);
			setPdfLoaded(false);
		}
		e.preventDefault();
		setIframePreviewLink({
			responsibilityIdx: respKey,
			entityIdx: entKey,
			dataIdx: key,
		});
	}

	function handlePdfOnLoadStart() {
		if (!iframeLoading && !pdfLoaded) {
			const { dataIdx } = iframePreviewLink;
			const rec = data[dataIdx];
			try {
				if (rec && !pdfLoaded) {
					const fileName = rec.id;
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

	const getMetadataForTable = () => {
		if(!Object.keys(responsibilityData).length) return [];
		const doc = Object.keys(responsibilityData)[iframePreviewLink.dataIdx];
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
								setIsEditingResp(true);
								setIframeLoading(false);
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
								setIsEditingEntity(true);
								setIframeLoading(false);
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
					Value: <>
						{responsibility[key]}
						{editButtons}
					</>
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

	const previewPathname =
		data.length > 0 &&
		data[iframePreviewLink.dataIdx] &&
		data[iframePreviewLink.dataIdx].filepath;
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
			style={{ height: 'calc(100% - 70px)', marginTop: '10px', padding: '2px 10px 2px 0px' }}
		>
			<div
				className={`col-xs-${LEFT_PANEL_COL_WIDTH}`}
				style={{
					display: leftPanelOpen ? 'block' : 'none',
					paddingRight: 10,
					borderRight: '1px solid lightgrey',
					height: '800px',
					overflow: 'scroll',
				}}
			>
				<div
					className='doc-exp-nav'
					style={{  
						color: grey800, 
						fontWeight: 'bold', 
						display: 'flex',
						marginBottom: '10px'
					}}
				>
					<div
						style={styles.docExplorerPag}
						className="gcPagination docExplorerPag"
					>
						<Pagination
							activePage={resultsPage}
							itemsCountPerPage={docsPerPage}
							totalItemsCount={totalCount}
							pageRangeDisplayed={3}
							onChange={(page) => {
								trackEvent(
									getTrackingNameForFactory(cloneData.clone_name),
									'DocumentExplorerInteraction',
									'Pagination',
									page
								);
								setIframePreviewLink({
									dataIdx: 0,
									entityIdx: 0,
									responsibilityIdx: 0
								})
								setCollapseKeys({});
								onPaginationClick(page);
							}}
						/>
					</div>
					{totalCount ? (
						<div>
							<div 
								style={{ 
									display: 'flex',
									height: 45,
									width: 45,
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: 18,
									borderRadius: 4,
									marginRight: 2  
								}}
								className="view-toggle" 
								onClick={() => handleViewToggle()}
							>
								{viewTogle ? '-' : '+'}
							</div>
						</div>
					) : (
						'Make a search to get started.'
					)}
				</div>
				<GCAccordion
					expanded={!state.searchSettings.publicationDateAllTime}
					header={'FILTERS'}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'normal'}
				>
					<div style={{ width: '100%' }}>
						<div style={{ width: '100%', marginBottom: 10 }}>
							<GCAccordion
								expanded={!state.searchSettings.publicationDateAllTime}
								header={'DOCUMENT TITLE'}
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
								expanded={!state.searchSettings.publicationDateAllTime}
								header={'ORGANIZATION'}
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
								expanded={!state.searchSettings.publicationDateAllTime}
								header={'RESPONSIBILITY TEXT'}
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
									setResponsibilityText({});
									setOrganization([]);
									setDocTitle([]);
									setClearFilters(!clearFilters);
								}}
								style={{display: 'block', width: '100%', margin: '20px 0 10px 0'}}
								isSecondaryBtn
							>
								Clear Filters
							</GCButton>
							<GCButton 
								onClick={() => {
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
									setReloadResponsibilities(true);
								}}
								style={{display: 'block', width: '100%', margin: 0 }}
							>
								Update Search
							</GCButton>
						</div>
					</div>
				</GCAccordion>
				{loading && (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={'#E9691D'} />
					</div>
				)}
				{!loading &&
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
									{/* <span
										style={{ width: 30, marginLeft: 'auto' }}
										className="badge"
									>
										{item.pageHitCount}
									</span> */}
								</div>
								<Collapse isOpened={docOpen}>
									{Object.keys(responsibilityData[doc]).map((entity, entKey) =>{
										const entOpen = collapseKeys[(doc + entity)] ? collapseKeys[(doc + entity)] : false;
										return <>
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
												{/* <span
											style={{ width: 30, marginLeft: 'auto' }}
												className="badge"
											>
												{item.pageHitCount}
											</span> */}
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
										</>
									})}
								</Collapse>
							</div>
						);
					})}
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
					{!iframeLoading && previewPathname && (
						<div className="preview-pathname" style={styles.iframeHeader}>
							{previewPathname}
						</div>
					)}
					<div
						style={{
							paddingLeft: SIDEBAR_TOGGLE_WIDTH + (!leftPanelOpen ? 10 : 0),
							paddingRight: SIDEBAR_TOGGLE_WIDTH + (!rightPanelOpen ? 10 : 0),
							height: '100%',
						}}
					>
						<div style={{ height: '100%' }}>
							{false ?
							// {!isEditingResp || isEditingEntity ?
								<>
									{selectedResponsibility.filename && selectedResponsibility.filename.endsWith('pdf') && (
										<iframe
											title={'PDFViewer'}
											className="aref"
											id={'PdfViewer'}
											ref={measuredRef}
											onLoad={handlePdfOnLoadStart}
											style={{
												borderStyle: 'none',
												display:
                                                data.length > 0 && !iframeLoading ? 'initial' : 'none',
											}}
											width="100%"
											height="100%%"
										></iframe>
									)}

									{selectedResponsibility.filename && selectedResponsibility.filename.endsWith('html') && (
										<iframe
											title={'PDFViewer'}
											className="aref"
											id={'pdfViewer'}
											src={fileUrl}
											style={{ width: '100%', height: '100%' }}
										></iframe>
									)}
								</>
								:
								<PDFHighlighter 
									handleSave={updateResponsibility}
									highlights={[]}
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
					paddingLeft: 0,
					borderLeft: '1px solid lightgrey',
					height: '800px',
					overflow: 'scroll',
					zIndex: 100
				}}
			>
				{ !loading &&
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
