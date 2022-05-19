import React, { useState, useEffect } from 'react';
import { styles, useStyles } from '../../../admin/util/GCAdminStyles';
import GCButton from '../../../common/GCButton';
// import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@material-ui/core';

import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

import JbookPortfolioModal from './jbookPortfolioModal';

import GameChangerAPI from '../../../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();

const portfolioStyles = {
	portfolio: {
		border: '2px solid rgb(209, 215, 220)',
		padding: '20px',
		borderRadius: '10px',
		margin: '10px 35px 0 0',
		width: '400px',
	},
	portfolioHeader: {
		fontSize: '1.5em',
		paddingBottom: '10px',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
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
	const [deleteID, setDeleteID] = useState(-1);
	const [modalData, setModalData] = useState({});
	const [userList, setUserList] = useState([]);
	const [userMap, setUserMap] = useState({});
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

	useEffect(() => {
		const getUserData = async () => {
			const data = await gameChangerAPI.getUserData('jbook');
			setUserList(data.data.users);
			const newMap = {};
			data.data.users.forEach((user) => {
				newMap[user.id] = user;
			});
			setUserMap(newMap);
		};

		if (!init) {
			getUserData();
			setInit(true);
		}
	}, [init, setInit, userList, setUserList]);

	const listPortfolios = (pList) => {
		let portfolios = pList.map((portfolio) => {
			return (
				<div style={portfolioStyles.portfolio} key={portfolio.id}>
					<div style={portfolioStyles.portfolioHeader}>
						<Typography variant="h5" display="inline" style={{ fontWeight: 600 }}>
							{portfolio.name}
						</Typography>
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
									setDeleteID(portfolio.id);
									setDeleteModal(true);
								}}
							>
								<CancelIcon style={{ fontSize: 30 }} />
							</IconButton>
						</div>
					</div>
					<div style={{ fontSize: '.8em' }}>{portfolio.description}</div>
					<hr />
					<div style={portfolioStyles.portfolioHeader}>
						{' '}
						<Typography variant="h5" display="inline" style={{ fontWeight: 600 }}>
							People with Access
						</Typography>
					</div>
					<div style={portfolioStyles.pillbox}>
						{portfolio.user_ids.length === 0 &&
							(portfolio.name === 'AI Inventory' ? '(All JBOOK users)' : '(none)')}
						{portfolio.user_ids.map((user, index) => {
							return (
								<Pill>
									<div style={{ marginRight: '5px', marginLeft: '5px' }}>
										{userMap[user].first_name + ' ' + userMap[user].last_name}
									</div>
								</Pill>
							);
						})}
					</div>
					<hr />
					<div style={portfolioStyles.portfolioHeader}>
						<Typography variant="h5" display="inline" style={{ fontWeight: 600 }}>
							Associated Tags
						</Typography>
					</div>
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
						<div>
							Rapidly discover and label all Program Elements/Budget Line Items related to a spend
							category by creating a Portfolio.
						</div>
						<div style={{ marginTop: 15 }}>
							Using the Portfolio Builder, users can:
							<ul>
								<li>Create a new portfolio</li>
								<li>Define a portfolio description</li>
								<li>Upload a portfolio ontology</li>
								<li>Create tags/labels for use within the portfolio</li>
								<li>Set user permissions</li>
								<li>View all portfolios</li>
							</ul>
						</div>
					</div>
					<div>
						<GCButton
							onClick={() => {
								setShowModal(true);
							}}
							style={{ minWidth: 'unset' }}
						>
							Create a New Portfolio
						</GCButton>
					</div>
				</div>
				<div style={{ display: 'flex', flexWrap: 'wrap', margin: '10px 80px' }}>
					{listPortfolios(portfolios)}
				</div>
			</div>
			<JbookPortfolioModal
				showModal={showModal}
				setShowModal={() => {
					setShowModal(false);
					setInit(false);
				}}
				modalData={modalData}
				userList={userList}
				userMap={userMap}
			/>
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
						onClick={async () => {
							const res = await gameChangerAPI.callDataFunction({
								functionName: 'deletePortfolio',
								cloneName: 'jbook',
								options: { id: deleteID },
							});
							setInit(false);
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
