import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { Error, Warning, Check as Success, Info } from '@material-ui/icons';

export const NOTIFICATION_LEVELS = ['default', 'warning', 'error', 'success'];

const getColors = (level) => {
	switch (level) {
		case 'error':
			return {
				border: '#AD0000',
				background: '#FFC8C8',
			};
		case 'warning':
			return {
				border: '#F5A622',
				background: '#FFE8AF',
			};
		case 'success':
			return {
				border: '#13A792',
				background: '#C3FFF7',
			};
		default:
			return {
				border: '#1C2D65',
				background: '#AFC2FF',
			};
	}
};

const getIcon = (level) => {
	switch (level) {
		case 'error':
			return Error;
		case 'warning':
			return Warning;
		case 'success':
			return Success;
		default:
			return Info;
	}
};

export const NotificationWrapper = styled.div`
	margin-top: 1px;
	width: 100%;
	height: 50px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-width: 1px;
	border-style: solid;
	font-weight: bold;
	border-radius: 4px;
	box-sizing: border-box;

	border-color: ${({ level }) => getColors(level).border};
	background-color: ${({ level }) => getColors(level).background};

	${({ hidden }) =>
		hidden &&
		css`
			display: none;
		`};
`;

const IconWrapper = styled.div`
	width: 50px;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	color: #ffffff;

	background-color: ${({ level }) => getColors(level).border};
`;

const CloseButton = styled.button`
	background-color: #f5f5f5;
	height: 100%;
	width: 50px;
	border-width: 0;
	border-top-right-radius: inherit;
	border-bottom-right-radius: inherit;
`;

const Notification = ({ level = 'default', message, dismissFunc }) => {
	const Icon = getIcon(level);
	return (
		<NotificationWrapper level={level}>
			<IconWrapper level={level}>
				<Icon fontSize="large" />
			</IconWrapper>

			<div>{message}</div>

			{dismissFunc ? (
				<CloseButton onClick={dismissFunc}> X </CloseButton>
			) : (
				<CloseButton disabled={true}> X </CloseButton>
			)}
		</NotificationWrapper>
	);
};

Notification.propTypes = {
	level: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	dismissFunc: PropTypes.func,
};

export default Notification;
