import React, { useEffect, useCallback, useState } from 'react';
import GameChangerAPI from '../../api/gameChanger-service-api';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator.js';
import '../../cards/keyword-result-card.css';
import '../../../containers/gamechanger.css';
import { handlePdfOnLoad, getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import { trackEvent } from '../../telemetry/Matomo';
import PDFHighlighter from './PDFHighlighter';
import UOTAlert from '../../common/GCAlert';
import GCResponsiblityEditModal from './GCResponsiblityEditModal';
import { styles as adminStyles } from '../../admin/util/GCAdminStyles';
import GCResponsibilityResults from './GCResponsibilityResults';
import ResponsibilityFilters from './ResponsibilityFilters';

const gameChangerAPI = new GameChangerAPI();
const SIDEBAR_TOGGLE_WIDTH = 20;
const LEFT_PANEL_COL_WIDTH = 2;
const RIGHT_PANEL_COL_WIDTH = 4;

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

export default function GCResponsibilityDocumentView({
	state,
	responsibilityData = {},
	loading,
	setResultsPage,
	infiniteCount,
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
	collapseKeys,
	setCollapseKeys,
	showTutorial,
}) {
	const { cloneData } = state;

	const [iframeLoading, setIframeLoading] = useState(false);
	const [leftPanelOpen, setLeftPanelOpen] = useState(true);
	const [rightPanelOpen, setRightPanelOpen] = useState(true);
	const [pdfLoaded, setPdfLoaded] = useState(false);
	const [isEditingResp, setIsEditingResp] = useState(false);
	const [isEditingEntity, setIsEditingEntity] = useState(false);
	const [selectedResponsibility, setSelectedResponsibility] = useState({});
	const [documentLink, setDocumentLink] = useState('');
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
			Object.keys(responsibilityData).forEach((docKey) => {
				initialCollapseKeys[docKey] = false;
				Object.keys(responsibilityData[docKey]).forEach((entityKey) => {
					initialCollapseKeys[docKey + entityKey] = false;
				});
			});
			if (!showTutorial) setCollapseKeys(initialCollapseKeys);
			const doc = Object.keys(responsibilityData)[0];
			const entity = Object.keys(responsibilityData[doc])[0];

			setSelectedResponsibility(responsibilityData[doc][entity][0]);
		} else if (!Object.keys(responsibilityData).length) {
			setSelectedResponsibility({});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
							true,
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
		[selectedResponsibility, cloneData]
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

	const completeSuccessfulUpdate = () => {
		setIsEditingEntity(false);
		setIsEditingResp(false);
		createAlert(
			'Update Successful',
			'success',
			'Thank you for the help. Your update will now be reviewed before the responsiblity is updated.'
		);
	};

	const completeUpdateError = () => {
		setIsEditingEntity(false);
		setIsEditingResp(false);
		createAlert(
			'Update error',
			'error',
			'There was an error sending your responsibility update. Please try againg later.'
		);
	};

	const rejectResponsibility = () => {
		gameChangerAPI
			.storeResponsibilityReportData({
				id: selectedResponsibility.id,
				issue_description: 'review',
				updatedColumn: 'Reject',
				updatedText: '',
			})
			.then(completeSuccessfulUpdate)
			.catch(completeUpdateError);
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
			.then(completeSuccessfulUpdate)
			.catch(completeUpdateError);
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

	const getIframePanelSize = () => {
		return 12 - (leftPanelOpen ? LEFT_PANEL_COL_WIDTH : 0) - (rightPanelOpen ? RIGHT_PANEL_COL_WIDTH : 0);
	};

	const handleIframeDisplay = () => {
		return !isEditingResp && !isEditingEntity && Object.keys(responsibilityData).length > 0 && !iframeLoading
			? 'initial'
			: 'none';
	};

	let leftBarExtraStyles = {};
	let rightBarExtraStyles = { right: 0 };

	const isEditing = isEditingEntity || isEditingResp;

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
				<div className="re-tutorial-step-1">
					<ResponsibilityFilters
						filters={filters}
						documentList={documentList}
						docTitle={docTitle}
						setDocTitle={setDocTitle}
						organization={organization}
						setOrganization={setOrganization}
						responsibilityText={responsibilityText}
						setResponsibilityText={setResponsibilityText}
						setFilters={setFilters}
						setResultsPage={setResultsPage}
						setReloadResponsibilities={setReloadResponsibilities}
						setCollapseKeys={setCollapseKeys}
					/>
				</div>
			</div>
			<div
				className={`col-xs-${getIframePanelSize()}`}
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
							paddingLeft: SIDEBAR_TOGGLE_WIDTH,
							paddingRight: SIDEBAR_TOGGLE_WIDTH + 5,
							height: '100%',
						}}
						className="re-tutorial-step-4"
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
										display: handleIframeDisplay(),
									}}
									width="100%"
									height="100%%"
								></iframe>
							)}
							{isEditing && (
								<PDFHighlighter
									handleSave={updateResponsibility}
									highlights={highlights}
									scrollId={'0'}
									saveActive={isEditing}
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
						style={{ ...rightBarExtraStyles, right: 0, bottom: '0px', zIndex: 100 }}
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
				className={`col-xs-${RIGHT_PANEL_COL_WIDTH} re-tutorial-step-2`}
				id={'re-results-col'}
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
				<div style={{ fontSize: 16, marginBottom: 10, fontFamily: 'Montserrat', fontWeight: '600' }}>
					RESULTS
				</div>
				<GCResponsibilityResults
					responsibilityData={responsibilityData}
					collapseKeys={collapseKeys}
					setCollapseKeys={setCollapseKeys}
					selectedResponsibility={selectedResponsibility}
					setSelectedResponsibility={setSelectedResponsibility}
					isEditingResp={isEditingResp}
					setIsEditingResp={setIsEditingResp}
					isEditingEntity={isEditingEntity}
					setIsEditingEntity={setIsEditingEntity}
					setDocumentLink={setDocumentLink}
					setEditModalOpen={setEditModalOpen}
					loading={loading}
				/>
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
