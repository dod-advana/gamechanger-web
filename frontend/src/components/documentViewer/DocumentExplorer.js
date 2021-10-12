import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import GameChangerAPI from '../api/gameChanger-service-api';
import { Collapse } from 'react-collapse';
import SimpleTable from '../common/SimpleTable';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator.js';
import sanitizeHtml from 'sanitize-html';
// import { primary } from "../experimental/uot-colors";
import '../cards/keyword-result-card.css';
import '../../containers/gamechanger.css';
import grey from '@material-ui/core/colors/grey';
import {
	getReferenceListMetadataPropertyTable,
	getMetadataForPropertyTable,
	handlePdfOnLoad,
	getTrackingNameForFactory,
} from '../../utils/gamechangerUtils';
import { getEDAMetadataForPropertyTable } from '../modules/eda/edaUtils';
import Pagination from 'react-js-pagination';
import { trackEvent } from '../telemetry/Matomo';
import GCTooltip from '../common/GCToolTip';
import { EDA_FIELDS, EDA_FIELD_JSON_MAP } from '../modules/eda/edaCardHandler';

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
		flexDirection: 'row-reverse',
		width: '100%',
		paddingRight: '25px',
	},
};
function numberWithCommas(x) {
	if (!x) return x;
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

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

const DocumentExplorer = ({
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
	isEDA,
}) => {
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

	const measuredRef = useCallback(
		(node) => {
			if (node !== null) {
				const { dataIdx, pageHitIdx } = iframePreviewLink;
				const rec = data[dataIdx];
				if (rec) {
					// const filepath = rec.filepath;
					const filename = !isEDA ? rec.filename : rec.file_location_eda_ext;
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
			isEDA,
		]
	);

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
	// const edaFieldJSONMap = ((cloneData && cloneData.clone_data) && cloneData.clone_data.auxDisplayFieldJSONMap ? JSON.parse(cloneData.clone_data.auxDisplayFieldJSONMap) : {}) || {};
	const previewPathname =
		data.length > 0 &&
		data[iframePreviewLink.dataIdx] &&
		data[iframePreviewLink.dataIdx].filepath;
	const previewData =
		(data.length > 0 &&
			data[iframePreviewLink.dataIdx] &&
			(isEDA && cloneData && cloneData.clone_data
				? getEDAMetadataForPropertyTable(
					EDA_FIELD_JSON_MAP,
					EDA_FIELDS,
					data[iframePreviewLink.dataIdx]
				  )
				: getMetadataForPropertyTable(data[iframePreviewLink.dataIdx]))) ||
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
		<div className="row" style={{ height: '100%', marginTop: '10px' }}>
			<div
				className={`col-xs-${LEFT_PANEL_COL_WIDTH}`}
				style={{
					display: leftPanelOpen ? 'block' : 'none',
					paddingRight: 0,
					borderRight: '1px solid lightgrey',
					height: '94%',
					overflow: 'scroll',
				}}
			>
				<div
					style={{ paddingLeft: '10px', color: grey800, fontWeight: 'bold' }}
				>
					{totalCount ? (
						<div>
							{numberWithCommas(totalCount)} results found.
							<div className="view-toggle" onClick={() => handleViewToggle()}>
								{viewTogle ? '+' : '-'}
							</div>
						</div>
					) : (
						'Make a search to get started.'
					)}
				</div>

				<div
					style={styles.docExplorerPag}
					className="gcPagination docExplorerPag"
				>
					<Pagination
						activePage={resultsPage}
						itemsCountPerPage={resultsPerPage}
						totalItemsCount={totalCount}
						pageRangeDisplayed={6}
						onChange={(page) => {
							trackEvent(
								getTrackingNameForFactory(cloneData.clone_name),
								'DocumentExplorerInteraction',
								'Pagination',
								page
							);
							onPaginationClick(page);
						}}
						style={{ margin: '10px 0' }}
					/>
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
						// let contextHtml = item.context;
						// contextHtml = contextHtml.replace(/<em>/g, '<span class="highlight-search-demo">').replace(/<\/em>/g, '</span>') + '...';
						if (item.type === 'document') {
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
											{_.chain(item.pageHits)
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
				style={{ height: '99%', paddingLeft: 0, paddingRight: 0 }}
			>
				<div
					style={{
						display: 'flex',
						width: '100%',
						height: '94%',
						flexDirection: 'column',
					}}
				>
					<div
						className="searchdemo-vertical-bar-toggle"
						style={leftBarExtraStyles}
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
						<iframe
							className="aref"
							id={'docPdfViewer'}
							onLoad={handlePdfOnLoadStart}
							ref={measuredRef}
							style={{
								borderStyle: 'none',
								display: data.length > 0 && !iframeLoading ? 'initial' : 'none',
							}}
							title="pdf"
							width="100%"
							height="100%%"
						></iframe>
					</div>
					{iframeLoading && (
						<div style={{ margin: '0 auto' }}>
							<LoadingIndicator customColor={'#E9691D'} />
						</div>
					)}
					<div
						className="searchdemo-vertical-bar-toggle"
						style={rightBarExtraStyles}
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
			<GCTooltip
				title={
					isEDA
						? data && data[0] && data[0].acomod_eda_ext
							? 'Pulled from PDS data'
							: 'No data available'
						: ''
				}
				arrow
				placement="top"
				enterDelay={400}
			>
				<div
					className={`col-xs-${RIGHT_PANEL_COL_WIDTH}`}
					style={{
						display: rightPanelOpen ? 'block' : 'none',
						paddingLeft: 0,
						borderLeft: '1px solid lightgrey',
						height: '94%',
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
						hideHeader={isEDA}
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
			</GCTooltip>
		</div>
	);
};

DocumentExplorer.propTypes = {
	data: PropTypes.shape({
		dataIdx: PropTypes.string,
		key: PropTypes.string,
	}),
	totalCount: PropTypes.number,
	searchText: PropTypes.string,
	prevSearchText: PropTypes.string,
	loading: PropTypes.bool,
	resultsPage: PropTypes.number,
	resultsPerPage: PropTypes.number,
	onPaginationClick: PropTypes.func,
	isClone: PropTypes.bool,
	cloneData: PropTypes.shape({
		clone_name: PropTypes.string,
	}),
	isEDA: PropTypes.bool,
};

export default DocumentExplorer;
