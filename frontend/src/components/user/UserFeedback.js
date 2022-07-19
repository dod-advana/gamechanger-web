import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import html2canvas from 'html2canvas';
import EmailValidator from 'email-validator';
import { TextField, FormControl, Typography, MenuItem } from '@mui/material';
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import CloseIcon from '@material-ui/icons/Close';

import GCButton from '../common/GCButton';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator.js';
import GameChangerAPI from '../api/gameChanger-service-api';
import GCCloseButton from '../common/GCCloseButton';

import { setState } from '../../utils/sharedFunctions';

const gameChangerAPI = new GameChangerAPI();

Modal.setAppElement('#app');

const getHeight = () => window.innerHeight;

const buttonStyle = {
	margin: '10px',
};

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
		if (state.showFeedbackModal) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
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
			html2canvas(document.querySelector('#app')).then(async () => {
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
						filter: 'invert(26%) sepia(49%) saturate(1486%) hue-rotate(146deg) brightness(72%) contrast(103%)',
					}}
				/>

				<h1 style={{ marginTop: '50px', alignSelf: 'center' }}>Thank You! We appreciate the feedback.</h1>
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

	const emailLabel =
		!userEmail || userEmail === '' ? 'Entering your email address will help us respond directly to you!' : '';

	const renderForm = () => {
		return (
			<>
				<GCCloseButton onClick={closeModal}>
					<CloseIcon fontSize="large" />
				</GCCloseButton>
				<Typography
					variant="h2"
					sx={{
						width: '100%',
						p: '20px',
						fontSize: '25px',
					}}
				>
					User Feedback
				</Typography>
				<div style={{ display: 'flex', flexWrap: 'wrap' }}>
					<TextField
						id={'feedback-options'}
						select
						onChange={handleTypeChange}
						value={feedbackType}
						sx={{ width: '30%', m: '0 0 20px 20px' }}
						label={!feedbackType || feedbackType === '' ? 'Select feedback type...' : ''}
						InputLabelProps={{ shrink: false }}
					>
						<MenuItem value="Report a technical issue">Report a technical issue</MenuItem>
						<MenuItem value="Request new data sources">Request new data sources</MenuItem>
						<MenuItem value="Ask a question">Ask a question</MenuItem>
						<MenuItem value="Request training or related materials">
							Request training or related materials
						</MenuItem>
						<MenuItem value="Submit a suggestion">Submit a suggestion</MenuItem>
						<MenuItem value="Other (please provide description below)">
							Other (please provide description below)
						</MenuItem>
					</TextField>
					<TextField
						onFocus={() => setEmailTextFocus(true)}
						onBlur={() => setEmailTextFocus(false)}
						variant="outlined"
						error={emailError}
						sx={{ m: '0 75px 0 20px', width: '700px' }}
						placeholder="Entering your email address will help us respond directly to you!"
						value={userEmail}
						onChange={(e) => handleEmailChange(e.target.value)}
						helperText={emailError && !emailTextFocus ? 'Please enter a valid email address.' : ''}
						label={
							emailError && !emailTextFocus && userEmail === ''
								? 'Please enter a valid email address.'
								: emailLabel
						}
						InputLabelProps={{ shrink: false }}
					/>
				</div>

				<FormControl style={{ width: 'calc(100% - 40px)', margin: '20px 20px 10px 20px' }}>
					<TextField
						variant="outlined"
						placeholder="Provide feedback here..."
						multiline
						rows={textFieldHeight / textFieldRowHeight}
						width="75%"
						value={feedbackText}
						onChange={(e) => handleTextChange(e.target.value)}
						label={!feedbackText || feedbackText === '' ? 'Provide feedback here...' : ''}
						InputLabelProps={{ shrink: false, disabled: true }}
					/>
				</FormControl>
				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						width: '100%',
					}}
				>
					<GCButton id={'feedbackClose'} onClick={closeModal} style={buttonStyle} isSecondaryBtn={true}>
						Close
					</GCButton>
					<GCButton
						id={'feedbackSubmit'}
						disabled={feedbackText === '' || emailError ? true : false}
						onClick={() => handleSubmit()}
						style={{ margin: '10px 20px 20px 10px' }}
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
			id="feedback-modal"
			closeTimeoutMS={300}
			style={{
				overlay: {
					backgroundColor: 'rgb(0,0,0,0.5)',
					zIndex: 9999,
				},
				content: {
					margin: '30px auto auto',
					height: 'fit-content',
					boxShadow:
						'0px 11px 15px -7px rgb(0 0 0 / 20%), 0px 24px 38px 3px rgb(0 0 0 / 14%), 0px 9px 46px 8px rgb(0 0 0 / 12%)',
					borderRadius: '4px',
				},
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
