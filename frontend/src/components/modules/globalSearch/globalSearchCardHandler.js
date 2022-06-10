import React, { useEffect } from 'react';
import { KeyboardArrowRight } from '@material-ui/icons';
import styled from 'styled-components';
import { capitalizeFirst, CARD_FONT_SIZE, getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import { CardButton } from '../../common/CardButton';
import { trackEvent } from '../../telemetry/Matomo';
import _ from 'underscore';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import CONFIG from '../../../config/config';
import BetaModal from '../../common/BetaModal';
import QLIKICON from '../../../images/icon/QLIK.svg';
import { colWidth, getDefaultComponent, styles } from '../default/defaultCardHandler';
import GCTooltip from '../../common/GCToolTip';
import sanitizeHtml from 'sanitize-html';
import GCAccordion from '../../common/GCAccordion';
import SimpleTable from '../../common/SimpleTable';
import PropTypes from 'prop-types';

const MAX_KEYS = 8;

const MODELS_HITS_KEY_NOT_ALLOWED = ['Hyperparameter Selection', 'Metrics'];

const PRIMARY_COLOR = '#13A792';

const StyledFrontCardHeader = styled.div`
	font-size: 1.2em;
	display: inline-block;
	color: black;
	margin-bottom: 0px;
	background-color: ${({ restricted }) => (!restricted ? 'white' : 'rgba(223,230,238,0.5)')};
	font-weight: bold;
	font-family: Montserrat;
	height: ${({ listView }) => (listView ? 'fit-content' : '70px')};
	padding: ${({ listView }) => (listView ? '0px' : '15px')};
	margin-left: ${({ listView }) => (listView ? '4px' : '0px')};
	margin-right: ${({ listView }) => (listView ? '10px' : '0px')};

	.title-text-selected-favorite-div {
		max-height: ${({ listView }) => (listView ? '35px' : '50px')};
		height: ${({ listView }) => (listView ? '35px' : '')};
		overflow: hidden;
		display: flex;
		justify-content: space-between;

		.title-text {
			cursor: pointer;
			display: ${({ listView }) => (listView ? 'flex' : '')};
			alignitems: ${({ listView }) => (listView ? 'top' : '')};
			height: ${({ listView }) => (listView ? 'fit-content' : '')};
			max-width: ${({ listView }) => (listView ? '60%' : '')};
			overflow-wrap: ${({ listView }) => (listView ? '' : 'anywhere')};

			.text {
				margin-top: ${({ listView }) => (listView ? '10px' : '0px')};
			}

			.list-view-arrow {
				display: inline-block;
				margin-top: 7px;
			}
		}

		.selected-favorite {
			display: inline-block;
			font-family: 'Noto Sans';
			font-weight: 400;
			font-size: ${CARD_FONT_SIZE}px;
			margin-top: ${({ listView }) => (listView ? '2px' : '0px')};
		}
	}

	.list-view-sub-header {
		font-size: 0.8em;
		display: flex;
		color: black;
		margin-bottom: 0px;
		margin-top: 4px;
		margin-right: 20px;
		background-color: 'white';
		font-family: Montserrat;
		height: 24px;
		justify-content: space-between;
	}
`;

const StyledFrontCardContent = styled.div`
	font-family: 'Noto Sans';
	overflow: auto;
	font-size: ${CARD_FONT_SIZE}px;

	.image-container {
		text-align: center;
	}

	img {
		height: 150px;
		margin-right: auto;
		margin-left: auto;
		margin-bottom: 10px;
		background-image: url(${QLIKICON});
		background-repeat: no-repeat;
		background-position: center;
	}

	.body-container {
		display: flex;
		height: 100%;

		.body-text {
			min-width: 100px;
			height: 100%;
			font-size: ${CARD_FONT_SIZE}px;
		}
	}

	.hits-container {
		display: grid;
		grid-template-columns: 170px auto auto;
		height: 100%;

		.page-hits {
			min-width: 100px;
			height: fit-content;
			border: 1px solid rgb(189, 189, 189);
			border-top: 0px;

			.page-hit {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-right: 5px;
				padding-left: 5px;
				border-top: 1px solid rgb(189, 189, 189);
				cursor: pointer;
				color: #386f94;

				span {
					font-size: ${CARD_FONT_SIZE}px;
				}

				i {
					font-size: ${CARD_FONT_SIZE}px;
					margin-left: 10px;
				}
			}
		}

		> .expanded-metadata {
			overflow-wrap: anywhere;
			grid-column: 2 / 4;

			> .searchdemo-blockquote {
				height: 260px;
			}
		}
	}
`;

const StyledListViewFrontCardContent = styled.div`
	.list-view-button {
		width: 100%;
		height: fit-content;
		margin-top: 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;

		i {
			font-size: ${CARD_FONT_SIZE}px;
			color: rgb(0, 131, 143);
			font-weight: normal;
			margin-left: 5px;
			margin-right: 20px;
		}
	}

	.expanded-hits {
		display: flex;
		height: 100%;
		width: 100%;

		.page-hits {
			min-width: 160px;
			height: 100%;
			border: 1px solid rgb(189, 189, 189);
			border-top: 0px;

			.page-hit {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-right: 5px;
				padding-left: 5px;
				border-top: 1px solid rgb(189, 189, 189);
				cursor: pointer;
				color: #386f94;

				span {
					font-size: ${CARD_FONT_SIZE}px;
				}

				i {
					font-size: ${CARD_FONT_SIZE}px;
					margin-left: 10px;
				}
			}
		}

		> .expanded-metadata {
			border: 1px solid rgb(189, 189, 189);
			border-left: 0px;
			min-height: 126px;
			width: 100%;

			> blockquote {
				font-size: ${CARD_FONT_SIZE}px;
				line-height: 20px;

				background: ${({ expandedDataBackground }) =>
					expandedDataBackground ? expandedDataBackground : '#dde1e0'};
				margin-bottom: 0;
				height: 165px;
				border-left: 0;
				overflow: hidden;
				font-family: Noto Sans, Arial, Helvetica, sans-serif;
				padding: 0.5em 10px;
				margin-left: 0;
				quotes: '\\201C''\\201D''\\2018''\\2019';

				> em {
					color: white;
					background-color: #e9691d;
					margin-right: 5px;
					padding: 4px;
					font-style: normal;
				}
			}
		}
	}

	.metadata {
		display: flex;
		height: 100%;
		flex-direction: column;
		border-radius: 5px;
		overflow: auto;

		.inner-scroll-container {
			background-color: rgb(238, 241, 242);
			display: block;
			overflow: auto;
			height: 100%;
		}
	}
`;

const clickFn = (cloneName, href, type) => {
	trackEvent(getTrackingNameForFactory(cloneName), `SearchResults_${capitalizeFirst(type)}_Click`, href);
	window.open(href);
};

const getUrl = (item, restricted, type) => {
	if (restricted) return `${CONFIG.HELP_DESK_LINK}/servicedesk/customer/portal/5`;
	else {
		switch (type) {
			case 'application':
				return item.href;
			case 'dataSource':
			case 'database':
			case 'models':
				return `${CONFIG.DATA_CATALOG_LINK}/asset/${item.resource.id}`;
			case 'dashboard':
				return `${CONFIG.QLIK_URL}/sense/app/${item.id}`;
			default:
				return '';
		}
	}
};

const getRestricted = (item, type) => {
	switch (type) {
		case 'application':
			if (!_.isNull(item.permission)) {
				return !Permissions?.[item.permission]?.();
			} else {
				return false;
			}
		case 'dataSource':
		case 'database':
		case 'models':
			return false;
		case 'dashboard':
			return item.restricted;
		default:
			return false;
	}
};

const getDisplayTitle = (item, type) => {
	switch (type) {
		case 'application':
			return item.link_label;
		case 'dataSource':
		case 'database':
		case 'models':
			return item.resource.displayName;
		case 'dashboard':
			return item.name;
		default:
			return 'UKN';
	}
};

const cleanHighlightFieldName = (field) => {
	switch (field) {
		case 'displayName':
			return 'Display Name';
		default:
			return field.charAt(0).toUpperCase() + field.slice(1);
	}
};

const getType = (item, type) => {
	switch (type) {
		case 'dataSource':
			return item.resource?.type || capitalizeFirst(type);
		default:
			return capitalizeFirst(type);
	}
};

const getMetadataForPropertyTable = (item, type) => {
	const data = [];

	switch (type) {
		case 'dashboard':
			data.push({
				Key: 'Name',
				Value: `${item.name}`,
			});
			data.push({
				Key: 'Stream Name',
				Value: `${item.streamName}`,
			});
			data.push({
				Key: 'Description',
				Value: `${item.description}`,
			});
			data.push({
				Key: 'id',
				Value: `${item.id}`,
			});
			data.push({
				Key: 'Created At',
				Value: `${item.createdDate}`,
			});
			data.push({
				Key: 'Modified At',
				Value: `${item.modifiedDate}`,
			});
			data.push({
				Key: 'Publish Time',
				Value: `${item.publishTime}`,
			});
			data.push({
				Key: 'Tags',
				Value: `${item.tags}`,
			});
			break;
		case 'dataSource':
		case 'models':
		case 'database':
			data.push({
				Key: 'Created At',
				Value: `${item.resource.createdOn}`,
			});
			if (item.resource.createdBy) {
				if (item.resource.createdBy['firstName'] && item.resource.createdBy['lastName']) {
					data.push({
						Key: 'Created By Name',
						Value: `${item.resource.createdBy['firstName']} ${item.resource.createdBy['lastName']}`,
					});
				}
				if (item.resource.createdBy['emailAddress']) {
					data.push({
						Key: 'Created By Email',
						Value: `${item.resource.createdBy['emailAddress']}`,
					});
				}
			}
			if (item.resource.lastModifiedOn) {
				data.push({
					Key: 'Modified At',
					Value: `${item.resource.lastModifiedOn}`,
				});
			}
			if (item.resource.lastModifiedBy) {
				if (item.resource.lastModifiedBy['firstName'] && item.resource.lastModifiedBy['lastName']) {
					data.push({
						Key: 'Modified By Name',
						Value: `${item.resource.lastModifiedBy['firstName']} ${item.resource.lastModifiedBy['lastName']}`,
					});
				}
				if (item.resource.lastModifiedBy['emailAddress']) {
					data.push({
						Key: 'Modified By Email',
						Value: `${item.resource.lastModifiedBy['emailAddress']}`,
					});
				}
			}

			if (item.resource.domain) {
				data.push({
					Key: 'Domain',
					Value: `${item.resource.domain}`,
				});
			}
			if (item.resource.name) {
				data.push({
					Key: 'Name',
					Value: `${item.resource.name}`,
				});
			}
			if (item.resource.status) {
				data.push({
					Key: 'Status',
					Value: `${item.resource.status}`,
				});
			}
			if (item.resource.type) {
				data.push({
					Key: 'Type',
					Value: `${item.resource.type}`,
				});
			}
			if (item.resource.tags) {
				data.push({
					Key: 'Tags',
					Value: item.resource.tags.join(', '),
				});
			}
			if (item.attributes) {
				item.attributes.forEach((attr) => {
					data.push({
						Key: attr.field,
						Value: attr.value,
					});
				});
			}
			break;
		default:
			break;
	}

	return data;
};

const cardSubHeaderHandler = (props) => {
	return <></>;
};

const getCardHeaderHandler = (props) => {
	const { item, state, type, graphView, favoriteComponent } = props;

	const docListView = state.listView && !graphView;
	const restricted = getRestricted(item, type);
	const href = getUrl(item, restricted, type);
	const displayTitle = getDisplayTitle(item, type);

	return (
		<StyledFrontCardHeader listView={state.listView} restricted={restricted}>
			<div className={'title-text-selected-favorite-div'}>
				<GCTooltip title={displayTitle} placement="top" arrow>
					<div className={'title-text'} onClick={() => clickFn(state.cloneData.clone_name, href, type)}>
						<div className={'text'}>{displayTitle}</div>
						{docListView && (
							<div className={'list-view-arrow'}>
								<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }} />
							</div>
						)}
					</div>
				</GCTooltip>
				<div style={{ display: 'flex' }}>
					{docListView && (
						<div className={'list-view-sub-header'}>
							<p> {getType(item, type)} </p>
						</div>
					)}
					<div className={'selected-favorite'}>
						<div style={{ display: 'flex' }}>{favoriteComponent()}</div>
					</div>
				</div>
			</div>
		</StyledFrontCardHeader>
	);
};

const cardHandler = {
	application: {
		getCardHeader: (props) => {
			return getCardHeaderHandler({ ...props, type: 'application' });
		},

		getCardSubHeader: (props) => {
			return cardSubHeaderHandler(props);
		},

		getCardFront: (props) => {
			const { item, state } = props;

			let { description } = item;

			if (state.listView) {
				return <StyledListViewFrontCardContent>{item.description}</StyledListViewFrontCardContent>;
			} else {
				return (
					<StyledFrontCardContent>
						<div className={'image-container'}>
							<img src={QLIKICON} style={styles.image} alt={item.link_label} />
							<div className={'body-container'}>
								<div className={'body-text'}>{description}</div>
							</div>
						</div>
					</StyledFrontCardContent>
				);
			}

			// return (
			// 	<StyledFrontCardContent isWideCard={true}>
			// 		{description && (
			// 			<div className={'body-container'} style={{ margin: 10 }}>
			// 				<div className={'body-text'}>{description}</div>
			// 			</div>
			// 		)}
			// 	</StyledFrontCardContent>
			// );
		},

		getCardBack: (props) => {
			return <></>;
		},

		getFooter: (props) => {
			const { item, cloneName } = props;

			let { permission, href } = item;
			if (!_.isNull(permission)) {
				permission = Permissions?.[permission]?.();
			} else permission = true;

			const restricted = !permission;

			const url = restricted ? `${CONFIG.HELP_DESK_LINK}/servicedesk/customer/portal/5` : href;

			return (
				<CardButton
					href={url}
					onClick={(e) => {
						trackEvent(
							getTrackingNameForFactory(cloneName),
							'CardInteraction',
							restricted ? 'Application Card Request Access' : 'Application Card Launch',
							url
						);
					}}
					style={{ ...styles.footerButtonBack, CARD_FONT_SIZE, color: '#1E88E5' }}
					target="_blank"
				>
					{restricted ? 'Request Access' : 'Launch'}
				</CardButton>
			);
		},

		getCardExtras: (props) => {
			return <></>;
		},

		getFilename: (item) => {
			return '';
		},

		getDisplayTitle: (item) => {
			return '';
		},
	},

	dashboard: {
		getCardHeader: (props) => {
			return getCardHeaderHandler({ ...props, type: 'dashboard' });
		},

		getCardSubHeader: (props) => {
			return cardSubHeaderHandler(props);
		},

		getCardFront: (props) => {
			const { item, state, hoveredHit, setHoveredHit, backBody } = props;
			const { highlights, thumbnail, name } = item;

			let hoveredSnippet = '';
			if (Array.isArray(highlights) && highlights.length > 0 && highlights[hoveredHit]) {
				hoveredSnippet = highlights[hoveredHit]?.fragment ?? '';
			}
			const contextHtml = hoveredSnippet;

			if (state.listView) {
				return (
					<StyledListViewFrontCardContent>
						<GCAccordion
							header={'KEYWORD HITS'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'normal'}
						>
							<div className={'expanded-hits'}>
								<div className={'page-hits'}>
									{_.chain(highlights)
										.map((highlight, key) => {
											if (highlight.title || key < MAX_KEYS) {
												return (
													<div
														className={'page-hit'}
														key={key}
														style={{
															...(hoveredHit === key && {
																backgroundColor: PRIMARY_COLOR,
																color: 'white',
															}),
														}}
														onMouseEnter={() => setHoveredHit(key)}
														onClick={(e) => {
															e.preventDefault();
														}}
													>
														{highlight.title && (
															<span>{cleanHighlightFieldName(highlight.title)}</span>
														)}
														<i
															className="fa fa-chevron-right"
															style={{
																color:
																	hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
															}}
														/>
													</div>
												);
											}
											return '';
										})
										.value()}
								</div>
								<div className={'expanded-metadata'}>
									<blockquote dangerouslySetInnerHTML={{ __html: sanitizeHtml(contextHtml) }} />
								</div>
							</div>
						</GCAccordion>
						<GCAccordion
							header={'METADATA'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'normal'}
						>
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>{backBody}</div>
							</div>
						</GCAccordion>
					</StyledListViewFrontCardContent>
				);
			} else {
				return (
					<StyledFrontCardContent
						className={`tutorial-step-${state.componentStepNumbers['Highlight Keyword']}`}
					>
						<div className={'image-container'}>
							<img
								src={
									thumbnail
										? `${CONFIG.API_URL}/api/gameChanger/getThumbnail?` +
										  new URLSearchParams({ location: thumbnail }).toString()
										: QLIKICON
								}
								style={styles.image}
								alt={name}
							/>
						</div>
						<div className={'hits-container'}>
							<div className={'page-hits'}>
								{_.chain(highlights)
									.map((highlight, key) => {
										if (highlight.title || key < MAX_KEYS) {
											return (
												<div
													className={'page-hit'}
													key={key}
													style={{
														...(hoveredHit === key && {
															backgroundColor: PRIMARY_COLOR,
															color: 'white',
														}),
													}}
													onMouseEnter={() => setHoveredHit(key)}
													onClick={(e) => {
														e.preventDefault();
													}}
												>
													{highlight.title && (
														<span>{cleanHighlightFieldName(highlight.title)}</span>
													)}
													<i
														className="fa fa-chevron-right"
														style={{
															color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
														}}
													/>
												</div>
											);
										}
										return '';
									})
									.value()}
							</div>
							<div className={'expanded-metadata'}>
								<blockquote
									className="searchdemo-blockquote"
									style={{ maxHeight: 90 }}
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
			const { item, state } = props;

			const metaData = getMetadataForPropertyTable(item, 'dashboard');

			return (
				<div>
					<SimpleTable
						tableClass={'magellan-table'}
						zoom={1}
						headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
						rows={metaData}
						height={'auto'}
						dontScroll={true}
						colWidth={colWidth}
						disableWrap={true}
						title={'Metadata'}
						hideHeader={!!state.listView}
					/>
				</div>
			);
		},

		getFooter: (props) => {
			const { item, toggledMore, setToggledMore, cloneName, setModalOpen } = props;

			let { restricted, betaAvailable, id } = item;

			const PreparedLink = (
				<CardButton
					href={getUrl(id, restricted)}
					onClick={(e) => {
						if (!restricted && betaAvailable) {
							e.preventDefault();
							setModalOpen(true);
						}
						trackEvent(
							getTrackingNameForFactory(cloneName),
							'CardInteraction',
							restricted ? 'Qlik Card Request Access' : 'Qlik Card Launch',
							getUrl(id, restricted)
						);
					}}
					style={{ ...styles.footerButtonBack, CARD_FONT_SIZE, color: '#1E88E5' }}
					target="_blank"
				>
					{restricted ? 'Request Access' : 'Launch'}
				</CardButton>
			);

			return (
				<>
					{PreparedLink}
					<div
						style={{ ...styles.viewMoreButton, color: PRIMARY_COLOR }}
						onClick={() => {
							trackEvent(
								getTrackingNameForFactory(cloneName),
								'CardInteraction',
								'flipCard',
								toggledMore ? 'Overview' : 'More'
							);
							setToggledMore(!toggledMore);
						}}
					>
						{toggledMore ? 'Overview' : 'More'}
						<i
							style={{ ...styles.viewMoreChevron, color: PRIMARY_COLOR }}
							className="fa fa-chevron-right"
							aria-hidden="true"
						/>
					</div>
				</>
			);
		},

		getCardExtras: (props) => {
			const { modalOpen, setModalOpen, item } = props;

			const { id } = item;

			const openWindowCloseModal = (url) => {
				setModalOpen(false);
				window.open(url, '_blank');
			};
			const onCancelClick = () => setModalOpen(false);
			const onLegacyClick = () => openWindowCloseModal(`${CONFIG.QLIK_URL}/sense/app/${id}`);
			const onBetaClick = () => openWindowCloseModal(`#/qlik/app/${id}`);

			return (
				<>
					{modalOpen && (
						<BetaModal
							open={true}
							onCancelClick={onCancelClick}
							onLegacyClick={onLegacyClick}
							onBetaClick={onBetaClick}
						/>
					)}
				</>
			);
		},

		getFilename: (item) => {
			return '';
		},

		getDisplayTitle: (item) => {
			return '';
		},
	},

	dataSource: {
		getCardHeader: (props) => {
			return getCardHeaderHandler({ ...props, type: 'dataSource' });
		},

		getCardSubHeader: (props) => {
			return cardSubHeaderHandler(props);
		},

		getCardFront: (props) => {
			const { item, state, hoveredHit, setHoveredHit, backBody } = props;

			const tmpHighlights = [];
			item.highlights.forEach((highlight) => {
				if (highlight.field.indexOf('attribute') < 0) {
					tmpHighlights.push(highlight);
				}
			});

			let hoveredSnippet = '';
			if (Array.isArray(tmpHighlights) && tmpHighlights.length > 0 && tmpHighlights[hoveredHit]) {
				hoveredSnippet = tmpHighlights[hoveredHit]?.fragment ?? '';
			}
			const contextHtml = hoveredSnippet;

			if (state.listView) {
				return (
					<StyledListViewFrontCardContent>
						<GCAccordion
							header={'KEYWORD HITS'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'normal'}
						>
							<div className={'expanded-hits'}>
								<div className={'page-hits'}>
									{_.chain(tmpHighlights)
										.map((highlight, key) => {
											if (highlight.field || key < MAX_KEYS) {
												return (
													<div
														className={'page-hit'}
														key={key}
														style={{
															...(hoveredHit === key && {
																backgroundColor: PRIMARY_COLOR,
																color: 'white',
															}),
														}}
														onMouseEnter={() => setHoveredHit(key)}
														onClick={(e) => {
															e.preventDefault();
														}}
													>
														{highlight.field && (
															<span>{cleanHighlightFieldName(highlight.field)}</span>
														)}
														<i
															className="fa fa-chevron-right"
															style={{
																color:
																	hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
															}}
														/>
													</div>
												);
											}
											return '';
										})
										.value()}
								</div>
								<div className={'expanded-metadata'}>
									<blockquote dangerouslySetInnerHTML={{ __html: sanitizeHtml(contextHtml) }} />
								</div>
							</div>
						</GCAccordion>
						<GCAccordion
							header={'METADATA'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'normal'}
						>
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>{backBody}</div>
							</div>
						</GCAccordion>
					</StyledListViewFrontCardContent>
				);
			} else {
				return (
					<StyledFrontCardContent
						className={`tutorial-step-${state.componentStepNumbers['Highlight Keyword']}`}
					>
						<div className={'hits-container'}>
							<div className={'page-hits'}>
								{_.chain(tmpHighlights)
									.map((highlight, key) => {
										if (highlight.field || key < MAX_KEYS) {
											return (
												<div
													className={'page-hit'}
													key={key}
													style={{
														...(hoveredHit === key && {
															backgroundColor: PRIMARY_COLOR,
															color: 'white',
														}),
													}}
													onMouseEnter={() => setHoveredHit(key)}
													onClick={(e) => {
														e.preventDefault();
													}}
												>
													{highlight.field && (
														<span>{cleanHighlightFieldName(highlight.field)}</span>
													)}
													<i
														className="fa fa-chevron-right"
														style={{
															color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
														}}
													/>
												</div>
											);
										}
										return '';
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
			const { item, state } = props;

			const metaData = getMetadataForPropertyTable(item, 'dataSource');

			return (
				<div>
					<SimpleTable
						tableClass={'magellan-table'}
						zoom={1}
						headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
						rows={metaData}
						height={'auto'}
						dontScroll={true}
						colWidth={colWidth}
						disableWrap={true}
						title={'Metadata'}
						hideHeader={!!state.listView}
					/>
				</div>
			);
		},

		getFooter: (props) => {
			const { cloneName, toggledMore, setToggledMore, item, state } = props;

			const url = getUrl(item, getRestricted(item, 'dataSource'), 'dataSource');

			return (
				<>
					{!state.listView && (
						<>
							<CardButton
								href={'#'}
								onClick={(e) => {
									e.preventDefault();
									clickFn(state.cloneData.clone_name, url, item.type);
								}}
								style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
								target="_blank"
							>
								Open
							</CardButton>
							<div
								style={{ ...styles.viewMoreButton, color: PRIMARY_COLOR }}
								onClick={() => {
									trackEvent(
										getTrackingNameForFactory(cloneName),
										'CardInteraction',
										'flipCard',
										toggledMore ? 'Overview' : 'More'
									);
									setToggledMore(!toggledMore);
								}}
							>
								{toggledMore ? 'Overview' : 'More'}
								<i
									style={{ ...styles.viewMoreChevron, color: PRIMARY_COLOR }}
									className="fa fa-chevron-right"
									aria-hidden="true"
								/>
							</div>
						</>
					)}
				</>
			);
		},

		getCardExtras: (props) => {
			return <></>;
		},

		getFilename: (props) => {
			return '';
		},

		getDisplayTitle: (item) => {
			return getDisplayTitle(item, 'dataSource');
		},
	},

	database: {
		getCardHeader: (props) => {
			return getCardHeaderHandler({ ...props, type: 'database' });
		},

		getCardSubHeader: (props) => {
			return cardSubHeaderHandler(props);
		},

		getCardFront: (props) => {
			const { item, state, hoveredHit, setHoveredHit, backBody } = props;

			const tmpHighlights = [];
			item.highlights.forEach((highlight) => {
				if (highlight.field.indexOf('attribute') < 0) {
					tmpHighlights.push(highlight);
				}
			});

			let hoveredSnippet = '';
			if (Array.isArray(tmpHighlights) && tmpHighlights.length > 0 && tmpHighlights[hoveredHit]) {
				hoveredSnippet = tmpHighlights[hoveredHit]?.fragment ?? '';
			}
			const contextHtml = hoveredSnippet;

			if (state.listView) {
				return (
					<StyledListViewFrontCardContent>
						<GCAccordion
							header={'KEYWORD HITS'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'normal'}
						>
							<div className={'expanded-hits'}>
								<div className={'page-hits'}>
									{_.chain(tmpHighlights)
										.map((highlight, key) => {
											if (highlight.field || key < MAX_KEYS) {
												return (
													<div
														className={'page-hit'}
														key={key}
														style={{
															...(hoveredHit === key && {
																backgroundColor: PRIMARY_COLOR,
																color: 'white',
															}),
														}}
														onMouseEnter={() => setHoveredHit(key)}
														onClick={(e) => {
															e.preventDefault();
														}}
													>
														{highlight.field && (
															<span>{cleanHighlightFieldName(highlight.field)}</span>
														)}
														<i
															className="fa fa-chevron-right"
															style={{
																color:
																	hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
															}}
														/>
													</div>
												);
											}
											return '';
										})
										.value()}
								</div>
								<div className={'expanded-metadata'}>
									<blockquote dangerouslySetInnerHTML={{ __html: sanitizeHtml(contextHtml) }} />
								</div>
							</div>
						</GCAccordion>
						<GCAccordion
							header={'METADATA'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'normal'}
						>
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>{backBody}</div>
							</div>
						</GCAccordion>
					</StyledListViewFrontCardContent>
				);
			} else {
				return (
					<StyledFrontCardContent
						className={`tutorial-step-${state.componentStepNumbers['Highlight Keyword']}`}
					>
						<div className={'hits-container'}>
							<div className={'page-hits'}>
								{_.chain(tmpHighlights)
									.map((highlight, key) => {
										if (highlight.field || key < MAX_KEYS) {
											return (
												<div
													className={'page-hit'}
													key={key}
													style={{
														...(hoveredHit === key && {
															backgroundColor: PRIMARY_COLOR,
															color: 'white',
														}),
													}}
													onMouseEnter={() => setHoveredHit(key)}
													onClick={(e) => {
														e.preventDefault();
													}}
												>
													{highlight.field && (
														<span>{cleanHighlightFieldName(highlight.field)}</span>
													)}
													<i
														className="fa fa-chevron-right"
														style={{
															color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
														}}
													/>
												</div>
											);
										}
										return '';
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
			const { item, state } = props;

			const metaData = getMetadataForPropertyTable(item, 'database');

			return (
				<div>
					<SimpleTable
						tableClass={'magellan-table'}
						zoom={1}
						headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
						rows={metaData}
						height={'auto'}
						dontScroll={true}
						colWidth={colWidth}
						disableWrap={true}
						title={'Metadata'}
						hideHeader={!!state.listView}
					/>
				</div>
			);
		},

		getFooter: (props) => {
			const { cloneName, toggledMore, setToggledMore, item, state } = props;

			const url = getUrl(item, getRestricted(item, 'models'), 'database');

			return (
				<>
					{!state.listView && (
						<>
							<CardButton
								href={'#'}
								onClick={(e) => {
									e.preventDefault();
									clickFn(state.cloneData.clone_name, url, item.type);
								}}
								style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
								target="_blank"
							>
								Open
							</CardButton>
							<div
								style={{ ...styles.viewMoreButton, color: PRIMARY_COLOR }}
								onClick={() => {
									trackEvent(
										getTrackingNameForFactory(cloneName),
										'CardInteraction',
										'flipCard',
										toggledMore ? 'Overview' : 'More'
									);
									setToggledMore(!toggledMore);
								}}
							>
								{toggledMore ? 'Overview' : 'More'}
								<i
									style={{ ...styles.viewMoreChevron, color: PRIMARY_COLOR }}
									className="fa fa-chevron-right"
									aria-hidden="true"
								/>
							</div>
						</>
					)}
				</>
			);
		},

		getCardExtras: (props) => {
			return <></>;
		},

		getFilename: (props) => {
			return '';
		},

		getDisplayTitle: (item) => {
			return getDisplayTitle(item, 'database');
		},
	},

	models: {
		getCardHeader: (props) => {
			return getCardHeaderHandler({ ...props, type: 'models' });
		},

		getCardSubHeader: (props) => {
			return cardSubHeaderHandler(props);
		},

		getCardFront: (props) => {
			const { item, state, hoveredHit, setHoveredHit, backBody } = props;

			const tmpHighlights = [];
			item.highlights.forEach((highlight) => {
				if (highlight.field.indexOf('attribute') < 0) {
					tmpHighlights.push(highlight);
				}
			});

			let hoveredSnippet = '';
			if (Array.isArray(tmpHighlights) && tmpHighlights.length > 0 && tmpHighlights[hoveredHit]) {
				hoveredSnippet = tmpHighlights[hoveredHit]?.fragment ?? '';
			}
			const contextHtml = hoveredSnippet;

			if (state.listView) {
				return (
					<StyledListViewFrontCardContent>
						<GCAccordion
							header={'KEYWORD HITS'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'normal'}
						>
							<div className={'expanded-hits'}>
								<div className={'page-hits'}>
									{_.chain(tmpHighlights)
										.map((highlight, key) => {
											if (
												highlight.field &&
												key < MAX_KEYS &&
												!MODELS_HITS_KEY_NOT_ALLOWED.includes(highlight.field)
											) {
												return (
													<div
														className={'page-hit'}
														key={key}
														style={{
															...(hoveredHit === key && {
																backgroundColor: PRIMARY_COLOR,
																color: 'white',
															}),
														}}
														onMouseEnter={() => setHoveredHit(key)}
														onClick={(e) => {
															e.preventDefault();
														}}
													>
														{highlight.field && (
															<span>{cleanHighlightFieldName(highlight.field)}</span>
														)}
														<i
															className="fa fa-chevron-right"
															style={{
																color:
																	hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
															}}
														/>
													</div>
												);
											}
											return '';
										})
										.value()}
								</div>
								<div className={'expanded-metadata'}>
									<blockquote dangerouslySetInnerHTML={{ __html: sanitizeHtml(contextHtml) }} />
								</div>
							</div>
						</GCAccordion>
						<GCAccordion
							header={'METADATA'}
							headerBackground={'rgb(238,241,242)'}
							headerTextColor={'black'}
							headerTextWeight={'normal'}
						>
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>{backBody}</div>
							</div>
						</GCAccordion>
					</StyledListViewFrontCardContent>
				);
			} else {
				return (
					<StyledFrontCardContent
						className={`tutorial-step-${state.componentStepNumbers['Highlight Keyword']}`}
					>
						<div className={'hits-container'}>
							<div className={'page-hits'}>
								{_.chain(tmpHighlights)
									.map((highlight, key) => {
										if (
											highlight.field &&
											key < MAX_KEYS &&
											!MODELS_HITS_KEY_NOT_ALLOWED.includes(highlight.field)
										) {
											return (
												<div
													className={'page-hit'}
													key={key}
													style={{
														...(hoveredHit === key && {
															backgroundColor: PRIMARY_COLOR,
															color: 'white',
														}),
													}}
													onMouseEnter={() => setHoveredHit(key)}
													onClick={(e) => {
														e.preventDefault();
													}}
												>
													{highlight.field && (
														<span>{cleanHighlightFieldName(highlight.field)}</span>
													)}
													<i
														className="fa fa-chevron-right"
														style={{
															color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)',
														}}
													/>
												</div>
											);
										}
										return '';
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
			const { item, state } = props;

			const metaData = getMetadataForPropertyTable(item, 'models');

			return (
				<div>
					<SimpleTable
						tableClass={'magellan-table'}
						zoom={1}
						headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
						rows={metaData}
						height={'auto'}
						dontScroll={true}
						colWidth={colWidth}
						disableWrap={true}
						title={'Metadata'}
						hideHeader={!!state.listView}
					/>
				</div>
			);
		},

		getFooter: (props) => {
			const { cloneName, toggledMore, setToggledMore, item, state } = props;

			const url = getUrl(item, getRestricted(item, 'models'), 'models');

			return (
				<>
					{!state.listView && (
						<>
							<CardButton
								href={'#'}
								onClick={(e) => {
									e.preventDefault();
									clickFn(state.cloneData.clone_name, url, item.type);
								}}
								style={{ ...styles.footerButtonBack, CARD_FONT_SIZE, color: '#1E88E5' }}
								target="_blank"
							>
								Open
							</CardButton>
							<div
								style={{ ...styles.viewMoreButton, color: PRIMARY_COLOR }}
								onClick={() => {
									trackEvent(
										getTrackingNameForFactory(cloneName),
										'CardInteraction',
										'flipCard',
										toggledMore ? 'Overview' : 'More'
									);
									setToggledMore(!toggledMore);
								}}
							>
								{toggledMore ? 'Overview' : 'More'}
								<i
									style={{ ...styles.viewMoreChevron, color: PRIMARY_COLOR }}
									className="fa fa-chevron-right"
									aria-hidden="true"
								/>
							</div>
						</>
					)}
				</>
			);
		},

		getCardExtras: (props) => {
			return <></>;
		},

		getFilename: (props) => {
			return '';
		},

		getDisplayTitle: (item) => {
			return getDisplayTitle(item, 'models');
		},
	},
};

const GlobalSearchCardHandler = (props) => {
	const { setFilename, setDisplayTitle, item, cardType } = props;

	useEffect(() => {
		setFilename(cardHandler[cardType].getFilename(item));
		setDisplayTitle(cardHandler[cardType].getDisplayTitle(item));
	}, [cardType, item, setDisplayTitle, setFilename]);

	return <>{getDefaultComponent(props, cardHandler)}</>;
};

GlobalSearchCardHandler.propTypes = {
	setFileName: PropTypes.func,
};

export default GlobalSearchCardHandler;
