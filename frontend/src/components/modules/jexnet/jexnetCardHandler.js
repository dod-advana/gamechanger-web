import React, { useEffect } from 'react';
import GCTooltip from '../../common/GCToolTip';
import { KeyboardArrowRight } from '@material-ui/icons';
import {
	CARD_FONT_SIZE,
	getDocTypeStyles,
	getTrackingNameForFactory,
	getTypeDisplay,
	getTypeIcon,
	getTypeTextColor,
	getMetadataForPropertyTable,
} from '../../../utils/gamechangerUtils';
import SimpleTable from '../../common/SimpleTable';
import { CardButton } from '../../common/CardButton';
import { trackEvent, trackFlipCardEvent } from '../../telemetry/Matomo';
import { primary } from '../../common/gc-colors';
import _ from 'lodash';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import sanitizeHtml from 'sanitize-html';
import config from '../../../config/config';
import {
	getDefaultComponent,
	styles,
	colWidth,
	StyledFrontCardHeader,
	StyledFrontCardSubHeader,
	StyledListViewFrontCardContent,
	StyledFrontCardContent,
	clickFn,
	makeRows,
} from '../default/defaultCardHandler';
import { CustomDimensions } from '../../telemetry/utils';

const getCardHeaderHandler = ({ item, state, graphView, intelligentSearch }) => {
	const displayTitle = getDisplayTitle(item);
	// const isRevoked = item.is_revoked_b;

	const docListView = state.listView && !graphView;

	const displayOrg = item['display_org_s'] ? item['display_org_s'] : 'Uncategorized';
	const displayType = item['display_doc_type_s'] ? item['display_doc_type_s'] : 'Document';

	return (
		<StyledFrontCardHeader
			listView={state.listView}
			docListView={docListView}
			intelligentSearch={intelligentSearch}
		>
			<div className={'title-text-selected-favorite-div'}>
				<GCTooltip title={displayTitle} placement="top" arrow>
					<div
						className={'title-text'}
						onClick={
							docListView
								? () => clickFn(item.filename, state.cloneData.clone_name, state.searchText, 0)
								: () => {}
						}
					>
						<div className={'text'}>{displayTitle}</div>
						{docListView && (
							<div className={'list-view-arrow'}>
								<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }} />
							</div>
						)}
					</div>
				</GCTooltip>
				{/* // export and favoriting not currently working for default
					<div className={'selected-favorite'}>
					<div style={{display: "flex"}}>
						{checkboxComponent(item.filename, item.display_title_s ?? item.title, idx)}
						{favoriteComponent()}
					</div>
				</div> */}
			</div>
			{docListView && (
				<div className={'list-view-sub-header'}>
					<p>
						{' '}
						{displayType} | {displayOrg}{' '}
					</p>
				</div>
			)}
		</StyledFrontCardHeader>
	);
};

const getCardSubHeaderHandler = ({ item, state, toggledMore }) => {
	const cardType = item.type;
	const iconSrc = getTypeIcon(cardType);
	const typeTextColor = getTypeTextColor(cardType);

	const displayOrg = item['display_org_s'] ? item['display_org_s'] : 'Uncategorized';
	const displayType = item['display_doc_type_s'] ? item['display_doc_type_s'] : 'Document';

	let { docTypeColor, docOrgColor } = getDocTypeStyles(displayType, displayOrg);

	return (
		<>
			{!state.listView && !toggledMore && (
				<StyledFrontCardSubHeader
					typeTextColor={typeTextColor}
					docTypeColor={docTypeColor}
					docOrgColor={docOrgColor}
				>
					<div className={'sub-header-one'}>
						{iconSrc.length > 0 && <img src={iconSrc} alt="type logo" />}
						{displayType}
					</div>
					<div className={'sub-header-two'}>
						{item.display_org_s ? item.display_org_s : getTypeDisplay(displayOrg)}
					</div>
				</StyledFrontCardSubHeader>
			)}
		</>
	);
};

const getDisplayTitle = (item) => {
	return item.title;
};

const cardHandler = {
	document: {
		getDisplayTitle: (item) => {
			return getDisplayTitle(item);
		},
		getCardHeader: (props) => {
			return getCardHeaderHandler(props);
		},

		getCardSubHeader: (props) => {
			return getCardSubHeaderHandler(props);
		},

		getCardFront: (props) => {
			const {
				item,
				state,
				backBody,
				hitsExpanded,
				setHitsExpanded,
				hoveredHit,
				setHoveredHit,
				metadataExpanded,
				setMetadataExpanded,
				intelligentSearch,
				intelligentFeedbackComponent,
			} = props;

			let hoveredSnippet = '';
			if (Array.isArray(item.pageHits) && item.pageHits[hoveredHit]) {
				hoveredSnippet = item.pageHits[hoveredHit]?.snippet ?? '';
			}
			const contextHtml = hoveredSnippet;
			const isWideCard = true;

			if (state.listView && !intelligentSearch) {
				return (
					<StyledListViewFrontCardContent>
						<button
							type="button"
							className={'list-view-button'}
							onClick={() => {
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'ListViewInteraction',
									!hitsExpanded ? 'Expand hit pages' : 'Collapse hit pages',
									null,
									CustomDimensions.create(true, item.filename)
								);
								setHitsExpanded(!hitsExpanded);
							}}
						>
							<span className="buttonText">Page Hits</span>
							<i
								className={hitsExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'}
								aria-hidden="true"
							/>
						</button>
						{hitsExpanded && (
							<div className={'expanded-hits'}>
								<div className={'page-hits'}>
									{_.chain(item.pageHits)
										.map((page, key) => {
											return (
												<div
													className={'page-hit'}
													key={key}
													style={{
														...(hoveredHit === key && {
															backgroundColor: '#E9691D',
															color: 'white',
														}),
													}}
													onMouseEnter={() => setHoveredHit(key)}
													onClick={(e) => {
														e.preventDefault();
														clickFn(
															item.filename,
															state.cloneData.clone_name,
															state.searchText,
															null
														);
													}}
												>
													<span>
														{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}
													</span>
													<i
														className="fa fa-chevron-right"
														style={{
															color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
														}}
													/>
												</div>
											);
										})
										.value()}
								</div>
								<div className={'expanded-metadata'}>
									<blockquote
										dangerouslySetInnerHTML={{
											__html: sanitizeHtml(contextHtml),
										}}
									/>
								</div>
							</div>
						)}
						<button
							type="button"
							className={'list-view-button'}
							onClick={() => {
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'ListViewInteraction',
									!metadataExpanded ? 'Expand metadata' : 'Collapse metadata',
									null,
									CustomDimensions.create(true, item.filename)
								);
								setMetadataExpanded(!metadataExpanded);
							}}
						>
							<span className="buttonText">Document Metadata</span>
							<i
								className={metadataExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'}
								aria-hidden="true"
							/>
						</button>
						{metadataExpanded && (
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>{backBody}</div>
							</div>
						)}
					</StyledListViewFrontCardContent>
				);
			} else if (state.listView && intelligentSearch) {
				return (
					<StyledListViewFrontCardContent>
						<div className={'expanded-hits'}>
							<div className={'page-hits'}>
								{_.chain(item.pageHits)
									.map((page, key) => {
										return (
											<div
												className={'page-hit'}
												key={key}
												style={{
													...(hoveredHit === key && {
														backgroundColor: '#E9691D',
														color: 'white',
													}),
												}}
												onMouseEnter={() => setHoveredHit(key)}
												onClick={(e) => {
													e.preventDefault();
													clickFn(
														item.filename,
														state.cloneData.clone_name,
														state.searchText,
														null,
														null,
														page.pageNumber
													);
												}}
											>
												<span>{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}</span>
												<i
													className="fa fa-chevron-right"
													style={{
														color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
													}}
												/>
											</div>
										);
									})
									.value()}
							</div>
							<div className={'expanded-metadata'}>
								<blockquote
									dangerouslySetInnerHTML={{
										__html: sanitizeHtml(contextHtml),
									}}
								/>
							</div>
						</div>
						<button
							type="button"
							className={'list-view-button'}
							onClick={() => {
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'ListViewInteraction',
									!metadataExpanded ? 'Expand metadata' : 'Collapse metadata',
									null,
									CustomDimensions.create(true, item.filename)
								);
								setMetadataExpanded(!metadataExpanded);
							}}
						>
							<span className="buttonText">Document Metadata</span>
							<i
								className={metadataExpanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'}
								aria-hidden="true"
							/>
						</button>

						{metadataExpanded && (
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>{backBody}</div>
							</div>
						)}

						<div style={{ marginTop: '10px', marginBottom: '10px' }}>
							{' '}
							{intelligentFeedbackComponent()}{' '}
						</div>
					</StyledListViewFrontCardContent>
				);
			} else {
				return (
					<StyledFrontCardContent
						className={`tutorial-step-${state.componentStepNumbers['Highlight Keyword']}`}
						isWideCard={isWideCard}
					>
						<div className={'hits-container'}>
							<div className={'page-hits'}>
								{_.chain(item.pageHits)
									.map((page, key) => {
										return (
											<div
												className={'page-hit'}
												key={key}
												style={{
													...(hoveredHit === key && {
														backgroundColor: '#E9691D',
														color: 'white',
													}),
												}}
												onMouseEnter={() => setHoveredHit(key)}
												onClick={(e) => {
													e.preventDefault();
													clickFn(
														item.filename,
														state.cloneData.clone_name,
														state.searchText,
														null,
														null,
														page.pageNumber
													);
												}}
											>
												<span>{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}</span>
												<i
													className="fa fa-chevron-right"
													style={{
														color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
													}}
												/>
											</div>
										);
									})
									.value()}
							</div>
							<div className={'expanded-metadata'}>
								<blockquote
									className="searchdemo-blockquote"
									dangerouslySetInnerHTML={{
										__html: sanitizeHtml(contextHtml),
									}}
								/>
							</div>
						</div>
					</StyledFrontCardContent>
				);
			}
		},

		getCardBack: (props) => {
			const { item } = props;
			const metadata = getMetadataForPropertyTable(item);

			const fields = metadata.map((d) => d.Key);
			const displayItem = Object.fromEntries(metadata.map((d) => [d.Key, d.Value]));

			const backItemsTable = makeRows(fields, displayItem, null, true);

			return (
				<SimpleTable
					tableClass={'magellan-table'}
					zoom={1}
					headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
					rows={backItemsTable}
					height={'auto'}
					dontScroll={true}
					colWidth={colWidth}
					disableWrap={true}
					title={'Metadata'}
					hideHeader={false}
				/>
			);
		},

		getFooter: (props) => {
			const {
				filename,
				cloneName,
				graphView,
				toggledMore,
				setToggledMore,
				closeGraphCard,
				showEsDoc,
				searchText,
			} = props;
			return (
				<>
					<>
						<CardButton
							target={'_blank'}
							style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
							href={'#'}
							onClick={(e) => {
								e.preventDefault();
								clickFn(filename, cloneName, searchText, null);
							}}
						>
							Open
						</CardButton>
						<CardButton
							target={'_blank'}
							style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
							href={'#'}
							onClick={(e) => {
								e.preventDefault();
								window.open(`${config.JEXNET_LINK}file?name=${filename}`);
							}}
						>
							Go to Jexnet
						</CardButton>
						{graphView && (
							<CardButton
								style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
								href={'#'}
								onClick={(e) => {
									trackEvent(
										getTrackingNameForFactory(cloneName),
										'CardInteraction',
										'Close Graph Card',
										null,
										CustomDimensions.create(true, filename)
									);
									e.preventDefault();
									closeGraphCard();
								}}
							>
								Close
							</CardButton>
						)}
						{toggledMore && Permissions.isGameChangerAdmin() && (
							<CardButton
								style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
								href={'#'}
								onClick={(e) => {
									e.preventDefault();
									showEsDoc();
								}}
							>
								<i className="fa fa-code" />
							</CardButton>
						)}
					</>
					<div
						style={{ ...styles.viewMoreButton, color: primary }}
						onClick={() => {
							trackFlipCardEvent(getTrackingNameForFactory(cloneName), toggledMore);
							setToggledMore(!toggledMore);
						}}
					>
						{toggledMore ? 'Overview' : 'More'}
						<i
							style={{ ...styles.viewMoreChevron, color: primary }}
							className="fa fa-chevron-right"
							aria-hidden="true"
						/>
					</div>
				</>
			);
		},

		getCardExtras: (props) => {
			return <></>;
		},

		getFilename: (item) => {
			return item.filename;
		},
	},
};

const JexnetCardHandler = (props) => {
	const { setFilename, setDisplayTitle, item, cardType } = props;

	useEffect(() => {
		setFilename(cardHandler[cardType].getFilename(item));
		setDisplayTitle(cardHandler[cardType].getDisplayTitle(item));
	}, [cardType, item, setDisplayTitle, setFilename]);

	return <>{getDefaultComponent(props, cardHandler)}</>;
};

export default JexnetCardHandler;
