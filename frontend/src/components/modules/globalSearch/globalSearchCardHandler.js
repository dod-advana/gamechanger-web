import React, { useEffect } from 'react';
import { KeyboardArrowRight } from '@material-ui/icons';
import styled from 'styled-components';
import { capitalizeFirst, CARD_FONT_SIZE, getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import { CardButton } from '../../common/CardButton';
import { trackEvent } from '../../telemetry/Matomo';
import { Link, Typography } from '@material-ui/core';
import _ from 'underscore';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import CONFIG from '../../../config/config';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import BetaModal from '../../common/BetaModal';
import QLIKICON from '../../../images/icon/QLIK.svg';
import moment from 'moment';
import { parseOwnerName } from './globalSearchUtility';
import { primary } from '../../common/gc-colors';
import { getDefaultComponent, styles } from '../default/defaultCardHandler';

const StyledFrontCardHeader = styled.div`
	font-size: 1.2em;
	display: inline-block;
	color: black;
	margin-bottom: 0px;
	background-color: ${({ restricted }) => (!restricted ? 'white' : 'rgba(223,230,238,0.5)')};
	font-weight: bold;
	font-family: Montserrat;
	height: ${({ listView }) => (listView ? 'fit-content' : '59px')};
	padding: ${({ listView }) => (listView ? '0px' : '5px')};
	margin-left: ${({ listView }) => (listView ? '4px' : '0px')};
	margin-right: ${({ listView }) => (listView ? '10px' : '0px')};

	.title-text-selected-favorite-div {
		max-height: ${({ listView }) => (listView ? '' : '50px')};
		height: ${({ listView }) => (listView ? '35px' : '')};
		overflow: hidden;
		display: flex;
		justify-content: space-between;

		.title-text {
			cursor: pointer;
			display: ${({ listView }) => (listView ? 'flex' : '')};
			alignitems: ${({ listView }) => (listView ? 'top' : '')};
			height: ${({ listView }) => (listView ? 'fit-content' : '')};
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
		margin-top: 0px;
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
		margin-top: 5px;
	}

	img {
		height: 175px;
		width: 300px;
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
`;

const clickFn = (cloneName, href, type) => {
	trackEvent(getTrackingNameForFactory(cloneName), `SearchResults_${capitalizeFirst(type)}_Click`, href);
	window.open(href);
};

const getUrl = (id, restricted) => {
	if (restricted) return `${CONFIG.HELP_DESK_LINK}/servicedesk/customer/portal/5`;
	return `${CONFIG.QLIK_URL}/sense/app/${id}`;
};

const cardSubHeaderHandler = (props) => {
	return <></>;
};

const cardHandler = {
	application: {
		getCardHeader: (props) => {
			const { item, state, graphView } = props;

			const docListView = state.listView && !graphView;

			let { link_label, permission, type, href } = item;
			if (!_.isNull(permission)) {
				permission = Permissions?.[permission]?.();
			} else permission = true;

			return (
				<StyledFrontCardHeader listView={state.listView} restricted={!permission}>
					<div className={'title-text-selected-favorite-div'}>
						{/*<GCTooltip title={'Test'} placement='top' arrow>*/}
						<div className={'title-text'} onClick={() => clickFn(state.cloneData.clone_name, href, type)}>
							<div className={'text'}>{link_label}</div>
							{docListView && (
								<div className={'list-view-arrow'}>
									<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }} />
								</div>
							)}
						</div>
						{docListView && (
							<div className={'list-view-sub-header'}>
								<p> {capitalizeFirst(type)} </p>
							</div>
						)}
						{/*</GCTooltip>*/}
					</div>
				</StyledFrontCardHeader>
			);
		},

		getCardSubHeader: (props) => {
			return cardSubHeaderHandler(props);
		},

		getCardFront: (props) => {
			const { item } = props;

			let { description } = item;

			return (
				<StyledFrontCardContent isWideCard={true}>
					{description && (
						<div className={'body-container'}>
							<div className={'body-text'}>{description}</div>
						</div>
					)}
				</StyledFrontCardContent>
			);
		},

		getCardBack: (props) => {
			return <></>;
		},

		getFooter: (props) => {
			const { item, state } = props;

			let { permission, href, type } = item;
			if (!_.isNull(permission)) {
				permission = Permissions?.[permission]?.();
			} else permission = true;

			const url = !permission ? `${CONFIG.HELP_DESK_LINK}/servicedesk/customer/portal/5` : href;

			const RestrictedLink = (
				<Link href={url} onClick={() => clickFn(state.cloneData.clone_name, url, type)} style={styles.link}>
					Request Access
					<KeyboardArrowRightIcon style={styles.linkIcon} />
				</Link>
			);

			return (
				<>
					{!permission ? (
						RestrictedLink
					) : (
						<CardButton target={'_blank'} style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }} href={url}>
							Open
						</CardButton>
					)}
				</>
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
			const { item, state, graphView } = props;

			const docListView = state.listView && !graphView;

			let { name, id, restricted, type } = item;

			return (
				<StyledFrontCardHeader listView={state.listView} restricted={restricted}>
					<div className={'title-text-selected-favorite-div'}>
						{/*<GCTooltip title={'Test'} placement='top' arrow>*/}
						<div
							className={'title-text'}
							onClick={() => clickFn(state.cloneData.clone_name, getUrl(id, restricted), type)}
						>
							<div className={'text'}>{name}</div>
							{docListView && (
								<div className={'list-view-arrow'}>
									<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }} />
								</div>
							)}
						</div>
						{docListView && (
							<div className={'list-view-sub-header'}>
								<p> {capitalizeFirst(type)} </p>
							</div>
						)}
						{/*</GCTooltip>*/}
					</div>
				</StyledFrontCardHeader>
			);
		},

		getCardSubHeader: (props) => {
			return cardSubHeaderHandler(props);
		},

		getCardFront: (props) => {
			const { item } = props;

			const { name, description, thumbnail } = item;

			return (
				<StyledFrontCardContent isWideCard={true}>
					<div className={'image-container'}>
						<img
							src={
								thumbnail
									? `${CONFIG.API_URL}/api/gameChanger/getThumbnail?` +
									  new URLSearchParams({ location: thumbnail }).toString()
									: undefined
							}
							style={styles.image}
							alt={thumbnail ? name : undefined}
						/>
					</div>

					{description && (
						<div className={'body-container'}>
							<div className={'body-text'}>{description}</div>
						</div>
					)}
				</StyledFrontCardContent>
			);
		},

		getCardBack: (props) => {
			const { item } = props;

			const { lastReloadTime, modifiedDate, publishTime, restricted, owner } = item;

			return (
				<div style={styles.body(restricted)}>
					<Typography variant="body2">
						Data last reloaded: {new moment(lastReloadTime).format('MM-DD-YYYY').toString()}
					</Typography>
					<Typography variant="body2">
						Last modified date: {new moment(modifiedDate).format('MM-DD-YYYY').toString()}
					</Typography>
					<Typography variant="body2">
						Published date: {new moment(publishTime).format('MM-DD-YYYY').toString()}
					</Typography>
					<Typography variant="body2">Lead Developer: {parseOwnerName(owner?.name)}</Typography>
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
					style={{ ...styles.footerButtonBack, CARD_FONT_SIZE }}
					target="_blank"
				>
					{restricted ? 'Request Access' : 'Launch'}
				</CardButton>
			);

			return (
				<>
					{PreparedLink}
					<div
						style={{ ...styles.viewMoreButton, color: primary }}
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
							style={{ ...styles.viewMoreChevron, color: primary }}
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
			const { item, state, graphView } = props;

			const docListView = state.listView && !graphView;

			let { name, id } = item.resource;

			const url = `${CONFIG.DATA_CATALOG_LINK}/asset/${id}`;

			return (
				<StyledFrontCardHeader listView={state.listView} restricted={false}>
					<div className={'title-text-selected-favorite-div'}>
						{/*<GCTooltip title={'Test'} placement='top' arrow>*/}
						<div
							className={'title-text'}
							onClick={() => clickFn(state.cloneData.clone_name, url, item.type)}
						>
							<div className={'text'}>{name}</div>
							{docListView && (
								<div className={'list-view-arrow'}>
									<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }} />
								</div>
							)}
						</div>
						{docListView && (
							<div className={'list-view-sub-header'}>
								<p> {capitalizeFirst(item.type)} </p>
							</div>
						)}
						{/*</GCTooltip>*/}
					</div>
				</StyledFrontCardHeader>
			);
		},

		getCardSubHeader: (props) => {
			return cardSubHeaderHandler(props);
		},

		getCardFront: (props) => {
			const { item } = props;

			let { name, lastModifiedOn, status } = item.resource;

			return (
				<StyledFrontCardContent isWideCard={true}>
					<div className={'body-container'}>
						<div className={'body-text'}>
							<Typography variant="body1" style={styles.metadata}>
								Name: {name}
							</Typography>
							<Typography variant="body1" style={styles.metadata}>
								Last Updated: {new moment(lastModifiedOn).toString()}
							</Typography>
							<Typography variant="body1" style={styles.metadata}>
								Status: {status?.name}
							</Typography>
						</div>
					</div>
				</StyledFrontCardContent>
			);
		},

		getCardBack: (props) => {
			return <></>;
		},

		getFooter: (props) => {
			const { item, state } = props;

			let { id } = item.resource;

			const url = `${CONFIG.DATA_CATALOG_LINK}/asset/${id}`;

			return (
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
				</>
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

	database: {
		getCardHeader: (props) => {
			const { item, state, graphView } = props;

			const docListView = state.listView && !graphView;

			let { name, id } = item.resource;

			const url = `${CONFIG.DATA_CATALOG_LINK}/asset/${id}`;

			return (
				<StyledFrontCardHeader listView={state.listView} restricted={false}>
					<div className={'title-text-selected-favorite-div'}>
						{/*<GCTooltip title={'Test'} placement='top' arrow>*/}
						<div
							className={'title-text'}
							onClick={() => clickFn(state.cloneData.clone_name, url, item.type)}
						>
							<div className={'text'}>{name}</div>
							{docListView && (
								<div className={'list-view-arrow'}>
									<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }} />
								</div>
							)}
						</div>
						{docListView && (
							<div className={'list-view-sub-header'}>
								<p> {capitalizeFirst(item.type)} </p>
							</div>
						)}
						{/*</GCTooltip>*/}
					</div>
				</StyledFrontCardHeader>
			);
		},

		getCardSubHeader: (props) => {
			return cardSubHeaderHandler(props);
		},

		getCardFront: (props) => {
			const { item } = props;

			let { name, lastModifiedOn, status } = item.resource;

			return (
				<StyledFrontCardContent isWideCard={true}>
					<div className={'body-container'}>
						<div className={'body-text'}>
							<Typography variant="body1" style={styles.metadata}>
								Name: {name}
							</Typography>
							<Typography variant="body1" style={styles.metadata}>
								Last Updated: {new moment(lastModifiedOn).toString()}
							</Typography>
							<Typography variant="body1" style={styles.metadata}>
								Status: {status?.name}
							</Typography>
						</div>
					</div>
				</StyledFrontCardContent>
			);
		},

		getCardBack: (props) => {
			return <></>;
		},

		getFooter: (props) => {
			const { item, state } = props;

			let { id } = item.resource;

			const url = `${CONFIG.DATA_CATALOG_LINK}/asset/${id}`;

			return (
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
				</>
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
};

const GlobalSearchCardHandler = (props) => {
	const { setFilename, setDisplayTitle, item, cardType } = props;

	useEffect(() => {
		setFilename(cardHandler[cardType].getFilename(item));
		setDisplayTitle(cardHandler[cardType].getDisplayTitle(item));
	}, [cardType, item, setDisplayTitle, setFilename]);

	return <>{getDefaultComponent(props, cardHandler)}</>;
};

export default GlobalSearchCardHandler;
