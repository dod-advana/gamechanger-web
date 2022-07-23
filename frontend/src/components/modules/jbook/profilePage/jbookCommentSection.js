import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import GCButton from '../../../common/GCButton';
import JBookUserNameModal from './jbookUserNameModal';

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
	justify-content: space-between;
	margin: 5px 0;
`;

const CommentThreadContainer = styled.div`
	height: ${({ isExpanded }) => (isExpanded ? '400px' : '100%')};
	overflow: auto;
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
	const [showUserModal, setShowUserModal] = useState(false);
	const bottomRef = useRef(null);

	useEffect(() => {
		if (isExpanded) {
			bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}, [isExpanded]);

	useEffect(() => {
		setShowExpandButton(!isExpanded && commentThread && commentThread.length > 3);
	}, [isExpanded, commentThread]);

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
							<Typography variant="h5" style={{ fontWeight: 'bold' }}>
								{comment.author}
							</Typography>
							<div style={{ color: 'gray' }}>{date.toDateString()}</div>
						</CommentTitle>

						<p>{comment.message}</p>
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
