import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import GameChangerAPI from '../api/gameChanger-service-api';

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
	const [internalUsernames, setInternalUsernames] = useState([]);

	const getInternalUsers = async () => {
		try {
			const { data = [] } = await gameChangerAPI.getInternalUsers();
			if (data.length === 0) {
				setErrorMessage('No tracked users found');
			} else {
				setErrorMessage('');
			}
			setInternalUsernames(data);
		} catch (e) {
			console.log(e);
			setErrorMessage('Error retrieving internal users');
		}
	};

	useEffect(() => {
		getInternalUsers();
	}, []);

	const [inputUsername, setInputUsername] = useState('');
	const handleInputUsernameChange = ({ target: { value } }) => {
		setInputUsername(value);
	};

	const [errorMessage, setErrorMessage] = useState('');

	const handleCreate = async (_, trackMe = false) => {
		try {
			const body = trackMe
				? { trackByRequest: true }
				: { username: inputUsername };
			await gameChangerAPI.addInternalUser(body);
			getInternalUsers();
			resetState();
		} catch (e) {
			const { response = {} } = e;
			const { data } = response;
			const msg = data ? data : e.message;
			setErrorMessage(`Error adding internal user: ${msg}`);
		}
	};

	const handleDelete = async (id) => {
		try {
			await gameChangerAPI.deleteInternalUser(id);
			setErrorMessage('');
		} catch (e) {
			setErrorMessage('Error deleting internal user');
		} finally {
			getInternalUsers();
		}
	};

	const resetState = () => {
		setErrorMessage('');
		setInputUsername('');
	};

	return (
		<PageWrapper>
			<Heading>Track Me</Heading>
			<ListWrapper>
				<button
					onClick={() => handleCreate(true)}
					style={{
						backgroundColor: 'teal',
						color: 'white',
						border: 'none',
						borderRadius: '6px',
					}}
				>
					Track Me
				</button>
			</ListWrapper>

			<div style={{ color: 'red', fontSize: '30px', margin: '10px 0 10px 0' }}>
				{errorMessage}
			</div>

			<Heading>Internal Users</Heading>
			<ListWrapper>
				<ListItem key="header">
					<div>ID</div>
					<div>Hashed Username</div>
					<div style={{ marginLeft: '50px' }}>Delete</div>
				</ListItem>
				{internalUsernames.map(({ id, username }) => {
					return (
						<ListItem key={id}>
							<div>{id}</div>
							<div>{username}</div>
							<DeleteButton onClick={() => handleDelete(id)}>
								Delete
							</DeleteButton>
						</ListItem>
					);
				})}
			</ListWrapper>

			<Heading>Track Manually</Heading>
			<ListWrapper>
				<CreateWrapper>
					<LabelStack style={{ flex: 1 }}>
						<label htmlFor="message-input" style={{ marginRight: '4px' }}>
							Manual Input
						</label>
						<input
							style={{ width: '100%' }}
							name="message-input"
							placeholder="Manually input username"
							value={inputUsername}
							onChange={handleInputUsernameChange}
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
					Add User
				</button>
			</ListWrapper>
		</PageWrapper>
	);
};
