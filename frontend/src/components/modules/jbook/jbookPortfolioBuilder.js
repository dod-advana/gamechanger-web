import React, { useState, useEffect } from 'react';
import { styles } from '../../../components/admin/util/GCAdminStyles';
import GCButton from '../../common/GCButton';
import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import styled from 'styled-components';
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
	const [modalData, setModalData] = useState({});

	let [init, setInit] = useState(false);

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
							<GCButton
								onClick={() => {
									setModalData(portfolio);
									setShowModal(true);
								}}
							>
								Edit
							</GCButton>
						</div>
						<div>
							<GCButton onClick={() => {}}>Delete</GCButton>
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
		</>
	);
};

export default PortfolioBuilder;
