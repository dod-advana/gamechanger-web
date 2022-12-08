// Package Imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Link from '@material-ui/core/Link';
import Popover from '@material-ui/core/Popover';
import Chip from '@material-ui/core/Chip';

// Local Imports
import GCTooltip from '../common/GCToolTip';
import GCButton from '../common/GCButton';
import { trackEvent } from '../telemetry/Matomo';
import { encode, getTrackingNameForFactory } from '../../utils/gamechangerUtils';
import { CustomDimensions } from '../telemetry/utils';

const StyledFavoriteDocumentCard = styled.div`
	width: 387px !important;
	height: 250px;
	background-color: #f4f4f4;
	border-radius: 6px;
	margin: 10px !important;
	position: relative;
	border: ${({ updated }) => (updated ? '1px solid #069FD9' : 'none')};

	> .main-info {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		> .top-buttons {
			margin-top: 16px;
			margin-left: 16px;
			display: flex;
			place-content: space-between;

			> .summary-title {
				color: #000000;
				font-family: 'Noto Sans';
				font-size: 18px;
				overflow: hidden;
				width: 326px;
				height: 38px;
				text-overflow: ellipsis;
				cursor: pointer;
				line-height: 1;
				-webkit-line-clamp: 2;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				margin-right: 5px;

				> .summary-title-link {
					text-decoration: none;
					color: #000000;
					font-family: 'Noto Sans';
					font-size: 18px;
					overflow: hidden;
					width: 326px;
					height: 38px;
					text-overflow: ellipsis;
					cursor: pointer;
					line-height: 1;
				}
			}

			> .check-div {
				width: 20px;
				height: 20px;
				margin-right: 28px;
				margin-top: -6px;
			}
		}

		> .summary-details {
			margin-top: 10px;
			margin-left: 13px;
			margin-right: 15px;
			height: 100%;

			> .summary-summary {
				color: #8d9599;
				font-family: Montserrat;
				font-size: 14px;
				width: 100%;
				height: 128px;
				overflow: hidden;
				text-overflow: ellipsis;
				line-height: 1;
				text-align: left;
			}
		}

		> .favorited-date {
			margin-top: -25px;
			margin-bottom: 8px;
			margin-left: 15px;
			text-align: start;
			font-size: 12px;
			font-family: Montserrat;
			color: #8091a5;
		}

		> .search-text {
			margin-left: 15px;
			text-align: start;
			font-size: 12px;
			font-family: Montserrat;
			color: #8091a5;
		}

		> .buttons-div {
			height: 30px;
			margin-left: 10px;
			margin-top: -24px;
			margin-bottom: 5px;

			> button {
				padding: 0 10px !important;
				height: 20px !important;
				min-width: 60px !important;
				margin: 0 5px !important;
				border-radius: 17px !important;
				line-height: unset !important;

				> div {
					margin-top: -5px;
				}
			}
		}

		> .stats-details {
			margin-top: -5px;
			display: flex;
			place-content: space-between;

			> .favorited-date {
				margin-bottom: 8px;
				margin-left: 15px;
				text-align: start;
				font-size: 12px;
				font-family: Montserrat;
				color: #8091a5;
			}

			> .stats-details-stat-div {
				display: flex;

				> .stats-comment {
					margin-left: -12px;
					margin-right: 15px;

					> .fa {
						color: #8091a5;
						height: 20px;
						width: 20px;
						font-size: 20px;
						cursor: pointer;
						margin-left: 10px;
					}
				}

				> .stats-stat {
					margin-right: 10px;

					> .stats-text {
						color: #8091a5;
						font-family: 'Noto Sans';
						font-size: 14px;
						font-weight: 500;
						margin-right: 5px;
					}

					> .fa {
						color: #8091a5;
						height: 20px;
						width: 20px;
						margin-bottom: -8px;
						padding-left: 2px;
						font-size: inherit;
					}
				}
			}
		}
	}

	> .overlay-details {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		border: 2px solid #386f94;
		border-radius: 6px;
		background-color: rgba(64, 79, 84, 0.97);
		box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.5);

		> .overlay-buttons {
			display: flex;
			justify-content: flex-end;
			margin-right: 5px;

			> .title-bar-close {
				margin-left: 92px;
				min-width: 10px;
				width: 30px;
				font-size: 16px;
				font-family: Montserrat;
				font-weight: bold;
				color: #ffffff;

				> .MuiButton-label {
				}
			}
		}

		> .overlay-text {
			height: 80%;
			margin-left: 10px;
			margin-right: 10px;
			overflow-wrap: break-word;
			color: #ffffff;
			font-family: Montserrat;
			font-size: 14px;
			text-align: left;
			padding: 5px;
			> .over-search-details {
				margin-bottom: 10px;
			}
		}
	}
`;

const CloseButton = styled.div`
	padding: 6px;
	background-color: white;
	border-radius: 5px;
	color: #8091a5 !important;
	border: 1px solid #b0b9be;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 0.4;
	position: absolute;
	right: 15px;
	top: 15px;
`;

const getCardTitle = (favoriteObject, favoriteType) => {
	switch (favoriteType) {
		case 'document':
			return favoriteObject.title;
		case 'organization':
			return favoriteObject.organization_name;
		case 'topic':
			return favoriteObject.topic_name;
		case 'search':
			return favoriteObject.search_name;
		default:
			return '';
	}
};

const getTitleDiv = (favoriteObject, favoriteType, handleClearNotification) => {
	switch (favoriteType) {
		case 'document':
		case 'organization':
		case 'topic':
			return getCardTitle(favoriteObject, favoriteType);
		case 'search':
			return (
				<>
					<Link
						className={'summary-title-link'}
						href={`#/${favoriteObject.tiny_url}`}
						target={'_blank'}
						onClick={handleClearNotification}
					>
						{favoriteObject.search_name}
					</Link>
					{favoriteObject.updated_results && (
						<Chip
							label="New Results"
							onDelete={handleClearNotification}
							style={{
								backgroundColor: '#069FD9',
								color: 'white',
								marginLeft: 10,
								fontSize: 14,
							}}
						/>
					)}
				</>
			);
		default:
			return 'No Title';
	}
};

const getSummary = (favoriteObject, favoriteType) => {
	switch (favoriteType) {
		case 'document':
			return favoriteObject.summary;
		case 'organization':
			break;
		case 'topic':
			break;
		case 'search':
			return favoriteObject.summary;
		default:
			break;
	}
};

const getOverlayText = (favoriteObject, favoriteType) => {
	switch (favoriteType) {
		case 'document':
			return favoriteObject.favorite_summary;
		case 'organization':
			return favoriteObject.organization_summary;
		case 'topic':
			return favoriteObject.topic_summary;
		case 'search':
			return favoriteObject.overlayText;
		default:
			break;
	}
};

const getActive = (favoriteObject, favoriteType) => {
	switch (favoriteType) {
		case 'document':
		case 'organization':
		case 'topic':
		case 'search':
			return favoriteObject.active;
		default:
			return false;
	}
};

const GCFavoriteCard = (props) => {
	const {
		handleDeleteFavorite,
		handleClearFavoriteSearchNotification,
		details,
		reload,
		setReload,
		idx,
		toggleActive,
		favoriteObject,
		cloneData,
		favoriteType,
	} = props;

	const [popoverOpen, setPopoverOpen] = useState(false);
	const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
	const [popoverIdx, setPopoverIdx] = useState(-1);
	const [cardTitle, setCardTitle] = useState('');
	const [updated, setUpdated] = useState(false);

	useEffect(() => {
		setCardTitle(getCardTitle(favoriteObject, favoriteType));
		if (favoriteType === 'search') {
			setUpdated(favoriteObject.updated_results);
		}
	}, [favoriteObject, favoriteType]);

	const handleStarClicked = (event) => {
		if (!popoverOpen && popoverIdx !== idx) {
			setPopoverAnchorEl(event.target);
			setPopoverOpen(true);
			setPopoverIdx(idx);
		} else {
			setPopoverAnchorEl(null);
			setPopoverOpen(false);
			setPopoverIdx(-1);
		}
	};

	const handleDelete = () => {
		setPopoverIdx(-1);
		setPopoverOpen(false);
		setPopoverAnchorEl(null);
		handleDeleteFavorite(idx);
	};

	const handleClearNotification = () => {
		handleClearFavoriteSearchNotification(idx);
	};

	const getSummaryTitleOnClick = (thisType) => {
		switch (thisType) {
			case 'document':
				return () => {
					trackEvent(
						getTrackingNameForFactory(cloneData.clone_name),
						'UserDashboardFavoritesInteraction',
						'PDFOpen',
						null,
						CustomDimensions.create(true, favoriteObject.filename)
					);
					window.open(
						`/#/pdfviewer/gamechanger?filename=${encode(favoriteObject.filename)}&prevSearchText=${
							favoriteObject.search_text
						}&pageNumber=${1}&isClone=${true}&cloneIndex=${cloneData.clone_name}&sourceUrl=${
							favoriteObject.download_url_s
						}`
					);
				};
			case 'topic':
				return () => {
					trackEvent('GAMECHANGER', 'TopicOpened', cardTitle);
					window.open(
						`#/gamechanger-details?&cloneName=${cloneData.clone_name}&type=topic&topicName=${cardTitle}`
					);
				};
			case 'organization':
				return () => {
					// trackEvent('GAMECHANGER', 'TopicOpened', cardTitle)
					window.open(
						`#/gamechanger-details?&cloneName=${cloneData.clone_name}&type=entity&entityName=${cardTitle}`
					);
				};
			default:
				return null;
		}
	};

	return (
		<StyledFavoriteDocumentCard key={idx} updated={updated}>
			<div className={'main-info'} data-cy="favorite-card">
				<div className={'top-buttons'}>
					<GCTooltip title={cardTitle} placement="top">
						<div
							className={'summary-title'}
							data-cy="favorite-card-title"
							onClick={getSummaryTitleOnClick(favoriteType)}
						>
							{getTitleDiv(favoriteObject, favoriteType, handleClearNotification)}
						</div>
					</GCTooltip>
					<div className={'check-div'}>
						<GCButton
							data-cy="favorite-star"
							onClick={(event) => handleStarClicked(event)}
							style={{
								height: 37,
								minWidth: 30,
								fontSize: 24,
								margin: 0,
								border: 'unset',
								padding: '0 6px',
							}}
							buttonColor={'#FFFFFF'}
							borderColor={'#B0B9BE'}
							textStyle={{ color: '#E9691D' }}
						>
							<i className={'fa fa-star'} />
						</GCButton>
						<Popover
							id={idx}
							onClose={handleStarClicked}
							open={popoverOpen && popoverIdx === idx}
							anchorEl={popoverAnchorEl}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'right',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
						>
							<div style={{ padding: '0px 15px 10px' }}>
								<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
									<CloseButton onClick={handleStarClicked}>
										<CloseIcon fontSize="small" />
									</CloseButton>
								</div>
								<div style={{ width: 350, margin: 5 }}>
									<div style={{ margin: '65px 15px 0' }}>
										Are you sure you want to delete this favorite? You will lose any comments made.
									</div>
									<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
										<GCButton
											onClick={handleStarClicked}
											style={{
												height: 40,
												minWidth: 40,
												padding: '2px 8px 0px',
												fontSize: 14,
												margin: '16px 0px 0px 10px',
											}}
											isSecondaryBtn={true}
										>
											No
										</GCButton>
										<GCButton
											onClick={() => {
												handleDelete();
											}}
											style={{
												height: 40,
												minWidth: 40,
												padding: '2px 8px 0px',
												fontSize: 14,
												margin: '16px 10px 0px',
												marginRight: 10,
											}}
										>
											Yes
										</GCButton>
									</div>
								</div>
							</div>
						</Popover>
					</div>
				</div>
				<div className={'summary-details'}>
					<div className={'summary-summary'}>{getSummary(favoriteObject, favoriteType)}</div>
				</div>
				{details}
			</div>
			<div className={'overlay-details'} hidden={!getActive(favoriteObject, favoriteType)}>
				<div className={'overlay-buttons'}>
					<Button
						className={'title-bar-close'}
						onClick={() => {
							toggleActive();
							setReload(!reload);
						}}
					>
						<CloseIcon fontSize={'large'} />
					</Button>
				</div>
				<div className={'overlay-text'}>{getOverlayText(favoriteObject, favoriteType)}</div>
			</div>
		</StyledFavoriteDocumentCard>
	);
};

GCFavoriteCard.propTypes = {
	cardTitle: PropTypes.string.isRequired,
	handleDeleteFavorite: PropTypes.func.isRequired,
	handleClearFavoriteSearchNotification: PropTypes.func.isRequired,
	summary: PropTypes.string.isRequired,
	idx: PropTypes.number.isRequired,
	tiny_url: PropTypes.string,
	details: PropTypes.element,
	overlayText: PropTypes.string,
	reload: PropTypes.bool,
	setReload: PropTypes.func,
	active: PropTypes.bool,
	toggleActive: PropTypes.func,
	isDocument: PropTypes.bool,
	favoriteObject: PropTypes.object,
	favoriteType: PropTypes.string,
	updated: PropTypes.bool,
	isTopic: PropTypes.bool,
	isOrganization: PropTypes.bool,
	cloneData: PropTypes.shape({
		clone_name: PropTypes.string,
	}),
};

export default GCFavoriteCard;
