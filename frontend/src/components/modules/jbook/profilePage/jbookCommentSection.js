import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import GCButton from '../../../common/GCButton';

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
	height: 400px;
	overflow: auto;
`;

const JBookCommentSection = ({ commentThread = [], gameChangerAPI, docID, portfolioName, getCommentThread }) => {
	const [text, setText] = useState('');
	const [isExpanded, setIsExpanded] = useState(false);
	const bottomRef = useRef(null);

	useEffect(() => {
		if (isExpanded) {
			bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}, [isExpanded]);

	const renderComments = () => {
		try {
			const comments = [];

			let thread = commentThread;

			if (thread.length > 3 && !isExpanded) {
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
			await gameChangerAPI.callDataFunction({
				functionName: 'createComment',
				cloneName: 'jbook',
				options: {
					message: text,
					docID,
					portfolioName,
				},
			});

			await getCommentThread(docID, portfolioName);

			setText('');
			bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		} catch (err) {
			console.log('Error while adding new comment');
			console.log(err);
		}
	};

	return (
		<StyledCard>
			<TextField
				label="Comment"
				variant="outlined"
				multiline
				rows="4"
				style={{ width: '100%' }}
				color="secondary"
				value={text}
				onChange={(e) => {
					setText(e.target.value);
				}}
			/>
			<GCButton onClick={addComment} style={{ width: '100%', textAlign: 'center', margin: '10px 0' }}>
				Add Comment
			</GCButton>
			<CommentThreadContainer>{renderComments()}</CommentThreadContainer>
			{!isExpanded && (
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
