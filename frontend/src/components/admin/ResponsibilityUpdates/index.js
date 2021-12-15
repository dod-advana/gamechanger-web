import React, { useEffect, useState } from 'react';
import _ from 'underscore';
import { Collapse } from 'react-collapse';
import grey from '@material-ui/core/colors/grey';
import styled from 'styled-components';
import SimpleTable from '../../common/SimpleTable';
import GameChangerAPI from '../../api/gameChanger-service-api';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator.js';
import '../../cards/keyword-result-card.css';
import '../../../containers/gamechanger.css';
import Pagination from 'react-js-pagination';
import PDFHighlighter from '../../analystTools/PDFHighlighter';
import { styles as adminStyles } from '../util/GCAdminStyles';
import GCButton from '../../common/GCButton';

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
	}
};
const UpdateMetaText = styled.div`
        color: #1E88E5;
		&:hover {
			cursor: pointer;
			text-decoration: underline;
		}
    `;
const defaultIframPreviewLink = {
	dataIdx: 0,
	entityIdx: 0,
	responsibilityIdx: 0
}

export default function ResponsibilityUpdates() {

	const DOCS_PER_PAGE = 3;

	// Set out state variables and access functions
	const [collapseKeys, setCollapseKeys] = useState({});
	const [iframePreviewLink, setIframePreviewLink] = useState(defaultIframPreviewLink);
	const [leftPanelOpen, setLeftPanelOpen] = useState(true);
	const [rightPanelOpen, setRightPanelOpen] = useState(true);
	const [editing, setEditing] = useState(false);
	const [selectedResponsibility, setSelectedResponsibility] = useState({});
	const [responsibilityData, setResponsibilityData] = useState({});
	const [loading, setLoading] = useState(true);
	const [offsets, setOffsets] = useState([]);
	const [reloadResponsibilities, setReloadResponsibilities] = useState(true);
	const [resultsPage, setResultsPage] = useState(1);
	const [selectedUpdate, setSelectedUpdate] = useState({});
	const [highlights, setHighlights] = useState([])
	const [scrollId, setScrollId] = useState('');
	const [documentLink, setDocumentLink] = useState('');
	const [refreshDocument, setRefreshDocument] = useState(false);

	useEffect(() => {
		if(Object.keys(responsibilityData).length){
			const { dataIdx, entityIdx, responsibilityIdx } = iframePreviewLink;
			const doc = Object.keys(responsibilityData)[dataIdx];
			let entity;
			if(responsibilityData[doc]) entity = Object.keys(responsibilityData[doc])[entityIdx];
			let resp;
			if(responsibilityData?.[doc]?.[entity]) resp = responsibilityData[doc][entity][responsibilityIdx];
			if (resp) {
				setSelectedResponsibility(resp);
			}
		}
	}, [responsibilityData, iframePreviewLink]);

	useEffect(() => {
		if(selectedResponsibility?.responsibility_reports){
			const newHighlights = [];
			selectedResponsibility.responsibility_reports.forEach(report => {
				if(report.textPosition) newHighlights.push({position: report.textPosition, id: report.id})
			})
			setHighlights(newHighlights);
			setSelectedUpdate(selectedResponsibility.responsibility_reports[0])
		}
		setEditing(false)
	}, [selectedResponsibility])

	useEffect(() => {
		if(refreshDocument){
			setDocumentLink(refreshDocument);
			setRefreshDocument(false);
		}
	}, [refreshDocument])

	useEffect(() => {
		if(editing){
			setEditing(false);
			const newHighlights = [];
			selectedResponsibility.responsibility_reports.forEach(report => {
				newHighlights.push({position: report.textPosition, id: report.id})
			})
			setHighlights(newHighlights);
		}
		setScrollId(`${selectedUpdate.id}`);
		setRefreshDocument(documentLink);
		setDocumentLink('')
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedUpdate])

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

	useEffect(() => {
		if (reloadResponsibilities) {
			handleFetchData({ page: resultsPage, sorted: [], filtered: [] });
			setReloadResponsibilities(false);
		}
	 }, [reloadResponsibilities, resultsPage]); // eslint-disable-line react-hooks/exhaustive-deps

	 useEffect(() => {
		const getFileName = async () => {
			const payload = {
				filename: selectedResponsibility.filename
			}
			if(payload.filename){
				const { data } = await gameChangerAPI.getResponsibilityDocLink(payload);
				setDocumentLink(data.fileLink);
			}
		}
		getFileName();
	}, [selectedResponsibility])

	const handleFetchData = async ({ page, sorted, filtered }) => {
		try {
			setLoading(true);
			const tmpFiltered = [...filtered];
			let offset = 0;
			let limit = 0;
			for(let i = 1; i <= page * DOCS_PER_PAGE - DOCS_PER_PAGE; i++){
				if(!offsets[i]) break;
				offset += offsets[i];
			}
			for(let i = 1 + (page - 1) * DOCS_PER_PAGE; i <= page * DOCS_PER_PAGE; i++){
				if(!offsets[i]) break;
				limit += offsets[i];
			}
			const { results = [] } = await getData({
				limit,
				page: resultsPage, 
				offset,
				sorted,
				filtered: tmpFiltered,
			});
			groupResponsibilities(results);
		} catch (e) {
			setResponsibilityData([]);
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const getData = async ({
		limit,
		page = 1,
		offset = 0,
		sorted = [],
		filtered = [],
	}) => {
		const order = sorted.map(({ id, desc }) => [id, desc ? 'DESC' : 'ASC']);
		const where = filtered;
                                                    
		try {
			const { data } = await gameChangerAPI.getResponsibilityUpdates({
				docView: true,
				page,
				limit,
				offset,
				order,
				where,
			});
			if(data.offsets){
				const newOffsets = {};
				data.offsets.forEach((resp, i) => {
					if(!newOffsets[(Math.floor(i/DOCS_PER_PAGE) + 1).toString()]) {
						newOffsets[(Math.floor(i/DOCS_PER_PAGE) + 1).toString()] = 0;
					}
					newOffsets[(Math.floor(i/DOCS_PER_PAGE) + 1).toString()] += resp;
				})
				setOffsets(newOffsets);
			}
			return data;
		} catch (err) {
			this.logger.error(err.message, 'GEADAKS');
			return []
		}
	};

	const groupResponsibilities = (data) => {
		const groupedData = {};
		data.forEach((responsibility) => {
			const doc = responsibility.documentTitle;
			let entity = responsibility.organizationPersonnel;
			if(!entity) entity = 'NO ENTITY';
			if(!groupedData[doc]) groupedData[doc] = {}
			if(!groupedData[doc][entity]) groupedData[doc][entity]= [];
			groupedData[doc][entity].push(responsibility);
		})
		setResponsibilityData(groupedData);
	}

	const onPaginationClick= (page) => {
		setResultsPage(page);
		setReloadResponsibilities(true);
	}

	const handleMoveSelectedResp = () => {
		if(selectedResponsibility.responsibility_reports?.length > 1) {
			return
		}
		setIframePreviewLink(defaultIframPreviewLink);
	}

	const acceptUpdate = async (update) => {
		const data = {
			update, 
			responsibility: selectedResponsibility, 
			status: 'accepted'
		}
		await gameChangerAPI.updateResponsibility(data)
		handleMoveSelectedResp();
		setReloadResponsibilities(true);
	}

	const rejectUpdate = async (update) => {
		const data = {
			update, 
			responsibility: selectedResponsibility, 
			status: 'rejected'
		}
		await gameChangerAPI.updateResponsibility(data)
		handleMoveSelectedResp();
		setReloadResponsibilities(true);
	}

	const editUpdate = async (updatedResp, textPosition) => {
		const data = {
			id: selectedUpdate.id, 
			updatedText: updatedResp,
			textPosition: textPosition
		}
		await gameChangerAPI.updateResponsibilityReport(data)
		setReloadResponsibilities(true);
		setEditing(false)
	}

	function handleRightPanelToggle() {
		setRightPanelOpen(!rightPanelOpen);
	}

	function handleLeftPanelToggle() {
		setLeftPanelOpen(!leftPanelOpen);
	}

	// This toggles whether the Document Header texts are open or not by setting collapseKeys

	function handleQuoteLinkClick(e, respKey, entKey, key) {
		e.preventDefault();
		setIframePreviewLink({
			responsibilityIdx: respKey,
			entityIdx: entKey,
			dataIdx: key,
		});
	}

	const getResponsibilityMetaData = () => {
		if(!Object.keys(responsibilityData).length) return [];
		const doc = Object.keys(responsibilityData)[iframePreviewLink.dataIdx];
		let entity;
		if(responsibilityData[doc]) entity = Object.keys(responsibilityData[doc])[iframePreviewLink.entityIdx];
		let responsibility;
		if(responsibilityData[doc]?.[entity]) responsibility = responsibilityData[doc][entity][iframePreviewLink.responsibilityIdx];
		const keyMap = {
			filename: 'File Name',
			documentTitle: 'Document Title',
			organizationPersonnel: 'Organization/Personnel',
			responsibilityText: 'Responsibility Text',
		}
		const metaData = [];
		if(responsibility){
			Object.keys(responsibility).forEach(key => {
				if(keyMap[key]){
					metaData.push({
						Key: keyMap[key],
						Value: responsibility[key]
					})
				}
			})
		}
		return metaData
	}

	const getUpdateMetaData = () => {
		if(!Object.keys(selectedResponsibility).length) return [];
		const metaData = [];
		selectedResponsibility.responsibility_reports.forEach(update => {
			metaData.push({
				Key: 'Update Type',
				Value: update.updatedColumn
			})
			if(update.updatedColumn !== 'Reject') metaData.push({
				Key: 'Updated Text',
				Value: <UpdateMetaText 
					onClick={() => {
						if(update.id === selectedUpdate.id) {
							setRefreshDocument(documentLink);
							return setDocumentLink('');
						}
						setSelectedUpdate(update);
					}}
				>
					{update.updatedText}
				</UpdateMetaText>
			})
			metaData.push({
				Key: 'Actions',
				Value: <div className='row' style={{justifyContent: 'right'}}>
					{update.updatedColumn !== 'Reject' &&
							<GCButton
								onClick={() => {
									if(editing) {
										const newHighlights = [];
										selectedResponsibility.responsibility_reports.forEach(report => {
											newHighlights.push({position: report.textPosition, id: report.id})
										})
										setHighlights(newHighlights);
										return setEditing(false)
									};
									setSelectedUpdate(update);
									setEditing(`${update.id}`);
									setHighlights([]);
								}}
								style={{
									height: 40,
									minWidth: 40,
									padding: '2px 8px 0px',
									fontSize: 14,
									margin: '16px 0px 0px 10px',
									width: 'auto'
								}}
								disabled={editing && editing !== `${update.id}`}
								isSecondaryBtn
							>
								{editing === `${update.id}` ? 'Cancel' : 'Edit'}
							</GCButton>
					}
					<GCButton
						onClick={() => {
							rejectUpdate(update)
						}}
						style={{
							height: 40,
							minWidth: 40,
							padding: '2px 8px 0px',
							fontSize: 14,
							margin: '16px 0px 0px 10px',
							width: 'auto'
						}}
						disabled={editing}
						isSecondaryBtn
					>
						Reject
					</GCButton>
					<GCButton
						onClick={() => {
							acceptUpdate(update)
						}}
						style={{
							height: 40,
							minWidth: 40,
							padding: '2px 8px 0px',
							fontSize: 14,
							margin: '16px 0px 0px 10px',
							width: 'auto'
						}}
						disabled={editing}
					>
						Accept
					</GCButton>
				</div>
			})
		})
		return metaData
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
		<div className='contatiner' style={{marginLeft: 20}}>
			<div
				className="row"
				style={{ height: 'calc(100% - 70px)', marginTop: '10px', padding: '2px 10px 2px 0px' }}
			>
				<p style={{ ...adminStyles.sectionHeader, marginLeft: 0, marginTop: 10, marginBottom: 20 }}>
					Responsibility Updates
				</p>
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
								itemsCountPerPage={DOCS_PER_PAGE}
								totalItemsCount={Object.keys(offsets).length}
								pageRangeDisplayed={3}
								onChange={(page) => {
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
																const selectedDoc = Object.keys(responsibilityData)[iframePreviewLink.dataIdx];
																let selectedEntity;
																if(responsibilityData[selectedDoc]) selectedEntity = Object.keys(responsibilityData[selectedDoc])[iframePreviewLink.entityIdx] === 'NO ENTITY' ? null : Object.keys(responsibilityData[selectedDoc])[iframePreviewLink.entityIdx];
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
						<div
							style={{
								paddingLeft: SIDEBAR_TOGGLE_WIDTH + (!leftPanelOpen ? 10 : 0),
								paddingRight: SIDEBAR_TOGGLE_WIDTH + (!rightPanelOpen ? 10 : 0),
								height: '100%',
							}}
						>
							{!loading && !Object.keys(responsibilityData).length ?
								<p style={{
									fontSize: 16,
									fontWeight: 600,
									fontFamily: 'Noto Sans',
									textAlign: 'center',
								}}>
									No updates left to review
								</p>
								:
								<div style={{ height: '100%' }}>
									<PDFHighlighter 
										handleSave={editUpdate}
										highlights={highlights}
										scrollId={scrollId}
										saveActive={editing}
										documentLink={documentLink}
									/>
								</div>
							}
						</div>
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
					{!loading 
						?
						<>
							<SimpleTable
								tableClass={'magellan-table'}
								zoom={0.8}
								headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
								rows={getResponsibilityMetaData()}
								height={'auto'}
								dontScroll={true}
								colWidth={colWidth}
								disableWrap={true}
								title={'Metadata'}
							/>
							{Object.keys(selectedResponsibility).length &&
								<SimpleTable
									tableClass={'magellan-table'}
									zoom={0.8}
									headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
									rows={getUpdateMetaData()}
									height={'auto'}
									dontScroll={true}
									colWidth={colWidth}
									disableWrap={true}
									title={'Updates'}
								/>
							}
						</>
						:
						<></>
					}
				</div>
			</div>
		</div>
	);
}
