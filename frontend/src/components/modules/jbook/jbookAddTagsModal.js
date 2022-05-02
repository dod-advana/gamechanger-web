import React, { useState } from 'react';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	OutlinedInput,
	Typography,
	InputAdornment,
	FormControl,
} from '@material-ui/core';
import GCButton from '../../common/GCButton';
import { styles, useStyles } from '../../admin/util/GCAdminStyles';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

/**
 *
 * @class Add Tags Modal
 */
export default ({ showModal, setShowModal, portfolioData, handleAddTag, renderSelectedTags }) => {
	const classes = useStyles();

	const [newTagText, setNewTagText] = useState('');

	const closeModal = () => {
		setShowModal(false);
	};

	const handleInput = (event) => {
		setNewTagText(event.target.value);
	};

	const renderTagsList = () => {
		let tagDivs = [];

		let style = {
			margin: '10px',
			minWidth: 60,
			backgroundColor: 'white',
			borderColor: '#757575',
			color: '#757575',
			borderWidth: '1px',
			padding: '0 10px',
		};

		if (portfolioData) {
			let tags = portfolioData.tags;
			for (const index in tags) {
				let tag = tags[index];
				tagDivs.push(
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Typography variant="h5" display="inline" style={{ fontWeight: 700 }}>
							{tag}
						</Typography>
						<GCButton style={style} onClick={() => handleAddTag(tag, false)}>
							Delete
						</GCButton>
					</div>
				);
			}
		}

		return tagDivs;
	};

	console.log(portfolioData);

	return (
		<Dialog
			open={showModal}
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
						Add Tags
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
			<DialogContent style={{ height: 500, padding: '8px 5px', overflow: 'hidden' }}>
				<div style={{ margin: '0 20px' }}>
					<Grid
						container
						style={{ background: '#f2f2f2', borderRadius: 6, marginTop: 10, marginBottom: 10, padding: 10 }}
					>
						<Typography style={{ fontFamily: 'Montserrat', fontSize: 16 }}>
							Add or remove tags to this portfolio
						</Typography>
					</Grid>
					<Grid container>
						<Grid item xs={12}>
							<FormControl fullWidth className={classes.margin} variant="outlined">
								<div style={{ display: 'flex', alignItems: 'center' }}>
									<OutlinedInput
										placeholder="Add a new tag"
										variant="outlined"
										style={{ backgroundColor: 'white', height: 50, width: '100%' }}
										startAdornment={
											<InputAdornment position="start">
												<LocalOfferIcon />
											</InputAdornment>
										}
										onChange={handleInput}
										value={newTagText}
									/>
									<GCButton
										onClick={() => {
											handleAddTag(newTagText, true);
											setNewTagText('');
										}}
										style={{ margin: '0 0 0 10px', height: 50 }}
									>
										Add Tag
									</GCButton>
								</div>

								{/* <div style={{ margin: '20px 0 10px', minHeight: 35 }}>{renderSelectedUsers()}</div> */}
							</FormControl>
							<hr />
							<div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto', height: 320 }}>
								{renderTagsList()}
							</div>
						</Grid>
					</Grid>
				</div>
			</DialogContent>
			<DialogActions>
				<GCButton onClick={closeModal} style={{ margin: '10px' }} buttonColor={'#8091A5'}>
					Close
				</GCButton>
			</DialogActions>
		</Dialog>
	);
};
