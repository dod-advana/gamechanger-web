// Package Imports 
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// Local Imports
import { trackEvent } from "../telemetry/Matomo";
import {encode, getTrackingNameForFactory} from "../../gamechangerUtils";
import {SelectedDocsDrawer} from "../searchBar/GCSelectedDocsDrawer";
import { checkUserInfo, setState, handleRemoveFavoriteFromGroup } from '../../sharedFunctions';
import GroupFavoriteCard from "../cards/GCGroupFavoriteCard";


const StyledFavoriteGroupCard = styled.div`
    width: 420px;
	height: 600px;
    background-color: #FFFFFF
    border: 1px solid #CFCFCF;
    border-radius: 6px;
	margin: 10px;
	position: relative;
    padding: 15px;
`;

const styles = {
    exportButton : {
        position: 'absolute',
        right: 15,
        top: 15,
        margin: '-16px 0px 0px -10px'
    },
    titleSection: {
        color: '#000000',
        fontFamily: "Noto Sans",
        lineHeight: 1.5,
        maxHeight: 60,
		height: 60,
		display: 'flex',
		flexDirection: 'column',
		textAlign: 'left'
    },
	groupName: {
		overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: 18,
	},
	groupDescription: {
		overflow: 'hidden',
        textOverflow: 'ellipsis',
		fontSize: 14
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
    },
	groupDetails: {
		position: 'absolute',
		bottom: 0
	}
}

const clickFn = (filename, cloneName, searchText, pageNumber = 0, sourceUrl) => {
	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction' , 'PDFOpen');
	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'filename', filename);
	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'pageNumber', pageNumber);
	window.open(`/#/pdfviewer/gamechanger?filename=${encode(filename)}${searchText ? `&prevSearchText=${searchText.replace(/"/gi, '')}` : ''}&pageNumber=${pageNumber}&cloneIndex=${cloneName}${sourceUrl ? `&sourceUrl=${sourceUrl}` : ''}`);
};

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
            <div style={styles.titleSection}>
				<div style={styles.groupName}>
					{group.group_name}
				</div>
                <div style={styles.groupDescription}>
					{group.group_description}
				</div>
            </div>
			<div style={{position: 'relative'}}>
				{favorites.map((favId, index) => {
					const doc = state.userData.favorite_documents.find(doc => {
						return favId === `${doc.favorite_id}`;
					})
					const favCardStyles = {
						main: `top: ${index * 60}px; 
						transition: top .5s, height .5s;
						&:hover {
							background-color: #ECF1F7;
							top: ${index * 60 - 20}px;
							cursor: pointer;
							tansition: top 1s;
						}`
					}
					if(doc){
						return <GroupFavoriteCard
							key={`${doc.favorite_id}`}
							cardTitle={doc.title}
							documentObject={doc}
							summary={doc.summary}
							overlayText={doc.favorite_summary}
							idx={doc.favorite_id}
							cloneData={state.cloneData}
							styles={favCardStyles}
							handleRemoveFavoriteFromGroup={handleRemoveFavoriteFromGroup}
							dispatch={dispatch}
							group={group}
						/>
					} else {return <></>}
					
				})}
			</div>
            <div style={styles.details}>
                <div style={styles.groupDetails}>
                    {`${favorites.length} items`}
                </div>
            </div>
		</StyledFavoriteGroupCard>
	)
}

GroupCard.propTypes = {
	
}

export default GroupCard;
