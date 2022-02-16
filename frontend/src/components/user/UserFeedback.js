import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { setState } from '../../utils/sharedFunctions';

Modal.setAppElement('#app');

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
	right: 20px;
	top: 20px;
`;

export default function UserFeedback(props) {
	const { state, dispatch } = props.context;

	const closeModal = () => {
		setState(dispatch, { showFeedbackModal: false });
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
						fontSize: '25px',
						marginBottom: 20
					}}
				>
					Help us improve your experience with feedback!
				</Typography>
				<Typography
					variant="body2"
					style={{
						width: '100%',
					}}
				>
					Our feedback form is currently undergoing some improvements. If you'd like to get in touch with us, please send us an email @ osd.pentagon.ousd-c.mbx.advana-gamechanger@mail.mil.
				</Typography>
			</>
		);
	};

	return (
		<Modal
			isOpen={state.showFeedbackModal}
			onRequestClose={closeModal}
			className="feedback-email-modal"
			overlayClassName="feedback-overlay"
			id="feedback-modal"
			closeTimeoutMS={300}
		>
			{renderForm()}
		</Modal>
	);
}

UserFeedback.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			showFeedbackModal: PropTypes.bool,
		}),
		dispatch: PropTypes.func,
	}),
};
