import React, { useEffect, useState, useContext } from 'react';
import AdvanaFooter from '@dod-advana/advana-platform-ui/dist/AdvanaFooter';
import { Button, Checkbox, FormControlLabel, FormGroup, Modal, TextField, Typography } from '@material-ui/core';
import { getContext } from '../factories/contextFactory';
import styled from 'styled-components';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import GameChangerAPI from '../api/gameChanger-service-api';
import GamechangerUserManagementAPI from '../api/GamechangerUserManagement';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import GCButton from '../common/GCButton';
import RequestAPIKeyDialog from '../api/RequestAPIKeyDialog';
import { PAGE_DISPLAYED } from '../../utils/gamechangerUtils';
import { setState, setUserMatomo } from '../../utils/sharedFunctions';

const gameChangerAPI = new GameChangerAPI();
const gcUserManagementAPI = new GamechangerUserManagementAPI();

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		flexWrap: 'wrap',
		margin: '0 20px',
	},
	textField: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		width: '25ch',
		'& .MuiFormHelperText-root': {
			fontSize: 12,
		},
	},
	textFieldWide: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		minWidth: '50ch',
		'& .MuiFormHelperText-root': {
			fontSize: 12,
		},
	},
	dialogLg: {
		maxWidth: '800px',
		minWidth: '800px',
	},
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		marginLeft: '5px',
		marginRight: '5px',
	},
	titleText: {
		fontWeight: 900,
		marginBottom: 5,
	},
}));

const FooterDiv = styled.div`
	width: 100%;
	align-items: center;
	-webkit-align-items: center;
	position: relative;
	bottom: -30px;
	& button {
		margin: 0 8px;
	}
`;

const LinkButton = styled(Button)`
	&& {
		background-color: transparent;
		font-weight: 600;
		border-bottom: 3px solid transparent;
		color: white;
		height: 3em;
		font-family: Montserrat;
	}
`;

const CloseButton = styled.div`
	padding: 6px;
	background-color: white;
	border-radius: 5px;
	color: #8091a5 !important;
	border: 1px solid #b0b9be;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 0.4;
	position: absolute;
	right: 15px;
	top: 15px;
`;

const FAQLinkButton = () => {
	const context = useContext(getContext('gamechanger'));
	const { dispatch } = context;
	return (
		<LinkButton
			key="faq"
			onClick={() => {
				window.history.pushState(null, document.title, `/#/gamechanger/${PAGE_DISPLAYED.faq}`);
				setState(dispatch, { pageDisplayed: PAGE_DISPLAYED.faq });
			}}
		>
			FAQs
		</LinkButton>
	);
};

const GCFooter = (props) => {
	const classes = useStyles();

	const { location, cloneName } = props;

	const [trackingModalOpen, setTrackingModalOpen] = useState(false);
	const [apiRequestModalOpen, setApiRequestModalOpen] = useState(false);
	const [useMatomo, setUseMatomo] = useState(false);
	const [requestAPIKeyData, setRequestAPIKeyData] = useState({ name: '', email: '', reason: '', clones: [] });
	const [apiRequestLimit, setAPIRequestLimit] = useState(0);
	const [cloneMeta, setCloneMeta] = useState([]);
	const [apiRequestError, setApiRequestError] = useState('');

	const getUserData = async () => {
		try {
			const { data } = await gcUserManagementAPI.getUserData();
			const { api_requests } = data;
			setAPIRequestLimit(api_requests);
		} catch (err) {
			console.log(err);
			console.log(err.message);
		}
	};

	const initializeUserMatomoStatus = async () => {
		try {
			const { data } = await gameChangerAPI.getUserMatomoStatus();
			localStorage.setItem('userMatomo', data);
		} catch (e) {
			console.error('Error getting matomo status', e);
		}
	};

	const initializeAppMatomoStatus = async () => {
		try {
			const { data } = await gameChangerAPI.getAppMatomoStatus();
			localStorage.setItem('appMatomo', data);
		} catch (e) {
			console.error('Error getting matomo status', e);
		}
	};

	const getCloneData = async () => {
		try {
			const { data } = await gameChangerAPI.getCloneData();
			setCloneMeta(data);
		} catch (err) {
			console.error('Error getting clone meta data: ', err);
		}
	};

	useEffect(() => {
		initializeUserMatomoStatus();
		initializeAppMatomoStatus();
		setUseMatomo(localStorage.getItem('userMatomo') === 'true');
		getUserData();
		getCloneData();
	}, []);

	const setUserMatomoStatus = (status) => {
		gameChangerAPI.setUserMatomoStatus({ tracking: status }).then(
			(data) => {
				setUseMatomo(data.data);
				setUserMatomo(data.data);
			},
			(err) => {
				console.log(err);
			}
		);
	};

	const handleClose = () => {
		setRequestAPIKeyData({ name: '', email: '', reason: '', clones: [] });
		setApiRequestModalOpen(false);
	};

	const handleCloneChange = (cloneId) => {
		setApiRequestError('');
		const newRequestAPIKeyData = { ...requestAPIKeyData };
		if (!newRequestAPIKeyData.clones) newRequestAPIKeyData.clones = [];
		const index = newRequestAPIKeyData.clones.indexOf(cloneId);
		if (index > -1) {
			newRequestAPIKeyData.clones.splice(index, 1);
		} else {
			newRequestAPIKeyData.clones.push(cloneId);
		}
		setRequestAPIKeyData(newRequestAPIKeyData);
	};

	const renderAPIKeyRequestForm = () => {
		return (
			<>
				<div style={{ margin: '0 20px', display: 'flex', flexDirection: 'column' }}>
					{apiRequestLimit === 0 && (
						<Typography display="inline" style={{ color: 'red' }}>
							You have reached you're request limit for this month
						</Typography>
					)}
					<TextField
						label="Name"
						required
						fullWidth
						defaultValue={requestAPIKeyData.name ? requestAPIKeyData.name : null}
						onChange={(event) => {
							requestAPIKeyData.name = event.target.value;
						}}
						className={classes.textFieldWide}
						margin="dense"
						variant="outlined"
					/>
					<TextField
						label="Email"
						required
						fullWidth
						defaultValue={requestAPIKeyData.email ? requestAPIKeyData.email : null}
						onChange={(event) => {
							requestAPIKeyData.email = event.target.value;
						}}
						className={classes.textFieldWide}
						margin="dense"
						variant="outlined"
					/>
					<TextField
						label="Reason"
						required
						fullWidth
						defaultValue={requestAPIKeyData.reason ? requestAPIKeyData.reason : null}
						onChange={(event) => {
							requestAPIKeyData.reason = event.target.value;
						}}
						className={classes.textFieldWide}
						multiline
						rows={4}
						margin="dense"
						variant="outlined"
					/>
					<Typography variant="h3" style={{ width: '100%', fontSize: '24px' }}>
						Select clones to access
					</Typography>
					<FormGroup style={{ margin: '0px 10px', width: '100%', flexDirection: 'row' }}>
						{cloneMeta.map((clone) => {
							return (
								<FormControlLabel
									key={clone.clone_name}
									name={clone.clone_name}
									value={clone}
									control={
										<Checkbox
											onClick={() => handleCloneChange(clone.id)}
											icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
											checked={requestAPIKeyData?.clones.includes(clone.id)}
											checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
											name={clone.clone_name}
											className={classes.filterBox}
										/>
									}
									label={clone.clone_name}
									labelPlacement="end"
									className={classes.titleText}
								/>
							);
						})}
					</FormGroup>
					{apiRequestError && <div style={{ color: '#f44336' }}>{apiRequestError}</div>}
				</div>
			</>
		);
	};

	const sendAPIKeyRequest = () => {
		if (!requestAPIKeyData.clones.length) return setApiRequestError('Select at least one clone');
		gameChangerAPI
			.createAPIKeyRequest(
				requestAPIKeyData.name,
				requestAPIKeyData.email,
				requestAPIKeyData.reason,
				requestAPIKeyData.clones
			)
			.then(() => {
				gameChangerAPI.updateUserAPIRequestLimit().then(() => setAPIRequestLimit(apiRequestLimit - 1));
				setApiRequestError('');
				setApiRequestModalOpen(false);
				handleClose();
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const getExtraLinks = () => {
		const extraLinks = [];
		if (cloneName === 'gamechanger') {
			extraLinks.push(<FAQLinkButton key={extraLinks.length} />);
		}
		extraLinks.push(
			<LinkButton key="disclaimer" onClick={() => setTrackingModalOpen(true)}>
				App-wide Tracking Agreement
			</LinkButton>
		);

		if (!location['pathname'].includes('search')) {
			extraLinks.push(
				<LinkButton key="apiKeyRequest" onClick={() => setApiRequestModalOpen(true)}>
					Request API Key
				</LinkButton>
			);
		}
		return extraLinks;
	};

	return (
		<>
			<FooterDiv>
				<AdvanaFooter extraLinks={getExtraLinks()} />
			</FooterDiv>

			<Modal open={trackingModalOpen} onClose={() => setTrackingModalOpen(false)}>
				<div
					style={{
						width: '50%',
						backgroundColor: 'white',
						padding: 20,
						borderRadius: 5,
						margin: '10% auto',
						position: 'relative',
					}}
				>
					<CloseButton onClick={() => setTrackingModalOpen(false)}>
						<CloseIcon fontSize="large" />
					</CloseButton>
					<div style={{ paddingTop: 50 }}>
						<p>
							Advana employs a web measurement and customization technology (WMCT), on this site to
							remember your online interactions, to conduct measurement and analysis of usage, or to
							customize your experience. This WMCT activity is categorized as a Tier 2 WMCT: i.e.,
							multi-session tracking without collection of personally identifiable information (PII), and
							is enabled by default. Advana does not use the information associated with the WMCT to track
							individual user activity on the Internet outside of Advana websites, nor does it share the
							data obtained through such technologies, without your explicit consent, with other
							departments or agencies. Advana keeps a database of information obtained from the use of
							this WMCT in an encrypted RDS instance, but no personal data is maintained. Opting out of
							this WMCT does not effect a user's access to information on this website.
						</p>
					</div>
					<div
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
						}}
					>
						<div
							style={{
								display: 'flex',
								width: '30%',
								margin: '10px 0 0 0',
							}}
						>
							<GCButton isSecondaryBtn={true} onClick={() => setTrackingModalOpen(false)}>
								Cancel
							</GCButton>
							<GCButton
								onClick={() => {
									setUserMatomoStatus(!useMatomo);
									setTrackingModalOpen(false);
								}}
							>
								{useMatomo ? 'Opt Out' : 'Opt In'}
							</GCButton>
						</div>
					</div>
				</div>
			</Modal>

			<RequestAPIKeyDialog
				handleClose={handleClose}
				handleSave={sendAPIKeyRequest}
				apiRequestLimit={apiRequestLimit}
				renderContent={renderAPIKeyRequestForm}
				open={apiRequestModalOpen}
			/>
		</>
	);
};

export default GCFooter;
