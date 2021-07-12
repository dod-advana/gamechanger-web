import React from "react";
import {trackEvent} from "../../telemetry/Matomo";
import {
	CARD_FONT_SIZE,
	getDocTypeStyles,
	getMetadataForPropertyTable, getReferenceListMetadataPropertyTable,
	getTrackingNameForFactory, getTypeDisplay, getTypeIcon, getTypeTextColor
} from "../../../gamechangerUtils";
import {CardButton} from "../../common/CardButton";
import GCTooltip from "../../common/GCToolTip";
import SimpleTable from "../../common/SimpleTable";
import _ from "lodash";
import styled from "styled-components";
import GCButton from "../../common/GCButton";
import {Popover, TextField} from "@material-ui/core";
import {KeyboardArrowRight} from "@material-ui/icons";
import Permissions from "advana-platform-ui/dist/utilities/permissions";
import {crawlerMappingFunc} from "../../../gamechangerUtils";

const styles = {
    footerButtonBack: {
        margin: '0 10px 0 0 ',
		padding: '8px 12px'
	},
	viewMoreChevron: {
		fontSize: 14,
		color: '#1E88E5',
		fontWeight: 'normal',
		marginLeft: 5
    },
	viewMoreButton: {
		fontSize: 16,
		color: '#1E88E5',
		fontWeight: 'bold',
		cursor: 'pointer',
		minWidth: 60
	},
	 collectionContainer: {
		margin: '1em',
		overflow: 'auto'
	},
	bodyImg: {
        width: 75,
        margin: '10px'
    },
	bodyText: {
        margin: '10px',
        fontSize: '14px'
    },
};

const colWidth = {
	maxWidth: '900px',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const FavoriteTopic = styled.button`
	border: none;
	height: 25px;
	border-radius: 15px;
	background-color: white;
	color: black;
	white-space: nowrap;
	text-align: center;
	display: inline-block;
	padding-left: 5px;
	padding-right: 5px;
	margin-left: 6px;
	margin-right: 6px;
	margin-bottom: 3px;
	cursor: pointer;
	border: 1px solid darkgray;

	> i {
        color: ${({ favorited }) => favorited? '#E9691D' : '#B0B9BE'};
    }
	&:hover {
		background-color: #E9691D;
		color: white;
        > i {
             color: ${({ favorited }) => favorited? '#FFFFFF' : '#B0B9BE'};
        }
	};
`;

const StyledFrontCardHeader = styled.div`
	font-size: 1.2em;
	display: inline-block;
	color: black;
	margin-bottom: 0px;
	background-color: ${({intelligentSearch}) => intelligentSearch ? '#9BB1C8': 'white'};
	font-weight: bold;
	font-family: Montserrat;
	height: ${({listView}) => listView ? 'fit-content': '59px'};
	padding: ${({listView}) => listView ? '0px': '5px'};
	margin-left: ${({listView}) => listView ? '10px': '0px'};
	margin-right: ${({listView}) => listView ? '10px': '0px'};
	
	.title-text-selected-favorite-div {
		max-height: ${({listView}) => listView ? '': '50px'};
		height: ${({listView}) => listView ? '35px': ''};
		overflow: hidden;
		display: flex;
		justify-content: space-between;
		
		.title-text {
			cursor: pointer;
			display:  ${({docListView}) => docListView ? 'flex': ''};
			alignItems:  ${({docListView}) => docListView ? 'top': ''};
			height:  ${({docListView}) => docListView ? 'fit-content': ''};
			
			.text {
				margin-top: ${({listView}) => listView ? '10px': '0px'};
			}
			
			.list-view-arrow {
				display: inline-block;
				margin-top: 7px;
			}
		}
		
		.selected-favorite {
			display: inline-block;
			font-family: "Noto Sans";
			font-weight: 400;
			font-size: ${CARD_FONT_SIZE}px;
			margin-top: ${({listView}) => listView ? '2px': '0px'};
		}
	}
	
	.list-view-sub-header {
		font-size: 0.8em;
		display: flex;
		color: black;
		margin-bottom: 0px;
		margin-top: 0px;
		background-color: ${({intelligentSearch}) => intelligentSearch ? '#9BB1C8': 'white'};
		font-family: Montserrat;
		height: 24px;
		justify-content: space-between;
	}
`;

const StyledFrontCardSubHeader = styled.div`
	display: flex;
	position: relative;
	
	.sub-header-one {
		color: ${({typeTextColor}) => typeTextColor ? typeTextColor : '#ffffff'};
		background-color: ${({docTypeColor}) => docTypeColor ? docTypeColor : '#000000'};
		width: 50%;
		padding: 8px;
		display: flex;
		align-items: center;
		
		img {
			width: 25px;
    		margin: 0px 10px 0px 0px;
		}
	}
	
	.sub-header-two {
		width: 50%;
		color: white;
		padding: 10px 8px 8px;
		background-color: ${({docOrgColor}) => docOrgColor ? docOrgColor : '#000000'};
	}

	.sub-header-full {
		color: ${({typeTextColor}) => typeTextColor ? typeTextColor : '#ffffff'};
		background-color: ${({docTypeColor}) => docTypeColor ? docTypeColor : '#000000'};
		padding: 8px;
		display: flex;
		align-items: center;
		width: 100%;
		img {
			width: 25px;
    		margin: 0px 10px 0px 0px;
		}
	}
`;

const RevokedTag = styled.div`
	font-size: 11px;
	font-weight: 600;
	border: none;
	height: 25px;
	border-radius: 15px;
	background-color: #e50000;
	color: white;
	white-space: nowrap;
	text-align: center;
	display: inline-block;
	padding-left: 15px;
	padding-right: 15px;
	margin-top: 10px;
	margin-bottom: 10px;
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
			color: #386f94;
			font-weight: normal;
			margin-left: 5px;
			margin-right: 20px;
		}
	}
	
	.expanded-hits {
		display: flex;
		height: 100%;
		
		.page-hits {
			min-width: 100px;
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
				color: #386F94;
				
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
				
				background: #eceef1;
				margin-bottom: 0;
				height: 165px;
				border-left: 0;
				overflow: hidden;
				font-family: Noto Sans, Arial, Helvetica, sans-serif;
				padding: 0.5em 10px;
				margin-left: 0;
				quotes: "\\201C""\\201D""\\2018""\\2019";
				
				> em {
					color: white;
					background-color: #E9691D;
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

const StyledFrontCardContent = styled.div`
	font-family: "Noto Sans";
    overflow: auto;
    font-size: ${CARD_FONT_SIZE}px;
    
    .current-as-of-div {
    	display: flex;
		justify-content: space-between;
		
		.current-text {
			margin: 10px 0;
		}
    }
    
    .hits-container {
    	display: flex;
    	height: 100%;
    	
    	.page-hits {
    		min-width: 100px;
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
				color: #386F94;
				
				span {
					font-size: ${CARD_FONT_SIZE}px;
				}
				
				i {
					font-size: ${CARD_FONT_SIZE}px;
					margin-left: 10px;
				}
			}
			
			> .expanded-metadata {
				border: 1px solid rgb(189, 189, 189);
				border-left: 0px;
				min-height: 126px;
				width: 100%;
				max-width: ${({isWideCard}) => isWideCard ? '' : '280px'};
				
				> blockquote {
					font-size: ${CARD_FONT_SIZE}px;
					line-height: 20px;
					
					background: #dde1e0;
					margin-bottom: 0;
					height: 165px;
					border-left: 0;
					overflow: hidden;
					font-family: Noto Sans, Arial, Helvetica, sans-serif;
					padding: 0.5em 10px;
					margin-left: 0;
					quotes: "\\201C""\\201D""\\2018""\\2019";
					
					> em {
						color: white;
						background-color: #E9691D;
						margin-right: 5px;
						padding: 4px;
						font-style: normal;
					}
				}
			}
    	}
    }
`;

const StyledEntityTopicFrontCardContent = styled.div`
	display: flex;
	height: 100%;
	flex-direction: column;
	align-items: center;
	background-color: ${({listView}) => listView ? 'transparent' : 'rgb(238, 241, 242)'};
	
	> img {
		width: 75px;
		height: 75px;
    	margin: 10px;
	}
	
	> p {
		margin-top: 10px;
		padding: 10px;
    font-size: 14px;
		background-color: white;
	}
	
	.loading-indicator {
		margin-top: -90px;
	}
	
	.topic-container {
		width: 100%;
		margin-top: 15px;
		
		> .topics-doc-count {
		
		}
		
		> .topics-organizations {
			margin: 5px 0;
		}
		
		.topics-header {
			font-weight: bold;
			margin-bottom: 5px;
		}
	}
`;
const clickFn = (filename, cloneName, searchText, pageNumber = 0, sourceUrl) => {
    trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction' , 'PDFOpen');
	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'filename', filename);
	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'pageNumber', pageNumber);
	window.open(`/#/pdfviewer/gamechanger?filename=${filename}${searchText ? `&prevSearchText=${searchText.replace(/"/gi, '')}` : ''}&pageNumber=${pageNumber}&cloneIndex=${cloneName}${sourceUrl ? `&sourceUrl=${sourceUrl}` : ''}`);
};

const addFavoriteTopicToMetadata = (data, userData, setFavoriteTopic, setFavorite, handleFavoriteTopicClicked, cloneData) => {
		const { favorite_topics = null } = userData ?? {};
		let favorites = [];
		
		if (favorite_topics) {
			favorites = favorite_topics.map(({topic_name}) => topic_name)
		}
		const temp = _.cloneDeep(data);
		temp.map(metaData => {
			if(metaData.Key === 'Topics') {
				metaData.Key = <div>
					Topics<br/><b style={{color:'red'}}>(Beta)</b>
					</div>
				const topics = metaData.Value;
				metaData.Value =
				<div>
					{topics.map((topic,index) => {
						topic = topic.trim()
						const favorited = favorites.includes(topic);
						return(
							<FavoriteTopic key={index}
								onClick={(event) => {
									trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'TopicOpened', topic)
									window.open(`#/gamechanger-details?cloneName=${cloneData.clone_name}&type=topic&topicName=${topic}`);
								}}
								favorited={favorited}
							>
								{topic}
								<i style={{marginLeft: '5px', cursor: 'pointer'}}
								   className={ "fa fa-star" }
								   onClick={(event) => {
								   		event.stopPropagation();
								   		setFavoriteTopic(topic)
										setFavorite(favorited);
										handleFavoriteTopicClicked(event.target)
								   }}
								/>
							</FavoriteTopic>
							)
						})
					}
				</div>
			}
			return metaData
		})
		return temp
	}
	
const getCardHeaderHandler = ({item, state, idx, checkboxComponent, favoriteComponent, graphView, intelligentSearch}) => {
	const displayTitle = getDisplayTitle(item);
	const isRevoked = item.is_revoked_b;
	
	const docListView = state.listView && !graphView;
	
	const displayOrg = item['display_org_s'] ? item['display_org_s'] : 'Uncategorized';
	const displayType = item['display_doc_type_s'] ? item['display_doc_type_s'] : 'Document';
	let publicationDate;
	if(item.publication_date_dt !== undefined && item.publication_date_dt !== ''){
		const currentDate = new Date(item.publication_date_dt);
		const year = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(currentDate);
		const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(currentDate);
		const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
		publicationDate = `${month}-${day}-${year}`;
	} else {
		publicationDate = `unknown`;
	}
	
	return (
		<StyledFrontCardHeader listView={state.listView} docListView={docListView} intelligentSearch={intelligentSearch}>
			<div className={'title-text-selected-favorite-div'}>
				<GCTooltip title={displayTitle} placement='top' arrow>
					<div className={'title-text'}
						 onClick={(docListView) ? () => clickFn(item.filename, state.cloneData.clone_name, state.searchText, 0) : () => {}}
					>
						<div className={'text'}>
							{displayTitle}
						</div>
						{docListView &&
							<div className={'list-view-arrow'}>
								<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }}/>
							</div>
						}
					</div>
				</GCTooltip>
				<div className={'selected-favorite'}>
					<div style={{display: "flex"}}>
						{docListView && isRevoked && <RevokedTag>Canceled</RevokedTag>}
						{checkboxComponent(item.filename, item.display_title_s, idx)}
						{favoriteComponent()}
					</div>
				</div>
			</div>
			{docListView &&
				<div className={'list-view-sub-header'}>
					<p> {displayType} | {displayOrg} </p>
					<p style={{ fontWeight: 400 }}>{`Published on: ${publicationDate ?? 'Unknown'}`}</p>
				</div>
			}
		</StyledFrontCardHeader>
	);
};

const getCardSubHeaderHandler = ({item, state, toggledMore}) => {
	const cardType = item.type;
	const iconSrc = getTypeIcon(cardType);
	const typeTextColor = getTypeTextColor(cardType);
	
	const displayOrg = item['display_org_s'] ? item['display_org_s'] : 'Uncategorized';
	const displayType = item['display_doc_type_s'] ? item['display_doc_type_s'] : 'Document';
	
	let { docTypeColor, docOrgColor } = getDocTypeStyles(displayType, displayOrg);
	
	return (
		<>
			{!state.listView && !toggledMore &&
				<StyledFrontCardSubHeader typeTextColor={typeTextColor} docTypeColor={docTypeColor} docOrgColor={docOrgColor}>
					<div className={'sub-header-one'}>
						{iconSrc.length > 0 && <img src={iconSrc} alt="type logo"/>}
						{displayType}
					</div>
					<div className={'sub-header-two'}>
						{item.display_org_s ? item.display_org_s : getTypeDisplay(displayOrg)}
					</div>
				</StyledFrontCardSubHeader>
			}
		</>
	);
};

const getCardExtrasHandler = (props) => {
	
	const {
		isFavorite,
		topicFavoritePopperOpen,
		topicFavoritePopperAnchorEl,
		favoriteSummary,
		setFavoriteSummary,
		classes,
		handleSaveTopic,
		handleFavoriteTopicClicked
	} = props;
	
	return (
		<Popover onClose={() => handleFavoriteTopicClicked(null)}
			open={topicFavoritePopperOpen} anchorEl={topicFavoritePopperAnchorEl}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
		>
			{isFavorite ?
			<div className={classes.paper}>
				<div style={{width: 330, margin: 5}}>
					<div>Are you sure you wish to delete this favorite? You will lose any comments made.</div>
					<div style={{display: 'flex', justifyContent: 'flex-end'}}>
						<GCButton
							onClick={() => {
								handleSaveTopic(false);
							}}
							style={{ height: 40, minWidth: 40, padding: '2px 8px 0px', fontSize: 14, margin: '16px 0px 0px 10px' }}
						>Yes
						</GCButton>
						<GCButton
							onClick={()=>handleFavoriteTopicClicked(null)}
							style={{ height: 40, minWidth: 40, padding: '2px 8px 0px', fontSize: 14, margin: '16px 0px 0px 10px' }}
						>No
						</GCButton>
					</div>
				</div>
			</div>
			:
			<div className={classes.paper}>
				<div style={{width: 330, margin: 5}}>
					<TextField
						label={'Comments'}
						value={favoriteSummary}
						onChange={(event) => setFavoriteSummary(event.target.value)}
						className={classes.textArea}
						margin='none'
						size='small'
						variant='outlined'
						multiline={true}
						rows={4}
					/>
					<div style={{display: 'flex', justifyContent: 'flex-end'}}>
						<GCButton
							onClick={() => handleSaveTopic(true)}
							style={{ height: 40, minWidth: 40, padding: '2px 8px 0px', fontSize: 14, margin: '16px 0px 0px 10px' }}
						>Save
						</GCButton>
						<GCButton
							onClick={() => handleFavoriteTopicClicked(null)}
							style={{ height: 40, minWidth: 40, padding: '2px 8px 0px', fontSize: 14, margin: '16px 0px 0px 10px' }}
							textStyle={{ color: '#8091A5' }}
							buttonColor={ '#FFFFFF' }
							borderColor={ '#B0B9BE' }
						>Cancel
						</GCButton>
					</div>
				</div>
			</div>
			}
		</Popover>
	);
};

const getDisplayTitle = (item) => {
	return item.display_title_s ? item.display_title_s : item.title;
};

const PolicyCardHandler = {
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
				 intelligentFeedbackComponent
			} = props;
			
			let hoveredSnippet = '';
			if (Array.isArray(item.pageHits) && item.pageHits[hoveredHit]) {
				hoveredSnippet = item.pageHits[hoveredHit]?.snippet ?? '';
			}
			const contextHtml = hoveredSnippet;
			const isWideCard = true;
			
			let publicationDate;
			if(item.publication_date_dt !== undefined && item.publication_date_dt !== ''){
				const currentDate = new Date(item.publication_date_dt);
				const year = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(currentDate);
				const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(currentDate);
				const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
				publicationDate = `${month}-${day}-${year}`;
			} else {
				publicationDate = `unknown`;
			}
		
			if (state.listView && !intelligentSearch) {
				return (
					<StyledListViewFrontCardContent>
						{item.pageHits.length > 0 &&
							<button type="button" className={'list-view-button'}
									onClick={() => {
										trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'ListViewInteraction', !hitsExpanded ? 'Expand hit pages' : 'Collapse hit pages');
										setHitsExpanded(!hitsExpanded);
									}}
							>
								<GCTooltip
									title={'Date GAMECHANGER last verified this document against its originating source'}
									placement='top' arrow>
									<span className="buttonText">Page Hits</span>
								</GCTooltip>
								<i className={hitsExpanded ? "fa fa-chevron-up" : "fa fa-chevron-down"} aria-hidden="true"/>
							</button>
						}
						{hitsExpanded && item.pageHits.length > 0 &&
							<div className={'expanded-hits'}>
								<div className={'page-hits'}>
									{_.chain(item.pageHits).map((page, key) => {
										return (
											<div className={'page-hit'} key={key} style={{
													...(hoveredHit === key && { backgroundColor: '#E9691D', color: 'white' }),
												}}
												onMouseEnter={() => setHoveredHit(key) }
												onClick={e => {
													e.preventDefault();
													clickFn(item.filename, state.cloneData.clone_name, state.searchText, page.pageNumber);
												}}
											>
												<span>
													{page.title && <span >{page.title}</span>}
													{page.pageNumber && <span >{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}</span>}
												</span>
												<i className="fa fa-chevron-right" style={{ color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)' }} />
											</div>
										);
									}).value()}
								</div>
								<div className={'expanded-metadata'}>
									<blockquote dangerouslySetInnerHTML={{ __html: contextHtml }} />
								</div>
							</div>
						}
						<button type="button" className={'list-view-button'}
							onClick={() => {
								trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'ListViewInteraction', !metadataExpanded ? 'Expand metadata' : 'Collapse metadata');
								setMetadataExpanded(!metadataExpanded);
							}}
						>
							<span className="buttonText">Document Metadata</span>
							<i className = {metadataExpanded ? "fa fa-chevron-up" : "fa fa-chevron-down"} aria-hidden="true"/>
						</button>
						{metadataExpanded &&
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>
									{backBody}
								</div>
							</div>
						}
					</StyledListViewFrontCardContent>
				);
			} else if (state.listView && intelligentSearch) {
				return (
					<StyledListViewFrontCardContent>
						<div className={'expanded-hits'}>
							<div className={'page-hits'}>
								{_.chain(item.pageHits).map((page, key) => {
									return (
											<div className={'page-hit'} key={key} style={{
													...(hoveredHit === key && { backgroundColor: '#E9691D', color: 'white' }),
												}}
												onMouseEnter={() => setHoveredHit(key) }
												onClick={e => {
													e.preventDefault();
													clickFn(item.filename, state.cloneData.clone_name, state.searchText, page.pageNumber);
												}}
											>
												<span>
													{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}
												</span>
												<i className="fa fa-chevron-right" style={{ color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)' }} />
											</div>
										);
								}).value()}
							</div>
							<div className={'expanded-metadata'}>
								<blockquote dangerouslySetInnerHTML={{ __html: contextHtml }} />
							</div>
						</div>
						<button type="button" className={'list-view-button'}
							onClick={() => {
								trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'ListViewInteraction', !metadataExpanded ? 'Expand metadata' : 'Collapse metadata');
								setMetadataExpanded(!metadataExpanded);
							}}>
								<span className="buttonText">Document Metadata</span>
								<i className = {metadataExpanded ? "fa fa-chevron-up" : "fa fa-chevron-down"} aria-hidden="true"/>
						</button>
		
						{metadataExpanded &&
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>
									{backBody}
								</div>
							</div>
						}
						
						<div style={{marginTop: '10px', marginBottom: '10px'}}> {intelligentFeedbackComponent()} </div>
					</StyledListViewFrontCardContent>
				);
			} else {
				
				return (
					<StyledFrontCardContent className={`tutorial-step-${state.componentStepNumbers["Highlight Keyword"]}`} isWideCard={isWideCard}>
						<div className={'currents-as-of-div'}>
							<GCTooltip title={'Date GAMECHANGER last verified this document against its originating source'} placement='top' arrow>
								<div className={'current-text'}>
									{`Published on: ${publicationDate ?? 'Unknown'}`}
								</div>
							</GCTooltip>
							{item.isRevoked &&
								<GCTooltip title={'This version of the document is no longer in effect'} placement='top' arrow>
									<RevokedTag>Canceled</RevokedTag>
								</GCTooltip>
							}
						</div>
						<div className={'hits-container'}>
							<div className={'page-hits'}>
								{_.chain(item.pageHits).map((page, key) => {
									return (
										<div className={'page-hit'} key={key} style={{
												...(hoveredHit === key && { backgroundColor: '#E9691D', color: 'white' }),
											}}
											onMouseEnter={() => setHoveredHit(key) }
											onClick={e => {
												e.preventDefault();
												clickFn(item.filename, state.cloneData.clone_name, state.searchText, page.pageNumber);
											}}
										>
											{page.title && <span >{page.title}</span>}
											{page.pageNumber && <span >{page.pageNumber === 0 ? 'ID' : `Page ${page.pageNumber}`}</span>}
											<i className="fa fa-chevron-right" style={{ color: hoveredHit === key ? 'white' : 'rgb(189, 189, 189)' }} />
										</div>
									)
								}).value()}
							</div>
							<div className={'expanded-metadata'}>
								<blockquote className="searchdemo-blockquote" dangerouslySetInnerHTML={{ __html: contextHtml }}/>
							</div>
						</div>
					</StyledFrontCardContent>
				);
			}
		},
		
		getCardBack: ({item, state, setFavoriteTopic, setFavorite, handleFavoriteTopicClicked}) => {
			
			const data = getMetadataForPropertyTable(item);
			const { ref_list = [] } = item
			const previewDataReflist = getReferenceListMetadataPropertyTable(ref_list);
			
			const labelText = item.isRevoked ? 'Cancel Date' : 'Verification Date';
			let dateText = "Unknown";
			if(item.current_as_of !== undefined && item.current_as_of !== ''){
				const currentDate = new Date(item.current_as_of);
				const year = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(currentDate);
				const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(currentDate);
				const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
				dateText = `${month}-${day}-${year}`;
			}
			
			let publicationDate;
			if(item.publication_date_dt !== undefined && item.publication_date_dt !== ''){
				const currentDate = new Date(item.publication_date_dt);
				const year = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(currentDate);
				const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(currentDate);
				const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
				publicationDate = `${month}-${day}-${year}`;
			} else {
				publicationDate = `unknown`;
			}

			let source_item;
			if(item.source_fqdn_s !== undefined && item.source_fqdn_s !== '' && item.crawler_used_s !== undefined && item.crawler_used_s !== ''){
				let source_name;
				if (item.source_fqdn_s.startsWith("https://")){
					source_name = item.source
				} else {
					source_name = `https://${item.source_fqdn_s}`
				}
				source_item = (<a href= {source_name} target="_blank" rel="noopener noreferrer">{crawlerMappingFunc(item.crawler_used_s)}</a>)
            } else {
				source_item = 'unknown';
			}

			let file_orgin_item;
			if(item.source_page_url_s !== undefined && item.source_page_url_s !== ''){
				file_orgin_item = (<a href= {item.source_page_url_s} target="_blank" rel="noopener noreferrer"> Go to Source </a>)
			} else {
				file_orgin_item = 'unknown';
			}

			let source_file_item;
			if(item.download_url_s !== undefined && item.download_url_s !== ''){
				source_file_item = (<a href= {item.download_url_s} target="_blank" rel="noopener noreferrer"> Open from Source</a>)
			} else {
				source_file_item = 'unknown';
			}

			const favoritableData = [	{Key: 'Published', Value: publicationDate},
										{Key: labelText, Value: dateText},
										{Key: 'Source', Value: (source_item)},
										{Key: 'File Orgin', Value: (file_orgin_item)},
										{Key: 'Source File', Value: (source_file_item)},
										...addFavoriteTopicToMetadata(data, state.userData, setFavoriteTopic, setFavorite, handleFavoriteTopicClicked, state.cloneData)];
			return (
				<div>
					<SimpleTable tableClass={'magellan-table'}
						zoom={1}
						headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
						rows={favoritableData}
						height={'auto'}
						dontScroll={true}
						colWidth={colWidth}
						disableWrap={true}
						title={'Metadata'}
						hideHeader={!!state.listView}
					/>
					<div style={{ marginTop: -18 }}>
						<SimpleTable tableClass={'magellan-table'}
							zoom={1}
							headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
							rows={previewDataReflist}
							height={'auto'}
							dontScroll={true}
							colWidth={{ minWidth: '25%', maxWidth: '25%' }}
							disableWrap={true}
						/>
					</div>
				</div>
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
				item,
				searchText
			} = props;
            return (
				<>
					<>
						<CardButton target={'_blank'} style={{...styles.footerButtonBack, CARD_FONT_SIZE}} href={'#'}
							onClick={(e) => {
								e.preventDefault();
								clickFn(filename, cloneName, searchText, 0, item.download_url_s);
							}}
						>
							Open
						</CardButton>
						{graphView && <CardButton
							style={{...styles.footerButtonBack, CARD_FONT_SIZE}}
							href={'#'}
							onClick={(e) => {
								trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'Close Graph Card');
								e.preventDefault();
								closeGraphCard();
							}}
						>
							Close
						</CardButton>}
						 <CardButton
							style={{...styles.footerButtonBack, CARD_FONT_SIZE}}
							href={'#'}
							onClick={(e) => {
								trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'showDocumentDetails');
								window.open(`#/gamechanger-details?cloneName=${cloneName}&type=document&documentName=${item.id}`);
								e.preventDefault();
							}}
						 >
							 Details
						</CardButton>
						{(toggledMore && Permissions.isGameChangerAdmin()) &&
							 <CardButton
								style={{...styles.footerButtonBack, CARD_FONT_SIZE}}
								href={'#'}
								onClick={(e) => {
									e.preventDefault();
									showEsDoc();
								}}
							 >
								 <i className="fa fa-code"/>
							</CardButton>
						}
					</>
					<div style={{...styles.viewMoreButton}} onClick={() => {
						trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'flipCard', toggledMore ? 'Overview' : 'More');
							setToggledMore(!toggledMore)
						}}
					>
						{toggledMore ? 'Overview' : 'More'}
						<i style={styles.viewMoreChevron} className="fa fa-chevron-right" aria-hidden="true" />
					</div>
				</>
			);
		},
		
		getCardExtras: (props) => {
			
			return getCardExtrasHandler(props);
		},
		
		getFilename: (item) => {
			return item.filename;
		},
	},
	
	publication: {
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
				collection = {}
			} = props;
			
			const doc_type = item.doc_type;
			const doc_num = item.doc_num;
			
			return (
				<div style={styles.collectionContainer}>
					<div>Documents in Collection {doc_type} {doc_num}:</div>
					<ul style={styles.docList}>
						{[...collection].filter(node => node.doc_id).map(node => {
								return <li key={node.filename}>{node.doc_type} {node.doc_num}: {node.filename}</li>
						})}
					</ul>
				</div>
			);
		},
		
		getCardBack: (props) => {
			
			return (
				<></>
			);
		},
		
		getFooter: (props) => {
			const {
				graphView,
				cloneName,
				closeGraphCard
			} = props;
			return (
				<>
					{graphView && <CardButton
						style={{...styles.footerButtonBack, CARD_FONT_SIZE}}
						href={'#'}
						onClick={(e) => {
							trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'Close Graph Card');
							e.preventDefault();
							closeGraphCard();
						}}
					>
						Close
					</CardButton>}
				</>
			);
		},
		
		getCardExtras: (props) => {
			
			return getCardExtrasHandler(props);
		},
		
		getFilename: (item) => {
			return item.filename;
		},
	},
	
	organization: {
		getDisplayTitle: (item) => {
			return item.name;
		},
		getCardHeader: (props) => {
			const {item, state, favoriteComponent} = props;
			const displayTitle = item.name;
			const cardType = 'Organization';
			return (
				<StyledFrontCardHeader listView={state.listView} docListView={state.listView} intelligentSearch={false}>
					<div className={'title-text-selected-favorite-div'}>
						<GCTooltip title={displayTitle} placement='top' arrow>
							<div className={'title-text'}
								 onClick={() => window.open(`#/gamechanger-details?type=entity&entityName=${item.name}&cloneName=${state.cloneData.clone_name}`) }
							>
								<div className={'text'}>
									{displayTitle}
								</div>
								{state.listView &&
									<div className={'list-view-arrow'}>
										<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }}/>
									</div>
								}
							</div>
						</GCTooltip>
						<div className={'selected-favorite'}>
							<div style={{display: "flex"}}>
						{/*		{docListView && isRevoked && <RevokedTag>Canceled</RevokedTag>}*/}
						{/*		{checkboxComponent(item.filename, `${type} ${num}`, idx)}*/}
								{favoriteComponent()}
							</div>
						</div>
					</div>
					{state.listView &&
						<div className={'list-view-sub-header'}>
							<p> {cardType} </p>
						</div>
					}
				</StyledFrontCardHeader>
			);
		},
		
		getCardSubHeader: (props) => {
			const {state, toggledMore} = props;
			const cardType = 'Organization';
			const iconSrc = getTypeIcon(cardType);
			const typeTextColor = getTypeTextColor(cardType);
			let { docTypeColor } = getDocTypeStyles(cardType, 'Uncategorized');
			return (
			<>
				{!state.listView && !toggledMore &&
					<StyledFrontCardSubHeader typeTextColor={typeTextColor} docTypeColor={docTypeColor}>
						<div className={'sub-header-full'}>
							{iconSrc.length > 0 && <img src={iconSrc} alt="type logo"/>}
							{cardType}
						</div>
					</StyledFrontCardSubHeader>
				}
			</>)

		},
		
		getCardFront: (props) => {
			const {
				 item,
				 state,
				 backBody,
				 metadataExpanded,
				 setMetadataExpanded,
			} = props;
			
			if (state.listView) {
				if (item.description?.length > 300) {
					item.description = item?.description?.slice(0, 280) + '...';
				}
			}
			else if (item.image === undefined && item.description?.length > 300) {
				item.description = item?.description?.slice(0, 280) + '...';
			} else if (item.image && item.description?.length > 180) {
				item.description = item?.description?.slice(0, 160) + '...';
			}
			if(state.listView){
				return (
					<StyledListViewFrontCardContent>
						{item.description && <p>{item.description}</p>}
						<button type="button" className={'list-view-button'}
							onClick={() => {
								trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'ListViewInteraction', !metadataExpanded ? 'Expand metadata' : 'Collapse metadata');
								setMetadataExpanded(!metadataExpanded);
							}}
						>
							<span className="buttonText">Document Metadata</span>
							<i className = {metadataExpanded ? "fa fa-chevron-up" : "fa fa-chevron-down"} aria-hidden="true"/>
						</button>
						{metadataExpanded &&
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>
									{backBody}
								</div>
							</div>
						}
					</StyledListViewFrontCardContent>
				);
			}else {
				return (
					<StyledEntityTopicFrontCardContent listView={state.listView}>
						{!state.listView && item.image && <img
							alt="Office Img"
							src={item.image}
						/>}
						<p>{item.description}</p>
					</StyledEntityTopicFrontCardContent>
				);
			}
		},
		
		getCardBack: (props) => {
			const {item, cloneName} = props;

			const tableData = [];
			Object.keys(item).forEach(key => {
				if (item[key] !== '') {
					if (key !== 'image' && key !== 'properties' && key !== 'label' && key !== 'value' && key !== 'type' && 
						key !== 'details' && key !== 'id' && key !== 'favorite' && key !== 'done' && key !== 'entity_type') {
						if (key === 'website') {
							tableData.push({
								Key: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
								Value: (<a href={item[key]}>{item[key]}</a>)
							});
						} else if(key === 'aliases') {
							let finalString = '';
							if(Array.isArray(item[key])){
								item[key].forEach(alias => { finalString = finalString + alias.name + ' '});
							}
							else {
								finalString = item[key];
							}
							tableData.push({
								Key: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
								Value: finalString
							});
						} else if(key === 'parent_agency') {
							tableData.push({
								Key: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
								Value: (<a href='/#/gamechanger-details' onClick={(e) => {
									trackEvent(getTrackingNameForFactory(cloneName), 'GraphCardInteraction', 'Open', `${item.name}DetailsPage`);
										e.preventDefault();
										window.open(`#/gamechanger-details?type=entity&entityName=${item[key]}&cloneName=${cloneName}`);
								}} target={'_blank'} rel="noopener noreferrer">{item[key]}</a>)
							});
						} else {
							tableData.push({
								Key: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
								Value: item[key]
							});
						}
					}
				}
			});
			
			return (
				<SimpleTable tableClass={'magellan-table'}
					zoom={1}
					headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
					rows={tableData}
					height={'auto'}
					dontScroll={true}
					colWidth={colWidth}
					disableWrap={true}
					title={'Organization Info'}
					hideHeader={false}
				/>
			);
		},
		
		getFooter: (props) => {	
			const {
				item,
				cloneName,
				graphView,
				toggledMore,
				setToggledMore,
				closeGraphCard
			} = props;
			
			return (
				<>
					<>
						<CardButton target={'_blank'} style={{...styles.footerButtonBack, CARD_FONT_SIZE}} href={'#'}
							onClick={(e) => {
								trackEvent(getTrackingNameForFactory(cloneName), 'GraphCardInteraction', 'Open', `${item.name}DetailsPage`);
									e.preventDefault();
									window.open(`#/gamechanger-details?type=entity&entityName=${item.name}&cloneName=${cloneName}`);
							}}
						>
							Open
						</CardButton>
						{graphView && <CardButton
							style={{...styles.footerButtonBack, CARD_FONT_SIZE}}
							href={'#'}
							onClick={(e) => {
								trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'Close Graph Card');
								e.preventDefault();
								closeGraphCard();
							}}
						>
							Close
						</CardButton>}
					</>
					<div style={{...styles.viewMoreButton}} onClick={() => {
						trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'flipCard', toggledMore ? 'Overview' : 'More');
							setToggledMore(!toggledMore)
						}}
					>
						{toggledMore ? 'Overview' : 'More'}
						<i style={styles.viewMoreChevron} className="fa fa-chevron-right" aria-hidden="true" />
					</div>
				</>
			);
		},
		
		getCardExtras: (props) => {
		
			return (
				<></>
			);
		},
		
		getFilename: (item) => {
			return '';
		},
	},
	
	topic: {
		getDisplayTitle: (item) => {
			return item.name;
		},
		getCardHeader: (props) => {
			const {item, state} = props;
			const displayTitle = item.name;

			return (
				<StyledFrontCardHeader listView={state.listView} docListView={state.listView} intelligentSearch={false}>
					<div className={'title-text-selected-favorite-div'}>
						<GCTooltip title={displayTitle} placement='top' arrow>
							<div className={'title-text'}
								 onClick={(state.listView) ? () => window.open(`#/gamechanger-details?type=topic&topicName=${item.name}&cloneName=${state.cloneData.clone_name}`) : () => {}}
							>
								<div className={'text'}>
									{displayTitle}
								</div>
								{state.listView &&
									<div className={'list-view-arrow'}>
										<KeyboardArrowRight style={{ color: 'rgb(56, 111, 148)', fontSize: 32 }}/>
									</div>
								}
							</div>
						</GCTooltip>
						{/*<div className={'selected-favorite'}>*/}
						{/*	<div style={{display: "flex"}}>*/}
						{/*		{docListView && isRevoked && <RevokedTag>Canceled</RevokedTag>}*/}
						{/*		{checkboxComponent(item.filename, `${type} ${num}`, idx)}*/}
						{/*		{favoriteComponent()}*/}
						{/*	</div>*/}
						{/*</div>*/}
					</div>
					{state.listView &&
						<div className={'list-view-sub-header'}>
							<p> {displayTitle} </p>
						</div>
					}
				</StyledFrontCardHeader>
			);
		},
		
		getCardSubHeader: (props) => {
			const {state, toggledMore} = props;
			const cardType = 'Topic';
			const iconSrc = getTypeIcon(cardType);
			const typeTextColor = getTypeTextColor(cardType);
			let { docTypeColor } = getDocTypeStyles(cardType, 'Uncategorized');
			return (
			<>
				{!state.listView && !toggledMore &&
					<StyledFrontCardSubHeader typeTextColor={typeTextColor} docTypeColor={docTypeColor}>
						<div className={'sub-header-full'}>
							{iconSrc.length > 0 && <img src={iconSrc} alt="type logo"/>}
							{cardType}
						</div>
					</StyledFrontCardSubHeader>
				}
			</>)

		},
		
		getCardFront: (props) => {
			const {
				 item,
				 state,
				 backBody,
				 metadataExpanded,
				 setMetadataExpanded,
			} = props;

			if(state.listView){
				return (
					<StyledListViewFrontCardContent>
						{item.information && <p>{item.information}</p>}
						<button type="button" className={'list-view-button'}
							onClick={() => {
								trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'ListViewInteraction', !metadataExpanded ? 'Expand metadata' : 'Collapse metadata');
								setMetadataExpanded(!metadataExpanded);
							}}
						>
							<span className="buttonText">Topics Metadata</span>
							<i className = {metadataExpanded ? "fa fa-chevron-up" : "fa fa-chevron-down"} aria-hidden="true"/>
						</button>
						{metadataExpanded &&
							<div className={'metadata'}>
								<div className={'inner-scroll-container'}>
									{backBody}
								</div>
							</div>
						}
					</StyledListViewFrontCardContent>
				);
			}else {
				return (
					<StyledEntityTopicFrontCardContent listView={state.listView}>
						<p>{item.information}</p>
					</StyledEntityTopicFrontCardContent>
				);
			}

		},
		
		getCardBack: (props) => {
			const {item} = props;
			const tableData = [];
			Object.keys(item).forEach(key => {
				if (item[key] !== '') {
					if (key !== 'information' && key !== 'type' && key !== 'crawlers' && key !== 'num_mentions') {
						if (key === 'aliases') {
							let finalString = '';
							if(Array.isArray(item[key])){
								item[key].forEach(alias => { finalString = finalString + alias.name + ' '});
							}
							else {
								finalString = item[key];
							}
							tableData.push({
								Key: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
								Value: finalString
							});
						}	else if (key === 'documentCount') {
							tableData.push({
								Key: 'Document Count',
								Value: (item[key][0].documents)
							});
						} else if(key === 'relatedTopics') {
							let finalString = ''
							item[key].forEach(obj => {
								finalString += obj.topic_name.charAt(0).toUpperCase() + obj.topic_name.slice(1) + ', '
							})
							tableData.push({
								Key: 'Related Topics',
								Value: finalString
							});
						} else {
							tableData.push({
								Key: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
								Value: item[key]
							});
						}
					}
				}
			});
			
			return (
				<SimpleTable tableClass={'magellan-table'}
					zoom={1}
					headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
					rows={tableData}
					height={'auto'}
					dontScroll={true}
					colWidth={colWidth}
					disableWrap={true}
					title={'Topic Info'}
					hideHeader={false}
				/>
			);
		},
		
		getFooter: (props) => {

			const {
				name,
				cloneName,
				graphView,
				closeGraphCard,
				toggledMore,
				setToggledMore,
			} = props;
			
			return (
				<>
					<>
						<CardButton target={'_blank'} style={{...styles.footerButtonBack, CARD_FONT_SIZE}} href={'#'}
							onClick={(e) => {
								trackEvent(getTrackingNameForFactory(cloneName), 'TopicCardOnClick', 'Open', `${name}DetailsPage`);
									e.preventDefault();
									// window.open(`#/gamechanger-details?type=topic&topicName=${name}&cloneName=${cloneName}`);
							}}
						>
							Open
						</CardButton>
						{graphView && <CardButton
							style={{...styles.footerButtonBack, CARD_FONT_SIZE}}
							href={'#'}
							onClick={(e) => {
								trackEvent(getTrackingNameForFactory(cloneName), 'TopicCardOnClick', 'Close');
								e.preventDefault();
								closeGraphCard();
							}}
						>
							Close
						</CardButton>}
						<div style={{...styles.viewMoreButton}} onClick={() => {
						trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'flipCard', toggledMore ? 'Overview' : 'More');
							setToggledMore(!toggledMore)
						}}
					>
						{toggledMore ? 'Overview' : 'More'}
						<i style={styles.viewMoreChevron} className="fa fa-chevron-right" aria-hidden="true" />
					</div>
					</>
				</>
			);
		},
		
		getCardExtras: (props) => {
		
			return (
				<></>
			);
		},
		
		getFilename: (item) => {
			return '';
		},
	}
}

export default PolicyCardHandler;
