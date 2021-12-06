import React, { useState, useEffect } from 'react';
import { Link, Paper } from '@material-ui/core';

import GameChangerAPI from '../../api/gameChanger-service-api';
import { trackEvent } from '../../telemetry/Matomo';
import { styles } from '../util/GCAdminStyles';
import UOTAlert from '../../common/GCAlert';

import TrendingBlackListModal from './TrendingBlackListModal';
import EditEsIndexModal from './EditEsIndexModal';

const gameChangerAPI = new GameChangerAPI();
/**
 *
 * @class GeneralAdminButtons
 */
export default () => {
	// State variables for the buttons
	const [combinedSearch, setCombinedSearch] = useState(true);
	const [intelligentAnswers, setIntelligentAnswers] = useState(true);
	const [entitySearch, setEntitySearch] = useState(true);
	const [userFeedback, setUserFeedback] = useState(true);
	const [jiraFeedback, setJiraFeedback] = useState(true);
	const [topicSearch, setTopicSearch] = useState(true);
	const [ltr, setLTR] = useState(true);

	// EsIndexModal and TrendingBlacklistModal state variables
	const [showEditEsIndexModal, setShowEditEsIndexModal] = useState(false);
	const [showTrendingBlacklistModal, setShowTrendingBlacklistModal] =
		useState(false);

	// Alert state variables
	const [alertActive, setAlertActive] = useState(false);
	const [alertTitle, setAlertTitle] = useState('');
	const [alertType, setAlertType] = useState('');
	const [alertMessage, setAlertMessage] = useState('');

	const createAlert = (title, type, message) => {
		setAlertTitle(title);
		setAlertType(type);
		setAlertMessage(message);
		setAlertActive(true);
	};

	const openTrendingBlacklistModal = () => {
		setShowTrendingBlacklistModal(true);
	};
	const openEsIndexModal = () => {
		setShowEditEsIndexModal(true);
	};

	const setCombinedSearchMode = async () => {
		try {
			await gameChangerAPI.setCombinedSearchMode(!combinedSearch);
			setCombinedSearch(!combinedSearch);
			createAlert(
				'Search Mode',
				'info',
				!combinedSearch ? 'Combined' : 'Keyword only'
			);
		} catch (e) {
			console.error('Error setting combined search mode', e);
		}
	};

	const setIntelligentAnswersMode = async () => {
		try {
			await gameChangerAPI.setIntelligentAnswersMode(!intelligentAnswers);
			setIntelligentAnswers(!intelligentAnswers);
			createAlert(
				'Intelligent Answers',
				'info',
				!intelligentAnswers ? 'On' : 'Off'
			);
		} catch (e) {
			console.error('Error setting Intelligent Answers', e);
		}
	};

	const setEntitySearchMode = async () => {
		try {
			await gameChangerAPI.setEntitySearchMode(!entitySearch);
			setEntitySearch(!entitySearch);
			createAlert('Entity Search', 'info', !entitySearch ? 'On' : 'Off');
		} catch (e) {
			console.error('Error setting Entity Search', e);
		}
	};

	const setTopicSearchMode = async () => {
		try {
			await gameChangerAPI.setTopicSearchMode(!topicSearch);
			setTopicSearch(!topicSearch);
			createAlert('Topic Search', 'info', !topicSearch ? 'On' : 'Off');
		} catch (e) {
			console.error('Error setting Topic Search', e);
		}
	};

	const createSearchCache = async () => {
		const title = 'Creating cache for searched terms: ';
		createAlert(title, 'info', 'Started');
		try {
			await gameChangerAPI.createSearchHistoryCache().then((res) => {
				createAlert(title, 'success', 'Creation complete');
				console.log(res);
			});
		} catch (e) {
			console.log(e);
			createAlert(title, 'error', 'Creation failed');
		}
	};

	const clearSearchCache = async () => {
		const title = 'Clearing cache for searched terms: ';
		createAlert(title, 'info', 'Started');
		try {
			await gameChangerAPI.clearSearchHistoryCache().then((res) => {
				createAlert(title, 'success', 'Cache cleared');
			});
		} catch (e) {
			console.log(e);
			createAlert(title, 'error', 'Cache clearing failed');
		}
	};

	const createAbbreviationsCache = async () => {
		const title = 'Creating cache for abreviations: ';
		createAlert(title, 'info', 'Started');
		try {
			await gameChangerAPI.createAbbreviationsCache().then((res) => {
				createAlert(title, 'success', 'Creation Complete');
				console.log(res);
			});
		} catch (e) {
			console.log(e);
			createAlert(title, 'error', 'Creation failed');
		}
	};

	const clearAbbreviationsCache = async () => {
		const title = 'Clearing cache for abbreviations: ';
		createAlert(title, 'info', 'Started');
		try {
			await gameChangerAPI.clearAbbreviationsCache().then((res) => {
				createAlert(title, 'success', 'Cache cleared');
			});
		} catch (e) {
			console.log(e);
			createAlert(title, 'error', 'Cache clearing failed');
		}
	};

	const createGraphDataCache = async () => {
		const title = 'Creating cache for graph data: ';
		createAlert(title, 'info', 'Started');
		try {
			await gameChangerAPI.createGraphDataCache().then((res) => {
				createAlert(title, 'success', 'Creation complete');
				console.log(res);
			});
		} catch (e) {
			console.log(e);
			createAlert(title, 'error', 'Creation failed');
		}
	};

	const clearGraphDataCache = async () => {
		const title = 'Clearing cache for graph data: ';
		createAlert(title, 'info', 'Started');
		try {
			await gameChangerAPI.clearGraphDataCache().then((res) => {
				createAlert(title, 'success', 'Cache cleared');
			});
		} catch (e) {
			console.log(e);
			createAlert(title, 'error', 'Cache clearing failed');
		}
	};
	const populateNewUserId = async () => {
		try {
			await gameChangerAPI.populateNewUserId().then(() => {
				createAlert(
					'Populating New User IDs',
					'success',
					'Updated new_user_id column'
				);
			});
		} catch (e) {
			console.log(e);
			createAlert(
				'Populating New User IDs',
				'error',
				'Failed updating Postgres table'
			);
		}
	};

	const reloadHandlerMap = async () => {
		const title = 'Reloading Handler Map: ';
		createAlert(title, 'info', 'Started');
		try {
			await gameChangerAPI.reloadHandlerMap().then((res) => {
				createAlert('Reloading Handler Map', 'success', 'Updated handler map');
			});
		} catch (e) {
			console.log(e);
			createAlert(
				'Reloading Handler Map',
				'error',
				'Failed updating handler map'
			);
		}
	};
	const toggleUserFeedback = async () => {
		const title = 'Requst User Feedback: ';
		createAlert(title, 'info', 'Started');
		try {
			await gameChangerAPI.toggleUserFeedbackMode().then((res) => {
				createAlert(
					'Toggling user feedback value',
					'success',
					'updated user feedback mode'
				);
				getUserFeedback();
			});
		} catch (e) {
			console.log(e);
			createAlert(
				'Toggling user feedback value',
				'error',
				'failed updating user feedback mode'
			);
		}
	};

	const toggleJiraFeedback = async () => {
		const title = 'Request Jira Feedback: ';
		createAlert(title, 'info', 'Started');
		try {
			await gameChangerAPI.toggleJiraFeedbackMode().then((res) => {
				createAlert(
					'Toggling Jira feedback value',
					'success',
					'updated Jira feedback mode'
				);
				getJiraFeedback();
			});
		} catch (e) {
			console.log(e);
			createAlert(
				'Toggling Jira feedback value',
				'error',
				'failed updating Jira feedback mode'
			);
		}
	};

	const toggleLTR = async () => {
		const title = 'Toggling LTR: ';
		createAlert(title, 'info', 'Started');
		try {
			await gameChangerAPI.toggleLTR().then(() => {
				createAlert(
					'Toggling LTR',
					'success',
					'updated LTR'
				);
				getLTR();
			});
		} catch (e) {
			console.log(e);
			createAlert(
				'Toggling LTR',
				'error',
				'failed toggling LTR'
			);
		}
	};

	const getCombinedSearch = async () => {
		try {
			const { data } = await gameChangerAPI.getCombinedSearchMode();
			const value = data.value === 'true';
			setCombinedSearch(value);
		} catch (e) {
			console.error('Error getting combined search mode', e);
		}
	};

	const getIntelligentAnswers = async () => {
		try {
			const { data } = await gameChangerAPI.getIntelligentAnswersMode();
			const value = data.value === 'true';
			setIntelligentAnswers(value);
		} catch (e) {
			console.error('Error getting intelligent search mode', e);
		}
	};

	const getEntitySearch = async () => {
		try {
			const { data } = await gameChangerAPI.getEntitySearchMode();
			const value = data.value === 'true';
			setEntitySearch(value);
		} catch (e) {
			console.error('Error getting entity search mode', e);
		}
	};
	const getUserFeedback = async () => {
		try {
			const { data } = await gameChangerAPI.getUserFeedbackMode();
			const value = data.value === 'true';
			setUserFeedback(value);
		} catch (e) {
			console.error('Error getting user feedback mode', e);
		}
	};
	const getJiraFeedback = async () => {
		try {
			const { data } = await gameChangerAPI.getJiraFeedbackMode();
			const value = data.value === 'true';
			setJiraFeedback(value);
		} catch (e) {
			console.error('Error getting jira feedback mode', e);
		}
	};

	const getLTR = async () => {
		try {
			const { data } = await gameChangerAPI.getLTRMode();
			const value = data.value === 'true';
			setLTR(value);
		} catch (e) {
			console.error('Error getting LTR mode', e);
		}
	};

	const getTopicSearch = async () => {
		try {
			const { data } = await gameChangerAPI.getTopicSearchMode();
			const value = data.value === 'true';
			setTopicSearch(value);
		} catch (e) {
			console.error('Error getting topic search mode', e);
		}
	};
	useEffect(() => {
		getCombinedSearch();
		getIntelligentAnswers();
		getEntitySearch();
		getUserFeedback();
		getTopicSearch();
		getJiraFeedback();
		getLTR();
	}, []);

	return (
		<>
			<div>
				<p style={styles.sectionHeader}>General Actions</p>
				<div className="row" style={{ paddingLeft: '80px' }}>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2}>
							<Link
								to="#"
								onClick={() => {
									openEsIndexModal();
									trackEvent(
										'GAMECHANGER_Admin',
										'AdminPageChangeEsIndex',
										'onClick'
									);
								}}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa fa-plug fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>
										Change ElasticSearch Index
									</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2}>
							<Link
								to="#"
								onClick={createSearchCache}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-search fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>
										Create Search Cache
									</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2}>
							<Link
								to="#"
								onClick={clearSearchCache}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-trash fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>Clear Search Cache</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2}>
							<Link
								to="#"
								onClick={createAbbreviationsCache}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-search fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>
										Create Abbreviations Cache
									</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2}>
							<Link
								to="#"
								onClick={clearAbbreviationsCache}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-trash fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>
										Clear Abbreviations Cache
									</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2}>
							<Link
								to="#"
								onClick={createGraphDataCache}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-code-fork fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>Create Graph Cache</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2}>
							<Link
								to="#"
								onClick={clearGraphDataCache}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-trash fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>Clear Graph Cache</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2}>
							<Link
								to="#"
								onClick={openTrendingBlacklistModal}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-line-chart fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>
										Edit Trending Blacklist
									</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2}>
							<Link
								to="#"
								onClick={populateNewUserId}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-users fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>
										Populate New User ID Column
									</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2}>
							<Link
								to="#"
								onClick={reloadHandlerMap}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-map fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>Reload Handler Map</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper
							style={
								combinedSearch
									? styles.paper
									: { ...styles.paper, backgroundColor: 'rgb(181 52 82)' }
							}
							zDepth={2}
						>
							<Link
								to="#"
								onClick={setCombinedSearchMode}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-btc fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>
										Toggle Combined Search
									</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper
							style={
								intelligentAnswers
									? styles.paper
									: { ...styles.paper, backgroundColor: 'rgb(181 52 82)' }
							}
							zDepth={2}
						>
							<Link
								to="#"
								onClick={setIntelligentAnswersMode}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-question fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>
										Toggle Intelligent Answers
									</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper
							style={
								entitySearch
									? styles.paper
									: { ...styles.paper, backgroundColor: 'rgb(181 52 82)' }
							}
							zDepth={2}
						>
							<Link
								to="#"
								onClick={setEntitySearchMode}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-id-badge fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>
										Toggle Entity Search
									</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper
							style={
								topicSearch
									? styles.paper
									: { ...styles.paper, backgroundColor: 'rgb(181 52 82)' }
							}
							zDepth={2}
						>
							<Link
								to="#"
								onClick={setTopicSearchMode}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-id-badge fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>
										Toggle Topic Search
									</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper
							style={
								userFeedback
									? styles.paper
									: { ...styles.paper, backgroundColor: 'rgb(181 52 82)' }
							}
							zDepth={2}
						>
							<Link
								to="#"
								onClick={toggleUserFeedback}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-id-card-o fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>
										Toggle User Feedback
									</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper
							style={
								jiraFeedback
									? styles.paper
									: { ...styles.paper, backgroundColor: 'rgb(181 52 82)' }
							}
							zDepth={2}
						>
							<Link
								to="#"
								onClick={toggleJiraFeedback}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-id-card-o fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>
										Toggle Jira User Feedback
									</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper
							style={
								ltr
									? styles.paper
									: { ...styles.paper, backgroundColor: 'rgb(181 52 82)' }
							}
							zDepth={2}
						>
							<Link
								to="#"
								onClick={toggleLTR}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-id-card-o fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>
										Toggle LTR
									</span>
								</h2>
							</Link>
						</Paper>
					</div>
				</div>

				{/* <p style={styles.sectionFooter}>Currently {useMatomo ? 'sending': 'not sending'} data to Matomo</p> */}
				<p style={styles.sectionFooter}>
					Currently not using cache for searches
				</p>
				<p style={styles.sectionFooter}>
					Currently using{' '}
					{combinedSearch ? 'combined search mode' : 'keyword searching only'}
				</p>
				<p style={styles.sectionFooter}>
					Currently {!intelligentAnswers ? 'not' : ''} using intelligent answers
				</p>
			</div>
			<div>
				{alertActive ? (
					<UOTAlert
						title={alertTitle}
						type={alertType}
						elementId="Admin-Button"
						message={alertMessage}
						onHide={() => setAlertActive(false)}
						containerStyles={styles.alert}
					/>
				) : (
					<></>
				)}
			</div>
			<TrendingBlackListModal
				showTrendingBlacklistModal={showTrendingBlacklistModal}
				setShowTrendingBlacklistModal={setShowTrendingBlacklistModal}
			/>
			<EditEsIndexModal
				showEditEsIndexModal={showEditEsIndexModal}
				setShowEditEsIndexModal={setShowEditEsIndexModal}
			/>
		</>
	);
};
