import React, { useEffect, useCallback, useState } from 'react';
import _ from 'underscore';
import GameChangerAPI from '../api/gameChanger-service-api';
import { Collapse } from 'react-collapse';
import SimpleTable from '../common/SimpleTable';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator.js';
import '../cards/keyword-result-card.css';
import '../../containers/gamechanger.css';
import grey from '@material-ui/core/colors/grey';
import {
	handlePdfOnLoad,
	getTrackingNameForFactory,
} from '../../utils/gamechangerUtils';

import Pagination from 'react-js-pagination';
import { trackEvent } from '../telemetry/Matomo';
// import GamechangerPdfViewer from '../documentViewer/PDFViewer'
import PDFHighlighter from './PDFHighlighter';

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

const getIframePreviewLinkInferred = (
	filename,
	prevSearchText,
	pageNumber,
	isClone = false,
	cloneData = {}
) => {
	return new Promise((resolve, reject) => {
		gameChangerAPI
			.dataStorageDownloadGET(
				filename,
				prevSearchText,
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
	responsibilityData,
	loading,
	data = [],
	totalCount = 100,
	prevSearchText = '',
	resultsPage,
	resultsPerPage,
	onPaginationClick,
	isClone = true,
}) {

	const { cloneData } = state;

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
		responsibilityIdx: 0
	});
	const [iframeLoading, setIframeLoading] = useState(false);
	const [leftPanelOpen, setLeftPanelOpen] = useState(true);
	const [rightPanelOpen, setRightPanelOpen] = useState(true);
	const [pdfLoaded, setPdfLoaded] = useState(false);
	const [viewTogle, setViewTogle] = useState(false);
	const [fileUrl, setFileUrl] = useState(null);
	const [filename, setFilename] = useState(null);
	const [isEditing, setIsEditing] = useState(true);

	const measuredRef = useCallback(
		(node) => {
			if (node !== null) {
				const { dataIdx, entityIdx, responsibilityIdx } = iframePreviewLink;
				const rec = data[dataIdx];
				if (rec) {
					// const filepath = rec.filepath;

					const pageObj = rec.pageHits ? rec.pageHits[entityIdx] : {};
					const pageNumber = pageObj ? pageObj.pageNumber : 1;
					if (
						filename &&
						JSON.stringify(prevIframPreviewLink) !==
							JSON.stringify(iframePreviewLink)
					) {
						setIframeLoading(true);
						getIframePreviewLinkInferred(
							filename,
							prevSearchText,
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
			prevSearchText,
			prevIframPreviewLink,
			isClone,
			cloneData,
			data,
			filename,
		]
	);

	useEffect(() => {
		const { dataIdx } = iframePreviewLink;
		const rec = data[dataIdx];
		if (rec) {
			setFilename(rec.filename);
			setFileUrl(rec.download_url_s);
		}
	}, [filename, data, iframePreviewLink]);

	useEffect(() => {
		if (!collapseKeys) {
			let initialCollapseKeys = {};
			_.each(data, (d, k) => {
				initialCollapseKeys[k] = false;
			});
			setCollapseKeys(initialCollapseKeys);
		}
	}, [data, collapseKeys]);

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

	const getMetadataForTable = (data) => {
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
				metaData.push({
					Key: keyMap[key],
					Value: responsibility[key]
				})
			}
		})
		return metaData
	}

	const previewPathname =
		data.length > 0 &&
		data[iframePreviewLink.dataIdx] &&
		data[iframePreviewLink.dataIdx].filepath;
	const iframePanelSize =
		12 -
		(leftPanelOpen ? LEFT_PANEL_COL_WIDTH : 0) -
		(rightPanelOpen ? RIGHT_PANEL_COL_WIDTH : 0);

	// This checks if there are any documents loaded and assigns the default collapse keys to the cards default to open.
	if (
		collapseKeys &&
		Object.keys(collapseKeys).length === 0 &&
		data.length > 0
	) {
		let collapseDictionary = {};
		for (let i = 0; i < data.length; i++) {
			collapseDictionary[i.toString()] = false;
		}
		setCollapseKeys(collapseDictionary);
	}

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
			style={{ height: 'calc(100% - 70px)', marginTop: '10px' }}
		>
			<div
				className={`col-xs-${LEFT_PANEL_COL_WIDTH}`}
				style={{
					display: leftPanelOpen ? 'block' : 'none',
					paddingRight: 0,
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
							itemsCountPerPage={resultsPerPage}
							totalItemsCount={totalCount}
							pageRangeDisplayed={3}
							onChange={(page) => {
								trackEvent(
									getTrackingNameForFactory(cloneData.clone_name),
									'DocumentExplorerInteraction',
									'Pagination',
									page
								);
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
								{viewTogle ? '+' : '-'}
							</div>
						</div>
					) : (
						'Make a search to get started.'
					)}
				</div>

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
												style={{marginLeft: 20}}
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
																<a
																	href="#noref"
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
																</a>
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
				style={{ paddingLeft: 0, paddingRight: 0 }}
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
							{!isEditing ?
								<>
									{filename && filename.endsWith('pdf') && (
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

									{filename && filename.endsWith('html') && (
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
								<PDFHighlighter />
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
					rows={getMetadataForTable(responsibilityData)}
					height={'auto'}
					dontScroll={true}
					colWidth={colWidth}
					disableWrap={true}
					title={'Metadata'}
				/>
				}
			</div>
		</div>
	);
}
