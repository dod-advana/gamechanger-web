import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Modal, TextField,
	Typography
} from '@material-ui/core';
import GameChangerAPI from "../api/gameChanger-service-api";
import GamechangerUserManagementAPI from "../api/GamechangerUserManagement";
// import {trackPageView} from "../../../utilities/telemetry/Matomo";
import CloseIcon from "@material-ui/icons/Close";
import GCButton from "../common/GCButton";
import {makeStyles} from "@material-ui/core/styles";
import {backgroundGreyLight} from "../common/gc-colors";

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		flexWrap: 'wrap',
		margin: '0 20px'
	},
	textField: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		width: '25ch',
		'& .MuiFormHelperText-root': {
			fontSize: 12
		}
	},
	textFieldWide: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		minWidth: '50ch',
		'& .MuiFormHelperText-root': {
			fontSize: 12
		}
	},
	dialogLg: {
		maxWidth: '800px',
		minWidth: '800px'
	},
	closeButton: {
		position: 'absolute',
		right: '0px',
		top: '0px',
		height: 60,
		width: 60,
		color: 'black',
		backgroundColor: backgroundGreyLight,
		borderRadius: 0,
		borderTopRightRadius: 5
    },
}));

const FooterContainer = styled.div`
	display: flex;
	height: 90px;
	width: 100%;
	align-items: center;
	justify-content: flex-end;
	background-color: black;
	color: white;
`;

const LinkButton = styled(Button)`
	&& { 
		background-color: transparent;
		font-weight: 600;
		border-bottom: 3px solid transparent;
		color: white;
		height: 3em;
		font-family: Montserrat;
	};
`;

const Spacer = styled.div`
	flex: 1;
`;

const LinkContainer = styled.div`
	display: flex;
	flex: 25;
	justify-content: flex-end;
`;

const gameChangerAPI = new GameChangerAPI();
const gcUserManagementAPI = new GamechangerUserManagementAPI();

const DecoupledFooter = (props) => {
	
	const classes = useStyles();
	
	const { setUserMatomo } = props;
	const [trackingModalOpen, setTrackingModalOpen] = useState(false);
	const [showRequestAPIKeyModal, setShowRequestAPIKeyModal] = useState(false);
	const [useMatomo, setUseMatomo] = useState(false);
	const [requestAPIKeyData, setRequestAPIKeyData] = useState({});
	const [apiRequestLimit, setAPIRequestLimit] = useState(0);

	const getUserData = async () => {
		try {
			const { data } = await gcUserManagementAPI.getUserData();
			const { api_requests } = data;
			setAPIRequestLimit(api_requests);
		} catch(err) {
			console.log(err);
			console.log(err.message);
		}
	}

	useEffect (() => {
		setUseMatomo(localStorage.getItem('userMatomo') === 'true');
		getUserData();
	}, [])
	
	useEffect (() => {
		setRequestAPIKeyData({name: '', email: '', reason: ''});
	}, [showRequestAPIKeyModal])
	
	const setUserMatomoStatus = (status) => {
		
		gameChangerAPI.setUserMatomoStatus({ tracking: status }).then((data) => {
			setUseMatomo(data.data);
			setUserMatomo(data.data);
		}, (err) => {
			console.log(err);
		});
	}
	
	const renderAPIKeyRequestForm = () => {
		return (
			 <>
				<div style={{margin: '0 20px', display: 'flex', flexDirection: 'column'}}>
				{apiRequestLimit === 0 && <Typography display="inline" style={{color: 'red'}}>You have reached you're request limit for this month</Typography>}
					<TextField
						label="Name"
						required
						fullWidth
						defaultValue={requestAPIKeyData.name ? requestAPIKeyData.name : null}
						onChange={event => {requestAPIKeyData.name = event.target.value}}
						className={classes.textFieldWide}
						margin="dense"
						variant="outlined"
					/>
					<TextField
						label="Email"
						required
						fullWidth
						defaultValue={requestAPIKeyData.email ? requestAPIKeyData.email : null}
						onChange={event => {requestAPIKeyData.email = event.target.value}}
						className={classes.textFieldWide}
						margin="dense"
						variant="outlined"
					/>
					<TextField
						label="Reason"
						required
						fullWidth
						defaultValue={requestAPIKeyData.reason ? requestAPIKeyData.reason : null}
						onChange={event => {requestAPIKeyData.reason = event.target.value}}
						className={classes.textFieldWide}
						multiline
						rows={4}
						margin="dense"
						variant="outlined"
					/>
				</div>
			 </>
		);
	}
	
	const sendAPIKeyRequest = () => {
		gameChangerAPI.createAPIKeyRequest(requestAPIKeyData.name, requestAPIKeyData.email, requestAPIKeyData.reason).then(resp => {
			gameChangerAPI.updateUserAPIRequestLimit().then(()=>setAPIRequestLimit(apiRequestLimit-1))
			setShowRequestAPIKeyModal(false);
		}).catch(e => {
			console.log(e);
		});
	}

	return (
		<FooterContainer>
			<LinkContainer>
				<LinkButton key='disclaimer' onClick={() => setTrackingModalOpen(true)}>App-wide Tracking Agreement</LinkButton>
				<LinkButton key='apiKeyRequest' onClick={() => setShowRequestAPIKeyModal(true)}>Request API Key</LinkButton>
			</LinkContainer>
			<Spacer />
			
			<Modal
				open={trackingModalOpen}
				onClose={() => setTrackingModalOpen(false)}
			>
					<div style={{
						width: '50%',
						backgroundColor: 'white',
						padding: 20,
						borderRadius: 5,
						margin: '10% auto',
						position: 'relative'
					}}
					>
						<IconButton aria-label="close" className={classes.closeButton} onClick={() => setTrackingModalOpen(false)}>
							<CloseIcon style={{ fontSize: 30 }} />
						</IconButton>
						<div style={{paddingTop: 50}}>
							<p>Advana employs a web measurement and customization technology (WMCT), on this site to remember your online interactions, to conduct measurement and analysis of usage, or to customize your experience. This WMCT activity is categorized as a Tier 2 WMCT: i.e., multi-session tracking without collection of personally identifiable information (PII), and is enabled by default. Advana does not use the information associated with the WMCT to track individual user activity on the Internet outside of Advana websites, nor does it share the data obtained through such technologies, without your explicit consent, with other departments or agencies. Advana keeps a database of information obtained from the use of this WMCT in an encrypted RDS instance, but no personal data is maintained. Opting out of this WMCT does not effect a user's access to information on this website.</p>
						</div>
						<div style={{
							display: 'flex',
							justifyContent: 'flex-end'
						}}>
							<div style={{
								display: 'flex',
								width: '30%',
								margin: '10px 0 0 0'
							}}
							>
								<GCButton isSecondaryBtn={true} onClick={() => setTrackingModalOpen(false)}>Cancel</GCButton>
								<GCButton onClick={() => { setUserMatomoStatus(!useMatomo); setTrackingModalOpen(false); }}>
									{useMatomo ? 'Opt Out' : 'Opt In'}
								</GCButton>
							</div>
						</div>
					</div>
			</Modal>
			<Dialog
                open={showRequestAPIKeyModal}
                scroll={'paper'}
                maxWidth="lg"
                disableEscapeKeyDown
                disableBackdropClick
                classes={{
                    paperWidthLg: classes.dialogLg
				}}
            >
                <DialogTitle >
					<div style={{display: 'flex', width: '100%'}}>
						<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>Request API Key</Typography>
						<Typography display="inline" style={{ fontSize: '14px', lineHeight: '33px', marginLeft: '5px'}}>{`Limit 3 per month (${apiRequestLimit} left)`}</Typography>
					</div>
					<IconButton aria-label="close" className={classes.closeButton} onClick={() => setShowRequestAPIKeyModal(false)}>
						<CloseIcon style={{ fontSize: 30 }} />
					</IconButton>
                </DialogTitle>

                <DialogContent style={{height: '100%'}}>
					{renderAPIKeyRequestForm()}
                </DialogContent>

                <DialogActions>
					<div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', margin: '0px 18px' }}>
						<GCButton
							id={'editCloneSubmit'}
							onClick={() => setShowRequestAPIKeyModal(false)}
							style={{margin:'10px'}}
							isSecondaryBtn={true}
						>
							Cancel
						</GCButton>
						<GCButton
							id={'editCloneSubmit'}
							onClick={()=>sendAPIKeyRequest()}
							style={{margin:'10px'}}
							disabled={apiRequestLimit===0}
						>
							Submit
						</GCButton>
					</div>
                </DialogActions>
            </Dialog>
		</FooterContainer>
	)
};

DecoupledFooter.propTypes = {
	setUserMatomo: PropTypes.bool.isRequired
}

export default DecoupledFooter;