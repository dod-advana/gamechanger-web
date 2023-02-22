import React, { useState, useEffect, useCallback } from 'react';
import FormData from 'form-data';
import { styles, useStyles } from '../../../admin/util/GCAdminStyles';
import GCButton from '../../../common/GCButton';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@material-ui/core';
import DragAndDrop from '../../../common/DragAndDrop';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import JbookPortfolioModal from './jbookPortfolioModal';
import JbookPublicRequestModal from './jbookPublicRequestModal';

import GameChangerAPI from '../../../api/gameChanger-service-api';
import GameChangerUserAPI from '../../../api/GamechangerUserManagement';

const gameChangerAPI = new GameChangerAPI();
const gameChangerUserAPI = new GameChangerUserAPI();

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
	const [publicPortfolios, setPublicPortfolios] = useState([]);
	const [privatePortfolios, setPrivatePortfolios] = useState([]);

	const [showModal, setShowModal] = useState(false);
	const [showPublicModal, setShowPublicModal] = useState(false);
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);

	const [selectedFile, setSelectedFile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState(null);

	const [deleteID, setDeleteID] = useState(-1);
	const [modalData, setModalData] = useState({});
	const [userList, setUserList] = useState([]);
	const [userMap, setUserMap] = useState({});
	const [user, setUser] = useState(null);
	let [init, setInit] = useState(false);
	const classes = useStyles();

	useEffect(() => {
		const initFunction = async () => {
			const data = await gameChangerAPI.getPublicUserData('jbook');
			setUserList(data.data.users);
			const newMap = {};
			data.data.users.forEach((user) => {
				newMap[user.id] = user;
			});
			setUserMap(newMap);

			const currentUserData = await gameChangerUserAPI.getUserProfileData();
			setUser(currentUserData.data);
			gameChangerAPI
				.callDataFunction({
					functionName: 'getPortfolios',
					cloneName: 'jbook',
					options: {
						id: currentUserData.data.id,
					},
				})
				.then((data) => {
					const alphaSort = (a, b) => {
						const nameA = a.name.toUpperCase(); // ignore upper and lowercase
						const nameB = b.name.toUpperCase(); // ignore upper and lowercase
						if (nameA < nameB) {
							return -1;
						}
						if (nameA > nameB) {
							return 1;
						}
						// names must be equal
						return 0;
					};

					let publicData = data.data ? data.data.publicPortfolios : [];
					publicData.sort(alphaSort);
					let privatePortfolios = data.data ? data.data.privatePortfolios : [];
					privatePortfolios.sort(alphaSort);
					setPublicPortfolios(publicData);
					setPrivatePortfolios(privatePortfolios);
				});
		};

		if (!init) {
			initFunction();
			setInit(true);
		}
	}, [init, setInit, setUser, userList, setUserList, setPublicPortfolios, setPrivatePortfolios, userMap]);

	// is user admin?
	const isAdmin = user?.extra_fields?.jbook?.is_admin || false;
	// helper function for listportfolio
	const getName = (id) => {
		if (userMap[id]) {
			return `${userMap[id].first_name} ${userMap[id].last_name}`;
		}
		return '';
	};

	// helper function for listportfolio
	const renderUsers = (users) => {
		const portfolioUsers = [];
		for (let user of users) {
			if (getName(user) !== '') {
				portfolioUsers.push(
					<Pill>
						<div style={{ marginRight: '5px', marginLeft: '5px' }}>{getName(user)}</div>
					</Pill>
				);
			}
		}

		return portfolioUsers;
	};

	// helper function for listportfolio
	const getTags = (tags) => {
		let portfolioTags = '(none)';
		if (tags.length > 0) {
			portfolioTags = tags.map((tag, index) => {
				return (
					<Pill key={tag}>
						<div style={{ marginRight: '5px', marginLeft: '5px', height: '1.5em' }}>{tag}</div>
					</Pill>
				);
			});
		}

		return portfolioTags;
	};

	const listPortfolios = (pList) => {
		let portfolios = pList.map((portfolio) => {
			const portfolioAdmins = [];
			for (let user of portfolio.admins) {
				if (getName(user) !== '') {
					portfolioAdmins.push(
						<Pill>
							<div style={{ marginRight: '5px', marginLeft: '5px' }}>{getName(user)}</div>
						</Pill>
					);
				}
			}

			let editIcon =
				portfolio.admins.find((item) => item === user.id) !== undefined || portfolio.creator === user.id;

			let userText = renderUsers(portfolio.user_ids);
			if (!portfolio.isPrivate) {
				userText = '(All JBOOK users)';
			} else if (portfolio.user_ids.length === 0) {
				userText = '(none)';
			}

			return (
				<div style={portfolioStyles.portfolio} key={portfolio.id}>
					<div style={portfolioStyles.portfolioHeader}>
						<Typography variant="h5" display="inline" style={{ fontWeight: 600 }}>
							{portfolio.name}
						</Typography>
						<div>
							{editIcon && (
								<>
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
								</>
							)}
						</div>
					</div>
					<div style={{ fontSize: '.8em' }}>{portfolio.description}</div>
					<div style={{ fontSize: '.8em', fontweight: 'bold' }}>
						Creator:{' ' + getName(portfolio.creator)}
					</div>
					<hr />
					<div style={portfolioStyles.portfolioHeader}>
						{' '}
						<Typography variant="h5" display="inline" style={{ fontWeight: 600 }}>
							Administrators
						</Typography>
					</div>
					<div style={portfolioStyles.pillbox}>
						{portfolio.admins.length === 0 && '(none)'}
						{portfolioAdmins}
					</div>
					<hr />
					<div style={portfolioStyles.portfolioHeader}>
						{' '}
						<Typography variant="h5" display="inline" style={{ fontWeight: 600 }}>
							People with Access
						</Typography>
					</div>
					<div style={portfolioStyles.pillbox}>{userText}</div>
					<hr />
					<div style={portfolioStyles.portfolioHeader}>
						<Typography variant="h5" display="inline" style={{ fontWeight: 600 }}>
							Associated Tags
						</Typography>
					</div>
					<div style={portfolioStyles.pillbox}>{getTags(portfolio.tags)}</div>
					{portfolio.name === 'AI Inventory' && (
						<>
							<hr />
							<div style={{ marginTop: '20px' }}>
								{isAdmin && (
									<GCButton
										key="bulkUpload"
										onClick={() => {
											setShowUploadModal(true);
											setModalData(portfolio);
										}}
										style={{ minWidth: 'unset' }}
									>
										Bulk Upload
									</GCButton>
								)}
							</div>
						</>
					)}
				</div>
			);
		});

		return portfolios;
	};

	const onDrop = useCallback(
		(acceptedFiles) => {
			if (acceptedFiles.length === 1) {
				const [file] = acceptedFiles;
				setSelectedFile(file);
			}
		},
		[setSelectedFile]
	);

	const showModalCallback = useCallback(() => {
		setShowModal(true);
	}, []);

	const closeModalCallback = useCallback(() => {
		setShowModal(false);
		setInit(false);
	}, []);

	const showPublicCallback = useCallback(() => {
		setShowPublicModal(true);
	}, []);

	const closePublicCallback = useCallback(() => {
		setShowPublicModal(false);
	}, []);

	const closeDeleteCallback = useCallback(() => {
		setDeleteModal(false);
	}, []);

	const deleteCallback = useCallback(async () => {
		await gameChangerAPI.callDataFunction({
			functionName: 'deletePortfolio',
			cloneName: 'jbook',
			options: { id: deleteID },
		});
		setInit(false);
		setDeleteModal(false);
	}, [deleteID]);

	const closeUploadModal = useCallback(() => {
		setShowUploadModal(false);
		setSelectedFile(null);
		setResults(null);
		setLoading(false);
	}, []);

	const uploadCallback = useCallback(async () => {
		const form = new FormData();
		form.append('file', selectedFile, selectedFile.name);
		form.append('functionName', 'bulkUpload');
		form.append('cloneName', 'jbook');
		form.append('options', JSON.stringify({ portfolio: modalData }));
		setLoading(true);
		const uploadResponse = await gameChangerAPI.callUploadFunction(form, {
			headers: form.getHeaders ? form.getHeaders() : { 'Content-Type': 'multipart/form-data' },
		});
		setResults(uploadResponse.data);
		setLoading(false);
	}, [selectedFile, modalData]);

	return (
		<>
			<div
				style={{
					width: '100%',
					padding: '15px 22px 15px 30px',
					minHeight: 'calc(100vh - 245px)',
				}}
			>
				<div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '5px' }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 80px' }}></div>
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
									{/* <li>Upload a portfolio ontology</li> */}
									<li>Create tags/labels for use within the portfolio</li>
									<li>Set user permissions</li>
									<li>View my portfolios</li>
								</ul>
							</div>
						</div>
						{user && (
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<GCButton
									onClick={showModalCallback}
									style={{ minWidth: 'unset', marginBottom: '10px' }}
								>
									Create a New Portfolio
								</GCButton>
								<GCButton onClick={showPublicCallback} style={{ minWidth: 'unset' }}>
									Public Portfolio Request
								</GCButton>
							</div>
						)}
					</div>
					<div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 80px' }}>
						<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>Public Portfolios</p>
					</div>
					<div style={{ display: 'flex', flexWrap: 'wrap', margin: '10px 80px' }}>
						{listPortfolios(publicPortfolios)}
					</div>
					<div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 80px' }}>
						<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>Private Portfolios</p>
					</div>
					<div style={{ display: 'flex', flexWrap: 'wrap', margin: '10px 80px' }}>
						{listPortfolios(privatePortfolios)}
					</div>
				</div>
			</div>
			{user && (
				<>
					<JbookPortfolioModal
						showModal={showModal}
						setShowModal={closeModalCallback}
						modalData={modalData}
						userList={userList}
						userMap={userMap}
						user={user}
					/>
					<JbookPublicRequestModal
						showModal={showPublicModal}
						setShowModal={closePublicCallback}
						userMap={userMap}
						user={user}
						privatePortfolios={privatePortfolios.map((item) => item.name)}
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
								onClick={closeDeleteCallback}
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
								onClick={closeDeleteCallback}
								style={{ margin: '10px' }}
								buttonColor={'#8091A5'}
							>
								Cancel
							</GCButton>
							<GCButton id={'editReviewerSubmit'} onClick={deleteCallback} style={{ margin: '10px' }}>
								Delete
							</GCButton>
						</DialogActions>
					</Dialog>
					<Dialog
						open={showUploadModal}
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
									Bulk upload
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
								onClick={closeUploadModal}
							>
								<CloseIcon style={{ fontSize: 30 }} />
							</IconButton>
						</DialogTitle>
						<DialogContent>
							<Typography style={{ fontFamily: 'Montserrat', fontSize: 16 }}>
								Upload Excel Document
							</Typography>

							{results === null && (
								<DragAndDrop
									text="Drag and drop a file here, or click to select a file (.xlsx files only)"
									acceptedFileTypes={[
										'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
										'application/vnd.ms-excel',
									]}
									handleFileDrop={onDrop}
								/>
							)}

							<Typography style={{ fontFamily: 'Montserrat', fontSize: 16 }}>
								Selected File: {selectedFile !== null ? selectedFile.name : 'None Selected'}
								{loading && ' Loading...'}
								{loading && <CircularProgress size={'20px'} />}
							</Typography>

							{results !== null && (
								<>
									<Typography style={{ fontFamily: 'Montserrat', fontSize: 16 }}>Results</Typography>
									<ul>
										<li>Rows Written: {results.written}</li>
										<li>
											Row numbers with multiple reviews found:{' '}
											{results.dupes.length === 0 ? 'None' : JSON.stringify(results.dupes)}
										</li>
										<li>
											Failed Row Numbers:{' '}
											{results.failedRows.length === 0
												? 'None'
												: JSON.stringify(results.failedRows)}
										</li>
									</ul>
								</>
							)}
						</DialogContent>
						<DialogActions>
							<GCButton
								id={'editReviewerClose'}
								onClick={closeUploadModal}
								style={{ margin: '10px' }}
								buttonColor={'#8091A5'}
							>
								{results === null ? 'Cancel' : 'Close'}
							</GCButton>
							<GCButton
								id={'uploadSubmit'}
								onClick={uploadCallback}
								disabled={selectedFile === null || results !== null}
								style={{ margin: '10px' }}
							>
								Upload
							</GCButton>
						</DialogActions>
					</Dialog>
				</>
			)}
		</>
	);
};

export default PortfolioBuilder;
