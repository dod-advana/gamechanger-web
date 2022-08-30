import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import GCButton from '../../../common/GCButton';
import Modal from 'react-modal';
import JBookUserNameModal from './jbookUserNameModal';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbDownAlt from '@mui/icons-material/ThumbDownAlt';
import ThumbUpAlt from '@mui/icons-material/ThumbUpAlt';
import Cancel from '@mui/icons-material/Cancel';
import CloseIcon from '@material-ui/icons/Close';
import { CloseButton } from './profilePageStyles';

const StyledCard = styled.div`
	background-color: white;
	padding: 15px 10px 10px 10px;
	margin: 10px 10px 15px 10px;
`;

const CommentContainer = styled.div`
	padding: 10px;
`;

const Separator = styled.hr`
	margin: 0;
`;

const CommentTitle = styled.div`
	display: flex;
	align-items: center;
	margin: 5px 0;
`;

const CommentThreadContainer = styled.div`
	height: ${({ isExpanded }) => (isExpanded ? '400px' : '100%')};
	overflow: auto;
`;

const CommentBody = styled.p`
	overflow: auto;
	max-width: 280px;
	max-height: 170px;
`;

const CommentFooter = styled.div`
	display: flex;
	justify-content: flex-end;
`;

const JBookCommentSection = ({
	commentThread = [],
	gameChangerAPI,
	docID,
	portfolioName,
	getCommentThread,
	userData = {},
	updateUserProfileData,
	dispatch,
}) => {
	const [text, setText] = useState('');
	const [isExpanded, setIsExpanded] = useState(false);
	const [showExpandButton, setShowExpandButton] = useState(false);
	const [currentComment, setCurrentComment] = useState({});
	const [showUserModal, setShowUserModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const bottomRef = useRef(null);

	useEffect(() => {
		if (isExpanded) {
			bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}, [isExpanded]);

	useEffect(() => {
		setShowExpandButton(!isExpanded && commentThread && commentThread.length > 3);
	}, [isExpanded, commentThread]);

	const deleteComment = async (comment) => {
		if (!comment) {
			return;
		}
		try {
			await gameChangerAPI.callDataFunction({
				functionName: 'deleteComment',
				cloneName: 'jbook',
				options: {
					id: comment.id,
				},
			});

			await getCommentThread(docID, portfolioName);
			bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		} catch (err) {
			console.log('Error while deleting comment');
			console.log(err);
		}
	};

	const voteComment = async (comment, e) => {
		try {
			let myField;
			if (e.target.parentNode.id === 'thumbs-up' || e.target.parentNode.dataset.testid === 'ThumbUpAltIcon') {
				myField = 'upvotes';
			}
			if (e.target.parentNode.id === 'thumbs-down' || e.target.parentNode.dataset.testid === 'ThumbDownAltIcon') {
				myField = 'downvotes';
			}

			await gameChangerAPI.callDataFunction({
				functionName: 'voteComment',
				cloneName: 'jbook',
				options: {
					id: comment.id,
					field: myField,
					author: String(userData.id),
				},
			});
			await getCommentThread(docID, portfolioName);
		} catch (err) {
			console.log('Error while voting on comment');
			console.log(err);
		}
	};

	const alreadyVoted = (userId, votedArr) => {
		if (votedArr) {
			for (const voters of votedArr) {
				if (voters.includes(String(userId))) {
					return true;
				}
			}
		}
	};

	const DeleteModal = ({ comment }) => {
		return (
			<Modal
				isOpen={showDeleteModal}
				onRequestClose={() => setShowDeleteModal(false)}
				shouldCloseOnOverlayClick={false}
				style={{
					overlay: {
						backgroundColor: 'rgba(0, 0, 0, 0.3)',
					},
					content: {
						top: '35%',
						left: '50%',
						right: 'auto',
						bottom: 'auto',
						marginRight: '-50%',
						width: '40%',
						transform: 'translate(-50%, -50%)',
						boxShadow: '0 10px 6px -6px #777',
					},
				}}
			>
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between' }}>
						<Typography variant="h2" style={{ width: '100%', fontSize: '20px', marginBottom: 20 }}>
							Are you sure you want to delete your comment?
						</Typography>
						<CloseButton onClick={() => setShowDeleteModal(false)}>
							<CloseIcon fontSize="25" style={{ color: 'black' }} />
						</CloseButton>
					</div>
					<Typography variant="body2" style={{ width: '100%', fontSize: '15px', marginBottom: 20 }}>
						This action can't be undone and it will be removed from the comment section and the portfolio
						page.
					</Typography>
					<div style={{ display: 'flex' }}>
						<div style={{ marginLeft: 'auto' }}>
							<GCButton
								onClick={() => setShowDeleteModal(false)}
								style={{
									height: 40,
									minWidth: 40,
									padding: '2px 18px 0px',
									fontSize: 14,
									margin: '16px 0px 0px 10px',
								}}
								isSecondaryBtn
							>
								Close
							</GCButton>
							<GCButton
								onClick={() => {
									setShowDeleteModal(false);
									deleteComment(comment);
								}}
								style={{
									height: 40,
									minWidth: 40,
									padding: '2px 18px 0px',
									fontSize: 14,
									margin: '16px 0px 0px 10px',
								}}
							>
								Delete
							</GCButton>
						</div>
					</div>
				</div>
			</Modal>
		);
	};

	const renderComments = () => {
		try {
			const comments = [];

			let thread = commentThread;

			if (showExpandButton) {
				thread = thread.slice(thread.length - 3);
			}

			for (const [index, comment] of thread.entries()) {
				let date = new Date(comment.createdAt);
				comments.push(
					<CommentContainer>
						<CommentTitle>
							<Typography variant="h5" style={{ fontWeight: 'bold', marginRight: '10px' }}>
								{comment.author}
							</Typography>
							<div style={{ color: 'gray', marginRight: 'auto' }}>{date.toDateString()}</div>
							{(comment.authorId === String(userData.id) ||
								comment.author === `${userData.first_name} ${userData.last_name[0]}.`) && (
								<Cancel
									onClick={() => {
										setCurrentComment(comment);
										setShowDeleteModal(true);
									}}
									sx={{
										color: 'red',
										'&:hover': {
											color: 'white',
											backgroundColor: 'red',
											borderRadius: '30px',
										},
										cursor: 'pointer',
									}}
								/>
							)}
						</CommentTitle>
						<CommentBody>{comment.message}</CommentBody>
						<CommentFooter>
							<div style={{ display: 'flex' }}>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										marginRight: '5px',
									}}
								>
									<div
										id="thumbs-up"
										onClick={(e) => {
											voteComment(comment, e);
										}}
									>
										{alreadyVoted(String(userData.id), comment.upvotes) ? (
											<ThumbUpAlt
												sx={{
													'&:hover': {
														color: 'green',
														backgroundColor: 'rgb(250, 250, 250)',
														borderRadius: '10px',
													},
													cursor: 'pointer',
												}}
											/>
										) : (
											<ThumbUpOffAltIcon
												sx={{
													'&:hover': {
														color: 'green',
														backgroundColor: 'rgb(250, 250, 250)',
														borderRadius: '10px',
													},
													cursor: 'pointer',
												}}
											/>
										)}
									</div>
									<p>{comment.upvotes === null ? 0 : comment.upvotes.length}</p>
								</div>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
									}}
								>
									<div
										id="thumbs-down"
										onClick={(e) => {
											voteComment(comment, e);
										}}
									>
										{alreadyVoted(String(userData.id), comment.downvotes) ? (
											<ThumbDownAlt
												sx={{
													'&:hover': {
														color: 'green',
														backgroundColor: 'rgb(250, 250, 250)',
														borderRadius: '10px',
													},
													cursor: 'pointer',
												}}
											/>
										) : (
											<ThumbDownOffAltIcon
												sx={{
													'&:hover': {
														color: 'green',
														backgroundColor: 'rgb(250, 250, 250)',
														borderRadius: '10px',
													},
													cursor: 'pointer',
												}}
											/>
										)}
									</div>
									<p>{comment.downvotes === null ? 0 : comment.downvotes.length}</p>
								</div>
							</div>
						</CommentFooter>
					</CommentContainer>
				);

				if (index !== thread.length - 1) {
					comments.push(<Separator />);
				}
			}

			comments.push(<div ref={bottomRef} />);

			return comments;
		} catch (err) {
			console.log('Error rendering comments');
			console.log(err);
			return [];
		}
	};

	const addComment = async () => {
		try {
			if (text && text !== '') {
				let first = '';
				let last = '';

				if (userData) {
					first = userData.first_name ? userData.first_name + ' ' : '';
					last = userData.last_name ?? '';

					if (last.length > 1) {
						last = last[0] + '.';
					}
				}

				await gameChangerAPI.callDataFunction({
					functionName: 'createComment',
					cloneName: 'jbook',
					options: {
						message: text,
						docID,
						portfolioName,
						author: first + last,
						authorId: String(userData.id),
					},
				});

				await getCommentThread(docID, portfolioName);

				setText('');
				bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}
		} catch (err) {
			console.log('Error while adding new comment');
			console.log(err);
		}
	};

	const checkUserData = () => {
		if (!userData.first_name || !userData.last_name) {
			setShowUserModal(true);
		}
	};

	const handleTextChange = (e) => {
		setText(e.target.value);
	};

	return (
		<StyledCard>
			<DeleteModal comment={currentComment} />
			<JBookUserNameModal
				showUserModal={showUserModal}
				userData={userData}
				dispatch={dispatch}
				setShowUserModal={setShowUserModal}
				updateUserProfileData={updateUserProfileData}
			/>
			<TextField
				label="Comment"
				variant="outlined"
				multiline
				rows="4"
				style={{ width: '100%' }}
				color="secondary"
				value={text}
				onChange={handleTextChange}
				onFocus={checkUserData}
				inputProps={{ maxLength: 350 }}
			/>
			<GCButton onClick={addComment} style={{ width: '100%', textAlign: 'center', margin: '10px 0' }}>
				Add Comment
			</GCButton>
			<CommentThreadContainer isExpanded={isExpanded}>{renderComments()}</CommentThreadContainer>
			{showExpandButton && (
				<GCButton
					isSecondaryBtn
					onClick={() => {
						setIsExpanded(true);
					}}
					style={{ margin: 0, width: '100%' }}
				>
					Show More Comments
				</GCButton>
			)}
		</StyledCard>
	);
};

export default JBookCommentSection;
