import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { TextField, Typography } from '@material-ui/core';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCButton from '../../common/GCButton';
import { styles, useStyles } from '../util/GCAdminStyles';

const gameChangerAPI = new GameChangerAPI();

/**
 *
 * @class EditEsIndexModal
 */
export default ({ showEditESIndexModal, setShowEditESIndexModal }) => {
	const [esIndex, setEsIndex] = useState('');
	const [editEsIndex, setEditEsIndex] = useState('');
	const classes = useStyles();
	/**
	 *
	 * @param {*} setDefault
	 */
	const changeEsIndex = async (setDefault) => {
		try {
			if (setDefault) {
				await gameChangerAPI
					.setElasticSearchIndex('')
					.then(() => setEsIndex(''));
			} else {
				await gameChangerAPI.setElasticSearchIndex(editEsIndex).then(() => {
					setEsIndex(editEsIndex);
				});
			}
		} catch (e) {
			console.log(e);
		}
	};
	const getEsIndexFromRedis = async () => {
		try {
			const index = await gameChangerAPI.getElasticSearchIndex();
			setEsIndex(index.data);
		} catch (err) {
			console.log(err);
			console.log('Could not retrieve elasticsearch index from redis');
		}
	};

	useEffect(() => {
		getEsIndexFromRedis();
	}, []);
	return (
		<Modal
			isOpen={showEditESIndexModal}
			onRequestClose={() => setShowEditESIndexModal(false)}
			style={styles.esIndexModal}
		>
			<Typography
				variant="h2"
				style={{
					width: '100%',
					padding: '20px',
					paddingLeft: '20px',
					fontSize: '25px',
				}}
			>
				{'Change Elasticsearch Index'}
			</Typography>
			<div style={{ margin: '0 20px' }}>
				<div className={classes.root}>
					<Typography variant="h4" style={styles.modalHeaders}>
						Current Elasticsearch Index: {esIndex ? esIndex : 'Default Index'}
					</Typography>
					<TextField
						label="Elasticsearch Index"
						id="margin-dense"
						onBlur={(event) => setEditEsIndex(event.target.value)}
						className={classes.textField}
						helperText="Index To Change To."
						margin="dense"
					/>
				</div>
			</div>
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
					id={'esModalClose'}
					onClick={() => setShowEditESIndexModal(false)}
					style={{ margin: '10px' }}
					buttonColor={'#8091A5'}
				>
					Close
				</GCButton>
				<GCButton
					id={'esModalReset'}
					onClick={() => {
						changeEsIndex(true);
						setShowEditESIndexModal(false);
					}}
					style={{ margin: '10px' }}
					buttonColor={'#8091A5'}
				>
					Set to Default
				</GCButton>
				<GCButton
					id={'esModalSubmit'}
					onClick={() => {
						changeEsIndex(false);
						setShowEditESIndexModal(false);
					}}
					style={{ margin: '10px' }}
				>
					Submit
				</GCButton>
			</div>
		</Modal>
	);
};
