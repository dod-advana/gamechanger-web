import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import GameChangerAPI from '../../api/gameChanger-service-api';
import { TextField, Typography } from '@material-ui/core';

const PageWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 10px;
`;

const ListWrapper = styled.div`
	display: flex;
	flex-direction: column;
	border: 2px solid grey;
	border-radius: 8px;
	width: 95%;
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

const gameChangerAPI = new GameChangerAPI();

export default () => {
	const [blacklist, setBlacklist] = useState([]);

	const getBlacklist = async () => {
		try {
			const { data = [] } = await gameChangerAPI.getTrendingBlacklist();
			setBlacklist(data);
		} catch (e) {}
	};

	useEffect(() => {
		getBlacklist();
	}, []);

	const [createEntry, setCreateEntry] = useState('');
	const handleEntryChange = (event) => {
		setCreateEntry(event.target.value);
	};

	const handleCreate = async () => {
		try {
			await gameChangerAPI.setTrendingBlacklist({ createEntry });
			console.log(createEntry);
			getBlacklist();
			resetState();
		} catch (e) {}
	};

	const handleDelete = async (searchText) => {
		try {
			console.log('deleting: ' + searchText);
			await gameChangerAPI.deleteTrendingBlacklist({ searchText });
			getBlacklist();
		} catch (e) {}
	};

	const resetState = () => {
		setCreateEntry('');
	};

	return (
		<PageWrapper>
			<Typography
				variant="h2"
				style={{ width: '100%', marginLeft: '20px', fontSize: '25px' }}
			>
				{'Edit Trending Blacklist'}
			</Typography>
			<div
				style={{ display: 'flex', flexDirection: 'row', marginBottom: '10px' }}
			>
				<TextField
					label="Blacklist Query"
					id="margin-dense"
					onBlur={(event) => handleEntryChange(event)}
					margin="dense"
				/>
				<button
					onClick={handleCreate}
					style={{
						backgroundColor: 'green',
						color: 'white',
						border: 'none',
						borderRadius: '6px',
						marginTop: '20px',
						marginLeft: '20px',
					}}
				>
					CREATE
				</button>
			</div>

			<ListWrapper>
				<ListItem key="header" style={{ alignItems: 'left' }}>
					<div style={{ width: '47%' }}>Query</div>
					<div style={{ width: '44%' }}>Added By</div>
					<div style={{ width: '9%', marginLeft: '1px' }}>Delete</div>
				</ListItem>
				{blacklist.map(({ search_text, added_by }) => {
					return (
						<ListItem key={search_text}>
							<div style={{ width: '50%' }}>{search_text}</div>
							<div style={{ width: '40%' }}>{added_by}</div>
							<DeleteButton
								style={{ width: '10%' }}
								onClick={() => handleDelete(search_text)}
							>
								Delete
							</DeleteButton>
						</ListItem>
					);
				})}
			</ListWrapper>
		</PageWrapper>
	);
};
