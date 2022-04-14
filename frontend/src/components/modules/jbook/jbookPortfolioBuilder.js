import React, { useState, useEffect } from 'react';
import { styles, useStyles } from '../../admin/util/GCAdminStyles';
import GCButton from '../../common/GCButton';
import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@material-ui/core';

import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

import JbookPortfolioModal from './jbookPortfolioModal';

import GameChangerAPI from '../../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();

const portfolioStyles = {
	portfolio: {
		border: '1px solid rgb(209, 215, 220)',
		padding: '10px',
		borderRadius: '10px',
		margin: '10px 20px',
		width: '400px',
	},
	portfolioHeader: {
		fontSize: '1.5em',
		paddingBottom: '20px',
		display: 'flex',
		justifyContent: 'space-between',
	},
	pillbox: {
		maxHeight: '100px',
		overflowY: 'auto',
	},
};

const Pill = styled.button`
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
 * @class PortfolioBuilder
 */
const PortfolioBuilder = (props) => {
	// State variables for the buttons
	const [portfolios, setPortfolios] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);
	const [modalData, setModalData] = useState({});

	let [init, setInit] = useState(false);
	const classes = useStyles();

	useEffect(() => {
		if (!init) {
			gameChangerAPI
				.callDataFunction({
					functionName: 'getPortfolios',
					cloneName: 'jbook',
					options: {},
				})
				.then((data) => {
					console.log(data);
					let pData = data.data !== undefined ? data.data : [];
					setPortfolios(pData);
				});
			setInit(true);
		}
	}, [init, setInit, portfolios, setPortfolios]);

	const listPortfolios = (pList) => {
		let portfolios = pList.map((portfolio) => {
			return (
				<div style={portfolioStyles.portfolio}>
					<div style={portfolioStyles.portfolioHeader}>
						<div>{portfolio.name}</div>
						<div>
							<IconButton
								aria-label="close"
								style={{
									height: 30,
									width: 30,
									color: 'grey',
									borderRadius: 0,
									marginRight: '10px',
								}}
								onClick={() => {
									setModalData(portfolio);
									setShowModal(true);
								}}
							>
								<EditIcon style={{ fontSize: 30 }} />
							</IconButton>
							<IconButton
								aria-label="close"
								style={{
									height: 10,
									width: 10,
									color: 'red',
									borderRadius: 0,
								}}
								onClick={() => {
									setDeleteModal(true);
								}}
							>
								<CancelIcon style={{ fontSize: 30 }} />
							</IconButton>
						</div>
					</div>
					<div style={{ fontSize: '.8em' }}>{portfolio.description}</div>
					<hr />
					<div style={portfolioStyles.portfolioHeader}>People With Access</div>
					<div style={portfolioStyles.pillbox}>
						{portfolio.user_ids.length === 0 &&
							(portfolio.name === 'AI Inventory' ? '(All JBOOK users)' : '(none)')}
						{portfolio.user_ids.map((user, index) => {
							return (
								<Pill>
									<div style={{ marginRight: '5px', marginLeft: '5px' }}>{user}</div>
								</Pill>
							);
						})}
					</div>
					<hr />
					<div style={portfolioStyles.portfolioHeader}>Associated Tags</div>
					<div style={portfolioStyles.pillbox}>
						{portfolio.tags.length === 0 && '(none)'}
						{portfolio.tags.map((tag, index) => {
							return (
								<Pill>
									<div style={{ marginRight: '5px', marginLeft: '5px', height: '1.5em' }}>{tag}</div>
								</Pill>
							);
						})}
					</div>
				</div>
			);
		});

		return portfolios;
	};

	return (
		<>
			<div>
				<div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 80px' }}>
					<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>JBOOK Portfolio Builder</p>
				</div>
				<div
					style={{
						display: 'flex',
						margin: '10px 80px',
						justifyContent: 'space-evenly',
					}}
				>
					<div style={{ flex: 2 }}>
						{`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
						labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
						laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
						voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
						non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
            `}
					</div>
					<div style={{ flex: 1, display: 'flex', flexDirection: 'row-reverse' }}>
						<GCButton
							onClick={() => {
								setShowModal(true);
							}}
							style={{ minWidth: 'unset' }}
						>
							Create a New Portfolio
						</GCButton>
						<GCButton
							onClick={async () => {}}
							style={{
								minWidth: 'unset',
								backgroundColor: 'rgb(176, 186, 197)',
								borderColor: 'rgb(176, 186, 197)',
							}}
						>
							Delete a Portfolio
						</GCButton>
					</div>
				</div>
				<div style={{ display: 'flex', flexWrap: 'wrap', margin: '10px 80px' }}>
					{listPortfolios(portfolios)}
					{listPortfolios([
						{
							name: 'Portfolio 1',
							description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
              labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
              voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
							user_ids: [
								'User 1',
								'User 2 long ',
								'User 3 longer',
								'User 1 longest',
								'User 2',
								'User 3 long',
								'User 1',
								'User 2 longer',
								'User 3',
								'User 1 longest',
								'User 2',
								'User 3 even longer name',
							],
							tags: ['Tag 1', 'Tag 2', 'Tag 3'],
						},
						{
							name: 'Portfolio 2',
							description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
              labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.`,
							user_ids: ['User 1', 'User 2', 'User 3'],
							tags: ['Tag 1', 'Tag 2', 'Tag 3'],
						},
						{
							name: 'Portfolio 3',
							description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
              labore et dolore magna aliqua. Duis aute irure dolor in reprehenderit in
              voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
							user_ids: ['User 1', 'User 2', 'User 3'],
							tags: ['Tag 1', 'Tag 2', 'Tag 3'],
						},
						{
							name: 'Portfolio 4',
							description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
              labore et dolore magna aliqua. `,
							user_ids: ['User 1', 'User 2', 'User 3'],
							tags: ['Tag 1', 'Tag 2', 'Tag 3'],
						},
					])}
				</div>
			</div>
			<JbookPortfolioModal
				showModal={showModal}
				setShowModal={setShowModal}
				modalData={modalData}
			></JbookPortfolioModal>
			<Dialog
				open={deleteModal}
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
							Are you sure you want to delete this portfolio?
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
						onClick={() => {
							setDeleteModal(false);
						}}
					>
						<CloseIcon style={{ fontSize: 30 }} />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<Typography style={{ fontFamily: 'Montserrat', fontSize: 16 }}>
						This portolio will be immediately deleted. You cannot undo this action.
					</Typography>
				</DialogContent>
				<DialogActions>
					<GCButton
						id={'editReviewerClose'}
						onClick={() => {
							setDeleteModal(false);
						}}
						style={{ margin: '10px' }}
						buttonColor={'#8091A5'}
					>
						Cancel
					</GCButton>
					<GCButton
						id={'editReviewerSubmit'}
						onClick={() => {
							setDeleteModal(false);
						}}
						style={{ margin: '10px' }}
					>
						Delete
					</GCButton>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default PortfolioBuilder;
