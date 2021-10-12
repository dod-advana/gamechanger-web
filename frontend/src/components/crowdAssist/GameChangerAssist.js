import React, { Component } from 'react';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator.js';
import { PowerUserAnnotationCard } from './PowerUserAnnotationCard';
import GeneralUserAnnotationCard from './GeneralUserAnnotationCard';
import { random } from 'underscore';
import styled from 'styled-components';
import GameChangerAPI from '../api/gameChanger-service-api';
import Auth from '@dod-advana/advana-platform-ui/dist/utilities/Auth';
import GCButton from '../common/GCButton';
import {
	primaryPurple,
	primaryAlt,
	tertiaryGoldDarkest,
	primaryDark,
	tertiaryGreen,
	backgroundGreyDark,
	primaryRedDark,
} from '../../components/common/gc-colors';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import withStyles from '@material-ui/core/styles/withStyles';
import LinearProgressWithLabel from '@material-ui/core/LinearProgress';
import { setState } from '../../utils/sharedFunctions';

const gameChangerAPI = new GameChangerAPI();

const highlightColors = [
	primaryPurple,
	primaryAlt,
	primaryRedDark,
	primaryDark,
	tertiaryGreen,
	tertiaryGoldDarkest,
];

const useStyles = (theme) => ({
	dialogXl: {
		maxWidth: '1360px',
		minWidth: '1000px',
	},
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

const initState = {
	textsListFull: [' '],
	textsList: [' '],
	currentTextIndex: 0,
	textIndicies: [],
	textIndiciesFull: [],
	tagsList: [[]],
	tagDescriptions: {},
	annotatedTokens: [[]],
	loading: false,
	progressText: '0/0',
	progressValue: 0,
	doc_id: '',
	endOfList: false,
	voluntary: false,
	isModalOpen: false,
	componentStepNumbers: {},
	isTutorial: false,
	isPowerUser: false,
	paragraphs: [],
	paragraphEntities: [],
	paragraphEntityAnswers: [],
	currentParagraphIndex: 0,
	currentEntityIndex: 0,
	colorMap: new Map(),
	canMoveForward: false,
	canSubmit: false,
};

class GameChangerAssist extends Component {
	state = { ...initState };

	componentDidMount() {
		this.getAnnotationData();
		this.setState({
			isModalOpen: this.props.context.state.showAssistModal,
			voluntary: this.props.context.state.assistVoluntary,
			componentStepNumbers: this.props.context.state.componentStepNumbers,
			isTutorial: this.props.context.state.showTutorial,
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (
			this.props.context.state.showAssistModal !==
			prevProps.context.state.showAssistModal
		) {
			if (this.props.context.state.showAssistModal) {
				this.getAnnotationData();
			}
			this.setState({
				isModalOpen: this.props.context.state.showAssistModal,
				voluntary: this.props.context.state.assistVoluntary,
				componentStepNumbers: this.props.context.state.componentStepNumbers,
				isTutorial: this.props.context.state.showTutorial,
			});
		}
	}

	closeModal = () => {
		setState(this.props.context.dispatch, { showAssistModal: false });
	};

	countWords(str) {
		let tmpStr = str.replace(/(^\s*)|(\s*$)/gi, '');
		tmpStr = tmpStr.replace(/[.]/gi, '');
		tmpStr = tmpStr.replace(/[ ]{2,}/gi, ' ');
		tmpStr = tmpStr.replace(/\n /, '\n');
		const count = tmpStr.split(' ').length;

		return count;
	}

	countEntities(entities) {
		let count = 0;

		Object.keys(entities).forEach((key) => {
			if (entities[key].length > 0) count += 1;
		});

		return count;
	}

	getAnnotationData = async () => {
		this.setState({ loading: true, canMoveForward: false, canSubmit: false });
		const { isPowerUser } = this.state;

		let goodResponse = null;
		const maxTries = 5;
		let tryCount = 0;

		while (tryCount < maxTries && !goodResponse) {
			let resp = await gameChangerAPI.getDocumentsToAnnotate({
				cloneData: this.props.context.state.cloneData,
			});
			if (
				resp &&
				resp.data &&
				resp.data.paragraphs &&
				resp.data.paragraphs.length > 0
			) {
				goodResponse = resp;
			}
			tryCount++;
		}

		if (tryCount >= maxTries) {
			console.error('Error retrieving data!');
		} else {
			this.resetAnnotationState();

			if (isPowerUser) {
				this.setupPowerUserData(goodResponse.data);
			} else {
				this.setupGeneralUserData(goodResponse.data);
			}
		}
	};

	setupPowerUserData = (data) => {
		const textIndicies = [];

		const texts = data.paragraphs.map((paragraph) => {
			return paragraph.par_raw_text_t;
		});

		const textIndiciesWithRealParagraphs = [];
		texts.forEach((text, index) => {
			if (this.countWords(text) > 30) {
				textIndiciesWithRealParagraphs.push(index);
			}
		});

		textIndicies.push(
			textIndiciesWithRealParagraphs[
				random(0, textIndiciesWithRealParagraphs.length - 1)
			]
		);
		const textsList = textIndicies.map((i) => texts[i]);

		const tagmap = data.tagsList.reduce((acc, tag, i) => {
			acc.set(tag, highlightColors[i]);
			return acc;
		}, new Map());

		this.setState({
			textsListsFull: texts,
			textIndiciesFull: textIndiciesWithRealParagraphs,
			textsList: textsList,
			textIndicies: textIndicies,
			tagsList: data.tagsList,
			colorMap: tagmap,
			loading: false,
			progressText: `${this.state.currentTextIndex + 1} / ${
				textIndiciesWithRealParagraphs.length
			} available in this document`,
			progressValue:
				((this.state.currentTextIndex + 1) /
					textIndiciesWithRealParagraphs.length) *
				100,
			doc_id: data.doc_id,
			doc_num: data.doc_num,
			doc_type: data.doc_type,
			type: data.type,
		});
	};

	setupGeneralUserData = (data) => {
		const paragraphsWithEntities = data.paragraphs.filter((paragraph) => {
			return paragraph.entities
				? this.countEntities(paragraph.entities) > 0
				: false;
		});

		if (paragraphsWithEntities.length <= 0) {
			this.getAnnotationData();
			return;
		}

		const paragraphEntities = [];
		const paragraphEntityAnswers = [];

		const tagmap = data.tagsList.reduce((acc, tag, i) => {
			acc.set(tag, highlightColors[i]);
			return acc;
		}, new Map());

		paragraphsWithEntities.forEach((paragraph) => {
			const tmpEntities = [];
			const tmpEntityAnswers = [];
			Object.keys(paragraph.entities).forEach((key) => {
				if (paragraph.entities[key].length > 0) {
					paragraph.entities[key].forEach((entity) => {
						const textTokens = paragraph.par_raw_text_t.split(' ');
						const startIndex = paragraph.par_raw_text_t.indexOf(entity);

						let start = 0;

						if (startIndex > 0) {
							let totalChars = 0;
							textTokens.forEach((token, i) => {
								if (token.length + 1 + totalChars === startIndex) start = i + 1;
								totalChars += token.length + 1;
							});
						}

						const end = entity.split(' ').length + start;

						tmpEntities.push({
							start: start,
							end: end,
							tag: key.replace('_s', ''),
							text: entity,
							color: tagmap.get(key.replace('_s', '')),
						});

						tmpEntityAnswers.push({
							correct: true,
							incorrectReason: '',
						});
					});
				}
			});
			paragraphEntities.push(tmpEntities);
			paragraphEntityAnswers.push(tmpEntityAnswers);
		});

		const randomParagraphIndex = Math.floor(
			Math.random() * Math.floor(paragraphsWithEntities.length)
		);

		this.setState({
			tagsList: data.tagsList,
			tagDescriptions: data.tagDescriptions,
			colorMap: tagmap,
			loading: false,
			paragraphs: paragraphsWithEntities,
			currentParagraphIndex: randomParagraphIndex,
			paragraphEntities: paragraphEntities,
			paragraphEntityAnswers: paragraphEntityAnswers,
			progressText: `${this.state.currentEntityIndex + 1} / ${
				paragraphEntities[randomParagraphIndex].length
			} entities left in this paragraph`,
			progressValue:
				((this.state.currentEntityIndex + 1) /
					paragraphEntities[randomParagraphIndex].length) *
				100,
			doc_id: data.doc_id,
			doc_num: data.doc_num,
			doc_type: data.doc_type,
			type: data.type,
		});
	};

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
		});
	};

	handlePreviousNext = (change) => {
		const { isPowerUser, canMoveForward } = this.state;

		if (change > 0 && !canMoveForward) return;

		if (isPowerUser) {
			this.handleChangeParagraph(change);
		} else {
			this.handleChangeEntity(change);
		}
	};

	handleChangeEntity = (change) => {
		const {
			currentEntityIndex,
			paragraphEntities,
			currentParagraphIndex,
			paragraphEntityAnswers,
			canMoveForward,
		} = this.state;
		let newEntityIndex = currentEntityIndex;

		// Are we going forward or back
		if (change > 0 && canMoveForward) {
			// Are we moving to the next entity in this paragraph or onto a new paragraph?
			if (
				currentEntityIndex + change ===
				paragraphEntities[currentParagraphIndex].length
			) {
			} else {
				newEntityIndex =
					(currentEntityIndex + change) %
					paragraphEntities[currentParagraphIndex].length;
			}
		} else {
			newEntityIndex =
				(currentEntityIndex + change) %
				paragraphEntities[currentParagraphIndex].length;
			newEntityIndex = newEntityIndex < 0 ? 0 : newEntityIndex;
		}

		const newCanMoveForward =
			paragraphEntityAnswers[currentParagraphIndex][newEntityIndex].answered;

		this.setState({
			currentEntityIndex: newEntityIndex,
			progressText: `${newEntityIndex + 1} / ${
				paragraphEntities[currentParagraphIndex].length
			} entities left in this paragraph`,
			progressValue:
				((newEntityIndex + 1) /
					paragraphEntities[currentParagraphIndex].length) *
				100,
			canMoveForward: newCanMoveForward,
		});
	};

	handleChangeParagraph = (change) => {
		const {
			currentTextIndex,
			textsList,
			textsListsFull,
			textIndicies,
			textIndiciesFull,
		} = this.state;
		let newTextIndex;
		let newTextList = textsList;
		let newTextIndicies = textIndicies;
		let endOfList = false;
		const voluntary = true;

		// Are we going forward or back
		if (change > 0) {
			// Are we adding a new random paragraph or just moving to the next
			if (currentTextIndex + change === newTextList.length) {
				const tmpArray = [];
				textIndiciesFull.forEach((index) => {
					if (newTextIndicies.indexOf(index) === -1) {
						tmpArray.push(index);
					}
				});
				if (tmpArray.length > 0) {
					const newIndex = tmpArray[random(0, tmpArray.length - 1)];
					newTextList.push(textsListsFull[newIndex]);
					newTextIndicies.push(newIndex);
					newTextIndex = (currentTextIndex + change) % newTextList.length;

					endOfList = tmpArray.length === 1;
				} else {
					endOfList = true;
				}
			} else {
				newTextIndex = (currentTextIndex + change) % newTextList.length;
			}
		} else {
			newTextIndex = (currentTextIndex + change) % newTextList.length;
		}

		this.setState({
			currentTextIndex: newTextIndex,
			textIndicies: newTextIndicies,
			textsList: newTextList,
			progressText: `${newTextIndex + 1} / ${
				textIndiciesFull.length
			} available in this document`,
			progressValue: ((newTextIndex + 1) / textIndiciesFull.length) * 100,
			endOfList: endOfList,
			voluntary: voluntary,
		});
	};

	setCurrentTokens = (newTokens) => {
		this.setState((prevState) => {
			const { currentTextIndex, annotatedTokens } = prevState;
			annotatedTokens[currentTextIndex] = newTokens;
			return prevState;
		});
	};

	handleGeneralAnswers = (correct, incorrectReason, unknown = false) => {
		const {
			paragraphEntityAnswers,
			currentEntityIndex,
			currentParagraphIndex,
		} = this.state;
		//gameChangerAPI.saveDocumentAnnotations(dataToSave);

		paragraphEntityAnswers[currentParagraphIndex][currentEntityIndex] = {
			correct,
			incorrectReason,
			unknown,
			answered: true,
		};

		const canMoveForward = true;
		let canSubmit = true;

		paragraphEntityAnswers[currentParagraphIndex].forEach((answer) => {
			if (!answer.answered) canSubmit = false;
		});

		this.setState({ paragraphEntityAnswers, canMoveForward, canSubmit }, () => {
			this.handlePreviousNext(1);
		});
	};

	handleGeneralSave = async () => {
		const {
			paragraphEntityAnswers,
			currentParagraphIndex,
			paragraphEntities,
			paragraphs,
		} = this.state;

		const dataToSave = [];

		const userId = Auth.getUserId();

		if (paragraphEntityAnswers) {
			paragraphEntityAnswers[currentParagraphIndex].forEach((answer, idx) => {
				if (answer.answered) {
					dataToSave.push({
						user_id: userId,
						document_id: paragraphs[currentParagraphIndex].id,
						paragraph_id: paragraphs[currentParagraphIndex].par_count_i,
						tokens_assumed: paragraphEntities[currentParagraphIndex][idx].text,
						entity_tag: paragraphEntities[currentParagraphIndex][idx].tag,
						tagged_correctly: answer.correct,
						tag_unknown: answer.unknown,
						incorrect_reason: answer.incorrectReason,
					});
				}
			});

			await gameChangerAPI.saveDocumentAnnotations(dataToSave);
		}

		// Close
		this.closeModal();
	};

	handlePowerSave = () => {
		const {
			doc_id,
			doc_num,
			doc_type,
			voluntary,
			annotatedTokens,
			textsList,
			isTutorial,
		} = this.state;

		if (isTutorial) return;

		const userId = Auth.getUserId();

		const dataToSave = {
			docId: doc_id,
			tagsAnnotated: 0,
			annotationData: [],
		};

		annotatedTokens.forEach((textAnnotatedTokens, index) => {
			textAnnotatedTokens.forEach((annotatedToken) => {
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
					voluntary: voluntary,
				});
			});
		});

		dataToSave.tagsAnnotated = dataToSave.annotationData.length;

		// Save
		gameChangerAPI.saveDocumentAnnotations(dataToSave);

		// Reset
		this.resetAnnotationState();

		// Store local data
		localStorage.setItem('gcAssistCompleteDate', new Date().toDateString());

		// CLose
		this.props.closeModal();
	};

	handleSave = (closing = false) => {
		const { canMoveForward, canSubmit, isPowerUser } = this.state;

		if (!canMoveForward && !canSubmit && !closing) return;

		if (isPowerUser) {
			this.handlePowerSave();
		} else {
			this.handleGeneralSave();
		}
	};

	renderAnnotationCard = () => {
		const {
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
			doc_id,
		} = this.state;

		return (
			<>
				{isPowerUser && (
					<PowerUserAnnotationCard
						// uses template string for text to read newlines correctly
						text={`${textsList[currentTextIndex]}`}
						currentTokens={annotatedTokens[currentTextIndex]}
						setCurrentTokens={this.setCurrentTokens}
						tags={tagsList}
						progressText={progressText}
						progressValue={progressValue}
						componentStepNumbers={componentStepNumbers}
						isTutorial={isTutorial}
						colorMap={colorMap}
					/>
				)}
				{!isPowerUser && (
					<GeneralUserAnnotationCard
						// uses template string for text to read newlines correctly
						paragraph={paragraphs[currentParagraphIndex]}
						entities={
							paragraphEntities[currentParagraphIndex]
								? paragraphEntities[currentParagraphIndex][currentEntityIndex]
								: {}
						}
						entityAnswer={
							paragraphEntityAnswers[currentParagraphIndex]
								? paragraphEntityAnswers[currentParagraphIndex][
									currentEntityIndex
								  ]
								: { correct: true, incorrectReason: '0' }
						}
						tag={
							paragraphEntities[currentParagraphIndex]
								? paragraphEntities[currentParagraphIndex][currentEntityIndex]
									?.tag
								: 'PERSON'
						}
						tags={tagsList}
						progressText={progressText}
						progressValue={progressValue}
						componentStepNumbers={componentStepNumbers}
						isTutorial={isTutorial}
						colorMap={colorMap}
						tagDescriptions={tagDescriptions}
						handleAnswer={this.handleGeneralAnswers}
						docId={doc_id}
					/>
				)}
			</>
		);
	};

	render() {
		const {
			loading,
			currentParagraphIndex,
			componentStepNumbers,
			currentEntityIndex,
			paragraphEntityAnswers,
			progressText,
			progressValue,
			canMoveForward,
		} = this.state;

		const classes = this.props.classes;

		return (
			<Dialog
				open={this.state.isModalOpen}
				scroll={'paper'}
				maxWidth="xl"
				disableEscapeKeyDown
				disableBackdropClick
				classes={{
					paperWidthXl: classes.dialogXl,
				}}
			>
				<DialogTitle>
					<div style={{ display: 'flex', width: '100%' }}>
						<Typography
							variant="h3"
							display="inline"
							style={{ fontWeight: 700 }}
						>
							Your Assists this Week:{' '}
							<b style={{ color: 'red', fontSize: 14 }}>(Beta)</b>
						</Typography>
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
						<div>{this.renderAnnotationCard()}</div>
					)}
				</DialogContent>

				<DialogActions>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							width: '100%',
							margin: '0px 18px',
						}}
					>
						<div style={{ display: 'flex', marginTop: '5px' }}>
							<div style={{ marginTop: '5px', width: 800, marginRight: '5px' }}>
								<BorderLinearProgress
									variant="determinate"
									value={progressValue}
									className={`tutorial-step-${componentStepNumbers['Paragraph Progress']}`}
								/>
							</div>
							<p style={{ width: '100%' }}>{progressText}</p>
						</div>

						<div>
							<GCButton
								id={'gcAssistPrevious'}
								className={`tutorial-step-${componentStepNumbers['Previous Button']}`}
								onClick={() => {
									this.handlePreviousNext(-1);
								}}
								isSecondaryBtn={true}
								disabled={currentEntityIndex === 0}
							>
								Previous
							</GCButton>
							<GCButton
								id={'gcAssistNext'}
								className={`tutorial-step-${componentStepNumbers['Next Button']}`}
								onClick={() => {
									currentEntityIndex + 1 ===
									paragraphEntityAnswers[currentParagraphIndex]?.length
										? this.handleSave()
										: this.handlePreviousNext(1);
								}}
								disabled={!canMoveForward}
								textStyle={{ color: !canMoveForward ? 'grey' : 'white' }}
							>
								{currentEntityIndex + 1 ===
								paragraphEntityAnswers[currentParagraphIndex]?.length
									? 'Submit'
									: 'Next'}
							</GCButton>
						</div>
					</div>
				</DialogActions>
			</Dialog>
		);
	}
}

export default withStyles(useStyles)(GameChangerAssist);
