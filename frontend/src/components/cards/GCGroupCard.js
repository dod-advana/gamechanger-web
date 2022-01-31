// Package Imports 
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// Local Imports
import {SelectedDocsDrawer} from '../searchBar/GCSelectedDocsDrawer';
import { checkUserInfo, setState, handleRemoveFavoriteFromGroup } from '../../utils/sharedFunctions';
import GroupFavoriteCard from '../cards/GCGroupFavoriteCard';


const StyledFavoriteGroupCard = styled.div`
    width: 420px !important;
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
		fontFamily: 'Montserrat',
		lineHeight: 1.5,
		maxHeight: 60,
		height: 60,
		display: 'flex',
		flexDirection: 'column',
		textAlign: 'left'
	},
	groupName: {
		textOverflow: 'ellipsis',
		fontSize: 18,
		marginRight: 60,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		maxHeight: 30
	},
	groupDescription: {
		textOverflow: 'ellipsis',
		fontSize: 14,
		marginRight: 60,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		maxHeight: 40
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
	},
	placeHolder: {
		fontFamily: 'Montserrat',
		fontSize: 20,
		fontWeight: 300,
		textAlign: 'center',
		marginTop: 50
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

	const favFilenames = new Map();
	const searchTextlist = [];
	favorites.forEach((favId) => {
		const doc = state.userData.favorite_documents.find(doc => {
			return favId === doc.favorite_id;
		})
		if(doc){
			favFilenames.set(doc.filename,doc.filename);
			if(!searchTextlist.includes(doc.search_text)) searchTextlist.push(doc.search_text)
		}else{
			handleRemoveFavoriteFromGroup(group.id, favId, dispatch);
		}
	})
	const combinedSearchText = searchTextlist.join(' OR ');

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
					openExport={() => {
						setState(dispatch, {selectedDocuments: favFilenames, exportDialogVisible: true, prevSearchText: combinedSearchText});
					}}
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
			{favorites.length > 0 ? 
				<div style={{position: 'relative'}}>
					{favorites.map((favId, index) => {
						const doc = state.userData.favorite_documents.find(doc => {
							return favId === doc.favorite_id;
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
				:
				<div style={styles.placeHolder}>Go to the favorites tab to add up to five {group.group_type}s to the group.</div>
			}
			<div style={styles.details}>
				<div style={styles.groupDetails}>
					{`${favorites.length} items`}
				</div>
			</div>
		</StyledFavoriteGroupCard>
	)
}

GroupCard.propTypes = {
	group: PropTypes.object,
	idx: PropTypes.number,
	state: PropTypes.object,
	dispatch: PropTypes.func,
	favorites: PropTypes.arrayOf(PropTypes.number),
} 

export default GroupCard;
