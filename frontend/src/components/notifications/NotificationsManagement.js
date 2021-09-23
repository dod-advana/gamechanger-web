import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import GameChangerAPI from '../api/gameChanger-service-api';
import Notification, { NOTIFICATION_LEVELS } from './Notification';

import { Switch } from '@material-ui/core';

const PageWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 30px;
`;

const ListWrapper = styled.div`
	display: flex;
	flex-direction: column;
	border: 2px solid grey;
	border-radius: 8px;
	width: 80%;
	padding: 20px;
`;

const ListItem = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;

	& > div {
		margin: 8px;
	}
`;

const DeleteButton = styled.button`
	background: firebrick;
	color: white;
	border-radius: 3px;
	border-color: black;
	margin-left: 50px;
`;

const Heading = styled.div`
	font-size: 30px;
	margin: 16px;
`;
const CreateWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px;
`;
const LabelStack = styled.div`
	display: flex;
	flex-direction: column;
	margin: 6px;
`;

const gameChangerAPI = new GameChangerAPI();

export default () => {
	const [notifications, setNotifications] = useState([]);

	const getNotifications = async () => {
		try {
			const { data = [] } = await gameChangerAPI.getNotifications();
			const active = data.reduce((acc, { id, active }) => {
				acc[id] = active;
				return acc;
			}, {});
			setActive(active);
			setNotifications(data);
			setErrorMessage('');
		} catch (e) {
			setErrorMessage('Error retrieving notifications');
		}
	};

	useEffect(() => {
		getNotifications();
	}, []);

	const [active, setActive] = React.useState({});
	const handleActiveChanged = async ({ target: { name, checked } }) => {
		try {
			await gameChangerAPI.editNotificationActive(name, checked);
			setActive({ ...active, [name]: checked });
		} catch (e) {
			setErrorMessage('Error changing notification active');
		}
	};

	const [createLevel, setCreateLevel] = useState('default');
	const handleLevelSelect = (event) => {
		setCreateLevel(event.target.value);
	};
	const [createMessage, setCreateMessage] = useState('');
	const handleMessageChange = (event) => {
		setCreateMessage(event.target.value);
	};

	const [createActive, setCreateActive] = useState(false);
	const handleCreateActiveChanged = (event) => {
		setCreateActive(event.target.checked);
	};

	const [errorMessage, setErrorMessage] = useState('');

	const handleCreate = async () => {
		try {
			await gameChangerAPI.createNotification({
				active: createActive,
				message: createMessage,
				level: createLevel,
			});
			getNotifications();
			resetState();
		} catch (e) {
			setErrorMessage('Error creating notification');
		}
	};

	const handleDelete = async (id) => {
		try {
			await gameChangerAPI.deleteNotification(id);
			getNotifications();
			setErrorMessage('');
		} catch (e) {
			setErrorMessage('Error deleting notification');
		}
	};

	const resetState = () => {
		setCreateActive(false);
		setCreateMessage('');
		setCreateLevel('default');
		setErrorMessage('');
	};

	return (
		<PageWrapper>
			<div style={{ color: 'red', fontSize: '30px' }}>{errorMessage}</div>

			<Heading>Current Notifications</Heading>
			<ListWrapper>
				<ListItem key="header">
					<div>ID</div>
					<div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
						Notification
					</div>
					<div>Active</div>
					<div style={{ marginLeft: '50px' }}>Delete</div>
				</ListItem>
				{notifications.map(({ id, level, message }) => {
					return (
						<ListItem key={id}>
							<div>{id}</div>
							<Notification
								level={level}
								message={message}
								key={level + message}
							/>
							<Switch
								name={id}
								checked={active[id]}
								onChange={handleActiveChanged}
							/>
							<DeleteButton onClick={() => handleDelete(id)}>
								Delete
							</DeleteButton>
						</ListItem>
					);
				})}
			</ListWrapper>

			<Heading>Create New</Heading>
			<ListWrapper>
				<Notification level={createLevel} message={createMessage} />

				<CreateWrapper>
					<LabelStack style={{ flex: 1 }}>
						<label htmlFor="message-input" style={{ marginRight: '4px' }}>
							Message
						</label>
						<input
							style={{ width: '100%' }}
							name="message-input"
							placeholder="Notification message"
							value={createMessage}
							onChange={handleMessageChange}
						/>
					</LabelStack>
					<LabelStack>
						<label htmlFor="level-select" style={{ marginRight: '4px' }}>
							Level
						</label>
						<select
							name="level-select"
							onChange={handleLevelSelect}
							value={createLevel}
						>
							{NOTIFICATION_LEVELS.map((level) => {
								return (
									<option
										key={level}
										value={level}
										style={{ textTransform: 'capitalize' }}
									>
										{level}
									</option>
								);
							})}
						</select>
					</LabelStack>
					<LabelStack>
						<label style={{ marginRight: '4px' }}>Active</label>
						<Switch
							checked={createActive}
							onChange={handleCreateActiveChanged}
						/>
					</LabelStack>
				</CreateWrapper>
				<button
					onClick={handleCreate}
					style={{
						backgroundColor: 'green',
						color: 'white',
						border: 'none',
						borderRadius: '6px',
					}}
				>
					CREATE
				</button>
			</ListWrapper>
		</PageWrapper>
	);
};
