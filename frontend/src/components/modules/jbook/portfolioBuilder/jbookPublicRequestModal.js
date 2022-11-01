import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import GCButton from '../../../common/GCButton';
import { styles, useStyles } from '../../../admin/util/GCAdminStyles';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import GameChangerAPI from '../../../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();

/**
 *
 * @class UserModal
 */
export default ({ showModal, setShowModal, userMap, user, privatePortfolios }) => {
	const classes = useStyles();
	const emptyData = {
		creator: user.id,
		portfolioName: '',
		justification: '',
	};
	const [data, setData] = useState(emptyData);

	const closeModal = () => {
		setShowModal(false);
		setData(emptyData);
	};

	const handleDataChange = (val, key) => {
		const newData = { ...data };
		newData[key] = val;
		console.log(val);
		setData(newData);
	};

	return (
		<>
			<Dialog
				open={showModal}
				scroll={'paper'}
				maxWidth="sm"
				disableEscapeKeyDown
				disableBackdropClick
				classes={{
					paperWidthSm: classes.dialogSm,
				}}
			>
				<DialogTitle>
					<div style={{ display: 'flex', width: '100%' }}>
						<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>
							Public Portfolio Request
						</Typography>
					</div>
					<IconButton
						aria-label="close"
						style={{
							position: 'absolute',
							right: '0px',
							top: '0px',
							height: 60,
							width: 60,
							color: 'black',
							backgroundColor: styles.backgroundGreyLight,
							borderRadius: 0,
						}}
						onClick={closeModal}
					>
						<CloseIcon style={{ fontSize: 30 }} />
					</IconButton>
				</DialogTitle>
				<DialogContent style={{ height: 250, padding: '8px 5px' }}>
					<div style={{ margin: '0 20px' }}>
						<Grid container>
							<Grid item xs={12}>
								<div>
									Creator:{' '}
									{(userMap[data.creator] ? userMap[data.creator].first_name : '') +
										' ' +
										(userMap[data.creator] ? userMap[data.creator].last_name : '')}
								</div>
								<Autocomplete
									style={{ width: '100%', backgroundColor: 'white', marginTop: '10px' }}
									label="Portfolio Name"
									id="margin-dense"
									variant="outlined"
									options={privatePortfolios}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Portfolio List"
											data-cy="jbook-private-portfolio"
											variant="outlined"
										/>
									)}
									onChange={(_event, newValue) => handleDataChange(newValue, 'portfolioName')}
									className={classes.textField}
									margin="dense"
								/>

								<TextField
									style={{ width: '100%', backgroundColor: 'white', marginTop: '10px' }}
									label="Justification"
									id="margin-dense"
									variant="outlined"
									defaultValue={null}
									onChange={(event) => handleDataChange(event.target.value, 'justification')}
									className={classes.textField}
									margin="dense"
									multiline
									rows={4}
								/>
							</Grid>
						</Grid>
					</div>
				</DialogContent>
				<DialogActions>
					<GCButton onClick={closeModal} style={{ margin: '10px' }} buttonColor={'#8091A5'}>
						Close
					</GCButton>
					<GCButton
						onClick={async () => {
							await gameChangerAPI.callDataFunction({
								functionName: 'submitPublicPortfolioRequest',
								cloneName: 'jbook',
								options: data,
							});
							closeModal();
						}}
						style={{ margin: '10px', backgroundColor: '#1C2D64', borderColor: '#1C2D64' }}
					>
						Submit
					</GCButton>
				</DialogActions>
			</Dialog>
		</>
	);
};
