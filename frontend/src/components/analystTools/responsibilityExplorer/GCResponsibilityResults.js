import React from 'react';
import { UnmountClosed } from 'react-collapse';
import InfoIcon from '@mui/icons-material/Info';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator.js';
import GCTooltip from '../../common/GCToolTip';
import GCButton from '../../common/GCButton';

export default function GCResponsibilityResults({
	responsibilityData,
	collapseKeys,
	setCollapseKeys,
	selectedResponsibility,
	setSelectedResponsibility,
	isEditingResp,
	setIsEditingResp,
	isEditingEntity,
	setIsEditingEntity,
	setDocumentLink,
	setEditModalOpen,
	loading,
}) {
	const handleQuoteLinkClick = (e, resp) => {
		e.preventDefault();
		setSelectedResponsibility(resp);
	};

	const handleReport = () => {
		if (isEditing) {
			setIsEditingResp(false);
			setIsEditingEntity(false);
			setDocumentLink('');
		} else {
			setEditModalOpen(true);
		}
	};

	const isEditing = isEditingEntity || isEditingResp;
	const reportBtnText = isEditing ? 'Cancel' : 'Report Issue';

	return (
		<>
			{Object.keys(responsibilityData).length > 0 &&
				Object.keys(responsibilityData).map((doc, key) => {
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
									<span style={{ marginLeft: 'auto' }}>
										<GCTooltip title={'View more details on document'} placement="top" arrow>
											<div>
												<InfoIcon
													onClick={() => {
														window.open(
															`#/gamechanger?q=${responsibilityData[doc].entities[0].responsibilities[0].filename}&view=Explorer`
														);
													}}
												/>
											</div>
										</GCTooltip>
									</span>
								)}
							</div>
							<UnmountClosed isOpened={docOpen}>
								{responsibilityData[doc].entities.map((entity, entKey) => {
									const { entityText } = entity;
									const entOpen = collapseKeys[doc + entityText]
										? collapseKeys[doc + entityText]
										: false;
									return (
										<div key={entKey}>
											<div
												className="searchdemo-modal-result-header"
												onClick={(e) => {
													e.preventDefault();
													setCollapseKeys({
														...collapseKeys,
														[doc + entityText]: !entOpen,
													});
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
													{entityText}
												</span>
											</div>
											<UnmountClosed isOpened={entOpen && docOpen}>
												<div>
													{responsibilityData[doc].entities[entKey].responsibilities.map(
														(responsibility, respKey) => {
															let isHighlighted =
																selectedResponsibility.responsibilityText ===
																responsibility.responsibilityText;
															let blockquoteClass = 'searchdemo-blockquote-sm';

															if (isHighlighted)
																blockquoteClass += ' searchdemo-blockquote-sm-active';
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
																				borderBottom: '14px solid transparent',
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
																							className="re-tutorial-step-3"
																							onClick={handleReport}
																							style={{
																								height: 40,
																								minWidth: 40,
																								padding: '2px 8px 0px',
																								fontSize: 14,
																								margin: '16px 0px 0px 10px',
																								width: 'auto',
																							}}
																							isSecondaryBtn={isEditing}
																						>
																							{reportBtnText}
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
		</>
	);
}
