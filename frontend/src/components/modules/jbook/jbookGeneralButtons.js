import React, { useState } from 'react';
import { Link, Paper } from '@material-ui/core';
import { styles } from '../../admin/util/GCAdminStyles';
import UOTAlert from '../../common/GCAlert';
import EditEsIndexModal from '../../admin/GeneralAdminButtons/EditEsIndexModal';
import EditStatusEmailModal from '../../admin/GeneralAdminButtons/EditReviewSatusEmailModal';
import GameChangerAPI from '../../api/gameChanger-service-api';
import fileDownload from 'js-file-download';

const gameChangerAPI = new GameChangerAPI();
/**
 *
 * @class GeneralAdminButtons
 */
const JBOOKGeneralAdminButtons = () => {
	// State variables for the buttons

	// EsIndexModal and TrendingBlacklistModal state variables
	const [showEditEsIndexModal, setShowEditEsIndexModal] = useState(false);
	const [showEditReviewStatusEmailModal, setShowEditReviewStatusEmailModal] = useState(false);

	// Alert state variables
	const [alertActive, setAlertActive] = useState(false);
	const [alertTitle, setAlertTitle] = useState('');
	const [alertType, setAlertType] = useState('');
	const [alertMessage, setAlertMessage] = useState('');
	const [reviewStatusEmails, setReviewStatusEmails] = useState('');

	// eslint-disable-next-line
	const createAlert = (title, type, message) => {
		setAlertTitle(title);
		setAlertType(type);
		setAlertMessage(message);
		setAlertActive(true);
	};

	const autoDownloadFile = ({ data, filename = 'results', extension = 'txt' }) => {
		//Create a link element, hide it, direct it towards the blob, and then 'click' it programatically
		console.log('autodownload file');

		const a = document.createElement('a');
		a.style = 'display: none';
		document.body.appendChild(a);
		//Create a DOMString representing the blob
		//and point the link element towards it
		const url = window.URL.createObjectURL(data);
		a.href = url;
		a.download = `${filename}.${extension}`;
		//programatically click the link to trigger the download
		a.click();
		//release the reference to the file by revoking the Object URL
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	};

	const sendReviewStatusUpdates = async () => {
		setShowEditReviewStatusEmailModal(false);
		const title = 'Sending Review Status: ';
		createAlert(title, 'info', 'Started');
		try {
			await gameChangerAPI.sendReviewStatusUpdates({ emails: reviewStatusEmails }).then((res) => {
				createAlert('Sending Review Status', 'success', 'Review Status Sent');
			});
		} catch (e) {
			console.log(e);
			createAlert('Sending Review Status', 'error', 'Review Status Failed');
		}
	};

	return (
		<>
			<div>
				<p style={styles.sectionHeader}>General Actions</p>
				<div className="row" style={{ padding: '25px 0 0 50px' }}>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link
								to="#"
								onClick={async () => {
									try {
										createAlert('Downloading Review Data', 'info', '');
										const data = await gameChangerAPI.exportReview({
											cloneName: 'jbook',
										});
										const blob = new Blob([data.data], { type: 'text/csv;charset=utf-8' });
										const d = new Date();
										await autoDownloadFile({
											data: blob,
											extension: 'csv',
											filename: 'review-data-' + d.toISOString(),
										});
										createAlert('Download Complete', 'success', '');
									} catch (e) {
										createAlert('Download Failed', 'error', '');
										console.log(e);
									}
								}}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa fa-file-excel-o fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>EXPORT REVIEW TABLE</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link
								to="#"
								onClick={() => setShowEditReviewStatusEmailModal(true)}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa-mail-reply-all fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>Send Review Status</span>
								</h2>
							</Link>
						</Paper>
					</div>
					<div style={styles.feature}>
						<Paper style={styles.paper} zDepth={2} circle>
							<Link
								to="#"
								onClick={async () => {
									try {
										createAlert('Downloading Review Status Data', 'info', '');
										const d = new Date();
										const data = await gameChangerAPI.callSearchFunction(
											{
												functionName: 'getDataForReviewStatus',
												cloneName: 'jbook',
												options: {},
											},
											{ responseType: 'blob' }
										);
										fileDownload(data.data, `review-status-${d.toISOString()}.xls`);
										createAlert('Download Complete', 'success', '');
									} catch (e) {
										createAlert('Download Failed', 'error', '');
										console.log(e);
									}
								}}
								style={{ textDecoration: 'none' }}
							>
								<i style={styles.image} className="fa fa fa-file-excel-o fa-2x" />
								<h2 style={styles.featureName}>
									<span style={styles.featureNameLink}>EXPORT REVIEW STATUS</span>
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
			<EditEsIndexModal
				showEditEsIndexModal={showEditEsIndexModal}
				setShowEditEsIndexModal={setShowEditEsIndexModal}
			/>
			<EditStatusEmailModal
				showEditReviewStatusEmailModal={showEditReviewStatusEmailModal}
				setShowEditReviewStatusEmailModal={setShowEditReviewStatusEmailModal}
				setEmailAddress={setReviewStatusEmails}
				sendEmail={sendReviewStatusUpdates}
			/>
		</>
	);
};

export default JBOOKGeneralAdminButtons;
