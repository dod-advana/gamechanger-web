import React, { Component } from 'react';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { RespExplAnnotationCard } from './RespExplAnnotationCard'
import styled from 'styled-components';
import GameChangerAPI from '../api/gameChanger-service-api';
import GCButton from '../common/GCButton';
import { primaryPurple, primaryAlt, tertiaryGoldDarkest, primaryDark, tertiaryGreen, primaryGreyLight, primaryRedDark } from '../../components/common/gc-colors';
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import withStyles from '@material-ui/core/styles/withStyles';
import {setState} from '../../utils/sharedFunctions';
import {trackEvent} from '../telemetry/Matomo';
import {getTrackingNameForFactory, encode} from '../../utils/gamechangerUtils';

const gameChangerAPI = new GameChangerAPI();

const highlightColors = [primaryPurple, primaryAlt, primaryRedDark, primaryDark, tertiaryGreen, tertiaryGoldDarkest];

const useStyles = (theme) => ({
	dialogXl: {
		maxWidth: '1360px',
		minWidth: '1000px'
	}
});

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

const initState = {
	id: null,
	textsListFull: [' '],
	textsList: [' '],
	currentTextIndex: 0,
	textIndicies: [],
	tagsList: [[]],
	tagDescriptions: {},
	annotatedTokens: [],
	loading: false,
	doc_id: '',
	endOfList: false,
	voluntary: false,
	isModalOpen: false,
	componentStepNumbers: {},
	isTutorial: false,
	isPowerUser: true,
	paragraphs: [],
	paragraphEntities: [],
	paragraphEntityAnswers: [],
	currentParagraphIndex: 0,
	currentEntityIndex: 0,
	colorMap: new Map(), 
	canSubmit: true,
	startPar: 0,
	endPar: 0,
	atStart: false,
	atEnd: false,
	filename: '',
	pageNumber: 0,
	searchText: '',
}

class ResponsibilityAssist extends Component {
	state = {...initState};

	componentDidMount() {
		this.getAnnotationData();
		this.setState({
			isModalOpen: this.props.context.state.showResponsibilityAssistModal,
			voluntary: this.props.context.state.assistVoluntary,
			componentStepNumbers: this.props.context.state.componentStepNumbers,
			isTutorial: this.props.context.state.showTutorial,
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (this.props.context.state.showResponsibilityAssistModal !== prevProps.context.state.showResponsibilityAssistModal) {
			if ( this.props.context.state.showResponsibilityAssistModal) { this.getAnnotationData(); }
			this.setState({
				isModalOpen: this.props.context.state.showResponsibilityAssistModal,
				voluntary: this.props.context.state.assistVoluntary,
				componentStepNumbers: this.props.context.state.componentStepNumbers,
				isTutorial: this.props.context.state.showTutorial
			});
		}
	}
	
	closeModal = () => {
		setState(this.props.context.dispatch, {showResponsibilityAssistModal: false});
	}


	getAnnotationData = async () => {
		this.setState({ loading: true, canMoveForward: true, canSubmit: true });

		const { data } = await gameChangerAPI.getResponsibilityDoc({
			cloneData: this.props.context.state.cloneData,
			filename: this.props.context.state.filename,
			text: this.props.context.state.responsibilityText
		});
		this.setupPowerUserData(data);
	}

	setupPowerUserData = (data) => {
		let startPar = 0;
		let paraLen = data.paragraphs.length;
		let endPar = paraLen;
		let atStart = false;
		let atEnd = false;

		if ( data.par_num !== 0) {
			startPar = data.par_num - 1;
		}else{
			atStart = true;
		}
		

		if ( data.par_num !== paraLen - 1 ) {
			endPar = data.par_num + 1;
		}else{
			atEnd = true;
		}

		const texts = data.paragraphs.map(paragraph => {
			return paragraph.par_raw_text_t;
		});
		
		const id = this.props.context.state.id;
		const filename = data.paragraphs[data.par_num]?.filename;
		const pageNumber = data.paragraphs[data.par_num]?.page_num_i + 1;
		const searchText = `"${this.props.context.state.responsibilityText}"`;

		const tagsList = [ 'Entity',/* "Verb", */'Responsibility'];
		const tagmap = {'Entity': highlightColors[3],
			// "Verb": highlightColors[1],
			'Responsibility': highlightColors[4]};

		this.setState({
			id: id,
			startPar: startPar,
			endPar: endPar,
			textsListsFull: texts,
			textsList: texts,
			tagsList: tagsList,
			colorMap: tagmap,
			loading: false,
			doc_id: data.doc_id,
			doc_num: data.doc_num,
			doc_type: data.doc_type,
			type: data.type,
			atStart: atStart,
			atEnd: atEnd,
			filename: filename,
			pageNumber: pageNumber,
			searchText: searchText
		});
	}

	resetAnnotationState = () => {
		this.setState({
			id: null,
			textsListFull: [' '],
			textsList: [' '],
			currentTextIndex: 0,
			textIndicies: [],
			tagsList: [[]],
			tagDescriptions: {},
			annotatedTokens: [],
			loading: false,
			progressText: '0/0',
			progressValue: 0,
			doc_id: '',
			endOfList: false,
			voluntary: false,
			isModalOpen: false,
			componentStepNumbers: {},
			isTutorial: false,
			isPowerUser: true,
			paragraphs: [],
			paragraphEntities: [],
			paragraphEntityAnswers: [],
			currentParagraphIndex: 0,
			currentEntityIndex: 0,
			colorMap: new Map(), 
			canMoveForward: true,
			canSubmit: true,
			startPar: 0,
			endPar: 0,
			atStart: false,
			atEnd: false,
			filename: '',
			pageNumber: 0,
			searchText: '',
		});
	}

	handlePreviousNext = (change) => {
		let { textsList, startPar, endPar, atStart, atEnd } = this.state;
		let paraLen = textsList.length;

		if ( change > 0 ) { // next, viewing 1 more after
			if ( endPar !== paraLen - 1) {
				endPar = endPar + change;
			}else{
				atEnd = true;
			}
		} else if ( change < 0 ) {//previous, viewing 1 more before
			if ( startPar !== 0) {
				startPar = startPar + change;
			}else{
				atStart = true;
			}
		}

		this.setState({ startPar, endPar, atStart, atEnd }, () => {
			if(change < 0){
				const addedWordAmount = this.state.textsList.slice(startPar, endPar + 1)[0].split(' ').length - 1;
				const newTokens = this.state.annotatedTokens.map(token => {
					token.end += addedWordAmount;
					token.start += addedWordAmount;
					return token;
				})
				this.setCurrentTokens(newTokens);
			}
		});
	}

	setCurrentTokens = (newTokens) => {
		this.setState({ annotatedTokens: newTokens});
	}

	handlePowerSave = () => {
		
		/*
		if (isTutorial) return;

		const userId = Auth.getUserId();

		const dataToSave = {
			docId: doc_id,
			tagsAnnotated: 0,
			annotationData: []
		};

		annotatedTokens.forEach((textAnnotatedTokens, index) => {
			textAnnotatedTokens.forEach(annotatedToken => {
				dataToSave.annotationData.push({
					docId: doc_id,
					docType: doc_type,
					docNum: doc_num,
					userId: userId,
					tag: annotatedToken.tag,
					tokens: annotatedToken.tokens.join(' '),
					text: textsList[index],
					startIndex: annotatedToken.start,
					endIndex: annotatedToken.end,
					voluntary: voluntary
				});
			});
		});

		dataToSave.tagsAnnotated = dataToSave.annotationData.length;

		// Save
		gameChangerAPI.saveDocumentAnnotations(dataToSave);
*/
		// Reset
		this.resetAnnotationState();

		// Store local data
		// localStorage.setItem('gcAssistCompleteDate', (new Date()).toDateString());

		// CLose
		this.closeModal();
	}

	handleClose = () => {
		this.resetAnnotationState();
		this.closeModal();
	}

	handleSubmit = () => {
		const {id,  annotatedTokens } = this.state; // get the things for the query
		
		let annotatedEntity = '';
		let annotatedResponsibilityText = '';

		annotatedTokens.forEach(annotation => {
			if( annotation['tag'] === 'Entity'){
				annotation['tokens'].forEach(t => {
					annotatedEntity = annotatedEntity.concat(t, ' ');
				})
				
			}else if( annotation['tag'] === 'Responsibility'){
				annotation['tokens'].forEach(t => {
					annotatedResponsibilityText = annotatedResponsibilityText.concat(t, ' ');
				})
			}
		});
		const updatedProps = {
			organizationPersonnel: annotatedEntity,
			responsibilityText: annotatedResponsibilityText,
		}
		gameChangerAPI.updateResponsibility({id: id, updatedProps}).then(() => {
			setState(this.props.context.dispatch, {reloadResponsibilityTable: true});
			this.handleClose(true);
		});
	}
	
	handleReject = () => {
		const { id } = this.state;
		gameChangerAPI.setRejectionStatus({id: id}).then(() => {
			setState(this.props.context.dispatch, {reloadResponsibilityTable: true});
			this.handleClose(true);
		});
	}

	handleOpen = () => {
		const { filename, pageNumber, searchText} = this.state;
		const cloneName = this.props.context.state.cloneData.clone_name;
		trackEvent(getTrackingNameForFactory(cloneName), 'ResponsibilityTracker' , 'PDFOpen');
		trackEvent(getTrackingNameForFactory(cloneName), 'ResponsibilityTracker', 'filename', filename);
		trackEvent(getTrackingNameForFactory(cloneName), 'ResponsibilityTracker', 'pageNumber', pageNumber);
		let searchTextArray;
		let tempSearchText;
		if(searchText){
			searchTextArray = searchText.split(' ');
			if(searchTextArray[0].match(/(\(\w{1,2}\)|\w{1,2}\.)/)) searchTextArray[0] += ' ';
			tempSearchText = searchTextArray.join(' ');
		}
		window.open(`/#/pdfviewer/gamechanger?filename=${encode(filename)}${searchText ? `&prevSearchText=${tempSearchText}` : ''}&pageNumber=${pageNumber}&cloneIndex=${cloneName}`);
	}

	renderAnnotationCard = () => {

		const {
			startPar,
			endPar,
			textsList,
			tagsList,
			annotatedTokens,
			componentStepNumbers,
			colorMap,
			atStart,
			atEnd
		} = this.state

		let displayText = '\n\n';
		textsList.slice(startPar, endPar + 1).forEach(p => {
			displayText = displayText.concat(p, '\n\n')
		});

		return (
			<>
				<RespExplAnnotationCard
					// uses template string for text to read newlines correctly
					text={displayText}
					currentTokens={annotatedTokens}
					setCurrentTokens={this.setCurrentTokens}
					tags={tagsList}
					componentStepNumbers={componentStepNumbers}
					colorMap={colorMap}
					moreTextClick={this.handlePreviousNext}
					aboveDisabled={atStart}
					belowDisabled={atEnd}
					
				/>
			</>
		)
	}

	render() {
		const {
			loading,
			componentStepNumbers,
		} = this.state

		const classes = this.props.classes;

		return (
			<Dialog
				open={this.state.isModalOpen}
				scroll={'paper'}
				maxWidth="xl"
				disableEscapeKeyDown
				disableBackdropClick
				classes={{
					paperWidthXl: classes.dialogXl
				}}
			>
				<DialogTitle >
					<div style={{display: 'flex', width: '100%'}}>
						<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>Responsibility Labeler: </Typography>
					</div>
					<CloseButton onClick={() => this.handleClose(true)}>
						<CloseIcon fontSize="large" />
					</CloseButton>
				</DialogTitle>

				<DialogContent>
					{loading ? (
						<div>
							<LoadingIndicator />
						</div>
					) : (
						<div>
							{this.renderAnnotationCard()}
						</div>
					)}
				</DialogContent>

				<DialogActions>
					<div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', margin: '0px 18px' }}>
						<div style={{ justifyContent: 'flex-end' }}>
							<GCButton
								id={'gcOpenDoc'}
								className={`tutorial-step-${componentStepNumbers['Previous Button']}`}
								onClick={() => { this.handleOpen() }}
								textStyle={{color: 'grey'}}
								buttonColor={'white'}
								borderColor={primaryGreyLight}
							>
								Open PDF
							</GCButton>
							<GCButton
								id={'gcReject'}
								className={`tutorial-step-${componentStepNumbers['Previous Button']}`}
								onClick={() => { this.handleReject() }}
								textStyle={{color: 'grey'}}
								buttonColor={'white'}
								borderColor={primaryGreyLight}
							>
								No Responsibility
							</GCButton>
							
							<GCButton
								id={'gcSubmit'}
								className={`tutorial-step-${componentStepNumbers['Previous Button']}`}
								onClick={() => { this.handleSubmit() }}
								borderColor={primaryGreyLight}
							>
								Submit
							</GCButton>
						</div>
					</div>
				</DialogActions>
			</Dialog>
		)
	}
}

export default withStyles(useStyles)(ResponsibilityAssist)
