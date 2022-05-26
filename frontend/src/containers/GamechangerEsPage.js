import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import GameChangerAPI from '../components/api/gameChanger-service-api';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';

const styles = {
	splitScreen1: {
		width: '100%',
		height: '50%',
	},
	splitScreen2: {
		width: '100%',
		height: '40%',
	},
};

const setUserMatomo = (value) => {
	localStorage.setItem('userMatomo', value);
};

const GCFooter = LoadableVisibility({
	loader: () => import('../components/navigation/GCFooter'),
	loading: () => {
		return (
			<div
				style={{
					display: 'flex',
					height: '90px',
					width: '100%',
					backgroundColor: 'black',
				}}
			/>
		);
	},
});

const GamechangerEsPage = ({ location }) => {
	const gameChangerApi = new GameChangerAPI();

	const [query, setQuery] = useState('');
	const [results, setResults] = useState('No results');
	const [loading, setLoading] = useState(false);
	const [esClient, setEsClient] = useState('gamechanger');

	const handleSubmit = async () => {
		setLoading(true);
		let results = 'No results';
		try {
			results = await gameChangerApi.queryEs({ query, esClient });
		} catch (e) {
			results = e;
		}
		setResults(results);
		setLoading(false);
	};

	const handleQueryChange = (e) => {
		setQuery(e.target.value);
	};

	const handleClientChange = (e) => {
		setEsClient(e.target.value);
	};

	return (
		<div style={{ minHeight: 'calc(100vh - 30px)', display: 'flex', flexDirection: 'column' }}>
			<div style={{ minHeight: 800, width: '100%', flexGrow: 1 }}>
				<div style={styles.splitScreen1}>
					<TextField
						style={{ width: '100%' }}
						label={'Query'}
						multiline
						rows={13}
						maxRows={13}
						value={query}
						onChange={handleQueryChange}
						disableUnderline={true}
						inputProps={{ style: { fontSize: 12, fontFamily: 'Noto Sans' } }}
					/>
					{!loading ? (
						<Button
							variant="contained"
							onClick={() => {
								handleSubmit();
							}}
						>
							Submit
						</Button>
					) : (
						<p>Querying...</p>
					)}
					{Permissions.allowGCClone('eda') && !loading ? (
						<Select
							value={esClient}
							style={{ marginLeft: 30 }}
							inputProps={{ style: { fontSize: 10, fontFamily: 'Noto Sans' } }}
							onChange={handleClientChange}
						>
							<MenuItem
								value={'gamechanger'}
								inputProps={{ style: { fontSize: 10, fontFamily: 'Noto Sans' } }}
							>
								gamechanger
							</MenuItem>
							<MenuItem value={'eda'} inputProps={{ style: { fontSize: 10, fontFamily: 'Noto Sans' } }}>
								eda
							</MenuItem>
						</Select>
					) : (
						''
					)}
				</div>
				<div
					style={{
						...styles.splitScreen2,
						fontFamily: 'Noto Sans',
						fontSize: 12,
					}}
				>
					<pre>{JSON.stringify(results, null, 2)}</pre>
				</div>
			</div>
			<GCFooter setUserMatomo={setUserMatomo} location={location} cloneName="gamechanger-es" />
		</div>
	);
};

export default GamechangerEsPage;
