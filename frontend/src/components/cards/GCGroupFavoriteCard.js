// Package Imports 
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Popover from '@material-ui/core/Popover';
import Icon from '@material-ui/core/Icon';
import moment from 'moment';

// Local Imports
import {trackEvent} from '../telemetry/Matomo';
import { getTrackingNameForFactory, encode } from '../../utils/gamechangerUtils';
import GCTooltip from '../common/GCToolTip'
import GCButton from '../common/GCButton';
import {CardButton} from '../common/CardButton';

const StyledFavoriteDocumentCard = styled.div`
	width: 387px !important;
	height: 250px;
   background-color: #F4F4F4;
   border-radius: 6px;
	margin: 10px;
	position: relative;
	left: 0px;
	margin: 0px;
	background: #F5F5F5 0% 0% no-repeat padding-box; 
	box-shadow: 0px -3px 6px #00000029; 
	position: absolute; 
	border: none;
	${({groupStyles, active}) => !active ? groupStyles?.main 
		: `top: 0px;
	background: #ECF1F7;
	height: 500px;
	z-index: 100;
	transition: top 1s, height 1s;`}

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
			
			> .back-button {
				position: absolute;
				top: 20px;
				left: 10px;
				color: #386F94;
				font-family: 'Noto Sans';
				${({active}) => active ? 'opacity: 1; visibility: visible;' : 'opacity: 0; visibility: hidden'}
				&:hover {
					cursor: pointer;
				}
				transition: opacity 1s;
			}

			> .summary-title {
				color: #000000;
				font-family: 'Noto Sans';
				font-size: 18px;
				overflow: hidden;
				width: 326px;
				height: 38px;
				text-overflow: ellipsis;
				line-height: 1;
				transition: margin-top .5s;
				
				> .summary-title-link {
					text-decoration: none;
    				color: #000000;
					font-family: 'Noto Sans';
					font-size: 18px;
					overflow: hidden;
					width: 326px;
					height: 38px;
					text-overflow: ellipsis;
					line-height: 1;
				}
			} 
			
			> .summary-title-active {
				margin-top: 40px;
				transition: margin-top 1s;
			}
    		
    		> .check-div {
				position: absolute;
				top: 10px;
				right: 10px;
    		}
    	}
    	
    	> .summary-details {
    		margin-top: 10px;
			margin-left: 13px;  
			margin-right: 15px;  
			height: 100%;

			> .summary-summary {
				color: #8D9599;
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
			color: #8091A5;
		}
		
		> .search-text {
			margin-left: 15px;
			text-align: start;
			font-size: 12px;
			font-family: Montserrat;
			color: #8091A5;
		}

		> .stats-details-active {
			visibility: visible;
			opacity: 1;
			transition: opacity 1s;
		}

		> .stats-details-inactive {
			visibility: hidden;
			opacity: 0;
			transition: opacity .5s, visibility .5s;
		}
    	
    	> .stats-details {
    		margin-top: -5px;
			display: flex;
			place-content: space-between;

			> .buttons-div {
				height: 40px;
				
				> a {
					margin-right: 5px;
				}
			}

			> .favorited-date {
				margin-bottom: 8px;
				margin-left: 15px;
				text-align: start;
				font-size: 12px;
				font-family: Montserrat;
				color: #8091A5;
			}
    		
    		> .stats-details-stat-div {
    			display: flex;
    			
    			> .stats-comment {
					margin-right: 10px;
	
					> .fa {
						color: #8091A5;
						height: 20px;
						width: 20px;
						font-size: 20px;
						cursor: pointer; 
						margin-left: 10px;
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
		border: 2px solid #386F94;
		border-radius: 6px;
		background-color: rgba(64, 79, 84, 0.97);
		box-shadow: 0 0 6px 2px rgba(0,0,0,0.5);
    
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
	color: #8091A5 !important;
	border: 1px solid #B0B9BE;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: .4;
	position: absolute;
	right: 15px;
	top: 15px;
`;

const GroupFavoriteCard = (props) => {
	
	const {
		cardTitle,
		overlayText,
		summary,
		idx,
		documentObject,
		styles,
		handleRemoveFavoriteFromGroup,
		dispatch,
		group,
		cloneData
	} = props;

	const createdDate = moment(Date.parse(documentObject.createdAt)).utc().format('YYYY-MM-DD HH:mm UTC');

	const [popoverOpen, setPopoverOpen] = useState(false);
	const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
	const [popoverIdx, setPopoverIdx] = useState(-1);
	const [active, setActive] = useState(false);
	const [showComments, setShowComments] = useState(false);

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
	}

	const clickFn = (filename, cloneName, searchText, pageNumber = 0, sourceUrl) => {
		trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction' , 'PDFOpen');
		trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'filename', filename);
		trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'pageNumber', pageNumber);
		window.open(`/#/pdfviewer/gamechanger?filename=${encode(filename)}${searchText ? `&prevSearchText=${searchText.replace(/"/gi, '')}` : ''}&pageNumber=${pageNumber}&cloneIndex=${cloneName}${sourceUrl ? `&sourceUrl=${sourceUrl}` : ''}`);
	};
	
	return (
		<StyledFavoriteDocumentCard key={idx} groupStyles={styles} active={active} onClick={() => {if(!active) setActive(true)}} style={active ? {height: 500, top: 0} : {}}>
			<div className={'main-info'}>
				<div className={'top-buttons'}>
					<div className={'back-button'} onClick={() => setActive(false)}>{'< Back'}</div>
					<GCTooltip title={cardTitle} placement='top'>
						<div className={active ? 'summary-title summary-title-active' : 'summary-title'}>
							<div className={'summary-title-link'}>{cardTitle}</div>
						</div>
					</GCTooltip>
					<div className={'check-div'}>
						<GCButton
							onClick={(event) => handleStarClicked(event)}
							style={{ height: 37, minWidth: 30, fontSize: 24, margin: 0, border: 'unset', padding: '0 6px' }}
							buttonColor={'#FFFFFF'}
							borderColor={'#B0B9BE'}
							textStyle={{color: '#E9691D'}}
						>
							<i className={'fa fa-star'} />
						</GCButton>
						<Popover id={idx} onClose={handleStarClicked}
							open={popoverOpen && popoverIdx === idx} anchorEl={popoverAnchorEl}
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
								<div style={{ display: 'flex', justifyContent: 'flex-end'}}>
									<CloseButton onClick={handleStarClicked}>
										<CloseIcon fontSize='small' />
									</CloseButton>
								</div>
								<div style={{width: 350, margin: 5}}>
									<div style={{ margin: '65px 15px 0'}}>Are you sure you want to remove this favorite from the group?</div>
									<div style={{display: 'flex', justifyContent: 'flex-end'}}>
										<GCButton
											onClick={handleStarClicked}
											style={{ height: 40, minWidth: 40, padding: '2px 8px 0px', fontSize: 14, margin: '16px 0px 0px 10px' }}
											isSecondaryBtn={true}
										>No
										</GCButton>
										<GCButton
											onClick={() => {
												setPopoverIdx(-1);
												setPopoverOpen(false);
												setPopoverAnchorEl(null);
												handleRemoveFavoriteFromGroup(group.id, documentObject.favorite_id, dispatch);
											}}
											style={{ height: 40, minWidth: 40, padding: '2px 8px 0px', fontSize: 14, margin: '16px 10px 0px', marginRight: 10 }}
										>Yes
										</GCButton>
									</div>
								</div>
							</div>
						</Popover>
					</div>
				</div>
				<div className={'summary-details'}>
					<div className={'summary-summary'}>{summary}</div>
				</div>
				<div className={active ? 'stats-details stats-details-active' : 'stats-details stats-details-inactive'}>
					<div className={'favorited-date'}>{createdDate}</div>
					<div className={'stats-details-stat-div'}>
						<GCTooltip title={`Click to see ${group.group_type} comments`} placement='top'>
							<div className={'stats-comment'}>
								<Icon className='fa fa-comment' onClick={() => setShowComments(!showComments)}
								/>
							</div>
						</GCTooltip>
					</div>
					<div className={'buttons-div'}>
						<CardButton target={'_blank'} style={{...styles.footerButtonBack, CARD_FONT_SIZE: 14}} href={'#'}
							onClick={(e) => {
								e.preventDefault();
								clickFn(documentObject.filename, cloneData.clone_name, documentObject.search_text, 0);
							}}
						>
								Open
						</CardButton>
						<CardButton
							style={{...styles.footerButtonBack, CARD_FONT_SIZE:14}}
							href={'#'}
							onClick={(e) => {
								trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'CardInteraction', 'showDocumentDetails');
								window.open(`#/gamechanger-details?cloneName=${cloneData.clone_name}&type=document&documentName=${documentObject.id}`);
								e.preventDefault();
							}}
						>
								Details
						</CardButton>
					</div>
				</div>
			</div>
			<div className={'overlay-details'} hidden={!showComments}>
				<div className={'overlay-buttons'}>
					<Button className={'title-bar-close'}
						onClick={()=> {
							setShowComments(!showComments);
						}}
					><CloseIcon fontSize={'large'}/></Button>
				</div>
				<div className={'overlay-text'}>
					{overlayText}
				</div>
			</div>
		</StyledFavoriteDocumentCard>
	)
}

GroupFavoriteCard.propTypes = {
	styles: PropTypes.object,
	handleRemoveFavoriteFromGroup: PropTypes.func,
	dispatch: PropTypes.func,
	group: PropTypes.object,
	cardTitle: PropTypes.string.isRequired,
	summary: PropTypes.string.isRequired,
	idx: PropTypes.number.isRequired,
	overlayText: PropTypes.string,
	documentObject: PropTypes.object,
	isTopic: PropTypes.bool,
	isOrganization: PropTypes.bool,
	cloneData: PropTypes.shape({
		clone_name: PropTypes.string
	})
}

export default GroupFavoriteCard;
