import React, { Component } from "react";
import LoadingIndicator from 'advana-platform-ui/dist/loading/LoadingIndicator.js';
import { PowerUserAnnotationCard } from './PowerUserAnnotationCard'
import GeneralUserAnnotationCard from '../cards/GeneralUserAnnotationCard'
import { random } from "underscore"
import styled from 'styled-components';
import GameChangerAPI from "../api/gameChanger-service-api";
import Auth from 'advana-platform-ui/dist/utilities/Auth';
import GCButton from '../common/GCButton';
import { primaryPurple, primaryAlt, tertiaryGoldDarkest, primaryDark, tertiaryGreen, primaryGreyLight, backgroundGreyDark, primaryRedDark } from '../../components/common/gc-colors';
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import withStyles from "@material-ui/core/styles/withStyles";
import LinearProgressWithLabel  from '@material-ui/core/LinearProgress';
import {setState} from "../../sharedFunctions";

const gameChangerAPI = new GameChangerAPI()

const highlightColors = [primaryPurple, primaryAlt, primaryRedDark, primaryDark, tertiaryGreen, tertiaryGoldDarkest];

const useStyles = (theme) => ({
	dialogXl: {
		maxWidth: '1360px',
		minWidth: '1000px'
	}
});

const BorderLinearProgress = withStyles((theme) => ({
	root: {
	  height: 15,
	  borderRadius: 10,
	},
	colorPrimary: {
	  backgroundColor: backgroundGreyDark,
	},
	bar: {
	  borderRadius: 10,
	  backgroundColor: '#1C224E',
	},
  }))(LinearProgressWithLabel);

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
	textsListFull: [' '],
	textsList: [' '],
	currentTextIndex: 0,
	textIndicies: [],
	textIndiciesFull: [],
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
	endPar: 0
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

	countWords(str) {
		let tmpStr = str.replace(/(^\s*)|(\s*$)/gi,"");
		tmpStr = tmpStr.replace(/[.]/gi, "");
		tmpStr = tmpStr.replace(/[ ]{2,}/gi," ");
		tmpStr = tmpStr.replace(/\n /,"\n");
		const count = tmpStr.split(' ').length;

		return count
	}

	countEntities(entities) {

		let count = 0;

		Object.keys(entities).forEach(key => {
			if (entities[key].length > 0) count += 1;
		});

		return count;
	}

	getAnnotationData = async () => {
		this.setState({ loading: true, canMoveForward: true, canSubmit: true });
		const { isPowerUser } = this.state;

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
		if ( data.par_num !== 0) {
			startPar = data.par_num - 1;
		}

		if ( data.par_num !== paraLen ) {
			endPar = data.par_num + 1;
		}

		const texts = data.paragraphs.map(paragraph => {
			return paragraph.par_raw_text_t;
		});
		
		const textIndiciesWithRealParagraphs = [];
		texts.forEach((text, index) => {
			textIndiciesWithRealParagraphs.push(index);
		});

		const tagsList = [ "Entity", "Verb", "Responsibility"];
		const tagmap = {"Entity": highlightColors[0],
						"Verb": highlightColors[1],
						"Responsibility": highlightColors[2]};

		this.setState({
			startPar: startPar,
			endPar: endPar,
			textsListsFull: texts,
			textIndiciesFull: textIndiciesWithRealParagraphs,
			textsList: texts,
			tagsList: tagsList,
			colorMap: tagmap,
			loading: false,
			progressText: `${(this.state.currentTextIndex + 1)} / ${textIndiciesWithRealParagraphs.length} available in this document`,
			progressValue: ((this.state.currentTextIndex + 1) / textIndiciesWithRealParagraphs.length) * 100,
			doc_id: data.doc_id,
			doc_num: data.doc_num,
			doc_type: data.doc_type,
			type: data.type
		});
	}

	resetAnnotationState = () => {
		this.setState({
			textsListFull: [' '],
			textsList: [' '],
			currentTextIndex: 0,
			textIndicies: [],
			textIndiciesFull: [],
			tagsList: [[]],
			annotatedTokens: [[]],
			loading: false,
			progressText: '0/0',
			progressValue: 0,
			doc_id: '',
			endOfList: false,
			paragraphs: [],
			paragraphEntities: [],
			currentParagraphIndex: 0,
			currentEntityIndex: 0,
			colorMap: new Map(),
			startPar: 0,
			endPar: 0
		});
	}

	handlePreviousNext = (change) => {
		let { textsList, startPar, endPar } = this.state;
		let paraLen = textsList.length;

		if ( change > 0 ) { // next, viewing 1 more after
			if ( endPar !== paraLen - 1) {
				endPar = endPar + change;
			}
		} else if ( change < 0 ) {//previous, viewing 1 more before
			if ( startPar !== 0) {
				startPar = startPar + change;
			}
		}

		this.setState({ startPar, endPar });
	}

	setCurrentTokens = (newTokens) => {
		this.setState({ annotatedTokens: newTokens});
	}

	handlePowerSave = () => {
		/*
		const { doc_id, doc_num, doc_type, voluntary, annotatedTokens, textsList, isTutorial } = this.state;

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

	handleSave = (closing = false) => {
		const { canMoveForward, canSubmit, isPowerUser } = this.state;

		if (!canMoveForward && !canSubmit && !closing) return;
		
		this.handlePowerSave();		
	}

	renderAnnotationCard = () => {

		const {
			startPar,
			endPar,
			textsList,
			currentTextIndex,
			tagsList,
			tagDescriptions,
			annotatedTokens,
			componentStepNumbers,
			isTutorial,
			progressText,
			progressValue,
			isPowerUser,
			paragraphs,
			paragraphEntities,
			paragraphEntityAnswers,
			currentEntityIndex,
			currentParagraphIndex,
			colorMap,
			doc_id
		} = this.state

		let displayText = '\n\n';
		textsList.slice(startPar, endPar + 1).forEach(p => {
			displayText = displayText.concat(p, '\n\n')
		});

		return (
			<>
				{isPowerUser && 
					<PowerUserAnnotationCard
						// uses template string for text to read newlines correctly
						text={displayText}
						currentTokens={annotatedTokens}
						setCurrentTokens={this.setCurrentTokens}
						tags={tagsList}
						componentStepNumbers={componentStepNumbers}
						isTutorial={isTutorial}
						colorMap={colorMap}
					/>
				}
			</>
		)
	}

	render() {
		const {
			loading,
			currentParagraphIndex,
			componentStepNumbers,
			currentEntityIndex,
			paragraphEntityAnswers,
			progressText,
			progressValue,
			canMoveForward
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
						<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>Your Assists this Week: <b style={{color: 'red', fontSize: 14}}>(Beta)</b></Typography>
					</div>
					<CloseButton onClick={() => this.handleSave(true)}>
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
					<div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', margin: '0px 18px' }}>
						<div style={{ display: 'flex', marginTop: '5px' }}>
							<div style={{ marginTop: '5px', width: 800, marginRight: '5px' }}>
								<BorderLinearProgress variant="determinate" value={progressValue} className={`tutorial-step-${componentStepNumbers["Paragraph Progress"]}`} />
							</div>
							<p style={{ width: '100%' }}>{progressText}</p>
						</div>
						
						<div>
							<GCButton
								id={'gcAssistPrevious'}
								className={`tutorial-step-${componentStepNumbers["Previous Button"]}`}
								onClick={() => { this.handlePreviousNext(-1) }}
								textStyle={{color: 'grey'}}
								buttonColor={'white'}
								borderColor={primaryGreyLight}
								disabled={false}
							>
								Previous
							</GCButton>
							<GCButton
								id={'gcAssistNext'}
								className={`tutorial-step-${componentStepNumbers["Next Button"]}`}
								onClick={() => { (currentEntityIndex + 1 ===  paragraphEntityAnswers[currentParagraphIndex]?.length) ? this.handleSave() : this.handlePreviousNext(1) }}
								disabled={!canMoveForward}
								textStyle={{color: !canMoveForward ? 'grey' : 'white'}}
							>
								{ (currentEntityIndex + 1 ===  paragraphEntityAnswers[currentParagraphIndex]?.length) ? 'Submit' : 'Next' }
							</GCButton>
						</div>
					</div>
                </DialogActions>
            </Dialog>
		)
	}
}

export default withStyles(useStyles)(ResponsibilityAssist)
