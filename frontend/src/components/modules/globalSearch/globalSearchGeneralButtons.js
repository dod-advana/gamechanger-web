import React, { useState } from 'react';
import { Link, Paper } from '@material-ui/core';
import { styles } from '../../admin/util/GCAdminStyles';
import GameChangerAPI from '../../api/gameChanger-service-api';
import UOTAlert from '../../common/GCAlert';
const gameChangerAPI = new GameChangerAPI();

const GlobalSearchGeneralButtons = () => {
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

	const cacheQlikApps = async () => {
		const title = 'Cache Qlik Apps: ';
		createAlert(title, 'info', 'Started');
		try {
			await gameChangerAPI.cacheQlikApps().then((res) => {
				if (res.status === 200) {
					createAlert(title, 'info', 'Finished');
				} else {
					createAlert(title, 'error', res.message);
				}
			});
		} catch (e) {
			console.log(e);
			createAlert(title, 'error', 'failed updating creating qlik apps cache.');
		}
	};

	return (
		<>
			<div>
				<p style={styles.sectionHeader}>General Actions</p>
				<div className="row" style={{ padding: '25px 0 0 50px' }}>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2}>
							<Link to="#" onClick={cacheQlikApps} style={{ textDecoration: 'none' }}>
								<i style={styles.image} className="fa fa-database fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>Create Qlik Cache</span>
								</h2>
							</Link>
						</Paper>
					</div>
				</div>
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
		</>
	);
};

export default GlobalSearchGeneralButtons;
