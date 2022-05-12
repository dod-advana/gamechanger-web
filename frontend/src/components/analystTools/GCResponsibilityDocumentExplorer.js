import React, { useEffect, useCallback, useState } from 'react';
import _ from 'underscore';
import { UnmountClosed } from 'react-collapse';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import GameChangerAPI from '../api/gameChanger-service-api';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator.js';
import '../cards/keyword-result-card.css';
import '../../containers/gamechanger.css';
import GCAccordion from '../common/GCAccordion';
import GCTooltip from '../common/GCToolTip';
import { handlePdfOnLoad, getTrackingNameForFactory } from '../../utils/gamechangerUtils';
import { trackEvent } from '../telemetry/Matomo';
import PDFHighlighter from './PDFHighlighter';
import GCButton from '../common/GCButton';
import UOTAlert from '../common/GCAlert';
import GCResponsiblityEditModal from './GCResponsiblityEditModal';
import { styles as adminStyles } from '../../components/admin/util/GCAdminStyles';

const gameChangerAPI = new GameChangerAPI();
const SIDEBAR_TOGGLE_WIDTH = 20;
const LEFT_PANEL_COL_WIDTH = 2;
const RIGHT_PANEL_COL_WIDTH = 4;
const useStyles = makeStyles({
	root: {
		width: '100%',
		'&[class*="MuiAutocomplete-root"] [class*="MuiOutlinedInput-root"]': {
			paddingRight: '45px !important',
		},
	},
});

const cleanHighlightText = (text) => {
	if (text) {
		text = text.replace(/&/g, '%26');
		//solution for discrepancy in PDF text having extra space after letters and numbers at beginning of responsibilities
		const textArray = text.split(' ');
		if (textArray[0].match(/(\(\w{1,2}\)|\w{1,2}\.)/)) textArray[0] += ' ';
		text = textArray.join(' ');
		return text;
	} else {
		return '';
	}
};

const getIframePreviewLinkInferred = (
	filename,
	responsibilityText,
	entityText,
	pageNumber,
	isClone = false,
	cloneData = {}
) => {
	responsibilityText = cleanHighlightText(responsibilityText);
	entityText = cleanHighlightText(entityText);
	let highlight;
	if (entityText) {
		highlight = [entityText, responsibilityText];
	} else {
		highlight = `"${responsibilityText}"`;
	}
	return new Promise((resolve, reject) => {
		gameChangerAPI
			.dataStorageDownloadGET(filename, highlight, pageNumber, isClone, cloneData)
			.then((url) => {
				resolve(url);
			})
			.catch((e) => {
				reject(e);
			});
	});
};

export default function ResponsibilityDocumentExplorer({
	state,
	responsibilityData = {},
	loading,
	totalCount,
	setResultsPage,
	infiniteCount,
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
	infiniteScrollRef,
}) {
	const { cloneData } = state;
	const classes = useStyles();

	const [collapseKeys, setCollapseKeys] = useState({});
	const [iframeLoading, setIframeLoading] = useState(false);
	const [leftPanelOpen, setLeftPanelOpen] = useState(true);
	const [rightPanelOpen, setRightPanelOpen] = useState(true);
	const [pdfLoaded, setPdfLoaded] = useState(false);
	const [isEditingResp, setIsEditingResp] = useState(false);
	const [isEditingEntity, setIsEditingEntity] = useState(false);
	const [selectedResponsibility, setSelectedResponsibility] = useState({});
	const [documentLink, setDocumentLink] = useState('');
	const [clearFilters, setClearFilters] = useState(false);
	const [highlights, setHighlights] = useState([]);

	const [alertActive, setAlertActive] = useState(false);
	const [alertTitle, setAlertTitle] = useState('');
	const [alertType, setAlertType] = useState('');
	const [alertMessage, setAlertMessage] = useState('');
	const [editModalOpen, setEditModalOpen] = useState(false);

	const createAlert = (title, type, message) => {
		setAlertTitle(title);
		setAlertType(type);
		setAlertMessage(message);
		setAlertActive(true);
	};

	useEffect(() => {
		if (!iframeLoading) {
			setTimeout(() => {
				const notFound = document
					.getElementById('PdfViewer')
					?.contentWindow?.document.getElementsByClassName('notFound');
				if (notFound?.length) {
					createAlert(
						'Text Not Found',
						'error',
						'The exact respsonsibility text could not be found in the PDF due to a discrepancy'
					);
				}
			}, 2000);
		}
	}, [iframeLoading]);

	useEffect(() => {
		if (Object.keys(responsibilityData).length && infiniteCount === 1) {
			let initialCollapseKeys = {};
			Object.keys(responsibilityData).forEach((doc) => {
				initialCollapseKeys[doc] = false;
				Object.keys(responsibilityData[doc]).forEach((entity) => {
					initialCollapseKeys[doc + entity] = false;
				});
			});
			setCollapseKeys(initialCollapseKeys);
			const doc = Object.keys(responsibilityData)[0];
			const entity = Object.keys(responsibilityData[doc])[0];

			setSelectedResponsibility(responsibilityData[doc][entity][0]);
		} else if (!Object.keys(responsibilityData).length) {
			setSelectedResponsibility({});
		}
	}, [responsibilityData, infiniteCount]);

	useEffect(() => {
		setIsEditingEntity(false);
		setIsEditingResp(false);
		setDocumentLink('');
	}, [selectedResponsibility]);

	const measuredRef = useCallback(
		(node) => {
			if (node !== null) {
				if (Object.keys(selectedResponsibility).length) {
					const pageNumber = 1;
					if (selectedResponsibility.filename) {
						setIframeLoading(true);
						getIframePreviewLinkInferred(
							selectedResponsibility.filename,
							selectedResponsibility.responsibilityText,
							selectedResponsibility.organizationPersonnel,
							pageNumber,
							isClone,
							cloneData
						)
							.then((url) => {
								node.src = url;
								setIframeLoading(false);
							})
							.catch(() => {
								setIframeLoading(false);
								createAlert(
									'Error Loading PDF',
									'error',
									'It looks like this document has been canceled or removed from GAMECHANGER. We apologize for the inconvenience. Please contact the GAMECHANGER support team if you believe this is a mistake.'
								);
							});
					}
				}
			}
		},
		[selectedResponsibility, isClone, cloneData]
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

	function handleQuoteLinkClick(e, resp) {
		e.preventDefault();
		setSelectedResponsibility(resp);
	}

	function handlePdfOnLoadStart() {
		if (!iframeLoading && !pdfLoaded) {
			try {
				if (selectedResponsibility.filename && !pdfLoaded) {
					const fileName = selectedResponsibility.filename + '_0';
					handlePdfOnLoad('docPdfViewer', 'viewerContainer', fileName, 'PDF Viewer');
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
			text,
		};
		const { data } = await gameChangerAPI.getResponsibilityDocLink(payload);
		if (data) {
			setHighlights([
				{
					content: {},
					position: {
						boundingRect: {
							x1: 100,
							y1: 100,
							x2: 101,
							y2: 101,
							width: 1,
							height: 1320,
						},
						rects: [
							{
								x1: 100,
								y1: 100,
								x2: 101,
								y2: 101,
								width: 1,
								height: 1320,
							},
						],
						pageNumber: data.pageNumber + 1,
					},
					id: 0,
				},
			]);
			setDocumentLink(data.fileLink);
			setIframeLoading(false);
		}
	};

	const rejectResponsibility = () => {
		gameChangerAPI
			.storeResponsibilityReportData({
				id: selectedResponsibility.id,
				issue_description: 'review',
				updatedColumn: 'Reject',
				updatedText: '',
			})
			.then(() => {
				setIsEditingEntity(false);
				setIsEditingResp(false);
				createAlert(
					'Update Successful',
					'success',
					'Thank you for the help. Your update will now be reviewed before the responsiblity is updated.'
				);
			})
			.catch(() => {
				createAlert(
					'Update error',
					'error',
					'There was an error sending your responsibility update. Please try againg later.'
				);
			});
	};

	const updateResponsibility = (updatedResp, textPosition) => {
		const { id } = selectedResponsibility;
		let updatedColumn = '';
		if (isEditingResp) {
			updatedColumn = 'responsibilityText';
		} else if (isEditingEntity) {
			updatedColumn = 'organizationPersonnel';
		}
		gameChangerAPI
			.storeResponsibilityReportData({
				id,
				issue_description: 'review',
				updatedColumn,
				updatedText: updatedResp,
				textPosition,
			})
			.then(() => {
				setIsEditingEntity(false);
				setIsEditingResp(false);
				createAlert(
					'Update Successful',
					'success',
					'Thank you for the help. Your update will now be reviewed before the responsiblity is updated.'
				);
			})
			.catch(() => {
				createAlert(
					'Update error',
					'error',
					'There was an error sending your responsibility update. Please try againg later.'
				);
			});
	};

	const editResponsibility = () => {
		getResponsibilityPageInfo(selectedResponsibility.responsibilityText);
		setIsEditingResp(true);
	};

	const editEntity = () => {
		getResponsibilityPageInfo(
			selectedResponsibility.organizationPersonnel || selectedResponsibility.responsibilityText
		);
		setIsEditingEntity(true);
	};

	const iframePanelSize =
		12 - (leftPanelOpen ? LEFT_PANEL_COL_WIDTH : 0) - (rightPanelOpen ? RIGHT_PANEL_COL_WIDTH : 0);

	let leftBarExtraStyles = {};
	let rightBarExtraStyles = { right: 0 };

	if (!leftPanelOpen) leftBarExtraStyles = { marginLeft: 10, borderBottomLeftRadius: 10 };
	if (!rightPanelOpen) rightBarExtraStyles = { right: '10px', borderBottomRightRadius: 10 };

	return (
		<div className="row" style={{ height: 'calc(100% - 70px)', marginTop: 0, padding: 0, marginLeft: 0 }}>
			<div
				id="re-document-col"
				className={`col-xs-${LEFT_PANEL_COL_WIDTH}`}
				style={{
					display: leftPanelOpen ? 'block' : 'none',
					paddingRight: 10,
					paddingLeft: 0,
					borderRight: '1px solid lightgrey',
					height: '800px',
					overflowY: 'auto',
				}}
			>
				<div style={{ fontSize: 16, marginBottom: 10, fontFamily: 'Montserrat', fontWeight: '600' }}>
					FILTERS {filters.length ? <span style={{ color: '#ed691d' }}>{`(${filters.length})`}</span> : ''}
				</div>
				<div style={{ width: '100%' }}>
					<div style={{ width: '100%', marginBottom: 10 }}>
						<GCAccordion
							expanded={filters.find((filter) => filter.id === 'documentTitle') ? true : false}
							header={
								<span>
									DOCUMENT TITLE{' '}
									{filters.filter((f) => f.id === 'documentTitle').length ? (
										<span style={{ color: '#ed691d' }}>{`(${
											filters.filter((f) => f.id === 'documentTitle').length
										})`}</span>
									) : (
										''
									)}
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
					</div>
					<div style={{ width: '100%', marginBottom: 10 }}>
						<GCAccordion
							expanded={filters.find((filter) => filter.id === 'organizationPersonnel') ? true : false}
							header={
								<span>
									ORGANIZATION{' '}
									{filters.filter((f) => f.id === 'organizationPersonnel').length ? (
										<span style={{ color: '#ed691d' }}>{`(${
											filters.filter((f) => f.id === 'organizationPersonnel').length
										})`}</span>
									) : (
										''
									)}
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
							expanded={filters.find((filter) => filter.id === 'responsibilityText') ? true : false}
							header={
								<span>
									RESPONSIBILITY TEXT{' '}
									{filters.filter((f) => f.id === 'responsibilityText').length ? (
										<span style={{ color: '#ed691d' }}>{`(${
											filters.filter((f) => f.id === 'responsibilityText').length
										})`}</span>
									) : (
										''
									)}
								</span>
							}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'normal'}
						>
							<div style={{ width: '100%' }}>
								<TextField
									classes={{ root: classes.root }}
									variant="outlined"
									placeholder="Responsibility Text"
									value={responsibilityText?.value || ''}
									onChange={(e) =>
										setResponsibilityText({ id: 'responsibilityText', value: e.target.value })
									}
								/>
							</div>
						</GCAccordion>
						<GCButton
							onClick={() => {
								setResponsibilityText({});
								setOrganization([]);
								setDocTitle([]);
								setClearFilters(!clearFilters);
								setFilters([]);
								setResultsPage(1);
								setReloadResponsibilities(true);
							}}
							style={{ display: 'block', width: '100%', margin: '20px 0 10px 0' }}
							isSecondaryBtn
						>
							Clear Filters
						</GCButton>
						<GCButton
							onClick={() => {
								const filters = [];
								if (Object.keys(responsibilityText).length) filters.push(responsibilityText);
								if (organization.length) {
									organization.forEach((org) => {
										filters.push({ id: 'organizationPersonnel', value: org });
									});
								}
								if (docTitle.length) {
									docTitle.forEach((doc) => {
										filters.push({ id: 'documentTitle', value: doc.documentTitle });
									});
								}
								setCollapseKeys({});
								setFilters(filters);
								setResultsPage(1);
								setReloadResponsibilities(true);
							}}
							style={{ display: 'block', width: '100%', margin: 0 }}
						>
							Update Search
						</GCButton>
					</div>
				</div>
			</div>
			<div
				className={`col-xs-${iframePanelSize}`}
				style={{ paddingLeft: 0, paddingRight: 0, height: 800, position: 'relative' }}
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
							className={`fa ${leftPanelOpen ? 'fa-rotate-270' : 'fa-rotate-90'} fa-angle-double-up`}
							style={{
								color: 'white',
								verticalAlign: 'sub',
								height: 20,
								width: 20,
								margin: '20px 0 20px 2px',
							}}
						/>
						<span>{leftPanelOpen ? 'Hide' : 'Show'} Filters</span>
						<i
							className={`fa ${leftPanelOpen ? 'fa-rotate-270' : 'fa-rotate-90'} fa-angle-double-up`}
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
											!isEditingResp &&
											!isEditingEntity &&
											Object.keys(responsibilityData).length > 0 &&
											!iframeLoading
												? 'initial'
												: 'none',
									}}
									width="100%"
									height="100%%"
								></iframe>
							)}
							{(isEditingResp || isEditingEntity) && (
								<PDFHighlighter
									handleSave={updateResponsibility}
									highlights={highlights}
									scrollId={'0'}
									saveActive={isEditingEntity || isEditingResp}
									documentLink={documentLink}
								/>
							)}
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
							className={`fa ${rightPanelOpen ? 'fa-rotate-90' : 'fa-rotate-270'} fa-angle-double-up`}
							style={{
								color: 'white',
								verticalAlign: 'sub',
								height: 20,
								width: 20,
								margin: '20px 0 20px 2px',
							}}
						/>
						<span>{rightPanelOpen ? 'Hide' : 'Show'} Search Results</span>
						<i
							className={`fa ${rightPanelOpen ? 'fa-rotate-90' : 'fa-rotate-270'} fa-angle-double-up`}
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
					paddingRight: 0,
					borderLeft: '1px solid lightgrey',
					height: '800px',
					overflowY: 'auto',
					zIndex: 100,
				}}
				ref={infiniteScrollRef}
			>
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
									style={{ marginTop: 0 }}
								>
									<i
										style={{
											marginRight: docOpen ? 10 : 14,
											fontSize: 20,
											cursor: 'pointer',
										}}
										className={`fa fa-caret-${docOpen ? 'down' : 'right'}`}
									/>
									<span className="gc-document-explorer-result-header-text">{displayTitle}</span>
									{docOpen && (
										<GCButton
											onClick={(e) => {
												trackEvent(
													getTrackingNameForFactory(cloneData.clone_name),
													'CardInteraction',
													'showDocumentDetails'
												);
												window.open(
													`#/gamechanger-details?cloneName=${
														cloneData.clone_name
													}&type=document&documentName=${
														responsibilityData[doc][
															Object.keys(responsibilityData[doc])[0]
														][0].filename
													}_0`
												);
												e.preventDefault();
											}}
										>
											Details
										</GCButton>
									)}
								</div>
								<UnmountClosed isOpened={docOpen}>
									{Object.keys(responsibilityData[doc]).map((entity, entKey) => {
										const entOpen = collapseKeys[doc + entity] ? collapseKeys[doc + entity] : false;
										return (
											<div key={entKey}>
												<div
													className="searchdemo-modal-result-header"
													onClick={(e) => {
														e.preventDefault();
														setCollapseKeys({ ...collapseKeys, [doc + entity]: !entOpen });
													}}
													style={{ margin: '0 0 0 20px', backgroundColor: '#eceff1' }}
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
												<UnmountClosed isOpened={entOpen && docOpen}>
													<div>
														{responsibilityData[doc][entity].map(
															(responsibility, respKey) => {
																let isHighlighted =
																	selectedResponsibility.responsibilityText ===
																	responsibility.responsibilityText;
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
																				handleQuoteLinkClick(e, responsibility);
																			}}
																		>
																			<div
																				className={blockquoteClass}
																				style={{
																					marginLeft: 40,
																					marginRight: 0,
																					borderLeft: 'none',
																				}}
																			>
																				<span>
																					{responsibility.responsibilityText}
																				</span>
																			</div>
																		</div>
																		{isHighlighted && (
																			<span
																				style={{
																					left: 20,
																					borderTop: '14px solid transparent',
																					borderBottom:
																						'14px solid transparent',
																				}}
																				className="searchdemo-arrow-left-sm"
																			></span>
																		)}
																		<UnmountClosed isOpened={isHighlighted}>
																			<div
																				className="searchdemo-blockquote-sm"
																				style={{
																					marginLeft: 40,
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
																					{responsibility.responsibilityText}
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
																							'Report any existing issues with this data'
																						}
																						placement="Top"
																						arrow
																					>
																						<div>
																							<GCButton
																								onClick={() => {
																									if (
																										isEditingResp ||
																										isEditingEntity
																									) {
																										setIsEditingResp(
																											false
																										);
																										setIsEditingEntity(
																											false
																										);
																										setDocumentLink(
																											''
																										);
																									} else {
																										setEditModalOpen(
																											true
																										);
																									}
																								}}
																								style={{
																									height: 40,
																									minWidth: 40,
																									padding:
																										'2px 8px 0px',
																									fontSize: 14,
																									margin: '16px 0px 0px 10px',
																									width: 'auto',
																								}}
																								isSecondaryBtn={
																									isEditingEntity ||
																									isEditingResp
																								}
																							>
																								{isEditingEntity ||
																								isEditingResp
																									? 'Cancel'
																									: 'Report Issue'}
																							</GCButton>
																						</div>
																					</GCTooltip>
																				</div>
																			</div>
																		</UnmountClosed>
																	</div>
																);
															}
														)}
													</div>
												</UnmountClosed>
											</div>
										);
									})}
								</UnmountClosed>
							</div>
						);
					})}
				{Object.keys(responsibilityData).length < 1 && !loading && (
					<div
						style={{
							fontSize: 24,
							fontFamily: 'Montserrat',
							borderBottom: '2px solid #BCCBDB',
							display: 'flex',
							placeContent: 'space-between',
							marginTop: 20,
						}}
					>
						<div className={'text'}>No results found</div>
					</div>
				)}
				{loading && (
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={'#E9691D'} />
					</div>
				)}
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
						top: 31,
						left: '50px',
						width: 'calc(100% - 50px)',
						marginLeft: 0,
						zIndex: 1011,
					}}
				/>
			) : (
				<></>
			)}
			<GCResponsiblityEditModal
				open={editModalOpen}
				setOpen={setEditModalOpen}
				responsibility={selectedResponsibility.responsibilityText}
				entity={selectedResponsibility.organizationPersonnel ?? 'NO ENTITY'}
				editEntity={editEntity}
				editResponsibility={editResponsibility}
				rejectResponsibility={rejectResponsibility}
			/>
		</div>
	);
}
