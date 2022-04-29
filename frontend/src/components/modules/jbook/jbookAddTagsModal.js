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
import styled from 'styled-components';

import CheckIcon from '@mui/icons-material/Check';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@mui/icons-material/Search';

const Pill = styled.button`
	padding: 2px 10px 3px;
	border: none;
	border-radius: 15px;
	background-color: white;
	color: black;
	white-space: nowrap;
	text-align: center;
	display: inline-block;
	margin-left: 6px;
	margin-right: 6px;
	margin-bottom: 3px;
	border: 1px solid rgb(209, 215, 220);
	cursor: default !important;
	> i {
		margin-left: 3px;
		color: #e9691d;
	}
`;

/**
 *
 * @class Add Tags Modal
 */
export default ({ showModal, setShowModal, tagList, portfolioData, handleAddButton, renderSelectedTags }) => {
	const classes = useStyles();

	const [searchFilterText, setSearchFilterText] = useState('');

	const closeModal = () => {
		setShowModal(false);
	};

	const handleInput = (event) => {
		setSearchFilterText(event.target.value);
	};

	const renderTagsList = () => {
		let userDivs = [];

		if (portfolioData && tagList) {
			let filteredList = tagList;

			if (searchFilterText && searchFilterText.length > 0) {
				const regexString = `.*${searchFilterText}.*`;
				const regex = new RegExp(regexString, 'gi');
				filteredList = tagList.filter((user) => {
					let name = user.first_name + ' ' + user.last_name;
					return name.match(regex);
				});
			}

			for (const user of filteredList) {
				let added = portfolioData.user_ids.indexOf(user.id) !== -1;
				let style = {
					margin: '10px',
					minWidth: 60,
					backgroundColor: 'white',
					borderColor: '#757575',
					color: '#757575',
					borderWidth: '1px',
					padding: '0 10px',
				};

				if (added) {
					style.borderColor = '#2F4A7F';
					style.color = '#2F4A7F';
				}

				userDivs.push(
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Typography variant="h5" display="inline" style={{ fontWeight: 700 }}>
							{user.first_name}, {user.last_name}
						</Typography>
						<GCButton style={style} id={user.id} onClick={() => handleAddButton(user.id)}>
							{added ? <CheckIcon id={user.id} fontSize="large" style={{ marginRight: '7px' }} /> : ''}
							Add
						</GCButton>
					</div>
				);
			}
		}

		return userDivs;
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
								<OutlinedInput
									// value={[]}
									placeholder="Search Tags..."
									variant="outlined"
									style={{ backgroundColor: 'white', marginTop: '10px' }}
									startAdornment={
										<InputAdornment position="start">
											<SearchIcon />
										</InputAdornment>
									}
									onChange={handleInput}
								/>
								{/* <div style={{ margin: '20px 0 10px', minHeight: 35 }}>{renderSelectedUsers()}</div> */}
							</FormControl>
							<hr />
							<div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto', height: 320 }}>
								{/* {renderUsersList()} */}
							</div>
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
						closeModal();
					}}
					style={{ margin: '10px' }}
				>
					Generate
				</GCButton>
			</DialogActions>
		</Dialog>
	);
};
