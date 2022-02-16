import React, { useEffect, useCallback } from 'react';
import _ from 'underscore';
import GameChangerAPI from '../../api/gameChanger-service-api';
import { Collapse } from 'react-collapse';
import SimpleTable from '../../common/SimpleTable';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator.js';
// import { primary } from "../experimental/uot-colors";
import '../../cards/keyword-result-card.css';
import '../../../containers/gamechanger.css';
import grey from '@material-ui/core/colors/grey';
import {
	getReferenceListMetadataPropertyTable,
	getMetadataForPropertyTable,
	handlePdfOnLoad,
	getTrackingNameForFactory,
} from '../../../utils/gamechangerUtils';

import Pagination from 'react-js-pagination';
import { trackEvent } from '../../telemetry/Matomo';
import sanitizeHtml from 'sanitize-html';

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
		// fontFamily: 'Noto Sans',
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
	cloneData = {},
	isDLA = false
) => {
	return new Promise((resolve, reject) => {
		gameChangerAPI
			.dataStorageDownloadGET(
				filename,
				prevSearchText,
				pageNumber,
				isClone,
				cloneData,
				isDLA
			)
			.then((url) => {
				resolve(url);
			});
	});
};

export default function DocumentExplorer({
	data = [],
	totalCount,
	searchText = '',
	prevSearchText = '',
	loading,
	resultsPage,
	resultsPerPage,
	onPaginationClick,
	isClone = false,
	cloneData = {},
}) {
	// Set out state variables and access functions
	const [collapseKeys, setCollapseKeys] = React.useState(null);
	const [iframePreviewLink, setIframePreviewLink] = React.useState({
		dataIdx: 0,
		pageHitIdx: 0,
	});
	const [prevIframPreviewLink, setPrevIframPreviewLink] = React.useState({
		dataIdx: -1,
		pageHitIdx: -1,
	});
	const [iframeLoading, setIframeLoading] = React.useState(false);
	const [leftPanelOpen, setLeftPanelOpen] = React.useState(true);
	const [rightPanelOpen, setRightPanelOpen] = React.useState(true);
	const [pdfLoaded, setPdfLoaded] = React.useState(false);
	const [viewTogle, setViewTogle] = React.useState(false);
	const [fileUrl, setFileUrl] = React.useState(null);
	const [filename, setFilename] = React.useState(null);

	const measuredRef = useCallback(
		(node) => {
			if (node !== null) {
				const { dataIdx, pageHitIdx } = iframePreviewLink;
				const rec = data[dataIdx];
				if (rec) {
					const isDLA = rec.display_org_s === 'Defense Logistics Agency';

					const pageObj = rec.pageHits ? rec.pageHits[pageHitIdx] : {};
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
							cloneData,
							isDLA
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

	function handleQuoteLinkClick(e, pageKey, key) {
		const rec = data[key];
		if (rec) {
			const fileName = rec.id;
			const pageObj = rec.pageHits[pageKey];
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
			pageHitIdx: pageKey,
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

	const previewPathname =
		data.length > 0 &&
		data[iframePreviewLink.dataIdx] &&
		data[iframePreviewLink.dataIdx].filepath;
	const previewData =
		(data.length > 0 &&
			data[iframePreviewLink.dataIdx] &&
			getMetadataForPropertyTable(data[iframePreviewLink.dataIdx])) ||
		[];
	const previewDataReflist =
		(data.length > 0 &&
			data[iframePreviewLink.dataIdx] &&
			getReferenceListMetadataPropertyTable(
				data[iframePreviewLink.dataIdx].ref_list
			)) ||
		[];
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
	const colWidthRefTable = { minWidth: '25%', maxWidth: '25%' };

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
					height: '100%',
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
					_.map(data, (item, key) => {
						const collapsed = collapseKeys
							? collapseKeys[key.toString()]
							: true;
						const displayTitle =
							item.title === 'NA'
								? `${item.doc_type} ${item.doc_num}`
								: `${item.doc_type} ${item.doc_num} - ${item.title}`;

						if (item.type === 'document') {
							const pageHits = item.pageHits.filter(hit => hit.pageNumber)
							return (
								<div key={key}>
									<div
										className="searchdemo-modal-result-header"
										onClick={(e) => {
											e.preventDefault();
											setCollapseKeys({ ...collapseKeys, [key]: !collapsed });
										}}
									>
										<i
											style={{
												marginRight: collapsed ? 14 : 10,
												fontSize: 20,
												cursor: 'pointer',
											}}
											className={`fa fa-caret-${!collapsed ? 'down' : 'right'}`}
										/>
										<span className="gc-document-explorer-result-header-text">
											{displayTitle}
										</span>
										<span
											style={{ width: 30, marginLeft: 'auto' }}
											className="badge"
										>
											{item.pageHitCount}
										</span>
									</div>
									<Collapse isOpened={!collapsed}>
										<div>
											{_.chain(pageHits)
												.map((page, pageKey) => {
													let isHighlighted = false;
													const dataObj = data[iframePreviewLink.dataIdx];
													if (dataObj) {
														const pageObj =
															data[iframePreviewLink.dataIdx].pageHits[
																iframePreviewLink.pageHitIdx
															];
														if (pageObj) {
															isHighlighted =
																data[iframePreviewLink.dataIdx].filename ===
																	item.filename &&
																pageKey === iframePreviewLink.pageHitIdx;
														}
													}

													let blockquoteClass = 'searchdemo-blockquote-sm';

													if (isHighlighted)
														blockquoteClass +=
															' searchdemo-blockquote-sm-active';
													return (
														<div
															key={key + pageKey}
															style={{ position: 'relative' }}
														>
															<a
																href="#noref"
																className="searchdemo-quote-link"
																onClick={(e) => {
																	handleQuoteLinkClick(e, pageKey, key);
																}}
															>
																<div
																	className={blockquoteClass}
																	dangerouslySetInnerHTML={{
																		__html: sanitizeHtml(
																			page.snippet
																				.replace(
																					/<em>/g,
																					'<span class="highlight-search-demo" style="background-color: #E9691D;">'
																				)
																				.replace(/<\/em>/g, '</span>') + '...'
																		),
																	}}
																></div>
															</a>
															{isHighlighted && (
																<span className="searchdemo-arrow-right-sm"></span>
															)}
														</div>
													);
												})
												.value()}
										</div>
									</Collapse>
								</div>
							);
						} else {
							return null;
						}
					})}
			</div>
			<div
				className={`col-xs-${iframePanelSize}`}
				style={{ height: '100%', paddingLeft: 0, paddingRight: 0 }}
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
						</div>
					</div>

					{iframeLoading && (
						<div style={{ margin: '0 auto' }}>
							<LoadingIndicator customColor={'#E9691D'} />
						</div>
					)}
					<div
						className="searchdemo-vertical-bar-toggle"
						style={{ ...rightBarExtraStyles, bottom: '0px' }}
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
					height: '100%',
					overflow: 'scroll',
				}}
			>
				<SimpleTable
					tableClass={'magellan-table'}
					zoom={0.8}
					headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
					rows={previewData}
					height={'auto'}
					dontScroll={true}
					colWidth={colWidth}
					disableWrap={true}
					title={'Metadata'}
				/>
				<div style={{ marginTop: -18 }}>
					{' '}
					<SimpleTable
						tableClass={'magellan-table'}
						zoom={0.8}
						headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
						rows={previewDataReflist}
						height={'auto'}
						dontScroll={true}
						colWidth={colWidthRefTable}
						disableWrap={true}
					/>
				</div>
			</div>
		</div>
	);
}
