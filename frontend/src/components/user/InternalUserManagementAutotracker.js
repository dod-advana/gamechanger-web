import React, { useState, useEffect } from 'react';
import GameChangerAPI from '../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();

export default () => {
	const [message, setMessage] = useState(
		`Adding you to internal user ID tracking...`
	);

	const handleTrackUser = async () => {
		try {
			const {
				data: { id, username },
			} = await gameChangerAPI.addInternalUser({ trackByRequest: true });
			setMessage(
				`You're identified as an internal user now.  Table ID # ${id} - hash: ${username}`
			);
		} catch (e) {
			const { response = {} } = e;
			const { data } = response;
			const msg = data ? data : e.message;
			setMessage(`Error adding internal user:  ${msg}`);
		}
	};

	useEffect(() => {
		handleTrackUser();
	}, []);

	return (
		<div
			style={{
				marginTop: '100px',
				minHeight: 'calc(100% - 89px)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				fontSize: '30px',
			}}
		>
			{message}
			{
				<a href="#/gamechanger" style={{ marginTop: '20px' }}>
					GAMECHANGER HOME
				</a>
			}
		</div>
	);
};
