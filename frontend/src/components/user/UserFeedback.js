import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import html2canvas from 'html2canvas';
import EmailValidator from 'email-validator';
import styled from 'styled-components';
import {
	Select,
	TextField,
	FormControl,
	Typography,
	MenuItem,
} from '@material-ui/core';
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import CloseIcon from '@material-ui/icons/Close';
import { KeyboardArrowDown } from '@material-ui/icons';

import GCButton from '../common/GCButton';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator.js';
import GameChangerAPI from '../api/gameChanger-service-api';

import { setState } from '../../sharedFunctions';

const gameChangerAPI = new GameChangerAPI();

Modal.setAppElement('#app');

const getHeight = () => window.innerHeight;

const buttonStyle = {
	margin: '10px',
};
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

export default function UserFeedback(props) {
	const { state, dispatch } = props.context;

	const [feedbackText, setFeedbackText] = useState('');
	const [emailError, setEmailError] = useState(false);
	const [userEmail, setUserEmail] = useState('');
	const [feedbackType, setFeedbackType] = useState('Report a technical issue');
	const [windowHeight, setWindowHeight] = useState(getHeight());
	const [successFlag, setSuccessFlag] = useState(false);
	const [errorFlag, setErrorFlag] = useState(false);
	const [loading, setLoading] = useState(false);
	const [screenShot, setScreenShot] = useState('');
	const [emailTextFocus, setEmailTextFocus] = useState(false);

	// windowHeight - (all the other components that contribute to height except textfield)
	const textFieldHeight = windowHeight - (55 + 72.75 + 40 + 64 + 37 + 300);
	const textFieldRowHeight = 24;

	useEffect(() => {
		const resizeListener = () => {
			// change width from the state object
			setWindowHeight(getHeight());
		};
		// set resize listener
		window.addEventListener('resize', resizeListener);

		// clean up function
		return () => {
			// remove resize listener
			window.removeEventListener('resize', resizeListener);
		};
	}, []);

	useEffect(() => {
		setFeedbackText('');
		setFeedbackType('Report a technical issue');
	}, [state.showFeedbackModal]);

	useEffect(() => {
		setScreenShot(state.screenShot);
	}, [state.screenShot]);

	const closeModal = () => {
		setState(dispatch, { showFeedbackModal: false });
		setUserEmail('');
		setEmailError(false);
	};

	function handleTypeChange(event) {
		setFeedbackType(event.target.value);
	}

	const handleTextChange = (text) => {
		setFeedbackText(text);
	};

	const handleEmailChange = (email) => {
		if (EmailValidator.validate(email)) {
			setEmailError(false);
		} else {
			setEmailError(true);
		}
		setUserEmail(email);
	};

	const handleSubmit = async () => {
		if (EmailValidator.validate(userEmail)) {
			setEmailError(false);
		} else {
			setEmailError(true);
			return;
		}

		setLoading(true);
		/*
            If coming from a different component that took a specific screen shot then
            use that(i.e. DocumentExplorer). Otherwise take a the page in the current 
            view as the image. 
        */
		if (screenShot && screenShot !== '') {
			try {
				await gameChangerAPI.sendFeedbackPOST({
					feedbackType,
					feedbackText,
					screenShot,
				});
				setLoading(false);
				setSuccessFlag(true);
				setScreenShot('');
			} catch (err) {
				setLoading(false);
				setErrorFlag(true);
			}
		} else {
			html2canvas(document.querySelector('#app')).then(async (canvas) => {
				/*
                 base64 image url. It's too big to send directly to backend.
                */
				// const imgSrc = canvas.toDataURL('image/png');

				try {
					const imgSrc = ' ';
					await gameChangerAPI.sendFeedbackPOST({
						feedbackType,
						feedbackText,
						screenShot: imgSrc,
						userEmail: userEmail,
					});
					setLoading(false);
					setSuccessFlag(true);
					setScreenShot('');
				} catch (err) {
					setLoading(false);
					setErrorFlag(true);
				}
			});
		}
	};

	const renderLoading = () => {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					flexDirection: 'column',
				}}
			>
				<LoadingIndicator />

				<GCButton
					id={'feedbackClose'}
					onClick={() => {
						closeModal();
						setLoading(false);
					}}
					style={{ marginTop: '20px', width: '10%', alignSelf: 'center' }}
				>
					Close
				</GCButton>
			</div>
		);
	};

	const renderSuccess = () => {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					flexDirection: 'column',
				}}
			>
				<CheckCircleOutlinedIcon
					style={{
						alignSelf: 'center',
						marginTop: '150px',
						height: '75px',
						width: '75px',
						filter:
							'invert(26%) sepia(49%) saturate(1486%) hue-rotate(146deg) brightness(72%) contrast(103%)',
					}}
				/>

				<h1 style={{ marginTop: '50px', alignSelf: 'center' }}>
					Thank You! We appreciate the feedback.
				</h1>
				<GCButton
					id={'feedbackClose'}
					onClick={() => {
						closeModal();
						setSuccessFlag(false);
					}}
					style={{ marginTop: '20px', width: '10%', alignSelf: 'center' }}
				>
					Close
				</GCButton>
			</div>
		);
	};

	const renderError = () => {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					flexDirection: 'column',
				}}
			>
				<ErrorOutlineIcon
					style={{
						alignSelf: 'center',
						marginTop: '150px',
						height: '75px',
						width: '75px',
						color: 'red',
					}}
				/>

				<h1 style={{ marginTop: '50px', alignSelf: 'center' }}>
					Sorry there seems to be an issue on our end. Please try again later
				</h1>
				<GCButton
					id={'feedbackClose'}
					onClick={() => {
						closeModal();
						setErrorFlag(false);
					}}
					style={{ marginTop: '20px', width: '10%', alignSelf: 'center' }}
				>
					Close
				</GCButton>
			</div>
		);
	};

	const renderForm = () => {
		return (
			<>
				<CloseButton onClick={closeModal}>
					<CloseIcon fontSize="large" />
				</CloseButton>
				<Typography
					variant="h2"
					style={{
						width: '100%',
						padding: '20px',
						paddingLeft: '20px',
						fontSize: '25px',
					}}
				>
					User Feedback
				</Typography>
				<div style={{ height: 75 }}>
					<FormControl
						variant="outlined"
						style={{ width: '30%', margin: '0px 0px 0px 20px' }}
					>
						<Select
							value={feedbackType}
							onChange={handleTypeChange}
							IconComponent={KeyboardArrowDown}
						>
							<MenuItem value="Report a technical issue">
								Report a technical issue
							</MenuItem>
							<MenuItem value="Request new data sources">
								Request new data sources
							</MenuItem>
							<MenuItem value="Ask a question">Ask a question</MenuItem>
							<MenuItem value="Request training or related materials">
								Request training or related materials
							</MenuItem>
							<MenuItem value="Submit a suggestion">Submit a suggestion</MenuItem>
							<MenuItem value="Other (please provide description below)">
								Other (please provide description below)
							</MenuItem>
						</Select>
					</FormControl>
					<TextField
						onFocus={() => setEmailTextFocus(true)}
						onBlur={() => setEmailTextFocus(false)}
						variant="outlined"
						error={emailError}
						style={{ margin: '0 0 0 20px', width: '700px' }}
						placeholder="Entering your email address will help us respond directly to you!"
						value={userEmail}
						onChange={(e) => handleEmailChange(e.target.value)}
						helperText={
							emailError && !emailTextFocus
								? 'Please enter a valid email address.'
								: ''
						}
					/>
				</div>

				<FormControl style={{ width: '95%', margin: '20px 20px 10px 20px' }}>
					<TextField
						variant="outlined"
						placeholder="Provide feedback here..."
						multiline
						rows={textFieldHeight / textFieldRowHeight}
						width="75%"
						value={feedbackText}
						onChange={(e) => handleTextChange(e.target.value)}
					/>
				</FormControl>
				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						marginLeft: '20px',
						marginRight: '2em',
						width: '95%',
					}}
				>
					<GCButton
						id={'feedbackClose'}
						onClick={closeModal}
						style={buttonStyle}
						isSecondaryBtn={true}
					>
						Close
					</GCButton>
					<GCButton
						id={'feedbackSubmit'}
						disabled={feedbackText === '' || emailError ? true : false}
						onClick={() => handleSubmit()}
						style={{ margin: '10px' }}
					>
						Submit
					</GCButton>
				</div>
			</>
		);
	};

	return (
		<Modal
			isOpen={state.showFeedbackModal}
			onRequestClose={closeModal}
			className="feedback-modal"
			overlayClassName="feedback-modal-overlay"
			id="feedback-modal"
			closeTimeoutMS={300}
			style={{
				margin: 'auto',
				marginTop: '30px',
				minWidth: '80%',
				maxWidth: '90%',
				display: 'flex',
				flexDirection: 'column',
				border: '1px solid gray',
				boxShadow: '1px 1px gray',
				borderRadius: '2px',
			}}
		>
			{!successFlag && !errorFlag && !loading && renderForm()}
			{errorFlag && renderError()}
			{successFlag && renderSuccess()}
			{loading && renderLoading()}
		</Modal>
	);
}

UserFeedback.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			showFeedbackModal: PropTypes.bool,
			screenShot: PropTypes.string,
		}),
		dispatch: PropTypes.func,
	}),
};
