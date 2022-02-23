import React, { useState } from 'react';
import Fade from '@material-ui/core/Fade';
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import _ from 'lodash';
import { getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import Popover from '@material-ui/core/Popover';
import { Checkbox } from '@material-ui/core';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CloseIcon from '@material-ui/icons/Close';
import GCButton from '../../common/GCButton';
import TextField from '@material-ui/core/TextField';

import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { handleSaveFavoriteDocument, setState } from '../../../utils/sharedFunctions';
import { trackEvent } from '../../telemetry/Matomo';
import GCTooltip from '../../common/GCToolTip';
import GameChangerAPI from '../../api/gameChanger-service-api';
import Link from '@material-ui/core/Link';

const CloseButton = styled.div`
	padding: 6px;
	background-color: white;
	border-radius: 5px;
	color: #8091a5 !important;
	border: 1px solid #b0b9be;
	cursor: pointer;
	display: flex;
	align-items: center;
	align-self: center;
	justify-content: center;
	margin-left: 10px;
	height: 30px;
	width: 30px;
`;

const styles = {
	intelligentContainer: {
		margin: '10px',
		padding: '20px',
		backgroundColor: 'rgb(241, 245, 249)',
		fontSize: '1.2em',
		width: '100%',
	},
	tooltipRow: {
		display: 'flex',
		justifyContent: 'space-between',
		textAlign: 'center',
		width: '100%',
		marginRight: 'auto',
		marginTop: '10px',
	},
	infoCircleDiv: {
		flexGrow: 1,
	},
	docTitle: {
		fontSize: '0.8em',
	},
	dateText: {
		fontSize: 14,
		color: 'gray',
	},
	flex: {
		display: 'flex',
	},
	bold: {
		fontWeight: 'bolder',
	},
	topRight: {
		position: 'absolute',
		top: '20px',
		right: '20px',
	},
};
const useStyles = makeStyles((theme) => ({
	infoCircle: {
		fontSize: 25,
		color: 'rgb(56, 111, 148)',
		fontWeight: 'normal',
		alignSelf: 'center',
		flexGrow: 1,
		'&:hover': {
			color: 'rgb(0, 48, 143)',
			cursor: 'pointer',
		},
	},
	feedback: {
		fontSize: 25,
		flexGrow: 1,
		justifyContent: 'center',
		'-webkit-text-stroke': '1px #808080',
		'&:hover': {
			cursor: 'pointer',
			'-webkit-text-stroke': '1px black',
		},
	},
}));

const gameChangerAPI = new GameChangerAPI();

const GetQAResults = (props) => {
	const { context } = props;
	const { state, dispatch } = context;
	const { question, answers, qaContext, params } = state.qaResults;
	const sentenceResults = state.sentenceResults;
	const { intelligentSearchResult } = state;
	const isFavorite =
		_.findIndex(
			state.userData.favorite_documents,
			(item) => item.id === intelligentSearchResult.id
		) !== -1;
	const classes = useStyles();
	let publicationDate;
	if (
		intelligentSearchResult.publication_date_dt !== undefined &&
		intelligentSearchResult.publication_date_dt !== ''
	) {
		const currentDate = new Date(intelligentSearchResult.publication_date_dt);
		const year = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(
			currentDate
		);
		const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(
			currentDate
		);
		const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(
			currentDate
		);
		publicationDate = `${month}-${day}-${year}`;
	} else {
		publicationDate = `unknown`;
	}

	const [favorite, setFavorite] = useState(isFavorite);
	const [feedback, setFeedback] = useState('');
	const [popperIsOpen, setPopperIsOpen] = useState(false);
	const [popperAnchorEl, setPopperAnchorEl] = useState(null);
	const [favoriteSummary, setFavoriteSummary] = useState('');
	const [open, setOpen] = useState(true);

	const selected =
		intelligentSearchResult.filename &&
		state.selectedDocuments.has(intelligentSearchResult.filename);

	const preventDefault = (event) => event.preventDefault();

	const handleSaveFavorite = (favorite = false) => {
		const documentData = {
			filename: intelligentSearchResult.filename,
			favorite_summary: favoriteSummary,
			favorite_name: '',
			is_favorite: favorite,
		};

		setFavorite(favorite);
		setPopperAnchorEl(null);
		setPopperIsOpen(false);
		// setFavoriteName('');
		setFavoriteSummary('');
		handleSaveFavoriteDocument(documentData, state, dispatch);
	};

	const handleCancelFavorite = () => {
		setPopperIsOpen(false);
		setPopperAnchorEl(null);
	};

	const openFavoritePopper = (target) => {
		if (popperIsOpen) {
			setPopperIsOpen(false);
			setPopperAnchorEl(null);
		} else {
			setPopperIsOpen(true);
			setPopperAnchorEl(target);
		}
	};
	const handleCheckbox = (key, value) => {
		const { selectedDocuments } = state;

		if (selectedDocuments.has(key)) {
			selectedDocuments.delete(key);
			trackEvent(
				getTrackingNameForFactory(state.cloneData.clone_name),
				'CardCheckboxUnchecked',
				key,
				0
			);
		} else {
			selectedDocuments.set(key, value);
			trackEvent(
				getTrackingNameForFactory(state.cloneData.clone_name),
				'CardCheckboxChecked',
				key,
				1
			);
		}

		setState(dispatch, { selectedDocuments: new Map(selectedDocuments) });
	};
	const feedbackComponent = (input, type) => {
		const { answer, qaContext, params } = input;
		const { title, sentenceResults } = input;
		return (
			<div style={styles.tooltipRow}>
				<div>
					<GCTooltip
						enterDelay={100}
						title={
							<div style={{ textAlign: 'center' }}>
								{type === 'QA' ? (
									<span>
										This answer was retrieved based on beta artificial
										intelligent answering. <br />
										User discretion is encouraged while we continue maturing
										this capability.
									</span>
								) : (
									<span>
										This card was retrieved based on a new machine learning
										algorithm. {feedback === '' && 'Was this result relevant?'}
									</span>
								)}
							</div>
						}
						placement="right"
						arrow
					>
						<i
							className={classes.infoCircle + ' fa fa-info-circle'}
							aria-hidden="true"
						/>
					</GCTooltip>
				</div>
				<div>
					<Fade in={feedback === ''} timeout={1500}>
						<div style={{ flexGrow: 2, display: 'flex' }}>
							<i
								className={classes.feedback + ' fa fa-thumbs-up'}
								style={{
									color: feedback === 'thumbsUp' ? '#238823' : 'white',
									marginRight: '10px',
								}}
								onClick={() => {
									if (feedback === '') {
										setFeedback('thumbsUp');
										if (type === 'QA') {
											gameChangerAPI.sendQAFeedback(
												'qa_thumbs_up',
												question,
												answer,
												qaContext,
												params
											);
											trackEvent(
												getTrackingNameForFactory(state.cloneData.clone_name),
												'CardInteraction',
												'QAThumbsUp',
												`question : ${question}, answer: ${answer}`
											);
										} else {
											gameChangerAPI.sendIntelligentSearchFeedback(
												'intelligent_search_thumbs_up',
												title,
												state.searchText,
												sentenceResults
											);
											trackEvent(
												getTrackingNameForFactory(state.cloneData.clone_name),
												'CardInteraction',
												'IntelligentSearchThumbsUp',
												`search : ${state.searchText}, title: ${title}`
											);
										}
									}
								}}
							></i>
							<i
								className={classes.feedback + ' fa fa-thumbs-down'}
								style={{
									color: feedback === 'thumbsDown' ? '#D2222D' : 'white',
								}}
								onClick={() => {
									if (feedback === '') {
										setFeedback('thumbsDown');
										if (type === 'QA') {
											gameChangerAPI.sendQAFeedback(
												'qa_thumbs_down',
												question,
												answer,
												qaContext,
												params
											);
											trackEvent(
												getTrackingNameForFactory(state.cloneData.clone_name),
												'CardInteraction',
												'QAThumbsDown',
												`question : ${question}, title: ${answer}`
											);
										} else {
											gameChangerAPI.sendIntelligentSearchFeedback(
												'intelligent_search_thumbs_down',
												title,
												state.searchText,
												sentenceResults
											);
											trackEvent(
												getTrackingNameForFactory(state.cloneData.clone_name),
												'CardInteraction',
												'IntelligentSearchThumbsDown',
												`search : ${state.searchText}, title: ${title}`
											);
										}
									}
								}}
							></i>
						</div>
					</Fade>
				</div>
			</div>
		);
	};

	const favoriteComponent = () => {
		return (
			<GCTooltip
				title={'Favorite a document to track in the User Dashboard'}
				placement="top"
				arrow
			>
				<i
					onClick={(event) => {
						if (favorite) {
							setFavorite(false);
							handleSaveFavorite();
						} else {
							openFavoritePopper(event.target);
						}
					}}
					className={favorite ? 'fa fa-star' : 'fa fa-star-o'}
					style={{
						color: favorite ? '#E9691D' : 'rgb(224, 224, 224)',
						marginLeft: 'auto',
						cursor: 'pointer',
						fontSize: 26,
						alignSelf: 'center',
					}}
				/>
			</GCTooltip>
		);
	};

	const checkboxComponent = (key, value) => {
		return (
			<GCTooltip title={'Select a document for export'} placement="top" arrow>
				<Checkbox
					style={styles.checkbox}
					onChange={() => handleCheckbox(key, value)}
					color="primary"
					icon={
						<CheckBoxOutlineBlankIcon
							style={{ width: 25, height: 25, fill: 'rgb(224, 224, 224)' }}
							fontSize="large"
						/>
					}
					checkedIcon={
						<CheckBoxIcon style={{ width: 25, height: 25, fill: '#386F94' }} />
					}
					checked={selected}
					className={`tutorial-step-${state.componentStepNumbers['Search Result Checkbox']}`}
					id={'gcSearchResultCheckbox'}
				/>
			</GCTooltip>
		);
	};

	if (open && question !== '' && answers.length > 0) {
		return (
			<div style={styles.intelligentContainer}>
				<strong>{question.toUpperCase()}</strong>
				<b style={{ color: 'red', fontSize: 14, marginLeft: '5px' }}>(Beta)</b>
				<CloseButton
					style={styles.topRight}
					onClick={() => {
						setOpen(false);
					}}
				>
					<CloseIcon fontSize="large" />
				</CloseButton>
				<p style={{ marginTop: '10px', marginBottom: '0' }}>
					{_.truncate(answers[0].answer, { length: 300 })}
				</p>
				<Link
					href={'#'}
					onClick={(event) => {
						preventDefault(event);
						window.open(
							`#/gamechanger-details?cloneName=${state.cloneData.clone_name}&type=${answers[0].resultType}&${answers[0].resultType}Name=${answers[0].docId}`
						);
					}}
				>
					<strong>
						<b style={{ fontSize: 14 }}>{answers[0].displaySource}</b>
					</strong>
				</Link>
				{feedbackComponent(
					{ answer: answers[0], qaContext: qaContext, params: params },
					'QA'
				)}
			</div>
		);
	} else if (open && Object.keys(intelligentSearchResult).length !== 0) {
		return (
			<div style={styles.intelligentContainer}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'space-between',
					}}
				>
					<div>
						<div style={styles.bold}>
							{' '}
							DOCUMENT {intelligentSearchResult.display_title_s}{' '}
							<span style={{ fontSize: '0.8em', color: 'gray' }}>
								({intelligentSearchResult.display_org_s})
							</span>
						</div>
						<b style={styles.dateText}>Published on: {publicationDate}</b>
					</div>
					<div style={styles.flex}>
						<Popover
							onClose={() => handleCancelFavorite()}
							id={0}
							open={popperIsOpen}
							anchorEl={popperAnchorEl}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'right',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
						>
							{isFavorite ? (
								<div style={{ padding: '0px 15px 10px' }}>
									<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
										<CloseButton onClick={() => handleCancelFavorite()}>
											<CloseIcon fontSize="small" />
										</CloseButton>
									</div>
									<div style={{ width: 350, margin: 5 }}>
										<div style={{ margin: '65px 15px 0' }}>
											Are you sure you want to delete this favorite? You will
											lose any comments made.
										</div>
										<div
											style={{ display: 'flex', justifyContent: 'flex-end' }}
										>
											<GCButton
												onClick={() => handleCancelFavorite()}
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
													handleSaveFavorite(false);
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
							) : (
								<div className={classes.paper}>
									<div
										style={{
											width: 330,
											margin: 5,
											display: 'flex',
											flexDirection: 'column',
										}}
									>
										<TextField
											label={'Favorite Summary'}
											value={favoriteSummary}
											onChange={(event) => {
												setFavoriteSummary(event.target.value);
											}}
											className={classes.textArea}
											margin="none"
											size="small"
											variant="outlined"
											multiline={true}
											rows={8}
										/>
										<div
											style={{ display: 'flex', justifyContent: 'flex-end' }}
										>
											<GCButton
												onClick={() => handleCancelFavorite()}
												style={{
													height: 40,
													minWidth: 40,
													padding: '2px 8px 0px',
													fontSize: 14,
													margin: '16px 0px 0px 10px',
												}}
												isSecondaryBtn={true}
											>
												Cancel
											</GCButton>
											<GCButton
												onClick={() => handleSaveFavorite(true)}
												style={{
													height: 40,
													minWidth: 40,
													padding: '2px 8px 0px',
													fontSize: 14,
													margin: '16px 0px 0px 10px',
												}}
											>
												Save
											</GCButton>
										</div>
									</div>
								</div>
							)}
						</Popover>
						<div style={styles.flex}>
							{checkboxComponent(
								intelligentSearchResult.filename,
								intelligentSearchResult.display_title_s
							)}
							{favoriteComponent()}
							<CloseButton
								onClick={() => {
									setOpen(false);
								}}
							>
								<CloseIcon fontSize="large" />
							</CloseButton>
						</div>
					</div>
				</div>
				<p
					style={{
						marginTop: '10px',
						marginBottom: '0',
						padding: '10px',
						backgroundColor: 'white',
					}}
				>
					{_.truncate(intelligentSearchResult.pageHits[0].snippet, {
						length: 500,
					})}

				</p>
				<Link
					href={'#'}
					onClick={(event) => {
						preventDefault(event);
						window.open(
							`#/gamechanger-details?cloneName=${state.cloneData.clone_name}&type=document&documentName=${intelligentSearchResult.id}`
						);
					}}
				>
					<strong>
						<b style={{ fontSize: 14 }}>Open Details</b>
					</strong>
				</Link>
				{feedbackComponent(
					{
						title: intelligentSearchResult.display_title_s,
						sentenceResults: sentenceResults,
					},
					'intelligentSearch'
				)}
			</div>
		);
	}
	return <></>;
};

export default GetQAResults;
