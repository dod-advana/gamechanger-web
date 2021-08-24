// Package Imports 
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from "@material-ui/core/Button";
import CloseIcon from '@material-ui/icons/Close';
import Link from "@material-ui/core/Link";
import Popover from "@material-ui/core/Popover";

// Local Imports
import GCTooltip from "../common/GCToolTip"
import GCButton from "../common/GCButton";
import { trackEvent } from "../telemetry/Matomo";
import {encode, getTrackingNameForFactory} from "../../gamechangerUtils";
import {SelectedDocsDrawer} from "../searchBar/GCSelectedDocsDrawer";
import { checkUserInfo, setState } from '../../sharedFunctions';
import FavoriteCard from "../cards/GCFavoriteCard";




const StyledFavoriteGroupCard = styled.div`
    width: 420px;
	height: 535px;
    background-color: #FFFFFF
    border: 1px solid #CFCFCF;
    border-radius: 6px;
	margin: 10px;
	position: relative;
    padding: 15px;

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
				font-family: "Noto Sans";
				font-size: 18px;
				overflow: hidden;
				width: 326px;
				height: 38px;
				text-overflow: ellipsis;
				cursor: pointer;
				line-height: 1;
				
				> .summary-title-link {
					text-decoration: none;
    				color: #000000;
					font-family: "Noto Sans";
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
		
		> .buttons-div {
			height: 30px;
			margin-left: 10px;
			margin-top: -24px;
			margin-bottom: 5px;
			
			> button {
				padding: 0 10px !important;
				height: 20px  !important;
				min-width: 60px  !important; 
				margin: 0 5px  !important; 
				border-radius: 17px  !important;
				line-height: unset  !important; 
				
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
				color: #8091A5;
			}
    		
    		> .stats-details-stat-div {
    			display: flex;
    			
    			> .stats-comment {
					margin-left: -12px;
					margin-right: 15px;
	
					> .fa {
						color: #8091A5;
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
						color: #8091A5;
						font-family: "Noto Sans";
						font-size: 14px;
						font-weight: 500;
						margin-right: 5px;
					}
	
					> .fa {
						color: #8091A5;
						height: 20px;
						width: 20px;
						margin-bottom: -8px;
						padding-left: 2px;
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

const styles = {
    exportButton : {
        position: 'absolute',
        right: 15,
        top: 15,
        margin: '-16px 0px 0px -10px'
    },
    groupName: {
        color: '#000000',
        fontFamily: "Noto Sans",
        fontSize: 18,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: 1,
        maxHeight: 60,
		height: 60,
		display: 'flex'
    },
    details: {
        marginTop: -5,
        display: 'flex',
        placeContent: 'space-between'
    },
    itemCount: {
        marginBottom: 8,
        marginLeft: 15,
        textAlign: 'start',
        fontSize: 12,
        fontFamily: 'Montserrat',
        color: '#3F4A56'
    }
}

const GroupCard = (props) => {
	
	const {
        group,
		idx,
        state,
        dispatch,
		favorites
	} = props;

    const removeSelectedDocument = (key) => {
		const { selectedDocuments } = state;

		if (selectedDocuments.has(key)) {
			selectedDocuments.delete(key);
		}

		setState(dispatch, { selectedDocuments: new Map(selectedDocuments) });
	}

	return (
		<StyledFavoriteGroupCard key={idx}>
            <div style={styles.exportButton}>
                <SelectedDocsDrawer
                    selectedDocuments={state.selectedDocuments}
                    docsDrawerOpen={state.docsDrawerOpen}
                    setDrawer={(open) => setState(dispatch, {docsDrawerOpen: open})}
                    clearSelections={() => setState(dispatch, {selectedDocuments: new Map()})}
                    openExport={() => setState(dispatch, {exportDialogVisible: true})}
                    removeSelection={(doc) => removeSelectedDocument(doc)}
                    componentStepNumbers={state.componentStepNumbers}
                    isDrawerReady={state.isDrawerReady}
                    setDrawerReady={(ready) => setState(dispatch, {isDrawerReady: ready})}
                    setShowTutorial={(showTutorial) => setState(dispatch, {showTutorial: showTutorial})}
                    setStepIndex={(stepIndex) => setState(dispatch, {stepIndex: stepIndex})}
                    showTutorial={state.showTutorial}
                    rawSearchResults={[{}]}
                    checkUserInfo={() => {checkUserInfo(state, dispatch)}}
                />
            </div>
            <div style={styles.groupName}>
                {group.group_name}
            </div>
			<div style={{position: 'relative'}}>
				{favorites.map((fav, index) => {
					const doc = state.userData.favorite_documents.find(fav_doc => {
						console.log("fav.favorite_document_id: ", fav.favorite_document_id)
						console.log("fav_doc.favorite_id: ", fav_doc.favorite_id)
						return fav.favorite_document_id === `${fav_doc.favorite_id}`;
					})
					const favCardStyles = {
						main: `margin: 0px;
						background: #F5F5F5 0% 0% no-repeat padding-box; 
						box-shadow: 0px -3px 6px #00000029; 
						position: absolute; 
						top: ${index * 60}px; 
						left: 0px;`
					}
					return <FavoriteCard
					key={`${doc.favorite_id}`}
					cardTitle={doc.title}
					isDocument={true}
					documentObject={doc}
					handleDeleteFavorite={()=>{}}
					// summary={doc.summary}
					summary={group.group_name}
					// details={documentDetails}
					overlayText={doc.favorite_summary}
					reload={true}
					setReload={()=>{}}
					idx={doc.favorite_id}
					active={doc.active}
					toggleActive={()=>{}}
					cloneData={state.cloneData}
					styles={favCardStyles}
				/>
				})}
			</div>
            <div style={styles.details}>
                <div>
                    {`${favorites.length} items`}
                </div>
            </div>
		</StyledFavoriteGroupCard>
	)
}

GroupCard.propTypes = {
	
}

export default GroupCard;
