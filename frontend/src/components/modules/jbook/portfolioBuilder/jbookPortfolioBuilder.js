import React, { useState, useEffect } from 'react';
import { styles } from '../../../admin/util/GCAdminStyles';
import GCButton from '../../../common/GCButton';
// import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import { Typography } from '@material-ui/core';

import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@mui/icons-material/Edit';

import JbookPortfolioModal from './jbookPortfolioModal';

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
	const [modalData, setModalData] = useState({});
	const [userList, setUserList] = useState([]);
	const [userMap, setUserMap] = useState({});
	const [user, setUser] = useState(null);
	let [init, setInit] = useState(false);

	useEffect(() => {
		const initFunction = async () => {
			const data = await gameChangerAPI.getUserData('jbook');
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
					console.log(data);

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

	const listPortfolios = (pList) => {
		let portfolios = pList.map((portfolio) => {
			return (
				<div style={portfolioStyles.portfolio} key={portfolio.id}>
					<div style={portfolioStyles.portfolioHeader}>
						<Typography variant="h5" display="inline" style={{ fontWeight: 600 }}>
							{portfolio.name}
						</Typography>
						<div>
							{(portfolio.admins.find((item) => item === user.id) !== undefined ||
								portfolio.creator === user.id) && (
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
							)}
						</div>
					</div>
					<div style={{ fontSize: '.8em' }}>{portfolio.description}</div>
					<div style={{ fontSize: '.8em', fontweight: 'bold' }}>
						Creator:{' '}
						{(userMap[portfolio.creator] ? userMap[portfolio.creator].first_name : '') +
							' ' +
							(userMap[portfolio.creator] ? userMap[portfolio.creator].last_name : '')}
					</div>
					<hr />
					<div style={portfolioStyles.portfolioHeader}>
						{' '}
						<Typography variant="h5" display="inline" style={{ fontWeight: 600 }}>
							Administrators
						</Typography>
					</div>
					<div style={portfolioStyles.pillbox}>
						{portfolio.user_ids.length === 0 &&
							(portfolio.name === 'AI Inventory' ? '(All JBOOK users)' : '(none)')}
						{portfolio.admins.map((user, index) => {
							return (
								<Pill>
									<div style={{ marginRight: '5px', marginLeft: '5px' }}>
										{(userMap[user] ? userMap[user].first_name : '') +
											' ' +
											(userMap[user] ? userMap[user].last_name : '')}
									</div>
								</Pill>
							);
						})}
					</div>
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
										{(userMap[user] ? userMap[user].first_name : '') +
											' ' +
											(userMap[user] ? userMap[user].last_name : '')}
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
					{user && (
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
			{user && (
				<JbookPortfolioModal
					showModal={showModal}
					setShowModal={() => {
						setShowModal(false);
						setInit(false);
					}}
					modalData={modalData}
					userList={userList}
					userMap={userMap}
					user={user}
				/>
			)}
		</>
	);
};

export default PortfolioBuilder;
